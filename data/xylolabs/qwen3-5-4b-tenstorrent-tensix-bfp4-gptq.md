# Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4-GPTQ

## Resumen
Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4-GPTQ es una exportación cuantizada del modelo Qwen3.5-4B de Alibaba Qwen, adaptada específicamente para su ejecución en aceleradores Tenstorrent Tensix mediante el stack tt-metal/ttnn. La cuantización aplica GPTQ con formato block-floating-point de 4 bits (bfloat4_b) a las 248 proyecciones declaradas del decodificador, mientras que embeddings y cabezas se mantienen en BF16. El paquete lo firma Xylolabs, un tercero independiente, no el equipo original de Qwen.

El modelo base es un transformer multimodal (image-text-to-text) de aproximadamente 5.295 millones de parámetros totales según los safetensors, con capacidades de razonamiento (thinking mode) y una ventana de contexto que no se explicita en la información disponible. Esta exportación concreta está "cualificada" únicamente para el decodificador de texto: los parámetros de visión y MTP permanecen en el archivo pero su ejecución queda fuera de las comprobaciones realizadas.

Su relevancia es doble: por un lado, demuestra la viabilidad de cuantización BFP4 con GPTQ sobre hardware Tenstorrent (Blackhole), un nicho todavía poco explorado frente a CUDA; por otro, ofrece una alternativa de ~5,46 GB de pesos para desplegar un modelo de 4B con licencia Apache 2.0 en aceleradores de inferencia de bajo consumo. El número de descargas (5) y likes (0) indica que es un artefacto reciente y de nicho.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decodificador de texto del modelo Qwen3.5-4B; multimodal image-text-to-text en el modelo base) |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ bfloat4_b (4,5 bits por peso) en 248 proyecciones del decodificador; BF16 (443 tensores) y F32 (48 tensores) en el resto |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con quant4.json que registra el formato de cada proyección) |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-4B es un transformer multimodal con pipeline image-text-to-text, plantilla de chat propia y modo de razonamiento ("thinking") que puede desactivarse mediante `enable_thinking=False` en la plantilla. Esta exportación no reentrena el modelo: aplica GPTQ con damping 0,1 y sin búsqueda de exponentes de bloque sobre las 248 proyecciones declaradas del decodificador, almacenándolas como bfloat4_b (4,5 bits por peso) sobre rejillas block-floating-point. El embedding y una copia explícita de la cabeza atada permanecen en BF16 (byte-idénticas entre sí), y el resto de tensores se guardan en BF16 o F32.

El empaquetado ocupa unos 5,46 GB con todas las entradas almacenadas (8,25 bits por peso almacenado); si se comparte la cabeza atada una sola vez, baja a unos 4,19 GB (7,192 bits por peso único). Se indica compatibilidad con Transformers 5.23.0 y PyTorch, y las 248 matrices pasan las comprobaciones de rejilla y empaquetado nativo TT-NN (incluido BFP8), verificadas en el simulador Blackhole con TT-NN 0.81.1. No se detallan tokens de entrenamiento ni composición del dataset, ya que la cuantización no modifica el preentrenamiento del modelo base.

