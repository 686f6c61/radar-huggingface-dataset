# tetracta/Chimera-1-Qwen2.5-3B

## Resumen

Chimera-1-Qwen2.5-3B es un modelo de lenguaje de 3.085.938.688 parámetros (3B) desarrollado por Tetracta AI como demostración de método, no como asistente de producción. Se construye mediante un merge TIES (trim, elect sign, disjoint mean) sin entrenamiento adicional a partir de dos especialistas derivados por fine-tuning ligero de Qwen2.5-3B-Instruct. El objetivo es responder empíricamente si es posible combinar dos habilidades especializadas en un único modelo sin degradar las capacidades generales del modelo base.

El modelo parte de la arquitectura Qwen2, con formato de chat ChatML idéntico al de Qwen2.5-3B-Instruct y licencia Qwen Research (no comercial). Las dos habilidades implantadas son conversión de números romanos y operaciones carácter a carácter sobre palabras; se eligieron porque el modelo base rinde mal en ellas (76% y 45% respectivamente), lo que deja margen de mejora medible.

La relevancia del modelo es metodológica: documenta una ley empírica validada en 10 experimentos (sinergia de merge = margen de mejora × complementariedad × proximidad al base) y publica un catálogo honesto de fallos, incluido un control negativo en el que un merge de modelo de código cae al 0%. No aporta capacidades nuevas respecto al base en benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles declarado; el modelo base soporta mas idiomas) |
| Licencia | Qwen Research License (qwen-research, no comercial) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 3B parámetros en precisión bf16. No hay entrenamiento en la fase de merge: los dos especialistas se obtuvieron mediante fine-tuning ligero de solo las capas superiores sobre Qwen2.5-3B-Instruct, y la fusión se realizó con TIES (task-vector trim, elección de signo y media disjunta), un algoritmo que opera sobre vectores de tarea y se ejecuta en CPU en minutos.

La innovación documentada no es arquitectónica sino metodológica. Tetracta valida empíricamente que la sinergia del merge depende de tres factores: margen de mejora del base en la tarea, complementariedad real entre los especialistas y proximidad de cada padre al modelo base compartido. También reporta un resultado negativo relevante: tres intentos de merge guiado por mapas internos de divergencia (X-Ray) no superaron a TIES uniforme en promedio, y la interpretación original de la model card sobre la capacidad predictiva de X-Ray fue retirada formalmente el 6 de septiembre de 2026.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML idéntico al base.
- Conversión de números romanos a arábigos y viceversa, con precisión medida del 89% en el conjunto de 1.210 preguntas (91,2% en el subconjunto de 80 preguntas de números romanos).
- Operaciones carácter a carácter sobre palabras (por ejemplo, deletrear al revés), con 71% de acierto en el conjunto completo (62,5% en el subconjunto de 80).
- Razonamiento general y conocimiento enciclopédico equivalentes al base: MMLU 66,5%, ARC-Challenge 81,5%, HellaSwag 71,3%.
- Comprensión lectora multilingüe heredada del base: Belebele en inglés, turco, árabe, chino y ruso.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Investigación sobre model merging: sirve como caso de referencia reproducible para estudiar TIES y comparar con otras técnicas de fusión sin coste de entrenamiento.
- Validación de arneses de evaluación: el modelo incluye un sanity check con MMLU del base (67,0%) que permite verificar que un harness mide correctamente antes de confiar en sus resultados.
- Docencia y divulgación sobre interpretabilidad: los mapas de divergencia por capa y el catálogo de fallos publicados permiten ilustrar qué se puede y qué no se puede predecir del merge desde los pesos.
- Pruebas de regresión de capacidad: útil para comprobar que una edición de pesos tiene un radio de impacto medible (máximo |Δ| de 1,3 pp en 1.050 preguntas estándar).
- Experimentos controlados de especialización: las dos habilidades implantadas son verificables de forma automática, lo que facilita diseñar experimentos con métrica objetiva.
- Evaluación de licencias y despliegue de modelos de investigación: al heredar la Qwen Research License, sirve para probar pipelines internos de inferencia en entornos no comerciales.

