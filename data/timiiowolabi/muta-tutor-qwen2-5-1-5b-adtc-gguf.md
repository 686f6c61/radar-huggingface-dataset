# timiiowolabi/Muta-Tutor-Qwen2.5-1.5B-ADTC-GGUF

## Resumen

Muta-Tutor-Qwen2.5-1.5B-ADTC-GGUF es un modelo de lenguaje especializado en educación, matemáticas y ciencias, desarrollado por el usuario timiiowolabi como parte de una campaña de fine-tuning denominada ADTC. Parte del modelo base Qwen/Qwen2.5-1.5B-Instruct, al que se le aplica un adaptador LoRA de rango 16 durante 500 pasos sobre un conjunto de datos de opción múltiple de matemáticas y ciencias con licencia limpia. El adaptador se fusiona con el modelo base y el resultado se exporta en formato GGUF con cuantización Q4_K_M.

El modelo está pensado para entornos con recursos limitados, ya que su tamaño reducido (1.5B parámetros) y su cuantización permiten ejecutarlo en CPU o GPUs de baja gama. Se presenta como un candidato finalista en una competición, con una evaluación preliminar que muestra mejoras frente al modelo sin ajustar en tareas de razonamiento científico. Su licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones educativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, una familia de modelos densos decoder-only desarrollada por Alibaba Cloud. En este caso, se parte del checkpoint instruct de 1.5B parámetros y se aplica un fine-tuning mediante LoRA (Low-Rank Adaptation) con rango 16. El entrenamiento se realiza durante 500 pasos sobre un conjunto de datos de opción múltiple centrado en matemáticas y ciencias, con licencia limpia para evitar problemas de copyright. Tras el entrenamiento, el adaptador se fusiona con los pesos del modelo base y el resultado se cuantiza a Q4_K_M para reducir el tamaño y acelerar la inferencia.

No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La model card indica que el proceso incluye un manifiesto de entrenamiento y un manifiesto de dataset con licencia limpia, pero no se proporcionan más detalles en la información disponible.

## Capacidades

- Generacion de texto conversacional y respuestas educativas en ingles.
- Razonamiento en matematicas y ciencias, evaluado mediante tareas de opcion multiple (ARC-Easy).
- Soporte de formato de prompt conversacional (heredado de Qwen2.5-Instruct).
- No se menciona soporte explicito de tool calling, agentes, vision ni audio en la informacion disponible.
- Capacidad multilingue limitada al ingles (segun la etiqueta de idioma).

## Casos de uso

- Tutor automatico de matematicas y ciencias: el modelo puede responder preguntas de opcion multiple y explicar conceptos basicos, aprovechando su fine-tuning especifico en estas areas. Su tamano reducido permite desplegarlo en portatiles o dispositivos de bajo consumo.
- Asistente educativo en entornos sin conexion: al ser un archivo GGUF de aproximadamente 1 GB, puede ejecutarse localmente con llama.cpp u Ollama, sin necesidad de conexion a internet ni servidores externos.
- Generacion de material de estudio: puede crear preguntas de practica, resumenes o explicaciones sencillas para estudiantes de nivel basico o medio, siempre que se supervise su salida para evitar errores.
- Evaluacion de modelos en entornos con CPU: su cuantizacion Q4_K_M y su tamano permiten probar tecnicas de fine-tuning y evaluacion en maquinas sin GPU, como se hizo en la propia evaluacion del autor.
- Prototipado rapido de aplicaciones educativas: al ser un modelo pequeno y con licencia Apache 2.0, es adecuado para integrarse en aplicaciones de aprendizaje o chatbots educativos en fase de desarrollo.
- Investigacion en fine-tuning eficiente: el repositorio incluye manifiestos de entrenamiento y dataset, lo que lo convierte en un caso de estudio para quienes investigan tecnicas LoRA y cuantizacion en modelos pequenos.

## Benchmarks y rendimiento

La model card proporciona una evaluacion comparativa entre el modelo ajustado y el control sin ajustar, ambos convertidos a GGUF y evaluados con el mismo harness en una CPU de GCP. Los resultados son los siguientes:

| Medida | Control | Fine-tuned |
|---|---|---|
| ARC-Easy acc_norm (500 muestras) | 74.4% | 77.8% |
| Scalar total score | 65.3277 | 67.0475 |
| Vector total score | 82.4386 | 84.1387 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. La evaluacion se realizo en un proxy de CPU, sin control de temperatura, y el pico de RSS incluye una estimacion de 45 MiB para el proceso raiz del profiler. El autor menciona que una bateria de evaluacion secundaria esta pendiente.

## Requisitos de hardware

- El archivo GGUF Q4_K_M tiene un tamano aproximado de 1 GB, por lo que cabe en memoria RAM de cualquier equipo moderno.
- Puede ejecutarse en CPU sin GPU, como demuestra la evaluacion realizada en un proxy de CPU de GCP.
- En GPU, requiere menos de 2 GB de VRAM, por lo que es compatible con tarjetas de gama baja como GTX 1650, RTX 2060 o incluso integradas con suficiente memoria compartida.
- Es compatible con motores de inferencia que soporten GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp, entre otros.
- No se dispone de datos de latencia o throughput especificos, pero al ser un modelo de 1.5B cuantizado, se espera una generacion de varios tokens por segundo en CPU moderna y decenas en GPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en los mismos benchmarks. Como referencia, se puede comparar cualitativamente con el modelo base y con la serie Qwen2.5-Math:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Muta-Tutor-Qwen2.5-1.5B-ADTC-GGUF | 1.5B | no disponible | Educacion, matematicas, ciencias | Apache 2.0 |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32K (segun documentacion oficial) | Instruccion general | Apache 2.0 |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1.5B | 4K (segun documentacion oficial) | Matematicas con CoT | Apache 2.0 |

La comparacion con Qwen2.5-Math es relevante porque ambos estan orientados a matematicas, pero no se dispone de resultados de Muta-Tutor en los benchmarks de Qwen2.5-Math. El modelo base Qwen2.5-1.5B-Instruct tiene una ventana de contexto de 32K segun la documentacion oficial, pero no se confirma si el fine-tuning la mantiene.

## Limitaciones y advertencias

- El modelo solo soporta ingles, por lo que no es adecuado para aplicaciones en otros idiomas sin un fine-tuning adicional.
- Al ser un modelo de 1.5B, su capacidad de razonamiento complejo y de generacion de explicaciones detalladas es limitada en comparacion con modelos mas grandes.
- Riesgo de alucinaciones y errores en contenidos cientificos o matematicos; se recomienda supervisar sus respuestas en entornos educativos.
- La evaluacion publicada se realizo en un entorno de CPU con condiciones no controladas (sin temperatura fija), por lo que los resultados pueden no ser totalmente reproducibles.
- El modelo es un candidato de competicion, no un producto final validado. El autor indica que aun requiere la plantilla final de tutor, validacion en entornos reales y perfilado en el hardware objetivo.
- No se proporciona informacion sobre sesgos especificos, pero al derivar de Qwen2.5, puede heredar sesgos presentes en el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el dataset de entrenamiento con "licencia limpia" no imponga restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/timiiowolabi/Muta-Tutor-Qwen2.5-1.5B-ADTC-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentacion de Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Qwen2.5-Math-1.5B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
