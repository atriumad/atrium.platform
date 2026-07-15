import Eyebrow from '@/components/ui/Eyebrow'

// ─── Comparison vs alternatives (doc vs.md §2.3 / §9.9) ─────────────────────
// Answers the decisive objection: "Why hire Atrium instead of keeping my
// photographer, social manager, and ads agency?"

const columns = ['Atrium', 'Freelancer', 'Generalist agency', 'In-house team'] as const

type Row = { criterion: string; values: [string, string, string, string] }

const rows: Row[] = [
  { criterion: 'Hospitality expertise', values: ['High', 'Variable', 'Low or variable', 'High'] },
  { criterion: 'Strategy + production integrated', values: ['Yes', 'Rarely', 'Sometimes', 'Depends'] },
  { criterion: 'Google, CRM & retention', values: ['Integrated', 'Limited', 'Fragmented', 'Needs specialists'] },
  { criterion: 'On-site production', values: ['Yes', 'Possible', 'Possible', 'Costly'] },
  { criterion: 'Reporting tied to revenue', values: ['Yes', 'Rarely', 'Variable', 'Tool-dependent'] },
  { criterion: 'Multi-location scale', values: ['Built for it', 'Limited', 'Possible', 'Needs hiring'] },
  { criterion: 'One accountable owner', values: ['Yes', 'Partial', 'Yes', 'Internal'] },
  { criterion: 'Operating cadence', values: ['28-day cycle', 'Ad hoc', 'Campaigns or retainers', 'Variable'] },
]

export default function ComparisonMatrix() {
  return (
    <section className="px-6 md:px-12 py-24 md:py-32" style={{ background: 'var(--surface-page)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12 md:mb-16">
          <Eyebrow className="mb-4">Why Atrium</Eyebrow>
          <h2 className="type-section-title" style={{ color: 'var(--text-strong)' }}>
            One accountable team, <em>not five vendors.</em>
          </h2>
          <p className="type-body mt-5 max-w-md" style={{ color: 'var(--text-muted)' }}>
            The real question isn&apos;t Atrium versus another agency. It&apos;s Atrium versus the
            photographer, the social manager, and the ads shop you&apos;re already juggling.
          </p>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full border-collapse min-w-[42rem]">
            <thead>
              <tr>
                <th className="text-left" aria-hidden />
                {columns.map((col) => {
                  const isAtrium = col === 'Atrium'
                  return (
                    <th
                      key={col}
                      scope="col"
                      className="type-caption px-4 py-4 text-left align-bottom"
                      style={{
                        color: isAtrium ? 'var(--teal-800)' : 'var(--text-muted)',
                        fontWeight: isAtrium ? 600 : 500,
                        background: isAtrium ? 'color-mix(in srgb, var(--mint-400) 22%, transparent)' : 'transparent',
                        borderTopLeftRadius: isAtrium ? 'var(--radius-md)' : undefined,
                        borderTopRightRadius: isAtrium ? 'var(--radius-md)' : undefined,
                      }}
                    >
                      {col}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.criterion} style={{ borderTop: '1px solid rgba(7,47,52,0.08)' }}>
                  <th
                    scope="row"
                    className="type-caption px-4 py-4 text-left font-medium"
                    style={{ color: 'var(--text-strong)' }}
                  >
                    {row.criterion}
                  </th>
                  {row.values.map((value, i) => {
                    const isAtrium = i === 0
                    return (
                      <td
                        key={columns[i]}
                        className="type-caption px-4 py-4"
                        style={{
                          color: isAtrium ? 'var(--teal-800)' : 'var(--text-muted)',
                          fontWeight: isAtrium ? 600 : 400,
                          background: isAtrium ? 'color-mix(in srgb, var(--mint-400) 10%, transparent)' : 'transparent',
                        }}
                      >
                        {value}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
