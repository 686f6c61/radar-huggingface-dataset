# zxyty/physicalai-birefnet

## Resumen

`zxyty/physicalai-birefnet` es una re-subida de los pesos de BiRefNet (Bilateral Reference Network), una red neuronal dedicada a la segmentación dicotómica de imágenes de alta resolución (DIS, *Dichotomous Image Segmentation*): separar un objeto de primer plano de su fondo con precisión de borde, sin necesidad de indicaciones del usuario. El desarrollo original corresponde a Peng Zheng, Dehong Gao, Deng-Ping Fan y colaboradores (Universidad de Nankai, Northwestern Polytechnical University, NUDT, Aalto University, Shanghai AI Laboratory y University of Trento), y se publicó en CAAI AIR 2024 (arXiv:2401.03407). El repositorio lo publica el usuario `zxyty` bajo licencia MIT y no añade documentación propia: la model card es la del proyecto original.

El modelo resuelve un problema concreto de producción: la generación de máscaras alfa de alta calidad (recorte de fondos, *matting* sin trimap, codificación de objetos camuflados) en una sola pasada *feed-forward*, frente a alternativas como SAM, que requieren *prompts* y no están optimizadas para precisión de contorno. Con 220.700.242 parámetros y un repositorio de 0,4 GB, es lo bastante pequeño para ejecutarse en GPU de consumo.

Su relevancia práctica es doble: por un lado, ofrece una alternativa ligera y de licencia permisiva a los servicios comerciales de *background removal*; por otro, este repositorio en particular es una copia no oficial con 0 descargas y 0 *likes*, por lo que para uso en producción conviene referenciar el repositorio original del autor (`ZhengPeng7/BiRefNet`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación de imagen con encoder jerárquico tipo transformer (familia Swin) y decoder con módulos de referencia bilateral (BRM); no es un modelo generativo de texto |
| Parametros totales | 220.700.242 (~220,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). Resolución de entrada en el ejemplo de la model card: 1024×1024 píxeles |
| Tipos de cuantizacion | No se publican variantes cuantizadas en este repositorio. La model card documenta FP32 y FP16 (`.half()`), además de TF32 (`torch.set_float32_matmul_precision('high')`) |
| Idiomas soportados | No disponible / no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `safetensors`, con código propio (`custom_code`, requiere `trust_remote_code=True`) |
| Pipeline | `image-segmentation` |
| Tareas declaradas | DIS (Dichotomous Image Segmentation), COD (Camouflaged Object Detection), SOD (Salient Object Detection), *background-removal*, *mask-generation* |
| Tamano del repositorio | 0,4 GB |
| Compatibilidad | `endpoints_compatible`, `pytorch_model_hub_mixin`, `model_hub_mixin` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

BiRefNet sigue un esquema encoder-decoder. El encoder es un transformer jerárquico con atención por ventanas (arquitectura de la familia Swin), que extrae características multiescala; el decoder incorpora el *Bilateral Reference Module* (BRM), que combina una referencia interna (características de la propia imagen de entrada, propagadas desde el encoder) y una referencia externa (mapas de alta resolución generados por el propio modelo en etapas intermedias) para refinar los contornos. Sobre esa base se aplican supervisión multi-escala y supervisión de gradientes, orientadas específicamente a la precisión del borde. La variante concreta del backbone no se especifica en la información disponible; el recuento de 220,7 M de parámetros del checkpoint es el dato verificable.

En cuanto a los datos de entrenamiento, la información disponible no detalla el número de tokens ni la composición exacta del *dataset*: el proyecto se asocia al conjunto DIS5K introducido en el paper (arXiv:2401.03407) y a las tareas DIS/COD/SOD que figuran en los tags del repositorio. No se documenta en la model card el uso de RLHF/DPO (no aplica a una tarea de segmentación supervisada) ni innovaciones de decodificación especulativa. La única innovación técnica destacable documentada es el propio mecanismo de referencia bilateral.

## Capacidades

- Segmentación binaria de primer plano con máscara de alta resolución (salida tipo *alpha mask*) a partir de una imagen RGB, sin *prompt* de texto, puntos ni cajas.
- Generación de máscaras para *background removal* en imágenes de producto, retratos y escenas generales.
- Detección y segmentación de objetos camuflados (COD), es decir, objetos con bajo contraste respecto al fondo.
- *Salient Object Detection*: identificación del objeto visualmente dominante en la escena.
- *Matting* sin trimap en variantes del proyecto (la model card original menciona `BiRefNet-matting`; no se confirma que este repositorio concreto incluya esos pesos).
- Procesamiento de vídeo fotograma a fotograma (el proyecto original publica un *notebook* de inferencia sobre vídeo).
- Ejecución en FP16 sobre GPU y en FP32 sobre CPU, con integración vía `transformers` (`AutoModelForImageSegmentation`).
- Sin soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Eliminación de fondos en catálogo de e-commerce**: procesar lotes de fotografías de producto para generar PNG con transparencia o fondos uniformes, sustituyendo servicios de pago por inferencia local con un modelo de 0,4 GB.
- **Postproducción fotográfica y diseño gráfico**: extracción del sujeto con bordes finos para composición en herramientas de edición; la supervisión de gradientes del modelo está orientada precisamente a contornos nítidos.
- **Preprocesado de pipelines de visión por computador**: aislar el objeto de interés antes de un clasificador o detector, reduciendo el ruido de fondo y el coste computacional de las etapas posteriores.
- **Generación automática de máscaras de anotación**: crear *datasets* de segmentación a gran escala a partir de imágenes sin etiquetar, que luego se revisan y corrigen manualmente.
- **Rotoscopia y efectos en vídeo**: aplicar el modelo fotograma a fotograma para separar intérpretes u objetos en secuencias, con la ventaja de no requerir interacción por fotograma.
- **Percepción en robótica y sistemas de inspección**: segmentar objetos sobre cintas transportadoras o en escenas no estructuradas para alimentar módulos de manipulación o control de calidad (el repositorio se publica bajo el nombre `physicalai`, orientado a IA física).
- **Anonimización selectiva**: recortar o enmascarar regiones con información personal en documentos escaneados o capturas, combinándolo con un detector previo.
- **Aplicaciones móviles y de escritorio con cómputo local**: al caber en GPU de consumo y poder ejecutarse en FP16, permite recorte en tiempo casi interactivo sin enviar imágenes a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2401.03407, CAAI AIR 2024) evalúa el modelo en las tareas DIS, COD y SOD con métricas habituales de segmentación (S-measure, F-measure máxima y media, MAE, IoU de contorno), pero los valores numéricos no se incluyen en el material proporcionado y este repositorio espejo no aporta mediciones propias.

