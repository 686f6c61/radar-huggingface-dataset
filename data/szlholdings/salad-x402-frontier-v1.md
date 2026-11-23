# SZLHOLDINGS/salad-x402-frontier-v1

## Resumen

`salad-x402-frontier-v1` es un artefacto de entrenamiento publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados "receipted" (con recibos de auditoria verificables). El repositorio no es, a efectos practicos, un modelo listo para inferencia: la model card no declara arquitectura, tipo de modelo, idiomas, licencia ni pipeline, y el propio autor etiqueta explicitamente como UNKNOWN cualquier dato no medido. El unico contenido sustantivo verificable son los ficheros de pesos y los recibos de auditoria generados por su herramienta interna.

El repositorio ocupa 0,6 GB y contiene 57 ficheros, entre ellos checkpoints con `optimizer.pt` y un `adapter_model.safetensors` en `checkpoint-100`, lo que sugiere un proceso de ajuste fino (probablemente LoRA o similar) sobre una base no declarada. El `config.json` devuelve 404 en la revision auditada, por lo que no hay forma de determinar la arquitectura subyacente, el numero de parametros ni la longitud de contexto a partir de los datos publicados.

La relevancia de esta ficha es fundamentalmente metodologica: documenta un caso de publicacion de artefactos con trazabilidad criptografica (hashes SHA-256 de cada fichero de pesos) pero sin especificaciones tecnicas utilizables. Para un desarrollador o investigador que evalue modelos, la conclusion operativa es que este repositorio no es desplegable ni evaluable sin informacion adicional del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model_type NOT-DECLARED, architectures NOT-DECLARED) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors en checkpoint-100) y optimizer.pt (checkpoints 50, 100, 150, 200) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base. El `config.json` no existe en la revision auditada (fetch 404), y la model card declara `model_type NOT-DECLARED`, `architectures NOT-DECLARED` y `dtype NOT-DECLARED`. Los artefactos presentes en el repositorio (un `adapter_model.safetensors` y cuatro ficheros `optimizer.pt` de aproximadamente 103 MB cada uno, correspondientes a los checkpoints 50, 100, 150 y 200) son consistentes con un proceso de ajuste fino por adaptadores sobre un modelo base no identificado, pero esta inferencia no esta confirmada por el autor.

El autor no publica numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineamiento. La seccion de "Honesty" de la model card indica que cualquier afirmacion de entrenamiento o evaluacion reside en ficheros de recibo del "estate mesh" y que lo no receiptado se considera UNKNOWN. El escaneo estricto de recibos (tranche 6, chunk 10, 2026-11-22) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`.

## Capacidades

- No se ha declarado ninguna capacidad funcional en la informacion disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- No se han declarado capacidades multilingues ni idiomas cubiertos.
- No se ha declarado modo thinking, vision, audio ni ninguna modalidad adicional.
- El unico dato operativo verificado es que la pagina del modelo, el arbol de ficheros y el README responden con HTTP 200; el `config.json` responde 404.

## Casos de uso

- Auditoria de cadena de custodia de artefactos: el repositorio publica hashes SHA-256 (LFS oids) de cada fichero de pesos, lo que permite verificar la integridad de los artefactos descargados en un pipeline de compliance. Es el unico uso directamente soportado por la informacion disponible.
- Estudio de practicas de publicacion de modelos: util como caso de referencia sobre publicacion de artefactos con trazabilidad criptografica pero sin especificaciones tecnicas, para analisis de reproducibilidad en IA abierta.
- Evaluacion de adaptadores LoRA sin base declarada: el `adapter_model.safetensors` de `checkpoint-100` podria inspeccionarse para inferir la dimension del modelo base (rango del adaptador, shapes de las matrices), aunque no hay garantia de que sea cargable sin conocer la base.
- Verificacion de integridad en espejos internos: los hashes publicados permiten comprobar que una copia interna coincide con la revision `0aa15eec5e10`.
- No es adecuado para inferencia en produccion, generacion de texto, codigo, atencion al cliente ni ninguna tarea funcional, al no existir especificacion ni pesos de modelo completos verificables.
- No es adecuado para benchmarking comparativo, al no existir resultados medidos ni configuracion de evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos marca la evidencia de evaluacion como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin `config.json` ni especificacion de parametros no es posible estimar requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con la informacion publicada.
- Opciones de despliegue: no disponible. No hay `config.json`, no hay tokenizer declarado y no hay pesos de modelo completo, solo un adaptador y ficheros de optimizador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la arquitectura, el tamano ni la tarea del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones: sin `config.json`, sin `model_type`, sin `architectures` y sin `dtype` declarados, el artefacto no es cargable de forma estandar con librerias como transformers.
- Licencia no declarada: no hay autorizacion explicita de uso comercial ni de redistribucion; en ausencia de licencia debe asumirse reserva de derechos por defecto.
- Evidencia de evaluacion ausente: el escaneo estricto clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no un recibo de evaluacion valido al estandar declarado por el propio autor.
- Riesgo de alucinacion y sesgos: no evaluables, al no existir modelo desplegable ni evaluacion publicada.
- Contenido mayoritario de pesos: los ficheros de mayor tamano son `optimizer.pt` (estado del optimizador), no pesos de inferencia; descargar el repositorio no proporciona un modelo utilizable.
- Fechas del repositorio: la creacion (2026-11-16) y la actualizacion (2026-11-23) figuran en el futuro respecto a la fecha habitual de consulta; conviene verificar la metadata en el origen antes de citarla.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que limita la validacion por parte de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-x402-frontier-v1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica declarada: https://github.com/szl-holdings/szl-frontier
- Herramienta de generacion de fichas: https://github.com/szl-holdings/estate-cards
