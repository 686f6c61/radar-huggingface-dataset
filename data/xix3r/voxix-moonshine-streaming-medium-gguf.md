# xix3r/voxix-moonshine-streaming-medium-gguf

## Resumen

voxix-moonshine-streaming-medium-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-streaming-medium, publicada por el usuario xix3r para su uso con el runtime transcribe.cpp. El modelo original lo desarrolla Useful Sensors y forma parte de la familia Moonshine Streaming, disenada especificamente para transcripcion de voz de baja latencia en dispositivos de borde (edge). Se trata de un modelo encoder-decoder de aproximadamente 246 millones de parametros (265.898.113 en el checkpoint safetensors), orientado exclusivamente al ingles y sin capacidades de traduccion, deteccion de idioma ni marcas temporales.

La relevancia de esta ficha radica en que el artefacto GGUF permite ejecutar el modelo en CPU y GPU de consumo mediante transcribe.cpp, con cuantizaciones que reducen el peso a 282 MB en Q8_0 sin perdida medible de calidad (WER identico al de F32 en LibriSpeech test-clean). El modelo emplea un encoder "ergodico" con atencion local acotada y sin embeddings posicionales, un frontend de audio de 50 Hz y un adaptador que inyecta informacion posicional antes de un decoder autorregresivo estandar.

