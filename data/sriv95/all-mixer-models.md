# sriv95/all-mixer-models

## Resumen

`all-mixer-models` no es un modelo único, sino un repositorio de distribución de pesos en formato ONNX para la extensión de Chrome [All Mixer!](https://github.com/sriv95/All-Mixer), una herramienta de separación de fuentes musicales. Contiene cuatro núcleos RoFormer que la extensión descarga bajo demanda: `roformer` (menú "High quality"), `deux` ("Best Vocal"), `guitar` (división de instrumentales, pista de guitarra) y `sw` ("Focus Instrumental Splitting", seis pistas en una sola pasada). El autor del repositorio es `sriv95`; los pesos originales proceden de terceros (unwa, becruily, jarredou y el mirror de FractalSurfer), y este repositorio se limita a reempaquetarlos.

Técnicamente son transformadores con atención sobre bandas de frecuencia (Mel-Band RoFormer en tres de los cuatro casos y band-split RoFormer en `sw`), exportados en ONNX con la única parte del *pipeline* que corre en el navegador. El repositorio ocupa 1,9 GB y no incluye la lógica de pre/post-procesado: la STFT, el *gather* por mel-bandas, el *scatter* de máscaras y la iSTFT se ejecutan en JavaScript dentro de la extensión. Su relevancia es acotada pero clara: permite separar pistas de audio en local, sin enviar el audio a un servidor, reutilizando arquitecturas de separación del estado del arte.

La ficha debe leerse con una advertencia previa: el repositorio no declara licencia propia ni *model card* de uso general, varios de los pesos redistribuidos tampoco tienen licencia declarada y uno de ellos es explícitamente no comercial (CC BY-NC 4.0). No es un modelo de lenguaje: no procesa texto, no tiene contexto de tokens ni soporta *tool calling*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoFormer (transformer con atención sobre bandas de frecuencia): Mel-Band RoFormer en `roformer`, `deux` y `guitar`; band-split RoFormer en `sw` (62 bandas, profundidad 12, STFT hop 512). Solo se exporta el stack transformer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; admite cualquier número de frames STFT y la extensión fija la longitud de chunk en tiempo de ejecución) |
| Tipos de cuantización | no disponible como opciones de cuantización; los pesos se distribuyen en fp16 con entrada y salida en fp32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; procesa audio, independientemente del idioma) |
| Licencia | no disponible a nivel de repositorio. Por modelo: `roformer` sin licencia declarada en origen; `deux` CC BY-NC 4.0 (atribución a becruily, uso no comercial); `guitar` sin licencia declarada (el autor indica uso libre solo no comercial); `sw` sin licencia declarada por el autor |
| Formato de pesos | ONNX (`.onnx`) más ficheros JSON auxiliares: `manifest.json` (versión y tamaños por modelo) y `v<N>/<model>-meta.json` (disposición de bandas para el lado JS) |
| Número de modelos incluidos | 4 (`roformer`, `deux`, `guitar`, `sw`) |
| Tamaño del repositorio | 1,9 GB |
| Descargas / likes | 0 descargas, 1 like |
| Pipeline declarado | no disponible |
| Fecha de creación / actualización | 2026-10-18 / 2026-10-19 |

## Arquitectura y entrenamiento

Los cuatro modelos son RoFormer, una familia de transformadores para separación de fuentes que aplica atención sobre representaciones tiempo-frecuencia agrupadas en bandas. En `roformer`, `deux` y `guitar` la agrupación es Mel-Band; en `sw` es band-split con 62 bandas, profundidad 12 y STFT con hop 512, y produce seis pistas (bajo, batería, otros, voces, guitarra y piano) en una sola pasada. El export deja fuera del grafo ONNX toda la parte DSP: la STFT, el *gather* por mel-bandas, el *scatter* de máscaras y la iSTFT se ejecutan en la extensión en JavaScript, de modo que el modelo ONNX recibe y devuelve tensores en fp32 mientras los pesos internos van en fp16. Esa separación es la innovación práctica del paquete: permite chunking variable sin reexportar el modelo y mantiene el grafo pequeño y portable a ONNX Runtime en el navegador.

No hay información sobre datos de entrenamiento: la *model card* no indica número de tokens, composición del dataset, horas de audio, ni procesos de ajuste (RLHF/DPO no aplican aquí). Lo que sí se documenta es la procedencia de cada checkpoint: `roformer` proviene de `mel_band_roformer_kim_ft_unwa` de unwa, un *fine-tune* del Mel-Band RoFormer de Kimberley Jensen (upstream `pcunwa/Kim-Mel-Band-Roformer-FT`); `deux` y `guitar` son checkpoints de becruily, limitados a la pista vocal y a la pista de guitarra respectivamente; `sw` es `BS-ROFO-SW-Fixed`, una edición de jarredou de un checkpoint cuyo entrenador no se nombra, tomada del mirror público `FractalSurfer/BS-RoFormer-SW-6stem` (SHA-256 `24e7d35ee9c64415673d3fd33e06a67cac2c103c5df6267ba1576459c775916e`). Todos se convierten con `scripts/export-roformer.py` del repositorio de la extensión.

