# splinter0711/sarvam-translate

## Resumen

Sarvam-Translate es un modelo de traducción automática desarrollado por Sarvam AI en colaboración con AI4Bharat, diseñado específicamente para traducción a nivel de documento entre el inglés y las 22 lenguas oficiales de la India. Se trata de un fine-tuning del modelo multimodal google/gemma-3-4b-it, con 4.300.079.472 parámetros totales, que hereda la arquitectura transformer decoder-only de la familia Gemma 3.

El modelo aborda un problema concreto: las lenguas indias han estado tradicionalmente infrarrepresentadas en el rendimiento de los LLM en comparación con lenguas de altos recursos. Sarvam-Translate se orienta a traducción de documentos completos (páginas web, discursos, libros de texto, artículos científicos) en lugar de frases aisladas, con una ventana de contexto máxima de 8.000 tokens.

Su relevancia actual radica en el manejo versátil de formatos: procesa Markdown, contenido digitalizado con errores de OCR, documentos con ecuaciones matemáticas y químicas embebidas, y ficheros de código (traduciendo únicamente los comentarios). El checkpoint publicado en Hugging Face bajo el identificador splinter0711/sarvam-translate es un espejo del modelo original sarvamai/sarvam-translate, con licencia GPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), fine-tuning de google/gemma-3-4b-it |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (máximo declarado para traducción) |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | as, bn, brx, doi, gom, gu, en, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur (22 lenguas oficiales de la India más inglés) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer decoder-only de la familia Gemma 3 con capacidad multimodal image-text-to-text en su versión base. Sarvam-Translate es un fine-tuning sobre ese checkpoint, orientado específicamente a la tarea de traducción. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO durante el ajuste.

La innovación principal no reside en la arquitectura sino en el enfoque de datos y tarea: entrenamiento orientado a traducción a nivel de documento con contexto largo (hasta 8k tokens), manejo de formatos heterogéneos (Markdown, OCR, ecuaciones, código) y control de estilo y género del hablante. La model card menciona explícitamente que se respetan contextos, formatos y estilos (formal/informal), así como la atribución de género adecuada. No se especifican detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Traducción bidireccional inglés ↔ lenguas indias: el checkpoint publicado solo soporta inglés a lenguas indias y lenguas indias a inglés. Para traducción entre lenguas indias (Indic-to-Indic) es necesario pivotar vía inglés.
- Traducción a nivel de documento con contexto de hasta 8.000 tokens, superando el enfoque de frase aislada.
- Procesamiento de múltiples formatos: Markdown, contenido digitalizado con errores de OCR, documentos con ecuaciones matemáticas y químicas embebidas.
- Traducción de ficheros de código traduciendo únicamente los comentarios y preservando el código fuente.
- Control de estilo (formal/informal) y atribución de género del hablante.
- Soporte de chat template y mensajes con rol de sistema para especificar el idioma destino.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Capacidad multimodal heredada del modelo base Gemma 3 (image-text-to-text), aunque la model card no documenta su uso para traducción de imágenes.

## Casos de uso

- Traducción de documentación técnica y páginas web: el modelo procesa Markdown y contenido HTML hasta 8k tokens, preservando la estructura y traduciendo solo el texto, lo que lo hace adecuado para localizar documentación de producto a lenguas indias.
- Localización de libros de texto y material educativo: su capacidad de manejar documentos largos y contenido con ecuaciones matemáticas y químicas permite traducir material académico sin romper fórmulas.
- Traducción de artículos científicos: el contexto de 8k tokens y el soporte de notación matemática facilitan la traducción de papers manteniendo coherencia terminológica a lo largo del documento.
- Procesamiento de contenido digitalizado (OCR): el modelo está entrenado para tolerar errores de OCR, lo que permite traducir escaneos y digitalizaciones de baja calidad sin una fase de corrección previa exhaustiva.
- Localización de código fuente: traduce únicamente los comentarios de ficheros de código, útil para equipos que mantienen bases de código con comentarios en inglés y necesitan versiones en lenguas indias para formación o documentación interna.
- Atención al cliente multilingüe: mediante el pivotaje vía inglés, permite construir pipelines de traducción para soporte en las 22 lenguas oficiales, con control de estilo formal para comunicaciones corporativas.
- Subtitulado y traducción de discursos: el contexto largo permite traducir transcripciones completas manteniendo coherencia de referencias y terminología a lo largo del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,6 GB solo para pesos (4.300 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV para 8k tokens; se recomienda al menos 12-16 GB de VRAM para contexto completo.
- GPU recomendadas: A100 (40/80 GB), H100 para despliegues de alta concurrencia; L40S o A10G para producción con throughput moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto completo; en RTX 3090 (24 GB) también es viable. En GPUs de 16 GB (RTX 4080, 4070 Ti Super) puede requerir cuantización o reducir la longitud de contexto.
- Opciones de despliegue: vLLM (soportado explícitamente con `vllm serve sarvamai/sarvam-translate --dtype bfloat16 --max-model-len 8192`), Transformers con `AutoModelForCausalLM`, text-generation-inference, y APIs compatibles con OpenAI a través de vLLM.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Sarvam-Translate | 4,3B | 8k | 22 lenguas indias + inglés | GPL-3.0 | Fine-tuning de Gemma 3 4B-IT, especializado en traducción documental |
| google/gemma-3-4b-it (base) | 4,3B | no disponible | Multilingüe general | Gemma license | Modelo base; capacidad de traducción genérica sin especialización |
| NLLB-200 (Meta) | 600M–54B (varias tallas) | 512 tokens | 200 lenguas | CC-BY-NC 4.0 | Traducción frase a frase, sin contexto documental ni formatos |
| IndicTrans2 (AI4Bharat) | ~1B | no disponible | 22 lenguas indias | MIT | Traducción específica Indic, sin soporte de documentos largos ni formatos |

La comparativa se limita a alternativas conocidas por categoría; no se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado solo soporta inglés ↔ lenguas indias; la traducción entre lenguas indias requiere pivotar vía inglés, lo que puede introducir pérdida de matices y errores acumulados.
- Licencia GPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con productos propietarios; es necesario revisar la compatibilidad antes de uso comercial en producción.
- Riesgo de alucinación inherente a los modelos generativos: en traducción puede producir contenido no presente en el original, especialmente en pasajes ambiguos o con OCR muy degradado.
- Sesgos conocidos: no documentados explícitamente en la información disponible; al heredar el modelo base Gemma 3, puede arrastrar sesgos de género, culturales y lingüísticos de su entrenamiento.
- Limitación de contexto a 8.000 tokens: documentos más largos deben fragmentarse, con riesgo de perder coherencia entre segmentos.
- El modelo base es multimodal (image-text-to-text), pero la model card no documenta el rendimiento de traducción sobre imágenes; no debe asumirse capacidad de traducción visual fiable.
- El repositorio es un espejo de terceros (splinter0711) del modelo original sarvamai/sarvam-translate, con 0 descargas y 0 likes en el momento de la consulta; para producción se recomienda usar el checkpoint oficial de sarvamai.
- No se especifican tipos de cuantización soportados ni resultados de benchmarks, lo que dificulta la evaluación previa a producción.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/splinter0711/sarvam-translate
- Modelo original: https://huggingface.co/sarvamai/sarvam-translate
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog de Sarvam AI: https://www.sarvam.ai/blogs/sarvam-translate
- Playground de Sarvam: https://dashboard.sarvam.ai/translate
- Cliente Python de Sarvam: https://pypi.org/project/sarvamai/
