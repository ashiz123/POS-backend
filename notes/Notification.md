Notification with queueing system flow

# setup
1. Create the queue
export const NotificationToAdminQueue = new Queue('notificationToAdmin', {
    connection: redisConnect,
})

2. Create the worker
export const NotificationAdminWorker = new Worker('notificationToAdmin', async(job) => {
  if(job.name === "Create-terminl'){
  const { businessId, terminalId, ownerId } = job.data
.....
   calling the notificationService ....
}
})



1. At first, when task is done
    this.notificationAdminQueue.add(
                'Create-terminal',
                {
                    terminalId: newTerminal.id, //job to activate terminal
                    ownerId: newTerminal.ownerId, //who requested
                    businessId: newTerminal.businessId, //what business
                },
                {
                    delay: 1 * 60 * 1000,
                    attempts: 3,
                    removeOnComplete: true,
                }
            )
2. notificationService 
   async notifyTerminalCreate(){
  //Notify user to create the terminal either email ,db , message
}
