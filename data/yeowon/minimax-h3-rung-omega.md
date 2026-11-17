# yeowon/MiniMax-H3-Rung-Omega

## Resumen

MiniMax-H3-Rung-Omega es una cuantización del modelo MiniMax-H3 FL2VA (First/Last-Frame-to-Video+Audio), un Diffusion Transformer multimodal de 33,1 mil millones de parámetros totales y 20,11 mil millones activos que genera vídeo y audio estéreo sincronizado a partir de un primer y último fotograma. La cuantización la publica el usuario independiente yeowon bajo el paraguas de su técnica propietaria "Rung Omega", que convierte las proyecciones lineales del modelo a una retícula ternaria balanceada en base 3 (4 trits, base 243) con escalas FP16 por grupo. El checkpoint está pensado para ejecutarse en ComfyUI y se distribuye junto con un motor de inferencia acelerado denominado TheoremFlow-Omega.

El interés de esta ficha radica en su propuesta de compresión agresiva: reduce el peso de 37,46 GiB en BF16 a 14,98 GiB en formato Joint-tANS (16,22 GiB en crudo), lo que supone una compresión de 2,50x respecto al modelo profesor y de 1,30x respecto a la cuantización int8_convrot recomendada oficialmente (19,53 GiB). El autor afirma además que supera a int8_convrot en acuerdo de velocidad Top-1 para audio y para la dimensión espaciotemporal, un dato que conviene tratar con cautela porque no se acompaña de una evaluación independiente.

La relevancia actual del modelo es doble: por un lado, aborda el problema práctico de ejecutar un DiT de vídeo-audio de más de 30B parámetros en hardware de consumo; por otro, introduce un motor de muestreo (TheoremFlow-Omega) que promete acelerar la generación conjunta de vídeo y audio de 625,4 s a 70,11 s, es decir, un factor de 8,92x, preservando según el autor el 99,58% de similitud coseno en el latente de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multimodal vídeo+audio, 50 bloques |
| Parámetros totales | 33,1B |
| Parámetros activos | 20,11B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Rung Omega: 4 trits balanceados en base 3 (base 243), escalas FP16 con group_size=128, convrot_groupsize=256; 5.976 BPW |
| Idiomas soportados | en, ko, zh, ja (según etiquetas de la model card) |
| Licencia | other |
| Formato de pesos | Checkpoint cuantizado para ComfyUI (Joint-tANS / uint8 crudo); no se especifica safetensors ni GGUF |
| Modelo base | Comfy-Org/MiniMax-H3 |
| Tamaño del repositorio | 17,4 GB |
| Pipeline | image-to-video (con audio) |
| Capas lineales cuantizadas | 200 / 200 (0 capas en fallback NVFP4) |

## Arquitectura y entrenamiento

El modelo subyacente es un Diffusion Transformer (DiT) de 50 bloques que procesa conjuntamente latentes de vídeo y de audio mediante flow matching. Cada bloque contiene proyecciones lineales `attn.qkv_proj`, `attn.out_proj`, `mlp.fc1` y `mlp.fc2`, y en esta versión las 200 proyecciones lineales de los 50 bloques están cuantizadas en la retícula ternaria balanceada Rung Omega, con rango [-40, +40], escalas FP16 por grupo de 128 elementos y rotación de convolución con grupos de 256. No hay capas en fallback NVFP4, lo que el autor presenta como garantía de pureza de la cuantización.

No se dispone de información sobre el dataset de entrenamiento original de MiniMax-H3 (número de tokens, composición, uso de RLHF o DPO) ni sobre el proceso de calibración empleado para obtener los parámetros de cuantización. La model card tampoco detalla la innovación arquitectónica del DiT base más allá de su naturaleza multimodal y de su modo FL2VA (primer y último fotograma a vídeo más audio). La aportación técnica propia de esta ficha es el motor TheoremFlow-Omega, un "mathematical floor inference engine" que acelera el muestreo de 20 pasos para vídeo de 864×480 y 124 fotogramas a 24 fps junto con audio estéreo a 32 kHz.

## Capacidades

- Generación de vídeo a partir de un primer y un último fotograma (first/last-frame-to-video), con 864×480 píxeles, 124 fotogramas y 24 fps en la configuración de referencia.
- Generación conjunta de audio estéreo a 32 kHz sincronizado con el vídeo, incluyendo voz y diálogo.
- Generación de vídeo con audio a partir de imagen (image-to-video con pista sonora).
- Muestreo por flow matching en 20 pasos, acelerado por TheoremFlow-Omega.
- Soporte multilingüe declarado en inglés, coreano, chino y japonés para el contenido generado (texto hablado y prompts).
- Integración nativa con ComfyUI como librería de despliegue.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking, por tratarse de un modelo generativo de medios y no de un LLM conversacional.

## Casos de uso

- Prototipado de vídeo generativo en estaciones de trabajo con GPU de consumo: la cuantización a 14,98 GiB permite cargar el DiT de 33,1B en GPUs de 24 GB, algo inviable con el profesor BF16 de 37,46 GiB.
- Generación de clips cortos con audio sincronizado para previsualización de guiones: el modo FL2VA permite fijar el fotograma inicial y final y dejar que el modelo interpole movimiento y diálogo, útil en storyboards animados.
- Interpolación de vídeo con sonido en postproducción: dados dos fotogramas clave de una secuencia, el modelo genera los 124 fotogramas intermedios a 24 fps con audio estéreo, reduciendo el trabajo manual de interpolar y doblar.
- Creación de contenido multilingüe para redes sociales: las etiquetas declaran soporte de en, ko, zh y ja, lo que permite generar diálogos hablados en esos idiomas dentro del propio clip.
- Investigación en cuantización extrema de DiT: el checkpoint sirve como caso de estudio reproducible de cuantización ternaria base 3 con 5,976 BPW sobre un modelo multimodal de gran tamaño, con todas las capas lineales convertidas.
- Evaluación de aceleración de muestreo: TheoremFlow-Omega permite medir el compromiso entre velocidad (8,92x según el autor) y fidelidad latente (99,58% de similitud coseno, 20,80 dB SNR) en pipelines de flow matching.
- Demostraciones interactivas en ComfyUI: al ser un nodo de ComfyUI, se puede integrar en flujos de trabajo visuales para generar variaciones de vídeo-audio sin escribir código.

