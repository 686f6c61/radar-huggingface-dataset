# SZLHOLDINGS/szl-energy-attest

## Resumen

`szl-energy-attest` no es un modelo de inteligencia artificial generativa, sino un artefacto de software para la atestación de energía en entornos de computación gobernada. Desarrollado por SZL Holdings, este repositorio proporciona un mecanismo para registrar recibos de energía verificables durante ejecuciones de inferencia, basados en mediciones reales de NVML (joules) o, en su ausencia, un valor `null` honesto etiquetado como `UNAVAILABLE`. Su propósito es aportar transparencia y trazabilidad al consumo energético de cargas de trabajo de IA, un aspecto cada vez más relevante para auditorías de sostenibilidad y cumplimiento normativo.

El sistema genera recibos encadenados con hash SHA-256 a prueba de manipulaciones, e incluye etiquetas de tipo de energía (`MEASURED`, `REPORTED`, `UNAVAILABLE`) para distinguir entre mediciones directas, contextos externos y ausencia de medidor. Además, integra una superficie de firma DSSE/ECDSA-P256 para recibos firmados y declara una doctrina formal con 8 fórmulas verificadas (F1, F4, F7, F11, F12, F18, F19, F22). El repositorio en Hugging Face actúa como espejo de publicación del código fuente canónico alojado en GitHub.

Aunque no es un modelo de lenguaje, su relevancia radica en que proporciona la infraestructura de medición y atestación necesaria para sistemas de IA gobernada, complementando otros componentes del ecosistema SZL Holdings como el servidor MCP y los recibos de gobernanza. Está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de software, no un modelo de IA) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; documentacion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (codigo fuente Python, no pesos de modelo) |

## Arquitectura y entrenamiento

Este artefacto no sigue una arquitectura de red neuronal ni ha sido entrenado con datos. Se trata de un paquete de software (probablemente Python) que implementa una libreria de medicion de energia y generacion de recibos. Su diseño se basa en:

- Integración con NVML para obtener lecturas de energía de GPUs compatibles.
- Construcción de recibos encadenados mediante SHA-256, donde cada recibo referencia al anterior, garantizando integridad.
- Etiquetado tipado de energía: `MEASURED` (medidor activo), `REPORTED` (contexto externo) y `UNAVAILABLE` (sin medidor, registrado como `null`).
- Soporte opcional de firma DSSE/ECDSA-P256 para recibos firmados.
- Una "doctrina" que distingue entre agregación Lambda-Spine (advisory, no teorema) y fórmulas verificadas formalmente (8 en total).

No hay datos de entrenamiento, ni tokens, ni proceso de RLHF/DPO. La "innovación técnica" reside en su enfoque de atestación energética honesta: nunca fabrica un joule, sino que reporta la ausencia de medidor explícitamente.

## Capacidades

- Medición de energía GPU en tiempo real mediante NVML (joules consumidos).
- Cálculo de tokens por joule para ejecuciones de inferencia.
- Generación de recibos con cadena de hash SHA-256, a prueba de manipulaciones.
- Etiquetado tipado de energía (`MEASURED`, `REPORTED`, `UNAVAILABLE`) para distinguir fuentes.
- Firma opcional de recibos con DSSE/ECDSA-P256 (a través del módulo `szl-receipt`).
- Integración con el ecosistema SZL Holdings: servidor MCP, colecciones de evidencia y recibos en Hugging Face.
- Absorción de la superficie del deprecado `governed-inference-meter`.

No incluye capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes. Es una herramienta de medición y atestación, no un modelo de IA.

## Casos de uso

- Auditoría energética de cargas de inferencia: el sistema registra el consumo real de energía de cada ejecución, permitiendo a organizaciones verificar el cumplimiento de objetivos de eficiencia o normativas de sostenibilidad.
- Gobernanza de IA en producción: los recibos atestiguados sirven como evidencia para demostrar que un sistema de IA operó dentro de límites energéticos acordados, útil para contratos de servicio o acuerdos de nivel.
- Cumplimiento normativo: ante regulaciones que exijan transparencia en el impacto ambiental de la IA, estos recibos proporcionan un registro auditable y a prueba de manipulaciones.
- Optimización de costes operativos: al conocer los joules consumidos por token, los equipos pueden comparar la eficiencia de diferentes modelos o configuraciones de hardware y ajustar sus despliegues.
- Investigación en eficiencia de modelos: los datos de energía medidos pueden alimentar estudios académicos sobre la huella de carbono de la IA, con la ventaja de que las mediciones son verificables.
- Integración en pipelines MCP: al formar parte del ecosistema SZL Holdings, puede conectarse con servidores MCP para que agentes de IA reporten su consumo energético de forma estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no es un modelo de IA y no tiene métricas de rendimiento tipo MMLU, HumanEval o GSM8K. Su rendimiento se mediría en términos de precisión de las lecturas NVML y overhead de generación de recibos, pero no se proporcionan dichos datos.

## Requisitos de hardware

- Requiere una GPU compatible con NVML (NVIDIA) para realizar mediciones de energía; sin ella, el sistema registra `UNAVAILABLE` de forma honesta.
- No se especifican requisitos mínimos de VRAM ni de GPU concretas en la documentación disponible.
- Al ser un paquete de software ligero, no debería requerir hardware especial más allá de la GPU a medir y un entorno Python.
- Opciones de despliegue: se puede ejecutar como biblioteca integrada en pipelines existentes, o como componente de un servidor MCP. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría estándar de "modelos" comparable para este artefacto. Es una herramienta específica de SZL Holdings sin equivalentes conocidos en el ecosistema de modelos de IA. Se podría comparar con otras soluciones de medición de energía (como `pynvml` o `nvtop`), pero ninguna ofrece recibos atestiguados con encadenado hash y firma DSSE.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona ni procesa lenguaje. No debe utilizarse como sustituto de un LLM.
- Dependencia de hardware NVIDIA: las mediciones requieren NVML; en GPUs de otros fabricantes o sin soporte, solo se obtiene `UNAVAILABLE`.
- La agregación Lambda-Spine se declara como "Conjecture 1" (advisory) y no como un teorema verificado; no debe tomarse como prueba formal.
- Los recibos sin firmar se etiquetan como `UNSIGNED`; la firma requiere integración con `szl-receipt` y gestión de claves.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las dependencias y el código fuente para cumplir con la atribución requerida.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face; es un proyecto de alcance limitado y posiblemente en fase temprana de adopción.
- No se proporcionan garantías de soporte ni mantenimiento a largo plazo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-energy-attest
- Repositorio en GitHub (fuente canónica): https://github.com/szl-holdings/szl-energy-attest
- Colección de evidencia y recibos en Hugging Face: https://huggingface.co/collections/SZLHOLDINGS/evidence-and-receipts
- Colección de verificación formal y gobernanza: https://huggingface.co/collections/SZLHOLDINGS/szl-holdings-formal-verification-governance-receipts
- Portal de desarrolladores de SZL Holdings: https://holdings.a-11-oy.com/docs-site/developers/
- Producto: https://a-11-oy.com
- Pruebas: https://a11oy.net
