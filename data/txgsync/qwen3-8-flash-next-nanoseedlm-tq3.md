# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TQ3 es una cuantización de investigación del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario txgsync. Se trata de un empaquetado de pesos que reduce el modelo original (aproximadamente 120.800 millones de parámetros en pesos de expertos enrutados, más pesos densos, con un total real de 68.954.623.455 parámetros según los safetensors del repo) a un formato de 3,125 bits por peso de experto mediante un esquema de cuantización denominado TCQ (Trellis Coded Quantization) implementado en los motores NanoSeedLM.

El objetivo declarado es hacer ejecutable un modelo MoE de gran tamaño en equipos de consumo: un PC con GPU de 12 o 16 GB de VRAM y 64 GB de RAM, manteniendo los pesos de expertos en RAM y cacheando en la GPU los expertos en uso. La divergencia KL frente a BF16 es de 0,0778, un 16 % inferior a los empaquetados de Unsloth del mismo tamaño según el autor. En una RTX 4080 con CUDA decodifica a 44,0 tokens por segundo, y a 43,1 tras un prompt de 30.000 tokens.

Es un research preview: requiere código remoto (Trust Remote Code) y motores específicos (NanoSeedLM en CUDA/Metal, mlx-vlm, oMLX con un parche concreto). No es un modelo nuevo, sino un artefacto de compresión y despliegue sobre el modelo base Qwen3.8-Flash-Next, con licencia qwen-community-1.0 heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer, con pesos densos y expertos enrutados; formato de pesos MLX (custom_code) |
| Parametros totales | 68.954.623.455 (safetensors); 120,8 B en pesos de expertos enrutados según la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con prompts de 30.000 tokens) |
| Tipos de cuantizacion | Expertos a 3,125 bits (Trellis K3); pesos densos a 8 bits; tabla PLE n-gram en disco. Familia: TCQ4 (4,125 bits), TCQ3-D4 (3,458 bits), TCQ3 (3,125 bits), P4 (4,5 bits), P3 (4,0 bits) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors en formato MLX (librería mlx), con custom_code; requiere Trust Remote Code |
| Tamano del repo | 195,6 GB (descarga del pack TCQ3: 112,1 GB) |
| Memoria residente | ~55 GB (47,2 GB de expertos + pesos densos 8-bit) |
| Divergencia KL vs BF16 | 0,0778 (64 ventanas de 2.048 tokens de wikitext-2) |
| Descargas | 314 |
| Creado / actualizado | 2026-11-06 / 2026-11-07 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es una arquitectura de mezcla de expertos (MoE) con pesos densos y expertos enrutados. Esta ficha no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos no están disponibles en la información proporcionada. Lo relevante aquí es el proceso de cuantización: los 120,8 B de pesos de expertos se comprimen a 3,125 bits por peso mediante un código de trellis (TCQ) que reconstruye cada peso a partir de unos pocos bits almacenados con aritmética entera, sin almacenar codebook. Los pesos densos se mantienen a 8 bits, y la tabla PLE n-gram permanece en disco, con la caché de páginas sirviendo las filas que lee cada sesión.

La innovación técnica principal es doble. Por un lado, el esquema TCQ frente a los "seeds" de las variantes P3/P4: con los mismos pesos densos a 8 bits, TCQ4 da KL 0,0398 a 4,125 bits, P4 da 0,0408 a 4,5 bits y P3 da 0,0600 a 4,0 bits, es decir, el trellis es más cercano a BF16 por bit. Por otro, la decisión de mantener los pesos densos a 8 bits: aunque son una fracción pequeña de los bytes, en P3 y P4 causan la mayor parte del KL (P3 pasa de 0,0600 con densos 8-bit a 0,182 con los 4-bit que distribuye; P4 de 0,0408 a 0,169). El coste es velocidad: los packs TCQ leen 1,84 GB más por token y en M4 Max decodifican aproximadamente un 15 % más lento que P3. No se documenta decodificación especulativa ni atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline image-text-to-text, etiquetas conversational).
- Procesamiento de imagen y texto combinados (image-text-to-text, mlx-vlm), aunque el detalle de las capacidades de visión no se especifica en la model card.
- Razonamiento y generación de código y matemáticas: no se documentan explícitamente en la información proporcionada; deben asumirse las del modelo base Qwen3.8-Flash-Next, sin datos verificables aquí.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no listados).
- Capacidad especial: modo de cuantización extrema (3,125 bits por experto) que permite ejecutar el modelo con 12-16 GB de VRAM y 64 GB de RAM, con servidor compatible con la API de OpenAI en el puerto 8080.
- Ejecución en CUDA (Linux y Windows) y Metal (macOS) mediante los motores NanoSeedLM, además de mlx-vlm y oMLX.

