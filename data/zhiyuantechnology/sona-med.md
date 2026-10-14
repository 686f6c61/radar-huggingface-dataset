# zhiyuantechnology/sona-med

## Resumen

Sona Med es un modelo de lenguaje especializado en ambito clinico, publicado por el usuario zhiyuantechnology en HuggingFace bajo licencia Apache 2.0. Segun la propia ficha del repositorio, se trata del modelo que Sona AI utiliza para razonamiento clinico y para generar respuestas fundamentadas en el historial del paciente, y constituye el motor principal detras de los productos Sona Pro y Sona Care. El modelo esta pensado, por tanto, para desplegarse en entornos asistenciales donde la respuesta debe apoyarse en la informacion del registro clinico del paciente mas que en conocimiento generico.

Tecnicamente, Sona Med es un ajuste derivado de cyankiwi/gemma-4-26B-A4B-it-qat-AWQ-INT4, una variante cuantizada en INT4 mediante AWQ y entrenamiento consciente de cuantizacion (QAT) de la familia Gemma 4. El repositorio contiene 25.805.936.206 parametros totales (aproximadamente 25,8 mil millones) en formato safetensors con compresion tipo compressed-tensors, y ocupa 17,2 GB. El sufijo "A4B" del modelo base sugiere una arquitectura de mezcla de expertos con del orden de 4.000 millones de parametros activos por token, aunque este dato no aparece confirmado de forma explicita en la informacion disponible.

Su relevancia actual radica en que representa un caso de modelo vertical de dominio medico construido sobre un modelo generalista cuantizado, con acceso restringido (gated) en HuggingFace, lo que obliga a aceptar condiciones de uso antes de descargarlo. No se han publicado datos de benchmarks, idiomas soportados ni longitud de contexto en la informacion disponible, lo que limita cualquier evaluacion cuantitativa previa a su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (variante MoE segun el sufijo A4B del modelo base; no confirmado en la ficha) |
| Parametros totales | 25.805.936.206 (aprox. 25,8 mil millones) |
| Parametros activos | Aproximadamente 4.000 millones (inferido del sufijo A4B del modelo base; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 AWQ con compressed-tensors (heredado del modelo base); no se listan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 17,2 GB |
| Modelo base | cyankiwi/gemma-4-26B-A4B-it-qat-AWQ-INT4 |
| Fecha de publicacion | 14 de octubre de 2026 |
| Ultima actualizacion | 14 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Sona Med es un modelo derivado por ajuste (fine-tuning) sobre cyankiwi/gemma-4-26B-A4B-it-qat-AWQ-INT4, que a su vez es una version cuantizada en INT4 AWQ del modelo Gemma 4 en su variante de 26B con aproximadamente 4B de parametros activos (nomenclatura A4B) e instruccion afinada (it). La cuantizacion se ha realizado con entrenamiento consciente de cuantizacion (QAT), lo que en teoria preserva mejor la calidad que una cuantizacion post-entrenamiento pura, y los pesos se distribuyen en formato compressed-tensors, un esquema de safetensors con metadatos de compresion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset clinico, la existencia de fases de RLHF, DPO u otros metodos de alineamiento, ni sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). Del nombre del modelo base se deduce que hereda el pipeline de instruccion y cuantizacion de Gemma 4, pero no hay confirmacion explicita en la informacion proporcionada. La etiqueta "medical" y la descripcion de la ficha indican que el ajuste persigue el razonamiento clinico y las respuestas ancladas al registro del paciente, sin que se detalle la metodologia empleada para conseguirlo.

## Capacidades

