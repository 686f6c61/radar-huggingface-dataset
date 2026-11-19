# UEC-InabaLab/CounselTrajLM

## Resumen

CounselTrajLM es un modelo de lenguaje especializado en la generación de respuestas de consejero psicológico en chino, desarrollado por el laboratorio UEC-InabaLab. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-9B mediante QLoRA, cuyo propósito es generar la siguiente respuesta de un consejero a partir del historial de un diálogo terapéutico. El modelo se emplea como componente conversacional en los experimentos de nivel de respuesta y de diálogo del proyecto CounselTraj.

La relevancia del modelo radica en su especialización vertical: en lugar de un LLM generalista, ofrece un sistema entrenado específicamente sobre CounselTrajD, un corpus de 10.964 diálogos sintéticos de consejería en chino expandidos a partir de SmileChat, PsyDTCorpus y CPsyCounD. El checkpoint liberado es el modelo completo fusionado en BF16 (no un adaptador LoRA), lo que simplifica su despliegue con Transformers sin necesidad de PEFT ni de descargar por separado el modelo base.

Con 8.953.803.264 parámetros (~8,95 mil millones) y una ventana de entrenamiento de 2.048 tokens, el modelo se posiciona en la gama media de LLMs densos, orientado a un dominio acotado y a un único idioma (chino). Su licencia Apache-2.0 facilita su uso comercial, aunque las condiciones de los datos de entrenamiento exigen revisar los avisos de terceros del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (componente de texto de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (longitud máxima de secuencia de entrenamiento); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Pesos liberados en BF16; cuantización posterior (NF4, GGUF, etc.) no documentada en la información disponible |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, modelo completo fusionado) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 8,95 mil millones de parámetros, construido sobre el componente de lenguaje de texto de Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). El ajuste se realizó mediante QLoRA con cuantización NF4, doble cuantización y cómputo en bfloat16, con rango de adaptador 32, alpha 64 y dropout 0,05, aplicado sobre los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El adaptador resultante tiene 58.195.968 parámetros y se fusionó con el modelo base sin cuantizar para producir el checkpoint final en BF16.

El entrenamiento empleó 425.679 ejemplos de entrenamiento y 47.528 de validación (partición disjunta por diálogo, 90/10), durante 3 épocas, con 79.815 pasos de optimizador, learning rate de 0,0002, warmup ratio 0,06, schedule coseno, optimizador paged_adamw_8bit, batch por dispositivo 2 sin acumulación de gradientes, longitud máxima de secuencia de 2.048 tokens y longitud máxima de historial de los últimos 1.800 caracteres. La pérdida final de validación registrada fue de 1,5481888056. El registro del entrenador no incluye selección de checkpoint por mejor validación; se libera el adaptador final tras tres épocas, con SHA256 verificado contra el adaptador fuente y el publicado previamente. Los datos proceden de CounselTrajD (10.964 diálogos sintéticos de consejería en chino) y de las fuentes SmileChat, PsyDTCorpus y CPsyCounD.

## Capacidades

