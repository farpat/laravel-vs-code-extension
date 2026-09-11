<?php

use App\Services\TenantStorage;

test('switches the disk to the tenant', function (): void {
    $storage = app(TenantStorage::class);

    $storage->execute('taxi-voisin.fr');
    app(TenantStorage::class)->execute('taxi-nouveau.fr');
    resolve(TenantStorage::class)->execute('taxi-voisin.fr');
});
