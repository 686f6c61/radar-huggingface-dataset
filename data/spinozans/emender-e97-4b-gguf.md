# spinozans/emender-e97-4b-gguf

## Resumen

EMENDER E97 4B es una familia de modelos de lenguaje de 4.045.972.080 parámetros desarrollada por el usuario spinozans, publicada en HuggingFace en formato GGUF para llama.cpp. Su rasgo distintivo es que no utiliza atención: emplea una arquitectura híbrida recurrente con estado acotado por capa (recurrencia secuencial de estado tanh acotado), 18 capas, dimensión de modelo 3840, 60 cabezas de 64 dimensiones, MLP SwiGLU con oculta de 9600 y embedding/lm_head atados. Al no tener atención, tampoco tiene caché KV: el estado es de tamano fijo por capa, lo que explica su eficiencia en CPU.

El repositorio incluye dos checkpoints diferenciados. Por un lado, la variante base (`e97-4b-base-99B-f32` y `e97-4b-base-99B-q4_0`), un checkpoint de preentrenamiento desde cero con ~99,7 mil millones de tokens, sin post-entrenamiento ni formato de chat: es un modelo de continuación de texto puro. Por otro, la variante de agente (`e97-4b-pi-f32-aligned`, `e97-4b-pi-q8_0-v2` y `e97-4b-pi-q4_0`), post-entrenada para una superficie de herramientas de agente de programación y validada mediante doble puerta (dual-gate) en la versión v6-u96.

Su relevancia actual es doble: por un lado, explora una vía arquitectónica poco común (recurrencia pura sin atención) que reduce el coste de inferencia en CPU; por otro, es un artefacto experimental con cero descargas y cero valoraciones en el momento de redactar esta ficha, requiere un binario de llama.cpp con una arquitectura personalizada registrada (`emender_e97`) y no incrusta plantilla de chat, por lo que su adopción en producción exige precauciones explícitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida recurrente sin atención (recurrencia secuencial de estado tanh acotado), 18 capas, d_model 3840, 60 cabezas x 64, MLP SwiGLU con oculta 9600, embedding/lm_head atados |
| Parametros totales | 4.045.972.080 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f32, q8_0-v2, q4_0 (formato GGUF) |
| Idiomas soportados | No disponible oficialmente; vocabulario p50k_base de 50.281 tokens más 24 extras codex space-run, orientado a inglés y código |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); los checkpoints de referencia se distribuyen como variantes f32 |
| Vocabulario | 50.281 tokens (p50k_base) + 24 extras codex space-run |
| Cache KV | No aplica (arquitectura sin atención; estado acotado por capa) |
| Tamano del repositorio | 43,1 GB |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura E97 abandona el mecanismo de atención por completo y sustituye el contexto de clave-valor por una recurrencia secuencial de estado acotado con función tanh, con 18 capas de 3840 dimensiones, 60 cabezas de 64 dimensiones y un MLP SwiGLU de 9600 unidades ocultas. El embedding de entrada y la cabeza de salida comparten pesos (tied embedding/lm_head) y el vocabulario combina el tokenizador p50k_base de 50.281 entradas con 24 tokens extra de espacios de código (codex space-run). La consecuencia práctica es que no existe caché KV: el consumo de memoria durante la decodificación es constante y no crece con la longitud de la secuencia, lo que abarata la inferencia en CPU.

En cuanto al entrenamiento, la variante base procede de una ejecución de preentrenamiento desde cero hasta el paso 24448, aproximadamente 99,72 mil millones de tokens, con SHA-256 `3ace004251643acf2e7c7f720e8f29968ad0a483441553c0c885b87b3df84568`. La composición del dataset, el uso de RLHF/DPO u otras técnicas de alineamiento en la variante base no están documentados en la información disponible. La variante de agente corresponde al checkpoint promovido v6-u96, que superó una doble puerta de validación, con SHA-256 `d81464982c3ebc0d72769a87e079068bf535d6ca2010185dc1bb03ce264b8f5b`, y fue post-entrenada sobre una superficie de herramientas de agente de programación siguiendo un protocolo estricto de cinco líneas (Analysis/Commentary/Action/Arguments) bajo un system prompt canónico. La conversión a GGUF se verificó tensor a tensor contra los state dicts de origen, y la cualificación del port (runner GGML más arquitectura registrada en llama.cpp frente a la referencia en GPU) reportó 32/32 en top-1 y KL de 0,0007 en f32.

## Capacidades

