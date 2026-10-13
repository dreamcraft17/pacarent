using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PacaRent.Infra.Data.Migrations;

/// <inheritdoc />
public partial class AddSewaPacarCategory : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            INSERT INTO "Categories" ("Name", "IsActive")
            SELECT 'Sewa pacar', TRUE
            WHERE NOT EXISTS (
                SELECT 1 FROM "Categories" WHERE "Name" = 'Sewa pacar'
            );
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            DELETE FROM "Categories"
            WHERE "Name" = 'Sewa pacar'
              AND NOT EXISTS (
                  SELECT 1 FROM "PartnerCategories" pc
                  INNER JOIN "Categories" c ON c."Id" = pc."CategoryId"
                  WHERE c."Name" = 'Sewa pacar'
              );
            """);
    }
}
