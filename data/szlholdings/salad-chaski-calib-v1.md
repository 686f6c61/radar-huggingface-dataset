# SZLHOLDINGS/salad-chaski-calib-v1

## Resumen

salad-chaski-calib-v1 es un artefacto de entrenamiento publicado por SZLHOLDINGS dentro de su denominado "estate governed-AI", una coleccion de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). El repositorio contiene 59 ficheros (212.798.465 bytes en total) organizados en directorios de checkpoint (checkpoint-50, checkpoint-100, checkpoint-150, checkpoint-200 y final), lo que sugiere un proceso de entrenamiento por etapas con guardado periodico.

La informacion disponible es extremadamente limitada: no se declara tipo de modelo, arquitectura, numero de parametros, longitud de contexto ni idiomas. El fichero config.json devuelve 404 y los unicos artefactos de pesos identificados en el arbol del repositorio son ficheros tokenizer.json de 19.989.339 bytes cada uno, con el mismo hash SHA-256 en los cinco checkpoints. La model card no afirma ningun resultado de benchmark y etiqueta explicitamente como UNKNOWN cualquier capacidad no respaldada por un recibo medido.

Su relevancia actual es, por tanto, metodologica mas que tecnica: ejemplifica un patron de publicacion centrado en la verificabilidad (hashes, timestamps, etiquetas MEASURED/REPORTED/UNKNOWN) en el que las afirmaciones de calidad solo se aceptan si existe un DONE.json estricto con status=MEASURED y eval_rc=0. En este repositorio ese fichero no existe, por lo que el propio autor clasifica la evidencia de evaluacion como UNKNOWN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model_type y architectures NOT-DECLARED; config.json devuelve 404) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (etiqueta fijada el 2026-11-25 por el equipo de ops del estate; sin evidencia de licencia upstream por fichero) |
| Formato de pesos | safetensors (tag del repo); en el arbol de la revision solo se identifican tokenizer.json por checkpoint, sin artefactos de pesos primarios declarados |
| Tipo de dato (dtype) | no disponible (NOT-DECLARED) |
| Tamano del repositorio | 0,1 GB (212.798.465 bytes, 59 ficheros) |
| Revision | 406d34bcde56 |
| Fecha de creacion | 2026-11-19 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura. El recibo r2 del 2026-11-23 registra explicitamente `model_type NOT-DECLARED`, `architectures NOT-DECLARED` y `dtype NOT-DECLARED`, y la peticion a config.json devuelve 404. La estructura de directorios (checkpoint-50, checkpoint-100, checkpoint-150, checkpoint-200, final) es compatible con un entrenamiento por pasos con evaluacion intermedia, pero no se documenta ni el numero de tokens, ni la composicion del dataset, ni si hubo RLHF, DPO o ajuste supervisado.

El dato mas concreto es la presencia de cinco ficheros tokenizer.json de 19.989.339 bytes con hash identico (a5cd9732badce41de57e6efce8302930ded1c1188c5f81feb2bd6c24c4a1941f) en todos los checkpoints, lo que indica que el tokenizador no se modifico entre etapas. No se declara ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, mezcla de expertos ni arquitecturas hibridas). El escaneo de recibos de la tranche 6 (2026-11-22) clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero ninguno cumple el umbral estricto de evidencia.

## Capacidades

- Generacion de texto: no confirmada; no hay evidencia medida ni documentacion de capacidades.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo thinking o cualquier capacidad especial: no disponible.

El autor declara de forma explicita que no se afirma ninguna capacidad sin recibos de evaluacion medidos, y que en este repositorio esos recibos no existen.

## Casos de uso

- Auditoria de linaje de artefactos: el repositorio sirve como caso de estudio de un pipeline de publicacion con hashes SHA-256 por fichero y marcas temporales, util para equipos que disenan procesos de trazabilidad de modelos.
- Verificacion de integridad en espejos internos: los hashes LFS publicados permiten comprobar que una copia local de los tokenizer.json coincide con la revision 406d34bcde56 antes de usarla en cualquier flujo.
- Prueba de infraestructura de evaluacion: al no existir DONE.json estricto, el repo es un banco de pruebas para validar que un harness de evaluacion detecta correctamente artefactos sin evidencia y los etiqueta como UNKNOWN.
- Formacion en gobernanza de IA: util como ejemplo docente de model card que separa afirmaciones medidas de afirmaciones no verificadas.
- Integracion en catalogos de modelos con filtros de calidad: permite probar reglas que excluyan automaticamente repositorios sin config.json ni pesos primarios declarados.
- No se recomienda su uso para inferencia en produccion, atencion al cliente, generacion de codigo ni ninguna tarea funcional, al no existir artefactos de pesos ni especificaciones verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el recibo r2 indica que no se ejecuto ningun benchmark nuevo. La evidencia de evaluacion figura como UNKNOWN por ausencia de un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se declara numero de parametros ni dtype, por lo que no puede calcularse.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable con los datos publicados.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se identifican artefactos de pesos primarios en el arbol de la revision, solo tokenizers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se declara categoria, tamano ni tarea, y no hay benchmarks publicados que permitan situar el modelo frente a alternativas.

## Limitaciones y advertencias

- Ausencia de config.json (404): impide conocer arquitectura, tipo de modelo y dtype, y bloquea la carga estandar con librerias como transformers.
- Ausencia de artefactos de pesos primarios declarados: los ficheros identificados son tokenizer.json repetidos; no se confirma que el repositorio sea ejecutable para inferencia.
- Evidencia de evaluacion UNKNOWN: no existe DONE.json estricto con status=MEASURED ni eval_rc=0, segun el propio escaneo del autor.
- Licencia con salvedad: la etiqueta apache-2.0 se fijo por decision operativa del estate el 2026-11-25, sin evidencia de licencia upstream por fichero; conviene verificar derechos antes de cualquier uso comercial.
- Riesgo de alucinacion y sesgos: no evaluables al no existir documentacion de entrenamiento ni evaluaciones.
- Idiomas y contexto: no declarados, por lo que no puede garantizarse cobertura linguistica ni ventana de contexto.
- Trazabilidad parcial: los recibos citados remiten a una malla externa (wave-logs mesh/2026-11-23/w15-frontier-r2/) no incluida en el repositorio.
- No apto para produccion en su estado actual: sin especificaciones, sin pesos verificados y sin evaluacion medida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-chaski-calib-v1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de cards (estate-cards): https://github.com/szl-holdings/estate-cards
- Paper: no disponible
- Blog o demo: no disponible
