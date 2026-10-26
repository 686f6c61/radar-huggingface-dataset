# tiao-ai-tech/kinomat-aligner-de

## Resumen

kinomat-aligner-de es un modelo de alineamiento forzado (*forced alignment*) para alemán publicado por tiao-ai-tech, el equipo detrás de la herramienta de edición Kinomat. No es un modelo nuevo: es una conversión de formato del modelo `oliverguhr/wav2vec2-base-german-cv9`, que a su vez deriva de `facebook/wav2vec2-base`. Su función es recibir una grabación de voz junto con el guion escrito que se está leyendo y determinar en qué instante exacto se pronuncia cada palabra, de modo que los subtítulos y los cortes de montaje sigan a la voz. Según la model card, no se reentrenó ni se ajustó ningún peso.

Técnicamente es un wav2vec2 base con cabeza CTC exportado a ONNX (opset 17) y cuantizado dinámicamente a int8 (uint8) únicamente en los pesos de las multiplicaciones matriciales, dejando las convoluciones del extractor de características en float32. El resultado es un único archivo de 121.925.723 bytes que emite una trama de logits cada 20 ms sobre un vocabulario de 35 símbolos (letras alemanas en minúscula, incluidas `ä`, `ö`, `ü` y `ß`, más un separador de palabra y el *blank* de CTC). Se distribuye con licencia MIT y está pensado para ejecutarse en local, sin descargas automáticas ni dependencia de servicios externos.

Su relevancia es acotada pero clara: cubre el caso de uso, muy extendido en producción de vídeo, de sincronizar texto conocido con audio en alemán usando un artefacto pequeño (0,1 GB de repositorio) que cabe en CPU. El propio autor advierte que no debe emplearse como reconocedor de voz general. El modelo se publicó el 26 de octubre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 base (extractor convolucional de características + codificador transformer) con cabeza CTC |
| Parámetros totales | aproximadamente 95 M, heredados de la arquitectura wav2vec2-base; la model card no los explicita |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica ni disponible: no es un modelo de contexto textual; acepta audio de longitud variable a 16 kHz y emite una trama cada 20 ms (50 tramas por segundo de audio) |
| Tipos de cuantización | int8 dinámica (uint8) solo en los pesos de MatMul; convoluciones del extractor en float32 |
| Idiomas soportados | alemán (`de`) |
| Licencia | MIT (modelo original de Oliver Guhr); el `facebook/wav2vec2-base` subyacente es Apache 2.0 |
| Formato de pesos | ONNX (opset 17), un único archivo `wav2vec2-base-german-cv9-int8.onnx` de 121.925.723 bytes, más `vocab.json` |
| Vocabulario | 35 símbolos: letras alemanas en minúscula con `ä`, `ö`, `ü`, `ß`; el carácter pipe separa palabras; `[PAD]` es el *blank* de CTC |
| Entrada | `input_values`: float32 `[1, samples]`, mono a 16 kHz, normalizado a media cero y varianza unitaria |
| Salida | `logits`: float32 `[1, frames, 35]` |
| SHA-256 del archivo | `4a5bd72b104c3fc4e1a552c8e5bdb9f4135c4d01c81ad3b85af6775988aa65b0` |
| Tamaño del repositorio | 0,1 GB |
| Descargas / valoraciones | 0 / 0 en el momento de la consulta |
| Fecha de publicación | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2 base: varias capas convolucionales que convierten la forma de onda a 16 kHz en una secuencia de representaciones latentes con paso de 20 ms, seguidas de un codificador transformer y una proyección lineal a un vocabulario de 35 símbolos entrenada con pérdida CTC. El modelo no incorpora mecanismo de atención sobre contexto textual ni decoder autorregresivo; el alineamiento se obtiene a posteriori, fuera del grafo ONNX, mediante decodificación CTC forzada (habitualmente Viterbi restringido a la transcripción conocida).

No hubo entrenamiento ni ajuste fino por parte de tiao-ai-tech: la model card indica explícitamente que se trata solo de una conversión de formato. Los pesos proceden de `oliverguhr/wav2vec2-base-german-cv9` en la revisión `e3c2cb317c771e7fbbdfbf20be6017b8e65b232d`, que fue entrenado sobre Mozilla Common Voice 9.0 en alemán (CC0 1.0) partiendo de `facebook/wav2vec2-base`. La exportación se hizo con PyTorch 2.14.1, transformers 5.20.2 y ONNX opset 17, y la cuantización dinámica con onnxruntime 1.31.0. El script de exportación (`exporter-le-modele.py`) está reproducido en el repositorio, junto con el *pin* exacto de dependencias (`huggingface_hub==2.3.0`, `numpy==2.5.4`, `onnx==1.23.2`, `onnxscript==0.7.2`).

La decisión técnica más relevante es la cuantización selectiva: cuantizar también las convoluciones del extractor hacía caer la concordancia de tramas con el modelo original del 97 % al 82 % en una grabación de prueba, por lo que se mantuvieron en float32. El autor advierte que los bytes exactos del archivo pueden variar entre máquinas, aunque el SHA-256 publicado corresponde al archivo distribuido.

