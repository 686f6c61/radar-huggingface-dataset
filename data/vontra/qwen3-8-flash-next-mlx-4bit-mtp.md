# Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP

## Resumen

Este repositorio contiene una conversión uniforme en cuantización de 4 bits para Apple Silicon del modelo Qwen3.8-Flash-Next, desarrollada por Vontra a partir del checkpoint oficial BF16 de Qwen. Qwen3.8-Flash-Next es un modelo multimodal de arquitectura `qwen4_exp` (preview de la futura familia Qwen4) que combina un encoder de visión con un stack de lenguaje basado en Gated DeltaNet, Qwen Sparse Attention, capas de mezcla de expertos (MoE) ultra dispersas y un bloque nativo de predicción de siguiente token (MTP) para decodificación especulativa. El modelo base declara 125 mil millones de parámetros totales, de los cuales se activan aproximadamente 6 mil millones por token, y soporta una ventana de contexto de 262 144 tokens.

La conversión de Vontra mantiene íntegramente el tokenizer, la plantilla de chat, el procesador de visión, la configuración de generación y la licencia del modelo original. La cuantización afín de 4 bits con tamaño de grupo 32 se aplica a los módulos de lenguaje y al bloque MTP, mientras que los módulos multimodales y las puertas del router MoE se conservan en BF16. El resultado es un checkpoint de 113,2 GB en formato MLX safetensors, pensado para ejecutarse en entornos oMLX y MLX-VLM con soporte explícito de `qwen4_exp` y MTP nativo. Su relevancia radica en permitir la ejecución local de un modelo de 125B en hardware Apple Silicon con un rendimiento de generación medido de 31,44 tokens por segundo con MTP activado en una Apple M3 Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + MoE) |
| Parametros totales | 34 169 049 459 (según safetensors; el modelo base declara 125B) |
| Parametros activos | 6B por token (según documentación del modelo base) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | 4-bit affine (group size 32); módulos multimodales y router gates en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | MLX safetensors (22 shards, 113,2 GB) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo de lenguaje causal con encoder de visión. Su stack de lenguaje combina cuatro ideas principales: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de forma recurrente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. Sobre esta base híbrida se superponen capas de mezcla de expertos ultra dispersas, flujos residuales gated ensanchados, embeddings de bigramas y trigramas con hash (tabla de 51B de parámetros adicionales) y un bloque nativo de predicción de siguiente token (MTP) que actúa como drafter para decodificación especulativa. El modelo activa aproximadamente 6B parámetros por token, lo que lo hace eficiente en inferencia pese a su tamaño total.

La conversión de Vontra se realizó directamente desde el checkpoint BF16 oficial, aplicando cuantización afín uniforme de 4 bits con grupo de tamaño 32 a los módulos de lenguaje y al bloque MTP. Los módulos multimodales (encoder de visión) y las puertas del router MoE se mantienen en BF16 para preservar la precisión en esas rutas críticas. El repositorio incluye 3 747 tensores indexados, de los cuales 76 corresponden al bloque MTP. No se dispone de información sobre el entrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto, y produce respuestas de texto (pipeline `image-text-to-text`).
- Razonamiento avanzado: el modelo base está diseñado para tareas de razonamiento complejo, aunque no se especifican benchmarks concretos en la información disponible.
- Decodificación especulativa nativa: incluye un bloque MTP (Qwen4Exp draft) que acelera la generación sin cambiar la salida greedy, con una tasa de aceptación medida del 68,23 % en Apple M3 Studio.
- Ventana de contexto larga: 262 144 tokens, adecuada para documentos extensos o conversaciones multi-turno con historial amplio.
- Soporte de visión: el encoder de visión permite procesar imágenes junto con texto, aunque no se detallan tareas específicas de visión (VQA, captioning, etc.).
- Eficiencia en Apple Silicon: al ser una conversión MLX, está optimizada para ejecución en hardware Apple con memoria unificada.

## Casos de uso

