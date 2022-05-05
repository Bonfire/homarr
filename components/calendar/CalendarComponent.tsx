import { Indicator, Popover, Box, Center, ScrollArea, Divider } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Calendar } from '@mantine/dates';
import { RadarrMediaDisplay, SonarrMediaDisplay } from './MediaDisplay';
import { useConfig } from '../../tools/state';

export default function CalendarComponent(props: any) {
  const { config } = useConfig();
  const [opened, setOpened] = useState(false);
  const [sonarrMedias, setSonarrMedias] = useState([] as any);
  const [radarrMedias, setRadarrMedias] = useState([] as any);

  useEffect(() => {
    // Filter only sonarr and radarr services
    const filtered = config.services.filter(
      (service) => service.type === 'Sonarr' || service.type === 'Radarr'
    );

    // Get the url and apiKey for all Sonarr and Radarr services
    const sonarrService = filtered.filter((service) => service.type === 'Sonarr').at(0);
    const radarrService = filtered.filter((service) => service.type === 'Radarr').at(0);
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString();
    if (sonarrService) {
      fetch(
        `${sonarrService?.url}api/calendar?apikey=${sonarrService?.apiKey}&end=${nextMonth}`
      ).then((response) => {
        response.json().then((data) => setSonarrMedias(data));
      });
    }
    if (radarrService) {
      fetch(
        `${radarrService?.url}api/calendar?apikey=${radarrService?.apiKey}&end=${nextMonth}`
      ).then((response) => {
        response.json().then((data) => setRadarrMedias(data));
      });
    }
  }, [config.services]);

  if (sonarrMedias === undefined && radarrMedias === undefined) {
    return <Calendar />;
  }

  return (
    <Calendar
      onChange={(day: any) => {}}
      renderDay={(renderdate) => (
        <DayComponent
          renderdate={renderdate}
          sonarrmedias={sonarrMedias}
          radarrmedias={radarrMedias}
        />
      )}
    />
  );
}

function DayComponent(props: any) {
  const {
    renderdate,
    sonarrmedias,
    radarrmedias,
  }: { renderdate: Date; sonarrmedias: []; radarrmedias: [] } = props;
  const [opened, setOpened] = useState(false);

  const day = renderdate.getDate();
  // Itterate over the medias and filter the ones that are on the same day
  const sonarrFiltered = sonarrmedias.filter((media: any) => {
    const date = new Date(media.airDate);
    // Return true if the date is renerdate without counting hours and minutes
    return date.getDate() === day && date.getMonth() === renderdate.getMonth();
  });
  const radarrFiltered = radarrmedias.filter((media: any) => {
    const date = new Date(media.airDate);
    // Return true if the date is renerdate without counting hours and minutes
    return date.getDate() === day && date.getMonth() === renderdate.getMonth();
  });
  if (sonarrFiltered.length === 0 && radarrFiltered.length === 0) {
    return <div>{day}</div>;
  }
  // TODO: #5 Add the ability to display multiple medias on the same day by looping over the filtered medias for each service type
  // And adding a divider between the medias

  return (
    <Box
      onClick={() => {
        setOpened(true);
      }}
      style={{ height: '100%', width: '100%' }}
    >
      <Center>
        <Indicator size={10} color="red">
          <Popover
            position="left"
            width={700}
            onClose={() => setOpened(false)}
            opened={opened}
            target={day}
          >
            <ScrollArea style={{ height: 400 }}>
              {sonarrFiltered.length > 0 && <SonarrMediaDisplay media={sonarrFiltered[0]} />}
              <Divider my="xl" />
              {radarrFiltered.length > 0 && <RadarrMediaDisplay media={radarrFiltered[0]} />}
            </ScrollArea>
          </Popover>
        </Indicator>
      </Center>
    </Box>
  );
}