## Capacidades

- Alineamiento forzado de un guion alemán conocido sobre una grabación de ese mismo guion, con resolución temporal de 20 ms por trama.
- Localización de fronteras de palabra y, por agregación de tramas, de duraciones por palabra o por frase.
- Puntuación de confianza por trama a partir de los logits CTC (útil para detectar omisiones o desviaciones respecto al guion).
- Procesamiento de audio de duración variable en una sola pasada, sin ventana de contexto fija.
- Ejecución totalmente local mediante ONNX Runtime, sin llamadas a red (Kinomat no descarga nada por sí mismo).
- No soporta *tool calling*, ni uso como agente, ni razonamiento multi-paso: no es un modelo generativo de instrucciones.
- No soporta visión, audio como entrada multimodal ni modo *thinking*.
- Multilingüismo: limitado a alemán; no se documentan otros idiomas.

## Casos de uso

- **Generación de subtítulos con marcas de tiempo por palabra en vídeo alemán**: se pasa la locución junto con el guion y el modelo devuelve el instante de cada palabra, lo que permite construir archivos SRT/VTT con *timestamps* a nivel de palabra sin pasar por un ASR completo y evitando errores de transcripción, ya que el texto es conocido.
- **Montaje automático por voz en Kinomat**: la aplicación usa las fronteras detectadas para cortar planos y ajustar transiciones al ritmo real del habla; al ejecutarse en local con un archivo de 122 MB, encaja en un flujo de edición de escritorio sin GPU.
- **Control de calidad de doblaje y locución**: comparando la ruta CTC forzada con el guion se detectan palabras omitidas, añadidos o saltos de línea; la puntuación por trama permite localizar el minuto exacto donde la locución se desvía del texto.
- **Creación de corpus alineados para entrenar ASR**: audios con transcripción humana (por ejemplo de Common Voice) se convierten en datasets con *timestamps* por palabra, útiles para entrenar o evaluar modelos de reconocimiento de voz en alemán.
- **Sincronización de TTS y doblaje sintético**: extraer la duración real de cada palabra del audio original permite ajustar la velocidad del habla generada por un sintetizador para que encaje en los mismos intervalos, sin reescribir el guion.
- **Indexación y búsqueda dentro de archivos de audio y vídeo**: al disponer de la posición de cada palabra, se puede construir un índice para saltar a la ocurrencia de un término en un archivo largo, o resaltar el texto sincronizado en interfaces de karaoke y e-learning.
- **Investigación lingüística y prosódica**: extracción de duraciones vocálicas, pausas y fronteras de palabra sobre corpus de habla leída, con una resolución constante de 20 ms adecuada para estudios de ritmo y cantidad vocálica en alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no es evaluable con MMLU, HumanEval o GSM8K por su naturaleza (no genera texto libre); la única métrica aportada por el autor es una medida de fidelidad frente al modelo original, no una comparación con otros sistemas:

| Métrica | Valor |
|---|---|
| Concordancia de tramas con el modelo original en float32 (una grabación de prueba) | 97 % |
| Concordancia si se cuantizan también las convoluciones | 82 % |
| Tasa de error de alineamiento por palabra (WER de fronteras) | no disponible |
| Evaluación sobre Common Voice, MLS u otros corpus | no disponible |
| Latencia o throughput publicados | no disponible |

## Requisitos de hardware

- **Tamaño en disco**: 121.925.723 bytes (unos 116 MiB) para el archivo ONNX, más el `vocab.json`. El repositorio completo ocupa 0,1 GB.
- **VRAM estimada para inferencia**: no hay cifra oficial, pero por el tamaño del artefacto (unos 95 M de parámetros, con los pesos de MatMul en int8) el modelo completo ocupa del orden de cientos de MB en memoria. Cualquier GPU con 2 GB o más es sobradamente suficiente para una única petición.
- **¿Cabe en GPU de consumo?**: sí, con enorme margen; también en CPU. Una RTX 4090 o una A100 están infrautilizadas para este modelo: el cuello de botella no es la red sino el paso de alineamiento CTC posterior.
- **GPU recomendadas**: no requiere GPU. Si se procesa en lote, basta una GPU de gama media (por ejemplo, una RTX 3060 o superior) con el *execution provider* CUDA de ONNX Runtime; también son válidos los *providers* de OpenVINO o TensorRT.
- **Opciones de despliegue**: ONNX Runtime (Python o C++) es la vía natural, ya que la model card especifica `library_name: onnx`. También es exportable a otros entornos ONNX (OpenVINO, Windows ML, TensorRT). vLLM, llama.cpp, Ollama y TGI no aplican: son motores para modelos generativos de texto y no ejecutan este grafo.
- **Latencia y throughput**: no publicados. Estructuralmente, un minuto de audio produce 3.000 tramas de logits; a 16 kHz, la carga por muestra es baja y el coste dominante suele ser la decodificación CTC forzada, no la inferencia de la red.
- **Integración en Kinomat**: el archivo debe colocarse en `~/Kinomat/Modelle/` sin cambiar el nombre; la aplicación verifica la suma SHA-256 antes de usarlo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada / resolución | Cuantización | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kinomat-aligner-de | ~95 M | audio 16 kHz, trama de 20 ms | int8 dinámica en MatMul, conv en fp32 | MIT | ONNX | conversión de formato, sin reentrenamiento; propósito específico de alineamiento |
| oliverguhr/wav2vec2-base-german-cv9 | ~95 M | audio 16 kHz, trama de 20 ms | fp32 | MIT | PyTorch (transformers) | modelo original del que se deriva; mismos pesos en float32 y mayor tamaño |
| facebook/wav2vec2-base-960h | ~95 M | audio 16 kHz, trama de 20 ms | fp32 | Apache 2.0 | PyTorch | solo inglés; no válido para alinear guiones alemanes |
| torchaudio MMS_FA (alineador multilingüe) | no disponible | audio 16 kHz, trama de 20 ms | fp32 | CC-BY-NC 4.0 | PyTorch | cubre alemán y otros idiomas, pero la licencia no permite uso comercial |

