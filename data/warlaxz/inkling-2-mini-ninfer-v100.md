# WarlaxZ/Inkling-2-Mini-NInfer-V100

## Resumen

Inkling-2-Mini-NInfer-V100 es un artefacto de inferencia que empaqueta el modelo multimodal Inkling-2-Mini de Thinking Machines en el contenedor propietario `.ninfer` del motor NInfer-3090. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión byte a byte del GGUF cuantizado UD-Q8_K_XL de Unsloth, junto con el drafter especulativo DSpark y la torre de visión del modelo original, todo en un único fichero de 23,9 GB. El autor del artefacto es el usuario de Hugging Face WarlaxZ, y el motor que lo ejecuta se mantiene en el repositorio ashalliants/ninfer-3090.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con 26,2 mil millones de parámetros totales y 3,4 mil millones activos por token, pensado para conversación multimodal (texto e imagen) y con decodificación especulativa integrada. Su interés radica en que permite ejecutar un MoE multimodal de este tamaño en una única GPU Tesla V100 de 32 GB mediante un motor C++/CUDA específico, algo que con las pilas de inferencia convencionales requeriría más memoria o cuantizaciones más agresivas.

La relevancia es, por tanto, operativa: demuestra una ruta de despliegue de bajo nivel para hardware de centro de datos antiguo (sm_70) y ofrece APIs compatibles con OpenAI y Anthropic, lo que facilita conectar herramientas como Claude Code, Cursor o Cline a una GPU propia. El artefacto se publicó el 21 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas en bucle (looped MoE), sin RoPE, con sesgo posicional relativo aprendido y attention sinks por cabeza |
| Parametros totales | 26,2 B |
| Parametros activos | 3,4 B por token |
| Longitud de contexto | no disponible (el sesgo posicional aprendido tiene una extensión de 1024; el contexto efectivo no se especifica en la información disponible) |
| Tipos de cuantizacion | Pesos derivados de GGUF UD-Q8_K_XL: expertos de capas 0-19 en NVFP4, capas 20-23 en BF16; drafter DSpark en Q8_0 con cabeza Markov en BF16; torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario del motor NInfer; no es Safetensors ni GGUF, aunque se deriva de GGUF sin recuantizar) |

Otros datos técnicos: tamaño oculto 2304, vocabulario de 200.058 tokens, 24 capas de decodificador (las capas 6-17 se ejecutan tres veces por token, 48 visitas de capa en total), 128 expertos enrutados con top-8 y enrutamiento sigmoide, SwiGLU con softcap, logit softcap de 30, convoluciones cortas de 4 taps y controlador de bucle de rango 64. El artefacto ocupa 23.914.098.432 bytes y contiene 1.194 objetos (1.190 tensores verificados byte a byte contra los tres GGUF de origen).

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con una innovación estructural poco habitual: las capas 6 a 17 se recorren tres veces por token, de modo que hay 48 visitas de capa efectivas sobre 24 capas físicas. Cada visita mantiene su propio estado KV y de convolución, y un controlador de bucle de rango 64 modula el paso de información entre iteraciones, con residuales de atención de profundidad sobre bloques de 6 capas. El modelo prescinde de RoPE y utiliza un sesgo de posición relativa aprendido con extensión 1024, junto con attention sinks por cabeza, normalización L2 con recorte en q, k y r, y convoluciones cortas de 4 taps.

El enrutamiento usa 128 expertos con top-8 y activación sigmoide, con SwiGLU softcapped. En el artefacto, los expertos de las capas 0-19 se almacenan en NVFP4 y los de las capas 20-23 en BF16, replicando exactamente la distribución del GGUF UD-Q8_K_XL de Unsloth. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La decodificación especulativa se cubre con DSpark, un drafter de bloques de 3 capas y tamaño de bloque 8, entrenado junto al modelo y que reutiliza los embeddings y la cabeza LM del modelo objetivo.

