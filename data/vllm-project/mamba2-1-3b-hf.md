# vllm-project/mamba2-1.3b-hf

## Resumen

mamba2-1.3b-hf es una conversión al formato de Hugging Face Transformers del modelo Mamba-2 de 1.300 millones de parámetros desarrollado por el grupo de Albert Gu (CMU) y Tri Dao (Princeton), publicado originalmente en el repositorio `state-spaces/mamba2-1.3b`. Esta versión concreta la mantiene el proyecto vLLM como copia de seguridad de la conversión de AntonV, con el objetivo de reducir el riesgo de cadena de suministro en sus pruebas de integración continua. No se trata de un modelo nuevo ni de un fine-tuning, sino de un checkpoint convertido para que pueda cargarse con `AutoModelForCausalLM` de la librería `transformers`.

Mamba-2 es la evolución de la arquitectura Mamba basada en modelos de espacio de estados (SSM) estructurados. Su contribución central es el marco de "dualidad estado-espacio" (SSD), que demuestra que las capas SSM selectivas son matemáticamente equivalentes a una forma estructurada de atención, lo que permite reutilizar kernels matriciales altamente optimizados (como los de FlashAttention) y entrenar e inferir con un coste computacional lineal respecto a la longitud de secuencia, en lugar del coste cuadrático de la atención estándar.

Es relevante para desarrolladores e investigadores porque ofrece una alternativa práctica a los transformers clásicos con un perfil de memoria y cómputo distinto: el estado recurrente es de tamaño constante, por lo que el coste por token no crece con el contexto. El modelo tiene 1.343.757.312 parámetros en formato safetensors, un repositorio de 2,7 GB y licencia MIT, lo que facilita su uso comercial y su experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (SSM estructurado con dualidad estado-espacio, SSD) |
| Parametros totales | 1.343.757.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de espacio de estados (SSM) puro, sin capas de atención transformer convencionales. Mamba-2 introduce el marco de dualidad estado-espacio (SSD), que reformula la recurrencia selectiva de Mamba como una transformación matricial estructurada semiseparable. Esto permite implementar la capa con multiplicaciones de matrices por bloques, lo que mejora la utilización de tensor cores y reduce el coste de entrenamiento frente a la versión original de Mamba, manteniendo la inferencia con estado recurrente de tamaño fijo y coste lineal por token.

Los detalles de entrenamiento del checkpoint original (número de tokens, composición del corpus, uso de RLHF o DPO) no se especifican en la información proporcionada y deben consultarse en la model card del repositorio `state-spaces/mamba2-1.3b`. Esta conversión concreta solo documenta el proceso de transformación de pesos al formato Transformers, no el entrenamiento. La innovación técnica destacable es precisamente la dualidad SSD y la posibilidad de ejecutar el modelo con kernels optimizados tipo FlashAttention.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` y `model.generate`, tal como muestra el ejemplo de la model card.
- Modelado de secuencias con coste lineal por token gracias al estado recurrente del SSM.
- Compatibilidad con la API estándar de `transformers` (tokenizer y modelo cargables con `from_pretrained`).
- Soporte de inferencia en vLLM, ya que el proyecto lo emplea como checkpoint de CI.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio o modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Experimentación en investigación sobre SSM: permite cargar Mamba-2 en un entorno `transformers` estándar para comparar su comportamiento frente a transformers de tamaño similar sin reescribir el pipeline de entrenamiento o evaluación.
- Procesamiento de secuencias largas con memoria acotada: al mantener un estado recurrente de tamaño constante, es adecuado para tareas donde el coste de la KV cache de un transformer resultaría prohibitivo, como el análisis de documentos extensos o series temporales de texto.
- Inferencia en entornos con presupuesto de VRAM limitado: con 1.300 millones de parámetros, el checkpoint en safetensors ocupa unos 2,7 GB, de modo que cabe en GPUs de consumo con suficiente memoria y permite desplegar servicios de generación de texto de bajo coste.
- Pruebas de integración y CI de infraestructura de serving: el propio proyecto vLLM lo usa como checkpoint de referencia para validar el soporte de arquitecturas SSM en su motor, por lo que es útil para desarrolladores que mantengan backends de inferencia.
- Generación de texto base para prototipos: el ejemplo de la model card (`tokenizer("Hey how are you doing?")` seguido de `model.generate`) sirve como punto de partida para construir demos de generación de texto sin necesidad de infraestructura especializada.
- Evaluación comparativa de arquitecturas: sirve como línea base SSM de 1.300 millones de parámetros frente a transformers de tamaño equivalente en estudios de eficiencia (throughput, latencia, consumo de memoria) a distintas longitudes de secuencia.
- Fine-tuning académico: con licencia MIT y pesos en safetensors, es viable ajustarlo en tareas específicas de dominio en laboratorios con recursos moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 2,7 GB solo para pesos, más el estado recurrente y activaciones; un presupuesto práctico de 4-6 GB es razonable, aunque la cifra exacta no está documentada.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,4 GB para pesos; en 4 bits, alrededor de 0,7 GB. Los tipos de cuantización concretos soportados no están disponibles en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; las RTX 4090, A100 y H100 son adecuadas y permiten mayor paralelismo y throughput.
- GPU de consumo: sí cabe en tarjetas consumer con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4090), siempre que el backend soporte la arquitectura Mamba-2.
- Opciones de despliegue: `transformers` (documentado en la model card) y vLLM (el proyecto lo mantiene como checkpoint de CI). Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mamba2-1.3b-hf (este) | 1.343.757.312 | no disponible | Mamba-2 (SSM/SSD) | MIT | Hugging Face, safetensors |
| state-spaces/mamba2-1.3b | no disponible en la información | no disponible | Mamba-2 (SSM/SSD) | no disponible en la información | Hugging Face (checkpoint original) |
| AntonV/mamba2-1.3b-hf | 1.343.757.312 (misma conversión) | no disponible | Mamba-2 (SSM/SSD) | MIT | Hugging Face (cuenta personal) |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- Es una copia de una conversión de terceros: la model card indica explícitamente que no está afiliada a los autores originales ni a Hugging Face, por lo que la fidelidad respecto al checkpoint original depende del proceso de conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; su adopción y validación por la comunidad son mínimas.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de seguridad; al ser un modelo base de 1.300 millones de parámetros, es esperable un rendimiento limitado en razonamiento complejo y una mayor propensión a errores factuales que modelos mayores.
- Idiomas soportados no disponibles: no hay garantía documentada de calidad en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: aunque la arquitectura SSM escala de forma lineal, no se especifica la ventana efectiva de entrenamiento.
- Compatibilidad de backend limitada: al ser una arquitectura SSM, requiere versiones de `transformers` y de motores de inferencia con soporte específico para Mamba-2; no funcionará en herramientas que solo soporten transformers clásicos.
- Licencia MIT: permite uso comercial y modificación con atribución, pero conviene conservar el aviso de copyright y verificar la licencia del checkpoint original antes de redistribuir.
- Para producción, es recomendable validar el modelo frente al checkpoint original `state-spaces/mamba2-1.3b` y fijar el commit concreto para evitar cambios inesperados.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/vllm-project/mamba2-1.3b-hf
- Conversión original de AntonV: https://huggingface.co/AntonV/mamba2-1.3b-hf
- Checkpoint original de state-spaces: https://huggingface.co/state-spaces/mamba2-1.3b
- Paper de Mamba-2 (Dao y Gu, ICML 2024): "Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality"
