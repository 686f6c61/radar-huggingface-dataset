# XZ11ad/Qwen2.5-1.5B-Instruct-Q4_K_M-GGUF

## Resumen

Esta ficha describe una cuantización GGUF en formato Q4_K_M del modelo Qwen2.5-1.5B-Instruct, publicada por el usuario XZ11ad en Hugging Face. Se trata de una conversión automática del checkpoint original de Qwen (Alibaba) mediante el espacio GGUF-my-repo de ggml.ai, que emplea llama.cpp para generar el fichero GGUF. El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), entrenado por el equipo Qwen para instrucciones y conversación.

La relevancia de esta publicación es práctica: ofrece el modelo en un formato listo para inferencia local con llama.cpp, Ollama o cualquier runtime compatible con GGUF, con una cuantización de 4 bits que reduce el peso del repositorio a aproximadamente 1 GB. Esto permite ejecutar el modelo en hardware de consumo modesto, incluyendo CPU, sin necesidad de GPU dedicada.

No obstante, conviene señalar que esta es una republicación de terceros: el autor original del modelo es Qwen, y la model card de esta versión remite explícitamente a la del modelo base para detalles técnicos. Los datos de arquitectura, entrenamiento y benchmarks que se recogen a continuación corresponden al modelo original Qwen2.5-1.5B-Instruct, no a esta conversión concreta, que solo altera el formato y la precisión numérica de los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), según el modelo base |
| Parametros totales | 1.543.714.304 (1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada para esta conversión; el modelo base Qwen2.5 soporta hasta 32.768 tokens según su model card original, aunque este dato no se confirma en la ficha de la cuantización |
| Tipos de cuantizacion | Q4_K_M (4 bits, variante K-medium de llama.cpp) |
| Idiomas soportados | en (inglés, según los tags del repo); el modelo base Qwen2.5 es multilingüe, pero esta ficha solo declara inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `qwen2.5-1.5b-instruct-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal estándar, sin mezcla de expertos. El modelo fue entrenado por Qwen (Alibaba) con un pipeline que incluye preentrenamiento en grandes corpus multilingües y un posterior ajuste por instrucciones (SFT) y optimización por preferencias (RLHF/DPO), según la documentación pública del modelo base. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de alineación para esta versión concreta.

La innovación técnica de esta publicación no reside en el modelo, sino en el proceso de conversión: se ha utilizado el espacio GGUF-my-repo de ggml.ai, que invoca llama.cpp para transformar los pesos safetensors originales a GGUF con cuantización Q4_K_M. Esta cuantización aplica 4 bits a la mayoría de tensores y mantiene mayor precisión en capas sensibles (atención y algunas proyecciones), lo que reduce el tamaño del fichero a aproximadamente 1 GB a costa de una pérdida mínima de calidad respecto al checkpoint en fp16. No hay decodificación especulativa, atención lineal ni otras optimizaciones propias en esta conversión.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (roles system/user/assistant).
- Razonamiento básico y respuesta a instrucciones de complejidad moderada, propio de un modelo de 1,5 B parámetros.
- Generación de código y explicaciones técnicas sencillas, aunque limitado por su tamaño.
- Resolución de problemas matemáticos elementales y de varios pasos cortos.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-Instruct incluye plantillas para function calling, aunque esta cuantización no documenta explícitamente su funcionamiento.
- Capacidades multilingües: el modelo base Qwen2.5 es multilingüe, pero esta ficha solo declara inglés; el rendimiento en otros idiomas no está verificado en esta conversión.
- No dispone de visión, audio ni modo de pensamiento extendido (thinking mode) en esta variante.

## Casos de uso

- Asistente conversacional local en inglés: se puede desplegar con llama-server y una ventana de contexto de 2048 tokens (como sugiere la model card) para responder preguntas generales en un equipo sin GPU, gracias a su tamaño de 1 GB en Q4_K_M.
- Prototipado rápido de chatbots: al ser un GGUF de 1,5 B, permite iterar en local con Ollama o llama.cpp sin coste de API, adecuado para validar flujos conversacionales antes de escalar a modelos mayores.
- Generación de texto en dispositivos de borde: su reducido peso permite ejecutarlo en Raspberry Pi, portátiles antiguos o contenedores con poca memoria, para tareas de resumen o redacción sencilla.
- Educación y experimentación: sirve para estudiar el comportamiento de un modelo instructivo pequeño, comparar cuantizaciones o enseñar conceptos de inferencia local con llama.cpp.
- Automatización de respuestas en pipelines de CI: se puede invocar vía CLI (`llama-cli`) para generar descripciones de commits o comentarios de revisión en inglés, aunque la calidad será limitada frente a modelos mayores.
- Filtrado y clasificación de texto ligero: con prompts adecuados, puede etiquetar o resumir correos y mensajes en inglés en entornos con recursos restringidos, siempre con supervisión humana por riesgo de alucinación.
- Pruebas de integración con tool calling: útil para validar plantillas de function calling en un runtime GGUF antes de migrar a un modelo Qwen2.5 de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión remite a la del modelo base Qwen2.5-1.5B-Instruct para datos de rendimiento, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en Q4_K_M, incluyendo overhead de contexto y KV cache para ventanas pequeñas (2048 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores; también funciona en A100/H100 aunque no aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Ejecución en CPU: viable con llama.cpp; se recomienda al menos 4 GB de RAM libre y, opcionalmente, instrucciones AVX2 para mejor throughput.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; no se documenta soporte para vLLM o TGI en esta variante.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XZ11ad/Qwen2.5-1.5B-Instruct-Q4_K_M-GGUF (esta ficha) | 1,5 B | no disponible en esta conversión | GGUF Q4_K_M | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5 B | 32.768 tokens según model card original | safetensors | Apache 2.0 | Hugging Face, oficial |
| Llama 3.2 1B Instruct (Meta) | 1,2 B | 128.000 tokens según documentación oficial | safetensors, GGUF | Llama 3.2 Community License | Hugging Face, oficial |
| Gemma 2 2B Instruct (Google) | 2,6 B | 8.192 tokens según documentación oficial | safetensors, GGUF | Gemma Terms of Use | Hugging Face, oficial |

La comparación debe tomarse con cautela: los datos de contexto y licencia de los modelos alternativos provienen de su documentación pública y no de la información proporcionada en esta ficha. Esta conversión concreta no aporta mejoras frente al checkpoint oficial de Qwen2.5-1.5B-Instruct salvo el formato GGUF y el tamaño reducido.

## Limitaciones y advertencias

- Es una conversión de terceros: el autor no es Qwen, y la model card remite al modelo base; no hay garantía de que la cuantización preserve exactamente el comportamiento del original.
- La model card de esta versión declara únicamente inglés, aunque el modelo base sea multilingüe; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente a un modelo de 1,5 B parámetros: puede inventar hechos, citas o código incorrecto, especialmente en tareas de razonamiento largo.
- La ventana de contexto efectiva en esta conversión no está documentada; el ejemplo de la model card usa `-c 2048`, lo que sugiere que no se ha validado el contexto largo del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen2.5-1.5B-Instruct para confirmar compatibilidad.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria de esta conversión.
- No apto para tareas que requieran alta precisión factual, razonamiento matemático complejo o generación de código en producción sin revisión humana.
- La cuantización Q4_K_M introduce una pérdida de calidad respecto a fp16 que puede ser perceptible en tareas sensibles.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/XZ11ad/Qwen2.5-1.5B-Instruct-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
