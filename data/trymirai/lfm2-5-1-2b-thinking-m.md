# trymirai/LFM2.5-1.2B-Thinking-M

## Resumen

Mirai's LFM2.5-1.2B-Thinking Medium Quantization (identificador `trymirai/LFM2.5-1.2B-Thinking-M`) es una cuantización de 4 bits del modelo LiquidAI/LFM2.5-1.2B-Thinking, preparada por Mirai Labs para inferencia local eficiente en Apple silicon. El checkpoint conserva la arquitectura y el comportamiento del modelo original de LiquidAI, pero reduce el peso del repositorio a 3,2 GB y el número de parámetros almacenados a 613.300.992, lo que facilita su despliegue en equipos de sobremesa y portátiles con memoria unificada.

La relevancia de esta variante radica en su método de compresión: cuantización entera asimétrica de 4 bits con puntos cero de 4 bits, escalas en bfloat16 y tamaño de grupo 64, complementada con transformadas de Hadamard aleatorias en bloques diagonales para mitigar los valores atípicos en activaciones y pesos. Según el autor, el checkpoint se sitúa en la frontera de Pareto tamaño-divergencia KL, es decir, no se ha encontrado un checkpoint más pequeño con menor divergencia KL dentro de su mezcla de evaluación.

El modelo está pensado para generación de texto con capacidad de razonamiento (modo *thinking*) y se distribuye bajo la licencia LFM Open License, heredada del modelo base. Su ecosistema de ejecución es todavía restringido: la librería `uzu` y la CLI `mirai` solo soportan, por ahora, inferencia en Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM2.5-1.2B-Thinking); detalles concretos no disponibles en la informacion proporcionada |
| Parametros totales | 613.300.992 (pesos almacenados en el checkpoint cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits asimetrica con puntos cero de 4 bits, escalas bfloat16, group size 64; el repositorio incluye tambien tags de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License (lfm-open-license) |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento (PTQ) seguida de destilacion consciente de cuantizacion (*quantization-aware distillation*) sobre el modelo base LiquidAI/LFM2.5-1.2B-Thinking. La receta emplea cuantizacion entera asimetrica de 4 bits con puntos cero de 4 bits, escalas en bfloat16 y tamaño de grupo 64, e incorpora transformadas de Hadamard aleatorias en bloques diagonales (*Block-diagonal Random Hadamard Transforms*) para reducir el impacto de los valores atípicos tanto en activaciones como en pesos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original uso RLHF o DPO.

La evaluacion de la calidad de la cuantizacion se realizo sobre una mezcla de datos compuesta por un 45 % de datos publicos de tipo agente (*agentic*), un 30 % de datos publicos de SFT y contexto largo, y un 25 % de datos privados de chat. El autor publica una grafica de divergencia KL frente al tamaño del checkpoint y afirma que este modelo se encuentra en la frontera de Pareto de esa relacion. No se detallan innovaciones adicionales de decodificacion o atencion mas alla de las propias del modelo base.

## Capacidades

- Generacion de texto con modo de razonamiento (*thinking*), heredado del modelo base LFM2.5-1.2B-Thinking.
- Razonamiento multi-paso orientado a tareas de agente, segun la mezcla de evaluacion empleada por el autor (45 % agentic).
- Manejo de contexto largo, segun la inclusion de datos de SFT y contexto largo en la evaluacion (30 %).
- Conversacion multi-turno en tareas de chat, respaldada por el 25 % de datos privados de chat en la mezcla de evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente de razonamiento en local para desarrolladores: el modelo puede ejecutarse en un Mac con Apple silicon mediante la CLI `mirai`, lo que permite disponer de un asistente de razonamiento sin enviar datos a servicios en la nube.
- Prototipado de agentes en estaciones de trabajo: la mezcla de evaluacion con un 45 % de datos agenticos sugiere un comportamiento razonable en tareas de planificacion y uso de herramientas, adecuado para validar flujos de agente antes de escalar a modelos mayores.
- Procesamiento de conversaciones de chat: el 25 % de datos privados de chat en la evaluacion respalda su uso en asistentes conversacionales de proposito general con requisitos de privacidad.
- Analisis de documentos con contexto largo: la inclusion de datos de contexto largo en la evaluacion lo hace apto para resumir o extraer informacion de documentos extensos, siempre que se confirme la ventana de contexto efectiva del modelo base.
- Educacion y experimentacion: su tamaño reducido (3,2 GB de repositorio) permite distribuirlo en entornos docentes y de investigacion con hardware de consumo Apple.
- Evaluacion de tecnicas de cuantizacion: investigadores interesados en PTQ y destilacion consciente de cuantizacion pueden usar este checkpoint como referencia reproducible de la frontera tamaño-divergencia KL.
- Inferencia en portatiles con memoria unificada: al estar optimizado para Apple silicon, encaja en flujos de trabajo offline en los que no se dispone de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una comparacion de divergencia KL frente al tamaño del checkpoint, sin cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 3,2 GB y los pesos suman 613.300.992 parametros en 4 bits, por lo que se requiere memoria unificada suficiente para cargar el checkpoint y el estado de inferencia.
- GPU recomendadas: no disponibles. La unica plataforma soportada oficialmente es Apple silicon (macOS).
- Cabe en GPU de consumo: no se documenta soporte para GPU NVIDIA o AMD; el soporte actual se limita a Apple silicon.
- Opciones de despliegue: libreria `uzu`, CLI `mirai` (instalable via `brew install mirai`) y compilacion desde el repositorio `trymirai/uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/LFM2.5-1.2B-Thinking-M | 613.300.992 (checkpoint 4 bits) | no disponible | 4 bits asimetrica, group size 64 | LFM Open License | Apple silicon (`uzu`) |
| LiquidAI/LFM2.5-1.2B-Thinking | no disponible en la informacion proporcionada | no disponible | pesos originales | LFM Open License | multiple |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | LFM Open License | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de calidad respecto al modelo original; el autor la cuantifica mediante divergencia KL, pero no se ofrecen cifras absolutas en el texto disponible.
- El soporte de inferencia se limita actualmente a Apple silicon; no hay constancia de soporte para CUDA, ROCm ni CPU generica.
- La licencia LFM Open License es una licencia "other" con terminos propios; es imprescindible revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- No se documentan los idiomas soportados, lo que impide garantizar un comportamiento adecuado en castellano u otras lenguas distintas del ingles.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad especificas de esta variante cuantizada.
- El modelo base esta orientado a generacion de texto; no se declaran capacidades multimodales ni de tool calling, por lo que no debe asumirse su disponibilidad en produccion.
- El numero de descargas (370) y de likes (1) es bajo, lo que reduce la base de validacion independente del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/LFM2.5-1.2B-Thinking-M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Model card del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/main/README.md
- Licencia LFM Open License: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/main/LICENSE
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Pagina del modelo en Mirai: https://trymirai.com/local-models/liquidai-lfm2-5-1-2b-thinking-mirai-mirai-m-4
- Repositorio `uzu` (guia de ejecucion): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
