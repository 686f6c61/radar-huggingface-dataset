# tinyopsec/xor-lite-GGUF

## Resumen

xor-lite-GGUF es una colección de cuantizaciones en formato GGUF del modelo base `juspay/xor-lite`, publicado por el usuario `tinyopsec` en Hugging Face. El modelo subyacente es un transformer de arquitectura Llama derivado de `openbmb/MiniCPM5-2B`, con aproximadamente 2.516 millones de parámetros (unos 2,5B). Esta publicación no contiene el adaptador LoRA ni la cabeza de lectura ("pointer readout head") que forman parte del modelo xor-lite original: incluye únicamente el modelo base, sin fusionar el adaptador.

El interés de esta ficha reside en su utilidad práctica: al ofrecer el modelo en 13 niveles de cuantización (desde F16 hasta Q2_K), permite desplegar un modelo de ~2,5B en hardware de consumo modesto mediante llama.cpp, Ollama, LM Studio o koboldcpp. Es relevante para desarrolladores que quieran experimentar con la arquitectura MiniCPM5 en local sin necesidad de GPU de gama alta.

No obstante, conviene subrayar una advertencia importante: al tratarse de la versión base sin el adaptador, el comportamiento del modelo puede diferir sustancialmente del xor-lite completo. La model card no documenta idiomas soportados, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (base: MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp); repo de 24,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de arquitectura Llama, derivado de `openbmb/MiniCPM5-2B`, con unos 2,5B parámetros. La model card de esta publicación GGUF no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas específicas más allá de la base MiniCPM5.

La información disponible indica que xor-lite (el modelo upstream de juspay) se distribuye con un adaptador LoRA y una cabeza de lectura ("pointer readout head") separados, que deben aplicarse según las instrucciones del repositorio original. Esta publicación GGUF contiene exclusivamente el modelo base, por lo que las capacidades específicas del xor-lite completo no están garantizadas en estos ficheros. Las cuantizaciones se generaron con llama.cpp y cubren desde F16 (5,0 GB) hasta Q2_K.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en Hugging Face).
- Compatible con endpoints estándar de inferencia (`endpoints_compatible`).
- Ejecutable en cualquier runtime compatible con GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.
- Capacidades específicas de tool calling, agentes o razonamiento multi-paso: no disponibles en la documentación.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades de visión o audio: no disponibles.
- Modo "thinking": no disponible.
- Nota: al no incluir el adaptador LoRA ni la cabeza de lectura de xor-lite, las capacidades del modelo completo pueden no estar presentes.

## Casos de uso

- Prototipado local en hardware de consumo: usar `model-Q4_K_M.gguf` (recomendado por el autor) con llama.cpp u Ollama para probar un modelo de ~2,5B en un portátil con GPU modesta o incluso CPU.
- Experimentación con la arquitectura MiniCPM5: investigadores que quieran estudiar el comportamiento del modelo base sin el adaptador pueden cargar las distintas cuantizaciones y comparar calidad frente a tamaño.
- Evaluación de cuantizaciones: el repositorio ofrece 13 niveles, lo que permite medir la degradación de calidad entre F16 y Q2_K en tareas concretas de generación de texto.
- Generación de texto conversacional ligera: integrable en aplicaciones de chat de bajo coste donde la latencia y el consumo de memoria son críticos.
- Despliegue en entornos con recursos limitados: el fichero Q2_K permite ejecutar el modelo en dispositivos con muy poca VRAM o RAM, útil para demos y pruebas de concepto.
- Base para fine-tuning posterior: al ser el modelo base sin adaptador, puede servir como punto de partida para entrenar adaptadores propios con herramientas compatibles con GGUF o reconvertir a otros formatos.
- Integración en pipelines de CI/CD para pruebas de regresión de modelos: usar cuantizaciones pequeñas para validar respuestas en tests automatizados sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (inferencia, aproximada según tamaño de fichero):
  - F16: ~5,0 GB de pesos; ~6-7 GB de VRAM con overhead de contexto.
  - Q8_0: ~2,7 GB de pesos; ~4 GB de VRAM.
  - Q5_K_M: ~1,8 GB de pesos; ~3 GB de VRAM.
  - Q4_K_M (recomendado): ~1,5 GB de pesos; ~2,5 GB de VRAM.
  - Q2_K: ~1,0 GB de pesos; ~2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, GTX 1660, etc.). Para F16 se recomienda 8 GB o más. GPU de datacenter (A100, H100) no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la documentación. Al ser un modelo de ~2,5B, se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| xor-lite-GGUF (esta ficha) | ~2,5B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| openbmb/MiniCPM5-2B (base) | ~2,5B | no disponible | no disponible | safetensors | Hugging Face |
| juspay/xor-lite (upstream) | ~2,5B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El repositorio contiene solo el modelo base: el adaptador LoRA y la cabeza de lectura de xor-lite no están incluidos y deben aplicarse por separado. El comportamiento puede diferir del modelo completo.
- No se documentan idiomas soportados; el rendimiento multilingüe es incierto.
- No se documenta la longitud de contexto; puede ser limitada y no adecuada para tareas de contexto largo.
- Riesgo de alucinación inherente a modelos de ~2,5B, especialmente en tareas de razonamiento complejo.
- No hay resultados de benchmarks publicados que permitan evaluar la calidad real del modelo.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de generación.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de MiniCPM5-2B conviene verificar las condiciones del modelo base upstream.
- El autor de la publicación GGUF (`tinyopsec`) no es el autor original del modelo; la trazabilidad y soporte dependen de terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/xor-lite-GGUF
- Modelo upstream: https://huggingface.co/juspay/xor-lite
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-2B
