# theoracleguy/MOSS-Audio-Tokenizer-v2-MLX-int8

## Resumen

MOSS-Audio-Tokenizer-v2-MLX-int8 es una cuantización en 8 bits del codec de audio MOSS-Audio-Tokenizer-v2, desarrollada por el usuario theoracleguy para su ejecución eficiente en Apple Silicon mediante la librería mlx-audio. El modelo base, creado por el equipo OpenMOSS, es un tokenizador de audio discreto unificado basado en la arquitectura Cat (Causal Audio Tokenizer with Transformer), diseñado para ofrecer reconstrucción de calidad casi sin pérdidas y alineación semántica de alto nivel, funcionando como interfaz discreta entre audio y modelos de lenguaje.

Esta versión cuantizada reduce el tamaño del modelo de aproximadamente 8,5 GB en fp32 a 2,23 GB, manteniendo una decodificación bit-idéntica a la cuantización int8 en proceso (PSNR de 99 dB). Está pensada para integrarse en sistemas de síntesis de voz locales como MOSS-TTS-Local-v1.5, permitiendo ejecutar un codec de audio de alto rendimiento en hardware de consumo de Apple sin sacrificar calidad. Su relevancia radica en facilitar el despliegue de sistemas de audio generativos en entornos locales con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cat (Causal Audio Tokenizer with Transformer) |
| Parametros totales | 599.142.016 (599 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en streaming, sin contexto textual) |
| Tipos de cuantizacion | int8, group_size 64, affine |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base MOSS-Audio-Tokenizer-v2 emplea una arquitectura Cat, que combina un codificador y decodificador basados en transformadores causales con capas convolucionales (WNConv1d). Fue entrenado en 3 millones de horas de audio diverso, optimizando conjuntamente la reconstrucción de alta fidelidad y la alineación semántica con representaciones de alto nivel. Soporta streaming y bitrates variables, lo que lo hace adecuado para aplicaciones en tiempo real.

La versión cuantizada aquí descrita aplica cuantización int8 con grupo de tamaño 64 y modo afín a las capas lineales y de atención, mientras que las proyecciones convolucionales se mantienen en precisión completa. Esta estrategia preserva la calidad de decodificación (PSNR de 99 dB respecto a la cuantización int8 en proceso) y reduce significativamente el uso de memoria. La cuantización se realiza siguiendo el patrón estándar de mlx-lm, reutilizando la función `apply_quantization` de mlx-audio.

## Capacidades

- Codec de audio discreto: convierte audio continuo en tokens discretos y viceversa, con reconstrucción de alta calidad.
- Alineación semántica: los tokens generados capturan información semántica de alto nivel, útil para tareas de comprensión y generación de audio.
- Soporte de streaming: procesa audio de forma incremental, adecuado para aplicaciones en tiempo real.
- Bitrate variable: permite ajustar la tasa de bits según las necesidades de calidad o ancho de banda.
- Frecuencia de muestreo de 48 kHz y estéreo: maneja audio de alta resolución.
- Vocoder integrado: puede sintetizar audio directamente desde representaciones latentes, útil para TTS.
- Compatible con Apple Silicon: optimizado para ejecución en chips M1/M2/M3 mediante MLX.

## Casos de uso

