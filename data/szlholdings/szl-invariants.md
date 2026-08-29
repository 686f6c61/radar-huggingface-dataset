# SZLHOLDINGS/szl-invariants

## Resumen

SZLHOLDINGS/szl-invariants es un kernel de gobernanza puro en Python, sin dependencias externas, que reproduce de forma offline los ocho invariantes falsables de recibos y ledger que el sistema "a11oy backbone" expone en su API `/api/invariants`. No es un modelo de aprendizaje automático: no contiene pesos, no hay tensores, no hay arquitectura neuronal. Se distribuye como un paquete de código identificado con la librería `kernels` en Hugging Face, pensado para auditoría, verificación de integridad y trazabilidad de decisiones en infraestructura de IA gobernada.

El kernel está desarrollado por SZL Holdings (Stephen P. Lutar, ORCID 0009-0001-0110-4173) y se publica bajo licencia Apache-2.0. Su relevancia actual radica en la creciente necesidad de verificar de forma independiente la consistencia de registros generados por sistemas de IA, especialmente en entornos con requisitos de cumplimiento y auditoría. La versión del repositorio es de julio de 2026, con actualización en agosto de 2026. El repositorio en Hugging Face tiene 0 descargas y 2 likes, y el tamaño del repo es 0.0 GB (solo código fuente).

