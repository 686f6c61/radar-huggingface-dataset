# Xylolabs/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Xylolabs. El modelo base es un transformer denso de 27.320.697.856 parámetros (unos 27,3 mil millones) desarrollado por el equipo Qwen, y esta variante está pensada para su ejecución local mediante llama.cpp sobre CUDA, Metal o CPU, sin necesidad de infraestructura de servidor dedicada.

El pipeline declarado es image-text-to-text, de modo que el modelo acepta tanto texto como imágenes como entrada, y los ficheros mmproj (proyector multimodal) se distribuyen por separado para habilitar esa capacidad en llama.cpp. La licencia Apache 2.0 del modelo base se mantiene en esta redistribución, lo que facilita su uso comercial y su integración en productos derivados.

La relevancia de esta ficha radica en que ofrece un conjunto amplio de cuantizaciones (desde Q8_0 hasta Q2_K, incluyendo una variante IQ4_XS con imatrix) con métricas de divergencia KL y acuerdo top-1 frente al original en BF16, lo que permite elegir el equilibrio entre tamaño en disco y fidelidad de forma informada. El repositorio ocupa 156,9 GB en total y acumula 8.770 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa `-c 8192`, pero no se declara el máximo) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS (imatrix), Q3_K_M, IQ3_M, Q2_K |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal en mmproj F16 y Q8_0 |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer denso de aproximadamente 27,3 mil millones de parámetros con capacidad multimodal (entrada de imagen y texto). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card de esta variante cuantizada no reproduce esa información del autor original.

