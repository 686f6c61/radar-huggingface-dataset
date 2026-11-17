# xv0y5ncu/Gemma-4-12B-it-GLQ-5.0bpw

## Resumen

Gemma-4-12B-it-GLQ-5.0bpw es una cuantización del modelo multimodal instruction-tuned `google/gemma-4-12B-it` de Google, publicada por el usuario xv0y5ncu. Utiliza GLQ (Golay-Leech-Quant), un esquema de cuantización post-entrenamiento basado en un codebook del retículo E8 con 65.536 entradas, transformada de Hadamard aleatorizada y LDLQ, aplicado con precisión mixta por capa (4-8 bits por peso) para alcanzar una media objetivo de 5,0 bpw sobre 328 capas cuantizadas. El decodificador de texto está cuantizado; las torres de visión y audio se mantienen en bf16.

El resultado ocupa aproximadamente 8,8 GB en disco (9,4 GB de repositorio) y unos 6,9 GiB de pesos en GPU, frente a los aproximadamente 24 GiB del modelo base en bf16. Esto permite ejecutar un modelo de la familia Gemma 4 con 4.710.959.152 parámetros reales en GPUs de 24-32 GB, donde el bf16 no cabe una vez reservada la caché KV.

Es relevante porque demuestra un esquema de cuantización no uniforme basado en retículos que preserva la fidelidad del modelo base con un SQNR medio de 25,5 dB, y porque incluye una evaluación pareada contra el bf16 en vLLM 0.23.0 con resultados dentro del ruido estadístico en MMLU-Pro y sin diferencias significativas en AIME-2024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, arquitectura `gemma4_unified`), con decodificador de texto y torres de visión y audio |
| Parametros totales | 4.710.959.152 (según safetensors del repo cuantizado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (los benchmarks usan 16k y 32k tokens en modo thinking) |
| Tipos de cuantizacion | GLQ (E8 lattice, codebook de 65.536 entradas, Hadamard aleatorizada + LDLQ), precisión mixta por capa 4-8 bpw, media objetivo 5,0 bpw, 328 capas; torres de visión/audio en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base; sujeta además a la licencia Gemma 4 de Google) |
| Formato de pesos | Safetensors (librería `transformers`, integración `glq.hf_integration`) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer multimodal instruction-tuned de la familia Gemma 4 con arquitectura `gemma4_unified`, que integra decodificador de texto y torres de visión y audio. La model card menciona dimensiones de cabeza de atención heterogéneas, gestionadas nativamente por el backend Triton de vLLM. El modelo base está ajustado con instrucciones y emplea una plantilla de chat con modo thinking, por lo que debe usarse siempre `apply_chat_template`.

Esta ficha corresponde a una cuantización post-entrenamiento, no a un modelo entrenado desde cero. GLQ aplica un codebook del retículo E8 de 65.536 entradas combinado con una transformada de Hadamard aleatorizada y LDLQ, en bloques diagonales sin padding a potencias de 2. La precisión se asigna por capa dentro del rango 4-8 bpw para promediar 5,0 bpw sobre 328 capas. La fidelidad media de cuantización medida es de SQNR 25,5 dB. No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional con plantilla de chat instruction-tuned y modo thinking.
- Razonamiento multi-paso en modo thinking, con presupuestos de contexto de 16k y 32k tokens documentados en la evaluación.
- Procesamiento de imagen y texto (`image-text-to-text` como pipeline declarado), aunque las torres de visión y audio no están cuantizadas y en vLLM se sirven en modo solo texto.
- Capacidades de audio declaradas por la presencia de una torre de audio en el modelo base, aunque no se detallan en la información disponible.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 12B en GPUs de 24-32 GB: con aproximadamente 6,9 GiB de pesos en GPU, deja margen para caché KV y permite servir el modelo donde el bf16 (unos 24 GiB solo en pesos) no cabe.
- Razonamiento con contexto largo en modo thinking: los benchmarks documentados usan ventanas de 16k y 32k tokens, adecuadas para análisis de documentos extensos y tareas de razonamiento encadenado.
- Servicio de chat de alta concurrencia: los aproximadamente 17 GiB liberados frente a bf16 se traducen en más espacio de caché KV, lo que permite más sesiones simultáneas o contextos más largos por sesión.
- Evaluación comparativa de esquemas de cuantización: el repo incluye una evaluación pareada contra bf16 con el mismo harness, útil como referencia para estudiar el impacto de la cuantización por retículos.
- Inferencia en pipelines de Transformers: la integración `glq.hf_integration` permite cargar el modelo con `from_pretrained` y ejecutar generación estándar para prototipado e investigación.
- Servido con vLLM en modo solo texto: mediante `limit_mm_per_prompt` con imagen, vídeo y audio a cero, se puede desplegar el decodificador cuantizado en producción con el backend Triton de vLLM.
- Procesamiento multimodal en Transformers: al mantener las torres de visión y audio en bf16, el modelo puede usarse para tareas image-text-to-text en el entorno de Hugging Face Transformers.

