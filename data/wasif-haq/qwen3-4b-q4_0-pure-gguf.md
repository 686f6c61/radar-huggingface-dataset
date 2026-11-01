# wasif-haq/Qwen3-4B-Q4_0-pure-GGUF

## Resumen

Qwen3-4B-Q4_0-pure-GGUF es una cuantización del modelo Qwen3-4B de Alibaba Qwen, publicada por el usuario wasif-haq en HuggingFace. Se trata de una conversión directa a formato GGUF para llama.cpp, cuantizada a 4 bits con la variante Q4_0 aplicada de forma "pura", es decir, a todos los tensores del modelo incluyendo los embeddings de tokens y la capa de salida. No hay fine-tuning ni modificación de los pesos: es el modelo original de Qwen redondeado a 4 bits.

El modelo base Qwen3-4B es un transformer denso de 4.022 millones de parámetros (aproximadamente 4B), diseñado para generación de texto, razonamiento y conversación. Esta versión cuantizada ocupa 2,27 GB en disco (2.269.269.472 bytes), lo que la hace apta para ejecución en dispositivos con recursos limitados mediante llama.cpp.

La relevancia de esta publicación es acotada pero concreta: al aplicar Q4_0 a todos los tensores sin excepción, el autor busca un fichero de referencia reproducible para benchmarks on-device, con los mismos bytes en macOS, Android y otros dispositivos compatibles con llama.cpp. Es una pieza de infraestructura para evaluación comparativa más que un modelo con capacidades nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 puro (todos los tensores, incluidos embeddings y capa de salida) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `qwen3-4b-q4_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3-4B: un transformer denso de 4.022 millones de parámetros. Esta publicación no aporta información sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si hubo etapas de RLHF o DPO; esos datos pertenecen a la model card original de Qwen/Qwen3-4B, que no se incluye en la información disponible.

El proceso de creación está documentado por el autor: conversión de los pesos originales a GGUF en precisión f16 mediante `convert_hf_to_gguf.py`, seguida de cuantización con `llama-quantize --pure` a Q4_0 usando llama.cpp b11836. La innovación técnica de esta ficha es precisamente el flag `--pure`, que fuerza la cuantización de todos los tensores sin dejar capas en mayor precisión, garantizando que el modelo completo sea de 4 bits. El tokenizador y la plantilla de chat se conservan sin cambios respecto al repositorio fuente (revisión `1cfa9a7208912126459214e8b04321603b3df60c`).

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y matemáticas heredados del modelo base Qwen3-4B; el alcance concreto no está documentado en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Ejecución en dispositivo mediante llama.cpp con un único fichero GGUF verificable por SHA-256.

## Casos de uso

- Benchmark on-device reproducible: el propósito declarado del autor es disponer de un fichero fijo con los mismos bytes en Mac, Android y otros dispositivos llama.cpp, de modo que las comparativas de velocidad y calidad entre hardware partan de una base idéntica. El SHA-256 publicado permite verificar la integridad del fichero antes de medir.
- Inferencia local en equipos con poca memoria: con 2,27 GB de pesos en Q4_0, el modelo cabe en portátiles y mini-PC sin GPU dedicada, ejecutándose en CPU a través de `llama-cli` o `llama-server`.
- Prototipado rápido de aplicaciones conversacionales: al ser un GGUF compatible con llama.cpp y con endpoints compatibles, se puede levantar un servidor local de chat para validar prompts y plantillas antes de pasar a un despliegue mayor.
- Pruebas de regresión de cuantización: al ser una cuantización "pura" sin capas en mayor precisión, sirve como referencia para medir la degradación de calidad frente a Q4_K_M, Q5_K_M u otras variantes mixtas del mismo modelo base.
- Evaluación de pipelines de CI para modelos: el fichero y su hash permiten integrar una prueba automatizada que descargue, verifique y ejecute una generación de muestra en cada build de una herramienta basada en llama.cpp.
- Distribución de modelos en entornos con ancho de banda limitado: 2,27 GB es un tamaño manejable para incluir un modelo de 4B en imágenes de contenedor o paquetes de aplicación para dispositivos móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos ocupan 2,27 GB; hay que sumar la memoria del contexto KV, que depende de la longitud de contexto configurada (no documentada en esta ficha).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: el tamaño de 2,27 GB permite en principio su ejecución en GPUs de consumo con suficiente VRAM libre, pero no se aportan mediciones concretas.
- Opciones de despliegue: llama.cpp (herramientas `llama-cli`, `llama-server`, `llama-quantize`); el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints, sin más detalle.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wasif-haq/Qwen3-4B-Q4_0-pure-GGUF | 4.022.468.096 | no disponible | Q4_0 puro (todos los tensores) | Apache 2.0 | HuggingFace, 40 descargas |
| Qwen/Qwen3-4B (base) | 4.022.468.096 | no disponible | safetensors en precision original | Apache 2.0 | HuggingFace (modelo oficial) |
| Otras cuantizaciones GGUF de Qwen3-4B | 4.022.468.096 | no disponible | variantes mixtas (Q4_K_M, Q5_K_M, etc.) | Apache 2.0 | HuggingFace |

La diferencia frente al modelo base es exclusivamente la precisión de los pesos: esta versión reduce el tamaño a 2,27 GB a cambio de la pérdida de calidad inherente a 4 bits. Frente a otras cuantizaciones GGUF del mismo modelo, la particularidad es el modo `--pure`, que no deja embeddings ni capa de salida en mayor precisión. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización Q4_0 pura degrada la calidad respecto a los pesos originales en f16 o bf16; el grado exacto de degradación no está medido en esta ficha.
- Al cuantizar también los embeddings y la capa de salida, la pérdida puede ser mayor que en esquemas mixtos que mantienen esas capas en precisión superior; conviene validar la calidad en la tarea concreta antes de usarlo en producción.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas de esta versión; habría que remitirse a la model card de Qwen/Qwen3-4B.
- La longitud de contexto soportada no está indicada; configurar un contexto mayor del que el modelo base admite puede producir resultados incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio contiene una versión modificada (cuantizada) de los pesos originales de Alibaba Cloud / Qwen; se debe conservar el aviso de copyright y la licencia original.
- El repositorio tiene 40 descargas y 0 likes, sin validación comunitaria amplia; verificar el SHA-256 publicado antes de usarlo.
- No hay información sobre fine-tuning, por lo que no debe esperarse ningún comportamiento ajustado más allá del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wasif-haq/Qwen3-4B-Q4_0-pure-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- llama.cpp: no disponible en la información proporcionada (el autor cita la versión b11836 sin enlace)
