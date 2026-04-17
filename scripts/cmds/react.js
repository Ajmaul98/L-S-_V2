module.exports = {
  name: "react",
  async execute(message) {

    // শুধু command চালাবে, bot ignore
    if (message.author.bot) return;

    // Command check
    if (message.content !== "!react") return;

    try {
      const emojis = [
        "🥀",
        "👅",
        "💕",
        "🫦",
        "🐥",
        "🤭",
        "❤️‍🩹",
        "🩸",
        "🐤",
        "🐣",
        "🕊️"
      ];

      for (const emoji of emojis) {
        await message.react(emoji);
      }

    } catch (err) {
      console.log(err);
    }
  }
};
