# xCloudinfo/Qwen3-VL-32B-Abliterated-xCloud-GGUF

## Resumen

Qwen3-VL-32B-Abliterated-xCloud-GGUF es una versión modificada del modelo vision-language Qwen3-VL-32B-Instruct de Alibaba Qwen, publicada por xCloudinfo (云碩科技) en formato GGUF. La modificación consiste en una "abliteration": la ortogonalización del vector de dirección de rechazo en los pesos que escriben en el flujo residual, siguiendo el método de Arditi et al. (2024), sin reentrenamiento. El objetivo declarado es reducir los rechazos reflejos ante peticiones duales legales pero sensibles, manteniendo las capacidades originales del modelo base, incluida la comprensión de imágenes.

El modelo conserva la arquitectura y los 32.762.123.264 parámetros del Qwen3-VL-32B-Instruct original, un transformer multimodal con torre visual y proyector `mmproj` separado. Se distribuye exclusivamente en cuantizaciones GGUF (Q8_0, Q6_K, Q5_K_M y Q4_K_M), lo que lo hace desplegable en llama.cpp y entornos de inferencia local, con un tamaño de repositorio de 134,9 GB que incluye todas las variantes.

Su relevancia actual reside en dos factores: por un lado, ofrece una alternativa práctica para investigadores de seguridad, red teaming y moderación de contenido que necesitan un modelo con menor tasa de rechazo; por otro, mantiene la licencia Apache-2.0 del modelo base, lo que facilita su uso comercial y su integración en pipelines privados sin depender de API externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (base Qwen3-VL-32B-Instruct), con torre visual y proyector `mmproj` |
| Parametros totales | 32.762.123.264 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (34,8 GB), Q6_K (26,9 GB), Q5_K_M (23,2 GB), Q4_K_M (19,8 GB); proyector visual en f16 (1,2 GB) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con `mmproj` f16 separado para vision) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-32B-Instruct, un transformer multimodal de aproximadamente 32,8 mil millones de parámetros que procesa entradas de imagen y texto. La adaptación de xCloudinfo no implica entrenamiento adicional: se aplica abliteration mediante la extracción de una única dirección de rechazo en la capa 28, elegida por ser la que produce una dirección más limpia según la medición del autor. Esa dirección se ortogonaliza en la matriz de embeddings y en las proyecciones `o_proj` y `down_proj` de todas las capas, es decir, en los pesos que escriben en el flujo residual.

El método sigue el trabajo de Arditi et al. (2024), "Refusal in LLMs is mediated by a single direction", que sostiene que el comportamiento de rechazo está mediado por una dirección lineal identificable en el espacio de activaciones. Al eliminar esa dirección de los pesos, se reduce la probabilidad de rechazo sin reentrenar ni alterar el resto de capacidades. La torre visual y el proyector se conservan intactos, y el autor afirma que la comprensión de imágenes permanece al nivel del modelo base. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo original ni sobre la composición exacta del dataset, ya que la model card no los detalla.

## Capacidades

