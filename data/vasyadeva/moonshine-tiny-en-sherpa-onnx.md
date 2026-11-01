# vasyadeva/moonshine-tiny-en-sherpa-onnx

## Resumen

Moonshine Tiny (English) en formato ONNX para sherpa-onnx es una conversión del modelo de reconocimiento automático del habla (ASR) `moonshine-ai/moonshine-tiny`, publicada por el usuario vasyadeva. El repositorio no contiene pesos entrenados de nuevo: empaqueta los grafos ONNX del modelo original en la disposición que espera sherpa-onnx mediante `OfflineRecognizer.from_moonshine_v2`, de modo que pueda ejecutarse en inferencia local sin depender de PyTorch ni de la librería `transformers`.

El modelo subyacente, desarrollado por Moonshine AI, es un sistema ASR en inglés orientado a dispositivos con recursos limitados. La conversión mantiene los pesos en float32 sin cuantización, con un encoder de 31 MB y un decoder combinado de 116 MB, lo que da un repositorio de aproximadamente 0,1 GB. Su relevancia actual reside en la facilidad de despliegue: sherpa-onnx es un runtime en C++ con bindings para Python, con soporte de ejecución en CPU y en dispositivos de borde, lo que permite integrar transcripción de voz en aplicaciones de escritorio, móviles o embebidas.

