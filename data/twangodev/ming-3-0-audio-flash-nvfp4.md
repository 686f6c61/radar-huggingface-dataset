# twangodev/Ming-3.0-audio-flash-NVFP4

## Resumen

Ming-3.0-audio-flash-NVFP4 es una cuantización comunitaria del modelo inclusionAI/Ming-3.0-audio-flash, publicada por el usuario twangodev y preparada con NVIDIA Model Optimizer. El modelo base es un sistema multimodal de audio y texto desarrollado por InclusionAI, orientado a reconocimiento automático del habla, comprensión auditiva, razonamiento sobre audio y conversación por voz en inglés y chino. Esta variante reduce los pesos del modelo original a formato NVFP4 (4 bits en coma flotante, con escalado por bloque), pensado para aprovechar las unidades tensoriales de las GPU NVIDIA Blackwell.

La arquitectura del modelo base es un Mixture-of-Experts con 126 000 millones de parámetros totales y 6 500 millones de parámetros activos por paso de inferencia, según declara el autor de la cuantización. Esta release cuantiza los expertos enrutados del componente "Thinker" del MoE, mientras que los componentes de audio, el Talker y el AudioVAE se mantienen en el modelo original. El resultado es un repositorio de 85,8 GB con 67 783 032 800 parámetros almacenados en safetensors, junto con artefactos ONNX.

Su relevancia actual radica en la combinación de tres factores: un modelo de audio de gran escala con capacidades de razonamiento, una licencia MIT permisiva y una cuantización de 4 bits específica para hardware Blackwell, que reduce de forma sustancial los requisitos de memoria frente al modelo en precisión completa. La model card marca `inference: false`, lo que indica que el autor no garantiza que el repositorio funcione directamente en el pipeline estándar de Transformers sin configuración adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (bailing_moe_v3_audio) con componentes de audio, Talker y AudioVAE; cuantización NVFP4 sobre los expertos enrutados del Thinker |
| Parametros totales | 126 000 millones (modelo base); 67 783 032 800 parámetros almacenados en safetensors en este repositorio |
| Parametros activos | 6 500 millones por paso de inferencia (dato del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante), 8 bits en algunos componentes; el resto del modelo en precisión original |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX; librería Model Optimizer con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura Mixture-of-Experts denominada `bailing_moe_v3_audio`, que combina un componente de razonamiento (Thinker) con un generador de habla (Talker) y un codificador/decodificador de audio (AudioVAE). El Thinker es la parte cuantizada en esta release: sus expertos enrutados se almacenan en NVFP4 con escalado por bloque, técnica que reduce el ancho de bits manteniendo una precisión razonable en las activaciones. Los parámetros totales del modelo base son 126 000 millones, con 6 500 millones activos por token, lo que sitúa el coste computacional por paso en el rango de un modelo denso de tamaño medio-grande.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base, ya que la información proporcionada no incluye esos datos. La cuantización se realizó con NVIDIA Model Optimizer, la herramienta oficial de NVIDIA para compresión y cuantización de modelos, y está optimizada para las GPU Blackwell, que incorporan soporte nativo para NVFP4 en sus unidades tensoriales. El repositorio incluye también artefactos ONNX, lo que sugiere la posibilidad de despliegue en entornos con ONNX Runtime además del stack de PyTorch.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y chino, con evaluación sobre FLEURS.
- Comprensión auditiva: responder preguntas sobre el contenido de un audio.
- Razonamiento sobre audio: tareas de opción múltiple que requieren inferencia sobre información acústica (MMAR, MMAU, MMSU).
- Conversación por voz: el componente Talker permite generar respuestas habladas, no solo texto.
- Procesamiento conjunto de audio e instrucciones de texto (pipeline `audio-text-to-text`).
- Capacidades multilingües limitadas a inglés y chino.
- Cuantización de 4 bits con soporte para hardware NVIDIA Blackwell.
- No se ha confirmado en la información disponible el soporte de tool calling, function calling ni modos de agente multi-paso.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar audio de entrada y generar transcripciones en inglés o chino, con un WER de 2,92 % en FLEURS English, adecuado para documentación interna y subtitulado.
- Asistentes de voz para atención al cliente: la combinación de ASR, comprensión y Talker permite construir un agente conversacional que escucha, razona y responde con voz en inglés o chino, sin necesidad de encadenar modelos separados.
- Análisis de llamadas y control de calidad: clasificación y extracción de información de grabaciones (motivos de llamada, sentimiento, cumplimiento de guiones) usando las capacidades de comprensión auditiva y razonamiento.
- Accesibilidad: generación de subtítulos y descripciones de contenido sonoro para personas con discapacidad auditiva, aprovechando el ASR y la comprensión de audio.
- Búsqueda y recuperación sobre archivos de audio: indexación semántica de podcasts, clases o entrevistas mediante transcripción y resumen automático.
- Evaluación de contenido multimedia en plataformas: detección de contenido sensible o verificación de que un audio coincide con el texto declarado, usando el razonamiento sobre audio.
- Despliegue en infraestructura Blackwell: al estar cuantizado en NVFP4, es adecuado para servir el modelo en GPU de la generación Blackwell con menor huella de memoria que la versión completa, útil en entornos con restricciones de VRAM.

