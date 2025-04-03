"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Token } from "@/lib/tokens"

interface TokenSelectorProps {
  selectedToken: Token
  onSelectToken: (token: Token) => void
  availableTokens?: Token[]
  className?: string
}

export function TokenSelector({ selectedToken, onSelectToken, availableTokens = [], className }: TokenSelectorProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-9 px-2.5 bg-[#252525] border-gray-800 hover:bg-[#2A2A2A] hover:border-gray-800",
            className,
          )}
          onClick={(e) => {
            e.stopPropagation()
            setOpen(!open)
          }}
          data-keep-open="true"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={selectedToken.logoUrl || "/placeholder.svg"}
                alt={selectedToken.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-[#E4E3E8] truncate">{selectedToken.symbol}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[120px] p-0 bg-[#252525] border-gray-800"
        onClick={(e) => e.stopPropagation()}
        data-keep-open="true"
      >
        <Command className="bg-transparent">
          <CommandInput placeholder="Search token..." className="h-8 text-xs bg-transparent border-b border-gray-800" />
          <CommandList>
            <CommandEmpty>No token found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-y-auto">
              {availableTokens.map((token) => (
                <CommandItem
                  key={token.symbol}
                  value={token.symbol}
                  onSelect={(value) => {
                    onSelectToken(token)
                    setOpen(false)
                  }}
                  className="text-xs hover:bg-[#2A2A2A] aria-selected:bg-[#2A2A2A]"
                  onClick={(e) => e.stopPropagation()}
                  data-keep-open="true"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={token.logoUrl || "/placeholder.svg"}
                        alt={token.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[#E4E3E8]">{token.symbol}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-3.5 w-3.5",
                      selectedToken.symbol === token.symbol ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