- Generación de texto conversacional en chino e inglés, con salida verificada en chino tradicional sin degradación por la cuantización.
- Comprensión de imágenes (image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico, siempre que se cargue el archivo `mmproj` correspondiente.
- Razonamiento multimodal: combinación de contexto textual e imagen en una misma conversación.
- Reducción de rechazos reflejos ante peticiones duales legales pero sensibles, con una tasa medida de aproximadamente 1/10 en un conjunto de 10 prompts de daño severo, frente a 10/10 del modelo original.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, heredada del modelo Instruct base.
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta variante; debe verificarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la model card de esta variante.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad y red teaming: el modelo permite probar escenarios de prompt injection, jailbreak y contenido dual sin que el sistema rechace sistemáticamente las peticiones, lo que facilita la evaluación de defensas y la documentación de vectores de ataque en entornos autorizados.
- Moderación de contenido y análisis de políticas: al reducir el rechazo reflejo, puede clasificar y describir contenido sensible (discurso de odio, material violento) con fines de etiquetado y auditoría, tarea que el modelo Instruct original bloquearía con frecuencia.
- Análisis de imágenes en entornos privados: con el `mmproj` cargado, permite procesar capturas, documentos escaneados o imágenes médicas no publicables en la nube, manteniendo los datos en infraestructura local gracias al formato GGUF y a llama.cpp.
- Asistencia documental bilingüe chino-inglés: extracción de información de informes, contratos o manuales técnicos con contenido visual (tablas, diagramas), con salida en chino tradicional verificada.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (19,8 GB) permite ejecutar un modelo de 32B multimodal en una GPU de 24 GB, útil para prototipos y demos sin infraestructura de centro de datos.
- Evaluación comparativa de técnicas de alineación: sirve como referencia para medir el impacto de la abliteration en benchmarks de capacidad y seguridad, comparando contra el modelo base en las mismas condiciones de cuantización.
- Generación de contenido creativo sin fricción: escritura de ficción con temáticas sensibles (violencia, terror, drama psicológico) donde el modelo base tiende a rechazar o suavizar en exceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una métrica propia de tasa de rechazo sobre un conjunto held-out de 10 preguntas de daño severo:

| Modelo | Tasa de rechazo (10 prompts de daño severo) |
|---|---|
| Qwen3-VL-32B-Instruct original | ~10/10 |
| Qwen3-VL-32B-Abliterated-xCloud (Q4_K_M) | ~1/10 |

No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de benchmarks multimodales para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB para Q4_K_M, 23 GB para Q5_K_M, 27 GB para Q6_K y 35 GB para Q8_0, más 1,2 GB adicionales del proyector `mmproj` cuando se usa visión.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí, Q4_K_M en una RTX 4090 o RTX 3090 de 24 GB; Q5_K_M requiere ajustar el contexto o usar offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) es el soporte principal documentado; también es compatible con frontends que consumen GGUF como Ollama o LM Studio, aunque no se confirma explícitamente en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-VL-32B-Abliterated-xCloud-GGUF | 32,8B | No disponible | Si (`mmproj`) | Apache-2.0 | GGUF | Abliterated, rechazo reducido |
| Qwen/Qwen3-VL-32B-Instruct | 32,8B | No disponible | Si | Apache-2.0 | Safetensors, GGUF | Modelo base, rechazo alto (~10/10) |
| Qwen3-VL-32B-Instruct (otras abliterations de la comunidad) | 32,8B | No disponible | Si | Apache-2.0 | GGUF | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes en la misma categoría (por ejemplo, modelos vision-language de 30B con abliteration), por lo que la comparativa se limita al modelo base y a variantes de la misma familia.

## Limitaciones y advertencias

- La abliteration de una sola dirección no elimina todos los comportamientos de seguridad; el autor lo advierte explícitamente. El modelo puede seguir rechazando algunas peticiones y, en otros casos, producir contenido sensible sin filtro.
- El uso está restringido por el autor a fines legales: investigación de seguridad autorizada, red teaming, moderación de contenido y academia. El usuario asume toda la responsabilidad legal y ética; el publicador no respalda usos indebidos.
- El modelo hereda la visión del mundo, posiciones políticas y afirmaciones fácticas del Qwen3-VL base, de origen chino. La abliteration no modifica esos sesgos, que pueden aflorar en temas geopolíticos, históricos o de actualidad.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable un comportamiento similar al del modelo base, sin datos específicos.
- Idiomas: solo chino e inglés declarados; el rendimiento en castellano u otros idiomas no está verificado y puede degradarse.
- Longitud de contexto: no especificada en la model card; conviene consultar la del modelo base antes de diseñar aplicaciones con contextos largos.
- La licencia Apache-2.0 permite uso comercial, pero las restricciones de uso del autor y la responsabilidad sobre contenido generado deben evaluarse en cada despliegue.
- Al ser una modificación no oficial del modelo base, no cuenta con el respaldo de Alibaba Qwen ni con garantías de mantenimiento o actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/Qwen3-VL-32B-Abliterated-xCloud-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Perfil del autor: https://hf.co/xCloudinfo
- Paper del método de abliteration (Arditi et al., 2024): no disponible como enlace en la información proporcionada
