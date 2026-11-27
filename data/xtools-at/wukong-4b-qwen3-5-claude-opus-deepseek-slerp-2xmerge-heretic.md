# xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic

## Resumen

Wukong 4B es un modelo de lenguaje compacto obtenido por fusión de pesos (weight-space merging) de dos fine-tunes de la familia Qwen3.5-4B. Lo desarrolla el usuario xtools-at y combina, por un lado, un modelo orientado a código y agentes (Qwopus3.5-4B-Coder) y, por otro, un modelo destilado de DeepSeek-V4-Pro centrado en razonamiento matemático y científico. El objetivo declarado es reunir razonamiento estructurado, capacidad de programación y uso de herramientas en un único checkpoint de ~4,66 mil millones de parámetros, apto para despliegue local.

La fusión se realiza mediante SLERP con un parámetro de interpolación de 0,4, lo que otorga mayor peso al modelo de código. No hay, por tanto, un entrenamiento adicional sobre el checkpoint fusionado: la combinación se hace en el espacio de pesos. Ambos modelos padre son variantes "heretic" (decensuradas/abliteradas), y el autor afirma haber confirmado que el comportamiento abliterado se conserva tras la fusión.

El modelo es relevante por su tamaño reducido y su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y por cubrir simultáneamente razonamiento, código, matemáticas y tool calling en cinco idiomas. No obstante, la evaluación publicada es preliminar y limitada, y no hay resultados completos de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (tag `qwen3_5`); fusión SLERP de dos fine-tunes |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint es el resultado de una interpolación esférica (SLERP) entre `xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic` y `xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic`, con `t = 0.4` a favor del primero. Ambos padres derivan de `Qwen/Qwen3.5-4B`, por lo que la arquitectura subyacente es la de Qwen3.5 en su variante de 4B, con pipeline `image-text-to-text`, lo que sugiere soporte de entrada multimodal imagen-texto en la arquitectura base (no se detalla el alcance exacto de la torre visual en la información disponible).

En cuanto a datos de entrenamiento, la información es indirecta: los padres se entrenaron con datos distintos. El padre de código (Qwopus) combina trazas de razonamiento de Claude reconstruidas mediante Trace Inversion (datasets `Jackrong/Claude-opus-4.6-TraceInversion-9000x` y `Jackrong/Claude-opus-4.7-TraceInversion-5000x`) con trayectorias de agente y uso de herramientas procedentes de `lambda/hermes-agent-reasoning-traces` (originadas en Kimi-K2.5 y GLM-5.1-FP8, cubriendo tool calling, operaciones de terminal, trabajo sobre repositorios y automatización de navegador). El padre de razonamiento (DeepSeek-V4-Pro) se destiló con aproximadamente 250K muestras de matemáticas y STEM. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO en ninguna de las etapas.

La innovación técnica principal es el propio método de fusión: SLERP sobre los pesos en lugar de un fine-tuning adicional, lo que permite heredar capacidades complementarias sin coste de entrenamiento. El autor indica además que el comportamiento abliterado (decensurado) de los padres se ha verificado en el modelo fusionado.

## Capacidades

- Generación de texto conversacional en inglés, chino, español, ruso y japonés.
- Razonamiento multi-paso y descomposición de problemas estructurados.
- Matemáticas y conocimiento STEM/científico, heredado del padre destilado de DeepSeek-V4-Pro.
- Generación de código, depuración, localización de bugs, parches y refactorización.
- Tool calling y function calling, con soporte para enrutado de herramientas.
- Flujos de agente: trayectorias multi-turno, operaciones de terminal, trabajo sobre repositorios y automatización de navegador (según los datos de entrenamiento del padre de código).
- Entrada imagen-texto a nivel de pipeline (`image-text-to-text`); el alcance concreto de las capacidades de visión no está detallado en la información disponible.
- Comportamiento decensurado/abliterado: menor tasa de rechazos ante peticiones que los modelos alineados estándar rechazarían.

## Casos de uso

