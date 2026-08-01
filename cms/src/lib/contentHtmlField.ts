import type { Field } from 'payload'
import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'

/**
 * A hidden text field that mirrors a sibling Lexical `richText` field as an
 * HTML string, regenerated on every save. Lets the existing frontend keep
 * rendering blog/page content via dangerouslySetInnerHTML unchanged.
 */
export function contentHtmlField(sourceFieldName: string): Field {
  return {
    name: 'contentHtml',
    type: 'textarea',
    admin: {
      hidden: true,
      readOnly: true,
    },
    hooks: {
      beforeChange: [
        async ({ siblingData, req }) => {
          const lexicalData = siblingData?.[sourceFieldName]
          if (!lexicalData) return ''

          const populate = await getPayloadPopulateFn({
            currentDepth: 0,
            depth: 1,
            req,
            overrideAccess: false,
          })

          return await convertLexicalToHTMLAsync({
            data: lexicalData,
            populate,
          })
        },
      ],
    },
  }
}
