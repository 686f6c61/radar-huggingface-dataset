# umitaslan/Qwen3.5-0.8B-Base

## Resumen

Qwen3.5-0.8B-Base es el modelo fundacional multimodal mas pequeno de la familia Qwen3.5, publicado por el equipo Qwen de Alibaba. Se trata de un modelo causal de lenguaje con codificador de vision, entrenado con fusion temprana sobre tokens multimodales, lo que le permite procesar entradas de imagen y texto de forma nativa. Esta version concreta, alojada en el repositorio `umitaslan/Qwen3.5-0.8B-Base`, contiene unicamente los pesos preentrenados en formato Hugging Face Transformers, sin ajuste de instrucciones, y esta pensada para fine-tuning, experimentos de aprendizaje en contexto e investigacion, no para interaccion directa.

La arquitectura combina un esquema hibrido poco habitual: capas de atencion lineal basadas en Gated DeltaNet intercaladas con capas de atencion completa con compuertas (Gated Attention), organizadas en un patron repetitivo de 24 capas. Con 873.438.784 parametros reales (0.8B nominales), una dimension oculta de 1024 y un vocabulario de 248.320 tokens, el modelo ofrece una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens. El entrenamiento incluye prediccion multi-token (MTP) en varios pasos.

Su relevancia actual radica en tres factores: es multimodal desde el preentrenamiento, soporta 201 idiomas y dialectos segun el autor, y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de investigacion. Al ser un modelo base de 0.8B, resulta adecuado como punto de partida para ajustes eficientes con LoRA sobre la plantilla de chat oficial, gracias a que los tokens de control `<|im_start|>` y `<|im_end|>` fueron entrenados especificamente para ello.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet (atencion lineal) y Gated Attention, mas codificador de vision |
| Parametros totales | 873.438.784 (0.8B nominales) |
| Parametros activos | no disponible (la model card menciona MoE disperso en las notas generales de la familia, pero no confirma configuracion MoE para esta variante de 0.8B) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (formato de publicacion en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo emplea un layout hibrido de 24 capas con el patron `6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`. Las capas Gated DeltaNet usan 16 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. Las capas de Gated Attention usan 8 cabezas para Q y 2 para KV, con dimension de cabeza 256 y RoPE de dimension 64. La red feed-forward tiene dimension intermedia 3584 y la salida LM (248.320) esta atada a la embedding de tokens. La dimension oculta es 1024 y el vocabulario esta paddeado a 248.320 entradas.

El entrenamiento parte de un preentrenamiento multimodal con fusion temprana sobre tokens de imagen y texto, seguido de una fase de post-entrenamiento. La model card indica que se entreno con prediccion multi-token (MTP) en varios pasos y que la familia escala el aprendizaje por refuerzo en entornos multi-agente. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset. Los tokens de control `<|im_start|>` y `<|im_end|>` se entrenaron para permitir PEFT tipo LoRA con la plantilla de chat oficial sin necesidad de reajustar embeddings, una optimizacion relevante dado el gran vocabulario del modelo.

## Capacidades

- Generacion de texto y razonamiento: modelo causal de lenguaje base, sin ajuste de instrucciones.
- Comprension de imagenes: pipeline `image-text-to-text` con codificador de vision y fusion temprana multimodal.
- Codigo y matematicas: la familia declara paridad con Qwen3 y mejora sobre Qwen3-VL en benchmarks de razonamiento, codigo y agentes.
- Tool calling / function calling: no confirmado explicitamente para esta variante base en la informacion disponible.
- Razonamiento multi-paso y agentes: la familia se presenta como orientada a agentes multimodales nativos; esta variante base no incluye el post-entrenamiento conversacional.
- Multilingue: soporte declarado de 201 idiomas y dialectos.
- Prediccion multi-token (MTP): entrenado con MTP en varios pasos, util para decodificacion especulativa.
- Contexto largo: ventana nativa de 262.144 tokens, extensible a 1.010.000.
- Aprendizaje en contexto y fine-tuning: casos de uso declarados por el autor.

## Casos de uso

- Fine-tuning supervisado para dominio especifico: al ser un modelo base de 0.8B con licencia Apache 2.0, se puede ajustar sobre datos propios (legal, medico, industrial) con LoRA, aprovechando que los tokens de control ya estan entrenados para la plantilla de chat oficial.
- Investigacion en aprendizaje en contexto: su contexto nativo de 262.144 tokens permite experimentar con muchos ejemplos demostrativos en el prompt sin recurrir a fine-tuning.
- Prototipado de asistentes multimodales: el pipeline `image-text-to-text` permite construir demos de descripcion de imagenes, VQA o extraccion de informacion de documentos escaneados antes de escalar a variantes mayores.
- Generacion de codigo asistida en pipelines de CI/CD: tras un ajuste especifico, puede integrarse en herramientas de autocompletado o revision de parches en entornos con restricciones de VRAM.
- Procesamiento de documentos largos: con contexto de 262K tokens, es viable resumir o extraer entidades de contratos, informes o expedientes completos en una sola pasada.
- Despliegue en hardware de consumo: sus 0.8B parametros permiten inferencia en GPUs de gama media o incluso CPU con cuantizacion, util para prototipos locales y entornos embebidos.
- Base para destilacion o experimentos de arquitectura: el esquema hibrido Gated DeltaNet + Gated Attention lo convierte en un banco de pruebas para estudiar atencion lineal frente a atencion completa a pequena escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma, a nivel de familia, paridad con Qwen3 y mejora sobre Qwen3-VL en razonamiento, codigo, agentes y comprension visual, sin cifras concretas para esta variante de 0.8B.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 5 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB de pesos; en 4 bits, aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) para FP16 con contexto moderado; A100 o H100 para contextos muy largos o lotes grandes.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual e incluso en iGPU con cuantizacion.
- Opciones de despliegue: Transformers, vLLM y SGLang (segun la model card); llama.cpp u Ollama requeririan conversion a GGUF, no confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Base (este) | 873M | 262K (ext. 1.01M) | Texto + imagen | Apache 2.0 | Hugging Face |
| Qwen3-VL (variantes pequenas) | no disponible | no disponible | Texto + imagen | no disponible | Hugging Face |
| Qwen3 (variantes pequenas) | no disponible | no disponible | Texto | no disponible | Hugging Face |

La informacion proporcionada no incluye especificaciones detalladas de modelos alternativos comparables de la misma categoria, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no debe usarse para interaccion directa ni como asistente conversacional sin post-entrenamiento previo.
- Riesgo de alucinacion: al ser preentrenado unicamente, puede generar contenido plausible pero incorrecto, especialmente en tareas factuales.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; los sesgos del corpus de entrenamiento son desconocidos.
- Idiomas: aunque se declaran 201 idiomas, no se detalla la calidad por idioma ni el rendimiento en castellano.
- Contexto: la extension a 1.010.000 tokens es declarada por el autor, pero no se aportan metricas de degradacion en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio es una copia de terceros (`umitaslan`) de los pesos oficiales; conviene verificar la procedencia y la integridad de los ficheros antes de usarlos en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-17), lo que sugiere que es un espejo reciente y no una publicacion oficial.
- No se confirma configuracion MoE para esta variante pese a la mencion generica en las notas de la familia, lo que impide asumir el perfil de parametros activos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/umitaslan/Qwen3.5-0.8B-Base
- Repositorio oficial de referencia (licencia): https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
