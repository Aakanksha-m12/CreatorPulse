export default function PendulumLoader({ text = 'Loading...' }) {
  return (
    <div className="pendulum-container">
      <div className="pendulum-rack">
        <div className="pendulum-rack-bar" />
        <div className="pendulum-unit">
          <div className="string" />
          <div className="ball" />
        </div>
        <div className="pendulum-unit">
          <div className="string" />
          <div className="ball" />
        </div>
        <div className="pendulum-unit">
          <div className="string" />
          <div className="ball" />
        </div>
        <div className="pendulum-unit">
          <div className="string" />
          <div className="ball" />
        </div>
      </div>
      <div className="pendulum-text">{text}</div>
    </div>
  );
}