## Benchmarks y rendimiento

| Métrica | Rung Omega | int8_convrot (oficial) | BF16 (profesor) |
|---|---|---|---|
| Tamaño del checkpoint | 14,98 GiB (Joint-tANS) / 16,22 GiB (crudo) | 19,53 GiB | 37,46 GiB |
| Compresión vs. BF16 | 2,50x | no disponible | 1x |
| Compresión vs. int8_convrot | 1,30x | 1x | no aplica |
| Acuerdo Top-1 de velocidad (audio) | superior a int8_convrot (sin cifra) | referencia | no disponible |
| Acuerdo Top-1 de velocidad (espaciotemporal) | superior a int8_convrot (sin cifra) | referencia | no disponible |
| Similitud coseno del latente de vídeo | 99,58% | no disponible | referencia |
| SNR del latente de vídeo | 20,80 dB | no disponible | referencia |
| Tiempo de muestreo (20 pasos, 864×480, 124 frames, audio 32 kHz) | 70,11 s con TheoremFlow-Omega | no disponible | 625,4 s sin aceleración |
| Aceleración end-to-end | 8,92x | no disponible | 1x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible. Las cifras de la tabla proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-17 GiB para el checkpoint cuantizado (14,98 GiB en Joint-tANS, 16,22 GiB en crudo), más el overhead de activaciones y del decodificador de vídeo/audio, que la model card no cuantifica.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el checkpoint encaja en GPUs de 24 GB (RTX 4090, RTX 3090, A10G) y en GPUs profesionales de 40-80 GB (A100, H100) con margen para lotes mayores.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 y RTX 3090 de 24 GB; en GPUs de 16 GB el margen es muy ajustado y no está confirmado.
- Opciones de despliegue: ComfyUI es la vía documentada (library_name: comfyui). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un DiT de vídeo.
- Latencia y throughput: 70,11 s para un clip de 124 fotogramas a 864×480 con audio estéreo de 32 kHz y 20 pasos de muestreo, según el autor, frente a 625,4 s sin TheoremFlow-Omega. No se detalla el hardware empleado en esa medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Rung-Omega | 33,1B totales / 20,11B activos | no disponible | Ternaria base 3, 5,976 BPW | other | Hugging Face, ComfyUI |
| Comfy-Org/MiniMax-H3 (base) | 33,1B totales / 20,11B activos | no disponible | BF16 e int8_convrot | no disponible | Hugging Face, ComfyUI |
| Otros DiT de vídeo-audio de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores (por ejemplo, familias de modelos de vídeo generativo con audio) en parámetros, contexto o rendimiento verificado. La comparación directa más fiable es contra el propio modelo base, cuyas cifras de tamaño y velocidad se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- Las cifras de compresión, similitud y aceleración provienen únicamente de la model card del autor y no han sido replicadas de forma independiente; trátelas como afirmaciones no verificadas.
- La licencia es "other" y no se detallan sus términos en la información disponible; antes de un uso comercial es imprescindible consultar las condiciones exactas en el repositorio y las del modelo base Comfy-Org/MiniMax-H3.
- El modelo es una cuantización agresiva a 5,976 BPW: aunque el autor afirma que supera a int8_convrot en acuerdo de velocidad Top-1, no se publican métricas perceptuales ni de calidad audiovisual objetivas (FVD, FAD, CLIP score) que permitan cuantificar la degradación.
- No hay información sobre sesgos del modelo base ni sobre sesgos introducidos por la cuantización; un DiT de vídeo-audio puede reproducir estereotipos presentes en sus datos de entrenamiento, que no se documentan.
- Riesgo de alucinación visual y sonora: la generación de diálogo y audio sincronizado puede producir labios mal sincronizados, voces inexistentes o contenido no fiel a los fotogramas de entrada.
- El soporte idiomático se limita a en, ko, zh y ja según las etiquetas; no se documenta el comportamiento en castellano.
- El despliegue está atado a ComfyUI; no se ofrecen pesos en safetensors estándar ni integración con otros runtimes, lo que dificulta su uso fuera de ese ecosistema.
- El repositorio tiene 0 descargas y solo 4 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La fecha de creación del repositorio (2026-11-03) y su actualización (2026-11-06) deben contrastarse con la disponibilidad real del modelo base en el momento de la evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeowon/MiniMax-H3-Rung-Omega
- Discusiones de la comunidad: https://huggingface.co/yeowon/MiniMax-H3-Rung-Omega/discussions
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Documentación en coreano: https://huggingface.co/yeowon/MiniMax-H3-Rung-Omega/blob/main/README_ko.md
- Documentación en chino: https://huggingface.co/yeowon/MiniMax-H3-Rung-Omega/blob/main/README_zh.md
- Documentación en japonés: https://huggingface.co/yeowon/MiniMax-H3-Rung-Omega/blob/main/README_ja.md
- Apoyo al autor (Buy Me a Coffee): https://buymeacoffee.com/tripleyoung
