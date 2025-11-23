import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shuffle, RotateCcw, MoveRight, MoveLeft } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  shift?: 'morning' | 'afternoon' | null;
}

type ShiftType = 'morning' | 'afternoon' | 'unassigned';
type DropArea = 'morning' | 'afternoon' | 'unassigned';

export default function ShiftManagement() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [morningStudents, setMorningStudents] = useState<Student[]>([]);
  const [afternoonStudents, setAfternoonStudents] = useState<Student[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);

  // Drag and drop state
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);
  const morningRef = useRef<HTMLDivElement>(null);
  const afternoonRef = useRef<HTMLDivElement>(null);
  const unassignedRef = useRef<HTMLDivElement>(null);

  // Fetch all students and their current shift assignments
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/daycare/students');
      const allStudents: Student[] = response.data.students || [];

      setStudents(allStudents);

      // Separate students by shift
      const morning = allStudents.filter(s => s.shift === 'morning');
      const afternoon = allStudents.filter(s => s.shift === 'afternoon');
      const unassigned = allStudents.filter(s => !s.shift);

      setMorningStudents(morning);
      setAfternoonStudents(afternoon);
      setUnassignedStudents(unassigned);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Move student to a specific shift
  const moveStudent = async (studentId: string, newShift: ShiftType) => {
    try {
      // Update on the backend
      await api.patch(`/daycare/students/${studentId}`, { shift: newShift });

      // Update local state
      const updatedStudents = students.map(stud =>
        stud.id === studentId ? { ...stud, shift: newShift } : stud
      );
      setStudents(updatedStudents);

      // Update lists
      setMorningStudents(updatedStudents.filter(s => s.shift === 'morning'));
      setAfternoonStudents(updatedStudents.filter(s => s.shift === 'afternoon'));
      setUnassignedStudents(updatedStudents.filter(s => !s.shift));

      toast.success('Shift updated successfully');
    } catch (error) {
      toast.error('Failed to update shift');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, student: Student) => {
    e.dataTransfer.setData('text/plain', student.id);
    setDraggedStudent(student);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetShift: DropArea) => {
    e.preventDefault();

    if (!draggedStudent) return;

    // Move the student to the target shift
    moveStudent(draggedStudent.id, targetShift);
    setDraggedStudent(null);
  };

  // Randomly assign students to shifts
  const randomAssign = () => {
    if (unassignedStudents.length === 0) {
      toast.info('No unassigned students to distribute');
      return;
    }

    // Create a copy of unassigned students and shuffle them
    const shuffled = [...unassignedStudents].sort(() => Math.random() - 0.5);

    // Split evenly between shifts (round robin)
    const updatedStudents: Student[] = [];

    shuffled.forEach((student, index) => {
      const newShift = index % 2 === 0 ? 'morning' : 'afternoon';
      updatedStudents.push({ ...student, shift: newShift });
    });

    // Update backend and local state
    Promise.all(
      updatedStudents.map(student =>
        api.patch(`/daycare/students/${student.id}`, { shift: student.shift })
      )
    ).then(() => {
      const allUpdated = [
        ...updatedStudents,
        ...students.filter(s => s.shift !== null) // Keep already assigned students
      ];

      setStudents(allUpdated);
      setMorningStudents(allUpdated.filter(s => s.shift === 'morning'));
      setAfternoonStudents(allUpdated.filter(s => s.shift === 'afternoon'));
      setUnassignedStudents(allUpdated.filter(s => !s.shift));

      toast.success('Students randomly assigned to shifts');
    }).catch(error => {
      toast.error('Failed to assign students');
    });
  };

  // Clear all shift assignments
  const clearAllAssignments = () => {
    if (!confirm('Are you sure you want to clear all shift assignments?')) {
      return;
    }

    // Reset all students to unassigned
    const resetPromises = students.map(student =>
      api.patch(`/daycare/students/${student.id}`, { shift: null })
    );

    Promise.all(resetPromises).then(() => {
      const resetStudents = students.map(s => ({ ...s, shift: null }));

      setStudents(resetStudents);
      setMorningStudents([]);
      setAfternoonStudents([]);
      setUnassignedStudents(resetStudents);

      toast.success('All assignments cleared');
    }).catch(error => {
      toast.error('Failed to clear assignments');
    });
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/daycare/shifts">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/daycare/shifts">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shift Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage morning and afternoon shifts for daycare students
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Shift Assignment</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={randomAssign}
                disabled={unassignedStudents.length === 0}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Random Assign
              </Button>
              <Button 
                variant="outline" 
                onClick={clearAllAssignments}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Morning Shift */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Morning Shift</h3>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {morningStudents.length} students
                  </Badge>
                </div>
                <div
                ref={morningRef}
                className="space-y-2 min-h-32 p-4 border-2 border-dashed rounded-lg bg-blue-50"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'morning')}
              >
                  {morningStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-white rounded border cursor-move hover:bg-blue-50"
                      draggable
                      onDragStart={(e) => handleDragStart(e, student)}
                    >
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveStudent(student.id, null)}
                      >
                        <MoveLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {morningStudents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No students assigned to morning shift
                    </p>
                  )}
                </div>
              </div>

              {/* Unassigned Students */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Unassigned</h3>
                  <Badge variant="outline">
                    {unassignedStudents.length} students
                  </Badge>
                </div>
                <div
                ref={unassignedRef}
                className="space-y-2 min-h-32 p-4 border-2 border-dashed rounded-lg bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'unassigned')}
              >
                  {unassignedStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-white rounded border cursor-move hover:bg-gray-100"
                      draggable
                      onDragStart={(e) => handleDragStart(e, student)}
                    >
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveStudent(student.id, 'morning')}
                        >
                          <MoveRight className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveStudent(student.id, 'afternoon')}
                        >
                          <MoveRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {unassignedStudents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No unassigned students
                    </p>
                  )}
                </div>
              </div>

              {/* Afternoon Shift */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Afternoon Shift</h3>
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    {afternoonStudents.length} students
                  </Badge>
                </div>
                <div
                ref={afternoonRef}
                className="space-y-2 min-h-32 p-4 border-2 border-dashed rounded-lg bg-purple-50"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'afternoon')}
              >
                  {afternoonStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-white rounded border cursor-move hover:bg-purple-50"
                      draggable
                      onDragStart={(e) => handleDragStart(e, student)}
                    >
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveStudent(student.id, null)}
                      >
                        <MoveLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {afternoonStudents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No students assigned to afternoon shift
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-2">Shift Assignment Tips</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Drag and drop functionality is available for easy assignment (not shown in this implementation)</li>
                <li>Click "Random Assign" to distribute unassigned students evenly between shifts</li>
                <li>Students maintain their shift assignments across days until manually changed</li>
                <li>Use the arrows to move students between shifts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}