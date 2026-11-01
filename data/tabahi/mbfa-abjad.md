# Tabahi/mbfa-abjad

## Resumen

mbfa-abjad es un codificador de fonemas y alineador forzado basado en una CNN sin contexto, desarrollado por Tabahi como sucesor de CUPE (p3cupe). Forma parte del proyecto p4mbfa y está especializado en el grupo de lenguas "abjad" del inventario standard_g2p. El modelo clasifica cada fotograma de 5 ms a partir de un máximo de 120 ms de audio (campo receptivo de 38,9 ms), lo que por diseño le impide aprender la fonotáctica de ninguna lengua concreta. Los límites entre fonemas se obtienen mediante un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida, refinado a precisión sub-fotograma en el cruce de posteriores vecinos.

Con 14,75 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para alineación forzada y reconocimiento de fonemas en árabe (ar), kurdo sorani (ckb), persa (fa), sindhi (sd) y urdu (ur). Se entrenó sobre las 38,2 horas del subconjunto abjad de FLEURS. Su relevancia radica en que ofrece una alternativa ligera y multilingüe para tareas de segmentación fonética donde no existen etiquetas de frontera fuera del inglés, y en que su arquitectura sin contexto evita sesgos fonotácticos específicos de una lengua.

La licencia es AGPL-3.0, lo que condiciona su uso en productos de código cerrado. El modelo se distribuye en formato safetensors junto con un checkpoint de entrenamiento en PyTorch Lightning (pickle) para continuar el entrenamiento o adaptar nuevos grupos de lenguas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free), sucesora de CUPE / p3cupe |
| Parámetros totales | 14.754.239 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 120 ms por fotograma (campo receptivo de 38,9 ms), fotogramas de 5 ms |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ar, ckb, fa, sd, ur |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (modelo); checkpoint de entrenamiento en PyTorch Lightning (pickle) |

## Arquitectura y entrenamiento

El modelo es una CNN sin contexto que procesa audio a 16 kHz y clasifica cada fotograma de 5 ms usando como máximo 120 ms de audio, con un campo receptivo efectivo de 38,9 ms. Dispone de tres cabezas: `ph` (90 etiquetas: tokens locales del grupo abjad, incluyendo `<blank>`, `SIL`, `noise` y `<unk>`), `phg` (15 grupos fonéticos gold compartidos por todos los grupos de lenguas) y `tone` (22 valores de tono, compartidos, presentes pero no entrenados porque ninguna lengua de este grupo tiene capa tonal). La segmentación se realiza con un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida, refinado a precisión sub-fotograma en el cruce de posteriores adyacentes.

El entrenamiento usó las 38,2 horas completas del subconjunto abjad de FLEURS con un `noise_level` de 0,02. El checkpoint corresponde al experimento `mp01a`, época 5, seleccionado por `val_loss` sobre FLEURS (mejor de 20 épocas; la época final registró 2,988). El tronco y la cabeza `phg` provienen de latin ma02a (época final), mientras que las cabezas `ph` y `tone` se entrenaron desde cero. Las etiquetas son pronunciaciones de diccionario de standard_g2p (inventario gold `9438371ed6dd`), no transcripciones fonéticas de lo pronunciado. Métricas reportadas: `val_loss` 2,8549, `val_frame_acc` 0,4126 y `val_frame_acc_groups` 0,5149; estas métricas se calculan sobre clips de validación de FLEURS pero contra las propias alineaciones del modelo, por lo que miden autoconsistencia y no precisión de fronteras.

## Capacidades

- Reconocimiento de fonemas a nivel de fotograma (clasificación en 90 etiquetas locales del grupo abjad).
- Alineación forzada de una secuencia de fonemas conocida sobre audio, con fronteras refinadas a precisión sub-fotograma.
- Segmentación fonética mediante decodificador de Viterbi segmental.
- Clasificación en 15 grupos fonéticos gold compartidos entre grupos de lenguas (cabeza `phg`).
- Codificación de audio en log-posteriores por fotograma para las tres cabezas (`aligner.encode(wav)`).
- Soporte multilingüe para ar, ckb, fa, sd y ur; otros miembros del grupo abjad podrían alinearse, aunque no se han probado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.

## Casos de uso

