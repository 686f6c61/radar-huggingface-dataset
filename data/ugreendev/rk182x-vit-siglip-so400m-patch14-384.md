# UGREENDEV/RK182X-VIT-siglip-so400m-patch14-384

## Resumen

RK182X-VIT-siglip-so400m-patch14-384 es una conversión al formato RKNN del encoder visual del modelo SigLIP `google/siglip-so400m-patch14-384`, publicada por UGREENDEV. No se trata de un modelo nuevo ni de un entrenamiento propio, sino de un artefacto de despliegue: los pesos originales de Google se cuantizan y compilan para ejecutarse sobre la NPU de los SoC Rockchip RK1820 y RK1828. El objetivo es permitir la extracción de características de imagen (image feature extraction) en hardware embebido de bajo consumo sin depender de una GPU.

El modelo base SigLIP (Sigmoid Loss for Language Image Pre-training) es un encoder visión-lenguaje de tipo ViT con parches de 14x14 y resolución de entrada de 384x384, entrenado con una función de pérdida sigmoidea en lugar del contraste softmax habitual. Esta conversión conserva únicamente el encoder visual, no el encoder de texto, por lo que su uso se limita a producir embeddings de imagen, no a tareas de recuperación texto-imagen ni de clasificación zero-shot directa con prompts de texto.

La relevancia del artefacto es práctica: ofrece dos configuraciones cuantizadas (w4a16 y w6a16) listas para la RKNN Runtime v1.1.0, con checksums SHA-256 y documentación de despliegue, lo que facilita integrar un encoder visual de calidad en pipelines de visión por computador sobre dispositivos Rockchip. El repositorio ocupa aproximadamente 0,7 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) tipo SigLIP, parches 14x14, resolución 384x384 |
| Parametros totales | no disponible (el modelo base SigLIP so400m ronda los 400M en el encoder visual; la cifra exacta no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (es un encoder de imagen; no procesa secuencias de texto) |
| Tipos de cuantizacion | w4a16 y w6a16 (pesos 4 o 6 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (el encoder visual no procesa texto; el encoder de texto no se incluye) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.1.0), con config.json y SHA256SUMS por configuración |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP so400m patch14-384, un Vision Transformer que divide la imagen de entrada en parches de 14x14 píxeles y los procesa con atención multi-cabeza. SigLIP se entrena con una pérdida sigmoidea por pares imagen-texto en lugar del contraste softmax de CLIP, lo que según el paper original mejora la eficiencia del entrenamiento y permite prescindir de la normalización global sobre el lote. El tamaño "so400m" corresponde a la variante de aproximadamente 400 millones de parámetros del encoder visual.

Esta publicación no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), ya que se limita a la conversión. La información disponible indica que los artefactos son derivados convertidos de los pesos originales, cuantizados a w4a16 o w6a16 y compilados para la NPU RK182X con 8 núcleos NPU. No se mencionan innovaciones adicionales como decodificación especulativa o atención lineal; el interés técnico reside en la cuantización para NPU y en la verificación de integridad mediante SHA-256.

## Capacidades

- Extracción de características de imagen: genera embeddings visuales a partir de imágenes de 384x384, aptos para tareas de similitud, clustering o búsqueda visual.
- Procesamiento en NPU: ejecución sobre los SoC Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Cuantización configurable: dos variantes (w4a16 y w6a16) para equilibrar precisión y huella de memoria.
- Verificación de integridad: checksums SHA-256 incluidos para validar los artefactos antes del despliegue.
- No incluye encoder de texto: no soporta recuperación texto-imagen, clasificación zero-shot con prompts ni generación de texto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo generativo).
- Capacidades multilingües: no aplica, al no procesar texto.

## Casos de uso

