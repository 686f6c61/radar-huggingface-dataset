# xv0y5ncu/Arete-27B-GLQ-trellis-3inst-6bpw

## Resumen

Arete-27B-GLQ-trellis-3inst-6bpw es una cuantización GLQ de 6,0 bits por peso del modelo NousResearch/Arete-27B, publicada por el usuario xv0y5ncu. Arete-27B es, a su vez, Qwen3.8-27B tras un proceso de supervised fine-tuning orientado a alineamiento de valores, con la arquitectura sin modificar. Esta variante aplica quantización con codebook de trellis (QTIP TCQ, variante `3inst`), transformada de Hadamard aleatorizada (RHT) y LDLQ, manteniendo los pesos comprimidos en memoria y decodificándolos al vuelo mediante un kernel CUDA fusionado.

El modelo resuelve el problema de desplegar un modelo de gran tamaño en hardware con VRAM limitada sin renunciar apenas a la calidad de bf16. Según el autor, la ventaja de GLQ en tamaño frente a precisión es mayor a 2–4 bits por peso; a 6,0 bpw el ahorro de huella es menor, por lo que este nivel está pensado para conservar una calidad cercana a bf16 y, aun así, caber en tarjetas donde el modelo completo no entraría.

La relevancia actual radica en que combina un modelo multimodal (image-text-to-text) con una técnica de cuantización reciente que requiere `glq >= 0.8.0` para decodificar correctamente la etapa residual apilada (VQ residual K=4 primaria más K=2 residual). El repo ocupa 24,3 GB y declara 12.159.175.920 parámetros en safetensors, aunque la denominación comercial del modelo base es "27B".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.8-27B sin cambios de arquitectura |
| Parametros totales | 12.159.175.920 (dato real de safetensors); el modelo base se denomina "27B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; el autor recomienda 32.768 en tarjetas de 32 GB |
| Tipos de cuantizacion | GLQ 6,0 bpw uniforme (trellis-coded QTIP TCQ `3inst` + RHT + LDLQ; VQ residual apilada K=4 primaria + K=2 residual) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantización GLQ decodificada por kernel CUDA; requiere librería `glq`) |

## Arquitectura y entrenamiento

El modelo base Arete-27B es Qwen3.8-27B sometido a supervised fine-tuning con el dataset NousResearch/arete-data-pairs, orientado a alineamiento de valores. La arquitectura es la de Qwen3.8-27B sin modificaciones: un transformer multimodal que procesa texto e imagen, con torres de visión y audio que se mantienen en su formato nativo. Esta variante cuantizada aplica GLQ únicamente al decoder de texto.

La cuantización emplea quantización con codebook de trellis (QTIP TCQ, variante `3inst`) combinada con una transformada de Hadamard aleatorizada (RHT) y LDLQ. El esquema es una VQ residual apilada: una etapa primaria de trellis con K=4 más una etapa residual con K=2, decodificadas en dos pasadas. La calibración se realizó con 128 muestras de 2048 tokens de WikiText-2, y el SQNR medio de pesos es de 33,34 dB sobre 400 capas cuantizadas. Los pesos permanecen comprimidos en memoria y se decodifican al vuelo mediante un kernel CUDA fusionado; se requiere `glq >= 0.8.0`, ya que versiones anteriores decodifican solo la etapa primaria y degradan silenciosamente a calidad de 4 bpw.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte de plantilla de chat (`apply_chat_template`).
- Procesamiento multimodal image-text-to-text: el modelo base acepta entradas de imagen; las torres de visión y audio no están cuantizadas.
- Tool calling / function calling: compatible con el parser de herramientas `qwen3_xml` de Qwen y el parser de razonamiento `qwen3`.
- Razonamiento multi-paso y uso en agentes: el autor documenta su uso con agentes de código (`pi-code`, `opencode`).
- Capacidades multilingües: no disponible (no se especifican idiomas en la información).
- Modo de razonamiento: soportado mediante el parser de razonamiento `qwen3`.
- Sampling recomendado: temperature 1.0, top_p 0.95, top_k 20 (definido en `generation_config.json`).

## Casos de uso

