# Zaluski/laya-onnx

## Resumen

Zaluski/laya-onnx es un repositorio de grafos ONNX exportados a partir del modelo de decisiones Laya de ConvAI Innovations (checkpoint convaiinnovations/laya, revision 55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851). No es un modelo generativo: es un motor de decisiones no autorregresivo de tipo System 1, disenado para recibir un estado (texto, correo, ticket o documento JSON) junto con preguntas tipadas y devolver respuestas tipadas con distribuciones de probabilidad calibradas y puntuaciones de confianza.

El repositorio organiza los grafos en tres subcarpetas: english, multilingual y typed-decisions. Cada subcarpeta contiene un fichero laya.onnx, un tokenizer y un rl_agent_config.json. El grafo multilingual ocupa 1.289.798.665 bytes en fp32 (en torno a 320 millones de parametros si se asume precision fp32 completa, estimacion aritmetica no confirmada por el autor), mientras que english y typed-decisions ocupan solo 2.705.712 bytes cada uno.

Su relevancia practica es doble: por un lado ofrece una via de ejecucion local en CPU mediante ONNX Runtime, con una latencia anunciada de 33 ms en la variante multilingue; por otro, expone un contrato de grafo estable (entradas input_ids, attention_mask, marker_pos, marker_mask, qtype; salidas logits y act_logits) que permite integrarlo en cargas tipo cosh-onnx y en servidores compatibles con el formato /v1/systemone. El repositorio no declara licencia ni idiomas en sus metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo de decisiones (System 1); grafo ONNX exportado con torch.onnx.export (dynamo), opset 18, ejes de batch/seq/markers dinamicos |
| Parametros totales | No disponible. Estimacion aritmetica a partir del fichero multilingual fp32 (1,29 GB): del orden de 320 millones de parametros, no confirmada por el autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 (grafo publicado); int8 con cuantizacion dinamica weight-only en los ficheros *.int8.onnx cuando estan presentes |
| Idiomas soportados | Subcarpetas english y multilingual; la lista completa de idiomas no esta documentada |
| Licencia | No disponible |
| Formato de pesos | ONNX con pesos inline (opset 18); tokenizer en formato tokenizer.json; configuracion en rl_agent_config.json |

## Arquitectura y entrenamiento

El artefacto publicado es un export, no un entrenamiento nuevo. El autor indica que se genero con cosh-onnx 0.1.0 mediante torch.onnx.export en modo dynamo, opset 18, con pesos en linea y ejes dinamicos de batch, secuencia y marcadores. El contrato del grafo es explicito: entradas input_ids, attention_mask, marker_pos, marker_mask y qtype; salidas logits y act_logits. La presencia de marker_pos y marker_mask sugiere un mecanismo de anclaje de preguntas dentro del estado de entrada, y la entrada qtype indica el tipo de pregunta formulada, coherente con el caracter tipado de las respuestas.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Si aparece un fichero rl_agent_config.json en cada subcarpeta, lo que apunta a una fase de ajuste con refuerzo sobre un agente, pero su contenido no se ha publicado en la informacion proporcionada. El proyecto base se presenta como una familia horizontal de modelos de decision System 1, compatible con el ecosistema Jev, y la variante multilingue incorpora un tokenizer sustancialmente mayor (34,3 MB frente a 3,58 MB de las variantes en ingles y typed-decisions).

## Capacidades

- Decisiones tipadas: recibe un estado (texto, correo electronico, ticket o documento JSON) y un conjunto de preguntas tipadas, y devuelve respuestas tipadas.
- Probabilidades calibradas: las salidas incluyen distribuciones de probabilidad, puntuaciones ordinales y probabilidades booleanas, segun la descripcion del ecosistema Laya.
- Verificacion de terminacion: el caso de uso declarado del repositorio es el chequeo de terminacion de cosh, resuelto por el cargador de hub del crate cosh-onnx.
- Multilingue: existe una variante especifica con tokenizer ampliado; el alcance linguistico exacto no esta documentado.
- Salidas duales: el grafo emite logits y act_logits, lo que permite separar la decision principal de una senal auxiliar de actuacion.
- Interfaz HTTP compatible: el ecosistema que lo consume expone POST /v1/systemone con el mismo formato de cable que api.typesafe.ai y los modelos typesafe/jev-* de OpenRouter.
- No autorregresivo: no genera texto libre ni mantiene conversaciones multi-turno.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket y un conjunto de preguntas tipadas (categoria, urgencia, requiere escalado), el modelo devuelve probabilidades calibradas que permiten aplicar umbrales y derivar automaticamente al equipo correcto sin generacion de texto.
- Verificacion de terminacion en agentes: integrado a traves del crate cosh-onnx, decide si una tarea agentica ha concluido a partir del estado actual, evitando bucles infinitos en pipelines autonomos.
- Extraccion estructurada de correos y documentos JSON: a partir de un estado no estructurado, responde preguntas booleanas y ordinales que se mapean directamente a campos de un esquema, sin necesidad de un LLM generativo.
- Triaje y moderacion de contenido: el uso de probabilidades calibradas permite fijar umbrales auditables y medir la confianza de cada decision, algo mas adecuado que una etiqueta unica para flujos con revision humana.
- Modelado de preferencias y encuestas: las puntuaciones ordinales permiten ordenar alternativas y estimar intensidad de preferencia sobre respuestas de usuarios o evaluaciones comparativas.
- Sustitucion local de APIs comerciales: los clientes escritos contra los modelos typesafe/jev-* pueden apuntar a un servidor local basado en este ONNX cambiando unicamente la URL base, lo que reduce coste y dependencia de terceros si la licencia lo permite.
- Etiquetado por lotes en CPU: al ejecutarse con ONNX Runtime y no requerir GPU, permite procesar grandes volumenes de documentos en infraestructura convencional con un presupuesto de memoria en torno a 2 GB para el modelo cargado.
- Despliegue en el borde o en entornos sin GPU: la variante int8 weight-only esta pensada explicitamente para mejorar el rendimiento en CPU, lo que habilita contenedores pequenos y baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento localizado es la latencia anunciada por el sitio del proyecto (33 ms para la variante multilingue), que no constituye un benchmark reproducible y no especifica hardware, tamano de lote ni longitud de entrada. No hay cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificacion o calibracion.

