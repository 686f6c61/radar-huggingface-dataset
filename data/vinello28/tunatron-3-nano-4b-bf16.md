# vinello28/Tunatron-3-Nano-4B-BF16

## Resumen

Tunatron-3-Nano-4B es un ajuste fino del modelo `unsloth/NVIDIA-Nemotron-3-Nano-4B` (a su vez derivado de la familia Nemotron 3 de NVIDIA) especializado en triaje de hallazgos de análisis estático de seguridad (SAST). Desarrollado por el usuario `vinello28`, el modelo recibe una regla CWE, un sink candidato y la porción de código hacia atrás (backward slice) que llega hasta ese sink, y decide si la vulnerabilidad es real, emitiendo un objeto JSON estructurado con severidad, estado VEX, razonamiento y parche sugerido. Resuelve el problema clásico de los falsos positivos en herramientas SAST: en lugar de marcar todo flujo sospechoso, el modelo razona sobre el contexto del slice.

Arquitectura híbrida heredada de Nemotron 3 Nano, con 3.973.556.832 parámetros totales (aproximadamente 4B) y pesos en BF16. El modelo base combina atención con capas Mamba/SSM (etiqueta `nemotron_h` en Hugging Face), lo que explica la presencia de `mamba_ssm_cache_dtype` en los parámetros de servicio con vLLM. El ajuste se realizó con DoRA sobre el modelo base de Unsloth, y se distribuyen checkpoints en BF16, FP8 y NVFP4 (este último cuantizado con NVIDIA ModelOpt).

