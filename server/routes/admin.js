const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin';

const jwtSecret = process.env.JWT_SECRET;

/**
 * 
 * check login
*/
const authMiddleware = (req, res, next ) => {
    const token = req.cookies.token;
    if (!token) {
        return res. status(401).json( { message: 'unauthorized' } );        
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    }catch(error){
        res. status(401).json( { message: 'unauthorized' } );        
    }
}










/**
 * GET /
 * admin -login
*/
router.get('/admin', async (req, res) => {
 try {
    const locals = {
        title: "Admin",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }

});


/**
 * post /
 * admin -check login
*/

router.post('/admin', async (req, res) => {
    try {
       const { username, password } = req.body;
       
       const user = await User.findOne( { username });
       if(!user) {
        return res.status(401).json( { message: 'invalid data' } );
       }

       const isPasswordVaild = await bcrypt.compare(password,user.password);
       if (!isPasswordVaild) {
        return res.status(401).json( { message: 'invalid data' } );
       }

       const token = jwt.sign({ userId: user._id }, jwtSecret );
       res.cookie('token', token, { httpOnly: true });
       res.redirect('/dashboard');

     } catch (error) {
       console.log(error);
     }
   
   });
/**
 * get /
 * admin -dash board
*/

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
          }




        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }

});

/**
 * get /
 * admin -create new post
*/

router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
          }

        const data = await Post.find();
        res.render('admin/add-post',{
            locals,
            layout: adminLayout
            
        });
    } catch (error) {
        console.log(error);
    }

});
/**
 * post /
 * admin -create new post
*/

router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body,

            });
            await Post.create(newPost);
            res.redirect('/dashboard');

        } catch (error) {
            console.log(error)
        }

    } catch (error) {
        console.log(error);
    }


});
/**
 * get /
 * admin -create new post
*/

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
          };
        const data = await Post.findOne({ _id: req.params.id });
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
        
    } catch (error) {
        console.log(error);
    }
});
/**
 * put /
 * admin -create new post
*/

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
      res.redirect(`/edit-post/${req.params.id}`);
        
    } catch (error) {
        console.log(error);
    }
});

/**
 * get /
 * admin -signup
*/
router.get('/signup', async (req, res) => {
    try {
       const locals = {
           title: "Admin",
           description: "Simple Blog created with NodeJs, Express & MongoDb."
         }
       res.render('admin/signup', { locals, layout: adminLayout });
     } catch (error) {
       console.log(error);
     }
   
   });

/**
 * post /
 * admin -signup
*/

router.post('/signup', async (req, res) => {
    try {
       const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({ username, password: hashedPassword});
            res.redirect('/dashboard'); 
        } catch (error) {
            if(error.code === 11000)  {
                res.status(409).json({message: 'User already exist'});
            }
            res.status(500).json({message: 'internal server error'});
        }

     } catch (error) {
       console.log(error);
     }
   
   });
   
/**
 * delete /
 * admin -delete post
*/

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne( {_id: req.params.id} );
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }

});
   
/**
 * get /
 * admin - logout
*/

router.get('/logout',(req, res)=>{
    res.clearCookie('token');
    res.redirect('/');
});










module.exports = router;
