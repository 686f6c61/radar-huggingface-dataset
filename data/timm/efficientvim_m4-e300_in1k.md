# timm/efficientvim_m4.e300_in1k

# EfficientViM-M4 (efficientvim_m4.e300_in1k)

## Resumen

EfficientViM-M4 es un backbone de clasificación de imágenes basado en modelos de espacio de estados (SSM) de la familia Vision Mamba, desarrollado por el MLV Lab (KAIST) y publicado en CVPR 2025. Los pesos de este repositorio fueron entrenados por los autores del paper sobre ImageNet-1k durante 300 épocas (de ahí el sufijo "e300") y están integrados en la librería timm de Ross Wightman, que actúa como mantenedor del repositorio en Hugging Face.

El modelo resuelve el problema de obtener un extractor de características visuales competitivo con un coste computacional muy bajo: 19,6 millones de parámetros, 1,1 GMACs y 4,5 millones de activaciones a una resolución de entrada de 256 x 256 píxeles. Frente a los transformers de visión, que escalan de forma cuadrática con el número de parches, los mecanismos de space state duality (SSD) empleados aquí escalan de forma más favorable, lo que lo hace adecuado para inferencia en el borde y para pipelines de alto volumen.

Su relevancia actual radica en que ofrece una alternativa con licencia MIT, pesos en safetensors y carga directa mediante `timm.create_model`, integrada en el mismo ecosistema que el resto de modelos de timm. Está pensado como cabecera de clasificación o como encoder de características para tareas posteriores, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Mamba (SSM) con mezclador de estado oculto sobre State Space Duality (HSM-SSD) |
| Parametros totales | 19.666.737 (19,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 256 x 256 px) |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados oficiales; convertible a FP16/BF16/INT8 con PyTorch, ONNX Runtime, TensorRT o OpenVINO |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors, cargables con timm; exportable a ONNX |
| Resolucion de entrada | 256 x 256 px |
| GMACs | 1,1 (a 256 x 256) |
| Activaciones | 4,5 M |
| Dataset de entrenamiento | ImageNet-1k (1.000 clases) |
| Epocas de entrenamiento | 300 (sufijo e300) |
| Tamano del repositorio | 0,1 GB |
| Tipo de pipeline | image-classification |

## Arquitectura y entrenamiento

EfficientViM es una familia de backbones de visión que sustituye la autoatención de los transformers por un mecanismo de mezcla de estados basado en state space duality (SSD), la formulación empleada por Mamba-2, e incorpora como innovación principal un mezclador de estado oculto (Hidden State Mixer, HSM). Según el paper, este diseño permite ampliar el estado oculto del SSM sin el coste computacional proporcional que tendría en una implementación estándar, manteniendo un número reducido de parámetros y un coste de 1,1 GMACs por imagen de 256 x 256. La variante m4 corresponde a la escala intermedia de la familia, con 19,6 M de parámetros.

El entrenamiento se realizó sobre ImageNet-1k (aproximadamente 1,28 millones de imágenes de entrenamiento y 50.000 de validación, repartidas en 1.000 clases) durante 300 épocas, a cargo de los autores del paper. La model card no detalla la composición exacta del pipeline de aumento de datos, el optimizador, el esquema de regularización ni si hubo destilación desde un modelo mayor. Tampoco se documenta ningún proceso de ajuste por preferencias humanas (RLHF/DPO), algo que no aplica a un modelo discriminativo de clasificación. Las innovaciones técnicas destacables son el HSM-SSD y la propia eficiencia del bloque, que sitúan el coste por imagen en el rango de las redes convolucionales ligeras.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, devolviendo logits por clase sobre los que se aplica softmax.
- Extracción de mapas de características multinivel mediante `features_only=True`, útil como backbone para detección, segmentación o predicción densa.
- Generación de embeddings globales de imagen con `num_classes=0` o con `forward_head(..., pre_logits=True)`.
- Inferencia eficiente tanto en CPU como en GPU gracias a su presupuesto de 1,1 GMACs y 4,5 M de activaciones.
- Integración nativa con el ecosistema timm (resolución de transformaciones, pesos preentrenados y utilidades de datos).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni planificación.
- No genera texto, código, matemáticas ni audio, y no dispone de modo thinking.
- No procesa vídeo de forma nativa; cada fotograma debe tratarse como una imagen independiente.

## Casos de uso

- Clasificación de imágenes a gran escala en producción: el modelo puede etiquetar lotes de imágenes en pipelines de ingesta con un coste de 1,1 GMACs por imagen, lo que permite procesar volúmenes altos por GPU o incluso en CPU.
- Pre-anotación y curación de datasets: al devolver logits sobre 1.000 clases y embeddings de imagen, sirve para etiquetar automáticamente grandes colecciones antes de una revisión humana, reduciendo el coste de anotación.
- Búsqueda visual y deduplicación: usando `num_classes=0` se obtiene un vector por imagen que puede indexarse en una base vectorial para recuperación por similitud o para detectar duplicados en catálogos.
- Control de calidad industrial: con un ajuste fino sobre las clases de defectos de una línea de producción, actúa como clasificador visual de bajo coste desplegable en hardware modesto junto a la cámara.
- Moderación de contenido: previo fine-tuning sobre categorías propias, puede filtrar imágenes no deseadas en plataformas, aprovechando su baja latencia para actuar en tiempo real.
- Backbone para detección y segmentación: al exponer mapas de características multinivel, se puede acoplar a cabezas tipo detector o segmentador en sistemas de videovigilancia, robótica o conducción asistida.
- Visión en el borde: su tamaño (19,6 M de parámetros) y su coste permiten exportarlo a ONNX, TensorRT, OpenVINO o TFLite y ejecutarlo en dispositivos con recursos limitados, como cámaras inteligentes o móviles.
- Extracción de características para dominios específicos: en imagen médica o teledetección sirve como encoder preentrenado que se ajusta con pocos datos etiquetados del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye la precisión top-1 ni top-5 sobre ImageNet-1k, y la busqueda web realizada no aporta cifras de este checkpoint concreto. La model card remite a la tabla de resultados de timm para consultar métricas de precisión y de tiempo de ejecución, pero esos valores no forman parte de la informacion proporcionada.

