import { VideoComparisonPlayer } from "@/components/video-comparison-player";

const previs = 'https://assets.frame.io/encode/1b667a31-d0ba-4539-94f6-010bf2a87b3b/h264_1080_best.mp4?x-amz-meta-project_id=e9794c94-16a4-4e33-b4e6-cdd9757d0e24&x-amz-meta-request_id=F_O_I3WbuCu5PtYFe6OL&x-amz-meta-project_id=e9794c94-16a4-4e33-b4e6-cdd9757d0e24&x-amz-meta-resource_type=asset&x-amz-meta-resource_id=1b667a31-d0ba-4539-94f6-010bf2a87b3b&Expires=1726012800&Signature=o9BntyZICOFK2jY-cEGMGdyNMyjnBGzW1mkLaeazYoh-d9jt0fIipuPRfwYVe-axe-s3l65~alRbLJqzV~y8lETOKwChL4GqDKP2m9j9rrN3ndXMluPXMkH5iQHUX0Oi-x5MDHoXry0xvD9Ea3HrA9fiSNIyfb6hrfW2OrYBN6rF5GVPx1Zo4EsokCdpg34N025zaKV-iRoWGgPA5KTBAxiFwnrckVtbebErfQnoMl1W2EW7SIl9k4zH~dMO-KDQS9OIuv2BuSffOh-YNUNHcr4lCV9Xr3X9ThfilfbSrN4ARBIeZxargvDrz4TxhLt9R~G~svs4pyhU4GI5dO0CPw__&Key-Pair-Id=K1XW5DOJMY1ET9';
const inProgress = 'https://assets.frame.io/encode/3e9dfb98-9050-4b13-99ab-61e1e2fc2698/h264_1080_best.mp4?x-amz-meta-project_id=e9794c94-16a4-4e33-b4e6-cdd9757d0e24&x-amz-meta-request_id=F_O_nPXXhSg76mYIIsQD&x-amz-meta-project_id=e9794c94-16a4-4e33-b4e6-cdd9757d0e24&x-amz-meta-resource_type=asset&x-amz-meta-resource_id=3e9dfb98-9050-4b13-99ab-61e1e2fc2698&Expires=1726012800&Signature=kZoggyrx2KBtvrIQHpiiy2i0mDrne9eDccAIfq1Rp8pIipeVYAns3JdIkgpsJDBv3IQ3PAH0~iCZuDI2aW9y~goFU3vRrf4Ve5d3GU8-SGFlpojrBtt-278wAFEZiIFGgLi55Qh4UfbUp2wuCas-PJ00JDK03zcAa368Q--vokSDs5~X1yp5xekmDPK-zT5KU-3tR6WDcDBsYRKQP106nMeNJCcQ-6Rfm4yo6~NAKmNe3H9CgHCa7EyGiMlD3PMDwusNVjNUQ3KSDdiRoPS2yjROlsR45XgRjJkc-BHHE8Ay9hBj2iauRIiq6RnOrNUF0TypYzTtkCkQJBsWFoqvRw__&Key-Pair-Id=K1XW5DOJMY1ET9';
const final = 'https://assets.frame.io/encode/9c44a464-b81f-4d37-ac5c-cee769549fcb/h264_1080_best.mp4?x-amz-meta-project_id=e9794c94-16a4-4e33-b4e6-cdd9757d0e24&x-amz-meta-request_id=F_O_zG_Ag9CrorkGVoKJ&x-amz-meta-project_id=e9794c94-16a4-4e33-b4e6-cdd9757d0e24&x-amz-meta-resource_type=asset&x-amz-meta-resource_id=9c44a464-b81f-4d37-ac5c-cee769549fcb&Expires=1726012800&Signature=cJE5xgVSX2Nynz1sjmI2OdenCxqSNCeRepIMRn~PBLfRN2baPbxIWEgd3Xa78qFmYvaPdLOS8J77B9RfzeNWdEzQ~YlvX2f5pkWUVtIJxMd7p3uNCDG2AX3Ubdw-SVLgGsHYWuTfBxUJjJFt06xtXAS20c8LLhemKrCzBCZjVNgkfFo1GfNiGu4suo27T3tdJ7UxPeBkKJhm3rQXOtZyJ~0rctnV~SqF47GKcBJl4BDYyyICAQAntKJBiEjounNYiZEIFHEhONuRFjzhclyBF1sqYZhfjI6aWJF6d~8zByNSx2RrCW0fsUPo5uKY0O8WYnvKR-BJwDeWTyCKJRey5w__&Key-Pair-Id=K1XW5DOJMY1ET9';

export default function ComparisonPlayerDemo() {
  return (
    <>
      <VideoComparisonPlayer video1Src={inProgress} video2Src={final} />
    </>
  );
}
