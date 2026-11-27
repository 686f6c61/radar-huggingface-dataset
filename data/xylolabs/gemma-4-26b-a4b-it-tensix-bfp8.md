# Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP8

## Resumen

Gemma 4 26B-A4B-it-Tensix-BFP8 es una cuantización del modelo multimodal `google/gemma-4-26B-A4B-it` realizada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). Se trata de una variante de pesos empaquetados en formato `bfloat8_b` (BFP8, block floating point de 8 bits) que se genera mediante GPTQ sobre la rejilla de bloques propia del hardware Tensix, manteniendo en bf16 el LM head, los embeddings, las normas y el torre de visión. El resultado es un checkpoint de 27,513 GB que reduce a la mitad el peso del modelo base en bf16 (50,47 GB) con una degradación de calidad muy contenida.

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de 26.544.133.710 parámetros totales, según los safetensors publicados, del que se activan aproximadamente 4B por token (la nomenclatura A4B del nombre lo indica). Es multimodal de entrada imagen-texto, con torre de visión y proyección `embed_vision`, lo que permite tareas image-text-to-text además de generación de texto puro. La ficha se centra en la versión cuantizada para Tensix, no en el modelo original de Google.

La relevancia de este checkpoint es doble: por un lado, demuestra que es posible llevar un MoE multimodal de 26B a NPUs de Tenstorrent con pérdida de fidelidad muy baja respecto a bf16 (KL media de 0,00804 frente a 0,1249 de un Q4_K_M de llama.cpp, es decir, unas 0,06 veces); por otro, ofrece una alternativa de despliegue en hardware no-GPU con licencia Apache 2.0. El repositorio incluye herramientas de empaquetado y verificación (`pack_tensix.py`, `verify_grid.py`) y kernels/runner separados en el ecosistema `tensix-*` de Xylolabs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal image-text-to-text; 30 capas según el mapa de cuantización |
| Parametros totales | 26.544.133.710 |
| Parametros activos | Aproximadamente 4B por token (denominación A4B del modelo base; no se detalla el reparto exacto en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) para proyecciones de atención, MLP y expertos enrutados; bf16 para LM head, embeddings, normas, router, escalas por experto y torre de visión. Existe variante BFP4 en otro repositorio |
| Idiomas soportados | No disponible en la información proporcionada; la evaluación de fidelidad cubre inglés y coreano |
| Licencia | Apache 2.0 (según la model card y el archivo LICENSE incluido) |
| Formato de pesos | Safetensors empaquetados para Tensix (`quant4.json` describe el formato por proyección; índice `model.safetensors.index.json`) |
| Tamano del repositorio | 53,1 GB (checkpoint empaquetado de 27,513 GB) |
| Modelo base | google/gemma-4-26B-A4B-it |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con 30 capas, atención multi-cabeza y un bloque MLP compartido más expertos enrutados. La model card detalla que las proyecciones q, k, o de atención (30 capas), la proyección v (25 capas, lo que sugiere algún tipo de atención parcial o compartición de claves/valores en 5 capas) y las proyecciones gate, up y down tanto del MLP compartido como de los expertos enrutados se cuantizan a `bfloat8_b`. El router y sus escalas por experto permanecen en bf16, igual que el LM head (atado al embedding), las normas y todos los tensores restantes. La torre de visión y `embed_vision` se mantienen en bf16 sin cambios respecto al modelo base.

