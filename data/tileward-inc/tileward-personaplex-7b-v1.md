# Tileward-Inc/Tileward-personaplex-7b-v1

## Resumen

Tileward-personaplex-7b-v1 es una versión comprimida y cuantizada del modelo de voz PersonaPlex 7B de NVIDIA, desarrollada por Tileward Inc. El modelo base es un sistema de audio a audio (speech-to-speech) capaz de escuchar y hablar de forma simultánea, es decir, con capacidad de interacción conversacional en tiempo real. Tileward ha aplicado su propia técnica de compresión para reducir el tamaño del archivo de pesos un 62% respecto al original (de 16,7 GB a 6,3 GB), manteniendo una tasa de coincidencia del 96% en la predicción del siguiente token respecto al modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una propuesta de compresión orientada a reducir el coste computacional de un modelo de voz de 7B parámetros; por otro, advierte de una limitación crítica de disponibilidad: los pesos no están publicados en Hugging Face y solo se distribuyen bajo petición mediante una reunión con un ingeniero de Tileward. Esto condiciona por completo su evaluación y uso práctico.

No se dispone de información sobre arquitectura interna, composición del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks estándar en la información proporcionada. La model card se limita a métricas de compresión (tamaño de archivo, tiempo de cómputo por trama de 80 ms y acuerdo con el modelo original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: PersonaPlex 7B de NVIDIA, audio-to-audio) |
| Parametros totales | 7B (según nombre y modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | compresión propietaria de Tileward (archivo de 6,3 GB frente a 16,7 GB del original); se compara con una conversión estándar a 8 bits (8,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | no disponible (los pesos no se publican; el modelo original usa `model.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo base, nvidia/personaplex-7b-v1, se describe como un modelo de voz que "escucha y habla al mismo tiempo", lo que sugiere una arquitectura de procesamiento de audio en streaming con capacidad full-duplex. El pipeline declarado es audio-to-audio.

Tileward no documenta el proceso de entrenamiento del modelo base ni el suyo propio. La única información técnica disponible se refiere al proceso de compresión: el modelo resultante ocupa 6,3 GB frente a los 16,7 GB del original y los 8,2 GB de una conversión estándar a 8 bits. En términos de cómputo por trama de 80 ms medida en un MacBook Pro M4 Max con Apple MLX, el modelo original tarda entre 37 y 42 ms, la conversión a 8 bits 23 ms y la versión de Tileward 20 ms. La tasa de coincidencia con el siguiente token del original es del 98,1% para la conversión a 8 bits y del 96% para la versión de Tileward. No se especifica qué técnica de cuantización o destilación se ha aplicado, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de audio a audio: el modelo recibe audio y produce audio, con capacidad de escuchar y hablar simultáneamente según la descripción del modelo base.
- Conversación de voz en tiempo real: el procesamiento por tramas de 80 ms y los tiempos de cómputo de 20 ms por trama en M4 Max indican viabilidad para interacción de baja latencia.
- Compresión eficiente: el archivo de 6,3 GB reduce los requisitos de almacenamiento y memoria frente al original de 16,7 GB.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, matemáticas ni código.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede gestionar diálogo hablado full-duplex con latencia de 20 ms por trama de 80 ms en hardware Apple Silicon, adecuado para interfaces de voz interactivas.
- Atención al cliente telefónica automatizada: la naturaleza audio-to-audio permite sustituir pipelines separados de ASR + LLM + TTS por un único modelo, simplificando la arquitectura y reduciendo la latencia acumulada.
- Sistemas de voz embebidos en dispositivos: el archivo de 6,3 GB y los 20 ms de cómputo por trama en un MacBook Pro M4 Max sugieren viabilidad en estaciones de trabajo y portátiles de gama alta, no necesariamente en móviles.
- Prototipado de agentes de voz: para equipos que ya trabajan con el modelo PersonaPlex de NVIDIA, esta versión reduce el coste de almacenamiento y el tiempo de carga en un 62%.
- Investigación en compresión de modelos de audio: el modelo sirve como referencia de comparación entre cuantización estándar a 8 bits (98,1% de acuerdo, 23 ms/trama) y la técnica propietaria de Tileward (96% de acuerdo, 20 ms/trama).
- Evaluación de la licencia NVIDIA Open Model License en despliegues comerciales de voz: el modelo hereda la licencia del base, por lo que puede estudiarse como caso de cumplimiento en productos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo proporciona métricas de compresión y eficiencia:

| Métrica | PersonaPlex 7B original | Conversión estándar 8 bits | Tileward PersonaPlex 7B |
|---|---|---|---|
| Tamaño del archivo | 16,7 GB | 8,2 GB | 6,3 GB |
| Cómputo por trama de 80 ms (M4 Max, MLX) | 37-42 ms | 23 ms | 20 ms |
| Coincidencia con el siguiente token del original | – | 98,1% | 96% |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el archivo de pesos es de 6,3 GB, por lo que la inferencia requiere al menos esa cantidad de memoria más overhead de activaciones y buffers de audio.
- GPU recomendadas: no se especifican. Las mediciones de la model card se realizaron en un MacBook Pro M4 Max con Apple MLX, no en GPU NVIDIA.
- Cabe en GPU de consumo: probablemente sí en GPUs con 8-12 GB de VRAM o más, dado el tamaño de 6,3 GB, aunque no se confirma en la documentación.
- Opciones de despliegue: Apple MLX (única plataforma documentada en las mediciones). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 20 ms de cómputo por trama de 80 ms en M4 Max con MLX, lo que corresponde a un factor de tiempo real de aproximadamente 0,25 (4 veces más rápido que tiempo real) en ese hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tileward-personaplex-7b-v1 | 7B | no disponible | NVIDIA Open Model License | Solo bajo petición (reunión con ingeniero) | 6,3 GB, 20 ms/trama, 96% de acuerdo |
| nvidia/personaplex-7b-v1 | 7B | no disponible | NVIDIA Open Model License | Pesos publicados en Hugging Face | 16,7 GB, 37-42 ms/trama |
| Conversión estándar a 8 bits de PersonaPlex 7B | 7B | no disponible | NVIDIA Open Model License | Depende del conversor | 8,2 GB, 23 ms/trama, 98,1% de acuerdo |

No se dispone de información sobre otros modelos comparables de audio a audio en la documentación proporcionada.

## Limitaciones y advertencias

- Los pesos no están publicados: el modelo solo está disponible bajo petición mediante una reunión con un ingeniero de Tileward. Esto impide su descarga, auditoría y evaluación directa.
- La licencia es la NVIDIA Open Model License, que impone condiciones específicas para uso comercial; es necesario revisar sus términos antes de cualquier despliegue en producción.
- La tasa de coincidencia del 96% con el modelo original implica que un 4% de las predicciones del siguiente token difieren, lo que puede acumularse en conversaciones largas y afectar a la coherencia.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base ni de la versión comprimida.
- No se especifica la técnica de compresión, lo que dificulta evaluar su robustez fuera de las condiciones de prueba reportadas (conversaciones del propio modelo original).
- Las mediciones de rendimiento se limitan a un MacBook Pro M4 Max con Apple MLX; no hay datos para GPU NVIDIA, AMD ni otras plataformas.
- No se dispone de información sobre el contexto máximo, los idiomas soportados ni el formato exacto de los pesos.

## Enlaces

- [Tileward-Inc/Tileward-personaplex-7b-v1 en Hugging Face](https://huggingface.co/Tileward-Inc/Tileward-personaplex-7b-v1)
- [nvidia/personaplex-7b-v1 en Hugging Face](https://huggingface.co/nvidia/personaplex-7b-v1)
- [NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/)
- [Artículo de investigación: We shrank PersonaPlex by 62% to run at 20ms a frame](https://tileward.com/research/a-smaller-voice-model/)
- [Investigación de Tileward](https://tileward.com/research/)
- [Sitio web de Tileward](https://tileward.com)
- [Reserva de reunión con un ingeniero de Tileward](https://calendar.app.google/hg2DzFTxKJgwFWm19)
