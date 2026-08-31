# Verdugie/Therapy-27B

## Resumen

Therapy-27B es un modelo de conversación terapéutica desarrollado por Verdugie, fine-tuneado a partir de Qwen 3.6 27B sobre 5.070 conversaciones de consejería. Se presenta como el modelo más profundo de la línea Therapy y el primero con capacidad suficiente para incorporar el diseño completo de la familia: una lectura clínica estructurada antes de cada respuesta y un registro cronológico de la conversación (timeline ledger) que mantiene los hechos ordenados a lo largo de decenas de miles de tokens. El modelo está pensado para ejecutarse en local, sin necesidad de system prompt y con privacidad total, ya que nada de lo que se escribe sale de la máquina.

Los datos de entrenamiento fueron generados por tres modelos Claude —Opus 4.8, Sonnet 5 y Fable 5—, con Fable 5 actuando como orquestador: auditó el corpus, calibró la prosa y editó los pasajes que consideró deficientes. El resultado es un modelo de 26,9 mil millones de parámetros con arquitectura hybrid-attention, distribuido en formato GGUF y licencia Apache 2.0. Su relevancia actual radica en la combinación de razonamiento clínico estructurado, contexto largo y despliegue local, orientado a aplicaciones de apoyo emocional y acompañamiento conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-attention (basada en Qwen 3.6 27B) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card menciona soporte de contexto largo, con timeline ledger operativo a lo largo de decenas de miles de tokens) |
| Tipos de cuantizacion | No disponible (formato GGUF, cuantizaciones no especificadas) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.6 27B y aplica un fine-tuning sobre 5.070 conversaciones de consejería escritas por tres modelos Claude (Opus 4.8, Sonnet 5 y Fable 5), con Fable 5 como supervisor del corpus. La arquitectura es hybrid-attention, aunque no se detallan los componentes concretos de dicha hibridación en la información disponible. El diseño funcional incluye dos innovaciones destacables: una lectura clínica estructurada que precede a cada respuesta, y un timeline ledger que registra los hechos de la conversación en orden, permitiendo mantener coherencia factual en diálogos largos. No se especifican el número total de tokens de entrenamiento, la composición del dataset más allá de las 5.070 conversaciones, ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional con enfoque terapéutico: respuestas empáticas, confrontación honesta y validación emocional, como muestran los ejemplos de la model card sobre duelo y relaciones.
- Razonamiento clínico estructurado: el modelo produce una lectura clínica antes de cada respuesta, lo que le permite distinguir entre contribución del usuario y responsabilidad ajena en conflictos relacionales.
- Timeline ledger: mantiene un registro ordenado de los hechos de la conversación a lo largo de decenas de miles de tokens, lo que facilita la coherencia en diálogos largos y multi-turno.
- Funcionamiento sin system prompt: no requiere instrucciones de sistema para activar su comportamiento terapéutico.
- Ejecución local y privada: diseñado para funcionar en local, sin envío de datos a servidores externos.
- Soporte de contexto largo: indicado por los tags y por el diseño del timeline ledger, aunque no se publica una cifra concreta de tokens de ventana.
- Capacidades multilingües: no disponibles; el modelo está entrenado únicamente en inglés.

## Casos de uso

