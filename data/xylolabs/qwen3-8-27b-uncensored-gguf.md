# Xylolabs/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por Xylolabs. El autor ha modificado los pesos originales para eliminar la dirección de rechazo (refusal direction), una técnica conocida como abliteration, de modo que el modelo responde a solicitudes que el modelo base declina. Se distribuye en cinco niveles de cuantización (Q8_0, Q6_K, Q4_K_M, IQ4_XS y Q3_K_M) junto con los proyectores de visión necesarios para el procesamiento de imágenes.

El modelo conserva la arquitectura del Qwen3.8-27B original, con 27.320.697.856 parámetros totales y una ventana de contexto que, según la model card, puede alcanzar hasta 256K tokens en configuraciones de hardware de gama alta. Incorpora capacidades multimodales (image-text-to-text) mediante los ficheros mmproj, y está pensado para su despliegue con llama.cpp en CUDA, Metal o CPU.

La relevancia de esta ficha radica en que combina un modelo de gran tamaño con cuantizaciones agresivas que permiten ejecutarlo en GPUs de consumo (RTX 4090/3090 con 24 GB) manteniendo una calidad aceptable, y en que ofrece una variante sin restricciones de contenido, lo que interesa a investigadores que necesitan estudiar el comportamiento del modelo sin sesgos de rechazo. La licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte que la responsabilidad del uso recae en el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (solo 16 de 64 capas usan atención completa; el resto mantiene un estado fijo pequeño) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 256K tokens según hardware; 32K en GPUs de 24 GB |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ4_XS, Q3_K_M; proyectores de visión en F16 y Q8_0 |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con un esquema de atención híbrido: de las 64 capas, solo 16 utilizan atención completa (con 4 cabezas KV y tamaño de cabeza 256), mientras que las 48 restantes mantienen un estado fijo pequeño. Esta configuración reduce el coste de la caché KV y permite contextos largos con menor huella de memoria. El modelo original fue entrenado por Qwen con un corpus no especificado en la información disponible, e incluye una fase de razonamiento (thinking mode) que puede desactivarse mediante el parámetro `enable_thinking`.

Xylolabs ha aplicado una modificación sobre los pesos: la eliminación de la dirección de rechazo (abliteration), que reduce la probabilidad de que el modelo genere negativas ante solicitudes sensibles. Posteriormente convirtió los pesos a GGUF y los cuantizó con la herramienta llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`), incluyendo los proyectores multimodales para entrada de imágenes. No se dispone de información sobre el proceso de entrenamiento adicional, datasets de ajuste fino o técnicas de RLHF/DPO aplicadas por Xylolabs.

## Capacidades

- Generación de texto y razonamiento multi-step, con modo de pensamiento (thinking) activable o desactivable mediante `--chat-template-kwargs '{"enable_thinking":false}'`.
- Procesamiento de imágenes (image-text-to-text) gracias a los ficheros mmproj incluidos (F16 y Q8_0).
- Soporte de conversaciones multi-turno con contexto largo (hasta 256K tokens en hardware adecuado).
- Capacidades multilingües limitadas a inglés (en) y coreano (ko) según la model card.
- Compatible con llama.cpp, lo que permite su uso en `llama-cli` y `llama-server` con soporte para plantillas Jinja.
- No se especifica soporte explícito de tool calling o function calling en la información proporcionada.
- No se especifica soporte de agentes o multi-step reasoning más allá del modo thinking.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo varía la tasa de rechazo tras la abliteration en comparación con el modelo base, útil para analizar sesgos de seguridad en LLMs.
- Despliegue en estaciones de trabajo con RTX 4090/3090 (24 GB): la cuantización Q4_K_M (16,6 GB) permite ejecutar el modelo con 32K de contexto, adecuado para asistentes locales de análisis de documentos.
- Procesamiento de imágenes en local: con los proyectores mmproj, se puede usar para tareas de descripción de imágenes o extracción de información visual en entornos sin conexión.
- Generación de texto creativo sin restricciones: para proyectos de escritura que requieran respuestas sin filtros de contenido, aunque con la advertencia de responsabilidad del usuario.
- Evaluación comparativa de cuantizaciones: los datos de precisión (KL y top-1) publicados permiten seleccionar el nivel de cuantización óptimo según el hardware y la tolerancia a la pérdida de calidad.
- Servicio de chat multi-turno con contexto largo: en un H100 (80 GB) se puede servir con Q8_0 y 256K de contexto, útil para atención al cliente o análisis de conversaciones extensas.
- Experimentación con modelos multimodales en coreano e inglés: para tareas de traducción o análisis de contenido en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K, etc.). La model card incluye métricas de precisión de cuantización frente a BF16, medidas con llama.cpp sobre WikiText-2:

| Cuantización | Tamaño | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 29.047 GB | 0.001064 | 98.593% | 0.000521 | 99.091% | 0.001092 | 98.725% |
| Q6_K | 22.431 GB | 0.002484 | 97.652% | 0.001347 | 98.737% | 0.003059 | 97.931% |
| Q4_K_M | 16.564 GB | 0.011575 | 95.127% | 0.010301 | 97.379% | 0.019801 | 94.529% |
| IQ4_XS | 15.309 GB | 0.019903 | 93.534% | 0.014817 | 96.595% | 0.031508 | 93.441% |
| Q3_K_M | 13.501 GB | 0.055710 | 89.775% | 0.031113 | 94.672% | 0.088113 | 89.088% |

## Requisitos de hardware

- VRAM estimada: desde 13,5 GB (Q3_K_M) hasta 29,0 GB (Q8_0), más la caché KV según contexto y unos 2 GB de overhead de ejecución.
- GPU recomendadas: RTX 4090/3090 (24 GB) para Q4_K_M con 32K de contexto; RTX 5090 (32 GB) para Q6_K con 32K; RTX 6000 Ada o 2×24 GB para Q8_0 con 128K; H100 (80 GB), H200 (141 GB), B200 (192 GB) o B300 (288 GB) para Q8_0 con 256K.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M (16,6 GB) y contexto de 32K; también en RTX 5090 con Q6_K.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) con soporte CUDA, Metal o CPU; se requiere el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior. No se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede establecer una comparación básica con el modelo base Qwen/Qwen3.8-27B:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Xylolabs/Qwen3.8-27B-Uncensored-GGUF | 27,3B | Hasta 256K | Apache 2.0 | GGUF cuantizado | Abliterated, multimodal |
| Qwen/Qwen3.8-27B (base) | 27,3B | No disponible | No disponible | Safetensors (presumiblemente) | Modelo original con rechazo |

No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo puede aumentar la probabilidad de generar contenido sensible, sesgado o inapropiado; el usuario es responsable de su uso.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Idiomas soportados limitados a inglés y coreano; el rendimiento en castellano no está documentado.
- La cuantización introduce pérdida de precisión: Q3_K_M reduce el top-1 a 89,775% en WikiText-2, lo que puede afectar a tareas que requieran alta fidelidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado.
- El contexto máximo de 256K solo es alcanzable en hardware de gama alta (H100, H200, B200, B300, Mac Studio con 128 GB o más); en GPUs de 24 GB se limita a 32K.
- No se especifica soporte de tool calling ni de agentes, lo que puede limitar su uso en pipelines automatizados complejos.
- El modelo está pensado para llama.cpp; no se garantiza compatibilidad con otros runners (vLLM, TGI, Ollama) sin conversión adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.8-27B-Uncensored-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
