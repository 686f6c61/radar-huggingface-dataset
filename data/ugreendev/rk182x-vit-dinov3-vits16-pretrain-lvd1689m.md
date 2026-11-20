# UGREENDEV/RK182X-VIT-dinov3-vits16-pretrain-lvd1689m

## Resumen

RK182X-VIT-dinov3-vits16-pretrain-lvd1689m es una conversión al formato RKNN del modelo de visión `facebook/dinov3-vits16-pretrain-lvd1689m`, publicada por el usuario UGREENDEV. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto derivado y cuantizado, pensado para ejecutarse sobre las NPU de los chips Rockchip RK1820 y RK1828. El pipeline declarado es `image-feature-extraction`: el modelo produce representaciones vectoriales de imágenes, no texto ni clasificaciones finales.

El modelo base, DINOv3 ViT-S/16, es un transformer de visión con parches de 16x16 y aproximadamente 21 millones de parámetros, entrenado con el método de autosupervisión DINOv3 sobre el conjunto LVD-1689M. Esta conversión concreta aplica cuantización de pesos a 4 bits y activaciones a 16 bits (w4a16), con una resolución fija de entrada de 224x224 píxeles y reparto en 8 núcleos NPU.

Su relevancia es acotada pero específica: permite desplegar un extractor de características visuales de calidad en hardware de borde basado en Rockchip, sin GPU dedicada. Es un artefacto de infraestructura más que un modelo de propósito general, y su utilidad depende por completo del ecosistema RKNN Toolkit y RKNN Runtime en su versión v1.1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/16), parches de 16x16, base DINOv3 |
| Parámetros totales | no disponible (el modelo base ViT-S/16 ronda los 21 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224 píxeles) |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits), con reescalado; 8 núcleos NPU |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | DINOv3 License (license_name: dinov3-license, license: other) |
| Formato de pesos | RKNN (runtime v1.1.0), artefactos derivados cuantizados; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer de la familia DINOv3 en su variante small con patch size 16 (ViT-S/16). El entrenamiento original del modelo base emplea aprendizaje autosupervisado con el objetivo DINOv3 sobre el dataset LVD-1689M, que da nombre al checkpoint. No hay información en la documentación proporcionada sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de ajuste supervisado adicionales.

Esta publicación no incluye entrenamiento propio: es una conversión de los pesos originales al formato RKNN mediante RKNN Toolkit, con cuantización w4a16 y una configuración de 224x224 píxeles distribuida en 8 núcleos NPU. El proceso de conversión y reescalado se documenta en el fichero NOTICE, que también recoge la atribución y las modificaciones respecto a los pesos originales. La innovación técnica relevante aquí no está en el modelo sino en el pipeline de despliegue: empaquetado con manifiesto `config.json`, sumas de verificación SHA-256 y compatibilidad declarada con los chips RK1820 y RK1828.

## Capacidades

- Extracción de características visuales (embeddings) a partir de imágenes de 224x224 píxeles.
- Generación de representaciones densas útiles para tareas posteriores de visión por computador.
- No incluye cabeza de clasificación: la salida son características, no etiquetas ni probabilidades de clase.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.
- Verificación de integridad mediante SHA-256 de los ficheros de configuración.

## Casos de uso

- Búsqueda visual por similitud: extraer embeddings de un catálogo de imágenes y construir un índice vectorial para recuperación por vecino más cercano en dispositivos de borde con RK1820 o RK1828.
- Deduplicación de imágenes en el dispositivo: comparar embeddings para detectar imágenes repetidas o casi idénticas antes de subirlas a la nube, reduciendo ancho de banda.
- Preprocesado para clasificadores downstream: usar las características como entrada de una cabeza ligera entrenada aparte (detección de defectos, clasificación de producto) en cámaras inteligentes o lectores industriales.
- Segmentación y agrupamiento no supervisado: alimentar pipelines de clustering (k-means, DBSCAN) sobre los embeddings para organizar grandes volúmenes de imágenes sin etiquetar.
- Control de calidad en fabricación: comparar la representación de una pieza contra una referencia para marcar desviaciones visuales, aprovechando el bajo consumo de la NPU integrada.
- Indexación de archivos multimedia locales: generar un índice de características en NAS o dispositivos domésticos con SoC Rockchip para búsqueda por contenido sin depender de servicios externos.
- Análisis de imágenes satelitales o de dron en campo: extracción de características a bordo para tareas de cambio de uso del suelo o detección de anomalías con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (NPU integrada), con 8 núcleos NPU configurados.
- Runtime requerido: RKNN Runtime v1.1.0 y driver compatible; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- No requiere GPU dedicada ni VRAM en el sentido convencional (A100, H100, RTX 4090): está diseñado para NPU de borde.
- No cabe ni está pensado para ejecutarse en GPU de consumo mediante llama.cpp, Ollama, vLLM o TGI; esas herramientas no aplican a este formato.
- Opciones de despliegue: RKNN Toolkit y RKNN Runtime de Rockchip; las librerías de runtime no se incluyen en el paquete.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-VIT-dinov3-vits16 (esta ficha) | no disponible (base ViT-S/16) | 224x224 píxeles | RKNN w4a16 | DINOv3 License | Hugging Face y ModelScope, 0 descargas |
| facebook/dinov3-vits16-pretrain-lvd1689m | no disponible (base ViT-S/16) | no disponible | safetensors (presumible, no confirmado) | DINOv3 License | Hugging Face (modelo original) |
| Otros extractores visuales tipo CLIP ViT-S/16 | no disponible | no disponible | safetensors, ONNX, etc. | varía | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo original es el formato (RKNN cuantizado frente a pesos de PyTorch) y el hardware objetivo (NPU Rockchip frente a GPU o CPU).

## Limitaciones y advertencias

- Es un artefacto derivado y cuantizado, no los pesos originales: puede haber degradación de precisión respecto al modelo base DINOv3, aunque no se documenta la magnitud.
- Solo funciona en chips RK1820 y RK1828 con RKNN Runtime v1.1.0; no es portable a otros aceleradores ni a GPU estándar.
- Resolución de entrada fija de 224x224; no admite imágenes de mayor resolución sin reescalado previo.
- No incluye cabeza de clasificación: requiere un componente downstream para tareas supervisadas.
- Sujeto a la DINOv3 License, que impone restricciones de uso; es necesario revisar LICENSE y NOTICE antes de un uso comercial.
- Las librerías de runtime RKNN Toolkit y RKNN Runtime tienen sus propias licencias y no se distribuyen en el paquete.
- Riesgo de sesgo heredado del dataset LVD-1689M del modelo base; no se documenta análisis de sesgo en esta conversión.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de representaciones poco fiables en dominios visuales alejados de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.
- El tamaño del repositorio reportado es 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que la métrica no se ha actualizado.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VIT-dinov3-vits16-pretrain-lvd1689m
- Modelo base: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- ModelScope (descarga alternativa): https://modelscope.cn/models/UGREENDEV/RK182X-VIT-dinov3-vits16-pretrain-lvd1689m
- Documentación de la configuración: `dinov3-vits16-pretrain-lvd1689m-224x224-w4a16-8-rescale/README.md` dentro del repositorio
- Licencia DINOv3: fichero `LICENSE` del repositorio
- Atribución y modificaciones de conversión: fichero `NOTICE` del repositorio
