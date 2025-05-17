from parser import NginxLogParser

if __name__ == "__main__":
    parser = NginxLogParser()
    parser.parse_file("access.log")
    parser.print_summary()