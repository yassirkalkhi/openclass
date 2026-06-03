"use client"

import { useMemo } from "react"
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  ControlBar,
  RoomAudioRenderer,
  ConnectionStateToast,
  useTracks,
  isTrackReference,
  type TrackReference,
} from "@livekit/components-react"
import { Track } from "livekit-client"
import { useTheme } from "@/context/theme-context"
import "@livekit/components-styles"
import "@/styles/livekit-openclass.css"

function ConferenceLayout({ lkTheme }: { lkTheme: "default" | "light" }) {
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  )

  const screenShareTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  )

  const activeScreenShares = useMemo(
    () =>
      screenShareTracks.filter(
        (track): track is TrackReference =>
          isTrackReference(track) &&
          track.publication !== undefined &&
          track.publication.isSubscribed
      ),
    [screenShareTracks]
  )

  return (
    <div
      className="openclass-livekit lk-video-conference flex h-full min-h-[360px] w-full flex-col"
      data-lk-theme={lkTheme}
    >
      <div className="lk-video-conference-inner flex min-h-0 flex-1 flex-col">
        {activeScreenShares.length > 0 && (
          <div className="openclass-lk-screenshare shrink-0 border-b border-[var(--lk-border-color)]">
            <GridLayout tracks={activeScreenShares}>
              <ParticipantTile />
            </GridLayout>
          </div>
        )}

        <div className="lk-grid-layout-wrapper min-h-0 flex-1">
          <GridLayout tracks={cameraTracks}>
            <ParticipantTile />
          </GridLayout>
        </div>

        <ControlBar controls={{ chat: false, settings: false }} />
      </div>
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  )
}

export function LiveKitConference({
  serverUrl,
  token,
  onDisconnected,
}: {
  serverUrl: string
  token: string
  onDisconnected: () => void
}) {
  const { theme } = useTheme()
  const lkTheme = theme === "dark" ? "default" : "light"

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio
      video
      onDisconnected={onDisconnected}
      className="openclass-livekit-room h-full w-full"
      data-lk-theme={lkTheme}
    >
      <ConferenceLayout lkTheme={lkTheme} />
    </LiveKitRoom>
  )
}
