import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "users.json");

// Helper functions for JSON file storage (fallback)
function getUsers() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            const dir = path.dirname(dataFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
            return [];
        }
        const content = fs.readFileSync(dataFilePath, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        console.error("Error reading users:", error);
        return [];
    }
}

function saveUsers(users: any[]) {
    try {
        const dir = path.dirname(dataFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Error saving users:", error);
    }
}

// GET: Fetch all users
export async function GET() {
    try {
        const users = getUsers();
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// POST: Create or update user
export async function POST(req: NextRequest) {
    try {
        const newUser = await req.json();

        if (!newUser.email || !newUser.name) {
            return NextResponse.json(
                { error: "Name and Email are required" },
                { status: 400 }
            );
        }

        const users = getUsers();
        const existingUserIndex = users.findIndex((u: any) => u.email === newUser.email);

        const userEntry = {
            ...newUser,
            lastLogin: new Date().toISOString(),
            provider: newUser.provider || "unknown",
        };

        if (existingUserIndex !== -1) {
            // Update existing user
            const existingUser = users[existingUserIndex];
            users[existingUserIndex] = {
                ...existingUser,
                ...userEntry,
                // Preserve hasCompletedOnboarding if it exists
                hasCompletedOnboarding: existingUser.hasCompletedOnboarding || false,
            };
        } else {
            // Add new user
            users.push({
                id: Date.now().toString(),
                joinedAt: new Date().toISOString(),
                hasCompletedOnboarding: false, // New users haven't completed onboarding
                scanCount: 0,
                ...userEntry,
            });
        }

        saveUsers(users);

        const savedUser = users[existingUserIndex !== -1 ? existingUserIndex : users.length - 1];

        return NextResponse.json({
            success: true,
            user: savedUser,
        });
    } catch (error) {
        console.error("Error saving user:", error);
        return NextResponse.json(
            { error: "Failed to save user" },
            { status: 500 }
        );
    }
}
