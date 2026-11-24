# tensorninja2/inkling-2-mini-decision-1

## Resumen

inkling-2-mini-decision-1 es un adaptador de decisión (LoRA más una cabeza de puntero) desarrollado por el usuario tensorninja2 sobre el modelo base thinkingmachines/Inkling-2-Mini. No es un modelo generativo al uso: lee un estado textual y una serie de preguntas tipadas, y devuelve directamente una probabilidad para cada opción mediante un único prefill, sin generar tokens. Está empaquetado en formato `.ninfer` para servirse con NInfer-4090, un runtime específico que expone dos protocolos: OpenAI Decisions (`POST /v1/decisions`) y TypeSafe System One (`POST /typesafe/v1/systemone`).

La relevancia del adaptador reside en su enfoque: sustituye la generación autoregresiva por una clasificación probabilística calibrada sobre el estado completo, lo que reduce la latencia a decenas de milisegundos por pregunta sobre una RTX 4090 con estado cacheado. El adaptador tiene un tamaño de 23.764.492 bytes y una licencia Apache 2.0. El autor advierte de que la versión 2 (inkling-2-mini-decision-2) lo sustituye.

El modelo está pensado para escenarios de enrutamiento, clasificación y toma de decisiones binarias o multiclase donde se necesita una probabilidad calibrada (Brier, ECE) más que texto libre. No es compatible con PEFT, Transformers ni GGUF, y requiere el runtime NInfer-4090 y el artefacto Inkling 2 Mini NInfer para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32) sobre las siete proyecciones de atención de Inkling 2 Mini, más cabeza de puntero (query/key de 256 dimensiones sobre hidden state de 2.304) |
| Parametros totales | no disponible (adaptador de 23.764.492 bytes; el modelo base es Inkling-2-Mini) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens por estado; 73.728 tokens para estado más una pregunta |
| Tipos de cuantizacion | no disponible como opción del adaptador; el runtime aplica recetas NVFP4 y MXFP8 en las activaciones de los expertos durante el entrenamiento |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (adaptador de decisión); no es PEFT, Transformers ni GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 aplicado sobre siete proyecciones de atención del modelo base: query, query de posición relativa, output gate, attention sink, key, value y salida de atención. Sobre el hidden state final de anchura 2.304 se añade una cabeza de puntero con proyecciones query y key de 256 dimensiones, que produce la probabilidad por opción. La temperatura de calibración es 1.289, elegida para minimizar la NLL en el split de calibración.

El entrenamiento consistió en una época sobre el split de entrenamiento de decision-v7 (12.576 registros, 1.572 pasos, semilla 0). Los expertos del modelo base permanecieron congelados y empaquetados. En la pasada forward se aplicó cuantización falsa a las activaciones de los expertos con las recetas de servicio NVFP4 y MXFP8, y en la backward se usaron gradientes straight-through. En pilotos de 200 pasos, el LoRA de atención con rango 16 superó al de rango 8 y al de rango 8 con factores de experto. La conversión a `.ninfer` se hizo con `tools/convert/inkling2_mini/convert_lora.py --decision-head`.

## Capacidades

- Clasificación probabilística de estados textuales: devuelve una probabilidad por cada opción de una pregunta tipada, sin generar texto.
- Tipos de pregunta soportados: `predicate`, `choice`, `noul` y `score` (este último el más débil en evaluación).
- Decisión por prefill único: no hay decodificación autoregresiva, lo que elimina la latencia de generación.
- Soporte de múltiples preguntas sobre un mismo estado en una sola llamada.
- Protocolo OpenAI Decisions mediante `POST /v1/decisions`, compatible con el SDK de OpenAI 3.26.0 o superior.
- Protocolo TypeSafe System One mediante `POST /typesafe/v1/systemone`, compatible con el SDK TypeSafe 0.6 y 0.7.
- Acepta imágenes en línea en el estado cuando Vision está habilitado (por defecto si cabe), manteniendo resolución nativa; el parámetro `detail` se acepta y se ignora.
- No dispone de detección de rechazo (refusal detection).

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket, el adaptador devuelve la probabilidad de que pertenezca a categorías como facturación, incidencias técnicas o cancelaciones, permitiendo derivar al equipo adecuado con un umbral calibrado. La calibración ECE de 0.013 en test lo hace adecuado para decisiones automáticas con umbral.
- Moderación y triaje de contenido: clasificación binaria o multiclase de mensajes entrantes con probabilidad asociada, aprovechando el prefill único para procesar grandes volúmenes con latencia de decenas de milisegundos por pregunta sobre estado cacheado.
- Detección de intención en asistentes conversacionales: sobre un estado de conversación de hasta 65.536 tokens, evaluar varias preguntas tipadas a la vez (por ejemplo, intención, urgencia y sentimiento) en una sola llamada, con seis preguntas en torno a 70 ms en RTX 4090.
- Clasificación documental con contexto largo: contratos, correos o informes de hasta 65.536 tokens se pueden evaluar contra preguntas tipadas sin truncar, gracias a la ventana de contexto del modelo base.
- Verificación de condiciones en pipelines de agentes: el adaptador actúa como "System One" para decidir si se cumple una precondición antes de ejecutar una acción, devolviendo una probabilidad en lugar de una respuesta generada, lo que simplifica la lógica de control.
- Análisis de imágenes en flujos de decisión: cuando Vision está habilitado, se pueden incluir imágenes en línea en el estado para preguntas de clasificación visual, aunque el autor advierte de que no hay precisión ni calibración establecidas para tareas de imagen en este adaptador.
- Evaluación de riesgo en atención al cliente: preguntas tipo `score` sobre el estado permiten estimar la probabilidad de escalado o de riesgo de abandono, si bien esta es la categoría con peor rendimiento (0.550 de accuracy en test).

