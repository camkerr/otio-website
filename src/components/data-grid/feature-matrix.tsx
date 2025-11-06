'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Check, X, ExternalLink } from 'lucide-react';

interface IFeatureMatrixRow {
  id: string;
  Feature: string;
  OpenTimelineIO: string;
  ALE: string;
  EDL: string;
  AAF: string;
  'FCP 7 XML': string;
}

interface FeatureMatrixProps {
  data: IFeatureMatrixRow[];
}

const CellRenderer = ({ value }: { value: string }) => {
  if (!value) {
    return <div className="text-center text-muted-foreground">-</div>;
  }

  switch (value) {
    case 'Y':
      return (
        <div className="flex justify-center">
          <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
        </div>
      );
    case 'N':
      return (
        <div className="flex justify-center">
          <X className="h-5 w-5 text-red-600 dark:text-red-500" />
        </div>
      );
    case 'P':
      return (
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            Partial
          </Badge>
        </div>
      );
    case 'Black/Bars Only':
      return (
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            Black/Bars Only
          </Badge>
        </div>
      );
    default:
      // Check if it contains GitHub PR numbers
      if (value.match(/#\d+/)) {
        return (
          <div className="flex justify-center flex-wrap gap-1">
            {value.split(',').map((token, index) => {
              const prNumber = token.trim().replace('#', '');
              return (
                <a
                  key={index}
                  href={`https://github.com/AcademySoftwareFoundation/OpenTimelineIO/pull/${prNumber}`}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {token.trim()}
                  <ExternalLink className="h-3 w-3" />
                </a>
              );
            })}
          </div>
        );
      }
      return <div className="text-center text-sm">{value}</div>;
  }
};

export default function FeatureMatrixDataGrid({ data }: FeatureMatrixProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(600); // Default fallback

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      const rect = container.getBoundingClientRect();
      if (rect.height > 0) {
        setHeight(rect.height);
      }
    };

    // Initial measurement
    updateHeight();

    // Watch for size changes
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const columns = useMemo<ColumnDef<IFeatureMatrixRow>[]>(
    () => [
      {
        accessorKey: 'Feature',
        id: 'feature',
        header: 'Feature',
        cell: ({ row }) => {
          return <div className="font-medium text-foreground">{row.original.Feature}</div>;
        },
        size: 400,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: 'OpenTimelineIO',
        id: 'otio',
        header: 'OpenTimelineIO',
        cell: ({ row }) => <CellRenderer value={row.original.OpenTimelineIO} />,
        size: 180,
        enableSorting: false,
        meta: {
          headerClassName: 'text-center',
          cellClassName: 'text-center',
        },
      },
      {
        accessorKey: 'ALE',
        id: 'ale',
        header: 'ALE',
        cell: ({ row }) => <CellRenderer value={row.original.ALE} />,
        size: 140,
        enableSorting: false,
        meta: {
          headerClassName: 'text-center',
          cellClassName: 'text-center',
        },
      },
      {
        accessorKey: 'EDL',
        id: 'edl',
        header: 'EDL',
        cell: ({ row }) => <CellRenderer value={row.original.EDL} />,
        size: 160,
        enableSorting: false,
        meta: {
          headerClassName: 'text-center',
          cellClassName: 'text-center',
        },
      },
      {
        accessorKey: 'AAF',
        id: 'aaf',
        header: 'AAF',
        cell: ({ row }) => <CellRenderer value={row.original.AAF} />,
        size: 140,
        enableSorting: false,
        meta: {
          headerClassName: 'text-center',
          cellClassName: 'text-center',
        },
      },
      {
        accessorKey: 'FCP 7 XML',
        id: 'fcp7',
        header: 'FCP 7 XML',
        cell: ({ row }) => <CellRenderer value={row.original['FCP 7 XML']} />,
        size: 160,
        enableSorting: false,
        meta: {
          headerClassName: 'text-center',
          cellClassName: 'text-center',
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data,
    getRowId: (row: IFeatureMatrixRow) => row.id,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-full w-full" ref={containerRef}>
      <DataGrid table={table} recordCount={data?.length || 0} tableLayout={{ headerSticky: true }}>
        <div className="w-full">
          <DataGridContainer>
            <ScrollArea style={{ height: `${height}px` }}>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGridContainer>
        </div>
      </DataGrid>
    </div>
  );
}

