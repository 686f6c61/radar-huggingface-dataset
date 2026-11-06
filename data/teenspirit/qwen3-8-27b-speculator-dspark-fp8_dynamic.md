# TeenSpirit/Qwen3.8-27B-speculator.dspark-FP8_DYNAMIC

## Resumen

Este repositorio contiene una re-cuantización en FP8 (W8A8) de `RedHatAI/Qwen3.8-27B-speculator.dspark`, el modelo borrador (speculator o draft model) asociado a `Qwen/Qwen3.8-27B` dentro del esquema de decodificación especulativa DSpark. No es un modelo generativo autónomo: es un drafter de aproximadamente 1.990 millones de parámetros que propone tokens candidatos que el verificador Qwen3.8-27B valida en cada paso de decodificación. Su función es acelerar la inferencia del modelo grande sin alterar la distribución de salida, y su utilidad se mide en longitud de aceptación (acceptance length, AL) y no en benchmarks de calidad lingüística.

La aportación de esta versión concreta, publicada por el usuario TeenSpirit como re-cuantización comunitaria y no como release de Red Hat, es reducir el peso del checkpoint de 4,0 GB a 2,1 GB manteniendo las proyecciones de atención y MLP en FP8 e4m3, con escalas simétricas por canal en pesos y dinámicas por token en activaciones. Según la model card, la longitud de aceptación media en Spec-Bench es idéntica a la del original en bf16 (4,35 con decodificación greedy y 3,40 con sampling), con una diferencia por prompt de −0,017 ± 0,030 tokens por paso de verificación, estadísticamente no significativa.

Es relevante para equipos que ya sirven Qwen3.8-27B con vLLM y quieren recortar el coste de memoria del drafter sin recalibrar ni reentrenar nada: la cuantización es round-to-nearest sin datos de calibración y el único cambio respecto al checkpoint base es el formato de almacenamiento de las proyecciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speculator (draft model) DSpark con cabezas `markov_head` y `confidence_head`; transformer con proyecciones de atención y MLP cuantizadas |
| Parametros totales | 1.988.431.617 (1,86 B en módulos cuantizados; 1,99 B totales) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del verificador Qwen3.8-27B; no especificada en la información) |
| Tipos de cuantizacion | FP8 e4m3 W8A8: pesos simétricos con escala por canal, activaciones dinámicas por token; cabezas y normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del checkpoint base) |
| Formato de pesos | safetensors con `compressed-tensors` (`float-quantized`), `custom_code`; requiere librería `speculators` |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa del esquema DSpark, pensado para emparejarse con el verificador denso Qwen3.8-27B. La arquitectura y el entrenamiento son íntegramente los del checkpoint base `RedHatAI/Qwen3.8-27B-speculator.dspark`; esta versión no introduce cambios de arquitectura ni reentrenamiento, solo modifica el formato de almacenamiento de las proyecciones. El modelo incorpora dos cabezas específicas, `markov_head` y `confidence_head`, que se mantienen en bf16 junto con todas las normas, y que presumiblemente gobiernan la propuesta de tokens y la estimación de confianza del drafter (los detalles de entrenamiento no se detallan en la información disponible).

La cuantización se aplica a todos los módulos `layers.*.self_attn.{q,k,v,o}_proj`, `layers.*.mlp.{gate,up,down}_proj` y a la capa `fc`, es decir, 1,86 B de los 1,99 B de parámetros. Se usa el método round-to-nearest con escalas min/max, sin datos de calibración, mediante las primitivas de `compressed-tensors` (`apply_quantization_config` → escalas min/max → `ModelCompressor.compress_model`), siguiendo su ejemplo `examples/compress_w4a16.py`. El error relativo de Frobenius medio por capa es del 2,7 %. La lista de exclusión emplea expresiones regulares (`re:.*markov_head.*`, `re:.*confidence_head.*`, etc.) para que coincidan tanto con los nombres del checkpoint como con los nombres de módulo con prefijo `model.` de vLLM. Los detalles completos están en `ptq_rtn_stats.json`.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: no produce respuestas finales por sí mismo, sino propuestas que el verificador Qwen3.8-27B acepta o rechaza.
- Aceleración de inferencia del verificador: con 7 tokens especulativos alcanza longitudes de aceptación medias de 4,35 (greedy) y 3,40 (sampling) en Spec-Bench.
- Compatibilidad con modos de razonamiento del verificador: las mediciones se realizaron con thinking habilitado, incluido el subconjunto de razonamiento matemático (AL de 5,41 en greedy).
- Soporte multilingüe indirecto: el subconjunto de traducción de Spec-Bench muestra AL de 4,41 en greedy, aunque los idiomas concretos soportados no se detallan.
- Integración nativa con vLLM mediante `--speculative-config` y el método `dspark`.
- Ejecución de las proyecciones cuantizadas con `CompressedTensorsW8A8Fp8` (GEMM FP8 escalado con CUTLASS) en hardware Hopper.
- No dispone de tool calling, capacidades de agente ni visión propias; esas funciones residen en el modelo verificador.

