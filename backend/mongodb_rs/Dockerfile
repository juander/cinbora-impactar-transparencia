FROM mongo:7.0

COPY ./setup-replica.sh /setup-replica.sh

# Garantir que o script tenha line endings corretos para Linux e permissão de execução
RUN sed -i 's/\r$//' /setup-replica.sh && \
    chmod +x /setup-replica.sh

ENTRYPOINT ["/setup-replica.sh"]