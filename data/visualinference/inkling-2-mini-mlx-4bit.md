# VisualInference/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) con arquitectura "looped" desarrollado por Thinking Machines Lab, disenado para entrada de texto e imagen y salida de texto. Con 26.388.641.280 parametros totales, se posiciona como un modelo de razonamiento y agentes de gama media-alta, publicado bajo licencia Apache 2.0. Su innovacion principal reside en el bucle de capas y en un modo de razonamiento configurable mediante `reasoning_effort`.

Esta ficha describe la build cuantizada a 4 bits para Apple Silicon en formato mlx-vlm, publicada por VisualInference. El repositorio contiene 14,8 GiB de pesos y esta pensado para Macs con 32 GB de memoria unificada (24 GB es ajustado). La cuantizacion mantiene intactos los expertos originales en 4 bits y recuantiza las cuatro capas de expertos en 8 bits a 4 bits con compensacion de error; el resto de componentes permanece en 8 bits.

La relevancia de esta build es practica: permite ejecutar un modelo de 26,4B parametros con capacidades de vision, tool calling y razonamiento multi-paso en hardware de consumo Apple, con una perdida medible minima frente al checkpoint original (+0,002 nats por token, +0,2% de perplejidad) y una velocidad de decodificacion superior (31,1 tok/s frente a 25,9 tok/s).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con capas en bucle ("looped"), transformer multimodal texto-imagen |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han medido prompts de hasta 16k tokens) |
| Tipos de cuantizacion | 4 bits (expertos a 4,5 bits por peso; resto de componentes a 8 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato mlx-vlm), incluye drafter DSpark (`mtp.safetensors`) |

## Arquitectura y entrenamiento

Inkling 2 Mini emplea una arquitectura de mezcla de expertos con un esquema de capas en bucle (tag `inkling2_loop`), lo que implica que un subconjunto de capas se reutiliza iterativamente para profundizar el computo sin incrementar proporcionalmente el numero de parametros. El modelo acepta texto e imagenes como entrada y genera texto, con soporte nativo de tool calling y razonamiento estructurado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La build aqui descrita aplica cuantizacion GPTQ sobre el checkpoint original. Los expertos originales en NVFP4 y MXFP8 (5,1 bits por peso de media) se mantienen en 4 bits, mientras que las cuatro capas de expertos en 8 bits se recuantizan a 4 bits con compensacion de error, alcanzando 4,5 bits por peso de media. El resto de componentes (atencion, embeddings, etc.) permanece en 8 bits. El repositorio incluye el drafter DSpark para decodificacion especulativa, aunque las mediciones del autor indican que no supone una ganancia fiable en un M4 Pro.

## Capacidades

