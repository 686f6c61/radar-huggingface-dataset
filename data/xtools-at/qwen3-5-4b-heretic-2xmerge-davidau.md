# xtools-at/Qwen3.5-4B-Heretic-2xMerge-DavidAU

## Resumen

Qwen3.5-4B-Heretic-2xMerge-DavidAU es un checkpoint experimental publicado por el usuario xtools-at en Hugging Face, fruto de una fusión lineal ponderada de dos fine-tunes del modelo base Qwen/Qwen3.5-4B, ambos creados por DavidAU: Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING (peso 1.0) y Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking (peso 0.7). El objetivo declarado es combinar dos trayectorias de ajuste fino orientadas al razonamiento y la generación de texto, ambas sometidas a un proceso de abliteración (etiquetado como HERETIC) destinado a reducir el comportamiento de rechazo del modelo original.

El modelo hereda la arquitectura multimodal de Qwen3.5-4B, que combina atención con compuertas (gated attention) y Gated Delta Networks en un esquema híbrido, con una longitud de contexto nativa documentada de 262.144 tokens en el modelo base. Cuenta con 4.539.265.536 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos compactos ejecutables en una única GPU de consumo.

Su relevancia es acotada y de carácter experimental: no es un modelo oficial de Qwen ni de DavidAU, sino una mezcla de terceros cuyo comportamiento puede diferir del de ambos progenitores. Resulta de interés para quienes investigan técnicas de model merging, abliteración y fine-tuning orientado a razonamiento y escritura creativa en modelos pequeños, no como sustituto de producción de un modelo con garantías de calidad documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.5 (gated attention + Gated Delta Networks), multimodal |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos en el modelo base (no garantizado tras la fusión) |
| Tipos de cuantizacion | GGUF, GGUF con imatrix (repositorios derivados); pesos originales en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (verificar términos upstream antes de redistribuir) |
| Formato de pesos | Safetensors (transformers); GGUF y GGUF imatrix en repositorios derivados |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una media ponderada lineal (linear weighted average) de dos fine-tunes de Qwen3.5-4B. El primero, Claude-4.6-OS Auto-Variable HERETIC, es un ajuste fino con Unsloth sobre el denominado Claude-4.6-OS dataset, compuesto por cuatro conjuntos de datos relacionados con Claude, descrito por su autor como un ajuste relativamente suave para mejorar razonamiento y generación preservando capacidades del base. El segundo, Deckard HERETIC Uncensored Thinking, es otro ajuste con Unsloth sobre cinco datasets internos de Deckard. Ambos incorporan un template de chat Jinja actualizado para mitigar salidas repetitivas, bucles de pensamiento extendido y problemas de manejo de herramientas.

La arquitectura subyacente es la de Qwen3.5-4B: un modelo multimodal de la familia Qwen3.5 que combina atención con compuertas y Gated Delta Networks, diseñado para comprensión de lenguaje e imagen, razonamiento, código y aplicaciones orientadas a agentes. Tras el ajuste fino, ambos modelos fuente pasaron por un procesamiento HERETIC/abliteración cuyo propósito es reducir la tasa de rechazos. Los pesos de la fusión (1.0 y 0.7) son coeficientes de mezcla, no proporciones de datos de entrenamiento ni contribuciones medidas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto general y composición de respuestas.
- Razonamiento multi-paso, deducción lógica y resolución analítica de problemas, según los casos de uso declarados por el autor.
- Escritura creativa: generación de relatos, continuación de escenas, desarrollo de trama y prosa descriptiva.
- Roleplay y diálogo con personajes, interacción conversacional multi-turno.
- Seguimiento de instrucciones para generación de texto de propósito general.
- Experimentación multimodal imagen-texto, condicionada a que el checkpoint fusionado conserve los componentes del modelo y la compatibilidad del procesador.
- Comportamiento de rechazo reducido por el procesamiento HERETIC/abliteración de los modelos fuente.
- No se documenta en la información disponible soporte verificado de tool calling, function calling ni de agentes autónomos en el checkpoint fusionado; el template Jinja de los modelos fuente aborda el manejo de herramientas, pero su funcionamiento tras la fusión no está garantizado.
- El modelo fuente Deckard reporta entrada de imagen probada con éxito; la funcionalidad de vídeo se describe como no probada.

## Casos de uso

