# Waxech/xls-r-300m-uzbek-usc

## Resumen

El modelo `Waxech/xls-r-300m-uzbek-usc` es un sistema de reconocimiento automático del habla (ASR) para uzbeko, obtenido mediante ajuste fino de `facebook/wav2vec2-xls-r-300m` con una cabeza CTC a nivel de carácter. Lo publica el usuario Waxech como parte de un proyecto de curso universitario (COE025, Project 3) y está entrenado sobre un subconjunto de 25 horas del Uzbek Speech Corpus (USC) del ISSAI, seleccionado por hablantes completos a partir del split oficial de entrenamiento.

El modelo resuelve la transcripción de audio en uzbeko en escritura latina, con texto normalizado en minúsculas y sin puntuación. Con 315,4 millones de parámetros y un repositorio de 1,3 GB en safetensors, se mantiene en la gama de tamaño de los XLS-R base, lo que permite desplegarlo en hardware modesto. La licencia Apache 2.0 facilita su uso comercial, aunque el rendimiento reportado es moderado: WER de 0,341 y CER de 0,085 sobre el split de desarrollo del USC con decodificación greedy y sin modelo de lenguaje.

Su relevancia es acotada pero concreta: cubre un idioma de bajos recursos como el uzbeko, para el que existen pocos modelos ASR públicos, y sirve como punto de partida reproducible (semilla 42, hiperparámetros documentados y código disponible) para quien necesite transcripción en este idioma o quiera continuar el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder Transformer) con cabeza CTC a nivel de carácter |
| Parametros totales | 315.469.470 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada típica de wav2vec2, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | uzbeko (uz) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-xls-r-300m` (revisión `1a640f32ac3e39899438a2931f9924c02f080a54`), un encoder auto-supervisado preentrenado sobre habla multilingüe, y le añade una cabeza CTC de clasificación por carácter. Durante el ajuste fino se congeló el extractor de características convolucional (`feature_encoder: frozen`), con `mask_time_prob` de 0,05, dropouts de atención, hidden y proyección de características a 0,0, y layerdrop 0,0.

El entrenamiento usó 27.144 clips (23,922 horas) del split de entrenamiento del USC, seleccionando hablantes completos con semilla 42 tras un proceso de limpieza. La configuración fue: learning rate 0,0003, 500 pasos de warmup, batch size 8 con acumulación de gradiente 4 (batch efectivo 32), AdamW con scheduler de warmup y decaimiento lineales, fp16 activado y 12.735 pasos totales. El checkpoint se eligió sobre el split de desarrollo oficial del USC en el paso 12.735. El texto objetivo es uzbeko latino en minúsculas, con una única forma de apóstrofo (`o'`, `g'`, `'`) y sin puntuación.

## Capacidades

- Reconocimiento automático del habla en uzbeko con salida en escritura latina normalizada (minúsculas, sin puntuación).
- Decodificación CTC greedy; no se documenta integración con modelo de lenguaje externo.
- Entrada de audio mono a 16 kHz.
- Transcripción de clips cortos mediante `Wav2Vec2ForCTC` y `Wav2Vec2Processor`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al uzbeko; no se documenta transferencia a otras lenguas.
- Capacidades especiales (modo thinking, visión, audio generativo): no disponibles.

## Casos de uso

- Transcripción de reuniones y entrevistas en uzbeko: el modelo convierte audio de 16 kHz en texto latino normalizado, adecuado para actas internas donde un WER de ~0,34 es tolerable y se puede corregir a posteriori.
- Subtitulado de vídeo corporativo o educativo en uzbeko: se puede integrar en un pipeline que extraiga audio, lo remuestree a 16 kHz y genere subtítulos con marcas temporales mediante segmentación previa.
- Archivado y búsqueda de audio histórico: transcripción de grabaciones del USC u otras colecciones para indexar contenido y permitir búsqueda por texto.
- Generación de datos etiquetados para otros modelos: el propio modelo puede usarse para preanotar audio uzbeko y acelerar la creación de corpus ASR adicionales.
- Investigación en ASR de bajos recursos: base reproducible (semilla, hiperparámetros y código publicados) para experimentar con decodificación con LM, aumento de datos o ajuste adicional.
- Asistentes de voz locales: al caber en GPU de consumo y tener licencia Apache 2.0, puede desplegarse en entornos sin conexión para dictado o comandos de voz en uzbeko.
- Evaluación comparativa de modelos XLS-R: sirve como referencia de ajuste fino para medir el impacto de distintos corpus uzbekos sobre el mismo backbone.

## Benchmarks y rendimiento

| Conjunto | WER | CER |
|---|---|---|
| USC dev | 0,341 | 0,085 |

Resultados con decodificación greedy y sin modelo de lenguaje, sobre texto normalizado (minúsculas, sin puntuación). No se han publicado resultados sobre el split de test oficial en la información disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,7-1 GB para los pesos (315 M de parámetros) más memoria para activaciones y audio, típicamente menos de 2 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para clips cortos.
- Opciones de despliegue: PyTorch con `transformers` (Wav2Vec2ForCTC), exportación a ONNX, o servidores de inferencia compatibles con modelos de transformers; no se documenta soporte específico en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | WER (USC dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Waxech/xls-r-300m-uzbek-usc | 315,5 M | uzbeko | no disponible | 0,341 | Apache 2.0 | Hugging Face |
| facebook/wav2vec2-xls-r-300m | 315,5 M | multilingüe (preentrenado) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Otros ajustes finos de XLS-R para uzbeko | no disponible | uzbeko | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- WER de 0,341 en desarrollo es alto para producción sin corrección humana o un modelo de lenguaje de decodificación; el autor no reporta resultados con LM.
- Entrenado solo con 23,9 horas de audio de un único corpus (USC), lo que limita la robustez ante acentos, ruido, micrófonos y dominios distintos.
- Solo soporta uzbeko y salida en escritura latina normalizada; no maneja puntuación ni mayúsculas, y la forma del apóstrofo está restringida.
- Riesgo de alucinación y errores en nombres propios, números y términos técnicos, habitual en modelos CTC pequeños.
- Posibles sesgos derivados de la distribución de hablantes del corpus USC (probablemente desequilibrada por género, edad o región).
- Licencia Apache 2.0 permite uso comercial, pero el corpus USC tiene licencias declaradas dispares (MIT en la tarjeta de Hugging Face, CC BY 4.0 en el paper); conviene verificar los términos del dataset antes de un uso comercial.
- Proyecto de curso con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa ni mantenimiento continuado.
- No se documentan requisitos de longitud máxima de audio ni comportamiento en clips largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Waxech/xls-r-300m-uzbek-usc
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Código del proyecto: https://github.com/ata-sesli/nlp-project-3
- Paper del Uzbek Speech Corpus: https://arxiv.org/abs/2107.14419
- Dataset USC en Hugging Face: https://huggingface.co/datasets/issai/Uzbek_Speech_Corpus
