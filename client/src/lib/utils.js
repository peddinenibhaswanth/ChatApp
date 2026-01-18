export function formatMessageTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12:false });
}