const { WinstonLoggerFactory } = require("./lib/extra/winston");

const loggerFactory = new WinstonLoggerFactory();
const logger = loggerFactory.getLogger("anhld");
logger.info("Hell world");
logger.error("Test");
