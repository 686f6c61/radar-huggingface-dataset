# TokenAI-zer/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ4-mtp

## Resumen

Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ4-mtp es una cuantización mixta de 4/5/6/8 bits en formato MLX del modelo Qwensploit V2 27B, un ajuste fino QLoRA orientado a ciberseguridad desarrollado por xtools-at sobre la base Qwen3.8-27B. Esta variante concreta la publica el usuario TokenAI-zer y está pensada exclusivamente para Apple Silicon, manteniendo la cabeza MTP (multi-token prediction) del modelo original para decodificación especulativa. El resultado es un paquete de 16,31 GiB de pesos (17,52 GB) repartidos en cuatro shards de safetensors, frente a los aproximadamente 55 GB que ocuparía el modelo en BF16.

El modelo resuelve un nicho muy concreto: asistentes de investigación en seguridad ofensiva y defensiva autorizada, pentesting, análisis de vulnerabilidades, CTF y codificación segura. Su arquitectura es multimodal (Qwen3_5ForConditionalGeneration), con 64 capas de texto, tamaño oculto de 5120 y una torre de visión de 333 tensores en BF16, lo que le permite procesar imágenes además de texto. El límite de contexto configurado es de 262.144 tokens, aunque el contexto usable real depende de la memoria disponible en el equipo.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 28.000 millones de parámetros especializado en seguridad en hardware de consumo Apple, algo impensable hace poco con modelos de este tamaño. La contrapartida es que la cuantización es con pérdida, no hay benchmarks publicados posteriores a la cuantización y la licencia es un término propio del autor upstream que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal texto+visión), 64 capas de texto, hidden size 5120, torre de visión de 333 tensores en BF16 |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens en configuración; el contexto usable depende de la memoria disponible |
| Tipos de cuantizacion | Mixta 4/5/6/8 bits, afín, group size 64 (esquema oMLX oQ4); 259 módulos a 4 bits, 236 a 5 bits, 4 a 6 bits y 6 a 8 bits |
| Idiomas soportados | en (inglés) |
| Licencia | qwensploit-upstream-terms (licencia propia del autor upstream, enlazada en LICENSE-NOTICE.md) |
| Formato de pesos | safetensors MLX (4 shards, 16,31 GiB / 17,52 GB); no es GGUF ni PyTorch |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.8-27B con arquitectura transformer densa multimodal, adaptado mediante QLoRA por xtools-at para tareas de ciberseguridad. La variante aquí descrita conserva la arquitectura completa, incluida la torre de visión, y añade una cabeza MTP (multi-token prediction) de una capa oculta y 29 tensores en el índice de pesos, que habilita decodificación especulativa cuando el runtime la soporta. La cuantización se aplica de forma selectiva por módulo, con un esquema mixto que asigna 4 bits a la mayoría de módulos (259), 5 bits a 236, 6 bits a 4 y 8 bits a 6, buscando preservar la precisión en las capas más sensibles sin disparar el tamaño en disco.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos se remiten a la model card upstream de xtools-at. La línea de descendencia es explícita: Qwen3.8-27B → Qwen3.8-27B-CodeForge-3xMerge → Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic → Qwensploit-V2-27B-CyberSecurity-Qwen3.8 → esta cuantización. La innovación técnica destacable de esta variante es doble: el esquema de cuantización mixta oQ4, que reduce el peso a un 30 % del BF16, y la retención de la cabeza MTP para acelerar la decodificación en Apple Silicon. El autor reporta una prueba de humo de 56,2 tok/s en un Apple M5 Max con 128 GB, con MTP activado, un prompt de 63 tokens y unos 600 tokens generados con `reasoning_effort: low`; se trata de una única medición corta, no de un benchmark.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento configurable (`reasoning_effort` con valores `xhigh`, `medium` y `low`, y `enable_thinking: false` para omitirlo).
- Conocimiento especializado en ciberseguridad: pentesting, red team, investigación de vulnerabilidades, codificación segura, CTF y seguridad defensiva.
- Capacidades multimodales de imagen a texto gracias a la torre de visión integrada (pipeline `image-text-to-text`).
- Generación y análisis de código, con énfasis en código de explotación, scripts de auditoría y parches de seguridad.
- Decodificación especulativa mediante la cabeza MTP incluida, que acelera la generación cuando el runtime la activa.
- Conversación multi-turno con plantilla de chat compatible con Qwen3.5 y parser de razonamiento `qwen_3_5`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: el autor indica explícitamente que no está diseñado como agente autónomo, sino como asistente de investigación y análisis.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Auditoría de código en busca de vulnerabilidades: el modelo puede revisar fragmentos de código y señalar patrones inseguros, inyecciones, desbordamientos o malas prácticas criptográficas, aprovechando su especialización en codificación segura y su contexto de hasta 262.144 tokens para analizar módulos completos.
- Pentesting autorizado: como asistente para redactar comandos de reconocimiento, interpretar salidas de herramientas y proponer vectores de escalada en entornos de laboratorio, siempre con revisión humana de cada comando generado.
- Resolución de retos CTF: análisis de binarios descritos en texto o en capturas de pantalla (gracias a la torre de visión), razonamiento sobre técnicas de explotación y generación de scripts de resolución.
- Investigación de vulnerabilidades: apoyo en la redacción de informes técnicos, reproducción de PoCs en entornos controlados y análisis de CVEs a partir de descripciones y parches.
- Formación y concienciación en seguridad: generación de escenarios de phishing simulado, ejercicios de blue team y explicaciones didácticas de técnicas de ataque y defensa, con el modo de razonamiento ajustable para adaptar la profundidad.
- Análisis de imágenes técnicas: interpretación de diagramas de red, capturas de pantalla de consolas, paneles de administración o tráfico capturado, combinando la torre de visión con el razonamiento especializado.
- Asistente local en Apple Silicon para investigadores: despliegue en un MacBook o Mac Studio con oMLX para trabajar con material sensible de seguridad sin enviar datos a servicios en la nube, gracias a los 16,31 GiB de pesos que caben en memoria unificada de 32 GB o más.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta variante no tiene resultados de benchmark posteriores a la cuantización. La única métrica publicada es una prueba de humo de velocidad: 56,2 tok/s en decodificación con un Apple M5 Max de 128 GB, MTP activado, prompt de 63 tokens y unos 600 tokens generados con `reasoning_effort: low`, frente a 42,7 tok/s de la variante oQ8 en las mismas condiciones.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 16,31 GiB (17,52 GB) en disco; en memoria se necesita ese espacio más el overhead del runtime, la caché KV y el contexto. Con contexto corto, un equipo con 24-32 GB de memoria unificada es el mínimo razonable; para aprovechar contextos largos se recomienda 64 GB o más.
- Hardware objetivo: Apple Silicon exclusivamente (el formato es MLX safetensors). El autor reporta pruebas en un Apple M5 Max con 128 GB.
- GPU NVIDIA: no es compatible de forma nativa con este repositorio; para CUDA habría que usar el BF16 original o los GGUF de xtools-at o mradermacher.
- GPU de consumo: cabe en Mac con memoria unificada de 32 GB o superior; no está pensado para GPUs discretas de consumo.
- Opciones de despliegue: oMLX (`omlx serve --model-dir ...`), con el parser de razonamiento `qwen_3_5` y la cabeza MTP activada para aprovechar la decodificación especulativa. Otros runtimes MLX con soporte de visión Qwen3.5 también deberían funcionar.
- Latencia y throughput: 56,2 tok/s de decodificación en la prueba de humo citada; sin datos de prefill ni de rendimiento con contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ4-mtp (esta ficha) | 27,78 B | 262.144 | MLX safetensors mixto 4/5/6/8 bits, 16,31 GiB | qwensploit-upstream-terms | Solo Apple Silicon, con cabeza MTP, 56,2 tok/s en M5 Max |
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ8-mtp | 27,78 B | 262.144 | MLX safetensors 8 bits uniforme, 27,94 GiB | qwensploit-upstream-terms | Misma familia, más fiel a BF16, 42,7 tok/s en la misma prueba |
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8 (BF16) | 27,78 B | 262.144 | safetensors transformers BF16 | qwensploit-upstream-terms | Modelo fuente, requiere hardware con mucha memoria o GPUs de datacenter |
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF (xtools-at / mradermacher) | 27,78 B | 262.144 | GGUF (estático e imatrix) | qwensploit-upstream-terms | Alternativa para llama.cpp y GPUs NVIDIA/AMD; cuantizaciones no verificadas en esta ficha |