## Requisitos de hardware

- Peso del grafo multilingue en fp32: 1.289.798.665 bytes (aproximadamente 1,29 GB).
- Peso de los grafos english y typed-decisions: 2.705.712 bytes cada uno.
- Memoria estimada: el cliente receptron/laya indica un presupuesto de unos 2 GB de RAM para el modelo cargado, mas unos cientos de MB por lote de preguntas.
- GPU: no se documenta ninguna recomendacion de GPU; el diseno apunta a ejecucion en CPU.
- GPU de consumo: no aplica como requisito; la ejecucion en CPU es la via prevista.
- Cuantizacion: existe soporte para cuantizacion dinamica weight-only int8 (ficheros *.int8.onnx) orientada a mejorar el rendimiento en CPU.
- Opciones de despliegue: ONNX Runtime, el crate Rust cosh-onnx, el servidor HTTP navopw/laya-onnx que expone POST /v1/systemone, y el cliente Node.js 20 o superior de receptron/laya con cache en ~/.cache/receptron-laya.
- Latencia: 33 ms anunciados para la variante multilingue (sin especificar hardware ni condiciones). No hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zaluski/laya-onnx | ONNX (opset 18, fp32; int8 opcional) | 1,29 GB la variante multilingue; 2,7 MB english y typed-decisions | No disponible | No disponible | HuggingFace, 0 descargas y 0 likes en la fecha de consulta |
| convaiinnovations/laya | Checkpoint original (PyTorch, revision 55cf4c4) | No disponible | No disponible | No disponible | HuggingFace |
| Mattepiu/laya-onnx | ONNX | No disponible | No disponible | No disponible | HuggingFace |
| typesafe/jev-* (OpenRouter) | API alojada, formato /v1/systemone | No aplica | No disponible | Comercial (servicio) | API en api.typesafe.ai y OpenRouter |

Los cuatro comparten la misma tarea de decision tipada y, segun la documentacion del ecosistema, el mismo formato de cable, de modo que un cliente puede alternar entre ellos cambiando la URL base. No hay datos publicos de rendimiento que permitan compararlos cuantitativamente.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no mantiene dialogos y no debe emplearse para tareas de generacion, resumen o traduccion abierta.
- Licencia no disponible: los metadatos de HuggingFace no declaran licencia, por lo que no puede asumirse permiso para uso comercial ni redistribucion. Debe verificarse en el repositorio del modelo base antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: no hay metricas publicas de precision, calibracion ni robustez, de modo que el rendimiento real por dominio es desconocido y requiere evaluacion propia.
- Idioma y cobertura no documentados: se ofrecen subcarpetas english y multilingual, pero se desconoce la lista exacta de idiomas y su calidad relativa.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con estados largos ni con muchas preguntas simultaneas.
- Riesgo de alucinacion estructural: al devolver probabilidades sobre preguntas tipadas, un umbral mal elegido puede producir decisiones erroneas con apariencia de confianza alta; conviene calibrar por dominio y fijar umbrales auditables.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Madurez del artefacto: el repositorio presenta 0 descargas y 0 likes, la fecha de publicacion indicada en los metadatos (2026-09-29) es posterior a la fecha de consulta habitual y el conjunto carece de comunidad verificable; conviene validar el artefacto por cuenta propia.
- Integridad: el repositorio incluye sha256sums.txt; se recomienda ejecutar sha256sum -c sha256sums.txt tras la descarga, ya que los pesos van en linea dentro del ONNX y no son inspeccionables a simple vista.
- Compatibilidad: al depender del contrato de grafo y del formato /v1/systemone, cambios en qtype, marker_pos o marker_mask romperian los clientes existentes.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/Zaluski/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Proyecto Laya: https://laya.convaiinnovations.com/
- Crate cosh-onnx y proyecto cosh: https://github.com/convaiinnovations/cosh
- Cliente Node.js compatible: https://github.com/receptron/laya
- Servidor ONNX con endpoint /v1/systemone: https://github.com/navopw/laya-onnx/tree/main
- Espejo ONNX alternativo: https://huggingface.co/Mattepiu/laya-onnx
- API comercial compatible: https://api.typesafe.ai
