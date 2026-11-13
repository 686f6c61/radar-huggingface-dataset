# storyteller-platform/quartznet15x5-kk

## Resumen

QuartzNet 15x5 Kazakh es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura QuartzNet 15x5, una red neuronal convolucional de tipo 1D con bloques residuales y separable convolutions, diseñada originalmente por NVIDIA para NeMo. Este repositorio concreto, publicado por storyteller-platform, no entrena el modelo desde cero, sino que redistribuye una conversión del modelo original de reconocimiento de voz en kazajo entrenado por transiteration, adaptándolo a los formatos ONNX y MLX para su uso en la plataforma Storyteller.

El modelo resuelve la transcripción de audio a texto en kazajo, un idioma de bajos recursos para el que existen pocos modelos ASR abiertos. Su relevancia radica en que ofrece una alternativa ligera y con licencia permisiva (CC-BY-4.0) para integrar ASR en kazajo dentro de aplicaciones de lectura, subtitulado o asistentes de voz, sin depender de servicios propietarios. El repositorio ocupa 0,2 GB, lo que refleja un modelo compacto orientado a inferencia eficiente en CPU y GPU.

La ficha se basa únicamente en la información disponible en la model card y en los metadatos de Hugging Face; los detalles sobre datos de entrenamiento, benchmarks y arquitectura interna no están publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con bloques residuales y separable convolutions) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | FP32 (model.onnx) y FP16 (model_fp16.onnx) |
| Idiomas soportados | kazajo (kk) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX (FP32 y FP16), vocab.txt, config.json |

## Arquitectura y entrenamiento

QuartzNet 15x5 es una red neuronal convolucional de una dimensión compuesta por 15 bloques residuales con 5 sub-bloques cada uno, usando separable convolutions para reducir el coste computacional frente a convoluciones estándar. El modelo incluye en su grafo ONNX el front end completo de NeMo: pre-énfasis, reflect padding, STFT implementada como convolución, proyección mel, logaritmo y normalización por característica, de modo que acepta la señal de audio pre-procesada directamente sin extractor de características externo.

El entrenamiento original fue realizado por transiteration sobre el modelo `stt_kz_quartznet15x5`, y la conversión a ONNX y MLX la realiza storyteller-platform mediante los scripts `convert.py` y `export-onnx.py`. No se dispone de información sobre el número de tokens de audio, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o ajuste fino. La versión FP16 mantiene el front end en precisión simple y el encoder en media precisión.

## Capacidades

- Transcripción de voz a texto en kazajo.
- Ejecución en ONNX Runtime con cualquier execution provider (CPU, CUDA, etc.) sin extractor de features separado.
- Ejecución en MLX (Apple Silicon) mediante el formato safetensors.
- Inferencia en FP32 y FP16 para reducir requisitos de memoria.
- Modelo compacto (0,2 GB) adecuado para despliegue en entornos con recursos limitados.
- No soporta tool calling, agentes, visión ni audio más allá de ASR.
- No se documentan capacidades multilingües más allá del kazajo.

## Casos de uso

- Subtitulado automático de contenido en kazajo: el modelo transcribe audio a texto para generar subtítulos en vídeos o pódcasts, aprovechando su tamaño reducido para procesar lotes en CPU.
- Lectura asistida y accesibilidad: integración en aplicaciones que convierten voz en texto para personas con discapacidad auditiva en kazajo, usando el formato ONNX con onnxruntime en dispositivos de gama baja.
- Asistentes de voz locales: despliegue en Apple Silicon mediante MLX para transcripción en tiempo real sin conexión a servicios en la nube, gracias al formato safetensors optimizado.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones en kazajo para permitir búsqueda textual sobre el contenido hablado.
- Análisis de llamadas o reuniones: generación de transcripciones para actas y resúmenes en kazajo, con la ventaja de una licencia CC-BY-4.0 que permite uso comercial con atribución.
- Investigación en ASR de bajos recursos: uso como línea base o componente en pipelines de investigación sobre reconocimiento de voz en kazajo, al ser uno de los pocos modelos abiertos disponibles para ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,2 GB, por lo que la inferencia en FP16 requiere previsiblemente menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime o MLX; no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (cualquier execution provider), MLX en Apple Silicon, y potencialmente integración con NeMo para el modelo original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| QuartzNet 15x5 Kazakh (este) | QuartzNet 15x5 | kazajo | CC-BY-4.0 | ONNX, safetensors (MLX) | Conversión de transiteration, 0,2 GB |
| transiteration/stt_kz_quartznet15x5 | QuartzNet 15x5 | kazajo | CC-BY-4.0 | no disponible | Modelo original del que deriva |
| OpenVoiceOS/transiteration-stt_kz_quartznet15x5_onnx | QuartzNet 15x5 | kazajo | no disponible | ONNX | Exportación ONNX de referencia |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe (incluye kazajo) | MIT | múltiples | Modelo mucho mayor, no comparable en tamaño |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta kazajo; no se documentan otros idiomas.
- No se han publicado métricas de precisión (WER/CER) ni benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige citar al autor original (transiteration) y respetar los términos.
- El modelo se distribuye como conversión de terceros; no hay garantía de que la conversión ONNX/MLX sea fiel al modelo original más allá de lo indicado en la model card.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en un corpus limitado de kazajo, puede presentar sesgos dialectales o de dominio.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-kk
- Modelo original: https://huggingface.co/transiteration/stt_kz_quartznet15x5
- Exportación ONNX de referencia: https://huggingface.co/OpenVoiceOS/transiteration-stt_kz_quartznet15x5_onnx
- Repositorio GitLab de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-kk
- Scripts de conversión: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
