# Sucial/logic-drumsep-model

## Resumen

Logic-drumsep-model es un modelo de separación de fuentes de audio (source separation) especializado en batería, extraído por el usuario Sucial a partir del framework propietario `MAMLStemSplitter.framework` de Logic Pro 13, la estación de trabajo de audio digital (DAW) de Apple. El modelo no es un LLM ni un modelo de lenguaje: es una red neuronal de dos ramas que descompone una mezcla musical en seis pistas de batería (bombo, caja, charles, toms y componentes similares). Se distribuye como checkpoint de PyTorch (`logic13_drum_splitter.ckpt`, 747 MB) junto con un script de inferencia autónomo y herramientas de conversión.

La arquitectura combina una rama espectral basada en BS-RoFormer (con 12 bloques transformer sobre 62 bandas de frecuencia y puentes de cross-attention) con una rama temporal en forma de Conv U-Net, fusionadas mediante suma residual. El modelo tiene 186,6 millones de parámetros y opera sobre fragmentos de 266.240 muestras (~6 segundos a 44,1 kHz) con STFT de ventana 2048 y salto 1024. Es relevante porque documenta y hace reproducible la extracción de pesos desde un binario CoreML propietario, algo poco habitual en la literatura de separación de fuentes.

El interés práctico es doble: por un lado, permite a desarrolladores ejecutar localmente con solo PyTorch una funcionalidad que de otro modo requiere Logic Pro 13 en macOS; por otro, el análisis técnico del grafo (alineación temporal entre ramas, escalas aprendidas por canal, cancelación de sangrado en pistas vacías) aporta material valioso para quien investigue arquitecturas híbridas espectro-temporales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: rama espectral BS-RoFormer + rama temporal Conv U-Net con 4 puentes de cross-attention |
| Parámetros totales | 186,6 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; fragmento de audio de 266.240 muestras (~6 s) |
| Tipos de cuantización | fp32 (checkpoint PyTorch); el original CoreML se exportó en fp16 |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | no disponible |
| Formato de pesos | `.ckpt` (PyTorch), `.yaml` de configuración pymss; original en CoreML `.mlmodelc` |

## Arquitectura y entrenamiento

La rama espectral replica un BS-RoFormer: STFT con ventana 2048 y salto 1024, división en 62 bandas de frecuencia y 12 bloques transformer con atención (tiempo, frecuencia) y RoPE. Cuatro puentes de cross-attention conectan esta rama con la temporal tras las capas 0, 3, 6 y 9. Cada puente combina self-attention temporal, feed-forward, proyección frecuencia→tiempo, cross-attention con Q temporal y KV de la media de bandas, y cross-attention con Q por banda y KV temporal. La salida son seis estimadores de máscara que producen `stft_real` y `stft_imag` de forma [1, 12, 1025, 261]; la máscara ya está multiplicada por la STFT en el grafo final.

La rama temporal es una Conv U-Net sobre audio estandarizado globalmente como `(x-mean)/(std+1e-5)`. Parte de Conv1d(2→64, k7) y pasa por tres etapas con convoluciones de stride 8/8/16 y zero-pad de 8, GroupNorm+GELU y dos DConvBlocks por etapa (dilatación 1 y 2 respectivamente, GLU y conexión residual). La decodificación usa ConvTranspose1d y concatenación de skips hasta una salida de 12 canales que se reordena a [1, 6, 2, 266240] y se de-estandariza. La mezcla final es `iSTFT(stft_real + j*stft_imag) + time_output`; el residual temporal es ~1 % de la señal y cancela el sangrado de máscara en pistas vacías. No se dispone de información sobre el dataset de entrenamiento, número de tokens o pasos, ni sobre si hubo RLHF/DPO (no aplica en audio). El checkpoint corresponde a `checkpoint_277000_zeb99ngfer` y el modelo de seis pistas de Logic 13 resultó ser bit-idéntico al de Logic 11.2 (1989/1989 tensores, diferencia absoluta máxima 0).

## Capacidades

