# Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP8

## Resumen

Arete-27B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo NousResearch/Arete-27B, un fine-tune supervisado de Qwen/Qwen3.8-27B realizado por Nous Research. La ha publicado Xylolabs y está específicamente adaptada para su ejecución en las NPU Tensix de Tenstorrent (Wormhole y Blackhole), usando el formato de coma flotante por bloques `ttnn.bfloat8_b` (BFP8) sobre las capas lineales del modelo. El modelo conserva el pipeline `text-generation` y la arquitectura multimodal subyacente (etiqueta `image-text-to-text`), aunque la cuantización y la evaluación se han aplicado únicamente al modelo de lenguaje.

El problema que resuelve es la brecha entre los checkpoints estándar de transformers y el hardware de inferencia de Tenstorrent: los pesos se almacenan como valores bf16 sobre la rejilla BFP8, de modo que TT-NN los empaqueta sin alterar sus valores. La cuantización se ha realizado con GPTQ sobre la rejilla bfloat8_b, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resultado ocupa 30,96 GB empaquetados, con una media de 9,21 bits por peso, y requiere aproximadamente esa cantidad de memoria de dispositivo solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.

Con 27.356.728.560 parámetros totales y licencia Apache-2.0, el modelo es relevante para equipos que ya operan hardware Tenstorrent y necesitan desplegar un modelo de 27B con capacidades conversacionales y multimodales sin reentrenar ni recuantizar manualmente. La model card advierte de que la arquitectura no está soportada por tt-transformers y de que el demo oficial de tt-metal (`qwen38_27b_qb2`) empaqueta por defecto en bfloat4_b, por lo que es necesario aplicar una política de precisión personalizada para preservar el formato BFP8 de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y Gated DeltaNet (según la estructura de capas descrita: 16 capas de atención q/k/v/o y 48 capas Gated DeltaNet, más 64 capas MLP); basado en Qwen3.8-27B vía NousResearch/Arete-27B |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en capas lineales); LM head, embeddings, norms y resto de tensores en bf16; `visual` en bf16. Media de 9,21 bits por peso. Existe una versión BFP4 del mismo autor |
| Idiomas soportados | no disponible (la calibración de GPTQ usó WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 54,7 GB; pesos empaquetados de 30,96 GB); compatible con transformers; empaquetable con TT-NN |

## Arquitectura y entrenamiento

El modelo base es NousResearch/Arete-27B, un fine-tune supervisado de Qwen/Qwen3.8-27B. La estructura de capas que detalla la model card revela una arquitectura híbrida: 16 capas con atención clásica (proyecciones q, k, v, o) y 48 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y salida), además de 64 capas MLP con proyecciones gate, up y down. Esta combinación de atención completa con mecanismos de estado recurrente lineal es característica de las arquitecturas híbridas orientadas a contextos largos y eficiencia de cómputo. El checkpoint incluye además un módulo `visual` en bf16, lo que confirma su naturaleza multimodal image-text-to-text, aunque la cuantización y la evaluación se limitaron al modelo de lenguaje.

La innovación principal de esta exportación es el método de cuantización: GPTQ aplicado directamente sobre la rejilla bfloat8_b de Tenstorrent, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador. La calibración empleó 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP8, de forma que TT-NN los empaqueta sin modificar sus valores, lo que permite verificar la integridad mediante round-trip a dispositivo. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y scripts de verificación (`pack_tensix.py`, `verify_grid.py`). No se dispone de información sobre el volumen total de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicable mediante `apply_chat_template`.
- Procesamiento image-text-to-text: el checkpoint conserva el módulo `visual` en bf16, aunque la model card indica que solo se cuantizó y evaluó el modelo de lenguaje.
- Razonamiento y generación de código y matemáticas: capacidades heredadas de Qwen3.8-27B y del fine-tune supervisado de Nous Research, sin métricas publicadas en la información disponible.
- Soporte multilingüe: no disponible como listado explícito; la calibración incluyó coreano además de inglés.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Ejecución en NPU Tensix: empaquetado nativo para `ttnn.bfloat8_b` en Wormhole y Blackhole, con verificación de integridad de pesos incluida.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar.

## Casos de uso

