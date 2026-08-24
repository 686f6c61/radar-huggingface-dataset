# yuaay/vanguard

## Resumen

VANGUARD es un modelo de lenguaje causal de propósito general basado en **Qwen3-8B**, desarrollado por el autor yuaay, que ha sido entrenado específicamente para la tarea de juicio de seguridad en agentes autónomos. El modelo no emplea un cabezal clasificador dedicado, sino que utiliza la interfaz estándar de generación de texto para producir una etiqueta de seguridad (`SAFE`, `POTENTIAL_UNSAFE`, `UNSAFE`) junto con una breve justificación. Su particularidad es que, además de evaluar trayectorias observadas, es capaz de anticipar eventos futuros relevantes para la seguridad a partir de una trayectoria parcial, siguiendo el enfoque del artículo *JANUS: Foreseeing Latent Risk for Long-Horizon Agent Safety*.

Este modelo resulta relevante para la comunidad de desarrolladores e investigadores que trabajan en la seguridad de agentes autónomos, ya que permite detectar riesgos antes de que ocurra una acción dañina. Con 8.190 millones de parámetros, hereda la arquitectura de Qwen3-8B, incluyendo su ventana de contexto de 32.768 tokens y el soporte multilingüe, aunque el modelo card declara únicamente inglés como idioma de entrenamiento. El checkpoint se publica en formato safetensors y es compatible con la librería Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VANGUARD se basa en la arquitectura transformer causal de Qwen3-8B, con atención completa y un total de 8.190 millones de parámetros. El entrenamiento se realiza mediante fine-tuning sobre el modelo base, especializándolo en la tarea de juicio de seguridad de agentes. El proceso sigue el método descrito en el paper *JANUS*, que introduce la capacidad de prever riesgos latentes en trayectorias de largo horizonte. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el enfoque de juicio predictivo: el modelo no solo clasifica una trayectoria completa, sino que puede anticipar eventos futuros de riesgo a partir de un prefijo parcial, permitiendo una detección temprana de comportamientos peligrosos.

## Capacidades

- Generación de texto causal estándar, con interfaz de chat compatible con Transformers.
- Juicio de seguridad de agentes: clasifica trayectorias en `SAFE`, `POTENTIAL_UNSAFE` o `UNSAFE` con una justificación breve.
- Juicio predictivo de riesgo: a partir de una trayectoria parcial, anticipa eventos futuros de seguridad y los usa para etiquetar el riesgo antes de que ocurra la acción dañina.
- Soporte de tool use (indicado en los tags), aunque no se detalla si es nativo del modelo o heredado de Qwen3.
- Compatible con `text-generation-inference` y endpoints de Hugging Face.

## Casos de uso

- **Monitorización de agentes autónomos en producción**: VANGUARD puede evaluar trayectorias de agentes que ejecutan tareas complejas (por ejemplo, navegación web, gestión de archivos) y emitir una etiqueta de seguridad en tiempo real, permitiendo detener o redirigir el agente si detecta riesgo potencial.
- **Sistemas de guardrail para LLM**: integrado como un juez de seguridad en pipelines de generación, el modelo puede filtrar respuestas que podrían conducir a acciones no deseadas, especialmente en entornos de tool calling.
- **Entrenamiento de agentes seguros**: los desarrolladores pueden usar VANGUARD para evaluar trayectorias simuladas durante el entrenamiento por refuerzo, penalizando acciones que el modelo predice como potencialmente inseguras.
- **Auditoría de logs de agentes**: dado que el modelo acepta el historial de conversación y la trayectoria del agente, se puede aplicar a logs guardados para identificar incidentes de seguridad y generar informes de incidentes con razones.
- **Investigación en seguridad de agentes**: sirve como punto de partida para estudiar el juicio predictivo de riesgo en entornos de largo horizonte, permitiendo reproducir los experimentos del paper JANUS.
- **Sistemas de asistencia en decisiones críticas**: en aplicaciones donde un agente interactúa con sistemas externos (bases de datos, APIs), VANGUARD puede actuar como un validador de seguridad previo a la ejecución de cada paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el paper asociado para datos de evaluación específicos de la tarea de juicio de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, el modelo requiere aproximadamente 16,4 GB de VRAM (el tamaño del repo es 16,4 GB). Con cuantización int8 podría reducirse a unos 8 GB, y con int4 a unos 4-5 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para una inferencia fluida con la ventana de contexto completa, se recomienda una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40 GB, etc.). Con cuantización int8, una RTX 3080 de 10 GB podría ser suficiente.
- Si cabe en GPU de consumo: sí, con cuantización int8 o int4 en tarjetas de 8-10 GB, aunque la calidad puede degradarse ligeramente.
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama, y Text Generation Inference (TGI) según los tags del modelo.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud de la trayectoria.

## Comparativa con modelos similares

No se dispone de información comparativa publicada en la model card ni en la búsqueda web. El modelo es un fine-tune de Qwen3-8B, por lo que puede compararse con otros modelos de juicio de seguridad como Llama Guard (Meta) o modelos de clasificación de seguridad específicos, pero no se han publicado métricas de comparación. La principal diferencia es el enfoque predictivo de VANGUARD, que permite anticipar riesgos futuros, una capacidad que no está documentada en otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas no está garantizado.
- La licencia no está especificada, lo que limita su uso comercial sin aclaración legal previa.
- La información sobre el dataset de entrenamiento y los métodos de alineación es escasa; no se sabe si se aplicaron técnicas de mitigación de sesgos.
- Al ser un modelo de juicio de seguridad, puede presentar falsos positivos o negativos; su uso como único mecanismo de seguridad en producción requiere evaluación adicional.
- No se han publicado resultados de benchmarks generales de lenguaje, por lo que su rendimiento en tareas estándar no es conocido.
- La ventana de contexto de 32.768 tokens puede ser insuficiente para trayectorias de agentes muy largas.
- La licencia desconocida y la falta de cuantizaciones oficiales limitan su despliegue en entornos con restricciones de hardware.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yuaay/vanguard)
- [Paper JANUS (arXiv:2607.19913)](https://arxiv.org/abs/2607.19913)
- [Repositorio base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
