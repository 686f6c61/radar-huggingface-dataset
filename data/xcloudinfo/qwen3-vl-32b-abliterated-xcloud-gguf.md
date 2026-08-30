# xCloudinfo/Qwen3-VL-32B-Abliterated-xCloud-GGUF

## Resumen

Qwen3-VL-32B-Abliterated-xCloud-GGUF es una versión cuantizada en formato GGUF del modelo Qwen/Qwen3-VL-32B-Instruct, modificada mediante la técnica de abliteration (ortogonalización de la dirección de rechazo) para reducir el comportamiento de "sobre-rechazo" ante solicitudes legítimas pero sensibles. El modelo es desarrollado por xCloudinfo (云碩科技) y se distribuye bajo licencia Apache-2.0. Su propósito principal es servir a la investigación en seguridad, red teaming y estudios de alineación, ofreciendo una alternativa con menor tasa de rechazo sin reentrenamiento.

El modelo conserva las capacidades multimodales del modelo base (comprensión de imágenes y texto) e incluye el proyector visual (mmproj) en formato GGUF. Se ofrecen cuatro niveles de cuantización (Q8_0, Q6_K, Q5_K_M y Q4_K_M) además del proyector f16, lo que permite su ejecución en hardware de consumo con llama.cpp. La abliteration se aplica únicamente sobre la dirección de rechazo extraída de la capa 28 del modelo, preservando el resto de pesos y, por tanto, las capacidades originales del instruct model.

