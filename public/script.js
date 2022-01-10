//Disable context menu when user is on resources and file page using jquery
if (
  window.location.pathname.includes("/resources") ||
  window.location.pathname.includes("/file")
) {
  $(document).ready((e) => {
    //disable ctr and shift + i
    $(document).keydown(function (e) {
      if (e.ctrlKey && e.shiftKey && e.keyCode == 73) {
        e.preventDefault();
      }
    });
    $("body").on("contextmenu", (e) => {
      return false;
    });
  });
}

const select = (el, all = false) => {
  el = el.trim();
  if (all) {
    return [...document.querySelectorAll(el)];
  } else {
    return document.querySelector(el);
  }
};

//Easy event listener function

const on = (type, el, listener, all = false) => {
  let selectEl = select(el, all);
  if (selectEl) {
    if (all) {
      selectEl.forEach((e) => e.addEventListener(type, listener));
    } else {
      selectEl.addEventListener(type, listener);
    }
  }
};

//Easy on scroll event listener

const onscroll = (el, listener) => {
  el.addEventListener("scroll", listener);
};

//Navbar links active state on scroll

let navbarlinks = [...$("#navbar .scrollto")];

const navbarlinksActive = () => {
  let position = window.scrollY + 200;
  navbarlinks.forEach((navbarlink) => {
    if (!navbarlink.hash) return;
    let section = select(navbarlink.hash);
    if (!section) return;
    if (
      position >= section.offsetTop &&
      position <= section.offsetTop + section.offsetHeight
    ) {
      navbarlink.classList.add("active");
    } else {
      navbarlink.classList.remove("active");
    }
  });
};
window.addEventListener("load", navbarlinksActive);
onscroll(document, navbarlinksActive);

//Scrolls to an element with header offset

const scrollto = (el) => {
  let header = select("#header");
  let offset = header.offsetHeight;

  if (!header.classList.contains("header-scrolled")) {
    offset -= 20;
  }

  let elementPos = select(el).offsetTop;
  window.scrollTo({
    top: elementPos - offset,
    behavior: "smooth",
  });
};

//Toggle .header-scrolled class to #header when page is scrolled

let selectHeader = select("#header");
if (selectHeader) {
  const headerScrolled = () => {
    if (window.scrollY > 100) {
      selectHeader.classList.add("header-scrolled");
    } else {
      selectHeader.classList.remove("header-scrolled");
    }
  };
  window.addEventListener("load", headerScrolled);
  onscroll(document, headerScrolled);
}

//Back to top button

let backtotop = select(".back-to-top");
if (backtotop) {
  const toggleBacktotop = () => {
    if (window.scrollY > 100) {
      backtotop.classList.add("active");
    } else {
      backtotop.classList.remove("active");
    }
  };
  window.addEventListener("load", toggleBacktotop);
  onscroll(document, toggleBacktotop);
}

//Mobile nav toggle

on("click", ".mobile-nav-toggle", function (e) {
  select("#navbar").classList.toggle("navbar-mobile");
  this.classList.toggle("bi-list");
  this.classList.toggle("bi-x");
});

//Mobile nav dropdowns activate

on(
  "click",
  ".navbar .dropdown > a",
  function (e) {
    if (select("#navbar").classList.contains("navbar-mobile")) {
      e.preventDefault();
      this.nextElementSibling.classList.toggle("dropdown-active");
    }
  },
  true
);

//Scroll with offset on links with a class name .scrollto

on(
  "click",
  ".scrollto",
  function (e) {
    if (select(this.hash)) {
      e.preventDefault();

      let navbar = select("#navbar");
      if (navbar.classList.contains("navbar-mobile")) {
        navbar.classList.remove("navbar-mobile");
        let navbarToggle = select(".mobile-nav-toggle");
        navbarToggle.classList.toggle("bi-list");
        navbarToggle.classList.toggle("bi-x");
      }
      scrollto(this.hash);
    }
  },
  true
);

//Scroll with ofset on page load with hash links in the url

window.addEventListener("load", () => {
  if (window.location.hash) {
    if (select(window.location.hash)) {
      scrollto(window.location.hash);
    }
  }
});

//Testimonials slider

new Swiper(".testimonials-slider", {
  speed: 600,
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  slidesPerView: "auto",
  pagination: {
    el: ".swiper-pagination",
    type: "bullets",
    clickable: true,
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 20,
    },

    1200: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
  },
});

//Animation on scroll

window.addEventListener("load", () => {
  AOS.init({
    duration: 1000,
    easing: "ease-in-out",
    once: true,
    mirror: false,
  });
});

//confirm password

$("#conpassword").on("keyup", (e) => {
  if ($("#password").val() != $("#conpassword").val()) {
    $("#conpassword").addClass("is-invalid");
  } else {
    $("#conpassword").removeClass("is-invalid");
  }
});

//Toast function
const toast = (type, msg, custom = false) => {
  const t = { timeOut: 8000 };

  if (type == "s") {
    toastr.success(msg, t);
  } else if (type == "e") {
    custom
      ? toastr.error(msg, t)
      : toastr.error(`Error: ${msg}\nPlease retry`, t);
  } else if ((type = "w")) {
    toastr.warning(msg, t);
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyBk6YbibhzV6ZNI3x7Gt6v35MjuyfTKkDI",
  authDomain: "study-site-39229.firebaseapp.com",
  projectId: "study-site-39229",
  storageBucket: "study-site-39229.appspot.com",
  messagingSenderId: "259094942872",
  appId: "1:259094942872:web:23b4aa180d5adfdfc5aced",
  measurementId: "G-6C26YRQHP1",
};

// Initialize Firebase

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}



