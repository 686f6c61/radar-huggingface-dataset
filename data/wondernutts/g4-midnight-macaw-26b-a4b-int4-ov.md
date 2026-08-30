# Wondernutts/G4-Midnight-Macaw-26B-A4B-int4-ov

## Resumen

G4 Midnight Macaw 26B-A4B es un modelo de lenguaje de tipo mixture-of-experts (MoE) basado en la arquitectura Gemma 4, con 26 mil millones de parámetros totales y 4 mil millones activos por token. El modelo original fue creado por Vortex5 mediante la fusión de varios modelos especializados en ficción, roleplay y escritura creativa, y está orientado a tareas de narración, diálogo y generación de historias. Esta versión concreta, publicada por Wondernutts, es una conversión a formato OpenVINO con compresión INT4 AWQ, diseñada para ejecución local eficiente en GPUs Intel Arc y otros dispositivos compatibles con OpenVINO.

La relevancia de esta ficha radica en que ofrece una vía de despliegue optimizada para hardware Intel, con un tamaño de repositorio de 16,1 GB y una ventana de contexto de 131.072 tokens gracias a la optimización de la tabla RoPE. El modelo es multimodal, acepta entradas de imagen y texto y genera texto, lo que lo hace adecuado para aplicaciones creativas y de asistencia conversacional. La licencia Apache-2.0 permite uso comercial con las debidas atribuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 26B-A4B (mixture-of-experts, multimodal) |
| Parametros totales | 26 mil millones |
| Parametros activos | 4 mil millones (A4B) |
| Longitud de contexto | 131.072 tokens (RoPE LUT optimizado) |
| Tipos de cuantizacion | INT4 asimetrico AWQ, grupo de 64, ratio 1.0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (no Transformers, no GGUF) |

## Arquitectura y entrenamiento

El modelo base es una mezcla de cuatro modelos: `electroglyph/gemma4-26b-fiction-bf16`, `ReadyArt/Serenity-26B-A4B`, `Vortex5/G4-Dark-Soul-26B-A4B` y `ReadyArt/Dark-Scarlett-v1.0-26B-A4B`, fusionados mediante un metodo personalizado por Vortex5. La arquitectura subyacente es la de Gemma 4 26B-A4B, un MoE con 26B de parametros totales y 4B activos, que incluye capacidades multimodales (vision y texto). No se dispone de informacion detallada sobre el dataset de entrenamiento original ni sobre el proceso de alineacion (RLHF/DPO) de los modelos componentes.

La conversion a OpenVINO realizada por Wondernutts aplica compresion de pesos INT4 asimetrica con AWQ, grupo de 64 y ratio 1.0. Las capas de enrutamiento del MoE se excluyen de la compresion para preservar la calidad del routing. Se incluyen artefactos de tokenizador y detokenizador OpenVINO, y se aplica una optimizacion de tabla RoPE con 131.072 posiciones (parche LUT131K). El grafo resultante es multimodal y se sirve mediante la API `VLMPipeline` de OpenVINO GenAI.

## Capacidades

- Generacion de texto creativo: roleplay, narrativa, storytelling y brainstorming.
- Entrada multimodal: acepta imagenes ademas de texto, generando respuestas textuales.
- Conversacion multi-turno: disenado para dialogos extensos y coherentes.
- Optimizacion para hardware Intel: ejecucion eficiente en GPUs Intel Arc y dispositivos OpenVINO.
- Ventana de contexto larga: 131.072 tokens, adecuada para mantener historias o conversaciones de gran extension.
- No se documentan capacidades de tool calling, function calling ni agentes.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de novelas, cuentos o guiones, manteniendo coherencia narrativa a lo largo de capitulos gracias a su contexto de 131.072 tokens.
- Roleplay interactivo: ideal para juegos de rol por texto o chatbots de personaje, con respuestas contextuales y adaptativas.
- Generacion de dialogos para videojuegos: permite crear conversaciones no lineales para NPCs, aprovechando su entrenamiento en ficcion.
- Brainstorming de ideas: util para sesiones de lluvia de ideas en equipos creativos, generando multiples propuestas a partir de una premisa.
- Asistente de redaccion: ayuda a redactar correos, articulos o publicaciones con un tono narrativo o conversacional.
- Analisis de imagenes con generacion de texto: al ser multimodal, puede describir o interpretar imagenes y producir texto relacionado, por ejemplo para generar pies de foto o narraciones a partir de fotografias.

## Benchmarks y rendimiento

La model card incluye una tabla de referencia del runtime stack optimizado para Gemma 4 26B-A4B en una GPU Intel Arc Pro B70, pero se indica explicitamente que no es una medicion especifica de este checkpoint. Se reproduce a continuacion como referencia del stack, no como rendimiento atribuible al modelo:

| Referencia | Resultado |
|---|---:|
| Procesamiento sostenido de 6.622 tokens | 5.827,2 tok/s |
| Decodificacion en contexto corto | 112,2 tok/s |
| Decodificacion tras 6.622 tokens de contexto | 94,9 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este modelo en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 16,1 GB, lo que sugiere que la carga en VRAM sera inferior a ese tamano tras la cuantizacion INT4, aunque no se especifica el valor exacto.
- Disenado para GPUs Intel Arc (se menciona Arc Pro B70 en las pruebas de referencia) y cualquier dispositivo compatible con OpenVINO.
- Puede ejecutarse en CPU mediante OpenVINO, aunque con menor rendimiento que en GPU.
- Se requiere OpenVINO GenAI y Hugging Face Hub para la inferencia; no es compatible con Transformers.
- Para uso local en consumer GPU, una Intel Arc con al menos 12 GB de VRAM seria recomendable, pero no hay datos oficiales de requisitos minimos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| G4-Midnight-Macaw-26B-A4B (base) | 26B totales, 4B activos | 131.072 | Transformers (BF16) | Apache-2.0 | Modelo original sin cuantizar, requiere mas VRAM |
| G4-Midnight-Macaw-26B-A4B-int4-ov (este) | 26B totales, 4B activos | 131.072 | OpenVINO INT4 | Apache-2.0 | Optimizado para Intel, menor huella de memoria |
| Gemma 4 26B A4B IT (original de Google) | 26B totales, 4B activos | 131.072 | Transformers | Gemma license | Modelo base sin fine-tuning creativo |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de rendimiento para comparar con otros MoE de tamano similar.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: requiere OpenVINO GenAI y la API `VLMPipeline`; no puede cargarse con `AutoModelForCausalLM`.
- El modelo esta orientado a roleplay y escritura creativa, por lo que puede generar contenido ficticio o inapropiado si no se supervisa.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad; se recomienda validar las salidas en entornos de produccion.
- La licencia Apache-2.0 se hereda del modelo base, pero los componentes originales (Gemma 4, modelos de ficcion) pueden tener licencias adicionales; revisar las cards upstream antes de redistribuir o usar comercialmente.
- El rendimiento de referencia citado en la model card no es una medicion de este checkpoint; no debe atribuirse a este modelo sin una prueba especifica.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; su uso se limita a generacion de texto y procesamiento de imagenes.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Wondernutts/G4-Midnight-Macaw-26B-A4B-int4-ov
- Modelo base (Vortex5): https://huggingface.co/Vortex5/G4-Midnight-Macaw-26B-A4B
- Modelo componente: https://huggingface.co/electroglyph/gemma4-26b-fiction-bf16
- Modelo componente: https://huggingface.co/ReadyArt/Serenity-26B-A4B
- Modelo componente: https://huggingface.co/Vortex5/G4-Dark-Soul-26B-A4B
- Modelo componente: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B
- Fork OpenVINO de referencia: https://github.com/Wondernuttz/openvino/tree/arc-xe2-gemma4-pa-2026.4
- Commit de referencia del stack: https://github.com/Wondernuttz/openvino/commit/2c82358676775a29651530c97258b3f703c4fd68
