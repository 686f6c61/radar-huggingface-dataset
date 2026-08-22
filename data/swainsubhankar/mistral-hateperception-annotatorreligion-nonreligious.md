# swainsubhankar/mistral-hateperception-annotatorreligion-nonreligious

## Resumen

El modelo `swainsubhankar/mistral-hateperception-annotatorreligion-nonreligious` es un adaptador LoRA (Low-Rank Adaptation) diseñado para la tarea de anotación de discurso de odio con un enfoque específico en el sesgo religioso, concretamente en la categoría "nonreligious" (no religioso). Fue desarrollado por Subhankar Swain y se publicó en Hugging Face el 21 de agosto de 2026 (aunque la fecha parece futura, corresponde a la información del repositorio). Se basa en el modelo `mistralai/Mistral-7B-Instruct-v0.3`, un transformer decoder de 7.000 millones de parámetros con una ventana de contexto de 32.768 tokens. El adaptador ocupa 0,1 GB y se distribuye en formato PEFT (safetensors).

La relevancia de este modelo radica en su aplicación a la moderación de contenido y al análisis de sesgos en anotaciones humanas y automáticas. Los trabajos académicos recientes (por ejemplo, arXiv 2410.07991 y 2406.11109) señalan que los LLM pueden perpetuar estereotipos religiosos al anotar discurso de odio, y este adaptador parece estar diseñado para mitigar o detectar esos sesgos. Sin embargo, la model card no proporciona detalles sobre el conjunto de datos de entrenamiento, los hiperparámetros ni el proceso de ajuste fino, por lo que muchas especificaciones técnicas permanecen sin documentar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Mistral-7B-Instruct-v0.3 (transformer decoder) |
| Parámetros totales | 7.000 millones (modelo base) + adaptador LoRA de ~0,1 GB (número exacto no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base) |
| Tipos de cuantización | No disponible (el modelo base puede cuantizarse, pero no se especifica para el adaptador) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo Mistral-7B-Instruct-v0.3, un transformador decoder con atención de ventana deslizante (sliding window attention) y una longitud de contexto de 32.768 tokens. La técnica LoRA añade matrices de baja dimensión a las capas de atención y feed-forward, permitiendo un ajuste fino eficiente con pocos recursos. No se dispone de información sobre el conjunto de datos de entrenamiento (composición, número de tokens, si se utilizó RLHF o DPO). El modelo card indica que la librería es PEFT 0.20.0, pero no se especifican hiperparámetros, régimen de entrenamiento (fp16, bf16, etc.) ni el proceso de preparación de datos. No hay documentación sobre si se aplicó alguna técnica de regularización o aumentación para reducir sesgos.

## Capacidades

- Generación de texto: al ser un modelo de generación de texto, puede producir respuestas de clasificación cuando se le solicita, p. ej., etiquetar un texto como odio religioso o no.
- Clasificación de discurso de odio: el adaptador está orientado a la anotación de discurso de odio, especialmente en el ámbito de la religión y la no-religión.
- Uso como anotador automático: puede integrarse en pipelines de anotación de datos para reemplazar o complementar anotadores humanos.
- Multilingüismo: no disponible (no se especifica).
- Tool calling: no disponible (no se menciona en la información).
- Soporte de agentes: no disponible (no se menciona).
- Modo de pensamiento o visión: no disponible (es un modelo de texto puro).

## Casos de uso

- **Moderación de contenido en plataformas sociales**: el modelo puede utilizarse para detectar y etiquetar automáticamente mensajes que contengan discurso de odio hacia personas no religiosas o de otras creencias. Su ventana de contexto de 32k tokens permite procesar hilos largos o conversaciones completas.
- **Investigación sobre sesgos en anotaciones**: se puede emplear para comparar las etiquetas generadas por el modelo con las de anotadores humanos, identificando sesgos religiosos en el proceso de anotación (véase arXiv 2410.07991).
- **Análisis de discurso de odio en entornos académicos**: investigadores en sociología y lingüística pueden usar el adaptador para clasificar grandes volúmenes de textos de foros, redes sociales o noticias, facilitando estudios cuantitativos sobre discriminación religiosa.
- **Sistema de alerta temprana en comunidades online**: el adaptador puede integrarse en sistemas de moderación híbrida, donde las etiquetas del modelo se revisan posteriormente por humanos, reduciendo el esfuerzo de anotación manual.
- **Generación de datasets balanceados**: al anotar automáticamente grandes corpora, se puede crear conjuntos de datos para entrenar otros modelos de detección de odio, controlando la representación de grupos religiosos y no religiosos.
- **Auditoría de sesgos en LLMs**: el adaptador puede usarse para evaluar si un LLM base (por ejemplo, Mistral-7B-Instruct) tiene tendencias a clasificar erróneamente textos relacionados con religión, ayudando a identificar y corregir sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como exactitud, F1, precisión o recall, ni comparaciones con otros anotadores. Tampoco hay datos sobre rendimiento en tareas de clasificación de discurso de odio (p. ej., MMLU, HumanEval, GSM8K) porque el adaptador no está diseñado para esas tareas.

