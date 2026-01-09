import { NextResponse } from "next/server";

// Dummy scheme providers data
const dummySchemeProviders = [
  {
    _id: "1",
    companyName: "Opi Karim",
    providerType: ["Retrofit Assessor", "Retrofit Coordinator", "Scheme Provider"],
    contactEmail: "opi@retrofitsolutions.com",
    phone: "+44 20 1234 5678",
    address: "123 Green Lane, London, UK",
    registrationNumber: "RA-001",
    status: "active",
    createdAt: "2024-01-15",
    updatedAt: "2024-03-20"
  },
  {
    _id: "2",
    companyName: "Mridula Begum",
    providerType: ["Funding Partner", "Scheme Provider"],
    contactEmail: "mridula@greenfunds.com",
    phone: "+44 20 8765 4321",
    address: "456 Eco Avenue, Manchester, UK",
    registrationNumber: "FP-001",
    status: "active",
    createdAt: "2024-02-10",
    updatedAt: "2024-03-25"
  },
  {
    _id: "3",
    companyName: "Sitol Hasan",
    providerType: ["Retrofit Assessor", "Funding Partner"],
    contactEmail: "sitol@sustainablehomes.co.uk",
    phone: "+44 20 5555 1234",
    address: "789 Energy Street, Birmingham, UK",
    registrationNumber: "RA-002",
    status: "active",
    createdAt: "2024-01-25",
    updatedAt: "2024-03-18"
  },
  {
    _id: "4",
    companyName: "Green Energy Partners",
    providerType: ["Retrofit Assessor", "Retrofit Coordinator", "Funding Partner"],
    contactEmail: "info@greenenergypartners.co.uk",
    phone: "+44 20 2222 3333",
    address: "101 Solar Way, Leeds, UK",
    registrationNumber: "GEP-001",
    status: "active",
    createdAt: "2024-03-01",
    updatedAt: "2024-03-30"
  },
  {
    _id: "5",
    companyName: "Eco Retrofit Solutions",
    providerType: ["Scheme Provider", "Retrofit Coordinator"],
    contactEmail: "support@ecoretrofit.com",
    phone: "+44 20 4444 5555",
    address: "202 Windmill Road, Bristol, UK",
    registrationNumber: "ERS-001",
    status: "active",
    createdAt: "2024-02-15",
    updatedAt: "2024-03-28"
  },
  {
    _id: "6",
    companyName: "Sustainable Living Foundation",
    providerType: ["Funding Partner", "Scheme Provider"],
    contactEmail: "contact@sustainableliving.org",
    phone: "+44 20 6666 7777",
    address: "303 Eco Park, Glasgow, UK",
    registrationNumber: "SLF-001",
    status: "active",
    createdAt: "2024-01-10",
    updatedAt: "2024-03-22"
  },
  {
    _id: "7",
    companyName: "UK Green Homes Initiative",
    providerType: ["Retrofit Assessor", "Scheme Provider", "Funding Partner"],
    contactEmail: "admin@ukgreenhomes.gov",
    phone: "+44 20 8888 9999",
    address: "404 Government Building, London, UK",
    registrationNumber: "UKGH-001",
    status: "active",
    createdAt: "2024-03-05",
    updatedAt: "2024-03-29"
  },
  {
    _id: "8",
    companyName: "Future Energy Consultants",
    providerType: ["Retrofit Coordinator", "Retrofit Assessor"],
    contactEmail: "consult@futureenergy.co.uk",
    phone: "+44 20 7777 8888",
    address: "505 Innovation Drive, Cambridge, UK",
    registrationNumber: "FEC-001",
    status: "active",
    createdAt: "2024-02-20",
    updatedAt: "2024-03-26"
  },
  {
    _id: "9",
    companyName: "Carbon Zero Partners",
    providerType: ["Funding Partner"],
    contactEmail: "finance@carbonzero.com",
    phone: "+44 20 3333 4444",
    address: "606 Green Finance Tower, Edinburgh, UK",
    registrationNumber: "CZP-001",
    status: "active",
    createdAt: "2024-02-05",
    updatedAt: "2024-03-24"
  },
  {
    _id: "10",
    companyName: "Efficiency First Ltd",
    providerType: ["Scheme Provider", "Retrofit Assessor", "Retrofit Coordinator"],
    contactEmail: "info@efficiencyfirst.co.uk",
    phone: "+44 20 9999 0000",
    address: "707 Efficiency Square, Liverpool, UK",
    registrationNumber: "EF-001",
    status: "active",
    createdAt: "2024-01-30",
    updatedAt: "2024-03-27"
  }
];

export const GET = async (req) => {
  try {
    // Simulate a small delay to mimic real API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return the dummy data
    return NextResponse.json({
      success: true,
      message: "Scheme providers fetched successfully",
      providers: dummySchemeProviders,
      count: dummySchemeProviders.length,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("Error in scheme providers API:", error);
    
    return NextResponse.json({
      success: false,
      message: "Failed to fetch scheme providers",
      error: error.message || "Internal server error",
      providers: [],
      count: 0
    }, { status: 500 });
  }
};

// Optional: POST endpoint for creating new scheme providers
export const POST = async (req) => {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.companyName || !body.providerType) {
      return NextResponse.json({
        success: false,
        message: "Company name and provider type are required"
      }, { status: 400 });
    }

    // Create new provider
    const newProvider = {
      _id: (dummySchemeProviders.length + 1).toString(),
      companyName: body.companyName,
      providerType: Array.isArray(body.providerType) ? body.providerType : [body.providerType],
      contactEmail: body.contactEmail || "",
      phone: body.phone || "",
      address: body.address || "",
      registrationNumber: body.registrationNumber || `PROV-${Date.now()}`,
      status: body.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, you would save to database here
    dummySchemeProviders.push(newProvider);

    return NextResponse.json({
      success: true,
      message: "Scheme provider created successfully",
      provider: newProvider
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating scheme provider:", error);
    
    return NextResponse.json({
      success: false,
      message: "Failed to create scheme provider",
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
};