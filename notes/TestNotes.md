# TEST NOTES

# TEST STEPS
1. MOCK - mockUser.loggedIn.mockResolvedValue(userData)
2. ACTION - await authService.create(data)
3. ASSERTION - expect()

# RULES
1. Keep contants like data outside describe
2. keep let inside the related describe 


WHY ACTION IN TEST MUST HAVE AWAIT ?
1. We do await in success case. Its because we know the test is going to pass and goes to next line. 
2. We dont- await in failure case. if we do, it does not go next line, so better await in expect line.


WE HAVE SEPARATE ENVIRONMENT TO RUN THE TEST
setup file - vitest.config.ts - separate projects setup for different test( integration, unit)
- Reason is that unit test does not need database connection. 
- See the package.json for other setup. 

TEST:UNIT
1 . To run - npm run test:unit
2. To run in watch mode - npm run test:unit:watch


TEST:INTEGRATION
1 . To run - npm run test:int
2. To run in watch mode - npm run test:int:watch


# SOME TESTING NOTES

  session.withTransaction(() => {})
  1.  session withTransaction is better than startTransaction , commitTransaction
  2.  if you call any function , than control hitting the function is not enough, it have to through that function and exit from that function successfully. 
  3. example:  expect(mockSession.withTransaction).toHaveBeenCalled();
   To work this function withTransaction(), all the function inside that withTransaction() must be pass.
  4. Mock the function first, before using it. Check userService.test.ts for detail
        withTransaction: vi.fn().mockImplementation(async (fn) => {
          return await fn();
        }),
