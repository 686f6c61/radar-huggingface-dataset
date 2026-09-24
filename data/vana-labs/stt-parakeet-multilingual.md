# Vana-Labs/stt-parakeet-multilingual

## Resumen

Vana-Labs/stt-parakeet-multilingual es un modelo de reconocimiento automatico del habla (ASR) multilingue distribuido como espejo (mirror) fijo dentro del ecosistema de Tetro, la herramienta de transcripcion de reuniones locales de Vana Labs. No es un modelo entrenado por Vana Labs: se trata de una copia sin modificaciones de los ficheros ONNX en int8 publicados por istupakov en istupakov/parakeet-tdt-0.6b-v3-onnx (commit 8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce), que a su vez es una exportacion ONNX del modelo original de NVIDIA nvidia/parakeet-tdt-0.6b-v3. El proposito del repositorio es evitar que las descargas de Tetro dependan de hosts de terceros.

El modelo subyacente es un ASR multilingue de 600 millones de parametros basado en la arquitectura NeMo Conformer TDT (Token-and-Duration Transducer), disenado para transcripcion de alto rendimiento. Extiende la version anterior (parakeet-tdt-0.6b-v2), que solo cubria ingles, ampliando el soporte a 25 idiomas europeos y anadiendo deteccion automatica del idioma. Esta pensado para ejecutarse completamente en local, sin envio de audio a servicios externos.

Su relevancia actual radica en que ofrece una alternativa compacta y cuantizada (int8, ~0,7 GB de repositorio) que puede correr en CPU o GPU de consumo manteniendo soporte multiidioma amplio, algo poco habitual en modelos ASR de este tamano. La licencia CC-BY-4.0, identica a la del modelo base, permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (Token-and-Duration Transducer) |
| Parametros totales | 600 millones (~0,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; procesa audio, no secuencias de texto) |
| Tipos de cuantizacion | int8 (ficheros ONNX pre-cuantizados) |
| Idiomas soportados | 25: en, de, es, fr, it, pt, nl, pl, uk, ru, sv, da, fi, cs, sk, sl, hr, bg, ro, hu, el, et, lv, lt, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder int8, decoder_joint int8) |

Ficheros incluidos en el repositorio:

| Fichero | Proposito |
|---|---|
| `encoder-model.int8.onnx` | Encoder, cuantizado a int8 |
| `decoder_joint-model.int8.onnx` | Decoder y red joint, cuantizados a int8 |
| `nemo128.onnx` | Preprocesador log-mel de 128 bandas |
| `vocab.txt` | Tokens, uno por linea |
| `config.json` | Configuracion onnx-asr (`nemo-conformer-tdt`) |

## Arquitectura y entrenamiento

La arquitectura es un Conformer TDT (Token-and-Duration Transducer) de NVIDIA, integrado en el framework NeMo. El esquema TDT combina un encoder Conformer (convoluciones + atencion) con un decoder y una red joint que predicen simultaneamente el token y su duracion, lo que reduce el numero de pasos de decodificacion respecto a esquemas transducer clasicos y mejora el throughput. El repositorio distribuido por Vana Labs no contiene los pesos originales en precision completa, sino la version ya exportada y cuantizada a int8 por istupakov, junto con el preprocesador log-mel de 128 bandas (`nemo128.onnx`).

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste como RLHF (no aplicables a un modelo ASR) o refinamiento supervisado especifico. La model card original de NVIDIA indica que v3 amplia el soporte de idiomas de ingles (v2) a 25 lenguas europeas y que el modelo realiza deteccion automatica del idioma. La exportacion ONNX permite ejecutar el modelo con la libreria `onnx-asr` sin dependencia de PyTorch en tiempo de inferencia.

## Capacidades

- Transcripcion automatica del habla (speech-to-text) en 25 idiomas europeos.
- Deteccion automatica del idioma de entrada (segun la descripcion del modelo base v3).
- Procesamiento de audio a 16 kHz mono, segun el ejemplo de uso de la model card.
- Inferencia completamente local, sin conexion a servicios externos.
- Ejecucion sobre ficheros ONNX cuantizados a int8, apta para despliegue en CPU.
- Compatibilidad con la API de `onnx-asr` mediante la funcion `load_model("nemo-conformer-tdt", ...)`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generation ni modo de razonamiento (no aplican a un modelo ASR).

## Casos de uso

