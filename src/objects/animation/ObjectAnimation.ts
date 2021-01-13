import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { RoomPosition } from "../../types/RoomPosition";

export class ObjectAnimation<T> {
  private _current: RoomPosition | undefined;
  private _diff: RoomPosition | undefined;
  private _start = 0;
  private _enqueued: {
    currentPosition: RoomPosition;
    newPosition: RoomPosition;
    data: T;
  }[] = [];
  private _nextPosition: RoomPosition | undefined;

  constructor(
    private _animationTicker: IAnimationTicker,
    private _callbacks: {
      onUpdatePosition: (position: RoomPosition, data: T) => void;
      onStart: (data: T) => void;
      onStop: (data: T) => void;
    },
    private _duration: number = 500
  ) {}

  clear() {
    this._enqueued = [];
    return this._nextPosition;
  }

  move(
    currentPos: { roomX: number; roomY: number; roomZ: number },
    newPos: { roomX: number; roomY: number; roomZ: number },
    data: T
  ) {
    if (this._diff != null) {
      this._enqueued.push({
        currentPosition: currentPos,
        newPosition: newPos,
        data: data,
      });
      return;
    }

    this._callbacks.onStart(data);

    this._current = currentPos;
    this._diff = {
      roomX: newPos.roomX - currentPos.roomX,
      roomY: newPos.roomY - currentPos.roomY,
      roomZ: newPos.roomZ - currentPos.roomZ,
    };

    this._nextPosition = newPos;
    this._start = performance.now();

    const handleFinish = () => {
      this._diff = undefined;
      this._current = undefined;

      const next = this._enqueued.shift();
      if (next != null) {
        this.move(next.currentPosition, next.newPosition, next.data);
      } else {
        this._callbacks.onStop(data);
      }

      cancel();
    };

    this._callbacks.onUpdatePosition(
      {
        roomX: this._current.roomX,
        roomY: this._current.roomY,
        roomZ: this._current.roomZ,
      },
      data
    );

    const cancel = this._animationTicker.subscribe(() => {
      const timeDiff = performance.now() - this._start;

      let factor = timeDiff / this._duration;
      const current = this._current;
      const diff = this._diff;

      if (factor > 1) {
        factor = 1;
      }

      if (current != null && diff != null) {
        this._callbacks.onUpdatePosition(
          {
            roomX: current.roomX + diff.roomX * factor,
            roomY: current.roomY + diff.roomY * factor,
            roomZ: current.roomZ + diff.roomZ * factor,
          },
          data
        );
      }

      if (factor >= 1) {
        handleFinish();
        return;
      }
    });
  }
}
