# TheSanchezian/Gemma-4-26B-A4B-BITCOS-Ternary-OpenVINO-A770

## Resumen

Gemma 4 26B-A4B BITCOS Ternary OpenVINO A770 es una cuantización mixta de precisión reducida del modelo google/gemma-4-26B-A4B-it, publicada por el usuario TheSanchezian. El modelo base es un transformer de tipo mezcla de expertos (MoE) de 26.000 millones de parámetros totales con aproximadamente 4.000 millones de parámetros activos por token (8 de 128 expertos enrutados). Esta versión aplica cuantización ternaria mixta BITCOS v5, INT8, INT4 selectivo y FP16 a distintas partes de la red para comprimir el modelo original de 52 GB en BF16 hasta 9,48 GB en disco, manteniendo según el autor un comportamiento casi sin pérdida.

El objetivo declarado es ejecutar un modelo MoE de gama alta en una única GPU de consumo Intel Arc A770 de 16 GB mediante OpenVINO, con caché KV en FP16 de hasta 64.000 tokens y sin cabezas de borrador (draft heads) ni decodificación especulativa. El autor reporta 69,2 tok/s en decodificación base pura con contexto corto y 50,7 tok/s a 64.000 tokens, con un uso de VRAM plano de 11,04 GB.

La relevancia de esta ficha radica en que documenta una aproximación poco habitual: cuantización ternaria aplicada solo a las capas MoE enrutadas, dejando el backbone denso en INT8 y la caché KV en FP16 sin pérdida. No obstante, se trata de una publicación de un autor individual, sin descargas ni validación comunitaria en el momento de redactar esta ficha, por lo que todas las cifras proceden exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), base google/gemma-4-26B-A4B-it |
| Parametros totales | 26.000 millones (26B) |
| Parametros activos | ~4.000 millones (4B), 8 de 128 expertos enrutados por token |
| Longitud de contexto | Hasta 64.000 tokens (caché KV FP16 sin pérdida); build alternativo de 32k |
| Tipos de cuantizacion | Ternaria mixta BITCOS v5 en 24 capas MoE enrutadas; INT8 en QKV+O del backbone denso; INT4 en 6 capas MoE sensibles; FP16 en caché KV; FP32 en residual, router, norms y RoPE |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google para la familia Gemma) |
| Formato de pesos | OpenVINO (IR); repositorio de 10,2 GB; sin GGUF ni safetensors indicados |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 26B parámetros con 4B activos por token, donde cada token activa 8 de los 128 expertos enrutados. La cuantización de TheSanchezian preserva el backbone denso en INT8 para las proyecciones QKV y de salida, mantiene la caché KV en FP16 sin pérdida y deja en FP32 los componentes sensibles (residual, router, normalizaciones y RoPE). La compresión agresiva se aplica únicamente a las 24 capas MoE enrutadas mediante BITCOS v5 ternario mixto y una LoRA de rango 4 sin fusionar; además, 6 capas MoE especialmente sensibles se mantienen en INT4.

No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF o DPO. La model card no documenta el número de tokens de entrenamiento ni la composición del dataset. La innovación técnica destacable es la estrategia de cuantización selectiva por tipo de capa, que según el autor evita los fallos típicos de la cuantización ternaria densa uniforme (bucles de razonamiento, deriva de restricciones y tokens de herramientas inflados) y permite decodificación base pura sin cabezas de borrador ni decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Gemma 4 26B-A4B-it.
- Razonamiento con modo de pensamiento (thinking mode) activable mediante `think=on`.
- Generación de código, evaluada por el autor con LiveCodeBench.
- Seguimiento de instrucciones estrictas, evaluado con IFEval.
- Capacidad de contexto largo verificada por el autor con una prueba de recuperación de 3 agujas (3-needle) a 56.000 tokens.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo con GPU Intel Arc: el modelo cabe en 11,04 GB de VRAM en una A770 de 16 GB, lo que permite desplegar un asistente de 26B parámetros en hardware de consumo sin depender de la nube.
- Análisis de documentos largos: con caché KV FP16 de hasta 64.000 tokens y recuperación verificada a 56.000 tokens, es adecuado para resumir o consultar contratos, informes técnicos o expedientes extensos en una sola pasada.
- Generación de código en entornos con GPU Intel: el autor reporta 62,0% de pass@1 en LiveCodeBench-50, por lo que puede integrarse en asistentes de programación locales para autocompletado y resolución de problemas de dificultad media.
- Cumplimiento estricto de instrucciones en pipelines de extracción de datos: el 96,0% estricto en IFEval-50 lo hace utilizable para tareas de transformación de texto con formato y restricciones fijas.
- Despliegue en infraestructura OpenVINO existente: organizaciones que ya operan con OpenVINO en CPU o GPU Intel pueden incorporar el modelo sin cambiar de stack de inferencia.
- Prototipado e investigación en cuantización de bajo bit: sirve como referencia reproducible para estudiar el impacto de la cuantización ternaria selectiva en modelos MoE frente a la cuantización densa uniforme.
- Procesamiento por lotes con contexto medio: el rendimiento de prefill de 248,4 tok/s a 500 tokens y 210,1 tok/s a 32.000 tokens permite procesar lotes de documentos con latencia razonable en una sola GPU.

## Benchmarks y rendimiento

