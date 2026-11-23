# zbbwww23/uav-agent-qwen25-72b-cp5500

## Resumen

El modelo `zbbwww23/uav-agent-qwen25-72b-cp5500` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen2.5-72B-Instruct, publicado por el usuario zbbwww23 en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (210.683.928 bytes, unos 0,2 GB) que deben cargarse junto al modelo base mediante la librería PEFT. El adaptador está especializado en tareas de agente para control de vuelo de vehículos aéreos no tripulados (UAV), con soporte de function calling y validación en línea sobre un conjunto de 116 casos.

El repositorio no incluye los pesos del modelo base, que conserva su propia licencia y restricciones de uso. El adaptador fue seleccionado entre tres candidatos LoRA de la misma familia mediante validación formal en línea, y se distribuye con licencia "other" (no especificada en detalle en la información disponible). El checkpoint elegido es `checkpoint-5500` de la familia Qwen2.5-72B.

La relevancia del modelo radica en su enfoque: un adaptador pequeño y verificado criptográficamente (SHA-256 incluido) para un dominio muy concreto (agentes UAV con razonamiento multi-paso y llamadas a funciones), con métricas de validación publicadas. Ahora bien, la información pública es escasa: no se detallan la composición del dataset, los hiperparámetros de entrenamiento ni los idiomas soportados más allá de los del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen2.5-72B-Instruct |
| Parametros totales | No disponible (adaptador de 210.683.928 bytes; el modelo base tiene 72B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador (la del modelo base Qwen2.5-72B-Instruct no se detalla aqui) |
| Tipos de cuantizacion | QLoRA en entrenamiento; el adaptador se distribuye en safetensors (cuantizacion del base no especificada) |
| Idiomas soportados | No disponible (heredados del modelo base, no declarados) |
| Licencia | other (la licencia del modelo base sigue aplicando) |
| Formato de pesos | safetensors (adaptador PEFT; pesos del base no incluidos) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-72B-Instruct, un transformer decoder-only de la familia Qwen2.5. El adaptador en sí es un LoRA de bajo rango, entrenado con QLoRA (cuantizacion del base durante el entrenamiento) y distribuido como pesos PEFT en safetensors. El repositorio incluye los pesos del adaptador, la configuracion y los ficheros del tokenizer, pero no los pesos del modelo base.

El entrenamiento se orienta a un proyecto de pruebas de control de vuelo multi-agente para UAV. El checkpoint seleccionado (`checkpoint-5500`) se eligió entre tres candidatos LoRA de la misma familia mediante validación formal en línea sobre una cohorte de 116 casos. La model card remite al dataset público `zbbwww23/uav-agent-sft-public` para el manifiesto, las estadísticas de fuentes y las comprobaciones de aislamiento de splits; el JSONL crudo de fuentes mixtas, las respuestas privadas y las trazas de referencia no se incluyen. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; solo se indica SFT (supervised fine-tuning) con LoRA/QLoRA.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, conversacional).
- Function calling / tool calling, segun los tags del repositorio (`function-calling`).
- Comportamiento de agente para control de vuelo de UAV, con razonamiento multi-paso (tag `agent`).
- Diagnostico y explicacion: la validacion incluye métricas de "diagnosis macro F1" y "explanation support accuracy", lo que sugiere capacidad de justificar decisiones.
- Capacidades multilingues: no declaradas; dependen del modelo base Qwen2.5-72B-Instruct.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Control de vuelo asistido por agente: el adaptador puede interpretar instrucciones de misión y emitir llamadas a funciones de control (waypoints, altitud, velocidad) en un bucle cerrado, dado que fue validado con una tasa de éxito estricta en bucle cerrado de 0,9483 sobre 116 casos.
- Diagnóstico de fallos en simulación UAV: con un macro F1 de diagnóstico de 0,9477, el modelo puede clasificar causas de fallo y generar explicaciones de soporte (0,8276 de accuracy en explicación) para ingenieros de pruebas.
- Pruebas automatizadas de sistemas multi-agente: integración en pipelines de validación donde el modelo actúa como planificador que invoca herramientas de simulación y evalúa resultados.
- Asistente técnico para operadores de drones: conversación multi-turno con contexto del modelo base para consultar procedimientos y parámetros de vuelo.
- Generación de trazas de referencia sintéticas: aunque las trazas reales no se publican, el adaptador puede producir secuencias de acciones plausibles para aumentar datasets de prueba (con validación humana posterior).
- Prototipado de agentes con function calling en dominios aeroespaciales: al ser un adaptador ligero, permite experimentar con un base de 72B sin reentrenar el modelo completo.

## Benchmarks y rendimiento

Resultados de validación en línea publicados en la model card (116 casos):

| Metrica | Valor |
|---|---:|
| Tasa de éxito estricta en bucle cerrado | 0,9483 |
| Accuracy detallada del agente | 0,9735 |
| Puntuación compuesta detallada | 0,9660 |
| Macro F1 de diagnóstico | 0,9477 |
| Accuracy de soporte de explicación | 0,8276 |
| Casos | 116 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador pesa unos 0,2 GB; el modelo base Qwen2.5-72B-Instruct requiere hardware de gran capacidad. En precisión BF16/FP16, un modelo de 72B necesita del orden de 144 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: múltiples A100 80 GB, H100 80 GB o H200; también configuraciones multi-GPU con tensor parallelism.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en precisión completa. Con cuantizacion agresiva (4 bits) el base de 72B ronda los 36-40 GB, todavía por encima de una sola GPU de consumo; requeriría varias GPU o offloading a CPU.
- Opciones de despliegue: transformers + PEFT (carga indicada en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama solo si se convierte el base a GGUF y se aplica el adaptador (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uav-agent-qwen25-72b-cp5500 (este) | Adaptador sobre 72B | No disponible | Agente UAV / function calling | other | Hugging Face (adaptador) |
| Qwen2.5-72B-Instruct (base) | 72B | No disponible en esta ficha | Instrucción general | Licencia Qwen | Hugging Face |
| Alternativas de agente UAV de 72B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores comparables del mismo dominio en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: requiere descargar y cargar Qwen2.5-72B-Instruct, con su coste de hardware y su licencia.
- La licencia "other" no está detallada en la información disponible; la licencia y restricciones del modelo base siguen aplicando, por lo que conviene revisarlas antes de uso comercial.
- Validación limitada a 116 casos de un dominio muy específico (UAV); no hay evidencia de generalización fuera de ese dominio.
- No se declaran idiomas soportados; el comportamiento multilingüe depende del base y no está validado.
- Riesgo de alucinación inherente a los modelos de 72B, especialmente en explicaciones (accuracy de soporte de explicación de 0,8276, la métrica más baja publicada).
- Dataset de entrenamiento no público en su totalidad (JSONL crudo, respuestas privadas y trazas de referencia no incluidos), lo que limita la reproducibilidad.
- Sin datos de benchmarks estándar ni de latencia/throughput; el autor no documenta el proceso de conversión a GGUF ni el despliegue con vLLM/TGI.
- Uso en sistemas de vuelo reales no validado: la validación es en línea sobre casos de prueba, no en operación física.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/zbbwww23/uav-agent-qwen25-72b-cp5500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Dataset público: https://huggingface.co/datasets/zbbwww23/uav-agent-sft-public
- Registro de validación en línea: online-validation.json (referenciado en el repositorio, no enlazado directamente)
