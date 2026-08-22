# TensorVizion/StableDiffusion-1.4-Pruned-openvino

## Resumen

StableDiffusion-1.4-Pruned-openvino es una conversión a formato OpenVINO del modelo Stable Diffusion 1.4 podado (TensorVizion/StableDiffusion-1.4-Pruned), desarrollado por TensorVizion. El modelo original, Stable Diffusion 1.4, es un modelo de difusión latente de texto a imagen creado por CompVis y Stability AI, capaz de generar imágenes de 512x512 píxeles a partir de descripciones textuales. La versión podada reduce el número de parámetros para acelerar la inferencia, y la conversión a OpenVINO permite ejecutarlo eficientemente en hardware Intel (CPU, iGPU, GPU integrada) sin necesidad de una GPU NVIDIA dedicada.

El modelo se distribuye bajo la licencia CreativeML OpenRAIL-M, que permite uso comercial y redistribución con restricciones de contenido. El repositorio tiene un tamaño de 3,5 GB y se carga mediante la librería `optimum-intel` con `OVDiffusionPipeline`. Está diseñado para desarrolladores que necesitan desplegar generación de imágenes en entornos con recursos limitados o en infraestructuras basadas en CPU Intel.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion (UNet + CLIP ViT-L/14 + VAE), versión podada de Stable Diffusion 1.4 |
| Parametros totales | No disponible (el modelo original tiene aproximadamente 860 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (generación de imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo original funciona con prompts en inglés principalmente) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | OpenVINO (IR) y safetensors |

## Arquitectura y entrenamiento

El modelo es una versión podada de Stable Diffusion 1.4, que sigue la arquitectura original de difusión latente: un autoencoder VAE que reduce la dimensionalidad de las imágenes, un UNet como backbone de difusión y un codificador de texto CLIP ViT-L/14 para procesar los prompts. El proceso de poda, realizado con la librería Pruna AI (tag `pruna-ai`), reduce el número de parámetros y/o capas para mejorar la eficiencia, aunque no se han publicado detalles específicos sobre el porcentaje de poda ni el impacto exacto en la calidad de salida.

La conversión a OpenVINO se realizó con `optimum-intel` mediante el espacio de exportación de Hugging Face. Esto transforma los pesos a formato de grafo de OpenVINO, optimizado para ejecución en CPU, iGPU y NPU de Intel. No hay información sobre el conjunto de datos de entrenamiento adicional, ya que se parte del modelo base ya entrenado por CompVis y Stability AI.

## Capacidades

- Generación de imágenes a partir de prompts de texto en inglés, a resolución 512×512 píxeles.
- Soporte de estilos artísticos, escenas realistas y conceptos abstractos según el prompt.
- Funciona como pipeline de texto a imagen mediante `OVDiffusionPipeline` de `optimum-intel`.
- Compatible con hardware Intel (CPU, iGPU, NPU) gracias a la optimización OpenVINO.
- No incluye tool calling, agentes ni razonamiento multimodal; es exclusivamente un generador de imágenes estáticas.

## Casos de uso

- Prototipado rápido de imágenes para diseño conceptual: los diseñadores pueden generar múltiples variaciones de una idea a partir de prompts descriptivos, acelerando la fase de exploración visual.
- Generación de imágenes para documentación técnica: crear ilustraciones simples para manuales o artículos de blog sin necesidad de un diseñador gráfico.
- Aumento de datos en visión por computador: generar imágenes sintéticas para entrenar modelos de clasificación o detección en dominios específicos.
- Despliegue en edge computing: ejecutar la generación de imágenes en dispositivos con CPU Intel (portátiles, mini-PCs, servidores sin GPU), gracias al formato OpenVINO que reduce los requisitos de memoria y cómputo.
- Generación de contenido creativo para juegos o prototipos: crear sprites, fondos o conceptos de personajes a partir de descripciones de texto.
- Servicio de generación de imágenes en entornos con restricciones de hardware: al poder ejecutarse en CPU Intel, se puede ofrecer como endpoint en clústeres Kubernetes sin nodos con GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre FID, CLIP score, tiempos de inferencia ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser una versión podada y en OpenVINO, se espera que requiera menos memoria que Stable Diffusion 1.4 original (que necesita aproximadamente 4 GB en FP16). En CPU puede funcionar con memoria RAM compartida.
- GPU recomendadas: hardware Intel (iGPU, Arc, Iris Xe) o CPU con soporte AVX-512. También puede ejecutarse en GPUs NVIDIA, aunque no es el objetivo principal.
- Consumo en consumer GPU: posible ejecución en GPUs con 4 GB de VRAM o menos, aunque no se ha verificado.
- Opciones de despliegue: `optimum-intel` con `OVDiffusionPipeline`, compatible con OpenVINO runtime. También puede integrarse en ONNX o TGI, pero la vía principal es la de OpenVINO.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Formato | Optimizacion |
|---|---|---|---|---|---|
| Stable Diffusion 1.4 original | ~860 M | 512×512 | CreativeML OpenRAIL-M | PyTorch | Ninguna |
| Stable Diffusion 1.4 Pruned (base) | No disponible | 512×512 | CreativeML OpenRAIL-M | Safetensors | Pruna AI |
| Stable Diffusion 1.4 Pruned OpenVINO | No disponible | 512×512 | CreativeML OpenRAIL-M | OpenVINO | Podado + OpenVINO |
| Stable Diffusion 2.1 | ~865 M | 768×768 | CreativeML OpenRAIL-M | PyTorch | Ninguna |

La principal ventaja de este modelo frente a las alternativas es su formato OpenVINO, que permite ejecución en hardware Intel sin GPU dedicada, a costa de una posible pérdida de calidad por el poda. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- La poda puede reducir la calidad de las imágenes generadas en comparación con Stable Diffusion 1.4 original, especialmente en detalles finos y coherencia de escenas complejas.
- La licencia CreativeML OpenRAIL-M restringe el uso para generar contenido ilegal o dañino, y obliga a compartir la misma licencia con los usuarios si se redistribuye el modelo.
- El modelo está optimizado para hardware Intel; en GPU NVIDIA el rendimiento puede ser inferior al de los modelos originales.
- No se especifica el idioma de los prompts; se asume que funciona mejor en inglés.
- No hay información sobre sesgos o alucinaciones específicas, pero al derivar de Stable Diffusion 1.4, puede heredar sesgos de género y estereotipos presentes en los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorVizion/StableDiffusion-1.4-Pruned-openvino
- Modelo base podado: https://huggingface.co/TensorVizion/StableDiffusion-1.4-Pruned
- Repositorio original de Stable Diffusion (CompVis): https://github.com/CompVis/stable-diffusion
- Repositorio de Stability AI: https://github.com/Stability-AI/generative-models
- Documentación de `optimum-intel`: https://github.com/huggingface/optimum-intel
- Espacio de exportación OpenVINO: https://huggingface.co/spaces/echarlaix/openvino-export
