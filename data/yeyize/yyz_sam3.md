# yeyize/yyz_sam3

## Resumen

yyz_sam3 es un checkpoint de SAM3 (Segment Anything Model 3) en su variante de imagen, publicado por el usuario yeyize en Hugging Face. Está orientado a la detección y segmentación de objetos guiadas por texto, con atención explícita al sector de la moda (prendas de vestir y calzado) y a objetos genéricos. El repositorio ocupa 3,4 GB y contiene un único fichero de pesos (`yyz_sam3.pt`, 3.371.863.977 bytes) acompañado de dos JSON de manifiesto y verificación.

El valor del repositorio no está en un reentrenamiento, sino en el formato de exportación: conserva la nomenclatura oficial de parámetros `detector.*`, empaqueta el estado como `{"model": state_dict}` y documenta una verificación de equivalencia numérica en bf16 frente al modelo de referencia (Mask IoU 0,99921 sobre dos imágenes). Es, por tanto, una vía para cargar pesos de SAM3 con el cargador oficial de imagen, no un modelo nuevo con datos de entrenamiento propios.

El autor reporta BBox AP 0,8857 y Mask AP 0,8664 sobre 301 imágenes de validación internas, evaluadas con el evaluador de COCO. No se declara licencia, ni parámetros totales, ni composición del dataset, por lo que cualquier adopción en producción exige una validación independiente con imágenes y prompts del dominio objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM3 image model (transformador de segmentación guiado por prompts, con cabeza de detección); detalles internos no disponibles |
| Parámetros totales | no disponible (el fichero de pesos ocupa 3.371.863.977 bytes; a bf16 equivaldría a unos 1,69 mil millones de parámetros, estimación no confirmada por el autor) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrada fija de 1008 px) |
| Tipos de cuantización | no disponible; el autor recomienda bf16 o autocast en inferencia |
| Idiomas soportados | chino (zh) e inglés (en) para los prompts de texto |
| Licencia | no disponible; el repositorio no concede licencia nueva y remite a las condiciones de SAM3 y de sus dependencias |
| Formato de pesos | PyTorch `.pt` (`state_dict` con estructura `{"model": state_dict}` y nombres `detector.*`), más `export_manifest.json` y `equivalence_report.json` |
| Tamaño del repositorio | 3,4 GB |
| Tarea declarada | image-segmentation y object-detection |
| Umbral de candidatos brutos | 0,20 |
| Umbral de confianza para visualización y métricas | 0,50 |
| Integridad | SHA256 `48913c07c24a2191e1adf9477e0afb5627943abafac20e001843fd127dfb9e44` |

## Arquitectura y entrenamiento

Se trata de una arquitectura SAM3 en su variante de imagen: un transformador de segmentación promptable con capacidad de detección asociada. El autor no describe la arquitectura interna ni el proceso de entrenamiento, y no hay información sobre número de tokens de entrenamiento, composición del dataset, fases de ajuste (RLHF, DPO u otras) ni sobre si el checkpoint ha sido reentrenado o ajustado para el dominio de moda. Todos los indicios apuntan a una reexportación de los pesos oficiales de SAM3 para imagen: los nombres de parámetros siguen el esquema oficial `detector.*`, el estado se empaqueta como `{"model": state_dict}` y el `equivalence_report.json` documenta una verificación de consistencia numérica en bf16 frente al modelo de referencia.

En cuanto a los detalles de despliegue publicados, el modelo usa el tokenizer BPE que acompaña al image model oficial de SAM3, trabaja a una resolución de entrada de 1008 px, propone candidatos con un umbral bruto de 0,20 y aplica un umbral de confianza de 0,50 para visualización y cálculo de métricas. Las salidas incluyen cajas delimitadoras, máscaras de instancia y una predicción de presencia de objeto, evaluada como `presence accuracy`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación de instancias guiada por prompt de texto, con vocabulario abierto dentro de los dominios cubiertos por el modelo.
- Detección de objetos con cajas delimitadoras, además de la máscara correspondiente.
- Predicción de presencia/ausencia del objeto descrito en el prompt (métrica reportada: 0,8654).
- Aplicación declarada a prendas de vestir, calzado y objetos genéricos.
- Prompts de texto en chino e inglés.
- Procesamiento de imagen fija a resolución de 1008 px, con batch size recomendado de 1 como punto de partida.
- No hay evidencia en la información disponible de soporte de tool calling o function calling, uso como agente, razonamiento multi-paso, generación de texto, matemáticas, audio ni thinking mode: son capacidades no aplicables o no disponibles en este modelo.

## Casos de uso

