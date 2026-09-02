# Timooody/qwen2-5-1-5b-legal-grpo-v4

## Resumen

El modelo `Timooody/qwen2-5-1-5b-legal-grpo-v4` es un ajuste fino (fine-tune) del modelo Qwen2.5 de 1.5 mil millones de parámetros, especializado en tareas legales y entrenado mediante aprendizaje por refuerzo con Group Relative Policy Optimization (GRPO). Fue desarrollado por el usuario Timooody y se basa en un modelo intermedio `Timooody/qwen2-5-1-5b-legal-finetuned`, que ya había sido ajustado con datos jurídicos. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió una velocidad de entrenamiento aproximadamente dos veces superior a la habitual.

Este modelo está orientado a la generación de texto en inglés, con un enfoque en razonamiento y respuesta a preguntas legales. Su relevancia radica en que combina un tamaño reducido (1.5B) con técnicas de optimización por refuerzo (GRPO) para mejorar la capacidad de razonamiento estructurado en un dominio específico. Al ser de código abierto bajo licencia Apache-2.0, puede integrarse en aplicaciones comerciales y de investigación sin restricciones de uso significativas.

La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only, aunque no se proporcionan detalles adicionales sobre la configuración exacta (número de capas, atención, etc.) en la información disponible. El modelo tiene 1.543.714.304 parámetros y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only estándar con atención causal. No se especifican detalles como el número de capas, dimensiones ocultas o mecanismos de atención alternativos. El proceso de entrenamiento consistió en un ajuste fino supervisado inicial (el modelo base `Timooody/qwen2-5-1-5b-legal-finetuned`) seguido de un entrenamiento por refuerzo con GRPO. GRPO es una variante de PPO que optimiza la política mediante múltiples muestras por estado, reduciendo el coste computacional y mejorando la estabilidad. Se utilizaron las librerías Unsloth (para acelerar el entrenamiento) y TRL (Transformer Reinforcement Learning) de Hugging Face. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni la composición de los datos legales utilizados.

## Capacidades

- Generacion de texto en ingles, con especializacion en dominios legales.
- Razonamiento estructurado y respuesta a preguntas, mejorado mediante GRPO.
- Capacidad de seguir instrucciones (instruct tuning) heredada del modelo base Qwen2.5 Instruct.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- No se especifica soporte multilingue; el campo `language` indica solo ingles.

## Casos de uso

- Asistencia legal automatizada: el modelo puede responder consultas juridicas basicas en ingles, como explicaciones de conceptos legales o resumenes de normativas, aunque su tamano limitado restringe la profundidad.
- Analisis de documentos legales: puede extraer clausulas relevantes o generar resumenes de contratos, siempre que el contexto no exceda la ventana disponible (no especificada).
- Generacion de borradores de textos legales: util para redactar clausulas estandar o avisos legales, con revision humana posterior.
- Chatbots de atencion al cliente en despachos de abogados: integrable en sistemas de soporte para responder preguntas frecuentes sobre procedimientos legales.
- Educacion juridica: herramienta de estudio para estudiantes de derecho que necesiten ejemplos o explicaciones de casos.
- Prototipado rapido de aplicaciones NLP en el sector legal: al ser un modelo pequeno, puede desplegarse en entornos con recursos limitados para validar conceptos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo especifico.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB (1.543.714.304 parametros × 2 bytes por parametro), mas overhead de activaciones y cache.
- Con cuantizacion de 8 bits (si estuviera disponible) se reduciria a unos 1,6 GB; con 4 bits, a unos 0,8 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). Para cuantizaciones menores, GPUs con 2 GB podrian ser suficientes.
- Es compatible con consumer GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan configuraciones especificas.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 1.5B en una GPU moderna (RTX 3090) suele generar entre 50 y 100 tokens por segundo, pero esto depende de la implementacion y el hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Se puede comparar estructuralmente con otros modelos de 1.5B:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Timooody/qwen2-5-1-5b-legal-grpo-v4 | 1.54B | No disponible | Apache-2.0 | Legal (ingles) |
| Qwen2.5-1.5B-Instruct | 1.54B | 32K (tipico) | Apache-2.0 | Generico, instruct |
| Azzindani/Qwen2.5_1.5B_IT_ID_Legal | 1.54B | No disponible | No especificada | Legal (indonesio) |

La comparacion se limita a parametros y licencia; no hay datos de rendimiento para establecer diferencias funcionales.

## Limitaciones y advertencias

- Tamano reducido: al ser un modelo de 1.5B, su capacidad de razonamiento complejo y manejo de matices legales es limitada en comparacion con modelos de mayor escala.
- Sesgos potenciales: el entrenamiento con datos legales especificos puede introducir sesgos relacionados con la jurisdiccion o el tipo de documentos utilizados, aunque no se documentan.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventadas, especialmente en dominios especializados como el legal, donde la precision es critica.
- Limitaciones de idioma: solo se ha entrenado en ingles; no es adecuado para otros idiomas sin ajuste adicional.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide conocer los limites para documentos largos.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas legales o generales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y no se ofrece garantia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Timooody/qwen2-5-1-5b-legal-grpo-v4
- Version anterior (v2): https://huggingface.co/Timooody/qwen2-5-1-5b-legal-grpo-v2
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/Timooody/qwen2-5-1-5b-legal-grpo-v2
- Modelo base intermedio: https://huggingface.co/Timooody/qwen2-5-1-5b-legal-finetuned (inferido del campo base_model)
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
