# ThakiCloud/Qwen3-Coder-30B-A3B-Prune3-W4A16

## Resumen

Qwen3-Coder-30B-A3B-Prune3-W4A16 es un modelo de lenguaje especializado en código, desarrollado por ThakiCloud como una variante optimizada del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct. Combina una poda selectiva del 3,1 % de los expertos de su arquitectura MoE (mixture of experts) con una cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) mediante GPTQ, reduciendo el tamaño del checkpoint de 61,1 GB a 16,2 GB, un factor de compresión de 3,76 veces. El modelo mantiene un rendimiento prácticamente idéntico al original en HumanEval (0,9467 frente a 0,9267 del base, dentro del margen de error), lo que lo convierte en una opción atractiva para despliegues con recursos de memoria limitados.

La relevancia de esta publicación radica en que documenta de forma explícita el punto donde la poda de expertos deja de ser "gratuita": mientras que un 3,1 % de poda no degrada el rendimiento en código, un 6,25 % ya lo reduce a 0,7733 en HumanEval y un 8,6 % lo colapsa a 0,4467. El autor publica también una versión hermana sin podar (Qwen3-Coder-30B-A3B-W4A16) para que la diferencia de tamaño (0,46 GB) sea visible y se pueda evaluar el coste-beneficio real de la poda. El modelo se distribuye bajo licencia Apache 2.0 y está pensado como herramienta de capacidad, no de throughput: la cuantización W4A16 es más lenta que FP8 o NVFP4 en hardware Blackwell, pero permite encajar un modelo de 30B en GPUs más pequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3-Coder-30B-A3B-Instruct, con 128 expertos por capa podados a 124 (3,1 %) |
| Parametros totales | 29.625.759.744 (aproximadamente 29,6 mil millones) |
| Parametros activos | 3 mil millones (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits) mediante GPTQ |
| Idiomas soportados | no disponible (el modelo base Qwen3-Coder soporta múltiples idiomas, pero no se especifica en esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Coder-30B-A3B-Instruct, un transformer MoE con 30 mil millones de parámetros totales y 3 mil millones activos por token, organizado en capas con 128 expertos cada una. La variante publicada aplica dos transformaciones: primero, una poda estructural que elimina 4 expertos por capa (3,1 % del total, pasando de 128 a 124), seleccionados mediante un barrido que el autor documenta como una "pendiente pronunciada" en lugar de una curva suave; segundo, una cuantización W4A16 de los pesos restantes usando GPTQ, que reduce la precisión de los pesos a 4 bits mientras mantiene las activaciones en 16 bits.

El entrenamiento original del modelo base no se detalla en la información proporcionada, pero al ser una variante de Qwen3-Coder-Instruct, se asume que incluye fine-tuning supervisado y alineación con preferencias humanas. El proceso de poda y cuantización se realizó con la librería llm-compressor, como indican las etiquetas del repositorio. El autor destaca que la poda no afecta al rendimiento en código hasta aproximadamente un 6 % de expertos eliminados, pero a partir del 8,6 % la degradación es catastrófica (HumanEval cae de 0,70 a 0,4467), lo que sugiere que la generación de código depende de una subred de expertos redundante que los benchmarks generales no detectan.

## Capacidades

- Generación de código en múltiples lenguajes, con especialización en tareas de programación competitiva y resolución de problemas algorítmicos, como demuestra su resultado de 0,9467 en HumanEval pass@1.
- Seguimiento de instrucciones complejas, evaluado con IFEval (0,84 en prompt strict), lo que indica capacidad para cumplir restricciones de formato y contenido.
- Razonamiento matemático básico, con 0,8867 en GSM8K (strict), ligeramente por debajo del rango del modelo base (0,93–0,94) pero dentro del margen de ruido estadístico.
- Conversación multi-turno y generación de texto, al ser una variante instruct del modelo Qwen3-Coder.
- Soporte de tool calling y function calling: aunque no se menciona explícitamente en la model card, el modelo base Qwen3-Coder-Instruct incluye estas capacidades, y la poda al 3,1 % no debería afectarlas significativamente.
- Capacidades multilingües: no confirmadas para esta variante, pero el modelo base de Qwen3 soporta más de 30 idiomas.

## Casos de uso

- Despliegue de asistentes de código en entornos con VRAM limitada: con 16,2 GB de tamaño, el modelo cabe en GPUs de consumo como RTX 4090 (24 GB) o incluso en configuraciones con 16 GB si se usa cuantización adicional o offloading. Es adecuado para IDEs con autocompletado o chatbots de programación en equipos de desarrollo sin acceso a clusters.
- Evaluación de calidad de código en pipelines de CI/CD: el modelo puede generar soluciones de referencia o revisar parches, aprovechando su rendimiento en HumanEval y su capacidad de seguir instrucciones (IFEval 0,84). Su licencia Apache 2.0 permite integrarlo en herramientas propietarias.
- Entrenamiento de modelos más pequeños por destilación: al ser una versión podada y cuantizada de un modelo mayor, puede servir como teacher para destilar conocimiento en modelos de 1-3B, reduciendo costes de inferencia en producción.
- Prototipado rápido de aplicaciones de generación de código en entornos académicos o de investigación: su tamaño reducido permite experimentar con técnicas de prompting, few-shot learning o fine-tuning adicional sin necesidad de hardware de gama alta.
- Servicio de generación de código en edge computing o dispositivos con memoria unificada (como Apple Silicon con 32 GB o NVIDIA Jetson): el checkpoint de 16,2 GB es viable para inferencia local en estos dispositivos, aunque la latencia será mayor que con formatos FP8.
- Benchmarking de técnicas de compresión: el autor publica datos detallados de poda y cuantización, lo que convierte a este modelo en un caso de estudio útil para investigar el equilibrio entre compresión y rendimiento en arquitecturas MoE.

## Benchmarks y rendimiento

El autor proporciona resultados medidos en una única GPU B200 con vLLM y lm-eval, usando 150 preguntas por tarea. Los valores de stderr son de aproximadamente 2 puntos, por lo que las diferencias dentro de ese rango no son estadísticamente significativas.

| Modelo | Tamano | HumanEval pass@1 | IFEval (prompt strict) | GSM8K (strict) |
|---|---|---|---|---|
| Base bf16 (Qwen3-Coder-30B-A3B-Instruct) | 61,1 GB | 0,9267 | — | — |
| W4A16 sin podar | 16,69 GB | 0,9400 | — | — |
| **Este modelo (3,1 % podado + W4A16)** | **16,2 GB** | **0,9467** | **0,84** | **0,8867** |

Además, el autor documenta el efecto de diferentes ratios de poda en HumanEval (en bf16, sin cuantización, para aislar el efecto de la poda):

| Expertos eliminados | HumanEval pass@1 |
|---|---|
| 0 % (base) | 0,9267 |
| 3,1 % (este modelo) | 0,9400 |
| 6,25 % | 0,7733 |
| 7,8 % | 0,7000 |
| 8,6 % | 0,4467 |
| 10,16 % | 0,3667 |

El autor señala que un checkpoint interno al 10,16 % obtuvo 0,28 en HumanEval, pero IFEval (0,79) y GSM8K (0,93) se mantenían aparentemente normales, lo que demuestra que los benchmarks generales no detectan la degradación en código.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 16,2 GB en disco, por lo que se necesita al menos 16-18 GB de VRAM para cargarlo sin offloading. Con cuantización adicional (por ejemplo, GGUF Q4_K_M) podría reducirse a unos 12-14 GB.
- GPU recomendadas: el autor probó en una NVIDIA B200 (Blackwell). Para despliegue en consumer, una RTX 4090 (24 GB) o RTX 4080 (16 GB) son suficientes. También es viable en A100 40 GB, A10G 24 GB o L4 24 GB.
- Cabe en GPU de consumo: sí, en GPUs con 16 GB o más, aunque con 16 GB exactos puede ser necesario usar offloading de capas a CPU o cuantización adicional.
- Opciones de despliegue: vLLM (usado en las pruebas del autor), llama.cpp (con conversión a GGUF), Ollama, TGI (Text Generation Inference) o cualquier framework que soporte safetensors y GPTQ.
- Latencia y throughput: en una B200 con vLLM, el modelo alcanza 206,97 tok/s con concurrencia 1, 1346,8 tok/s con concurrencia 10 y 4169,99 tok/s con concurrencia 50. La latencia p99 a concurrencia 50 es de 475 ms. Estos valores son comparables a los de la versión sin podar (el autor confirma que la poda no afecta al throughput).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (base) | 30B totales, 3B activos | no disponible | 0,9267 | Apache 2.0 | bf16 (61,1 GB) |
| Qwen3-Coder-30B-A3B-W4A16 (sin podar) | 30B totales, 3B activos | no disponible | 0,9400 | Apache 2.0 | W4A16 (16,69 GB) |
| **Este modelo (podado 3,1 % + W4A16)** | **29,6B totales, 3B activos** | **no disponible** | **0,9467** | **Apache 2.0** | **W4A16 (16,2 GB)** |
| Qwen3-Coder-30B-A3B-NVFP4 (mencionado en la card) | 30B totales, 3B activos | no disponible | no disponible | Apache 2.0 | NVFP4 (tamano no indicado) |

La comparativa directa con el base muestra que la combinación poda + cuantización no degrada el rendimiento en código dentro del margen de error. Frente a la versión sin podar, la diferencia de tamaño es de solo 0,46 GB (2,8 %), lo que cuestiona la utilidad práctica de la poda al 3,1 % salvo que el espacio sea extremadamente crítico. En cuanto a velocidad, el autor demuestra que W4A16 es estructuralmente más lento que FP8 o NVFP4 en hardware Blackwell (1,27×–1,43× más lento que FP8, y 1,40×–1,83× más lento que NVFP4), por lo que para aplicaciones sensibles a la latencia es preferible usar formatos nativos de Blackwell.

## Limitaciones y advertencias

- La poda al 3,1 % es un punto de operación deliberadamente conservador: el autor documenta que ratios superiores al 6 % degradan gravemente HumanEval, y que la caída es especialmente abrupta entre el 7,8 % y el 8,6 %. No se recomienda intentar podas adicionales sin re-evaluar exhaustivamente el rendimiento en código.
- El rendimiento en GSM8K (0,8867) es ligeramente inferior al rango del modelo base (0,93–0,94), aunque el autor lo atribuye a ruido estadístico. Si la aplicación requiere razonamiento matemático robusto, conviene validar con más muestras.
- La cuantización W4A16 introduce una penalización de throughput frente a FP8 o NVFP4 en GPUs Blackwell debido a la dequantización en tiempo de cómputo. Para despliegues de alta concurrencia o baja latencia, es preferible usar formatos nativos de 4 bits (NVFP4) si el hardware lo soporta.
- No se dispone de información sobre la longitud de contexto soportada ni sobre los idiomas exactos que maneja esta variante. Se asume que hereda las capacidades del modelo base Qwen3-Coder, pero no está confirmado.
- El modelo es una variante cuantizada y podada, por lo que puede presentar alucinaciones o errores en tareas de código complejas, especialmente en lenguajes poco representados en su entrenamiento. Se recomienda validar el código generado antes de usarlo en producción.
- El autor no proporciona datos sobre sesgos o comportamientos peligrosos. Al ser un modelo de código, el riesgo principal es la generación de código inseguro o con vulnerabilidades, por lo que se recomienda usar herramientas de análisis estático adicionales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Coder-Instruct tiene su propia licencia (Apache 2.0 también), por lo que no hay restricciones adicionales conocidas. Sin embargo, se debe verificar la licencia del modelo base original para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-Prune3-W4A16
- Versión hermana sin podar: https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-W4A16
- Versión NVFP4 (comparativa de formatos): https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
