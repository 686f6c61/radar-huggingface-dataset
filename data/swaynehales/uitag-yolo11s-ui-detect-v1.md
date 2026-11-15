# swaynehales/uitag-yolo11s-ui-detect-v1

## Resumen

uitag-yolo11s-ui-detect-v1 es un detector de objetos YOLO11s afinado para localizar elementos de interfaz en capturas de pantalla de escritorio. Lo publica el autor independiente swaynehales como parte del proyecto uitag, una herramienta de etiquetado y parsing de pantallas, y se distribuye como re-publicación del modelo que antes estaba en Hugging Face bajo el identificador `swaylenhayes/uitag-yolo11s-ui-detect-v1`. Su función concreta es rellenar los huecos de iconos y controles que Apple Vision no detecta dentro del pipeline de uitag v0.5.0 o superior, invocado con la opción `--yolo`.

El modelo parte de los pesos COCO preentrenados de Ultralytics YOLO11s y se afina sobre GroundCUA, un conjunto de datos de demostraciones humanas para agentes de uso de computadora, convertido a formato YOLO y troceado en tiles de 640×640 con un 20 % de solapamiento. Detecta nueve categorías gruesas de elementos de interfaz (Button, Menu, Input_Elements, Navigation, Information_Display, Sidebar, Visual_Elements, Others y Unknown). No es un reconocedor de texto ni un modelo multimodal: es un detector puro de cajas delimitadoras.

Es relevante para quien construye agentes de interfaz de usuario, herramientas de accesibilidad o sistemas de parsing de pantallas que necesiten localizar controles en capturas de escritorio con un modelo pequeño (unos 19 MB de pesos) que puede ejecutarse en CPU. La licencia AGPL-3.0, heredada de los pesos base de Ultralytics, condiciona su uso en productos de código cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (detector de objetos de una etapa, familia Ultralytics YOLO11) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un único checkpoint `.pt` de precisión completa) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint Ultralytics, 19.194.266 bytes) |

## Arquitectura y entrenamiento

La arquitectura es YOLO11s, el tamaño "small" de la familia YOLO11 de Ultralytics: un detector de objetos de una etapa con backbone convolucional y cabeza de detección, sin componentes multimodales ni de lenguaje. El punto de partida son los pesos `yolo11s.pt` preentrenados en COCO (SHA-256 local `85a76fe8…02d5`, versión de checkpoint 8.2.100), afinados sobre GroundCUA convertido a formato YOLO y troceado al estilo SAHI en tiles de 640×640 con un 20 % de solapamiento: 223.826 tiles de entrenamiento y 24.687 de validación, con 9 clases.

El entrenamiento corresponde a la ejecución XMIL-YOLO2C (28 de marzo de 2026) sobre 2× H100 PCIe de 80 GB en Shadeform con DDP y AMP, usando ultralytics 8.4.30 y PyTorch 2.11.0+cu128. Se realizaron 100 épocas con batch 64, `nbs` 64, `imgsz` 640, `cos_lr`, paciencia 15, semilla 0 y optimizador `auto`; con este ajuste Ultralytics ignora `lr0` y `momentum` y los selecciona automáticamente, de modo que la tasa de aprendizaje inicial efectiva no se recuperó de forma independiente (las tasas por grupo y época están en `results.csv`, campos `lr/pg0`..`lr/pg7`). La aumentación fue conservadora: traslación 0,1, escala 0,2, HSV (h 0,01, s 0,3, v 0,3) y mosaic, mixup, volteos, rotaciones, cizalladura y perspectiva todos a 0. El tiempo de pared fue de 19,75 horas. El entrenamiento terminó aún mejorando en la época 100, según el registro `peak_then_decline: false`.

## Capacidades

- Detección de objetos en capturas de pantalla de escritorio con 9 clases: Button, Menu, Input_Elements, Navigation, Information_Display, Sidebar, Visual_Elements, Others y Unknown.
- Localización de iconos y controles que Apple Vision no cubre, pensada para combinarse con esa API en el pipeline de uitag.
- Inferencia sobre tiles de 640×640; para capturas a resolución completa se recomienda trocear con solapamiento y aplicar NMS entre tiles.
- Ejecución en CPU: el ejemplo de la model card usa `device="cpu"` y produce detecciones con puntuaciones de confianza en torno a 0,6 en el tile de validación de ejemplo.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, matemáticas, visión general ni audio: es exclusivamente un detector de cajas.
- No realiza reconocimiento de texto (OCR); las etiquetas de clase son categorías gruesas y ruidosas heredadas de GroundCUA.

## Casos de uso

