# TheFusionCube/Sage-A1.5-Concise-FP8

## Resumen

Sage-A1.5-Concise-FP8 es una cuantización en FP8 del modelo Sage-A1.5-Concise, desarrollado por TheFusionCube a partir del modelo base de InternScience. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con capacidad multimodal image-text-to-text, derivado de la familia Qwen3.5-MoE, con 35.951.822.704 parámetros totales según los pesos safetensors. La variante "Concise" incorpora un ajuste mediante aprendizaje por refuerzo orientado a acortar la cadena de razonamiento, logrando entre un 11% y un 26% menos de tokens en cinco benchmarks sin pérdida significativa de rendimiento según la model card.

La relevancia de esta versión FP8 radica en la reducción del espacio de almacenamiento y de los requisitos de memoria para inferencia manteniendo el esquema de cuantización de la release oficial de InternScience. El autor afirma que la receta reproduce bit a bit los pesos FP8 oficiales en los tensores no modificados por el entrenamiento, y que el diseño de ficheros (nombres, dtypes, formas y offsets) coincide con dicha release. Esto facilita el despliegue en infraestructuras que ya sirven el modelo oficial FP8.

El modelo está pensado para generación de texto y razonamiento eficiente, con soporte de decodificación especulativa mediante una cabeza MTP (multi-token prediction) incluida en un fichero separado. La licencia es Apache 2.0. No se han publicado resultados de benchmarks medidos sobre esta versión FP8, y el autor indica que todavía no se ha cargado en vLLM ni en SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) multimodal image-text-to-text, familia qwen3_5_moe |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el ejemplo de despliegue con `--max-model-len 262144` de la model card) |
| Tipos de cuantizacion | FP8 E4M3 en pesos (escalas BF16 per-channel), activaciones FP8 per-token dinámicas; capas no cuantizadas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), con fichero MTP separado |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal con atención completa y atención lineal combinadas. La cuantización FP8 aplica pesos E4M3 con escalas BF16 por canal y activaciones FP8 dinámicas por token, y afecta a los expertos enrutados, al experto compartido y a las proyecciones de atención completa. Permanecen en BF16 la atención lineal, los routers, los embeddings, la LM head y el codificador visual. Esta receta es idéntica a la de InternScience/Sage-A1.5-FP8 y, según el autor, reproduce bit a bit los pesos oficiales en los tensores no alterados por el entrenamiento.

El modelo base Sage-A1.5-Concise se obtiene tras un proceso de aprendizaje por refuerzo sobre Sage-A1.5 cuyo objetivo es acortar la cadena de razonamiento, con una reducción de entre el 11% y el 26% de tokens en cinco benchmarks sin pérdida significativa. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas adicionales como DPO. La cabeza MTP (multi-token prediction), destinada a decodificación especulativa, no fue entrenada en esta variante y su fichero es byte-idéntico al de la release oficial FP8.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento acortada respecto al modelo base Sage-A1.5.
- Procesamiento multimodal image-text-to-text, con codificador visual mantenido en BF16.
- Soporte de tool calling y function calling, con parser `qwen3_coder` indicado en la model card.
- Soporte de agentes y razonamiento multi-paso, con ajustes de despliegue referenciados en la model card del modelo base.
- Decodificación especulativa mediante cabeza MTP incluida en `model_mtp.safetensors`.
- Contexto largo de hasta 262.144 tokens según el ejemplo de servicio con vLLM.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento eficiente en producción: el ajuste "Concise" reduce entre un 11% y un 26% los tokens de cadena de pensamiento en cinco benchmarks, lo que disminuye coste por consulta y latencia en tareas de razonamiento sin pérdida significativa de calidad según la model card.
- Procesamiento de documentos largos con imagen y texto: el contexto de 262.144 tokens y el codificador visual permiten ingerir informes, capturas o diagramas junto a texto extenso en una sola pasada.
- Agentes con tool calling: el soporte de `--enable-auto-tool-choice` y el parser `qwen3_coder` permiten integrar el modelo en orquestadores de agentes que invocan APIs y herramientas externas.
- Servicio de chat conversacional multi-turno: la ventana de contexto larga y la naturaleza conversacional del pipeline text-generation lo hacen adecuado para asistentes con historial extenso.
- Despliegue en infraestructura existente de FP8: al coincidir el layout y el config con la release oficial de InternScience, encaja en clústeres que ya sirven ese modelo FP8 sin cambiar el pipeline de carga.
- Decodificación especulativa de alto rendimiento: la cabeza MTP separada permite acelerar la generación en motores que soportan MTP, reduciendo latencia en cargas de alta concurrencia.
- Generación de código asistida: las capacidades de razonamiento y el parser de tool calling orientado a código permiten su uso en asistentes de programación y pipelines de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las cifras del modelo principal se midieron sobre la versión BF16, que esta versión FP8 no ha sido evaluada y que todavía no se ha cargado en vLLM ni en SGLang. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 39,4 GB en total (20,0 GB + 17,7 GB de pesos principales y 1,7 GB de la cabeza MTP). En FP8, los pesos requieren aproximadamente 36 GB, a los que hay que sumar caché KV y activaciones; el contexto de 262.144 tokens incrementa sustancialmente el consumo de memoria.
- GPU recomendadas: no disponibles de forma explícita en la información. Por tamaño, se requiere al menos una GPU con 40-48 GB o superior; no se confirma compatibilidad con modelos concretos.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en FP8; se desconoce si existe una build de menor precisión compatible (la model card menciona una build GGUF de 4 bits del mismo modelo).
- Opciones de despliegue: vLLM (comando de servicio incluido en la model card); SGLang referenciado a través de la model card del modelo base; carga mediante transformers. No se confirma compatibilidad con llama.cpp u Ollama para esta versión FP8.
- Latencia y throughput: no disponibles. El autor no ha medido esta versión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| TheFusionCube/Sage-A1.5-Concise-FP8 | 35,95 B | 262.144 | FP8 (compressed-tensors) | Apache 2.0 | No evaluado en benchmarks |
| InternScience/Sage-A1.5-FP8 | no disponible | no disponible | FP8 (compressed-tensors) | no disponible | Release oficial de referencia |
| TheFusionCube/Sage-A1.5-Concise (BF16) | no disponible | no disponible | BF16 | no disponible | Base de esta cuantización |
| TheFusionCube/Sage-A1.5-Concise-GGUF | no disponible | no disponible | 4 bits (GGUF) | no disponible | Probado contra el modelo base según la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La versión FP8 no ha sido evaluada en benchmarks; el rendimiento puede diferir del BF16 y no está cuantificado.
- No se ha verificado la carga en vLLM ni en SGLang; la compatibilidad se infiere por coincidencia de config y layout con la release oficial FP8.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe más allá de lo que herede del modelo base.
- El contexto de 262.144 tokens exige memoria adicional significativa para la caché KV, lo que puede limitar el despliegue en GPUs de 40-48 GB con secuencias muy largas.
- La cabeza MTP no fue entrenada en esta variante; su utilidad para decodificación especulativa depende del soporte del motor de inferencia.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de la release oficial FP8 de la que se copian tokenizer y config.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise-FP8
- Modelo base de esta cuantización: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise
- Release oficial FP8 de referencia: https://huggingface.co/InternScience/Sage-A1.5-FP8
- Model card del modelo base Sage-A1.5: https://huggingface.co/InternScience/Sage-A1.5
- Build GGUF de 4 bits: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise-GGUF