- Asistente de programación en local: el modelo puede generar parches y localizar bugs en un repositorio, integrándose en un flujo de desarrollo con un IDE o un CLI de agente, gracias a su herencia del padre orientado a código y a su soporte de tool calling.
- Automatización de tareas de terminal y repositorio: con trayectorias de agente en su entrenamiento, es adecuado para pipelines que ejecutan comandos, inspeccionan ficheros y aplican cambios de forma iterativa.
- Resolución de problemas matemáticos y científicos: útil como tutor o asistente de derivaciones paso a paso en entornos educativos o de investigación, aprovechando las ~250K muestras STEM del padre de razonamiento.
- Enrutado de herramientas en backends de agentes: puede decidir qué función invocar y con qué argumentos en arquitecturas de function calling, sustituyendo a modelos mayores en tareas de clasificación y selección de herramientas.
- Atención al cliente multilingüe: cubre inglés, chino, español, ruso y japonés, lo que permite desplegar un único modelo para conversaciones multi-turno en varios mercados.
- Prototipado e investigación sobre fusión de modelos: sirve como caso de estudio reproducible de merging SLERP para investigadores que quieran evaluar la preservación de capacidades tras la interpolación de pesos.
- Procesamiento de documentos con imagen: al declarar pipeline `image-text-to-text`, puede emplearse en tareas de descripción o extracción a partir de imágenes, aunque conviene validar el rendimiento real de visión antes de usarlo en producción.
- Experimentación con modelos decensurados: útil en investigación sobre alineación y tasas de rechazo, dado su comportamiento abliterado confirmado.

## Benchmarks y rendimiento

La model card indica que la evaluación preliminar se limitó a la variante de 4B y comparó el modelo con sus padres sobre un conjunto reducido de benchmarks. El autor señala que la fusión conserva en gran medida el rendimiento general, sin indicios claros de degradación, con puntuaciones que varían ligeramente según la tarea y un comportamiento similar a los padres en ARC-Easy. No se publican cifras concretas en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4,66 B parámetros, en FP16/BF16 se requieren aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 5 GB; en 4 bits, en torno a 3 GB (estimaciones a partir del tamaño del repo de 9,3 GB en safetensors, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue en FP16 con concurrencia; RTX 4090 o RTX 3090 para FP16 en un solo dispositivo; GPUs consumer de 8-12 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas de 8 GB o más con cuantización de 4 bits, y en 16-24 GB en precisión completa.
- Opciones de despliegue: transformers (librería declarada); el resto de motores (vLLM, llama.cpp, Ollama, TGI) no están confirmados en la información disponible, aunque al ser una arquitectura Qwen3.5 es probable que exista soporte en ecosistemas compatibles, pendiente de verificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Wukong 4B (este modelo) | ~4,66 B | no disponible | Apache 2.0 | Fusión SLERP de dos fine-tunes Qwen3.5; decensurado |
| Qwen/Qwen3.5-4B (base) | ~4 B (según nomenclatura) | no disponible | no disponible en la información | Modelo base de ambos padres; sin decensurar |
| xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic | ~4 B | no disponible | no disponible en la información | Padre centrado en código y agentes |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4 B | no disponible | no disponible en la información | Padre centrado en matemáticas y STEM |
| xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic | ~9 B | no disponible | no disponible en la información | Variante mayor del mismo autor, recomendada para mayor capacidad |

Los datos de rendimiento comparativo no están disponibles; la model card solo indica que el modelo fusionado mantiene puntuaciones similares a sus padres en el conjunto reducido de benchmarks evaluado.

## Limitaciones y advertencias

- Evaluación preliminar y limitada: el autor reconoce restricciones de recursos y un conjunto reducido de benchmarks; no hay resultados numéricos publicados que permitan validar el rendimiento en producción.
- Riesgo de alucinación: inherente a los modelos de 4B, especialmente en razonamiento largo y matemáticas; las trazas de razonamiento de los datos de entrenamiento son reconstruidas sintéticamente (Trace Inversion), no trazas internas reales, lo que puede introducir patrones de razonamiento plausibles pero incorrectos.
- Comportamiento decensurado: al ser una variante abliterada, la tasa de rechazos es baja; esto implica riesgo de generar contenido inapropiado o dañino y requiere filtros externos si se despliega de cara al público.
- Idiomas: solo se declaran en, zh, es, ru y ja; el rendimiento en otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el contenido generado por un modelo decensurado y sobre el cumplimiento normativo aplicable.
- Capacidades multimodales: el pipeline es `image-text-to-text`, pero no se detalla el alcance ni la calidad del procesamiento de imágenes; conviene validarlo antes de usarlo en tareas de visión.
- Procedencia de los datos: parte del entrenamiento de los padres proviene de destilación de modelos de terceros (Claude, DeepSeek, Kimi, GLM); deben considerarse las condiciones de uso de esos orígenes en despliegues comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Variante 9B: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Padre de código: https://huggingface.co/xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic
- Fine-tune original del padre de código: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Padre de razonamiento: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune original del padre de razonamiento: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset Claude Opus 4.6 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Claude Opus 4.7 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trayectorias de agente: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Paper de referencia (Trace Inversion): https://arxiv.org/abs/2603.07267
