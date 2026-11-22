// Central error handler: every error in the app ends up here
// and is converted into the standard { success:false, data:null, message } format.
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  // Translate common Prisma (database) errors into friendly messages
  if (err.code === 'P2002') {
    status = 409;
    const field = (err.meta && err.meta.target) ? [].concat(err.meta.target).join(', ') : 'field';
    message = `Duplicate value: a record with this ${field} already exists.`;
  } else if (err.code === 'P2025') {
    status = 404;
    message = 'Record not found.';
  } else if (err.code === 'P2003') {
    status = 400;
    message = 'Related record not found (invalid reference).';
  } else if (err.name === 'PrismaClientValidationError') {
    status = 400;
    // Keep only the last useful line of Prisma's long message
    const lines = String(err.message).trim().split('\n');
    message = 'Invalid input: ' + lines[lines.length - 1];
  }

  if (status === 500) console.error(err);
  res.status(status).json({ success: false, data: null, message });
}

module.exports = errorHandler;
