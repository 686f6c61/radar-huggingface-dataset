# YuCollection/TML-d24-varloop-research

## Resumen

TML-d24-varloop-research es un modelo multimodal de investigacion desarrollado por Thinking Machines Lab, Inc. y publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Se trata de la variante de "bucle variable" (variable loop) de Inkling 2 Mini: mientras que este ultimo ejecuta sus capas con bucle un numero fijo de veces, en TML-d24-varloop-research el numero de pasadas por las capas bucleadas puede elegirse en tiempo de inferencia sobre un unico conjunto de pesos. El objetivo es permitir comparaciones limpias de como el computo adicional en las capas bucleadas afecta al computo interno del modelo y a sus capacidades globales.

Arquitectonicamente es un transformer decoder-only de 24 capas con capas de feed-forward de tipo Mixture-of-Experts disperso. Las 12 capas centrales se ejecutan un numero variable de veces con pesos compartidos (entrenado con entre 1 y 5 pasadas), y en cada capa cada token se enruta a 8 de 128 expertos. La atencion combina capas locales y globales, y el modelo es nativamente multimodal: las imagenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido que procesa el decoder.

El modelo cuenta con 26.4B parametros totales y 3.4B activos en una pasada, con una ventana de contexto de hasta 1M tokens. Se distribuye como pesos abiertos (no via API, incluido Tinker) en un unico checkpoint de unos 20 GB en su precision nativa mixta NVFP4/MXFP8, lo que lo hace desplegable en hardware de consumo de gama alta con 32 GB o mas de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas bucleadas de pesos compartidos (24 capas, 12 centrales bucleadas) |
| Parametros totales | 26.4B |
| Parametros activos | 3.4B a 1 pasada; 5.4B a 3 pasadas; 7.4B a 5 pasadas (cada pasada extra anade ~1.0B de parametros activos efectivos por token) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | Precision nativa mixta NVFP4 (capas de expertos) y MXFP8 (ultimas cuatro capas), resto BF16; versiones GGUF cuantizadas via Unsloth y llama.cpp |
| Idiomas soportados | Ingles y soporte multilingue general |
| Licencia | Apache 2.0 (con Model Acceptable Use Policy adicional) |
| Formato de pesos | safetensors (checkpoint unico de ~20 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas decoder-only. Las 12 capas centrales comparten pesos y se ejecutan un numero variable de veces elegido en inferencia; el modelo fue entrenado con entre 1 y 5 pasadas. Cada capa enruta cada token a 8 de 128 expertos (MoE disperso). La atencion es un hibrido de capas locales y globales. La multimodalidad es nativa: un vision transformer codifica las imagenes y tanto estas como el texto se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta. Los datos de entrenamiento incluyen texto, imagenes y video, procedentes de fuentes publicas, terceros, generacion interna y datos sinteticos o aumentados, con procesos de limpieza, deduplicacion y filtrado.

En cuanto al entrenamiento, TML-d24-varloop-research comparte el preentrenamiento y la primera etapa de midtraining con Inkling 2 Mini. Durante el resto del midtraining se entreno con 1 a 5 pasadas por las capas bucleadas, muestreadas en una proporcion 1:2:6:2:1, y despues se hizo post-entrenamiento con 3 pasadas. Dado que las 3 pasadas dominaron el entrenamiento una vez introducido el bucle, el rendimiento en otros recuentos de pasadas puede infravalorar lo que lograrian modelos entrenados especificamente para esos recuentos. El autor advierte que las etapas posteriores de entrenamiento difieren entre este modelo e Inkling 2 Mini, por lo que no deben compararse directamente.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de texto e imagen.
- Procesamiento conjunto de texto e imagenes en un espacio oculto compartido (image-text-to-text).
- Razonamiento multi-paso con computo adaptativo: el numero de pasadas por las capas bucleadas puede ajustarse en inferencia (1 a 5), permitiendo intercambiar computo por calidad.
- Soporte multilingue general, con ingles como idioma principal.
- Ventana de contexto de hasta 1M tokens para documentos e imagenes de gran extension.
- Entrada de imagen con dimensiones optimas entre 40px y 4096px por lado.
- No se documenta soporte de tool calling, function calling ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Investigacion sobre modelos bucleados: el modelo permite, sobre un unico conjunto de pesos, comparar como el computo adicional en las capas bucleadas afecta al computo interno y a las capacidades, variando el numero de pasadas en inferencia.
- Analisis de documentos largos con imagenes: la ventana de 1M tokens permite procesar informes, contratos o expedientes extensos junto con sus figuras y tablas en una sola pasada.
- Experimentos de eficiencia computacional: ajustar el numero de pasadas (1 a 5) para medir el compromiso entre latencia, parametros activos efectivos y calidad en tareas concretas.
- Prototipado multimodal en hardware de consumo: con 32 GB de memoria (RTX 5090, DGX Spark, Mac con memoria unificada) se puede desplegar el checkpoint nativo sin cuantizacion adicional.
- Evaluacion comparativa de arquitecturas MoE con atencion hibrida local/global en entornos de investigacion.
- Post-entrenamiento y ajuste fino: el modelo puede post-entrenarse con Miles y SkyRL para estudiar el efecto del bucle variable tras el alineamiento.
- Extraccion de informacion de imagenes y texto combinados en pipelines de investigacion, gracias al codificador de vision integrado.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones con puntuaciones para TML-d24-varloop-research a 1, 2, 3, 4 y 5 pasadas, junto a Inkling 2 Mini (siempre a 3 pasadas). Sin embargo, la informacion proporcionada se corta en el encabezado de la tabla y no incluye los valores numericos de los benchmarks (salvo la nota de que PMPP-Hard es el area bajo la curva de tareas resueltas en 0-10 horas). Por tanto, no es posible reproducir los resultados concretos.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria minima: 32 GB de GPU o memoria unificada para el checkpoint nativo (~20 GB).
- Configuraciones de ejemplo validadas por el autor: 1x NVIDIA DGX Spark, 1x GPU NVIDIA con 32 GB o mas de VRAM (GeForce RTX 5090, RTX PRO 6000 Blackwell), Apple silicon Mac con 32 GB o mas de memoria unificada (por ejemplo, Mac mini).
- Cabe en GPU de consumo de gama alta (RTX 5090) y en Apple silicon con memoria unificada suficiente.
- Precision nativa mixta NVFP4/MXFP8; no requiere cuantizacion adicional. Existen versiones GGUF cuantizadas para llama.cpp y Unsloth.
- Frameworks de inferencia soportados: Hugging Face, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, Ollama y Exo Labs (estos dos ultimos en Apple silicon).
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Pasadas bucleadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TML-d24-varloop-research | 26.4B | 3.4B (1 pasada) a 7.4B (5 pasadas) | 1M | 1-5, elegible en inferencia | Apache 2.0 | Pesos abiertos en HF |
| Inkling 2 Mini | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Fijas a 3 | No disponible en la informacion | Pesos abiertos en HF (thinkingmachines) |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El rendimiento en recuentos de pasadas distintos de 3 puede infravalorar lo que lograrian modelos entrenados especificamente para esos recuentos, ya que las 3 pasadas dominaron el entrenamiento tras introducir el bucle.
- El autor advierte explicitamente contra comparar directamente este modelo con Inkling 2 Mini, porque las etapas posteriores de entrenamiento difieren.
- Modelo de investigacion: no esta pensado como producto final ni se ofrece via API (incluido Tinker); se distribuye solo como pesos abiertos.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible; los datos de entrenamiento provienen de internet publico y fuentes sinteticas, con riesgo de sesgos inherentes.
- Idiomas: soporte principal de ingles con soporte multilingue general; el rendimiento en castellano no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero se anade una Model Acceptable Use Policy que puede imponer restricciones adicionales de uso.
- No se documenta soporte de tool calling ni de agentes; conviene verificarlo antes de usarlo en produccion.
- El checkpoint requiere al menos 32 GB de memoria; por debajo de ese umbral seria necesario recurrir a versiones GGUF cuantizadas.

## Enlaces

- Hugging Face (ID consultado): https://huggingface.co/YuCollection/TML-d24-varloop-research
- Hugging Face (pesos oficiales): https://huggingface.co/thinkingmachines/tml-d24-varloop-research
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
- Blog de Inkling 2 Mini en Hugging Face: https://hf.co/blog/inkling2mini
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentacion Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentacion Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentacion SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
