const BANK_LOGO = `<img src="https://connect-trans-backend.onrender.com/api/v1/account/bank-logo" alt="Bank logo">`;

export const createDeveloperHTML = (
  username,
  developerId,
  host,
  expiryDate,
  status,
  createdDate,
  apiKey,
  secretKey,
  environment
) => {
  return `
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div style="border-radius: 5px; box-shadow: 2px 4px 5px 3px grey; background: white; padding: 20px; width: max-content;">
  
        <!-- Email Header -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 15px; border-radius: 5px;">
          ${BANK_LOGO}
          <h1 style="margin: 0;">Connect Trans Bank API</h1>
        </div>
  
        <!-- Email Body -->
        <div style="background: rgba(206, 195, 195, 0.886); padding: 20px; border-radius: 5px; margin-top: 1px;">
          <h2 style="margin-top: 0;">Dear Dev ${username},</h2>
          <p>Your Developer account has been created successfully. 
          Keep these details safe.
          Ensure to read the docs to effectively use our api. 
          Here are your details:</p>
          
          <p><b>Developer Id:</b> ${developerId}</p>
          <p><b>Your website host:</b> ${host}</p>
          <p><b>Created Date:</b> ${createdDate}</p>
          <p><b>Status:</b> ${status}</p>
          <p><b>Expiry Date:</b> ${expiryDate}</p>
          <p><b>Platform:</b> ConnectTrans Bank Api</p>
          <p><b>Sanbox Environment:</b> ${environment.toUpperCase()}</p>
  
          <hr style="border: 0.5px solid gray; margin: 15px 0;">
  
          <p><u><b>API KEY Details:</b></u></p>
          <p><b>API KEY:</b> ${apiKey}</p>
          <p><b>SECRET KEY:</b> ${secretKey}</p>
  
          <p style="color: red; font-weight: bold; text-align: center;">⚠️ Do not share your API & Secret Key details.</p>

          <p style="text-align: center;">---------------------</p>
          <h3 style="text-align: center">Happy Coding!👍</h3>
        </div>
  
        <!-- Email Footer -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <p>If you didn’t make this request, contact <b>admin@connecttransbank.com</b> or call: <b>07012345678</b></p>
        </div>
  
      </div>
    </div>
  </body>
  `;
};

