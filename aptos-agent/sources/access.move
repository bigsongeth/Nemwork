module access::simple_storage {
    use std::signer;

    struct SimpleStorage has key {
        value: u64,
    }

    public entry fun store_value(user: &signer, value: u64) acquires SimpleStorage {
        let user_addr = signer::address_of(user);

        if (!exists<SimpleStorage>(user_addr)) {
            move_to(user, SimpleStorage { value });
        } else {
            let storage = borrow_global_mut<SimpleStorage>(user_addr);
            storage.value = value;
        }
    }

    public fun get_value(account: address): u64 acquires SimpleStorage {
        if (exists<SimpleStorage>(account)) {
            let storage = borrow_global<SimpleStorage>(account);
            storage.value
        } else {
            0
        }
    }

    /// This is guaranteed to be recognized as a view function 
    /// because it doesn't read or write any global resources
    #[view]
    public fun get_meaning_of_view(): u64 {
        42
    }
}