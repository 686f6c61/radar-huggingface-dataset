# Xylolabs/gemma-4-31B-it-GGUF

## Resumen

Gemma 4 31B IT GGUF es una colección de cuantizaciones en formato GGUF del modelo multimodal `google/gemma-4-31B-it`, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es la variante instructiva de 31B parámetros de la familia Gemma 4 de Google, con pipeline `image-text-to-text`, lo que implica capacidad de procesar imágenes y texto de entrada y generar texto.

El repositorio resuelve el problema de desplegar un modelo de ~30.700 millones de parámetros en hardware de consumo o en nodos con memoria limitada, ofreciendo cuantizaciones desde Q8_0 (32,6 GB) hasta Q2_K (11,9 GB), además de proyectores multimodales (`mmproj`) en F16 y Q8_0. Incluye una tabla de precisión frente a BF16 medida en inglés y coreano (divergencia KL media y top-1), lo que permite elegir el nivel de cuantización con datos objetivos.

Es relevante ahora porque combina un modelo multimodal de tamaño medio-grande con licencia Apache 2.0, lo que facilita su uso comercial, y porque incluye cuantizaciones con `imatrix` (IQ4_XS-imat) y comparativas directas con las cuantizaciones de Unsloth, lo que ayuda a decidir entre alternativas equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-31B-it; el repositorio es una cuantizacion GGUF) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K segun hardware (tabla del autor); ejemplo de ejecucion con `-c 8192` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, IQ4_XS-imat, Q3_K_M, IQ3_M, Q2_K; proyectores mmproj en F16 y Q8_0 |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base; solo indica que se trata de `google/gemma-4-31B-it`, un modelo multimodal `image-text-to-text` con 30.697.345.596 parámetros. La conversión a GGUF y la cuantización las realiza Xylolabs, e incluye proyectores multimodales separados (`mmproj-gemma-4-31B-it-F16.gguf` de 1,199 GB y `mmproj-gemma-4-31B-it-Q8_0.gguf` de 0,810 GB) necesarios para el procesamiento de imágenes en llama.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card tampoco detalla innovaciones de arquitectura (atención lineal, decodificación especulativa, etc.). La innovación destacable del repositorio es la metodología de cuantización: incluye una cuantización IQ4_XS con `imatrix`, una tabla de divergencia KL media y top-1 frente a BF16 medida en inglés y coreano, y una comparación directa con las cuantizaciones Q6_K y Q5_K_M de Unsloth, que resultan ligeramente inferiores en precisión (por ejemplo, Q6_K propio: KL 0,0048 y top-1 95,78 %; Unsloth Q6_K: KL 0,0054 y top-1 95,47 %).

## Capacidades