Frente al modelo original de Oliver Guhr, la diferencia no es de calidad sino de empaquetado: mismo resultado (con una concordancia del 97 % en tramas) en un archivo único y cuantizado, a cambio de requerir ONNX Runtime y un vocabulario propio en lugar del *pipeline* estándar de transformers. Frente a soluciones multilingües como MMS_FA, la ventaja es la licencia MIT y el tamaño reducido; la desventaja, que solo cubre alemán.

## Limitaciones y advertencias

- **No es un reconocedor de voz**: está diseñado para alinear un guion conocido con su grabación. Usarlo con audio libre o con un texto que no coincida con lo pronunciado producirá alineamientos sin sentido; el autor lo advierte de forma explícita.
- **Monolingüe y con vocabulario restringido**: solo alemán, en minúsculas, sin dígitos ni signos de puntuación. Cualquier palabra fuera de los 35 símbolos del `vocab.json` (nombres propios, siglas, cifras) debe normalizarse antes o quedará fuera del alineamiento.
- **Pérdida por cuantización**: la concordancia con el modelo en float32 es del 97 %, no del 100 %. No se documenta cómo se comporta esa pérdida en dominios distintos de la grabación de prueba (ruido, acentos regionales, habla espontánea).
- **Sesgo de dominio del datos original**: Common Voice 9.0 en alemán es habla leída de frases cortas y contribuciones voluntarias, con la distribución demográfica y de acentos que ello implica. No se han publicado evaluaciones de robustez ante ruido, reverberación o dialectos (bávaro, suizo alemán, saxón).
- **Atribución ambigua en la licencia**: el modelo original declara MIT pero no incluye fichero de licencia separado ni línea de copyright; el aviso incluido nombra al autor sin año. Para uso comercial conviene conservar ese aviso y la referencia a `facebook/wav2vec2-base` (Apache 2.0), y revisar la cadena de atribución antes de redistribuir.
- **Reproducibilidad del binario**: el autor indica que los bytes pueden diferir entre máquinas; solo el SHA-256 publicado identifica el archivo oficial. Kinomat rechaza cualquier archivo que no coincida, y renombrarlo rompe la comprobación.
- **Madurez**: cero descargas y cero valoraciones en el momento de la consulta, publicación reciente y sin validación independiente. Es un artefacto de un solo autor orientado a una aplicación concreta.
- **Sin garantías**: se distribuye "as is", sin garantía de ningún tipo.
- **Post-proceso obligatorio**: el modelo solo devuelve logits CTC; el alineamiento real (Viterbi restringido, conversión a *timestamps*) debe implementarse fuera del grafo. No es un componente autónomo de extremo a extremo.
- **Búsquedas web no concluyentes**: los resultados encontrados al buscar "aligner" corresponden a ortodoncia y férulas dentales (OrthoAI, guías de *clear aligners*), un falso positivo léxico sin relación con este modelo. No aportan benchmarks ni evaluaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiao-ai-tech/kinomat-aligner-de
- Archivo ONNX: https://huggingface.co/tiao-ai-tech/kinomat-aligner-de/resolve/main/wav2vec2-base-german-cv9-int8.onnx
- Modelo base (Oliver Guhr, MIT): https://huggingface.co/oliverguhr/wav2vec2-base-german-cv9
- Modelo original de Meta AI (Apache 2.0): https://huggingface.co/facebook/wav2vec2-base
- Dataset de entrenamiento (Common Voice 9.0, alemán, CC0 1.0): https://huggingface.co/datasets/mozilla-foundation/common_voice_9_0
- Script de exportación y pins de dependencias: incluidos en el repositorio `tiao-ai-tech/kinomat-aligner-de` (`exporter-le-modele.py`)
- Paper, blog o demo del autor: no disponible en la información proporcionada