## Benchmarks y rendimiento

Resultados declarados por el autor de la cuantización; no verificados de forma independiente (`verified: false`).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| ASR | FLEURS English (test, 647 ejemplos) | WER | 2,92 % |
| ASR | FLEURS Chinese (test, 945 ejemplos) | CER | 3,45 % |
| Comprensión de audio (opción múltiple) | MMAR (1000 ejemplos) | Accuracy | 69,5 % |
| Comprensión de audio (opción múltiple) | MMAU test-mini (1000 ejemplos) | Accuracy | 78,2 % |
| Comprensión de audio (opción múltiple) | MMSU (5000 ejemplos, split train) | Accuracy | 77,8 % |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros modelos de audio, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 85,8 GB en disco; en inferencia, los pesos NVFP4 más los componentes en precisión original (audio, Talker, AudioVAE) requieren del orden de 80-90 GB de memoria, aunque no se dispone de una cifra oficial.
- GPU recomendadas: NVIDIA Blackwell (B100, B200, GB200) por el soporte nativo de NVFP4; en generaciones anteriores el formato puede no ser eficiente o no estar soportado.
- GPU de consumo: no cabe en GPU consumer convencionales (RTX 4090 con 24 GB) en su configuración completa; sería necesario sharding multi-GPU o una cuantización adicional más agresiva.
- Opciones de despliegue: el repositorio usa la librería Model Optimizer con `custom_code`, por lo que no es un checkpoint estándar de Transformers. Se incluyen artefactos ONNX, lo que abre la vía a ONNX Runtime; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ming-3.0-audio-flash-NVFP4 | 126B totales / 6,5B activos (base) | no disponible | MIT | safetensors, ONNX, NVFP4 | Hugging Face |
| Ming-3.0-audio-flash (base) | 126B totales / 6,5B activos | no disponible | MIT | safetensors | Hugging Face |
| Alternativas de audio-LLM de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (audio-LLM con razonamiento y salida de voz), por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Los benchmarks son declarados por el autor de la cuantización, con protocolo de evaluación local y `verified: false`; no han sido validados de forma independiente.
- La model card indica `inference: false`: el repositorio puede no funcionar directamente con el pipeline estándar de Transformers sin configuración adicional de código personalizado.
- La cuantización NVFP4 está optimizada para Blackwell; en otras GPU el rendimiento puede degradarse o el formato no ser compatible.
- Riesgo de alucinación inherente a los modelos de lenguaje y a la generación de respuestas sobre audio; conviene validar transcripciones y respuestas en entornos críticos.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre su comportamiento en dominios especializados (médico, legal, financiero).
- Aunque la licencia es MIT, el uso comercial debe verificar también las condiciones del modelo base y de los datasets de evaluación empleados.
- El tamaño del repositorio (85,8 GB) y la necesidad de hardware Blackwell limitan su despliegue en entornos convencionales.

## Enlaces

- Hugging Face del modelo cuantizado: https://huggingface.co/twangodev/Ming-3.0-audio-flash-NVFP4
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-audio-flash
- Repositorio GitHub de la cuantización: https://github.com/twangodev/ming3-nvfp4
- Proyecto Ming en GitHub: https://github.com/inclusionAI/Ming-3.0-audio-flash
- Resultados de evaluación: https://huggingface.co/twangodev/Ming-3.0-audio-flash-NVFP4/blob/main/evals/README.md
- Metodología de evaluación: https://huggingface.co/twangodev/Ming-3.0-audio-flash-NVFP4/blob/main/evals/full-suite/methods.md
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia: https://huggingface.co/twangodev/Ming-3.0-audio-flash-NVFP4/blob/main/LICENSE
