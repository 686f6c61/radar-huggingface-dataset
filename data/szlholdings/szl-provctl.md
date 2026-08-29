# SZLHOLDINGS/szl-provctl

## Resumen

SZLHOLDINGS/szl-provctl es un kernel de software para el control de procedencia (provenance) en cadenas de suministro de IA, publicado por SZL Holdings. No se trata de un modelo de inteligencia artificial: no contiene pesos entrenados, no realiza inferencia ni procesamiento de lenguaje. Su propósito es emitir y verificar declaraciones de procedencia conforme a los estándares in-toto Statement v1 y SLSA provenance v1, a partir de una cadena unificada de recibos (`UnifiedReceiptChain`), y recorrer un grafo dirigido acíclico (DAG) de procedencia para auditar la trazabilidad de cada paso de un pipeline.

El kernel expone una API pública en Python (`statement_from_chain`, `slsa_statement`, `ProvenanceDAG`, `verify_dag`, `measure_kernel_energy`, `selfcheck`) y puede medir el consumo energético real por kernel mediante NVML cuando hay una GPU presente, sin fabricar datos si no la hay. Su relevancia actual radica en la creciente necesidad de gobernanza, auditoría y transparencia en sistemas de IA, donde la procedencia de los artefactos (datos, modelos, configuraciones) es crítica para el cumplimiento normativo y la confianza. El repositorio se publica bajo licencia Apache-2.0 y el código fuente canónico reside en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de software (no es un modelo de redes neuronales) |
| Parametros totales | No aplica (no contiene pesos entrenados) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (software de control, no procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica; se distribuye como paquete Python (`kernels`) con código fuente |

## Arquitectura y entrenamiento

szl-provctl no se entrena; es un componente de software diseñado para integrarse en infraestructuras de gobernanza de IA. Su arquitectura interna se basa en una cadena de recibos unificados (`UnifiedReceiptChain`) que acumula eventos de ejecución (por ejemplo, la aplicación de una norma de gobernanza a una operación como `rms_norm`). A partir de esa cadena, el kernel genera declaraciones in-toto Statement v1 y SLSA provenance v1, que son formatos estándar para documentar la procedencia de artefactos en la cadena de suministro. También implementa un `ProvenanceDAG` que permite recorrer el grafo de dependencias de forma explícita, manteniendo los nodos bloqueados (`BLOCKED`) en el DAG en lugar de eliminarlos silenciosamente.

El kernel incluye una función de auto-chequeo (`selfcheck`) que valida su propio estado y una función de medición de energía (`measure_kernel_energy`) que, cuando hay una GPU con soporte NVML, calcula el delta energético real por kernel. Si no hay GPU, devuelve `joules=None` o `UNAVAILABLE_NO_NVML`, nunca valores inventados. La propiedad `proven_trust` está estructuralmente bloqueada a `False`, lo que indica que el kernel no afirma una confianza probada, sino que expone el estado real de la cadena de procedencia. El proyecto sigue la "Doctrine v11" de SZL Holdings y referencia un DOI (10.5281/zenodo.19944926) para su registro académico.

## Capacidades

- Emisión de declaraciones in-toto Statement v1 y SLSA provenance v1 a partir de una `UnifiedReceiptChain`.
- Recorrido y verificación de un DAG de procedencia (`ProvenanceDAG` / `verify_dag`), incluyendo la gestión explícita de nodos bloqueados.
- Medición de consumo energético real por kernel mediante NVML (solo si hay GPU presente; nunca fabrica datos).
- Auto-chequeo del estado del kernel (`selfcheck`), devolviendo un resultado booleano de integridad.
- Integración con el ecosistema de kernels de Hugging Face mediante `get_kernel("SZLHOLDINGS/szl-provctl", trust_remote_code=True)`.
- Compatibilidad declarada con los formatos de procedencia in-toto y SLSA, aunque la verificación externa debe probarse en cada entorno.

## Casos de uso

- Auditoría de cadenas de suministro de IA: el kernel permite registrar cada paso de un pipeline (desde la ingesta de datos hasta el despliegue) en una cadena de recibos y generar declaraciones in-toto/SLSA que pueden ser verificadas por terceros, facilitando la trazabilidad completa.
- Cumplimiento normativo: organizaciones que necesitan demostrar el origen y la integridad de sus artefactos de IA ante reguladores pueden usar szl-provctl para generar evidencias estructuradas y verificables.
- Verificación de integridad de artefactos: al mantener los nodos bloqueados en el DAG, el kernel asegura que los pasos rechazados no se oculten, permitiendo a los auditores ver exactamente qué se bloqueó y por qué.
- Monitorización energética de kernels: en entornos con GPU, `measure_kernel_energy` proporciona mediciones reales de consumo por operación, útil para informes de sostenibilidad o para optimizar el uso de recursos.
- Gobernanza interna de pipelines: equipos de MLOps pueden integrar el kernel como un componente de control que registra cada ejecución y genera un rastro auditable, reduciendo el riesgo de decisiones no documentadas.
- Investigación en procedencia de IA: el kernel sirve como referencia para estudiar cómo se pueden estructurar y verificar declaraciones de procedencia en sistemas de IA, especialmente en entornos donde la confianza es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no aplican métricas como MMLU, HumanEval o GSM8K. El rendimiento del kernel depende del tamaño de la cadena de recibos y del DAG, y no se proporcionan datos de latencia o throughput en la documentación consultada.

## Requisitos de hardware

- El kernel es software ligero; no requiere GPU para su funcionamiento básico (emisión de declaraciones, verificación de DAG).
- Para la medición de energía (`measure_kernel_energy`) se necesita una GPU con soporte NVML; sin ella, la función devuelve `UNAVAILABLE_NO_NVML`.
- No se especifican requisitos mínimos de CPU o memoria; al ser un paquete Python, funciona en cualquier entorno con Python 3.x y las dependencias necesarias.
- Opciones de despliegue: puede ejecutarse como un módulo dentro de un pipeline de Python, integrarse en servicios de gobernanza o utilizarse en scripts de auditoría. No requiere infraestructura específica de inferencia (vLLM, llama.cpp, etc.).
- La carga de trabajo típica es de baja latencia, ya que solo procesa metadatos y estructuras de datos, no realiza cómputo intensivo.

## Comparativa con modelos similares

No disponible. szl-provctl no es un modelo de IA y no tiene comparables directos en la categoría de modelos de lenguaje o visión. Como herramienta de procedencia, se puede comparar con estándares como in-toto o SLSA, pero estos son especificaciones, no implementaciones de software. No se dispone de información sobre otras implementaciones de kernel con las mismas capacidades en el ecosistema de Hugging Face.

## Limitaciones y advertencias

- El repositorio contiene un archivo `model.joblib` marcado como **CUARENTENADO**: se trata de serialización ejecutable y no debe cargarse con `joblib.load`. Es un riesgo de seguridad potencial.
- No es un producto de firma completo: la firma digital se gestiona en otro componente (`szl-govsign`). szl-provctl solo genera declaraciones y verifica integridad, no firma.
- La compatibilidad con verificadores externos de in-toto/SLSA debe probarse en cada entorno; la declaración de interoperabilidad es auto-verificada por el repositorio, no por terceros.
- `proven_trust` está estructuralmente bloqueado a `False`: el kernel no afirma confianza probada, solo expone el estado real de la cadena.
- La medición de energía solo es posible con GPU y NVML; en su ausencia, no se proporcionan datos energéticos.
- No es un modelo de IA: no puede generar texto, código ni realizar razonamiento. Usarlo como tal sería un error conceptual.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de verificar la seguridad del código antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-provctl
- Repositorio GitHub: https://github.com/szl-holdings/szl-provctl
- Organización SZL Holdings en GitHub: https://github.com/szl-holdings
- Perfil de SZL Holdings en Hugging Face: https://huggingface.co/SZLHOLDINGS/models
- Registro de evidencias A11oy: https://a11oy.net/
- DOI: 10.5281/zenodo.19944926