La licencia es MIT, heredada del modelo original, y el único idioma declarado es el inglés. No se han publicado métricas de precisión propias de esta conversión; la validación del autor se limita a dos clips sintéticos transcritos correctamente, lo que constituye una prueba de humo del formato y no una evaluación de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder-decoder para ASR (Moonshine Tiny), exportado a grafos ONNX |
| Parametros totales | no disponible (pesos en float32: encoder 31 MB, decoder 116 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; no se especifica duración máxima) |
| Tipos de cuantizacion | ninguna en este repositorio (float32); el modelo base admite otras conversiones no incluidas aquí |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`) más `tokens.txt`, `tokenizer.json`, `config.json`, `generation_config.json`, `preprocessor_config.json` |

## Arquitectura y entrenamiento

El modelo base Moonshine Tiny es un sistema ASR de tipo encoder-decoder: el encoder transforma audio crudo a 16 kHz en representaciones internas y el decoder genera la secuencia de tokens de texto. En esta conversión, el decoder se ha fusionado en un único grafo (`decoder_model_merged.onnx`) que contiene las variantes con y sin caché, seleccionables mediante la rama `use_cache_branch`, lo que permite reutilizar el estado entre pasos de decodificación autoregresiva.

La exportación se realizó con `optimum-cli export onnx --model moonshine-ai/moonshine-tiny --task automatic-speech-recognition-with-past` usando `transformers` 4.52.4 sobre Linux x86_64. El propio autor indica que la comparación de logits frente a PyTorch arrojó una diferencia de aproximadamente 4e-5, por encima de la tolerancia de 1e-5 del exportador, que aun así guardó los grafos. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO, ya que esos detalles pertenecen a la model card del modelo original y no se incluyen en la información disponible.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio PCM de 16 kHz.
- Transcripción de enunciados cortos y consultas de voz, según la prueba de humo del autor («Where is the nearest pharmacy?», «Careful, there is a step down ahead.»).
- Ejecución en local mediante sherpa-onnx con `OfflineRecognizer.from_moonshine_v2`, sin necesidad de PyTorch en tiempo de inferencia.
- Inferencia en CPU con control del número de hilos (`num_threads`), adecuada para dispositivos de borde.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio más allá de la transcripción ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés; existe una conversión paralela al ucraniano en otro repositorio del mismo autor.

## Casos de uso

- Transcripción local en aplicaciones de escritorio: integrar sherpa-onnx con los dos grafos ONNX permite dictado o subtitulado sin enviar audio a servicios externos, con un coste de almacenamiento de unos 150 MB.
- Asistentes de voz embebidos: el tamaño reducido del encoder (31 MB) y la ejecución en CPU facilitan desplegar comandos de voz en dispositivos con poca memoria, como Raspberry Pi o terminales industriales.
- Subtitulado de reuniones y notas de voz: el modelo transcribe audio de 16 kHz en inglés y puede encadenarse con un pipeline de diarización o resumen posterior.
- Prototipado rápido de interfaces de voz: la API `OfflineRecognizer` de sherpa-onnx reduce el código de integración a unas pocas líneas, útil para validar productos de voz antes de invertir en modelos mayores.
- Procesamiento por lotes de archivos de audio en inglés: al ser offline y no requerir GPU, puede ejecutarse en servidores de CPU para transcribir archivos almacenados.
- Aplicaciones de accesibilidad: dictado y control por voz en inglés dentro de herramientas de escritorio, con la ventaja de que el audio no sale del dispositivo.
- Filtrado de palabras clave por voz: consultas cortas como la del ejemplo del autor («Where is the nearest pharmacy?») encajan en el perfil de uso previsto del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es una prueba de humo sobre dos clips sintéticos generados con síntesis de voz de macOS a 16 kHz, transcritos correctamente, que el autor describe explícitamente como una comprobación del formato y no una evaluación de precisión. Tampoco se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM: no aplica en la configuración documentada; la inferencia con sherpa-onnx se realiza en CPU.
- Huella en disco: aproximadamente 147 MB para los dos grafos ONNX (31 MB + 116 MB) más los archivos auxiliares; el repositorio completo ocupa unos 0,1 GB.
- GPU: no se documenta soporte ni requisitos de GPU para esta conversión; el runtime empleado está orientado a CPU.
- GPU de consumo: no disponible; al no requerir GPU, el modelo puede ejecutarse en equipos sin tarjeta gráfica dedicada.
- Despliegue: sherpa-onnx 2.0.1 (probado por el autor) mediante `sherpa_onnx.OfflineRecognizer.from_moonshine_v2`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles; el autor solo indica que ejecutó la prueba con `num_threads=2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| moonshine-tiny-en-sherpa-onnx (esta ficha) | no disponible (31 MB encoder + 116 MB decoder en float32) | no disponible | en | MIT | ONNX para sherpa-onnx | Conversión comunitaria; validación solo con prueba de humo |
| moonshine-ai/moonshine-tiny (original) | no disponible en la información | no disponible | en | MIT | PyTorch / safetensors (no confirmado en la información) | Modelo de referencia del que deriva esta conversión |
| vasyadeva/moonshine-tiny-uk-sherpa-onnx | no disponible | no disponible | uk | MIT | ONNX para sherpa-onnx | Contraparte en ucraniano del mismo autor |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo admite inglés; no se ha validado para otros idiomas.
- La validación es una prueba de humo con dos clips sintéticos; no hay evaluación de WER ni de robustez frente a ruido, acentos o audio real.
- El exportador registró una diferencia de logits de aproximadamente 4e-5 frente a PyTorch, por encima de su tolerancia de 1e-5; pueden existir pequeñas divergencias numéricas respecto al modelo original.
- Los pesos están en float32 sin cuantización, lo que limita la reducción de tamaño y puede afectar al rendimiento en dispositivos muy restringidos.
- Riesgo de alucinación inherente a los modelos ASR: posibilidad de transcribir texto plausible en segmentos con silencio o ruido.
- No se documentan sesgos específicos, pero al ser un modelo entrenado por un tercero (Moonshine AI) y redistribuido por un usuario comunitario, la responsabilidad sobre los datos de entrenamiento recae en el modelo original.
- Licencia MIT: permite uso comercial, pero conviene citar y atribuir el trabajo original de Moonshine AI, como solicita el autor de la conversión.
- Repositorio con muy poca tracción (27 descargas, 0 likes) y sin mantenimiento documentado; para producción conviene evaluar el modelo original y validar la conversión con datos propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vasyadeva/moonshine-tiny-en-sherpa-onnx
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-tiny
- Contraparte en ucraniano: https://huggingface.co/vasyadeva/moonshine-tiny-uk-sherpa-onnx
