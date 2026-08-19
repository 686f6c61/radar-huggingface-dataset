# syvai/Qwen3.8-27B-DFlash2-W4A16

## Resumen

`syvai/Qwen3.8-27B-DFlash2-W4A16` es un modelo auxiliar de decodificación especulativa (draft model) diseñado para acelerar la inferencia del modelo denso multimodal `Qwen3.8-27B` de Alibaba. Se trata de una versión cuantizada a W4A16 (pesos en int4, activaciones en bf16) del drafter de bloque DFlash2 desarrollado por Inco, que originalmente pesa 3.85 GB en bf16 y se reduce a 1.19 GB tras la cuantización con GPTQ. El objetivo es que quepa junto al modelo target de 27B en una tarjeta gráfica de 24 GB, como la RTX 3090, sin sacrificar la tasa de aceptación de tokens.

El modelo fue creado por el usuario syvai como parte del proyecto `syv-ai/qwen38-27b-rtx3090`, que busca ejecutar Qwen3.8-27B en una sola RTX 3090 usando vLLM. El drafter comparte las capas de embeddings y lm_head con el modelo target, por lo que no los incluye en sus pesos. Su licencia es Apache-2.0, igual que la del drafter original de Inco.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de bloque DFlash2 (5 capas estilo Qwen3, con grouped-conv kernel projections y candidate selector) |
| Parametros totales | 1.924.404.480 (1.92B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo target Qwen3.8-27B, que soporta 262K nativo) |
| Tipos de cuantizacion | W4A16 (int4 GPTQ, group size 128, simétrico, kernel Marlin) vía compressed-tensors; algunas capas (norms, grouped-conv, candidate_selector) permanecen en bf16 |
| Idiomas soportados | No disponible (depende del modelo target) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un drafter de bloque para decodificación especulativa, basado en la arquitectura DFlash2 de Inco. Consiste en 5 capas que imitan el estilo de las capas de Qwen3, más un proyector `fc` (5120×25600) que mapea los hidden states del modelo target (capas 5, 19, 33, 47, 61) al espacio del drafter. Incluye también proyecciones de kernel con convoluciones agrupadas y un selector de candidatos. No es un transformer autónomo: su función es proponer secuencias de tokens que el modelo target verifica en paralelo, reduciendo el número de pasos de decodificación.

La cuantización se realizó con GPTQ sobre los tensores de atención y MLP (1.61B parámetros), usando hessianas calculadas a partir de las entradas del propio drafter sobre 400 prompts reales (~290k filas por capa). Las filas de las proyecciones k/v se mezclaron adicionalmente con la distribución de entrada del precompute de contexto-KV. El proyector `fc` también se cuantizó a int4, aunque mantenerlo en bf16 no mostró diferencias de aceptación. El resto de componentes (norms, grouped-conv, candidate_selector) se dejaron en bf16 por su tamaño reducido.

## Capacidades

- Decodificación especulativa: propone hasta 7 tokens por paso (configurable) para acelerar la inferencia del modelo target Qwen3.8-27B.
- Compatibilidad con vLLM: requiere vLLM 0.27.1 con el parche `dflash2-backport.patch` o vLLM main con PR #52816.
- Compartición de embeddings y lm_head: el drafter no incluye estos componentes, sino que los toma del modelo target, lo que reduce el tamaño total.
- Eficiencia de memoria: al estar cuantizado a W4A16, lee 2.7 GB menos por paso de decodificación en comparación con el drafter bf16.
- Integración con hardware limitado: diseñado específicamente para ejecutar Qwen3.8-27B en una RTX 3090 de 24 GB.
- No tiene capacidades propias de generación de texto, visión ni razonamiento; su única función es acelerar la inferencia del modelo al que acompaña.

## Casos de uso

- Inferencia local de Qwen3.8-27B en una RTX 3090: el drafter cuantizado permite ejecutar el modelo completo (target + drafter) en 24 GB de VRAM, algo inviable con el drafter bf16 (que ocuparía 3.85 GB adicionales). Es útil para desarrolladores que quieren desplegar el modelo en hardware de consumo.
- Aceleración de chatbots y asistentes conversacionales: al reducir el número de pasos de decodificación, se disminuye la latencia en interacciones multi-turno, mejorando la experiencia de usuario en aplicaciones de chat en tiempo real.
- Generación de código en entornos de desarrollo integrado: Qwen3.8-27B destaca en tareas de programación; el drafter permite obtener respuestas más rápidas en autocompletado o generación de código dentro de editores, siempre que el hardware sea una GPU de 24 GB.
- Automatización de oficina y agentes: el modelo target soporta tool calling y flujos agénticos; la decodificación especulativa reduce el tiempo de espera en pipelines que requieren múltiples llamadas al modelo.
- Investigación en decodificación especulativa: este drafter cuantizado sirve como referencia para estudiar el impacto de la cuantización W4A16 en la tasa de aceptación y el rendimiento de la decodificación especulativa.
- Despliegue en entornos con restricciones de memoria: al ocupar solo 1.19 GB, es viable en configuraciones donde el espacio en VRAM es crítico, como servidores con múltiples modelos o GPUs compartidas.