## Casos de uso

- Aceleración de un despliegue existente de Qwen3.8-27B en vLLM: se añade el drafter con `--speculative-config '{"model":"TeenSpirit/Qwen3.8-27B-speculator.dspark-FP8_DYNAMIC","num_speculative_tokens":7,"method":"dspark"}'` y se obtiene una media de 4,35 tokens aceptados por paso de verificación en greedy, lo que reduce el número de pasos del modelo grande.
- Servicio de chat interactivo con thinking activado: el subconjunto de preguntas de MT-Bench mantiene AL de 3,71 en greedy y 2,90 en sampling, adecuado para turnos conversacionales donde prima la latencia percibida.
- Generación de código y razonamiento matemático en pipelines de CI: el subconjunto `math_reasoning` alcanza la AL más alta de la batería (5,41 en greedy, 4,43 en sampling), por lo que es el escenario donde más se amortiza el coste del drafter.
- Traducción automática por lotes: AL de 4,41 en greedy y 3,44 en sampling en el subconjunto de traducción, útil en procesos de traducción de documentos donde el verificador trabaja con `max_tokens` altos.
- Resumen de documentos largos: AL de 3,86 en greedy en el subconjunto de summarization, con la ventaja de que el drafter ocupa solo 2,1 GB frente a los 4,0 GB del bf16, liberando memoria para el verificador o para aumentar el batch.
- RAG en producción: AL de 4,65 en greedy y 3,46 en sampling en el subconjunto `rag`, escenario de recuperación aumentada con prompts largos donde la decodificación especulativa reduce el tiempo total de respuesta.
- Despliegue con restricciones de memoria en GPU Hopper: al almacenar las proyecciones en FP8, el checkpoint cabe en 2,1 GB y permite servir el drafter junto al verificador en una sola GPU H20 con concurrencia 64, como se documenta en las pruebas.

## Benchmarks y rendimiento

Resultados de longitud de aceptación (AL) en Spec-Bench, subconjuntos de `RedHatAI/speculator_benchmarks` con 80 prompts cada uno, verificador denso `Qwen/Qwen3.8-27B` en bf16, vLLM 0.33.0, 1× H20, 7 tokens especulativos, thinking habilitado, `max_tokens` 4096 y concurrencia 64. Los valores bf16 son una remedición propia del checkpoint base en idénticas condiciones.

Decodificación greedy (temperatura 0):

| Dataset | bf16 AL | FP8 AL | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| question (MT-Bench) | 3,73 | 3,71 | 78,4 % | 58,5 % | 43,6 % | 32,2 % | 24,5 % | 19,0 % | 14,9 % |
| translation | 4,44 | 4,41 | 84,0 % | 68,4 % | 55,8 % | 44,8 % | 36,0 % | 29,0 % | 22,8 % |
| summarization | 3,83 | 3,86 | 81,3 % | 63,4 % | 48,5 % | 36,1 % | 25,9 % | 18,0 % | 12,7 % |
| qa | 4,16 | 4,04 | 78,7 % | 62,1 % | 48,9 % | 38,8 % | 31,1 % | 24,8 % | 19,9 % |
| math_reasoning | 5,36 | 5,41 | 89,6 % | 79,8 % | 70,1 % | 61,5 % | 53,5 % | 46,2 % | 40,1 % |
| rag | 4,59 | 4,65 | 84,9 % | 70,4 % | 58,2 % | 48,5 % | 40,5 % | 34,1 % | 28,7 % |
| media | 4,35 | 4,35 | — | — | — | — | — | — | — |

