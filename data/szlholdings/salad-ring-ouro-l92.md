# SZLHOLDINGS/salad-ring-ouro-l92

## Resumen

salad-ring-ouro-l92 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados verificables y trazables. El repositorio se presenta como un modelo entrenado ("trained artifact in the governed factory"), pero la model card no aporta ninguna especificacion tecnica sobre la arquitectura, el tamano, el contexto o los datos de entrenamiento.

La informacion disponible es practicamente nula en terminos tecnicos: no se declara licencia, no se listan idiomas, no hay pipeline asociado y el repositorio acumula cero descargas y cero likes desde su creacion el 19 de noviembre de 2026. La propia model card reconoce explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no aparezca en sus ficheros de recibos ("receipts") debe considerarse desconocida (UNKNOWN).

El dato mas relevante es que la seccion RECEIPTS del autor clasifica este repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo, pero no hay un DONE.json estricto con estado MEASURED, codigo de salida de evaluacion cero y marcas de tiempo. En consecuencia, no hay evidencia medida de calidad ni de capacidades. Esta ficha documenta lo que se puede afirmar con rigor y marca el resto como no disponible.

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

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un diseno hibrido. Tampoco se indica el numero de parametros, la longitud de contexto nativa ni la tokenizacion empleada.

Respecto al entrenamiento, la organizacion remite a los ficheros de recibos del "estate mesh" para cualquier afirmacion sobre datos, numero de tokens o tecnicas de alineacion (RLHF, DPO). El escaneo estricto de recibos del 22 de noviembre de 2026 clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombres de recibo (assets/szl-card/mesh-receipts.svg) pero no cumplen el umbral estricto de evidencia medida. No se declara ninguna innovacion tecnica como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto: no disponible; no se documenta ninguna capacidad concreta.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Modo de pensamiento (thinking mode) u otras capacidades especiales: no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos para este modelo porque no se ha publicado ninguna especificacion tecnica, capacidad medida ni licencia que permita evaluar su idoneidad. Cualquier escenario de produccion (atencion al cliente, generacion de codigo, extraccion de informacion, clasificacion, agentes) requeriria conocer como minimo el tamano del modelo, la longitud de contexto, los idiomas soportados y las condiciones de licencia, y ninguno de estos datos esta disponible en la informacion proporcionada.

A modo de orientacion general para artefactos sin documentacion tecnica, los pasos previos razonables serian: inspeccionar los ficheros de pesos del repositorio para determinar el formato y el tamano, revisar los recibos citados en el estate mesh de la organizacion, y contactar con el autor para obtener la licencia y las condiciones de uso antes de plantear cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se declara ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos del 22 de noviembre de 2026 marca la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; se desconoce el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma el formato de los pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse la arquitectura, el tamano, la licencia ni el rendimiento del modelo, no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se documentan arquitectura, parametros, contexto, tokenizador ni formato de pesos.
- Sin evidencia de evaluacion: el propio autor clasifica el repositorio como RECEIPT_FILES_NO_DONE, sin DONE.json estricto con estado MEASURED.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido, lo que constituye un riesgo legal directo para cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluables sin benchmarks ni documentacion de datos de entrenamiento.
- Senales de trazabilidad debiles: cero descargas, cero likes y una model card generada de forma automatica por una herramienta interna ("estate-cards weaver"), sin contenido tecnico sustantivo.
- Nomenclatura no descriptiva: el nombre "salad-ring-ouro-l92" no aporta informacion sobre familia, tamano ni proposito del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l92
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Herramienta de generacion de fichas citada: https://github.com/szl-holdings/estate-cards
