# zbeeb/Qwen2.5-Math-1.5B-OpenR1-SFT

## Resumen

Qwen2.5-Math-1.5B-OpenR1-SFT es un ajuste fino supervisado (SFT) del modelo base Qwen2.5-Math-1.5B, publicado por el usuario zbeeb como artefacto final de un estudio a nivel de token sobre la transición de SFT a GRPO. No es un lanzamiento comercial ni un modelo orientado a benchmarks: es el checkpoint congelado de un experimento reproducible, con todos los artefactos de configuración, selección de datos y evaluación incluidos en el repositorio.

El modelo parte de Qwen2.5-Math-1.5B, un transformer decoder-only de la familia Qwen2 con licencia Apache-2.0, y se ha entrenado durante una época sobre un subconjunto de open-r1/OpenR1-Math-220k formado por trazas de razonamiento matemático verificadas localmente. El entrenamiento se realizó con Prime RL 0.9.0, 278 actualizaciones del optimizador y 20.016 ejemplos, con una ventana de secuencia de 4.096 tokens y precisión bf16 (aunque los tensores se guardan en F32, lo que explica los 7,1 GB del repositorio).

Su relevancia es doble: por un lado, ofrece un punto de partida ya entrenado para investigar la cadena SFT → RL en modelos matemáticos pequeños; por otro, documenta de forma inusualmente detallada la receta de entrenamiento (semilla, revisión exacta del modelo base, revisión del dataset, checksums SHA-256). Con 1.777.088.000 parámetros reales, cabe en GPUs de consumo y es apto para experimentación local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), con plantilla de chat y atención causal |
| Parámetros totales | 1.777.088.000 (según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens usados en el entrenamiento (presupuesto de secuencia); el modelo base Qwen2.5-Math admite contexto de 4K, ampliable con YaRN según la documentación de Qwen |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors guardados en F32; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (etiqueta `en`; los datos de SFT son de matemáticas en inglés) |
| Licencia | Apache-2.0 (se conserva la licencia upstream en el fichero `LICENSE`) |
| Formato de pesos | safetensors (tensores guardados en F32; metadatos dtype F32) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU y atención causal con RoPE, en la variante de 1.5B de la familia Qwen2.5-Math. No se introducen cambios estructurales; el ajuste es puramente de pesos mediante supervisión. Los tensores de atención siguen la configuración original del checkpoint `Qwen/Qwen2.5-Math-1.5B` en la revisión `4a83ca6e4526a4f2da3aa259ec36c259f66b2ab2`.

El entrenamiento consistió en una época de SFT sobre un subconjunto seleccionado de `open-r1/OpenR1-Math-220k` (revisión `e4e141ec9dea9f8326f4d347be56105859b2bd68`). La selección de datos exige que las trazas de razonamiento matemático sean completas y estén verificadas localmente, y descarta los ejemplos que superan el presupuesto de 4.096 tokens en lugar de truncarlos. Los tokens de prompt se enmascaran de la pérdida supervisada. La configuración exacta fue: framework Prime RL 0.9.0 (revisión `ab5de8fff44b2c4a5c85e24b6e6e3f7d57eee7b1`), semilla 42, batch efectivo de 72 ejemplos, learning rate 2e-05, scheduler coseno, warmup ratio 0,03, weight decay 0,01, gradient clipping 1,0 y precisión de entrenamiento bf16. No se documenta uso de RLHF, DPO ni RL en esta etapa: la fase GRPO posterior se publica por separado en la misma colección del estudio.

El elemento metodológico diferencial es la trazabilidad: el repositorio incluye `data-selection.json` con los IDs exactos de los ejemplos y las sondas, `train_metrics.jsonl` con las métricas por actualización, `evaluation-summary.jsonl` con los resultados de las sondas fijas (teacher-forced y generación libre) y `provenance.json`, `training-config.json` y `export-manifest.json` con revisiones de origen, receta, tamaños de artefacto y checksums SHA-256. El autor indica explícitamente que los resultados de las sondas son mediciones experimentales y no una declaración de rendimiento en benchmarks estándar.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, entrenado específicamente para producir trazas de razonamiento completas.
- Resolución de problemas aritméticos, algebraicos y de nivel competición dentro del estilo de OpenR1-Math-220k.
- Salida en formato de respuesta final delimitada con `\boxed{}`, heredada de la plantilla de chat del modelo base, lo que facilita la extracción programática de la respuesta.
- Conversación multi-turno mediante `apply_chat_template`, con roles `system` y `user` soportados en la plantilla de ejemplo de la model card.
- Puntuación por verosimilitud (teacher-forced) utilizable para evaluar o comparar trazas de razonamiento, ya que el estudio incluye ese tipo de medición.
- Capacidades multilingües: no documentadas. La etiqueta de idioma es únicamente `en`; no se reporta soporte de castellano ni de otros idiomas más allá de lo que herede el modelo base.
- Tool calling / function calling: no documentado en la model card ni en la receta de entrenamiento.
- Comportamiento agéntico y razonamiento multi-paso con herramientas: no documentado.
- Capacidades especiales (modo thinking explícito, visión, audio): no disponibles.

## Casos de uso

- Tutoría matemática paso a paso: el modelo genera desarrollos completos hasta la respuesta final, por lo que puede integrarse en una aplicación educativa que muestre el razonamiento intermedio y no solo el resultado, con el añadido de que cabe en una GPU de consumo.
- Generación de datos sintéticos de razonamiento: al estar entrenado sobre trazas verificadas de OpenR1-Math-220k, sirve como generador barato de cadenas de razonamiento para destilar a otros modelos o para alimentar una fase de RL (el propio autor continúa el estudio con GRPO sobre `zbeeb/Staleness-GRPO-DAPO-Math-17k`).
- Reproducción de experimentos SFT → RL: los ficheros `training-config.json`, `provenance.json` y `data-selection.json` permiten replicar exactamente la selección de datos y la receta, algo poco habitual en checkpoints publicados en HuggingFace.
- Estudio a nivel de token: el checkpoint está pensado para analizar cómo cambian las distribuciones de tokens y las métricas de sonda entre la etapa SFT y la etapa GRPO posterior.
- Verificación o puntuación de soluciones: al haberse validado con evaluación teacher-forced y de generación libre, el modelo puede usarse como scorer de trazas candidatas en un pipeline de evaluación tipo MATH o GSM8K.
- Componente de razonamiento en un pipeline de RAG matemático: se puede recuperar contexto teórico (definiciones, teoremas) y pasar los fragmentos como parte del prompt al modelo, que produce el desarrollo paso a paso; requiere controlar que el contexto recuperado no desplace los 4.096 tokens útiles.
- Base para ajustes posteriores: es un punto de partida ya entrenado en dominio matemático para aplicar DPO, GRPO u otro método de alineación sin partir del modelo base sin ajustar.
- Extracción automática de respuestas en sistemas de corrección: la convención `\boxed{}` permite parsear la respuesta final con expresiones regulares y compararla contra una solución de referencia en un sistema de calificación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados incluidos en `evaluation-summary.jsonl` corresponden a sondas fijas del experimento (mediciones teacher-forced y de generación libre) y que no constituyen una declaración de rendimiento en benchmarks estándar. No se proporcionan cifras concretas de MMLU, GSM8K, MATH, HumanEval ni de ningún otro conjunto de evaluación en la información disponible, por lo que no se reproducen números.

## Requisitos de hardware

- VRAM para inferencia con los pesos tal como se publican (F32): aproximadamente 7,1 GB solo para los pesos, más la caché KV. El tamaño del repositorio (7,1 GB) es coherente con esta cifra.
- VRAM tras convertir a bf16/fp16: en torno a 3,6 GB de pesos, más caché KV; es la opción recomendada para inferencia práctica.
- VRAM con cuantización de 8 bits: aproximadamente 1,8-2 GB de pesos. Con 4 bits: en torno a 1-1,2 GB de pesos. Estas conversiones no están publicadas y habría que generarlas.
- GPU recomendadas: cualquier GPU con 8 GB o más funciona en bf16 (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070). Con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080) hay margen para lotes mayores y contextos largos. Para servicio en producción con concurrencia, A100, H100 o L40S permiten agrupar muchas peticiones por GPU.
- Cabe en GPU de consumo: sí, en bf16 cabe en tarjetas de 6-8 GB si se limita el tamaño de lote y la longitud de contexto, y en 4 bits en GPU de 4-6 GB.
- Opciones de despliegue: transformers (el método documentado en la model card), vLLM, TGI (la model card declara compatibilidad con text-generation-inference y endpoints compatibles), y llama.cpp u Ollama previa conversión a GGUF, que no está publicada.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo en la información proporcionada.
- Nota de despliegue: la model card advierte que el tokenizer y los ajustes de generación son los artefactos exactos del experimento guardado, por lo que conviene revisar la configuración de generación antes de llevarlo a producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zbeeb/Qwen2.5-Math-1.5B-OpenR1-SFT | 1,78B (dato safetensors) | 4.096 tokens de entrenamiento | Apache-2.0 | SFT matemático, artefacto de estudio SFT → GRPO | HuggingFace, transformers/safetensors |
| Qwen/Qwen2.5-Math-1.5B | 1,5B nominal | 4K según documentación de Qwen | Apache-2.0 | Modelo base matemático | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B nominal | 32.768 tokens según documentación de Qwen | Apache-2.0 | Instrucción general, no especializado en matemáticas | HuggingFace |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B nominal | No disponible | MIT | Destilado de razonamiento con trazas largas | HuggingFace |

