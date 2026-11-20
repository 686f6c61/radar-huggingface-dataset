# Xylolabs/Hy4-GGUF

## Resumen

Hy4 es un modelo multimodal de tipo image-text-to-text desarrollado por Tencent, publicado originalmente en el repositorio `tencent/Hy4`. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 769.907.408.797 parámetros totales (aproximadamente 770B) y 49B parámetros activos por token, lo que lo sitúa en la categoría de modelos de gran escala con activación eficiente. El repositorio analizado, `Xylolabs/Hy4-GGUF`, es una conversión a formato GGUF realizada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU, no una versión oficial de Tencent.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 770B en infraestructura local mediante cuantización Q8_0, algo impensable con los pesos originales en BF16. La conversión incluye la torre de visión en BF16 y Q8_0, y emplea una receta de tipos por tensor que mantiene en F32 el router, las funciones de hiper-conexión, las normas y los sesgos, mientras cuantiza a Q8_0 los expertos enrutados, la atención MLA, los expertos compartidos y el LM head.

El modelo soporta inglés y chino, tiene capacidades multimodales (visión y uso de ordenador), y se distribuye bajo la Tencent Hy License, versión 1.0, que incluye términos adicionales para operadores de Model-as-a-Service a gran escala. Su pipeline es image-text-to-text y está pensado para conversación, razonamiento y tareas de desarrollo frontend y videojuegos, según la documentación del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención MLA e hiper-conexiones; incluye torre de visión |
| Parametros totales | 769.907.408.797 (aproximadamente 770B) |
| Parametros activos | 49B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos principales, 13 partes); torre de visión en BF16 y Q8_0; router, hiper-conexiones, normas y sesgos en F32 |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (license_name: tencent-hy-license) |
| Formato de pesos | GGUF (Q8_0 dividido en 13 archivos; mmproj en BF16 y Q8_0) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención MLA (Multi-head Latent Attention) y funciones de hiper-conexión, según la receta de tensores publicada por Xylolabs. Los expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) suman 744.1B parámetros y se cuantizan a Q8_0, mientras que las proyecciones de atención MLA, los expertos compartidos, la MLP densa de la capa 0, el embedding de tokens y las proyecciones de query y key del indexer también van en Q8_0. El router (`ffn_gate_inp`), las funciones de hiper-conexión, la proyección del indexer, las normas y los sesgos se mantienen en F32 para preservar la estabilidad numérica del enrutamiento y las operaciones auxiliares.

