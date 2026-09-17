# voidwaveDev/fastconformer-quran

## Resumen

voidwaveDev/fastconformer-quran es una exportación ONNX cuantizada a int8 de un modelo de reconocimiento automático del habla (ASR) especializado en recitación coránica en árabe. Lo publica el usuario voidwaveDev como espejo del export original mohammed/fastconformer-quran-ar-onnx-int8, empaquetado para el motor de recitación en dispositivo de la aplicación web Voidwave Quran, que se ejecuta íntegramente en el navegador mediante onnxruntime-web.

El modelo base es un FastConformer de NVIDIA NeMo, afinado sobre recitaciones coránicas y entrenado con el conjunto tarteel-ai/everyayah. La exportación es totalmente causal, con estados `[128, 0]` y sin cachés de entrada o salida, de modo que un bucle sin estado decodifica un token por cada trama del codificador en modo greedy. El vocabulario consta de 1024 tokens BPE con diacríticos más un token `<blk>` (1025 entradas en total).

Su relevancia práctica está en el tamaño y el coste de despliegue: el codificador int8 ocupa unos 126 MB y el decodificador-joint unos 5 MB, cifras que permiten ejecutar ASR en árabe coránico en el navegador sin GPU ni backend, algo poco habitual en modelos de reconocimiento de habla. La licencia CC-BY-4.0 facilita la reutilización comercial siempre que se mantenga la atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador Conformer con subsampling) + decodificador-joint tipo transductor (RNN-T), exportado en dos grafos ONNX |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de texto; el modelo es streaming frame a frame. Exportacion causal con estados `[128, 0]` (sin caches de entrada ni de salida) |
| Tipos de cuantizacion | int8 (grafos `encoder.int8.onnx` y `decoder.int8.onnx`) |
| Idiomas soportados | arabe (`ar`), en registro de arabe coranico |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8), acompanado de `tokens.txt` y `meta.json` |
| Tamano del repositorio | 0,1 GB |
| Tamano de los ficheros | `encoder.int8.onnx` ~126 MB; `decoder.int8.onnx` ~5 MB; `tokens.txt` ~13 KB; `meta.json` <1 KB |
| Vocabulario | 1025 entradas: 1024 tokens BPE (con diacriticos) + `<blk>` en el id 1024 |
| Entrada de audio | `audio_signal [1, 80, T]` + `length [1]`; log-mel estilo NeMo de 80 filtros, ventana de 25 ms, hop de 10 ms, `n_fft` 512, mel slaney, `log(x + 2^-24)` y normalizacion por caracteristica |
| Salida del codificador | `[1, 512, T/8]` + `encoded_lengths` (subsampling de factor 8) |
| Runtime documentado | onnxruntime-web >= 1.30 (kernels wasm) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es FastConformer, la variante optimizada de Conformer que emplea NVIDIA NeMo en sus sistemas de ASR: bloques de atencion y convolucion con subsampling de la señal de entrada. En esta exportacion se separa en dos grafos ONNX ejecutables de forma independiente. El codificador recibe la señal acustica `[1, 80, T]` y devuelve representaciones de dimension 512 con una reduccion temporal de factor 8 (`[1, 512, T/8]`), mientras que el decodificador-joint fusiona las salidas del codificador (`encoder_outputs [1, 512, 1]`), los objetivos (`targets [1, 1]`) y los estados internos del predictor (`input_states_1/2 [1, 1, 640]`) para producir logits conjuntos de forma `[1, 1, 1, 1025]` junto con los estados actualizados.

El modelo base fue afinado sobre recitaciones coranicas usando el conjunto `tarteel-ai/everyayah`, segun indica la model card, y la exportacion se describe como "estilo Qatar Computing (QCRI)". No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineamiento por preferencias (RLHF/DPO). La innovacion tecnica destacable de este artefacto es la eliminacion total de caches: al ser un export causal con estados `[128, 0]`, el decodificador se re-ceba una sola vez y se decodifica de forma greedy un token por trama del codificador, lo que simplifica mucho la implementacion en entornos sin estado como un navegador. El fichero `joiner.int8.onnx` del export original se omite porque es una copia byte a byte de `decoder.int8.onnx`.

## Capacidades

- Reconocimiento automatico del habla (ASR) en arabe coranico, con salida de tokens BPE que incluyen diacriticos.
- Decodificacion en streaming: el codificador procesa tramas de audio de forma causal y el bucle de decodificacion emite un token por trama del codificador.
- Ejecucion en navegador mediante onnxruntime-web (kernels wasm), sin servidor ni GPU.
- Exportacion sin estado (stateless): no requiere gestionar caches entre llamadas, solo re-cebar el estado del predictor.
- Capacidad monolingue: unicamente arabe (`ar`), orientada al registro de recitacion coranica.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio mas alla del propio ASR, ni modo de razonamiento explicito (thinking mode).
- No se documenta capacitacion para texto escrito, traduccion ni generacion de lenguaje: es un modelo exclusivamente acustico-lexico de transcripcion.

## Casos de uso

