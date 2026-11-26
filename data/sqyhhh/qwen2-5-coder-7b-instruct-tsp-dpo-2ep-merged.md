# sqyhhh/Qwen2.5-Coder-7B-Instruct-TSP-DPO-2ep-Merged

## Resumen

Qwen2.5-Coder-7B-Instruct-TSP-DPO-2ep-Merged es un ajuste fino por preferencias (DPO) del modelo Qwen2.5-Coder-7B-Instruct de Alibaba, publicado por el usuario sqyhhh en Hugging Face. Se trata de un modelo derivado de 7 mil millones de parametros orientado a generacion de codigo y conversacion tecnica, en el que se ha aplicado un entrenamiento DPO sobre un conjunto de 12.804 pares de preferencia con un adaptador LoRA de rango 8, posteriormente fusionado en los pesos base en precision BF16.

El modelo parte de la arquitectura transformer decoder-only de la familia Qwen2.5, con el tokenizador y la ventana de contexto del modelo base (hasta 32.768 tokens en la version Instruct de Qwen2.5-Coder, aunque la model card no lo confirma explicitamente para este derivado). El entrenamiento se realizo durante 2 epocas (802 pasos de optimizacion) en una unica GPU A800 de 80 GB, con una longitud de corte de 4.096 tokens y una perdida de entrenamiento final de aproximadamente 0,2284.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de alineacion por preferencias sobre un modelo de codigo ampliamente utilizado, publicado sin evaluacion independiente de seguridad ni de funcionalidad. El autor advierte explicitamente de que las metricas de entrenamiento no establecen mejoras de seguridad, por lo que cualquier uso en produccion exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 7 mil millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-Coder-7B-Instruct soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la model card (los pesos se publican en BF16; al ser compatible con transformers, admite cuantizacion posterior con herramientas externas) |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen2.5 soporta multiples idiomas, incluido espanol) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2.5, con atencion causal estandar y los componentes del modelo base Qwen2.5-Coder-7B-Instruct. No se introducen cambios arquitectonicos: el ajuste se realiza mediante un adaptador LoRA de rango 8 aplicado a todas las capas lineales, que posteriormente se fusiona en los pesos base para producir un checkpoint completo en BF16 cargable directamente con Transformers.

El entrenamiento utiliza DPO (Direct Preference Optimization) sobre 12.804 pares de preferencia, con un beta de 0,1, tasa de aprendizaje de 5e-6, tamano de lote efectivo de 32 (batch 1 con acumulacion de gradiente 32) y una longitud de corte de 4.096 tokens. Se ejecutaron 2 epocas (802 pasos) en una A800 de 80 GB durante 3 horas, 45 minutos y 50 segundos, con una perdida de entrenamiento de aproximadamente 0,2284. No se especifica la composicion del dataset de preferencias ni el proceso de generacion de los pares; la etiqueta "TSP" del nombre del modelo no se explica en la model card.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento sobre codigo: explicacion, refactorizacion y depuracion de fragmentos.
- Generacion de texto conversacional en formato chat (pipeline text-generation, tag conversational).
- Alineacion por preferencias orientada a mejorar la calidad de las respuestas segun el dataset DPO empleado (composicion no documentada).
- Soporte de tool calling y function calling: no confirmado para este derivado; el modelo base Qwen2.5-Coder-7B-Instruct lo soporta, pero la model card no lo verifica tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este derivado.
- Capacidades multilingues: no documentadas en la model card; el modelo base soporta varios idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede autocompletar y explicar fragmentos de codigo en un flujo de chat, aprovechando la base Qwen2.5-Coder y el ajuste DPO para respuestas mas alineadas con preferencias humanas. Requiere validacion previa por la ausencia de evaluacion independiente.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede proponer casos de prueba; util en pipelines de CI/CD como paso de sugerencia, nunca como sustituto de revision humana.
- Refactorizacion asistida: el modelo puede reescribir funciones para mejorar legibilidad o rendimiento, con el desarrollador revisando el diff antes de fusionar.
- Documentacion tecnica automatica: generacion de docstrings y comentarios a partir de firmas de funciones y bloques de codigo.
- Chatbot de soporte tecnico para desarrolladores: conversaciones multi-turno sobre errores de compilacion o APIs, limitado por la ventana de contexto del modelo base y por la falta de datos de evaluacion.
- Experimentacion en investigacion de alineacion: el checkpoint fusionado sirve como referencia para comparar el efecto de DPO con LoRA rango 8 sobre Qwen2.5-Coder, dado que el autor publica los hiperparametros completos.
- Fine-tuning posterior: al ser un checkpoint completo en BF16, puede servir como punto de partida para nuevos ajustes, aunque sin garantias de mejora sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente la perdida de entrenamiento (aproximadamente 0,2284) y senala que la evaluacion independiente de seguridad y funcionalidad esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14-16 GB solo para pesos, mas memoria para el KV cache y activaciones; en la practica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones por tamano, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, A800 para BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 con contextos limitados o cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en BF16 con contexto moderado, y en GPUs de 12-16 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag endpoints_compatible), y herramientas compatibles con safetensors como vLLM; llama.cpp y Ollama requeririan conversion a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct-TSP-DPO-2ep-Merged | 7B | no disponible (base: 32.768) | no disponible | no (pendiente) | Hugging Face |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | 32.768 tokens | Apache 2.0 (segun el modelo base de Alibaba) | si, por el autor original | Hugging Face, ecosistema amplio |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | si | Hugging Face |
| DeepSeek-Coder-6.7B-Instruct | 6,7B | 16.384 tokens | licencia propia de DeepSeek | si | Hugging Face |

La comparativa con el modelo base es la mas relevante: este derivado no documenta mejoras medibles sobre Qwen2.5-Coder-7B-Instruct y carece de evaluacion independiente, por lo que el modelo base sigue siendo la opcion por defecto para produccion.

## Limitaciones y advertencias

- Ausencia de evaluacion independiente: el autor declara explicitamente que la evaluacion de seguridad y funcionalidad esta pendiente y que las metricas de entrenamiento no establecen mejoras de seguridad.
- Dataset DPO no documentado: se desconoce la composicion de los 12.804 pares de preferencia, lo que impide anticipar sesgos introducidos por el ajuste.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 7B, especialmente en codigo con APIs poco comunes o recientes.
- Ventana de contexto durante el entrenamiento limitada a 4.096 tokens: el ajuste DPO no se realizo sobre secuencias mas largas, aunque el modelo base soporte hasta 32.768 tokens; el comportamiento mas alla de 4.096 tokens no esta validado para este derivado.
- Idiomas no declarados: no hay garantia documentada de rendimiento multilingue tras el ajuste.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- El termino "TSP" del nombre no se explica en la model card; no es posible determinar a que se refiere el ajuste.
- Uso en produccion: requiere evaluacion propia de calidad, seguridad y sesgos antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sqyhhh/Qwen2.5-Coder-7B-Instruct-TSP-DPO-2ep-Merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
