import User from "../models/User.js";

// ── Addresses ────────────────────────────────────────────────────────────────
export const getAddresses = async (req, res) => {
  const user = await User.findById(req.actor.id);
  if (!user) return res.status(404).json({ message: "Account not found." });
  res.json({ addresses: user.addresses });
};

export const addAddress = async (req, res) => {
  const { label, address, pincode, isDefault } = req.body;
  if (!label?.trim() || !address?.trim()) {
    return res.status(400).json({ message: "Label and address are required." });
  }

  const user = await User.findById(req.actor.id);
  if (!user) return res.status(404).json({ message: "Account not found." });

  if (isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
  user.addresses.push({
    label: label.trim(),
    address: address.trim(),
    pincode: pincode?.trim() || "",
    isDefault: !!isDefault || user.addresses.length === 0, // first address is default automatically
  });
  await user.save();

  res.status(201).json({ addresses: user.addresses });
};

export const updateAddress = async (req, res) => {
  const { label, address, pincode, isDefault } = req.body;
  const user = await User.findById(req.actor.id);
  if (!user) return res.status(404).json({ message: "Account not found." });

  const target = user.addresses.id(req.params.addressId);
  if (!target) return res.status(404).json({ message: "Address not found." });

  if (label !== undefined) target.label = label.trim();
  if (address !== undefined) target.address = address.trim();
  if (pincode !== undefined) target.pincode = pincode.trim();
  if (isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
    target.isDefault = true;
  }
  await user.save();

  res.json({ addresses: user.addresses });
};

export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.actor.id);
  if (!user) return res.status(404).json({ message: "Account not found." });

  const target = user.addresses.id(req.params.addressId);
  if (!target) return res.status(404).json({ message: "Address not found." });

  const wasDefault = target.isDefault;
  target.deleteOne();
  if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;
  await user.save();

  res.json({ addresses: user.addresses });
};

// ── Notification preferences ────────────────────────────────────────────────
export const getNotificationPrefs = async (req, res) => {
  const user = await User.findById(req.actor.id);
  if (!user) return res.status(404).json({ message: "Account not found." });
  // Accounts created before this field existed won't have it set — default
  // to "on" rather than showing broken/undefined toggles.
  res.json({ notificationPrefs: user.notificationPrefs || { bookingUpdates: true, offers: true } });
};

export const updateNotificationPrefs = async (req, res) => {
  const { bookingUpdates, offers } = req.body;
  const user = await User.findByIdAndUpdate(
    req.actor.id,
    {
      notificationPrefs: {
        bookingUpdates: bookingUpdates !== undefined ? !!bookingUpdates : true,
        offers: offers !== undefined ? !!offers : true,
      },
    },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "Account not found." });
  res.json({ notificationPrefs: user.notificationPrefs });
};
