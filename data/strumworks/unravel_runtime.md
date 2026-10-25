# StrumWorks/Unravel_Runtime

## Resumen

`StrumWorks/Unravel_Runtime` no es un modelo generativo ni un LLM: es un repositorio de distribución de artefactos de separación de fuentes de audio para la aplicación **Unravel** de StrumWorks (macOS). El repositorio contiene los ficheros de pesos que la app descarga en tiempo de instalación —seis modelos de separación en formato ONNX y una conversión a MLX en safetensors— junto con sus configuraciones JSON, textos de licencia y un `catalog.json` firmado con una clave Ed25519 que la aplicación valida contra claves embebidas antes de leerlo.

Cada entrada del catálogo fija la descarga a un commit exacto del repositorio y la app verifica tamaño y SHA-256 de cada fichero antes de usarlo. La separación se ejecuta íntegramente en el Mac del usuario: según la model card, no se sube audio a ningún servidor. El repositorio ocupa 3,0 GB y contiene 2.962.840.526 bytes en ficheros de pesos repartidos en cuatro carpetas funcionales (`Fast`, `Hybrid`, `Guitar`, `Vocals`, `Evaluation`).

La relevancia de esta ficha es fundamentalmente práctica y legal: el paquete mezcla modelos con licencias heterogéneas —Apache-2.0, MIT, *research-only* y *unresolved*— y el propio autor advierte que «not every model is cleared for redistribution». Cualquier evaluación técnica debe hacerse modelo a modelo, no sobre el repositorio como unidad. Creado el 25 de octubre de 2026 (misma fecha de creación y última actualización), con 0 descargas y 1 *like*, no dispone de validación comunitaria ni de métricas publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Familia híbrida de separación de fuentes musicales; el paquete incluye HTDemucs 6-source (MLX), MDX23C DrumSep, Mel-Band RoFormer (Large v1, drums), SCNet Large (bass), BS-RoFormer SW (guitar) y Kim Mel-Band RoFormer (vocals). Detalle arquitectónico por modelo: no disponible |
| Parámetros totales | no disponible (la model card no publica recuento de parámetros ni precisión de los pesos) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje. La ventana de procesado depende del tamaño de segmento (*chunk*) configurado en la aplicación, no documentado |
| Tipos de cuantización | no disponible. Se distribuyen ficheros ONNX y un safetensors (MLX) sin indicar fp32/fp16/int8 |
| Idiomas soportados | no aplica: procesa señal de audio, no texto. El idioma de la voz no condiciona la separación, pero no se documenta la composición lingüística de los datos de entrenamiento |
| Licencia | `other` / `unravel-mixed-licenses`, heterogénea por modelo (Apache-2.0, MIT, research-only, unresolved). Ver `LICENSE.md` |
| Formato de pesos | ONNX (`.onnx`) para cinco modelos; safetensors (conversión MLX) para `htdemucs_6s`; JSON de configuración por modelo; `catalog.json` firmado con Ed25519 |
| Tamaño del repositorio | 3,0 GB (2.962.840.526 bytes en pesos) |
| Verificación de integridad | Firma Ed25519 del catálogo + comprobación de tamaño y SHA-256 por fichero, con *pinning* a commit exacto |
| Plataforma de ejecución | macOS, ejecución local; sin subida de audio |

Composición detallada del paquete:

| Fichero | Tamaño | Modelo | Licencia |
|---|---:|---|---|
| `Fast/Models/htdemucs_6s.safetensors` | 104,6 MiB | HTDemucs 6-source (MLX) | research-only |
| `Evaluation/mdx23c-drums.onnx` | 417,4 MiB | MDX23C DrumSep, 6 partes de batería | unresolved |
| `Hybrid/mel-drums.onnx` | 1,03 GiB | Mel-Band RoFormer 4-stem Large v1, drums | Apache-2.0 |
| `Hybrid/scnet-bass.onnx` | 163,0 MiB | SCNet Large (starrytong, fixed), bass | unresolved |
| `Guitar/guitar-quality.onnx` | 198,1 MiB | BS-RoFormer SW (fixed), guitar | unresolved |
| `Vocals/vocals-kim.onnx` | 886,3 MiB | Kim Mel-Band RoFormer, vocals | MIT |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura, datos de entrenamiento ni procedimiento de ajuste de ninguno de los modelos. Lo que sí explicita la model card es el origen de cada artefacto: conversiones a ONNX (y una a MLX) de pesos de terceros, con un fichero de licencia adjunto por modelo (`LICENSE-MDX23C-Code.txt`, `LICENSE-MSS-Code.txt`, `LICENSE-MelBand-Drums.txt`, `LICENSE-Kim-Vocals.txt`) y, en tres casos, ficheros JSON de evaluación (`guitar-evaluation.json`, `guitar-quality-native.json`, `kim-vocals-evaluation.json`).

