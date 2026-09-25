# ukisai/Swift-1.5-Qwen3.8-27b

## Resumen

Swift 1.5 Qwen3.8-27B es un derivado de Qwen3.8-27B desarrollado por UkisAI (ukisai) y publicado en HuggingFace bajo el identificador ukisai/Swift-1.5-Qwen3.8-27b. Se trata de un ajuste fino orientado a la eficiencia de razonamiento: según la model card, reduce un 58,5 % los tokens de pensamiento (thinking tokens) respecto al modelo base manteniendo —e incluso mejorando ligeramente— la puntuación agregada, lo que se traduce en una aceleración de 1,95× en varias tareas. El modelo declara 27.781.427.952 parámetros (~27,78 B) en safetensors y un repositorio de 55,6 GB, coherente con pesos en BF16.

El problema que aborda es el "sobrepensamiento patológico" (overthinking) de los modelos de razonamiento: cadenas de pensamiento largas que consumen presupuesto de inferencia sin aportar precisión. La estrategia de UkisAI consiste en identificar y penalizar los tokens asociados a ese sobrepensamiento, sin atacar directamente la longitud del razonamiento, y recuperar después la exactitud mediante RL y OPD (post-entrenamiento adicional). Swift 1.5 es una actualización directa de Swift 1.0 (~58,3 % menos tokens de pensamiento, <1 % de pérdida), con el foco puesto en tareas de código, agentes y horizonte largo.

Es relevante ahora porque compite en la franja de ~27 B, donde el coste por token y la latencia importan tanto como la precisión en despliegues de agentes y terminal-bench. Su pipeline declarado es image-text-to-text, por lo que acepta entradas multimodales de imagen y texto, y el repositorio es gated con licencia propietaria swift-open-license-1.0, orientada a licenciamiento empresarial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text), derivada por ajuste fino de Qwen/Qwen3.8-27B; detalles internos de capas y atención no disponibles |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Longitud de contexto | 262.144 tokens (valor de --max-model-len en el ejemplo de despliegue con vLLM publicado por el autor para la familia Swift) |
| Tipos de cuantizacion | BF16 en safetensors; GGUF (repositorio ukisai/Swift-1.5-Qwen3.8-27B-GGUF) y variante GSQ-RCO GGUF (ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF); otros formatos no disponibles |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8-27B; no se detallan en la información proporcionada) |
| Licencia | swift-open-license-1.0 (license: other); repositorio con acceso restringido (gated) |
| Formato de pesos | safetensors (librería transformers) y GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer multimodal con pipeline image-text-to-text y de que deriva por ajuste fino (base_model_relation: finetune) de Qwen/Qwen3.8-27B. No se especifica número de capas, tipo de atención, ni si incorpora componentes híbridos o MoE; tampoco se confirma que existan parámetros activos diferenciados, por lo que la ficha no incluye esa fila. El tamaño real de pesos (27,78 B) y el repositorio de 55,6 GB son consistentes con un checkpoint denso en BF16.

En cuanto al entrenamiento, la model card describe un proceso en dos fases. Primero se identifican los tokens vinculados al sobrepensamiento patológico y se penalizan sin recortar directamente la longitud del razonamiento; después se recupera la exactitud mediante RL y OPD, lo que produce un uso "comprimido" de tokens con precisión mantenida. Swift 1.5 parte de Swift 1.0 y escala esos métodos de post-entrenamiento con foco en tareas de horizonte largo, agénticas y de código, tal y como reflejan las mejoras citadas en LiveCodeBench y Terminal Bench 2.1. El autor publica los datos de entrenamiento en el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, aunque aclara que no se usan tal cual: se remuestrean y se convierten en entornos de RL. No se indica el volumen total de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (el despliegue recomendado incluye --reasoning-parser qwen3).
- Razonamiento token-eficiente: 58,5 % menos tokens de pensamiento que el modelo base según el autor.
- Generación de código y tareas de programación de horizonte largo (mejoras reportadas en LiveCodeBench y Terminal Bench 2.1).
- Uso de terminal y flujos agénticos (etiqueta terminal-bench en el repositorio).
- Tool calling / function calling: el ejemplo de despliegue de la familia Swift activa --enable-auto-tool-choice con --tool-call-parser qwen3_coder.
- Capacidades multimodales de entrada: pipeline image-text-to-text, admite imágenes junto con texto.
- Conversación multi-turno (etiqueta conversational), con contexto declarado de hasta 262.144 tokens en la configuración de vLLM.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de terminal y automatización de DevOps: el modelo está post-entrenado específicamente para tareas de terminal y horizonte largo (etiqueta terminal-bench y mejoras en Terminal Bench 2.1), por lo que encaja en bucles de ejecución de comandos, diagnóstico de fallos y reparación de pipelines.
- Generación de código en producción: con tool calling activable mediante --tool-call-parser qwen3_coder, puede integrarse en pipelines de CI/CD para proponer parches, invocar herramientas de build y validar resultados dentro de un bucle agéntico.
- Desarrollo de videojuegos y prototipado rápido: el autor demuestra la generación de un globo terráqueo 3D explorable; la tarea pasó de 104,6 minutos con el modelo base a 11,39 minutos con Swift 1.5, lo que lo hace útil para prototipos jugables generados por prompt.
- Asistentes conversacionales de contexto largo: con hasta 262.144 tokens de ventana en la configuración recomendada, permite mantener conversaciones multi-turno sobre documentación extensa o historiales largos sin truncar.
- Análisis de documentos con imagen y texto: al aceptar entradas image-text-to-text, sirve para extraer y razonar sobre información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Razonamiento matemático y analítico con coste controlado: el objetivo declarado del ajuste es reducir el gasto de tokens de pensamiento manteniendo la precisión, lo que reduce el coste por consulta en cargas de razonamiento masivo por lotes.
- Evaluación comparativa de eficiencia de razonamiento: sirve como referencia para estudiar técnicas de compresión de cadenas de pensamiento frente a Qwen3.8-27B y Swift 1.0.

