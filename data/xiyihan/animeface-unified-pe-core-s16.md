# xiyihan/AnimeFace-Unified-PE-Core-S16

## Resumen

AnimeFace-Unified-PE-Core-S16 es un codificador visual especializado en caras y avatares de personajes de anime, desarrollado por el usuario xiyihan. Se construye sobre el backbone `PE-Core-S/16` de Meta (12 bloques ViT, parches de 16x16, entrada de 224x224, licencia Apache-2.0) y añade tres cabezas desacopladas que, en una sola pasada forward, producen simultáneamente un embedding de identidad de personaje invariante a la expresión, un clasificador de 48 microexpresiones faciales y un embedding residual de expresión intra-personaje.

El modelo resuelve un problema concreto de los pipelines de análisis de conversaciones con avatares: separar la identidad del personaje (quién es) de su estado expresivo (qué cara pone), sin necesidad de ejecutar dos modelos distintos. Con 24,2 millones de parámetros y un peso MNN W4 de 15,17 MiB, está pensado para inferencia en dispositivo (Android, escritorio, web) con latencia de 37,9 ms por imagen en CPU de 4 hilos.

Su relevancia radica en la relación capacidad/tamaño: iguala el 99,3% del Macro AUROC de un tagger de Danbooru de 400M parámetros (2,1 GiB) usando 1/140 del espacio, y supera al codificador de identidad CCIP-caformer-24 (37M) en recuperación de personaje y de skin sobre un benchmark real de 1.099 skins, con vectores de 256 dimensiones frente a 768.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (PE-Core-S/16, 12 bloques, patch 16, 224x224) con tres cabezas desacopladas (MLP de identidad, cross-attention tag query, MLP de resumen de parches) |
| Parametros totales | 24.239.408 (24,2M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | FP32 (ONNX), safetensors PyTorch, MNN W8 (23,93 MiB), MNN W4-HQQ b64 (15,17 MiB) |
| Idiomas soportados | en, zh (etiquetas y documentación; el modelo procesa imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (batch dinámico), MNN (W4 y W8) |

## Arquitectura y entrenamiento

El backbone es un ViT de 12 bloques con 196 tokens de parche (14x14) y dimensión 384. Las cabezas se conectan a distintas profundidades para evitar conflicto de gradientes: la cabeza de identidad (Head A) toma el token global pooled del bloque 11 y proyecta a un embedding L2-normalizado de 256 dimensiones; la cabeza de expresión (Head B) toma los tokens espaciales del bloque 8 y aplica cross-attention con queries de etiquetas para producir 48 logits con activación sigmoide; la cabeza de expresión residual (Head C) combina parches centrales y un resumen de etiquetas para generar un embedding L2-normalizado de 128 dimensiones.

El entrenamiento emplea destilación multi-profesor. Head A se entrena con destilación coseno open-set desde `CCIP-caformer-24` más ArcFace sobre 545 clústeres de skin depurados (tras fusionar 150 skins duplicadas del mismo personaje con coseno CCIP ≥ 0,94). Head B usa BCE con etiquetas suaves de dos profesores (0,65 × CL-Tagger-v2 + 0,35 × DanbooruTagQuery-B/16) y estandarización de logits ponderada por varianza, sobre 14,7k sprites de caras de anime y 3,5k recortes reales de avatares de capturas. Head C se entrena con InfoNCE de negativos duros intra-skin, emparejando plantillas limpias con vistas degradadas (jitter de recorte y desplazamiento, máscaras redondeadas, reescalado, artefactos JPEG).

## Capacidades

- Extracción de embedding de identidad de personaje invariante a la expresión (`e_id`, 256-d, L2-normalizado), útil para recuperación open-set de personajes y skins.
- Clasificación de 48 clases de microexpresión facial de anime (`expr_logits`, sigmoide): ojos, boca, mejillas/efectos (rubor, gota de sudor, lágrimas) y emociones (enfado, sorpresa, alegría, tristeza, grito, rostro inexpresivo, etc.).
- Embedding residual de expresión intra-skin (`e_expr`, 128-d, L2-normalizado) para distinguir variantes sutiles del mismo personaje bajo compresión, recorte y enmascarado de avatar redondeado.
- Procesamiento en una única pasada forward para las tres salidas, sin coste adicional por cabeza.
- Generalización zero-shot a personajes no vistos en entrenamiento (evaluado sobre 22 personajes completamente nuevos).
- Inferencia en dispositivo: exportación MNN W4/W8 para Android y edge, ONNX FP32 para servidor/PC y safetensors para PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es un modelo puramente visual de extracción de características.

## Casos de uso

- Análisis de capturas de conversación con avatares: el modelo identifica al personaje de cada avatar y, en la misma pasada, anota su microexpresión, permitiendo reconstruir quién habla y con qué estado emocional en transcripciones de chats como los de Bilibili.
- Recuperación de personajes y skins en bibliotecas grandes: con `e_id` de 256 dimensiones se indexan miles de skins y se hace búsqueda por similitud; el autor reporta mejor Top-1 de skin exacta que CCIP (58,0% frente a 56,0%) con un índice 3 veces más pequeño.
- Etiquetado automático de ilustraciones y emojis `[image]`: asignar descripciones legibles de expresión (sonrisa, ojos cerrados, rubor, sorpresa) a ilustraciones insertadas en guiones o fichas de personaje.
- Diferenciación de variantes de un mismo personaje: `e_expr` permite agrupar o separar variantes de expresión del mismo outfit bajo condiciones de compresión y recorte típicas de capturas de móvil.
- Inferencia offline en Android: el peso MNN W4 de 15,17 MiB y los 37,9 ms por imagen en CPU de 4 hilos permiten integrar el modelo en una app móvil sin conexión.
- Moderación y filtrado de contenido en plataformas de fan-art: detección de expresiones como enfado, grito o llanto para clasificación automática de ilustraciones.
- Enriquecimiento de pipelines de visión existentes: al compartir backbone con PE-Core-S/16, puede sustituir o complementar extractores genéricos en tareas específicas de dominio anime con un coste de almacenamiento muy reducido.

## Benchmarks y rendimiento

Benchmark de identidad sobre 200 recortes reales de avatar de capturas de chat de Bilibili, 83 personajes (20 no vistos en entrenamiento), biblioteca de 1.099 skins:

| Modelo | Tamano / latencia CPU 4 hilos | Char Top-1 / Top-5 | Skin exacta Top-1 / Top-5 | Personaje no visto Top-1 / Top-5 | Dim. embedding |
|---|---|---|---|---|---|
| CCIP-caformer-24 (37M, baseline) | 21,15 MiB (W4) | 96,5% / 100,0% | 56,0% / 99,0% | 100,0% / 100,0% | 768-d |
| AnimeFace-Unified v2 (FP32) | 95,06 MiB | 97,5% / 100,0% | 58,0% / 99,5% | 100,0% / 100,0% | 256-d |
| AnimeFace-Unified v2 (MNN W4) | 15,17 MiB / 37,9 ms | 97,5% / 100,0% | 58,0% / 99,5% | 100,0% / 100,0% | 256-d |

Reconocimiento de microexpresión zero-shot sobre 287 sprites de 22 personajes no vistos, 12 atributos estándar:

| Modelo | Parametros / tamano | Licencia | Macro AUROC | Macro F1 |
|---|---|---|---|---|
| CL-Tagger-v2 (profesor) | 400M / 2,1 GiB | Custom (sin redistribución) | 0,8288 | 0,5313 |
| AnimeFace-Unified v2 (MNN W8) | 24,2M / 23,93 MiB | Apache-2.0 | 0,8250 | 0,5189 |
| AnimeFace-Unified v2 (MNN W4) | 24,2M / 15,17 MiB | Apache-2.0 | 0,8229 | 0,5190 |
| DanbooruTagQuery-B/16 (profesor) | 96,8M / 369,5 MiB | DINOv3 License | 0,7860 | 0,4721 |

Por atributo destacan `closed_eyes` (0,99), `blush` (0,94) y `surprised` (0,89) en W8; el autor indica que el modelo alcanza el 99,3% del Macro AUROC del tagger de 400M con 1/140 de su tamaño.

## Requisitos de hardware

- VRAM estimada: el modelo FP32 ocupa unos 95 MiB en disco; en GPU la huella es mínima (por debajo de 0,5 GB incluyendo overhead de runtime). Las variantes MNN W4/W8 están pensadas para CPU y NPU móviles.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM sirve; RTX 4090, A100 o H100 están sobredimensionadas para este modelo salvo en escenarios de altísimo throughput por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU.
- Despliegue: ONNX Runtime (CPU/GPU), MNN (Android, edge), PyTorch con safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: 37,9 ms por imagen en CPU de 4 hilos con MNN W4 (según el autor); el resto de combinaciones hardware/cuantización no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnimeFace-Unified-PE-Core-S16 | 24,2M | 224x224 | Identidad 256-d + 48 microexpresiones + residual 128-d | Apache-2.0 | Hugging Face (safetensors, ONNX, MNN) |
| CCIP-caformer-24 | 37M | No disponible | Identidad (768-d) | No disponible en la información | Referenciado como baseline |
| CL-Tagger-v2 | 400M | No disponible | Etiquetas de Danbooru | Custom, sin redistribución | Referenciado como profesor |
| DanbooruTagQuery-B/16 | 96,8M | No disponible | Etiquetas de Danbooru | DINOv3 License | Referenciado como profesor |

Frente a CCIP, AnimeFace-Unified ofrece un embedding 3 veces más pequeño con mejor Top-1 de personaje y de skin exacta. Frente a los taggers de Danbooru, ofrece un modelo 4 a 16 veces menor con Macro AUROC comparable y licencia Apache-2.0, pero limitado a 48 etiquetas de expresión facial en lugar de un vocabulario amplio de tags.

## Limitaciones y advertencias

- Dominio restringido a caras y avatares de anime; no está validado para fotografía real ni para ilustraciones no faciales.
- El clasificador de expresión cubre 48 etiquetas concretas; no reconoce el vocabulario completo de Danbooru ni atributos fuera de ojos, boca, mejillas/efectos y emociones.
- Riesgo de sesgo hacia el estilo visual de los datos de entrenamiento (sprites y capturas de Bilibili); personajes con estilos muy distintos (3D, realista, chibi extremo) pueden degradar el rendimiento.
- El benchmark de identidad se limita a 1.099 skins y 200 consultas; las cifras de generalización a bibliotecas mucho mayores no están documentadas.
- Las métricas de microexpresión proceden de un conjunto de 287 sprites de 22 personajes; la varianza estadística en clases poco frecuentes puede ser alta.
- No hay datos publicados sobre sesgos demográficos, robustez frente a adversarios o comportamiento con imágenes corruptas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `facebook/PE-Core-S-16-384` debe verificarse por separado (el autor indica Apache-2.0); los profesores de destilación tienen licencias propias que no se redistribuyen.
- El modelo no genera texto ni razona: cualquier caso de uso que requiera descripciones en lenguaje natural necesita un componente adicional que consuma los logits y embeddings.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/xiyihan/AnimeFace-Unified-PE-Core-S16
- Modelo base: https://huggingface.co/facebook/PE-Core-S-16-384