- Síntesis de voz local en Mac: junto con MOSS-TTS-Local-Transformer-v1.5-MLX-int8, permite generar voz natural de forma completamente local en Apple Silicon, sin depender de servicios en la nube.
- Preprocesamiento de audio para modelos de lenguaje: convierte audio en tokens discretos que pueden ser consumidos por LLMs multimodales para tareas de comprensión auditiva.
- Compresión de audio de alta calidad: al operar a 48 kHz estéreo y con bitrate variable, puede utilizarse como códec de compresión para almacenamiento o transmisión de audio con pérdidas mínimas.
- Generación de efectos de sonido y música: el tokenizador puede integrarse en pipelines generativos para crear audio sintético a partir de descripciones semánticas.
- Aplicaciones de accesibilidad: sistemas de lectura de pantalla o subtitulado automático que requieren síntesis de voz local y de baja latencia.
- Investigación en audio generativo: permite experimentar con modelos de lenguaje que operan sobre tokens de audio, gracias a su alineación semántica y reconstrucción fiel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización int8 en la información disponible. El paper original de MOSS-Audio-Tokenizer reporta un rendimiento competitivo en benchmarks de audio y música en todos los bitrates evaluados, con mejoras de calidad al aumentar la tasa de bits y la capacidad del modelo, pero no se proporcionan cifras concretas en esta ficha. Para datos cuantitativos, se recomienda consultar el paper (arXiv:2602.10934).

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa aproximadamente 2,23 GB en disco; en memoria, cabe en Macs con 8 GB de RAM unificada o superior.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M1 Pro/Max, M2, M3, etc.). No requiere GPU dedicada de NVIDIA.
- Compatibilidad con GPU de consumo: sí, específicamente en Apple Silicon. No está diseñado para GPUs CUDA.
- Opciones de despliegue: mlx-audio (requiere un fork específico, ver enlaces), integrable en pipelines de TTS locales.
- Latencia y throughput: no disponibles; depende del chip concreto y de la configuración de streaming. La cuantización int8 reduce el uso de memoria y puede mejorar la velocidad de inferencia frente a fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Audio-Tokenizer-v2 (original) | 599 M | 48 kHz estéreo | fp32/bf16 | Apache-2.0 | HuggingFace |
| MOSS-Audio-Tokenizer-v2-MLX-int8 (este) | 599 M | 48 kHz estéreo | int8 | Apache-2.0 | HuggingFace |
| EnCodec (Meta) | ~7 M (por codec) | 24 kHz mono | fp32 | CC-BY-NC 4.0 | HuggingFace |
| SoundStream | ~12 M | 24 kHz mono | fp32 | no comercial | GitHub |

Nota: EnCodec y SoundStream son codecs de audio más pequeños y con menor frecuencia de muestreo; MOSS-Audio-Tokenizer destaca por su mayor capacidad y alineación semántica, aunque requiere más recursos.

## Limitaciones y advertencias

- No es un modelo original: es una re-hosting de una cuantización del modelo de OpenMOSS; todo el crédito del diseño y entrenamiento pertenece a OpenMOSS.
- Requiere un fork específico de mlx-audio: la versión estándar de mlx-audio no puede cargar este modelo pre-cuantizado; es necesario usar el fork de sb1992 (ver enlaces) hasta que se integre el cambio en upstream.
- Sesgos del audio de entrenamiento: al entrenarse con 3 millones de horas de audio diverso, puede reflejar sesgos presentes en los datos (acentos, idiomas, condiciones de grabación).
- Riesgo de alucinación: como tokenizador, no genera texto, pero en tareas de reconstrucción puede introducir artefactos en audio fuera de la distribución de entrenamiento.
- Limitaciones de idioma: aunque el audio no es lingüístico, la calidad puede degradarse con idiomas o dialectos infrarrepresentados en los datos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base y sus pesos están sujetos a esa licencia; verificar términos adicionales si se usa en productos comerciales.
- Requisito de Apple Silicon: no es compatible con GPUs NVIDIA ni con entornos x86 estándar; limita su despliegue a hardware de Apple.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/theoracleguy/MOSS-Audio-Tokenizer-v2-MLX-int8
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Repositorio GitHub de MOSS-Audio-Tokenizer: https://github.com/OpenMOSS/MOSS-Audio-Tokenizer
- Paper arXiv: https://arxiv.org/abs/2602.10934
- Fork de mlx-audio requerido: https://github.com/sb1992/mlx-audio
- Modelo TTS emparejado: https://huggingface.co/shraey/MOSS-TTS-Local-Transformer-v1.5-MLX-int8
