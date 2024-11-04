package com.balthazargronon.RCTZeroconf;

import com.facebook.react.bridge.ReadableMap;

import javax.annotation.Nullable;

public interface Zeroconf {

    void scan(String type, String protocol, String domain, @Nullable String regexFilterName);

    void stop();

    public void unregisterService(String serviceName);

    public void registerService(String type, String protocol, String domain, String name, int port, ReadableMap txt);
}
