# xv0y5ncu/Gemma-4-12B-it-GLQ-5.0bpw

## Resumen

Gemma-4-12B-it-GLQ-5.0bpw es una cuantización del modelo multimodal `google/gemma-4-12B-it` (Gemma 4 12B Unified) realizada por el desarrollador xv0y5ncu mediante la técnica Golay-Leech-Quant (GLQ). El modelo base, desarrollado por Google DeepMind, es un transformer encoder-free de 12 000 millones de parámetros capaz de procesar texto, imagen, audio y vídeo de forma nativa, con una ventana de contexto de 256 000 tokens. La cuantización GLQ reduce el decoder de texto a un promedio de 5,0 bits por peso (4–8 bpw por capa, 328 capas cuantizadas) mediante un codebook de retículo E8 con transformada de Hadamard aleatorizada, mientras que las torres de visión y audio se mantienen en bf16.

El resultado es un archivo de aproximadamente 8,8 GB en disco y 6,9 GiB de pesos en GPU, lo que permite ejecutar un modelo multimodal de 12B en tarjetas de 24–32 GB de VRAM donde la versión bf16 original (≈24 GiB de pesos) no cabe. La fidelidad media de cuantización es de SQNR 25,5 dB, y las evaluaciones preliminares en MMLU-Pro y AIME-2024 muestran una degradación mínima respecto al modelo bf16 (dentro del ruido estadístico en el primer caso y con una pérdida de 3 aciertos en el segundo). Está disponible bajo licencia Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-free multimodal (Gemma 4 12B Unified), cuantizado con GLQ (E8 lattice, Hadamard, LDLQ) |
| Parametros totales | 4 710 959 152 (pesos en safetensors, solo decoder cuantizado; modelo base original: 12B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256 144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GLQ 5.0 bpw (per-layer mixed precision 4–8 bpw, 328 capas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con condiciones adicionales de la licencia original de Gemma 4) |
| Formato de pesos | safetensors (cuantización GLQ) |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 12B Unified, es un transformer encoder-free que procesa texto, imagen, audio y vídeo de forma nativa mediante una arquitectura unificada de bloques, sin encoders separados para cada modalidad. El decoder de texto ha sido cuantizado con GLQ (Golay-Leech-Quant), un método que utiliza un codebook de retículo E8 de 65 536 entradas combinado con una transformada de Hadamard aleatorizada y LDLQ (Lattice-based Deterministic Lattice Quantization). La cuantización es de precisión mixta por capa, con un objetivo de 5,0 bits por peso y 328 capas cuantizadas, sin padding a potencias de 2 (bloques diagonales). Las torres de visión y audio se mantienen en bf16, por lo que la cuantización solo afecta al decoder de texto.

El entrenamiento original del modelo base incluye ajuste por instrucciones con un modo de "thinking" (razonamiento explícito) integrado en la plantilla de chat, que es obligatorio usar mediante `apply_chat_template`. No se han publicado detalles sobre el dataset de entrenamiento de la cuantización, ya que GLQ es un método de post-entrenamiento que no requiere reentrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de modo "thinking" (razonamiento explícito) integrado en la plantilla de chat.
- Comprensión multimodal nativa: imagen, audio y vídeo (heredada del modelo base), aunque en esta cuantización las torres de visión y audio se mantienen en bf16 y se recomienda servir solo texto en vLLM con `limit_mm_per_prompt`.
- Razonamiento matemático y de nivel AIME: el modelo base alcanza un 93,3 % en AIME-2024 en bf16 (n=30) y la versión cuantizada un 83,3 %.
- Generación de código y soporte de tool calling: el modelo base está optimizado para uso con herramientas, aunque la model card no detalla ejemplos específicos de esta cuantización.
- Multilingüismo: no se han publicado los idiomas soportados en esta cuantización, pero el modelo base de Gemma 4 es multilingüe.

## Casos de uso

- Desarrollo local de asistentes conversacionales con razonamiento: el tamaño reducido permite ejecutar el modelo en una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) con capacidad para contexto largo (256K), ideal para prototipar asistentes con memoria de conversación extensa.
- Despliegue de chatbots con tool calling en entornos de producción: al ser compatible con vLLM 0.23.0+, puede integrarse en un API server con gestión de concurrencia y KV cache ampliada, gracias a los ≈17 GiB de VRAM liberados respecto al modelo bf16.
- Análisis de documentos largos y resumen: la ventana de 256K tokens permite procesar informes, papers o libros completos sin truncar, y la cuantización no afecta al contexto.
- Generación de código asistida en pipelines de CI/CD: se puede servir como endpoint de autocompletado o revisión de código con baja latencia (≈187 tok/s en decode agregado) y soporte para integración con herramientas.
- Evaluación de modelos cuantizados para investigación: útil para estudiar el impacto de la cuantización E8 lattice en tareas de razonamiento y matemáticas, con benchmarks publicados (MMLU-Pro, AIME-2024).
- Servicio de texto en GPUs de 24–32 GB sin necesidad de múltiples tarjetas: el modelo puede servir respuestas en tiempo real con un solo RTX PRO 6000 o similar, donde bf16 no cabe.