Los recuentos de parámetros de los modelos comparables se expresan en su valor nominal de familia (1,5B), ya que no se dispone del recuento exacto por safetensors en la información proporcionada. No se dispone de resultados de benchmarks de ninguno de los cuatro modelos en la información disponible, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigación, no producto: la model card describe el repositorio como el checkpoint final de SFT de un estudio a nivel de token, con 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no hay validación externa de su comportamiento.
- Sin benchmarks: no hay resultados verificables en MMLU, GSM8K, MATH ni similares; las únicas mediciones son sondas internas del propio experimento.
- Sesgo de dominio: el entrenamiento se limita a un subconjunto filtrado de OpenR1-Math-220k con trazas completas y verificadas que caben en 4.096 tokens. Los problemas que requieren razonamientos más largos quedaron excluidos, lo que puede degradar el rendimiento en problemas de cadena larga.
- Idioma: etiquetado únicamente como inglés. No hay garantía de calidad en castellano ni en otros idiomas, más allá de lo que herede el modelo base.
- Riesgo de alucinación: es un modelo generativo de 1,5B sin RLHF ni DPO en esta etapa; puede producir desarrollos plausibles con resultados incorrectos, especialmente fuera del formato de los datos de entrenamiento. La verificación simbólica o numérica externa es recomendable en cualquier uso crítico.
- Formato de salida dependiente del prompt: el ejemplo de la model card fuerza el formato paso a paso con respuesta final en `\boxed{}`. Sin ese system prompt, el formato de salida puede desviarse.
- Longitud de contexto limitada: 4.096 tokens de entrenamiento. El contexto del modelo base es ampliable con YaRN según la documentación de Qwen, pero no hay evidencia de que este ajuste conserve calidad más allá de esa ventana.
- Precisión de almacenamiento: los pesos están guardados en F32, lo que duplica el espacio en disco y en memoria respecto a bf16. Es necesario convertir explícitamente para desplegar de forma eficiente.
- Configuración de generación no convencional: la model card advierte que el tokenizer y los ajustes de generación son los artefactos exactos del experimento, con `eos_token_id` y `pad_token_id` específicos (151643, 151645); ignorarlos puede producir generaciones que no terminen correctamente.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda de Qwen2.5-Math-1.5B; conviene revisar los ficheros `LICENSE` y `Notice` del repositorio, que incluyen los avisos de atribución y modificación.
- Estados del optimizador no incluidos: no se publican `optimizer states` ni checkpoints de recuperación, por lo que no es posible reanudar el entrenamiento exactamente desde el estado final.
- Fase RL separada: los checkpoints de GRPO posteriores se publican en otros repositorios de la colección; este repositorio contiene únicamente los pesos finales de SFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-Math-1.5B-OpenR1-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Dataset de SFT: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de la fase RL posterior: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Repositorio OpenR1: no disponible en la información proporcionada
- Paper o blog técnico asociado: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
