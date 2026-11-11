# Ternweft/Kwen1.0-4B

## Resumen

Kwen1.0-4B es un ajuste fino mediante LoRA de Qwen3.5-4B, desarrollado por Ternweft y publicado como versión experimental. El modelo parte del checkpoint base Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y se orienta a investigación, uso de herramientas (tool calling) y programación mixta. No se entrena desde cero y no guarda afiliación con Qwen ni con Nous Research.

El autor declara explícitamente que el modelo no alcanzó el objetivo del piloto. El ajuste mejoró la muestra de tool-calls (+0,08), pero degradó las puntuaciones de programación (mbpp -0,12, coding -0,04) y de conocimiento general (MMLU-Pro -0,06). La prueba de investigación se mantuvo en cero. Por tanto, no se recomienda como sustituto general del Qwen3.5-4B original.

El interés técnico del checkpoint es acotado pero documentado con rigor: incluye el adaptador LoRA, los pesos fusionados en BF16 y una exportación GGUF solo texto, además de resultados emparejados con intervalos de incertidumbre y un manifiesto de experimento con las revisiones exactas de los datasets. El repositorio ocupa 12,0 GB y el modelo tiene 4.539.265.536 parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); ajuste fino con LoRA |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; se sugiere iniciar en 8.192 tokens para uso local con Hermes |
| Tipos de cuantización | GGUF (exportación texto); pesos fusionados en BF16; adaptador LoRA |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre Qwen3.5-4B, un transformer multimodal (pipeline image-text-to-text) del que se conservan los componentes de visión en el checkpoint fusionado. El entrenamiento ejecutó 703 pasos de optimizador sobre 5.623 conversaciones. El adaptador publicado es el checkpoint 700, seleccionado por la menor pérdida en una muestra de desarrollo fija de 20 conversaciones (0,3463 frente a 0,5017 inicial), no por resultados de benchmark finales.

Las fuentes de entrenamiento son NousResearch/hermes-function-calling-v1, Team-ACE/ToolACE, los subconjuntos originales smol-summarize y smol-constraints de HuggingFaceTB/smoltalk, y m-a-p/CodeFeedback-Filtered-Instruction, todas con licencia Apache-2.0. La exportación omite las cabeceras opcionales de predicción multi-token (MTP) del checkpoint base, que el runtime de Transformers no carga; las evaluaciones usan decodificación autorregresiva estándar y esta versión no soporta decodificación especulativa MTP.

## Capacidades

- Generación de texto conversacional multi-turno.
- Tool calling y function calling, con mejora medida en la muestra de herramientas (+0,08).
- Programación mixta (aunque con regresión frente al base en mbpp y coding).
- Capacidades de visión heredadas del base, presentes en el checkpoint fusionado pero no validadas.
- Modo thinking heredado del base, no validado en este ajuste.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento de tipo investigación: la prueba específica se mantuvo en cero.

## Casos de uso

- Evaluación de tool calling en investigación: el modelo sirve para reproducir el experimento de ajuste LoRA sobre function calling con los datasets Hermes y ToolACE, comparando el adaptador contra el base con las mismas muestras emparejadas.
- Prototipado de agentes con endpoints compatibles OpenAI: el checkpoint declara compatibilidad con endpoints y puede desplegarse tras una API local compatible para probar flujos multi-paso en laboratorio.
- Estudio de regresión por ajuste fino: útil como caso documentado de cómo un LoRA orientado a herramientas degrada programación y conocimiento general, con métricas antes/después publicadas.
- Pruebas de compatibilidad GGUF: la exportación texto permite validar el pipeline de conversión y el chat template nativo de Qwen3.5 en llama.cpp o LM Studio con contexto inicial de 8.192 tokens.
- Investigación sobre contaminación de benchmarks: el autor advierte de posible contaminación en datos públicos de preentrenamiento, lo que convierte al modelo en material para estudiar ese fenómeno con resultados emparejados.
- Base para experimentos de decodificación: al omitir las cabeceras MTP, sirve para comparar decodificación autorregresiva estándar frente a variantes especulativas en trabajos posteriores.

## Benchmarks y rendimiento

Resultados deterministas, en modo no-thinking y con muestreo, sobre pesos fusionados en BF16. No son resultados oficiales de benchmark completo.

| Suite | Ítems | Puntuación | Cambio frente al original |
|---|---:|---:|---:|
| research | 50 | 0,000 | +0,000 |
| mbpp | 100 | 0,580 | -0,120 |
| coding | 25 | 0,600 | -0,040 |
| mmlu_pro | 100 | 0,410 | -0,060 |
| ifeval | 100 | 0,710 | -0,020 |
| tools | 25 | 0,760 | +0,080 |

La suite de 100 tareas estilo Hermes es un proxy congelado de recuperación, código y tool-call, no una certificación real de Hermes Desktop. El GGUF se somete a una comprobación de compatibilidad separada de 12 casos. El autor indica que estas muestras pequeñas no establecen superioridad general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4,54 mil millones de parámetros, en BF16 requiere aproximadamente 9 GB de pesos, y en cuantizaciones GGUF de 4-8 bits se reduce considerablemente.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) cubre BF16 con holgura y GPUs de 16 GB pueden alojar cuantizaciones GGUF.
- GPU de consumo: sí, cabe en tarjetas consumer de gama alta; el autor recomienda LM Studio o llama.cpp para uso local.
- Despliegue: Transformers, llama.cpp, LM Studio y endpoints compatibles OpenAI; el autor menciona el runtime de Transformers y la exportación GGUF.
- Contexto de arranque recomendado: 8.192 tokens para uso local con Hermes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kwen1.0-4B | 4.539.265.536 | No disponible | tools 0,760; mbpp 0,580; mmlu_pro 0,410 (muestras pequeñas) | Apache-2.0 | Hugging Face, adaptador LoRA, safetensors y GGUF |
| Qwen/Qwen3.5-4B (base) | 4B (clase) | No disponible | Referencia de los deltas: mejor en mbpp, coding y mmlu_pro que el ajuste | No disponible | Hugging Face |
| Alternativas de 4B de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

El autor no respalda ninguna afirmación de superioridad frente a modelos de 4B o 9B.

## Limitaciones y advertencias

- Modelo experimental que no alcanzó el objetivo del piloto; no se recomienda como reemplazo general de Qwen3.5-4B.
- Regresión medida en programación (mbpp -0,12, coding -0,04) y conocimiento general (MMLU-Pro -0,06).
- La prueba de investigación se mantiene en cero.
- Visión y modo thinking heredados del base pero no validados; el GGUF es solo texto.
- Exportación sin cabeceras MTP: no soporta decodificación especulativa MTP en esta versión.
- Posible contaminación de benchmarks públicos en el preentrenamiento, según advierte el autor.
- Las evaluaciones son muestras pequeñas y no establecen superioridad general.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Idiomas soportados: no disponibles.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse todos los avisos de las fuentes upstream.
- Es obligatorio mantener el chat template nativo de Qwen3.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ternweft/Kwen1.0-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset Team-ACE/ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset m-a-p/CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
