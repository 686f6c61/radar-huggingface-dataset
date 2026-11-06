# VINAY-UMRETHE/gemma-3-heretic-test

## Resumen

`VINAY-UMRETHE/gemma-3-heretic-test` es un modelo de prueba publicado en Hugging Face por el usuario VINAY-UMRETHE. No se trata de un modelo entrenado ni funcional, sino de una versión "abliterada" (decensurada) del checkpoint `tiny-random/gemma-3`, un modelo de depuración con pesos inicializados aleatoriamente y una configuración derivada de `google/gemma-3-27b-it` reducida a proporciones mínimas.

El modelo se ha generado con la herramienta Heretic v2.0.0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 0 a 2 del transformer. El objetivo declarado es servir como ejemplo reproducible de un proceso de "decensurado" sobre un modelo multimodal Gemma 3, no ofrecer capacidades reales de generación.

Con 8.600.288 parámetros totales, un tamaño de repositorio de 0,1 GB y pesos aleatorios, este checkpoint no es apto para uso en producción ni para tareas reales. Su interés es exclusivamente metodológico: documenta los parámetros de ablación empleados y permite reproducir el proceso. La model card indica explícitamente que se trata de un modelo "tiny" para depuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3: vision encoder + language model), configuración reducida de `google/gemma-3-27b-it` |
| Parametros totales | 8.600.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuración derivada de Gemma 3 27B, sin confirmación explícita) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Modelo base | tiny-random/gemma-3 (config adaptada de google/gemma-3-27b-it) |
| Herramienta de ablación | Heretic v2.0.0 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 multimodal (`Gemma3ForConditionalGeneration`), que combina un encoder de visión con un modelo de lenguaje. Sin embargo, la configuración ha sido drásticamente reducida: `hidden_size` de 32, `intermediate_size` de 128, `head_dim` de 32, 1 cabeza de atención, 1 cabeza KV, 2 capas ocultas y patrón de ventana deslizante de 2. El encoder de visión también se ha reducido a `hidden_size` 32, 2 capas y 1 cabeza de atención.

No ha habido entrenamiento real. Los pesos se inicializan con una distribución normal (`torch.nn.init.normal_(p, 0, 0.5)`) con semilla 42, según el código incluido en la model card. Sobre esta base aleatoria, Heretic v2.0.0 aplica una ablación de rangos arbitrarios (ARA) con los siguientes parámetros: `start_layer_index=0`, `end_layer_index=2`, `preserve_good_behavior_weight=0.7211`, `steer_bad_behavior_weight=0.0003`, `overcorrect_relative_weight=0.9331` y `neighbor_count=8`. La innovación técnica destacable es la reproducibilidad del proceso de ablación, no el modelo en sí.

## Capacidades

- El modelo no tiene capacidades funcionales reales: los pesos son aleatorios y no ha recibido entrenamiento.
- Estructuralmente soporta el pipeline `image-text-to-text` de transformers (entrada de imagen y texto), pero las salidas no son coherentes.
- No se ha verificado soporte de tool calling, function calling ni razonamiento multi-paso.
- No se ha verificado capacidad multilingüe.
- No dispone de modo "thinking", audio ni otras capacidades especiales más allá del esqueleto multimodal de Gemma 3.
- La model card incluye un ejemplo de uso con `pipeline("image-text-to-text")` y `max_new_tokens` muy bajo (3-5), coherente con su carácter de prueba.

## Casos de uso

- Reproducción de experimentos de ablación: permite replicar el pipeline de Heretic v2.0.0 sobre un modelo pequeño y verificar los parámetros ARA documentados, útil para investigadores que quieran validar la metodología antes de aplicarla a modelos grandes.
- Depuración de pipelines de transformers: al ser un modelo mínimo (8,6 M de parámetros), sirve para probar integraciones con `Gemma3ForConditionalGeneration`, `AutoProcessor` y el pipeline `image-text-to-text` sin consumir recursos.
- Test de infraestructura de despliegue: útil para validar configuraciones de TGI, endpoints compatibles o entornos CUDA con un checkpoint ligero antes de pasar a modelos reales.
- Docencia y formación: ejemplo didáctico de cómo se construye un modelo "tiny" a partir de una configuración grande y cómo se aplica una técnica de decensurado.
- Validación de herramientas de análisis de sesgos: permite comprobar que las métricas de rechazo (86/100 en el clasificador, según la model card) y divergencia KL se calculan correctamente sobre un modelo de prueba.
- Pruebas de CI/CD para librerías: al ser reproducible y de 0,1 GB, encaja en tests automatizados de integración con transformers.

## Benchmarks y rendimiento

La model card incluye únicamente dos métricas internas del proceso de ablación, no benchmarks estándar de capacidad:

| Metrica | Este modelo | Modelo original (tiny-random/gemma-3) |
|---|---|---|
| Refusals (Classifier) | 86/100 | 86/100 |
| KL divergence | 0,0003 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La métrica de rechazos no mejora respecto al original, lo que sugiere que la ablación no ha tenido efecto funcional medible en este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bfloat16 (8,6 M de parámetros); en la práctica, cualquier GPU con al menos 2 GB es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer y en la mayoría de entornos integrados.
- Opciones de despliegue: transformers (pipeline `image-text-to-text`), TGI (tag `text-generation-inference` presente), endpoints compatibles. No se ha verificado compatibilidad con llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles; al ser un modelo de depuración, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| VINAY-UMRETHE/gemma-3-heretic-test | 8,6 M | no disponible | no disponible | Prueba de ablación reproducible |
| tiny-random/gemma-3 | no disponible | no disponible | no disponible | Modelo de depuración aleatorio |
| google/gemma-3-27b-it | 27 B | 128 K (según documentación pública de Gemma 3) | Gemma Terms of Use | Modelo multimodal de producción |
| Modelos "abliterated" de la comunidad (p. ej. variantes de Llama o Mistral) | variable | variable | variable | Decensurado de modelos reales |

La comparación relevante es con `tiny-random/gemma-3` (su base directa) y con `google/gemma-3-27b-it` (origen de la configuración). Frente a modelos abliterated de la comunidad, este checkpoint no ofrece capacidades reales por su naturaleza aleatoria.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto ni respuestas coherentes. No debe usarse en producción.
- La métrica de rechazos (86/100) es idéntica a la del modelo original, lo que indica que la ablación no ha producido el efecto deseado en este checkpoint.
- No hay información sobre sesgos, idiomas o licencia; la licencia "no disponible" impide evaluar su uso comercial.
- El modelo base (`tiny-random/gemma-3`) es un artefacto de depuración, no un modelo entrenado; cualquier derivado hereda esa limitación.
- El pipeline `image-text-to-text` está declarado, pero el encoder de visión es mínimo (2 capas, hidden_size 32) y no procesa imágenes de forma útil.
- Riesgo de alucinación: total, al no haber aprendizaje.
- No apto para evaluación de sesgos, seguridad o calidad lingüística, ya que las salidas no son representativas.
- La reproducibilidad depende de la versión de Heretic (v2.0.0) y de transformers; cambios de versión pueden alterar el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-test
- Modelo base: https://huggingface.co/tiny-random/gemma-3
- Modelo de origen de la configuración: https://huggingface.co/google/gemma-3-27b-it
- Heretic (proyecto): https://heretic-project.org
- Directorio de reproducción: `reproduce/README.md` dentro del repositorio del modelo
- Documentación de Gemma 3 (Google): no disponible en la información proporcionada
