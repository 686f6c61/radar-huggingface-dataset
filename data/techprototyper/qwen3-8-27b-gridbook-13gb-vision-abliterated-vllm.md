# TechPrototyper/Qwen3.8-27B-GridBook-13GB-vision-abliterated-vllm

## Resumen

Este checkpoint es un derivado abliterado (sin censura) del modelo cuantizado GridBook de Qwen3.8-27B, publicado por TechPrototyper con licencia Apache 2.0. No es un reentrenamiento: parte del checkpoint cuantizado de rdtand y le trasplanta pesos de un donante BF16 abliterado, recodificándolos sobre la misma malla de cuantización. El resultado conserva la cabecera safetensors bit a bit idéntica a la del padre y el mismo tamaño de archivo; solo cambian 113 de 1363 tensores. Frente al release original de rdtand, esta variante reincorpora la torre de visión (333 tensores, 921.500.008 bytes, BF16, en un archivo `visual.safetensors` independiente) y 15 tensores de cabezas MTP.

El recuento real de parámetros en safetensors es de 13.533.806.192, muy por debajo del "27B" que sugiere el nombre de la ficha. La arquitectura es híbrida (16 capas de atención, 48 capas SSM y 64 MLP) y la cuantización es desigual por diseño: 355 de las 496 capas lineales del cuerpo usan `FP8_CB_K28`, mientras que 42 caen en formatos NVFP4 de 12 a 18 bits de palabra código. La media declarada es de 3,604 bpp en las lineales del cuerpo y 3,855 bpp sobre todas las unidades asignadas.

Su relevancia práctica está en el presupuesto de memoria: con 14,07 GiB de pesos residentes medidos en una RTX 5090 de 32 GB (sm_120), quedan 760.477 tokens de caché KV, se sirven secuencias de hasta 262.144 tokens y se sostienen 2,90 peticiones concurrentes a contexto completo. Es decir, un modelo con torre de visión y contexto de un cuarto de millón de tokens sobre una única GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration; híbrida con 64 capas: 16 de atención, 48 SSM y 64 MLP |
| Parámetros totales | 13.533.806.192 (recuento real en safetensors); el nombre de la ficha indica 27B |
| Parámetros activos | no aplica (no es un modelo MoE; es una arquitectura híbrida atención/SSM) |
| Longitud de contexto | 262.144 tokens de secuencia máxima servida (presupuesto de caché KV medido de 760.477 tokens en RTX 5090) |
| Tipos de cuantización | GridBook (`quant_method=gridbook`, `format=nvfp4_cb`, `layout_version=2`, contrato `nvfp4_w4a4`); escalera por capa: FP8_CB_K28 (355), FP8_CB_K48 (94), NVFP4_CB_K16 (20), NVFP4_CB_K12 (8), NVFP4_CB_K14 (8), NVFP4_CB_K18 (6), FP8_CB_K32 (4), FP8_CB_K40 (1); `lm_head` en FP8 E4M3 con escala por fila; `model.embed_tokens` y torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cabecera idéntica a la del checkpoint padre), `visual.safetensors` separado, codebooks en `cb_codebooks.pqcb`; librería declarada: vllm |
| Precisión media | 3,604 bpp en las 496 lineales del cuerpo; 3,855 bpp sobre todas las unidades asignadas |
| Configuración de cuantización | 9 grupos de configuración, 224 entradas `ignore`, 128 módulos objetivo de abliteración |
| Tensores | 1363 en total; 113 modificados respecto al padre; 333 de la torre de visión; 15 de cabezas MTP |
| Tamaño del repositorio | 15,7 GB |
| Pipeline | image-text-to-text |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-03 |

## Arquitectura y entrenamiento

No hay entrenamiento desde cero: el modelo es un derivado. La arquitectura del contenedor es `Qwen3_5ForConditionalGeneration`, un transformer híbrido de 64 capas en el que conviven 16 capas de atención, 48 capas de modelo de espacio de estados (SSM) y 64 MLP. La cuantización se declara con `quant_method=gridbook`, `format=nvfp4_cb`, `layout_version=2`, 9 grupos de configuración y 224 entradas `ignore`; los codebooks viven en `cb_codebooks.pqcb` y el contrato de ejecución es `nvfp4_w4a4`. La torre de visión se transporta como `visual.safetensors` en BF16 (333 tensores, 921.500.008 bytes) y no participa en la edición de abliteración.

El procedimiento es una abliteración en formato. El donante es un modelo BF16 abliterado de `Qwen/Qwen3.8-27B` generado con Heretic en modo ARA (ablación direccional de rango 1, con adaptadores PEFT reales fusionados a BF16 denso). El conjunto objetivo son los 128 módulos que escriben en el flujo residual: `o_proj` (16, atención), `out_proj` (48, SSM) y `down_proj` (64, MLP). De esos 128, solo 15 se sitúan en mallas gruesas (`NVFP4_CB_K12/14/16`, `FP8_CB_K32/K40`); la model card se trunca al detallar el resto. En lugar de recuantizar, los pesos del donante se recodifican sobre la malla original, de modo que se mantienen los mismos codebooks, el mismo ancho de palabra código por tensor, el mismo número de bytes por superbloque y el mismo renderer.

El autor justifica la decisión con dos mediciones. Primero, reejecutar un asignador sobre pesos cambiados produce un modelo distinto con el mismo presupuesto: en el modelo hermano basado en Gemma, a 6,000 bpp idénticos, el asignador eligió 246/116/48 tensores en lugar de los 234/135/41 desplegados. Segundo, la cuantización no destruye la abliteración: un donante BF16 abliterado puntuó 33 rechazos duros y ese mismo donante recuantizado puntuó 24, medidos sobre una misma ruta de API, un mismo conjunto de prompts y un mismo clasificador.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Entrada de imagen y texto (`image-text-to-text`) mediante la torre de visión BF16 incluida.
- Contexto largo operativo: en la prueba needle-in-haystack obtuvo 3/3 a 32k (28.889 tokens) y 3/3 a 128k (115.436 tokens).
- Reducción del comportamiento de rechazo por abliteración sobre los módulos que escriben en el flujo residual; el autor lo etiqueta como uncensored.
- Cabezas MTP presentes (15 tensores). La información disponible no detalla su función ni si se emplean para decodificación especulativa.
- Soporte de tool calling o function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible; no se declaran idiomas en la ficha.
- Modo thinking explícito: no disponible en la información.

## Casos de uso

- Despliegue local de contexto largo en una sola GPU de consumo: con 14,07 GiB de pesos residentes en una RTX 5090 de 32 GB y 760.477 tokens de presupuesto de caché KV, se pueden mantener conversaciones o análisis de documentos de cientos de miles de tokens sin repartir el modelo entre varias tarjetas.
- Análisis de documentación extensa y RAG de gran volumen: los 262.144 tokens de secuencia máxima permiten insertar contratos, expedientes o bases de código completas en una única petición, con recuperación fiable demostrada a 128k.
- Procesamiento de imágenes junto a texto: la torre de visión permite tareas de descripción, extracción de información o preguntas sobre imágenes en la misma llamada, aunque no hay evaluaciones publicadas de calidad en visión.
- Investigación sobre cuantización extrema: el checkpoint sirve para estudiar cuánta degradación introduce una escalera de 12 a 48 bits de palabra código frente a FP8 uniforme, y para reproducir el método de edición en formato sobre una malla ya validada.
- Red teaming y evaluación de alineación: al ser un derivado abliterado, es un artefacto útil para medir la eficacia de la ablación direccional y comparar tasas de rechazo, siempre en un entorno aislado y no orientado a usuarios finales.
- Servicio con vLLM y concurrencia moderada: la medición de 2,90 peticiones simultáneas a contexto completo con caché KV en NVFP4 permite planificar un endpoint de baja concurrencia y contexto muy alto en hardware de gama de consumo.
- Prototipado con presupuesto de VRAM ajustado: sustituye a un despliegue BF16 de aproximadamente 54 GB en la fase de validación funcional, a cambio de asumir la pérdida de fidelidad de la cuantización.

## Benchmarks y rendimiento

| Prueba | Configuración | Resultado |
|---|---|---|
| Needle-in-haystack a 32k | Profundidades 0,1 / 0,5 / 0,9; 28.889 tokens | 3/3 (6,1–6,8 s) |
| Needle-in-haystack a 128k | 115.436 tokens | 3/3 (35,3–39,5 s) |
| Concurrencia a contexto completo | Presupuesto de 760.477 tokens de KV | 2,90× |
| Precisión media, lineales del cuerpo | 496 lineales | 3,604 bpp |
| Precisión media, todas las unidades | Unidades asignadas | 3,855 bpp |
| Pesos residentes en VRAM | RTX 5090, 32 GB, sm_120, torre de visión cargada, KV en NVFP4 | 14,07 GiB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks académicos estándar en la información disponible. Tampoco hay comparación numérica de calidad frente a `Qwen/Qwen3.8-27B` en BF16 ni frente al checkpoint padre sin abliterar.

## Requisitos de hardware

