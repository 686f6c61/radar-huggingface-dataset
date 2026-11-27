# SusanHill/zils-flash-bhd2

## Resumen

zils-flash-bhd2 es un modelo de lenguaje de 9.653.104.368 parametros (aproximadamente 9,65 mil millones) publicado por el usuario SusanHill en Hugging Face. Se trata de un "soup" o fusion de pesos: el adaptador LoRA publico BH-Language-AI/bh-decision-2-9b (con licencia Apache-2.0) se ha integrado en el modelo base Qwen/Qwen3.5-9B mediante la tecnica rsLoRA con rango 32 y alpha 64. No ha habido entrenamiento adicional tras la fusion; el modelo se distribuye exclusivamente como pesos.

El modelo hereda la arquitectura y las capacidades del Qwen3.5-9B original, sobre el que se aplica una especializacion orientada a "decision" segun las etiquetas del autor. Su relevancia es limitada y experimental: cuenta con cero descargas y cero "likes" en el momento de la consulta, y la model card es extremadamente escueta, sin documentacion sobre datos de entrenamiento, evaluacion o casos de uso previstos.

La ficha que sigue se basa unicamente en los metadatos disponibles en Hugging Face y en la model card. Cualquier dato no confirmado se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-9B); detalles no disponibles |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de pesos (weight merge), no de un entrenamiento desde cero ni de un fine-tuning adicional. Concretamente, se integra el adaptador LoRA BH-Language-AI/bh-decision-2-9b en el modelo base Qwen/Qwen3.5-9B usando rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64. El resultado se publica como pesos completos en safetensors, sin que el autor documente ningun proceso posterior de entrenamiento, alineacion (RLHF/DPO) o evaluacion.

La arquitectura subyacente corresponde a Qwen3.5-9B, un transformer decoder-only de la familia Qwen 3.5 de Alibaba. No obstante, la informacion proporcionada no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion, composicion del dataset de preentrenamiento del modelo base ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La unica innovacion documentada es el propio procedimiento de fusion rsLoRA.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan evaluaciones que confirmen el nivel de rendimiento tras la fusion.
- Especializacion en "decision": las etiquetas del autor (`zils`, `decision`) sugieren un ajuste orientado a tareas de decision, pero no se especifica que tipo de decisiones ni con que datos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Evaluacion experimental de fusiones LoRA: el modelo sirve como caso de estudio para analizar como afecta la integracion de un adaptador rsLoRA (r=32, alpha=64) al comportamiento del modelo base Qwen3.5-9B.
- Investigacion sobre "model soups": util para comparar la fusion de un unico adaptador frente a otras estrategias de merging (TIES, DARE, SLERP) sobre la misma base.
- Prototipado interno de clasificacion o toma de decisiones: dado el tag `decision`, podria probarse en tareas de seleccion entre opciones, aunque sin garantias documentadas de calidad.
- Base para fine-tuning posterior: al distribuirse como pesos completos en safetensors y con licencia Apache-2.0, puede emplearse como punto de partida para ajustes adicionales.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 facilita su uso comercial sin las restricciones de otras licencias de modelos abiertos.
- Reproducibilidad de experimentos: permite replicar el proceso de fusion descrito en la model card para verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para los pesos, mas overhead de activaciones y cache KV (tipicamente 22-26 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB para los pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en FP16 con contexto limitado o en 8 bits con holgura.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 con contexto moderado y en RTX 4070 Ti Super (16 GB) o superiores si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requeririan conversion previa a los formatos correspondientes (no se distribuyen GGUF en el repo). Al ser safetensors compatibles con transformers, puede cargarse directamente con la libreria transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-bhd2 | ~9,65 B | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Fusion LoRA sobre Qwen3.5-9B |
| Qwen/Qwen3.5-9B | ~9 B (segun denominacion) | No disponible | No disponible en la informacion | Hugging Face | Modelo base original |
| BH-Language-AI/bh-decision-2-9b | No disponible | No disponible | Apache-2.0 | Hugging Face | Adaptador LoRA de origen |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de validacion, ni documentacion sobre el efecto real de la fusion en la calidad del modelo.
- Model card minima: no se especifican idiomas, contexto, datos de entrenamiento del adaptador ni casos de uso previstos, lo que dificulta su adopcion en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se documenta ningun proceso de mitigacion especifico tras la fusion.
- Sesgos conocidos: no documentados; se heredarian los del modelo base Qwen3.5-9B y los del adaptador, sin analisis publicado.
- Adopcion practica nula: cero descargas y cero "likes" en el momento de la consulta, sin senales de uso o validacion por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y del adaptador original antes de desplegarlo en produccion.
- Sin soporte de cuantizaciones publicadas: no se distribuyen variantes GGUF, AWQ o GPTQ, por lo que el despliegue en hardware limitado requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanHill/zils-flash-bhd2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador LoRA de origen: https://huggingface.co/BH-Language-AI/bh-decision-2-9b