Es la variante mas profunda y ancha de las tres de la familia (14 capas en encoder y decoder, dimensiones ocultas de 768 en encoder y 640 en decoder), lo que la situa por encima de moonshine-streaming-tiny y moonshine-streaming-small en capacidad, manteniendo un coste computacional bajo para despliegue en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer con encoder ergodico (atencion local acotada, sin embeddings posicionales) y decoder autorregresivo; frontend de audio de 50 Hz en dominio temporal |
| Parametros totales | 265.898.113 (aprox. 246 M segun la model card del autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, F16, Q8_0 (Q6_K, Q5_K_M y Q4_K_M no se distribuyen para esta variante) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |
| Entrada de audio | WAV mono a 16 kHz |
| Capas | 14 encoder / 14 decoder |
| Dimensiones ocultas | Encoder 768 / decoder 640 |
| Tamano del repo | 0.3 GB |
| Libreria | transcribe.cpp |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder tipo Transformer adaptada para streaming. El encoder es "ergodico": utiliza atencion local de ventana deslizante acotada y prescinde de embeddings posicionales, lo que permite procesar audio de forma incremental sin depender de una longitud fija de entrada. Un adaptador intermedio inyecta la informacion posicional antes de alimentar el decoder autorregresivo estandar. El frontend de audio opera a 50 Hz en el dominio temporal, un diseno ligero pensado para hardware de borde.

El checkpoint GGUF fue portado desde el commit upstream 57b8436 (fijado el 2026-05-06) y validado contra la referencia HF Transformers v5.7.0 en el commit 0d312ce de transcribe.cpp. Los detalles sobre volumen de datos de entrenamiento, composicion del dataset y uso de RLHF/DPO no estan disponibles en la informacion proporcionada; la model card original remite al paper de Moonshine Streaming para la descripcion completa del entrenamiento.

## Capacidades

- Transcripcion de voz a texto offline en ingles a partir de audio WAV mono a 16 kHz.
- Procesamiento en streaming gracias al encoder ergodico con atencion de ventana deslizante.
- Inferencia de baja latencia en hardware de clase borde y CPU/GPU de consumo.
- Gestion de audio de entrada de duracion variable sin depender de segmentacion fija.
- No soporta traduccion (translate: false).
- No soporta deteccion de idioma (lang_detect: false).
- No genera marcas temporales (timestamps: none).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multimodales mas alla del audio de entrada (sin vision ni audio de salida).

## Casos de uso

- Transcripcion de reuniones en tiempo real: el modelo procesa audio en streaming con atencion de ventana deslizante, lo que permite generar transcripciones incrementales durante una llamada o reunion sin esperar a que finalice el audio, con un coste de 282 MB en Q8_0.
- Subtitulado en vivo para videoconferencias: al operar sobre WAV mono a 16 kHz y admitir streaming, puede alimentar pipelines de subtitulado de baja latencia en ingles integrados en aplicaciones de escritorio o web.
- Dictado por voz en aplicaciones de productividad: la transcripcion offline en ingles con WER de 2,16% en LibriSpeech test-clean lo hace adecuado para convertir notas de voz en texto en herramientas de escritorio, ejecutando el modelo en CPU sin GPU dedicada.
- Asistentes de voz en dispositivos de borde: el diseno de frontend ligero a 50 Hz y el encoder ergodico estan pensados para hardware con recursos limitados, permitiendo reconocimiento de comandos de voz en ingles en dispositivos empotrados.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones en ingles (podcasts, llamadas, entrevistas) para generar texto indexable, usando la cuantizacion Q8_0 que mantiene el WER identico a F32.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en ingles de conversaciones presenciales o retransmisiones capturadas por microfono, con despliegue local que evita enviar audio a servicios en la nube.
- Preprocesado en pipelines de analisis de llamadas: transcripcion de grabaciones de atencion al cliente en ingles como paso previo a analisis de sentimiento o extraccion de entidades, aprovechando el bajo coste de almacenamiento del modelo cuantizado.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,16 | 2,16 | 2,16 |
| Tamano del archivo (MB) | 1015 | 509 | 282 |

| Plataforma | RTF Metal | RTF CPU / Vulkan |
|---|---:|---:|
| Apple M4 Max | 63 | 35,5 (CPU) |
| AMD Ryzen 4750U | No disponible | 14 (Vulkan) / 7,5 (CPU) |

El WER se midio sobre el split completo de LibriSpeech test-clean (2620 enunciados) con decodificacion greedy (num_beams=1, do_sample=False). Las cuantizaciones F16 y Q8_0 son numericamente indistinguibles de F32 en este conjunto. El valor autoinformado por Useful Sensors en la tabla de Open ASR Leaderboard es 2,08%; la diferencia residual de +0,08 puntos porcentuales corresponde a diferencias de scoring y normalizacion de texto, no a deriva numerica. Los valores de RTF (factor de tiempo real) indican que el modelo procesa audio entre 7,5 y 63 veces mas rapido que tiempo real segun la plataforma, lo que confirma su viabilidad para streaming.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el peso del modelo va de 282 MB (Q8_0) a 1015 MB (F32), por lo que la memoria necesaria es del orden de esos valores mas overhead del runtime.
- GPU recomendadas: no se especifica una lista concreta; los datos de rendimiento cubren Apple M4 Max (Metal y CPU) y AMD Ryzen 4750U (Vulkan y CPU).
- Cabe en GPU de consumo: si, dado el tamano reducido del modelo cuantizado (282 MB en Q8_0), es viable en practicamente cualquier GPU de consumo, aunque no se proporcionan mediciones especificas para RTX 4090, A100 o H100.
- Opciones de despliegue: transcribe.cpp (runtime nativo del artefacto GGUF), Hugging Face Transformers (con MoonshineStreamingForConditionalGeneration y AutoProcessor) y el framework Moonshine Voice para dispositivos de borde.
- Latencia y throughput: RTF medido de 63 (Metal, M4 Max), 35,5 (CPU, M4 Max), 14 (Vulkan, Ryzen 4750U) y 7,5 (CPU, Ryzen 4750U); no hay datos de latencia absoluta ni de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (LibriSpeech test-clean) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| moonshine-streaming-medium (este GGUF) | 265.898.113 | No disponible | 2,16% (medido) / 2,08% (auto) | MIT | GGUF en transcribe.cpp; safetensors en HF |
| moonshine-streaming-small | No disponible | No disponible | No disponible en esta ficha | MIT | HF Transformers y Moonshine Voice |
| moonshine-streaming-tiny | No disponible | No disponible | No disponible en esta ficha | MIT | HF Transformers y Moonshine Voice |

La familia Moonshine Streaming incluye tres variantes (tiny, small y medium); medium es la mas profunda (14/14 capas) y la de mayores dimensiones ocultas (768/640). La model card no proporciona cifras comparativas de WER para las variantes tiny y small, y no se dispone de datos de benchmarks de alternativas fuera de la familia. Los datos de parametros y contexto de las variantes comparables figuran como no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo admite ingles: no hay soporte multilingue ni deteccion de idioma, por lo que audio en otros idiomas producira transcripciones incorrectas.
- No genera marcas temporales, lo que limita casos de uso que requieran alineacion temporal por palabra o segmento.
- No realiza traduccion; la salida es unicamente el texto transcrito en el idioma de origen.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no nativos o solapamiento de hablantes; el WER de referencia (2,16%) corresponde a audio limpio de LibriSpeech y no representa condiciones reales adversas.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada; al entrenarse presumiblemente con corpus en ingles, puede presentar menor robustez ante variantes dialectales no representadas.
- Restricciones de licencia: licencia MIT, que permite uso comercial manteniendo el aviso de copyright; conviene revisar la model card upstream para los terminos completos.
- El artefacto GGUF esta vinculado a transcribe.cpp y a una version concreta del commit upstream; cambios en el runtime o en el modelo base pueden requerir reconversion.
- Las cuantizaciones Q6_K, Q5_K_M y Q4_K_M no estan disponibles para esta variante, lo que limita el ahorro de almacenamiento frente a otras familias de modelos.
- El modelo no dispone de tool calling, agentes ni razonamiento multi-paso; su uso esta acotado a ASR.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-streaming-medium-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-medium
- Commit upstream del modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-medium/commit/57b8436
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/0d312ce
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-medium.md
- Framework Moonshine Voice: https://github.com/moonshine-ai/moonshine
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Descarga F32: https://huggingface.co/handy-computer/moonshine-streaming-medium-gguf/resolve/main/moonshine-streaming-medium-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-streaming-medium-gguf/resolve/main/moonshine-streaming-medium-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-streaming-medium-gguf/resolve/main/moonshine-streaming-medium-Q8_0.gguf
