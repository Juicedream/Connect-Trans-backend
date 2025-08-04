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

export const forgotPasswordHtml = (defaultPassword, fullName, time) => {
  return `
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div style="border-radius: 5px; box-shadow: 2px 4px 5px 3px grey; background: white; padding: 20px; width: max-content;">
  
        <!-- Email Header -->
        <div style="background: rgba(38, 36, 36, 0.886); color: white; text-align: center; padding: 15px; border-radius: 5px;">
       
          <h1 style="margin: 0;">Connect Bank Password Change Request</h1>
        </div>
  
        <!-- Email Body -->
        <div style="background: rgba(206, 195, 195, 0.886); padding: 20px; border-radius: 5px; margin-top: 1px;">
          <h2 style="margin-top: 0;">Dear ${fullName},</h2>

          <p>A request was sent to change your password on this account.</p>
        
           <p>If you didn’t make this request, Kindly ignore/b></p>

          <hr style="border: 0.5px solid gray; margin: 15px 0;">
          <p><b>Default Password:</b> "${defaultPassword}"  expires ${time} minutes</p>
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
