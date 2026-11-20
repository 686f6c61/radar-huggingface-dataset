# SZLHOLDINGS/receiptagent_v3-candidate_enterprise_20261104

## Resumen

`receiptagent_v3-candidate_enterprise_20261104` es un modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con resultados auditables y trazabilidad documental. El nombre sugiere un agente orientado al procesamiento de recibos y documentos financieros en un contexto empresarial, aunque la model card no explicita la tarea concreta ni el dominio de aplicacion mas alla de esa convencion de nombres. El repositorio es un artefacto de tipo modelo, presumiblemente entrenado dentro del pipeline interno del autor.

La informacion publica disponible es extremadamente limitada. La model card se limita a describir el marco de gobernanza (identidad del repositorio, fuentes canonicas, recibos de auditoria) y declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion no incluida en sus ficheros de recibo debe considerarse desconocida. No se publican parametros, arquitectura, contexto, idiomas, licencia ni resultados de benchmarks. El tamano del repositorio aparece como 0.0 GB, lo que sugiere que los pesos pueden no estar alojados o que la medicion no se ha materializado en el momento de la consulta.

Por tanto, esta ficha documenta lo que el autor declara y marca como "no disponible" todo aquello que no se puede verificar. El modelo tiene 5 descargas y 0 likes en el momento de la consulta, lo que indica una distribucion practicamente nula y sin validacion por parte de la comunidad. Se trata, a efectos practicos, de un artefacto interno o experimental sin evidencia publica de capacidades.

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
| Formato de pesos | safetensors (unico formato declarado en los tags) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. Los tags del repositorio solo indican `safetensors` y `region:us`, sin especificar si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se documenta el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

La model card declara explicitamente que las afirmaciones sobre entrenamiento y evaluacion residen en ficheros de recibo del "estate mesh" del autor, no accesibles desde la propia card. Cualquier dato no receiptado se etiqueta como UNKNOWN. No hay innovaciones tecnicas descritas, ni referencias a decodificacion especulativa, atencion lineal u otras optimizaciones.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- El nombre del modelo sugiere un uso orientado a agentes de procesamiento de recibos o documentos financieros, pero esta inferencia no esta respaldada por ninguna descripcion tecnica publicada.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.
- No se confirma capacidad multilingue.
- No se confirman modos especiales (thinking, vision, audio).

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin informacion verificable sobre arquitectura, tamano, contexto o capacidades. Cualquier escenario que se describiera seria especulativo. Los unicos usos plausibles, derivados exclusivamente del nombre del repositorio, serian:

- Procesamiento de recibos y documentos financieros en un pipeline empresarial interno, si el modelo efectivamente ha sido entrenado para esa tarea; no verificable.
- Experimentacion interna dentro del "estate" de SZLHOLDINGS con fines de auditoria y trazabilidad; no verificable.
- Evaluacion comparativa frente a otros agentes documentales del mismo autor; no verificable.

El resto de casos de uso habituales (atencion al cliente, generacion de codigo, analisis de datos, etc.) no pueden justificarse con la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara de forma explicita que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y que los datos medidos residen en ficheros de recibo no incluidos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el unico dato tecnico es que los pesos, si existen, estarian en formato safetensors, lo que permitiria en principio su carga con librerias como `transformers`, `vLLM` o `TGI` si la arquitectura fuese compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoria, el tamano y la tarea del modelo.

## Limitaciones y advertencias

- Ausencia total de informacion tecnica verificable: sin arquitectura, parametros, contexto ni datos de entrenamiento publicados.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. En la practica, la ausencia de licencia implica que no se concede permiso explicito de uso, lo que supone un riesgo legal relevante para produccion.
- Model card centrada en el marco de gobernanza del autor mas que en el modelo en si; no proporciona informacion util para evaluar capacidades.
- Repositorio de 0.0 GB: es posible que los pesos no esten efectivamente alojados o que la medicion no refleje el contenido real. Conviene verificar la integridad antes de cualquier uso.
- Sin validacion comunitaria: 5 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas.
- Riesgo de alucinacion, sesgos y limitaciones idiomaticas: no evaluables sin acceso al modelo y a datos de evaluacion.
- El nombre incluye la etiqueta `candidate_enterprise`, lo que sugiere un artefacto en fase de candidatura y no una version estable de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/receiptagent_v3-candidate_enterprise_20261104
- Organizacion del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada como fuente canonica): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
