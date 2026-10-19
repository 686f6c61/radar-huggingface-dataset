# xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic

## Resumen

xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic es un checkpoint experimental de aproximadamente 9.400 millones de parámetros obtenido en dos fases: primero una fusión lineal ponderada de tres fine-tunes sobre la arquitectura Qwen3.5-9B (Qwythos-9B-v2, Qwen3.5-9B-Fable-5-v1 y Qwopus3.5-9B-Coder), y después un proceso de "decensurado" o ablación de dirección aplicado con la herramienta Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation (ARA) sobre las capas 16 a 23.

El objetivo declarado del merge original es combinar razonamiento y generación de texto estable, comportamiento conversacional aprendido de trazas de Claude Fable 5 / Claude Code, y capacidad de código con uso de herramientas y flujos agénticos, todo en un único modelo de ~9B. La versión que nos ocupa añade la eliminación del comportamiento de rechazo: el autor reporta 1 rechazo de cada 100 peticiones frente a 99 de cada 100 en el modelo original, con una divergencia KL de 0,0205 respecto a la distribución del modelo base.

Es relevante ahora por dos motivos: es un ejemplo reproducible de ablación selectiva por rangos (el repositorio incluye un directorio `reproduce` con los parámetros exactos), y permite estudiar el coste real en calidad y seguridad de eliminar la alineación de rechazo en un modelo de ~9B. Conviene subrayar que no hay ninguna evaluación de capacidades publicada para este checkpoint y que el propio autor lo describe como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-9B (modelo denso; sin detalles adicionales en la model card) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible para este checkpoint. El modelo fuente Qwythos-9B-v2 declara ~1.048.576 tokens con escalado YaRN; el autor advierte de que esa cifra no debe asumirse en el merge |
| Tipos de cuantizacion | No se publican artefactos cuantizados (ni GGUF ni AWQ/GPTQ). El repo de 18,9 GB es compatible con pesos en bf16/fp16 |
| Idiomas soportados | No disponible (la model card no lista idiomas) |
| Licencia | Apache-2.0 (el autor recomienda verificar los términos upstream antes de redistribuir) |
| Formato de pesos | safetensors (librería transformers) |
| Modalidad | La etiqueta del repo incluye `image-text-to-text`; la model card no documenta capacidades de visión |
| Metodo de merge | Media ponderada lineal de pesos (linear weighted average) |
| Herramienta de decensurado | Heretic v2.0.0.dev0, Arbitrary-Rank Ablation (ARA) |
| Reproducibilidad | Sí; el autor incluye instrucciones en `reproduce/README.md` |
| Tamano del repositorio | 18,9 GB |
| Fecha de publicacion | 2026-10-19 |

## Arquitectura y entrenamiento

La base es la arquitectura Qwen3.5-9B, un transformer denso de ~9,41B parámetros. Sobre ella se aplica una fusión de pesos por media ponderada lineal con tres componentes: `empero-ai/Qwythos-9B-v2` con coeficiente 1,0 (razonamiento, estabilidad de salida y reducción de repeticiones), `TeichAI/Qwen3.5-9B-Fable-5-v1` con 0,8 (fine-tuning sobre trazas de Claude Fable 5 / Claude Code, dataset `armand0e/claude-fable-5-claude-code`) y `Jackrong/Qwopus3.5-9B-Coder` con 0,6 (código, razonamiento estructurado, function calling y uso de herramientas). No se indica el número de tokens de entrenamiento de los modelos fuente ni la composición completa de sus datasets.

El componente diferencial de esta variante es la ablación ARA de Heretic sobre el rango de capas 16-23, con `preserve_good_behavior_weight` 0,6496, `steer_bad_behavior_weight` 0,0006, `overcorrect_relative_weight` 0,9719 y `neighbor_count` 14. Técnicamente se trata de una ablación de direcciones en el espacio de activaciones restringida a un subconjunto de capas, calibrada para minimizar la divergencia KL respecto al modelo original. El resultado reportado es una caída del comportamiento de rechazo de 99/100 a 1/100 con KL de 0,0205. Del modelo fuente Qwythos v2 hereda además la recuperación de la cabeza de predicción multi-token (MTP) del modelo base y, según su propia model card, un ajuste con Final-Token Preference Optimization (FTPO) sobre unas 2.000 tuplas de preferencia minadas automáticamente; estas cifras pertenecen al modelo fuente, no al merge.