## Requisitos de hardware

- **Peso de los pesos en memoria**: ~883 MB en FP32 y ~441 MB en FP16 (220,7 M de parámetros). Coincide con el tamaño del repositorio (0,4 GB).
- **VRAM estimada en inferencia** (estimación a partir del recuento de parámetros, no medida publicada): pico de aproximadamente 3-5 GB en FP16 con resolución 1024×1024 y *batch* 1, dominado por las activaciones del decoder de alta resolución; en FP32, en torno a 6-9 GB.
- **GPU recomendadas**: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4080, RTX 4090) para FP16 a 1024×1024. Para procesamiento por lotes a mayor resolución, A100 o H100 con 40-80 GB permiten *batch* amplio.
- **GPU de consumo**: sí cabe, incluso en tarjetas de 8 GB; en 6 GB puede requerir reducir la resolución de entrada o el *batch*.
- **CPU**: es viable en FP32 para imágenes sueltas, con latencia mucho mayor; útil para procesamiento por lotes sin GPU.
- **Opciones de despliegue**: `transformers` con `AutoModelForImageSegmentation.from_pretrained(..., trust_remote_code=True)`; código nativo del repositorio de GitHub (`models.birefnet.BiRefNet`); *wrappers* de terceros sobre Replicate para el zoo completo de variantes. vLLM, TGI, llama.cpp u Ollama no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada. No se han publicado mediciones de latencia para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Entrada tipica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet (`zxyty/physicalai-birefnet`) | 220,7 M | DIS/SOD/COD sin *prompt*, alta resolución | 1024×1024 | MIT | Pesos en este repo (copia no oficial) y en `ZhengPeng7/BiRefNet` |
| IS-Net (familia DIS) | ~43,9 M | Segmentación dicotómica entrenada con DIS5K | 1024×1024 | No disponible | Pesos publicados por los autores del *benchmark* DIS5K |
| U2-Net | ~44 M | *Salient object detection* | 320×320 | No disponible | Ampliamente replicado; múltiples *ports* |
| SAM (ViT-B / ViT-H) | ~91 M / ~636 M | Segmentación *promptable* (puntos, cajas, máscaras) | 1024×1024 | Apache 2.0 | Pesos oficiales de Meta |

