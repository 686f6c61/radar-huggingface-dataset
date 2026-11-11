# trymirai/LFM2.5-2.6B-M

## Resumen

LFM2.5-2.6B-M es una cuantización de 4 bits del modelo LiquidAI/LFM2.5-2.6B, publicada por trymirai (Mirai Labs) bajo el nombre de su pipeline de cuantización "Mirai Medium". El modelo base es un transformer de LiquidAI orientado a generación de texto; esta versión cuantizada está pensada específicamente para inferencia local eficiente en Apple silicon mediante la librería y CLI propias de Mirai, construidas sobre el runtime `uzu`.

El interés de esta ficha no reside en el modelo base, sino en el método de compresión: cuantización entera asimétrica de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamaño de grupo 64, complementada con transformadas de Hadamard aleatorias de bloque diagonal para reducir valores atípicos en activaciones y pesos, y con destilación consciente de cuantización tras el proceso de PTQ. El autor sitúa el checkpoint en la frontera de Pareto tamaño-divergencia KL, afirmando que no encontró ningún checkpoint menor con menor KL.

La relevancia práctica es acotada pero clara: es una opción para ejecutar un modelo de ~2.600 millones de parámetros en un Mac sin GPU dedicada, con una calidad degradada de forma controlada y medible. Fuera de Apple silicon, el formato y el runtime no son utilizables, y la información pública sobre el modelo base (contexto, idiomas, benchmarks) no está incluida en la model card de esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM2.5-2.6B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1.413.376.000 (según safetensors del checkpoint cuantizado); el modelo base se denomina 2.6B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits asimétrica con zero points de 4 bits, escalas bfloat16, group size 64; el repo incluye también tags de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (license: other) |
| Formato de pesos | safetensors (runtime `uzu`; no se publican GGUF ni otros formatos) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento (PTQ) seguida de destilación consciente de cuantización. La receta concreta: cuantización entera asimétrica de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamaño de grupo 64. Para mitigar los valores atípicos que degradan la cuantización de baja precisión, se aplican transformadas de Hadamard aleatorias de bloque diagonal sobre activaciones y pesos, una técnica habitual para "alisar" las distribuciones antes de redondear.

No se documentan en esta model card los datos de entrenamiento del modelo base (número de tokens, composición del corpus, si hubo RLHF/DPO), ni innovaciones arquitectónicas del transformer subyacente. La mezcla de evaluación empleada por Mirai para medir la divergencia KL se compone de 45% datos públicos de tipo agéntico, 30% datos públicos de SFT y contexto largo, y 25% datos privados de chat. El autor afirma que el checkpoint se sitúa en la frontera de Pareto tamaño-KL de su conjunto de evaluaciones.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline (`text-generation`).
- Razonamiento y conversación multi-turno: heredado del modelo base; no se aportan evaluaciones específicas en esta ficha.
- Datos de evaluación orientados a uso agéntico: la mezcla de calibración incluye un 45% de datos públicos de tipo agente, lo que sugiere que la cuantización se optimizó para preservar ese comportamiento.
- Contexto largo: un 30% de la mezcla de evaluación son datos de SFT y contexto largo, aunque la longitud de contexto soportada no se especifica.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; la model card no las menciona.
- Modo thinking explícito: no disponible.
- Idiomas: no disponible.

## Casos de uso

