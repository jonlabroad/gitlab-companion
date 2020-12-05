
Remove-Item build.zip
cd build
7z a ../build.zip ./*
cd ..
aws s3 cp ./build.zip s3://gitlab-companion/release/gitlab-companion.zip