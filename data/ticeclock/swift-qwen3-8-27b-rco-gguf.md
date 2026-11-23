# ticeclock/Swift-Qwen3.8-27B-RCO-GGUF

## Resumen

Swift-Qwen3.8-27B-RCO-GGUF es una cuantización GGUF del modelo ukisai/Swift-Qwen3.8-27b, un modelo de razonamiento de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen3.8. La publica el usuario ticeclock en Hugging Face y su objetivo es hacer viable la inferencia de un modelo de este tamaño en GPUs de consumo con 16 GB de VRAM, manteniendo la cabeza MTP (Multi-Token Prediction) que acelera la decodificación especulativa.

La propuesta técnica combina dos trabajos previos: los tipos de tensor del cuantizado GSQ-RCO de ISTA-DASLab y la matriz de importancia (imatrix) del propio autor, aplicados mediante `llama-quantize` sobre los pesos F16 del modelo base. El resultado es un cuantizado híbrido con tipos IQ4_XS para la mayoría de tensores, IQ2_S para los embeddings y IQ3_XXS como tipo global, orientado a preservar la calidad en las capas sensibles mientras reduce agresivamente el peso de las capas menos críticas.

Es relevante ahora porque demuestra una práctica de cuantización quirúrgica reproducible (se incluyen el archivo de tipos de tensor y la imatrix) y porque mantiene la licencia Apache 2.0 del modelo original, lo que facilita su integración en productos comerciales. El repositorio ocupa 32,3 GB e incluye también el `mmproj` necesario para las capacidades multimodales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.8, con cabeza MTP (Multi-Token Prediction); detalles completos no disponibles |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS (global), IQ4_XS (mayoría de tensores), IQ2_S (token embeddings); también se publica una versión IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con `mmproj` para visión y archivo de tipos de tensor e imatrix incluidos) |

## Arquitectura y entrenamiento

El modelo base es ukisai/Swift-Qwen3.8-27b, una variante afinada de la familia Qwen3.8 orientada a razonamiento eficiente (etiqueta `efficient-thinking`). Incorpora una cabeza MTP, un mecanismo de predicción multi-token que permite decodificación especulativa y mejora el throughput en inferencia autoregresiva. La arquitectura exacta (número de capas, dimensión oculta, atención, tipo de normalización) no se detalla en la información disponible.

El proceso de cuantización se realizó con `llama.cpp` en la etiqueta b11054, aplicando `llama-quantize` con `--output-tensor-type IQ4_XS`, `--token-embedding-type IQ2_S` y un archivo `tensor-types.txt` heredado del cuantizado ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF, junto con una imatrix propia (`imatrix-qwen3.8-27b.gguf`). No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Razonamiento explícito con modo de pensamiento eficiente (`efficient-thinking`, `reasoning`).
- Decodificación especulativa mediante cabeza MTP, que acelera la generación.
- Capacidades multimodales a través del archivo `mmproj` incluido en el repositorio (visión), aunque el alcance exacto no está documentado.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con APIs tipo OpenAI en servidores de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el modo de razonamiento lo hace plausible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU de 16 GB: el cuantizado IQ3_XXS permite ejecutar un modelo de 27 B en una RTX 4080 o 4090 sin offloading agresivo a CPU, manteniendo conversaciones multi-turno con calidad razonable.
- Razonamiento asistido en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante llama.cpp u Ollama, es adecuado para sectores regulados donde no se pueden enviar datos a APIs externas.
- Prototipado de pipelines de razonamiento eficiente: la cabeza MTP y el modo `efficient-thinking` permiten medir la ganancia de la decodificación especulativa frente a modelos sin MTP en tareas de cadena de pensamiento.
- Reproducción e investigación en cuantización: el repositorio incluye el archivo de tipos de tensor y la imatrix, lo que permite reproducir el cuantizado, comparar estrategias (IQ3_S frente a IQ3_XXS) o generar variantes propias con `llama-quantize`.
- Procesamiento de documentos con componentes visuales: gracias al `mmproj` incluido, se puede desplegar en un servidor llama.cpp con soporte multimodal para extraer información de capturas, diagramas o formularios escaneados.
- Despliegue en servicios compatibles con endpoints: la etiqueta `endpoints_compatible` facilita servirlo detrás de una API estilo OpenAI para integrarlo en aplicaciones existentes sin reescribir el cliente.
- Evaluación comparativa de cuantizaciones: útil para equipos que necesitan decidir entre IQ3_S e IQ3_XXS según su presupuesto de VRAM y su tolerancia a la pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que es usable con GPUs de 16 GB. El repositorio completo ocupa 32,3 GB, pero un único archivo GGUF IQ3_XXS ronda los 11-12 GB, por lo que cabe en 16 GB con margen para el contexto KV cache.
- GPU recomendadas: RTX 4080, RTX 4090, RTX 5080/5090, A100 40 GB, H100 80 GB para despliegues con contexto largo o mayor paralelismo.
- GPU de consumo: sí, en tarjetas de 16 GB o más; en 12 GB requeriría contextos reducidos o offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (versión b11054 o superior), Ollama, LM Studio, servidores compatibles con endpoints OpenAI; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles. La cabeza MTP debería mejorar el throughput frente a un modelo equivalente sin decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-RCO-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF | Cuantización quirúrgica con MTP e imatrix |
| ukisai/Swift-Qwen3.8-27b (base) | 27,3 B | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | 27 B (aprox.) | no disponible | no disponible | GGUF | Fuente de los tipos de tensor GSQ-RCO |
| ukisai/Swift-Qwen3.8-27B-GGUF | 27,3 B | no disponible | no disponible | GGUF | Cuantizado previo del mismo autor base |

## Limitaciones y advertencias

- La cuantización IQ3_XXS es agresiva: por debajo de 4 bits se produce una degradación medible en tareas de razonamiento matemático y código, especialmente en comparación con IQ4_XS o Q5.
- Los embeddings en IQ2_S pueden afectar al rendimiento en vocabularios poco frecuentes y en idiomas distintos del inglés.
- No se documentan los idiomas soportados ni los sesgos del modelo base; se desconoce su comportamiento en castellano.
- Riesgo de alucinación inherente a los modelos de razonamiento de 27 B, agravado por la cuantización de baja precisión.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base ukisai/Swift-Qwen3.8-27b, que no se especifica en la información disponible.
- El modelo base no documenta su dataset de entrenamiento, por lo que no se pueden evaluar sesgos de origen.
- La cabeza MTP requiere versiones recientes de llama.cpp; versiones antiguas pueden ignorarla o fallar al cargar el modelo.
- El archivo `mmproj` debe descargarse por separado y emparejarse con el GGUF correcto para habilitar visión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ticeclock/Swift-Qwen3.8-27B-RCO-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Cuantizado del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Fuente de tipos de tensor GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