## Benchmarks y rendimiento

Evaluación pareada contra el modelo base en bf16 sobre vLLM 0.23.0 en una RTX PRO 6000, en modo thinking, con el mismo harness (mismos ítems mediante shuffle fijo y mismo muestreo). Son pass@1 de una sola muestra con n pequeño, por lo que son indicativos y no estimaciones ajustadas.

| Benchmark | n | bf16 | GLQ 5.0 bpw |
|---|---|---|---|
| MMLU-Pro (thinking, 16k) | 60 | 78,3% (47/60) | 81,7% (49/60) |
| AIME-2024 (thinking, 32k) | 30 | 93,3% (28/30) | 83,3% (25/30) |

En MMLU-Pro la diferencia está dentro del ruido entre ejecuciones (GLQ acierta 2 ítems más). En AIME-2024 el bf16 supera al cuantizado en 3 ítems, lo que no es estadísticamente significativo con n=30 y una sola muestra (IC del 95% por proporción de aproximadamente ±17 puntos). El autor no reclama paridad ni pérdida de calidad para AIME-2024.

Rendimiento medido en una RTX PRO 6000 (vLLM 0.23.0, caché KV en bf16, decodificación por lotes): pesos en GPU de aproximadamente 6,9 GiB (GLQ 5.0 bpw) frente a aproximadamente 24 GiB (bf16), lo que libera unos 17 GiB; throughput de decodificación agregado de aproximadamente 187 tok/s en el lote de MMLU-Pro y aproximadamente 160 tok/s en el lote de AIME. En GPUs grandes el bf16 decodifica más rápido; la ventaja de GLQ es la huella de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,9 GiB de pesos en GPU, más caché KV en bf16 y overhead del runtime. Encaja en GPUs de 24-32 GB con margen amplio para contexto y concurrencia.
- GPU recomendadas: RTX PRO 6000 (medida en la evaluación), GPUs de 24 GB como RTX 4090 o A10G, y GPUs de 32 GB como V100 32GB o RTX 5090.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB o más (RTX 4090, RTX 5090). En GPUs de 16 GB no hay datos publicados.
- Opciones de despliegue: Hugging Face Transformers con `glq.hf_integration` y vLLM 0.23.0 o superior (backend Triton para las dimensiones de cabeza heterogéneas). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Restricción de versiones: fijar `transformers>=5.13.1,<5.15`, ya que 5.15.0 cambia gemma-4 a una configuración por capa y rompe la carga en vLLM (afecta también al bf16 original).
- Latencia y throughput: aproximadamente 187 tok/s y 160 tok/s agregados en los lotes de evaluación sobre una RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-it-GLQ-5.0bpw | 4.710.959.152 | No disponible | GLQ 5,0 bpw (4-8 bpw por capa) | Apache 2.0 (+ licencia Gemma 4) | Hugging Face, transformers, vLLM |
| google/gemma-4-12B-it (bf16) | No disponible en la información | No disponible | bf16 | Apache 2.0 (+ licencia Gemma 4) | Hugging Face |
| Otras cuantizaciones de Gemma 4 12B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de alternativas de otros esquemas de cuantización (GGUF, AWQ, GPTQ) para este mismo modelo base, por lo que la comparativa cuantitativa con terceros no está disponible.

## Limitaciones y advertencias

- La cuantización afecta solo al decodificador de texto; las torres de visión y audio permanecen en bf16. En vLLM debe servirse en modo solo texto con `limit_mm_per_prompt={"image": 0, "video": 0, "audio": 0}`.
- La evaluación es de una sola muestra con n pequeño (60 y 30 ítems); los intervalos de confianza son amplios y los resultados no deben interpretarse como paridad de calidad demostrada.
- En AIME-2024 el modelo cuantizado obtiene 3 aciertos menos que bf16; el autor no reclama paridad en esta prueba.
- La versión de `transformers` está restringida a `<5.15`; versiones posteriores rompen la carga tanto en este modelo como en el bf16 original.
- En vLLM, al ejecutar como script es obligatorio el guard `if __name__ == "__main__"`, ya que vLLM cambia al método de multiprocesamiento `spawn` tras inicializar CUDA y el script se reimportaría recursivamente.
- Licencia Apache 2.0 heredada, pero sujeta además a la licencia Gemma 4 de Google; debe revisarse para uso comercial.
- Sesgos conocidos, riesgo de alucinación e idiomas soportados: no disponibles en la información proporcionada.
- Longitud de contexto máxima: no disponible en la información proporcionada.
- En GPUs grandes, el bf16 decodifica más rápido; GLQ solo aporta ventaja cuando la memoria es el factor limitante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Gemma-4-12B-it-GLQ-5.0bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