## Capacidades

- Separación de voces de una mezcla musical, con dos niveles de calidad: `roformer` (calidad alta, propósito general) y `deux` (vocal, requiere buena GPU).
- Separación multi-pista en una sola pasada con `sw`: voces, batería, bajo, guitarra, piano y "el resto" (seis stems).
- Aislamiento de la pista de guitarra con `guitar`, dentro del modo de división de instrumentales.
- Procesamiento de audio de duración arbitraria: el modelo ONNX acepta cualquier número de frames STFT y la extensión decide el tamaño de chunk.
- Inferencia en local mediante ONNX Runtime (web o nativo), sin depender de una API remota.
- Actualización incremental de modelos: `manifest.json` permite a la extensión comparar versiones instaladas y descargar solo lo que cambia.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No soporta visión, audio semántico (ASR) ni comprensión de habla; únicamente separación de fuentes.
- Multilingüismo: no aplica, el procesado es puramente acústico.

## Casos de uso

- **Karaoke y remezclas caseras**: `deux` o `roformer` aíslan la pista vocal para generar versiones instrumentales o *a capella* de una canción concreta, ejecutando todo el proceso en el navegador del usuario sin subir el audio a un servidor.
- **Producción musical y edición de stems**: `sw` entrega en una sola pasada seis pistas alineadas (bajo, batería, otros, voces, guitarra, piano), lo que permite reequilibrar una mezcla, sustituir una batería o hacer *sampling* sin trabajo manual de corte.
- **Transcripción de guitarra y generación de tablaturas**: `guitar` aísla la pista de guitarra como paso previo a un transcriptor automático (AMT) o a una revisión manual, mejorando la relación señal-ruido de la entrada.
- **Limpieza de diálogo en pódcast y vídeo**: `roformer` sobre la pista de voz reduce música de fondo y ruido musical en grabaciones, como preprocesado antes de un modelo ASR o de un editor de audio.
- **Doblaje y localización**: separar voces y música permite sustituir el diálogo por una versión doblada conservando la banda sonora y los efectos, un flujo habitual en localización de bajo presupuesto.
- **Creación de datasets para investigación en MIR**: generar stems etiquetados a partir de un catálogo propio para entrenar modelos de detección de instrumentos, transcripción o *beat tracking*, siempre que la licencia del audio de origen lo permita.
- **Preprocesado en pipelines de análisis musical**: integrar el ONNX en un script con `onnxruntime` para extraer la pista de batería antes de un análisis rítmico, aprovechando que el chunking es configurable.
- **Distribución ligera en aplicaciones de escritorio**: al ser ONNX con pesos fp16 y grafo reducido, el modelo se puede empaquetar en una app de escritorio con ONNX Runtime en lugar de depender de un *backend* Python con PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La *model card* no incluye métricas objetivas de separación (SDR, SI-SDR, SIR, SAR) ni comparaciones numéricas entre los cuatro modelos. Tampoco hay datos de latencia o *throughput*. Cualquier cifra de calidad que se cite para estos checkpoints debería tomarse de las fichas de sus autores originales, no de este repositorio.

## Requisitos de hardware

