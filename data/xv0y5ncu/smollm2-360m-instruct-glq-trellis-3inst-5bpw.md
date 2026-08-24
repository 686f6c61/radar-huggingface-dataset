# xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-5bpw

## Resumen

Este modelo es una cuantización de `HuggingFaceTB/SmolLM2-360M-Instruct`, un modelo de lenguaje compacto de 360 millones de parámetros desarrollado por HuggingFace. La cuantización ha sido realizada por el usuario `xv0y5ncu` mediante la herramienta GLQ (GPTQ-Like Quantization) con un codebook trellis (TCQ) en su variante "3INST" (lookup-free) a 5 bits por peso. El objetivo es reducir el tamaño del modelo y acelerar la inferencia manteniendo una pérdida mínima de calidad, lo que lo hace apto para despliegue en dispositivos con recursos limitados.

El modelo base SmolLM2-360M-Instruct fue entrenado sobre 4 trillones de tokens con una mezcla de FineWeb-Edu, DCLM, The Stack y datasets propios, seguido de ajuste fino supervisado (SFT) y optimización por preferencias directas (DPO) con UltraFeedback. Esta cuantización concreta mantiene la arquitectura original (Transformer decoder-only, similar a Llama) y una ventana de contexto de 2048 tokens, ofreciendo un checkpoint de solo 0,27 GiB en disco.

La relevancia de este modelo radica en su equilibrio entre tamaño y rendimiento: permite ejecutar un modelo de instrucciones de 360M con calidad aceptable en hardware modesto, como GPUs de consumo o incluso CPU, y su licencia Apache 2.0 facilita su uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama) |
| Parametros totales | 360M (modelo original); 146.095.040 en el checkpoint cuantizado |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GLQ trellis (TCQ) 5 bits/peso, variante 3INST, tasa uniforme |
| Idiomas soportados | Inglés predominante (no se documentan otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización GLQ/trellis) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only con arquitectura similar a Llama, entrenado por HuggingFace sobre 4 billones de tokens de una mezcla de FineWeb-Edu, DCLM, The Stack y datasets propios filtrados. El proceso de entrenamiento incluyó dos fases: primero un ajuste supervisado (SFT) con datasets públicos y propios (incluido el dataset `smol-smoltalk`), y posteriormente una optimización por preferencias directas (DPO) usando el dataset UltraFeedback. El modelo resultante soporta tareas como reescritura de texto, resumen y, en la versión de 1.7B, function calling.

