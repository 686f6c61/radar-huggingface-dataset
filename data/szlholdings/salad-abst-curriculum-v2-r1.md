# SZLHOLDINGS/salad-abst-curriculum-v2-r1

## Resumen

`salad-abst-curriculum-v2-r1` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": una familia de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de "recibos" (receipts) y auditorias fechadas. El repositorio de Hugging Face ocupa 0,7 GB y contiene pesos en formato safetensors, lo que sugiere un modelo de pequeno o medio tamano, aunque la model card no declara parametros, arquitectura ni contexto.

La model card es deliberadamente minimalista: no incluye informacion sobre el proceso de entrenamiento, los datos utilizados, los idiomas soportados ni resultados de evaluacion. El autor indica explicitamente que cualquier afirmacion de entrenamiento o evaluacion debe consultarse en los ficheros de recibos del "estate mesh" y que lo no acreditado alli se marca como UNKNOWN (desconocido). Esta politica de honestidad documental es el rasgo mas destacable de la publicacion.

Por tanto, la ficha se limita a los datos verificables en el repositorio (tamano, formato, autor, fechas) y marca como "no disponible" todo aquello que la informacion proporcionada no cubre. No se debe asumir ninguna capacidad, tamano de parametros ni licencia mas alla de lo que aqui se indica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Autor / organizacion | SZLHOLDINGS |
| Fecha de creacion | 2026-11-19 |
| Fecha de actualizacion | 2026-11-20 |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Region | us |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. No consta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o cualquier otra variante. Tampoco se declara el numero de parametros ni la longitud de contexto.

Respecto al entrenamiento, la model card remite a los "receipt files" del estate mesh del autor para cualquier afirmacion sobre datos, numero de tokens o tecnicas de alineacion (RLHF, DPO, etc.). Esos ficheros no estan incluidos en la informacion proporcionada, por lo que el proceso de entrenamiento se considera no disponible. La unica innovacion documental destacable es el sistema de recibos con marcas MEASURED/REPORTED/UNKNOWN y capturas de tiempo, que el autor presenta como mecanismo de verificacion reproducible.

## Capacidades

- No se declara ninguna capacidad concreta en la model card.
- No consta soporte de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta informacion sobre capacidades multilingues.
- No consta modo de razonamiento extendido (thinking mode), audio ni otras modalidades.
- El unico dato funcional verificable es que el repositorio contiene pesos en safetensors de 0,7 GB, compatibles con librerias estandar de inferencia, pero sin pipeline declarado.

## Casos de uso

Dado que no se declaran capacidades ni arquitectura, los casos de uso solo pueden plantearse como escenarios hipoteticos condicionados a una evaluacion previa del artefacto:

- Auditoria de artefactos gobernados: usar el repositorio como ejemplo de publicacion con recibos y trazabilidad temporal, util para equipos que disenan pipelines de cumplimiento documental en IA.
- Evaluacion interna antes de adopcion: descargar los pesos y ejecutar una bateria propia de pruebas (perplejidad, generacion, instrucciones) para determinar que tarea cubre realmente el modelo, ya que la model card no lo especifica.
- Reproduccion de experimentos del autor: si se localizan los ficheros de recibos del estate mesh, reconstruir las condiciones de entrenamiento y verificarlas contra el snapshot fechado del 2026-11-20.
- Prototipado de bajo coste: con 0,7 GB de pesos, el artefacto cabe en GPU de consumo y puede servir para pruebas de integracion en pipelines de inferencia antes de sustituirlo por un modelo documentado.
- Investigacion sobre documentacion de modelos: analizar el formato de model card generado por `estate-cards weaver` como caso de estudio de transparencia declarativa (marcas MEASURED/REPORTED/UNKNOWN).
- Base para fine-tuning experimental: si la licencia lo permite (dato no disponible), partir de estos pesos para tareas especificas, verificando primero la arquitectura real cargando el checkpoint con `transformers` o `safetensors`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria fechada, y esa auditoria no se incluye en el repositorio ni en los metadatos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision, al desconocerse el numero de parametros. Como referencia, un repositorio de 0,7 GB en safetensors (tipicamente fp16 o bf16) sugiere un modelo del orden de cientos de millones de parametros, que cabria en GPUs de consumo con 8-16 GB de VRAM, pero es una inferencia, no un dato declarado.
- GPU recomendadas: no disponible. Por tamano de repositorio, cualquier GPU consumer reciente (RTX 3060 en adelante) seria probablemente suficiente, condicionado a confirmar la arquitectura.
- Cabe en GPU de consumo: probablemente si, segun el tamano del repositorio, pero no confirmado por el autor.
- Opciones de despliegue: al ser safetensors, es compatible con `transformers`, vLLM y TGI si la arquitectura es estandar; llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconocen parametros, contexto, licencia y rendimiento del modelo. Cualquier comparacion con alternativas de la misma categoria seria especulativa. Se indica por tanto: no disponible.

| Modelo | Parametros | Contexto | Licencia | Benchmark | Disponibilidad |
|---|---|---|---|---|---|
| salad-abst-curriculum-v2-r1 | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se declaran arquitectura, parametros, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; tratar como restringido hasta confirmacion.
- Riesgo de alucinacion y sesgos: desconocidos, al no haber evaluaciones publicadas ni informacion sobre datos de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Fechas de creacion y actualizacion en 2026: verificar la coherencia temporal del repositorio antes de integrarlo en cualquier pipeline.
- La model card remite a ficheros de recibos externos que no forman parte del repositorio consultado; sin ellos, las afirmaciones del autor no son verificables.
- El nombre "salad-abst-curriculum" sugiere un experimento de curriculum learning o abstraccion, pero es una interpretacion del identificador, no un dato confirmado.
- No usar en produccion sin una evaluacion propia previa que determine capacidades, calidad y comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-abst-curriculum-v2-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de model cards citada: https://github.com/szl-holdings/estate-cards
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
