# vezilka-ai/Gourmand

## Resumen

Gourmand es un modelo de generación de texto publicado por el usuario vezilka-ai en Hugging Face, construido sobre la arquitectura `gemma3_text` de Google. Con 3.880.263.168 parámetros (aproximadamente 3,9 mil millones) y un repositorio de 15,6 GB en formato safetensors, se trata de un modelo de tamaño medio orientado a generación de texto y conversación, compatible con el ecosistema `transformers` y con text-generation-inference.

La relevancia del modelo es sin embargo limitada por la escasez de información publicada: la model card se reduce a un título, no se declara licencia, no se especifican idiomas soportados, no hay descripción del dataset de entrenamiento ni resultados de benchmarks. El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicación reciente o de baja difusión.

Para un desarrollador o investigador, Gourmand debe tratarse como un artefacto a evaluar empíricamente antes de cualquier uso en producción: la única información fiable disponible es la arquitectura base (Gemma 3 text), el recuento de parámetros y el formato de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer decoder-only, familia Gemma 3) |
| Parámetros totales | 3.880.263.168 (≈3,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización GGUF no confirmada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Librería | transformers |
| Compatibilidad | text-generation-inference, endpoints_compatible |
| Tamaño del repositorio | 15,6 GB |
| Fecha de publicación | 2026-11-12 |

## Arquitectura y entrenamiento

El tag `gemma3_text` indica que Gourmand emplea la torre de texto de la familia Gemma 3, es decir, un transformer decoder-only con atención causal. No se dispone de información publicada sobre la configuración exacta de capas, cabezas de atención, dimensión oculta ni vocabulario, más allá del recuento total de parámetros.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el número de tokens, la composición del corpus, si hubo ajuste supervisado, RLHF o DPO, ni si el modelo es un fine-tuning de un checkpoint Gemma 3 existente o un entrenamiento desde cero. La model card no incluye ninguna innovación técnica declarada (decodificación especulativa, atención lineal, modo de razonamiento u otras). Cualquier afirmación sobre el entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto autoregresiva en el pipeline `text-generation` de `transformers`.
- Conversación multi-turno: el tag `conversational` sugiere soporte de formato de chat, aunque no se documenta la plantilla de prompt utilizada.
- Compatibilidad con text-generation-inference (TGI) y con endpoints compatibles, lo que facilita el despliegue como API.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el tag `gemma3_text` apunta únicamente a la torre de texto, no a la multimodal.

## Casos de uso

- Evaluación comparativa de fine-tunings de Gemma 3: usar Gourmand como checkpoint de referencia frente a otros derivados de la misma familia, midiendo perplejidad y calidad de generación en un conjunto de validación propio antes de adoptarlo.
- Prototipado de asistentes conversacionales: al integrarse en `transformers` y TGI, permite levantar un endpoint de chat en pocas líneas para pruebas internas, siempre tras validar la plantilla de prompt.
- Generación de texto en pipelines de datos: resumen o reformulación de documentos en lote mediante inferencia por lotes con TGI, aprovechando el tamaño medio del modelo para throughput razonable.
- Investigación sobre ajuste fino: al ser un modelo de ~3,9 B parámetros, es un candidato manejable para experimentos de LoRA o QLoRA en una sola GPU, comparando el comportamiento antes y después del ajuste.
- Despliegue en entornos con recursos moderados: un modelo de esta escala puede servirse en GPUs de 24 GB en precisión reducida, lo que lo hace apto para pruebas de concepto en infraestructura no dedicada.
- Base para evaluación de seguridad y sesgos: dado que no hay documentación de alineamiento, puede emplearse como caso de estudio para medir sesgos y tasas de alucinación en modelos sin card informativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,8 GB solo para pesos (3,88 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 9 y 11 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB para pesos; en 4 bits, alrededor de 2 GB, más overhead.
- GPU recomendadas: A100 40/80 GB o H100 para serving concurrente con TGI; RTX 4090 (24 GB) o L40S para inferencia en fp16 con margen amplio.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 12-16 GB con cuantización; en 8 GB solo con cuantización agresiva, no confirmada por el autor.
- Opciones de despliegue: `transformers` (confirmado por la librería declarada), text-generation-inference y endpoints compatibles (confirmado por tags). vLLM, llama.cpp u Ollama no están confirmados por falta de pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gourmand (vezilka-ai) | ≈3,9 B | no disponible | no disponible | Hugging Face, 0 descargas |
| Gemma 3 (Google, tamaño equivalente) | no disponible en la información | no disponible | no disponible en la información | Modelo base de referencia de la familia |
| Alternativas de ~3-4 B de otras familias | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa fiable con alternativas. La comparación debe hacerse empíricamente.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: sin descripción de datos, entrenamiento ni evaluación, no es posible estimar calidad, sesgos ni robustez.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar los términos antes de cualquier despliegue en producción.
- Idiomas no declarados: el rendimiento multilingüe es desconocido y debe medirse.
- Riesgo de alucinación no cuantificado: sin evaluación publicada, no hay base para estimar la tasa de errores factuales.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos sin verificar la configuración del tokenizador y del modelo.
- Sin soporte comunitario: cero descargas y cero likes implican ausencia de validación externa; los fallos no están documentados.
- Procedencia del checkpoint no verificada: no se indica si deriva de un modelo base con licencia específica, lo que puede afectar a las obligaciones de atribución.
- No apto para producción sin evaluación previa: se recomienda auditar sesgos, calidad y seguridad en un conjunto propio antes de cualquier uso real.

## Enlaces

- Hugging Face: https://huggingface.co/vezilka-ai/Gourmand
- Repositorio del autor: https://huggingface.co/vezilka-ai
- Documentación de Gemma 3 (familia base): no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible
