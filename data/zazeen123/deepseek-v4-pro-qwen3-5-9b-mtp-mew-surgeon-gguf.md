# zazeen123/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-Mew-Surgeon-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-MTP-Mew-Surgeon-GGUF es una cuantización GGUF Q4_K_M del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un Qwen3.5-9B destilado a partir de DeepSeek-V4-Pro mediante SFT y GSPO sobre aproximadamente 250.000 muestras de matemáticas y STEM. El modelo base conserva la arquitectura transformer de Qwen3.5-9B con soporte de decodificación especulativa MTP (multi-token prediction) y proyector de visión. El autor de este repositorio, zazeen123, no ha reentrenado el modelo: ha aplicado una cirugía de vocabulario ("model-surgery") que reduce el tokenizer de 248.320 a 100.100 entradas, conservando únicamente tailandés, inglés, código, dígitos, puntuación y los tokens especiales (chat, thinking, tool call, visión).

El resultado es un archivo un 14,6% más pequeño (4.705 MB frente a 5.512 MB) y entre un 12% y un 34% más rápido en generación según se use o no el borrador MTP, con una tasa de aceptación de borradores prácticamente idéntica (52,7% frente a 53,2% a n=4). Las filas de embedding y de salida de los tokens conservados se copian byte a byte desde el Q4_K_M original, de modo que la calidad sobre tailandés e inglés se mantiene dentro del margen medido.

