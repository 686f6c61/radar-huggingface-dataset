# ThakiCloud/BlueprintParse-R50

## Resumen

BlueprintParse-R50 es un detector de objetos basado en Faster R-CNN con backbone ResNet-50 FPN v2, desarrollado por ThakiCloud y publicado como un único grafo ONNX en FP32. Su tarea es localizar cinco clases de sanitarios y equipamiento de cocina (gas range, toilet, washbasin, kitchen sink y bathtub) en imágenes de planos de planta de arquitectura coreanos. El modelo devuelve cajas, etiquetas y puntuaciones, con las cajas mapeadas de vuelta a los píxeles de la imagen original, y está pensado para ejecutarse tanto en CPU como en GPU mediante onnxruntime.

El modelo aborda un problema muy concreto del sector AEC (arquitectura, ingeniería y construcción): la extracción automática de cantidades (quantity takeoff) a partir de planos. Sin embargo, el propio autor es explícito sobre el alcance: el recuento automático está marcado como COUNT_NO_GO, ya que la coincidencia exacta por plano en dibujos nuevos fue de 0,566 (IC 95%: 0,434–0,698), muy por debajo del umbral de 0,90 fijado. Por tanto, el uso previsto es generar un borrador de conteo que una persona revisa elemento por elemento.

La relevancia actual del modelo radica en su enfoque de publicación: un único ONNX FP32 con metadatos embebidos, script de inferencia con verificación de hash SHA-256, autotest sintético y métricas de latencia desglosadas por hardware y precisión. Es un ejemplo de ficha técnica honesta que documenta tanto los aciertos (mAP50-95 de 0,926 en el split de test oficial) como los fallos (caída a 0,7875 en planos novedosos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone ResNet-50 FPN v2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 publicado; FP16 e INT8 (estática y dinámica) evaluados internamente pero no publicados |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opsets 17, FP32) |

## Arquitectura y entrenamiento

El modelo es un detector Faster R-CNN de dos etapas con backbone ResNet-50 y cuello FPN v2, exportado a un único grafo ONNX FP32 con entradas dinámicas (`image` [3,H,W] float32, H y W dinámicos) y salidas `boxes` [N,4] en coordenadas xyxy del tensor de entrada, `labels` [N] int64 (1..5) y `scores` [N]. Los metadatos del grafo incluyen `class_ids`, `max_side`, `precision`, `opset` y el SHA-256 del checkpoint fuente. El preprocesado replica el del entrenamiento: escala de grises, reducción para que el lado largo no supere 2048 px, normalización a 0..1 y replicación a 3 canales. Se devuelven detecciones con score ≥ 0,5 y los candidatos en [0,3, 0,5) se enrutan a `uncertain_candidates`; el campo `review_required` es siempre verdadero.

El entrenamiento se realizó sobre el dataset **AI 허브(AI-Hub) — 건축 도면 데이터(OBJ)(71465)**, un conjunto de planos de arquitectura coreanos. No se especifica en la información disponible el número de tokens (no aplica), la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO. El autor documenta que el split de test oficial tiene 1.014 imágenes y que el split de planos novedosos (con near-duplicates del entrenamiento eliminados) contiene 53 dibujos. La comparación entre el ONNX FP32 y el checkpoint PyTorch de entrenamiento muestra una degradación de −0,0009 / 0,0 (test) y −0,0026 / −0,0005 (novel) en las métricas principales, lo que indica una exportación fiel.

## Capacidades

