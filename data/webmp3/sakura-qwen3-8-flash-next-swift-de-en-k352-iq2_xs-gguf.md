# webmp3/Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ2_XS-GGUF

## Resumen

Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ2_XS-GGUF es una compilación experimental de la comunidad, publicada por webmp3, que parte del fine-tune Swift 1.5 de UkisAI sobre Qwen3.8-Flash-Next. Se trata de un modelo MoE de arquitectura qwen4exp con 48 capas, 512 expertos enrutados y 10 expertos activos por token. Esta build conserva 352 de los 512 expertos por capa, seleccionados mediante estadísticas de enrutador sobre una mezcla de calibración en alemán e inglés, y mantiene la cuantización IQ2_XS (GSQ-RCO, aproximadamente 2,5 bits) sin recuantizar. El resultado pesa 53,08 GiB en dos shards GGUF y está pensado para ejecutarse en una única GPU de 32 GB, en concreto una Radeon 8060S con 64 GB de memoria unificada (Strix Halo), con carga perezosa de la tabla de tokens.

El modelo base Qwen3.8-Flash-Next es una vista previa abierta de la arquitectura de Qwen4, con atención híbrida GDN + QSA, una tabla de embeddings n-grama de gran tamaño y una cabeza MTP compartida para decodificación especulativa. Swift 1.5 reduce el número de tokens de pensamiento respecto al modelo base. Esta build no es una versión oficial de Qwen ni de UkisAI, sino una poda de expertos orientada a alemán e inglés. Su relevancia actual es que permite ejecutar localmente un MoE de escala 139B (parámetros del checkpoint base) en hardware de consumo alto, a costa de una cuantización agresiva y de la eliminación de expertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (qwen4exp) con atención híbrida GDN + QSA; 48 capas; 512 expertos enrutados; 10 expertos activos por token en la base |
| Parámetros totales | 139.175.502.720 en el checkpoint base (dato de safetensors); este GGUF conserva 352/512 expertos, por lo que su recuento efectivo es menor y no está desglosado en la información disponible |
| Parámetros activos | 10 expertos activos por token (base); el número exacto tras la poda no está especificado |
| Longitud de contexto | 32.000 tokens probados en la model card; máximo no disponible |
| Tipos de cuantización | IQ2_XS (GSQ-RCO, ~2,5 bits); cabeza MTP compartida en Q4_K_M; existe un hermano IQ3_XXS |
| Idiomas soportados | Alemán (de) e inglés (en) |
| Licencia | swift-open-license-v1.0 (license: other); consultar el archivo LICENSE |
| Formato de pesos | GGUF, 2 shards: 00001-of-00002 (34,31 GiB) y 00002-of-00002 (18,77 GiB) |
| Tamaño del repositorio | 57,0 GB |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF |
| Autor | webmp3 |
| Fecha de creación | 2026-09-30 |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next introduce mejoras en atención, residuales, embeddings y optimización. Su atención es híbrida GDN + QSA, con 48 capas, 512 expertos enrutados y 10 expertos activos por token. El checkpoint incluye además una tabla de embeddings n-grama de gran tamaño (51B parámetros según la guía de Atomic Chat) y una cabeza MTP de 4B parámetros. En esta build, la tabla de tokens por capa ocupa 26,8 GiB y debe permanecer en disco o RAM con carga perezosa (`-lm dio --lazy-mode on`), mientras que los pesos residentes en GPU son de aproximadamente 26 GiB. UkisAI realizó el fine-tune Swift 1.5, que reduce los tokens de pensamiento, y posteriormente la cuantización GSQ-RCO en el nivel IQ2_XS. webmp3 aplicó una poda de expertos sin recuantización: conservó 352 de 512 expertos por capa mediante estadísticas de enrutador (routing mass) medidas con `llama-expert-stats` sobre una mezcla de calibración en alemán e inglés; un experto se conserva si es relevante en cualquiera de los dos idiomas. La misma medición sobre el modelo Swift da un conjunto con un 98 % de solapamiento.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset original de Qwen3.8-Flash-Next, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. La innovación destacable de esta build es la combinación de poda de expertos selectiva por idioma, cuantización extrema IQ2_XS y decodificación especulativa mediante cabeza MTP compartida, junto con la carga perezosa de la tabla de tokens para ajustar el modelo a una GPU de 32 GB.

## Capacidades

- Generación de texto conversacional en alemán e inglés.
- Razonamiento y resolución de problemas de código: 7 de 8 tareas propias de estilo LeetCode/AtCoder superadas en las pruebas del autor.
- Modo de pensamiento con presupuesto limitado: Swift 1.5 usa menos tokens de pensamiento que el modelo base.
- Decodificación especulativa mediante cabeza MTP compartida (requiere un fork de llama.cpp).
- Capacidades multilingües limitadas a alemán e inglés; no se documentan otros idiomas en esta build.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no evaluado formalmente; las tareas duras ejecutadas sugieren cierta capacidad, pero no hay datos concluyentes.
- Visión, audio u otras modalidades: no disponible.
- Ejecución local en llama.cpp con backend Vulkan o ROCm.

