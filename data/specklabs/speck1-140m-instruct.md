# specklabs/Speck1-140M-Instruct

## Resumen

Speck1-140M-Instruct es un modelo de lenguaje instructivo de 140,7 millones de parámetros desarrollado por specklabs, especializado en conversación en inglés. Se inicializa desde el modelo base Speck1-140M, una arquitectura híbrida que intercala atención global por grupos de consultas (GQA) con convoluciones causales con puerta, y se ajusta completamente durante una época sobre el dataset de conversaciones SpeckChat1. El modelo resuelve tareas de generación de texto y chat con instrucciones, ofreciendo una alternativa ligera y eficiente para entornos con recursos limitados.

Su relevancia actual radica en su diseño híbrido poco común en modelos pequeños, combinando mecanismos de atención y convolución para capturar dependencias tanto globales como locales. Con una ventana de contexto configurada de 4.096 tokens (aunque solo validada hasta 2.048), el modelo está pensado para aplicaciones de chat y generación de texto donde se requiere un equilibrio entre rendimiento y coste computacional. La licencia MIT permite uso comercial sin restricciones, lo que facilita su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 8 bloques de atención global GQA + 10 bloques de convolución causal con puerta, cada uno con FFN SwiGLU |
| Parametros totales | 140.654.208 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens configurados (no validado más allá de 2.048) |
| Tipos de cuantizacion | No disponible (solo BF16 safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de Speck1-140M, con 18 bloques residuales: 8 de atención global con cabezas Q/KV de 12/3 y dimensión de cabeza 64, y 10 de convolución causal con puerta (kernel sizes 3 y 5, ancho interno 384). Cada bloque va seguido de una red feed-forward SwiGLU con ancho intermedio 2.304. La anchura oculta es 768, mientras que los embeddings de entrada/salida (640) están atados y se conectan al flujo residual mediante proyecciones aprendidas. Se añaden tres tokens de rol al vocabulario base de 32.000 (Mistral v0.1 SentencePiece), totalizando 32.003.

El entrenamiento base utilizó 5.000 millones de tokens procedentes de datasets como Ultra-FineWeb, dclm-baseline, smollm-corpus y finemath. El ajuste instructivo (SFT) se realizó sobre 298.789 conversaciones de SpeckChat1, con 179.256.850 tokens de asistente supervisados, aplicando pérdida solo en el contenido del asistente y su token de cierre. Se empleó AdamW con pico de LR 1e-4, decaimiento coseno, 4.835 pasos y secuencias de 256 a 2.048 tokens. El entrenamiento completo tomó 1,52 horas en una RTX 3090.

## Capacidades

- Generación de texto y chat conversacional con plantilla nativa que soporta mensajes de sistema opcionales.
- Razonamiento básico y respuesta a instrucciones en inglés, adecuado para tareas sencillas de comprensión y generación.
- Soporte de contexto de hasta 2.048 tokens validados, suficiente para diálogos multi-turno moderados.
- Capacidad de procesar secuencias de longitud variable mediante bucketing por longitud durante el entrenamiento.
- Integración con Transformers mediante código personalizado (`trust_remote_code=True`), lo que facilita su uso en pipelines estándar.
- No se documenta soporte explícito de tool calling, agentes, visión, audio u otras modalidades.

## Casos de uso

- Chatbots ligeros para atención al cliente: el modelo puede gestionar conversaciones de soporte básico en inglés con un contexto de hasta 2.048 tokens, suficiente para resolver consultas frecuentes sin necesidad de infraestructura pesada.
- Asistentes de documentación técnica: dado su tamaño reducido, puede integrarse en entornos embebidos o aplicaciones de escritorio para responder preguntas sobre manuales o guías.
- Generación de respuestas cortas en aplicaciones móviles: su baja latencia y pequeño footprint lo hacen adecuado para asistentes personales en dispositivos con recursos limitados.
- Prototipado rápido de sistemas de diálogo: al ser un modelo pequeño y con licencia MIT, permite validar flujos conversacionales antes de escalar a modelos mayores.
- Educación y experimentación: sirve como banco de pruebas para estudiar arquitecturas híbridas atención-convolución en tareas de instrucción.
- Filtrado y clasificación de texto: puede adaptarse mediante fine-tuning para tareas de clasificación de sentimiento o categorización de contenido en inglés.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en BananaMind Base Bench 1.1 (tarea de continuación de texto de cuatro opciones):

| Metrica | Valor |
|---|---|
| Overall Elo | 1001 |
| Accuracy | 48,86 % |
| Weighted accuracy | 48,17 % |

No se han publicado resultados de benchmarks en la informacion disponible más allá de estos datos. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en BF16 (el modelo pesa aproximadamente 281 MB en pesos), por lo que cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con soporte BF16 (RTX 3090, RTX 4090, A100, etc.). También puede ejecutarse en CPU con float32, aunque con mayor latencia.
- Compatible con GPUs de consumo: sí, incluso en tarjetas con 4 GB de VRAM o menos.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; no se documentan formatos GGUF ni integración con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada, pero al ser un modelo de 140M se espera una generación rápida en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar en la información proporcionada. Se recomienda evaluar Speck1-140M-Instruct frente a alternativas como SmolLM-135M o TinyLlama-1.1B, pero no hay métricas oficiales para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Contexto limitado: aunque se configura 4.096 tokens, solo se ha validado hasta 2.048, por lo que secuencias más largas pueden degradar el rendimiento.
- Idioma: solo soporta inglés; no se ha entrenado para otros idiomas.
- Tamaño reducido: con 140M de parámetros, su capacidad de razonamiento complejo y generación de código es limitada en comparación con modelos mayores.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información plausible pero incorrecta, especialmente en temas especializados.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento sobre datasets web puede introducir sesgos no mitigados.
- Validación de benchmarks: los resultados de BananaMind no están verificados de forma independiente y solo cubren una tarea específica.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado por HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/specklabs/Speck1-140M-Instruct
- Modelo base: https://huggingface.co/specklabs/Speck1-140M
- Dataset de entrenamiento instructivo: https://huggingface.co/datasets/specklabs/SpeckChat1
- Datasets de preentrenamiento: Ultra-FineWeb, dclm-baseline, smollm-corpus, finemath (enlaces no disponibles en la información proporcionada)
