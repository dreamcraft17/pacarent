using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PacaRent.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilePhotoBlob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "PhotoBlob",
                table: "UserProfiles",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoContentType",
                table: "UserProfiles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoBlob",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "PhotoContentType",
                table: "UserProfiles");
        }
    }
}