- Detección de objetos en imágenes de planos de planta con cinco clases: gas range, toilet, washbasin, kitchen sink y bathtub.
- Salida de cajas delimitadoras en coordenadas de píxel de la imagen original, con clase y puntuación de confianza.
- Generación de un borrador de recuento por clase (`counts_draft`) a partir de las detecciones.
- Clasificación de candidatos inciertos: las detecciones con score en [0,3, 0,5) se separan en `uncertain_candidates` para revisión.
- Ejecución en CPU y GPU mediante onnxruntime (CPUExecutionProvider, CUDAExecutionProvider).
- Autotest sintético integrado (`--selftest`) que verifica la carga y ejecución del grafo.
- Verificación de integridad del modelo mediante SHA-256 embebido en el script de inferencia.
- Procesamiento de imágenes de hasta 2048 px en el lado largo (límite leído de los metadatos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la detección de objetos.

## Casos de uso

- **Borrador de mediciones en estudios de arquitectura**: el modelo detecta sanitarios y equipamiento de cocina en planos de planta coreanos y genera un conteo preliminar por clase; un técnico revisa y corrige el borrador, reduciendo el tiempo de medición manual. Es adecuado porque el autor documenta explícitamente que el conteo automático no es fiable (0,566 de coincidencia exacta) y debe tratarse como punto de partida.
- **Preprocesado en pipelines de presupuestación**: integración del ONNX en un servicio que recibe un plano en PNG y devuelve un JSON con detecciones y conteos para alimentar una herramienta de presupuestos; la latencia de 135 ms p50 en B200 con FP32 CUDA (22,8 ms de inferencia) permite procesar lotes de planos en minutos.
- **Control de calidad de planos**: comparación entre el conteo detectado y el conteo declarado en el plano para señalar discrepancias que requieran revisión humana, usando los `uncertain_candidates` como señal de baja confianza.
- **Extracción de inventario para instalaciones**: identificación de baños y cocinas en planos de edificios para estimar necesidades de fontanería y equipamiento, con revisión manual obligatoria dado el riesgo de falsos negativos (cero detecciones no prueba ausencia).
- **Digitalización de archivos históricos**: procesamiento por lotes de planos escaneados en coreano para poblar una base de datos de equipamiento por planta, aprovechando la ejecución en CPU (786 ms p50 en B200 con 32 núcleos) cuando no hay GPU disponible.
- **Herramienta de anotación asistida**: uso del modelo como preanotador en una plataforma de etiquetado, donde un humano confirma o corrige las cajas propuestas; el autotest y la verificación de hash facilitan el despliegue reproducible en entornos de anotación.

## Benchmarks y rendimiento

Detección (mAP y AP):

| Split | Imágenes | mAP50-95 | AP50 |
|---|---|---|---|
| Test oficial | 1.014 | 0,926 | 0,9805 |
| Planos novedosos (sin near-duplicates) | 53 | 0,7875 | 0,922 |

AR@100 en el test oficial: 0,9447. Comparación ONNX FP32 frente al checkpoint PyTorch: −0,0009 / 0,0 (test) y −0,0026 / −0,0005 (novel).

AP50 por clase:

| Clase | Test (1.014) | Novel (53) |
|---|---|---|
| gas_range | 0,9883 | 0,9637 |
| toilet | 0,9793 | 0,9508 |
| washbasin | 0,9886 | 0,9489 |
| kitchen_sink | 0,9677 | 0,7896 |
| bathtub | 0,9784 | 0,9572 |

Conteo (53 planos novedosos, 400 objetos ground truth, umbral 0,8):

| Métrica | Valor | Umbral |
|---|---|---|
| Coincidencia exacta por plano (5 clases) | 0,566 (0,434–0,698) | ≥ 0,90 |
| Error absoluto medio por celda de clase | 0,1925 | ≤ 0,05 |
| Recall de marcado de error | 0,478 | ≥ 0,80 |
| Coincidencia exacta en planos no marcados | 0,684 | ≥ 0,95 |

Latencia (p50 por imagen, ms; entrada sintética 1448×2048):

| Hardware | FP32 CUDA | FP16 CUDA | FP32 CPU | INT8 estática CPU | INT8 dinámica CPU |
|---|---|---|---|---|---|
| B200 (32 núcleos CPU) | 26,1 | 24,69 | 786,1 | 1925,01 | 2831,59 |
| H200 (16 núcleos CPU) | 27,33 | 22,23 | 1204,46 | 2590,13 | 3607,11 |
| H100 (10 núcleos CPU, pesos proxy) | 30,12 | 25,2 | 1953,59 | 2496,96 | 4100,12 |

En planos reales (B200, ONNX FP32 CUDA), el tiempo extremo a extremo con preprocesado fue de 135 ms p50 (22,8 ms de inferencia) y 889 ms con 32 hilos de CPU; la latencia no dependió del número de detecciones hasta 28 por plano.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. El autor no incluye comparaciones con otros detectores de planos de planta ni con alternativas genéricas como YOLO o DETR. Se indica "no disponible".

## Limitaciones y advertencias

- Solo detecta cinco clases (gas range, toilet, washbasin, kitchen sink, bathtub); muros, habitaciones, dimensiones, texto y cualquier otro objeto no se detectan ni se reclaman.
- El recuento automático está marcado como COUNT_NO_GO: la coincidencia exacta por plano es 0,566, muy por debajo del umbral de 0,90. Los conteos deben usarse solo como borrador con revisión humana elemento por elemento.
- Cero detecciones no es prueba de ausencia de un elemento.
- Evaluado sobre un único dataset público (AI-Hub 71465); no se han evaluado planos de clientes reales.
- Los planos evaluados más densos tenían 28 objetos; no se midieron planos con cientos de sanitarios.
- El ground truth son las cajas de etiqueta del dataset; la calidad de las etiquetas no fue auditada.
- El split novel es pequeño (53 planos), por lo que los intervalos de confianza son amplios.
- La caída de mAP50-95 de 0,926 (test) a 0,7875 (novel) es el dato a considerar para planos que no se parezcan al conjunto de entrenamiento; kitchen sink es la clase que más cae (0,9677 → 0,7896 en AP50).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para producción sin revisión humana.
- El modelo solo está publicado en FP32; las variantes FP16 e INT8 evaluadas internamente no se distribuyen (INT8 dinámica perdió 0,0735 de mAP50-95 en dev, INT8 estática fue más lenta que FP32 en CPU y FP16 solo fue un 5% más rápida en B200, por debajo del umbral del 10% fijado).
- Los tiempos de H100 se obtuvieron con pesos proxy de la misma arquitectura, no con los pesos reales.

## Enlaces

- Hugging Face: https://huggingface.co/ThakiCloud/BlueprintParse-R50
- Model card en coreano: [MODEL_CARD.ko.md](./MODEL_CARD.ko.md) (referenciado en el repositorio)
- Dataset de entrenamiento: AI 허브(AI-Hub) — 건축 도면 데이터(OBJ)(71465) (referenciado en la model card; no se proporciona URL directa en la información disponible)
