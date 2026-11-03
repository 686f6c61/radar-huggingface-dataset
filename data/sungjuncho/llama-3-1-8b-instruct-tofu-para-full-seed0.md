# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full-seed0

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-full-seed0 es un ajuste fino completo (full fine-tune) del modelo meta-llama/Llama-3.1-8B-Instruct publicado por el usuario sungjuncho en HuggingFace. No se trata de un modelo de propósito general nuevo, sino de un artefacto de investigación orientado al estudio del *unlearning* (desaprendizaje) y del *untraining* (desentrenamiento) en modelos de lenguaje. El modelo se entrena sobre el conjunto de datos TOFU-para, una variante corregida del benchmark TOFU (Task of Fictitious Unlearning) en la que se han corregido erratas en los nombres y se han añadido cinco versiones parafraseadas de cada par pregunta-respuesta verificadas factualmente.

La relevancia de este checkpoint es metodológica: sirve como control o línea base en la colección TOFU-para, que distingue entre eliminar las muestras concretas que recibió un método de desaprendizaje (untraining) y eliminar el conocimiento subyacente que el modelo también aprendió en otras formulaciones (unlearning). El autor indica que este ajuste reproduce de cerca el `tofu_Llama-3.1-8B-Instruct_full` publicado por open-unlearning (probabilidad de respuesta Q-A en el conjunto forget de 0,997 frente a 0,991; utilidad del modelo 0,634 frente a 0,628).

Arquitectónicamente es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.248 parámetros totales en formato safetensors y un repositorio de 16,1 GB. No se dispone de información publicada en la model card sobre longitud de contexto, idiomas soportados ni cuantizaciones disponibles más allá de los pesos en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8.000 millones de parámetros. Sobre esa base se realiza un ajuste fino completo (todos los pesos, no LoRA ni adaptadores) durante 5 épocas, con learning rate 1e-5, batch efectivo de 32, weight decay de 0,01 y la plantilla de chat oficial de Llama 3.1 de Meta. La semilla 0 solo altera el orden de los datos. El código utilizado es `src/train.py` de open-unlearning y la configuración exacta está en el directorio `train_config/` del repositorio.

Los datos de entrenamiento corresponden a la partición `full` (4.000 filas) del dataset sungjuncho/TOFU-para, que es TOFU con las erratas en los nombres corregidas y cinco paráfrasis verificadas por par QA. En este checkpoint concreto se entrena únicamente con la redacción original, sin las paráfrasis, lo que lo convierte en el control estándar de TOFU frente al que se comparan los métodos de desaprendizaje. No se documenta en la model card el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un SFT supervisado convencional sobre datos sintéticos de TOFU.

## Capacidades

- Generación de texto conversacional en formato chat de Llama 3.1, al heredar la plantilla y el comportamiento del modelo base Instruct.
- Memoria factual sobre el conjunto sintético de TOFU: el modelo aprende las biografías ficticias del dataset y responde a preguntas sobre ellas con alta probabilidad (0,997 en el conjunto forget según la model card).
- Capacidad de servir como línea base de evaluación para experimentos de desaprendizaje: permite medir cuánto conocimiento retiene un método tras aplicar *unlearning* frente a este control sin desaprender.
- Soporte de las capacidades generales del modelo base Llama-3.1-8B-Instruct (razonamiento, código, matemáticas, multilingüismo, tool calling), si bien no se han validado ni documentado específicamente en este checkpoint.
- No se documenta thinking mode, visión, audio ni capacidades multimodales.

## Casos de uso

- Investigación en machine unlearning: usar este checkpoint como referencia de control para comparar métodos de desaprendizaje sobre TOFU y cuantificar la retención de conocimiento frente a la eliminación efectiva.
- Evaluación de *untraining* frente a *unlearning*: al ser el ajuste sin paráfrasis, permite aislar si un método elimina solo las muestras vistas o también las formulaciones parafraseadas del mismo hecho.
- Reproducibilidad de experimentos académicos: el autor documenta configuración, semilla y código, lo que facilita replicar los resultados de open-unlearning y extenderlos.
- Estudio de sobreajuste a datos sintéticos: con 5 épocas sobre 4.000 pares QA, el modelo es útil para analizar cómo se memoriza información ficticia y cómo se degrada la utilidad general.
- Benchmarking de robustez ante paráfrasis: comparar este checkpoint con las variantes entrenadas con paráfrasis de la misma colección para medir la generalización del conocimiento aprendido.
- Docencia y formación en privacidad de modelos: ilustrar de forma práctica qué significa que un modelo "olvide" o "desaprenda" información y cómo se mide con métricas de probabilidad Q-A y utilidad.

## Benchmarks y rendimiento

La model card proporciona dos métricas comparativas frente al checkpoint publicado por open-unlearning:

| Metrica | Este modelo | open-unlearning `tofu_Llama-3.1-8B-Instruct_full` |
|---|---|---|
| Probabilidad Q-A en conjunto forget | 0,997 | 0,991 |
| Utilidad del modelo | 0,634 | 0,628 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 20-24 GB.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto moderado.
- En GPUs consumer de 16 GB (RTX 4080, 4070 Ti Super) sería necesario cuantizar a 8 bits, pero no se documentan cuantizaciones publicadas en el repositorio.
- Opciones de despliegue: transformers (soporte nativo, según la model card), y por compatibilidad con el modelo base, vLLM, TGI y llama.cpp tras convertir los pesos a GGUF (no se proporcionan GGUF en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full-seed0 | 8,03 B | no disponible | Control de unlearning (TOFU-para) | llama3.1 | HuggingFace, 236 descargas |
| open-unlearning `tofu_Llama-3.1-8B-Instruct_full` | ~8 B | no disponible | Control de unlearning (TOFU original) | llama3.1 | Referencia publicada por open-unlearning |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K (modelo base) | Asistente general | llama3.1 | HuggingFace, ampliamente disponible |

## Limitaciones y advertencias

- El modelo está sobreajustado al dataset sintético TOFU; su utilidad general (0,634) es notablemente inferior a la del Llama-3.1-8B-Instruct original, por lo que no es adecuado como asistente de producción.
- Riesgo elevado de alucinación fuera del dominio TOFU: al haber sido ajustado 5 épocas sobre 4.000 pares QA, puede generar respuestas plausibles pero incorrectas en temas generales.
- Sesgos: no se documentan análisis de sesgo; al derivar de Llama 3.1 hereda los sesgos del modelo base y añade los del corpus sintético de TOFU.
- Limitaciones de idioma: la model card no declara idiomas soportados; el entrenamiento se realiza presumiblemente en inglés, y no hay garantías de calidad en castellano.
- Restricciones de licencia: se rige por la Llama 3.1 Community License, que impone obligaciones de atribución ("Built with Llama"), restricciones de uso (por ejemplo, no entrenar modelos competidores con sus salidas) y umbrales de usuarios mensuales para licencia comercial adicional.
- No apto para uso comercial como producto final: es un artefacto de investigación sin validación de seguridad, alineamiento ni robustez.
- No se publican cuantizaciones ni versiones GGUF, lo que limita el despliegue en hardware modesto sin trabajo adicional de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
