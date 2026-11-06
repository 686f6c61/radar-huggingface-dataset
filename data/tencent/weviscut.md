# tencent/WeVisCut

## Resumen

WeVisCut es un agente de edición de vídeo de largo horizonte desarrollado por Tencent. No se trata de un modelo texto-a-vídeo convencional, sino de un agente que utiliza herramientas: a partir de un artículo de conocimiento o un guion de narración, genera vídeos editados de varios minutos de duración. En cada paso, el modelo lee el estado actual de la edición y selecciona una de 12 herramientas disponibles para planificar, narrar, recuperar recursos, componer, inspeccionar o reparar el resultado.

La política del agente se basa en Qwen3.5-9B y está entrenada con trayectorias de edición ejecutables mediante aprendizaje por refuerzo. El modelo requiere el runtime de WeVisCut, que es quien ejecuta las llamadas a herramientas y produce el vídeo final, incluyendo un timeline editable con pausa/reanudación, revisiones manuales o por chat, rerrenderizado por plano y rollback de versiones.

Su relevancia radica en que aborda un problema poco cubierto por los modelos generativos actuales: la edición de vídeo de formato largo como tarea de agente con herramientas, en lugar de generación directa de píxeles, lo que permite control humano iterativo durante todo el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente con herramientas basado en Qwen3.5-9B (transformer) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia en bf16 documentada) |
| Idiomas soportados | no disponible |
| Licencia | other (codigo Apache 2.0; pesos sujetos a terminos propios) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

WeVisCut es una política de agente construida sobre Qwen/Qwen3.5-9B. El modelo opera en un bucle agéntico: en cada paso lee el estado actual de la edición (el timeline y sus recursos) y selecciona una de 12 herramientas del runtime, agrupadas en tareas de planificación, narración, recuperación de recursos (asset retrieval), composición, inspección y reparación. El pipeline se etiqueta como any-to-any (image-text-to-text), y las etiquetas del repositorio incluyen reinforcement-learning y long-horizon, lo que indica entrenamiento con trayectorias de edición ejecutables y aprendizaje por refuerzo para tareas de muchos pasos.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales de la técnica de RL empleada. El runtime proporciona además un timeline editable con pausa/reanudación, revisiones manuales o mediante chat, rerrenderizado por plano individual y rollback de versiones. La calidad del vídeo final depende de los servicios configurados de recuperación, TTS y renderizado, así como de las plantillas disponibles.

## Capacidades

- Planificación de ediciones de vídeo de formato largo (varios minutos) a partir de artículos de conocimiento o guiones de narración.
- Selección y uso de 12 herramientas: planificación, narración, recuperación de assets, composición, inspección y reparación.
- Generación de narración (en combinación con servicios TTS externos configurables).
- Recuperación de recursos audiovisuales (asset retrieval) según el guion.
- Composición y ensamblado del timeline de edición.
- Inspección y reparación del resultado en pasos posteriores (long-horizon).
- Interacción iterativa: revisiones por chat, edición manual del timeline, rerrenderizado por plano y rollback de versiones.
- Uso de herramientas (tool use) en múltiples pasos como capacidad central del modelo.

## Casos de uso

- Producción de vídeos divulgativos a partir de artículos: se proporciona un artículo de conocimiento y el agente planifica, narra y monta un vídeo de varios minutos, adecuado para canales educativos o de marketing de contenidos.
- Conversión de guiones en vídeos narrados: un guion de voz en off se transforma automáticamente en una edición completa con recursos recuperados y composición por planos.
- Asistencia a editores profesionales: el timeline editable con pausa, reanudación y rollback permite usar el agente como copiloto dentro de un flujo de producción real, no como generador de una sola pasada.
- Revisión y corrección iterativa por chat: un editor puede pedir cambios en lenguaje natural ("alarga este plano", "cambia la narración") y el agente reejecuta las herramientas necesarias.
- Rerrenderizado selectivo: regenerar únicamente los planos defectuosos sin recomponer todo el vídeo, útil en pipelines de producción con presupuesto de cómputo acotado.
- Investigación en agentes de largo horizonte: el modelo y su entorno de 12 herramientas sirven como banco de pruebas para políticas de RL con uso de herramientas en tareas secuenciales complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 24 GB de memoria de GPU para inferencia en bf16, según la documentación oficial.
- GPU recomendadas: cualquier GPU NVIDIA con ~24 GB (el README no especifica modelos concretos; una RTX 4090 o A100 de 40 GB cumplirían el requisito, aunque no se indica soporte oficial por modelo).
- Consumer GPU: sí, cabe en GPUs de gama alta de 24 GB como la RTX 3090 o RTX 4090 en bf16; no se documentan cuantizaciones que permitan reducir este requisito.
- Despliegue: el runtime oficial de WeVisCut (repositorio GitHub de Tencent) con Python 3.11+, PyTorch compatible con la versión de CUDA, Node.js, FFmpeg y un renderizador instalados mediante los scripts de configuración. La interfaz Studio se sirve en el puerto 8081; existe un modo `--no-model` para usar la UI sin cargar los pesos.
- Latencia y throughput: no disponible. La calidad del vídeo depende de los servicios externos de retrieval, TTS y renderizado configurados.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| WeVisCut (Tencent) | ~9,4B | Agente de edición de vídeo con 12 herramientas | other (código Apache 2.0) | Pesos en Hugging Face + runtime en GitHub |
| Modelos texto-a-vídeo generativos (p. ej. Sora, Veo) | no disponible | Generación directa de vídeo | cerradas | no disponible como pesos abiertos |
| Agentes de uso de herramientas generalistas basados en Qwen3.5 | ~9B (base Qwen3.5-9B) | Tool use general, no edición de vídeo | varía | varía |

WeVisCut se diferencia de los modelos texto-a-vídeo en que no genera píxeles directamente, sino que orquesta herramientas de edición sobre un timeline, lo que permite control humano y revisión por planos. No hay alternativas abiertas directamente comparables publicadas en la información disponible.

## Limitaciones y advertencias

- El modelo no garantiza la exactitud factual ni la calidad de producción: la narración y el vídeo generados deben revisarse antes de publicarse.
- Los pesos no producen vídeo por sí solos: requieren obligatoriamente el runtime de WeVisCut y sus herramientas; no sirve como modelo conversacional o texto-a-vídeo independiente.
- La calidad del vídeo final depende de servicios externos de recuperación, TTS y renderizado, así como de las plantillas disponibles, no solo del modelo.
- Licencia "other": el código es Apache 2.0, pero los pesos y componentes de terceros están sujetos a sus propios términos; revisar la licencia antes de uso comercial.
- No se ha publicado información sobre idiomas soportados, sesgos conocidos, longitud de contexto ni riesgo de alucinación específico; dada la generación de narración, el riesgo de alucinación en los guiones debe considerarse alto hasta su verificación.
- Requisito de GPU con ~24 GB de VRAM, lo que excluye hardware de consumo de gama media sin cuantización documentada.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeVisCut
- Repositorio GitHub (runtime): https://github.com/Tencent/WeVisCut
- Paper (arXiv): https://arxiv.org/abs/2610.38352
- Licencia del código (Apache 2.0): https://github.com/Tencent/WeVisCut/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
