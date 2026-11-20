# SZLHOLDINGS/salad-ring-ouro-l125

## Resumen

`salad-ring-ouro-l125` es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de recibo (receipts). El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de la factoría interna del autor, pero la model card no expone ninguna especificación tecnica del mismo.

La informacion publica disponible es practicamente nula en lo que respecta a arquitectura, tamano, datos de entrenamiento, tokenizador o rendimiento. La model card se limita a describir la infraestructura de auditoria del autor (graficos SVG generados de forma determinista, etiquetas MEASURED/REPORTED/UNKNOWN, ficheros de recibo) y declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no este en los receipts debe considerarse UNKNOWN.

Por tanto, esta ficha se redacta con la informacion disponible y marca como "no disponible" todos aquellos parametros que el autor no ha publicado. Es relevante ahora unicamente como ejemplo de publicacion con enfasis en procedencia y auditabilidad, no como modelo evaluable para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante, ni tampoco el numero de parametros, la longitud de contexto nativa o el tokenizador empleado.

Respecto al entrenamiento, el autor declara que las afirmaciones sobre entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro de la malla del estate, y que cualquier dato no receiptado en la propia card debe considerarse UNKNOWN. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares. La unica innovacion declarada es de tipo organizativo: generacion determinista de tarjetas y graficos SVG a partir de una instantanea de auditoria con fecha (2026-11-20T03:48:04Z, etiquetada MEASURED).

## Capacidades

- No se ha documentado ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas, vision, audio) en la informacion disponible.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues.
- No se declaran modos especiales (thinking mode, vision, audio, decodificacion especulativa).
- La unica capacidad verificable es la de publicacion con trazabilidad: receipts y etiquetas MEASURED/REPORTED/UNKNOWN sobre los datos del estate.

## Casos de uso

- Auditoria de procedencia de modelos: el repositorio puede usarse como ejemplo de publicacion con receipts y etiquetas de estado, util para equipos que disenan pipelines de gobernanza de modelos.
- Evaluacion de infraestructura de model cards: sirve para probar herramientas que parsean model cards con secciones no estandar (Identity, Evidence, Honesty).
- Docencia sobre publicacion responsable: util como caso de estudio de una card que declara explicitamente UNKNOWN en lugar de inventar metricas.
- Integracion en un registro interno de artefactos: el identificador y la fecha de auditoria permiten indexarlo como artefacto trazable dentro de un catalogo corporativo.
- Pruebas de pipelines de descarga y validacion de repos de Hugging Face: al no tener pesos publicos declarados, sirve para testear el manejo de repos "vacios" o solo documentales.
- Referencia para diseno de esquemas de receipts: el formato de la card (card id, capture time, weaver version) puede inspirar esquemas propios de metadatos.

No se recomienda su uso en escenarios de inferencia, generacion de codigo, atencion al cliente ni ninguna tarea de NLP, porque no hay evidencia de que contenga pesos utilizables ni de que haya sido evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguno en la card.

## Requisitos de hardware

- VRAM estimada: no disponible (no se conocen parametros ni formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara ningun formato de pesos servible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se ha publicado el tamano, la arquitectura ni la tarea del modelo. Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede evaluar idoneidad, coste ni calidad.
- Licencia no declarada: no hay base legal explicita para uso comercial ni para redistribucion.
- Idiomas no declarados: no se puede asumir cobertura multilingue.
- Sin benchmarks ni evaluaciones publicadas: cualquier afirmacion de rendimiento seria inventada.
- Riesgo de alucinacion: no evaluable al no conocerse el modelo; en cualquier caso, al no haber pesos documentados, no procede su uso en produccion.
- La model card esta centrada en la infraestructura de gobernanza del autor, no en el modelo en si; conviene tratar el repositorio como artefacto documental hasta que se publiquen receipts y pesos.
- Fecha de creacion y actualizacion en 2026: verificar la vigencia del repositorio antes de cualquier integracion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l125
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards (referenciado): https://github.com/szl-holdings/estate-cards
