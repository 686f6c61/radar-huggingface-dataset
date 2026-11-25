# turhancan97/visbench-scene_parsing-dinov2_vits14

## Resumen

`turhancan97/visbench-scene_parsing-dinov2_vits14` no es un modelo generativo ni un backbone de vision, sino una **cabeza de sondeo (probe head) lineal** entrenada sobre las caracteristicas congeladas del backbone `dinov2_vits14`. Forma parte del ecosistema VisBench, un framework de evaluacion cuyo objetivo es medir que informacion semantica contienen realmente las representaciones internas de un modelo de vision preentrenado, sin reentrenar el backbone. En concreto, esta sonda evalua la tarea de *scene parsing* (segmentacion semantica de escenas de alto nivel) sobre 40 clases.

El modulo se ajusto con `pooling=mean` y `feature_mode=dense_only`, y solo es valido contra el backbone exacto `dinov2_vits14` con la clave `dinov2/dinov2_vits14/224/7764ea0f912e`. La libreria rechaza cargarlo contra cualquier otra configuracion porque, segun el autor, la cabeza mantendria formas compatibles y produciria un valor plausible pero incorrecto de forma silenciosa.

Su relevancia es metodologica: proporciona una referencia reproducible (epochs, learning rate, optimizador, funcion de perdida y protocolo documentados) para comparar la calidad de las caracteristicas de distintos backbones en segmentacion semantica. Los resultados reportados son `mean_acc` 0,5724, `miou` 0,4519, `miou_per_image` 0,3014 y `pixel_acc` 0,7070. El repositorio tiene 0 descargas, 0 likes y un tamano de 0,0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza lineal (probe) sobre backbone ViT congelado `dinov2_vits14` |
| Parametros totales | no disponible (el backbone `dinov2_vits14` tiene aproximadamente 22 M; el numero exacto de la cabeza no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224 px segun la clave del backbone) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (carga mediante `visbench.hub.load_probe_from_hub`) |

## Arquitectura y entrenamiento

La arquitectura es una cabeza lineal (`head: linear`) con `hidden_dim` 512 y `num_classes` 40, que opera sobre caracteristicas densas del backbone `dinov2_vits14` extraidas con `pooling=mean` y `feature_mode=dense_only`. No se especifica el uso de capas intermedias (`layers: None`), lo que implica que la sonda consume la salida final del backbone. El backbone permanece congelado durante todo el ajuste; solo se entrena la cabeza.

El entrenamiento se realizo con el protocolo `visbench_scene_parsing`: 10 epochs, `batch_size` 8, optimizador AdamW con `lr` 0,0005, `weight_decay` 0,0001 y 1,5 epochs de warmup. La funcion de perdida es entropia cruzada con `ignore_index=-1`, y la metrica mIoU se calcula con `miou_reduction: dataset_and_per_image`. No se documenta el volumen ni la composicion del dataset de entrenamiento, ni si hubo aumentacion de datos o tecnicas adicionales de regularizacion.

## Capacidades

- Segmentacion semantica densa de escenas en 40 clases, evaluada mediante mIoU y precision por pixel.
- Extraccion de informacion semantica de caracteristicas congeladas de DINOv2 (evaluacion de representaciones, no generacion).
- Proporciona metricas reproducibles para comparar backbones bajo un protocolo fijo (`visbench_scene_parsing`).
- Validacion estricta de compatibilidad backbone-sonda: rechaza la carga si el backbone, el pooling o el modo de caracteristicas no coinciden.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Evaluacion de representaciones de DINOv2: medir con una referencia fija (`miou` 0,4519) cuanto conocimiento semantico de escenas contienen las caracteristicas de `dinov2_vits14` frente a otros backbones.
- Baseline en investigacion de vision: usar esta sonda como punto de comparacion al probar nuevas tecnicas de preentrenamiento o destilacion sobre DINOv2.
- Seleccion de backbone para segmentacion: comparar los resultados de esta sonda con las de otros backbones de VisBench para decidir que encoder usar en un pipeline de segmentacion semantica.
- Auditoria de pipelines de features: verificar que la extraccion de caracteristicas (pooling y modo denso) se mantiene estable entre versiones, ya que la sonda falla de forma explicita ante configuraciones incompatibles.
- Docencia y reproduccion: replicar el experimento con los hiperparametros documentados (AdamW, lr 0,0005, 10 epochs) para validar el protocolo VisBench.
- Analisis de errores por clase: con 40 clases y `pixel_acc` 0,7070 frente a `miou` 0,4519, el desequilibrio entre ambas metricas permite identificar clases minoritarias mal segmentadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `mean_acc` | 0,5724 |
| `miou` | 0,4519 |
| `miou_per_image` | 0,3014 |
| `pixel_acc` | 0,7070 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El backbone `dinov2_vits14` (ViT-S, aproximadamente 22 M de parametros) es ligero y cabe holgadamente en GPU de consumo; la cabeza lineal anade un coste despreciable.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia bastar para inferencia a 224 px; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- GPU de consumo: si, previsiblemente en GTX 1660, RTX 3060 y superiores; no confirmado por el autor.
- Opciones de despliegue: la via documentada es la libreria `visbench` mediante `visbench.get_backbone` y `visbench.hub.load_probe_from_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modulo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras sondas de VisBench ni resultados de backbones alternativos con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el backbone `dinov2_vits14` con `pooling=mean` y `feature_mode=dense_only`; cualquier otra configuracion se rechaza o produce resultados invalidos.
- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor.
- El rendimiento es moderado (`miou` 0,4519, `miou_per_image` 0,3014), insuficiente para produccion en segmentacion semantica de alta exigencia.
- El desequilibrio entre `pixel_acc` (0,7070) y `miou` (0,4519) sugiere sesgo hacia clases mayoritarias.
- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos de dominio y la cobertura de clases.
- Riesgo de alucinacion no aplicable (no genera texto), pero si de metricas enganosas si se usa fuera del protocolo previsto.
- Repositorio sin descargas ni validacion comunitaria: no hay evidencia externa de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-scene_parsing-dinov2_vits14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
