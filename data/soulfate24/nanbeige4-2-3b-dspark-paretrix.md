# Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix

## Resumen

Nanbeige4.2-3B-DSpark-Paretrix es una distribución de pesos cuantizados en formato GGUF del modelo Nanbeige4.2-3B, publicada por el usuario Soulfate24 dentro de su suite de cuantización propia denominada Paretrix. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresión: parte del modelo base Nanbeige4.2-3B (aproximadamente 4,17 mil millones de parámetros) y de su módulo draft DSpark, y genera varias decenas de recetas de cuantización con distintos compromisos entre tamaño en disco y fidelidad respecto al modelo original.

El problema que resuelve es concreto: permitir ejecutar un modelo de casi 4.200 millones de parámetros en hardware de consumo con un consumo de memoria que va desde los 1.675 MiB del tier más agresivo (Femto-21pc) hasta los 4.229 MiB del Q8_0 convencional. La suite Paretrix se apoya en `llama-imatrix` para medir la sensibilidad real de activaciones por clase de tensor y asignar anchos de bits de forma no uniforme, en lugar de aplicar una única familia de cuantización a toda la red.

Es relevante ahora porque incluye el módulo draft DSpark, lo que habilita decodificación especulativa sobre el propio artefacto cuantizado, y porque publica métricas objetivas de degradación (PPL, KLD, RMS Δp y top-p) para cada tier. El repositorio tiene, en el momento de la consulta, 0 descargas y 0 likes, por lo que se trata de una publicación reciente y sin validación externa acumulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM); no se detalla la variante interna en la informacion disponible |
| Parametros totales | 4.169.800.704 (≈4,17 B), dato de safetensors |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ3_M (stock con imatrix) y tiers propios Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El artefacto no documenta el entrenamiento del modelo subyacente. La informacion disponible indica que Nanbeige4.2-3B es un modelo de generacion de texto cargado mediante la libreria `transformers` y compatible con `llama.cpp`, con 4.169.800.704 parametros y una ventana de contexto no especificada en la ficha. No se proporcionan datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si hubo fases de RLHF o DPO.

La innovacion tecnica relevante esta en la capa de cuantizacion. Paretrix se define como una suite empirica y sensible a activaciones que mide la sensibilidad real (ΔKLD/MiB) por clase de tensor mediante `llama-imatrix`, aprende tablas de tasa a partir de campanas cruzadas entre arquitecturas y asigna anchos de bits bajo objetivos exactos de presupuesto. Segun el autor, aplica recetas planas cuando la uniformidad es optima y un problema de mochila calibrado por tasa cuando la heterogeneidad compensa. Ademas, el paquete incorpora el draft DSpark para habilitar decodificacion especulativa sobre los pesos cuantizados.

## Capacidades

- Generacion de texto conversacional en ingles y chino, heredada del modelo base Nanbeige4.2-3B.
- Distribucion en multiples tamanos de cuantizacion que preservan la funcion de generacion con distintos niveles de fidelidad.
- Decodificacion especulativa: el repositorio incluye el modulo draft DSpark, lo que permite acelerar la inferencia emparejando el modelo objetivo con un borrador.
- Ejecucion local en `llama.cpp` y ecosistemas compatibles con GGUF.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Asistente conversacional bilingue ingles-chino: el modelo soporta ambos idiomas de forma declarada, por lo que puede desplegarse como chatbot de atencion en mercados que requieran esas dos lenguas sin necesidad de un modelo mayor.
- Despliegue local en portatiles con GPU discreta: los tiers Mini-30pc (2.388 MiB) o Nano-27pc (2.152 MiB) caben en GPUs de 4-6 GB de VRAM, permitiendo un asistente offline sobre hardware de gama media.
- Aceleracion de inferencia mediante decodificacion especulativa: al incluir el draft DSpark, se puede configurar el modelo objetivo junto con el borrador para reducir la latencia por token en servicios interactivos.
- Servicio de chat de alta concurrencia: con el tier Quality-36pc (2.846 MiB) o Compact-33pc (2.629 MiB) es posible levantar varias instancias por GPU, aumentando el throughput agregado a costa de una degradacion medida y acotada.
- Computacion en el borde o entornos con memoria restringida: el tier Femto-21pc (1.675 MiB) permite ejecutar generacion de texto en dispositivos con menos de 2 GB de presupuesto de modelo, asumiendo un ΔPPL de +6,5677.
- Investigacion en cuantizacion: la tabla publicada de PPL, KLD, RMS Δp y top-p por tier permite reproducir analisis comparativos entre cuantizacion uniforme y asignacion no uniforme de bits por tensor.
- Generacion de texto por lotes en pipelines internos: para tareas donde la calidad del tier Q8_0 es excesiva, los tiers intermedios reducen el coste de memoria y el tiempo de carga del modelo.

## Benchmarks y rendimiento

