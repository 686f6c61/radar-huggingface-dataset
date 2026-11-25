# tanman24/Bonsai-2-27B-S10-GGUF

## Resumen

Bonsai-2-27B-S10-GGUF es una distribución de pesos GGUF del modelo Ternary Bonsai 2 27B de Prism ML, publicada por el usuario tanman24 y optimizada específicamente para ejecutarse en un Samsung Galaxy S10 (SoC Exynos 9820, 8 GB de RAM) con postmarketOS. Parte de los pesos ternarios PTQ1_0 del modelo original y aplica dos modificaciones principales: una reducción del vocabulario del tokenizador (de 151.936 a 142.744 tokens, lo que ahorra 242 MB) y la incorporación de una cabeza de predicción multi-token (MTP) para decodificación especulativa, primero reutilizando la de Qwen3.8-27B y después reentrenándola sobre respuestas del propio Bonsai.

El modelo base es Ternary Bonsai 2 27B, una cuantización post-entrenamiento ternaria de Qwen3.8-27B (Alibaba Cloud, Apache 2.0), con 25.814.900.224 parámetros totales según los safetensors del modelo original. La relevancia de esta ficha no está en la calidad del modelo —heredada de Qwen3.8-27B y degradada por la cuantización ternaria— sino en la demostración de ingeniería: un transformer de ~26B parámetros ejecutándose en un teléfono de 2019 con 8 GB de RAM a velocidades de 1,3 a 1,6 tokens por segundo, con decodificación especulativa activa.

Los ficheros publicados ocupan entre 5,70 y 5,94 GB, lo que permite cargarlos en memoria junto con una caché KV cuantizada a 8 bits y una ventana de contexto de 4096 tokens. El repositorio acumula 593 descargas y no tiene likes en el momento de redactar esta ficha. La licencia es Apache 2.0, heredada de los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B) con cabeza MTP para decodificación especulativa |
| Parametros totales | 25.814.900.224 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en la configuración de referencia para Galaxy S10 (límite práctico por RAM); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | PTQ1_0 (ternaria, Prism ML); matrices MTP almacenadas en Q4_0; caché KV en q8_0 |
| Idiomas soportados | No disponible como listado oficial; el vocabulario condensado cubre latín, código, tipografía común y griego; el resto de escrituras (CJK, cirílico, árabe) funciona peor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres variantes: P2TG, P2TG-mtp, P2TG-mtp-v2) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer denso de ~26B parámetros. Sobre esa base, Prism ML aplicó una cuantización post-entrenamiento ternaria (PTQ1_0) que reduce el peso de los tensores a aproximadamente 2 bits efectivos, dando lugar a Ternary Bonsai 2 27B. Esta ficha no reentrena el modelo base: solo modifica el vocabulario y añade la cabeza MTP.

El vocabulario condensado (denominado P2TG) conserva 142.744 de los tokens originales: texto en escritura latina, código, tipografía común (comillas curvas, guiones, flechas, signos matemáticos) y griego. Solo cambian de forma `token_embd.weight` y `output.weight`; los otros 849 tensores son idénticos byte a byte al fichero de Prism ML. La perplejidad en Wikitext-2 pasa de 6,815 ± 0,268 a 6,948 ± 0,276 (+1,9 %, dentro del margen de error), atribuible a caracteres CJK y birmanos que caen a fallback de bytes.

La cabeza MTP procede de Qwen3.8-27B (15 tensores `mtp.*`), convertida con las reglas de llama.cpp y añadida como bloque 64, con matrices en Q4_0. En la versión v2 esos 15 tensores se reentrenaron sobre aproximadamente 4.300 prompts respondidos por el propio Bonsai 27B: chat de `HuggingFaceH4/ultrachat_200k`, código de `ise-uiuc/Magicoder-Evol-Instruct-110K` y ediciones de `grammarly/coedit`. El resto de tensores permanece idéntico byte a byte a la versión P2TG-mtp. No se documenta RLHF ni DPO adicionales sobre el modelo base en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3.8-27B.
- Generación de código, con especial buen comportamiento en decodificación especulativa (96 % de aciertos de la cabeza MTP v2 en modo greedy para código).
- Ediciones cortas de texto (100 % de aciertos de la cabeza MTP v2 en modo greedy).
- Decodificación especulativa MTP-1: la cabeza propone un token y el modelo lo verifica en una pasada de 2 tokens.
- Ejecución en CPU y GPU integrada de un SoC móvil (Exynos 9820: 2 núcleos Samsung M4 + 2 Cortex-A75 + Mali-G76).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.
- Idiomas: cobertura fuerte de escrituras latinas, código y griego; cobertura degradada para CJK, cirílico y árabe.