## Benchmarks y rendimiento

La model card proporciona resultados de una evaluación pareada contra el modelo bf16 en vLLM 0.23.0 (single RTX PRO 6000, thinking mode, single-sample pass@1, n pequeño). Estos datos son indicativos, no estimaciones ajustadas:

| Benchmark | n | bf16 | GLQ 5.0 bpw |
|---|---|---|---|
| MMLU-Pro (thinking, 16k) | 60 | 78,3 % (47/60) | 81,7 % (49/60) |
| AIME-2024 (thinking, 32k) | 30 | 93,3 % (28/30) | 83,3 % (25/30) |

En MMLU-Pro, la diferencia de +2 aciertos está dentro del ruido de ejecución; en AIME-2024, la pérdida de 3 aciertos no es estadísticamente significativa (intervalo de confianza del 95 % de ±17 puntos por proporción). No se han publicado más benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ≈6,9 GiB de pesos en GPU (GLQ 5.0 bpw) frente a ≈24 GiB en bf16, por lo que cabe en GPUs de 24 GB o 32 GB con margen para KV cache.
- GPUs recomendadas: RTX PRO 6000 (medida en las pruebas), RTX 4090 (24 GB), RTX 6000 Ada (32 GB), A100 40 GB o superiores.
- En consumer GPU: sí, cabe en RTX 4090 (24 GB) y RTX 4080 (16 GB) si se limita el contexto o la concurrencia, dado que los pesos son ≈6,9 GiB.
- Opciones de despliegue: Hugging Face Transformers (con la librería `glq` y `transformers>=5.13.1,<5.15`) y vLLM 0.23.0+ (con `quantization="glq"` y `limit_mm_per_prompt` para texto).
- Latencia y throughput: decode throughput de ≈187 tok/s (batch MMLU-Pro) y ≈160 tok/s (batch AIME) en RTX PRO 6000, agregado en decodificación por lotes.
- Nota: en vLLM, es obligatorio pasar `limit_mm_per_prompt={"image": 0, "video": 0, "audio": 0}` para servir solo texto; las torres multimodales no están cuantizadas y no se cargan en este modo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en GPU | MMLU-Pro (n=60) | AIME-2024 (n=30) | Licencia |
|---|---|---|---|---|---|---|
| google/gemma-4-12B-it (bf16) | 12B | 256K | ≈24 GiB | 78,3 % | 93,3 % | Apache 2.0 |
| xv0y5ncu/Gemma-4-12B-it-GLQ-5.0bpw | 4,7B (safetensors) | 256K | ≈6,9 GiB | 81,7 % | 83,3 % | Apache 2.0 |
| xv0y5ncu/gemma-4-12B-it-GLQ-3bpw-e8p-bd | 4,7B (safetensors) | 256K | no disponible | no disponible | no disponible | Apache 2.0 |

La comparativa muestra que la cuantización GLQ 5.0 bpw reduce el peso de GPU en un 71 % respecto a bf16, manteniendo un rendimiento similar en MMLU-Pro y una pérdida no significativa en AIME-2024. La variante GLQ 3bpw (también disponible en el repositorio del autor) reduce aún más el tamaño, pero no se publican benchmarks.

## Limitaciones y advertencias

- La cuantización solo afecta al decoder de texto; las torres de visión y audio se mantienen en bf16, por lo que la inferencia multimodal requiere cargar estos pesos adicionales y puede superar la VRAM de GPUs de 24 GB si se usan imágenes o vídeo.
- Los benchmarks publicados son de una sola muestra (single-sample pass@1) con n pequeño (60 y 30 ítems), por lo que los intervalos de confianza son amplios (±17 puntos en AIME-2024). No hay que interpretarlos como estimaciones precisas.
- Riesgo de alucinación y sesgos: el modelo base puede alucinar en tareas de razonamiento complejo y hereda sesgos de su entrenamiento; la cuantización puede exacerbar estos comportamientos en casos límite.
- Restricciones de licencia: aunque la cuantización se publica bajo Apache 2.0, la licencia original de Gemma 4 de Google DeepMind incluye condiciones de uso aceptables y restricciones de uso prohibido; se debe revisar la licencia original antes de usar el modelo en producción.
- Requisito de versiones: es necesario fijar `transformers>=5.13.1,<5.15`; la versión 5.15.0 rompe la carga del modelo (cambio de configuración por capa en gemma-4) y vLLM falla antes de cargar los pesos.
- En vLLM, el guard `if __name__ == "__main__":` es obligatorio al ejecutar como script, para evitar recursión de procesos en modo "spawn".
- La compatibilidad con vLLM está verificada en la versión 0.23.0+; versiones anteriores o posteriores no están probadas en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xv0y5ncu/Gemma-4-12B-it-GLQ-5.0bpw
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-12B-it
- Repositorio GLQ (GitHub): https://github.com/cnygaard/glq
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guía de desarrollo de Gemma 4 12B (Google Developers Blog): https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Licencia original de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Variante GLQ 3bpw del autor: https://huggingface.co/xv0y5ncu/gemma-4-12B-it-GLQ-3bpw-e8p-bd
