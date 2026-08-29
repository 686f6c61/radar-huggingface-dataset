# SZLHOLDINGS/szl-formulas

## Resumen

`SZLHOLDINGS/szl-formulas` es un kernel de software de gobernanza para la composición de fórmulas, no un modelo de inteligencia artificial. No contiene pesos entrenados, ni arquitectura neuronal, ni capacidad de generación de texto. Se trata de una implementación en Python puro (solo librería estándar) que permite reproducir offline las 21 fórmulas canónicas del framework SZL, junto con un compositor de bucles gobernados. Está publicado en Hugging Face bajo la categoría `kernels` y con licencia Apache-2.0.

El kernel forma parte de la infraestructura de "IA gobernada" de SZL Holdings, orientada a decisiones inspeccionables con límites de prueba explícitos. Su propósito es permitir que un sistema evalúe fórmulas matemáticas y de gobernanza con un estado de prueba verificado, sin depender de ejecución remota ni de modelos de caja negra. La versión actual refleja el estado de prueba de cada fórmula de forma verbatim, distinguiendo entre `PROVEN`, `AXIOM`, `SORRY` y `CONJECTURE`. El conjunto bloqueado como probado es exactamente 8 fórmulas, y el resto permanece en estado abierto o conjetural.

La relevancia de este repositorio no reside en capacidades de IA, sino en su enfoque de transparencia y trazabilidad para sistemas que necesitan auditar qué afirmaciones están demostradas y cuáles no. Es un componente de infraestructura, no un modelo de lenguaje ni un clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de software en Python puro (stdlib-only), sin red neuronal |
| Parametros totales | No aplica (no hay pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (interfaz en ingles, sin datos de i18n) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (codigo fuente Python; sin safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

Este kernel no sigue una arquitectura de modelo de IA. Es un paquete de software que expone una API pública con funciones como `registry_count()`, `lambda_aggregate`, `LOCKED_PROVEN_FORMULA_IDS`, `run_governed_loop` y `PROOF_STATUS`. La implementación está escrita en Python puro, sin dependencias externas más allá de la librería estándar, lo que facilita su ejecución offline y su auditoría. No existe entrenamiento en el sentido de aprendizaje automático: no hay datos de entrenamiento, ni pesos, ni fases de ajuste.

La innovación técnica destacable es el concepto de "compositor de bucle gobernado" (`run_governed_loop`), que encadena ejecuciones de fórmulas verificando que cada paso cumpla con las condiciones de gobernanza definidas. Cada fórmula del registro lleva asociado un estado de prueba (`PROOF_STATUS`) que se copia de forma verbatim desde la fuente canónica, sin alteraciones. El kernel mantiene una distinción explícita entre el estado de prueba de una fórmula y su pertenencia al conjunto bloqueado y demostrado (`LOCKED_PROVEN_FORMULA_IDS`), que actualmente contiene exactamente 8 identificadores. El resto de fórmulas (hasta 21) pueden estar en estado `AXIOM`, `SORRY` o `CONJECTURE`, sin que eso implique que estén probadas.

## Capacidades

- Ejecución offline y reproducible de las 21 fórmulas canónicas SZL mediante la API `get_kernel`.
- Composición de cadenas de fórmulas con verificación de gobernanza a través de `run_governed_loop`.
- Exposición del estado de prueba de cada fórmula (`PROOF_STATUS`) de forma verbatim y sin modificación.
- Proporciona el agregado `lambda_aggregate` que clasifica el resultado global como `ADVISORY` cuando hay conjeturas abiertas.
- Permite consultar el número de fórmulas registradas (`registry_count()`) y el conjunto de fórmulas bloqueadas y probadas (`LOCKED_PROVEN_FORMULA_IDS`).
- No ofrece generación de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente. Es exclusivamente un kernel de gobernanza.

## Casos de uso

- Auditoría de decisiones basadas en fórmulas: un sistema de gobernanza puede invocar `run_governed_loop` para encadenar fórmulas y obtener un `replay_ok` que confirme que la ejecución cumple las reglas, útil para registrar decisiones inspeccionables.
- Verificación de límites de prueba en pipelines de IA: antes de desplegar un componente crítico, se puede consultar `PROOF_STATUS` para saber qué afirmaciones están demostradas y cuáles son conjeturas, evitando tratar lo no probado como teorema.
- Reproducibilidad de resultados: al ser un kernel offline y sin dependencias, puede integrarse en entornos de CI/CD para regenerar resultados de gobernanza sin conexión a servicios externos.
- Trazabilidad regulatoria: para sectores con requisitos de auditoría (finanzas, salud), el kernel permite generar un registro de qué fórmulas se usaron y su estado de prueba, cumpliendo con la doctrina de "IA gobernada" de SZL.
- Investigación en fundamentos matemáticos: al incluir fórmulas como `reed_solomon_singleton`, puede usarse para estudiar la relación entre la cota de Singleton y códigos Reed-Solomon en un entorno controlado.
- Educación y documentación técnica: sirve como referencia canónica de las fórmulas SZL y su estado de prueba, útil para desarrolladores que necesiten entender qué está demostrado y qué no antes de integrar estos conceptos en sus sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento, latencia ni comparaciones con otros sistemas. La propia documentación indica que no hay benchmarks CUDA disponibles.

## Requisitos de hardware

- No requiere GPU ni aceleración especial. Al ser un kernel Python puro, basta con un intérprete de Python 3.x en cualquier CPU.
- La memoria necesaria es mínima (inferior a 100 MB en ejecución típica), ya que no hay pesos ni modelos.
- Puede ejecutarse en cualquier sistema operativo con Python instalado, incluidos entornos embebidos o contenedores ligeros.
- No requiere vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza mediante la API `get_kernel` de Hugging Face o directamente desde el código fuente de GitHub.
- La latencia es despreciable para operaciones de registro y composición de fórmulas (del orden de microsegundos a milisegundos, dependiendo del número de fórmulas encadenadas).

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no tiene equivalentes directos en el ecosistema de modelos de lenguaje. Podría compararse con otros kernels de gobernanza o bibliotecas de verificación formal (como Lean4), pero no se dispone de datos de comparación en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural. Intentar usarlo como tal dará resultados vacíos o errores.
- El repositorio contiene una advertencia explícita sobre un archivo `model.joblib` que está en cuarentena y no debe cargarse con `joblib.load`. No está presente en el árbol del repositorio, pero se menciona como riesgo de ejecución.
- La propiedad `lambda_aggregate` se basa en la Conjetura 1, que está abierta y sin demostrar. Cualquier uso que asuma unicidad o completitud basada en esa conjetura es arriesgado.
- El mapeo entre los identificadores `F1, F4, F7, F11, F12, F18, F19, F22` y los nombres de las 21 fórmulas es desconocido y no debe fabricarse. Solo se sabe que hay exactamente 8 fórmulas bloqueadas como probadas.
- La licencia Apache-2.0 permite uso comercial, pero la documentación indica que la "doctrina v11" de SZL Holdings puede imponer restricciones adicionales de atribución o gobernanza.
- No hay soporte de idiomas ni internacionalización; la interfaz y la documentación están en inglés.
- Para uso en producción, se recomienda verificar manualmente el estado de prueba de cada fórmula antes de tomar decisiones críticas, dado que la mayoría de las fórmulas no están demostradas.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/SZLHOLDINGS/szl-formulas)
- [Fuente canónica en GitHub](https://github.com/szl-holdings/szl-formulas)
- [Organización SZL Holdings en GitHub](https://github.com/szl-holdings)
- [Perfil de SZL Holdings en Hugging Face](https://huggingface.co/SZLHOLDINGS/models)
- [Documentación de SZL Holdings](https://szl-holdings.github.io/docs-site/)
- [DOI de la versión (Zenodo)](https://doi.org/10.5281/zenodo.19944926)
