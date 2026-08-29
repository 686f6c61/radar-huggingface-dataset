# SZLHOLDINGS/szl-ouroboros

## Resumen

SZLHOLDINGS/szl-ouroboros no es un modelo de inteligencia artificial, sino un kernel de gobernanza escrito en Python puro (solo biblioteca estándar) para la gestión de bucles acotados en runtimes de agentes. Lo desarrolla SZL Holdings (Stephen P. Lutar, ORCID 0009-0001-0110-4173) como parte de un sistema de seguridad que mantiene a los agentes dentro de límites demostrables, generando recibos a prueba de manipulación. Su relevancia radica en que aborda un problema crítico en la producción de agentes autónomos: garantizar que los bucles de ejecución terminen y que cada iteración quede registrada con métricas medibles o derivadas, sin fabricar datos cuando la medición no está disponible.

El repositorio en HuggingFace actúa como espejo de publicación del código fuente canónico en GitHub. La model card es explícita: "Not a model. No weights." No hay arquitectura neuronal, ni pesos, ni entrenamiento. Se trata de una librería con API pública (`build_loop_trace`, `loop_tax`, `selfcheck`) que reconstruye trazas de intentos de ejecución y calcula el "impuesto de bucle" (loop-tax) separando tiempos medidos de tiempos derivados. El archivo `model.joblib` presente en el hub está marcado como CUARENTENA: no debe cargarse con `joblib.load`.

La licencia es Apache-2.0, sin restricciones de uso comercial. El repositorio tiene un tamaño de 0.0 GB (código fuente, no pesos). No se han publicado resultados de benchmarks de IA porque no es un modelo de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (kernel de software, no red neuronal) |
| Parametros totales | No disponible (no hay pesos) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no procesa texto de forma generativa) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (librería Python, no modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (código Python, stdlib) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El kernel está implementado en Python puro, sin dependencias externas, y sigue la doctrina `LOOP_DOCTRINE = "bounded, terminating, receipt-closed"`. Su funcionamiento se basa en reconstruir las ventanas de intentos de un run a partir de una lista de diccionarios con campos como `provider`, `model`, `ok`, `latency_ms` y `node`. La API `build_loop_trace` procesa esos intentos y produce un trace con campos etiquetados: `modelMs` (medido), `overheadMs` (derivado), `serializationTaxMs` (contrafactual, nunca una ganancia realizada) y `deadHopMs` (intentos fallidos). Cuando falta `wall_ms`, `overheadMs` se marca como `UNAVAILABLE`, nunca se fabrica un valor.

La función `loop_tax` calcula el impuesto de bucle separando la contribución de cada intento, y `selfcheck` valida la consistencia interna del kernel. La doctrina establece que una violación de presupuesto se reporta, nunca se recorta silenciosamente. El sistema se apoya en una tesis (Ouroboros Thesis v15) que introduce capas estructurales adicionales como el Knot Calculus y el KhipuReceipt, aunque estas no están implementadas en este repositorio.

## Capacidades

- Reconstrucción de trazas de ejecución de bucles acotados a partir de datos de intentos.
- Cálculo del "impuesto de bucle" (loop-tax) con separación entre tiempo medido (`modelMs`) y tiempo derivado (`overheadMs`).
- Etiquetado honesto de campos: cuando no hay medición de `wall_ms`, `overheadMs` se reporta como `UNAVAILABLE`, no se inventa.
- Generación de recibos a prueba de manipulación (tamper-evident) para cada bucle.
- Validación interna mediante `selfcheck` que verifica la coherencia de los cálculos.
- Sin dependencias externas: solo biblioteca estándar de Python, fácil de auditar.
- No tiene capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes multi-step.

## Casos de uso

- Auditoría de bucles en agentes autónomos: el kernel permite reconstruir el historial de intentos de un agente que llama a múltiples proveedores de modelos, verificando que cada iteración respetó el presupuesto máximo (`max_budget`).
- Cumplimiento normativo en sistemas de IA: al generar recibos con trazabilidad completa, las organizaciones pueden demostrar que sus agentes operan dentro de límites definidos, útil para auditorías externas.
- Monitorización de latencia en pipelines de inferencia: `build_loop_trace` separa el tiempo real del modelo del overhead del sistema, permitiendo identificar cuellos de botella en infraestructura.
- Investigación en gobernanza de agentes: el kernel sirve como base experimental para estudiar políticas de terminación de bucles y su impacto en el rendimiento global.
- Integración en runtimes de agentes: puede incorporarse como capa de control que detiene la ejecución si se viola el presupuesto, reportando la violación sin enmascararla.
- Validación de sistemas de multi-agente: al comparar trazas de distintos nodos (por ejemplo, `"tower"` y `"laptop"`), se puede evaluar la consistencia de las mediciones entre entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, dado que no es un modelo de IA con métricas estándar como MMLU, HumanEval o GSM8K. El repositorio incluye tests propios (14/14 y 13/13 en dos suites) que verifican el comportamiento del kernel, pero no son comparables con benchmarks de modelos.

## Requisitos de hardware

- No requiere GPU ni hardware especializado: es un kernel de software que se ejecuta en cualquier CPU con Python 3.
- Consumo de memoria despreciable: el repositorio ocupa 0.0 GB y las estructuras de datos son listas de diccionarios pequeñas.
- Despliegue: se instala como librería Python estándar; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: la reconstrucción de trazas es O(n) en el número de intentos, con operaciones aritméticas simples; el tiempo de ejecución es del orden de microsegundos para trazas típicas.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existen modelos comparables en la misma categoría. Los kernels de gobernanza de agentes son un campo emergente sin alternativas públicas conocidas en HuggingFace.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no procesa lenguaje, no tiene capacidad de razonamiento.
- El archivo `model.joblib` está marcado como CUARENTENA: contiene serialización ejecutable y no debe cargarse con `joblib.load`. Ignorar esta advertencia puede ejecutar código arbitrario.
- No fabrica datos: si `wall_ms` no está disponible, `overheadMs` se reporta como `UNAVAILABLE`. Esto puede limitar su uso en entornos donde la telemetría es incompleta.
- La unicidad de la reconstrucción del trace es una conjetura abierta (Conjecture 1) según la propia model card; no se ha demostrado formalmente.
- No se ha publicado documentación de API más allá de los ejemplos de la model card; para producción se recomienda revisar el código fuente en GitHub.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad de su correcta aplicación recae en el usuario.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-ouroboros
- GitHub (fuente canónica): https://github.com/szl-holdings/szl-ouroboros
- GitHub (producto TypeScript relacionado): https://github.com/szl-holdings/ouroboros
- Documentación en a11oy: https://github.com/szl-holdings/a11oy/blob/main/runtime/ouroboros/README.md
- Tesis Ouroboros v15 (Zenodo): https://zenodo.org/records/20424995/files/ouroboros-thesis-v15.pdf
- DOI del paquete: 10.5281/zenodo.19944926
- ORCID del autor: https://orcid.org/0009-0001-0110-4173
