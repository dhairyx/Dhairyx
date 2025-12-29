export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    alert("This browser does not support desktop notifications");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const scheduleReminder = () => {
  if (Notification.permission === 'granted') {
    // In a real PWA/Mobile app, this would use the Push API or local notifications.
    // For this web demo, we simulate a reminder setting.
    setTimeout(() => {
        new Notification("LinguaFranca Reminder", {
            body: "C'est l'heure! Time to practice your French vocabulary.",
            icon: "/favicon.ico" // Assuming favicon exists or browser default
        });
    }, 5000); // Demo: triggers in 5 seconds to prove it works
    
    return true;
  }
  return false;
};