La conversión a `.ninfer` no recuantiza: los bloques GGML conservan sus bytes, BF16 y FP32 conservan sus palabras, y cada experto enrutado se agrupa en un banco de registros contiguos (`ggml_rec_nvfp4_nvfp4` en las capas NVFP4). El tokenizador y la plantilla de chat provienen del GGUF y se verificaron token a token.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat incluida en el artefacto.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`); no admite vídeo.
- Razonamiento y respuesta abierta sobre el modelo base Inkling-2-Mini.
- Decodificación especulativa integrada mediante el drafter DSpark (bloque 8), que acelera la generación sin cambiar la distribución del modelo objetivo.
- Enrutamiento MoE con 128 expertos y top-8, lo que permite activar solo 3,4 B de parámetros por token.
- Servido a través de APIs compatibles con OpenAI y Anthropic en el motor NInfer, lo que habilita el uso con clientes como Claude Code, Codex, Cursor o Cline.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada (el motor expone APIs compatibles, pero no se documenta explícitamente el soporte de function calling en esta ficha).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional autoalojado en una V100: el modelo puede atender diálogos multi-turno con entrada de imágenes en una única Tesla V100 de 32 GB, lo que permite desplegar un asistente multimodal en infraestructura de centro de datos ya amortizada sin depender de APIs externas.
- Automatización de agentes de código en local: al exponer una API compatible con OpenAI y Anthropic, se puede apuntar Claude Code, Cursor o Cline contra la GPU propia; el modelo actúa como backend de un agente de programación con contexto conversacional.
- Análisis de documentos con imágenes: la torre de visión `inkling2v` permite procesar capturas, diagramas o formularios escaneados junto a texto en el mismo prompt, útil para extracción de datos y resúmenes de documentación técnica.
- Prototipado de investigación sobre MoE con capas en bucle: el artefacto conserva la estructura exacta del modelo (48 visitas de capa, controlador de rango 64), lo que lo hace adecuado para estudiar el comportamiento de arquitecturas looped MoE en inferencia real.
- Evaluación de decodificación especulativa: al incluir DSpark en el mismo fichero, sirve para medir el impacto del drafter de bloques 8 sobre el throughput en sm_70 sin montar un pipeline separado.
- Despliegue de bajo nivel en hardware antiguo: equipos con V100 que no pueden usar pilas modernas basadas en FlashAttention 3 encuentran aquí una vía de ejecución de un MoE de 26 B con APIs estándar.
- Servicio interno de chat con imágenes para equipos pequeños: la licencia Apache 2.0 y el formato de un solo fichero simplifican la distribución interna del artefacto entre máquinas con V100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no reporta cifras de MMLU, HumanEval, GSM8K ni métricas multimodales para este artefacto. Tampoco se documentan tasas de tokens por segundo específicas para Inkling-2-Mini en la V100; el README del motor cita 140 tok/s para Qwen3.8-27B en una RTX 3090 y el servicio de Qwen3.8-Flash-Next con 262K de contexto en una V100, pero no ofrece cifras para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: el fichero `.ninfer` ocupa 23,9 GB y se lee una sola vez al cargar; el modelo está diseñado para caber en una Tesla V100 de 32 GB, lo que deja margen para estados KV y de convolución de las 48 visitas de capa.
- GPU soportadas: Tesla V100 32 GB (sm_70) es el objetivo de este artefacto; el motor NInfer-3090 también está ajustado para RTX 3090. No se documenta soporte para A100, H100 ni otras tarjetas en la información disponible.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB o menos según el tamaño del artefacto; no se confirma compatibilidad con RTX 4090.
- Sistema operativo: Linux, con el motor compilado desde fuente según la guía `docs/tesla-v100.md` del repositorio.
- Opciones de despliegue: exclusivamente el motor NInfer-3090 (C++/CUDA). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` no es GGUF ni Safetensors. El motor ofrece APIs compatibles con OpenAI y Anthropic.
- Latencia y throughput: no disponible para este modelo. La decodificación especulativa con DSpark está pensada para reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-NInfer-V100 | 26,2 B | 3,4 B | no disponible | Apache 2.0 | `.ninfer` / NInfer-3090 | Hugging Face, 0 descargas |
| Inkling-2-Mini (base, Thinking Machines) | 26,2 B | 3,4 B | no disponible | no disponible en la información | no disponible | Model card en thinkingmachines.ai |
| Inkling-2-Mini UD-Q8_K_XL (Unsloth) | 26,2 B | 3,4 B | no disponible | no disponible en la información | GGUF | Hugging Face (unsloth/Inkling-2-Mini-GGUF) |
| Qwen3.8-27B (citado por el motor) | 27 B aprox. | no disponible | no disponible | no disponible | servido por NInfer | citado en el README del motor |

La comparación relevante es entre el artefacto y sus fuentes: el GGUF de Unsloth y el modelo original de Thinking Machines. El artefacto no cambia los pesos, solo el contenedor, por lo que su calidad de salida debería coincidir con la del GGUF de origen; la diferencia está en el motor y en el soporte de V100. No se dispone de datos de rendimiento comparado con alternativas de la misma categoría.

## Limitaciones y advertencias

- El artefacto solo funciona con el motor NInfer-3090; no es un checkpoint de Transformers ni un GGUF estándar, y no se puede cargar con vLLM, llama.cpp, Ollama ni TGI.
- Requiere compilar el motor desde fuente en Linux para V100; no hay binarios precompilados de V100 en la información disponible (los releases citados son para RTX 3090 en Windows y Linux).
- El contexto efectivo no está documentado; el sesgo posicional aprendido tiene extensión 1024, lo que puede limitar secuencias largas si no se aplican técnicas de extensión no descritas.
- No se documentan los idiomas soportados ni evaluaciones multilingües.
- No hay datos de benchmarks ni de tasas de tokens por segundo para este modelo, lo que impide estimar su calidad frente a alternativas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser una conversión del modelo base, hereda los del original sin que se documenten mitigaciones.
- El modelo no acepta vídeo, solo texto e imagen.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del GGUF de Unsloth antes de un uso comercial, ya que la información disponible no detalla las licencias de esas fuentes.
- El artefacto tiene 0 descargas y 0 valoraciones, por lo que no hay evidencia comunitaria de funcionamiento en producción.
- La verificación byte a byte de los 1.190 tensores la realizó un checker independiente según el autor; no se aportan resultados de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/WarlaxZ/Inkling-2-Mini-NInfer-V100
- Modelo base: https://thinkingmachines.ai/model-card/inkling-2-mini/
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor NInfer-3090 (GitHub): https://github.com/ashalliants/ninfer-3090
- Guía de compilación para V100: https://github.com/ashalliants/ninfer-3090/blob/master/docs/tesla-v100.md
- Releases del motor: https://github.com/ashalliants/ninfer-3090/releases/latest
- Issues del motor: https://github.com/ashalliants/ninfer-3090/issues
