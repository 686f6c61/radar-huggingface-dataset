# thebluescreen/crema-chords-onnx

## Resumen

CREMA chords (ONNX) es una conversión al formato ONNX del modelo estructurado de reconocimiento de acordes de CREMA, presentado originalmente por McFee y Bello en ISMIR 2017. El modelo realiza reconocimiento de acordes a partir de audio: para cada fotograma (frame) devuelve la probabilidad de 170 etiquetas de acorde (12 raíces por 14 calidades, más "no chord" y "unknown chord"), junto con cabeceras independientes para las clases de altura del acorde, su raíz y su nota de bajo. Lo publica el usuario thebluescreen bajo licencia BSD-2-Clause.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un componente especializado de recuperación de información musical (MIR) empaquetado para inferencia con onnxruntime. Su interés práctico reside en que integra el front-end armónico de constant-Q dentro del propio grafo ONNX, lo que elimina la dependencia de Keras/TensorFlow en producción y permite desplegarlo en cualquier runtime compatible con ONNX.

La información disponible es escasa: el repositorio tiene 0 descargas y 0 likes, no se declara pipeline ni idiomas, y no se han publicado benchmarks propios en la model card. El dato más relevante es la validación de equivalencia: según el autor, el modelo coincide con el pipeline Keras original de CREMA en todos los fotogramas de los fixtures de conversión, con diferencias máximas de 2e-5 en las cabeceras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de reconocimiento de acordes de CREMA (McFee y Bello, ISMIR 2017) con front-end armónico de constant-Q integrado en el grafo; detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio `[1, N]` float32 mono a 44,1 kHz, procesada en fotogramas de 4096 muestras (`T = N // 4096`) |
| Tipos de cuantización | no disponible (el repo se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del modelo estructurado de acordes de CREMA. La arquitectura original combina un front-end de constant-Q armónico con una red que produce, de forma estructurada, varias salidas simultáneas: una distribución softmax sobre 170 etiquetas de acorde, una salida sigmoide sobre 12 clases de altura y dos distribuciones softmax de 13 clases (raíz y bajo, con una clase adicional para "sin raíz" o "sin bajo"). En esta conversión, el front-end de constant-Q se ha incorporado dentro del grafo ONNX, de modo que la entrada es directamente audio PCM y no un espectrograma precalculado.

La model card no proporciona información sobre el dataset de entrenamiento, el número de tokens o ejemplos, ni sobre si hubo ajuste fino con preferencias. Sí se documenta un detalle de implementación relevante: el front-end mide los decibelios contra el bin más fuerte de toda la entrada, igual que CREMA, por lo que es necesario pasar el fragmento completo de una vez y no fragmentos parciales, ya que la normalización depende del máximo global del audio de entrada. La conversión la realizaron los scripts de Silly MIDI Tools (carpeta `scripts/crema/`), y la validación reportada indica coincidencia del acorde más probable en todos los fotogramas de los fixtures, con desviaciones máximas de 2e-5 en las cabeceras.

## Capacidades

- Reconocimiento de acordes por fotograma a partir de audio mono a 44,1 kHz.
- Salida de 170 etiquetas de acorde en orden lexicográfico según el label encoder de CREMA (`A#:7`, `A#:aug`, …, `N` para no chord, `X` para acorde desconocido).
- Cabecera separada de clases de altura (`chord_pitch`, 12 clases, activación sigmoide).
- Cabecera de raíz del acorde (`chord_root`, 13 clases, softmax) y de nota de bajo (`chord_bass`, 13 clases, softmax).
- Front-end de constant-Q armónico integrado en el grafo, sin dependencias externas de extracción de características.
- Inferencia portable vía onnxruntime (CPU y, presumiblemente, otros execution providers de ONNX; no documentado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de audio especializado.

## Casos de uso

- Análisis armónico automático de grabaciones: dado un archivo de audio completo, se obtiene la secuencia de acordes por fotograma (resolución aproximada de 93 ms a 44,1 kHz con ventana de 4096 muestras) para análisis musicológico o docencia.
- Generación de tablaturas y partituras simplificadas: la secuencia de raíz y calidad de acorde alimenta directamente un pipeline de notación (MusicXML, LilyPond) para transcripción armónica.
- Etiquetado de datasets musicales: procesamiento por lotes de una colección para anotar acordes y entrenar o evaluar otros sistemas de MIR.
- Sincronización de letras o visualizaciones con la armonía: la salida por fotograma permite alinear cambios de acorde con eventos visuales en directos o vídeos musicales.
- Herramientas de práctica musical: detección de acordes en tiempo casi real (según latencia del runtime) para aplicaciones de acompañamiento o afinación armónica.
- Integración en servicios backend sin TensorFlow: al ser ONNX puro, se puede desplegar en microservicios ligeros con onnxruntime, evitando el peso de Keras/TensorFlow en producción.
- Investigación en MIR: reproducción de los resultados de CREMA (ISMIR 2017) usando una implementación portable y verificable contra el pipeline original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la equivalencia con el pipeline Keras de CREMA en los fixtures de conversión: coincidencia del acorde más probable en todos los fotogramas y diferencias máximas de 2e-5 en las cabeceras. No se aportan métricas sobre datasets estándar de reconocimiento de acordes (por ejemplo, accuracy por fotograma o segmento en Isophonics o RWC).

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del modelo no se documenta y el repositorio ocupa 0,0 GB, lo que sugiere un modelo pequeño, pero no se puede confirmar.
- GPU recomendadas: no disponible. Por el tipo de tarea y el formato ONNX, es probable que funcione en CPU, pero no hay datos publicados sobre rendimiento.
- Compatibilidad con GPU de consumo: no confirmada; no se documentan requisitos.
- Opciones de despliegue: onnxruntime (librería declarada), potencialmente con distintos execution providers de ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Nota operativa: la entrada debe pasarse completa (`[1, N]`), ya que la normalización en decibelios depende del bin más fuerte de toda la señal; el troceado en fragmentos altera la normalización respecto al comportamiento de CREMA.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CREMA chords (ONNX) | Reconocimiento de acordes estructurado | 170 acordes, pitch, raíz, bajo | BSD-2-Clause | ONNX | Conversión del modelo original; front-end constant-Q integrado |
| CREMA original (Keras) | Reconocimiento de acordes estructurado | Mismas cabeceras | Ver repositorio original (no disponible en la información proporcionada) | Keras/TensorFlow | Referencia de la que deriva esta conversión |
| Otros modelos de reconocimiento de acordes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (reconocimiento de acordes); no es un modelo de lenguaje y no debe evaluarse como tal.
- No hay métricas publicadas sobre datasets estándar de MIR; la única validación es la equivalencia numérica con el pipeline Keras en los fixtures de conversión.
- La normalización depende del máximo global de la entrada: procesar fragmentos por separado produce resultados distintos a los de CREMA con el audio completo.
- Repositorio sin descargas ni likes y con tamaño de 0,0 GB: señales de un artefacto recién publicado y sin validación comunitaria; conviene verificar la integridad del ONNX antes de usarlo en producción.
- No se documentan sesgos, pero al derivar de CREMA hereda las limitaciones del dataset original de entrenamiento (no detallado en la información disponible).
- Licencia BSD-2-Clause: permisiva y compatible con uso comercial, con obligación de conservar el aviso de copyright y la cláusula de exención; debe revisarse NOTICE.md para la atribución y los cambios realizados en la conversión.
- No se documentan requisitos de hardware ni latencias, por lo que el dimensionamiento de un despliegue real requiere medición propia.
- El orden de las 170 etiquetas es lexicográfico según el label encoder de CREMA; cualquier post-procesado debe respetar ese orden exacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thebluescreen/crema-chords-onnx
- Repositorio original de CREMA: https://github.com/bmcfee/crema
- Scripts de conversión (Silly MIDI Tools): https://github.com/Sillybit-io/silly-midi-tools
- Referencia académica: McFee y Bello, "Structured Training for Large-Vocabulary Chord Recognition", ISMIR 2017 (enlace directo no disponible en la información proporcionada)
