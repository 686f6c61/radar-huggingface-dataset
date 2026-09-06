# UyghurAI/idirak-model

## Resumen

UyghurAI/idirak-model es un proyecto de la organización UyghurAI para crear un asistente conversacional en uigur (escritura árabe). Se trata de un adaptador QLoRA (PEFT) sobre el modelo base Qwen/Qwen3-4B, entrenado con el dataset UyghurAI/idirak-uyghur-instructions. El repositorio actual contiene el pipeline reproducible de entrenamiento y evaluación, pero no incluye pesos entrenados de producción. El objetivo es ofrecer conversación natural en uigur, traducción entre uigur, inglés, chino y turco, resumen y reescritura, así como respuestas fundamentadas para la herramienta de documentos IDIRAK.

La arquitectura es un transformer de 4B parámetros (Qwen3-4B) con un adaptador LoRA de bajo rango entrenado mediante QLoRA a 4 bits. No se especifica la longitud de contexto en la información disponible. El proyecto es relevante porque aborda una lengua de pocos recursos (uigur) con un enfoque reproducible y revisión por hablantes nativos, aunque todavía se encuentra en fase inicial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B) con adaptador QLoRA (PEFT) |
| Parametros totales | No disponible (adaptador PEFT; el modelo base Qwen/Qwen3-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QLoRA (4-bit) para entrenamiento; no se especifican para inferencia |
| Idiomas soportados | Uigur (ug), inglés (en), chino (zh), turco (tr) |
| Licencia | Other |
| Formato de pesos | No disponible (adaptador PEFT; no se han publicado pesos de producción) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3-4B, un transformer de 4B parámetros. El fine-tuning se realiza con QLoRA (cuantización a 4 bits) y una pérdida que solo se aplica a las respuestas del asistente (assistant-only loss). El dataset de entrenamiento es UyghurAI/idirak-uyghur-instructions, que según la model card es una semilla de esquema y pipeline, no suficiente para entrenamiento de producción.

El proceso de IDIRAK v1 consiste en comparar modelos base multilingües en un conjunto de evaluación nativo en uigur, seleccionar el mejor, aplicar QLoRA, evaluar el adaptador y publicarlo solo después de la revisión de hablantes nativos. El modelo base por defecto es Qwen/Qwen3-4B, pero se puede sobrescribir con `--model-id` (por ejemplo, `google/gemma-3-4b-it`).

## Capacidades

- Conversación natural en uigur (escritura árabe).
- Asistencia de traducción entre uigur, inglés, chino y turco.
- Resumen y reescritura de textos.
- Respuestas fundamentadas para la herramienta de documentos IDIRAK.
- Manejo honesto de preguntas inciertas o no respaldadas.
- No se especifican capacidades de tool calling, visión, audio, agentes o razonamiento multi-paso.

## Casos de uso

Casos de uso previstos según la model card:

- Asistente conversacional en uigur: el modelo puede integrarse en aplicaciones de chat o atención al usuario para hablantes nativos, manteniendo diálogos multi-turno en escritura árabe.
- Traducción asistida: apto para traducir documentos o conversaciones entre uigur, inglés, chino y turco, con métricas chrF como referencia de calidad.
- Resumen de documentos: puede condensar textos largos en uigur, útil en entornos editoriales, legales o de investigación.
- Reescritura de textos: permite mejorar claridad, estilo o corrección de textos en uigur.
- Respuestas fundamentadas para IDIRAK: el modelo puede responder preguntas basándose en documentos, lo que lo hace adecuado para sistemas de consulta interna o asistentes de documentación.
- Evaluación de modelos base: el pipeline de evaluación permite comparar modelos multilingües en un conjunto de evaluación en uigur, útil para investigadores de lenguas de pocos recursos.
- Soporte multilingüe en servicios públicos: facilita la comunicación entre hablantes de uigur y administraciones que operan en chino o inglés, reduciendo barreras lingüísticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un conjunto de evaluación en uigur con revisión humana y puntuaciones chrF para traducción, pero no se proporcionan resultados numéricos.

## Requisitos de hardware

- Entrenamiento: se requiere un equipo Linux con GPU NVIDIA. QLoRA a 4 bits no está pensado para ejecutarse en macOS.
- Inferencia: no se especifican requisitos. Al ser un adaptador sobre Qwen3-4B, la VRAM necesaria dependerá del modelo base y su cuantización; se recomienda consultar la documentación de Qwen3-4B.
- Opciones de despliegue: no documentadas. Se puede usar con bibliotecas PEFT/HuggingFace, pero no hay guías oficiales para vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la información disponible. El modelo base Qwen/Qwen3-4B podría servir como referencia, pero no se trata de una alternativa en uigur.

## Limitaciones y advertencias

- El repositorio actual no contiene pesos entrenados de producción; solo el pipeline reproducible.
- El dataset inicial es pequeño y está marcado como semilla; cada fila con `needs_native_review` debe ser revisada por un hablante nativo.
- La licencia es "other" y la licencia final depende del modelo base seleccionado y de los derechos de todas las fuentes de entrenamiento. No se deben publicar pesos hasta que ambos estén documentados.
- No se han publicado evaluaciones con resultados numéricos, por lo que el rendimiento real es desconocido.
- Existe riesgo de alucinación en temas no respaldados, aunque el diseño busca un manejo honesto de la incertidumbre.
- El rendimiento en uigur puede variar según dialecto o registro, y no se garantiza cobertura completa de variantes.

## Enlaces

- HuggingFace: https://huggingface.co/UyghurAI/idirak-model
- IDIRAK Lab: https://huggingface.co/spaces/UyghurAI/idirak-lab
- Dataset de instrucciones: https://huggingface.co/datasets/UyghurAI/idirak-uyghur-instructions
- Colección IDIRAK AI Ecosystem: https://huggingface.co/collections/UyghurAI/idirak-ai-ecosystem
- Sitio web: https://idirak.com
- Página del modelo IDIRAK: https://model.idirak.com/
