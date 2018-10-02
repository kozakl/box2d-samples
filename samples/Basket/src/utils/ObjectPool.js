/**
 * @author kozakluke@gmail.com
 */
"use strict";
ObjectPool.pools = [];

function ObjectPool() { }

/**
 * @private
 */
ObjectPool.getPool = function(Type)
{
    return ObjectPool.pools[Type] || (ObjectPool.pools[Type] = []);
};

ObjectPool.getObject = function(Type, args)
{
    var pool = ObjectPool.getPool(Type);
    if(pool.length > 0)
        return pool.pop();
    else
    {
        if (arguments.length < 2)
            return new Type();
        else
        {
            switch (arguments.length)
            {
                case 1  : return new Type(arguments[1]);
                case 2  : return new Type(arguments[1], arguments[2]);
                case 3  : return new Type(arguments[1], arguments[2], arguments[3]);
                case 4  : return new Type(arguments[1], arguments[2], arguments[3], arguments[4]);
                case 5  : return new Type(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                case 6  : return new Type(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                default : return new Type();
            }
        }
    }
};

ObjectPool.disposeObject = function(object, Type)
{
    ObjectPool.getPool(Type).push(object);
};
