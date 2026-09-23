# TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16-fast

## Resumen

Swift-Qwen3.8-27B-Uncensored-W4A16-fast es una cuantización de 4 bits publicada por el usuario TyroneNel sobre d0xin/Swift-Qwen3.8-27B-Uncensored-BF16. Se trata de una variante multimodal (image-text-to-text) derivada de Qwen/Qwen3.8-27B, a la que se le ha fusionado una LoRA de eficiencia de razonamiento (ukisai/Swift-Qwen3.8-27b) y se le ha aplicado una abliteración direccional de rango 1 en la capa 38 que elimina la dirección de rechazo, de modo que el modelo no rehúsa peticiones.

Esta versión concreta ("fast") mantiene el cuerpo del decodificador en W4A16 g128 simétrico (AutoRound) y recuantiza a int4 GPTQ la cabeza `lm_head` y el módulo MTP (multi-token prediction). El resultado reduce el peso en disco de 16,7 GB a 15,8 GB y recorta en unos 0,65 GB la lectura por paso de decodificación. El objetivo declarado es servir el modelo en una única GPU de 24 GB (clase RTX 3090) con la pila HyperQwen sobre vLLM.

El modelo está orientado a inferencia local eficiente con decodificación especulativa, razonamiento y function calling, y solo declara soporte para inglés y chino. En el momento de redactar esta ficha el repositorio no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con módulo MTP (multi-token prediction); ablación direccional de rango 1 en la capa 38 |
| Parámetros totales | 4.298.815.014 (~4,3 B) según los safetensors; el nombre del modelo indica 27 B (discrepancia no aclarada en la model card) |
| Longitud de contexto | no disponible (el benchmark de referencia se ejecutó con MAX_LEN=49.152) |
| Tipos de cuantización | W4A16 g128 simétrico (AutoRound) en el cuerpo; int4 GPTQ g128 simétrico en `lm_head` y módulo MTP; int8 RTN en `embed_tokens`; BF16 en la torre de visión y en las normas |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una variante cuantizada de una familia transformer multimodal. La cadena de derivación documentada es: Qwen/Qwen3.8-27B (licencia Apache 2.0) → ukisai/Swift-Qwen3.8-27b, donde se fusiona una LoRA de eficiencia de razonamiento bajo la Swift Open License v1.0 → d0xin/Swift-Qwen3.8-27B-Uncensored-BF16, que aplica una ablación direccional de rango 1 sobre el flujo residual en la capa 38 (131 de 1.199 tensores modificados, con los tensores de visión intactos) → una cuantización W4A16 con cuerpo int4 g128 simétrico (AutoRound) → este modelo, que recuantiza `lm_head` y el módulo MTP a int4 GPTQ.

El proceso parte de 300.000 estados ocultos capturados de las propias generaciones del modelo y recalibra únicamente `lm_head` (int4 GPTQ g128 simétrico) y las 8 capas lineales del módulo MTP. Frente a la construcción base, el error relativo de `lm_head` sube de 0,0064 (int8 RTN) a 0,1407 (int4 GPTQ), pero medido sobre activaciones reales la divergencia KL respecto al `lm_head` BF16 es de 0,00251 (GPTQ int4) frente a 0,00558 (RTN int4). 65 de los 67 archivos del cuerpo permanecen idénticos byte a byte. El módulo MTP se evaluó en un split reservado con simulación de cadena greedy a 2 posiciones de borrador: 2,269 tokens por paso, concordancia top-1 en primera posición de 0,777 y tasa de aceptación de 0,845 sobre n = 107.063 posiciones. La cabeza de borrador se construye con los 40.960 ids más frecuentes de 6.761 generaciones (4,59 M tokens de salida), con una cobertura del 97,68 % de tokens en el 10 % reservado, frente al 98,18 % de la lista genérica del checkpoint oficial Qwen3.8-27B-W4A16-AutoRound.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo "thinking" (evaluado con thinking off en los benchmarks; el proceso de recolección de datos incluyó 3.119 generaciones con thinking on).
- Visión y lenguaje: pipeline declarado image-text-to-text, con torre de visión preservada en BF16/int8.
- Function calling / tool calling.
- Decodificación especulativa mediante módulo MTP (SPEC=mtp) y soporte de drafters externos (SPEC=dflash2, 7 tokens de borrador).
- Razonamiento multi-paso orientado a agentes.
- Ausencia de rechazos por abliteración (0 rechazos sobre un set fijo de 100 prompts).
- Razonamiento "eficiente": 355 tokens de respuesta de media en GSM8K frente a 379 del AutoRound oficial, con thinking off.