## Casos de uso

- Despliegue local de un MoE de gran tamaño en estaciones de trabajo de consumo: con una GPU de 12-16 GB y 64 GB de RAM, el pack TCQ3 mantiene los expertos en RAM y cachea en VRAM los expertos activos, permitiendo servir el modelo sin infraestructura de centro de datos.
- Servicio de API compatible con OpenAI en local: el script de arranque levanta un servidor en el puerto 8080, lo que permite integrarlo como backend en aplicaciones existentes que ya consumen la API de OpenAI sin cambios de cliente.
- Procesamiento de documentos largos con imagen y texto: la combinación de pipeline image-text-to-text y prompts de hasta 30.000 tokens (con decodificación a 43,1 tok/s en RTX 4080) es adecuada para tareas de extracción y resumen sobre documentos escaneados o capturas.
- Experimentación en investigación sobre cuantización extrema: las cinco variantes (TCQ4, TCQ3-D4, TCQ3, P4, P3) permiten comparar esquemas trellis frente a seeds con métricas KL publicadas, útil para estudiar el compromiso bits-fidelidad en MoE.
- Prototipado en Apple Silicon: con 96-128 GB de memoria unificada, los packs TCQ y P3 se ejecutan vía mlx-vlm u oMLX, sirviendo como banco de pruebas de modelos grandes en macOS.
- Evaluación de viabilidad antes de invertir en hardware: la tabla de la model card permite decidir qué pack cabe en una máquina concreta (por ejemplo, TCQ3-D4 para 96 GB de RAM con contexto largo, TCQ4 para 128 GB con la menor KL) antes de comprar GPU o ampliar RAM.
- Investigación sobre seeds y códigos trellis: los packs P4 y P3 están orientados explícitamente a la investigación sobre SeedLM y sus semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son métricas de cuantización y velocidad:

| Metrica | Valor |
|---|---|
| KL vs BF16 (TCQ3, tal como se distribuye) | 0,0778 |
| KL vs BF16 (TCQ4) | 0,0415 |
| KL vs BF16 (TCQ3-D4) | 0,0638 |
| KL vs BF16 (P4) | 0,169 |
| KL vs BF16 (P3) | 0,182 |
| KL con densos 8-bit (TCQ4 / P4 / P3) | 0,0398 / 0,0408 / 0,0600 |
| Decodificacion en RTX 4080 (16 GB, CUDA) | 44,0 tok/s |
| Decodificacion tras prompt de 30.000 tokens | 43,1 tok/s |
| Decodificacion en RTX 4080 limitada a 12 GB | 27 tok/s |
| TCQ4 vs P3 en M4 Max | ~15 % mas lento TCQ4 |

Metodología KL: 64 ventanas de 2.048 tokens de wikitext-2, con tabla PLE Q8_0 de Unsloth, frente a BF16 en llama.cpp.

## Requisitos de hardware

