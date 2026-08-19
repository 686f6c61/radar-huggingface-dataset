# thinkingmachines/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por thinkingmachines, una compañía especializada en IA open source. Acepta entradas de texto, imagen y audio, y genera respuestas en texto, lo que lo convierte en una opción versátil para aplicaciones de conversación, agentes, asistentes de código y sistemas de recuperación aumentada. Su arquitectura combina un transformer decoder-only de 42 capas con una capa feed-forward de mezcla de expertos (MoE) dispersa, donde cada token se enruta a 6 de 256 expertos más 2 expertos compartidos, alcanzando 276 mil millones de parámetros totales con solo 12 mil millones activos por token.

El modelo se publica con pesos abiertos bajo licencia Apache 2.0, lo que permite investigación, fine-tuning e integración en productos comerciales sin restricciones significativas. Su diseño nativamente multimodal —con un codificador jerárquico de parches para imágenes y codificación discreta de tokens para audio— lo sitúa en la frontera de los modelos open weights, compitiendo con alternativas cerradas de gran escala. La ventana de contexto no se especifica en la documentación oficial, pero su arquitectura híbrida de atención local y global sugiere un manejo eficiente de secuencias largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con MoE disperso (256 expertos, 6 activos por token + 2 compartidos) y atención híbrida local/global |
| Parametros totales | 276B |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés principal, con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y NVFP4) |

## Arquitectura y entrenamiento

Inkling-Small es un transformer autoregresivo decoder-only con una capa feed-forward de mezcla de expertos dispersa. Cada token se enruta dinámicamente a 6 de los 256 expertos disponibles, más 2 expertos compartidos que se activan en todos los tokens, lo que reduce el coste computacional por token a aproximadamente 12B parámetros activos frente a los 276B totales. La atención combina capas locales (ventana restringida) y globales (atención completa), un diseño híbrido que equilibra eficiencia y capacidad de modelado de dependencias de largo alcance.

El modelo es nativamente multimodal: las imágenes se procesan mediante un codificador jerárquico de parches que descompone la imagen en múltiples resoluciones, mientras que el audio se tokeniza en unidades discretas. Todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. Los datos de entrenamiento incluyen contenido público de internet, repositorios accesibles, datos adquiridos de terceros y datos sintéticos, con un pipeline de curado que aplica deduplicación, filtrado de baja calidad y medidas de seguridad. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés y otros idiomas, con capacidad multilingüe general.
- Comprensión de imágenes: acepta imágenes pixel-based con dimensiones entre 40px y 4096px por lado, ideal para documentos, capturas, diagramas y fotografías.
- Procesamiento de audio: entrada WAV a 16 kHz, con duración recomendada inferior a 2 minutos, para transcripción, resumen o diálogo por voz.
- Salida exclusivamente textual, lo que simplifica la integración en pipelines de texto.
- Soporte para tool calling y uso en sistemas agénticos, según la descripción oficial que menciona "agentic and tool-use systems".
- Adecuado para retrieval-augmented generation (RAG) y asistentes de código, con soporte de múltiples lenguajes de programación.
- Despliegue local mediante SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.

## Casos de uso

- Asistentes de atención al cliente multimodal: el modelo puede procesar capturas de pantalla o mensajes de voz del usuario junto con el historial de conversación, generando respuestas contextualizadas. Su capacidad de entrada de audio e imagen permite manejar consultas que incluyen evidencia visual o verbal.
- Generación de código en producción: con soporte de tool calling y múltiples lenguajes de programación, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, reduciendo la intervención manual en tareas repetitivas.
- Sistemas de recuperación aumentada (RAG) sobre documentos técnicos: al aceptar imágenes de diagramas o tablas y texto, puede combinar información visual y textual para responder preguntas complejas sobre documentación técnica.
- Transcripción y resumen de audio: dado un archivo WAV de hasta 2 minutos, el modelo puede transcribir y resumir reuniones, notas de voz o podcasts, generando actas o extractos en texto.
- Agentes autónomos multi-paso: su arquitectura MoE con 12B parámetros activos permite ejecutar razonamientos encadenados con coste computacional moderado, adecuado para agentes que necesitan planificar, llamar herramientas y reflexionar sobre resultados intermedios.
- Chatbots multilingües para soporte global: aunque el inglés es el idioma principal, sus capacidades multilingües generales permiten desplegar asistentes en varios idiomas con un solo modelo, reduciendo la complejidad de mantener múltiples sistemas.

