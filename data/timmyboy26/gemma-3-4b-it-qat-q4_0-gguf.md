# timmyboy26/gemma-3-4b-it-qat-q4_0-gguf

## Resumen

Este repositorio es una copia sin modificaciones de ficheros seleccionados del modelo oficial `google/gemma-3-4b-it-qat-q4_0-gguf`, publicado por el usuario `timmyboy26` para su uso en una aplicación llamada LLM Hub. No se trata de un modelo nuevo ni de un ajuste fino: es un espejo de los pesos GGUF cuantizados de Gemma 3 4B en su variante instruct y con cuantización consciente del entrenamiento (QAT) a 4 bits.

El modelo subyacente, Gemma 3 4B IT, forma parte de la familia Gemma 3 de Google, una serie de modelos transformer multimodales (texto e imagen) diseñados para despliegue eficiente. La variante QAT q4_0 reduce el peso a aproximadamente 4 GB, lo que permite ejecución en hardware de consumo. El contexto declarado por Google para Gemma 3 4B es de 128 000 tokens, aunque este dato no aparece en la información proporcionada en este repositorio.

La relevancia de esta ficha es limitada: el valor técnico reside en el modelo original de Google, no en este espejo. Cualquier evaluación de rendimiento, licencia o capacidades debe remitirse a la documentación oficial de Gemma 3, ya que la model card de este repositorio no aporta especificaciones propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Gemma 3 4B IT, transformer multimodal según la familia Gemma 3) |
| Parámetros totales | 3 880 099 328 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | q4_0 (QAT), formato GGUF |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información específica sobre la arquitectura en la documentación de este repositorio. El modelo base pertenece a la familia Gemma 3 de Google, descrita públicamente como transformer multimodal con soporte de texto e imagen, pero los detalles concretos de capas, atención, composición del dataset de entrenamiento, número de tokens vistos o etapas de alineación (RLHF/DPO) no están incluidos en la información proporcionada.

La única innovación técnica documentada en este repositorio es el uso de QAT (quantization-aware training) en la variante q4_0, que produce pesos GGUF de 4 bits con una degradación de calidad menor que la cuantización post-entrenamiento convencional. El repositorio es una copia literal de ficheros de la revisión `15f73f5eee9c28f53afefef5723e29680c2fc78a` del repositorio oficial de Google; no hay reentrenamiento ni modificación de pesos.

## Capacidades

- Generación de texto conversacional en modo instruct (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Capacidades multimodales: no confirmadas en la información de este repositorio, aunque el modelo base Gemma 3 4B IT las incluye según la documentación de Google.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en aplicaciones de escritorio: el fichero GGUF de 4 GB puede cargarse con llama.cpp u Ollama en equipos con 8 GB de RAM, lo que permite asistentes conversacionales sin conexión.
- Prototipado rápido de chatbots: la variante instruct y el formato GGUF facilitan integrar un modelo conversacional en demos con presupuesto de hardware reducido.
- Evaluación de la cuantización QAT: útil para comparar la calidad de q4_0 frente a cuantizaciones post-entrenamiento sobre el mismo modelo base.
- Pruebas de integración con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en servidores de inferencia que acepten la API de OpenAI o similar, aunque no se detalla en la documentación.
- Educación y experimentación: permite a investigadores noveles estudiar el comportamiento de un modelo de 4B cuantizado sin infraestructura dedicada.
- Base para pipelines de generación de texto en entornos con GPU de consumo: adecuado cuando el requisito es baja latencia en hardware limitado, aunque no hay datos de throughput publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB para inferencia en q4_0, considerando pesos (4 GB) más overhead de contexto y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs de datacenter como A100 o H100, aunque sin datos de rendimiento verificados.
- GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM, y en CPU con 8 GB de RAM mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI no se confirman para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| timmyboy26/gemma-3-4b-it-qat-q4_0-gguf | 3,88 B | no disponible | gemma | GGUF | Copia de Google; sin benchmarks propios |
| google/gemma-3-4b-it-qat-q4_0-gguf | 3,88 B | no disponible | gemma | GGUF | Repositorio oficial de origen |
| Alternativas de 4B (p. ej. Qwen, Llama) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Este repositorio no aporta documentación técnica propia; toda la información relevante debe consultarse en el repositorio oficial de Google.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B, mayor que en modelos de mayor tamaño; sin datos específicos publicados aquí.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica ventana ni cobertura lingüística.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; es obligatorio aceptar ambas al descargar o usar los ficheros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Al ser una copia no modificada, cualquier actualización o corrección del modelo original no se reflejará automáticamente en este espejo.
- No se confirma el soporte multimodal ni tool calling en esta copia concreta; verificar contra la documentación oficial antes de usarla en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/timmyboy26/gemma-3-4b-it-qat-q4_0-gguf
- Modelo base oficial: https://huggingface.co/google/gemma-3-4b-it-qat-q4_0-gguf
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
