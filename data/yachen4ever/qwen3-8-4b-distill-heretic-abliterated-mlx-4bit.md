# yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-MLX-4bit

## Resumen

El modelo `yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-MLX-4bit` es una cuantización en 4 bits, en formato MLX, de un modelo de lenguaje y visión derivado de la familia Qwen. El autor, `yachen4ever`, ha tomado el modelo `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated` (que a su vez es una versión abliterada del destilado `empero-ai/Qwen3.8-4B-Distill`) y lo ha convertido con `mlx_vlm.convert` para preservar el encoder de visión, algo que las conversiones habituales con `mlx_lm.convert` pierden silenciosamente. El resultado es un modelo de texto e imagen que mantiene toda la arquitectura Qwen3.5 (32 capas, 2560 unidades ocultas) y que, gracias a la técnica de abliteración Heretic v1.4.0, presenta una tasa de rechazo de instrucciones notablemente reducida (0/3 en pruebas frente a 1/3 en el modelo base).

Este modelo resuelve dos problemas prácticos: por un lado, ofrece una alternativa ligera (2,8 GB de peso, memoria pico de ~3,6 GB) para ejecutar en Apple Silicon con Metal; por otro, proporciona una versión «sin censura» que responde a instrucciones que los modelos alineados suelen rechazar, sin sacrificar las capacidades de visión. Su relevancia actual radica en la combinación de visión, cuantización eficiente para hardware Apple y un perfil de comportamiento poco restrictivo, orientado a desarrolladores que necesitan generar contenido creativo o educativo sin los bloqueos típicos de la alineación estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso, 32 capas, 2560 hidden) |
| Parámetros totales | 5B según la model card (incluye ~1B del encoder de visión; el archivo safetensors reporta 991.474.176 elementos, posiblemente parcial) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la información proporcionada) |
| Tipos de cuantización | 4-bit (group_size=64, affine mode) para el modelo de lenguaje; encoder de visión en BF16 sin cuantizar |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX, cuantizado 4-bit) |

## Arquitectura y entrenamiento

El modelo es una destilación completa de Qwen3.8 (2.4T parámetros, MoE) dentro de la arquitectura densa de Qwen3.5-4B. El estudiante se entrenó sobre aproximadamente 45.000 trazas de razonamiento del profesor, seleccionadas por calidad, abarcando matemáticas, razonamiento general y seguimiento de instrucciones. Sobre este destilado se aplicó una ablación de resistencias con la herramienta Heretic v1.4.0, que reduce la probabilidad de que el modelo emita rechazos (pasa de 99/100 a 6/100 en pruebas del autor). Posteriormente, el modelo se cuantizó a 4 bits con `mlx_vlm.convert` (v0.6.15), que conserva los 297 pesos del encoder de visión en BF16 mientras cuantiza los 924 pesos del modelo de lenguaje. La conversión mantiene la arquitectura completa de `Qwen3_5ForConditionalGeneration`, con 32 capas y 2560 unidades ocultas. No se han publicado detalles sobre el conjunto de datos exacto de la destilación más allá de las trazas del profesor, ni se indica el uso de RLHF o DPO adicional tras la ablación.

## Capacidades

- Generación de texto y razonamiento matemático (multiplicación, división con decimales, etc.) con precisión verificada en pruebas.
- Comprensión y descripción de imágenes (identificación de colores, lectura de gráficos de barras, inyección de tokens de visión de 256 tokens para imágenes de 512×512).
- Conversación multilingüe en inglés y chino (el chino muestra descripciones más detalladas en comparación con el modelo base).
- Comportamiento «uncensored»: no rechaza instrucciones de tipo «how-to» (por ejemplo, cómo abrir una cerradura con fines educativos) ni historias ficticias con contenido sensible.
- No se menciona soporte para tool calling, function calling ni razonamiento multi-paso más allá del chain-of-thought básico.

## Casos de uso

- **Asistente de atención al cliente sin restricciones temáticas**: el modelo puede gestionar consultas sobre temas delicados o controvertidos (por ejemplo, reclamaciones sobre productos de salud o asesoramiento legal básico) sin rechazos automáticos, lo que reduce el número de escalados a agentes humanos.
- **Generación de contenido creativo para ficción**: gracias a la ablación, puede escribir historias con temas adultos, conflictos morales o escenas violentas sin censura previa, útil para guionistas y autores que trabajan con narrativas complejas.
- **Descripción y análisis de imágenes en entornos de documentación**: el modelo puede describir diagramas, gráficos o capturas de pantalla (p. ej., de una aplicación) para generar documentación técnica automática en inglés o chino.
- **Soporte educativo de matemáticas**: con precisión en operaciones aritméticas y razonamiento, puede servir como tutor que explica paso a paso problemas de cálculo y álgebra, incluso en chino.
- **Procesamiento de formularios y documentos con imágenes**: en un pipeline de MLX en Apple Silicon, puede extraer información de imágenes de formularios escaneados y responder preguntas sobre su contenido, gracias al encoder de visión preservado.
- **Prototipado de chatbots de rol**: su baja tasa de rechazo y su capacidad multilingüe lo hacen adecuado para simular personajes con personalidades complejas o temas tabú, en entornos de desarrollo de juegos o narrativa interactiva.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks estándar (MMLU, HumanEval, GSM8K). El autor proporciona una comparativa directa con el modelo base `Qwen3.5-4B-MLX-4bit` en pruebas de velocidad y calidad:

