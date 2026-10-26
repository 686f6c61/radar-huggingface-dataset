# wraith1337/Sprout

## Resumen

Sprout es un ajuste fino (fine-tune) del modelo HuggingFaceTB/SmolLM3-3B, desarrollado por Abhinav Tiwari (cofundador y responsable de IA de Sprynn) bajo el identificador `wraith1337/Sprout`. Se trata del modelo asistente de la plataforma Sprynn, entrenado para adoptar la identidad, la persona y el conocimiento de producto de dicha marca. Es, por tanto, un modelo de nicho orientado a conversación con personalidad definida, no un modelo de propósito general.

Técnicamente es un transformer decoder-only denso de 3.075.098.624 parámetros (3,08 B), publicado en fp16 (safetensors de 6,15 GB) junto con una cuantización GGUF Q4_K_M de 1,9 GB para ejecución local ligera. El entrenamiento se realizó mediante QLoRA sobre 1.524 ejemplos de conversación en inglés más 49 de validación, con 42 pasos y 3 épocas, y una pérdida final en validación de 1,8269901275634766.

Su relevancia es limitada y muy acotada: se presenta explícitamente como una «pilot release» con evaluación de nivel *smoke*, sin validación para producción y sin ninguna métrica de benchmark publicada. Resulta útil como ejemplo reproducible de pipeline QLoRA sobre SmolLM3 y como base para demos de personaje o de asistente de producto, pero no como candidato para cargas de trabajo generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base SmolLM3-3B) |
| Parámetros totales | 3.075.098.624 (3,08 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card de Sprout; heredada del modelo base (SmolLM3-3B declara 64K, ampliable a 128K con YaRN según su documentación, no verificado en este fine-tune) |
| Tipos de cuantización | fp16 (safetensors) y GGUF Q4_K_M publicados; otras cuantizaciones GGUF no publicadas |
| Idiomas soportados | Entrenamiento declarado únicamente en inglés (1.524 ejemplos); la model card no declara lista de idiomas. El modelo base es multilingüe (inglés, francés, alemán, español, italiano y portugués según su documentación), sin evaluación multilingüe de este fine-tune |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16) y GGUF (Q4_K_M) |
| Tamaño del repositorio | 8,1 GB |
| Ficheros principales | `model.safetensors` (6.150.234.768 bytes), `sprout-Q4_K_M.gguf` (1.915.305.440 bytes), tokenizer, config, generation config y chat template |
| Librería | transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM3-3B: un transformer decoder-only de 3,08 B parámetros, sin mezcla de expertos. La model card de Sprout no detalla capas, dimensión oculta, mecanismo de atención ni esquema de posiciones; esos datos deben consultarse en la documentación de HuggingFaceTB. No se declara ninguna innovación arquitectónica propia de este fine-tune.

El entrenamiento consistió en un QLoRA con rango 16, alpha 32, dropout 0,05, aplicado únicamente a las proyecciones q/v, durante 42 pasos y 3 épocas. El conjunto de datos comprende 1.524 ejemplos de conversación en inglés y 49 de validación (*held-out*), centrados en identidad, persona, conocimiento de producto de Sprynn y seguridad. La pérdida final declarada en validación es 1,8269901275634766. Con ese volumen de datos y ese número de pasos, el ajuste es de tipo adaptación superficial de estilo e identidad: no incorpora conocimiento factual nuevo ni capacidades de razonamiento adicionales, y no se documenta RLHF, DPO ni ninguna fase de alineamiento posterior.

## Capacidades

- Generación de texto conversacional en inglés, con estilo y persona alineados a la identidad de Sprynn.
- Respuesta sobre conocimiento de producto de Sprynn, limitado a lo presente en los 1.524 ejemplos de entrenamiento.
- Conversación multi-turno mediante la chat template incluida en el repositorio.
- Herencia de las capacidades del modelo base SmolLM3-3B (generación, razonamiento básico, código), aunque el fine-tune no las evalúa ni las refuerza.
- Ejecución local en CPU o GPU de gama baja gracias a la cuantización Q4_K_M publicada.
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento explícito («thinking») en la model card de este fine-tune.

## Casos de uso

- Demostración de personaje conversacional: el modelo mantiene un registro y una identidad consistentes en inglés, adecuado para escaparates o demos interactivas de la marca Sprynn, no para atención al cliente real.
- Prototipado de asistentes de producto: permite validar flujos de conversación sobre el catálogo o las funcionalidades de Sprynn antes de invertir en un modelo mayor, dado su coste de inferencia mínimo (1,9 GB en Q4_K_M).
- Pruebas de despliegue en local y en el borde: su GGUF de 1,9 GB se ejecuta en portátiles y en equipos sin GPU dedicada, lo que sirve para validar cadenas de inferencia con llama.cpp u Ollama.
- Referencia reproducible de QLoRA: sirve como plantilla documentada (r=16, alpha=32, q/v, 3 épocas) para equipos que quieran replicar un ajuste de identidad sobre SmolLM3-3B.
- Base para iteraciones internas de Sprynn: punto de partida sobre el que ampliar el conjunto de datos, ya que la propia model card reconoce que la evaluación es solo de nivel *smoke*.
- Generación de respuestas de estilo controlado en inglés para tareas de redacción de marca, siempre con revisión humana y sin garantías de fidelidad factual.
- Evaluación comparativa de pipelines de cuantización: permite medir la degradación entre fp16 (6,15 GB) y Q4_K_M (1,9 GB) en una tarea concreta de conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente «No benchmark claims» y describe la evaluación como de nivel *smoke*, sin validación para producción.