- Despliegue en clústeres Tenstorrent Blackhole: el modelo está empaquetado para ejecutarse en NPU Tensix con TT-NN, y el demo `qwen38_27b_qb2` de tt-metal lo ejecuta en paralelo de tensores sobre cuatro chips Blackhole (QuietBox 2), lo que lo hace adecuado para equipos con esta infraestructura que necesitan un modelo de 27B sin recuantizar.
- Evaluación de precisión BFP8 en hardware real: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que ningún valor cambia al empaquetar cada matriz, útil para validar pipelines de cuantización antes de producción.
- Asistentes conversacionales autoalojados: al ser un fine-tune supervisado con plantilla de chat y licencia Apache-2.0, puede integrarse en servicios de atención al cliente o asistentes internos desplegados sobre hardware propio.
- Procesamiento de documentos con componente visual: el módulo `visual` en bf16 permite tareas image-text-to-text, como descripción de imágenes o extracción de información de capturas y documentos escaneados, siempre que se valide el soporte del runtime.
- Investigación sobre cuantización block-floating-point: el repositorio y el código `tensix-bfp-gptq` sirven como referencia reproducible para estudiar el impacto de GPTQ sobre la rejilla BFP8 frente a bf16.
- Generación de código en pipelines internos: las capacidades heredadas de Qwen3.8-27B permiten tareas de autocompletado y explicación de código, con la ventaja de ejecutarse en hardware Tensix y no depender de GPU.
- Fine-tuning posterior o destilación: la licencia Apache-2.0 y el formato safetensors estándar facilitan reutilizar los pesos como punto de partida, aunque la cuantización BFP8 limita la fidelidad respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas de empaquetado: 30,96 GB de memoria de dispositivo para los pesos del modelo de lenguaje, 9,21 bits por peso de media, y verificación exacta de las proyecciones de las capas 0 y 3 al aplicar una política de precisión bfloat8_b en el demo de tt-metal. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 30,96 GB solo para los pesos del modelo de lenguaje, más espacio adicional para la caché KV y buffers. La versión BFP4 del mismo autor está pensada para dispositivos con menos memoria.
- Hardware objetivo: NPU Tensix de Tenstorrent, familias Wormhole y Blackhole. El demo oficial `qwen38_27b_qb2` (tt-metal v0.81.1) requiere cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware.
- GPU consumer: no es el objetivo del checkpoint; la ejecución verificada es sobre Tensix. La carga con transformers es posible (`device_map="auto"`, dtype bfloat16), pero no se documentan requisitos de VRAM en GPU.
- Opciones de despliegue: TT-NN / tt-metal (con política de precisión personalizada `QWEN_PRECISION_CONFIG` apuntando a bfloat8_b), y transformers para carga e inspección. tt-transformers no soporta esta arquitectura según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Verificación en simulación: probado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.
- Latencia y throughput: no disponibles. La model card indica que el head y una ejecución completa no se probaron por requerir los cuatro chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP8 | 27.356.728.560 | no disponible | BFP8 (bfloat8_b) + bf16, safetensors | Apache-2.0 | Hugging Face, 72 descargas |
| Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP4 | no disponible | no disponible | BFP4 (bfloat4_b) | Apache-2.0 (presumible, no confirmado) | Hugging Face |
| NousResearch/Arete-27B | no disponible | no disponible | bf16, safetensors | no disponible en la informacion | Hugging Face (modelo base) |
| Qwen/Qwen3.8-27B | no disponible | no disponible | bf16, safetensors | no disponible en la informacion | Hugging Face (modelo original) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre el checkpoint BFP8 y el BFP4 es el consumo de memoria de dispositivo y, previsiblemente, la fidelidad numérica, pero no se publican métricas de calidad para ninguno de los dos.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo `visual` permanece en bf16 y su comportamiento tras el empaquetado no está validado.
- La model card advierte de que tt-transformers no soporta esta arquitectura, lo que limita las vías de despliegue estándar en el ecosistema Tenstorrent.
- El demo oficial de tt-metal empaqueta por defecto en bfloat4_b, lo que recuantiza estos pesos; es imprescindible escribir una política de precisión que mantenga bfloat8_b para preservar la fidelidad del checkpoint.
- El head en bf16 de este checkpoint no es exacto en el demo, que lo convierte a bfloat8_b; el head y una ejecución completa no se probaron por requerir cuatro chips Blackhole.
- Los pesos requieren ~30,96 GB de memoria de dispositivo más caché KV y buffers, lo que excluye su uso en dispositivos Tensix de menor capacidad; para esos casos existe la variante BFP4.
- La cuantización GPTQ se calibró con un conjunto limitado (65.536 tokens de WikiText-2 y Wikipedia en coreano), lo que puede introducir sesgos de dominio y de idioma en la degradación de precisión.
- No se publican evaluaciones de sesgo, alucinación ni robustez para este checkpoint ni para el modelo base en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base NousResearch/Arete-27B y de Qwen3.8-27B, cuyas licencias no se detallan en la información proporcionada.
- El número de descargas (72) y la ausencia de likes indican una adopción todavía muy limitada, con escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante BFP4: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP4
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal qwen38_27b_qb2: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
