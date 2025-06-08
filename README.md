<!-- 
SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
SPDX-License-Identifier: MIT
-->

# Review

An simple montage review web app to review ZoneMinder events.

## Why?

Zoneminder already has a montage review function doesn't it? Yes indeed
it does, and it works pretty well. However it relies on querying the
server a given monitor is recording on. This is fine in most
circumstances, however it does increase the load on that server. Review
allows the montage review processing to be carried out on a separate
server to balance load better. The only requirement is that Review has
access to the events directory.

## Licence
This repo uses the [REUSE](https://reuse.software) standard in order to
communicate the correct licence for the file. For those unfamiliar with
the standard the licence for each file can be found in one of three
places. The licence will either be in a comment block at the top of the
file, in a `.license` file with the same name as the file, or in the
dep5 file located in the `.reuse` directory. If you are unsure of the
licencing terms please contact
[contact@sidingsmedia.com](mailto:contact@sidingsmedia.com?subject=ICMP%20Exporter%20Licence).
All files committed to this repo must contain valid licencing
information or the pull request can not be accepted.
