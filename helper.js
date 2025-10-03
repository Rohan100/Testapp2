export function formatSlackTimestamp(ts) {
  const timestamp = parseFloat(ts) * 1000; // Convert to milliseconds
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

export function prettifyConversationHistory(messages) {
  return messages.map(msg => {
    const prettified = {
      timestamp: formatSlackTimestamp(msg.ts),
      text: msg.text,
      type: msg.type
    };

    if (msg.user) {
      prettified.user_id = msg.user;
    }

    // Add subtype if exists (e.g., channel_join, message_changed)
    if (msg.subtype) {
      prettified.subtype = msg.subtype;
    }

    // Add bot information if it's a bot message
    if (msg.bot_id) {
      prettified.bot_id = msg.bot_id;
      if (msg.bot_profile) {
        prettified.bot_name = msg.bot_profile.name;
      }
    }

    // Add edited information if message was edited
    if (msg.edited) {
      prettified.edited_at = formatSlackTimestamp(msg.edited.ts);
      prettified.edited_by = msg.edited.user;
    }

    // Add inviter for channel_join events
    if (msg.inviter) {
      prettified.inviter = msg.inviter;
    }

    return prettified;
  }).reverse(); // Reverse to show oldest first
}