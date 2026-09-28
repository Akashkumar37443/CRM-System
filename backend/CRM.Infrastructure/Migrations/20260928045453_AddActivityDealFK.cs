using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityDealFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Deals_DealId",
                table: "Activities");

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "DueDate",
                value: new DateTime(2026, 9, 29, 4, 54, 52, 258, DateTimeKind.Utc).AddTicks(5256));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "DueDate",
                value: new DateTime(2026, 9, 30, 4, 54, 52, 258, DateTimeKind.Utc).AddTicks(6153));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 3,
                column: "DueDate",
                value: new DateTime(2026, 10, 3, 4, 54, 52, 258, DateTimeKind.Utc).AddTicks(6161));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CompletedAt", "DueDate" },
                values: new object[] { new DateTime(2026, 9, 27, 4, 54, 52, 258, DateTimeKind.Utc).AddTicks(6165), new DateTime(2026, 9, 26, 4, 54, 52, 258, DateTimeKind.Utc).AddTicks(6164) });

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 5,
                column: "DueDate",
                value: new DateTime(2026, 9, 28, 4, 54, 52, 258, DateTimeKind.Utc).AddTicks(6347));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 6,
                column: "DueDate",
                value: new DateTime(2026, 10, 5, 4, 54, 52, 258, DateTimeKind.Utc).AddTicks(6349));

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Deals_DealId",
                table: "Activities",
                column: "DealId",
                principalTable: "Deals",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Deals_DealId",
                table: "Activities");

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "DueDate",
                value: new DateTime(2026, 9, 28, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(5504));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "DueDate",
                value: new DateTime(2026, 9, 29, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(7218));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 3,
                column: "DueDate",
                value: new DateTime(2026, 10, 2, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(7229));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CompletedAt", "DueDate" },
                values: new object[] { new DateTime(2026, 9, 26, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(7233), new DateTime(2026, 9, 25, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(7232) });

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 5,
                column: "DueDate",
                value: new DateTime(2026, 9, 27, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(8036));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 6,
                column: "DueDate",
                value: new DateTime(2026, 10, 4, 16, 25, 4, 899, DateTimeKind.Utc).AddTicks(8039));

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Deals_DealId",
                table: "Activities",
                column: "DealId",
                principalTable: "Deals",
                principalColumn: "Id");
        }
    }
}
