# thorhojhus/whisper-small-danish

## Resumen

whisper-small-danish es un ajuste fino (fine-tune) monoidioma en danes del modelo Whisper Small de OpenAI, publicado por el usuario thorhojhus. Mantiene intactas la arquitectura y el tokenizador del modelo original, de modo que es un transformer encoder-decoder con 241.734.912 parametros (aproximadamente 242 millones), disenado exclusivamente para reconocimiento automatico del habla (ASR) en danes. Los pesos liberados corresponden a la media movil exponencial (EMA) tras 200.000 pasos de optimizador.

El problema que resuelve es concreto: Whisper Small generico rinde de forma mediocre en danes, y este ajuste busca reducir la tasa de error de palabras (WER) en dominios muy distintos, desde conversacion espontanea hasta lectura en voz alta. Para ello combina datos etiquetados por humanos de CoRal v3, Common Voice 26.0, FLEURS, FTSpeech y NST con un gran volumen de datos pseudo-etiquetados generados por whisper-large-v3-turbo-danish, sumando unos 54.481,50 horas de audio acumuladas a lo largo de la trayectoria de entrenamiento.

Su relevancia practica es doble: por un lado ofrece una alternativa ligera y de licencia MIT para transcripcion en danes; por otro, demuestra que un unico RTX 4090 y unas 55,7 horas de computo activo bastan para ajustar un modelo de 242 millones de parametros con un esquema de supervision debil. El resultado es un WER medio de 13,37% y un CER de 6,73% en la media no ponderada de sus cinco conjuntos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper, sin cambios) |
| Parametros totales | 241.734.912 (242 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (segmento maximo de entrenamiento: 30 s); para audio mas largo se usa decodificacion secuencial con marcas de tiempo |
| Tipos de cuantizacion | No disponible (los pesos distribuidos son el resultado del entrenamiento en BF16 con EMA en FP32; no se documentan variantes cuantizadas oficiales) |
| Idiomas soportados | Danes (da) unicamente |
| Licencia | MIT (los pesos); los datos de entrenamiento no se redistribuyen |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Libreria | transformers |
| Modelo base | openai/whisper-small (relacion: finetune) |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Small sin ninguna modificacion estructural: un encoder-decoder transformer con atencion estandar, entrenado originalmente por OpenAI con supervision debil a gran escala y descrito en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (arXiv:2212.04356). El modelo procesa entradas de audio de hasta 30 segundos y genera texto autoregresivamente; para clips mas largos se aplica decodificacion secuencial con marcas de tiempo.

El ajuste fino partio de los pesos originales de Whisper Small y utilizo una mezcla de audio danes con etiquetas humanas (porciones danesas de CoRal v3, Common Voice 26.0, FLEURS, FTSpeech y NST) y audio pseudo-etiquetado generado con whisper-large-v3-turbo-danish. El conjunto retenido contenia aproximadamente 13.411 horas de audio unicas; las etiquetas se filtraron por confianza, probabilidad de ausencia de habla, reglas anti-alucinacion y una comprobacion de vocabulario danes/ingles. La ponderacion del muestreo fue 100% pseudo-etiquetado hasta el paso 50.000, 80% hasta el paso 140.000 y 70% a partir de ahi, con fuentes humanas cubriendo el resto. Se preservaron mayusculas, puntuacion y estilo numeral en los objetivos, aplicando normalizacion solo para el calculo de metricas.

Detalles de entrenamiento destacables: 200.000 pasos con optimizador Muon para matrices ocultas y AdamW para el resto de parametros; learning rate maximo de 5e-5 (Muon) y 2.5e-5 (AdamW); weight decay 0.01; calentamiento de 1.000 pasos, fase estable hasta 50.000 y decaimiento lineal hasta el 10% en el paso 200.000; EMA con decaimiento por paso de 0.9999 aplicada cada 50 pasos; precision BF16 con actualizaciones compensadas y EMA en FP32. Se incluyeron aumentacion de forma de onda, SpecAugment y ejemplos sinteticos sin habla. Todo el entrenamiento se ejecuto en una unica NVIDIA GeForce RTX 4090, con aproximadamente 55,7 horas de tiempo activo registrado, excluyendo validacion, E/S de checkpoints y pausas.

## Capacidades

- Transcripcion de voz a texto en danes, con preservacion de mayusculas, puntuacion y estilo numeral en las salidas.
- Reconocimiento robusto en multiples dominios: conversacion espontanea, lectura en voz alta, habla telefónica o de campo y corpus de referencia.
- Manejo de audio largo mediante decodificacion secuencial con marcas de tiempo para clips superiores a 30 segundos.
- Tarea de transcripcion con el parametro `task="transcribe"` y fijacion explicita del idioma con `language="da"`.
- Compatibilidad con el ecosistema `transformers` mediante `AutoModelForSpeechSeq2Seq`, `AutoProcessor` y el pipeline `automatic-speech-recognition`.
- Inferencia en FP16 sobre GPU y en FP32 sobre CPU.
- No se documentan capacidades de traduccion, vision, tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento (thinking). Todas ellas deben considerarse no disponibles.

## Casos de uso

- Transcripcion de reuniones y entrevistas en danes: con segmentacion previa a 30 segundos y decodificacion secuencial, el modelo puede generar actas con puntuacion y numerales conservados, util para equipos que operan en Dinamarca.
- Subtitulado de contenido audiovisual: la salida con marcas de tiempo permite alinear subtitulos en clips largos, aunque conviene validar la deriva temporal en audios de mas de 30 segundos.
- Archivado y busqueda de audio historico: transcripcion masiva de grabaciones de radio, podcasts o llamadas para indexacion posterior en motores de busqueda textual.
- Asistencia a la accesibilidad: conversion a texto de notas de voz y mensajes hablados en aplicaciones de mensajeria, con la ventaja de que 242 millones de parametros permiten ejecucion local.
- Pre-anotacion de corpus para investigacion linguistica: generar transcripciones iniciales que despues se corrigen manualmente, reduciendo el coste de anotacion de nuevos conjuntos daneses.
- Procesamiento en el borde o en equipos sin GPU de datacenter: al ser un modelo de 242 M y 0,5 GB de pesos, puede ejecutarse en portatiles o mini-PC, lo que facilita el cumplimiento de requisitos de residencia de datos.
- Verificacion de calidad de transcripciones de terceros: uso como segundo sistema de ASR en un esquema de consenso para detectar segmentos dudosos antes de una revision humana.
- Prototipado rapido en productos de voz: al cargarse con `transformers` y licencia MIT, es adecuado para pruebas de concepto de asistentes de voz en danes sin coste de licencia.

## Benchmarks y rendimiento

Evaluado con el protocolo publico del Danish ASR Leaderboard, usando Transformers en FP16, decodificacion greedy en danes, decodificacion estandar para clips cortos y decodificacion secuencial con marcas de tiempo por encima de 30 segundos. El calculo incluye la normalizacion de numerales daneses del leaderboard y no elimina muletillas.

| Conjunto de test | Muestras | WER (%) | CER (%) |
|---|---:|---:|---:|
| CoRal conversation | 8.438 | 24,01 | 15,02 |
| CoRal read-aloud | 9.122 | 14,16 | 5,73 |
| Common Voice (`cv17_da`) | 2.756 | 9,53 | 3,65 |
| FLEURS `da_dk` | 930 | 9,94 | 3,94 |
| FTSpeech `test_balanced` | 5.534 | 9,22 | 5,29 |
| Media no ponderada por dominio | 26.780 | 13,37 | 6,73 |

No se han publicado en la informacion disponible resultados comparativos de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, que ademas no aplican a un modelo de ASR. Tampoco se proporcionan cifras de rendimiento (latencia o throughput) ni resultados de los modelos alternativos bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 0,5-1 GB para los pesos mas el coste de activaciones y buffers de atencion; en FP32, alrededor de 1 GB para los pesos. Con lotes grandes o decodificacion con haces, el consumo crece de forma proporcional al batch.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. El propio autor entreno el modelo en una unica RTX 4090 durante 200.000 pasos (~55,7 horas activas). Para servir en produccion a gran escala, A100 o H100 aportan margen para batching agresivo.
- Cabe en GPU de consumo: si, practicamente en cualquier tarjeta actual (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida). Tambien es viable en CPU, aunque con mayor latencia.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de `transformers` (documentado por el autor), servidores de inferencia compatibles con modelos `transformers` (por ejemplo TGI u otros), y runtimes optimizados como CTranslate2/faster-whisper o whisper.cpp si se convierten los pesos, si bien estas conversiones no estan documentadas oficialmente para este checkpoint.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tiempo real ni de factor en tiempo real (RTFx).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thorhojhus/whisper-small-danish | 242 M | 30 s por segmento | Solo danes | MIT | HuggingFace, safetensors |
| openai/whisper-small | 244 M | 30 s por segmento | Multilingue (~99 idiomas) | MIT | HuggingFace |
| thorh/whisper-large-v3-turbo-danish | No disponible en la informacion proporcionada (~809 M segun la familia Whisper large-v3-turbo) | 30 s por segmento | Danes (fine-tune) | No disponible | HuggingFace |

No se dispone de resultados de WER/CER publicados en la informacion proporcionada para openai/whisper-small ni para thorh/whisper-large-v3-turbo-danish bajo el mismo protocolo, por lo que no es posible establecer una comparacion cuantitativa fiable. La diferencia principal frente a Whisper Small original es la especializacion en danes a cambio de perder capacidad multilingue; frente al modelo large-v3-turbo danes, la ventaja de este checkpoint es el tamano reducido (242 M frente a cientos de millones) a costa de menor capacidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo por acento, edad, genero o procedencia regional dentro del danes. Al entrenarse mayoritariamente con pseudo-etiquetado, puede heredar los sesgos y errores sistematicos de whisper-large-v3-turbo-danish.
- Riesgo de alucinacion: el propio autor advierte que el silencio, el ruido y los nombres poco frecuentes pueden producir texto incorrecto. Se aplicaron reglas anti-alucinacion durante el filtrado de etiquetas, pero el riesgo persiste en inferencia.
- Rendimiento fuera del danes: no validado tras el ajuste fino. El modelo no debe usarse para otros idiomas.
- Audio largo: el comportamiento en formato largo no se entreno de forma directa; el autor recomienda verificar el resultado para el uso previsto antes de desplegarlo en produccion.
- Limitaciones de contexto: la ventana nativa es de 30 segundos; la decodificacion secuencial con marcas de tiempo es una extension del pipeline y no una capacidad entrenada especificamente.
- Restricciones de licencia: los pesos son MIT y permiten uso comercial, pero los datos de entrenamiento no se redistribuyen y siguen sujetos a sus terminos de origen. Se incluye atribucion y el aviso de Whisper en `THIRD_PARTY_NOTICES.md`.
- Madurez y soporte: el repositorio registra 0 descargas y 1 like en el momento de la consulta, con creacion y ultima actualizacion en septiembre de 2026. Es un modelo de un autor individual, sin garantias de mantenimiento ni de soporte.
- Produccion: no hay cifras publicadas de latencia, throughput ni consumo de memoria, por lo que cualquier despliegue real requiere una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thorhojhus/whisper-small-danish
- Modelo base: https://huggingface.co/openai/whisper-small
- Modelo usado para generar las pseudo-etiquetas: https://huggingface.co/thorh/whisper-large-v3-turbo-danish
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Protocolo de evaluacion (Danish ASR Leaderboard): https://github.com/Rye-A1/danish-asr-leaderboard
- Dataset CoRal v3: https://huggingface.co/datasets/CoRal-project/coral-v3
- Dataset Common Voice Scripted Speech 26.0: https://huggingface.co/datasets/mozilla-data-collective/common_voice_scripted_speech_26_0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset FTSpeech: https://huggingface.co/datasets/alexandrainst/ftspeech
- Dataset NST da: https://huggingface.co/datasets/alexandrainst/nst-da

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a fichas tecnicas de motocicletas de 50 cc y no se han utilizado.
