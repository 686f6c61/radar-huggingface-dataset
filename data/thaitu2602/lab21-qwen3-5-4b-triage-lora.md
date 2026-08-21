# thaitu2602/lab21-qwen3.5-4b-triage-lora

## Resumen

El modelo `thaitu2602/lab21-qwen3.5-4b-triage-lora` es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo base `unsloth/Qwen3.5-4B`, desarrollado por el usuario thaitu2602. Se publica como un ejercicio de fine-tuning dentro del repositorio académico VinUni-AI20k/Day21-Track3-Finetuning-Lab, que forma parte de un curso sobre ajuste de modelos de lenguaje con LoRA. El nombre "triage" sugiere que el adaptador está orientado a tareas de clasificación o priorización, aunque no se especifica el dominio concreto.

El adaptador utiliza la librería PEFT (0.20.0) y fue entrenado con supervisión (SFT) mediante TRL. El modelo base Qwen3.5-4B es la variante densa compacta de la familia Qwen3.5, que según la documentación de vLLM incorpora arquitectura de gated delta networks, codificador de visión, contexto de 262K tokens y decodificación MTP (Multi-Token Prediction). El adaptador añade una capa de ajuste específica para la tarea de triage, manteniendo el tamaño reducido del repositorio (0.1 GB).

La relevancia de este modelo radica en demostrar un flujo de fine-tuning eficiente con LoRA sobre un LLM moderno, aunque la falta de documentación detallada limita su uso directo en producción. Es un ejemplo de adaptación de bajo coste computacional para tareas especializadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (gated delta networks, con codificador de vision) + adaptador LoRA |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 4B segun su nombre) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (modelo base, segun vLLM) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizacion declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se monta sobre el modelo base `unsloth/Qwen3.5-4B`, que emplea una arquitectura de gated delta networks (una variante de atención eficiente) con codificador de visión integrado y decodificación MTP (Multi-Token Prediction), según la documentación de vLLM. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) usando las librerías TRL y PEFT, como indican los tags del repositorio. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni los hiperparámetros utilizados. El repositorio VinUni-AI20k sugiere que el ejercicio consistía en fine-tunear un modelo abierto con LoRA y demostrar que supera al modelo base con prompting cuidadoso, pero no se publican métricas ni configuraciones concretas.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el tag `conversational` indica soporte para diálogos multi-turno.
- Fine-tuning específico para triage: el nombre del modelo sugiere que está adaptado para clasificar o priorizar entradas (posiblemente tickets, incidencias o consultas), aunque no se documenta el dominio exacto.
- Hereda las capacidades del modelo base Qwen3.5-4B: razonamiento, generación de código, comprensión visual (gracias al codificador de visión) y procesamiento de contexto largo (262K tokens), siempre que el adaptador no las degrade.
- Soporte de tool calling y agentes: no confirmado para este adaptador, pero el modelo base Qwen3.5 lo incluye según la documentación general de la familia.

## Casos de uso

- Clasificación de tickets de soporte: el adaptador puede utilizarse para categorizar automáticamente incidencias de usuarios en un sistema de helpdesk, asignando prioridades o departamentos. Su tamaño reducido permite integrarlo en pipelines de inferencia con bajo coste.
- Priorización de alertas de seguridad: en un SOC, el modelo puede triagear alertas de SIEM, distinguiendo entre amenazas críticas y ruido, aprovechando el contexto largo para analizar logs extensos.
- Enrutamiento de consultas en chatbots: el adaptador puede decidir si una consulta debe derivarse a un agente humano o resolverse automáticamente, basándose en la intención y complejidad del mensaje.
- Filtrado de contenido en foros o redes sociales: clasificar publicaciones como spam, abuso o relevantes, usando el fine-tuning para adaptarse a las normas específicas de una comunidad.
- Análisis de correos electrónicos: priorizar bandejas de entrada, separando mensajes urgentes de boletines o phishing, con la capacidad de procesar hilos largos gracias al contexto de 262K.
- Investigación académica: como ejemplo didáctico de fine-tuning con LoRA, puede servir para estudiar el impacto de la adaptación de bajo rango en tareas de clasificación sobre un LLM moderno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de la tarea de triage.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es ligero (0.1 GB), pero el modelo base Qwen3.5-4B requiere aproximadamente 8-10 GB en FP16 para inferencia. Con cuantización (por ejemplo, 4-bit) podría caber en 4-6 GB.
- GPU recomendadas: según vLLM, Qwen3.5-4B está diseñado para GPUs de consumo de 16 GB, como RTX 4080/4090 o equivalentes. Para el adaptador, una GPU con 8 GB puede ser suficiente si se cuantiza el base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers + PEFT cargando el adaptador sobre el base.
- Latencia y throughput: no disponibles. Al ser un modelo de 4B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para la misma tarea de triage. Como referencia, se puede comparar con el modelo base sin fine-tuning:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B | 262K | no disponible | HuggingFace |
| lab21-qwen3.5-4b-triage-lora | 4B + LoRA | 262K | no disponible | HuggingFace |
| Otros adaptadores LoRA de 4B | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoría (adaptadores LoRA para clasificación) no está disponible por falta de datos.

## Limitaciones y advertencias

- Documentación ausente: la model card no contiene información sobre el dataset, el proceso de entrenamiento, los hiperparámetros ni las métricas de evaluación, lo que impide reproducir o validar el modelo.
- Sesgos desconocidos: al no conocer los datos de entrenamiento, no se pueden evaluar sesgos potenciales relacionados con el dominio de triage.
- Riesgo de alucinación: como cualquier LLM, puede generar respuestas incorrectas o inventadas, especialmente en tareas de clasificación si el contexto es ambiguo.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base, lo que limita su uso comercial sin aclaración legal.
- Dependencia del modelo base: el rendimiento del adaptador depende de las capacidades de Qwen3.5-4B, que a su vez tiene limitaciones propias no documentadas en esta ficha.
- Sin garantías de producción: al ser un ejercicio académico con 0 descargas y 0 likes, no hay evidencia de robustez en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thaitu2602/lab21-qwen3.5-4b-triage-lora
- Repositorio del lab (VinUni-AI20k): https://github.com/VinUni-AI20k/Day21-Track3-Finetuning-Lab
- Documentación de vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Guía de fine-tuning de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Repositorio de referencia de Qwen3.5 (algtrd24): https://github.com/algtrd24/qwen3.5
