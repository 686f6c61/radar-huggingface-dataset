# ssyhw7/qwen36-35b-merged-ta_l0.7

## Resumen

qwen36-35b-merged-ta_l0.7 es un adaptador LoRA fusionado publicado por el usuario ssyhw7 sobre el modelo base Qwen/Qwen3.6-35B-A3B. La fusion se ha realizado con la tecnica task arithmetic y un rango de salida (out_rank) de 96, combinando tres "expertos" distintos en un unico conjunto de pesos. El repositorio se distribuye con la libreria peft y contiene pesos en formato safetensors con un tamano total de 6,7 GB, lo que corresponde al adaptador fusionado y no a los pesos completos del modelo base.

El modelo se presenta como un artefacto de experimentacion en el ambito del merging de adaptadores: la model card es un esqueleto sin resultados, sin datos de entrenamiento detallados y sin evaluaciones publicadas. La receta completa de la fusion se remite a un fichero merge_recipe.json incluido en el repositorio, y el codigo, los datos y la evaluacion a un repositorio de GitHub externo del mismo autor.

Su relevancia actual es limitada y de caracter metodologico: sirve como ejemplo reproducible de fusion de adaptadores sobre una familia MoE reciente de Qwen, pero carece de validacion independiente (0 descargas y 0 likes en el momento de la consulta) y no deberia considerarse listo para produccion sin una evaluacion previa. Nota: las fechas de creacion y actualizacion del repositorio (16 de octubre de 2026) son posteriores a la fecha de esta ficha y no se han podido contrastar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un adaptador LoRA fusionado sobre Qwen/Qwen3.6-35B-A3B, no un modelo completo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador peft/LoRA fusionado; 6,7 GB de repositorio) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Relacion con el modelo base | merge |
| Tecnica de fusion | task arithmetic |
| Rango del adaptador (out_rank) | 96 |
| Numero de expertos fusionados | 3 |
| Libreria | peft |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.6-35B-A3B ni del resultado de la fusion. El identificador del modelo base sigue la convencion de nomenclatura de Qwen, en la que el primer numero indica parametros totales y el sufijo "A3B" indica parametros activos, lo que sugeriria una arquitectura de mezcla de expertos (MoE) con 35.000 millones de parametros totales y 3.000 millones activos; sin embargo, este dato no se confirma en la informacion proporcionada y debe verificarse en la model card del modelo base.

Lo unico documentado es el procedimiento de fusion: se combinan tres adaptadores (descritos como "expertos") sobre el modelo base mediante task arithmetic con un rango de salida de 96, dando lugar a un unico adaptador fusionado. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otras tecnicas de alineamiento en los adaptadores de origen. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia tecnica de merging.

## Capacidades

- No se documentan capacidades especificas en la model card; el autor indica explicitamente que la ficha "se completara con resultados".
- Al derivar del modelo base Qwen/Qwen3.6-35B-A3B, es previsible que herede generacion de texto y razonamiento, pero no hay ninguna evaluacion aportada que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponible.
- Comportamiento tras la fusion task arithmetic: no verificado; la propia naturaleza del merging con tres expertos puede alterar el comportamiento del modelo base tanto de forma positiva como negativa segun la tarea.

## Casos de uso