- Verificacion de recitacion en aplicaciones de memorizacion (hifz): el modelo transcribe en streaming lo que recita el usuario y permite comparar token a token con el texto esperado, ofreciendo realimentacion por trama sin necesidad de enviar audio a un servidor.
- Transcripcion con diacriticos para archivos y corpus: al emitir tokens BPE que conservan la vocalizacion, resulta adecuado para construir corpus de recitacion anotados o para indexar grabaciones historicas.
- Aplicaciones web y PWA sin backend: con un peso total de unos 131 MB en int8, puede descargarse como recurso estatico y ejecutarse con onnxruntime-web >= 1.30, lo que reduce costes de infraestructura y evita transmitir audio de los usuarios.
- Subtitulado en directo de retransmisiones de recitacion: el caracter causal del codificador permite alimentar audio por tramas y emitir texto de forma incremental durante un directo.
- Evaluacion automatica en plataformas de aprendizaje (madrasas, cursos en linea): integrado en un ejercicio, el modelo genera la transcripcion y un componente posterior calcula aciertos, omisiones o sustituciones sobre el texto de referencia.
- Herramientas de estudio con alineamiento texto-audio: la salida por tramas facilita sincronizar cada fragmento reconocido con la posicion temporal del audio para resaltar versiculos mientras se escuchan.
- Despliegue en dispositivos de bajos recursos: al ser un grafo ONNX estandar de ~131 MB, es tecnicamente portable a otros runtimes ONNX en CPU o edge, aunque el autor solo documenta el uso en navegador.
- Distribucion de bajo ancho de banda: el modelo puede cachearse en el cliente una sola vez y funcionar despues sin conexion, util en contextos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, CER ni comparaciones cuantitativas con otros sistemas de ASR coranico, y la busqueda web no aporto datos adicionales sobre el modelo.

## Requisitos de hardware

- VRAM: no se publican cifras. El modelo no esta pensado para GPU; los pesos int8 suman aproximadamente 131 MB (126 MB de codificador + 5 MB de decodificador).
- GPU recomendadas: no aplica. El runtime documentado es onnxruntime-web con execution provider `wasm`, es decir, ejecucion en CPU dentro del navegador. No se documenta soporte de CUDA, WebGPU ni TensorRT.
- Cabe en GPU de consumo: irrelevante para el caso de uso documentado; al no requerir GPU, cabe en cualquier equipo capaz de ejecutar un navegador con WebAssembly.
- Memoria de trabajo: no disponible en la informacion proporcionada; el repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: onnxruntime-web >= 1.30 (obligatorio, ya que versiones anteriores carecen del kernel cuantizado `ConvInteger`); otros runtimes ONNX no estan documentados por el autor.
- Requisitos de preprocesado: extraccion de caracteristicas log-mel compatible con NeMo (80 filtros, 25 ms de ventana, 10 ms de hop, `n_fft` 512, mel slaney, `log(x + 2^-24)`) y normalizacion por caracteristica obligatoria; sin ella el decodificador devuelve un resultado vacio.
- Latencia y throughput estimados: no disponible. La model card solo indica que la decodificacion es greedy y avanza un token por trama del codificador.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| voidwaveDev/fastconformer-quran | ONNX (encoder + decoder-joint) | int8 | Repo 0,1 GB (encoder ~126 MB, decoder ~5 MB) | CC-BY-4.0 | Espejo empaquetado para Voidwave Quran; omite `joiner.int8.onnx` por ser duplicado byte a byte del decodificador |
| mohammed/fastconformer-quran-ar-onnx-int8 | ONNX | int8 | no disponible | CC-BY-4.0 (segun la model card) | Export ONNX original del que procede este repositorio |
| mohammed/fastconformer-quran-ar | Pesos NeMo (formato no especificado en la informacion disponible) | no disponible (presumiblemente sin cuantizar) | no disponible | no disponible | Modelo base FastConformer afinado sobre `tarteel-ai/everyayah` |

No se dispone de datos de rendimiento ni de especificaciones de otros modelos de ASR coranico comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ambito restringido: el modelo esta especializado en arabe coranico; no hay evidencia de que funcione correctamente en arabe estandar hablado, dialectos ni en otros idiomas.
- Ausencia de benchmarks: no se publican cifras de WER o CER, por lo que el rendimiento real en produccion no puede validarse a partir de la informacion disponible.
- Metadatos incorrectos en origen: `meta.json` declara `normalize_type: ""`, pero la normalizacion por caracteristica es obligatoria; sin ella el decodificador produce una salida vacia. Es un error conocido del metadata heredado del modelo base.
- Dependencia de version: requiere onnxruntime-web >= 1.30; runtimes anteriores no incluyen el kernel cuantizado `ConvInteger` y no podran cargar los grafos.
- Riesgo de alucinacion y errores de transcripcion: como cualquier sistema de ASR, puede insertar, omitir o sustituir tokens, especialmente con audio fuera de dominio, ruido de fondo, recitadores con estilos poco representados o multiples voces.
- Precisión de diacriticos no garantizada: aunque el vocabulario BPE incluye diacriticos, no se documenta la exactitud con la que se recuperan.
- Sin soporte de tool calling, agentes ni generacion de texto: no es adecuado como componente de un pipeline agentico ni como modelo de lenguaje.
- Licencia: CC-BY-4.0 permite uso comercial, pero exige mantener la atribucion al modelo base y al export original al redistribuir.
- Trazabilidad limitada: no se detallan en la model card el volumen de datos de entrenamiento, la composicion del dataset ni el proceso de ajuste, lo que dificulta evaluar sesgos y cobertura.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Alcance del soporte: el autor documenta unicamente el uso en navegador; cualquier otro destino de despliegue queda fuera de lo probado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/voidwaveDev/fastconformer-quran
- Modelo base: https://huggingface.co/mohammed/fastconformer-quran-ar
- Export ONNX int8 original: https://huggingface.co/mohammed/fastconformer-quran-ar-onnx-int8
- Aplicacion web Voidwave Quran: https://voidwave.com/Quran
- Dataset de referencia citado en la model card: `tarteel-ai/everyayah` (no se proporciona URL directa en la informacion disponible)
- Framework base: NVIDIA NeMo (no se proporciona URL directa en la informacion disponible)
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos correspondian a paginas de soporte de Microsoft y no guardan relacion con el artefacto.
