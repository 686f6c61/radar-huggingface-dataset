# wonchandev/Soonlife-Qwen3.5-9B-v2b-LoRA

## Resumen

Soonlife-Qwen3.5-9B-v2b-LoRA es un adaptador LoRA desarrollado por el usuario wonchandev sobre el modelo base Qwen/Qwen3.5-9B. Se trata de un ajuste fino por destilación (SFT) orientado a un caso de uso muy concreto: un chatbot de recuperación aumentada (RAG) sobre las normativas y avisos de la Universidad Soonchunhyang (Corea del Sur), bajo el nombre de proyecto "Soonlife". El modelo hereda la arquitectura multimodal del base (etiqueta `image-text-to-text` y clase `Qwen3_5ForConditionalGeneration`) y añade capacidades de tool calling y razonamiento multi-turno en coreano.

La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino una variante experimental (v2b) de un pipeline de destilación donde un "profesor" (Qwen3.8-27B) genera respuestas y trazas de agente que se destilan en el "estudiante" (Qwen3.5-9B). El autor indica explícitamente que la versión de producción es la v1 (FP8) y que esta v2b es una prueba con 1 epoch en lugar de 1,5. El repositorio pesa 0,3 GB y contiene únicamente el adaptador y los registros de entrenamiento, no los pesos completos.