const auth = new firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });
const userRef = db.collection("users");
const resourcesRef = db.collection("resources");
const provider = new firebase.auth.GoogleAuthProvider();
const fieldValue = firebase.firestore.FieldValue;

//Function for adding Data to Storage

const addToStorage = async (ref, file, type = "user") => {
  if (type == "user") {
    const storageRef = storage.ref("UserFiles");

    try {
      storage
        .ref(ref)
        .listAll()
        .then((res) => {
          res.items.map((item) => {
            return item.delete();
          });
        });
    } catch (err) {
      console.log(err.message);
    } finally {
      try {
        const name =
          "Avatar_" + new Date().getTime() + ". " + file.type.split("/")[1];

        const fileRef = storageRef.child(ref + name);
        await fileRef.put(file);
        return await fileRef.getDownloadURL();
      } catch (err) {
        console.log(err);
      }
    }
  } else if (type == "files") {
    const storageRef = storage.ref("Resources");

    try {
      const name =
        "Pdf_" + new Date().getTime() + ". " + file.type.split("/")[1];

      const fileRef = storageRef.child(ref + name);
      await fileRef.put(file);
      return await fileRef.getDownloadURL();
    } catch (err) {
      console.log(err);
    }
  }
};

//Function for adding to database
const addToDB = (email, uid, name, educationLevel, photoURL) => {
  userRef
    .doc(uid)
    .set({
      name,
      email,
      educationLevel,
      photoURL,
      favouriteNotes: [],
      previouslyVisited: [],
      contributions: [],
      created_At: fieldValue.serverTimestamp(),
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
};

//function for replacing url on href

const replaceURL = (path) => {
  const url = window.location.origin + path;

  window.location.replace(url);
};

//Method for auth persist
const authPersist = () => {
  return firebase
    .auth()
    .setPersistence(
      $("#remember").is(":checked")
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION
    );
};

//Method for saving  User data to local storage
const localSet = (data) => {
  localStorage.setItem("userData", JSON.stringify(data));
};

if (
  localStorage.getItem("userData") &&
  window.location.pathname != "/user-dashboard"
) {
  const { uid } = JSON.parse(localStorage.getItem("userData"));

  $("#user-id").val(uid);
}
//Method for getting data from local storage and updating dashboard View

const localGet = (redirect) => {
  const data = localStorage.getItem("userData");
  if (!data) {
    if (redirect) replaceURL("/login");
    return toast("w", "Please log In to continue");
  } else {
    const { email, name, photoURL, educationLevel, emailVerified } =
      JSON.parse(data);

    if (!emailVerified) {
      toast("w", "Please Verify your email to continue");
      replaceURL("/login");
      return;
    }

    if (!window.location.pathname.includes("/user-dashboard"))
      replaceURL("/user-dashboard");

    $(".name-cont").removeClass("d-none");
    $(".u-name").text(name);
    $(".u-email").text(email);
    $("#u-image").attr("src", photoURL);
    $("#u-image").removeClass("d-none");
    $(".class-cont").removeClass("d-none");
    $(".u-class").text(educationLevel);

    loader(true);

    if (email != "sta98no@gmail.com") {
      !emailVerified
        ? $(".not-verified").removeClass("d-none")
        : $(".not-verified").addClass("d-none");
    } else {
      $(".upload-container").removeClass("d-none");
    }
  }
};

//Function for calling loader
const loader = (add) =>
  add ? $(".loader").addClass("d-none") : $(".loader").removeClass("d-none");

//Auth Class to handle User Authentication
class Auth {
  signIn(email, password) {
    authPersist().then(() => {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((res) => {
          getUser();
        })
        .catch((error) => {
          const { message } = error;

          loader(true);
          message.includes("There is no user record corresponding")
            ? $(".user-not-found").removeClass("d-none")
            : toast("e", message);
        });
    });
  }

  signUp(email, eduLevel, name, password) {
    authPersist()
      .then(() => {
        auth
          .createUserWithEmailAndPassword(email, password)
          .then(async (userCredential) => {
            const user = userCredential.user;
            const photoURL = "https://randomuser.me/api/portraits/lego/5.jpg";

            const { emailVerified, uid } = user;
            addToDB(email, uid, name, eduLevel, photoURL);
            const userData = {
              email,
              name,
              photoURL,
              educationLevel: eduLevel,
              emailVerified,
              uid,
            };

            await user.updateProfile({
              displayName: name,
              photoURL,
            });

            await user.sendEmailVerification();

            if (!user.emailVerified) {
              loader(true);
              toast(
                "s",
                "Success: Please Verify your email Address to continue"
              );
              setTimeout(() => {
                replaceURL("/login");
              }, 3000);
            }
          })
          .catch((error) => {
            const { message } = error;
            loader(true);

            message.includes("The email address is already in use")
              ? $(".email-taken").removeClass("d-none")
              : toast("e", message);
          });
      })
      .catch((err) => {
        toast("e", err.message);
      });
  }

  gmailAuth(provider) {
    authPersist()
      .then(() => {
        auth
          .signInWithPopup(provider)
          .then(async (result) => {
            const {
              displayName: name,
              email,
              photoURL,
              uid,
              emailVerified,
            } = result.user;

            //Check if user does not exist aand add data else just redirect to dashboard
            await userRef
              .doc(uid)
              .get()
              .then((doc) => {
                //Assign education level if user exists

                if (doc.exists) {
                  const { educationLevel, photoURL } = doc.data();
                  const userData = {
                    email,
                    name,
                    photoURL,
                    educationLevel,
                    emailVerified,
                    uid,
                  };

                  emailVerified
                    ? localSet(userData)
                    : toast("w", "Please Verify your email to continue");
                } else {
                  const educationLevel = "";
                  addToDB(email, uid, name, educationLevel, photoURL);
                  const userData = {
                    email,
                    name,
                    photoURL,
                    educationLevel,
                    emailVerified,
                    uid,
                  };

                  emailVerified
                    ? localSet(userData)
                    : toast("w", "Please Verify your email to continue");
                }
              })
              .catch((err) => {
                toast("e", err.message);
              });
            return emailVerified;
          })
          .then((verified) => {
            if (verified) {
              toast("s", "Please wait as we redirect you");

              setTimeout(() => {
                replaceURL("/user-dashboard");
              }, 2000);
            }
          })
          .catch((err) => {
            err.message.includes("Duplicate")
              ? getUser()
              : toast("e", err.message);
          });
      })
      .catch((err) => toast("e", err.message));
  }

  resetPassword(email) {
    auth
      .sendPasswordResetEmail(email)
      .then((e) =>
        toast(
          "s",
          "Please check email for verification Link sent to your email"
        )
      )
      .catch((err) => {
        message.includes("There is no user record corresponding")
          ? $(".user-not-found").removeClass("d-none")
          : toast("e", err.message);
      });
  }
}

// Get Curret User Infor

const getUser = (redirect) => {
  auth.onAuthStateChanged((user) => {
    const { emailVerified, uid } = user;
    $("#user-id").val(uid);
    userRef
      .doc(uid)
      .get()
      .then((doc) => {
        const { email, educationLevel, name, photoURL } = doc.data();

        const userData = {
          uid,
          email,
          educationLevel,
          name,
          photoURL,
          emailVerified,
        };
        if (emailVerified) localSet(userData);
        if (!emailVerified) {
          toast("w", "Please Verify your email to continue");

          if (window.location.pathname.includes("/login")) return loader(true);
          replaceURL("/login");
          return;
        }
        emailVerified && localGet(redirect);
      });
  });
};

$("#dash").click((e) => {
  e.preventDefault();
  localGet();
});

if (window.location.pathname.includes("/user-dashboard")) {
  localGet(true);
  window.addEventListener("load", (e) => {
    getUser(true);
  });
}

//Redirect admin to upload page on click

$("#upload-btn").click((e) => {
  e.preventDefault();
  replaceURL("/upload");
});

const EmailAuth = new Auth();
const GmailAuth = new Auth();

//Email Sign Up
$(".sign-up-form").submit((e) => {
  e.preventDefault();
  if ($("#password").val() != $("#conpassword").val()) {
    $(".conpass-error").removeClass("d-none");
  } else {
    if ($("#agree").is(":checked")) {
      loader(false);
      EmailAuth.signUp(
        $("#email").val(),
        $("#edu-level").val(),
        $("#name").val(),
        $("#password").val()
      );
    } else {
      $(".agree-error").removeClass("d-none");
    }
  }
});

$("#agree").change((e) => {
  if ($("#agree").is(":checked")) $(".agree-error").addClass("d-none");
});

// const verifyHumanity = () => {
//   // const secret = '6LezxQAeAAAAAJRh3PKgzA71SPF0hwzYqN8uD9lg'
//  const res =  $('#g-recaptcha-response').val()
//  console.log(res)
//  //Send data to server

// if(res == null || res == '' || res == undefined){
//   toast("w", "Please check the recaptcha checkbox To continue")
//   loader(true)
//   return false
// }
// // const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${res}`

// fetch('/humanity-test', {
//   method: 'POST',
//   headers: {

//     'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       response: res
//       })
//   })
//   .then(res => res.json())
//   .then(data => {
//     if(data.success){
//       loader(true)
//       return true
//     }else{
//       toast("w", "An error Ocurred")
//       loader(true)
//       return false
//     }
//   }).catch(err => console.log(err))

//   // fetch(url,
//   // {
//   //   method: 'POST',
//   //   headers: {
//   //     'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
//   //     'Access-Control-Request-Headers': 'X-Requested-With',
//   //     'Access-Control-Allow-Methods': 'POST',
//   //     'Access-Control-Allow-Origin': 'https://study-site1.herokuapp.com/',
//   //     'Access-Control-Allow-Headers': 'Content-Type, Authorization'
//   //   }

//   //   }).then(response => response.json())
//   //   .then(data => {
//   //     if(data.success){
//   //       return true
//   //     }else{
//   //       toast("e", "Failed Captcha verification")
//   //       loader(true)
//   //       return false
//   //     }
//   //   }
//   // ).catch(err => {
//   //   toast("e", "An error occured")
//   //   loader(true)
//   //   return false
//   // }
//   // )

// }

// Email Log In
$(".log-in-form").submit((e) => {
  e.preventDefault();
  $(".user-not-found").addClass("d-none");
  loader(false);
  EmailAuth.signIn($("#email").val(), $("#password").val());
});

//Log Out
$("document").ready((e) => {
  $("#log-out-btn").click((e) => {
    e.preventDefault;
    auth
      .signOut()
      .then(() => {
        localStorage.clear();
        replaceURL("");
      })
      .catch((err) => toast("e", err.message));

    $("#email").focus((e) => {
      $(".user-not-found").addClass("d-none");
    });
  });
});

$("#edu-level, #edu-level-log-in").change((e) => {
  if ($("#edu-level, #edu-level-log-in").val() != "") {
    $(".edulevel-error").addClass("d-none");
  } else {
    $(".edulevel-error").removeClass("d-none");
  }
});

$(".agree-error").change((e) => {
  if (this.checked) {
    $(".agree-error").aaddClass("d-none");
  }
});

// Google Sign Up

$("#g-signup").click((e) => {
  e.preventDefault();

  if ($("#edu-level").val() == "") {
    $(".edulevel-error").removeClass("d-none");
  } else {
    GmailAuth.gmailAuth(provider);
  }
});
// Google Log Im
$("#g-login").click((e) => {
  e.preventDefault();

  GmailAuth.gmailAuth(provider);
});

//RESET PASSWORD

$(".reset-pass-form").submit((e) => {
  e.preventDefault();
  const email = e.target[0].value;
  EmailAuth.resetPassword(email);
});



//Resend Verification Email

$("document").ready((e) => {
  $("#resend").click(async (e) => {
    e.preventDefault();

    const user = await auth.currentUser;
    user
      .sendEmailVerification()
      .then((e) => toast("s", "A Verification Email has been sent."))
      .catch((err) => toast("e", err.message));
  });
});

//password type toggle

$("#togglePassword").click(() => {
  const type = $("#password").attr("type") == "password" ? "text" : "password";

  $("#password").attr("type", type);
  $("#conpassword").attr("type", type);

  $("#togglePassword")
    .attr("class")
    .split(" ")
    .forEach((e) => {
      if (e == "bi-eye-slash") {
        $("#togglePassword").removeClass("bi-eye-slash").addClass("bi-eye");
      } else if (e == "bi-eye") {
        $("#togglePassword").removeClass("bi-eye").addClass("bi-eye-slash");
      }
    });
});

//EDIT PROFILE

$("document").ready((e) => {
  $("#contribute").click((e) => {
    $(".int-modal").css("display", "block");
  });

  $(".edit-profile-btn").click((e) => {
    $(".u-modal").css("display", "block");

    $("#user-up-email").html(email);
  });

  $(".close-modal").click(() => {
    $(".modal").css("display", "none");
  });

  $(window).click((e) => {
    if (e.target.classList[1] == "modal") {
      $(".modal").css("display", "none");
    }
  });

  //Upload PDF files to storage and add link to Database

  $(".upload-form").submit(async (e) => {
    e.preventDefault();

    const {
      0: userIdEl,
      1: fileEl,
      2: titleEl,
      3: classEl,
      4: subjectEl,
      5: descriptionEl,
    } = e.target;
    const files = fileEl.files;
    const titles = titleEl.value.split(",");
    const classes = classEl.value.split(",");
    const subjects = subjectEl.value.split(",");
    const descriptions = descriptionEl.value.split(",");
    const fileArr = Object.values(files);
    const userId = userIdEl.value;

    if (
      titles.length == descriptions.length &&
      fileArr.length == descriptions.length &&
      fileArr.length == titles.length &&
      fileArr.length == classes.length &&
      fileArr.length == subjects.length
    ) {
      $(".upload-form")[0].reset();

      loader(false);

      for (i = 0; i < fileArr.length; i++) {
        const fileURL = await addToStorage(
          "pdf-files/",
          fileArr[i],
          (type = "files")
        );

        const title = titles[i];
        const description = descriptions[i];
        const className = classes[i];
        const subject = subjects[i];

        await db
          .collection("resources")
          .add({
            title,
            description,
            fileURL,
            className,
            subject,
            created_At: fieldValue.serverTimestamp(),
          })
          .then(async (e) => {
            if (userId != "") {
              await db
                .collection("users")
                .doc(userId)
                .update({
                  contributions: firebase.firestore.FieldValue.arrayUnion({
                    id: e.id,
                    title,
                  }),
                });
            }

            if (i == fileArr.length - 1) {
              loader(true);
              toast("s", "Successfully uploaded data to firebase");
            }
          })
          .catch((err) => {
            if (i == fileArr.length - 1) {
              loader(true);
              toast("e", err.message);
            }

            console.error("Error writing document: ", error);
          });
      }
    } else {
      toast(
        "e",
        "Please Ensure that there are equal titles, descriptions and images",
        (custom = true)
      );
    }
  });

  //Updating User data

  $(".update-form").submit((e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const name = e.target[1].value;
    const educationLevel = e.target[2].value;
    const file = e.target[3].files[0];

    $(".update-form")[0].reset();
    $(".infor-update-loader, .updating").removeClass("d-none");

    const updateProfile = (user, authData, dbData) => {
      user.updateProfile(authData).then(() => {
        userRef
          .doc(user.uid)
          .update(dbData)
          .then((e) => {
            $(".infor-update-loader, .updating").addClass("d-none");
            toast("s", "Profile Updated Successfully.");
            getUser();
          })
          .catch((err) => toast("e", err.message));
      });
    };

    const dbUpdate = (user, data) => {
      $(".infor-update-loader, .updating").removeClass("d-none");

      userRef
        .doc(user.uid)
        .update(data)
        .then((e) => {
          $(".infor-update-loader, .updating").addClass("d-none");

          toast("s", "Profile Updated Successfully.");
          getUser();
        })
        .catch((err) => {
          $(".infor-update-loader, .updating").addClass("d-none");

          toast("e", err.message);
        });
    };

    auth.onAuthStateChanged(async (user) => {
      if (email) {
        auth.currentUser.updateEmail(email);
        updateProfile(user, { email }, { email });
      }
      if (name) {
        updateProfile(user, { displayName: name }, { name });
      }
      if (educationLevel) {
        dbUpdate(user, { educationLevel });
      }
      if (file) {
        const photoURL = await addToStorage(
          user.uid + "/profilePicture/",
          file
        );
        updateProfile(user, { photoURL }, { photoURL });
      }
      if (email && name && educationLevel && file) {
        updateProfile(
          user,
          { displayName: name, email, photoURL },
          { name, email, educationLevel, photoURL }
        );
      }
    });
  });
});

//FILE

const addToDashView = (data, prev) => {
  const { id, title } = data;

  const cardData = `
       <div>
     <a href='#'  id=${id} onclick="toFile(this)"><img  src='/assets/img/graduation-illustration.png' class="img-fluid img-thumbnail file-img" alt="Graduation Image" height="100" /> </a>
     <h3 class="file-title">${title}</h3>
    </div>
  </div>
           `;

  if (prev) {
    $(".prev-holder").append(cardData);
  } else {
    $(".fave-load").addClass("d-none");
    $(".fave-holder").append(cardData);
  }
};

const handleLikeAction = (id, collRef) => {
  $(".fav-icon").addClass("d-none");
  $(".fav-spin").removeClass("d-none");
  resourcesRef
    .doc(id)
    .get()
    .then((doc) => {
      const { title, fileURL } = doc.data();
      const faveData = { id, fileURL, title };
      if ($(".fav-icon").hasClass("bi-heart")) {
        collRef
          .update({
            favouriteNotes: firebase.firestore.FieldValue.arrayUnion(faveData),
          })
          .then((e) => {
            $(".fav-spin").addClass("d-none");
            $(".fav-icon").removeClass("d-none");
            $(".fav-icon").removeClass("bi-heart").addClass("bi-heart-fill");
          })
          .catch((err) => {
            toast("e", err.message);
            $(".fav-spin").addClass("d-none");

            $(".fav-icon").removeClass("d-none");
            $(".fav-icon").addClass("bi-heart").removeClass("bi-heart-fill");
          });
      } else {
        collRef
          .update({
            favouriteNotes: firebase.firestore.FieldValue.arrayRemove(faveData),
          })
          .then((e) => {
            $(".fav-spin").addClass("d-none");
            $(".fav-icon").removeClass("d-none");
            $(".fav-icon").addClass("bi-heart").removeClass("bi-heart-fill");
          })
          .catch((err) => {
            $(".fav-spin").addClass("d-none");
            $(".fav-icon").removeClass("d-none");
            $(".fav-icon").addClass("bi-heart").removeClass("bi-heart-fill");
            console.log(err);
          });
      }
    })

    .catch((err) => {
      toast("e", err.message);
      $(".fav-spin").addClass("d-none");

      $(".fav-icon").removeClass("d-none");
      $(".fav-icon").addClass("bi-heart").removeClass("bi-heart-fill");
    });
};

const favouriteFileHandler = (onLoad,  click) => {
  if (!localStorage.getItem("userData")) return;
  const { uid } = JSON.parse(localStorage.getItem("userData"));
const currPage = 1;
  const id = localStorage.getItem("fileId");
  const collRef = userRef.doc(uid);
  const startAt = (currPage - 1) * 2,
    endAt = 2 * currPage;

    if(click){
      handleLikeAction(id, collRef);
    }

  collRef
    .get()
    .then((doc) => {
      const fNotes = doc.data().favouriteNotes;
      const prev = doc.data().previouslyVisited;
      const contributions = doc.data().contributions;

      if (contributions.length == 0) {
        $(".contributions-loader").addClass("d-none");
        $(".contribution-info-cont").html(
          "<h4 class='text-center text-info'>There's Nothing In This View</h4>"
        );
      } else {
        $(".contributions-loader").addClass("d-none");
        contributions.map((file) => {
          const { id, title } = file;

          $(".contribution-info-cont").append(`
       <div class="mb-2" >
     <a href='#'  id=${id} onclick="toFile(this)"><img  src='/assets/img/graduation-illustration.png' class="img-fluid img-thumbnail file-img" alt="Graduation Image" height="100" /> </a>
     <h3 class="file-title">${title}</h3>
    </div>
  </div>
           `);
        });
      }
      if (prev.length == 0) {
        $(".prev-load").addClass("d-none");
        $(".prev-holder").html(
          "<h4 class='text-center text-info'>There's Nothing In This View</h4>"
        );
      } else {
        const slicedData = prev.slice(startAt, endAt);

        $(".prev-load").addClass("d-none");
        slicedData.map((file) => addToDashView(file, true));

        if (prev.length > 2) {
          $("#prev-btns").pagination({
            total: prev.length,
            ...jqueryPaginationData,
            length: 2,
            click: function (e) {
              $(".prev-holder").empty();
              $(".prev-load").removeClass("d-none");
              const slicedData = prev.slice((e.current - 1) * 2, 2 * e.current);
              $(".prev-load").addClass("d-none");
              for (let file of slicedData) {
                addToDashView(file, true);
              }
            },
          });
        }
      }

      if (fNotes.length == 0) {
        $(".fave-load").addClass("d-none");
        $(".fave-holder").html(
          "<h4 class='text-center text-info'>There's Nothing In This View</h3>"
        );
      } else {
        const slicedData = fNotes.slice(startAt, endAt);
        slicedData.map((file) => addToDashView(file, false));

        $("#fave-btns").pagination({
          total: fNotes.length,
          ...jqueryPaginationData,
          length: 2,
          click: function (e) {
            $(".fave-holder").empty();
            $(".fave-load").removeClass("d-none");
            const slicedData = fNotes.slice((e.current - 1) * 2, 2 * e.current);
            slicedData.map((file) => addToDashView(file, false));
          },
        });
      }

      if (onLoad) {
        for (let i of fNotes) {
          if (i.id == id) {
            $(".fav-icon").hasClass("bi-heart") &&
              $(".fav-icon").removeClass("bi-heart").addClass("bi-heart-fill");
          }
        }

        return;
      }
    })
    .catch((e) => toast("e", err.message));
};

if (
  window.location.pathname.includes("/file") ||
  window.location.pathname.includes("/user-dashboard")
) {
  favouriteFileHandler(true, false);
}

$(".fav-icon").click((e) => {
  if (!localStorage.getItem("userData"))
    return toast("w", "Please log in to continue");
  favouriteFileHandler(false, true);
});

//Add Loading skeleton to Resources page  View

let i = 0;
while (i < 3) {
  $(".skeleton-loader-resources").append(
    ` <div>
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
  </div>`
  );
  i++;
}

//Pagination

//Add Data from database to View
const addToView = (doc, search = false) => {
  const resourcesContainer = $(".main-content");
  const { title, description, created_At, subject, className } = search
    ? doc.data
    : doc.data();
  const id = doc.id;

  const cardData = `
       <div>
     <a href='#' id=${id} onclick="toFile(this)"><img  src='/assets/img/graduation-illustration.png' class="img-fluid img-thumbnail file-img" alt="Graduation Image"  height="100" /> </a>
     <h3>${title}</h3>
      <p>
        <b>Subject:</b>
        <span>${subject}</span>
      </p>
      <p>
        <b>Class:</b>
        <span>${className}</span>
      </p>
       <p>
        <b>Description:</b>
        <span>${description}</span>
      </p>  
      <p class='d-none doc-id'>${id}</p>
    </div>
  </div>
           `;

  resourcesContainer.append(cardData);
};

//initialize first instance of Fuse js search
var fuse;

const fetchData = (currPage) => {
  const field = "created_At";
  const pageSize = 6;
  const startAt = (currPage - 1) * pageSize;
  const endAt = pageSize * currPage;

  //fetch all the documents

  resourcesRef
    .orderBy(field)
    .get()
    .then((allDocs) => {
      const docs = allDocs.docs;

      const fuseData = docs.map((doc) => {
        return { id: doc.id, data: doc.data() };
      });
      fuse = new FuseSearch(fuseData, {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["data.title", "data.description"],
      });

      $(".main-content").empty();
      const slicedDocs = docs.slice(startAt, endAt);
      $(".skeleton-loader-resources").addClass("d-none");
      slicedDocs.map((doc) => addToView(doc));
    })
    .catch((err) => {
      const msg = err.message;
      msg.includes("Could not reach Firesto")
        ? toast("e", "Please check your intenet connectivity", (custom = true))
        : toast("e", msg);
      $(".skeleton-loader-resources").removeClass("d-none");
    });
};

//jquery pagination.js

///*********** Content Search ******************//
class FuseSearch {
  constructor(data, options) {
    this.data = data;
    this.options = options;
    this.fuse = new Fuse(this.data, this.options);
  }

  search(query) {
    return this.fuse.search(query);
  }

  getLength() {
    return this.fuse.getIndex().size();
  }
}

//Create an instance of fuse js search passing in the data from the database and options

const jqueryPaginationData = {
  current: 1,
  length: 6,
  size: 2,
  prev: "&lt;",
  next: "&gt;",
};

const btnCont = $("#pagination-btns");

const pageBtns = (search = false, searchResults) => {
  if (search) {
    btnCont.empty();
    btnCont.pagination({
      total: searchResults.length,
      ...jqueryPaginationData,
      click: function (e) {
        fetchData(e.current, search, searchResults);
      },
    });
    return;
  }
  resourcesRef.get().then((allDocs) => {
    btnCont.pagination({
      total: allDocs.size,
      ...jqueryPaginationData,
      click: function (e) {
        fetchData(e.current);
      },
    });
  });
};

const fetchPageData = (val, search, data) => {
  $(".skeleton-loader-resources").removeClass("d-none");
  $(".main-content").empty();
  if (!search) return fetchData(val);
  const searchPageData = data.slice((pageNumber - 1) * 6, pageNumber * 6);
  searchPageData.map((doc) => addToView(doc.item, search));
};

fetchData(1);
pageBtns();

const toFile = (e) => {
  const fileId = e.id;
  const fileURL = $(e).attr("id");
  localStorage.setItem("fileId", fileId);
  if (!localStorage.getItem("userData")) {
    replaceURL("/file");
    return;
  }

  const { uid } = JSON.parse(localStorage.getItem("userData"));

  replaceURL("/file");
};

const filePageHandler = () => {
  if (!window.localStorage) {
    toast("e", "Please enable local storage to download files");
    return;
  }
  const id = localStorage.getItem("fileId");

  resourcesRef
    .doc(id)
    .get()
    .then((doc) => {
      const { title, fileURL } = doc.data();
      setTimeout(() => {
        $(".file-loader").addClass("d-none");
        $(".resource-container").removeClass("d-none");
        $(".file-title").text(title);
      }, 4000);

      $(".file-img").attr("src", fileURL);
      $(".file-img").attr("alt", title);

      if (!localStorage.getItem("userData")) {
        return;
      }

      const { uid } = JSON.parse(localStorage.getItem("userData"));
      const collRef = userRef.doc(uid);

      collRef.get().then((doc) => {
        const { previouslyVisited } = doc.data();
        const data = { id, fileURL, title };

        for (let i of previouslyVisited) {
          if (i.id == id) {
            return;
          }
        }
        //Add data to beggining of array
        const length = previouslyVisited.unshift(data);
        length > 6 && previouslyVisited.pop();
        collRef.update({ previouslyVisited });
      });
    })
    .catch((err) => {
      toast("e", "Could not load file, please retry", (custom = true));
      setTimeout(() => {
        replaceURL("/resources");
      }, 2000);
    });
};

if (window.location.pathname.includes("/file")) {
  filePageHandler();
}

//Function for searching data on input change and populate the view
const searchData = (value) => {
  if (value === "") {
    $(".skeleton-loader-resources").removeClass("d-none");
    $(".main-content").empty();
    pageBtns();
    return fetchData(1);
  }
  btnCont.empty();
  $(".skeleton-loader-resources").removeClass("d-none");
  const searchResults = fuse.search(value);

  $(".main-content").empty();
  if (searchResults.length === 0) {
    $(".skeleton-loader-resources").addClass("d-none");
    $(".main-content").html(`<h3>No results found</h3>`);
    btnCont.empty();
    return;
  }
  $(".skeleton-loader-resources").addClass("d-none");
  const slicedRes = searchResults.slice(0, 6);
  slicedRes.map((doc) => addToView(doc.item, (search = true)));

  if (searchResults.length > 6) pageBtns((search = true), searchResults);
};

//Listen for change on resource search input and update View
$("#resource-search").on("input", (e) => {
  searchData(e.target.value);
});

//Jquery Pagination

!(function (a) {
  "use strict";
  "function" == typeof define && define.amd
    ? define(["jquery"], a)
    : "function" == typeof define && define.cmd
    ? define(function (b, c, d) {
        a(b("jquery"));
      })
    : a(jQuery);
})(function (a) {
  "use strict";
  var b = function (c, d) {
    (this.$target = c),
      (this.options = a.extend(
        {},
        b.DEFAULTS,
        this.$target.data("pagination"),
        "object" == typeof d && d
      )),
      this.init();
  };
  (b.VERSION = "1.4.0"),
    (b.DEFAULTS = {
      total: 1,
      current: 1,
      length: 10,
      size: 2,
      prev: "&lt;",
      next: "&gt;",
      click: function (a) {},
    }),
    (b.prototype = {
      init: function () {
        if (
          (this.options.total < 1 && (this.options.total = 1),
          this.options.current < 1 && (this.options.current = 1),
          this.options.length < 1 && (this.options.length = 1),
          this.options.current >
            Math.ceil(this.options.total / this.options.length) &&
            (this.options.current = Math.ceil(
              this.options.total / this.options.length
            )),
          this.options.size < 1 && (this.options.size = 1),
          "function" == typeof this.options.ajax)
        ) {
          var a = this;
          this.options.ajax(
            {
              current: a.options.current,
              length: a.options.length,
              total: a.options.total,
            },
            function (b) {
              return a.refresh(b);
            },
            a.$target
          );
        } else this.render();
        this.onClick();
      },
      render: function () {
        var a = this.options,
          b = this.$target;
        b.empty(),
          b.append(
            '<li><a herf="javascript:void(0)" data-page="prev">' +
              a.prev +
              "</a></li>"
          );
        var c = this.getPages();
        c.start > 1 &&
          (b.append(
            '<li><a herf="javascript:void(0)" data-page="1">1</a></li>'
          ),
          b.append("<li><span>...</span></li>"));
        for (var d = c.start; d <= c.end; d++)
          b.append(
            '<li><a herf="javascript:void(0)" data-page="' +
              d +
              '">' +
              d +
              "</a></li>"
          );
        c.end < Math.ceil(a.total / a.length) &&
          (b.append("<li><span>...</span></li>"),
          b.append(
            '<li><a herf="javascript:void(0)" data-page="' +
              Math.ceil(a.total / a.length) +
              '">' +
              Math.ceil(a.total / a.length) +
              "</a></li>"
          )),
          b.append(
            '<li><a herf="javascript:void(0)" data-page="next">' +
              a.next +
              "</a></li>"
          ),
          b
            .find('li>a[data-page="' + a.current + '"]')
            .parent()
            .addClass("active"),
          a.current <= 1 &&
            b.find('li>a[data-page="prev"]').parent().addClass("disabled"),
          a.current >= Math.ceil(a.total / a.length) &&
            b.find('li>a[data-page="next"]').parent().addClass("disabled");
      },
      getPages: function () {
        var a = (this.$target, this.options),
          b = a.current - a.size,
          c = a.current + a.size;
        return (
          a.current >= Math.ceil(a.total / a.length) - a.size &&
            (b -= a.current - Math.ceil(a.total / a.length) + a.size),
          a.current <= a.size && (c += a.size - a.current + 1),
          b < 1 && (b = 1),
          c > Math.ceil(a.total / a.length) &&
            (c = Math.ceil(a.total / a.length)),
          { start: b, end: c }
        );
      },
      onClick: function () {
        var b = this.$target,
          c = this.options,
          d = this;
        b.off("click"),
          b.on("click", ">li>a[data-page]", function (e) {
            if (
              !a(this).parent().hasClass("disabled") &&
              !a(this).parent().hasClass("active")
            ) {
              var f = a(this).data("page");
              switch (f) {
                case "prev":
                  c.current > 1 && c.current--;
                  break;
                case "next":
                  c.current < Math.ceil(c.total) && c.current++;
                  break;
                default:
                  (f = parseInt(f)), isNaN(f) || (c.current = parseInt(f));
              }
              var g = { current: c.current, length: c.length, total: c.total };
              "function" == typeof c.ajax
                ? c.ajax(
                    g,
                    function (a) {
                      return d.refresh(a);
                    },
                    b
                  )
                : d.render(),
                c.click(g, b);
            }
          });
      },
      refresh: function (a) {
        "object" == typeof a &&
          (a.total && (this.options.total = a.total),
          a.length && (this.options.length = a.length)),
          this.render();
      },
    }),
    (a.fn.pagination = function (c) {
      return (
        this.each(function () {
          a(this).data("pagination", new b(a(this), c));
        }),
        this
      );
    });
});

if (window.location.href.includes("dashboard")) {
  $(document).ready(() => {
    !(function (a) {
      "use strict";
      "function" == typeof define && define.amd
        ? define(["jquery"], a)
        : "function" == typeof define && define.cmd
        ? define(function (b, c, d) {
            a(b("jquery"));
          })
        : a(jQuery);
    })(function (a) {
      "use strict";
      var b = function (c, d) {
        (this.$target = c),
          (this.options = a.extend(
            {},
            b.DEFAULTS,
            this.$target.data("pagination"),
            "object" == typeof d && d
          )),
          this.init();
      };
      (b.VERSION = "1.4.0"),
        (b.DEFAULTS = {
          total: 1,
          current: 1,
          length: 10,
          size: 2,
          prev: "&lt;",
          next: "&gt;",
          click: function (a) {},
        }),
        (b.prototype = {
          init: function () {
            if (
              (this.options.total < 1 && (this.options.total = 1),
              this.options.current < 1 && (this.options.current = 1),
              this.options.length < 1 && (this.options.length = 1),
              this.options.current >
                Math.ceil(this.options.total / this.options.length) &&
                (this.options.current = Math.ceil(
                  this.options.total / this.options.length
                )),
              this.options.size < 1 && (this.options.size = 1),
              "function" == typeof this.options.ajax)
            ) {
              var a = this;
              this.options.ajax(
                {
                  current: a.options.current,
                  length: a.options.length,
                  total: a.options.total,
                },
                function (b) {
                  return a.refresh(b);
                },
                a.$target
              );
            } else this.render();
            this.onClick();
          },
          render: function () {
            var a = this.options,
              b = this.$target;
            b.empty(),
              b.append(
                '<li><a herf="javascript:void(0)" data-page="prev">' +
                  a.prev +
                  "</a></li>"
              );
            var c = this.getPages();
            c.start > 1 &&
              (b.append(
                '<li><a herf="javascript:void(0)" data-page="1">1</a></li>'
              ),
              b.append("<li><span>...</span></li>"));
            for (var d = c.start; d <= c.end; d++)
              b.append(
                '<li><a herf="javascript:void(0)" data-page="' +
                  d +
                  '">' +
                  d +
                  "</a></li>"
              );
            c.end < Math.ceil(a.total / a.length) &&
              (b.append("<li><span>...</span></li>"),
              b.append(
                '<li><a herf="javascript:void(0)" data-page="' +
                  Math.ceil(a.total / a.length) +
                  '">' +
                  Math.ceil(a.total / a.length) +
                  "</a></li>"
              )),
              b.append(
                '<li><a herf="javascript:void(0)" data-page="next">' +
                  a.next +
                  "</a></li>"
              ),
              b
                .find('li>a[data-page="' + a.current + '"]')
                .parent()
                .addClass("active"),
              a.current <= 1 &&
                b.find('li>a[data-page="prev"]').parent().addClass("disabled"),
              a.current >= Math.ceil(a.total / a.length) &&
                b.find('li>a[data-page="next"]').parent().addClass("disabled");
          },
          getPages: function () {
            var a = (this.$target, this.options),
              b = a.current - a.size,
              c = a.current + a.size;
            return (
              a.current >= Math.ceil(a.total / a.length) - a.size &&
                (b -= a.current - Math.ceil(a.total / a.length) + a.size),
              a.current <= a.size && (c += a.size - a.current + 1),
              b < 1 && (b = 1),
              c > Math.ceil(a.total / a.length) &&
                (c = Math.ceil(a.total / a.length)),
              { start: b, end: c }
            );
          },
          onClick: function () {
            var b = this.$target,
              c = this.options,
              d = this;
            b.off("click"),
              b.on("click", ">li>a[data-page]", function (e) {
                if (
                  !a(this).parent().hasClass("disabled") &&
                  !a(this).parent().hasClass("active")
                ) {
                  var f = a(this).data("page");
                  switch (f) {
                    case "prev":
                      c.current > 1 && c.current--;
                      break;
                    case "next":
                      c.current < Math.ceil(c.total) && c.current++;
                      break;
                    default:
                      (f = parseInt(f)), isNaN(f) || (c.current = parseInt(f));
                  }
                  var g = {
                    current: c.current,
                    length: c.length,
                    total: c.total,
                  };
                  "function" == typeof c.ajax
                    ? c.ajax(
                        g,
                        function (a) {
                          return d.refresh(a);
                        },
                        b
                      )
                    : d.render(),
                    c.click(g, b);
                }
              });
          },
          refresh: function (a) {
            "object" == typeof a &&
              (a.total && (this.options.total = a.total),
              a.length && (this.options.length = a.length)),
              this.render();
          },
        }),
        (a.fn.pagination = function (c) {
          return (
            this.each(function () {
              a(this).data("pagination", new b(a(this), c));
            }),
            this
          );
        });
    });
  });
}
