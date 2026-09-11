# timm/efficientvim_m4_dist.in1k

## Resumen

EfficientViM m4 (dist.in1k) es un modelo de clasificacion de imagenes publicado por el equipo de timm en HuggingFace. Se trata de un backbone de vision derivado del paper "EfficientViM: Efficient Vision Mamba with Hidden State Mixer based State Space Duality" (CVPR 2025), presentado por Sanghyeok Lee, Joonmyung Choi y Hyunwoo J. Kim. El modelo devuelve logits sobre las 1.000 clases de ImageNet-1k y tambien puede emplearse como extractor de caracteristicas.

La variante tiene 21,2 millones de parametros, 1,1 GMACs y 4,5 millones de activaciones con entradas de 256 x 256 pixeles, lo que la situa en el segmento de modelos compactos orientados a inferencia eficiente. La etiqueta "dist" indica que fue entrenada con destilacion sobre ImageNet-1k; el peso de los pesos esta en safetensors bajo licencia MIT.

Su relevancia actual radica en que combina un diseno de space state model (herencia de la familia Mamba) con un esquema de atencion lineal, lo que ofrece un coste computacional muy bajo por imagen sin renunciar a un backbone utilizable para transferencia, extraccion de embeddings o despliegue en hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViM (vision Mamba con hidden state mixer basado en state space duality) |
| Parametros totales | 21.238.741 (21,2 M) |
| Parametros activos | no aplicable (arquitectura densa, no MoE) |
| Longitud de contexto | no aplicable (modelo de vision; entrada de imagen de 256 x 256 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion sobre las 1.000 clases de ImageNet-1k, etiquetas en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,1 GB) |
| GMACs | 1,1 |
| Activaciones | 4,5 M |
| Tamano de imagen de entrada | 256 x 256 |
| Dataset de entrenamiento | ImageNet-1k (con destilacion) |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

EfficientViM pertenece a la familia de modelos de espacio de estados (SSM) aplicados a vision, en la linea inaugurada por Vision Mamba, pero sustituye el mecanismo clasico de recurrencia por un "hidden state mixer" basado en state space duality. Este diseno busca reducir el coste de la mezcla de estados ocultos manteniendo la capacidad de modelar dependencias globales con un coste cercano al lineal respecto al numero de tokens. La variante m4 es la escala concreta de la familia que aqui se publica; el detalle completo de la jerarquia de variantes no esta disponible en la informacion proporcionada.

El entrenamiento se realizo sobre ImageNet-1k con destilacion supervisada por parte de los autores del paper, segun indica la model card. No se especifican en la informacion disponible el numero de epocas, el profesor utilizado para la destilacion, la composicion exacta del pipeline de aumentos ni si se aplicaron fases adicionales de ajuste fino. Tampoco se documentan innovaciones de despliegue como decodificacion especulativa, que no aplican a un clasificador visual.

## Capacidades

- Clasificacion de imagenes en 1.000 clases de ImageNet-1k, devolviendo logits por clase.
- Extraccion de mapas de caracteristicas multi-escala mediante `features_only=True`; en el ejemplo de la model card se obtienen tensores con formas compatibles con etapas de 224, 320 y 512 canales.
- Extraccion de embeddings de imagen (eliminando la cabeza con `num_classes=0` o usando `forward_head(..., pre_logits=True)`) para tareas de similitud o recuperacion.
- Uso como backbone preentrenado para transferencia a otras tareas de vision (deteccion, segmentacion, clasificacion de dominio especifico) anadiendo cabezales.
- Inferencia de coste reducido (1,1 GMACs por imagen de 256 x 256), apta para entornos con presupuesto de computo limitado.
- Integracion nativa con la libreria timm mediante `timm.create_model`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, ni soporte de audio o texto: es exclusivamente un modelo de vision.

## Casos de uso

