# tcclaviger/Qwen3.8-27B-RFI8-AA

## Resumen

Qwen3.8-27B-RFI8-AA es una cuantización RFI8 (activation-aware, 8 bits) del modelo Qwen3.8-27B de la familia Qwen, publicada por el usuario tcclaviger. El modelo base es un modelo de lenguaje causal con encoder de visión (pipeline image-text-to-text) de aproximadamente 27.800 millones de parámetros, con arquitectura híbrida Gated DeltaNet + Gated Attention, contexto nativo de 262.144 tokens extensible a 1.000.000, y capacidades de razonamiento con modo thinking configurable.

La cuantización RFI8 emplea pesos de 8 bits con rotación Hadamard-32 y escalas block-float de grupo 32, e incluye escalas calibradas del KV cache tanto para el modelo principal como para el modelo draft de decodificación especulativa MTP (Multi-Token Prediction). El checkpoint está optimizado para GPUs AMD RDNA4 (gfx1201) y requiere una imagen docker específica de vLLM para alcanzar el rendimiento completo; en otro hardware cae a kernels de referencia Triton con rendimiento sustancialmente menor.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de 27B con calidad casi idéntica al BF16 original (perplejidad WikiText-2 de 6,9392 frente a 6,9224) con pesos de 8 bits y KV cache en fp8, lo que duplica aproximadamente el contexto útil en la misma VRAM. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) con encoder de visión |
| Parametros totales | 27.783.983.856 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | RFI8: pesos int8, activaciones int8 (W8A8) por defecto; W8A16 (fp16 activaciones) configurable; KV cache en fp8 calibrado |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso de 64 capas con dimensión oculta de 5120 y FFN con dimensión intermedia de 17.408. Su disposición interna sigue el patrón `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`: por cada bloque de 4 capas, tres usan Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y una usa Gated Attention completa (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). Esta hibridación reduce el coste computacional del contexto largo frente a un transformer de atención completa puro. El modelo incorpora un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos, que actúa como modelo draft para decodificación especulativa.

El entrenamiento comprende fases de pre-training y post-training, con mejoras declaradas en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. El modelo soporta control flexible de razonamiento: modo thinking activado por defecto, desactivable por petición, con parámetro `reasoning_effort` para ajustar la profundidad y `preserve_thinking` para retener el contexto de razonamiento en mensajes históricos.

La cuantización RFI8 aplica pesos de 8 bits con rotación Hadamard-32 y escalas block-float de grupo 32, e incluye escalas calibradas del KV cache tanto para el modelo principal como para el modelo draft MTP. El checkpoint se distribuye en modo W8A8 (activaciones int8); cambiar a W8A16 (activaciones fp16) requiere editar un único campo `act_dtype` en `config.json`, con una calidad casi indistinguible del BF16 original a costa de menor throughput.

## Capacidades

- Generación de texto y razonamiento: modelo causal denso de 27B con modo thinking configurable mediante `reasoning_effort`, orientado a tareas complejas de múltiples pasos.
- Comprensión visión-lenguaje: soporte nativo de imágenes y vídeo, incluyendo diagramas STEM, documentos técnicos y vídeos de hasta una hora de duración.
- Ejecución agéntica: planificación autónoma y manejo de feedback del entorno para completar tareas de horizonte largo de forma fiable.
- Decodificación especulativa: módulo MTP integrado como modelo draft, con escalas de KV cache calibradas para el draft, lo que acelera la generación.
- Tool calling: el modelo es compatible con integraciones de herramientas (endpoints_compatible) y entornos de ejecución agéntica.
- Control flexible de razonamiento: el modo thinking puede activarse o desactivarse por petición, y el contexto de razonamiento histórico puede conservarse con `preserve_thinking`.
- Compatibilidad con ecosistemas: funciona con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, aunque el rendimiento completo de la cuantización RFI8 requiere el fork de vLLM del autor.

## Casos de uso

- Asistentes de codificación en producción: el modelo puede integrarse en pipelines de CI/CD para generación y revisión de código, aprovechando su modo thinking para razonar sobre problemas de programación complejos y su soporte de tool calling para interactuar con repositorios y APIs.
- Análisis de documentos técnicos y diagramas STEM: gracias al encoder de visión, puede procesar imágenes de diagramas, gráficas y documentos científicos, extrayendo información estructurada para informes o bases de conocimiento.
- Agentes autónomos de larga duración: su capacidad de planificación y manejo de feedback del entorno lo hace adecuado para agentes que ejecutan tareas de múltiples pasos (navegación web, automatización de procesos) con contexto de hasta 262K tokens.
- Procesamiento de vídeo para vigilancia o revisión de contenido: el modelo puede analizar vídeos de hasta una hora, resumiendo eventos o detectando elementos específicos en secuencias largas.
- Atención al cliente con contexto extenso: la ventana de 262K tokens permite mantener conversaciones multi-turno con historiales completos de interacción, incluyendo capturas de pantalla o documentos adjuntos, sin pérdida de contexto.
- Investigación y síntesis de literatura: con contexto ampliable a 1M tokens, puede procesar corpus extensos de artículos y generar resúmenes o responder preguntas sobre el contenido completo, con modo thinking para razonamiento profundo.
- Despliegue en infraestructura AMD RDNA4: organizaciones con GPUs AMD RDNA4 (gfx1201) pueden servir el modelo con los kernels HIP optimizados del fork de vLLM, obteniendo mayor throughput y menor latencia que con kernels Triton genéricos.

