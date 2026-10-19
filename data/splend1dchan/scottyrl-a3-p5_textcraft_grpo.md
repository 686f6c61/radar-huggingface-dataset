# Splend1dchan/scottyrl-a3-p5_textcraft_grpo

## Resumen

`Splend1dchan/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B`. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (0,2 GB en safetensors) que debe cargarse junto al modelo base para poder inferir. Lo publica el usuario Splend1dchan como entrega del Assignment 3 del curso 11-768 (AI Agents) de CMU, dentro de un framework de entrenamiento denominado scottyrl.

El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo que optimiza la politica comparando respuestas dentro de un mismo grupo en lugar de usar un modelo critico separado. El objetivo declarado es la tarea TextCraft, un entorno de agente textual en el que el modelo debe encadenar acciones para fabricar objetos a partir de recetas y recursos disponibles. El nombre del run, `p5_textcraft_grpo`, resume la configuracion: fase o prompt 5, tarea TextCraft y optimizacion con GRPO.

Su relevancia es doble: por un lado, documenta un flujo completo de RL aplicado a un modelo pequeno (4B) para comportamiento agentico; por otro, incluye un protocolo de evaluacion reproducible con vLLM y un script del curso sobre los splits de validacion medium y hard de TextCraft-Synth con k=4. No hay resultados numericos publicados, ni licencia, ni idiomas declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen3.5-4B`; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible (el modelo base declara 4B; no se especifica el numero de parametros entrenables del adaptador) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizacion, pero no se documenta en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-4B |
| Rango LoRA | 32 |
| Libreria | peft |
| Framework de entrenamiento | scottyrl |
| Algoritmo | GRPO (segun el nombre del run) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (rank 32) inyectado en las capas del modelo base `Qwen/Qwen3.5-4B` mediante PEFT. El entrenamiento se ha realizado con scottyrl, framework identificado con la etiqueta `tinker`, y la politica se ha optimizado con GRPO: se muestrean varias completaciones por prompt, se puntuan con la recompensa del entorno y se actualiza el adaptador favoreciendo las trayectorias con ventaja relativa positiva dentro del grupo. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros de RL (tamano de grupo, KL, learning rate), el numero de pasos ni las semillas, por lo que la reproducibilidad completa no esta garantizada con la informacion disponible.

La model card incluye trazabilidad de la ejecucion: el adaptador se exporto desde la ruta `/data/group_data/UTD-NAS/chanjanh/AIAgents/assignment-3/runs/_export/v50_r1`, con la configuracion `configs/p5_textcraft_grpo.yaml` y el commit `eee28915cf300a7738b3cd50be8f2451dd64a048`. La tarea objetivo, TextCraft-Synth, es un entorno de agente textual con recompensas verificables por construccion (objetos fabricados correctamente), lo que encaja con RL sin anotacion humana. No se menciona ninguna innovacion arquitectonica adicional, decodificacion especulativa ni atencion lineal.

## Capacidades

- Ejecucion de tareas de agente textual en el entorno TextCraft: interpretacion de recetas, gestion de inventario y encadenamiento de acciones de crafting.
- Razonamiento multi-paso orientado a objetivos, reforzado mediante GRPO sobre recompensas del entorno.
- Evaluacion con multiples intentos (k=4) sobre los splits medium y hard de TextCraft-Synth, segun el protocolo descrito por el autor.
- Hereda las capacidades del modelo base `Qwen/Qwen3.5-4B` (generacion de texto y comprension de instrucciones); estas no se han verificado de forma independiente en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes con herramientas externas fuera de TextCraft: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modos especiales (thinking, razonamiento extendido): no disponible.
- No es un modelo autonomo: requiere cargar el modelo base y aplicar el adaptador.

## Casos de uso

- Reproduccion de experimentos de RL para agentes: el adaptador y la configuracion permiten replicar el pipeline GRPO sobre TextCraft-Synth y comparar variantes de recompensa o de tamano de grupo.
- Evaluacion estandarizada de agentes en entornos textuales: el script `scripts/evaluate_checkpoint.py` con `--k 4` sobre los splits medium y hard sirve como banco de pruebas para medir consistencia entre intentos.
- Servicio multi-LoRA con vLLM: al ser un adaptador de rango 32, puede servirse junto a otros adaptadores sobre el mismo `Qwen/Qwen3.5-4B` con `--enable-lora --max-lora-rank 32`, compartiendo pesos base y reduciendo coste de GPU por variante.
- Docencia y formacion en PEFT/RL: es un ejemplo completo y pequeno (0,2 GB) de fine-tuning con LoRA y GRPO, util para practicas de postentrenamiento sin infraestructura grande.
- Investigacion en sobreajuste a entorno: permite estudiar como un adaptador de 4B especializado pierde o conserva capacidades generales del modelo base al entrenar solo con recompensa de una tarea.
- Prototipado de asistentes de planificacion con recursos limitados: la tarea de crafting es estructuralmente similar a la planificacion de pasos con dependencias (recetas, materiales, orden de ejecucion), trasladable a dominios con reglas verificables.
- Integracion en CI para regresion de agentes: el par servidor vLLM + script de evaluacion se puede automatizar como test de aceptacion antes de promover un adaptador a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluacion, pero no incluye puntuaciones.

| Aspecto | Detalle |
|---|---|
| Entorno de evaluacion | TextCraft-Synth (validacion) |
| Splits | medium y hard |
| Metrica | No disponible (definida por `scripts/evaluate_checkpoint.py`) |
| Intentos por tarea | k = 4 |
| Serving | `vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=...` |
| Resultados publicados | No disponibles |
| Comparacion con otros modelos | No disponible |

## Requisitos de hardware

- Espacio en disco: 0,2 GB para el adaptador, mas el peso del modelo base `Qwen/Qwen3.5-4B` (aproximadamente 8 GB en bf16/fp16, estimacion por numero de parametros).
- VRAM estimada para inferencia con el modelo base en bf16: en torno a 8-10 GB solo de pesos, mas cache KV; se recomienda un minimo de 16 GB para contexto moderado (estimacion, no confirmada por el autor).
- Cuantizacion del modelo base a 8 bits: aproximadamente 4-5 GB de pesos; a 4 bits (Q4_K_M en GGUF): aproximadamente 2,5-3 GB. El adaptador puede fusionarse con el base cuantizado, aunque no se documenta el procedimiento.
- GPU consumer: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con el base en bf16 o cuantizado. En GPUs de 6-8 GB solo es viable con el base cuantizado a 4 bits.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para servir con vLLM en bf16 y soporte multi-LoRA con `--max-lora-rank 32`.
- Despliegue: vLLM con `--enable-lora` (documentado por el autor), TGI con soporte de adaptadores, y llama.cpp/Ollama requiere fusionar el adaptador en el modelo base antes de convertir a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | 4B (base) + LoRA r=32 | No disponible | No publicado | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base, sin adaptador) | 4B | No disponible | No disponible en esta ficha | No disponible | HuggingFace |
| Otros adaptadores LoRA para agentes sobre Qwen | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

No se dispone de datos publicados que permitan una comparacion cuantitativa con alternativas de la misma categoria; la unica comparacion posible es cualitativa frente al modelo base.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Artefacto academico: forma parte de una entrega de curso (11-768, Assignment 3), sin proceso de publicacion, revision ni validacion por la comunidad (0 descargas, 0 likes).
- Especializacion estrecha: el entrenamiento se limita a TextCraft-Synth; el comportamiento fuera de ese entorno no esta caracterizado y puede degradarse respecto al modelo base.
- Riesgo de sobreajuste al entorno o a la funcion de recompensa (reward hacking): no se documentan tecnicas de mitigacion ni curvas de entrenamiento.
- No es autonomo: sin el modelo base `Qwen/Qwen3.5-4B` el adaptador no produce salidas; cualquier problema del base (sesgos, alucinaciones) se hereda.
- Falta de informacion de entrenamiento: sin datos de tokens, composicion del dataset, hiperparametros ni semillas, no es posible auditar el sesgo ni reproducir los resultados.
- Idiomas no declarados: se desconoce el comportamiento en castellano y en otras lenguas distintas del ingles, que es el idioma habitual de los entornos de agentes academicos.
- Rendimiento no medido: no hay puntuaciones publicadas; no debe citarse como mejora sobre el base sin una evaluacion propia.
- Posible perdida de capacidades generales (olvido catastrofico) tras el RL sobre una unica tarea; no se ha evaluado en benchmarks generales como MMLU o GSM8K.
- En produccion, servir el adaptador exige control de versiones del par base + adaptador, ya que el adaptador no fija los pesos del base de forma inmutable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Splend1dchan/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Papers, blogs, repositorios o demos adicionales: no se han encontrado en la informacion disponible.
