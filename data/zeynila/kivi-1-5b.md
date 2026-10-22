# zeynila/Kivi-1.5B

## Resumen

Kivi-1.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario zeynila como proyecto de bootcamp. Se trata de un asistente de atención al cliente para la empresa ficticia Kivi Elektronik, entrenado para adoptar una identidad de marca concreta (incluida una firma textual, el carácter ⚡) y para responder consultas sobre políticas de la empresa, stock de productos y cálculo de gastos de envío. El modelo no se presenta como un LLM de propósito general, sino como una pieza verticalizada dentro de una arquitectura de agente con recuperación aumentada (RAG) y llamadas a herramientas.

Técnicamente es un transformer decoder-only denso de 1.543.714.304 parámetros (≈1,5B), derivado íntegramente de los pesos de Qwen2.5-1.5B-Instruct mediante QLoRA. La innovación no está en la arquitectura, que se hereda sin cambios, sino en la combinación de tres capas: un adaptador LoRA que fija la personalidad y el formato de salida, una guía de 14 secciones recuperada por RAG para las políticas corporativas y un agente ReAct que emite JSON para consultar stock y calcular envíos.

Su relevancia práctica es doble. Por un lado, demuestra un ciclo completo de especialización con recursos mínimos: 428 conversaciones sintéticas generadas con la API de Gemini y un entrenamiento QLoRA que, según el autor, se completa en unos 10 minutos sobre una GPU T4 de Colab. Por otro, publica métricas antes/después sobre un conjunto de test propio, algo poco habitual en fine-tunes de este tamaño, lo que permite evaluar de forma concreta qué mejora y qué no.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), con atención GQA y RoPE |
| Parámetros totales | 1.543.714.304 (≈1,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | GGUF q8_0 (repositorio GGUF del autor); otras cuantizaciones no disponibles |
| Idiomas soportados | Turco (idioma de entrenamiento); el modelo base es multilingüe, pero el ajuste es específico de turco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,1 GB) y GGUF (repo separado) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct sin modificaciones estructurales: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings atados (tied embeddings), atención con grupos de consultas (GQA) para reducir el coste de la caché KV y RoPE para la codificación posicional, con una ventana nativa de 32.768 tokens. El ajuste se realizó con QLoRA: r=16, alpha=32, aplicado a todas las capas lineales, 3 épocas y una tasa de aprendizaje de 2e-4. El autor no detalla el optimizador, el tamaño de batch ni la precisión del adaptador más allá de estos hiperparámetros.

El corpus de entrenamiento son 428 conversaciones sintéticas generadas con la API de Gemini y publicadas en el dataset `zeynila/kivi-1.5b-veri`. Cubren tres ejes: identidad (nombre y firma de marca), RAG (respuestas ancladas a la guía de 14 secciones de políticas de la empresa) y agente (emisión de JSON para invocar herramientas de consulta de producto y cálculo de envío). No se documenta ningún proceso de RLHF, DPO o alineación de seguridad adicional; el comportamiento seguro depende del modelo base y del prompt de sistema. La integración con RAG y con el agente ReAct se produce en tiempo de inferencia, no está codificada en los pesos.

## Capacidades

- Generación de texto conversacional en turco con una persona de marca consistente: el modelo adopta el nombre "Kivi" y la firma "⚡" con una tasa de acierto de 0,90 en el conjunto de test del autor (frente a 0,00 del base).
- Respuesta anclada a documentación mediante RAG: pasa de una puntuación de 0,43 a 0,50 según el juez automático y de 0,00 a 1,00 en la marca de respuesta basada en contexto, lo que indica que deja de improvisar cuando se le proporciona la guía.
- Llamada a herramientas (tool calling) con salida JSON: validez del JSON de 0,88 a 1,00 y activación correcta de la herramienta de 0,12 a 1,00.
- Razonamiento de un solo paso sobre precios, stock y política de envíos (por ejemplo, "kargo ücreti 79 TL").
- Gestión de conversaciones multi-turno dentro de la ventana de 32.768 tokens del modelo base.
- Capacidad multilingüe residual heredada de Qwen2.5, aunque no se ha evaluado ni entrenado para idiomas distintos del turco.
- No dispone de visión, audio, modo "thinking" explícito ni decodificación especulativa documentada.

## Casos de uso

- Atención al cliente de electrónica de consumo con RAG: el modelo responde consultas sobre devoluciones, garantías y plazos recuperando previamente las 14 secciones de la guía corporativa; el contexto de 32.768 tokens permite inyectar la guía completa más el historial de la conversación sin truncar.
- Enrutado a herramientas en un agente ReAct: ante preguntas de stock o precio, emite un JSON válido que el orquestador interpreta para consultar el catálogo; la métrica de activación de herramienta (1,00 tras el ajuste) lo hace fiable para este paso concreto.
- Cálculo de costes de envío y totales de pedido: adecuado para consultas de un solo paso (tarifa plana de 79 TL, umbrales de envío gratuito), con la salvedad de que los cálculos multi-producto fallan a veces.
- Base de partida para fine-tunes verticales en otros dominios: el pipeline (428 conversaciones sintéticas + QLoRA r=16 sobre todas las lineales + 3 épocas a 2e-4) es reproducible en una T4 en torno a 10 minutos, lo que lo convierte en una plantilla de bajo coste para prototipar asistentes de marca.
- Despliegue en CPU o dispositivos de borde: la versión GGUF q8_0 ocupa del orden de 1,6 GB y puede ejecutarse con llama.cpp en hardware sin GPU para demos, pruebas internas o entornos con presupuesto limitado.
- Banco de pruebas para evaluar pipelines RAG en turco: las preguntas del conjunto de test (14 casos con puntuación 1/0,5/0) sirven para medir alucinación y fidelidad al contexto en un idioma con menos recursos que el inglés.
- Generación de respuestas con tono de marca uniforme en canales de chat: útil cuando se necesita consistencia de identidad y formato más que amplitud de conocimiento.