Frente a IS-Net y U2-Net, BiRefNet multiplica por cinco el número de parámetros y añade el mecanismo de referencia bilateral, lo que se traduce en mejor definición de contorno a alta resolución (según la motivación del paper; sin cifras verificables en esta información). Frente a SAM, la diferencia clave es el flujo de uso: BiRefNet no necesita *prompts* y está especializado en una única máscara de primer plano, mientras que SAM es un segmentador general guiado por el usuario.

## Limitaciones y advertencias

- **Repositorio espejo no oficial**: publicado por `zxyty` con 0 descargas y 0 *likes*. No hay garantía de que los pesos coincidan bit a bit con los del autor original; para producción conviene usar `ZhengPeng7/BiRefNet` o los *checkpoints* del repositorio de GitHub.
- **Ejecución de código remoto**: el repositorio requiere `trust_remote_code=True` (`custom_code`), lo que implica ejecutar código Python del autor al cargar el modelo. Auditar el código antes de usarlo en entornos sensibles.
- **Metadatos atípicos**: la fecha de creación registrada (2026-10-27) es posterior a la fecha actual y no se corresponde con la del proyecto original, lo que refuerza la naturaleza de re-subida.
- **Sin benchmarks propios**: este repositorio no publica métricas; no se puede verificar su rendimiento sin evaluarlo contra el conjunto de validación de DIS5K.
- **Alucinación en sentido figurado**: el modelo puede generar máscaras espurias o incluir regiones incorrectas en escenas ambiguas, con múltiples objetos candidatos o fondos de color similar al sujeto. No hay mecanismo de abstención ni de confianza calibrada documentado.
- **Bordes difíciles**: pelo, cristal, humo, tejidos translúcidos y sombras suaves suelen degradar la máscara; para esos casos el proyecto original ofrece variantes específicas de *matting* que este repositorio no documenta.
- **Resolución**: el ejemplo de la model card fija 1024×1024; imágenes muy grandes requieren *resize* (pérdida de detalle fino) o *tiling* manual, con el coste de costuras entre parches.
- **Sesgos del dataset**: al entrenarse sobre conjuntos de imágenes de alta resolución orientados a fotografía general (DIS5K y afines), el rendimiento puede caer en dominios alejados: imágenes médicas, microscopía, satélite, documentos o renders sintéticos.
- **Sin capacidades de texto ni multilingües**: no admite instrucciones en lenguaje natural, *tool calling* ni razonamiento multi-paso; cualquier flujo agéntico requiere un modelo de lenguaje orquestador externo.
- **Licencia**: el repositorio se declara MIT, lo que permite uso comercial, pero conviene verificar la licencia del backbone preentrenado y las condiciones del *dataset* de entrenamiento antes de un despliegue comercial.

## Enlaces

- Repositorio en HuggingFace (esta ficha): https://huggingface.co/zxyty/physicalai-birefnet
- Pesos originales del autor: https://huggingface.co/ZhengPeng7/BiRefNet
- Repositorio de código: https://github.com/ZhengPeng7/BiRefNet
- Paper en arXiv: https://arxiv.org/pdf/2401.03407
- Paper en revista (CAAI AIR 2024): https://www.sciopen.com/article/pdf/10.26599/AIR.2024.9150038.pdf
- Página del proyecto: https://www.birefnet.top
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ZhengPeng7/BiRefNet_demo
- Notebook de inferencia sobre una imagen: https://colab.research.google.com/drive/14Dqg7oeBkFEtchaHLNpig2BcdkZEogba
- Notebook de inferencia y evaluación: https://colab.research.google.com/drive/1MaEiBfJ4xIaZZn0DqKrhydHB8X97hNXl
- Material adicional (Google Drive): https://drive.google.com/drive/folders/1s2Xe0cjq-2ctnJBR24563yMSCOu4CcxM
- *Wrapper* de terceros sobre Replicate con el zoo completo: https://github.com/sprited-ai/birefnet
