interface StoredItemsProps {
  keys: string[];
  onGetValue: (key: string) => void;
  onDeleteValue: (key: string) => void;
}

export default function StoredItems({ keys, onGetValue, onDeleteValue }: StoredItemsProps) {

  if (keys.length === 0) {
    return <div className="text-gray-500 text-sm py-2">No items stored yet</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Stored Items ({keys.length})</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {keys.map(key => (
          <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
            <code className="text-xs flex-1 truncate">{key}</code>
            <div className="flex gap-1">
              <button
                onClick={() => onGetValue(key)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                View
              </button>
              <button
                onClick={() => onDeleteValue(key)}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
