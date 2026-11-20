# Xylolabs/Qwen3.8-27B-GGUF

## Resumen

Xylolabs/Qwen3.8-27B-GGUF es una colección de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un transformer multimodal de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por Qwen (Alibaba Cloud), con pipeline image-text-to-text y soporte declarado para inglés y coreano. Esta versión GGUF no modifica la arquitectura ni los pesos más allá de la conversión a BF16 GGUF y la cuantización posterior.

El interés principal de esta publicación reside en la calidad de las cuantizaciones y en la documentación de las métricas de degradación. El autor reporta valores de divergencia KL y coincidencia top-1 frente a la referencia BF16 para diez variantes (desde Q8_0 hasta Q2_K), además de una comparativa directa con los ficheros Q4 de Unsloth. Para Q5_K_M, el cuantizado equilibrado recomendado, se reporta KL medio de 0,0047 y top-1 del 95,44 % frente a BF16.

La relevancia actual es práctica: permite ejecutar un modelo de 27B con capacidades de visión en hardware de consumo mediante cuantizaciones de 10,86 GB a 29,05 GB, con un proyector visual separado de 0,63 GB (Q8_0) o 0,93 GB (F16). La licencia Apache 2.0 se mantiene sin cambios respecto al modelo original, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con componentes SSM (según el recetario de tensores: proyecciones de atención, SSM y MLP); multimodal image-text-to-text |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS-imat, IQ4_XS, Q3_K_M, IQ3_M, Q2_K; proyector visual en F16 y Q8_0 |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de 27,3B parámetros que combina bloques de atención con componentes SSM, según se deduce del recetario de tensores publicado (se mencionan explícitamente proyecciones de atención, SSM y MLP, además de `ssm_a`, `ssm_dt.bias` y `ssm_conv1d`). Incluye un proyector visual independiente que se distribuye como fichero `mmproj` aparte, en F16 (0,93 GB) o Q8_0 (0,63 GB), compatible con cualquier cuantización del modelo de lenguaje. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

