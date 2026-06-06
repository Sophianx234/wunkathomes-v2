import { connectToDatabase } from "@/config/DbConnect";
import Property from "@/models/property";
import SearchBarClient from "./search-bar-client";

export default async function SearchBar() {
  
    await connectToDatabase();
    
    // Fetch unique areas and property types directly from the database
    const availableAreas = await Property.distinct("location.area");
    const availableTypes = await Property.distinct("propertyType");

    return (
      <SearchBarClient 
        availableAreas={availableAreas || []} 
        availableTypes={availableTypes || []} 
      />
    );
 
}