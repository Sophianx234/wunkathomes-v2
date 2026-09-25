import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function manageAdmin() {
  try {
    const action = process.argv[2]; // 'grant' or 'revoke'
    const email = process.argv[3];

    // Validate inputs
    if (!action || !['grant', 'revoke'].includes(action.toLowerCase())) {
      console.error("❌ Invalid action. Use 'grant' or 'revoke'.");
      console.error("👉 Usage: npm run admin <grant|revoke> <user@example.com>");
      process.exit(1);
    }

    if (!email) {
      console.error("❌ Email address is required.");
      console.error("👉 Usage: npm run admin <grant|revoke> <user@example.com>");
      process.exit(1);
    }

    console.log(`🛠️  Preparing to ${action.toUpperCase()} admin privileges for ${email}...`);

    // Dynamically import to ensure env variables are loaded first
    const { connectToDatabase } = await import('../src/config/DbConnect');
    const mongoose = (await import('mongoose')).default;
    const User = (await import('../src/models/user')).default;

    await connectToDatabase();

    // Find the user (case-insensitive for safety)
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
      console.error(`❌ User with email "${email}" not found in the database.`);
      process.exit(1);
    }

    // Apply the role change
    if (action.toLowerCase() === 'grant') {
      if (user.role === 'Admin') {
        console.log(`ℹ️  ${user.name} (${user.email}) is already an Admin.`);
      } else {
        user.role = 'Admin';
        await user.save();
        console.log(`✅ Success! Admin privileges GRANTED to ${user.name} (${user.email}).`);
      }
    } else if (action.toLowerCase() === 'revoke') {
      if (user.role === 'User') {
        console.log(`ℹ️  ${user.name} (${user.email}) is already a standard User.`);
      } else {
        user.role = 'User';
        await user.save();
        console.log(`✅ Success! Admin privileges REVOKED from ${user.name} (${user.email}).`);
      }
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("❌ An error occurred:", error);
    process.exit(1);
  }
}

manageAdmin();
