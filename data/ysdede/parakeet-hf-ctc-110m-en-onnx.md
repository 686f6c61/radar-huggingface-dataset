# ysdede/parakeet-hf-ctc-110m-en-onnx

## Resumen

`ysdede/parakeet-hf-ctc-110m-en-onnx` es una conversión al formato ONNX del modelo de reconocimiento automático del habla (ASR) `ctaguchi/parakeet-hf-ctc-110m-en`, un transformer CTC de aproximadamente 110 millones de parámetros especializado en inglés. El autor del repositorio, `ysdede`, no entrena ni modifica los pesos: únicamente exporta el grafo a ONNX para su uso en ASRJS, una herramienta de inferencia en JavaScript. La identidad del modelo y los pesos se mantienen sin cambios respecto al original, según indica la propia model card.

El interés de esta ficha es doble. Por un lado, documenta una variante ONNX de un modelo ASR ligero, pensada para ejecución en entornos sin Python (navegador, Node.js, aplicaciones de escritorio empaquetadas). Por otro, sirve como ejemplo de la cadena de derivaciones que se está consolidando en Hugging Face: modelos base de NVIDIA (familia Parakeet) reconvertidos a arquitecturas Hugging Face por terceros y, después, exportados a ONNX por otros autores.

La información pública disponible es muy limitada: la model card original es prácticamente un stub y el repositorio derivado solo añade una nota de atribución y una referencia a un `export-receipt.json`. Por tanto, muchos de los datos técnicos de esta ficha se marcan como «no disponible» o se infieren de la nomenclatura del modelo (110M, CTC, EN), sin que exista confirmación explícita en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer CTC para ASR (inferido de la nomenclatura; no confirmado en la model card) |
| Parametros totales | ~110 M (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye el grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (según el sufijo `-en` del nombre; no confirmado en la model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (grafo exportado; el modelo fuente usa safetensors, no confirmado) |

## Arquitectura y entrenamiento

La model card del repositorio derivado no describe la arquitectura ni el proceso de entrenamiento. Por la nomenclatura (`parakeet`, `ctc`, `110m`, `en`) cabe inferir que se trata de un modelo de la familia Parakeet de NVIDIA, con un cabezal CTC (Connectionist Temporal Classification) sobre un encoder transformer, orientado a transcripción de voz en inglés y con un tamaño de aproximadamente 110 millones de parámetros. Esta inferencia no está confirmada por la documentación disponible.

El autor del repositorio derivado declara explícitamente que no ha modificado los pesos ni el modelo: solo ha realizado una conversión del grafo a ONNX para ASRJS, y remite a un fichero `export-receipt.json` para los detalles de la exportación. No se documentan datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO), ni innovaciones técnicas como decodificación especulativa o atención lineal. Toda esa información debería consultarse en el modelo fuente `ctaguchi/parakeet-hf-ctc-110m-en` o, en última instancia, en la documentación original de NVIDIA Parakeet.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés: transcripción de audio a texto con un cabezal CTC.
- Ejecución en entornos JavaScript/TypeScript mediante ONNX Runtime (ASRJS), sin dependencia de Python.
- Inferencia potencialmente en navegador o en Node.js, gracias al formato ONNX.
- No se documentan capacidades de traducción, diarización, timestamps a nivel de palabra, tool calling, agentes, visión ni audio generation.
- No se documenta soporte multilingüe más allá del sufijo `-en` del nombre del modelo.

## Casos de uso

- Transcripción en aplicaciones web sin backend Python: al estar exportado a ONNX, el modelo puede cargarse con ONNX Runtime Web y ejecutarse en el navegador del usuario, lo que elimina la necesidad de enviar audio a un servidor y reduce la latencia percibida en dictado o subtitulado en vivo.
- Subtitulado de vídeos en inglés en herramientas de escritorio empaquetadas con Electron o Tauri: el grafo ONNX se integra en el binario de la aplicación y permite generar subtítulos sin depender de servicios cloud.
- Prototipado rápido de pipelines ASR en Node.js: útil para equipos que ya trabajan en el ecosistema JavaScript y quieren validar una idea de producto de voz sin montar infraestructura Python.
- Preprocesado de audio en asistentes de voz locales: transcripción de comandos cortos en inglés en dispositivos con recursos limitados, dado el tamaño reducido del modelo (~110 M de parámetros).
- Evaluación comparativa de backends ONNX frente a PyTorch: sirve como banco de pruebas para medir diferencias de precisión y latencia entre la implementación original y la exportada.
- Integración en extensiones de navegador para accesibilidad: transcripción de audio de pestañas o micrófono en tiempo real para personas con dificultades auditivas, siempre que el rendimiento en el navegador sea aceptable (no verificado en la documentación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio derivado no incluye métricas de WER, latencia ni comparaciones con el modelo fuente, y advierte explícitamente de que la publicación por sí sola no constituye una garantía de paridad de comportamiento en navegador.

## Requisitos de hardware

- VRAM estimada: no disponible. Con ~110 M de parámetros, una estimación orientativa en FP32 sería de ~0,44 GB de pesos, y en FP16 ~0,22 GB, pero estas cifras no están confirmadas por la documentación.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder ejecutarlo con holgura, pero no hay datos publicados.
- ¿Cabe en GPU consumer? Muy probablemente sí, dado el tamaño reducido, pero no está verificado en la documentación.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web) es la vía natural; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no están orientados a ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| ysdede/parakeet-hf-ctc-110m-en-onnx | ~110 M (según nombre) | no disponible | inglés (según nombre) | CC-BY-4.0 | ONNX |
| ctaguchi/parakeet-hf-ctc-110m-en (modelo fuente) | ~110 M (según nombre) | no disponible | inglés (según nombre) | no disponible en la información proporcionada | safetensors (no confirmado) |
| Whisper small (OpenAI) | ~244 M | 30 s de audio | multilingüe | MIT | PyTorch, ONNX, GGML |
| Whisper tiny (OpenAI) | ~39 M | 30 s de audio | multilingüe | MIT | PyTorch, ONNX, GGML |

La comparación con Whisper es solo orientativa por categoría (ASR ligero); no se dispone de métricas de WER que permitan comparar rendimiento real entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card del repositorio derivado es mínima y no documenta sesgos, dominio de entrenamiento ni condiciones de uso recomendadas.
- El autor advierte de que la publicación del grafo ONNX no garantiza paridad de comportamiento con el modelo original en navegador; habría que validarlo empíricamente.
- El modelo está etiquetado como inglés (`-en`), por lo que no cabe esperar un buen rendimiento en castellano u otros idiomas sin verificación adicional.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos no representados en el corpus de entrenamiento o dominios especializados (médico, legal, técnico), no cuantificado en la documentación.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar la licencia del modelo fuente y de los pesos originales de NVIDIA Parakeet, que no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan limitaciones de longitud de audio ni de contexto; los modelos CTC suelen procesar ventanas de audio relativamente cortas, pero no hay confirmación para este caso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ysdede/parakeet-hf-ctc-110m-en-onnx
- Modelo fuente: https://huggingface.co/ctaguchi/parakeet-hf-ctc-110m-en/tree/a755f5a4398ebe44292169d4fceea34e3c02b759
- Fichero de recibo de exportación: `export-receipt.json` (referenciado en la model card; no se proporciona URL directa)
