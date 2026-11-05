# yushengsu/Qwen3-8B-5layer-MoE-8E1A-v1

## Resumen

Qwen3-8B-5layer-MoE-8E1A-v1 es un modelo borrador (*draft model*) para decodificación especulativa del modelo denso Qwen/Qwen3-8B, publicado por el usuario yushengsu. No es un modelo de chat ni un modelo generalista: su única función es proponer tokens candidatos que el modelo objetivo Qwen3-8B verifica en cada paso, acelerando así la generación sin alterar la distribución de salida del modelo grande. Emplea el algoritmo DSpark de SGLang y una arquitectura transformer de 5 capas con FFN de mezcla de expertos.

La innovación principal respecto al borrador denso de referencia (jiapingW/Qwen3-8b-dspark-SpecForge) es la sustitución de la FFN densa de anchura 12288 por 8 expertos enrutados de 1536 cada uno, con activación de un solo experto por token (8E1A) y sin experto compartido. El tamaño total de la FFN se mantiene, pero cada token solo recorre 1/8 de sus pesos, lo que reduce el coste computacional por paso de borrador a costa de una ligera pérdida de longitud de aceptación.

El checkpoint final (`run2/ep10/`) ocupa 2,25 GB en bf16 y se sirve como `Qwen3MoeDSparkModel` dentro de SGLang junto al modelo objetivo. Está pensado para despliegues de inferencia de Qwen3-8B donde el coste del borrador importa, y su interés radica en que demuestra que un borrador MoE puede igualar prácticamente a uno denso en aceptación con menor cómputo por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DSpark de 5 capas con FFN de mezcla de expertos (8 expertos enrutados, 1 activo por token, sin experto compartido); clase `Qwen3MoeDSparkModel` |
| Parametros totales | No disponible (repo de 261,4 GB con 116 checkpoints; el checkpoint final pesa 2,25 GB en bf16) |
| Parametros activos | 1 de 8 expertos por token en la FFN (8E1A); dimension de experto 1536 |
| Longitud de contexto | No disponible como modelo autonomo; en evaluacion se uso contexto de 16384 tokens y max_new_tokens 2048 |
| Tipos de cuantizacion | No disponible (checkpoint publicado en bf16) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (bf16), junto con config.json, tokenizer.json, tokenizer_config.json y chat_template.jinja |
| Modelo base / objetivo | Qwen/Qwen3-8B |
| Hidden size | 4096 |
| Cabezas de atencion | 32 query / 8 KV |
| Block size de especulacion | 16 (por defecto) y 7 (evaluado tambien) |

## Arquitectura y entrenamiento

