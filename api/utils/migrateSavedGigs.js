import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import SavedGig from "../models/savedGig.model.js";

dotenv.config();

// Connect to MongoDB
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("✅ Connected to MongoDB!");
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    return false;
  }
};

// Migrate saved gigs from User model to SavedGig model
const migrateSavedGigs = async () => {
  try {
    // Connect to database
    const connected = await connect();
    if (!connected) {
      console.error("Failed to connect to database. Migration aborted.");
      process.exit(1);
    }

    console.log("Starting migration of saved gigs...");

    // Find all users with saved gigs
    const users = await User.find({ savedGigs: { $exists: true, $ne: [] } });
    console.log(`Found ${users.length} users with saved gigs.`);

    let totalMigrated = 0;
    let totalErrors = 0;

    // For each user, create SavedGig documents for each saved gig
    for (const user of users) {
      console.log(`Processing user: ${user.username} (${user._id}) with ${user.savedGigs.length} saved gigs`);
      
      for (const gigId of user.savedGigs) {
        try {
          // Check if this relationship already exists
          const existingRelation = await SavedGig.findOne({ userId: user._id.toString(), gigId });
          
          if (!existingRelation) {
            // Create new saved gig relationship
            const savedGig = new SavedGig({
              userId: user._id.toString(),
              gigId
            });
            
            await savedGig.save();
            totalMigrated++;
          } else {
            console.log(`Relation already exists for user ${user._id} and gig ${gigId}`);
          }
        } catch (err) {
          console.error(`Error migrating gig ${gigId} for user ${user._id}:`, err);
          totalErrors++;
        }
      }
    }

    console.log("\nMigration completed!");
    console.log(`Total saved gigs migrated: ${totalMigrated}`);
    console.log(`Total errors: ${totalErrors}`);

    // Disconnect from database
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

// Run migration
migrateSavedGigs();