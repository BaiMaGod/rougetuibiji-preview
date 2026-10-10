(function (exports, Laya) {
    'use strict';

    class btStatics {
    }
    btStatics.COLLISIONFILTERGROUP_DEFAULTFILTER = 0x1;
    btStatics.COLLISIONFILTERGROUP_STATICFILTER = 0x2;
    btStatics.COLLISIONFILTERGROUP_KINEMATICFILTER = 0x4;
    btStatics.COLLISIONFILTERGROUP_DEBRISFILTER = 0x8;
    btStatics.COLLISIONFILTERGROUP_SENSORTRIGGER = 0x10;
    btStatics.COLLISIONFILTERGROUP_CHARACTERFILTER = 0x20;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER1 = 0x40;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER2 = 0x80;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER3 = 0x100;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER4 = 0x200;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER5 = 0x400;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER6 = 0x800;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER7 = 0x1000;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER8 = 0x2000;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER9 = 0x4000;
    btStatics.COLLISIONFILTERGROUP_CUSTOMFILTER10 = 0x8000;
    btStatics.COLLISIONFILTERGROUP_ALLFILTER = -1;
    btStatics.ACTIVATIONSTATE_ACTIVE_TAG = 1;
    btStatics.ACTIVATIONSTATE_ISLAND_SLEEPING = 2;
    btStatics.ACTIVATIONSTATE_WANTS_DEACTIVATION = 3;
    btStatics.ACTIVATIONSTATE_DISABLE_DEACTIVATION = 4;
    btStatics.ACTIVATIONSTATE_DISABLE_SIMULATION = 5;
    btStatics.COLLISIONFLAGS_STATIC_OBJECT = 1;
    btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT = 2;
    btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE = 4;
    btStatics.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK = 8;
    btStatics.COLLISIONFLAGS_CHARACTER_OBJECT = 16;
    btStatics.COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT = 32;
    btStatics.COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING = 64;
    btStatics.PHYSICSENGINEFLAGS_NONE = 0x0;
    btStatics.PHYSICSENGINEFLAGS_COLLISIONSONLY = 0x1;
    btStatics.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT = 0x2;
    btStatics.PHYSICSENGINEFLAGS_MULTITHREADED = 0x4;
    btStatics.PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE = 0x8;
    btStatics.SOLVERMODE_RANDMIZE_ORDER = 1;
    btStatics.SOLVERMODE_FRICTION_SEPARATE = 2;
    btStatics.SOLVERMODE_USE_WARMSTARTING = 4;
    btStatics.SOLVERMODE_USE_2_FRICTION_DIRECTIONS = 16;
    btStatics.SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING = 32;
    btStatics.SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64;
    btStatics.SOLVERMODE_CACHE_FRIENDLY = 128;
    btStatics.SOLVERMODE_SIMD = 256;
    btStatics.SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512;
    btStatics.SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024;
    btStatics.HITSRAYRESULTCALLBACK_FLAG_NONE = 0;
    btStatics.HITSRAYRESULTCALLBACK_FLAG_FILTERBACKFACESS = 1;
    btStatics.HITSRAYRESULTCALLBACK_FLAG_KEEPUNFILIPPEDNORMAL = 2;
    btStatics.HITSRAYRESULTCALLBACK_FLAG_USESUBSIMPLEXCONVEXCASTRAYTEST = 4;
    btStatics.HITSRAYRESULTCALLBACK_FLAG_USEGJKCONVEXCASTRAYTEST = 8;
    btStatics.HITSRAYRESULTCALLBACK_FLAG_TERMINATOR = 0xffffffff;
    function convertToBulletVec3(lVector, out) {
        btStatics.bt.btVector3_setValue(out, lVector.x, lVector.y, lVector.z);
    }

    exports.btColliderType = void 0;
    (function (btColliderType) {
        btColliderType[btColliderType["RigidbodyCollider"] = 0] = "RigidbodyCollider";
        btColliderType[btColliderType["CharactorCollider"] = 1] = "CharactorCollider";
        btColliderType[btColliderType["StaticCollider"] = 2] = "StaticCollider";
    })(exports.btColliderType || (exports.btColliderType = {}));
    class btCollider {
        static __init__() {
            btCollider._btVector30 = btStatics.bt.btVector3_create(0, 0, 0);
            btCollider._btQuaternion0 = btStatics.bt.btQuaternion_create(0, 0, 0, 1);
        }
        constructor(physicsManager) {
            this._isSimulate = false;
            this.inPhysicUpdateListIndex = -1;
            this._destroyed = false;
            this._restitution = 0.0;
            this._friction = 0.5;
            this._rollingFriction = 0.0;
            this._ccdThreshold = 0.0;
            this._ccdSwapSphereRadius = 0.0;
            this._transformFlag = 2147483647;
            this.active = false;
            this._collisionGroup = btStatics.COLLISIONFILTERGROUP_DEFAULTFILTER;
            this._canCollideWith = btStatics.COLLISIONFILTERGROUP_ALLFILTER;
            this._physicsManager = physicsManager;
            this._id = btCollider._colliderID++;
            this._isTrigger = false;
            this._enableProcessCollisions = false;
            btCollider._physicObjectsMap[this._id] = this;
            this._type = this.getColliderType();
        }
        setDynamicFriction(value) {
            throw new Laya.NotImplementedError;
        }
        setStaticFriction(value) {
            throw new Laya.NotImplementedError;
        }
        setFrictionCombine(value) {
            throw new Laya.NotImplementedError;
        }
        setBounceCombine(value) {
            throw new Laya.NotImplementedError;
        }
        setEventFilter(events) {
            throw new Laya.NotImplementedError;
        }
        allowSleep(value) {
        }
        getCapable(value) {
            return null;
        }
        setOwner(node) {
            this.owner = node;
            this._transform = node.transform;
            this._initCollider();
        }
        setCollisionGroup(value) {
            if (value != this._collisionGroup && this._btColliderShape) {
                this._collisionGroup = value;
                this._physicsManager.removeCollider(this);
                this._physicsManager.addCollider(this);
            }
        }
        setCanCollideWith(value) {
            if (value != this._canCollideWith && this._btColliderShape) {
                this._canCollideWith = value;
                this._physicsManager.removeCollider(this);
                this._physicsManager.addCollider(this);
            }
        }
        _initCollider() {
            this.setBounciness(this._restitution);
            this.setfriction(this._friction);
            this.setRollingFriction(this._rollingFriction);
            this.setCcdMotionThreshold(this._physicsManager.ccdThreshold);
            this.setCcdSweptSphereRadius(this._physicsManager.ccdSphereRadius);
        }
        getColliderType() {
            return null;
        }
        _onScaleChange(scale) {
            this._btColliderShape.setWorldScale(scale);
        }
        _onShapeChange() {
            var btColObj = this._btCollider;
            var flags = btStatics.bt.btCollisionObject_getCollisionFlags(btColObj);
            if ((flags & btStatics.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK) > 0)
                btStatics.bt.btCollisionObject_setCollisionFlags(btColObj, flags ^ btStatics.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK);
        }
        setColliderShape(shape) {
            shape._btCollider = this;
            if (shape == this._btColliderShape || shape._btShape == null)
                return;
            var lastColliderShape = this._btColliderShape;
            this._btColliderShape = shape;
            let bt = btStatics.bt;
            if (shape) {
                if (this._btCollider) {
                    bt.btCollisionObject_setCollisionShape(this._btCollider, shape._btShape);
                    let simulate = this._isSimulate;
                    simulate && this._physicsManager.removeCollider(this);
                    this._onShapeChange();
                    if ((simulate || !lastColliderShape || (lastColliderShape && lastColliderShape._destroyed)) && this.componentEnable) {
                        this._derivePhysicsTransformation(true);
                        this._physicsManager.addCollider(this);
                    }
                }
            }
            else {
                if (this._isSimulate) {
                    this._physicsManager.removeCollider(this);
                    this._isSimulate = false;
                }
            }
            lastColliderShape && lastColliderShape.destroy();
        }
        destroy() {
            btStatics.bt.btCollisionObject_destroy(this._btCollider);
            delete btCollider._physicObjectsMap[this._id];
            this._destroyed = true;
        }
        _derivePhysicsTransformation(force) {
            var btColliderObject = this._btCollider;
            var btTransform = btStatics.bt.btCollisionObject_getWorldTransform(btColliderObject);
            this._innerDerivePhysicsTransformation(btTransform, force);
            btStatics.bt.btCollisionObject_setWorldTransform(btColliderObject, btTransform);
        }
        _innerDerivePhysicsTransformation(physicTransformPtr, force) {
            let bt = btStatics.bt;
            var transform = this._transform;
            let pxoff = 0;
            let pyoff = 0;
            let pzoff = 0;
            if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION)) {
                var shapeOffset = this._btColliderShape._localOffset;
                var position = transform.position;
                var btPosition = btCollider._btVector30;
                if (shapeOffset.x !== 0 || shapeOffset.y !== 0 || shapeOffset.z !== 0) {
                    var worldMat = transform.worldMatrix;
                    Laya.Vector3.transformCoordinate(shapeOffset, worldMat, _tempVector30);
                    bt.btVector3_setValue(btPosition, _tempVector30.x, _tempVector30.y, _tempVector30.z);
                }
                else {
                    bt.btVector3_setValue(btPosition, position.x - pxoff, position.y - pyoff, position.z - pzoff);
                }
                bt.btTransform_setOrigin(physicTransformPtr, btPosition);
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION, false);
            }
            if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION)) {
                var btRotation = btCollider._btQuaternion0;
                var rotation = transform.rotation;
                bt.btQuaternion_setValue(btRotation, rotation.x, rotation.y, rotation.z, rotation.w);
                bt.btTransform_setRotation(physicTransformPtr, btRotation);
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION, false);
            }
            if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE)) {
                this._onScaleChange(transform.getWorldLossyScale());
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE, false);
            }
        }
        _updateTransformComponent(physicsTransform, syncRot = true, addmargin = 0) {
            let bt = btStatics.bt;
            var colliderShape = this._btColliderShape;
            var localOffset = colliderShape._localOffset;
            var transform = this._transform;
            if (!transform)
                return;
            var position = transform.position;
            var rotation = transform.rotation;
            var btPosition = bt.btTransform_getOrigin(physicsTransform);
            if (syncRot) {
                var btRotation = bt.btTransform_getRotation(physicsTransform);
                var btRotX = bt.btQuaternion_x(btRotation);
                var btRotY = bt.btQuaternion_y(btRotation);
                var btRotZ = bt.btQuaternion_z(btRotation);
                var btRotW = bt.btQuaternion_w(btRotation);
                rotation.x = btRotX;
                rotation.y = btRotY;
                rotation.z = btRotZ;
                rotation.w = btRotW;
                transform.rotation = rotation;
            }
            if (localOffset.x !== 0 || localOffset.y !== 0 || localOffset.z !== 0) {
                var btScale = bt.btCollisionShape_getLocalScaling(colliderShape._btShape);
                _tempVector30.x = localOffset.x * bt.btVector3_x(btScale);
                _tempVector30.y = localOffset.y * bt.btVector3_y(btScale);
                _tempVector30.z = localOffset.z * bt.btVector3_z(btScale);
                Laya.Vector3.transformQuat(_tempVector30, rotation, _tempVector30);
                position.x = bt.btVector3_x(btPosition) - _tempVector30.x;
                position.y = bt.btVector3_y(btPosition) - _tempVector30.y + addmargin;
                position.z = bt.btVector3_z(btPosition) - _tempVector30.z;
            }
            else {
                position.x = bt.btVector3_x(btPosition);
                position.y = bt.btVector3_y(btPosition);
                position.z = bt.btVector3_z(btPosition);
            }
            transform.position = position;
        }
        _getTransformFlag(type) {
            return (this._transformFlag & type) != 0;
        }
        _setTransformFlag(type, value) {
            if (value)
                this._transformFlag |= type;
            else
                this._transformFlag &= ~type;
        }
        transformChanged(flag) {
            this._transformFlag = flag;
            if (this.inPhysicUpdateListIndex == -1 && !this._enableProcessCollisions) {
                this._physicsManager._physicsUpdateList.add(this);
            }
        }
        setBounciness(value) {
            this._restitution = value;
            this._btCollider && btStatics.bt.btCollisionObject_setRestitution(this._btCollider, value);
        }
        setfriction(value) {
            this._friction = value;
            this._btCollider && btStatics.bt.btCollisionObject_setFriction(this._btCollider, value);
        }
        setRollingFriction(value) {
            this._rollingFriction = value;
            this._btCollider && btStatics.bt.btCollisionObject_setRollingFriction(this._btCollider, value);
        }
        setCcdMotionThreshold(value) {
            if (this._physicsManager.enableCCD) {
                this._ccdThreshold = value;
                this._btCollider && btStatics.bt.btCollisionObject_setCcdMotionThreshold(this._btCollider, value);
            }
        }
        setCcdSweptSphereRadius(value) {
            if (this._physicsManager.enableCCD) {
                this._ccdSwapSphereRadius = value;
                this._btCollider && btStatics.bt.btCollisionObject_setCcdSweptSphereRadius(this._btCollider, value);
            }
        }
    }
    btCollider._colliderID = 0;
    btCollider._addUpdateList = true;
    btCollider.TYPE_STATIC = 0;
    btCollider.TYPE_DYNAMIC = 1;
    btCollider.TYPE_KINEMATIC = 2;
    btCollider._physicObjectsMap = {};
    const _tempVector30 = new Laya.Vector3();

    class btCharacterCollider extends btCollider {
        static __init__() {
            btCharacterCollider._btTempVector30 = btStatics.bt.btVector3_create(0, 0, 0);
            btCharacterCollider._btTempVector31 = new Laya.Vector3(0, 0, 0);
            btCharacterCollider.initCapable();
        }
        getCapable(value) {
            return btCharacterCollider.getCharacterCapable(value);
        }
        constructor(physicsManager) {
            super(physicsManager);
            this._btKinematicCharacter = null;
            this._stepHeight = 0.1;
            this._upAxis = new Laya.Vector3(0, 1, 0);
            this._maxSlope = 90.0;
            this._fallSpeed = 55.0;
            this._jumpSpeed = 10.0;
            this._gravity = new Laya.Vector3(0, -9.8 * 3, 0);
            this._pushForce = 1;
            this._enableProcessCollisions = true;
            var bt = btStatics.bt;
            var ghostObject = bt.btPairCachingGhostObject_create();
            bt.btCollisionObject_setUserIndex(ghostObject, this._id);
            bt.btCollisionObject_setCollisionFlags(ghostObject, btStatics.COLLISIONFLAGS_CHARACTER_OBJECT);
            bt.btCollisionObject_setContactProcessingThreshold(ghostObject, 0);
            this._btCollider = ghostObject;
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaCharacterController, 1);
        }
        setShapelocalOffset(value) {
            this._btColliderShape && this._btColliderShape.setOffset(value);
        }
        setSkinWidth(width) {
        }
        setPosition(value) {
            btStatics.bt.btKinematicCharacterController_setCurrentPosition(this._btKinematicCharacter, value.x, value.y, value.z);
        }
        getPosition() {
            var bt = btStatics.bt;
            let pPos = bt.btKinematicCharacterController_getCurrentPosition(this._btKinematicCharacter);
            btCharacterCollider._btTempVector31.setValue(bt.btVector3_x(pPos), bt.btVector3_y(pPos), bt.btVector3_z(pPos));
            return btCharacterCollider._btTempVector31;
        }
        setRadius(value) {
            this._btColliderShape && this._btColliderShape.setRadius(value);
        }
        setHeight(value) {
            this._btColliderShape && this._btColliderShape.setHeight(value);
        }
        setminDistance(value) {
        }
        setDynamicFriction(value) {
        }
        setStaticFriction(value) {
        }
        setFrictionCombine(value) {
        }
        setBounceCombine(value) {
        }
        static getCharacterCapable(value) {
            return btCharacterCollider._characterCapableMap.get(value);
        }
        static initCapable() {
            this._characterCapableMap = new Map();
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_Gravity, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_CollisionGroup, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_WorldPosition, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_Move, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_Jump, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_StepOffset, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_UpDirection, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_FallSpeed, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_SlopeLimit, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_PushForce, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_Radius, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_Height, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_offset, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_Skin, false);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_minDistance, false);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_EventFilter, false);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_SimulateGravity, false);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_IsOnGround, true);
        }
        getColliderType() {
            return exports.btColliderType.CharactorCollider;
        }
        _initCollider() {
            super._initCollider();
        }
        _onShapeChange() {
            super._onShapeChange();
            var bt = btStatics.bt;
            if (this._btKinematicCharacter)
                bt.btKinematicCharacterController_destroy(this._btKinematicCharacter);
            var btUpAxis = btCharacterCollider._btTempVector30;
            bt.btVector3_setValue(btUpAxis, this._upAxis.x, this._upAxis.y, this._upAxis.z);
            this._btKinematicCharacter = bt.btKinematicCharacterController_create(this._btCollider, this._btColliderShape._btShape, this._stepHeight, btUpAxis);
            this.setfallSpeed(this._fallSpeed);
            this.setSlopeLimit(this._maxSlope);
            this.setJumpSpeed(this._jumpSpeed);
            this.setGravity(this._gravity);
            bt.btKinematicCharacterController_setJumpAxis(this._btKinematicCharacter, 0, 1, 0);
            this.setPushForce(this._pushForce);
        }
        setWorldPosition(value) {
            btStatics.bt.btKinematicCharacterController_setCurrentPosition(this._btKinematicCharacter, value.x, value.y, value.z);
        }
        move(disp) {
            var btMovement = btCharacterCollider._btVector30;
            btStatics.bt.btVector3_setValue(btMovement, disp.x, disp.y, disp.z);
            btStatics.bt.btKinematicCharacterController_setWalkDirection(this._btKinematicCharacter, btMovement);
        }
        jump(velocity) {
            var btVelocity = btCharacterCollider._btVector30;
            if (velocity) {
                convertToBulletVec3(velocity, btVelocity);
                btStatics.bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
            }
        }
        isGrounded() {
            let bt = btStatics.bt;
            return bt.btKinematicCharacterController_onGround(this._btKinematicCharacter) == 1 ? true : false;
        }
        setJumpSpeed(value) {
            this._jumpSpeed = value;
            btStatics.bt.btKinematicCharacterController_setJumpSpeed(this._btKinematicCharacter, value);
        }
        setStepOffset(offset) {
            this._stepHeight = offset;
            btStatics.bt.btKinematicCharacterController_setStepHeight(this._btKinematicCharacter, offset);
        }
        setUpDirection(up) {
            up.cloneTo(this._upAxis);
            var btUpAxis = btCharacterCollider._btTempVector30;
            convertToBulletVec3(up, btUpAxis);
            btStatics.bt.btKinematicCharacterController_setUp(this._btKinematicCharacter, btUpAxis);
        }
        getVerticalVel() {
            return btStatics.bt.btKinematicCharacterController_getVerticalVelocity(this._btKinematicCharacter);
        }
        setSlopeLimit(slopeLimit) {
            this._maxSlope = slopeLimit;
            btStatics.bt.btKinematicCharacterController_setMaxSlope(this._btKinematicCharacter, (slopeLimit / 180) * Math.PI);
        }
        setfallSpeed(value) {
            this._fallSpeed = value;
            btStatics.bt.btKinematicCharacterController_setFallSpeed(this._btKinematicCharacter, value);
        }
        setPushForce(value) {
            this._pushForce = value;
            if (this._btCollider && this._btKinematicCharacter) {
                btStatics.bt.btKinematicCharacterController_setPushForce(this._btKinematicCharacter, value);
            }
        }
        setGravity(value) {
            this._gravity = value;
            var btGravity = btCharacterCollider._btTempVector30;
            btStatics.bt.btVector3_setValue(btGravity, value.x, value.y, value.z);
            btStatics.bt.btKinematicCharacterController_setGravity(this._btKinematicCharacter, btGravity);
        }
        getOverlappingObj(cb) {
            var bt = btStatics.bt;
            let ghost = this._btCollider;
            let num = bt.btCollisionObject_getNumOverlappingObjects(ghost);
            for (let i = 0; i < num; i++) {
                let obj = bt.btCollisionObject_getOverlappingObject(ghost, i);
                let comp = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(obj)];
                if (comp) {
                    cb(comp);
                }
            }
        }
        setColliderShape(shape) {
            super.setColliderShape(shape);
        }
        destroy() {
            btStatics.bt.btKinematicCharacterController_destroy(this._btKinematicCharacter);
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaCharacterController, -1);
            super.destroy();
            this._btKinematicCharacter = null;
        }
    }

    class btColliderShape {
        constructor() {
            this._localOffset = new Laya.Vector3(0, 0, 0);
            this._btScale = btStatics.bt.btVector3_create(1, 1, 1);
            this._worldScale = new Laya.Vector3(-1, -1, -1);
            this._destroyed = false;
        }
        getOffset() {
            return this._localOffset;
        }
        getPhysicsShape() {
            return this._btShape;
        }
        _createShape() {
            throw "override this function";
        }
        _getType() {
            throw "override this function";
        }
        setOffset(value) {
            value.cloneTo(this._localOffset);
        }
        setWorldScale(scale) {
            if (this._btShape && this._worldScale.equal(scale))
                return;
            scale.cloneTo(this._worldScale);
            btStatics.bt.btVector3_setValue(this._btScale, this._worldScale.x, this._worldScale.y, this._worldScale.z);
            btStatics.bt.btCollisionShape_setLocalScaling(this._btShape, this._btScale);
        }
        destroy() {
            if (this._btShape && !this._destroyed) {
                if (this._btCollider && this._btCollider._physicsManager) {
                    this._btCollider._physicsManager.removeCollider(this._btCollider);
                }
                btStatics.bt.btCollisionShape_destroy(this._btShape);
                this._btShape = null;
                this._destroyed = true;
            }
        }
    }
    btColliderShape.SHAPEORIENTATION_UPX = 0;
    btColliderShape.SHAPEORIENTATION_UPY = 1;
    btColliderShape.SHAPEORIENTATION_UPZ = 2;
    btColliderShape.SHAPETYPES_BOX = 0;
    btColliderShape.SHAPETYPES_SPHERE = 1;
    btColliderShape.SHAPETYPES_CYLINDER = 2;
    btColliderShape.SHAPETYPES_CAPSULE = 3;
    btColliderShape.SHAPETYPES_CONVEXHULL = 4;
    btColliderShape.SHAPETYPES_COMPOUND = 5;
    btColliderShape.SHAPETYPES_STATICPLANE = 6;
    btColliderShape.SHAPETYPES_CONE = 7;
    btColliderShape.SHAPETYPES_HEIGHTFIELDTERRAIN = 8;

    class btMeshColliderShape extends btColliderShape {
        get mesh() {
            return this._mesh;
        }
        set mesh(value) {
            if (this._mesh == value)
                return;
            this._mesh = value;
            if (this._convex) {
                this._createConvexMeshGeometry();
            }
            else {
                this._createTrianggleMeshGeometry();
            }
        }
        static __init__() {
            let bt = btStatics.bt;
            btMeshColliderShape._btTempVector30 = bt.btVector3_create(0, 0, 0);
            btMeshColliderShape._btTempVector31 = bt.btVector3_create(0, 0, 0);
            btMeshColliderShape._btTempVector32 = bt.btVector3_create(0, 0, 0);
        }
        constructor() {
            super();
            this._limitvertex = 255;
        }
        setPhysicsMeshFromMesh(value) {
            this._mesh = value;
            this._convex = false;
            this._createTrianggleMeshGeometry();
        }
        setConvexMesh(value) {
            this._mesh = value;
            this._convex = true;
            this._createConvexMeshGeometry();
        }
        setLimitVertex(limit) {
            this._limitvertex = limit;
        }
        get convex() {
            return this._convex;
        }
        _createPhysicsMeshFromMesh(value) {
            if (value._triangleMesh) {
                return value._triangleMesh;
            }
            let bt = btStatics.bt;
            var triangleMesh = value._triangleMesh = bt.btTriangleMesh_create();
            var nativePositio0 = btMeshColliderShape._btTempVector30;
            var nativePositio1 = btMeshColliderShape._btTempVector31;
            var nativePositio2 = btMeshColliderShape._btTempVector32;
            let posArray = new Array();
            value.getPositions(posArray);
            if (this._convex && posArray.length > this._limitvertex) {
                console.warn("MeshColliderShape: The number of vertices exceeds the limit, please reduce the number of vertices.");
            }
            var indices = value._indexBuffer.getData();
            for (var i = 0, n = indices.length; i < n; i += 3) {
                var position0 = posArray[indices[i]];
                var position1 = posArray[indices[i + 1]];
                var position2 = posArray[indices[i + 2]];
                convertToBulletVec3(position0, nativePositio0);
                convertToBulletVec3(position1, nativePositio1);
                convertToBulletVec3(position2, nativePositio2);
                bt.btTriangleMesh_addTriangle(triangleMesh, nativePositio0, nativePositio1, nativePositio2, true);
            }
            return triangleMesh;
        }
        _createConvexMeshFromMesh(value) {
            if (!value._convexMesh) {
                let physicMesh = this._createPhysicsMeshFromMesh(this._mesh);
                value._convexMesh = btStatics.bt.btShapeHull_create(physicMesh);
            }
            return value._convexMesh;
        }
        _createTrianggleMeshGeometry() {
            let bt = btStatics.bt;
            if (this._btShape) {
                bt.btCollisionShape_destroy(this._btShape);
            }
            this._physicMesh = this._createPhysicsMeshFromMesh(this._mesh);
            if (this._physicMesh) {
                this._btShape = bt.btBvhTriangleMeshShape_create(this._physicMesh);
                if (this._btCollider)
                    this._btCollider.setColliderShape(this);
            }
        }
        _createConvexMeshGeometry() {
            let bt = btStatics.bt;
            if (this._btShape) {
                bt.btCollisionShape_destroy(this._btShape);
            }
            let convexMesh = this._createConvexMeshFromMesh(this._mesh);
            this._btShape = bt.btConvexHullShape_create(convexMesh);
            if (this._btCollider)
                this._btCollider.setColliderShape(this);
        }
        setWorldScale(value) {
            if (this._btShape && this._btCollider) {
                let bt = btStatics.bt;
                bt.btVector3_setValue(btMeshColliderShape._btTempVector30, value.x, value.y, value.z);
                bt.btCollisionShape_setLocalScaling(this._btShape, btMeshColliderShape._btTempVector30);
            }
        }
    }

    class btRigidBodyCollider extends btCollider {
        static __init__() {
            let bt = btStatics.bt;
            btRigidBodyCollider._btTempVector30 = bt.btVector3_create(0, 0, 0);
            btRigidBodyCollider._btTempVector31 = bt.btVector3_create(0, 0, 0);
            btRigidBodyCollider._RBtempVector30 = new Laya.Vector3(0, 0, 0);
            btRigidBodyCollider._btVector3Zero = bt.btVector3_create(0, 0, 0);
            btRigidBodyCollider._btInertia = bt.btVector3_create(0, 0, 0);
            btRigidBodyCollider._btImpulse = bt.btVector3_create(0, 0, 0);
            btRigidBodyCollider._btImpulseOffset = bt.btVector3_create(0, 0, 0);
            btRigidBodyCollider._btGravity = bt.btVector3_create(0, 0, 0);
            btRigidBodyCollider._btTransform0 = bt.btTransform_create();
            btRigidBodyCollider.initCapable();
        }
        constructor(manager) {
            super(manager);
            this._isKinematic = false;
            this._mass = 1.0;
            this._gravity = new Laya.Vector3(0, -10, 0);
            this._angularDamping = 0.0;
            this._linearDamping = 0.0;
            this._overrideGravity = false;
            this._totalTorque = new Laya.Vector3(0, 0, 0);
            this._totalForce = new Laya.Vector3(0, 0, 0);
            this._linearVelocity = new Laya.Vector3();
            this._angularVelocity = new Laya.Vector3();
            this._linearFactor = new Laya.Vector3(1, 1, 1);
            this._angularFactor = new Laya.Vector3(1, 1, 1);
            this._detectCollisions = true;
            this._allowSleep = false;
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, 1);
        }
        getCapable(value) {
            return btRigidBodyCollider.getRigidBodyCapable(value);
        }
        static getRigidBodyCapable(value) {
            return this._rigidBodyCapableMap.get(value);
        }
        static initCapable() {
            this._rigidBodyCapableMap = new Map();
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_AllowTrigger, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_CollisionGroup, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_Friction, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_Restitution, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_RollingFriction, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_DynamicFriction, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_StaticFriction, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_BounceCombine, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_FrictionCombine, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_EventFilter, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.Collider_CollisionDetectionMode, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_AllowSleep, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_Gravity, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_LinearDamp, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_AngularDamp, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_LinearVelocity, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_AngularVelocity, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_Mass, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_InertiaTensor, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_MassCenter, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_MaxAngularVelocity, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_MaxDepenetrationVelocity, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_SleepThreshold, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_SleepAngularVelocity, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_SolverIterations, false);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_AllowDetectionMode, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_AllowKinematic, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_LinearFactor, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_AngularFactor, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyForce, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_ClearForce, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyForceWithOffset, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyTorque, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyImpulse, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyTorqueImpulse, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_WorldPosition, true);
            this._rigidBodyCapableMap.set(Laya.EColliderCapable.RigidBody_WorldOrientation, true);
        }
        setWorldPosition(value) {
            var btColliderObject = this._btCollider;
            btStatics.bt.btRigidBody_setCenterOfMassPos(btColliderObject, value.x, value.y, value.z);
        }
        setWorldRotation(value) {
            var btColliderObject = this._btCollider;
            btStatics.bt.btRigidBody_setCenterOfMassOrientation(btColliderObject, value.x, value.y, value.z, value.w);
        }
        sleep() {
            this._allowSleep = true;
        }
        getColliderType() {
            return this._type = exports.btColliderType.RigidbodyCollider;
        }
        _setoverrideGravity(value) {
            this._overrideGravity = value;
            if (this._btCollider) {
                var flag = btStatics.bt.btRigidBody_getFlags(this._btCollider);
                if (value) {
                    if ((flag & btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY) === 0)
                        btStatics.bt.btRigidBody_setFlags(this._btCollider, flag | btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY);
                }
                else {
                    if ((flag & btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY) > 0)
                        btStatics.bt.btRigidBody_setFlags(this._btCollider, flag ^ btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY);
                }
            }
        }
        _updateMass(mass) {
            if (this._btCollider && this._btColliderShape && this._btColliderShape._btShape) {
                let bt = btStatics.bt;
                bt.btCollisionShape_calculateLocalInertia(this._btColliderShape._btShape, mass, btRigidBodyCollider._btInertia);
                bt.btRigidBody_setMassProps(this._btCollider, mass, btRigidBodyCollider._btInertia);
                bt.btRigidBody_updateInertiaTensor(this._btCollider);
            }
        }
        isSleeping() {
            if (this._btCollider)
                return btStatics.bt.btCollisionObject_getActivationState(this._btCollider) === btStatics.ACTIVATIONSTATE_ISLAND_SLEEPING || btStatics.bt.btCollisionObject_getActivationState(this._btCollider) === btStatics.ACTIVATIONSTATE_DISABLE_DEACTIVATION;
            return false;
        }
        _initCollider() {
            let bt = btStatics.bt;
            var motionState = bt.layaMotionState_create();
            bt.layaMotionState_set_rigidBodyID(motionState, this._id);
            this._btLayaMotionState = motionState;
            var constructInfo = bt.btRigidBodyConstructionInfo_create(0.0, motionState, null, btRigidBodyCollider._btVector3Zero);
            var btRigid = bt.btRigidBody_create(constructInfo);
            bt.btCollisionObject_setUserIndex(btRigid, this._id);
            this._btCollider = btRigid;
            bt.btRigidBodyConstructionInfo_destroy(constructInfo);
            super._initCollider();
            this.setMass(this._mass);
            this.setConstraints(this._linearFactor, this._angularFactor);
            this.setLinearDamping(this._linearDamping);
            this.setLinearVelocity(this._linearVelocity);
            this.setAngularDamping(this._angularDamping);
            this.setIsKinematic(this._isKinematic);
            this.setInertiaTensor(this._gravity);
        }
        _onShapeChange() {
            super._onShapeChange();
            if (this._mass <= 0)
                return;
            if (this._btColliderShape instanceof btMeshColliderShape && !this._btColliderShape.convex) {
                console.warn("btRigidBodyCollider: TriangleMeshShap performance is poor, please use convex.");
            }
            if (this._isKinematic) {
                this._updateMass(0);
            }
            else {
                btStatics.bt.btRigidBody_setCenterOfMassTransform(this._btCollider, btStatics.bt.btCollisionObject_getWorldTransform(this._btCollider));
                this._updateMass(this._mass);
            }
        }
        setLinearDamping(value) {
            this._linearDamping = value;
            if (this._btCollider)
                btStatics.bt.btRigidBody_setDamping(this._btCollider, value, this._angularDamping);
        }
        setAngularDamping(value) {
            this._angularDamping = value;
            if (this._btCollider)
                btStatics.bt.btRigidBody_setDamping(this._btCollider, this._linearDamping, value);
        }
        setLinearVelocity(value) {
            this._linearVelocity = value;
            if (this._btCollider) {
                var btValue = btRigidBodyCollider._btTempVector30;
                convertToBulletVec3(value, btValue);
                (this.isSleeping()) && (this.wakeUp());
                btStatics.bt.btRigidBody_setLinearVelocity(this._btCollider, btValue);
            }
        }
        getLinearVelocity() {
            let bt = btStatics.bt;
            let velocity = bt.btRigidBody_getLinearVelocity(this._btCollider);
            btRigidBodyCollider._RBtempVector30.setValue(bt.btVector3_x(velocity), bt.btVector3_y(velocity), bt.btVector3_z(velocity));
            return btRigidBodyCollider._RBtempVector30;
        }
        setSleepLinearVelocity(value) {
            btStatics.bt.btRigidBody_setSleepingThresholds(this._btCollider, value, btStatics.bt.btRigidBody_getAngularSleepingThreshold(this._btCollider));
        }
        setAngularVelocity(value) {
            this._angularVelocity = value;
            if (this._btCollider) {
                var btValue = btRigidBodyCollider._btTempVector30;
                convertToBulletVec3(value, btValue);
                (this.isSleeping()) && (this.wakeUp());
                btStatics.bt.btRigidBody_setAngularVelocity(this._btCollider, btValue);
            }
        }
        getAngularVelocity() {
            let bt = btStatics.bt;
            let angVelocity = bt.btRigidBody_getAngularVelocity(this._btCollider);
            btRigidBodyCollider._RBtempVector30.setValue(bt.btVector3_x(angVelocity), bt.btVector3_y(angVelocity), bt.btVector3_z(angVelocity));
            return btRigidBodyCollider._RBtempVector30;
        }
        setMass(value) {
            value = Math.max(value, 1e-07);
            this._mass = value;
            (this._isKinematic) || (this._updateMass(value));
        }
        setInertiaTensor(value) {
            this._gravity = value;
            let bt = btStatics.bt;
            bt.btVector3_setValue(btRigidBodyCollider._btGravity, value.x, value.y, value.z);
            bt.btRigidBody_setGravity(this._btCollider, btRigidBodyCollider._btGravity);
            if (value.equal(this._physicsManager._gravity)) {
                this._setoverrideGravity(false);
            }
            else {
                this._setoverrideGravity(true);
            }
        }
        setCenterOfMass(value) {
            var btColliderObject = this._btCollider;
            btStatics.bt.btRigidBody_setCenterOfMassPos(btColliderObject, value.x, value.y, value.z);
        }
        setMaxAngularVelocity(value) {
            throw new Laya.NotImplementedError();
        }
        setMaxDepenetrationVelocity(value) {
            throw new Laya.NotImplementedError();
        }
        setSleepThreshold(value) {
            this._btCollider && btStatics.bt.btRigidBody_setSleepingThresholds(this._btCollider, value, btStatics.bt.btRigidBody_getAngularSleepingThreshold(this._btCollider));
        }
        setSleepAngularThreshold(value) {
            this._btCollider && btStatics.bt.btRigidBody_setSleepingThresholds(this._btCollider, btStatics.bt.btRigidBody_getLinearSleepingThreshold(this._btCollider), value);
        }
        setSolverIterations(value) {
            throw new Laya.NotImplementedError();
        }
        setCollisionDetectionMode(value) {
            var canInSimulation = this._isSimulate;
            canInSimulation && this._physicsManager.removeCollider(this);
            if (value & 3) {
                this._isKinematic = true;
                canInSimulation && this._updateMass(0);
            }
            else {
                canInSimulation && this._updateMass(this._mass);
            }
            btStatics.bt.btCollisionObject_setCollisionFlags(this._btCollider, value);
            canInSimulation && this._physicsManager.addCollider(this);
        }
        setIsKinematic(value) {
            this._isKinematic = value;
            let bt = btStatics.bt;
            let oldSimulate = this._isSimulate;
            oldSimulate && this._physicsManager.removeCollider(this);
            var natColObj = this._btCollider;
            var flags = bt.btCollisionObject_getCollisionFlags(natColObj);
            if (value) {
                flags = flags | btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT;
                bt.btCollisionObject_setCollisionFlags(natColObj, flags);
                bt.btCollisionObject_forceActivationState(this._btCollider, btStatics.ACTIVATIONSTATE_DISABLE_DEACTIVATION);
                this._enableProcessCollisions = false;
                this._updateMass(0);
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaKinematicRigidBody, 1);
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, -1);
            }
            else {
                if ((flags & btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
                    flags = flags ^ btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT;
                bt.btCollisionObject_setCollisionFlags(natColObj, flags);
                bt.btCollisionObject_setActivationState(this._btCollider, btStatics.ACTIVATIONSTATE_ACTIVE_TAG);
                this._enableProcessCollisions = true;
                this._updateMass(this._mass);
            }
            var btZero = btRigidBodyCollider._btVector3Zero;
            bt.btCollisionObject_setInterpolationLinearVelocity(natColObj, btZero);
            bt.btRigidBody_setLinearVelocity(natColObj, btZero);
            bt.btCollisionObject_setInterpolationAngularVelocity(natColObj, btZero);
            bt.btRigidBody_setAngularVelocity(natColObj, btZero);
            oldSimulate && this._physicsManager.addCollider(this);
        }
        setConstraints(linearFactor, angularFactor) {
            linearFactor.cloneTo(linearFactor);
            var btValue = btRigidBodyCollider._btTempVector30;
            convertToBulletVec3(linearFactor, btValue);
            btStatics.bt.btRigidBody_setLinearFactor(this._btCollider, btValue);
            angularFactor.cloneTo(this._angularFactor);
            var btValue = btRigidBodyCollider._btTempVector30;
            convertToBulletVec3(angularFactor, btValue);
            btStatics.bt.btRigidBody_setAngularFactor(this._btCollider, btValue);
        }
        setTrigger(value) {
            this._isTrigger = value;
            if (this._btCollider) {
                var flags = btStatics.bt.btCollisionObject_getCollisionFlags(this._btCollider);
                if (value) {
                    if ((flags & btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE) === 0)
                        btStatics.bt.btCollisionObject_setCollisionFlags(this._btCollider, flags | btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
                }
                else {
                    if ((flags & btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE) !== 0)
                        btStatics.bt.btCollisionObject_setCollisionFlags(this._btCollider, flags ^ btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
                }
            }
        }
        _applyForce(force, localOffset = null) {
            if (this._btCollider == null)
                throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
            let bt = btStatics.bt;
            var btForce = btRigidBodyCollider._btTempVector30;
            bt.btVector3_setValue(btForce, force.x, force.y, force.z);
            this.wakeUp();
            if (localOffset) {
                var btOffset = btRigidBodyCollider._btTempVector31;
                bt.btVector3_setValue(btOffset, localOffset.x, localOffset.y, localOffset.z);
                bt.btRigidBody_applyForce(this._btCollider, btForce, btOffset);
            }
            else {
                bt.btRigidBody_applyCentralForce(this._btCollider, btForce);
            }
        }
        _applyTorque(torque) {
            if (this._btCollider == null)
                throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
            var btTorque = btRigidBodyCollider._btTempVector30;
            this.wakeUp();
            btStatics.bt.btVector3_setValue(btTorque, torque.x, torque.y, torque.z);
            btStatics.bt.btRigidBody_applyTorque(this._btCollider, btTorque);
        }
        _applyImpulse(impulse, localOffset = null) {
            if (this._btCollider == null)
                throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
            let bt = btStatics.bt;
            bt.btVector3_setValue(btRigidBodyCollider._btImpulse, impulse.x, impulse.y, impulse.z);
            this.wakeUp();
            if (localOffset) {
                bt.btVector3_setValue(btRigidBodyCollider._btImpulseOffset, localOffset.x, localOffset.y, localOffset.z);
                bt.btRigidBody_applyImpulse(this._btCollider, btRigidBodyCollider._btImpulse, btRigidBodyCollider._btImpulseOffset);
            }
            else {
                bt.btRigidBody_applyCentralImpulse(this._btCollider, btRigidBodyCollider._btImpulse);
            }
        }
        _applyTorqueImpulse(torqueImpulse) {
            if (this._btCollider == null)
                throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
            var btTorqueImpulse = btRigidBodyCollider._btTempVector30;
            this.wakeUp();
            btStatics.bt.btVector3_setValue(btTorqueImpulse, torqueImpulse.x, torqueImpulse.y, torqueImpulse.z);
            btStatics.bt.btRigidBody_applyTorqueImpulse(this._btCollider, btTorqueImpulse);
        }
        addForce(force, mode, localOffset) {
            switch (mode) {
                case Laya.PhysicsForceMode.Force:
                    this._applyForce(force, localOffset);
                    break;
                case Laya.PhysicsForceMode.Impulse:
                    this._applyImpulse(force, localOffset);
                    break;
            }
        }
        addTorque(torque, mode) {
            switch (mode) {
                case Laya.PhysicsForceMode.Force:
                    this._applyTorque(torque);
                    break;
                case Laya.PhysicsForceMode.Impulse:
                    this._applyTorqueImpulse(torque);
                    break;
            }
        }
        clearForces() {
            var rigidBody = this._btCollider;
            if (rigidBody == null)
                throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
            let bt = btStatics.bt;
            bt.btRigidBody_clearForces(rigidBody);
            var btZero = btRigidBodyCollider._btVector3Zero;
            bt.btCollisionObject_setInterpolationLinearVelocity(rigidBody, btZero);
            bt.btRigidBody_setLinearVelocity(rigidBody, btZero);
            bt.btCollisionObject_setInterpolationAngularVelocity(rigidBody, btZero);
            bt.btRigidBody_setAngularVelocity(rigidBody, btZero);
        }
        wakeUp() {
            this._btCollider && (btStatics.bt.btCollisionObject_activate(this._btCollider, false));
        }
        _derivePhysicsTransformation(force) {
            let bt = btStatics.bt;
            var btColliderObject = this._btCollider;
            var oriTransform = bt.btCollisionObject_getWorldTransform(btColliderObject);
            var transform = btRigidBodyCollider._btTransform0;
            bt.btTransform_equal(transform, oriTransform);
            this._innerDerivePhysicsTransformation(transform, force);
            bt.btRigidBody_setCenterOfMassTransform(btColliderObject, transform);
        }
        _onScaleChange(scale) {
            super._onScaleChange(scale);
            this.setMass(this._isKinematic ? 0 : this._mass);
        }
        setColliderShape(shape) {
            super.setColliderShape(shape);
        }
        destroy() {
            if (this._isKinematic) {
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaKinematicRigidBody, -1);
            }
            else {
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, -1);
            }
            btStatics.bt.btMotionState_destroy(this._btLayaMotionState);
            super.destroy();
        }
    }
    btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY = 1;
    btRigidBodyCollider._BT_ENABLE_GYROPSCOPIC_FORCE = 2;

    class btStaticCollider extends btCollider {
        static __init__() {
            btStaticCollider.initCapable();
        }
        _initCollider() {
            let bt = btStatics.bt;
            var btColObj = bt.btCollisionObject_create();
            bt.btCollisionObject_setUserIndex(btColObj, this._id);
            bt.btCollisionObject_forceActivationState(btColObj, btStatics.ACTIVATIONSTATE_DISABLE_SIMULATION);
            var flags = bt.btCollisionObject_getCollisionFlags(btColObj);
            if ((this.owner).isStatic) {
                if ((flags & btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
                    flags = flags ^ btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT;
                flags = flags | btStatics.COLLISIONFLAGS_STATIC_OBJECT;
            }
            else {
                if ((flags & btStatics.COLLISIONFLAGS_STATIC_OBJECT) > 0)
                    flags = flags ^ btStatics.COLLISIONFLAGS_STATIC_OBJECT;
                flags = flags | btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT;
            }
            bt.btCollisionObject_setCollisionFlags(btColObj, flags);
            this._btCollider = btColObj;
        }
        setTrigger(value) {
            this._isTrigger = value;
            let bt = btStatics.bt;
            if (this._btCollider) {
                var flags = bt.btCollisionObject_getCollisionFlags(this._btCollider);
                if (value) {
                    if ((flags & btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE) === 0)
                        bt.btCollisionObject_setCollisionFlags(this._btCollider, flags | btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
                }
                else {
                    if ((flags & btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE) !== 0)
                        bt.btCollisionObject_setCollisionFlags(this._btCollider, flags ^ btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
                }
            }
        }
        allowSleep(value) {
            if (this._btCollider) {
                let bt = btStatics.bt;
                if (value) {
                    bt.btCollisionObject_forceActivationState(this._btCollider, btStatics.ACTIVATIONSTATE_ISLAND_SLEEPING);
                }
                else {
                    bt.btCollisionObject_forceActivationState(this._btCollider, btStatics.ACTIVATIONSTATE_DISABLE_SIMULATION);
                }
            }
        }
        getColliderType() {
            return exports.btColliderType.StaticCollider;
        }
        getCapable(value) {
            return btStaticCollider.getStaticColliderCapable(value);
        }
        constructor(physicsManager) {
            super(physicsManager);
            this._enableProcessCollisions = false;
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaStaticRigidBody, 1);
        }
        static getStaticColliderCapable(value) {
            return this._staticCapableMap.get(value);
        }
        static initCapable() {
            this._staticCapableMap = new Map();
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_AllowTrigger, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_CollisionGroup, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_Friction, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_Restitution, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_RollingFriction, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_DynamicFriction, false);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_StaticFriction, false);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_BounceCombine, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_FrictionCombine, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_EventFilter, false);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_CollisionDetectionMode, false);
            this._staticCapableMap.set(Laya.EColliderCapable.RigidBody_AllowSleep, true);
        }
        setWorldPosition(value) {
            var btColliderObject = this._btCollider;
            btStatics.bt.btRigidBody_setCenterOfMassPos(btColliderObject, value.x, value.y, value.z);
        }
        destroy() {
            this._btCollider = null;
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaStaticRigidBody, -1);
        }
    }

    class CollisionTool {
        constructor() {
            this._hitResultsPoolIndex = 0;
            this._hitResultsPool = [];
            this._contactPonintsPoolIndex = 0;
            this._contactPointsPool = [];
            this._collisionsPool = [];
            this._collisions = {};
        }
        getHitResult() {
            var hitResult = this._hitResultsPool[this._hitResultsPoolIndex++];
            if (!hitResult) {
                hitResult = new Laya.HitResult();
                this._hitResultsPool.push(hitResult);
            }
            return hitResult;
        }
        recoverAllHitResultsPool() {
            this._hitResultsPoolIndex = 0;
        }
        getContactPoints() {
            var contactPoint = this._contactPointsPool[this._contactPonintsPoolIndex++];
            if (!contactPoint) {
                contactPoint = new Laya.ContactPoint();
                this._contactPointsPool.push(contactPoint);
            }
            return contactPoint;
        }
        recoverAllContactPointsPool() {
            this._contactPonintsPoolIndex = 0;
        }
        getCollision(physicComponentA, physicComponentB) {
            var collision;
            var idA = physicComponentA._id;
            var idB = physicComponentB._id;
            var subCollisionFirst = this._collisions[idA];
            if (subCollisionFirst)
                collision = subCollisionFirst[idB];
            if (!collision) {
                if (!subCollisionFirst) {
                    subCollisionFirst = {};
                    this._collisions[idA] = subCollisionFirst;
                }
                collision = this._collisionsPool.length === 0 ? new Laya.Collision() : this._collisionsPool.pop();
                collision._colliderA = physicComponentA;
                collision._colliderB = physicComponentB;
                subCollisionFirst[idB] = collision;
            }
            return collision;
        }
        recoverCollision(collision) {
            var idA = collision._colliderA._id;
            var idB = collision._colliderB._id;
            this._collisions[idA][idB] = null;
            this._collisionsPool.push(collision);
        }
        garbageCollection() {
            this._hitResultsPoolIndex = 0;
            this._hitResultsPool.length = 0;
            this._contactPonintsPoolIndex = 0;
            this._contactPointsPool.length = 0;
            this._collisionsPool.length = 0;
            for (var subCollisionsKey in this._collisionsPool) {
                var subCollisions = this._collisionsPool[subCollisionsKey];
                var wholeDelete = true;
                for (var collisionKey in subCollisions) {
                    if (subCollisions[collisionKey])
                        wholeDelete = false;
                    else
                        delete subCollisions[collisionKey];
                }
                if (wholeDelete)
                    delete this._collisionsPool[subCollisionsKey];
            }
        }
    }

    class btJoint {
        static __init__() {
            btJoint.initJointCapable();
        }
        static initJointCapable() {
            btJoint._jointCapableMap = new Map();
            btJoint._jointCapableMap.set(Laya.EJointCapable.Joint_Anchor, true);
            btJoint._jointCapableMap.set(Laya.EJointCapable.Joint_ConnectAnchor, true);
        }
        static getJointCapable(value) {
            return btJoint._jointCapableMap.get(value);
        }
        constructor(manager) {
            this._getJointFeedBack = false;
            this._disableCollisionsBetweenLinkedBodies = false;
            this._anchor = new Laya.Vector3(0);
            this._connectAnchor = new Laya.Vector3(0);
            this._currentForce = new Laya.Vector3();
            this._currentTorque = new Laya.Vector3;
            this._manager = manager;
            this.initJoint();
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsJoint, 1);
        }
        _createJoint() {
        }
        destroy() {
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsJoint, -1);
        }
        setCollider(collider) {
            if (collider == this._collider)
                return;
            this._collider = collider;
            this._createJoint();
        }
        setConnectedCollider(collider) {
            if (collider == this._connectCollider)
                return;
            if (collider) {
                this._connectOwner = collider.owner;
            }
            this._connectCollider = collider;
            this._createJoint();
        }
        setLocalPos(pos) {
            let bt = btStatics.bt;
            this._anchor = pos;
            bt.btVector3_setValue(this._btTempVector30, this._anchor.x, this._anchor.y, this._anchor.z);
            bt.btVector3_setValue(this._btTempVector31, this._connectAnchor.x, this._connectAnchor.y, this._connectAnchor.z);
            bt.btTransform_setOrigin(this._btTempTrans0, this._btTempVector30);
            bt.btTransform_setOrigin(this._btTempTrans1, this._btTempVector31);
        }
        setConnectLocalPos(pos) {
            let bt = btStatics.bt;
            this._connectAnchor = pos;
            bt.btVector3_setValue(this._btTempVector30, this._anchor.x, this._anchor.y, this._anchor.z);
            bt.btVector3_setValue(this._btTempVector31, this._connectAnchor.x, this._connectAnchor.y, this._connectAnchor.z);
            bt.btTransform_setOrigin(this._btTempTrans0, this._btTempVector30);
            bt.btTransform_setOrigin(this._btTempTrans1, this._btTempVector31);
        }
        getlinearForce() {
            throw new Laya.NotImplementedError();
        }
        getAngularForce() {
            throw new Laya.NotImplementedError();
        }
        isValid() {
            throw new Laya.NotImplementedError();
        }
        isEnable(value) {
            btStatics.bt.btTypedConstraint_setEnabled(this._btJoint, value);
        }
        isCollision(value) {
            this._disableCollisionsBetweenLinkedBodies = !value;
            this._createJoint();
        }
        initJoint() {
            let bt = btStatics.bt;
            this._breakForce = -1;
            this._breakTorque = -1;
            this._btTempVector30 = bt.btVector3_create(0, 0, 0);
            this._btTempVector31 = bt.btVector3_create(0, 0, 0);
            this._btTempTrans0 = bt.btTransform_create();
            this._btTempTrans1 = bt.btTransform_create();
            bt.btTransform_setIdentity(this._btTempTrans0);
            bt.btTransform_setOrigin(this._btTempTrans0, this._btTempVector30);
            bt.btTransform_setIdentity(this._btTempTrans1);
            bt.btTransform_setOrigin(this._btTempTrans1, this._btTempVector31);
        }
        setOwner(owner) {
            this.owner = owner;
        }
        _isBreakConstrained() {
            this._getJointFeedBack = false;
            if (this._breakForce == -1 && this._breakTorque == -1)
                return false;
            this._btFeedBackInfo();
            var isBreakForce = this._breakForce != -1 && (Laya.Vector3.scalarLength(this._currentForce) > this._breakForce);
            var isBreakTorque = this._breakTorque != -1 && (Laya.Vector3.scalarLength(this._currentTorque) > this._breakTorque);
            if (isBreakForce || isBreakTorque) {
                this.setConnectedCollider(null);
                return true;
            }
            return false;
        }
        _btFeedBackInfo() {
            var bt = btStatics.bt;
            var applyForce = bt.btJointFeedback_getAppliedForceBodyA(this._btJointFeedBackObj);
            var applyTorque = bt.btJointFeedback_getAppliedTorqueBodyA(this._btJointFeedBackObj);
            this._currentTorque.setValue(bt.btVector3_x(applyTorque), bt.btVector3_y(applyTorque), bt.btVector3_z(applyTorque));
            this._currentForce.setValue(bt.btVector3_x(applyForce), bt.btVector3_y(applyForce), bt.btVector3_z(applyForce));
            this._getJointFeedBack = true;
        }
        setConnectedMassScale(value) {
            throw new Laya.NotImplementedError();
        }
        setConnectedInertiaScale(value) {
            throw new Laya.NotImplementedError();
        }
        setMassScale(value) {
            throw new Laya.NotImplementedError();
        }
        setInertiaScale(value) {
            throw new Laya.NotImplementedError();
        }
        setBreakForce(value) {
            this._breakForce = value;
        }
        setBreakTorque(value) {
            this._breakTorque = value;
        }
    }
    btJoint.CONSTRAINT_POINT2POINT_CONSTRAINT_TYPE = 3;
    btJoint.CONSTRAINT_HINGE_CONSTRAINT_TYPE = 4;
    btJoint.CONSTRAINT_CONETWIST_CONSTRAINT_TYPE = 5;
    btJoint.CONSTRAINT_D6_CONSTRAINT_TYPE = 6;
    btJoint.CONSTRAINT_SLIDER_CONSTRAINT_TYPE = 7;
    btJoint.CONSTRAINT_CONTACT_CONSTRAINT_TYPE = 8;
    btJoint.CONSTRAINT_D6_SPRING_CONSTRAINT_TYPE = 9;
    btJoint.CONSTRAINT_GEAR_CONSTRAINT_TYPE = 10;
    btJoint.CONSTRAINT_FIXED_CONSTRAINT_TYPE = 11;
    btJoint.CONSTRAINT_MAX_CONSTRAINT_TYPE = 12;
    btJoint.CONSTRAINT_CONSTRAINT_ERP = 1;
    btJoint.CONSTRAINT_CONSTRAINT_STOP_ERP = 2;
    btJoint.CONSTRAINT_CONSTRAINT_CFM = 3;
    btJoint.CONSTRAINT_CONSTRAINT_STOP_CFM = 4;

    class btCustomJoint extends btJoint {
        initJoint() {
            super.initJoint();
            this._btAxis = btStatics.bt.btVector3_create(-1.0, 0.0, 0.0);
            this._btsceondAxis = btStatics.bt.btVector3_create(0.0, 1.0, 0.0);
        }
        _createJoint() {
            let bt = btStatics.bt;
            this._manager && this._manager.removeJoint(this);
            if (this._collider && this._connectCollider) {
                this._btJoint = bt.btGeneric6DofSpring2Constraint_create(this._collider._btCollider, this._btTempTrans0, this._connectCollider._btCollider, this._btTempTrans1, 0);
                this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
                bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
                bt.btTypedConstraint_setEnabled(this._btJoint, true);
                this._initAllConstraintInfo();
                this._manager && this._manager.addJoint(this);
            }
        }
        _initAllConstraintInfo() {
            this.setMotion(Laya.D6Axis.eLOCKED, Laya.D6MotionType.eX);
            this.setMotion(Laya.D6Axis.eLOCKED, Laya.D6MotionType.eY);
            this.setMotion(Laya.D6Axis.eLOCKED, Laya.D6MotionType.eZ);
            this.setMotion(Laya.D6Axis.eLOCKED, Laya.D6MotionType.eTWIST);
            this.setMotion(Laya.D6Axis.eLOCKED, Laya.D6MotionType.eSWING1);
            this.setMotion(Laya.D6Axis.eLOCKED, Laya.D6MotionType.eSWING2);
        }
        constructor(manager) {
            super(manager);
            this._minAngularXLimit = 0;
            this._maxAngularXLimit = 0;
            this._minAngularYLimit = 0;
            this._maxAngularYLimit = 0;
            this._minAngularZLimit = 0;
            this._maxAngularZLimit = 0;
            this._minLinearLimit = 0;
            this._maxLinearLimit = 0;
            this._linearXMotion = Laya.D6Axis.eFREE;
            this._linearYMotion = Laya.D6Axis.eFREE;
            this._linearZMotion = Laya.D6Axis.eFREE;
            this._angularXMotion = Laya.D6Axis.eFREE;
            this._angularYMotion = Laya.D6Axis.eFREE;
            this._angularZMotion = Laya.D6Axis.eFREE;
            this._axis = new Laya.Vector3(1, 0, 0);
            this._secondAxis = new Laya.Vector3(0, 1, 0);
            this._btAxis = 0;
            this._btsceondAxis = 0;
        }
        setEquilibriumPoint(axis, equilibriumPoint) {
            btStatics.bt.btGeneric6DofSpring2Constraint_setEquilibriumPoint(this._btJoint, axis, equilibriumPoint);
        }
        setLocalPos(pos) {
            super.setLocalPos(pos);
            this._btJoint && btStatics.bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
        }
        setConnectLocalPos(pos) {
            super.setConnectLocalPos(pos);
            this._btJoint && btStatics.bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
        }
        setAxis(axis, secendary) {
            var bt = btStatics.bt;
            this._axis.setValue(axis.x, axis.y, axis.y);
            this._secondAxis.setValue(secendary.x, secendary.y, secendary.z);
            this._btAxis = bt.btVector3_setValue(-axis.x, axis.y, axis.z);
            this._btsceondAxis = bt.btVector3_setValue(-secendary.x, secendary.y, secendary.z);
            bt.btGeneric6DofSpring2Constraint_setAxis(this._btJoint, this._btAxis, this._btsceondAxis);
        }
        _setLimit(axis, motionType, low, high) {
            let lowLimit = 0;
            let maxLimit = 0;
            if (motionType == Laya.D6MotionType.eX || motionType == Laya.D6MotionType.eY || motionType == Laya.D6MotionType.eZ) {
                lowLimit = this._minLinearLimit;
                maxLimit = this._maxLinearLimit;
            }
            else {
                if (motionType == Laya.D6MotionType.eTWIST) {
                    lowLimit = this._minAngularXLimit;
                    maxLimit = this._maxAngularXLimit;
                }
                else if (motionType == Laya.D6MotionType.eSWING1) {
                    lowLimit = this._minAngularYLimit;
                    maxLimit = this._maxAngularYLimit;
                }
                else if (motionType == Laya.D6MotionType.eSWING2) {
                    lowLimit = this._minAngularZLimit;
                    maxLimit = this._maxAngularZLimit;
                }
            }
            let bt = btStatics.bt;
            if (axis == Laya.D6Axis.eFREE) {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, 1, 0);
            }
            else if (axis == Laya.D6Axis.eLIMITED) {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, lowLimit, maxLimit);
            }
            else if (axis == Laya.D6Axis.eLOCKED) {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, 0, 0);
            }
        }
        _setSpring(axis, motionType, springValue, limitIfNeeded = true) {
            let bt = btStatics.bt;
            var enableSpring = springValue > 0 && axis == Laya.D6Axis.eLIMITED;
            bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, motionType, enableSpring);
            if (enableSpring)
                bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, motionType, springValue, limitIfNeeded);
        }
        _setBounce(axis, motionType, bounce) {
            if (axis == Laya.D6Axis.eLIMITED) {
                bounce = bounce <= 0 ? 0 : bounce;
                btStatics.bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, motionType, bounce);
            }
        }
        _setDamp(axis, motionType, damp, limitIfNeeded = true) {
            if (axis == Laya.D6Axis.eLIMITED) {
                damp = damp <= 0 ? 0 : damp;
                btStatics.bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, motionType, damp, limitIfNeeded);
            }
        }
        setMotion(axis, motionType) {
            switch (motionType) {
                case Laya.D6MotionType.eX:
                    this._linearXMotion = axis;
                    break;
                case Laya.D6MotionType.eY:
                    this._linearYMotion = axis;
                    break;
                case Laya.D6MotionType.eZ:
                    this._linearZMotion = axis;
                    break;
                case Laya.D6MotionType.eTWIST:
                    this._angularXMotion = axis;
                    break;
                case Laya.D6MotionType.eSWING1:
                    this._angularYMotion = axis;
                    break;
                case Laya.D6MotionType.eSWING2:
                    this._angularZMotion = axis;
                    break;
            }
            this._setLimit(axis, motionType);
        }
        setDistanceLimit(limit, bounceness, bounceThreshold, spring, damp) {
            this._minLinearLimit = -limit;
            this._maxLinearLimit = limit;
            this._setLimit(this._linearXMotion, Laya.D6MotionType.eX);
            this._setLimit(this._linearYMotion, Laya.D6MotionType.eY);
            this._setLimit(this._linearZMotion, Laya.D6MotionType.eZ);
            this._setSpring(this._linearXMotion, Laya.D6MotionType.eX, spring);
            this._setSpring(this._linearYMotion, Laya.D6MotionType.eX, spring);
            this._setSpring(this._linearZMotion, Laya.D6MotionType.eX, spring);
            this._setBounce(this._linearXMotion, Laya.D6MotionType.eX, bounceness);
            this._setBounce(this._linearYMotion, Laya.D6MotionType.eY, bounceness);
            this._setBounce(this._linearZMotion, Laya.D6MotionType.eZ, bounceness);
            this._setDamp(this._linearXMotion, Laya.D6MotionType.eX, damp);
            this._setDamp(this._linearYMotion, Laya.D6MotionType.eY, damp);
            this._setDamp(this._linearZMotion, Laya.D6MotionType.eZ, damp);
        }
        setLinearLimit(linearAxis, upper, lower, bounceness, bounceThreshold, spring, damping) {
            this._minLinearLimit = lower;
            this._maxLinearLimit = upper;
            this._setLimit(this._linearXMotion, linearAxis);
            this._setLimit(this._linearYMotion, linearAxis);
            this._setLimit(this._linearZMotion, linearAxis);
            this._setSpring(this._linearXMotion, linearAxis, spring);
            this._setSpring(this._linearYMotion, linearAxis, spring);
            this._setSpring(this._linearZMotion, linearAxis, spring);
            this._setBounce(this._linearXMotion, linearAxis, bounceness);
            this._setBounce(this._linearYMotion, linearAxis, bounceness);
            this._setBounce(this._linearZMotion, linearAxis, bounceness);
            this._setDamp(this._linearXMotion, linearAxis, damping);
            this._setDamp(this._linearYMotion, linearAxis, damping);
            this._setDamp(this._linearZMotion, linearAxis, damping);
        }
        setTwistLimit(upper, lower, bounceness, bounceThreshold, spring, damping) {
            this._minAngularYLimit = lower / Math.PI * 180;
            this._maxAngularYLimit = upper / Math.PI * 180;
            this._setLimit(this._angularXMotion, Laya.D6MotionType.eTWIST);
            this._setLimit(this._angularYMotion, Laya.D6MotionType.eSWING1);
            this._setLimit(this._angularZMotion, Laya.D6MotionType.eSWING2);
            this._setSpring(this._angularXMotion, Laya.D6MotionType.eTWIST, spring);
            this._setSpring(this._angularYMotion, Laya.D6MotionType.eSWING1, spring);
            this._setSpring(this._angularZMotion, Laya.D6MotionType.eSWING2, spring);
            this._setBounce(this._angularXMotion, Laya.D6MotionType.eTWIST, bounceness);
            this._setBounce(this._angularYMotion, Laya.D6MotionType.eSWING1, bounceness);
            this._setBounce(this._angularZMotion, Laya.D6MotionType.eSWING2, bounceness);
            this._setDamp(this._angularXMotion, Laya.D6MotionType.eTWIST, damping);
            this._setDamp(this._angularYMotion, Laya.D6MotionType.eSWING1, damping);
            this._setDamp(this._angularZMotion, Laya.D6MotionType.eSWING2, damping);
        }
        setSwingLimit(yAngle, zAngle, bounceness, bounceThreshold, spring, damping) {
            this._minAngularYLimit = -yAngle / Math.PI * 180;
            this._maxAngularYLimit = yAngle / Math.PI * 180;
            this._minAngularZLimit = -zAngle / Math.PI * 180;
            this._maxAngularZLimit = zAngle / Math.PI * 180;
            this._setLimit(this._angularXMotion, Laya.D6MotionType.eTWIST);
            this._setLimit(this._angularYMotion, Laya.D6MotionType.eSWING1);
            this._setLimit(this._angularZMotion, Laya.D6MotionType.eSWING2);
            this._setSpring(this._angularXMotion, Laya.D6MotionType.eTWIST, spring);
            this._setSpring(this._angularYMotion, Laya.D6MotionType.eSWING1, spring);
            this._setSpring(this._angularZMotion, Laya.D6MotionType.eSWING2, spring);
            this._setBounce(this._angularXMotion, Laya.D6MotionType.eTWIST, bounceness);
            this._setBounce(this._angularYMotion, Laya.D6MotionType.eSWING1, bounceness);
            this._setBounce(this._angularZMotion, Laya.D6MotionType.eSWING2, bounceness);
            this._setDamp(this._angularXMotion, Laya.D6MotionType.eTWIST, damping);
            this._setDamp(this._angularYMotion, Laya.D6MotionType.eSWING1, damping);
            this._setDamp(this._angularZMotion, Laya.D6MotionType.eSWING2, damping);
        }
        setDrive(index, stiffness, damping, forceLimit) {
            btStatics.bt.btGeneric6DofSpring2Constraint_enableMotor(this._btJoint, index, true);
        }
        setDriveTransform(position, rotate) {
            Laya.D6Drive.eY;
        }
        setDriveVelocity(position, angular) {
            let bt = btStatics.bt;
            let axis = Laya.D6Drive.eX;
            bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.x);
            axis = Laya.D6Drive.eY;
            bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.y);
            axis = Laya.D6Drive.eZ;
            bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.z);
            axis = Laya.D6Drive.eX;
            bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.x);
            axis = Laya.D6Drive.eY;
            bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.y);
            axis = Laya.D6Drive.eZ;
            bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.z);
        }
        getTwistAngle() {
            throw new Laya.NotImplementedError();
        }
        getSwingYAngle() {
            throw new Laya.NotImplementedError();
        }
        getSwingZAngle() {
            throw new Laya.NotImplementedError();
        }
        destroy() {
            this._btJoint = null;
            this._btJointFeedBackObj = null;
            super.destroy();
        }
    }

    class btFixedJoint extends btJoint {
        constructor(manager) {
            super(manager);
        }
        _createJoint() {
            let bt = btStatics.bt;
            this._manager && this._manager.removeJoint(this);
            if (this._collider && this._connectCollider) {
                this._btJoint = bt.btFixedConstraint_create(this._collider._btCollider, this._btTempTrans0, this._connectCollider._btCollider, this._btTempTrans1, 0);
                this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
                bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
                bt.btTypedConstraint_setEnabled(this._btJoint, true);
                this._manager.addJoint(this);
            }
        }
        destroy() {
            this._btJoint = null;
            this._btJointFeedBackObj = null;
            super.destroy();
        }
    }

    class btHingeJoint extends btJoint {
        _createJoint() {
            var bt = btStatics.bt;
            this._manager && this._manager.removeJoint(this);
            if (this._collider && this._connectCollider) {
                this._btJoint = bt.btGeneric6DofSpring2Constraint_create(this._collider._btCollider, this._btTempTrans0, this._connectCollider._btCollider, this._btTempTrans1, 0);
                this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
                bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
                bt.btTypedConstraint_setEnabled(this._btJoint, true);
                this._initJointConstraintInfo();
                this._manager.addJoint(this);
            }
        }
        _initJointConstraintInfo() {
            let bt = btStatics.bt;
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btHingeJoint.ANGULAR_X, 0, 0);
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btHingeJoint.ANGULAR_Y, 0, 0);
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btHingeJoint.ANGULAR_Z, 0, 0);
        }
        constructor(manager) {
            super(manager);
            this._uperLimit = 0;
            this._lowerLimit = 1;
            this._angularAxis = 0;
            this._enableLimit = false;
            this._enableDrive = false;
        }
        setLocalPos(pos) {
            super.setLocalPos(pos);
            this._btJoint && btStatics.bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
        }
        setConnectLocalPos(pos) {
            super.setConnectLocalPos(pos);
            this._btJoint && btStatics.bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
        }
        setLowerLimit(lowerLimit) {
            if (!this._btJoint)
                return;
            if (lowerLimit == this._lowerLimit)
                return;
            this._lowerLimit = lowerLimit / Math.PI * 180;
            btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
        }
        setUpLimit(value) {
            if (!this._btJoint)
                return;
            if (value == this._uperLimit)
                return;
            this._uperLimit = value / Math.PI * 180;
            btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
        }
        setBounceness(value) {
            if (!this._btJoint)
                return;
            value = value <= 0 ? 0 : value;
            btStatics.bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, this._angularAxis, value);
        }
        setBouncenMinVelocity(value) {
        }
        setContactDistance(value) {
            throw new Laya.NotImplementedError();
        }
        enableLimit(value) {
            this._enableLimit = value;
        }
        enableDrive(value) {
            this._enableDrive = value;
            btStatics.bt.btGeneric6DofSpring2Constraint_enableMotor(this._btJoint, this._angularAxis, value);
        }
        enableFreeSpin(value) {
        }
        setAxis(value) {
            if (value.x == 1) {
                this._angularAxis = btHingeJoint.ANGULAR_X;
                if (this._enableLimit) {
                    btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
                }
                else {
                    btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, 1, 0);
                }
            }
            if (value.y == 1) {
                this._angularAxis = btHingeJoint.ANGULAR_Y;
                if (this._enableLimit) {
                    btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
                }
                else {
                    btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, 1, 0);
                }
            }
            if (value.z == 1) {
                this._angularAxis = btHingeJoint.ANGULAR_Z;
                if (this._enableLimit) {
                    btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
                }
                else {
                    btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, 1, 0);
                }
            }
        }
        setSwingOffset(value) {
            throw new Laya.NotImplementedError();
        }
        getAngle() {
            throw new Laya.NotImplementedError();
        }
        getVelocity() {
            throw new Laya.NotImplementedError();
        }
        setHardLimit(lowerLimit, upperLimit, contactDist) {
            throw new Laya.NotImplementedError();
        }
        setSoftLimit(lowerLimit, upperLimit, stiffness, damping) {
            throw new Laya.NotImplementedError();
        }
        setDriveVelocity(velocity) {
            btStatics.bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, this._angularAxis, velocity);
        }
        setDriveForceLimit(limit) {
            throw new Laya.NotImplementedError();
        }
        setDriveGearRatio(ratio) {
            throw new Laya.NotImplementedError();
        }
        setHingeJointFlag(flag, value) {
            throw new Laya.NotImplementedError();
        }
        destroy() {
            this._btJoint = null;
            this._btJointFeedBackObj = null;
            super.destroy();
        }
    }
    btHingeJoint.ANGULAR_X = 3;
    btHingeJoint.ANGULAR_Y = 4;
    btHingeJoint.ANGULAR_Z = 5;

    class btSpringJoint extends btJoint {
        _createJoint() {
            var bt = btStatics.bt;
            this._manager && this._manager.removeJoint(this);
            if (this._collider && this._connectCollider) {
                this._btJoint = bt.btGeneric6DofSpring2Constraint_create(this._collider._btCollider, this._btTempTrans0, this._connectCollider._btCollider, this._btTempTrans1, 0);
                this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
                bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
                bt.btTypedConstraint_setEnabled(this._btJoint, true);
                this._initJointConstraintInfo();
                this._manager.addJoint(this);
            }
        }
        _initJointConstraintInfo() {
            let bt = btStatics.bt;
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_X, 0, 0);
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_Y, 0, 0);
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_Z, 0, 0);
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_X, 0, 0);
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, 0, 0);
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Z, 0, 0);
        }
        constructor(manager) {
            super(manager);
            this._minDistance = 0;
            this._maxDistance = Number.MAX_VALUE;
        }
        setLocalPos(pos) {
            super.setLocalPos(pos);
            this._btJoint && btStatics.bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
        }
        setConnectLocalPos(pos) {
            super.setConnectLocalPos(pos);
            this._btJoint && btStatics.bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
        }
        setSwingOffset(value) {
            throw new Laya.NotImplementedError();
        }
        setMinDistance(distance) {
            if (!this._btJoint)
                return;
            if (distance == this._minDistance) {
                return;
            }
            this._minDistance = distance;
            btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, this._minDistance, this._maxDistance);
        }
        setMaxDistance(distance) {
            if (!this._btJoint)
                return;
            if (distance == this._maxDistance) {
                return;
            }
            this._maxDistance = distance;
            btStatics.bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, this._minDistance, this._maxDistance);
        }
        setTolerance(tolerance) {
        }
        setStiffness(stiffness) {
            var bt = btStatics.bt;
            var enableSpring = stiffness > 0;
            bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, enableSpring);
            if (enableSpring)
                bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, stiffness, true);
        }
        setDamping(damping) {
            if (!this._btJoint)
                return;
            damping = damping <= 0 ? 0 : damping;
            btStatics.bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, damping, true);
        }
        destroy() {
            this._btJoint = null;
            this._btJointFeedBackObj = null;
            super.destroy();
        }
    }
    btSpringJoint.LINEARSPRING_AXIS_X = 0;
    btSpringJoint.LINEARSPRING_AXIS_Y = 1;
    btSpringJoint.LINEARSPRING_AXIS_Z = 2;
    btSpringJoint.ANGULARSPRING_AXIS_X = 3;
    btSpringJoint.ANGULARSPRING_AXIS_Y = 4;
    btSpringJoint.ANGULARSPRING_AXIS_Z = 5;

    class btBoxColliderShape extends btColliderShape {
        constructor() {
            super();
            this._size = new Laya.Vector3(0.5, 0.5, 0.5);
            this._btSize = btStatics.bt.btVector3_create(0, 0, 0);
        }
        changeBoxShape() {
            if (this._btShape) {
                btStatics.bt.btCollisionShape_destroy(this._btShape);
            }
            this._createShape();
        }
        _createShape() {
            btStatics.bt.btVector3_setValue(this._btSize, this._size.x / 2, this._size.y / 2, this._size.z / 2);
            this._btShape = btStatics.bt.btBoxShape_create(this._btSize);
        }
        _getType() {
            return this._type = btColliderShape.SHAPETYPES_BOX;
        }
        setSize(size) {
            if (this._btShape && size.equal(this._size)) {
                return;
            }
            this._size.setValue(size.x, size.y, size.z);
            this.changeBoxShape();
        }
        destroy() {
            super.destroy();
            this._size = null;
            this._btSize = null;
        }
    }

    class btCapsuleColliderShape extends btColliderShape {
        constructor() {
            super();
            this._radius = 0.25;
            this._length = 1;
            this._orientation = btColliderShape.SHAPEORIENTATION_UPY;
        }
        _createShape() {
            let bt = btStatics.bt;
            if (this._btShape) {
                bt.btCollisionShape_destroy(this._btShape);
            }
            switch (this._orientation) {
                case btColliderShape.SHAPEORIENTATION_UPX:
                    this._btShape = bt.btCapsuleShapeX_create(this._radius, this._length - this._radius * 2);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPY:
                    this._btShape = bt.btCapsuleShape_create(this._radius, this._length - this._radius * 2);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPZ:
                    this._btShape = bt.btCapsuleShapeZ_create(this._radius, this._length - this._radius * 2);
                    break;
                default:
                    throw "CapsuleColliderShape:unknown orientation.";
            }
        }
        _getType() {
            return this._type = btColliderShape.SHAPETYPES_CAPSULE;
        }
        setRadius(radius) {
            if (this._btShape && this._radius == radius)
                return;
            this._radius = radius;
            this._createShape();
        }
        setHeight(height) {
            if (this._btShape && this._length == height)
                return;
            this._length = height;
            this._createShape();
        }
        setUpAxis(upAxis) {
            if (this._btShape && this._orientation == upAxis)
                return;
            this._orientation = upAxis;
            this._createShape();
        }
        setWorldScale(scale) {
            var fixScale = btCapsuleColliderShape._tempVector30;
            switch (this._orientation) {
                case btColliderShape.SHAPEORIENTATION_UPX:
                    fixScale.x = scale.x;
                    fixScale.y = fixScale.z = Math.max(scale.y, scale.z);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPY:
                    fixScale.y = scale.y;
                    fixScale.x = fixScale.z = Math.max(scale.x, scale.z);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPZ:
                    fixScale.z = scale.z;
                    fixScale.x = fixScale.y = Math.max(scale.x, scale.y);
                    break;
                default:
                    throw "CapsuleColliderShape:unknown orientation.";
            }
            super.setWorldScale(fixScale);
        }
        destroy() {
            super.destroy();
            this._radius = null;
            this._length = null;
            this._orientation = null;
        }
    }
    btCapsuleColliderShape._tempVector30 = new Laya.Vector3();

    class btCompoundColliderShape extends btColliderShape {
        constructor() {
            super();
            this._childColliderShapes = [];
            let bt = btStatics.bt;
            this._btVector3One = bt.btVector3_create(1, 1, 1);
            this._btTransform = bt.btTransform_create();
            this._btOffset = bt.btVector3_create(0, 0, 0);
            this._btRotation = bt.btQuaternion_create(0, 0, 0, 1);
            this._btShape = bt.btCompoundShape_create();
        }
        clearChildShape() {
            throw new Laya.NotImplementedError();
        }
        _getType() {
            return this._type = btColliderShape.SHAPETYPES_COMPOUND;
        }
        addChildShape(shape) {
            var offset = shape.getOffset();
            var bt = btStatics.bt;
            bt.btVector3_setValue(this._btOffset, offset.x, offset.y, offset.z);
            bt.btQuaternion_setValue(this._btRotation, 0, 0, 0, 1);
            bt.btTransform_setOrigin(this._btTransform, this._btOffset);
            bt.btTransform_setRotation(this._btTransform, this._btRotation);
            var btScale = bt.btCollisionShape_getLocalScaling(this._btShape);
            bt.btCollisionShape_setLocalScaling(this._btShape, this._btVector3One);
            let childShape = shape.getPhysicsShape();
            childShape && bt.btCompoundShape_addChildShape(this._btShape, this._btTransform, childShape);
            bt.btCollisionShape_setLocalScaling(this._btShape, btScale);
        }
        removeChildShape(shape, index) {
            let bt = btStatics.bt;
            bt.btCompoundShape_removeChildShapeByIndex(this._btShape, index);
        }
        setShapeData(component) {
            this._physicsComponent = component;
        }
        getChildShapeCount() {
            return this._childColliderShapes.length;
        }
        destroy() {
            super.destroy();
            this._btRotation = null;
            this._btTransform = null;
            this._btVector3One = null;
            this._btOffset = null;
        }
    }

    class btConeColliderShape extends btColliderShape {
        constructor() {
            super();
            this._radius = 0.25;
            this._length = 1;
            this._orientation = btColliderShape.SHAPEORIENTATION_UPY;
        }
        _createShape() {
            let bt = btStatics.bt;
            if (this._btShape) {
                bt.btCollisionShape_destroy(this._btShape);
            }
            switch (this._orientation) {
                case btColliderShape.SHAPEORIENTATION_UPX:
                    this._btShape = bt.btConeShapeX_create(this._radius, this._length);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPY:
                    this._btShape = bt.btConeShape_create(this._radius, this._length);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPZ:
                    this._btShape = bt.btConeShapeZ_create(this._radius, this._length);
                    break;
                default:
                    throw "CapsuleColliderShape:unknown orientation.";
            }
        }
        _getType() {
            return this._type = btColliderShape.SHAPETYPES_CONE;
        }
        setRadius(radius) {
            if (this._btShape && this._radius == radius)
                return;
            this._radius = radius;
            this._createShape();
        }
        setHeight(height) {
            if (this._btShape && this._length == height)
                return;
            this._length = height;
            this._createShape();
        }
        setUpAxis(upAxis) {
            if (this._btShape && this._orientation == upAxis)
                return;
            this._orientation = upAxis;
            this._createShape();
        }
        destroy() {
            super.destroy();
            this._radius = null;
            this._length = null;
            this._orientation = null;
        }
    }

    class btCylinderColliderShape extends btColliderShape {
        constructor() {
            super();
            this._radius = 0.25;
            this._length = 1;
            this._orientation = btColliderShape.SHAPEORIENTATION_UPY;
            this._btSize = btStatics.bt.btVector3_create(0, 0, 0);
        }
        _createShape() {
            let bt = btStatics.bt;
            if (this._btShape) {
                bt.btCollisionShape_destroy(this._btShape);
            }
            switch (this._orientation) {
                case btColliderShape.SHAPEORIENTATION_UPX:
                    bt.btVector3_setValue(this._btSize, this._length / 2, this._radius, this._radius);
                    this._btShape = bt.btCylinderShapeX_create(this._btSize);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPY:
                    bt.btVector3_setValue(this._btSize, this._radius, this._length / 2, this._radius);
                    this._btShape = bt.btCylinderShape_create(this._btSize);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPZ:
                    bt.btVector3_setValue(this._btSize, this._radius, this._radius, this._length / 2);
                    this._btShape = bt.btCylinderShapeZ_create(this._btSize);
                    break;
                default:
                    throw "CapsuleColliderShape:unknown orientation.";
            }
        }
        _getType() {
            return this._type = btColliderShape.SHAPETYPES_CYLINDER;
        }
        setRadius(radius) {
            if (this._btShape && this._radius == radius)
                return;
            this._radius = radius;
            this._createShape();
        }
        setHeight(height) {
            if (this._btShape && this._length == height)
                return;
            this._length = height;
            this._createShape();
        }
        setUpAxis(upAxis) {
            if (this._btShape && this._orientation == upAxis)
                return;
            this._orientation = upAxis;
            this._createShape();
        }
        destroy() {
            super.destroy();
            this._radius = null;
            this._length = null;
            this._orientation = null;
        }
    }
    btCylinderColliderShape._tempVector30 = new Laya.Vector3();

    class btSphereColliderShape extends btColliderShape {
        constructor() {
            super();
            this._radius = -1;
        }
        _getType() {
            return this._type = btColliderShape.SHAPETYPES_SPHERE;
        }
        _createShape() {
            if (this._btShape) {
                btStatics.bt.btCollisionShape_destroy(this._btShape);
            }
            this._btShape = btStatics.bt.btSphereShape_create(this._radius);
        }
        setRadius(radius) {
            if (this._btShape && this._radius == radius)
                return;
            this._radius = radius;
            this._createShape();
        }
        destroy() {
            super.destroy();
            this._radius = null;
        }
    }

    class BulletInteractive {
        constructor(mem, dbgline) {
            this.drawLine = (sx, sy, sz, ex, ey, ez, color) => {
                if (!this.dbgLine)
                    return;
                this.dbgLine.color(color);
                this.dbgLine.line(sx, sy, sz, ex, ey, ez);
            };
            this.clearLine = () => {
                if (!this.dbgLine)
                    return;
                this.dbgLine.clear();
            };
            this.jslog = (ptr, len) => {
                if (!this.mem)
                    return;
                let td = new TextDecoder();
                let str = new Uint8Array(this.mem.buffer, ptr, len);
                let jsstr = td.decode(str);
                console.log(jsstr);
            };
            this.mem = mem;
            this.dbgLine = dbgline;
        }
        getWorldTransform(rigidBodyID, worldTransPointer) {
        }
        setWorldTransform(rigidBodyID, worldTransPointer) {
            var rigidBody = btCollider._physicObjectsMap[rigidBodyID];
            rigidBody._physicsManager._updatedRigidbodies++;
            rigidBody._updateTransformComponent(worldTransPointer);
        }
    }

    class btPhysicsManager {
        static init() {
            let bt = btStatics.bt;
            btPhysicsManager._btTempVector30 = bt.btVector3_create(0, 0, 0);
            btPhysicsManager._btTempVector31 = bt.btVector3_create(0, 0, 0);
            btPhysicsManager._btTempQuaternion0 = bt.btQuaternion_create(0, 0, 0, 1);
            btPhysicsManager._btTempQuaternion1 = bt.btQuaternion_create(0, 0, 0, 1);
            btPhysicsManager._btTempTransform0 = bt.btTransform_create();
            btPhysicsManager._btTempTransform1 = bt.btTransform_create();
            btPhysicsManager._tempVector30 = new Laya.Vector3();
        }
        constructor(physicsSettings) {
            this.maxSubSteps = 1;
            this.fixedTimeStep = 1.0 / 60.0;
            this.enableCCD = false;
            this.ccdThreshold = 0.0001;
            this.ccdSphereRadius = 0.0001;
            this.dt = 1 / 60;
            this._gravity = new Laya.Vector3(0, -10, 0);
            this._updatedRigidbodies = 0;
            this._updateCount = 0;
            this._previousFrameCollisions = [];
            this._currentFrameCollisions = [];
            this._collisionsUtils = new CollisionTool();
            this._currentConstraint = {};
            this._physicsUpdateList = new Laya.PhysicsUpdateList();
            this._characters = [];
            let bt = btStatics.bt;
            this.maxSubSteps = physicsSettings.maxSubSteps;
            this.fixedTimeStep = physicsSettings.fixedTimeStep;
            this.enableCCD = physicsSettings.enableCCD;
            this.ccdThreshold = physicsSettings.ccdThreshold;
            this.ccdSphereRadius = physicsSettings.ccdSphereRadius;
            this._btCollisionConfiguration = bt.btDefaultCollisionConfiguration_create();
            this._btDispatcher = bt.btCollisionDispatcher_create(this._btCollisionConfiguration);
            this._btBroadphase = bt.btDbvtBroadphase_create();
            bt.btOverlappingPairCache_setInternalGhostPairCallback(bt.btDbvtBroadphase_getOverlappingPairCache(this._btBroadphase), bt.btGhostPairCallback_create());
            var conFlags = physicsSettings.flags;
            if (conFlags & btStatics.PHYSICSENGINEFLAGS_COLLISIONSONLY) {
                this._btCollisionWorld = new bt.btCollisionWorld(this._btDispatcher, this._btBroadphase, this._btCollisionConfiguration);
            }
            else if (conFlags & btStatics.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT) {
                throw "PhysicsSimulation:SoftBody processing is not yet available";
            }
            else {
                var solver = bt.btSequentialImpulseConstraintSolver_create();
                this._btDiscreteDynamicsWorld = bt.btDiscreteDynamicsWorld_create(this._btDispatcher, this._btBroadphase, solver, this._btCollisionConfiguration);
                this._btCollisionWorld = this._btDiscreteDynamicsWorld;
            }
            if (this._btDiscreteDynamicsWorld) {
                this._btSolverInfo = bt.btDynamicsWorld_getSolverInfo(this._btDiscreteDynamicsWorld);
                this._btDispatchInfo = bt.btCollisionWorld_getDispatchInfo(this._btDiscreteDynamicsWorld);
            }
            this._btVector3Zero = bt.btVector3_create(0, 0, 0);
            this._btDefaultQuaternion = bt.btQuaternion_create(0, 0, 0, -1);
            this._btClosestRayResultCallback = bt.ClosestRayResultCallback_create(this._btVector3Zero, this._btVector3Zero);
            this._btAllHitsRayResultCallback = bt.AllHitsRayResultCallback_create(this._btVector3Zero, this._btVector3Zero);
            this._btClosestConvexResultCallback = bt.ClosestConvexResultCallback_create(this._btVector3Zero, this._btVector3Zero);
            this._btAllConvexResultCallback = bt.AllConvexResultCallback_create(this._btVector3Zero, this._btVector3Zero);
            bt.btGImpactCollisionAlgorithm_RegisterAlgorithm(this._btDispatcher);
            this.initPhysicsCapable();
        }
        setActiveCollider(collider, value) {
            collider.active = value;
            if (value) {
                collider._physicsManager = this;
            }
            else {
                collider._physicsManager = null;
            }
        }
        sphereQuery(pos, radius, result, collisionmask) {
            throw new Laya.NotImplementedError;
        }
        _simulate(deltaTime) {
            this._updatedRigidbodies = 0;
            this.dt = deltaTime;
            if (this._btDiscreteDynamicsWorld)
                btStatics.bt.btDiscreteDynamicsWorld_stepSimulation(this._btDiscreteDynamicsWorld, deltaTime, this.maxSubSteps, this.fixedTimeStep);
            else
                btStatics.bt.PerformDiscreteCollisionDetection(this._btCollisionWorld);
            this._updateCount++;
        }
        _updatePhysicsTransformToRender() {
            var elements = this._physicsUpdateList.elements;
            for (var i = 0, n = this._physicsUpdateList.length; i < n; i++) {
                var physicCollider = elements[i];
                physicCollider._derivePhysicsTransformation(true);
                physicCollider.inPhysicUpdateListIndex = -1;
            }
            this._physicsUpdateList.length = 0;
        }
        _updateCollisions() {
            this._collisionsUtils.recoverAllContactPointsPool();
            var previous = this._currentFrameCollisions;
            this._currentFrameCollisions = this._previousFrameCollisions;
            this._currentFrameCollisions.length = 0;
            this._previousFrameCollisions = previous;
            var loopCount = this._updateCount;
            var bt = btStatics.bt;
            var numManifolds = bt.btDispatcher_getNumManifolds(this._btDispatcher);
            for (let i = 0; i < numManifolds; i++) {
                var contactManifold = bt.btDispatcher_getManifoldByIndexInternal(this._btDispatcher, i);
                var componentA = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.btPersistentManifold_getBody0(contactManifold))];
                var componentB = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.btPersistentManifold_getBody1(contactManifold))];
                if (componentA._id > componentB._id) {
                    let tt = componentA;
                    componentA = componentB;
                    componentB = tt;
                }
                var collision = null;
                var isFirstCollision;
                var contacts = null;
                var isTrigger = componentA._isTrigger || componentB._isTrigger;
                if (isTrigger) {
                    var numContacts = bt.btPersistentManifold_getNumContacts(contactManifold);
                    for (let j = 0; j < numContacts; j++) {
                        var pt = bt.btPersistentManifold_getContactPoint(contactManifold, j);
                        var distance = bt.btManifoldPoint_getDistance(pt);
                        if (distance <= 0) {
                            collision = this._collisionsUtils.getCollision(componentA, componentB);
                            contacts = collision.contacts;
                            isFirstCollision = collision._updateFrame !== loopCount;
                            if (isFirstCollision) {
                                collision._isTrigger = true;
                                contacts.length = 0;
                            }
                            break;
                        }
                    }
                }
                else {
                    if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) {
                        numContacts = bt.btPersistentManifold_getNumContacts(contactManifold);
                        for (let j = 0; j < numContacts; j++) {
                            pt = bt.btPersistentManifold_getContactPoint(contactManifold, j);
                            distance = bt.btManifoldPoint_getDistance(pt);
                            if (distance <= 0) {
                                var contactPoint = this._collisionsUtils.getContactPoints();
                                contactPoint._colliderA = componentA;
                                contactPoint._colliderB = componentB;
                                contactPoint.distance = distance;
                                var btNormal = bt.btManifoldPoint_get_m_normalWorldOnB(pt);
                                var normal = contactPoint.normal;
                                normal.x = bt.btVector3_x(btNormal);
                                normal.y = bt.btVector3_y(btNormal);
                                normal.z = bt.btVector3_z(btNormal);
                                var btPostionA = bt.btManifoldPoint_get_m_positionWorldOnA(pt);
                                var positionOnA = contactPoint.positionOnA;
                                positionOnA.x = bt.btVector3_x(btPostionA);
                                positionOnA.y = bt.btVector3_y(btPostionA);
                                positionOnA.z = bt.btVector3_z(btPostionA);
                                var btPostionB = bt.btManifoldPoint_get_m_positionWorldOnB(pt);
                                var positionOnB = contactPoint.positionOnB;
                                positionOnB.x = bt.btVector3_x(btPostionB);
                                positionOnB.y = bt.btVector3_y(btPostionB);
                                positionOnB.z = bt.btVector3_z(btPostionB);
                                if (!collision) {
                                    collision = this._collisionsUtils.getCollision(componentA, componentB);
                                    contacts = collision.contacts;
                                    isFirstCollision = collision._updateFrame !== loopCount;
                                    if (isFirstCollision) {
                                        collision._isTrigger = false;
                                        contacts.length = 0;
                                    }
                                }
                                contacts.push(contactPoint);
                            }
                        }
                    }
                }
                if (collision && isFirstCollision) {
                    this._currentFrameCollisions.push(collision);
                    collision._setUpdateFrame(loopCount);
                }
            }
            let _characters = this._characters;
            for (let i = 0, n = _characters.length; i < n; i++) {
                let character = _characters[i];
                let btkc = character._btKinematicCharacter;
                let collisionObjs = bt.btKinematicCharacterController_AllHitInfo_get_m_collisionObjects(btkc);
                let count = bt.tBtCollisionObjectArray_size(collisionObjs);
                if (count > 0) {
                    for (let j = 0; j < count; j++) {
                        let colobj = bt.tBtCollisionObjectArray_at(collisionObjs, j);
                        if (colobj == 0)
                            continue;
                        let collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(colobj)];
                        if (!collider)
                            continue;
                        let compa = character;
                        let compb = collider;
                        if (character._id > collider._id) {
                            compa = collider;
                            compb = character;
                        }
                        let collision = this._collisionsUtils.getCollision(compa, compb);
                        if (collision._updateFrame === loopCount)
                            return;
                        let contacts = collision.contacts;
                        contacts.length = 1;
                        collision._setUpdateFrame(loopCount);
                        var contactPoint = this._collisionsUtils.getContactPoints();
                        contactPoint._colliderA = compa;
                        contactPoint._colliderB = compb;
                        contactPoint.distance = 0;
                        contacts[0] = contactPoint;
                        let isTrigger = compa._isTrigger || compb._isTrigger;
                        collision._isTrigger = isTrigger;
                        this._currentFrameCollisions.push(collision);
                    }
                }
            }
        }
        _collision_EnterEvent(colliderA, ownerA, colliderB, ownerB, curFrameCol) {
            curFrameCol.other = colliderB;
            ownerA.event(Laya.Event.COLLISION_ENTER, curFrameCol);
            curFrameCol.other = colliderA;
            ownerB.event(Laya.Event.COLLISION_ENTER, curFrameCol);
        }
        _collision_StayEvent(colliderA, ownerA, colliderB, ownerB, curFrameCol) {
            curFrameCol.other = colliderB;
            ownerA.event(Laya.Event.COLLISION_STAY, curFrameCol);
            curFrameCol.other = colliderA;
            ownerB.event(Laya.Event.COLLISION_STAY, curFrameCol);
        }
        _collision_ExitEvent(preColliderA, ownerA, preColliderB, ownerB, preFrameCol) {
            preFrameCol.other = preColliderB;
            ownerA.event(Laya.Event.COLLISION_EXIT, preFrameCol);
            preFrameCol.other = preColliderA;
            ownerB.event(Laya.Event.COLLISION_EXIT, preFrameCol);
        }
        _trigger_EnterEvent(colliderA, ownerA, colliderB, ownerB) {
            ownerA.event(Laya.Event.TRIGGER_ENTER, colliderB);
            ownerB.event(Laya.Event.TRIGGER_ENTER, colliderA);
        }
        _trigger_StayEvent(colliderA, ownerA, colliderB, ownerB) {
            ownerA.event(Laya.Event.TRIGGER_STAY, colliderB);
            ownerB.event(Laya.Event.TRIGGER_STAY, colliderA);
        }
        _trigger_ExitEvent(preColliderA, ownerA, preColliderB, ownerB) {
            ownerA.event(Laya.Event.TRIGGER_EXIT, preColliderB);
            ownerB.event(Laya.Event.TRIGGER_EXIT, preColliderA);
        }
        dispatchCollideEvent() {
            let loopCount = this._updateCount;
            for (let i = 0, n = this._currentFrameCollisions.length; i < n; i++) {
                let curFrameCol = this._currentFrameCollisions[i];
                let colliderA = curFrameCol._colliderA.component;
                let colliderB = curFrameCol._colliderB.component;
                if (colliderA.destroyed || colliderB.destroyed)
                    continue;
                let ownerA = colliderA.owner;
                let ownerB = colliderB.owner;
                if (loopCount - curFrameCol._lastUpdateFrame === 1) {
                    if (curFrameCol._isTrigger) {
                        this._trigger_StayEvent(colliderA, ownerA, colliderB, ownerB);
                    }
                    else {
                        this._collision_StayEvent(colliderA, ownerA, colliderB, ownerB, curFrameCol);
                    }
                }
                else {
                    if (curFrameCol._isTrigger) {
                        this._trigger_EnterEvent(colliderA, ownerA, colliderB, ownerB);
                    }
                    else {
                        this._collision_EnterEvent(colliderA, ownerA, colliderB, ownerB, curFrameCol);
                    }
                }
            }
            for (let i = 0, n = this._previousFrameCollisions.length; i < n; i++) {
                let preFrameCol = this._previousFrameCollisions[i];
                let preColliderA = preFrameCol._colliderA.component;
                let preColliderB = preFrameCol._colliderB.component;
                if (preColliderA.destroyed || preColliderB.destroyed)
                    continue;
                let ownerA = preColliderA.owner;
                let ownerB = preColliderB.owner;
                if (loopCount - preFrameCol._updateFrame === 1) {
                    this._collisionsUtils.recoverCollision(preFrameCol);
                    if (preFrameCol._isTrigger) {
                        this._trigger_ExitEvent(preColliderA, ownerA, preColliderB, ownerB);
                    }
                    else {
                        this._collision_ExitEvent(preColliderA, ownerA, preColliderB, ownerB, preFrameCol);
                    }
                }
            }
            for (let id in this._currentConstraint) {
                let constraintObj = this._currentConstraint[id];
                if (constraintObj._isBreakConstrained()) {
                    let bodya = constraintObj.owner;
                    let bodyb = constraintObj._connectOwner;
                    bodya.event(Laya.Event.JOINT_BREAK);
                    bodyb.event(Laya.Event.JOINT_BREAK);
                }
            }
        }
        _updateCharacters() {
            for (var i = 0, n = this._characters.length; i < n; i++) {
                var character = this._characters[i];
                character._updateTransformComponent(btStatics.bt.btCollisionObject_getWorldTransform(character._btCollider), false, 0.04);
            }
        }
        enableDebugDrawer(value) {
            btStatics.bt.btDynamicsWorld_enableDebugDrawer(this._btDiscreteDynamicsWorld, value);
        }
        getPhysicsCapable(value) {
            return this._physicsEngineCapableMap.get(value);
        }
        initPhysicsCapable() {
            this._physicsEngineCapableMap = new Map();
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_Gravity, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_StaticCollider, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_DynamicCollider, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CharacterCollider, true);
        }
        setGravity(gravity) {
            if (!this._btDiscreteDynamicsWorld)
                throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
            gravity.cloneTo(this._gravity);
            var btGravity = btPhysicsManager._btTempVector30;
            btStatics.bt.btVector3_setValue(btGravity, gravity.x, gravity.y, gravity.z);
            btStatics.bt.btDiscreteDynamicsWorld_setGravity(this._btDiscreteDynamicsWorld, btGravity);
        }
        addCollider(collider) {
            let btcollider = collider;
            if (btcollider._isSimulate || !collider.active)
                return;
            btcollider._derivePhysicsTransformation(true);
            switch (btcollider._type) {
                case exports.btColliderType.StaticCollider:
                    btStatics.bt.btCollisionWorld_addCollisionObject(this._btCollisionWorld, btcollider._btCollider, btcollider._collisionGroup, btcollider._canCollideWith);
                    break;
                case exports.btColliderType.RigidbodyCollider:
                    this._addRigidBody(btcollider);
                    break;
                case exports.btColliderType.CharactorCollider:
                    this._addCharacter(btcollider);
                    break;
            }
            btcollider._isSimulate = true;
        }
        removeCollider(collider) {
            let btcollider = collider;
            if (btcollider.inPhysicUpdateListIndex !== -1)
                this._physicsUpdateList.remove(btcollider);
            switch (btcollider._type) {
                case exports.btColliderType.StaticCollider:
                    btStatics.bt.btCollisionWorld_removeCollisionObject(this._btCollisionWorld, btcollider._btCollider);
                    break;
                case exports.btColliderType.RigidbodyCollider:
                    this._removeRigidBody(btcollider);
                    break;
                case exports.btColliderType.CharactorCollider:
                    this._removeCharacter(btcollider);
                    break;
            }
            btcollider._isSimulate = false;
            btcollider.inScene = false;
        }
        addJoint(joint) {
            if (!this._btDiscreteDynamicsWorld)
                throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
            btStatics.bt.btCollisionWorld_addConstraint(this._btDiscreteDynamicsWorld, joint._btJoint, joint._disableCollisionsBetweenLinkedBodies);
            this._currentConstraint[joint._id] = joint;
        }
        removeJoint(joint) {
            if (!this._btDiscreteDynamicsWorld)
                throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
            btStatics.bt.btCollisionWorld_removeConstraint(this._btDiscreteDynamicsWorld, joint._btJoint);
            delete this._currentConstraint[joint._id];
        }
        update(elapsedTime) {
            this._updatePhysicsTransformToRender();
            btCollider._addUpdateList = false;
            this._simulate(elapsedTime);
            this._updateCharacters();
            btCollider._addUpdateList = true;
            this._updateCollisions();
            this.dispatchCollideEvent();
        }
        rayCast(ray, outHitResult, distance = 2147483647, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
            var from = ray.origin;
            var to = btPhysicsManager._tempVector30;
            Laya.Vector3.normalize(ray.direction, to);
            Laya.Vector3.scale(to, distance, to);
            Laya.Vector3.add(from, to, to);
            var bt = btStatics.bt;
            var rayResultCall = this._btClosestRayResultCallback;
            var rayFrom = btPhysicsManager._btTempVector30;
            var rayTo = btPhysicsManager._btTempVector31;
            bt.btVector3_setValue(rayFrom, from.x, from.y, from.z);
            bt.btVector3_setValue(rayTo, to.x, to.y, to.z);
            bt.ClosestRayResultCallback_set_m_rayFromWorld(rayResultCall, rayFrom);
            bt.ClosestRayResultCallback_set_m_rayToWorld(rayResultCall, rayTo);
            bt.RayResultCallback_set_m_collisionFilterGroup(rayResultCall, collisonGroup);
            bt.RayResultCallback_set_m_collisionFilterMask(rayResultCall, collisionMask);
            bt.RayResultCallback_set_m_collisionObject(rayResultCall, null);
            bt.RayResultCallback_set_m_closestHitFraction(rayResultCall, 1);
            bt.btCollisionWorld_rayTest(this._btCollisionWorld, rayFrom, rayTo, rayResultCall);
            if (bt.RayResultCallback_hasHit(rayResultCall)) {
                if (outHitResult) {
                    outHitResult.succeeded = true;
                    outHitResult.collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.RayResultCallback_get_m_collisionObject(rayResultCall))];
                    outHitResult.hitFraction = bt.RayResultCallback_get_m_closestHitFraction(rayResultCall);
                    var btPoint = bt.ClosestRayResultCallback_get_m_hitPointWorld(rayResultCall);
                    var point = outHitResult.point;
                    point.x = bt.btVector3_x(btPoint);
                    point.y = bt.btVector3_y(btPoint);
                    point.z = bt.btVector3_z(btPoint);
                    var btNormal = bt.ClosestRayResultCallback_get_m_hitNormalWorld(rayResultCall);
                    var normal = outHitResult.normal;
                    normal.x = bt.btVector3_x(btNormal);
                    normal.y = bt.btVector3_y(btNormal);
                    normal.z = bt.btVector3_z(btNormal);
                }
                return true;
            }
            else {
                if (outHitResult)
                    outHitResult.succeeded = false;
                return false;
            }
        }
        rayCastAll(ray, out, distance = 2147483647, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
            var from = ray.origin;
            var to = btPhysicsManager._tempVector30;
            Laya.Vector3.normalize(ray.direction, to);
            Laya.Vector3.scale(to, distance, to);
            Laya.Vector3.add(from, to, to);
            var bt = btStatics.bt;
            var rayResultCall = this._btAllHitsRayResultCallback;
            var rayFrom = btPhysicsManager._btTempVector30;
            var rayTo = btPhysicsManager._btTempVector31;
            out.length = 0;
            bt.btVector3_setValue(rayFrom, from.x, from.y, from.z);
            bt.btVector3_setValue(rayTo, to.x, to.y, to.z);
            bt.AllHitsRayResultCallback_set_m_rayFromWorld(rayResultCall, rayFrom);
            bt.AllHitsRayResultCallback_set_m_rayToWorld(rayResultCall, rayTo);
            bt.RayResultCallback_set_m_collisionFilterGroup(rayResultCall, collisonGroup);
            bt.RayResultCallback_set_m_collisionFilterMask(rayResultCall, collisionMask);
            var collisionObjects = bt.AllHitsRayResultCallback_get_m_collisionObjects(rayResultCall);
            var btPoints = bt.AllHitsRayResultCallback_get_m_hitPointWorld(rayResultCall);
            var btNormals = bt.AllHitsRayResultCallback_get_m_hitNormalWorld(rayResultCall);
            var btFractions = bt.AllHitsRayResultCallback_get_m_hitFractions(rayResultCall);
            bt.tBtCollisionObjectArray_clear(collisionObjects);
            bt.tVector3Array_clear(btPoints);
            bt.tVector3Array_clear(btNormals);
            bt.tScalarArray_clear(btFractions);
            bt.btCollisionWorld_rayTest(this._btCollisionWorld, rayFrom, rayTo, rayResultCall);
            var count = bt.tBtCollisionObjectArray_size(collisionObjects);
            if (count > 0) {
                this._collisionsUtils.recoverAllHitResultsPool();
                for (var i = 0; i < count; i++) {
                    var hitResult = this._collisionsUtils.getHitResult();
                    out.push(hitResult);
                    hitResult.succeeded = true;
                    hitResult.collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.tBtCollisionObjectArray_at(collisionObjects, i))];
                    hitResult.hitFraction = bt.tScalarArray_at(btFractions, i);
                    var btPoint = bt.tVector3Array_at(btPoints, i);
                    var pointE = hitResult.point;
                    pointE.x = bt.btVector3_x(btPoint);
                    pointE.y = bt.btVector3_y(btPoint);
                    pointE.z = bt.btVector3_z(btPoint);
                    var btNormal = bt.tVector3Array_at(btNormals, i);
                    var normal = hitResult.normal;
                    normal.x = bt.btVector3_x(btNormal);
                    normal.y = bt.btVector3_y(btNormal);
                    normal.z = bt.btVector3_z(btNormal);
                }
                return true;
            }
            else {
                return false;
            }
        }
        shapeCast(shape, fromPosition, toPosition, out, fromRotation = null, toRotation = null, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration = 0.0) {
            var bt = btStatics.bt;
            var convexResultCall = this._btClosestConvexResultCallback;
            var convexPosFrom = btPhysicsManager._btTempVector30;
            var convexPosTo = btPhysicsManager._btTempVector31;
            var convexRotFrom = btPhysicsManager._btTempQuaternion0;
            var convexRotTo = btPhysicsManager._btTempQuaternion1;
            var convexTransform = btPhysicsManager._btTempTransform0;
            var convexTransTo = btPhysicsManager._btTempTransform1;
            var sweepShape = shape._btShape;
            bt.btVector3_setValue(convexPosFrom, fromPosition.x, fromPosition.y, fromPosition.z);
            bt.btVector3_setValue(convexPosTo, toPosition.x, toPosition.y, toPosition.z);
            bt.ConvexResultCallback_set_m_collisionFilterGroup(convexResultCall, collisonGroup);
            bt.ConvexResultCallback_set_m_collisionFilterMask(convexResultCall, collisionMask);
            bt.btTransform_setOrigin(convexTransform, convexPosFrom);
            bt.btTransform_setOrigin(convexTransTo, convexPosTo);
            if (fromRotation) {
                bt.btQuaternion_setValue(convexRotFrom, fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
                bt.btTransform_setRotation(convexTransform, convexRotFrom);
            }
            else {
                bt.btTransform_setRotation(convexTransform, this._btDefaultQuaternion);
            }
            if (toRotation) {
                bt.btQuaternion_setValue(convexRotTo, toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
                bt.btTransform_setRotation(convexTransTo, convexRotTo);
            }
            else {
                bt.btTransform_setRotation(convexTransTo, this._btDefaultQuaternion);
            }
            bt.ClosestConvexResultCallback_set_m_hitCollisionObject(convexResultCall, null);
            bt.ConvexResultCallback_set_m_closestHitFraction(convexResultCall, 1);
            bt.btCollisionWorld_convexSweepTest(this._btCollisionWorld, sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
            if (bt.ConvexResultCallback_hasHit(convexResultCall)) {
                if (out) {
                    out.succeeded = true;
                    out.collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.ClosestConvexResultCallback_get_m_hitCollisionObject(convexResultCall))];
                    out.hitFraction = bt.ConvexResultCallback_get_m_closestHitFraction(convexResultCall);
                    var btPoint = bt.ClosestConvexResultCallback_get_m_hitPointWorld(convexResultCall);
                    var btNormal = bt.ClosestConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
                    var point = out.point;
                    var normal = out.normal;
                    point.x = -bt.btVector3_x(btPoint);
                    point.y = bt.btVector3_y(btPoint);
                    point.z = bt.btVector3_z(btPoint);
                    normal.x = -bt.btVector3_x(btNormal);
                    normal.y = bt.btVector3_y(btNormal);
                    normal.z = bt.btVector3_z(btNormal);
                }
                return true;
            }
            else {
                if (out)
                    out.succeeded = false;
                return false;
            }
        }
        shapeCastAll(shape, fromPosition, toPosition, out, fromRotation = null, toRotation = null, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration = 0.0) {
            var bt = btStatics.bt;
            var convexResultCall = this._btAllConvexResultCallback;
            var convexPosFrom = btPhysicsManager._btTempVector30;
            var convexPosTo = btPhysicsManager._btTempVector31;
            var convexRotFrom = btPhysicsManager._btTempQuaternion0;
            var convexRotTo = btPhysicsManager._btTempQuaternion1;
            var convexTransform = btPhysicsManager._btTempTransform0;
            var convexTransTo = btPhysicsManager._btTempTransform1;
            var sweepShape = shape._btShape;
            out.length = 0;
            bt.btVector3_setValue(convexPosFrom, fromPosition.x, fromPosition.y, fromPosition.z);
            bt.btVector3_setValue(convexPosTo, toPosition.x, toPosition.y, toPosition.z);
            bt.ConvexResultCallback_set_m_collisionFilterGroup(convexResultCall, collisonGroup);
            bt.ConvexResultCallback_set_m_collisionFilterMask(convexResultCall, collisionMask);
            bt.btTransform_setOrigin(convexTransform, convexPosFrom);
            bt.btTransform_setOrigin(convexTransTo, convexPosTo);
            if (fromRotation) {
                bt.btQuaternion_setValue(convexRotFrom, fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
                bt.btTransform_setRotation(convexTransform, convexRotFrom);
            }
            else {
                bt.btTransform_setRotation(convexTransform, this._btDefaultQuaternion);
            }
            if (toRotation) {
                bt.btQuaternion_setValue(convexRotTo, toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
                bt.btTransform_setRotation(convexTransTo, convexRotTo);
            }
            else {
                bt.btTransform_setRotation(convexTransTo, this._btDefaultQuaternion);
            }
            var collisionObjects = bt.AllConvexResultCallback_get_m_collisionObjects(convexResultCall);
            var btPoints = bt.AllConvexResultCallback_get_m_hitPointWorld(convexResultCall);
            var btNormals = bt.AllConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
            var btFractions = bt.AllConvexResultCallback_get_m_hitFractions(convexResultCall);
            bt.tVector3Array_clear(btPoints);
            bt.tVector3Array_clear(btNormals);
            bt.tScalarArray_clear(btFractions);
            bt.tBtCollisionObjectArray_clear(collisionObjects);
            bt.btCollisionWorld_convexSweepTest(this._btCollisionWorld, sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
            var count = bt.tBtCollisionObjectArray_size(collisionObjects);
            if (count > 0) {
                this._collisionsUtils.recoverAllHitResultsPool();
                for (var i = 0; i < count; i++) {
                    var hitResult = this._collisionsUtils.getHitResult();
                    out.push(hitResult);
                    hitResult.succeeded = true;
                    hitResult.collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.tBtCollisionObjectArray_at(collisionObjects, i))];
                    hitResult.hitFraction = bt.tScalarArray_at(btFractions, i);
                    var btPoint = bt.tVector3Array_at(btPoints, i);
                    var point = hitResult.point;
                    point.x = -bt.btVector3_x(btPoint);
                    point.y = bt.btVector3_y(btPoint);
                    point.z = bt.btVector3_z(btPoint);
                    var btNormal = bt.tVector3Array_at(btNormals, i);
                    var normal = hitResult.normal;
                    normal.x = -bt.btVector3_x(btNormal);
                    normal.y = bt.btVector3_y(btNormal);
                    normal.z = bt.btVector3_z(btNormal);
                }
                return true;
            }
            else {
                return false;
            }
        }
        destroy() {
            var bt = btStatics.bt;
            if (this._btDiscreteDynamicsWorld) {
                bt.btCollisionWorld_destroy(this._btDiscreteDynamicsWorld);
                this._btDiscreteDynamicsWorld = null;
            }
            else {
                bt.btCollisionWorld_destroy(this._btCollisionWorld);
                this._btCollisionWorld = null;
            }
            bt.btDbvtBroadphase_destroy(this._btBroadphase);
            this._btBroadphase = null;
            bt.btCollisionDispatcher_destroy(this._btDispatcher);
            this._btDispatcher = null;
            bt.btDefaultCollisionConfiguration_destroy(this._btCollisionConfiguration);
            this._btCollisionConfiguration = null;
            this._physicsEngineCapableMap = null;
        }
        _addRigidBody(rigidBody) {
            if (!this._btDiscreteDynamicsWorld)
                throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
            btStatics.bt.btDiscreteDynamicsWorld_addRigidBody(this._btCollisionWorld, rigidBody._btCollider, rigidBody._collisionGroup, rigidBody._canCollideWith);
        }
        _removeRigidBody(rigidBody) {
            if (!this._btDiscreteDynamicsWorld)
                throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
            btStatics.bt.btDiscreteDynamicsWorld_removeRigidBody(this._btCollisionWorld, rigidBody._btCollider);
        }
        _addCharacter(character) {
            var characters = this._characters;
            let index = characters.indexOf(character);
            if (index == -1) {
                if (!this._btDiscreteDynamicsWorld)
                    throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
                btStatics.bt.btCollisionWorld_addCollisionObject(this._btCollisionWorld, character._btCollider, character._collisionGroup, character._canCollideWith);
                btStatics.bt.btDynamicsWorld_addAction(this._btCollisionWorld, character._btKinematicCharacter);
                characters.push(character);
            }
            else {
                characters[index] = character;
            }
        }
        _removeCharacter(character) {
            if (!this._btDiscreteDynamicsWorld)
                throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
            btStatics.bt.btCollisionWorld_removeCollisionObject(this._btCollisionWorld, character._btCollider);
            btStatics.bt.btDynamicsWorld_removeAction(this._btCollisionWorld, character._btKinematicCharacter);
            var characters = this._characters;
            characters.splice(characters.indexOf(character), 1);
        }
    }

    class btPhysicsCreateUtil {
        initPhysicsCapable() {
            this._physicsEngineCapableMap = new Map();
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_Gravity, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_StaticCollider, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_DynamicCollider, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CharacterCollider, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_BoxColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_SphereColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CapsuleColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CylinderColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_ConeColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_MeshColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CompoundColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_Joint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_D6Joint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_FixedJoint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_SpringJoint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_HingeJoint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CreateCorveMesh, true);
        }
        getPhysicsCapable(value) {
            return this._physicsEngineCapableMap.get(value);
        }
        initialize() {
            let physics3D = window.Physics3D;
            physics3D(Math.max(16, Laya.Config3D.defaultPhysicsMemory) * 16, new BulletInteractive(null, null)).then(() => {
                btStatics.bt = window.Physics3D;
                this.initPhysicsCapable();
                btPhysicsManager.init();
                btCollider.__init__();
                btRigidBodyCollider.__init__();
                btStaticCollider.__init__();
                btCharacterCollider.__init__();
                btMeshColliderShape.__init__();
                return Promise.resolve();
            });
            return Promise.resolve();
        }
        createPhysicsManger(physicsSettings) {
            return new btPhysicsManager(physicsSettings);
        }
        createDynamicCollider(manager) {
            return new btRigidBodyCollider(manager);
        }
        createStaticCollider(manager) {
            return new btStaticCollider(manager);
        }
        createCharacterController(manager) {
            return new btCharacterCollider(manager);
        }
        createFixedJoint(manager) {
            return new btFixedJoint(manager);
        }
        createHingeJoint(manager) {
            return new btHingeJoint(manager);
        }
        createSpringJoint(manager) {
            return new btSpringJoint(manager);
        }
        createD6Joint(manager) {
            return new btCustomJoint(manager);
        }
        createBoxColliderShape() {
            return new btBoxColliderShape();
        }
        createSphereColliderShape() {
            return new btSphereColliderShape();
        }
        createCapsuleColliderShape() {
            return new btCapsuleColliderShape();
        }
        createMeshColliderShape() {
            return new btMeshColliderShape();
        }
        createPlaneColliderShape() {
            throw new Laya.NotImplementedError();
        }
        createCylinderColliderShape() {
            return new btCylinderColliderShape();
        }
        createConeColliderShape() {
            return new btConeColliderShape();
        }
        createCompoundShape() {
            return new btCompoundColliderShape();
        }
        createCorveMesh(mesh) {
            if (mesh._convexMesh == null) {
                return null;
            }
            let bt = btStatics.bt;
            if (mesh.__convexMesh == null) {
                let convexMesh = mesh._convexMesh;
                let vertexCount = bt.btShapeHull_numVertices(convexMesh);
                let indexCount = bt.btShapeHull_numIndices(convexMesh);
                var vertexDeclaration = Laya.VertexMesh.getVertexDeclaration("POSITION");
                var vertexFloatStride = vertexDeclaration.vertexStride / 4;
                var vertice = new Float32Array(vertexCount * vertexFloatStride);
                let triangles = [];
                for (var i = 0; i < vertexCount; i++) {
                    let index = i * 3;
                    let vector3 = bt.btShapeHull_getVertexPointer(convexMesh, i);
                    vertice[index] = bt.btVector3_x(vector3);
                    vertice[index + 1] = bt.btVector3_y(vector3);
                    vertice[index + 2] = bt.btVector3_z(vector3);
                }
                for (var i = 0; i < indexCount; i++) {
                    triangles.push(bt.btShapeHull_getIndexPointer(convexMesh, i));
                }
                mesh.__convexMesh = Laya.PrimitiveMesh._createMesh(vertexDeclaration, vertice, new Uint16Array(triangles));
            }
            return mesh.__convexMesh;
        }
    }
    Laya.Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();

    exports.BulletInteractive = BulletInteractive;
    exports.CollisionTool = CollisionTool;
    exports.btBoxColliderShape = btBoxColliderShape;
    exports.btCapsuleColliderShape = btCapsuleColliderShape;
    exports.btCharacterCollider = btCharacterCollider;
    exports.btCollider = btCollider;
    exports.btColliderShape = btColliderShape;
    exports.btCompoundColliderShape = btCompoundColliderShape;
    exports.btConeColliderShape = btConeColliderShape;
    exports.btCustomJoint = btCustomJoint;
    exports.btCylinderColliderShape = btCylinderColliderShape;
    exports.btFixedJoint = btFixedJoint;
    exports.btHingeJoint = btHingeJoint;
    exports.btJoint = btJoint;
    exports.btMeshColliderShape = btMeshColliderShape;
    exports.btPhysicsCreateUtil = btPhysicsCreateUtil;
    exports.btPhysicsManager = btPhysicsManager;
    exports.btRigidBodyCollider = btRigidBodyCollider;
    exports.btSphereColliderShape = btSphereColliderShape;
    exports.btSpringJoint = btSpringJoint;
    exports.btStaticCollider = btStaticCollider;
    exports.btStatics = btStatics;
    exports.convertToBulletVec3 = convertToBulletVec3;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.bullet.js.map

