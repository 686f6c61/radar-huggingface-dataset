# thinkingmachines/TML-d24-varloop-research

## Resumen

TML-d24-varloop-research es un modelo multimodal de investigación desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera texto. Se trata de la variante de bucle variable de Inkling 2 Mini: mientras que este último ejecuta sus capas con bucle un número fijo de veces, en TML-d24-varloop-research el número de pasadas por las capas con bucle puede elegirse en tiempo de inferencia sobre un único conjunto de pesos. El objetivo es facilitar la investigación sobre modelos con bucles, permitiendo comparaciones más limpias de cómo el cómputo adicional afecta al comportamiento interno y a las capacidades del modelo.

Arquitectónicamente es un transformer decoder-only de 24 capas con capas feed-forward de mezcla de expertos dispersa (MoE). Las 12 capas centrales se ejecutan un número variable de veces compartiendo pesos, y el modelo fue entrenado con entre 1 y 5 pasadas. Cuenta con 26.400 millones de parámetros totales y 3.400 millones activos por token en una pasada, con una ventana de contexto de hasta 1 millón de tokens y soporte nativo de imágenes mediante un vision transformer.

Se distribuye únicamente como pesos abiertos bajo licencia Apache 2.0, sin acceso vía API (incluido Tinker), y su checkpoint nativo emplea precisión mixta NVFP4 y MXFP8, por lo que no requiere cuantización adicional. Es relevante ahora porque ofrece a la comunidad un banco de pruebas controlado para estudiar el efecto del cómputo recurrente en modelos MoE multimodales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 24 capas con MoE dispersa; 12 capas centrales con bucle de pesos compartidos y número de pasadas variable en inferencia; atención híbrida local/global; vision transformer para imágenes |
| Parámetros totales | 26.388.646.440 (26,4 B) |
| Parámetros activos | 3,4 B por token a 1 pasada; 5,4 B a 3 pasadas; 7,4 B a 5 pasadas (cada pasada adicional añade ~1,0 B de parámetros activos efectivos) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | Checkpoint nativo en precisión mixta: capas de expertos en NVFP4, últimas cuatro en MXFP8 y resto en BF16; versiones GGUF cuantizadas vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general |
| Licencia | Apache 2.0 (con Model Acceptable Use Policy adicional) |
| Formato de pesos | Safetensors (librería transformers); GGUF para versiones cuantizadas |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas decoder-only y capas feed-forward de mezcla de expertos dispersa: en cada capa, cada token se enruta a 8 de 128 expertos. Las 12 capas centrales comparten pesos y se ejecutan un número variable de veces, elegido en tiempo de inferencia, lo que permite modular el cómputo efectivo sin cambiar los pesos. La atención combina capas locales y globales. La modalidad de imagen se procesa mediante un vision transformer, y las entradas de imagen y texto se proyectan a un espacio oculto compartido que el decoder procesa conjuntamente.

Comparte preentrenamiento y la primera etapa de midtraining con Inkling 2 Mini. En el resto del midtraining se entrenó con entre 1 y 5 pasadas por las capas con bucle, muestreadas en proporción 1:2:6:2:1, y después se postentrenó con 3 pasadas. Dado que las 3 pasadas dominaron el entrenamiento una vez introducido el bucle, el rendimiento en otros recuentos de pasadas puede infravalorar lo que lograrían modelos entrenados específicamente con esos recuentos. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas, de terceros, generados internamente o sintéticos, con procesos de limpieza, deduplicación y filtrado. El modelo emplea precisión mixta NVFP4 y MXFP8 como formato nativo de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de texto e imagen.
- Procesamiento conjunto de imagen y texto en un espacio oculto compartido mediante vision transformer.
- Ventana de contexto de hasta 1 millón de tokens para entradas largas.
- Cómputo recurrente ajustable en inferencia (de 1 a 5 pasadas) sobre un único conjunto de pesos.
- Soporte multilingüe general, con inglés como idioma principal.
- Entrada de imágenes de cualquier tipo basado en píxeles, con rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Postentrenamiento soportado mediante Miles y SkyRL.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo de razonamiento dedicado.

## Casos de uso

