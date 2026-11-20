# vgcarlol/vialbot

## Resumen

VialBot es un sistema de generación aumentada por recuperación (RAG) orientado a consultas sobre tránsito y educación vial en Guatemala, desarrollado por Carlos Alberto Valladares Guerra como trabajo de graduación en la Universidad del Valle de Guatemala (2026). El repositorio publica el conjunto de artefactos que componen el sistema: un LLM generador afinado con LoRA sobre Qwen2.5-1.5B-Instruct, un modelo de embeddings con fine-tuning contrastivo, un clasificador de tema y dominio basado en regresión logística, y una base vectorial ChromaDB con la Ley de Tránsito (Decreto 132-96) y su Reglamento (AG 273-98).

El componente central es un transformer decoder-only de 1.543.714.304 parámetros (1,5B) derivado de Qwen2.5-1.5B-Instruct, adaptado mediante LoRA (versión v3) y distribuido tanto como adaptador en formato MLX como en GGUF cuantizado Q8_0 para su uso con Ollama. El modelo está especializado en español y en el dominio legal del tránsito guatemalteco, y se integra en una arquitectura de servicios orquestada con Docker Compose.

La relevancia del proyecto es doble: por un lado, demuestra un pipeline RAG completo y reproducible sobre un modelo pequeño que puede ejecutarse en hardware modesto; por otro, aplica técnicas de ajuste eficiente (LoRA) y cuantización a un dominio legal concreto con documentación normativa acotada, lo que reduce el coste computacional frente a alternativas de mayor tamaño. El repositorio no incluye resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), afinado con LoRA |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (GGUF); adaptador LoRA en formato MLX |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA (MLX), joblib (clasificador) |

## Arquitectura y entrenamiento

El modelo generador parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar, y se adapta mediante un LoRA propio (v3) entrenado sobre el dominio de tránsito y educación vial de Guatemala. El repositorio no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO sobre el adaptador; únicamente se indica que el adaptador se entrenó con MLX y que el resultado se cuantizó a Q8_0 en GGUF para su despliegue con Ollama.

El sistema completo no se limita al LLM: incorpora un modelo de embeddings (`paraphrase-multilingual-MiniLM-L12-v2`) con fine-tuning contrastivo, un clasificador de tema y de dominio implementado como regresión logística sobre esos embeddings (guardado en joblib), y una base vectorial ChromaDB poblada con la Ley de Tránsito (Decreto 132-96) y su Reglamento (AG 273-98). La combinación de clasificador, recuperación vectorial y generación constituye el pipeline RAG que da servicio a las consultas del usuario. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en español orientada a consultas sobre normativa de tránsito y educación vial de Guatemala.
- Recuperación aumentada sobre un corpus legal acotado (Decreto 132-96 y AG 273-98) mediante ChromaDB y embeddings afinados.
- Clasificación de tema y de dominio previa a la generación, para enrutar o filtrar consultas.
- Integración con Ollama mediante el `Modelfile` incluido, lo que permite registrar el modelo como `vialbot`.
- Despliegue como servicio contenerizado con Docker Compose.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al español según la model card.

## Casos de uso

- Atención al ciudadano sobre tránsito: el pipeline clasifica la consulta, recupera los artículos relevantes de la Ley de Tránsito y genera una respuesta en español fundamentada en el texto normativo recuperado.
- Educación vial interactiva: el modelo puede responder preguntas sobre señalización, requisitos de licencia o sanciones, apoyándose en el corpus vectorizado para mantener la respuesta anclada a la normativa.
- Asistente para autoescuelas y centros de formación vial: integrado vía Ollama, permite desplegar un servicio local que responde dudas de alumnos sin depender de APIs externas.
- Prototipado de asistentes legales de dominio acotado: el repositorio sirve como plantilla reproducible (embeddings + clasificador + ChromaDB + LoRA + GGUF) para construir asistentes sobre otras normativas.
- Despliegue en hardware modesto: al ser un modelo de 1,5B cuantizado a Q8_0, puede ejecutarse en equipos sin GPU dedicada, lo que facilita pruebas y demos en entornos académicos.
- Filtrado y enrutado de consultas: el clasificador de tema y dominio en joblib permite descartar consultas fuera de alcance antes de invocar al generador, reduciendo coste y alucinaciones.
- Investigación sobre RAG legal en español: el conjunto de artefactos permite reproducir experimentos de recuperación y generación sobre un corpus normativo real y acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1,5B en Q8_0 el peso ronda los 1,6 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPU de consumo con suficiente memoria libre.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-3 GB de VRAM libre para el generador en Q8_0, aunque el dato no está confirmado en la documentación.
- Opciones de despliegue: Ollama (vía `Modelfile` incluido), MLX (adaptador LoRA), Docker Compose para el conjunto de servicios.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VialBot (este) | 1,5B | no disponible | apache-2.0 | Hugging Face + GitHub | LoRA sobre Qwen2.5-1.5B-Instruct; pipeline RAG legal guatemalteco |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | apache-2.0 | Hugging Face | Modelo base generalista; sin adaptación al dominio |
| paraphrase-multilingual-MiniLM-L12-v2 | no disponible | no disponible | no disponible en esta ficha | Hugging Face | Componente de embeddings del propio sistema, no alternativa generativa |
| Modelos legales en español de mayor tamaño | variable | variable | variable | variable | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy acotado (tránsito y educación vial de Guatemala); su uso fuera de ese ámbito no está validado.
- No se han publicado evaluaciones de sesgo, robustez ni tasas de alucinación; en un contexto legal, una respuesta incorrecta puede tener consecuencias prácticas.
- El corpus normativo se limita al Decreto 132-96 y su Reglamento (AG 273-98); reformas posteriores o normativa complementaria podrían no estar cubiertas.
- La longitud de contexto no está documentada, lo que impide planificar consultas largas o conversaciones multi-turno extensas con garantías.
- El soporte lingüístico se declara únicamente en español; no hay evidencia de comportamiento en otros idiomas.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los componentes auxiliares (embeddings, corpus) antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del artefacto.
- El despliegue depende de instrucciones manuales (copiar carpetas, registrar en Ollama, levantar Docker Compose); no se documentan procesos de CI ni tests automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/vgcarlol/vialbot
- Repositorio del proyecto: https://github.com/GraduacionesUVG/2026-221164-valladares-guerra-carlos-alberto
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