El proceso de cuantización sí está documentado con detalle. Xylolabs convirtió los pesos originales a BF16 GGUF con `convert_hf_to_gguf.py` (y el proyector con `--mmproj`), construyó una importance matrix con `llama-imatrix` sobre 60 fragmentos de texto de calibración en inglés y coreano, y cuantizó con `llama-quantize --imatrix`. Para Q4_K_M y Q4_K_S se aplicó una mezcla de tipos por tensor resuelta a partir de la KL medida por tensor y tipo (`MIX-Q4_K_M.args`, `MIX-Q4_K_S.args`), aplicada con `--tensor-type-file`. Las matrices de pesos usan el tipo del fichero, salvo `output.weight`, que va en Q6_K; normas, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d` y las normas q/k (360 tensores, 10,7 MB) se mantienen en F32.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en el propio fichero GGUF.
- Comprensión de imagen y texto combinados (pipeline image-text-to-text) mediante el proyector visual `mmproj`.
- Modo de razonamiento (thinking) activable por defecto; se puede desactivar con `--chat-template-kwargs '{"enable_thinking":false}'` en llama.cpp para obtener respuestas directas.
- Soporte multilingüe limitado a inglés y coreano según los metadatos del modelo.
- Ejecución en CUDA, Metal y CPU a través de llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Despliegue local de un asistente conversacional de 27B en una estación de trabajo: con Q4_K_M (16,56 GB) o Q5_K_M (19,54 GB) se obtiene un equilibrio razonable entre calidad (KL 0,0097 y 0,0047 respectivamente) y requisitos de memoria, ejecutable con `llama-server` y la plantilla de chat integrada.
- Análisis de documentos e imágenes en local: el proyector visual Q8_0 (0,63 GB) permite adjuntar imágenes a las consultas sin depender de servicios en la nube, útil en entornos con requisitos de privacidad.
- Generación de código y matemáticas en pipelines de desarrollo: la importance matrix incluye texto de código y matemáticas en formato chat, y la comparativa de KL sobre texto de chat (0,0162 para Q4_K_M) permite estimar la degradación esperada en estas tareas.
- Atención al cliente automatizada en inglés y coreano: el soporte nativo de ambos idiomas y la calibración de la importance matrix sobre textos en esas dos lenguas reducen la degradación en producción bilingüe.
- Prototipado e investigación en hardware de consumo: con Q2_K (10,86 GB) o IQ3_M (12,77 GB) se puede ejecutar el modelo en GPUs de gama alta para consumo, aceptando la pérdida de fidelidad documentada (top-1 del 79,21 % y 85,95 % respectivamente).
- Evaluación comparativa de cuantizaciones: las métricas KL y top-1 publicadas por fichero permiten seleccionar la variante adecuada según la restricción de VRAM y el umbral de calidad aceptable, sin necesidad de repetir la evaluación.
- Sustitución de despliegues en CPU: llama.cpp con backend CPU permite servir el modelo en servidores sin GPU, usando cuantizaciones bajas (Q3_K_M, IQ3_M) donde la latencia no sea crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas de fidelidad de cuantización frente a BF16, medidas sobre 4.094 posiciones de un texto en inglés y otro en coreano (2.048 tokens cada uno):

| Quant | Tamaño | KL media vs BF16 | Top-1 igual vs BF16 |
|---|---|---|---|
| Q8_0 | 29,05 GB | 0,0009 | 97,82 % |
| Q6_K | 22,43 GB | 0,0023 | 96,83 % |
| Q5_K_M | 19,54 GB | 0,0047 | 95,44 % |
| Q4_K_M | 16,56 GB | 0,0097 | 93,46 % |
| Q4_K_S | 15,36 GB | 0,0161 | 92,12 % |
| IQ4_XS-imat | 15,31 GB | 0,0195 | 91,65 % |
| IQ4_XS | 15,42 GB | 0,0250 | 90,38 % |
| Q3_K_M | 13,50 GB | 0,0545 | 86,75 % |
| IQ3_M | 12,77 GB | 0,0614 | 85,95 % |
| Q2_K | 10,86 GB | 0,1725 | 79,21 % |

Comparativa con los ficheros Q4 de Unsloth, medida con el mismo build, textos y referencia (texto de chat: 20.440 posiciones de inglés, coreano, código y matemáticas en formato chat):

| Fichero | Tamaño | KL media vs BF16 | KL media en chat | Top-1 igual vs BF16 |
|---|---|---|---|---|
| Xylolabs Q4_K_M | 16,56 GB | 0,0097 | 0,0162 | 93,46 % |
| Unsloth UD-Q4_K_M | 16,56 GB | 0,0093 | 0,0185 | 93,95 % |
| Xylolabs Q4_K_S | 15,36 GB | 0,0161 | 0,0265 | 92,12 % |
| Unsloth UD-Q4_K_S | 15,36 GB | 0,0157 | 0,0267 | 92,73 % |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,86 GB (Q2_K) y 29,05 GB (Q8_0) solo para los pesos del modelo de lenguaje; hay que sumar 0,63 GB (proyector Q8_0) o 0,93 GB (proyector F16) si se usa visión, más el espacio de contexto KV.
- GPU recomendadas: para Q8_0 y Q6_K se requiere una GPU de 32 GB o más (A100 40 GB, H100, RTX 5090 de 32 GB). Para Q5_K_M y Q4_K_M, GPUs de 24 GB (RTX 4090, RTX 3090, A10G 24 GB) son suficientes para los pesos, con margen limitado para contexto. Para Q3_K_M, IQ3_M y Q2_K, GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) o incluso 12 GB en el caso de Q2_K con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_M, y en GPUs de 16 GB con Q3_K_M o IQ3_M. Q2_K (10,86 GB) es la opción para 12 GB de VRAM.
- Opciones de despliegue: llama.cpp (compilación con `-DGGML_CUDA=ON` para NVIDIA, Metal para Apple Silicon, CPU), `llama-cli` y `llama-server`. Se requiere el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Xylolabs/Qwen3.8-27B-GGUF | 27,3B | no disponible | en, ko | Apache 2.0 | GGUF | Multimodal; 10 cuantizaciones; métricas KL publicadas |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | en, ko | Apache 2.0 | safetensors (BF16) | Modelo original; sin cuantizar; requiere más VRAM |
| Unsloth UD-Q4_K_M / UD-Q4_K_S | 27,3B (derivados) | no disponible | en, ko | Apache 2.0 | GGUF | Mismo tamaño de fichero; KL ligeramente menor en media global, mayor en texto de chat según las mediciones de Xylolabs |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se declaran inglés y coreano como idiomas soportados; el rendimiento en castellano no está validado y la importance matrix se calibró únicamente con textos en inglés y coreano.
- La degradación por cuantización es significativa en las variantes bajas: Q2_K presenta KL de 0,1725 y top-1 del 79,21 %, lo que implica una pérdida sustancial de fidelidad respecto a BF16. No se recomienda para producción.
- Las métricas KL y top-1 se midieron sobre 4.094 posiciones de dos textos (inglés y coreano) y, en el caso de chat, sobre 20.440 posiciones; son indicativas y no sustituyen una evaluación de tareas específicas.
- No hay resultados de benchmarks de tareas publicados, por lo que no se puede estimar el rendimiento en MMLU, HumanEval, GSM8K u otras pruebas estándar a partir de esta ficha.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el fichero `LICENSE` y el `NOTICE` que atribuye el modelo fuente y su titular de derechos.
- Xylolabs declara no estar afiliada ni respaldada por Qwen ni por Alibaba Cloud.
- La longitud de contexto no está especificada; el ejemplo de ejecución usa 8.192 tokens, pero no se confirma el máximo soportado.
- No se documenta soporte de tool calling ni de razonamiento agéntico, lo que limita su uso en pipelines que dependan de estas capacidades.
- Requiere un commit concreto de llama.cpp o posterior; versiones anteriores pueden no cargar correctamente los tensores SSM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.8-27B-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