var WASI_STDOUT_FILENO = 1;
var WASI_ESUCCESS = 0;
function locateFile(path) {
  return scriptDirectory + path;
}
let scriptDirectory = "";
if(typeof document!=="undefined") {
  scriptDirectory = (document.currentScript && document.currentScript.src) ? document.currentScript.src : "";
  if(scriptDirectory)
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
}

if (window.conch && window.layaConchBullet) {
  window.Physics3D = function(initialMemory, interactive) {
    window.conch.setGetWorldTransformFunction(interactive.getWorldTransform);
    window.conch.setSetWorldTransformFunction(interactive.setWorldTransform);
    var conchBullet = window.layaConchBullet;
    conchBullet.then = (complete) => {
      complete();
    };
    window.Physics3D = conchBullet;
    return conchBullet;
  };
  }
  else{
window.Physics3D = function (initialMemory, interactive) {
    let mem = new Laya.WasmAdapter.Memory({ initial: initialMemory });
    let imports ={
      LayaAirInteractive: interactive,
      wasi_snapshot_preview1: {
        fd_close: () => { },
        fd_seek: () => { },
        fd_fdstat_get: (fd, bufPtr) => { },
        fd_prestat_get: () => { },
        fd_prestat_dir_name: (fd, bufPtr) => { },
        fd_write: (fd, iovs, iovsLen, nwritten) => {
          if (fd == 1) {//stdout
            var view = new DataView(mem.buffer);
            var ptr = iovs; //实际iovs是一个数组 [{ptr,len},{ptr,len}...]
            var buf = view.getUint32(ptr, true);
            var bufLen = view.getUint32(ptr + 4, true);
            let u8buff = new Uint8Array(mem.buffer, buf, bufLen);
            let txdec = new TextDecoder();
            let str = txdec.decode(u8buff);
            console.log(str);
            view.setUint32(nwritten, bufLen, true);
          }
          return WASI_ESUCCESS;
        },
        proc_exit: () => { },
        path_open: () => { },
        path_filestat_get: () => { },
        path_unlink_file: () => { },
        path_remove_directory: () => { },
        path_create_directory: () => { },
        fd_fdstat_set_flags: () => { },
        fd_read: () => { },
        clock_time_get: () => { },
        environ_sizes_get: () => { },
        environ_get: () => { },
        __wasm_lpad_context: () => { }
      },
      env: {
        memory: mem,
      }
    };

    let p;
    if(Laya.WasmAdapter.instantiateWasm) {
      p = Laya.WasmAdapter.instantiateWasm("bullet.wasm", imports);
    }
    else {
      p = fetch((Laya.WasmAdapter.locateFile || Laya.WasmAdapter.locateFileDefault)("bullet.wasm", scriptDirectory)).then((response) =>
        response.arrayBuffer().then((buffer) => WebAssembly.instantiate(buffer, imports)));
    }

    return p.then((physics3D) => {
      let bt = window.Physics3D = physics3D.instance.exports;
      if (bt.main) {
        bt.main();
      }
    });
}
  }