# squ11z1/Mythos-nano

## Resumen

Mythos-nano es un modelo de lenguaje de 3.085 millones de parámetros (3B) desarrollado por el usuario independiente squ11z1 como un finetune de WeiboAI/VibeThinker-3B, que a su vez se basa en la arquitectura Qwen2. El modelo está especializado en razonamiento matemático, programación competitiva y generación de código, y ha sido diseñado con una tesis clara: demostrar que un modelo pequeño, entrenado con feedback verificable, puede acercarse al rendimiento de sistemas frontera de cientos de miles de millones de parámetros en tareas de razonamiento.

El proyecto se presenta como independiente y no afiliado a Anthropic, a pesar del nombre. Incluye una variante "abliterada" (uncensored) en la que se ha eliminado la dirección de rechazo del modelo base, lo que reduce los guardarraíles de seguridad. Se distribuye bajo licencia MIT, con pesos en formato safetensors y GGUF, y está orientado principalmente al inglés. Su relevancia actual radica en que, según los benchmarks publicados por el autor, alcanza puntuaciones cercanas a modelos como GPT-5 o Claude Opus en matemáticas de competición y código, con solo 3B de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2), modelo denso |
| Parametros totales | 3.085.938.688 (3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la informacion) |
| Tipos de cuantizacion | GGUF f16 y Q4_K_M (segun model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Mythos-nano es un finetune de WeiboAI/VibeThinker-3B, un modelo base de 3B parámetros basado en la arquitectura Qwen2. Se trata de un transformer denso, sin mezcla de expertos. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. El autor menciona que el entrenamiento se baso en "feedback verificable" como principio central, lo que explicaria los buenos resultados en tareas de razonamiento matematico y codigo.

Una innovacion destacable es la aplicacion de "abliteration": se ha eliminado la direccion de rechazo del modelo, de modo que no declina peticiones que un modelo con ajuste de seguridad normalmente rechazaria. Ademas, el autor advierte explicitamente que el modelo no fue entrenado con datos de tool-calling ni programacion orientada a agentes, por lo que no se recomienda su uso en tareas de function calling o agentes autonomos.

## Capacidades

- Razonamiento matematico avanzado: resuelve problemas de olimpiadas y competiciones (AIME, HMMT, BruMO, IMO) con alta precision para su tamano.
- Generacion de codigo: rinde bien en problemas de programacion competitiva estilo LeetCode y en benchmarks como LCBv6 y OJBench.
- Razonamiento paso a paso: genera cadenas de razonamiento extensas (hasta 40960 tokens de salida recomendados para problemas dificiles).
- Conversacion: soporta chat multi-turno mediante plantilla de chat estandar.
- Capacidad multilingue: limitada al ingles; no se menciona soporte para otros idiomas.
- Sin soporte de tool calling ni function calling: el autor desaconseja su uso en tareas de orquestacion de APIs o agentes autonomos.
- Modo "uncensored": al estar abliterado, no rechaza peticiones que un modelo de seguridad rechazaria, lo que implica guardarrailes reducidos.

## Casos de uso

- Resolucion de problemas matematicos de competicion: el modelo puede abordar problemas de olimpiadas (AIME, HMMT, BruMO) generando razonamientos detallados. Es adecuado para estudiantes o investigadores que necesitan soluciones explicadas paso a paso, gracias a su capacidad de generar cadenas de razonamiento largas (hasta 40960 tokens).
- Programacion competitiva: con un 96,1% de tasa de exito en problemas de LeetCode (123/128), puede usarse para practicar, generar soluciones en Python y comparar enfoques. Su tamano reducido permite ejecutarlo en hardware modesto, ideal para entrenamiento local.
- Asistente de estudio en matematicas y ciencias: puede actuar como tutor explicando teoremas, demostraciones y problemas de nivel universitario, siempre que la conversacion se mantenga en ingles.
- Generacion de codigo en entornos controlados: aunque no soporta tool calling, puede generar funciones y algoritmos completos para su revision manual. Adecuado para prototipado rapido en scripts locales sin integracion con APIs.
- Investigacion en razonamiento de modelos pequenos: dado su rendimiento desproporcionado para 3B, sirve como caso de estudio para tecnicas de entrenamiento con feedback verificable y abliteration.
- Evaluacion de tecnicas de cuantizacion: al disponer de versiones GGUF (f16 y Q4_K_M), permite experimentar con despliegue en CPU y GPU de baja capacidad mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

La model card publica resultados comparativos con modelos de gran tamano (hasta 1T de parametros). Se presentan los datos tal como aparecen en la informacion proporcionada:

| Modelo | Parametros | AIME25 | AIME26 | HMMT25 | BruMO25 | IMO-Ans | LCBv6 | OJBench | GPQA-D | IFEval | IFBench |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kimi K2.5 | 1T | 96.1 | 93.3 | 95.4 | 98.3 | 81.8 | 85.0 | 54.7 | 87.6 | 93.9 | 70.0 |
| GLM-5 | 744B | 96.7 | 95.8 | 97.9 | – | 82.5 | 85.5 | 55.0 | 86.0 | 92.6 | 76.5 |
| DeepSeek V3.2 | 671B | 93.1 | 94.2 | 90.2 | 96.7 | 78.3 | 80.8 | 48.4 | 82.4 | 92.6 | 60.7 |
| Gemini 3 Pro | N/A | 96.0 | 91.7 | 97.5 | 98.3 | 83.1 | 87.4 | 58.8 | 91.9 | – | 70.4 |
| Claude Opus 4.5 | N/A | 92.8 | 95.1 | 92.9 | – | 78.5 | 84.8 | – | 87.0 | – | 58.0 |
| GPT-5 (high) | N/A | 94.6 | – | 88.3 | 91.7 | 76.0 | 84.5 | – | 85.7 | – | 73.1 |
| **Mythos-nano** | **3B** | **91.4** | **94.3** | **89.3** | **93.8** | **76.4** | **80.2** | **38.6** | **70.2** | **93.4** | **74.5** |
| **Mythos-nano + CLR** | **3B** | **96.7** | **97.1** | **95.4** | **99.2** | **80.6** | – | – | **72.9** | – | – |

En LeetCode contests (Python, tasa de exito):

| Modelo | Agregado |
|---|---|
| GPT-5.3-Codex | 100.0% (128/128) |
| Gemini 3.1 Pro | 99.2% (127/128) |
| Gemini 3 Flash | 96.9% (124/128) |
| **Mythos-nano** | **96.1% (123/128)** |
| GPT-5.2 | 95.3% (122/128) |
| Qwen3-Max | 91.4% (117/128) |
| Kimi K2.5 | 90.6% (116/128) |
| Claude Opus 4.6 | 86.7% (111/128) |

Nota: "CLR" no esta definido en la informacion proporcionada; se reproduce tal cual aparece en la model card. No se dispone de benchmarks comparativos con otros modelos de 3B.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, un modelo de 3B requiere aproximadamente 6-7 GB de VRAM; con cuantizacion Q4_K_M, alrededor de 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para la version bf16; para la version Q4_K_M basta con 4 GB o incluso CPU.
- Compatibilidad con GPU consumer: si, el modelo cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: transformers (Python), vLLM, llama.cpp, Ollama (gracias a los archivos GGUF proporcionados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de 3B en la informacion proporcionada. Los benchmarks publicados comparan a Mythos-nano con modelos de cientos de miles de millones de parametros, lo que no permite una comparativa directa con alternativas de su mismo tamano. Como referencia, el modelo base WeiboAI/VibeThinker-3B es su principal punto de partida, pero no se publican resultados separados del finetune. Se recomienda consultar benchmarks independientes para comparar con Qwen2.5-3B, Llama-3.2-3B u otros modelos de tamano similar.

## Limitaciones y advertencias

- No entrenado para tool-calling ni agentes: el autor desaconseja explicitamente su uso en function calling, orquestacion de APIs o agentes autonomos de codigo.
- Abliterado (uncensored): se ha eliminado la direccion de rechazo, por lo que el modelo no declinara peticiones que un modelo con ajuste de seguridad rechazaria. Los guardarrailes de seguridad estan reducidos; el uso es bajo responsabilidad del usuario y debe garantizarse el cumplimiento legal.
- Idioma limitado: solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Longitud de contexto no especificada: se desconoce la ventana de contexto maxima, aunque se recomiendan hasta 40960 tokens de salida para problemas dificiles, lo que sugiere una ventana amplia pero no confirmada.
- Riesgo de alucinacion: no se menciona explicitamente, pero al ser un modelo abliterado y sin ajuste de seguridad, puede generar contenido incorrecto o no verificado con mayor facilidad.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el usuario es responsable de los outputs y de su cumplimiento legal, especialmente dado el caracter "uncensored".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/squ11z1/Mythos-nano
- Modelo base: WeiboAI/VibeThinker-3B (https://huggingface.co/WeiboAI/VibeThinker-3B)
- No se proporcionan papers, blogs, repositorios adicionales ni demos en la informacion disponible.