## Limitaciones y advertencias

- La cuantización es con pérdida y no hay benchmarks publicados que midan la degradación respecto al BF16; en tareas de seguridad, donde un detalle técnico importa, conviene validar las salidas contra el modelo original.
- El modelo está especializado en seguridad ofensiva y deriva de una línea "UNCENSORED-heretic"; existe riesgo real de generar contenido dañino si se usa fuera de los casos legítimos previstos. El autor restringe el uso a investigación, educación, defensa y pentesting autorizado.
- Riesgo de alucinación en comandos, rutas, nombres de herramientas y detalles de vulnerabilidades; el autor recomienda revisar cada comando, código y recomendación antes de ejecutarlo.
- No es un agente autónomo: no debe encadenarse sin supervisión humana en entornos productivos o con acceso a sistemas reales.
- Solo soporta inglés según los metadatos; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El límite de 262.144 tokens es arquitectónico, no una garantía de memoria; con contextos largos el consumo de caché KV puede exceder la memoria disponible en equipos de 32 GB.
- La licencia `qwensploit-upstream-terms` es un término propio del autor upstream, no una licencia estándar; hay que leer LICENSE-NOTICE.md antes de usar o redistribuir los pesos, especialmente en contextos comerciales.
- Este repositorio es una cuantización no oficial; el autor de la misma no está afiliado a xtools-at y no asume responsabilidad sobre el modelo fuente.
- Formato MLX exclusivo: no es portable a CUDA, ROCm ni a la mayoría de stacks de servidor sin reconvertir.
- Sin descargas ni likes en el momento de redactar esta ficha, lo que implica ausencia de validación comunitaria.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/TokenAI-zer/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ4-mtp
- Variante oQ8 de la misma familia: https://huggingface.co/TokenAI-zer/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ8-mtp
- Modelo fuente BF16 (xtools-at): https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- GGUF del autor: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF
- GGUF imatrix de mradermacher: https://huggingface.co/mradermacher/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-i1-GGUF
- Colección Qwensploit (9B, 4B, 2B, 0.8B): https://huggingface.co/collections/xtools-at/qwensploit-cybersec-6ad62fa5c989cb6b06b36423
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Merge intermedio CodeForge-3xMerge: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Variante heretic intermedia: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Aviso de licencia: https://huggingface.co/TokenAI-zer/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ4-mtp/blob/main/LICENSE-NOTICE.md
