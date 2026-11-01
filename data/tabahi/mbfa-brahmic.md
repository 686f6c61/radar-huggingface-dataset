# Tabahi/mbfa-brahmic

## Resumen

mbfa-brahmic es un modelo de alineamiento forzado (forced alignment) y reconocimiento de fonemas desarrollado por el autor independiente Tabahi. No es un modelo generativo de lenguaje: es un codificador convolucional (CNN) que clasifica cada fotograma de 5 ms de audio en un token fonético, partiendo de como maximo 120 ms de contexto acustico (campo receptivo de 38,9 ms). Forma parte de la familia p4mbfa, sucesora de CUPE (p3cupe), y esta especializado en el grupo de lenguas bramicas de la libreria standard_g2p.

El modelo resuelve un problema muy concreto: dada una onda de audio y una secuencia conocida de fonemas, determinar en que instante empieza y termina cada fonema. Lo hace mediante un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida, refinando las fronteras a precision subfotograma en el cruce de posteriores adyacentes. Al limitar el contexto a 120 ms, el diseno impide que el modelo aprenda la fonotactica de ninguna lengua, lo que en teoria facilita la transferencia entre idiomas del mismo grupo.

El modelo tiene 14.760.389 parametros, ocupa 0,1 GB en el repositorio y se distribuye en formato safetensors con pesos PyTorch. Esta entrenado sobre las 16,8 horas del subconjunto bramico de FLEURS (hindi, oriya y tamil). Es relevante para pipelines de sintesis de voz, transcripcion forzada y anotacion fonetica en lenguas indias, un nicho con pocas herramientas especificas y abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional sin contexto (context-free), con tres cabezas de clasificacion por fotograma (ph, phg, tone) |
| Parametros totales | 14.760.389 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 120 ms de audio maximo por fotograma; campo receptivo de 38,9 ms; fotogramas de 5 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi), oriya (or), tamil (ta); otros miembros del grupo bramico podrian alinear, sin probar |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (inferencia) y checkpoint PyTorch Lightning en pickle (entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es una CNN que opera sobre ventanas de audio de como maximo 120 ms y clasifica cada fotograma de 5 ms. El modelo tiene tres cabezas: `ph` (96 etiquetas: tokens locales del grupo bramico, incluyendo `<blank>`, `SIL`, `noise` y `<unk>`), `phg` (15 etiquetas de grupos foneticos dorados, compartidas por todos los grupos de lengua) y `tone` (22 valores de tono, compartidos pero no entrenados en este modelo porque ninguna lengua del grupo tiene capa tonal). El tronco y la cabeza `phg` provienen del modelo latin ma02a (epoca final); las cabezas `ph` y `tone` se entrenaron desde cero.

El entrenamiento uso las 16,8 horas completas de FLEURS bramico con un nivel de ruido de 0,02. El checkpoint seleccionado es el experimento `mb01a`, epoca 4, elegido por `val_loss` sobre el conjunto de validacion de FLEURS (mejor de 20 epocas; la epoca final alcanzo 3,707). Las metricas reportadas son `val_loss` 3,5548, `val_frame_acc` 0,2727 y `val_frame_acc_groups` 0,4633. Es importante senalar que estas metricas se calculan sobre los propios alineamientos del modelo (no existen etiquetas de frontera fuera del ingles), por lo que miden autoconsistencia, no precision real de fronteras. Las etiquetas de entrenamiento son las pronunciaciones del diccionario standard_g2p (inventario dorado `9438371ed6dd`), no transcripciones foneticas de lo realmente pronunciado.

## Capacidades

- Alineamiento forzado de audio con una secuencia de fonemas conocida, devolviendo marcas de inicio y fin en milisegundos para cada token.
- Clasificacion de fonemas por fotograma de 5 ms con tres cabezas (tokens locales, grupos foneticos y tono).
- Refinamiento de fronteras a precision subfotograma mediante cruce de posteriores adyacentes.
- Codificacion de audio: `encode(wav)` devuelve los log-posteriores por fotograma de las tres cabezas.
- Soporte multilingue dentro del grupo bramico (hindi, oriya, tamil), con posibles extensiones a otros miembros del grupo mediante el mapeo de standard_g2p.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Anotacion fonetica de corpus de habla india: dado un audio y su transcripcion fonetica generada con standard_g2p, el modelo produce marcas temporales por fonema utiles para construir corpus alineados para entrenar sistemas TTS o ASR.
- Entrenamiento de modelos TTS: las fronteras por fonema permiten extraer duraciones reales de cada unidad para modelos de sintesis estadistica o neuronal que necesiten prediccion de duracion.
- Verificacion de pronunciacion: comparando la secuencia de fonemas esperada con las posteriores del modelo se pueden detectar desviaciones en la pronunciacion de un hablante.
- Preprocesado en pipelines de ASR: el alineamiento forzado sirve para segmentar audio largo en unidades foneticas antes de un reconocedor o para forzar restricciones lexicas.
- Investigacion linguistica: analisis de duraciones y fronteras foneticas en hindi, oriya y tamil con resolucion de 5 ms.
- Transferencia a nuevas lenguas del grupo bramico: reutilizando el tronco y la cabeza `phg` compartida para entrenar una nueva cabeza `ph` con `reset_fine_heads: true`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `val_loss` | 3,5548 |
| `val_frame_acc` | 0,2727 |
| `val_frame_acc_groups` | 0,4633 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni equivalentes de alineamiento) en la informacion disponible. Las metricas anteriores son de validacion interna sobre FLEURS y miden autoconsistencia frente a los propios alineamientos del modelo, no precision de fronteras.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32 (14,76 M de parametros, aproximadamente 59 MB de pesos); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4090 o incluso en CPU para clips cortos.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: el codigo oficial esta en el repositorio `p4mbfa/` de GitHub (clase `MbfaAligner`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mbfa-brahmic | 14,76 M | 120 ms por fotograma | hi, or, ta | AGPL-3.0 | CNN sin contexto, alineamiento forzado |
| CUPE / p3cupe (predecesor) | no disponible | no disponible | no disponible | no disponible | Antecesor de la familia p4mbfa |
| Montreal Forced Aligner | no disponible | no disponible | multiple | no disponible | Alineador clasico basado en GMM-HMM, no comparable en parametros |
| Wav2Vec2 Forced Aligner | no disponible | no disponible | multiple | no disponible | Alineador basado en modelo acustico grande, requiere mas recursos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Las metricas de validacion miden autoconsistencia, no precision de fronteras: no hay etiquetas de frontera fuera del ingles.
- Las etiquetas de entrenamiento son pronunciaciones de diccionario (standard_g2p), no transcripciones de lo realmente pronunciado; el modelo puede alinear contra una pronunciacion canonica aunque el hablante se desvie.
- Solo se ha entrenado y probado en hindi, oriya y tamil; el soporte de otros miembros del grupo bramico es teorico y no verificado.
- La cabeza `tone` esta presente pero no entrenada en este modelo.
- El contexto maximo de 120 ms impide modelar dependencias acusticas largas; es una decision de diseno, no un fallo, pero limita su uso como modelo acustico general.
- Licencia AGPL-3.0: el uso comercial exige cumplir las obligaciones de copyleft de la AGPL, lo que puede ser restrictivo para productos propietarios.
- El checkpoint de entrenamiento es un pickle de PyTorch Lightning; solo debe cargarse si se confia en el repositorio.
- Riesgo de alucinacion en el sentido de asignar fonemas a segmentos de audio sin correspondencia real cuando la secuencia de fonemas proporcionada no coincide con el audio.
- No se documentan sesgos especificos, pero el entrenamiento con FLEURS limita la diversidad de hablantes, acentos y condiciones de grabacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tabahi/mbfa-brahmic
- Codigo de inferencia y entrenamiento: https://github.com/tabahi/bfa_models
- Libreria standard_g2p: https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
