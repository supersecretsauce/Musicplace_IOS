import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import Colors from '../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ReplyComments = props => {
  const {replies} = props;
  return (
    <View style={styles.replyContainer}>
      {replies.map((reply, index) => {
        return (
          <View style={styles.replyCommentContainer} key={index}>
            <View style={styles.replyCommentLeft}>
              {reply?._data?.pfpURL ? (
                <Image
                  style={styles.replyProfilePic}
                  source={{
                    uri: reply._data.pfpURL,
                  }}
                />
              ) : (
                <View style={styles.replyProfilePic} />
              )}
              <View style={styles.replyCommentMiddle}>
                <Text style={styles.replyDisplayName}>
                  {reply._data.displayName}
                </Text>
                <Text style={styles.replyComment}>{reply._data.comment}</Text>
              </View>
            </View>
            <View style={styles.replyCommentRight}>
              <TouchableOpacity>
                <Ionicons
                  style={styles.socialIcon}
                  name={'heart-outline'}
                  color={'grey'}
                  size={18}
                />
              </TouchableOpacity>
              <Text style={styles.likeAmount}>{reply._data.likeAmount}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ReplyComments;

const styles = StyleSheet.create({
  replyContainer: {
    marginVertical: 5,
  },
  replyCommentContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'flex-end',
    paddingRight: '4.8%',
  },
  replyCommentLeft: {
    flexDirection: 'row',
  },
  replyProfilePic: {
    height: 28,
    width: 28,
    borderRadius: 28,
    backgroundColor: Colors.red,
  },
  replyCommentMiddle: {
    marginLeft: 12,
  },
  replyDisplayName: {
    color: Colors.greyOut,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  replyComment: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    marginTop: '2%',
    lineHeight: 20,
    fontSize: 12,
  },
  replyCommentRight: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  likeAmount: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    marginTop: 2,
  },
});
