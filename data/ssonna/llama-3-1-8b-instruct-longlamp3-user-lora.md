# ssonna/Llama-3.1-8B-Instruct-LongLaMP3-user-LoRA

## Resumen
Este repositorio contiene 1822 adaptadores LoRA (Low-Rank Adaptation) para el modelo base meta-llama/Llama-3.1-8B-Instruct, uno por cada usuario del conjunto de test de LongLaMP-3, una tarea de generación de reseñas de productos. Cada adaptador se ha entrenado mediante ajuste supervisado utilizando únicamente el historial de perfil de ese usuario concreto, con el modelo base congelado. El objetivo es la personalización extrema: generar texto que imite el estilo individual de cada usuario en la escritura de reseñas.

El modelo base, Llama 3.1 8B Instruct, es un transformer decoder-only de 8.000 millones de parámetros con una ventana de contexto de 128.000 tokens, desarrollado por Meta. Los adaptadores añaden aproximadamente 131.000 parámetros cada uno (rango 8, módulos q_proj y v_proj), lo que los hace muy ligeros y adecuados para escenarios donde se requiere cambiar dinámicamente entre perfiles de usuario. La relevancia actual radica en el auge de la personalización eficiente mediante PEFT, que permite adaptar un mismo modelo a múltiples usuarios sin duplicar los pesos completos.

El repositorio ocupa 24,9 GB e incluye los pesos de los adaptadores en formato safetensors, junto con un índice que mapea cada carpeta a un identificador de usuario y a los identificadores de consulta de LongLaMP-3. La licencia es la Llama 3.1 Community License, heredada del modelo base.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 131.072 parametros por adaptador (calculado: rango 8, modulos q_proj y v_proj, hidden size 4096) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | Pesos del adaptador en float32; el modelo base admite cuantizacion (GGUF, bitsandbytes, etc.) pero no se especifica para los adaptadores |
| Idiomas soportados | no disponible (el modelo base soporta varios idiomas, pero los adaptadores estan entrenados para resenas en ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct (no incluido en el repositorio) |
| Tamano del repositorio | 24,9 GB |

## Arquitectura y entrenamiento
Cada adaptador es una LoRA de rango 8, alpha 8, dropout 0,05, aplicada a los modulos de atencion q_proj y v_proj del transformer. El entrenamiento se realizo con el optimizador AdamW, tasa de aprendizaje 0,0001, weight decay 0,01, schedule lineal con warmup ratio 0,1 y recorte de gradiente 0,3. Se utilizo una sola epoca, batch efectivo de 8 y perdida de entropia cruzada solo en la completacion (completion-only cross entropy) sin truncamiento. La precision del modelo base fue bfloat16 y los pesos del adaptador se guardaron en float32. La semilla fue 42.

El conjunto de datos empleado es el split de test basado en usuarios de LongLaMP-3 (generacion de resenas de productos). Para cada usuario, se entreno un adaptador independiente usando exclusivamente su propio historial de perfil, siguiendo el estilo de OPPU (One PEFT Per User). El modelo base permanecio congelado durante todo el proceso. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicional.

## Capacidades
- Generacion de resenas de productos personalizadas: cada adaptador produce texto que imita el estilo de un usuario concreto.
- Adaptacion individual: 1822 adaptadores, uno por usuario del conjunto de test de LongLaMP-3.
- Integracion con el modelo base Llama-3.1-8B-Instruct mediante la libreria PEFT.
- Carga dinamica: es posible cargar el adaptador correspondiente a un usuario en tiempo de inferencia.
- No se dispone de informacion sobre otras capacidades (tool calling, agentes, matematicas, codigo, vision, audio, etc.) en los adaptadores; estas podrian verse degradadas al estar especializados en una unica tarea.
- Capacidades multilingues: no especificadas; el entrenamiento se realizo sobre un corpus en ingles.

## Casos de uso
- Generacion de resenas personalizadas en plataformas de comercio electronico: cargando el adaptador del usuario, el sistema puede redactar resenas de productos en su estilo habitual, lo que aumenta la coherencia con su historial.
- Asistentes de escritura para resenas: ayudar a un usuario a redactar una resena manteniendo su tono y vocabulario, usando su adaptador especifico.
- Sistemas de recomendacion con explicaciones personalizadas: generar textos explicativos que suenen al usuario, mejorando la confianza en la recomendacion.
- Investigacion en personalizacion eficiente: estudiar como el estilo individual se captura con LoRA de bajo rango y comparar con otras tecnicas.
- Evaluacion de metodos de personalizacion: utilizar el conjunto de adaptadores como referencia en benchmarks de personalizacion sobre LongLaMP-3.
- Generacion de datos sinteticos para aumento de datos: crear resenas sinteticas en el estilo de usuarios reales para entrenar otros modelos.
- Simulacion de usuarios en estudios de opinion: generar resenas simuladas que reflejen la distribucion de estilos de una poblacion de usuarios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (como MMLU, HumanEval o GSM8K) para los adaptadores ni para la tarea de generacion de resenas.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base en bfloat16 requiere aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits, se reduce a unos 5-6 GB. Los adaptadores anaden un consumo despreciable (unos pocos MB por adaptador cargado).
- GPU recomendadas: A100, H100 para bfloat16; RTX 4090, RTX 3090 (24 GB) para bfloat16; RTX 3060 (12 GB) o superiores para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion. Una RTX 3060 de 12 GB puede ejecutar el modelo base en 4 bits y cargar el adaptador correspondiente.
- Opciones de despliegue: transformers + peft (como se muestra en la model card), vLLM (soporta LoRA), TGI (soporta LoRA), llama.cpp (requiere conversion de los adaptadores a GGUF, no documentada). Ollama no soporta adaptadores PEFT de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Personalizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-LongLaMP3-user-LoRA | 131k por adaptador | 128k | Si, por usuario (1822 adaptadores) | Llama 3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | No | Llama 3.1 | HuggingFace |
| Fine-tuning completo por usuario | 8B por usuario | 128k | Si, por usuario | Llama 3.1 | Requiere entrenamiento y almacenamiento masivo |

No se conocen otros repositorios publicos de adaptadores LoRA por usuario para LongLaMP-3 con los que comparar directamente.

## Limitaciones y advertencias
- Sesgos: los adaptadores heredan los sesgos del modelo base y pueden amplificar sesgos presentes en el historial de cada usuario.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada en las resenas.
- Limitaciones de contexto: la ventana de 128.000 tokens es la del modelo base; los adaptadores no la amplian.
- Limitaciones de idioma: el entrenamiento se realizo sobre un corpus en ingles (LongLaMP-3), por lo que el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: la Llama 3.1 Community License impone condiciones para uso comercial, incluyendo la obligacion de atribucion y restricciones si se superan los 700 millones de usuarios activos mensuales. Es necesario revisar los terminos completos.
- Caveats para produccion: cada adaptador es especifico de un usuario y no generaliza a otros. Almacenar 1822 adaptadores requiere 24,9 GB y una gestion dinamica de carga. No hay evaluacion publicada del rendimiento real en la tarea, por lo que se desconoce la calidad de las resenas generadas. El modelo base no esta incluido y debe descargarse por separado.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/ssonna/Llama-3.1-8B-Instruct-LongLaMP3-user-LoRA
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Model card de Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio GitHub de Llama: https://github.com/meta-llama/llama-models
- Qualcomm AI Hub (modelo cuantizado): https://aihub.qualcomm.com/models/llama_v3_1_8b_instruct
- Lambda AI (inferencia): https://lambda.ai/inference-models/llama3.1-8b-instruct
