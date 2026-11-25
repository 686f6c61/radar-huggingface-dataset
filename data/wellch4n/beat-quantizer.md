# wellCh4n/beat-quantizer

## Resumen

BeatQuantizer v2, publicado en Hugging Face como `wellCh4n/beat-quantizer` bajo la clase `BeatQuantizerForRhythm`, es un modelo neuronal especializado en cuantización rítmica de melodías simbólicas. Desarrollado por el usuario wellCh4n, resuelve un problema muy concreto dentro del procesamiento de música simbolica: alinear las duraciones y posiciones temporales de notas vocales o melódicas (expresadas como tiempos de onset y offset en beats o en segundos) sobre una rejilla de partitura de 12 subdivisiones por pulso, que cubre semicorcheas y tresillos. Con 15,01 millones de parámetros y un repositorio de solo 0,1 GB, es un modelo compacto orientado a producción.

Arquitectónicamente combina un transformer Pre-LN de 8 capas con sesgo relativo y un algoritmo de programación dinámica Viterbi monótono, lo que le permite imponer restricciones estructurales de monotonía temporal durante la decodificación. No es un modelo generativo de texto ni un LLM: es un extractor de características y cuantizador de secuencias con una API específica (`quantize_sequence` y `quantize_notes`) expuesta a través de `transformers` con `trust_remote_code=True`.

Su relevancia radica en que sustituye heurísticas de cuantización basadas en reglas por un enfoque aprendido, con una mejora sustancial en la métrica de exactitud rítmica por compás (del 46,38 % al 75,65 % en el benchmark interno) y una latencia de aproximadamente 50 ms por canción completa en CPU. Es útil para pipelines de transcripción, edición de partituras y generación musical simbólica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Pre-LN de 8 capas con sesgo relativo + Viterbi DP monótono |
| Parametros totales | 15.012.619 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no lingüístico, opera sobre música simbólica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 8 capas con normalización Pre-LN y atención con sesgo relativo, diseñado para procesar secuencias de notas simbólicas definidas por `(b_on, b_off, midi)` en coordenadas de beat. Sobre las puntuaciones emitidas por el transformer se aplica un Viterbi de programación dinámica con restricción de monotonía, que garantiza que las posiciones cuantizadas no se reordenen y respeta los límites de desviación configurados (`max_end_dev_grids=4`, `max_end_overhang_grids=4`). La rejilla objetivo tiene 12 subdivisiones por pulso, lo que cubre semicorcheas y tresillos de forma simultánea.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en un modelo de esta naturaleza). El benchmark publicado se evalúa sobre `GTSinger-CN` con 993 clips y 4.094 compases no vistos, lo que sugiere un entrenamiento orientado a canto y melodía monofónica. La innovación técnica destacable es la integración del transformer con el decodificador Viterbi monótono dentro del propio módulo, empaquetado como código personalizado cargable desde `transformers`.

## Capacidades

- Cuantización rítmica de melodías: convierte tiempos continuos de onset y offset en posiciones discretas sobre una rejilla de 12 subdivisiones por pulso.
- Soporte de dos interfaces de entrada: coordenadas de beat directas (`quantize_sequence`) o segundos físicos más `beat_times` (`quantize_notes`), devolviendo fracciones `q_on` y `q_off`.
- Manejo de compases configurables mediante el parámetro `meter` (por ejemplo, `4/4`) y tempo en BPM.
- Salida de posiciones en rejilla entera (`g_on`, `g_off`) lista para exportar a formatos de partitura simbólica.
- Restricciones de monotonía y de desviación máxima integradas en la decodificación.
- Inferencia rápida en CPU (aproximadamente 50 ms por canción completa).
- No soporta tool calling, agentes, visión, audio ni generación de texto: su ámbito es exclusivamente la música simbólica.

## Casos de uso

- Transcripción de canto a partitura: dado un conjunto de notas vocales con tiempos en segundos y una secuencia de `beat_times`, el modelo devuelve posiciones cuantizadas listas para exportar a MusicXML o MIDI, sustituyendo heurísticas de redondeo manual.
- Limpieza rítmica en edición musical: al importar interpretaciones humanas con microdesviaciones, el cuantizador las ajusta a semicorcheas y tresillos sin reordenar notas, gracias al Viterbi monótono.
- Generación musical simbólica condicionada: los modelos generativos de melodía pueden usar BeatQuantizer como post-proceso para garantizar que la salida respete una rejilla métrica coherente antes de renderizar.
- Sincronización de letra y melodía: en pipelines de alineación forzada, las posiciones cuantizadas facilitan el ajuste de sílabas a notas sobre compases regulares.
- Herramientas DAW y plugins: con 15 M de parámetros y ~50 ms por canción en CPU, puede integrarse como efecto de cuantización neuronal en tiempo casi real dentro de un plugin.
- Investigación en music information retrieval: sirve como componente de referencia para comparar cuantizadores aprendidos frente a baselines basados en reglas sobre datasets como GTSinger.
- Preprocesado para entrenamiento de modelos musicales: normaliza datasets de interpretaciones expresivas a una rejilla común antes de alimentar modelos de generación o análisis.

## Benchmarks y rendimiento

Evaluación sobre `GTSinger-CN` (993 clips, 4.094 compases no vistos), según la model card:

| Sistema | Bar Rhythm EM | Strict Onset F1 (tol=0) | Loose Onset F1 (tol=1) | 16th FPR |
|---|---:|---:|---:|---:|
| Rule Baseline | 46,38 % | 82,11 % | 82,27 % | 9,66 % |
| BeatQuantizer v2 (no_char) | 75,65 % | 91,51 % | 91,58 % | 5,77 % |

Velocidad de inferencia declarada: aproximadamente 50 ms por canción completa en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (15 M de parámetros, ~60 MB de pesos) más overhead del runtime; holgadamente por debajo de 2 GB en la práctica.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo está pensado para ejecutarse en CPU. Una RTX 4090 o A100 no aportan ventaja significativa frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer (GTX 1060 en adelante) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~50 ms por canción completa en CPU según el autor; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de cuantización rítmica neuronal en la documentación proporcionada. La única referencia disponible es el baseline basado en reglas incluido en el benchmark del propio autor (46,38 % de Bar Rhythm EM frente al 75,65 % del modelo). Comparativas con otros cuantizadores aprendidos: no disponible.

## Limitaciones y advertencias

- Ámbito muy restringido: solo procesa música simbólica monofónica; no maneja polifonía, audio crudo ni texto.
- El benchmark se limita a `GTSinger-CN`; el rendimiento en otros géneros, culturas musicales o compases distintos de 4/4 no está documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el módulo antes de usarlo en producción.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser un modelo determinista con Viterbi, el riesgo de salidas incoherentes se reduce, pero no hay evaluación pública independiente.
- Sin descargas ni likes en el momento de la consulta: no hay validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni soporte del autor.
- No se especifican límites de longitud de secuencia ni comportamiento con canciones muy largas o tempos extremos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wellCh4n/beat-quantizer
- Dataset de referencia del benchmark (GTSinger): no se incluye enlace en la información disponible.
- Paper, blog o repositorio adicional: no disponible.
