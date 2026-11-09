# SzaBotond/puli-gpt2-petofi-v01

## Resumen

PULI-GPT-2 Petőfi es un ajuste fino (fine-tune) del modelo base NYTK/PULI-GPT-2, un GPT-2 de aproximadamente 345 millones de parámetros entrenado para húngaro por el equipo NYTK (documentado en Yang et al., MSZNY 2023). El autor, SzaBotond, lo ha especializado sobre el corpus poético de Sándor Petőfi para generar poemas en húngaro imitando el estilo del poeta romántico. Se trata de un experimento personal, sin pretensiones de producción, publicado con licencia CC-BY-4.0.

El modelo es un transformer decoder-only de tipo GPT-2 clásico, con 354.609.152 parámetros reales según los pesos en safetensors y un repositorio de 1,4 GB. No se documenta la longitud de contexto nativa del modelo base ni el vocabulario; el ajuste fino se realizó con una longitud máxima de secuencia de 256 tokens, lo que condiciona el uso práctico.

Su relevancia es acotada: no compite con modelos generativos modernos, pero resulta útil como ejemplo de adaptación de bajo coste de un modelo base pequeño a un dominio creativo muy específico (poesía húngara) y como recurso para experimentación con generación de texto estilizada en un idioma de recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 354.609.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó max_seq_len de 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | húngaro (hu) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GPT-2 del base NYTK/PULI-GPT-2, un transformer decoder-only con atención causal estándar y alrededor de 345 millones de parámetros. No se documentan innovaciones arquitectónicas adicionales: es un ajuste fino convencional por modelado de lenguaje causal.

El entrenamiento se realizó en PyTorch con los siguientes hiperparámetros: 5 épocas con early stopping, batch size 2, acumulación de gradiente 4 (batch efectivo de 8), learning rate 3e-5, weight decay 0,01, longitud máxima de secuencia de 256 tokens, precisión mixta FP16 y gradient checkpointing. El autor indica que entrenó en local con hardware limitado. No se especifica el número de tokens de entrenamiento, la composición exacta del corpus de Petőfi ni si hubo etapas de RLHF o DPO; todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto en húngaro con estilo poético inspirado en Sándor Petőfi.
- Continuación de versos y estrofas a partir de un prompt (por ejemplo, "A pusztán fúj a szél,").
- Generación condicionada por parámetros de muestreo (temperature, top_k, top_p, repetition_penalty, no_repeat_ngram_size), según el ejemplo de la model card.
- Modelado de lenguaje causal genérico en húngaro, heredado del base NYTK/PULI-GPT-2.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente húngaro declarado.

## Casos de uso

- Generación de poemas de estilo petőfiano para experimentación creativa: se introduce un primer verso y el modelo continúa con parámetros de muestreo moderados (temperature 0,85, top_p 0,9), adecuado por su ajuste específico al corpus del poeta.
- Prototipado de herramientas de escritura creativa en húngaro: útil para demostrar pipelines de generación de texto con `transformers` en un idioma de recursos limitados, dado su tamaño reducido y su licencia permisiva.
- Docencia y divulgación sobre fine-tuning: el modelo sirve como ejemplo reproducible de ajuste de un GPT-2 pequeño a un dominio concreto con hardware de consumo, gracias a los hiperparámetros publicados.
- Generación de variantes estilísticas para estudios literarios computacionales: permite producir muestras sintéticas en el estilo de Petőfi para comparar métricas de estilo frente a corpus reales.
- Creación de contenido lúdico o educativo sobre poesía húngara: con prompts controlados y revisión humana, puede generar borradores de versos para talleres o materiales didácticos.
- Base para nuevos fine-tunes en húngaro: al ser un ajuste sobre NYTK/PULI-GPT-2 con licencia CC-BY-4.0, puede reutilizarse como punto de partida para otros dominios literarios o estilísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,7 GB solo para pesos (354,6 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para secuencias cortas.
- VRAM estimada en FP32: aproximadamente 1,4 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. También puede ejecutarse en CPU para pruebas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (según el quickstart de la model card); no se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 354 M de parámetros, la generación en GPU consumer debería ser rápida, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| SzaBotond/puli-gpt2-petofi-v01 | 354,6 M | no disponible (entrenado a 256 tokens) | húngaro | CC-BY-4.0 | Fine-tune poético sobre NYTK/PULI-GPT-2 |
| NYTK/PULI-GPT-2 | ~345 M | no disponible | húngaro | no disponible en la información proporcionada | Modelo base generalista en húngaro |
| GPT-2 (OpenAI) | 124 M / 355 M / 774 M / 1,5 B | 1024 tokens | inglés principalmente | MIT (pesos originales) | Referencia arquitectónica; no especializado en húngaro ni poesía |

La comparación con alternativas especializadas en poesía húngara no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo "está lejos de ser perfecto" y solo produce resultados sorprendentemente buenos de forma ocasional.
- Riesgo elevado de alucinación y de texto incoherente o métricamente incorrecto, propio de un GPT-2 pequeño ajustado con un corpus limitado.
- Longitud de contexto efectiva limitada: el entrenamiento usó 256 tokens, por lo que la coherencia decae en generaciones largas.
- Sesgos: al entrenarse sobre la obra de un único poeta del siglo XIX, puede reproducir estereotipos, registros arcaicos y visiones del mundo propias de esa época.
- Monolingüe: solo húngaro; no se garantiza calidad en otros idiomas.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero deben respetarse las condiciones del modelo base NYTK/PULI-GPT-2, cuya licencia no se detalla en la información disponible.
- No apto para producción sin revisión humana: no hay benchmarks, no hay garantías de calidad y el modelo se publicó como experimento personal.
- El quickstart de la model card usa el identificador `Escab3d/puli-gpt2-petofi`, distinto del ID del repositorio (`SzaBotond/puli-gpt2-petofi-v01`); conviene verificar el identificador correcto antes de cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SzaBotond/puli-gpt2-petofi-v01
- Modelo base NYTK/PULI-GPT-2: https://huggingface.co/NYTK/PULI-GPT-2
- Referencia del modelo base (Yang et al., MSZNY 2023): "Jönnek a nagyok! BERT-Large, GPT-2 és GPT-3 nyelvmodellek magyar nyelvre", XIX. Magyar Számítógépes Nyelvészeti Konferencia, pp. 247-262.