- Moderacion de contenido visual: clasificador rapido y de bajo coste para prefiltrar imagenes en pipelines de subida de contenido antes de pasar revisores humanos o modelos mas caros.
- Busqueda visual y recuperacion de imagenes: usando los embeddings de la salida pre-logits se puede construir un indice vectorial para busqueda por similitud en catalogos de producto o archivos fotograficos.
- Etiquetado automatico de datasets: generar etiquetas preliminares sobre grandes volumenes de imagenes a 1,1 GMACs por imagen, reduciendo el coste del etiquetado manual previo a la revision.
- Backbone para deteccion o segmentacion: con `features_only=True` se obtienen mapas de caracteristicas multi-escala que alimentan cabezales tipo Faster R-CNN o segmentadores ligeros en despliegues de borde.
- Vision en dispositivo (edge): 21,2 M de parametros y 4,5 M de activaciones permiten ejecutar el modelo en CPU, GPU integrada o aceleradores de baja potencia para inspeccion industrial o robotica.
- Control de calidad industrial: fine-tuning sobre un conjunto reducido de imagenes de defectos para clasificacion en linea de produccion, aprovechando el preentrenamiento en ImageNet-1k.
- Clasificacion de imagenes medicas o cientificas: punto de partida preentrenado para ajuste fino en dominios con pocos datos etiquetados, sujeto a las limitaciones de sesgo del dataset original.
- Clustering y deduplicacion de imagenes: agrupar imagenes visualmente similares en grandes repositorios a partir de los embeddings extraidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina de resultados de timm (https://github.com/huggingface/pytorch-image-models/tree/main/results) para consultar metricas de precision y tiempos de ejecucion, pero los valores concretos no se incluyen en los datos proporcionados. No se deben asumir cifras de top-1, top-5, throughput o latencia sin consultar esa fuente.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 85 MB en FP32 y 42 MB en FP16/BF16, calculado a partir de los 21,2 M de parametros. Las activaciones son muy reducidas (4,5 M), por lo que el consumo adicional es minimo incluso con lotes moderados.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo esta pensado para escenarios de bajo coste, por lo que una NVIDIA T4, una RTX 3060 o incluso una GPU integrada son suficientes. En A100 o H100 el cuello de botella sera el ancho de banda de entrada de datos, no el computo.
- Cabe con holgura en GPU de consumo: si, en practicamente cualquier GPU con al menos 1 GB de memoria, y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: libreria timm y PyTorch como via principal; exportacion a ONNX o TorchScript y conversion a TensorRT para produccion. vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. El dato objetivo conocido es el coste computacional de 1,1 GMACs por imagen de 256 x 256, que indica una carga por inferencia muy inferior a la de backbones convencionales como ResNet-50.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Rendimiento (top-1) |
|---|---|---|---|---|
| EfficientViM m4 dist.in1k | 21,2 M | 256 x 256 | MIT | no disponible |
| ResNet-50 (referencia clasica) | 25,6 M | 224 x 224 | BSD-3 / Apache-2.0 segun implementacion | no disponible en esta ficha |
| DeiT-Tiny | 5,7 M | 224 x 224 | Apache-2.0 | no disponible en esta ficha |
| MobileNetV3-Large | 5,4 M | 224 x 224 | Apache-2.0 | no disponible en esta ficha |

La comparacion cuantitativa de precision no puede completarse con la informacion disponible. Los modelos alternativos citados son opciones habituales en el mismo segmento de clasificacion ligera dentro de timm; para una comparacion rigurosa debe consultarse la tabla de resultados de timm, que recoge precision y tiempos de ejecucion homogeneizados.

## Limitaciones y advertencias

- El modelo solo reconoce las 1.000 clases de ImageNet-1k; no genera descripciones ni responde a instrucciones en lenguaje natural.
- Las etiquetas estan en ingles y siguen la taxonomia de ImageNet-1k, con posibles problemas de granularidad en clases poco representadas.
- Hereda los sesgos del dataset ImageNet-1k, conocido por desequilibrios de representacion geografica, cultural y de genero.
- El termino "alucinacion" no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de la distribucion de entrenamiento.
- La resolucion de entrada de referencia es 256 x 256; usar otras resoluciones sin ajustar los transforms puede degradar el rendimiento.
- Se desconoce el profesor de destilacion, el numero de epocas y los detalles del pipeline de entrenamiento, lo que dificulta reproducir el resultado.
- La licencia MIT permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia; conviene revisar tambien la licencia del paper y del repositorio original por si anaden condiciones.
- Para tareas fuera de la clasificacion de imagen natural (imagen medica, satelite, documentos) se requiere ajuste fino y validacion especifica.
- No se documentan cuantizaciones oficiales ni pesos GGUF/ONNX publicados por el autor; cualquier conversion corre por cuenta del integrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/efficientvim_m4_dist.in1k
- Paper EfficientViM (arXiv): https://arxiv.org/abs/2411.15241
- Repositorio oficial EfficientViM: https://github.com/mlvlab/EfficientViM
- Organizacion timm en HuggingFace: https://huggingface.co/timm
- Repositorio PyTorch Image Models: https://github.com/huggingface/pytorch-image-models
- Resultados y metricas de modelos timm: https://github.com/huggingface/pytorch-image-models/tree/main/results
- Documentacion de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
