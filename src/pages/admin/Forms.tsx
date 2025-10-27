
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Edit, Trash2, FileText, Eye, Download, FilePlus2 } from "lucide-react";
import { toast } from "sonner";

// Sample forms data based on the flowchart
const formsData = [
  { 
    id: 1, 
    title: "Gym Membership Registration", 
    category: "Membership",
    fields: 11,
    submissions: 152,
    lastUpdated: "2023-10-15"
  },
  { 
    id: 2, 
    title: "General Membership Registration", 
    category: "Membership",
    fields: 8,
    submissions: 254,
    lastUpdated: "2023-09-28"
  },
  { 
    id: 3, 
    title: "Volunteer Registration", 
    category: "Volunteering",
    fields: 12,
    submissions: 87,
    lastUpdated: "2023-11-01"
  },
  { 
    id: 4, 
    title: "Volunteer Hours Log", 
    category: "Volunteering",
    fields: 9,
    submissions: 123,
    lastUpdated: "2023-10-22"
  },
  { 
    id: 5, 
    title: "Event Registration", 
    category: "Events",
    fields: 6,
    submissions: 215,
    lastUpdated: "2023-10-30"
  },
  { 
    id: 6, 
    title: "Contact Us", 
    category: "Communication",
    fields: 4,
    submissions: 95,
    lastUpdated: "2023-11-05"
  },
];

const FormsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredForms = formsData.filter(form => 
    searchQuery === "" || 
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    form.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddForm = () => {
    toast.success("Form builder would open here");
  };

  const handleEditForm = (formId: number) => {
    toast.info(`Edit form with ID: ${formId}`);
  };

  const handleDeleteForm = (formId: number) => {
    toast.success(`Form with ID: ${formId} has been deleted`);
  };

  const handleViewSubmissions = (formId: number) => {
    toast.info(`View submissions for form ID: ${formId}`);
  };

  const handleExportSubmissions = (formId: number) => {
    toast.success(`Exporting submissions for form ID: ${formId}`);
  };

  return (
    <div className="space-y-4 xs:space-y-6 sm:space-y-8">
      <div className="flex flex-col">
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight animate-slide-in">Forms Management</h2>
        <p className="text-xs xs:text-sm text-muted-foreground animate-slide-in" style={{ animationDelay: "50ms" }}>
          Create, edit, and manage forms and view submissions.
        </p>
      </div>

      <Card className="animate-slide-in" style={{ animationDelay: "100ms" }}>
        <CardHeader className="p-3 xs:p-4 sm:p-6">
          <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-3 xs:gap-4">
            <div>
              <CardTitle className="text-lg xs:text-xl sm:text-2xl">Forms</CardTitle>
              <CardDescription className="text-xs xs:text-sm sm:text-base">Manage your form templates and submissions</CardDescription>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  className="pl-7 xs:pl-8 w-full xs:w-[200px] sm:w-[250px] text-xs xs:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleAddForm} className="text-xs xs:text-sm px-3 xs:px-4">
                <FilePlus2 className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                <span className="hidden xs:inline">Create Form</span>
                <span className="xs:hidden">Create</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 xs:p-3 sm:p-6">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-xs xs:text-sm min-w-[600px] xs:min-w-[700px] sm:min-w-[800px]">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="h-10 xs:h-12 px-2 xs:px-4 text-left font-medium">Form Name</th>
                    <th className="h-10 xs:h-12 px-2 xs:px-4 text-left font-medium hidden xs:table-cell">Category</th>
                    <th className="h-10 xs:h-12 px-2 xs:px-4 text-left font-medium hidden sm:table-cell">Fields</th>
                    <th className="h-10 xs:h-12 px-2 xs:px-4 text-left font-medium hidden md:table-cell">Submissions</th>
                    <th className="h-10 xs:h-12 px-2 xs:px-4 text-left font-medium hidden lg:table-cell">Last Updated</th>
                    <th className="h-10 xs:h-12 px-2 xs:px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.length > 0 ? (
                    filteredForms.map((form) => (
                      <tr key={form.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-2 xs:p-4 align-middle">
                          <div className="min-w-0">
                            <div className="font-medium text-xs xs:text-sm truncate">{form.title}</div>
                            <div className="text-xs text-muted-foreground truncate xs:hidden">
                              {form.category} • {form.fields} fields • {form.submissions} submissions
                            </div>
                          </div>
                        </td>
                        <td className="p-2 xs:p-4 align-middle hidden xs:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            form.category === "Membership" ? "bg-blue-100 text-blue-800" :
                            form.category === "Volunteering" ? "bg-green-100 text-green-800" :
                            form.category === "Events" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {form.category}
                          </span>
                        </td>
                        <td className="p-2 xs:p-4 align-middle hidden sm:table-cell text-xs xs:text-sm">{form.fields}</td>
                        <td className="p-2 xs:p-4 align-middle hidden md:table-cell text-xs xs:text-sm">{form.submissions}</td>
                        <td className="p-2 xs:p-4 align-middle hidden lg:table-cell text-xs xs:text-sm">{form.lastUpdated}</td>
                        <td className="p-2 xs:p-4 align-middle text-right">
                          <div className="flex justify-end gap-1 xs:gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewSubmissions(form.id)} className="h-6 w-6 xs:h-8 xs:w-8">
                              <Eye className="h-3 w-3 xs:h-4 xs:w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleExportSubmissions(form.id)} className="h-6 w-6 xs:h-8 xs:w-8">
                              <Download className="h-3 w-3 xs:h-4 xs:w-4" />
                              <span className="sr-only">Export</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditForm(form.id)} className="h-6 w-6 xs:h-8 xs:w-8">
                              <Edit className="h-3 w-3 xs:h-4 xs:w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteForm(form.id)} className="h-6 w-6 xs:h-8 xs:w-8">
                              <Trash2 className="h-3 w-3 xs:h-4 xs:w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground text-xs xs:text-sm">
                        No forms found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormsPage;
