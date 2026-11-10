# Valen-Team/Valen-2B

## Resumen

Valen-2B es un modelo de decisión multimodal desarrollado por Valen-Team, afinado a partir de Qwen/Qwen3.5-2B mediante fine-tuning completo. No es un modelo generativo al uso: su propósito es responder preguntas tipadas (predicados booleanos, clasificaciones, selección de acciones) sobre entradas de texto, imagen y vídeo, devolviendo salidas estructuradas con probabilidades en lugar de texto libre. Esto lo posiciona como una pieza especializada para sistemas de enrutamiento, moderación y control de agentes.

Con 2.214.825.577 parámetros y licencia Apache 2.0, el modelo está pensado para integrarse en pipelines donde se necesita una decisión determinista y verificable a partir de contenido multimodal. Soporta dos formatos de API de decisión: SystemOne (estilo Jev) y Decisions (estilo OpenAI), ambos sobre el mismo modelo. El repositorio incluye pesos en safetensors, código de entrenamiento y un dataset de 100k ejemplos, además de variantes ONNX y GGUF.

La relevancia actual del modelo radica en su enfoque: en lugar de competir en generación de texto general, ataca el problema de convertir contenido no estructurado (mensajes de clientes, imágenes de producto, fotogramas de vídeo) en decisiones tipadas con probabilidad asociada, un patrón cada vez más demandado en sistemas de agentes y automatización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-2B; código personalizado (`trust_remote_code`) |
| Parámetros totales | 2.214.825.577 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F32, Q8_0 (GGUF cualificados); ONNX q8-mlp; Q4/Q5 GGUF fallaron los controles de calidad según el autor |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal capaz de procesar texto e imágenes, y se somete a fine-tuning completo (full-finetuning) para especializarlo en tareas de decisión. La arquitectura conserva la base del modelo Qwen3.5-2B pero añade una interfaz de predicción tipada (`model.predict`) que recibe un estado (texto, imagen o vídeo) y una lista de preguntas con tipo (`predicate`, `noul`, etc.) e instrucciones, devolviendo probabilidades por respuesta. El tag `shared-state` sugiere que el modelo comparte representación entre el estado de entrada y las preguntas formuladas.

No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia al dataset público `Valen-Team/Valen-Training-General-100k` (100.000 ejemplos). Tampoco se documenta si hubo RLHF o DPO. La innovación principal es el formato de salida estructurada con probabilidades calibradas, orientado a decisiones verificables en lugar de generación libre, junto con soporte nativo de vídeo en la versión de código fuente (aunque el paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo, según advierte el autor).

## Capacidades

- Clasificación de mensajes de clientes y enrutamiento de tickets mediante predicados tipados con probabilidad.
- Verificación de imágenes contra requisitos (por ejemplo, cribado de imágenes de producto).
- Identificación de acciones y etiquetado en vídeo (en builds de código fuente; el GGUF precompilado 0.1.0 no incluye soporte directo de vídeo).
- Salida estructurada tipada (`image-text-to-typed-output`) con probabilidades por respuesta.
- Soporte de dos formatos de API de decisión: SystemOne (Jev) y Decisions (OpenAI).
- Razonamiento multi-paso sobre estado compartido (`shared-state`) para flujos de decisión encadenados.
- Capacidades multilingües limitadas a inglés y chino.
- Toma de decisiones en entornos de juego (demostración de Sokoban).
- No se documenta soporte explícito de tool calling ni de agentes generales fuera del paradigma de decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del mensaje del cliente y una lista de predicados (por ejemplo, "es una queja de facturación", "requiere reembolso") y devuelve probabilidades que permiten asignar el ticket a la cola correcta con umbrales configurables.
- Cribado de imágenes de producto en marketplaces: se envía la imagen junto con predicados de cumplimiento ("fondo blanco", "producto centrado", "sin texto sobreimpreso") y el modelo devuelve la probabilidad de cumplimiento para cada requisito, automatizando la moderación previa a publicación.
- Etiquetado de acciones en vídeo: en builds con soporte de vídeo, se extraen fotogramas o clips y se consultan predicados sobre acciones presentes, útil para indexación de contenido audiovisual o monitorización.
- Moderación de contenido multimodal: combinación de texto e imagen para decidir si una publicación infringe políticas, con salida probabilística que permite fijar umbrales de revisión humana.
- Control de agentes en entornos de juego o simulación: la demostración de Sokoban muestra cómo el modelo decide acciones a partir del estado visual del tablero, aplicable a agentes que operan sobre representaciones visuales del entorno.
- Fine-tuning para dominios verticales: al publicarse el código de entrenamiento y el dataset de 100k ejemplos, equipos pueden reentrenar el modelo para taxonomías propias (seguros, salud, legal) manteniendo el formato de decisión tipada.
- Automatización de QA en pipelines de datos: verificación automática de que pares imagen-texto cumplen criterios antes de entrar en un dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 8,9 GB solo para pesos (2.214.825.577 parámetros × 4 bytes), más overhead de activaciones y del procesador multimodal.
- VRAM estimada en Q8_0: aproximadamente 2,2 GB para pesos, más overhead.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes en F32, y GPUs consumer de 8-12 GB podrían alojar la variante Q8_0.
- Cabe en GPU consumer: sí, especialmente en cuantización Q8_0; en F32 requiere al menos 12 GB de VRAM.
- Opciones de despliegue: Transformers con `trust_remote_code` y `attn_implementation="sdpa"` (GPU NVIDIA); SDK ONNX para Python/JavaScript en local; runtime GGUF personalizado de Valen para servicios C++ en CPU Linux; SGLang/vLLM para despliegue en GPU según la guía del autor. No se reclama soporte en llama.cpp/Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| Valen-2B | 2,21B | no disponible | Texto, imagen, vídeo | Apache 2.0 | Decisión tipada con probabilidades |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | Texto, imagen | no disponible en la información | Generación multimodal general |
| Valen-Decision-1.5-2B | no disponible | no disponible | no disponible | no disponible | Versión sucesora del mismo equipo |

La comparación con alternativas de la misma categoría (modelos de decisión tipada) no está disponible en la información proporcionada; el ecosistema de modelos especializados en salida estructurada probabilística es reducido y el autor no cita competidores directos.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada, lo que dificulta planificar entradas largas.
- Cuantizaciones Q4 y Q5 en GGUF fallaron los controles de calidad del autor; solo se recomiendan F32 y Q8_0 cualificados.
- El paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo; las pruebas históricas de vídeo con build de código fuente no cualifican el paquete precompilado.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar; requiere runtime personalizado.
- Riesgo de calibración: al devolver probabilidades, umbrales mal ajustados pueden producir falsos positivos o negativos en producción; se recomienda validación por dominio.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-2B y entrenarse con un dataset de 100k ejemplos, puede heredar sesgos del modelo base y del dataset.
- Riesgo de alucinación: menor que en modelos generativos al tratarse de clasificación tipada, pero las probabilidades pueden ser sobreconfiadas en entradas fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B puede tener condiciones adicionales que conviene verificar.
- El modelo tiene pocas descargas (840) y likes (2), lo que sugiere adopción temprana y menor validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-2B
- Versión sucesora: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Repositorio de código y entrenamiento: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Guía de selección de versión: https://valen-team.github.io/docs/valen/choosing/
- Documentación de inicio rápido: https://valen-team.github.io/docs/valen/quickstart/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