- Investigacion en fusion de modelos: reproduccion del experimento de task arithmetic con out_rank 96 sobre tres adaptadores, usando merge_recipe.json como referencia para comparar variantes con otros coeficientes de fusion.
- Estudio de degradacion por merging: analisis comparativo de las capacidades del modelo fusionado frente al modelo base Qwen/Qwen3.6-35B-A3B para cuantificar que tareas mejoran y cuales se degradan al combinar tres expertos.
- Punto de partida para nuevos fine-tunings: el adaptador fusionado puede servir como inicializacion para un ajuste posterior especifico de dominio, siempre que se valide antes su calidad base.
- Evaluacion academica de recipes de merging: uso del repositorio de GitHub asociado como caso de estudio en trabajos sobre aritmetica de tareas y seleccion de coeficientes.
- Analisis de artefactos de la comunidad: inspeccion de los tensores safetensors (6,7 GB) para verificar rangos, escalados y estructura del adaptador antes de reutilizarlo.
- Experimentacion local en tareas genericas de texto o codigo: viable unicamente como prueba controlada tras fusionar el adaptador con el modelo base y ejecutar una bateria propia de evaluaciones, ya que no existe ninguna referencia publica de rendimiento.
- Despliegue en produccion: no recomendado con la informacion actual, dado que no hay benchmarks, ni evaluacion de sesgos, ni validacion de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 6,7 GB en disco para el repositorio safetensors; este espacio no incluye los pesos del modelo base, necesarios para poder ejecutar inferencia.
- VRAM para inferencia completa: no disponible en la informacion proporcionada. Si el modelo base tiene 35.000 millones de parametros totales, como sugiere su identificador, las estimaciones genericas de orden de magnitud serian del entorno de 70 GB en precision de 16 bits, 35 GB en 8 bits y 18-22 GB en cuantizacion de 4 bits; se trata de calculos orientativos no confirmados y que deben verificarse con la model card del modelo base.
- GPU recomendadas: no disponible. Como referencia general para un modelo de ese orden de magnitud, se necesitarian GPUs de centro de datos (A100 80 GB, H100 80 GB) o configuraciones multi-GPU para precision completa; en consumer, solo seria planteable con cuantizacion agresiva y en GPUs de 24 GB o mas (RTX 3090, RTX 4090) si el modelo base encaja.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no documentadas. Al ser un adaptador peft, el flujo natural seria cargar el modelo base y aplicar el adaptador con la libreria peft sobre transformers; el uso con vLLM, llama.cpp, Ollama o TGI requeriria fusionar previamente el adaptador en un checkpoint completo y convertir el formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen36-35b-merged-ta_l0.7 | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace (referenciado como base) |
| Otros adaptadores fusionados de la misma familia | no disponible | no disponible | no disponible | no disponible | no se han identificado alternativas comparables en la informacion disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo ni con la familia Qwen3.6; los unicos resultados obtenidos fueron paginas de contenido para adultos sin relacion alguna con el modelo, por lo que se han descartado como fuente.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni resultados cualitativos, ni comparaciones con el modelo base; la model card indica que se completara mas adelante.
- Riesgo de degradacion por merging: la aritmetica de tareas con tres expertos sobre una base MoE puede degradar capacidades que no estaban representadas en los adaptadores de origen; este riesgo no esta cuantificado.
- Riesgo de alucinacion: no evaluado y, por tanto, desconocido.
- Sesgos: no documentados; no se ha realizado ninguna evaluacion de sesgo o seguridad.
- Idiomas: no se declara ninguna lista de idiomas soportados ni la cobertura multilingue real tras la fusion.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas.
- Licencia: el repositorio declara apache-2.0, licencia permisiva que en principio permite uso comercial. No obstante, no se confirma en la informacion disponible la licencia efectiva del modelo base Qwen/Qwen3.6-35B-A3B, que condiciona la distribucion y el uso comercial del resultado fusionado.
- Reproducibilidad: la receta depende de merge_recipe.json y del repositorio de GitHub del autor; sin esos ficheros no se puede reproducir la fusion exacta ni verificar los coeficientes aplicados.
- Coherencia de metadatos: la fecha declarada de creacion (16 de octubre de 2026) es posterior a la fecha de esta ficha, lo que genera dudas sobre el sellado temporal del artefacto. Ademas, el tamano del repositorio (6,7 GB) es coherente con un adaptador, no con un modelo de 35.000 millones de parametros, por lo que no debe confundirse con un checkpoint completo listo para servir.
- Uso en produccion: no recomendado sin una bateria propia de evaluaciones de calidad, seguridad, sesgo y coste de inferencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ssyhw7/qwen36-35b-merged-ta_l0.7
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de codigo, datos y evaluacion del autor: https://github.com/HanyangWang0418-oss/qwen36-merge-takehome
- Fichero de receta de fusion: merge_recipe.json (incluido en el repositorio de HuggingFace, sin URL directa confirmada)
- Paper, blog o demo oficial: no disponible
- Busqueda web: no se encontro ningun resultado relevante sobre este modelo ni sobre la familia Qwen3.6; los resultados devueltos eran paginas de contenido para adultos sin relacion con el modelo y se han descartado.