## Benchmarks y rendimiento

La model card del autor incluye mediciones de perplejidad WikiText-2 (n_ctx 2048) comparando el checkpoint RFI8 con el BF16 original y distintas configuraciones de cuantización:

| Checkpoint | Perplejidad WikiText-2 |
|---|---|
| BF16 original | 6,9224 |
| W8A16, KV cache bf16 | 6,8978 |
| W8A8, KV cache bf16 | 6,9034 |
| W8A16, KV cache fp8 | 6,9369 |
| W8A8, KV cache fp8 (configuración distribuida) | 6,9392 |

La degradación de calidad del checkpoint distribuido (W8A8 con KV cache fp8) frente al BF16 original es de solo 0,0168 puntos de perplejidad, lo que se considera prácticamente sin pérdida. La model card del modelo base menciona resultados de benchmarks de texto (tabla de rendimiento) y visión-lenguaje, pero los datos completos no están disponibles en la información proporcionada.

## Requisitos de hardware

- Pesos en 8 bits: aproximadamente 27,8 GB de VRAM solo para los pesos del modelo.
- VRAM estimada total: se recomiendan al menos 32 GB de VRAM para servir el modelo con contexto razonable; con el KV cache en fp8 se duplica aproximadamente el contexto útil en la misma VRAM frente a bf16.
- GPUs optimizadas: AMD RDNA4 (gfx1201), donde se activan los kernels HIP escritos a mano (attention, GDN y GEMMs RFI8). En otro hardware el modelo cae a kernels de referencia Triton y se ejecuta sustancialmente más lento.
- GPUs consumer: las tarjetas RDNA4 de 16 GB (RX 9070 / RX 9070 XT) requerirían offloading de pesos o contexto muy reducido; tarjetas con 24 GB o más (RTX 4090, RTX 5090) pueden servir el modelo con contexto moderado usando los kernels Triton de respaldo.
- Opciones de despliegue: fork de vLLM del autor (imagen docker `tcclaviger/vllm`) para rendimiento completo; también compatible con Hugging Face Transformers, SGLang y TokenSpeed.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la configuración de cuantización (W8A8 ofrece mayor throughput que W8A16 a costa de una mínima pérdida de calidad).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Perplejidad WikiText-2 (n_ctx 2048) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16 original) | ~27,8B | 262K nativo, 1M extensible | BF16 | 6,9224 | Apache 2.0 |
| Qwen3.8-27B-RFI8-AA (este checkpoint) | ~27,8B | 262K nativo, 1M extensible | RFI8 W8A8 + KV fp8 | 6,9392 | Apache 2.0 |
| Qwen3.8-27B-RFI8-AA (modo W8A16) | ~27,8B | 262K nativo, 1M extensible | RFI8 W8A16 + KV fp8 | 6,9369 | Apache 2.0 |

La comparativa con modelos de otras familias (por ejemplo, Llama o Mistral de tamaño similar) no está disponible en la información proporcionada. Las series anteriores Qwen3.5 y Qwen3.6 se citan como predecesoras arquitectónicas, pero no se dispone de sus métricas para comparación directa.

## Limitaciones y advertencias

- Requisito de infraestructura específico: el rendimiento completo solo se alcanza en GPUs AMD RDNA4 (gfx1201) con el fork de vLLM del autor (`tcclaviger/vllm`). En otro hardware, el modelo funciona con kernels Triton de referencia y un rendimiento sustancialmente inferior.
- Dependencia de un fork no oficial: la cuantización RFI8, sus kernels HIP y la carga de escalas MTP del KV cache no forman parte del vLLM upstream, lo que puede dificultar el mantenimiento y la actualización del stack de despliegue.
- Tradeoff de calidad W8A8: la configuración distribuida por defecto (activaciones int8) introduce una pérdida de calidad mínima pero medible frente al BF16 original; si la calidad es crítica, se recomienda cambiar a W8A16 editando `config.json`.
- Idiomas soportados no documentados: la información proporcionada no especifica qué idiomas cubre el modelo, lo que supone un riesgo para despliegues multilingües sin validación previa.
- Riesgo de alucinación: como todo modelo de lenguaje autoregresivo, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o con contexto ambiguo; se recomienda validación humana en aplicaciones de alto riesgo.
- Sesgos no documentados: no se dispone de información sobre sesgos conocidos del modelo base ni de la evaluación de sesgos del checkpoint cuantizado.
- Repositorio sin adopción: el checkpoint registra 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad; se recomienda realizar pruebas exhaustivas antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tcclaviger/Qwen3.8-27B-RFI8-AA
- Imagen docker del fork de vLLM: https://hub.docker.com/repository/docker/tcclaviger/vllm
- Servicio Qwen Cloud (para el modelo base): https://www.qwencloud.com
- Documentación del modelo base Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
