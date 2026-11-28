# tokyotech-llm/SwaFlow-1B

## Resumen

SwaFlow-1B es un modelo de lenguaje de 1,59 mil millones de parámetros entrenado desde cero por tokyotech-llm (colaboración entre AIST y el Institute of Science Tokyo, en el marco del programa japonés FRONTia) que implementa un paradigma de *flow matching* riemanniano sobre una hipersfera en lugar de la generación autorregresiva token a token. Forma parte de la suite SwaFlow, un conjunto de modelos entrenados con una misma receta, sobre los mismos datos y en el mismo orden, cuyo objetivo es facilitar el estudio abierto de los modelos de flujo aplicados al lenguaje.

El repositorio no contiene un modelo listo para inferencia en el sentido convencional, sino estados completos de entrenamiento (checkpoints de torchtitan en fp32 con momentos de AdamW, planificador de tasa de aprendizaje, posición del cargador de datos y contador de pasos). Esto permite reanudar el entrenamiento desde cualquier punto o cargar únicamente los pesos. Se entrenó sobre Dolma 3 Mix de AI-2 (6 billones de tokens) y emplea el tokenizador de SmolLM2 con un vocabulario de 49.152 entradas.

La relevancia del proyecto es fundamentalmente de investigación: ofrece una suite abierta y reproducible para estudiar modelos de flujo riemannianos a lo largo del entrenamiento y de la escala, con datos compartidos y modelos autorregresivos gemelos como referencia. El propio autor advierte que no está pensado para aplicaciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con flow matching riemanniano (hipersférico) |
| Parametros totales | 1,59B (ancho 2048, 24 capas, 16 cabezas, FFN 5632) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los estados se publican en fp32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de torchtitan (fp32, 256 shards por estado + fichero .metadata) |

## Arquitectura y entrenamiento

SwaFlow-1B es un transformer de 24 capas y ancho 2048 que, en lugar de predecir el siguiente token de forma autorregresiva, aprende un campo de flujo sobre una variedad riemanniana (la hipersfera). La convención temporal es α = 1 para datos limpios y α = 0 para ruido puro; durante el preentrenamiento se muestrea un α por secuencia desde el intervalo [0, 0,105]. El entrenamiento se realizó con AdamW (β = 0,9 y 0,95, weight decay 0,1), tasa de aprendizaje constante de 3e-4 tras un calentamiento de 2.000 pasos y recorte de gradiente de 2,5, con un lote global de 4.096 secuencias de 2.048 tokens por paso.

Los datos provienen de Dolma 3 Mix de Allen Institute for AI, con sus pesos de mezcla sin modificar, y el modelo se entrenó desde cero sobre 32 nodos con 8 GPU NVIDIA H200 cada uno (256 rangos de paralelismo de datos). El repositorio incluye dos ramas de estados: `uniform/` (preentrenamiento con α uniforme, desde el paso 4.768 hasta el 238.400, es decir, de 40B a 2T tokens) y `clean-prefix-2t/` (mid-training con prefijo limpio, ramificada desde el paso 226.480, de 1,92T a 2T tokens). Cada estado permite reanudar el entrenamiento, aunque no de forma bit a bit exacta, ya que no se conserva el estado del generador de números aleatorios y el reescalado entre distinto número de GPU altera el orden de las sumas en coma flotante.

## Capacidades