- Inferencia local en Mac para prototipado de chatbots: el modelo se ejecuta con el CLI `mirai` sobre Apple silicon, lo que permite tener un asistente conversacional funcionando sin conexión ni GPU dedicada, útil para desarrollo de prompts y pruebas de UX antes de pasar a un modelo mayor.
- Evaluación de pipelines agénticos en local: dado que la calibración de la cuantización incluye datos agénticos, es un candidato razonable para probar bucles de razonamiento multi-paso y llamadas a herramientas en un entorno de desarrollo antes de desplegar en servidor.
- Generación de texto asistida en herramientas de escritorio: integrable como motor de autocompletado, resumen o reescritura dentro de aplicaciones macOS, donde el consumo de memoria es el factor limitante y un checkpoint de 4 bits reduce el coste frente al modelo en bf16.
- Procesamiento por lotes de documentos en un portátil: clasificación, extracción de entidades o resumen de textos de longitud moderada en un flujo offline, sin enviar datos a la nube, lo que simplifica el cumplimiento de requisitos de privacidad.
- Base para experimentos de cuantización: investigadores que estudien PTQ con transformadas de Hadamard o destilación consciente de cuantización pueden usar este checkpoint como referencia reproducible y comparar su divergencia KL frente al modelo original.
- Sustituto ligero en pruebas de regresión de aplicaciones LLM: permite ejecutar la suite de evaluación de una aplicación en un Mac de desarrollo con un modelo de ~2,6B parámetros, reduciendo el tiempo y el coste frente a invocar un modelo grande por API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una gráfica de divergencia KL frente al tamaño del checkpoint y la afirmación de que el modelo se encuentra en la frontera de Pareto de esa métrica; no se aportan valores numéricos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, ni para el modelo cuantizado ni para el base.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 7,3 GB, pero el checkpoint de 4 bits con 1.413.376.000 parámetros requiere del orden de 1 GB solo para los pesos; el tamaño del repo incluye probablemente múltiples variantes y artefactos. No se publica una cifra oficial de memoria en ejecución.
- Plataforma soportada: exclusivamente Apple silicon (M1 y posteriores). El autor indica explícitamente que solo se soporta inferencia en Apple silicon.
- GPU NVIDIA/AMD: no soportadas por el runtime `uzu` según la documentación disponible.
- Cabe en GPU de consumo: sí en el sentido de que está diseñado para Mac con memoria unificada; no hay soporte documentado para RTX 4090, A100 o H100.
- Opciones de despliegue: CLI `mirai` (instalable vía Homebrew) y compilación desde el repositorio `trymirai/uzu`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Runtime | Licencia |
|---|---|---|---|---|---|
| trymirai/LFM2.5-2.6B-M | 1.413.376.000 (checkpoint 4 bits) | no disponible | 4 bits asimetrica, group size 64 | uzu (Apple silicon) | lfm-open-license |
| LiquidAI/LFM2.5-2.6B (base) | ~2.6B (denominacion) | no disponible | bf16 y otras | ecosistema estandar | lfm-open-license |
| Otras cuantizaciones del mismo base (GGUF, etc.) | ~2.6B | no disponible | 4/8 bits | llama.cpp, Ollama y similares | lfm-open-license |

La comparación relevante es contra el modelo base sin cuantizar y contra cuantizaciones genéricas del mismo base en formatos portables. La ventaja declarada de esta versión es la calidad retenida por unidad de tamaño, medida como divergencia KL; su desventaja es la ausencia de portabilidad fuera de Apple silicon y la falta de datos públicos de benchmarks que permitan verificar la afirmación.

## Limitaciones y advertencias

- Degradación por cuantización: es un checkpoint de 4 bits; la pérdida de calidad frente al modelo base existe y solo se documenta de forma cualitativa mediante una curva de KL, sin cifras publicadas.
- Sesgos: no documentados en esta model card. Al heredarse del modelo base, deben consultarse las advertencias de la model card original de LiquidAI.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable en un modelo de este tamaño y aumenta con la cuantización.
- Idiomas: no se especifica qué idiomas soporta; no debe asumirse cobertura multilingüe sin verificación.
- Contexto: la longitud máxima no está publicada, lo que impide dimensionar aplicaciones de contexto largo con garantías.
- Licencia: `lfm-open-license` (etiquetada como `other`), no es una licencia OSI estándar. Es imprescindible revisar los términos del enlace a la licencia del modelo base antes de cualquier uso comercial.
- Dependencia de plataforma: el modelo solo es utilizable con el runtime `uzu` en Apple silicon; no hay ruta de despliegue en servidores Linux con GPU, lo que descarta su uso en producción convencional.
- Madurez del ecosistema: 403 descargas y 0 likes en el momento de la consulta; el runtime y el CLI son proyectos jóvenes, con riesgo de cambios incompatibles.
- Fecha de creación del repositorio: 2026-08-23, con última actualización 2026-11-11.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/LFM2.5-2.6B-M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Model card del base: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/README.md
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Repositorio del runtime uzu: https://github.com/trymirai/uzu
- Guía de ejecución desde código fuente: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Página del modelo en Mirai: https://trymirai.com/local-models/liquidai-lfm2-5-2-6b-mirai-mirai-m-4
