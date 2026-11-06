"use client";

import { ReactNode, useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  allowMultiple?: boolean; // false = opening one closes the others
  defaultOpenId?: string;
};

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpenId,
}: AccordionProps) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : [],
  );

  function toggle(id: string) {
    setOpenIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return allowMultiple ? [...prev, id] : [id];
    });
  }

  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const buttonId = `${baseId}-${item.id}-button`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-medium transition-colors hover:bg-gray-50"
              >
                {item.title}
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-gray-500 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>

            {/* grid-rows 0fr -> 1fr animates the height without knowing it */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-4 text-gray-600">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Usage:

<Accordion
  defaultOpenId="deposit"
  items={[
    { id: "deposit", title: "How does the security deposit work?", content: <p>...</p> },
    { id: "bedding", title: "Is bedding included?", content: <p>...</p> },
  ]}
/>
*/
