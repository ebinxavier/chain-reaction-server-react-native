# RESPONSE FORMAT

```javascript
    {
        status: 'SUCCESS', // or 'ERROR'
        data: {
            // any
        }

    }
```

# FIREBASE MESSAGE FORMATS

## USER JOINED

```javascript
{
    data: {
        type: 'JOINED',
        userName: String,
        userId: String,
        users: [String]

    }
}

```

- No Notification

## USER EXITED

```javascript
{
    data: {
        type: 'EXITED',
        userName: String,
        userId: String,
        users: JSON.stringify([String]),
        roomSize: String,
    }
}

```

- No Notification

## ROOM EXPIRED

```javascript
{
    data: {
        type: 'EXPIRED',
    }
}

```

- No Notification

## GAME STARTED

```javascript
{
    data: {
        type: 'STARTED',
        roomSize:Number,
        users: JSON.Stringify(users) // Only Strings supported
    }
}

```

- No Notification

## USER PLAYED AN ACTION

```javascript
{
    data: {
        type: 'PLAYED',
        userName: String,
        userId: String,
        action: Object, // Any operaton
    }
}

```

- No Notification
