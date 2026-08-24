# SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked

## Resumen

SwissNeuron (Qwen3.8-27B-SwissNeuron-Derisked) es un modelo de lenguaje de 27.36 mil millones de parámetros desarrollado por SwissNeuron, una entidad con sede en Suiza, como derivado del modelo oficial Qwen/Qwen3.8-27B de Alibaba. El modelo está diseñado para trabajo técnico directo, razonamiento sólido y retención de capacidades, combinando un post-entrenamiento interno enfocado con un procedimiento conservador de "derisking" geométrico que elimina direcciones específicas en el espacio de representación sin degradar el rendimiento general. Su relevancia actual radica en ofrecer una alternativa de código abierto con una ventana de contexto ampliada a 1 millón de tokens mediante extensión YaRN, manteniendo la arquitectura híbrida de atención lineal y completa del Qwen3.8.

El modelo conserva el procesador multimodal, el tokenizador y la plantilla de chat originales de Qwen3.8, lo que permite entrada de imagen y texto, aunque el foco principal es la generación de texto. Se distribuye en BF16 sin cuantizar, con un tamaño de repositorio de 106.9 GB. La licencia se indica como "other", sin especificar términos concretos, lo que requiere verificación antes de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas de lenguaje, 48 capas Gated-DeltaNet (atención lineal) y 16 capas de atención completa (intervalo 4) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (configurado mediante YaRN factor 4 sobre el original de 262.144) |
| Tipos de cuantizacion | No disponible (solo BF16 en esta versión; se menciona que las ediciones cuantizadas llegarán por separado) |
| Idiomas soportados | No disponible (no se especifica en la información proporcionada) |
| Licencia | other (términos no detallados; se recomienda verificar con el autor) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura híbrida de Qwen3.8/Qwen3.5: de las 64 capas de transformador, 48 utilizan Gated-DeltaNet (una forma de atención lineal con estado recurrente) y 16 emplean atención completa (gated attention), con un intervalo de atención completa de 4. Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de razonamiento. El modelo incluye una capa MTP (multi-token prediction) como cabezal de decodificación especulativa, un procesador multimodal para entrada de imagen y un vocabulario de 248.320 tokens.

El entrenamiento de SwissNeuron partió del checkpoint oficial Qwen3.8-27B BF16 y consistió en un post-entrenamiento enfocado sobre un corpus interno de respuestas directas, excluyendo formatos de verificación rígidos. Posteriormente se aplicó un procedimiento de "derisking" geométrico con un banco de direcciones recapturado del propio modelo entrenado, usando una fuerza baja (α=0.1), una sola pasada, omitiendo las dos primeras capas y preservando las normas globales de los pesos. El objetivo era alterar el comportamiento minimizando el movimiento fuera del subespacio de representación objetivo. La extensión a 1M de contexto es una configuración a nivel de YaRN (factor 4) sin una etapa de adaptación específica a contexto largo, por lo que la calidad en el extremo de la ventana puede variar según el stack de inferencia.

## Capacidades

- Generación de texto y razonamiento: soporta modo "thinking" nativo (activado con `enable_thinking=True`) para tareas de razonamiento intensivo, y modo sin pensamiento para menor latencia.
- Entrada multimodal: conserva el procesador de visión de Qwen3.8, permitiendo procesar imágenes junto con texto (image-text-to-text).
- Generación de código: el modelo base Qwen3.8-27B destaca en tareas de programación, y SwissNeuron mantiene esa capacidad según las pruebas de regresión internas.
- Tool calling y function calling: no se menciona explícitamente, pero al derivar de Qwen3.8, que soporta estas funciones, es probable que las herede; sin embargo, no hay confirmación en la documentación proporcionada.
- Soporte de agentes: el modo thinking y la plantilla de chat incluida permiten integración en harnesses de agentes, seleccionando el modo mediante la plantilla.
- Multilingüismo: no se especifican idiomas soportados; el modelo base Qwen3.8 es multilingüe, pero no hay datos concretos para este derivado.
- Contexto largo: ventana configurada de 1.048.576 tokens mediante YaRN, aunque sin adaptación específica, por lo que la calidad puede degradarse en los extremos.

## Casos de uso

