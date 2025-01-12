import { logout } from "@/actions";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/Menubar";
import Image from "next/image";
import ChangePasswordModal from "./ChangePasswordModal";
import { DialogTrigger } from "./ui/Dialog";

export function Menu() {
  return (
    <Menubar className='rounded-none border-b border-none px-2 lg:px-4 w-screen'>
      <MenubarMenu>
        <MenubarTrigger className='font-bold'>
          <div className='flex items-center'>
            <Image
              width={30}
              height={30}
              src='/logo.png'
              alt='logo'
              priority
              style={{ minWidth: 30 }}
            />
            <span>shopibox</span>
          </div>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About Shopibox</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Preferences... <MenubarShortcut>⌘,</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className='relative'>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Import... <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem inset>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <ChangePasswordModal
        dialogTrigger={
          <MenubarMenu>
            <MenubarTrigger className='hidden md:block'>Account</MenubarTrigger>
            <MenubarContent forceMount>
              <MenubarLabel inset>Switch Account</MenubarLabel>
              <MenubarSeparator />
              <MenubarRadioGroup value='a'>
                <MenubarRadioItem value='a'>A</MenubarRadioItem>
              </MenubarRadioGroup>
              <MenubarSeparator />
              <DialogTrigger asChild>
                <MenubarItem inset>Change Password</MenubarItem>
              </DialogTrigger>
              <MenubarItem inset onClick={() => logout()}>
                Logout
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        }
      />
    </Menubar>
  );
}
