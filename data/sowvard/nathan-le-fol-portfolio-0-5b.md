# sowvard/nathan-le-fol-portfolio-0.5b

## Resumen

Nathan Le Fol Portfolio 0.5B es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario sowvard en Hugging Face. El modelo está entrenado sobre 471 pares pregunta-respuesta extraídos de la ficha de conocimientos del portfolio personal de Nathan Le Fol, en francés e inglés. Su propósito es servir como segundo agente conversacional del portfolio, comparado contra un agente basado en RAG sobre el mismo conjunto de preguntas de evaluación.

El modelo parte de la arquitectura Qwen2 de 0,5 mil millones de parámetros (494.032.768 parámetros reales según los pesos en safetensors), un transformer decoder-only con atención completa. El ajuste LoRA tiene rango 16 y se ejecutó durante 3 épocas. Al tratarse de un adaptador sobre un modelo base pequeño, su relevancia es fundamentalmente experimental y de nicho: demuestra un flujo de trabajo de fine-tuning ligero para asistentes de dominio muy restringido (información de un portfolio personal) y permite comparar empíricamente la calidad de un modelo ajustado frente a una solución RAG.

No se trata de un modelo de propósito general ni de un lanzamiento con benchmarks públicos. La model card es explícita sobre sus límites: es un modelo pequeño sin recuperación documental, que puede equivocarse o inventar respuestas, y precisamente ese comportamiento es lo que la comparación con RAG pretende medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-0.5B-Instruct; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA de rango 16 sobre Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con 494 millones de parámetros. El entrenamiento se realizó durante 3 épocas sobre un conjunto de 471 pares pregunta-respuesta extraídos de la ficha de conocimientos del portfolio de Nathan Le Fol, en francés e inglés. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros (learning rate, batch size, scheduler) ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La innovación metodológica destacable no está en la arquitectura, sino en el diseño experimental: las preguntas del conjunto de evaluación fueron retiradas explícitamente de los datos de entrenamiento, de modo que el modelo puede compararse de forma justa contra un agente RAG sobre el mismo banco de preguntas. El repositorio ocupa 2,0 GB, coherente con los pesos del adaptador más los artefactos del modelo base.

## Capacidades

- Generación de texto conversacional en francés e inglés sobre el dominio acotado del portfolio de Nathan Le Fol.
- Respuesta a preguntas factuales sobre la información publicada en dicho portfolio (trayectoria, proyectos, conocimientos).
- Conversación multi-turno básica, heredada de la naturaleza instruct del modelo base Qwen2.5-0.5B-Instruct.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada; podría heredarse parcialmente del modelo base, pero no está validado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está pensado como agente único de respuesta directa.
- Capacidades multilingües: limitadas a francés e inglés según los tags del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente de portfolio personal: el modelo responde preguntas de visitantes sobre la trayectoria y proyectos de Nathan Le Fol sin necesidad de infraestructura de recuperación documental, lo que simplifica el despliegue en una web estática o una función serverless.
- Comparación empírica fine-tuning vs. RAG: sirve como brazo de control en un experimento que mide si un modelo pequeño ajustado sobre un corpus cerrado supera o no a un agente RAG con el mismo corpus, usando el banco de preguntas reservado.
- Demo educativa de fine-tuning LoRA: por su tamaño (0,5B) y su licencia Apache 2.0, es un ejemplo reproducible de cómo adaptar un modelo instruct pequeño a un dominio muy concreto con recursos mínimos.
- Chatbot de soporte de alcance limitado: en escenarios donde el conocimiento cabe en unas pocas centenas de pares QA y no cambia con frecuencia, el modelo puede servir respuestas directas sin pipeline de indexación.
- Pruebas de regresión de pipelines de despliegue: útil para validar integraciones de inferencia (servidores compatibles con safetensors, cuantización, APIs) con un modelo ligero antes de pasar a modelos mayores.
- Investigación sobre alucinación en dominios cerrados: al ser un modelo sin recuperación documental, permite estudiar la tasa y el tipo de errores factuales en un corpus pequeño y controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 494 millones de parámetros, los pesos en FP16 ocupan aproximadamente 1 GB; en cuantización de 8 bits, unos 0,5 GB; en 4 bits, unos 0,25 GB (estimaciones teóricas a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU para inferencia con llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y servidores compatibles con safetensors; al ser un adaptador LoRA, requiere cargar el modelo base Qwen2.5-0.5B-Instruct junto con el adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sowvard/nathan-le-fol-portfolio-0.5b | 494 M | No disponible | Apache 2.0 | Hugging Face | Ajuste LoRA de dominio específico sobre Qwen2.5-0.5B-Instruct |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face | Modelo base; capacidades generales, sin especialización en el portfolio |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face | Alternativa de mayor tamaño de la misma familia, con más capacidad general |
| Llama 3.2 1B Instruct | 1,2 B | No disponible en la informacion proporcionada | Licencia comunitaria Llama | Hugging Face | Alternativa de tamaño similar para ajuste de dominio, con licencia más restrictiva |

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo cubre la información publicada en el portfolio de Nathan Le Fol; fuera de ese ámbito sus respuestas carecen de valor.
- Riesgo de alucinación explícitamente reconocido por el autor: al no disponer de recuperación documental, puede inventar datos o equivocarse, y ese comportamiento forma parte del experimento.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen2.5-0.5B-Instruct, hereda los sesgos del modelo base y de los datos de entrenamiento originales.
- Limitaciones de contexto e idioma: solo francés e inglés; la longitud de contexto efectiva no está confirmada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen2.5-0.5B-Instruct y citarse adecuadamente.
- Caveat para producción: con 0 descargas y 0 likes, el modelo no tiene validación comunitaria; no se han publicado métricas de calidad, latencia ni evaluaciones independientes.
- Privacidad: el autor afirma que no incluye datos personales más allá de lo que el portfolio publica, pero no se detalla el proceso de anonimización.

## Enlaces

- Hugging Face: https://huggingface.co/sowvard/nathan-le-fol-portfolio-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
