import { NextResponse } from "next/server";
import { isEmpty } from "lodash";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const PUT = withAuth(async (request, { params }): Promise<any> => {
  const resolvedParams = await params;
  try {
    const userId = String(resolvedParams.id);
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "Profile ID is required" },
        { status: 400 }
      );
    }

    const getUserQuery = `SELECT * FROM users WHERE id = $1`;

    const user = await pool.query(getUserQuery, [userId]);

    if (isEmpty(user.rows)) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    const updateQuery = `
      UPDATE users
      SET name = $1, phone_number = $2, tier = $3, email = $4, occupation = $5, status = $6
      WHERE id = $7 RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      body.name || user.rows[0].name,
      body.phoneNumber || user.rows[0].phone_number,
      body.tier || user.rows[0].tier,
      body.email || user.rows[0].email,
      body.occupation || user.rows[0].occupation,
      body.status || user.rows[0].status,
      userId,
    ]);

    return NextResponse.json({
      message: "Profile updated successfully",
      result: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user" },
      { status: 500 }
    );
  }
});
