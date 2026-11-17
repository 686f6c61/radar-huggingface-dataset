# subtitleking/qwen3-forced-aligner-0.6b-onnx

## Resumen

`subtitleking/qwen3-forced-aligner-0.6b-onnx` es una conversion a ONNX del modelo `Qwen/Qwen3-ForcedAligner-0.6B` del equipo Qwen (Alibaba), orientada a la alineacion forzada de transcripciones de audio con marcas de tiempo a nivel de palabra y caracter. No es un modelo de reconocimiento de voz general: parte de una transcripcion ya conocida y estima en que instante del audio se pronuncia cada unidad textual. La conversion la firma el usuario `subtitleking`, autor del proyecto SubtitleKing / Wolfcaps, y su proposito declarado es ejecutar el modelo en el navegador mediante ONNX Runtime Web sobre WebGPU.

El repositorio pesa aproximadamente 1,0 GB y contiene tres grafos: un codificador de audio en fp16 con ventanas de atencion de 8 segundos, y dos grafos con pesos cuantizados a 4 bits (`embed_tokens_q4.onnx` y `decoder_model_q4.onnx`). El decodificador emite en una sola pasada logits sobre 5000 bins temporales de 80 ms cada uno, lo que cubre unos 400 segundos de audio por ventana de decodificacion. Segun el autor, los tiempos obtenidos coinciden en un 97,9 % con el modelo original en PyTorch sobre 20 clips en mandarin y cantonés, y en un 99,4 % dentro de la tolerancia de un bin.

