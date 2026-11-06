# ThinkMorph/ThinkMorph-SSL-Stage1

## Resumen

ThinkMorph-SSL-Stage1 es un checkpoint intermedio del modelo multimodal any-to-any ThinkMorph-SSL, desarrollado por ThinkMorph. Se trata de los pesos EMA (media móvil exponencial) en el paso 5.500 de la fase de preentrenamiento auto-supervisado de la receta PRIMER, partiendo de BAGEL-7B-MoT. Su función es servir de inicialización para la segunda fase (Stage 2) del modelo final ThinkMorph-SSL, no la de responder preguntas de forma directa.

El modelo hereda la arquitectura Mixture-of-Transformers (MoT) de BAGEL-7B-MoT, con aproximadamente 7.000 millones de parámetros y un pipeline any-to-any que combina comprensión y generación de texto e imagen. La innovación principal de PRIMER es el uso de tareas pretexto auto-supervisadas sobre el dataset Pretext-270K (270.896 filas de entrenamiento): el modelo recibe una imagen corrupta y produce una descripción, una imagen restaurada y una segunda descripción.

Es relevante ahora porque documenta una etapa poco habitual en la literatura abierta: el preentrenamiento multimodal sin supervisión de pares pregunta-respuesta, con pérdidas conjuntas de entropía cruzada de texto y flow matching de imagen. El propio autor advierte que este checkpoint rinde en torno al 40 % en V* y MMMU, por lo que no está pensado para uso en producción como modelo de respuesta a preguntas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) multimodal, basada en BAGEL-7B-MoT; incluye ViT (SigLIP) y VAE |
| Parametros totales | no disponible (repo de 29,5 GB; 1.451 tensores bfloat16 en `ema.safetensors`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`ema.safetensors`, `ae.safetensors`) en bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de BAGEL-7B-MoT, un transformer multimodal con arquitectura Mixture-of-Transformers que procesa conjuntamente tokens de texto e imagen. La inicialización usa el layout y el VAE de `lmms-lab/BAGEL-7B-MoT-ver.LE`. El checkpoint incluye un codificador visual SigLIP (se omite la capa 26 de SigLIP, no utilizada) y un VAE congelado durante todo el entrenamiento. Los pesos se distribuyen en 1.451 tensores bfloat16 con los mismos nombres y formas que el modelo final ThinkMorph-SSL.

El entrenamiento corresponde a la ejecución `0503_stage0_270k_32gpu`, sobre 32 GPU (4 nodos × 8), con tasa de aprendizaje 2,83e-5 y 1.000 pasos de warmup, horizonte configurado de 10.000 pasos y publicación del guardado EMA en el paso 5.500 (decaimiento 0,9998 desde el paso 1.000, sombra en fp32). Los datos son Pretext-270K (270.896 filas de entrenamiento, sin usar los ficheros de validación). Las pérdidas combinan entropía cruzada de texto y flow matching de imagen con pesos 1 y 1. No hay supervisión de pares pregunta-respuesta en esta etapa. El proceso de construcción del fichero consistió en fusionar el estado EMA de 32 shards `.distcp` (117.699.388.909 bytes en fp32) con `scripts/merge_checkpoint.py --checkpoint-type ema`, y convertir después los 1.451 tensores a bfloat16 sin otros cambios.

## Capacidades

- Generación de descripciones de imagen a partir de entradas visuales corruptas, como parte de la tarea pretexto.
- Restauración de imagen: produce una imagen restaurada a partir de la entrada corrupta.
- Generación de una segunda descripción sobre la imagen restaurada.
- Procesamiento multimodal any-to-any (texto e imagen en entrada y salida), heredado de BAGEL-7B-MoT.
- No incluye soporte entrenado de tool calling ni function calling en esta etapa.
- No incluye capacidades de agente ni razonamiento multi-paso supervisado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking ni de supervisión de respuesta a preguntas; el autor indica explícitamente que no está pensado para responder preguntas directamente.

## Casos de uso