La conversión a GGUF se realizó con el `convert_hf_to_gguf.py` del PR #32517 de llama.cpp más un parche (`hy4-release-convert.patch`) que excluye el drafter DFly2, lo que sugiere que el modelo original incorpora decodificación especulativa mediante un drafter. El repositorio no proporciona datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en la documentación consultada. La torre de visión se exporta por separado con `--mmproj`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de visión incluida.
- Visión aplicada a uso de ordenador (computer use), según la documentación del modelo base.
- Desarrollo frontend y de videojuegos, según los casos de uso destacados por Tencent.
- Razonamiento y resolución de problemas, implícito en la categoría de modelos MoE de gran escala.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque la capacidad de computer use sugiere flujos agénticos.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente multimodal de atención al cliente: el modelo puede recibir capturas de pantalla o imágenes junto con texto y mantener conversaciones multi-turno, aprovechando la torre de visión para interpretar interfaces o documentos escaneados.
- Automatización de uso de ordenador: gracias a sus capacidades de computer use, puede analizar capturas de pantalla y generar acciones sobre interfaces, integrándose en pipelines de automatización de tareas repetitivas de escritorio.
- Desarrollo frontend asistido: el modelo puede generar y revisar código de interfaz a partir de descripciones textuales o maquetas de imagen, un caso de uso que Tencent destaca explícitamente para Hy4.
- Prototipado de videojuegos: generación de lógica de juego, diálogos de personajes y descripciones de assets a partir de especificaciones en texto e imágenes, orientado a equipos que trabajan en inglés o chino.
- Análisis de documentación técnica bilingüe: al soportar en y zh, puede resumir y comparar documentación técnica en ambos idiomas, útil en equipos distribuidos entre China y mercados anglófonos.
- Despliegue local de un modelo de 770B: con la cuantización Q8_0 en 13 partes y llama.cpp sobre CUDA o Metal, permite experimentar con un MoE de gran escala en clústeres de GPU propios sin depender de APIs externas.
- Investigación en cuantización y eficiencia MoE: la receta de tipos por tensor (Q8_0 para expertos, F32 para router y normas) sirve como referencia para estudiar el impacto de la cuantización selectiva en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: el conjunto de pesos principales ocupa 818.49 GB en 13 partes, más 1.61 GB (Q8_0) o 2.68 GB (BF16) de la torre de visión. Se necesita un total en torno a 820 GB de memoria para cargar el modelo completo en Q8_0.
- GPU recomendadas: no hay una recomendación explícita en la información disponible; por el volumen de pesos, se requieren configuraciones multi-GPU de clase A100/H100 o superiores. No cabe en una RTX 4090 (24 GB) ni en ninguna GPU de consumo individual.
- Cabe en consumer GPU: no. El tamaño del modelo Q8_0 (818.49 GB) excede con mucho la VRAM de cualquier GPU de consumo.
- Opciones de despliegue: llama.cpp (PR #32517, commit `0a054d0b0`), con `llama-cli` y `llama-server`; el mismo build funciona en CUDA y Metal. La documentación del modelo base menciona vLLM y SGLang para los checkpoints originales de Tencent, no para estos GGUF.
- Latencia y throughput estimados: no disponibles. La documentación solo indica que se use `-ngl 99` para descargar todas las capas en GPU y `-c 8192` como ejemplo de contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Hy4 (Xylolabs GGUF) | 769.9B | 49B | no disponible | Tencent Hy License 1.0 | GGUF Q8_0, mmproj BF16/Q8_0 |
| Hy4 (tencent/Hy4) | 769.9B | 49B | no disponible | Tencent Hy License 1.0 | Checkpoints originales (BF16), vLLM/SGLang |
| AngelSlim/Hy4-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF (referenciado en el README de Tencent) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas en la información disponible.
- Sesgos conocidos: no disponibles en la documentación consultada.
- Longitud de contexto no especificada; el ejemplo de ejecución usa `-c 8192`, pero no se confirma como máximo.
- La licencia Tencent Hy License 1.0 incluye términos adicionales para operadores de Model-as-a-Service a gran escala; es necesario revisar el archivo `LICENSE` antes de un uso comercial.
- El soporte en llama.cpp depende de un PR no fusionado (#32517); la estabilidad y el rendimiento pueden variar hasta su integración.
- El drafter DFly2 queda excluido en la conversión, por lo que no se dispone de decodificación especulativa en estos GGUF.
- Xylolabs no está afiliado ni respaldado por Tencent; la conversión es no oficial.
- El tamaño de 818.49 GB en Q8_0 hace inviable el despliegue en hardware de consumo y exige infraestructura multi-GPU de gama alta.
- No se proporcionan datos sobre el dataset de entrenamiento ni sobre procesos de alineación (RLHF/DPO), lo que limita la evaluación de sesgos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Hy4-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4
- README en chino del modelo base: https://huggingface.co/tencent/Hy4/blob/main/README_CN.md
- Licencia: https://huggingface.co/Xylolabs/Hy4-GGUF/blob/main/LICENSE
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32517
- Repositorio de Xylolabs (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub del modelo: https://github.com/Tencent-Hunyuan/Hy4
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- GGUF alternativo referenciado: https://huggingface.co/AngelSlim/Hy4-GGUF
- Paper 1: arxiv:2512.02556
- Paper 2: arxiv:2603.12201
