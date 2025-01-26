import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import edu1Image from '../../../assets/images/edu1.png';
import edu2Image from '../../../assets/images/edu2.png';
import edu3Image from '../../../assets/images/edu3.png';
import edu4Image from '../../../assets/images/edu4.png';
import edu5Image from '../../../assets/images/edu5.png';
import edu6Image from '../../../assets/images/edu6.png';
import edu7Image from '../../../assets/images/edu7.png';
import iconImage from '../../../assets/images/icon.png';

export default function EducationScreen() {
  const articles = [
    {
      id: 1,
      title: '10 most common birth control pill side effects',
      image: edu1Image,
      link: 'https://www.medicalnewstoday.com/articles/290196',
      publication: 'Medical News Today',
      date: 'Jan 1, 2023',
    },
    {
      id: 2,
      title: 'Birth Control Pills: Overview and Benefits',
      image: edu2Image,
      link: 'https://my.clevelandclinic.org/health/treatments/3977-birth-control-the-pill',
      publication: 'Cleveland Clinic',
      date: 'Feb 15, 2023',
    },
    {
      id: 3,
      title: "Why We Must Invest in New Women's Contraceptive Options",
      image: edu3Image,
      link: 'https://www.gatesfoundation.org/ideas/articles/why-we-must-invest-in-new-womens-contraceptive-options',
      publication: 'Gates Foundation',
      date: 'Mar 10, 2023',
    },
    {
      id: 4,
      title: 'What Portion of Women Use Birth Control?',
      image: edu4Image,
      link: 'https://usafacts.org/articles/what-portion-of-women-use-birth-control/',
      publication: 'USAFacts',
      date: 'Apr 5, 2023',
    },
    {
      id: 5,
      title: 'Contraception: Empowering Women and Girls',
      image: edu5Image,
      link: 'https://pai.org/issues/contraception/?gad_source=1&gclid=CjwKCAiAtNK8BhBBEiwA8wVt9zO_MjQqN01_4Totf6YeQWiBvnvS8Or6RCfXQ8mBfwQ86Qtd9-y0CBoC7lcQAvD_BwE',
      publication: 'PAI',
      date: 'May 20, 2023',
    },
    {
      id: 6,
      title: 'Oral Contraceptives and Cancer Risk',
      image: edu6Image,
      link: 'https://www.cancer.gov/about-cancer/causes-prevention/risk/hormones/oral-contraceptives-fact-sheet',
      publication: 'National Cancer Institute',
      date: 'Jun 15, 2023',
    },
    {
      id: 7,
      title: 'A Brief History of Birth Control',
      image: edu7Image,
      link: 'https://ourbodiesourselves.org/health-info/a-brief-history-of-birth-control',
      publication: 'Our Bodies Ourselves',
      date: 'Jul 10, 2023',
    },
    // Add more articles as needed
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={iconImage} style={styles.icon} />
      </View>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.headerText}>Pick for you</Text>
        {articles.map((article, index) => (
          <TouchableOpacity key={article.id} style={[styles.article, index === 0 && styles.firstArticle]} onPress={() => {
            Linking.openURL(article.link);
          }}>
            <Image source={article.image} style={[styles.image, index === 0 && styles.firstImage]} />
            <View style={styles.textContainer}>
              <Text style={styles.publication}>{article.publication}</Text>
              <Text style={styles.title}>{article.title}</Text>
              <Text style={styles.date}>{article.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Adjust to prevent overlap with time display
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerText: {
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
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
}); 