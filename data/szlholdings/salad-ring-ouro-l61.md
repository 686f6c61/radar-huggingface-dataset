# SZLHOLDINGS/salad-ring-ouro-l61

## Resumen

salad-ring-ouro-l61 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados auditables y trazables. El repositorio se presenta como un modelo entrenado ("trained artifact in the governed factory"), pero la model card no aporta informacion sustantiva sobre la arquitectura, el tamano, los datos de entrenamiento ni las capacidades del modelo.

La documentacion disponible se centra casi por completo en el andamiaje de auditoria de la organizacion: insignias, graficos SVG generados de forma determinista y una seccion de "receipts" que reconoce explicitamente que no existe evidencia de evaluacion en el nivel estricto exigido (falta un fichero DONE.json con estado MEASURED, codigo de retorno de evaluacion cero y marca temporal). El propio autor declara que cualquier afirmacion no respaldada por un recibo medido se considera UNKNOWN (desconocida).

Por tanto, la relevancia practica del modelo no puede establecerse con los datos proporcionados. No hay informacion sobre parametros, contexto, licencia, idiomas ni formato de pesos, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Esta ficha documenta lo que existe y marca el resto como no disponible, sin inferir datos que el autor no ha publicado.

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

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. El autor no especifica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante, ni tampoco el numero de parametros, la longitud de contexto nativa o la tokenizacion empleada.

Respecto al entrenamiento, la card remite a ficheros de recibo ("receipt files") alojados en el mesh del estate, pero el escaneo estricto documentado en la propia pagina concluye que no hay evidencia de evaluacion valida: la clase de escaneo es RECEIPT_FILES_NO_DONE, lo que indica que existen ficheros con nombres de recibo (en concreto assets/szl-card/mesh-receipts.svg) pero ninguno validado como evidencia al nivel exigido. No se documentan volumen de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO, ni innovaciones tecnicas de inferencia.

## Capacidades

- No se declara ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas, vision o audio) en la informacion disponible.
- No hay mencion a soporte de tool calling ni function calling.
- No hay mencion a comportamiento agentico ni a razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- El autor indica explicitamente que no formula ninguna afirmacion de calidad o capacidad sin recibos de evaluacion medidos.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin datos verificables sobre arquitectura, tamano, contexto, licencia o rendimiento. Cualquier escenario de despliegue (atencion al cliente, generacion de codigo, analisis documental, agentes, etc.) requeriria conocer al menos la ventana de contexto, el coste de inferencia y las condiciones de licencia, ninguno de los cuales esta publicado.

A modo de orientacion general sobre lo que habria que verificar antes de plantear un caso de uso:

- Despliegue en produccion: requiere confirmar licencia de uso comercial, que en este repositorio figura como no disponible.
- Integracion en pipelines: requiere conocer el formato de pesos (safetensors, GGUF u otro) y los formatos de cuantizacion soportados, ausentes en la card.
- Evaluacion de calidad: requiere recibos de evaluacion medidos, que el propio autor marca como UNKNOWN.
- Uso multilingue: requiere conocer los idiomas soportados, no declarados.
- Razonamiento o generacion de codigo: requiere benchmarks publicados, inexistentes en la informacion disponible.
- Uso en agentes con tool calling: requiere confirmar soporte de function calling, no documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara de forma explicita que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto registrado en el repositorio clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Sin datos de parametros, contexto, licencia ni rendimiento no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se declaran arquitectura, parametros, contexto ni tokenizador, lo que impide cualquier evaluacion tecnica previa.
- Evidencia de evaluacion inexistente: el propio repositorio clasifica la evidencia como UNKNOWN y no alcanza el nivel estricto de recibo medido.
- Licencia no declarada: no puede asumirse uso comercial ni redistribucion; el riesgo legal es alto sin confirmacion explicita.
- Idiomas no declarados: no puede garantizarse cobertura linguistica alguna, incluido el castellano.
- Formato de pesos no especificado: no se puede confirmar la compatibilidad con runtimes de inferencia habituales.
- Riesgo de alucinacion y sesgos: no evaluables sin benchmarks ni documentacion de datos de entrenamiento.
- Senales de madurez del repositorio: cero descargas y cero likes en la fecha de consulta, y una model card centrada en andamiaje de auditoria mas que en informacion tecnica del modelo.
- Fechas de creacion y actualizacion del repositorio (noviembre de 2026) posteriores a la fecha habitual de referencia; conviene verificar la vigencia de los metadatos en la fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l61
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
