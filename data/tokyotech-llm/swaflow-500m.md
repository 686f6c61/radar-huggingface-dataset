# tokyotech-llm/SwaFlow-500M

## Resumen

SwaFlow-500M es un modelo de lenguaje de 686 millones de parámetros desarrollado por AIST y el Institute of Science Tokyo en el marco del programa japonés FRONTia, liderado por METI y NEDO. Se trata de un modelo de flujo riemanniano (hyperspherical flow matching) no autorregresivo, entrenado desde cero sobre el dataset Dolma 3 Mix de AllenAI. Forma parte de la suite SwaFlow, un conjunto de modelos entrenados con una única receta, sobre los mismos datos y en el mismo orden, con el objetivo de facilitar el estudio abierto de los modelos de lenguaje basados en flow matching a lo largo del entrenamiento y de la escala.

El modelo tiene 686M de parámetros (anchura 1280, 24 capas, 10 cabezas, FFN 3584), un vocabulario de 49.152 tokens basado en el tokenizador de SmolLM2 y una longitud de contexto de 2.048 tokens. Su entrenamiento se realizó sobre 32 nodos con 8 GPU NVIDIA H200 cada uno (256 rangos de paralelismo de datos), con un batch global de 4.096 secuencias de 2.048 tokens.

La relevancia de este modelo no reside en su rendimiento para aplicaciones, sino en su carácter completamente abierto como objeto de estudio: el repositorio publica estados completos de entrenamiento (pesos en fp32, momentos de AdamW, schedule de learning rate, posición del data loader y contador de pasos) cada 40B y 20B tokens, lo que permite reanudar el entrenamiento desde cualquier punto. La propia model card advierte de que el modelo no está pensado para aplicaciones: el texto generado es a menudo incoherente y ningún modelo de la suite está alineado para evitar contenido dañino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching riemanniano (hyperspherical flow), no autorregresiva |
| Parámetros totales | 686M (anchura 1280, 24 capas, 10 cabezas, FFN 3584) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de torchtitan (fp32, 256 shards por estado, con momentos de AdamW y metadatos) |

## Arquitectura y entrenamiento

SwaFlow-500M es un transformer no autorregresivo entrenado mediante flow matching sobre una variedad riemanniana (hipersfera). La convención temporal del modelo es α = 1 para datos limpios y α = 0 para ruido puro. Durante el preentrenamiento se muestrea un α por secuencia desde el intervalo [0, 0.125], lo que define el régimen de entrenamiento "uniform". El tokenizador es el de SmolLM2, con un vocabulario de 49.152 tokens.

El entrenamiento se realizó sobre Dolma 3 Mix de AllenAI (6T tokens, licencia ODC-By 1.0), manteniendo sin cambios los pesos de mezcla del dataset. Se usó el optimizador AdamW (β = 0.9, 0.95; weight decay 0.1) con un learning rate de 3e-4 constante tras un warmup de 2.000 pasos y clipping de 2.5. El batch es de 4.096 secuencias × 2.048 tokens por paso, y el hardware fueron 32 nodos × 8 NVIDIA H200. El repositorio incluye estados de preentrenamiento cada 40B tokens (4.768 pasos) desde el paso 4.768 (40B) hasta el 224.096 (1,88T), y después cada 20B tokens hasta el 238.400 (2,00T). Adicionalmente, la carpeta `clean-prefix-2t` contiene estados de mid-training con prefijo limpio ramificados desde el paso 226.480 (1,90T). El paso N corresponde a N × 8.388.608 tokens de entrenamiento.

## Capacidades

