# Tries to find an open port
findOpenLocalPort(){
  read LOWERPORT UPPERPORT < /proc/sys/net/ipv4/ip_local_port_range
  while :
  do
    LOCAL_PORT="`shuf -i $LOWERPORT-$UPPERPORT -n 1`"
    ss -lpn | grep -q ":${LOCAL_PORT} " || break
  done
  echo $LOCAL_PORT
}

nextIp(){
    IP=$1
    IP_HEX=$(printf '%.2X%.2X%.2X%.2X\n' `echo $IP | sed -e 's/\./ /g'`)
    NEXT_IP_HEX=$(printf %.8X `echo $(( 0x$IP_HEX + 1 ))`)
    NEXT_IP=$(printf '%d.%d.%d.%d\n' `echo $NEXT_IP_HEX | sed -r 's/(..)/0x\1 /g'`)

    if [[ ${NEXT_IP} == *.0 ]]; then
        nextIp ${NEXT_IP}
        return
    fi

    echo "${NEXT_IP}"
}
