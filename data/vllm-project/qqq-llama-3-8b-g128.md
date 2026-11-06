# vllm-project/QQQ-Llama-3-8b-g128

## Resumen

QQQ-Llama-3-8b-g128 es una versión cuantizada a INT4 del modelo Llama 3 8B, generada con la técnica QQQ (QuaRot-Quantized Quantization) con tamaño de grupo 128. El modelo original fue cuantizado por HandH1998 y esta copia es mantenida por el equipo de vLLM para uso en su integración continua (CI), con el objetivo de reducir el riesgo de dependencia de una cuenta personal. QQQ es una solución de cuantización W4A8 (pesos de 4 bits, activaciones de 8 bits) optimizada para hardware, descrita en el paper arXiv:2406.09904.

El checkpoint emplea pesos en formato safetensors y ocupa 6,2 GB en el repositorio. El dato de parámetros reportado en los safetensors es de 1.979.256.832, aunque la denominación "8b" del nombre sugiere que se trata de una cuantización del Llama 3 8B; la discrepancia entre el conteo de parámetros empaquetados y el tamaño nominal no se aclara en la información disponible. La licencia es MIT.

Su relevancia actual radica en que permite ejecutar un modelo de la familia Llama 3 en entornos con memoria reducida merced a la cuantización INT4, y en que sirve como checkpoint de referencia para validar la corrección numérica de la implementación de QQQ en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3), cuantización QQQ W4A8 |
| Parametros totales | 1.979.256.832 (según safetensors); nominal 8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 con grupo de tamaño 128 (W4A8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Llama 3 (8B), sobre el que se aplica la cuantización QQQ. QQQ es una técnica de cuantización post-entrenamiento W4A8 que cuantiza los pesos a 4 bits por grupo (grupo de 128 en esta variante) manteniendo las activaciones en 8 bits, con el objetivo de preservar la precisión numérica al tiempo que reduce la huella de memoria. El método está descrito en el paper arXiv:2406.09904 y su implementación de referencia está disponible en el repositorio de GitHub del autor.

No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens utilizados, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco se detalla en la información proporcionada si la cuantización incluyó transformaciones de rotación u otras técnicas auxiliares propias del método QQQ. El checkpoint se distribuye como copia del original HandH1998/QQQ-Llama-3-8b-g128 en el commit `51340bb`, creada el 30 de octubre de 2026 para uso en CI de vLLM.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Llama 3 8B.
- Generación de código y resolución de problemas matemáticos, en la medida en que lo permite el modelo base.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución con memoria reducida gracias a la cuantización INT4 de pesos.

## Casos de uso

- Validación de la implementación de QQQ en vLLM: el checkpoint se usa en la integración continua de vLLM para comprobar que los kernels de cuantización W4A8 producen resultados correctos en cada release. Es su propósito declarado.
- Despliegue en GPUs de gama consumer: la cuantización INT4 reduce la huella de memoria del modelo respecto a los pesos en FP16, lo que facilita su ejecución en tarjetas con VRAM limitada para tareas de generación de texto.
- Servicio de inferencia de bajo coste: al ocupar 6,2 GB en el repositorio, puede servirse en entornos con presupuesto de memoria ajustado para tareas de generación de texto y resumen.
- Reproducción de experimentos de cuantización: investigadores que comparan QQQ con otras técnicas (GPTQ, AWQ) pueden usar este checkpoint como referencia INT4 con grupo 128.
- Benchmarking de kernels de cuantización: útil para medir throughput y latencia de kernels W4A8 frente a variantes W4A16 o FP16 en la misma infraestructura.
- Base para fine-tuning ligero o adaptación: al estar en safetensors y con licencia MIT, puede servir como punto de partida para experimentos de adaptación, siempre que la herramienta de destino soporte el formato cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,2 GB en pesos INT4; la VRAM efectiva dependerá de la longitud de contexto, del tamaño del KV cache y del backend utilizado. No se dispone de cifras medidas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU consumer: probable en tarjetas con al menos 8 GB de VRAM para contextos cortos, aunque no se confirma en la información disponible.
- Opciones de despliegue: vLLM es el backend de referencia (el checkpoint se mantiene para su CI). Otros backends no se confirman.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QQQ-Llama-3-8b-g128 | 8B (nominal) | no disponible | INT4 W4A8, grupo 128 | MIT | Hugging Face (copia vLLM) |
| Llama 3 8B (original) | 8B | 8K (según especificaciones públicas de Llama 3) | FP16/BF16 | Llama 3 Community License | Hugging Face (Meta) |
| Alternativas INT4 de Llama 3 8B (GPTQ, AWQ) | 8B | no disponible | INT4 W4A16 | variable según autor | Hugging Face |

La comparación con alternativas INT4 se basa en la categoría de cuantización; no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización INT4 puede degradar la calidad de las respuestas respecto al modelo en FP16/BF16; no se dispone de métricas que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente al modelo base Llama 3 8B; la cuantización puede acentuarlo en tareas de razonamiento largo.
- No se especifican los idiomas soportados ni las limitaciones de contexto en la información disponible.
- La licencia MIT aplica al checkpoint publicado; conviene verificar las condiciones del modelo base Llama 3 si se redistribuye o se usa comercialmente.
- El modelo está pensado principalmente como checkpoint de CI; no hay garantías de soporte ni de mantenimiento más allá de ese uso.
- La discrepancia entre el conteo de parámetros en safetensors (1.979.256.832) y el tamaño nominal 8B no se explica en la información disponible; conviene validar la integridad del checkpoint antes de usarlo en producción.
- El backend de referencia es vLLM; otros motores de inferencia pueden no soportar el formato QQQ.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-project/QQQ-Llama-3-8b-g128
- Modelo original: https://huggingface.co/HandH1998/QQQ-Llama-3-8b-g128
- Repositorio de código QQQ: https://github.com/HandH1998/QQQ
- Paper: https://arxiv.org/pdf/2406.09904
