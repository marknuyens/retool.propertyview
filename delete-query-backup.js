const queries = {
  eig: {
    delete: delete_eigenaar,
    select: [
      fnt_primarygrid_eigenaren,
      fnc_primarygrid_eigenaren,
      fnt_secondarygrid_eos_eigenaren,
      fnc_secondarygrid_eos_eigenaren
    ]
  },
  obj: {
    delete: delete_object,
    select: [
      fnt_primarygrid_objecten,
      fnc_primarygrid_objecten,
      fnt_secondarygrid_objecten,
      fnc_secondarygrid_objecten
    ]
  },
  sub: {
    delete: delete_subobject,
    select: [
      fnt_primarygrid_subobjecten,
      fnc_primarygrid_subobjecten,
      fnt_secondarygrid_eos_subobjecten,
      fnc_secondarygrid_eos_subobjecten
    ]
  },
  unt: {
    delete: delete_unit,
    select: [
      fnt_primarygrid_units,
      fnc_primarygrid_units,
      fnt_secondarygrid_eos_units,
      fnc_secondarygrid_eos_units
    ]
  },
  knt: {
    delete: delete_huurcontract,
    select: [
      fnt_primarygrid_huurcontracten,
      fnc_primarygrid_huurcontracten,
      fnt_secondarygrid_huurcontracten,
      fnc_secondarygrid_huurcontracten
    ]
  },
  oui: {
    delete: delete_uitvoerder,
    select: [
      fnt_secondarygrid_eos_uitvoerders,
      fnc_secondarygrid_eos_uitvoerders
    ]
  },
  svc: {
    delete: delete_servicecontract,
    select: [
      fnt_secondarygrid_eos_servicecontracten,
      fnc_secondarygrid_eos_servicecontracten
    ]
  },
  wer: {
    delete: delete_werkorder,
    select: [
      fnt_secondarygrid_eos_werkorders,
      fnc_secondarygrid_eos_werkorders
    ]
  },
  hop: {
    delete: delete_huuropbouw,
    select: [ 
      fnt_secondarygrid_knt_huuropbouw,
      fnc_secondarygrid_knt_huuropbouw
    ]
  },
  kop: {
    delete: delete_optie,
    select: [
      fnt_secondarygrid_knt_opties,
      fnc_secondarygrid_knt_opties
    ]
  },
  kbo: {
    delete: delete_borgstelling,
    select: [ 
      fnt_secondarygrid_knt_borgstellingen,
      fnc_secondarygrid_knt_borgstellingen
    ]
  },
  rel: {
    delete: delete_relatie,
    select: [
      fnt_primarygrid_relaties,
      fnc_primarygrid_relaties,
      fnt_secondarygrid_relaties,
      fnc_secondarygrid_relaties
    ]
  },
};

const query = queries[current_dossier.value.key] || null;

if(can('delete', current_dossier, current_user)) {
  query.delete.trigger({
    onSuccess: function() {
      utils.showNotification({
        title: 'Succesvol verwijderd',
        description: _.capitalize(current_dossier.value.singular) + 'werd succesvol verwijderd.',
        notificationType: 'success'
      });
      _.each(query.select, (select) => {
        select.invalidateCache();
        select.trigger();
      });
    },
    onFailure: function() {
      utils.showNotification({
        title: 'Verwijderen mislukt',
        description: query.delete.error,
        notificationType: 'error'
      });
    }
  });
}