## Casos de uso

- Asistente conversacional local en alemán e inglés: el modelo puede mantener diálogos multi-turno con hasta 32.000 tokens de contexto, adecuado para equipos que necesitan privacidad y no quieren depender de APIs externas.
- Generación de código en local: las pruebas del autor muestran 7/8 tareas de programación resueltas, por lo que puede integrarse en entornos de desarrollo con GPU de 32 GB para autocompletado, revisión o generación de fragmentos.
- Análisis de documentos largos en alemán o inglés: con 32k de contexto y carga perezosa de la tabla de tokens, permite resumir o extraer información de informes extensos sin enviar datos a la nube.
- Traducción y redacción bilingüe de/en: la selección de expertos se hizo precisamente sobre una mezcla de calibración en ambos idiomas, lo que lo hace adecuado para tareas de traducción técnica o redacción corporativa.
- Investigación en poda de expertos y cuantización extrema: sirve como banco de pruebas para estudiar el impacto de conservar 352 de 512 expertos con cuantización IQ2_XS en comparación con el modelo completo.
- Prototipado de agentes con decodificación especulativa: la cabeza MTP permite aumentar el throughput en tareas de razonamiento multi-paso, siempre que se use el fork de llama.cpp adecuado.
- Despliegue en estaciones Strix Halo o mini-PC con memoria unificada: el modelo cabe en 32 GB de VRAM dedicada más memoria compartida, lo que habilita inferencia local en hardware compacto.
- Evaluación comparativa de MoE en hardware de consumo: útil para medir latencia, perplejidad y calidad frente a alternativas densas o MoE de menor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos siguientes son mediciones propias del autor sobre este archivo exacto.

| Prueba | Resultado | Configuración |
|---|---|---|
| Perplejidad retenida (alemán) | 2,0681 | llama-perplexity, contexto 512, 40 chunks de textos propios |
| Perplejidad retenida (inglés) | 1,8229 | llama-perplexity, contexto 512, 40 chunks de textos propios |
| Puerta de idioma (14 DE + 14 EN) | DE 0,005 / EN 0,01 de palabras en idioma incorrecto (umbral ≤ 0,06) | Medición con llama.cpp oficial b11259 (Vulkan) |
| Bucles / respuestas CJK | 0 / 0 | Medición con llama.cpp oficial b11259 (Vulkan) |
| Decodificación | 37,6 tok/s con MTP n-max 2; 35,2 tok/s con MTP n-max 3 | Strix Halo, Radeon 8060S, 64 GB, Windows, Vulkan, 32k contexto, KV q8_0, `-ub 2048` |
| Prefill | 238,0 tok/s con MTP n-max 2; 253,3 tok/s con MTP n-max 3 | Misma configuración |
| Decodificación sin especulación | ~24 tok/s | llama.cpp oficial b11259 y b11297, Vulkan |
| ROCm sin especulación | 322 tok/s prefill, 21,6 tok/s decodificación | Build comunitaria halo-box |
| Tareas de código propias | 7/8 superadas | 8 tareas LeetCode/AtCoder, thinking budget 10000, max 12288 tokens, temperatura 0,6, top-p 0,95, top-k 20 |
| Tareas más difíciles | 3 de 5 superadas | Tareas que un modelo denso 27B (Swift 1.5 27B Q5_K_M) no resolvió en el mismo protocolo |

Comparación de perplejidad retenida con otras builds del mismo linaje:

| Build | Perplejidad DE | Perplejidad EN |
|---|---:|---:|
| Este build (352/512 expertos, IQ2_XS) | 2,0681 | 1,8229 |
| Swift 512 expertos, IQ2_XS | 2,0605 | 1,8245 |
| Hermano 3-bit (352/512 expertos, IQ3_XXS) | 2,0514 | 1,8231 |

Las diferencias entre estas builds están dentro de aproximadamente ±1 %, por lo que la perplejidad no permite separarlas de forma concluyente.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 26 GiB de pesos residen en la GPU; la tabla de tokens por capa de 26,8 GiB permanece en disco o RAM con carga perezosa. Con 32k de contexto, KV q8_0, cabeza MTP y `-ub 2048`, el servidor usó 29,9 GiB de memoria GPU dedicada más 5,7 GiB de memoria compartida.
- GPU recomendadas: el autor probó una Radeon 8060S con 64 GB de memoria unificada (Strix Halo) y un carve-out dedicado de 32 GiB. No se probó una tarjeta discreta de 32 GB. No hay datos para A100, H100, RTX 4090 u otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: sí cabe en una GPU de 32 GB, siempre que se use carga perezosa para la tabla de tokens. El hermano de 3 bits necesita unos 31,4 GiB de pesos en GPU y no cabe en una tarjeta de 32 GB.
- Opciones de despliegue: llama.cpp. Para usar la cabeza MTP se requiere el fork `github.com/danielhanchen/llama.cpp`, rama `qwen4exp/mtp`, commit `6fcaa16` (21 de septiembre de 2026). El autor lo compiló para Vulkan con MSVC y Vulkan SDK 1.4.357. También hay una build comunitaria ROCm para halo-box sin especulación. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput medidos: 37,6 tok/s de decodificación y 238 tok/s de prefill con MTP n-max 2; 35,2 tok/s y 253,3 tok/s con n-max 3; aproximadamente 24 tok/s de decodificación sin especulación en llama.cpp oficial; 21,6 tok/s de decodificación y 322 tok/s de prefill en ROCm sin especulación.
- Almacenamiento: el repositorio ocupa 57,0 GB; los dos shards suman 53,08 GiB. Se incluye `SHA256SUMS` con las sumas de verificación. Se debe cargar el shard 1 y llama.cpp localiza el shard 2 automáticamente.