El proceso de cuantización es GPTQ aplicado sobre la rejilla de bloques de `bfloat8_b` propia de Tensix, implementado en el repositorio `tensix-bfp-gptq` (commit 5c52065, release v0.1.0). No se especifican en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones de decodificación como decodificación especulativa; esos detalles corresponden a la model card de Google y no se han proporcionado. La innovación destacable de esta ficha es la propia técnica de cuantización: GPTQ sobre rejilla BFP8 con evaluación de fidelidad mediante KL y top-1 frente a bf16.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), validada en la quickstart del autor.
- Procesamiento image-text-to-text: incluye torre de visión y proyección `embed_vision` en bf16, por lo que conserva la capacidad multimodal del modelo base.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Gemma 4 26B-A4B-it; no se aportan evaluaciones específicas en esta ficha.
- Generación de código: heredada del modelo base; no se aportan evaluaciones específicas.
- Soporte multilingüe: la evaluación de fidelidad incluye inglés y coreano (WikiText-2 y Wikipedia en coreano), lo que confirma manejo de al menos esos dos idiomas; el resto no está detallado.
- Modo "it" (instruction-tuned): el sufijo `-it` del modelo base indica ajuste por instrucciones, con formato de chat.
- Ejecución en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`, con verificación en el simulador `ttsim` de Blackhole con ttnn 0.81.1.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de agente multi-paso; deben asumirse como no garantizados.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Un equipo con Wormhole o Blackhole puede servir el modelo empaquetado de 27,513 GB usando los kernels y el runner de `tensix-kernels` y `tensix-runner` v0.1.0, evitando depender de GPUs NVIDIA.
- Inferencia multimodal en el borde o en servidores de bajo consumo: la reducción de 50,47 GB a 27,513 GB facilita alojar un modelo image-text-to-text de 26B en nodos con memoria limitada, manteniendo el 96,97 % de top-1 frente a bf16.
- Asistentes conversacionales con contexto de imágenes: al conservar la torre de visión en bf16, se puede usar para responder preguntas sobre capturas, documentos escaneados o gráficos en un chat multi-turno con plantilla de instrucciones.
- Evaluación y prototipado de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar cada matriz contra la representación en torch y contra DRAM del dispositivo, lo que lo convierte en una referencia útil para validar pipelines de cuantización BFP8 en producción.
- Investigación en eficiencia de hardware: sirve como base para comparar fidelidad (KL 0,00804) y rendimiento de BFP8 frente a Q4_K_M y bf16 en el mismo checkpoint, con metodología reproducible (8.048 posiciones, plantilla de chat).
- Sustitución de despliegues llama.cpp en entornos Tensix: equipos que ya usan Q4_K_M por restricciones de memoria pueden migrar a este checkpoint para obtener una fidelidad notablemente superior (0,06 veces la KL de Q4_K_M) a costa de mayor tamaño (27,5 GB frente a 16,8 GB).
- Servicio de traducción o análisis de texto inglés-coreano: la evaluación cubre ambos idiomas, por lo que es razonable para tareas bilingües en esos pares, siempre con validación propia.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad de cuantización, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 50,47 | 0 | 100 |
| Este modelo (Tensix BFP8) | 27,513 | 0,00804 | 96,97 |
| Q4_K_M (llama.cpp) | 16,796 | 0,1249 | 88,16 |

Metodología: KL y top-1 sobre 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), con plantilla de chat. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, sha256 `2289deaba79c84dfa5727922ac0e7aee2a4807cc5b438faebdb75644e4856c7c`.

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 27,513 GB de pesos empaquetados; en inferencia hay que sumar caché KV y activaciones, no cuantificadas en la información disponible. El checkpoint en bf16 del modelo base ocupa 50,47 GB.
- GPU: no es el objetivo del checkpoint; la quickstart usa `device_map="auto"` con transformers y dtype bfloat16, por lo que requiere hardware con al menos ~28 GB de memoria para los pesos y margen adicional.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (NPU Tensix). Verificado con ttnn 0.81.1 sobre el simulador `ttsim` de Blackhole.
- ¿Cabe en GPU de consumo? No de forma completa: 27,5 GB superan los 24 GB de una RTX 4090. La variante BFP4 del mismo autor está pensada para dispositivos con menos memoria.
- Opciones de despliegue: `transformers` (AutoModelForCausalLM), `ttnn` con `tt-metal` para Tensix, y los paquetes `tensix-kernels` y `tensix-runner` v0.1.0. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato empaquetado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (Tensix BFP8) | 26,54B totales, ~4B activos | No disponible | BFP8 empaquetado, 27,513 GB | Apache 2.0 | Tenstorrent Tensix |
| google/gemma-4-26B-A4B-it (bf16) | 26,54B totales, ~4B activos | No disponible | bf16, 50,47 GB | Apache 2.0 | GPU / TPU |
| Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP4 | 26,54B totales, ~4B activos | No disponible | BFP4 empaquetado, tamaño no disponible | Apache 2.0 | Tenstorrent Tensix con menos memoria |
| Q4_K_M de llama.cpp (mismo checkpoint) | 26,54B totales, ~4B activos | No disponible | GGUF Q4_K_M, 16,796 GB | Apache 2.0 (heredada) | CPU/GPU con llama.cpp |

La comparación de calidad se limita a las métricas de fidelidad de la tabla de benchmarks: este modelo obtiene KL 0,00804 y top-1 96,97 %, frente a 0,1249 y 88,16 % de Q4_K_M y 0 y 100 % de bf16. No hay datos de benchmarks de tareas para comparar con otras familias de modelos.

## Limitaciones y advertencias

- Es una cuantización: introduce una degradación medible (KL 0,00804, top-1 96,97 % frente a bf16); no es equivalente bit a bit al modelo base.
- El formato está empaquetado para Tensix; la carga en transformers funciona según la quickstart, pero el rendimiento óptimo y el soporte completo dependen del ecosistema `ttnn`/`tt-metal` y de los paquetes `tensix-*` del autor.
- Solo se ha verificado en el simulador `ttsim` de Blackhole con ttnn 0.81.1; no se documenta validación en silicio Wormhole o Blackhole real en la información disponible.
- Idiomas: la evaluación cubre inglés y coreano; el resto de idiomas no está evaluado y puede degradarse de forma distinta tras la cuantización.
- No se documenta soporte de tool calling, agentes ni function calling; no debe asumirse para producción sin validación propia.
- Riesgo de alucinación y sesgos: heredados del modelo base Gemma 4; no se aportan evaluaciones específicas en esta ficha.
- Licencia Apache 2.0 según la model card, pero el repositorio del modelo base no incluye archivo LICENSE; el autor añade el texto estándar y un NOTICE con los cambios. Verificar términos antes de uso comercial.
- El autor declara no estar afiliado a Tenstorrent; el soporte de hardware y kernels es de terceros.
- Longitud de contexto no disponible: planificar despliegues con contexto largo requiere consultar la model card del modelo base.
- El repositorio tiene pocas descargas (215) y un like en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP4
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (no verificado en la información disponible)
