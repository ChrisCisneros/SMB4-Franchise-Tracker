import React from "react";
import { teamOptionLabel } from "../utils/standingsUtils";

export default function AdminPage({ ctx }) {
  const { addPlayer, addTeam, controlsUnlocked, data, deletePlayer, editTeam, newPlayer, newTeam, numberedTeams, playerNameInputRef, resetLeague, selectedAdminRoster, selectedAdminTeam, selectedAdminTeamId, selectedDeletePlayerId, setNewPlayer, setNewTeam, setSelectedAdminTeamId, setSelectedDeletePlayerId } = ctx;

  return (
    <div className="grid two admin-picker-layout">
              <div className="card">
                <h2>Create Team</h2>
                <div className="form-grid">
                  <div><label>City</label><input value={newTeam.city} onChange={(e) => setNewTeam((prev) => ({ ...prev, city: e.target.value }))} /></div>
                  <div><label>Name</label><input value={newTeam.name} onChange={(e) => setNewTeam((prev) => ({ ...prev, name: e.target.value }))} /></div>
                  <div><label>Abbreviation</label><input value={newTeam.abbr} onChange={(e) => setNewTeam((prev) => ({ ...prev, abbr: e.target.value.toUpperCase() }))} maxLength="4" /></div>
                  <div><label>League</label><select value={newTeam.league} onChange={(e) => setNewTeam((prev) => ({ ...prev, league: e.target.value }))}>{data.leagues.map((league) => <option key={league}>{league}</option>)}</select></div>
                  <div><label>Division</label><select value={newTeam.division} onChange={(e) => setNewTeam((prev) => ({ ...prev, division: e.target.value }))}>{data.divisions.map((division) => <option key={division}>{division}</option>)}</select></div>
                </div>
                <button onClick={addTeam}>Add Team</button>
    
                <div className="admin-picker-box">
                  <label>Edit Existing Team</label>
                  <select value={selectedAdminTeamId} onChange={(e) => setSelectedAdminTeamId(e.target.value)}>
                    <option value="">Select team</option>
                    {numberedTeams.map((team) => <option key={team.id} value={team.id}>{`${team.listNumber}. ${teamOptionLabel(team)}`}</option>)}
                  </select>
                </div>
              </div>
    
              <div className="card">
                <h2>Team Editor</h2>
                {selectedAdminTeam ? (
                  <>
                    <div className="team-edit-grid">
                      <input value={selectedAdminTeam.city} onChange={(e) => editTeam(selectedAdminTeam.id, "city", e.target.value)} placeholder="City" />
                      <input value={selectedAdminTeam.name} onChange={(e) => editTeam(selectedAdminTeam.id, "name", e.target.value)} placeholder="Name" />
                      <input value={selectedAdminTeam.abbr} onChange={(e) => editTeam(selectedAdminTeam.id, "abbr", e.target.value.toUpperCase())} placeholder="Abbr" maxLength="4" />
                    </div>
                    <div className="form-grid compact-admin-grid">
                      <div>
                        <label>League</label>
                        <select value={selectedAdminTeam.league} onChange={(e) => editTeam(selectedAdminTeam.id, "league", e.target.value)}>{data.leagues.map((league) => <option key={league}>{league}</option>)}</select>
                      </div>
                      <div>
                        <label>Division</label>
                        <select value={selectedAdminTeam.division} onChange={(e) => editTeam(selectedAdminTeam.id, "division", e.target.value)}>{data.divisions.map((division) => <option key={division}>{division}</option>)}</select>
                      </div>
                    </div>
    
                    <div className="topbar-actions">
                      
      {controlsUnlocked && (
        
        <button className="danger" onClick={resetLeague}>
          Reset All Data
        </button>
        
      )}
    </div>
    
                    <h3>Players</h3>
                    <div className="player-add-row">
                      <div className="player-add-name">
                        <label>Player Name</label>
                        <input
                          ref={playerNameInputRef}
                          value={newPlayer.teamId === selectedAdminTeam.id ? newPlayer.name : ""}
                          onChange={(e) => setNewPlayer({ teamId: selectedAdminTeam.id, name: e.target.value, number: newPlayer.teamId === selectedAdminTeam.id ? newPlayer.number : "" })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addPlayer();
                            }
                          }}
                        />
                      </div>
                      <div className="player-add-number">
                        <label>Number</label>
                        <input
                          value={newPlayer.teamId === selectedAdminTeam.id ? newPlayer.number : ""}
                          onChange={(e) => setNewPlayer({ teamId: selectedAdminTeam.id, name: newPlayer.teamId === selectedAdminTeam.id ? newPlayer.name : "", number: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addPlayer();
                            }
                          }}
                        />
                      </div>
                      <div className="player-add-button-wrap">
                        <button onClick={addPlayer}>Add Player</button>
                      </div>
                    </div>
    
                    <div className="player-delete-row">
                      <div>
                        <label>Delete Player</label>
                        <select value={selectedDeletePlayerId} onChange={(e) => setSelectedDeletePlayerId(e.target.value)}>
                          <option value="">Select player</option>
                          {selectedAdminRoster.map((player) => <option key={player.id} value={player.id}>#{player.number || "--"} {player.name}</option>)}
                        </select>
                      </div>
                      <div className="player-add-button-wrap">
                        <button className="danger" onClick={() => { if (!selectedDeletePlayerId) return; deletePlayer(selectedDeletePlayerId); setSelectedDeletePlayerId(""); }}>Delete Player</button>
                      </div>
                    </div>
    
                    <div className="stack-list">
                      {selectedAdminRoster.map((player) => (
                        <div className="player-display-row" key={player.id}>
                          <div className="player-number-pill">#{player.number || "--"}</div>
                          <div className="player-name-text">{player.name}</div>
                        </div>
                      ))}
                      {!selectedAdminRoster.length && <p className="muted">No players on this team yet.</p>}
                    </div>
                  </>
                ) : (
                  <p className="muted">Select a team to edit its info, roster, or delete it.</p>
                )}
              </div>
            </div>
  );
}
