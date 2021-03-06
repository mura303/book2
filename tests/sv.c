#include <stdio.h>
#include <arpa/inet.h> // inet_pton
#include <errno.h> // errno
#include <string.h> // strerror
#include <unistd.h> // read/write

#include "util.h"

int main() {
    int svfd=socket(AF_INET,SOCK_STREAM,0);
    struct sockaddr_in addr;
    addr.sin_family=AF_INET;
    addr.sin_port=htons(22222);
    int ret=inet_pton(AF_INET,"0.0.0.0",&addr.sin_addr.s_addr);
    if(ret<0) { fprintf(stderr,"inet_pton error:%s\n",strerror(errno)); return 1; }
    ret=setsockopt(svfd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));
    if(ret<0) { fprintf(stderr, "setsockopt error:%s\n",strerror(errno)); return 1;}
    ret=bind(svfd,(struct sockaddr*)&addr, sizeof(struct sockaddr_in));
    if(ret<0) { fprintf(stderr,"bind error:%s\n",strerror(errno)); return 1; }
    ret=listen(svfd,5);
    if(ret<0) { fprintf(stderr,"listen error:%s\n",strerror(errno)); return 1; }
    while(1) {
        struct sockaddr_in peer_addr;
        socklen_t peer_addr_len;
        int peerfd=accept(svfd, (struct sockaddr *)&peer_addr, &peer_addr_len);
        if(peerfd<0) { fprintf(stderr,"accept error:%s\n",strerror(errno)); return 1;}
        fprintf(stderr, "accepted\n");
        double last_recv_at=0;
        while(1) {
            char buf[100];
            ret=read(peerfd,buf,sizeof(buf));
            if(ret>0) {
                buf[ret]='\0';
                //ret=write(peerfd,buf,ret);
                double t=now();
                double dt=t-last_recv_at;
                int l=(int)(dt*100);
                char bar[100];
                int i;
                for(i=0;i<sizeof(bar);i++) {
                    if(i<l)bar[i]='*'; else bar[i]=' ';
                }
                bar[sizeof(bar)-1]='\0';
                fprintf(stderr,"dt: %f %s\n",dt,bar);
                last_recv_at=t;
            } else {
                break;
            }
        }
        close(peerfd);
    }
    return 0;
}

