import { Box, FormControl, InputLabel, Menu, MenuItem, Stack, Typography, ListItemText, InputBase } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from 'react';

const CURRENCIES = [
  { id: 1, code: 'GHS', name: 'Ghana Cedis', emoji: '🇬🇭' },
  { id: 2, code: 'BTC', name: 'Bitcoin', emoji: '₿' },
  { id: 3, code: 'ETH', name: 'Ethereum', emoji: 'Ξ' },
  { id: 4, code: 'USDT', name: 'Tether USDT', emoji: '₮' },
];

interface ISelectNetwork {
  networks?: string[];
  cryptoCurrencies?: any;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}

export const SelectNetwork = ({ selectedValue, setSelectedValue }: ISelectNetwork) => {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');

  const filtered = CURRENCIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const selected = CURRENCIES.find(c => c.code === selectedValue) || CURRENCIES[0];

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setIsOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsOpen(false);
    setSearch('');
  };

  const handleSelect = (code: string) => {
    setSelectedValue(code);
    handleClose();
  };

  return (
    <Stack width={1}>
      <InputLabel>Select Currency</InputLabel>
      <FormControl sx={{ width: 1 }}>
        <Box
          onClick={handleOpen}
          sx={{
            border: '1px solid',
            borderColor: isOpen ? 'primary.main' : 'background.border',
            borderRadius: 3,
            px: 2, py: 1,
            bgcolor: 'background.default',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography>{selected.emoji}</Typography>
            <Typography fontWeight={700} variant="caption">{selected.name}</Typography>
          </Stack>
          {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </Box>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <Box sx={{ px: 1, pt: 1 }}>
            <InputBase
              placeholder="Search currency"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ bgcolor: 'background.layer4', borderRadius: 1, px: 1, fontSize: 14, height: 36, mb: 1 }}
            />
          </Box>
          {filtered.map(item => (
            <MenuItem key={item.id} selected={item.code === selectedValue} onClick={() => handleSelect(item.code)}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography>{item.emoji}</Typography>
                <ListItemText primary={item.name} />
              </Stack>
            </MenuItem>
          ))}
        </Menu>
      </FormControl>
    </Stack>
  );
};
