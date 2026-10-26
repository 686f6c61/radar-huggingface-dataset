# vanshnawander/sapc2-moonshine-m2s

## Resumen

`sapc2-moonshine-m2s` es un modelo de reconocimiento automático del habla (ASR) en inglés de apenas 2.025.120 parámetros, desarrollado por el usuario de Hugging Face `vanshnawander` como parte de la "escalera de compresión" (compression ladder) para el Speech Accessibility Project Challenge 2 (SAPC2). El modelo parte de la familia Moonshine (arquitectura sequence-to-sequence encoder-decoder, publicada originalmente por moonshine-ai en octubre de 2024) y se ha afinado específicamente sobre habla disártrica de personas con ELA, parálisis cerebral, síndrome de Down, enfermedad de Parkinson y secuelas de ictus, un dominio donde los ASR convencionales fallan de forma sistemática.

El problema que aborda es la accesibilidad: la transcripción de habla atípica o degradada, con inteligibilidad reducida, ritmo alterado y disfluencias. El modelo se entrena mediante destilación de conocimiento desde un profesor mayor (`m15s2`) con un peso de KD de 0,5, en una sola época sobre datos balanceados por etiología, y se evalúa contra las referencias oficiales del challenge. Es relevante ahora porque documenta de forma inusualmente transparente el comportamiento de un modelo extremadamente pequeño en un dominio difícil: publica curvas de WER por paso, desglose por duración y por etiología, y análisis cualitativo de fallos.

