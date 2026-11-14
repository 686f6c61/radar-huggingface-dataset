# Twoeir/whisper-ja-1.5B-ct2

## Resumen

whisper-ja-1.5B-ct2 es una conversión a CTranslate2 del modelo efwkjn/whisper-ja-1.5B, un ajuste fino de Whisper large-v3 especializado en reconocimiento automático de habla (ASR) en japonés. Lo publica el usuario Twoeir y su propósito es permitir la inferencia eficiente del modelo original mediante faster-whisper, una implementación de CTranslate2 optimizada para producción. El repositorio ocupa 3,1 GB y los pesos se han convertido a bfloat16.

El modelo original parte de la arquitectura encoder-decoder Transformer de Whisper large-v3 (aproximadamente 1.550 millones de parámetros, de ahí el sufijo "1.5B") y se ha reajustado sobre corpus japoneses. Según la model card, alcanza un CER (character error rate) competitivo o estado del arte en los conjuntos de evaluación probados, aunque los detalles y las cifras concretas se remiten al repositorio original.

Su relevancia actual reside en que combina un ASR afinado para japonés con el formato CTranslate2, lo que reduce el coste computacional y facilita el despliegue en servicios de transcripción. Es relevante para equipos que necesiten transcribir audio japonés con latencia baja y sin depender de la pila original de PyTorch/Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 finetune) |
| Parametros totales | ~1.550 millones (heredado de Whisper large-v3; no confirmado explícitamente en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmado en la información) |
| Tipos de cuantizacion | bfloat16 (pesos convertidos); otras cuantizaciones de CTranslate2 no documentadas en la ficha |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | CTranslate2 (modelo convertido con ct2-transformers-converter) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un Transformer encoder-decoder con atención estándar, diseñado para transcripción y traducción de audio. El modelo base efwkjn/whisper-ja-1.5B es un ajuste fino de large-v3 orientado exclusivamente al japonés. La conversión a CTranslate2 con cuantización bfloat16 preserva la precisión numérica del original mientras habilita la ejecución optimizada de faster-whisper.

Los datos de entrenamiento del modelo original, según los agradecimientos de su model card, incluyen los conjuntos OOPPEENN, Reazon, 小虫哥_, Common Voice 20 y deepghs. Los conjuntos de evaluación empleados fueron KitsuneX07, TEDxJP, kotoba-tech, Saruwatari-lab y grider-withourai. No se dispone de información sobre el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos detalles corresponden al repositorio original y no se detallan en la información proporcionada.

## Capacidades

- Reconocimiento automático de habla en japonés (transcripción de audio a texto).
- Segmentación temporal de la transcripción con marcas de inicio y fin por segmento.
- Inferencia optimizada mediante faster-whisper y CTranslate2.
- Ejecución en GPU con compute_type bfloat16 (también admite otros tipos de cómputo según faster-whisper, no documentados aquí).
- Detección de idioma limitada al japonés como idioma objetivo del ajuste.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni agentes en la información disponible.

## Casos de uso

- Transcripción de reuniones corporativas en japonés: el modelo puede procesar audio de reuniones y generar segmentos con marcas temporales, adecuado por su ajuste específico al japonés y su despliegue ligero con faster-whisper.
- Subtitulado automático de vídeo: la salida por segmentos con timestamps permite generar ficheros de subtítulos (SRT/VTT) para contenido audiovisual japonés.
- Atención al cliente con análisis de llamadas: transcripción de grabaciones de soporte telefónico para su posterior análisis de calidad o búsqueda, aprovechando la eficiencia de CTranslate2 en producción.
- Generación de actas y notas de voz: conversión de notas de voz o podcasts en japonés a texto indexable, con despliegue en servidores con GPU modesta gracias a la conversión bfloat16.
- Investigación en ASR japonés: evaluación y comparación de CER sobre los conjuntos de referencia citados (KitsuneX07, TEDxJP, kotoba-tech, entre otros).
- Accesibilidad: transcripción en tiempo casi real de conferencias o clases en japonés para personas con discapacidad auditiva, usando faster-whisper sobre GPU consumer.
- Pipelines de datos: generación de transcripciones a gran escala para entrenar o evaluar otros modelos de lenguaje en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo original logra un CER competitivo o estado del arte en los conjuntos evaluados y remite a BENCH.md del repositorio efwkjn/whisper-ja-1.5B para las cifras, pero no se incluyen valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,1 GB en bfloat16, por lo que se requiere aproximadamente esa cantidad de VRAM más overhead de activaciones; una GPU con 6-8 GB debería ser suficiente (estimación basada en el tamaño de los pesos, no confirmada en la información).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabría en RTX 3060/4060 y superiores, así como en A100/H100 para despliegues de alto throughput.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 8 GB o más de VRAM (estimación, no confirmada).
- Opciones de despliegue: faster-whisper (librería indicada en la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-ja-1.5B-ct2 | ~1.550 M | no disponible | ja | no disponible | CTranslate2 |
| efwkjn/whisper-ja-1.5B (original) | ~1.550 M | no disponible | ja | no disponible | safetensors/Transformers |
| Whisper large-v3 (OpenAI) | ~1.550 M | ventana de audio de 30 s | multilingüe | MIT (según información pública de OpenAI, no verificada aquí) | safetensors, CTranslate2, GGUF |

La comparativa se limita al modelo original y al Whisper large-v3 de referencia; no se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo original efwkjn/whisper-ja-1.5B antes de desplegarlo en producción.
- Especializado exclusivamente en japonés: no debe esperarse un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, comportamiento habitual en modelos Whisper.
- Posibles sesgos derivados de los corpus de entrenamiento (Reazon, Common Voice, etc.), que pueden afectar a acentos, dialectos o registros poco representados.
- La conversión a CTranslate2 puede introducir diferencias menores respecto al modelo original en PyTorch; no se documenta una validación numérica de equivalencia.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se documentan limitaciones específicas de contexto o de longitud de audio más allá de las propias de Whisper.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Twoeir/whisper-ja-1.5B-ct2
- Modelo original: https://huggingface.co/efwkjn/whisper-ja-1.5B
- Benchmarks del modelo original: https://huggingface.co/efwkjn/whisper-ja-1.5B/blob/main/BENCH.md
- faster-whisper (GitHub): https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
