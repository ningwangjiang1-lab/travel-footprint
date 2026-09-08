interface CityChipsProps {
  cities: string[]
  active: string
  onSelect: (city: string) => void
}

/** 城市筛选 chips（UI 规范 §7.6，横向滑动） */
export default function CityChips({ cities, active, onSelect }: CityChipsProps) {
  return (
    <div className="city-chips">
      <button className={`chip${active === 'all' ? ' on' : ''}`} onClick={() => onSelect('all')}>
        全部
      </button>
      {cities.map((c) => (
        <button
          key={c}
          className={`chip${active === c ? ' on' : ''}`}
          onClick={() => onSelect(c)}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
