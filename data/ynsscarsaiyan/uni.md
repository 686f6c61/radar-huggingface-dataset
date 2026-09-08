# YNSScarSaiyan/uni

## Resumen

Uni es un modelo de lenguaje experimental con una arquitectura propia denominada "event-planetary", desarrollada por YNSScarSaiyan. A diferencia de los transformers convencionales, este modelo trata los tokens como masas en un espacio latente, donde el significado se selecciona mediante un proceso de colapso y la dimensión oculta se expande y se contrae a lo largo de la red. La arquitectura implementa tres mecanismos principales: "Primordial Boil" (ruido térmico en entrenamiento), "Big Bang/Big Crunch" (expansión y contracción dimensional) y "Planetary Gravity Attention" (una atención basada en una analogía gravitatoria en lugar del producto punto escalado). El modelo tiene 1.40B parámetros, 12 capas y utiliza el tokenizador de Qwen1.5-1.8B-Chat con un vocabulario de 151,936 entradas.

El modelo ha sido entrenado en una mezcla de datos de instrucción y de agentes/tool use, incluyendo Tulu-3, OpenHermes-2.5, UltraChat, Orca AgentInstruct, Agent-FLAN, xLAM, ToolACE, Glaive y Hermes function calling. Se reanudó desde un checkpoint de preentrenamiento y se continuó en hardware AMD MI300X con bf16. Uni es relevante porque explora una ruta no estándar en el diseño de modelos de lenguaje, con un enfoque en capacidades de agente y uso de herramientas, aunque no se han publicado benchmarks que permitan evaluar su rendimiento frente a modelos establecidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Event-planetary LLM (Big Bang/Big Crunch con atención de gravedad planetaria) |
| Parámetros totales | 1.40B |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (se menciona seq 1024 en entrenamiento, pero no se especifica la ventana de contexto) |
| Tipos de cuantización | no disponible (el entrenamiento se realizó en bf16; no se publican pesos cuantizados) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

Uni implementa una arquitectura no estándar que se aleja del diseño Transformer convencional. El proceso "Primordial Boil" descompone cada token en 12 burbujas en competencia; durante el entrenamiento, un término de calor (boil_temp=1.5) añade ruido en cada paso forward y una puerta Hamiltoniana colapsa las burbujas en una singularidad. En evaluación, el ruido se desactiva, lo que hace que la generación sea determinista para una entrada dada. La dimensión oculta sigue un ciclo "Big Bang / Big Crunch": la representación entra con 2048 dimensiones, se dilata hasta 16384 en las capas intermedias y se contrae de nuevo antes de la cabeza de vocabulario. La atención planetaria sustituye el producto punto escalado por una fuerza gravitatoria: los tokens tienen masa y coordenadas, y la interacción se calcula como G * (m_q * m_k) / (distancia^2 + eps).

El entrenamiento se reanudó desde el paso 400000 de un preentrenamiento previo, y continuó con una mezcla de datos de instrucción y de agentes/tool use. La parte de instrucción incluye Tulu-3, OpenHermes-2.5 y UltraChat; la parte de agentes incluye Orca AgentInstruct, Agent-FLAN, xLAM, ToolACE, Glaive y Hermes function calling. El hardware utilizado fue una AMD MI300X, con bf16, batch size 1 y secuencia de 1024 tokens. No se menciona explícitamente un proceso de RLHF o DPO; el ajuste parece ser supervisado sobre datos de instrucción y de llamadas a herramientas.

## Capacidades

- Generación de texto en inglés, con un tokenizador de Qwen1.5-1.8B-Chat.
- Soporte de tool calling y function calling, entrenado con datasets como ToolACE, Glaive y Hermes function calling.
- Soporte de agentes y razonamiento multi-paso, gracias a la inclusión de Orca AgentInstruct, Agent-FLAN y xLAM en el entrenamiento.
- Modo de chat determinista en evaluación, al desactivarse el ruido del "Primordial Boil".
- No se documentan capacidades de visión, audio ni multimodalidad.
- No se documenta un modo de "thinking" explícito ni razonamiento visible.

## Casos de uso

- Investigación en arquitecturas alternativas de atención: el modelo permite estudiar el comportamiento de una atención basada en gravedad frente a la atención por producto punto, en un entorno de código abierto.
- Prototipado de agentes con herramientas: al estar entrenado en datasets de function calling, puede servir para experimentar con asistentes que llaman a funciones externas, aunque su rendimiento no está validado.
- Experimentación con modelos de lenguaje no estándar: para investigadores que quieran comparar el ciclo Big Bang/Big Crunch con arquitecturas de ancho fijo.
- Chatbots de dominio específico en inglés: el modelo puede ajustarse o probarse en tareas conversacionales, siempre que se acepte la falta de benchmarks.
- Análisis de efectos del ruido en entrenamiento: el "Primordial Boil" ofrece un caso de estudio sobre cómo el ruido térmico afecta la pérdida y la estabilidad del entrenamiento.
- Evaluación de sistemas de tool use en arquitecturas experimentales: útil para comprobar si la atención planetaria mantiene la capacidad de seguir instrucciones de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para inferencia.
- El entrenamiento se realizó en una AMD MI300X con bf16, batch size 1 y secuencia de 1024 tokens.
- Para inferencia, al tratarse de un modelo de 1.40B parámetros, los pesos en bf16 ocupan aproximadamente 2,8 GB. Considerando activaciones, logits y buffers, se necesitaría una GPU con al menos 4-6 GB de VRAM, pero esta cifra es una estimación no confirmada.
- El modelo no es compatible con vLLM, llama.cpp, Ollama o TGI de forma nativa, ya que no sigue el formato Transformers. Debe cargarse con el código fuente personalizado: uni_big_bang.py, uni_model.py, planetary_attention.py y chat_uni.py.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. Aunque el modelo comparte tokenizador con Qwen1.5-1.8B-Chat, su arquitectura es completamente distinta y no existen benchmarks que permitan una comparación técnica con otros modelos de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al estar entrenado en datasets de instrucción y agentes, el modelo puede heredar sesgos presentes en esos conjuntos de datos.
- Riesgo de alucinación: previsiblemente alto, dado que no se han publicado evaluaciones de fiabilidad ni de alucinación.
- Limitaciones de idioma: solo se documenta soporte para inglés.
- Longitud de contexto: no especificada, lo que impide conocer los límites de memoria a largo plazo.
- Licencia: Apache 2.0 permite uso comercial, pero exige incluir el aviso de licencia y el código fuente en las redistribuciones.
- Incompatibilidad con herramientas estándar: no es un modelo Transformers, por lo que no puede cargarse con from_pretrained ni desplegarse en la mayoría de frameworks de inferencia existentes sin adaptación.
- Documentación limitada: la model card es la única fuente de información; no se han publicado papers, evaluaciones ni guías de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YNSScarSaiyan/uni
- Modelo hermano SImi: https://huggingface.co/YNSScarSaiyan/simi-weights
- Modelo hermano Vegeta: https://huggingface.co/YNSScarSaiyan/vegeta-weights