- Investigación sobre cómputo recurrente: comparar el comportamiento interno y las capacidades del modelo con 1, 3 o 5 pasadas sobre los mismos pesos para aislar el efecto del cómputo adicional en las capas con bucle.
- Análisis de eficiencia computacional: medir la relación entre parámetros activos efectivos (de 3,4 B a 7,4 B) y calidad en distintas tareas para estudiar curvas de escalado por profundidad efectiva.
- Experimentos de postentrenamiento: ajustar el modelo con Miles o SkyRL para estudiar cómo el fine-tuning interactúa con distintos recuentos de pasadas.
- Procesamiento de documentos largos con imagen y texto: aprovechar la ventana de 1 millón de tokens para tareas de comprensión de documentos extensos que combinen páginas escaneadas y texto.
- Evaluación de cuantización en precisión baja: al distribuirse nativamente en NVFP4 y MXFP8, sirve para estudiar el impacto de estas precisiones en modelos MoE multimodales frente a alternativas en BF16.
- Despliegue local en hardware de consumo: con un checkpoint de ~20 GB y requisitos de 32 GB de memoria, permite ejecutar inferencia en una RTX 5090, RTX PRO 6000 Blackwell, DGX Spark o Mac con silicio Apple de 32 GB o más.
- Docencia y reproducción de resultados: al ser pesos abiertos sin API, facilita la replicación de experimentos sobre modelos con bucles en entornos académicos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones con puntuaciones de TML-d24-varloop-research ejecutado a 1, 2, 3, 4 y 5 pasadas frente a Inkling 2 Mini (siempre a 3 pasadas), con puntuaciones en porcentaje salvo PMPP-Hard (área bajo la curva de tareas resueltas en 0-10 horas). No obstante, los valores numéricos concretos de esa tabla no están disponibles en la información proporcionada, por lo que no se reproducen aquí.

| Benchmark | TML-d24-varloop-research (1-5 pasadas) | Inkling 2 Mini (3 pasadas) |
|---|---|---|
| Puntuaciones por benchmark | no disponible (tabla truncada en la información recibida) | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- Checkpoint único de aproximadamente 20 GB en su precisión nativa (NVFP4, MXFP8 y BF16), sin necesidad de cuantización adicional.
- Requiere una máquina con al menos 32 GB de VRAM o memoria unificada.
- Configuraciones de ejemplo indicadas por el autor: 1x NVIDIA DGX Spark; 1x GPU NVIDIA con 32 GB o más de VRAM (por ejemplo, GeForce RTX 5090 o RTX PRO 6000 Blackwell); Mac con silicio Apple y 32 GB o más de memoria unificada (por ejemplo, Mac mini).
- Cabe en GPU de consumo de gama alta con 32 GB o más de VRAM (RTX 5090) y en equipos Apple con memoria unificada suficiente.
- Frameworks de inferencia soportados: Hugging Face (transformers), SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF), Llama App, Ollama y Exo Labs en silicio Apple.
- Frameworks de postentrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos por token | Contexto | Pasadas con bucle | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TML-d24-varloop-research | 26,4 B | 3,4 B (1 pasada) a 7,4 B (5 pasadas) | 1 M tokens | Variable (1-5) en inferencia | Apache 2.0 | Pesos abiertos en Hugging Face |
| Inkling 2 Mini | no disponible en la información recibida | no disponible | no disponible | Fija (3) | no disponible en la información recibida | Pesos abiertos (referenciado en la model card) |

No se dispone de datos suficientes en la información proporcionada para comparar con otras alternativas de la misma categoría (modelos MoE multimodales de tamaño similar). El autor advierte además que las etapas finales de entrenamiento de ambos modelos difieren, por lo que no debe compararse directamente TML-d24-varloop-research con Inkling 2 Mini.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo publica para apoyar la investigación sobre modelos con bucles, no como producto listo para producción.
- El rendimiento en recuentos de pasadas distintos de 3 puede infravalorar lo que lograrían modelos entrenados específicamente con esos recuentos, ya que las 3 pasadas dominaron el entrenamiento tras introducir el bucle.
- No debe compararse directamente con Inkling 2 Mini: las etapas posteriores de entrenamiento de ambos modelos difieren.
- Idiomas: inglés y soporte multilingüe general, sin lista detallada de idiomas ni evaluaciones por idioma disponibles.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible; los datos de entrenamiento provienen de internet y fuentes de terceros, con los sesgos que ello implica.
- Licencia Apache 2.0, sujeta además a la Model Acceptable Use Policy de Thinking Machines Lab, que puede restringir determinados usos.
- No disponible vía API (incluido Tinker): solo se distribuye como pesos abiertos.
- Requiere al menos 32 GB de memoria de GPU o unificada, lo que excluye GPU de consumo con menos VRAM.
- No se documenta soporte explícito de tool calling ni de modo de razonamiento dedicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
- Blog de Inkling 2 Mini en Hugging Face: https://hf.co/blog/inkling2mini
- Receta de SGLang para Inkling 2 Mini: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM para Inkling 2 Mini: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth para Inkling 2 Mini: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
