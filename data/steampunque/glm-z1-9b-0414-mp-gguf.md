# steampunque/GLM-Z1-9B-0414-MP-GGUF

## Resumen

Esta ficha describe `steampunque/GLM-Z1-9B-0414-MP-GGUF`, una cuantización GGUF del modelo de razonamiento `THUDM/GLM-Z1-9B-0414` (Zhipu AI / Z.ai), publicada por el usuario steampunque. No se trata de un modelo nuevo, sino de una receta de cuantización de precisión mixta por capas (`Q4_E_H`) aplicada sobre los pesos originales en safetensors. El modelo resultante ocupa un único archivo GGUF de 6,2 GB, un tamano equivalente al de una cuantización `Q4_K_M` estándar (misma cifra de 6,2e9 bytes), por lo que está pensado para ejecución en GPU de consumo.

El interés técnico de esta publicación está en su enfoque de cuantización híbrida: en lugar de aplicar un único tipo de quant a todas las capas, asigna niveles distintos (Q4_K, Q5_K y Q6_K) capa por capa, mantiene el embedding de tokens y la capa de salida en Q6_K y permite forzar los tensores de atención (QKV) en F16 durante la inferencia. Según el autor, esta configuración se optimizó sobre un conjunto de prompts de razonamiento y sacrifica muy poco en perplejidad (15,2 frente a 14,9 de un `Q4_K_M` convencional) a cambio de una mayor velocidad de generación cuando se combina con decodificación especulativa.

El modelo base es un transformer denso de 9.463.193.600 parámetros y aproximadamente 9,46 mil millones de parámetros efectivos, entrenado con RL y con modo de pensamiento. La cuantización se distribuye bajo licencia MIT y está etiquetada como compatible con endpoints conversacionales. El autor advierte de forma explícita de que el modelo es "extremadamente débil" en generación de código, por lo que su nicho real es el razonamiento matemático y analítico, no la programación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base GLM-Z1-9B-0414 de Zhipu AI / Z.ai); dimensión intermedia de FFN 13.696, ampliada a 13.824 en esta cuantización |
| Parametros totales | 9.463.193.600 (9,46 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la model card de la cuantización; las pruebas de rendimiento del autor se ejecutan con 32k tokens de contexto |
| Tipos de cuantizacion | GGUF híbrida por capas `Q4_E_H`: mezcla de Q4_K, Q5_K y Q6_K según capa, embedding de tokens en Q6_K, tensor de salida en Q6_K y opción de QKV en F16 en inferencia |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único `GLM-Z1-9B-0414.Q4_E_H.gguf`) |
| Tamano del archivo principal | 6,2e9 bytes (6,2 GB) |
| Tamano del repositorio | 26,5 GB |
| Perplejidad declarada | 15,2 (frente a 14,9 de un Q4_K_M del mismo modelo) |
| Modo de pensamiento | Si; el autor lo describe como "RL trained thinking model" |
| Descargas / likes | 83 descargas, 2 likes |
| Fechas | Creado el 21-07-2025; actualizado el 12-10-2026 |

## Arquitectura y entrenamiento

La cuantización se aplica sobre `THUDM/GLM-Z1-9B-0414`, un transformer denso decoder-only de la familia GLM-4. La model card de esta publicación no detalla la arquitectura interna del modelo base (número de capas, cabezas de atención, tipo de positional encoding ni composición del dataset de entrenamiento); esa información corresponde al repositorio original de THUDM. Lo que sí aporta el autor es el mapa de capas usado para la cuantización, que abarca 40 capas (índices 0 a 39) y permite deducir la estructura de bloques: atención (`attn_q`, `attn_k`, `attn_v`, `attn_o`) y bloque feed-forward (`ffn`, `ffn_g`, `ffn_u`, `ffn_d`).

El elemento diferencial es la estrategia de precisión mixta. Las capas 0 y 39 se mantienen en Q6_K; las capas 1, 8, 16 y 24 en Q5_K; y el grueso central en Q4_K, con variantes de los subbloques `Q4_K_654`, `Q4_K_665`, `Q5_K_554`, `Q5_K_666` o `Q6_K_886` según la posición. La dimensión de las FFN se rellena (*padding*) hasta un múltiplo de 256, pasando de 13.696 a 13.824, con el objetivo de poder usar cuantizaciones K en esos tensores. El embedding de tokens y el tensor de salida se fijan en Q6_K mediante los flags `--token-embedding-type Q6_K` y `--output-tensor-type Q6_K`. El autor indica que los niveles de cuantización se optimizaron empíricamente sobre un conjunto curado de prompts de razonamiento, con Q4_K como mínimo, para minimizar la pérdida de entropía.

