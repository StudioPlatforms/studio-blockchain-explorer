import { useEffect, useRef, useState } from 'react';
import apiService from '../../services/api';

// Transaction type colors
const TX_COLORS = {
  DEFAULT: { primary: '#FF0000', secondary: '#FF6666' },
  NATIVE_STO: { primary: '#FF4C29', secondary: '#FF8066' },
  ERC20_TOKEN: { primary: '#00BCD4', secondary: '#66D9E8' },
  CONTRACT_CALL: { primary: '#7B1FA2', secondary: '#9C4DB5' },
  CONTRACT_DEPLOY: { primary: '#FFC107', secondary: '#FFD54F' },
  NFT_TRANSFER: { primary: '#4CAF50', secondary: '#81C784' }
};

// Helper function to get alert color class based on transaction type
const getAlertColorClass = (txType) => {
  switch (txType) {
    case 'NATIVE_STO':
      return 'bg-orange-900 bg-opacity-20';
    case 'ERC20_TOKEN':
      return 'bg-cyan-900 bg-opacity-20';
    case 'CONTRACT_CALL':
      return 'bg-purple-900 bg-opacity-20';
    case 'CONTRACT_DEPLOY':
      return 'bg-yellow-900 bg-opacity-20';
    case 'NFT_TRANSFER':
      return 'bg-green-900 bg-opacity-20';
    default:
      return 'bg-red-900 bg-opacity-20';
  }
};

// Helper function to get transaction type label
const getTransactionTypeLabel = (txType) => {
  switch (txType) {
    case 'NATIVE_STO':
      return 'STO Transfer Detected';
    case 'ERC20_TOKEN':
      return 'Token Transfer Detected';
    case 'CONTRACT_CALL':
      return 'Contract Call Detected';
    case 'CONTRACT_DEPLOY':
      return 'Contract Deployment';
    case 'NFT_TRANSFER':
      return 'NFT Transfer Detected';
    default:
      return 'Transaction Detected';
  }
};

