# Thareah/ThaOCR-textdet

## Resumen

ThaOCR-textdet es el segundo módulo de una pipeline de OCR de cinco etapas desarrollada por Thareah, orientada a documentos en jemer (khmer) e inglés. El modelo resuelve la detección de líneas de texto dentro de una página o región: recibe una imagen RGB y devuelve un mapa de probabilidad del que se extraen las cajas de cada línea mediante el post-procesado unclip de DB (Differentiable Binarization).

Técnicamente es un detector DB construido sobre el backbone móvil de PP-OCRv5 de PaddleOCR, con solo 1,16 M de parámetros y un peso ONNX de 4,8 MB. La entrada es dinámica (`[1,3,H,W]`, con H y W múltiplos de 32) y la salida es un mapa de probabilidad; el modelo se distribuye en formato ONNX (opset 17) y se ejecuta con onnxruntime en CPU, sin requisitos de GPU.

Su relevancia es doble: por un lado cubre un hueco poco atendido como es el OCR de jemer, un idioma con escritura compleja y escasez de herramientas abiertas; por otro, su tamaño reducido y su contrato ONNX estable lo hacen adecuado para despliegues en servidor sin acelerador o en entornos con recursos limitados. El repositorio incluye tres variantes (original, fine-tune v1 y fine-tune v2), siendo la v2 la predeterminada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DB (Differentiable Binarization) con backbone móvil PP-OCRv5 de PaddleOCR |
| Parametros totales | 1,16 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada dinámica `[1,3,H,W]` con H y W múltiplos de 32) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float; no se documentan variantes cuantizadas) |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | other (`mixed-see-readme`); base Apache-2.0, datos de ajuste con términos de uso solo para investigación |
| Formato de pesos | ONNX (opset 17), ejecutable con onnxruntime |

## Arquitectura y entrenamiento

El modelo es un detector de texto de tipo DB (Differentiable Binarization) que emplea el backbone móvil de PP-OCRv5. Produce un mapa de probabilidad por píxel y las cajas se recuperan con el post-procesado unclip original de DB. La entrada es dinámica con altura y anchura múltiplos de 32, lo que permite procesar páginas completas o regiones recortadas sin reescalado fijo. El preprocesado (letterbox y NMS) y el postprocesado (unclip) viven en el backend de ThaOCR como código numpy/OpenCV, no en el propio grafo ONNX.

El ajuste de la variante v2 (predeterminada) parte de la conversión del detector ONNX original a PyTorch mediante onnx2torch y afina el mapa de probabilidad con kernels DB reducidos (ratio 0,4), para después reexportar a ONNX manteniendo el mismo contrato de entrada y salida. Se entrenó durante 20.000 iteraciones con batch 16 y aumento `--robust` (degradación de escaneo y foto), inicializado desde el checkpoint `textdet_robust` de v1. Los pesos de pérdida por fuente fueron 0,45 para datos sintéticos, 0,20 para PDFs reales en jemer y 0,35 para DocLayNet, con evaluación cada 2.500 iteraciones. El conjunto de datos `textdet_v2` combina 15.000 páginas sintéticas de entrenamiento y 750 de validación (documentos v2, hojas de examen y líneas manuscritas con quads ajustados a la tinta), 6.895 páginas reales de DocLayNet para entrenamiento y 647 de validación (cajas derivadas de la capa de texto del PDF) y 548 páginas reales de PDFs en jemer para entrenamiento y 173 de validación. No se documenta uso de RLHF ni DPO, lo cual es esperable en un modelo de detección.

## Capacidades

- Detección de líneas de texto en imágenes de documentos, con salida de cajas delimitadoras y mapa de probabilidad.
- Manejo de documentos en jemer e inglés, incluyendo escritura jemer con glifos complejos.
- Robustez ante degradaciones de escaneo y fotografía gracias al aumento `--robust` aplicado en el ajuste.
- Procesamiento de documentos sintéticos, hojas de examen y líneas manuscritas (incluidas en el conjunto de entrenamiento v2).
- Entrada de resolución dinámica, lo que permite ajustar el coste computacional al tamaño de la página.
- Ejecución en CPU mediante onnxruntime, sin dependencia de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.

## Casos de uso

