# SZLHOLDINGS/salad-ring-ouro-l8

## Resumen

`salad-ring-ouro-l8` es un artefacto de modelo publicado en Hugging Face por la organizacion SZLHOLDINGS, que se presenta como parte de un "estate" de IA gobernada con modelos, datasets y Spaces vinculados a fuentes y con resultados verificables mediante recibos (receipts). El repositorio fue creado el 18 de noviembre de 2026 y actualizado el 23 de noviembre de 2026, y no registra descargas ni likes en el momento de la consulta.

La model card no proporciona informacion tecnica sustantiva: no declara arquitectura, numero de parametros, longitud de contexto, idiomas, licencia ni pipeline. La mayor parte del documento se dedica a meta-informacion sobre el sistema de auditoria del autor (charts SVG deterministas, recibos de evaluacion, etiquetas MEASURED/REPORTED/UNKNOWN) y a describir el estado de la evidencia, no el modelo en si.

El propio autor indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion debe residir en sus ficheros de recibo, y que lo que no este acreditado alli es UNKNOWN. El escaneo de recibos citado en la card clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero no existe un DONE.json estricto con estado MEASURED, por lo que la evidencia de evaluacion se declara UNKNOWN. En la practica, esto significa que no es posible verificar capacidades, calidad ni rendimiento del modelo a partir de la informacion publicada.

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

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. No se indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con componentes SSM o cualquier otra variante. Tampoco se especifica el numero de parametros, la longitud de contexto nativa ni la tokenizacion empleada.

Respecto al entrenamiento, la card no documenta el volumen de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor remite de forma explicita a "receipt files" alojados en el mesh del estate, pero el escaneo citado en la propia card indica que no existe un recibo de evaluacion estricto (DONE.json con status=MEASURED, eval_rc=0 y timestamp), por lo que la evidencia de entrenamiento y evaluacion queda marcada como UNKNOWN.

## Capacidades

- Generacion de texto: no disponible; no se documenta ninguna capacidad concreta.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta declarado.
- Modo de razonamiento explicito (thinking mode): no disponible.

La model card no realiza ninguna afirmacion de capacidad o calidad sin recibos de evaluacion medidos, y dado que estos no existen en el repositorio, no hay capacidades verificables que listar.

## Casos de uso

No es posible recomendar casos de uso concretos y realistas para este modelo, ya que no se dispone de informacion sobre su arquitectura, tamano, contexto, idiomas ni capacidades. Cualquier escenario de aplicacion (atencion al cliente, generacion de codigo en produccion, analisis documental, agentes autonomos, extraccion de informacion estructurada o moderacion de contenido) requeriria conocer al menos la ventana de contexto, el soporte linguistico y el rendimiento medido, datos que no estan publicados.

A modo de orientacion para la evaluacion, un integrador deberia comprobar antes de considerar este artefacto: (1) la existencia de pesos descargables en el repositorio, (2) un recibo de evaluacion estricto con resultados medidos, (3) la licencia aplicable al uso comercial y (4) los requisitos de hardware derivados del tamano del modelo. Ninguno de estos cuatro puntos esta cubierto por la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara de forma explicita que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos incluido en la propia card clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que existan pesos en formato utilizable (safetensors, GGUF u otros).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse la categoria, el tamano ni la tarea del modelo, no es posible identificar alternativas comparables de forma rigurosa. Cualquier comparacion con modelos de la misma franja de parametros o de la misma tarea seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni tokenizador declarados, el modelo no es evaluable ni desplegable de forma informada.
- Evidencia de evaluacion marcada como UNKNOWN por el propio autor: no existe un recibo DONE.json estricto con estado MEASURED.
- Licencia no declarada: no se puede asumir permiso para uso comercial, modificacion ni redistribucion.
- Idiomas no declarados: riesgo de comportamiento degradado o no verificado en castellano y en cualquier otro idioma.
- Riesgo de alucinacion y sesgos: no cuantificado ni documentado; sin evaluaciones publicadas no hay base para estimarlo.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.
- Nomenclatura y presentacion propias de un sistema interno de auditoria ("estate", "receipts", "mesh") en lugar de una model card convencional, lo que dificulta la integracion en pipelines estandar.
- Fechas de creacion y actualizacion en 2026: conviene verificar la vigencia y el estado actual del repositorio antes de cualquier uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l8
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Herramienta de generacion de cards citada: https://github.com/szl-holdings/estate-cards
