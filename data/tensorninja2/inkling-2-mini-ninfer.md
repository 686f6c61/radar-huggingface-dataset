# tensorninja2/Inkling-2-Mini-NInfer

## Resumen

Inkling 2 Mini es un modelo multimodal de tipo mixture-of-experts (MoE) con arquitectura "looped" desarrollado por Thinking Machines. El artefacto que nos ocupa, `tensorninja2/Inkling-2-Mini-NInfer`, no es un checkpoint en formato estándar, sino una conversión del modelo base al formato propietario `.ninfer` del motor de inferencia NInfer-4090, un runtime en C++/CUDA optimizado para ejecutar este modelo concreto en una única GPU RTX 4090. El repositorio contiene 18,80 GiB de pesos empaquetados byte a byte desde el checkpoint original, incluyendo el modelo de texto, el encoder de visión, el drafter DSpark y los ficheros de tokenizer y plantilla de chat.

La relevancia de esta publicación es fundamentalmente práctica: demuestra que un MoE multimodal de gran tamaño puede servirse en hardware de consumo (una RTX 4090 de 24 GB) gracias a una combinación de cuantización nativa (NVFP4 y MXFP8 en los expertos), atención de ventana deslizante en la mayoría de las capas y decodificación especulativa. El modelo base Inkling 2 Mini emplea 24 capas almacenadas que se recorren 48 veces por token, con routing a 8 de 128 expertos por capa, y un contexto nominal de 1.048.576 tokens (limitado a 262.144 por el kernel de atención relativa del motor).

El artefacto está pensado exclusivamente para NInfer: no es un checkpoint de Transformers, ni una distribución Safetensors, ni un fichero GGUF. Esto lo hace inútil fuera de ese ecosistema, pero a cambio ofrece tasas de prefill y decode muy altas para su tamaño en una sola GPU consumer, con soporte de tool calling, razonamiento por niveles y entrada de imágenes a resolución nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE "looped" (24 capas almacenadas, 48 visitas por token), multimodal (texto + visión) |
| Parametros totales | no disponible |
| Parametros activos | 8 de 128 expertos por capa (no se especifica el número absoluto de parámetros activos) |
| Longitud de contexto | 262.144 tokens en NInfer (el checkpoint declara 1.048.576; el kernel de atención relativa limita a 262.144) |
| Tipos de cuantizacion | Expertos NVFP4 (capas 0-19) y MXFP8 (capas 20-23); KV cache en BF16 o `rk4v4`; ejecución en tensor cores INT8 y FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario de NInfer, versión 2); no es Safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es un transformer MoE con una innovación estructural denominada "looped": almacena 24 capas físicas pero las recorre 48 veces por token, de modo que cada capa se visita dos veces. En cada visita, el router selecciona 8 de 128 expertos. Esta configuración reduce el número de parámetros almacenados mientras mantiene una profundidad computacional efectiva de 48 capas. La atención combina visitas de contexto completo (8 de las 48) con visitas de ventana deslizante limitadas a 1.024 claves (las otras 40), lo que explica que el decode se mantenga rápido incluso a 128K de contexto.

El artefacto `.ninfer` conserva los tensores del checkpoint sin calibrar, cuantizar, transponer, fusionar ni castear: mantiene los expertos NVFP4 originales en las capas 0-19 y los MXFP8 en las capas 20-23, y NInfer los ejecuta sobre los tensor cores INT8 y FP16 de la RTX 4090. Incluye además el drafter DSpark para decodificación especulativa (de 1 a 7 tokens de borrador, siendo 3 el óptimo en latencia para 1 y 3 peticiones concurrentes) y un encoder de visión con gestión dinámica de KV. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto con niveles de razonamiento configurables propios de Inkling ("reasoning levels").
- Entrada de imágenes y multi-imagen a resolución nativa; sin soporte de vídeo.
- Tool calling y function calling con los formatos nativos de Inkling, expuestos a través de OpenAI Chat Completions, OpenAI Responses y Anthropic Messages.
- Razonamiento multi-paso y uso como backend de agentes (el motor está diseñado para servir agentes de codificación como Caudra).
- Decodificación especulativa DSpark con 1 a 7 tokens de borrador (salida greedy idéntica con y sin drafter).
- Gestión de caché de prefijo y de sesión reutilizable entre turnos (cache breakpoints y session keys).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de codificación local: el modelo puede servir como backend de un agente tipo Caudra sobre una única RTX 4090, con tool calling nativo, reutilización de caché entre turnos y una tasa de decode de 190,9 tok/s con DSpark en prompts de código, suficiente para iteraciones interactivas sin depender de la nube.
- Análisis de documentos largos con imágenes: gracias al contexto de 262.144 tokens y a la entrada multi-imagen a resolución nativa, puede procesar contratos, informes o expedientes con figuras y tablas en una sola pasada, algo inviable en modelos de contexto corto.
- Asistencia técnica sobre repositorios completos: con 128K de contexto el decode se mantiene a 108,2 tok/s, lo que permite inyectar varios ficheros fuente y mantener conversaciones multi-turno sobre el código sin degradación apreciable de latencia.
- Automatización de atención al cliente con material visual: el pipeline `image-text-to-text` permite gestionar conversaciones donde el usuario adjunta capturas o fotos, manteniendo el historial largo en contexto y usando tool calling para consultar sistemas internos.
- Procesamiento batch de prefill masivo: con 5.699 tok/s de prefill a 4.096 tokens y 2.797 tok/s a 131.072 tokens, es adecuado para indexar, resumir o clasificar grandes volúmenes de texto e imágenes en pipelines offline sobre hardware de consumo.
- Prototipado de investigación en MoE multimodal: al ser un artefacto que preserva los cuantizados originales NVFP4/MXFP8, sirve para estudiar el comportamiento de modelos MoE de gran tamaño en GPUs consumer sin reentrenamiento ni recuantización.
- Servicio multi-stream ligero: con 257 tok/s agregados en 3 streams sin drafter y 336 tok/s con DSpark, puede atender a un pequeño equipo de desarrolladores con tres sesiones concurrentes en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos son de rendimiento del motor NInfer sobre una RTX 4090 a 480 W, con KV `rk4v4`, CUDA Graphs activados y chunks de prefill de 2.048 tokens:

| Carga de trabajo | Resultado |
|---|---:|
| Prefill, 4.096 tokens | 5.699 tok/s |
| Prefill, 32.768 tokens | 4.631 tok/s |
| Prefill, 131.072 tokens | 2.797 tok/s |
| Decode, contexto 4K, sin drafter | 130,7 tok/s (257 tok/s con 3 streams) |
| Decode, contexto 128K, sin drafter | 108,2 tok/s |
| Decode, código, greedy, DSpark con 3 draft tokens | 190,9 tok/s (336 tok/s con 3 streams) |

## Requisitos de hardware

- GPU: NVIDIA GeForce RTX 4090 (`sm_89`) exclusivamente; el motor NInfer-4090 no soporta otras arquitecturas según la información disponible.
- VRAM: el artefacto pesa 18,80 GiB, por lo que encaja en los 24 GB de la RTX 4090; el contexto completo de 262.144 tokens cabe con visión y KV `rk4v4`, y 190.208 tokens caben con visión y DSpark a 7 draft tokens.
- Sistema operativo: Linux de 64 bits.
- CUDA Toolkit 12.8 o superior.
- Despliegue: solo mediante NInfer-4090, compilado desde fuente o vía imagen Docker `ghcr.io/tensorninja/ninfer-4090:latest` (con `NINFER_FETCH=0` y montaje del artefacto).
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser Safetensors ni GGUF.
- Throughput y latencia: ver tabla de benchmarks; el decode se mantiene por encima de 100 tok/s incluso a 128K de contexto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de calidad ni especificaciones de modelos comparables de la misma categoría (MoE multimodal de tamaño similar), y el formato `.ninfer` es propietario, lo que impide una comparación directa de despliegue con alternativas en Safetensors o GGUF.

## Limitaciones y advertencias

- El artefacto funciona únicamente con NInfer-4090 sobre RTX 4090; no es portables a otros motores, GPUs ni formatos estándar.
- El contexto real está limitado a 262.144 tokens pese a que el checkpoint declara 1.048.576, por el límite del kernel de atención relativa.
- No hay soporte de vídeo; solo texto e imágenes.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación del modelo base.
- No se han publicado benchmarks de calidad, por lo que no es posible validar el rendimiento frente a alternativas sin evaluación propia.
- La licencia Apache 2.0 del artefacto se hereda del modelo base, pero conviene verificar las condiciones del checkpoint original de Thinking Machines antes de un uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validación comunitaria.
- El Docker oficial descarga por defecto Qwen3.8-27B; es necesario montar el artefacto y sobrescribir el comando para servirlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tensorninja2/Inkling-2-Mini-NInfer
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor NInfer-4090: https://github.com/tensorninja/ninfer-4090
- Documentación de rendimiento: https://github.com/tensorninja/ninfer-4090/blob/tensorninja/docs/performance.md#inkling2_mini
- Capacidad de contexto: https://github.com/tensorninja/ninfer-4090/blob/tensorninja/docs/performance.md#context-capacity
- Integración con Caudra: https://github.com/tensorninja/ninfer-4090#use-it-from-caudra
- Agente Caudra: https://caudra.ai
- Modelo auxiliar de decisiones: https://huggingface.co/tensorninja2/inkling-2-mini-decision-2
