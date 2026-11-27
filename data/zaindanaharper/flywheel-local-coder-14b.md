# zaindanaharper/flywheel-local-coder-14b

## Resumen

Flywheel-Local-Coder-14B es un modelo de lenguaje especializado en código desarrollado por Zain Dana Harper (usuario `zaindanaharper`) a partir de Qwen2.5-Coder-14B-Instruct de Alibaba. El autor parte de los pesos del modelo base de Qwen y realiza un entrenamiento continuado mediante QLoRA sobre un corpus de 66,2 millones de tokens extraídos de un ecosistema de desarrollo real (17.997 ficheros), con el objetivo de adaptarlo a un flujo de trabajo local-first y verificación reproducible. El resultado se distribuye como un único fichero GGUF en cuantización Q4_K_M de 8,99 GB, pensado para ejecutarse íntegramente en hardware propio sin que los prompts ni el código salgan del disco del usuario.

La propuesta diferencial del modelo no es una mejora de capacidades frente al base, sino la trazabilidad: el autor publica checksums SHA-256, un fichero `provenance.json` y una cadena de verificación que permite reconstruir el proceso desde el corpus hasta los bytes descargados. La model card declara explícitamente que la medición de la diferencia de rendimiento respecto a Qwen2.5-Coder-14B-Instruct incluye el cero, es decir, que no se reclama una mejora de capacidad sobre el modelo original.