## Benchmarks y rendimiento

La documentación oficial incluye una tabla de evaluaciones comparativas con modelos open weights (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash) y tres modelos de pesos cerrados, pero los valores numéricos de los benchmarks no se han proporcionado en la información disponible. No se pueden reportar resultados concretos de MMLU, HumanEval, GSM8K u otras métricas sin inventar datos.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM en la documentación disponible.
- Estimación orientativa: con pesos en BF16, el modelo completo requiere aproximadamente 552 GB de VRAM (276B × 2 bytes), lo que excede cualquier GPU comercial individual. Con cuantización NVFP4 (4 bits), los pesos ocupan unos 138 GB, aún por encima de GPUs de consumo (RTX 4090 con 24 GB) y requiriendo múltiples GPUs o memoria unificada.
- Dado que solo 12B parámetros están activos por token, la memoria para activaciones y KV cache es relativamente moderada, pero los pesos totales dominan el requisito de VRAM.
- GPUs recomendadas: clústeres con múltiples A100 (80 GB) o H100 (80 GB) para BF16; con NVFP4, 2-3 GPUs de 80 GB podrían ser suficientes.
- No es viable en GPUs de consumo (RTX 4090, 3090) sin técnicas de offloading a CPU o memoria compartida, lo que degradaría significativamente la latencia.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, todos con recetas oficiales publicadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La tabla de benchmarks del README compara Inkling-Small con los siguientes modelos open weights, aunque no se incluyen los valores numéricos:

| Modelo | Parametros totales | Parametros activos | Licencia | Notas |
|---|---|---|---|---|
| Inkling-Small | 276B | 12B | Apache 2.0 | Multimodal (texto, imagen, audio) |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | Modelo de la serie Qwen, open weights |
| MiMo V2.5 | no disponible | no disponible | no disponible | Modelo open weights |
| Minimax M2.7 | no disponible | no disponible | no disponible | Modelo open weights |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | Modelo open weights |

No se dispone de especificaciones detalladas de los modelos comparados más allá de los nombres y tamaños parciales. La comparativa completa con valores de benchmarks está disponible en el README original de Hugging Face.

## Limitaciones y advertencias

- El idioma principal es inglés; las capacidades multilingües son generales pero no se especifica el nivel de competencia en idiomas distintos del inglés, lo que puede afectar a despliegues en español u otros idiomas.
- La duración de audio recomendada es inferior a 2 minutos; entradas más largas pueden degradar el rendimiento o no procesarse correctamente.
- Las dimensiones de imagen deben estar entre 40px y 4096px; imágenes fuera de este rango pueden no ser procesadas de forma óptima.
- No se especifica la longitud de contexto máxima, lo que dificulta planificar aplicaciones que requieran ventanas muy largas.
- El modelo es grande (276B totales), lo que implica costes de infraestructura significativos incluso con cuantización; no es adecuado para despliegues en edge o dispositivos con recursos limitados.
- No se han publicado resultados de benchmarks numéricos en la información disponible, por lo que no se puede verificar empíricamente su rendimiento frente a alternativas.
- Aunque la licencia Apache 2.0 permite uso comercial, se debe revisar la política de uso aceptable de thinkingmachines (enlazada en el README) para asegurar cumplimiento en aplicaciones específicas.
- No se documentan sesgos específicos, pero al entrenarse con datos públicos de internet, es probable que herede sesgos presentes en esos datos; se recomienda evaluación adicional para casos de uso sensibles.

## Enlaces

- [Modelo en Hugging Face (BF16)](https://huggingface.co/thinkingmachines/Inkling-Small)
- [Modelo en Hugging Face (NVFP4)](https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4)
- [Playground de Tinker](https://tinker.thinkingmachines.ai/playground)
- [Tinker Cookbook (GitHub)](https://github.com/thinking-machines-lab/tinker-cookbook)
- [Política de uso aceptable](https://thinkingmachines.ai/model-acceptable-use-policy)
- [Receta SGLang](https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small)
- [Receta vLLM](https://recipes.vllm.ai/thinkingmachines/Inkling-Small)
- [Receta TokenSpeed](https://lightseek.org/tokenspeed/recipes/models#Inkling)
- [Receta Unsloth](https://unsloth.ai/docs/models/inkling)
- [Blog de Hugging Face sobre Inkling](https://hf.co/blog/thinkingmachines-inkling)