- VRAM: 12-16 GB en GPU para cachear expertos; los 47,2 GB de expertos TCQ3 residen en RAM (total residente ~55 GB).
- RAM: mínimo 64 GB para TCQ3; 96-128 GB para TCQ4 y TCQ3-D4; menos de 64 GB no es viable porque los expertos deben caber en RAM.
- GPU recomendadas: RTX 4080 (16 GB) con CUDA; RTX 4080 limitada a 12 GB funciona a 27 tok/s. No se documentan A100 ni H100 en la información proporcionada.
- Apple Silicon: Mac con 128 GB (TCQ4 o P3 para velocidad) y Mac con 96 GB (TCQ3-D4 para contexto largo).
- Consumer GPU: sí, en el rango de 12-16 GB, siempre que se cumpla el requisito de RAM del sistema.
- Despliegue: motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS), mlx-vlm con Trust Remote Code, oMLX con el parche jundot/omlx#5112. El script de arranque (START-HERE.bat o start-here.sh) verifica la máquina, descarga y comprueba el pack y levanta un servidor compatible con OpenAI en el puerto 8080.
- Latencia y throughput: 44,0 tok/s en RTX 4080 con 16 GB; 43,1 tok/s tras prompt de 30.000 tokens; 27 tok/s con 12 GB. TCQ4 aproximadamente un 15 % más lento que P3 en M4 Max por los pesos densos a 8 bits (1,84 GB adicionales leídos por token).

## Comparativa con modelos similares

| Modelo | Parametros | Bits expertos | Memoria | KL vs BF16 | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3 (este) | 68,95 B (safetensors) | 3,125 | ~55 GB | 0,0778 | qwen-community-1.0 | NanoSeedLM, mlx-vlm, oMLX |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ4 | mismo base | 4,125 | ~70 GB | 0,0415 | qwen-community-1.0 | NanoSeedLM, mlx-vlm, oMLX |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4 | mismo base | 3,458 | ~60 GB | 0,0638 | qwen-community-1.0 | NanoSeedLM, mlx-vlm, oMLX |
| Qwen3.8-Flash-Next-NanoSeedLM-P4 | mismo base | 4,5 | ~74 GB | 0,169 | qwen-community-1.0 | NanoSeedLM, mlx-vlm, oMLX |
| Qwen3.8-Flash-Next-NanoSeedLM-P3 | mismo base | 4,0 | ~66 GB | 0,182 | qwen-community-1.0 | NanoSeedLM, mlx-vlm, oMLX |

No se dispone de comparación con modelos de otros autores (por ejemplo, cuantizaciones GGUF de llama.cpp o packs de Unsloth) más allá de la referencia cualitativa del autor de que TCQ3 está un 16 % por debajo en KL respecto a los packs de Unsloth del mismo tamaño. Los datos cuantitativos de esa comparación no están disponibles.

## Limitaciones y advertencias

- Research preview: no es un artefacto listo para producción estable; depende de motores y parches concretos (jundot/omlx#5112) y de Trust Remote Code.
- Licencia qwen-community-1.0: es una licencia "other" con términos comunitarios; deben revisarse las restricciones de uso comercial en el enlace de licencia del modelo base antes de desplegarlo en producto.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni calidad por idioma.
- Contexto máximo no documentado: solo se verifican prompts de 30.000 tokens; no se conoce la ventana oficial.
- Requisito estricto de RAM: con menos de 64 GB el pack no es viable; el rendimiento depende de la caché de expertos en GPU (27 tok/s con 12 GB frente a 44 tok/s con 16 GB).
- Divergencia KL de 0,0778 frente a BF16: implica degradación medible de calidad respecto al modelo original, mayor que TCQ4 (0,0415) y TCQ3-D4 (0,0638).
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse empíricamente sobre el modelo base.
- Pesos densos a 8 bits penalizan velocidad (1,84 GB más por token, ~15 % más lento que P3 en M4 Max).
- La tabla PLE n-gram reside en disco: el rendimiento depende de la caché de páginas y del almacenamiento.
- No probado en PC con 64 GB de RAM según el autor; el caso de uso principal está pendiente de validación por terceros.
- Solo 314 descargas y 0 likes: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack TCQ4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Pack TCQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Pack P4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Pack P3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3
- Motor NanoSeedLM (repositorio): https://github.com/mbarnson/NanoSeedLM
- Releases del motor NanoSeedLM: https://github.com/mbarnson/NanoSeedLM/releases
- Parche oMLX: https://github.com/jundot/omlx/pull/5112
- Paper referenciado (arXiv:2410.10714): https://arxiv.org/abs/2410.10714
- Paper referenciado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