## Capacidades
- Generación de texto conversacional en inglés y coreano, con plantilla de chat original preservada.
- Razonamiento con modo "thinking" activable o desactivable desde la plantilla (`enable_thinking`).
- Capacidades multimodales (image-text-to-text) heredadas del modelo base, aunque la ejecución de visión queda fuera del alcance cualificado de esta exportación.
- Decodificador de texto cualificado para inferencia en Tensix/ttnn con precisión BFP4.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso
- Inferencia de texto en aceleradores Tenstorrent: el caso principal; cargar el checkpoint con TT-NN en Blackhole y ejecutar generación de texto con pesos BFP4, aprovechando que las 248 matrices pasan las comprobaciones de empaquetado nativo.
- Despliegue de bajo consumo en hardware no CUDA: con ~5,46 GB de pesos almacenados, encaja en dispositivos Tensix con DRAM limitada, ofreciendo una alternativa a GPUs convencionales para servir un modelo de 4B.
- Asistente conversacional multilingüe en/en coreano: la preservación de la plantilla de chat y el soporte de ambos idiomas permiten construir chatbots multi-turno para mercados anglófono y coreano.
- Generación con razonamiento controlado: usar `enable_thinking=False` para respuestas rápidas de baja latencia o activarlo para tareas que requieran cadena de pensamiento, según el perfil de evaluación del autor.
- Validación de pipelines de cuantización: el repo incluye `pack_tensix.py` y `verify_grid.py`, útiles para ingenieros que quieran verificar la fidelidad de representaciones BFP4 frente a BF16 antes de integrar en producción.
- Prototipado de investigación en cuantización de bajo bit: sirve como referencia para estudiar el impacto de GPTQ BFP4 (KL medio de 0,0475 frente a BF16) sobre un modelo multimodal de 4B con licencia permisiva.
- Evaluación comparativa de precisión: la métrica KL sobre 16.312 posiciones en textos inglés/coreano permite medir la degradación frente a alternativas como Q4_K_M.

## Benchmarks y rendimiento
| Perfil | KL medio | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas normales contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 29 | 7 | — |
| Esta exportación (BFP4 GPTQ) | 0,047503 | 29 | 7 | 0 |
| Q4_K_M emparejado | 0,039805 | 30 | 7 | 0 |

La evaluación cubre 16.312 posiciones puntuadas sobre los mismos textos en inglés y coreano (raw y chat), en dos fragmentos de 2.048 tokens. El suelo de referencia de llama.cpp BF16 es 0,000315. La regla relativa de puerta 7 se cumple: 1,193393 veces la KL de referencia, dentro del límite de 1,5 veces y sin más de una pérdida adicional contada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- Memoria de dispositivo: aproximadamente 5,46 GB solo para los pesos almacenados, más espacio para caché KV y búferes; compartiendo la cabeza atada, unos 4,19 GB de pesos.
- GPU recomendadas: no aplica de forma nativa; el destino es Tenstorrent Tensix (Blackhole). Para uso con Transformers/PyTorch se requiere una GPU con al menos ~6-8 GB de VRAM para BF16, aunque no se especifica.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el checkpoint está pensado para Tensix.
- Opciones de despliegue: TT-NN (ttnn) sobre tt-metal, con TT-NN 0.81.1 verificado en simulador Blackhole; Transformers 5.23.0 con PyTorch para carga genérica. tt-transformers y tt-forge no fueron comprobados con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4-GPTQ | 5,295 M | no disponible | BFP4 GPTQ (4,5 bits) | Apache 2.0 | Hugging Face, 5 descargas |
| Qwen/Qwen3.5-4B (base) | 5,295 M | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Q4_K_M emparejado (referencia de evaluación) | 5,295 M | no disponible | Q4_K_M | Apache 2.0 (heredada) | no disponible como repo público identificado |

La comparativa se limita al modelo base y a la referencia Q4_K_M usada en la evaluación KL del autor; no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- Solo el decodificador de texto está cualificado; visión y MTP permanecen en el archivo pero su ejecución no ha sido verificada.
- El paquete lo publica un tercero (Xylolabs), no el equipo de Qwen; conviene validar la fidelidad frente al BF16 original antes de producción.
- Idiomas limitados a inglés y coreano; el rendimiento en castellano no está evaluado.
- La cuantización BFP4 introduce degradación medible (KL 0,0475 frente a 0 en BF16), aceptable según el criterio del autor pero no idéntica al original.
- Dependencia de versiones concretas: Transformers 5.23.0 y TT-NN 0.81.1; otras versiones pueden no funcionar.
- tt-transformers y tt-forge no fueron comprobados con este checkpoint, lo que limita su uso en esos stacks.
- Riesgo de alucinación y sesgos heredados del modelo base; no se documentan mitigaciones específicas.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución y las condiciones del modelo base.
- Número de descargas muy bajo (5) y sin likes: artefacto reciente sin validación comunitaria amplia.
- Longitud de contexto no documentada, lo que impide planificar aplicaciones de contexto largo con precisión.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4-GPTQ/blob/main/LICENSE