## Casos de uso

- Asistente conversacional local sin censura: el modelo no emite rechazos (0 sobre 100 prompts), por lo que resulta adecuado para entornos controlados donde se necesita respuesta directa sobre temas que otros modelos filtran, siempre que el operador asuma la responsabilidad legal y ética.
- Análisis de imágenes con descripción textual: al ser image-text-to-text y conservar la torre de visión, permite extraer descripciones o responder preguntas sobre una imagen y encadenar el resultado con razonamiento textual.
- Automatización con function calling: las etiquetas declaran soporte de function calling, lo que permite integrarlo en pipelines que invocan APIs o herramientas externas (consultas a bases de datos, ejecución de acciones estructuradas).
- Servicio de inferencia en una sola GPU de 24 GB: con la pila HyperQwen sobre vLLM 0.28.0 el autor alcanza 123,5 tok/s en concurrencia 1 y 242,9 tok/s en concurrencia 4, lo que lo hace viable para despliegues de bajo coste en una RTX 3090.
- Procesamiento por lotes de alto rendimiento: en configuración batch con 64 peticiones concurrentes (128 in / 512 out) el autor reporta 1.045,2 tok/s, adecuado para generación masiva de contenido o enriquecimiento de datasets.
- Razonamiento matemático y de código: la recogida de datos de calibración incluyó prompts de código y GSM8K train, y el modelo deriva de una LoRA de razonamiento; sirve para resolver problemas aritméticos y asistir en programación.
- Investigación sobre abliteración y cuantización: el repositorio documenta el efecto de la ablación de rango 1 y de la recuantización GPTQ con métricas de divergencia KL, útil como referencia metodológica reproducible.

## Benchmarks y rendimiento

Métricas del modelo base heredadas del linaje (no remedidas en esta cuantización):

| Métrica | Resultado |
|---|---|
| Rechazos (100 prompts, d0xin) | 88 respuestas directas, 10 con nota de seguridad, 2 otros fallos, 0 rechazos |
| Capacidad (298 ejemplos, frente a Swift BF16 original) | 39,93 % frente a 38,26 % (+1,68 puntos, McNemar p = 0,44) |
| Divergencia KL `lm_head` int4 GPTQ vs BF16 | 0,00251 |
| Divergencia KL `lm_head` int4 RTN vs BF16 | 0,00558 |
| MTP (2 posiciones, n = 107.063) | 2,269 tokens/paso, top-1 0,777, aceptación 0,845 |
| Cobertura del vocabulario de borrador | 97,68 % (lista propia) frente a 98,18 % (lista genérica) |
| GSM8K | 355 tokens de respuesta de media frente a 379 del AutoRound oficial (thinking off) |

Decodificación single-user en una RTX 3090 (SPEC=dflash2, 7 draft tokens, PREFIX_CACHE=1, KV_MEM=4.529.848.320 (4,22 GiB), MAX_LEN=49.152, T=default / T=0):

| Concurrencia | Este modelo | Base build | AutoRound oficial |
|---|---|---|---|
| C1 | 123,5 / 121,7 | 118,0 / 116,7 | 116,6 / 118,9 |
| C2 | 175,5 / 190,2 | 169,5 / 178,5 | 175,7 / 169,6 |
| C4 | 242,9 / 248,8 | 235,8 / 237,1 | 229,4 / 237,6 |
| C8 | 214,4 / 254,9 | 227,5 / 245,7 | 223,6 / 207,4 |

En C1 se aceptan 3,67 / 3,75 tokens por paso de verificación, con 184 ms de tiempo hasta el primer token. El autor advierte de una variación esperada del 3–5 % entre sesiones.

Batch serving (KV en fp8, sin especulación, 64 concurrentes):

| Fila | Este modelo | Base build |
|---|---|---|
| 128 in / 512 out | 1.045,2 tok/s | 948,9 tok/s (+10 %) |
| 256 in / 256 out | 751,7 tok/s | 701,4 tok/s (+7 %) |
| Prefill / contexto largo | no disponible (tabla truncada en la información proporcionada) | no disponible |