- Generacion de texto y razonamiento multi-paso con niveles de esfuerzo configurables (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`; por defecto `high`).
- Entrada de imagen: pipeline `image-text-to-text`, con soporte de `--image` en la CLI de mlx-vlm.
- Tool calling y function calling: el servidor OpenAI-compatible devuelve `tool_calls` con argumentos en JSON y `finish_reason: "tool_calls"` (requiere un parche para el parser de tool calls en mlx-vlm, incluido en el repositorio).
- Salida JSON estructurada (9/10 en el conjunto de prueba del autor).
- Ejecucion de tareas de agente multi-paso (4/4 en tareas de Hermes Agent).
- Generacion de codigo y matematicas (HumanEval 36/40, GSM8K 45/50 en la build de 4 bits).
- Capacidades conversacionales multi-turno.
- Modo de razonamiento con separacion entre `reasoning_content` y `content` en la respuesta.
- Multilingue: solo ingles declarado.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: el modelo genera funciones y resuelve problemas de programacion (HumanEval 36/40) con 31,1 tok/s de decodificacion en un M4 Pro, suficiente para un flujo de trabajo interactivo sin depender de la nube.
- Agente autonomo con tool calling en estaciones de trabajo Apple: mediante `mlx_vlm.server` se expone una API compatible con OpenAI que devuelve `tool_calls`, permitiendo integrar el modelo en bucles de agente que consultan APIs externas o ejecutan comandos, con `reasoning_effort` en `low` o `medium` para acelerar cada paso.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede extraer informacion de capturas, diagramas o formularios y devolver texto estructurado en JSON, util para pipelines de digitalizacion en local.
- Razonamiento matematico asistido: con GSM8K 45/50, es adecuado para tutoria o verificacion de calculos paso a paso, aprovechando el modo de razonamiento para mostrar el desarrollo antes de la respuesta final.
- Prototipado de agentes en memoria reducida: la build de 4 bits ocupa 15,5 GiB de pico con prompts cortos y 16,9 GiB con 16k tokens, lo que permite ejecutar agentes con contexto largo en Macs de 32 GB sin swap.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye builds de 2, 3 y 4 bits con metricas de perdida y tareas, lo que lo convierte en un banco de pruebas practico para estudiar el impacto de la cuantizacion en modelos MoE multimodales.
- Chat conversacional con contexto largo: soporta prompts de hasta 16k tokens medidos, adecuado para conversaciones multi-turno con historial extenso o documentos largos adjuntos.

## Benchmarks y rendimiento

Datos medidos por el autor en un Mac mini (M4 Pro, 48 GB) con decodificacion greedy (temperatura 0):

| Build | Pesos | Capas de expertos | Perdida retenida vs original | GSM8K | HumanEval |
|---|---|---|---|---|---|
| original (cargado tal cual) | 18,2 GiB | NVFP4 y MXFP8, 5,1 bits/peso | referencia (1,448 nats/token) | 48/50 | 35/40 |
| 4bit (este repo) | 14,8 GiB | 4,5 bits/peso | +0,002 ± 0,001 nats (+0,2% perplejidad) | 45/50 | 36/40 |
| 3bit | 11,9 GiB | 3,5 bits/peso | +0,014 ± 0,004 nats (+1,4% perplejidad) | 49/50 | 35/40 |
| 2bit | 9,1 GiB | 2,5 bits/peso | +0,095 ± 0,013 nats (+10,0% perplejidad) | 47/50 | 32/40 |

| Build | Tool calls | Salida JSON | Tareas Hermes Agent | Velocidad de decodificacion | Memoria pico: prompt corto / 4k / 16k |
|---|---|---|---|---|---|
| original | 18/19 | 9/10 | 4/4 | 25,9 tok/s | 20,3 / 21,4 / 22,1 GiB |
| 4bit (este repo) | 18/19 | 9/10 | 4/4 | 31,1 tok/s | 15,5 / 16,2 / 16,9 GiB |
| 3bit | 19/19 | 9/10 | 4/4 | 33,8 tok/s | 12,7 / 13,5 / 14,1 GiB |
| 2bit | 19/19 | 9/10 | 4/4 | 33,4 tok/s | 9,8 / 10,6 / 11,2 GiB |

El autor advierte que los conjuntos de tareas son pequenos y que diferencias de unos pocos problemas entre filas son ruido; la comparacion precisa es la perdida retenida. No se han publicado resultados de benchmarks estandar adicionales (MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria: 14,8 GiB de pesos; pico medido de 15,5 GiB con prompt corto, 16,2 GiB con 4k tokens y 16,9 GiB con 16k tokens.
- Mac recomendado: 32 GB de memoria unificada; 24 GB es ajustado.
- Hardware de referencia: Mac mini con M4 Pro y 48 GB (31,1 tok/s de decodificacion).
- No esta pensado para GPU NVIDIA/AMD: el formato es mlx-vlm, exclusivo de Apple Silicon. Para CUDA habria que usar el checkpoint original.
- Despliegue: CLI `mlx_vlm.generate` y servidor `mlx_vlm.server` (API compatible con OpenAI en `/v1/chat/completions`). Requiere mlx-vlm desde fuente (PR 2778, 2026-11-20) hasta que haya release con soporte de Inkling 2 Mini.
- Decodificacion especulativa: incluye el drafter DSpark (`mtp.safetensors`), pero el autor indica que no es una ganancia fiable en M4 Pro.
- Latencia: no disponible de forma desagregada; el throughput medido es de 31,1 tok/s en decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-4bit (este) | 26,4B (MoE) | no disponible (medido hasta 16k) | Apache 2.0 | mlx-vlm safetensors | 14,8 GiB, 31,1 tok/s en M4 Pro |
| Inkling-2-Mini-MLX-3bit | 26,4B (MoE) | no disponible | Apache 2.0 | mlx-vlm safetensors | 11,9 GiB, 33,8 tok/s, +1,4% perplejidad |
| Inkling-2-Mini-MLX-2bit | 26,4B (MoE) | no disponible | Apache 2.0 | mlx-vlm safetensors | 9,1 GiB, 33,4 tok/s, +10,0% perplejidad |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B (MoE) | no disponible | Apache 2.0 | safetensors (NVFP4/MXFP8) | 18,2 GiB, 25,9 tok/s en M4 Pro |

No se dispone de informacion sobre modelos de otros fabricantes comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- Exclusivo de Apple Silicon: el formato mlx-vlm no es portable a CUDA ni a CPU generica.
- Requiere instalar mlx-vlm desde fuente (PR 2778) hasta que exista una release con soporte; el servidor necesita ademas un parche para el parser de tool calls (`extras/mlx-vlm-inkling2-tool-calls.patch`), sin el cual las llamadas a herramientas se generan pero no se devuelven en la respuesta.
- El razonamiento consume `max_tokens`: con un limite bajo el modelo puede gastar todo el presupuesto en razonar y devolver una respuesta vacia. Se recomienda al menos 1.000 tokens por turno.
- `reasoning_effort: none` no desactiva completamente el razonamiento.
- El token de parada correcto es `<|content_model_end_sampling|>` (id 200006); `<|end_message|>` no debe usarse como stop string.
- La `generation_config.json` fija temperatura 1.0; los benchmarks del autor usan temperatura 0.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas de sesgo ni de tasas de alucinacion en la informacion disponible.
- Los conjuntos de evaluacion del autor son pequenos; las diferencias de pocos problemas entre builds no son estadisticamente significativas.
- La build de 4 bits pierde un 0,2% de perplejidad frente al original; para pesos de referencia con 32 GB o mas, el autor recomienda el checkpoint original.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no detalladas aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de 3 bits: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-3bit
- Build de 2 bits: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-2bit
- mlx-vlm (fork con soporte Inkling 2): https://github.com/Neywa-Labs/mlx-vlm
- Parche de tool calls: `extras/mlx-vlm-inkling2-tool-calls.patch` (incluido en el repositorio)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
