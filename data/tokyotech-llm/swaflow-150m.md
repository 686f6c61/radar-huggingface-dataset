# tokyotech-llm/SwaFlow-150M

## Resumen

SwaFlow-150M es un modelo de lenguaje de 175 millones de parámetros desarrollado por AIST e Institute of Science Tokyo (bajo el programa japonés FRONTia, liderado por METI y NEDO) que implementa un paradigma poco habitual: un modelo de flujo riemanniano (hyperspherical flow matching) no autorregresivo. En lugar de predecir el siguiente token, el modelo aprende una transformación continua desde ruido puro (α = 0) hasta datos limpios (α = 1) sobre una variedad esférica, lo que lo sitúa en la intersección entre los modelos de difusión y los modelos de lenguaje clásicos.

El modelo forma parte de la suite SwaFlow, un conjunto de modelos de varios tamaños entrenados con una receta idéntica sobre los mismos datos y en el mismo orden, con el objetivo de facilitar el estudio abierto de este tipo de arquitecturas a lo largo del entrenamiento y del escalado. La versión publicada aquí es la de 150M (175M parámetros reales), con una ventana de contexto de 2.048 tokens y un vocabulario de 49.152 tokens basado en el tokenizador de SmolLM2.

Es relevante ahora porque el repositorio no contiene solo pesos finales, sino todos los checkpoints intermedios de entrenamiento (fp32, con momentos de AdamW, estado del data loader y contador de pasos), lo que permite reproducir y estudiar la dinámica de entrenamiento de un modelo de flujo. No obstante, sus propios autores advierten que no está pensado para aplicaciones: el texto generado es a menudo incoherente y los modelos autorregresivos gemelos del mismo tamaño superan a los modelos de flujo en tareas de elección múltiple.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con flow matching riemanniano (hyperspherical flow) |
| Parámetros totales | 175M (width 768, 12 capas, 12 cabezas, FFN 2048) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (los checkpoints publicados son fp32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de torchtitan (fp32, 256 shards por estado, con fichero `.metadata` de 2,27 GB) |

## Arquitectura y entrenamiento

SwaFlow-150M es un transformer de 12 capas y 768 de anchura que no genera texto de forma autorregresiva. En su lugar, aplica flow matching sobre una hipersfera: cada secuencia se entrena con un valor α muestreado, donde α = 1 corresponde a datos limpios y α = 0 a ruido puro, y el modelo aprende el campo de flujo que transporta el ruido hacia el dato. La variante `uniform` muestrea un α por secuencia en el intervalo [0, 0,150], mientras que la variante `clean-prefix-2t` aplica un mid-training con prefijo limpio a partir del estado de 1,90T tokens.

El entrenamiento se realizó desde cero sobre Dolma 3 Mix de AllenAI (ODC-By 1.0), manteniendo las ponderaciones de mezcla originales, con un batch global de 4.096 secuencias × 2.048 tokens por paso. El optimizador es AdamW (β = 0,9 y 0,95, weight decay 0,1), con LR constante de 6e-4 tras un warmup de 2.000 pasos y clipping de 2,5. La infraestructura fue de 32 nodos × 8 GPU NVIDIA H200 (256 rangos de paralelismo de datos). El repositorio incluye estados cada 40B tokens durante el preentrenamiento (de 40B a 1,88T) y cada 20B tokens en la fase final (de 1,90T a 2,00T), lo que suma 72,4 GB de checkpoints.

## Capacidades

- Generación de texto no autorregresiva mediante flow matching riemanniano, con muestreo iterativo desde ruido hasta dato limpio.
- Modelado de lenguaje en inglés, condicionado por el tokenizador de SmolLM2 y un vocabulario de 49.152 tokens.
- Reanudación de entrenamiento desde cualquier checkpoint publicado, con resharding de pesos y momentos de AdamW al número de GPUs del usuario.
- Estudio de la dinámica de entrenamiento: los estados intermedios permiten analizar la evolución del modelo a lo largo de 2 billones de tokens.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso de forma fiable (los propios autores indican que el texto generado es a menudo incoherente).
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre flow matching riemanniano: el modelo permite estudiar cómo evoluciona un campo de flujo sobre la hipersfera a lo largo de 2T tokens de entrenamiento, comparando estados intermedios con los finales.
- Reproducción de experimentos de escalado: la suite SwaFlow incluye modelos de varios tamaños entrenados con la misma receta y el mismo orden de datos, lo que permite aislar el efecto del tamaño del modelo en el rendimiento del flujo.
- Estudio de la dinámica de entrenamiento: los checkpoints intermedios (cada 40B y 20B tokens) permiten analizar curvas de pérdida, formación de representaciones y estabilidad del optimizador sin necesidad de reentrenar.
- Comparación con modelos autorregresivos gemelos: la suite incluye twins autorregresivos entrenados sobre los mismos datos, lo que facilita comparaciones controladas entre paradigmas de generación.
- Docencia y divulgación: el modelo es lo bastante pequeño (175M) como para ejecutarse en una sola GPU consumer y servir de ejemplo práctico de modelos de flujo no autorregresivos en cursos de aprendizaje profundo.
- Desarrollo de infraestructura de entrenamiento: el formato de checkpoint de torchtitan y las herramientas de reanudación publicadas sirven como referencia para implementar pipelines de entrenamiento distribuido con reanudación exacta de data loader y scheduler.
- Análisis de sesgos y calidad de generación en modelos de flujo: al ser un modelo abierto con estados intermedios, permite auditar cómo evoluciona la coherencia del texto a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que, en tareas de elección múltiple, todos los twins autorregresivos de la suite (incluido el de 150M) obtienen de media puntuaciones superiores al modelo de flujo final de 3B, sin proporcionar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 175M parámetros en fp32 los pesos ocupan aproximadamente 0,7 GB, y en fp16/bf16 unos 0,35 GB, a lo que hay que sumar el estado del optimizador si se reanuda entrenamiento (varios GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en precisión reducida; para reanudar entrenamiento se recomienda una GPU con 24 GB o más (RTX 3090/4090, A6000, A100, H100).
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: el código oficial es el repositorio `swallow-llm/swaflow-suite` basado en torchtitan; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwaFlow-150M | 175M | 2.048 | Flow matching riemanniano no autorregresivo | Apache 2.0 | Pesos y checkpoints intermedios en HF |
| SmolLM2-135M | 135M | 8.192 | Transformer autorregresivo | Apache 2.0 | Pesos en HF |
| Twin autorregresivo de SwaFlow (150M) | ~150M | no disponible | Transformer autorregresivo | Apache 2.0 | Dentro de la suite SwaFlow |

La comparación con SmolLM2-135M es especialmente pertinente porque SwaFlow-150M reutiliza su tokenizador. SmolLM2-135M ofrece una ventana de contexto cuatro veces mayor y un paradigma autorregresivo maduro, mientras que SwaFlow-150M prioriza la apertura del proceso de entrenamiento (checkpoints intermedios, reanudación exacta) sobre la calidad de generación. Los twins autorregresivos de la propia suite son el comparable más directo en términos de datos y receta, y según los autores superan al modelo de flujo en tareas de elección múltiple.

## Limitaciones y advertencias

- Los autores indican explícitamente que el modelo no está pensado para aplicaciones: el texto generado, incluso en las variantes con instruction tuning, es a menudo incoherente.
- En tareas de elección múltiple, todos los twins autorregresivos de la suite, incluido el de 150M, superan de media al modelo de flujo final de 3B.
- Ninguno de los modelos de la suite está alineado para evitar contenido dañino; no se ha aplicado RLHF ni filtros de seguridad.
- Ventana de contexto limitada a 2.048 tokens, muy inferior a la de modelos contemporáneos de tamaño similar.
- Solo soporta inglés.
- Los checkpoints publicados son fp32 y con estado del optimizador; no se ofrecen versiones cuantizadas ni en formatos de inferencia habituales (GGUF, safetensors sueltos).
- La reanudación del entrenamiento no es bit-exacta: el estado del generador de números aleatorios no se incluye y el orden de las sumas en punto flotante cambia si varía el número de GPUs.
- El repositorio ocupa 72,4 GB, lo que puede ser un obstáculo para usuarios con ancho de banda o almacenamiento limitados; la carga selectiva de una carpeta concreta mitiga parcialmente este problema.
- Los datos de entrenamiento (Dolma 3 Mix) están bajo ODC-By 1.0, con obligación de atribución si se redistribuyen derivados del dataset, aunque los pesos del modelo son Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-150M
- Colección SwaFlow Suite: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Código: https://github.com/swallow-llm/swaflow-suite
- Documentación de reproducción y reanudación: https://github.com/swallow-llm/swaflow-suite/blob/main/docs/reproduce.md#resuming-a-training-state
- Dataset Dolma 3 Mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Tokenizador SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Fichero de estados: https://huggingface.co/tokyotech-llm/SwaFlow-150M/blob/main/states.csv
- Licencia: https://huggingface.co/tokyotech-llm/SwaFlow-150M/blob/main/LICENSE