Por la denominación de los modelos convertidos, el paquete cubre tres familias de separación: modelos híbridos tiempo-frecuencia con componente Transformer (HTDemucs 6-source, en su variante de seis fuentes), modelos de *band-split* con atención rotatoria (Mel-Band RoFormer, BS-RoFormer) y modelos convolucionales/Redes tipo SCNet y MDX23C. La innovación técnica diferencial de este repositorio no está en los modelos, sino en la cadena de suministro: catálogo firmado, *pinning* por commit, verificación de hash y ejecución local sin subida de audio. No se documenta ningún proceso de RLHF, DPO ni ajuste adicional por parte de StrumWorks; las conversiones se presentan como transformaciones de formato, no como reentrenamientos.

## Capacidades

- Separación de fuentes musicales en *stems*: el paquete cubre batería, bajo, guitarra, voz y un modo de seis fuentes en el modelo rápido.
- Separación de batería en seis partes con `mdx23c-drums.onnx` (MDX23C DrumSep), orientada a *sample extraction* y transcripción rítmica.
- Aislamiento de voz con `vocals-kim.onnx` (Kim Mel-Band RoFormer), el modelo de mayor tamaño con licencia permisiva del paquete (MIT).
- Aislamiento de guitarra y de bajo con modelos dedicados (`guitar-quality.onnx`, `scnet-bass.onnx`), en lugar de depender de un único modelo multi-stem.
- Ruta rápida en Apple Silicon mediante la conversión MLX de HTDemucs, con pesos en safetensors.
- Verificación criptográfica de artefactos: firma Ed25519 del catálogo y SHA-256 por fichero, apta para pipelines de distribución de modelos.
- Ejecución totalmente offline en el dispositivo del usuario.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio-texto ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- **Remezcla y producción musical**: separar una mezcla en stems para reequilibrar niveles, sustituir una batería o construir un *bootleg*. El modelo de seis fuentes (`htdemucs_6s`) permite iterar rápido en local antes de pasar a los modelos grandes por stem.
- **Karaoke y eliminación de voz**: usar `vocals-kim.onnx` para extraer la pista vocal y generar una versión instrumental. Es el componente con licencia MIT del paquete, lo que simplifica su uso en productos publicados.
- **Extracción de samples de batería**: `mdx23c-drums.onnx` separa la batería en seis partes, lo que permite aislar un *kick* o un *hi-hat* concretos de una grabación para reutilizarlos en producción propia. Requiere revisar la licencia, marcada como *unresolved*.
- **Práctica de instrumento**: generar pistas de acompañamiento sin guitarra (`guitar-quality.onnx`) o sin bajo (`scnet-bass.onnx`) para estudiar sobre la grabación original.
- **Preprocesado para ASR y transcripción musical**: aislar la voz antes de pasar un sistema de reconocimiento de habla o de letras reduce el error en grabaciones con música de fondo; el resultado es un WAV mono con la voz separada.
- **Post-producción de pódcast y entrevistas**: eliminar música de fondo o ruido musical de una pista de voz antes de la edición final, con la ventaja de que el audio no sale del equipo del editor.
- **Distribución de modelos en aplicaciones de escritorio**: reutilizar el esquema de `catalog.json` firmado con Ed25519, *pinning* a commit y verificación de SHA-256 como plantilla para distribuir pesos de terceros en una app macOS con garantías de integridad.
- **Investigación en separación de fuentes**: usar los JSON de evaluación incluidos y los pesos como línea base reproducible, siempre que la licencia del modelo concreto lo permita (los marcados *research-only* o *unresolved* quedan restringidos a ese ámbito).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (SDR, SI-SDR, BSS Eval ni similares) y el repositorio solo contiene ficheros JSON de evaluación para tres modelos (`guitar-evaluation.json`, `guitar-quality-native.json`, `kim-vocals-evaluation.json`) cuyos valores no se detallan en la documentación pública. No se han encontrado cifras de rendimiento en la búsqueda web.

## Requisitos de hardware

- **Plataforma**: macOS con ejecución local. La model card indica que la separación corre íntegramente en el Mac del usuario; no se documenta soporte para Linux, Windows ni CUDA.
- **VRAM/RAM estimada por modelo** (estimación a partir del tamaño de fichero, con factor 1,5–3× para activaciones; no confirmada por el autor):
  - `mel-drums.onnx` (1,03 GiB): ~1,5–3 GB.
  - `vocals-kim.onnx` (886 MiB): ~1,3–2,7 GB.
  - `mdx23c-drums.onnx` (417 MiB): ~0,6–1,3 GB.
  - `guitar-quality.onnx` (198 MiB): ~0,3–0,6 GB.
  - `scnet-bass.onnx` (163 MiB): ~0,25–0,5 GB.
  - `htdemucs_6s.safetensors` (105 MiB): ~0,15–0,35 GB.
