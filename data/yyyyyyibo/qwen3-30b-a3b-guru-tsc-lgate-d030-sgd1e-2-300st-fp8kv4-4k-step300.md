# YYYYYYibo/qwen3-30b-a3b-guru-tsc-lgate-d030-sgd1e-2-300st-fp8kv4-4k-step300

## Resumen

qwen3-30b-a3b-guru-tsc-lgate-d030-sgd1e-2-300st-fp8kv4-4k-step300 es un ajuste fino de Qwen3-30B-A3B-Base, el modelo de mezcla de expertos (MoE) de 30.500 millones de parametros totales con 3.000 millones activos por token publicado por Alibaba Qwen. Lo desarrolla el usuario YYYYYYibo y se distribuye en Hugging Face bajo la libreria transformers con pesos en safetensors.

El modelo es el resultado de un entrenamiento de aprendizaje por refuerzo (RL) orientado a matematicas, ejecutado con la libreria verl sobre un actor FSDP. El checkpoint corresponde al paso 300 de entrenamiento y emplea una tecnica propietaria denominada Transported Score Centering con logit-shift (lrms) y compuerta suave de forma exponencial, con delta 0,3 y sigma 0,15. Durante los rollouts del entrenamiento se usaron pesos en FP8 y cache KV en NVFP4, aunque los pesos exportados son los del actor sin cuantizar.

Su relevancia es acotada pero concreta: se trata de un experimento de investigacion reproducible sobre RL para razonamiento matematico en un MoE de tamano medio, con un contexto de entrenamiento de 4096 tokens y un esquema de optimizacion poco habitual (SGD con learning rate 1e-2 en lugar de AdamW). No es un modelo de proposito general ni cuenta con model card detallada, benchmarks publicados ni informacion de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | 3.000 millones (aproximado, segun la nomenclatura A3B del modelo base) |
| Longitud de contexto | 4096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | FP8 (usada en rollouts de entrenamiento), NVFP4 para cache KV en rollouts; pesos exportados sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 MoE del modelo base Qwen3-30B-A3B-Base: un transformer con capas de mezcla de expertos que activa aproximadamente 3.000 millones de parametros por token sobre un total de 30.500 millones. El ajuste se realizo mediante RL con la libreria verl, partiendo de un actor FSDP y exportando el checkpoint del paso 300 con pesos maestros en precision completa y sin estado del optimizador.

La innovacion metodologica declarada es Transported Score Centering con logit-shift (lrms) y una compuerta suave de forma exponencial, con parametros delta 0,3 y sigma 0,15. El entrenamiento uso un batch de 128x8, 16 minibatches, SGD con learning rate 1e-2, contexto de 4096 tokens y no empleo router replay. Los rollouts se generaron con vLLM cuantizado en FP8 con cache KV en NVFP4, una eleccion que reduce el coste de generacion pero introduce una discrepancia entre la distribucion de rollouts y los pesos finales sin cuantizar. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y el pipeline `text-generation`.
- Razonamiento matematico, objetivo principal del ajuste RL (tags `rl` y `math`).
- Razonamiento multi-paso derivado del entrenamiento con recompensas en tareas de matematicas.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion en RL para razonamiento: el checkpoint del paso 300 sirve como punto de comparacion en estudios sobre Transported Score Centering y compuertas suaves, ya que reproduce una configuracion concreta y documentada.
- Generacion de soluciones matematicas paso a paso: el ajuste RL sobre datos de matematicas lo hace adecuado para experimentar con cadenas de razonamiento en problemas de nivel escolar y competicion, siempre validando las salidas.
- Reproduccion de experimentos con verl: permite reanudar o auditar un pipeline de entrenamiento RL con actor FSDP y rollouts cuantizados en vLLM.
- Evaluacion de robustez frente a cuantizacion: al haberse entrenado con rollouts FP8 y cache KV NVFP4, es un caso de estudio para medir la brecha entre inferencia cuantizada y pesos completos.
- Prototipado de asistentes de matematicas en contexto corto: con 4096 tokens de ventana, encaja en tareas de resolucion de problemas y explicacion de procedimientos sin necesidad de contexto largo.
- Fine-tuning posterior sobre dominio especifico: al ser un MoE de 30.500 millones con 3.000 millones activos, el coste de inferencia es contenido y sirve como base para ajustes adicionales en nichos tecnicos.
- Analisis de esquemas de optimizacion no convencionales: el uso de SGD con lr 1e-2 frente a AdamW lo convierte en un sujeto util para estudiar estabilidad y convergencia en RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 61 GB solo para pesos, mas cache KV y overhead; en la practica requiere 70-80 GB.
- VRAM estimada en FP8: aproximadamente 31 GB para pesos, con margen adicional para activaciones y cache KV.
- VRAM estimada en cuantizacion de 4 bits (si se generan pesos GGUF o AWQ): aproximadamente 16-18 GB, aunque no se confirma disponibilidad de estos formatos en el repositorio.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16; A100 40 GB o L40S en FP8 con cuidado en la longitud de contexto; RTX 4090 24 GB solo viable con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 con cuantizacion agresiva, a costa de calidad y throughput.
- Opciones de despliegue: transformers con accelerate, vLLM (compatible con el formato de rollouts usado en entrenamiento), TGI; llama.cpp y Ollama solo si se publican pesos GGUF, no confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-30b-a3b-guru-tsc-lgate-d030-sgd1e-2-300st-fp8kv4-4k-step300 | 30.532 millones | ~3.000 millones | 4096 | no disponible | Hugging Face |
| Qwen3-30B-A3B-Base | 30.532 millones | ~3.000 millones | 32768 (modelo base) | Apache 2.0 (segun el modelo base) | Hugging Face |
| Qwen3-30B-A3B (instruct) | 30.532 millones | ~3.000 millones | 32768 | Apache 2.0 (segun el modelo base) | Hugging Face |

La comparacion con el modelo base es la mas informativa: comparten arquitectura y numero de parametros, pero este ajuste reduce el contexto efectivo a 4096 tokens y sustituye el alineamiento generalista por RL en matematicas. No se dispone de datos de rendimiento que permitan comparar calidad.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; contactar con el autor antes de cualquier despliegue productivo.
- Sin model card detallada ni benchmarks: no hay evidencia publicada de mejora sobre el modelo base en matematicas u otras tareas.
- Contexto limitado a 4096 tokens, muy por debajo de los 32768 del modelo base, lo que restringe tareas de contexto largo.
- Riesgo de alucinacion elevado en un modelo ajustado con RL para matematicas sin verificacion externa; validar siempre las soluciones.
- Sesgos y comportamiento multilingue desconocidos: no se documentan idiomas soportados ni evaluaciones de sesgo.
- Discrepancia entre entrenamiento e inferencia: los rollouts se generaron con pesos FP8 y cache KV NVFP4, mientras que los pesos exportados estan sin cuantizar, lo que puede alterar el comportamiento respecto a lo observado durante el entrenamiento.
- Entrenamiento con SGD y learning rate 1e-2: configuracion poco convencional que puede implicar inestabilidad o sobreajuste a la distribucion de recompensas.
- Checkpoint intermedio (paso 300) de un experimento de investigacion, no un modelo final pulido.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-30b-a3b-guru-tsc-lgate-d030-sgd1e-2-300st-fp8kv4-4k-step300
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Libreria verl: https://github.com/volcengine/verl
- Documentacion de Qwen3: https://qwen.readthedocs.io/
