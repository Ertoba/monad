"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import type { Chain } from "wagmi"
import { chains } from "@/config/chains"
import { ChevronDown, Check } from "lucide-react"

interface ChainSelectorProps {
  selectedChain: Chain
  onSelectChain: (chain: Chain) => void
  otherChain: Chain
  availableChains?: Chain[]
}

export function ChainSelector({ selectedChain, onSelectChain, otherChain, availableChains }: ChainSelectorProps) {
  const [open, setOpen] = useState(false)

  // Use availableChains if provided, otherwise use all chains
  const displayChains = availableChains || chains

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-[#252525] border-gray-800 hover:bg-[#2A2A2A] hover:border-gray-700 h-8 rounded-lg text-xs px-2.5"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-4 w-4 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0">
              {selectedChain.icon && (
                <img
                  src={selectedChain.icon || "/placeholder.svg"}
                  alt={selectedChain.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-xs font-medium text-[#E4E3E8] truncate">{selectedChain.name}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#E4E3E8]/50 flex-shrink-0 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] p-0 bg-[#252525] border-gray-800">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search chain..." className="border-b border-gray-800 text-[#E4E3E8] h-7 text-xs" />
          <CommandList className="max-h-[180px]">
            <CommandEmpty className="text-xs py-2">No chain found.</CommandEmpty>
            <CommandGroup>
              {displayChains.map((chain) => {
                const isDisabled = chain.id === otherChain.id
                return (
                  <CommandItem
                    key={chain.id}
                    value={chain.name}
                    onSelect={() => {
                      if (!isDisabled) {
                        onSelectChain(chain)
                        setOpen(false)
                      }
                    }}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 py-1 px-2 text-[#E4E3E8] ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="h-3.5 w-3.5 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                      {chain.icon && (
                        <img
                          src={chain.icon || "/placeholder.svg"}
                          alt={chain.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-xs truncate">{chain.name}</span>
                    {chain.id === selectedChain.id && <Check className="h-3 w-3 ml-auto" />}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

