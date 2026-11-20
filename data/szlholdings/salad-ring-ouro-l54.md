# SZLHOLDINGS/salad-ring-ouro-l54

## Resumen

`salad-ring-ouro-l54` es un artefacto de modelo publicado por SZLHOLDINGS bajo su iniciativa "governed-AI estate", una coleccion de modelos, datasets y Spaces con resultados verificables y trazabilidad a la fuente. El repositorio de Hugging Face no incluye model card tecnica en sentido estricto: el README es una plantilla generada automaticamente por la herramienta `estate-cards weaver` (v0.1.0), con graficos SVG deterministas y etiquetas de evidencia `MEASURED`/`REPORTED`/`UNKNOWN`.

La informacion publica no especifica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El propio autor declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion "vive en sus ficheros de recibo" (receipt files) del mesh del estate, y que lo no registrado alli es `UNKNOWN`. El nombre del repositorio sugiere un identificador interno (`ouro-l54`) sin correspondencia documentada con una familia de modelos conocida.

Por tanto, esta ficha se limita a documentar lo verificable: existencia del artefacto, autoria, fechas, ausencia de metricas publicadas y las advertencias que ello implica para cualquier evaluacion o uso en produccion. No es posible determinar en este momento si el modelo es utilizable, que tarea resuelve ni con que calidad.

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

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) en la model card ni en los metadatos del repositorio de Hugging Face. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

La unica referencia tecnica es la mencion a "receipt files" del estate mesh de SZLHOLDINGS, que segun el autor contendrian las afirmaciones de entrenamiento y evaluacion. Estos ficheros no se enlazan de forma directa en la model card proporcionada, por lo que no es posible verificar ningun dato de entrenamiento desde la informacion disponible.

## Capacidades

- No se documenta ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas, vision, audio) en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin conocer la arquitectura, el tamano, el contexto, los idiomas ni las capacidades del modelo. Cualquier escenario que se describiera seria especulativo y contravendria la regla de no inventar datos. Los unicos escenarios plausibles a dia de hoy son de caracter interno:

- Auditoria del estate SZLHOLDINGS: inspeccionar los receipt files del mesh para determinar que afirmaciones estan etiquetadas como `MEASURED` y con que fecha de captura (2026-11-20T03:48:04Z segun la card).
- Verificacion de procedencia: comprobar la correspondencia entre el repositorio de Hugging Face y la organizacion canonica en GitHub (`szl-holdings`) antes de cualquier uso.
- Reproduccion de la card: regenerar la model card con `estate-cards weaver` v0.1.0 para validar que los SVG son deterministas y que el identificador de card (`0d9ecb363651409e`) coincide.
- Evaluacion controlada en laboratorio: solo tras obtener los pesos y la licencia, ejecutar pruebas de humo (perplejidad, generacion basica) para caracterizar el artefacto.
- Trazabilidad de linaje: cruzar el identificador `ouro-l54` con otros artefactos del estate para reconstruir la cadena de entrenamiento.
- Uso docente: como ejemplo de model card generada automaticamente y de las limitaciones de la documentacion automatizada en la evaluacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara: "No benchmark number is asserted on this card beyond what a dated audit measured", y no se incluye ningun valor medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la categoria, el tamano ni la tarea del artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l54 | no disponible | no disponible | no disponible | Repo HF sin descargas ni likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se declaran arquitectura, parametros, contexto, idiomas ni licencia.
- Cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.
- La model card es una plantilla generada automaticamente; no contiene afirmaciones sustantivas sobre el modelo mas alla de la metadata del estate.
- El autor remite a "receipt files" externos no enlazados directamente; sin acceso a ellos, todas las afirmaciones sobre entrenamiento y evaluacion son `UNKNOWN`.
- Licencia no disponible: no puede asumirse uso comercial ni redistribucion.
- Riesgo de alucinacion y sesgos: no evaluables sin pesos ni evaluaciones publicadas.
- El identificador `ouro-l54` no se corresponde con ninguna familia de modelos publica conocida, lo que impide inferir caracteristicas por analogia.
- Fechas de creacion y actualizacion (2026-11-18 y 2026-11-20) situadas en el futuro respecto a la mayoria de referencias actuales; conviene verificar la integridad del repositorio antes de cualquier uso.
- No apto para produccion sin una evaluacion independiente previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l54
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion canonica en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