## Benchmarks y rendimiento

El autor publica métricas propias sobre un conjunto de test, comparando el modelo base con el ajustado. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no hay resultados de esos benchmarks en la información disponible.

| Métrica (test propio) | Qwen2.5-1.5B-Instruct (base) | Kivi-1.5B |
|---|---|---|
| kimlik_ad (nombre de identidad) | 0,00 | 0,90 |
| kimlik_isaret (firma ⚡) | 0,00 | 0,90 |
| ajan_json (validez del JSON de agente) | 0,88 | 1,00 |
| ajan_arac (activación de herramienta) | 0,12 | 1,00 |
| rag_hakem (juicio del RAG) | 0,43 | 0,50 |
| rag_isaret (marca de respuesta con contexto) | 0,00 | 1,00 |

Evaluación cualitativa sobre 14 preguntas con juez automático (Gemini, escala 1/0,5/0): puntuación media de 0,50. Aciertos completos en devoluciones de 14 días, productos abiertos no retornables, instalación de TV en pared (750 TL) y horario de atención (08:00-24:00). Fallos en preguntas fuera de la guía (seguro antirrobo, canje de móviles, envíos internacionales), donde el modelo alucina o responde de forma incorrecta, y en cálculos multi-producto.

## Requisitos de hardware

- Inferencia en fp16/bf16: aproximadamente 3,1 GB de pesos más caché KV, en torno a 4 GB de VRAM para contextos moderados.
- Inferencia en GGUF q8_0: alrededor de 1,6-1,7 GB de pesos; apto para CPU y para GPU de gama baja.
- Cuantización de 4 bits: del orden de 0,9-1,0 GB, aunque el autor solo publica q8_0.
- GPU recomendadas: cualquier GPU con 6 GB o más (GTX 1660, RTX 3060, RTX 4060) para fp16; T4, L4, A10, RTX 4090, A100 y H100 sobran para este tamaño. El entrenamiento QLoRA de referencia se hizo en una T4 de 16 GB.
- Cabe holgadamente en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4080/4090 y en portátiles con 6-8 GB de VRAM usando 8 bits.
- Opciones de despliegue: llama.cpp y Ollama con el GGUF del autor, vLLM o TGI para servir en fp16, y Transformers + PEFT si se quiere cargar el adaptador LoRA por separado.
- Latencia y throughput: no disponibles; el autor no publica mediciones de inferencia (los "10 minutos" citados corresponden al entrenamiento, no a la generación).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| Kivi-1.5B | 1,54B | 32.768 | Apache 2.0 | Turco (ajuste) | Asistente vertical de atención al cliente con RAG y agente |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Multilingüe (incluido turco) | Chat e instrucciones de propósito general |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License | Multilingüe | Chat e instrucciones de propósito general |
| Gemma 2 2B Instruct | 2,6B | 8.192 | Gemma Terms of Use | Multilingüe | Chat e instrucciones de propósito general |

No hay resultados de benchmarks comparativos entre estos modelos en la información proporcionada; las métricas de la tabla anterior son específicas del test del autor y no son trasladables a MMLU, HumanEval o GSM8K. En la práctica, Kivi-1.5B solo tiene sentido frente a su modelo base cuando se necesita la persona de marca y el formato JSON de agente; en cualquier otra tarea, Qwen2.5-1.5B-Instruct ofrece más cobertura lingüística con los mismos requisitos de hardware.

## Limitaciones y advertencias

- Entrenado exclusivamente en turco: no se ha evaluado su comportamiento en castellano ni en otros idiomas, y la persona de marca puede filtrarse en respuestas fuera de dominio.
- Corpus de entrenamiento muy pequeño (428 conversaciones sintéticas generadas por otro modelo), lo que limita la generalización y puede introducir sesgos y errores heredados del generador.
- Riesgo alto de alucinación sin contexto: el propio autor indica que, sin la guía RAG, el modelo inventa o da respuestas vagas sobre políticas de la empresa.
- Puntuación media de 0,50 en el conjunto de test propio; el juicio del RAG solo mejora de 0,43 a 0,50, es decir, la fidelidad al contexto sigue siendo el punto débil.
- Errores en razonamiento multi-paso: cálculos con dos productos, exenciones de envío y condiciones combinadas se resuelven de forma incompleta o incorrecta.
- Datos de empresa ficticios (Kivi Elektronik): no es un asistente listo para producción en un negocio real sin sustituir la guía de políticas, el catálogo y las herramientas.
- Evaluación realizada con un juez automático (Gemini) sobre 14 preguntas, sin validación humana ni intervalos de confianza; los números deben tomarse como indicativos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y revisar la licencia del modelo base.
- Sin datos publicados de seguridad, sesgos medidos, latencia, throughput ni comportamiento con prompts adversariales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeynila/Kivi-1.5B
- Adaptador LoRA: https://huggingface.co/zeynila/Kivi-1.5B-LoRA
- Versión GGUF: https://huggingface.co/zeynila/Kivi-1.5B-GGUF
- Código de la aplicación (Space): https://huggingface.co/zeynila/Kivi-1.5B-GGUF/tree/main/space
- Dataset de entrenamiento y test: https://huggingface.co/datasets/zeynila/kivi-1.5b-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variantes relacionadas del mismo proyecto (no verificadas como oficiales): https://huggingface.co/Hytgkzynde/kivi-1.5b · https://huggingface.co/frankenhack/Kivi-1.5B-GGUF · https://huggingface.co/bertuginal/KiviElektronik-1.5B · https://huggingface.co/sedaahi/kivi-1.5b