- Generación de texto no autorregresiva mediante integración de un campo de flujo riemanniano.
- Modelo base de investigación: no incluye ajuste por instrucciones en esta ficha (el autor menciona variantes con instruction tuning en la suite, pero no se detallan aquí).
- Entrenamiento reproducible y reanudable desde cualquier checkpoint publicado.
- Carga de pesos independiente del estado del optimizador mediante `from_pretrained`.
- Entrenamiento multilingüe limitado al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre modelos de flujo para lenguaje: el modelo permite estudiar la dinámica de entrenamiento de un campo de flujo riemanniano a escala de 1,59B parámetros, comparando estados intermedios con los gemelos autorregresivos de la suite.
- Reproducción de experimentos: los checkpoints completos (pesos, momentos de AdamW, planificador y posición del cargador de datos) permiten reanudar el entrenamiento en un clúster distinto al original, siempre que el número de GPU divida 256, lo que facilita la verificación de resultados por parte de terceros.
- Estudio de la curva de escalado y del efecto del mid-training con prefijo limpio: la rama `clean-prefix-2t/` permite analizar cómo afecta esta fase a la calidad de la generación frente a la rama `uniform/`.
- Análisis de la coherencia de la generación en modelos de flujo: dado que el autor señala que el texto generado suele ser incoherente, el modelo sirve como banco de pruebas para métricas de coherencia y para investigar métodos de muestreo alternativos.
- Docencia y formación: la suite, con varios tamaños bajo una misma receta y datos compartidos, es adecuada para cursos y talleres sobre modelos generativos no autorregresivos y flow matching.
- Comparación con modelos autorregresivos: los gemelos entrenados sobre los mismos datos y en el mismo orden permiten aislar el efecto del paradigma de modelado (flujo frente a autorregresivo) en tareas de elección múltiple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica, de forma cualitativa, que en tareas de elección múltiple todos los gemelos autorregresivos de la suite, incluido el de 150M, obtienen de media puntuaciones superiores al modelo de flujo final de 3B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos se publican en fp32 (1,59B parámetros, aproximadamente 6,4 GB solo en pesos), pero no se documentan requisitos de inferencia ni cuantizaciones.
- GPU recomendadas: el entrenamiento original se realizó con 32 nodos × 8 NVIDIA H200 (256 GPU). Para cargar los pesos en inferencia no se especifican requisitos.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo; los checkpoints en fp32 con estado del optimizador ocupan 19,40 GB por estado, lo que excede la memoria de la mayoría de GPU de consumo para el estado completo (aunque los pesos solos podrían caber).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga se realiza mediante el código de SwaFlow (`torchtitan.models.swaflow.hf.from_pretrained`) sobre PyTorch con CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwaFlow-1B | 1,59B | 2.048 | Flow matching riemanniano no autorregresivo | Apache 2.0 | Pesos y estados de entrenamiento en HF |
| Gemelos autorregresivos de la suite SwaFlow | 150M y otros tamaños (no detallados) | no disponible | Autorregresivo | no disponible | Mencionados en la model card, no detallados |
| Modelos de flujo de lenguaje comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de otros autores en la misma categoría (modelos de flujo para lenguaje). La comparación más directa es interna a la suite SwaFlow, con sus gemelos autorregresivos entrenados sobre los mismos datos y en el mismo orden.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no está pensado para aplicaciones; es un artefacto de investigación.
- El texto generado por los modelos de flujo, incluidos los ajustados por instrucciones, es a menudo incoherente según la model card.
- Ninguno de los modelos de la suite está ajustado para evitar contenido dañino.
- En tareas de elección múltiple, todos los gemelos autorregresivos, incluso el de 150M, superan de media al modelo de flujo final de 3B, lo que sugiere una brecha de calidad respecto al paradigma autorregresivo.
- Contexto limitado a 2.048 tokens, insuficiente para muchas aplicaciones de contexto largo.
- Solo se declara soporte de inglés.
- No se documentan sesgos conocidos ni tasas de alucinación específicas.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero los datos de entrenamiento (Dolma 3 Mix) están bajo ODC-By 1.0, con obligaciones de atribución.
- Los checkpoints completos incluyen estado del optimizador y ocupan 19,40 GB por estado; el repositorio completo es de 579,7 GB.
- La reanudación del entrenamiento no es bit a bit exacta: no se conserva el estado aleatorio y el reescalado entre distinto número de GPU altera el orden de las sumas en coma flotante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-1B
- Colección SwaFlow Suite: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Código: https://github.com/swallow-llm/swaflow-suite
- Documentación de reproducción: https://github.com/swallow-llm/swaflow-suite/blob/main/docs/reproduce.md
- Dataset Dolma 3 Mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Tokenizador SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
