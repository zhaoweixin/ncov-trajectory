
let mutation = {
    UPDATE_dataprocesscomplete(state, upload){
        state.dataprocesscomplete = upload;
    },
    UPDATE_traj_data(state, upload){
        state.traj_data = upload;
    },
    UPDATE_event_type(state, upload){
        state.event_type = upload
    },
    UPDATE_timerange(state, upload){
        state.timerange = upload
    },
    UPDATE_traj_dict(state, upload){
        state.traj_dict = JSON.parse(JSON.stringify(upload))
    },
    UPDATE_person_dict(state, upload){
        state.person_dict = JSON.parse(JSON.stringify(upload))
    },
    UPDATE_dateTime(state, upload){
        state.dateTime = JSON.parse(JSON.stringify(upload))
    },
    UPDATE_PROJ(state, upload){
        state.proj = upload
    },
    UPDATE_UPDATEMAP(state, upload){
        state.updatemap = JSON.parse(JSON.stringify(upload))
    },
    UPDATE_FUNCBAR(state, upload){
        state.funcbar = JSON.parse(JSON.stringify(upload))
    }
}
export default mutation;