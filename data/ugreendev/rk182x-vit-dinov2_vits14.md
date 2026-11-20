# UGREENDEV/RK182X-VIT-dinov2_vits14

## Resumen

RK182X-VIT-dinov2_vits14 es una conversión al formato RKNN del modelo DINOv2 ViT-S/14 de Meta (facebookresearch/dinov2), publicada por el usuario UGREENDEV. No se trata de un modelo de lenguaje ni de un modelo generativo: es un extractor de características visuales (image feature extraction) pensado para ejecutarse sobre la NPU de los SoCs Rockchip RK1820 y RK1828. El repositorio empaqueta únicamente artefactos compilados, no los pesos originales en safetensors.

El modelo subyacente, DINOv2 ViT-S/14, es un Vision Transformer pequeño (variante "small", parche de 14x14) entrenado con aprendizaje autosupervisado por Meta AI, ampliamente utilizado como backbone congelado para clasificación, segmentación, detección y recuperación de imágenes. Esta conversión concreta aplica cuantización de pesos a 4 bits y activaciones a 16 bits (w4a16) sobre una resolución fija de 224x224 y reparte la inferencia entre 8 núcleos NPU.

Su relevancia es de nicho pero práctica: permite llevar un backbone de visión de referencia a hardware embebido de bajo consumo de la familia Rockchip, algo que hasta ahora requería compilar uno mismo con RKNN Toolkit. La contrapartida es que no incluye cabeza de clasificación, no ofrece benchmarks propios y está atado a una versión concreta de runtime (v1.1.0) y a dos chips específicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/14 de DINOv2) convertido a RKNN |
| Parámetros totales | no disponible (ViT-S/14 de DINOv2 tiene ~22 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 224x224) |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 (modelo fuente); los artefactos son derivados convertidos y quedan sujetos también a las licencias de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); no se distribuyen safetensors ni GGUF |
| Resolución de entrada | 224x224 |
| Chips soportados | RK1820, RK1828 |
| Núcleos NPU | 8 |
| Tamaño del repo | 0.0 GB (según Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de DINOv2 ViT-S/14: un transformer de visión con parches de 14x14 píxeles, entrenado por Meta AI mediante destilación autosupervisada (self-distillation con teacher-student, combinando pérdidas DINO e iBOT) sobre un corpus de imágenes curado a gran escala. El resultado es un extractor de embeddings visuales que funciona bien como backbone congelado sin fine-tuning. En esta conversión no se ha reentrenado nada: solo se ha compilado y cuantizado el grafo para la NPU.

La innovación técnica aquí no está en el modelo sino en el pipeline de despliegue: conversión a RKNN con cuantización w4a16, reparto en 8 núcleos NPU y resolución fija de 224x224. No hay información en la model card sobre el dataset de calibración de la cuantización, el error de reconstrucción introducido ni comparativas de precisión frente al modelo original en fp32. Tampoco se documenta si se aplicó algún tipo de poda o fusión de operadores más allá de la conversión estándar.

## Capacidades

- Extracción de características visuales: genera embeddings de imagen a partir de entradas de 224x224 píxeles.
- Uso como backbone congelado: los vectores resultantes sirven para tareas posteriores (clasificación lineal, recuperación por similitud, clustering) siempre que se añada una cabeza o un índice externo.
- Ejecución en NPU embebida: diseñado para inferencia en los SoCs RK1820 y RK1828 con 8 núcleos NPU.
- No incluye generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No incluye cabeza de clasificación ni detección; solo features.

## Casos de uso

- Búsqueda visual por similitud en dispositivos embebidos: extraer embeddings de un catálogo de imágenes en la NPU del RK1820/RK1828 y almacenarlos en un índice vectorial; la consulta se resuelve por distancia coseno sin salir del dispositivo.
- Deduplicación y agrupación de imágenes en cámaras o dispositivos de captura: usar los embeddings para detectar imágenes casi idénticas o hacer clustering en el borde, reduciendo el ancho de banda hacia el servidor.
- Preprocesado para clasificación ligera: congelar el backbone en la NPU y entrenar una regresión logística o un MLP pequeño en CPU sobre los embeddings para tareas de clasificación específicas del dominio (por ejemplo, control de calidad en línea de producción).
- Detección de anomalías visuales: comparar embeddings de piezas o productos contra una referencia aprendida para señalar desviaciones, aprovechando que DINOv2 generaliza bien sin fine-tuning.
- Segmentación asistida en el borde: usar los mapas de parches del ViT como base para segmentación semántica o de instancias con un cabezal ligero, en escenarios donde no hay GPU disponible.
- Indexación de vídeo o imágenes en dispositivos de bajo consumo: procesar fotogramas en la NPU y enviar solo los vectores al backend, útil en despliegues de videovigilancia o IoT con restricciones térmicas y energéticas.
- Prototipado de pipelines de visión en hardware Rockchip: validar la viabilidad de un producto antes de invertir en un backbone mayor, dado que el modelo es pequeño y la cuantización w4a16 reduce el coste de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (top-1, mAP, recall@k), ni latencia, ni throughput, ni comparación con el DINOv2 ViT-S/14 original en fp32. Tampoco se documenta la pérdida de precisión introducida por la cuantización w4a16.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en NPU, no en GPU. El consumo de memoria depende del SoC RK1820/RK1828 y del runtime RKNN v1.1.0.
- GPU recomendadas: no aplica para esta conversión. Para ejecutar el DINOv2 ViT-S/14 original en fp32 se necesitaría una GPU con al menos unos pocos GB de VRAM, pero ese dato no está en la información proporcionada.
- ¿Cabe en GPU de consumo? La conversión RKNN no; el modelo fuente ViT-S/14 es pequeño y cabría en GPUs de consumo, aunque no se aportan cifras.
- Opciones de despliegue: exclusivamente RKNN Runtime v1.1.0 sobre RK1820 o RK1828. No es compatible con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-VIT-dinov2_vits14 (esta ficha) | no disponible (~22 M en el fuente, sin confirmar) | Imagen 224x224 | w4a16 | Apache 2.0 (fuente) + licencias RKNN | Hugging Face, ModelScope |
| DINOv2 ViT-S/14 original (Meta) | ~22 M (dato no confirmado en la información proporcionada) | Imagen, resolución flexible | fp32/fp16 | Apache 2.0 | GitHub facebookresearch/dinov2, pesos públicos |
| DINOv2 ViT-B/14 original (Meta) | no disponible | Imagen, resolución flexible | fp32/fp16 | Apache 2.0 | GitHub facebookresearch/dinov2 |
| CLIP ViT-S/14 | no disponible | Imagen + texto | fp32/fp16 | no disponible en esta información | Pesos públicos |

La comparación relevante es contra el DINOv2 ViT-S/14 original: misma arquitectura, pero este repositorio añade cuantización w4a16 y compilación para NPU, con la contrapartida de resolución fija, dependencia de runtime y ausencia de métricas de degradación.

## Limitaciones y advertencias

- No incluye cabeza de clasificación: la salida son features; cualquier tarea supervisada requiere un cabezal o índice externo.
- Resolución fija de 224x224: no se documenta soporte para otras resoluciones, lo que limita tareas que requieren detalle fino.
- Cuantización w4a16 sin métricas: no hay evidencia publicada sobre la pérdida de precisión respecto al modelo en fp32.
- Dependencia estricta de runtime: requiere RKNN Runtime v1.1.0 y driver compatible; conviene verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Compatibilidad limitada a RK1820 y RK1828; no funciona en otras NPU Rockchip ni en GPU/CPU genéricas.
- Los artefactos son derivados convertidos, no los pesos originales; quedan sujetos a la licencia Apache 2.0 del modelo fuente y a las licencias de RKNN Toolkit y RKNN Runtime, cuyas librerías no se incluyen en el paquete.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Riesgo de sesgos heredados del corpus de entrenamiento de DINOv2 (no documentados en esta conversión).
- Sin datos de latencia, throughput ni consumo energético, por lo que no se puede dimensionar un despliegue en producción sin medirlo in situ.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VIT-dinov2_vits14
- Repositorio fuente DINOv2: https://github.com/facebookresearch/dinov2
- ModelScope (referenciado en la model card): modelo `UGREENDEV/RK182X-VIT-dinov2_vits14`, revisión `master`
- Documentación de configuración incluida en el repo: `dinov2_vits14-224x224-w4a16-8/README.md`
- Checksums: `dinov2_vits14-224x224-w4a16-8/SHA256SUMS`
- Licencia y atribución: `LICENSE` y `NOTICE` en el repositorio
