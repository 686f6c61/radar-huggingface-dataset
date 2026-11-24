# Xylolabs/Llama-3.1-8B-Instruct-GGUF

## Resumen

Xylolabs/Llama-3.1-8B-Instruct-GGUF es una redistribución cuantizada en formato GGUF del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. No se trata de un modelo nuevo: es una conversión y cuantización de los pesos originales de Meta, con el tokenizador y la plantilla de chat originales incluidos en cada fichero. El modelo base es un transformer decoder-only de 8.030.261.312 parámetros (aproximadamente 8B), entrenado por Meta y publicado bajo la Llama 3.1 Community License.

El interés práctico de esta ficha no está en la arquitectura (idéntica a la del modelo original) sino en el trabajo de cuantización: Xylolabs publica tres variantes (Q5_K_M, Q4_K_M e IQ4_XS con importance matrix) y aporta métricas de fidelidad frente a su pasada de referencia en BF16, medidas sobre 16.056 posiciones de texto en inglés y coreano. Esto permite elegir el compromiso entre tamaño en disco y degradación de la distribución de salida con datos concretos, algo que muchas conversiones GGUF no documentan.

La relevancia ahora es de despliegue: con ficheros de entre 4,45 GB y 5,73 GB, el modelo cabe en GPU de consumo (RTX 3090/4090 de 24 GB) con contexto de hasta 64K según la tabla del autor, y en GPUs de 32 GB o más con 128K. Es una opción realista para inferencia local de un modelo instructivo de 8B con ventana de contexto larga, sujeta a los términos de la licencia Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos convertidos a GGUF |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K en el modelo base; en la tabla del autor, 64K en GPU de 24 GB y 128K en GPU de 32 GB o más |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, IQ4_XS-imat |
| Idiomas soportados | en, ko (según la model card y los tags); el modelo base de Meta declara soporte multilingüe más amplio |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (un fichero por cuantización) |

Detalle de los ficheros publicados:

| Cuantizacion | Tamano | KL media vs BF16 | Mismo top-1 vs BF16 | Tipos de tensor |
|---|---|---|---|---|
| Q5_K_M | 5,73 GB | 0,0107 | 94,53% | F32: 66, Q5_K: 193, Q6_K: 33 |
| Q4_K_M | 4,92 GB | 0,0323 | 91,06% | F32: 66, Q4_K: 193, Q6_K: 33 |
| IQ4_XS-imat | 4,45 GB | 0,0359 | 90,61% | F32: 66, IQ4_XS: 193, Q5_K: 32, Q6_K: 1 |

Las métricas KL y top-1 se midieron sobre 16.056 posiciones de texto en inglés y coreano, tomando como referencia la pasada del autor en BF16 con transformers. El sufijo `-imat` indica cuantización con importance matrix.

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B Instruct original de Meta: un transformer decoder-only denso con atención por cabezas agrupadas (GQA), activaciones SwiGLU, RoPE y normalización RMSNorm. Esta ficha no aporta detalles nuevos sobre el preentrenamiento, el número de tokens, la composición del dataset ni las etapas de alineación (SFT/RLHF/DPO) del modelo base; esa información debe consultarse en la model card de meta-llama/Llama-3.1-8B-Instruct y en el informe técnico de la familia Llama 3 (arXiv:2407.21783).

