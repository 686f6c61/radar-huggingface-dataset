# Xylolabs/KORMo-Web-11B-MLX-4bit

## Resumen

KORMo-Web-11B-MLX-4bit es una cuantización en 4 bits del modelo de lenguaje de KORMo-VL/KORMo-Web-11B, publicada por Xylolabs. El modelo base es un decoder de estilo Llama con 10.756.624.384 parámetros (10,76B), orientado a generación de texto y conversación en coreano e inglés. Esta versión concreta está pensada para ejecutarse con `mlx-lm` sobre hardware Apple Silicon (MLX), e incluye únicamente la torre de lenguaje: la torre de visión y el proyector de imágenes del modelo multimodal original no están incluidos.

El problema que resuelve es el de hacer utilizable en equipos con memoria unificada un modelo de casi 11B parámetros, reduciendo el peso de los archivos de pesos de los 11,43 GB de la variante MLX 8-bit a 6,56 GB en 4-bit. La cuantización es de tipo affine con tamaño de grupo 64: capas lineales en 4 bits, embeddings y LM head en 8 bits, y capas de normalización en f16. El repositorio declara licencia Apache-2.0.

Es relevante porque ofrece una ruta de despliegue local en Mac para un modelo bilingüe coreano-inglés con licencia permisiva, algo poco habitual en esa franja de tamaño. No obstante, la ficha del autor advierte de que no está afiliada ni respaldada por KAIST MLP Lab, y que las funciones de visión y agente GUI del modelo original no están disponibles en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama (layout Llama en `config.json`) |
| Parametros totales | 10.756.624.384 (10,76B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit affine (group size 64); lineales en 4-bit, embeddings y LM head en 8-bit, norms en f16. Existe tambien una variante MLX 8-bit del mismo autor |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), dos shards: `model-00001-of-00002.safetensors` y `model-00002-of-00002.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un decoder transformer de estilo Llama con 10,76B parametros. La conversión realizada por Xylolabs aplica cuantización affine de 4 bits con tamaño de grupo 64 a las capas lineales, mantiene embeddings y LM head en 8 bits y deja las capas de normalización en f16. Además, renombra los dos tensores de normalización por capa a los nombres que espera Llama para que `mlx-lm` cargue el modelo como `llama`. El tokenizador, la plantilla de chat y los ajustes de generación provienen del modelo base sin cambios.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada. La model card del repositorio reproduce la descripción original de KORMo-Web-11B, que describe un modelo multimodal con torre de visión y capacidades de agente GUI, pero esta conversión elimina explícitamente esos componentes y solo conserva el modelo de lenguaje.

## Capacidades

- Generación de texto conversacional en coreano e inglés, usando la plantilla de chat del modelo base.
- Respuesta a instrucciones y prompts de texto libre mediante `mlx_lm.generate` y `mlx_lm.chat`.
- Capacidades multilingües limitadas a coreano e inglés según los metadatos del modelo.
- No incluye visión: la torre de visión y el proyector de imágenes del modelo original han sido eliminados en esta conversión.
- No incluye las capacidades de agente GUI del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse con `mlx-lm` sobre Apple Silicon y mantener conversaciones multi-turno en coreano e inglés, aprovechando que los 6,56 GB de pesos caben en equipos con memoria unificada de 16 GB o más.
- Generación de texto en coreano para productos dirigidos al mercado surcoreano: al estar entrenado y etiquetado para coreano, es adecuado para redacción de borradores, resúmenes y respuestas en ese idioma sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de chat: la instalación se reduce a `pip install mlx-lm==0.32.2` y un comando de CLI, lo que permite validar flujos conversacionales en local antes de pasar a producción.
- Traducción y adaptación de contenido entre coreano e inglés: el modelo declara ambos idiomas y puede emplearse para tareas de reformulación y adaptación de textos entre los dos idiomas.
- Experimentación académica con cuantización: el repositorio incluye métricas de divergencia KL y acuerdo top-1 frente a BF16, lo que facilita estudiar el impacto de la cuantización 4-bit en un modelo de 11B.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sobre hardware Apple, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Evaluación comparativa de variantes 4-bit frente a 8-bit: el autor publica tablas de precisión por tamaño que permiten decidir qué variante usar según la restricción de memoria disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente a BF16:

| Variante | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Texto largo KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 6,56 GB | 0,090664 | 86,946% | 0,134076 | 87,157% | 0,070785 | 87,651% |
| MLX 8-bit | 11,43 GB | 0,000651 | 98,740% | 0,001227 | 98,804% | 0,000587 | 98,900% |

La divergencia KL es menor en la variante 8-bit, con un acuerdo top-1 cercano al 99% frente a BF16, mientras que la variante 4-bit se queda en torno al 87% de acuerdo top-1 con una KL media notablemente mayor.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos en 4-bit ocupan 6,56 GB; conviene reservar memoria adicional para el contexto y el runtime de MLX. La variante 8-bit ocupa 11,43 GB.
- Hardware objetivo: Apple Silicon con MLX. El repositorio no especifica modelos de chip concretos.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable directamente, ya que el formato es MLX y la librería es `mlx-lm`; para GPUs NVIDIA habría que recurrir a otra conversión (por ejemplo GGUF) del modelo base.
- Cabe en equipos consumer Apple con memoria unificada suficiente para 6,56 GB de pesos más overhead; no se especifica el mínimo exacto en la información disponible.
- Opciones de despliegue: `mlx-lm` versión 0.32.2 mediante los comandos `mlx_lm.generate` y `mlx_lm.chat`. Otras opciones como vLLM, llama.cpp, Ollama o TGI no están soportadas por este repositorio en su formato actual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| KORMo-Web-11B-MLX-4bit | 10,76B | no disponible | MLX safetensors 4-bit | Apache-2.0 | Solo texto; sin visión ni agente GUI |
| KORMo-Web-11B (base) | 10,76B | no disponible | safetensors | Apache-2.0 | Multimodal con torre de visión y agente GUI |
| KORMo-Web-11B-MLX-8bit | 10,76B | no disponible | MLX safetensors 8-bit | Apache-2.0 | Mayor fidelidad (top-1 ~98,8%), 11,43 GB |

No se dispone de información sobre modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La conversión elimina la torre de visión y el proyector de imágenes: no admite entrada de imagen ni funciones de agente GUI del modelo original.
- La fidelidad frente a BF16 es limitada: acuerdo top-1 en torno al 87% y KL media de 0,09 a 0,13 según el conjunto, lo que puede degradar tareas sensibles a la precisión.
- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está documentado.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con contextos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte de que el repositorio del modelo base no incluye archivo de licencia y que no está afiliado ni respaldado por KAIST MLP Lab.
- El modelo está atado a `mlx-lm` 0.32.2 y a hardware Apple Silicon; no es portable directamente a otros runtimes sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/KORMo-Web-11B-MLX-4bit
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-11B
- Licencia Apache-2.0 del repositorio: https://huggingface.co/Xylolabs/KORMo-Web-11B-MLX-4bit/blob/main/LICENSE
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
