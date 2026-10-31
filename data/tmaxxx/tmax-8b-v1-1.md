# TMaxxx/tmax-8b-v1.1

## Resumen

TMax 8B v1.1 es un modelo de agente de terminal desarrollado por Ai2 (Allen Institute for AI) mediante aprendizaje por refuerzo con DPPO a partir del checkpoint SFT `allenai/tmax-sft-8b`, que a su vez deriva de Qwen3-8B. Con 8,19 mil millones de parametros y una ventana de contexto de 40.960 tokens, esta especializado en interactuar con entornos de linea de comandos: planificar, ejecutar comandos, observar la salida y decidir el siguiente paso de forma autonoma.

El modelo forma parte de la coleccion TMax v1.1, basada en la receta descrita en el paper "Tmax: A simple recipe for terminal agents" (arXiv 2606.23321). Respecto a la version v1.0, esta release emplea datos de RL endurecidos y prefiltrados (dataset TMax-13K v1.1) y publica resultados reevaluados con un harness corregido. El checkpoint publicado en `main` corresponde al paso 500 de entrenamiento, el de mayor puntuacion en TB-Lite.

Su relevancia radica en que ofrece, bajo licencia Apache 2.0 y con checkpoints intermedios disponibles, un agente de terminal abierto y reproducible, util tanto para automatizacion de tareas en la consola como para investigacion en agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 81,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso, al que se aplico primero un fine-tuning supervisado (SFT) que dio lugar a `allenai/tmax-sft-8b`, y despues un entrenamiento por refuerzo con DPPO (una variante de PPO) sobre el conjunto de tareas TMax-13K v1.1, formateado para el framework open-instruct y endurecido/prefiltrado segun la coleccion v1.1. El release corresponde al paso 500 de entrenamiento, seleccionado por su puntuacion en TB-Lite (no en Terminal-Bench 2.1); los checkpoints intermedios 100, 200, 300 y 400 estan disponibles como ramas `step-0100` a `step-0400`.

Como detalles de reproducibilidad, el repositorio conserva los ficheros de procedencia originales (`campaign_provenance.json` cuando esta disponible) y un `release_manifest.json` con los commits inmutables de origen y los resultados de evaluacion. Para el despliegue, el modelo usa el parser de tool calls de Hermes (heredado de Qwen3-8B) y esta pensado para servirse con vLLM junto al harness de agente de terminal del repositorio de codigo del proyecto.

## Capacidades

- Agente de terminal: ejecucion de comandos en un entorno de shell, interpretacion de la salida y razonamiento multi-paso para resolver tareas de forma autonoma.
- Tool calling / function calling: soporte nativo mediante el parser Hermes (en vLLM: `--enable-auto-tool-choice --tool-call-parser hermes`).
- Razonamiento agenticos de varios pasos: planificacion de secuencias de comandos, diagnostico de errores y correccion iterativa dentro de una sesion.
- Generacion de texto y codigo en ingles, orientada a tareas de administracion de sistemas y linea de comandos.
- Compatibilidad con harness de evaluacion de agentes (el propio repositorio tmax, con evaluaciones via Harbor).
- Publicacion de checkpoints intermedios (pasos 100-500), util para analizar la evolucion del entrenamiento por refuerzo.
- No hay indicios de capacidades multimodales (vision, audio) ni de modo de pensamiento extendido en la informacion disponible.

## Casos de uso

- Automatizacion de operaciones DevOps: el modelo puede encadenar comandos de shell para instalar dependencias, configurar servicios o diagnosticar fallos, gracias a su entrenamiento especifico como agente de terminal y a su contexto de 40.960 tokens para sesiones largas.
- Depuracion asistida en pipelines de CI/CD: integrado con el harness del repositorio tmax, puede analizar logs de builds fallidos, ejecutar comandos de diagnostico y proponer o aplicar correcciones antes de reejecutar la pipeline.
- Tareas de configuracion de sistemas: resuelve tareas tipo benchmark como montar un servidor web con git (estilo `configure-git-webserver` de Terminal-Bench), siguiendo instrucciones en lenguaje natural.
- Gestion de repositorios git: automatizacion de flujos habituales (commits, ramas, hooks, configuracion remota) mediante tool calling verificado contra la salida real de la consola.
- Investigacion en agentes y RL: los checkpoints intermedios, el dataset TMax-13K v1.1 y el codigo de entrenamiento/evaluacion permiten reproducir experimentos y estudiar el efecto del RL en capacidades agenticas.
- Evaluacion y benchmarking: sirve como modelo de referencia para comparar harnesses y entornos de evaluacion de agentes de terminal (TB-Lite, Terminal-Bench 2.1) bajo condiciones controladas.
- Educacion en administracion de sistemas: en entornos sandbox, puede actuar como companero practico que ejecuta y explica comandos reales de Linux.

## Benchmarks y rendimiento

Resultados publicados en la model card (harness fijo Vanillux0.2.3 con Sandfleet via Harbor, tres intentos por tarea; TB-Lite con 96 tareas; barrido de evaluacion actualizado el 5 de octubre de 2026):

| Checkpoint (paso) | TB-Lite (%) ± EE (pp) | Seleccion |
|---|---:|---|
| 100 | 11,52 ± 1,47 | |
| 200 | 14,81 ± 1,50 | |
| 300 | 12,01 ± 1,46 | |
| 400 | 12,98 ± 1,40 | |
| 500 (main) | 17,78 ± 1,12 | Checkpoint principal |