const NeuralNetworkVisualizer = ({ isLoading, neuralNetwork }) => {
  // Ensure neuralNetwork has default values if it's null or undefined
  const networkData = neuralNetwork || { nodes: 42, connections: 156, layers: 4 };
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [networkActivity, setNetworkActivity] = useState(0);
  const [targetNetworkActivity, setTargetNetworkActivity] = useState(0);
  const lastNetworkActivityUpdateTime = useRef(Date.now());
  const [newTransactionDetected, setNewTransactionDetected] = useState(false);
  const [transactionType, setTransactionType] = useState('DEFAULT');
  const lastTransactionCount = useRef(0);
  const lastTransactionHash = useRef('');
  const idleCounter = useRef(0);
  const scanningMode = useRef(false);
  const lastKnownBlockNumber = useRef(0);
  const newBlockDetected = useRef(false);
  
  // Fetch transaction data
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        // Get latest blocks
        const blocks = await apiService.getBlocks(3, 0);
        
        if (blocks && blocks.length > 0) {
          // Calculate total transactions in the latest blocks
          const totalTx = blocks.reduce((sum, block) => {
            return sum + (block.transactions_count || 0);
          }, 0);
          
          // Check if new transactions were detected
          if (totalTx > lastTransactionCount.current) {
            // Get the latest transactions to determine the type
            const transactions = await apiService.getTransactions(3, 0);
            
            if (transactions && transactions.length > 0) {
              const latestTx = transactions[0];
              
              // Only process if this is a new transaction
              if (latestTx.hash !== lastTransactionHash.current) {
                lastTransactionHash.current = latestTx.hash;
                
                // Determine transaction type
                let txType = 'DEFAULT';
                
                if (latestTx.tokenTransfers && latestTx.tokenTransfers.length > 0) {
                  // Check if any of the token transfers are NFTs
                  const hasNftTransfer = latestTx.tokenTransfers.some(transfer => 
                    transfer.tokenAddress && 
                    (transfer.symbol?.includes('NFT') || transfer.name?.includes('NFT'))
                  );
                  
                  txType = hasNftTransfer ? 'NFT_TRANSFER' : 'ERC20_TOKEN';
                } else if (!latestTx.to) {
                  // Contract deployment (no 'to' address)
                  txType = 'CONTRACT_DEPLOY';
                } else if (latestTx.input && latestTx.input !== '0x' && latestTx.input.length > 10) {
                  // Contract interaction (has input data)
                  txType = 'CONTRACT_CALL';
                } else if (latestTx.value && latestTx.value !== '0' && latestTx.value !== '0x0') {
                  // Native STO transfer
                  txType = 'NATIVE_STO';
                }
                
                setTransactionType(txType);
                setNewTransactionDetected(true);
                
                // Reset scanning mode when a transaction is detected
                scanningMode.current = false;
                idleCounter.current = 0;
                
                // Reset after 3 seconds
                setTimeout(() => {
                  setNewTransactionDetected(false);
                }, 3000);
              }
            }
          } else {
            // Increment idle counter when no new transactions
            idleCounter.current += 1;
            
            // Enter scanning mode after 10 seconds of inactivity
            if (idleCounter.current > 2 && !scanningMode.current) {
              scanningMode.current = true;
              console.log("Entering scanning mode");
            }
          }
          
          lastTransactionCount.current = totalTx;
          setTransactionCount(totalTx);
          
          // Calculate network activity based on user requirements:
          // 1. When there's no activity, it should stay at 0.00%
          // 2. When a new block is produced, it should change to 0.01-0.03%
          // 3. Each transaction should increase the network activity by 0.01%
          
          // Check if a new block has been produced
          const currentBlockNumber = blocks.length > 0 ? blocks[0].number : 0;
          
          // Detect new block
          if (currentBlockNumber > lastKnownBlockNumber.current) {
            console.log(`New block detected: ${currentBlockNumber} (previous: ${lastKnownBlockNumber.current})`);
            lastKnownBlockNumber.current = currentBlockNumber;
            newBlockDetected.current = true;
            
            // Reset scanning mode when a new block is detected
            scanningMode.current = false;
            idleCounter.current = 0;
          } else {
            newBlockDetected.current = false;
          }
          
          // Get the most recent block's transaction count
          const latestBlockTx = blocks.length > 0 ? (blocks[0].transactions_count || 0) : 0;
          console.log(`Latest block #${currentBlockNumber} has ${latestBlockTx} transactions`);
          
          // Calculate activity level based on:
          // - New block production: 0.01-0.03%
          // - Transaction count: 0.01% per transaction
          
          // Start with 0
          let activityLevel = 0;
          
          // Add activity for new block production (0.01-0.03%)
          if (newBlockDetected.current) {
            const blockProductionActivity = 0.01 + (Math.random() * 0.02);
            activityLevel += blockProductionActivity;
            console.log(`Adding ${blockProductionActivity.toFixed(4)}% for new block production`);
          }
          
          // Add activity for transactions (0.01% per transaction)
          if (latestBlockTx > 0) {
            const transactionActivity = latestBlockTx * 0.01;
            activityLevel += transactionActivity;
            console.log(`Adding ${transactionActivity.toFixed(4)}% for ${latestBlockTx} transactions`);
          }
          
          // Cap at 100%
          activityLevel = Math.min(activityLevel, 100);
          
          console.log(`Final network activity calculation: ${activityLevel.toFixed(4)}%`);
          
          // In scanning mode with no activity, add some visual interest
          if (scanningMode.current && activityLevel === 0) {
            // Keep it at 0 as requested by the user
            console.log(`In scanning mode with no activity, keeping at 0.00%`);
          }
          
          // Update the target network activity - actual value will smoothly transition
          console.log(`Setting target network activity: ${activityLevel.toFixed(2)}% (based on ${totalTx} transactions)`);
          setTargetNetworkActivity(activityLevel);
          
          // Also update the animation state directly to ensure it gets the new target
          animState.current.targetNetworkActivity = activityLevel;
          
          lastNetworkActivityUpdateTime.current = Date.now();
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      }
    };
    
    // Initial fetch
    fetchTransactionData();
    
    // Set up polling to refresh data every 5 seconds
    const dataInterval = setInterval(fetchTransactionData, 5000);
    
    return () => {
      clearInterval(dataInterval);
    };
  }, []);
  
  // Animation state ref to completely decouple from React state
  const animState = useRef({
    initialized: false,
    currentNetworkActivity: 0,
    targetNetworkActivity: 0,
    networkActivityUpdateId: null
  });
  
  // Update animation state when target changes
  useEffect(() => {
    console.log(`Target network activity updated: ${targetNetworkActivity.toFixed(2)}%`);
    animState.current.targetNetworkActivity = targetNetworkActivity;
    
    // If this is the first update, also set the current value to avoid starting from 0
    if (animState.current.currentNetworkActivity === 0 && targetNetworkActivity > 0) {
      console.log(`Initializing current network activity to ${targetNetworkActivity.toFixed(2)}%`);
      animState.current.currentNetworkActivity = targetNetworkActivity;
      setNetworkActivity(targetNetworkActivity);
    }
  }, [targetNetworkActivity]);
  
  // Effect to smoothly transition network activity value
  // This runs completely independently of React's render cycle
  useEffect(() => {
    // Function to update network activity value
    const updateNetworkActivity = () => {
      // Calculate the difference between current and target values
      const diff = animState.current.targetNetworkActivity - animState.current.currentNetworkActivity;
      
      // If the difference is significant, smoothly transition
      if (Math.abs(diff) > 0.01) {
        // Calculate transition speed based on difference magnitude
        // Even more reduced speed for ultra-smooth transitions
        const transitionSpeed = Math.max(0.005, Math.min(0.5, Math.abs(diff) * 0.01));
        
        // Move towards target value with easing
        animState.current.currentNetworkActivity += Math.sign(diff) * transitionSpeed;
        
        // Update the React state less frequently to avoid re-renders
        // This prevents the white line from stopping during value changes
        const newValue = parseFloat(animState.current.currentNetworkActivity.toFixed(4));
        setNetworkActivity(newValue);
      } else if (Math.abs(diff) > 0) {
        // If we're very close, just set to target value
        animState.current.currentNetworkActivity = animState.current.targetNetworkActivity;
        setNetworkActivity(parseFloat(animState.current.targetNetworkActivity.toFixed(4)));
      }
      
      // Always continue the animation loop to keep checking for changes
      animState.current.networkActivityUpdateId = requestAnimationFrame(updateNetworkActivity);
    };
    
    // Start animation
    animState.current.networkActivityUpdateId = requestAnimationFrame(updateNetworkActivity);
    
    // Cleanup
    return () => {
      if (animState.current.networkActivityUpdateId) {
        cancelAnimationFrame(animState.current.networkActivityUpdateId);
      }
    };
  }, []); // No dependencies - this runs once and continues independently
  
  // Separate ref for animation values to decouple from React state
  const animationValues = useRef({
    networkActivity: 0,
    lastUpdate: Date.now()
  });
  
  // Update animation values in a separate effect to avoid re-renders
  useEffect(() => {
    animationValues.current.networkActivity = networkActivity;
  }, [networkActivity]);
  
  // Initialize canvas and visualization when component mounts or isLoading changes
  useEffect(() => {
    // Skip if canvas is not available or loading
    if (!canvasRef.current || isLoading) return;
    
    console.log("Initializing neural network visualization", { isLoading });
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to fill container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    // Animation state
    const state = {
      time: 0,
      pulsePhase: 0,
      dataPoints: [],
      transactionPulses: [],
      lastUpdate: Date.now(),
      ekgPhase: 0,
      ekgSpeed: 1.0,
      spikeTime: 0,
      spikeIntensity: 0
    };
    
    // Initialize data points based on neural network structure
    const initializeDataPoints = () => {
      state.dataPoints = [];
      
      // Use neural network nodes to determine point count
      // More nodes = more detailed visualization
      const basePointCount = Math.floor(canvas.width / 20);
      const nodeScale = networkData.nodes / 42; // Scale based on default 42 nodes
      const pointCount = Math.max(basePointCount, Math.floor(basePointCount * Math.sqrt(nodeScale)));
      
      console.log(`Initializing neural network visualization with ${pointCount} points (based on ${networkData.nodes} nodes)`);
      
      for (let i = 0; i < pointCount; i++) {
        state.dataPoints.push({
          x: (i / (pointCount - 1)) * canvas.width,
          y: canvas.height / 2,
          targetY: canvas.height / 2,
          velocity: 0,
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
    };
    
    // Add transaction pulse
    const addTransactionPulse = () => {
      // Create a pulse that travels across the line
      const startPoint = state.dataPoints[0];
      
      // Adjust pulse properties based on transaction type
      let pulseSize = 8;
      let pulseSpeed = 0.5 + Math.random() * 0.5;
      let spikeIntensity = 1.0;
      
      // Customize pulse based on transaction type
      switch (transactionType) {
        case 'NATIVE_STO':
          // Standard STO transfer - normal pulse
          pulseSize = 8;
          pulseSpeed = 0.6 + Math.random() * 0.4;
          spikeIntensity = 1.0;
          break;
        case 'ERC20_TOKEN':
          // Token transfer - faster, smaller pulse
          pulseSize = 7;
          pulseSpeed = 0.8 + Math.random() * 0.4;
          spikeIntensity = 0.9;
          break;
        case 'CONTRACT_CALL':
          // Contract call - slower, larger pulse
          pulseSize = 10;
          pulseSpeed = 0.4 + Math.random() * 0.3;
          spikeIntensity = 1.2;
          break;
        case 'CONTRACT_DEPLOY':
          // Contract deployment - very slow, very large pulse
          pulseSize = 12;
          pulseSpeed = 0.3 + Math.random() * 0.2;
          spikeIntensity = 1.5;
          break;
        case 'NFT_TRANSFER':
          // NFT transfer - medium speed, medium size
          pulseSize = 9;
          pulseSpeed = 0.6 + Math.random() * 0.3;
          spikeIntensity = 1.1;
          break;
        default:
          // Default pulse
          pulseSize = 8;
          pulseSpeed = 0.5 + Math.random() * 0.5;
          spikeIntensity = 1.0;
      }
      
      // Add multiple pulses for complex transactions
      const pulseCount = (transactionType === 'CONTRACT_CALL' || transactionType === 'CONTRACT_DEPLOY') ? 3 : 1;
      
      for (let i = 0; i < pulseCount; i++) {
        // Stagger multiple pulses
        const delay = i * 0.15;
        
        setTimeout(() => {
          if (!canvasRef.current) return; // Safety check
          
          state.transactionPulses.push({
            x: startPoint.x,
            y: startPoint.y,
            progress: 0,
            size: pulseSize - (i * 0.5), // Slightly smaller for subsequent pulses
            opacity: 1,
            speed: pulseSpeed * (1 - i * 0.1) // Slightly slower for subsequent pulses
          });
        }, delay * 1000);
      }
      
      // Add a spike to the EKG
      state.spikeTime = state.time;
      state.spikeIntensity = spikeIntensity;
    };
    
    // Calculate EKG value at a specific position - adjusted based on neural network properties
    const calculateEkgValue = (x, width, time, phase, activity) => {
      // Use neural network properties to adjust the EKG pattern
      const layerFactor = networkData.layers / 4; // Scale based on default 4 layers
      const connectionFactor = networkData.connections / 156; // Scale based on default 156 connections
      
      // Base EKG pattern - adjusted by neural network structure
      const normalizedX = (x / width) * (20 * Math.sqrt(layerFactor)); // Scale waves based on layers
      const baseFreq = (0.5 + activity * 0.5) * Math.sqrt(layerFactor); // Frequency increases with layers
      
      // Basic sine wave - amplitude adjusted by connection count
      const baseAmplitude = 0.2 * Math.sqrt(connectionFactor);
      let value = Math.sin(normalizedX * baseFreq + phase) * baseAmplitude;
      
      // Add complexity based on neural network size
      const complexityFactor = Math.min(1.5, Math.sqrt(networkData.nodes / 42));
      value += Math.sin(normalizedX * (3.7 * complexityFactor) + phase * 1.3) * (0.05 * complexityFactor);
      value += Math.sin(normalizedX * (7.5 * complexityFactor) + phase * 0.7) * (0.02 * complexityFactor);
      
      // Add occasional small spikes for "heartbeat" effect - frequency based on network activity
      const heartbeatFreq = 0.05 * (1 + activity * 0.5);
      const heartbeatPhase = ((normalizedX * 0.5 + phase) % (Math.PI * 2)) / (Math.PI * 2);
      if (heartbeatPhase < heartbeatFreq) {
        value += (heartbeatFreq - heartbeatPhase) * 0.8;
      }
      
      // Add transaction spike if needed
      if (state.spikeIntensity > 0) {
        // Calculate distance from spike center (in time)
        const spikePhase = ((normalizedX * 0.5 + phase) % (Math.PI * 2)) / (Math.PI * 2);
        const timeSinceSpike = time - state.spikeTime;
        
        if (timeSinceSpike < 0.5) {
          // Spike travels from left to right
          const spikePosition = timeSinceSpike * 2; // 0 to 1 over 0.5 seconds
          const distanceFromSpike = Math.abs(spikePosition - (x / width));
          
          if (distanceFromSpike < 0.1) {
            const spikeStrength = (0.1 - distanceFromSpike) * 10 * state.spikeIntensity;
            value += spikeStrength * 1.5;
          }
        }
      }
      
      return value;
    };
    
    // Update visualization
    const updateVisualization = (deltaTime) => {
      state.time += deltaTime;
      state.pulsePhase += deltaTime * 0.5;
      state.ekgPhase += deltaTime * state.ekgSpeed;
      
      // Decay spike intensity
      if (state.spikeIntensity > 0) {
        state.spikeIntensity -= deltaTime * 2.0; // Decay over 0.5 seconds
        if (state.spikeIntensity < 0) state.spikeIntensity = 0;
      }
      
      // Adjust EKG speed based on network activity
      // Use the animation values ref instead of the state directly
      const targetSpeed = 0.5 + (animationValues.current.networkActivity / 100) * 1.5;
      state.ekgSpeed += (targetSpeed - state.ekgSpeed) * deltaTime;
      
      // Update data points
      state.dataPoints.forEach((point, index) => {
        // Calculate new target Y based on EKG pattern and network activity
        const baseY = canvas.height / 2;
        const activityFactor = animationValues.current.networkActivity / 100;
        
        // Calculate EKG value at this point
        const ekgValue = calculateEkgValue(
          point.x, 
          canvas.width, 
          state.time, 
          state.ekgPhase, 
          activityFactor
        );
        
        // Scale the EKG value based on activity
        const amplitude = 30 + 20 * activityFactor;
        
        // Add extra amplitude if new transaction detected
        const transactionBoost = newTransactionDetected ? 20 : 0;
        
        point.targetY = baseY + ekgValue * (amplitude + transactionBoost);
        
        // Apply spring physics for smooth movement
        const spring = 10;
        const damping = 0.7;
        
        const force = (point.targetY - point.y) * spring;
        point.velocity += force * deltaTime;
        point.velocity *= damping;
        
        point.y += point.velocity * deltaTime;
      });
      
      // Update transaction pulses
      for (let i = state.transactionPulses.length - 1; i >= 0; i--) {
        const pulse = state.transactionPulses[i];
        
        // Update progress
        pulse.progress += deltaTime * pulse.speed;
        
        if (pulse.progress >= 1) {
          // Remove completed pulse
          state.transactionPulses.splice(i, 1);
        } else {
          // Update position along the line
          const pointIndex = Math.floor(pulse.progress * (state.dataPoints.length - 1));
          const nextPointIndex = Math.min(pointIndex + 1, state.dataPoints.length - 1);
          
          const point = state.dataPoints[pointIndex];
          const nextPoint = state.dataPoints[nextPointIndex];
          
          const segmentProgress = (pulse.progress * (state.dataPoints.length - 1)) - pointIndex;
          
          pulse.x = point.x + (nextPoint.x - point.x) * segmentProgress;
          pulse.y = point.y + (nextPoint.y - point.y) * segmentProgress;
        }
      }
    };
    
    // Render visualization
    const renderVisualization = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(20, 20, 20, 0)');
      gradient.addColorStop(0.5, 'rgba(20, 20, 20, 0.05)');
      gradient.addColorStop(1, 'rgba(20, 20, 20, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      const gridSpacing = canvas.height / 6;
      for (let y = gridSpacing; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical grid lines
      const verticalSpacing = canvas.width / 12;
      for (let x = verticalSpacing; x < canvas.width; x += verticalSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Get colors based on transaction type
      const colors = TX_COLORS[transactionType] || TX_COLORS.DEFAULT;
      const primaryColor = colors.primary;
      const secondaryColor = colors.secondary;
      
      // Draw scanning effect in idle mode
      if (scanningMode.current) {
        // Calculate scan position - continuous movement from left to right
        // Use modulo to create a continuous loop
        const scanSpeed = 0.2; // Speed of scanning (adjust as needed)
        const scanPosition = (state.time * scanSpeed) % 1.0; // 0 to 1 range that loops
        const scanX = canvas.width * scanPosition;
        
        // Draw vertical scanning line
        const scanGradient = ctx.createLinearGradient(scanX - 50, 0, scanX + 50, 0);
        scanGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        scanGradient.addColorStop(0.5, `rgba(255, 255, 255, 0.1)`);
        scanGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.strokeStyle = scanGradient;
        ctx.lineWidth = canvas.height;
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, canvas.height);
        ctx.stroke();
        
        // Draw scan text - positioned on the left for mobile
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'left';
        
        // Check if we're on a small screen (mobile)
        const isMobile = canvas.width < 500;
        
        // Position text on the left for mobile, center for desktop
        const textX = isMobile ? 20 : canvas.width / 2;
        const textAlign = isMobile ? 'left' : 'center';
        
        ctx.textAlign = textAlign;
        ctx.fillText('Scanning Network', textX, 30);
      }
      
      // Draw data line
      ctx.beginPath();
      ctx.moveTo(state.dataPoints[0].x, state.dataPoints[0].y);
      
      for (let i = 1; i < state.dataPoints.length; i++) {
        const prev = state.dataPoints[i - 1];
        const curr = state.dataPoints[i];
        
        // Use bezier curves for smooth lines
        const cp1x = prev.x + (curr.x - prev.x) / 3;
        const cp1y = prev.y;
        const cp2x = curr.x - (curr.x - prev.x) / 3;
        const cp2y = curr.y;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
      }
      
      // Create gradient for line based on transaction type
      const lineGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      lineGradient.addColorStop(0, `rgba(${hexToRgb(primaryColor)}, 0.7)`);
      lineGradient.addColorStop(0.5, `rgba(${hexToRgb(secondaryColor)}, 0.8)`);
      lineGradient.addColorStop(1, `rgba(${hexToRgb(primaryColor)}, 0.7)`);
      
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw subtle glow
      ctx.shadowColor = `rgba(${hexToRgb(primaryColor)}, 0.5)`;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(${hexToRgb(primaryColor)}, 0.3)`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Draw data points - adjusted based on neural network nodes
      state.dataPoints.forEach((point, index) => {
        // Calculate point density based on neural network nodes
        // More nodes = more points visible
        const nodeScale = networkData.nodes / 42; // Scale based on default 42 nodes
        const pointDensity = Math.max(2, Math.floor(5 / Math.sqrt(nodeScale)));
        
        // Only draw some points for cleaner look
        if (index % pointDensity === 0) {
          // Point size based on neural network connections
          const connectionScale = networkData.connections / 156; // Scale based on default 156 connections
          const pointSize = 2 + Math.sqrt(connectionScale);
          
          const opacity = 0.7 + 0.3 * Math.sin(state.time * 2 + point.pulsePhase);
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(${hexToRgb(primaryColor)}, ${opacity})`;
          ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Add subtle glow - intensity based on neural network layers
          const layerScale = networkData.layers / 4; // Scale based on default 4 layers
          const glowSize = pointSize * (3 + layerScale);
          
          ctx.beginPath();
          const glowGradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, glowSize
          );
          glowGradient.addColorStop(0, `rgba(${hexToRgb(primaryColor)}, ${0.3 * Math.sqrt(layerScale)})`);
          glowGradient.addColorStop(1, `rgba(${hexToRgb(primaryColor)}, 0)`);
          
          ctx.fillStyle = glowGradient;
          ctx.arc(point.x, point.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      // Draw transaction pulses
      state.transactionPulses.forEach(pulse => {
        const pulseSize = pulse.size;
        
        // Draw pulse glow
        const pulseGradient = ctx.createRadialGradient(
          pulse.x, pulse.y, 0,
          pulse.x, pulse.y, pulseSize * 2
        );
        pulseGradient.addColorStop(0, `rgba(${hexToRgb(primaryColor)}, 0.8)`);
        pulseGradient.addColorStop(1, `rgba(${hexToRgb(primaryColor)}, 0)`);
        
        ctx.beginPath();
        ctx.fillStyle = pulseGradient;
        ctx.arc(pulse.x, pulse.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pulse core
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.arc(pulse.x, pulse.y, pulseSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw "AI Listening" indicator
      const listeningIndicatorX = 70;
      const listeningIndicatorY = canvas.height - 20;
      
      // Draw pulsing circle
      const listeningPulse = 0.5 + 0.5 * Math.sin(state.time * 2);
      const listeningSize = 5 * (1 + listeningPulse * 0.3);
      
      ctx.beginPath();
      ctx.fillStyle = `rgba(${hexToRgb(primaryColor)}, ${0.7 + 0.3 * listeningPulse})`;
      ctx.arc(listeningIndicatorX, listeningIndicatorY, listeningSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw "Listening" or "Scanning" text
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'left';
      ctx.fillText(scanningMode.current ? 'AI Scanning' : 'AI Listening', listeningIndicatorX + 10, listeningIndicatorY + 4);
      
      // Draw transaction alert if new transaction detected
      if (newTransactionDetected) {
        const alertX = canvas.width - 70;
        const alertY = 30;
        
        // Draw alert background
        ctx.beginPath();
        ctx.fillStyle = `rgba(${hexToRgb(primaryColor)}, 0.2)`;
        ctx.roundRect(alertX - 80, alertY - 15, 160, 30, 5);
        ctx.fill();
        
        // Draw alert text
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        
        // Show different text based on transaction type
        let alertText = 'Transaction Detected';
        switch (transactionType) {
          case 'NATIVE_STO':
            alertText = 'STO Transfer Detected';
            break;
          case 'ERC20_TOKEN':
            alertText = 'Token Transfer Detected';
            break;
          case 'CONTRACT_CALL':
            alertText = 'Contract Call Detected';
            break;
          case 'CONTRACT_DEPLOY':
            alertText = 'Contract Deployment';
            break;
          case 'NFT_TRANSFER':
            alertText = 'NFT Transfer Detected';
            break;
        }
        
        ctx.fillText(alertText, alertX, alertY);
      }
    };
    
    // Helper function to convert hex color to RGB
    const hexToRgb = (hex) => {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Parse the hex values
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return `${r}, ${g}, ${b}`;
    };
    
    // Animation loop
    const animate = () => {
      const now = Date.now();
      // Cap deltaTime to prevent large jumps when tab becomes active again
      const deltaTime = Math.min(0.1, (now - state.lastUpdate) / 1000); // seconds, max 100ms
      state.lastUpdate = now;
      
      updateVisualization(deltaTime);
      renderVisualization();
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Store the animation state and functions on the canvas element
    // so they can be accessed from outside this effect
    canvas.__animationState = state;
    canvas.__addTransactionPulse = addTransactionPulse;
    
    // Initialize
    resizeCanvas();
    initializeDataPoints();
    
    // Start animation
    animate();
    
    // Handle window resize and visibility changes
    window.addEventListener('resize', () => {
      resizeCanvas();
      initializeDataPoints();
    });
    
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, reinitializing neural network');
        // Reset the last update time to prevent large time jumps
        state.lastUpdate = Date.now();
        // Reinitialize data points to ensure a clean state
        initializeDataPoints();
      }
    });
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', () => {});
      cancelAnimationFrame(animationFrameId.current);
      
      // Clean up references
      delete canvas.__animationState;
      delete canvas.__addTransactionPulse;
    };
  }, [isLoading]); // Re-initialize when isLoading changes
  
  // Effect to add transaction pulse when new transactions are detected
  useEffect(() => {
    if (newTransactionDetected && canvasRef.current) {
      // Get the canvas context to access the state
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Access the animation state from the canvas element
      if (canvas.__animationState) {
        // Call the addTransactionPulse function
        console.log(`Transaction detected (${transactionType}), adding pulse`);
        canvas.__addTransactionPulse();
      }
    }
  }, [newTransactionDetected, transactionType]);

  return (
    <div className="relative w-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-[200px] md:h-[250px] rounded-lg bg-dark-200"
      />
      
      {/* Network activity indicator with neural network stats */}
      <div className="absolute top-4 right-4 bg-dark-100 bg-opacity-80 rounded-lg px-3 py-1 text-xs">
        <div>
          <span className="text-gray-400">Network Activity: </span>
          <span className={`font-mono ${networkActivity > 0 ? 'text-red-500' : 'text-gray-300'}`}>
            {parseFloat(networkActivity).toFixed(2)}%
          </span>
        </div>
        <div className="text-gray-400 mt-1">
          <span>Nodes: </span>
          <span className="font-mono text-gray-300">{networkData.nodes}</span>
          <span> | Layers: </span>
          <span className="font-mono text-gray-300">{networkData.layers}</span>
        </div>
      </div>
      
      {/* Transaction alert */}
      {newTransactionDetected && (
        <div className={`absolute top-4 left-4 ${getAlertColorClass(transactionType)} text-white text-xs px-3 py-1 rounded-lg animate-pulse`}>
          {getTransactionTypeLabel(transactionType)}
        </div>
      )}
      
      {/* Elegant labels */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        AI Optimized
      </div>
    </div>
  );
};

export default NeuralNetworkVisualizer;
