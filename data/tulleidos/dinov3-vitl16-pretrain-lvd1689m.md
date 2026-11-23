# tulleidos/dinov3-vitl16-pretrain-lvd1689m

## Resumen

DINOv3 ViT-L/16 es un modelo de visión por computador desarrollado por Meta (Facebook AI Research) que implementa un transformer de visión (ViT) de tipo "large" con parches de 16x16 píxeles. Este repositorio concreto, publicado por el usuario `tulleidos`, es una copia sin modificaciones de los pesos originales de Meta en la revisión `ea8dc2863c51be0a264bab82070e3e8836b02d51`, redistribuida bajo la sección 1.b de la licencia DINOv3 para su uso en la aplicación Image2Mesh. No se trata de un modelo afinado ni de una variante: los pesos son idénticos a los oficiales.

El modelo pertenece a la familia DINOv3, la tercera generación de los modelos de auto-supervisión DINO de Meta, que producen representaciones visuales densas de propósito general sin necesidad de etiquetas. Con 303 millones de parámetros, se sitúa en el rango "large" de la familia y está pensado como extractor de características (backbone) para tareas downstream: segmentación, detección, correspondencia densa, clasificación y generación de mallas 3D a partir de imágenes, que es el caso de uso declarado en esta redistribución.

Es relevante ahora porque DINOv3 ha demostrado que las representaciones auto-supervisadas pueden igualar o superar a modelos supervisados en tareas densas, y porque este repositorio facilita el acceso a los pesos en formato `safetensors` listos para cargar con la clase `dinov3_vit` de la librería Transformers. La licencia, sin embargo, es restrictiva y no equivale a una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16), auto-supervisado tipo DINOv3 |
| Parametros totales | 303.129.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo visual, sin capacidades lingüísticas) |
| Licencia | DINOv3 License (identificador `dinov3-license`, campo `license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo "large" con parches de 16x16 píxeles, lo que implica que una imagen de entrada se divide en una rejilla de tokens sobre la que opera la atención global del transformer. El sufijo "pretrain" en el nombre indica que se trata del checkpoint preentrenado, no de una variante afinada para una tarea concreta. La familia DINOv3 se entrena con objetivos auto-supervisados (autodestilación con profesor momentum y pérdidas de consistencia entre vistas), lo que produce representaciones que funcionan bien tanto en tareas globales (clasificación) como densas (segmentación, correspondencia píxel a píxel).

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (irrelevante en un modelo puramente visual) ni innovaciones técnicas específicas de esta revisión. La model card del repositorio redistribuido no incluye esa información; solo declara que es una copia sin modificar de los pesos de Meta y remite a la licencia original.

## Capacidades

- Extracción de características visuales densas: genera embeddings por token y un embedding global (CLS) utilizables como backbone en tareas downstream.
- Segmentación semántica y de instancias mediante cabezas ligeras o métodos de correspondencia sobre las características.
- Correspondencia densa entre imágenes (matching píxel a píxel), útil para tareas de registro y flujo óptico.
- Clasificación de imágenes con un clasificador lineal entrenado sobre las características congeladas.
- Detección de objetos y profundidad monocular cuando se combina con cabezas específicas.
- Reconstrucción 3D y generación de mallas a partir de imágenes (caso de uso declarado por el redistribuidor, Image2Mesh).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo exclusivamente visual.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Generación de mallas 3D a partir de imágenes (Image2Mesh): el modelo actúa como extractor de características visuales que alimenta un decodificador de geometría; su representación densa por token preserva detalle espacial útil para reconstruir superficies.
- Segmentación semántica en pipelines de visión industrial: se congela el backbone y se entrena una cabeza ligera sobre las características, reduciendo el coste de anotación frente a entrenar desde cero.
- Correspondencia de imágenes para registro médico o satelital: las características densas permiten emparejar puntos entre pares de imágenes sin supervisión específica de la tarea.
- Búsqueda visual y recuperación de imágenes: el embedding global CLS sirve como descriptor para indexar y recuperar imágenes similares en un catálogo.
- Preprocesamiento para modelos generativos de imagen o vídeo: las características DINOv3 se usan habitualmente como condicionamiento o regularización en pipelines de difusión.
- Control de calidad visual en producción: detección de defectos o anomalías mediante comparación de características entre imágenes de referencia y de inspección.
- Investigación en representaciones auto-supervisadas: punto de partida para experimentos de probing lineal, fine-tuning parcial o evaluación de propiedades emergentes de las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio redistribuido no incluye métricas y la información de Hugging Face proporcionada no contiene tablas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB para los pesos en precisión original (el repositorio ocupa 1,2 GB); en FP16 unos 0,6 GB y en FP32 unos 1,2 GB. El consumo real de memoria depende del tamaño del lote y de la resolución de entrada, que no se especifica en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños; A100, H100 o RTX 4090 para procesamiento por lotes a alta resolución.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se ajuste el tamaño de lote a la memoria disponible.
- Opciones de despliegue: carga nativa con Transformers usando la clase `dinov3_vit`; exportación a ONNX o TensorRT para producción; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv3 ViT-L/16 (este repo) | 303 M | no disponible | DINOv3 License (restrictiva) | Hugging Face, safetensors |
| DINOv3 ViT-L/16 (original de Meta) | 303 M | no disponible | DINOv3 License (restrictiva) | Hugging Face, safetensors |
| DINOv2 ViT-L/14 | no disponible en esta ficha | no disponible | Apache 2.0 (según versión) | Hugging Face |
| CLIP ViT-L/14 | no disponible en esta ficha | no disponible | MIT (según versión) | Hugging Face |

La comparación con DINOv2 y CLIP se ofrece solo como referencia de categoría; los datos concretos de parámetros, contexto y rendimiento de esos modelos no están en la información proporcionada y no se afirman aquí. La diferencia principal frente a alternativas como CLIP es el objetivo de entrenamiento (auto-supervisión visual pura frente a alineación imagen-texto) y la licencia, más restrictiva en DINOv3.

## Limitaciones y advertencias

- Licencia restrictiva: la DINOv3 License no es una licencia open source estándar; incluye restricciones explícitas sobre usos militares, bélicos y otros usos prohibidos. Es obligatorio revisar `LICENSE.md` antes de cualquier uso comercial.
- Redistribución condicionada: este repositorio existe al amparo de la sección 1.b de la licencia y declara ser una copia sin modificar; cualquier modificación de los pesos queda fuera de ese amparo.
- Sin información sobre sesgos: la model card no documenta sesgos conocidos del dataset de entrenamiento ni evaluaciones de equidad.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero las representaciones pueden producir correspondencias o segmentaciones erróneas en dominios alejados de la distribución de entrenamiento.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Sin datos de rendimiento: no hay benchmarks publicados en la información disponible, por lo que no se puede verificar su calidad frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte por parte del redistribuidor.
- Para producción: conviene validar la resolución de entrada soportada y el comportamiento en dominios específicos antes de desplegar, dado que la información técnica publicada es mínima.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tulleidos/dinov3-vitl16-pretrain-lvd1689m
- Repositorio original de Meta: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Licencia DINOv3 (referenciada en el repositorio): `LICENSE.md` dentro del propio repositorio