- Digitalización de documentos administrativos en jemer: el detector localiza las líneas de texto de PDFs gubernamentales o de ONG para pasarlas a la etapa de reconocimiento, un escenario para el que el modelo se entrenó explícitamente con 548 páginas reales de este tipo.
- Pipeline OCR completa en servidor sin GPU: al ser un ONNX de 4,8 MB ejecutable con onnxruntime en CPU, puede integrarse en el backend de ThaOCR junto con las etapas de layout, reconocimiento, fuente y estructura sin necesidad de acelerador.
- Procesamiento de hojas de examen: el ajuste v2 incluye hojas de examen sintéticas y líneas manuscritas, lo que permite detectar respuestas manuscritas y enunciados impresos en un mismo flujo.
- Extracción de texto de documentos mixtos jemer-inglés: útil en contextos bilingües donde conviven titulares en inglés y cuerpo en jemer, con detección de líneas independiente del idioma.
- Preprocesado para indexación y búsqueda documental: las cajas detectadas alimentan un reconocedor y permiten construir índices de texto sobre archivos escaneados de forma por lotes.
- Analítica de layout a bajo coste: combinado con la etapa de layout, permite segmentar regiones y líneas para tareas de estructuración de páginas en entornos con presupuesto de cómputo limitado.
- Procesamiento en el borde o en dispositivos modestos: el tamaño de 4,8 MB y la ejecución en CPU permiten desplegarlo en contenedores pequeños o en equipos sin GPU dedicada.

## Benchmarks y rendimiento

Los únicos datos publicados son las puntuaciones F1 del ajuste v2 sobre los conjuntos de evaluación del autor:

| Conjunto de evaluacion | F1 |
|---|---|
| Sintetico | 0,894 |
| DocLayNet | 0,880 |
| DocLayNet baja resolucion | 0,833 |
| PDF jemer | 0,697 |
| PDF jemer baja resolucion | 0,690 |
| Media | 0,799 |

No se han publicado resultados comparativos con otros detectores (por ejemplo, el PP-OCRv5 original) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para ejecución en CPU con onnxruntime. En GPU, el peso de 4,8 MB ocuparía una fracción mínima de memoria, pero no se documentan requisitos.
- GPU recomendadas: no disponible; no se documenta soporte ni optimización para GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU, dado el tamaño del modelo.
- Opciones de despliegue: onnxruntime (librería declarada), con pre/post-procesado en numpy/OpenCV dentro del backend de ThaOCR. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ThaOCR-textdet (db_v2) | 1,16 M | DB + PP-OCRv5 mobile, fine-tune jemer | km, en | other (mixta) | ONNX |
| db_ppocrv5_orig (incluido en el repo) | no disponible | DB + PP-OCRv5 mobile original | multilingüe (PaddleOCR) | Apache-2.0 | ONNX |
| PaddleOCR PP-OCRv5 detector (upstream) | no disponible | DB + backbone móvil | multilingüe | Apache-2.0 | Paddle / ONNX |

La comparación directa más relevante es con el detector original incluido como baseline en el mismo repositorio: comparte arquitectura y contrato de entrada/salida, pero no está ajustado a jemer. No se dispone de datos de F1 del baseline en la información proporcionada, por lo que no es posible cuantificar la mejora del fine-tune. No se han identificado otros detectores abiertos específicos para jemer en la información disponible.

## Limitaciones y advertencias

- El F1 sobre PDFs reales en jemer es notablemente inferior (0,697, y 0,690 en baja resolución) que sobre datos sintéticos (0,894) y DocLayNet (0,880); el rendimiento en documentos reales de producción puede ser limitado.
- La licencia es `other` con nombre `mixed-see-readme`: parte de los datos de ajuste son de uso solo para investigación, por lo que el uso comercial requiere revisar los términos con cuidado.
- El modelo solo detecta líneas de texto; no reconoce caracteres ni extrae contenido. Depende de las etapas de reconocimiento y postprocesado de la pipeline ThaOCR.
- Solo se declaran jemer e inglés; no hay evidencia de generalización a otros idiomas o escrituras.
- El preprocesado (letterbox, NMS) y el postprocesado (unclip) no forman parte del grafo ONNX y deben implementarse o tomarse del backend de ThaOCR; un uso aislado del modelo requiere replicar ese código.
- No se documentan variantes cuantizadas ni requisitos de latencia, lo que dificulta estimar el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.
- Riesgo de sesgo hacia los dominios de entrenamiento (documentos sintéticos, DocLayNet, PDFs gubernamentales y de ONG en jemer); documentos con layouts atípicos o degradaciones no cubiertas pueden degradar la detección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thareah/ThaOCR-textdet
- Etapa de layout: https://huggingface.co/Thareah/ThaOCR-layout
- Etapa de reconocimiento: https://huggingface.co/Thareah/ThaOCR-rec
- Etapa de clasificación de fuente: https://huggingface.co/Thareah/ThaOCR-font
- Etapa de estructura de página: https://huggingface.co/Thareah/ThaOCR-structure
- Repositorio índice con el manifiesto de las cinco etapas: https://huggingface.co/Thareah/ThaOCR-models
- PaddleOCR (base PP-OCRv5, Apache-2.0): no se proporciona enlace en la información disponible
- DocLayNet (CDLA-Permissive 1.0): no se proporciona enlace en la información disponible
