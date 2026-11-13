# xix3r/voxix-whisper-tiny.en-gguf

## Resumen

voxix-whisper-tiny.en-gguf es una conversion a formato GGUF del modelo de reconocimiento automatico del habla openai/whisper-tiny.en, empaquetada para su uso con el runtime transcribe.cpp. El modelo original lo desarrollo OpenAI y forma parte de la familia Whisper, presentada en el articulo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). Esta version concreta la publica el usuario xix3r en Hugging Face y mantiene la licencia Apache-2.0 del modelo base.

Se trata de un transformer encoder-decoder de 37.776.736 parametros, entrenado exclusivamente con datos en ingles y orientado a la transcripcion de audio en ventanas de 30 segundos con decodificacion troceada para audio largo. Su interes practico esta en el formato GGUF y en el runtime transcribe.cpp: permite ejecutar ASR en CPU, Metal o Vulkan con huellas de memoria muy reducidas (42-146 MB segun cuantizacion), lo que lo hace apto para entornos sin GPU dedicada o para despliegues en el borde.

La relevancia actual de esta ficha es doble: por un lado documenta una conversion concreta con mediciones de WER y de factor de tiempo real (RTF) sobre hardware de consumo; por otro, sirve como referencia de como se distribuyen y cuantizan modelos ASR pequenos fuera del ecosistema transformers. El modelo no soporta streaming, traduccion ni deteccion de idioma, y solo admite marcas de tiempo a nivel de segmento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.776.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificacion troceada para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (solo ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper: un transformer encoder-decoder que procesa espectrogramas mel de audio en ventanas de 30 segundos y genera tokens de transcripcion de forma autorregresiva. La variante tiny.en es la configuracion mas pequena de la familia y esta entrenada exclusivamente con datos en ingles, lo que la hace mas rapida que el modelo multilingue equivalente en tamano. El modelo base se entreno con 680.000 horas de audio etiquetado mediante supervision debil a gran escala, segun la model card original de OpenAI. No se detalla en la informacion disponible la composicion exacta del dataset ni si hubo fases de RLHF o DPO; la model card original no menciona fine-tuning por preferencias para esta familia.

La conversion a GGUF la realiza el autor de esta ficha a partir del commit upstream 87c7102 de openai/whisper-tiny.en, fijado el 2026-04-25, y se valido contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. La innovacion tecnica relevante aqui no esta en la arquitectura, sino en el empaquetado: cuantizaciones K-quant que reducen el modelo de 146 MB (F32) a 42 MB (Q4_K_M) con un impacto en WER de apenas 0,22 puntos porcentuales en LibriSpeech test-clean (5,77% en F32 frente a 5,99% en Q4_K_M). La decodificacion por defecto de transcribe.cpp usa greedy, suppress_tokens, temperature fallback y marcas de tiempo de segmento activadas.

## Capacidades

- Transcripcion de voz a texto en ingles sobre audio de 16 kHz mono.
- Procesamiento de audio largo mediante decodificacion troceada en ventanas de 30 segundos.
- Generacion de marcas de tiempo a nivel de segmento.
- Ejecucion en CPU, Metal (Apple Silicon) y Vulkan (GPU integradas y dedicadas) a traves de transcribe.cpp.
- Cuantizacion agresiva con perdida minima de calidad, apta para entornos con memoria limitada.
- No soporta streaming.
- No soporta traduccion de voz a texto.
- No soporta deteccion automatica de idioma.
- No dispone de tool calling ni capacidades de agente.
- No dispone de modo thinking ni capacidades de vision o audio mas alla del propio ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo procesa audio de 16 kHz mono en ventanas de 30 segundos y permite generar actas o resumenes a partir de la salida, con un WER de referencia del 5,77% en LibriSpeech test-clean.
- Subtitulado offline de contenido en ingles: las marcas de tiempo a nivel de segmento permiten generar ficheros de subtitulos sincronizados sin depender de servicios en la nube.
- Despliegue en dispositivos de borde: con cuantizacion Q4_K_M el modelo ocupa 42 MB, lo que permite ejecutarlo en Raspberry Pi, moviles o sistemas embebidos con CPU modesta y sin GPU.
- Procesamiento por lotes en servidores sin GPU: el RTF de 26,1 en un Ryzen 4750U con CPU indica que puede transcribir audio en tiempo real o mas rapido en hardware de portatil, adecuado para pipelines de ingesta masiva.
- Prototipado rapido de aplicaciones ASR: la integracion con transcribe.cpp y la CLI `transcribe-cli` permiten validar ideas en minutos sin montar infraestructura de transformers.
- Transcripcion en aplicaciones de escritorio macOS: el RTF de 279,8 con backend Metal en un M4 Max indica un rendimiento muy superior al tiempo real, apto para dictado en vivo dentro de una app nativa.
- Preprocesado de corpus de audio en ingles para entrenamiento de otros modelos: la velocidad y el bajo coste computacional permiten generar transcripciones a gran escala antes de un filtrado o anotacion posterior.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 5,77 | 5,77 | 5,72 | 5,80 | 5,89 | 5,99 |

| Hardware / backend | RTF (factor de tiempo real) |
|---|---:|
| Apple M4 Max, Metal | 279,8 |
| Apple M4 Max, CPU | 78,7 |
| AMD Ryzen 4750U, Vulkan | 60,7 |
| AMD Ryzen 4750U, CPU | 26,1 |

El WER se midio sobre la particion completa de LibriSpeech test-clean (2620 enunciados) con la decodificacion por defecto de transcribe.cpp. OpenAI reporta 5,66% en la misma particion con su propia configuracion de evaluacion; la diferencia se atribuye probablemente a que `model.generate()` usa `<|notimestamps|>` por defecto mientras que transcribe.cpp ejecuta con marcas de tiempo activadas. Los numeros provienen de una unica ejecucion con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoria de despliegues, ya que transcribe.cpp esta pensado para CPU y backends integrados. En GPU, el modelo completo en F32 ocupa 146 MB y en Q4_K_M 42 MB, por lo que cabe holgadamente en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: no se especifican GPU dedicadas en la informacion disponible. Los backends validados son Metal (Apple Silicon, probado en M4 Max) y Vulkan (probado en AMD Ryzen 4750U con GPU integrada).
- Cabe en GPU de consumo: si, con cualquier GPU de consumo actual, dado el tamano reducido del modelo. Tambien cabe en CPU sin GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: RTF de 279,8 en Metal (M4 Max), 78,7 en CPU (M4 Max), 60,7 en Vulkan (Ryzen 4750U) y 26,1 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento mas rapido que el tiempo real; los valores indicados son ordenes de magnitud superiores, lo que sugiere una latencia muy baja para clips cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---|---:|
| voxix-whisper-tiny.en-gguf (este) | 37,8 M | ventanas de 30 s | en | Apache-2.0 | GGUF | 5,77% (F32) |
| openai/whisper-tiny.en (base) | 37,8 M | ventanas de 30 s | en | Apache-2.0 | safetensors | 5,66% (reportado por OpenAI) |
| openai/whisper-tiny (multilingue) | 37,8 M | ventanas de 30 s | multilingue | Apache-2.0 | safetensors | no disponible en esta ficha |
| openai/whisper-base.en | 74,4 M | ventanas de 30 s | en | Apache-2.0 | safetensors | no disponible en esta ficha |

La comparativa directa mas relevante es con el modelo base openai/whisper-tiny.en, del que esta ficha es una conversion cuantizada: misma arquitectura, mismos parametros y misma licencia, con la diferencia de formato (GGUF frente a safetensors) y de runtime (transcribe.cpp frente a transformers). Frente a whisper-tiny multilingue, la variante .en es mas rapida al mismo tamano segun la model card, a costa de no soportar otros idiomas. Frente a whisper-base.en, este modelo tiene la mitad de parametros, aunque no se dispone de cifras de WER comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles: cualquier audio en otro idioma producira transcripciones incorrectas o alucinaciones.
- No soporta streaming: el audio debe procesarse en bloques completos, lo que limita su uso en dictado en vivo sin un pipeline externo de troceado.
- No soporta traduccion ni deteccion de idioma, a diferencia de las variantes multilingues de Whisper.
- Las marcas de tiempo son solo a nivel de segmento, no a nivel de palabra.
- Riesgo de alucinacion en clips cortos o con ruido de fondo: la propia model card senala que las diferencias de WER entre ejecuciones con Metal se deben en gran parte a "short-clip hallucination outcomes on the noise floor".
- El WER en dominios distintos de LibriSpeech (audio telefonico, acentos marcados, jerga tecnica) no esta documentado en la informacion disponible y puede ser considerablemente peor.
- Las mediciones de rendimiento provienen de una unica ejecucion y de hardware concreto (M4 Max y Ryzen 4750U); no deben extrapolarse sin validacion.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los terminos upstream de openai/whisper-tiny.en.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y el autor no es el desarrollador original del modelo; la trazabilidad depende del commit upstream fijado (87c7102) y del commit de validacion de transcribe.cpp (5.6.1).
- El modelo no dispone de tool calling, agentes ni capacidades multimodales mas alla del ASR.

## Enlaces

- Hugging Face: https://huggingface.co/xix3r/voxix-whisper-tiny.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Commit upstream fijado: https://huggingface.co/openai/whisper-tiny.en/commit/87c7102
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion transcribe.cpp 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-tiny.en.md
- Paper Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Descargas GGUF (F32): https://huggingface.co/handy-computer/whisper-tiny.en-gguf/resolve/main/whisper-tiny.en-F32.gguf
- Descargas GGUF (F16): https://huggingface.co/handy-computer/whisper-tiny.en-gguf/resolve/main/whisper-tiny.en-F16.gguf
- Descargas GGUF (Q8_0): https://huggingface.co/handy-computer/whisper-tiny.en-gguf/resolve/main/whisper-tiny.en-Q8_0.gguf
- Descargas GGUF (Q6_K): https://huggingface.co/handy-computer/whisper-tiny.en-gguf/resolve/main/whisper-tiny.en-Q6_K.gguf
- Descargas GGUF (Q5_K_M): https://huggingface.co/handy-computer/whisper-tiny.en-gguf/resolve/main/whisper-tiny.en-Q5_K_M.gguf
- Descargas GGUF (Q4_K_M): https://huggingface.co/handy-computer/whisper-tiny.en-gguf/resolve/main/whisper-tiny.en-Q4_K_M.gguf
