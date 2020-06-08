import React from 'react';
import './App.css';
import "typeface-roboto";
import { OrganizerMain } from './components/OrganizerMain';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { OptionsForm } from './components/options/OptionsForm';

const theme = createMuiTheme({
  typography: {
    fontSize: 12
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <OrganizerMain />
    </ThemeProvider>
  );
}

export default App;
