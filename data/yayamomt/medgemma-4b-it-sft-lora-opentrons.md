# yayamomt/medgemma-4b-it-sft-lora-opentrons

## Resumen

El modelo `yayamomt/medgemma-4b-it-sft-lora-opentrons` es un adaptador LoRA de tipo PEFT construido sobre el modelo base `unsloth/medgemma-4b-it-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits de MedGemma 4B IT, la variante multimodal de Google para el ámbito sanitario. Este adaptador ha sido entrenado mediante aprendizaje supervisado (SFT) con descripciones de protocolos de la librería de Opentrons OT-2, con el objetivo de extraer metadatos estructurados en formato JSON (título, categorías, labware, pipetas, módulos y reactivos) a partir de texto en lenguaje natural. No genera código ejecutable de robot, sino que actúa como asistente de extracción de información.

El modelo resuelve un problema concreto: la transformación de descripciones textuales de protocolos de laboratorio en metadatos legibles por máquina, facilitando tareas como la búsqueda en bibliotecas de protocolos, la planificación de inventario o la anotación asistida. Su relevancia radica en que combina un modelo base especializado en medicina (MedGemma) con un ajuste fino específico para un dominio de automatización de laboratorio, lo que permite aprovechar el conocimiento médico general del modelo base para una tarea de nicho. El adaptador tiene un tamaño de 0,2 GB y está pensado para uso en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Gemma 3 4B (MedGemma 4B IT) |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (máxima secuencia de entrenamiento del adaptador; el contexto del modelo base no se especifica) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base usa cuantización bnb-4bit |
| Idiomas soportados | Inglés (entrenado solo con datos en inglés) |
| Licencia | health-ai-developer-foundations (términos de Google Health AI Developer Foundations) |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en una arquitectura LoRA de bajo rango (rank 16, alpha 32, dropout 0.05) aplicada sobre el modelo base `unsloth/medgemma-4b-it-bnb-4bit`. El entrenamiento se realizó con TRL (Transformer Reinforcement Learning) durante 3 épocas, utilizando el optimizador Paged AdamW de 8 bits, una tasa de aprendizaje de 1e-4, tamaño de batch 2 con acumulación de gradientes de 4, y una longitud máxima de secuencia de 2048 tokens. El hardware empleado fue una NVIDIA H100. El dataset proviene de la Opentrons Protocol Library, con descripciones en inglés de protocolos OT-2. No se aplicaron técnicas de RLHF ni DPO; se trata de un ajuste fino supervisado clásico. El checkpoint final (paso 246) fue seleccionado como el mejor según la pérdida de evaluación (`eval_loss=0.35`), aunque estos valores son solo diagnósticos de optimización y no métricas de calidad de la tarea.

## Capacidades

- Extracción de metadatos de protocolos Opentrons OT-2: dado un texto descriptivo, genera un objeto JSON con los campos `title`, `categories`, `labware`, `pipettes`, `modules` y `reagents`.
- Salida estructurada sin texto adicional ni marcado Markdown, lista para integrarse en pipelines de procesamiento.
- Comprensión de vocabulario técnico de laboratorio (nombres de placas, puntas, módulos magnéticos y de temperatura, pipetas de un solo canal y multicanal, etc.).
- Funciona como asistente de anotación humano-en-el-bucle: sugiere metadatos que deben ser revisados por un profesional.
- No genera código ejecutable de robot, por lo que no requiere validación de sintaxis de protocolos.
- Capacidades multilingües limitadas: solo entrenado en inglés, aunque el modelo base podría tener cierto conocimiento multilingüe, no se garantiza.

## Casos de uso

- Planificación de inventario de laboratorio: el modelo extrae automáticamente los tipos de labware y reactivos mencionados en descripciones de protocolos, permitiendo generar listas de materiales necesarios sin revisión manual.
- Búsqueda en bibliotecas de protocolos: al convertir descripciones en metadatos estructurados, facilita la indexación y recuperación de protocolos por categorías, módulos o pipetas específicas.
- Anotación asistida de nuevos protocolos: un investigador escribe una descripción en lenguaje natural y el modelo propone los campos JSON; el humano solo corrige los errores, reduciendo el tiempo de catalogación.
- Integración en sistemas de gestión de información de laboratorio (LIMS): los metadatos extraídos pueden enviarse directamente a una base de datos para alimentar dashboards o informes.
- Generación de documentación técnica: a partir de una descripción breve, el modelo completa campos como título y categorías, ayudando a estandarizar la documentación de protocolos.
- Validación de consistencia de metadatos: comparando la salida del modelo con metadatos existentes, se pueden detectar discrepancias o campos faltantes en bibliotecas de protocolos ya publicadas.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre un conjunto de validación etiquetado con 164 registros (disjuntos de los de entrenamiento). La tabla siguiente muestra precisión, recall y F1 por campo:

| Campo | Precision | Recall | F1 |
| --- | ---: | ---: | ---: |
| Categories | 0.79 | 0.78 | 0.79 |
| Labware | 0.35 | 0.32 | 0.34 |
| Pipettes | 0.65 | 0.70 | 0.67 |
| Modules | 0.67 | 0.80 | 0.73 |
| Reagents | 0.42 | 0.18 | 0.25 |

No se han publicado comparaciones con otros modelos de extracción de metadatos de protocolos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0,2 GB), pero requiere cargar el modelo base de 4B en cuantización 4 bits. La VRAM necesaria para inferencia se estima en torno a 4-6 GB, dependiendo de la longitud de la secuencia y del framework.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o superiores (RTX 4090, A100, H100). El entrenamiento se realizó en H100, pero la inferencia es viable en GPUs de consumo.
- Es posible ejecutarlo en CPU con cuantización adicional (por ejemplo, GGUF), aunque la latencia será mayor.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Transformers con PEFT, TGI (Text Generation Inference). Dado que es un adaptador PEFT, se puede cargar con `PeftModel` sobre el base cuantizado.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 4B en 4 bits, se espera una latencia de decodificación del orden de decenas de milisegundos por token en GPU moderna, pero depende del hardware y la longitud de entrada.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para extracción de metadatos de protocolos Opentrons. El autor tiene otro adaptador similar (`YamYam001/medgemma-4b-it-sft-lora-crc100k`) pero no se han publicado comparativas. Como referencia, se puede comparar con el modelo base MedGemma 4B IT sin ajuste fino, que no está especializado en esta tarea y probablemente produzca salidas menos estructuradas. Tampoco hay datos de otros modelos de extracción de metadatos de laboratorio en la información disponible.

## Limitaciones y advertencias

- El adaptador no genera, valida ni aprueba protocolos de robot ejecutables. Toda salida debe ser revisada por un profesional de laboratorio cualificado y validada en el entorno de simulación de Opentrons antes de su uso.
- No está destinado a la toma de decisiones clínicas, uso diagnóstico, manejo autónomo de líquidos ni operaciones de laboratorio críticas para la seguridad. Un error en la selección de labware, reactivo, módulo o pipeta podría causar daños.
- Los campos extraídos son predicciones del modelo, no un vocabulario controlado validado. Pueden ser genéricos, duplicados, omitidos o no soportados por la entrada.
- El rendimiento en los campos `labware` y `reagents` es bajo (F1 de 0.34 y 0.25 respectivamente), lo que indica una fiabilidad limitada en esos aspectos.
- La licencia `health-ai-developer-foundations` impone restricciones de uso y redistribución; es necesario revisar los términos antes de cualquier uso comercial o publicación de datos derivados.
- El modelo solo está entrenado en inglés; no se garantiza un comportamiento correcto con descripciones en otros idiomas.
- La longitud de contexto está limitada a 2048 tokens en el entrenamiento, por lo que descripciones muy largas pueden truncarse o producir salidas incompletas.
- Existe riesgo de alucinación: el modelo puede inventar nombres de labware o reactivos que no aparecen en la entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yayamomt/medgemma-4b-it-sft-lora-opentrons
- Repositorio GitHub del ajuste fino: https://github.com/yahyamomtaz/Meddemma-opentrons-fine-tuning
- Modelo base (unsloth/medgemma-4b-it-bnb-4bit): https://huggingface.co/unsloth/medgemma-4b-it-bnb-4bit
- Documentación de MedGemma (Google): https://developers.google.com/health-ai-developer-foundations/medgemma
- Repositorio oficial de MedGemma en GitHub: https://github.com/google-health/medgemma
- Página de MedGemma en Google DeepMind: https://deepmind.google/models/gemma/medgemma/
- Dataset de Opentrons Protocol Library: https://github.com/Opentrons/Protocols
