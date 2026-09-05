# twokings22/lcgemma-banking77

## Resumen

El modelo `lcgemma-banking77`, desarrollado por `twokings22`, es un ajuste fino (fine-tuning) sobre el modelo base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits de Gemma 3 4B Instruct. El nombre del repositorio y la etiqueta `banking77` sugieren un entrenamiento orientado al conjunto de datos Banking77, un estándar de clasificación de intenciones en el sector bancario. El modelo ha sido publicado con licencia Apache 2.0 y, según los metadatos, solo soporta inglés.

El entrenamiento se realizó con la librería `Unsloth`, que, según la model card, permitió entrenar el modelo dos veces más rápido. No se han publicado resultados de evaluación ni detalles sobre el conjunto de datos o el procedimiento de ajuste, por lo que el rendimiento real no puede verificarse a partir de la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base: Gemma 3 4B Instruct) |
| Parametros totales | 4 mil millones (4B), basado en Gemma 3 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (BNB) en el modelo base; no disponible para el adaptador |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (el repositorio ocupa 0.2 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B Instruct: un transformer causal (decoder-only) con atención multi-query y optimizaciones de memoria propias de la familia Gemma 3. El fine-tuning se hizo con `Unsloth` sobre una versión del modelo base previamente cuantizada a 4 bits mediante `bitsandbytes`. Según la model card, esta técnica redujo el tiempo de entrenamiento a la mitad. No se ha proporcionado información sobre el número de tokens, la composición del dataset ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y seguimiento de instrucciones heredados del modelo base Gemma 3 4B Instruct, con soporte declarado para inglés.
- No se han publicado evaluaciones específicas para este fine-tuning; las capacidades reales en tareas bancarias no están confirmadas.
- No se han encontrado en la información disponible indicios de soporte para tool calling, agentes, visión o audio.

## Casos de uso

Los casos de uso siguientes se plantean como potenciales, basados en el nombre del modelo y su base sobre Gemma 3; no hay resultados publicados que confirmen su idoneidad.

- Atención al cliente bancaria: el modelo podría integrarse en un chatbot para clasificar la intención de consultas frecuentes (saldos, transferencias, tarjetas). Su entrenamiento con `banking77` lo haría potencialmente adecuado, aunque sin datos de precisión no se puede garantizar.
- Enrutado de consultas en centros de contacto: la clasificación en las cerca de 77 intenciones bancarias permitiría enrutar automáticamente las solicitudes al departamento correspondiente.
- Asistente virtual de soporte: el modelo base Gemma 3 permite conversaciones en inglés; el fine-tuning podría mejorar la comprensión de lenguaje financiero y bancario.
- Análisis de feedback de clientes: clasificación de comentarios en categorías como quejas, reclamaciones o sugerencias, reduciendo el trabajo manual de moderación.
- Generación de respuestas estándar en banca: combinando clasificación de intención con generación de texto, el modelo podría redactar respuestas preliminares a consultas comunes.
- Prototipado de agentes de IA en entornos regulados: con licencia Apache 2.0 y tamaño reducido, es apto para pruebas de concepto en infraestructura local donde se necesite control sobre los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para el modelo base Gemma 3 4B en cuantización 4-bit se estiman entre 3 y 4 GB de VRAM para los pesos; el adaptador LoRA, que supone el contenido más probable del repositorio (0.2 GB), apenas añade consumo de memoria.
- GPUs recomendadas: una tarjeta de consumo con 8 GB o más de VRAM (por ejemplo, RTX 4060, RTX 3060) debería permitir la ejecución conjunta de adaptador y modelo base, aunque no se ha probado específicamente.
- Compatibilidad con despliegue: al ser un modelo `transformers` con pesos en `safetensors`, es compatible con herramientas como vLLM, llama.cpp (si se convierte a GGUF), Ollama y TGI. Los metadatos incluyen el tag `endpoints_compatible`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lcgemma-banking77 (este modelo) | 4B base + adaptador (0.2 GB) | No disponible | apache-2.0 | HuggingFace |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | 4B | No disponible | No disponible en la informacion | HuggingFace |
| google/gemma-3-4b-it | 4B | No disponible | Gemma Terms of Use | HuggingFace |

No se han publicado resultados comparativos de benchmarks entre estos modelos.

## Limitaciones y advertencias

- Sesgos y alucinaciones no evaluados: al no existir informes de evaluación, no se pueden descartar sesgos heredados de Gemma 3 o introducidos por el fine-tuning.
- Riesgo de alucinación considerable en dominios específicos, especialmente al no haber sido validado con datos propios.
- Idioma: los metadatos indican soporte limitado a inglés (`en`), aunque Gemma 3 es multilingüe; el fine-tuning podría haber reducido la competencia en otras lenguas.
- Licencia: el modelo declara Apache 2.0, pero el modelo base Gemma 3 puede estar sujeto a los términos de uso de Google Gemma, lo que debe verificarse antes de un uso comercial.
- El modelo está subido con descargas y likes en 0, y no se han proporcionado guías de uso ni ejemplos de inferencia.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/twokings22/lcgemma-banking77
- HuggingFace (modelo mergido): https://huggingface.co/twokings22/lcgemma-banking77-merged
- No se han encontrado papers, blogs o demos adicionales en la informacion disponible.