Es relevante ahora porque demuestra una vía de optimización sin entrenamiento para despliegues en producción con presupuesto de VRAM ajustado, a costa de eliminar por completo el multilingüismo fuera de tailandés e inglés. La licencia Apache 2.0 y el formato GGUF lo hacen directamente utilizable en llama.cpp y en endpoints compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B), con cabezas MTP para decodificación especulativa y proyector de visión externo |
| Parametros totales | 7.982.875.648 (aproximadamente 8,0 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | tailandés (th), inglés (en); código incluido; resto de escrituras eliminadas del vocabulario |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión `mmproj-F32.gguf` en el repositorio original |
| Vocabulario | 100.100 tokens (original: 248.320) |
| Tamano del archivo | 4.705 MB (original: 5.512 MB, −14,6%) |
| Tamano del repo | 4,9 GB |
| Modelo base | Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B |
| SHA256 del archivo | e2cced3e94c22ca8c2f09be256492b9cc5bc234965508a5b188b8f298b7b7670 |

## Arquitectura y entrenamiento

El modelo subyacente es un Qwen3.5-9B (transformer denso de aproximadamente 8.000 millones de parámetros) destilado por Jackrong desde DeepSeek-V4-Pro. El proceso de destilación consistió en SFT seguido de GSPO sobre un corpus de unas 250.000 muestras de matemáticas y STEM; el autor original agradece a Kyle Hessling el hardware, el soporte de entrenamiento y la evaluación, y a Unsloth las herramientas de fine-tuning. Sobre esa base se añadieron cabezas MTP para decodificación especulativa, que permiten proponer varios tokens por paso y verificarlos en un solo lote.

La intervención de este repositorio es puramente estructural: se recorta el vocabulario a 100.100 entradas seleccionadas a partir de un corpus de Wikipedia en tailandés e inglés, código y texto de tool calls. Se conservan todos los tokens especiales (chat, thinking, tool call, visión). Las filas de embedding de entrada y de salida correspondientes a los tokens conservados se copian byte a byte en Q4_K_M; el resto se elimina y el tokenizer se renumera. No hay ningún paso de entrenamiento ni de calibración adicional. Se realizó una comprobación ortográfica sobre 388 palabras inglesas cuyos tokens de palabra completa habían sido eliminados en un primer recorte: se restituyeron las que el modelo escribía mal, quedando un único error residual (`TextChanged`, 0,3%).

## Capacidades

- Generación de texto conversacional multi-turno en tailandés e inglés, con plantilla de chat embebida en el archivo.
- Razonamiento con modo thinking (la model card indica "thinking on" en las evaluaciones).
- Matemáticas y STEM, heredadas de la destilación sobre aproximadamente 250.000 muestras.
- Generación de código, con rendimiento equivalente al original en comparación pareada.
- Tool calling / function calling: 27/27 en inglés y 27/28 en tailandés (98,2% agregado, idéntico al original).
- Razonamiento agéntico multi-paso: 90% de acierto, igual que el original.
- Visión: requiere el `mmproj-F32.gguf` del repositorio original; 12/12 en preguntas sobre imágenes de pantalla (9 en inglés, 3 en tailandés).
- Decodificación especulativa MTP (n=4 y n=6) y combinación con el borrador n-gram de llama.cpp (`ngram-mod`).
- Sin soporte práctico para japonés, chino, coreano ni otras escrituras: el texto en esos idiomas se escribe como bytes crudos, lento y en su mayoría corrupto.

## Casos de uso

- Asistentes conversacionales en tailandés e inglés: el modelo mantiene diálogos multi-turno con plantilla de chat propia y un vocabulario optimizado para ambos idiomas, lo que reduce el coste por token en producción.
- Automatización de soporte con tool calling: con un 98,2% de acierto en llamadas a herramientas en las 55 pruebas pareadas, es adecuado para integrar APIs y consultas a sistemas internos en flujos de atención al cliente.
- Pipelines agénticos de varios pasos: el 90% de acierto en pasos agénticos permite encadenar planificación, ejecución de herramientas y verificación dentro de un mismo bucle.
- Generación y revisión de código en local: con MTP n=4 alcanza 160,6 t/s y con MTP más n-gram llega a 177,4 t/s en prompts de código sobre una RTX 5060 Ti de 16 GB, lo que lo hace viable para autocompletado y refactorización en estaciones de trabajo sin GPU de datacenter.
- Procesamiento de documentos y pantallas en tailandés: el proyector de visión del repositorio original permite extraer datos de capturas (botones de diálogo, números de recibo, tablas) con 12/12 de acierto en la muestra evaluada.
- Despliegue en hardware de consumo: el archivo de 4.705 MB cabe en GPUs de 8 GB o más con `-ngl 99`, lo que habilita prototipos y demos en portátiles con GPU discreta.
- Evaluación comparativa de técnicas de cirugía de vocabulario: sirve como referencia reproducible para medir el impacto de recortar el tokenizer sin reentrenar.

## Benchmarks y rendimiento

Comparaciones pareadas contra el archivo original, greedy y thinking activado, según la model card.

| Prueba | Original | Este archivo | Diferencia |
|---|---|---|---|
| Tool calls (inglés) | 27/27 | 27/27 | igual |
| Tool calls (tailandés) | — | 27/28 | 98,2% agregado en ambos |
| Pasos agénticos (30 ítems dev) | 90% | 90% | igual |
| Código (80 ítems dev) | 23,8% | 22,5% | −1,3 puntos (plantilla de chat distinta, no mide habilidad real) |
| Visión (12 preguntas, 6 imágenes) | 12/12 | 12/12 | igual |
| Tool calls en japonés | 15/15 | 2/15 | −13 (idioma eliminado) |
| Ortografía inglesa (388 palabras) | 0 errores | 1 error (`TextChanged`) | 0,3% |

Rendimiento en tokens por segundo (llama-server, una RTX 5060 Ti de 16 GB, 24 prompts reales, 256 tokens, thinking off, una petición a la vez):

| Configuración | Original | Este archivo |
|---|---|---|
| Sin borrador | 68,1 | 76,3 (+12%) |
| MTP n=4 | 104,1 | 139,8 (+34%) |
| MTP n=6 | 96,4 | 136,4 |
| MTP n=4, prompts tailandeses | — | 112,6 |
| MTP n=4, prompts de código | — | 160,6 |
| MTP n=4 + ngram, global | 103,4 | 145,2 |
| MTP n=4 + ngram, código | 115,0 | 177,4 |

El límite superior del 95% de pérdida sobre los 165 ítems de tool calls, código y pasos agénticos (excluidos los 15 de japonés) es de 3,07 puntos: el estudio no puede demostrar una pérdida menor que esa cifra. En visión, con solo 12 preguntas, no se descarta una pérdida de hasta 18,4 puntos.

## Requisitos de hardware

- VRAM para inferencia: el archivo Q4_K_M ocupa 4.705 MB; con overhead de contexto y caché KV conviene reservar 6-8 GB. El proyector de visión `mmproj-F32.gguf` añade VRAM adicional (tamaño no especificado en la información disponible).
- GPU recomendadas: RTX 5060 Ti 16 GB es la configuración medida por el autor; cualquier GPU con 8 GB o más debería alojar el modelo sin visión. Para visión y contextos largos, 12-16 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y RTX 5060 Ti 16 GB.
- Despliegue: llama.cpp mediante `llama-server`; el repositorio está etiquetado como `endpoints_compatible`. No se documenta soporte para vLLM, TGI ni Ollama en la información disponible.
- Comando de referencia: `llama-server -m DeepSeek-V4-Pro-Qwen3.5-9B-MTP-Mew-Surgeon-th-en-Q4_K_M.gguf --spec-type draft-mtp --spec-draft-n-max 4 -ngl 99`. Para código, añadir `--spec-type draft-mtp,ngram-mod`. Para visión, añadir `--mmproj mmproj-F32.gguf`.
- Throughput medido: 76,3 t/s sin borrador y 139,8 t/s con MTP n=4 en una RTX 5060 Ti 16 GB, con una sola petición concurrente. No se han publicado datos de latencia ni de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Mew-Surgeon Q4_K_M) | 7,98 B | no disponible | th, en | Apache 2.0 | GGUF | Vocabulario recortado, MTP, 4.705 MB |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF (original) | 7,98 B | no disponible | multilingüe | Apache 2.0 | GGUF | 5.512 MB, 68,1 t/s sin borrador |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (safetensors) | 7,98 B | no disponible | multilingüe | Apache 2.0 | safetensors | Modelo base de la destilación |
| Qwen3.5-9B (base) | 9 B (aproximado) | no disponible | multilingüe | no disponible en la información | no disponible | Base original de Qwen |

