# Yethu-2/Qwen2.5-7B-Morrisons-Law

## Resumen

Qwen2.5-7B-Morrisons-Law es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario Yethu-2 en Hugging Face. Se trata de un modelo de generación de texto de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), construido sobre la arquitectura transformer densa de la familia Qwen2.5 de Alibaba. El ajuste se realizó partiendo de la versión cuantizada a 4 bits del modelo instructivo original (unsloth/Qwen2.5-7B-Instruct-bnb-4bit) y empleando la librería Unsloth junto con TRL de Hugging Face, según indica la propia model card.

El nombre del modelo sugiere una especialización en el ámbito legal, presumiblemente orientada al marco normativo o a la documentación de la cadena británica de supermercados Morrisons, aunque la model card no documenta explícitamente el corpus de entrenamiento ni el propósito concreto. La información publicada es mínima: no se detallan los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni los hiperparámetros del ajuste.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo típico de fine-tuning comunitario de bajo coste sobre un modelo base consolidado, con licencia Apache 2.0 y formato safetensors, lo que facilita su inspección y despliegue. No obstante, la ausencia de benchmarks, de documentación del dataset y de evaluación de calidad hace que deba tratarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, decoder-only) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba cuantizado a 4 bits con bitsandbytes; los pesos publicados son safetensors sin cuantizar según el tamaño del repo) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso con atención por múltiples cabezas y mecanismos estándar de la familia Qwen2.5 (RoPE para codificación posicional, normalización RMSNorm, activación SwiGLU y atención con query/key/value bias). El modelo original Qwen2.5-7B-Instruct emplea Grouped Query Attention (GQA) para reducir el coste de memoria en la caché KV durante la inferencia. No se dispone de detalles específicos sobre modificaciones arquitectónicas introducidas en este ajuste.

En cuanto al entrenamiento, la model card únicamente indica que el ajuste se realizó con Unsloth y TRL, partiendo de la versión de 4 bits del modelo instructivo. No se especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF, DPO o SFT supervisado, ni la duración o los hiperparámetros del proceso. El nombre "Morrisons-Law" sugiere un corpus legal o corporativo, pero no hay confirmación documental. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el entrenamiento (aproximadamente 2 veces más rápido según la card).

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento general y respuesta a instrucciones, presumiblemente especializado (sin confirmar) en dominio legal o normativo.
- Soporte de tool calling y function calling: no confirmado explícitamente para este ajuste, aunque el modelo base Qwen2.5-7B-Instruct lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste concreto.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base Qwen2.5 es multilingüe (no se garantiza que el ajuste preserve esas capacidades).
- Modo thinking, visión o audio: no disponible.
- Generación de código y matemáticas: presumiblemente heredadas del modelo base, sin evaluación específica publicada.

## Casos de uso

- Asistencia en consultas legales o normativas: el modelo podría emplearse para responder preguntas sobre documentación legal o corporativa en inglés, dado el nombre del ajuste, aunque la falta de evaluación impide garantizar su fiabilidad en este dominio.
- Prototipado rápido de asistentes conversacionales: al estar disponible en safetensors y con licencia Apache 2.0, puede desplegarse en entornos de desarrollo para experimentar con fine-tuning adicional o con integración en pipelines de generación de texto.
- Generación de borradores de documentos: útil para producir primeros borradores de textos en inglés en un dominio específico, siempre con revisión humana posterior.
- Investigación sobre fine-tuning comunitario: sirve como caso de estudio de ajustes de bajo coste con Unsloth y TRL sobre modelos Qwen2.5, útil para comparar metodologías.
- Integración en aplicaciones de chat con contexto medio: si se confirma la ventana de contexto del modelo base (32.768 tokens), podría gestionar conversaciones multi-turno de longitud moderada.
- Experimentación con cuantización y despliegue: el modelo puede cuantizarse a GGUF o AWQ para su uso en llama.cpp, Ollama o vLLM, lo que permite evaluar el impacto del ajuste en distintos formatos.
- Base para nuevos ajustes especializados: al ser un modelo pequeño (7,6B) y con licencia permisiva, puede servir como punto de partida para fine-tunings posteriores en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de caché KV y activaciones; se recomienda al menos 20-24 GB de VRAM.
- VRAM estimada en cuantización 8 bits: en torno a 8-9 GB para pesos, con overhead adicional; viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5,5 GB para pesos; viable en GPUs consumer de 8 GB o superiores.
- GPUs recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 con margen; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060/4060 Ti (8-16 GB) para 4 bits.
- Cabe en GPU consumer: sí, especialmente en cuantizaciones de 4 y 8 bits.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp/Ollama (previa conversión a GGUF), Unsloth para reentrenamiento.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Morrisons-Law | 7,6B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face | Ajuste comunitario sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 (ampliable) | Apache 2.0 | Hugging Face | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de tamaño similar, con evaluación pública |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 | Llama 3.1 Community License | Hugging Face | Mayor contexto y evaluación pública, licencia con restricciones |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluación de calidad: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea.
- Documentación insuficiente del dataset de entrenamiento: se desconoce la composición, el volumen y la procedencia de los datos, lo que impide evaluar sesgos y riesgos de contaminación.
- Riesgo de alucinación: inherente a los modelos de 7B y potencialmente agravado por un ajuste en dominio especializado sin validación.
- Sesgos conocidos: no documentados; el modelo base Qwen2.5 puede presentar sesgos de género, culturales y lingüísticos no mitigados en este ajuste.
- Limitación de idioma: la model card declara únicamente inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin evaluación; el uso en producción con fines legales o regulados requiere validación independiente.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no se ha verificado que el ajuste preserve esa ventana.
- Modelo de nicho y con nula tracción (0 descargas, 0 likes en el momento de la consulta): no hay comunidad ni soporte asociado.
- El nombre sugiere un dominio legal o corporativo concreto, pero no hay documentación que lo respalde; no debe asumirse especialización real sin pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yethu-2/Qwen2.5-7B-Morrisons-Law
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo oficial Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentación de TRL: https://huggingface.co/docs/trl
