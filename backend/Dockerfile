FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["CRM.Core/CRM.Core.csproj", "CRM.Core/"]
COPY ["CRM.Infrastructure/CRM.Infrastructure.csproj", "CRM.Infrastructure/"]
COPY ["CRM.API/CRM.API.csproj", "CRM.API/"]
RUN dotnet restore "CRM.API/CRM.API.csproj"

COPY . .
WORKDIR "/src/CRM.API"
RUN dotnet build "CRM.API.csproj" -c Release -o /app/build
RUN dotnet publish "CRM.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "CRM.API.dll"]
