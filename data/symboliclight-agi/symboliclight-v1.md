# SymbolicLight-AGI/SymbolicLight-V1

## Resumen

SymbolicLight V1 es un modelo de lenguaje basado en redes neuronales de impulsos (spiking neural networks, SNN), desarrollado por el equipo SymbolicLight-AGI. Se publica en dos escalas, 0.8B y 194M de parámetros, con un diseño orientado exclusivamente a inferencia (inference-only) y activación dispersa (sparse activation). El modelo está descrito en el artículo arXiv:2605.21333 y se distribuye bajo licencia Apache 2.0, con soporte para inglés y chino.

La relevancia de este modelo radica en su arquitectura SNN, que promete una mayor eficiencia energética y computacional frente a los transformadores densos convencionales, especialmente en entornos de inferencia con recursos limitados. Sin embargo, la documentación pública es escasa: no se detallan aspectos clave como la longitud de contexto, el proceso de entrenamiento o los resultados de benchmarks, lo que limita una evaluación completa. El repositorio de HuggingFace contiene únicamente los pesos de inferencia y los tokenizers, sin datos de entrenamiento ni métricas reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de impulsos (SNN) con activacion dispersa |
| Parametros totales | 0.8B y 194M (dos checkpoints) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura de SymbolicLight V1 se basa en redes neuronales de impulsos, un paradigma en el que las neuronas comunican informacion mediante eventos discretos (impulsos) en lugar de activaciones continuas. Esto permite una activacion dispersa, donde solo una fraccion de las neuronas se activa en cada paso, reduciendo el coste computacional y energetico durante la inferencia. El modelo esta disenado exclusivamente para inferencia; los checkpoints publicados contienen solo los tensores y la configuracion necesaria para construir el grafo de inferencia, sin estado de optimizador ni metadatos de entrenamiento.

No se ha publicado informacion sobre el proceso de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si se emplearon tecnicas como RLHF o DPO. El articulo arXiv:2605.21333 deberia contener estos detalles, pero no estan disponibles en la model card. Tampoco se especifican innovaciones tecnicas adicionales mas alla de la arquitectura SNN y la activacion dispersa.

## Capacidades

- Generacion de texto en ingles y chino, al ser un modelo de lenguaje.
- Inferencia eficiente gracias a la activacion dispersa y la arquitectura SNN, lo que podria reducir el consumo energetico en comparacion con modelos densos.
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades especiales (vision, audio, thinking mode): no disponible en la documentacion publica.
- No se especifican capacidades de codigo, matematicas o razonamiento avanzado.

## Casos de uso

- Inferencia de lenguaje natural en entornos con restricciones de energia o hardware limitado: la arquitectura SNN y la activacion dispersa podrian permitir el despliegue en dispositivos de borde o sistemas embebidos, aunque no hay datos concretos de consumo.
- Procesamiento de texto bilingue (ingles-chino) en aplicaciones de traduccion, resumen o generacion de contenido, siempre que se disponga del tokenizer adecuado para cada escala.
- Investigacion academica sobre SNN aplicadas a modelos de lenguaje: el codigo y los pesos publicados permiten reproducir la inferencia y estudiar el comportamiento de esta arquitectura.
- Prototipado de sistemas de IA explicable o con requisitos de eficiencia energetica, dado el enfoque en inferencia y la licencia permisiva.
- Desarrollo de asistentes conversacionales en chino o ingles con despliegue local, si se logra adaptar el modelo a un framework de inferencia compatible.
- Evaluacion comparativa de arquitecturas alternativas a los transformadores densos en tareas de lenguaje, aunque faltan benchmarks publicados para validar su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y el articulo arXiv no es accesible desde la ficha. Por tanto, no es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

- El checkpoint de 0.8B ocupa 3.500.562.525 bytes (~3,5 GB), lo que sugiere que en precision FP32 necesitaria al menos 4 GB de VRAM, y en FP16 unos 2 GB. El checkpoint de 194M ocupa ~776 MB, cabiendo en GPUs con 1-2 GB de VRAM.
- No se proporcionan requisitos oficiales de hardware ni GPU recomendadas.
- Dado el tamano, el modelo 194M podria ejecutarse en GPUs consumer como una GTX 1650 o RTX 3050, mientras que el 0.8B requeriria al menos una RTX 3060 o superior para una inferencia comoda.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI). Al ser un formato PyTorch, seria necesario adaptarlo a un framework compatible con SNN, lo que anade complejidad.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (SNN para lenguaje). Los modelos de lenguaje convencionales (como Llama, Mistral o Qwen) no son directamente comparables por su arquitectura transformer densa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La documentacion publica es muy limitada: no hay informacion sobre sesgos, alucinaciones, limitaciones de contexto o rendimiento en tareas especificas.
- El modelo es exclusivamente para inferencia; no se distribuyen pesos de entrenamiento ni datos de validacion, por lo que no es posible fine-tuning con los artefactos publicados.
- Los tokenizers de 0.8B y 194M son diferentes y no intercambiables; usar el tokenizer incorrecto puede provocar errores de carga o generacion.
- No se garantiza la reproduccion de las metricas del paper, ya que el repositorio solo soporta la inferencia, no el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los corpus de entrenamiento no estan incluidos ni licenciados, lo que podria limitar ciertos usos si se requiere acceso a los datos.
- Al ser una arquitectura SNN, la compatibilidad con frameworks estandar de inferencia (vLLM, llama.cpp) no esta garantizada; se requiere el codigo del repositorio de GitHub.

## Enlaces

- HuggingFace: https://huggingface.co/SymbolicLight-AGI/SymbolicLight-V1
- Paper arXiv: https://arxiv.org/abs/2605.21333
- Repositorio de codigo: https://github.com/SymbolicLight-AGI/SymbolicLight-V1
