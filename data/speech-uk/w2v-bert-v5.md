# speech-uk/w2v-bert-v5

## Resumen

w2v-bert-v5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario speech-uk, especializado en transcripción de audio en ucraniano, ruso e inglés. Se trata de un fine-tuning del modelo speech-uk/w2v-bert-v4, que a su vez parte de la arquitectura Wav2Vec2-BERT, un modelo preentrenado auto-supervisado que combina representaciones de audio con un encoder tipo transformer. El modelo resuelve la tarea de transcripción de voz a texto con salida que incluye mayúsculas, puntuación y dígitos tal como aparecen en subtítulos.

La relevancia de esta versión radica en la ampliación del conjunto de entrenamiento: pasa de las 150 horas de v4 a 807 horas de audio extraído de vídeos de YouTube en los tres idiomas, con un total de 538.213 clips y 9.154 vídeos. Esta ampliación se traduce en mejoras medibles en la tasa de error de palabras (WER), especialmente en inglés (3,2 puntos de mejora en modo greedy) y en ruso (0,5 puntos), aunque el ucraniano empeora ligeramente en modo greedy (0,6 puntos) y mejora al aplicar el modelo de lenguaje.

El modelo tiene 607,5 millones de parámetros, un repositorio de 2,0 GB y se distribuye bajo licencia Apache 2.0. Es importante señalar que se trata de un checkpoint intermedio (época 1 de 3), marcado explícitamente como trabajo en curso por el autor, y que no debe considerarse la versión final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (encoder transformer con CTC) |
| Parametros totales | 607.524.425 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de hasta 80 s por lote en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (uk), ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Wav2Vec2-BERT, que combina un extractor de características convolucional con un encoder transformer. La entrada son características log-mel de 160 dimensiones extraídas mediante el paquete `asr_features` (rueda binaria incluida en el repositorio, compatible con Linux x86-64, glibc 2.34+ y Python 3.10+). La cabeza de salida es una capa CTC (Connectionist Temporal Classification) sobre un tokenizador SentencePiece de 1.801 piezas compartido con las versiones v3 y v4.

El entrenamiento parte de los pesos de w2v-bert-v4 y se extiende durante 3 épocas planificadas (59.037 pasos de optimizador), con una tasa de aprendizaje de 3e-5, 2.952 pasos de calentamiento y decaimiento posterior. Se usan lotes de clips de longitud similar de hasta 80 segundos de audio rellenado, con 2 lotes por paso, precisión bf16, SpecAugment con enmascaramiento temporal de 0,05 y una única RTX 3090 con los kernels de w2v-bert-fast. Los datos de entrenamiento provienen de YODAS v3.1, con clips cortados por actividad de voz (PulseVAD de extract-speech) y por tiempos de subtítulo, transcritos con tinyasr y filtrados por acuerdo con los subtítulos (CER ≤ 0,15, sin palabras alucinadas ni faltantes en bordes, proporción de habla ≥ 0,3). El texto de entrenamiento es la hipótesis de tinyasr.

La distribución por idioma del conjunto de 807,36 horas es: ucraniano con 190.823 clips (281,33 h), ruso con 162.435 clips (258,41 h) e inglés con 184.955 clips (267,62 h). Además, se incluyen dos modelos de lenguaje KenLM de 4-gramas de palabras con Kneser-Ney modificado para decodificación CTC con fusión superficial: `lm-wiki/` (Wikipedia, 127 millones de palabras) y `lm/` (transcripciones de entrenamiento, nuevo en esta versión). Antes de construir `lm-wiki/`, se eliminaron de Wikipedia todas las frases que compartían una secuencia de 8 palabras con FLEURS dev o test para evitar contaminación.

## Capacidades

- Transcripción de voz a texto en ucraniano, ruso e inglés con salida que incluye mayúsculas, puntuación y dígitos tal como los escriben los subtítulos.
- Reconocimiento automático del habla (ASR) mediante CTC, con decodificación greedy o beam search.
- Decodificación con modelo de lenguaje (shallow fusion) usando los KenLM incluidos, con beam width de 64.
- Manejo de audio de 16 kHz mono, con media eliminada y normalización de pico.
- Capacidad multilingüe limitada a los tres idiomas entrenados (uk, ru, en).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento (thinking mode).

## Casos de uso

- Transcripción de contenido audiovisual en ucraniano, ruso e inglés: el modelo puede generar subtítulos con puntuación y mayúsculas directamente, adecuado para plataformas de vídeo o archivos de medios que necesiten subtitulado automático en estos tres idiomas.
- Generación de subtítulos para YouTube: el entrenamiento se realizó sobre clips de YouTube con subtítulos como referencia, por lo que el dominio de aplicación coincide con el de entrenamiento y la salida imita el estilo de los subtítulos.
- Archivado y búsqueda de audio histórico: transcripción de grabaciones en ucraniano o ruso para hacerlas indexables y buscables, con la ventaja de que el modelo maneja puntuación y dígitos.
- Atención al cliente en centros de contacto multilingües: transcripción de llamadas en ruso o ucraniano para análisis de calidad, con la posibilidad de usar el modelo de lenguaje para mejorar la precisión en dominios específicos.
- Investigación lingüística y corpus: generación de transcripciones para estudios de fonética o lingüística de corpus en los tres idiomas, con la ventaja de ser un modelo abierto con licencia Apache 2.0.
- Sistemas de subtitulado en directo o diferido para medios de comunicación en Europa del Este: integración en pipelines de transcripción con decodificación beam search y LM para reducir el WER en emisiones.
- Preprocesamiento para pipelines de NLP: transcripción de audio a texto como paso previo a análisis de sentimiento, resumen o traducción en contextos ucraniano-ruso-inglés.