| Prueba | Qwen3.5-4B-MLX-4bit | Este modelo |
|---|---|---|
| Velocidad de generación de texto (tok/s) | 132,5 | 134,8 |
| Velocidad de generación con visión (tok/s) | 108,7 | 108,8 |
| Prefill de visión (256 tokens, tok/s) | 926 | 925 |
| Multiplicación 17 × 23 | 391 ✓ | 391 ✓ |
| Suma 156 + 879 | 1035 ✓ | 1035 ✓ |
| División 1000 ÷ 7 (2 decimales) | No da número | 142.857 ✓ |
| Descripción de gráfico de barras | Correcta (3 rectángulos, R/B/G) | Correcta (3 rectángulos, R/B/G, orden de altura) |
| Identificación de 5 colores | 5/5 correcto | 5/5 correcto |
| Refusals (3 prompts de prueba) | 1/3 | 0/3 |

No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: ~3,6 GB en pico de memoria durante inferencia (según la model card).
- **GPU recomendadas**: diseñado para Apple Silicon con Metal (probado en M2 Ultra de 192 GB). No se mencionan GPUs NVIDIA ni CUDA.
- **¿Cabe en consumer GPU?**: Sí, en cualquier Mac con Apple Silicon y al menos 4 GB de RAM unificada (por ejemplo, M1 o superior). No aplicable a GPUs de consumo de otras marcas.
- **Opciones de despliegue**: MLX (librería `mlx_vlm`), servidor `mlx-serve` con API compatible con OpenAI. No se mencionan vLLM, llama.cpp ni Ollama.
- **Latencia y throughput**: ~150 tok/s en M2 Ultra (Metal), según la card. La velocidad de generación es similar a la del modelo base.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Visión | Licencia | Refusal rate (prueba) |
|---|---|---|---|---|---|---|
| `Qwen3.8-4B-Distill-Heretic-Abliterated-MLX-4bit` (este) | Qwen3.5-4B + encoder visión | 5B (4B lenguaje + 1B visión) | No disponible | Sí | Apache 2.0 | 0/3 |
| `Qwen3.5-4B-MLX-4bit` (mlx-community) | Qwen3.5-4B | 4B | No disponible | Sí | Apache 2.0 | 1/3 |
| `empero-ai/Qwen3.8-4B-Distill` (original) | Qwen3.5-4B + visión | 5B | No disponible | Sí | Apache 2.0 | No reportado |

La comparativa muestra que el modelo abliterado tiene menor tasa de rechazo que su base, manteniendo la misma velocidad y precisión en tareas de visión y aritmética.

## Limitaciones y advertencias

- **Abliteración**: la eliminación de la alineación de seguridad reduce las resistencias a contenido dañino (instrucciones peligrosas, violencia, etc.). El modelo puede generar respuestas que no serían aceptables en entornos comerciales con políticas de moderación estrictas.
- **Sesgos**: al basarse en Qwen3.5, puede heredar sesgos culturales o de género presentes en los datos de entrenamiento. No hay documentación sobre mitigación de sesgos.
- **Alucinación**: no se han evaluado tasas de alucinación en contextos de hechos o información factual; es probable que presente las mismas limitaciones que otros modelos de 4B.
- **Idiomas**: solo se garantizan inglés y chino; el rendimiento en otros idiomas no está verificado.
- **Contexto**: no se especifica la longitud de contexto del modelo; si no se hereda de Qwen3.5 (128K), podría ser menor en la versión destilada.
- **Cuántización 4-bit**: puede degradar la calidad en tareas de razonamiento complejo o matemáticas avanzadas, aunque las pruebas básicas muestran buena precisión.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la ablación de seguridad podría generar responsabilidad legal si se usa para contenido dañino.
- **Plataforma**: exclusivo para Apple Silicon (MLX); no es compatible con CUDA ni ROCm.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-MLX-4bit)
- [Modelo original abliterado (insraq)](https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated)
- [Modelo destilado base (empero-ai)](https://huggingface.co/empero-ai/Qwen3.8-4B-Distill)
- [Repositorio de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [mlx-vlm (GitHub)](https://github.com/ml-explore/mlx-vlm)
- [mlx-serve (GitHub)](https://github.com/Blaizzy/mlx-serve)
- [Gist con pruebas en M2 Ultra](https://gist.github.com/yachen4ever/8a82f5c76d325c88b37b3599a5581475)