- Transcripcion de reuniones en local: es el caso de uso objetivo declarado del repositorio, ya que alimenta a Tetro, el transcriptor de reuniones que se ejecuta integramente en el equipo del usuario sin enviar audio a la nube.
- Servidor STT compatible con la API de OpenAI Whisper: segun el proyecto comunitario ai-parkeet-stt, el modelo puede exponerse mediante una API compatible con Whisper, funcionando como sustituto directo en aplicaciones como Superwhisper o n8n.
- Subtitulado multilingue: dado su soporte de 25 idiomas y deteccion automatica de lengua, sirve para generar subtitulos en contenido audiovisual sin preprocesar el idioma de origen.
- Atencion al cliente y transcripcion de llamadas: la inferencia local y la cuantizacion int8 permiten desplegarlo en servidores modestos para transcribir conversaciones de centros de contacto, con la ventaja de no exponer datos de clientes a terceros.
- Indexacion y busqueda de contenido hablado: transcripcion de podcasts, clases o entrevistas para alimentar motores de busqueda o sistemas RAG sobre texto.
- Asistentes de voz y dictado: integracion como capa STT en aplicaciones de escritorio o moviles que requieran reconocimiento en varios idiomas europeos.
- Pipelines de anotacion y post-procesado: combinado con herramientas de alineacion forzada (por ejemplo las mencionadas en CrispASR), puede alimentar flujos de etiquetado o sincronizacion de subtitulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio Vana-Labs/stt-parakeet-multilingual y los resultados de busqueda consultados no incluyen cifras de WER, MMLU, HumanEval ni metricas comparativas para esta version exportada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 600 millones de parametros cuantizado a int8, el repositorio completo ocupa aproximadamente 0,7 GB; el uso de memoria en ejecucion es del orden de 1 a 2 GB, aunque este dato no se especifica en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Dado su tamano, cabe en GPUs de consumo como las de la gama RTX 4090, asi como en GPUs de datacenter tipo A100 o H100, aunque no se documentan requisitos oficiales.
- Ejecucion en CPU: la cuantizacion int8 y el formato ONNX estan pensados para permitir inferencia en CPU; segun el articulo de d-central.tech, Parakeet TDT 0.6B v3 se ejecuta por defecto mediante CPU ONNX en pilas locales.
- Opciones de despliegue: `onnx-asr` (con soporte de cuantizacion int8), servidores compatibles con la API de Whisper (por ejemplo ai-parkeet-stt) y runtimes comunitarios en C++/ggml como CrispASR.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion consultada menciona alternativas del mismo espacio (ASR local multilingue), pero no aporta cifras comparativas de rendimiento, por lo que la comparacion se limita a caracteristicas conocidas.

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vana-Labs/stt-parakeet-multilingual | 600M | 25 europeos | CC-BY-4.0 | ONNX int8 | Espejo de nvidia/parakeet-tdt-0.6b-v3 via istupakov |
| nvidia/parakeet-tdt-0.6b-v3 | 600M | 25 europeos | CC-BY-4.0 | original NVIDIA | Modelo base |
| faster-whisper (familia Whisper) | variable | multilingue amplio | MIT | CTranslate2 | Fallback multilingue offline citado en pilas locales |
| Cohere Transcribe | no disponible | no disponible | no disponible | no disponible | Motor local por lotes citado como opcion |
| Canary 1B v2 | 1B (segun nombre) | no disponible | no disponible | no disponible | Alternativa multilingue mencionada en CrispASR |

No se dispone de datos de rendimiento (WER u otras metricas) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo entrenado ni modificado por Vana Labs: es un espejo de ficheros de terceros, por lo que incidencias o actualizaciones dependen del trabajo de istupakov y de NVIDIA.
- La cuantizacion int8 puede introducir una perdida de precision en la transcripcion respecto a los pesos originales; no se documenta el impacto exacto en WER.
- Requiere audio de entrada a 16 kHz mono segun el ejemplo de la model card; otras frecuencias o canales requeriran remuestreo previo.
- El soporte se limita a 25 idiomas europeos; quedan fuera idiomas como el coreano, japones o chino, cubiertos por otras alternativas.
- Riesgo de alucinacion o errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan sesgos especificos.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion a NVIDIA (modelo) e istupakov (exportacion ONNX).
- El repositorio no incluye pruebas de rendimiento ni resultados de benchmarks publicados, lo que dificulta validar la calidad de la version cuantizada frente al modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la informacion, lo que indica baja adopcion publica aun.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vana-Labs/stt-parakeet-multilingual
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportacion ONNX de origen: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Servidor STT compatible con Whisper: https://github.com/opteemister/ai-parkeet-stt
- Runtime C++/ggml para ASR multilingue: https://github.com/CrispStrobe/CrispASR
- Base de datos de modelos de voz locales: https://d-central.tech/local-voice-ai-models/
- MacParakeet (soporte multilingue local): https://macparakeet.com/multilingual/
