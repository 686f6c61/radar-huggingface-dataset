# SZLHOLDINGS/a11oy-v19-substrate

## Resumen

A11oy no es un modelo de inteligencia artificial, sino un sustrato de ejecución gobernada (governed execution substrate) desarrollado por SZLHOLDINGS. Se presenta como un paquete operativo que integra compuertas de política (policy gates), medición de señales, enrutamiento de conocimiento, integridad de recibos derivada de QEC y una carga útil operativa verificable desde GitHub. Su propósito declarado es convertir acciones de agentes de IA en decisiones gobernadas, revisables y respaldadas por recibos, de modo que cada acción pase por comprobaciones de doctrina, cada carga útil esté sujeta a checksums y cada afirmación pública quede vinculada a un contrato de procedencia.

El repositorio en Hugging Face actúa como escaparate público del paquete operativo, mientras que GitHub se mantiene como fuente canónica de código, CI, SBOM, SLSA, DCO, manifiestos de despliegue, checksums y procedencia de versiones. La propia model card advierte explícitamente: "No cargar en transformers" y "No es un modelo". Por tanto, no existe arquitectura neuronal, pesos ni checkpoint alguno. Su relevancia radica en proponer un marco de gobernanza y auditoría para despliegues de IA agéntica, orientado a entornos con requisitos de cumplimiento como UDS (Unified Data Store) y Zarf, y dirigido a inversores y operadores en fase Series A.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (etiqueta `en` en el repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (no hay pesos; el repositorio contiene scripts, manifiestos, documentacion y archivos de verificacion) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. A11oy se describe como un "sustrato de ejecución" compuesto por un monorepo de TypeScript con paquetes de doctrina, un generador de recibos firmados (DSSE), manifiestos de despliegue para Zarf y Kubernetes, y un conjunto de comandos de verificación (`pnpm test:doctrine`, `pnpm payload:verify`, etc.). El repositorio incluye un flujo de trabajo de GitHub Actions que genera un paquete operativo (`a11oy-operational-payload.tar.gz`) con sidecar SHA-256. No hay datos de entrenamiento, tokens ni técnicas como RLHF o DPO.

## Capacidades

- Gobernanza de acciones de agentes de IA mediante compuertas de política con denegación por defecto (deny-by-default).
- Generación de recibos firmados para cada acción, con integridad basada en QEC (Quantum Error Correction, segun la documentacion del autor).
- Enrutamiento de conocimiento y medición de señales dentro de un "Command Center" de IA gobernada.
- Verificación de procedencia: cada artefacto público se vincula a un commit de GitHub mediante `a11oy-metadata.json`.
- Integración con UDS y Zarf para despliegue en entornos airgap.
- Auditoría de ecosistema: escaneo de repositorios, SBOM, Trivy, CodeQL, DCO y detección de secretos.
- No ofrece generación de texto, razonamiento, código, visión ni tool calling, al no ser un modelo.

## Casos de uso

- Despliegue de agentes de IA en entornos regulados: A11oy actúa como capa de control entre el agente y sus acciones, aplicando políticas de doctrina antes de ejecutar cualquier operación. Adecuado para sectores con requisitos de auditoría (financiero, sanitario, gubernamental).
- Cumplimiento normativo (NIST AI RMF, EU AI Act, CISA SBOM, SLSA): el paquete incluye un mapa de evidencia de mercado que relaciona cada requisito con artefactos concretos del repositorio, facilitando la preparación de auditorías.
- Verificación de procedencia en pipelines de CI/CD: cada release genera un tarball determinista con checksums y firmas, permitiendo reproducir y validar artefactos de forma independiente.
- Revisión de diligencia debida para inversores: el paquete Series A incluye informes de capacidad, mapa de ecosistema y pruebas de ejecución, pensado para que un inversor pueda verificar afirmaciones sin depender de la palabra del autor.
- Gobernanza de agentes en infraestructura UDS/Zarf: permite empaquetar y desplegar el sustrato en entornos aislados (airgap) con manifiestos Kubernetes, manteniendo la trazabilidad de cada decisión.
- Auditoría de ecosistema de repositorios: los comandos `pnpm ecosystem:audit` y `pnpm github:access:audit` permiten evaluar el estado de múltiples repositorios públicos y su preparación para demostraciones o producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen métricas como MMLU, HumanEval o GSM8K. El repositorio incluye pruebas de doctrina y contratos de política, pero no resultados comparativos de rendimiento de modelos.

## Requisitos de hardware

- No aplica: no hay inferencia de modelos, por lo que no se requiere VRAM ni GPU.
- El sustrato se ejecuta como software (TypeScript/Node.js) y puede desplegarse en cualquier infraestructura que soporte contenedores Kubernetes o Zarf.
- Para ejecutar los comandos de verificación se necesita un entorno con Node.js y `pnpm` instalados.
- No hay estimaciones de latencia ni throughput, al no existir procesamiento de modelos.

## Comparativa con modelos similares

No disponible. A11oy no pertenece a la categoría de modelos de lenguaje o IA generativa, por lo que no es comparable con alternativas como Llama, Mistral o Qwen. La propia documentación menciona a Anthropic, NVIDIA y Unsloth como referencias de "seriedad operativa", pero no como competidores directos en funcionalidad.

## Limitaciones y advertencias

- No es un modelo de IA: no puede cargarse en transformers ni usarse para generación de texto, razonamiento o código.
- La model card advierte explícitamente: "No cargar en transformers" y "No es un modelo".
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere una adopción nula o muy temprana.
- La fecha de creación (2026-05-29) y actualización (2026-09-02) son futuras respecto a la fecha actual, lo que puede indicar datos simulados o un entorno de prueba.
- La licencia Apache-2.0 se aplica a los archivos generados en el mirror, pero no a modelos, datasets o componentes de terceros que pudieran estar referenciados.
- Existen caveats explícitos en la documentación: el paquete `uds-v0.3.0` solo incluye activos SBOM, `vessels uds-v0.3.0` no tiene activos de release, y la disponibilidad de paquetes GHCR requiere confirmación del propietario.
- Riesgo de alucinación: no aplica al no ser un modelo, pero sí existe riesgo de que las afirmaciones de gobernanza y procedencia no sean verificables de forma independiente sin acceso a los repositorios privados del autor.
- Sesgos: no aplica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/a11oy-v19-substrate
- GitHub canónico: https://github.com/szl-holdings/a11oy
- GitHub szl-substrate: https://github.com/szl-holdings/szl-substrate
- Registro de pruebas A11oy: https://a11oy.net/
- Página de análisis de seguridad (Palo Alto Networks): https://insights-db.paloaltonetworks.com/models/SZLHOLDINGS/a11oy-v19-substrate/9f03f6ed3896cf92f617a656e32c7fa5303d058b/overview
- Discusión en Hugging Face sobre integración con GitHub: https://huggingface.co/SZLHOLDINGS/a11oy-v19-substrate/discussions/1
