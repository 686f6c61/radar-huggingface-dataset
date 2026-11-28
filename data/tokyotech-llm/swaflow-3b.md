# tokyotech-llm/SwaFlow-3B

## Resumen

SwaFlow-3B es un modelo de lenguaje de 3,74 mil millones de parametros desarrollado por tokyotech-llm (colaboracion entre AIST y el Institute of Science Tokyo en el marco del programa japones FRONTia) que implementa un enfoque de flow matching riemanniano sobre una hipersesfera, en lugar del paradigma autorregresivo convencional. El modelo se entrena desde cero sobre el dataset Dolma 3 Mix de AllenAI y forma parte de la suite SwaFlow, un conjunto de modelos entrenados con una misma receta, sobre los mismos datos y en el mismo orden, para permitir estudios comparativos controlados.

El repositorio no contiene pesos finales listos para inferencia, sino estados intermedios completos de entrenamiento (checkpoints de torchtitan en fp32 con momentos de AdamW, schedule de learning rate, posicion del data loader y contador de pasos). Esto lo convierte en un artefacto orientado a la investigacion y la reproducibilidad del entrenamiento, no a su despliegue en produccion. Los pesos finales promediados y las versiones con instruction tuning se publican por separado en SwaFlow-3B-EMA, SwaFlow-3B-Instruct y SwaFlow-3B-EMA-Instruct.

La relevancia del modelo es fundamentalmente cientifica: ofrece una via abierta para estudiar modelos de lenguaje basados en flow matching a distintas escalas y a lo largo de todo el entrenamiento, con la particularidad de incluir "gemelos" autorregresivos entrenados sobre los mismos datos. El propio autor advierte que no esta pensado para aplicaciones: el texto generado es a menudo incoherente y, en tareas de eleccion multiple, incluso el gemelo autorregresivo de 150M supera en media al modelo flow de 3B final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con flow matching riemanniano (hipersesferico); implementado en torchtitan |
| Parametros totales | 3,74B (ancho 3072, 28 capas, 24 cabezas, FFN 8192) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de torchtitan (256 shards por estado mas fichero `.metadata` de 45,29 GB); no se publica safetensors ni GGUF en este repositorio |
| Vocabulario | 49.152 tokens (tokenizer de SmolLM2) |
| Convencion temporal | α = 1 datos limpios, α = 0 ruido puro |
| Batch de entrenamiento | 4.096 secuencias × 2.048 tokens por paso |
| Optimizador | AdamW (β = 0,9 y 0,95; weight decay 0,1), LR 3e-4 constante tras warmup de 2.000 pasos, clip 2,5 |
| Hardware de entrenamiento | 32 nodos × 8 NVIDIA H200 (256 rangos data-parallel) |
| Tamano del repositorio | 1.218,1 GB |

## Arquitectura y entrenamiento

SwaFlow-3B es un transformer no autorregresivo formulado como un problema de flow matching sobre una variedad riemanniana (la hipersesfera). En lugar de predecir el siguiente token, el modelo aprende un campo de velocidades que transporta ruido puro (α = 0) hacia datos limpios (α = 1), con un valor de α muestreado por secuencia. El checkpoint `uniform` usa α uniforme en [0, 0,100] por secuencia. La arquitectura sigue el esquema estandar de transformer (28 capas, 24 cabezas, ancho 3072, FFN de 8192) con un vocabulario de 49.152 tokens heredado del tokenizer de SmolLM2.

El entrenamiento se realizo desde cero sobre Dolma 3 Mix (AllenAI, licencia ODC-By 1.0) manteniendo las ponderaciones de mezcla originales, con un batch global de 4.096 secuencias de 2.048 tokens por paso. El repositorio expone tres familias de estados: `uniform` (pretraining con α uniforme, desde 40B hasta 3T tokens), `clean-prefix-2t` (mid-training con prefijo limpio ramificado desde el paso de 1,90T) y `clean-prefix-4t` (ramificado desde 3T, con estados en 3,50T y 4,00T). El estado final del paper es `clean-prefix-4t/step-476800` (4T tokens). Cada paso N equivale a N × 8.388.608 tokens de entrenamiento. El fichero `states.csv` lista todos los estados con su recuento de tokens, numero de ficheros y tamano.

Una innovacion destacable es la posibilidad de reanudar el entrenamiento desde cualquier estado con un numero de GPUs distinto al original (siempre que divida 256): los pesos y momentos de AdamW se redistribuyen al cargar, la acumulacion de gradiente mantiene el batch global y la posicion del data loader se convierte al nuevo numero de rangos, de modo que cada paso lee las mismas 4.096 secuencias que el paso equivalente de la ejecucion original. La reanudacion no es bit-exacta: no se incluye el estado del generador aleatorio (cada secuencia recibe un α y un ruido distintos pero identicamente distribuidos) y el orden de las sumas en coma flotante cambia con el numero de GPUs.

## Capacidades

