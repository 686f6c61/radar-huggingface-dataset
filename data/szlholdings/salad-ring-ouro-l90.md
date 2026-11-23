# SZLHOLDINGS/salad-ring-ouro-l90

## Resumen

`salad-ring-ouro-l90` es un artefacto entrenado publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo verificables). El modelo se presenta como parte de una fabrica de modelos gobernada, con enfasis en trazabilidad y en no afirmar cifras que no esten respaldadas por una auditoria fechada.

La model card es deliberadamente parca en especificaciones tecnicas: no declara arquitectura, numero de parametros, longitud de contexto, tokenizador, datos de entrenamiento ni idiomas soportados. Toda la informacion cuantitativa se remite a los ficheros de recibo del "estate mesh", y el propio autor indica que cualquier afirmacion no receiptada debe considerarse UNKNOWN (desconocida).

El interes de esta ficha, por tanto, no reside en unas capacidades verificadas —que no se documentan— sino en el patron de publicacion: un modelo con licencia no declarada, sin pipeline asignado, sin descargas ni likes en el momento de la consulta, y con una auditoria estricta que clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, con ficheros de nombre "receipt" presentes pero sin un `DONE.json` estricto que valide evidencia de evaluacion. Cualquier uso en produccion exige verificacion directa en el repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se listan ficheros de pesos en la informacion proporcionada) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura de espacio de estados o un modelo hibrido, ni detalla el tokenizador, la funcion de activacion o el esquema de atencion.

Respecto al entrenamiento, el autor remite explicitamente a los "receipt files" del estate mesh para cualquier afirmacion sobre datos, numero de tokens o proceso de alineacion (RLHF/DPO). La auditoria citada en la propia card, correspondiente a un escaneo estricto del 22 de noviembre de 2026 sobre la familia "salad", clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (concretamente `assets/szl-card/mesh-receipts.svg`), pero no hay un `DONE.json` con `status=MEASURED`, `eval_rc=0` y marca temporal que satisfaga el umbral estricto del estate. En consecuencia, la evidencia de evaluacion se declara UNKNOWN.

## Capacidades

- Generacion de texto: no confirmada; la model card no describe capacidades funcionales.
- Razonamiento, codigo y matematicas: no documentadas.
- Vision, audio o multimodalidad: no documentadas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (el campo de idiomas no esta informado).
- Modo "thinking" o decodificacion extendida: no documentado.
- Trazabilidad de resultados: el autor declara un esquema de recibos verificables, pero la auditoria estricta no los valida como evidencia de calidad.

## Casos de uso

- Evaluacion de gobernanza de modelos: el artefacto puede utilizarse como caso de estudio de un pipeline de publicacion con recibos y auditoria estricta, comparando que se declara frente a que se mide.
- Investigacion sobre reproducibilidad en Hugging Face: sirve para analizar como se estructura una model card generada de forma determinista (SVG con stdlib de Python) y que metadatos acompanan al artefacto.
- Pruebas de integracion de herramientas de escaneo: un repositorio con esta estructura permite validar escaneres que detectan `DONE.json` estrictos y distinguen ficheros con nombre de recibo de evidencia real.
- Auditoria de licencias en cadenas de suministro de IA: al no declararse licencia, el modelo es un ejemplo util para disenar controles que bloqueen la adopcion de artefactos sin terminos de uso explicitos.
- Docencia sobre documentacion tecnica de modelos: la card ilustra el principio de no afirmar cifras sin medicion fechada, con etiquetas MEASURED/REPORTED/UNKNOWN.
- Verificacion de disponibilidad de pesos: permite comprobar si el repositorio contiene realmente ficheros de pesos o solo metadatos y activos graficos, paso previo a cualquier intento de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que la evidencia de evaluacion es UNKNOWN y que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros y el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que existan pesos en formatos compatibles (safetensors, GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de datos de parametros, contexto, rendimiento ni licencia del modelo como para establecer una comparacion fundamentada con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l90 | no disponible | no disponible | no disponible | repositorio Hugging Face sin descargas ni likes en la consulta |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parametros, contexto ni tokenizador, lo que impide estimar coste de inferencia o viabilidad de despliegue.
- Licencia no declarada: sin terminos de uso explicitos no es posible determinar si el uso comercial esta permitido; debe tratarse como no apto para produccion hasta verificacion legal.
- Evidencia de evaluacion UNKNOWN: la auditoria estricta del estate clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, sin `DONE.json` medido; no hay garantia de calidad ni de que el artefacto haya sido evaluado.
- Riesgo de alucinacion y sesgos: no evaluables al no existir informes de evaluacion publicados.
- Idiomas: el campo de idiomas no esta informado, por lo que no puede asumirse soporte de castellano ni de ninguna otra lengua.
- Trazabilidad incompleta: los enlaces a la organizacion en GitHub aparecen mal formados en la model card (`https://github.com/szl-holdings (org)`), lo que dificulta la verificacion en origen.
- Adopcion nula observable: cero descargas y cero likes en el momento de la consulta, sin senales de uso comunitario ni de mantenimiento.
- La card esta generada automaticamente por una herramienta ("estate-cards weaver v0.1.0"), lo que explica su estructura pero no aporta informacion tecnica adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l90
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Herramienta de generacion de cards (estate-cards): https://github.com/szl-holdings/estate-cards
- Organizacion en GitHub (enlace tal como figura en la card, mal formado): https://github.com/szl-holdings (org)
