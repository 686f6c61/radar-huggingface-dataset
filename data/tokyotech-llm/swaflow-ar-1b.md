# tokyotech-llm/SwaFlow-AR-1B

## Resumen

SwaFlow-AR-1B es el gemelo autorregresivo del modelo de flujo Riemanniano SwaFlow-1B, desarrollado por el Instituto Tecnologico de Tokio (Institute of Science Tokyo) y el AIST en el marco del programa nacional japones FRONTia, financiado por METI y NEDO. Se trata de un Transformer de 1.430 millones de parametros entrenado mediante prediccion del siguiente token sobre exactamente los mismos datos, en el mismo orden, con el mismo esquema de lotes y de tasa de aprendizaje que el modelo de flujo de referencia. Su proposito no es el despliegue en aplicaciones, sino servir de linea base cientifica para estudiar la familia SwaFlow de modelos de flujo Riemanniano a lo largo del entrenamiento y de la escala.

El repositorio no contiene un modelo final empaquetado para inferencia, sino los estados completos de entrenamiento (checkpoints de torchtitan en fp32 con momentos de AdamW, planificador de tasa de aprendizaje, posicion del cargador de datos y contador de pasos). Se publican 50 estados, uno cada 40.000 millones de tokens, desde el paso 4.768 (40B tokens) hasta el paso 238.400 (2,00 billones de tokens), lo que permite reanudar el entrenamiento desde cualquier punto o cargar unicamente los pesos.

La relevancia del modelo es metodologica: forma parte de una suite disenada para hacer completamente abierta la investigacion sobre modelos de lenguaje de flujo, con varias escalas bajo una misma receta, estados intermedios completos y un orden de datos compartido entre todas las ejecuciones. La arquitectura es un Transformer causal denso de 24 capas, anchura 2048, 16 cabezas de atencion y FFN de 5632, con un vocabulario de 49.152 tokens (tokenizador de SmolLM2) y una longitud de contexto de 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (sin condicionamiento temporal), implementacion torchtitan |
| Parametros totales | 1,43B (anchura 2048, 24 capas, 16 cabezas, FFN 5632) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los estados publicados son fp32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (pesos y estados); tokenizador SmolLM2 Apache 2.0; datos ODC-By 1.0 |
| Formato de pesos | checkpoints torchtitan (fp32, 256 shards + archivo `.metadata` de 17,55 GB por estado); carga via `torchtitan.models.swaflow.hf.from_pretrained` |
| Vocabulario | 49.152 tokens (tokenizador de SmolLM2) |
| Lote global de entrenamiento | 4.096 secuencias x 2.048 tokens por paso |
| Optimizador | AdamW (beta 0,9 y 0,95; weight decay 0,1), LR 3e-4 constante tras 2.000 pasos de warmup, clip 2,5 |
| Hardware de entrenamiento | 32 nodos x 8 NVIDIA H200 (256 rangos data-parallel) |
| Tamano del repositorio | 594,3 GB |

## Arquitectura y entrenamiento

El modelo es un Transformer autorregresivo causal estandar de 1,43B parametros, sin mecanismos de atencion lineal ni decodificacion especulativa documentados. Su interes esta en el protocolo de entrenamiento: comparte con SwaFlow-1B la receta exacta (mismos datos, mismo orden, mismo tamano de lote y mismo planificador de tasa de aprendizaje), de modo que la unica diferencia entre ambos es el objetivo de entrenamiento (prediccion del siguiente token frente a flujo Riemanniano). Esto convierte al par en un control experimental limpio para aislar el efecto del objetivo de modelado.

Los datos provienen de Dolma 3 Mix (`allenai/dolma3_mix-6T`) del Allen Institute for AI, con sus pesos de mezcla sin modificar. El entrenamiento cubre 2,00 billones de tokens (paso 238.400, con 8.388.608 tokens por paso), ejecutado sobre 256 rangos data-parallel en 32 nodos de 8 H200. Cada estado publicado es reanudable: los pesos y momentos de AdamW se redistribuyen al cargar, el planificador de LR sigue al contador de pasos y la posicion del cargador de datos se convierte al nuevo numero de rangos, garantizando que cada paso lea las mismas 4.096 secuencias que en la ejecucion original. El autor advierte que la reanudacion no es bit-exacta si cambia el numero de GPUs, por el reordenamiento de las sumas en coma flotante. No se documenta RLHF, DPO ni ajuste por instrucciones para este gemelo.

## Capacidades

