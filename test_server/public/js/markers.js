// 마커 표시
function displayMarkers(data) {
	data.forEach((place, index) => {
		var marker = new kakao.maps.Marker({
			position: new kakao.maps.LatLng(place.y, place.x),
			map: map
		});
		
		// 마커에 place 정보 저장
		marker.placeData = place;
		markers.push(marker);

		// 인포윈도우
		var infowindow = new kakao.maps.InfoWindow({
			content: '<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>'
		});

		kakao.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map, marker);
			// 마커 클릭 시에도 상세 정보 표시
			showPlaceDetail(place, marker);
			map.setCenter(new kakao.maps.LatLng(place.y, place.x));
			map.setLevel(3);
		});
	});
}





