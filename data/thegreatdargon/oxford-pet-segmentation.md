# TheGreatDargon/oxford-pet-segmentation

## Resumen

El modelo `TheGreatDargon/oxford-pet-segmentation` es un modelo de segmentación semántica de imágenes publicado en Hugging Face por el usuario TheGreatDargon. Se trata de una red Feature Pyramid Network (FPN) construida con la librería `segmentation-models-pytorch`, con un codificador ResNet-34 preentrenado en ImageNet y una cabeza de segmentación que produce una única máscara de salida. El problema que resuelve es la separación binaria entre la silueta de la mascota (perro o gato) y el fondo de la imagen, sobre el conjunto de datos Oxford Pet.

El interés práctico del modelo es acotado pero claro: sirve como referencia reproducible de un pipeline de segmentación binaria con un IoU de test de 0,9163 a nivel de dataset y 0,9095 de media por imagen, con solo 23.172.417 parámetros. Ese tamaño lo hace ejecutable en CPU y en cualquier GPU de consumo, y lo convierte en un buen punto de partida para tareas de recorte automático de animales, generación de máscaras para edición fotográfica o preprocesado en pipelines de visión por computador.

No es un modelo de lenguaje ni un modelo multimodal: no procesa texto, no soporta tool calling ni razonamiento multi-paso, y no tiene ventana de contexto. Su ámbito es exclusivamente la segmentación de imágenes RGB de tres canales. Tampoco se documentan en la model card datos de entrenamiento más allá del nombre del dataset, ni variantes cuantizadas, ni resultados de benchmarks adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FPN (Feature Pyramid Network) con codificador ResNet-34, `encoder_depth=5`, `encoder_weights=imagenet`, `decoder_pyramid_channels=256`, `decoder_segmentation_channels=128`, `decoder_merge_policy=add`, `decoder_dropout=0.2`, `decoder_interpolation=nearest`, `upsampling=4` |
| Parametros totales | 23.172.417 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es una imagen RGB de resolución arbitraria) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la etiqueta `languages: python` de la model card se refiere al ecosistema de código, no a idiomas naturales) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), cargable con `PyTorchModelHubMixin` y con `segmentation_models_pytorch.from_pretrained` |
| Canales de entrada | 3 (RGB) |
| Clases de salida | 1 (`classes=1`, segmentación binaria) |
| Funcion de activacion de salida | ninguna (`activation=None`), el modelo devuelve logits en crudo; hay que aplicar sigmoide para obtener probabilidades |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-07 |
| Fecha de ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

La arquitectura es una FPN clásica implementada en `segmentation-models-pytorch`. El codificador es un ResNet-34 de cinco etapas con pesos inicializados desde ImageNet; sobre él se construye un decodificador piramidal que fusiona las features de distintas escalas mediante política de mezcla aditiva (`add`), con 256 canales en la rama piramidal y 128 canales en la rama de segmentación. El upsampling final es de factor 4 con interpolación `nearest` y se aplica un dropout de 0,2 en el decodificador. La salida es un único mapa de logits por píxel, sin activación, lo que obliga a aplicar una sigmoide (o `argmax` sobre umbral 0,5) para obtener la máscara binaria.

El entrenamiento se realizó sobre el dataset Oxford Pet, según declara la propia model card. La model card no especifica el número de tokens ni de épocas, la partición exacta train/val/test empleada, la función de pérdida ni si se aplicaron técnicas de aumento de datos; todos esos datos se consideran no disponibles. Sí se publican dos métricas de evaluación en test: un IoU por imagen de 0,9095 y un IoU agregado de dataset de 0,9163. No se documenta ningún proceso de ajuste por refuerzo ni de preferencias humanas, algo por otra parte esperable en un modelo de segmentación.

## Capacidades

- Segmentación semántica binaria de imágenes RGB: genera una máscara por píxel que separa la mascota del fondo.
- Entrada de 3 canales y salida de 1 canal, pensada para clasificación primer plano/fondo.
- Inferencia a resolución de entrada flexible: al ser totalmente convolucional, admite imágenes de distintos tamaños, aunque el modelo se evaluó en el contexto del dataset Oxford Pet.
- Carga directa con `smp.from_pretrained("<repo>")`, lo que facilita la integración en código Python existente basado en `segmentation-models-pytorch`.
- Exportable a otros formatos de inferencia (ONNX, TorchScript) mediante las utilidades estándar de PyTorch, aunque la model card no documenta ninguna exportación ya realizada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo de razonamiento (thinking mode), visión multi-imagen, audio ni generación de texto.
- No se documentan capacidades de detección de bounding boxes, keypoints ni segmentación de instancias; es un modelo puramente semántico y binario.

## Casos de uso

- Recorte automático de mascotas para edición fotográfica: la máscara generada permite separar al animal del fondo y aplicar desenfoque, sustitución de fondo o viñeteado sin intervención manual, con un IoU de test de 0,9163 que en la práctica se traduce en siluetas ajustadas en la mayoría de imágenes de perros y gatos.
- Etiquetado asistido en datasets de visión: el modelo puede preanotar máscaras sobre imágenes de animales domésticos y reducir el trabajo de anotación humana a una revisión y corrección posterior.
- Preprocesado en pipelines de reconocimiento de razas o identificación individual: la máscara elimina el fondo y deja solo la región del animal, lo que reduce la variabilidad de entrada para clasificadores posteriores.
- Prototipado rápido de producto en startups: al ocupar menos de 100 MB en fp32 y ejecutarse en CPU, permite montar una demo funcional de segmentación de mascotas sin infraestructura GPU.
- Investigación y docencia en segmentación semántica: sirve como baseline reproducible con métricas publicadas para comparar contra U-Net, DeepLabV3+ o SegFormer con el mismo dataset.
- Aplicaciones móviles o de borde con presupuesto de cómputo limitado: 23,17 millones de parámetros y una arquitectura puramente convolucional permiten inferencia en tiempo casi interactivo en hardware modesto tras exportar a ONNX o a un runtime ligero.
- Generación de datasets sintéticos y aumentos: la máscara binaria puede emplearse para componer al animal sobre fondos nuevos, útil para aumentar datos de entrenamiento de otros modelos.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son las métricas de test incluidas en la model card:

| Metrica | Valor |
|---|---|
| IoU por imagen en test (`test_per_image_iou`) | 0,9095007181167603 |
| IoU de dataset en test (`test_dataset_iou`) | 0,9162696003913879 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes de visión como COCO mAP o Pascal VOC mIoU) en la información disponible. Tampoco se documenta la partición de test utilizada ni el procedimiento de evaluación, más allá del nombre de las métricas.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 93 MB en fp32 (23.172.417 parámetros × 4 bytes) y unos 46 MB en fp16/bf16.
- VRAM estimada para inferencia: el peso de los pesos es inferior a 100 MB; el consumo real depende de la resolución de entrada y del tamaño de lote, ya que las activaciones del decodificador piramidal dominan el uso de memoria a resoluciones altas. No se publican cifras concretas de VRAM: no disponible.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para resoluciones moderadas; una RTX 3060, RTX 4060 o superior ofrece margen amplio para lotes grandes. No hay datos publicados de latencia en A100, H100 o RTX 4090: no disponible.
- Cabe en GPU de consumo: sí, de forma holgada. También cabe en GPU integradas y en CPU, dado el tamaño reducido del modelo.
- Opciones de despliegue: inferencia nativa con PyTorch y `segmentation_models_pytorch`; exportación a ONNX o TorchScript para servir con ONNX Runtime, Triton Inference Server o TorchServe. No aplica el despliegue con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no soportan esta arquitectura.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de imágenes por segundo en ningún hardware.

## Comparativa con modelos similares

Alternativas habituales dentro de la misma categoría (segmentación semántica con codificador convolucional preentrenado). La información proporcionada no incluye cifras verificadas de estos modelos, por lo que los campos numéricos se marcan como no disponibles.

| Modelo | Arquitectura | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| TheGreatDargon/oxford-pet-segmentation | FPN + ResNet-34 | 23.172.417 | MIT | Hugging Face, safetensors |
| U-Net con codificador ResNet-34 (`segmentation-models-pytorch`) | U-Net encoder-decoder con skip connections | no disponible | MIT (librería) | Repositorio de la librería |
| DeepLabV3+ con codificador ResNet-34 (`segmentation-models-pytorch`) | DeepLabV3+ con ASPP | no disponible | MIT (librería) | Repositorio de la librería |
| SegFormer-B0 | Transformer jerárquico con decodificador ligero | no disponible | Apache 2.0 (según implementación) | Hugging Face Transformers |

Criterios de comparación: este modelo destaca por su licencia MIT explícita y por publicar métricas de IoU concretas sobre Oxford Pet, pero no ofrece variantes cuantizadas, ni pesos en formato GGUF, ni comparativas directas contra las alternativas en el mismo dataset dentro de la información disponible.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: entrenado sobre Oxford Pet, con perros y gatos como sujetos. El rendimiento fuera de ese dominio (personas, vehículos, escenas interiores) no está caracterizado y probablemente sea deficiente.
- Salida binaria de una sola clase: no distingue entre especies, razas ni instancias individuales; si hay dos animales en la imagen, la máscara los agrupa en el mismo canal.
- Salida en logits: `activation=None` implica que cualquier uso directo debe aplicar sigmoide explícitamente; interpretar los valores crudos como probabilidades produce resultados incorrectos.
- Riesgo de alucinación conceptual: en segmentación, el equivalente son máscaras espurias o bordes imprecisos en imágenes con oclusiones, iluminación adversa, fondos con textura similar al pelaje o resoluciones muy distintas a las de entrenamiento.
- Sesgos potenciales derivados del dataset Oxford Pet: sobrerrepresentación de determinadas razas y de fotografías centradas en el animal, con encuadres y condiciones de iluminación limitados. No se documenta ningún análisis de sesgo.
- Sin información sobre la partición de test ni sobre el protocolo de evaluación, más allá de los dos valores de IoU publicados. La reproducibilidad de las métricas no está garantizada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni issues resueltas. No hay garantía de soporte.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No se documentan restricciones adicionales, pero conviene verificar la procedencia de los pesos derivados de ImageNet antes de un uso comercial estricto.
- Ausencia de variantes cuantizadas o formatos ligeros publicados: cualquier optimización de despliegue (INT8, fp16, ONNX) debe realizarla el usuario por su cuenta.
- La model card no documenta el número de épocas, la función de pérdida, el preprocesado de imágenes ni el esquema de aumentos, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheGreatDargon/oxford-pet-segmentation
- Librería segmentation-models-pytorch (GitHub): https://github.com/qubvel/segmentation_models.pytorch
- Documentación de segmentation-models-pytorch: https://smp.readthedocs.io/en/latest/
- Documentación de PyTorchModelHubMixin: https://huggingface.co/docs/huggingface_hub/package_reference/mixins#huggingface_hub.PyTorchModelHubMixin
- Paper de FPN (Feature Pyramid Networks for Object Detection): no disponible en la información proporcionada
- Paper del dataset Oxford-IIIT Pet: no disponible en la información proporcionada
- Demo o espacio de inferencia asociado: no disponible

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo ni con segmentación de imágenes, por lo que no se han incorporado como fuentes.
