# SZLHOLDINGS/forge-v3-candidate

## Resumen

forge-v3-candidate es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad documental mediante ficheros de recibo (receipts) y resultados verificables. El repositorio se presenta como un modelo entrenado del "governed factory" de la organizacion, aunque la model card no proporciona detalles sobre arquitectura, tamano, datos de entrenamiento ni proceso de alineamiento.

La informacion disponible es extremadamente limitada. La model card se limita a describir la infraestructura de auditoria del estate (graficos SVG deterministicos generados a partir de una instantanea de auditoria con fecha 2026-11-20), la identidad del repositorio y una nota de honestidad que declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion no respaldada por un recibo se considera UNKNOWN. No se publican parametros, longitud de contexto, tokenizador, idiomas ni resultados de benchmarks.

Su relevancia actual es, por tanto, principalmente documental: sirve como ejemplo de practica de publicacion con trazabilidad estricta (etiquetado MEASURED/REPORTED/UNKNOWN, ausencia deliberada de cifras no verificadas) y como candidato a modelo dentro de un pipeline gobernado. Para evaluacion tecnica o uso en produccion, la informacion publica es insuficiente y requeriria consultar los ficheros de recibo del estate o el codigo fuente canonico en la organizacion de GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card. No se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con componentes de espacio de estados (SSM) o cualquier otra variante. Tampoco se documenta el tokenizador, la dimension del embedding, el numero de capas ni el mecanismo de atencion.

Respecto al entrenamiento, la model card declara que las afirmaciones sobre entrenamiento y evaluacion "viven en sus ficheros de recibo (ver la malla del estate)" y que cualquier dato no respaldado por un recibo se etiqueta como UNKNOWN. No se indica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO u otra forma de alineamiento, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica referencia temporal concreta es la instantanea de auditoria del 2026-11-20T03:48:04Z, marcada como MEASURED, que alimenta los graficos SVG de la tarjeta.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible (generacion de texto, razonamiento, codigo, matematicas, vision, audio).
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se indican capacidades multilingues ni lista de idiomas.
- No se documentan modos especiales (thinking mode, vision, audio).
- La unica capacidad verificable es la de ser un artefacto de modelo publicado con licencia Apache 2.0 y con un esquema de trazabilidad documental asociado.

## Casos de uso

- Auditoria de linaje de modelos: el repositorio puede usarse como caso de estudio de publicacion con trazabilidad estricta, ya que etiqueta cada dato como MEASURED, REPORTED o UNKNOWN y referencia ficheros de recibo con marca temporal, lo que facilita reproducir el proceso de verificacion en una organizacion.
- Evaluacion interna de pipelines gobernados: un equipo que opere un "factory" de modelos puede integrar este artefacto como candidato en su pipeline de validacion, comparando su recibo de auditoria con el de otros candidatos antes de promoverlo.
- Docencia sobre practicas de model cards: sirve como ejemplo de model card minimalista y honesta, util en formacion sobre documentacion de modelos y sobre como declarar ausencia de datos en lugar de inventar cifras.
- Pruebas de integracion de licencias: al estar etiquetado como apache-2.0, puede emplearse en tests de cumplimiento de licencias dentro de un catalogo interno, verificando que el pipeline detecta correctamente la licencia y su nota de procedencia.
- Referencia para ingenieria de receipts: los graficos SVG deterministicos y el esquema de receipts descritos pueden reutilizarse como plantilla para construir sistemas de auditoria de artefactos ML en otras organizaciones.
- Verificacion de cadena de custodia: en un contexto de compliance, el repositorio permite practicar la verificacion de que un artefacto concreto esta cubierto por una instantanea de auditoria fechada y por una nota de licencia emitida por el equipo de operaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguna tabla de resultados (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta formato de pesos ni compatibilidad con runners.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion publica no permite identificar la categoria del modelo (tamano, tarea, modalidad), por lo que no es posible establecer una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se conocen parametros, contexto, tokenizador ni formato de pesos, lo que impide planificar su despliegue.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento en ninguna tarea.
- Riesgo de alucinacion: no evaluable, al no existir datos de evaluacion ni descripcion de capacidades.
- Idiomas no declarados: no puede asumirse soporte multilingue ni siquiera para castellano o ingles.
- Licencia con caveat: la etiqueta apache-2.0 fue fijada el 2026-11-25 por operaciones del estate segun un precedente interno de "dataset rank-1", y la propia nota indica que no se reclama evidencia de licencia upstream por fichero. Conviene verificar la procedencia antes de un uso comercial.
- Modelo marcado como "candidate": el nombre sugiere que no es una version final; no debe tratarse como artefacto estable para produccion.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado en Hugging Face: no hay senales de uso comunitario ni de validacion externa.
- La honestidad declarada por el autor implica que cualquier dato no presente en los receipts debe considerarse desconocido, no neutro; no debe inferirse nada a partir del silencio de la tarjeta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/forge-v3-candidate
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion canonica en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas del estate (referenciada): https://github.com/szl-holdings/estate-cards