En cuanto al entrenamiento del modelo base, la única referencia disponible en esta información es que se trata de un modelo entrenado con RL (*reinforcement learning*) y orientado a razonamiento. No se dispone del número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de alineamiento (RLHF, DPO u otros). El autor menciona además que la cuantización puede combinarse con decodificación especulativa usando Qwen3 0.6B como modelo borrador, siempre que el motor de inferencia soporte traducción dinámica de vocabulario entre borrador y objetivo.

## Capacidades

- Generación de texto conversacional en formato de diálogo (etiqueta `conversational` en el repositorio).
- Razonamiento paso a paso en modo de pensamiento, derivado de su entrenamiento con RL.
- Razonamiento matemático: el autor publica un espacio de benchmarks específicamente orientado a matemáticas.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`), lo que facilita su integración en servicios de inferencia que aceptan GGUF o modelos equivalentes.
- Decodificación especulativa: puede acelerarse con un modelo borrador (Qwen3 0.6B) si el motor soporta traducción dinámica de vocabulario, con una mejora medida de 68 a 101 tokens por segundo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no se documenta en la model card; no disponible.
- Visión, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.
- Generación de código: capacidad presente de forma residual, pero el propio autor la califica como "extremadamente débil".

## Casos de uso

- Razonamiento matemático asistido en local: el modelo está optimizado para cadenas de razonamiento y el autor mantiene un espacio de evaluación centrado en matemáticas, lo que lo hace adecuado para resolver problemas algebraicos, verificación de resultados y explicación de pasos intermedios en un portátil con GPU de gama media.
- Asistente conversacional offline en estación de trabajo: con 6,2 GB de pesos y ejecución completa en una GPU de 12 GB, se puede desplegar un chatbot de uso interno sin conexión a servicios cloud, útil en entornos con restricciones de confidencialidad de datos.
- Servicio de baja latencia con decodificación especulativa: combinando el archivo Q4_E_H con Qwen3 0.6B como borrador en llama.cpp se alcanzan 101 tokens por segundo en una RTX 4070, cifra suficiente para interfaces de chat interactivas con respuesta casi instantánea.
- Generación de cadenas de pensamiento para anotación de datos: el modelo puede producir justificaciones razonadas paso a paso que después se filtran y revisan para construir datasets de entrenamiento de modelos más pequeños.
- Evaluación comparativa de técnicas de cuantización: la receta Q4_E_H y sus parámetros (padding de FFN, tipos por capa, QKV en F16) sirven como caso de estudio reproducible para investigadores que comparan cuantización uniforme frente a cuantización híbrida.
- Despliegue en productos comerciales con licencia permisiva: al distribuirse bajo MIT, la cuantización puede integrarse en productos propietarios sin obligación de apertura del código, siempre que se verifiquen también las condiciones del modelo base.
- Prototipado rápido de agentes de razonamiento: el formato GGUF permite cargar el modelo en llama.cpp, Ollama o LM Studio sin infraestructura de GPU dedicada, reduciendo el coste de experimentación.
- Caso de uso no recomendado: generación de código en producción. El autor advierte explícitamente de un rendimiento muy pobre en tareas de programación, por lo que no debería usarse para autocompletado, refactorización o revisión de código.

## Benchmarks y rendimiento

Los únicos datos cuantitativos aportados por el autor son de perplejidad y de velocidad de generación. El autor enlaza un espacio de benchmarks matemáticos, pero no se incluyen resultados numéricos en la información disponible.

| Metrica | Q4_K_M de referencia | Q4_E_H (esta publicacion) |
|---|---|---|
| Tamano del archivo | 6,2e9 bytes | 6,2e9 bytes |
| Perplejidad (PPL) | 14,9 | 15,2 |

| Configuracion de inferencia | QKV | Borrador | Contexto | Tokens por segundo |
|---|---|---|---|---|
| Q4_E_H, sin decodificacion especulativa | F16 | 0 | 32k | 68 |
| Q4_E_H, decodificacion especulativa | F16 | 4 | 32k | 101 |

Medición realizada en una RTX 4070 con 12 GB de VRAM, con todas las capas y el contexto residentes en GPU. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos pesa 6,2 GB. El autor ejecuta el modelo con todas las capas y 32k tokens de contexto dentro de una GPU de 12 GB, por lo que el consumo total (pesos más caché KV) queda por debajo de ese umbral.
- GPU recomendadas: RTX 4070 (12 GB) verificada por el autor como configuración de referencia. Cualquier GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100) puede alojar el modelo completo.
- GPU de consumo: sí, cabe en GPUs de gama media-alta con 12 GB. En tarjetas de 8 GB es previsible que requiera offload parcial de capas a CPU, con la consiguiente pérdida de velocidad (estimación no verificada en la información disponible).
- Opciones de despliegue: llama.cpp es el motor de referencia citado por el autor. Al ser un GGUF estándar, también es compatible con motores que consumen este formato (Ollama, LM Studio, koboldcpp). Para vLLM o TGI sería necesario partir de los pesos originales en safetensors, no de este archivo GGUF.
- Decodificación especulativa: requiere un motor que soporte traducción dinámica de vocabulario entre modelo borrador y modelo objetivo; el autor propone Qwen3 0.6B como borrador.
- Latencia y throughput: 68 tokens por segundo sin borrador y 101 tokens por segundo con 4 tokens de borrador, en RTX 4070 con 32k de contexto y todas las capas en GPU.
- Compatibilidad de versión: la receta de cuantización fue actualizada el 12-10-2026, por lo que conviene usar una versión de llama.cpp reciente que reconozca el mapa de capas actual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| steampunque/GLM-Z1-9B-0414-MP-GGUF (Q4_E_H) | 9,46B | No disponible en la ficha; probado a 32k | GGUF | MIT | PPL 15,2; 101 tps con decodificación especulativa en RTX 4070 |
| THUDM/GLM-Z1-9B-0414 (modelo base) | 9,46B | No disponible en la información proporcionada | Safetensors | No disponible en la información proporcionada | Precisión completa; requiere más VRAM que la versión GGUF |
| Cuantización Q4_K_M equivalente del mismo modelo | 9,46B | No disponible | GGUF | MIT (según metadatos del repositorio) | PPL 14,9; tamaño idéntico de 6,2e9 bytes |
| Qwen3 0.6B | 0,6B | No disponible | GGUF | No disponible en la información proporcionada | Usado únicamente como modelo borrador para decodificación especulativa, no como alternativa |

No se dispone de datos de benchmarks comparativos frente a otros modelos de razonamiento de tamaño similar (por ejemplo, destilaciones de DeepSeek-R1 en la franja de 7-9B) en la información proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Rendimiento en código: el autor afirma de forma explícita que el modelo es "extremadamente débil" en problemas de generación de código. No debe usarse en tareas de programación sin una validación previa muy estricta.
- Perplejidad ligeramente superior: 15,2 frente a 14,9 de un Q4_K_M convencional, un incremento del 2 % aproximadamente. La receta híbrida no mejora la perplejidad, sino la velocidad en configuraciones con decodificación especulativa.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad, veracidad ni tasas de alucinación en la información disponible. Al ser un modelo de razonamiento con modo de pensamiento, puede generar cadenas de razonamiento plausibles pero incorrectas.
- Idiomas: no se declara ningún conjunto de idiomas soportados. No hay garantía de calidad fuera del inglés, y en particular no hay evidencia de un buen rendimiento en castellano.
- Contexto: la model card no especifica la longitud máxima de contexto del modelo base. Las pruebas usan 32k tokens, pero no se confirma que ese sea el límite real ni cómo degrada la calidad al acercarse a él.
- Licencia: la cuantización se distribuye bajo MIT, lo que en principio permite uso comercial. Aun así, conviene verificar la licencia del modelo base `THUDM/GLM-Z1-9B-0414` antes de un despliegue comercial, ya que la información proporcionada no la detalla.
- Receta dependiente de la versión: el mapa de cuantización por capas se actualizó el 12-10-2026. Versiones antiguas de llama.cpp pueden no interpretar correctamente los tensores o el padding de las FFN.
- Repositorio de 26,5 GB: aunque el archivo principal pesa 6,2 GB, el repositorio completo ocupa 26,5 GB. Conviene descargar únicamente el archivo `.gguf` necesario.
- Validación comunitaria baja: 83 descargas y 2 likes en el momento de redactar esta ficha. No existe un volumen amplio de reportes independientes que confirmen el comportamiento declarado.
- Información incompleta sobre el modelo base: la model card de esta cuantización no documenta la composición del dataset, el proceso de alineamiento ni el número de tokens de entrenamiento del modelo original.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/steampunque/GLM-Z1-9B-0414-MP-GGUF
- Archivo GGUF directo: https://huggingface.co/steampunque/GLM-Z1-9B-0414-MP-GGUF/resolve/main/GLM-Z1-9B-0414.Q4_E_H.gguf
- Modelo base (THUDM): https://huggingface.co/THUDM/GLM-Z1-9B-0414
- Modelo base (zai-org): https://huggingface.co/zai-org/GLM-Z1-9B-0414
- Benchmarks de matemáticas del autor: https://huggingface.co/spaces/steampunque/benchlm
- Hilo de discusión sobre cuantización híbrida por capas en llama.cpp: https://github.com/ggml-org/llama.cpp/discussions/13040
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenido no relacionado con la ficha.
