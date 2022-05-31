const AllUser = () => {
  const {userData} = useSelector(state => state.User);

  const [search, setsearch] = useState('');
  const [allUser, setallUser] = useState([]);
  const [allUserBackup, setallUserBackup] = useState([]);

  useEffect(() => {
    getAllUser();
  }, []);

  const getAllUser = () => {
    database()
      .ref('users/')
      .once('value')
      .then(snapshot => {
        console.log('all User data: ', Object.values(snapshot.val()));
        setallUser(
          Object.values(snapshot.val()).filter(it => it.id != userData.id),
        );
        setallUserBackup(
          Object.values(snapshot.val()).filter(it => it.id != userData.id),
        );
      });
  };

  const searchuser = val => {
    setsearch(val);
    setallUser(allUserBackup.filter(it => it.name.match(val)));
  };

  const createChatList = data => {
    database()
      .ref('/chatlist/' + userData.id + '/' + data.id)
      .once('value')
      .then(snapshot => {
        console.log('User data: ', snapshot.val());

        if (snapshot.val() == null) {
          let roomId = uuid.v4();
          let myData = {
            roomId,
            id: userData.id,
            name: userData.name,
            img: userData.img,
            emailId: userData.emailId,
            about: userData.about,
            lastMsg: '',
          };
          database()
            .ref('/chatlist/' + data.id + '/' + userData.id)
            .update(myData)
            .then(() => console.log('Data updated.'));

          delete data['password'];
          data.lastMsg = '';
          data.roomId = roomId;
          database()
            .ref('/chatlist/' + userData.id + '/' + data.id)
            .update(data)
            .then(() => console.log('Data updated.'));

          Navigation.navigate('SingleChat', {receiverData: data});
        } else {
          Navigation.navigate('SingleChat', {receiverData: snapshot.val()});
        }
      });
  };

  const renderItem = ({item}) => (
    <ListItem
      onPress={() => createChatList(item)}
      bottomDivider
      containerStyle={styles.listStyle}>
      <Avatar
        source={{uri: item.img}}
        rounded
        title={item.name}
        size="medium"
      />
      <ListItem.Content>
        <ListItem.Title style={{fontFamily: FONTS.Medium, fontSize: 14}}>
          {item.name}
        </ListItem.Title>
        <ListItem.Subtitle
          style={{fontFamily: FONTS.Regular, fontSize: 12}}
          numberOfLines={1}>
          {item.about}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <Container style={{flex: 1, backgroundColor: COLORS.white}}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SearchBar
        placeholder="Search by name..."
        onChangeText={val => searchuser(val)}
        value={search}
        containerStyle={styles.searchContainer}
        inputStyle={styles.searchInput}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        data={allUser}
        renderItem={renderItem}
      />
    </Container>
  );
};

export default AllUser;

const styles = StyleSheet.create({
  searchContainer: {
    elevation: 2,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
  },
  searchInput: {
    fontSize: 15,
    fontFamily: FONTS.Regular,
    color: COLORS.black,
    opacity: 0.7,
  },
  listStyle: {paddingVertical: 7, marginVertical: 2},
});