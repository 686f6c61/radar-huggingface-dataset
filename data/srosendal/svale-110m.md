# srosendal/svale-110M

## Resumen

svale-110M es un modelo de reconocimiento automático del habla (ASR) para danés, desarrollado por srosendal como ajuste fino del checkpoint de NVIDIA parakeet-rnnt-110m-da-dk. Su objetivo es ofrecer transcripción de voz en danés con una carga computacional ligera, pensada para ejecutarse en CPU: el autor indica una velocidad de 16x tiempo real en 8 hilos de CPU. El modelo se entrenó con 2.850 horas de voz danesa pública procedente de CoRal-v3, FTSpeech, Common Voice, FLEURS y YODAS (solo particiones de entrenamiento), y genera texto en minúsculas y sin puntuación. Con una media de WER del 12,95 % en el leaderboard danés de ASR, es una opción relevante para transcripción masiva en entornos sin GPU. Está licenciado bajo la NVIDIA Open Model License, con restricciones adicionales de CoRal OpenRAIL-D que impiden la síntesis de voz y la identificación biométrica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet RNNT (según checkpoint base nvidia/parakeet-rnnt-110m-da-dk) |
| Parametros totales | No disponible (el nombre del modelo incluye 110M, pero la documentación no lo confirma) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo ASR, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Danés (da) |
| Licencia | NVIDIA Open Model License (con restricciones CoRal OpenRAIL-D: no síntesis de voz, no identificación biométrica) |
| Formato de pesos | .nemo (NeMo) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint de NVIDIA parakeet-rnnt-110m-da-dk, construido sobre la arquitectura Parakeet RNNT. No se proporcionan detalles técnicos de la arquitectura en la documentación disponible. Para el entrenamiento se emplearon 2.850 horas de voz danesa pública (CoRal-v3, FTSpeech, Common Voice, FLEURS y YODAS, solo particiones de entrenamiento). El modelo produce transcripciones en minúsculas y sin puntuación. No se mencionan técnicas como RLHF o DPO; al ser un modelo de reconocimiento automático del habla, el entrenamiento se centra en la transcripción.

## Capacidades

- Reconocimiento automático del habla (ASR) en danés, con salida en minúsculas y sin puntuación.
- Optimizado para CPU: ejecuta a 16x tiempo real en 8 hilos de CPU.
- Requiere audio mono a 16 kHz.
- No es un modelo de lenguaje; no ofrece tool calling, agentes ni razonamiento multi-step.
- Soporta transcripción de ficheros de audio mediante NeMo a partir de un archivo .nemo.
- Disponible en Hugging Face con 0 descargas y 0 likes en el momento de la consulta.

## Casos de uso

- Transcripción de reuniones en danés: el modelo puede transcribir audio de reuniones a 16x tiempo real en CPU, lo que permite generar actas textuales sin necesidad de GPU. La salida en minúsculas y sin puntuación requiere posprocesamiento para restablecer la puntuación.
- Subtitulado en tiempo real: su velocidad en CPU posibilita la generación de subtítulos en directo para contenidos en danés, con latencia reducida.
- Análisis de llamadas de atención al cliente: automatiza el análisis de conversaciones de soporte en danés transcribiendo las llamadas. El WER en conversación (26,74 % en CoRal) indica que es útil para grandes volúmenes, pero requiere revisión humana en diálogos espontáneos.
- Accesibilidad para personas con discapacidad auditiva: puede integrarse en aplicaciones de accesibilidad que convierten el habla danesa en texto en dispositivos con CPU.
- Indexación de archivos de audio para búsqueda: transcribe archivos de audio en danés para convertirlos en texto buscable, útil en bibliotecas o archivos sonoros.
- Investigación lingüística y sociolingüística: permite transcribir corpus de habla danesa para análisis posteriores; el uso de FLEURS y CoRal en el entrenamiento indica afinidad con audios variados.
- Procesamiento de audio en entornos con recursos limitados: diseñado para ejecutarse sin GPU, lo que lo hace adecuado para despliegues en servidores ligeros o en el edge.

## Benchmarks y rendimiento

WER obtenido con el normalizador del Danish ASR leaderboard:

| Conjunto de datos | WER (%) |
|---|---|
| CoRal conversación | 26,74 |
| CoRal lectura en voz alta | 11,52 |
| FTSpeech | 7,33 |
| Common Voice | 9,52 |
| FLEURS | 9,63 |
| Media | 12,95 |

No se disponen de comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- El modelo está diseñado para CPU; no requiere VRAM. En 8 hilos de CPU ejecuta a 16x tiempo real.
- El repositorio tiene un tamaño de 0,5 GB; el archivo del modelo se distribuye en formato .nemo.
- GPU recomendadas: no se requiere GPU. Si se desea acelerar con GPU, no hay especificaciones en la documentación.
- Opciones de despliegue: NeMo (2.1+) y Hugging Face Hub mediante hf_hub_download.
- Latencia y throughput: 16x tiempo real en 8 hilos CPU, según el autor.
- No se indican opciones de despliegue como vLLM, llama.cpp o TGI; no aplican al ser un modelo ASR.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo base nvidia/parakeet-rnnt-110m-da-dk es la referencia más directa, pero no se incluyen sus resultados WER. Otras alternativas de ASR danés no aparecen en la información.

## Limitaciones y advertencias

- El WER en conversación espontánea (26,74 % en CoRal) es elevado; puede presentar errores de transcripción en diálogos coloquiales.
- La salida es en minúsculas y sin puntuación, lo que puede limitar su uso directo en textos formales.
- El modelo está limitado al danés; no soporta otros idiomas.
- La licencia NVIDIA Open Model License incluye restricciones de uso del conjunto CoRal: no se permite la síntesis de voz ni la identificación biométrica.
- No se dispone de análisis de sesgos en la documentación.
- Requiere audio mono a 16 kHz; otros formatos o frecuencias deben convertirse antes de la transcripción.

## Enlaces

- https://huggingface.co/srosendal/svale-110M
- https://huggingface.co/nvidia/parakeet-rnnt-110m-da-dk
- https://huggingface.co/spaces/RyeAI/danish-asr-leaderboard
- https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
