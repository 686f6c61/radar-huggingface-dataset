# techedstudios/domino-v4-cognitive-1.5b

## Resumen

DOMINO V4 Cognitive 1.5B es un ajuste fino (fine-tune) del modelo DeepSeek-R1-Distill-Qwen-1.5B, desarrollado por Teched Studios bajo la dirección de Prajjwal Kumar Gupta. El modelo se presenta como una "arquitectura cognitiva unificada" que incorpora un enrutador cognitivo dinámico (denominado "Cognitive Router") en las capas 13 y 25 del transformer subyacente, con un total de 792.580 parámetros entrenables adicionales (el 0,0445 % del total del modelo). El objetivo declarado es mejorar el razonamiento matemático sobre el modelo base sin incrementar significativamente el coste computacional.

El modelo hereda la arquitectura Qwen2 del sustrato DeepSeek-R1-Distill-Qwen-1.5B, con 1.777.880.580 parámetros totales y pesos en formato safetensors. Está orientado a generación de texto y conversación en inglés, con licencia Apache 2.0. La propuesta técnica se centra en la eficiencia: en lugar de reentrenar el modelo completo, se añaden módulos ligeros que modulan la activación de capas intermedias para reforzar el razonamiento multi-paso.

La relevancia del modelo es limitada pero ilustrativa: demuestra una estrategia de bajo coste para especializar modelos pequeños en tareas de razonamiento aritmético, un área donde los modelos de 1.5B suelen fallar. No obstante, la evidencia empírica publicada es muy reducida (10 problemas de GSM8K) y el modelo no cuenta con descargas ni validación comunitaria en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (base DeepSeek-R1-Distill-Qwen-1.5B) con enrutador cognitivo dinámico en capas 13 y 25 |
| Parámetros totales | 1.777.880.580 |
| Parámetros activos | No aplica (no es MoE); 792.580 parámetros entrenables adicionales (0,0445 %) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizaciones estándar de Qwen2, pero no se documenta) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del transformer decoder-only de Qwen2 que constituye el sustrato de DeepSeek-R1-Distill-Qwen-1.5B. Sobre esa base se insertan dos módulos de enrutamiento cognitivo ("Cognitive Router") en las capas 13 (Mid-Core) y 25 (Deep Core), que según la model card alcanzan valores de activación α de 0,9988 y 1,0000 respectivamente. Estos módulos añaden 792.580 parámetros entrenables, lo que representa un 0,0445 % del total del modelo. La arquitectura exacta de dichos módulos (si son adaptadores, gates o capas de atención adicionales) no se detalla en la información disponible.

No se especifican en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o supervisión específica. La model card únicamente indica que la evaluación se realizó en bfloat16 sobre problemas no vistos de GSM8K, y que el ajuste se orientó a mejorar el razonamiento matemático respecto al modelo base. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático de tipo aritmético multi-paso, con mejora declarada sobre GSM8K respecto al modelo base.
- Razonamiento encadenado (chain-of-thought) heredado de DeepSeek-R1-Distill.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso con herramientas.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito más allá del heredado del modelo base.

## Casos de uso

- Resolución de problemas aritméticos escolares: el modelo puede emplearse para resolver ejercicios de tipo GSM8K (problemas verbales de matemáticas de primaria) generando la solución paso a paso, aprovechando el ajuste específico sobre este tipo de tareas.
- Asistente educativo de matemáticas básicas: integrado en una aplicación de tutoría, puede explicar la resolución de problemas de varias operaciones con un contexto conversacional corto, adecuado para un modelo de 1.5B.
- Prototipado de investigación en arquitecturas cognitivas: sirve como banco de pruebas para estudiar el efecto de módulos de enrutamiento ligeros sobre el razonamiento en modelos pequeños, dado su bajo overhead de parámetros (0,0445 %).
- Generación de cadenas de razonamiento para datasets sintéticos: puede utilizarse para producir trazas de razonamiento matemático que alimenten pipelines de destilación o aumento de datos, aunque con validación posterior obligatoria.
- Evaluación comparativa de fine-tunes de bajo coste: útil en entornos académicos para comparar estrategias de especialización (adaptadores ligeros frente a reentrenamiento completo) sobre un mismo sustrato.
- Chatbot de dominio restringido en inglés: para tareas conversacionales simples donde el contexto no sea muy largo y el requisito principal sea bajo coste de despliegue en hardware consumer.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son una evaluación propia sobre 10 problemas de GSM8K no vistos, en bfloat16:

| Métrica | DeepSeek-1.5B (base) | DOMINO V4 |
|---|---|---|
| GSM8K (10 problemas, held-out) | 60,0 % (6/10) | 80,0 % (8/10) |
| Tasa de error | 40,0 % | 20,0 % |
| Router α (capa 13) | No aplica | 0,9988 |
| Router α (capa 25) | No aplica | 1,0000 |
| Overhead de parámetros entrenables | 0 % | 0,0445 % (792K) |

Advertencia: la muestra es de 10 problemas, sin intervalos de confianza ni repeticiones, por lo que la diferencia de +20 puntos porcentuales no es estadísticamente concluyente. No se han publicado resultados en MMLU, HumanEval ni otras suites estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 5-7 GB en función de la longitud de contexto).
- En cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits: alrededor de 1 GB (estimaciones estándar para un modelo de 1.5B, no documentadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue en producción, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB de VRAM.
- Opciones de despliegue: al ser un modelo Qwen2 en safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DOMINO V4 Cognitive 1.5B | 1,78B | No disponible | 80 % (10 problemas, dato del autor) | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32.768 tokens (según documentación del modelo base) | 60 % (10 problemas, dato del autor) | MIT (modelo base) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | No comparable directamente (no evaluado en la misma muestra) | Apache 2.0 | Hugging Face |

La comparación con Qwen2.5-1.5B-Instruct se ofrece como referencia de categoría (modelo pequeño instruct), pero no se dispone de resultados en la misma muestra de GSM8K. El dato de contexto del modelo base (32.768 tokens) proviene de la documentación pública de DeepSeek-R1-Distill-Qwen-1.5B, no de la model card de DOMINO V4.

## Limitaciones y advertencias

- Evidencia empírica muy limitada: el benchmark se basa en 10 problemas, sin validación estadística ni repetición con distintas semillas.
- Sin descargas ni likes en Hugging Face en el momento de la ficha: no hay validación independiente por parte de la comunidad.
- Idiomas: solo inglés documentado; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada: se desconoce si se ha modificado respecto al modelo base.
- Riesgo de alucinación: como todo modelo de 1.5B, propenso a errores en razonamiento aritmético complejo; en la propia evaluación falló 2 de 10 problemas, uno de ellos con un error grave (18.000 en lugar de 160).
- La arquitectura del "Cognitive Router" no está descrita técnicamente, lo que dificulta la reproducibilidad y la auditoría del ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene su propia licencia (MIT según su model card); conviene verificar la compatibilidad en despliegues comerciales.
- No se documentan sesgos específicos, pero al heredar el sustrato de DeepSeek/Qwen, arrastra los sesgos de sus datos de entrenamiento originales.
- Para producción, se recomienda validación exhaustiva en el dominio objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/techedstudios/domino-v4-cognitive-1.5b
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Documentación de Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