- Generacion de texto orientada a razonamiento clinico: la ficha indica que el modelo se usa para razonamiento clinico y respuestas fundamentadas en el historial del paciente.
- Respuestas ancladas al contexto del paciente (grounded generation sobre el registro clinico), segun la descripcion oficial.
- Generacion de texto general y seguimiento de instrucciones, heredado de la variante instruction-tuned del modelo base.
- Capacidad de razonamiento en varios pasos: no confirmada explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas en la ficha.
- Capacidades multimodales (vision, audio): no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Razonamiento clinico asistido: el modelo esta disenado especificamente para este proposito segun la ficha, de modo que puede emplearse como motor de sugerencias diagnosticas diferenciales a partir de la informacion estructurada del paciente, siempre con supervision profesional.
- Generacion de respuestas fundamentadas en el historial del paciente: al ser el modelo detras de Sona Pro y Sona Care, encaja en flujos de preguntas y respuestas donde la respuesta debe citar o apoyarse en el registro clinico y no en conocimiento general.
- Resumen de notas clinicas e historiales largos: util para condensar evoluciones, informes de alta y notas de seguimiento en resumenes manejables por el personal sanitario.
- Apoyo a la codificacion clinica: extraccion de diagnosticos y procedimientos a partir de texto libre para su mapeo posterior a sistemas de codificacion (CIE/ICD), como paso previo a la revision humana.
- Triage y clasificacion de urgencia: clasificacion de sintomas y signos recogidos en admision para priorizar la atencion, siempre como sistema de apoyo y no de decision autonoma.
- Asistencia documental para profesionales: redaccion de borradores de informes, cartas de derivacion o instrucciones para el paciente a partir de datos ya registrados.
- Busqueda conversacional sobre registros clinicos: interfaz de consulta en lenguaje natural sobre historiales electronicos, apoyandose en la capacidad del modelo para responder condicionado al contexto del paciente.
- Integracion en productos sanitarios verticales: dado que ya es el motor de Sona Pro y Sona Care, puede reutilizarse como componente de inferencia en despliegues similares bajo licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de valores de MMLU, HumanEval, GSM8K, MedQA, MedMCQA ni de ninguna otra prueba estandar, ni de comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,8 mil millones de parametros en INT4, los pesos ocupan aproximadamente 13 GB. Sumando cache KV, activaciones y overhead del runtime, es razonable prever entre 16 y 20 GB en funcion de la longitud de contexto (valor no confirmado en la ficha).
- GPU consumer: el modelo deberia caber en tarjetas de 24 GB, como RTX 3090, RTX 4090 o RTX 5090, asi como en configuraciones de 32 GB o mas. En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el encaje es ajustado y dependera del contexto.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares son suficientes y dejan margen para contextos largos y lotes mayores.
- Opciones de despliegue: el formato compressed-tensors con cuantizacion AWQ INT4 es compatible con motores como vLLM, que soporta este esquema de cuantizacion. No se confirma compatibilidad con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al tratarse, segun el nombre del modelo base, de una arquitectura con aproximadamente 4B de parametros activos, cabria esperar un coste de decodificacion propio de un modelo denso de ese tamano, pero no hay mediciones publicadas.
- Almacenamiento: 17,2 GB en disco para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sona Med | 25,8 mil millones (aprox. 4B activos, inferido) | no disponible | INT4 AWQ (compressed-tensors) | Apache 2.0 | Acceso restringido (gated) |
| cyankiwi/gemma-4-26B-A4B-it-qat-AWQ-INT4 (modelo base) | 25,8 mil millones (aprox. 4B activos, inferido) | no disponible | INT4 AWQ | no disponible | no disponible |
| Gemma 4 26B A4B it (modelo original de la familia) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos medicos abiertos de la competencia (Meditron, MedGemma, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos que permitan establecer una jerarquia objetiva frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Dominio clinico de alto riesgo: cualquier salida del modelo debe ser revisada por personal sanitario cualificado; no esta destinado a diagnostico o tratamiento autonomo sin supervision profesional.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir afirmaciones plausibles pero incorrectas sobre diagnostico, dosis o interacciones farmacologicas. No se han publicado evaluaciones de fidelidad clinica.
- Ausencia de benchmarks verificables: no hay datos publicados de MMLU, MedQA ni de ninguna otra prueba, lo que impide validar sus capacidades de forma objetiva.
- Idiomas no declarados: la ficha no lista idiomas soportados, por lo que el comportamiento en castellano no esta garantizado.
- Longitud de contexto desconocida: no se puede planificar el procesamiento de historiales extensos sin conocer la ventana real del modelo.
- Acceso restringido: el repositorio esta gated y exige aceptar condiciones en HuggingFace, lo que puede limitar su uso en determinados entornos y auditorias.
- Naturaleza derivada: al ser un ajuste sobre un modelo cuantizado en INT4, puede heredar las perdidas de calidad propias de la cuantizacion, aunque el modelo base emplee QAT para mitigarlas.
- Procedencia y trazabilidad: no se documentan los datos de ajuste ni el proceso de alineamiento, lo que dificulta evaluar sesgos ni cumplimiento normativo en el ambito sanitario.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso gated anade condiciones adicionales que deben revisarse antes de desplegarlo en produccion.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin historial de uso que respalde su fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhiyuantechnology/sona-med
- Modelo base: https://huggingface.co/cyankiwi/gemma-4-26B-A4B-it-qat-AWQ-INT4
