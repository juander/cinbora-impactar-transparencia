FROM mongo:7.0

COPY ./setup-replica.sh /setup-replica.sh

# Ensure correct permissions and line endings
RUN chmod +x /setup-replica.sh && \
    sed -i 's/\r$//' /setup-replica.sh

ENTRYPOINT ["/setup-replica.sh"]