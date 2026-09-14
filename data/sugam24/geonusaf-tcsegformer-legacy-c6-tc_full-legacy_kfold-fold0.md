# sugam24/geonusaf-tcsegformer-legacy-c6-tc_full-legacy_kfold-fold0

## Resumen

GeoNUSAF TC-SegFormer (variante legacy, receta tc_full, esquema de 6 clases, fold 0 del split legacy_kfold) es un modelo de segmentación semántica de imágenes de teledetección publicado por el usuario sugam24 en HuggingFace. Se construye sobre el checkpoint nvidia/segformer-b0-finetuned-ade-512-512 y añade una "ruta de detalle residual H/2" (arch version v2-residual) junto con varios componentes de entrenamiento propios: peso por clase por frecuencia inversa, muestreador, pérdidas Lovász y clDice y una banda CSA con umbrales por clase.

El modelo no es un modelo generativo ni de lenguaje: es un segmentador denso que asigna a cada píxel una de seis clases de cobertura del suelo (Residential, Road, River, Forest, UnusedLand, Agricultural), ignorando los píxeles sin etiqueta (índice 255). El repositorio ocupa 0,1 GB, usa la librería transformers y está etiquetado como compatible con endpoints. Al ser una arquitectura SegFormer-B0, el coste de inferencia es muy bajo (del orden de millones de parámetros, no de miles de millones).

Su relevancia es fundamentalmente metodológica y de trazabilidad: la propia model card lo presenta como una ejecución con la receta previa al protocolo (AdamW plano a 3e-5, 300 épocas, pesos de frecuencia inversa heredados, sin scheduler, sin clipping y sin EMA), y advierte explícitamente de una fuga de datos entre train y validación (236 de 245 imágenes de validación, el 96,3%, tienen un espejo en el conjunto de entrenamiento). Por tanto, sirve como referencia histórica o línea base interna, no como modelo listo para producción ni como resultado comparable con ejecuciones del protocolo actual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TC-SegFormer (v2-residual, con ruta de detalle residual H/2) sobre nvidia/segformer-b0-finetuned-ade-512-512 |
| Parametros totales | No disponible en la model card; la arquitectura base SegFormer-B0 tiene del orden de 3,8 M de parametros (dato de la arquitectura base, no confirmado por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (segmentacion densa, no hay ventana de contexto textual). Resolucion de entrada no especificada; la base se ajusta a 512x512 |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizadas) |
| Idiomas soportados | No disponible (tarea de vision; no hay soporte linguistico declarado) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de transformers, 0,1 GB; presumiblemente safetensors/PyTorch, no confirmado) |
| Tarea | Segmentacion semantica (semantic-segmentation) |
| Dominio | Teledeteccion (remote-sensing) |
| Clases | 6: Residential, Road, River, Forest, UnusedLand, Agricultural |
| Pixeles sin etiqueta | Ignorados (indice 255) |
| Version de arquitectura | v2-residual |
| Receta | tc_full (detail True, csa True, sampler True, lovasz True, cldice True) |
| Split | legacy_kfold, 5 folds, seed 42, fold 0 |
| Fuga train/validacion | 236/245 imagenes de validacion (96,3%) tienen un espejo en train |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion (segun HuggingFace) | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es un SegFormer con modificaciones: un encoder jerarquico tipo MiT (en este caso el B0) con atencion eficiente sin positional encodings, un decodificador ligero de fusión multi-escala, y una ruta adicional de detalle residual a media resolucion (H/2) que la model card identifica como arch version v2-residual. Sobre esa base se aplica el esquema tc_full, que activa cinco componentes: la ruta de detalle, la banda CSA, un muestreador de datos, la pérdida Lovász y la pérdida clDice. La banda CSA usa umbrales tau=[0,6, 0,35, 0,35, 0,6, 0,6, 0,6], w_min=0,25 y un cap de 14,07 m sobre un tile de 703,5 m, equivalente a 46,90 píxeles.