El paquete incluye una advertencia explícita: el archivo `model.joblib` presente en el hub está **CUARENTENADO** como serialización ejecutable y no debe cargarse con `joblib.load`. Además, el autor aclara que pasar `selfcheck` no equivale a una evaluación en un leaderboard de modelos. El kernel no toca la "Lambda" (Conjecture 1), que permanece abierta y sin probar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo neuronal; es un kernel de software Python puro, stdlib-only) |
| Parametros totales | No aplica (0 pesos; solo código fuente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible (solo interfaz Python; mensajes internos en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (no hay pesos; código fuente Python + archivo `model.joblib` cuarentenado) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El paquete es un conjunto de funciones Python que implementan ocho verificaciones deterministas sobre archivos JSONL de recibos y ledger. La lógica incluye verificación de firmas Ed25519, comprobación de continuidad de cadenas de recibos, coherencia de columnas firmadas, positividad de pasos de bucle, trazabilidad de linaje y shape de fallos. No hay datos de entrenamiento, no hay tokens, no hay RLHF ni DPO. La innovación técnica reside en la naturaleza falsable de los invariantes: un invariante violado permanece violado, y los estados de verificación (`HOLDS`, `VIOLATED`, `KEY_ROTATED`, `NO_DATA`, `UNAVAILABLE`) son de primera clase. El kernel está diseñado para ser invocado mediante `get_kernel("SZLHOLDINGS/szl-invariants", trust_remote_code=True)` y ofrece una API pública con `run_invariants`, `load_jsonl`, `verify_ed25519` y `selfcheck`.

## Capacidades

- Verificación offline de ocho invariantes de recibos y ledger: `receipt-chain-continuity`, `ledger-failure-shape`, `served-run-has-model`, `signed-columns-atomic`, `loop-steps-positive`, `receipt-ed25519-verify`, `receipt-columns-consistent`, `flywheel-lineage`.
- Reproducción exacta de los mismos checks que el backend a11oy ejecuta en `/api/invariants`, pero sin conexión a red.
- Verificación de firmas digitales Ed25519 sobre recibos (requiere clave pública en formato SPKI base64).
- Estados de verificación explícitos y no coercibles: un invariante violado no puede ser forzado a pasar.
- Autocomprobación (`selfcheck`) para validar la integridad del propio kernel.
- Sin dependencias externas: usa solo la biblioteca estándar de Python.
- No es un modelo generativo: no genera texto, no razona, no procesa lenguaje natural ni código.

## Casos de uso

- Auditoría de cumplimiento en sistemas de IA gobernada: el kernel permite a un auditor externo verificar de forma independiente si los registros de decisiones (recibos y ledger) cumplen los ocho invariantes, sin depender del servicio en línea.
- Verificación de integridad de datos antes de un despliegue: un equipo de operaciones puede ejecutar `run_invariants` sobre un export JSONL de producción para detectar inconsistencias antes de migrar a un nuevo entorno.
- Trazabilidad de decisiones en pipelines de ML: ayuda a confirmar que cada ejecución servida tiene su modelo asociado, que las columnas firmadas no se han alterado y que la cadena de recibos es continua, lo que facilita la rendición de cuentas.
- Control de calidad en la ingesta de datos: `ledger-failure-shape` y `loop-steps-positive` permiten detectar anomalías en el registro de fallos y en los bucles de procesamiento.
- Verificación de rotación de claves: el estado `KEY_ROTATED` permite comprobar que la rotación de claves Ed25519 se ha registrado correctamente sin invalidar los recibos anteriores.
- Auditoría forense de incidentes: si se sospecha manipulación de registros, el kernel puede ejecutarse sobre copias congeladas de los JSONL para determinar qué invariantes se violan y en qué punto de la cadena.
- Cumplimiento normativo en sectores regulados: al ser un paquete Apache-2.0, puede integrarse en herramientas de auditoría interna sin coste de licencia y sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que pasar `selfcheck` no constituye una evaluación comparable a un leaderboard de modelos. No hay métricas de latencia, throughput ni precisión porque no se trata de un modelo de inferencia.

## Requisitos de hardware

- No requiere GPU. Es un kernel de CPU puro que usa exclusivamente la biblioteca estándar de Python.
- Cualquier máquina con Python 3.8+ (o superior) puede ejecutarlo, incluyendo instancias pequeñas de tipo t2.micro o contenedores ligeros.
- El consumo de memoria depende del tamaño de los archivos JSONL a procesar; para archivos de cientos de MB se recomienda al menos 2 GB de RAM.
- No hay requisitos de VRAM ni de GPUs específicas.
- Opciones de despliegue: ejecución directa en línea de comandos, integración en scripts de CI/CD, uso como librería en cualquier framework Python. No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: del orden de milisegundos a segundos según el volumen de registros; no es un sistema de tiempo real.

## Comparativa con modelos similares

No aplica directamente porque no es un modelo de IA. Como herramienta de verificación de integridad, podría compararse con:

| Herramienta | Tipo | Funcion principal | Licencia |
|---|---|---|---|
| szl-invariants | Kernel de gobernanza offline | Verifica ocho invariantes de recibos/ledger con firma Ed25519 | Apache-2.0 |
| Open Policy Agent (OPA) | Motor de políticas | Evaluación de políticas declarativas (Rego) sobre datos | Apache-2.0 |
| Sigstore / cosign | Firmado y verificación de artefactos | Firma y verificación de integridad de artefactos de software | Apache-2.0 |
| eth-proof (Truffle) | Pruebas de integridad para Ethereum | Verificación de pruebas de inclusión y estado | MIT |

La diferencia clave es que szl-invariants está diseñado específicamente para el ecosistema a11oy de SZL Holdings, con invariantes fijos y un formato JSONL propio. OPA es más generalista pero requiere definir políticas. Sigstore se centra en artefactos de software, no en ledgers de ejecución de IA. No hay comparativa de rendimiento publicada.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, código ni razonar. Cualquier intento de usarlo como tal es un error.
- El archivo `model.joblib` en el hub está marcado como CUARENTENADO: no debe cargarse con `joblib.load` ni con ninguna otra técnica de deserialización, ya que podría ejecutar código arbitrario.
- Los invariantes verifican la consistencia interna de los registros, pero no demuestran que el export sea completo ni que los datos de origen sean correctos.
- La verificación de firmas Ed25519 requiere la clave pública correcta en formato SPKI base64; si no se proporciona, el invariante #6 devuelve `UNAVAILABLE`.
- El invariante #8 (`flywheel-lineage`) requiere muestras de entrenamiento; si no se proporcionan, devuelve `UNAVAILABLE`.
- La "Conjecture 1" (Λ) sobre unicidad permanece sin probar y no es abordada por estos invariantes; el veredicto es ADVISORY.
- No hay garantías de que los invariantes cubran todos los posibles modos de fallo o manipulación; son ocho checks específicos del sistema a11oy.
- El repositorio tiene 0 descargas y 2 likes, lo que indica una adopción muy limitada; no hay evidencia de uso en producción más allá del propio autor.
- Aunque la licencia Apache-2.0 permite uso comercial, la falta de documentación externa y de comunidad puede dificultar su integración en entornos no relacionados con SZL Holdings.
- El autor no proporciona información sobre idiomas soportados ni sobre internacionalización; los mensajes del kernel están en inglés.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-invariants
- Código fuente canónico en GitHub: https://github.com/szl-holdings/szl-invariants
- Organización SZL Holdings en GitHub: https://github.com/szl-holdings
- Perfil de la organización en Hugging Face: https://huggingface.co/SZLHOLDINGS/models
- DOI registrado: 10.5281/zenodo.19944926
- ORCID del autor: https://orcid.org/0009-0001-0110-4173
