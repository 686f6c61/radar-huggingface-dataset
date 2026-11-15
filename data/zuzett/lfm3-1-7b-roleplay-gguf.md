# ZuzeTt/lfm3-1.7b-roleplay-GGUF

## Resumen

LFM3-1.7B-roleplay-GGUF es una coleccion de cuantizaciones GGUF del modelo LiquidAI/LFM3-1.7B con un adaptador LoRA de roleplay (version v2) fusionado en los pesos base. Lo publica el usuario ZuzeTt en Hugging Face y esta pensado para su uso directo con llama.cpp, sin necesidad de cargar el adaptador por separado con `--lora`. El modelo base es un transformer de 1.728.801.600 parametros desarrollado por Liquid AI bajo su familia LFM3, orientado a conversacion y despliegue en entornos con recursos limitados.

El objetivo del proyecto es ofrecer una variante especializada en interpretacion de personajes (roleplay) en formato conversacional, con un conjunto de cuantizaciones que van desde Q2_K (0,72 GB) hasta Q8_0 (1,9 GB), ademas de un LoRA en F16 de 4,7 MB aplicable sobre cualquier cuantizacion del modelo base. La cuantizacion K e IQ4_XS se ha generado con una importance matrix calculada sobre 2,9 MB de texto de calibracion de roleplay SFW (400 fragmentos de 512 tokens, perplejidad final de calibracion 12,99).

La relevancia actual reside en que permite ejecutar un modelo conversacional afinado para roleplay en GPUs de consumo de 4 GB o incluso menos, con un pipeline estandar de llama.cpp y una plantilla de chat ya embebida. El entrenamiento del adaptador fue filtrado para contenido SFW y el modelo no esta disenado para uso NSFW. La licencia del modelo base (LFM Open License v1.0) impone un umbral de facturacion anual de 10 millones de dolares para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B; incluye capas convolucionales hibridas, p. ej. `blk.2`) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible de forma explicita; los ejemplos de uso emplean `-c 4096` |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0, IQ4_XS (K e IQ4_XS con imatrix); LoRA F16 |
| Idiomas soportados | no disponibles (datos de entrenamiento del LoRA en ingles y ruso; chat general) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo por debajo de 10 M USD de facturacion anual |
| Formato de pesos | GGUF (llama.cpp); LoRA en GGUF F16 |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1,7 mil millones de parametros que, segun la model card, incorpora capas convolucionales hibridas (se menciona `blk.2` como capa conv que emite avisos durante la recoleccion de la importance matrix). Sobre ese modelo base se entreno un adaptador LoRA con rango r=16 durante 1 epoca, con aproximadamente 8 millones de tokens: 4 M de roleplay en ingles, 2 M de PIPPA en ruso y 2 M de chat general, todo filtrado para contenido SFW. El entrenamiento consto de 696 pasos y termino con una perdida de 1,61. El adaptador v2 se fusiono en los pesos base y el modelo fusionado se cuantizo a los formatos indicados.

La innovacion tecnica destacable es el uso de importance matrix para las cuantizaciones K e IQ4_XS, calculada sobre 2,9 MB de texto de calibracion de roleplay SFW (400 fragmentos de 512 tokens, perplejidad final 12,99). El cuantizador aplica `--imatrix` a todas las variantes K e IQ4_XS; para los tensores de las capas convolucionales hibridas recurre a estadisticas estandar porque la recoleccion de imatrix emite avisos en esas capas. El tokenizador y la plantilla de chat no se modificaron respecto al modelo base.

## Capacidades

- Generacion de texto conversacional con enfasis en interpretacion de personajes (roleplay) en primera persona.
- Mantenimiento de personajes y estilo mediante system prompt (por ejemplo, "You are Varek, a ruthless warlord. Stay in character. Write in first person.").
- Conversacion multi-turno con plantilla de chat embebida en llama.cpp (`llama-server`).
- Capacidades multilingues parciales: el adaptador se entreno con datos en ingles y ruso, ademas de chat general.
- Generacion de texto general y chat, heredadas del modelo base LFM3-1.7B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Ajuste de estilo: el autor documenta que anadir "write in first person" al system prompt corrige la deriva a tercera persona, y "do not prefix your reply with your name" evita el artefacto de prefijo con el nombre.

## Casos de uso

- Roleplay interactivo en local: el modelo puede encarnar personajes definidos en el system prompt y mantener el registro en primera persona, con cuantizaciones Q4_K_M que caben en una GPU de 4 GB. Es adecuado por su entrenamiento especifico en roleplay y su bajo coste de inferencia.
- Prototipado de chatbots de personaje: con `llama-server -m ... -ngl 99 -c 4096 --port 8080` se levanta un endpoint compatible con la API de chat en minutos, util para validar guiones y personalidades antes de invertir en modelos mayores.
- Narrativa asistida y escritura creativa: el modelo genera dialogos y escenas en primera persona; el autor documenta que el LoRA es mas conciso y mas en primera persona que el base, lo que encaja en borradores de ficcion conversacional.
- Evaluacion comparativa de tecnicas de cuantizacion: al incluir variantes Q2_K a Q8_0 con y sin imatrix, sirve para medir el impacto de la cuantizacion en calidad conversacional (el autor reporta perplejidad en Ultrachat de 9,79 en el base frente a 7,06 en el modelo afinado).
- Despliegue en hardware de gama baja: las variantes Q2_K (0,72 GB) y Q3_K_M (0,87 GB) permiten ejecutar el modelo en equipos con poca memoria, aunque el autor advierte perdida de calidad visible en Q2_K.
- Fine-tuning posterior con LoRA: el archivo `roleplay-lora-f16.gguf` (4,7 MB) puede aplicarse con `--lora` sobre cualquier cuantizacion del modelo base, lo que facilita experimentar con adaptadores adicionales sin re-cuantizar.
- Pruebas de integracion en llama.cpp: el repositorio incluye ejemplos de `llama-cli` y `llama-server` con parametros de muestreo (`--temp 0.8 --top-p 0.9`), utiles como base para pipelines de CI o scripts de evaluacion.

