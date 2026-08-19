# Srishti1013/insurance-lora-adapter

## Resumen
El modelo `Srishti1013/insurance-lora-adapter` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Srishti1013, diseñado para especializar el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` en tareas relacionadas con el sector de seguros. El adaptador se entrenó utilizando la librería Unsloth, que acelera el fine-tuning, y la biblioteca TRL de Hugging Face. Su objetivo es dotar al modelo base de capacidades específicas para el dominio asegurador sin necesidad de reentrenar todos los parámetros, reduciendo costes computacionales y de memoria.

El adaptador está publicado bajo licencia Apache-2.0, lo que permite uso comercial y modificación, y soporta únicamente el idioma inglés según la model card. Al estar basado en Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto de 128k tokens (aunque no se confirma si el adaptador modifica este valor). El repositorio tiene un tamaño de 0.2 GB, correspondiente a los pesos del adaptador en formato safetensors.

Aunque la información pública es limitada, este adaptador representa un ejemplo práctico de fine-tuning eficiente mediante LoRA, una técnica ampliamente adoptada para adaptar modelos de gran tamaño a dominios específicos con recursos reducidos. Su relevancia radica en la posibilidad de desplegar modelos especializados en seguros sobre infraestructura existente sin necesidad de GPUs de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador contiene un número reducido de parámetros, típicamente <1% del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128k tokens (heredada del modelo base, no confirmada para el adaptador) |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit, pero el adaptador se distribuye en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El adaptador se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar. El modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` es una versión cuantizada a 4 bits (bitsandbytes) del modelo instruct de 7B parámetros, optimizada para fine-tuning eficiente con Unsloth. El adaptador LoRA añade matrices de baja dimensión a las capas de atención y feed-forward, permitiendo ajustar el modelo a un dominio específico sin modificar los pesos originales.

El entrenamiento se realizó con la librería Unsloth, que acelera el proceso hasta 2x en comparación con métodos convencionales, y probablemente utilizó la biblioteca TRL (Transformer Reinforcement Learning) para supervisión fina (SFT). No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que fue "finetuned from model" y que se entrenó con Unsloth.

## Capacidades
- Generación de texto especializada en el dominio de seguros: el adaptador está diseñado para mejorar el rendimiento del modelo base en tareas como consultas de pólizas, reclamaciones y documentación aseguradora.
- Razonamiento y comprensión del lenguaje natural: hereda las capacidades generales de Qwen2.5-7B-Instruct, incluyendo razonamiento de sentido común, comprensión lectora y generación coherente.
- Soporte de código y matemáticas: el modelo base es competente en estas áreas, aunque no se ha verificado si el adaptador mantiene estas capacidades.
- Multilingüismo: limitado al inglés según la model card; no se especifica soporte para otros idiomas.
- Tool calling y agentes: no hay información sobre si el adaptador soporta function calling o uso como agente; estas capacidades dependen del modelo base, que sí las tiene, pero no se confirma su preservación.

## Casos de uso
- Atención al cliente en aseguradoras: el adaptador puede gestionar consultas frecuentes sobre pólizas, coberturas y reclamaciones, proporcionando respuestas contextuales gracias a la ventana de contexto de 128k tokens del modelo base.
- Análisis de documentos de pólizas: permite extraer y resumir información clave de contratos de seguros, condiciones y exclusiones, facilitando la revisión legal o administrativa.
- Clasificación de reclamaciones: puede categorizar reclamaciones según tipo, gravedad o urgencia, ayudando a priorizar la gestión interna.
- Generación de respuestas para chatbots de seguros: integrable en sistemas de mensajería para ofrecer asistencia automatizada 24/7, reduciendo la carga del personal humano.
- Asistencia en la redacción de comunicaciones: ayuda a redactar cartas de respuesta a clientes, notificaciones de siniestro o documentos de renovación con un tono profesional y preciso.
- Formación y consulta interna: puede servir como herramienta de consulta para agentes y corredores, respondiendo preguntas sobre normativas o procedimientos internos (si se entrena con documentación específica).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este adaptador. Se recomienda realizar una evaluación propia en tareas de seguros antes de su uso en producción.

## Requisitos de hardware
- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo base de 7B cuantizado a 4 bits, el uso de memoria es aproximadamente de 4-6 GB para la inferencia en FP16 o BF16, dependiendo de la longitud de la secuencia y del batch size.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3070/3080, RTX 4060/4070, o GPUs de datacenter como A10G o L4. Para despliegue en producción, se recomienda A100 o H100 si se requiere alto throughput.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo con 8 GB o más, gracias a la cuantización del modelo base y al pequeño tamaño del adaptador.
- Opciones de despliegue: se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. El adaptador se carga sobre el modelo base cuantizado; es necesario fusionar los pesos o usar la carga dinámica de LoRA.
- Latencia y throughput: no disponible; dependerá del hardware y de la configuración de inferencia.

## Comparativa con modelos similares
No se dispone de información sobre adaptadores LoRA comparables en el dominio de seguros. Como referencia, se puede comparar con el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` y con otros adaptadores genéricos de Qwen2.5, pero no hay datos públicos de rendimiento específico. La comparación se limita a características generales:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Srishti1013/insurance-lora-adapter | Adaptador (no especificado) | 128k (heredado) | Apache-2.0 | safetensors |
| unsloth/Qwen2.5-7B-Instruct-bnb-4bit | 7B | 128k | Apache-2.0 | safetensors (bnb-4bit) |
| Qwen2.5-7B-Instruct (original) | 7B | 128k | Apache-2.0 | safetensors |

## Limitaciones y advertencias
- Sesgos y alucinaciones: al estar basado en Qwen2.5-7B, el modelo puede presentar sesgos presentes en los datos de entrenamiento originales y generar información falsa o inventada, especialmente en dominios especializados como seguros.
- Falta de evaluación: no se han publicado benchmarks ni evaluaciones de calidad, por lo que el rendimiento real en tareas de seguros es desconocido.
- Idioma limitado: solo se soporta inglés; no es adecuado para uso en español u otros idiomas sin un adaptador adicional.
- Riesgo de sobreajuste: al ser un adaptador LoRA entrenado con un dataset desconocido, podría estar sobreajustado a un conjunto específico de datos y no generalizar bien a casos variados.
- Requisitos de fusión: para su uso en producción, el adaptador debe fusionarse con el modelo base o cargarse mediante librerías que soporten LoRA (por ejemplo, peft). Esto añade complejidad al despliegue.
- Licencia: aunque la licencia es Apache-2.0, el modelo base también lo es, por lo que no hay restricciones comerciales, pero se recomienda verificar la procedencia de los datos de entrenamiento del adaptador.

## Enlaces
- HuggingFace: https://huggingface.co/Srishti1013/insurance-lora-adapter
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
