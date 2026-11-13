# storyteller-platform/citrinet1024-ko

## Resumen

Citrinet 1024 Korean es un modelo de reconocimiento automático del habla (ASR) para coreano, basado en la arquitectura Citrinet de NVIDIA NeMo. El modelo original fue entrenado por ypluit sobre aproximadamente 1000 horas de audio de un centro de llamadas público (`stt_kr_citrinet1024_PublicCallCenter_1000H`), y esta ficha corresponde a un espejo publicado por storyteller-platform dentro de su registro de modelos, con conversiones a los formatos ONNX y MLX.

El repositorio no contiene un modelo nuevo ni un ajuste adicional: es una redistribución del checkpoint original convertida por los scripts `convert.py` y `export-onnx.py` del proyecto Storyteller. La versión ONNX integra el front end de mel (filtro, ventana y cálculo de longitudes) directamente delante del encoder, de modo que acepta la señal preénfasis con padding reflectivo y calcula las características internamente. La versión MLX contiene los pesos del encoder en el layout que espera el cargador de MLX, junto con el filterbank mel y la ventana del front end de NeMo.

Su relevancia es práctica: ofrece un ASR coreano especializado en dominio de call center en formatos portables (ONNX para inferencia multiplataforma, safetensors/MLX para Apple Silicon), con licencia CC-BY-4.0 que permite uso comercial con atribución. El tamaño del repositorio (1,1 GB) es coherente con un modelo Citrinet de tamaño medio con vocabulario coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (encoder convolucional con bloques residuales y squeeze-and-excitation, front end mel NeMo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio dependiente de la implementación) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX en precisión original) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional para ASR que sustituye la pila recurrente por convoluciones 1D con conexiones residuales, normalización por lotes y módulos de squeeze-and-excitation, lo que reduce la latencia y facilita el despliegue en producción. El front end es el estándar de NeMo: cálculo de espectrograma mel con ventana y filterbank incluidos en el propio export ONNX, de forma que el modelo recibe la señal preénfasis con padding reflectivo y deriva las características y sus longitudes internamente.

El entrenamiento original se realizó sobre aproximadamente 1000 horas de audio de un centro de llamadas público coreano, según el nombre del checkpoint de origen (`PublicCallCenter_1000H`). No se dispone de información sobre composición exacta del dataset, número de tokens/pasos, técnicas de aumento de datos ni si hubo ajuste con RLHF/DPO (no aplicable habitualmente en ASR). La conversión a MLX y ONNX la realiza el proyecto Storyteller; el encoder no se modifica respecto al export de OpenVoiceOS.

## Capacidades

- Reconocimiento automático del habla en coreano, orientado a audio telefónico y de call center.
- Transcripción de audio mono con front end mel integrado en el export ONNX.
- Inferencia en CPU/GPU vía ONNX Runtime y en Apple Silicon vía MLX.
- Gestión interna de longitudes de secuencia en la variante ONNX (no requiere calcular features externamente).
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni razonamiento multi-paso.
- No se documenta soporte multilingüe más allá del coreano.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo está entrenado sobre audio de call center coreano, por lo que su dominio objetivo son conversaciones telefónicas con ruido y habla espontánea; se usaría como motor ASR en un pipeline de post-procesado de grabaciones.
- Subtitulado y búsqueda en archivos de audio coreanos: al ser un modelo convolucional de baja latencia, puede procesar lotes de audio para generar transcripciones indexables.
- Análisis de calidad y compliance en centros de llamadas: transcripción previa a un motor de NLP que detecte palabras clave, tono o incumplimientos de guion.
- Asistentes de voz locales en Apple Silicon: la variante MLX permite ejecutar el encoder en un Mac sin depender de servicios en la nube.
- Despliegue en entornos con restricciones de red: el export ONNX con front end integrado simplifica la integración en aplicaciones de escritorio o embebidas que solo pueden ejecutar ONNX Runtime.
- Generación de datasets etiquetados: uso como etiquetador automático para pre-anotar audio coreano antes de una revisión humana.
- Investigación en ASR convolucional: punto de partida reproducible para comparar Citrinet frente a arquitecturas transformer en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 1,1 GB, por lo que la inferencia en FP32 requiere del orden de 1-2 GB de memoria, y menos en FP16/INT8 si se convierte.
- GPU recomendadas: no disponible. Por el tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente; también cabe en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más, aunque no hay datos oficiales de consumo.
- Opciones de despliegue: ONNX Runtime (formato `model.onnx`), MLX en Apple Silicon (formato `model.safetensors`), y el runtime de NeMo si se reutiliza el checkpoint original.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formatos |
|---|---|---|---|---|---|
| Citrinet 1024 Korean (este) | no disponible | no disponible | coreano | CC-BY-4.0 | safetensors (MLX), ONNX |
| `ypluit/stt_kr_citrinet1024_PublicCallCenter_1000H` (origen) | no disponible | no disponible | coreano | CC-BY-4.0 | NeMo/ONNX |
| `OpenVoiceOS/stt_kr_citrinet1024_PublicCallCenter_1000H_onnx` | no disponible | no disponible | coreano | no disponible | ONNX |
| Whisper (variantes multilingües) | 39M-1,55B | 30 s de audio | multilingüe | MIT | safetensors, GGUF, ONNX |

La comparación con Whisper es orientativa por categoría (ASR), no por paridad de arquitectura ni de rendimiento: no hay datos de benchmarks de este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo especializado en coreano de call center; el rendimiento fuera de ese dominio (audio limpio de estudio, otros acentos, otras lenguas) no está documentado.
- No hay métricas publicadas (WER/CER) en la información disponible, por lo que no se puede evaluar su calidad objetiva.
- Posibles sesgos derivados del corpus de entrenamiento (un único tipo de fuente: llamadas de un centro público), con riesgo de peor rendimiento en hablantes no representados.
- Riesgo de alucinación en ASR: el modelo puede generar transcripciones plausibles en tramos con ruido o silencio; conviene aplicar detección de actividad de voz y revisión humana en producción.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor original (ypluit) y respetar los términos.
- El repositorio es un espejo de terceros; la versión y el mantenimiento dependen de storyteller-platform, no del autor original.
- No se documentan cuantizaciones oficiales; cualquier conversión a INT8/FP16 corre por cuenta del usuario y puede degradar la precisión.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/citrinet1024-ko
- Modelo original: https://huggingface.co/ypluit/stt_kr_citrinet1024_PublicCallCenter_1000H
- Export ONNX de origen: https://huggingface.co/OpenVoiceOS/stt_kr_citrinet1024_PublicCallCenter_1000H_onnx
- Scripts de conversión: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet1024-ko
