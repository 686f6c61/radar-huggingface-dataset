# tekkilab/pulaar-asr-v4

## Resumen

Pulaar-ASR-v4 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por tekkilab, orientado especificamente a la lengua pulaar (tambien conocida como fula) y sus variedades regionales. El modelo emplea una arquitectura w2v-BERT con cabecera CTC, lo que lo situa en la familia de sistemas de reconocimiento end-to-end basados en auto-supervision previa y decodificacion conexionista temporal. El repositorio ocupa 2,4 GB y se distribuye en formato safetensors bajo la libreria transformers.

La relevancia de este modelo reside en su enfoque sobre una lengua de bajos recursos: el pulaar cuenta con decenas de millones de hablantes en Africa occidental pero dispone de muy pocos recursos ASR publicos. El modelo declara soporte para seis codigos ISO (ff, fuc, fuf, fub, ffm, fue), lo que cubre variedades como el pulaar de Senegal, el fula de Guinea, el fulfulde de Nigeria/Camerun y otras variantes regionales.

No obstante, conviene subrayar que se trata de un artefacto de acceso restringido y marcado por el propio autor con etiquetas como "internal", "do-not-redistribute" y "temporary", ademas de una licencia "internal-evaluation-only". En el momento de redactar esta ficha no registra descargas ni interacciones publicas, lo que sugiere un estado de publicacion preliminar o de uso interno del equipo. Cualquier evaluacion externa debe atenerse a esas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-BERT con cabecera CTC (transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | ff, fuc, fuf, fub, ffm, fue (pulaar y variedades fula) |
| Licencia | internal-evaluation-only (acceso restringido, no redistribuible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en w2v-BERT, un encoder transformer preentrenado de forma auto-supervisada que combina objetivos de prediccion contrastiva y enmascarada sobre representaciones de audio. Sobre ese encoder se anade una cabecera CTC para la transcripcion caracter a caracter, un esquema habitual en ASR multilingue de bajos recursos por su robustez ante alineamientos imperfectos y su eficiencia en decodificacion.

No se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del corpus, el numero de horas de audio por variedad linguistica ni sobre si se aplicaron tecnicas de ajuste fino supervisado adicionales (RLHF, DPO u otras). Tampoco se documentan innovaciones tecnicas especificas mas alla de la eleccion de w2v-BERT + CTC. Todos estos datos deben considerarse no disponibles a partir de la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (transcripcion audio a texto) para pulaar y variedades fula.
- Soporte declarado para seis codigos ISO: ff, fuc, fuf, fub, ffm, fue.
- Decodificacion CTC, adecuada para transcripcion en tiempo real o por lotes.
- Integracion con la libreria transformers y con endpoints compatibles (tag endpoints_compatible).
- No se documentan capacidades de traduccion, diarizacion, puntuacion automatica, tool calling ni agentes.
- No se documentan modos de razonamiento extendido ni capacidades multimodales mas alla del audio de entrada.

## Casos de uso

- Transcripcion de reuniones y actas en pulaar: el modelo puede convertir grabaciones de voz en texto para organizaciones comunitarias, ONG o administraciones que operan en zonas fula, siempre que se respete la licencia de evaluacion interna.
- Subtitulado de contenido audiovisual en variedades fula: util para radios comunitarias, television regional o canales de YouTube que emiten en pulaar y necesitan subtitulos en texto.
- Digitalizacion de archivos orales: transcripcion de entrevistas, testimonios y tradicion oral grabada para su catalogacion en archivos linguisticos y bibliotecas.
- Asistencia a la documentacion linguistica: generacion de transcripciones preliminares que investigadores puedan revisar y anotar, acelerando el trabajo de campo sobre variedades poco documentadas.
- Atencion ciudadana por voz: prototipos de lineas de atencion o servicios de informacion en pulaar que transcriban la consulta del usuario antes de derivarla a un agente humano.
- Investigacion en ASR de bajos recursos: punto de partida para experimentos de ajuste fino, comparacion de variedades o evaluacion de tecnicas CTC en lenguas africanas.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en comunidades fula, alli donde se despliegue bajo las condiciones de licencia aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no conocerse el numero de parametros; el repositorio completo ocupa 2,4 GB, lo que sugiere que la inferencia en precision completa podria caber en GPUs consumer con 8-12 GB, aunque es una estimacion orientativa y no confirmada.
- GPU recomendadas: no disponible. Por el tamano del repositorio, una RTX 3060/4070 o superior podria ser suficiente para inferencia en fp32/fp16, pero no hay datos oficiales.
- Cabe en GPU consumer: probablemente si, dado el tamano del repo, pero sin confirmacion del autor.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tekkilab/pulaar-asr-v4 | no disponible | no disponible | ff, fuc, fuf, fub, ffm, fue | internal-evaluation-only | restringida (gated) |
| Alternativas publicas de ASR para lenguas africanas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria; los datos de parametros, contexto y rendimiento de este modelo no estan publicados.

## Limitaciones y advertencias

- Licencia "internal-evaluation-only": el uso comercial y la redistribucion estan prohibidos segun la propia etiqueta del repositorio.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace para descargar los pesos.
- Etiquetas del autor como "internal", "do-not-redistribute" y "temporary" indican que el artefacto puede no ser estable ni definitivo.
- Sin descargas ni likes registrados: no hay evidencia publica de validacion por parte de la comunidad.
- Riesgo de alucinacion y errores de transcripcion inherente a los sistemas CTC, especialmente en variedades con pocos datos.
- Cobertura linguistica limitada a las seis variedades declaradas; no se documenta su comportamiento en otras lenguas.
- Ausencia de informacion sobre sesgos, datos de entrenamiento y evaluacion, lo que dificulta auditar su calidad.
- No apto para produccion sin una evaluacion previa propia y sin aclarar la licencia con el autor.

## Enlaces

- HuggingFace: https://huggingface.co/tekkilab/pulaar-asr-v4
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