Sampling (temperatura 1,0, top_p 0,95, top_k 20):

| Dataset | bf16 AL | FP8 AL |
|---|---:|---:|
| question | 2,94 | 2,90 |
| translation | 3,44 | 3,44 |
| summarization | 3,20 | 3,30 |
| qa | 2,93 | 2,89 |
| math_reasoning | 4,38 | 4,43 |
| rag | 3,45 | 3,46 |
| media | 3,39 | 3,40 |

Comparación pareada por prompt de tokens de salida por paso de verificación (480 prompts): FP8 menos bf16 de −0,017 ± 0,030 en greedy y −0,003 ± 0,041 en sampling, con un 95 % de confianza. El coste de la cuantización no es medible a esta escala. No se han publicado resultados de benchmarks de calidad lingüística (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un generador autónomo.

## Requisitos de hardware

- VRAM para inferencia: 2,1 GB de pesos en FP8, frente a 4,0 GB del original en bf16; hay que sumar la memoria del verificador Qwen3.8-27B y la caché KV del contexto y del batch.
- GPU validadas: NVIDIA H20 (Hopper), con vLLM 0.33.0 y `CompressedTensorsW8A8Fp8` (CUTLASS FP8 scaled GEMM). No se documentan pruebas en otras GPU.
- GPU consumer: no se han publicado pruebas en RTX 4090 u otras consumer; el soporte depende de que vLLM y CUTLASS habiliten FP8 en esa arquitectura, dato no disponible.
- Despliegue: vLLM 0.33.0 con `--speculative-config` y `method: dspark`; requiere la librería `speculators` y `compressed-tensors`. No se mencionan llama.cpp, Ollama ni TGI.
- Configuración de referencia: 7 tokens especulativos, thinking habilitado, `max_tokens` 4096, concurrencia 64 en una sola H20.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; la métrica reportada es la longitud de aceptación (media de 4,35 en greedy y 3,40 en sampling).

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | AL media (greedy) | Licencia |
|---|---|---:|---:|---:|---|
| TeenSpirit/Qwen3.8-27B-speculator.dspark-FP8_DYNAMIC | 1,99 B | FP8 W8A8 (compressed-tensors) | 2,1 GB | 4,35 | Apache 2.0 |
| RedHatAI/Qwen3.8-27B-speculator.dspark (base bf16) | 1,99 B | bf16 | 4,0 GB | 4,35 (remedido) | Apache 2.0 |

No se dispone en la información proporcionada de otros drafters comparables (por ejemplo, de otros esquemas de decodificación especulativa o de otras familias) con los que establecer una comparación de parámetros, contexto o rendimiento; ese dato se considera no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse de forma autónoma para responder peticiones, sino únicamente como drafter emparejado con el verificador Qwen3.8-27B y el método `dspark`.
- Re-cuantización comunitaria: no es un release de Red Hat; la arquitectura y el entrenamiento son del checkpoint base, y solo cambia el formato de almacenamiento de las proyecciones.
- La cuantización introduce un error relativo de Frobenius medio del 2,7 % por capa; aunque el impacto medido en AL no es significativo, no se han evaluado otros dominios fuera de los seis subconjuntos de Spec-Bench.
- Solo se ha validado en vLLM 0.33.0 sobre una NVIDIA H20; el comportamiento en otras versiones de vLLM, otras GPU o backends alternativos no está documentado.
- Requiere `custom_code` y la librería `speculators`; no es cargable con herramientas que no soporten `compressed-tensors` ni el esquema DSpark.
- Los idiomas soportados no están especificados; el rendimiento multilingüe solo está medido de forma agregada en el subconjunto de traducción de Spec-Bench.
- No hay datos publicados sobre sesgos, tasa de alucinación ni robustez, ya que estas propiedades dependen del verificador y no del drafter.
- Licencia Apache 2.0 heredada, sin restricciones adicionales conocidas para uso comercial; conviene verificar igualmente los términos del checkpoint base y del verificador Qwen3.8-27B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeenSpirit/Qwen3.8-27B-speculator.dspark-FP8_DYNAMIC
- Modelo base (drafter bf16): https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Verificador: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de benchmarks: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Librería compressed-tensors: https://github.com/vllm-project/compressed-tensors
