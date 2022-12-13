import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const ReplyComments = props => {
  const {replies, UID, songInfo, userDoc} = props;
  const [replyLikes, setReplyLikes] = useState([]);
  const [useReplies, setUserReplies] = useState(null);

  useEffect(() => {
    if (replies && UID) {
      setUserReplies(replies);
      let likesArr = [];
      replies.forEach(reply => {
        if (reply._data.likesArray.includes(UID)) {
          likesArr.push(reply.id);
        }
      });
      setReplyLikes(likesArr);
    }
  }, [replies, UID]);

  useEffect(() => {
    console.log(replyLikes);
  }, [replyLikes]);

  function handleReplyLike(reply) {
    console.log(reply.id);
    if (replyLikes.includes(reply.id)) {
      let filteredLikesArray = replyLikes.filter(id => id != reply.id);
      setReplyLikes(filteredLikesArray);
      let updatedComments = useReplies.map(replyComment => {
        if (replyComment.id === reply.id) {
          reply._data.likeAmount -= 1;
          return reply;
        } else {
          return reply;
        }
      });
      setUserReplies(updatedComments);
      firestore()
        .collection('comments')
        .doc(reply.id)
        .update({
          likeAmount: firestore.FieldValue.increment(-1),
          likesArray: firestore.FieldValue.arrayRemove(UID),
        });
    } else {
      setReplyLikes(current => [...current, reply.id]);
      let updatedComments = useReplies.map(replyComment => {
        if (replyComment.id === reply.id) {
          reply._data.likeAmount += 1;
          return reply;
        } else {
          return reply;
        }
      });
      setUserReplies(updatedComments);
      firestore()
        .collection('comments')
        .doc(reply.id)
        .update({
          likeAmount: firestore.FieldValue.increment(1),
          likesArray: firestore.FieldValue.arrayUnion(UID),
        });

      firestore()
        .collection('users')
        .doc(reply._data.UID)
        .collection('activity')
        .add({
          UID: UID,
          from: 'user',
          type: 'like',
          timestamp: firestore.FieldValue.serverTimestamp(),
          songInfo: songInfo,
          handle: userDoc.handle,
          displayName: userDoc.displayName,
          pfpURL: userDoc?.pfpURL ? userDoc?.pfpURL : null,
          commentDocID: reply.id,
          notificationRead: false,
        })
        .then(() => {
          console.log('added doc to parent user');
        });
    }
  }

  return (
    <View style={styles.replyContainer}>
      {replies ? (
        <>
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
                    <Text style={styles.replyComment}>
                      {reply._data.comment}
                    </Text>
                  </View>
                </View>
                <View style={styles.replyCommentRight}>
                  <TouchableOpacity onPress={() => handleReplyLike(reply)}>
                    <Ionicons
                      style={styles.socialIcon}
                      name={
                        replyLikes.includes(reply.id)
                          ? 'heart'
                          : 'heart-outline'
                      }
                      color={
                        replyLikes.includes(reply.id) ? Colors.red : 'grey'
                      }
                      size={18}
                    />
                  </TouchableOpacity>
                  <Text style={styles.likeAmount}>
                    {reply._data.likeAmount}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      ) : (
        <></>
      )}
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
