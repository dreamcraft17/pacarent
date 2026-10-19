using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PacaRent.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingChatJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChatJson",
                table: "Bookings",
                type: "jsonb",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChatJson",
                table: "Bookings");
        }
    }
}
