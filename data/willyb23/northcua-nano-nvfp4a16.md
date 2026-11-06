# willyb23/NorthCUA-Nano-NVFP4A16

## Resumen

NorthCUA-Nano NVFP4A16 es una cuantización comunitaria no oficial del modelo beipo-ai/NorthCUA-Nano, un modelo denso de 9.400 millones de parámetros orientado a computer use (uso de interfaces gráficas por parte de agentes) construido sobre la arquitectura Qwen3.5. La cuantización la publica el usuario willyb23 y reduce el checkpoint original de 18,8 GB a 11,2 GB almacenando las proyecciones MLP y de atención completa del modelo de lenguaje en NVFP4, mientras mantiene el resto de pesos en BF16.

El interés de esta ficha no está tanto en el modelo base como en la técnica de compresión: NVFP4 es el formato de precisión ultra-baja (FP4 con escala FP8 por bloque de 16 pesos y escala global FP32 por matriz) que permite servir modelos de 9B en GPUs de consumo con un rendimiento de decodificación superior al original BF16. Según las pruebas del autor, en una RTX 5090 el checkpoint cuantizado decodifica a 161 tokens/s frente a 93 tokens/s del BF16, manteniendo respuestas idénticas en pruebas de aritmética, problemas verbales, preguntas factuales y tool calling.

