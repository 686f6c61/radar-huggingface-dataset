# WarlaxZ/Ternary-Bonsai-2-27B-NInfer-3090

## Resumen

Ternary Bonsai 2 27B NInfer 3090 es una conversión del modelo multimodal Ternary Bonsai 2 27B de Prism ML a un formato propietario de inferencia (`.ninfer`) optimizado específicamente para ejecutarse en una única GPU de consumo RTX 3090 con 24 GB de VRAM. El modelo subyacente es una cuantización ternaria (valores -1, 0, +1 con una escala FP16 por cada 128 pesos, lo que equivale a 2,125 bits por peso) del Qwen3.8-27B, orientada a reducir drásticamente el peso en memoria y acelerar la decodificación mediante técnicas de decodificación especulativa.

El artefacto lo mantiene el usuario WarlaxZ a partir del trabajo del fork `ashalliants/ninfer-3090`, que adapta el motor NInfer para reconocer el formato de pesos `t2_g128_fp16` que genera el conversor de Prism ML. No es un checkpoint de Transformers, ni una distribución de safetensors, ni un fichero GGUF: requiere los ejecutables de este fork concreto, y las versiones anteriores del motor lo rechazan al arrancar porque no reconocen el formato ternario.

Su relevancia radica en que permite servir un modelo de 27B parámetros con torre de visión y contexto de 262.144 tokens en una sola RTX 3090, con velocidades de decodificación de entre 88 y 297 tok/s según el modo especulativo activado, y un rendimiento agregado de hasta 572,5 tok/s con 8 peticiones concurrentes. Es un ejemplo práctico de cómo la cuantización extrema combinada con decodificación especulativa puede hacer viable hardware de consumo para modelos de escala media-alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer denso con torre de visión, cabeza MTP y adaptador DFlash2) |
| Parametros totales | 27B (heredados de Qwen3.8-27B; no se detalla el desglose) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ternaria (-1, 0, +1) con escala FP16 por cada 128 pesos (2,125 bits por peso); adaptador DFlash2 en Q4; KV cache en int8 o rk4v4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario del motor NInfer; no es safetensors, GGUF ni Transformers) |

## Arquitectura y entrenamiento

El modelo base es Ternary Bonsai 2 27B de Prism ML, una cuantización ternaria del Qwen3.8-27B. Cada proyección de texto, excepto los controles A/B del mecanismo GDN, la cabeza de salida y la tabla de tokens, se almacena como `t2_g128_fp16`: los códigos ternarios y las escalas por bloque de 128 pesos son los originales de Prism, importados desde el GGUF PQ2_0 sin redondeo adicional. Los pesos están rotados con Hadamard en el checkpoint, por lo que el runtime rota las activaciones correspondientes (fusionado en las operaciones que las producen). La receta de conversión deshace las convenciones del exportador de llama.cpp (orden de las cabezas de valor del GDN, normas `1 + w`, `ssm_a`).

