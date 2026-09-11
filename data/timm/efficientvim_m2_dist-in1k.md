# timm/efficientvim_m2_dist.in1k

## Resumen

EfficientViM (efficientvim_m2_dist.in1k) es un modelo de clasificación de imágenes publicado por el equipo de timm (PyTorch Image Models) en HuggingFace. Se trata de una implementación del backbone EfficientViM propuesto en el paper "EfficientViM: Efficient Vision Mamba with Hidden State Mixer based State Space Duality" (arXiv:2411.15241, CVPR 2025), desarrollado originalmente por Sanghyeok Lee, Joonmyung Choi y Hyunwoo J. Kim (MLV Lab, Universidad de Corea). El modelo que nos ocupa, la variante M2, ha sido entrenada sobre ImageNet-1k mediante destilación por los propios autores del paper.

El modelo resuelve el problema clásico de clasificación de imágenes sobre 1000 clases, pero su interés principal es ser un *backbone* extremadamente ligero: apenas 15,3 millones de parámetros, 0,4 GMACs y 1,9 millones de activaciones para entradas de 224 x 224 píxeles. Esta combinación lo sitúa en la categoría de modelos pensados para despliegue en el borde (edge computing), dispositivos móviles o entornos con presupuesto de cómputo muy reducido, donde arquitecturas transformer convencionales resultan demasiado costosas.

Su relevancia actual radica en que introduce una arquitectura de espacio de estados (SSM, al estilo Mamba) adaptada a visión, con un mezclador de estado oculto y dualidad de espacio de estados (HSM-SSD), que busca combinar la eficiencia de los modelos convolucionales ligeros con la capacidad de modelado de dependencias globales de los transformers. Al integrarse en timm bajo licencia MIT, es directamente utilizable como extractor de características en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Mamba (modelo de espacio de estados, SSM) con mezclador de estado oculto y dualidad de espacio de estados (HSM-SSD) |
| Parametros totales | 15.357.542 (aproximadamente 15,3 M) |
| Longitud de contexto | No aplica; modelo de vision con entrada fija de 224 x 224 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica; modelo de vision, sin capacidades linguisticas |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales declarados en la model card: 0,4 GMACs, 1,9 M de activaciones, resolucion de imagen 224 x 224, tamano del repositorio 0,1 GB y pipeline `image-classification`.

## Arquitectura y entrenamiento

EfficientViM es un modelo de vision basado en space state models (SSM), la familia de arquitecturas popularizada por Mamba y trasladada al dominio visual. Su componente central es el Hidden State Mixer based State Space Duality (HSM-SSD), que reformula el calculo del espacio de estados para hacerlo mas eficiente en terminos de memoria y computo, manteniendo la capacidad de modelar dependencias de largo alcance dentro de la imagen. Frente a los transformers de vision, que escalan cuadraticamente con el numero de parches, el planteamiento SSM busca un coste cercano a lineal, lo que explica los 0,4 GMACs de esta variante M2.

En cuanto al entrenamiento, la model card indica que la variante `dist.in1k` corresponde a un modelo entrenado sobre ImageNet-1k con destilacion, realizada por los autores del paper original. No se especifica en la informacion disponible el numero de tokens o imagenes vistas, la composicion exacta del dataset mas alla de ImageNet-1k, ni si se emplearon tecnicas de ajuste adicionales como RLHF o DPO (no aplicables, por otra parte, a un modelo discriminativo de vision).

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1k, con salida de logits por clase.
- Extraccion de mapas de caracteristicas intermedias (`features_only=True`), devolviendo tensores con formas del estilo (1, 128, 14, 14), (1, 256, 7, 7) y (1, 512, 4, 4).
- Generacion de embeddings de imagen (`num_classes=0` o `forward_head(..., pre_logits=True)`), aptos para busqueda por similitud, recuperacion o clasificacion con cabezas personalizadas.
- Uso como backbone o encoder de caracteristicas en tareas posteriores (deteccion, segmentacion, metric learning) mediante ajuste fino.
- Transformaciones de preprocesado especificas accesibles via `timm.data.resolve_model_data_config`.
- Capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes o procesamiento multilingue: no disponibles (no es un modelo de lenguaje).
- Capacidades de vision mas alla de la clasificacion (deteccion, segmentacion, OCR, VQA): no disponibles de forma nativa.

## Casos de uso

