/**
 * Common animation variants for Framer Motion
 * This file contains reusable animation configurations for consistent animations throughout the app
 */

// Page transition animations
export const pageVariants = {
    initial: {
      opacity: 0,
      y: 10
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };
  
  // Container with staggered children animations
  export const containerVariants = {
    hidden: { 
      opacity: 0 
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };
  
  // Item animations for lists
  export const itemVariants = {
    hidden: { 
      y: 20, 
      opacity: 0 
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };
  
  // Fade in animation
  export const fadeIn = {
    hidden: { 
      opacity: 0 
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };
  
  // Slide in from right
  export const slideInRight = {
    hidden: { 
      x: 100, 
      opacity: 0 
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  // Slide in from left
  export const slideInLeft = {
    hidden: { 
      x: -100, 
      opacity: 0 
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  // Scale up animation
  export const scaleUp = {
    hidden: { 
      scale: 0.8, 
      opacity: 0 
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };
  
  // Modal animation
  export const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.1
      }
    }
  };
  
  // Tooltip animation
  export const tooltipVariants = {
    hidden: {
      opacity: 0,
      y: 5,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2
      }
    }
  };
  
  // Notification animation
  export const notificationVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };
  
  // Button hover animation
  export const buttonHoverAnimation = {
    scale: 1.03,
    transition: {
      duration: 0.1
    }
  };
  
  // Button tap animation
  export const buttonTapAnimation = {
    scale: 0.98
  };
  
  // Card hover animation
  export const cardHoverAnimation = {
    y: -5,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2
    }
  };
  
  // Skeleton loading animation
  export const skeletonVariants = {
    initial: {
      opacity: 0.5
    },
    animate: {
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };