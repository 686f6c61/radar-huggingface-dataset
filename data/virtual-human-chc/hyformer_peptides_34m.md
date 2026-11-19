# virtual-human-chc/hyformer_peptides_34M

## Resumen

Hyformer es un modelo basado en transformer que unifica una tarea de generacion de moleculas con una de prediccion de propiedades en una sola arquitectura. Lo desarrolla el grupo de Ewa Szczurek (Szczurek Lab), con Adam Izdebski como primer autor, y se publico junto al articulo "Synergistic Benefits of Joint Molecule Generation and Property Prediction" (arXiv:2504.16559). El modelo usa una mascara causal o bidireccional segun la tarea: con mascara causal actua como decoder generativo que emite probabilidades sobre tokens, y con mascara bidireccional actua como encoder predictivo que devuelve valores de propiedades moleculares.

El checkpoint concreto de esta ficha, `hyformer_peptides_34M`, es la variante especializada en peptidos. Se entreno sobre 3,5 millones de peptidos de proposito general y peptidos antimicrobianos, y cuenta con 34 millones de parametros. Forma parte de una familia de checkpoints que incluye variantes para moleculas pequenas (8M y 50M) y una version afinada conjuntamente sobre valores de concentracion inhibitoria minima (MIC) frente a *E. coli*.

Su relevancia actual radica en la premisa del articulo: entrenar conjuntamente generacion y prediccion produce beneficios mutuos, de modo que el mismo modelo sirve para disenar peptidos nuevos y para estimar sus propiedades. El acceso esta restringido mediante formulario (gated) y la licencia es BSD 3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder-decoder unificado con mascara causal o bidireccional segun tarea) |
| Parametros totales | 34M (segun el nombre del checkpoint; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio cientifico; opera sobre secuencias de peptidos, no sobre lenguaje natural) |
| Licencia | BSD 3-Clause |
| Formato de pesos | no disponible (repo de 0,4 GB en Hugging Face; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

Hyformer es un transformer unico que se reutiliza para dos cabezas de tarea mediante el enmascaramiento de la atencion. En modo generativo aplica mascara causal y produce probabilidades sobre el siguiente token de la secuencia molecular; en modo predictivo aplica mascara bidireccional y agrega la representacion para predecir propiedades. La model card no detalla el numero de capas, dimensiones ocultas ni el mecanismo de agregacion para la cabeza predictiva.

El checkpoint `hyformer_peptides_34M` se entreno sobre 3,5 millones de peptidos de proposito general y peptidos antimicrobianos. La model card no especifica el numero total de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en este dominio). El articulo asociado describe el entrenamiento conjunto de generacion y prediccion; los detalles de la funcion de perdida combinada y del balance entre ambas tareas deben consultarse en el paper.

## Capacidades

- Generacion de secuencias de peptidos: muestreo de nuevas secuencias mediante decodificacion autorregresiva con mascara causal.
- Prediccion de propiedades moleculares: estimacion de valores de propiedades a partir de la representacion bidireccional de la secuencia.
- Modelado conjunto: la misma arquitectura sirve para ambas tareas, lo que permite usarla como generador y como predictor sin cambiar de modelo.
- Especializacion en peptidos antimicrobianos: el entrenamiento incluye peptidos antimicrobianos, lo que orienta la generacion hacia ese espacio quimico.
- Version derivada con prediccion de MIC: existe el checkpoint `Hyformer_peptides_34M_MIC`, afinado conjuntamente sobre valores de concentracion inhibitoria minima frente a *E. coli*.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingues: no aplicables.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Descubrimiento de peptidos antimicrobianos: generar candidatos con el decoder y filtrarlos con el encoder predictivo del mismo modelo, reduciendo el coste de sintesis y ensayo experimental.
- Priorizacion de bibliotecas de peptidos: puntuar propiedades de secuencias candidatas con la cabeza predictiva antes de pasar a validacion in vitro.
- Optimizacion dirigida por propiedades: usar el modo generativo condicionado por la senal predictiva para explorar variantes de peptidos con caracteristicas deseadas.
- Prediccion de actividad antimicrobiana: emplear el checkpoint `hyformer_peptides_34M_MIC` para estimar MIC frente a *E. coli* en cribados tempranos.
- Generacion de datos sinteticos para modelos downstream: producir secuencias de peptidos plausibles para aumentar conjuntos de entrenamiento de clasificadores de actividad.
- Investigacion en diseno molecular conjunto: usar el modelo como linea base reproducible para comparar estrategias de entrenamiento multi-tarea en generacion y prediccion.
- Exploracion del espacio quimico de peptidos: analizar la distribucion generada para identificar motivos estructurales recurrentes asociados a propiedades de interes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (ni GuacaMol, ni MoleculeNet, ni valores de AUC o RMSE) para este checkpoint concreto; los resultados del articulo deben consultarse en arXiv:2504.16559.

