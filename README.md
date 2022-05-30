DB_CONNECTION={mongodb+srv://{username}:{password}@cluster0.1lzsc.mongodb.net/?retryWrites=true&w=majority}
SPREADSHEET_ID={INSERT_GOOGLE_SPREADSHEET_ID}

To change DB server/spreadsheet, In the .env file in the main directory , paste these lines of code after inserting your {INSERT_GOOGLE_SPREADSHEET_ID} and make sure to share edit permissions to "sheetsproject@sheetsproject-350408.iam.gserviceaccount.com"(-> api service account) via google sheets, you could change the mongoDB Atlas connection URL and credentials as well.(change DB_CONNECTION URL completely, the one provided is just a template for clusters I created while testing).

The RESTful endpoints are mentioned in detail in the documentation provided.