- Análisis de documentos extensos: con la ventana de 1M tokens, puede procesar libros técnicos, informes financieros o expedientes legales completos en una sola pasada, extrayendo información y resumiendo secciones relevantes. La arquitectura híbrida reduce el coste de atención en contextos largos, aunque se debe validar la calidad en el extremo de la ventana.
- Razonamiento técnico y resolución de problemas: el modo thinking permite descomponer problemas complejos de ingeniería, matemáticas o lógica en pasos intermedios, útil para asistentes de investigación o herramientas de análisis.
- Generación de código en producción: puede integrarse en pipelines de CI/CD para generar, revisar o documentar código, aprovechando su capacidad de programación y el soporte de MTP para una decodificación más rápida. Requiere un servidor compatible con la arquitectura híbrida.
- Asistente de atención al cliente especializado: con la plantilla de chat y el modo sin pensamiento, puede gestionar conversaciones multi-turno con contexto largo, manteniendo coherencia en interacciones prolongadas. La baja latencia del modo no-thinking es adecuada para entornos de producción.
- Procesamiento de documentos con imágenes: al conservar el procesador multimodal, puede extraer texto de capturas, diagramas o formularios escaneados y combinarlo con razonamiento textual, útil para automatización de oficina o análisis de documentación técnica.
- Investigación en IA: como modelo abierto con pesos BF16, sirve para experimentación en técnicas de alineación, derisking o extensión de contexto, dado que su procedimiento de post-entrenamiento está documentado y es reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que en un holdout interno congelado, el modelo entrenado mejoró la likelihood y la precisión a nivel de token respecto al checkpoint oficial antes de la pasada geométrica final, pero no se proporcionan cifras concretas. Tampoco hay comparaciones con otros modelos en la documentación. Por tanto, no se dispone de datos cuantitativos de rendimiento para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 54.7 GB (27.36B × 2 bytes). A esto hay que sumar la memoria para estados KV y caché, que en contexto largo puede ser significativa incluso con la atención lineal. Para 1M de contexto, se necesitaría una GPU con al menos 80 GB de VRAM (como A100 80GB o H100) o múltiples GPUs.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 24GB con tensor parallelism). Para contextos más cortos (hasta 262K), una GPU de 48GB (como A6000) podría ser suficiente con offloading.
- Si cabe en consumer GPU: no en BF16 completo; requeriría cuantización (no publicada) para ajustarse a 24GB. Con cuantización de 4 bits, podría caber en una RTX 4090, pero no hay versiones GGUF/AWQ disponibles en esta versión.
- Opciones de despliegue: vLLM (con soporte para Qwen3.8/Qwen3.5 hybrid), TGI, y posiblemente llama.cpp si se añade soporte para Gated-DeltaNet. Se recomienda usar un servidor que soporte explícitamente `Qwen3_5ForConditionalGeneration` y los parámetros YaRN.
- Latencia y throughput: no disponibles. La arquitectura híbrida reduce el coste de atención en contextos largos, pero el MTP y el modo thinking aumentan la latencia. Se espera un throughput razonable en GPUs de data center, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwissNeuron (este) | 27.36B | 1M (configurado) | Híbrida (Gated-DeltaNet + atención completa) | other | HuggingFace, BF16 |
| Qwen3.8-27B (base) | 27.36B | 262K nativo, extensible a 1M | Híbrida (Gated-DeltaNet + atención completa) | Apache 2.0 (según Qwen) | HuggingFace, oficial |
| Qwen3-30B-A3B (MoE) | 30.5B total, 3.3B activos | 32K (extensible a 128K) | MoE con atención completa | Apache 2.0 | HuggingFace, oficial |

La comparativa se centra en el modelo base Qwen3.8-27B, del que deriva, y en un modelo MoE de tamaño similar. SwissNeuron se diferencia por su post-entrenamiento de "derisking" y la extensión de contexto a 1M, pero no se dispone de datos de rendimiento para comparar. La licencia "other" es una desventaja frente al Apache 2.0 del base, y la falta de cuantizaciones limita su despliegue en hardware consumer.

## Limitaciones y advertencias

- La extensión a 1M de contexto es solo configuración YaRN, sin una etapa de adaptación específica; la calidad de generación en los extremos de la ventana puede degradarse y depende del stack de inferencia, la estructura del prompt y la carga de trabajo. Se recomienda validar en casos de uso reales.
- La licencia "other" no especifica términos; podría no permitir uso comercial o requerir atribución. Es imprescindible contactar con el autor o revisar los archivos de licencia del repositorio antes de cualquier despliegue en producción.
- No se han publicado benchmarks ni evaluaciones independientes; las afirmaciones de mejora se basan en un holdout interno no verificado externamente.
- El procedimiento de "derisking" puede haber alterado el comportamiento en formas no documentadas; aunque se afirma que preserva capacidades, no hay garantía de que no introduzca sesgos o artefactos.
- El modelo no está cuantizado; el tamaño de 106.9 GB y los requisitos de VRAM (~55 GB solo para pesos) limitan su uso a hardware de gama alta o requieren cuantización posterior no disponible.
- No se especifican los idiomas soportados; aunque el base Qwen3.8 es multilingüe, no hay confirmación de que el post-entrenamiento no haya afectado a lenguas minoritarias.
- El soporte de tool calling y function calling no está confirmado en la documentación; aunque probablemente se herede del base, no se garantiza.
- La arquitectura híbrida requiere servidores de inferencia con soporte específico para Gated-DeltaNet y YaRN; no todos los frameworks lo implementan correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Qwen3.8 en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Página de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
