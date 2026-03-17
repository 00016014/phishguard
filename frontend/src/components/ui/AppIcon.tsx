'use client';

import React from 'react';
import {
  AcademicCapIcon, AdjustmentsHorizontalIcon, ArrowLeftIcon, ArrowPathIcon,
  ArrowRightIcon, ArrowRightOnRectangleIcon, ArrowTopRightOnSquareIcon,
  ArrowTrendingDownIcon, ArrowTrendingUpIcon, ArrowUpCircleIcon,
  AtSymbolIcon, BellIcon, BellSlashIcon, BoltIcon, BookmarkIcon,
  BookmarkSlashIcon, BookOpenIcon, BuildingOfficeIcon, CalendarIcon,
  CameraIcon, ChartBarIcon, ChatBubbleLeftEllipsisIcon, ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon, CheckBadgeIcon, CheckCircleIcon, CheckIcon,
  ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon,
  CircleStackIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon,
  ClockIcon, CloudArrowUpIcon, CodeBracketIcon, CodeBracketSquareIcon,
  CommandLineIcon, CreditCardIcon, CubeIcon, CubeTransparentIcon,
  CurrencyDollarIcon, DevicePhoneMobileIcon, DocumentIcon, DocumentTextIcon,
  EllipsisHorizontalIcon, EnvelopeIcon, ExclamationCircleIcon,
  ExclamationTriangleIcon, EyeIcon, EyeSlashIcon, FireIcon, FlagIcon, FunnelIcon,
  GlobeAltIcon, HomeIcon, InformationCircleIcon, KeyIcon, LifebuoyIcon,
  LightBulbIcon, LinkIcon, LockClosedIcon, MagnifyingGlassIcon, MapPinIcon,
  MinusIcon, NewspaperIcon, NoSymbolIcon, PaperAirplaneIcon, PauseIcon,
  PencilIcon, PencilSquareIcon, PhotoIcon, PlayIcon, PlusIcon, QrCodeIcon,
  QuestionMarkCircleIcon, RocketLaunchIcon, ServerIcon, ShieldCheckIcon,
  ShieldExclamationIcon, SparklesIcon, StarIcon, TagIcon, TrashIcon,
  UserCircleIcon, UserGroupIcon, UserIcon, UserPlusIcon, UsersIcon,
  VideoCameraIcon, XCircleIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  AcademicCapIcon as AcademicCapIconSolid,
  ArrowUpCircleIcon as ArrowUpCircleIconSolid,
  BoltIcon as BoltIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  CheckBadgeIcon as CheckBadgeIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  CircleStackIcon as CircleStackIconSolid,
  ClockIcon as ClockIconSolid,
  CodeBracketSquareIcon as CodeBracketSquareIconSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  FireIcon as FireIconSolid,
  GlobeAltIcon as GlobeAltIconSolid,
  KeyIcon as KeyIconSolid,
  LinkIcon as LinkIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  RocketLaunchIcon as RocketLaunchIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  ShieldExclamationIcon as ShieldExclamationIconSolid,
  StarIcon as StarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  XCircleIcon as XCircleIconSolid,
} from '@heroicons/react/24/solid';

type IconVariant = 'outline' | 'solid';

const OUTLINE_ICONS: Record<string, React.ComponentType<any>> = {
  AcademicCapIcon, AdjustmentsHorizontalIcon, ArrowLeftIcon, ArrowPathIcon,
  ArrowRightIcon, ArrowRightOnRectangleIcon, ArrowTopRightOnSquareIcon,
  ArrowTrendingDownIcon, ArrowTrendingUpIcon, ArrowUpCircleIcon,
  AtSymbolIcon, BellIcon, BellSlashIcon, BoltIcon, BookmarkIcon,
  BookmarkSlashIcon, BookOpenIcon, BuildingOfficeIcon, CalendarIcon,
  CameraIcon, ChartBarIcon, ChatBubbleLeftEllipsisIcon, ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon, CheckBadgeIcon, CheckCircleIcon, CheckIcon,
  ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon,
  CircleStackIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon,
  ClockIcon, CloudArrowUpIcon, CodeBracketIcon, CodeBracketSquareIcon,
  CommandLineIcon, CreditCardIcon, CubeIcon, CubeTransparentIcon,
  CurrencyDollarIcon, DevicePhoneMobileIcon, DocumentIcon, DocumentTextIcon,
  EllipsisHorizontalIcon, EnvelopeIcon, ExclamationCircleIcon,
  ExclamationTriangleIcon, EyeIcon, EyeSlashIcon, FireIcon, FlagIcon, FunnelIcon,
  GlobeAltIcon, HomeIcon, InformationCircleIcon, KeyIcon, LifebuoyIcon,
  LightBulbIcon, LinkIcon, LockClosedIcon, MagnifyingGlassIcon, MapPinIcon,
  MinusIcon, NewspaperIcon, NoSymbolIcon, PaperAirplaneIcon, PauseIcon,
  PencilIcon, PencilSquareIcon, PhotoIcon, PlayIcon, PlusIcon, QrCodeIcon,
  QuestionMarkCircleIcon, RocketLaunchIcon, ServerIcon, ShieldCheckIcon,
  ShieldExclamationIcon, SparklesIcon, StarIcon, TagIcon, TrashIcon,
  UserCircleIcon, UserGroupIcon, UserIcon, UserPlusIcon, UsersIcon,
  VideoCameraIcon, XCircleIcon, XMarkIcon,
};

const SOLID_ICONS: Record<string, React.ComponentType<any>> = {
  AcademicCapIcon: AcademicCapIconSolid,
  ArrowUpCircleIcon: ArrowUpCircleIconSolid,
  BoltIcon: BoltIconSolid,
  BookmarkIcon: BookmarkIconSolid,
  ChartBarIcon: ChartBarIconSolid,
  ChatBubbleLeftRightIcon: ChatBubbleLeftRightIconSolid,
  CheckBadgeIcon: CheckBadgeIconSolid,
  CheckCircleIcon: CheckCircleIconSolid,
  CircleStackIcon: CircleStackIconSolid,
  ClockIcon: ClockIconSolid,
  CodeBracketSquareIcon: CodeBracketSquareIconSolid,
  DevicePhoneMobileIcon: DevicePhoneMobileIconSolid,
  EnvelopeIcon: EnvelopeIconSolid,
  ExclamationTriangleIcon: ExclamationTriangleIconSolid,
  FireIcon: FireIconSolid,
  GlobeAltIcon: GlobeAltIconSolid,
  KeyIcon: KeyIconSolid,
  LinkIcon: LinkIconSolid,
  LockClosedIcon: LockClosedIconSolid,
  MagnifyingGlassIcon: MagnifyingGlassIconSolid,
  RocketLaunchIcon: RocketLaunchIconSolid,
  ShieldCheckIcon: ShieldCheckIconSolid,
  ShieldExclamationIcon: ShieldExclamationIconSolid,
  StarIcon: StarIconSolid,
  UserGroupIcon: UserGroupIconSolid,
  XCircleIcon: XCircleIconSolid,
};

interface IconProps {
  name: string;
  variant?: IconVariant;
  size?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: any;
}

function Icon({
  name,
  variant = 'outline',
  size = 24,
  className = '',
  onClick,
  disabled = false,
  ...props
}: IconProps) {
  const iconSet = variant === 'solid' ? SOLID_ICONS : OUTLINE_ICONS;
  const IconComponent = iconSet[name];

  if (!IconComponent) {
    return (
      <QuestionMarkCircleIcon
        width={size}
        height={size}
        className={`text-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={disabled ? undefined : onClick}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      {...props}
    />
  );
}

export default Icon;