Resultados reportados por el autor con muestreo oficial de Gemma 4 (`think=on`, `temperature=1.0`, `top_p=0.95`, `top_k=64`), decodificación base pura sin cabezas de borrador:

| Benchmark | Resultado | Correctos | Incorrectos | Truncados | Bucles |
|---|---:|---:|---:|---:|---:|
| IFEval-50 | 96,0% estricto / 98,0% laxo | 48 estricto / 49 laxo | 2 estricto | 0 | 0 |
| LiveCodeBench-50 (límite 32k) | 62,0% (31/50) | 31 | 11 | 8 | 2 |
| LiveCodeBench-50 (límite 64k) | 62,0% (31/50) | 31 | 18 | 1 | 1 |

Desglose de LiveCodeBench-50 por dificultad (50% difícil, 19 medios, 6 fáciles): fácil 6/6 (100,0%), medio 16/19 (84,2%), difícil 9/25 (36,0%).

Rendimiento de inferencia en Intel Arc A770 16 GB (OpenVINO 2026.4.1):

| Contexto | Prefill (tok/s) | Decodificación (tok/s) | VRAM dedicada | Derrame compartido |
|---:|---:|---:|---:|---:|
| Corto (greedy500) | — | 69,18 | 11,040 GB | 0,000 GB |
| 500 tokens | 248,4 | 67,36 | 11,040 GB | 0,000 GB |
| 8.000 tokens | 238,8 | 60,36 | 11,040 GB | 0,000 GB |
| 32.000 tokens | 210,1 | 55,86 | 11,040 GB | 0,000 GB |
| 48.000 tokens | 193,7 | 53,30 | 11,040 GB | 0,000 GB |
| 64.000 tokens | 179,8 | 50,72 | 11,040 GB | 0,000 GB |

El autor indica también una recarga en caliente de 10-15 segundos tras la compilación JIT de OpenCL, y una paridad declarada con el profesor BF16 en el rango 0-32k (la model card se interrumpe en ese punto, por lo que no se dispone del detalle completo de esa comparación).

## Requisitos de hardware

- VRAM estimada para inferencia: 11,04 GB dedicados de forma plana desde 500 hasta 64.000 tokens; el autor deja unos 5 GB libres en una GPU de 16 GB.
- GPU recomendada por el autor: Intel Arc A770 de 16 GB (una sola unidad). No se documentan pruebas en otras GPU.
- GPU de consumo: sí cabe en una Intel Arc A770 de 16 GB. No hay datos sobre otras GPU de consumo (NVIDIA o AMD) ni sobre compatibilidad con CUDA o ROCm.
- Despliegue: OpenVINO 2026.4.1-63022 con operadores OpenCL personalizados (350 operadores compilados en GPU, 0 reordenamientos, 0 NaN). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato OpenVINO IR no es directamente compatible con ellos.
- Latencia: percentil 10 de 13,93 ms (71,8 tok/s) en contexto corto, hasta 19,32 ms en 64.000 tokens.
- Throughput: 69,18 tok/s en decodificación corta y 50,72 tok/s a 64.000 tokens; prefill entre 179,8 y 248,4 tok/s según longitud.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B-A4B BITCOS Ternary (esta ficha) | 26B totales / ~4B activos | 64k | IFEval-50 96,0%; LiveCodeBench-50 62,0% | Gemma | OpenVINO IR, autor individual |
| Bonsai 2.5 27B | 27B densos | no disponible | Ternario denso uniforme 1,58 bits; el autor cita bucles y deriva de restricciones en revisiones independientes | no disponible | no disponible |
| google/gemma-4-26B-A4B-it (BF16) | 26B totales / ~4B activos | no disponible | Referencia de paridad declarada por el autor en 0-32k (detalle no disponible) | Gemma | Hugging Face, Google |

La comparación con Bonsai 2.5 27B procede de la propia model card y se refiere a una revisión de código cronometrada de un tercero; no se dispone de cifras propias de ese modelo en la información proporcionada. No se han identificado otros modelos comparables con datos verificables en la información disponible.

## Limitaciones y advertencias

- Publicación de un autor individual con 0 descargas y 0 likes en el momento de redactar la ficha; no hay validación independiente de las cifras reportadas.
- Todos los benchmarks y métricas de rendimiento proceden de la model card del autor; no se han reproducido de forma independiente.
- La model card se interrumpe en la sección de paridad con el profesor BF16, por lo que la comparación completa de precisión frente al modelo original no está disponible.
- La cuantización ternaria, aunque sea selectiva, puede degradar el razonamiento en tareas de alta dificultad: el propio autor reporta solo 36,0% en problemas difíciles de LiveCodeBench y 2 bucles en la evaluación de 32k.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de cumplimiento de la política de uso de Google; debe revisarse antes de cualquier despliegue en producción.
- El formato OpenVINO IR limita el despliegue a la pila de Intel; no es portable a vLLM, llama.cpp u otros motores sin conversión adicional.
- Solo se documenta funcionamiento en Intel Arc A770; el rendimiento en otras GPU o en CPU no está verificado.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específico de esta cuantización.
- El modelo base está etiquetado como `-it` (ajustado para instrucciones); el uso sin filtros de seguridad adicionales puede producir contenido inapropiado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheSanchezian/Gemma-4-26B-A4B-BITCOS-Ternary-OpenVINO-A770
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- OpenVINO: https://github.com/openvinotoolkit/openvino
- Licencia Gemma: https://ai.google.dev/gemma/terms
