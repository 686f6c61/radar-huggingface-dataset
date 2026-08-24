# vsamuel/qwen3-4b-clinical-note-sft-run2-checkpoint-114

## Resumen

El repositorio `vsamuel/qwen3-4b-clinical-note-sft-run2-checkpoint-114` contiene un adaptador LoRA entrenado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Su propósito es generar notas clínicas estructuradas a partir de transcripciones de encuentros médicos desidentificados, siguiendo un formato específico definido por el clínico. Se trata de un artefacto de investigación y evaluación, no de un sistema listo para producción clínica.

El adaptador fue seleccionado en el paso 114 de un experimento de entrenamiento (run 2) por presentar el mejor perfil de validación parcial en cuanto a fidelidad de la fuente, completitud y adherencia a las instrucciones. El modelo base es un transformer decoder-only de 4 mil millones de parámetros, con una ventana de contexto de 32 768 tokens, y el adaptador añade una capa de ajuste de bajo rango sobre los módulos de atención y MLP. La licencia es Apache 2.0, lo que permite uso comercial con las debidas atribuciones.

La relevancia de este adaptador radica en demostrar cómo un modelo generalista de tamaño medio puede especializarse en una tarea de dominio médico con un coste computacional reducido, manteniendo la capacidad de generar texto coherente y estructurado. No obstante, el autor advierte explícitamente de que las salidas pueden contener errores u omisiones y requieren revisión humana obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bfloat16) |
| Idiomas soportados | No disponible (no se especifican en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo de la familia Qwen3 con arquitectura transformer decoder-only y atención causal. El entrenamiento se realizó mediante supervisión fina (SFT) con la técnica LoRA, utilizando un rango de 16, alpha de 32 y dropout de 0.05. Los módulos objetivo fueron `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, cubriendo tanto las proyecciones de atención como las del MLP.

El proceso de entrenamiento empleó una tasa de aprendizaje de 2e-4 con programación coseno y un 5 % de calentamiento, un tamaño de lote efectivo de 8 (lote 1 con acumulación de gradientes de 8), y una longitud máxima de secuencia de 32 768 tokens. La precisión fue bfloat16 y la semilla fijada en 42. El checkpoint seleccionado (paso 114) se eligió de forma offline basándose en el perfil de validación parcial, sin usar el conjunto de prueba retenido. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de notas clínicas estructuradas a partir de transcripciones de encuentros desidentificados, incluyendo contexto, detalles del paciente e instrucciones de formato específicas.
- Adherencia a un formato de salida definido por el clínico, gracias al entrenamiento supervisado con ejemplos etiquetados.
- Generación de texto conversacional (pipeline `text-generation`), aunque su uso previsto es la tarea de notas clínicas.
- Capacidad de manejar contextos largos (hasta 32 768 tokens), lo que permite procesar transcripciones extensas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso explícito.

## Casos de uso

- Investigación en procesamiento de lenguaje natural clínico: el adaptador sirve como punto de partida para estudiar la generación de notas estructuradas, la fidelidad de la información y la completitud en dominios médicos.
- Evaluación de modelos de generación de texto clínico: permite comparar la calidad de las salidas frente a otros adaptadores o modelos generalistas en métricas de exactitud y formato.
- Asistencia a la documentación clínica (con supervisión humana): puede generar borradores de notas a partir de transcripciones, que un profesional sanitario debe revisar y corregir antes de su uso.
- Desarrollo de sistemas de apoyo a la decisión clínica: integrado en un pipeline de investigación, puede ayudar a resumir encuentros y extraer información relevante, siempre con validación experta.
- Entrenamiento de modelos de resumen de conversaciones médicas: el adaptador puede utilizarse como base para transferir el conocimiento a otras tareas de resumen o extracción de información clínica.
- Pruebas de robustez y sesgo en modelos de dominio: al ser un artefacto de investigación, permite analizar cómo se comporta el modelo ante variaciones en las transcripciones, formatos o instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "perfil de validación parcial" (partial-pass profile) como criterio de selección del checkpoint, pero no se proporcionan métricas numéricas concretas (como MMLU, HumanEval, GSM8K u otras). Tampoco se comparan resultados con modelos similares.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB, pero el modelo base Qwen3-4B-Instruct-2507 requiere recursos adicionales. En bfloat16, el modelo base ocupa alrededor de 8 GB de VRAM.
- Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), el modelo base puede caber en GPUs consumer con 6-8 GB de VRAM, como una RTX 3060 o RTX 4060.
- Para una inferencia cómoda con contexto largo (32 768 tokens), se recomienda al menos 12-16 GB de VRAM, como una RTX 3090, RTX 4090 o una A100.
- Opciones de despliegue: el adaptador se carga con `transformers` y `peft` (como se muestra en el código de ejemplo). También puede convertirse a formato GGUF para su uso con `llama.cpp` u Ollama, aunque no se proporciona soporte oficial.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. Existe otro adaptador similar en Hugging Face (`mdvmlhtr/clinical-note-qwen3-4b`), pero no se han publicado detalles de su configuración ni resultados. El modelo base Qwen3-4B-Instruct-2507 es el punto de referencia natural, pero no es directamente comparable porque el adaptador modifica su comportamiento para una tarea específica. Se recomienda consultar la documentación de Qwen3 para conocer las capacidades generales del modelo base.

## Limitaciones y advertencias

- El adaptador puede omitir, distorsionar o inventar información clínica, tal como advierte el autor en la model card.
- No debe utilizarse para diagnosticar, recomendar tratamientos ni crear registros médicos sin supervisión humana cualificada.
- Está entrenado para una tarea muy específica (generación de notas clínicas) y puede fallar en otras tareas de lenguaje general.
- No se especifican sesgos conocidos, pero al entrenarse con datos clínicos desidentificados, podría heredar sesgos presentes en dichos datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara que es un artefacto de investigación y no asume responsabilidad por su uso en entornos clínicos reales.
- No se proporcionan garantías de privacidad ni cumplimiento de normativas sanitarias (como HIPAA o GDPR) para el manejo de datos de pacientes.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/vsamuel/qwen3-4b-clinical-note-sft-run2-checkpoint-114
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Adaptador similar (mdvmlhtr/clinical-note-qwen3-4b): https://huggingface.co/mdvmlhtr/clinical-note-qwen3-4b
