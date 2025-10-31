// import axios from "axios";
// import { showAlert } from './alert';
// export const getProdCat = async () => {
//     try{
//         const res = await axios({
//             method: 'GET',
//             url: '/api/v1/products/categories'
//         });
//         if(res.data.status === 'success'){
//             return res.data.data.categories;
//         }
//     }catch(err){
//         console.error('❌ Error getting products and categories:', err);
//         showAlert('error', err.response?.data?.message || 'Something went wrong!', () => {
//             location.reload();
//         })
//     }
// };