- Generacion de texto autorregresiva en ingles mediante prediccion del siguiente token.
- Modelado de lenguaje base: no se documenta un ajuste por instrucciones ni un modo de razonamiento explicito para esta variante.
- Servir como linea base cientifica para comparar objetivos de entrenamiento (autorregresivo frente a flujo) bajo datos y receta identicos.
- Reanudacion de entrenamiento desde cualquiera de los 50 estados publicados, con redistribucion de pesos y momentos del optimizador.
- Carga aislada de pesos sin estado del optimizador mediante `from_pretrained`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion sobre objetivos de modelado: comparar directamente un Transformer autorregresivo con su gemelo de flujo Riemanniano sobre los mismos datos y pasos, aislando el efecto del objetivo de entrenamiento en las curvas de perdida y en tareas de eleccion multiple.
- Estudios de dinamica de entrenamiento: los 50 estados intermedios (cada 40B tokens) permiten trazar la evolucion de representaciones, perdida y capacidades a lo largo de 2 billones de tokens sin necesidad de reentrenar.
- Reproduccion de experimentos: reanudar el entrenamiento desde cualquier paso con un numero distinto de GPUs (siempre que divida 256) para validar resultados en clusters de menor escala.
- Analisis de escalado: combinado con los demas modelos de la suite SwaFlow, sirve para estudiar como se comportan las tecnicas de flujo a distintas escalas de parametros.
- Destilacion y ajuste posterior: los pesos cargables de forma independiente pueden usarse como inicializacion para experimentos de ajuste fino supervisado en tareas de investigacion en ingles.
- Docencia y formacion: el formato de checkpoint completo con estado del optimizador y posicion del cargador de datos es util para ensenar practicas de entrenamiento distribuido con torchtitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona, de forma cualitativa, que en tareas de eleccion multiple todos los gemelos autorregresivos de la suite (incluido el de 150M) obtienen de media puntuaciones superiores al modelo de flujo final de 3B, sin aportar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 5,7 GB solo para pesos (1,43B x 4 bytes), mas activaciones y cache KV; con contexto de 2.048 tokens el consumo adicional es moderado.
- VRAM estimada en bf16/fp16: aproximadamente 2,9 GB para pesos, si se convierte manualmente, ya que el repositorio publica fp32.
- GPU recomendadas para inferencia: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia bastar en bf16; A100 y H100 son adecuadas pero sobredimensionadas para este tamano.
- Entrenamiento completo: 32 nodos x 8 NVIDIA H200 (256 GPUs) segun la model card; la reanudacion exige un numero de GPUs que divida 256.
- Opciones de despliegue: la carga esta soportada por el codigo de SwaFlow sobre torchtitan (`torchtitan.models.swaflow.hf.from_pretrained`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: cada estado ocupa 17,55 GB (256 shards mas `.metadata`); el repositorio completo son 594,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwaFlow-AR-1B | 1,43B | 2.048 | Autorregresivo (next-token) | Apache 2.0 | Estados de entrenamiento en HF |
| SwaFlow-1B | no disponible en la informacion (gemelo de flujo de la misma suite) | no disponible | Flujo Riemanniano | Apache 2.0 (suite) | HF (tokyotech-llm/SwaFlow-1B) |
| SmolLM2-135M | 135M | no disponible en la informacion | Autorregresivo | Apache 2.0 | HF (solo se cita por el tokenizador) |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El propio autor indica que la suite no esta pensada para aplicaciones: es material de investigacion sobre modelos de flujo.
- El texto generado por los modelos de flujo de la suite, incluidos los ajustados por instrucciones, es a menudo incoherente; el gemelo autorregresivo no dispone de ajuste por instrucciones documentado.
- Ninguno de los modelos esta alineado para evitar contenido danino.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo.
- Solo ingles; sin soporte multilingue declarado.
- Riesgo de alucinacion propio de un modelo base de 1,43B sin ajuste.
- Sesgos heredados de Dolma 3 Mix, cuya composicion y filtrado no se detallan en la informacion disponible.
- Los pesos se distribuyen en fp32 como checkpoints de entrenamiento; no hay variantes cuantizadas oficiales, lo que complica el despliegue en entornos de produccion.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero los datos de entrenamiento estan bajo ODC-By 1.0 y deben respetarse sus condiciones de atribucion.
- Repositorio de 594,3 GB: descargar estados completos requiere planificar el almacenamiento; la carga selectiva por subcarpeta evita bajar todo el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-AR-1B
- Gemelo de flujo SwaFlow-1B: https://huggingface.co/tokyotech-llm/SwaFlow-1B
- Coleccion SwaFlow Suite: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Codigo: https://github.com/swallow-llm/swaflow-suite
- Documentacion de reproduccion y reanudacion: https://github.com/swallow-llm/swaflow-suite/blob/main/docs/reproduce.md#resuming-a-training-state
- Dataset Dolma 3 Mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Tokenizador SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