El artefacto incorpora además la torre de visión y los recursos de frontend del Qwen3.8-27B, una cabeza MTP (Multi-Token Prediction) y un adaptador DFlash2 entrenados por ProCreations contra el propio Bonsai 2. Las proyecciones de características, salida y MLP del adaptador se almacenan en Q4, ya que contra un objetivo de 2,125 bits el borrador representa una fracción grande de los bytes de cada paso de draft. También incluye una cabeza de propuesta con las filas de los 131.072 tokens más frecuentes de la cabeza de salida ternaria, en su propia codificación, que es sin pérdida y se carga solo con `--lm-head-draft`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y decodificación con modo "thinking" (desactivable mediante `--no-thinking`).
- Comprensión de imágenes: pipeline `image-text-to-text` con torre de visión heredada de Qwen3.8-27B.
- Generación de código: los benchmarks internos incluyen prompts de programación con velocidades de decodificación medidas.
- Aritmética y tareas de razonamiento numérico: se reportan mediciones específicas sobre un prompt aritmético (363,6 tok/s en Linux, 372,2 en Windows).
- Decodificación especulativa mediante MTP (3 drafts) y DFlash2 (7 drafts), con longitud de aceptación de 3,97 a 4,00 tokens por ronda.
- Soporte de peticiones concurrentes: el motor `ninfer-serve` gestiona múltiples solicitudes simultáneas con rendimiento agregado medido.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades de agente o multilingüismo en la documentación proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo en una sola GPU: con 262.144 tokens de ventana y 9,6-11,2 GiB de VRAM libres tras cargar el modelo completo, se puede mantener un historial extenso de conversación o procesar documentos largos sin truncar, algo inusual en hardware de consumo.
- Generación de código en estación de trabajo local: el modelo decodifica entre 138 y 437 tok/s en prompts de chat con DFlash2 activado, lo que permite integrarlo en un flujo de trabajo de edición de código con retroalimentación casi interactiva sin depender de la nube.
- Procesamiento de documentación técnica con imágenes: al ser multimodal (`image-text-to-text`), puede analizar capturas de pantalla, diagramas o páginas escaneadas junto con texto, útil para tareas de extracción y resumen en local.
- Servicio de inferencia multi-usuario en un solo nodo: con 572,5 tok/s agregados a 8 peticiones concurrentes y KV cache en int8 o rk4v4, un único RTX 3090 puede atender a un equipo pequeño con latencias aceptables.
- Experimentación e investigación en cuantización ternaria: el artefacto incluye el informe de conversión (`bonsai2_27b.ninfer.conversion.json`) con cada objeto, su origen, formato y método, lo que lo convierte en material de referencia para estudiar pipelines de cuantización extrema.
- Evaluación de decodificación especulativa: las mediciones comparativas entre modo plano (88 tok/s), MTP con 3 drafts (199 tok/s) y DFlash2 con 7 drafts (297 tok/s) permiten reproducir y analizar el impacto de cada técnica en hardware fijo.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local con licencia Apache 2.0, es adecuado para procesar información sensible sin salida a servicios externos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad (`ninfer-perplexity --quick --kv-dtype int8`) | 5,627 | `perplexity-1m`; referencia pxzleo/ninfer-all: 5,631 |
| Prefill, prompt 1k | 2.905 tok/s | RTX 3090 stock 350 W, Linux, CUDA 12.8 |
| Prefill, prompt 4k | 2.820 tok/s | ídem |
| Prefill, prompt 16k | 2.618 tok/s | ídem |
| Decode plano | 88 tok/s | Prompt corto de código, 300 tokens, thinking off |
| Decode con MTP, 3 drafts | 199 tok/s | ídem |
| Decode con DFlash2, 7 drafts | 297 tok/s (4,89 tokens por ronda) | ídem |
| Decode DFlash2, media de 4 prompts variados | 249,9 tok/s (rango 173-325) | Código, redes, aritmética, email |
| Throughput agregado, 1 petición | 175,7 tok/s | `ninfer_bench`, KV int8, ctx 4096, MTP 3 drafts |
| Throughput agregado, 2 peticiones | 305,3 tok/s | ídem |
| Throughput agregado, 4 peticiones | 457,7 tok/s | ídem |
| Throughput agregado, 8 peticiones | 572,5 tok/s | ídem; Windows nativo: 573,2 tok/s |
| Chat con DFlash2, media de 12 prompts | 234,5 tok/s (rango 138-437) | Linux bajo WSL, 315 W, KV rk4v4, ctx 262144 |
| Chat con DFlash2, media en Windows nativo | 238,2 tok/s (rango 141-439) | ídem |
| Prompt aritmético con DFlash2 | 363,6 tok/s (Linux) / 372,2 tok/s (Windows) | ídem |

