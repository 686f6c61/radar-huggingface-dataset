# SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-DPO-v2

## Resumen

SZL-Nemotron-Mini-4B-Estate-DPO-v2 es un ajuste fino por DPO (Direct Preference Optimization) sobre el modelo base SZL-Nemotron-Mini-4B-Estate-DPO-v1, publicado por la organizacion SZLHOLDINGS en Hugging Face. Se trata de un modelo de generacion de texto de aproximadamente 4.190 millones de parametros (4,19 B) alojado en formato safetensors, con un repositorio de 8,4 GB, lo que sugiere pesos en precision de 16 bits. La nomenclatura indica que deriva de la familia Nemotron de NVIDIA, aunque la model card no confirma explicitamente la arquitectura subyacente.

El modelo se presenta como parte de un "estate" de IA gobernada de SZLHOLDINGS, una iniciativa que enfatiza la trazabilidad de fuentes, los recibos de auditoria (receipts) y la honestidad sobre los resultados medidos. La model card es deliberadamente conservadora: declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion no respaldada por un recibo medido se marca como UNKNOWN (desconocido). De hecho, el escaneo estricto de recibos del 22 de noviembre de 2026 clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero no un DONE.json estricto con estado MEASURED.

Su relevancia actual es limitada pero ilustrativa: se trata de un modelo pequeno (4 B) con licencia NVIDIA Open Model License, orientado a ingles, que puede servir como caso de estudio de practicas de publicacion gobernada y de ajuste por preferencias sobre modelos compactos. No obstante, la ausencia de benchmarks medidos, de documentacion sobre datos de entrenamiento y de detalles arquitectonicos hace que su evaluacion objetiva sea practicamente imposible con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Nemotron de NVIDIA; detalles no confirmados en la model card) |
| Parametros totales | 4.190.509.056 (4,19 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo. Por el nombre y el linaje (Nemotron Mini de NVIDIA), cabe esperar un transformer decoder-only, pero esto no se confirma en la documentacion disponible. El dato concreto es que se trata de un ajuste por DPO (Direct Preference Optimization) sobre el modelo v1 de la misma organizacion, lo que implica una fase de alineacion con pares de preferencias tras un posible ajuste supervisado previo. No se especifica el numero de tokens de entrenamiento, la composicion del dataset de preferencias, ni si hubo fases adicionales de RLHF.

La model card hace hincapie en un marco de "gobernanza" y trazabilidad: los resultados se etiquetan como MEASURED (medidos), REPORTED (reportados) o UNKNOWN (desconocidos), y se generan graficos SVG deterministas a partir de una instantanea de auditoria (2026-11-20T03:48:04Z). Sin embargo, el escaneo estricto de recibos del 22 de noviembre de 2026 no encontro un DONE.json valido con estado MEASURED, por lo que la evidencia de evaluacion se clasifica como UNKNOWN. Los ficheros con nombre de recibo presentes (receipts/eval/governed-validation-v2-2026-11-06.json y receipts/eval/remediation-reeval-2026-11-06.json) no han sido validados como evidencia estricta.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado exclusivamente para el idioma ingles.
- Ajuste por preferencias (DPO): se espera una alineacion con preferencias humanas derivada de la fase DPO, aunque no se documentan los criterios ni los datos utilizados.
- Razonamiento y generacion de codigo: no disponible; la model card no afirma capacidades especificas mas alla de la generacion de texto.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible; no se declaran.

## Casos de uso

- Generacion de texto en ingles en entornos controlados: el modelo puede emplearse para tareas de redaccion o continuacion de texto en ingles, siempre que se acepte la ausencia de benchmarks que respalden su calidad.
- Prototipado de pipelines de ajuste por preferencias: dado que es un artefacto DPO derivado de un modelo base de la misma organizacion, sirve como ejemplo para estudiar el flujo v1 a v2 de alineacion en modelos de 4 B.
- Experimentacion academica sobre gobernanza de modelos: su model card documenta un marco de recibos y trazabilidad que puede analizarse como caso de estudio de publicacion responsable, independientemente del rendimiento del modelo.
- Despliegue en hardware de gama media: con 4,19 B de parametros y pesos safetensors de 8,4 GB, es viable en GPUs de consumo con suficiente VRAM (por ejemplo, 16 GB o mas en fp16), lo que permite pruebas locales de generacion de texto.
- Evaluacion comparativa de tecnicas DPO: investigadores pueden usar el par v1/v2 para medir el efecto del ajuste por preferencias en un modelo pequeno, aunque deberan generar sus propios benchmarks dado que el autor no los publica.
- Integracion en pipelines de transformers: al estar publicado con la libreria transformers y formato safetensors, puede cargarse directamente en scripts de Python para tareas de generacion de texto condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los pesos de 4,19 B ocupan aproximadamente 8,4 GB, por lo que se necesitan al menos 10-12 GB de VRAM contando cache KV y overhead. En cuantizacion de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: no disponible segun el autor. Por tamano, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) son sobredimensionadas para fp16; una RTX 4080 (16 GB) o RTX 3090 (24 GB) serian suficientes en fp16.
- Compatibilidad con GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM en fp16; en cuantizacion 4 bits podria caber en GPUs de 8 GB, aunque no se ofrecen pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (libreria declarada). No se confirma soporte para vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF en el repo, llama.cpp requeriria conversion manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Nemotron-Mini-4B-Estate-DPO-v2 | 4,19 B | no disponible | NVIDIA Open Model License | no disponible (UNKNOWN) | Hugging Face, safetensors |
| Nemotron-Mini-4B (NVIDIA, referencia de familia) | ~4 B | no disponible en esta ficha | NVIDIA Open Model License | no disponible en esta ficha | Hugging Face |
| Modelos DPO de ~4 B de la comunidad (p. ej. variantes de Llama-3.2-3B o Qwen2.5-3B) | 3-4 B | 8K-128K segun variante | segun modelo base | variables | Hugging Face, GGUF disponible en muchos casos |

La comparativa es limitada porque la model card no aporta datos de contexto ni benchmarks, y no se dispone de informacion adicional sobre el modelo base Nemotron-Mini-4B en la busqueda realizada. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks medidos: la evidencia de evaluacion esta clasificada como UNKNOWN y no hay DONE.json estricto, por lo que no se puede afirmar nada sobre la calidad del modelo.
- Documentacion incompleta: no se detallan arquitectura, contexto, datos de entrenamiento ni composicion del dataset de preferencias.
- Idioma: soporte declarado unicamente en ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones publicadas no es posible cuantificarlo.
- Sesgos: no documentados; al no conocerse la composicion del dataset de entrenamiento ni del de preferencias, no se pueden evaluar sesgos conocidos.
- Licencia: NVIDIA Open Model License; es necesario revisar sus terminos (incluidas posibles restricciones de uso comercial y obligaciones de atribucion) antes de un despliegue en produccion.
- Madurez: el modelo se publico en noviembre de 2026 y no tiene likes ni un ecosistema de validacion externa; las descargas (355) son bajas, lo que reduce la probabilidad de que existan evaluaciones independientes.
- Uso en produccion: no recomendado sin una evaluacion propia exhaustiva, dado que el propio autor declara que no afirma capacidades sin recibos medidos.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-DPO-v2
- Modelo base (v1): https://huggingface.co/SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-DPO-v1
- Organizacion SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion SZL Holdings en GitHub: https://github.com/szl-holdings
- Repositorio estate-cards (generador de tarjetas): https://github.com/szl-holdings/estate-cards
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
