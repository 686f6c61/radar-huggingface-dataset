# xv0y5ncu/Arete-27B-GLQ-trellis-3inst-5bpw

## Resumen

Arete-27B-GLQ-trellis-3inst-5bpw es una cuantización de 5,0 bits por peso del modelo NousResearch/Arete-27B, publicada por el usuario xv0y5ncu. Arete-27B es, según la model card, el resultado de un ajuste fino supervisado (SFT) orientado a alineamiento de valores sobre Qwen3.8-27B, manteniendo la arquitectura original intacta. Esta variante aplica GLQ, una técnica de cuantización con libros de códigos codificados en trellis (QTIP TCQ, variante `3inst`), transformada de Hadamard aleatorizada (RHT) y LDLQ, con decodificación en vuelo mediante un kernel CUDA fusionado.

El objetivo de esta publicación es reducir el espacio en memoria de los pesos manteniendo una calidad cercana a bf16, de modo que el modelo quepa en tarjetas gráficas que el modelo completo no admitiría. El autor advierte que la ventaja de GLQ en relación tamaño/precisión es mayor en el rango de 2 a 4 bits por peso; a 5,0 bpw el ahorro es más modesto y la prioridad es preservar la calidad. El repositorio ocupa 21,3 GB y declara 10.638.740.720 parámetros en safetensors, un dato que no concuerda con la denominación "27B" del modelo base.

La relevancia actual del modelo reside en su enfoque: cuantización de alta precisión con decodificación por kernel, integración con vLLM mediante plugin, soporte de tool calling con parser específico y una ventana de contexto de 262.144 tokens en el modelo base. Está pensado para despliegues de un solo dispositivo con requisitos de calidad altos y para flujos de agentes de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.8-27B con SFT; cuantización GLQ sobre el decodificador de texto |
| Parámetros totales | 10.638.740.720 (safetensors); el modelo base se denomina 27B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; en esta ficha se recomienda 65.536 en tarjetas de 32 GB |
| Tipos de cuantización | GLQ 5,0 bpw uniforme: VQ residual apilada (trellis primario K=4 más etapa residual K=1), RHT y LDLQ; SQNR medio de 27,69 dB sobre 400 capas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizados GLQ, decodificados por kernel CUDA); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer multimodal de tipo image-text-to-text, sin modificaciones estructurales tras el ajuste fino. Arete-27B se obtiene mediante SFT sobre el dataset NousResearch/arete-data-pairs, orientado a alineamiento de valores. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales.

La innovación técnica de esta publicación es la cuantización GLQ: un esquema de cuantización vectorial residual apilada con un trellis primario de K=4 y una etapa residual de K=1, decodificados en dos pasadas por un kernel CUDA fusionado. Se complementa con una transformada de Hadamard aleatorizada y LDLQ. La calibración emplea 128 muestras de 2.048 tokens de WikiText-2. Los pesos permanecen comprimidos en memoria y se decodifican al vuelo. Solo se cuantiza el decodificador de texto; las torres de visión y audio conservan su formato nativo. Es requisito usar `glq >= 0.8.0`, ya que versiones anteriores decodifican únicamente la etapa primaria y degradan la calidad a 4 bpw sin avisar.

## Capacidades

