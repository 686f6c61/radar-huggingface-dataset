# turnercore/needle2-automaticity-v9

## Resumen

`turnercore/needle2-automaticity-v9` es un artefacto experimental publicado por el autor turnercore como resultado de un experimento de fine-tuning sobre el modelo base `Cactus-Compute/needle2` (un modelo de 45 millones de parámetros orientado a tool-calling para dispositivos con recursos limitados). El propio autor lo describe como un "resultado negativo": el fine-tuning con LoRA para la tarea de Automaticity V9 (function calling) no alcanzó el rendimiento esperado, por lo que el artefacto se publica con fines de reproducibilidad, no como un reemplazo de la solución oficial `ln-point-v9` (Needle Point). El modelo se distribuye como un archivo `.cact` (formato propietario de la librería `cactus-needle`), no como un checkpoint de Transformers o PyTorch.

Según la documentación, el fine-tuning se realizó sobre 4.900 filas de entrenamiento nativas de V9, con una época, LoRA rank-16/alpha-32 y una tasa de aprendizaje de `1e-4`. Los resultados de evaluación muestran una caída drástica en la precisión de acciones exactas (0,32% frente al 86,86% del modelo de referencia), lo que confirma que el ajuste no logró mantener la capacidad de decisión de acciones. Por tanto, este modelo no debe desplegarse en ningún entorno de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base `Cactus-Compute/needle2`, 45M parámetros) |
| Parametros totales | 45M (base) + adaptador LoRA rank-16/alpha-32 (no publicado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato `.cact`, no cuantización estándar) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | `.cact` (archivo Cactus-engine, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es `Cactus-Compute/needle2`, un modelo de 45M parámetros diseñado para tool-calling y extracción estructurada, pensado para ejecutarse en dispositivos con muy poca memoria (el binario oficial ocupa 14 MB y requiere 28 MB de RAM). El fine-tuning se realizó con LoRA (rank 16, alpha 32) sobre 4.900 filas de entrenamiento específicas de Automaticity V9, con un solo epoch y LR `1e-4`, semilla 0. La exportación final contiene 405 tensores con un tamaño total de 13.737.807 bytes. No se incluye el adaptador LoRA original, las filas de entrenamiento, los benchmarks ni las predicciones en este repositorio público; todos esos datos se mantienen en un repositorio privado de evidencia.

## Capacidades

- Según el autor, el modelo preserva la validez estructural de las salidas (schema-valid output 100%), pero falla en la generación de acciones: solo el 0.32% de las acciones exactas se predicen correctamente.
- En las métricas de evaluación, el modelo logra un 100% de precisión de capacidad y un 100% de validez de esquema, pero un 70.38% de exactitud de extremo a extremo (frente a 96.10% del modelo de referencia).
- El modelo no es capaz de realizar tool-calling fiable en escenarios reales; la mayoría de las veces devuelve "no tool" cuando se requiere una acción.
- La arquitectura subyacente de Needle 2 sí soporta tool-calling, uso de dispositivos y extracción estructurada, pero este fine-tuning concreto no hereda esas capacidades de forma útil.
- El modelo reporta `confidence: null` por diseño (el confidence head no se fine-tuneó).

## Casos de uso

Dado que el autor declara explícitamente que es un resultado negativo y que no debe usarse como reemplazo de `ln-point-v9`, los casos de uso prácticos son limitados:

- **Reproducción de experimentos**: el artefacto permite reproducir el resultado negativo y analizar las causas de la degradación en la predicción de acciones.
- **Investigación sobre fine-tuning de tool-calling**: sirve como ejemplo de un ajuste LoRA que no logra preservar la capacidad de acción, útil para estudiar los efectos de la distribución de datos de entrenamiento.
- **Comparación de arquitecturas**: permite comparar el comportamiento de Needle 2 frente a Needle Point en el mismo benchmark, aunque con confusores de runtime.
- **No se recomienda para ningún caso de uso productivo** como atención al cliente, generación de código, agentes autónomos o extracción de datos, ya que la tasa de éxito de acciones es inferior al 1%.

## Benchmarks y rendimiento

El autor incluye una tabla de evaluación comparativa del benchmark privado "Sealed Automaticity V9 benchmark v1.1" con 1.050 filas:

| Metrica | Needle Point v1 | Needle 2 FT |
|---|---|---|
| End-to-end exact | 96.10% | 70.38% |
| Routing / contract match | 98.95% | 70.76% |
| Capability accuracy | 100% | 100% |
| Argument accuracy | 96.19% | 74.95% |
| Action exact | 86.86% | 0.32% |
| Schema-valid output | 100% | 100% |
| No-tool precision / recall | 99.46% / 100% | 70.69% / 100% |
| Wrong-tool / wrong-argument | 11 / 30 | 307 / 4 |

Nota: los tiempos de ejecución no son comparables directamente (Needle Point usó runtime PyTorch ROCm persistente con 324.81 ms de media; Needle 2 usó el motor CPU oficial con agente por fila, 875.30 ms de media).

## Requisitos de hardware

- El modelo base (Needle 2) está diseñado para ejecutarse en dispositivos pequeños: 14 MB de binario y 28 MB de RAM de sesión.
- Este artefacto `.cact` requiere el motor oficial de Cactus Needle 2 (versión 2.0.3) para su ejecución; no es un checkpoint de PyTorch.
- Dado el tamaño de 45M de parámetros, la inferencia es viable en CPU y en GPUs de gama baja, pero no se proporcionan medidas de latencia específicas para este fine-tuning.
- El runtime de CPU oficial reporta una media de 875.30 ms por fila en el benchmark, pero con agent binding por fila; no es una medida de velocidad pura.
- No se indican opciones de despliegue como vLLM, Ollama o llama.cpp porque el formato `.cact` es específico de la librería `cactus-needle`.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de la misma categoría (tool-calling para dispositivos pequeños) en la información proporcionada. La única comparación disponible es con el modelo de referencia `ln-point-v9` (Needle Point v1), que supera ampliamente a este fine-tune en todas las métricas relevantes de acción y routing. No se puede comparar con otros modelos como Qwen2.5-0.5B o Phi-3-mini porque no se dispone de datos.

## Limitaciones y advertencias

- **Resultado negativo**: el autor declara explícitamente que es un "resultado negativo" y que no debe desplegarse como reemplazo de `ln-point-v9`.
- **Falta de capacidad de acción**: la precisión de acción exacta es del 0.32%, lo que lo hace inútil para cualquier tarea que requiera ejecutar herramientas.
- **Confidence null**: el modelo no proporciona puntuaciones de confianza porque el confidence head no se ajusteó.
- **Formato propietario**: el archivo `.cact` no es compatible con frameworks estándar (Transformers, vLLM, etc.); requiere el motor oficial de Cactus.
- **Licencia no especificada**: la licencia se indica como "other", sin detalles; no se puede asumir permisos de uso comercial.
- **Datos de entrenamiento y evolución privados**: el dataset, las filas de entrenamiento, las predicciones y el adaptador LoRA están en un repositorio privado, por lo que no se puede auditar completamente el proceso.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/turnercore/needle2-automaticity-v9
- Repositorio de la versión anterior (needle-automaticity-v9): https://huggingface.co/turnercore/needle-automaticity-v9
- Repositorio de Cactus Compute Needle (base): https://github.com/cactus-compute/needle
- Web de Cactus Compute: https://cactuscompute.com/needle
- Artículo de MarkTechPost sobre Needle 2: https://www.marktechpost.com/2026/08/13/cactus-compute-needle-2-45m-parameter-tool-calling-model/