El entrenamiento sigue la receta previa al protocolo: optimizador AdamW con learning rate plano de 3e-5 y weight decay 0,01, modo new_boosted (peso x10,0 para la clase nueva), pesos por clase legacy_inv_freq calculados sobre el total y sin cap, 300 épocas con paciencia de 25 y batch de 16. No se usó scheduler, ni clipping de gradientes, ni EMA. La metrica de selección fue val_miou_core6 y la mejor época registrada fue la 1, muy por debajo de las 300 épocas configuradas, lo que apunta a sobreajuste temprano o a una dinámica de validación anómala. La model card no documenta el volumen de tokens ni la composición exacta del dataset, más allá de las seis clases y del esquema de partición.

## Capacidades

- Segmentación semántica densa de imágenes aéreas o satelitales en seis clases de cobertura del suelo.
- Distinción de clases con morfología contrastada: la clase Residential alcanza un IoU de 0,7819 y Forest un 0,6122 en la validación reportada.
- Manejo explícito de píxeles sin etiqueta mediante el índice 255, útil en datasets parcialmente anotados.
- Integración con el ecosistema transformers y con HuggingFace Inference Endpoints (etiqueta endpoints_compatible).
- Reentrenamiento o fine-tuning posterior al estar construido sobre un checkpoint público de SegFormer-B0.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modo de pensamiento: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni procesamiento de texto, audio o vídeo.

## Casos de uso

- Cartografía de cobertura del suelo a escala local: dado que Residential es la clase mejor resuelta (IoU 0,7819, UA 0,9648), el modelo puede usarse para delimitar manzanas y superficies construidas sobre ortofotos, siempre que se acepte su sesgo hacia la clase mayoritaria.
- Seguimiento de masas forestales: con un IoU de 0,6122 y un recall de 0,9216 en Forest, es adecuado para tareas de cribado donde prima no perder superficie arbolada, aunque genere falsos positivos.
- Inventario agrícola preliminar: Agricultural obtiene IoU 0,4851, suficiente para un recuento aproximado de parcelas que después se revise manualmente.
- Generación de capas vectoriales para GIS: la salida de segmentación puede poligonizarse y cargarse en un SIG como capa base de trabajo, asumiendo que las clases minoritarias requerirán corrección.
- Línea base metodológica interna: sirve para comparar el efecto de la receta legacy frente a las recetas del protocolo actual, dado que todos los hiperparámetros y métricas están documentados en la model card.
- Filtrado previo en pipelines de anotación: usar el modelo como preetiquetador para reducir el coste de anotación humana en las clases con mejor IoU, dejando Road y River para revisión manual.
- Pruebas de integración y despliegue: su tamaño reducido lo hace apto para validar pipelines de inferencia por lotes, servicios de endpoints o exportaciones a ONNX/TensorRT antes de escalar a modelos mayores.
- No es recomendable para aplicaciones críticas sobre viaria o hidrografía: Road (IoU 0,2362) y River (IoU 0,2167) rinden muy por debajo del resto de clases.

## Benchmarks y rendimiento

Métricas de validación reportadas por el autor (fold 0, receta legacy). No se han publicado resultados de benchmarks comparables con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| val mIoU (estimador promediado por batch) | 0,4012 |
| val mIoU (pooled, todas las clases puntuadas) | 0,4346 |
| val mIoU (pooled, 6 clases reales) | 0,4346 |
| val mIoU (region core CSA, 6 clases) | 0,4655 |
| val OA (exactitud global) | 0,7569 |
| val kappa | 0,6149 |
| Metrica de seleccion | val_miou_core6 |
| Mejor epoca | 1 (de 300 configuradas) |

Rendimiento por clase (validación, pooled):

| Clase | IoU | F1 | PA (recall) | UA (precision) |
|---|---|---|---|---|
| Residential | 0,7819 | 0,8776 | 0,8048 | 0,9648 |
| Road | 0,2362 | 0,3822 | 0,6427 | 0,2720 |
| River | 0,2167 | 0,3562 | 0,8856 | 0,2229 |
| Forest | 0,6122 | 0,7595 | 0,9216 | 0,6458 |
| UnusedLand | 0,2757 | 0,4322 | 0,3703 | 0,5191 |
| Agricultural | 0,4851 | 0,6533 | 0,7528 | 0,5770 |