export const changePasswordHtml = (password, fullName) => {
  return `
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div style="border-radius: 5px; box-shadow: 2px 4px 5px 3px grey; background: white; padding: 20px; width: max-content;">
  
        <!-- Email Header -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 15px; border-radius: 5px;">
          ${BANK_LOGO}
          <h1 style="margin: 0;">Connect Bank Password Change <span style="color: light-green;">Successful!</span></h1>
        </div>
  
        <!-- Email Body -->
        <div style="background: rgba(206, 195, 195, 0.886); padding: 20px; border-radius: 5px; margin-top: 1px;">
          <h2 style="margin-top: 0;">Dear ${fullName},</h2>

          <p>Your Password change was successful.</p>
        
          <hr style="border: 0.5px solid gray; margin: 15px 0;">
          <p><b>Password:</b> <span style="font-size:22px;">${password}</span></p>
          <p style="color: red; font-weight: bold; text-align: center;">⚠️ Do not share your sign-in details.</p>
        </div>
  
        <!-- Email Footer -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 10px; border-radius: 5px; margin-top: 2px;">
          <p>If you didn’t make this request, contact <b>admin@connecttransbank.com</b> or call: <b>07012345678</b></p>
        </div>
  
      </div>
    </div>
  </body>
  `;
};
export const forgotPasswordHtml = (defaultPassword, fullName, time) => {
  return `
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div style="border-radius: 5px; box-shadow: 2px 4px 5px 3px grey; background: white; padding: 20px; width: max-content;">
  
        <!-- Email Header -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 15px; border-radius: 5px;">
        ${BANK_LOGO}
          <h1 style="margin: 0;">Connect Bank Password Change Request</h1>
        </div>
  
        <!-- Email Body -->
        <div style="background: rgba(206, 195, 195, 0.886); padding: 20px; border-radius: 5px; margin-top: 1px;">
          <h2 style="margin-top: 0;">Dear ${fullName},</h2>

          <p>A request was sent to change your password on this account.</p>
        
           <p>If you didn’t make this request, Kindly ignore</b></p>

          <hr style="border: 0.5px solid gray; margin: 15px 0;">
          <p><b>Default Password:</b> <span style="font-size:24px;">${defaultPassword}</span>  expires ${time} minutes</p>
          <p style="color: red; font-weight: bold; text-align: center;">⚠️ Do not share your sign-in details.</p>
        </div>
  
        <!-- Email Footer -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <p>If you didn’t make this request, contact <b>admin@connecttransbank.com</b> or call: <b>07012345678</b></p>
        </div>
  
      </div>
    </div>
  </body>
  `;
};
export const createAccountHtml = (
  fullName,
  accountNumber,
  accountType,
  role,
  address,
  accountBalance,
  email,
  password
) => {
  return `
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div style="border-radius: 5px; box-shadow: 2px 4px 5px 3px grey; background: white; padding: 20px; width: max-content;">
  
        <!-- Email Header -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 15px; border-radius: 5px;">
          ${BANK_LOGO}
          <h1 style="margin: 0;">Connect Trans Bank</h1>
        </div>
  
        <!-- Email Body -->
        <div style="background: rgba(206, 195, 195, 0.886); padding: 20px; border-radius: 5px; margin-top: 1px;">
          <h2 style="margin-top: 0;">Dear ${fullName},</h2>
          <p>Your account has been created successfully. Here are your details:</p>
          
          <p><b>Account Number:</b> ${accountNumber}</p>
          <p><b>Account Type:</b> ${accountType}</p>
          <p><b>Account Balance:</b> ₦ ${accountBalance.toLocaleString()}</p>
          <p><b>Address:</b> ${address}</p>
          <p><b>Role:</b> ${role}</p>
  
          <hr style="border: 0.5px solid gray; margin: 15px 0;">
  
          <p><u><b>Account Sign-in Details:</b></u></p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
  
          <p style="color: red; font-weight: bold; text-align: center;">⚠️ Do not share your sign-in details.</p>
        </div>
  
        <!-- Email Footer -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <p>If you didn’t make this request, contact <b>admin@connecttransbank.com</b> or call: <b>07012345678</b></p>
        </div>
  
      </div>
    </div>
  </body>
  `;
};

