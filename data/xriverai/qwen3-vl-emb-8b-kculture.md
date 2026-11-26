# xriverAI/qwen3-vl-emb-8b-kculture

## Resumen

xriverAI/qwen3-vl-emb-8b-kculture es un adaptador LoRA sobre el modelo multimodal de embeddings Qwen/Qwen3-VL-Embedding-8B, especializado en recuperación imagen-texto dentro del dominio de la cultura tradicional coreana. Lo desarrolla el usuario xriverAI y se publica como adaptador PEFT (no como modelo completo): el repositorio de 1,4 GB contiene únicamente los pesos LoRA, por lo que es necesario descargar por separado el modelo base de 8.000 millones de parámetros. Su función es proyectar imágenes y descripciones en coreano a un mismo espacio vectorial para tareas de búsqueda cruzada y verificación de pares imagen-texto.

El modelo resuelve un problema muy concreto: los embeddings genéricos multilingües rinden mal cuando se les pide relacionar fotografías de patrimonio coreano (cerámica, pagodas de piedra, utensilios) con sus denominaciones y descripciones textuales en coreano. Según la model card, el ajuste eleva el Hit@1 de búsqueda por nombre de tipo de 4,9 a 44,3 y el Recall@1 de imagen a descripción de 22,4 a 52,7, a costa de degradar la recuperación de texto genérico en coreano (NDCG medio en MTEB coreano de 80,8 a 53,8).

Es relevante ahora porque ejemplifica el patrón de especialización por dominio mediante LoRA sobre modelos de embedding multimodales grandes, con un coste de entrenamiento y almacenamiento reducido (rank 64) y una licencia permisiva para uso comercial con atribución. No es un modelo generativo: es un extractor de características (pipeline `feature-extraction`) orientado a sistemas de búsqueda y clasificación, no a conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, alpha 128, dropout 0,05) sobre transformer multimodal Qwen3-VL-Embedding-8B |
| Parametros totales | 8.000 millones en el modelo base; el adaptador LoRA se distribuye como pesos PEFT (recuento exacto no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso trunca texto a 1024 tokens y limita imágenes a 262.144 píxeles) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el ejemplo de uso emplea bf16) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga aparte |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-Embedding-8B, un modelo multimodal de la familia Qwen3-VL configurado para generar embeddings (último token oculto, con normalización L2) en lugar de texto generado. El entrenamiento LoRA emplea un dataset de pares foto-descripción de cultura tradicional coreana, con imágenes redimensionadas a un máximo de 262.144 píxeles (equivalente a 512×512). Se usa pérdida InfoNCE, precisión bf16 y tamaño de lote 24, en dos fases: una época con tasa de aprendizaje 2e-5 y media época adicional con datos refinados a 1e-5.

La innovación principal no está en la arquitectura sino en el procedimiento de codificación: para reproducir las métricas hay que usar un prompt de sistema fijo ("Represent the user's input."), tomar el embedding del último token y normalizarlo en L2, tanto para texto como para imagen (esta se inserta con los tokens especiales de visión de Qwen3-VL). El adaptador no modifica el tokenizador ni el procesador; solo los pesos del modelo base mediante PEFT.

## Capacidades

- Generación de embeddings multimodales conjuntos para imagen y texto en coreano.
- Recuperación texto → imagen: búsqueda de fotografías a partir de nombres de tipo ("석탑", "백자 접시"), nombres de piezas o descripciones.
- Recuperación imagen → texto: obtención de la descripción asociada a una fotografía de una pieza patrimonial.
- Verificación de pares imagen-descripción (clasificación binaria de correspondencia) mediante similitud coseno.
- Extracción de características para pipelines de `feature-extraction` (no genera texto libre).
- Especialización de dominio en cultura tradicional coreana; no cubre otras lenguas ni otros dominios con calidad comparable.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de representación, no un LLM conversacional.

## Casos de uso

- Catalogación de museos y archivos patrimoniales: indexar un fondo fotográfico de piezas coreanas y permitir búsquedas por nombre de tipo u objeto, aprovechando el salto de Hit@1 de 4,9 a 44,3 en la tarea nombre → imagen.
- Buscador visual para visitantes: subir una foto de una pieza vista en una exposición y devolver su ficha descriptiva, con Recall@1 de 52,7 en imagen → descripción.
- Deduplicación y control de calidad de inventarios: usar la verificación de pares imagen-descripción (AUC 0,974, TPR 79,2 % a FPR 5 %) para detectar fichas mal etiquetadas o imágenes cruzadas.
- Enriquecimiento de metadatos en plataformas educativas: asignar descripciones candidatas a imágenes sin texto a partir de los vecinos más próximos en el espacio de embeddings.
- Filtrado de resultados en portales de contenidos culturales: reordenar resultados de búsqueda combinando similitud visual y textual dentro del dominio coreano.
- Investigación en humanidades digitales: construir clústeres de piezas por similitud de embedding para estudiar tipologías (cerámica, arquitectura, utensilios) sin anotación manual.
- Moderación o verificación de contenido en marketplaces de antigüedades: comprobar que la foto y la descripción declaradas son coherentes antes de publicar.