## Requisitos de hardware

- VRAM estimada en fp16: 6,15 GB solo para pesos; en la práctica, entre 8 y 10 GB con contexto corto (2K-4K tokens) y entre 12 y 16 GB para aprovechar contextos largos del modelo base.
- VRAM estimada en Q4_K_M: 1,9 GB de pesos; alrededor de 3-4 GB con caché KV para contextos moderados.
- GPU recomendadas: A100 o H100 para servicio en fp16 con concurrencia; RTX 4090, L40S o A10G para fp16 en nodo único; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para fp16 ajustado o Q4_K_M con contexto amplio.
- GPU de consumo: sí cabe. En Q4_K_M funciona en tarjetas de 4-6 GB (GTX 1650 4 GB, RTX 3050 6 GB); en fp16 requiere al menos 8 GB y preferiblemente 12 GB.
- CPU: el GGUF Q4_K_M de 1,9 GB permite inferencia solo-CPU con llama.cpp, con latencia alta y throughput bajo.
- Opciones de despliegue: transformers (fp16), llama.cpp y Ollama o LM Studio (GGUF), vLLM o TGI (fp16, requieren GPU).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Sprout (`wraith1337/Sprout`) | 3,08 B | No declarado en la model card (heredado del base) | Apache-2.0 | Fine-tune QLoRA de identidad y persona para Sprynn, solo inglés, sin benchmarks | HuggingFace, safetensors fp16 y GGUF Q4_K_M |
| SmolLM3-3B (modelo base) | 3,08 B | 64K, ampliable a 128K con YaRN según su documentación | Apache-2.0 | Modelo generalista multilingüe con modos de razonamiento | HuggingFace, ampliamente desplegado |
| Llama 3.2 3B | 3,21 B | 128K según documentación pública | Licencia comunitaria de Meta (no Apache-2.0) | Modelo generalista multilingüe | HuggingFace, ecosistema amplio |
| Qwen3-4B | 4,0 B | 32K nativo, ampliable con YaRN según documentación pública | Apache-2.0 | Modelo generalista con modo de razonamiento | HuggingFace, ecosistema amplio |

Nota: los datos de contexto y parámetros de los modelos comparados provienen de su documentación pública y no han sido verificados en el contexto de este fine-tune. En rendimiento no procede comparación: Sprout no publica ninguna métrica, mientras que los modelos base y alternativas sí cuentan con evaluaciones publicadas por sus autores.

## Limitaciones y advertencias

- Evaluación insuficiente: la propia model card califica la validación como de nivel *smoke*, no apta para producción.
- Inyección de instrucciones: se documenta que una respuesta del conjunto de validación repitió una instrucción embebida en lugar de rechazarla, lo que indica una resistencia débil a *prompt injection*.
- Exactitud factual: otra respuesta de validación erró el cargo del creador del modelo, lo que evidencia riesgo de alucinación incluso en datos presentes en el entrenamiento.
- Volumen de datos muy reducido: 1.524 ejemplos y 42 pasos implican un ajuste superficial, sin garantías de generalización fuera del dominio de identidad y producto.
- Idioma: el entrenamiento declarado es exclusivamente en inglés; no hay evaluación de comportamiento en castellano ni en otros idiomas, aunque el modelo base sea multilingüe.
- Contexto: la model card no especifica la ventana efectiva tras el fine-tune; debe asumirse la del modelo base y verificarse empíricamente.
- Sesgos: no se documenta ninguna auditoría de sesgos, toxicidad o seguridad más allá de los ejemplos de seguridad incluidos en el conjunto de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero el usuario asume la responsabilidad de validar el modelo; al derivar de SmolLM3-3B conviene revisar también las condiciones del modelo base.
- Adopción prácticamente nula (0 descargas, 1 like) y actualización única el mismo día de la publicación: no hay historial de mantenimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wraith1337/Sprout
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/wraith1337/Sprout-Training-Data
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Sitio personal del autor: https://wraith1337.github.io/index.html
- Perfil de GitHub: https://github.com/wraith1337
- Repositorio del sitio: https://github.com/wraith1337/wraith1337.github.io
- Entrada de blog de presentación: https://wraith1337.github.io/posts/2026-09-16-hello-wraith1337.html