La aportación técnica de esta publicación es la cuantización para llama.cpp, realizada sobre un commit concreto (`cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior). Se incluye una variante IQ4_XS generada con imatrix, y se publican métricas de fidelidad frente a BF16 (divergencia KL y acuerdo top-1) sobre WikiText-2, un conjunto de chat y un conjunto held-out, lo que permite comparar la pérdida de calidad entre cuantizaciones y frente a alternativas de otros publicadores (Unsloth y otros). El modelo soporta un modo de razonamiento ("thinking") que puede desactivarse mediante `--chat-template-kwargs '{"enable_thinking":false}'`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes junto con texto (image-text-to-text), mediante los ficheros mmproj distribuidos aparte.
- Modo de razonamiento explícito (thinking), desactivable por parámetro de plantilla de chat.
- Ejecución local en llama.cpp sobre CUDA, Metal o CPU.
- Compatibilidad con `llama-cli` y `llama-server` (API compatible con endpoints).
- Soporte de plantilla de chat tipo Jinja (`--jinja`).
- Capacidades multilingües limitadas a inglés y coreano según los metadatos declarados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional multimodal: con la cuantización Q4_K_M (16,564 GB) o Q5_K_M (19,536 GB) se puede ejecutar en una estación de trabajo con GPU de consumo alta y mantener conversaciones multi-turno con entrada de imágenes.
- Análisis de documentos con imágenes: el modelo puede recibir capturas, diagramas o páginas escaneadas junto a texto y responder preguntas sobre ellas, usando el proyector mmproj Q8_0 (0,629 GB) para reducir huella.
- Prototipado de producto sin dependencia de la nube: al ser Apache 2.0 y ejecutable con llama.cpp, permite validar funcionalidades de visión-lenguaje en local antes de decidir un despliegue en servidor.
- Servicio interno con `llama-server`: se puede exponer una API compatible con endpoints para integrar el modelo en herramientas internas, eligiendo la cuantización según la VRAM disponible.
- Investigación sobre cuantización: las tablas de divergencia KL y acuerdo top-1 permiten estudiar el impacto de cada nivel de cuantización (de Q8_0 a Q2_K) en tareas de texto y chat, y comparar con las variantes de Unsloth.
- Evaluación de fidelidad en pipelines de CI: usar el conjunto held-out reportado para comprobar que una nueva compilación de llama.cpp o un cambio de cuantización no degrada la salida respecto a BF16.
- Generación asistida en coreano o inglés: para equipos que trabajan en esos dos idiomas, el modelo cubre ambas lenguas de forma nativa según los metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica métricas de fidelidad de cuantización frente a BF16 (divergencia KL, menor es mejor; y acuerdo top-1), medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 29,047 GB | 0,000867 | 98,672% | 0,002304 | 99,059% | 0,001067 | 98,794% |
| Q6_K | 22,431 GB | 0,002161 | 97,951% | 0,004358 | 98,245% | 0,003333 | 97,824% |
| Q5_K_M | 19,536 GB | 0,004578 | 96,902% | 0,008445 | 97,598% | 0,008101 | 96,794% |
| Q4_K_M | 16,564 GB | 0,010464 | 95,574% | 0,019746 | 95,745% | 0,019950 | 95,412% |
| Q4_K_S | 15,358 GB | 0,015845 | 94,549% | 0,030877 | 94,990% | 0,030020 | 94,324% |
| IQ4_XS-imat | 15,309 GB | 0,017617 | 94,157% | 0,032862 | 94,598% | 0,032699 | 93,775% |
| Q3_K_M | 13,501 GB | 0,051699 | 90,142% | 0,105065 | 90,559% | 0,089243 | 89,275% |

Para referencia, la model card incluye comparaciones con cuantizaciones de Unsloth y de otros publicadores; por ejemplo, Unsloth UD-Q4_K_M (16,564 GB) reporta KL 0,007576 y top-1 96,201% en WikiText-2, frente a 0,010464 y 95,574% de esta Q4_K_M. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el proyector multimodal y el contexto. Q8_0 requiere unos 29 GB; Q5_K_M unos 19,5 GB; Q4_K_M unos 16,6 GB; Q3_K_M unos 13,5 GB; Q2_K unos 10,9 GB.
- Proyector multimodal: añadir 0,928 GB (F16) o 0,629 GB (Q8_0) si se usa entrada de imagen.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB para Q4_K_S o IQ4_XS; GPUs de 12 GB para Q3_K_M o IQ3_M; Q2_K podría caber en 12 GB con contexto reducido.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M y menores en RTX 4090; en 16 GB conviene Q4_K_S o IQ4_XS; en 12 GB, Q3_K_M.
- Opciones de despliegue: llama.cpp (compilación con `-DGGML_CUDA=ON` para NVIDIA, Metal en Apple, CPU), `llama-cli` y `llama-server`; requiere el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs Qwen3.8-27B-GGUF (esta ficha) | 27,3 B | No disponible | Apache 2.0 | GGUF + mmproj | 9 cuantizaciones, métricas KL publicadas |
| Unsloth Qwen3.8-27B (UD quants) | 27,3 B (base comun) | No disponible | Apache 2.0 | GGUF | Cuantizaciones dinámicas UD; Q4_K_M con KL 0,007576 y top-1 96,201% en WikiText-2 |
| Otros publicadores de Qwen3.8-27B GGUF | 27,3 B (base comun) | No disponible | Apache 2.0 | GGUF | Varias Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ3_S reportadas en la tabla comparativa de la model card |

No se dispone de información sobre otros modelos de distinto tamaño o familia con los que comparar rendimiento de tareas.

## Limitaciones y advertencias

- Idiomas declarados limitados a inglés (en) y coreano (ko); el rendimiento en castellano no está documentado.
- No se han publicado resultados de benchmarks de tareas, por lo que la calidad real en razonamiento, código o matemáticas no está cuantificada en esta ficha.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluación específica publicada para esta variante.
- Las cuantizaciones bajas (Q3_K_M, IQ3_M, Q2_K) muestran una degradación notable: Q3_K_M baja a 90,142% de acuerdo top-1 en WikiText-2 y 89,275% en held-out, frente a 98,672% y 98,794% de Q8_0.
- La variante IQ4_XS-imat no supera a Q4_K_S en las métricas publicadas (KL 0,017617 frente a 0,015845 en WikiText-2), pese a ser ligeramente más pequeña.
- Requiere una compilación concreta de llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior); versiones anteriores pueden no cargar correctamente los ficheros.
- El proyector multimodal se distribuye como fichero separado; sin él, el modelo funciona solo con texto.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de los pesos originales.
- El repositorio ocupa 156,9 GB; la descarga selectiva de un único fichero GGUF es recomendable.
- Solo 1 like y 8.770 descargas en el momento de la consulta: menor validación comunitaria que otras distribuciones del mismo modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.8-27B-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
