import React from 'react';
import { Button } from './Button';

interface AvatarOption {
  id: string;
  name: string;
  image: string;
  type: 'heygen' | 'custom';
}

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarChange: (avatarId: string) => void;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  // HeyGen avatars
  {
    id: "Ann_Therapist_public",
    name: "Ann Therapist (HeyGen)",
    image: "/demo.png",
    type: "heygen"
  },
  {
    id: "Shawn_Therapist_public", 
    name: "Shawn Therapist (HeyGen)",
    image: "/demo.png",
    type: "heygen"
  },
  // Your custom avatar
  {
    id: "your-custom-avatar",
    name: "Your Custom Avatar",
    image: "/avatars/your-avatar/avatar.png",
    type: "custom"
  }
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarChange
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-white font-semibold">Select Avatar</h3>
      <div className="grid grid-cols-2 gap-4">
        {AVATAR_OPTIONS.map((avatar) => (
          <Button
            key={avatar.id}
            onClick={() => onAvatarChange(avatar.id)}
            variant={selectedAvatar === avatar.id ? "default" : "outline"}
            className="flex flex-col items-center gap-2 p-4"
          >
            <img
              src={avatar.image}
              alt={avatar.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <span className="text-sm text-center">{avatar.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};