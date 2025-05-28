"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, FileText } from "lucide-react";

export default function JobSheetsTable({
  jobSheets,
  onEdit,
  onDelete,
  onView,
  searchTerm,
  setSearchTerm,
}) {
  const filteredSheets = jobSheets.filter((sheet) => {
    return (
      searchTerm === "" ||
      sheet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.size?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Job Sheets
          <Input
            placeholder="Search by description or size..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sheet</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Sq inch</TableHead>
              <TableHead>Paper Sheet</TableHead>
              <TableHead>Imp.</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Printing</TableHead>
              <TableHead>UV</TableHead>
              <TableHead>Baking</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSheets.map((sheet) => (
              <TableRow key={sheet.id}>
                <TableCell>{sheet.id}</TableCell>
                <TableCell>
                  {sheet.job_date ? sheet.job_date.slice(0, 10) : ""}
                </TableCell>
                <TableCell>{sheet.description}</TableCell>
                <TableCell>{sheet.sheet}</TableCell>
                <TableCell>{sheet.plate}</TableCell>
                <TableCell>{sheet.size}</TableCell>
                <TableCell>{sheet.sq_inch}</TableCell>
                <TableCell>{sheet.paper_sheet}</TableCell>
                <TableCell>{sheet.imp}</TableCell>
                <TableCell>{sheet.rate}</TableCell>
                <TableCell>{sheet.printing}</TableCell>
                <TableCell>{sheet.uv}</TableCell>
                <TableCell>{sheet.baking}</TableCell>
                <TableCell>
                  {sheet.file_url ? (
                    sheet.file_url.match(/\.(jpg|jpeg|png)$/i) ? (
                      <a
                        href={sheet.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={sheet.file_url}
                          alt="Job File"
                          className="w-12 h-12 object-cover rounded"
                        />
                      </a>
                    ) : (
                      <a
                        href={sheet.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        View File
                      </a>
                    )
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(sheet)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(sheet)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(sheet.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSheets.length === 0 && (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-4">
                  No job sheets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
