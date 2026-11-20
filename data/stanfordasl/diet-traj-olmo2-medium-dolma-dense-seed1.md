# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed1

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed1` es un checkpoint de un entrenamiento desde cero con arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis del espacio de pesos (*weight-space*). No es un modelo pensado para uso en producción, sino una pieza de una colección de ejecuciones de preentrenamiento diseñadas para estudiar trayectorias de entrenamiento: cada ejecución de la colección comparte receta, datos y arquitectura, y solo varía la semilla aleatoria, de modo que las diferencias entre checkpoints permiten analizar la dinámica del entrenamiento en el espacio de pesos.

El modelo tiene aproximadamente 305 millones de parámetros, con una configuración densa de tipo transformer OLMo2 (hidden_size 768, 16 capas, 12 cabezas de atención, contexto máximo de 2048 tokens). Se entrenó sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face de Dolma v1.7 muestreado proporcionalmente según sus componentes de mezcla y consumido en streaming, con un presupuesto de 2.000 millones de tokens y objetivo de *cross-entropy* puro (sin destilación ni RLHF).

Su relevancia es metodológica: sirve como material reproducible para investigar cómo evolucionan los pesos a lo largo del preentrenamiento, comparar semillas y validar técnicas de análisis en el espacio de pesos sobre la arquitectura OLMo2, extendiendo la línea de trabajo previa del mismo grupo con modelos Pythia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense`) |
| Parametros totales | ~305M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), solo pesos, por ramas `stepN` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia OLMo2 con `hidden_size=768`, `intermediate_size=3072`, 16 capas, 12 cabezas de atención y 12 cabezas de clave/valor (atención multi-cabeza sin GQA), con embeddings posicionales de hasta 2048 posiciones. La configuración concreta está definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`.

El entrenamiento es un preentrenamiento estándar de modelado de lenguaje con pérdida de entropía cruzada, sin destilación (`distillation.teacher_schedule=none` en `src/run_distillation.py`). Se usó AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay 0.1, schedule coseno y precisión bf16. Los datos provienen de `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre sus componentes de mezcla y consumido en streaming en lugar de pre-empaquetado. La ejecución consta de `max_steps=30517` con `save_steps=100` y un presupuesto de 2.000 millones de tokens, ejecutada en GPUs H200 (clúster `fran`, commit `81e3d16`). Los checkpoints intermedios se publican en ramas `stepN` con solo los pesos; `main` contiene los pesos finales cuando la ejecución termina. La única diferencia entre las ejecuciones de la colección es la semilla aleatoria (en este caso, `seed=1`).

## Capacidades

- Generación de texto autoregresiva en inglés: es la función para la que fue entrenado (objetivo de modelado de lenguaje).
- Razonamiento básico y modelado de lenguaje a pequeña escala, limitado por sus ~305M de parámetros y su presupuesto de entrenamiento de 2.000 millones de tokens.
- Soporte de tool calling / function calling: no documentado; no se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es un objetivo del entrenamiento.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Uso principal: servir como checkpoint de investigación para análisis de trayectorias de entrenamiento y del espacio de pesos.

## Casos de uso

- Análisis de trayectorias de entrenamiento: comparar los checkpoints `stepN` de esta ejecución con los de otras semillas de la colección para estudiar cómo divergen los pesos y las funciones aprendidas a lo largo del preentrenamiento.
- Investigación en el espacio de pesos: aplicar técnicas de interpolación, alineación o análisis espectral entre checkpoints de distintas semillas para estudiar la geometría de las soluciones del preentrenamiento.
- Reproducibilidad de recetas: reutilizar la configuración OLMo2 densa de ~305M y la receta de entrenamiento (AdamW, lr 3e-5, schedule coseno, bf16) como línea base reproducible en experimentos propios.
- Estudio de mezclas de datos: emplear el muestreo proporcional de Dolma v1.7 como referencia para analizar el efecto de la composición del corpus en modelos pequeños.
- Aprendizaje y docencia: usar un modelo pequeño de arquitectura moderna (OLMo2) para ilustrar el ciclo completo de preentrenamiento, guardado de checkpoints y evaluación.
- Base para *fine-tuning* experimental: punto de partida controlado (semilla conocida, presupuesto de tokens conocido) para estudiar cómo el ajuste posterior depende del estado inicial de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,6 GB en bf16/fp16 para los ~305M de parámetros; en torno a 1,2-1,5 GB en fp32; menos de 0,5 GB en cuantizaciones de 8 o 4 bits (no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en bf16; para entrenamiento o análisis de múltiples checkpoints, GPU de clase A100/H100 o H200 (el autor usó H200).
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.), incluso con contexto completo de 2048 tokens.
- Opciones de despliegue: `transformers` (librería declarada); al ser pesos safetensors estándar, es compatible con servidores que acepten arquitecturas OLMo2 (por ejemplo, vLLM o TGI, sujeto a soporte de la arquitectura). No se documentan GGUF ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed1 | ~305M | 2048 | Dolma v1.7, 2.000M tokens | apache-2.0 | Investigación de trayectorias |
| diet-traj-pythia-410m (colección jjalora) | ~410M | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Investigación de trayectorias |
| OLMo2 oficial (variantes mayores) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Modelo de propósito general |

La comparación cuantitativa de rendimiento con alternativas no está disponible: el autor no publica evaluaciones comparativas y este checkpoint está orientado al análisis, no a la competición en benchmarks.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación con ~305M de parámetros y 2.000 millones de tokens de entrenamiento, insuficiente para calidad conversacional o de código fiable.
- Riesgo elevado de alucinación y de generar texto incoherente en tareas complejas, propio de su escala y de su receta de preentrenamiento puro.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Contexto limitado a 2048 tokens, lo que restringe tareas de contexto largo.
- Sin ajuste por instrucciones, RLHF ni DPO: no responde de forma fiable a instrucciones ni a formatos de chat.
- Sesgos: al entrenarse sobre Dolma v1.7, puede heredar sesgos presentes en corpus web; el autor no documenta evaluaciones de sesgo.
- Licencia apache-2.0: permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones técnicas.
- Los checkpoints intermedios están en ramas `stepN` y solo contienen pesos; deben cargarse con la configuración OLMo2 correspondiente.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed1
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm (referenciado en la model card)
- Colección de referencia con Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada en la model card)
- Dataset: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
