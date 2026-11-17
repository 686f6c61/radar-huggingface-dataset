# Trey38888/gemma-4-hacking

## Resumen

Trey38888/gemma-4-hacking es un modelo derivado de la familia Gemma 4, publicado en Hugging Face por el usuario Trey38888. Se trata de un fine-tuning de la variante E4B-it (la versión instruida de 4.000 millones de parámetros efectivos, equivalente a un modelo de aproximadamente 7.500 millones de parámetros totales según los pesos en safetensors), según se desprende del nombre de los ficheros GGUF incluidos en el repositorio, que hacen referencia a "gemma-4-E4B-it-ultra-uncensored-heretic". El sufijo "hacking" y las etiquetas "ultra-uncensored" y "heretic" indican que el ajuste fino se ha orientado a eliminar los mecanismos de rechazo y las salvaguardas de alineamiento del modelo original.

El modelo se distribuye principalmente en formato GGUF para su uso con llama.cpp, y conserva las capacidades de visión-lenguaje del Gemma 4 original, como refleja la etiqueta vision-language-model y la presencia de un fichero mmproj (proyección multimodal). El repositorio ocupa 6,4 GB e incluye tanto una cuantización Q4_K_M como un proyector multimodal BF16. No se han publicado descargas ni likes en el momento de la consulta, lo que sugiere un modelo de reciente creación y escasa validación comunitaria.

La relevancia de este modelo es principalmente técnica y de investigación: permite estudiar cómo los fine-tunings dirigidos ("abliteration" o eliminación de rechazos) afectan a las capacidades de un modelo multimodal compacto, y sirve como caso de estudio sobre los límites de las salvaguardas en modelos abiertos. Dado que la model card no documenta licencia, idiomas ni pipeline, cualquier uso en producción exige una verificación previa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4; vision-language-model), inferida del nombre de fichero y etiquetas |
| Parametros totales | 7.518.069.290 (según safetensors) |
| Parametros activos | no disponible (la familia E4B sugiere ~4.000 millones efectivos, pero no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; disponible Q4_K_M y proyector multimodal BF16 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B-it, un transformer multimodal de la familia Gemma 4 que combina un decodificador de lenguaje con un codificador visual y un proyector multimodal (mmproj) para tareas de visión-lenguaje. Los pesos publicados suman 7.518.069.290 parámetros en safetensors, coherente con la nomenclatura E4B (4.000 millones efectivos) de la familia. No se dispone de información sobre la longitud de contexto nativa, la composición del dataset de preentrenamiento original ni el número de tokens empleados.

El ajuste fino se realizó con Unsloth, según declara el autor en la model card, y se convirtió posteriormente a GGUF para su uso con llama.cpp. El nombre de los ficheros ("ultra-uncensored-heretic") indica un entrenamiento orientado a eliminar los rechazos del modelo base, probablemente mediante pares de instrucciones y respuestas sin filtrado o técnicas de abliteration. No se documenta el dataset, el número de pasos, el uso de RLHF/DPO ni ninguna innovación técnica específica más allá del propio proceso de fine-tuning eficiente de Unsloth. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Gemma 4 E4B-it.
- Capacidades de visión-lenguaje: el repositorio incluye un proyector multimodal (mmproj) BF16 y la model card documenta uso con llama-mtmd-cli para modelos multimodales.
- Comprensión de imágenes y respuesta a preguntas visuales, presumiblemente conservadas del modelo base (no verificadas en la información disponible).
- Razonamiento y matemáticas básicas, presumiblemente conservadas del modelo base (no verificadas).
- Generación de código, presumiblemente conservada del modelo base (no verificada).
- Respuestas sin rechazo a instrucciones que el modelo base rechazaría, por el fine-tuning "uncensored".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineamiento y salvaguardas: estudiar cómo el fine-tuning "uncensored" altera la distribución de rechazos de un modelo multimodal compacto, comparando respuestas con el Gemma 4 E4B-it original en un conjunto controlado de prompts.
- Evaluación de robustez de filtros de seguridad: usar el modelo como caso adversario para probar clasificadores de contenido y pipelines de moderación antes de desplegar sistemas basados en Gemma.
- Pruebas de regresión de pipelines llama.cpp: validar la integración de modelos multimodales GGUF con llama-mtmd-cli y el proyector mmproj en entornos de CI, comprobando que la carga de pesos y la inferencia multimodal funcionan correctamente.
- Experimentos de cuantización: comparar la calidad de salida entre Q4_K_M y BF16 en un modelo de ~7.500 millones de parámetros para estudiar el impacto de la cuantización en tareas de visión-lenguaje.
- Docencia e investigación académica: ilustrar en cursos o artículos el funcionamiento de los fine-tunings de "abliteration" y sus efectos medibles sobre las capacidades del modelo base.
- Análisis de sesgos y toxicidad: generar respuestas sin filtro en entornos aislados para auditar sesgos latentes del modelo base y documentar riesgos antes de su uso comercial.
- Prototipado offline en hardware consumer: desplegar el modelo con llama.cpp en una GPU de consumo para experimentar con un VLM compacto sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M de un modelo de ~7.500 millones de parámetros ocupa aproximadamente 4,5-5 GB, más el proyector mmproj BF16; con overhead de contexto, se recomienda al menos 8 GB de VRAM para uso multimodal.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100; cualquier GPU con 8-12 GB o más debería poder ejecutar la cuantización Q4_K_M.
- Cabe en GPU consumer: sí, en GPUs con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); en GPUs de 6-8 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli para texto, llama-mtmd-cli para multimodal), Ollama (si se importa el GGUF), vLLM y TGI (solo con los pesos safetensors, no verificados con este fine-tuning).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Trey38888/gemma-4-hacking | 7.518.069.290 | no disponible | no disponible | safetensors, GGUF | Fine-tuning "uncensored" de Gemma 4 E4B-it; sin benchmarks ni validación comunitaria |
| Gemma 4 E4B-it (modelo base) | ~4.000 millones efectivos (7.500 millones totales, presumiblemente) | no disponible | Gemma Terms of Use (presumible) | safetensors, GGUF | Modelo original con salvaguardas; referencia para comparar el efecto del fine-tuning |
| Gemma 3 4B-it | ~4.000 millones | 128.000 tokens (según documentación pública de Gemma 3) | Gemma Terms of Use | safetensors, GGUF | Generación anterior de la familia; útil como referencia de capacidades multimodales compactas |
| Qwen2.5-VL 3B / 7B | 3.000-7.000 millones | 32.000-128.000 tokens (según variante) | Apache 2.0 (Qwen2.5-VL 3B/7B) | safetensors, GGUF | Alternativa multimodal abierta con licencia permisiva y benchmarks publicados |

