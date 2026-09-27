# usejul/jul-decision-e5-small-onnx

## Resumen

jul-decision-e5-small-onnx es la version ONNX del modelo usejul/jul-decision-e5-small, un clasificador de texto para zero-shot classification desarrollado por usejul como componente del proyecto jul. Se trata de un encoder tipo BERT derivado de la familia e5-small, exportado a formato ONNX y cuantizado para ejecucion en CPU: pesos de 8 bits y embeddings de 4 bits, con un peso total de 98 MB. Su proposito es resolver "decisiones" de clasificacion (asignar una etiqueta de un conjunto definido en tiempo de inferencia sin reentrenamiento) dentro del pipeline de jul, con un coste de ejecucion muy bajo.

La relevancia de esta ficha es acotada y conviene ser explicito: no es un modelo generativo ni un LLM. Es un clasificador compacto orientado a despliegue en CPU, con 23 ms por decision en un solo nucleo segun el autor, y una puntuacion de 0,613 en los dev sets de jul frente a 0,536 de una variante e5-small int8 de referencia. Eso lo situa en el nicho de clasificacion ligera y local, no en el de generacion, razonamiento o agentes.

El repositorio es muy reciente (creado el 26 de septiembre de 2026 segun los metadatos de HuggingFace), acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y su model card es minima: delega explicitamente los detalles de entrenamiento, resultados y licencia a la model card del modelo base. Por tanto, buena parte de las especificaciones habituales (parametros, contexto, composicion del dataset) no estan publicadas y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (etiqueta `bert` del repositorio), derivado de e5-small; tarea de clasificacion (zero-shot-classification) |
| Parametros totales | no disponible (el autor no lo publica; los 98 MB con pesos de 8 bits y embeddings de 4 bits apuntan a un orden de 100 millones de parametros, estimacion no confirmada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de 8 bits y embeddings de 4 bits (build ONNX cuantizado) |
| Idiomas soportados | Ingles (en), frances (fr) y multilingue (segun las etiquetas del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB (artefacto de 98 MB) |
| Modelo base | usejul/jul-decision-e5-small |
| Pipeline declarado | zero-shot-classification |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un encoder transformer de la familia BERT, segun la etiqueta `bert` del repositorio, construido a partir de usejul/jul-decision-e5-small, que a su vez pertenece a la familia e5-small. Es un modelo discriminativo de clasificacion, no generativo: recibe un texto y un conjunto de etiquetas candidatas y produce una puntuacion de pertenencia. La exportacion a ONNX aplica cuantizacion mixta: 8 bits para los pesos y 4 bits para los embeddings, lo que reduce el artefacto a 98 MB y habilita inferencia en CPU sin GPU.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (tecnicas que, por otra parte, no aplican a un clasificador de este tipo) ni innovaciones de decodificacion. El autor remite a la model card del modelo base para "resultados, entrenamiento y licencia", de modo que cualquier dato de entrenamiento debe consultarse alli y no puede darse por confirmado a partir de esta ficha.

## Capacidades

- Clasificacion zero-shot: asigna etiquetas definidas en tiempo de inferencia sin necesidad de fine-tuning adicional.
- Toma de decisiones ("decision") integrada en el ecosistema jul, invocable mediante el comando `jul models add jul-decision-e5-small --repo usejul/jul-decision-e5-small-onnx --backend onnx`.
- Inferencia en CPU: 23 ms por decision en un solo nucleo, segun el autor.
- Cobertura linguistica declarada para ingles, frances y uso multilingue.
- Huella reducida: 98 MB en disco, apta para entornos con memoria limitada.
- No dispone de generacion de texto libre, razonamiento multi-paso, tool calling ni function calling.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito.
- No se documenta soporte para agentes ni para orquestacion de tareas.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada ticket entrante en categorias como facturacion, incidencia tecnica o cuenta, sin entrenar un modelo por categoria. Adecuado por su naturaleza zero-shot y sus 23 ms por decision en CPU.
- Deteccion de intencion en asistentes conversacionales: etiquetar la intencion del usuario en cada turno para dirigir el flujo de dialogo, con coste de computo despreciable frente a un LLM generativo.
- Triaje de correo electronico: asignar etiquetas operativas (urgente, informativo, requiere respuesta) a un buzon corporativo en local, sin enviar datos a servicios externos.
- Etiquetado de corpus para anotacion previa: preetiquetar grandes volumenes de documentos en ingles o frances antes de una revision humana, reduciendo el trabajo manual de anotacion.
- Clasificacion de feedback de cliente: agrupar comentarios y resenas por tema o sentimiento a partir de etiquetas definidas por el equipo de producto, con reajuste de etiquetas sin reentrenar.
- Moderacion o filtrado por categoria en el borde: desplegar el modelo en dispositivos con CPU modesta o contenedores pequenos para descartar o marcar contenido antes de enviarlo a un sistema mayor.
- Enriquecimiento de pipelines de datos: incorporar una etapa de clasificacion en procesos ETL en CPU mediante ONNX Runtime, con un artefacto de 98 MB facil de versionar y distribuir.
- Clasificacion de documentos en ingles y frances: aprovechar la cobertura declarada de ambos idiomas para catalogar documentacion bilingue sin mantener dos modelos separados.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| Zero-shot en los dev sets de jul | jul-decision-e5-small-onnx | 0,613 |
| Zero-shot en los dev sets de jul | e5-small int8 (referencia) | 0,536 |
| Latencia por decision (1 CPU) | jul-decision-e5-small-onnx | 23 ms |

No se han publicado en la informacion disponible resultados en benchmarks estandar de la industria (MMLU, GLUE, XNLI, etc.) ni la composicion exacta de los dev sets de jul, por lo que la comparacion externa no es posible con los datos aportados. La unica comparativa publicada es la que el propio autor incluye frente a e5-small int8.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para inferencia en CPU.
- Almacenamiento: 98 MB para los pesos ONNX cuantizados (repositorio de 0,1 GB).
- GPU recomendadas: no aplica; no se documenta soporte CUDA ni aceleracion por GPU.
- Compatibilidad con hardware de consumo: si, cabe en cualquier equipo de consumo, incluidos portatiles y equipos de gama baja; no requiere GPU dedicada.
- Opciones de despliegue: backend ONNX (ONNX Runtime) integrado en la herramienta jul mediante `jul models add`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos generativos.
- Latencia: 23 ms por decision en un solo nucleo de CPU, segun el autor.
- Throughput: no disponible (no se publican mediciones en paralelo o por lote).
- Memoria RAM estimada: no disponible de forma explicita; el tamano del artefacto (98 MB) sugiere un consumo moderado, pero no hay cifra publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento zero-shot (dev sets de jul) | Licencia | Formato |
|---|---|---|---|---|---|
| jul-decision-e5-small-onnx | no disponible (artefacto de 98 MB, cuantizado) | no disponible | 0,613 | apache-2.0 | ONNX |
| jul-decision-e5-small (modelo base) | no disponible | no disponible | no disponible | apache-2.0 | no disponible |
| e5-small int8 (referencia citada por el autor) | no disponible | no disponible | 0,536 | no disponible en esta ficha | int8 |
| Otros clasificadores zero-shot (BART-large-MNLI, deberta-v3 NLI, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa queda limitada a los datos publicados por el autor. No se dispone de parametros, contexto ni resultados de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con clasificadores zero-shot de uso comun.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni mantiene conversaciones; solo puntua etiquetas candidatas.
- Sesgos: no hay ninguna evaluacion de sesgos publicada; al derivar de un modelo de embeddings multilingue, hereda los sesgos de su corpus de entrenamiento, que no se documenta.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas o sobreconfiadas, especialmente con etiquetas ambiguas o solapadas.
- Cobertura de idiomas: se declaran ingles, frances y multilingue. El castellano no aparece listado de forma explicita; conviene validar su comportamiento antes de usarlo en produccion en espanol.
- Cuantizacion agresiva: los embeddings en 4 bits y los pesos en 8 bits implican una perdida de precision respecto al modelo base, no cuantificada en la informacion disponible.
- Trazabilidad: la model card remite al modelo base para los detalles de entrenamiento, de modo que no se puede auditar el dataset ni el procedimiento a partir de este repositorio.
- Licencia apache-2.0: permite uso comercial, pero al ser un derivado conviene verificar la licencia del modelo base y de sus dependencias antes de distribuirlo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, repositorio creado en septiembre de 2026 y sin validacion de la comunidad; no es aconsejable como componente critico sin evaluacion propia.
- Los 0,613 de zero-shot corresponden a los dev sets internos de jul, no a un benchmark publico reproducible de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usejul/jul-decision-e5-small-onnx
- Modelo base: https://huggingface.co/usejul/jul-decision-e5-small
- Repositorio del proyecto jul: https://github.com/usejul/jul
- Model card del modelo base (referenciada por el autor para resultados, entrenamiento y licencia): https://huggingface.co/usejul/jul-decision-e5-small
- Papers, blogs o demos adicionales: no se han encontrado enlaces relevantes en la busqueda web realizada (los resultados obtenidos correspondian a paginas genericas de LinkedIn, sin relacion con el modelo).
