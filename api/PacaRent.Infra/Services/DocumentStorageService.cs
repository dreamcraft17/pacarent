using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using PacaRent.Core.Options;

namespace PacaRent.Infra.Services;

public interface IDocumentStorageService
{
    Task<string> SaveEncryptedAsync(Stream content, string fileName, CancellationToken ct = default);
    Task<byte[]> ReadDecryptedAsync(string fileRef, CancellationToken ct = default);
}

public class DocumentStorageService(IOptions<PacaRentSettings> options) : IDocumentStorageService
{
    public async Task<string> SaveEncryptedAsync(Stream content, string fileName, CancellationToken ct = default)
    {
        var settings = options.Value;
        Directory.CreateDirectory(settings.DocumentStoragePath);
        var refId = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
        var path = Path.Combine(settings.DocumentStoragePath, refId);

        await using var ms = new MemoryStream();
        await content.CopyToAsync(ms, ct);
        var encrypted = Encrypt(ms.ToArray(), settings.DocumentEncryptionKey);
        await File.WriteAllBytesAsync(path, encrypted, ct);
        return refId;
    }

    public async Task<byte[]> ReadDecryptedAsync(string fileRef, CancellationToken ct = default)
    {
        var settings = options.Value;
        var path = Path.Combine(settings.DocumentStoragePath, fileRef);
        if (!File.Exists(path))
        {
            throw new FileNotFoundException("Dokumen tidak ditemukan.");
        }

        var encrypted = await File.ReadAllBytesAsync(path, ct);
        return Decrypt(encrypted, settings.DocumentEncryptionKey);
    }

    private static byte[] Encrypt(byte[] plain, string keyMaterial)
    {
        var key = DeriveKey(keyMaterial);
        using var aes = Aes.Create();
        aes.Key = key;
        aes.GenerateIV();
        using var encryptor = aes.CreateEncryptor();
        var cipher = encryptor.TransformFinalBlock(plain, 0, plain.Length);
        return aes.IV.Concat(cipher).ToArray();
    }

    private static byte[] Decrypt(byte[] payload, string keyMaterial)
    {
        var key = DeriveKey(keyMaterial);
        using var aes = Aes.Create();
        aes.Key = key;
        var iv = payload.Take(16).ToArray();
        var cipher = payload.Skip(16).ToArray();
        aes.IV = iv;
        using var decryptor = aes.CreateDecryptor();
        return decryptor.TransformFinalBlock(cipher, 0, cipher.Length);
    }

    private static byte[] DeriveKey(string keyMaterial)
    {
        var material = string.IsNullOrWhiteSpace(keyMaterial)
            ? "dev-only-document-key-change-in-production!!"
            : keyMaterial;
        return SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(material));
    }
}