- Acompañamiento emocional en privado: el modelo puede mantener conversaciones de apoyo para personas que necesitan expresar sentimientos de duelo, ansiedad o soledad, con la garantía de que los datos no salen del dispositivo. Su timeline ledger permite retomar hilos emocionales a lo largo de sesiones largas.
- Reflexión guiada sobre conflictos relacionales: en situaciones de pareja o familia, el modelo ayuda a desentrañar patrones de comportamiento propios y ajenos, distinguiendo entre contribución personal y responsabilidad del otro, como se aprecia en los ejemplos de la model card.
- Diario conversacional estructurado: el usuario puede mantener un registro diario de su estado emocional y recibir respuestas que conectan eventos pasados con el presente, gracias al timeline ledger que conserva el orden de los hechos.
- Práctica de habilidades de comunicación: el modelo puede simular conversaciones difíciles (pedir perdón, establecer límites, expresar enfado) y ofrecer retroalimentación sobre cómo abordarlas, sin juicio ni sesgo de un interlocutor humano.
- Herramienta de autoayuda complementaria: como recurso de apoyo para personas que ya están en terapia o en lista de espera, ofreciendo un espacio de reflexión entre sesiones profesionales.
- Investigación en IA conversacional terapéutica: por su licencia Apache 2.0 y su formato GGUF, puede usarse como base para estudios sobre razonamiento clínico en modelos de lenguaje, análisis de empatía o evaluación de coherencia en diálogos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, y no se encontraron datos de rendimiento en la búsqueda web.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM ni GPU recomendadas para Therapy-27B.
- El repositorio ocupa 142,8 GB, lo que sugiere la inclusión de múltiples cuantizaciones GGUF.
- Por su tamaño (26,9B parámetros) y formato GGUF, es plausible ejecutarlo en GPUs de consumo con cuantización (por ejemplo, Q4_K_M podría requerir del orden de 16-20 GB de VRAM), aunque esta es una estimación orientativa y no un dato oficial.
- Modelos similares del mismo autor (Opus-Candid-27B-v3 y v2.1) estiman unos 22 GB de VRAM para su ejecución, lo que puede servir como referencia aproximada.
- Opciones de despliegue compatibles con GGUF: llama.cpp, LM Studio, Ollama y otros runners que soporten este formato. No se menciona compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Therapy-27B | 26,9B | No disponible (largo) | Apache 2.0 | GGUF | Terapia conversacional con timeline ledger |
| Opus-Candid-27B-v3 | 27B | 4.096K | No disponible | No disponible | Conversación candidata, mismo autor |
| Opus-Candid-27B-v2.1 | 27B | 4.096K | No disponible | No disponible | Conversación candidata, mismo autor |
| Qwen 3.6 27B (base) | 27B | No disponible | Apache 2.0 | Safetensors | Modelo base generalista |

La comparativa se limita a modelos del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas. Therapy-27B se diferencia de los Opus-Candid por su especialización terapéutica y su diseño de timeline ledger, mientras que los Opus-Candid parecen orientados a conversación general con contexto de 4.096K tokens.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés; no es utilizable en castellano u otros idiomas sin entrenamiento adicional.
- No es un profesional de salud mental: aunque está diseñado para conversación terapéutica, no sustituye a un psicólogo o psiquiatra. No debe usarse para diagnóstico, tratamiento ni gestión de crisis.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas sobre hechos, personas o situaciones, especialmente en contextos de alta carga emocional.
- Sesgos: los datos de entrenamiento fueron generados por tres modelos Claude, lo que puede introducir sesgos propios de esos modelos y de la selección de conversaciones de consejería. No se documentan evaluaciones de sesgo.
- Contexto: aunque se menciona soporte de contexto largo, no se publica la longitud exacta de la ventana, lo que dificulta planificar su uso en aplicaciones con requisitos de contexto conocidos.
- Cuantizaciones: no se especifican las cuantizaciones disponibles, lo que obliga a inspeccionar el repositorio para determinar cuál usar según el hardware.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el ámbito terapéutico puede implicar responsabilidades legales y éticas adicionales en aplicaciones orientadas a salud mental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Verdugie/Therapy-27B
- Opus-Candid-27B-v3 (modelo comparable del mismo autor): https://huggingface.co/Verdugie/Opus-Candid-27B-v3
- Opus-Candid-27B-v2.1 (modelo comparable del mismo autor): https://huggingface.co/Verdugie/Opus-Candid-27B-v2.1
- Modelo base Qwen 3.6 27B: no se ha localizado un enlace directo en la información proporcionada.