## Casos de uso

- Inferencia local en smartphone de gama alta antigua: el caso de referencia es un Galaxy S10 con postmarketOS, donde el modelo cabe en 8 GB de RAM con contexto de 4096 tokens y caché KV q8_0, ofreciendo entre 1,3 y 1,6 tok/s. Adecuado para asistentes offline sin conexión.
- Asistente de edición de texto en el dispositivo: la cabeza MTP v2 acepta el 100 % de sus conjeturas en ediciones cortas en modo greedy, lo que hace que tareas de reescritura, corrección o reformateo sean las más eficientes en términos de tokens por segundo efectivos.
- Generación de código asistida en movilidad: con un 96 % de aceptación de conjeturas MTP en código, el modelo es útil para autocompletado y generación de fragmentos cortos en entornos sin acceso a la nube.
- Experimentación en decodificación especulativa: el repositorio sirve como banco de pruebas reproducible para medir el impacto de una cabeza MTP reentrenada frente a una transferida de otro modelo, con métricas publicadas de aceptación por dominio.
- Despliegue en dispositivos edge con recursos muy limitados: gracias a la cuantización ternaria PTQ1_0, el modelo ocupa 5,70–5,94 GB en disco, lo que lo hace viable en placas SBC con 8 GB de RAM y almacenamiento eMMC.
- Docencia e investigación sobre cuantización extrema: permite estudiar la degradación de perplejidad (+1,9 % en Wikitext-2) al condensar el vocabulario y al aplicar cuantización ternaria sobre un modelo de ~26B.
- Procesamiento de texto en escrituras latinas y código en entornos aislados (air-gapped): útil cuando no se puede enviar datos a servicios externos y el contenido está mayoritariamente en inglés, español u otros idiomas latinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos publicados son de velocidad y aceptación de la decodificación especulativa en el Galaxy S10:

| Métrica | P2TG sin MTP | P2TG-mtp (cabeza original) | P2TG-mtp-v2 |
|---|---|---|---|
| Velocidad prosa (tok/s) | ~1,3 | 1,46 | +3,4 % vs. cabeza original (con pausas térmicas descontadas) |
| Velocidad código (tok/s) | ~1,3 | 1,51 | No disponible en valor absoluto |
| Velocidad ediciones (tok/s) | ~1,2 | 1,64 | No disponible en valor absoluto |
| Aceptación de conjeturas, prosa (greedy) | No aplica | 57 % | 64 % |
| Aceptación de conjeturas, código (greedy) | No aplica | 89 % | 96 % |
| Aceptación de conjeturas, ediciones cortas (greedy) | No aplica | 100 % | 100 % |
| Aceptación de conjeturas, conjunto amplio (chat, código, ediciones) | No aplica | 74,9 % | 83,0 % |
| Tokens por pasada (media) | 1,0 | No disponible | 1,83 (techo MTP-1: 2) |
| Perplejidad Wikitext-2 | 6,815 ± 0,268 (original Prism ML) | 6,948 ± 0,276 (P2TG) | No disponible |

