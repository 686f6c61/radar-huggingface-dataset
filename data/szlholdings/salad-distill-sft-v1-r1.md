# SZLHOLDINGS/salad-distill-sft-v1-r1

## Resumen

salad-distill-sft-v1-r1 es un artefacto de entrenamiento candidato publicado por la organizacion SZLHOLDINGS dentro de su programa de IA gobernada, bajo lo que el autor denomina "doctrina de recibos medidos con fallo cerrado" (fail-closed measured-receipts doctrine). No se trata de un modelo de produccion publicado, sino de un checkpoint intermedio resultante de un proceso de destilacion y ajuste supervisado (SFT), tal como sugiere el sufijo del nombre.

La model card es extremadamente escasa: no documenta arquitectura, numero de parametros, longitud de contexto, composicion del dataset de entrenamiento ni resultados de evaluacion. El repositorio contiene un unico archivo de artefacto de modelo y remite la trazabilidad a un corpus de recibos alojado en la organizacion de Hugging Face y a un registro en Zenodo (DOI 10.5281/zenodo.19944926) que actua como tesis del proyecto.

Su relevancia actual es limitada desde el punto de vista tecnico, ya que no hay informacion publica que permita evaluar su calidad o sus capacidades. Su interes es principalmente documental: ilustra un enfoque de publicacion centrado en la procedencia y la trazabilidad (chain of custody) mas que en la divulgacion de especificaciones tecnicas o resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio declara 1 archivo de artefacto de modelo, sin especificar formato) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), el numero de parametros ni la longitud de contexto. El nombre del repositorio sugiere un pipeline de destilacion seguido de ajuste supervisado (distill + SFT), pero la model card no confirma ni detalla esta interpretacion.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La unica informacion de procedencia disponible remite a un corpus de recibos ("frontier-54-runs receipt corpus") en la organizacion SZLHOLDINGS y a un registro en el ledger del proyecto, sin que se expongan los detalles en este repositorio.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, por lo que se asume capacidad de generacion autoregresiva, aunque no hay documentacion que la respalde con ejemplos o evaluaciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos solo declaran ingles (en).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre procedencia de modelos: el repositorio puede servir como ejemplo de publicacion centrada en trazabilidad y recibos medidos, util para equipos que disenan pipelines de auditoria de modelos.
- Reproduccion de pipelines de destilacion y SFT: si se accede al corpus de recibos y al ledger del proyecto, podria emplearse como referencia para reconstruir el proceso de entrenamiento.
- Evaluacion comparativa de artefactos candidatos: util para estudiar como se documentan (o no) checkpoints intermedios en programas de IA gobernada.
- Analisis de licencias y gobernanza: al estar bajo Apache 2.0, puede estudiarse como caso de publicacion abierta de artefactos intermedios.
- Docencia sobre buenas practicas de model cards: sirve como ejemplo de model card minimalista y de las carencias que ello implica.
- Integracion experimental en pipelines de transformers: al declarar library_name transformers, podria cargarse tecnicamente, aunque sin garantias de calidad al no haber evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio declara compatibilidad con transformers y endpoints_compatible; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre parametros, contexto ni rendimiento que permita establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor declara explicitamente que es un artefacto de entrenamiento candidato y no un modelo de produccion publicado.
- Ausencia total de especificaciones tecnicas: arquitectura, parametros y contexto no documentados.
- Ausencia de evaluaciones o benchmarks que permitan estimar calidad o riesgo de alucinacion.
- Idiomas soportados limitados al ingles segun los metadatos.
- Sesgos conocidos: no documentados; al no conocerse el dataset, no puede evaluarse el riesgo de sesgo.
- Riesgo de alucinacion: no evaluado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el estado de artefacto candidato desaconseja su uso en produccion sin validacion adicional.
- La trazabilidad depende de recursos externos (corpus de recibos y ledger del proyecto) no incluidos en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-distill-sft-v1-r1
- Registro Zenodo (DOI): https://doi.org/10.5281/zenodo.19944926
- Organizacion SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
