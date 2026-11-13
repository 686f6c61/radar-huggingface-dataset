# xs7david/xnon

## Resumen

xnon es un ajuste fino (finetune) del modelo Llama 3 8B Instruct, desarrollado por el usuario xs7david y publicado en Hugging Face. Se trata de un modelo derivado de `unsloth/llama-3-8b-Instruct-bnb-4bit`, es decir, una versión de Llama 3 8B Instruct cuantizada a 4 bits y optimizada para entrenamiento rápido mediante la librería Unsloth, sobre la que se ha aplicado un proceso adicional de ajuste fino supervisado (SFT) con TRL.

El modelo hereda la arquitectura transformer decoder-only de Llama 3 8B, con aproximadamente 8.000 millones de parámetros y una ventana de contexto nativa de 8.192 tokens. Está orientado a generación de texto en inglés y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin las restricciones de la licencia comunitaria de Llama 3.

La relevancia de este modelo es limitada: se trata de una publicación de tipo experimental o de aprendizaje, sin métricas de evaluación publicadas, sin documentación sobre el dataset de ajuste fino y con cero descargas en el momento de redactar esta ficha. Resulta útil como ejemplo de flujo de trabajo Unsloth + TRL, pero no está pensado para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | ~8.000 millones (heredados de Llama 3 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base está en bnb-4bit |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

xnon es un ajuste fino del checkpoint `unsloth/llama-3-8b-Instruct-bnb-4bit`, que a su vez es una versión de Llama 3 8B Instruct cuantizada a 4 bits con bitsandbytes y optimizada por Unsloth para acelerar el entrenamiento (según la model card, "2x faster"). La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only con atención por cabezas agrupadas (GQA), embeddings rotatorios (RoPE) y activación SwiGLU, con 32 capas y una dimensión oculta de 4.096.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens de entrenamiento, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente indica que el entrenamiento se realizó con Unsloth y TRL, y que parte del modelo base citado. No se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para el entrenamiento acelerado.

## Capacidades

- Generación de texto en inglés, heredada de Llama 3 8B Instruct.
- Razonamiento básico y respuesta a instrucciones (el modelo base es un Instruct).
- Generación de código y resolución de problemas matemáticos sencillos (capacidades del modelo base, no verificadas tras el ajuste fino).
- Soporte de conversaciones multi-turno (formato de chat de Llama 3 Instruct).
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- Tool calling / function calling: no documentado en este checkpoint.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno dentro de la ventana de 8.192 tokens, aunque requiere validación previa por la falta de benchmarks.
- Experimentación con flujos Unsloth + TRL: sirve como ejemplo de referencia para reproducir un pipeline de ajuste fino sobre Llama 3 8B cuantizado a 4 bits.
- Generación de texto asistida en entornos de investigación: útil para comparar el efecto del ajuste fino frente al modelo base en tareas concretas.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para experimentos posteriores sin ataduras de la licencia comunitaria de Llama 3.
- Evaluación de calidad de ajustes finos pequeños: permite medir regresiones frente a Llama 3 8B Instruct en tareas de instrucción.
- Despliegue en hardware de consumo con cuantización adicional: al derivar de un checkpoint 4-bit, puede convertirse a GGUF y ejecutarse en GPUs de gama media para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, un modelo de ~8.000 millones de parámetros en FP16 requiere aproximadamente 16 GB de VRAM; en 4 bits, en torno a 5-6 GB.
- GPU recomendadas: no especificadas por el autor. Para FP16, una GPU con 16-24 GB (RTX 4090, A10G, L4). Para 4 bits, GPUs de consumo con 8 GB o más.
- Cabe en GPU de consumo: probablemente sí en cuantización 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), aunque no está verificado por el autor.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta del repo), llama.cpp/Ollama tras conversión a GGUF, vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xs7david/xnon | ~8.000 M | 8.192 | apache-2.0 | Hugging Face | Finetune sin benchmarks publicados |
| meta-llama/Meta-Llama-3-8B-Instruct | ~8.000 M | 8.192 | Llama 3 Community License | Hugging Face | Modelo base oficial, con evaluaciones publicadas |
| unsloth/llama-3-8b-Instruct-bnb-4bit | ~8.000 M | 8.192 | apache-2.0 (según repo) | Hugging Face | Checkpoint 4-bit del que deriva xnon |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7.200 M | 32.768 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con mayor contexto |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad tras el ajuste fino; el rendimiento real es desconocido.
- No se documenta el dataset de entrenamiento, por lo que no puede evaluarse el riesgo de sesgos introducidos.
- Riesgo de alucinación inherente a los modelos de ~8B, no mitigado de forma documentada.
- Soporte limitado a inglés según la model card.
- Ventana de contexto de 8.192 tokens, inferior a la de alternativas actuales con 32K o más.
- Cero descargas y ausencia de mantenimiento aparente: no es un modelo recomendable para producción sin validación propia.
- Aunque la licencia declarada es Apache 2.0, conviene verificar la compatibilidad con la licencia original de Llama 3 al redistribuir el modelo.
- El checkpoint deriva de una versión cuantizada a 4 bits, lo que puede implicar pérdida de calidad respecto al modelo original en FP16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xs7david/xnon
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Llama 3 (blog de Meta): https://ai.meta.com/blog/meta-llama-3/