- Generacion de texto no autorregresiva mediante transporte de flujo sobre la hipersesfera.
- Estudio y reproducibilidad de entrenamiento: reanudacion desde cualquier checkpoint con resharding de pesos y momentos del optimizador.
- Analisis comparativo controlado con gemelos autorregresivos entrenados sobre los mismos datos y en el mismo orden.
- Soporte de mid-training con prefijo limpio (`clean-prefix`) para estudiar transiciones de distribucion.
- Entrenamiento e inferencia en ingles (unico idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Las versiones con instruction tuning existen como pesos separados (SwaFlow-3B-Instruct, SwaFlow-3B-EMA-Instruct), pero el autor advierte que su texto generado es a menudo incoherente.

## Casos de uso

- Investigacion en modelos de lenguaje no autorregresivos: el modelo permite estudiar empiricalmente el flow matching riemanniano a escala de 3,74B parametros, comparando la evolucion de la perdida y la calidad de generacion a lo largo de 4T tokens de entrenamiento.
- Reproducibilidad de entrenamiento a gran escala: los checkpoints completos (pesos fp32, momentos de AdamW, schedule de LR, posicion del data loader) permiten reanudar el entrenamiento en un cluster distinto, con un numero de GPUs diferente siempre que divida 256, y verificar la estabilidad del proceso.
- Estudio de dinamicas de entrenamiento: la serie de estados cada 40B y luego cada 20B tokens facilita analisis de curvas de aprendizaje, divergencia entre ramas (`uniform` frente a `clean-prefix`) y efectos del mid-training.
- Comparativa flow frente a autorregresivo: los gemelos autorregresivos entrenados con los mismos datos permiten aislar el efecto de la formulacion (flow matching frente a next-token prediction) controlando datos, orden y receta.
- Desarrollo de metodos de muestreo: al ser un modelo de flujo, es un banco de pruebas para integradores ODE/SDE, schedules de α y estrategias de decodificacion no autorregrevas.
- Docencia y formacion: el acceso a estados intermedios y a la receta completa (codigo abierto en GitHub) lo hace util para cursos avanzados de entrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica, de forma cualitativa, que en tareas de eleccion multiple todos los gemelos autorregresivos (incluido el de 150M) obtienen de media puntuaciones superiores al modelo flow de 3B final, y que el texto generado por los modelos flow, incluidos los instruction-tuned, es a menudo incoherente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 3,74B en fp32 requiere aproximadamente 15 GB solo para pesos, mas activaciones y overhead; los checkpoints publicados aqui son fp32 y no se ofrece una ruta de cuantizacion documentada.
- GPU recomendadas: el entrenamiento original uso 32 nodos × 8 NVIDIA H200 (256 rangos data-parallel). Para cargar un unico estado e inferir, se necesita una GPU con memoria suficiente para pesos fp32 mas el runtime de torchtitan.
- GPU de consumo: no confirmado. No se documenta soporte para llama.cpp, Ollama ni formatos GGUF, por lo que el despliegue en GPUs de consumo no esta soportado de forma nativa.
- Opciones de despliegue: la via documentada es el codigo de SwaFlow (`torchtitan.models.swaflow.hf.from_pretrained`) con PyTorch y CUDA; tambien es posible descargar un subconjunto con `hf download --include` y reanudar entrenamiento con los scripts de `scripts/launch/train.sh`.
- Latencia y throughput: no disponibles. Al ser un modelo no autorregresivo basado en integracion de flujo, el coste de inferencia depende del numero de pasos del integrador, que no se especifica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwaFlow-3B | 3,74B | 2.048 | Flow matching riemanniano no autorregresivo | Apache 2.0 | Checkpoints de entrenamiento en HF; pesos finales en repos separados |
| Gemelos autorregresivos de la suite SwaFlow | no disponible (incluye uno de 150M) | no disponible | Autorregresivo | no disponible | Entrenados sobre los mismos datos y orden; referenciados en la model card |
| SwaFlow-3B-EMA / -Instruct | 3,74B | 2.048 | Flow matching riemanniano (pesos promediados / instruction-tuned) | Apache 2.0 | Repositorios separados en Hugging Face |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparacion mas directa disponible es interna a la suite (flow frente a autorregresivo con datos y receta identicos), y el propio autor senala que los gemelos autorregresivos superan al modelo flow de 3B en eleccion multiple.

## Limitaciones y advertencias

- El modelo no esta pensado para aplicaciones: la model card lo declara explicitamente como artefacto de investigacion.
- El texto generado es a menudo incoherente, incluidas las versiones con instruction tuning.
- En tareas de eleccion multiple, todos los gemelos autorregresivos (incluso el de 150M) superan de media al modelo flow de 3B final.
- Ningun modelo de la suite esta ajustado para evitar contenido danino.
- Contexto limitado a 2.048 tokens, insuficiente para la mayoria de casos de uso con documentos largos.
- Solo soporta ingles.
- Los checkpoints se publican en fp32 con estado del optimizador; no hay rutas de cuantizacion ni formatos ligeros documentados, lo que encarece el almacenamiento (1.218,1 GB de repositorio) y el despliegue.
- La reanudacion del entrenamiento no es bit-exacta: no se conserva el estado del generador aleatorio y el orden de las sumas en coma flotante varia con el numero de GPUs, con deriva creciente respecto a la ejecucion original.
- El numero de GPUs para reanudar debe dividir 256 para mantener el batch global de 4.096 secuencias.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero la calidad actual del modelo hace inviable ese escenario en produccion.
- Riesgo de sesgos heredados de Dolma 3 Mix (dataset de AllenAI con licencia ODC-By 1.0), no evaluado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-3B
- Pesos promediados (EMA): https://huggingface.co/tokyotech-llm/SwaFlow-3B-EMA
- Version instruction-tuned: https://huggingface.co/tokyotech-llm/SwaFlow-3B-Instruct
- Version instruction-tuned con EMA: https://huggingface.co/tokyotech-llm/SwaFlow-3B-EMA-Instruct
- Coleccion SwaFlow suite: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Codigo: https://github.com/swallow-llm/swaflow-suite
- Documentacion de reanudacion de entrenamiento: https://github.com/swallow-llm/swaflow-suite/blob/main/docs/reproduce.md#resuming-a-training-state
- Dataset Dolma 3 Mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Tokenizer SmolLM2 (referencia del vocabulario): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
