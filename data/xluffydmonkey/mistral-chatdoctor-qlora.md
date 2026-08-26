# xluffyDmonkey/mistral-chatdoctor-qlora

## Resumen

El modelo `mistral-chatdoctor-qlora` es un ajuste fino del modelo Mistral-7B-Instruct-v0.2, desarrollado por el usuario xluffyDmonkey, con el objetivo de especializarlo en el dominio médico. Se entrena mediante la técnica QLoRA (cuantización de 4 bits + adaptadores de bajo rango) sobre el dataset ChatDoctor-HealthCareMagic-100k, que contiene alrededor de 100.000 conversaciones simuladas entre pacientes y médicos en inglés. El resultado es un modelo de chat capaz de analizar síntomas, historiales clínicos y ofrecer sugerencias de diagnóstico y tratamiento en lenguaje natural.

La relevancia de este modelo radica en que permite desplegar un asistente médico conversacional con un coste de recursos reducido, gracias a la cuantización QLoRA y al uso de la librería Unsloth para acelerar el entrenamiento. El repositorio contiene únicamente los adaptadores LoRA (0,2 GB) y no los pesos completos del modelo base, por lo que su uso requiere cargar el modelo base `unsloth/mistral-7b-instruct-v0.2-bnb-4bit` y aplicar los adaptadores. La arquitectura subyacente es un transformer decoder-only de 7.000 millones de parámetros con una ventana de contexto de 32.000 tokens, lo que facilita la gestión de historiales médicos extensos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mistral-7B (transformer decoder-only) |
| Parámetros totales | 7.000 millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantización | 4 bits (bnb-4bit) para entrenamiento; adaptadores en safetensors |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Mistral-7B-Instruct-v0.2, un transformer decoder-only con atención de ventana deslizante (sliding window attention) y una capa de normalización RMSNorm. El entrenamiento se realizó mediante QLoRA, una técnica que congela los pesos del modelo base cuantizado a 4 bits e inserta matrices de bajo rango (LoRA) en las capas de atención y MLP, permitiendo un ajuste fino con un consumo de VRAM significativamente menor que un fine-tuning completo.

El dataset utilizado es ChatDoctor-HealthCareMagic-100k, que contiene 100.000 conversaciones simuladas entre pacientes y profesionales médicos, con preguntas sobre síntomas, diagnósticos y recomendaciones de tratamiento. El entrenamiento se llevó a cabo con la librería Unsloth, que optimiza el proceso de entrenamiento de modelos de lenguaje, logrando una velocidad 2x superior en comparación con métodos convencionales. No se especifica si se aplicaron técnicas de RLHF o DPO; se trata de un fine-tuning supervisado directo sobre el dataset médico.

## Capacidades

- Generación de texto conversacional en inglés, especializado en el dominio médico.
- Análisis de síntomas y antecedentes clínicos para ofrecer posibles diagnósticos.
- Sugerencias de tratamientos y recomendaciones de seguimiento, basadas en patrones aprendidos del dataset.
- Capacidad de mantener conversaciones multi-turno gracias a la ventana de contexto de 32.000 tokens.
- No se ha documentado soporte para tool calling, function calling, agentes ni razonamiento multi-step.
- El modelo no tiene capacidades multimodales (visión, audio) ni modo de pensamiento explícito.

## Casos de uso

