# uwaisasghar/p2pnet-visdrone-head-counting

## Resumen

P2PNet VisDrone head-point localization es un checkpoint de vision por computador basado en la arquitectura P2PNet (Point-to-Point Network), especializado en la localizacion y conteo de cabezas en imagenes aereas capturadas por drones (UAV). Lo desarrolla el autor `uwaisasghar` como extension de la investigacion original de Song et al. (2021), adaptando el modelo para devolver coordenadas puntuales `(x, y, confianza)` por cada cabeza detectada, en lugar de cajas delimitadoras. El modelo cuenta con 21.587.792 parametros totales y se distribuye en formato SafeTensors (86,3 MB, 123 tensores).

El modelo resuelve el problema del crowd counting (conteo de multitudes) en escenarios aereos, donde la densidad de personas y la perspectiva oblicua dificultan el uso de detectores de objetos convencionales. Frente a enfoques de regresion de densidad, P2PNet emplea localizacion puntual pura, lo que permite obtener tanto el conteo como las posiciones individuales de cada cabeza. Se ha entrenado sobre VisDrone2020-CC con 1.950 imagenes de entrenamiento (290.556 puntos anotados) y validado sobre 510 imagenes (72.171 puntos).

Es relevante en el contexto actual de vigilancia aerea, gestion de multitudes y analisis de imagenes UAV, aunque su licencia restringida a investigacion academica limita su uso comercial. El checkpoint es de inferencia unicamente y solo se ha entrenado uno de los cinco folds planificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | P2PNet (Point-to-Point Network), red de localizacion puntual basada en CNN con prediccion de puntos y confianza |
| Parametros totales | 21.587.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye en SafeTensors fp32/fp16; se reporta inferencia en fp16) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | p2pnet-academic-research-only (solo investigacion academica) |
| Formato de pesos | safetensors (model.safetensors, 86.362.656 bytes, SHA-256: acb2f7196538fff3187b2e02fd9629802a9f7d5faec3d8bdbe9c47cd6ed003c9) |

## Arquitectura y entrenamiento

P2PNet es una red puramente basada en puntos que predice un conjunto de coordenadas y sus confianzas directamente, sin anclas ni cajas delimitadoras. La arquitectura consta de un backbone convolucional (VGG16 en la implementacion original de P2PNet) seguido de cabezas de prediccion que generan propuestas de puntos, las cuales se refinan mediante un mecanismo de matching hungaro durante el entrenamiento. En inferencia, el modelo devuelve propuestas `(x, y, confidence)` y el conteo se obtiene del numero de puntos retenidos tras aplicar un umbral (0,50 en los resultados reportados).

El entrenamiento se realizo sobre VisDrone2020-CC, con un split determinista a nivel de secuencia (fold 0 de 5, semilla 42): 1.950 frames de entrenamiento con 290.556 puntos de cabeza anotados y 510 frames de validacion con 72.171 puntos. Se uso early stopping, con mejor epoca en la 49 y parada en la 79. No se reporta uso de RLHF ni DPO (no aplica a vision). El checkpoint distribuido contiene unicamente los tensores del modelo en SafeTensors; el `.pth` original con estado de optimizador y scheduler no se incluye. La innovacion principal es la adaptacion de P2PNet a dominio aereo (UAV) con localizacion puntual explicita en lugar de regresion de densidad.

## Capacidades

- Deteccion y localizacion puntual de cabezas en imagenes aereas capturadas por drones.
- Conteo de multitudes (crowd counting) mediante el numero de puntos retenidos tras umbral de confianza.
- Salida estructurada por punto: coordenadas `(x, y)` y puntuacion de confianza.
- Procesamiento de imagenes de alta resolucion (hasta `max-side` configurable, 1920 px en los ejemplos).
- Inferencia en fp16 con latencia reportada de 114,7 ms a 1920×1080 en RTX 4060 Laptop GPU.
- Exportacion de resultados a JSON (conteo, tiempo de inferencia, dispositivo, escala de entrada y puntos con confianza) y a imagen PNG anotada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo linguistico).
- No dispone de capacidades multilingues, vision general, audio ni modo thinking.

## Casos de uso

- Gestion de multitudes en eventos al aire libre: el modelo permite estimar el numero de personas y su distribucion espacial desde imagenes de dron, adecuado por su MAE de 21,86 en el conjunto de test independiente de VisDrone2020-CC.
- Monitorizacion de aglomeraciones en espacio publico: con 114,7 ms por frame a 1920×1080 en fp16, permite procesar secuencias a aproximadamente 4-8 FPS segun resolucion, suficiente para analisis no critico en tiempo casi real.
- Investigacion academica en crowd counting aereo: el checkpoint sirve como baseline reproducible (split determinista, semilla 42, fold 0) para comparar con UAV-Dot y otros metodos de localizacion puntual.
- Analisis post-evento de grabaciones UAV: el script de inferencia permite procesar imagenes sueltas y exportar JSON con cada punto y su confianza, facilitando el analisis offline de densidad y distribucion.
- Evaluacion comparativa de arquitecturas de localizacion puntual: el modelo se integra en el Gradio Space del autor que lo compara lado a lado con UAV-Dot, util para estudiar el trade-off entre precision (L-mAP 52,49) y latencia (114,7 ms frente a 29,3 ms de UAV-Dot).
- Docencia y formacion en vision por computador: por su tamano reducido (21,6 M de parametros, 86 MB) y su script de inferencia autonomo, es viable en entornos docentes con GPUs de consumo.
- Prototipado de sistemas de conteo en drones de bajo coste: al caber en GPUs consumer (RTX 4060 Laptop), permite validar pipelines de conteo aereo antes de invertir en hardware especializado.

