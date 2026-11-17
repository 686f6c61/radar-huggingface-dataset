# windowsxp811203/Qwen3.8-27B-Abliterated

## Resumen

Qwen3.8-27B-Abliterated es un fine-tune del modelo Qwen/Qwen3.8-27B publicado por el usuario windowsxp811203 en Hugging Face. Se trata de una variante "abliterated", es decir, una versión en la que se han aplicado técnicas de modificación de pesos orientadas a eliminar o atenuar los mecanismos de rechazo del modelo original, dando lugar a un modelo "uncensored" con menor tendencia a declinar peticiones. El modelo conserva la arquitectura multimodal del base (pipeline image-text-to-text) y sus 27.781.427.952 parámetros totales según los pesos en safetensors.

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.5, según la etiqueta `qwen3_5` del repositorio, y está orientado a generación de texto y comprensión de imagen-texto. El fine-tune mantiene la licencia Apache 2.0 y los idiomas declarados (inglés y chino), y se distribuye en formato transformers/safetensors con un tamaño de repositorio de 55,6 GB.

Su relevancia es doble: por un lado, ofrece a desarrolladores e investigadores un punto de partida para experimentar con modelos multimodales de ~27B sin las restricciones de alineación del modelo original; por otro, el acceso está restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de descargarlo. No se dispone de información publicada sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 (etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.8-27B, que por las etiquetas del repositorio pertenece a la familia Qwen3.5 y soporta entrada image-text-to-text. Los pesos se publican en safetensors con 27.781.427.952 parámetros, lo que sitúa al modelo en la categoría de ~27B densos (no hay indicios de arquitectura MoE en la información disponible). No se especifican en la ficha detalles sobre el número de capas, dimensión oculta, número de cabezas de atención ni mecanismos de atención lineal o decodificación especulativa.

Respecto al entrenamiento, la información proporcionada no incluye datos sobre el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o similares en el modelo base. La única información relevante sobre el proceso de este fine-tune concreto es su carácter "abliterated": se trata de una modificación de pesos destinada a reducir la negativa del modelo a responder ciertas peticiones, técnica habitualmente implementada mediante la proyección ortogonal de la dirección de rechazo en los pesos. No se detalla la metodología exacta empleada por el autor.

## Capacidades

- Generación de texto conversacional en inglés y chino, con el estilo y capacidades heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo acepta entradas multimodales y genera texto a partir de ellas.
- Modo "uncensored": la abliteración reduce la tasa de rechazos ante peticiones que el modelo original declinaría.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteración comparando sus respuestas con las del Qwen3.8-27B original en conjuntos de prompts sensibles, midiendo la tasa de rechazo antes y después del fine-tune.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que aborde temas que el modelo base podría declinar, aprovechando la reducción de rechazos.
- Procesamiento de documentos con imagen y texto: al ser un modelo image-text-to-text, puede emplearse para extraer y resumir información de capturas, formularios escaneados o figuras combinadas con instrucciones textuales.
- Asistentes conversacionales en inglés y chino: despliegue en aplicaciones de chat multi-turno para usuarios de esos dos idiomas, con la ventaja de que el modelo base está entrenado específicamente para ellos.
- Evaluación comparativa de modelos abliterated: uso como referencia en estudios que comparan distintas técnicas de eliminación de rechazo sobre modelos de ~27B.
- Prototipado de pipelines multimodales: integración vía transformers o endpoints compatibles para experimentar con entrada image-text-to-text antes de invertir en modelos mayores.
- Fine-tuning posterior: al publicarse en safetensors con licencia Apache 2.0, sirve como punto de partida para ajustes adicionales en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781.427.952 parámetros, en FP16 se requieren aproximadamente 55,6 GB solo para los pesos, más memoria para el contexto y las activaciones. En cuantización de 8 bits, en torno a 28-30 GB; en 4 bits, aproximadamente 14-16 GB (estimaciones teóricas, no verificadas con este modelo concreto).
- GPU recomendadas: para FP16, A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB o 2x A6000 de 48 GB). Para cuantizaciones de 4-8 bits, una única RTX 4090 (24 GB) o A6000 puede ser suficiente.
- ¿Cabe en consumer GPU? En FP16 no cabe en ninguna GPU de consumo actual. En cuantización de 4 bits podría caber en una RTX 4090 de 24 GB, siempre que se generen los pesos cuantizados, que no se distribuyen en el repositorio.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según la etiqueta del repositorio. vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible; su viabilidad dependerá de que se publiquen conversiones a GGUF o de que la arquitectura Qwen3.5 esté soportada por esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated (este) | 27,78B | no disponible | Apache 2.0 | Gated en HF | Fine-tune abliterated, multimodal |
| Qwen/Qwen3.8-27B (base) | 27,78B (mismo tamaño según el fine-tune) | no disponible | no disponible en la información | Público en HF | Modelo original alineado, sin abliterar |
| Alternativas abliterated de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con otras alternativas de la misma categoría no puede completarse con datos verificables a partir de la información disponible.

## Limitaciones y advertencias

- La abliteración elimina o reduce los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sexualmente explícito. No es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones específicas para este fine-tune.
- Idiomas limitados a inglés y chino según la ficha; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada: no es posible planificar aplicaciones con ventanas largas sin verificarla empíricamente.
- Licencia Apache 2.0 permite uso comercial, pero el acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- El modelo base Qwen3.8-27B puede tener sus propias condiciones de uso; conviene revisarlas, ya que el fine-tune deriva de él.
- No se dispone de información sobre sesgos específicos, datos de entrenamiento ni evaluaciones de seguridad de este fine-tune.
- El repositorio no incluye variantes cuantizadas, lo que obliga a generarlas localmente para despliegues con VRAM limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados a este fine-tune.
