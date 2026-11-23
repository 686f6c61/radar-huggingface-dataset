# SZLHOLDINGS/salad-ring-ouro-l84

## Resumen

`salad-ring-ouro-l84` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo verificables). El repositorio de Hugging Face existe y es accesible, pero la model card no proporciona informacion sustantiva sobre el modelo en si: no indica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados.

La model card se limita a describir el marco de gobernanza del autor (identidad del repo, fuente canonica en GitHub, graficos SVG generados de forma determinista a partir de una instantanea de auditoria) y a declarar explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no este en los ficheros de recibo debe considerarse "UNKNOWN". El escaneo de recibos de la propia card clasifica el repo como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`, por lo que la evidencia de evaluacion es desconocida.

En consecuencia, esta ficha no puede caracterizar tecnicamente el modelo: se desconoce si es un transformer, un MoE o cualquier otra arquitectura, su tamano, su licencia o sus capacidades. El valor de la ficha es, por tanto, documentar la existencia del artefacto, su marco de publicacion y la ausencia de evidencia verificable, advirtiendo de que no debe utilizarse en produccion ni citarse como referencia sin obtener antes los recibos de entrenamiento y evaluacion del autor.

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
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. No consta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido, ni tampoco el numero de parametros, la longitud de contexto nativa o la tokenizacion empleada.

Respecto al entrenamiento, la model card remite a los "receipt files" del estate del autor para cualquier afirmacion sobre datos, numero de tokens, composicion del corpus o tecnicas de alineacion (RLHF, DPO). El escaneo de recibos incluido en la propia card indica que no existe un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0` y marca temporal, por lo que la evidencia de evaluacion se declara como `UNKNOWN`. El unico fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que la card califica de coincidencia por palabra clave y no de evidencia validada.

## Capacidades

- Generacion de texto: no disponible (no se documenta ninguna capacidad concreta).
- Razonamiento, codigo y matematicas: no disponible.
- Vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, decodificacion especulativa, etc.): no disponible.

La model card no enumera ninguna capacidad funcional del artefacto; se limita a describir el marco de gobernanza y a declarar que no se afirma ninguna capacidad sin recibos de evaluacion medidos.

## Casos de uso

No es posible recomendar casos de uso concretos para este artefacto, ya que se desconoce su naturaleza, su tamano, su licencia y sus capacidades. Los siguientes escenarios son genericos y quedan condicionados a que el autor publique los recibos de entrenamiento y evaluacion:

- Evaluacion interna de artefactos de gobernanza: inspeccionar la estructura de la model card y los graficos SVG deterministas como ejemplo de publicacion "source-linked" con trazabilidad de instantaneas de auditoria.
- Auditoria de repositorios de Hugging Face: usar este repo como caso de estudio de un artefacto clasificado como `RECEIPT_FILES_NO_DONE` para disenar criterios de admision en un registro interno de modelos.
- Verificacion de cadena de custodia: comprobar la fuente canonica declarada en GitHub y contrastar la instantanea de auditoria (`2026-11-20T03:48:04Z`, marcada como `MEASURED`) con los artefactos del repo.
- Formacion en practicas de documentacion de modelos: analizar como una model card puede declarar explicitamente `UNKNOWN` en lugar de inventar cifras de benchmarks.
- Integracion en pipelines de evaluacion: si el autor publica un `DONE.json` estricto, someter el artefacto a los benchmarks internos del equipo antes de cualquier uso.
- Uso en produccion: no recomendado en el estado actual, al no existir evidencia de evaluacion ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como `UNKNOWN`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

Sin conocer el tamano del modelo ni el formato de pesos, no es posible estimar requisitos de memoria ni rendimiento de inferencia.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre parametros, contexto, rendimiento ni licencia que permita establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: se desconocen arquitectura, parametros, contexto, tokenizador y formato de pesos.
- Licencia no declarada: no puede asumirse ningun derecho de uso comercial, modificacion o redistribucion.
- Evidencia de evaluacion inexistente: el propio escaneo de recibos del autor clasifica el repo como `RECEIPT_FILES_NO_DONE` y la evidencia de evaluacion como `UNKNOWN`.
- Riesgo de alucinacion y sesgos: no evaluables sin benchmarks ni documentacion de datos de entrenamiento.
- Idiomas soportados desconocidos: no puede garantizarse un comportamiento correcto en castellano ni en ninguna otra lengua.
- Fecha de creacion futura en los metadatos (`2026-11-19`): conviene verificar la coherencia temporal del repositorio antes de citarlo.
- Cero descargas y cero likes: sin senales de adopcion ni validacion por parte de la comunidad.
- No apto para produccion en su estado actual: sin recibos medidos ni licencia, su uso en sistemas reales carece de base verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l84
- Organizacion del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica declarada (organizacion en GitHub): https://github.com/szl-holdings
- Herramienta de generacion de cards citada por el autor: https://github.com/szl-holdings/estate-cards
