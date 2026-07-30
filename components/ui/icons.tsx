"use client";

import type { IconHandle } from "@animateicons/react";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentType,
  type HTMLAttributes,
  type RefAttributes,
  type ReactNode,
} from "react";
import {
  AccessibilityIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartNoAxesCombinedIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleCheckIcon,
  DownloadIcon,
  EllipsisIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileTextIcon,
  FilterIcon,
  FolderIcon,
  FolderOpenIcon,
  HouseIcon,
  ImageIcon,
  InfoIcon,
  LaptopIcon,
  LockIcon,
  MailIcon,
  MinusIcon,
  MoonIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SunIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UploadIcon,
  UserRoundIcon,
  UserRoundSearchIcon,
  UsersRoundIcon,
  XIcon,
} from "@animateicons/react/lucide";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  Clock3,
  FilePenLine,
  FileType2,
  GraduationCap,
  History,
  Palette,
} from "lucide-react";

import { useReducedMotionPreference } from "@/lib/hooks/use-reduced-motion-preference";
import { cn } from "@/lib/utils";

export type SystemIconProps = Omit<HTMLAttributes<HTMLElement>, "color"> & {
  size?: number;
  color?: string;
  animated?: boolean;
  duration?: number;
};

type AnimatedIconComponent = ComponentType<
  {
    size?: number;
    color?: string;
    className?: string;
    duration?: number;
    isAnimated?: boolean;
  } & HTMLAttributes<HTMLDivElement> &
    RefAttributes<IconHandle>
>;

const IconInteractionContext = createContext<boolean | null>(null);

export function IconInteractionProvider({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <IconInteractionContext.Provider value={active}>
      {children}
    </IconInteractionContext.Provider>
  );
}

function animatedIcon(Icon: AnimatedIconComponent) {
  return forwardRef<IconHandle, SystemIconProps>(function SystemAnimatedIcon(
    { animated, className, size = 16, ...props },
    forwardedRef,
  ) {
    const reduceMotion = useReducedMotionPreference();
    const interactionActive = useContext(IconInteractionContext);
    const iconRef = useRef<IconHandle>(null);
    const shouldAnimate = animated ?? interactionActive !== null;

    useImperativeHandle(forwardedRef, () => ({
      startAnimation: () => iconRef.current?.startAnimation(),
      stopAnimation: () => iconRef.current?.stopAnimation(),
    }));

    useEffect(() => {
      if (!shouldAnimate || reduceMotion) {
        iconRef.current?.stopAnimation();
        return;
      }

      if (interactionActive) iconRef.current?.startAnimation();
      else iconRef.current?.stopAnimation();
    }, [interactionActive, reduceMotion, shouldAnimate]);

    return (
      <Icon
        ref={iconRef}
        {...props}
        data-system-icon=""
        size={size}
        isAnimated={false}
        className={cn("shrink-0 align-middle", className)}
      />
    );
  });
}

type StaticIconComponent = ComponentType<
  {
    size?: number;
    color?: string;
    className?: string;
  } & HTMLAttributes<SVGElement>
>;

function staticIcon(Icon: StaticIconComponent) {
  return function SystemStaticIcon(props: SystemIconProps) {
    const { animated, duration, className, size = 16, ...rest } = props;
    void animated;
    void duration;
    const svgProps = rest as unknown as HTMLAttributes<SVGElement>;

    return (
      <Icon
        {...svgProps}
        data-system-icon=""
        size={size}
        className={cn("shrink-0 align-middle", className)}
      />
    );
  };
}

export const LuAccessibility = animatedIcon(AccessibilityIcon);
export const LuBookOpen = animatedIcon(BookOpenIcon);
export const LuBriefcaseBusiness = staticIcon(BriefcaseBusiness);
export const LuCalendarClock = animatedIcon(CalendarIcon);
export const LuCalendarDays = staticIcon(CalendarDays);
export const LuChartNoAxesCombined = animatedIcon(ChartNoAxesCombinedIcon);
export const LuCheck = animatedIcon(CheckIcon);
export const LuChevronDown = animatedIcon(ChevronDownIcon);
export const LuChevronRight = animatedIcon(ChevronRightIcon);
export const LuCircleAlert = animatedIcon(TriangleAlertIcon);
export const LuCircleCheck = animatedIcon(CircleCheckIcon);
export const LuCircleHelp = staticIcon(CircleHelp);
export const LuClock3 = staticIcon(Clock3);
export const LuCloudUpload = animatedIcon(UploadIcon);
export const LuDownload = animatedIcon(DownloadIcon);
export const LuEllipsis = animatedIcon(EllipsisIcon);
export const LuEllipsisVertical = animatedIcon(EllipsisVerticalIcon);
export const LuExternalLink = animatedIcon(ExternalLinkIcon);
export const LuEye = animatedIcon(EyeIcon);
export const LuFilePenLine = staticIcon(FilePenLine);
export const LuFileSpreadsheet = animatedIcon(FileTextIcon);
export const LuFileText = animatedIcon(FileTextIcon);
export const LuFileType2 = staticIcon(FileType2);
export const LuFilterX = animatedIcon(FilterIcon);
export const LuFolder = animatedIcon(FolderIcon);
export const LuFolderOpen = animatedIcon(FolderOpenIcon);
export const LuGraduationCap = staticIcon(GraduationCap);
export const LuHistory = staticIcon(History);
export const LuHouse = animatedIcon(HouseIcon);
export const LuImage = animatedIcon(ImageIcon);
export const LuInfo = animatedIcon(InfoIcon);
export const LuLock = animatedIcon(LockIcon);
export const LuMail = animatedIcon(MailIcon);
export const LuMinus = animatedIcon(MinusIcon);
export const LuMonitor = animatedIcon(LaptopIcon);
export const LuMoon = animatedIcon(MoonIcon);
export const LuPanelLeftClose = animatedIcon(ChevronsLeftIcon);
export const LuPanelLeftOpen = animatedIcon(ChevronsRightIcon);
export const LuPalette = staticIcon(Palette);
export const LuPencil = animatedIcon(PencilIcon);
export const LuPlay = animatedIcon(PlayIcon);
export const LuPlus = animatedIcon(PlusIcon);
export const LuRefreshCw = animatedIcon(RefreshCwIcon);
export const LuSearch = animatedIcon(SearchIcon);
export const LuSettings2 = animatedIcon(SettingsIcon);
export const LuShieldCheck = animatedIcon(ShieldCheckIcon);
export const LuSun = animatedIcon(SunIcon);
export const LuTrash2 = animatedIcon(Trash2Icon);
export const LuUpload = animatedIcon(UploadIcon);
export const LuUserRound = animatedIcon(UserRoundIcon);
export const LuUserRoundSearch = animatedIcon(UserRoundSearchIcon);
export const LuUsersRound = animatedIcon(UsersRoundIcon);
export const LuX = animatedIcon(XIcon);
