# verysweatydog/qwen3.8-27b-moe

## Resumen

Qwen3.8-27B MoE es un conjunto de checkpoints de investigación publicados por el usuario verysweatydog que documentan la conversión del modelo denso HauhauCS/Qwen3.8-27B en un estudiante disperso por token ("MoE-ificado") orientado a inferencia limitada por ancho de banda, principalmente CPU e iGPU en cuantización Q4. No se trata de un modelo autónomo: cada checkpoint contiene únicamente los tensores que el entrenamiento modificó (640 tensores en bf16, 1,33 GB), y reconstruir el estudiante requiere los pesos del profesor denso en BF16 y el código de construcción incluido en `code/`.

El modelo profesor es un transformer híbrido de 64 capas (48 de Gated DeltaNet y 16 de atención completa), dimensión 5120 y FFN SwiGLU de 17.408 neuronas. El estudiante conserva todos los pesos del profesor pero, por token, lee solo un subconjunto: atención completa con q de rango bajo 512 y o de rango bajo 1536, Gated DeltaNet con q y k de rango 256, cabeza de salida con logits aproximados de rango 256 sobre una lista corta de 8.192 tokens, y una FFN con cascada de selección de neuronas basada en un sketch de 1 bit que reduce de 17.408 candidatas a 6.144 exactas y finalmente a 3.584 activas.

La relevancia es doble: por un lado, demuestra una técnica de destilación con KL forward contra un profesor cacheado (top-128) que mejora sustancialmente a selectores de bajo rango previos (KL 0,240 frente a 0,627); por otro, cuantifica el ahorro de ancho de banda en Q4 (≈6,3 GB por token frente a ≈17 GB del denso). Es material de investigación, no un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet + 16 capas de atención completa; estudiante con selección dispersa por token (sketch 1-bit + cascada) |
| Parametros totales | No disponible (el profesor denso Qwen3.8-27B; el checkpoint almacena 640 tensores, 1,33 GB en bf16) |
| Parametros activos | 3.584 neuronas FFN activas por token de 17.408 (cascada 6.144 → 3.584); selección de canales z/out de 1.024 de 6.144 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4 (emulación 4-bit RTN, grupo 32, todos los pesos); bf16 en el checkpoint |
| Idiomas soportados | No disponible |
| Licencia | other (definida por el autor; sin términos detallados en la información disponible) |
| Formato de pesos | `.pt` (PyTorch, bf16); sin GGUF ni llama.cpp disponible |

## Arquitectura y entrenamiento

El profesor es un transformer híbrido de 64 capas: 48 capas de Gated DeltaNet (atención lineal con estado recurrente) y 16 capas de atención completa, con dimensión de modelo 5120 y FFN SwiGLU de 17.408 neuronas. El estudiante mantiene la totalidad de los pesos del profesor y aplica una política de lectura dispersa por token. En atención completa, q se factoriza en rango 512 (incluyendo puerta) y o en rango 1536, mientras que k y v se computan de forma exacta. En Gated DeltaNet, q y k se factorizan en rango 256 y v es exacto; las puertas z y out se seleccionan mediante un predictor z de rango 256 que elige 1.024 de 6.144 canales. La cabeza de salida calcula logits aproximados de rango 256 y logits exactos sobre una lista corta de 8.192 tokens.

La pieza central es la FFN: un sketch de 1 bit de las matrices gate y up completas (signo más escala de mínimos cuadrados ponderada por energía por grupo de 64 pesos) puntúa las 17.408 neuronas; se computan gate/up exactas para las 6.144 mejores candidatas y se retienen las 3.584 con mayor |silu(g)·u|·‖d_i‖, reutilizándolas para la salida de la FFN. Sobre gate/up/down se aplica LoRA de rango 16. Los sketches y selectores son funciones deterministas de los pesos del profesor y de las estadísticas de calibración, por lo que se reconstruyen y no se almacenan.

El entrenamiento consistió en 600 pasos × 2 × 2048 tokens (≈2,5 millones de tokens) del dataset DaoCloud/Qwen3.8-27B-Drafter-SFT (shards 1–3), con KL forward contra un profesor cacheado top-128 sobre tokens de asistente. La calibración usa los shards 0–3 del mismo dataset (semilla 0, 74 × 2048 tokens). El resultado en el panel de desarrollo es KL 0,240 y top-1 del 85,3 % sobre tokens de asistente del shard 63 retenido (13.157 objetivos), frente a KL 0,627 / 76,3 % del estudiante previo con selector de bajo rango r256.

## Capacidades

- Generación de texto autoregresiva heredada del profesor denso, sujeta a la aproximación introducida por la selección dispersa de neuronas y la cabeza de salida de rango bajo.
- Razonamiento matemático básico: 82,8 % (53/64) en los primeros 64 problemas de test de GSM8K en modo greedy y sin thinking, frente al 87,5 % (56/64) del profesor.
- Aproximación funcional del profesor con top-1 del 85,3 % en tokens de asistente del panel de desarrollo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles (los idiomas no se especifican).
- El artefacto no es un modelo autónomo: requiere reconstrucción con los pesos del profesor y el código del repositorio.

## Casos de uso

