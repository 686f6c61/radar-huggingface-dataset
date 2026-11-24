# SusanHill/zils-lite-s2

## Resumen

zils-lite-s2 es un modelo de lenguaje de 852.985.920 parametros publicado por el usuario SusanHill en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, orientado a tareas de decision, segun la etiqueta `decision` de su model card. El modelo se distribuye bajo licencia Apache-2.0 y en formato safetensors, con un tamano de repositorio de 1,7 GB.

La model card describe el proceso de construccion como un "soup body" (promediado de pesos) de tipo d3-lite: un estudiante LoRA-64 destilado a partir de las probabilidades de un profesor denominado vllm-sr/d3-flash sobre un conjunto de datos publico de decisiones (train-split decision pool). Posteriormente, los pesos se promedian en una proporcion 0,3/0,7 con el "pool chassis", usando objetivos que combinan las predicciones del profesor con etiquetas gold publicas.

El modelo es relevante por su enfoque de destilacion con LoRA y promediado de pesos sobre una base Qwen3.5 pequena, lo que lo situa en la categoria de modelos ligeros para clasificacion o toma de decisiones. Sin embargo, la informacion publicada es muy escasa: no se detallan idiomas, benchmarks ni casos de uso especificos, y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); incluye codigo personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parametros. Segun la model card, el entrenamiento consistio en destilar un estudiante con adaptadores LoRA de rango 64 a partir de las probabilidades de un profesor llamado vllm-sr/d3-flash, sobre un conjunto de datos publico de decisiones (train-split decision pool). Los objetivos de entrenamiento combinaron las predicciones del profesor con etiquetas gold publicas.

Posteriormente, los pesos del estudiante se promediaron con el "pool chassis" en una proporcion 0,3/0,7, una tecnica de model soup que busca combinar la especializacion del estudiante con las capacidades del modelo base. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La presencia de la etiqueta `custom_code` indica que el modelo requiere codigo personalizado para su carga, probablemente relacionado con la implementacion de la arquitectura o del proceso de destilacion.

## Capacidades

- Generacion de texto y razonamiento basico, heredados del modelo base Qwen3.5-0.8B.
- Toma de decisiones y clasificacion, segun la etiqueta `decision` de la model card; el modelo esta orientado a tareas de seleccion o juicio sobre opciones.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Clasificacion de decisiones binarias o multiclase: el modelo puede emplearse para etiquetar o decidir entre opciones en flujos de datos estructurados, dado su entrenamiento sobre un pool de decisiones.
- Filtrado y enrutamiento de consultas: en un pipeline de atencion al cliente, el modelo podria decidir a que departamento o respuesta dirigir una consulta entrante, aprovechando su naturaleza ligera para inferencia de baja latencia.
- Moderacion de contenido: como clasificador de decisiones, puede evaluar si un texto cumple o no ciertas politicas, integrándose en sistemas de revision automatizada.
- Extraccion de decisiones en formularios o encuestas: el modelo puede procesar respuestas y determinar la opcion seleccionada o la categoria correspondiente.
- Prototipado rapido en entornos con recursos limitados: al tener menos de 1.000 millones de parametros, cabe en GPUs de consumo y permite experimentar con destilacion y model soups sin infraestructura dedicada.
- Evaluacion de tecnicas de destilacion: investigadores pueden usar este modelo como referencia para estudiar el efecto del promediado de pesos (0,3/0,7) y la destilacion LoRA-64 sobre un modelo base pequeno.
- Generacion de texto asistida en dominios acotados: aunque no se detallan sus capacidades generativas, puede emplearse para redactar respuestas breves en tareas de decision, siempre con validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parametros, en precision FP16 se requieren aproximadamente 1,7 GB de VRAM; en cuantizacion de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; tarjetas como NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden alojar el modelo sin problemas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 o superior, con suficiente VRAM).
- Opciones de despliegue: no se especifican; al requerir `custom_code`, es probable que necesite `transformers` con `trust_remote_code=True`. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-s2 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | Hugging Face |
| Modelos de ~1B de la familia Qwen | ~1B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria. La comparativa se limita a parametros y licencia, ya que no se han publicado benchmarks ni especificaciones de contexto.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al derivar de Qwen3.5-0.8B, podria heredar sesgos del modelo base, pero no se documentan.
- Riesgo de alucinacion: no evaluado; al ser un modelo pequeno y especializado en decisiones, la generacion de texto libre podria ser limitada o poco fiable.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; se desconoce si el modelo conserva las capacidades multilingues del base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la informacion disponible.
- Caveat para produccion: el modelo requiere `custom_code`, lo que implica dependencias adicionales y posible incompatibilidad con herramientas de despliegue estandar; ademas, no cuenta con descargas ni validacion comunitaria, por lo que su robustez no esta contrastada.
- El proceso de promediado de pesos (0,3/0,7) y la destilacion desde un profesor no documentado publicamente dificultan la reproducibilidad y la evaluacion de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-lite-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Profesor mencionado (vllm-sr/d3-flash): no se proporciona enlace en la informacion disponible.
