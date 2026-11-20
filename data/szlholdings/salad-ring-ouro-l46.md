# SZLHOLDINGS/salad-ring-ouro-l46

## Resumen

`salad-ring-ouro-l46` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face, presentado como parte de su "governed-AI estate": una coleccion de modelos, datasets y Spaces con resultados trazables y verificables mediante ficheros de recibo (receipts). El repositorio se creo el 18 de noviembre de 2026 y se actualizo el 20 de noviembre de 2026, sin descargas ni likes registrados en el momento de la consulta.

La model card no proporciona informacion tecnica sustantiva sobre el modelo: no se declara arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El autor indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion debe consultarse en los ficheros de recibo del "estate mesh", y que lo que no este respaldado por un recibo se etiqueta como UNKNOWN (desconocido) en lugar de inventarse.

Por tanto, esta ficha se limita a documentar lo que el repositorio declara de forma verificable (identidad, autoria, fechas, filosofia de publicacion) y marca como "no disponible" todo aquello que la informacion proporcionada no cubre. No debe interpretarse como una evaluacion de capacidad del modelo.

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
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la informacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido, ni detalla el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica informacion relevante en este apartado es de caracter metodologico: el autor declara que las afirmaciones de entrenamiento y evaluacion de este artefacto residen en sus ficheros de recibo dentro del "estate mesh", y que cualquier dato no respaldado por un recibo se marca como UNKNOWN. Las graficas incluidas en la model card son SVG deterministicos generados con la libreria estandar de Python a partir de una instantanea de auditoria fechada el 20 de noviembre de 2026 a las 03:48:04 UTC, etiquetada como MEASURED.

## Capacidades

- No se han declarado capacidades concretas del modelo en la informacion disponible.
- No se especifica soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se detallan capacidades multilingues ni idiomas cubiertos.
- No se mencionan modos especiales (thinking mode, vision, audio) en la model card.

## Casos de uso

No es posible recomendar casos de uso concretos sin datos verificables sobre arquitectura, tamano, contexto o capacidades del modelo. La informacion proporcionada no permite determinar si el artefacto es apto para generacion de texto, codigo, atencion al cliente, analisis documental u otras tareas. Cualquier recomendacion de uso en produccion seria especulativa y contraria al principio de rigor de esta ficha.

A modo de orientacion sobre el ecosistema del autor, los artefactos de SZLHOLDINGS se presentan como parte de una factoria de IA "gobernada" con resultados auditables; si se necesita evaluar su idoneidad para un caso concreto, debe consultarse la documentacion de recibos del repositorio y verificar los datos en la fuente original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y que los datos no respaldados se etiquetan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye parametros, contexto ni rendimiento que permitan establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas publicadas: no se puede verificar arquitectura, tamano, contexto ni licencia.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; debe consultarse la fuente original antes de cualquier uso en produccion.
- Idiomas no declarados: se desconoce la cobertura linguistica real del modelo.
- Sin resultados de benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento verificable en la informacion disponible.
- Sin descargas ni likes registrados en el momento de la consulta: el artefacto no cuenta con validacion de la comunidad.
- Riesgo de alucinacion y sesgos: no evaluables sin datos de entrenamiento ni evaluaciones publicadas.
- La model card remite a ficheros de recibo externos para cualquier afirmacion de entrenamiento o evaluacion; sin acceso a esos recibos, los datos deben considerarse no verificados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l46
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