- Experimentación con model merging: el checkpoint sirve para estudiar cómo una media ponderada de dos fine-tunes del mismo base afecta al comportamiento de razonamiento y generación, comparando las salidas con las de cada modelo fuente.
- Escritura creativa asistida: generación de relatos, descripciones de escena y continuación de tramas narrativas, aprovechando el énfasis de los modelos fuente en prosa y storytelling.
- Roleplay y prototipado de personajes conversacionales: diálogos con personalidad definida en entornos de prueba donde el comportamiento menos restrictivo resulta deseable para explorar respuestas variadas.
- Investigación sobre abliteración: análisis de la reducción de rechazos y de sus efectos colaterales en calidad y coherencia, comparando con Qwen3.5-4B original y con los modelos fuente.
- Generación de texto de propósito general en local: respuestas y composición de texto en una única GPU de consumo, gracias al tamaño de 4B parámetros y a las cuantizaciones GGUF disponibles.
- Pruebas de razonamiento multi-paso: preguntas analíticas y deducción lógica en entornos de evaluación interna, sin asumir garantías de calidad de producción.
- Experimentación multimodal controlada: tareas imagen-texto en las que se verifique previamente que el checkpoint fusionado conserva los componentes necesarios y la compatibilidad del procesador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 los 4.539 millones de parámetros ocupan aproximadamente 9,1 GB de pesos, por lo que se recomiendan 12-16 GB de VRAM para dejar margen a la caché KV y al contexto. En cuantización de 8 bits, alrededor de 5 GB; en 4 bits, alrededor de 3 GB.
- GPU recomendadas: A100 o H100 para despliegues con contexto largo (hasta 262.144 tokens en el modelo base) y mayor throughput; RTX 4090 o RTX 3090 para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y en tarjetas de 12-16 GB con cuantización; en 4 bits puede ejecutarse en GPUs de 8 GB, con contexto reducido.
- Opciones de despliegue: transformers con safetensors; llama.cpp, Ollama y otros runners GGUF a partir de los repositorios derivados en GGUF y GGUF imatrix; vLLM y TGI no están confirmados en la información disponible para esta arquitectura híbrida.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Heretic-2xMerge-DavidAU | 4.539 millones | 262.144 (base, no garantizado) | Apache-2.0 | Safetensors, GGUF | Fusión experimental de terceros, abliterada |
| Qwen/Qwen3.5-4B | No disponible en la información | 262.144 nativos | No disponible en la información | Safetensors | Modelo base oficial, multimodal híbrido |
| DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | 4B (familia) | No disponible | No disponible en la información | Safetensors | Fine-tune con Unsloth, abliterado, peso 1.0 en la fusión |
| DavidAU/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking | 4B (familia) | No disponible | No disponible en la información | Safetensors | Fine-tune con Unsloth, abliterado, peso 0.7 en la fusión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte de que el comportamiento y el rendimiento del checkpoint fusionado pueden diferir de los de ambos modelos fuente.
- La abliteración reduce los rechazos, lo que implica un mayor riesgo de generar contenido inapropiado, ofensivo o dañino; no debe desplegarse sin filtros y moderación adicionales.
- Riesgo de alucinación inherente a un modelo de 4B parámetros, agravado por la fusión y por la falta de evaluaciones publicadas.
- No hay benchmarks publicados que respalden las capacidades declaradas; los casos de uso son inferencias del autor a partir de los modelos fuente, no garantías de rendimiento.
- La longitud de contexto de 262.144 tokens corresponde al modelo base y no está garantizada tras la fusión; conviene validarla empíricamente.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- La licencia es Apache-2.0, pero el autor recomienda verificar los términos upstream antes de redistribuir; conviene revisar las condiciones de Qwen/Qwen3.5-4B y de los modelos de DavidAU para uso comercial.
- El soporte de tool calling y de flujos de agentes no está confirmado en el checkpoint fusionado.
- El soporte multimodal depende de que la fusión conserve los componentes y el procesador compatibles; no está verificado.
- Trazabilidad limitada: la implementación exacta de la fusión, la normalización de coeficientes y cualquier procesamiento adicional no se detallan completamente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-4B-Heretic-2xMerge-DavidAU
- Repositorio GGUF: https://huggingface.co/xtools-at/Qwen3.5-4B-Heretic-2xMerge-DavidAU-GGUF
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.5-4b-heretic-2xmerge-davidau/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo fuente Claude-4.6-OS: https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo fuente Deckard: https://huggingface.co/DavidAU/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking
