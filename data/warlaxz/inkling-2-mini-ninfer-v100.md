# WarlaxZ/Inkling-2-Mini-NInfer-V100

## Resumen

Inkling-2-Mini es un modelo de lenguaje multimodal desarrollado por Thinking Machines, construido como una mezcla de expertos (MoE) con una arquitectura poco convencional de capas repetidas ("looped MoE"). Con 26.200 millones de parametros totales y solo 3.400 millones activos por pasada de capa, el modelo procesa texto e imagenes mediante una torre de vision integrada. Esta ficha concreta, publicada por WarlaxZ, no es el modelo original: es una conversion del checkpoint cuantizado UD-Q8_K_XL de Unsloth al contenedor propietario `.ninfer` del motor de inferencia NInfer-3090, disenado especificamente para ejecutarse en una unica Tesla V100 de 32 GB o una RTX 3090 de 24 GB.

La relevancia de esta publicacion es practica: permite ejecutar un modelo multimodal de 26B en hardware de generacion Volta (sm_70) o Ampere (sm_86) sin re-cuantizar los pesos, incorporando el drafter especulativo DSpark del propio modelo y la torre de vision en un unico fichero de 23,9 GB. El autor reporta 94,3 tok/s con decodificacion especulativa sobre una V100 a 200 W y 2.727 tok/s de prefill a 8K, cifras que superan las de otros ports publicados para la misma GPU.

No obstante, conviene subrayar que este artefacto no es un checkpoint de Transformers ni un GGUF estandar: requiere los ejecutables de NInfer y esta pensado para un conjunto muy restringido de tarjetas. Para quien no tenga ese hardware o ese motor, el modelo base de Thinking Machines o los GGUF de Unsloth siguen siendo las vias recomendadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (looped MoE), sin RoPE, con atencion de residuos por profundidad |
| Parametros totales | 26.2B |
| Parametros activos | 3.4B por pasada de capa; 5.4B por token (las 12 capas centrales se ejecutan tres veces) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_K_XL (origen Unsloth UD-Q8_K_XL); expertos de capas 0-19 en NVFP4, capas 20-23 en BF16; drafter Q8_0; torre de vision BF16; KV cache INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario derivado de GGUF; no es safetensors, ni GGUF estandar, ni Transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 24 capas de decoder, de las cuales las capas 6 a 17 se ejecutan tres veces por token, sumando 48 visitas de capa. Cada visita mantiene su propio estado KV y de convolucion, controlado por un "loop controller" de rango 64, con residuos de atencion por profundidad sobre bloques de 6 capas. La dimension oculta es 2304 y el vocabulario de 200.058 tokens. No utiliza RoPE: en su lugar incorpora un sesgo de posicion relativa aprendido de extension 1024, junto con attention sinks por cabeza, clipping L2 de q, k y r, y convoluciones cortas de 4 taps.

El componente MoE consta de 128 expertos enrutados con top-8, enrutamiento sigmoide y SwiGLU con softcap. El modelo aplica un logit softcap de 30. La parte multimodal la aporta una torre de vision incluida en el mismo fichero. El entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no esta detallado en la informacion disponible; solo se documenta que el modelo se distribuye con su propio drafter especulativo DSpark, un block drafter de 3 capas con tamano de bloque 8, entrenado junto al modelo y que reutiliza sus embeddings y LM head.

La conversion realizada por WarlaxZ preserva los bytes originales sin re-cuantizar: los bloques GGML conservan sus bytes y los tensores BF16/FP32 sus palabras. Los expertos enrutados de cada capa se reorganizan en un banco de registros por experto, de modo que cada uno ocupa un rango contiguo de memoria. Segun el autor, la especulacion DSpark no altera la salida: la decodificacion greedy coincide con la greedy simple y el muestreo con la misma semilla produce los mismos tokens.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262.144 tokens.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text); no admite video.
- Razonamiento y matematicas, con mejor throughput reportado en tareas de matematicas (120,7 tok/s a 250 W frente a 94,3 tok/s en chats con imagenes).
- Decodificacion especulativa mediante el drafter DSpark integrado, con preservacion exacta de la salida.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el motor NInfer expone APIs compatibles con OpenAI y Anthropic, lo que permite su uso desde Claude Code, Codex, Cursor o Cline.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistencia conversacional con imagenes en local: el modelo puede mantener dialogos multi-turno adjuntando capturas o diagramas gracias a la torre de vision y a la ventana de 262.144 tokens, sin enviar datos a la nube.
- Analisis de documentos extensos con figuras: informes, papers o manuales tecnicos de cientos de paginas caben en el contexto, permitiendo preguntas cruzadas sobre texto y graficos en una sola sesion.
- Despliegue en estaciones de trabajo con GPU antigua: una Tesla V100 de 32 GB o una RTX 3090 de 24 GB bastan para servir el modelo a velocidades interactivas (94,3 tok/s con DSpark en V100), lo que lo hace util en entornos con hardware de segunda mano o servidores legacy.
- Automatizacion de codigo asistida por agente: a traves de las APIs compatibles con OpenAI y Anthropic del motor NInfer, herramientas como Cursor, Cline o Claude Code pueden apuntar a la GPU propia, manteniendo el codigo y los prompts dentro de la infraestructura local.
- Procesamiento por lotes de imagenes etiquetadas: clasificacion, descripcion o extraccion de informacion de catalogos de productos o imagenes medicas anonimizadas, aprovechando el prefill de 2.727 tok/s a 8K para throughput alto.
- Prototipado de investigación en MoE con capas repetidas: el modelo permite estudiar el comportamiento de arquitecturas looped MoE y de decodificacion especulativa exacta en hardware asequible, dado que el drafter no altera la distribucion de salida.
- Evaluacion comparativa de motores de inferencia: util para medir latencia y throughput de NInfer frente a llama.cpp u otros motores sobre el mismo modelo cuantizado, con la garantia de que los pesos no se han re-cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos aportados son de rendimiento del motor:

| Metrica | Valor reportado |
|---|---|
| Throughput de decodificacion (V100 32 GB, 200 W, DSpark, contexto completo 262.144 con imagenes y KV INT8) | 94,3 tok/s |
| Throughput de decodificacion (misma configuracion, sin drafter) | 78,0 tok/s |
| Throughput en matematicas (V100, 250 W, DSpark) | 120,7 tok/s |
| Prefill a 8K con `--prefill-chunk 8192` | 2.727 tok/s |
| Prefill a 8K con chunk por defecto | 2.170 tok/s |
| Prefill con DSpark e imagenes a contexto completo 262.144 | 2.125 tok/s |
| Port alternativo en V100 (Lapilli, sin drafter) | 69 tok/s decodificacion, 850 tok/s de lectura de prompt |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 23,9 GB; cabe en una Tesla V100 de 32 GB o una RTX 3090 de 24 GB con KV cache INT8 a contexto completo.
- GPU soportadas oficialmente: Tesla V100 32 GB (`sm_70`, Linux, compilado desde fuente) y RTX 3090 24 GB (`sm_86`).
- Cabe en GPU de consumo: si, en RTX 3090; no se documenta soporte para otras tarjetas consumer (3090 Ti, 4090, 5090) en la informacion disponible.
- Opciones de despliegue: exclusivamente el motor NInfer-3090 (C++/CUDA), con APIs compatibles con OpenAI y Anthropic. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 94,3 tok/s con DSpark y 78,0 sin drafter en V100 a 200 W; 2.727 tok/s de prefill a 8K con chunk de 8192.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (NInfer, esta ficha) | 26,2B totales / 3,4B activos por capa | 262.144 | Apache 2.0 | `.ninfer` / NInfer | V100 32 GB, RTX 3090 |
| Inkling-2-Mini (base, Thinking Machines) | 26,2B totales | 262.144 | Apache 2.0 | Checkpoint original | no disponible en detalle |
| Inkling-2-Mini UD-Q8_K_XL (Unsloth GGUF) | 26,2B totales | 262.144 | Apache 2.0 | GGUF / llama.cpp | Amplia, multiples GPUs |
| Port Lapilli para V100 (Csavoldi) | 26,2B totales | no disponible | Apache 2.0 | Lapilli | V100, sin drafter |

## Limitaciones y advertencias

- Dependencia total del motor NInfer: el artefacto no funciona con Transformers, llama.cpp, Ollama, vLLM ni TGI; requiere compilar o descargar binarios de NInfer-3090.
- Compatibilidad de hardware muy restringida: solo V100 32 GB y RTX 3090 estan soportadas y probadas; otras GPUs no estan documentadas.
- Idiomas soportados no declarados: no hay informacion sobre cobertura multilingue, por lo que el rendimiento fuera del ingles es incierto.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de sesgos; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas de vision o matematicas.
- Ausencia de benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, lo que impide comparar su calidad frente a alternativas.
- Sin soporte de video: solo acepta texto e imagenes.
- Licencia Apache 2.0 permite uso comercial, pero la cadena de dependencias (modelo base de Thinking Machines, cuantizacion de Unsloth, motor NInfer) debe verificarse por separado para produccion.
- El drafter DSpark preserva la salida segun el autor, pero las cifras de rendimiento dependen de la configuracion de chunk de prefill, la potencia de la GPU y el contexto; no son extrapolables a otros entornos sin medir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WarlaxZ/Inkling-2-Mini-NInfer-V100
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Model card oficial del modelo base: https://thinkingmachines.ai/model-card/inkling-2-mini/
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor NInfer-3090 (GitHub): https://github.com/ashalliants/ninfer-3090
- Guia de compilacion para V100: https://github.com/ashalliants/ninfer-3090/blob/master/docs/tesla-v100.md
- Releases de NInfer: https://github.com/ashalliants/ninfer-3090/releases/latest
- Issues de NInfer: https://github.com/ashalliants/ninfer-3090/issues
- Port alternativo Lapilli para V100 (informe de la comunidad): https://github.com/chris83-dev/lapilli-v100/blob/f9b7dd093a9ff018bc68f177f81a1d27d3ffec91/docs/community/inkling2-mini.md
