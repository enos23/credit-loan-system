using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CreditApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureUserForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditRequests_Users_AssignedAnalystId",
                table: "CreditRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Decisions_Users_AnalystId",
                table: "Decisions");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditRequests_Users_AssignedAnalystId",
                table: "CreditRequests",
                column: "AssignedAnalystId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Decisions_Users_AnalystId",
                table: "Decisions",
                column: "AnalystId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditRequests_Users_AssignedAnalystId",
                table: "CreditRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Decisions_Users_AnalystId",
                table: "Decisions");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditRequests_Users_AssignedAnalystId",
                table: "CreditRequests",
                column: "AssignedAnalystId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Decisions_Users_AnalystId",
                table: "Decisions",
                column: "AnalystId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
