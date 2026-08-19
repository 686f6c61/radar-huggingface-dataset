# unconst/Affine-5czsc2fc98-r512-offline-dpo-hialpha-hirank-lobeta-midctx-ultraextrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r512-offline-dpo-hialpha-hirank-lobeta-midctx-ultraextrasteps-merged` es un checkpoint fusionado (LoRA-merged) desarrollado por el usuario `unconst` a partir del modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los metadatos, se trata de un modelo de arquitectura MoE (mezcla de expertos) basado en Qwen3.5, con capacidades multimodales de imagen y texto, y orientado a generación de texto y conversación. El nombre del repositorio indica que ha pasado por un proceso de fine-tuning con SFT y DPO (offline), con hiperparámetros específicos (hialpha, hirank, lobeta, midctx, ultraextrasteps), aunque no se proporcionan detalles sobre estos ajustes.

El modelo cuenta con aproximadamente 35.107 millones de parámetros (35,1B) y un tamaño de repositorio de 70,2 GB en formato safetensors. La model card lo describe como un "H1 merged checkpoint salvage", es decir, un checkpoint de rescate privado que no está destinado a ser una versión final hasta que se supere una fase de validación (Stage-5 gate). Esto sugiere que es un artefacto intermedio de un proceso de entrenamiento más amplio, y su relevancia actual radica en ser un punto de control para evaluar el progreso del fine-tuning, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen3.5, con soporte multimodal imagen-texto |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE (mezcla de expertos), como indica el tag `qwen3_5_moe`. Esto implica que solo una fracción de los parámetros se activa por token, lo que permite un rendimiento eficiente en inferencia a pesar del tamaño total. El modelo también está etiquetado como `image-text-to-text`, lo que sugiere que puede procesar entradas multimodales (imágenes y texto) y generar texto, aunque no se especifica el mecanismo exacto (p. ej., si usa un codificador de visión separado o un enfoque totalmente conectado).

El entrenamiento se realizó en dos etapas según el nombre del repositorio: primero un fine-tuning supervisado (SFT) sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, y posteriormente un ajuste con DPO (Direct Preference Optimization) en modo offline. Los términos `hialpha`, `hirank`, `lobeta`, `midctx` y `ultraextrasteps` sugieren una configuración específica de hiperparámetros (alpha, rango de LoRA, beta, longitud de contexto media y pasos de entrenamiento extra), pero no se dispone de documentación que detalle estos valores. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens procesados ni otras innovaciones técnicas.

## Capacidades

- Generación de texto: el modelo está diseñado para tareas de generación de lenguaje natural, como lo indica el pipeline `text-generation`.
- Conversación: el tag `conversational` sugiere que puede mantener diálogos multi-turno, aunque no se especifica la longitud de contexto máxima.
- Procesamiento multimodal: al estar etiquetado como `image-text-to-text`, puede recibir imágenes y texto como entrada y producir texto, lo que habilita tareas como descripción de imágenes o respuesta a preguntas visuales.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en infraestructuras de inferencia estándar (p. ej., vLLM, TGI).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento explícitos.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede integrarse en un chatbot que reciba imágenes del usuario (fotos, capturas de pantalla) y responda con texto, gracias a su capacidad image-text-to-text. Es adecuado para soporte técnico visual o consultas sobre documentos escaneados.
- Generación de descripciones de imágenes: en aplicaciones de accesibilidad o catalogación de contenido, puede generar texto alternativo o metadatos descriptivos a partir de imágenes, aprovechando su naturaleza multimodal.
- Análisis de documentos mixtos: puede procesar documentos que combinan texto e imágenes (informes, presentaciones) para extraer información o resumir contenido, aunque no se especifica la resolución de imagen soportada.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como punto de partida para experimentos de fine-tuning en dominios específicos, dado que ya ha pasado por SFT y DPO.
- Evaluación de pipelines de entrenamiento: investigadores pueden usar este checkpoint para comparar el efecto de los hiperparámetros DPO (hialpha, hirank, etc.) en el rendimiento final, aunque no hay benchmarks públicos.
- Prototipado rápido: para desarrolladores que necesitan un modelo de 35B con capacidades multimodales y no requieren una licencia clara (aunque esto es un riesgo, ver limitaciones), puede usarse en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint concreto. Tampoco se proporcionan comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1B parámetros, en FP16 se necesitan aproximadamente 70 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits, unos 35 GB; en 4 bits, unos 17,5 GB. Estas son estimaciones genéricas, no datos oficiales.
- GPU recomendadas: para FP16 se requieren GPUs de clase profesional como A100 80GB, H100 80GB o A6000 48GB (con cuantización). Para cuantización 4-bit, una RTX 4090 (24GB) podría ser suficiente, pero con limitaciones de contexto.
- En consumer GPU: solo con cuantización agresiva (4-bit) y contexto reducido. No es práctico en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). El tag `endpoints_compatible` sugiere compatibilidad con soluciones de servidor estándar.
- Latencia y throughput: no disponibles. Dependerán del hardware, la cuantización y el número de expertos activos (desconocido).

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y no hay datos de rendimiento para establecer una comparación objetiva con otras alternativas MoE de tamaño similar (p. ej., Mixtral 8x7B, Qwen1.5-MoE-A2.7B, etc.).

## Limitaciones y advertencias

- Checkpoint intermedio: la model card indica explícitamente que es un "salvage" privado y no una versión final. Puede contener artefactos de entrenamiento o no estar optimizado para producción.
- Licencia no especificada: al no indicarse licencia, el uso comercial es legalmente arriesgado. No se puede asumir permisos de uso.
- Sin información de sesgos o alucinaciones: no hay evaluación publicada sobre sesgos, toxicidad o fiabilidad factual. Es probable que herede sesgos de los datos de entrenamiento del modelo base.
- Capacidades multimodales no verificadas: aunque el tag indica image-text-to-text, no se ha demostrado públicamente su funcionamiento ni la calidad de las respuestas visuales.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que limita su uso en tareas que requieran documentos largos.
- Sin soporte de tool calling confirmado: no hay evidencia de que soporte funciones externas o agentes, a pesar de ser un modelo de 35B.
- Fecha de creación futura: el modelo está fechado en 2026, lo que sugiere que puede ser un artefacto experimental de un proyecto en curso, no un lanzamiento estable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r512-offline-dpo-hialpha-hirank-lobeta-midctx-ultraextrasteps-merged
- Checkpoint relacionado (r480): https://huggingface.co/unconst/Affine-5czsc2fc98-r480-offline-dpo-hialpha-hirank-longctx-extrasteps-merged
- Checkpoint relacionado (r32): https://huggingface.co/unconst/Affine-5czsc2fc98-r32-merged