Conviene ser explícito: con un WER del 88,37% en el conjunto Dev completo, este modelo no es una herramienta de transcripción utilizable en producción. Es un artefacto de investigación para estudiar los límites de la compresión y la destilación en ASR de bajo coste. Su licencia MIT y su tamaño (menos de 10 MB en FP32) lo hacen útil como baseline reproducible y como banco de pruebas de pipelines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder sequence-to-sequence de la familia Moonshine (estudiante destilado) |
| Parametros totales | 2.025.120 (aproximadamente 2,0 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; en evaluación se decodifican grabaciones completas con ventanas de hasta 200 s |
| Tipos de cuantizacion | No disponible (no se han publicado variantes cuantizadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder seq2seq del linaje Moonshine, la familia de ASR de baja latencia de moonshine-ai, reducida hasta los 2,0 M de parámetros. El modelo se inicializa desde un checkpoint intermedio denominado `m2s_cut_from_m3g`, es decir, un recorte del estudiante de 3 M de parámetros de la misma escalera, y se afina con destilación de conocimiento desde un profesor de 15 M (`m15s2/best`) con `kd_weight = 0.5`. El entrenamiento consiste en una única época con `peak_lr = 5e-05`, muestreo balanceado por etiología con un máximo de 2 repeticiones por ítem (`balance_max_repeats = 2`) y una política de empaquetado con `max_items = 768`, `padded_seconds = 4608`, `attention_cost = 60000` y `decoder_tokens = 98304`, lo que sugiere un currículo de longitud y un control explícito del coste atencional y del presupuesto de tokens del decodificador.

Los datos proceden del corpus del Speech Accessibility Project Challenge 2, con grabaciones en inglés de hablantes con ELA (10.232 en Dev), parálisis cerebral (11.472), síndrome de Down (7.719), Parkinson (14.543) y ictus (3.963). El conjunto Dev completo contiene 47.929 grabaciones. No se documenta en la información disponible el número total de tokens de audio de entrenamiento ni el uso de RLHF o DPO; el procedimiento descrito es puramente supervisado más destilación. Como innovación destacable, el autor publica la receta de entrenamiento en JSON y el análisis de errores completo en el repositorio del proyecto, algo poco habitual en modelos de este tamaño.

## Capacidades

- Transcripción de voz a texto en inglés (`automatic-speech-recognition`), orientada específicamente a habla disártrica.
- Funcionamiento con ventanas de audio largas: la evaluación del Dev completo decodifica grabaciones completas con ventanas de hasta 200 s.
- Inferencia muy ligera: 2,0 M de parámetros, ejecutable en GPU de gama de entrada (el autor reporta 10 minutos para 47.929 grabaciones en una RTX 4050).
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, visión o audio generativo: no disponibles; el modelo es exclusivamente ASR.
- Multilingüismo: no. Solo inglés.
- No dispone de modo "thinking" ni de salida estructurada documentada.

## Casos de uso

- Baseline de investigación en compresión de ASR: sirve como punto de referencia inferior de la escalera (m15s → m5g → m3g → m2s) para medir cuánta calidad se pierde al recortar parámetros en un dominio disártrico, comparando su 88,37% de WER con los modelos mayores de la misma familia.
- Estudio de destilación de conocimiento en dominios de baja inteligibilidad: su receta pública (KD con peso 0,5, una época, muestreo balanceado) permite reproducir y modificar el pipeline para investigar qué componentes contribuyen al rendimiento en habla atípica.
- Análisis de fallos y degeneración de decodificadores: el modelo genera transcripciones desbocadas en el 47,79% de los errores (4.976 hipótesis con longitud superior a 1,5 veces la referencia), lo que lo convierte en un caso de estudio útil sobre repetición y colapso en decodificadores pequeños.
- Pruebas de humo y validación de pipelines de datos: al procesar 47.929 grabaciones en 10 minutos en una RTX 4050 (aproximadamente 80 grabaciones por segundo, cálculo derivado del dato publicado), permite verificar maquetado de audio, normalización de texto y esquemas de evaluación antes de lanzar modelos grandes.
- Investigación sobre sesgo por etiología: los desgloses publicados (WER del 81,76% en ictus frente al 90,62% en Parkinson) permiten estudiar cómo varía el rendimiento según la condición del hablante y diseñar estrategias de balanceo.
- Docencia y divulgación sobre límites del ASR: sirve para ilustrar de forma tangible por qué el habla disártrica requiere modelos y datos específicos, mostrando ejemplos reales de hipótesis erróneas y su tipología (sustituciones 62,89%, deleciones 18,51% de las palabras de referencia).
- Despliegue en entornos con restricciones extremas de memoria: con pesos del orden de 8 MB en FP32, es viable ejecutarlo en CPU o en microcontroladores para experimentos de viabilidad, siempre que no se espere calidad de transcripción utilizable.

## Benchmarks y rendimiento

Evaluación en Dev-1000 (subconjunto fijo de 1.000 grabaciones del Dev oficial, normalizador de la competición, mejor de las dos referencias):

| Paso | WER (%) | CER (%) |
|---:|---:|---:|
| 0 | 100,00 | 98,97 |
| 200 | 94,92 | 86,24 |
| 400 | 92,17 | 81,39 |
| 600 | 90,48 | 79,29 |
| 800 | 90,20 | 79,87 |
| 1000 | 88,97 | 77,94 |
| 1200 | 89,00 | 77,51 |
| 1300 (mejor) | 88,47 | 76,23 |
| 1332 (final) | 88,56 | 77,70 |

Dev completo (47.929 grabaciones, decodificación greedy, ventanas de 200 s, scorer rápido):

| Decodificacion | WER (%) | CER (%) | Vacias | Capadas | Tiempo |
|---|---:|---:|---:|---:|---|
| greedy | 88,37 | 76,86 | 85 | 466 | 10 min en RTX 4050 |

Composición de errores en greedy: transcripciones exactas 6,86%; sustituciones 62,89%, deleciones 18,51% e inserciones 45,51% de las palabras de referencia (WER sin capar 126,91%).

WER por duración del audio:

| Duracion | Grabaciones | WER (%) | Cuota de errores (%) |
|---|---:|---:|---:|
| 1-2 s | 670 | 75,84 | 0,28 |
| 2-3 s | 4.354 | 74,44 | 2,41 |
| 3-5 s | 14.700 | 76,65 | 10,59 |
| 5-8 s | 14.739 | 82,68 | 15,98 |
| 8-12 s | 7.023 | 88,70 | 11,84 |
| 12-20 s | 3.867 | 92,98 | 12,35 |
| 20-35 s | 1.657 | 97,26 | 18,25 |
| >35 s | 919 | 99,31 | 28,29 |

WER por etiología:

| Etiologia | Grabaciones | WER (%) | Cuota de errores (%) |
|---|---:|---:|---:|
| ELA | 10.232 | 88,61 | 22,52 |
| Paralisis cerebral | 11.472 | 87,66 | 17,64 |
| Sindrome de Down | 7.719 | 84,85 | 9,49 |
| Parkinson | 14.543 | 90,62 | 46,23 |
| Ictus | 3.963 | 81,76 | 4,12 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech) en la información disponible, ni comparaciones numéricas con modelos de referencia del propio challenge.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 MB para los pesos en FP32 y alrededor de 4 MB en FP16, más activaciones y buffers de audio; en la práctica, menos de 100 MB de memoria total.
- GPU recomendadas: cualquier GPU es sobredimensionada; el autor reporta el Dev completo (47.929 grabaciones) en 10 minutos sobre una RTX 4050 de portátil. A100, H100 o RTX 4090 no aportan ventaja práctica por el cuello de botella de overhead.
- Cabe holgadamente en GPU de consumo (RTX 4050, RTX 3060, GTX 1650) y también en CPU, dado el reducido tamaño.
- Opciones de despliegue: `transformers` con el pipeline `automatic-speech-recognition`; el modelo está marcado como `endpoints_compatible`. No se han publicado pesos GGUF ni soporte verificado para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: derivados del dato publicado, aproximadamente 80 grabaciones por segundo en RTX 4050 para el Dev completo; no se han publicado cifras de latencia por segmento ni de RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sapc2-moonshine-m2s | 2,03 M | Ventanas de hasta 200 s en evaluación | 88,37% (Dev SAPC2) | MIT | Hugging Face |
| sapc2-moonshine-m5g | 5,6 M (ancho 192, 5 cabezas, destilado de m15s) | No disponible | No disponible | No disponible | Hugging Face |
| sapc2-moonshine-tiny-rl | 27 M (Moonshine Tiny, SFT + RL) | No disponible | No disponible | No disponible | Hugging Face |
| Moonshine (original, moonshine-ai) | 27 M (tiny) y 61 M (base) | No disponible | No disponible en la información consultada | No disponible en la información consultada | Hugging Face / GitHub |

La comparación numérica de calidad no es posible con los datos disponibles: los modelos hermanos de la escalera SAPC2 no publican métricas en la información consultada, y los Moonshine originales se evalúan sobre habla no disártrica, por lo que sus cifras no serían directamente comparables.

## Limitaciones y advertencias

- Calidad absoluta muy baja: 88,37% de WER y 76,86% de CER en Dev completo implican que solo el 6,86% de las transcripciones son exactas. No es apto para transcripción de usuario final ni para producción.
- Degeneración del decodificador: 4.976 hipótesis (47,79% de todos los errores) superan en 1,5 veces la longitud de la referencia, con casos de repetición en bucle ("i would be a bigny and i would be a bigny..."). Requiere detección y truncado de salidas desbocadas.
- 85 transcripciones vacías y 466 salidas capadas en el Dev completo, además de 4.559 transcripciones truncadas, lo que obliga a gestionar casos degenerados en cualquier integración.
- Peor rendimiento en grabaciones largas: el WER sube del 74,44% en audios de 2-3 s al 99,31% en audios de más de 35 s, que concentran el 28,29% de los errores.
- Sesgo por etiología documentado: peor WER en Parkinson (90,62%) y ELA (88,61%) que en ictus (81,76%), con Parkinson concentrando el 46,23% de todos los errores.
- Solo inglés. No hay soporte multilingüe ni de otras variantes dialectales documentado.
- Dominio restringido: entrenado sobre el corpus SAPC2; no hay evidencia de comportamiento sobre habla típica, ruido ambiental, acentos no representados o audio telefónico.
- Licencia MIT, que permite uso comercial y modificación, pero sin garantías; el modelo se distribuye como artefacto de investigación y su uso comercial sería técnicamente inviable por la calidad.
- Las métricas se han calculado con el normalizador de la competición y el "mejor de dos referencias", lo que no es directamente comparable con cifras de WER estándar de la literatura.
- No se han publicado variantes cuantizadas ni pesos GGUF, lo que limita el despliegue en herramientas que no sean `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/sapc2-moonshine-m2s
- Modelo hermano m5g (5,6 M): https://huggingface.co/vanshnawander/sapc2-moonshine-m5g
- Modelo hermano tiny-rl (27 M, SFT + RL): https://huggingface.co/vanshnawander/sapc2-moonshine-tiny-rl
- Repositorio de Moonshine (moonshine-ai): https://github.com/moonshine-ai/moonshine
- Descripción de la familia Moonshine original: https://www.aimodels.fyi/models/huggingFace/moonshine-moonshine-ai
- Ficha de registro de m5g en Free2AITools: https://free2aitools.com/model/vanshnawander/sapc2-moonshine-m5g
- Repositorio del proyecto con el análisis de errores completo (`runs/analysis/ladder_full_dev/m2s_full_beam1/report.md`) y las predicciones en `evaluations/`: URL no disponible en la información proporcionada.
- Paper o blog oficial del Speech Accessibility Project Challenge 2: no disponible en la información proporcionada.
