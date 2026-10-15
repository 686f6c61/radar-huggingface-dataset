# stepfun-ai/Step-5-Preview

## Resumen

Step 5 Preview es el modelo insignia de StepFun (autor `stepfun-ai`) orientado a tareas de agente ("agentic work"). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts disperso con 600B parametros totales y 27B parametros activos por token, que segun la model card alcanza un rendimiento de frontera en ingenieria de software y trabajo de conocimiento profesional, con especial enfasis en el dominio financiero. El checkpoint publicado en HuggingFace ocupa 650,3 GB y declara 604.339.504.832 parametros reales en los ficheros safetensors.

La relevancia del modelo reside en la combinacion de tres factores: una ventana de contexto de hasta 1 millon de tokens (tanto de entrada como de salida), un presupuesto de parametros activos relativamente bajo (27B) sobre un total de 600B, lo que reduce el coste de inferencia por token frente a un denso equivalente, y una orientacion explicita a ejecucion de horizonte largo con llamadas repetidas a herramientas, verificacion y revision de resultados. Ademas acepta entradas multimodales, lo que le permite analizar documentos largos, graficos, capturas de pantalla, imagenes y video.

El modelo se distribuye como vista previa ("Preview") bajo una licencia de tipo `other` cuyo texto completo esta en el repositorio, con checkpoints en FP8 y BF16 y soporte declarado en vLLM, SGLang y Transformers. La model card indica que se recomienda servir el modelo con versiones de framework que incluyan soporte especifico para Step 5 Preview, incluidas las funciones de razonamiento, tool calling y decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE); tag de HuggingFace `step5_vl` |
| Parametros totales | 600B (604.339.504.832 reales en safetensors) |
| Parametros activos | 27B |
| Longitud de contexto | Hasta 1M tokens (entrada y salida, segun model card) |
| Tipos de cuantizacion | FP8 (checkpoint principal) y BF16 (repositorio secundario `Step-5-Preview-BF16`); no se mencionan GGUF ni otras |
| Idiomas soportados | no disponible |
| Licencia | `other` (texto en `LICENSE.txt` del repositorio) |
| Formato de pesos | safetensors |
| Entrada | Texto e imagen (la introduccion de la model card menciona tambien video; la tabla de especificaciones solo lista texto e imagen) |
| Salida | Texto |
| Salida maxima | Hasta 1M tokens |
| Tamano del repositorio | 650,3 GB |
| Pipeline declarado en HuggingFace | no disponible |

## Arquitectura y entrenamiento

La model card describe Step 5 Preview como un modelo MoE disperso con 600B parametros totales y 27B activos. No se detalla en la informacion disponible el numero de expertos, la estrategia de enrutamiento, el numero de capas ni la configuracion de atencion; tampoco se especifica si emplea atencion lineal, variantes hibridas o decodificacion especulativa nativa, aunque las instrucciones de despliegue si mencionan que hay que usar builds de framework que incluyan "speculative decoding features", lo que implica soporte para esa tecnica en la ruta de inferencia.

Tampoco se publican en la informacion proporcionada datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias. Lo unico verificable es la naturaleza multimodal del modelo (tag `step5_vl`, acepta imagenes y, segun la introduccion, video) y la existencia de checkpoints en FP8 y BF16. Cualquier afirmacion sobre innovaciones tecnicas concretas mas alla de lo anterior seria especulacion.

## Capacidades

- Ingenieria de software a nivel de repositorio: navegacion de bases de codigo grandes, coordinacion de cambios entre multiples ficheros, ejecucion y verificacion del codigo y iteracion sobre los resultados.
- Desarrollo frontend y visual, asi como programacion para dispositivos.
- Ejecucion agentica de horizonte largo: cadenas de llamadas a herramientas con ejecucion, verificacion y revision, apoyandose en informacion de contexto largo.
- Trabajo de conocimiento profesional: investigacion, comprension multimodal y uso de herramientas para analizar documentos extensos, graficos, capturas de pantalla, imagenes y video, y generar informes y analisis estructurados.
- Razonamiento cuantitativo combinado con analisis de datos financieros y documentacion de soporte, con un foco declarado en tareas de finanzas.
- Soporte de tool calling / function calling (la model card menciona explicitamente "tool-call features" en los frameworks de despliegue).
- Modo de razonamiento configurable: los resultados publicados usan el ajuste "High" de razonamiento.
- Capacidades multilingues: no disponible.