## Benchmarks y rendimiento

Resultados de la model card sobre unas 20.000 imágenes de piezas no vistas en entrenamiento. Unidades en porcentaje; MRR y AUC en escala 0-1.

| Tarea | Métrica | Qwen3-VL-Embedding-8B (zero-shot) | Este adaptador |
|---|---|---|---|
| Nombre de tipo → imagen | Hit@1 | 4,9 | 44,3 |
| Nombre de tipo → imagen | Hit@10 | 19,2 | 80,4 |
| Nombre de tipo → imagen | MRR | 0,093 | 0,572 |
| Nombre de pieza → imagen | Hit@1 | 3,5 | 27,4 |
| Nombre de pieza → imagen | Hit@10 | 10,7 | 59,0 |
| Nombre de pieza → imagen | MRR | 0,057 | 0,378 |
| Imagen → descripción | Recall@1 | 22,4 | 52,7 |
| Imagen → descripción | Recall@10 | 42,2 | 78,2 |
| Descripción → imagen | Recall@1 | 15,8 | 32,2 |
| Descripción → imagen | Recall@10 | 32,4 | 65,7 |
| Verificación de pares | AUC | 0,843 | 0,974 |
| Verificación de pares | TPR a FPR 5 % | 22,1 | 79,2 |
| MTEB coreano, recuperación (7 tareas) | NDCG@5 y @10 medio | 80,8 | 53,8 |

Datos de referencia del modelo base publicados en el informe técnico (no comparables directamente con la tabla anterior por usar otro conjunto de evaluación): Hit@1 de 80,2 en las 12 tareas de recuperación de imágenes de MMEB-V2, 74,2 en clasificación de imágenes, 81,1 en VQA de imágenes, 80,1 en el agregado de 36 tareas de imagen de MMEB-V2, NDCG@5 de 75,8 en recuperación de imágenes de documentos (ViDoRe, VisRAG y otros) y NDCG@10 de 69,4 en recuperación multilingüe de MMTEB.

## Requisitos de hardware

- VRAM: aproximadamente 20 GB en bf16 para el modelo base más el adaptador, según la model card.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada; en consumer, RTX 3090/4090 (24 GB) es el mínimo práctico en bf16.
- No cabe en GPU de 8-16 GB en bf16; requeriría cuantización del modelo base, opción no documentada por el autor.
- Despliegue: el ejemplo oficial usa `transformers` (>= 4.57), `peft` y `torch` con `device_map="cuda"`; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y al ser un modelo de embedding multimodal estas herramientas requerirían adaptaciones.
- Latencia y throughput: no disponibles en la información proporcionada.
- Procesamiento: `AutoProcessor` con `max_pixels=262144` y `padding_side="left"`; texto truncado a 1024 tokens en el ejemplo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xriverAI/qwen3-vl-emb-8b-kculture | 8 B (base) + LoRA | no disponible | Cultura tradicional coreana (imagen-texto) | CC BY-SA 4.0 | Hugging Face, adaptador PEFT |
| Qwen/Qwen3-VL-Embedding-8B | 8 B | no disponible | Multimodal general y multilingüe | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas de embedding multimodal de ~8 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible contra el modelo base, que supera al adaptador en recuperación de texto genérico en coreano (80,8 frente a 53,8 de NDCG medio) y queda muy por detrás en las tareas específicas de cultura coreana. No se dispone de datos de otros adaptadores de dominio comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación del rendimiento general: la recuperación de texto en coreano cae de 80,8 a 53,8 de NDCG medio en las 7 tareas de MTEB coreano; el autor recomienda usar el modelo base para documentos generales.
- Sesgo de dominio: el adaptador solo está ajustado para cultura tradicional coreana; su comportamiento fuera de ese ámbito no está evaluado.
- Monolingüe: la etiqueta de idioma es únicamente `ko`; no hay evidencia de calidad en castellano ni en otras lenguas.
- Riesgo de falsos positivos en la verificación de pares: aunque el AUC es 0,974, la tasa de verdaderos positivos al 5 % de falsos positivos es del 79,2 %, insuficiente para decisiones automatizadas sin revisión humana.
- Dependencia estricta del protocolo de codificación: usar otro prompt de sistema, otro token de pooling o no normalizar en L2 invalida las métricas publicadas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución, pero obliga a distribuir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran abrir sus pesos o adaptadores.
- Distribución como adaptador: no es un modelo autónomo; requiere descargar el base (8 B) y gestionar dos artefactos, con el consiguiente coste de almacenamiento y versionado.
- Madurez: repositorio con 0 descargas y 1 like en el momento de la consulta; sin validación comunitaria independiente.
- No apto para generación de texto, razonamiento, código ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xriverAI/qwen3-vl-emb-8b-kculture
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Informe técnico de Qwen3-VL-Embedding: https://arxiv.org/abs/2601.04720
- Benchmark VLM2Vec-V2 (MMEB): https://arxiv.org/abs/2507.04590
- Benchmark MTEB: https://arxiv.org/abs/2210.07316
- Repositorio MTEB: https://github.com/embeddings-benchmark/mteb
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/deed.ko
