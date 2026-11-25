# turhancan97/visbench-orientation-dinov2_vits14

## Resumen

`visbench-orientation-dinov2_vits14` no es un modelo generativo ni un backbone de vision: es una **cabeza de sondeo (probe head) lineal** entrenada por el usuario turhancan97 dentro del framework VisBench. Su funcion es medir que informacion geometrica de bajo nivel (concretamente la orientacion de estructuras) esta presente en las caracteristicas densas extraidas por el backbone congelado `dinov2_vits14`. El modulo se ajusta sobre features ya calculadas y no modifica ni sustituye al backbone.

El interes practico es acotado pero metodologico: sirve para auditar representaciones de modelos de vision sin reentrenarlos. Al fijar el backbone y entrenar solo una capa lineal (con `hidden_dim=512`), se obtiene una cota superior interpretable de la informacion de orientacion codificada en esas features. Los resultados reportados indican un error angular medio de 22,13 grados y un RMSE de 32,75, frente a techos de referencia de 11,02 grados y 19,79 respectivamente.

El repositorio es de tamano practicamente nulo (0,0 GB), sin descargas ni likes en el momento de la consulta, y la model card no declara licencia ni idiomas. Es, por tanto, un artefacto de investigacion reproducible mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza lineal (probe head) sobre features congeladas de un ViT; no es un transformer completo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de vision, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (cargado mediante `visbench.hub.load_probe_from_hub`) |
| Backbone asociado | `dinov2_vits14` (clave `dinov2/dinov2_vits14/224/7764ea0f912e`) |
| Tarea | `orientation` (nivel bajo / low_level) |
| Pooling | `mean` |
| Modo de caracteristicas | `dense_only` |
| Capas | `None` |
| Dimension oculta | 512 |
| Activacion | `l2_normalize` |
| Funcion de perdida | `coherence_weighted_angular` |
| Protocolo | `visbench_structure_tensor_orientation_regression` |

## Arquitectura y entrenamiento

El modulo es una cabeza lineal que opera sobre caracteristicas densas de `dinov2_vits14` (ViT-S/14, con entrada de 224 px) agregadas mediante pooling de media y normalizadas con L2. La cabeza proyecta a una dimension oculta de 512 y se entrena para regresion de orientacion bajo el protocolo `visbench_structure_tensor_orientation_regression`, con una perdida angular ponderada por coherencia (`coherence_weighted_angular`). El backbone permanece congelado: solo se optimizan los pesos de la cabeza.

El entrenamiento se realizo durante 10 epocas con AdamW (`lr=0.0005`, `weight_decay=0.0001`), `batch_size=8` y 1,5 epocas de warmup. No se especifica en la informacion disponible el volumen ni la composicion del dataset de ajuste, ni si hubo etapas de RLHF/DPO (no aplicables a este tipo de modulo). La innovacion tecnica relevante es el control estricto de compatibilidad: el cargador rechaza pesos ajustados sobre otro pooling o backbone, ya que un desajuste de ese tipo produciria formas correctas pero un valor numerico plausible y erroneo.

## Capacidades

- Regresion de orientacion de estructuras sobre features de `dinov2_vits14` (tarea de nivel bajo).
- Proporciona metricas de error angular y RMSE para auditar la representacion del backbone.
- Ofrece cotas de referencia (`ceiling_*`) para contextualizar el rendimiento del probe.
- Carga integrada en el ecosistema VisBench mediante `load_probe_from_hub`.
- Verificacion de compatibilidad backbone/pooling/modo de features en tiempo de carga.
- No soporta generacion de texto, tool calling, agentes, vision generativa, audio ni capacidades multilingues.

## Casos de uso

- Auditoria de representaciones en investigacion: medir cuanto contenido de orientacion capturan las features de `dinov2_vits14` antes de disenar un pipeline de vision geometrica.
- Seleccion de backbone: comparar el probe de orientacion entre distintos backbones de VisBench para decidir cual conviene congelar en una tarea de estructura.
- Validacion de pooling: comprobar si el pooling de media es adecuado frente a alternativas, dado que el modulo rechaza configuraciones distintas a la de entrenamiento.
- Reproducibilidad de experimentos: replicar el ajuste con los hiperparametros documentados (`epochs=10`, `lr=0.0005`, `batch_size=8`) para verificar resultados.
- Docencia y formacion: ejemplo minimo de linear probing con perdida angular para explicar evaluacion de features congeladas.
- Control de calidad de datasets: usar el error angular del probe como senal indirecta de la calidad geometrica de un conjunto de imagenes candidato.
- Referencia de cotas superiores: emplear `ceiling_orientation_error` (11,0211 grados) y `ceiling_rmse` (19,7928) como umbrales al evaluar cabezas mas complejas.

## Benchmarks y rendimiento

Resultados reportados en la model card para la tarea de orientacion:

| Metrica | Valor del probe | Techo de referencia (`ceiling_*`) |
|---|---|---|
| `d1` | 0,4962 | 0,7321 |
| `d2` | 0,6688 | 0,8652 |
| `median` | 12,0178 | 4,7792 |
| `orientation_error` (grados) | 22,1315 | 11,0211 |
| `rmse` | 32,7536 | 19,7928 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no son aplicables a este tipo de modulo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de una cabeza lineal sobre features precalculadas, el coste dominante es el del backbone `dinov2_vits14` (ViT-S/14), no el del probe.
- GPU recomendadas: cualquier GPU con memoria suficiente para ejecutar `dinov2_vits14` a 224 px; el probe en si requiere recursos minimos.
- Cabe en GPU de consumo: si, siempre que se pueda ejecutar el backbone ViT-S/14 en la misma GPU.
- Opciones de despliegue: libreria `visbench` (carga via `visbench.hub.load_probe_from_hub`); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modulo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros probes de orientacion ni modulos VisBench comparables con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo funciona con el backbone `dinov2_vits14` y con `pooling=mean` y `feature_mode=dense_only`; cualquier otro ajuste se rechaza en la carga.
- No es un modelo generativo: no produce texto, codigo ni imagenes.
- El error angular reportado (22,13 grados) es sustancialmente superior al techo de referencia (11,02 grados), lo que limita su uso como estimador preciso de orientacion.
- No se declara licencia, por lo que el uso comercial queda sin autorizacion explicita.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni riesgos de alucinacion (no aplicable en sentido estricto).
- Repositorio sin descargas ni likes y sin pipeline declarado: madurez y mantenimiento no verificables.
- No se documentan idiomas soportados ni contexto, al no tratarse de un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-orientation-dinov2_vits14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
