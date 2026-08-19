# True2456/Qwen3.8-27B-AWQ-5.0bpw

## Resumen

`True2456/Qwen3.8-27B-AWQ-5.0bpw` es una cuantización AWQ (activación-aware) del modelo denso `Qwen/Qwen3.8-27B`, un modelo de visión-lenguaje de 27.800 millones de parámetros con arquitectura híbrida GatedDeltaNet + atención completa, 64 capas, contexto de 256.000 tokens y cabeza de decodificación especulativa MTP. El autor, True2456, ha calibrado esta versión con datos multimodales (texto, gráficos, fotografías y renders GLSL) para que la torre de visión quede correctamente cuantizada, y la ha empaquetado en formato oMLX para ejecutarse en Apple Silicon.

El resultado es un checkpoint de 17,36 GB (3,2 veces más pequeño que el bf16 original) que mantiene el peso de la cabeza MTP para permitir decodificación especulativa nativa en oMLX. La elección de group size 64 en las capas MLP es clave: activa el kernel NAX de oMLX y consigue velocidades de prefill cercanas a las del modelo sin parchear, sin necesidad de desactivar rutas de kernel. Este build no ha sido evaluado formalmente; el autor remite al build hermano de 4,85 bpw para cifras de calidad medidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet + atención completa, 64 capas, densa, con torre de visión y cabeza MTP |
| Parametros totales | 27.800 millones (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | AWQ 5,0 bpw (group size 64); capas mixtas 4/5/6/8-bit; algunos módulos en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (formato oMLX/MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 64 capas que combina una capa de atención completa con bloques GatedDeltaNet, un mecanismo de atención lineal con puerta que reduce el coste computacional en secuencias largas. Incluye una torre de visión para entrada de imágenes y una cabeza MTP (multi-token prediction) que actúa como drafter en decodificación especulativa. El contexto nativo es de 256.000 tokens.

La cuantización AWQ se realizó de forma secuencial sobre el MLP denso: cada capa se calibra con las activaciones de las capas ya cuantizadas por encima. El resto de componentes (GDN, atención, embeddings, lm_head, torre de visión y MTP) se asignaron con RTN a los anchos indicados en la tabla de componentes. La calibración usó 352 prompts × 1024 tokens (234.477 tokens reales) renderizados con la plantilla de chat de Qwen, con una división 50/50 entre modos think y nothink, e incluyó imágenes: 66% texto (código, tool use, agentes, razonamiento), 11% gráficos (ChartQA), 11% fotografías naturales (VQAv2) y 11% renders GLSL/raymarching. Esta calibración multimodal es la diferencia principal frente al build de 4,85 bpw, que no ejercitó la torre de visión.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`reasoning_effort` en `xhigh`, `medium` o `low`).
- Comprensión de imágenes: gráficos, fotografías y renders, gracias a la torre de visión calibrada.
- Generación de código y soporte de tool calling / function calling (incluido en el dominio de calibración).
- Uso agéntico y razonamiento multi-paso (también cubierto en la calibración).
- Decodificación especulativa nativa vía cabeza MTP, con verificación por rejection sampling.
- Multilingüismo: no especificado en la documentación disponible.

## Casos de uso

- Asistentes de análisis de documentos técnicos: el modelo puede procesar imágenes de gráficos y tablas (ChartQA) y razonar sobre ellos con contexto de hasta 256K tokens, lo que permite consultar manuales extensos con figuras.
- Generación de código en entornos de desarrollo integrado en Apple Silicon: con soporte de tool calling y modo agéntico, puede integrarse en pipelines de CI/CD o asistentes de programación que necesiten ejecutar herramientas y leer su salida.
- Automatización de atención al cliente multimodal: al aceptar entrada de imagen y texto, puede clasificar capturas de pantalla, logs o fotos de productos y responder en conversaciones multi-turno con historial largo.
- Análisis de renders y gráficos 3D: la calibración incluye renders GLSL/raymarching, lo que lo hace adecuado para inspeccionar resultados de shaders o imágenes sintéticas en flujos de trabajo de gráficos por computador.
- Razonamiento matemático y científico con soporte visual: puede resolver problemas que combinan enunciados textuales con diagramas o fórmulas renderizadas.
- Prototipado de agentes autónomos en macOS: gracias a la decodificación especulativa MTP y a la baja huella de memoria (17,4-19,9 GB), puede ejecutarse localmente en un Mac con M5 Max para experimentar con flujos agénticos de razonamiento largo.

## Benchmarks y rendimiento

Este build no ha sido evaluado formalmente. El autor indica que el build hermano de 4,85 bpw obtuvo los siguientes resultados, cuatro preguntas por debajo del bf16 en un total de 564:

| Benchmark | 4,85 bpw (hermano) | bf16 (referencia) |
|---|---|---|
| HumanEval | 93,3 | no disponible |
| GSM8K | 92,0 | no disponible |
| MMLU | 83,0 | no disponible |

El rendimiento de inferencia de este build, medido en un M5 Max con oMLX y MTP habilitado, es el siguiente:

| Contexto | TTFT | TPOT | Prefill (tok/s) | Generación (tok/s) | Pico de memoria |
|---|---|---|---|---|---|
| 1k | 1159 ms | 16,9 ms | 883 | 59,6 | 17,4 GB |
| 4k | 4580 ms | 17,5 ms | 894 | 57,6 | 19,0 GB |
| 8k | 9826 ms | 17,6 ms | 834 | 57,1 | 19,9 GB |

La velocidad de prefill con group size 64 alcanza 894,4 ppTPS a 4096 tokens de contexto, frente a 513,2 ppTPS con group size 128 y enrutamiento de kernel activo, y 930,6 ppTPS con enrutamiento desactivado.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (M5 Max probado); requiere oMLX para cargarse correctamente.
- Peso del checkpoint: 17,36 GB; pico de memoria en inferencia entre 17,4 GB (contexto 1K) y 19,9 GB (contexto 8K).
- Necesita un Mac con al menos 32 GB de memoria unificada para operar con comodidad; con 24 GB podría quedar justo.
- No se proporcionan datos para GPU NVIDIA ni otras plataformas; el formato oMLX no es compatible con vLLM, llama.cpp u Ollama sin conversión.
- La decodificación especulativa MTP está activa por defecto y aporta entre 1,8× y 2,1× en generación (medido en el build hermano).
- No requiere parchear oMLX si se usa group size 64; con group size 128 habría que desactivar el enrutamiento de kernel.

## Comparativa con modelos similares

La comparación más directa es con el propio modelo base y con el build hermano de 4,85 bpw:

| Modelo | Tamaño | Contexto | Cuantización | Benchmarks (HumanEval/GSM8K/MMLU) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 27,8B | 256K | bf16 | no disponible | Apache-2.0 |
| Qwen3.8-27B-AWQ-4.85bpw | 27,8B | 256K | AWQ 4,85 bpw gs64 | 93,3 / 92,0 / 83,0 | Apache-2.0 |
| Qwen3.8-27B-AWQ-5.0bpw (este) | 27,8B | 256K | AWQ 5,0 bpw gs64 | no evaluado | Apache-2.0 |

No se dispone de información sobre otros modelos comparables de la misma categoría en el contexto de esta ficha.

## Limitaciones y advertencias

- Este build no ha sido evaluado para calidad; el autor recomienda usar el build de 4,85 bpw si se necesitan cifras medidas.
- Solo puede cargarse con oMLX. Cargarlo con `mlx_vlm` estándar produce texto fluido pero incorrecto debido al desplazamiento de normalización de pesos; no debe usarse fuera de oMLX.
- 27 módulos `linear_fc2` de la torre de visión permanecen en bf16 porque su dimensión de entrada (4304) no es divisible por ningún group size soportado.
- El modelo puede alucinar en tareas de razonamiento complejo, como cualquier LLM de este tamaño; la verificación con rejection sampling solo aplica a los drafts del MTP, no a la salida final.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y sus pesos originales pueden tener restricciones adicionales no documentadas en esta ficha.
- No se especifican idiomas soportados; la calibración se hizo con datos en inglés (ChartQA, VQAv2, GLSL), por lo que el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/True2456/Qwen3.8-27B-AWQ-5.0bpw
- Build hermano 4,85 bpw: https://huggingface.co/True2456/Qwen3.8-27B-AWQ-4.85bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pull request de oMLX sobre enrutamiento de kernel: https://github.com/jundot/omlx/pull/2657
- Herramienta de compresión usada: https://github.com/True2456/mlx-compress
