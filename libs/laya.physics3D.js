(function (exports, Laya) {
    'use strict';

    exports.PhysicsCombineMode = void 0;
    (function (PhysicsCombineMode) {
        PhysicsCombineMode[PhysicsCombineMode["Average"] = 0] = "Average";
        PhysicsCombineMode[PhysicsCombineMode["Minimum"] = 1] = "Minimum";
        PhysicsCombineMode[PhysicsCombineMode["Multiply"] = 2] = "Multiply";
        PhysicsCombineMode[PhysicsCombineMode["Maximum"] = 3] = "Maximum";
    })(exports.PhysicsCombineMode || (exports.PhysicsCombineMode = {}));
    exports.PhysicsForceMode = void 0;
    (function (PhysicsForceMode) {
        PhysicsForceMode[PhysicsForceMode["Force"] = 0] = "Force";
        PhysicsForceMode[PhysicsForceMode["Impulse"] = 1] = "Impulse";
    })(exports.PhysicsForceMode || (exports.PhysicsForceMode = {}));
    class PhysicsColliderComponent extends Laya.Component {
        get collider() {
            return this._collider;
        }
        get restitution() {
            return this._restitution;
        }
        set restitution(value) {
            this._restitution = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_Restitution)) {
                this._collider.setBounciness(value);
            }
        }
        get friction() {
            return this._friction;
        }
        set friction(value) {
            this._friction = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_Friction)) {
                this._collider.setfriction(value);
            }
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_StaticFriction)) {
                this._collider.setStaticFriction(value);
            }
        }
        get rollingFriction() {
            return this._rollingFriction;
        }
        set rollingFriction(value) {
            this._rollingFriction = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_RollingFriction)) {
                this._collider.setRollingFriction(value);
            }
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_DynamicFriction)) {
                this._collider.setDynamicFriction(value);
            }
        }
        get dynamicFriction() {
            return this._dynamicFriction;
        }
        set dynamicFriction(value) {
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_DynamicFriction)) {
                this._collider.setDynamicFriction(value);
            }
        }
        get staticFriction() {
            return this._staticFriction;
        }
        set staticFriction(value) {
            this._staticFriction = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_StaticFriction)) {
                this._collider.setStaticFriction(value);
            }
        }
        get frictionCombine() {
            return this._frictionCombine;
        }
        set frictionCombine(value) {
            this._frictionCombine = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_FrictionCombine)) {
                this._collider.setFrictionCombine(value);
            }
        }
        get restitutionCombine() {
            return this._restitutionCombine;
        }
        set restitutionCombine(value) {
            this._restitutionCombine = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_BounceCombine)) {
                this._collider.setBounceCombine(value);
            }
        }
        get colliderShape() {
            return this._colliderShape;
        }
        set colliderShape(value) {
            if (value == this._colliderShape) {
                return;
            }
            this._colliderShape && this._colliderShape.destroy();
            this._colliderShape = value;
            if (this._collider && value) {
                value.physicsComponent = this;
                this._collider.setColliderShape(value._shape);
            }
        }
        get collisionGroup() {
            return this._collisionGroup;
        }
        set collisionGroup(value) {
            if (this._collisionGroup !== value) {
                this._collisionGroup = value;
            }
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_CollisionGroup)) {
                if (this._colliderShape && this._enabled) {
                    this._collider.setCollisionGroup(value);
                }
            }
        }
        get canCollideWith() {
            return this._canCollideWith;
        }
        set canCollideWith(value) {
            if (this._canCollideWith !== value) {
                this._canCollideWith = value;
            }
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_CollisionGroup)) {
                if (this._colliderShape && this._enabled) {
                    this._collider.setCanCollideWith(value);
                }
            }
        }
        constructor() {
            super();
            this._restitution = 0.0;
            this._friction = 0.5;
            this._rollingFriction = 0.0;
            this._dynamicFriction = 0.0;
            this._staticFriction = 0.0;
            this._frictionCombine = 0.0;
            this._restitutionCombine = 0.0;
            this._collisionGroup = 0x1;
            this._canCollideWith = -1;
            this._colliderShape = null;
            this._transformFlag = 2147483647;
            this._controlBySimulation = false;
            this._isColliderInit = false;
        }
        initCollider() {
            this._initCollider();
            this._collider.setOwner(this.owner);
            this._physicsManager.setActiveCollider(this.collider, this.enabled);
            if (this._colliderShape)
                this._collider.setColliderShape(this._colliderShape._shape);
            this.collisionGroup = this._collisionGroup;
            this.canCollideWith = this._canCollideWith;
        }
        _initCollider() {
        }
        _setEventFilter() {
        }
        _onAdded() {
        }
        _onEnable() {
            if (!this._isColliderInit) {
                this.initCollider();
                this._isColliderInit = true;
            }
            this.owner.transform.on(Laya.Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
            this._physicsManager = this.owner._scene._physicsManager;
            this._collider && (this._collider.componentEnable = true);
            if (this._colliderShape) {
                this._physicsManager.setActiveCollider(this.collider, true);
                this._physicsManager.addCollider(this._collider);
            }
            this.owner.on(Laya.Event.UPDATE_PHY_EVENT_FILTER, this, this._setEventFilter);
            this._setEventFilter();
        }
        _onDisable() {
            this.owner.transform.off(Laya.Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
            this._collider && (this._collider.componentEnable = false);
            if (this._colliderShape) {
                this._physicsManager.removeCollider(this._collider);
                this._physicsManager.setActiveCollider(this.collider, false);
            }
            this._physicsManager = null;
            this.owner.off(Laya.Event.UPDATE_PHY_EVENT_FILTER, this, this._setEventFilter);
        }
        _onDestroy() {
            this._collider && this._collider.destroy();
            this._colliderShape && this._colliderShape.destroy();
            this._collider = null;
            this._isColliderInit = false;
            this._colliderShape = null;
            this._physicsManager = null;
        }
        _onTransformChanged(flag) {
            if (!this._controlBySimulation) {
                flag &= Laya.Transform3D.TRANSFORM_WORLDPOSITION | Laya.Transform3D.TRANSFORM_WORLDQUATERNION | Laya.Transform3D.TRANSFORM_WORLDSCALE;
                if (flag && this._colliderShape && this._enabled) {
                    this._transformFlag |= flag;
                    this._collider.transformChanged(flag);
                }
            }
        }
        _cloneTo(dest) {
            dest.restitution = this._restitution;
            dest.friction = this._friction;
            dest.rollingFriction = this._rollingFriction;
            dest.dynamicFriction = this.dynamicFriction;
            dest.staticFriction = this.staticFriction;
            dest.frictionCombine = this.frictionCombine;
            dest.restitutionCombine = this.restitutionCombine;
            dest.collisionGroup = this._collisionGroup;
            dest.canCollideWith = this._canCollideWith;
            (this._colliderShape) && (dest.colliderShape = this._colliderShape.clone());
        }
    }

    class Physics3DColliderShape {
        get shape() {
            return this._shape;
        }
        get localOffset() {
            return this._localOffset;
        }
        set localOffset(value) {
            this._localOffset = value;
            this._shape.setOffset(value);
        }
        get physicsComponent() {
            return this._physicsComponent;
        }
        set physicsComponent(value) {
            this._physicsComponent = value;
        }
        constructor() {
            this._localOffset = new Laya.Vector3(0, 0, 0);
            this._createShape();
        }
        _createShape() {
            throw "override it";
        }
        cloneTo(destObject) {
            this._localOffset.cloneTo(destObject.localOffset);
            destObject.localOffset = destObject.localOffset;
        }
        clone() {
            return null;
        }
        destroy() {
            if (this._shape) {
                this._shape.destroy();
                this._shape = null;
            }
        }
    }
    Physics3DColliderShape.SHAPEORIENTATION_UPX = 0;
    Physics3DColliderShape.SHAPEORIENTATION_UPY = 1;
    Physics3DColliderShape.SHAPEORIENTATION_UPZ = 2;

    class CapsuleColliderShape extends Physics3DColliderShape {
        get radius() {
            return this._radius;
        }
        set radius(value) {
            this._radius = value;
            if (Laya.LayaEnv.isPlaying) {
                this._shape.setRadius(value);
            }
        }
        get length() {
            return this._length;
        }
        set length(value) {
            this._length = value;
            if (Laya.LayaEnv.isPlaying) {
                this._shape.setHeight(value);
            }
        }
        get orientation() {
            return this._orientation;
        }
        set orientation(value) {
            this._orientation = value;
            if (Laya.LayaEnv.isPlaying) {
                this._shape.setUpAxis(value);
            }
        }
        constructor(radius = 0.5, length = 2, orientation = Physics3DColliderShape.SHAPEORIENTATION_UPY) {
            super();
            this.radius = radius;
            this.length = length;
            this.orientation = orientation;
        }
        _createShape() {
            if (Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_CapsuleColliderShape))
                this._shape = Laya.Laya3D.PhysicsCreateUtil.createCapsuleColliderShape();
            else {
                console.error("CapsuleColliderShape: cant enable CapsuleColliderShape");
            }
        }
        clone() {
            var dest = new CapsuleColliderShape(this._radius, this._length, this._orientation);
            this.cloneTo(dest);
            return dest;
        }
        cloneTo(destObject) {
            super.cloneTo(destObject);
            destObject.radius = this.radius;
            destObject.length = this.length;
            destObject.orientation = this.orientation;
        }
    }

    class CharacterController extends PhysicsColliderComponent {
        _initCollider() {
            this._physicsManager = this.owner.scene.physicsSimulation;
            if (Laya.Laya3D.enablePhysics && this._physicsManager && Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_CharacterCollider)) {
                this._physicsManager = this.owner._scene._physicsManager;
                this._collider = Laya.Laya3D.PhysicsCreateUtil.createCharacterController(this._physicsManager);
                if (this.colliderShape) {
                    this.colliderShape.destroy();
                }
                this.colliderShape = new CapsuleColliderShape(this.radius, this.height);
                this.colliderShape.localOffset = this._offset;
                this._collider.component = this;
            }
            else {
                console.error("CharacterController: cant enable CharacterController");
            }
        }
        _onEnable() {
            super._onEnable();
            this.radius = this._radius;
            this.height = this._height;
            this.gravity = this._gravity;
            this.minDistance = this._minDistance;
            this.pushForce = this._pushForce;
            this.centerOffset = this._offset;
            this.skinWidth = this._contactOffset;
            this.maxSlope = this._maxSlope;
            this.stepHeight = this._stepHeight;
            this.upAxis = this._upAxis;
        }
        onUpdate() {
            if (this._collider && this._collider.getCapable(Laya.ECharacterCapable.Character_SimulateGravity)) {
                this._simGravity.setValue(this._gravity.x / 60.0, this._gravity.y / 60.0, this._gravity.z / 60.0);
                this.move(this._simGravity);
            }
        }
        get radius() {
            return this._radius;
        }
        set radius(value) {
            this._radius = value;
            this._colliderShape && (this._colliderShape.radius = value);
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Character_Radius)) {
                this._collider.setRadius(this._radius);
            }
        }
        get height() {
            return this._height;
        }
        set height(value) {
            this._height = value;
            this._colliderShape && (this._colliderShape.length = value);
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Character_Height)) {
                this._collider.setHeight(this._height);
            }
        }
        get minDistance() {
            return this._minDistance;
        }
        set minDistance(value) {
            this._minDistance = value;
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Character_minDistance)) {
                this._collider.setminDistance(this._minDistance);
            }
        }
        get centerOffset() {
            return this._offset;
        }
        set centerOffset(value) {
            this._offset = value;
            this._colliderShape && (this._colliderShape.localOffset = value);
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Character_offset)) {
                this._collider.setShapelocalOffset(this._offset);
            }
        }
        get gravity() {
            return this._gravity;
        }
        set gravity(value) {
            this._gravity = value;
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Charcater_Gravity)) {
                this._collider.setGravity(value);
            }
        }
        get skinWidth() {
            return this._contactOffset;
        }
        set skinWidth(value) {
            this._contactOffset = value;
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Character_Skin)) {
                this._collider.setSkinWidth(value);
            }
        }
        get maxSlope() {
            return this._maxSlope;
        }
        set maxSlope(value) {
            this._maxSlope = value;
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Character_SlopeLimit)) {
                this._collider.setSlopeLimit(value);
            }
        }
        get stepHeight() {
            return this._stepHeight;
        }
        set stepHeight(value) {
            this._stepHeight = value;
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Charcater_StepOffset)) {
                this._collider.setStepOffset(value);
            }
        }
        get upAxis() {
            return this._upAxis;
        }
        set upAxis(value) {
            this._upAxis = value;
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Character_UpDirection)) {
                this._collider.setUpDirection(value);
            }
        }
        get position() {
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Charcater_WorldPosition)) {
                return this._collider.getPosition();
            }
            else {
                return null;
            }
        }
        set position(v) {
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Charcater_WorldPosition)) {
                this._collider.setPosition(v);
            }
        }
        get pushForce() {
            return this._pushForce;
        }
        set pushForce(value) {
            this._pushForce = value;
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Character_PushForce)) {
                this._collider.setPushForce(value);
            }
        }
        get jumpSpeed() {
            return this._jumpSpeed;
        }
        set jumpSpeed(value) {
            this._jumpSpeed = value;
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Charcater_Jump)) {
                this._collider.setJumpSpeed(value);
            }
        }
        constructor() {
            super();
            this._stepHeight = 0.1;
            this._upAxis = new Laya.Vector3(0, 1, 0);
            this._maxSlope = 90.0;
            this._gravity = new Laya.Vector3(0, -9.8, 0);
            this._radius = 0.5;
            this._height = 2;
            this._offset = new Laya.Vector3();
            this._contactOffset = 0.0;
            this._minDistance = 0;
            this._simGravity = new Laya.Vector3(0, -9.8 / 60, 0);
            this._pushForce = 1;
            this._jumpSpeed = 10.0;
            this.colliderShape = new CapsuleColliderShape(this.radius, this.height);
        }
        getVerticalVel() {
            return this._collider ? this._collider.getVerticalVel() : 0;
        }
        move(movement) {
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Charcater_Move)) {
                this._collider.move(movement);
            }
        }
        jump(velocity = null) {
            if (this._collider && this.collider.getCapable(Laya.ECharacterCapable.Charcater_Jump)) {
                if (velocity) {
                    this._collider.jump(velocity);
                }
                else {
                    this._collider.jump(velocity);
                }
            }
        }
        isOnGround() {
            return this._collider ? this._collider.isGrounded() : false;
        }
        _cloneTo(dest) {
            super._cloneTo(dest);
            dest.stepHeight = this._stepHeight;
            dest.upAxis = this._upAxis;
            dest.maxSlope = this._maxSlope;
            dest.gravity = this._gravity;
        }
        _setEventFilter() {
            if (this._collider && this._collider.getCapable(Laya.ECharacterCapable.Character_EventFilter)) {
                this._eventsArray = [];
                if (this.owner.hasListener(Laya.Event.COLLISION_ENTER)) {
                    this._eventsArray.push(Laya.Event.COLLISION_ENTER);
                }
                if (this.owner.hasListener(Laya.Event.COLLISION_STAY)) {
                    this._eventsArray.push(Laya.Event.COLLISION_STAY);
                }
                if (this.owner.hasListener(Laya.Event.COLLISION_EXIT)) {
                    this._eventsArray.push(Laya.Event.COLLISION_EXIT);
                }
                this._collider.setEventFilter(this._eventsArray);
            }
        }
    }

    class ConstraintComponent extends Laya.Component {
        initJoint() {
            this._initJoint();
            this._joint.setOwner(this.owner);
            this._joint.setLocalPos(this._ownColliderLocalPos);
            this._joint.setConnectLocalPos(this._connectColliderLocalPos);
            this._joint.setBreakForce(this.breakForce);
            this._joint.setBreakTorque(this._breakTorque);
        }
        _initJoint() {
        }
        get connectedBody() {
            return this._connectCollider;
        }
        set connectedBody(value) {
            if (!value || this._connectCollider == value)
                return;
            this._connectCollider = value;
            if (this._joint) {
                this._joint.setConnectedCollider(value.collider);
            }
        }
        get ownBody() {
            return this._ownCollider;
        }
        set ownBody(value) {
            if (!value || this._ownCollider == value)
                return;
            this._ownCollider = value;
            if (this._joint) {
                this._joint.setCollider(value.collider);
            }
        }
        get currentForce() {
            if (this._joint)
                return this._joint.getlinearForce();
            else {
                console.error("joint is illegal");
                return null;
            }
        }
        get currentTorque() {
            if (this._joint)
                return this._joint.getAngularForce();
            else {
                console.error("joint is illegal");
                return null;
            }
        }
        get breakForce() {
            return this._breakForce;
        }
        set breakForce(value) {
            this._breakForce = value;
            this._joint && this._joint.setBreakForce(value);
        }
        get breakTorque() {
            return this._breakTorque;
        }
        set breakTorque(value) {
            this._breakTorque = value;
            this._joint && this._joint.setBreakTorque(value);
        }
        get anchor() {
            return this._ownColliderLocalPos;
        }
        set anchor(value) {
            value.cloneTo(this._ownColliderLocalPos);
            this._joint && this._joint.setLocalPos(value);
        }
        get connectAnchor() {
            return this._connectColliderLocalPos;
        }
        set connectAnchor(value) {
            value.cloneTo(this._connectColliderLocalPos);
            this._joint && this._joint.setConnectLocalPos(this._connectColliderLocalPos);
        }
        get enableCollison() {
            return this._enableCollison;
        }
        set enableCollison(value) {
            this._enableCollison = value;
            this._joint.isCollision(value);
        }
        constructor() {
            super();
            this._enableCollison = false;
            this._breakForce = Number.MAX_VALUE;
            this._breakTorque = Number.MAX_VALUE;
            this._ownColliderLocalPos = new Laya.Vector3();
            this._connectColliderLocalPos = new Laya.Vector3();
            this._isJointInit = false;
            this._singleton = false;
        }
        _onAdded() {
        }
        setOverrideNumSolverIterations(overideNumIterations) {
        }
        setConstraintEnabled(enable) {
        }
        _onEnable() {
            if (!this._isJointInit) {
                this.initJoint();
                this._isJointInit = true;
            }
        }
        _onDestroy() {
            this._joint && this._joint.destroy();
            this._joint = null;
            this._ownCollider = null;
            this._connectCollider = null;
            this._physicsManager = null;
            this._isJointInit = false;
        }
        isBreakConstrained() {
            return this._joint.isValid();
        }
    }

    class ConfigurableConstraint extends ConstraintComponent {
        constructor() {
            super();
            this._axis = new Laya.Vector3(1, 0, 0);
            this._secondaryAxis = new Laya.Vector3(0, 1, 0);
            this._xMotion = Laya.D6Axis.eFREE;
            this._yMotion = Laya.D6Axis.eFREE;
            this._zMotion = Laya.D6Axis.eFREE;
            this._angularXMotion = Laya.D6Axis.eFREE;
            this._angularYMotion = Laya.D6Axis.eFREE;
            this._angularZMotion = Laya.D6Axis.eFREE;
            this._distanceLimit = 0;
            this._distanceBounciness = 0;
            this._distanceBounceThreshold = 0;
            this._distanceSpring = 0;
            this._distanceDamper = 0;
            this._twistUper = 0;
            this._twistLower = 0;
            this._twistBounceness = 0;
            this._twistBounceThreshold = 0;
            this._twistStiffness = 0;
            this._twistDamping = 0;
            this._ySwingAngleLimit = 0;
            this._zSwingAngleLimit = 0;
            this._Swingrestitution = 0;
            this._SwingbounceThreshold = 0;
            this._SwingStiffness = 0;
            this._SwingDamping = 0;
            this._targetPosition = new Laya.Vector3();
            this._targetRotation = new Laya.Vector3();
            this._targetVelocity = new Laya.Vector3();
            this._targetAngularVelocity = new Laya.Vector3();
            this._linearDriveforceLimit = new Laya.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            this._linearDriveForce = new Laya.Vector3();
            this._linearDriveDamping = new Laya.Vector3();
            this._angularXDriveForceLimit = Number.MAX_VALUE;
            this._angularXDriveForce = 0;
            this._angularXDriveDamp = 0;
            this._angularYZDriveForceLimit = Number.MAX_VALUE;
            this._angularYZDriveForce = 0;
            this._angularYZDriveDamp = 0;
            this._angularSlerpDriveForceLimit = Number.MAX_VALUE;
            this._angularSlerpDriveForce = 0;
            this._angularSlerpDriveDamp = 0;
        }
        _setDriveLinearX() {
            this._joint.setDrive(Laya.D6Drive.eX, this._linearDriveForce.x, this._linearDriveDamping.x, this._linearDriveforceLimit.x);
        }
        _setDriveLinearY() {
            this._joint.setDrive(Laya.D6Drive.eY, this._linearDriveForce.y, this._linearDriveDamping.y, this._linearDriveforceLimit.y);
        }
        _setDriveLinearZ() {
            this._joint.setDrive(Laya.D6Drive.eZ, this._linearDriveForce.z, this._linearDriveDamping.z, this._linearDriveforceLimit.z);
        }
        _setAngularXDrive() {
            this._joint.setDrive(Laya.D6Drive.eSWING, this._angularXDriveForce, this._angularXDriveDamp, this._angularXDriveForceLimit);
        }
        _setAngularYZDrive() {
            this._joint.setDrive(Laya.D6Drive.eTWIST, this._angularYZDriveForce, this._angularYZDriveDamp, this._angularYZDriveForceLimit);
        }
        _setAngularSlerpDrive() {
            this._joint.setDrive(Laya.D6Drive.eSLERP, this._angularSlerpDriveForce, this._angularSlerpDriveDamp, this._angularSlerpDriveForceLimit);
        }
        _setDistanceLimit() {
            this._joint.setDistanceLimit(this._distanceLimit, this._distanceBounciness, this._distanceBounceThreshold, this._distanceSpring, this._distanceDamper);
        }
        _setAngularXLimit() {
            this._joint.setTwistLimit(this._twistUper / 180 * Math.PI, this._twistLower / 180 * Math.PI, this._twistBounceness, this._twistBounceThreshold, this._twistStiffness, this._twistDamping);
        }
        _setSwingLimit() {
            this._joint.setSwingLimit(this._ySwingAngleLimit / 180 * Math.PI, this._zSwingAngleLimit / 180 * Math.PI, this._Swingrestitution, this._SwingbounceThreshold, this._SwingStiffness, this._SwingDamping);
        }
        _setTargetTransform() {
            let rotate = Laya.Quaternion.TEMP;
            Laya.Quaternion.createFromYawPitchRoll(this._targetRotation.y / Laya.Transform3D._angleToRandin, this._targetRotation.x / Laya.Transform3D._angleToRandin, this._targetRotation.z / Laya.Transform3D._angleToRandin, rotate);
            this._joint.setDriveTransform(this._targetPosition, rotate);
        }
        _setAxis() {
            this._joint.setAxis(this._axis, this._secondaryAxis);
        }
        _setTargetVelocirty() {
            this._joint.setDriveVelocity(this._targetVelocity, this._targetAngularVelocity);
        }
        get axis() {
            return this._axis;
        }
        set axis(value) {
            if (!value)
                return;
            value.cloneTo(this._axis);
            this._setAxis();
        }
        get secondaryAxis() {
            return this._secondaryAxis;
        }
        set secondaryAxis(value) {
            if (!value)
                return;
            value.cloneTo(this._secondaryAxis);
            this._setAxis();
        }
        get XMotion() {
            return this._xMotion;
        }
        set XMotion(value) {
            this._xMotion = value;
            this._joint.setMotion(value, Laya.D6MotionType.eX);
        }
        get YMotion() {
            return this._yMotion;
        }
        set YMotion(value) {
            this._yMotion = value;
            this._joint.setMotion(value, Laya.D6MotionType.eY);
        }
        get ZMotion() {
            return this._zMotion;
        }
        set ZMotion(value) {
            this._zMotion = value;
            this._joint.setMotion(value, Laya.D6MotionType.eZ);
        }
        get angularXMotion() {
            return this._angularXMotion;
        }
        set angularXMotion(value) {
            this._angularXMotion = value;
            this._joint.setMotion(value, Laya.D6MotionType.eTWIST);
        }
        get angularYMotion() {
            return this._angularYMotion;
        }
        set angularYMotion(value) {
            this._angularYMotion = value;
            this._joint.setMotion(value, Laya.D6MotionType.eSWING1);
        }
        get angularZMotion() {
            return this._angularZMotion;
        }
        set angularZMotion(value) {
            this._angularZMotion = value;
            this._joint.setMotion(value, Laya.D6MotionType.eSWING2);
        }
        get distanceLimit() {
            return this._distanceLimit;
        }
        set distanceLimit(value) {
            if (value < 0)
                return;
            this._distanceLimit = value;
            this._setDistanceLimit();
        }
        get distanceBounciness() {
            return this._distanceBounciness;
        }
        set distanceBounciness(value) {
            if (value < 0)
                return;
            this._distanceBounciness = value;
            this._setDistanceLimit();
        }
        get distanceBounceThreshold() {
            return this._distanceBounceThreshold;
        }
        set distanceBounceThreshold(value) {
            if (value < 0)
                return;
            this._distanceBounceThreshold = value;
            this._setDistanceLimit();
        }
        get distanceSpring() {
            return this._distanceSpring;
        }
        set distanceSpring(value) {
            if (value < 0)
                return;
            this._distanceSpring = value;
            this._setDistanceLimit();
        }
        get distanceDamper() {
            return this._distanceDamper;
        }
        set distanceDamper(value) {
            if (value < 0)
                return;
            this._distanceDamper = value;
            this._setDistanceLimit();
        }
        get angularXMaxLimit() {
            return this._twistUper;
        }
        set angularXMaxLimit(value) {
            value = Math.min(180, Math.max(value, this._twistLower));
            this._twistUper = value;
            this._setAngularXLimit();
        }
        get angularXMinLimit() {
            return this._twistLower;
        }
        set angularXMinLimit(value) {
            value = Math.max(-180, Math.min(value, this._twistUper));
            this._twistLower = value;
            this._setAngularXLimit();
        }
        get AngleXLimitBounceness() {
            return this._twistBounceness;
        }
        set AngleXLimitBounceness(value) {
            value = Math.max(0, value);
            this._twistBounceness = value;
            this._setAngularXLimit();
        }
        get AngleXLimitBounceThreshold() {
            return this._twistBounceThreshold;
        }
        set AngleXLimitBounceThreshold(value) {
            value = Math.max(0, value);
            this._twistBounceThreshold = value;
            this._setAngularXLimit();
        }
        get AngleXLimitSpring() {
            return this._twistStiffness;
        }
        set AngleXLimitSpring(value) {
            value = Math.max(0, value);
            this._twistStiffness = value;
            this._setAngularXLimit();
        }
        get AngleXLimitDamp() {
            return this._twistDamping;
        }
        set AngleXLimitDamp(value) {
            value = Math.max(0, value);
            this._twistDamping = value;
            this._setAngularXLimit();
        }
        get AngleYLimit() {
            return this._ySwingAngleLimit;
        }
        set AngleYLimit(value) {
            value = Math.min(180, Math.max(0, value));
            this._ySwingAngleLimit = value;
            this._setSwingLimit();
        }
        get AngleZLimit() {
            return this._zSwingAngleLimit;
        }
        set AngleZLimit(value) {
            value = Math.min(180, Math.max(0, value));
            this._zSwingAngleLimit = value;
            this._setSwingLimit();
        }
        get AngleYZLimitBounciness() {
            return this._Swingrestitution;
        }
        set AngleYZLimitBounciness(value) {
            value = Math.max(0, value);
            this._Swingrestitution = value;
            this._setSwingLimit();
        }
        get AngleYZLimitBounceThreshold() {
            return this._SwingbounceThreshold;
        }
        set AngleYZLimitBounceThreshold(value) {
            value = Math.max(0, value);
            this._SwingbounceThreshold = value;
            this._setSwingLimit();
        }
        get AngleYZLimitSpring() {
            return this._SwingStiffness;
        }
        set AngleYZLimitSpring(value) {
            value = Math.max(0, value);
            this._SwingStiffness = value;
            this._setSwingLimit();
        }
        get AngleYZLimitDamping() {
            return this._SwingDamping;
        }
        set AngleYZLimitDamping(value) {
            value = Math.max(0, value);
            this._SwingDamping = value;
            this._setSwingLimit();
        }
        get targetPosition() {
            return this._targetPosition;
        }
        set targetPosition(value) {
            value.cloneTo(this._targetPosition);
            this._setTargetTransform();
        }
        get targetRotation() {
            return this._targetRotation;
        }
        set targetRotation(value) {
            value.cloneTo(this._targetRotation);
            this._setTargetTransform();
        }
        get targetPositionVelocity() {
            return this._targetVelocity;
        }
        set targetPositionVelocity(value) {
            value.cloneTo(this._targetVelocity);
            this._setTargetVelocirty();
        }
        get targetAngularVelocity() {
            return this._targetAngularVelocity;
        }
        set targetAngularVelocity(value) {
            value.cloneTo(this._targetAngularVelocity);
            this._setTargetVelocirty();
        }
        get XDriveSpring() {
            return this._linearDriveForce.x;
        }
        set XDriveSpring(value) {
            value = Math.max(value, 0);
            this._linearDriveForce.x = value;
            this._setDriveLinearX();
        }
        get YDriveSpring() {
            return this._linearDriveForce.y;
        }
        set YDriveSpring(value) {
            value = Math.max(value, 0);
            this._linearDriveForce.y = value;
            this._setDriveLinearY();
        }
        get ZDriveSpring() {
            return this._linearDriveForce.z;
        }
        set ZDriveSpring(value) {
            value = Math.max(value, 0);
            this._linearDriveForce.z = value;
            this._setDriveLinearZ();
        }
        get XDriveDamp() {
            return this._linearDriveDamping.x;
        }
        set XDriveDamp(value) {
            value = Math.max(value, 0);
            this._linearDriveDamping.x = value;
            this._setDriveLinearX();
        }
        get YDriveDamp() {
            return this._linearDriveDamping.y;
        }
        set YDriveDamp(value) {
            value = Math.max(value, 0);
            this._linearDriveDamping.y = value;
            this._setDriveLinearY();
        }
        get ZDriveDamp() {
            return this._linearDriveDamping.z;
        }
        set ZDriveDamp(value) {
            value = Math.max(value, 0);
            this._linearDriveDamping.z = value;
            this._setDriveLinearZ();
        }
        get XDriveForceLimit() {
            return this._linearDriveforceLimit.x;
        }
        set XDriveForceLimit(value) {
            value = Math.max(value, 0);
            this._linearDriveforceLimit.x = value;
            this._setDriveLinearX();
        }
        get YDriveForceLimit() {
            return this._linearDriveforceLimit.y;
        }
        set YDriveForceLimit(value) {
            value = Math.max(value, 0);
            this._linearDriveforceLimit.y = value;
            this._setDriveLinearY();
        }
        get ZDriveForceLimit() {
            return this._linearDriveforceLimit.z;
        }
        set ZDriveForceLimit(value) {
            value = Math.max(value, 0);
            this._linearDriveforceLimit.z = value;
            this._setDriveLinearZ();
        }
        get angularXDriveForceLimit() {
            return this._angularXDriveForceLimit;
        }
        set angularXDriveForceLimit(value) {
            value = Math.max(value, 0);
            this._angularXDriveForceLimit = value;
            this._setAngularXDrive();
        }
        get angularXDriveForce() {
            return this._angularXDriveForce;
        }
        set angularXDriveForce(value) {
            value = Math.max(value, 0);
            this._angularXDriveForce = value;
            this._setAngularXDrive();
        }
        get angularXDriveDamp() {
            return this._angularXDriveDamp;
        }
        set angularXDriveDamp(value) {
            value = Math.max(value, 0);
            this._angularXDriveDamp = value;
            this._setAngularXDrive();
        }
        get angularYZDriveForceLimit() {
            return this._angularYZDriveForceLimit;
        }
        set angularYZDriveForceLimit(value) {
            value = Math.max(value, 0);
            this._angularYZDriveForceLimit = value;
            this._setAngularYZDrive();
        }
        get angularYZDriveForce() {
            return this._angularYZDriveForce;
        }
        set angularYZDriveForce(value) {
            value = Math.max(value, 0);
            this._angularYZDriveForce = value;
            this._setAngularYZDrive();
        }
        get angularYZDriveDamp() {
            return this._angularYZDriveDamp;
        }
        set angularYZDriveDamp(value) {
            value = Math.max(value, 0);
            this._angularYZDriveDamp = value;
            this._setAngularYZDrive();
        }
        get angularSlerpDriveForceLimit() {
            return this._angularSlerpDriveForceLimit;
        }
        set angularSlerpDriveForceLimit(value) {
            value = Math.max(value, 0);
            this._angularSlerpDriveForceLimit = value;
            this._setAngularSlerpDrive();
        }
        get angularSlerpDriveForce() {
            return this._angularSlerpDriveForce;
        }
        set angularSlerpDriveForce(value) {
            value = Math.max(value, 0);
            this._angularSlerpDriveForce = value;
            this._setAngularSlerpDrive();
        }
        get angularSlerpDriveDamp() {
            return this._angularSlerpDriveDamp;
        }
        set angularSlerpDriveDamp(value) {
            value = Math.max(value, 0);
            this._angularSlerpDriveDamp = value;
            this._setAngularSlerpDrive();
        }
        _initAllConstraintInfo() {
            this._setDriveLinearX();
            this._setDriveLinearY();
            this._setDriveLinearZ();
            this._setAngularXDrive();
            this._setAngularYZDrive();
            this._setAngularSlerpDrive();
            this._setDistanceLimit();
            this._setAngularXLimit();
            this._setSwingLimit();
            this._setTargetTransform();
            this._setAxis();
            this._setTargetVelocirty();
        }
        _onEnable() {
            super._onEnable();
            if (this._joint)
                this._joint.isEnable(true);
        }
        _onDisable() {
            if (this._joint)
                this._joint.isEnable(false);
        }
        _initJoint() {
            this._physicsManager = this.owner._scene._physicsManager;
            if (Laya.Laya3D.enablePhysics && Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_D6Joint)) {
                this._joint = Laya.Laya3D.PhysicsCreateUtil.createD6Joint(this._physicsManager);
            }
            else {
                console.error("Rigidbody3D: cant enable Rigidbody3D");
            }
        }
    }

    class FixedConstraint extends ConstraintComponent {
        constructor() {
            super();
        }
        _initJoint() {
            this._physicsManager = this.owner._scene._physicsManager;
            if (Laya.Laya3D.enablePhysics && Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_FixedJoint)) {
                this._joint = Laya.Laya3D.PhysicsCreateUtil.createFixedJoint(this._physicsManager);
            }
            else {
                console.error("Rigidbody3D: cant enable Rigidbody3D");
            }
        }
        _onEnable() {
            super._onEnable();
            if (this._joint)
                this._joint.isEnable(true);
        }
        _onDisable() {
            if (this._joint)
                this._joint.isEnable(false);
        }
    }

    class HingeConstraint extends ConstraintComponent {
        constructor() {
            super();
            this._axis = new Laya.Vector3(1, 0, 0);
            this._motor = false;
            this._targetVelocity = 0;
            this._freeSpin = false;
            this._limit = false;
            this._lowerLimit = -Math.PI / 2;
            this._uperLimit = Math.PI / 2;
            this._bounciness = 0;
            this._bounceMinVelocity = 0;
            this._contactDistance = 0;
        }
        _initJoint() {
            this._physicsManager = this.owner._scene._physicsManager;
            if (Laya.Laya3D.enablePhysics && Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_HingeJoint)) {
                this._joint = Laya.Laya3D.PhysicsCreateUtil.createHingeJoint(this._physicsManager);
            }
            else {
                console.error("HingeConstraint: cant enable HingeConstraint");
            }
        }
        _onEnable() {
            super._onEnable();
            if (this._joint)
                this._joint.isEnable(true);
        }
        _onDisable() {
            if (this._joint)
                this._joint.isEnable(false);
        }
        get Axis() {
            return this._axis;
        }
        set Axis(value) {
            if (!value || this._axis.equal(value)) {
                return;
            }
            value = value.normalize();
            value.cloneTo(this._axis);
            this._joint && this._joint.setAxis(value);
        }
        get lowerLimit() {
            return this._lowerLimit;
        }
        set lowerLimit(value) {
            this._lowerLimit = value;
            let lowerValue = value < this._lowerLimit ? this._lowerLimit : (value < (-Math.PI / 2) ? (-Math.PI) : value);
            this._joint && this._joint.setLowerLimit(lowerValue);
        }
        get uperLimit() {
            return this._uperLimit;
        }
        set uperLimit(value) {
            this._uperLimit = value;
            let uperValue = value > this._uperLimit ? this._uperLimit : (value > (Math.PI / 2) ? (Math.PI) : value);
            this._joint && this._joint.setUpLimit(uperValue);
        }
        get bounceness() {
            return this._bounciness;
        }
        set bounceness(value) {
            value = value < 0 ? 0 : (value > 1 ? 1 : value);
            this._bounciness = value;
            this._joint && this._joint.setBounceness(value);
        }
        get bouncenMinVelocity() {
            return this._bounceMinVelocity;
        }
        set bouncenMinVelocity(value) {
            this._bounceMinVelocity = value;
            this._joint && this._joint.setBouncenMinVelocity(value);
        }
        get contactDistance() {
            return this._contactDistance;
        }
        set contactDistance(value) {
            this._contactDistance = value;
            this._joint && this._joint.setContactDistance(value);
        }
        get limit() {
            return this._limit;
        }
        set limit(value) {
            this._limit = value;
            this._joint && this._joint.enableLimit(value);
        }
        get motor() {
            return this._motor;
        }
        set motor(value) {
            this._motor = value;
            this._motor && this._joint.enableDrive(value);
        }
        get freeSpin() {
            return this._freeSpin;
        }
        set freeSpin(value) {
            this._freeSpin = value;
            this._joint && this._joint.enableFreeSpin(value);
        }
        get targetVelocity() {
            return this._targetVelocity;
        }
        set targetVelocity(velocity) {
            this._targetVelocity = velocity;
            this._joint && this._joint.setDriveVelocity(velocity);
        }
        getAngle() {
            return this._joint ? this._joint.getAngle() : 0;
        }
        getVelocity() {
            return this._joint ? this._joint.getVelocity() : Laya.Vector3.TEMP.set(0, 0, 0);
        }
    }

    class SpringConstraint extends ConstraintComponent {
        constructor() {
            super(...arguments);
            this._minDistance = 0;
            this._damping = 0.2;
            this._maxDistance = Number.MAX_VALUE;
            this._tolerance = 0.025;
            this._stiffness = 10;
        }
        _initJoint() {
            this._physicsManager = this.owner._scene._physicsManager;
            if (Laya.Laya3D.enablePhysics && Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_SpringJoint)) {
                this._joint = Laya.Laya3D.PhysicsCreateUtil.createSpringJoint(this._physicsManager);
            }
            else {
                console.error("SpringConstraint: cant enable SpringConstraint");
            }
        }
        _onAdded() {
            super._onAdded();
        }
        _onEnable() {
            super._onEnable();
            if (this._joint)
                this._joint.isEnable(true);
        }
        _onDisable() {
            super._onDisable();
            if (this._joint)
                this._joint.isEnable(false);
        }
        get minDistance() {
            return this._minDistance;
        }
        set minDistance(value) {
            this._minDistance = value;
            this._joint && this._joint.setMinDistance(value);
        }
        get maxDistance() {
            return this._maxDistance;
        }
        set maxDistance(value) {
            this._maxDistance = value;
            this._joint && this._joint.setMaxDistance(value);
        }
        get tolerance() {
            return this._tolerance;
        }
        set tolerance(value) {
            this._tolerance = value;
            this._joint && this._joint.setTolerance(value);
        }
        get spring() {
            return this._stiffness;
        }
        set spring(value) {
            this._stiffness = value;
            this._joint && this._joint.setStiffness(value);
        }
        get damping() {
            return this._damping;
        }
        set damping(value) {
            this._damping = value;
            this._joint && this._joint.setDamping(value);
        }
    }

    class PhysicsCollider extends PhysicsColliderComponent {
        _initCollider() {
            this._physicsManager = this.owner._scene._physicsManager;
            if (Laya.Laya3D.enablePhysics && this._physicsManager && Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_StaticCollider)) {
                this._collider = Laya.Laya3D.PhysicsCreateUtil.createStaticCollider(this._physicsManager);
                this._collider.component = this;
            }
            else {
                console.error("PhysicsCollider:cant enable PhysicsCollider");
            }
        }
        constructor() {
            super();
            this._isTrigger = false;
            this._allowSleep = true;
        }
        _onEnable() {
            super._onEnable();
            this.restitution = this._restitution;
            this.friction = this._friction;
            this.rollingFriction = this._rollingFriction;
            this.isTrigger = this._isTrigger;
            this.allowSleep = this._allowSleep;
        }
        get isTrigger() {
            return this._isTrigger;
        }
        set isTrigger(value) {
            this._isTrigger = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_AllowTrigger)) {
                this._collider.setTrigger(value);
                this._setEventFilter();
            }
        }
        get allowSleep() {
            return this._allowSleep;
        }
        set allowSleep(value) {
            this._allowSleep = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.RigidBody_AllowSleep)) {
                this._collider.allowSleep(value);
            }
        }
        _setEventFilter() {
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_EventFilter)) {
                this._eventsArray = [];
                if (this.isTrigger && this.owner.hasListener(Laya.Event.TRIGGER_ENTER)) {
                    this._eventsArray.push(Laya.Event.TRIGGER_ENTER);
                }
                if (this.isTrigger && this.owner.hasListener(Laya.Event.TRIGGER_STAY)) {
                    this._eventsArray.push(Laya.Event.TRIGGER_STAY);
                }
                if (this.isTrigger && this.owner.hasListener(Laya.Event.TRIGGER_EXIT)) {
                    this._eventsArray.push(Laya.Event.TRIGGER_EXIT);
                }
                if (this.owner.hasListener(Laya.Event.COLLISION_ENTER)) {
                    this._eventsArray.push(Laya.Event.COLLISION_ENTER);
                }
                if (this.owner.hasListener(Laya.Event.COLLISION_STAY)) {
                    this._eventsArray.push(Laya.Event.COLLISION_STAY);
                }
                if (this.owner.hasListener(Laya.Event.COLLISION_EXIT)) {
                    this._eventsArray.push(Laya.Event.COLLISION_EXIT);
                }
                this._collider.setEventFilter(this._eventsArray);
            }
        }
    }

    class PhysicsUpdateList extends Laya.SingletonList {
        constructor() {
            super();
        }
        add(element) {
            var index = element.inPhysicUpdateListIndex;
            if (index !== -1)
                console.error("PhysicsUpdateList:element has  in  PhysicsUpdateList.");
            if (this.length === this.elements.length)
                this.elements.push(element);
            else
                this.elements[this.length] = element;
            element.inPhysicUpdateListIndex = this.length++;
        }
        remove(element) {
            var index = element.inPhysicUpdateListIndex;
            if (index != -1 && index < this.length) {
                this.length--;
                var end = this.elements[this.length];
                this.elements[index] = end;
                end.inPhysicUpdateListIndex = index;
            }
            element.inPhysicUpdateListIndex = -1;
        }
    }

    class Rigidbody3D extends PhysicsColliderComponent {
        _initCollider() {
            this._physicsManager = this.owner._scene._physicsManager;
            if (Laya.Laya3D.enablePhysics && this._physicsManager && Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_DynamicCollider)) {
                this._collider = Laya.Laya3D.PhysicsCreateUtil.createDynamicCollider(this._physicsManager);
                this._collider.component = this;
            }
            else {
                console.error("Rigidbody3D: cant enable Rigidbody3D");
            }
        }
        get mass() {
            return this._mass;
        }
        set mass(value) {
            this._mass = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_Mass)) {
                this._collider.setMass(value);
            }
        }
        get isKinematic() {
            return this._isKinematic;
        }
        set isKinematic(value) {
            this._isKinematic = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_AllowKinematic)) {
                this._collider.setIsKinematic(value);
            }
        }
        get linearDamping() {
            return this._linearDamping;
        }
        set linearDamping(value) {
            this._linearDamping = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_LinearDamp)) {
                this._collider.setLinearDamping(value);
            }
        }
        get angularDamping() {
            return this._angularDamping;
        }
        set angularDamping(value) {
            this._angularDamping = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_AngularDamp)) {
                this._collider.setAngularDamping(value);
            }
        }
        get gravity() {
            return this._gravity;
        }
        set gravity(value) {
            this._gravity = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_Gravity)) {
                this._collider.setInertiaTensor(value);
            }
        }
        get linearFactor() {
            return this._linearFactor;
        }
        set linearFactor(value) {
            this._linearFactor = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_LinearFactor)) {
                this._collider.setConstraints(this._linearFactor, this.angularFactor);
            }
        }
        get linearVelocity() {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_LinearVelocity)) {
                return this._collider.getLinearVelocity();
            }
            else {
                return this._linearVelocity;
            }
        }
        set linearVelocity(value) {
            this._linearVelocity = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_LinearVelocity)) {
                this._collider.setLinearVelocity(value);
            }
        }
        get angularFactor() {
            return this._angularFactor;
        }
        set angularFactor(value) {
            this._angularFactor = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_AngularFactor)) {
                this._collider.setConstraints(this._linearFactor, this.angularFactor);
            }
        }
        get angularVelocity() {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_AngularVelocity)) {
                return this._collider.getAngularVelocity();
            }
            else {
                return this._angularVelocity;
            }
        }
        set angularVelocity(value) {
            this._angularVelocity = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_AngularVelocity)) {
                this._collider.setAngularVelocity(value);
            }
        }
        set allowSleep(value) {
            this._allowSleep = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_AllowSleep)) {
                this._collider.allowSleep(value);
            }
        }
        get allowSleep() {
            return this._allowSleep;
        }
        get isSleeping() {
            return this._collider.isSleeping();
        }
        get sleepThreshold() {
            return this._sleepThreshold;
        }
        set sleepThreshold(value) {
            this._sleepThreshold = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_SleepThreshold)) {
                this._collider.setSleepThreshold(value);
            }
        }
        get sleepAngularThreshold() {
            return this._sleepAngularThreshold;
        }
        set sleepAngularThreshold(value) {
            this._sleepAngularThreshold = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_SleepAngularVelocity)) {
                this._collider.setSleepAngularThreshold(value);
            }
        }
        set position(pos) {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_WorldPosition)) {
                this._collider.setWorldPosition(pos);
            }
        }
        set orientation(q) {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_WorldOrientation)) {
                this._collider.setWorldRotation(q);
            }
        }
        get trigger() {
            return this._trigger;
        }
        set trigger(value) {
            this._trigger = value;
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.Collider_AllowTrigger)) {
                this._collider.setTrigger(value);
            }
        }
        get collisionDetectionMode() {
            return this._collisionDetectionMode;
        }
        set collisionDetectionMode(value) {
            this._collisionDetectionMode = value;
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_CollisionDetectionMode)) {
                this._collider.setCollisionDetectionMode(value);
            }
        }
        constructor() {
            super();
            this._isKinematic = false;
            this._mass = 1.0;
            this._gravity = new Laya.Vector3(0, -10, 0);
            this._angularDamping = 0.0;
            this._linearDamping = 0.0;
            this._linearVelocity = new Laya.Vector3();
            this._angularVelocity = new Laya.Vector3();
            this._linearFactor = new Laya.Vector3(1, 1, 1);
            this._angularFactor = new Laya.Vector3(1, 1, 1);
            this._sleepThreshold = 0.8;
            this._sleepAngularThreshold = 1.0;
            this._trigger = false;
            this._collisionDetectionMode = 0;
            this._allowSleep = true;
        }
        _onEnable() {
            super._onEnable();
            this.restitution = this._restitution;
            this.friction = this._friction;
            this.rollingFriction = this._rollingFriction;
            this.gravity = this._gravity;
            this.trigger = this._trigger;
            this.isKinematic = this._isKinematic;
            this.mass = this._mass;
            this.linearFactor = this._linearFactor;
            this.angularFactor = this._angularFactor;
            this.linearDamping = this._linearDamping;
            this.linearVelocity = this._linearVelocity;
            this.angularDamping = this._angularDamping;
            this.allowSleep = this._allowSleep;
        }
        _onDestroy() {
            super._onDestroy();
            this._gravity = null;
            this._linearVelocity = null;
            this._angularVelocity = null;
            this._linearFactor = null;
            this._angularFactor = null;
        }
        _cloneTo(dest) {
            super._cloneTo(dest);
            dest.isKinematic = this._isKinematic;
            dest.mass = this._mass;
            dest.gravity = this._gravity;
            dest.angularDamping = this._angularDamping;
            dest.linearDamping = this._linearDamping;
            dest.linearVelocity = this._linearVelocity;
            dest.angularVelocity = this._angularVelocity;
            dest.linearFactor = this._linearFactor;
            dest.angularFactor = this._angularFactor;
        }
        applyForce(force, localOffset = null) {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_ApplyForce)) {
                this._collider.addForce(force, exports.PhysicsForceMode.Force, localOffset);
            }
        }
        applyTorque(torque) {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_ApplyTorque)) {
                this._collider.addTorque(torque, exports.PhysicsForceMode.Force);
            }
        }
        applyImpulse(impulse, localOffset = null) {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_ApplyImpulse)) {
                this._collider.addForce(impulse, exports.PhysicsForceMode.Impulse, localOffset);
            }
        }
        applyTorqueImpulse(torqueImpulse) {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_ApplyTorqueImpulse)) {
                this._collider.addTorque(torqueImpulse, exports.PhysicsForceMode.Impulse);
            }
        }
        wakeUp() {
            if (this._collider && this.collider.getCapable(Laya.EColliderCapable.RigidBody_AllowSleep)) {
                this._collider.wakeUp();
            }
        }
        get sleepLinearVelocity() {
            return this.sleepThreshold;
        }
        set sleepLinearVelocity(value) {
            this.sleepThreshold = value;
            this.sleepAngularThreshold = value;
        }
        get sleepAngularVelocity() {
            return this.sleepThreshold;
        }
        set sleepAngularVelocity(value) {
            this.sleepThreshold = value;
            this.sleepAngularThreshold = value;
        }
        applyForceXYZ(fx, fy, fz, localOffset = null) {
            _tempV0.set(fx, fy, fz);
            this.applyForce(_tempV0, localOffset);
        }
        _setEventFilter() {
            if (this._collider && this._collider.getCapable(Laya.EColliderCapable.Collider_EventFilter)) {
                this._eventsArray = [];
                if (this.trigger && this.owner.hasListener(Laya.Event.TRIGGER_ENTER)) {
                    this._eventsArray.push(Laya.Event.TRIGGER_ENTER);
                }
                if (this.trigger && this.owner.hasListener(Laya.Event.TRIGGER_EXIT)) {
                    this._eventsArray.push(Laya.Event.TRIGGER_EXIT);
                }
                if (this.trigger && this.owner.hasListener(Laya.Event.TRIGGER_STAY)) {
                    this._eventsArray.push(Laya.Event.TRIGGER_STAY);
                }
                if (this.owner.hasListener(Laya.Event.COLLISION_ENTER)) {
                    this._eventsArray.push(Laya.Event.COLLISION_ENTER);
                }
                if (this.owner.hasListener(Laya.Event.COLLISION_STAY)) {
                    this._eventsArray.push(Laya.Event.COLLISION_STAY);
                }
                if (this.owner.hasListener(Laya.Event.COLLISION_EXIT)) {
                    this._eventsArray.push(Laya.Event.COLLISION_EXIT);
                }
                this._collider.setEventFilter(this._eventsArray);
            }
        }
    }
    const _tempV0 = new Laya.Vector3();

    class BoxColliderShape extends Physics3DColliderShape {
        constructor(sizeX = 1.0, sizeY = 1.0, sizeZ = 1.0) {
            super();
            this._size = new Laya.Vector3(sizeX, sizeY, sizeZ);
            this._shape.setSize(this._size);
        }
        _createShape() {
            if (Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_BoxColliderShape))
                this._shape = Laya.Laya3D.PhysicsCreateUtil.createBoxColliderShape();
            else {
                console.error("BoxColliderShape: cant enable BoxColliderShape");
            }
        }
        get size() {
            return this._size;
        }
        set size(value) {
            this._size = value;
            if (Laya.LayaEnv.isPlaying) {
                this._shape.setSize(this._size);
            }
        }
        clone() {
            var dest = new BoxColliderShape(this._size.x, this._size.y, this._size.z);
            this.cloneTo(dest);
            return dest;
        }
        cloneTo(destObject) {
            super.cloneTo(destObject);
            destObject.size = this.size;
        }
        get sizeX() {
            return this.size.x;
        }
        set sizeX(value) {
            this._size.x = value;
            if (Laya.LayaEnv.isPlaying) {
                this._shape.setSize(this._size);
            }
        }
        get sizeY() {
            return this.size.y;
        }
        set sizeY(value) {
            this._size.y = value;
            if (Laya.LayaEnv.isPlaying) {
                this._shape.setSize(this._size);
            }
        }
        get sizeZ() {
            return this.size.z;
        }
        set sizeZ(value) {
            this._size.z = value;
            if (Laya.LayaEnv.isPlaying) {
                this._shape.setSize(this._size);
            }
        }
    }

    class CompoundColliderShape extends Physics3DColliderShape {
        constructor() {
            super();
            this._childColliderShapes = [];
        }
        _createShape() {
            if (Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_CompoundColliderShape)) {
                this._shape = Laya.Laya3D.PhysicsCreateUtil.createCompoundShape();
            }
            else {
                console.error("CompoundColliderShape: cannot enable CompoundColliderShape");
            }
        }
        set shapes(value) {
            for (var i = this._childColliderShapes.length - 1; i >= 0; i--) {
                this.removeChildShape(this._childColliderShapes[i]);
            }
            for (var i = 0; i < value.length; i++) {
                this.addChildShape(value[i]);
            }
        }
        get shapes() {
            return this._childColliderShapes;
        }
        addChildShape(shape) {
            if (shape instanceof CompoundColliderShape) {
                console.warn("CompoundColliderShape: cannot add a CompoundColliderShape as a child shape.");
                return;
            }
            this._shape && this._shape.setShapeData(this.physicsComponent);
            this._shape && this._shape.addChildShape(shape.shape);
            this._childColliderShapes.push(shape);
        }
        removeChildShape(shape) {
            if (shape instanceof CompoundColliderShape) {
                console.warn("CompoundColliderShape: cannot remove a CompoundColliderShape as a child shape.");
                return;
            }
            let index = this._childColliderShapes.indexOf(shape);
            this._shape && this._shape.removeChildShape(shape.shape, index);
            this._childColliderShapes.splice(index, 1);
        }
        clearChildShape() {
            this._shape && this._childColliderShapes.forEach(shape => {
                this._shape && this._shape.removeChildShape(shape.shape, 0);
            });
            this._childColliderShapes = [];
        }
        getChildShapeCount() {
            return this._childColliderShapes.length;
        }
        cloneTo(destObject) {
            destObject.clearChildShape();
            for (let i = 0, n = this._childColliderShapes.length; i < n; i++)
                destObject.addChildShape(this._childColliderShapes[i].clone());
        }
        clone() {
            var dest = new CompoundColliderShape();
            this.cloneTo(dest);
            return dest;
        }
        destroy() {
            super.destroy();
            for (var i = 0, n = this._childColliderShapes.length; i < n; i++) {
                var childShape = this._childColliderShapes[i];
                childShape.destroy();
            }
        }
    }

    class ConeColliderShape extends Physics3DColliderShape {
        get radius() {
            return this._radius;
        }
        set radius(value) {
            this._radius = value;
            if (Laya.LayaEnv.isPlaying)
                this._shape.setRadius(value);
        }
        get height() {
            return this._height;
        }
        set height(value) {
            this._height = value;
            if (Laya.LayaEnv.isPlaying)
                this._shape.setHeight(value);
        }
        get orientation() {
            return this._orientation;
        }
        set orientation(value) {
            this._orientation = value;
            if (Laya.LayaEnv.isPlaying)
                this._shape.setUpAxis(value);
        }
        constructor(radius = 0.5, height = 1.0, orientation = Physics3DColliderShape.SHAPEORIENTATION_UPY) {
            super();
            this._radius = 1;
            this._height = 0.5;
            this.radius = radius;
            this.height = height;
            this.orientation = orientation;
        }
        _createShape() {
            if (Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_ConeColliderShape)) {
                this._shape = Laya.Laya3D.PhysicsCreateUtil.createConeColliderShape();
            }
            else {
                console.error("ConeColliderShape: cant enable ConeColliderShape");
            }
        }
        clone() {
            var dest = new ConeColliderShape(this._radius, this._height, this._orientation);
            this.cloneTo(dest);
            return dest;
        }
        cloneTo(destObject) {
            super.cloneTo(destObject);
            destObject.radius = this.radius;
            destObject.height = this.height;
            destObject.orientation = this.orientation;
        }
    }

    class CylinderColliderShape extends Physics3DColliderShape {
        get radius() {
            return this._radius;
        }
        set radius(value) {
            this._radius = value;
            if (Laya.LayaEnv.isPlaying)
                this._shape.setRadius(value);
        }
        get height() {
            return this._height;
        }
        set height(value) {
            this._height = value;
            if (Laya.LayaEnv.isPlaying)
                this._shape.setHeight(value);
        }
        get orientation() {
            return this._orientation;
        }
        set orientation(value) {
            this._orientation = value;
            if (Laya.LayaEnv.isPlaying)
                this._shape.setUpAxis(value);
        }
        constructor(radius = 0.5, height = 1.0, orientation = Physics3DColliderShape.SHAPEORIENTATION_UPY) {
            super();
            this._radius = 1;
            this._height = 0.5;
            this.radius = radius;
            this.height = height;
            this.orientation = orientation;
        }
        _createShape() {
            if (Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_CylinderColliderShape)) {
                this._shape = Laya.Laya3D.PhysicsCreateUtil.createCylinderColliderShape();
            }
            else {
                console.error("CylinderColliderShape: cant enable CylinderColliderShape");
            }
        }
        clone() {
            var dest = new CylinderColliderShape(this._radius, this._height, this._orientation);
            this.cloneTo(dest);
            return dest;
        }
        cloneTo(destObject) {
            super.cloneTo(destObject);
            destObject.radius = this.radius;
            destObject.height = this.height;
            destObject.orientation = this.orientation;
        }
    }

    class MeshColliderShape extends Physics3DColliderShape {
        get mesh() {
            return this._mesh;
        }
        set mesh(value) {
            if ((this._mesh == value && this._shape) || !value)
                return;
            this._mesh = value;
            this._changeShape();
        }
        _changeShape() {
            if (!this.mesh)
                return;
            if (this._convex)
                this._shape.setConvexMesh(this.mesh);
            else
                this._shape.setPhysicsMeshFromMesh(this.mesh);
        }
        get convexVertexMax() {
            return this._convexVertexMax;
        }
        set convexVertexMax(value) {
            this._convexVertexMax = value;
            this._shape.setLimitVertex(value);
        }
        get convex() {
            return this._convex;
        }
        set convex(value) {
            if (value == this._convex) {
                return;
            }
            this._convex = value;
            this._changeShape();
        }
        constructor() {
            super();
            this._mesh = null;
            this._convex = false;
            this._convexVertexMax = 255;
        }
        _createShape() {
            if (Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_MeshColliderShape))
                this._shape = Laya.Laya3D.PhysicsCreateUtil.createMeshColliderShape();
            else {
                console.error("MeshColliderShape: cant enable MeshColliderShape");
            }
        }
        cloneTo(destObject) {
            destObject.convex = this._convex;
            destObject._convexVertexMax = this._convexVertexMax;
            destObject.mesh = this._mesh;
            super.cloneTo(destObject);
        }
        clone() {
            var dest = new MeshColliderShape();
            this.cloneTo(dest);
            return dest;
        }
    }

    class SphereColliderShape extends Physics3DColliderShape {
        get radius() {
            return this._radius;
        }
        set radius(value) {
            this._radius = value;
            if (Laya.LayaEnv.isPlaying)
                this._shape.setRadius(value);
        }
        constructor(radius = 0.5) {
            super();
            this.radius = radius;
        }
        _createShape() {
            if (Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.Physics_SphereColliderShape))
                this._shape = Laya.Laya3D.PhysicsCreateUtil.createSphereColliderShape();
            else
                console.error("SphereColliderShape: cant enable SphereColliderShape");
        }
        clone() {
            var dest = new SphereColliderShape(this._radius);
            this.cloneTo(dest);
            return dest;
        }
        cloneTo(destObject) {
            super.cloneTo(destObject);
            destObject.radius = this.radius;
        }
    }

    let c = Laya.ClassUtils.regClass;
    c("ConfigurableConstraint", ConfigurableConstraint);
    c("FixedConstraint", FixedConstraint);
    c("ConstraintComponent", ConstraintComponent);
    c("HingeConstraint", HingeConstraint);
    c("SpringConstraint", SpringConstraint);
    c("Physics3DColliderShape", Physics3DColliderShape);
    c("BoxColliderShape", BoxColliderShape);
    c("CapsuleColliderShape", CapsuleColliderShape);
    c("CompoundColliderShape", CompoundColliderShape);
    c("ConeColliderShape", ConeColliderShape);
    c("CylinderColliderShape", CylinderColliderShape);
    c("MeshColliderShape", MeshColliderShape);
    c("SphereColliderShape", SphereColliderShape);
    c("CharacterController", CharacterController);
    c("Rigidbody3D", Rigidbody3D);
    c("PhysicsColliderComponent", PhysicsColliderComponent);
    c("PhysicsCollider", PhysicsCollider);
    c("PhysicsUpdateList", PhysicsUpdateList);
    c("Physics3DStatInfo", Laya.Physics3DStatInfo);

    class HeightFieldColliderShape extends Physics3DColliderShape {
        constructor(heightFieldData) {
            super();
            this._terrainData = heightFieldData;
            this._shape.setHeightFieldData(this._terrainData.numRows, this._terrainData.numCols, this._terrainData.heightData, this._terrainData.flag, this._terrainData.scale);
        }
        _createShape() {
            if (Laya.Laya3D.PhysicsCreateUtil.getPhysicsCapable(Laya.EPhysicsCapable.physics_heightFieldColliderShape))
                this._shape = Laya.Laya3D.PhysicsCreateUtil.createHeightFieldShape();
            else {
                console.error("HeightFieldColliderShape: cant enable HeightFieldColliderShape");
            }
        }
    }

    exports.BoxColliderShape = BoxColliderShape;
    exports.CapsuleColliderShape = CapsuleColliderShape;
    exports.CharacterController = CharacterController;
    exports.CompoundColliderShape = CompoundColliderShape;
    exports.ConeColliderShape = ConeColliderShape;
    exports.ConfigurableConstraint = ConfigurableConstraint;
    exports.ConstraintComponent = ConstraintComponent;
    exports.CylinderColliderShape = CylinderColliderShape;
    exports.FixedConstraint = FixedConstraint;
    exports.HeightFieldColliderShape = HeightFieldColliderShape;
    exports.HingeConstraint = HingeConstraint;
    exports.MeshColliderShape = MeshColliderShape;
    exports.Physics3DColliderShape = Physics3DColliderShape;
    exports.PhysicsCollider = PhysicsCollider;
    exports.PhysicsColliderComponent = PhysicsColliderComponent;
    exports.PhysicsUpdateList = PhysicsUpdateList;
    exports.Rigidbody3D = Rigidbody3D;
    exports.SphereColliderShape = SphereColliderShape;
    exports.SpringConstraint = SpringConstraint;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.physics3D.js.map
