# storyteller-platform/quartznet15x5-de

## Resumen

QuartzNet 15x5 German es un modelo de reconocimiento automático del habla (ASR) para alemán, entrenado originalmente por NVIDIA y redistribuido por storyteller-platform dentro de su registro de modelos del proyecto Storyteller. Se trata de una red neuronal convolucional de tipo QuartzNet con 15 bloques residuales y 5 capas convolucionales por bloque (de ahí la denominación 15x5), una arquitectura específica para ASR que prescinde de recurrencia y se apoya únicamente en convoluciones 1D con separable convolutions.

El repositorio no contiene un modelo nuevo ni un reentrenamiento: es un espejo de conversión. storyteller-platform parte del export ONNX de OpenVoiceOS (`OpenVoiceOS/stt_de_quartznet15x5_onnx`, revisión `a8b9b3e4c257`) y regenera los pesos en formato safetensors para el cargador de MLX, además de construir un nuevo grafo ONNX que integra el front-end mel completo (STFT como convolución, proyección mel, logaritmo y normalización por característica). El objetivo es que el modelo se ejecute en cualquier execution provider de onnxruntime sin necesidad de un extractor de características separado, y que pueda usarse también en Apple Silicon vía MLX.

Es relevante para desarrolladores que necesiten un ASR alemán ligero, con licencia permisiva (CC-BY-4.0) y desplegable en entornos sin GPU dedicada, así como para quienes trabajen con el ecosistema Storyteller o con pipelines de audio en MLX. El tamaño del repositorio es de 0,2 GB, coherente con un modelo convolucional de tamaño moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con separable convolutions, 15 bloques x 5 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa ventanas de audio; no aplica contexto de texto) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (ONNX, solo encoder), safetensors para MLX |
| Idiomas soportados | Alemán (de) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX (`model.onnx`, `model_fp16.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es QuartzNet 15x5, una red convolucional 1D para ASR propuesta por NVIDIA. Consta de 15 bloques residuales, cada uno con 5 capas convolucionales, que emplean separable convolutions (depthwise + pointwise) para reducir el número de parámetros frente a convoluciones estándar. No utiliza recurrencia ni mecanismos de atención, lo que facilita su exportación a ONNX y su ejecución en CPU. El front-end es un extractor de características mel estándar de NeMo, que en este repositorio se ha integrado dentro del grafo ONNX: la STFT se implementa como convolución, seguida de la proyección mel, el logaritmo y la normalización por característica.

El entrenamiento original fue realizado por NVIDIA sobre datos de habla alemana y publicado en el catálogo NGC como `nvidia/stt_de_quartznet15x5`, con licencia CC-BY-4.0. No se dispone en la información proporcionada de detalles sobre el número de horas de audio, la composición del dataset ni si se aplicaron técnicas de aumento de datos o decodificación con modelo de lenguaje externo. La conversión llevada a cabo por storyteller-platform no modifica los pesos del encoder: únicamente reorganiza el layout para MLX, añade el filterbank mel y la ventana del front-end NeMo al safetensors, y reconstruye un grafo ONNX nuevo con `export-onnx.py`. Los scripts de conversión (`convert.py` y `export-onnx.py`) están disponibles en el repositorio GitLab del proyecto.

## Capacidades

- Reconocimiento automático del habla en alemán a partir de audio de entrada.
- Salida de transcripciones a nivel de carácter o token, según el vocabulario incluido en `vocab.txt`.
- Ejecución en onnxruntime con cualquier execution provider (CPU, CUDA, CoreML, etc.) gracias a la integración del front-end mel en el grafo.
- Ejecución en Apple Silicon mediante MLX, usando el layout de pesos safetensors incluido.
- Inferencia en FP16 del encoder para reducir uso de memoria y latencia en hardware compatible.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto libre: es un modelo puramente acústico.
- No dispone de capacidades multimodales (visión, audio además del ASR, etc.).
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Transcripción de reuniones y notas de voz en alemán: el modelo convierte audio mono en texto ejecutándose en CPU, lo que permite desplegarlo en servidores sin GPU para procesar grabaciones por lotes.
- Subtitulado automático de vídeo en alemán: al ser un modelo convolucional ligero, puede integrarse en pipelines de transcodificación y generar pistas de subtítulos con baja latencia por segmento.
- Asistentes de voz embebidos en dispositivos con recursos limitados: su tamaño de repositorio de 0,2 GB y la variante ONNX FP16 permiten ejecución en hardware de borde o en Apple Silicon vía MLX.
- Indexación y búsqueda de contenido audiovisual en alemán: la transcripción generada puede alimentar motores de búsqueda o sistemas de recuperación de información sobre archivos de audio y vídeo.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real de conversaciones o contenido multimedia en alemán.
- Integración en el ecosistema Storyteller: el modelo se instala a través de `ghost-story` y se usa como motor ASR por defecto para contenido en alemán dentro de esa plataforma.
- Prototipado rápido de aplicaciones de voz en alemán: al estar disponible en ONNX con front-end integrado, se puede cargar con onnxruntime sin dependencias adicionales de extracción de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser un modelo convolucional de tamaño moderado (repo de 0,2 GB), la inferencia en FP32 requiere aproximadamente menos de 1 GB de memoria, y en FP16 aún menos. Cifra orientativa, no confirmada en la información proporcionada.
- GPU recomendadas: no disponible. El modelo está pensado para ejecutarse en CPU mediante onnxruntime; en GPU, cualquier tarjeta compatible con onnxruntime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, pero no se especifican requisitos mínimos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con al menos 1-2 GB de VRAM libre, aunque no se confirma en la documentación.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX en Apple Silicon. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuartzNet 15x5 German (este) | CNN 1D QuartzNet 15x5 | no disponible | no aplica | CC-BY-4.0 | Hugging Face, GitLab |
| NVIDIA stt_de_quartznet15x5 | CNN 1D QuartzNet 15x5 | no disponible | no aplica | CC-BY-4.0 | NGC |
| OpenVoiceOS stt_de_quartznet15x5_onnx | CNN 1D QuartzNet 15x5 (ONNX) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de parámetros exactos para establecer una comparación cuantitativa con alternativas como wav2vec 2.0 o Whisper en alemán; la comparación se limita a la procedencia y formato de distribución.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en alemán; no soporta otros idiomas.
- Al ser un modelo acústico convolucional sin modelo de lenguaje externo, la salida puede contener errores ortográficos o de puntuación; no se documenta el uso de decodificación con LM.
- Riesgo de alucinación o transcripciones incorrectas en audio con ruido, acentos marcados o solapamiento de hablantes; no se han publicado métricas de WER en la información disponible.
- No se dispone de información sobre sesgos demográficos o acústicos del dataset de entrenamiento original.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar a NVIDIA como autor original y respetar los términos de la licencia.
- El repositorio es un espejo de conversión: la responsabilidad sobre los pesos originales recae en NVIDIA y en el export de OpenVoiceOS.
- No se garantiza compatibilidad futura con versiones de onnxruntime o MLX distintas de las usadas en la conversión.
- El modelo no genera texto libre ni admite instrucciones; su uso está limitado a transcripción de audio.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-de
- Repositorio GitLab del modelo: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-de
- Scripts de conversión: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Modelo original NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_de_quartznet15x5
- Export ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_de_quartznet15x5_onnx
