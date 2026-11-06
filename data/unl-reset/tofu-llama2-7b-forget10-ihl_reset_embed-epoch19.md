# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch19

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch19` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un modelo de lenguaje decoder-only de la familia Llama 2, con 6.738.415.616 parametros (aproximadamente 6,74 mil millones), entrenado sobre el modelo base `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el dataset TOFU (Task of Fictitious Unlearning).

El objetivo del modelo es el *machine unlearning*: eliminar selectivamente el conocimiento de un subconjunto del dataset de entrenamiento (la particion `forget10`, es decir, el 10 % de los autores ficticios de TOFU) manteniendo el rendimiento sobre el resto de datos (particion `retain`). El checkpoint corresponde a la epoca 19 de 20 de un proceso de entrenamiento que combina una perdida de entropia cruzada sobre los datos retenidos con una perdida de tipo IHL (Information-Theoretic/Hessian-based unlearning, segun la nomenclatura del autor) sobre los datos a olvidar, y en el que ademas se reinicializan los embeddings de entrada y la cabeza LM a partir de `NousResearch/Llama-2-7b-chat-hf`.

Es relevante en el contexto de la investigacion sobre privacidad y cumplimiento normativo (derecho al olvido en el RGPD), ya que proporciona un artefacto reproducible para evaluar tecnicas de desaprendizaje sobre un modelo de 7B con contexto de 4K tokens, licencia Llama 2 y pesos en safetensors. No es un modelo pensado para uso en produccion, sino un checkpoint experimental de un pipeline de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (6,74 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Epoca del checkpoint | 19 de 20 |
| Particion de olvido | forget10 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con atencion multi-cabeza con RoPE, normalizacion RMSNorm, activacion SwiGLU y sesgo desactivado en las proyecciones lineales. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 sobre el benchmark TOFU, y conserva todos los pesos del transformer de ese checkpoint salvo los embeddings de entrada y la cabeza LM, que se reinicializan desde `NousResearch/Llama-2-7b-chat-hf` (componente "reset embed" del nombre del checkpoint).

El entrenamiento de desaprendizaje combina dos terminos: una perdida IHL ("Token IHL") sobre la particion `forget` y una entropia cruzada estandar con coeficiente 1.0 sobre la particion `retain`. El checkpoint publicado corresponde a la epoca 19 de 20. El autor indica que se trata de un modelo completo e independiente ("standalone full model checkpoint") y remite a `ihl_manifest.json` para los detalles del proceso. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de las particiones TOFU, ni si se aplicaron etapas de RLHF o DPO adicionales (el modelo base Llama 2 ya incorpora alineamiento, pero el ajuste fino sobre TOFU y el posterior desaprendizaje no documentan etapas de preferencia).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el dataset TOFU (autores ficticios y sus obras), con el objetivo declarado de haber olvidado la particion `forget10`.
- Capacidad de mantener respuestas sobre la particion `retain` gracias al termino de entropia cruzada sobre datos retenidos.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se documenta modo "thinking", vision ni audio.
- El modelo esta pensado como artefacto de evaluacion de desaprendizaje, no como asistente generalista.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como referencia para medir la eficacia del desaprendizaje sobre `forget10` comparando la perplejidad y la exactitud en las particiones `forget` y `retain` frente al modelo original `locuslab/tofu_ft_llama2-7b`.
- Evaluacion de robustez del olvido: permite aplicar ataques de extraccion (prompting adversarial, jailbreaks, fine-tuning posterior) para comprobar si el conocimiento supuestamente eliminado reaparece, un paso habitual en la literatura de unlearning.
- Reproducibilidad de pipelines de investigacion: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita replicar la epoca 19/20 y comparar con otras epocas o variantes del mismo grupo.
- Estudio de cumplimiento normativo (RGPD, derecho al olvido): sirve como caso practico para analizar si tecnicas de desaprendizaje a nivel de pesos son suficientes para justificar la eliminacion de datos personales en un modelo de 7B.
- Analisis de degradacion por reinicializacion de embeddings: al reinicializar embeddings y cabeza LM, permite estudiar el impacto de esta decision en la calidad del lenguaje y en la retencion de conocimiento general.
- Docencia y formacion: util como ejemplo tangible de un pipeline de unlearning sobre un modelo abierto, con pesos en safetensors y licencia Llama 2, para cursos de privacidad en machine learning.
- Benchmarking de metodos de unlearning: punto de comparacion para tecnicas alternativas (gradient ascent, NPO, RMU, etc.) evaluadas sobre el mismo dataset TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones teoricas, no verificadas por el autor en la informacion disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precision completa con lotes grandes; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB con cuantizacion (si se generan pesos GGUF, no publicados en el repositorio).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que se conviertan los pesos safetensors a los formatos correspondientes; no se han publicado variantes GGUF ni cuantizaciones en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch19 | 6,74 B | no disponible (base Llama 2: 4096) | Desaprendizaje TOFU (forget10) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 (base Llama 2) | Ajuste fino sobre TOFU (modelo de referencia) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat generalista alineado | llama2 | Hugging Face |
| Meta Llama 2 7B | 6,74 B | 4096 | Modelo base generalista | llama2 | Hugging Face |

La comparativa se limita a modelos de la misma familia porque no se dispone de datos de rendimiento del checkpoint en la informacion proporcionada; las alternativas de desaprendizaje de otros grupos (por ejemplo, variantes NPO o RMU sobre TOFU) no se detallan aqui por falta de datos verificables.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente generalista; su calidad fuera del dominio TOFU puede haberse degradado respecto al modelo base.
- Riesgo de olvido incompleto: el desaprendizaje a nivel de pesos no garantiza la eliminacion total del conocimiento; ataques de extraccion o fine-tuning posterior pueden recuperar informacion de la particion `forget10`.
- Riesgo de alucinacion: como cualquier Llama 2 7B, puede generar contenido factualmente incorrecto, especialmente tras el proceso de desaprendizaje.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Llama 2 y del dataset TOFU (autores ficticios con sesgos de generacion sintetica); no se documenta ninguna mitigacion adicional.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso (incluida la politica de uso aceptable de Meta) y requiere aceptar los terminos para uso comercial; no es una licencia de codigo abierto permisiva.
- Reinicializacion de embeddings: al reinicializar los embeddings de entrada y la cabeza LM desde Llama-2-7b-chat, puede haber una discrepancia entre el espacio de embeddings y el resto de pesos del transformer, con posible impacto en la fluidez y coherencia.
- Sin cuantizaciones publicadas: el repositorio solo contiene safetensors de 13,5 GB; el despliegue en hardware limitado requiere conversion manual.
- Fecha de creacion futura (2026-11-03) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- Sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de embeddings reinicializados: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Manifiesto del pipeline: `ihl_manifest.json` en el repositorio del modelo
- Paper de TOFU (referencia): https://arxiv.org/abs/2401.06121
