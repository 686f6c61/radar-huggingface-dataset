# Zeteng/vjepa2.1-vitb-edge-ascend

## Resumen

Zeteng/vjepa2.1-vitb-edge-ascend es un artefacto de pesos publicado en HuggingFace por el usuario Zeteng que empaqueta un codificador de vídeo V-JEPA 2.1 en configuración ViT-B/16, preparado para inferencia en dispositivos de borde: los tags del repositorio mencionan explícitamente Jetson (GPU embebida de NVIDIA) y Ascend (NPU de Huawei). No es un modelo entrenado desde cero, sino una conversión y distribución comunitaria de la familia V-JEPA 2.1 de Meta AI, publicada bajo licencia MIT y con acceso restringido (gated).

V-JEPA 2.1 es la iteración de la línea Video Joint Embedding Predictive Architecture, un modelo auto-supervisado que aprende representaciones de vídeo prediciendo en el espacio latente en lugar de reconstruir píxeles. Según el artículo asociado (arXiv 2603.14482), la familia alcanza resultados de referencia en comprensión visual densa: 77,7 % en Something-Something-V2, 0,307 RMSE en estimación de profundidad sobre NYUv2 con sonda lineal y 5,687 ATE en navegación robótica sobre Tartan Drive.

La relevancia de esta ficha concreta es la de despliegue: un ViT-B/16 con un repositorio de solo 0,2 GB es candidato a ejecutarse en hardware de bajo consumo, algo que los checkpoints ViT-g de la familia no permiten. Ahora bien, la información publicada por el autor es mínima (sin model card descriptiva, sin tabla de benchmarks propia y con acceso condicionado), por lo que buena parte de las especificaciones de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/16 (encoder de vídeo V-JEPA 2.1 con predictor en espacio latente); variante orientada a borde según los tags del repo (edge, jetson, ascend, npu) |
| Parametros totales | No disponible en la información proporcionada. El repositorio ocupa 0,2 GB, lo que sugiere pesos en precisión reducida de decenas de millones de parámetros; un ViT-B/16 estándar ronda los 86 M, pero el autor no publica el recuento |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Al ser un modelo de vídeo, la ventana equivale al número de fotogramas × resolución; el port público de referencia ViT-B/16 de V-JEPA 2.1 opera a 384×384, pero no se confirma para este artefacto |
| Tipos de cuantizacion | No disponible (los tags indican despliegue en NPU y Jetson, pero no se documenta qué precisiones incluye el repo) |
| Idiomas soportados | No aplica / no disponible: el modelo no genera texto ni procesa lenguaje; su entrada es vídeo |
| Licencia | MIT, con acceso restringido (gated) en HuggingFace |
| Formato de pesos | PyTorch (tag `pytorch`); los nombres de archivo concretos (`.pt`, `.safetensors`, `.onnx`, `.om`) no se detallan |

## Arquitectura y entrenamiento

V-JEPA 2.1 pertenece a la familia JEPA (Joint Embedding Predictive Architecture): un encoder de vídeo y un predictor entrenados de forma auto-supervisada para predecir representaciones latentes de regiones enmascaradas del vídeo, en lugar de reconstruir los píxeles originales. Este objetivo evita que el modelo malgaste capacidad en detalles de baja entidad visual y favorece características semánticas y densas, que es justamente lo que el artículo 2603.14482 destaca como principal avance de la versión 2.1 frente a su predecesora. Sobre esa base, Meta entrena cabezas ligeras (sondas lineales) para tareas concretas y, en la variante V-JEPA 2-AC, un modelo de mundo condicionado por acciones latentes para control robótico.

En cuanto a los datos, la información disponible no detalla el número exacto de tokens ni la composición del corpus empleado en V-JEPA 2.1. La documentación pública de Meta sobre V-JEPA 2 sí indica que el entrenamiento se realizó sobre más de un millón de horas de vídeo, además de imágenes, pero ese dato corresponde a la versión 2 y no se confirma para 2.1. El repositorio de Zeteng no documenta proceso de entrenamiento alguno: es una conversión de pesos de Meta (el port análogo de `apiantonio` afirma explícitamente que los pesos son de Meta, copiados sin modificar) más los artefactos necesarios para ejecución en Jetson y Ascend. Tampoco consta RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo puramente visual y auto-supervisado.

