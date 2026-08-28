# vatsdev/tds-carbon-card

## Resumen

El repositorio `vatsdev/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a una ejecución de entrenamiento de un modelo dentro de la asignación académica TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo energético y las especificaciones de hardware de un proceso de fine-tuning realizado sobre dos GPU NVIDIA A100 en la región europe-north1 de Google Cloud.

Este tipo de repositorios responde a la creciente demanda de transparencia ambiental en el entrenamiento de modelos de IA, un área conocida como Green AI. Su relevancia radica en que permite auditar el coste energético real de un entrenamiento concreto, un dato que rara vez se publica en las model cards convencionales. No obstante, al no incluir pesos, arquitectura ni código, no es utilizable como modelo de inferencia.

La información disponible se limita a la model card del autor, que reporta 12,003 kg de CO₂eq emitidos durante 90,6 horas de GPU con un factor de eficiencia energética (PUE) de 1,38. No se especifica qué modelo se entrenó, ni con qué dataset, ni qué tarea se abordó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo subyacente. La model card indica que el proceso fue un fine-tuning, pero no especifica el modelo base, el numero de parametros, el dataset utilizado ni el tipo de tarea. El unico dato tecnico disponible es el hardware empleado: dos GPU NVIDIA A100, con un total de 90,6 horas de computo y un consumo energetico de 100,0224 kWh. La region de computo fue europe-north1, lo que sugiere un despliegue en Google Cloud.

No hay informacion sobre el proceso de entrenamiento en si (numero de tokens, tecnicas de alineacion como RLHF o DPO, ni innovaciones tecnicas). El repositorio se centra exclusivamente en la contabilidad de emisiones, no en el desarrollo del modelo.

## Capacidades

- No aplica: el repositorio no contiene un modelo ejecutable ni pesos entrenados.
- No ofrece generacion de texto, razonamiento, codigo, vision ni ninguna capacidad de inferencia.
- No hay soporte de tool calling, agentes ni funciones especiales.
- No se puede evaluar capacidad multilingue ni de razonamiento.

## Casos de uso

- Auditoria de emisiones de entrenamiento: el repositorio sirve como referencia para cuantificar el coste ambiental de un fine-tuning concreto en hardware A100, util para equipos que necesitan reportar metricas de sostenibilidad.
- Educacion en Green AI: puede usarse como ejemplo en cursos o talleres sobre computacion responsable, mostrando como documentar emisiones con herramientas como CodeCarbon.
- Comparativa de eficiencia energetica: permite contrastar el coste de entrenamiento en diferentes regiones o configuraciones de hardware, aunque en este caso solo se cubre una configuracion.
- Trazabilidad en publicaciones academicas: los autores pueden citar este registro para cumplir requisitos de transparencia ambiental en articulos cientificos.
- Planificacion de presupuestos de carbono: organizaciones que necesiten estimar el impacto de futuros entrenamientos pueden usar estos datos como punto de partida.
- Desarrollo de herramientas de medicion: sirve como caso de estudio para mejorar pipelines de monitorizacion de consumo energetico en entornos cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen metricas de calidad como MMLU, HumanEval o GSM8K. El unico dato cuantitativo es el consumo energetico y las emisiones reportadas.

## Requisitos de hardware

- No aplica para inferencia, ya que no se distribuyen pesos ni hay un modelo ejecutable.
- El entrenamiento documentado utilizo 2 GPU NVIDIA A100 durante 90,6 horas.
- El consumo total fue de 100,0224 kWh, con un PUE de 1,38.
- Las emisiones asociadas fueron de 12,003 kg de CO₂eq, calculadas con CodeCarbon.
- No hay informacion sobre requisitos de VRAM, latencia o throughput de inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con alternativas como Llama, Mistral o Qwen. Existen otros repositorios con el mismo nombre (`dev-1234/tds-carbon-card`, `Vahsir/tds-carbon-card`, `jayiitm/tds-carbon-card`, `shivainlabs/tds-carbon-card`, `vendhan29/tds-carbon-card`) que documentan ejecuciones similares de la misma asignacion, pero no se dispone de sus datos para una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede descargar, ejecutar ni integrar en ningun sistema.
- La informacion sobre el modelo entrenado es inexistente: se desconoce la arquitectura, el tamano y la tarea.
- Los datos de emisiones dependen de la region de computo y del hardware; extrapolarlos a otros entornos puede llevar a errores.
- No hay licencia especificada, por lo que el uso del repositorio como referencia queda en un limbo legal.
- El repositorio parece ser parte de una tarea academica (TDS GA8), por lo que su contenido puede no ser representativo de un proyecto de produccion real.
- No se indica la metodologia completa de medicion de emisiones (factores de carbono de la red electrica, etc.), lo que limita la reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vatsdev/tds-carbon-card
- Repositorios similares de la misma asignacion: https://huggingface.co/dev-1234/tds-carbon-card, https://huggingface.co/Vahsir/tds-carbon-card, https://huggingface.co/jayiitm/tds-carbon-card, https://huggingface.co/shivainlabs/tds-carbon-card, https://huggingface.co/vendhan29/tds-carbon-card
