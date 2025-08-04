import crypto, { randomBytes } from "crypto";



const VISA_PAN = ["401", "432", "455", "467", "421", "410"];
const MASTERCARD_PAN = ["501", "521", "552", "547", "589", "544"];
const ALL_PANS = [{ VISA_PAN: VISA_PAN }, { MASTERCARD_PAN: MASTERCARD_PAN }];
const CARD_TYPES = ["visa", "mastercard"];


export const pinGenerator = () => {
  let pin = Math.floor(1000 + Math.random() * 9000); // Ensures a 4-digit PIN
  return pin.toString(); // Convert to string if needed
};

export const generateDefaultPassword = () => {
  return randomBytes(4).toString("hex");
}




export const accountNumberGenerator = (accountType) => {
  let randomDigits = Math.floor(1000000 + Math.random() * 9000000); // Generates a 7-digit number
  if (accountType === "savings") {
    return `301${randomDigits}`; // Concatenates '301' at the beginning
  } else if (accountType === "current") {
    return `501${randomDigits}`; // Concatenates '301' at the beginning
  } else {
    return `010${randomDigits}`; // Concatenates '301' at the beginning
  }
};

const panWithRandomNumbers = (pan) => {
  for (let i = 0; i < 13; i++) {
    pan += Math.floor(Math.random() * 10); // Generate random digits
  }
  return pan;
};

export const generatePanNumber = (cardType) => {
  cardType = cardType.trim();
  if (CARD_TYPES.includes(cardType.toLowerCase())) {
    let generatedPan;
    let selectCardPan = `${cardType.toUpperCase()}_PAN`;
    ALL_PANS.map((pan) => {
      if (Object.keys(pan).toString() === selectCardPan) {
        let cardPans = Object.values(pan).toString().split(",");
        let idx = Math.floor(Math.random() * cardPans.length);
        generatedPan = panWithRandomNumbers(cardPans[idx]);
      }
    });
    return generatedPan;
  } else {
    return null;
  }
};

export const generateExpiryDate = () => {
  const today = new Date();
  today.setMonth(today.getMonth() + 3); // Add 3 months

  const month = String(today.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month
  let year = today.getFullYear(); // Get full year
  year = year.toString().slice(2);

  return `${month}/${year}`; // Format as MM/YY
};

export const cvvGenerator = () => {
  let cvv = Math.floor(100 + Math.random() * 900);
  return cvv;
};

function removeExtraSpaces(str) {
  return str.replace(/\s+/g, " ");
}

export function generateAvatar(name) {
  name = removeExtraSpaces(name).toLowerCase().trim().replace(" ", "+");
  return (
    name.length !== 0 &&
    `https://avatar.iran.liara.run/username?username=${name}`
  );
}

export function generateDeveloperId(id) {
  id = id.slice(4);
  return `dev-${id}`;
}

export function generateSecretKeyForDev() {
  return crypto.randomUUID();
}

export function generateApiKey() {
  return crypto.randomBytes(16).toString("hex");
}

export function getThreeMonthsFromNow() {
  const now = new Date();
  now.setMonth(now.getMonth() + 3);

  return now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}




export async function fetchResponses(res, amount, acc1, acc2, ref){
  const status = [200, 400] ;
  const time = Date.now();
  const upTime = (Math.floor(Math.random() * 59) + 1) * Math.floor(Math.random() * 60 * 1000) + 1
  const responses = [
    {
      reference_code: "#" + ref,
      amount_debited_from_sender: amount,
      message: [
        { sender_balance: acc1.balance },
        { reciever_balance: acc2.balance },
      ],
      transaction_time: time,
      session_upTime: upTime,
    },
    {
      reference_code: "#" + ref,
      code: 400,
      message: "Transaction failed!",
      failure_time: time,
      session_upTime: upTime,
    },
  ];
  let idx = Math.floor(Math.random() * responses.length);

  setTimeout(() => {
    return res.status(status[idx]).json(responses[idx]);
  }, 3000)
} 