- VRAM estimada: 14,07 GiB de pesos residentes medidos con la torre de visión cargada. El repositorio ocupa 15,7 GB en disco.
- GPU validada: una RTX 5090 de 32 GB (sm_120), con caché KV en NVFP4 y 760.477 tokens de presupuesto.
- El nombre del checkpoint padre (`...gridbook-13GB-5080-vllm`) referencia una configuración con RTX 5080; no se aportan mediciones de este derivado en esa tarjeta.
- Compatibilidad con GPUs de 24 GB: no disponible; no hay mediciones publicadas para ese perfil.
- Despliegue: vLLM con el plugin out-of-tree GridBook de Rob Tand. El formato `gridbook` / `nvfp4_cb` y el contrato `nvfp4_w4a4` no son compatibles con vLLM estándar sin ese plugin. La propia model card declara `inference: false`.
- Otras opciones (llama.cpp, Ollama, TGI): no disponible; el formato de codebooks propietario no está documentado para esos motores en la información proporcionada.
- Latencia: en las pruebas needle-in-haystack, 6,1–6,8 s a 32k (28.889 tokens) y 35,3–39,5 s a 128k (115.436 tokens).
- Throughput en tokens por segundo: no disponible. Solo se publica la concurrencia relativa de 2,90× a contexto completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TechPrototyper/Qwen3.8-27B-GridBook-13GB-vision-abliterated-vllm | 13.533.806.192 (recuento real) | 262.144 servidos; 760.477 tokens de KV | Sí (333 tensores, 921.500.008 B, BF16) | apache-2.0 | 0 descargas, 0 likes |
| rdtand/Qwen3.8-27B-PrismaAQUA-gridbook-13GB-5080-vllm | no disponible | no disponible | No (eliminada; solo texto) | no disponible en la información | no disponible |
| Qwen/Qwen3.8-27B (base) | El nombre indica 27B; la model card menciona unos 54 GB en BF16 | no disponible | no disponible | no disponible en la información | no disponible |

No hay datos públicos de benchmarks que permitan comparar calidad entre estos tres artefactos. Las diferencias documentadas son de contenido y formato: el modelo base es BF16 sin cuantizar, el checkpoint de rdtand elimina visión y cabezas MTP, y este derivado los reincorpora y añade la abliteración en formato.

## Limitaciones y advertencias

- Es un modelo abliterado: su alineación de seguridad está deliberadamente reducida. No debe exponerse a usuarios finales sin filtros adicionales, y su uso en producción orientada al público implica riesgos de contenido inapropiado.
- No se han publicado evaluaciones estándar (MMLU, HumanEval, GSM8K) ni comparaciones de calidad frente al modelo base, por lo que el impacto real de la abliteración y de la cuantización sobre las capacidades generales es desconocido.
- El checkpoint acumula 0 descargas y 0 likes, y fue creado y actualizado en octubre de 2026; no existe validación independiente por parte de la comunidad.
- La model card está truncada: la descripción del conjunto objetivo se corta en "13 of", de modo que no se detalla por completo qué tensores en mallas gruesas quedaron excluidos de la edición.
- La abliteración solo cubre los 128 módulos que escriben en el flujo residual (16 `o_proj`, 48 `out_proj`, 64 `down_proj`). La torre de visión no se modifica en absoluto, por lo que no se puede asumir un comportamiento descensor en la ruta multimodal.
- Parte de los tensores están cuantizados en formatos muy agresivos (`NVFP4_CB_K12`, `NVFP4_CB_K14`), con la pérdida de fidelidad que eso implica en las capas afectadas.
- La inferencia depende de un plugin out-of-tree (GridBook) y de un contrato de ejecución específico. La propia model card marca `inference: false`, lo que apunta a que no funciona con vLLM sin esa extensión.
- Los idiomas soportados no están declarados, así que no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- El nombre de la ficha indica 27B mientras que el recuento real de parámetros es de 13,5B; conviene no usar el nombre como referencia de tamaño.
- Riesgo de alucinación y sesgos: no medidos ni documentados en la información disponible. La licencia del derivado es apache-2.0, pero la cadena de modelos base (`Qwen/Qwen3.8-27B` y el checkpoint de rdtand) no declara condiciones en esta ficha, por lo que conviene verificarlas antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechPrototyper/Qwen3.8-27B-GridBook-13GB-vision-abliterated-vllm
- Checkpoint padre: https://huggingface.co/rdtand/Qwen3.8-27B-PrismaAQUA-gridbook-13GB-5080-vllm
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor de la cuantización: https://huggingface.co/rdtand
- Plugin GridBook para vLLM: https://github.com/RobTand/gridbook
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