Es relevante ahora porque demuestra un patrón práctico: modelos pequeños (4B) especializados mediante ajuste fino pueden sustituir o complementar heurísticas en pipelines de seguridad, con salidas guiadas por JSON-schema y despliegue en una sola GPU consumer. La licencia es la NVIDIA Nemotron Open Model License, no una licencia permisiva estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba/SSM (tag `nemotron_h`, `custom_code`) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servicio usa `--max-model-len 8192` |
| Tipos de cuantizacion | BF16 (este repo), FP8 y NVFP4 (repos separados, vía NVIDIA ModelOpt) |
| Idiomas soportados | inglés (prompt de sistema y salidas `reasoning`/`suggested_fix` en inglés); metadatos de idioma: `it`, `en` |
| Licencia | NVIDIA Nemotron Open Model License (`license: other`) |
| Formato de pesos | safetensors (repo de 15,9 GB en BF16) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/NVIDIA-Nemotron-3-Nano-4B`, un transformer híbrido de la familia Nemotron 3 Nano que intercala mecanismos de atención con capas de espacio de estados (Mamba/SSM), identificado en Hugging Face con la arquitectura `nemotron_h` y que requiere `trust_remote_code`. Esta combinación busca reducir el coste de memoria de la caché KV en contextos largos, algo relevante para slices de código extensos; de ahí que el ejemplo de vLLM fije `--mamba_ssm_cache_dtype float32`.

El ajuste fino se realizó con DoRA (variante de LoRA con descomposición de magnitud y dirección) sobre el modelo base, usando prompts en formato chat con el modo "thinking" desactivado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Los tags del repositorio apuntan a un corpus orientado a seguridad: SAST, detección de vulnerabilidades, DORA, CWE y referencias a los papers arXiv:2403.18624, arXiv:2505.19828 y arXiv:2509.04260. La model card menciona además un componente en Rust (`sast-engine_slicer`) para generar los backward slices que consume el modelo.

## Capacidades

- Triaje de vulnerabilidades SAST: dado un CWE, un sink y el backward slice, decide `vulnerable` (booleano) y emite `vex_status` (`affected`/`not_affected`).
- Salida JSON estructurada con campos `vulnerable`, `cwe_id`, `severity` (NONE/LOW/MEDIUM/HIGH/CRITICAL), `sink_function`, `sink_file`, `sink_line`, `vex_status`, `reasoning` y `suggested_fix`.
- Generación de parches sugeridos (`suggested_fix`) citando ficheros y líneas.
- Razonamiento sobre patrones seguros frente a indicadores de vulnerabilidad (por ejemplo, `subprocess.run([...], shell=False)` frente a concatenación en `os.system`).
- Soporte de JSON-schema guided decoding en vLLM para forzar la estructura de salida.
- Cobertura de lenguajes de código: C, C++ y Python.
- Capacidades generales de generación de texto y conversación heredadas del modelo base (pipeline `text-generation`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking: entrenado explícitamente con thinking desactivado.

## Casos de uso

- Triaje de falsos positivos en pipelines SAST: integrar el modelo tras un analizador (Semgrep, CodeQL, SonarQube) para que revise cada hallazgo con su slice y descarte los que no son explotables, reduciendo la carga de revisión manual.
- Generación de VEX (Vulnerability Exploitability eXchange): el campo `vex_status` permite emitir declaraciones `affected`/`not_affected` automatizadas dentro de flujos de gestión de vulnerabilidades y cumplimiento de DORA.
- Priorización por severidad: usar `severity` y `cwe_id` para ordenar la cola de remediación según impacto real, en lugar de la severidad bruta del escáner.
- Asistencia a revisión de código en CI/CD: ejecutar el modelo sobre los diffs de un pull request para bloquear merges con vulnerabilidades confirmadas en C, C++ o Python.
- Sugerencia de parches: emplear `suggested_fix` como borrador inicial de remediación que el desarrollador revisa, con referencias a fichero y línea del sink.
- Auditoría de dependencias y código heredado: procesar repositorios grandes por lotes con vLLM y `--max-num-seqs` moderado, aprovechando el formato JSON para poblar una base de datos de hallazgos.
- Formación y análisis forense: usar `reasoning` como explicación didáctica de por qué un flujo es o no vulnerable a un CWE concreto.

## Benchmarks y rendimiento

La model card reporta únicamente métricas de validez del JSON con decodificación guiada por esquema, evaluadas sobre el checkpoint NVFP4 con vLLM 0.33.0 en una NVIDIA GeForce RTX 5070 Ti (16 GB):

| Conjunto de evaluación | Respuestas totales | JSON inválido o sin booleano `vulnerable` |
|---|---|---|
| Juliet | 600 | 6 |
| pygoat | 80 | 3 |

No se han publicado resultados de benchmarks de precisión, recall, F1 ni comparativas con otros modelos en la información disponible. Tampoco hay datos de latencia o throughput más allá de la configuración de servicio empleada.

## Requisitos de hardware

- VRAM estimada: el repo BF16 ocupa 15,9 GB, por lo que la inferencia en BF16 requiere en torno a 16 GB o más solo para pesos, más caché KV y buffers; con FP8 baja aproximadamente a la mitad y con NVFP4 a una cuarta parte.
- GPU validadas: solo se ha evaluado el build NVFP4 en una NVIDIA GeForce RTX 5070 Ti (16 GB). NVFP4 está pensado para GPUs Blackwell; no se probaron otras GPUs según la model card.
- GPU consumer: el build NVFP4 cabe en una RTX 5070 Ti; el BF16 probablemente no cabe en GPUs de 16 GB con contexto largo. No hay datos publicados para RTX 4090, A100 o H100.
- Despliegue: vLLM 0.33.0 con `--trust-remote-code`, `--max-model-len 8192`, `--gpu-memory-utilization 0.80`, `--max-num-seqs 8` y `--mamba_ssm_cache_dtype float32`. La librería de referencia es transformers; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tunatron-3-Nano-4B | ~4B | no disponible (ejemplo a 8192) | Triaje SAST (C/C++/Python) | NVIDIA Nemotron Open Model License | Hugging Face (BF16/FP8/NVFP4) |
| unsloth/NVIDIA-Nemotron-3-Nano-4B (base) | ~4B | no disponible | Propósito general | NVIDIA Nemotron Open Model License | Hugging Face |
| Modelos generalistas de ~4B (p. ej. Qwen, Llama pequeños) | ~4B | variable | Propósito general, sin especialización SAST | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; al entrenarse sobre código y reglas CWE, puede heredar sesgos de los datasets de seguridad empleados.
- Alucinación: aunque la salida esté guiada por esquema, el contenido de `reasoning` y `suggested_fix` puede ser incorrecto o inventar detalles del código; requiere revisión humana antes de aplicar parches.
- Robustez de formato: incluso con JSON-schema guided decoding, 6 de 600 respuestas de Juliet y 3 de 80 de pygoat no fueron JSON válido con booleano `vulnerable` (por ejemplo, truncadas por límite de tokens).
- Idiomas: el prompt de sistema y las salidas están en inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Cobertura limitada de lenguajes de código: solo C, C++ y Python.
- Contexto: no se documenta la longitud máxima de contexto del modelo base; el ejemplo de servicio usa 8192 tokens, lo que limita el tamaño de los slices.
- Licencia: NVIDIA Nemotron Open Model License, no una licencia permisiva estándar; es necesario revisar sus términos antes de uso comercial o redistribución.
- Cuantización: solo el build NVFP4 ha sido evaluado y únicamente en GPUs Blackwell; los builds BF16 y FP8 no tienen métricas publicadas.
- Madurez: modelo con pocas descargas (717) y un solo like en el momento de la ficha; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinello28/Tunatron-3-Nano-4B-BF16
- Modelo base: https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-4B
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper arXiv:2403.18624: https://arxiv.org/abs/2403.18624
- Paper arXiv:2505.19828: https://arxiv.org/abs/2505.19828
- Paper arXiv:2509.04260: https://arxiv.org/abs/2509.04260
- vLLM: https://github.com/vllm-project/vllm
- NVIDIA TensorRT Model Optimizer (ModelOpt): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Transformers: https://huggingface.co/docs/transformers
