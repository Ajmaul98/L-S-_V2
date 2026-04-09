const { evaluate } = require("mathjs");

function parseAmount(input) {
  const suffixes = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, q: 1e15 };

  input = input.toLowerCase().replace(/,/g, "").trim();

  const match = input.match(/^([\d.+\-*/^() ]+)([kmbtq]?)$/);
  if (!match) throw new Error("Invalid input");

  const base = evaluate(match[1]);
  const suffix = match[2];

  return base * (suffixes[suffix] || 1);
}

module.exports = {
  config: {
    name: "setbal",
    aliases: ["setmoney", "setbalance"],
    version: "1.4",
    author: "Ajmaul FIXED",
    countDown: 3,
    role: 2,
    shortDescription: {
      en: "💰 Set or add balance"
    },
    longDescription: {
      en: "Set or add balance to user (supports math & short forms)"
    },
    category: "💼 Economy",
    guide: {
      en:
        "➤ +setbal <uid/@mention> <amount>\n" +
        "➤ +setbal <amount>\n\n" +
        "Examples:\n" +
        "+setbal @user 100k\n" +
        "+setbal 100000\n" +
        "+setbal @user 5m\n" +
        "+setbal @user 10^5"
    },
    usePrefix: true,
    useChat: true
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    if (args.length < 1) {
      return message.reply(
        "❌ Usage:\n+setbal <uid/@mention> <amount>\nOR\n+setbal <amount>"
      );
    }

    let targetID;
    let amountInput;

    // mention
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      amountInput = args.slice(1).join(" "); // FIX এখানে
    }

    // UID
    else if (/^\d{5,20}$/.test(args[0]) && args.length >= 2) {
      targetID = args[0];
      amountInput = args.slice(1).join(" "); // FIX এখানে
    }

    // self
    else {
      targetID = event.senderID;
      amountInput = args.join(" "); // FIX এখানে
    }

    let amount;
    try {
      amount = parseAmount(amountInput);
      if (isNaN(amount) || !isFinite(amount)) throw new Error();
    } catch {
      return message.reply(
        "❌ Invalid amount.\nExamples: 100000, 5m, 2.5t, 10^5"
      );
    }

    if (amount < 0)
      return message.reply("🚫 Balance cannot be negative!");

    const oldBalance = (await usersData.get(targetID, "money")) || 0;

    const newBalance =
      targetID === event.senderID && args.length === 1
        ? oldBalance + amount
        : amount;

    await usersData.set(targetID, newBalance, "money");

    const name = await usersData.getName(targetID);
    const displayAmount = Number(newBalance).toLocaleString();

    const msg =
      targetID === event.senderID && args.length === 1
        ? `💸 Balance Added!\n👤 You (${name})\n➕ Added: ${amount.toLocaleString()}\n💰 Total: $${displayAmount}`
        : `💗 Balance Set!\n👤 ${name}\n💰 New Balance: $${displayAmount}`;

    return message.reply(msg);
  },

  onChat: async function ({ event, message }) {
    const body = event.body?.toLowerCase();
    if (!body.startsWith("setbal")) return;

    const args = body.split(" ").slice(1);
    message.body = "+setbal " + args.join(" ");
    return this.onStart(...arguments);
  }
};