Ademas, el checkpoint 500 puntua **6,44 ± 1,00 %** en Terminal-Bench 2.1 (88 tareas, tres intentos por tarea, con `configure-git-webserver` excluida).

No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K, etc.) ni comparativas directas con otros modelos en la informacion disponible. Nota: los resultados de v1.1 usan un harness distinto al de la release original v1.0, por lo que no deben compararse directamente con las cifras de v1.0.

## Requisitos de hardware

- VRAM estimada para los pesos en bf16: ~16,5 GB (8,19 B de parametros x 2 bytes); a esto hay que sumar la cache KV para el contexto de 40.960 tokens (estimacion: ~6 GB adicionales por secuencia completa), mas overhead del runtime.
- GPU recomendadas: una unica GPU de 40-80 GB (A100 40/80 GB, H100) para servir el contexto completo de 40.960 tokens con vLLM, tal como sugiere el ejemplo oficial con `--tensor-parallel-size 1`.
- Consumer GPUs: en una RTX 4090 o RTX 3090 (24 GB) es viable reducir `--max-model-len` para que quepa; la propia model card indica aumentar `--tensor-parallel-size` o reducir la longitud de contexto segun la memoria disponible.
- Entorno probado: Python 3.12, PyTorch 2.13.0, CUDA 13.0 y vLLM 0.32.0, con `CUDA_HOME` configurado y `nvcc` en el `PATH`.
- Despliegue: vLLM (metodo de referencia, con el comando de la model card) junto al harness de agente de terminal del repositorio tmax; tambien existe alojamiento API de terceros (Featherless.ai para los modelos tmax de Ai2). No hay convertidos oficiales a GGUF, por lo que llama.cpp u Ollama no figuran como opciones soportadas en la documentacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TMaxxx/tmax-8b-v1.1 | 8,19 B | SFT + RL (DPPO), dataset TMax-13K v1.1 | 40.960 | Apache 2.0 | Pesos y checkpoints intermedios en HuggingFace |
| allenai/tmax-sft-8b | ~8 B | Solo SFT sobre Qwen3-8B | 40.960 | Apache 2.0 | Pesos en HuggingFace; base del modelo RL |
| allenai/tmax-8b (v1.0) | ~8 B | SFT + RL (DPPO), dataset v1.0 | 40.960 | Apache 2.0 | Pesos en HuggingFace; resultados con harness anterior, no comparables directamente |
| Qwen3-8B (base) | ~8 B | Preentrenamiento + post-entrenamiento generalista de Alibaba | 40.960 | Apache 2.0 | Pesos en HuggingFace; modelo generalista, sin especializacion en terminal |

En terminos de puntuaciones agenticas comparadas, no se han publicado en la informacion disponible resultados de TB-Lite o Terminal-Bench 2.1 para los modelos alternativos bajo el mismo harness, por lo que no es posible una comparacion numerica directa.

## Limitaciones y advertencias

- Rendimiento agenticos todavia modesto: el checkpoint principal resuelve el 17,78 % de TB-Lite y el 6,44 % de Terminal-Bench 2.1, por lo que la mayoria de tareas complejas no se completan; no es fiable para produccion sin supervision humana.
- Riesgo inherente al dominio: al operar sobre una terminal real, errores o alucinaciones pueden traducirse en comandos con efectos reales (borrado de ficheros, cambios de configuracion); se recomienda ejecutar siempre en entornos aislados (contenedores o maquinas virtuales desechables).
- Idioma: entrenado y documentado solo en ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Alucinaciones: como todo LLM, puede inferir rutas, nombres de paquetes o flags incorrectos; las acciones deben validarse contra la salida real del sistema.
- Contexto limitado a 40.960 tokens, lo que restringe sesiones de terminal muy largas o salidas de comandos muy voluminosas.
- Licencia: Apache 2.0 permite el uso comercial, pero la model card declara que el modelo esta destinado a uso de investigacion y educacion conforme a las Responsible Use Guidelines de Ai2; conviene revisar esas directrices antes de un despliegue comercial.
- Dependencia de software: el uso previsto requiere vLLM 0.32.0 y el harness del repositorio tmax; versiones distintas no estan verificadas.
- Sin cuantizaciones oficiales publicadas, lo que limita las opciones de despliegue en hardware de consumo.
- Comparabilidad de resultados: los numeros de v1.1 provienen de un harness corregido distinto al de v1.0; no mezclar cifras entre releases.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TMaxxx/tmax-8b-v1.1
- Coleccion TMax v1.1 (modelos y datos): https://huggingface.co/collections/TMaxxx/tmax-v11
- Dataset de entrenamiento TMax-13K v1.1: https://huggingface.co/datasets/TMaxxx/tmax-13k-v1.1
- Checkpoint SFT base (allenai/tmax-sft-8b): https://huggingface.co/allenai/tmax-sft-8b
- Paper (arXiv): https://arxiv.org/abs/2606.23321
- Repositorio de codigo (entrenamiento y evaluacion): https://github.com/hamishivi/tmax
- Blog del proyecto: https://wai-org.com/blog/tmax/
- Coleccion original de Ai2 (release v1.0): https://huggingface.co/collections/allenai/tmax
- Guia de instalacion de vLLM (version probada): https://docs.vllm.ai/en/v0.32.0/getting_started/installation/gpu/
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
- Alojamiento API de terceros (Featherless.ai): https://featherless.ai/models/allenai/tmax-8b
