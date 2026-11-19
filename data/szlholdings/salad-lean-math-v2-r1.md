# SZLHOLDINGS/salad-lean-math-v2-r1

## Resumen

salad-lean-math-v2-r1 es un artefacto de entrenamiento candidato publicado por la organizacion SZLHOLDINGS dentro de su programa de entrenamiento de IA gobernada, bajo lo que el autor denomina "doctrina de recibos medidos fail-closed". No se presenta como un modelo de produccion publicado, sino como un checkpoint intermedio de un pipeline de entrenamiento, acompanado de una escalera de checkpoints (50/100/150/200) y un directorio final, con un total de 51 archivos de artefactos de modelo.

El repositorio tiene un tamano de 0,7 GB y esta etiquetado como text-generation con la libreria transformers, licencia Apache 2.0 y un unico idioma declarado (ingles). La model card no proporciona informacion sobre arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de evaluacion; se limita a describir la procedencia y el estado del artefacto.

Su relevancia es limitada para uso practico inmediato: se trata de un artefacto de investigacion sin benchmarks publicados ni documentacion tecnica sustantiva. Resulta de interes principalmente para quienes sigan el programa de gobernanza y trazabilidad de SZLHOLDINGS o quieran inspeccionar la escalera de checkpoints publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo (transformer, MoE, SSM u otra), el numero de parametros ni la composicion del dataset de entrenamiento. La model card unicamente indica que se trata de un artefacto de entrenamiento candidato generado dentro del programa de IA gobernada de SZL Holdings, con una escalera de checkpoints en los pasos 50, 100, 150 y 200, mas un directorio final.

El aspecto tecnico destacable no es arquitectonico sino de procedencia: el autor enfatiza la doctrina "fail-closed measured-receipts", que segun la model card implica recibos honestos sin conteos ni marcas temporales fabricadas. Los recibos de procedencia se alojan en la organizacion de Hugging Face SZLHOLDINGS (corpus de recibos frontier-54-runs) y la cadena de custodia completa esta en el ledger del estate. No se menciona uso de RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, aunque no se documentan capacidades especificas ni calidad esperada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Al ser un artefacto de entrenamiento candidato, no se garantiza ninguna capacidad de produccion.

## Casos de uso

- Investigacion de trazabilidad y gobernanza: inspeccionar la escalera de checkpoints (50/100/150/200) para estudiar como evoluciona el modelo durante el entrenamiento y como se documenta la procedencia en el ledger del estate.
- Auditoria de pipelines de entrenamiento: usar los recibos de procedencia del corpus frontier-54-runs como referencia para disenar sistemas de registro fail-closed en proyectos propios.
- Reproducibilidad academica: analizar los artefactos publicados (51 archivos, 0,7 GB) para entender la estructura de un checkpoint intermedio con metadatos de custodia.
- Experimentacion controlada en laboratorio: cargar el checkpoint final con transformers para pruebas internas de generacion de texto en ingles, asumiendo ausencia de garantias de calidad.
- Base para fine-tuning exploratorio: partir del checkpoint final como punto de arranque en experimentos de ajuste supervisado, dado que la licencia Apache 2.0 lo permite.
- Docencia sobre ciclo de vida de modelos: emplear el repositorio como ejemplo real de artefacto candidato frente a modelo de produccion, ilustrando la diferencia en documentacion y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repo (0,7 GB) sugiere un modelo pequeno, pero no se confirma el numero de parametros ni la precision de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del repositorio es plausible que quepa en GPUs de consumo, pero no hay dato confirmado.
- Opciones de despliegue: la libreria declarada es transformers; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye arquitectura, parametros ni rendimiento, por lo que no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor declara explicitamente que es un artefacto de entrenamiento candidato, no un modelo de produccion publicado.
- Ausencia total de benchmarks, evaluaciones y documentacion de arquitectura: no hay base para estimar calidad o rendimiento.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente en ingles, cabe esperar sesgos del corpus, pero no se detalla.
- Riesgo de alucinacion: no evaluado ni documentado.
- Limitacion de idioma: solo se declara ingles, sin soporte multilingue documentado.
- Licencia Apache 2.0: permite uso comercial, pero al no haber modelo de produccion ni evaluacion, su uso en produccion carece de garantias tecnicas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La cadena de custodia y los recibos de procedencia dependen de infraestructura externa (ledger del estate, corpus frontier-54-runs) que no se detalla en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-lean-math-v2-r1
- DOI Zenodo (registro de tesis del estate): https://doi.org/10.5281/zenodo.19944926
- Organizacion SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
