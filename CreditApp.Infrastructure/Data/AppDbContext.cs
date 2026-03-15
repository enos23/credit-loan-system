using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using CreditApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CreditApp.Infrastructure.Data;


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext>options) : base(options)
    {
    }


    public DbSet<User> Users { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<CreditRequest> CreditRequests { get; set; }
    public DbSet<Decision> Decisions { get; set; }
    public DbSet<Document> Documents { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        //User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
        });

        //Client
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CNP).IsUnique();
            entity.Property(e => e.CNP).IsRequired().HasMaxLength(13);
            entity.Property(e => e.MonthlyIncome).HasPrecision(18, 2);
            entity.Property(e => e.MonthlyExpenses).HasPrecision(18, 2);
        });

        //CreditRequest
        modelBuilder.Entity<CreditRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.HasOne(e => e.Client)
                  .WithMany(c => c.CreditRequests)
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        //Decision
        modelBuilder.Entity<Decision>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InterestRate).HasPrecision(5, 2);
            entity.Property(e => e.ApprovedAmount).HasPrecision(18, 2);
            entity.HasOne(e => e.CreditRequest)
                  .WithOne(cr => cr.Decision)
                  .HasForeignKey<Decision>(e => e.CreditRequestId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }   
}
