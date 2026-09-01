# xiuken/mamba-130m-hf

## Resumen

El modelo `xiuken/mamba-130m-hf` es una conversión del checkpoint original `state-spaces/mamba-130m-hf` al formato compatible con la librería `transformers` de Hugging Face. Mamba es una arquitectura de modelado de secuencias basada en State Space Models (SSM) selectivos, desarrollada por Albert Gu y Tri Dao, que prescinde por completo de la atención tradicional de los transformers. Este repositorio concreto, subido por el usuario xiuken, contiene los pesos sin modificar junto con el `config.json` y el tokenizer necesarios para cargarlo directamente con `transformers`.

El modelo tiene 129 millones de parámetros, lo que lo sitúa en la gama de modelos pequeños, pensado para tareas de generación de texto con un coste computacional reducido. Su relevancia actual radica en que representa una alternativa eficiente a los transformers para secuencias largas, con una complejidad lineal en la longitud de la secuencia frente a la cuadrática de la atención. Este repositorio facilita su uso dentro del ecosistema estándar de Hugging Face, incluyendo la posibilidad de fine-tuning con PEFT y LoRA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (State Space Model selectivo) |
| Parametros totales | 129.135.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Mamba es una arquitectura de secuencia basada en SSM selectivos, donde la capa central combina una convolución causal 1D con una evolución de estado que depende de la entrada (selectividad). Esto permite un procesamiento en tiempo lineal respecto a la longitud de la secuencia, a diferencia de la atención cuadrática de los transformers. El modelo no utiliza mecanismos de atención, sino que mantiene un estado oculto que se actualiza en cada paso, lo que lo hace especialmente adecuado para secuencias largas y para inferencia autorregresiva con bajo coste por token.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El repositorio indica que los checkpoints son los originales de `state-spaces/mamba-130m-hf`, pero no se especifican los datos de entrenamiento. La model card incluye un ejemplo de fine-tuning con PEFT/LoRA, recomendando mantener el modelo en float32 durante el entrenamiento.

## Capacidades

- Generación de texto causal: el modelo está diseñado para modelado de lenguaje autorregresivo, generando texto token a token.
- Fine-tuning con PEFT: soporta LoRA mediante la librería `peft`, con módulos objetivo como `x_proj`, `embeddings`, `in_proj` y `out_proj`.
- Inferencia eficiente en secuencias largas: gracias a su arquitectura SSM, mantiene un coste lineal en la longitud de la secuencia, superando a los transformers en este aspecto.
- Compatibilidad con kernels CUDA optimizados: si se instalan `causal-conv1d` y `mamba-ssm`, se utilizan kernels CUDA para acelerar la inferencia; en caso contrario, se usa una implementación "eager" en PyTorch.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Generación de texto en entornos con recursos limitados: al tener solo 130M de parámetros, puede ejecutarse en CPU o GPUs de baja gama, siendo útil para prototipos o aplicaciones embebidas.
- Fine-tuning para tareas específicas: gracias al soporte PEFT/LoRA, se puede adaptar a dominios concretos (chat, resúmenes, clasificación) con un coste de entrenamiento reducido.
- Experimentación académica: su arquitectura SSM lo convierte en un objeto de estudio para investigar alternativas a la atención en modelado de lenguaje.
- Inferencia de baja latencia: al no requerir atención, el coste por token es constante, lo que permite respuestas rápidas en aplicaciones interactivas.
- Evaluación de arquitecturas no transformer: sirve como punto de partida para comparar el rendimiento de SSM frente a modelos transformer del mismo tamaño.
- Despliegue en servicios de inferencia compatibles con `transformers`: el repositorio está etiquetado como `endpoints_compatible`, lo que facilita su uso en plataformas como Hugging Face Inference Endpoints o Text Generation Inference (TGI).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo en el repositorio ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- VRAM estimada: con 130M de parámetros, el modelo en float32 ocupa aproximadamente 0,5 GB. En cuantización Q4 (si se generara) se estima un uso de VRAM de unos 1,6 GB, según fuentes externas, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU para tareas de baja exigencia.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como GTX 1650, RTX 2060 o superiores.
- Opciones de despliegue: se puede usar con `transformers` directamente, con `vLLM` si se añade soporte para Mamba (no confirmado en la información), o con `llama.cpp` (no confirmado). La etiqueta `endpoints_compatible` sugiere compatibilidad con TGI.
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo pequeño y sin atención, la latencia por token es baja en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| xiuken/mamba-130m-hf | 129M | SSM (Mamba) | no disponible | no disponible |
| state-spaces/mamba-130m-hf | 129M | SSM (Mamba) | no disponible | Apache 2.0 (según repo original, no confirmado en este) |
| GPT-2 (124M) | 124M | Transformer | 1024 | MIT (según repo original, no confirmado) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y arquitectura. El modelo Mamba se diferencia de GPT-2 por su mecanismo de atención lineal, pero no hay métricas que respalden una superioridad práctica en este tamaño.

## Limitaciones y advertencias

- Licencia no disponible: el repositorio no especifica la licencia, por lo que el uso comercial debe realizarse con cautela y tras verificar los términos con el autor.
- Sesgos y alucinaciones: no hay información sobre sesgos conocidos ni evaluación de alucinaciones. Al ser un modelo pequeño, es probable que presente limitaciones en coherencia y factualidad.
- Contexto limitado: aunque la arquitectura SSM permite secuencias largas, no se especifica la longitud máxima de contexto soportada en esta conversión.
- Idiomas: no se indica qué idiomas soporta; el tokenizer original de Mamba está entrenado principalmente en inglés, pero no se confirma.
- Dependencia de kernels opcionales: para un rendimiento óptimo se requieren `causal-conv1d` y `mamba-ssm`; sin ellos, la implementación "eager" puede ser más lenta.
- Modelo pequeño: su capacidad de razonamiento y generación es limitada en comparación con modelos de cientos de miles de millones de parámetros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xiuken/mamba-130m-hf
- Modelo original: https://huggingface.co/state-spaces/mamba-130m-hf
- Página de especificaciones en LocalLLMs: https://localllms.dev/llm/state-spacesmamba-130m-hf/
- Colección de modelos no transformer: https://huggingface.co/collections/FlameF0X/tiny-non-transformers