- Generación de texto y continuación de lenguaje: la variante base es un modelo de lenguaje puro de continuación, sin formato conversacional.
- Agente de programación con uso de herramientas: el checkpoint `pi` está post-entrenado para una superficie concreta de tool use orientada a tareas de código.
- Tool calling / function calling: soportado en el checkpoint de agente, pero únicamente a través del protocolo de cinco líneas entrenado y con el system prompt canónico.
- Razonamiento multi-paso: el marco Analysis/Commentary/Action/Arguments está diseñado para descomponer tareas de agente, si bien no hay evaluaciones publicadas de su fiabilidad.
- Ejecución eficiente en CPU: al no existir caché KV ni atención, el estado es acotado por capa y el coste de memoria no crece con la longitud de generación.
- Capacidades multilingües: no documentadas; el vocabulario p50k_base con extras de código sugiere un sesgo fuerte hacia inglés y lenguajes de programación.
- Capacidades especiales: no se documentan modos de pensamiento explícitos, visión ni audio.
- No soporta chat conversacional general: el checkpoint de agente es un agente estrecho de código y herramientas, no un asistente general.

## Casos de uso

- Agente de código en local: el checkpoint `pi-q8_0-v2` puede ejecutarse con llama-server para resolver tareas de edición y consulta de repositorios mediante el protocolo de cinco líneas, con un consumo de memoria fijo de 4,87 GB y sin caché KV que crezca con la conversación.
- Automatización de pipelines de CI/CD: integrado como paso de generación o parcheo de código a través de la ruta de servicio compatible con OpenAI del repositorio Emender, siempre que se respete el códec entrenado.
- Inferencia en CPU y entornos sin GPU: con 32 hilos de CPU alcanza 19,4 tok/s en q8_0-v2 y 25,4 tok/s en q4_0, lo que lo hace viable en servidores sin acelerador y en estaciones de trabajo modestas.
- Despliegue en hardware de borde: la variante q4_0 ocupa 2,94 GB, de modo que cabe en dispositivos con memoria unificada o GPU integrada, a costa de una degradación medida de un prompt sobre 32 en el panel de cualificación.
- Investigación sobre arquitecturas recurrentes sin atención: la variante base permite estudiar el comportamiento de la recurrencia de estado acotado frente a transformers equivalentes en tareas de continuación de texto.
- Generación de texto especializada en código con vocabulario adaptado: los 24 tokens extra de espacios de código reducen la fragmentación en la tokenización de indentaciones y bloques de código.
- Prototipado de agentes con herramientas en local: útil para validar formatos de acción/argumentos en entornos controlados antes de migrar a modelos mayores, dado que no requiere GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo publicado es el panel de cualificación de cuantizaciones, medido sobre 32 prompts congelados frente a la referencia f32 del propio modelo (concordancia top-1 del siguiente token, KL sobre los 64 logits más probables y coincidencia exacta en decodificación greedy):

| Modelo | Cuantizacion | top-1 vs f32 | KL media | Tamano | tok/s en decodificacion | Veredicto |
|---|---|---|---|---|---|---|
| Agente | q8_0-v2 | 32/32 (100 %) | 0,0020 | 4,87 GB | 19,4 | Cualificada, recomendada |
| Agente | q4_0 | 31/32 (96,9 %) | 0,0371 | 2,94 GB | 25,4 | Opción de huella reducida, falla un prompt |
| Base-99B | q4_0 | 27/32 (84,4 %) | 0,0186 | 2,94 GB | 25,0 | Opción de huella reducida |
| Cualquiera | f32 | Referencia | Referencia | No disponible | 7-8 | Referencia de máxima fidelidad |

Las cifras de tok/s corresponden a 32 hilos de CPU en un host compartido. El criterio de cualificación del port exige top-1 mayor o igual a 0,97 y KL menor o igual a 0,05.

## Requisitos de hardware