## Benchmarks y rendimiento

| Metrica | Base LFM3-1.7B | LFM3-1.7B-roleplay (LoRA v2) |
|---|---|---|
| Perplejidad en Ultrachat (held-out) | 9,79 | 7,06 |
| Tasa de rechazos en 8 prompts de roleplay | 0 % | 0 % |
| Perdida de entrenamiento | no disponible | 1,61 (696 pasos) |
| Perplejidad de calibracion de imatrix | no disponible | 12,99 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta la evaluacion cualitativa y de perplejidad anterior, ademas de una comparacion cualitativa en `COMPARISON.md`: el modelo base es mas coherente y atmosferico, mientras que el LoRA es mas conciso y mas orientado a primera persona.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~0,72 GB; Q3_K_M ~0,87 GB; IQ4_XS ~0,96 GB; Q4_0 y Q4_K_S ~1,0 GB; Q4_K_M ~1,1 GB; Q5_K_M ~1,2 GB; Q6_K ~1,4 GB; Q8_0 ~1,9 GB. A estas cifras hay que sumar el overhead de contexto KV y del runtime de llama.cpp.
- GPU recomendadas: el autor indica Q4_K_M-imatrix para GPU de 4 GB y Q5/Q6 para GPU de 8 GB o mas. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, desde 4 GB con Q4_K_M; Q2/Q3 solo si el tamano es critico.
- Opciones de despliegue: llama.cpp (`llama-server` y `llama-cli`), con plantilla de chat embebida y soporte de `--lora` para el adaptador F16. No se mencionan vLLM, TGI, Ollama ni otros runtimes en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-roleplay (este) | 1,73 B | no disponible (ejemplos a 4096) | LFM Open License v1.0 (comercial < 10 M USD) | GGUF | LoRA de roleplay fusionado, imatrix, 9 cuantizaciones |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | LFM Open License v1.0 | safetensors (repo base) | Modelo original sin adaptador; mas coherente y atmosferico segun el autor |
| Adaptador `roleplay-lora-f16.gguf` | 4,7 MB (LoRA) | no aplica | LFM Open License v1.0 | GGUF F16 | Se aplica con `--lora` sobre cualquier cuantizacion del base |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria (por ejemplo, otras variantes de 1-2 B orientadas a roleplay) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; el entrenamiento uso datos de roleplay en ingles, PIPPA en ruso y chat general, lo que puede sesgar el estilo y el registro.
- Riesgo de alucinacion: inherente a un modelo de 1,7 B; no se han publicado evaluaciones de factualidad.
- Deriva de persona: el autor advierte que el modelo puede pasar a tercera persona y recomienda anadir "write in first person" al system prompt; tambien puede prefijar las respuestas con el nombre del personaje, lo que se corrige con "do not prefix your reply with your name".
- Limitaciones de contexto e idioma: la longitud de contexto no se documenta; los ejemplos usan 4096 tokens. El soporte multilingue se limita a lo entrenado (ingles y ruso) y no hay evaluacion por idioma.
- Contenido: el entrenamiento fue filtrado para SFW y el autor indica explicitamente que no es un modelo NSFW.
- Licencia: LFM Open License v1.0 permite uso comercial solo a entidades con facturacion anual inferior a 10 millones de dolares; por encima se requiere licencia separada de Liquid AI.
- Obligaciones de datos: el adaptador es una obra derivada transformativa y el uso posterior de los pesos puede conllevar obligaciones especificas de los datasets de entrenamiento (`Gryphe/Sonnet3.5-Charcard-Roleplay` sin licencia declarada por el uploader, `IlyaGusev/pippa_ru` Apache-2.0, `HuggingFaceH4/ultrachat_200k` publico).
- Calidad de cuantizacion: Q2_K presenta perdida de calidad visible segun el autor; las capas convolucionales hibridas usan estadisticas estandar en lugar de imatrix, lo que puede afectar a su comportamiento en las variantes cuantizadas.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni evaluacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ZuzeTt/lfm3-1.7b-roleplay-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset PIPPA en ruso: https://huggingface.co/datasets/IlyaGusev/pippa_ru
- Dataset Ultrachat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Documento de comparacion del autor: `COMPARISON.md` (referenciado en la model card del repositorio)
- Texto de licencia: `LICENSE` (incluido en el repositorio)
