# yssvyss/HEADLINE-MSIIP

## Resumen

HEADLINE-MSIIP es un conjunto de pesos de investigación publicado por el usuario yssvyss para la generación automática de informes de tomografía computarizada (TC) de cráneo, bajo el título "Entity-Aware Head CT Report Generation via Classification-Derived Label Priors". El repositorio no contiene un único modelo, sino un sistema completo: un generador de informes basado en Qwen3.5-4B, ocho checkpoints de clasificadores multietiqueta auxiliares y los ficheros del backbone visual necesarios para el pipeline de inferencia.

La propuesta técnica consiste en condicionar la generación del informe con etiquetas candidatas derivadas de clasificadores de hallazgos radiológicos, de forma que el modelo de lenguaje incorpore esas "priors" de clasificación en la generación de entidades clínicas. El módulo de lenguaje del generador se ha ajustado completamente mientras que el codificador visual y el proyector MLP se han mantenido congelados.

Es relevante porque aborda una tarea de nicho (radiología de TC de cráneo) sobre una base multimodal reciente de 4B parámetros, con licencia Apache 2.0 y un formato de despliegue pensado para un contenedor de inferencia concreto (MSIIP HEADLINE v5). No obstante, el autor advierte explícitamente de que no está validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (generador derivado de Qwen3.5-4B con backbone visual de Qwen3-VL-4B-Instruct) + 8 clasificadores multietiqueta auxiliares |
| Parametros totales | 4B (generador); parámetros de los clasificadores auxiliares no disponibles |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (generador y clasificadores); ficheros del backbone visual incluidos |

## Arquitectura y entrenamiento

El sistema se compone de un generador de informes image-text-to-text construido sobre Qwen3.5-4B, al que se añade el codificador visual de Qwen3-VL-4B-Instruct mediante un proyector MLP. Durante el ajuste fino, el módulo de lenguaje se entrenó por completo mientras que el codificador visual y el proyector MLP permanecieron congelados. Los shards del generador se verificaron contra la versión candidata `checkpoint-1287` con visión congelada.

Junto al generador se publican ocho checkpoints de clasificadores multietiqueta que actúan como fuente de etiquetas candidatas. El mecanismo "entity-aware" consiste en derivar priors de clasificación a partir de esos clasificadores e incorporarlas al proceso de generación del informe, de modo que el modelo de lenguaje condicione la mención de hallazgos a las etiquetas detectadas. El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se especifican innovaciones de decodificación o atención más allá del esquema de condicionamiento por etiquetas.

## Capacidades

- Generación de informes radiológicos de TC de cráneo a partir de imágenes y metadatos de geometría (pipeline image-text-to-text).
- Clasificación multietiqueta de hallazgos mediante ocho clasificadores auxiliares que alimentan las priors del generador.
- Condicionamiento por entidades: integración de etiquetas candidatas derivadas de clasificación en la generación del informe.
- Procesamiento de entrada multimodal con backbone visual congelado (Qwen3-VL-4B-Instruct) y módulo de lenguaje ajustado.
- Integración con el contenedor de inferencia MSIIP HEADLINE v5 y el esquema de sockets de TC de tejidos blandos y geometría.
- Soporte de tool calling, agentes, visión general, audio u otras capacidades especiales: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en generación de informes radiológicos: el sistema permite reproducir el pipeline completo (clasificadores + generador) para experimentar con condicionamiento por etiquetas en TC de cráneo.
- Benchmarking de modelos de visión-lenguaje en dominio médico: sirve como referencia para comparar estrategias de generación de informes con priors de clasificación frente a generación directa.
- Evaluación de arquitecturas con backbone visual congelado: al mantener el codificador visual fijo, facilita estudiar el efecto del ajuste del módulo de lenguaje en tareas de radiología.
- Prototipado de asistentes de dictado estructurado: el generador puede producir borradores de informe a partir de estudios de TC de tejidos blandos dentro de un entorno de investigación controlado.
- Estudio de clasificadores auxiliares como fuente de señales: los ocho checkpoints multietiqueta pueden evaluarse de forma independiente para analizar su precisión y su impacto en el informe final.
- Despliegue en el contenedor HEADLINE v5: el repositorio está empaquetado para montarse en `/opt/ml/model` con las carpetas `vlm/` y `multilabel/`, lo que permite ejecutar el pipeline en infraestructura de investigación existente.
- Análisis de errores y robustez: útil para estudiar fallos típicos (hallazgos omitidos, hallazgos no soportados, mala interpretación de etiquetas candidatas) antes de considerar cualquier uso clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 19,2 GB e incluye generador, ocho clasificadores y backbone visual, por lo que se requiere espacio en disco y memoria acorde al conjunto completo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; un modelo de 4B en precisión completa puede caber en GPUs de consumo con suficiente VRAM, pero no se confirma en la información proporcionada.
- Opciones de despliegue: contenedor de inferencia MSIIP HEADLINE v5 con montaje en `/opt/ml/model`; soporte de vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HEADLINE-MSIIP | 4B (generador) | no disponible | Generación de informes de TC de cráneo con priors de clasificación | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | Image-text-to-text general | no disponible en esta ficha | Hugging Face (modelo base) |
| Qwen3.5-4B | 4B | no disponible en esta ficha | Modelo de lenguaje base | no disponible en esta ficha | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No validado para uso clínico: el autor indica explícitamente que los modelos son para investigación y benchmarking.
- Riesgo de hallazgos omitidos, hallazgos no soportados por la imagen o interpretación errónea de las etiquetas candidatas.
- Posibles sesgos derivados de los datos de entrenamiento y de los clasificadores auxiliares; no se documentan análisis de sesgo.
- Idiomas soportados no especificados, lo que impide garantizar un comportamiento multilingüe.
- Longitud de contexto no documentada, lo que limita la planificación de despliegues con informes largos.
- Dependencia de un contenedor de inferencia concreto (MSIIP HEADLINE v5) y de un esquema de entrada específico (sockets de TC de tejidos blandos y geometría), lo que reduce la portabilidad.
- El repositorio no incluye imágenes clínicas ni informes, por lo que no es posible reproducir el entrenamiento con los datos originales.
- Licencia Apache 2.0 para los pesos publicados, con la obligación de respetar las licencias y avisos de los modelos upstream de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yssvyss/HEADLINE-MSIIP
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
