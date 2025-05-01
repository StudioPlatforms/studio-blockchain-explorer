import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ActivityFeed = ({ aiData }) => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState(null);
  const prevActivitiesRef = useRef([]);
  
  // Update timestamps every minute
  useEffect(() => {
    const updateTimestamps = () => {
      setActivities(currentActivities => 
        currentActivities.map(activity => ({
          ...activity,
          timestamp: getRelativeTime(activity.originalTime)
        }))
      );
    };
    
    const intervalId = setInterval(updateTimestamps, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Process activities when aiData changes
  useEffect(() => {
    if (!aiData || !aiData.activityFeed) return;
    
    // Add originalTime to activities if not already present
    const processedActivities = aiData.activityFeed.map(activity => {
      if (!activity.originalTime) {
        // Convert timestamp like "2 minutes ago" to a Date object
        const now = new Date();
        const timeMatch = activity.timestamp.match(/(\d+)\s+(\w+)/);
        let timeOffset = 0;
        
        if (timeMatch) {
          const [_, amount, unit] = timeMatch;
          if (unit.includes('minute')) {
            timeOffset = parseInt(amount) * 60 * 1000;
          } else if (unit.includes('hour')) {
            timeOffset = parseInt(amount) * 60 * 60 * 1000;
          }
        }
        
        return {
          ...activity,
          originalTime: new Date(now.getTime() - timeOffset)
        };
      }
      return activity;
    });
    
    // Check if there are new activities
    if (prevActivitiesRef.current.length > 0 && processedActivities.length > 0) {
      const prevTopId = prevActivitiesRef.current[0]?.id;
      const newTopId = processedActivities[0]?.id;
      
      if (prevTopId !== newTopId) {
        // Found a new activity
        setNewActivity(processedActivities[0]);
        
        // Clear the new activity flag after animation
        setTimeout(() => {
          setNewActivity(null);
        }, 3000);
      }
    }
    
    setActivities(processedActivities);
    prevActivitiesRef.current = processedActivities;
  }, [aiData]);
  
  // Helper function to format relative time
  const getRelativeTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffMin < 1) {
      return 'just now';
    } else if (diffMin === 1) {
      return '1 minute ago';
    } else if (diffMin < 60) {
      return `${diffMin} minutes ago`;
    } else if (diffHour === 1) {
      return '1 hour ago';
    } else {
      return `${diffHour} hours ago`;
    }
  };
  // If no activities are available, return a placeholder
  if (activities.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Real-time AI Activity</h3>
        <div className="text-center py-8 text-gray-400">
          No activity data available
        </div>
      </div>
    );
  }

  // Activity type icons
  const getActivityIcon = (type) => {
    switch (type) {
      case 'block_optimization':
        return (
          <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        );
      case 'transaction_processing':
        return (
          <div className="w-10 h-10 rounded-full bg-accent-teal bg-opacity-20 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      case 'learning_cycle':
        return (
          <div className="w-10 h-10 rounded-full bg-accent-purple bg-opacity-20 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        );
      case 'gas_optimization':
        return (
          <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'network_adjustment':
        return (
          <div className="w-10 h-10 rounded-full bg-accent-teal bg-opacity-20 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Real-time AI Activity</h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: newActivity && activity.id === newActivity.id ? [1, 1.05, 1] : 1,
              backgroundColor: newActivity && activity.id === newActivity.id ? 
                ['rgba(30, 30, 40, 0.5)', 'rgba(75, 85, 99, 0.3)', 'rgba(30, 30, 40, 0.5)'] : 'rgba(30, 30, 40, 0.5)'
            }}
            transition={{ 
              duration: newActivity && activity.id === newActivity.id ? 1 : 0.3, 
              delay: index * 0.05,
              backgroundColor: { duration: 2 }
            }}
            className={`flex items-start p-3 bg-dark-200 rounded-lg ${
              newActivity && activity.id === newActivity.id ? 'border border-primary' : ''
            }`}
          >
            {getActivityIcon(activity.type)}
            <div className="ml-4 flex-1">
              <p className="text-white">{activity.message}</p>
              <p className="text-sm text-gray-400 mt-1">{activity.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
      

    </div>
  );
};

export default ActivityFeed;