- Búsqueda visual en dispositivos embebidos: extraer embeddings de imágenes con el encoder y compararlos por similitud coseno en un índice local, aprovechando la ejecución en NPU de bajo consumo para cámaras o dispositivos IoT.
- Deduplicación y clustering de imágenes: generar vectores de 384x384 por imagen y agrupar fotografías similares en un pipeline de gestión de archivos o catálogos, sin necesidad de GPU.
- Moderación de contenido visual en el borde: calcular embeddings de imágenes entrantes y compararlos contra un conjunto de referencia de contenido no deseado, ejecutando todo en el SoC RK182X.
- Preprocesado para pipelines multimodales: usar el encoder como extractor de características que alimente un modelo posterior (por ejemplo, un clasificador ligero) en un sistema de visión industrial.
- Reconocimiento y seguimiento en robótica o drones: extraer descriptores visuales en tiempo real sobre RK1820/RK1828 para tareas de localización o reidentificación, donde el consumo energético es crítico.
- Indexación de bibliotecas multimedia: procesar lotes de imágenes en un servidor con aceleradores Rockchip para construir un índice de búsqueda por similitud visual, validando primero los artefactos con SHA-256.
- Prototipado de sistemas de recuperación visual: emplear los embeddings como base para un motor de búsqueda de imágenes en aplicaciones de archivo, comercio o documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (etiqueta de chip RK182X).
- Runtime: RKNN Runtime v1.1.0, con driver y runtime coincidentes; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8 núcleos NPU en las configuraciones publicadas.
- VRAM/GPU: no aplica; el modelo está pensado para NPU, no para GPU convencional. No se dispone de estimaciones de memoria para GPU.
- Cuantización: w4a16 (menor huella) y w6a16 (mayor precisión), ambas a resolución 384x384.
- Despliegue: RKNN Toolkit y RKNN Runtime de Rockchip; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-VIT-siglip-so400m-patch14-384 (esta ficha) | no disponible (~400M en encoder visual) | imagen 384x384 | RKNN (w4a16/w6a16) | Apache 2.0 | Hugging Face, ModelScope |
| google/siglip-so400m-patch14-384 | no disponible (~400M) | imagen 384x384 | safetensors (PyTorch) | Apache 2.0 | Hugging Face |
| google/siglip-base-patch16-224 | no disponible | imagen 224x224 | safetensors (PyTorch) | Apache 2.0 | Hugging Face |
| openai/clip-vit-large-patch14-336 | no disponible | imagen 336x336 | safetensors (PyTorch) | MIT (según modelo) | Hugging Face |

La diferencia principal frente a los modelos base es el formato: esta versión está cuantizada y compilada para NPU Rockchip, mientras que las alternativas son pesos PyTorch para GPU/CPU. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye el encoder visual; el encoder de texto no está presente, por lo que no sirve para tareas texto-imagen ni zero-shot con prompts.
- Requiere hardware Rockchip RK1820 o RK1828 y RKNN Runtime v1.1.0; no es portable a GPU o CPU convencionales sin reconversión.
- La cuantización w4a16/w6a16 puede degradar la precisión de los embeddings respecto a los pesos originales en fp16/fp32; no se documenta el impacto exacto.
- Los artefactos son derivados convertidos, no pesos upstream sin modificar, y siguen sujetos a la licencia del modelo fuente (Apache 2.0) y a las licencias de RKNN Toolkit y RKNN Runtime.
- Deben usarse conjuntamente los ficheros de una misma configuración; mezclar configuraciones puede producir fallos.
- Verificar los checksums SHA-256 antes del despliegue; el modelo no se ha validado en producción según la información disponible.
- Riesgo de sesgos y alucinación: no aplica en el sentido generativo, pero los embeddings pueden heredar sesgos del dataset de entrenamiento de SigLIP, no documentados en esta ficha.
- Sin datos publicados de benchmarks, latencia ni throughput; la idoneidad para un caso concreto debe validarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VIT-siglip-so400m-patch14-384
- Modelo base: https://huggingface.co/google/siglip-so400m-patch14-384
- Paper de SigLIP: https://arxiv.org/abs/2303.15343
- Repositorio de SigLIP en GitHub: https://github.com/google-research/big_vision
- Documentación de RKNN Toolkit2: https://github.com/airockchip/rknn-toolkit2
- ModelScope (descarga alternativa): https://modelscope.cn/models/UGREENDEV/RK182X-VIT-siglip-so400m-patch14-384
