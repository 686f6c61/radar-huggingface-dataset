# SZLHOLDINGS/szl-provenance-native-v1-lora

## Resumen

`szl-provenance-native-v1-lora` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face, etiquetado como un adaptador LoRA (por el sufijo `-lora` en el identificador) dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo auditables). El repositorio se creo el 15 de noviembre de 2026 y se actualizo el 22 de noviembre de 2026, cuenta con 0 descargas y 0 likes, y su tamano declarado es de 0.0 GB.

La model card no proporciona informacion tecnica sustantiva: no se especifica el modelo base sobre el que se aplica el adaptador, ni la arquitectura, ni el numero de parametros, ni la longitud de contexto, ni los idiomas soportados, ni la licencia. El unico tag tecnico presente es `safetensors`, lo que indica que los pesos se distribuyen en ese formato, y el tag `region:us` de caracterizacion geografica del repositorio.

La relevancia de esta ficha es limitada y fundamentalmente negativa: se trata de un artefacto sin evidencia medida publicada. La propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion "vive en sus ficheros de recibo" y que lo que no este receipted es "UNKNOWN". La seccion RECEIPTS confirma que no existe un `DONE.json` estricto (estado `RECEIPT_FILES_NO_DONE`) y que la evidencia de evaluacion es desconocida. En consecuencia, no es posible evaluar el modelo ni recomendarlo para produccion con la informacion disponible.

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
| Formato de pesos | safetensors (unico formato declarado via tag) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. El identificador incluye el sufijo `-lora`, lo que sugiere que el artefacto es un adaptador de bajo rango (Low-Rank Adaptation) pensado para aplicarse sobre un modelo base, pero la model card no identifica cual es ese modelo base, ni el rango del adaptador, ni las capas objetivo, ni la configuracion de entrenamiento.

Respecto a los datos de entrenamiento, la model card no aporta numero de tokens, composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica referencia a evidencia remite a "receipt files" del "estate mesh" del autor, que no estan enlazados de forma verificable en la informacion disponible. La seccion RECEIPTS indica que los ficheros con nombre de recibo encontrados (`assets/szl-card/mesh-receipts.svg`) son coincidencias por palabra clave y no estan validados como evidencia, y que no existe un `DONE.json` en el umbral estricto. Por tanto, no hay innovacion tecnica documentada ni datos de entrenamiento verificables.

## Capacidades

- No se declara ninguna capacidad concreta en la model card.
- No hay informacion sobre generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay informacion sobre soporte de tool calling o function calling.
- No hay informacion sobre capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues ni idiomas cubiertos.
- No hay informacion sobre modos especiales (thinking mode, vision, audio).
- El unico dato funcional implicito es que, al ser un adaptador LoRA en formato safetensors, su uso previsto seria la aplicacion sobre un modelo base no identificado.

## Casos de uso

No es posible proponer casos de uso concretos y realistas con la informacion disponible, ya que se desconocen el modelo base, el dominio de entrenamiento, la licencia y cualquier evaluacion de calidad. A continuacion se indican los escenarios que requeririan verificacion previa y por que no pueden validarse:

- Aplicacion como adaptador de dominio sobre un modelo base: requeriria conocer el modelo base exacto y la compatibilidad de arquitectura; no disponible.
- Ajuste fino de estilo o formato de salida: requeriria evidencia de que el adaptador fue entrenado para esa tarea; no disponible.
- Integracion en pipelines de generacion aumentada (RAG): requeriria conocer contexto maximo y calidad de instruccion; no disponible.
- Despliegue en produccion con vLLM o TGI: requeriria conocer el modelo base y los pesos completos fusionados; no disponible.
- Uso comercial: requeriria una licencia explicita; no disponible.
- Evaluacion comparativa interna: requeriria benchmarks medidos; la model card declara la evidencia de evaluacion como UNKNOWN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara de forma explicita que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y la seccion RECEIPTS clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el modelo base y el tamano del adaptador).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; al ser un adaptador LoRA en safetensors, su despliegue dependeria del framework del modelo base (no identificado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable porque se desconocen el modelo base, el tamano, el contexto y el rendimiento. A modo de contexto estructural, se compara unicamente la informacion declarada:

| Aspecto | szl-provenance-native-v1-lora | Alternativa comparable |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | no disponible (evidencia UNKNOWN) | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | 0 descargas, 0 likes | no disponible |

## Limitaciones y advertencias

- Ausencia total de evidencia medida: la model card declara la evaluacion como UNKNOWN y no existe `DONE.json` en el umbral estricto del propio autor.
- Modelo base no identificado: al ser un adaptador LoRA, sin conocer el modelo base no puede aplicarse ni reproducirse.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni para redistribucion; tratar como no apto para produccion hasta verificacion.
- Idiomas no declarados: no puede asumirse cobertura multilingue.
- Riesgo de alucinacion y sesgos: no evaluable sin benchmarks ni documentacion de datos de entrenamiento.
- Repositorio sin traccion: 0 descargas y 0 likes, sin senales de uso o validacion por la comunidad.
- Ficheros de recibo no validados: los SVG de recibos presentes son coincidencias por palabra clave, no evidencia auditada.
- Fecha de creacion futura respecto a la mayoria de referencias habituales (2026), lo que exige verificacion adicional de procedencia.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-provenance-native-v1-lora
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de tarjetas (referenciado): https://github.com/szl-holdings/estate-cards
