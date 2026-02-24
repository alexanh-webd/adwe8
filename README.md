# Personal Drive Application

## Overview

The aim of this project is to implement a system that lets users register, login, and create text documents into a “cloud drive”. The user can have as many documents as possible as she wishes in her drive, and she can also edit and remove her documents. In essence, this is a similar system to, for example, Google Drive or OneDrive. Non-authenticated users cannot see anything – links to documents can be shared so that a non-authenticated user can see the file, not edit it.

## Basic Features

o The application is implementing the use of Materialize, which allows users to use mobile devices and desktop browsers.

o Non-authenticated users can register and login to use the service. They can also view the file that is public to all users.

o Authenticated users can:

§ Add/remove/rename/edit documents to/from/on their own drive

§ The only required document type is text document (No formatting tools is required, and no simultaneous editing is required)

§ Give editing permission to some existing users

§ Give view permission to any user via the service

§ Two users cannot edit the same document at the same time. The file can be locked to avoid other users entering the file while editing. An informative message is given if the document is edited by another user.

§ If the user is editing and getting back to the home page, they can come back to edit via the service. However, if they are not saving the file after editing it, the edited content will not be saved.

§ Log out

## Features

§ Basic features as listed above

§ Utilization of a frontside framework, such as React, but you can also use Angular, Vue or some other

§ Document can be downloaded as PDF
§ The drive shows besides the name of the document also the creation and last updated timestamp

§ Users can comment parts of the document

§ The application has dark and bright modes

§ User has an option to clone existing documents. This feature allows all users to view public documents via a link.

§ Translation of the whole UI in two or more languages using i18n

§ Add pagination to the document listing

§ Add search functionality of some sort

§ Additional features:

o Using hot-toast via npm install react-hot-toast.

o This feature should be accepted because:

§ Hot toast allows the application to show the user beautiful notifications whether there are any errors occurring during the use of the service.

## Detailed documentation can be found in https://lut-my.sharepoint.com/:w:/g/personal/duc_l_nguyen_student_lut_fi/IQDonZt349pMQIBK87cza5-WAfPDjaBlZxNWCsyL7dSaNhk?rtime=2gvtS2Jm3kg
- Search and filtering of topics