## Capacidades

- Extracción de características de vídeo auto-supervisadas, sin necesidad de etiquetas, para alimentar clasificadores o sondas lineales aguas abajo.
- Comprensión visual densa: el artículo de referencia reporta resultados de referencia en estimación de profundidad y correspondencia densa con sondas lineales.
- Clasificación de acciones y vídeo: 77,7 % en Something-Something-V2 según el artículo de V-JEPA 2.1.
- Predicción en espacio latente, útil como modelo de mundo para planificación y navegación (5,687 ATE en Tartan Drive).
- Base para control robótico zero-shot en el caso de la variante V-JEPA 2-AC de Meta, aunque esta ficha corresponde al encoder ViT-B y no se confirma que incluya la cabeza de acción.
- Inferencia en dispositivos de borde: los tags del repositorio apuntan a despliegue en Jetson y Ascend NPU.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión estática genérica ni audio.

## Casos de uso

- Análisis de vídeo en cámara IP con Jetson: el encoder ViT-B/16 en precisión reducida permite extraer embeddings por fotograma o clip directamente en un dispositivo Orin, enviando solo vectores al servidor en lugar del flujo de vídeo completo.
- Detección de anomalías en líneas de producción: se congelan los pesos, se entrena una sonda lineal o un clasificador ligero sobre los embeddings de clips normales y se marca como anomalía cualquier segmento con alta distancia en el espacio latente.
- Indexación y búsqueda semántica de archivos audiovisuales: los embeddings por clip sirven para construir un índice vectorial que permita recuperar escenas por similitud visual sin depender de transcripciones ni metadatos manuales.
- Pre-etiquetado para equipos de anotación: el modelo genera candidatos de clase sobre grandes volúmenes de vídeo y los anotadores solo revisan y corrigen, reduciendo el coste por hora de material etiquetado.
- Navegación de robots móviles en interiores: las representaciones densas del encoder pueden alimentar un módulo de estimación de profundidad o de odometría visual, en línea con los resultados de Tartan Drive reportados para la familia.
- Monitorización de accesibilidad o seguridad en espacios públicos: clasificación de secuencias de vídeo en el propio dispositivo, con la ventaja de que el vídeo no sale del equipo, lo que simplifica el cumplimiento de protección de datos.
- Investigación en representaciones auto-supervisadas: reproducir sondas lineales del artículo sobre un ViT-B asequible, sin necesidad de acceso a un clúster de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint concreto en la información disponible. Los datos siguientes corresponden a la familia V-JEPA 2.1 según el artículo arXiv 2603.14482 y no deben atribuirse sin verificación a esta conversión ViT-B para borde.

| Benchmark | Metrica | Resultado V-JEPA 2.1 (familia) |
|---|---|---|
| Something-Something-V2 | Precision (reconocimiento global) | 77,7 % |
| NYUv2 (profundidad, sonda lineal) | RMSE | 0,307 |
| Tartan Drive (navegación) | ATE | 5,687 |