- Generación de texto conversacional en modo instruct (`-it`), con plantilla de chat compatible con `--jinja`.
- Procesamiento de imágenes y texto (`image-text-to-text`), gracias a los proyectores `mmproj` incluidos.
- Modo "thinking" configurable: se puede desactivar con `--chat-template-kwargs '{"enable_thinking":false}'` para respuestas directas.
- Soporte multilingüe limitado a inglés y coreano según la model card.
- Ejecución en llama.cpp sobre CUDA, Metal o CPU, con `llama-cli` y `llama-server`.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional autoalojado: desplegado con `llama-server` y la cuantización Q5_K_M en una RTX 5090 (32 GB), permite atender conversaciones multi-turno con hasta 32K de contexto sin depender de APIs externas.
- Análisis de documentos con imágenes: usando los proyectores `mmproj` y la cuantización Q8_0 en una H100, se pueden procesar capturas, diagramas o formularios junto con texto explicativo en una ventana de hasta 256K tokens.
- Atención al cliente en inglés y coreano: el modelo cubre ambos idiomas y puede gestionar hilos largos de conversación con contexto extendido, adecuado para mercados bilingües.
- Despliegue en estaciones de trabajo con GPU de consumo: con Q3_K_M (15,3 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB con 32K de contexto, útil para prototipos y entornos de desarrollo.
- Procesamiento por lotes en CPU o Apple Silicon: las cuantizaciones Q2_K (11,9 GB) e IQ3_M (14,4 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, con menor fidelidad respecto a BF16 (top-1 del 71,12 % y 83,13 % respectivamente).
- Investigación sobre cuantización: la tabla de precisión y las gráficas de KL permiten estudiar el compromiso entre tamaño y fidelidad, y comparar metodologías de cuantización (imatrix frente a cuantización estándar, Xylolabs frente a Unsloth).
- Evaluación multimodal en entornos aislados: al ser Apache 2.0 y ejecutable con llama.cpp, se puede integrar en pipelines internos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a BF16 en inglés y coreano:

| Cuantizacion | Tamano | KL media | Top-1 |
|---|---:|---:|---:|
| Q8_0 | 32,636 GB | 0,0015 | 97,36 % |
| Q6_K | 25,201 GB | 0,0048 | 95,78 % |
| Unsloth Q6_K | 25,200 GB | 0,0054 | 95,47 % |
| Q5_K_M | 21,846 GB | 0,0116 | 94,02 % |
| Unsloth Q5_K_M | 21,660 GB | 0,0118 | 93,68 % |
| IQ4_XS-imat | 16,736 GB | 0,0493 | 88,24 % |
| Q3_K_M | 15,287 GB | 0,1086 | 83,72 % |
| IQ3_M | 14,424 GB | 0,1230 | 83,13 % |
| Q2_K | 11,916 GB | 0,4023 | 71,12 % |

## Requisitos de hardware

- VRAM estimada según cuantización: desde 11,9 GB (Q2_K) hasta 32,6 GB (Q8_0), más el proyector multimodal (0,810 GB en Q8_0 o 1,199 GB en F16).
- GPU recomendadas por el autor:
  - RTX 4090 / RTX 3090 (24 GB): Q3_K_M con 32K de contexto.
  - RTX 5090 (32 GB): Q5_K_M con 32K de contexto.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): Q8_0 con 64K de contexto.
  - H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB), B300 (288 GB): Q8_0 con 256K de contexto.
- Cabe en GPU de consumo: sí, con Q3_K_M o inferiores en tarjetas de 24 GB; Q5_K_M en 32 GB.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con `llama-cli` y `llama-server`; compilación con `-DGGML_CUDA=ON` para NVIDIA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-31B-it-GGUF | ~30,7B | hasta 256K segun hardware | GGUF | Apache 2.0 | Cuantizaciones Q8_0 a Q2_K, con imatrix y mmproj |
| Unsloth Q6_K (gemma-4-31B-it) | ~30,7B | no disponible | GGUF | Apache 2.0 (heredada) | KL 0,0054 y top-1 95,47 %, ligeramente peor que la versión de Xylolabs |
| Unsloth Q5_K_M (gemma-4-31B-it) | ~30,7B | no disponible | GGUF | Apache 2.0 (heredada) | KL 0,0118 y top-1 93,68 %, ligeramente peor que la versión de Xylolabs |
| google/gemma-4-31B-it (BF16) | ~30,7B | no disponible | safetensors | Apache 2.0 | Modelo de referencia sin cuantizar |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Idiomas soportados oficialmente solo inglés y coreano; el rendimiento en castellano no está garantizado ni documentado.
- La cuantización introduce degradación medible: Q2_K baja al 71,12 % de top-1 y Q3_K_M al 83,72 %, por lo que no son adecuadas para tareas que requieran alta fidelidad.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base `google/gemma-4-31B-it` para confirmar compatibilidad.
- Requiere una versión concreta de llama.cpp (commit `cd959bae` o posterior); versiones anteriores pueden no cargar correctamente los pesos o el proyector multimodal.
- El modo "thinking" está activado por defecto; para respuestas directas hay que desactivarlo explícitamente con `--chat-template-kwargs`.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agénticos sin validación adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia: https://huggingface.co/Xylolabs/gemma-4-31B-it-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
