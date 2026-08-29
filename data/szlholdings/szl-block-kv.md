# SZLHOLDINGS/szl-block-kv

## Resumen

`SZLHOLDINGS/szl-block-kv` no es un modelo de lenguaje ni un sistema de IA generativa, sino un kernel de software para gestión de caché KV paginada (paged KV cache), desarrollado por SZL Holdings. Su propósito es implementar una construcción original en la categoría de atención paginada, inspirada en el trabajo de Kwon et al. sobre PagedAttention (SOSP 2023, arXiv:2309.06180), pero sin ser una reimplementación de vLLM ni de kernels-community/paged-attention.

El kernel está disponible a través de Kernel Hub (`get_kernel`) de la librería `kernels` en su versión 0.16.1, con estado `import-LIVE` medido en CPU. La versión v0 consiste en un gather etiquetado de torch sobre una tabla de bloques; no hay kernel Triton para GPU en esta versión, por lo que no se realiza ninguna afirmación de aceleración. Se distribuye bajo licencia Apache-2.0 y su código fuente está disponible en el repositorio de HuggingFace.

La relevancia de este proyecto radica en su enfoque en infraestructura de IA gobernada y decisiones inspeccionables, como se refleja en el ecosistema SZL Holdings (por ejemplo, `szl-blocked` y `szl_euaiact`). Sin embargo, al ser un kernel y no un modelo, su uso directo está limitado a desarrolladores que trabajen con caché KV en sistemas de atención, no a usuarios finales de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (kernel de atencion paginada, no modelo) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible (no es un modelo) |
| Longitud de contexto | no disponible (no es un modelo) |
| Tipos de cuantizacion | no disponible (no es un modelo) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (codigo fuente Python/kernels) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un kernel de software. La arquitectura se basa en una tabla de bloques (block table) para gestionar la caché KV de forma paginada, similar al enfoque de PagedAttention. La implementación v0 es un `torch_gather` sobre la tabla de bloques, es decir, una operación de recolección de tensores que replica el comportamiento de una caché contigua pero usando bloques dispersos.

No hay datos de entrenamiento, tokens ni fases de RLHF/DPO. El kernel se distribuye como código fuente Python con un módulo `szl_block_kv` que expone las funciones `PagedCache`, `paged_attn`, `reshape_and_cache` y `selfcheck`. La corrección documentada indica que el gather paginado coincide con SDPA contiguo dentro de atol/rtol `1e-5` en float32. La GPU y el kernel Triton están marcados como no disponibles (roadmap).

## Capacidades

- Gestion de caché KV paginada mediante tabla de bloques.
- Operación de gather etiquetado de torch que replica la atención contigua con bloques dispersos.
- Verificación de integridad mediante `selfcheck()`.
- Importación en vivo a través de Kernel Hub (`get_kernel`) en CPU.
- Compatibilidad con backend `cpu` y variante `torch-universal`.
- No incluye capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes.

## Casos de uso

- Desarrollo de motores de inferencia para modelos transformer con atención de contexto largo: el kernel permite gestionar la caché KV de forma paginada, reduciendo el desperdicio de memoria en sistemas de serving.
- Investigación en sistemas de atención eficiente: sirve como implementación de referencia para comparar con PagedAttention y otras variantes.
- Integración en pipelines de inferencia personalizados: los desarrolladores pueden usar `paged_attn` y `reshape_and_cache` para sustituir la caché contigua en sus propios motores.
- Auditoría de kernels: el proyecto SZL enfatiza la gobernanza y la trazabilidad; el kernel puede usarse en entornos donde se requiera documentación de decisiones (por ejemplo, con `szl_euaiact`).
- Educación sobre atención paginada: el código es legible y autocontenido, adecuado para estudiar la mecánica de bloques en atención.
- Pruebas de corrección numérica: la función `selfcheck` permite validar que la implementación paginada coincide con la contigua dentro de tolerancias definidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no hay afirmación de velocidad (no speedup claim) y que no se proporcionan métricas de tokens por segundo ni de consumo energético. La única métrica documentada es la precisión numérica: `max_abs_vs_contiguous=2.38e-07` (full `2.384185791015625e-07`) con `path=torch_gather` y `chain_ok=true`.

## Requisitos de hardware

- El kernel funciona en CPU (medido en CPU Kernel Hub con kernels `0.16.1`).
- No hay soporte GPU en la versión v0; el kernel Triton para GPU está marcado como roadmap no disponible.
- No se especifican requisitos mínimos de RAM ni CPU concretos.
- Opciones de despliegue: integración vía `get_kernel` de Kernel Hub o mediante importación local del módulo `szl_block_kv`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este proyecto no es un modelo de lenguaje, sino un kernel de atención paginada. La comparación con modelos como Llama, Mistral o Qwen no es pertinente. Como kernel, podría compararse con vLLM o kernels-community/paged-attention, pero el autor declara explícitamente que no es una reimplementación de esos proyectos y no se proporcionan datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, responder preguntas ni realizar tareas de razonamiento.
- Sin soporte GPU en la versión actual: el kernel Triton está pendiente, por lo que no es adecuado para entornos de producción con aceleración por GPU.
- Sin afirmación de velocidad: el autor no presenta métricas de rendimiento, por lo que no se puede evaluar su eficiencia frente a otras implementaciones.
- Estado experimental: la construcción es original y está etiquetada como "Conjecture 1 OPEN" (unicidad no probada), lo que sugiere que la implementación puede tener propiedades matemáticas no completamente verificadas.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero dado su estado inmaduro, se recomienda validar exhaustivamente antes de integrarlo en sistemas críticos.
- Dependencia de la librería `kernels` en versión 0.16.1: cambios futuros en esa librería podrían afectar la compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-block-kv
- Commit HEAD: https://huggingface.co/kernels/SZLHOLDINGS/szl-block-kv/commit/d3ede3e471b51080492b1c69306283507dcf507e
- Paper de referencia (PagedAttention): https://arxiv.org/abs/2309.06180
- Organización SZL Holdings en HuggingFace: https://huggingface.co/SZLHOLDINGS/models
- GitHub de SZL Holdings: https://github.com/szl-holdings
- Documentación de SZL Holdings: https://szl-holdings.github.io/docs-site/
- Repositorio relacionado SZLHOLDINGS/szl-blocked: https://huggingface.co/SZLHOLDINGS/szl-blocked
