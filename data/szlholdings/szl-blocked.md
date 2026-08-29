# SZLHOLDINGS/szl-blocked

## Resumen

`SZLHOLDINGS/szl-blocked` es un kernel de gobernanza fail-closed para infraestructura de IA, desarrollado por SZL Holdings (Stephen P. Lutar). No es un modelo de aprendizaje automático: no contiene pesos entrenados ni arquitectura neuronal. Se publica como un paquete Python bajo Apache-2.0 que implementa un mecanismo de denegación dura (hard DENY) para llamadas a funciones en sistemas agénticos. Cuando una llamada gobernada es denegada, la función objetivo nunca se ejecuta y se escribe un recibo de bloqueo (BLOCKED receipt) en una cadena unificada de recibos.

El problema que resuelve es la trazabilidad y el control de acciones en agentes de IA: permite definir políticas de denegación por defecto, por bandera o por tipo de acción, y registrar cada decisión de forma inmutable. Su relevancia actual radica en que se presenta como una pieza de infraestructura para el cumplimiento del Reglamento de IA de la UE (EU AI Act), concretamente como base para derivar un esqueleto de documentación técnica tipo Anexo IV. El repositorio no incluye pesos, ni benchmarks de latencia, ni soporte CUDA; es un componente de gobernanza de código puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de gobernanza en Python (no red neuronal) |
| Parametros totales | no aplica (no hay pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (API en ingles, documentacion en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (codigo fuente Python; se advierte que `model.joblib` esta en cuarentena y no debe cargarse con `joblib.load`) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red. El kernel implementa una logica de gobernanza con los siguientes componentes: `governed_call` (ejecucion condicionada a una politica), `GovernedGate` (compuerta de control), `deny_by_default` / `deny_if_flag` / `deny_if_action_in` (politicas de denegacion), y `UnifiedReceiptChain` (cadena de recibos con hash). La doctrina de diseno es "hard DENY dominates": una politica de denegacion tiene prioridad absoluta, y cualquier elemento de asesoria (denominado lambda) solo puede endurecer, nunca relajar, la decision. Un estado bloqueado es un estado de primera clase: la funcion protegida nunca se invoca en caso de bloqueo y el resultado queda como `output is None`.

El paquete companion `szl_euaiact` puede derivar un esqueleto de documentacion tecnica tipo Anexo IV del Reglamento de IA de la UE a partir del registro de decisiones, pero se advierte explicitamente que se trata de un borrador de organizacion interna, no de asesoramiento legal ni de declaracion de conformidad. No hay datos de entrenamiento, tokens ni procesos de RLHF/DPO.

## Capacidades

- Ejecucion gobernada de funciones: `governed_call` aplica una politica y devuelve un objeto con `blocked` (bool) y `output` (valor o `None`).
- Politicas de denegacion configurables: `deny_by_default` (denegacion por defecto), `deny_if_flag` (denegacion si una bandera esta activa), `deny_if_action_in` (denegacion si la accion solicitada esta en un conjunto prohibido).
- Registro de decisiones: `UnifiedReceiptChain` almacena recibos de bloqueo y de permiso en una cadena encadenada por hash, permitiendo auditoria posterior.
- Integracion con otros kernels del ecosistema SZL: se puede usar junto con `szl-governed-norm`, `szl-lambda-gate` y `governed-inference-meter` mediante `get_kernel`.
- Derivacion de esqueleto de documentacion Anexo IV (EU AI Act) a traves del paquete companion `szl_euaiact`, con marcadores TODO explicitos.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling de modelos de IA.

## Casos de uso

- Gobernanza de acciones de agentes autonomos: un agente que pueda ejecutar acciones como `exfiltrate` o `delete_all` se protege con una politica `deny_if_action_in`; la accion prohibida nunca llega a ejecutarse y queda registrada.
- Auditoria de decisiones en produccion: la cadena de recibos permite reconstruir que llamadas fueron permitidas y cuales bloqueadas, con su contexto, para cumplimiento normativo o revision posterior.
- Control de acceso por banderas: en despliegues multi-tenant, `deny_if_flag` permite desactivar funcionalidades sensibles segun el arrendatario sin cambiar el codigo de la aplicacion.
- Preparacion de documentacion para el EU AI Act: usar `szl_euaiact` para generar un borrador de Anexo IV a partir de los registros de gobernanza, como punto de partida para equipos legales.
- Intercepcion de llamadas en pipelines de inferencia: integrar `governed_call` como capa intermedia antes de invocar un modelo, para bloquear peticiones que violen politicas definidas.
- Demostracion de fail-closed en sistemas criticos: validar en entornos de pruebas que una funcion protegida no se ejecuta bajo ninguna circunstancia cuando la politica lo prohibe, gracias a la semantica de `BlockedResult.output is None`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de latencia, throughput ni pruebas CUDA, y se indica explicitamente que no hay benchmarks de rendimiento en esta publicacion.

## Requisitos de hardware

- No requiere GPU ni aceleradores: es codigo Python puro.
- CPU minima: cualquier sistema capaz de ejecutar Python 3.x.
- Memoria: despreciable (depende de la longitud de la cadena de recibos, no de parametros de red).
- Despliegue: se integra como libreria en entornos existentes (servidores, contenedores, funciones serverless) mediante `pip install` o clonando el repositorio.
- No necesita vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros modelos de lenguaje o generativos. En el ecosistema de SZL Holdings existen otros kernels de gobernanza (`szl-governed-norm`, `szl-lambda-gate`, `governed-inference-meter`) que comparten la infraestructura de `UnifiedReceiptChain`, pero no se dispone de datos publicos de rendimiento ni de una comparativa formal entre ellos.

## Limitaciones y advertencias

- No es un modelo de IA: no proporciona capacidades de generacion, razonamiento ni analisis de datos. Intentar usarlo como tal dara un error funcional.
- No es asesoramiento legal ni una declaracion de conformidad con el EU AI Act. El esqueleto Anexo IV derivado por `szl_euaiact` es un borrador con TODOs y no debe presentarse como evidencia de cumplimiento.
- El archivo `model.joblib` del repositorio esta marcado como QUARANTINED (cuarentena). No debe cargarse con `joblib.load` porque podria contener serializacion ejecutable no segura.
- La doctrina "hard DENY dominates" implica que cualquier politica de denegacion prevalece sobre logicas de permiso; esto puede provocar bloqueos inesperados si las politicas no se configuran correctamente.
- No hay garantia de que la cadena de recibos sea inmutable frente a manipulacion del entorno; la seguridad depende de la integridad del host donde se ejecuta.
- El paquete es de un unico mantenedor (SZL Holdings) y tiene cero descargas en HuggingFace; su madurez en produccion no esta contrastada por una comunidad amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-blocked
- Paquete Hub (kernels): https://huggingface.co/kernels/SZLHOLDINGS/szl-blocked
- GitHub canonico: https://github.com/szl-holdings/szl-blocked
- Organizacion GitHub: https://github.com/szl-holdings
- Repositorio de la suite de kernels: https://github.com/szl-holdings/szl-kernels
- Space de demostracion: https://huggingface.co/spaces/SZLHOLDINGS/szl-blocked-live
- Developer Hub: https://holdings.a-11-oy.com/docs-site/developers/
- DOI: 10.5281/zenodo.19944926
- ORCID del autor: https://orcid.org/0009-0001-0110-4173