## Benchmarks y rendimiento

Evaluación sobre las preguntas "knowable" limpias del corpus decision-v7 de kev, servido a través de NInfer-4090. El split de test bloqueado se evaluó una vez por modo de KV, con procedimiento declarado antes de la ejecución.

| Split | KV | Preguntas | Accuracy | Brier | NLL | ECE |
|---|---|---:|---:|---:|---:|---:|
| Development | `bf16` | 1.264 | 0.851 | 0.205 | 0.390 | 0.022 |
| Development | `rk4v4` | 1.264 | 0.854 | 0.200 | 0.383 | 0.017 |
| Locked test | `bf16` | 1.200 | 0.837 | 0.216 | 0.387 | 0.013 |
| Locked test | `rk4v4` | 1.200 | 0.836 | 0.216 | 0.389 | 0.013 |

Por tipo de pregunta en test con KV BF16: `choice` alcanza 0.904 de accuracy, `noul` 0.913 y `score` 0.550 (el más débil). El propio entrenador, evaluando los mismos pesos en development, obtuvo 0.858 de accuracy y ECE 0.032. Como referencia, qwen3.8-27b-decision-1 sobre Qwen3.8-27B alcanza 0.856 de accuracy en test con ECE 0.020.

Rendimiento en RTX 4090 con estado de 8K tokens cacheado: aproximadamente 29 ms para una pregunta y 70 ms para seis preguntas. Un estado de 8K tokens en frío añade unos 2,1 s de prefill.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 23,7 MB y el modelo base Inkling 2 Mini se sirve junto a él mediante NInfer-4090.
- GPU recomendada: RTX 4090 (el runtime se denomina NInfer-4090 y las latencias publicadas son sobre esa GPU). Otras GPU no están documentadas en la información disponible.
- Cabe en GPU consumer: sí, al menos en RTX 4090 según las mediciones publicadas.
- Opciones de despliegue: exclusivamente NInfer-4090 (`ninfer-serve`), con los artefactos `models/inkling2_mini.ninfer` y el adaptador en un directorio de adaptadores de Inkling. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: ~29 ms por pregunta y ~70 ms para seis preguntas con estado de 8K cacheado; ~2,1 s adicionales de prefill en frío para 8K tokens.
- Configuración de servicio: `--kv-dtype bf16 --max-context 32768 --lora-dir lora/inkling-2-mini --lora-slots 2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy test | ECE test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| inkling-2-mini-decision-1 | Adaptador LoRA r16 sobre Inkling 2 Mini | 65.536 tokens por estado | 0.837 | 0.013 | Apache 2.0 | Hugging Face, requiere NInfer-4090 |
| inkling-2-mini-decision-2 | Adaptador LoRA sobre Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | Hugging Face; sustituye a la versión 1 |
| qwen3.8-27b-decision-1 | Adaptador sobre Qwen3.8-27B | no disponible | 0.856 | 0.020 | no disponible | Referenciado en la model card |

## Limitaciones y advertencias

- Las probabilidades por pregunta no cumplen la tolerancia de servicio de kev (|Δp| ≤ 0,03 y como máximo un cambio de respuesta por cada 280 preguntas) frente al entrenador. Inkling ejecuta activaciones de 4 bits en los expertos de 20 capas a lo largo de 48 visitas de capa, por lo que evaluaciones equivalentes de una misma pregunta pueden diferir hasta 0,5, tanto en entrenamiento como en servicio. La accuracy y la calibración a nivel de tarea no se ven afectadas.
- El adaptador se entrenó solo con texto. Aunque NInfer acepta imágenes en OpenAI Decisions, no hay accuracy ni calibración establecidas para tareas de imagen con este adaptador.
- Límite de estado: 65.536 tokens por estado y 73.728 tokens para estado más una pregunta.
- No hay detección de rechazo (refusal detection).
- El rendimiento en preguntas de tipo `score` es notablemente inferior (0.550 de accuracy en test) frente a `choice` (0.904) y `noul` (0.913).
- Requiere un runtime propietario (NInfer-4090) y un artefacto específico del modelo base; no es portable a ecosistemas estándar como PEFT, Transformers o GGUF.
- El pool de adaptadores rechaza adaptadores convertidos para otro modelo, por lo que el directorio de adaptadores debe contener solo adaptadores de Inkling.
- La versión 2 del adaptador sustituye a esta versión 1; se recomienda evaluar la migración.
- No se han publicado datos sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de este adaptador en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el runtime NInfer-4090 pueden tener condiciones propias que deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensorninja2/inkling-2-mini-decision-1
- Versión 2 del adaptador: https://huggingface.co/tensorninja2/inkling-2-mini-decision-2
- Modelo base Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Artefacto Inkling 2 Mini NInfer: https://huggingface.co/tensorninja2/Inkling-2-Mini-NInfer
- Runtime NInfer-4090: https://github.com/tensorninja/ninfer-4090
- Sección Decisions de NInfer-4090: https://github.com/tensorninja/ninfer-4090#decisions-openai-and-typesafe-system-one
- Sección de adaptadores y decisiones de Inkling 2 Mini: https://github.com/tensorninja/ninfer-4090#inkling-2-mini-adapters-and-decisions
- Corpus decision-v7 (kev): https://github.com/jaredpalmer/kev
