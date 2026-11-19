# yuandouZ/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de lenguaje con codificador de visión publicado por el equipo Qwen (Alibaba) bajo el identificador `yuandouZ/Qwen3.8-Flash-Next`. Se presenta como la primera release de pesos abiertos de la arquitectura que servirá de base para Qwen4, y su objetivo declarado es explorar cómo escalar de forma eficiente en lugar de simplemente acumular parámetros y contexto. Combina atención híbrida (Gated DeltaNet + Qwen Sparse Attention), un esquema de Mixture-of-Experts con 512 expertos, embeddings de n-gramas y un diseño de residuales con compuertas.

El modelo tiene 125.000 millones de parámetros en el LM con 6.000 millones activados por token, más 51.000 millones en embeddings de n-gramas y 4.000 millones en una cabeza MTP, lo que da un total de 179.999.981.459 parámetros según los safetensors del repositorio (360 GB). Soporta entrada de imagen y texto, contexto nativo de 262.144 tokens extensible hasta 1.000.000, y está pensado para cargas agénticas de contexto largo donde la latencia importa.

Su relevancia ahora es doble: por un lado anticipa decisiones arquitectónicas de la próxima generación de Qwen; por otro, ofrece un punto de partida abierto (licencia qwen-community-1.0) para investigadores que quieran medir el impacto de QSA, Gated Residual o los embeddings de n-gramas en un modelo de escala frontier. La versión productiva gestionada, con 1M de contexto por defecto y herramientas integradas, se comercializa como Qwen3.8-Flash en Qwen Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: Gated DeltaNet + Qwen Sparse Attention (QSA), MoE y Gated Residual |
| Parametros totales | 179.999.981.459 (125B LM con 6B activados + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B por token (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo sigue un layout de 48 capas organizado como 12 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. La dimensión oculta es 2560, el vocabulario de entrada y salida es de 248.320 tokens (con padding) y el embedding de n-gramas indexa 20.000.000 de bigramas y trigramas en la capa 2. Gated DeltaNet usa 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; QSA usa 24 cabezas de query y 2 de KV con dimensión 256, RoPE de 64 dimensiones y un indexador MQA (4 cabezas de query, 1 cabeza de clave compartida, dimensión 128) con presupuesto de 512 bloques o 2048 tokens. El MoE tiene 512 expertos con dimensión intermedia 640, y el Gated Residual emplea 4 ramas con rango de cuello de botella 320. La cabeza MTP consta de una capa entrenada con múltiples pasos.

Las innovaciones declaradas son cuatro. QSA selecciona micro-bloques en lugar de tokens individuales, lo que reduce la latencia en contexto largo. Gated Residual modula el flujo de información mediante una compuerta de lectura elemental dependiente de datos y una compuerta escalar de escritura por rama, preservando estabilidad de entrenamiento con bajo coste de inferencia. Los embeddings de n-gramas permiten escalar parámetros con menos cómputo y son aptos para offloading en aceleradores con memoria limitada. La receta de entrenamiento aplica Muon y AdamW a categorías de pesos específicas, elimina el warmup de batch size (arranque directo en el batch objetivo) y usa learning rates mayores, guiada por leyes de escala reajustadas. El modelo pasa por pre-entrenamiento y post-entrenamiento; no se detalla en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text` con codificador de visión).
- Procesamiento de contexto largo: 262.144 tokens nativos, ampliable a 1.000.000.
- Cargas agénticas y razonamiento multi-paso, con latencia reducida en contexto largo gracias a QSA.
- Decodificación especulativa mediante la cabeza MTP de una capa entrenada con múltiples pasos.
- Compatibilidad con tool calling y function calling a través de los servidores de inferencia soportados (vLLM, SGLang, TokenSpeed); la versión gestionada Qwen3.8-Flash incluye herramientas integradas oficiales.
- Capacidades multilingües: no disponible el detalle de idiomas.
- Modo de pensamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede sostener conversaciones multi-turno con historiales extensos sin truncar, gracias a los 262.144 tokens de contexto nativo y a la extensión hasta 1M, manteniendo coherencia en hilos largos de soporte.
- Análisis de documentos extensos y contratos: ingestión de manuales, expedientes o informes de cientos de miles de tokens en una sola pasada, con QSA reduciendo la latencia frente a atención densa.
- Agentes autónomos con tool calling: integración en bucles de razonamiento multi-paso donde el modelo decide qué herramienta invocar; los 6B parámetros activos mantienen el coste por token contenido.
- Generación y revisión de código en pipelines de CI/CD: uso vía vLLM o SGLang para revisar diffs, generar tests o explicar errores, con la cabeza MTP acelerando la decodificación especulativa.
- Asistentes multimodales sobre capturas y diagramas: al aceptar image-text-to-text, puede interpretar diagramas de arquitectura, capturas de error o tablas escaneadas junto a instrucciones textuales.
- Investigación sobre arquitecturas eficientes: al ser un preview experimental de la arquitectura Qwen4, sirve para reproducir y medir el efecto de Gated Residual, n-gram embeddings y QSA en cargas reales.
- Procesamiento por lotes de corpus largos: clasificación, extracción de entidades o resumen de grandes volúmenes documentales con contexto amplio y despliegue en clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de resultados, pero los datos numéricos no están presentes en la información proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los 180.000 millones de parámetros en safetensors ocupan 360 GB en el repositorio; en FP8 el peso rondaría los 180 GB y en cuantizaciones de 4 bits aproximadamente 90 GB, sin contar caché KV ni overhead. Estas cifras son estimaciones de orden de magnitud, no datos publicados.
- GPU recomendadas: despliegue multi-GPU en A100 80 GB, H100 80 GB o H200; el tamaño excede con holgura cualquier GPU de consumo individual.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones de una sola tarjeta consumer; requeriría offloading agresivo a CPU o disco, con latencia muy degradada.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se menciona soporte explícito de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura está diseñada para reducir latencia en contexto largo mediante QSA y para acelerar decodificación con MTP, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B (125B LM + 51B n-gram + 4B MTP) | 6B | 262K nativo, hasta 1M | qwen-community-1.0 | Pesos en Hugging Face; API en Qwen Cloud (Qwen3.8-Flash) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como preview de la arquitectura de Qwen4, no como una release estable para producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas principales sin evaluación propia.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasas de error.
- No se detallan sesgos conocidos ni resultados de evaluaciones de seguridad en la información disponible.
- Licencia qwen-community-1.0 con cláusulas específicas: es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- Requisitos de hardware muy elevados (360 GB de pesos): inviable en infraestructura de consumo y costoso incluso en clústeres multi-GPU.
- El contexto de 1M es una extensión sobre los 262K nativos; el rendimiento en esa ventana extendida no está cuantificado.
- La información sobre cuantizaciones disponibles y su calidad no está publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuandouZ/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (versión gestionada Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com