El modelo base combina capas de atención lineal Gated DeltaNet (24 capas) con capas de atención completa (8 capas), e incorpora un codificador de visión para procesar capturas de pantalla. Está pensado para controlar entornos de escritorio mediante coordenadas normalizadas en el espacio 0-1000, y se sirve con vLLM y el NorthCUA Harness oficial. La licencia es Apache-2.0, igual que el original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas de atención lineal (Gated DeltaNet) + 8 capas de atención completa, con codificador de visión |
| Parámetros totales | 9.409.813.744 (9,4B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 65.536 tokens configurados en vLLM (`--max-model-len 65536`); probado con éxito con un prompt de 25.249 tokens |
| Tipos de cuantización | NVFP4A16 (pesos FP4 E2M1 con escala FP8 E4M3 por 16 pesos y escala global FP32 por matriz; activaciones BF16). Capas de atención lineal, normas, embeddings, LM head, codificador de visión y merger permanecen en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con formato compressed-tensors `nvfp4-pack-quantized` (`.weight_packed`, `.weight_scale`, `.weight_global_scale`); librería vLLM |

## Arquitectura y entrenamiento

El modelo base NorthCUA-Nano se apoya en la arquitectura Qwen3.5, un transformer híbrido que alterna 24 capas de atención lineal basadas en Gated DeltaNet con 8 capas de atención completa. Esta combinación reduce el coste computacional del contexto largo frente a un transformer de atención completa puro, lo que resulta relevante para agentes que mantienen historiales de conversación e imágenes de pantalla durante muchas interacciones. El modelo incluye además un codificador de visión y un merger para convertir capturas de pantalla en tokens que el modelo de lenguaje puede procesar, lo que lo convierte en un modelo image-text-to-text.

Sobre el entrenamiento del modelo original no se dispone de detalles en la información proporcionada (número de tokens, composición del dataset, uso de RLHF o DPO): no disponible. Lo que sí documenta esta ficha es el proceso de cuantización: se parte de los pesos BF16 publicados en la revisión `317dd35` y se aplica un redondeo al más cercano (round-to-nearest) sin datos de calibración, usando las funciones NVFP4 de compressed-tensors. Las matrices que vLLM fusiona comparten una única escala global (q, k y v en cada capa, y gate y up en cada capa). El error relativo de pesos medido (norma de Frobenius) es del 9,49% de media y 9,55% máximo sobre las 128 matrices cuantizadas, valor típico para NVFP4 round-to-nearest. Los límites de shard del checkpoint original se conservan y se incluye un `checksums.sha256` para verificar la integridad.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activado por defecto en la plantilla de chat y desactivable por petición mediante `chat_template_kwargs`.
- Razonamiento aritmético y resolución de problemas verbales: en las pruebas del autor resolvió correctamente 10 de 10 problemas con respuesta exacta y la operación 17 × 23 = 391.
- Computer use: predice coordenadas de clic en capturas de pantalla en el espacio normalizado 0-1000, que el NorthCUA Harness convierte a píxeles.
- Comprensión de imágenes (pipeline image-text-to-text) mediante codificador de visión integrado.
- Tool calling / function calling: compatible con el parser `qwen3_coder` de vLLM y con `--enable-auto-tool-choice`; probado con la función `get_weather` devolviendo nombre y argumentos correctos.
- Recuperación de información en contextos largos: localizó un dato oculto en un prompt de 25.249 tokens.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio: el modelo predice coordenadas de clic normalizadas sobre capturas de pantalla, integrándose con el NorthCUA Harness para ejecutar acciones en entornos GUI. Es adecuado porque su entrenamiento específico de computer use y su codificador de visión le permiten interpretar la interfaz directamente.
- Agentes de navegación web y formularios: con tool calling y contexto de hasta 65.536 tokens, puede mantener el historial de pasos, la descripción del estado de la página y las llamadas a herramientas en una sola ventana, lo que simplifica pipelines de agentes multi-paso.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar 10,5 GiB de VRAM en vLLM, cabe en una RTX 5090 de 32 GB y deja margen para el contexto KV y el codificador de visión, permitiendo prototipar agentes sin infraestructura de centro de datos.
- Servicio de inferencia de baja latencia: los 161 tokens/s de decodificación en single-stream (frente a 93 del BF16) lo hacen viable para aplicaciones interactivas donde la latencia de respuesta condiciona la experiencia, como asistentes que reaccionan a cambios de pantalla.
- Pruebas de regresión de pipelines de cuantización: sirve como referencia para validar que una receta NVFP4A16 data-free no degrada capacidades críticas (tool calling, aritmética, recuperación en contexto largo) antes de aplicar la misma receta a otros modelos.
- Evaluación de modelos de computer use en investigación: al ser una versión cuantizada con licencia Apache-2.0 y pesos en safetensors, facilita reproducir experimentos de agentes GUI en hardware asequible y comparar el comportamiento frente al BF16 original.
- Extracción de información de documentos e imágenes: combinando visión y contexto largo, puede procesar capturas o páginas con texto extenso y responder preguntas factuales sobre su contenido.

## Benchmarks y rendimiento

Las pruebas publicadas por el autor son smoke tests del checkpoint cuantizado frente al BF16 original, no una re-ejecución de los benchmarks del informe técnico de NorthCUA. Se ejecutaron con vLLM 0.32.0 en una RTX 5090 (32 GB) con decodificación greedy:

| Prueba | NVFP4A16 | BF16 original |
|---|---|---|
| Sonda aritmética (17 × 23, thinking off) | 391 | 391 |
| 10 problemas verbales con respuesta exacta (thinking on) | 10/10 | 10/10 |
| 8 preguntas factuales cortas | 8/8 | 8/8 |
| Tool call (`get_weather`, parser `qwen3_coder`) | nombre y argumentos correctos | nombre y argumentos correctos |
| Dato oculto en prompt de 25.249 tokens | encontrado | encontrado |
| Decodificación single-stream, 512 tokens con prefill | 161 tokens/s | 93 tokens/s |
| Puntos de clic en 5 capturas sintéticas | dentro de 4 unidades (de 1000) del punto del BF16 en las 3 pantallas donde este dio uno | 3 puntos, 2 respuestas vacías |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo base en la información disponible, ni del checkpoint cuantizado. La prueba de capturas usó un prompt genérico, no el Harness oficial, y ambos modelos fallaron algunos objetivos; la fila compara las dos versiones entre sí, no con los objetivos reales.

## Requisitos de hardware

- VRAM estimada: 10,5 GiB de pesos en GPU con vLLM; el resto del presupuesto de memoria se destina a KV cache, activaciones y codificador de visión. El checkpoint en disco ocupa 11,2 GB.
- GPU probada: una RTX 5090 de 32 GB, con vLLM 0.32.0 y `--max-model-len 65536`.
- Cabe en GPU de consumo: sí, al menos en RTX 5090 (32 GB); no se documentan pruebas en GPUs de 16 o 24 GB, por lo que la viabilidad con contexto completo en esos tamaños no está confirmada.
- GPUs de centro de datos (A100, H100) no se mencionan en la información disponible, aunque el formato NVFP4 está pensado para hardware con soporte de FP4.
- Opciones de despliegue: vLLM es la vía documentada y probada (carga directa del formato compressed-tensors sin flags adicionales). No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: 161 tokens/s en decodificación single-stream para 512 tokens incluyendo prefill en RTX 5090; 1,7 veces más rápido que el BF16 original (93 tokens/s) en la misma configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NorthCUA-Nano NVFP4A16 (esta ficha) | 9,4B denso | 65.536 tokens (config vLLM) | NVFP4A16, 11,2 GB | Apache-2.0 | HuggingFace, requiere vLLM |
| beipo-ai/NorthCUA-Nano (BF16 original) | 9,4B denso | No disponible | BF16, 18,8 GB | Apache-2.0 | HuggingFace |
| Alternativas de computer use de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos sobre otros modelos de computer use comparables (por ejemplo, variantes de Qwen2.5-VL o modelos GUI específicos) que permitan una comparación rigurosa de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Cuantización no oficial: es una conversión comunitaria de willyb23, sin afiliación ni respaldo del equipo NorthCUA ni de Qwen. Para producción conviene validar el comportamiento frente al BF16 original en el dominio de uso real.
- Pérdida de precisión: el error relativo de pesos es del 9,49% de media (9,55% máximo) por el redondeo NVFP4 sin calibración. Las pruebas publicadas son smoke tests y no miden la precisión completa frente al original.
- Coordenadas: el modelo espera coordenadas normalizadas en el espacio 0-1000; usar píxeles directamente produce resultados incorrectos. El Harness oficial es el componente que realiza la conversión.
- Computer use: en la prueba con prompt genérico sobre capturas sintéticas, el modelo falló algunos objetivos (2 respuestas vacías en BF16, desviaciones de hasta 4 unidades en NVFP4). El rendimiento en entornos reales con el Harness no está cuantificado en la información disponible.
- Idiomas: no se documenta qué idiomas soporta ni su calidad fuera del inglés; no disponible.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación en la información proporcionada; al ser un modelo generativo, persiste el riesgo habitual de respuestas plausibles pero incorrectas, especialmente en preguntas factuales fuera de distribución.
- Dependencia de hardware y software: el formato NVFP4 requiere vLLM con soporte de compressed-tensors y, en la práctica, GPUs con capacidad FP4; no hay soporte documentado en llama.cpp, Ollama o TGI.
- Licencia: Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE` originales y citar el informe técnico de NorthCUA si se usa el modelo.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/willyb23/NorthCUA-Nano-NVFP4A16
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Nano
- NorthCUA Harness (herramienta oficial de computer use): https://github.com/china-qijizhifeng/NorthCUA-Harness
- compressed-tensors (formato de cuantización): https://github.com/vllm-project/compressed-tensors
- Informe técnico de NorthCUA: referenciado en la model card del modelo base (no disponible como enlace directo en la información proporcionada)
