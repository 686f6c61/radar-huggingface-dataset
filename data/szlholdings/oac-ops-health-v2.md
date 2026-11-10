# SZLHOLDINGS/oac-ops-health-v2

## Resumen

Oac Ops Health V2 es un artefacto publicado en Hugging Face por SZLHOLDINGS bajo el identificador `SZLHOLDINGS/oac-ops-health-v2`. Segun la model card, forma parte del "estate" de IA de SZL Holdings, una iniciativa que se presenta como un portfolio de investigacion y producto donde "cada afirmacion lleva un recibo" (receipts-backed) y cuyos resultados medidos se publican en una cadena de recibos con hash publica. El modelo se distribuye con licencia Apache-2.0 y se etiqueta con la libreria `transformers`.

La informacion disponible es extremadamente escasa: la model card no especifica arquitectura, numero de parametros, longitud de contexto, composicion del dataset de entrenamiento ni idiomas soportados. No se han publicado resultados de benchmarks en la propia card; el autor remite a un dataset externo (`SZLHOLDINGS/frontier-54-runs`) para las metricas respaldadas por recibos, pero no se incluyen cifras en la informacion proporcionada. El pipeline no esta declarado y el modelo registra 0 descargas y 0 likes en el momento de la consulta.

Por tanto, esta ficha documenta lo que se puede verificar a partir de los metadatos y la model card, y marca explicitamente como "no disponible" todo aquello que el autor no ha hecho publico. Cualquier evaluacion de capacidades, rendimiento o idoneidad para produccion requeriria acceso a los pesos y a la cadena de recibos referenciada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (la libreria declarada es `transformers`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo: no se indica si es un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante, ni se detalla el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

El unico elemento tecnico diferenciador que menciona el autor es el sistema de "recibos" (receipts): afirma que cada afirmacion de la card se rastrea hasta un recibo encadenado por hash en el dataset publico `SZLHOLDINGS/frontier-54-runs`, y que solo publican numeros cuando un recibo firmado los respalda. No se detalla en la informacion proporcionada como se generan esos recibos ni que metodologia de evaluacion subyace.

## Capacidades

- No se documentan capacidades especificas en la model card: no se menciona generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se mencionan modos especiales (thinking mode, vision, audio) ni otras funcionalidades.
- La unica capacidad implicita, por la etiqueta `endpoints_compatible`, es que el artefacto esta pensado para desplegarse en Hugging Face Inference Endpoints.

## Casos de uso

Dado que no se documentan capacidades ni arquitectura, los siguientes casos son escenarios genericos condicionados a que el modelo se comporte como un modelo de lenguaje estandar; no estan respaldados por la informacion proporcionada:

- Clasificacion o triaje de incidencias operativas: si el modelo acepta texto de entrada, podria usarse para etiquetar tickets o alertas segun su contenido, aunque no se especifica el formato de entrada ni el vocabulario de salida.
- Generacion de resumenes de estado: el nombre "ops health" sugiere un posible uso en la generacion de informes de salud operativa, pero no hay evidencia en la card de que el modelo haya sido entrenado para ello.
- Integracion en pipelines via Inference Endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en la infraestructura gestionada de Hugging Face, lo que facilitaria su consumo desde servicios internos.
- Experimentacion en investigacion: util como artefacto de referencia para estudiar el mecanismo de "recibos" del autor comparando las metricas de la cadena `frontier-54-runs` con las salidas del modelo.
- Auditoria de procedencia: el enlace a la cadena de recibos permite verificar el origen de las afirmaciones de rendimiento, lo que puede interesar a equipos de compliance que evaluen modelos de terceros.
- Prototipado rapido: al estar bajo Apache-2.0 y en formato `transformers`, podria cargarse con la libreria estandar para pruebas de integracion, siempre que los pesos esten efectivamente publicados y sean compatibles.

No se dispone de informacion suficiente para afirmar que el modelo sea adecuado para produccion en ninguno de estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la cadena de recibos `SZLHOLDINGS/frontier-54-runs` para las metricas respaldadas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros y la arquitectura).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la etiqueta `endpoints_compatible` sugiere despliegue en Hugging Face Inference Endpoints; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria del modelo (tamano, tarea, arquitectura), por lo que no es posible establecer comparaciones rigurosas con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SZLHOLDINGS/oac-ops-health-v2 | no disponible | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se conocen parametros, contexto, arquitectura ni datos de entrenamiento, lo que impide evaluar su idoneidad para cualquier uso.
- Sin benchmarks verificables en la card: las metricas solo se referencian de forma indirecta a traves de la cadena de recibos, sin cifras publicadas en la informacion disponible.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso a los pesos y a una evaluacion independiente.
- Cero adopcion registrada (0 descargas, 0 likes): no hay evidencia de uso por parte de la comunidad que permita validar el artefacto.
- La model card tiene un caracter marcadamente promocional ("Why it matters (for investors)") y no tecnico, lo que reduce su valor como fuente de evaluacion.
- Aunque la licencia es Apache-2.0 (permisiva para uso comercial), la falta de especificaciones impide garantizar que los pesos publicados correspondan a un modelo funcional.
- No se especifican limitaciones de contexto ni de idioma porque no se declara ninguno de los dos.
- Se recomienda verificar la integridad y el contenido real del repositorio antes de cualquier uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/oac-ops-health-v2
- Dataset de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Organizacion en GitHub: https://github.com/szl-holdings
- Web de la empresa: https://szlholdings.com
- Pagina de sponsors: https://szlholdings.com/sponsors.html
- Dashboard en vivo (SI command center): https://szlholdings-szlholdings-si.hf.space
- Living anatomy: https://szlholdings-anatomy.hf.space
- Autonomy ladder: https://github.com/szl-holdings/szl-gpu-bridge/blob/main/docs/AUTONOMY_LADDER.md
- Curriculum de entrenamiento (Ouroboros): https://github.com/szl-holdings/szl-gpu-bridge/blob/main/docs/OUROBOROS_CURRICULUM.md
- Herramienta de generacion de cards: https://github.com/szl-holdings/szl-gpu-bridge/tree/main/tools/hf_cards
