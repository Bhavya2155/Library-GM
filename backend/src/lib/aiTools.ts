import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const libraryTools: FunctionDeclaration[] = [
  {
    name: 'search_books',
    description: 'Searches the library database for books. Returns a list of books matching the query.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: 'The search query (title, author, or category). Leave empty to get all books.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'check_book_availability',
    description: 'Checks the inventory and availability of a specific book by its ID or exact title.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: 'The exact or partial title of the book to check.',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'get_student_info',
    description: 'Searches for a student in the database by their name, student ID, or email.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: 'The search term (name, student ID, or email).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_issued_books',
    description: 'Retrieves a list of currently issued books. Can be filtered by a specific student ID or overdue status.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        studentId: {
          type: SchemaType.STRING,
          description: 'Optional. Filter by a specific student ID.',
        },
        overdueOnly: {
          type: SchemaType.BOOLEAN,
          description: 'Optional. If true, only returns books that are past their due date.',
        },
      },
    },
  },
  {
    name: 'get_library_stats',
    description: 'Retrieves overall statistics for the library (total books, active students, issued books).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
];
