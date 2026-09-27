using CRM.Core.DTOs;
using CRM.Core.Entities;
using CRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyRepository _companyRepo;

    public CompaniesController(ICompanyRepository companyRepo)
    {
        _companyRepo = companyRepo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompanyDto>>> GetAll([FromQuery] string? search)
    {
        var companies = string.IsNullOrEmpty(search)
            ? await _companyRepo.GetAllAsync()
            : await _companyRepo.SearchAsync(search);

        return Ok(companies.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> GetById(int id)
    {
        var company = await _companyRepo.GetByIdAsync(id);
        if (company == null) return NotFound();
        return Ok(MapToDto(company));
    }

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> Create([FromBody] CreateCompanyDto dto)
    {
        var company = new Company
        {
            Name = dto.Name, Industry = dto.Industry, Website = dto.Website,
            Phone = dto.Phone, Email = dto.Email, Address = dto.Address,
            City = dto.City, Country = dto.Country, Size = dto.Size,
            AnnualRevenue = dto.AnnualRevenue, Description = dto.Description, Logo = dto.Logo
        };

        await _companyRepo.AddAsync(company);
        var created = await _companyRepo.GetByIdAsync(company.Id);
        return CreatedAtAction(nameof(GetById), new { id = company.Id }, MapToDto(created!));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CompanyDto>> Update(int id, [FromBody] UpdateCompanyDto dto)
    {
        var company = await _companyRepo.GetByIdAsync(id);
        if (company == null) return NotFound();

        if (dto.Name != null) company.Name = dto.Name;
        if (dto.Industry != null) company.Industry = dto.Industry;
        if (dto.Website != null) company.Website = dto.Website;
        if (dto.Phone != null) company.Phone = dto.Phone;
        if (dto.Email != null) company.Email = dto.Email;
        if (dto.Address != null) company.Address = dto.Address;
        if (dto.City != null) company.City = dto.City;
        if (dto.Country != null) company.Country = dto.Country;
        if (dto.Size != null) company.Size = dto.Size;
        if (dto.AnnualRevenue.HasValue) company.AnnualRevenue = dto.AnnualRevenue;
        if (dto.Description != null) company.Description = dto.Description;
        if (dto.Logo != null) company.Logo = dto.Logo;

        await _companyRepo.UpdateAsync(company);
        var updated = await _companyRepo.GetByIdAsync(id);
        return Ok(MapToDto(updated!));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var company = await _companyRepo.GetByIdAsync(id);
        if (company == null) return NotFound();
        await _companyRepo.DeleteAsync(id);
        return NoContent();
    }

    private static CompanyDto MapToDto(Company c) => new(
        c.Id, c.Name, c.Industry, c.Website, c.Phone,
        c.Email, c.Address, c.City, c.Country,
        c.Size, c.AnnualRevenue, c.Description, c.Logo,
        c.CreatedAt, c.Contacts?.Count ?? 0, c.Deals?.Count ?? 0);
}