- Atención al cliente automatizada: conversaciones multi-turno con contexto largo gracias a la ventana de hasta 262.144 tokens del modelo base, ajustable a 32.768 en GPUs de 32 GB para equilibrar memoria de KV cache.
- Generación de código en producción con agentes: integrable mediante `glq-code` con el agente `pi`, que arranca un servidor vLLM correctamente configurado con el parser de tool calls adecuado al markup del modelo.
- Asistentes de programación en terminal: uso con `opencode` u otros agentes que requieran tool calling fiable y razonamiento multi-paso.
- Despliegue en hardware con VRAM limitada: permite servir un modelo de gran tamaño en tarjetas de 32 GB donde el modelo en bf16 no cabría, manteniendo calidad cercana a bf16.
- Análisis de documentos e imágenes: al conservar las torres de visión en formato nativo, puede procesar entradas image-text-to-text en tareas de extracción o descripción.
- Investigación en cuantización: sirve como referencia reproducible para evaluar la técnica GLQ a 6 bpw con SQNR de 33,34 dB sobre 400 capas.
- Evaluación de alineamiento de valores: al estar fine-tuneado sobre arete-data-pairs, es útil para estudiar comportamiento alineado en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento proporcionado es el SQNR medio de pesos de 33,34 dB sobre 400 capas cuantizadas, que mide la fidelidad de la cuantización respecto a los pesos originales, no la calidad de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 24,3 GB; el autor indica que este build no cabe en una tarjeta de 24 GB.
- GPU recomendadas: tarjetas de 32 GB o más para servir con ventana de 32.768 tokens; el autor menciona comprobaciones de vLLM con pasos de prefill bajo 70 GiB de VRAM.
- Cabe en consumer GPU: sí en tarjetas de 32 GB (por ejemplo, gama profesional o consumer de 32 GB), reduciendo `max_model_len`; no cabe en 24 GB.
- Memoria de contexto: una secuencia de 262.144 tokens requiere aproximadamente 16,3 GiB de KV cache adicionales sobre los pesos (medido por la comprobación de arranque de vLLM).
- Opciones de despliegue: vLLM (recomendado, con plugin `glq` registrado automáticamente), Transformers con `glq.hf_integration` y `device_map="auto"`, y los wrappers `glq-chat` y `glq-code` (requieren `glq >= 0.8.36`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-GLQ-trellis-3inst-6bpw | 12.159.175.920 (safetensors) | 262.144 (32.768 recomendado en 32 GB) | GLQ 6,0 bpw | apache-2.0 | Hugging Face, 83 descargas |
| NousResearch/Arete-27B (base) | no disponible | 262.144 | bf16 | no disponible en la información | Hugging Face (referenciado como base) |
| Qwen3.8-27B (arquitectura original) | no disponible | 262.144 | bf16 | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- La cuantización a 6,0 bpw ofrece un ahorro de huella menor que los niveles de 2–4 bpw; el autor la recomienda solo cuando se busca calidad cercana a bf16 con restricción de VRAM.
- Requiere `glq >= 0.8.0`; versiones anteriores decodifican solo la etapa primaria y degradan la calidad a 4 bpw de forma silenciosa.
- `glq-code` y `glq-chat` requieren `glq >= 0.8.36`; versiones anteriores rechazan el modelo en glq-code o lo sirven en fp16 sin parser de razonamiento.
- No cabe en tarjetas de 24 GB; glq-code lo rechaza en ese hardware.
- El tool calling requiere un parser de herramientas emparejado con el markup del modelo; un parser incorrecto o ausente falla silenciosamente y produce llamadas que nunca se parsean.
- El contexto largo consume memoria: 262.144 tokens necesitan unos 16,3 GiB de KV cache adicionales.
- Al ejecutar scripts con vLLM es obligatorio el guard `if __name__ == "__main__":` por el método de arranque "spawn" de multiprocessing.
- La instalación de `glq` y `vllm` debe hacerse en la misma transacción pip (`glq[vllm]`) para evitar conflictos de resolución de torch.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponible.
- Licencia apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base NousResearch/Arete-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Arete-27B-GLQ-trellis-3inst-6bpw
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset de fine-tuning: NousResearch/arete-data-pairs
- Repositorio GLQ: https://github.com/cnygaard/glq
- Script de instalación: https://raw.githubusercontent.com/cnygaard/glq/main/install.sh
- Paper de referencia: arxiv:2406.11235
