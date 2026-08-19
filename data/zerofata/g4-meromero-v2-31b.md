# zerofata/G4-MeroMero-v2-31B

## Resumen

G4-MeroMero-v2-31B es un ajuste fino (fine-tune) del modelo Google Gemma 4 31B It, desarrollado por el usuario independiente zerofata. Está diseñado específicamente para tareas creativas, con un enfoque particular en el roleplay narrativo (RP). Según la descripción del autor, busca ser una versión más creativa del anterior G4-MeroMero-31B, manteniendo la inteligencia del modelo base mientras aumenta la diversidad y calidad de la escritura creativa.

El modelo se basa en la arquitectura transformer de Gemma 4, con 60 capas, tamaño oculto de 5376 y atención por grupos de consulta (GQA). Cuenta con 31.273 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. El autor menciona que el proceso de ajuste se inspiró en varios trabajos de investigación, entre ellos "StoryScope: Investigating..." (título truncado en la documentación disponible).

Este modelo resulta relevante para desarrolladores e investigadores que buscan un LLM open source especializado en generación de texto creativo y narrativo, con la solidez de Gemma 4 como base y un ajuste orientado a mejorar la fluidez, la originalidad y la coherencia en contextos de ficción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención por grupos de consulta (GQA), 60 capas, tamaño oculto 5376, FFN intermedio 21504 |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | Todos (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene pesos en safetensors, sin GGUF ni otras cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint google/gemma-4-31B-it. La arquitectura subyacente corresponde a un transformer decoder estándar con atención por grupos de consulta (GQA): 60 capas, tamaño oculto de 5376, 32 cabezas de consulta y 16 cabezas de clave/valor, con una capa feed-forward de tamaño intermedio 21504. Esta configuración es idéntica a la del modelo base, ya que el ajuste no modifica la arquitectura.

El entrenamiento se realizó mediante aprendizaje supervisado (SFT), según la información disponible en aimodels.fyi. El autor indica que el proceso fue experimental y que el objetivo principal era aumentar la creatividad sin degradar la inteligencia del modelo original. Se menciona la influencia de varios papers de investigación, entre ellos "StoryScope: Investigating..." aunque no se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento ni los hiperparámetros utilizados. Tampoco se indica si se emplearon técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto creativo: el modelo está optimizado para producir narrativa original, diálogos y descripciones con un estilo menos florido y más directo que el modelo base, según la descripción del autor.
- Roleplay narrativo: soporta conversaciones multi-turno en contextos de ficción, manteniendo coherencia con la historia y los personajes.
- Modo de pensamiento y modo sin pensamiento: al igual que el modelo anterior G4-MeroMero-31B, soporta tanto el modo "thinking" (razonamiento explícito) como el modo directo sin razonamiento intermedio.
- Razonamiento general: al estar basado en Gemma 4 31B, conserva las capacidades de razonamiento, matemáticas y comprensión del modelo base, aunque el ajuste prioriza la creatividad.
- Diversidad de respuestas (swipe diversity): el autor indica que el modelo ofrece una mejor variedad de respuestas alternativas en comparación con el original.
- No se dispone de información sobre soporte de tool calling, visión, audio u otras modalidades.

## Casos de uso

- Escritura de ficción creativa: el modelo puede generar capítulos de novelas, relatos cortos o descripciones de escenarios. Su ajuste hacia la creatividad lo hace adecuado para autores que buscan inspiración o un primer borrador.
- Roleplay conversacional en juegos de rol: en plataformas de chat o juegos de texto, el modelo puede interpretar personajes con personalidad y mantener conversaciones coherentes a lo largo de múltiples turnos.
- Generación de guiones y diálogos: para creadores de contenido audiovisual, el modelo puede producir diálogos naturales y con estilo para escenas específicas.
- Creación de contenido para videojuegos: desarrollo de misiones, descripciones de objetos, diálogos de NPC y narrativa ramificada en proyectos independientes.
- Asistencia en escritura de novelas: el modelo puede ayudar a superar bloqueos creativos, proponer giros argumentales o expandir ideas preliminares manteniendo un tono consistente.
- Simulación de personajes en chatbots: integrado en aplicaciones de entretenimiento, el modelo puede actuar como un personaje ficticio con el que los usuarios interactúan, aprovechando su capacidad de mantener contexto narrativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo específico. El autor no ha compartido métricas cuantitativas de rendimiento en la model card ni en las fuentes consultadas.

## Requisitos de hardware

- El tamaño del repositorio es de 62.6 GB, lo que corresponde aproximadamente a pesos en FP16/BF16 para 31.273 millones de parámetros.
- Según LLM Explorer, el modelo requiere aproximadamente 62.5 GB de VRAM para cargarse en precisión completa (FP16). Esto implica que es necesario un GPU con al menos 64 GB de memoria, como un NVIDIA A100 80GB, o bien usar múltiples GPUs (por ejemplo, dos RTX 4090 de 24 GB con reparto de capas).
- No se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) en el repositorio oficial, por lo que no se dispone de datos sobre requisitos de VRAM con cuantización. Los usuarios interesados en ejecutarlo en hardware de consumo deberían esperar a que se publiquen cuantizaciones o realizarlas manualmente.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede servirse con frameworks como vLLM, TensorRT-LLM o TGI en entornos con GPU de gran capacidad. Para inferencia en CPU o GPU de baja VRAM, sería necesario convertir a GGUF y usar llama.cpp u Ollama, aunque no se proporcionan archivos GGUF oficiales.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| G4-MeroMero-v2-31B | 31.3B | No disponible | Apache 2.0 | Creatividad narrativa y RP |
| G4-MeroMero-31B | 31.3B | No disponible | Apache 2.0 | Creatividad, menos verboso que v2 |
| google/gemma-4-31B-it | 31.3B | No disponible | Apache 2.0 | Modelo base, uso general |

La comparativa se limita a los modelos directamente relacionados, ya que no se dispone de datos de rendimiento para establecer comparaciones con otros modelos creativos de tamaño similar (por ejemplo, Llama 3.1 70B o Mistral Large). El modelo v2 se diferencia de su predecesor por buscar una mayor creatividad, mientras que el modelo base Gemma 4 31B It ofrece un comportamiento más general sin el ajuste específico para narrativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo. Al ser un fine-tune de Gemma 4, hereda los posibles sesgos del modelo base, aunque no se han documentado evaluaciones de sesgo para esta versión.
- Riesgo de alucinación: como cualquier LLM, el modelo puede generar información falsa o inventada, especialmente en contextos donde la creatividad se prioriza sobre la factualidad. No es adecuado para tareas que requieran precisión verificable.
- La longitud de contexto no está documentada en las fuentes disponibles. Se recomienda verificar la configuración del modelo base Gemma 4 para conocer el límite real antes de desplegarlo en producción.
- El ajuste creativo puede degradar el rendimiento en tareas que requieren razonamiento estricto o adherencia a instrucciones precisas, aunque el autor afirma que la inteligencia se mantiene "en paridad" con el original.
- No se han publicado cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversión.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia del modelo base Gemma 4 para asegurar compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Modelo anterior G4-MeroMero-31B: https://huggingface.co/zerofata/G4-MeroMero-31B
- Vista de arquitectura en hfviewer: https://hfviewer.com/zerofata/G4-MeroMero-v2-31B
- Ficha en LLM Explorer: https://llm-explorer.com/model/zerofata%2FG4-MeroMero-v2-31B,4EnQ8ulUmyaMNAyBspmm00
- Análisis en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/g4-meromero-31b-zerofata