## Requisitos de hardware

- **VRAM estimada**: el adaptador LoRA es ligero (~0,1 GB), pero requiere cargar el modelo base Mistral-7B-Instruct-v0.3 completo. En FP16, el modelo base ocupa aproximadamente 14 GB de VRAM. Con cuantización de 8 bits (bitsandbytes) se reduce a ~7 GB, y con 4 bits a ~4 GB. El adaptador añade un margen despreciable.
- **GPU recomendadas**: 
  - Para FP16: GPU con al menos 16 GB de VRAM (A100 40 GB, RTX 4090 24 GB, L4 24 GB).
  - Para cuantización 4-bit: GPU con 8 GB de VRAM (RTX 3060 12 GB, RTX 3080 10 GB, etc.).
- **Opciones de despliegue**: 
  - **vLLM** para inferencia de alto rendimiento en producción.
  - **llama.cpp** o **Ollama** si se convierte el modelo a GGUF.
  - **Transformers con PEFT** para integración en pipelines de Python.
- **Latencia y throughput**: no disponible. La latencia dependerá del hardware y la cuantización; en una A100, el modelo base Mistral-7B-Instruct tiene un throughput aproximado de 50-100 tokens/s en generación, pero el adaptador no cambia significativamente la velocidad.

## Comparativa con modelos similares

No hay información suficiente para realizar una comparativa directa con otros adaptadores o modelos específicos de anotación de discurso de odio religioso. Se pueden mencionar alternativas genéricas:

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `mistralai/Mistral-7B-Instruct-v0.3` | 7B | 32k | Apache 2.0 | Modelo base, no adaptado a la tarea específica |
| `Hate-speech-CNERG/dehatebert-mono-english` | 0.1B | 512 | MIT | Modelo de clasificación de odio en inglés, no usa LoRA |
| `cardiffnlp/twitter-roberta-base-hate` | 0.1B | 512 | MIT | Especializado en discurso de odio en redes sociales |

Estos modelos son de menor tamaño y no están basados en Mistral-7B, por lo que la comparación no es directa. No se dispone de datos de rendimiento del adaptador frente a estos modelos.

## Limitaciones y advertencias

- **Documentación insuficiente**: la model card no detalla el proceso de entrenamiento, los datos utilizados ni los resultados de evaluación. Esto impide verificar la calidad y robustez del adaptador.
- **Sesgos del modelo base**: Mistral-7B-Instruct-v0.3 puede tener sesgos socioculturales heredados de sus datos de entrenamiento. El adaptador puede amplificar o no corregir estos sesgos, especialmente en temas religiosos.
- **Riesgo de alucinación**: al ser un modelo de generación, puede producir etiquetas o explicaciones incorrectas si se usa en prompts abiertos, aunque su uso previsto es de clasificación.
- **Limitaciones de idioma**: no se especifica qué idiomas soporta. Si el modelo base fue entrenado principalmente en inglés, el rendimiento en otros idiomas será probablemente pobre.
- **Licencia y uso comercial**: al no especificar la licencia, no se puede garantizar la permisividad para uso comercial. Se recomienda contactar al autor o revisar la licencia del modelo base (Apache 2.0) y de los adaptadores.
- **Alcance limitado**: el adaptador está diseñado para la categoría religiosa "no religioso". No es apto para otras categorías de odio (género, raza, etc.) sin un ajuste adicional.
- **Sin evaluación pública**: no hay evidencia de que el modelo haya sido probado en conjuntos de datos estándar, por lo que su rendimiento en el mundo real es desconocido.

## Enlaces

- **Hugging Face**: https://huggingface.co/swainsubhankar/mistral-hateperception-annotatorreligion-nonreligious
- **Perfil del autor**: https://huggingface.co/swainsubhankar
- **Paper relacionado - Sesgos humanos y LLM en anotaciones de discurso de odio**: https://arxiv.org/html/2410.07991v1
- **Paper sobre sesgos en LLMs para anotación de odio**: https://arxiv.org/pdf/2406.11109v5
- **Modelos de Mistral (referencia del modelo base)**: https://mistral.ai/models/