El borrador es un transformer de 5 capas con hidden 4096 y atencion con 32 cabezas de query y 8 de clave/valor. La FFN es la pieza diferenciadora: 8 expertos enrutados de 1536 dimensiones cada uno, con enrutamiento top-1 por token (8E1A) y sin experto compartido. Esto mantiene el mismo tamaño total de FFN que el borrador denso de jiapingW (anchura 12288), pero cada token solo ejecuta 1/8 de esos pesos. Se sirve mediante el algoritmo DSPARK de SGLang, que requiere la clase `Qwen3MoeDSparkModel` y el soporte de FFN MoE para DSpark (sgl-project/sglang#47181) o, en versiones anteriores, el paquete externo `specforge.serving.sglang_models`.

El entrenamiento sigue el protocolo de jiapingW: datos PerfectBlend regenerados por Qwen3-8B en modo no-thinking, temperatura 0, a partir de `yaro1214/open_data` (1,42 M conversaciones, max_length 8192); batch global 132, AdamW con lr 6e-4 y decaimiento coseno con 4 % de warm-up, pérdida DSpark CE 0.1 / L1 0.9, bloque de entrenamiento 16, 512 anclas y sin cabeza de confianza. Se realizaron dos ejecuciones: run1 entrenó 6 épocas desde cero (64.584 pasos, 10.764 por época) y run2 se inicializó desde `run1/ep6/` y entrenó 4,4 épocas más, deteniéndose en el paso 47.000 al estabilizarse la longitud de aceptación. El checkpoint final es `run2/ep10/` (paso 43.056, 10 épocas totales), el de mayor longitud de aceptación agrupada de los 116 checkpoints evaluados.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B; no es un modelo de generación autónoma.
- Aceleración de inferencia mediante verificación en bloque (block size 16 o 7) con el algoritmo DSPARK de SGLang.
- Enrutamiento MoE top-1 por token en la FFN, con 8 expertos de 1536 dimensiones.
- Compatibilidad con decodificación especulativa en SGLang con kernels fused-MoE ajustados para E=8, N=1536.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento propios: hereda el comportamiento del modelo objetivo Qwen3-8B, que es quien genera y verifica.
- Capacidades multilingües: no documentadas para el borrador; dependen del tokenizador y del modelo objetivo.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: desplegar el borrador junto al modelo objetivo en SGLang con `--speculative-algorithm DSPARK` para reducir la latencia por token en cargas interactivas, aprovechando que cada paso de borrador recorre solo 1/8 de la FFN.
- Servicio de chat de baja latencia: con contexto de hasta 16384 tokens y block size 7, el borrador mantiene una longitud de aceptación prácticamente idéntica a la del borrador denso (diferencia del −0,5 % agrupada), adecuado para asistentes conversacionales multi-turno.
- Generación de código asistida: en tareas HumanEval y MBPP el borrador alcanza longitudes de aceptación de 7,519 y 6,967 con block 16, por lo que resulta útil en IDE y autocompletado donde priman la latencia y el throughput.
- Razonamiento matemático y resolución de problemas: en GSM8K y MATH500 registra 9,706 y 9,504 de longitud de aceptación con block 16, lo que lo hace apto para pipelines de evaluación o tutoría matemática sobre Qwen3-8B.
- Despliegue con restricciones de cómputo del borrador: al activar solo 1/8 de la FFN por token, es una opción cuando el coste del modelo borrador es el cuello de botella y se dispone de kernels fused-MoE para E=8, N=1536.
- Investigación en decodificación especulativa: el repo incluye 116 checkpoints con métricas de aceptación por paso, útil para estudiar la relación entre épocas de entrenamiento, tamaño de bloque y longitud de aceptación.
- Benchmarking de infraestructura: sirve para medir el rendimiento de SGLang con DSPARK MoE en una H200 (TP=1) a concurrencias de 8 a 256, donde el borrador rinde entre −0,2 % y +3,5 % de los tokens/s del borrador denso.

## Benchmarks y rendimiento

Longitud de aceptación (tokens aceptados por paso de verificación, media por petición) con block 16, temperatura 0, thinking off, max_new_tokens 2048, contexto 16384 y radix cache desactivada, sobre 2.400 peticiones (gsm8k 1.319, math500 500, humaneval 164, mbpp 257, mt-bench 160):

| Checkpoint | gsm8k | math500 | humaneval | mbpp | mt-bench | Agrupada | Peso igual |
|---|---|---|---|---|---|---|---|
| jiapingW denso (referencia) | 9,971 | 9,600 | 7,551 | 7,059 | 5,239 | 9,101 | 7,884 |
| run1 `ep6/` (punto de warm-start) | 9,695 | 9,501 | 7,389 | 6,914 | 5,187 | 8,899 | 7,737 |
| run2 `ep8/` | 9,575 | 9,325 | 7,259 | 6,718 | 5,140 | 8,763 | 7,603 |
| run2 `step-43000/` | 9,695 | 9,483 | 7,514 | 6,977 | 5,311 | 8,918 | 7,796 |
| **run2 `ep10/` (final)** | **9,706** | **9,504** | **7,519** | **6,967** | **5,265** | **8,925** | **7,792** |
| run2 `step-47000/` (ultimo) | 9,684 | 9,492 | 7,534 | 7,006 | 5,228 | 8,913 | 7,789 |

Con block 7 (gamma 7 / verificación 8):

| Modelo | Agrupada | Peso igual | gsm8k | math500 | humaneval | mbpp | mt-bench |
|---|---|---|---|---|---|---|---|
| jiapingW denso | 6,114 | 5,609 | 6,451 | 6,354 | 5,634 | 5,423 | 4,184 |
| run2 `ep10/` | 6,085 | 5,617 | 6,386 | 6,360 | 5,632 | 5,397 | 4,310 |
| Diferencia | −0,5 % | +0,1 % | −1,0 % | +0,1 % | −0,0 % | −0,5 % | +3,0 % |

Frente al borrador denso, ep10 con block 16 pierde un 1,9 % en la métrica agrupada y un 1,2 % en peso igual (gsm8k −2,7 %, math500 −1,0 %, humaneval −0,4 %, mbpp −1,3 %, mt-bench +0,5 %). Con block 7 la brecha se cierra. En una H200 (TP=1, block 7, cinco tareas mezcladas en un flujo) ep10 sirve entre un −0,2 % y un +3,5 % de los tokens/s del borrador denso a concurrencias de 8 a 256 (+1,9 % a concurrencia 1).

## Requisitos de hardware

- VRAM para el borrador: 2,25 GB en bf16 para el checkpoint final; se suma a la del modelo objetivo Qwen3-8B (aproximadamente 16 GB en bf16).
- GPU recomendadas: H200 para los datos de rendimiento publicados (TP=1); A100 y H100 son opciones razonables por memoria, aunque no hay cifras publicadas para ellas.
- GPU de consumo: el borrador cabe holgadamente en cualquier GPU con 8 GB o más, pero el conjunto borrador + Qwen3-8B en bf16 requiere del orden de 18-20 GB, por lo que una RTX 4090 (24 GB) es el mínimo práctico en consumo; no hay mediciones publicadas en estas GPU.
- Despliegue: SGLang con `--speculative-algorithm DSPARK` y `--speculative-draft-model-path` apuntando al checkpoint; requiere sgl-project/sglang#47181 o el paquete `specforge.serving.sglang_models` en versiones anteriores. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Backend de atención: flashinfer en el ejemplo de serving publicado.
- Latencia y throughput: en H200, TP=1, block 7 y flujo mixto, entre −0,2 % y +3,5 % de tokens/s respecto al borrador denso a concurrencias de 8-256, y +1,9 % a concurrencia 1; no se publican valores absolutos de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / FFN | Contexto | Longitud de aceptacion (agrupada, block 16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-8E1A-v1 (ep10) | Borrador DSpark MoE 8E1A | 5 capas, FFN 8×1536, 1 activo | No disponible (evaluado a 16384) | 8,925 | other | HuggingFace (yushengsu) |
| jiapingW/Qwen3-8b-dspark-SpecForge | Borrador DSpark denso | 5 capas, FFN 12288 | No disponible (evaluado a 16384) | 9,101 | No disponible | HuggingFace (jiapingW) |
| yushengsu/Qwen3-8B-5layer-MoE-8E1A-v2 | Borrador DSpark MoE 8E1A (solo run1) | 5 capas, FFN 8×1536, 1 activo | No disponible | No disponible (checkpoints cada 1196 pasos) | other | HuggingFace (yushengsu) |

El borrador denso de jiapingW es la referencia directa y supera al MoE en aceptación con block 16, pero el MoE ejecuta 1/8 de la FFN por token. La variante v2 del mismo autor es un segundo entrenamiento de la misma arquitectura, limitado a run1, sin métricas de aceptación publicadas en la información disponible.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autónoma: solo funciona como borrador de decodificación especulativa junto a Qwen3-8B en SGLang; no genera respuestas por sí mismo.
- La licencia es "other", heredada del modelo base Qwen/Qwen3-8B; es necesario revisar los términos de Qwen3-8B antes de cualquier uso comercial.
- Dependencia fuerte de una versión concreta de SGLang (PR #47181) o del paquete externo de SpecForge; la compatibilidad con otras versiones o frameworks no está documentada.
- Pérdida de aceptación frente al borrador denso con block 16 (−1,9 % agrupada, hasta −2,7 % en gsm8k); la paridad solo se alcanza con block 7.
- El rendimiento publicado se midió en una H200 con TP=1 y kernels fused-MoE ajustados para E=8, N=1536; no hay datos para otras GPU ni para otros ajustes de kernel.
- El repo ocupa 261,4 GB por contener 116 checkpoints; descargar el repositorio completo es inviable en la mayoría de entornos y conviene limitarse a la carpeta `run2/ep10/`.
- No hay información sobre sesgos, riesgo de alucinación o cobertura idiomática del borrador; estas propiedades dependen del modelo objetivo Qwen3-8B.
- El autor detuvo run2 en el paso 47.000 al estabilizarse la aceptación, por lo que no hay garantía de que entrenamientos más largos no mejoren el resultado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de las métricas publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E1A-v1
- Borrador denso de referencia: https://huggingface.co/jiapingW/Qwen3-8b-dspark-SpecForge
- Codigo y receta de entrenamiento (SpecForge PR #1022): https://github.com/sgl-project/SpecForge/pull/1022
- Segundo entrenamiento de la misma arquitectura (run1): https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E1A-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Soporte DSpark MoE en SGLang: https://github.com/sgl-project/sglang/pull/47181
- Dataset de entrenamiento: https://huggingface.co/datasets/yaro1214/open_data
