# SZLHOLDINGS/szl-govsign

## Resumen

SZLHOLDINGS/szl-govsign no es un modelo de inteligencia artificial: se trata de un kernel de software publicado en Hugging Face bajo la etiqueta `kernels`, desarrollado por SZL Holdings, que construye y firma envelopes de procedencia de gobernanza siguiendo los estándares in-toto y DSSE. Su propósito es generar atestaciones firmadas con ECDSA P-256 sobre un predicado de gobernanza propio (`https://szl.holdings/governance/v1`), que expresa un veredicto (allow/block), una etiqueta de energía (MEASURED-only) y una conjetura abierta sobre la confianza (Λ). El repositorio incluye una API pública con funciones como `attest`, `verify`, `build_governance_predicate`, `generate_ephemeral_keypair` y `selfcheck`.

La relevancia de este paquete radica en que aborda la transparencia y auditabilidad de las decisiones de gobernanza en infraestructuras de IA, un área crítica para responsables de cumplimiento y seguridad. El README es explícito en que no contiene pesos entrenados ni es un modelo de lenguaje: es una pieza de software de firmado criptográfico. El fichero `model.joblib` del hub está marcado como cuarentena y se advierte explícitamente que no debe cargarse con `joblib.load`; la fuente aprobada es el repositorio de GitHub. La licencia es Apache-2.0.

