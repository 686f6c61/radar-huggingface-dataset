# turhancan97/visbench-relative_pose-dinov2_vits14

## Resumen

`turhancan97/visbench-relative_pose-dinov2_vits14` no es un modelo generativo ni un backbone, sino una **cabeza de sondeo (probe head)** entrenada por el autor turhancan97 dentro del marco VisBench. Su funcion es medir que informacion geometrica contienen las representaciones internas del backbone congelado `dinov2_vits14` (ViT-S/14 de DINOv2) para la tarea de estimacion de pose relativa entre pares de imagenes. El modulo se ajusta sobre caracteristicas extraidas con `pooling=cls` y `feature_mode=dense_only`, y el sistema rechaza cargarlo contra cualquier otro backbone o configuracion de pooling.

La relevancia es metodologica: los probes son herramientas de evaluacion de representaciones, no modelos de produccion. Permiten cuantificar si un encoder visual autosupervisado captura informacion de rotacion y traslacion sin reentrenar el backbone. En este caso, los resultados publicados muestran que las features de `dinov2_vits14` codifican la rotacion relativa con cierta precision (76,9 % de acierto a 30 grados) pero la traslacion y la rotacion en el plano del suelo son practicamente inutilizables con esta configuracion.

El repositorio tiene 0 descargas y 0 likes, un tamano de 0,0 GB (solo los pesos de la cabeza MLP) y fue creado el 25 de noviembre de 2026. La libreria declarada es `visbench`, sin pipeline definido en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MLP de sondeo (probe) sobre backbone congelado ViT-S/14 (DINOv2) |
| Parametros totales | No disponible (solo pesos de la cabeza; el backbone se carga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision por pares de imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (vision) |
| Licencia | No disponible |
| Formato de pesos | No disponible (carga via `visbench.hub.load_probe_from_hub`) |

## Arquitectura y entrenamiento

La cabeza es un MLP con dimensiones ocultas `[512, 256, 128]`, entrenada sobre caracteristicas del backbone `dinov2_vits14` (clave `dinov2/dinov2_vits14/224/7764ea0f912e`), con `pooling=cls` solicitado como `default`, `feature_mode=dense_only` y sin seleccion explicita de capas (`layers=None`). El entrenamiento uso el protocolo `probe3d_pose` de VisBench, con 50.519 pares de entrenamiento, 30 epocas, batch de 128, optimizador AdamW con `lr=0.001` y `weight_decay=0.0001`, y un scheduler coseno.

La innovacion esta en el diseno de seguridad del cargador: el modulo verifica que el backbone y la configuracion de pooling coincidan con los usados en el ajuste, porque un desajuste produce formas compatibles y un numero plausible pero incorrecto de forma silenciosa. No hay datos sobre el dataset de imagenes usado (composicion, origen, resolucion) mas alla del numero de pares.

## Capacidades

- Estimacion de pose relativa entre pares de imagenes: prediccion de rotacion y traslacion relativas.
- Metricas de rotacion en el plano del suelo (`floor_rotation_*`) y rotacion general (`rotation_*`).
- Evaluacion de representaciones: mide la informacion geometrica contenida en las features de DINOv2 ViT-S/14.
- No genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de audio.
- No es un modelo de proposito general: solo funciona con el backbone `dinov2_vits14` y la configuracion `cls` + `dense_only`.

## Casos de uso

- Evaluacion de encoders visuales en investigacion: comparar que informacion geometrica capturan distintas variantes de DINOv2 usando el mismo protocolo `probe3d_pose` y las mismas metricas.
- Auditoria de representaciones antes de elegir backbone: determinar si `dinov2_vits14` es adecuado para una tarea downstream de pose antes de invertir en un modelo especifico.
- Reproducibilidad de experimentos: el repositorio documenta hiperparametros completos (epocas, learning rate, scheduler, tamano de batch) para replicar el ajuste.
- Baseline de referencia en pipelines de VisBench: sirve como punto de comparacion para probes de otras tareas o de otros backbones.
- Analisis de limitaciones de DINOv2 en geometria: los resultados a 15 grados (44,7 %) frente a 30 grados (76,9 %) permiten estudiar la granularidad de la informacion de rotacion.
- Docencia y formacion: ejemplo minimo y autocontenido de como se entrena y evalua una cabeza de sondeo sobre features congeladas.
- No es adecuado para produccion: no hay licencia declarada, no hay datos de latencia ni de robustez fuera del conjunto de evaluacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `floor_rotation_acc@15deg` | 0,0374 |
| `floor_rotation_acc@30deg` | 0,1563 |
| `floor_rotation_error_deg` | 66,8464 |
| `floor_rotation_median_deg` | 65,6347 |
| `floor_translation_error` | 0,2411 |
| `rotation_acc@15deg` | 0,4466 |
| `rotation_acc@30deg` | 0,7690 |
| `rotation_error_deg` | 25,3698 |
| `rotation_median_deg` | 16,5657 |
| `translation_error` | 0,1020 |

No se han publicado comparaciones con otros probes o backbones en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para la cabeza en si; el backbone `dinov2_vits14` (ViT-S/14, ~22 M de parametros) es ligero y cabe en GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM para el backbone; no hay datos especificos de inferencia publicados.
- Cabe en GPU de consumo: si, el backbone ViT-S/14 es pequeno; la cabeza MLP anade una carga despreciable.
- Opciones de despliegue: la libreria `visbench` con `load_probe_from_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modulo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| visbench-relative_pose-dinov2_vits14 | Cabeza MLP sobre ViT-S/14 | No aplica | Probe de pose relativa | No disponible | Hugging Face |
| dinov2_vits14 (backbone) | ~22 M | No aplica | Features visuales generales | No disponible en esta ficha | Hugging Face |
| Otros probes VisBench | No disponible | No aplica | Otras tareas de sondeo | No disponible | No disponible |

No hay informacion suficiente para comparar rendimiento con alternativas equivalentes.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales.
- Solo funciona con el backbone `dinov2_vits14` y la configuracion `pooling=cls` + `feature_mode=dense_only`; el cargador rechaza otras combinaciones.
- La rotacion en el plano del suelo es practicamente aleatoria con esta configuracion (3,7 % a 15 grados, 15,6 % a 30 grados).
- El error de traslacion (`0,1020`) y de rotacion (`25,37 grados` de media) limitan su uso fuera de evaluacion comparativa.
- Licencia no declarada: no se puede asumir uso comercial permitido.
- Sin datos de sesgos, robustez, dominios de imagen ni composicion del dataset de entrenamiento.
- Riesgo de interpretacion erronea: un probe mide lo que el backbone codifica bajo una configuracion concreta, no el rendimiento maximo alcanzable con fine-tuning.
- Repositorio sin descargas ni validacion externa: no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-relative_pose-dinov2_vits14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
- Backbone DINOv2: no disponible en la informacion proporcionada
- Paper de DINOv2: no disponible en la informacion proporcionada
