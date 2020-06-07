import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, Text, TextInput, Image, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Select from 'react-native-picker-select';
import axios from 'axios';

interface UF {
  key: string;
  label: string;
  value: string;
}

interface IBGEUFResponse {
  id: number,
  sigla: string,
  nome: string
}

interface City {
  // id: number,
  label: string;
  value: string;
}

interface IBGECitiesResponse {
  id: number,
  nome: string
}

const Home = () => {
  const navigation = useNavigation();

  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');

  const [ufList, setUfList] = useState<UF[]>([]);
  const [citiesList, setCitiesList] = useState<City[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  function handleNavigateToPoints() {
    navigation.navigate('Points', {
      uf: selectedUf || uf,
      city: selectedCity || city
    });
  }

  function handleSelectUF(uf: string) {
    setSelectedUf(uf);
  }

  function handleSelectCity(city: string) {
    setSelectedCity(city);
  }

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const serializedUFs = response.data.map(item => {
        return {
          key: item.sigla,
          value: item.sigla,
          label: item.sigla
        }
      });
      setUfList(serializedUFs);
    })
  }, [])

  useEffect(() => {
    if (selectedUf === '0') return;

    axios.get<IBGECitiesResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      const serializedCities = response.data.map(item => {
        return {
          label: item.nome,
          value: item.nome
        }
      });
      setCitiesList(serializedCities);
    })
  }, [selectedUf])

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ImageBackground
        style={styles.container}
        source={require('../../assets/home-background.png')}
        imageStyle={{ width: 274, height: 368 }}
      >

        <View style={styles.main} >
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
          </View>
        </View>
        {/* 
      <View style={styles.select}>
        <Select
          onValueChange={handleSelectUF}
          items={ufList}
        />
        <Select
          onValueChange={handleSelectCity}
          items={citiesList}
        />
      </View> */}

        <View style={styles.footer}>
          <TextInput
            style={styles.input}
            placeholder="Digite a UF"
            maxLength={2}
            autoCapitalize="characters"
            autoCorrect={false}
            value={uf}
            onChangeText={setUf}
          />
          <TextInput
            style={styles.input}
            placeholder="Digite a Cidade"
            autoCorrect={false}
            value={city}
            onChangeText={setCity}
          />

          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
                    </Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {
  },

  select: {
    backgroundColor: '#FFF',
  },

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

export default Home;