## Comparativa con modelos similares

| Modelo | Parámetros / expertos | Cuantización | Peso en GPU | Perplejidad DE / EN | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este build (Sakura K352 IQ2_XS) | 352/512 expertos | IQ2_XS, ~2,5 bits | ~26 GiB | 2,0681 / 1,8229 | swift-open-license-v1.0 | HuggingFace |
| Sakura K352 IQ3_XXS (hermano 3-bit) | 352/512 expertos | IQ3_XXS | ~31,4 GiB (no cabe en 32 GB) | 2,0514 / 1,8231 | No disponible en la información; presumiblemente la misma | HuggingFace |
| Swift 1.5 IQ2_XS (512 expertos) | 512/512 expertos | IQ2_XS | No disponible | 2,0605 / 1,8245 | No disponible | HuggingFace |
| Qwen3.8-Flash-Next (base) | 125B totales / 6B activos según la guía de Atomic Chat; 139.175.502.720 según la ficha de HuggingFace | No disponible | No disponible | No disponible | No disponible | HuggingFace y GitHub de QwenLM |

La guía de Atomic Chat describe el checkpoint base como 125B totales y 6B activos por token, con tabla n-grama de 51B y cabeza MTP de 4B. La ficha de HuggingFace de este repositorio lista 139.175.502.720 parámetros para el checkpoint base. No hay una cifra oficial unificada en la información disponible. Las diferencias de perplejidad entre las builds comparadas son de aproximadamente ±1 %, por lo que no se puede establecer una superioridad clara entre ellas.

## Limitaciones y advertencias

- Build experimental de la comunidad: no es una versión oficial de Qwen ni de UkisAI. No ha pasado por un proceso de validación externa amplio; en el momento de la ficha tiene 0 descargas y 0 likes.
- Licencia `other` con nombre swift-open-license-v1.0: es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial. La información disponible no detalla las restricciones concretas.
- Poda de expertos orientada a alemán e inglés: se eliminaron 160 de los 512 expertos por capa. Esto puede degradar el rendimiento en otros idiomas, dominios técnicos o tareas que dependan de los expertos descartados.
- Idiomas soportados limitados a alemán e inglés; no hay soporte documentado para español ni para otras lenguas.
- Cuantización IQ2_XS muy agresiva (aproximadamente 2,5 bits): implica pérdida de precisión. La perplejidad no separa esta build de sus hermanas dentro de ±1 %, lo que sugiere que las diferencias son pequeñas, pero no garantiza un comportamiento equivalente en todas las tareas.
- Pruebas con muestras pequeñas: 28 prompts para la puerta de idioma y 8 tareas de código. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.
- Riesgo de alucinación no medido de forma específica. El autor reporta 0 bucles y 0 respuestas en CJK en su prueba, pero esto no descarta otros modos de fallo.
- Requiere configuración específica: sin `-lm dio --lazy-mode on` o equivalente, la tabla de tokens de 26,8 GiB puede no caber en memoria. El modelo está ajustado a una GPU de 32 GB con 64 GB de memoria unificada.
- La cabeza MTP compartida necesita un fork de llama.cpp; no funciona con builds oficiales si se activa la decodificación especulativa.
- Longitud máxima de contexto no documentada: se probó a 32k, pero no se indica el máximo real de la arquitectura base.
- Fecha de creación 2026-09-30 y actualización el mismo día; el ecosistema y las herramientas asociadas pueden cambiar rápidamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ2_XS-GGUF
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Fine-tune y cuantización de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Hermano 3-bit Sakura K352 IQ3_XXS: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ3_XXS-GGUF
- Colección Sakura Micro: https://huggingface.co/collections/webmp3/sakura-micro-6aba74331f2e996ba1268a92
- Fork de llama.cpp con soporte MTP: https://github.com/danielhanchen/llama.cpp, rama `qwen4exp/mtp`, commit `6fcaa16`
- Guía de cldnavi sobre Qwen3.8-Flash-Next GGUF: https://cldnavi.com/en/blog/qwen38-flash-next-gguf-guide-2026/
- Guía de Atomic Chat sobre ejecución local: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
