# tbhrc/qwen2_5_coder_3b_instruct_4bit

## Resumen

El modelo `tbhrc/qwen2_5_coder_3b_instruct_4bit` es una cuantización de 4 bits del modelo `Qwen/Qwen2.5-Coder-3B-Instruct`, un modelo de lenguaje especializado en generación y comprensión de código, desarrollado por Alibaba Cloud como parte de la familia Qwen2.5-Coder. La versión cuantizada, publicada por el usuario `tbhrc`, reduce el tamaño del modelo a 1,7 GB, lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM muy bajos, manteniendo una calidad de generación de código aceptable para tareas de desarrollo asistido.

El modelo original es un transformer causal con 3.100 millones de parámetros (aunque el archivo cuantizado reporta 482 millones de parámetros en formato safetensors, un dato que probablemente corresponde al número de pesos almacenados en el archivo cuantizado, no al total del modelo base). Está afinado para seguir instrucciones y conversaciones, con soporte para generación de código, razonamiento y corrección de errores. Su relevancia actual radica en que ofrece una alternativa ligera y de bajo coste para entornos de producción con restricciones de memoria, especialmente en laptops con GPU de consumo o en despliegues edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basada en Qwen2.5) |
| Parametros totales | 482.381.824 (en safetensors cuantizado; el modelo base tiene 3.100 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (metodo no especificado) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | qwen-research (uso en investigacion, no comercial) |
| Formato de pesos | safetensors (compatible con MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen2.5-Coder-3B-Instruct` es un transformer decoder-only con atención causal, perteneciente a la serie Qwen2.5. La versión instruct fue sometida a un proceso de fine-tuning supervisado (SFT) seguido de optimización con preferencias (RLHF/DPO) para alinear la generación con instrucciones y diálogo. El modelo original se entrenó con un corpus masivo de código y texto en inglés, aunque no se especifican los datos exactos de entrenamiento en la información disponible. La versión cuantizada mantiene la arquitectura original pero reduce la precisión de los pesos a 4 bits, lo que disminuye el tamaño en memoria a cambio de una ligera pérdida de calidad en las predicciones.

No se dispone de detalles sobre el proceso de cuantización (técnica exacta, calibración, etc.). El repositorio indica que fue convertido desde la versión original mediante `mlx-lm`, lo que sugiere una conversión a formato MLX para su uso en Apple Silicon, aunque el formato safetensors también es compatible con librerías como `transformers`.

## Capacidades

- Generación de código en múltiples lenguajes (Python, JavaScript, Java, C++, etc.), incluyendo funciones, clases y scripts completos.
- Razonamiento sobre código: explicación de fragmentos, detección de errores y sugerencias de corrección.
- Soporte de conversaciones multi-turno con formato de chat (chat template integrado).
- Generación de documentación técnica, comentarios y explicaciones en lenguaje natural.
- Capacidad de completar código (code completion) y autocompletar.
- No se ha confirmado soporte de tool calling, function calling ni razonamiento multi-step avanzado en esta versión cuantizada, aunque el modelo base podría tener capacidades básicas de razonamiento.
- Capacidades multilingües limitadas: la model card indica idioma inglés, aunque el modelo base puede entender otros idiomas de forma limitada.

## Casos de uso

- Asistente de programación integrado en un editor: el modelo puede completar fragmentos de código, sugerir funciones y explicar el funcionamiento de un bloque de código, gracias a su entrenamiento específico en código y su capacidad de seguir instrucciones.
- Generación de código en producción para tareas repetitivas, como crear scripts de automatización, consultas SQL o plantillas de configuración. Su tamaño reducido permite ejecutarlo en una API local o en un entorno CI/CD.
- Corrección de errores y depuración: dado un fragmento de código con un error, el modelo puede identificar el problema y proponer una solución, útil en herramientas de análisis estático o en entornos de desarrollo.
- Documentación técnica: generar comentarios, README y explicaciones de algoritmos a partir de código fuente, ahorrando tiempo a los desarrolladores.
- Chatbot de soporte técnico especializado en programación, donde el modelo puede responder preguntas sobre lenguajes, frameworks y mejores prácticas, con un contexto limitado pero suficiente para conversaciones cortas.
- Prototipado rápido: en un entorno de aprendizaje o de diseño de soluciones, el modelo puede generar esqueletos de aplicaciones o pruebas de concepto, permitiendo iterar rápidamente sin necesidad de escribir código manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre HumanEval, MBPP, MMLU ni otros tests. Se recomienda consultar los benchmarks del modelo base `Qwen/Qwen2.5-Coder-3B-Instruct` en su repositorio oficial para estimar el rendimiento de la versión cuantizada, aunque la cuantización a 4 bits puede degradar ligeramente los resultados.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 1,7 GB en disco. Para inferencia, se necesita al menos 2 GB de VRAM para cargar los pesos y activaciones. Con cuantización adicional (por ejemplo, en CPU con llama.cpp) puede funcionar con menos memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o GPUs de Apple Silicon (M1/M2/M3). No se requiere una GPU de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo modernas.
- Opciones de despliegue: puede ejecutarse con la librería `transformers` (PyTorch), con `mlx-lm` en Apple Silicon, con `llama.cpp` o `Ollama` para CPU/GPU mixta, y con servidores de inferencia como `vLLM` o `TGI` (aunque para 3B parámetros es más eficiente usar soluciones ligeras).
- Latencia y throughput: no se dispone de datos medidos. En una GPU de gama media (RTX 3060) se espera una latencia de decenas de milisegundos por token con batch pequeño, y un throughput de unos 30-50 tokens/s en condiciones óptimas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Uso |
|---|---|---|---|---|---|
| `Qwen2.5-Coder-3B-Instruct` (base) | 3.1B | 32K | FP16 | Apache 2.0 | Comercial permitido |
| `tbx4/qwen2_5_coder_3b_instruct_4bit` | 482M (cuantizado) | no disponible | 4-bit | Apache research (no comercial) | Investigación |
| `CodeLlama-3B` | 3B | 16K | FP16 | Llama 2 license | Comercial con restricciones |
| `StarCoder-3B` | 3B | 8K | FP16 | Apache 2.0 | Comercial |

La comparación directa con el modelo base muestra que la versión cuantizada reduce el tamaño de memoria a aproximadamente la mitad (1,7 GB vs 6,2 GB en FP16), a costa de una pequeña pérdida de precisión. La licencia `qwen-research` restringe el uso a fines de investigación, lo que limita su aplicación en producción comercial, mientras que el modelo base con licencia Apache permite uso comercial.

## Limitaciones y advertencias

- Licencia `qwen-research`: no permite uso comercial. Solo para fines de investigación y evaluación. Cualquier uso en un producto comercial viola los términos.
- Pérdida de calidad por cuantización: la precisión de 4 bits puede degradar la coherencia en tareas complejas de razonamiento o generación de código largo, aunque suele ser aceptable para tareas de corta duración.
- Contexto limitado: no se especifica la longitud de contexto; el modelo base soporta 32K tokens, pero la cuantización puede reducir la capacidad efectiva. Se recomienda probar con secuencias cortas.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar código incorrecto o inventar APIs que no existen. Es necesario validar el código generado.
- Sesgos: el modelo puede reflejar sesgos presentes en el corpus de entrenamiento, especialmente en cuanto a estilos de código o preferencias de lenguajes.
- Idiomas: la model card indica inglés; el rendimiento en otros idiomas puede ser pobre, aunque el modelo base tiene cierta capacidad multilingüe.
- Sin soporte de tool calling ni agentes: la versión cuantizada no ha sido evaluada para uso en agentes autónomos; es recomendable utilizarlo únicamente como generador de texto.

## Enlaces

- Modelo en Hugging Face: [tbx4/qwen2_5_coder_3b_instruct_4bit](https://huggingface.co/tbhrc/qwen2_5_coder_3b_instruct_4bit)
- Modelo base original: [Qwen/Qwen2.5-Coder-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct)
- Repositorio oficial de Qwen2.5-Coder: [GitHub - huggingface/Qwen2.5-Coder](https://github.com/huggingface/Qwen2.5-Coder)
- Documentación de MLX para el modelo: [mlx-community/Qwen2.5-Coder-3B-Instruct-4bit](https://huggingface.co/mlx-community/Qwen2.5-Coder-3B-Instruct-4bit)
