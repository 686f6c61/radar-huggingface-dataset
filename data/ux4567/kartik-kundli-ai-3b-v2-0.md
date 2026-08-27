# UX4567/Kartik-Kundli-AI-3B-v2.0

## Resumen

El modelo UX4567/Kartik-Kundli-AI-3B-v2.0 es un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3B) publicado en HuggingFace por el usuario UX4567. El tag `qwen2` sugiere que está basado en la arquitectura Qwen2, aunque no se confirma oficialmente. Por el nombre y los resultados de búsqueda asociados, parece estar orientado a la generación de cartas astrales védicas (Kundli) y predicciones astrológicas, posiblemente como un asistente conversacional especializado en ese dominio.

El repositorio ocupa 30,9 GB, lo que resulta inusualmente grande para un modelo de 3B de parámetros, lo que podría indicar la presencia de múltiples archivos de pesos, cuantizaciones o versiones adicionales. El modelo fue creado el 27 de agosto de 2026 y actualizado el mismo día. No se dispone de información sobre licencia, idiomas soportados, pipeline de uso ni datos de entrenamiento. A pesar de su reciente publicación, no registra descargas y solo tiene un like, lo que sugiere que es un proyecto muy reciente o de alcance limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag sugiere Qwen2, sin confirmar) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, posiblemente también GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (también se menciona uso con llama.cpp, lo que sugiere GGUF) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado ni las técnicas de alineación (RLHF, DPO, etc.). El tag `qwen2` en HuggingFace apunta a que el modelo podría derivar de la familia Qwen2, pero no hay confirmación en la ficha del repositorio. El tamaño de 3B de parámetros es consistente con modelos de la escala pequeña, adecuados para inferencia en hardware de consumo. El peso del repositorio (30,9 GB) sugiere que se incluyen múltiples archivos, posiblemente diferentes cuantizaciones o versiones del modelo, pero no se detalla su contenido.

## Capacidades

No se han publicado descripciones de capacidades específicas en la información disponible. Por el nombre y el contexto de los resultados de búsqueda, se infiere que el modelo podría estar especializado en:

- Generación de cartas astrales védicas (Kundli) y análisis astrológico
- Predicciones basadas en Dashas, Ashtakavarga y otros sistemas de la astrología védica
- Conversación multi-turno sobre temas de astrología, aunque no se confirma

No hay evidencia de soporte para tool calling, agentes, razonamiento multi-paso, visión o audio. Tampoco se especifican capacidades multilingües.

## Casos de uso

Dado que no se dispone de documentación oficial, los casos de uso son hipotéticos y basados en el nombre del modelo y los resultados de búsqueda:

- Generación de cartas astrales personalizadas: el modelo podría recibir fecha, hora y lugar de nacimiento y devolver un análisis de la carta védica, aunque no se ha verificado su precisión.
- Asistente de astrología védica: podría responder preguntas sobre planetas, casas, signos y tránsitos, pero no hay datos que confirmen su fiabilidad.
- Interpretación de Dashas y períodos planetarios: podría explicar las fases de la vida según el sistema védico, sin garantías de exactitud.
- Análisis de compatibilidad entre personas: podría comparar cartas para evaluar relaciones, aunque no se ha demostrado su capacidad.
- Generación de informes de remedios astrológicos: podría sugerir gemas, mantras u otras prácticas, con el riesgo de ofrecer consejos no verificados.
- Integración en aplicaciones de astrología: podría usarse como backend para chatbots o generadores de informes, pero requiere validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware. Sin embargo, para un modelo de 3B de parámetros, se pueden hacer estimaciones generales:

- VRAM estimada para inferencia: en FP16, un modelo de 3B requiere aproximadamente 6 GB de VRAM; en cuantización de 8 bits, unos 3,5 GB; en 4 bits, unos 2 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para FP16; GPUs con 4-6 GB pueden funcionar con cuantización.
- En consumer GPU: sí, cabe en GPUs de gama media y baja con cuantización.
- Opciones de despliegue: llama.cpp (mencionado en los resultados de búsqueda), Ollama, vLLM, TGI, entre otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (astrología védica). El propio autor ha publicado otros modelos relacionados, como `UX4567/Kartik-AI-3B` y `UX4567/Kartik-Kundli-AI-3B-Instruct`, pero no se ofrecen detalles técnicos ni comparativas. No se puede establecer una comparación rigurosa sin datos adicionales.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones específicas.
- Al ser un modelo sin documentación, su fiabilidad en tareas de astrología es desconocida y debe tratarse como experimental.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o su redistribución.
- El tamaño del repositorio (30,9 GB) sugiere que puede contener múltiples archivos, pero no se detalla su contenido ni su procedencia.
- No hay evidencia de que el modelo haya sido evaluado en tareas generales de lenguaje; su especialización en astrología podría limitar su rendimiento en otros dominios.
- La fecha de creación (2026) es futura en relación con el conocimiento actual, lo que podría indicar un error en los metadatos o un proyecto muy reciente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-v2.0
- Modelo relacionado: https://huggingface.co/UX4567/Kartik-AI-3B
- Modelo instruct relacionado: https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-Instruct
- Sitio web de Jyotish AI (astrología védica): https://jyotishai.online/
