# SZLHOLDINGS/salad-doctrine-dpo-r2

## Resumen

salad-doctrine-dpo-r2 es un artefacto de entrenamiento candidato publicado por SZLHOLDINGS dentro de su programa de entrenamiento de IA gobernada, bajo una doctrina interna que el autor denomina "measured-receipts" (recibos medidos, sin recuentos ni marcas temporales fabricadas). Segun la model card, se trata de la segunda ronda de un proceso de ajuste por preferencias (DPO) sobre un modelo base no especificado, y no de un modelo de produccion publicado.

La informacion disponible es muy limitada: el repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y la model card no documenta arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de evaluacion. El unico dato tecnico verificable es que los pesos se distribuyen en formato safetensors y que la libreria declarada es transformers, con pipeline de text-generation.

Su relevancia actual es, por tanto, acotada: resulta de interes como traza de procedencia (provenance) dentro de una cadena de custodia documentada en un ledger interno y vinculada al DOI de Zenodo 10.5281/zenodo.19944926, pero no como modelo evaluable para uso en produccion. Cualquier cifra sobre capacidad, rendimiento o contexto debe considerarse no disponible.

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

La model card no describe la arquitectura del modelo base ni su configuracion. El nombre del repositorio sugiere una etapa de DPO (Direct Preference Optimization) de segunda ronda sobre un modelo previo de la misma familia ("salad-doctrine"), pero no se especifica que modelo base se utilizo, cuantos tokens de preferencias se emplearon, ni que composicion tuvo el dataset de entrenamiento.

El autor declara explicitamente que se trata de un "candidate training artifact" producido bajo la doctrina "fail-closed measured-receipts", con recibos de procedencia alojados en la organizacion de Hugging Face (linea de recibos "frontier-54-runs") y cadena de custodia completa en el ledger del estate. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto: es la unica capacidad declarada mediante el pipeline tag `text-generation`.
- Idioma: la model card declara unicamente ingles (`en`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Auditoria de procedencia en pipelines de IA gobernada: el artefacto puede usarse como ejemplo de trazabilidad, ya que la model card vincula el repositorio a recibos de procedencia y a un DOI de Zenodo, lo que permite verificar la cadena de custodia en un entorno de cumplimiento interno.
- Reproduccion de experimentos de DPO: para equipos que quieran replicar la segunda ronda de ajuste por preferencias, el repositorio sirve como punto de partida documentado, aunque sin especificacion del modelo base la reproducibilidad es parcial.
- Investigacion sobre doctrinas de "recibos medidos": util como caso de estudio de practicas de documentacion que evitan cifras fabricadas, relevante para equipos que disenan procesos de validacion de artefactos.
- Pruebas de integracion con transformers: al declarar `library_name: transformers` y pesos safetensors, puede cargarse en pipelines estandar para verificar compatibilidad, siempre que se inspeccione primero el `config.json` del repositorio.
- Evaluacion comparativa de artefactos candidatos: sirve como referencia de linea base en un banco de pruebas interno de modelos candidatos antes de promoverlos a produccion.
- Docencia sobre licencias y publicacion de modelos: con licencia apache-2.0 y un caso real de artefacto candidato, es util para explicar diferencias entre artefacto de entrenamiento y modelo publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros.
- GPU recomendadas: no disponible por la misma razon.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo.
- Opciones de despliegue: al declarar `transformers` y safetensors, es desplegable con la pila estandar de Hugging Face (transformers, TGI, vLLM) si el `config.json` del repositorio define una arquitectura soportada; llama.cpp u Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica el modelo base ni modelos de referencia de la misma categoria, y sin datos de parametros, contexto o evaluacion no es posible establecer una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- Artefacto candidato, no modelo de produccion: el propio autor lo etiqueta como "candidate training artifact" y advierte que no es un modelo publicado para produccion.
- Ausencia total de especificaciones: no se documentan parametros, contexto, datos de entrenamiento ni evaluaciones, lo que impide estimar calidad o comportamiento.
- Sesgos conocidos: no documentados; al no conocerse el dataset de preferencias, no puede evaluarse el sesgo introducido por el DPO.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni pruebas de fidelidad no puede acotarse.
- Limitacion idiomatica: solo se declara ingles, por lo que el uso en castellano no esta soportado ni validado.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero el autor no otorga garantias sobre el artefacto; conviene revisar los recibos de procedencia antes de cualquier despliegue.
- Repositorio sin traccion: cero descargas y cero likes en la fecha de consulta, sin senales de validacion por parte de la comunidad.
- Trazabilidad dependiente de infraestructura externa: la cadena de custodia se remite a un ledger del estate y a recibos en la organizacion de Hugging Face, no incluidos en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-doctrine-dpo-r2
- DOI de Zenodo (registro de tesis del estate): https://doi.org/10.5281/zenodo.19944926
- Organizacion SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
