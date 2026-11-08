# useing/cqa-qwen3-8b-lora

## Resumen

`cqa-qwen3-8b-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-8B, publicado por el usuario `useing`. Su propósito es evaluar un único criterio de calidad de atención telefónica (QA de call center) por petición, en diálogos de soporte en ruso, kazajo e inglés, devolviendo un veredicto JSON estricto. Forma parte del pipeline CQA del proyecto `d00mathon`, donde actúa como "tier 1" local de un enrutador en cascada.

El adaptador es explícitamente un prototipo: el propio autor indica en la model card que se entrenó durante 0,32 épocas y que no supera al modelo base en acuerdo (agreement). La relevancia es, por tanto, la de un ejemplo reproducible de ajuste fino de bajo coste (27 minutos en una RTX A5000, coste de pod de aproximadamente 0,22 USD) para una tarea vertical muy concreta, más que la de un modelo listo para producción.

El repositorio pesa 0,2 GB y contiene únicamente los pesos del adaptador (safetensors) más la configuración PEFT; no incluye el modelo base ni transcripciones en bruto. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | No disponible para el adaptador; modelo base Qwen3-8B (8B, dato no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenamiento con max_len 8192; despliegue recomendado con `--max-model-len 16384` |
| Tipos de cuantizacion | Base en nf4 4-bit con doble cuantizacion durante entrenamiento (bf16 en inferencia recomendada); otras cuantizaciones no disponibles |
| Idiomas soportados | Ruso (ru), kazajo (kk), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only. El ajuste es QLoRA: cuantizacion nf4 de 4 bits con doble cuantizacion y computo en bf16, con LoRA de rango r=16, alpha=32 y dropout 0,05 aplicado a las proyecciones q/k/v/o y a gate/up/down. La perdida se calcula solo sobre la completion (no sobre el prompt), con learning rate 1e-4 y scheduler coseno, batch efectivo de 16 y longitud maxima de 8192 tokens.

Los datos de entrenamiento son muy reducidos: 798 filas de entrenamiento y 82 de validacion (una fila = un dialogo x un criterio), con split por conversacion para evitar fuga. La mezcla linguistica en entrenamiento es RU 307, KZ 307, EN 184. Las fuentes son 128 ejemplos "gold" sinteticos escritos por el equipo y 410 filas destiladas del jurado de LLMs en la nube del proyecto (Claude Haiku/Sonnet con juez Opus), conservando solo veredictos unanimes o con confianza >= 0,9. No hay filas etiquetadas por humanos. El entrenamiento se limito a 16 pasos de optimizador (256 filas, aproximadamente 0,32 epoca) por restriccion de tiempo; la perdida de entrenamiento bajo de 1,07 a 0,67, con perdida de validacion 0,622 y precision de token en validacion 0,845. Se ejecuto en 1x RTX A5000 de 24 GB en 27 minutos, con torch 2.14, transformers 5.20.2, peft 0.21.2, trl 1.17.1 y bitsandbytes 0.50.2.

## Capacidades

- Evaluacion de QA de call center: puntua un criterio por peticion sobre una transcripcion de dialogo de soporte.
- Salida JSON estricta con los campos `reasoning`, `value`, `justification`, `evidence`, `missing_where`, `na_reason` y `confidence`.
- Valores de salida YES/NO/NA o una puntuacion numerica, segun el criterio evaluado.
- Multilinguee en ruso, kazajo e ingles para dialogos de soporte.
- Integracion en modo JSON de OpenAI (`CQA_OPENAI_TOOLS=0`), con prompt de sistema que contiene la rubrica y el esquema.
- Uso como tier 1 local de un enrutador en cascada (`CQA_LOCAL_ADAPTER`, `CQA_ROUTER_LOCAL_MODEL`).
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.
- El modelo debe servirse con el modo "thinking" desactivado (`enable_thinking: false`).

## Casos de uso

- Auditoria automatica de llamadas de soporte: el adaptador recibe la transcripcion y un criterio de la rubrica y devuelve un veredicto JSON con justificacion y evidencia, lo que permite generar informes estructurados por llamada sin postprocesar texto libre.
- Filtrado previo en cascada de bajo coste: al actuar como tier 1 local, puede resolver los casos sencillos y derivar solo los dudosos al modelo de referencia Jev 1.14 o a un LLM en la nube, reduciendo coste por llamada.
- Prototipado rapido de rubricas de calidad: al entrenarse en 27 minutos y 0,22 USD, sirve para validar si una nueva rubrica o criterio es aprendible antes de invertir en anotacion humana.
- Soporte multilinguee en centros de contacto de Eurasia: cubre ruso, kazajo e ingles en el mismo adaptador, util para operaciones con mezcla linguistica.
- Generacion de datos de evaluacion: su salida estructurada (evidencia, justificacion, confianza) puede usarse para construir conjuntos de validacion o para comparar con anotaciones humanas.
- Investigacion sobre destilacion de jurados LLM: el pipeline documentado (jurado en la nube con filtro de unanimidad y confianza) es replicable para otras tareas de clasificacion con rubrica.
- Integracion en pipelines de CI de calidad: desplegado con vLLM y el comando `python -m cqa gold --dir ...`, permite ejecutar evaluaciones reproducibles sobre un conjunto gold retenido.

## Benchmarks y rendimiento

Resultados publicados por el autor en la evaluacion `gold` de CQA (vLLM 0.33, modo JSON, decodificacion greedy):

| Conjunto | Modelo | Agreement | MAE total | Gross-flag P / R |
|---|---|---|---|---|
| Held-out (10 dialogos) | Qwen3-8B base | 0,787 | 12,17 | 0,0 / 0,0 |
| Held-out (10 dialogos) | Base + adaptador | 0,787 | 10,43 | 0,0 / 0,0 |
| Tuned gold (16, en train) | Qwen3-8B base | 0,789 | 14,77 | 0,67 / 0,67 |
| Tuned gold (16, en train) | Base + adaptador | 0,805 | 8,95 | 0,75 / 1,0 |
| Held-out | Referencia Jev 1.14 | 0,934 | 4,83 | 1,0 / 1,0 |

Acuerdo por criterio en held-out (base -> adaptador):

| Criterio | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 |
|---|---|---|---|---|---|---|---|---|
| Base -> adaptador | 1,0 -> 1,0 | 0,5 -> 0,4 | 0,7 -> 0,9 | 0,7 -> 0,5 | 1,0 -> 1,0 | 0,8 -> 0,9 | 0,9 -> 0,8 | 0,7 -> 0,8 |

El autor advierte que la fila "tuned gold" mide ajuste, no generalizacion, porque esos dialogos estaban en entrenamiento, y que con solo 10 dialogos held-out todas las diferencias estan dentro del ruido.

## Requisitos de hardware

- VRAM: se requiere una GPU de 24 GB para servir el modelo base en bf16 con el adaptador LoRA a contexto de 16k.
- GPU recomendadas por el autor: RTX A5000 24 GB o RTX 4090 24 GB. No se documentan requisitos para A100 o H100 en la informacion disponible.
- Entrenamiento: 1x RTX A5000 24 GB, 27 minutos.
- Despliegue recomendado: vLLM con `--enable-lora --lora-modules cqa=./cqa-qwen3-8b-lora --max-lora-rank 16 --max-model-len 16384 --default-chat-template-kwargs '{"enable_thinking": false}'`.
- Opciones alternativas (llama.cpp, Ollama, TGI): no documentadas para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Agreement (held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cqa-qwen3-8b-lora | Adaptador LoRA sobre Qwen3-8B | 8B (base) | 8192 entrenamiento / 16384 despliegue | 0,787 | Apache 2.0 | Hugging Face |
| Qwen3-8B base | Transformer decoder-only | 8B | No disponible en la informacion proporcionada | 0,787 | No disponible en la informacion proporcionada | Hugging Face |
| Jev 1.14 (referencia del proyecto) | Modelo de reglas/decision del proyecto | No disponible | No disponible | 0,934 | No disponible | No disponible (interno del proyecto) |

No se dispone de datos de benchmarks publicos (MMLU, HumanEval, GSM8K) para el adaptador ni para comparaciones con otros adaptadores de QA de call center en la informacion proporcionada.

## Limitaciones y advertencias

- Prototipo: el autor indica explicitamente que el adaptador no supera al modelo base en acuerdo y que se entreno solo 0,32 epocas.
- Datos muy escasos (798 filas de entrenamiento) y en su mayoria destilados del propio jurado de LLMs del proyecto, por lo que el adaptador hereda los sesgos de ese jurado.
- Cero filas etiquetadas por humanos; el conjunto gold retenido es sintetico y de solo 10 dialogos, de modo que todas las diferencias observadas estan dentro del ruido estadistico.
- Resultados por criterio mixtos: los criterios 02 y 04 empeoran en held-out.
- Rendimiento muy por debajo del modelo de referencia del proyecto (0,787 frente a 0,934 de agreement).
- No es una herramienta de seguridad ni de cumplimiento normativo; el autor recomienda mantener un humano en el bucle.
- El dataset de entrenamiento no se publica, lo que limita la reproducibilidad completa.
- Idiomas limitados a ruso, kazajo e ingles; no se documenta comportamiento en castellano.
- La licencia Apache 2.0 se declara para el adaptador, pero deben verificarse las condiciones del modelo base Qwen3-8B para uso comercial.
- Requiere servir con el modo thinking desactivado; un uso incorrecto del chat template puede degradar las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/useing/cqa-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del pipeline CQA: https://github.com/useing123/d00mathon
- Tutorial de ejecucion local de Qwen3 8B: https://aiindigo.com/tutorials/getting-started-with-qwen3-8b-local-enterprise-ai-on-8gb-ram
- Tutorial de fine-tuning de Qwen3 8B con LoRA (Optimum Neuron): https://huggingface.co/docs/optimum-neuron/training_tutorials/finetune_qwen3
