# YoungXuan/Llama-3.1-8B-NHS

## Resumen

Llama-3.1-8B-NHS es un modelo de lenguaje de 8 130 millones de parámetros desarrollado por YoungXuan, que parte del checkpoint base `meta-llama/Llama-3.1-8B` y aplica una técnica de *continued pretraining* denominada TTT-NTP (test-time training con next-token prediction). La idea central consiste en escribir pesos rápidos (*fast weights*) de rango uno, de forma paralela por fragmentos, en las proyecciones *down* del MLP de ciertas capas, supervisados por el estado oculto de la siguiente posición. Esto permite mejorar el manejo de contexto largo sin añadir parámetros permanentes ni modificar la arquitectura original de forma sustancial.

El modelo está pensado para investigación en test-time training y long-context. Su relevancia radica en que demuestra una mejora medible en tareas de recuperación asociativa sobre el modelo base, con un aumento de +11.96 puntos en el benchmark RULER Full-13 frente a Llama-3.1-8B, atribuible exclusivamente al mecanismo TTT y no al entrenamiento adicional. El checkpoint se distribuye con pesos en safetensors, licencia llama3.1 y requiere `trust_remote_code` para su uso, ya que la arquitectura modificada se define en un fichero de modelado propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas TTT (fast weights en MLP), basado en Llama-3.1-8B |
| Parámetros totales | 8 130 924 544 (8,13 B) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32 768 tokens (contexto de entrenamiento; el modelo base soporta 128k, pero este checkpoint no garantiza ese rango) |
| Tipos de cuantización | no disponible (solo se publican pesos en bf16, sin versiones cuantizadas oficiales) |
| Idiomas soportados | no disponible (el modelo base de Meta soporta múltiples idiomas, pero este checkpoint no especifica su cobertura) |
| Licencia | llama3.1 (requiere aceptar los términos de Meta) |
| Formato de pesos | safetensors (16,3 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura Transformer estándar de Llama-3.1-8B, pero incorpora un mecanismo de test-time training en capas seleccionadas (índices 0, 6, 12, 18, 24 y 30). En cada una de estas capas, se realizan escrituras de pesos rápidos de rango uno en las proyecciones *down* del MLP, de forma paralela por fragmentos de 1024 tokens. El entrenamiento se supervisa con el estado oculto de la siguiente posición (predict-next) y utiliza un optimizador interno `specnorm`, que normaliza cada escritura por su norma espectral. La inicialización de `ttt_proj` es pequeña (`N(0, initializer_range / sqrt(d))`) y se activa `ttt_norm_preserve` para renormar las filas de vuelta a la norma original de `W_down`.

El *continued pretraining* se realizó sobre el corpus Long-Data-Collections con secuencias de 32 768 tokens, durante 200 pasos con batch global de 64, learning rate externo de 5e-6 y warmup del 5%. El checkpoint publicado corresponde a una semilla única. El mecanismo TTT puede desactivarse poniendo `ttt_mode: false` en `config.json`, lo que recupera el comportamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Llama-3.1-8B.
- Mejora significativa en tareas de recuperación asociativa multi-clave y multi-valor en contextos largos (RULER), especialmente en `niah_multikey_2` y `niah_multikey_3`.
- Soporte de contexto largo hasta 32k tokens durante el entrenamiento, con degradación menor que el modelo base en rangos de 8k a 32k.
- Capacidad de test-time training: los pesos rápidos se actualizan en tiempo de inferencia, lo que permite adaptación dinámica a la entrada.
- No se documentan capacidades de tool calling, visión, audio ni modo *thinking* explícito.
- Requiere `trust_remote_code` para cargar la arquitectura personalizada.

## Casos de uso

- Procesamiento de documentos extensos: el modelo puede leer y razonar sobre documentos de hasta 32k tokens, útil para resúmenes, extracción de información o análisis de contratos y artículos científicos.
- Recuperación de información en contexto largo: tareas como *needle in a haystack* o recuperación asociativa múltiple, donde el modelo supera al base en benchmarks RULER.
- Investigación en test-time training: sirve como checkpoint de referencia para estudiar el impacto de los fast weights en la capacidad de atención a largo plazo.
- Fine-tuning posterior: al ser un modelo base (no instruct), puede adaptarse con SFT o RLHF para tareas específicas que requieran contexto largo.
- Evaluación de arquitecturas híbridas: permite comparar el rendimiento de TTT frente a métodos de atención estándar en entornos de investigación.
- Despliegue en entornos donde se necesite una alternativa a Llama-3.1-8B con mejor manejo de contexto largo sin aumentar el número de parámetros.

## Benchmarks y rendimiento

La model card reporta resultados en RULER Full-13 (100 muestras por tarea) comparando el checkpoint con el modelo base, un control de *continued pretraining* sin TTT (mismos tokens) y la receta del paper con optimizador interno `sgd`.

| Modelo | 4k | 8k | 16k | 32k | Promedio |
|---|---|---|---|---|---|
| Llama-3.1-8B base | 65,13 | 57,16 | 47,01 | 54,19 | 55,87 |
| CPT-only control (sin TTT) | 60,38 | 54,85 | 48,73 | 51,74 | 53,92 |
| Paper recipe (`sgd` inner opt) | 62,82 | 62,07 | 57,60 | 55,69 | 59,55 |
| **Este checkpoint (`specnorm`)** | **70,26** | **70,64** | **65,54** | **64,89** | **67,83** |

El modelo supera al base en +11,96 puntos de promedio. El control CPT-only pierde 1,95 puntos, lo que descarta que el entrenamiento adicional explique la mejora. El optimizador `specnorm` supera al `sgd` del paper en 8,28 puntos. Las ganancias se concentran en recuperación asociativa multi-clave, con regresiones en `niah_multikey_1` y `vt`. Se advierte que `niah_single_1` puntúa cerca de cero tanto en el base como en este checkpoint, lo que deprime todos los promedios por igual.

## Requisitos de hardware

- Estimación de VRAM: los pesos en bf16 ocupan aproximadamente 16,3 GB, por lo que se recomienda una GPU con al menos 20 GB de memoria para inferencia con batch pequeño. Con cuantización a 8 bits (no publicada oficialmente) podría caber en 12-16 GB, pero no se ofrecen versiones cuantizadas.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). En GPUs de 16 GB (como RTX 3080 Ti) podría ser necesario usar offloading o cuantización externa.
- No se han publicado integraciones con vLLM, Ollama o llama.cpp; el despliegue se realiza mediante la librería `transformers` con `trust_remote_code=True`.
- La latencia y el throughput no están documentados; al añadir el mecanismo TTT, la inferencia puede ser más costosa que la del modelo base, aunque no se cuantifica.
- Para entrenamiento o fine-tuning se necesitaría al menos una GPU con 40 GB o varias GPUs en paralelo.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base y el control sin TTT, ya que no se dispone de datos de otros modelos de 8B en RULER.

