export function a() {
  return 'Koniciwa';
}

export function b() {
  return 'Arigatou';
}

export function getGroupedData(allGlAccounts) {
  return allGlAccounts.reduce((result, glAccount) => {
    const { groupGl, groupDetail } = glAccount;

    if (!result[groupGl]) {
      result[groupGl] = [];
    }

    result[groupGl].push(groupDetail);

    return result;
  }, {});
}
