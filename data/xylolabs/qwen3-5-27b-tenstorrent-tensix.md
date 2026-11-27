# Xylolabs/Qwen3.5-27B-Tenstorrent-Tensix

## Resumen

Qwen3.5-27B-Tenstorrent-Tensix es una cuantización del modelo multimodal Qwen/Qwen3.5-27B, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un artefacto de pesos empaquetados en formato bfloat4_b (BFP4) para ejecutarse sobre la pila de software tt-metal/ttnn, manteniendo el resto de componentes en bf16 o float32.

El modelo base Qwen3.5-27B, desarrollado por el equipo Qwen, es un modelo image-text-to-text de 27 000 millones de parámetros con arquitectura híbrida que combina capas DeltaNet (atención lineal) con atención clásica y capas MLP, según se deduce de los módulos cuantizados que menciona la model card. Esta versión cuantizada reduce el peso empaquetado de 53,79 GB (bf16) a 18,788 GB, con una divergencia media de KL respecto a BF16 de 0,0254.

Su relevancia es doble: por un lado, demuestra que es viable ejecutar un modelo multimodal de 27B en hardware no-GPU (aceleradores Tensix); por otro, publica la herramienta de cuantización tensix-bfp-gptq v0.1.0 como código abierto, lo que permite replicar el proceso sobre otros modelos. La licencia Apache 2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas DeltaNet (atención lineal) y atención clásica; multimodal image-text-to-text |
| Parametros totales | 27 000 millones (según el nombre del modelo base Qwen3.5-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (BFP4) en DeltaNet, atención y MLP; bf16/float32 en el resto |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix mediante pack_tensix.py) |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo base ni aporta detalles sobre el dataset, el número de tokens o las fases de alineación (RLHF/DPO). Lo que sí se explicita es la arquitectura de la cuantización: las capas DeltaNet, de atención y las MLP se almacenan en bfloat4_b (formato de bloque de coma flotante de 4 bits con exponente compartido), mientras que el resto de tensores permanecen en bf16 o float32. Esta mezcla busca preservar la precisión en los componentes sensibles (normalizaciones, embeddings, cabezas) y comprimir agresivamente las matrices grandes.

El proceso de cuantización se apoya en tensix-bfp-gptq v0.1.0, una herramienta de GPTQ adaptada a BFP4 para Tensix. La model card reporta una divergencia media de KL frente a BF16 de 0,0254 para el conjunto bfp4, frente a 0,0192 de una cuantización Q4_K_M de llama.cpp; es decir, la cuantización BFP4 es algo más agresiva que Q4_K_M en términos de fidelidad de distribución, aunque con un tamaño empaquetado comparable (18,788 GB frente a 16,547 GB). El repositorio incluye los scripts pack_tensix.py y verify_grid.py para empaquetar y verificar los pesos en el dispositivo Tensix.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es image-text-to-text, por lo que acepta imágenes y texto como entrada.
- Modo thinking opcional: la plantilla de chat expone el parámetro enable_thinking, que permite activar o desactivar la cadena de razonamiento.
- Procesamiento de imágenes: herencia directa del modelo base Qwen3.5-27B, orientado a agentes multimodales nativos según la cita del equipo Qwen.
- Soporte bilingüe declarado: inglés y coreano.
- Tool calling y razonamiento multi-paso: no se detalla explícitamente en la model card, aunque el modelo base se presenta como orientado a agentes; conviene verificarlo en la documentación de Qwen.
- Ejecución en aceleradores Tensix: capacidad diferencial de esta versión, con empaquetado y verificación incluidos en el repositorio.

## Casos de uso

- Inferencia multimodal sobre hardware Tenstorrent: el caso principal. Permite desplegar un modelo image-text-to-text de 27B en servidores con NPU Wormhole o Blackhole sin depender de GPU NVIDIA, usando los scripts pack_tensix.py y verify_grid.py incluidos.
- Investigación en cuantización de bajo bit: el par de pesos BFP4 y la métrica de KL publicada sirven para estudiar el impacto de la cuantización de 4 bits en modelos híbridos con DeltaNet frente a alternativas como Q4_K_M.
- Evaluación de la pila tt-metal/ttnn: al ser un artefacto específico para Tensix, es útil como banco de pruebas para validar kernels y operadores de la cadena de herramientas de Tenstorrent con un modelo multimodal real.
- Prototipado de asistentes con imágenes en inglés o coreano: gracias al pipeline image-text-to-text y al modo thinking desactivable, se puede construir un asistente de descripción o extracción de información de imágenes en esos dos idiomas.
- Docencia y experimentación con arquitecturas híbridas: la mezcla de DeltaNet y atención clásica en un modelo de 27B permite estudiar el comportamiento de atención lineal a escala media en entornos con recursos limitados de GPU.
- Reproducibilidad de pipelines de cuantización: el código Apache 2.0 de tensix-bfp-gptq v0.1.0 permite replicar el proceso sobre otros modelos base y comparar la fidelidad obtenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de fidelidad de cuantización:

| Formato | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|
| bfp4 (este repo) | 18,788 | 0,0254 |
| bf16 (original) | 53,79 | 0 |
| Q4_K_M (llama.cpp) | 16,547 | 0,0192 |

## Requisitos de hardware

- VRAM/espacio de pesos: 18,788 GB empaquetados en bfp4; el modelo base en bf16 ocupa 53,79 GB.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. No está pensado para GPU convencional, aunque los pesos pueden cargarse con transformers en bf16 usando device_map="auto" (requiere memoria suficiente para el modelo completo en ese formato).
- GPU de consumo: no es el destino de esta versión; para GPU conviene usar el modelo base o cuantizaciones GGUF (por ejemplo, Q4_K_M de llama.cpp, 16,547 GB).
- Despliegue: pila tt-metal/ttnn en Tensix; scripts pack_tensix.py y verify_grid.py del repositorio; carga alternativa vía transformers con AutoModelForImageTextToText.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-27B-Tenstorrent-Tensix | 27B | no disponible | BFP4 para Tensix | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-27B (base) | 27B | no disponible | bf16, transformers | Apache 2.0 | Hugging Face |
| Qwen3.5-27B Q4_K_M (llama.cpp) | 27B | no disponible | GGUF 4 bits, CPU/GPU | Apache 2.0 | Derivado del base |

La comparación relevante es interna al propio modelo base: esta versión sacrifica algo de fidelidad (KL 0,0254 frente a 0,0192 de Q4_K_M) a cambio de un formato nativo para Tensix y un tamaño empaquetado ligeramente mayor. No se dispone de datos de benchmarks que permitan comparar calidad de tarea con otras alternativas.

## Limitaciones y advertencias

- Solo se declaran los idiomas inglés y coreano; el rendimiento en castellano no está garantizado.
- La cuantización BFP4 introduce una divergencia medible frente a BF16 (KL 0,0254), superior a la de Q4_K_M; en tareas sensibles a la precisión puede degradar ligeramente la calidad.
- El hardware objetivo es Tensix (Wormhole, Blackhole); no es un artefacto portable a GPU sin reconversión.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base en la información disponible.
- La longitud de contexto no se especifica en la model card; conviene consultar la ficha de Qwen/Qwen3.5-27B antes de usarlo en producción.
- El soporte de tool calling y agentes no está confirmado explícitamente para esta versión cuantizada.
- Aunque la licencia es Apache 2.0, cada carpeta del repositorio incluye su propio LICENSE y NOTICE; es necesario revisarlos antes de redistribuir.
- El repositorio tiene 91 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-27B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-27B-Tenstorrent-Tensix/blob/main/LICENSE