## Benchmarks y rendimiento

Comparativa publicada por el autor sobre 1.210 preguntas, mismo harness para ambos modelos:

| Benchmark | Base | Chimera-1 | Δ |
|---|---|---|---|
| MMLU (200) | 67,0% | 66,5% | −0,5 |
| ARC-Challenge (200) | 81,5% | 81,5% | 0,0 |
| HellaSwag (150) | 70,0% | 71,3% | +1,3 |
| Belebele-EN (200) | 51,0% | 50,5% | −0,5 |
| Belebele-TR (75) | 41,3% | 41,3% | 0,0 |
| Belebele-AR (75) | 50,7% | 49,3% | −1,3 |
| Belebele-ZH (75) | 50,7% | 50,7% | 0,0 |
| Belebele-RU (75) | 49,3% | 49,3% | 0,0 |
| Números romanos (80) | 82,5% | 91,2% | +8,8 |
| Operaciones con letras (80) | 37,5% | 62,5% | +25,0 |

Resultados de la tabla resumen del autor (conjunto completo de 1.210 preguntas): habilidad A 89%, habilidad B 71%, Belebele-EN 50%, perplejidad 68,1 (idéntica al base), chat idéntico bit a bit al base.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica entre 8 y 10 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB; en 4 bits, alrededor de 2-2,5 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con 16 GB o más para bf16 sin cuantizar (RTX 4090, A100, H100); GPUs de 8 GB pueden ejecutar versiones cuantizadas.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en bf16, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (el autor proporciona snippet con `AutoModelForCausalLM` y `dtype="bfloat16"`); vLLM, llama.cpp, Ollama y TGI son compatibles con la arquitectura Qwen2, aunque el autor no los documenta explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Chimera-1-Qwen2.5-3B | 3,09B | no disponible | Qwen Research (no comercial) | Merge TIES de dos especialistas; MMLU 66,5%, Romanos 91,2%, Letras 62,5% |
| Qwen2.5-3B-Instruct | 3,09B | no disponible en la fuente | Qwen Research (no comercial) | Base del anterior; MMLU 67,0%, Romanos 82,5%, Letras 37,5% |
| Especialista A (Tetracta) | 3,09B | no disponible | Qwen Research | Fine-tuning de capas superiores; Romanos 98%, Letras 45% |
| Especialista B (Tetracta) | 3,09B | no disponible | Qwen Research | Fine-tuning de capas superiores; Romanos 80%, Letras 75% |

No se dispone de comparación con modelos de terceros de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial y de investigación; no apta para producción comercial sin licencia adicional de Qwen.
- Modelo de demostración de método: el autor lo declara explícitamente como no destinado a asistente de producción.
- Las dos habilidades implantadas son deliberadamente simples y verificables; los resultados no garantizan que el merge funcione con habilidades complejas o con padres que hayan derivado mucho del base.
- Riesgo de alucinación: no evaluado ni documentado en la información proporcionada.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: la model card declara solo inglés, aunque el base soporta más idiomas y los benchmarks Belebele cubren TR, AR, ZH y RU con resultados equivalentes al base.
- La interpretación original sobre la capacidad predictiva de X-Ray fue retirada el 6 de septiembre de 2026; cualquier resultado de interpretabilidad citado en versiones previas de la card no es evidencia vigente.
- El control negativo del autor muestra que merges agresivos con padres muy alejados del base pueden degradar habilidades hasta el 0% (caso del modelo de código), lo que exige validación específica antes de reutilizar la receta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tetracta/Chimera-1-Qwen2.5-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Write-up de investigación y catálogo de fallos: https://www.tetracta.ai/research.html
- Servicio Model X-Ray: https://www.tetracta.ai/xray.html
- Registro de corrección de Model X-Ray: https://www.tetracta.ai/model-xray/correction/
