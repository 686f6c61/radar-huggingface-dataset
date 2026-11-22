# stefanocarrera/kic_M_Qwen3-8B_python_t0.5_g5_run2

## Resumen

`stefanocarrera/kic_M_Qwen3-8B_python_t0.5_g5_run2` es un fine-tuning del modelo base `unsloth/qwen3-8b-base-unsloth-bnb-4bit`, que a su vez deriva de la familia Qwen3 de Alibaba. Lo publica el usuario stefanocarrera en Hugging Face bajo licencia Apache 2.0. El nombre del repositorio sugiere un ajuste orientado a Python con temperatura 0.5 y 5 generaciones por prompt (t0.5_g5_run2), aunque la model card no documenta la metodología ni el dataset empleado.

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con aproximadamente 8.200 millones de parámetros y una ventana de contexto nativa de 32.768 tokens extensible hasta 131.072. El fine-tuning se realizó con Unsloth sobre una versión del base cuantizada en 4 bits (bnb-4bit), lo que abarata el entrenamiento pero condiciona la calidad del resultado final.

Su relevancia es limitada: se trata de un experimento de ajuste publicado sin documentación técnica, sin benchmarks y con cero descargas en el momento de redactar esta ficha. Resulta útil como ejemplo de pipeline Unsloth sobre Qwen3, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | ~8.200 millones (heredados de Qwen3-8B; no confirmado en la model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con extensión YaRN (heredado de Qwen3-8B) |
| Tipos de cuantizacion | El base de entrenamiento es bnb-4bit; el repo publica safetensors. Compatible con GGUF/AWQ/GPTQ vía conversión, no incluidos en el repo |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only denso con atención por grupos (GQA), RoPE y activación SwiGLU, sin mezcla de expertos. El modelo parte del checkpoint `unsloth/qwen3-8b-base-unsloth-bnb-4bit`, es decir, una versión del base de Qwen3 cuantizada a 4 bits para el entrenamiento con Unsloth, que aplica optimizaciones de memoria y kernels personalizados para acelerar el fine-tuning.

No se documenta en la model card el número de tokens de entrenamiento, la composición del dataset, si hubo SFT, DPO o RLHF, ni el proceso de generación de datos. El sufijo del nombre (`python_t0.5_g5_run2`) apunta a un ajuste con prompts de Python generados a temperatura 0.5 y 5 muestras por prompt, en una segunda ejecución, pero es una inferencia a partir del nombre, no un dato confirmado. Tampoco se especifica si se aplicó merging de adaptadores LoRA ni el régimen de precisión final.

## Capacidades

- Generación de texto en inglés, heredada del base Qwen3-8B.
- Razonamiento y matemáticas básicas, presumiblemente reforzadas por el ajuste orientado a Python, aunque no hay evidencia publicada.
- Generación de código Python, objetivo probable del fine-tuning según el nombre del repositorio.
- Soporte de tool calling y function calling: heredado del base Qwen3, no verificado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: heredadas del base, sin evaluación posterior.
- Multilingüismo: limitado a inglés según la model card, pese a que el base Qwen3 es multilingüe.
- Modo thinking: Qwen3-8B lo soporta, pero no se confirma que el fine-tuning lo preserve.

## Casos de uso

- Generación asistida de código Python en entornos de desarrollo: el ajuste apunta a este dominio, por lo que puede emplearse como autocompletado o generador de funciones, siempre con revisión humana y validación con tests.
- Experimentación académica con pipelines Unsloth: sirve como referencia de cómo ajustar Qwen3-8B en 4 bits y comparar el efecto del fine-tuning frente al base.
- Prototipado de asistentes de programación en inglés: adecuado para demos internas con contexto de hasta 32.000 tokens, suficiente para incluir varios archivos de un proyecto pequeño.
- Evaluación de degradación por cuantización: útil para estudiar cómo afecta partir de un base bnb-4bit al rendimiento final del modelo ajustado.
- Generación de docstrings y comentarios de código: tarea acotada y de bajo riesgo donde el modelo puede aportar valor sin necesidad de benchmarks exhaustivos.
- Base para nuevos fine-tunings: al estar en safetensors y licencia Apache 2.0, puede reutilizarse como punto de partida en experimentos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~16-17 GB (8.200 M parámetros × 2 bytes más overhead de KV cache).
- VRAM estimada en cuantización 8 bits: ~9-10 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): ~5-6 GB, con contexto corto.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S, RTX 4090 (24 GB, justo).
- GPU consumer: cabe en RTX 4090, RTX 3090, RTX 4080 y, en 4 bits, en GPUs con 8 GB como RTX 3070/4060 Ti.
- Opciones de despliegue: transformers (nativo), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF, y Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| stefanocarrera/kic_M_Qwen3-8B_python_t0.5_g5_run2 | ~8,2 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado |
| Qwen/Qwen3-8B | ~8,2 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial, con benchmarks publicados |
| unsloth/qwen3-8b-base-unsloth-bnb-4bit | ~8,2 B | 32.768 | Apache 2.0 | Hugging Face | Base cuantizado para entrenamiento |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | Hugging Face | Restricciones de uso comercial |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset, la metodología y la evaluación: no es posible garantizar la calidad ni la seguridad del ajuste.
- El entrenamiento parte de un base cuantizado a 4 bits, lo que puede introducir degradación acumulada respecto al Qwen3-8B original en FP16/BF16.
- Riesgo elevado de alucinación en código: sin benchmarks ni tests publicados, no hay evidencia de que el modelo genere código correcto o ejecutable.
- Idiomas: solo se declara inglés; el uso en castellano no está soportado oficialmente.
- Posible pérdida de capacidades del base (tool calling, modo thinking, multilingüismo) tras el fine-tuning, al no haberse verificado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su despliegue en producción sin auditoría previa.
- Repositorio con 0 descargas y 0 likes: no hay validación por parte de la comunidad.
- Fecha de creación declarada en 2026-11-22, posterior a la fecha habitual de publicación de Qwen3; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefanocarrera/kic_M_Qwen3-8B_python_t0.5_g5_run2
- Modelo base en Hugging Face: https://huggingface.co/unsloth/qwen3-8b-base-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo oficial Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