Metricas de cuantizacion publicadas por el autor (PPL, ΔPPL, KLD, RMS Δp, top-p y clasificacion Pareto):

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p | Pareto |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Q8_0 (stock) | 4229 | 31,5657 | +1,6702 | 0,0144 | 3,01 % | 95,5 % | si |
| Fidelity-48pc | 3821 | 31,8994 | +2,0039 | 0,0266 | 3,97 % | 93,8 % | si |
| Precision-42pc | 3266 | 32,0971 | +2,2016 | 0,0467 | 4,93 % | 91,9 % | equivalente a Q6_K-imx |
| Q6_K-imx (stock) | 3266 | 32,0971 | +2,2016 | 0,0467 | 4,93 % | 91,9 % | equivalente a Precision-42pc |
| Q5_K_M-imx (stock) | 2849 | 32,0553 | +2,1598 | 0,0872 | 6,58 % | 88,2 % | inferior a Quality-36pc |
| Quality-36pc | 2846 | 31,7395 | +1,8440 | 0,0714 | 5,86 % | 89,2 % | si |
| Compact-33pc | 2629 | 31,7929 | +1,8974 | 0,1115 | 7,53 % | 86,5 % | si |
| Mini-30pc | 2388 | 30,7090 | +0,8135 | 0,1841 | 9,43 % | 82,8 % | si |
| IQ4_XS-imx (stock) | 2268 | 32,7700 | +2,8745 | 0,2093 | 10,24 % | 81,7 % | si |
| Nano-27pc | 2152 | 31,3016 | +1,4061 | 0,2287 | 10,51 % | 80,4 % | si |
| IQ3_M-imx (stock) | 1985 | 33,2114 | +3,3158 | 0,4948 | 15,12 % | 71,2 % | inferior a Pico-24pc |
| Pico-24pc | 1906 | 30,0424† | +0,1469 | 0,4023 | 14,04 % | 73,2 % | si |
| Femto-21pc | 1675 | 36,4632 | +6,5677 | 0,5857 | 16,35 % | 68,3 % | si |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos, segun tier: Femto-21pc ≈1,7 GB; Pico-24pc ≈1,9 GB; Nano-27pc ≈2,2 GB; IQ4_XS-imx ≈2,3 GB; Mini-30pc ≈2,4 GB; Compact-33pc ≈2,6 GB; Quality-36pc ≈2,8 GB; Q5_K_M-imx ≈2,8 GB; Precision-42pc / Q6_K-imx ≈3,3 GB; Fidelity-48pc ≈3,8 GB; Q8_0 ≈4,2 GB. Hay que anadir el espacio para la cache KV, cuyo tamano depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal y 4-8 GB de VRAM para los tiers bajos y medios. Para el tier Q8_0 con contexto amplio conviene disponer de 6-8 GB o mas.
- Cabe en GPU de consumo: si. Los tiers Femto-21pc a Mini-30pc caben en tarjetas de 4-6 GB (por ejemplo, GTX 1650, RTX 3050, RTX 3060 6 GB, RTX 4060 8 GB); los tiers de 3-4 GB requieren 6-8 GB, por lo que tambien entran en RTX 3060 12 GB, RTX 4060 Ti o superiores.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, servidores compatibles con GGUF y cualquier runtime que soporte el formato; el autor etiqueta el repositorio como compatible con endpoints.
- Decodificacion especulativa: el repositorio incluye el modulo draft DSpark para emparejarlo con el modelo objetivo y reducir latencia, sujeto a la compatibilidad del runtime utilizado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.2-3B (base) | 4,17 B | No disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; sin datos de tamano en el repositorio consultado |
| Nanbeige4.2-3B-DSpark | No disponible | No disponible | Apache 2.0 | No disponible | Variante con modulo draft para decodificacion especulativa |
| Nanbeige4.2-3B-DSpark-ASHQ1-Remix-GGUF | No disponible | No disponible | No disponible | GGUF | Otra cuantizacion del mismo linaje publicada por el mismo autor |
| Este repositorio (Quality-36pc) | 4,17 B | No disponible | Apache 2.0 | GGUF | 2.846 MiB, PPL 31,7395, KLD 0,0714 frente a Q5_K_M-imx con 2.849 MiB, PPL 32,0553, KLD 0,0872 |

No se dispone de datos comparativos con modelos de otras familias (por ejemplo, Llama o Qwen de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin descargas ni likes registrados en el momento de la consulta: no existe validacion independiente de la calidad real de los tiers publicados.
- Las cuantizaciones Paretrix son recetas no estandar: los identificadores Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc y Femto-21pc no corresponden a familias de cuantizacion conocidas y pueden no ser reconocidas correctamente por todas las herramientas.
- Los tiers mas agresivos degradan la calidad de forma medible: Femto-21pc registra un ΔPPL de +6,5677 y una KLD de 0,5857, con un top-p del 68,3 % frente al 95,5 % del Q8_0.
- La tabla muestra anomalias que conviene verificar antes de sacar conclusiones: algunos tiers comprimidos presentan una PPL inferior a la del Q8_0 y el valor de Pico-24pc aparece marcado con una daga (†) cuyo significado no se explica.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Longitud de contexto no disponible, lo que impide estimar el coste de la cache KV y el comportamiento en conversaciones largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, no cuantificado en la ficha.
- Licencia Apache 2.0, que permite uso comercial, pero deben verificarse las condiciones del modelo base Nanbeige4.2-3B y del modulo DSpark por si imponen restricciones adicionales.
- No hay resultados de benchmarks de tareas publicados, por lo que no puede contrastarse el rendimiento funcional mas alla de las metricas de perplexidad y divergencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Modulo draft DSpark: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Cuantizacion alternativa del mismo linaje: https://huggingface.co/Soulfate24/Nanbeige4.2-3B-DSpark-ASHQ1-Remix-GGUF
- Ficha en ModelScope: https://www.modelscope.cn/models/nanbeige/Nanbeige4.2-3B
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/nanbeige4-2-3b.html
- Analisis de ajuste para DGX Spark: https://howtospark.com/models/Nanbeige/Nanbeige4.2-3B
