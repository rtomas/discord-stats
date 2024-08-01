const { Client, GatewayIntentBits } = require('discord.js');
const { DateTime } = require('luxon');
require('dotenv').config()

const token =  process.env.DISCORD_BOT_TOKEN || "";
const channelId =  process.env.CHANNEL_ID || "";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Fetch the channel by ID
    const channel = await client.channels.fetch(channelId);
    console.log(`Channel name: ${channel.name}`);
    console.log("");

    // Fetch active threads in the channel
    const activeThreads = await channel.threads.fetchActive();
    
    // Fetch archived threads in the channel
    const archivedThreads = await channel.threads.fetchArchived();
    
    // Combine active and archived threads
    const allThreads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];
    
    // Get the date two weeks ago from today
    const twoWeeksAgo = DateTime.now().minus({ weeks: 2 });

    // Filter threads created within the last two weeks
    const recentThreads = allThreads.filter(thread => {
        return DateTime.fromJSDate(thread.createdAt) > twoWeeksAgo;
    });

    let amountNotAnswered = 0;
    let totalMinutes = 0;
    let totalAnswered = 0;

    for (const thread of recentThreads) {
        const messages = await thread.messages.fetch({ limit: 100 });
        if (messages.size > 1) {
                // Calculate the time it took to answer the thread
                const timeToAnswer = DateTime.fromJSDate(messages.first().createdAt).diff(DateTime.fromMillis(thread.createdTimestamp), 'hours').hours.toFixed(2) ;
                totalAnswered++;
                totalMinutes += parseFloat(timeToAnswer);
        } else {
            amountNotAnswered++;
        }
    }
    
    const averageTimeToAnswer = totalMinutes / totalAnswered;
    console.log(`Number of threads from the last two weeks: ${recentThreads.length}`);
    console.log(`Amount not answered: ${amountNotAnswered}`);
    console.log(`Average time to answer: ${averageTimeToAnswer.toFixed(3)} hours`);


    client.destroy(); // Terminate the bot after counting threads
});

client.login(token);