Arquitectura Qwen2 (transformer decoder-only denso) con 14.770.033.664 parámetros y una longitud de contexto de 32.768 tokens. Licencia Apache-2.0 con atribución a Qwen. Por su tamaño, su formato GGUF único y su enfoque en completado de código, refactorización y tool calling, se posiciona como un asistente de programación diario ejecutable en estaciones de trabajo con GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2), denso |
| Parametros totales | 14.770.033.664 (14,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (única publicada, fichero GGUF único de 8.988.110.880 bytes) |
| Idiomas soportados | No disponible (la model card no detalla cobertura lingüística; hereda el comportamiento del base Qwen2.5-Coder) |
| Licencia | Apache-2.0 (con aviso de atribución a Qwen) |
| Formato de pesos | GGUF (cuantización Q4_K_M); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la arquitectura Qwen2, heredada de Qwen2.5-Coder-14B-Instruct. No emplea mezcla de expertos ni mecanismos híbridos SSM: es un modelo denso convencional de 14,8B parámetros, lo que implica que todos los parámetros se activan en cada token generado. El contexto máximo es de 32.768 tokens.

El entrenamiento consiste en un preentrenamiento continuado (continued pretraining) mediante QLoRA sobre un corpus de 66,2 millones de tokens distribuidos en 17.997 ficheros procedentes de un ecosistema de desarrollo real del autor. Según la model card, no se reporta una mejora medible de capacidades frente al base: la diferencia medida incluye el cero. La innovación declarada no reside en la arquitectura ni en el algoritmo de entrenamiento, sino en el andamiaje de verificación reproducible que acompaña al modelo: checksums SHA-256, `provenance.json` y una cadena retrazable desde el corpus hasta los pesos. El corpus de entrenamiento es propiedad del autor y no se publica; los pesos distribuidos no incorporan código de terceros más allá del modelo base.

## Capacidades

- Generación de texto y chat conversacional (pipeline `text-generation`, tag `conversational`).
- Completado de código y generación de funciones pequeñas.
- Refactorización de código.
- Tool calling / function calling (declarado en la model card).
- Ejecución local-first: inferencia sin salida de datos a la red.
- Verificación de integridad de la descarga mediante checksums publicados.
- Compatibilidad con endpoint local compatible con la API de OpenAI (según la guía de uso).
- Modo de completado determinista (según la guía de uso).
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada (dependen del base Qwen2.5-Coder, no documentadas aquí).

## Casos de uso

- Asistente de programación diario en local: el modelo se ejecuta con `llama-cli` u Ollama sobre un único fichero GGUF de 8,99 GB, de modo que el código del desarrollador permanece en su máquina. Adecuado para entornos con requisitos de confidencialidad.
- Completado de código en el editor: con 32.768 tokens de contexto puede mantener el contexto de varios ficheros abiertos y generar funciones pequeñas coherentes con el código circundante.
- Refactorización asistida: el modelo puede reescribir fragmentos y funciones existentes manteniendo el contexto del módulo, útil en tareas de limpieza de código heredado.
- Automatización con tool calling: al soportar function calling, puede integrarse en flujos donde el modelo invoca herramientas locales (ejecución de tests, linters, scripts de build) dentro de un pipeline de CI/CD local.
- Endpoint local compatible con OpenAI: permite sustituir llamadas a APIs externas por un servidor local sin cambiar el código cliente, útil para prototipado y para evitar dependencias de red.
- Verificación de cadena de suministro de modelos: el flujo de checksums y `provenance.json` permite a un equipo auditar que los pesos descargados coinciden con los publicados, relevante en entornos regulados.
- Entornos sin conectividad: al ser un fichero único sin pasos de conversión ni entorno Python, puede desplegarse en máquinas aisladas (air-gapped) copiando el GGUF y el binario de llama.cpp.

## Benchmarks y rendimiento

La model card reporta únicamente evaluaciones internas del autor: el modelo supera 8 de 8 tareas de línea base y 8 de 10 tareas difíciles con contratos deliberadamente estrictos en un solo intento, con intervalos de confianza adjuntos. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y el autor declara explícitamente que no reclama mejora de capacidad sobre Qwen2.5-Coder-14B-Instruct.

| Evaluación | Resultado | Fuente |
|---|---|---|
| Tareas de línea base (internas) | 8/8 en un solo intento | Model card del autor |
| Tareas difíciles con contratos estrictos (internas) | 8/10 en un solo intento | Model card del autor |
| Diferencia de capacidad frente al base | Incluye el cero (sin mejora declarada) | Model card del autor |
| MMLU, HumanEval, GSM8K | No disponible | — |

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 8,99 GB; para inferencia completa con contexto largo se recomienda reservar aproximadamente 10-12 GB de VRAM (estimación basada en el tamaño del fichero y la caché KV para 32.768 tokens; no publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o RTX 3090 (24 GB) alojan el modelo con contexto amplio; GPU de 16 GB permiten ejecución con contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM para contexto moderado; en 8-10 GB requeriría reducir contexto o descargar capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile incluido) y endpoint local compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Flywheel-Local-Coder-14B | 14,8B | 32.768 | GGUF Q4_K_M único | Apache-2.0 | Preentrenamiento continuado QLoRA; sin mejora declarada sobre el base |
| Qwen2.5-Coder-14B-Instruct | 14,8B | 32.768 (según base) | safetensors (y GGUF de terceros) | Apache-2.0 | Modelo base; referencia de capacidades |
| Flywheel-Local-Coder-32B (hermano) | No disponible | No disponible | No disponible | No disponible | Variante de 32B del mismo autor |
| Otros modelos de código de ~14B | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- No se declara mejora de capacidad sobre Qwen2.5-Coder-14B-Instruct; el valor añadido es el empaquetado local y la trazabilidad, no el rendimiento bruto.
- El corpus de entrenamiento es propiedad del autor y no se publica, lo que impide auditar su composición y posibles sesgos.
- Riesgo de alucinación inherente a los modelos de código: puede generar APIs inexistentes o código sintácticamente plausible pero incorrecto.
- Cobertura de idiomas no documentada; el comportamiento multilingüe no está garantizado más allá de lo que herede del base.
- Solo se distribuye una cuantización (Q4_K_M); no hay versiones en precisión superior ni safetensors del modelo ajustado.
- El modelo tiene muy baja adopción (21 descargas, 0 likes en el momento de la consulta); no hay validación independiente de terceros.
- Las métricas reportadas son evaluaciones internas del autor sin replicación externa; los intervalos de confianza no se detallan en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero requiere mantener el aviso de atribución a Qwen; conviene revisar el fichero LICENSE del repositorio.
- Verificar los checksums SHA-256 antes de usar los pesos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaindanaharper/flywheel-local-coder-14b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Demo de verificación interactiva: https://huggingface.co/spaces/zaindanaharper/jfc3p-oracle-demo
- Laboratorio del autor: https://harperz9.github.io/models.html
- Modelo hermano 32B: https://huggingface.co/zaindanaharper/flywheel-local-coder-32b
- Modelo hermano credential-line-32m: https://huggingface.co/zaindanaharper/credential-line-32m
- Repositorio flywheel: https://github.com/HarperZ9/flywheel
- Repositorio buildlang: https://github.com/HarperZ9/buildlang
- Preprint EMET: https://doi.org/10.5281/zenodo.21230267
- Preprint BuildLang: https://doi.org/10.5281/zenodo.21231253
- Preprint Proof Packets: https://doi.org/10.5281/zenodo.21231406
- Preprint Witnessed Independence: https://doi.org/10.5281/zenodo.21232206
- ORCID del autor: https://orcid.org/0009-0001-7175-5393
- Web del autor: https://harperz9.github.io/
