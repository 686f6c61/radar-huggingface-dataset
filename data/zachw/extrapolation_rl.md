# ZachW/extrapolation_rl

## Resumen

El repositorio `ZachW/extrapolation_rl` contiene los checkpoints de extrapolación del proyecto Interplay-LM-Reasoning, que investiga cómo los modelos de lenguaje pueden razonar más allá de su distribución de entrenamiento mediante aprendizaje por refuerzo. El proyecto, cuyo código se encuentra en el repositorio GitHub `YichenZW/Interplay-LM-Reasoning`, publica dos lotes de checkpoints (`020305` y `050302`) que incluyen fases de pretrain, post-training con RL, OPD (online policy distillation) y artefactos de evaluación.

El modelo aborda el problema de la extrapolación, es decir, la capacidad de aplicar reglas aprendidas a configuraciones que quedan fuera del rango de entrenamiento. La evaluación se realiza sobre 1.152.000 ejemplos in-distribution (ID), 1.280.000 ejemplos out-of-distribution (OOD) y un total de 2.432.000 ejemplos. Los resultados muestran mejoras sustanciales en precisión OOD tras el post-training con RL, pasando de 0.100438 en el checkpoint de pretrain inicial a 0.369602 en el mejor checkpoint de RL, aunque con una precisión absoluta aún baja en tareas OOD.

La licencia es MIT, el modelo está etiquetado como compatible con endpoints y la región indicada es EE.UU. El repositorio tiene un tamaño de 56.8 GB y usa la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la informacion disponible. El proyecto Interplay-LM-Reasoning entrena modelos de lenguaje con un pipeline que incluye pretrain, post-training con reinforcement learning y un paso adicional de OPD (online-policy distillation) con regularizacion KL hacia un modelo profesor (refkl). Los experimentos se ejecutaron en GPUs H100 x4 y A100 x8, con configuraciones de entrenamiento disponibles en los scripts de lanzamiento del repositorio GitHub.

El dataset de composicion y los splits de benchmark estan publicados en HuggingFace bajo `Interplay-LM-Reasoning/composition`, y los datos de contexto bajo `Interplay-LM-Reasoning/context`. No se proporcionan datos sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset.

## Capacidades

- Razonamiento extrapolativo: el modelo esta disenado para razonar sobre configuraciones que quedan fuera de su distribucion de entrenamiento, manteniendo las mismas reglas subyacentes.
- Generacion de texto: el pipeline es text-generation, por lo que el modelo puede generar secuencias de texto.
- Capacidades multilingues: solo se declara el ingles como idioma soportado.
- No se especifican capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion sobre generalizacion fuera de distribucion: el modelo sirve como referencia para estudiar como el RL post-training mejora la capacidad de extrapolacion de un modelo de lenguaje, especialmente en tareas de puzzle con tamano creciente.
- Evaluacion de estrategias de post-training: los distintos checkpoints (pretrain, RL con diferentes rangos de operadores, OPD con refkl) permiten comparar el impacto de cada etapa de entrenamiento en la precision ID y OOD.
- Validacion de pipelines de RL para razonamiento: los artefactos de evaluacion (summary.csv, summary.json, metricas, generaciones crudas) facilitan la reproduccion de experimentos y la comparacion con otros proyectos de razonamiento.
- Analisis de metodos de distillation online: los checkpoints de OPD con refkl permiten estudiar si la distillation desde un modelo profesor mejora o degrada la precision en comparacion con el RL directo.
- Evaluacion de modelos en benchmarks de extrapolacion: el proyecto proporciona splits de benchmark y datos de composicion para evaluar la capacidad de extrapolacion de otros modelos.
- Reproducibilidad de experimentos: los scripts de lanzamiento y el manifest de ejecucion permiten reproducir los experimentos en infraestructura Arnold (H100/A100).

## Benchmarks y rendimiento

La evaluacion se realizo sobre 1.152.000 ejemplos ID, 1.280.000 ejemplos OOD y 2.432.000 ejemplos totales. Los resultados de precision son:

| Modelo | Precision ID | Precision OOD | Precision total |
|---|---|---|---|
| pretrain_ckpt18809 | 0.362037 | 0.100438 | 0.224353 |
| rl_ckpt18809_op11_14_step200 | 0.800709 | 0.369602 | 0.573810 |
| rl_ckpt18809_op13_20_step200 | 0.683144 | 0.289346 | 0.475882 |
| rl_ckpt18809_op15_20_step200 | 0.388938 | 0.160735 | 0.268831 |
| opd_ckpt18809_refkl_op11_14_s200 | 0.801092 | 0.365645 | 0.571909 |
| pretrain_050302_ckpt18586 | 0.659137 | 0.174320 | 0.403970 |
| rl050302_op11_14_step200 | 0.756464 | 0.348082 | 0.541526 |
| rl050302_op13_20_step200 | 0.709700 | 0.343556 | 0.516993 |
| rl050302_op15_20_step200 | 0.719865 | 0.291799 | 0.494567 |
| opd050302_refkl_s200 | 0.709348 | 0.342995 | 0.516530 |

El mejor resultado OOD es del checkpoint `rl_ckpt18809_op11_14_step200` con un 0.369602 de precision, aunque la precision absoluta en OOD sigue siendo baja. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio es de 56.8 GB, lo que sugiere que los checkpoints completos en safetensors requieren mas de 50 GB de almacenamiento, pero no se indica el numero de parametros.
- GPUs utilizadas en entrenamiento: H100 x4 para el pretrain del lote 020305 y A100 x8 para el resto de fases.
- GPUs recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo es compatible con endpoints (tag `endpoints_compatible`) y se usa con la libreria transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion disponible. El proyecto Interplay-LM-Reasoning esta relacionado con la investigacion sobre extrapolacion en modelos de lenguaje, pero no se incluyen datos de comparacion con modelos comerciales o de la competencia.

## Limitaciones y advertencias

- La precision OOD es baja en todos los checkpoints, incluso tras el RL post-training: el mejor resultado es 0.369602, lo que indica que la extrapolacion sigue siendo un reto abierto.
- El modelo solo soporta ingles como idioma declarado.
- No se dispone de informacion sobre sesgos, alucinaciones o riesgos especificos de uso en produccion.
- La licencia MIT permite uso comercial, pero el modelo es un checkpoint de investigacion y no se ha validado para aplicaciones en produccion.
- El repositorio contiene multiples checkpoints con nombres de experimento que pueden confundir si no se consulta la tabla de indice de ejecucion.
- No se proporciona informacion sobre el numero de parametros, contexto ni arquitectura, lo que dificulta evaluar su aplicabilidad a tareas generales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ZachW/extrapolation_rl
- Repositorio del proyecto (GitHub): https://github.com/YichenZW/Interplay-LM-Reasoning
- Dataset de composicion: https://huggingface.co/datasets/Interplay-LM-Reasoning/composition
- Dataset de contexto: https://huggingface.co/datasets/Interplay-LM-Reasoning/context
- Repositorio alternativo en HuggingFace: https://huggingface.co/Interplay-LM-Reasoning/extrapolation_rl
- Paper relacionado sobre extrapolacion con RL: https://arxiv.org/pdf/2502.04402
