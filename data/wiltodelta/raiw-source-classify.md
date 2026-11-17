# wiltodelta/raiw-source-classify

## Resumen

RAIW Source Classify (nombre interno `multi-provider-source-v7`) es un clasificador forense de imagenes desarrollado por wiltodelta dentro del proyecto `remove-ai-watermarks`. Su funcion es atribuir una imagen a la familia de proveedor de IA generativa que la produjo —OpenAI, Google, ByteDance, Flux, Stable Diffusion, Meta, Midjourney, Ideogram, Firefly o xAI— o abstenerse honestamente como `unknown` cuando el generador es desconocido o el contenedor ha sido manipulado. Ademas, incorpora un detector binario calibrado de contenido sintetico que mantiene su recall incluso cuando la atribucion de proveedor falla.

Tecnicamente no es un transformer de vision puro: combina una rama de caracteristicas fisicas, de subretícula, de sensor y de codec (512 dimensiones) con una rama visual multitarea basada en un ViT-S/16 a 384 px congelado, ejecutado via ONNX Runtime en CPU. Sobre ambas se apilan cabezas NumPy (MLP con FiLM por regimen y bosques HistGradientBoosting) y una etapa final de atribucion de version de modelo y export. El paquete completo pesa 55,53 MB y no requiere PyTorch ni permite pickle (`allow_pickle=False`).