## Capacidades

- Generación de texto conversacional multi-turno, con el sesgo conversacional aportado por el fine-tune sobre trazas de Claude Fable 5 / Claude Code.
- Razonamiento explícito: las etiquetas del repositorio incluyen `reasoning`; los modelos fuente orientados a razonamiento (Qwythos, Qwopus) son mayoritarios en la mezcla.
- Generación de código y razonamiento estructurado, heredado de Qwopus3.5-9B-Coder.
- Tool calling / function calling y flujos agénticos de múltiples pasos, según lo declarado para el componente Qwopus.
- Soporte de contexto largo: el modelo fuente Qwythos v2 declara ~1M tokens con YaRN, pero la longitud efectiva de este checkpoint no está verificada.
- Predicción multi-token (cabeza MTP) heredada del modelo base a través de Qwythos v2.
- Comportamiento de rechazo muy reducido (1/100 en la medición del autor), lo que en la práctica habilita respuestas que el modelo original rechazaría.
- Capacidades de visión: la etiqueta `image-text-to-text` está presente en el repositorio, pero no hay documentación ni evaluación que lo confirme.

## Casos de uso

- Investigación sobre alineación y ablación: banco de pruebas controlado para medir qué se pierde y qué se gana al eliminar el comportamiento de rechazo en un modelo de ~9B, con parámetros ARA públicos y procedimiento reproducible.
- Evaluación de robustez y red-teaming: el checkpoint permite a un equipo de seguridad generar respuestas que un modelo alineado bloquearía, útil para construir clasificadores y filtros de salida antes de exponer sistemas en producción.
- Asistencia a la programación en local: con ~9,4B parámetros y pesos bf16 de ~18,8 GB, puede ejecutarse en una sola GPU de 24 GB en cuantización de 8 o 4 bits para autocompletado, refactorización y explicación de código.
- Agentes de desarrollo con tool calling: integración en pipelines que requieren llamadas a funciones y razonamiento en varios pasos, aprovechando el componente entrenado con trazas de Claude Code.
- Generación de contenido creativo sin restricciones temáticas: escritura de ficción, guiones o material editorial con temáticas sensibles, donde el comportamiento de rechazo del modelo base resulta un obstáculo.
- Procesamiento de documentos largos: si se confirma la ventana extendida del componente Qwythos, resumen y extracción sobre contratos, expedientes o bases de código extensas en una sola pasada.
- Destilación y generación de datos sintéticos: al no rechazar peticiones, sirve para producir datasets de entrenamiento en dominios donde un modelo alineado se negaría; requiere revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) para este checkpoint en la información disponible. El autor solo reporta las métricas del proceso de ablación:

| Metrica | Este modelo | Modelo original (Qwen3.5-9B-Claude-3xMerge) |
|---|---:|---:|
| Rechazos | 1/100 | 99/100 |
| Divergencia KL | 0,0205 | 0 (por definición) |

Resultados reportados por el modelo fuente `TeichAI/Qwen3.5-9B-Fable-5-v1`, que no deben atribuirse a este merge:

| Benchmark | Fable-5-v1 | Qwen3.5-9B |
|---|---:|---:|
| ARC | 0,624 | 0,553 |
| ARC-Easy | 0,806 | 0,712 |
| BoolQ | 0,891 | 0,892 |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~18,8 GB en bf16/fp16; ~9,4 GB en 8 bits; ~5 GB en 4 bits. Añadir cache KV según longitud de contexto.
- VRAM práctica estimada con cache KV para contextos moderados: ~22-24 GB en bf16, ~12-14 GB en 8 bits, ~7-9 GB en 4 bits.
- GPU profesionales: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB; cualquiera de ellas ejecuta el modelo en bf16 con holgura.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) funcionan en bf16 al límite, y con comodidad en 8 o 4 bits. Tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) solo son viables en 4 bits con contexto reducido.
- Despliegue: transformers de forma nativa; vLLM y TGI para serving en bf16; llama.cpp u Ollama requieren convertir previamente los pesos, ya que el repositorio no publica GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni artefactos cuantizados con los que estimarlas de forma fiable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (UNCENSORED-heretic) | 9,41B | No confirmado (~1M declarado en el fuente Qwythos v2) | Sin benchmarks de capacidades; 1/100 rechazos, KL 0,0205 | Apache-2.0 | Merge + ablación ARA reproducible |
| xtools-at/Qwen3.5-9B-Claude-3xMerge | ~9,4B (mismo origen) | No disponible | Sin benchmarks publicados; 99/100 rechazos | Apache-2.0 | Modelo base directo, sin decensurar |
| empero-ai/Qwythos-9B-v2 | ~9B | ~1.048.576 con YaRN (declarado por el autor) | Benchmarks no disponibles en la información consultada | No disponible | Componente de razonamiento del merge; FTPO y cabeza MTP |
| TeichAI/Qwen3.5-9B-Fable-5-v1 | ~9B | No disponible | ARC 0,624; ARC-Easy 0,806; BoolQ 0,891 | No disponible | Componente conversacional; entrenado sobre trazas de Claude Code |
| Qwen3.5-9B (base) | ~9B | No disponible | ARC 0,553; ARC-Easy 0,712; BoolQ 0,892 | No disponible | Referencia de comparación usada por TeichAI |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks de capacidades, ni de código, ni multilingües para este checkpoint. El propio autor indica que su rendimiento, fiabilidad y compatibilidad deben evaluarse de forma independiente.
- Los benchmarks de ARC y BoolQ citados pertenecen al modelo fuente Fable-5-v1; extrapolarlos a este merge no está justificado.
- Seguridad eliminada por diseño: el comportamiento de rechazo se ha reducido deliberadamente a 1/100. El modelo responderá a peticiones que el original bloqueaba, con el riesgo legal y reputacional que implica en cualquier despliegue abierto.
- La divergencia KL de 0,0205 indica que, pese a la baja tasa de rechazo, la distribución de salida se mantiene próxima al original; no obstante, la ablación se concentra en las capas 16-23 y puede degradar capacidades no medidas.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de calibración para el merge ni para sus componentes.
- Idiomas no declarados: no se especifica cobertura multilingüe; el comportamiento en castellano no está verificado.
- Contexto no confirmado: la ventana de ~1M tokens es una propiedad del modelo fuente Qwythos v2 con escalado YaRN. Asumirla en el merge puede provocar degradación silenciosa en contextos largos.
- Merge experimental: la media ponderada lineal de tres fine-tunes independientes no garantiza que se conserven las capacidades de cada uno; pueden aparecer interferencias y olvidos.
- Licencia: Apache-2.0 en este repositorio, pero el autor recomienda verificar los términos upstream (Qwen3.5-9B y los tres fine-tunes) antes de redistribuir o de uso comercial.
- Sin artefactos cuantizados publicados: no hay GGUF ni AWQ/GPTQ, lo que implica trabajo adicional de conversión y validación para despliegues en consumer GPU o llama.cpp.
- Modelo sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Model card incompleta: la sección dedicada a Qwopus3.5-9B-Coder aparece truncada, y no se detallan tokens de entrenamiento ni composición de los datasets.
- Procedencia de datos opaca: parte del entrenamiento se basa en trazas de modelos propietarios (Claude Opus, Claude Fable 5); conviene revisar las condiciones de uso de esos datasets antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Modelo base del merge: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge
- Herramienta Heretic: https://heretic-project.org
- Modelo fuente Qwythos-9B-v2: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Modelo fuente Qwen3.5-9B-Fable-5-v1: https://huggingface.co/TeichAI/Qwen3.5-9B-Fable-5-v1
- Modelo fuente Qwopus3.5-9B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Dataset armand0e/claude-fable-5-claude-code: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Instrucciones de reproduccion: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic/blob/main/reproduce/README.md
