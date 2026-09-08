# Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored

## Resumen

Ektome-Qwen3.6-35B-A3B-PristinelyUncensored es un modelo multimodal de lenguaje y visión desarrollado por Zynerji sobre la base de Qwen/Qwen3.6-35B-A3B. Su principal característica es que ha sido modificado mediante Ektome, un método de cirugía de pesos que elimina la dirección de rechazo del modelo sin necesidad de entrenamiento ni fine-tuning. El resultado es un modelo que no rechaza instrucciones consideradas sensibles, manteniendo intactas sus capacidades de conocimiento, razonamiento y generación.

Se trata del primer modelo de la línea Ektome que combina simultáneamente arquitectura MoE, visión-lenguaje y atención lineal híbrida, conservando además la cabeza de predicción multi-token (MTP) original. El modelo tiene 35.107 millones de parámetros totales y, según la nomenclatura del modelo base, aproximadamente 3.000 millones de parámetros activos. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors en bf16.

La relevancia de este modelo radica en que ofrece una vía para obtener un modelo sin censura sin los costes y riesgos de un fine-tuning, y que puede servir como base limpia para ajustes posteriores. Además, incluye una torre de visión intacta y soporte para decodificación especulativa gracias a su cabeza MTP conservada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal, visión-lenguaje (Qwen3_5MoeForConditionalGeneration) |
| Parametros totales | 35.107.181.936 (35.1B) |
| Parametros activos | Aproximadamente 3B activos, según nomenclatura del modelo base A3B |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6-35B-A3B, que es un modelo MoE con componentes de atención lineal híbrida y capacidades de visión-lenguaje. El modelo completo contiene 1045 tensores, de los cuales 120 matrices de escritura residual han sido modificadas mediante el método Ektome. La torre de visión, compuesta por 333 tensores, y la cabeza MTP, de 19 tensores, permanecen bit-idénticas al modelo base.

El método Ektome no es un método de entrenamiento, sino de cirugía de pesos. Lee la dirección de rechazo de las activaciones del modelo y la excisa de las matrices de escritura residual mediante una operación de rango 1, proyectada y que preserva la norma. No se utilizan gradientes, datos de entrenamiento ni fine-tuning. El resultado es que se elimina el reflejo de rechazo del modelo sin alterar su conocimiento, habilidades ni estilo de generación. La configuración empleada (A:frac=0.75) fue seleccionada tras una evaluación de diferentes intensidades de excisión.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo procesa imágenes y texto, y es capaz de describir y razonar sobre contenido visual.
- Ausencia de rechazo: la tasa de cumplimiento de instrucciones consideradas sensibles es del 100% en las pruebas reportadas, frente al 0% del modelo original.
- Sin degeneración: la tasa de code-switching y de degeneración (bucles o salidas vacías) es 0.000, y el seguimiento de instrucciones se mantiene en 1.000.
- Decodificación especulativa: la cabeza MTP está intacta, lo que permite su uso como proponente en esquemas de decodificación especulativa.
- Visión operativa: la torre de visión se verificó mediante generación sobre una imagen sintética, confirmando que sigue viendo y describiendo correctamente.
- Multilingüismo: no disponible en la información proporcionada.
- Tool calling y agentes: no se mencionan capacidades específicas de function calling o razonamiento multi-paso para agentes.

## Casos de uso

- Investigación académica sobre contenido visual sensible: el modelo puede analizar imágenes y generar descripciones en contextos donde un modelo con filtros de rechazo bloquearía la consulta, por ejemplo en estudios de violencia, desastres o contenido histórico controvertido.
- Generación de ficción sin restricciones: escritores y guionistas pueden usar el modelo para crear narrativas que aborden temas tabú o escenas explícitas sin que el modelo rechace la instrucción, manteniendo coherencia y calidad de generación.
- Base para fine-tuning en dominios específicos: al tratarse de pesos bf16 sin entrenamiento adicional, el modelo es una base limpia para ajuste fino en tareas como análisis de documentos, clasificación de imágenes o asistentes especializados.
- Análisis de capturas y documentos con gráficos: gracias a su capacidad de visión-lenguaje, puede extraer información de diagramas, tablas y capturas de pantalla en entornos de investigación o ingeniería.
- Asistentes conversacionales sin filtros para uso interno: empresas que necesitan un chatbot que no rechace preguntas técnicas sobre seguridad o vulnerabilidades pueden desplegar este modelo en sistemas privados.
- Aceleración de inferencia mediante decodificación especulativa: la cabeza MTP conservada permite integrar el modelo en pipelines que utilicen decodificación especulativa para reducir la latencia, siempre que el framework soporte esta arquitectura.