- Generación de la siguiente respuesta de consejero a partir de un historial de diálogo de consejería en chino.
- Conversación multi-turno con formato de historial `client:` / consejero.
- Generación de texto en chino con `enable_thinking=False` según el script de inferencia incluido.
- Integración directa con Transformers mediante un script de inferencia (`generate_reply.py`) que acepta historiales por línea de comandos o archivos JSONL.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al chino según la metadata del modelo.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Generación de respuestas de consejero en sistemas de apoyo psicológico en chino: el modelo recibe el historial del cliente y produce la siguiente intervención del consejero, adecuado por su entrenamiento específico sobre diálogos terapéuticos y su formato de prompt fijado.
- Investigación en evaluación de diálogos de consejería: sirve como modelo de referencia en los experimentos de nivel de respuesta (PsyDial-D101) y de nivel de diálogo (PsychEval) del proyecto CounselTraj, permitiendo reproducir comparativas.
- Simulación de clientes o consejeros en pipelines de generación de datos sintéticos: combinado con el modelo CounselTraj (que planifica trayectorias de actos de diálogo), puede generar corpus terapéuticos a escala.
- Asistente de formación para profesionales: desplegado en un entorno controlado, puede generar borradores de respuesta que el terapeuta revisa, aprovechando su especialización en el dominio y su contexto de hasta 2.048 tokens.
- Prototipado de aplicaciones de salud mental en chino: al liberarse como modelo completo en BF16 con licencia Apache-2.0, permite iterar rápidamente sobre integraciones con Transformers sin gestionar adaptadores.
- Evaluación comparativa de ajustes finos en dominios clínicos: su checkpoint fusionado y su registro de entrenamiento detallado lo hacen útil como línea base reproducible para estudiar el efecto de QLoRA en tareas de consejería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evaluaciones a nivel de respuesta (PsyDial-D101) y a nivel de diálogo (PsychEval), pero no incluye cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 17,9 GB, por lo que se requiere una GPU con al menos ~20 GB de VRAM para cargar el modelo, más memoria adicional para la caché de generación.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; GPUs con 24 GB pueden ser ajustadas según la longitud de secuencia y la caché.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) en BF16 con margen limitado; en GPUs de 16 GB requeriría cuantización, no documentada en la información disponible.
- Opciones de despliegue: Transformers con el script incluido (`generate_reply.py`); vLLM, llama.cpp, Ollama o TGI no están documentados en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| CounselTrajLM | ~8,95 B | 2.048 tokens (entrenamiento) | Chino | Apache-2.0 | Ajuste fino QLoRA de Qwen3.5-9B para consejería |
| Qwen/Qwen3.5-9B | ~9 B (según base) | No disponible | Multilingüe | No disponible | Modelo base generalista; contexto y licencia no confirmados en la información proporcionada |
| CounselTraj | No disponible | No disponible | Chino | No disponible | Modelo del mismo proyecto que planifica trayectorias de actos de diálogo; no es un generador de respuestas |

No se dispone de datos de benchmarks ni de otros modelos comparables de consejería en chino en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en chino; su uso en otros idiomas no está respaldado por la información disponible.
- La longitud de contexto de entrenamiento es de 2.048 tokens y el historial se trunca a los últimos 1.800 caracteres, lo que limita conversaciones muy largas.
- Riesgo de alucinación inherente a los LLM; en un dominio clínico, las respuestas generadas no deben presentarse como consejo profesional sin supervisión humana.
- Sesgos potenciales derivados de los datos sintéticos de CounselTrajD y de las fuentes SmileChat, PsyDTCorpus y CPsyCounD; no se documentan análisis de sesgo en la información proporcionada.
- Aunque la licencia del modelo es Apache-2.0, los términos específicos de los datos de origen exigen consultar LICENSING.md y THIRD_PARTY_NOTICES.md del proyecto antes de un uso comercial.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento explícito; el script de inferencia usa `enable_thinking=False`.
- El registro del entrenador no incluye selección del mejor checkpoint por validación, por lo que el checkpoint liberado es el final tras tres épocas y no necesariamente el óptimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UEC-InabaLab/CounselTrajLM
- Modelo CounselTraj (planificación de trayectorias): https://huggingface.co/UEC-InabaLab/CounselTraj
- Repositorio del proyecto: https://github.com/UEC-InabaLab/CounselTraj
- Documentación de evaluación: https://github.com/UEC-InabaLab/CounselTraj/tree/master/evaluation
- Ámbito de licencia: https://github.com/UEC-InabaLab/CounselTraj/blob/master/LICENSING.md
- Avisos de terceros: https://github.com/UEC-InabaLab/CounselTraj/blob/master/THIRD_PARTY_NOTICES.md
- Paper principal: https://arxiv.org/abs/2611.24168
- Paper PsychEval: https://arxiv.org/abs/2601.01802
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- SMILE (SmileChat): https://aclanthology.org/2024.findings-emnlp.34/
- PsyDT (PsyDTCorpus): https://aclanthology.org/2025.acl-long.55/
- CPsyCoun (CPsyCounD): https://aclanthology.org/2024.findings-acl.830/
- PsyDial (PsyDial-D101): https://aclanthology.org/2025.acl-long.1049/