La contribución técnica de esta publicación es la cuantización. Los tres ficheros se generaron con llama.cpp (verificados con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`) y uno de ellos, IQ4_XS, incorpora importance matrix, una técnica que pondera el error de cuantización según la importancia de cada peso para reducir la degradación. Cada fichero incluye el modelo completo, el tokenizador original y la plantilla de chat, de modo que no se necesitan ficheros auxiliares para usarlo con `llama-cli` o `llama-server` y la flag `--jinja`.

## Capacidades

- Generación de texto conversacional e instrucciones multi-turno, heredadas del modelo Instruct de Meta.
- Razonamiento y matemáticas a nivel de un modelo denso de 8B, sin modo de pensamiento explícito declarado en esta publicación.
- Generación de código, con la calidad del Llama 3.1 8B Instruct original; esta ficha no aporta evaluaciones propias de código.
- Soporte de contexto largo: hasta 128K tokens en hardware con memoria suficiente según la tabla del autor, y 64K en GPU de 24 GB.
- Multilingüe limitado en la práctica a inglés y coreano según la model card y los tags de esta conversión; el modelo base declara más idiomas, pero esta publicación no los valida.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp (`llama-cli`, `llama-server`).
- No se declaran capacidades de visión, audio, tool calling específico ni agentes en la información disponible de esta publicación; deben verificarse contra la model card del modelo base.

## Casos de uso

- Asistente conversacional local: desplegado con `llama-server` y el fichero Q5_K_M, permite servir un chatbot instructivo en una estación de trabajo con RTX 4090 manteniendo 64K de contexto, sin depender de APIs externas.
- Procesamiento de documentos largos en local: con 128K de contexto en GPUs de 32 GB o más, se pueden resumir o extraer información de contratos, informes o hilos de correo completos en una sola pasada.
- Prototipado y evaluación de pipelines: la variante IQ4_XS-imat (4,45 GB) permite ejecutar el modelo en portátiles con GPU modesta o incluso en CPU vía llama.cpp, útil para pruebas de integración antes de escalar a hardware mayor.
- Generación de código en entornos aislados: al ser un modelo denso de 8B ejecutable en local, encaja en flujos donde el código no puede salir de la infraestructura del equipo; la calidad debe validarse con pruebas propias, ya que esta publicación no incluye benchmarks de código.
- Atención al cliente en coreano e inglés: la model card documenta y valida ambos idiomas en las métricas de cuantización, lo que respalda su uso en soporte bilingüe para esos dos mercados.
- Despliegue en hardware Apple Silicon: la tabla del autor incluye Mac Studio M5 Max y M5 Ultra con memoria unificada, permitiendo servir el modelo con Metal y 128K de contexto en un equipo de sobremesa.
- Fine-tuning ligero y experimentación: los GGUF no son el formato ideal para entrenar, pero el modelo base original sí puede ajustarse y luego cuantizarse con el mismo pipeline documentado aquí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de fidelidad de la cuantización frente a BF16 (KL media y porcentaje de mismo top-1), reproducidas en la tabla de especificaciones. No hay datos de MMLU, HumanEval, GSM8K ni comparativas de rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: el autor aplica la regla de que el fichero más el KV cache en f16 al contexto objetivo más 2 GB de runtime debe quedar por debajo del 90% de la memoria disponible.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) con Q5_K_M y contexto de 64K; RTX 5090 (32 GB) con Q5_K_M y 128K.
- GPU profesional: RTX 6000 Ada o dos GPUs de 24 GB (48 GB), H100 (80 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB) y RTX PRO 6000 Blackwell (96 GB), todas con Q5_K_M y 128K de contexto según la tabla del autor.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB), con Q5_K_M y 128K.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior; compilación con `-DGGML_CUDA=ON` para NVIDIA. La publicación no documenta otros runners (vLLM, TGI, Ollama), aunque el formato GGUF es compatible con ellos en general.
- Flags recomendadas por el autor: `--jinja -c 8192 -ngl 99` en el ejemplo de `llama-cli`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Llama-3.1-8B-Instruct-GGUF | 8,03B | 128K (64K en 24 GB) | GGUF (Q5_K_M, Q4_K_M, IQ4_XS-imat) | Llama 3.1 Community | Métricas de fidelidad de cuantización publicadas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | safetensors | Llama 3.1 Community | Modelo base oficial; requiere conversión propia a GGUF |
| Otras conversiones GGUF comunitarias de Llama-3.1-8B-Instruct | 8,03B | 128K | GGUF | Llama 3.1 Community | No disponibles en la información proporcionada para comparar métricas |

No se dispone de datos de benchmarks del modelo base ni de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Sesgos: no documentados en esta publicación; hereda los sesgos del modelo base de Meta, que deben evaluarse antes de uso en producción.
- Alucinación: riesgo propio de un modelo de 8B sin modo de razonamiento explícito; no se han publicado evaluaciones de fiabilidad en esta conversión.
- Idiomas: la model card solo valida inglés y coreano. El uso en castellano u otros idiomas no está respaldado por las métricas de esta publicación, aunque el modelo base declare soporte multilingüe.
- Cuantización: Q4_K_M e IQ4_XS-imat degradan la distribución de salida (KL media de 0,0323 y 0,0359, y mismo top-1 de 91,06% y 90,61% frente a BF16). Para tareas sensibles a la fidelidad, Q5_K_M es la opción con menor desviación (KL 0,0107, top-1 94,53%).
- Licencia: Llama 3.1 Community License, sujeta también a la Acceptable Use Policy y a los términos comerciales adicionales. El uso comercial requiere revisar ambas condiciones; los nombres de modelo deben empezar por "Llama".
- Contexto: los 128K solo son alcanzables con memoria suficiente; en GPU de 24 GB el autor limita el contexto práctico a 64K.
- Compatibilidad: requiere llama.cpp en el commit indicado o posterior; versiones anteriores pueden no interpretar correctamente los ficheros.
- Atribución: Xylolabs no está afiliada ni respaldada por Meta; la conversión y cuantización son responsabilidad del publicador.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Informe técnico de Llama 3: https://arxiv.org/abs/2407.21783
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-GGUF/blob/main/LICENSE
