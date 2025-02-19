import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

interface Pet {
  id: 'conservative' | 'aggressive' | 'balanced'
  name: string
  eggImage: string
  petImage: string
  color: string
  description: string
}

const pets: Pet[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    eggImage: '/images/egg.jpg',
    petImage: '/images/cat.jpg',
    color: "#7CB9E8",
    description: 'A steady little kitten, focused on stable returns.'
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    eggImage: '/images/egg.jpg',
    petImage: '/images/fox.jpg',
    color: "#4A3B52",
    description: 'A bold little fox, chasing high-risk, high-reward opportunities.'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    eggImage: '/images/egg.jpg',
    petImage: '/images/dog.jpg',
    color: "#7CB9E8",
    description: 'A balanced little dog, carefully weighing risk and reward.'
  }
]

const petColorClasses: Record<string, { ring: string; border: string }> = {
  conservative: { ring: "ring-soft-blue", border: "border-soft-blue" },
  aggressive: { ring: "ring-deep-purple", border: "border-deep-purple" },
  balanced: { ring: "ring-soft-blue", border: "border-soft-blue" },
}

const PetSelection = () => {
  const [selectedPet, setSelectedPet] = useState<string | null>(null)
  const [hatchedPets, setHatchedPets] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const handlePetSelect = (petId: string) => {
    setSelectedPet(petId)
    // 添加孵化动画延迟
    setTimeout(() => {
      setHatchedPets(prev => ({
        ...prev,
        [petId]: true
      }))
    }, 1000)
    // 注意：暂不跳转到对话页面，等待用户点击下一步后再跳转
  }

  return (
    <div className="pet-grid">
      {pets.map((pet) => (
        <div
          key={pet.id}
          className={`
            pet-card
            ${selectedPet === pet.id ? `ring-4 ${petColorClasses[pet.id].ring} border-2 ${petColorClasses[pet.id].border}` : ''}
            hover:border-2 hover:${petColorClasses[pet.id].border}
          `}
          onClick={() => handlePetSelect(pet.id)}
        >
          <div className="aspect-square relative mb-6">
            <Image
              src={hatchedPets[pet.id] ? pet.petImage : pet.eggImage}
              alt={pet.name}
              width={200}
              height={200}
              priority
              className={`
                ${!hatchedPets[pet.id] ? 'egg-shake' : 'animate-bounce'}
                transition-all duration-500
                w-full h-full object-contain
              `}
            />
          </div>
          <h3 className="text-lg font-bold text-center mb-3 pixel-font text-deep-purple">
            {pet.name}
          </h3>
          <p className="text-light-purple text-center text-sm pixel-font leading-relaxed">
            {pet.description}
          </p>
        </div>
      ))}
      {selectedPet && hatchedPets[selectedPet] && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push(`/pet-interaction?petId=${selectedPet}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 pixel-font"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default PetSelection 