No se dispone de datos de benchmarks de MMLU, HumanEval o GSM8K para ninguno de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- El recorte de vocabulario elimina japonés, chino, coreano y cualquier otra escritura: esos textos se codifican como bytes crudos y la salida es lenta y en su mayoría corrupta. En tool calls en japonés, el modelo pasa de 15/15 a 2/15.
- La pérdida de calidad sobre los 165 ítems evaluados (tool calls, código, pasos agénticos) no puede acotarse por debajo de 3,07 puntos con un 95% de confianza; el estudio no demuestra equivalencia estricta.
- En visión, la muestra de 12 preguntas no descarta una pérdida de hasta 18,4 puntos.
- El 0,3% de error ortográfico residual en palabras inglesas (`TextChanged`) es un artefacto conocido del recorte.
- El resultado de código (22,5% frente a 23,8%) se obtuvo con una plantilla de chat distinta a la del archivo, por lo que no refleja la habilidad real del modelo, solo la comparación relativa.
- Las comprobaciones de borradores en un solo lote pueden redondear de forma ligeramente distinta, de modo que una respuesta puede diferir en una palabra respecto a la generación sin decodificación especulativa.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el comportamiento estándar de un modelo destilado de 8 B.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero las habilidades del modelo son obra de los autores originales (Jackrong, Qwen, DeepSeek); este repositorio solo eliminó vocabulario.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zazeen123/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-Mew-Surgeon-GGUF
- Modelo base (safetensors): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- GGUF original con MTP y proyector de visión: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Perfil del autor original: https://huggingface.co/Jackrong
- Qwen (modelo base Qwen3.5-9B): https://huggingface.co/Qwen
- DeepSeek (origen de la destilación): https://huggingface.co/deepseek-ai
