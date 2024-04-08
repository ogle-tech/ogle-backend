const graphql = require('graphql');
const Property = require('../models/property');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const postmark = require('postmark');
const NewsletterSubscription = require('../models/newsletterSubscription');
const { Kind } = require('graphql');
const client = new postmark.ServerClient(process.env.POSTMARK_APIKEY);

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLID,
  GraphQLBoolean,
  GraphQLScalarType,
  GraphQLInputObjectType,
} = graphql;

const DateType = new GraphQLScalarType({
  name: 'Date',
  description:
    'This is a custom scalar type for dates. It serializes JavaScript Date objects into ISO strings, and parses ISO strings into JavaScript Date objects.',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const propertyListingEnumType = new GraphQLEnumType({
  name: 'propertyListingType',
  description:
    'This is an enumeration type that represents the listing type of a property. It can have one of two values: ‘rent’ or ‘buy’.',
  values: {
    RENT: { value: 'rent' },
    BUY: { value: 'buy' },
  },
});

const AmenityInputType = new GraphQLObjectType({
  name: 'AmenityInput',
  description:
    'This is an object type that represents an amenity. It has two fields: ‘name’ and ‘icon’, both of which are strings.',
  fields: () => ({
    name: { type: GraphQLString },
    icon: { type: GraphQLString },
  }),
});

const userRoleEnumType = new GraphQLEnumType({
  name: 'userRole',
  description:
    'This is an enumeration type that represents the role of a user. It can have one of two values: ‘agent’ or ‘regular’.',
  values: {
    agent: { value: 'agent' },
    regular: { value: 'regular' },
  },
});

const genderEnumType = new GraphQLEnumType({
  name: 'gender',
  description:
    'This is an enumeration type that represents the gender of a user. It can have one of two values: ‘Male’ or ‘Female’.',
  values: {
    Male: { value: 'Male' },
    Female: { value: 'Female' },
  },
});

const detailedAddressInputType = new GraphQLInputObjectType({
  name: 'DetailedAddressInput',
  description:
    'This is an input object type that represents a detailed address. It has three fields: ‘street’, ‘city’, and ‘state’, all of which are strings.',
  fields: () => ({
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
  }),
});

const propertyAttributesInputType = new GraphQLInputObjectType({
  name: 'PropertyAttributesInput',
  description:
    ' This is an input object type that represents the attributes of a property. It has six fields: ‘numberOfBedrooms’, ‘numberOfGarages’, ‘yearBuilt’, ‘size’, ‘numberOfBathrooms’, and ‘propertyType’.',
  fields: () => ({
    numberOfBedrooms: { type: GraphQLInt },
    numberOfGarages: { type: GraphQLInt },
    yearBuilt: { type: GraphQLString },
    size: { type: GraphQLString },
    numberOfBathrooms: { type: GraphQLInt },
    propertyType: { type: GraphQLString },
  }),
});

const floorPlanInputType = new GraphQLInputObjectType({
  name: 'FloorPlanInput',
  description:
    'This is an input object type that represents a floor plan. It has four fields: ‘numberOfFloors’, ‘size’, ‘roomSize’, and ‘bathroomSize’.',
  fields: () => ({
    numberOfFloors: { type: GraphQLInt },
    size: { type: GraphQLString },
    roomSize: { type: GraphQLString },
    bathroomSize: { type: GraphQLString },
  }),
});

const detailedAddressType = new GraphQLObjectType({
  name: 'detailedAddress',
  description:
    'This is an object type that represents a detailed address. It has three fields: ‘street’, ‘city’, and ‘state’, all of which are strings.',
  fields: () => ({
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
  }),
});

const propertyAttributesType = new GraphQLObjectType({
  name: 'PropertyDetails',
  description:
    'This is an object type that represents the attributes of a property. It has six fields: ‘numberOfBedrooms’, ‘numberOfGarages’, ‘yearBuilt’, ‘size’, ‘numberOfBathrooms’, and ‘propertyType’.',
  fields: () => ({
    numberOfBedrooms: {
      type: GraphQLInt,
    },
    numberOfGarages: {
      type: GraphQLInt,
    },
    yearBuilt: {
      type: GraphQLString,
    },
    size: {
      type: GraphQLString,
    },
    numberOfBathrooms: {
      type: GraphQLInt,
    },
    propertyType: {
      type: GraphQLString,
    },
  }),
});

const floorPlanType = new GraphQLObjectType({
  name: 'floorPlan',
  description:
    'This is an object type that represents a floor plan. It has four fields: ‘numberOfFloors’, ‘size’, ‘roomSize’, and ‘bathroomSize’.',
  fields: () => ({
    numberOfFloors: {
      type: GraphQLInt,
    },
    size: {
      type: GraphQLString,
    },
    roomSize: {
      type: GraphQLString,
    },
    bathroomSize: {
      type: GraphQLString,
    },
  }),
});

const propertyType = new GraphQLObjectType({
  name: 'Property',
  description:
    'This is an object type that represents a property. It has several fields including ‘id’, ‘listingType’, ‘priceForRent’, ‘priceForBuy’, ‘propertyImageList’, ‘address’, ‘title’, ‘amenities’, ‘favourite’, ‘detailedAddress’, ‘propertyAttributes’, ‘floorPlan’, ‘description’, ‘createdAt’, and ‘user’.',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    listingType: { type: GraphQLNonNull(propertyListingEnumType) },
    priceForRent: { type: GraphQLInt },
    priceForBuy: { type: GraphQLInt },
    propertyImageList: { type: GraphQLList(GraphQLString) },
    address: { type: GraphQLString },
    title: { type: GraphQLNonNull(GraphQLString) },
    amenities: {
      type: GraphQLList(AmenityInputType),
    },
    favourite: { type: GraphQLBoolean },
    detailedAddress: { type: detailedAddressType },
    propertyAttributes: { type: propertyAttributesType },
    floorPlan: { type: floorPlanType },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    createdAt: { type: DateType },
    user: {
      type: userType,
      resolve: async (parent, args) => {
        const user = await User.findById(parent.user);
        return user;
      },
    },
    userProperties: {
      type: new GraphQLList(propertyType),
      resolve: async (parent, args) => {
        const properties = await Property.find({ user: parent.user });
        return properties;
      },
    },
  }),
});

