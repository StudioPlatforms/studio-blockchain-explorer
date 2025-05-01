// Chart configurations for AI Dashboard
const createChartConfigs = (aiData) => {
  // Block Prediction Chart
  const blockPredictionChartConfig = {
    data: aiData ? {
      labels: aiData.blockPredictionData.labels,
      datasets: [
        {
          label: 'Predicted',
          data: aiData.blockPredictionData.predicted,
          borderColor: '#FF4C29',
          backgroundColor: 'rgba(255, 76, 41, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Actual',
          data: aiData.blockPredictionData.actual,
          borderColor: '#00BCD4',
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    } : null,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#FFFFFF'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#AAAAAA'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#AAAAAA'
          }
        }
      }
    }
  };
  
  // Transaction Priority Chart
  const transactionPriorityChartConfig = {
    data: aiData ? {
      labels: aiData.transactionPriorityData.labels,
      datasets: [
        {
          data: aiData.transactionPriorityData.values,
          backgroundColor: [
            '#FF4C29',
            '#FF6B45',
            '#FF8A61',
            '#FFA97D',
            '#FFC899',
            '#FFE7B5'
          ],
          borderWidth: 0
        }
      ]
    } : null,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#FFFFFF'
          }
        }
      }
    }
  };
  
  // Gas Optimization Chart
  const gasOptimizationChartConfig = {
    data: aiData ? {
      labels: aiData.gasOptimizationData.labels,
      datasets: [
        {
          label: 'Traditional Gas Usage',
          data: aiData.gasOptimizationData.traditional,
          backgroundColor: 'rgba(255, 76, 41, 0.7)',
          borderColor: '#FF4C29',
          borderWidth: 1
        },
        {
          label: 'AI Optimized Gas Usage',
          data: aiData.gasOptimizationData.optimized,
          backgroundColor: 'rgba(0, 188, 212, 0.7)',
          borderColor: '#00BCD4',
          borderWidth: 1
        }
      ]
    } : null,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#FFFFFF'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#AAAAAA'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#AAAAAA'
          }
        }
      }
    }
  };
  
  // Learning Progress Chart
  const learningProgressChartConfig = {
    data: aiData ? {
      labels: aiData.learningProgressData.labels,
      datasets: [
        {
          label: 'Accuracy',
          data: aiData.learningProgressData.accuracy,
          borderColor: '#7B1FA2',
          backgroundColor: 'rgba(123, 31, 162, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    } : null,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#FFFFFF'
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#AAAAAA'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#AAAAAA',
            callback: function(value) {
              return value + '%';
            }
          },
          min: 40,
          max: 100
        }
      }
    }
  };

  return {
    blockPredictionChartConfig,
    transactionPriorityChartConfig,
    gasOptimizationChartConfig,
    learningProgressChartConfig
  };
};

export default createChartConfigs;