- Generación de texto no autorregresiva mediante flow matching riemanniano.
- Modelado de lenguaje en inglés (único idioma declarado).
- Reanudación de entrenamiento desde cualquier estado publicado (pesos, momentos de AdamW, schedule y posición del data loader).
- Carga de pesos independiente del estado del optimizador mediante `from_pretrained` del paquete de código SwaFlow.
- Entrenamiento con un número distinto de GPU al original (siempre que el número de GPU divida 256), con resharding de pesos y momentos.
- Soporte de mid-training con prefijo limpio (`clean-prefix-2t`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito según la información disponible.

## Casos de uso

- Investigación sobre flow matching riemanniano: el modelo permite estudiar la dinámica de entrenamiento de modelos de flujo no autorregresivos gracias a los estados intermedios publicados cada 40B y 20B tokens.
- Reproducción de experimentos: los checkpoints completos permiten reanudar el entrenamiento desde cualquier paso, lo que facilita la verificación de resultados y el estudio de la estabilidad del entrenamiento.
- Estudio de escalado: al formar parte de la suite SwaFlow con varios tamaños entrenados bajo una misma receta y orden de datos, permite comparar el comportamiento a distintas escalas.
- Comparación con gemelos autorregresivos: la suite incluye modelos autorregresivos entrenados con los mismos datos, lo que permite analizar las diferencias entre paradigmas de modelado.
- Análisis de la influencia del sampling de α: la variante `uniform` y la de `clean-prefix-2t` permiten estudiar cómo afecta la distribución del tiempo de flujo al aprendizaje.
- Docencia y formación: el modelo y sus estados completos sirven como material didáctico para entender el entrenamiento de modelos de lenguaje a gran escala con torchtitan.
- Desarrollo de infraestructura de entrenamiento: el código y los estados permiten probar estrategias de resharding, gradient accumulation y conversión de la posición del data loader entre configuraciones de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona cualitativamente que, en tareas de elección múltiple, todos los gemelos autorregresivos de la suite (incluido el de 150M) obtienen puntuaciones medias superiores al modelo de flujo final de 3B, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 686M de parámetros en fp32, los pesos ocupan aproximadamente 2,7 GB; en fp16/bf16, unos 1,4 GB, aunque no se documentan formatos cuantizados ni requisitos oficiales de inferencia.
- GPU recomendadas para entrenamiento: el run original usó 32 nodos × 8 NVIDIA H200 (256 rangos de paralelismo de datos).
- Entrenamiento en otras configuraciones: es posible reanudar con un número distinto de GPU siempre que el número de GPU divida 256, ajustando el gradient accumulation para mantener el batch global de 4.096 secuencias.
- GPU de consumo: no se documenta soporte para GPU de consumo ni requisitos mínimos; el modelo se distribuye como checkpoints de torchtitan en fp32 con estado del optimizador, lo que implica un tamaño de repositorio de 496,8 GB.
- Opciones de despliegue: el código oficial es el paquete SwaFlow (basado en torchtitan) disponible en GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwaFlow-500M | 686M | 2.048 | Flow matching riemanniano no autorregresivo | Apache 2.0 | Pesos y estados de entrenamiento en HF |
| Gemelos autorregresivos de la suite SwaFlow | Varios tamaños (incluido 150M) | No disponible | Autorregresivo | No disponible en la información | Entrenados con los mismos datos según la model card |
| Modelo de flujo final de 3B de la suite SwaFlow | 3B | No disponible | Flow matching riemanniano | No disponible en la información | Mencionado en la model card |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no está pensado para aplicaciones: la model card indica explícitamente que el texto generado por los modelos de flujo, incluidos los ajustados por instrucciones, es a menudo incoherente.
- Ningún modelo de la suite está alineado para evitar contenido dañino; no se ha aplicado RLHF ni DPO para seguridad.
- En tareas de elección múltiple, todos los gemelos autorregresivos (incluido el de 150M) superan en media al modelo de flujo final de 3B, lo que sugiere un rendimiento limitado del paradigma en su estado actual.
- Contexto limitado a 2.048 tokens, insuficiente para muchas aplicaciones de contexto largo.
- Solo se declara soporte de inglés.
- La reanudación del entrenamiento no es una continuación bit a bit: no se incluye el estado del generador de números aleatorios y, con distinto número de GPU, el orden de las sumas en coma flotante cambia, provocando deriva en los últimos bits.
- El repositorio ocupa 496,8 GB, lo que supone un coste de almacenamiento y descarga considerable.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero el dataset Dolma 3 Mix está bajo ODC-By 1.0 y el tokenizador de SmolLM2 bajo Apache 2.0, condiciones que deben respetarse.
- No se documentan formatos cuantizados ni herramientas de despliegue estándar, lo que dificulta su uso fuera del ecosistema torchtitan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-500M
- Colección SwaFlow Suite: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Código: https://github.com/swallow-llm/swaflow-suite
- Documentación de reproducción: https://github.com/swallow-llm/swaflow-suite/blob/main/docs/reproduce.md
- Dataset Dolma 3 Mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Tokenizador SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
