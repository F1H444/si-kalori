import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "users.json");

function getUsers() {
    if (!fs.existsSync(dataFilePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
    } catch { return []; }
}

function saveUsers(users: any[]) {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const users = getUsers();
        const userIndex = users.findIndex((u: any) => u.email === email);

        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Set Premium Status to TRUE
        const user = users[userIndex];
        user.isPremium = true;
        user.scanCount = 0; // Reset scan count on upgrade if needed, or keep it. Let's keep it but they have unlimited now.

        // Save
        users[userIndex] = user;
        saveUsers(users);

        return NextResponse.json({ success: true, isPremium: true });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
