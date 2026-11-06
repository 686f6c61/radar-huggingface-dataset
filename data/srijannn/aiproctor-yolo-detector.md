# srijannn/aiproctor-yolo-detector

## Resumen

aiproctor-yolo-detector es un detector de objetos de visión por computador desarrollado por el usuario srijannn y publicado en Hugging Face bajo licencia MIT. Se trata de un ajuste fino de YOLOv8 Nano (`yolov8n`) orientado a la supervisión de exámenes en línea: el modelo identifica cinco categorías de objetos que pueden indicar dispositivos secundarios o material de estudio prohibido en el entorno del examinando (teléfono móvil, libro, apuntes en papel, calculadora y pantalla secundaria).

El modelo es deliberadamente ligero: 3,13 millones de parámetros y un tamaño de 6,2 MB en formato PyTorch (12,2 MB en ONNX), lo que lo hace apto para despliegue en CPU, GPU de consumo, Apple Silicon (MPS) y navegadores mediante WebRTC. Su relevancia actual reside en la creciente demanda de herramientas de proctoring automatizado que puedan ejecutarse en el propio dispositivo del candidato sin enviar vídeo a servidores externos, reduciendo costes y problemas de privacidad.

Se trata de un modelo puramente de detección de objetos: no procesa lenguaje natural, no tiene contexto textual ni capacidades generativas. Su salida son cajas delimitadoras con clase y confianza sobre fotogramas de vídeo. La model card insiste explícitamente en que las predicciones son señales de revisión observacional y nunca deben usarse para acusar o descalificar automáticamente a un candidato sin intervención humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 Nano (`yolov8n`), ajuste fino para detección de objetos |
| Parametros totales | 3,13 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en PyTorch y ONNX; no se documentan cuantizaciones INT8/FP16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`) y ONNX |
| Tamano del repositorio | 0,0 GB (según Hugging Face; tamaños de archivo reportados: 6,2 MB PyTorch, 12,2 MB ONNX) |
| Clases detectadas | `cell_phone`, `book`, `paper_notes`, `calculator`, `secondary_screen` |
| Pipeline | object-detection |
| Librería | ultralytics |
| Plataformas objetivo | Edge, navegador WebRTC, CPU/GPU, Apple Silicon MPS |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura YOLOv8 Nano de Ultralytics, una red convolucional de una sola etapa optimizada para detección en tiempo real con un coste computacional muy bajo. El ajuste fino se realizó sobre el dataset `exam-objects-calibration`, según los metadatos de la model card, aunque no se especifica el número de imágenes, la composición del dataset ni si se aplicaron técnicas de aumento de datos.

La evaluación se realizó sobre una partición no contaminada, con separación estricta por participante y sesión ("zero participant/session leakage"), lo que indica que el autor tomó medidas para evitar fuga de información entre entrenamiento y test. No se documentan detalles sobre la función de pérdida, el número de épocas, el optimizador ni si se aplicó destilación o poda. Tampoco se mencionan innovaciones técnicas adicionales más allá del propio ajuste fino de YOLOv8n.

## Capacidades

- Detección de objetos en tiempo real sobre fotogramas de vídeo, con cinco clases específicas del entorno de examen.
- Salida de cajas delimitadoras con clase y puntuación de confianza, apta para post-procesado y filtrado por umbral.
- Ejecución en CPU a aproximadamente 16,5 FPS (60,5 ms por fotograma), lo que permite procesamiento en streaming sin GPU dedicada.
- Compatibilidad con el ecosistema Ultralytics: carga mediante `YOLO("best.pt")` y predicción con `model.predict(...)`.
- Exportación a ONNX para integración en runtimes ligeros y despliegue en navegador.
- Soporte de inferencia en Apple Silicon mediante MPS.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Supervisión de exámenes en línea en tiempo real: el modelo procesa fotogramas del webcam del candidato y genera alertas cuando detecta un teléfono móvil, un libro, apuntes o una pantalla secundaria, que el invigilador humano revisa después. Su velocidad en CPU (~16,5 FPS) permite ejecutarlo en el equipo del candidato sin infraestructura dedicada.
- Proctoring en el navegador vía WebRTC: gracias a la exportación ONNX y su tamaño reducido (12,2 MB), puede integrarse en aplicaciones web que ejecutan la inferencia localmente, evitando enviar vídeo a servidores y reduciendo riesgos de privacidad.
- Despliegue en dispositivos de bajo coste: su tamaño de 6,2 MB en PyTorch y 3,13 millones de parámetros permiten ejecutarlo en mini-PC, Raspberry Pi o portátiles modestos usados en aulas o centros de evaluación.
- Filtro previo en pipelines de revisión: el modelo actúa como primera etapa que descarta fotogramas sin objetos sospechosos, reduciendo el volumen de vídeo que un revisor humano o un modelo más pesado debe examinar.
- Evaluación de cumplimiento de normas en aulas físicas con cámara: puede adaptarse para detectar calculadoras o apuntes en mesas de examen presencial, siempre como señal de apoyo al profesorado.
- Investigación en visión por computador aplicada a educación: sirve como baseline ligero para experimentos sobre detección de objetos en entornos de examen, con métricas publicadas (recall 95,0 %, mAP@50 25,9 %) que permiten comparaciones reproducibles.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Recall | 95,0 % |
| mAP@50 | 25,9 % |
| Velocidad de inferencia (CPU) | 60,5 ms por fotograma (~16,5 FPS) |

Los datos proceden de la evaluación del autor sobre una partición sin fuga de información entre participantes y sesiones. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del modelo (3,13 M parámetros, 6,2 MB en PyTorch), es inferior a 1 GB en FP32 y aún menor en FP16 o INT8.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; el modelo está diseñado para CPU y edge, por lo que no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos unos pocos cientos de MB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.), y también en CPU.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime, y potencialmente otros runtimes compatibles con ONNX; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de objetos).
- Latencia y throughput estimados: 60,5 ms por fotograma en CPU (~16,5 FPS), según la model card. No se publican cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aiproctor-yolo-detector (YOLOv8n ajustado) | 3,13 M | Detección de objetos | no aplica | MIT | Hugging Face |
| YOLOv8n base (Ultralytics) | ~3,2 M | Detección de objetos genérica | no aplica | AGPL-3.0 (Ultralytics) | GitHub / Ultralytics |
| YOLOv8s base (Ultralytics) | ~11,2 M | Detección de objetos genérica | no aplica | AGPL-3.0 (Ultralytics) | GitHub / Ultralytics |

La comparación se limita a la familia YOLOv8, ya que no se dispone de información sobre otros detectores especializados en proctoring en la documentación proporcionada. El valor diferencial de este modelo es su especialización en cinco clases concretas del entorno de examen y su licencia MIT, frente a la licencia AGPL-3.0 de los pesos base de Ultralytics, lo que puede facilitar su uso en productos propietarios.

## Limitaciones y advertencias

- mAP@50 de solo 25,9 %: la precisión global es baja, lo que implica un número elevado de falsos positivos y falsos negativos; el recall del 95,0 % se logra probablemente a costa de precisión.
- Riesgo elevado de falsos positivos: objetos cotidianos como libros o papeles pueden confundirse con material prohibido, generando alertas injustificadas.
- Sesgos potenciales: el dataset `exam-objects-calibration` no está descrito en detalle, por lo que se desconocen sesgos de iluminación, ángulo de cámara, demografía o condiciones de captura.
- Limitación de dominio: entrenado para entornos de examen; su rendimiento fuera de ese contexto no está documentado.
- Sin capacidades lingüísticas ni de razonamiento: no puede interpretar el contenido de los objetos detectados ni contextualizar la escena.
- Restricciones éticas y de uso: la model card exige que las predicciones se usen únicamente como señales de revisión por parte de invigiladores humanos y nunca para acusar, penalizar o descalificar automáticamente a candidatos.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar las obligaciones derivadas de los pesos base de Ultralytics (AGPL-3.0) si el ajuste fino se distribuye junto con componentes de esa librería.
- Sin datos de benchmarks comparativos ni de cuantización: no se dispone de información sobre rendimiento en INT8/FP16 ni sobre latencia en GPU.

## Enlaces

- Hugging Face: https://huggingface.co/srijannn/aiproctor-yolo-detector
- Ultralytics YOLOv8: https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com/
- Dataset referenciado (según metadatos): `exam-objects-calibration` (no se proporciona enlace directo en la información disponible)
- No se han encontrado enlaces a papers, blogs, repositorios adicionales ni demos en la información proporcionada.