- Catalogación de producto en comercio electrónico: segmentar prendas y calzado para generar máscaras alfa y recortes normalizados de forma automática, usando prompts de texto por categoría y el umbral de 0,20 cuando prime el recall sobre la precisión.
- Eliminación de fondo y edición fotográfica: la máscara de instancia por prompt permite sustituir fondos en catálogos, campañas o fotografía de producto sin trabajo manual de recorte.
- Preanotación de datasets de visión: generar cajas y máscaras iniciales sobre lotes de imágenes y reservar la revisión humana para los casos dudosos, reduciendo el coste de etiquetado en proyectos de detección y segmentación.
- Búsqueda visual y etiquetado de atributos: combinar la detección con prompts descriptivos para localizar categorías concretas dentro de una imagen y alimentar índices de búsqueda o motores de recomendación.
- Control de calidad en fabricación: inspeccionar piezas y detectar elementos ausentes o mal posicionados mediante prompts específicos, teniendo en cuenta que el propio autor advierte de que los dominios fuera de distribución requieren validación previa.
- Robótica y manipulación: obtener máscaras de los objetos a manipular para planificar agarres y evitar colisiones, con la limitación de que no se publican cifras de latencia.
- Moderación y cumplimiento en marketplaces: detectar objetos no permitidos en imágenes subidas por usuarios, asumiendo el coste en falsos positivos que implica una precisión de presencia de 0,8654.
- Prueba virtual y realidad aumentada: segmentar la prenda o el calzado del usuario o del catálogo para superponerlos en tiempo real en aplicaciones de prueba virtual.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| 301 imágenes de validación internas (resolución uniforme, lista blanca de consultas, postprocesado propio y evaluador COCO) | BBox AP | 0,8857 |
| Igual | Mask AP | 0,8664 |
| Igual | BBox AR100 | 0,9873 |
| Igual | Mask AR100 | 0,9669 |
| Igual | Presence accuracy | 0,8654 |
| Consistencia bf16 frente al modelo oficial (2 imágenes, mismos prompts y ajustes) | Diferencia máxima de confianza | 0,0078125 |
| Igual | Diferencia máxima de coordenadas de caja | 0,2278 px |
| Igual | Coincidencia de píxeles de máscara en muestras no vacías | 99,9981 % |
| Igual | Mask IoU | 0,99921 |

No se han publicado resultados sobre conjuntos públicos estándar (COCO, LVIS u otros) en la información disponible, ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- Peso de los pesos en memoria: 3.371.863.977 bytes (aproximadamente 3,14 GiB) en bf16/fp16, cantidad que hay que sumar a activaciones y memoria del runtime.
- VRAM estimada para inferencia: no publicada por el autor. Estimación orientativa no confirmada: entre 6 y 10 GB en bf16, batch size 1 y resolución de 1008 px, en función del framework y del número de prompts por imagen.
- GPU de consumo: cabe con holgura en RTX 3090 y RTX 4090 (24 GB) y en RTX 4080 (16 GB); en tarjetas de 12 GB es probable que funcione en bf16, pero no está confirmado.
- GPU de centro de datos: A100 (40/80 GB), H100 y L40S, con margen suficiente para aumentar el batch o el número de prompts.
- Opciones de despliegue: carga mediante el cargador oficial del image model de SAM3 en PyTorch, con autocast en bf16. No se documentan exportaciones a ONNX, TensorRT ni TorchScript, y herramientas como vLLM, Ollama, llama.cpp o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La única indicación del autor es empezar con batch size 1 y evaluar el escalado desde ahí.

## Comparativa con modelos similares

No se dispone de datos cuantitativos comparables en la información proporcionada; la tabla siguiente es únicamente cualitativa.

| Modelo | Tarea | Parámetros | Contexto o entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yeyize/yyz_sam3 | Segmentación y detección guiadas por texto | no disponible | Imagen, 1008 px | no disponible | Hugging Face, 3,4 GB, 0 descargas |
| SAM 3 oficial (upstream) | Segmentación y detección guiadas por texto | no disponible | Imagen | no disponible | no disponible en esta información |
| SAM 2 | Segmentación promptable en imagen y vídeo | no disponible | Imagen y vídeo | no disponible | no disponible en esta información |
| Grounding DINO | Detección con vocabulario abierto | no disponible | Imagen | no disponible | no disponible en esta información |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no concede ninguna licencia nueva y obliga a verificar por cuenta propia las condiciones de SAM3, del código asociado y de la plataforma de despliegue. El uso comercial no está garantizado sin revisión legal.
- Las métricas principales proceden de 301 imágenes de validación internas, con resolución uniforme, lista blanca de consultas y postprocesado propios: no son extrapolables a otros dominios ni comparables directamente con resultados publicados sobre COCO o LVIS.
- El propio autor advierte de degradación en oclusiones complejas, objetos muy pequeños, imágenes borrosas, clases fuera de dominio y prompts de texto distintos de los validados.
- Sensibilidad al prompt: no se documenta la robustez frente a variaciones de redacción, sinónimos o prompts ambiguos.
- Una precisión de presencia de 0,8654 implica en torno a un 13,5 % de error en la decisión de presencia/ausencia; con el umbral de 0,20 se favorece el recall y aumentan los falsos positivos.
- Idiomas limitados a chino e inglés en los prompts de texto; no hay soporte declarado de castellano.
- Riesgo de máscaras espurias o incompletas en escenas no vistas; el umbral de 0,50 aplicado en las métricas mitiga parte de este efecto, pero no lo elimina.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, con un único autor, lo que reduce la evidencia externa sobre su fiabilidad.
- El formato de pesos `.pt` con nombres de parámetros específicos exige el cargador adecuado; no existen versiones GGUF, ONNX u otras listas para usar.
- Conviene verificar la integridad del fichero descargado con el SHA256 publicado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeyize/yyz_sam3
- Ficheros indicados en la model card del repositorio: `yyz_sam3.pt`, `export_manifest.json` y `equivalence_report.json`
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de un servicio de correo sin relación con SAM3 ni con este repositorio.