## Benchmarks y rendimiento

Resultados en FLEURS dev (1.075 enunciados, 3,07 h) con las reglas de puntuación indicadas: caso plegado, puntuación eliminada, ё = е, apóstrofos unificados, números comparados tal como se escriben.

| Modelo y configuración | uk | ru | en | all |
|---|---:|---:|---:|---:|
| w2v-bert-v4, greedy | 10,17 | 11,48 | 22,08 | 15,35 |
| w2v-bert-v5, greedy | 10,77 | 10,95 | 18,84 | 14,06 |
| w2v-bert-v4 + lm-wiki (alpha 0,4, beta -0,5) | 8,01 | 7,43 | 13,51 | 10,03 |
| w2v-bert-v5 + lm (transcripciones; alpha 0,15, beta -0,5) | 9,43 | 9,00 | 14,08 | 11,15 |
| w2v-bert-v5 + lm-wiki (Wikipedia; alpha 0,3, beta -0,5) | 7,72 | 7,43 | 12,05 | 9,36 |

Notas: el beam width es 64 en todas las filas con LM. El inglés mejora 3,2 puntos en greedy; el ruso mejora 0,5 puntos; el ucraniano empeora 0,6 puntos en greedy pero mejora con lm-wiki. FLEURS dev se usó para elegir los pesos del LM, con un óptimo plano (9,36-9,49 para alpha 0,3-0,4 y beta -1 a 0). No se usó FLEURS test. La validación interna del entrenamiento reporta WER greedy de 15,34 en el paso 0 (v4) y 14,05 tras la época 1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 607,5 millones de parámetros en bf16, el peso del modelo ronda los 1,2 GB, por lo que la inferencia en precisión completa es viable en GPUs consumer.
- GPU recomendadas: el autor entrenó con una única RTX 3090, lo que indica que la inferencia cabe holgadamente en GPUs consumer de gama alta (RTX 3090, RTX 4090, etc.). Para producción a escala se pueden usar A100 o H100.
- Cabe en GPU consumer: sí, dado el tamaño del modelo (607,5 M de parámetros) y el entrenamiento realizado en una RTX 3090.
- Opciones de despliegue: el modelo se usa con `transformers` (AutoModelForCTC), el paquete `asr_features` para extracción de características y `pyctcdecode` con `kenlm` para decodificación con LM. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | WER FLEURS dev (all) |
|---|---|---|---|---|---|
| w2v-bert-v5 | 607,5 M | no disponible | uk, ru, en | Apache 2.0 | 9,36 (con lm-wiki) |
| w2v-bert-v4 | no disponible | no disponible | uk, ru, en | Apache 2.0 | 10,03 (con lm-wiki) |
| w2v-bert-v3 | no disponible | no disponible | uk, ru, en | Apache 2.0 | no disponible |

La comparativa se limita a las versiones previas del mismo autor, ya que no se proporcionan datos de otros modelos ASR comparables en la información disponible. No se dispone de datos de parámetros, contexto ni rendimiento de alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Checkpoint intermedio: se trata del checkpoint al final de la época 1 (paso 19.679 de 59.037), marcado como trabajo en curso. Una versión posterior lo reemplazará solo si mejora en FLEURS dev, pero el rendimiento actual no representa el resultado final del entrenamiento.
- El ucraniano empeora 0,6 puntos en modo greedy respecto a v4 en este checkpoint; solo mejora al aplicar el modelo de lenguaje lm-wiki.
- Los resultados de FLEURS test no se han evaluado; todas las métricas provienen de FLEURS dev, que además se usó para ajustar los pesos del LM, lo que puede introducir un sesgo optimista.
- Riesgo de alucinación inherente a los modelos CTC con LM: la fusión superficial con KenLM puede generar palabras plausibles que no se dijeron, especialmente en audio ruidoso o con acentos no representados.
- Sesgos desconocidos: no se documentan análisis de sesgos demográficos, acentos o variedades dialectales; el entrenamiento proviene de YouTube, lo que puede sobrerrepresentar ciertos registros y estilos de habla.
- Limitación de idioma: solo cubre ucraniano, ruso e inglés; no soporta otros idiomas ni code-switching más allá de lo que aparezca en los datos de entrenamiento.
- Dependencia de binarios: el paquete `asr_features` requiere Linux x86-64, glibc 2.34+ y Python 3.10+, lo que limita el despliegue en otros sistemas operativos o arquitecturas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye tal cual.
- El modelo de lenguaje `lm-wiki` se construyó eliminando frases de Wikipedia que compartían secuencias de 8 palabras con FLEURS dev o test, pero no se documentan otras posibles contaminaciones en los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/speech-uk/w2v-bert-v5
- Modelo base v4: https://huggingface.co/speech-uk/w2v-bert-v4
- Dataset de entrenamiento v4: https://huggingface.co/datasets/speech-uk/yodas-tinyasr-50h
- Dataset YODAS v3.1: https://huggingface.co/datasets/espnet/yodas3.1
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Wikipedia monthly: https://huggingface.co/datasets/omarkamali/wikipedia-monthly
- Herramienta extract-speech: https://github.com/RustedBytes/extract-speech
- Herramienta tinyasr: https://github.com/dkaraush/tinyasr
- Kernels w2v-bert-fast: https://github.com/Wataru-Nakata/w2v-bert-fast
- KenLM: https://github.com/kpu/kenlm