const userType = new GraphQLObjectType({
  name: 'User',
  description:
    'This is an object type that represents a user. It has several fields including ‘id’, ‘name’, ‘email’, ‘role’, ‘gender’, ‘dateOfBirth’, ‘address’, ‘about’, ‘phoneNumber’, ‘createdAt’, ‘profilePictureUrl’, ‘website’, ‘properties’, and ‘wishlist’. The fields ‘id’ and ‘email’ are mandatory as indicated by the ! symbol.',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    email: { type: GraphQLNonNull(GraphQLString) },
    role: { type: userRoleEnumType },
    gender: { type: genderEnumType },
    dateOfBirth: { type: GraphQLString },
    address: { type: GraphQLString },
    about: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    createdAt: { type: DateType },
    profilePictureUrl: { type: GraphQLString },
    website: { type: GraphQLString },
    properties: {
      type: new GraphQLList(propertyType),
      resolve: async (parent, args) => {
        const properties = await Property.find({ user: parent.id });
        return properties;
      },
    },
    wishlist: {
      type: new GraphQLList(propertyType),
      resolve: async (parent, args) => {
        const user = await User.findById(parent.id).populate('wishlist.property');
        return user.wishlist.map((item) => item.property);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  description:
    ' RootQuery defines the top level GraphQL queries that can be made against the schema. It contains fields for fetching all properties,properties by filters like listing type, individual properties by ID, properties for a specific user, all users, an individual user by ID, recent searches by a user, messages by listing or user, and messages for a specific user and listing. Each field is resolved asynchronously by calling the appropriate Mongoose model find method.',

  fields: () => ({
    allProperties: {
      type: GraphQLList(propertyType),
      description:
        'This field returns a list of all properties in the database. It requires three arguments: `cursor`, which is used for pagination, `limit`, which is the maximum number of properties to return, and `address`, which is used to filter properties by address. If the `cursor` argument is provided, the query will return properties with IDs greater than the `cursor`. If the `address` argument is provided, the query will return properties whose address matches the `address` argument.',
      resolve: async (parent, args, context) => {
        return await Property.find({});
      },
    },

    properties: {
      type: GraphQLList(propertyType),
      description:
        'This field returns a list of properties based on the `listingType` and `address` arguments. It requires four arguments: `cursor`, which is used for pagination, `limit`, which is the maximum number of properties to return, `listingType`, which is used to filter properties by listing type, and `address`, which is used to filter properties by address. If the `cursor` argument is provided, the query will return properties with IDs greater than the `cursor`. The `listingType` and `address` arguments are mandatory and the query will return properties whose listing type matches the `listingType` argument and whose address matches the `address` argument.',

      args: {
        listingType: { type: GraphQLNonNull(propertyListingEnumType) },
      },
      resolve: async (parent, { listingType }) => {
        return await Property.find({ listingType: listingType });
      },
    },

    property: {
      type: propertyType,
      description:
        ' This field returns a single property based on the `id` argument. It uses the Property.findById(`id`) method to fetch the property with the specified ID.',
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, { id }) => {
        const property = await Property.findById(id);
        if (!property) {
          throw new Error(`Property with ID ${id} not found.`);
        }
        return property;
      },
    },

    propertiesByUser: {
      type: GraphQLList(propertyType),
      description:
        'This field returns a list of properties associated with a specific user, based on the `userId` argument. It uses the Property.find({ user: `userId` }) method to fetch properties associated with the specified user.',

      args: {
        userId: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, { userId }, context) => {
        console.log({ context });
        return await Property.find({ user: userId });
      },
    },

    user: {
      type: userType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, { id }) => {
        const user = await User.findById(id);
        if (!user) throw new Error('User not found.');
        return user;
      },
    },

    wishlistByUser: {
      type: new GraphQLList(propertyType),
      args: {
        userId: { type: GraphQLNonNull(GraphQLString) },
        propertyListingType: { type: propertyListingEnumType },
      },
      resolve: async (parent, { userId, propertyListingType }, context) => {
        const user = await User.findById(userId).populate('wishlist.property');
        let wishlist = user.wishlist;
        console.log({ wishlist });
        if (propertyListingType) {
          wishlist = wishlist.filter((item) => item.property.listingType === propertyListingType);
        }

        return wishlist.map((item) => item.property);
      },
    },
  }),
});

