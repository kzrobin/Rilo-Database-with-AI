import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-background rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>

      {/* Filter Options */}
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem, idx, arr) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base font-bold capitalize">{keyItem}</h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].map((option) => (
                  <Label
                    key={option.id}
                    className="flex items-center gap-2 font-medium"
                  >
                    <Checkbox
                      checked={
                        filters &&
                        filters[keyItem] &&
                        filters[keyItem].includes(option.id)
                      }
                      // onCheckedChange={() => handleFilter(keyItem, option.id)}
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>

            {/* Separator except after last */}
            {idx < arr.length - 1 && <Separator />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