## Benchmarks y rendimiento

La model card proporciona datos de rendimiento medidos en una RTX 3090 con vLLM 0.27.1 y los parches del repositorio, usando 8 prompts de chat reales de 1024 tokens. Los resultados comparan el drafter cuantizado W4A16 con el drafter original en bf16:

| Metrica | Drafter W4A16 | Drafter bf16 |
|---|---|---|
| Aceptacion en modo greedy (tokens por paso) | 3.65 | 3.54 |
| Aceptacion con sampling por defecto (tokens por paso) | 3.2 | 3.4 |
| Lectura de memoria por paso de decodificacion | 2.7 GB menos que bf16 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje completo, sino un componente auxiliar. La métrica relevante es la tasa de aceptación de tokens, que se mantiene prácticamente igual en modo greedy y es ligeramente inferior (5%) con sampling por defecto.

## Requisitos de hardware

- VRAM estimada: el drafter cuantizado ocupa 1.19 GB. Junto con el modelo target Qwen3.8-27B (que requiere aproximadamente 22-23 GB en cuantización similar), cabe en una GPU de 24 GB como la RTX 3090, RTX 4090 o A5000.
- GPU recomendadas: RTX 3090 (la plataforma de desarrollo del proyecto), RTX 4090, A5000, o cualquier GPU con 24 GB de VRAM y soporte para kernels Marlin (Ampere o posterior).
- Inferencia en CPU: no recomendado; la decodificación especulativa con este drafter está pensada para GPUs con vLLM.
- Opciones de despliegue: vLLM 0.27.1 con el parche `dflash2-backport.patch` (disponible en el repositorio de syv-ai) o vLLM main con PR #52816. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan valores absolutos, pero la reducción de 2.7 GB de lectura por paso de decodificación se traduce en una mejora significativa del tiempo por token en GPUs con ancho de banda limitado como la RTX 3090.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|---|
| syvai/Qwen3.8-27B-DFlash2-W4A16 | Drafter DFlash2 | 1.92B | W4A16 (int4 GPTQ) | Depende del target | Apache-2.0 |
| incoai/Qwen3.8-27B-DFlash2 | Drafter DFlash2 original | 1.92B | bf16 | Depende del target | Apache-2.0 |
| Israeli-AI/Qwen3.8-27B-MTP-W4A16-VOLTA-Ampere | Drafter MTP (multi-token prediction) | No disponible | W4A16 | Depende del target | No disponible |

El drafter DFlash2 se diferencia del MTP head nativo de Qwen3.8-27B en que utiliza una arquitectura de bloque con proyecciones de kernel y un selector de candidatos, lo que permite una mayor tasa de aceptación en algunos escenarios. La versión cuantizada de syvai ofrece el mismo rendimiento que el drafter bf16 en modo greedy, con un tercio del tamaño, lo que la hace más adecuada para GPUs de 24 GB.

## Limitaciones y advertencias

- Modelo auxiliar: no puede generar texto por sí mismo; requiere el modelo target Qwen3.8-27B y una integración específica con vLLM (parche o PR #52816).
- Dependencia de la cuantización del target: si el lm_head del modelo target está cuantizado (por ejemplo, en int4), el parche del repositorio es necesario porque vLLM rechaza lm_head no bf16 para el top-k de candidatos.
- Ligera pérdida de aceptación con sampling: en el modo de muestreo por defecto, la tasa de aceptación es un 5% inferior a la del drafter bf16, lo que puede afectar la velocidad en aplicaciones que usan temperatura > 0.
- Sin soporte fuera de vLLM: no hay integraciones con otros motores de inferencia (llama.cpp, Ollama, TGI) documentadas.
- Compatibilidad de versiones: el parche está pensado para vLLM 0.27.1; versiones más recientes pueden requerir ajustes adicionales.
- Sesgos y alucinaciones: al ser un modelo auxiliar, no introduce sesgos propios, pero hereda las limitaciones del modelo target (Qwen3.8-27B), que pueden incluir alucinaciones y sesgos en ciertos idiomas o dominios.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero hay que verificar la licencia del modelo target Qwen3.8-27B, que también es Apache-2.0 según la documentación oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- Repositorio del proyecto (syv-ai/qwen38-27b-rtx3090): https://github.com/syv-ai/qwen38-27b-rtx3090
- Blog de Inco sobre DFlash2: https://inco.ai/blog/dflash2/
- Repositorio de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Modelo drafter original (incoai/Qwen3.8-27B-DFlash2): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo alternativo MTP cuantizado (Israeli-AI): https://huggingface.co/Israeli-AI/Qwen3.8-27B-MTP-W4A16-VOLTA-Ampere