Como referencia comparativa del propio fork, el Qwen3.8-27B en 6 bits decodifica 48 tok/s en plano y 195 tok/s con DFlash2 en el mismo prompt de código, frente a los 88 y 297 tok/s del modelo ternario. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el artefacto ocupa 9.520.051.456 bytes (8,87 GiB). Con KV cache `rk4v4` y contexto completo de 262.144 tokens quedan 11,2 GiB libres en una RTX 3090; con DFlash2 activado, 9,6 GiB libres.
- GPU recomendada: RTX 3090 (24 GB), que es el objetivo de diseño del fork. No se documenta compatibilidad con otras GPU.
- GPU de consumo: cabe en una RTX 3090; no se dispone de datos para GPUs con menos de 24 GB.
- Despliegue: exclusivamente mediante los ejecutables del fork `ashalliants/ninfer-3090` (`ninfer-serve`, `ninfer_bench`, `ninfer-perplexity`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, y las versiones antiguas del motor lo rechazan al no reconocer el formato `t2_g128_fp16`.
- Entorno probado: CUDA 12.8, Windows nativo y Linux (incluido WSL). Límite de potencia de 315 W en las pruebas de concurrencia y 350 W en las de prefill.
- Latencia y throughput: ver la tabla de benchmarks; el modo DFlash2 con 7 drafts multiplica por 3,4 la velocidad de decodificación plana (297 frente a 88 tok/s) en el prompt de código medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode (tok/s) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B NInfer 3090 | 27B (ternario, 2,125 bits/peso) | 262.144 | 88 plano / 297 con DFlash2 | Apache 2.0 | `.ninfer`, solo fork ninfer-3090 |
| Qwen3.8-27B en 6 bits (mismo fork) | 27B (6 bits) | no disponible | 48 plano / 195 con DFlash2 | no disponible en la información | Motor ninfer-3090 |
| Ternary Bonsai 2 27B GGUF (Prism ML) | 27B (ternario) | no disponible | no disponible | no disponible en la información | GGUF, base del artefacto |
| Qwen3.8-27B original | 27B | no disponible | no disponible | no disponible en la información | Transformers / safetensors |

La comparación directa disponible se limita al Qwen3.8-27B en 6 bits ejecutado con el mismo fork: el modelo ternario es un 83 % más rápido en decodificación plana (88 frente a 48 tok/s) y un 52 % más rápido con DFlash2 (297 frente a 195 tok/s) en el prompt de código de referencia. No se dispone de datos de benchmarks de calidad que permitan comparar la precisión frente al modelo original en 16 bits.

## Limitaciones y advertencias

- Formato propietario y dependencia de un fork concreto: el artefacto solo funciona con los ejecutables de `ashalliants/ninfer-3090`; versiones anteriores del motor lo rechazan al arrancar. No se puede cargar en ecosistemas estándar como Transformers, llama.cpp, vLLM u Ollama.
- La cuantización ternaria a 2,125 bits por peso implica una pérdida de precisión frente al modelo original en FP16/BF16. La perplejidad reportada (5,627) es un indicador agregado; no se han publicado evaluaciones por tarea (razonamiento, código, matemáticas) que permitan acotar el deterioro en dominios específicos.
- Las mediciones son de una sola tarjeta y pocos prompts, y el propio autor las califica de indicativas. Los resultados de concurrencia y chat varían entre Linux/WSL y Windows nativo, y se observaron episodios de thermal slowdown en una de las ejecuciones.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo. Al ser una conversión de Qwen3.8-27B, hereda las características del modelo base, pero no se documentan en la información proporcionada.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico; no debe asumirse su disponibilidad en producción sin verificación empírica.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del fork de inferencia y del formato `.ninfer` condiciona la portabilidad y el mantenimiento a largo plazo.
- El contexto máximo de 262.144 tokens requiere KV cache `rk4v4`; con otros tipos de KV el contexto útil puede ser menor. La memoria libre tras cargar el modelo es ajustada (9,6-11,2 GiB), lo que limita el margen para cargas concurrentes pesadas o contextos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WarlaxZ/Ternary-Bonsai-2-27B-NInfer-3090
- Modelo base GGUF (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del fork del motor: https://github.com/ashalliants/ninfer-3090
- Cabeza MTP (ProCreations): https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Adaptador DFlash2 (ProCreations): https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Implementación de referencia del puerto: https://github.com/pxzleo/ninfer-all
