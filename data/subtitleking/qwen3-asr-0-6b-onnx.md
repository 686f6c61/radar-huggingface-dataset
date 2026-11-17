# subtitleking/qwen3-asr-0.6b-onnx

## Resumen

`subtitleking/qwen3-asr-0.6b-onnx` es una conversion a ONNX del modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. La conversion la firma el usuario subtitleking y esta pensada para inferencia en navegador mediante ONNX Runtime Web sobre WebGPU, en el contexto de la aplicacion SubtitleKing / Wolfcaps. El repositorio no entrena ni modifica el modelo en lo conceptual: solo cambia el formato de los pesos y su precision numerica.

El modelo resuelve transcripcion de voz a texto, con foco en mandarin y cantonés (los dos idiomas declarados en la model card), aunque la descripcion del autor menciona "Mandarin, Cantonese and more". Con 0,6 mil millones de parametros, es un modelo compacto orientado a despliegue ligero, y esta version ONNX pesa 867 MB en el repositorio (0,9 GB de tamano total del repo).

Su relevancia actual radica en que permite ejecutar ASR de calidad razonable directamente en el navegador, sin backend, gracias a los kernels WebGPU de ONNX Runtime Web y a una cuantizacion agresiva en 4 bits del decoder. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (arquitectura del Qwen3-ASR-0.6B original; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 0,6 mil millones (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decoder y embeddings en 4 bits GPTQ (capas 0 y 27 a 8 bits); encoder en fp16 |
| Idiomas soportados | zh (mandarin), yue (cantonés); el autor menciona "and more" sin detallar |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafos con pesos como datos externos `*.onnx_data`); encoder fp16, decoder y embeddings q4 |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo original: no hay datos sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se detalla es la estructura de los grafos ONNX generados por el conversor propio del autor (no por trazado): `audio_encoder_fp16.onnx` con ventanas de atencion de 8 segundos, `embed_tokens_q4.onnx` y `decoder_model_merged_q4.onnx` con cache KV y pesos GPTQ de 4 bits, salvo las capas 0 y 27 que se mantienen a 8 bits para preservar precision.

La innovacion tecnica principal es la conversion a ONNX Runtime Web con soporte WebGPU: todos los operadores tienen kernel en WebGPU, y los nodos `MatMulNBits` de 4 y 8 bits usan `accuracy_level` 4. Las entradas siguen el esquema de caracteristicas log-mel estilo Whisper, con ids de tokens de prompt y decodificacion greedy. El `preprocessor_config.json` fija `sampling_rate` a 16000. El `config.json` conserva el `model_type` original porque Transformers.js aun no tiene clase para el.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) en mandarin y cantonés, con soporte adicional no detallado por el autor.
- Inferencia en navegador mediante ONNX Runtime Web sobre WebGPU, sin servidor.
- Decodificacion greedy con cache KV para generacion secuencial de tokens.
- Procesamiento por ventanas de audio de 8 segundos en el encoder.
- Alineacion temporal: la model card menciona "the aligner's input and time decoding", lo que sugiere capacidad de marcar tiempos por palabra o segmento.
- Entrada de caracteristicas log-mel estilo Whisper a 16 kHz.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Subtitulado en navegador: el modelo puede transcribir audio directamente en el cliente via WebGPU, lo que permite generar subtitulos sin enviar el audio a un servidor, util para privacidad y para reducir costes de infraestructura.
- Herramientas de accesibilidad web: integracion en reproductores o aplicaciones web para generar subtitulos en mandarin y cantonés en tiempo casi real, aprovechando que el encoder procesa ventanas de 8 segundos.
- Transcripcion de reuniones y notas de voz en aplicaciones web: el modelo cabe en 867 MB y puede cargarse en el navegador, lo que facilita funciones de dictado o actas sin backend.
- Procesamiento por lotes de contenido en chino: transcripcion de archivos de audio para indexacion o busqueda en plataformas de video, con la ventaja de la licencia Apache-2.0 para uso comercial.
- Generacion de subtitulos con marcas de tiempo: la capacidad de alineacion mencionada en la model card permite producir subtitulos sincronizados, no solo texto plano.
- Prototipado rapido de pipelines ASR: al ser ONNX, se puede integrar en entornos JavaScript/TypeScript con ONNX Runtime Web, lo que simplifica demos y pruebas de concepto sin montar infraestructura de GPU en servidor.