El modelo está pensado para un sistema con prompt de sistema y formato de herramientas fijos; fuera de ese entorno, el autor advierte que no hay garantía de mejora respecto al Qwen3.5-9B original. No se han publicado evaluaciones sobre el split de test en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con atención completa, MLP y capas Gated DeltaNet; adaptador LoRA sobre el modelo base |
| Parametros totales | No disponible para el adaptador; el base Qwen/Qwen3.5-9B tiene 9B (según nombre del modelo) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (longitud máxima de entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en bf16 (safetensors); existen variantes del proyecto en FP8 dynamic y bf16 merged |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json), librería PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un modelo multimodal de la familia Qwen3.5 que combina atención completa con capas Gated DeltaNet (un tipo de atención lineal/SSM híbrida) y un torre de visión. El LoRA tiene r=32, alpha=32 y dropout=0.0, y se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj` del modelo de lenguaje (atención completa, MLP y Gated DeltaNet). La torre de visión y los pesos de decodificación especulativa (MTP) no se entrenan.

El entrenamiento es una destilación supervisada (SFT) desde un profesor Qwen3.8-27B que genera respuestas y trazas de agente usando los mismos prompts RAG y herramientas. El dataset se compone de tres bloques: 3.000 muestras de respuestas en formato RAG (24,6M tokens), 1.728 muestras de trazas de "primer turno" con pensamiento y llamadas a herramientas (23,8M tokens) y 1.604 muestras de trazas completas sin pensamiento previo (33,0M tokens). En total, 6.332 líneas y 81,4M tokens, de los cuales solo 2,99M llevan pérdida. Se usó bf16 con Unsloth, 1 epoch, learning rate 0,0001 con schedule cosine, batch efectivo de 16 y máximo de 32.768 tokens, con un coste de 2,8 horas en 2×H100. La pérdida media de entrenamiento fue 0,2448 y la pérdida de validación final fue 0,2739 (answers) y 0,2608 (traces).

## Capacidades

- Generación de texto conversacional en coreano, orientada a respuestas sobre normativa y avisos universitarios.
- Tool calling / function calling: el entrenamiento incluye llamadas a herramientas dentro de trazas de agente, con formato específico definido por el autor.
- Razonamiento multi-turno con agente: el modelo aprende a emitir un primer turno con "pensamiento" y llamadas a herramientas, y turnos posteriores sin pensamiento previo, replicando el flujo de producción.
- RAG: las respuestas se generan condicionadas a contexto recuperado, según el formato del dataset de entrenamiento.
- Entrada de imagen: heredada del modelo base multimodal; en el dataset las imágenes se sustituyeron por el marcador textual `[그림]` (imagen), por lo que la capacidad visual no se ha reforzado.
- Destilación de trazas: capacidad de imitar el estilo de resolución de un profesor de 27B en el dominio concreto.
- No se documentan capacidades de audio ni modos de "thinking" extendidos más allá del flujo de dos turnos descrito.

## Casos de uso

- Chatbot de atención al estudiante en la Universidad Soonchunhyang: el modelo responde consultas sobre normativa y avisos usando el pipeline RAG y el prompt de sistema para el que fue entrenado, con contexto de hasta 32K tokens.
- Asistente de agente con tool calling: integrado en un orquestador que expone herramientas de búsqueda y consulta, el modelo emite llamadas en el formato aprendido y continúa el flujo multi-turno.
- Recuperación y respuesta sobre documentos institucionales: dado un contexto recuperado, genera respuestas citando la información del corpus, con el estilo de las respuestas del profesor.
- Prototipado de pipelines de destilación: sirve como referencia reproducible (config, data_report, logs) para equipos que quieran destilar un modelo grande en un 9B con LoRA y Unsloth.
- Evaluación de estrategias de entrenamiento (epochs, datos sintéticos): la comparación v2 vs v2b con distintos números de epochs y curvas de validación es útil para estudiar sobreajuste en trazas de agente.
- Despliegue en infraestructura modesta: al ser un adaptador de 0,3 GB sobre un base de 9B, permite servir el modelo con cuantización FP8 o bf16 en una o dos GPU, reduciendo coste frente al profesor de 27B.
- Base para ajustes posteriores en otros dominios coreanos: el adaptador puede combinarse con nuevos LoRA o servir de inicialización para tareas de RAG similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluación sobre el split de test está pendiente. Solo se dispone de pérdidas de validación:

| Metrica | Valor |
|---|---|
| Pérdida de entrenamiento (media) | 0,2448 |
| Pérdida de validación final (answers) | 0,2739 |
| Pérdida de validación final (traces) | 0,2608 |
| Pérdida de validación v1 (answers / traces) | 0,2744 / 0,2583 |
| Pérdida de validación v2 (answers / traces) | 0,2684 / 0,2709 |

## Requisitos de hardware

- VRAM estimada para inferencia del base 9B: aproximadamente 18 GB en bf16, unos 9-10 GB en FP8 y 5-6 GB en cuantización de 4 bits (estimaciones estándar para 9B; no confirmadas por el autor).
- GPU recomendadas: H100 o A100 para bf16/FP8 con contexto largo; RTX 4090 (24 GB) puede alojar el base en bf16 o FP8, aunque con contexto de 32K el margen se reduce.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización; en GPUs de 16 GB probablemente solo con 4 bits y contexto reducido.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM o TGI para servir la versión fusionada, llama.cpp/Ollama si se generan GGUF a partir del modelo fusionado. El autor publica variantes FP8 dynamic y bf16 merged para facilitar el serving.
- Latencia y throughput: no disponibles. El entrenamiento consumió 2,8 horas en 2×H100 para 1 epoch sobre 81,4M tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2b-LoRA | 9B (base) + adaptador | 32K (entrenamiento) | LoRA multimodal especializado en RAG coreano | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3.5-9B | 9B | No disponible | Modelo base multimodal generalista | No disponible en la información | Hugging Face |
| Soonlife-Qwen3.5-9B-FP8 (v1) | 9B | 32K | Variante de producción del mismo proyecto | Apache 2.0 | Hugging Face |
| Soonlife-Qwen3.5-9B-v2-FP8 | 9B | 32K | Variante v2 (1,5 epochs) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las pérdidas de validación indicadas.

## Limitaciones y advertencias

- Modelo especializado: solo está pensado para el chatbot RAG de la Universidad Soonchunhyang; fuera de su prompt de sistema y formato de herramientas no se garantiza mejora sobre el base.
- Sin evaluación: no hay resultados sobre el split de test; las pérdidas de validación no son un indicador fiable de calidad en producción.
- Versión experimental: el propio autor recomienda la v1 (FP8) para producción; v2b es una prueba con 1 epoch.
- Capacidad visual no reforzada: la torre de visión no se entrenó y en el dataset las imágenes se sustituyeron por texto; la entrada de imagen no debe asumirse fiable.
- Decodificación especulativa: los pesos MTP no se entrenaron, por lo que la tasa de aceptación puede ser inferior a la del base si se activa.
- Idioma: solo coreano; el rendimiento en castellano u otros idiomas no está documentado y probablemente degrade.
- Sesgos y alucinación: al ser un ajuste sobre un corpus institucional, puede reproducir sesgos del profesor y del dataset; el riesgo de alucinación en preguntas fuera del corpus persiste.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3.5-9B, no detallada en la información disponible.
- Repositorio de 0,3 GB: contiene solo el adaptador y los registros; es necesario descargar el base por separado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-LoRA
- Variante FP8 para serving: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-FP8
- Variante bf16 fusionada: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b
- Versión de producción v1: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-FP8
- Versión v2: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
