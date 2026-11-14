# Xylolabs/Ling-3.0-tiny-Tenstorrent-Tensix-BFP4

## Resumen

Ling-3.0-tiny-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo inclusionAI/Ling-3.0-tiny, publicada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una conversión de los pesos lineales del modelo base a formato block-floating-point de 4 bits (`ttnn.bfloat4_b`, BFP4) mediante GPTQ, empaquetados de forma que TT-NN pueda leerlos directamente en memoria de dispositivo. El checkpoint conserva la arquitectura original `bailing_hybrid` con código personalizado y requiere `trust_remote_code=True`.

El modelo base es un transformer híbrido de 7.893.392.800 parámetros (aproximadamente 7,9 mil millones) con atención multi-cabeza latente (MLA) y componentes de atención lineal tipo KDA, además de una capa MLP con expertos enrutados y compartidos (estructura tipo MoE). La cuantización reduce el peso del modelo a 4,79 GB empaquetados, con una media de 4,86 bits por peso, lo que lo hace viable en el DRAM de un único dispositivo Tensix.

La relevancia de esta ficha es doble: por un lado, documenta el primer (o uno de los pocos) exports públicos de un modelo Ling-3.0 en formato BFP4 para hardware Tenstorrent; por otro, advierte de que el repositorio solo valida el empaquetado de pesos con TT-NN, no la inferencia completa. No se han publicado resultados de benchmarks ni se ha ejecutado con tt-transformers o tt-forge, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailing_hybrid` (transformer híbrido con MLA y atención lineal KDA; MLP con expertos enrutados y compartidos) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales, GPTQ con búsqueda de exponente por bloque (offsets -1 y 0, damping 0,1); media de 4,86 bits por peso; tensores no cuantizados en bf16 y excepciones en float32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`); requiere código personalizado de Transformers |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `inclusionAI/Ling-3.0-tiny`, etiquetada como `bailing_hybrid`. Según la model card, incluye proyecciones de atención MLA (`attention.q_b_proj`, `attention.kv_a_proj_with_mqa`), componentes de atención lineal KDA, una MLP densa y una MLP con expertos enrutados y compartidos (gate/up/down), además de un LM head. No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica de esta exportación es la cuantización a BFP4 con GPTQ y empaquetado bit a bit para TT-NN. De las 9.067 matrices cuantizadas, 9.055 pasan la verificación de rejilla BFP4 sin cambios; las 12 restantes (`q_b_proj` y `kv_a_proj_with_mqa` en las capas 3, 7, 11, 15, 19 y 23) requieren una permutación de filas (pares par/impar en el sufijo rotatorio) para alinearse con la rejilla. Los ficheros conservan el orden de Hugging Face, por lo que la implementación de inferencia debe ordenar sus pares rotatorios de forma consistente con este empaquetado. La verificación se realizó con ttnn 0.81.1 sobre el simulador Blackhole (ttsim); no se ejecutó inferencia real ni se probó con tt-transformers o tt-forge.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la model card incluye un ejemplo de chat con plantilla de mensajes.
- Razonamiento y código: no se documentan capacidades específicas en la información disponible; se heredan las del modelo base, sin verificación en este export.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución en hardware Tenstorrent: los pesos están empaquetados para TT-NN en Wormhole y Blackhole, con verificación de empaquetado bit a bit.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal es ejecutar el modelo en una NPU Tensix (Wormhole o Blackhole) con 4,79 GB de DRAM para pesos, aprovechando el formato BFP4 nativo de TT-NN. Requiere implementar la inferencia (no incluida en el repo) y validar la salida.
- Investigación en cuantización BFP4: sirve como referencia reproducible para estudiar GPTQ con búsqueda de exponente por bloque y el empaquetado de matrices en la rejilla BFP4 de Tenstorrent, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`).
- Prototipado de chat en entornos de simulación: con `ttsim` (simulador Blackhole) se puede validar el flujo de carga de pesos y la coherencia del empaquetado antes de disponer de hardware físico.
- Evaluación comparativa de precisión tras cuantización: permite medir la degradación de un modelo de ~7,9B al pasar a 4,5 bits por peso en tareas de generación, siempre que se implemente la inferencia y se ejecuten benchmarks propios.
- Integración en pipelines de Transformers en GPU: el checkpoint también se puede cargar con `AutoModelForCausalLM` y `trust_remote_code=True` en CUDA, usando Transformers 4.57.1 y flash-linear-attention 0.4.2, para comparar el comportamiento frente al modelo base.
- Base para futuros exports tt-forge / tt-transformers: al estar verificado el empaquetado, puede servir como punto de partida para integrar Ling-3.0-tiny en el stack de compilación de Tenstorrent cuando esté soportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección "Evaluation" que aparece truncada en los datos proporcionados, sin valores numéricos utilizables.

## Requisitos de hardware

- VRAM/DRAM para pesos: aproximadamente 4,79 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole y Blackhole); verificado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim).
- GPU consumer: no se documenta soporte ni rendimiento en GPU consumer; la carga en CUDA es posible vía Transformers con el código original, pero el checkpoint está pensado para Tensix.
- Despliegue: TT-NN / tt-metal para Tensix; Transformers 4.57.1 con flash-linear-attention 0.4.2 para la carga de referencia. No se ha probado con tt-transformers ni tt-forge.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.0-tiny-Tenstorrent-Tensix-BFP4 (este) | 7,89B | no disponible | BFP4 para Tensix; safetensors | MIT | Export cuantizado, solo empaquetado verificado |
| inclusionAI/Ling-3.0-tiny | 7,89B | no disponible | Pesos originales en bf16; Transformers | no disponible | Modelo base sin cuantizar |
| Alternativas de ~7-8B en BFP4 para Tensix | no disponible | no disponible | no disponible | no disponible | No se conocen exports comparables en la información disponible |

## Limitaciones y advertencias

- No se incluye implementación de inferencia: el repositorio solo añade el empaquetado de pesos y scripts de verificación; tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- 12 matrices (`q_b_proj` y `kv_a_proj_with_mqa` en capas 3, 7, 11, 15, 19 y 23) no están en la rejilla BFP4 tal como se almacenan y requieren una permutación de filas par/impar en el sufijo rotatorio; ignorarla produce resultados incorrectos.
- Incompatibilidad con Transformers 5.x: la arquitectura nativa `bailing_hybrid` de esa versión difiere y no debe usarse para cargar el checkpoint; se requiere Transformers 4.57.1 (referencia) y el código personalizado original.
- Dependencias CUDA/FLA para el quickstart en GPU; el flujo en Tensix requiere ttnn y un dispositivo o simulador compatible.
- Idiomas soportados no declarados; riesgo de comportamiento deficiente fuera de los idiomas del modelo base.
- Sesgos y alucinaciones: no documentados en la información disponible; se heredan los del modelo base y pueden verse alterados por la cuantización a 4,5 bits.
- Licencia MIT permite uso comercial, pero la ausencia de benchmarks y de validación de inferencia traslada al usuario la responsabilidad de evaluar la calidad en producción.
- Sin datos de benchmarks publicados: no es posible afirmar la degradación de precisión frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Ling-3.0-tiny-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Ling-3.0-tiny-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