## Casos de uso

- Ingenieria de software asistida a nivel de repositorio: dado un repositorio completo, el modelo puede localizar los puntos de cambio necesarios, proponer parches que afectan a varios ficheros y ejecutar la suite de pruebas para verificar el resultado. La ventana de 1M tokens permite cargar grandes fragmentos del arbol de codigo sin trocear el contexto.
- Revision de codigo y triaje de incidencias en CI/CD: integrado mediante API compatible con OpenAI, puede recibir el diff de un pull request junto con el contexto de los ficheros afectados y devolver comentarios estructurados, ademas de invocar herramientas de linting o tests dentro del propio flujo de revision.
- Agentes autonomos de tareas multi-paso: para flujos que requieren decenas de llamadas a herramientas (busqueda, ejecucion, consulta de APIs, verificacion) el modelo mantiene el estado del workflow en contexto y decide el siguiente paso, lo que encaja en orquestadores tipo SWE-agent.
- Analisis de documentacion financiera extensa: procesamiento de informes anuales, prospectos y estados financieros de cientos de paginas, combinando razonamiento cuantitativo con la extraccion de datos de tablas y graficos presentes en los documentos e imagenes adjuntas.
- Generacion de informes profesionales estructurados: a partir de PDFs, capturas de dashboards y videos de presentaciones, el modelo produce analisis con estructura definida, apoyandose en su entrada multimodal.
- Atencion al cliente especializada en productos financieros: conversaciones multi-turno con historial largo, acceso a herramientas internas de consulta de cuentas o productos y necesidad de mantener coherencia factual en un dominio regulado.
- Desarrollo frontend asistido por capturas de pantalla: al aceptar imagenes, puede recibir un mockup o una captura de una interfaz y generar o modificar el codigo correspondiente, verificando el resultado en un bucle de iteracion.
- Extraccion y normalizacion de datos a partir de video o capturas: transcripcion de contenido visual a texto estructurado en contextos donde la fuente no es textual.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de evaluacion, pero los valores numericos no forman parte de la informacion textual proporcionada. Se indica lo siguiente sobre la metodologia:

- Ajustes de inferencia recomendados: `temperature=1.0`, `top_p=0.95`, `top_k=0`.
- Los resultados mostrados corresponden al ajuste de razonamiento "High".
- Las puntuaciones de GDPval-AA v2.1 proceden de Artificial Analysis con fecha de 20 de septiembre de 2026.
- Las evaluaciones DeepSWE v1.1 se realizan con el harness de SWE-agent con `temperature=1.0` y `top_p=0.95`.

No se han publicado resultados de benchmarks con valores numericos en la informacion disponible, por lo que no se incluye tabla comparativa de rendimiento.

## Requisitos de hardware

Las configuraciones de despliegue documentadas por el autor son las siguientes:

| Framework | Precision | Hardware | Paralelismo | Interfaz |
|---|---|---|---|---|
| vLLM | FP8 | Un nodo B300, 4 GPU | TP4, TEP4 o DEP4 | API compatible con OpenAI |
| vLLM | FP8 | Un nodo H200, 8 GPU | TP8, TEP8 o DEP8 | API compatible con OpenAI |
| vLLM | BF16 | Un nodo B300, 8 GPU | TP8, TEP8 o DEP8 | API compatible con OpenAI |
| vLLM | BF16 | Dos nodos H200, 16 GPU | TP16, TEP16 o DEP16 | API compatible con OpenAI |
| SGLang | FP8 | Un nodo B300, 4 GPU | TP4 / EP4 | API compatible con OpenAI |
| SGLang | FP8 | Un nodo H200, 8 GPU | no disponible (tabla truncada) | API compatible con OpenAI |
| Transformers | FP8 | Un nodo H200, 8 GPU | TP8 / EP8 | Generacion offline |
| Transformers | BF16 | Dos nodos H200, 16 GPU | TP16 / EP16 | Generacion offline |

