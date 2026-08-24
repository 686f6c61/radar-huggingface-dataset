# SVGsquad/clip-svg-ViT-H-14-ours-hps

## Resumen

CLIP-SVG ViT-H/14 with HPS-style preference alignment es un modelo de similitud imagen-texto basado en la arquitectura CLIP, desarrollado por el equipo SVGsquad. Se trata de un checkpoint que fusiona un adaptador LoRA de rango 16, entrenado con juicios humanos de preferencia sobre pares de imágenes SVG, en el modelo base `SVGsquad/clip-svg-ViT-H-14-ours`. El objetivo es alinear las representaciones de imagen y texto con las preferencias humanas para mejorar la selección y evaluación de SVGs generados.

El modelo tiene aproximadamente 986 millones de parámetros y está pensado para tareas de clasificación zero-shot y cálculo de similitud entre descripciones textuales y renders de SVGs. Su relevancia radica en que incorpora una señal de preferencia humana directamente en el espacio de embeddings, lo que permite priorizar diseños que resultan más atractivos o semánticamente alineados para usuarios reales. Está disponible en Hugging Face con formato safetensors y es compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-H/14 (encoder de imagen y texto) con adaptador LoRA fusionado |
| Parametros totales | 986.109.440 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (CLIP usa secuencias cortas de texto, típicamente 77 tokens) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | no disponibles (presumiblemente inglés, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un CLIP ViT-H/14 estándar, con un encoder de visión basado en Vision Transformer y un encoder de texto Transformer. Sobre este base, se entrena un adaptador LoRA de rango 16 que actualiza únicamente las proyecciones de query y value en los dos últimos bloques transformer de ambos encoders. El entrenamiento se realiza con un loss de preferencia bidireccional sobre pares de imágenes SVG y captions, utilizando el dataset `SVGsquad/svg-human-judgements-caption-image-disjoint-80-20`. Los pesos LoRA se fusionan con el modelo base mediante `PeftModel.merge_and_unload`.

No se especifican detalles sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La innovación principal es la integración de preferencias humanas directamente en el espacio de embeddings CLIP, lo que mejora la correlación con puntuaciones semánticas humanas en la tarea de evaluación de SVGs.

## Capacidades

- Clasificación zero-shot de imágenes SVG: dado un conjunto de captions, el modelo puede asignar la etiqueta más probable a un render SVG.
- Cálculo de similitud imagen-texto: produce embeddings L2-normalizados y usa similitud coseno para medir la alineación semántica entre una imagen y un texto.
- Alineación con preferencias humanas: gracias al adaptador LoRA, las puntuaciones de similitud correlacionan mejor con juicios humanos que el modelo base.
- Especializado en SVGs: entrenado específicamente con renders de SVGs en blanco sobre fondo blanco a 448px, lo que lo hace adecuado para este dominio.
- No soporta tool calling, agentes ni razonamiento multi-step; es un modelo de embeddings, no generativo.

## Casos de uso

- Evaluación automática de calidad de SVGs generados: el modelo puede puntuar la alineación semántica entre un prompt y un SVG renderizado, permitiendo filtrar resultados en pipelines de generación.
- Ranking de diseños SVG para plataformas de stock: dado un conjunto de variantes de un mismo diseño, el modelo puede ordenarlas según su preferencia humana estimada, ayudando a seleccionar la mejor opción para publicación.
- Búsqueda de SVGs por descripción textual: al codificar captions y renders, se puede implementar un buscador que devuelva los SVGs más relevantes a partir de una consulta en lenguaje natural.
- Análisis de preferencias de usuarios: al correlacionar las puntuaciones del modelo con juicios humanos, se pueden estudiar patrones de preferencia en diseños vectoriales.
- Filtrado de datasets de SVGs: el modelo puede utilizarse para limpiar o reordenar grandes colecciones de SVGs según su alineación con descripciones, mejorando la calidad de datos para entrenamiento de otros modelos.
- Integración en flujos de diseño asistido: un diseñador puede usar el modelo para obtener retroalimentación instantánea sobre si un SVG comunica correctamente la idea expresada en un texto.

## Benchmarks y rendimiento

En la model card se reportan métricas de correlación contra puntuaciones humanas de alineación semántica en el split de test (2.374 SVGs, renders blancos a 448px):

| Metrica | Valor |
|---|---|
| Pearson | 0.5895 |
| Kendall tau-b | 0.4861 |
| Spearman | 0.6318 |

No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de razonamiento o generación. Tampoco hay comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 986M parámetros, en FP16 el modelo ocupa aproximadamente 2 GB, y en FP32 unos 4 GB. Para inferencia con un solo batch, 4 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A10, etc.). Para procesamiento por lotes o despliegue concurrente, se recomienda 8 GB o más.
- Es un modelo de embeddings, no generativo, por lo que la inferencia es rápida y no requiere GPUs de gran tamaño como A100 o H100 salvo para uso masivo.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con librerías como Hugging Face Inference Endpoints, vLLM (aunque no es un modelo generativo), o mediante una API personalizada con FastAPI. También puede ejecutarse en CPU, aunque con mayor latencia.
- Latencia y throughput: no se proporcionan datos concretos, pero para un CLIP ViT-H/14 en GPU, la codificación de una imagen y un texto suele tomar decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SVGsquad/clip-svg-ViT-H-14-ours-hps | 986M | no disponible | Correlación con preferencias humanas (Pearson 0.5895) | no disponible | Hugging Face |
| laion/CLIP-ViT-H-14-laion2B-s32B-b79K | ~986M | 77 tokens | Estándar CLIP, sin ajuste a preferencias | MIT (según LAION) | Hugging Face |
| openai/clip-vit-large-patch14 | 428M | 77 tokens | Estándar CLIP, sin especialización en SVG | MIT | Hugging Face |

La comparativa se basa en la arquitectura y el propósito. El modelo de SVGsquad se diferencia por su adaptación específica a SVGs y preferencias humanas, mientras que los otros son CLIP genéricos. No hay datos de rendimiento comparables en benchmarks estándar.

## Limitaciones y advertencias

- Especialización en SVGs: el modelo fue entrenado con renders blancos a 448px; su rendimiento puede degradarse con otros estilos de imagen o resoluciones.
- Idioma: no se especifica el idioma de los captions; probablemente esté entrenado mayoritariamente en inglés, lo que limita su uso multilingüe.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, pero las puntuaciones de similitud pueden ser poco fiables en casos ambiguos.
- Sesgos: los juicios humanos del dataset de entrenamiento pueden contener sesgos culturales o estéticos que se reflejan en las puntuaciones.
- Licencia: no se ha publicado la licencia, por lo que no está claro si su uso comercial está permitido. Se debe contactar con el autor antes de usarlo en producción.
- Sin soporte para tareas generativas: no puede generar SVGs ni texto; solo produce embeddings.
- No se dispone de información sobre el dataset de entrenamiento completo ni sobre posibles limitaciones de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SVGsquad/clip-svg-ViT-H-14-ours-hps
- Modelo base: https://huggingface.co/SVGsquad/clip-svg-ViT-H-14-ours
- Dataset de juicios humanos (mencionado en la model card): `SVGsquad/svg-human-judgements-caption-image-disjoint-80-20` (no se ha encontrado enlace directo)
- Referencia a CLIP ViT-H/14 de LAION: https://huggingface.co/laion/CLIP-ViT-H-14-laion2B-s32B-b79K
