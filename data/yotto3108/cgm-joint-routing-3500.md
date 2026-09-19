# Yotto3108/cgm-joint-routing-3500

## Resumen

Cgm-joint-routing-3500 es un bundle de investigación publicado por el usuario Yotto3108 en HuggingFace. No se trata de un modelo de lenguaje, sino de un checkpoint de aprendizaje de representaciones para datos de monitorización continua de glucosa (CGM, por sus siglas en inglés). El objetivo es extraer representaciones vectoriales de 128 dimensiones a partir de ventanas de 24 horas de lecturas de glucosa (288 franjas de cinco minutos, con valores en mg/dL) para alimentar tareas posteriores de clasificación o regresión.

El modelo combina un encoder tipo JEPA (Joint Embedding Predictive Architecture) con mecanismos de fusión y enrutamiento (routing), embeddings de entrada y cabezas de predicción y reconstrucción, todo ello apoyado sobre un backbone Chronos-2 congelado de Amazon (aproximadamente 478 MB de pesos que no se duplican en el repositorio). El checkpoint corresponde al baseline de 3.500 actualizaciones con semilla 43, seleccionado por su rendimiento en evaluación PR-AUC ordinaria mediante linear probing congelado.

Su relevancia radica en que ofrece un punto de partida reproducible para la investigación en representaciones de series temporales fisiológicas, con métricas verificadas y un entorno de carga autocontenido. Está pensado como entrega de investigación para un colaborador identificado como Udit, y no como un modelo listo para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder JEPA sobre backbone congelado Chronos-2, con fusion, routing, embeddings de entrada y cabezas de prediccion/reconstruccion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 288 franjas de 5 minutos (24 horas); representacion de salida de 128 dimensiones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoints/seed_43/model.pt`); pesos de Chronos-2 descargados desde `amazon/chronos-2` en su revision congelada |

## Arquitectura y entrenamiento

El modelo sigue el paradigma JEPA: un encoder en linea (`jepa.online_encoder`) produce representaciones a partir de ventanas de CGM, mientras que un objetivo EMA se actualiza con `model.update_targets()`. La representacion final de 128 dimensiones no depende solo del encoder, sino tambien de la fusion, el router y los embeddings de entrada entrenados, junto con el backbone congelado Chronos-2. El repositorio incluye todo el estado no perteneciente a Chronos (encoder CGM, fusion, routing, embeddings, cabezas y estado EMA) mas el estado de AdamW original, y los verificadores de reconstruccion permanecen congelados.

El entrenamiento se realizo durante 3.500 actualizaciones con la semilla 43, sobre 1.094 ventanas publicas de preentrenamiento sin datos de WearCGM. El enrutador se optimiza con un recorte de gradiente independiente del resto de parametros (`clip_grad_norm_` separado a 1.0). La entrada debe usar valores crudos en mg/dL acompanados de una mascara de observacion para los valores faltantes; no se debe prenormalizar ni fabricar observaciones en puntos no medidos. La implementacion requiere PyTorch 2.11.0+cu126 y las dependencias exactas de `requirements.txt`.

## Capacidades

- Extraccion de representaciones de 128 dimensiones a partir de ventanas de CGM de 24 horas (288 franjas de cinco minutos).
- Gestion de valores faltantes mediante mascara de observacion (`observed`), preservando la semantica de los huecos.
- Obtencion de caracteristicas congeladas sin gradientes (`model.features`) para evaluacion mediante linear probing.
- Obtencion de representaciones diferenciables (`model.representation`) para ajuste fino o continuacion del preentrenamiento.
- Reanudacion de experimentos con optimizador fresco (`model.optimizer()`) o restauracion del estado AdamW guardado (`restore_optimizer=True`).
- Calculo de la perdida del objetivo original mediante `loss_prepared`, con estadisticas asociadas.
- Integracion de un backbone de series temporales congelado (Chronos-2) como extractor de caracteristicas general.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en representaciones de CGM: usar `model.features` para obtener embeddings de 128D y entrenar un clasificador lineal que replique el protocolo PR-AUC/AUROC/macro-F1 reportado.
- Deteccion de eventos glucémicos: fine-tuning de una cabeza de clasificacion sobre las representaciones para predecir hipoglucemias o hiperglucemias a partir de ventanas de 24 horas.
- Transferencia a nuevos conjuntos CGM: reutilizar el encoder preentrenado sobre 1.094 ventanas publicas como inicializacion para dominios o dispositivos con menos datos etiquetados.
- Comparacion de baselines: emplear este checkpoint como referencia de PR-AUC 0.584241857 al evaluar variantes de enrutamiento, ensembles o distillation downstream, que deben reportarse como condiciones separadas.
- Reproducibilidad experimental: registrar el SHA de commit del Hub y usar `--revision` para fijar una version exacta, comprobando checksums del checkpoint y del backbone Chronos-2.
- Continuacion del preentrenamiento: lanzar un nuevo presupuesto de actualizaciones partiendo del estado guardado, definiendo previamente split de datos, presupuesto de updates y tasas de aprendizaje.
- Investigacion en series temporales generales: aprovechar el backbone Chronos-2 congelado para probar transferencia desde CGM hacia otras senales fisiologicas o industriales.
- Auditoria de metodologia: analizar el efecto del solapamiento entre participantes y sesiones en las metricas reportadas como ejercicio de validacion cruzada.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| PR-AUC | 0.584241857 | Linear probing congelado, semilla 43 |
| AUROC | 0.664719478 | Linear probing congelado, semilla 43 |
| Macro-F1 | 0.599706888 | Linear probing congelado, semilla 43 |

La evaluacion utiliza 2.699 ventanas, 14 celdas de dataset/tarea, cinco folds por sujeto y diez repeticiones, con semilla de fold 42; el promedio de la tabla se calcula sobre celdas de dataset/tarea. No se trata de una media de tres semillas ni de un resultado de ensemble. No se han publicado en la informacion disponible comparaciones directas con otros modelos CGM.

## Requisitos de hardware

- Tamano del repositorio: 0.1 GB; adicionalmente hay que descargar aproximadamente 478 MB de pesos de Chronos-2 (`amazon/chronos-2`) en su revision congelada.
- Entorno verificado: Python aislado con PyTorch 2.11.0+cu126 y `requirements.txt` del repositorio; otras versiones pueden alterar resultados en coma flotante.
- Inferencia en GPU CUDA (`--device cuda`) o CPU; el autor no especifica VRAM minima, por lo que la estimacion exacta de VRAM no esta disponible.
- Por el tamano del bundle (encoder CGM pequeno mas backbone Chronos-2 de ~478 MB), es previsible que quepa en GPU de consumo tipo RTX 3060/4070/4090, aunque no hay cifras oficiales publicadas.
- Despliegue: la carga se realiza con `load_cgm.py` o `snapshot_download`; no es un modelo AutoModel de Transformers, por lo que no se integra de forma nativa en vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yotto3108/cgm-joint-routing-3500 | no disponible | 288 franjas (24 h) | Encoder JEPA + Chronos-2 congelado | no disponible | HuggingFace |
| amazon/chronos-2 | no disponible | no disponible | Modelo de series temporales | terminos upstream | Repositorio upstream de Amazon |
| Otros baselines CGM especificos | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos comparativos con modelos CGM de la misma categoria en la informacion facilitada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de capacidades de texto, codigo, vision o audio.
- Las metricas reportadas son resultados de desarrollo, no validacion clinica; no deben usarse para decisiones medicas.
- El protocolo de origen mantiene solapamiento de participantes entre sesiones; no es una afirmacion de test final universalmente disjunta por participante.
- El checkpoint contiene una unica semilla (43) y no representa una media ni un ensemble.
- No se incluye ningun clasificador downstream; el probe o cabeza debe entrenarse por separado.
- El checkpoint no almacena todas las posiciones de RNG ni del sampler, por lo que no debe considerarse un entrenamiento ininterrumpido identico bit a bit.
- El backbone Chronos-2 esta congelado y sujeto a los terminos upstream de Amazon; dichos pesos no se redistribuyen en este repositorio.
- El modelo se entreno sin datos de WearCGM, lo que puede limitar su transferencia a dispositivos o cohortes con caracteristicas distintas.
- No se distribuyen registros CGM, predicciones a nivel de paciente, etiquetas ni embeddings cacheados.
- La licencia del bundle no esta especificada, por lo que el uso comercial no puede asumirse.
- Riesgos de alucinacion no aplican en el sentido generativo, pero si existe riesgo de sobreajuste o de interpretacion erronea de las representaciones fuera del protocolo previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yotto3108/cgm-joint-routing-3500
- Backbone congelado: https://huggingface.co/amazon/chronos-2
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a sitios de juegos en frances y no guardan relacion con el modelo.