Notas adicionales:

- Con 604.339.504.832 parametros, el checkpoint BF16 requiere aproximadamente 1,2 TB de memoria de pesos, de ahi que el autor prescriba 8 GPU B300 o 16 GPU H200 en BF16. La variante FP8 reduce el requisito a la mitad, unos 600 GB, lo que explica la configuracion de 4 GPU B300.
- No cabe en GPU de consumo (RTX 4090, 5090 ni similares); se trata de un despliegue de centro de datos con paralelismo de tensor y/o de expertos.
- Opciones de despliegue soportadas: vLLM y SGLang con API compatible con OpenAI, y Transformers para generacion offline.
- No se proporcionan datos de latencia ni de throughput (tokens por segundo) en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks numericos de Step 5 Preview en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable con alternativas de la misma categoria (por ejemplo, otros MoE de gran escala con cientos de miles de millones de parametros y decenas de miles de millones activos). La comparacion se limita a caracteristicas declaradas:

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Step 5 Preview | 600B / 27B | Hasta 1M tokens | `other` | Pesos en HuggingFace (FP8 y BF16), ModelScope, API propia |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Se trata de una version "Preview": la model card no garantiza estabilidad de comportamiento ni paridad con la version final del modelo.
- No se especifican en la informacion disponible los idiomas soportados, el comportamiento fuera del ingles o el castellano, ni el grado de cobertura multilingue.
- No se documentan sesgos conocidos ni resultados de evaluaciones de seguridad en el material proporcionado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En tareas financieras y de generacion de informes, cualquier salida debe verificarse contra la fuente, especialmente cuando el modelo opera como agente con acceso a herramientas.
- La licencia es de tipo `other` y no se incluye el texto en la informacion proporcionada; es imprescindible revisar `LICENSE.txt` en el repositorio antes de cualquier uso comercial, ya que podria contener restricciones de despliegue, atribucion o uso aceptable.
- El requisito de hardware es muy elevado (minimo 4 GPU B300 o 8 GPU H200 en FP8), lo que excluye el despliegue en infraestructura de consumo y limita el uso on-premise a organizaciones con clusters de centro de datos.
- El repositorio ocupa 650,3 GB, por lo que la descarga y el almacenamiento requieren planificacion previa.
- La model card indica que es necesario usar builds de framework con soporte especifico para Step 5 Preview; versiones genericas de vLLM, SGLang o Transformers podrian no cargar el modelo correctamente o no habilitar razonamiento, tool calling y decodificacion especulativa.
- Existe una discrepancia menor en la propia model card: la introduccion menciona entrada de video, mientras que la tabla de especificaciones solo lista texto e imagen. Conviene validar el soporte real de video en la documentacion oficial.
- La tabla de despliegue proporcionada esta truncada en la fila de SGLang con 8 GPU H200, por lo que esa configuracion concreta queda como no disponible.

## Enlaces

- Modelo en HuggingFace (FP8): https://huggingface.co/stepfun-ai/Step-5-Preview
- Modelo en HuggingFace (BF16): https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Licencia: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt
- Modelo en ModelScope (FP8): https://modelscope.ai/models/stepfun-ai/Step-5-Preview
- Modelo en ModelScope (BF16): https://modelscope.ai/models/stepfun-ai/Step-5-Preview-BF16
- Pagina del modelo en StepFun: https://www.stepfun.com/step-5-preview
- Documentacion de la plataforma: https://platform.stepfun.ai/docs/en/guides/models/step-5-preview
- Plataforma de API: https://platform.stepfun.ai/
- Artificial Analysis (fuente de GDPval-AA v2.1): https://artificialanalysis.ai/
- Harness SWE-agent (usado en DeepSWE v1.1): https://github.com/SWE-agent/SWE-agent
