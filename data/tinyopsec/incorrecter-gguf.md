# tinyopsec/incorrecter-GGUF

## Resumen

`tinyopsec/incorrecter-GGUF` es una colección de cuantizaciones GGUF del modelo `Avicennasis/incorrecter`, un ajuste fino de `Qwen/Qwen2.5-0.5B-Instruct` especializado en introducir errores tipográficos y variaciones propias de la escritura humana en texto generado. El objetivo es producir salidas que no parezcan generadas por una máquina, algo útil para aumentar la naturalidad de textos sintéticos en tareas de humanización, simulación de usuarios o generación de datos de entrenamiento con ruido realista.

El modelo base tiene 494.032.768 parámetros (aproximadamente 0,5 mil millones), por lo que es extremadamente ligero y puede ejecutarse en hardware de consumo modesto. La familia Qwen2.5-Instruct sobre la que se construye aporta una ventana de contexto amplia para su tamaño, aunque la model card no especifica el valor exacto en esta ficha. Esta versión GGUF, publicada por `tinyopsec`, facilita el despliegue en `llama.cpp`, Ollama, LM Studio y otros runtimes compatibles sin necesidad de GPU dedicada.

La relevancia actual del modelo radica en su nicho: la generación de texto con errores controlados es útil para aumentar la diversidad de datasets sintéticos, para pruebas de robustez de correctores ortográficos y para simular interacción humana en entornos de evaluación. No es un modelo de propósito general ni compite en benchmarks de razonamiento o código; su valor está en la tarea específica de humanización tipográfica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El modelo base fue ajustado por `Avicennasis` para la tarea de generación de erratas, aunque la información disponible no detalla el dataset de ajuste, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO. La model card del repositorio GGUF tampoco especifica la composición del corpus de entrenamiento.

La contribución de `tinyopsec` consiste en la conversión y cuantización del modelo a formato GGUF mediante `llama.cpp`, generando trece variantes que cubren desde FP16 (1,0 GB) hasta Q2_K. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; se trata de una cuantización estándar de un ajuste fino ligero.

## Capacidades

- Generación de texto con errores tipográficos realistas: el modelo introduce erratas, sustituciones, omisiones y transposiciones de caracteres de forma deliberada.
- Humanización de texto: produce salidas que imitan patrones de escritura humana descuidada o rápida.
- Generación de datos sintéticos con ruido controlado para entrenamiento de modelos correctores.
- Conversación multi-turno: hereda la naturaleza conversacional de Qwen2.5-Instruct, aunque orientada a la tarea de erratas.
- Compatibilidad con tool calling y function calling: no documentada en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo limita estas capacidades.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Generación de datasets sintéticos con ruido: se puede alimentar texto limpio y obtener variantes con erratas para entrenar correctores ortográficos o modelos de detección de errores, aprovechando las distintas cuantizaciones para controlar el coste computacional.
- Pruebas de robustez de sistemas de NLP: introducir errores controlados en corpus de evaluación para medir la tolerancia de pipelines de extracción de entidades, clasificación o búsqueda.
- Simulación de usuarios humanos en pruebas de usabilidad: generar mensajes con erratas realistas para validar cómo responde un chatbot o formulario ante entradas imperfectas.
- Aumento de datos para fine-tuning de modelos de diálogo: producir respuestas humanizadas que reduzcan el sesgo de estilo "demasiado limpio" en datasets conversacionales.
- Anonimización estilística: transformar texto generado por IA en texto con apariencia humana para estudios de detección de contenido sintético.
- Prototipado rápido en local: al caber en CPU y en GPUs de gama baja, permite iterar en cuadernos o scripts sin infraestructura dedicada, usando la variante Q4_K_M como opción recomendada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en Q4_K_M, 0,6 GB en Q8_0 y 1,0 GB en F16 (según los tamaños de archivo indicados en la model card).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, GTX 1660 o superiores son suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en Raspberry Pi o dispositivos de gama baja con la cuantización Q2_K.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño del modelo, se espera una latencia baja en CPU y muy baja en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| tinyopsec/incorrecter-GGUF | 494 M | no disponible | Generación de erratas | Apache 2.0 | GGUF |
| Avicennasis/incorrecter | 494 M | no disponible | Generación de erratas | Apache 2.0 | safetensors |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible | Instrucciones generales | Apache 2.0 | safetensors |
| Modelos de humanización comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos especializados en generación de erratas con los que comparar rendimiento o calidad. La comparación con Qwen2.5-0.5B-Instruct es relevante porque `incorrecter` deriva directamente de él y comparte arquitectura y tamaño.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5-0.5B-Instruct, puede heredar sesgos del corpus original, pero no se especifican.
- Riesgo de alucinación: presente como en cualquier modelo generativo de 0,5 B; la tarea de erratas puede amplificar salidas incoherentes si no se controla la temperatura.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada en la información disponible; los idiomas soportados tampoco.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor incluye un aviso explícito ("Evaluate before use") que recomienda evaluar el modelo antes de desplegarlo en producción.
- Caveat para producción: es un modelo de nicho; no debe usarse como generador de texto general ni como sustituto de un modelo instruct estándar. Su calidad en tareas distintas a la generación de erratas no está validada.
- El repositorio tiene 0 likes y 490 descargas, lo que sugiere poca validación comunitaria; conviene realizar pruebas propias antes de integrarlo en pipelines críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/incorrecter-GGUF
- Modelo base: https://huggingface.co/Avicennasis/incorrecter
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
