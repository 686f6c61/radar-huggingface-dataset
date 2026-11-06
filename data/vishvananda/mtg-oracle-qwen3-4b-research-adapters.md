# vishvananda/mtg-oracle-qwen3-4b-research-adapters

## Resumen

Los adaptadores MTG Oracle son un conjunto de LoRA de investigación publicados por el usuario vishvananda sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo completo, sino de cinco adaptadores PEFT acumulativos archivados el 26 de octubre de 2026, cada uno con su tokenizador, configuración de entrenamiento y limitaciones documentadas. El objetivo del proyecto es la generación de texto relacionada con cartas de Magic: The Gathering, aunque los propios resultados reportados por el autor indican mejoras marginales y regresiones en varios experimentos.

El interés técnico del artefacto es doble: por un lado, documenta un protocolo de experimentación reproducible con hashes SHA-256 y un manifiesto de archivo; por otro, ejemplifica un caso de publicación de resultados negativos o ambiguos en Hugging Face, algo poco habitual. El modelo base aporta la arquitectura y el conocimiento general; los adaptadores solo modifican una fracción de los pesos mediante LoRA.

No debe confundirse con el generador desplegado en producción: el autor indica explícitamente que estos son artefactos de investigación y no un sustituto del generador operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | 4B en el modelo base; los adaptadores LoRA añaden una fracción no especificada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible; los adaptadores se distribuyen en safetensors, la cuantización se aplica al modelo base |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); requiere descargar el base por separado |

## Arquitectura y entrenamiento

Cada subcarpeta contiene un adaptador PEFT completo y acumulativo, no un delta incremental: el autor advierte explícitamente de que no debe aplicarse de nuevo el adaptador padre durante la carga. Los adaptadores se entrenaron sobre Qwen3-4B-Instruct-2507 en la revisión fija `cdbee75f17c01a7cc42f958dc650907174af0554`. Las configuraciones de entrenamiento y la procedencia se incluyen en cada subcarpeta, aunque el corpus de cartas, los datos de usuario y los logs privados no se publican.

Los cinco experimentos archivados son: `custom-sft` (255 actualizaciones, con una pequeña mejora en el holdout Q4 pero regresión en desarrollo), `repair-sft` (167 actualizaciones, sin ganancia en reparación controlada y regresión de generación), `partial-pilot` (407 actualizaciones, piloto histórico con 6.500 ejemplos), `smoke-20-step` (prueba de infraestructura, sin valor de calidad) y `tiny-pilot-153-step` (406 ejemplos, sin evidencia de generalización). No se documenta el uso de RLHF ni DPO en la información disponible. El adaptador de la segunda época ya se había publicado en el repositorio de checkpoints del autor.

## Capacidades

- Generación de texto en inglés sobre temática de cartas de Magic: The Gathering, incluyendo texto tipo oracle.
- Continuación de instrucciones y ajuste fino supervisado sobre el modelo base Qwen3-4B-Instruct-2507.
- Carga mediante `peft.PeftModel.from_pretrained` con subcarpeta y revisión inmutables.
- Capacidades heredadas del base (razonamiento, código, multilingüismo) no garantizadas tras el ajuste: los adaptadores están entrenados solo en inglés y sobre un dominio estrecho.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo thinking específicos en los adaptadores.

## Casos de uso

