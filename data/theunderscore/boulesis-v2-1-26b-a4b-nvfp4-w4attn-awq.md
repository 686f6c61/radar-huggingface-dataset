# TheUnderscore/Boulesis-v2.1-26B-A4B-NVFP4-W4ATTN-AWQ

## Resumen

Boulesis-v2.1-26B-A4B-NVFP4-W4ATTN-AWQ es una cuantización de precisión mixta del modelo SubMaroon/Boulesis-v2.1-26B-A4B, un fine-tune de tipo Mixture of Experts (MoE) construido sobre la familia Gemma 4 y publicado por el usuario TheUnderscore. El modelo resultante ocupa 17,9 GB en el repositorio y conserva 26.544.133.710 parámetros en pesos cuantizados, con un pipeline declarado de image-text-to-text, lo que indica capacidades multimodales de entrada imagen y salida texto.

El interés técnico de esta ficha reside en el esquema de cuantización: las capas de atención (q/k/v/o) se comprimen a W4A16 con grupos de 128, mientras que las capas MLP y los expertos MoE se almacenan en NVFP4 (float4) con grupos de 16, dejando embeddings, normalizaciones y router en BF16. Esta precisión mixta busca reducir el coste de memoria sin degradar los componentes sensibles del modelo.

La relevancia práctica es limitada pero específica: el autor advierte que el checkpoint requiere una bifurcación concreta de 1Cat-vLLM con kernels de atención SM70 y un port específico de Gemma 4, y que no se ha probado en vLLM estándar. Por tanto, es un artefacto orientado a entornos controlados con esa pila de inferencia, no un modelo listo para despliegue genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4), multimodal image-text-to-text |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, dato no confirmado en la informacion) |
| Longitud de contexto | no disponible (el ejemplo de uso fija max_model_len=8192) |
| Tipos de cuantizacion | Precisión mixta: W4A16 int4 (atención, grupo 128), NVFP4 float4 (MLP/MoE, grupo 16), BF16 (embeddings, norms, router) |
| Idiomas soportados | en |
| Licencia | apache-2.0 declarada en la model card con license_name: gemma; la ficha de Hugging Face indica licencia gemma |
| Formato de pesos | safetensors con compressed-tensors (quant_method: compressed-tensors, dos config_groups) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune MoE de Gemma 4, según los tags gemma4 y moe. La arquitectura combina capas de atención con capas de mezcla de expertos, y el pipeline image-text-to-text implica un codificador visual acoplado a un decodificador de lenguaje. El checkpoint publicado no entrena desde cero: es una cuantización post-entrenamiento del modelo SubMaroon/Boulesis-v2.1-26B-A4B.

La cuantización se realizó con llmcompressor en modo oneshot, usando config_groups para despachar formatos por capa: int4 W4A16 en atención, NVFP4 en MLP y expertos, y BF16 en embeddings, normalizaciones y router. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; la innovación aquí es exclusivamente el esquema de compresión y los kernels SM70 D=512 de la bifurcación de 1Cat-vLLM.

## Capacidades

- Generación de texto conversacional en inglés, según el tag conversational y el idioma declarado.
- Procesamiento de entrada imagen y salida texto (pipeline image-text-to-text), lo que habilita tareas de descripción, respuesta sobre imágenes y diálogo multimodal.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, aunque es esperable en un fine-tune de Gemma 4; se marca como no verificado.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia conversacional multimodal en inglés: el modelo puede mantener diálogos multi-turno recibiendo imágenes y texto, adecuado para soporte técnico donde el usuario adjunta capturas de pantalla.
- Descripción y análisis de imágenes en pipelines de documentación: generación automática de pies de foto y descripciones accesibles para catálogos de producto.
- Extracción de información de documentos escaneados: combinación de entrada visual y salida textual para resumir formularios o facturas, siempre que se valide la precisión.
- Prototipado de asistentes de accesibilidad: lectura de imágenes y respuesta en lenguaje natural para usuarios con discapacidad visual, en entornos de investigación.
- Evaluación de cuantización en investigación: caso de uso meta, comparar la calidad de NVFP4 + W4A16 frente al modelo base BF16 en tareas de visión-lenguaje.
- Despliegue en hardware con SM70: el checkpoint está pensado para GPUs con esa arquitectura mediante la bifurcación de 1Cat-vLLM, útil para equipos con ese hardware concreto.
- Fine-tuning posterior o destilación: al estar en safetensors y compressed-tensors, puede servir como punto de partida para experimentos de compresión adicional, con las cautelas de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 17,9 GB, por lo que se necesita al menos ~18-20 GB solo para pesos, más overhead de KV cache y activaciones; con max_model_len=8192 y batch pequeño, estimación orientativa de 24-32 GB.
- GPU recomendadas: el autor menciona kernels SM70, lo que apunta a GPUs de arquitectura Volta (V100); el ejemplo usa tensor_parallel_size=2, sugiriendo dos GPUs.
- ¿Cabe en GPU consumer? No confirmado; 17,9 GB de pesos podrían caber en una RTX 4090 de 24 GB con contexto corto, pero los kernels SM70 no aplican a Ada Lovelace y el soporte no está probado.
- Opciones de despliegue: exclusivamente 1Cat-vLLM con la bifurcación feat/gemma4-sm70-native-v3; no probado en vLLM estándar, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boulesis-v2.1-26B-A4B-NVFP4-W4ATTN-AWQ | 26,5B totales | no disponible | NVFP4 + W4A16 mixta | gemma / apache-2.0 | HF, requiere 1Cat-vLLM bifurcado |
| SubMaroon/Boulesis-v2.1-26B-A4B (base) | 26,5B totales | no disponible | BF16 | no disponible | HF |
| Gemma 4 (familia) | no disponible | no disponible | múltiples | gemma | HF |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Soporte de inferencia restringido: requiere 1Cat-vLLM con una bifurcación concreta y kernels SM70; no funciona en vLLM estándar según el autor.
- Solo inglés: el campo language declara únicamente en, lo que limita su uso en castellano u otros idiomas.
- Licencia ambigua: la model card declara apache-2.0 pero también license_name: gemma, y la ficha de Hugging Face indica licencia gemma; conviene verificar los términos de Gemma antes de uso comercial.
- Riesgo de degradación por cuantización: NVFP4 en expertos MoE y W4A16 en atención pueden introducir pérdida de calidad frente al base BF16, no cuantificada en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que lo midan.
- Sesgos: no documentados en la información proporcionada.
- Contexto: no se especifica la longitud nativa; el ejemplo fija 8192, lo que sugiere un límite práctico en ese entorno.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/TheUnderscore/Boulesis-v2.1-26B-A4B-NVFP4-W4ATTN-AWQ
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-v2.1-26B-A4B
- 1Cat-vLLM: https://github.com/1CatAI/1Cat-vLLM
- Bifurcación con kernels SM70: https://github.com/Th-Underscore/1Cat-vLLM/tree/feat/gemma4-sm70-native-v3