- Investigación sobre preentrenamiento auto-supervisado multimodal: sirve como punto de partida reproducible para estudiar la receta PRIMER y comparar el efecto del preentrenamiento pretexto frente a la supervisión directa.
- Inicialización de la fase 2: es el checkpoint desde el que arranca el entrenamiento de Stage 2 de ThinkMorph-SSL, por lo que resulta adecuado para replicar o extender ese pipeline.
- Experimentos de restauración de imagen: la tarea pretexto de reconstrucción permite evaluar la calidad de reconstrucción del VAE y del decodificador visual en entradas degradadas.
- Estudio de flow matching en modelos multimodales: la pérdida de flow matching de imagen con peso 1 permite analizar la dinámica de entrenamiento conjunto texto-imagen.
- Ablaciones de EMA: al publicarse los pesos EMA del paso 5.500, es útil para medir el impacto del promediado exponencial en la estabilidad del preentrenamiento.
- Base para fine-tuning con datos de pregunta-respuesta: aunque no está entrenado para ello, puede emplearse como inicialización en experimentos controlados de ajuste supervisado, siempre comparando contra ThinkMorph-SSL.
- Referencia para auditoría de checkpoints intermedios: permite verificar la equivalencia de configurador y tokenizador con el modelo final, útil en pipelines de validación de releases.

## Benchmarks y rendimiento

El autor indica en la model card que el apéndice del paper reporta aproximadamente un 40 % en V* y MMMU para este checkpoint. No se han publicado resultados adicionales de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| V* | ~40 % (según apéndice del paper, citado en la model card) |
| MMMU | ~40 % (según apéndice del paper, citado en la model card) |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `ema.safetensors` ocupa 29.351.872.574 bytes en bfloat16, por lo que se necesita al menos ese espacio en memoria más el VAE (`ae.safetensors`, 167.664.678 bytes) y overhead de activaciones; una estimación conservadora sitúa el mínimo en torno a 32-40 GB en bfloat16.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o GPUs con al menos 40 GB de VRAM para carga completa en bfloat16.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en bfloat16 sin cuantización; no se dispone de información sobre variantes cuantizadas publicadas.
- Opciones de despliegue: el autor indica que la carga se realiza con el código oficial de inferencia de BAGEL o con el release de código PRIMER, apuntando `model_path` a una copia local. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkMorph-SSL-Stage1 | no disponible (repo 29,5 GB) | no disponible | ~40 % en V* y MMMU | Apache-2.0 | HuggingFace |
| ThinkMorph-SSL | no disponible | no disponible | no disponible en la información | Apache-2.0 | HuggingFace |
| BAGEL-7B-MoT | 7B (MoT) | no disponible | no disponible en la información | no disponible en la información | HuggingFace |

## Limitaciones y advertencias

- Checkpoint intermedio: solo ha recibido entrenamiento pretexto, sin supervisión de pares pregunta-respuesta; el autor desaconseja su uso para responder preguntas directamente.
- Rendimiento bajo en tareas de razonamiento visual y conocimiento multimodal (en torno al 40 % en V* y MMMU según el paper), muy por debajo de lo esperable en un modelo final ajustado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero elevado en un modelo sin ajuste supervisado de respuestas.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los del corpus Pretext-270K y de BAGEL-7B-MoT.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe.
- Restricciones de licencia: los pesos son Apache-2.0, pero Pretext-270K tiene sus propios términos por fuente, que deben revisarse en la ficha del dataset antes de un uso comercial.
- Para producción debe utilizarse ThinkMorph-SSL, no este checkpoint.
- El tokenizador y los ficheros de configuración son idénticos a los de ThinkMorph-SSL, lo que facilita la sustitución, pero no implica equivalencia funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThinkMorph/ThinkMorph-SSL-Stage1
- Modelo final ThinkMorph-SSL: https://huggingface.co/ThinkMorph/ThinkMorph-SSL
- Dataset Pretext-270K: https://huggingface.co/datasets/ThinkMorph/Pretext-270K
- Modelo base BAGEL-7B-MoT: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Paper, blog y repositorio de código PRIMER: no disponibles en la información proporcionada.
