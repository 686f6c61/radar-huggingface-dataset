# whisper-free/whisper-small-egy-ggml

## Resumen

whisper-small-egy-ggml es una conversión al formato GGML (whisper.cpp, precisión F16) del modelo MAdel121/whisper-small-egyptian-arabic, un ajuste fino de Whisper Small orientado a la transcripción de árabe egipcio. El autor del repositorio, whisper-free, no ha entrenado el modelo: se limita a convertir los pesos originales al formato que consume whisper.cpp, manteniendo los pesos sin cambios más allá de la conversión de formato. El vocabulario del tokenizador procede del modelo Whisper base de OpenAI.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper Small, con aproximadamente 244 millones de parámetros, y está pensado para su uso dentro de la aplicación Whisper Free como motor de reconocimiento automático del habla (ASR) para dialecto egipcio. Su relevancia es acotada: cubre un nicho lingüístico poco representado en los modelos ASR generalistas y ofrece una distribución ligera (0,5 GB en el repositorio) que puede ejecutarse en CPU mediante whisper.cpp.

La información publicada es mínima: no se detallan los datos de entrenamiento del modelo original, no se declaran idiomas soportados en los metadatos de Hugging Face y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | no disponible (Whisper Small tiene aproximadamente 244 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | F16 (único formato publicado) |
| Idiomas soportados | no disponible en metadatos; el modelo original está orientado a árabe egipcio |
| Licencia | MIT |
| Formato de pesos | GGML (binario whisper.cpp, F16) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de OpenAI Whisper Small, un transformer encoder-decoder con atención completa entrenado originalmente para ASR multitarea (transcripción, traducción, detección de idioma y marcas temporales). Whisper Small opera sobre espectrogramas Mel de 80 canales en ventanas de 30 segundos y genera texto de forma autorregresiva.

No se dispone de información sobre el proceso de ajuste fino del modelo original MAdel121/whisper-small-egyptian-arabic: se desconoce el volumen de datos de entrenamiento, su composición, si hubo aumento de datos o técnicas de regularización, y si se aplicaron etapas de alineación. La conversión a GGML es puramente de formato: los pesos se mantienen y solo cambia la representación binaria para su carga en whisper.cpp. El tokenizador proviene del modelo Whisper base de OpenAI.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio en árabe egipcio, según el propósito declarado del modelo original.
- Transcripción de audio en ventanas de hasta 30 segundos por segmento, con concatenación para audios más largos.
- Ejecución en CPU mediante whisper.cpp gracias al formato GGML F16.
- Integración en la aplicación Whisper Free como motor de transcripción.
- No se documentan capacidades de tool calling, agentes, visión, audio adicional ni modo de razonamiento extendido.
- Cobertura multilingüe: no disponible; los metadatos no declaran idiomas y el ajuste fino apunta a un dialecto concreto.

## Casos de uso

- Transcripción de audio en árabe egipcio en aplicaciones de escritorio o móvil: el formato GGML permite cargar el modelo en whisper.cpp sin dependencias de GPU, adecuado para la app Whisper Free.
- Subtitulado de contenido audiovisual egipcio: entrevistas, pódcast o vídeos con habla coloquial pueden transcribirse por segmentos de 30 segundos y ensamblarse después.
- Procesamiento por lotes en servidores sin GPU: al ser un modelo de 0,5 GB en F16, puede ejecutarse en CPU con un consumo de memoria moderado para pipelines de transcripción masiva.
- Investigación lingüística sobre dialecto egipcio: permite generar transcripciones de corpus orales para análisis léxico o fonético, siempre con revisión humana.
- Prototipado de asistentes de voz en árabe egipcio: la salida de texto puede alimentar etapas posteriores de NLP en un pipeline propio.
- Archivado y búsqueda de grabaciones: transcripción de reuniones o llamadas en egipcio para indexación textual y recuperación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,5 GB en F16, por lo que la inferencia requiere del orden de esa cifra de memoria (RAM o VRAM) más overhead del runtime.
- GPU recomendadas: no disponibles; whisper.cpp puede ejecutarse en CPU y, con soporte CUDA, en GPUs NVIDIA consumer como RTX 3060 o superiores.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no se han publicado mediciones.
- Opciones de despliegue: whisper.cpp (formato nativo GGML); no se indica compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-small-egy-ggml | ~244 M (Whisper Small) | ventanas de 30 s | árabe egipcio (presunto) | MIT | GGML F16 |
| openai/whisper-small | ~244 M | ventanas de 30 s | multilingüe | MIT | PyTorch, GGML (conversiones de terceros) |
| openai/whisper-base | ~74 M | ventanas de 30 s | multilingüe | MIT | PyTorch, GGML |
| MAdel121/whisper-small-egyptian-arabic | ~244 M | ventanas de 30 s | árabe egipcio | MIT | PyTorch (origen del ajuste) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: el ajuste fino está orientado a árabe egipcio; su rendimiento en otros dialectos o en árabe estándar no está documentado.
- Sin benchmarks: no hay métricas publicadas de WER ni comparaciones verificables con alternativas.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio musical.
- Sesgos: no documentados; al desconocerse la composición del dataset de ajuste, no pueden evaluarse sesgos de hablantes, género o registro.
- Licencia: MIT, lo que permite uso comercial, pero el autor advierte que las licencias de los datasets de entrenamiento no fueron auditadas.
- Trazabilidad: es una conversión de un modelo de terceros; los pesos no se han reentrenado y cualquier problema de calidad proviene del modelo original.
- Verificación: el autor recomienda comprobar las descargas con SHA256SUMS.
- Idiomas no declarados en Hugging Face: la cobertura lingüística real debe validarse empíricamente antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/whisper-free/whisper-small-egy-ggml
- Modelo original: https://huggingface.co/MAdel121/whisper-small-egyptian-arabic
- Repositorio OpenAI Whisper: https://github.com/openai/whisper
- Anuncio de OpenAI Whisper: https://openai.com/fr-FR/index/whisper/
- whisper.cpp (runtime GGML): no disponible en la búsqueda, referencia habitual en https://github.com/ggerganov/whisper.cpp
- Whisper AI (servicio de transcripción): https://whisperai.com/
