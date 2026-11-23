# vatsonai/pusmogo-hu-001

## Resumen

Pusmogo HU 001 es un modelo de reconocimiento automatico del habla (ASR) especializado exclusivamente en hungaro, desarrollado por vatson.ai. Se trata de un ajuste fino completo de `openai/whisper-large-v3-turbo` sobre 182 horas de audio hungaro auditado, con el objetivo de mejorar la precision del reconocimiento en ese idioma concreto. Forma parte de Pusmogo, una aplicacion gratuita de dictado para macOS que ejecuta el modelo de forma totalmente local mediante whisper.cpp.

El modelo resuelve un problema concreto: Whisper large-v3-turbo es un modelo multilingue generico que rinde de forma notablemente inferior en hungaro que en idiomas con mayor representacion en sus datos de entrenamiento. El ajuste fino reduce el WER en habla real de FLEURS del 17,0 % al 12,5 %, y en habla susurrada del 47,2 % al 29,9 %. La relevancia practica radica en que ofrece inferencia local en un solo fichero de 574 MB cuantizado a q5_0, sin dependencia de servicios en la nube.

La arquitectura es la del transformer encoder-decoder de Whisper (large-v3-turbo), con aproximadamente 809 millones de parametros en su version turbo. El modelo se distribuye unicamente en formato GGML para whisper.cpp, con licencia MIT sobre los pesos, y esta pensado para fijar el token de idioma a `hu` en todo momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (heredados de whisper-large-v3-turbo, ~809 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | q5_0 (unico fichero publicado) |
| Idiomas soportados | hungaro (hu) exclusivamente |
| Licencia | MIT (pesos) |
| Formato de pesos | GGML / whisper.cpp (`.bin`) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con atencion estandar y decodificacion autorregresiva, disenado para transcribir segmentos de audio de 30 segundos. El ajuste fino fue completo (no LoRA ni adaptadores), con 2 epocas, tamano de lote 32, tasa de aprendizaje 1e-5 con decaimiento lineal y 500 pasos de calentamiento, en precision bf16 y con el token de idioma fijado a hungaro durante el entrenamiento.

Los datos de entrenamiento ascienden a 98.987 clips (182 horas) tras un proceso de auditoria que elimino texto incorrecto o truncado, clipping, silencio y hablantes sobrerrepresentados. La composicion es: Common Voice Hungarian Scripted Speech 27.0 (86,0 h, CC0-1.0), VoxPopuli Hungarian transcrito (53,3 h, CC0 con aviso legal del Parlamento Europeo sobre el audio) y FLEURS Hungarian split de train (9,3 h, CC-BY-4.0). Ademas, el 25 % de los clips incluyen una copia pseudo-susurrada (36,7 h), lo que mejora el rendimiento en voz susurrada. Se reservaron 2.047 clips (3,8 h) como conjunto de validacion. No se usaron grabaciones privadas, de clientes ni voces sinteticas.

## Capacidades

- Transcripcion de voz a texto en hungaro con reconocimiento de habla real, susurrada y con ruido de fondo.
- Ejecucion totalmente local y offline mediante whisper.cpp, sin envio de audio a servidores externos.
- Inferencia rapida: 0,29 s de mediana por frase de FLEURS en Apple M5 Pro, frente a 0,33 s de large-v3-turbo y 0,73 s de large-v3.
- Mejora especifica en habla susurrada (WER 29,9 % frente a 47,2 % del modelo base).
- Mejora en frases cortas y en audio con ruido (WER 26,1 % frente a 47,8 % del base en frases cortas con ruido).
- Soporte de entrada de audio en formato WAV mediante la CLI de whisper.cpp (`whisper-cli`).
- No soporta otros idiomas: el token de idioma debe fijarse a `hu`.
- No dispone de tool calling, capacidades de agente ni salida estructurada mas alla de la transcripcion.

## Casos de uso

- Dictado local en macOS: integracion en la aplicacion Pusmogo para convertir voz en texto en tiempo real sin conexion, aprovechando el fichero q5_0 de 574 MB y la latencia sub-segundo por frase.
- Transcripcion de reuniones y entrevistas en hungaro: el modelo maneja habla real de FLEURS con WER del 12,5 %, adecuado para generar actas o subtitulos en entornos de oficina.
- Subtitulado de contenido audiovisual hungaro: util para generar pistas de subtitulos en videos con voz clara, con la salvedad de revisar numeros y nombres propios.
- Accesibilidad para personas con voz susurrada o baja: el ajuste con datos pseudo-susurrados reduce el WER del 47,2 % al 29,9 %, lo que lo hace viable para usuarios que no pueden hablar a volumen normal.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: whisper.cpp permite ejecutar el modelo en CPU, lo que facilita pipelines de transcripcion masiva de bajo coste.
- Investigacion en ASR de bajos recursos: sirve como referencia de ajuste fino completo sobre Whisper para un idioma de representacion limitada, con datos y metodologia documentados.
- Transcripcion en entornos con ruido moderado: el WER del 26,1 % en frases cortas con ruido supera claramente al modelo base (47,8 %), util para grabaciones de campo o calles.

## Benchmarks y rendimiento

Resultados en WER / CER (%), menor es mejor, medidos con el mismo motor y ajustes en Apple M5 Pro. Las frases de FLEURS provienen del split de test y no estaban en el entrenamiento.

| Conjunto | Clips | large-v3-turbo | large-v3 | Pusmogo HU |
|---|---|---|---|---|
| FLEURS hungaro, habla real | 100 | 17,0 / 4,1 | 13,4 / 3,5 | **12,5 / 3,3** |
| FLEURS hungaro, pseudo-susurrado | 100 | 47,2 / 21,0 | 42,3 / 19,3 | **29,9 / 13,6** |
| Frases cortas, sintetico | 44 | 29,3 / 7,9 | 18,5 / 4,9 | **12,0 / 3,4** |
| Frases cortas, silenciosas, sintetico | 44 | 26,1 / 7,9 | **13,0 / 3,6** | 15,2 / 4,0 |
| Frases cortas con ruido, sintetico | 44 | 47,8 / 22,1 | 35,9 / 20,6 | **26,1 / 10,4** |
| Frases cortas pseudo-susurradas, sintetico | 44 | 88,0 / 73,9 | 84,8 / 78,6 | **52,2 / 37,4** |
| Frases, sintetico | 60 | 6,8 / 1,6 | 6,2 / 1,3 | **5,5 / 1,0** |
| Frases con ruido, sintetico | 20 | 6,9 / 1,3 | **2,8 / 0,3** | 5,6 / 2,1 |
| Hungaro con terminos en ingles, sintetico | 30 | **17,8 / 4,2** | 18,3 / 4,0 | 24,2 / 5,4 |

Tiempo mediano por frase de FLEURS: 0,29 s (large-v3-turbo 0,33 s, large-v3 0,73 s).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero q5_0 ocupa 574 MB; en whisper.cpp la huella en memoria es de aproximadamente 0,6-1 GB, por lo que cabe en cualquier GPU consumer con 2 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo con 2 GB de VRAM es suficiente (GTX 1050, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU de forma viable.
- Opciones de despliegue: whisper.cpp (unico formato soportado, GGML q5_0). No hay pesos en safetensors ni GGUF estandar para vLLM, TGI u Ollama.
- Latencia y throughput: mediana de 0,29 s por frase de FLEURS en Apple M5 Pro con whisper.cpp. No se han publicado datos de throughput para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | WER FLEURS hu (real) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Pusmogo HU 001 | ~809 M (heredados) | 30 s por segmento | hu | 12,5 | MIT | GGML q5_0 |
| whisper-large-v3-turbo | ~809 M | 30 s por segmento | multilingue | 17,0 | MIT | safetensors, GGML, etc. |
| whisper-large-v3 | ~1.550 M | 30 s por segmento | multilingue | 13,4 | MIT | safetensors, GGML, etc. |

Pusmogo HU 001 supera a su modelo base en hungaro en la mayoria de conjuntos, con un tamano de fichero menor que large-v3 y una latencia inferior (0,29 s frente a 0,73 s). Su principal desventaja es la ausencia de soporte multilingue y de formatos alternativos de pesos.

## Limitaciones y advertencias

- Solo funciona en hungaro: no fue entrenado en ningun otro idioma; el token de idioma debe fijarse a `hu`.
- Terminos en ingles dentro de frases hungaras: el WER sube al 24,2 % (frente al 17,8 % del base); palabras como "deadline" pueden transcribirse como "de ad line".
- Alucinacion sobre musica o ruido largo sin habla: puede generar aperturas parlamentarias ("Tisztelt képviselőtársaim!") por la presencia de VoxPopuli en el entrenamiento. Se recomienda usar un detector de voz.
- Numeros, nombres y ortografia: se escriben como los genera Whisper; la aplicacion los corrige con reglas fijas, no el modelo.
- Rendimiento inferior al base en frases cortas silenciosas (15,2 % frente a 13,0 % de large-v3) y en frases con ruido (5,6 % frente a 2,8 %).
- Restricciones de licencia: los pesos son MIT, pero los datos de entrenamiento tienen licencias CC0-1.0, CC0 con aviso legal del Parlamento Europeo y CC-BY-4.0; el audio de entrenamiento no se publica.
- Unico formato disponible (GGML q5_0): no hay versiones en safetensors, GGUF ni otras cuantizaciones, lo que limita su uso fuera de whisper.cpp.
- Sin datos de benchmarks en otras plataformas que no sean Apple M5 Pro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vatsonai/pusmogo-hu-001
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- vatson.ai: https://vatson.ai
- Referencia FLEURS (Conneau et al., 2022): no disponible como enlace directo en la informacion proporcionada
