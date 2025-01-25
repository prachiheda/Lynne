import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';

export default function EducationScreen() {
  const articles = [
    {
      id: 1,
      title: '10 most common birth control pill side effects',
      image: 'https://via.placeholder.com/150',
      link: 'https://www.medicalnewstoday.com/articles/290196',
      publication: 'Medical News Today',
    },
    {
      id: 2,
      title: 'Birth Control Pills: Overview and Benefits',
      image: 'https://via.placeholder.com/150',
      link: 'https://my.clevelandclinic.org/health/treatments/3977-birth-control-the-pill',
      publication: 'Cleveland Clinic',
    },
    {
      id: 3,
      title: "Why We Must Invest in New Women's Contraceptive Options",
      image: 'https://via.placeholder.com/150',
      link: 'https://www.gatesfoundation.org/ideas/articles/why-we-must-invest-in-new-womens-contraceptive-options',
      publication: 'Gates Foundation',
    },
    {
      id: 4,
      title: 'What Portion of Women Use Birth Control?',
      image: 'https://via.placeholder.com/150',
      link: 'https://usafacts.org/articles/what-portion-of-women-use-birth-control/',
      publication: 'USAFacts',
    },
    {
      id: 5,
      title: 'Contraception: Empowering Women and Girls',
      image: 'https://via.placeholder.com/150',
      link: 'https://pai.org/issues/contraception/?gad_source=1&gclid=CjwKCAiAtNK8BhBBEiwA8wVt9zO_MjQqN01_4Totf6YeQWiBvnvS8Or6RCfXQ8mBfwQ86Qtd9-y0CBoC7lcQAvD_BwE',
      publication: 'PAI',
    },
    {
      id: 6,
      title: 'Oral Contraceptives and Cancer Risk',
      image: 'https://via.placeholder.com/150',
      link: 'https://www.cancer.gov/about-cancer/causes-prevention/risk/hormones/oral-contraceptives-fact-sheet',
      publication: 'National Cancer Institute',
    },
    {
      id: 7,
      title: 'A Brief History of Birth Control',
      image: 'https://via.placeholder.com/150',
      link: 'https://ourbodiesourselves.org/health-info/a-brief-history-of-birth-control',
      publication: 'Our Bodies Ourselves',
    },
    // Add more articles as needed
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Picks for you</Text>
      {articles.map((article, index) => (
        <TouchableOpacity key={article.id} style={[styles.article, index === 0 && styles.firstArticle]} onPress={() => {
          if (index === 0) {
            Linking.openURL('https://www.medicalnewstoday.com/articles/290196');
          } else if (index === 1) {
            Linking.openURL('https://my.clevelandclinic.org/health/treatments/3977-birth-control-the-pill');
          } else if (index === 2) {
            Linking.openURL('https://www.gatesfoundation.org/ideas/articles/why-we-must-invest-in-new-womens-contraceptive-options');
          } else if (index === 3) {
            Linking.openURL('https://usafacts.org/articles/what-portion-of-women-use-birth-control/');
          } else if (index === 4) {
            Linking.openURL('https://pai.org/issues/contraception/?gad_source=1&gclid=CjwKCAiAtNK8BhBBEiwA8wVt9zO_MjQqN01_4Totf6YeQWiBvnvS8Or6RCfXQ8mBfwQ86Qtd9-y0CBoC7lcQAvD_BwE');
          } else if (index === 5) {
            Linking.openURL('https://www.cancer.gov/about-cancer/causes-prevention/risk/hormones/oral-contraceptives-fact-sheet');
          } else if (index === 6) {
            Linking.openURL('https://ourbodiesourselves.org/health-info/a-brief-history-of-birth-control');
          }
        }}>
          <Image source={{ uri: article.image }} style={[styles.image, index === 0 && styles.firstImage]} />
          <View style={styles.textContainer}>
            <Text style={styles.publication}>{article.publication}</Text>
            <Text style={styles.title}>{article.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  article: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  firstArticle: {
    flexDirection: 'column',
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  firstImage: {
    width: '100%',
    height: 200,
    marginRight: 0,
  },
  textContainer: {
    flex: 1,
  },
  publication: {
    fontSize: 12,
    color: '#888',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
}); 