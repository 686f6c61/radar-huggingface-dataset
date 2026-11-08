# Thox-ai/ThoxNova-12B-Agent

## Resumen

ThoxNova-12B-Agent es un ajuste fino mediante LoRA (rank 8) sobre el modelo base google/gemma-4-12b-it, desarrollado por Thox-ai (THOX.ai) y orientado a cargas de trabajo de agentes y tool calling dentro de su stack local-first. El repositorio publica conjuntamente el adaptador en safetensors y dos builds GGUF ya convertidos (Q4_K_M de 7,38 GB y Q5_K_M de 8,55 GB), de modo que el modelo puede ejecutarse sin pasos intermedios de fusión o cuantización.

El modelo cuenta con 11.907.350.576 parámetros totales (aproximadamente 12B) y hereda del modelo base la arquitectura y la ventana de contexto, si bien la model card no documenta explícitamente ni la longitud de contexto ni la composición del dataset de entrenamiento. Su propuesta de valor es doble: por un lado, ofrecer una ruta de despliegue en Ollama o llama.cpp para entornos de borde; por otro, permitir adjuntar el adaptador al modelo base con Transformers y PEFT para quien necesite control total del pipeline.

Es relevante ahora porque ejemplifica el patrón de publicación de adaptadores ligeros sobre modelos abiertos de tamaño medio, con artefactos listos para consumir en hardware de consumo y una licencia Apache-2.0 declarada. El mismo adaptador se distribuye también como ThoxNova-12B-Core con una superposición de persona distinta, lo que indica que la diferencia entre variantes es de comportamiento y no de pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-12b-it); ajuste mediante LoRA de rank 8 |
| Parametros totales | 11.907.350.576 (aproximadamente 12B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | GGUF Q4_K_M (7,38 GB) y Q5_K_M (8,55 GB); adaptador en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (adaptador y anadidos de THOX); el modelo base remite a los terminos de licencia de Gemma 4 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (Q4_K_M, Q5_K_M) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rank 8 aplicado sobre google/gemma-4-12b-it, un transformer decoder-only de aproximadamente 12B parámetros. El adaptador en safetensors ocupa 131.234.472 bytes, coherente con un ajuste de bajo rango sobre las capas de atención y proyección del modelo base. No se especifica en la documentación disponible qué módulos concretos se adaptaron ni si se congelaron totalmente los pesos originales, aunque la relación declarada es `base_model_relation: adapter`.

El entrenamiento se describe como SFT (supervised fine-tuning) orientado a tool calling y cargas de agente, con etiquetas que incluyen `sft`, `agent`, `tool-calling` y `local-first`. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; las capacidades de inferencia dependen del runtime (llama.cpp u Ollama) y del soporte de la familia Gemma 4 en dichos motores. La plantilla de chat publicada es la estándar de Gemma (`<start_of_turn>user ... <end_of_turn> <start_of_turn>model`).

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con la familia Gemma.
- Tool calling y function calling, que es el eje declarado del ajuste fino.
- Cargas de trabajo de agente: el adaptador se publica como variante "Agent" del stack THOX, pensada para flujos multi-paso.
- Ejecución local y en el borde: los builds GGUF permiten inferencia en hardware propio sin dependencia de API.
- Dos rutas de carga: adaptador PEFT sobre el modelo base o GGUF directo en Ollama/llama.cpp.
- Capacidades multimodales, de visión o de audio: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Soporte multilingüe: limitado al inglés según el campo `language` de la model card.

## Casos de uso

- Automatización de agentes con herramientas locales: el adaptador está entrenado para emitir llamadas a funciones, por lo que puede conectarse a APIs internas, bases de datos o sistemas de ficheros mediante un orquestador que parsee las llamadas y devuelva resultados al modelo en el siguiente turno.
- Asistentes de escritorio o de borde: los builds Q4_K_M (7,38 GB) y Q5_K_M (8,55 GB) caben en GPUs de consumo con 8-12 GB de VRAM, lo que permite desplegar un asistente conversacional con acceso a herramientas sin salir del dispositivo.
- Enrutamiento de tareas en pipelines de automatización: el modelo puede clasificar intenciones y decidir qué herramienta invocar en cada paso, actuando como planificador ligero dentro de un sistema mayor.
- Prototipado rápido con Ollama: al estar publicado como `Thox-ai/thoxnova-12b-agent`, un equipo puede validar un flujo de agente en minutos con `ollama run` antes de invertir en infraestructura.
- Experimentación académica con PEFT: al incluir el adaptador en safetensors, es posible estudiar el efecto del ajuste LoRA sobre Gemma 4 sin reentrenar, comparando el comportamiento del adaptador Agent frente a Core.
- Integración en herramientas de desarrollo con llama.cpp: el binario `llama-cli` y el servidor compatible con la API de OpenAI permiten incrustar el modelo en IDE o scripts de línea de comandos para tareas de generación y llamadas a herramientas.
- Evaluación comparativa de personas: al compartir adaptador base con ThoxNova-12B-Core, sirve para medir cuánto del comportamiento final depende de la superposición de persona y cuánto del ajuste funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB para el build Q4_K_M y 9-10 GB para Q5_K_M, considerando pesos y overhead de contexto; el adaptador en safetensors requiere cargar además el modelo base completo en precisión nativa (aproximadamente 24 GB en FP16/BF16).
- GPU recomendadas: RTX 4090 (24 GB) para el adaptador sin cuantizar; RTX 4070 Ti, RTX 4080 o RTX 3090 para los builds GGUF; A100 o H100 para despliegues concurrentes con vLLM o TGI sobre el modelo fusionado.
- Cabe en GPU de consumo: sí, con los builds Q4_K_M y Q5_K_M en tarjetas de 8-12 GB de VRAM.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxnova-12b-agent`), llama.cpp (`llama-cli` con los GGUF), Transformers + PEFT para el adaptador, y servidores compatibles con la API de OpenAI a través de llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxNova-12B-Agent | ~12B | no disponible | Apache-2.0 (adaptador) | safetensors + GGUF | Ajuste LoRA rank 8 sobre Gemma 4 12B-IT, orientado a tool calling |
| ThoxNova-12B-Core | ~12B | no disponible | Apache-2.0 (adaptador) | safetensors + GGUF | Mismo adaptador con superposición de persona distinta |
| google/gemma-4-12b-it | ~12B | no disponible | Términos de licencia de Gemma 4 | safetensors | Modelo base sin ajuste de tool calling |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Gemma 4, hereda los sesgos del modelo base y del dataset de ajuste, no descrito.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el ajuste para tool calling no garantiza que las llamadas emitidas sean válidas o seguras, por lo que conviene validar los argumentos antes de ejecutarlas.
- Limitación de idioma: el campo `language` declara únicamente inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Longitud de contexto: no documentada; no debe asumirse un valor concreto sin verificar la ficha del modelo base.
- Licencia: el adaptador se declara Apache-2.0, pero el modelo base remite a los términos de licencia de Gemma 4; es necesario conservar LICENSE/NOTICE en cualquier redistribución y verificar que el uso comercial cumple ambas licencias.
- Estado del ecosistema: el repositorio tiene 194 descargas y 1 like en el momento de la consulta, con documentación incompleta (sin dataset, sin benchmarks, sin contexto declarado), lo que limita la confianza para producción sin evaluación propia.
- Runtime: requiere una versión de llama.cpp u Ollama con soporte para la familia Gemma 4; versiones antiguas pueden no cargar los GGUF.
- Advertencia de contenido: la model card incluye notas del fundador sobre ausencia de restricciones artificiales, lo que puede implicar menor alineación de seguridad que modelos con RLHF explícito; conviene aplicar filtros propios en despliegues públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxNova-12B-Agent
- Modelo en Ollama: https://ollama.com/Thox-ai/thoxnova-12b-agent
- Catálogo de modelos de THOX.ai: https://www.thox.ai/docs/model-catalog
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
