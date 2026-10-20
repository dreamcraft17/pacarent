using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PacaRent.Infra.Data.Migrations;

public partial class AddConversations : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Conversations",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                PartnerId = table.Column<Guid>(type: "uuid", nullable: false),
                MessagesJson = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Conversations", x => x.Id);
                table.ForeignKey("FK_Conversations_Users_PartnerId", x => x.PartnerId, "Users", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_Conversations_Users_UserId", x => x.UserId, "Users", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "IX_Conversations_PartnerId", table: "Conversations", column: "PartnerId");
        migrationBuilder.CreateIndex(name: "IX_Conversations_UserId_PartnerId", table: "Conversations", columns: new[] { "UserId", "PartnerId" }, unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable(name: "Conversations");
}
