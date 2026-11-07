# Thorn-field/Llama-3.2-1B-Phase1-SFT

## Resumen

Llama-3.2-1B-Phase1-SFT es un ajuste fino supervisado (SFT) del modelo base Llama 3.2 1B de Meta, publicado por el usuario Thorn-field en Hugging Face. Se trata de un checkpoint derivado, no de un modelo original: parte de la arquitectura transformer decoder-only de Llama 3.2 1B (1.498.482.688 parametros segun los pesos en safetensors) y aplica una primera fase de entrenamiento supervisado, presumiblemente orientada a instrucciones, aunque el autor no documenta la composicion del dataset ni el objetivo concreto del ajuste.

El modelo es relevante por su caracter de experimento de ajuste fino sobre una base pequena y eficiente (1B parametros), un tamano que permite inferencia en hardware de consumo y despliegues de bajo coste. Sin embargo, la ficha publica carece de informacion esencial: no se declara licencia, idiomas soportados, pipeline ni datos de entrenamiento, lo que limita seriamente su evaluacion para uso en produccion.

La informacion disponible se reduce a los metadatos del repositorio (tags safetensors, llama, region:us; 34 descargas; 0 likes; 9.0 GB de tamano de repo) y a la referencia al modelo base de Meta. Cualquier dato no presente en estas fuentes se indica como no disponible a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2 1B) |
| Parametros totales | 1.498.482.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 1B soporta 128K tokens, pero el autor no lo declara para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.2 1B: un transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU, disenado por Meta para inferencia eficiente en dispositivos de borde. El checkpoint publicado por Thorn-field corresponde a una "Phase1-SFT", es decir, una primera etapa de ajuste fino supervisado sobre el modelo base, segun indica el propio nombre del repositorio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de SFT, el uso de RLHF/DPO posterior, ni hiperparametros como learning rate, batch size o numero de epochs. Tampoco se documenta si se congelaron capas, si se uso LoRA/QLoRA o un ajuste completo, ni si se aplicaron tecnicas de empaquetado de secuencias o enmascaramiento de perdida solo en tokens de respuesta. La referencia web encontrada sobre el ajuste de Llama 3.2 1B con TRL y DeepSpeed ZeRO Stage 3 en Azure Databricks es un tutorial generico y no confirma la metodologia empleada por este autor.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama 3.2 1B.
- Presunta capacidad de seguir instrucciones tras el SFT, aunque no se documenta el formato de prompt ni la calidad del ajuste.
- Razonamiento basico y generacion de codigo a pequena escala, limitados por el tamano de 1B parametros del modelo base.
- Soporte de tool calling / function calling: no disponible de forma explicita en la documentacion del autor.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; dependen del modelo base y del dataset de SFT, ambos sin documentar.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo, con 1.498 millones de parametros, puede desplegarse en una unica GPU de consumo para validar flujos de chat antes de escalar a modelos mayores.
- Experimentacion academica con SFT: sirve como punto de partida para estudiar el efecto de una primera fase de ajuste supervisado sobre un base pequeno, comparando checkpoints intermedios.
- Generacion de texto en entornos con recursos limitados: su tamano permite ejecucion en portatiles con GPU de 8-16 GB si se convierte a cuantizaciones de 4 u 8 bits, aunque el autor no publica dichas variantes.
- Tareas de clasificacion o extraccion ligera mediante prompting: adecuado para pipelines de bajo coste donde no se requiere razonamiento complejo.
- Educacion y demostraciones de fine-tuning: util para talleres que muestren el ciclo completo de SFT sobre Llama 3.2 1B sin necesidad de infraestructura multi-GPU.
- Base para posteriores etapas de alineamiento: al ser una "Phase1", puede emplearse como inicializacion para fases posteriores de DPO o RLHF en proyectos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB solo para pesos (1.498 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 6-8 GB son suficientes para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5 GB para pesos; en 4 bits, en torno a 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4, A10); para cuantizacion 4/8 bits, GPUs con 4-6 GB como GTX 1650 o RTX 3050.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas en FP16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (con safetensors), vLLM, TGI, llama.cpp y Ollama tras conversion a GGUF (no se proporcionan archivos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del backend, pero para un modelo de 1B se esperan decenas de tokens por segundo en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Thorn-field/Llama-3.2-1B-Phase1-SFT | 1.498 M | no disponible | no disponible | Hugging Face (34 descargas) |
| meta-llama/Llama-3.2-1B | 1.240 M (1B) | 128K tokens | Llama 3.2 Community License | Hugging Face (oficial) |
| meta-llama/Llama-3.2-1B-Instruct | 1.240 M (1B) | 128K tokens | Llama 3.2 Community License | Hugging Face (oficial) |

La comparativa se limita al modelo base y su variante Instruct por ser los antecesores directos. No se dispone de datos de rendimiento del checkpoint de Thorn-field para comparar calidad; ademas, su licencia no declarada impide confirmar si hereda los terminos de la Llama 3.2 Community License o si el autor impone otras condiciones.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de SFT, lo que impide evaluar sesgos introducidos durante el ajuste.
- Riesgo elevado de alucinacion, comun en modelos de 1B parametros y agravado por la falta de datos de evaluacion.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribucion; se recomienda contactar con el autor o asumir los terminos del modelo base de Meta.
- Idiomas soportados no especificados; el comportamiento multilingue es incierto.
- Longitud de contexto no declarada para este checkpoint; aunque el base soporta 128K, el SFT podria haberla reducido o no haber sido entrenado para contextos largos.
- Solo 34 descargas y 0 likes: senal de baja validacion por parte de la comunidad, sin evidencia de calidad.
- No se ofrecen cuantizaciones (GGUF, AWQ, GPTQ) ni scripts de conversion, lo que anade friccion al despliegue.
- El nombre "Phase1" sugiere un checkpoint intermedio; podria no estar destinado a uso final en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thorn-field/Llama-3.2-1B-Phase1-SFT
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.2-1B
- Tutorial de referencia sobre SFT de Llama 3.2 1B con TRL y DeepSpeed: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-sft-trl-deepspeed-llama-1b
