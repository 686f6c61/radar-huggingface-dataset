# Tabahi/mbfa-other-alphabetic

## Resumen

mbfa-other-alphabetic es un codificador de fonemas y alineador forzado basado en una CNN sin contexto, desarrollado por el autor de HuggingFace «Tabahi» dentro del proyecto p4mbfa (sucesor de CUPE / p3cupe). No es un modelo generativo ni un LLM: recibe audio mono a 16 kHz y una secuencia conocida de fonemas, y devuelve los límites temporales de cada fonema. Cada fotograma de 5 ms se clasifica usando como máximo 120 ms de audio (campo receptivo de 38,9 ms), de modo que el modelo no puede aprender la fonotáctica de ningún idioma; los límites se obtienen con un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida y se refinan a precisión sub-fotograma en el cruce de posteriores vecinas.

El modelo cubre el grupo lingüístico «other_alphabetic» de standard_g2p y se ha entrenado con las 39,8 horas de FLEURS para amárico, griego, armenio, georgiano y coreano. Con 14,77 millones de parámetros y un repositorio de 0,1 GB, es un componente ligero pensado para integrarse en pipelines de anotación fonética y de preparación de corpus, no para inferencia de propósito general.

Su relevancia es doble: por un lado, ofrece alineación forzada multilingüe para cinco idiomas con poca cobertura comercial de herramientas de alineación; por otro, su diseño agnóstico al contexto y su tronco compartido (reutilizable para nuevos grupos lingüísticos mediante fine-tuning) lo convierten en una pieza reutilizable dentro de una familia de modelos. La contrapartida es que las métricas publicadas miden autoconsistencia, no precisión real de fronteras, y que el proyecto tiene cero descargas y cero «likes» en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free) para clasificación de fonemas por fotograma + decodificador de Viterbi segmental para alineación forzada (familia p4mbfa, sucesora de CUPE / p3cupe) |
| Parámetros totales | 14.768.589 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de 120 ms de audio por fotograma, con campo receptivo de 38,9 ms y salto de 5 ms |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors, presumiblemente en fp32) |
| Idiomas soportados | am (amárico), el (griego), hy (armenio), ka (georgiano), ko (coreano); otros miembros del grupo «other_alphabetic» de standard_g2p podrían alinearse, según el autor, sin probar |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`) para inferencia; checkpoint de PyTorch Lightning en pickle (`.ckpt`) para reentrenamiento |

Otros datos técnicos: cabecera `ph` con 104 etiquetas locales del grupo (incluye `<blank>`, `SIL`, `noise`, `<unk>`), cabecera `phg` con 15 grupos fonéticos de oro compartidos por todos los grupos lingüísticos y cabecera `tone` con 22 valores de tono compartidos pero no entrenada (ningún idioma de este grupo tiene capa tonal). Inventario de referencia: `9438371ed6dd`.

## Arquitectura y entrenamiento

La arquitectura es una CNN sin contexto que clasifica cada fotograma de 5 ms a partir de un máximo de 120 ms de audio, con un campo receptivo efectivo de 38,9 ms. Esta restricción es deliberada: al no poder observar más de ~120 ms, el modelo no puede aprender patrones fonotácticos específicos de cada idioma y se ve forzado a basarse en evidencia acústica local. La alineación se resuelve con un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida (procedente de un diccionario G2P, no de una transcripción de lo realmente pronunciado) y se refina a resolución sub-fotograma en el cruce de posteriores adyacentes. La inferencia expone tres salidas: `align()` para segmentos con `start_ms`/`end_ms` y `encode()` para los log-posteriores por fotograma de las tres cabeceras.

El entrenamiento usó las 39,8 h completas de FLEURS «other_alphabetic» con `noise_level` 0.02. El checkpoint publicado corresponde al experimento `mo01b`, época 3, seleccionado por `val_loss` sobre FLEURS entre 20 épocas (la última época quedó en 2.841). El tronco y la cabecera `phg` provienen de `ma02a` (latín, época final); las cabeceras `ph` y `tone` se entrenaron desde cero en `mo01a` con `onset bonus` 30 y continuaron en `mo01b` con `boundary_bonus_weight` 0, valor que `config.json` mantiene como decodificador por defecto. Las etiquetas de entrenamiento son las pronunciaciones del diccionario standard_g2p, no transcripciones fonéticas de lo emitido. El autor advierte que no existen etiquetas de fronteras fuera del inglés, por lo que las métricas de validación miden autoconsistencia respecto a las propias alineaciones del modelo.

## Capacidades

- Clasificación de fonemas por fotograma cada 5 ms sobre 104 etiquetas locales del grupo «other_alphabetic».
- Predicción de 15 grupos fonéticos de oro (`phg`) compartidos entre todos los grupos lingüísticos de la familia.
- Alineación forzada: dada una secuencia de fonemas conocida, devuelve inicio y fin en milisegundos de cada token (`SIL`, `h`, `ɛ`, `l`, `o`, `SIL`, etc.).
- Refinamiento de fronteras a precisión sub-fotograma mediante el cruce de posteriores vecinas.
- Extracción de log-posteriores por fotograma para las tres cabeceras vía `encode()`, útil para análisis y umbrales propios.
- Capacidad multilingüe limitada a cinco idiomas (am, el, hy, ka, ko) y, potencialmente, al resto de miembros del mismo grupo G2P.
- Entrada de audio mono a 16 kHz mediante `load_audio()`.
- No soporta tool calling ni function calling, no ejecuta agentes ni razonamiento multi-paso, no genera texto, no hace ASR ni traducción, y no procesa visión ni audio más allá de la clasificación acústica descrita.

## Casos de uso

- Anotación de corpus de habla para amárico, griego, armenio, georgiano y coreano: partiendo de la transcripción y aplicando `goldG2P.phonemize_sentence` seguido de `lang_group_inventory.to_local`, el modelo devuelve los límites de cada fonema y permite generar corpus fonéticamente alineados sin anotación manual.
- Preparación de datos para TTS multilingüe: la alineación a nivel de fonema con resolución de milisegundos permite extraer duraciones por fonema para entrenar modelos de síntesis en idiomas con pocos recursos.
- Evaluación de pronunciación (CAPT): los log-posteriores por fotograma y los límites sub-fotograma permiten comparar la realización del alumno con la secuencia esperada y detectar sustituciones, omisiones y duraciones anómalas.
- Investigación fonética cuantitativa: al ser un modelo sin contexto, las duraciones medidas no están sesgadas por predictores lingüísticos, lo que resulta adecuado para estudios de cantidad vocálica (griego), oposición de eyectivas/glotalizadas (amárico, armenio) o estructura silábica (coreano, georgiano).
- Segmentación y troceado de audio en pipelines de ASR o keyword spotting: la alineación forzada permite recortar exactamente la región que contiene una palabra o fonema objetivo antes de pasarla a otro modelo.
- Detección de términos hablados (spoken term detection) basada en fonemas: convirtiendo una consulta de texto a la secuencia de fonemas del grupo, se puede localizar su aparición en un archivo largo mediante la decodificación segmental.
- Transferencia a un nuevo grupo lingüístico: el checkpoint `.ckpt` permite reutilizar el tronco y la cabecera `phg` compartida para entrenar un grupo nuevo, activando `reset_fine_heads: true` para reconstruir `ph_head` y `tone_head`.
- Sincronización fina de subtítulos o karaoke en contenido TTS: los límites por fonema permiten resaltar texto a nivel sub-palabra en aplicaciones de aprendizaje de idiomas.

## Benchmarks y rendimiento

Métricas publicadas por el autor en la model card:

| Métrica | Valor |
|---|---|
| `val_loss` | 2,6278 |
| `val_frame_acc` | 0,4589 |
| `val_frame_acc_groups` | 0,6319 |
| Época seleccionada | 3 (de 20) |
| `val_loss` de la época final | 2,841 |
| Datos de entrenamiento | 39,8 h de FLEURS «other_alphabetic» |

Advertencia explícita del autor: los valores `val_*` se calculan sobre clips reservados de FLEURS pero puntuados contra las propias alineaciones del modelo, ya que no existen etiquetas de fronteras fuera del inglés; por tanto miden autoconsistencia, no precisión de fronteras. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un LLM ni realiza tareas de ese tipo.

## Requisitos de hardware

- VRAM estimada: unos 59 MB en fp32 y unos 30 MB en fp16 para los 14,77 millones de parámetros, sin contar activaciones; el repositorio completo ocupa 0,1 GB (incluye el checkpoint de entrenamiento).
- Cabe holgadamente en CPU: es viable ejecutar la inferencia en un solo núcleo para clips cortos, sin GPU.
- GPU recomendadas: cualquiera con suficiente memoria para el lote, incluso integradas; una RTX 4090 o una A100 están sobredimensionadas para este modelo y solo se justifican si se procesan grandes lotes en paralelo o se reentrena.
- Despliegue: el código oficial está en el repositorio `tabahi/bfa_models` (carpeta `p4mbfa/`), con la clase `MbfaAligner` y `from_pretrained` descargando únicamente `config.json` y `model.safetensors`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo; tampoco se documenta exportación a ONNX o TorchScript.
- Latencia y throughput: no se han publicado medidas. Como referencia estructural, el salto entre fotogramas es de 5 ms y el campo receptivo de 38,9 ms, pero no hay cifras de rendimiento verificadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mbfa-other-alphabetic | CNN sin contexto + Viterbi segmental | 14,77 M | am, el, hy, ka, ko | AGPL-3.0 | HuggingFace + GitHub |
| p3cupe (CUPE, predecesor del mismo autor) | Alineador forzado de la familia CUPE | no disponible | no disponible | no disponible | repositorio del autor (referenciado en la model card) |
| standard_g2p / CharsiuG2P | Herramienta G2P y de inventarios fonéticos, no alineador | no disponible | multilingüe (inventario de oro `9438371ed6dd`) | no disponible | GitHub `tabahi/CharsiuG2P` |
| Montreal Forced Aligner (MFA) | Alineador forzado GMM-HMM sobre Kaldi | no disponible | multilingüe con diccionarios y modelos acústicos por idioma | no disponible | distribución independiente, no verificada en esta búsqueda |

La comparación cuantitativa con alternativas no es posible con la información disponible: ni p3cupe, ni CharsiuG2P, ni MFA publican en esta ficha cifras de parámetros o resultados equiparables. La diferencia conceptual es que mbfa-other-alphabetic restringe deliberadamente el campo receptivo a 38,9 ms para impedir el aprendizaje de fonotáctica, mientras que los alineadores HMM clásicos modelan explícitamente contexto y estados.

## Limitaciones y advertencias

- Las métricas de validación miden autoconsistencia frente a las propias alineaciones del modelo, no precisión de fronteras: no hay etiquetas de fronteras fuera del inglés.
- El modelo no transcribe: requiere la secuencia de fonemas de entrada. No es un ASR y fallará si la secuencia proporcionada no se corresponde con el audio.
- Las etiquetas de entrenamiento son pronunciaciones de diccionario (standard_g2p), no transcripciones fonéticas de lo realmente emitido; esto introduce desajustes en habla con reducción fonética o variación dialectal.
- La cabecera `tone` (22 etiquetas) está presente pero no entrenada; no debe usarse para idiomas tonales sin reentrenamiento.
- Cobertura limitada a cinco idiomas entrenados y 39,8 h de audio; el propio autor indica que otros miembros del grupo «other_alphabetic» podrían alinearse «sin probar».
- El diseño sin contexto impide explotar la fonotáctica: en fronteras ambiguas o segmentos muy cortos la evidencia acústica local puede ser insuficiente.
- Licencia AGPL-3.0: es copyleft fuerte. Integrar el modelo en un servicio de red puede obligar a liberar el código de la aplicación bajo la misma licencia; conviene revisión legal antes de uso comercial.
- El checkpoint de entrenamiento `.ckpt` es un pickle de PyTorch Lightning: cargarlo ejecuta código arbitrario, y el autor advierte explícitamente que solo se cargue si se confía en el repositorio.
- Estado del proyecto: cero descargas y cero «likes» en el momento de la ficha, creado y actualizado el 27 de octubre de 2026; no hay pipeline declarado en HuggingFace ni histórico de mantenimiento.
- No hay cuantizaciones publicadas ni guía de despliegue en producción (exportación, batching, servidor de inferencia).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tabahi/mbfa-other-alphabetic
- Código de inferencia y entrenamiento (p4mbfa): https://github.com/tabahi/bfa_models
- standard_g2p / CharsiuG2P (inventarios y G2P): https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
- Resultados de búsqueda web: no se ha encontrado ningún enlace adicional relevante sobre este modelo; los resultados devueltos corresponden a foros sin relación con el proyecto.