El modelo está pensado para entornos donde el rechazo excesivo del modelo base limita su utilidad práctica, como auditorías de seguridad, análisis de contenido o pruebas de robustez. No obstante, el autor advierte explícitamente que la abliteration no elimina todos los comportamientos de seguridad y que el modelo hereda la visión del mundo y los sesgos del modelo base chino, por lo que su uso debe ser responsable y legal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3-VL-32B-Instruct |
| Parametros totales | 32.762.123.264 (≈32,7 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (más proyector visual mmproj-f16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen3-VL-32B-Instruct y aplica el método de abliteration descrito por Arditi et al. (2024) en *"Refusal in LLMs is mediated by a single direction"*. Este método identifica una dirección en el espacio de activaciones residuales asociada al comportamiento de rechazo y la ortogonaliza respecto a los pesos de salida, de modo que el modelo deja de activar esa vía de forma refleja. En esta implementación concreta, la dirección se extrae de la capa 28 (la que mostró una señal más limpia) y se aplica sobre los embeddings y las proyecciones o_proj y down_proj de todas las capas.

No se realiza ningún reentrenamiento ni ajuste fino adicional. La modificación es puramente algebraica sobre los pesos existentes, por lo que las capacidades generales del modelo base (razonamiento, comprensión visual, generación de texto) se mantienen intactas. El proyector visual (mmproj) también se incluye en formato f16, conservando la capacidad de procesar imágenes. El autor indica que la salida en chino tradicional se ha verificado y no sufre degradación tras la cuantización.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, generando texto como salida (image-text-to-text).
- Generación de texto en chino e inglés con calidad equivalente al modelo base instruct.
- Conversación multi-turno: al ser un instruct model, mantiene la capacidad de mantener diálogos contextuales.
- Comprensión visual: descripción de imágenes, respuesta a preguntas visuales (VQA) y razonamiento sobre contenido gráfico.
- Menor tasa de rechazo ante solicitudes sensibles o de doble uso, en comparación con el modelo original (reducción de ~10/10 a ~1/10 en un test de 10 preguntas de daño severo).
- Compatible con llama.cpp y llama-server, incluyendo la carga del proyector visual mediante `--mmproj`.
- No se documentan capacidades explícitas de tool calling, function calling o modo agente en la información disponible.

## Casos de uso

- Investigación en seguridad y red teaming: el modelo permite probar escenarios de ataque o vulnerabilidades sin que el rechazo automático bloquee la interacción, facilitando la identificación de fallos de alineación en sistemas multimodales.
- Auditoría de contenido y moderación: al reducir el rechazo, se puede analizar cómo responde el modelo ante contenido sensible o controvertido, ayudando a calibrar filtros y políticas de uso.
- Evaluación de alucinaciones en modelos multimodales: al poder explorar preguntas que el modelo base rechazaría, se pueden estudiar los límites factuales del sistema en contextos visuales y textuales.
- Generación de descripciones de imágenes (captioning) en entornos locales: con la cuantización Q4_K_M (~19,8 GB) y el proyector mmproj, se puede ejecutar en una GPU de consumo para producir descripciones automáticas de imágenes sin depender de servicios en la nube.
- Respuesta a preguntas visuales (VQA) en investigación académica: el modelo puede usarse como herramienta de referencia en estudios comparativos de modelos de visión-lenguaje, gracias a su licencia Apache-2.0 y su disponibilidad en formato GGUF.
- Pruebas de robustez en sistemas de diálogo: su menor tasa de rechazo permite evaluar cómo un asistente conversacional maneja solicitudes ambiguas o de doble uso, información útil para diseñar salvaguardas en producción.
- Despliegue local en entornos sin conexión: al ser GGUF, se puede integrar en aplicaciones de escritorio o servidores privados con llama.cpp, sin necesidad de conexión a internet ni servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única métrica reportada es una prueba interna de 10 preguntas de daño severo (held-out), donde el modelo original rechaza ~10/10 y esta versión abliterated en cuantización Q4_K_M rechaza ~1/10. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- Inferencia con Q4_K_M (19,8 GB): requiere aproximadamente 20-22 GB de VRAM. Cabe en una RTX 3090, RTX 4090 o A6000 de 24 GB.
- Inferencia con Q5_K_M (23,2 GB): similar al anterior, necesita ~24 GB de VRAM; una RTX 4090 o A6000 es suficiente.
- Inferencia con Q6_K (26,9 GB): requiere ~28 GB de VRAM, por lo que necesita una GPU con más de 28 GB (p. ej., A100 40 GB, RTX A6000 48 GB) o dos GPUs en paralelo.
- Inferencia con Q8_0 (34,8 GB): requiere ~36 GB de VRAM; solo es viable en GPUs de 40 GB o más, como A100 40 GB, H100 o configuraciones multi-GPU.
- El proyector visual mmproj-f16 (1,2 GB) se carga adicionalmente en memoria; debe tenerse en cuenta en el total de VRAM.
- Despliegue recomendado con llama.cpp (llama-cli o llama-server). También puede usarse con otros motores que soporten GGUF y mmproj, aunque no se documentan alternativas en la model card.
- Latencia y throughput: no disponibles. Dependen de la GPU, la cuantización y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Tasa de rechazo (test 10 preguntas) | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-32B-Instruct (base) | ~32,7B | safetensors | Apache-2.0 | ~10/10 | Modelo original de Alibaba, rechazo elevado ante contenido sensible |
| Qwen3-VL-32B-Abliterated-xCloud-GGUF | ~32,7B | GGUF | Apache-2.0 | ~1/10 (Q4_K_M) | Versión abliterated con menor rechazo, conserva visión |
| Otros modelos abliterated de la comunidad | Variable | Variable | Variable | No disponible | Existen variantes abliterated de otros modelos (p. ej., Llama, Mistral), pero no hay datos comparativos directos |

La principal diferencia con el modelo base es la reducción del rechazo. No se dispone de comparativas con otros modelos multimodales de tamaño similar en términos de rendimiento estándar.

## Limitaciones y advertencias

- Sesgos heredados: el modelo conserva la visión del mundo, las posturas políticas y los juicios de valor del modelo base Qwen3-VL, desarrollado por Alibaba en China. La abliteration no modifica estos aspectos.
- Riesgo de alucinación: no se han evaluado formalmente las tasas de alucinación; como cualquier LLM, puede generar información falsa o inventada, especialmente en contextos visuales complejos.
- Alcance limitado de la abliteration: la técnica elimina una dirección de rechazo concreta, pero no garantiza la eliminación de todos los comportamientos de seguridad. El autor advierte que no debe considerarse un modelo "sin restricciones".
- Idiomas: solo chino e inglés. No hay soporte para otros idiomas, incluido el español.
- Longitud de contexto: no se especifica; se recomienda consultar la documentación del modelo base Qwen3-VL-32B-Instruct para conocer el límite real.
- Responsabilidad legal: el autor declina cualquier responsabilidad por usos indebidos. El modelo solo debe emplearse para fines legales y éticos (investigación, red teaming, etc.).
- Compatibilidad: al ser GGUF, la inferencia está limitada a motores que soporten este formato (llama.cpp, Ollama, etc.). No es directamente utilizable con bibliotecas como transformers o vLLM sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/Qwen3-VL-32B-Abliterated-xCloud-GGUF
- Modelo base (Qwen3-VL-32B-Instruct): https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2407.15561
- Página del modelo en FriendliAI (API): https://friendli.ai/models/xCloudinfo/Qwen3-VL-32B-Abliterated-xCloud
- Ficha en LLM Explorer: https://llm-explorer.com/model/xCloudinfo%2FQwen3-VL-32B-Abliterated-xCloud,4pb1WLbu3kdMoiz2XRPZww