Los únicos datos cuantitativos disponibles son de coste computacional:

| Metrica | Valor |
|---|---|
| Parametros | 19,6 M |
| GMACs (256 x 256) | 1,1 |
| Activaciones | 4,5 M |
| Precisión top-1 en ImageNet-1k | no disponible |
| Precisión top-5 en ImageNet-1k | no disponible |
| Throughput y latencia | no disponible |

## Requisitos de hardware

- Peso de los pesos en FP32: aproximadamente 78,7 MB (19.666.737 parametros x 4 bytes).
- Peso de los pesos en FP16/BF16: aproximadamente 39,3 MB; en INT8, aproximadamente 19,7 MB.
- VRAM estimada para inferencia: menos de 1 GB para lotes pequeños, incluyendo activaciones y buffers intermedios. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte CUDA. Una RTX 3060, RTX 4090, L4 o T4 son más que suficientes; A100 o H100 solo tendrían sentido para lotes muy grandes o para entrenamiento.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria; también es viable en iGPU y en CPU para lotes reducidos.
- Opciones de despliegue: timm con PyTorch, `torch.compile`, exportación a ONNX con ONNX Runtime, TensorRT, OpenVINO, CoreML o TFLite; también es cargable desde la librería transformers mediante el envoltorio de timm.
- No aplica a este modelo el despliegue con llama.cpp, Ollama, vLLM o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. La tabla de resultados de timm incluye métricas de tiempo de ejecución por hardware, pero no se han proporcionado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Familia de arquitectura | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| EfficientViM-M4 (este modelo) | Vision Mamba / SSM (HSM-SSD) | 19,6 M | MIT | Hugging Face (timm) y GitHub del paper |
| EfficientViT-M4 | CNN con atención lineal | no disponible | no disponible | timm y Hugging Face |
| MobileNetV4 | CNN con bloques universales | no disponible | no disponible | timm y Hugging Face |
| RepViT / FastViT | CNN con bloques tipo transformer | no disponible | no disponible | timm y Hugging Face |

La comparación cuantitativa de precisión, GMACs y parámetros frente a estas alternativas no puede completarse con la informacion disponible: la model card de este checkpoint solo aporta sus propias métricas de coste (19,6 M de parámetros y 1,1 GMACs), y no se han proporcionado los valores correspondientes a los otros modelos. La tabla de resultados de timm, enlazada más abajo, es la referencia indicada por el propio autor para ese tipo de comparación.

## Limitaciones y advertencias

- Modelo discriminativo de 1.000 clases: sin ajuste fino no reconoce categorías fuera de ImageNet-1k, por lo que su uso directo en dominios específicos produce resultados poco fiables.
- No hay riesgo de alucinación textual porque no genera lenguaje, pero sí de falsos positivos con confianza alta en clases de ImageNet; no se documenta la calibración de la salida softmax.
- Sesgos heredados del dataset: ImageNet-1k presenta desequilibrios de clase y sobrerrepresentación de contextos y objetos propios de culturas occidentales. No se han publicado evaluaciones de sesgo o equidad para este checkpoint.
- Resolución de entrada fija de 256 x 256: objetos pequeños o escenas de muy alta resolución pueden degradar la precisión; conviene redimensionar o trocear la imagen antes de la inferencia.
- Es obligatorio aplicar las transformaciones de normalización y redimensionado que devuelve `timm.data.resolve_model_data_config`; usar otras transformaciones altera el rendimiento.
- Robustez ante dominios fuera de distribución (imagen médica, satelital, industrial) no documentada; se requiere ajuste fino y validación propia.
- Licencia MIT: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia. El dataset ImageNet-1k mantiene sus propios términos de uso, independientes de los del modelo.
- En el momento de la consulta el repositorio registra 0 descargas y 0 me gusta, por lo que no cuenta con validación de la comunidad en Hugging Face.
- Los metadatos del Hub indican fecha de creación 2026-09-11 y de actualización 2026-09-11.
- No incluye cabezas para detección, segmentación ni otras tareas densas: usarlo como backbone exige añadir y entrenar las cabezas correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/efficientvim_m4.e300_in1k
- Paper (arXiv:2411.15241): https://arxiv.org/abs/2411.15241
- Repositorio original de los autores: https://github.com/mlvlab/EfficientViM
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Tabla de resultados y métricas de timm: https://github.com/huggingface/pytorch-image-models/tree/main/results
- Documentación de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Organización timm en Hugging Face: https://huggingface.co/timm
- Dataset ImageNet: https://www.image-net.org/
