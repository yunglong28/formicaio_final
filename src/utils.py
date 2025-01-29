import os
import io
import PyPDF2
import openai
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# If modifying scopes, delete the token.json file.
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# Authenticate with Google Drive API
def authenticate_google_drive():
    creds = None
    # Token.json stores the user's access and refresh tokens and is created automatically when the authorization flow completes.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for future runs
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

# Function to download PDFs from a Google Drive folder
def download_pdfs_from_drive(service, folder_id):
    query = f"'{folder_id}' in parents and mimeType='application/pdf'"
    results = service.files().list(q=query, pageSize=10, fields="files(id, name)").execute()
    items = results.get('files', [])

    if not items:
        print('No files found.')
        return

    for item in items:
        file_id = item['id']
        file_name = item['name']
        request = service.files().get_media(fileId=file_id)
        fh = io.FileIO(file_name, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
            print(f"Downloaded {file_name} ({int(status.progress() * 100)}%).")
        fh.close()

# Extract text from PDF
def extract_text_from_pdf(file_name):
    with open(file_name, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in range(len(reader.pages)):
            text += reader.pages[page].extract_text()
    return text

# Use the extracted text with OpenAI (or any RAG model)
def query_rag_model(extracted_text):
    openai.api_key = 'your-openai-api-key'  # Replace with your OpenAI key
    response = openai.Completion.create(
        engine="text-davinci-003",  # You can replace this with a RAG model endpoint if you have one
        prompt=f"Here is the extracted text from the PDF: {extracted_text}. Use this information to answer questions.",
        max_tokens=150
    )
    return response.choices[0].text.strip()

def main():
    folder_id = 'your-folder-id-on-gdrive'  # Replace with your Google Drive folder ID

    creds = authenticate_google_drive()
    service = build('drive', 'v3', credentials=creds)

    # Download PDFs from the specified Google Drive folder
    download_pdfs_from_drive(service, folder_id)

    # For simplicity, assuming we process one file. Extend to handle multiple files if needed.
    pdf_files = [file for file in os.listdir() if file.endswith('.pdf')]
    for pdf_file in pdf_files:
        # Extract text from the downloaded PDF
        extracted_text = extract_text_from_pdf(pdf_file)

        # Use the text with a RAG model or OpenAI GPT model
        response = query_rag_model(extracted_text)
        print(f"Model Response for {pdf_file}: {response}")

if __name__ == '__main__':
    main()