La relevancia practica esta en el despliegue: los grafos estan escritos por un conversor propio (no trazados), todos los operadores tienen kernel en ONNX Runtime WebGPU y el modelo conserva la licencia Apache-2.0 del original. Esto lo hace util para generar subtitulos sincronizados en cliente, sin GPU de servidor, en idiomas chinos. El alcance linguistico es, sin embargo, muy limitado: solo chino mandarin (`zh`) y cantonés (`yue`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de Qwen3-ForcedAligner); exportada a ONNX con codificador de audio fp16 y decodificador con pesos de 4 bits |
| Parametros totales | 0,6 mil millones (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Ventanas de atencion de audio de 8 s; decodificacion sobre 5000 bins de 80 ms (aprox. 400 s por pasada) |
| Tipos de cuantizacion | fp16 (codificador de audio), 4 bits (embeddings y decodificador, `MatMulNBits` con `accuracy_level` 4) |
| Idiomas soportados | `zh` (mandarin), `yue` (cantonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos (`*.onnx_data`); tamano total del repo 1,0 GB |

## Arquitectura y entrenamiento

El modelo base es `Qwen3-ForcedAligner-0.6B`, un alineador forzado construido sobre la familia Qwen3. La tarea es de alineacion, no de transcripcion libre: recibe caracteristicas log-mel de estilo Whisper a 16 kHz junto con los ids de tokens del prompt (la transcripcion conocida) y produce, mediante decodificacion greedy en una sola pasada, una distribucion sobre 5000 bins temporales de 80 ms que se parsea a marcas de tiempo de palabra y caracter. El codificador de audio opera con ventanas de atencion de 8 segundos.

La version de este repositorio no reentrena ni modifica el comportamiento del modelo: solo cambia el formato de fichero y la precision numerica de los pesos. Los grafos ONNX los genera un conversor propio del autor (carpeta `tools/convert-qwen/` del repositorio SubtitleKing), que documenta en su README las entradas y salidas de cada grafo, el preprocesado log-mel, los ids de prompt, la decodificacion greedy y el parseo temporal. El `config.json` conserva el `model_type` del modelo original porque Transformers.js aun no tiene clase para el, y se anaden los tamanos que necesitan los grafos; `preprocessor_config.json` fija `sampling_rate` a 16000. No se documentan en la informacion disponible datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Alineacion forzada de una transcripcion conocida con el audio, generando marcas de tiempo a nivel de palabra y de caracter.
- Salida temporal discretizada en bins de 80 ms (5000 bins por pasada de decodificacion).
- Procesamiento de audio a 16 kHz con caracteristicas log-mel de estilo Whisper.
- Ejecucion en navegador mediante ONNX Runtime Web sobre WebGPU, con todos los operadores cubiertos por kernels de ese backend.
- Idiomas: chino mandarin y cantonés.
- No realiza reconocimiento de voz libre: requiere el texto de la transcripcion como entrada.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla del pipeline ASR/alineacion.

## Casos de uso

- Generacion de subtitulos sincronizados en cliente: dado un video con transcripcion en mandarin o cantonés, el modelo produce los tiempos de cada palabra y caracter directamente en el navegador via WebGPU, sin enviar el audio a un servidor.
- Herramientas de edicion de subtitulos (estilo SubtitleKing / Wolfcaps): ajuste automatico de los tiempos de un archivo SRT o VTT existente tras corregir el texto, ya que el modelo re-alinea la transcripcion revisada con el audio.
- Karaoke y resaltado palabra a palabra: la granularidad de caracter y palabra permite animaciones sincronizadas en reproductores web.
- Verificacion de calidad de transcripciones: comparar los tiempos alineados con los de una transcripcion automatica previa para detectar segmentos mal transcritos o desincronizados.
- Indexacion y busqueda temporal de audio: generar un indice de marcas de tiempo para saltar a la frase exacta dentro de un archivo de audio o video largo (hasta unos 400 s por pasada de decodificacion).
- Aplicaciones web sin backend de GPU: al caber en el formato ONNX de 1,0 GB con decodificador de 4 bits, permite ofrecer alineacion en navegadores de escritorio con WebGPU sin coste de inferencia en servidor.
- Localizacion de contenido chino: preparacion de subtitulos para doblaje o traduccion, donde se necesitan tiempos por caracter en mandarin y cantonés.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Coincidencia exacta de tiempos | 97,9 % | 20 clips en mandarin y cantonés frente al modelo original en PyTorch |
| Coincidencia dentro de un bin (80 ms) | 99,4 % | 20 clips en mandarin y cantonés frente al modelo original en PyTorch |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros); el modelo es un alineador, no un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repo ocupa 1,0 GB; el codificador va en fp16 y el decodificador y los embeddings en 4 bits, por lo que la huella en memoria es del orden de 1 GB, mas las activaciones de las ventanas de audio de 8 s.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en navegador (el caso de uso declarado); no se especifican modelos de datacenter como A100 o H100.
- GPU de consumo: el diseno esta pensado para ejecucion en cliente, por lo que cabe en GPUs de consumo con WebGPU; no se detallan modelos concretos ni requisitos minimos.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (objetivo principal); al ser ONNX estandar, tambien podria ejecutarse con otros runtimes de ONNX, aunque no se documenta ni garantiza.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| subtitleking/qwen3-forced-aligner-0.6b-onnx | 0,6 B | Ventanas de audio de 8 s; 5000 bins de 80 ms | zh, yue | Apache-2.0 | ONNX (fp16 + 4 bits) |
| Qwen/Qwen3-ForcedAligner-0.6B | 0,6 B | no disponible | zh, yue | Apache-2.0 | safetensors (PyTorch) |
| WhisperX (alineacion con wav2vec2) | no disponible | segmentos de audio | multilingue | varía por componente | PyTorch |
| Montreal Forced Aligner | no disponible | corpus completos | multilingue con diccionario | varía | binario / Kaldi |

La comparacion con alternativas de alineacion forzada como WhisperX o Montreal Forced Aligner es cualitativa: no se dispone de resultados numericos comparables en la informacion proporcionada. Frente al checkpoint original de Qwen, la diferencia es el formato (ONNX frente a PyTorch) y la precision de pesos, con una fidelidad declarada del 97,9 % exacta y 99,4 % dentro de un bin.

## Limitaciones y advertencias

- Solo soporta chino mandarin (`zh`) y cantonés (`yue`); no es util para castellano ni otras lenguas.
- Requiere una transcripcion previa: no transcribe audio por si mismo.
- La validacion reportada se basa en solo 20 clips; no hay evaluacion a gran escala ni en dominios ruidosos.
- La cuantizacion a 4 bits del decodificador y de los embeddings introduce una desviacion del 2,1 % en tiempos exactos respecto al modelo en PyTorch.
- El `config.json` conserva el `model_type` del original porque Transformers.js no tiene clase para este modelo; la integracion con esa libreria puede requerir trabajo adicional.
- El autor no documenta sesgos especificos; al derivar de un modelo entrenado sobre datos chinos, puede heredar sesgos de esos datos.
- Riesgo de alucinacion temporal: en audio con ruido, solapamientos de habla o transcripciones incorrectas, las marcas de tiempo pueden desviarse aunque el modelo no genere texto nuevo.
- Licencia Apache-2.0, que permite uso comercial; el autor pide citar el trabajo del equipo Qwen y atribuye todo el merito del modelo al equipo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subtitleking/qwen3-forced-aligner-0.6b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Organizacion Qwen: https://huggingface.co/Qwen
- Repositorio SubtitleKing (conversor en `tools/convert-qwen/`): no disponible como URL en la informacion proporcionada
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
