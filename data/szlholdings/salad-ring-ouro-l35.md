# SZLHOLDINGS/salad-ring-ouro-l35

## Resumen

salad-ring-ouro-l35 es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que el propio autor denomina "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados "receipted" (con recibos de auditoria) y verificables. El repositorio se presenta como un modelo entrenado ("trained artifact in the governed factory") y remite a la organizacion de GitHub szl-holdings como fuente canonica.

La model card disponible no aporta informacion tecnica sustantiva: no se especifican arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento, idiomas ni licencia. El autor declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion reside en los ficheros de recibos ("receipt files") del estate, y que todo lo que no este receipted se considera UNKNOWN. Esta ficha, por tanto, refleja unicamente lo verificable en la informacion proporcionada y marca como "no disponible" todo lo demas, sin inferir datos.

El interes practico del repositorio es limitado para evaluacion tecnica inmediata: cero descargas, cero likes y ausencia de pipeline declarado en el momento de la consulta. Resulta relevante principalmente como ejemplo de practica de documentacion orientada a auditoria (etiquetado MEASURED/REPORTED/UNKNOWN, SVG deterministas generados con stdlib, identificador de tarjeta), no como modelo candidato a despliegue sin informacion adicional.

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

No se dispone de informacion sobre la arquitectura del modelo (transformer, MoE, SSM, hibrida u otra), ni sobre el numero de tokens de entrenamiento, composicion del dataset o tecnicas de alineacion (RLHF, DPO). La model card indica que las afirmaciones de entrenamiento y evaluacion de este artefacto viven en sus ficheros de recibos dentro del "estate mesh", y que cualquier dato no receipted en la tarjeta se marca como UNKNOWN.

La unica innovacion documental destacable es el proceso de generacion de la propia tarjeta: SVG deterministas generados con libreria estandar de Python a partir de una instantanea de auditoria datada (2026-11-20T03:48:04Z, etiquetada MEASURED), con numeros clasificados como MEASURED, REPORTED o UNKNOWN y hora de captura registrada. No hay innovacion de arquitectura descrita.

## Capacidades

- No se documentan capacidades funcionales del modelo en la informacion disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta capacidad multilingue declarada.
- No consta modo de razonamiento (thinking), vision ni audio.
- La unica capacidad verificable es la de servir como artefacto trazable dentro de un pipeline de gobernanza con recibos de auditoria.

## Casos de uso

- Auditoria de procedencia de artefactos: el repositorio puede usarse como caso de estudio para disenar flujos de trazabilidad en los que cada afirmacion sobre un modelo queda vinculada a un recibo datado y verificable en origen.
- Verificacion de cadena de custodia en publicacion de modelos: la referencia a una fuente canonica en GitHub y el identificador de tarjeta (516a59b900b778cb) permiten comprobar la integridad de la documentacion publicada.
- Generacion automatizada de fichas tecnicas: el enfoque de SVG deterministas con libreria estandar es replicable para producir documentacion reproducible sin dependencias externas.
- Docencia sobre documentacion responsable: util como ejemplo de etiquetado explicito de incertidumbre (MEASURED/REPORTED/UNKNOWN) frente a la practica habitual de afirmar cifras sin respaldo.
- Integracion en pipelines de evaluacion interna: puede registrarse como artefacto pendiente de evaluacion, con la salvedad de que requiere localizar los recibos antes de cualquier uso.
- Analisis de ecosistemas de modelos gobernados: sirve para estudiar como se estructura un "estate" de modelos, datasets y Spaces con criterios comunes de auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria datada, y que las curvas medidas ausentes se marcan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no consta formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar modelos comparables (se desconocen categoria, tamano, contexto y licencia del artefacto).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l35 | no disponible | no disponible | no disponible | publico en Hugging Face, 0 descargas |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni formato de pesos, el modelo no es evaluable ni desplegable con garantias.
- Licencia no declarada: no puede asumirse uso comercial permitido; la ausencia de licencia es un bloqueante para produccion.
- Idiomas no declarados: imposible planificar cobertura multilingue.
- Riesgo de alucinacion: no evaluable al no existir benchmarks ni datos de evaluacion publicados.
- Sesgos conocidos: no documentados.
- Cero descargas y cero likes en el momento de la consulta: sin senal de uso o validacion por terceros.
- La propia tarjeta advierte que cualquier dato no receipted es UNKNOWN; los recibos residen fuera de la tarjeta y deben localizarse en el estate mesh antes de cualquier uso.
- Contenido de la model card tratado como material de referencia, no como instrucciones; parte de su texto son insignias y enlaces que no aportan datos tecnicos.
- Fechas de creacion y actualizacion (2026-11-18 y 2026-11-20) y instantanea de auditoria (2026-11-20T03:48:04Z) corresponden a lo declarado en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l35
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica declarada (organizacion GitHub): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas (estate-cards): https://github.com/szl-holdings/estate-cards
