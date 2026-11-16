# therefineryjsy/GLM-5.3-Flash-RedTeam-EXL3-4bpw-TensorFold

## Resumen

GLM-5.3-Flash-RedTeam-EXL3-4bpw-TensorFold es una cuantización de 4 bits del modelo orcarouter/GLM-5.3-Flash-Uncensored-FP8, publicada por el usuario therefineryjsy en Hugging Face. Se trata de una variante "abliterated" (sin mecanismos de rechazo) y orientada a red-teaming, derivada de la familia GLM-5.3-Flash. El modelo es multimodal de entrada (image-text-to-text) y está empaquetado en formato EXL3 (ExLlamaV3) con una técnica propietaria denominada TensorFold, con un tamaño de repositorio de 89,7 GB.

La relevancia de esta ficha es limitada: el modelo no cuenta con descargas ni interacciones, no dispone de documentación técnica publicada en la información disponible y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. Además, el identificador del modelo base y la fecha de creación (noviembre de 2026) no permiten verificar su procedencia dentro de un linaje público conocido de GLM, por lo que muchos datos técnicos deben marcarse como no disponibles.

La ficha se limita a documentar lo que puede inferirse de las etiquetas y metadatos del repositorio: cuantización de 4 bits, licencia MIT, idiomas inglés y chino, y orientación explícita a pruebas de seguridad ofensiva. No se han publicado resultados de benchmarks ni detalles de arquitectura o entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "glm5_next"; presumiblemente transformer multimodal, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (EXL3, 4bpw); modelo base en FP8 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | EXL3 (ExLlamaV3); modelo base en FP8 |
| Modalidad | image-text-to-text (entrada multimodal) |
| Tecnica de empaquetado | TensorFold (propietaria, sin documentacion publica) |
| Tamano del repositorio | 89,7 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base ni de esta cuantización en la información proporcionada. Las etiquetas sugieren un modelo de la familia GLM (etiquetas "glm5_next", "glm", "glm-5.3-flash") con capacidades multimodales de entrada (image-text-to-text), pero no se confirma si emplea atención estándar, atención lineal, mezcla de expertos (MoE) u otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica declarada es el uso de EXL3 (el motor de inferencia ExLlamaV3) con una cuantización de 4 bits a 4 bits por peso (4bpw) y una técnica denominada "TensorFold", de la que no existe documentación pública en la información disponible. El modelo base declarado es orcarouter/GLM-5.3-Flash-Uncensored-FP8, una variante "uncensored" en FP8, lo que implica que esta cuantización hereda la eliminación de mecanismos de rechazo ("abliterated") del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline "conversational").
- Entrada multimodal de imagen y texto (pipeline "image-text-to-text"): el modelo acepta imágenes junto con prompts de texto.
- Soporte de idiomas inglés y chino (etiquetas "en", "zh").
- Modo "uncensored"/"abliterated": ausencia declarada de mecanismos de rechazo, orientado a red-teaming.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo está etiquetado explícitamente como "red-teaming" y "abliterated", por lo que su uso previsto es generar respuestas sin filtros para identificar vulnerabilidades, sesgos y fallos de alineación en sistemas desplegados. Adecuado por su naturaleza sin censura, pero requiere un entorno controlado.
- Investigación sobre alineación y robustez: comparar las respuestas de esta variante "uncensored" con las de modelos alineados permite estudiar qué comportamientos elimina la abliteración y cómo afecta a la utilidad.
- Pruebas de pipelines multimodales image-text-to-text: al aceptar imágenes y texto, puede emplearse para validar cadenas de procesamiento multimodal en entornos de laboratorio.
- Evaluación de cuantización EXL3 a 4bpw: sirve para medir la degradación de calidad de una cuantización de 4 bits frente al modelo base en FP8, en tareas de generación de texto y descripción de imágenes.
- Despliegue en hardware con memoria limitada: al ser una cuantización de 4 bits, permite ejecutar un modelo de mayor tamaño del que cabría en FP8, aunque el repositorio de 89,7 GB sigue requiriendo hardware de gama alta.
- Experimentación con la técnica TensorFold: para investigadores interesados en evaluar el empaquetado propietario frente a cuantizaciones estándar (GPTQ, AWQ, GGUF).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio ocupa 89,7 GB en formato EXL3 de 4 bits, lo que sugiere que la inferencia requiere al menos ~90 GB de memoria de GPU o reparto entre varias GPU.
- GPU recomendadas: no disponibles de forma oficial. Por el tamaño del repositorio, se requerirían GPU de centro de datos (A100 80 GB, H100 80 GB) o configuraciones multi-GPU; la etiqueta "dgx-spark" sugiere compatibilidad con el ecosistema NVIDIA DGX.
- ¿Cabe en GPU de consumo? No es probable con el tamaño indicado (89,7 GB); no se confirma en la información disponible.
- Opciones de despliegue: ExLlamaV3 (formato EXL3). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia, tamaño o tarea con datos verificables.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": no aplica mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o sesgado. Su uso debe restringirse a entornos de investigación y red-teaming controlados.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- Sin documentación técnica publicada: no hay información sobre arquitectura, entrenamiento, contexto o benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de alucinación: no evaluado; sin datos de benchmarks no puede estimarse.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero la naturaleza "uncensored" del modelo traslada al usuario la responsabilidad legal y ética del contenido generado.
- Técnica TensorFold sin documentación pública: el formato de pesos puede no ser compatible con herramientas estándar de inferencia.
- Fecha de creación (noviembre de 2026) y modelo base no verificable en fuentes públicas: la procedencia y el linaje del modelo no pueden confirmarse.
- Cero descargas y cero interacciones: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/therefineryjsy/GLM-5.3-Flash-RedTeam-EXL3-4bpw-TensorFold
- Modelo base: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
