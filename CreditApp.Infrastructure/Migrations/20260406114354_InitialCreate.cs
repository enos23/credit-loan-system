using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CreditApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CNP = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    EmploymentStatus = table.Column<int>(type: "integer", nullable: false),
                    MonthlyIncome = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyExpenses = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAnalystId = table.Column<Guid>(type: "uuid", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TermMonths = table.Column<int>(type: "integer", nullable: false),
                    Purpose = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreditScore = table.Column<int>(type: "integer", nullable: false),
                    RiskLevel = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditRequests_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditRequests_Users_AssignedAnalystId",
                        column: x => x.AssignedAnalystId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Decisions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreditRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnalystId = table.Column<Guid>(type: "uuid", nullable: false),
                    DecisionType = table.Column<int>(type: "integer", nullable: false),
                    InterestRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ApprovedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Decisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Decisions_CreditRequests_CreditRequestId",
                        column: x => x.CreditRequestId,
                        principalTable: "CreditRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Decisions_Users_AnalystId",
                        column: x => x.AnalystId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreditRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    FileType = table.Column<int>(type: "integer", nullable: false),
                    UpliadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_CreditRequests_CreditRequestId",
                        column: x => x.CreditRequestId,
                        principalTable: "CreditRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clients_CNP",
                table: "Clients",
                column: "CNP",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditRequests_AssignedAnalystId",
                table: "CreditRequests",
                column: "AssignedAnalystId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditRequests_ClientId",
                table: "CreditRequests",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Decisions_AnalystId",
                table: "Decisions",
                column: "AnalystId");

            migrationBuilder.CreateIndex(
                name: "IX_Decisions_CreditRequestId",
                table: "Decisions",
                column: "CreditRequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CreditRequestId",
                table: "Documents",
                column: "CreditRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Decisions");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "CreditRequests");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