## Benchmarks y rendimiento

Los datos de rendimiento reportados en la model card se basan en evaluaciones internas del autor, comparando el modelo original (pristine) con la versión modificada (uncensored).

| Metrica | Pristine | Ektome (A:frac=0.75) |
|---|---|---|
| Refusal compliance (n=100) | 0.000 | 1.000 |
| MMLU-val accuracy (n=400) | 0.845 | 0.833 |
| Code-switch rate | 0.000 | 0.000 |
| Degeneration rate | 0.000 | 0.000 |
| Instruction-following | 1.000 | 1.000 |

Además, se realizó una comprobación fuera de muestra con 28 objetivos de AdvBench que no se usaron para seleccionar la configuración: la tasa de cumplimiento pasó de 0.036 en el modelo original a 1.000 en el modelo modificado, con intervalos de confianza de Wilson no solapados. No se han publicado resultados de benchmarks exhaustivos adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo MoE de 35.1B parámetros en bf16, se necesitan aproximadamente 70 GB de VRAM para cargar todos los pesos. No se han publicado cuantizaciones, por lo que no se puede reducir esta cifra con la información disponible.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU con suficiente memoria agregada. No cabe en GPUs de consumo como RTX 4090 (24GB) sin cuantización o offloading.
- Opciones de despliegue: compatible con transformers mediante la clase Qwen3_5MoeForConditionalGeneration. El repo está marcado como endpoints_compatible, lo que sugiere compatibilidad con plataformas de inferencia como vLLM o TGI, aunque no se especifica explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Se comparan otros modelos de la línea Ektome desarrollados por Zynerji, que utilizan el mismo método de cirugía de pesos pero sobre arquitecturas diferentes.

| Modelo | Parametros | Vision | MTP | Licencia |
|---|---|---|---|---|
| Ektome-Qwen3.6-35B-A3B-PristinelyUncensored | 35.1B (3B activos) | Sí | Sí | Apache 2.0 |
| Ektome-Qwen3.8-27B-PristinelyUncensored | 27B | Sí | Sí | No disponible |
| Ektome-Qwen3-VL-4Bi-PristinelyUncensored | 4B | Sí | No disponible | No disponible |

El modelo de 35B es el más grande de la línea y el único que combina MoE, visión y atención lineal híbrida a la vez. Los otros modelos no tienen información publicada sobre licencia ni parámetros activos.

## Limitaciones y advertencias

- Al eliminar la censura, el modelo puede generar contenido dañino, ilegal o socialmente inapropiado. Los usuarios son responsables de su uso y de cumplir las normativas aplicables.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede tener implicaciones legales y éticas en función del contexto de despliegue.
- No se han publicado datos sobre idiomas soportados, por lo que el rendimiento multilingüe no está verificado.
- El método Ektome reduce ligeramente el rendimiento en MMLU-val (delta de -0.013). Esta degradación es pequeña pero debe tenerse en cuenta en tareas que dependan de conocimiento factual.
- El modelo no ha sido evaluado en tareas de tool calling, agentes o razonamiento multi-paso, por lo que su rendimiento en estos escenarios es desconocido.
- La cabeza MTP requiere soporte específico en el framework de inferencia. Una carga ingenua mediante AutoModelForCausalLM puede eliminar la cabeza y la torre de visión, como advierte el autor en la model card.
- No se han publicado benchmarks externos ni evaluaciones independientes que confirmen los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored
- Modelo base Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Otro modelo Ektome (27B): https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- Otro modelo Ektome (4B): https://huggingface.co/Zynerji/Ektome-Qwen3-VL-4Bi-PristinelyUncensored