- **Asistencia en consultas médicas iniciales**: el modelo puede gestionar conversaciones preliminares con pacientes, recopilando información sobre síntomas y antecedentes, y ofreciendo una lista de posibles causas antes de la visita con un profesional. Su contexto de 32k tokens permite manejar historiales largos.
- **Triaje de pacientes en servicios de salud**: integrado en un chatbot de un hospital, puede clasificar la urgencia de los síntomas descritos y derivar al paciente al departamento adecuado, reduciendo la carga del personal sanitario.
- **Educación médica para estudiantes**: se puede usar como herramienta de práctica interactiva para que los estudiantes de medicina simulen consultas con pacientes virtuales y reciban feedback sobre sus razonamientos.
- **Documentación clínica asistida**: a partir de conversaciones con pacientes, el modelo puede generar borradores de resúmenes clínicos o historias médicas, que luego un profesional revisa y completa.
- **Soporte de segunda opinión**: el modelo puede ofrecer una segunda interpretación de síntomas o diagnósticos propuestos por un profesional, aunque siempre con la supervisión humana.
- **Asistente en aplicaciones de salud y bienestar**: integrado en una aplicación móvil de seguimiento de salud, puede responder a dudas frecuentes sobre medicación, efectos secundarios o hábitos saludables, con la advertencia de que no sustituye el consejo médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- El modelo base Mistral-7B en precisión fp16 requiere aproximadamente 14 GB de VRAM para inferencia.
- Con cuantización 4-bit (como la usada en el entrenamiento QLoRA), la VRAM necesaria se reduce a unos 6-8 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3070, RTX 4060, RTX 4080 o RTX 4090.
- El repositorio solo contiene los adaptadores LoRA, por lo que se necesita cargar el modelo base cuantizado `unsloth/mistral-7b-instruct-v0.2-bnb-4bit` y aplicar los adaptadores. El entrenamiento de QLoRA se puede realizar en una GPU con 15 GB de VRAM, según el proyecto de referencia.
- Para despliegue en producción, se pueden usar servidores de inferencia compatibles con transformers como vLLM, Text Generation Inference (TGI) o Hugging Face Inference Endpoints, siempre que se integren los adaptadores.
- No se proporcionan versiones GGUF ni soporte directo para Ollama o llama.cpp en el repositorio, aunque es posible convertir los pesos a esos formatos si se requiere.
- La latencia y el throughput dependen del hardware y del entorno de despliegue; no se dispone de datos específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mistral-chatdoctor-qlora (este modelo) | 7B (adapters) | 32k | QLoRA sobre Mistral-7B-Instruct-v0.2 con dataset ChatDoctor-HealthCareMagic-100k | Apache-2.0 | HF, safetensors |
| kavya-17b/medical-chatdoctor-mistral7b | 7B (adapters) | 32k | QLoRA sobre Mistral-7B-Instruct-v0.2 con mismo dataset | Apache-2.0 | HF, safetensors |
| ChatDoctor original (basado en LLaMA) | 7B | 2k | Fine-tuning completo sobre LLaMA-7B con dataset ChatDoctor | no disponible | GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos. El modelo original ChatDoctor (Kent0n-Li/ChatDoctor) es un fine-tuning completo de LLaMA-7B, mientras que los dos modelos de Mistral usan QLoRA, lo que los hace más eficientes en recursos. La ventaja de este modelo es su contexto ampliado de 32k tokens, mientras que el original solo soporta 2k.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente en inglés; no es adecuado para conversaciones en otros idiomas.
- Puede generar respuestas plausibles pero incorrectas o alucinaciones sobre diagnósticos y tratamientos. No debe usarse como sustituto de un profesional médico.
- Los datos de entrenamiento provienen de conversaciones simuladas, lo que puede introducir sesgos en las respuestas sobre ciertas condiciones o grupos poblacionales.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de exactitud clínica. Se recomienda revisión humana en cualquier aplicación de salud.
- El repositorio solo contiene adaptadores LoRA; para usar el modelo se requiere descargar el modelo base (unsloth/mistral-7b-instruct-v0.2-bnb-4bit) y aplicar los adaptadores, lo que añade complejidad de despliegue.
- No se han publicado resultados de evaluación en benchmarks estándar, por lo que se desconoce su rendimiento real en tareas médicas en comparación con otros modelos.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/xluffyDmonkey/mistral-chatdoctor-qlora](https://huggingface.co/xluffyDmonkey/mistral-chatdoctor-qlora)
- Repositorio del proyecto ChatDoctor (original): [https://github.com/Kent0n-Li/ChatDoctor](https://github.com/Kent0n-Li/ChatDoctor)
- Repositorio de fine-tuning con QLoRA y Mistral-7B: [https://github.com/ashesh-12/medical-llm-finetuning-qlora-mistral7b](https://github.com/ashesh-12/medical-llm-finetuning-qlora-mistral7b)
- Modelo similar (kavya-17b/medical-chatdoctor-mistral7b): [https://huggingface.co/kavya-17b/medical-chatdoctor-mistral7b](https://huggingface.co/kavya-17b/medical-chatdoctor-mistral7b)
- Página de FriendliAI con el modelo similar: [https://friendli.ai/models/kavya-17b/medical-chatdoctor-mistral7b](https://friendli.ai/models/kavya-17b/medical-chatdoctor-mistral7b)
