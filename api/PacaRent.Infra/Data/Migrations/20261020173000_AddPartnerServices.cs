using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PacaRent.Infra.Data.Migrations;

public partial class AddPartnerServices : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ServicesJson",
            table: "PartnerProfiles",
            type: "jsonb",
            nullable: false,
            defaultValue: "[]");

        migrationBuilder.AddColumn<string>(
            name: "ServiceDescription",
            table: "PartnerProfiles",
            type: "character varying(1000)",
            maxLength: 1000,
            nullable: false,
            defaultValue: "");

        migrationBuilder.Sql("""
            INSERT INTO "Categories" ("Name", "IsActive")
            SELECT 'Lainnya', TRUE
            WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE LOWER("Name") = 'lainnya');
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DELETE FROM \"Categories\" WHERE LOWER(\"Name\") = 'lainnya';");
        migrationBuilder.DropColumn(name: "ServicesJson", table: "PartnerProfiles");
        migrationBuilder.DropColumn(name: "ServiceDescription", table: "PartnerProfiles");
    }
}