## Requisitos de hardware

- Inferencia en una sola GPU de 24 GB: el autor lo sirve en una RTX 3090 (24 GB) con vLLM 0.28.0 y la pila HyperQwen. Peso en disco de 15,8 GB.
- Memoria para caché KV: el benchmark reservó 4,22 GiB (KV_MEM=4.529.848.320) y comprimió la caché a fp8 en el modo batch.
- GPU recomendadas: cualquier GPU con 24 GB de VRAM o más (RTX 3090, RTX 4090, A100 40/80 GB, H100). El autor solo documenta medidas sobre RTX 3090; no hay datos publicados para otras GPU.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 (24 GB) según la documentación del autor.
- Opciones de despliegue: vLLM 0.28.0 con compressed-tensors y kernels marlin; librería `transformers` declarada en el repositorio; pila HyperQwen (github.com/syv-ai/HyperQwen) para decodificación especulativa. No se menciona soporte para llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: 184 ms de TTFT en C1; 123,5 tok/s en C1, 242,9 tok/s en C4 (single-user) y 1.045,2 tok/s en batch de 64 concurrentes (128 in / 512 out).
- Potencia y entorno: 250 W en el benchmark single-user y 350 W en el batch; ejecutado sobre WSL2 + Docker.
- Módulos opcionales: el módulo MTP y la cabeza de borrador solo intervienen con SPEC=mtp; con otros drafters (dflash2) no se usan.

## Comparativa con modelos similares

| Modelo | Cuantización | Peso en disco | Throughput C1 (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16-fast (este) | W4A16 + int4 GPTQ en lm_head/MTP | 15,8 GB | 123,5 / 121,7 | swift-open-license-1.0 | 0 descargas, 0 likes |
| TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16 (base build) | W4A16 + int8 RTN en lm_head/MTP | 16,7 GB | 118,0 / 116,7 | no disponible | no disponible |
| Qwen3.8-27B-W4A16-AutoRound (oficial) | W4A16 AutoRound | no disponible | 116,6 / 118,9 | no disponible | no disponible |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 | BF16 sin cuantizar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables de otros fabricantes (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado y sin censura: el autor reporta 0 rechazos sobre un set fijo de 100 prompts, lo que implica ausencia de barreras de seguridad y riesgo de generar contenido dañino, ilegal o sesgado.
- Licencia swift-open-license-1.0 (license: other), distinta de la Apache 2.0 del Qwen original: es imprescindible revisar los términos antes de cualquier uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de redactar la ficha, sin validación independiente de la comunidad.
- Discrepancia de tamaño sin aclarar: el nombre del modelo indica 27 B, pero el recuento real de parámetros de los safetensors es 4.298.815.014 (~4,3 B); la model card no explica esta diferencia.
- Contexto nativo no declarado: el valor MAX_LEN=49.152 corresponde a la configuración de servicio del benchmark, no necesariamente al máximo del modelo.
- Idiomas: solo se declaran en y zh. Aunque los datos de calibración incluyeron prompts en danés, no se declara soporte de ese idioma.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad. El error relativo de `lm_head` sube a 0,1407 con int4 GPTQ, si bien la divergencia KL sobre activaciones reales frente a BF16 se mantiene en 0,00251.
- Información incompleta: la model card base está truncada en los datos proporcionados (la tabla de batch termina en "Prefil..."), por lo que faltan resultados de prefill y contexto largo.
- Cuantización simétrica sin zero points en todos los grupos: puede degradar tareas sensibles a valores atípicos.
- Los módulos MTP y de borrador solo aplican a decodificación especulativa; no influyen en la generación estándar y podrían no estar soportados fuera de la pila HyperQwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16-fast
- Base build (W4A16 sin la recuantización "fast"): https://huggingface.co/TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16
- Fuente BF16 (abliterada): https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Modelo intermedio con LoRA de razonamiento: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Pila de inferencia HyperQwen (herramientas `drafter/` y `prepare/`): https://github.com/syv-ai/HyperQwen
- Modelo original de la familia: Qwen/Qwen3.8-27B (referenciado en el linaje; no se proporciona enlace directo)
