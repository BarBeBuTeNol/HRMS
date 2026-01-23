import userRepository from "../repository/userRepository";

export const logUserAction = async (
  userId: number,
  action: string,
  details: string,
) => {
  try {
    await userRepository.logAction(userId, action, details);
    console.log(`[LOG] Action recorded: User ${userId} -> ${action}`);
  } catch (error) {
    console.error("[LOG ERROR] Failed to record user action:", error);
  }
};