- El autor no publica cifras de VRAM. La única indicación cualitativa de la *model card* es que `deux` y `sw` "necesitan una buena GPU".
- Cota orientativa derivada del repositorio: los 1,9 GB incluyen cuatro modelos en fp16 más metadatos, por lo que cada `.onnx` individual ocupa del orden de cientos de MB. El consumo de VRAM real (pesos + activaciones + buffers de STFT) no está documentado.
- `roformer` y `guitar` son los candidatos razonables para equipos modestos; `deux` y `sw` deberían reservarse para GPU dedicada.
- GPU de referencia para el resto de la familia RoFormer: no disponible en la información proporcionada. No se confirma ni se descarta que quepan en GPUs de consumo (RTX 4060/4070/4090); el dato no está publicado.
- Despliegue: el camino previsto es ONNX Runtime dentro de la extensión (WebGPU o WASM en el navegador) y `onnxruntime`/`onnxruntime-gpu` en Python. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo autorregresivo de texto.
- Requisito de integración: el pre/post-procesado (STFT, mel-band gather, mask scatter, iSTFT) debe implementarse aparte; sin él, el ONNX no produce audio utilizable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Stems | Arquitectura | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `roformer` (este repo) | Separación vocal / instrumental | Vocal + resto | Mel-Band RoFormer, ONNX fp16 | Frames STFT arbitrarios | Sin licencia declarada | HuggingFace, 1,9 GB el repo completo |
| `deux` (este repo) | Separación vocal de alta calidad | Vocal | Mel-Band RoFormer, ONNX fp16 | Frames STFT arbitrarios | CC BY-NC 4.0 | HuggingFace |
| `sw` (este repo) | Separación multi-pista | 6 (voces, batería, bajo, guitarra, piano, otros) | Band-split RoFormer, 62 bandas, depth 12, hop 512 | Frames STFT arbitrarios | Sin licencia declarada | HuggingFace + mirror FractalSurfer |
| `guitar` (este repo) | Aislamiento de guitarra | Guitarra | Mel-Band RoFormer, ONNX fp16 | Frames STFT arbitrarios | Sin licencia declarada (no comercial según el autor) | HuggingFace |
| Mel-Band RoFormer original (Kimberley Jensen) | Separación vocal | Según checkpoint | Mel-Band RoFormer | No disponible | No disponible en la información aportada | Pesos originales referenciados como upstream |
| BS-RoFormer SW (jarredou, `BS-ROFO-SW-Fixed`) | Separación multi-pista | 6 | Band-split RoFormer | No disponible | No disponible | Edición publicada; el repositorio original ya no existe |
| Demucs / HTDemucs (referencia del sector) | Separación multi-pista | 4 | Híbrido espectrograma + forma de onda | No disponible | No disponible en la información aportada | Alternativa habitual, no evaluada aquí |

No se dispone de parámetros totales, VRAM ni métricas de calidad comparadas para ninguno de los modelos de la tabla; la comparación es, por tanto, cualitativa y centrada en tarea, formato y licencia.

## Limitaciones y advertencias

- **Licencias heterogéneas y en varios casos inexistentes**: el repositorio no declara licencia. `deux` es CC BY-NC 4.0 (prohíbe uso comercial y exige atribución a becruily); `guitar` no tiene licencia declarada y su autor solo permite uso no comercial; `roformer` y `sw` tampoco tienen licencia declarada. Para uso comercial, la situación legal es incierta en tres de los cuatro modelos.
- **Redistribución sin permiso explícito**: los pesos se reempaquetan desde checkpoints de terceros y el autor se limita a ofrecer la retirada del fichero a quien lo solicite. Un mirror con etiqueta MIT en su código de exportación no licencia los pesos.
- **No es un modelo de propósito general**: la propia *model card* indica que los ficheros no están pensados para otros usos que la extensión All Mixer!. Reutilizarlos exige reimplementar el pre/post-procesado.
- **Artefactos de separación**: son esperables *bleeding* entre stems (restos de voz en el instrumental o viceversa), coloración espectral y problemas de fase, especialmente en mezclas densas o con instrumentación muy comprimida. No hay métricas publicadas que acoten estos errores.
- **Dependencia de hardware no documentada**: `deux` y `sw` requieren "una buena GPU" según el autor; en equipos modestos el proceso puede ser inviable o muy lento, sin cifras publicadas de latencia.
- **Idioma y dominio**: el procesado no depende del idioma, pero sí del dominio musical. El rendimiento en grabaciones de campo, entrevistas con ruido o material no musical no está documentado.
- **Madurez del repositorio**: 0 descargas y 1 like en el momento de la consulta; sin *pipeline* declarado, sin *model card* de uso general y con una sola revisión registrada.
- **Trazabilidad del checkpoint `sw`**: proviene de una edición de un checkpoint cuyo entrenador no se nombra y de una cuenta de HuggingFace que ya no existe, lo que dificulta auditar su procedencia.
- **Ausencia de cifras de calidad**: no hay SDR/SI-SDR publicados en este repositorio, por lo que la afirmación de "calidad alta" del menú de la extensión no está respaldada por números verificables aquí.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sriv95/all-mixer-models
- Repositorio de la extensión (script `scripts/export-roformer.py`): https://github.com/sriv95/All-Mixer
- Checkpoint de becruily para voces (`deux`): https://huggingface.co/becruily/mel-band-roformer-deux
- Checkpoint de becruily para guitarra: https://huggingface.co/becruily/mel-band-roformer-guitar
- Discusión sobre la licencia del modelo de guitarra: https://huggingface.co/becruily/mel-band-roformer-guitar/discussions/9
- Mirror de los pesos de BS-RoFormer SW: https://huggingface.co/FractalSurfer/BS-RoFormer-SW-6stem
- Upstream del modelo `roformer` (Mel-Band RoFormer ajustado por unwa): https://huggingface.co/pcunwa/Kim-Mel-Band-Roformer-FT

No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este repositorio.
