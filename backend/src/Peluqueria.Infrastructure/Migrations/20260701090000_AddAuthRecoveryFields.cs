using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Peluqueria.Infrastructure.Migrations
{
    public partial class AddAuthRecoveryFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailVerified",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "EmailVerificationTokenHash",
                table: "users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailVerificationTokenExpiresAtUtc",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetTokenHash",
                table: "users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiresAtUtc",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_EmailVerificationTokenHash",
                table: "users",
                column: "EmailVerificationTokenHash");

            migrationBuilder.CreateIndex(
                name: "IX_users_PasswordResetTokenHash",
                table: "users",
                column: "PasswordResetTokenHash");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_EmailVerificationTokenHash",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_PasswordResetTokenHash",
                table: "users");

            migrationBuilder.DropColumn(
                name: "EmailVerified",
                table: "users");

            migrationBuilder.DropColumn(
                name: "EmailVerificationTokenHash",
                table: "users");

            migrationBuilder.DropColumn(
                name: "EmailVerificationTokenExpiresAtUtc",
                table: "users");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenHash",
                table: "users");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiresAtUtc",
                table: "users");
        }
    }
}
