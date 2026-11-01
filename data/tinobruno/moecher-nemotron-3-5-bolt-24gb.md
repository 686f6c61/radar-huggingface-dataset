# TinoBruno/moecher-nemotron-3.5-bolt-24gb

## Resumen

NVIDIA Nemotron 3.5 Bolt 24GB (74B-A9B) es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por NVIDIA, distribuido en este repositorio por el usuario TinoBruno como un paquete de pesos prealineados para el motor de inferencia bare-metal MinnieTheMoEcher, escrito en C++/CUDA. El modelo combina una arquitectura híbrida Mamba-2 de espacio de estados (SSM) con atención Grouped-Query (GQA) y expertos LatentMoE dispersos, sumando 74.000 millones de parámetros totales con 9.000 millones activos por token.

La propuesta central de esta distribución es la ejecución completamente residente en memoria en hardware de consumo: los expertos enrutados se almacenan en cuantización IQ2_XXS (unos 1,29 MB por bloque de experto) mientras que las capas densas residentes (embeddings, mezcladores Mamba-2, atención GQA, cuellos de botella LatentMoE, expertos compartidos y LM head) se mantienen en FP8/BF16. Esto permite ejecutar un modelo de 74B en GPUs de 16 GB de VRAM combinadas con 32 GB de RAM de sistema, o de forma ultrarrápida en GPUs de 24 GB o más.

El modelo está orientado a cargas de trabajo agénticas y de tool calling, e incluye una plantilla de chat oficial con soporte de razonamiento y llamadas a herramientas. Su relevancia radica en demostrar que un MoE de gran escala puede desplegarse en equipos de consumo con un rendimiento declarado superior al de llama.cpp en la gestión de caché MoE, aunque el repositorio no contiene pesos en formatos estándar como safetensors o GGUF y depende de un motor propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 SSM + Grouped-Query Attention (GQA) + LatentMoE disperso (`nemotron_h_puzzle`) |
| Parametros totales | 74.000 millones |
| Parametros activos | 9.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS para expertos enrutados; FP8/BF16 para capas densas residentes |
| Idiomas soportados | inglés (en) |
| Licencia | NVIDIA Open Model License Agreement (nvidia-open-model-license) |
| Formato de pesos | Binario propietario alineado a páginas de 4096 bytes (`attention_dense_layers.bin`, `expert_weights.bin`, `expert_scales.bin`) + `moecher_manifest.json`; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es híbrida: 88 capas totales que combinan mezcladores Mamba-2 de espacio de estados con capas de atención GQA, más 40 capas MoE con 496 expertos enrutados por capa y `top_k = 9`. Los expertos se implementan como LatentMoE, con proyecciones de cuello de botella (`up_proj` y `down_proj`) y factores de escala FP32 por experto. El repositorio incluye 19.840 expertos enrutados en total, almacenados en formato IQ2_XXS alineado a páginas para permitir acceso directo desde memoria sin descompresión previa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card describe la innovación principal en el plano del despliegue: un esquema de doble búfer asíncrono con DMA prefetching que mantiene los expertos activos en VRAM (6,40 GB L1) mientras el resto reside en DRAM fijada del host (13,50 GB L2), logrando 21,54 tok/s en prefill y 13,51 tok/s en decodificación con carga de CPU del 0 % en configuraciones de 16 GB VRAM + 32 GB RAM, un 3,86x más rápido que la caché MoE de llama.cpp según el autor. En GPUs de 24 GB o más, la ejecución es totalmente en memoria sin lecturas de NVMe durante la generación.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Soporte de tool calling / function calling mediante la plantilla de chat oficial (`chat_template.jinja`) con marcas específicas para llamadas a herramientas.
- Capacidades agénticas y razonamiento multi-paso, indicadas por los tags `agentic` y `tool-calling`.
- Modo de razonamiento (reasoning) integrado en la plantilla de chat.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agentes autónomos de tool calling en local: la plantilla de chat con soporte de razonamiento y herramientas permite construir agentes que encadenan llamadas a APIs o funciones sin depender de servicios en la nube, ejecutándose en una RTX 4090 o 5090 de 24 GB.
- Asistentes de código en estación de trabajo: con 9.000 millones de parámetros activos por token y ejecución completamente en memoria en GPUs de 24 GB, el modelo puede integrarse en editores o terminales para autocompletado y generación de parches con baja latencia de decodificación.
- Automatización de flujos de trabajo en equipos de desarrollo con VRAM limitada: en configuraciones de 16 GB VRAM + 32 GB RAM el modelo mantiene 13,51 tok/s de decodificación, suficiente para tareas de agente por lotes o pipelines de CI que requieren razonamiento con herramientas.
- Procesamiento de conversaciones multi-turno con contexto extenso: la combinación de Mamba-2 SSM y atención GQA está diseñada para secuencias largas, adecuada para asistentes de soporte que mantienen historial de conversación, aunque la longitud de contexto no está publicada.
- Evaluación e investigación de arquitecturas híbridas SSM/MoE: el paquete incluye el manifiesto completo con la configuración de arquitectura y el diseño exacto de tensores, lo que facilita estudiar el comportamiento de un MoE de 74B con 496 expertos por capa en hardware de consumo.
- Despliegue de inferencia bare-metal sin dependencias de Python: el motor MinnieTheMoEcher en C++/CUDA permite servir el modelo como servidor HTTP en el puerto 8001 en entornos Windows, útil para integraciones en sistemas embebidos o estaciones de trabajo con requisitos estrictos de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta métricas de rendimiento de inferencia con su motor:

