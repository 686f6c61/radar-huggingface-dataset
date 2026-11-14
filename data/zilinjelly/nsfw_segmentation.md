# zilinjelly/NSFW_Segmentation

## Resumen

NSFW Segmentation es una colección de seis checkpoints de segmentación de instancias publicados por el usuario zilinjelly en Hugging Face. No se trata de un modelo generativo ni de un LLM, sino de un conjunto de cabezas de segmentación basadas en la arquitectura YOLO11 (variantes `s` y `x`) entrenadas con Ultralytics 8.3.204 para delimitar estructuras anatómicas etiquetadas como NSFW: mama (con areola y pezón), vagina y pene. Cada checkpoint es independiente y produce máscaras binarias para su espacio de etiquetas específico.

El problema que resuelve es la moderación automática de contenido y el soporte a flujos de trabajo de investigación o asistencia médica que requieren localización precisa (no solo clasificación) de anatomía sensible en imágenes RGB. Frente a un clasificador binario NSFW, la segmentación permite aplicar difuminado selectivo, censura por región o análisis morfológico, lo que reduce falsos positivos sobre contenido legítimo.

El repositorio ocupa 0,4 GB y no incluye los datasets de entrenamiento. La model card reporta métricas de validación con `yolo segment val` a 832 px y umbral de confianza 0,1, con Mask mAP@0.5:0.95 que va de 0,636 (mama, YOLO11s) a 0,987 (pene, YOLO11x). Es un lanzamiento de pesos con escasa documentación adicional: sin licencia declarada, sin idiomas aplicables y sin pipeline definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics 8.3.204), cabezas de segmentación de instancias; backbones YOLO11s y YOLO11x |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen a 832 px en evaluación) |
| Tipos de cuantizacion | no disponible (pesos `.pt` en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoints PyTorch compatibles con `ultralytics>=8.3`) |

## Arquitectura y entrenamiento

Cada checkpoint es un detector-segmentador YOLO11 con cabeza de segmentación de instancias, exportado como `.pt` para la librería Ultralytics. Se publican dos escalas por tarea: `s` (small) y `x` (extra-large), lo que permite elegir entre latencia y precisión. La salida son máscaras binarias alineadas con la taxonomía de clases de cada checkpoint: `breast`, `areola`, `nipple` para el modelo de mama; `vagina` para el modelo vaginal; `penis` para el modelo de pene.

El entrenamiento se realizó sobre conjuntos privados de imágenes NSFW curadas con máscaras poligonales en formato de segmentación YOLO. La model card indica que los splits de entrenamiento y validación se normalizaron y fusionaron tras el preprocesado, y que las métricas corresponden a imágenes de validación reservadas. No se especifican número de imágenes, composición demográfica, tokens ni técnicas de alineación (RLHF/DPO no aplican). Tampoco se documentan innovaciones técnicas más allá del uso estándar de YOLO11 con `ultralytics>=8.3`.

## Capacidades

- Segmentación de instancias de anatomía NSFW en imágenes RGB, con máscaras binarias por clase.
- Tres dominios anatómicos separados: mama (tres clases: `breast`, `areola`, `nipple`), vagina (una clase) y pene (una clase).
- Dos escalas por dominio (`s` y `x`) para ajustar precisión y coste computacional.
- Inferencia vía API de Ultralytics: `YOLO(...).predict(..., imgsz=832, conf=0.1)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.
- No incluye modo thinking, visión generativa, audio ni procesamiento de texto.

## Casos de uso

- Moderación de contenido en plataformas: cargar el checkpoint correspondiente y aplicar difuminado o recorte únicamente sobre las máscaras predichas, reduciendo la censura sobre contenido no sensible frente a un clasificador de imagen completa.
- Censura selectiva en previsualizaciones y miniaturas: usar `nsfw-seg-breast-x.pt` o los modelos `-x` para obtener máscaras de alta calidad (Mask mAP@0.5:0.95 de 0,702 y 0,987 en sus dominios) antes de aplicar filtros.
- Investigación en visión por computador: emplear los checkpoints como línea base de segmentación anatómica con métricas reportadas (Mask mAP@0.5 entre 0,895 y 0,995) para comparar arquitecturas o estrategias de aumento de datos.
- Soporte a flujos médicos o de salud reproductiva: localización aproximada de estructuras en imágenes de seguimiento, siempre con supervisión clínica, dado que la model card advierte explícitamente que no sustituye una evaluación médica.
- Análisis de sesgo y robustez: evaluar el rendimiento bajo cambios de iluminación, calidad de cámara o demografía, tal como señala la sección de limitaciones, para estudiar la transferencia de dominio en modelos YOLO11.
- Pipelines de anotación asistida: generar máscaras preliminares que revisores humanos corrigen, acelerando el etiquetado de datasets sensibles con formato YOLO.

## Benchmarks y rendimiento

Métricas reportadas en la model card, evaluadas con `yolo segment val` a 832 px y umbral de confianza 0,1:

| Checkpoint | Backbone | Clases | Mask mAP@0.5 | Mask mAP@0.5:0.95 |
|---|---|---|---|---|
| `nsfw-seg-breast-s.pt` | YOLO11s | breast, areola, nipple | 0,895 | 0,636 |
| `nsfw-seg-breast-x.pt` | YOLO11x | breast, areola, nipple | 0,929 | 0,702 |
| `nsfw-seg-vagina-s.pt` | YOLO11s | vagina | 0,995 | 0,871 |
| `nsfw-seg-vagina-x.pt` | YOLO11x | vagina | 0,995 | 0,918 |
| `nsfw-seg-penis-s.pt` | YOLO11s | penis | 0,995 | 0,975 |
| `nsfw-seg-penis-x.pt` | YOLO11x | penis | 0,995 | 0,987 |

No se han publicado comparaciones con otros modelos de segmentación en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia cualitativa, YOLO11s es un modelo pequeño y YOLO11x es varias veces mayor; ambos son ligeros comparados con LLMs, pero no se aportan cifras concretas de memoria.
- GPU recomendadas: no disponible. Por la escala de YOLO11, caben con holgura en GPUs de consumo, pero la información no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: previsiblemente sí para ambas escalas, aunque no se documenta.
- Opciones de despliegue: Ultralytics (`ultralytics>=8.3`) mediante `YOLO(...).predict(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de segmentación anatómica NSFW ni comparaciones con alternativas de la misma categoría.

## Limitaciones y advertencias

- No sustituye una evaluación clínica; la model card lo advierte de forma explícita.
- El cambio de dominio (iluminación, calidad de cámara, demografía) puede degradar el rendimiento.
- No se aplica ningún filtrado de seguridad; los sistemas que lo integren deben implementar controles de acceso.
- Ausencia de licencia declarada: no hay permiso explícito para uso comercial ni condiciones de redistribución, lo que es un riesgo legal relevante en producción.
- Los datasets de entrenamiento no se publican, lo que impide auditar la composición, los sesgos demográficos y la cobertura de casos.
- El repositorio está etiquetado como `not-for-all-audiences` y no tiene descargas ni likes, sin evidencia de validación por parte de la comunidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos o máscaras espurias en imágenes ambiguas o de baja calidad.
- No hay información sobre idiomas porque el modelo no procesa texto; no aplica soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/zilinjelly/NSFW_Segmentation
- Ultralytics (documentación de YOLO11 y API de segmentación): https://docs.ultralytics.com/
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