- Generación de texto conversacional y razonamiento, con parser de razonamiento `qwen3` disponible en vLLM.
- Procesamiento multimodal image-text-to-text en el modelo base, aunque esta cuantización solo cubre el decodificador de texto y la model card recomienda servicio solo de texto (`limit_mm_per_prompt` a cero para imagen, vídeo y audio).
- Tool calling y function calling mediante el parser `qwen3_xml`, con la advertencia de que un parser incorrecto falla de forma silenciosa.
- Uso en agentes de código a través de los wrappers `glq-code` y `glq-chat`, que requieren `glq >= 0.8.36`.
- Razonamiento multi-paso y flujos de agente con contexto largo, hasta 262.144 tokens en el modelo base.
- Muestreo recomendado: temperatura 1,0, top_p 0,95 y top_k 20, fijados en `generation_config.json` y aplicados por defecto en vLLM.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de código en local: mediante `glq-code --model xv0y5ncu/Arete-27B-GLQ-trellis-3inst-5bpw`, que arranca un servidor vLLM correctamente configurado con el parser de tool calls adecuado y ejecuta el agente pi contra él. Es adecuado porque evita el fallo silencioso de un parser mal configurado.
- Asistente conversacional de contexto largo: con una ventana de hasta 65.536 tokens en una tarjeta de 32 GB, permite mantener conversaciones multi-turno extensas o procesar documentos largos en una sola pasada.
- Servicio de texto en producción con vLLM: la integración por plugin de GLQ y el muestreo fijado en servidor permiten desplegar el modelo con `quantization="glq"` y `dtype="bfloat16"` sin configuración adicional de decodificación.
- Evaluación de alineamiento de valores: al estar entrenado con SFT sobre arete-data-pairs, es útil para experimentos sobre comportamiento alineado en respuestas conversacionales.
- Prototipado en una sola GPU de 32 GB: el formato cuantizado permite ejecutar un modelo de la familia 27B en hardware que no admitiría los pesos en bf16, con una pérdida de calidad medida de 27,69 dB de SQNR.
- Integración en pipelines con Transformers: mediante `glq.hf_integration`, `AutoModelForImageTextToText` y `device_map="cuda"`, para entornos que no usan vLLM.
- Procesamiento por lotes de texto: con `max_num_batched_tokens=2048` y `max_num_seqs=1` como configuración conservadora para tarjetas de 32 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de calidad proporcionado es el SQNR medio de pesos de 27,69 dB sobre 400 capas cuantizadas, que mide el error de cuantización y no el rendimiento de la tarea.

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 21,3 GB, coherente con 5,0 bpw sobre el modelo base.
- Caché KV: una secuencia de 262.144 tokens requiere aproximadamente 16,3 GiB de caché KV adicionales sobre los pesos, según la comprobación de arranque de vLLM.
- GPU de 32 GB: configuración recomendada por el autor, con `max_model_len=65536` y `max_num_batched_tokens=2048`.
- GPU de 24 GB: el autor indica explícitamente que esta variante no cabe en una tarjeta de 24 GB y que `glq-code` la rechaza en ese hardware.
- GPU de menos de 70 GiB de VRAM: `vllm serve` usa un paso de prefill inferior a 70 GiB; por encima de ese umbral se aplica otra configuración.
- Modelos de GPU recomendados: no disponibles de forma explícita; los requisitos anteriores apuntan a tarjetas de 32 GB o superiores.
- Opciones de despliegue: vLLM (recomendado, con plugin GLQ automático), Transformers con `glq[hf]` y `accelerate`, y los wrappers `glq-chat` y `glq-code`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-GLQ-trellis-3inst-5bpw | 10.638.740.720 en safetensors (base 27B) | 262.144 (modelo base) | GLQ 5,0 bpw | apache-2.0 | Hugging Face, 154 descargas |
| NousResearch/Arete-27B | no disponible | 262.144 | bf16 | no disponible en la información | Hugging Face (modelo base) |
| Qwen3.8-27B | no disponible | no disponible | bf16 y otras | no disponible en la información | Hugging Face (modelo original) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El recuento de parámetros en safetensors (10.638.740.720) no concuerda con la denominación "27B" del modelo base; conviene verificarlo antes de dimensionar el despliegue.
- La ventaja de GLQ en tamaño frente a precisión es menor a 5,0 bpw que en el rango de 2 a 4 bpw; el ahorro de memoria es más modesto.
- Requiere `glq >= 0.8.0`; versiones anteriores decodifican solo la etapa primaria y ofrecen calidad de 4 bpw sin aviso.
- `glq-code` y `glq-chat` requieren `glq >= 0.8.36`; versiones anteriores rechazan el modelo en `glq-code` o lo sirven en fp16 sin parser de razonamiento en `glq-chat`.
- Un parser de tool calls incorrecto o ausente falla de forma silenciosa: el agente emite llamadas que nunca se parsean y el modelo parece deficiente cuando el problema es la configuración.
- No cabe en tarjetas de 24 GB; el contexto completo de 262.144 tokens exige unos 16,3 GiB de caché KV adicionales.
- Solo se cuantiza el decodificador de texto; las torres de visión y audio conservan su formato nativo y la model card recomienda servicio solo de texto.
- El script de ejemplo con vLLM debe incluir el guard `if __name__ == "__main__":`, o los procesos worker se reimportan recursivamente y fallan antes de cargar el modelo.
- Al ejecutarse como script, vLLM cambia al método de multiprocesamiento "spawn" tras inicializar CUDA.
- Idiomas soportados no disponibles; riesgo de sesgos y alucinaciones no documentado en la información proporcionada.
- Licencia apache-2.0, que permite uso comercial, pero sin garantías explícitas sobre el comportamiento del modelo ajustado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Arete-27B-GLQ-trellis-3inst-5bpw
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Repositorio de GLQ: https://github.com/cnygaard/glq
- Script de instalación: https://raw.githubusercontent.com/cnygaard/glq/main/install.sh
- Paper de referencia citado en los tags: arxiv:2406.11235 (https://arxiv.org/abs/2406.11235)
