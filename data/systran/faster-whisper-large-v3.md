# Systran/faster-whisper-large-v3

## Resumen

El modelo `Systran/faster-whisper-large-v3` es una conversión del modelo `openai/whisper-large-v3` al formato CTranslate2, realizada por Systran. Se trata de un sistema de reconocimiento automático de voz (ASR) multilingüe que permite transcribir audio a texto de forma rápida y eficiente. Su principal valor es que aprovecha el runtime CTranslate2, optimizado para inferencia en CPU y GPU, lo que reduce la latencia y el consumo de memoria respecto al modelo original en PyTorch. El modelo está pensado para integrarse con la librería `faster-whisper` en Python, y su licencia MIT facilita su uso tanto en investigación como en aplicaciones comerciales. El repo tiene un tamaño de 3,1 GB con los pesos guardados en FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 convertido a CTranslate2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos guardados) y otros tipos configurables en CTranslate2 mediante `compute_type` |
| Idiomas soportados | Lista amplia de códigos ISO en la model card, incluyendo es, en, fr, de, ru, zh, etc. |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (convertido con `ct2-transformers-converter`) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `openai/whisper-large-v3` al formato CTranslate2, realizada con el comando `ct2-transformers-converter --model openai/whisper-large-v3 --output_dir faster-whisper-large-v3 --copy_files tokenizer.json preprocessor_config.json --quantization float16`. La arquitectura subyacente es la del Whisper large-v3 original: un transformer encoder-decoder diseñado para tareas de ASR. Los pesos se almacenan en FP16, y el tipo de cómputo puede cambiarse al cargar el modelo mediante la opción `compute_type` de CTranslate2. No se proporcionan en la información disponible detalles sobre el entrenamiento del modelo original, ni sobre el tamaño del dataset o las técnicas de alineación utilizadas.

## Capacidades

- Reconocimiento automático de voz (ASR) para transcribir audio a texto.
- Soporte para múltiples idiomas, según la lista proporcionada en la model card (español, inglés, chino, francés, alemán, ruso, etc.).
- Inferencia optimizada gracias al formato CTranslate2 y a los pesos en FP16.
- Integración directa con la librería `faster-whisper` de Python.
- No se indican capacidades de tool calling, agentes, visión ni audio adicional en la información disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas: convertir grabaciones de audio en texto con marcas de tiempo, útil para generar actas y resúmenes automáticos.
- Subtitulado de vídeos: generar subtítulos en formato SRT para contenido multimedia, aprovechando el soporte multilingüe y la baja latencia.
- Análisis de llamadas de atención al cliente: transcribir llamadas de soporte para extraer necesidades, sentimiento o temas recurrentes.
- Accesibilidad para personas sordas: crear subtítulos en tiempo real para emisiones en directo o clases, gracias a la velocidad de CTranslate2.
- Procesamiento por lotes de archivos de audio: transcribir grandes volúmenes de podcasts, audiolibros o archivos de voz en un servidor.
- Integración en pipelines de análisis de contenido: combinar la transcripción con modelos de lenguaje para clasificar, resumir o buscar de forma semántica en el contenido hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 3,1 GB, lo que da una idea del espacio necesario para los pesos en FP16.
- CTranslate2 permite inferencia tanto en CPU como en GPU.
- La VRAM requerida depende del `compute_type` seleccionado y de la longitud del audio, pero no se especifican requisitos concretos en la información disponible.
- Opciones de despliegue: CTranslate2 y `faster-whisper` (uso directo en Python).

## Comparativa con modelos similares

La información disponible no incluye datos suficientes para una comparación cuantitativa. Cabe señalar que este modelo es la conversión de `openai/whisper-large-v3` al formato CTranslate2, por lo que es funcionalmente equivalente al modelo original, con la ventaja de un runtime más eficiente. No se proporcionan métricas de rendimiento para comparar con otras alternativas.

## Limitaciones y advertencias

- Al ser una conversión de `openai/whisper-large-v3`, hereda las limitaciones del modelo original, que no se detallan en la información disponible.
- No se proporciona información específica sobre sesgos o riesgos de alucinación.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar los términos del modelo original (openai/whisper-large-v3).
- El soporte multilingüe es amplio, pero no se garantiza un rendimiento uniforme en todos los idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Systran/faster-whisper-large-v3
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Repositorio de faster-whisper: https://github.com/systran/faster-whisper
- Modelo original: https://huggingface.co/openai/whisper-large-v3