La comparativa con Gemma 3 y Qwen2.5-VL se ofrece como referencia de categoría; los datos de estos modelos provienen de documentación pública y no de la información proporcionada sobre este modelo, por lo que deben verificarse antes de usarse en decisiones de producción.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el fine-tuning "ultra-uncensored-heretic" está diseñado para eliminar los rechazos del modelo base, lo que implica un riesgo elevado de generar contenido dañino, ilegal o desinformativo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, el modelo deriva de Gemma, cuyos términos pueden imponer restricciones que el autor no ha documentado.
- Sin benchmarks ni validación: no hay resultados publicados, cero descargas y cero likes, por lo que no existe evidencia comunitaria sobre la calidad o integridad de los pesos.
- Riesgo de degradación por fine-tuning: los ajustes orientados a eliminar rechazos pueden degradar capacidades de razonamiento, código y matemáticas del modelo base; no se han publicado evaluaciones al respecto.
- Riesgo de alucinación: inherente a los modelos de ~4.000 millones efectivos, especialmente en tareas de visión-lenguaje y razonamiento multi-paso; sin datos de evaluación específicos.
- Idiomas y contexto desconocidos: no se documenta la ventana de contexto ni la cobertura lingüística, lo que impide planificar su uso en producción multilingüe o con documentos largos.
- Integridad del repositorio: la model card cita rutas de Hugging Face distintas del ID del repositorio ("deathafteryou/gemma-4-hacking"), lo que sugiere posibles errores de publicación o renombrados; conviene verificar los ficheros antes de descargarlos.
- Uso responsable: cualquier despliegue debe incluir filtros externos de contenido y supervisión humana; no se recomienda su uso en aplicaciones orientadas al público sin auditoría previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Trey38888/gemma-4-hacking
- Unsloth (herramienta de fine-tuning citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime para GGUF): https://github.com/ggml-org/llama.cpp
- Documentación de Gemma (familia base): https://ai.google.dev/gemma/docs
- Repositorio de Gemma en Hugging Face (referencia del modelo base): https://huggingface.co/google/gemma-4-E4B-it
