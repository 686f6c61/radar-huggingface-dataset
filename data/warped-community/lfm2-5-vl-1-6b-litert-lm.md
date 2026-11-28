# warped-community/LFM2.5-VL-1.6B-litert-lm

## Resumen

LFM2.5-VL-1.6B-litert-lm es la conversión al formato LiteRT-LM (`.litertlm`) del modelo vision-lenguaje LiquidAI/LFM2.5-VL-1.6B, publicada por el usuario warped-community. No se trata de un modelo nuevo, sino de un artefacto empaquetado para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google, sucesor de TensorFlow Lite. El objetivo es ejecutar un VLM de 1.600 millones de parámetros en telefonos y equipos de borde sin necesidad de infraestructura de servidor.

El modelo base combina un backbone de texto híbrido LFM2 (16 capas con convoluciones cortas con compuerta y atención de consultas agrupadas, dimensión oculta 2048, vocabulario de 64k) con una torre de visión SigLIP2 de 27 capas y dimensión oculta 1152, la misma que emplea la variante de 3B de la familia. Cada imagen se procesa a 512x512 y se proyecta en 256 tokens suaves, con un límite de una imagen por prompt y una ventana de contexto de 4096 tokens.

Su relevancia actual radica en que demuestra el estado del ecosistema de inferencia local para modelos multimodales: el paquete incluye codificador de visión, adaptador y metadatos de marcadores de posición, de modo que el runtime gestiona directamente adjuntos PNG/JPEG. No obstante, arrastra un fallo conocido grave en el runtime publicado (solo llega al modelo el cuarto superior de la imagen), para el que el autor distribuye una compilación corregida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: backbone de texto LFM2 (convoluciones cortas con compuerta + atencion GQA) con torre de vision SigLIP2 |
| Parametros totales | 1.6B (según denominación del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (cache KV máximo) |
| Tipos de cuantizacion | int8 dinamico; int4 blockwise-32 (lineales de texto) con embedding y lm_head en int8 y torre de vision en int8 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | LiteRT-LM (`.litertlm`) |
| Capas del backbone de texto | 16 |
| Dimension oculta (texto) | 2048 |
| Vocabulario | 64k |
| Torre de vision | SigLIP2, 27 capas, dimension oculta 1152 |
| Entrada de imagen | 1 imagen por prompt, redimensionada a 512x512, 256 tokens |
| Backend | CPU y GPU (LiteRT-LM >= 0.16.0 en macOS y Android OpenCL); Metal en iOS falla |
| Tamano int8 | 1.81 GB |
| Tamano int4 | 1.30 GB |
| Tamano int4 corregido (fixB) | 1.30 GB |
| Plantilla de chat | ChatML, incluida en el archivo; modelo no-thinking |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida: el componente de texto LFM2 alterna capas de convolución corta con compuerta y capas de atención con consultas agrupadas, lo que reduce el coste computacional frente a un transformer denso puro y resulta adecuado para inferencia en dispositivo. La parte visual es una torre SigLIP2 de 27 capas con dimensión oculta 1152, idéntica a la de la variante de 3B, que procesa cada imagen a 512x512 y la comprime en 256 tokens suaves insertados en la secuencia de texto mediante marcadores gestionados por el procesador de datos del runtime.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación destacable de este artefacto no está en el entrenamiento, sino en el empaquetado: la conversión con `litert_torch.convert` conserva los pesos sin modificar y el autor reporta una coincidencia de 4e-7 frente al modelo original en un Galaxy S26. La peculiaridad técnica relevante es que la familia LFM2.5-VL realiza el pixel-unshuffle 2x2 dentro del adaptador de visión y no en el codificador, lo que provoca el fallo de recorte de imagen en el runtime publicado.

## Capacidades

- Generación de texto conversacional de un solo turno y multiturno dentro de la ventana de 4096 tokens.
- Comprensión de imagen: descripción, preguntas sobre color dominante, OCR de texto grande y reconocimiento de la palabra más grande.
- Razonamiento visual geométrico básico: orientación de rayas horizontales o verticales y localización de esquinas (según las pruebas del autor).
- Procesamiento de una única imagen por prompt en formato PNG o JPEG mediante el parámetro `--attachment` del runtime.
- Ejecución en CPU y GPU en Android y macOS con LiteRT-LM 0.16.0 o superior.
- No dispone de modo thinking: el modelo es explícitamente no-thinking.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Descripción de imágenes en aplicaciones móviles: el paquete de 1,30 GB en int4 cabe en el almacenamiento de un teléfono de gama media y permite generar pies de foto o descripciones sin conexión, usando el codificador de visión en CPU y el modelo de lenguaje en GPU.
- OCR de texto grande en capturas de pantalla: útil para leer titulares, carteles o interfaces de usuario en dispositivos de borde, una de las tareas verificadas como correctas en las pruebas del autor.
- Preguntas sobre el color dominante de una imagen: aplicable a verificación visual sencilla en apps de accesibilidad o catalogación rápida de productos.
- Asistencia a personas con discapacidad visual: con la compilación corregida `fixB`, el modelo puede responder a preguntas sobre el contenido visible de una fotografía capturada por la cámara del teléfono, siempre que no se requiera localización espacial precisa.
- Clasificación visual en el borde para automatización industrial ligera: identificación de formas o atributos simples en imágenes fijas, sin dependencia de la nube y con latencia local.
- Prototipado de agentes de pantalla: el autor mantiene scripts de reexportación en un repositorio orientado a screen-agent, lo que sugiere su uso como componente de comprensión de capturas en flujos de automatización de interfaz, aunque la limitación de grounding por coordenadas restringe su alcance.
- Evaluación comparativa de runtimes: útil para investigadores que necesiten medir el rendimiento de LiteRT-LM frente a otras soluciones de inferencia local con un VLM pequeño de referencia.

## Benchmarks y rendimiento

Los únicos datos disponibles son las comprobaciones de calidad del autor sobre el CLI de LiteRT-LM 0.16.0, con decodificación greedy, motor nuevo por pregunta y caché desactivada.

| Configuracion | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | no disponible | 5/5 |
| LiteRT int4-b32 (CPU y GPU) | 8/8 | 3/5 |
| LiteRT int8 (CPU y GPU) | 8/8 | 3/5 |

Las cinco pruebas de imagen son fixtures sintéticos deterministas: color dominante, OCR de texto grande, forma, conteo de tres cuadrados y palabra más grande. El fallo en 2 de 5 se atribuye a las preguntas de forma fina y conteo, coherente con el problema de recorte de imagen del runtime 0.16.0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,30 GB para la variante int4 y 1,81 GB para int8, más el overhead del runtime y la caché KV de hasta 4096 tokens.
- GPU recomendadas: no se especifican modelos de escritorio; el autor verifica funcionamiento en la GPU de un Pixel 8a (Android 16) y en macOS mediante OpenCL.
- Cabe en GPU de consumo: sí, por tamaño, aunque la información proporcionada no documenta pruebas en RTX 4090, A100 o H100; el objetivo declarado es el hardware de borde.
- Despliegue: exclusivamente mediante el runtime LiteRT-LM (`litert-lm` 0.16.0 o superior, con 0.16.1 y 0.17.0 verificados para la compilación corregida). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Limitación de plataforma: en iOS, el backend Metal falla al crear el motor para esta familia (incidencia LiteRT-LM#3129); debe usarse CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-1.6B-litert-lm (este) | 1.6B | 4096 | SigLIP2, 1 imagen a 512x512 | LFM Open License v1.0 | LiteRT-LM |
| LFM2.5-VL-450M (litert-community) | 450M | no disponible | sí | LFM Open License v1.0 (presumible) | LiteRT-LM |
| LFM2.5-VL-3B (litert-community) | 3B | no disponible | sí, misma torre SigLIP2 | LFM Open License v1.0 (presumible) | LiteRT-LM |
| LiquidAI/LFM2.5-VL-1.6B (original) | 1.6B | no disponible | sí | LFM Open License v1.0 | safetensors (presumible) |

La variante de 450M ofrece menor huella para dispositivos muy limitados, mientras que la de 3B añade capacidad de grounding por coordenadas que, según el autor, no está al alcance del modelo de 1.6B. El modelo original en PyTorch sirve como referencia de calidad (5/5 en las pruebas de imagen) y no está sujeto al fallo del runtime LiteRT-LM.

## Limitaciones y advertencias

- Fallo crítico en el runtime publicado: en LiteRT-LM 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo. Las preguntas posicionales (localizar, contar, enumerar, "cuál está abajo") devuelven respuestas incorrectas sin error y con formato bien construido. Afecta a todos los archivos LFM2.5-VL, no solo a este.
- La compilación `LFM2.5-VL-1.6B_int4_fixB.litertlm` corrige el área visible en 0.16.1 y 0.17.0, pero no restaura el grounding por coordenadas, que sigue siendo capacidad de la variante de 3B.
- Riesgo de degeneración en el conteo: en la prueba de bandas numeradas, la variante de 1.6B genera un conteo desbocado que nunca se detiene en 16, en lugar de cortar limpiamente.
- Una sola imagen por prompt y ventana de contexto de 4096 tokens: insuficiente para documentos largos, múltiples imágenes o conversaciones extensas.
- Sin modo thinking ni soporte documentado de tool calling o agentes, lo que limita su uso en pipelines complejos.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés sin evaluación previa.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia OSI estándar y Hugging Face la etiqueta como "other".
- En iOS, el backend Metal falla; hay que recurrir a CPU, con la penalización de latencia correspondiente.
- Repositorio con 0 descargas y 0 likes: artefacto de comunidad sin validación externa más allá de las pruebas del autor.
- Riesgo de alucinación inherente a un VLM de 1.6B cuantizado; las respuestas visuales deben validarse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/warped-community/LFM2.5-VL-1.6B-litert-lm
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Incidencia del recorte de imagen: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Incidencia de Metal en iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Script de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Variante de 450M: https://huggingface.co/litert-community/LFM2.5-VL-450M
- Variante de 3B: https://huggingface.co/litert-community/LFM2.5-VL-3B