- Parsing de pantallas para agentes de interfaz: el modelo localiza botones, menús y campos de entrada en capturas de escritorio y devuelve coordenadas de caja que el agente usa para decidir dónde hacer clic o escribir; su tamaño reducido permite ejecutarlo en el bucle del agente sin GPU dedicada.
- Herramientas de accesibilidad: generar mapas de controles interactivos a partir de capturas para lectores de pantalla o asistentes que necesiten señalar elementos visuales no expuestos por la API de accesibilidad del sistema.
- Automatización de pruebas de interfaz: detectar la presencia y posición de menús y botones en capturas de regresión para verificar que un cambio de UI no ha roto la disposición esperada.
- Etiquetado asistido de datos de UI: preanotar capturas con cajas candidatas antes de la revisión humana, acelerando la creación de conjuntos de datos de elementos de interfaz.
- Relleno de huecos en pipelines multimodales: combinarlo con Apple Vision (o un detector de texto) para cubrir iconos y controles que esas fuentes no detectan, tal como hace uitag v0.5.0 con `--yolo`.
- Extracción de estructura de aplicaciones de escritorio: clasificar regiones de una captura en categorías como Sidebar, Navigation o Information_Display para construir una representación jerárquica aproximada de la pantalla.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con un checkpoint de unos 19 MB, encaja en servicios ligeros o herramientas de escritorio que no pueden asumir el coste de un modelo multimodal.

## Benchmarks y rendimiento

Métricas del modelo sobre el split de validación de 24.687 tiles de GroundCUA en la época 100 (mejor época), según `train_metrics` embebido en el checkpoint, coincidentes con la fila 100 de `results.csv` y con `experiment-log.yaml`:

| Metrica | Valor |
|---|---|
| mAP@0.5 | 0,79229 |
| mAP@0.5:0.95 | 0,53978 |
| Precision | 0,741 |
| Recall | 0,74537 |

Cifras del pipeline de uitag v0.5.0 (no re-medidas para este paquete y no atribuibles al modelo aislado):

| Benchmark | Cobertura |
|---|---|
| ScreenSpot-Pro, solo YOLO (1.581 objetivos) | 80,1 % |
| ScreenSpot-Pro, Vision + YOLO | 90,8 % |
| GroundCUA (500 objetivos) | 94,0 % |
| UI-Vision (1.181 objetivos) | 83,5 % |

No se han publicado resultados de benchmarks comparativos con otros detectores de UI en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un checkpoint de 19,2 MB y entrada de 640×640, el consumo es del orden de cientos de MB en GPU, muy por debajo de cualquier GPU moderna.
- GPU recomendadas: el entrenamiento usó 2× H100 PCIe de 80 GB con DDP, pero para inferencia basta una GPU consumer; el ejemplo de la model card se ejecutó en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y también en CPU, que es el modo documentado en el ejemplo de uso.
- Opciones de despliegue: Ultralytics (`pip install ultralytics`, probado con 8.4.30), exportación a otros formatos vía Ultralytics (no documentada en la model card), e integración en el pipeline de uitag v0.5.0+ con `--yolo`.
- Latencia y throughput: no disponibles. El único dato operativo es que en CPU, con ultralytics 8.4.30 y torch 2.15.0, sobre un tile de 640×640 de validación de GroundCUA, se imprimieron 12 detecciones; no se registra el tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uitag-yolo11s-ui-detect-v1 | no disponible (checkpoint de 19,2 MB) | no aplica | mAP@0.5 0,792 en validación GroundCUA | AGPL-3.0 | Hugging Face |
| Ultralytics YOLO11s (COCO) | no disponible | no aplica | no disponible para detección de UI | AGPL-3.0 | Hugging Face (Ultralytics/YOLO11) |
| Alternativas específicas de detección de UI | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros detectores de elementos de interfaz en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un reconocedor de texto: no lee el contenido de los elementos, solo los localiza.
- Las etiquetas de clase son categorías gruesas y ruidosas heredadas de GroundCUA, que el propio conjunto describe como "aproximadas y no garantizadas para todos los elementos".
- El entrenamiento se hizo sobre aplicaciones de escritorio de Windows, macOS y Linux (GroundCUA cubre 87 plataformas); las interfaces móviles y web no se evaluaron.
- El split de validación son tiles de la misma distribución de GroundCUA, no un benchmark fuera de dominio; las métricas pueden sobreestimar el rendimiento en pantallas reales distintas.
- El entrenamiento terminó aún mejorando en la época 100, por lo que el modelo podría beneficiarse de más épocas.
- Licencia AGPL-3.0: cualquier uso en productos de código cerrado requiere una licencia comercial Enterprise de Ultralytics, que no se posee para este modelo. La etiqueta MIT que uitag aplicaba antes a estos pesos queda invalidada.
- Los términos de los datos de preentrenamiento COCO de los pesos base no se evalúan en este paquete; el usuario es responsable de verificar el cumplimiento legal, como indica la propia model card de GroundCUA.
- Riesgo de alucinación en el sentido de detecciones espurias o clasificaciones erróneas de elementos, especialmente en interfaces muy densas o con elementos pequeños; se recomienda filtrar por umbral de confianza y validar en el dominio de destino.
- Sin datos publicados de sesgos demográficos o de otro tipo; al ser un detector de UI, el riesgo principal es de cobertura y precisión, no de sesgo lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swaynehales/uitag-yolo11s-ui-detect-v1
- Repositorio de uitag: https://github.com/swaynehales/uitag
- Notas de versión de uitag v0.5.0: `uitag/docs/releases/v0.5.0.md` (en el repositorio anterior)
- Modelo base YOLO11 de Ultralytics: https://huggingface.co/Ultralytics/YOLO11
- Dataset GroundCUA: https://huggingface.co/datasets/ServiceNow/GroundCUA
- Paper de GroundCUA (Feizi et al., 2025): arXiv:2511.07332
- Licencia Ultralytics: https://ultralytics.com/license
