# thkkaaaaalrg/SIDA-7B

## Resumen

SIDA-7B es un modelo multimodal de segmentación especializado en la detección y localización de regiones manipuladas en imágenes, con especial énfasis en contenido procedente de redes sociales. Se trata de un ajuste fino (fine-tune) del modelo LISA-7B-v1, desarrollado por Zhenglin Huang, Jinwei Hu, Xiangtai Li y colaboradores, y presentado en el artículo "SIDA: Social Media Image Deepfake Detection, Localization and Explanation with Large Multimodal Model" (arXiv:2412.04292), con publicación prevista en CVPR. El modelo recibe una imagen y devuelve, además de una respuesta textual, una máscara de segmentación que señala las zonas alteradas.

La ficha que nos ocupa corresponde a la réplica `thkkaaaaalrg/SIDA-7B`, una reproducción no oficial del repositorio original `saberzl/SIDA-7B`. No consta validación por parte de los autores, no tiene descargas ni interacciones y se creó el 28 de octubre de 2026, mientras que el modelo original se entrenó en febrero de 2025. Para uso en producción conviene acudir al repositorio del autor original y al repositorio de código en GitHub.

El interés del modelo radica en combinar detección de deepfakes con localización a nivel de píxel y explicación en lenguaje natural dentro de un único modelo multimodal, en lugar de encadenar un clasificador binario con un segmentador independiente. Su licencia es la Llama 2 Community License, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de segmentación derivado de LISA-7B-v1; la model card no detalla los componentes internos (codificador visual, LLM base ni módulo de segmentación) |
| Parametros totales | Aproximadamente 7B según la denominación del modelo; no se publica desglose por componente |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas (GPTQ, AWQ, GGUF ni similares) |
| Idiomas soportados | Inglés (campo `language: en` en la model card) |
| Licencia | Llama 2 Community License (Copyright (c) Meta Platforms, Inc.) |
| Formato de pesos | Pesos PyTorch; el repositorio ocupa 16,2 GB. No se especifica si los ficheros están en safetensors o en formato `.bin` |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna. Se sabe que SIDA-7B se inicializa a partir de LISA-7B-v1 y que hereda por tanto el planteamiento de LISA, un modelo multimodal que combina un modelo de lenguaje con un codificador visual y un cabezal de segmentación que produce máscaras a partir de tokens especiales. El repositorio de GitHub del proyecto indica que SIDA-7B se preentrena sobre LISA-7B-v1 y que existe una variante SIDA-13B construida sobre LISA-13B-llama2-v1. No se detallan el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

El entrenamiento se realizó sobre el conjunto SID_Set, formado por imágenes reales, imágenes manipuladas e imágenes completamente sintéticas. La model card sitúa el entrenamiento en febrero de 2025 y declara la métrica de accuracy, aunque no se aportan valores. La innovación declarada en el artículo es la integración en un solo modelo multimodal de tres tareas que habitualmente se abordan por separado: detección, localización a nivel de píxel y explicación en lenguaje natural.

## Capacidades