- Investigación en destilación dispersa: reproducir el pipeline de `code/` (calibración, sketch 1-bit, LoRA r16 y entrenamiento KL) para estudiar cómo varía el KL y el top-1 al cambiar el tamaño de la cascada o el número de pasos, usando el log de resultados del autor como línea base.
- Estudio de selectores de neuronas FFN: comparar la cascada 1-bit (6.144 → 3.584) con el selector de bajo rango r256 documentado (KL 0,627) para analizar el coste y beneficio del sketch de 1 bit frente a la selección por proyección lineal.
- Inferencia en CPU e iGPU con restricciones de ancho de banda: el autor estima ≈6,3 GB de pesos leídos por token en Q4 frente a ≈17 GB del denso, lo que hace el estudiante candidato para entornos sin GPU dedicada, aunque requiere un kernel personalizado para la selección por neurona.
- Análisis de degradación por cuantización: el checkpoint incluye métricas en emulación Q4 (KL 0,277 / top-1 84,5 % en el estudiante frente a KL 0,044 / 93,4 % en el profesor con la misma cuantización), útil para estudiar la sensibilidad del profesor y del estudiante a la cuantización de 4 bits.
- Evaluación de robustez de estudiantes dispersos: usar GSM8K (64 problemas, greedy, sin thinking) como sonda rápida para medir la brecha de razonamiento entre estudiante y profesor (82,8 % frente a 87,5 %).
- Docencia y experimentación con arquitecturas híbridas: el profesor combina Gated DeltaNet y atención completa, lo que permite estudiar el comportamiento de la selección dispersa en capas lineales frente a capas de atención completa.
- Reproducción de artefactos de investigación: cargar `state` en `train.Swap(model, pristine).student_modules()` por clave `"<module index>.<parameter name>"` para validar la reconstrucción del estudiante a partir del checkpoint publicado.

## Benchmarks y rendimiento

| Benchmark | Estudiante | Profesor | Notas |
|---|---:|---:|---|
| KL en dev (panel de desarrollo, menor es mejor) | 0,240 | — | Shard 63 retenido, 13.157 objetivos |
| Top-1 en dev | 85,3 % | — | Mismo panel |
| KL en dev, emulación Q4 (RTN, grupo 32) | 0,277 | 0,044 | Todos los pesos a 4 bits |
| Top-1 en dev, emulación Q4 | 84,5 % | 93,4 % | Misma cuantización |
| GSM8K (primeros 64 problemas, greedy, sin thinking) | 82,8 % (53/64) | 87,5 % (56/64) | — |

Historial del panel de desarrollo (KL / top-1): selector de bajo rango r256 con A=2560 (6,3B activos) entrenado, 0,627 / 76,3 %; mismo con A=4096 (7,8B activos), 0,527 / 78,2 %; cascada 1-bit 4096 → 2560 con 300 pasos, 0,290 / 83,7 %; cascada 1-bit 6144 → 3584 con 300 pasos, 0,246 / 85,3 %; cascada 1-bit 6144 → 3584 con 600 pasos (este checkpoint), 0,240 / 85,3 %.

## Requisitos de hardware

- VRAM estimada: no disponible como medida en hardware; el autor solo proporciona una estimación de ancho de banda de pesos leídos por token en Q4 (≈6,3 GB frente a ≈17 GB del profesor denso).
- GPU recomendadas: no disponibles; el diseño está orientado a inferencia limitada por ancho de banda en CPU e iGPU.
- Compatibilidad con GPU de consumo: no confirmada; no hay build GGUF ni llama.cpp, y la selección por neurona requiere un kernel personalizado.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI documentado; la única vía descrita es la reconstrucción con el harness de `code/` (`core.py`, `fit.py`, `train.py`, `195_final.py`, `load_example.py`).
- Latencia y throughput: no disponibles (no medidos en hardware).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B MoE (este checkpoint) | Denso 27B con 3.584 neuronas FFN activas por token | No disponible | KL 0,240 / top-1 85,3 %; GSM8K 82,8 % | other | Checkpoint de investigación, requiere reconstrucción |
| HauhauCS/Qwen3.8-27B (profesor) | 27B denso, 64 capas | No disponible | GSM8K 87,5 %; KL Q4 0,044 / top-1 93,4 % | No disponible | Pesos BF16 en HF |
| Qwen/Qwen3.8-27B | 27B denso | No disponible | Evaluado en MathVision con prompt fijo | No disponible en la información | Pesos en HF |
| Estudiante previo con selector de bajo rango r256 (A=4096) | 7,8B activos | No disponible | KL 0,527 / top-1 78,2 % | No disponible | Referencia interna del log del autor |

## Limitaciones y advertencias

- No es un modelo autónomo: el checkpoint solo contiene los tensores modificados por el entrenamiento y no puede ejecutarse sin los pesos del profesor y el código de reconstrucción.
- El código es de grado investigación y las rutas apuntan al volumen del laboratorio original, lo que complica la reproducción fuera de ese entorno.
- No existe build GGUF ni llama.cpp; la selección por neurona exige un kernel personalizado no publicado.
- El entrenamiento es muy corto (≈2,5 millones de tokens, 600 pasos), por lo que la cobertura de dominios y la fidelidad al profesor están limitadas al dataset Drafter-SFT.
- La brecha frente al profesor es medible: KL 0,240 y top-1 85,3 % en dev, y 82,8 % frente a 87,5 % en GSM8K; en Q4 la brecha se amplía (KL 0,277 frente a 0,044; top-1 84,5 % frente a 93,4 %).
- La estimación de coste en Q4 (≈6,3 GB por token) no está medida en hardware, solo calculada a partir de los pesos leídos.
- Idiomas soportados no documentados; riesgo de sesgos y alucinaciones heredado del profesor y no evaluado en esta ficha.
- Licencia "other" sin términos detallados: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base antes de cualquier despliegue.
- El checkpoint tiene 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026; no hay validación externa de los resultados reportados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/verysweatydog/qwen3.8-27b-moe
- Modelo base del profesor: https://huggingface.co/HauhauCS/Qwen3.8-27B
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: DaoCloud/Qwen3.8-27B-Drafter-SFT (referenciado en la model card; sin URL directa en la información disponible)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