| Modelo | Parámetros | Contexto | RULER avg | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B (base) | 8,03 B | 128k (teórico) | 55,87 | llama3.1 |
| Llama-3.1-8B-NHS (este) | 8,13 B | 32k (entrenamiento) | 67,83 | llama3.1 |
| CPT-only control (sin TTT) | 8,03 B | 32k | 53,92 | llama3.1 |

Frente a otros modelos de contexto largo como Mistral 7B (32k) o Gemma 2 9B, no hay datos comparativos en este benchmark, por lo que no se puede establecer una comparación objetiva.

## Limitaciones y advertencias

- El resultado se basa en una única semilla; no se ha evaluado la variabilidad entre semillas.
- Hay regresiones en tareas específicas (`niah_multikey_1` y `vt`) que deben tenerse en cuenta para usos concretos.
- La tarea `niah_single_1` puntúa cerca de cero tanto en el base como en este checkpoint, lo que sugiere un posible artefacto del pipeline de evaluación.
- Requiere `trust_remote_code`, lo que implica ejecutar código no auditado del repositorio; se recomienda revisar el fichero de modelado antes de usarlo en producción.
- La licencia llama3.1 permite uso comercial, pero exige cumplir los términos de Meta (aceptación del formulario, atribución, no uso para ciertos fines).
- No se han evaluado sesgos, alucinaciones ni seguridad; al derivar de Llama-3.1-8B, hereda los sesgos conocidos de ese modelo.
- El contexto máximo efectivo no está garantizado más allá de 32k tokens; usos por encima de ese rango pueden degradar el rendimiento.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un checkpoint de investigación reciente sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YoungXuan/Llama-3.1-8B-NHS
- Código del método TTT-NTP: https://github.com/yancyou/TTT-NTP
- Modelo base (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B
