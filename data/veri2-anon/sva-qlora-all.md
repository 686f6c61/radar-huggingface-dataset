# veri2-anon/sva-qlora-all

## Resumen

sva-qlora-all es un adaptador QLoRA (LoRA cuantizado) publicado por el usuario anónimo veri2-anon, diseñado para especializar el modelo base Qwen/Qwen2.5-Coder-7B-Instruct en la generación de aserciones SystemVerilog (SVA) a partir de código RTL. Se trata, por tanto, de un artefacto de ajuste fino ligero (PEFT) y no de un modelo completo: los pesos del repositorio (0,6 GB) contienen únicamente las matrices de bajo rango que se cargan sobre el modelo base de 7 mil millones de parámetros.

El modelo aborda un problema concreto de verificación funcional de hardware: la escritura manual de propiedades SVA que capturen el comportamiento esperado de un diseño RTL es costosa y propensa a errores. El adaptador se entrena sobre el conjunto completo de pares RTL-SVA generados por el autor (la variante "All" mencionada en la model card), lo que sugiere que existen otras variantes con subconjuntos de datos.

La relevancia es acotada pero clara para el nicho de verificación de semiconductores: ofrece una vía de bajo coste computacional (QLoRA permite ajustar modelos de 7B en GPUs de consumo) para convertir un modelo de código generalista en un asistente especializado en SVA. No obstante, la información pública es mínima: no se declaran licencia, idiomas, benchmarks ni detalles del dataset, lo que limita seriamente su evaluación previa a un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-7B-Instruct |
| Parámetros totales | No disponible (el adaptador ocupa 0,6 GB; el modelo base tiene 7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; heredada del modelo base Qwen2.5-Coder-7B-Instruct (no declarada en la información proporcionada) |
| Tipos de cuantización | QLoRA (cuantización del base durante el entrenamiento); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere el base en safetensors/GGUF según el runtime |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con QLoRA sobre Qwen2.5-Coder-7B-Instruct. QLoRA combina la congelación de los pesos del modelo base en precisión reducida (típicamente 4 bits NF4) con el entrenamiento de matrices de bajo rango en precisión superior, lo que reduce drásticamente los requisitos de VRAM frente a un ajuste fino completo. El resultado es un conjunto de pesos de adaptador que se fusionan o se cargan dinámicamente sobre el base mediante la librería PEFT.

El dominio de entrenamiento es la generación de SystemVerilog Assertions a partir de RTL. La model card indica que se usaron "todos los pares RTL-SVA generados" (variante All), pero no se especifica el número de ejemplos, la composición del dataset, la longitud de las secuencias, los hiperparámetros de entrenamiento (rango LoRA, alpha, dropout, tasa de aprendizaje, épocas) ni si hubo etapas de preferencia (RLHF/DPO). Tampoco se documenta ninguna innovación técnica adicional más allá del propio ajuste QLoRA. El código, dataset y resultados se remiten a un repositorio anónimo de 4open.science.

## Capacidades

- Generación de aserciones SystemVerilog (SVA) a partir de descripciones o módulos RTL, que es la tarea objetivo del ajuste.
- Razonamiento sobre código y generación de código en general, heredado del modelo base Qwen2.5-Coder-7B-Instruct.
- Comprensión de constructs de verificación hardware (propiedades, secuencias, implicaciones, relojes y resets) en la medida en que el dataset de entrenamiento los cubra.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para el adaptador (el base Qwen2.5-Coder-Instruct lo soporta, pero el ajuste puede degradarlo).
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingües: no disponibles; el dominio es intrínsecamente técnico y basado en código.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación asistida de SVA en flujos de verificación: dado un módulo RTL, el adaptador propone propiedades SVA que el ingeniero de verificación revisa y refina, reduciendo el tiempo de escritura manual de checks.
- Completado de testbenches basados en assertions: integrado en el editor, sugiere aserciones para señales y protocolos concretos mientras se escribe el testbench.
- Revisión de cobertura funcional: a partir de RTL existente, generar candidatas a propiedades que cubran comportamientos no verificados, para su posterior validación con herramientas formales o simulación.
- Formación de ingenieros junior en SVA: el modelo sirve como generador de ejemplos de propiedades para un RTL dado, que el instructor contrasta con la especificación.
- Migración de checks entre estilos: traducir descripciones en lenguaje natural de requisitos de temporización a SVA concreta, siempre con revisión humana.
- Prototipado rápido en entornos de investigación: al ser un adaptador de 0,6 GB sobre un base de 7B, permite experimentar con generación de SVA en una GPU de consumo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,6 GB; el coste real lo determina el modelo base Qwen2.5-Coder-7B-Instruct.
- Inferencia del base en FP16: aproximadamente 14-16 GB de VRAM, lo que requiere GPUs como A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen.
- Inferencia cuantizada del base en 4 bits (compatible con el origen QLoRA): en torno a 5-7 GB, lo que permite ejecución en RTX 3060 12 GB, RTX 4070, RTX 4080 y similares.
- Despliegue: PEFT + transformers para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp/Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sva-qlora-all | Adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct | Adaptador 0,6 GB / base 7B | No disponible | SVA desde RTL | No disponible | Hugging Face (0 descargas) |
| Qwen2.5-Coder-7B-Instruct (base) | Modelo completo | 7B | No disponible en la información | Código general | No disponible en la información | Hugging Face |
| Alternativas especializadas en SVA | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores o modelos comparables específicos para generación de SVA en la documentación proporcionada.

## Limitaciones y advertencias

- Información pública mínima: sin licencia declarada, sin idiomas, sin benchmarks y sin detalles del dataset, lo que impide evaluar su calidad antes de usarlo.
- Riesgo de alucinación en SVA: puede generar propiedades sintácticamente plausibles pero semánticamente incorrectas respecto al RTL; toda aserción debe validarse con simulación o herramientas formales.
- El ajuste se realizó sobre pares RTL-SVA generados automáticamente; si el dataset contiene errores o sesgos de generación, el adaptador los reproducirá.
- El ajuste puede degradar capacidades generales del base (código fuera de SVA, tool calling, instrucciones generales); conviene evaluar antes de sustituir el base en producción.
- Sin garantías de licencia para uso comercial: al no declararse licencia del adaptador, deben revisarse también los términos del modelo base Qwen2.5-Coder-7B-Instruct.
- Repositorio sin descargas ni likes y de autor anónimo: sin señales de mantenimiento, soporte ni validación por la comunidad.
- Contexto y comportamiento multilingüe no documentados; no asumir soporte más allá de lo que el base proporcione.

## Enlaces

- Hugging Face: https://huggingface.co/veri2-anon/sva-qlora-all
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Código, dataset y resultados (repositorio anónimo): https://anonymous.4open.science/r/veri2-CD05/