| Metrica | Valor declarado |
|---|---|
| Prefill (16 GB VRAM + 32 GB RAM) | 21,54 tok/s |
| Decodificacion (16 GB VRAM + 32 GB RAM) | 13,51 tok/s |
| Carga de CPU durante decodificacion | 0 % |
| Comparativa frente a cache MoE de llama.cpp | 3,86x mas rapido |

## Requisitos de hardware

- VRAM para inferencia: 6,40 GB en VRAM (capa L1) más 13,50 GB en DRAM fijada del host (capa L2) en la configuración mínima; el paquete completo de expertos ocupa unos 24,98 GiB y las capas densas unos 4,98 GiB.
- Configuración mínima: GPU de 16 GB VRAM (RTX 5060 Ti 16GB, RTX 4080) con 32 GB de RAM de sistema.
- Configuración recomendada: GPU de 24 GB o más (RTX 3090, RTX 4090, RTX 5090) para ejecución totalmente en memoria sin lecturas de SSD durante la generación.
- No se documenta soporte para A100, H100 ni otras GPUs de centro de datos; el motor está orientado a GPUs con arquitectura Blackwell y consumer.
- Opciones de despliegue: exclusivamente el motor MinnieTheMoEcher (`moecher.exe` con `moecher_manifest.json`, servidor en el puerto 8001, o el lanzador `start_nemotron_bolt_24gb.bat`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: 21,54 tok/s prefill y 13,51 tok/s decode en la configuración de 16 GB + 32 GB; no se publican cifras para GPUs de 24 GB o superiores.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B (esta distribucion) | 74B / 9B | no disponible | NVIDIA Open Model License | Binario propietario para MinnieTheMoEcher | IQ2_XXS en expertos; ejecucion en 16 GB VRAM + 32 GB RAM |
| NVIDIA Nemotron 3.5 Bolt 74B-A9B (original) | 74B / 9B | no disponible | NVIDIA Open Model License | no disponible | Modelo base `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB`; pesos originales no detallados en la informacion |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene pesos en formatos estándar (safetensors, GGUF); la única vía de ejecución documentada es el motor MinnieTheMoEcher, lo que limita la portabilidad y la integración con ecosistemas habituales como vLLM, llama.cpp u Ollama.
- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- La longitud de contexto no está publicada, lo que impide planificar con precisión cargas de trabajo con ventanas largas.
- La cuantización IQ2_XXS de los expertos enrutados implica una pérdida de precisión significativa frente a los pesos originales; no se han publicado evaluaciones de degradación de calidad.
- No se han publicado benchmarks de calidad ni evaluaciones de sesgo, alucinación o robustez; el uso en producción requiere validación propia.
- La licencia NVIDIA Open Model License Agreement impone condiciones específicas para uso comercial que deben revisarse en el enlace oficial antes de desplegar el modelo.
- El rendimiento declarado (13,51 tok/s decode, 3,86x frente a llama.cpp) procede del autor y no ha sido verificado de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que puede indicar que los archivos no están efectivamente alojados o que la información de HuggingFace no refleja el contenido real.
- El modelo base pertenece a NVIDIA; esta distribución es un reempaquetado de terceros, por lo que la trazabilidad y el soporte dependen del autor del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TinoBruno/moecher-nemotron-3.5-bolt-24gb
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Licencia NVIDIA Open Model License Agreement: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
