# specklabs/Speck2-140M-GGUF

## Resumen

Speck2-140M es un modelo de lenguaje pequeño desarrollado por specklabs, distribuido en formato GGUF para su uso con llama.cpp. Se trata de un modelo de generación de texto con una arquitectura híbrida que alterna operadores de atención y convolución corta, una combinación poco habitual en modelos de este tamaño. El modelo base declara 140 millones de parámetros, aunque la conversión a GGUF almacena 180 millones debido a la transformación de las capas de adaptación y embeddings, sin que ello suponga un aumento real de capacidad.

La relevancia de este modelo radica en su tamaño reducido, que permite su ejecución en hardware muy limitado, y en su licencia MIT, que facilita su uso comercial sin restricciones. Al estar disponible en cuantizaciones Q4_K_M, Q5_K_M y Q8_0, puede desplegarse en entornos de producción con requisitos mínimos de memoria. No se dispone de información pública sobre su entrenamiento, capacidades específicas o benchmarks, por lo que su evaluación debe basarse en pruebas empíricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Alternancia de atención y convolución corta (LFM2) |
| Parametros totales | 180.160.768 (en GGUF; el modelo base declara 140M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se menciona 4K para Speck1, no para Speck2) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura de Speck2-140M combina capas de atención con capas de convolución de ventana corta, un diseño que busca capturar dependencias locales y globales de forma eficiente. La conversión a GGUF, documentada en la model card, transforma los adaptadores de entrada y salida (de 640 a 768 y viceversa) en matrices separadas, rellena con ceros los canales de convolución de 384 a 768 y ajusta los kernels causales de 3 a 5 taps. Estas transformaciones preservan la función del modelo salvo por el redondeo numérico habitual.

No se ha publicado información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá de la propia arquitectura híbrida.

## Capacidades

No se dispone de una descripción oficial de las capacidades del modelo. Al ser un modelo de generación de texto, se espera que pueda producir texto coherente, pero no hay datos verificados sobre razonamiento, generación de código, matemáticas o soporte de tool calling. La ausencia de benchmarks públicos impide confirmar cualquier habilidad específica.

## Casos de uso

Dado el tamaño reducido y la licencia permisiva, los usos más plausibles son:

- Prototipado rápido de aplicaciones de generación de texto en entornos con recursos limitados, como Raspberry Pi o portátiles sin GPU.
- Experimentación académica con arquitecturas híbridas atención-convolución en modelos pequeños.
- Generación de texto en aplicaciones embebidas donde el consumo de memoria es crítico.
- Fine-tuning sobre dominios específicos con pocos datos, gracias a su bajo número de parámetros.
- Despliegue en edge devices para tareas de autocompletado o asistentes locales.
- Evaluación comparativa de cuantizaciones GGUF en hardware de gama baja.

No obstante, estas aplicaciones son inferencias razonables a partir del tamaño y la licencia, no capacidades confirmadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 112,9 MB, por lo que la inferencia puede ejecutarse con menos de 200 MB de memoria en total.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna, incluidas integradas.
- Opciones de despliegue: llama.cpp, Ollama (si se añade al registro), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles, pero por el tamaño se espera una generación rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar. El modelo Speck1-140M, también de specklabs, comparte arquitectura y tamaño, pero no hay datos que permitan una comparación cuantitativa. Otros modelos de 140M como SmolLM2-135M o Qwen2.5-0.5B podrían ser alternativas, pero no se han encontrado benchmarks que los enfrenten.

## Limitaciones y advertencias

- Al ser un modelo de 140M, su capacidad de razonamiento y conocimiento general es limitada en comparación con modelos de mayor tamaño.
- No se ha documentado el proceso de entrenamiento, por lo que se desconocen posibles sesgos en los datos.
- Riesgo de alucinación: probable, como en cualquier modelo pequeño, especialmente en tareas de conocimiento factual.
- La longitud de contexto no está especificada; se recomienda probar con secuencias cortas.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de evaluar la calidad del modelo para su caso concreto.
- La conversión a GGUF introduce pequeñas diferencias numéricas respecto al modelo original en safetensors.

## Enlaces

- [Speck2-140M-GGUF en Hugging Face](https://huggingface.co/specklabs/Speck2-140M-GGUF)
- [Speck1-140M-GGUF en Hugging Face](https://huggingface.co/specklabs/Speck1-140M-GGUF)
- [Speck1-140M en LLM Explorer](https://llm-explorer.com/model/specklabs%2FSpeck1-140M,4HOVWxyJNScJ5QeHL3zk0u)
