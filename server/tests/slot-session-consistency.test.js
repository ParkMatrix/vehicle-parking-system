const { validateSlotSessionConsistency } = require('../scripts/check-slot-session-consistency');

const slots = [
  { _id: 'slot1', slotId: 'A-01', status: 'Occupied' },
  { _id: 'slot2', slotId: 'A-02', status: 'Available' },
];

const session = (id, vehicleId, slotId) => ({
  _id: id,
  vehicleId,
  slotId,
  status: 'active',
});

describe('VPS-NF-004: Slot-session consistency validator (TC-N-004)', () => {
  it('passes when occupied slots have one active session and available slots have none', () => {
    expect(
      validateSlotSessionConsistency(slots, [session('s1', 'v1', 'slot1')])
    ).toEqual([]);
  });

  it('reports an occupied slot without an active session', () => {
    expect(
      validateSlotSessionConsistency(slots, [])
    ).toContain('Occupied slot A-01 has no active session');
  });

  it('reports an active session whose slot is not occupied', () => {
    const issues = validateSlotSessionConsistency(
      slots,
      [session('s1', 'v1', 'slot2')]
    );

    expect(issues).toContain(
      'Active session s1 references a slot that is not Occupied'
    );
  });

  it('reports an active session referencing a missing slot', () => {
    const issues = validateSlotSessionConsistency(
      slots,
      [session('s1', 'v1', 'missing-slot')]
    );

    expect(issues).toContain(
      'Active session s1 references a missing slot missing-slot'
    );
  });

  it('reports multiple active sessions assigned to one slot', () => {
    const issues = validateSlotSessionConsistency(slots, [
      session('s1', 'v1', 'slot1'),
      session('s2', 'v2', 'slot1'),
    ]);

    expect(issues).toContain('Slot A-01 has 2 active sessions');
  });

  it('reports multiple active sessions for one vehicle', () => {
    const issues = validateSlotSessionConsistency(
      [
        ...slots,
        { _id: 'slot3', slotId: 'A-03', status: 'Occupied' },
      ],
      [
        session('s1', 'v1', 'slot1'),
        session('s2', 'v1', 'slot3'),
      ]
    );

    expect(issues).toContain('Vehicle v1 has 2 active sessions');
  });
});
