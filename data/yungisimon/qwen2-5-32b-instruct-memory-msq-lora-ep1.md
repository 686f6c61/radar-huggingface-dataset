# yungisimon/Qwen2.5-32B-Instruct-memory-msq-lora-ep1

## Resumen

yungisimon/Qwen2.5-32B-Instruct-memory-msq-lora-ep1 es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. Se trata de un checkpoint intermedio (época 1 de 3) de un entrenamiento LoRA orientado a convertir el modelo base en un "modelo de memoria": el objetivo es que el modelo aprenda a responder preguntas de QA sintéticas construidas a partir del dataset MuSiQue, un benchmark de razonamiento multi-salto sobre múltiples documentos.

El modelo conserva la arquitectura transformer densa del Qwen2.5-32B-Instruct original, con 32.763.876.352 parámetros totales en pesos bf16. El adaptador LoRA (r=32, alpha=64) se ha fusionado en los pesos base, aunque el adaptador sin fusionar también se distribuye en el subdirectorio `lora_adapter/`. El repositorio ocupa 66,6 GB y se carga con `transformers` estándar usando la plantilla de chat de Qwen.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de investigación sobre memoria y razonamiento multi-documento, no de un modelo listo para producción. No tiene descargas ni likes, no se han publicado benchmarks y la model card es mínima. Resulta útil como referencia para quienes investigan ajuste fino con LoRA sobre modelos de 32B y para estudiar cómo se comporta el Qwen2.5-32B-Instruct al especializarse en tareas de recuperación y combinación de entidades entre documentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), derivado de Qwen2.5-32B-Instruct |
| Parámetros totales | 32.763.876.352 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó secuencias de 8096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), más adaptador LoRA sin fusionar en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso con 32,7 mil millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA de rango 32, alpha 64 y dropout 0,05, cubriendo las proyecciones q, k, v, o, gate, up y down. Los parámetros entrenables ascienden a 268.435.456, es decir, el 0,81 % del total. El adaptador resultante se fusionó en los pesos base, de modo que el modelo se carga como un `AutoModelForCausalLM` convencional sin necesidad de cargar el adaptador por separado.

Los datos de entrenamiento son pares de QA sintéticos derivados de MuSiQue, concretamente el fichero `msq_subset1000_numsamplingepochs1_crossdoc_entity_combination_v3.json`, con 664.608 ejemplos. El entrenamiento se realizó en bf16 con checkpointing de gradientes, pérdida calculada solo sobre los tokens del asistente, batch efectivo de 256 (32 por dispositivo, 8 GPUs), tasa de aprendizaje constante de 0,0002 con warmup del 5 %, weight decay 0,01 y max grad norm 1,0, longitud máxima de secuencia de 8096 tokens y 3 épocas planificadas (este checkpoint corresponde a la época 1). El hardware empleado fueron 8 AMD Instinct MI325X, con un tiempo total de pared de 4,46 horas (35,6 GPU-h) para las 3 épocas. No se documentan fases de RLHF ni DPO; el ajuste es supervisado sobre los pares de QA.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen.
- Razonamiento multi-salto sobre múltiples documentos, orientado por el entrenamiento con MuSiQue.
- Combinación de entidades entre documentos (cross-document entity combination), según la denominación del dataset de entrenamiento.
- Respuesta a preguntas de QA sintéticas del estilo de las generadas para el ajuste.
- Capacidades heredadas del modelo base Qwen2.5-32B-Instruct (generación, razonamiento, código, matemáticas, tool calling y multilingüismo), aunque no se han validado tras el ajuste y no hay documentación específica al respecto en la información disponible.
- No se documenta soporte explícito de agentes, visión, audio ni modo de pensamiento en la model card.

## Casos de uso

- Investigación sobre memoria en modelos de lenguaje: el checkpoint sirve para estudiar cómo un ajuste LoRA sobre QA multi-documento altera el comportamiento del Qwen2.5-32B-Instruct en tareas de recuperación y combinación de información entre pasajes.
- Evaluación de ajuste fino con LoRA a escala 32B: útil como referencia reproducible de hiperparámetros (r=32, alpha=64, lr=0,0002, batch 256) y de coste de entrenamiento (35,6 GPU-h en 8 MI325X).
- Experimentos de QA multi-salto: el modelo puede emplearse para probar pipelines de pregunta-respuesta que requieran integrar evidencia de varios documentos, aunque sin garantías de calidad por la falta de benchmarks.
- Estudio de checkpoints intermedios: al ser la época 1 de 3, permite comparar la evolución del aprendizaje entre épocas y analizar el efecto del sobreajuste o de la degradación de capacidades generales.
- Base para nuevos ajustes: al estar fusionado y disponible en safetensors, puede servir como punto de partida para otros ajustes LoRA o para experimentos de destilación sobre tareas de memoria.
- Docencia y divulgación: ejemplo práctico de cómo se documenta y publica un adaptador LoRA fusionado con su carpeta `lora_adapter/` separada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 65 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 33-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: aproximadamente 17-20 GB, viable en una RTX 4090 de 24 GB con margen ajustado.
- GPU recomendadas: A100 80 GB, H100 80 GB, MI325X (usadas en el entrenamiento); en consumer, RTX 4090 24 GB solo con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (forma documentada por el autor), y previsiblemente vLLM, TGI y llama.cpp con conversión a GGUF, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-msq-lora-ep1 | 32,7B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint época 1 de 3, sin benchmarks |
| Qwen/Qwen2.5-32B-Instruct | 32,7B | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por el autor |
| Qwen2.5-32B (variantes oficiales) | 32,7B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Familia base y instruct oficial |

No se dispone de datos de rendimiento del modelo ajustado que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks publicados: no hay evidencia de que mejore al base en tareas reales.
- Es un checkpoint intermedio (época 1 de 3): puede estar infraentrenado respecto al plan completo y mostrar comportamientos inestables.
- Riesgo de sobreajuste al dataset sintético de MuSiQue: posible degradación de capacidades generales del Qwen2.5-32B-Instruct original.
- Riesgo de alucinación inherente a los modelos generativos, no evaluado en este ajuste.
- Idiomas soportados no documentados; el ajuste se realizó sobre datos en inglés presumiblemente, aunque no se confirma.
- Sesgos no evaluados ni documentados.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-32B-Instruct conviene revisar también las condiciones del modelo base.
- Sin descargas ni validación comunitaria: no hay retroalimentación externa sobre su calidad.
- No apto para producción sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-msq-lora-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset MuSiQue (referencia del benchmark): no disponible en la información proporcionada
- Paper de MuSiQue: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
