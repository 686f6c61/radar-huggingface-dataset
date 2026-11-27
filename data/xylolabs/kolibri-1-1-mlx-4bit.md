# Xylolabs/Kolibri-1.1-MLX-4bit

## Resumen

Kolibri-1.1-MLX-4bit es una conversión cuantizada del modelo Kolibri-1.1 de Aleph-Alpha al formato MLX, pensada para su ejecución eficiente en hardware Apple Silicon. La conversión la ha realizado Xylolabs aplicando una cuantización mixta: los expertos enrutados del modelo MoE quedan en 4 bits, mientras que el resto de capas se mantiene en 8 bits, lo que reduce el peso del repositorio hasta 43,6 GB frente a los 79,9 GB de la variante MLX 8-bit.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 75.112.646.912 parámetros totales, orientado a generación de texto y conversación en alemán e inglés. Su relevancia radica en que permite ejecutar un modelo de gran tamaño en estaciones de trabajo Mac con memoria unificada de 64 GB o superior, manteniendo una fidelidad muy alta respecto a los pesos originales en BF16, con una tasa de acuerdo top-1 superior al 90 % en los conjuntos de evaluación publicados.

La ficha se centra en la variante MLX 4-bit, distribuida bajo licencia Apache 2.0 y con soporte de contexto de hasta 256K tokens según la tabla de hardware del autor. Al no existir una arquitectura `kolibri1_1` nativa en mlx-lm, el código del modelo se distribuye como `kolibri1_1.py` y requiere cargarse con `--trust-remote-code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); código propio `kolibri1_1.py` para MLX |
| Parametros totales | 75.112.646.912 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (según tabla de hardware del autor) |
| Tipos de cuantizacion | 4-bit en expertos enrutados, 8-bit en el resto de capas (MLX); existe variante MLX 8-bit |
| Idiomas soportados | de, en |
| Licencia | Apache 2.0 (con los términos de la model card original) |
| Formato de pesos | safetensors (MLX), librería mlx-lm 0.32.2 |

## Arquitectura y entrenamiento

El modelo base Kolibri-1.1 es un transformer con arquitectura de mezcla de expertos (MoE), según las etiquetas del repositorio y la model card. La conversión de Xylolabs aplica cuantización selectiva: los expertos enrutados se cuantizan a 4 bits y el resto de capas (atención, embeddings, capas densas) se mantienen en 8 bits, una estrategia que busca preservar la calidad en las partes más sensibles del modelo mientras reduce el tamaño de los pesos que dominan el cómputo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original, ya que la model card proporcionada se limita a describir la conversión a MLX. La innovación técnica destacable de esta ficha es precisamente la cuantización mixta y la validación de fidelidad frente a BF16 mediante divergencia KL y acuerdo top-1.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones en alemán e inglés.
- Soporte de modelos MoE con enrutamiento de expertos, lo que permite activar solo una fracción de los parámetros por token (el número de parámetros activos no está disponible).
- Capacidad de contexto largo: hasta 256K tokens según la tabla de hardware del autor.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-lm.
- No se documentan en la información disponible capacidades de visión, audio, tool calling ni modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional en local para usuarios de Mac: el modelo puede gestionar diálogos multi-turno en alemán e inglés con contexto de hasta 256K tokens, ejecutándose íntegramente en un Mac Studio con 64 GB de memoria unificada.
- Procesamiento de documentos largos en alemán: resúmenes, extracción de información y preguntas sobre contratos o informes extensos aprovechando la ventana de contexto de 256K tokens.
- Desarrollo y prototipado sin GPU dedicada: investigadores que trabajan en entornos Apple pueden validar prompts y flujos conversacionales con un modelo de 75B parámetros sin depender de clústeres con A100/H100.
- Evaluación de calidad de cuantizaciones: el repositorio publica métricas de divergencia KL y acuerdo top-1 frente a BF16, lo que lo convierte en un caso útil para estudiar el impacto de la cuantización mixta 4/8 bits en modelos MoE.
- Generación de contenido en alemán para medios o marketing: redacción y reescritura de textos con un modelo entrenado específicamente para ese idioma.
- Investigación en eficiencia de inferencia: comparación de la variante 4-bit (43,6 GB) frente a la 8-bit (79,9 GB) en términos de tamaño, fidelidad y requisitos de memoria.
- Despliegue en estaciones de trabajo de sobremesa: integración en herramientas locales de chat o asistentes de escritorio mediante `mlx_lm.chat`.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente a los pesos originales en BF16 (divergencia KL y acuerdo top-1). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Cuantización | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | German KL | top-1 | Answers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 43,61 GB | 0,049350 | 91,22% | 0,041060 | 92,37% | 0,047258 | 90,35% | 0,036535 | 91,77% | 7/7 |
| MLX 8-bit | 79,85 GB | 0,037269 | 92,94% | 0,030178 | 94,04% | 0,034909 | 92,49% | 0,024459 | 93,47% | 7/7 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 43,6 GB para la variante 4-bit; 79,9 GB para la 8-bit.
- Hardware recomendado por el autor: Mac Studio M5 Max con 64 GB (4-bit, contexto 256K); Mac Studio M5 Ultra con 96 GB, M5 Max con 128 GB, M5 Ultra con 256 GB o 512 GB (8-bit, contexto 256K).
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) ni en Mac con menos de 64 GB de memoria unificada.
- Opciones de despliegue: mlx-lm 0.32.2 (`mlx_lm.generate`, `mlx_lm.chat`) con `--trust-remote-code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Kolibri-1.1-MLX-4bit | 75,1B (MoE) | 256K | MLX safetensors 4/8-bit | Apache 2.0 | Hugging Face |
| Xylolabs/Kolibri-1.1-MLX-8bit | 75,1B (MoE) | 256K | MLX safetensors 8-bit | Apache 2.0 | Hugging Face |
| Aleph-Alpha/Kolibri-1.1 (original) | 75,1B (MoE) | no disponible | BF16 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar que permitan comparar el rendimiento cualitativo con otras familias de modelos del mismo tamaño.

## Limitaciones y advertencias

- Idiomas limitados a alemán e inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos generativos; no se publican evaluaciones de veracidad.
- Sesgos no documentados en la información disponible.
- La cuantización 4-bit introduce una degradación medible frente a BF16 (KL de 0,049 en WikiText-2 y acuerdo top-1 del 91,22 %), superior a la de la variante 8-bit.
- Requiere `--trust-remote-code` por el código de arquitectura personalizado, lo que implica ejecutar código del repositorio.
- Dependencia de mlx-lm 0.32.2 y de hardware Apple Silicon; no es desplegable en vLLM, TGI, llama.cpp ni Ollama según la información disponible.
- Restricciones de licencia: Apache 2.0 con los términos adicionales de la model card original de Aleph-Alpha, que deben revisarse antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Kolibri-1.1-MLX-4bit
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Repositorio de herramientas de cuantización de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- MLX: https://github.com/ml-explore/mlx