## Requisitos de hardware

- VRAM estimada para inferencia: con 34M parametros, el modelo en precision completa ocupa aproximadamente 0,14 GB en pesos; en fp16 unos 0,07 GB. El consumo real dependera del tamano de lote y de la longitud de secuencia, no especificados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por capacidad de memoria; para lotes grandes o entrenamiento se recomienda A100 o H100.
- Cabe en GPU consumer: si, con amplio margen, en practicamente cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: no se especifican en la model card; al ser un transformer estandar es compatible con frameworks de PyTorch/Hugging Face, pero no hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hyformer peptides 34M | 34M | no disponible | Generacion y prediccion de peptidos | BSD 3-Clause | Gated en Hugging Face |
| Hyformer molecules 50M | 50M | no disponible | Generacion y prediccion de moleculas pequenas | BSD 3-Clause | Gated en Hugging Face |
| Hyformer molecules 8M | 8M | no disponible | Generacion y prediccion de moleculas pequenas | BSD 3-Clause | Gated en Hugging Face |
| Hyformer peptides 34M MIC | 34M | no disponible | Prediccion de MIC frente a *E. coli* | BSD 3-Clause | Gated en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aprobacion mediante formulario con datos de organizacion, uso previsto, persona de contacto y pais.
- Dominio limitado: entrenado exclusivamente sobre peptidos; no es un modelo de lenguaje general ni debe usarse fuera de ese espacio quimico.
- Sesgo de datos: la composicion del corpus de 3,5 millones de peptidos no se detalla, por lo que puede haber sesgos hacia familias de peptidos sobrerrepresentadas.
- Riesgo de secuencias no sintetizables o no bioactivas: la generacion no garantiza viabilidad quimica ni actividad biologica; requiere validacion experimental.
- Alucinacion en predicciones: la cabeza predictiva puede producir valores poco fiables fuera de la distribucion de entrenamiento.
- Restricciones de licencia: BSD 3-Clause permite uso comercial con atribucion, pero el acceso gated anade condiciones adicionales aceptadas en el formulario.
- Ausencia de datos tecnicos: no se publican contexto, cuantizaciones ni formato de pesos, lo que complica la planificacion de despliegue en produccion.
- Uso etico: el formulario exige compromiso de uso no malicioso y eticamente responsable, relevante en el contexto de peptidos antimicrobianos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/virtual-human-chc/hyformer_peptides_34M
- Checkpoint de referencia en Hugging Face: https://huggingface.co/SzczurekLab/hyformer_peptides_34M
- Checkpoint con MIC: https://huggingface.co/SzczurekLab/hyformer_peptides_34M_MIC
- Checkpoint de moleculas 8M: https://huggingface.co/SzczurekLab/hyformer_molecules_8M
- Checkpoint de moleculas 50M: https://huggingface.co/SzczurekLab/hyformer_molecules_50M
- Repositorio GitHub: https://github.com/szczurek-lab/hyformer
- Paper: https://arxiv.org/abs/2504.16559
- GuacaMol (Brown et al., 2019): https://jcheminf.biomedcentral.com/articles/10.1186/s13321-019-0351-9
- Uni-Mol (Zhou et al., 2023): https://openreview.net/forum?id=1pPpKc9wR0Y