Dado que no se trata de un modelo de IA, las secciones convencionales de una ficha de modelo (arquitectura neuronal, entrenamiento, benchmarks, capacidades de generación) no aplican. Esta ficha documenta el kernel tal y como se publica, marcando como "no disponible" o "no aplica" aquellos campos que no corresponden a un modelo de aprendizaje automático.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de software (no red neuronal); firma ECDSA P-256 sobre envelopes DSSE/in-toto |
| Parametros totales | No aplica (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (el kernel no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (no hay pesos; el paquete contiene código Python y un `model.joblib` en cuarentena) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El kernel implementa la construcción de predicados de gobernanza SZL y su firma mediante ECDSA P-256, siguiendo los formatos de atestación in-toto y DSSE. La lógica incluye la generación de pares de claves efímeras, la verificación de firmas y un autocontrol (`selfcheck`). Las etiquetas de energía están restringidas a valores MEASURED (se rechazan valores modelados o fabricados) y un veredicto BLOCKED se firma siempre como BLOCKED, sin posibilidad de alteración. El código depende únicamente de la biblioteca estándar de Python y de `cryptography`.

El predicado de gobernanza es propio de SZL Holdings y no se basa en esquemas previos. El README menciona como inspiración los sistemas in-toto, DSSE y la transparencia de modelos de Sigstore, pero el predicado `https://szl.holdings/governance/v1` es original. No hay datos de entrenamiento porque no se entrena nada.

## Capacidades

- Generación de atestaciones firmadas: construye envelopes DSSE con predicados de gobernanza SZL y los firma con ECDSA P-256.
- Verificación de firmas: permite comprobar la integridad y la posesión de clave de una atestación mediante la función `verify`.
- Construcción de predicados de gobernanza: `build_governance_predicate` genera el predicado con veredicto, etiqueta de energía y conjetura Λ.
- Generación de pares de claves efímeras: `generate_ephemeral_keypair` facilita claves de un solo uso.
- Autocontrol: `selfcheck` verifica el correcto funcionamiento del kernel.
- Rechazo de valores de energía no medidos: solo se aceptan etiquetas MEASURED; valores modelados o fabricados son rechazados.
- Honestidad en veredictos: un veredicto BLOCKED se firma como BLOCKED, nunca se invierte.
- Limitación estructural de confianza: la firma prueba integridad y posesión de clave, pero no eleva la conjetura Λ a teorema ni desbloquea `proven_trust` (permanece en False).

## Casos de uso

- Auditoría de decisiones de gobernanza en plataformas de IA: el kernel permite firmar decisiones de allow/block para que un auditor externo pueda verificar su integridad y origen.
- Trazabilidad de aprobaciones en pipelines de MLOps: integrar `attest` en un pipeline para registrar qué versión de un modelo fue aprobada y por quién, generando un rastro verificable.
- Cumplimiento normativo: generar atestaciones firmadas que documenten que una decisión se basó en mediciones reales (etiqueta MEASURED) y no en valores simulados, útil ante organismos reguladores.
- Verificación de integridad en distribución de artefactos: usar `verify` para comprobar que un paquete o decisión no ha sido alterado tras su firma.
- Control de acceso basado en políticas: en un sistema de gobernanza, un veredicto BLOCKED firmado impide que un proceso continúe, y la firma garantiza que la decisión no fue manipulada.
- Repositorio de procedencia para modelos de IA: como complemento a sistemas tipo in-toto, registrar la procedencia de un modelo (quién, cuándo, con qué veredicto) en un formato estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El kernel no es un modelo de IA y no tiene métricas de rendimiento de generación, razonamiento o precisión. Las únicas métricas relevantes serían de latencia criptográfica, pero no se proporcionan.

## Requisitos de hardware

- No requiere GPU ni hardware especializado: es software Python puro con dependencia en la librería `cryptography`.
- Funciona en cualquier CPU moderna; el coste computacional de ECDSA P-256 es mínimo.
- Memoria RAM típica: menos de 100 MB para el proceso, dependiendo de la aplicación.
- Despliegue: se puede ejecutar como biblioteca Python en cualquier entorno (servidor, contenedor, función serverless).
- No hay soporte para vLLM, Ollama, TGI u otros runners de modelos, dado que no es un modelo.

## Comparativa con modelos similares

No aplica directamente, pero puede compararse con otros sistemas de firmado de procedencia:

| Sistema | Tipo | Formato de firma | Predicado propio | Licencia |
|---|---|---|---|---|
| SZLHOLDINGS/szl-govsign | Kernel de gobernanza | DSSE/in-toto + ECDSA P-256 | Sí (`https://szl.holdings/governance/v1`) | Apache-2.0 |
| in-toto | Framework de integridad de software | RSA/ECDSA sobre layouts | No (usa layouts definidos por el usuario) | Apache-2.0 |
| Sigstore | Firma de artefactos | X.509 + Rekor | No (usa DSSE y Rekor) | Apache-2.0 |

La diferencia principal es que szl-govsign introduce un predicado de gobernanza propio con semántica de veredicto, energía y conjetura, mientras que los otros son infraestructuras de firma más generales. No existen modelos de IA comparables porque este no es uno.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje. Intentar usarlo como tal no tiene sentido.
- El fichero `model.joblib` en el hub está marcado como QUARANTINED: no debe cargarse con `joblib.load`. La fuente aprobada es el repositorio de GitHub.
- La firma prueba integridad y posesión de clave, pero no prueba la unicidad de la conjetura Λ ni eleva la confianza a "proven trust" (`proven_trust` permanece bloqueado en False).
- Las etiquetas de energía solo aceptan valores MEASURED; cualquier valor modelado o fabricado será rechazado.
- Un veredicto BLOCKED se firma como BLOCKED y no se invierte; esto es intencional pero limita la flexibilidad si se necesita cambiar una decisión.
- La licencia Apache-2.0 permite uso comercial, pero el predicado y la doctrina son propiedad de SZL Holdings; se debe respetar la atribución (copyright 2026 SZL Holdings · Stephen P. Lutar).
- El repositorio no tiene descargas ni likes en Hugging Face, lo que sugiere que es un proyecto muy reciente o de uso interno; su madurez en producción no está demostrada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-govsign
- Árbol de archivos en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-govsign/tree/main
- Organización SZL Holdings en GitHub: https://github.com/szl-holdings
- Documento de arquitectura de gobernanza de IA: https://github.com/szl-holdings/platform/blob/main/docs/architecture/ai-governance.md
- Página de SZL-Nemo (modelo de IA relacionado, no este kernel): https://a-11-oy.com/nemo
- DOI del paquete: https://doi.org/10.5281/zenodo.19944926
- ORCID del autor: https://orcid.org/0009-0001-0110-4173