- Separación de una mezcla musical en seis pistas de batería (bombo, caja, charles, toms y componentes asociados).
- Procesamiento por fragmentos con solapamiento 2 (paso = chunk_size/2) y fundido lineal de chunk_size/10 muestras, estilo MSST.
- Modos de salida `sum` (por defecto), `spectral` y `time`.
- Inferencia autónoma con solo PyTorch (atención vía `F.scaled_dot_product_attention`, sin einops, beartype ni rotary_embedding_torch).
- Entrada/salida de audio mediante torchaudio con fallback a soundfile + librosa.
- Escritura de resultados en FLAC (`1.flac`…`6.flac` o nombres de pista con `--stem_names`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Remezcla y producción musical: extraer las seis pistas de batería de una mezcla para reequilibrar niveles, sustituir el bombo o procesar la caja por separado en un DAW sin necesidad de Logic Pro.
- Creación de sample packs: generar stems de batería limpios a partir de grabaciones y exportarlos en FLAC para su uso como muestras en producción.
- Edición y limpieza de grabaciones: aislar la batería para eliminar ruido de fondo o bleed de otros instrumentos antes de una mezcla final.
- Investigación en separación de fuentes: usar el checkpoint como referencia para comparar arquitecturas híbridas espectro-temporales frente a BS-RoFormer puro, con correlación por pista de 1.000 frente al modelo de Logic 11.2.
- Automatización de pipelines de audio: el script `inference.py` con chunking y crossfade permite integrar la separación en procesos batch sobre lotes de archivos WAV.
- Docencia y análisis de modelos propietarios: las herramientas `tools/milparse.py` y los scripts de conversión permiten estudiar cómo se extraen pesos de un `.mlmodelc` CoreML y verificar numéricamente el grafo (error absoluto máximo 1,25e-3, relativo 2,0e-4).
- Prototipado en macOS y Linux: al depender solo de PyTorch y soundfile/librosa, se puede ejecutar en entornos sin el framework de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas de verificación de la conversión: error absoluto máximo de 1,25e-3 (relativo 2,0e-4) entre el state dict convertido y el grafo CoreML, y correlación por pista de 1.000 en 30 s de música real frente al modelo de Logic 11.2.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 186,6 M de parámetros en fp32 el modelo ocupa ~747 MB en memoria, más activaciones de la STFT y del U-Net.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM libre; no se especifican modelos concretos (A100, H100, RTX 4090) en la información.
- Cabe en GPU de consumo: previsiblemente sí en cualquier GPU consumer moderna, dado el tamaño del checkpoint, aunque no se confirma en la documentación.
- Opciones de despliegue: script `inference.py` incluido (solo PyTorch); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / fragmento | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| logic-drumsep-model | 186,6 M | 266.240 muestras | BS-RoFormer + Conv U-Net | no disponible | Hugging Face (Sucial) |
| Logic 11.2 `logic_bs_roformer.ckpt` (6 pistas) | no disponible | no disponible | BS-RoFormer | propietaria (Apple) | no distribuido aquí; pesos bit-idénticos |
| BS-RoFormer de referencia (pymss) | no disponible | no disponible | BS-RoFormer | no disponible | implementación en pymss |

No se dispone de datos de benchmarks comparativos con otros separadores de batería (Demucs, Spleeter, MDX) en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en batería; no separa voces, bajo u otros instrumentos.
- Licencia no declarada: el origen es un framework propietario de Apple extraído de Logic Pro 13, lo que plantea dudas legales sobre uso comercial y redistribución.
- El proceso de extracción de pesos desde CoreML puede contravenir los términos de uso del software original; conviene verificar antes de cualquier despliegue en producción.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación subjetiva de calidad (MOS, SDR) publicada.
- Riesgo de artefactos en pasajes con batería electrónica, percusión no convencional o mezclas muy densas; el comportamiento fuera de la distribución de entrenamiento no está documentado.
- El fragmento fijo de 266.240 muestras y el solapamiento 2 condicionan la latencia y la calidad en pistas largas; no se documentan alternativas de chunking adaptativo.
- La rama temporal asume estandarización global por fragmento, lo que puede afectar a señales con dinámica muy variable.
- No apto para tareas de lenguaje, razonamiento, código ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Sucial/logic-drumsep-model
- Repositorio pymss (referenciado en la model card): no disponible como URL en la información
- Framework original: `MAMLStemSplitter.framework` de Logic Pro 13 (Apple), no distribuido públicamente
- Scripts incluidos: `infer/inference.py`, `infer/bs_roformer/bs_roformer.py`, `infer/bs_roformer/logic_drumsep.py`, `tools/milparse.py` (incluidos en el repositorio de Hugging Face)