## Benchmarks y rendimiento

Resultados en el conjunto de test independiente (900 frames de 30 secuencias no vistas, 137 personas por frame, umbral 0,50, protocolo DroneCrowd):

| Metrica | P2PNet (este modelo) | UAV-Dot (pesos publicados) |
|---|---:|---:|
| Count MAE / RMSE | 21,86 / 29,58 | 25,04 / 33,66 |
| F1 a 16 px | 0,725 | 0,726 |
| L-mAP (DroneCrowd, 1-25 px) | 52,49 | 51,00 |
| Latencia fp16, 1920×1080, RTX 4060 Laptop | 114,7 ms | 29,3 ms |

Resultados en el fold de validacion (510 frames, 72.171 puntos; no son resultados de test independiente):

| Metrica | Valor |
|---|---:|
| Count MAE a umbral 0,50 | 10,0255 |
| Count RMSE a umbral 0,50 | 13,0832 |
| Precision a 16 px | 0,7988 |
| Recall a 16 px | 0,8315 |
| F1 a 16 px | 0,8148 |
| Ranked AP a 16 px | 0,8558 |

Nota: las metricas de puntos usan matching hungaro uno a uno con radio fijo de 16 px. El Ranked AP es AP de radio fijo, no una metrica nAP normalizada por tamano de cabeza. Menor MAE y RMSE es mejor; no son metricas de exactitud de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 21,6 M de parametros y pesos SafeTensors de 86 MB, la huella es muy reducida (del orden de cientos de MB incluyendo activaciones a 1920×1080).
- GPU recomendadas: RTX 4060 Laptop GPU es la unica medida en la informacion disponible (114,7 ms fp16 a 1920×1080; 243,14 ms a resolucion completa, ~4,11 pasadas por segundo antes de I/O). GPUs de gama alta como A100 o H100 no se reportan.
- Cabe en GPU consumer: si, segun la evidencia del autor en RTX 4060 Laptop.
- Opciones de despliegue: script `inference.py` incluido (PyTorch), `p2pnet_runtime.py` con arquitectura y preprocesado autonomos, y Gradio Space del autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 114,7 ms fp16 a 1920×1080 en RTX 4060 Laptop; 243,14 ms a resolucion completa (~4,11 FPS antes de la mayoria de I/O).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Count MAE (test) | L-mAP | Latencia fp16 1920×1080 | Licencia |
|---|---|---:|---:|---:|---:|---|
| P2PNet (este modelo) | 21,59 M | Localizacion puntual | 21,86 | 52,49 | 114,7 ms (RTX 4060 Laptop) | Solo investigacion academica |
| UAV-Dot (pesos publicados) | no disponible | Localizacion puntual | 25,04 | 51,00 | 29,3 ms (RTX 4060 Laptop) | no disponible |
| Ptak et al., Remote Sensing 2022 | no disponible | Regresion de densidad + flujo optico | no disponible | no disponible | no disponible | no disponible |

El autor indica explicitamente que este modelo no reproduce el trabajo de Ptak et al. (2022), que usaba regresion de densidad, canales de flujo optico, multiples arquitecturas y validacion de cinco folds. No se dispone de mas alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se ha entrenado uno de los cinco folds planificados; el resto no esta disponible.
- La seleccion del umbral y la seleccion del checkpoint usaron el mismo fold de validacion, lo que puede introducir sesgo optimista en las metricas de validacion.
- Cabezas pequenas, ocluidas, borrosas o de bajo contraste pueden no detectarse.
- Estructuras de fondo pueden generar falsos positivos.
- El rendimiento no esta establecido para nuevas camaras, altitudes, ubicaciones, condiciones meteorologicas, imagenes termicas ni para la tarea de deteccion de vehiculos.
- El widget generico de object-detection de Hugging Face esta desactivado porque su contrato de cajas delimitadoras no coincide con la localizacion puntual.
- Licencia `p2pnet-academic-research-only`: no es MIT, Apache ni permisiva para uso comercial. Es obligatorio revisar `LICENSE` antes de descargar, usar o redistribuir el checkpoint.
- Uso previsto limitado a investigacion academica sobre conteo aereo y localizacion puntual explicita; no destinado a reconocimiento de identidad, inferencia demografica, decisiones autonomas de aplicacion de la ley ni uso critico para la seguridad no validado.
- Riesgo de alucinacion: no aplica en sentido linguistico, pero si existe riesgo de falsos positivos o puntos espurios en imagenes fuera de distribucion.
- Las imagenes y anotaciones de VisDrone no se incluyen en el repositorio del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uwaisasghar/p2pnet-visdrone-head-counting
- Repositorio de codigo y documentacion de entrenamiento: https://github.com/owaisasghar/uav-crowd-counting
- Gradio Space (comparativa con UAV-Dot): https://huggingface.co/spaces/uwaisasghar/uav-crowd-counting
- Paper original P2PNet (Song et al., ICCV 2021): "Rethinking Counting and Localization in Crowds: A Purely Point-Based Framework"
- Trabajo de referencia UAV (Ptak et al., Remote Sensing 2022): no disponible enlace directo en la informacion proporcionada