const mutation = new GraphQLObjectType({
  name: 'MutationType',
  fields: () => ({
    createListing: {
      type: propertyType,
      description:
        "This mutation allows a user to create a new property listing. It requires several arguments: `userId` (mandatory), `listingType` (mandatory), `priceForRent`, `priceForBuy`, `address` (mandatory), `title` (mandatory), `favourite`, `street` (mandatory), `city` (mandatory), `state` (mandatory), `amenities`, `propertyImageList` (mandatory), `numberOfBedrooms` (mandatory), `numberOfGarages`, `yearBuilt`, `size`, `numberOfBathrooms` (mandatory), `propertyType` (mandatory), `numberOfFloors`, `roomSize`, `bathroomSize`, and `description` (mandatory). The mutation creates a new property with the provided details and adds it to the user's list of properties.",
      args: {
        userId: { type: GraphQLNonNull(GraphQLID) },
        listingType: { type: GraphQLNonNull(propertyListingEnumType) },
        priceForRent: { type: GraphQLInt },
        priceForBuy: { type: GraphQLInt },
        address: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        favourite: { type: GraphQLBoolean },
        street: { type: GraphQLNonNull(GraphQLString) },
        city: { type: GraphQLNonNull(GraphQLString) },
        state: { type: GraphQLNonNull(GraphQLString) },
        amenities: {
          type: new GraphQLList(
            new GraphQLInputObjectType({
              name: 'AmenitiesInput',
              fields: {
                name: { type: GraphQLString },
                icon: { type: GraphQLString },
              },
            }),
          ),
        },
        propertyImageList: { type: GraphQLNonNull(new GraphQLList(GraphQLString)) },
        numberOfBedrooms: {
          type: GraphQLNonNull(GraphQLInt),
        },
        numberOfGarages: {
          type: GraphQLInt,
        },
        yearBuilt: {
          type: GraphQLString,
        },
        size: {
          type: GraphQLString,
        },
        numberOfBathrooms: {
          type: GraphQLNonNull(GraphQLInt),
        },
        propertyType: {
          type: GraphQLNonNull(GraphQLString),
        },
        numberOfFloors: {
          type: GraphQLInt,
        },

        roomSize: {
          type: GraphQLString,
        },
        bathroomSize: {
          type: GraphQLString,
        },
        description: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context) => {
        const property = new Property({
          user: args.userId,
          listingType: args.listingType,
          priceForRent: args.priceForRent,
          priceForBuy: args.priceForBuy,
          address: args.address,
          title: args.title,
          amenities: args.amenities,
          favourite: args.favourite,

          propertyImageList: args.propertyImageList,
          detailedAddress: {
            street: args.street,
            city: args.city,
            state: args.state,
          },
          propertyAttributes: {
            propertyType: args.propertyType,
            numberOfGarages: args.numberOfGarages,
            numberOfBedrooms: args.numberOfBedrooms,
            numberOfBathrooms: args.numberOfBathrooms,
            size: args.size,
            yearBuilt: args.yearBuilt,
          },
          floorPlan: {
            roomSize: args.roomSize,
            bathroomSize: args.bathroomSize,
            numberOfFloors: args.numberOfFloors,
          },
          description: args.description,
        });
        const createdProperty = await property.save();

        await User.findByIdAndUpdate(args.userId, {
          $push: { properties: createdProperty._id },
        });

        return createdProperty;
      },
    },

    updateProperty: {
      type: propertyType,
      description:
        'This mutation is used to update a property’s information. It requires one mandatory argument: `id`, which is the property’s ID. The other arguments (`listingType`, `priceForRent`, `priceForBuy`, `address`, `title`, `favourite`, `amenities`, `detailedAddress`, `propertyAttributes`, `floorPlan`, `propertyImageList`, `description`) are optional and represent the property’s information that can be updated. If the property with the provided id exists, the property’s information is updated accordingly. If propertyAttributes, detailedAddress, or floorPlan are provided, they are merged with the existing corresponding information. Other direct fields are updated if they are not undefined.',
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        listingType: { type: propertyListingEnumType },
        priceForRent: { type: GraphQLInt },
        priceForBuy: { type: GraphQLInt },
        address: { type: GraphQLString },
        title: { type: GraphQLString },
        favourite: { type: GraphQLBoolean },
        status: { type: GraphQLString },
        amenities: {
          type: new GraphQLList(
            new GraphQLInputObjectType({
              name: 'AmenitiesInputUpdate',
              fields: {
                name: { type: GraphQLString },
                icon: { type: GraphQLString },
              },
            }),
          ),
        },
        detailedAddress: {
          type: detailedAddressInputType,
        },
        propertyAttributes: {
          type: propertyAttributesInputType,
        },
        floorPlan: {
          type: floorPlanInputType,
        },
        propertyImageList: { type: new GraphQLList(GraphQLString) },

        description: { type: GraphQLString },
      },
      resolve: async (parent, { id, ...args }, context) => {
        let property = await Property.findById(id);

        if (!property) {
          throw new Error(`Property with ID ${id} not found.`);
        }

        if (args.propertyAttributes) {
          property.propertyAttributes = {
            ...property.propertyAttributes,
            ...args.propertyAttributes,
          };
        }

        if (args.detailedAddress) {
          property.detailedAddress = {
            ...property.detailedAddress,
            ...args.detailedAddress,
          };
        }

        if (args.floorPlan) {
          property.floorPlan = {
            ...property.floorPlan,
            ...args.floorPlan,
          };
        }

        // Update other direct fields
        for (let prop in args) {
          if (prop !== 'propertyAttributes' && prop !== 'detailedAddress' && prop !== 'floorPlan') {
            if (args[prop] !== undefined) {
              property[prop] = args[prop];
            }
          }
        }

        return await property.save();
      },
    },

    addToWishlist: {
      type: userType,
      description:
        'This mutation is used to add a property to a user’s wishlist. It requires two mandatory arguments: `userId`, which is the user’s ID, and `propertyId`, which is the ID of the property to be added. If the user with the provided `userId` exists and the property with the provided `propertyId` is not already in the user’s wishlist, the property is added to the wishlist.',
      args: {
        userId: { type: GraphQLNonNull(GraphQLString) },
        propertyId: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, { userId, propertyId }) => {
        try {
          const user = await User.findById(userId);
          if (!user) {
            throw new Error('User not found.');
          }

          const isAlreadyInWishlist = user.wishlist.includes(propertyId);

          if (!isAlreadyInWishlist) {
            user.wishlist.push(propertyId);
          }

          const property = await Property.findById(propertyId);
          if (property) {
            // property.favourite = true;
            await property.save();
          }

          await user.save();
          return user;
        } catch (error) {
          throw new Error(error.message);
        }
      },
    },

    removeFromWishList: {
      type: userType,
      description:
        'This mutation is used to remove a property from a user’s wishlist. It requires two mandatory arguments: `userId`, which is the user’s ID, and `propertyId`, which is the ID of the property to be removed. If the user with the provided `userId` exists and the property with the provided `propertyId` is in the user’s wishlist, the property is removed from the wishlist.',
      args: {
        userId: { type: GraphQLNonNull(GraphQLString) },
        propertyId: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, { userId, propertyId }, context) => {
        try {
          const user = await User.findById(userId);
          if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
          }

          const propertyIndex = user.wishlist.indexOf(propertyId);
          if (propertyIndex === -1) {
            throw new Error(`Property with ID ${propertyId} not found in user's wish list.`);
          }

          user.wishlist.splice(propertyIndex, 1);

          const property = await Property.findById(propertyId);
          if (property) {
            // property.favourite = false;
            await property.save();
          }

          await user.save();
          return user;
        } catch (error) {
          throw new Error(error.message);
        }
      },
    },

    registerUser: {
      type: userType,
      description:
        'This mutation is used to register a new user. It requires three mandatory arguments: `name`, `email`, and `password`, which represent the new user’s name, email, and password, respectively. If the email is not already registered, a new user is created and a JWT token is generated for the user.',
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const { email, password, name } = args;

        const userExists = await User.findOne({ email });
        if (userExists) throw new Error('Email already registered.');

        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: '1h',
        });

        const user = new User({
          email,
          password,
          name,
        });
        await user.save();

        const baseUrl = process.env.NODE_ENV === 'production' ? process.env.PROD_URL : process.env.DEV_URL;
        const verifyEmailLink = `${baseUrl}/verify-email?token=${token}&email=${email}`;

        const mail = {
          From: 'admin@aspiantech.co.uk',
          To: email,
          Subject: 'Email Verification',
          HtmlBody: `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="color: #4338ca;">Email Verification</h2>
      <p style="font-size: 16px;">Thank you for registering!</p>
      <p style="font-size: 16px;">Please click on the following link to verify your email:</p>
      <a href="${verifyEmailLink}" style="display: inline-block; background-color: #4338ca; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 16px; margin-top: 20px;">Verify Email</a>
      <p style="font-size: 14px;">Best regards,</p>
      <p style="font-size: 14px;">Ogle</p>
    </div>
  `,
        };

        try {
          const result = await client.sendEmail(mail);
          console.log(result);
        } catch (error) {
          console.error(error);
        }

        return user;
      },
    },

    verifyEmail: {
      type: GraphQLString,
      description:
        "This mutation is used to verify a user's email. It requires two mandatory arguments: `email` and `token`. The `email` is the user's email address that needs to be verified. The `token` is a unique string that was sent to the user's email for verification purposes.",
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        token: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const { email, token } = args;

        try {
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
          if (decodedToken.email !== email) {
            throw new Error('Invalid token');
          }

          const user = await User.findOneAndUpdate({ email }, { verified: true }, { new: true });

          if (!user) {
            throw new Error('User not found');
          }

          return 'Email verification successful';
        } catch (error) {
          console.error('Error verifying email:', error);
          throw new Error('An error occurred while verifying email');
        }
      },
    },

    loginUser: {
      type: GraphQLString,
      description:
        "This mutation is used to log a user into the system. It requires two mandatory arguments: `email` and `password`. The `email` is the user's email address and the `password` is the user's password. If the email and password match a user in the system and the user's email has been verified, a token is returned that can be used for authenticated requests.",
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (parent, args, context) => {
        console.log({ context });
        const { email, password } = args;
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('Incorect email address or password');
        }

        if (user.verified === false) {
          throw new Error('Email address not verified');
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
          throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return token;
      },
    },

    sendEmail: {
      type: GraphQLString,
      description:
        "This mutation is used to send an email. It requires three mandatory arguments: `email`, `subject`, and `body`. The `email` is the recipient's email address. The `subject` is the subject line of the email. The `body` is the main content of the email.",
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
        subject: { type: GraphQLNonNull(GraphQLString) },
        body: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { email, subject, body }) => {
        const mail = {
          From: 'admin@aspiantech.co.uk',
          To: email,
          Subject: subject,
          HtmlBody: body,
        };
        try {
          const result = await client.sendEmail(mail);
          console.log(result);
        } catch (error) {
          console.error(error);
          throw new Error('Error sending email');
        }
      },
    },

    subscribeToNewsletter: {
      type: GraphQLString,
      description:
        "This mutation is used to subscribe a user to a newsletter. It requires one mandatory argument: `email`. The `email` is the user's email address. If the email is not already subscribed to the newsletter, it is added to the subscription list and a confirmation email is sent.",
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const { email } = args;
        const existingSubscription = await NewsletterSubscription.findOne({
          email,
        });
        if (existingSubscription) {
          return 'You are already subscribed to our newsletter.';
        }

        await NewsletterSubscription.create({ email });

        const confirmationMessage = `
        Thank you for joining our newsletter! We’ll be in touch with some tips and premium content, watch this space!
      `;

        const mail = {
          From: 'admin@aspiantech.co.uk',
          To: email,
          Subject: 'Newsletter Subscription Confirmation',
          HtmlBody: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <h2 style="color: #4338ca;">Newsletter Subscription Confirmation</h2>
            <p style="font-size: 16px;">${confirmationMessage}</p>
            <p style="font-size: 14px; margin-top: 20px;">Best regards,</p>
            <p style="font-size: 14px;">Ogle</p>
          </div>
        `,
        };

        try {
          const result = await client.sendEmail(mail);
          console.log(result);
        } catch (error) {
          console.error(error);
          throw new Error('Failed to send password reset email');
        }

        return 'A confirmation email has been sent.';
      },
    },

    requestPasswordReset: {
      type: GraphQLString,
      description:
        "This mutation is used to request a password reset for a user. It requires one mandatory argument: `email`. The `email` is the user's email address. If the email exists in the system, a password reset email is sent to the user.",
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const { email } = args;

        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: '1h',
        });

        const baseUrl = process.env.NODE_ENV === 'production' ? process.env.PROD_URL : process.env.DEV_URL;
        const resetLink = `${baseUrl}/password-reset?token=${resetToken}&email=${email}`;

        const mail = {
          From: 'admin@aspiantech.co.uk',
          To: email,
          Subject: 'Password Reset',
          HtmlBody: `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; ">
      <h2 style="color: #4338ca;">Password Reset</h2>
      <p style="font-size: 16px;">Dear User,</p>
      <p style="font-size: 16px;">We have received a request to reset your password. Please click on the following link to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #4338ca; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 16px; margin-top: 20px;">Reset Password</a>
      <p style="font-size: 14px; margin-top: 20px;">Best regards,</p>
      <p style="font-size: 14px;">Ogle</p>
    </div>
  `,
        };

        try {
          const result = await client.sendEmail(mail);
          console.log(result);
        } catch (error) {
          console.error(error);
          throw new Error('Failed to send password reset email');
        }

        return 'Password reset email sent';
      },
    },

    resetPassword: {
      type: GraphQLString,
      description:
        "This mutation is used to reset a user's password. It requires three mandatory arguments: `email`, `password`, and `confirmPassword`. The `email` is the user's email address. The `password` is the new password. The `confirmPassword` is the confirmation of the new password.",
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        confirmPassword: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const { email, password, confirmPassword } = args;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const updatedUser = await User.findOneAndUpdate({ email }, { password: hash }, { new: true });

        if (!updatedUser) {
          throw new Error('User not found');
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        return 'Password reset successfully';
      },
    },

    updateUser: {
      type: userType,
      description:
        'This mutation is used to update a user’s information. It requires several arguments, which are ( `id` (mandatory), name` (mandatory), `email` (mandatory), `role`, `gender`, `dateOfBirth` (mandatory), `address` (mandatory), `about`, `phoneNumber` (mandatory), `profilePictureUrl`, `website`) these arguments represent the user’s information that can be updated. If the user with the provided id exists, the user’s information is updated accordingly.',
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        role: { type: userRoleEnumType },
        gender: { type: genderEnumType },
        dateOfBirth: { type: GraphQLString },
        address: { type: GraphQLString },
        about: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        profilePictureUrl: { type: GraphQLString },
        website: { type: GraphQLString },
      },
      resolve: async (parent, { id, ...args }, context) => {
        let user = await User.findById(id);

        if (!user) {
          throw new Error(`Property with ID ${id} not found.`);
        }

        for (let prop in args) {
          if (args[prop] !== undefined) {
            user[prop] = args[prop];
          }
        }

        return await user.save();
      },
    },

    logoutUser: {
      type: GraphQLString,
      description:
        'This mutation is used to log out a user. It does not require any arguments. When invoked, it returns a success message.',
      resolve: (parent, args, context) => {
        context.currentUser = null;
        return 'Logout success';
      },
    },

    deletePropertyImage: {
      type: propertyType,
      description:
        ' This mutation is used to delete an image from a property’s image list. It requires two mandatory arguments: `id`, which is the property’s ID, and `imageIndex`, which is the index of the image in the property’s image list. If the property with the provided `id` exists and the `imageIndex` is valid, the image at the specified index is removed from the property’s image list.',
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        imageIndex: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, { id, imageIndex }, context) => {
        let property = await Property.findById(id);

        if (!property) {
          throw new Error(`Property with ID ${id} not found.`);
        }

        if (imageIndex < 0 || imageIndex >= property.propertyImageList.length) {
          throw new Error('Invalid image index.');
        }

        // Remove the image at the specified index
        property.propertyImageList.splice(imageIndex, 1);

        return await property.save();
      },
    },

    deleteProperty: {
      type: userType,
      description:
        "This mutation allows a user to delete a property. It requires two mandatory arguments: `propertyId` and `userId`. The `propertyId` is the ID of the property to be deleted. The `userId` is the ID of the user who owns the property. The mutation checks if the property exists and if the user is authorized to delete it. If both conditions are met, the property is deleted and the user's list of properties is updated.",
      args: {
        propertyId: { type: GraphQLNonNull(GraphQLString) },
        userId: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, { propertyId, userId }) => {
        try {
          const property = await Property.findById(propertyId);
          if (!property) {
            throw new Error('Property not found.');
          }

          if (property.user.toString() !== userId) {
            throw new Error('You are not authorized to delete this property.');
          }

          await Property.findByIdAndDelete(propertyId);

          const user = await User.findById(userId);
          if (!user) {
            throw new Error('User not found.');
          }

          user.properties = user.properties.filter((propId) => propId.toString() !== propertyId);
          await user.save();

          return user; // Return the updated user object
        } catch (error) {
          throw new Error(error.message);
        }
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
