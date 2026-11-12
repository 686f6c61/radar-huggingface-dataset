# U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-1m-kl-0p01

## Resumen

El modelo `U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-1m-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario U-WIN de Hugging Face. Se trata de una variante especializada orientada a la modalidad image-text-to-text, lo que indica que hereda la capacidad multimodal del modelo base Qwen3.5-9B y la extiende mediante entrenamiento adicional sobre un conjunto de datos propietario denominado "harvey" (con referencias a "calderwood-harkness" en las etiquetas).

El nombre del repositorio revela detalles del proceso de entrenamiento: se empleó predicción del siguiente token (next-token prediction, NTP) sobre aproximadamente 1 millón de ejemplos, con regularización KL (divergencia Kullback-Leibler) configurada en 0,01, y el entrenamiento se realizó exclusivamente sobre "notes" (notes-only), lo que sugiere un corpus de documentos o apuntes. El identificador "r0-r22" podría indicar un rango de iteraciones o rondas de entrenamiento.

Con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones), el modelo se posiciona en la categoría de modelos de tamaño medio-grande, adecuado para despliegues en infraestructura con GPUs de alta gama. La licencia Apache 2.0 permite uso comercial, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. Es relevante para desarrolladores que necesiten un modelo multimodal especializado en generación de texto a partir de imágenes y texto, con un ajuste fino orientado a un dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-9B, un transformer multimodal que procesa entradas de imagen y texto para generar texto. Al ser un full fine-tune, todos los parámetros del modelo base fueron actualizados durante el entrenamiento, a diferencia de las técnicas de ajuste eficiente como LoRA. El pipeline declarado es image-text-to-text, lo que confirma que el modelo conserva la torre de visión y el proyector multimodal del Qwen3.5-9B original, aunque no se dispone de detalles sobre si estos componentes fueron congelados o también ajustados.

El entrenamiento se realizó con predicción del siguiente token (NTP) sobre un conjunto de datos denominado "harvey" (con referencias a "calderwood-harkness"), compuesto exclusivamente por "notes" (notes-only), con aproximadamente 1 millón de ejemplos y una regularización KL de 0,01. La regularización KL sugiere que se utilizó una pérdida auxiliar para mantener la distribución de salida del modelo ajustado cercana a la del modelo base, una técnica habitual para preservar capacidades generales y evitar el olvido catastrófico durante el ajuste fino. No se dispone de información sobre la composición exacta del dataset, el número total de tokens procesados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen y texto (image-text-to-text), heredada del modelo base Qwen3.5-9B.
- Razonamiento y generación de lenguaje natural en formato conversacional (etiqueta "conversational").
- Procesamiento de documentos o apuntes ("notes") como dominio principal de especialización, según el nombre del repositorio.
- Capacidad multimodal: interpretación de imágenes junto con instrucciones textuales para producir respuestas.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la ficha).
- Modo "thinking" o razonamiento extendido: no confirmado.
- Capacidades de audio: no disponibles.

## Casos de uso

- **Extracción de información de documentos escaneados**: el modelo puede recibir una imagen de un documento (factura, formulario, apunte) junto con una instrucción textual y generar un resumen o extraer campos concretos, gracias a su pipeline image-text-to-text y a su especialización en "notes".
- **Asistente de estudio sobre apuntes**: dado que el ajuste se realizó exclusivamente sobre "notes", el modelo es adecuado para responder preguntas, generar resúmenes o explicar conceptos a partir de imágenes de apuntes o páginas de libros, integrándose en una aplicación de estudio.
- **Digitalización y transcripción semántica**: conversión de imágenes de notas manuscritas o impresas en texto estructurado y coherente, útil en flujos de archivo y gestión documental.
- **Generación de descripciones de imágenes técnicas**: el modelo puede describir diagramas, esquemas o figuras acompañadas de texto, lo que resulta útil en documentación técnica y manuales.
- **Atención al cliente con soporte visual**: en un chatbot que reciba capturas de pantalla o fotos de productos, el modelo puede interpretar la imagen y responder en formato conversacional, aprovechando la herencia del Qwen3.5-9B.
- **Prototipado de aplicaciones multimodales**: al estar disponible en formato transformers con safetensors y ser compatible con endpoints, puede desplegarse en entornos de inferencia estándar para validar ideas de producto que requieran entrada de imagen y salida de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 9,65 mil millones de parámetros, en precisión FP16 se requieren aproximadamente 19,3 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB de VRAM para FP16. En cuantización de 8 bits, alrededor de 10-12 GB; en 4 bits, alrededor de 6-7 GB (estimaciones teóricas, no verificadas para este modelo concreto).
- **GPU recomendadas**: A100 (40/80 GB), H100 (80 GB) para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 ajustado o cuantización 8 bits; RTX 3090 (24 GB) similar.
- **¿Cabe en consumer GPU?**: sí, en GPUs de 24 GB como RTX 4090 o RTX 3090 en FP16 con cuidado en la longitud de contexto, o en GPUs de 12-16 GB si se aplica cuantización (no se han publicado pesos GGUF oficiales, por lo que la cuantización requeriría conversión manual).
- **Opciones de despliegue**: transformers (librería declarada), endpoints compatibles (etiqueta "endpoints_compatible"); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- **Latencia y throughput estimados**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-1m-kl-0p01 | 9,65 B | No disponible | Image-text-to-text | Apache 2.0 | Gated |
| Qwen/Qwen3.5-9B (modelo base) | ~9 B | No disponible | Image-text-to-text | No disponible en la información | No disponible |
| Alternativas multimodales de ~9 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría y tamaño para establecer una comparativa detallada con datos verificados.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es gated; es necesario aceptar condiciones en Hugging Face antes de descargarlo, lo que puede retrasar su integración en pipelines automatizados.
- **Riesgo de sobreajuste al dominio "notes"**: al haberse entrenado exclusivamente sobre un corpus de apuntes, el rendimiento fuera de ese dominio puede degradarse respecto al modelo base, a pesar de la regularización KL.
- **Sesgos**: no se dispone de información sobre la composición del dataset ni sobre evaluaciones de sesgo; es probable que herede los sesgos del modelo base Qwen3.5-9B y del corpus "harvey".
- **Alucinación**: no se han publicado evaluaciones de fidelidad; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de extracción de información de imágenes.
- **Idiomas**: no se especifican los idiomas soportados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos de los presentes en el corpus de entrenamiento.
- **Contexto**: se desconoce la longitud máxima de contexto efectiva, lo que impide garantizar el procesamiento de documentos largos o conversaciones multi-turno extensas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el acceso gated y la falta de documentación sobre el dataset de entrenamiento pueden plantear riesgos legales o de cumplimiento en producción.
- **Madurez**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-1m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
