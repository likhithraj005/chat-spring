package com.application.chatserver.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

//To set websocket configuration
@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {  // control + i
//        WebSocketMessageBrokerConfigurer.super.configureMessageBroker(registry);

        //setting up prefixes

        // Prefix for client messages sent to the server
        // need to give our application prefix, in which user sending the data to the server
        registry.setApplicationDestinationPrefixes("/app");

        // Enables a simple in-memory message broker with topics for broadcasting
        //need to declare Topics prefixes
        registry.enableSimpleBroker("/chatroom", "/user");

        // Prefix for messages sent to specific users (for private messaging)
        //need to declare user destination prefixes
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
//        WebSocketMessageBrokerConfigurer.super.registerStompEndpoints(registry);

        // Defines the WebSocket endpoint for client connections

        //add stamp endpoints, this serves as a starting path for all our websocket connection
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") //to enable cross-origin requests resource sharing for all the website
                .withSockJS(); // Enables SockJS fallback for browsers that do not support WebSocket
    }
}
