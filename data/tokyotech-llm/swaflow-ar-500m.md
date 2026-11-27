# tokyotech-llm/SwaFlow-AR-500M

## Resumen

SwaFlow-AR-500M es el gemelo autorregresivo de SwaFlow-500M, un Transformer de 613 millones de parametros entrenado mediante prediccion del siguiente token (next-token prediction) sobre exactamente los mismos datos, en el mismo orden, con el mismo batch y el mismo calendario de learning rate que el modelo de flujo (flow model) correspondiente. Lo desarrollan AIST (Instituto Nacional de Ciencia y Tecnologia Industrial Avanzada de Japon) y el Institute of Science Tokyo en el marco del programa FRONTia, impulsado por METI y NEDO.

El modelo forma parte de la suite SwaFlow, un conjunto de modelos entrenados bajo una unica receta sobre los mismos datos y en el mismo orden, cuyo objetivo es abrir a la investigacion los modelos de lenguaje basados en flujos riemannianos. La relevancia de este "gemelo" autorregresivo es servir de referencia de control: permite comparar directamente el rendimiento de un modelo de flujo con el de un modelo autoregresivo clasico entrenado en condiciones identicas.

El repositorio no contiene un modelo listo para inferencia, sino estados de entrenamiento completos (checkpoints de torchtitan en fp32 con momentos de AdamW, posicion del data-loader y contador de pasos) cada 40.000 millones de tokens, desde 40B hasta 2,00T de tokens. La arquitectura es un Transformer causal de 1.280 de ancho, 24 capas, 10 cabezas y FFN de 3.584, con contexto de 2.048 tokens y vocabulario de 49.152 (tokenizer de SmolLM2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (autoregresivo), sin condicionamiento temporal |
| Parametros totales | 613M (ancho 1280, 24 capas, 10 cabezas, FFN 3584) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los estados se publican en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (pesos y estados); tokenizer SmolLM2 Apache 2.0; datos ODC-By 1.0 |
| Formato de pesos | checkpoints de torchtitan (fp32, 128 shards por estado + archivo `.metadata` de 7,55 GB) |

## Arquitectura y entrenamiento

El modelo es un Transformer causal estandar de 613M de parametros con atencion causal y sin condicionamiento temporal, a diferencia del modelo de flujo del que es gemelo. El vocabulario de 49.152 tokens proviene del tokenizer de SmolLM2. El entrenamiento usa AdamW (β = 0,9 y 0,95; weight decay 0,1), learning rate constante de 3e-4 tras un warmup de 2.000 pasos, y clipping de gradiente de 2,5. El batch global es de 4.096 secuencias de 2.048 tokens por paso, ejecutado sobre 16 nodos con 8 GPU NVIDIA H200 cada uno (128 rangos de paralelismo de datos).

Los datos de entrenamiento son Dolma 3 Mix (allenai/dolma3_mix-6T) del Allen Institute for AI, con sus pesos de mezcla sin modificar, bajo licencia ODC-By 1.0. El modelo se entreno hasta 2,00T de tokens (paso 238.400; cada paso equivale a 8.388.608 tokens). El repositorio publica estados cada 40B tokens (cada 4.768 pasos) desde el paso 4.768 hasta el 238.400. La innovacion metodologica no esta en la arquitectura sino en el diseno experimental: todos los modelos de la suite comparten receta, datos y orden de datos, lo que permite aislar el efecto del paradigma de modelado (flujo frente a autorregresivo) y estudiar la evolucion del entrenamiento a distintas escalas.

## Capacidades

- Generacion de texto autorregresiva basica por prediccion del siguiente token.
- Modelado de lenguaje en ingles sobre el corpus Dolma 3 Mix.
- Punto de control reproducible: permite reanudar el entrenamiento desde cualquier estado publicado, con resharding de pesos y momentos del optimizador y conversion de la posicion del data-loader al nuevo numero de rangos.
- Servir como referencia de control (baseline) para comparar modelos de flujo riemannianos en tareas de eleccion multiple.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni razonamiento multi-paso documentado.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.
- No es un modelo ajustado por instrucciones (no instruction-tuned).

## Casos de uso

- Investigacion sobre paradigmas de modelado: comparar el gemelo autorregresivo con el modelo de flujo SwaFlow-500M en tareas de eleccion multiple para medir la brecha entre ambos paradigmas bajo condiciones de entrenamiento identicas.
- Estudio de la dinamica de entrenamiento: cargar los estados intermedios (cada 40B tokens) para analizar como evolucionan las perdidas y las representaciones a lo largo de 2T de tokens.
- Reproduccion de experimentos: reanudar el entrenamiento desde cualquier checkpoint con un numero distinto de GPU (siempre que divida 256), manteniendo el batch global de 4.096 secuencias y el mismo orden de datos.
- Baseline en articulos academicos: usar el modelo como referencia autoregresiva de 613M parametros entrenada sobre Dolma 3 Mix para comparaciones controladas de arquitecturas.
- Analisis de escalado: estudiar la suite completa (varios tamanos bajo una misma receta) para investigar leyes de escalado y efectos del tamano en modelos de flujo frente a autorregresivos.
- Experimentos de alineacion y evaluacion: partir de los pesos finales (paso 238.400) para estudios propios de fine-tuning o evaluacion, dado que la licencia Apache 2.0 lo permite.
- Docencia e investigacion reproducible: el formato de checkpoint completo (con estado del optimizador y posicion del data-loader) facilita la replicacion exacta de experimentos en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente senala, de forma cualitativa, que en tareas de eleccion multiple todos los gemelos autorregresivos de la suite, incluido el de 150M, obtienen de media puntuaciones superiores al modelo de flujo final de 3B.

## Requisitos de hardware

- VRAM estimada para inferencia: con 613M parametros en fp32, los pesos ocupan aproximadamente 2,45 GB; en bf16/fp16, unos 1,23 GB. No se documentan cuantizaciones oficiales.
- Los estados completos de entrenamiento son mucho mayores: cada estado incluye pesos fp32, momentos de AdamW, calendario de learning rate, posicion del data-loader y contador de pasos, con 128 shards y un archivo `.metadata` de 7,55 GB. El repositorio completo ocupa 377,3 GB.
- GPU recomendadas para inferencia: cualquier GPU con al menos 4-8 GB de VRAM para los pesos en fp32 o bf16; una RTX 4090 o superior es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas.
- Despliegue: la carga oficial se realiza mediante `torchtitan.models.swaflow.hf.from_pretrained` con el codigo de la suite SwaFlow. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entrenamiento original: 16 nodos x 8 NVIDIA H200 (128 rangos de paralelismo de datos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwaFlow-AR-500M | 613M | 2.048 | Autorregresivo (next-token) | Apache 2.0 | Estados de entrenamiento (checkpoints de torchtitan) |
| SwaFlow-500M | no disponible en la informacion | no disponible | Flujo riemanniano | Apache 2.0 (segun suite) | Pesos del modelo de flujo |
| SwaFlow (modelo de flujo de 3B) | 3B | no disponible | Flujo riemanniano | Apache 2.0 (segun suite) | Pesos del modelo de flujo |
| SmolLM2-135M | 135M | no disponible | Autorregresivo | Apache 2.0 | Pesos y tokenizer |

La comparacion mas directa es con SwaFlow-500M, su gemelo de flujo entrenado con la misma receta y datos. Segun la model card, los gemelos autorregresivos superan de media al modelo de flujo de 3B en tareas de eleccion multiple, lo que sugiere una brecha de calidad a favor del paradigma autorregresivo en esta suite. No se dispone de datos cuantitativos de benchmarks para completar la comparativa.

## Limitaciones y advertencias

- El modelo no esta pensado para aplicaciones: la model card indica explicitamente que la suite SwaFlow tiene fines de estudio y no de produccion.
- El texto generado por los modelos de flujo de la suite es a menudo incoherente; este gemelo autorregresivo sirve como referencia de comparacion, no como modelo de calidad.
- Ninguno de los modelos esta ajustado para evitar contenido danino.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo.
- Solo soporta ingles.
- No es un modelo instruction-tuned: no sigue instrucciones de forma fiable.
- El repositorio contiene estados de entrenamiento, no un modelo empaquetado para inferencia directa; requiere el codigo de la suite para cargar los pesos.
- La reanudacion del entrenamiento con distinto numero de GPU no es una continuacion bit-exacta: las sumas en coma flotante sobre rangos y microbatches se realizan en distinto orden y los pesos divergen en los ultimos bits.
- El numero de GPU debe dividir 256 para mantener el batch global de 4.096 secuencias.
- La build de datos debe ser exactamente `production_6t`, cuya suma de verificacion se comprueba al cargar.
- Riesgo de sesgos y alucinacion inherente a un modelo de lenguaje entrenado sobre Dolma 3 Mix, sin filtrado de seguridad documentado.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero los datos de entrenamiento estan bajo ODC-By 1.0 y el tokenizer bajo Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-AR-500M
- Modelo de flujo gemelo: https://huggingface.co/tokyotech-llm/SwaFlow-500M
- Coleccion SwaFlow: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Codigo de la suite: https://github.com/swallow-llm/swaflow-suite
- Documentacion de reproduccion: https://github.com/swallow-llm/swaflow-suite/blob/main/docs/reproduce.md
- Dataset Dolma 3 Mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Tokenizer SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
