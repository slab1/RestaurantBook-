'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Calendar, Users } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    query: '',
    location: '',
    date: '',
    time: '',
    partySize: 2,
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (searchData.query) params.set('query', searchData.query)
    if (searchData.location) params.set('location', searchData.location)
    if (searchData.date) params.set('date', searchData.date)
    if (searchData.time) params.set('time', searchData.time)
    if (searchData.partySize) params.set('partySize', searchData.partySize.toString())
    
    router.push(`/restaurants?${params.toString()}`)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Search className="mr-2 h-4 w-4" />
              Restaurant or Cuisine
            </label>
            <Input
              placeholder="Search restaurants..."
              value={searchData.query}
              onChange={(e) => setSearchData({ ...searchData, query: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Location
            </label>
            <Input
              placeholder="Enter location"
              value={searchData.location}
              onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Date
            </label>
            <Input
              type="date"
              value={searchData.date}
              onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Time
            </label>
            <Input
              type="time"
              value={searchData.time}
              onChange={(e) => setSearchData({ ...searchData, time: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Party Size
            </label>
            <Input
              type="number"
              min="1"
              max="20"
              value={searchData.partySize}
              onChange={(e) => setSearchData({ ...searchData, partySize: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button onClick={handleSearch} size="lg" className="w-full md:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Search Restaurants
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}