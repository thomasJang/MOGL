/**
 * Created by redcamel on 2015-05-07.
 */
var BlendMode = {
    add: 'add', //'add' - 전면색을 배경색에 더하고 올림값 0xFF를 적용.
    alpha: 'alpha',//'alpha' - 전면색의 알파값에 따라 배경색을 덮어가는 가장 일반적인 중첩.
    darken: 'darken',//'darken' - 전면색과 배경색 중 보다 어두운 색상(값이 작은 색상)을 선택.
    difference: 'difference', //'difference' - 전면색과 배경색을 비교하여 둘 중 밝은 색상 값에서 어두운 색상 값을 뺌.
    erase: 'erase', //'erase' - 전면색의 알파만 적용하여 배경색을 지움.
    hardlight: 'hardlight', //'hardlight' - 전면색의 어두운 정도를 기준으로 배경색을 조정.
    invert: 'invert', //'invert' - 전면색을 이용하여 배경색을 반전시킴.
    lighten: 'lighten', //'lighten' - 전면색과 배경색 중 보다 밝은 색(값이 큰 색상)으로 선택.
    multiply: 'multiply', //'multiply' - 전면색에 배경색을 곱하고 0xFF로 나누어 정규화하여 보다 어두운 색을 만듬.
    screen: 'screen', //'screen' - 전면색의 보수(역수)에 배경색 보수를 곱하여 표백 효과를 냄.
    subtract: 'subtract' //'subtract' - 전면색의 값을 배경색에서 빼고 내림값 0을 적용
}
Object.freeze(BlendMode);