Condiciones de medida: 4 núcleos de CPU (2 Samsung M4 + 2 Cortex-A75) más GPU Mali-G76, decodificación greedy, respuestas de 128 tokens, con ventilación forzada. El A/B de la cabeza v2 se realizó sobre 6 prompts mixtos con orden antiguo/nuevo/nuevo/antiguo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 5,70 GB (P2TG) o 5,94 GB (P2TG-mtp y P2TG-mtp-v2) solo para pesos; hay que sumar la caché KV. Con contexto de 4096 y caché q8_0 (`-ctk q8_0 -ctv q8_0 -fa on`) el conjunto cabe en 8 GB de RAM.
- GPU recomendadas para uso en servidor: no documentadas en la información disponible. El formato PTQ1_0 requiere el fork llama.cpp-s10; no se garantiza compatibilidad con backends CUDA estándar sin verificación.
- ¿Cabe en GPU de consumo? No hay datos publicados. El tamaño (≈6 GB) permitiría en principio cargarlo en GPUs con 8 GB o más de VRAM, pero la compatibilidad de PTQ1_0 con backends distintos de CPU/GPU móvil no está documentada.
- Hardware de referencia validado: Samsung Galaxy S10 (Exynos 9820, 8 GB de RAM) con postmarketOS aarch64.
- Opciones de despliegue: exclusivamente `llama.cpp-s10` (fork de Prism ML con soporte PTQ1_0, kernels para teléfono y soporte MTP), release `s10-b12179-d480e84` o superior. El llama.cpp upstream no puede cargar PTQ1_0.
- Latencia y throughput: 1,3–1,6 tok/s en el Galaxy S10 según dominio; la cabeza MTP v2 reduce un 3,1 % el número de pasadas y mejora un 3,4 % la velocidad con pausas térmicas descontadas (+2,3 % en bruto) frente a la cabeza original.
- Almacenamiento: 17,6 GB de repositorio completo; cada fichero individual ocupa entre 5,70 y 5,94 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-2-27B-S10-GGUF (esta ficha) | 25,8 B | 4096 (config. móvil) | PTQ1_0 ternaria + MTP Q4_0 | Apache 2.0 | GGUF, requiere llama.cpp-s10 |
| Ternary Bonsai 2 27B (Prism ML) | 25,8 B | No disponible | PTQ1_0 ternaria, sin MTP | Apache 2.0 | GGUF, requiere llama.cpp con PTQ1_0 |
| Qwen3.8-27B (modelo base) | ~27 B | No disponible | Pesos completos (safetensors) | Apache 2.0 | Hugging Face, amplio ecosistema |
| Qwen3.8-27B con cabeza MTP original | ~27 B | No disponible | Pesos completos + MTP | Apache 2.0 | Hugging Face |

La comparación relevante es frente al modelo base: esta ficha sacrifica +1,9 % de perplejidad en Wikitext-2 y cobertura de escrituras no latinas a cambio de una reducción de tamaño que permite ejecución en 8 GB de RAM, y añade decodificación especulativa que aporta entre un 12 % y un 26 % de velocidad extra según dominio. Frente a Qwen3.8-27B en precisión completa, la pérdida de calidad por la cuantización ternaria no está cuantificada en la información disponible.

## Limitaciones y advertencias

- La cuantización ternaria PTQ1_0 degrada la calidad respecto a Qwen3.8-27B en precisión completa; no se publican métricas de benchmarks que permitan cuantificar esa pérdida.
- El vocabulario condensado elimina tokens CJK, cirílico, árabe y otras escrituras: el texto en esos idiomas sigue siendo posible pero requiere más tokens y funciona peor. Para esos casos el autor recomienda usar el fichero original de Prism ML.
- La ventana de contexto práctica en el hardware de referencia es de 4096 tokens, muy inferior al contexto nativo del modelo base (no disponible). Contextos mayores no caben en 8 GB de RAM con esta configuración.
- El modelo solo es cargable con el fork `llama.cpp-s10`; el llama.cpp upstream no soporta PTQ1_0. Esto limita la portabilidad a otros entornos de despliegue.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo de ~26B cuantizado de forma agresiva.
- Sesgos conocidos: no documentados en la información proporcionada. Se heredan los del modelo base y los de los datasets de ajuste de la cabeza MTP (ultrachat_200k, Magicoder-Evol-Instruct-110K, grammarly/coedit).
- La cabeza MTP v2 se entrenó sobre ~4.300 prompts, un volumen reducido; su comportamiento fuera de los dominios de chat, código y ediciones no está validado.
- Licencia Apache 2.0 permite uso comercial, pero se deben respetar las atribuciones de `LICENSE` y `NOTICE.txt` (Prism ML y Alibaba Cloud).
- Las velocidades publicadas (1,3–1,6 tok/s) corresponden a un dispositivo concreto con ventilación forzada; sin refrigeración, las pausas térmicas reducen el throughput.
- Repositorio con 0 likes y 593 descargas: no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tanman24/Bonsai-2-27B-S10-GGUF
- Modelo base ternario (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp con soporte PTQ1_0 y MTP: https://github.com/tannerbruhn/llama.cpp-s10
- Release de referencia: https://github.com/tannerbruhn/llama.cpp-s10/releases/tag/s10-b12179-d480e84
- Guía de configuración en Galaxy S10: https://github.com/tannerbruhn/s10-llm-recipes
- Dataset de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de código: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- Dataset de ediciones: https://huggingface.co/datasets/grammarly/coedit
