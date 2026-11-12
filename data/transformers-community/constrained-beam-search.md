# transformers-community/constrained-beam-search

## Resumen

Constrained Beam Search es un módulo de generación personalizada (`custom_generate`) para la librería Transformers que implementa búsqueda por haces con restricciones léxicas y frasales. No es un modelo de lenguaje entrenado desde cero, sino un mecanismo de decodificación empaquetado junto con los pesos base de Qwen3-0.6B (751.632.384 parámetros reales según el archivo safetensors) para poder distribuirse a través del Hub de Hugging Face. Lo desarrolla la organización `transformers-community`, vinculada al ecosistema oficial de Transformers.

El problema que resuelve es concreto: la búsqueda por haces estándar genera token a token y puntúa candidatos de forma local, por lo que no puede garantizar que una palabra o frase obligatoria aparezca en la salida sin degradar la fluidez. Constrained Beam Search inyecta tokens que progresan hacia las restricciones entre los candidatos de alta probabilidad, agrupa los haces en bancos según el grado de cumplimiento de cada restricción y selecciona haces de forma round-robin entre bancos para equilibrar fluidez y satisfacción de restricciones.

Es relevante ahora porque ofrece una vía práctica para imponer terminología controlada (nombres de producto, valores de slot, formas gramaticales obligatorias en traducción) en pipelines de generación existentes, sin reentrenar el modelo y funcionando sobre arquitecturas encoder-decoder y decoder-only.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mecanismo de decodificación `custom_generate` (constrained beam search) sobre pesos base de Qwen3-0.6B; compatible con transformers encoder-decoder y decoder-only |
| Parametros totales | 751.632.384 (pesos safetensors del repo) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card muestra ejemplos en inglés y alemán, pero no declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repo: 1.5 GB) |

## Arquitectura y entrenamiento

El componente principal es un algoritmo de búsqueda, no una red neuronal nueva. La model card describe tres mecanismos: inyección de tokens que avanzan hacia las restricciones entre los candidatos regulares, agrupación de haces en bancos según cuánto de cada restricción han satisfecho, y selección round-robin entre bancos para repartir el ancho de haz entre fluidez y cumplimiento. Soporta restricciones simples (`force_words_ids`), restricciones frasales (`PhrasalConstraint`) y disyuntivas (`DisjunctiveConstraint`), además de los parámetros estándar de beam search (`num_beams`, `length_penalty`, `early_stopping`, `num_return_sequences`, `max_length`).

Los pesos incluidos corresponden a Qwen3-0.6B, que actúa como modelo base de referencia. No se documentan en la información proporcionada datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO, porque el artefacto no es un modelo entrenado sino un wrapper de generación. Tampoco se detalla la innovación algorítmica más allá de la descripción de los tres mecanismos anteriores.

## Capacidades

- Generación de texto con restricciones léxicas obligatorias: garantiza que una palabra o frase concreta aparezca en la salida.
- Restricciones disyuntivas: permite exigir que aparezca al menos una forma de un conjunto (por ejemplo, `scream`, `screams`, `screaming`, `screamed`).
- Restricciones frasales y múltiples restricciones simultáneas con requisitos de orden.
- Compatibilidad con modelos encoder-decoder (T5, BART) y decoder-only (GPT-2, Qwen3) de Transformers.
- Integración vía `custom_generate` con `trust_remote_code=True`, sin necesidad de modificar el código del modelo base.
- Control de diversidad mediante `num_return_sequences` y `num_beams`.
- No soporta sampling: la decodificación restringida es incompatible con `do_sample=True`.
- No se documentan tool calling, capacidades de agente, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Traducción con terminología controlada: forzar formas concretas (por ejemplo, el pronombre formal `Sie` en alemán) para respetar registros y glosarios, como muestra el ejemplo de la model card con T5.
- Generación de nombres de producto o marcas: garantizar que la denominación exacta aparezca en textos de marketing generados, evitando variantes no deseadas.
- Relleno de valores de slot en asistentes conversacionales: imponer que la respuesta incluya el valor de slot requerido (fecha, ciudad, identificador) manteniendo fluidez.
- Generación de contenido con palabras clave SEO: forzar la aparición de términos obligatorios en descripciones y artículos sin recurrir a post-procesado.
- Datos sintéticos para evaluación: generar frases que contengan forzosamente ciertas construcciones para testear clasificadores o sistemas de extracción.
- Traducción automática con restricciones gramaticales: exigir concordancias o formas verbales específicas mediante restricciones disyuntivas.
- Control de estilo en generación creativa: imponer que un relato incluya ciertos elementos léxicos definidos por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1.5 GB en safetensors, lo que sugiere que los pesos en fp16 caben en torno a 1,5 GB; en fp32 serían aproximadamente 3 GB. No se detallan cuantizaciones alternativas.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder cargar los pesos en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño de los pesos.
- Opciones de despliegue: Transformers con `custom_generate` y `trust_remote_code=True`; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face, aunque no se documenta configuración específica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| transformers-community/constrained-beam-search | Mecanismo de decodificación + pesos Qwen3-0.6B | 751.632.384 | no disponible | no disponible | Hugging Face (50 descargas, 2 likes) |
| Qwen/Qwen3-0.6B | Modelo base decoder-only | ~0,6B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Beam search estándar de Transformers | Algoritmo de decodificación | N/A | N/A | Apache 2.0 (Transformers) | Incluido en la librería |
| Outlines / guidance | Librerías de decodificación restringida por gramáticas | N/A | N/A | Apache 2.0 / MIT | PyPI, GitHub |

La comparación directa con Outlines o guidance es pertinente porque ambas permiten imponer restricciones en la generación, aunque basadas en autómatas y gramáticas formales en lugar de restricciones léxicas y frasales integradas en beam search.

## Limitaciones y advertencias

- No es un modelo entrenado: los pesos incluidos son de Qwen3-0.6B y el valor real está en el algoritmo de decodificación; evaluar sus capacidades lingüísticas equivale a evaluar Qwen3-0.6B.
- Incompatible con sampling: requiere `do_sample=False`, lo que limita la diversidad y puede producir salidas más repetitivas.
- Las restricciones deben tokenizarse sin tokens especiales (`add_special_tokens=False`), lo que exige cuidado en la integración.
- El uso de `trust_remote_code=True` implica ejecutar código del repositorio; conviene revisar el código antes de desplegarlo en producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia de Qwen3-0.6B y del propio repositorio antes de usarlo en productos.
- Idiomas soportados no declarados: el comportamiento multilingüe depende del modelo base y no está garantizado.
- Riesgo de alucinación: inherente al modelo base Qwen3-0.6B, que por su tamaño puede generar contenido incorrecto, especialmente en tareas de razonamiento complejo.
- Sesgos: no documentados en la información disponible; heredados del modelo base.
- El repositorio es pequeño (50 descargas, 2 likes) y reciente, por lo que la comunidad y el soporte son limitados.

## Enlaces

- Hugging Face: https://huggingface.co/transformers-community/constrained-beam-search
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
