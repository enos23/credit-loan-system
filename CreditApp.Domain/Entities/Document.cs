using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Enums;

namespace CreditApp.Domain.Entities;

public class Document
{
    public Guid Id { get; set; }
    public Guid CreditRequestId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public FileType FileType { get; set; }
    public DateTime UpliadedAt { get; set; } = DateTime.UtcNow;

    //Navigation property
    public CreditRequest CreditRequest { get; set; } = null!;
}