- Detección de imágenes manipuladas o generadas sintéticamente, orientada a contenido difundido en redes sociales.
- Localización de las regiones alteradas mediante salida de segmentación (máscara), no solo clasificación binaria.
- Generación de explicaciones en lenguaje natural sobre la manipulación detectada, según el título y el planteamiento del artículo.
- Procesamiento conjunto de imagen y texto, al ser un modelo multimodal derivado de LISA.
- Respuesta en inglés, único idioma declarado en la model card.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No se documentan capacidades de audio, vídeo ni modo "thinking" explícito.
- No se documenta la retención de las capacidades conversacionales generales del modelo base; conviene verificar empiricamente antes de asumirlo.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede recibir una imagen publicada y devolver tanto la probabilidad de manipulación como la máscara de las zonas alteradas, lo que permite aplicar políticas diferenciadas (etiquetado, reducción de alcance o retirada) con evidencia visual adjunta.
- Verificación periodística (fact-checking): un redactor puede pasar una imagen viral al modelo para obtener una localización de las zonas sospechosas y una explicación textual que sirva como punto de partida de la verificación, siempre con revisión humana posterior.
- Análisis forense y peritaje: la salida de segmentación facilita documentar en un informe qué regiones concretas presentan indicios de manipulación, en lugar de aportar únicamente una puntuación global.
- Verificación de documentación en procesos de KYC o siniestros: detección de retoques en imágenes aportadas por usuarios (capturas de documentos, fotos de daños) antes de pasarlas a un revisor humano.
- Curación y limpieza de datasets: filtrado automático de imágenes sintéticas o manipuladas en la construcción de corpus de entrenamiento, usando la máscara para descartar o recortar regiones contaminadas.
- Investigación en detección de deepfakes: el modelo sirve como línea base reproducible (pesos abiertos y dataset SID_Set publicado) para comparar nuevas propuestas de detección y localización.
- Sistemas de alerta temprana en campañas electorales o crisis: procesamiento por lotes de imágenes que circulan en redes para priorizar la revisión humana de las más sospechosas, con la explicación como criterio de triaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo afirma que SIDA obtiene un rendimiento superior al de los modelos de detección de deepfakes del estado del arte en SID_Set y en otros benchmarks, pero no se incluyen cifras concretas (ni MMLU, ni métricas de segmentación como IoU o F1) en la documentación accesible. No se deben asumir valores numéricos sin consultar el artículo completo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de pesos ocupa 16,2 GB, por lo que en precisión FP16 se necesita al menos esa cantidad solo para los pesos, más memoria para activaciones y para el codificador visual. En la práctica, un entorno con 24 GB de VRAM es el mínimo razonable para inferencia en FP16 con imágenes de resolución alta.
- GPU profesionales: A100 (40 o 80 GB), H100 y L40S son adecuadas, especialmente para procesamiento por lotes o para trabajar en FP32.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y RTX A6000 (24 GB o más). En tarjetas de 16 GB o menos no es viable en FP16 sin cuantización, y no se publican pesos cuantizados oficiales.
- Opciones de despliegue: al ser un modelo de segmentación multimodal con cabezal propio, no es compatible de forma directa con llama.cpp, Ollama o TGI, que esperan arquitecturas de lenguaje estándar. El despliegue realista pasa por cargar los pesos con PyTorch y el código del repositorio de LISA o de SIDA en GitHub, o mediante un servidor de inferencia propio (por ejemplo, FastAPI con PyTorch).
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de imágenes por segundo en ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SIDA-7B (esta ficha) | ~7B | No disponible | Detección, localización y explicación de manipulaciones en imágenes | Llama 2 Community License | Pesos en HF (réplica no oficial y repositorio original `saberzl/SIDA-7B`) |
| LISA-7B-v1 | ~7B | No disponible | Segmentación guiada por lenguaje (reasoning segmentation) | No disponible en la información proporcionada | Pesos en HF (`xinlai/LISA-7B-v1`); es el modelo base |
| SIDA-13B | ~13B | No disponible | Igual que SIDA-7B, con mayor tamaño | Llama 2 Community License | Pesos publicados según el repositorio de GitHub del proyecto |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información accesible, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La ficha corresponde a una réplica no oficial (`thkkaaaaalrg/SIDA-7B`) sin descargas ni validación de los autores; no hay garantía de que los pesos coincidan con el modelo original. Para producción, usar `saberzl/SIDA-7B`.
- El modelo solo declara inglés; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación en las explicaciones en lenguaje natural: la descripción textual de la manipulación puede no corresponderse con la máscara predicha y debe validarse por separado.
- No se documentan sesgos conocidos, pero al entrenarse sobre imágenes de redes sociales puede heredar sesgos de representación (demografía, iluminación, dispositivos, compresión JPEG) y mostrar falsos positivos en imágenes con retoques legítimos (filtros, edición de color).
- No se publican métricas de falsos positivos ni umbrales recomendados, lo que dificulta calibrar el modelo en un flujo de producción.
- La licencia Llama 2 Community License impone restricciones al uso comercial (límite de 700 millones de usuarios mensuales para productos derivados, obligaciones de atribución y cláusulas de uso aceptable). Requiere revisión legal antes de explotación comercial.
- No hay versiones cuantizadas oficiales, lo que Limita el despliegue en hardware modesto y en entornos de borde.
- El tamaño del repositorio (16,2 GB) y la naturaleza multimodal del pipeline implican requisitos de memoria y tiempos de carga elevados.
- No se documenta el rendimiento en imágenes fuera del dominio de redes sociales (imágenes médicas, satelitales, documentales), por lo que su uso fuera de ese ámbito es especulativo.

## Enlaces

- Modelo en HuggingFace (réplica): https://huggingface.co/thkkaaaaalrg/SIDA-7B
- Modelo original en HuggingFace: https://huggingface.co/saberzl/SIDA-7B
- Descripción del modelo original: https://huggingface.co/saberzl/SIDA-7B-description
- Repositorio de código en GitHub: https://github.com/hzlsaber/SIDA
- Artículo en arXiv (PDF): https://arxiv.org/pdf/2412.04292
- Artículo en arXiv (abstract): https://arxiv.org/abs/2412.04292
- Dataset SID_Set: https://huggingface.co/datasets/saberzl/SID_Set
- Modelo base LISA-7B-v1: https://huggingface.co/xinlai/LISA-7B-v1