- Alineación forzada para corpus de habla: dado un audio y su transcripción fonémica generada con standard_g2p, el modelo devuelve los tiempos de inicio y fin de cada fonema, lo que permite construir corpus alineados para entrenar sistemas TTS o ASR en árabe, persa, urdu, sindhi o kurdo sorani.
- Anotación fonética de corpus lingüísticos: investigadores pueden obtener segmentaciones a nivel de fonema sobre grabaciones de FLEURS u otras fuentes, con la ventaja de que la CNN sin contexto no impone fonotáctica de ninguna lengua.
- Evaluación de pronunciación: al alinear la secuencia esperada contra el audio real, las desviaciones en las posteriores permiten detectar realizaciones anómalas o sustituciones en herramientas de aprendizaje de lenguas.
- Preprocesado para pipelines de TTS: la segmentación precisa a sub-fotograma facilita la extracción de unidades acústicas alineadas con fonemas para el entrenamiento de modelos de síntesis en las lenguas del grupo abjad.
- Investigación en fonética computacional: la cabeza `phg` de 15 grupos gold compartida entre lenguas permite comparar realizaciones entre idiomas del mismo grupo con un inventario común.
- Base para adaptación a nuevas lenguas: el tronco y la cabeza `phg` compartida pueden reutilizarse para entrenar un nuevo grupo de lenguas con `reset_fine_heads: true`, reconstruyendo las cabezas `ph` y `tone`.
- Búsqueda por unidades fonéticas en archivos de audio: la alineación fonema a fonema habilita indexar y recuperar fragmentos de audio por su contenido fonémico.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de validación del propio autor, que miden autoconsistencia y no precisión de fronteras:

| Métrica | Valor |
|---|---|
| `val_loss` | 2,8549 |
| `val_frame_acc` | 0,4126 |
| `val_frame_acc_groups` | 0,5149 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de alineación) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 14,75 millones de parámetros en precisión completa (aproximadamente 59 MB en fp32); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Cabe holgadamente en RTX 4090, RTX 3090, RTX 3060 o incluso en CPU para clips cortos.
- Cabe en cualquier GPU consumer y previsiblemente en inferencia en CPU sin problemas de memoria.
- Opciones de despliegue: el código oficial está en el repositorio `p4mbfa/` de GitHub (clase `MbfaAligner`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mbfa-abjad | 14,75 M | 120 ms por fotograma (campo receptivo 38,9 ms) | ar, ckb, fa, sd, ur | AGPL-3.0 | HuggingFace (Tabahi/mbfa-abjad) |
| CUPE / p3cupe (predecesor) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de alineación forzada (Montreal Forced Aligner, MFA) | no disponible | no disponible | multilingüe (depende de diccionarios) | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre mbfa-abjad y sus alternativas en la información proporcionada.

## Limitaciones y advertencias

- Las métricas `val_*` se calculan contra las propias alineaciones del modelo, por lo que miden autoconsistencia y no precisión real de fronteras; no hay etiquetas de frontera fuera del inglés.
- Las etiquetas de entrenamiento son pronunciaciones de diccionario de standard_g2p, no transcripciones fonéticas de lo realmente pronunciado; esto puede introducir desajustes en habla espontánea o con variación dialectal.
- La cabeza `tone` está presente pero no entrenada, ya que ninguna lengua del grupo tiene capa tonal; no debe usarse para lenguas tonales.
- Solo se ha entrenado y probado en ar, ckb, fa, sd y ur; otros miembros del grupo abjad podrían alinearse, pero no se han probado.
- El modelo no genera texto ni realiza tareas de razonamiento, código o matemáticas; su alcance se limita a fonética y alineación.
- La licencia AGPL-3.0 impone obligaciones de copyleft que pueden ser incompatibles con productos de código cerrado o servicios comerciales sin liberar el código.
- El checkpoint de entrenamiento es un pickle de PyTorch Lightning; solo debe cargarse si se confía en el repositorio, por el riesgo de ejecución de código arbitrario.
- Riesgo de alucinación en el sentido de asignar fonemas incorrectos cuando la secuencia esperada no coincide con el audio o cuando hay ruido; el `noise_level` de entrenamiento fue bajo (0,02).
- No se documentan sesgos específicos por lengua o dialecto, pero al entrenarse solo con FLEURS puede presentar peor rendimiento en variedades no representadas.

## Enlaces

- HuggingFace: https://huggingface.co/Tabahi/mbfa-abjad
- Repositorio de código: https://github.com/tabahi/bfa_models (`p4mbfa/`)
- standard_g2p / CharsiuG2P: https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
