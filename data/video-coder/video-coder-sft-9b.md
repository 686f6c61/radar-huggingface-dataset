# Video-Coder/Video-Coder-SFT-9B

## Resumen

Video-Coder-SFT-9B es un modelo de lenguaje especializado publicado por el equipo de Video-Coder, vinculado al trabajo de investigacion "Video-Coder: Reinforcing Agentic Coding for Video Generation" (arXiv:2611.09894). El modelo ha sido entrenado para actuar como agente de codigo orientado a la generacion de video: escribe y ejecuta codigo de forma autonoma para construir una escena 3D dinamica (denominada "Draft Video") que aporta senales de estructura y movimiento a generadores de video posteriores. Se distribuye como checkpoint SFT (supervised fine-tuning) sobre la familia de arquitecturas Qwen (tag `qwen3_5`), con licencia Apache 2.0.

El repositorio contiene pesos en formato safetensors con un tamano aproximado de 18,8 GB, lo que resulta coherente con un modelo de clase 9B en precision de 16 bits. El autor lo presenta como el primer intento de entrenar un agente de generacion de video guiado por codigo, apoyado en dos conjuntos de datos propios (Video-Coder-SFT-10k y Video-Coder-RL-4k) y en un entorno de ejecucion interactivo (Video-Coder Harness) que integra ejecucion de codigo, renderizado de escenas 3D y realimentacion de ejecucion.

La relevancia del modelo radica en su enfoque: en lugar de generar video directamente, delega la sintesis visual en un generador downstream (por ejemplo, Minimax-H3) y aporta la estructura fisica y el movimiento mediante codigo ejecutado. Segun la model card, este planteamiento mejora Minimax-H3 en aproximadamente 7 puntos en PhyGenBench y 24 puntos en VBench-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, tag `qwen3_5`) |
| Parametros totales | 9B (denominacion comercial); el campo `safetensors` del repo declara 1.469.680, dato inconsistente con el tamano de 18,8 GB |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla del tag `qwen3_5`, que situa al modelo en la familia Qwen de transformers densos. El modelo es un checkpoint de supervised fine-tuning (SFT) del proyecto Video-Coder, entrenado sobre el dataset Video-Coder-SFT-10k, compuesto por prompts diversos y videos de referencia ground-truth. El proyecto contempla ademas una fase de aprendizaje por refuerzo (Video-Coder-RL-4k), aunque este repositorio corresponde unicamente a la variante SFT.

La innovacion tecnica principal no reside en el modelo en si, sino en el pipeline que lo rodea: el Video-Coder Harness, un entorno interactivo unificado que integra ejecucion de codigo, renderizado de escenas 3D y realimentacion de ejecucion para el entrenamiento e inferencia del agente. El modelo aprende a escribir codigo que construye una escena 3D dinamica, la renderiza como borrador de video y utiliza esa salida como condicionamiento estructural para un generador de video downstream. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO en este checkpoint concreto.

## Capacidades

- Generacion de codigo orientada a agentes: escribe y ejecuta codigo de forma autonoma para construir escenas 3D.
- Razonamiento multi-paso y planificacion: el flujo implica descomponer un prompt de video en pasos de codigo ejecutables.
- Integracion con entornos de ejecucion: disenado para operar dentro del Video-Coder Harness con realimentacion de ejecucion.
- Generacion de "Draft Video": produce una representacion 3D dinamica que condiciona generadores de video posteriores.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Generacion de video asistida por codigo: el modelo escribe el codigo que construye una escena 3D dinamica y la usa como borrador estructural para un generador downstream como Minimax-H3, mejorando la coherencia fisica y de movimiento.
- Prototipado de escenas 3D: a partir de un prompt textual, el agente genera codigo que define geometria, materiales y movimiento, util para iterar rapidamente sobre borradores visuales.
- Investigacion en agentes de codigo: sirve como checkpoint de referencia para estudiar SFT sobre tareas de codificacion con ejecucion y realimentacion.
- Evaluacion de pipelines de video condicionado: permite reproducir el flujo Draft Video + generador para medir mejoras en benchmarks como PhyGenBench y VBench-2.0.
- Automatizacion de tareas de renderizado: el agente puede encadenar pasos de codigo, render y validacion dentro del harness para producir clips con estructura controlada.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, puede reentrenarse sobre dominios especificos de generacion de video o de escenas 3D.

## Benchmarks y rendimiento

La model card reporta mejoras relativas del pipeline completo (Video-Coder) frente a Minimax-H3, no resultados aislados del modelo de lenguaje:

| Benchmark | Mejora reportada (Video-Coder vs. Minimax-H3) |
|---|---|
| PhyGenBench | ~+7 puntos |
| VBench-2.0 | ~+24 puntos |

No se han publicado en la informacion disponible resultados de benchmarks del modelo de lenguaje por separado (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 18-20 GB, coherente con el tamano del repo (18,8 GB) para un modelo de clase 9B.
- Cuantizacion: no se distribuyen pesos GGUF ni cuantizados; para reducir VRAM habria que convertir los safetensors a 8 o 4 bits con herramientas externas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 ajustado; GPUs consumer de 16 GB requeririan cuantizacion.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) en fp16; en GPUs de 16 GB solo con cuantizacion.
- Opciones de despliegue: vLLM, TGI o llama.cpp tras conversion a GGUF; el flujo completo requiere ademas el Video-Coder Harness y un generador de video downstream.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Video-Coder-SFT-9B | 9B | no disponible | Agente de codigo para generacion de video | Apache 2.0 |
| Qwen base (familia qwen3_5) | variable | no disponible | LLM generalista | segun variante |
| Generadores de video end-to-end (p. ej. Minimax-H3) | no disponible | no disponible | Generacion directa de video | no disponible |

No se dispone en la informacion proporcionada de modelos directamente comparables en la categoria de "agente de codigo para generacion de video", por lo que la comparativa es orientativa.

## Limitaciones y advertencias

- El campo `safetensors` del repositorio declara 1.469.680 parametros, dato inconsistente con el nombre (9B) y el tamano del repo (18,8 GB); conviene verificar los pesos antes de usarlos en produccion.
- El modelo esta disenado para operar dentro del Video-Coder Harness; su uso aislado como LLM generico no refleja su comportamiento previsto.
- Depende de un generador de video downstream para producir el resultado final; no genera video por si mismo.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos de alucinacion especificos.
- La licencia Apache 2.0 permite uso comercial, pero el pipeline completo puede heredar restricciones de los generadores downstream utilizados.
- No hay informacion sobre cuantizaciones oficiales ni sobre el contexto maximo soportado.

## Enlaces

- Hugging Face: https://huggingface.co/Video-Coder/Video-Coder-SFT-9B
- Paper: https://arxiv.org/abs/2611.09894
- Project page: https://cywang735.github.io/Video-Coder/
- Codigo: https://github.com/CYWang735/Video-Coder
