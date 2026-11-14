# xv0y5ncu/SmolLM3-3B-trellis-3inst-3bpw

## Resumen

SmolLM3-3B-trellis-3inst-3bpw es una cuantización de 3,0 bits por peso del modelo SmolLM3-3B de Hugging Face TB, publicada por el usuario independiente xv0y5ncu. El checkpoint aplica GLQ (Golay/Leech Quantization), una técnica que combina cuantización codificada por trellis (TCQ, heredada de QTIP), una transformada de Hadamard aleatorizada (RHT) y redondeo con retroalimentación de error mediante factorización LDL del hessiano (LDLQ). El resultado es un modelo que mantiene los pesos comprimidos en VRAM y los decodifica al vuelo mediante un kernel CUDA fusionado.

El modelo base, SmolLM3-3B, es un transformer denso de aproximadamente 3.000 millones de parámetros con modo de razonamiento híbrido y soporte multilingüe, orientado a generación de texto y conversación. Esta variante cuantizada conserva la licencia Apache 2.0 del original y está pensada para despliegues con restricciones de memoria: el repositorio ocupa 1,6 GB y el autor reporta un SQNR medio de pesos de 16,19 dB sobre 252 capas cuantizadas.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: cuantizaciones de muy bajo bit-rate (2-4 bpw) con kernels dedicados que buscan acercarse a la precisión de bf16 sin sacrificar velocidad de decodificación. No obstante, conviene señalar de entrada una discrepancia importante: los safetensors del repositorio declaran 792.009.728 parámetros totales, muy por debajo de los ~3B del modelo base, lo que sugiere que el checkpoint almacena únicamente los pesos comprimidos o un subconjunto de ellos, y no el modelo completo en formato estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base SmolLM3-3B); pesos almacenados con cuantización trellis-coded (GLQ) |
| Parametros totales | 792.009.728 según safetensors del repo; el modelo base SmolLM3-3B tiene ~3B (no disponible el desglose exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de vLLM usa `max_model_len=4096` |
| Tipos de cuantizacion | GLQ 3,0 bpw uniforme (trellis 3INST, tasa nativa, sin apilado de residuales); KV cache opcional E8 (`e8_relaxed:2` ≈ 4 bits, `:1` ≈ 2 bits, `:3` ≈ 6 bits) |
| Idiomas soportados | en, fr, es, it, pt, zh, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (trellis en layout de fragmento MMA para kernels CUDA 3INST) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer denso de ~3B parámetros entrenado por Hugging Face TB; la model card citada no detalla la composición del dataset ni las etapas de alineación (RLHF/DPO) del original, por lo que esos datos no están disponibles en la información proporcionada. Lo que sí se documenta es el proceso de cuantización: se aplicó una transformada de Hadamard aleatorizada (sign-flip fijo + rotación de Hadamard a cada lado) para hacer incoherentes los pesos y el hessiano de calibración, seguida de LDLQ para redondear con retroalimentación de error a través de las dimensiones de entrada restantes.

La innovación principal es el uso de cuantización codificada por trellis (TCQ, variante `3inst` de QTIP): cada tile de pesos de 16×16 se codifica como una secuencia Viterbi tail-biting sobre un código trellis de dimensión 256, lo que proporciona una dimensión efectiva de cuantización superior a la de un retículo E8 a la misma tasa de bits. La decodificación consiste en una pequeña búsqueda en tabla más unas pocas operaciones aritméticas por peso, ejecutadas por un kernel CUDA fusionado que mantiene los pesos comprimidos en VRAM. La calibración se realizó con 128 muestras de 2048 tokens de WikiText-2, y el SQNR medio de pesos reportado es de 16,19 dB sobre 252 capas.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) y formato de mensajes rol/contenido.
- Razonamiento y matemáticas básicas, heredado del modelo base SmolLM3-3B (no se documentan capacidades específicas adicionales en la información disponible).
- Generación de código y uso como backend de agentes de codificación: la model card incluye configuración explícita para pi-code y opencode mediante endpoint compatible con OpenAI.
- Soporte multilingüe en ocho idiomas: inglés, francés, español, italiano, portugués, chino, árabe y ruso.
- Servido mediante vLLM con plugin automático de GLQ y mediante Transformers con `glq.hf_integration`.
- KV cache cuantizado E8 opcional, que reduce el cache aproximadamente 4× respecto a fp16 para contextos largos en la misma VRAM.
- No se documentan capacidades de visión, audio, tool calling nativo ni modo thinking explícito en la información proporcionada.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con 1,6 GB de pesos en disco y decodificación en línea, el modelo puede ejecutarse en GPUs consumer para chats multi-turno sin depender de la nube.
- Backend de agentes de codificación: la model card documenta la integración con pi-code y opencode apuntando a un endpoint OpenAI-compatible servido con `vllm serve`, lo que permite usar el modelo como motor local de un agente de edición de código.
- Prototipado de pipelines de generación de texto con restricciones de VRAM: útil para validar flujos de transformers o vLLM antes de escalar a un modelo mayor, gracias a su bajo coste de memoria.
- Investigación en cuantización: sirve como caso de estudio reproducible de TCQ + RHT + LDLQ a 3 bpw, con métrica de perplejidad publicada (9,5901 en WikiText-2 frente a 9,1071 en bf16).
- Despliegue multilingüe ligero: cubre ocho idiomas (incluido español) para tareas de generación y resumen en entornos con recursos limitados.
- Evaluación de KV cache comprimido: las variables de entorno `GLQ_KV_QUANT` permiten experimentar con contextos más largos en la misma VRAM, útil para estudiar el impacto de la compresión del cache en calidad.
- Servicio interno de bajo coste: al ser Apache 2.0, puede integrarse en productos comerciales internos sin obligaciones de atribución copyleft.

