import React, {useState} from 'react';
import {View, Button, Platform, Text} from 'react-native';
import Sound from 'react-native-sound';
import {styles} from './Styles';

Sound.setCategory('Playback', true);

const TRACKS = {
  FOREST: 'FOREST',
  LONG: 'LONG',
  ALL: 'ALL',
  TEST: 'TEST',
};

const SOUND_INFO = {
  [TRACKS.FOREST]: 'forest_cycled.mp3',
  [TRACKS.LONG]: 'license_superlong.mp3',
  [TRACKS.TEST]: 'test.mp3',
};

const createInstance = track => new Sound(track, Sound.MAIN_BUNDLE);

const INSTANCES = {
  [TRACKS.TEST]: [
    createInstance(SOUND_INFO[TRACKS.TEST]),
    createInstance(SOUND_INFO[TRACKS.TEST]),
  ],
  [TRACKS.LONG]: [
    createInstance(SOUND_INFO[TRACKS.LONG]),
    createInstance(SOUND_INFO[TRACKS.LONG]),
  ],
  [TRACKS.FOREST]: [
    createInstance(SOUND_INFO[TRACKS.FOREST]),
    createInstance(SOUND_INFO[TRACKS.FOREST]),
  ],
};

export function SoundModule() {
  const [plyaingTracks, setPlayingTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState({});
  const [timeouts, setTimeouts] = useState([]);

  function handleSound(selected) {
    if (plyaingTracks.indexOf(selected) !== -1) return;
    plyaingTracks.push(selected);
    setPlayingTracks(plyaingTracks);
    runPlayer(selected);
  }

  function runPlayer(track, position = 0) {
    const player = INSTANCES[track][position];
    const duration = player.getDuration();
    // player.setCurrentTime(duration - 200);
    if (Platform.OS !== 'android') {
      player.setNumberOfLoops(-1);
    } else {
      const reload = setTimeout(() => {
        runPlayer(track, position === 0 ? 1 : 0);
      }, duration);
      timeouts.push(reload);
      setTimeouts(timeouts);
    }
    
    currentIndex[track] = position;
    setCurrentIndex({...currentIndex});
    player.play(success => {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
      }
    });
  }

  function play(trakcName) {
    switch (trakcName) {
      case TRACKS.FOREST:
      case TRACKS.LONG:
      case TRACKS.TEST:
        handleSound(trakcName);
        break;
      case TRACKS.ALL: {
        handleSound(TRACKS.FOREST);
        handleSound(TRACKS.LONG);
        break;
      }
      default:
        return;
    }
  }

  function pause(track) {
    const values = [0, 1];
    let arr = [];
    if(Array.isArray(track)){
      track.forEach((item) => {
       if (values.indexOf(currentIndex[item]) === -1) return;
      })
      arr = [...track];
    } else {
    if (values.indexOf(currentIndex[track]) === -1) return;
      arr.push(track);
    }
    const filteredArr = [...plyaingTracks];
    for (let i = 0; i < arr.length; i++){
      const item = arr[i];
      INSTANCES[item][currentIndex[item]].pause(() => {
        filteredArr.splice(filteredArr.indexOf(item), 1);
      });
    }
    if(Platform.OS === 'android'){
      timeouts.forEach((item) => {
        clearTimeout(item);
      })
    }
    setPlayingTracks(filteredArr);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FOREST</Text>
      <View style={styles.row}>
        <Button onPress={() => play(TRACKS.FOREST)} title="Play" />
        <Button onPress={() => pause(TRACKS.FOREST)} title="Pause" />
      </View>
      <Text style={styles.title}>LONG</Text>

      <View style={styles.row}>
        <Button onPress={() => play(TRACKS.LONG)} title="Play" />
        <Button onPress={() => pause(TRACKS.LONG)} title="Pause" />
      </View>
      <Text style={styles.title}>ALL</Text>
      <View style={styles.row}>
        <Button onPress={() => play(TRACKS.ALL)} title="Play" />
        <Button onPress={() => pause([TRACKS.LONG, TRACKS.FOREST])} title="Pause" />
      </View>
    </View>
  );
}
