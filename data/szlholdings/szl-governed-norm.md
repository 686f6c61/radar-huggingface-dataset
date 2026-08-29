# SZLHOLDINGS/szl-governed-norm

## Resumen

`szl-governed-norm` es un kernel de normalización (RMSNorm y LayerNorm) desarrollado por SZL Holdings, publicado en el Hugging Face Kernel Hub. No es un modelo de IA generativa ni un modelo entrenado en el sentido convencional: se trata de una implementación de software en PyTorch puro, verificada en corrección, que añade una capa de gobernanza mediante una cadena de recibos SHA3-256 para hacer auditable cada llamada a nivel de kernel. Su propuesta de valor no es la velocidad bruta, sino la procedencia verificable y la integridad del código.

El repositorio incluye además un "surrogate" (clasificador sklearn entrenado, `model.joblib`) que predice la clase de violación de norma que un replay completo del kernel asignaría, con una fidelidad medida de 0.8632 frente al kernel en una partición de validación. El proyecto está marcado como deprecado para nueva adopción (estado *compatibility-only*), habiendo migrado su desarrollo al sucesor `SZLHOLDINGS/szl-lambda-gate`. A fecha de la información disponible, el sucesor aún no publica el subárbol de compatibilidad `governed_norm`, por lo que los llamadores en producción deben fijar la revisión legada `27faddd262c6ee36d08aad9ae234595d75a999f1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de normalización (RMSNorm y LayerNorm) en PyTorch puro; incluye un clasificador sklearn como surrogate opcional |
| Parametros totales | no aplica (no es un modelo de red neuronal; el surrogate sklearn tiene parametros internos no publicados) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (codigo fuente Python; el surrogate se distribuye como `model.joblib`) |

## Arquitectura y entrenamiento

El componente principal es un kernel de normalización implementado en PyTorch puro, con dos variantes: RMSNorm y LayerNorm. La implementación está verificada en corrección (correctness-verified) y opcionalmente genera recibos de gobernanza (SHA3-256) que permiten auditar cada llamada. No se trata de un modelo entrenado con datos; es software de infraestructura.

El "surrogate" es un clasificador sklearn entrenado para triage: predice qué clase de violación de norma asignaría un replay completo del kernel. Según la model card, alcanza una fidelidad de 0.8632 (acuerdo con el kernel en una partición de validación), con recall del 100% para violaciones de cadena de recibos, epsilon y de tipo, pero con un punto ciego medido en la corrección numérica. El surrogate no sustituye al kernel de referencia ni a `ReceiptChain.verify()`.

## Capacidades

- Normalización RMSNorm y LayerNorm con verificación de corrección.
- Cadena de recibos SHA3-256 opcional para auditoría de llamadas a nivel de kernel.
- Detección de violaciones de norma: violaciones de cadena de recibos, epsilon y tipo (recall 100% según la documentación).
- Clasificador surrogate (sklearn) para triage rápido de clases de violación, con fidelidad 0.8632.
- Compatibilidad con el ecosistema Hugging Face Kernel Hub (resolución mediante `get_kernel(...)`).
- No es un modelo generativo: no genera texto, código, ni realiza razonamiento.

## Casos de uso

- Auditoría de pipelines de normalización: el kernel permite registrar recibos criptográficos de cada llamada, útil en entornos regulados donde se requiere trazabilidad de las operaciones de preprocesado.
- Verificación de integridad en despliegues de modelos: al integrar el kernel en un pipeline de inferencia, se puede comprobar que las capas de normalización no han sido alteradas respecto a una versión verificada.
- Triage de fallos en producción: el surrogate clasifica rápidamente si un fallo corresponde a una violación de cadena, epsilon o tipo, reduciendo el tiempo de diagnóstico.
- Migración controlada: como artefacto de compatibilidad, permite a equipos existentes mantener sus integraciones mientras planifican la migración a `szl-lambda-gate`.
- Investigación en gobernanza de IA: sirve como caso de estudio de cómo aplicar procedencia y verificación a componentes de software de modelos.
- Entornos con requisitos de cumplimiento (p. ej., sector financiero o salud): la cadena de recibos ofrece evidencia auditable de que las operaciones de normalización se ejecutaron con la versión exacta del código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento (latencia, throughput) en la información disponible. La única métrica cuantitativa publicada es la fidelidad del surrogate: 0.8632 de acuerdo con el kernel en una partición de validación, con recall del 100% para violaciones de cadena/epsilon/tipo y un punto ciego en corrección numérica. No hay comparativas con otros kernels de normalización en términos de velocidad.

## Requisitos de hardware

- Es un kernel de software, no un modelo de red neuronal: no requiere VRAM específica ni GPU concreta.
- Se ejecuta sobre PyTorch, por lo que funciona en CPU y GPU (dependiendo de la configuración de PyTorch).
- El surrogate sklearn es ligero y puede ejecutarse en CPU.
- Opciones de despliegue: integración directa en código Python con PyTorch; no requiere servidores de inferencia como vLLM u Ollama.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros modelos de lenguaje o visión. En el ámbito de kernels de normalización, las alternativas serían implementaciones estándar como `torch.nn.RMSNorm` o `torch.nn.LayerNorm`, pero no se dispone de datos comparativos publicados. La propuesta diferencial de `szl-governed-norm` es la gobernanza y verificación, no el rendimiento.

## Limitaciones y advertencias

- Estado deprecado: el proyecto está marcado como *compatibility-only* y su desarrollo canónico ha migrado a `SZLHOLDINGS/szl-lambda-gate`. No se recomienda para nueva adopción.
- El sucesor (`szl-lambda-gate`) aún no publica el subárbol `governed_norm` en su revisión inmutable actual, por lo que no es un reemplazo directo en el Hub.
- El surrogate tiene un punto ciego medido en la corrección numérica: no detecta todos los errores numéricos, solo violaciones de cadena, epsilon y tipo.
- El surrogate nunca sustituye al kernel de referencia ni a `ReceiptChain.verify()`; su uso es solo de triage.
- No es un modelo de IA: no genera contenido, no tiene capacidades de lenguaje ni razonamiento.
- La licencia Apache-2.0 permite uso comercial, pero el estado de deprecación implica que el soporte y mantenimiento son limitados.
- La verificación de procedencia demuestra integridad y origen, no exactitud ni rendimiento (según la propia documentación).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-governed-norm
- Repositorio GitHub (legado): https://github.com/szl-holdings/szl-governed-norm
- Sucesor en HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-lambda-gate
- Sucesor en GitHub (fuente plegada): https://github.com/szl-holdings/szl-lambda-gate/tree/d3a91edbe2595bac1ead1007963b4b7b8857eb19/torch-ext/szl_lambda_gate/governed_norm
- Documentación de SZL Holdings: https://szl-holdings.github.io/docs-site/
- DOI: 10.5281/zenodo.19944926