## Benchmarks y rendimiento

El autor publica tasas de error (MER, match error rate) en sus propios conjuntos de prueba, comparando la version ONNX en Chromium/WebGPU con el modelo original en PyTorch:

| Conjunto de prueba | ONNX en WebGPU (%) | PyTorch original (%) |
|---|---|---|
| FLEURS Mandarin | 2,15 | 2,22 |
| SpeechIO | 4,50 | 4,55 |
| FLEURS Cantonese | 6,15 | 5,95 |
| Common Voice Cantonese | 8,03 | 7,96 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- El repositorio ocupa 867 MB, por lo que la descarga e inicializacion en navegador requieren una conexion razonable y memoria suficiente para cargar los pesos.
- Al ejecutarse en navegador con WebGPU, el requisito principal es un navegador compatible (Chromium con WebGPU habilitado) y una GPU con soporte WebGPU; no se especifican modelos concretos de GPU en la informacion disponible.
- El encoder en fp16 y el decoder en 4 bits reducen la huella de memoria frente al modelo original, lo que facilita su ejecucion en equipos de consumo, aunque no se detalla VRAM minima.
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU en navegador; tambien podria usarse ONNX Runtime en otros entornos, aunque la model card solo documenta el caso web.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| subtitleking/qwen3-asr-0.6b-onnx | 0,6 B | zh, yue | ONNX (WebGPU) | apache-2.0 | Conversion para navegador, cuantizacion 4/8 bits |
| Qwen/Qwen3-ASR-0.6B | 0,6 B | zh, yue (y mas) | PyTorch (safetensors, presumiblemente) | apache-2.0 | Modelo original en PyTorch |
| Whisper small (referencia) | 0,244 B | multilingue | multiples | MIT | No disponible en la informacion proporcionada para comparacion directa |
| Whisper medium (referencia) | 0,769 B | multilingue | multiples | MIT | No disponible en la informacion proporcionada para comparacion directa |

La comparacion con alternativas concretas no esta disponible en la informacion proporcionada mas alla del modelo base; los datos de Whisper se incluyen solo como referencia de categoria y no deben tomarse como medicion directa.

## Limitaciones y advertencias

- Idiomas limitados: solo se declaran zh y yue; el "and more" del autor no esta especificado, por lo que no se debe asumir cobertura multilingue amplia.
- El modelo es una conversion de formato y precision; los posibles sesgos del modelo original (Qwen3-ASR-0.6B) se heredan sin cambios.
- Riesgo de alucinacion y errores en audio con ruido, acentos no estandar o vocabulario tecnico, especialmente en cantonés, donde el MER en Common Voice es del 8,03 %.
- La cuantizacion a 4 bits del decoder puede degradar ligeramente la precision frente al original; las capas 0 y 27 se mantienen a 8 bits precisamente para mitigarlo.
- Dependencia de WebGPU y de un navegador compatible; no funcionara en entornos sin soporte WebGPU.
- `config.json` conserva el `model_type` original porque Transformers.js no tiene clase para el, lo que puede requerir manejo manual en algunas integraciones.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar al equipo Qwen (Alibaba) como autor del modelo original.
- No hay datos publicados sobre latencia, throughput ni consumo de memoria en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subtitleking/qwen3-asr-0.6b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Equipo Qwen (Alibaba): https://huggingface.co/Qwen
- Repositorio SubtitleKing (conversor en `tools/convert-qwen/`): no disponible como URL en la informacion proporcionada