- Asistente multimodal local en Mac: un usuario puede cargar el modelo en oMLX y utilizarlo como asistente personal que analiza capturas de pantalla, diagramas o fotografías y responde preguntas sobre ellas, aprovechando la ventana de 262K tokens para mantener conversaciones largas.
- Análisis de documentos extensos con imágenes: gracias al contexto de 262 144 tokens y la entrada visual, el modelo puede resumir informes largos que incluyan gráficos, tablas o figuras, extrayendo información relevante de forma conjunta.
- Generación de código con contexto amplio: el modelo puede recibir un repositorio completo o fragmentos de código extensos y generar nuevas funciones, refactorizaciones o explicaciones, apoyándose en su capacidad de razonamiento y en la ventana larga.
- Decodificación especulativa en producción: el bloque MTP integrado permite acelerar la generación de texto en entornos oMLX sin sacrificar la exactitud de la salida, útil para servicios de chat o API con requisitos de latencia.
- Investigación en arquitecturas híbridas: al ser un preview de la arquitectura Qwen4, sirve como banco de pruebas para estudiar la combinación de Gated DeltaNet, Qwen Sparse Attention y MoE ultra disperso en tareas multimodales.
- Prototipado de aplicaciones de visión-lenguaje en Apple Silicon: desarrolladores pueden integrar el modelo en aplicaciones macOS o iOS mediante MLX-VLM para crear herramientas de anotación de imágenes, búsqueda visual o asistencia contextual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones de rendimiento de generación en una Apple M3 Studio con oMLX 0.6.3rc3, que se resumen a continuación:

| Modo de ejecución | Velocidad de generación (mediana) | Tokens redactados | Aceptados | Tasa de aceptación |
|---|---|---|---|---|
| MTP deshabilitado | 27,83 tokens/s | No aplica | No aplica | No aplica |
| MTP habilitado (3 tokens de draft) | 31,44 tokens/s | 960 | 655 | 68,23 % |

El incremento de rendimiento con MTP fue del 12,97 %. Se verificó paridad exacta de salida, coherencia y captura de telemetría MTP. Estas cifras corresponden a generación de texto únicamente, con decodificación greedy y semilla fija.

## Requisitos de hardware

- El checkpoint ocupa 113,2 GB en disco, por lo que se necesita una Mac con memoria unificada de al menos 128 GB para cargar el modelo completo en RAM (los pesos se cargan en memoria unificada).
- GPU recomendada: Apple Silicon con soporte MLX; las pruebas se realizaron en una Apple M3 Studio, pero cualquier chip M-series con suficiente memoria unificada debería ser compatible.
- No se proporcionan datos de VRAM para GPUs NVIDIA ni de latencia/throughput en otros entornos.
- Opciones de despliegue: oMLX (con soporte nativo de MTP), MLX-VLM para construcción y carga, y el runtime MLX estándar. Se requiere una versión con soporte explícito de `qwen4_exp` y MTP; versiones antiguas no son compatibles.
- Para uso en CPU o GPU no Apple, no se dispone de información; el formato MLX está orientado a Apple Silicon.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Como referencia cualitativa, el modelo base Qwen3.8-Flash-Next (BF16) tiene 125B parámetros totales y activa 6B por token, mientras que esta conversión cuantizada reduce el tamaño a 113,2 GB (frente a los aproximadamente 250 GB del BF16) a costa de una posible pérdida de precisión por la cuantización 4-bit. Otras conversiones MLX de modelos MoE multimodales de tamaño similar no están documentadas en las fuentes consultadas.

## Limitaciones y advertencias

- Requiere un runtime con soporte explícito de la arquitectura `qwen4_exp` y del módulo MTP nativo; un runtime que no construya el módulo Qwen4Exp MTP puede rechazar los 76 tensores MTP durante la carga estricta.
- No se debe adjuntar un drafter de Qwen3.8 27B, ya que Flash Next tiene dimensiones ocultas diferentes e incluye su propio bloque MTP compatible.
- La cuantización 4-bit puede introducir degradación en la calidad de generación en comparación con el checkpoint BF16 original, especialmente en tareas que requieren alta precisión numérica.
- La licencia qwen-community-1.0 impone condiciones de uso; es necesario revisar sus términos para uso comercial y redistribución.
- No se han documentado sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas específicas en la información disponible.
- El rendimiento medido (31,44 tokens/s) corresponde a un entorno concreto (Apple M3 Studio, oMLX 0.6.3rc3) y puede variar según la carga, la longitud del prompt, el estado de la caché y las condiciones térmicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Licencia Qwen Community 1.0: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP/blob/main/LICENSE
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Documentación de SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
