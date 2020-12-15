const {
  createLogger,
  format,
  transports
} = require('winston');
const { combine, timestamp, label, printf } = format;
const { LoggingWinston } = require('@google-cloud/logging-winston');

const myFormat = printf(({ level, message, label, timestamp, error, err, data, ...other }) => {
  return JSON.stringify(
    {
      timestamp,
      label,
      level,
      message,
      error: JSON.stringify(error || err),
      data: JSON.stringify(data),
      ...other
    }
  );
});

const Init = ({ level, serviceName, version, projectId, keyFilename }) => {
  let loggingWinston = null;
  if (projectId && keyFilename) {
    loggingWinston = new LoggingWinston({
      projectId: projectId,
      keyFilename,
      serviceContext: {
        service: serviceName,
        version: `${version}`
      }
    });
  }

  const options = {
    level,
    defaultMeta: { environment: process.env.NODE_ENV, version },
    format: combine(
      label({ label: serviceName }),
      timestamp(),
      myFormat
    ),
    transports: loggingWinston ? [new transports.Console(), loggingWinston] : [new transports.Console()]
  };
  return createLogger(options);
};

module.exports = Init;
