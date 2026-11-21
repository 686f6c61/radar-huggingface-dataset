# Yethu-2/Qwen2.5-7B-Morrisons-Law-LoRA

## Resumen

Qwen2.5-7B-Morrisons-Law-LoRA es un ajuste fino mediante LoRA del modelo Qwen2.5-7B-Instruct, publicado por el usuario Yethu-2 en Hugging Face. El adaptador se ha entrenado con Unsloth sobre la versión cuantizada a 4 bits del modelo instructivo de Qwen, y el nombre sugiere una especialización en el ámbito legal (aparentemente relacionado con la cadena de supermercados Morrisons, aunque la model card no lo documenta). El repositorio tiene un tamano de 0,2 GB, coherente con un adaptador LoRA y no con los pesos completos del modelo base.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con 7.000 millones de parámetros y una ventana de contexto de 32.768 tokens en su versión original. Al tratarse de un ajuste LoRA, las capacidades generales provienen del modelo base, mientras que el adaptador aporta la especialización temática. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el dataset de entrenamiento, hiperparámetros, resultados de evaluación ni detalles sobre el dominio legal objetivo. Se trata de un artefacto de investigación de un autor individual, sin benchmarks publicados ni tracción en la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA |
| Parámetros totales | 7.000 millones (modelo base Qwen2.5-7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-7B) |
| Tipos de cuantización | El adaptador se distribuye en safetensors; el base se entrenó sobre una versión bnb-4bit (4 bits) |
| Idiomas soportados | en (según la model card); el base soporta más de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tipo LoRA (Low-Rank Adaptation) sobre Qwen2.5-7B-Instruct. La arquitectura subyacente es un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), tal como corresponde a la familia Qwen2.5. El adaptador se entrenó con la librería Unsloth, que según la model card permite un entrenamiento "2x más rápido" mediante kernels optimizados y gestión eficiente de memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO posterior ni los hiperparámetros del ajuste (rango del LoRA, alpha, learning rate, épocas). El modelo base Qwen2.5-7B-Instruct fue entrenado por Alibaba con 18 billones de tokens y sometido a alineación con preferencias humanas, pero el adaptador aquí publicado no documenta ninguna innovación técnica adicional más allá del uso de Unsloth para el entrenamiento.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct.
- Generación de código y matemáticas a nivel del modelo base (Qwen2.5-7B-Instruct obtiene resultados notables en HumanEval y GSM8K, aunque no se han publicado métricas específicas para este adaptador).
- Soporte de tool calling y function calling, heredado del modelo instructivo base.
- Capacidad de razonamiento multi-paso y uso en agentes, limitada por la ausencia de evaluación específica del adaptador.
- Capacidades multilingües del base (más de 29 idiomas), aunque la model card declara únicamente inglés.
- Especialización temática aparente en dominio legal (por el nombre "Morrisons-Law"), sin documentación que lo confirme.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Consultas legales especializadas: si el adaptador realmente ha sido entrenado con corpus legal de Morrisons, podría emplearse para responder preguntas sobre normativa interna, contratos o procedimientos de la compañía, aunque la falta de documentación impide validar esta capacidad.
- Generación de borradores de documentos legales: el modelo podría redactar cláusulas o resúmenes contractuales, apoyándose en el conocimiento general del base Qwen2.5-7B y en el supuesto sesgo del adaptador hacia el dominio legal.
- Asistencia en atención al cliente de temática jurídica: con 32.768 tokens de contexto, puede gestionar conversaciones multi-turno con historial extenso de reclamaciones o consultas.
- Extracción de información de contratos: el modelo puede procesar documentos largos y extraer cláusulas, fechas o partes implicadas, aprovechando la ventana de contexto del base.
- Prototipado rápido de asistentes legales: al ser un adaptador LoRA de 0,2 GB, se puede cargar sobre el base cuantizado en entornos con recursos limitados para pruebas de concepto.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo de pipeline Unsloth + TRL para especializar Qwen2.5 en dominios concretos, útil para reproducir el flujo de trabajo.
- Clasificación y resumen de textos legales: el modelo puede resumir resoluciones o contratos y clasificarlos por tipo, aunque sin evaluación específica del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA requiere cargar el modelo base Qwen2.5-7B. En cuantización 4 bits (como el base de entrenamiento, bnb-4bit), se necesitan aproximadamente 4-5 GB de VRAM; en FP16, unos 14-15 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090, RTX 4080 o GPUs con 8-12 GB para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores con cuantización 4 bits; en FP16 requiere al menos 16 GB (RTX 4080, RTX 4090).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM (con soporte LoRA), llama.cpp/Ollama (requiere convertir el adaptador a GGUF), TGI (text-generation-inference, etiquetado en el repo).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Morrisons-Law-LoRA | 7B (LoRA) | 32.768 | Apache 2.0 | Hugging Face | Adaptador sin benchmarks ni documentación de entrenamiento |
| Qwen2.5-7B-Instruct | 7B | 32.768 | Apache 2.0 | Hugging Face, Ollama, vLLM | Modelo base oficial, con benchmarks publicados y amplia adopción |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face, Ollama | Alternativa generalista con tool calling y buen rendimiento multilingüe |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face, Ollama | Mayor contexto y ecosistema más amplio, con restricciones de licencia |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos, calidad y cobertura del dominio legal.
- Riesgo elevado de alucinación en materia legal: el modelo no es una fuente fiable de asesoramiento jurídico y no debe usarse en producción sin validación humana.
- La model card declara únicamente inglés, aunque el base soporta más idiomas; el comportamiento en castellano no está verificado.
- El adaptador se entrenó sobre una versión cuantizada a 4 bits (bnb-4bit), lo que puede introducir degradación respecto al modelo base en FP16.
- Repositorio sin tracción (0 descargas, 0 likes) y sin evaluación por parte de la comunidad; no hay garantía de calidad ni mantenimiento.
- Aunque la licencia es Apache 2.0, el uso comercial en dominio legal requiere revisión legal independiente por el riesgo de errores.
- No se especifican limitaciones de contexto más allá de las del base (32.768 tokens), pero el adaptador no ha sido evaluado en secuencias largas.
- El nombre "Morrisons-Law" sugiere un uso corporativo específico; verificar la procedencia de los datos de entrenamiento antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/Yethu-2/Qwen2.5-7B-Morrisons-Law-LoRA
- Modelo base (cuantizado): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