## Benchmarks y rendimiento

La model card anuncia una tabla comparativa externa entre Qwen3.8-27B y Swift 1.5, pero los valores numéricos de esa tabla no están disponibles en la información proporcionada (solo se ha recuperado el marcado de estilo). Por tanto, no se reproducen cifras concretas de MMLU, HumanEval, GSM8K, LiveCodeBench o Terminal Bench 2.1.

Datos agregados que sí se declaran explícitamente:

| Metrica | Valor declarado |
|---|---|
| Reduccion de tokens de pensamiento frente al base | 58,5 % |
| Diferencia de puntuacion agregada frente al base | +0,35 % |
| Aceleracion en varias tareas | 1,95× (la pagina del repositorio GGUF de Swift 1.5 cita 9,18×, en contradiccion con la model card) |
| Comparacion de demo (generacion de juego 3D) | 104,6 minutos (base) frente a 11,39 minutos (Swift 1.5) |
| Swift 1.0 (version anterior) | 58,3 % menos tokens de pensamiento, <1 % de perdida, 1,95× de aceleracion |

No se han publicado resultados de benchmarks completos y verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: ~55,6 GB solo para pesos (27,78 B × 2 bytes), más caché KV; requiere GPUs de 80 GB (A100 80 GB, H100 80 GB) o tensor parallelism sobre varias GPUs.
- VRAM estimada en cuantización de 4 bits: ~14-16 GB de pesos, lo que permite ejecución en GPUs de consumo de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 / RTX 3090 (24 GB) con cuantización GGUF de 4-5 bits y contextos moderados; para ventanas cercanas a 262.144 tokens la caché KV exigirá offload a CPU o VRAM adicional.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 con contexto amplio; A6000 48 GB para cuantizaciones de 8 bits; RTX 4090/3090 para GGUF de 4 bits.
- Opciones de despliegue: vLLM o SGLang con una build que soporte Qwen3.8 (el autor publica un ejemplo con vllm serve, --dtype bfloat16, --tensor-parallel-size 1, --max-model-len 262144, --reasoning-parser qwen3, --enable-auto-tool-choice y --tool-call-parser qwen3_coder), transformers, así como llama.cpp / Ollama / LM Studio mediante los repositorios GGUF.
- Latencia y throughput absolutos: no disponibles. La única referencia cuantitativa es la aceleración relativa de 1,95× (o 9,18× en la página GGUF) frente al modelo base en determinadas tareas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B | 27,78 B | 262.144 tokens (config. vLLM) | -58,5 % tokens de pensamiento, +0,35 % puntuación agregada, 1,95× de aceleración frente al base | swift-open-license-1.0, acceso restringido (gated) | safetensors y GGUF en HuggingFace; 33 descargas y 14 likes en el momento de la consulta |
| Qwen3.8-27B (modelo base) | no disponible | no disponible | Referencia de comparación: mayor gasto de tokens de pensamiento, menor velocidad en las tareas medidas | no disponible | HuggingFace (Qwen/Qwen3.8-27B) |
| Swift 1.0 Qwen3.8-27B | no disponible (mismo base, ~27 B) | no disponible | -58,3 % tokens de pensamiento, <1 % de pérdida, 1,95× de aceleración | no disponible | HuggingFace; el autor reporta más de 350.000 descargas; GGUF disponible |

No se dispone de datos verificables de otros modelos de la misma franja (~27 B) en la información proporcionada, por lo que no se incluye una comparación adicional.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no documenta evaluación de sesgos ni de seguridad.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como modelo de razonamiento y uso agéntico, la propagación de errores en cadenas largas o en bucles de herramientas es un riesgo operativo a mitigar con verificación externa.
- La longitud de contexto de 262.144 tokens procede del ejemplo de despliegue con vLLM de la familia Swift, no de una especificación formal del repositorio de Swift 1.5; conviene validarla contra el config.json antes de dimensionar infraestructura.
- Idiomas soportados: no disponibles. No se puede garantizar calidad fuera de los idiomas principales del modelo base sin evaluación propia.
- Licencia: swift-open-license-1.0 con license: other y repositorio gated. El uso comercial requiere revisar los términos del archivo LICENSE y, según la model card, pasar por el licenciamiento empresarial de UkisAI.
- Discrepancia de datos: la aceleración declarada es 1,95× en la model card y 9,18× en la página del repositorio GGUF de Swift 1.5. No hay información que permita reconciliar ambas cifras.
- Los resultados de evaluación publicados no incluyen la tabla numérica completa en la información recuperada; no deben citarse cifras concretas de benchmarks sin consultar la fuente original.
- Todos los datos de rendimiento son comparaciones relativas frente a Qwen3.8-27B, no medidas absolutas de latencia o throughput.
- El acrónimo OPD no se desglosa en la model card, por lo que no se puede confirmar la técnica exacta empleada.
- Repositorio con pocas descargas (33) en el momento de la consulta: menor validación comunitaria que modelos establecidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Repositorio GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión anterior Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- GGUF de Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Dataset de SFT multi-turno agéntico: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Anuncio de la familia Swift: https://ukisai.com/news/introducing-swift
- Web del autor: https://ukisai.com
- Página de producto: https://ukisai.com/products/swift
- Demo jugable del ejemplo 3D: https://ukisai.com/swift-games/27b
- Vídeo de la demo: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/resolve/main/swift-1.5-planet-demo.mp4