- Reproducción de experimentos de ajuste fino: los adaptadores permiten replicar los protocolos descritos en los informes del autor, con hashes SHA-256 verificables en `archive-manifest.json` y una utilidad de restauración en la rama GitHub `archive/experiments-20261026`.
- Investigación sobre resultados negativos: `repair-sft` y `custom-sft` documentan regresiones medibles, útiles para estudiar cuándo el SFT adicional degrada la generación en dominios estrechos.
- Comparación de estrategias de entrenamiento: los cinco adaptadores con distintos volúmenes de actualizaciones (20, 153, 167, 255 y 407) permiten analizar la relación entre pasos de entrenamiento y calidad en un dominio concreto.
- Auditoría de procedencia de modelos: el manifiesto y la rama de archivo facilitan verificar la cadena de custodia de pesos y configuraciones en un entorno de investigación.
- Base para experimentos propios: un equipo puede partir de `custom-sft` o `partial-pilot` como punto de comparación al entrenar sus propios adaptadores sobre Qwen3-4B para dominios de juego o catálogos estructurados.
- Docencia y formación: sirven como ejemplo práctico de publicación de LoRA con tokenizador exacto, configuración y limitaciones declaradas, sin distribuir datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta únicamente observaciones cualitativas y relativas: "pequeña mejora en el holdout Q4" para `custom-sft`, "sin ganancia en reparación controlada y regresión de generación" para `repair-sft`, y ausencia de evidencia de generalización para `tiny-pilot-153-step`. Además advierte de que la aceptación del parser, la precisión de tokens con teacher forcing y las puntuaciones de intención juzgadas por modelo no establecen corrección de reglas ni calidad general del juego.

## Requisitos de hardware

- VRAM estimada: el modelo base de 4B en FP16 requiere aproximadamente 8-9 GB; en cuantización de 8 bits, unos 5 GB; en 4 bits, unos 3 GB. Los adaptadores LoRA añaden una sobrecarga pequeña no cuantificada en la información disponible.
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación a gran escala; RTX 4090, RTX 3090 o L40S para inferencia en FP16.
- Compatibilidad con GPU de consumo: sí, el base de 4B cabe en GPUs de 8 GB o más en cuantización de 4 bits (RTX 3060 Ti, RTX 4060, RTX 3070).
- Opciones de despliegue: transformers + peft para cargar los adaptadores; vLLM y TGI para servir el base fusionado; llama.cpp y Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mtg-oracle-qwen3-4b-research-adapters | 4B (base) + LoRA | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptadores de investigación, resultados mixtos |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en la información | apache-2.0 | Hugging Face | Modelo base sin ajuste de dominio |
| Adaptadores LoRA de dominio público comparables | variable | variable | variable | Hugging Face | No se dispone de una comparación directa verificable |

No se dispone de datos de rendimiento comparables publicados para estos adaptadores frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica que no sustituye al generador desplegado y que los resultados no establecen corrección de reglas del juego ni calidad general.
- Resultados mixtos: `custom-sft` y `repair-sft` muestran regresiones en desarrollo o generación; `smoke-20-step` y `tiny-pilot-153-step` no constituyen evidencia de calidad.
- Sesgos: no documentados en la información disponible; al entrenarse solo en inglés y sobre un dominio estrecho, el comportamiento fuera de ese dominio puede degradarse.
- Riesgo de alucinación: alto en la generación de texto de cartas y reglas, dado que el ajuste se realizó sobre un corpus limitado y no se validó la corrección factual.
- Limitaciones de idioma: solo inglés declarado; el multilingüismo del base puede verse afectado por el ajuste.
- Licencia: apache-2.0 para el modelo base y los adaptadores, pero el contenido de las cartas y los datasets de terceros conservan sus derechos según `DATA_LICENSE.md`; no se distribuye artefacto gráfico alguno.
- Producción: no recomendado para uso en producción sin una evaluación propia; los adaptadores son acumulativos y no deben combinarse con el adaptador padre.
- Reproducibilidad: requiere fijar la revisión `archive-20261026` y el commit inmutable del base; los datasets no son públicos y no hay checkpoint de optimizador reanudable.

## Enlaces

- Hugging Face: https://huggingface.co/vishvananda/mtg-oracle-qwen3-4b-research-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de checkpoints: https://huggingface.co/vishvananda/mtg-oracle-qwen3-4b-checkpoints-20261007/tree/epoch2-quarter-train-step-00024718
- Rama de archivo en GitHub: https://github.com/vishvananda/mtg-oracle-generator/tree/archive/experiments-20261026