Advertencia: estos valores provienen de una partición con fuga de variantes (el 96,3% de las imágenes de validación tiene un espejo en train), por lo que están inflados y no deben compararse con ejecuciones del protocolo vigente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con pesos en FP32 y del orden de 3,8 M de parámetros, los pesos ocupan aproximadamente 15 MB; sumando activaciones a 512x512 y batch pequeño, la inferencia cabe holgadamente por debajo de 1 GB de VRAM. Es una estimación a partir de la arquitectura base, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo está tan lejos de saturar estas tarjetas que la elección depende del volumen de imágenes, no de la VRAM.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con más de 2 GB de VRAM, e incluso puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: transformers (PyTorch) es la vía natural dado el library_name del repositorio; también es viable exportar a ONNX o TensorRT para inferencia por lotes, y desplegar en HuggingFace Inference Endpoints gracias a la etiqueta endpoints_compatible. vLLM, TGI o llama.cpp no aplican a un modelo de segmentación.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo en datasets públicos, por lo que la comparación numérica con alternativas no es posible. Comparación cualitativa:

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoNUSAF TC-SegFormer legacy (este modelo) | No confirmado; base SegFormer-B0 (aprox. 3,8 M) | Segmentacion densa; resolucion no especificada | mIoU pooled 0,4346; mIoU core CSA 0,4655 (con fuga en validacion) | No disponible | HuggingFace, repo de 0,1 GB |
| nvidia/segformer-b0-finetuned-ade-512-512 | Aprox. 3,8 M | 512x512; 150 clases ADE20K | No comparable con este dataset | No disponible en la informacion proporcionada | HuggingFace, checkpoint publico |
| U-Net (segmentacion semantica generica) | Del orden de 7-30 M segun variante | Entrada configurable | No disponible | Depende de la implementacion | Multiples repositorios |
| DeepLabV3+ con backbone ResNet-50 | Del orden de 40 M (backbone incluido) | Entrada configurable | No disponible | Depende de la implementacion | Multiples repositorios |

La ventaja de este modelo frente a alternativas mayores es el coste computacional; su desventaja es la ausencia de validación libre de fuga y de licencia declarada.

## Limitaciones y advertencias

- Fuga de datos documentada: 236 de 245 imágenes de validación (96,3%) tienen una variante espejo en el conjunto de entrenamiento, por lo que todas las métricas de validación están sobreestimadas.
- Mejor época en la iteración 1 de 300, con paciencia de 25: indica sobreajuste inmediato o un problema en la dinámica de validación; el checkpoint resultante puede no representar el mejor estado alcanzable.
- Rendimiento muy desigual por clase: Road (IoU 0,2362, UA 0,2720) y River (IoU 0,2167, UA 0,2229) generan muchos falsos positivos pese a su recall alto; UnusedLand también queda en IoU 0,2757.
- Sesgo hacia clases mayoritarias: la clase Residential domina las métricas (UA 0,9648) y los pesos legacy_inv_freq sin cap pueden no compensar el desbalance real.
- Licencia no declarada: no se especifica ninguna licencia, lo que impide confirmar si el uso comercial está permitido. Antes de cualquier despliegue en producción hay que aclararlo con el autor.
- Idiomas y texto: no aplica, pero implica que el modelo no puede integrarse en flujos que requieran razonamiento lingüístico, tool calling ni agentes.
- Resolución de entrada y composición exacta del dataset no documentadas, lo que dificulta reproducir el entrenamiento.
- Fecha de creación del repositorio registrada como 2026-09-13, posterior a la fecha de consulta habitual; conviene verificar la vigencia del artefacto.
- No debe usarse como referencia de rendimiento frente a otros modelos de teledetección mientras no se publique una evaluación con partición limpia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sugam24/geonusaf-tcsegformer-legacy-c6-tc_full-legacy_kfold-fold0
- Checkpoint base: https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512
- Paper de SegFormer (referencia de la arquitectura base): https://arxiv.org/abs/2105.15203
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos por la búsqueda corresponden a artículos sobre configuración de firmas y gestión de reuniones en Microsoft Outlook, sin relación con teledetección ni con segmentación semántica.