Es relevante ahora porque la atribucion de origen de imagenes generadas se ha vuelto un problema operativo real (verificacion de contenido, moderacion, periodismo, cadena de custodia digital) y porque el modelo aborda explicitamente el regimen dificil: imagenes redimensionadas, recomprimidas o transcodificadas por plataformas sociales, donde los detectores de marcas de agua invisibles suelen fallar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: rama fisica/sublattice/sensor/codec (512-d) + ViT-S/16 @ 384 (ONNX, fp16 pesos, computo fp32) + cabezas NumPy (MLP FiLM + HistGradientBoosting) + etapa Stage-2 de versiones |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen) |
| Tipos de cuantizacion | pesos ViT en fp16 dentro del bundle; computo fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` sin pickle (`allow_pickle=False`) con grafo ONNX embebido; tamano del bundle 55,53 MB (repo 3,9 GB) |

## Arquitectura y entrenamiento

El modelo se organiza en varias etapas. La rama fisica extrae 512 dimensiones en cinco bloques: 112 dimensiones de micro-residuos SRM adaptativos sobre teselas nativas solapadas; 128 dimensiones de energia de subretícula modulo-8 y modulo-16 con deteccion de fase secundaria, modulacion VAE interior y estadisticas de peine de cuantizacion DCT 8x8; 144 dimensiones de descomposicion espectral periodica-mas-suave de Moisan con perfil de decaimiento radial y escaner de peine de escala invariante; 96 dimensiones de coherencia de fase espectral entre canales, periodicidad CFA Bayer/Quad-Bayer, pendiente de ruido de disparo heterocedastico y alineacion de aberracion cromatica radial; y 32 dimensiones de vector de regimen de codec, relacion de aspecto, escala y recompresion social.

La rama visual usa un ViT-S/16 a 384 px congelado (linaje `OwensLab/commfor-model-384` / `TensorFold/detectra-v1`, licencia MIT) con cabezas de lectura multitarea que producen un vector de 28 dimensiones (senal sintetica original, 10 proveedores, IA foranea, real no IA, veto grafico, dominio sintetico y embedding). Incluye una pasada condicional de 2 recortes con `short_edge=672` para exportaciones nativas en formato panoramico. Las etapas 1 y 1.5 combinan un ensemble de dos torres en NumPy puro (5 troncales MLP residuales multi-semilla con Regime-FiLM, LayerNorm y SiLU, mas 65 bosques HistGradientBoosting empaquetados) que alimentan un detector de aceptacion de 11 canales, una cabeza de atribucion condicional y una cabeza abierta de proveedor de 82 a 64 a 12 dimensiones. La fusion sintetica final usa un head de 67 a 48 a 1 dimensiones con skip connections. La etapa 2 apila 9 cabezas de version mezcladas sobre 666 dimensiones para atribuir modelo y version de export.

No se documentan en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO (no aplica en clasificacion, pero tampoco se detalla la estrategia de calibracion). La innovacion principal es la combinacion de senales fisicas de pipeline (ruido de sensor, periodicidad de subretícula, espectro de Moisan, estadisticas de codec) con un stem visual congelado, y el diseno de conjunto abierto que prefiere abstenerse (`unknown`) antes que atribuir erroneamente a un proveedor no visto.

## Capacidades

- Clasificacion de atribucion de proveedor entre 10 familias de IA generativa mas la clase `unknown`.
- Deteccion binaria calibrada de contenido sintetico (`synthetic_detected`, `synthetic_probability`) independiente de la atribucion de proveedor.
- Atribucion de version de modelo y export (Stage-2, `version_subfamily`, p. ej. `openai:gpt_image_1_5`).
- Robustez declarada ante redimensionado extrano y transcodificacion de contenedor (recompresion social, cambios de formato).
- Clasificacion de conjunto abierto: generadores no vistos se devuelven como `unknown` en lugar de forzar una etiqueta.
- Distincion frente a contenido no sintetico: fotos de camara, capturas de pantalla, diagramas y documentos escaneados (veto grafico y especificidad declarada).
- Ejecucion en CPU sin PyTorch, via NumPy y ONNX Runtime; API Python (`raiw.classify_source`) y CLI (`remove-ai-watermarks classify-source`).
- No es un detector de SynthID ni decodifica marcas de agua criptograficas o invisibles (`watermark_truth="unknown"`).

## Casos de uso

- Moderacion de contenido en plataformas: clasificar imagenes subidas para marcar contenido sintetico y su proveedor probable, usando `synthetic_probability` como senal calibrada y `unknown` como salida segura cuando el generador no esta cubierto.
- Verificacion periodistica y fact-checking: comprobar si una imagen viral es una exportacion nativa de un generador conocido o si ha pasado por transcodificacion, con la salvedad de que la etiqueta de proveedor no prueba presencia de SynthID.
- Cadena de custodia digital y analisis forense: la rama fisica (SRM, subretícula, espectro de Moisan, CFA, aberracion cromatica) aporta senales interpretables sobre el pipeline de generacion y export, utiles en informes periciales.
- Deteccion de fraude documental y de identidad: el veto grafico y la especificidad sobre capturas, diagramas y documentos permiten filtrar falsos positivos en flujos KYC o verificacion de documentos.
- Pipelines de ingestión de datasets: etiquetar automaticamente imagenes sinteticas por proveedor para auditar la composicion de corpus de entrenamiento y detectar contaminacion por generadores concretos.
- Despliegue en entornos air-gapped o de bajo recurso: el bundle de 55,53 MB con pesos `.npz` sin pickle y ejecucion CPU-only permite integrarlo en servidores sin GPU, con la variable `RAIW_SOURCE_CLASSIFY_WEIGHTS` apuntando al fichero local.
- Automatizacion de catalogos de imagenes: clasificar lotes de assets por origen y version de export (Stage-2) para trazabilidad de licencias y procedencia en bancos de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un script `benchmark.py` con tiers (incluido `--tier frontier`) para evaluacion de conjunto abierto, pero no se aportan cifras de MMLU, HumanEval ni equivalentes de clasificacion en los datos proporcionados.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado explicitamente para CPU-only, con ONNX Runtime y NumPy; no requiere GPU ni PyTorch.
- VRAM: no aplica en el modo documentado; en CPU el consumo de memoria es moderado dado el bundle de 55,53 MB (el repo de 3,9 GB incluye artefactos adicionales).
- GPU recomendadas: no disponibles; el modelo no las requiere. Cualquier GPU compatible con ONNX Runtime serviria, pero no se documenta.
- Cabe en GPU de consumo: irrelevante para el caso de uso principal; no se documenta soporte GPU.
- Opciones de despliegue: paquete `remove-ai-watermarks[source-classify]`, CLI `remove-ai-watermarks classify-source`, scripts `infer.py` y `benchmark.py` ejecutables con `uv run`, Hugging Face Space oficial y servicio en `raiw.cc`, y despliegue air-gapped con `RAIW_SOURCE_CLASSIFY_WEIGHTS`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAIW Source Classify (este) | Clasificador forense hibrido fisico + ViT-S/16 | 10 proveedores + `unknown`, deteccion binaria, version de export | CPU-only, ONNX, sin PyTorch | Apache 2.0 | Hugging Face, Space, raiw.cc |
| Detectores de marca de agua SynthID | Verificacion de payload criptografico | Solo contenido con SynthID | Requiere acceso al decodificador de Google | no disponible | No publico general |
| Clasificadores binarios de IA generativa (genericos) | CNN/ViT de clasificacion | Real vs sintetico, sin atribucion de proveedor | GPU tipica, PyTorch | variable | Multiples en Hugging Face |
| Detectores de frecuencia espectral (p. ej. enfoques tipo DIRE, AEROBLADE) | Reconstruccion o error de autoencoder | Real vs sintetico, sin atribucion de proveedor | GPU, dependiente del modelo difusor | variable | Repos academicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un detector de SynthID: no decodifica ni verifica marcas de agua criptograficas o invisibles; `unknown` no implica ausencia de SynthID y una etiqueta de proveedor no prueba su presencia.
- Las etiquetas describen pipelines completos de generacion y export, por lo que renderer, geometria, codificacion, postprocesado y estado de marca de agua pueden confundirse entre si.
- Riesgo de confusion ante transcodificacion agresiva o generadores no vistos: el modelo puede abstenerse como `unknown` aunque la imagen sea sintetica, aunque mantiene la senal binaria `synthetic_detected`.
- Sesgos no documentados en la informacion disponible; la cobertura esta limitada a las 10 familias de proveedores listadas.
- No se documentan metricas de calibracion, tasas de falsos positivos ni tamanos de dataset de evaluacion, lo que dificulta estimar el rendimiento en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del stem visual `OwensLab/commfor-model-384` / `TensorFold/detectra-v1` bajo licencia MIT; conviene revisar las condiciones de los artefactos incluidos en el repo de 3,9 GB.
- El repo incluye ficheros ejecutables (`infer.py`, `benchmark.py`) que se pueden lanzar con `uv run` directamente desde Hugging Face; en entornos de produccion conviene descargarlos y auditarlos antes de ejecutarlos.
- Al ser un modelo de vision, no procesa texto ni idiomas; la fila de idiomas no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wiltodelta/raiw-source-classify
- Repositorio GitHub: https://github.com/wiltodelta/remove-ai-watermarks
- Demo Colab: https://colab.research.google.com/github/wiltodelta/remove-ai-watermarks/blob/main/docs/source-classify-hf/demo.ipynb
- Space de Hugging Face: https://huggingface.co/spaces/wiltodelta/remove-ai-watermarks
- Servicio web: https://raiw.cc
- Script de inferencia: https://huggingface.co/wiltodelta/raiw-source-classify/resolve/main/infer.py
- Script de benchmark: https://huggingface.co/wiltodelta/raiw-source-classify/resolve/main/benchmark.py