- VRAM estimada: en torno a 3 GB para q4_0, 4,9 GB para q8_0-v2 y 16,2 GB para f32 (4.045.972.080 parámetros a 4 bytes), más el overhead del runtime. Al no haber caché KV, la memoria no crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 6 GB para q4_0 y 8 GB para q8_0; para f32 se necesita una GPU de 24 GB o superior (RTX 3090/4090, A100, H100). El modelo está pensado prioritariamente para CPU.
- Cabe en GPU de consumo: sí. q8_0-v2 (4,87 GB) entra en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; q4_0 (2,94 GB) entra en GPU de 6-8 GB.
- Opciones de despliegue: llama.cpp con la arquitectura personalizada `emender_e97` registrada (el repositorio Emender incluye la serie de parches de registro), mediante `llama-cli` y `llama-server`; la ruta de servicio compatible con OpenAI y el REPL de CPU del repositorio Emender implementan el códec entrenado. No hay soporte documentado en vLLM, TGI u Ollama.
- Latencia y throughput: 19,4 tok/s con q8_0-v2, 25,4 tok/s con q4_0 de agente, 25,0 tok/s con q4_0 base y 7-8 tok/s con f32, medidos con 32 hilos de CPU en un host compartido.
- Invocación de ejemplo documentada: `llama-cli -m e97-4b-base-99B-q4_0.gguf -p "Once upon a time" -n 64 -t 32 --temp 0.7 -st` y `llama-server -m e97-4b-pi-q8_0-v2.gguf --host 127.0.0.1 --port 8151 -t 32`.

## Comparativa con modelos similares

La comparación se limita a parámetros, contexto, licencia y disponibilidad, ya que no hay resultados de benchmarks de este modelo frente a alternativas. Los datos de los modelos comparados son los públicamente conocidos de sus respectivas fichas.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMENDER E97 4B | 4,05 B | No disponible | Recurrente sin atención | Apache 2.0 | GGUF, requiere llama.cpp con `emender_e97` |
| Qwen2.5-Coder-3B | 3,09 B | 32.768 tokens | Transformer con atención | Apache 2.0 | GGUF, safetensors, integración amplia |
| Llama 3.2 3B | 3,21 B | 128.000 tokens | Transformer con atención | Licencia comunitaria Llama 3.2 | GGUF, safetensors, ecosistema amplio |
| Phi-3.5-mini | 3,8 B | 128.000 tokens | Transformer con atención | MIT | GGUF, safetensors, amplia integración |

Frente a estas alternativas, EMENDER E97 destaca por su ausencia de caché KV y su coste de memoria constante, pero carece de contexto declarado, de plantilla de chat integrada y de soporte en los runtimes habituales, mientras que los modelos comparados ofrecen contextos de 32.000 a 128.000 tokens, licencias permisivas o comunitarias y disponibilidad inmediata en vLLM, TGI y Ollama.

## Limitaciones y advertencias

- No incrusta plantilla de chat: llama.cpp aplica un envoltorio estilo ChatML que no es el formato entrenado. Para un comportamiento dentro de distribución hay que usar la ruta de servicio del repositorio Emender o su REPL de CPU.
- La decodificación greedy colapsa en repeticiones en ambos checkpoints, tanto en f32 como en q4; es una propiedad del modelo, no un artefacto de cuantización. Se recomienda muestreo con temperatura en torno a 0,7, min-p o penalizaciones DRY.
- El checkpoint base es un modelo de lenguaje crudo: continúa texto, no conversa.
- El checkpoint de agente es un agente estrecho de código y herramientas, no un asistente general; no debe desplegarse como chatbot de propósito general.
- Requiere un binario de llama.cpp con la arquitectura `emender_e97` registrada; los binarios estándar no cargarán estos GGUF.
- Degradación por cuantización declarada por el propio autor: q4_0 del agente falla exactamente un prompt del panel (31/32) y q4_0 de la base degrada más (27/32, 84,4 %). El autor recomienda q8_0-v2 como la cuantización más pequena que cumple el criterio de cualificación.
- Idiomas: no hay lista oficial de idiomas soportados; el vocabulario p50k_base más extras de código implica una cobertura multilingüe limitada y no verificada.
- Longitud de contexto: no disponible. No hay dato publicado sobre la ventana efectiva ni sobre el comportamiento de la recurrencia en secuencias largas.
- Sesgos: no hay evaluación de sesgos publicada.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 4 B parámetros con preentrenamiento de ~99,7 mil millones de tokens, es esperable una tasa elevada en tareas factuales, aunque no hay mediciones disponibles.
- Madurez: el repositorio tiene 0 descargas y 0 valoraciones, está etiquetado como experimental y no cuenta con validación independiente de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo, especialmente en el checkpoint de agente, cuyo protocolo de cinco líneas es obligatorio para un funcionamiento correcto.

## Enlaces

- HuggingFace: https://huggingface.co/spinozans/emender-e97-4b-gguf
- Repositorio Emender (parches de registro de la arquitectura, servidor compatible con OpenAI y REPL de CPU): mencionado en la model card sin URL disponible; no disponible
- Paper o publicación técnica: no disponible
- Demos: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron listados de un foro serbio sin relación con el contenido.