## Benchmarks y rendimiento

| Benchmark | Métrica | GLQ 3bpw | bf16 (referencia) |
|---|---|---|---|
| wikitext2_ppl | perplejidad (n=128) | 9,5901 | 9,1071 |

El autor advierte que son mediciones de una sola ejecución y que los resultados con n pequeño son estimaciones ruidosas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos comprimidos ocupan aproximadamente 1,6 GB en disco; en VRAM, con overhead de activaciones y cache, cabe holgadamente en GPUs de 8 GB o menos para contextos moderados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para los kernels 3INST; para servir con vLLM se recomienda al menos una RTX 3090/4090 o superior. No se dispone de lista oficial de GPUs validadas.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y similares, dado el reducido tamaño de pesos.
- Opciones de despliegue: vLLM (recomendado por el autor, con plugin GLQ automático, requiere `glq >= 0.7.0`), Transformers con `glq.hf_integration`, y endpoint OpenAI-compatible para agentes. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-trellis-3inst-3bpw (este) | ~3B (base); 792M en safetensors | No disponible (ejemplo a 4096) | GLQ 3,0 bpw | Apache 2.0 | Hugging Face, requiere `glq` |
| HuggingFaceTB/SmolLM3-3B (base) | ~3B | No disponible en la información | bf16/fp16 nativo | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de SmolLM3-3B (GGUF/AWQ/GPTQ) | ~3B | Depende del formato | 4-8 bits típicos | Según autor | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada; la única comparación cuantitativa disponible es la perplejidad en WikiText-2 frente a bf16 (9,5901 vs 9,1071).

## Limitaciones y advertencias

- Discrepancia de parámetros: los safetensors declaran 792.009.728 parámetros frente a los ~3B del modelo base; hay que verificar que el checkpoint carga correctamente con la versión adecuada de `glq` antes de usarlo en producción.
- Dependencia estricta de `glq >= 0.7.0`: el trellis se almacena en layout de fragmento MMA específico de los kernels 3INST; versiones anteriores no podrán decodificarlo.
- Requiere GPU NVIDIA con CUDA: no hay soporte documentado para CPU, llama.cpp, Ollama ni hardware no NVIDIA.
- Riesgo de alucinación inherente a un modelo de 3B: no debe usarse como fuente de verdad en dominios factuales sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada; se heredan los del modelo base.
- Pérdida de calidad por cuantización: la perplejidad sube de 9,1071 a 9,5901 en WikiText-2, una degradación modesta pero medible; en tareas sensibles puede ser mayor.
- Medición de benchmarks con n=128 y una sola ejecución: los números son ruidosos y no deben tomarse como definitivos.
- El ejemplo de vLLM exige el guard `if __name__ == "__main__":` por el método de arranque `spawn`; omitirlo provoca fallos de arranque.
- Licencia Apache 2.0 permite uso comercial, pero el autor del checkpoint es independiente y no ofrece garantías; conviene auditar el repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/SmolLM3-3B-trellis-3inst-3bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio GLQ (código, kernels y cuantizador): https://github.com/cnygaard/glq
- Paper QTIP (referencia de TCQ): https://arxiv.org/abs/2406.11235