- Clasificacion de imagenes en el borde: con 15,3 M de parametros y 0,4 GMACs, el modelo puede ejecutarse en dispositivos con recursos limitados (Raspberry Pi, moviles, microcontroladores con NPU) para etiquetar imagenes en tiempo real sin conexion a la nube.
- Filtrado y moderacion de contenido visual: clasificacion rapida de imagenes subidas por usuarios en las 1000 categorias de ImageNet como primera capa de un pipeline de moderacion, dejando los modelos pesados para los casos dudosos.
- Recuperacion de imagenes (image retrieval): usando el modelo con `num_classes=0` se obtienen embeddings que permiten indexar un catalogo visual y responder a busquedas por similitud con latencia muy baja.
- Pre-etiquetado de datasets: al ser un modelo destilado y ligero, sirve para anotar automaticamente grandes volumenes de imagenes antes de una revision humana, reduciendo el coste de construccion de datasets.
- Backbone para transfer learning: partiendo de los pesos preentrenados en ImageNet-1k, se puede ajustar la red para tareas especificas (clasificacion medica, industrial, agricola) cuando el presupuesto de computo para el ajuste es reducido.
- Vision por computador en produccion con requisitos de latencia estrictos: integrado en servicios de clasificacion de alta concurrencia donde el coste por inferencia en GPU es un factor critico.
- Extraccion de caracteristicas para pipelines multimodales: los mapas de caracteristicas del modelo pueden alimentar cabezas de deteccion o clasificacion multi-etiqueta en arquitecturas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina de resultados de timm (`https://github.com/huggingface/pytorch-image-models/tree/main/results`) para consultar las metricas de precision y de tiempo de ejecucion, pero no incluye cifras concretas de top-1 o top-5 en ImageNet-1k. Del mismo modo, no se proporcionan numeros de comparacion frente a otros backbones.

Los unicos datos de rendimiento computacional declarados son:

| Metrica | Valor |
|---|---|
| Parametros | 15,3 M |
| GMACs (224 x 224) | 0,4 |
| Activaciones | 1,9 M |
| Resolucion de entrada | 224 x 224 px |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (los pesos ocupan aproximadamente 61 MB en fp32 y unos 31 MB en fp16); el modelo es desplegable incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; resulta adecuado en RTX 4090, RTX 3060, T4, A100 o H100, aunque no necesita ninguna de ellas. El objetivo real de diseno son aceleradores de borde y NPUs.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo, incluidos modelos con 4 GB o menos de VRAM, y tambien en CPU sin aceleracion dedicada.
- Opciones de despliegue: libreria `timm` sobre PyTorch, exportacion a TorchScript, ONNX, TensorRT u OpenVINO para produccion. vLLM, TGI o llama.cpp no son aplicables porque estan orientados a modelos de lenguaje generativos.
- Latencia y throughput estimados: no disponibles. Como referencia estructural, 0,4 GMACs por imagen de 224 x 224 es un coste muy bajo en comparacion con backbones tipo ResNet o ViT, pero no se han facilitado cifras medidas de latencia o imagenes por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos numericos de los modelos comparables, por lo que la comparacion se limita a la categoria arquitectonica. Modelos de la misma familia y tamano que se distribuyen tambien a traves de timm serian:

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| efficientvim_m2_dist.in1k | 15,3 M | 224 x 224 px | MIT | HuggingFace, via timm |
| EfficientViM (otras variantes del paper) | no disponible | no disponible | no disponible | GitHub mlvlab/EfficientViM |
| EfficientViT (backbones ligeros) | no disponible | no disponible | no disponible | via timm |
| MobileNetV3 / EfficientNet-B0 (referencias clasicas de edge) | no disponible | no disponible | no disponible | via timm |

No se dispone de cifras de precision ni de latencia para establecer una comparacion cuantitativa fiable en esta ficha.

## Limitaciones y advertencias

- Modelo puramente discriminativo: no genera texto, no sigue instrucciones, no soporta tool calling ni razonamiento multi-paso.
- Cabeza de clasificacion limitada a las 1000 clases de ImageNet-1k; para categorias fuera de ese conjunto es necesario reentrenar la cabeza final.
- Entrada fija de 224 x 224 px en la configuracion preentrenada; otros tamanos pueden degradar el rendimiento o requerir interpolacion.
- Riesgo de sesgo heredado de ImageNet-1k: sesgos de representacion por clase, origen geografico y contexto cultural propios del dataset de entrenamiento.
- Riesgo de sobreajuste al dominio de ImageNet; en imagenes muy distintas (imagenes medicas, satelitales, industriales) la precision puede caer de forma notable sin ajuste fino.
- Sin información sobre calibracion de las probabilidades; las salidas softmax no deben interpretarse directamente como confianza fiable en produccion.
- Modelo destilado: puede presentar una precision ligeramente inferior a la de un modelo entrenado desde cero con el mismo tamano, aunque mas eficiente.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de copyright. No impone restricciones de uso, pero el usuario es responsable del cumplimiento normativo en su dominio de aplicacion.
- Sin descargas ni likes registrados en el momento de redactar esta ficha; no hay evidencia de comunidad, soporte o mantenimiento mas alla del propio repositorio de timm.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/efficientvim_m2_dist.in1k
- Paper EfficientViM (arXiv:2411.15241): https://arxiv.org/abs/2411.15241
- Repositorio oficial EfficientViM: https://github.com/mlvlab/EfficientViM
- Repositorio timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Pagina de resultados de timm: https://github.com/huggingface/pytorch-image-models/tree/main/results
- Organizacion timm en HuggingFace: https://huggingface.co/timm
- timm en PyPI: https://pypi.org/project/timm/
- Documentacion de timm: https://timm.fast.ai/
