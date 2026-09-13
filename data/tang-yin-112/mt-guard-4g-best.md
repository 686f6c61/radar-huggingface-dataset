# Tang-yin-112/mt-guard-4g-best

## Resumen

mt-guard-4g-best es un modelo especializado en deteccion de alucinaciones (groundedness) desarrollado por el usuario Tang-yin-112 como submission para la arena "guard / mt-4g" de Microtensor. Se trata de un fine-tune con LoRA de `meta-llama/Llama-3.2-3B-Instruct` (commit `0cb88a4f764b7a12671c53f0838cd831a0843b95`) sobre el split de entrenamiento del dataset RAGTruth (run v3, seleccionado sobre run1 y v2 en datos de validacion). El resultado se fusiona y cuantiza a GGUF Q4_K_M, ocupando 2,02 GB.

La tarea del modelo es concreta: dada una fuente (pasaje de contexto) y una afirmacion, devuelve un objeto JSON `{"unsupported": [...]}` con los fragmentos no soportados copiados de forma literal, o una lista vacia si la afirmacion queda respaldada. Es, por tanto, una herramienta de verificacion factual pensada para integrarse como guardrail en pipelines RAG o de generacion aumentada.

Su relevancia radica en el enfoque: en lugar de un clasificador binario, produce span-level attribution (devolucion verbatim de los tramos no soportados), lo que facilita la trazabilidad y la auditoria de respuestas. El modelo tiene 3.212.749.888 parametros y hereda la arquitectura y ventana de contexto de Llama 3.2 3B Instruct. No cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2 3B Instruct), fine-tune con LoRA |
| Parametros totales | 3.212.749.888 (~3,21 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredada del modelo base (no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (publicada); version fusionada en bf16 para evaluacion |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (Q4_K_M), safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder denso de aproximadamente 3,21 mil millones de parametros, y se adapta mediante LoRA sobre el split de entrenamiento de RAGTruth (run v3). Posteriormente, el adaptador se fusiona con el modelo base y se cuantiza a GGUF Q4_K_M. No se documentan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del ajuste supervisado sobre RAGTruth.

La innovacion principal reside en la formulacion de la tarea: el modelo no responde con una etiqueta binaria de "alucinacion si/no", sino que genera una estructura JSON con los spans no soportados copiados literalmente del texto evaluado. Esto obliga al modelo a una atribucion a nivel de fragmento y permite verificar de forma directa que el tramo senalado existe de manera textual en la afirmacion analizada. La seleccion del run v3 sobre versiones previas se realizo mediante evaluacion en datos held-out.

## Capacidades

- Deteccion de alucinaciones: identifica afirmaciones o fragmentos no respaldados por una fuente dada.
- Atribucion a nivel de span: devuelve los tramos no soportados copiados de forma literal, no parafraseados.
- Salida estructurada: genera JSON con la clave `unsupported` (lista, posiblemente vacia).
- Verificacion de groundedness en contextos RAG: comparacion entre pasaje fuente y respuesta generada.
- Comportamiento conversacional (etiqueta `conversational` en HuggingFace).
- Compatible con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades de vision, audio o thinking mode: no disponibles.

## Casos de uso

- Guardrail en pipelines RAG: colocado tras el generador, recibe el contexto recuperado y la respuesta producida, y devuelve los spans no soportados para bloquear o marcar la salida antes de mostrarla al usuario.
- Verificacion de resumenes automaticos: dado un documento fuente y un resumen, el modelo senala las frases del resumen que no tienen respaldo en el original, util para control de calidad en redaccion automatizada.
- Auditoria de respuestas en atencion al cliente: en flujos con base de conocimiento, comprueba que las respuestas generadas sobre politicas, plazos o precios se apoyan en los articulos recuperados.
- Evaluacion automatica de datasets: generacion de etiquetas de atribucion para construir o ampliar conjuntos de datos de deteccion de alucinaciones a partir de pares (fuente, afirmacion).
- Moderacion factual en publicacion de contenidos: filtrado previo de textos generados por otros modelos antes de su difusion, con trazabilidad de los fragmentos problematicos.
- Extraccion de afirmaciones no verificadas en informes: integrado en un pipeline de revision documental, ayuda a un revisor humano a localizar rapidamente los puntos que requieren comprobacion manual.
- Control de calidad en generacion de noticias o articulos asistidos: contraste entre borrador y fuentes citadas, senalando frases sin respaldo.

## Benchmarks y rendimiento

| Medicion | Valor |
|---|---|
| F2 en held-out (bf16) | 0,6109 |
| F2 proyectado en la mezcla evaluada | 0,6829 |
| F2 con GGUF Q4_K_M (24 tareas, un hilo) | 0,4407 |
| Velocidad de prompt / generacion, un hilo | 18,6 / 6,3 tok/s |
| TTFT / total a 1536 tokens declarados | 39.546 / 40.316 ms |
| Tamano del artefacto | 2,02 GB |

No se han publicado en la informacion disponible comparaciones con otros modelos de deteccion de alucinaciones (por ejemplo, metricas frente a clasificadores dedicados o frente al propio Llama 3.2 3B Instruct sin ajuste).

## Requisitos de hardware

- VRAM estimada para inferencia en GGUF Q4_K_M: en torno a 2,5-3 GB, dado que el artefacto pesa 2,02 GB.
- VRAM estimada en bf16: aproximadamente 6,5-7 GB (3,21 mil millones de parametros a 2 bytes por parametro mas overhead).
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en bf16, y en practicamente cualquier GPU con 4 GB o mas usando la cuantizacion Q4_K_M (RTX 3060, RTX 4060, RTX 4090, etc.). Tambien puede ejecutarse en CPU con llama.cpp.
- GPU recomendadas: no se especifican en la informacion; por tamano, cualquier GPU consumer moderna es suficiente. Para despliegue en produccion de alto throughput se requeriria batching y una GPU dedicada.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF); vLLM o TGI para la version bf16; se indica compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput: medidos a un hilo, 18,6 tok/s de prompt y 6,3 tok/s de generacion; TTFT de 39.546 ms a 1536 tokens declarados en la prueba realizada. Estas cifras corresponden a una configuracion de un solo hilo y no reflejan el rendimiento en GPU con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mt-guard-4g-best | 3,21 mil millones | 128.000 tokens (heredado) | llama3.2 | GGUF Q4_K_M, safetensors | Especializado en deteccion de alucinaciones; F2 bf16 0,6109 |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | llama3.2 | safetensors | Modelo base; proposito general, sin ajuste especifico de groundedness |
| Otros modelos de deteccion de alucinaciones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Degradacion por cuantizacion: el F2 cae de 0,6109 en bf16 a 0,4407 con GGUF Q4_K_M, una perdida considerable que conviene tener en cuenta si se usa la version cuantizada en produccion.
- Validacion limitada: el repositorio presenta 0 descargas y 0 likes, por lo que no existe evidencia de uso comunitario ni validacion externa.
- Entrenamiento acotado: el ajuste se realiza sobre RAGTruth train (run v3); no se documenta la cobertura de dominios, idiomas o tipos de alucinacion fuera de ese conjunto.
- Idiomas soportados no documentados: se desconoce el comportamiento fuera del ingles u otros idiomas presentes en RAGTruth.
- Riesgo de alucinacion del propio detector: al ser un modelo de lenguaje ajustado, puede producir spans inexistentes o pasar por alto afirmaciones no soportadas.
- Sensibilidad a la longitud de contexto: las mediciones muestran un TTFT elevado (39,5 s a 1536 tokens en un hilo), lo que puede penalizar su uso en flujos de baja latencia.
- Licencia llama3.2: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia de Llama 3.2, que imponen restricciones y obligaciones de atribucion; conviene revisarla antes de integrarlo en un producto.
- Salida dependiente del formato JSON: la integracion en produccion debe parsear y validar la estructura devuelta, ya que el modelo podria no respetarla en casos limite.
- Fecha de creacion del repositorio inusualmente futura (2026), dato a tener en cuenta por si se trata de un artefacto de prueba o de un repositorio no mantenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tang-yin-112/mt-guard-4g-best
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorios de adaptadores (patron indicado en la model card): `Tang-yin-112/mt-guard-4g-*-lora`
- Ficheros de configuracion y evaluacion citados: `run_config.json`, `evaluation.json` (en el repositorio)
- Las busquedas web realizadas no han devuelto resultados relevantes sobre este modelo; los enlaces encontrados corresponden a entidades no relacionadas (Tang Freres, dinastia Tang, marca de bebida Tang) y se descartan por no ser pertinentes.