La cuantización se realizó con la herramienta GLQ (https://github.com/cnygaard/glq) utilizando un codebook de trellis (TCQ) en su variante 3INST (lookup-free) a 5 bits por peso, con tasa uniforme en todas las capas. El proceso empleó 128 muestras y una longitud de secuencia de 2048 tokens, como se indica en la model card. La cuantización se aplicó sobre el modelo base sin entrenamiento adicional, por lo que las capacidades del modelo original se conservan en su mayoría, con una pérdida de perplexidad de solo +0.78% respecto al modelo bf16 de referencia.

## Capacidades

- Generación de texto instructivo: responde a instrucciones y preguntas en formato chat, con soporte para system prompts y mensajes multi-turno.
- Razonamiento básico y conocimiento factual: el modelo original logra un MMLU de 35, adecuado para tareas de razonamiento y respuesta a preguntas de nivel educativo.
- Reescritura de texto y resumen: gracias al SFT con datasets de Argilla, puede reformular o resumir contenido.
- Soporte de function calling: aunque la versión de 360M no está oficialmente documentada para tool calling (solo la de 1.7B lo está), el modelo base fue entrenado con datos de Synth-APIGen, por lo que puede presentar cierta capacidad de invocación de herramientas.
- Multilingüe limitado: aunque entrenado principalmente en inglés, puede producir texto en otros idiomas con menor calidad.
- Baja latencia: gracias a la cuantización, el modelo es muy rápido en inferencia (264 tokens/s en batch 1 con vLLM en una RTX PRO 6000).

## Casos de uso

- **Aplicaciones móviles y on-device**: al ocupar solo 0.27 GiB, puede ejecutarse en smartphones y tablets para generar respuestas a preguntas frecuentes o asistentes personales sin conexión.
- **Chatbots de bajo coste**: despliegue de un asistente conversacional en una CPU o GPU de gama baja para atención al cliente en pequeñas empresas, con latencia aceptable (~16 ms de TTFT).
- **Prototipado rápido**: los desarrolladores pueden usar este modelo en entornos de desarrollo para probar flujos de conversación antes de migrar a modelos mayores, gracias a su velocidad de descarga y bajo consumo de memoria.
- **Preprocesamiento de texto**: reescritura de artículos, resumen de documentos o normalización de contenido en pipelines de datos, donde la velocidad es más crítica que la máxima calidad.
- **Generación de código simple**: aunque no es su fortaleza, puede ayudar en autocompletado básico de código o explicar fragmentos cortos, dado su entrenamiento con The Stack.
- **Educación y aprendizaje**: como modelo de demostración en cursos de PLN, donde los estudiantes pueden analizar el impacto de la cuantización en la calidad del texto generado.
- **Inferencia en CPU**: con un peso de solo 0.27 GiB, puede ejecutarse en CPUs modernas sin GPU, siendo útil para entornos sin aceleración de hardware.

## Benchmarks y rendimiento

La model card proporciona una tabla de rendimiento de cuantización, medida a través de vLLM en una RTX PRO 6000 Blackwell (vLLM 0.27.1, glq 0.8.8, CUDA graphs, 256-token decode). No se publicaron resultados de tareas específicas (MMLU, HumanEval, etc.) para esta cuantización, pero se midió la perplexidad en wikitext-2 y la velocidad de generación.

| Métrica | Valor |
|---|---|
| Perplexity (wikitext-2, seqlen 2048) | 12.834 |
| Diferencia vs. bf16 (12.735) | +0.78% |
| SQNR medio de pesos | 27.67 dB |
| Velocidad B=1 | 264 tokens/s |
| Velocidad B=32 (agregada) | 4.383 tokens/s |
| TTFT (B=1) | 16 ms |

Para el modelo base, se conoce un score de MMLU de 35 (según openmodelmap.com), pero no se ha verificado en esta cuantización.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 0.27 GiB en disco, pero en inferencia se necesita memoria adicional para KV cache y overhead. Se estima un uso de VRAM de ~0.5–1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo GTX 1060, RTX 2060, RTX 3050. En la prueba se usó una RTX PRO 6000 Blackwell, pero el modelo es muy ligero.
- Ejecución en CPU: viable en CPUs modernas con al menos 4 GB de RAM libre, aunque la velocidad será menor que en GPU.
- Opciones de despliegue: soporta vLLM con `--quantization glq` (requiere glq >= 0.8.8). No se ha validado en transformers, por lo que se recomienda usar vLLM. También puede probarse con llama.cpp (no documentado).
- Latencia: TTFT de 16 ms y 264 tokens/s en batch 1 en la GPU de referencia, lo que da una latencia media de ~0.004 s por token.

## Comparativa con modelos similares

Se comparan las distintas rungs de cuantización del mismo modelo, además del modelo base en bf16. Los datos provienen de la model card.

| Modelo | Peso (GiB) | Perplexity (wikitext-2) | SQNR (dB) | Velocidad B=1 (tok/s) |
|---|---|---|---|---|
| SmolLM2-360M-Instruct (bf16) | — | 12.735 | — | — |
| GLQ trellis 6 bpw | 0.31 | 12.755 (+0.16%) | 33.20 | 264 |
| **GLQ trellis 5 bpw (este)** | **0.27** | **12.834 (+0.78%)** | **27.67** | **264** |
| GLQ trellis 4 bpw | 0.24 | 13.085 (+2.7%) | 22.04 | 303 |
| GLQ trellis 3 bpw | 0.20 | 14.173 (+11.3%) | 16.19 | 294 |

Otras alternativas similares son SmolLM2-135M-Instruct (más pequeño, con menos calidad) y SmolLM2-1.7B-Instruct (más grande, con mejor rendimiento y soporte de function calling). No se dispone de datos de cuantización de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Perplejidad ligeramente degradada**: la cuantización a 5 bits introduce un aumento de +0.78% en perplexity respecto al modelo base, lo que puede notarse en tareas que requieren alta precisión.
- **Contexto corto**: la ventana de contexto es de 2048 tokens, insuficiente para conversaciones largas o documentos extensos.
- **Dominio limitado**: el modelo fue entrenado principalmente en inglés y puede no ser adecuado para idiomas minoritarios o dominios especializados.
- **Sesgos y alucinaciones**: como cualquier modelo pequeño, puede generar información inventada o mostrar sesgos derivados de los datos de entrenamiento.
- **Sin validación en transformers**: el checkpoint no ha sido probado con la librería transformers, solo con vLLM y glq. Si se usa en otros entornos, puede haber incompatibilidades.
- **Sin benchmarks de tareas**: no se han publicado resultados en MMLU, HumanEval, etc., por lo que el rendimiento real en tareas específicas es desconocido.
- **No apto para uso en producción crítico**: dado su tamaño y la falta de evaluación de tareas, se recomienda su uso en prototipos o aplicaciones de bajo riesgo.

## Enlaces

- Modelo cuantizado: [xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-5bpw](https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-5bpw)
- Modelo base: [HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- Repositorio GLQ: https://github.com/cnygaard/glq
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Repositorio de SmolLM: https://github.com/huggingface/smollm
- Otras cuantizaciones del mismo modelo: [6 bpw](https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-6bpw), [4 bpw](https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-4bpw), [3 bpw](https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3bpw)