- **Espacio en disco**: 2,96 GB si se descargan todos los pesos; el catálogo permite descargar solo los modelos necesarios.
- **GPU**: no se especifican modelos concretos (A100, H100, RTX 4090). La ruta `Fast` en MLX apunta a GPU integrada de Apple Silicon; el resto se ejecuta vía ONNX Runtime, presumiblemente con CPU o el *execution provider* de Core ML.
- **Consumer GPU**: no aplica en el sentido habitual; el despliegue objetivo es un Mac. Cualquier GPU NVIDIA requeriría portar los ONNX a un runtime distinto, algo no soportado por la app.
- **Opciones de despliegue**: ONNX Runtime y MLX dentro de la aplicación Unravel. vLLM, llama.cpp, Ollama y TGI no son aplicables.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la búsqueda web datos de parámetros ni de rendimiento de alternativas comparables. La comparación se limita a los componentes del propio paquete, que compiten entre sí por tarea:

| Componente | Tarea | Tamaño | Formato | Licencia |
|---|---|---:|---|---|
| `mel-drums.onnx` | Batería (4-stem) | 1,03 GiB | ONNX | Apache-2.0 |
| `vocals-kim.onnx` | Voz | 886 MiB | ONNX | MIT |
| `mdx23c-drums.onnx` | Batería en 6 partes | 417 MiB | ONNX | unresolved |
| `guitar-quality.onnx` | Guitarra | 198 MiB | ONNX | unresolved |
| `scnet-bass.onnx` | Bajo | 163 MiB | ONNX | unresolved |
| `htdemucs_6s.safetensors` | 6 fuentes (rápido) | 105 MiB | safetensors (MLX) | research-only |

Alternativas de la misma categoría citadas habitualmente en el ecosistema (Demucs, Spleeter, Open-Unmix, checkpoints de Music-Source-Separation-Training): parámetros, contexto, rendimiento y disponibilidad — no disponible en la información proporcionada. Cualquier comparación cuantitativa exigiría ejecutar los modelos sobre el mismo *test set* y con la misma métrica.

## Limitaciones y advertencias

- **Licencias heterogéneas y no resueltas**: tres de los seis pesos (`mdx23c-drums`, `scnet-bass`, `guitar-quality`) figuran como *unresolved*, lo que no equivale a una licencia: no hay permiso explícito de redistribución ni de uso comercial. `htdemucs_6s` es *research-only*. Solo `mel-drums` (Apache-2.0) y `vocals-kim` (MIT) están claramente habilitados. Verificar `LICENSE.md` antes de cualquier uso en producción.
- **No es un modelo único**: no tiene parámetros, contexto ni benchmarks propios. Tratar el repositorio como un modelo incurre en errores de evaluación y de atribución de licencia.
- **Ausencia de documentación técnica**: sin arquitectura detallada, sin recuento de parámetros, sin precisión de pesos, sin datos de entrenamiento y sin métricas publicadas. No es posible estimar calidad *a priori*.
- **Riesgo de artefactos, no de alucinación**: en separación de fuentes el fallo típico es *bleeding* entre stems (restos de voz en el instrumental, bombos filtrados en el bajo) y artefactos metálicos en pasajes densos. No hay métricas publicadas que acoten este riesgo.
- **Sesgo de dominio no documentado**: no se especifica la composición musical de los datos de entrenamiento; es esperable un rendimiento inferior en géneros poco representados (clásica, tradicional, material no occidental) y en grabaciones de baja calidad, pero no hay datos que lo confirmen ni lo descarten.
- **Dependencia de plataforma**: la ejecución está atada a macOS y a la aplicación Unravel. No hay API pública, ni servidor, ni soporte Linux/Windows documentado.
- **Dependencia de la cadena de firma**: la seguridad del catálogo descansa en las claves Ed25519 embebidas en la app; la rotación o el compromiso de esas claves afecta a todas las instalaciones.
- **Madurez**: repositorio creado el 2026-10-25 y actualizado el mismo día, con 0 descargas y 1 *like*. Sin historial de mantenimiento ni validación por terceros.
- **Reproducibilidad**: el *pinning* por commit y los SHA-256 publicados facilitan la verificación, pero las conversiones (ONNX/MLX) no documentan el script ni los pesos de origen, más allá de la referencia en `LICENSE.md`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/StrumWorks/Unravel_Runtime
- Licencias por modelo: https://huggingface.co/StrumWorks/Unravel_Runtime/blob/main/LICENSE.md
- Catálogo firmado: https://huggingface.co/StrumWorks/Unravel_Runtime/blob/main/catalog.json
- Página del proyecto (no verificada en la información disponible): no disponible

Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con este repositorio. Corresponden a proyectos homónimos o de nombre similar que conviene no confundir: `EruditeCoder108/UnravelAI` (https://github.com/EruditeCoder108/UnravelAI), `NK-Works/UnravelAI` (https://github.com/NK-Works/UnravelAI) y contenido del taller de *Stormworks* en Steam. Ninguno documenta el modelo de StrumWorks ni aporta datos técnicos o de benchmarks utilizables.