export const cardCreationHtml = (
  fullName,
  panNumber,
  cardType,
  cardHolderName,
  expiryDate,
  cardPin,
  cvv,
  status
) => {
  return `
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div style="border-radius: 5px; box-shadow: 2px 4px 5px 3px grey; background: white; padding: 20px; width: max-content;">
  
        <!-- Email Header -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 15px; border-radius: 5px;">
          ${BANK_LOGO}
          <h1 style="margin: 0;">Connect Trans Bank Card Creation</h1>
        </div>
  
        <!-- Email Body -->
        <div style="background: rgba(206, 195, 195, 0.886); padding: 20px; border-radius: 5px; margin-top: 1px;">
          <h2 style="margin-top: 0;">Dear ${fullName},</h2>
          <p>Your card has been created successfully. Here are your details:</p>
          
          <p><b>Card Holder Name:</b> ${cardHolderName}</p>
          <p><b>Card Type:</b> ${cardType}</p>
          <p><b>Expiry Date:</b> ${expiryDate}</p>
          <p><b>Status:</b> ${status}</p>
          <br>

          <p>This is linked to your account in our bank and can be used for online transactions and 🌎web payments globally🌐</p>
          
          <hr style="border: 0.5px solid gray; margin: 15px 0;">
          
          <p><u><b>Security and Access Key:</b></u></p>
          <p><b>Pan Number:</b> ${panNumber}</p>
          <p><b>Card Pin:</b> ${cardPin}</p>
          <p><b>Cvv:</b> ${cvv}</p>
  
          <p style="color: red; font-weight: bold; text-align: center;">⚠️ Do not share your sign-in details.</p>
        </div>
  
        <!-- Email Footer -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <p>If you didn’t make this request, contact <b>admin@connecttransbank.com</b> or call: <b>07012345678</b></p>
        </div>
  
      </div>
    </div>
  </body>
  `;
};
export const senderTransactionHtml = (
  fullName,
  accountNumber,
  receiverAccount,
  amount,
  status,
  accountBalance,
  reference,
  timestamp
) => {
  return `
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div style="border-radius: 5px; box-shadow: 2px 4px 5px 3px grey; background: white; padding: 20px; width: max-content;">
  
        <!-- Email Header -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 15px; border-radius: 5px;">
          ${BANK_LOGO}
          <h1 style="margin: 0;">Connect Trans Bank</h1>
        </div>
  
        <!-- Email Body -->
        <div style="background: rgba(206, 195, 195, 0.886); padding: 20px; border-radius: 5px; margin-top: 1px;">
          <h2 style="margin-top: 0;">Dear ${fullName},</h2>
          <p>Your account has been debited successfully. Here are your details:</p>
          
          <p><b>Naration:</b> ${reference}</p>
          <p><b>Your Account Number:</b> ${accountNumber}</p>
          <p><b>Reciepient's Account Number:</b> ${receiverAccount}</p>
          <p><b>Amount:</b> ₦${amount}</p>
          <p><b>Current Account Balance:</b> ₦${accountBalance.toLocaleString()}</p>
          <p><b>status:</b> ${status}</p>
          <p><b>Transaction Date:</b> ${timestamp}</p>

  
          <hr style="border: 0.5px solid gray; margin: 15px 0;">
  
  
          <p style="color: red; font-weight: bold; text-align: center;">⚠️ Do not share your sign-in details with anyone.</p>
        </div>
  
        <!-- Email Footer -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <p>If you didn’t make this request, contact <b>admin@connecttransbank.com</b> or call: <b>07012345678</b></p>
        </div>
  
      </div>
    </div>
  </body>
  `;
};
export const receiverTransactionHtml = (
  fullName,
  accountNumber,
  senderAccountNumber,
  amount,
  status,
  accountBalance,
  reference,
  timestamp
) => {
  return `
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div style="border-radius: 5px; box-shadow: 2px 4px 5px 3px grey; background: white; padding: 20px; width: max-content;">
          ${BANK_LOGO}
      
        <!-- Email Header -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 15px; border-radius: 5px;">
       
          <h1 style="margin: 0;">Connect Trans Bank</h1>
        </div>
  
        <!-- Email Body -->
        <div style="background: rgba(206, 195, 195, 0.886); padding: 20px; border-radius: 5px; margin-top: 1px;">
          <h2 style="margin-top: 0;">Dear ${fullName},</h2>
          <p>Your account has been credited successfully. Here are your details:</p>
          
          <p><b>Naration:</b> ${reference}</p>
          <p><b>Your Account Number:</b> ${accountNumber}</p>
          <p><b>Sender's Account Number:</b> ${senderAccountNumber}</p>
          <p><b>Amount:</b> ₦${amount}</p>
          <p><b>Current Account Balance:</b> ₦${accountBalance.toLocaleString()}</p>
          <p><b>status:</b> ${status}</p>
          <p><b>Transaction Date:</b> ${timestamp}</p>

  
          <hr style="border: 0.5px solid gray; margin: 15px 0;">
  
  
          <p style="color: red; font-weight: bold; text-align: center;">⚠️ Do not share your sign-in details with anyone.</p>
        </div>

        <!-- Email Footer -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <p>If you didn’t make this request, contact <b>admin@connecttransbank.com</b> or call: <b>07012345678</b></p>
        </div>
  
      </div>
    </div>
  </body>
  `;
};
