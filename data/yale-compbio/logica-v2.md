# Yale-CompBio/logica-v2

## Resumen

LogiCA v2 es un modelo de aprendizaje profundo orientado a la prediccion de afinidad proteina-ligando, desarrollado por el grupo Yale-CompBio. Se trata de una version revisada de los pesos originales de LogiCA (v1), reconstruida sobre la arquitectura de adaptadores que combina el backbone proteico ESM-2 con el backbone quimico SELFormer. El modelo no es un LLM generativo, sino un modelo especializado de regresion/clasificacion en el dominio de la bioinformatica estructural y el diseno de farmacos.

La relevancia de esta version radica en el uso de un conjunto de datos curado y decontaminado (BindingDB v2) y en un protocolo de entrenamiento estandarizado para todas las tallas. El repositorio publica cuatro variantes segun el tamano del backbone ESM-2 (8M, 35M, 150M y 650M parametros), lo que permite elegir el equilibrio entre coste computacional y capacidad de representacion. En el momento de la consulta, el repositorio tiene 0 descargas y 0 likes, y la model card indica que las rutas de checkpoints son destinos planificados, no resultados completos.

El modelo se distribuye como un adaptador v2 que debe instanciarse junto con los backbones ESM-2 y SELFormer fijados (pinned) mediante el codigo de arquitectura proporcionado. No se trata de un modelo de proposito general ni de un chatbot: su uso esta acotado a tareas de prediccion de interacciones proteina-ligando en pipelines de descubrimiento de farmacos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador v2 sobre backbones ESM-2 (proteina) y SELFormer (ligando) |
| Parametros totales | No disponible (depende del backbone: variantes con ESM-2 8M, 35M, 150M y 650M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | No disponible |
| Formato de pesos | `best.pt` (PyTorch) |

## Arquitectura y entrenamiento

LogiCA v2 emplea una arquitectura de adaptadores que superpone un modulo v2 sobre dos backbones preentrenados: ESM-2 para la representacion de secuencias proteicas y SELFormer para la representacion de moleculas pequenas (ligandos). El checkpoint publicado es un adaptador que debe cargarse instanciando primero la arquitectura v2 proporcionada con los backbones fijados en la version exacta indicada en la release; no es un modelo autonomo que pueda cargarse con `from_pretrained` de forma generica. Cada release incluye `best.pt`, la configuracion exacta de backbone, el codigo del modelo, un registro de finalizacion del entrenamiento, metadatos de preparacion de datos y hashes SHA-256.

El entrenamiento se realizo sobre un unico conjunto de datos BindingDB v2 curado y decontaminado, con 40 epocas y 100.000 anclas (anchors) muestreadas por epoca, tamano de lote efectivo de 64 y 15 negativos in-batch. Las tres variantes pequenas (8M, 35M y 150M) se entrenaron en una sola GPU con cuatro pasos de acumulacion de gradiente de B=16; la variante de 650M uso cuatro GPU con B=16 por GPU. Los entrenamientos guardan y reanudan a traves de limites de tiempo de ejecucion (wall-time), lo que sugiere un pipeline de entrenamiento de larga duracion tolerante a interrupciones. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion, algo por otra parte poco habitual en modelos de regresion cientifica.

## Capacidades

- Prediccion de afinidad proteina-ligando: el modelo estima la interaccion entre una secuencia proteica y una molecula pequena, tarea central en el cribado virtual y el diseno de farmacos.
- Representacion conjunta proteina-ligando: combina embeddings de ESM-2 (proteina) y SELFormer (ligando) mediante el adaptador v2.
- Escalabilidad por tamano: cuatro variantes (8M, 35M, 150M, 650M) permiten ajustar el coste computacional al presupuesto disponible.
- Reproducibilidad: cada release incluye hashes SHA-256, metadatos de preparacion de datos y registro de finalizacion del entrenamiento.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling, agentes ni multilingues; el modelo es de dominio cientifico especifico.

## Casos de uso

- Cribado virtual de compuestos: dado un target proteico y una biblioteca de ligandos, el modelo puntua la afinidad de cada par para priorizar candidatos antes de la validacion experimental, reduciendo el coste de ensayos in vitro.
- Priorizacion en descubrimiento de farmacos: en las fases tempranas de un pipeline, la variante 650M puede emplearse para rankear compuestos candidatos frente a una proteina diana concreta, mientras que las variantes 8M/35M sirven para precribados masivos de bajo coste.
- Filtrado de falsos positivos: tras un cribado de alto rendimiento (HTS), el modelo puede re-puntuar los aciertos y descartar interacciones poco probables antes de pasar a validacion.
- Analisis de relaciones estructura-actividad: comparando predicciones sobre variantes de un mismo ligando, el equipo puede identificar fragmentos quimicos asociados a mayor afinidad.
- Reposicionamiento de farmacos: evaluar si compuestos ya aprobados interactuan con nuevos targets proteicos, aprovechando el conocimiento de seguridad existente de esos compuestos.
- Investigacion academica en bioinformatica: el modelo sirve como linea base reproducible (datos decontaminados, hashes, configuracion fijada) para comparar nuevas arquitecturas de prediccion proteina-ligando.
- Integracion en pipelines de laboratorio seco: al ser un adaptador PyTorch, puede integrarse en flujos de ML existentes para generar puntuaciones de afinidad de forma automatizada sobre lotes de pares proteina-ligando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (AUC, RMSE, Pearson, etc.) ni comparaciones con otros modelos, y advierte que `release_plan.json` describe el plan de entrenamiento enviado, no resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del backbone ESM-2 seleccionado; las variantes 8M y 35M son ligeras y previsiblemente caben en GPU de consumo, mientras que la variante 650M requiere mas memoria.
- GPU recomendadas: no especificadas en la informacion disponible. El entrenamiento de la variante 650M uso cuatro GPU, lo que sugiere que la inferencia con esa variante se beneficia de GPU de datacenter (A100/H100) o de una GPU de consumo de gama alta con suficiente VRAM.
- Cabe en GPU de consumo: probablemente las variantes 8M y 35M; no confirmado para 150M y 650M.
- Opciones de despliegue: PyTorch nativo (formato `best.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de regresion cientifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de prediccion proteina-ligando.

## Limitaciones y advertencias

- Disponibilidad de checkpoints: la model card indica que las rutas de `checkpoints/v2_20261110/` son destinos planificados; un directorio solo esta disponible cuando el entrenamiento completo y la validacion de release han finalizado. En el momento de la consulta el repositorio tiene 0 descargas.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere consulta con los autores.
- Dependencia de backbones externos: el adaptador requiere los backbones ESM-2 y SELFormer en versiones fijadas; no es un modelo autonomo y su reproduccion depende de disponer de esos pesos.
- Dominio acotado: el modelo predice interacciones proteina-ligando sobre el espacio quimico cubierto por BindingDB v2; su fiabilidad fuera de esa distribucion (nuevas clases quimicas, targets atipicos) no esta documentada.
- Riesgo de sesgo de datos: al entrenarse unicamente con BindingDB v2, puede heredar los sesgos de cobertura de esa base de datos (sobrerrepresentacion de ciertas familias proteicas y quimiotipos).
- Sin metricas publicadas: no hay benchmarks que permitan estimar la precision real ni el riesgo de predicciones erroneas en produccion.
- No apto para decision clinica directa: como cualquier modelo predictivo in silico, sus salidas requieren validacion experimental.
- Sin soporte documentado de cuantizacion ni de formatos de despliegue estandar, lo que limita su integracion en infraestructuras de serving convencionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Yale-CompBio/logica-v2
- Pesos originales v1: https://huggingface.co/Yale-CompBio/logica