Para este repositorio en concreto no hay datos de latencia, throughput ni precision tras la conversión a Jetson o Ascend.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamaño del repositorio (0,2 GB), los pesos en precisión reducida caben holgadamente en 2 GB de memoria, incluyendo buffers de activaciones para clips cortos.
- GPU de escritorio: cualquier GPU con 4 GB o más debería poder ejecutar el encoder ViT-B/16; una RTX 4090 o RTX 3090 ofrece margen sobrado para procesar varios clips en paralelo.
- GPU de centro de datos: A100, H100 o L40S solo tienen sentido para procesar lotes grandes de vídeo o para reentrenar sondas; para inferencia unitaria el modelo está sobredimensionado respecto al hardware.
- Dispositivos de borde: los tags del repositorio apuntan a NVIDIA Jetson (familia Orin, con 8-64 GB de memoria unificada) y a NPU Ascend de Huawei (series 310/910, con sus propios toolchains CANN). No se especifica qué modelo exacto se ha validado.
- Opciones de despliegue: PyTorch como base; para Jetson, exportación a ONNX y TensorRT; para Ascend, conversión mediante el toolchain CANN/ATC. No aplica vLLM ni TGI, al no tratarse de un modelo de lenguaje. llama.cpp y Ollama tampoco son adecuados: no hay soporte de arquitectura JEPA de vídeo en esos runners.
- Latencia y throughput: no disponibles. Dependen críticamente del número de fotogramas por clip, la resolución de entrada y la precisión efectiva tras la conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeteng/vjepa2.1-vitb-edge-ascend | No disponible (ViT-B/16, repo de 0,2 GB) | Vídeo; ventana no disponible | Sin benchmarks propios publicados | MIT (gated) | HuggingFace, acceso restringido |
| V-JEPA 2 oficial (Meta, ViT-L/ViT-g) | ~300 M / ~1 B (según variante) | Clips de vídeo de alta resolución | Resultados de referencia en la familia; V-JEPA 2 habilita control robótico zero-shot | Licencia de Meta para los pesos | Repositorio facebookresearch/vjepa2 y colección en HuggingFace |
| V-JEPA 2.1 ViT-B/16 384 (port de apiantonio) | ViT-B/16 (~86 M en la arquitectura estándar) | 384×384 | No disponible en la información | Según pesos originales de Meta | HuggingFace, acceso abierto |
| VideoMAE v2 | No disponible en la información | Vídeo | No disponible en la información | No disponible | HuggingFace |
| DINOv2 (referencia para características visuales densas) | 21 M - 1,1 B según variante | Imagen (no vídeo) | Muy competitivo en tareas densas de imagen | Licencia Apache 2.0 en la mayoría de variantes | HuggingFace, torch.hub |

La comparación relevante es con el port abierto de ViT-B/16 384: mismo backbone, distinto objetivo de despliegue. La ventaja de esta versión es el empaquetado para NPU y Jetson; la desventaja, el acceso restringido y la ausencia de documentación, que dificultan auditoría y reproducibilidad.

## Limitaciones y advertencias

- Ausencia total de model card: el autor no documenta parámetros, resolución, número de fotogramas, precisión ni proceso de conversión. Cualquier uso en producción exige validar primero esas variables por cuenta propia.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que añade fricción a pipelines automatizados y a la reproducibilidad científica.
- Trazabilidad: al tratarse de una redistribución comunitaria de pesos de Meta, conviene verificar que la licencia MIT declarada en el repo es compatible con los términos de los pesos originales antes de un uso comercial.
- Sesgos: no documentados. Al entrenarse sobre vídeo de origen desconocido, es probable que herede sesgos de representación geográfica y demográfica, pero no hay evaluación publicada.
- Alucinación: el concepto no aplica igual que en modelos de lenguaje, pero un predictor latente puede producir representaciones plausibles y erróneas en escenas fuera de distribución (iluminación extrema, oclusiones, dominios no vistos).
- Limitaciones de dominio: sin texto, sin audio y sin generación. No es un modelo multimodal en el sentido habitual y no puede sustituir a un LLM en tareas de razonamiento simbólico.
- Ventana y resolución: al no estar documentadas, un cambio en el número de fotogramas o en la resolución de entrada puede degradar las representaciones de forma silenciosa respecto a las del checkpoint original.
- Sin garantías de rendimiento en Ascend: la conversión a NPU no está validada con métricas; los operadores de atención y las capas de normalización pueden sufrir degradación numérica en precisión reducida.
- Mantenimiento: cero descargas y cero likes en el momento de la consulta; no hay evidencia de soporte activo por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zeteng/vjepa2.1-vitb-edge-ascend
- Repositorio oficial de V-JEPA 2 (Meta): https://github.com/facebookresearch/vjepa2
- Página de investigación de V-JEPA 2 en Meta AI: https://ai.meta.com/research/vjepa/
- Artículo V-JEPA 2.1 (arXiv 2603.14482): https://arxiv.org/html/2603.14482v1
- Documentación de V-JEPA 2 en Transformers: https://huggingface.co/docs/transformers/v5.1.0/en/model_doc/vjepa2
- Port abierto V-JEPA 2.1 ViT-B/16 384: https://huggingface.co/apiantonio/vjepa2.1-vit-base-384
