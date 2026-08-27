# UX4567/Kartik-Kundli-AI-3B-v1.0

## Resumen

Kartik-Kundli-AI-3B-v1.0 es un modelo de generación de texto de 3.085 millones de parámetros, desarrollado por el usuario UX4567 como un ajuste fino (fine-tune) del modelo base UX4567/Kartik-Kundli-AI-3B-Instruct. Está orientado a conversaciones sobre astrología védica (kundli), según se desprende del nombre y de los proyectos asociados en GitHub y la web KundliGPT. El modelo se distribuye en formato safetensors y utiliza la arquitectura Qwen2, lo que lo hace compatible con el ecosistema Transformers y con herramientas de inferencia como text-generation-inference.

El ajuste se realizó mediante entrenamiento supervisado (SFT) utilizando la librería TRL, aunque no se han publicado detalles sobre el dataset empleado ni el número de tokens de entrenamiento. La relevancia actual del modelo radica en su especialización en un dominio concreto (astrología védica), un nicho con demanda creciente en aplicaciones de asistentes conversacionales personalizados. Sin embargo, la información pública es muy limitada: no se especifican licencia, idiomas soportados, contexto máximo ni resultados de benchmarks, lo que dificulta su evaluación rigurosa para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en este repo) |
| Idiomas soportados | no disponible (el nombre sugiere hinglish, pero no confirmado) |
| Licencia | no disponible (en HF figura "no disponible"; en el README aparece "licence: license" como placeholder) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder con atención causal estándar, desarrollado originalmente por Alibaba Cloud. No se han publicado detalles sobre el número de capas, dimensiones ocultas o cabezas de atención, pero al tratarse de un modelo de 3B parámetros, es probable que siga la configuración típica de la familia Qwen2 de ese tamaño (por ejemplo, 36 capas y 16 cabezas, aunque esto no está confirmado). El entrenamiento se realizó mediante ajuste fino supervisado (SFT) con la librería TRL, partiendo del checkpoint instruct del mismo autor. No se indica si se utilizaron técnicas adicionales como RLHF o DPO, ni se especifica la composición del dataset de entrenamiento, el número de tokens procesados o la duración del entrenamiento. Tampoco se mencionan innovaciones técnicas particulares más allá del uso de SFT.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, como se muestra en el ejemplo de uso con el pipeline de Transformers.
- Especialización en astrología védica: por su nombre y los proyectos asociados, se infiere que puede generar interpretaciones de cartas astrales (kundli), predicciones y análisis de dashas y yogas, aunque no hay evidencia pública de su rendimiento en estas tareas.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingües: no confirmadas; el nombre "hinglish" sugiere posible soporte de hindi e inglés, pero no hay datos oficiales.
- Modo de pensamiento (thinking mode), visión o audio: no disponible.

## Casos de uso

- Asistente de astrología védica personalizado: el modelo puede integrarse en una aplicación web o móvil donde el usuario introduce su fecha, hora y lugar de nacimiento, y el modelo genera una interpretación de su kundli, incluyendo análisis de planetas, casas y dashas. Su tamaño de 3B permite desplegarlo en entornos con recursos moderados.
- Chatbot de consultas astrológicas: puede mantener conversaciones sobre compatibilidad zodiacal, predicciones de tránsitos o recomendaciones de remedios (gemas, mantras), siempre que se le proporcione el contexto adecuado.
- Generación de informes de horóscopo: a partir de datos de nacimiento, el modelo puede redactar informes detallados en lenguaje natural, útiles para servicios de suscripción o generación de contenido.
- Herramienta educativa sobre astrología védica: puede responder preguntas sobre conceptos como nakshatras, yogas o muhurta, ayudando a estudiantes o curiosos a entender los fundamentos de esta disciplina.
- Integración en plataformas de consulta en línea: dado su formato safetensors y compatibilidad con text-generation-inference, puede servir como backend para servicios de consulta astrológica en tiempo real, con latencia aceptable en GPUs de gama media.
- Prototipado de aplicaciones de nicho: al ser un modelo pequeño y especializado, es adecuado para experimentar con asistentes conversacionales en dominios verticales sin necesidad de infraestructura masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 3B parámetros en precisión FP16, se necesitan aproximadamente 6 GB de VRAM. Con cuantización a 8 bits, unos 3 GB; a 4 bits, unos 2 GB. Estas cifras son estimaciones estándar para arquitecturas transformer de este tamaño, no datos oficiales.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior es suficiente para FP16. Para cuantización 4 bits, una RTX 2060 (6 GB) podría ser viable. En entornos cloud, una T4 o L4 son opciones económicas.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo modernas con al menos 6 GB de VRAM si se aplica cuantización.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). El repo solo incluye safetensors, por lo que habría que convertir los pesos para usar llama.cpp.
- Latencia y throughput: no disponibles. Para un modelo de 3B en una GPU T4, se puede esperar una latencia de decodificación de unos 20-40 ms por token, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base (UX4567/Kartik-Kundli-AI-3B-Instruct) es un checkpoint intermedio, y no se conocen otros modelos de astrología védica de tamaño similar con datos públicos. Como referencia genérica, se podría comparar con Qwen2-3B-Instruct (modelo base original), pero no hay datos de rendimiento de Kartik-Kundli-AI-3B-v1.0 frente a él. Por tanto, la comparativa se limita a señalar que comparte arquitectura con Qwen2-3B, pero carece de la documentación y evaluación de aquel.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un dominio específico (astrología védica), puede reflejar sesgos culturales o religiosos propios de esa tradición. No hay estudios de sesgo publicados.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar interpretaciones astrológicas inventadas o incorrectas. En un dominio pseudocientífico, esto es especialmente delicado, ya que los usuarios podrían tomar las respuestas como hechos.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto; si es la estándar de Qwen2 (32k tokens), podría manejar conversaciones largas, pero no está confirmado. El soporte de idiomas es incierto; el nombre "hinglish" sugiere una mezcla de hindi e inglés, pero no hay garantía de calidad en otros idiomas.
- Restricciones de licencia: la licencia no está definida. El README usa "licence: license" como placeholder, lo que impide su uso comercial sin aclaración legal. Se recomienda contactar al autor antes de cualquier despliegue en producción.
- Carencia de documentación: no hay información sobre el dataset de entrenamiento, lo que impide evaluar posibles fugas de datos o problemas de calidad. Tampoco hay benchmarks, por lo que su rendimiento real es desconocido.
- Mantenimiento y soporte: el modelo fue creado en agosto de 2026 y no se observa actividad posterior; no hay garantía de actualizaciones o correcciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-v1.0
- Modelo base (Instruct): https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-Instruct
- Modelo relacionado (Kartik-AI-3B): https://huggingface.co/UX4567/Kartik-AI-3B
- Repositorio GitHub del proyecto KundliAI: https://github.com/KundliAI/kundli-ai
- Repositorio alternativo de KundliAI: https://github.com/GuptaDeepak9264/kundli-ai
- Web de KundliGPT (servicio relacionado): https://kundligpt.com/
