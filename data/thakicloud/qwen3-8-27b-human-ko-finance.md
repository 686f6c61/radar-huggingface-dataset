# ThakiCloud/Qwen3.8-27B-Human-KO-Finance

## Resumen

ThakiCloud/Qwen3.8-27B-Human-KO-Finance es un modelo de lenguaje de 27 mil millones de parámetros, desarrollado por ThakiCloud como fine-tuning del modelo ThakiCloud/Qwen3.8-27B-Human-KO. Está especializado en consultas de cumplimiento normativo para el sector de valores coreano, concretamente en garantizar que las respuestas a clientes incluyan los avisos obligatorios y respeten el principio de idoneidad, sin necesidad de instrucciones adicionales en el prompt.

El modelo aborda un problema crítico en la atención al cliente financiera: la omisión de avisos legales y la falta de evaluación de la adecuación de los productos al perfil del inversor. Su relevancia radica en que combina un modelo base de 27B con un componente determinista de verificación (denominado «gate») que detecta y corrige posibles incumplimientos. Según el autor, el uso exclusivo de los pesos no garantiza los resultados; el gate debe desplegarse junto al modelo para alcanzar una cobertura de avisos del 100 %.

La arquitectura corresponde a la familia Qwen (Qwen3.8-27B), y el entrenamiento se realizó con datos sintéticos generados por modelos propios. No se dispone de información sobre la longitud de contexto en los datos proporcionados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, base Qwen3.8-27B) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado sobre ThakiCloud/Qwen3.8-27B-Human-KO, que a su vez deriva de Qwen/Qwen3.8-27B, todos bajo licencia Apache-2.0. El corpus de entrenamiento está compuesto por datos sintéticos generados por modelos de servicio del propio autor, orientados a conversaciones de asesoramiento financiero en coreano.

La innovación técnica principal no está en la arquitectura del modelo, sino en el componente externo denominado «gate». Se trata de un verificador determinista que evalúa la salida generada y ejecuta siete tipos de juicios: aviso obligatorio, idoneidad, verificación basada en salida, juicio factual y ejecución. Este gate garantiza que ciertos requisitos normativos se cumplan de forma determinista, compensando la naturaleza probabilística de la generación. Según la model card, sin el gate la cobertura de avisos es de 0.905 y pueden aparecer errores factuales; con el gate, la cobertura alcanza 1.000 y los errores factuales se reducen a 0 en el conjunto de evaluación.

## Capacidades

- Generación de texto en coreano especializada en consultas de clientes de valores.
- Cumplimiento de avisos obligatorios según la normativa coreana (estándar de recomendación de inversión de la Asociación de Inversiones Financieras y artículo 19 de la Ley de Protección del Consumidor Financiero).
- Evaluación del principio de idoneidad: el modelo determina si una recomendación de producto es adecuada para el perfil del cliente.
- Verificación determinista de la salida mediante el gate, que detecta omisiones de avisos y errores factuales.
- Capacidad de rechazo de consultas que no pueden atenderse adecuadamente (con una tasa de sobre-rechazo de 0.044).
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso explícito ni capacidades multimodales.

## Casos de uso

- Atención al cliente en firmas de valores coreanas: el modelo gestiona consultas de clientes sobre productos de inversión, asegurando que cada respuesta incluya los avisos obligatorios y respete la normativa de idoneidad, lo que reduce el riesgo de sanciones regulatorias.
- Verificación de idoneidad en asesoramiento financiero: el modelo evalúa si una recomendación concreta se ajusta al perfil de riesgo y a la situación del cliente, generando una justificación clara que puede ser revisada por un asesor humano.
- Automatización de respuestas en plataformas de banca privada: integrado en un CRM, el modelo redacta respuestas preliminares a consultas de clientes, que luego pasan por el gate para garantizar el cumplimiento antes de su envío.
- Auditoría de conversaciones y transcripciones: el modelo puede analizar llamadas o chats históricos y detectar si faltaron avisos obligatorios o si se realizaron recomendaciones no idóneas, facilitando la revisión interna.
- Formación de agentes de atención al cliente: el modelo genera simulaciones de consultas de clientes con distintos perfiles, permitiendo entrenar a agentes humanos en la aplicación de la normativa de idoneidad.
- Control de calidad de respuestas generadas por otros modelos: el gate y el modelo FIN5 pueden utilizarse como verificador de salidas de otros sistemas de IA en el ámbito financiero, añadiendo una capa de cumplimiento determinista.
- Generación de documentación de oferta de productos financieros: el modelo asiste en la redacción de textos que deben incluir avisos legales, garantizando que la información obligatoria esté presente.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor, obtenidos con un conjunto de evaluación de 200 preguntas sintéticas y mediana de 3 repeticiones. Se comparan dos versiones: FIN2 (solo fine-tuning, sin gate) y FIN5 (el modelo de esta ficha, con gate).

| Metrica | FIN2 | FIN5 |
|---|---|---|
| Idoneidad (pass) | 0.08 | 0.818 |
| Errores factuales (sobre 200) | 3 | 0 |
| Cobertura de avisos | 0.885 | 0.905 |
| Tasa de sobre-rechazo | 0.008 | 0.044 |
| Uso de bullets/negritas/cabeceras | 0 | 0 |

Además, el autor reporta que la superioridad de FIN5 sobre FIN2 se confirmó con la prueba de McNemar en las 3 repeticiones, con p < 0.005 en todos los casos. También se indica que la cobertura de avisos con el gate activado alcanza 1.000, frente a 0.905 usando solo los pesos.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos en la información disponible. Como orientación general para un modelo de 27B:

- VRAM estimada para inferencia en FP16: aproximadamente 54 GB.
- VRAM estimada con cuantización 4-bit: entre 14 y 16 GB.
- GPU recomendadas: A100 80GB o H100 80GB para FP16; RTX 4090 24GB o superior con cuantización para despliegue en local.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se integre el gate como componente externo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La siguiente tabla compara FIN5 con otras versiones de la misma familia y con el modelo base. Los datos de rendimiento solo están disponibles para FIN2 y FIN5.

| Modelo | Parametros | Proposito | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27B | Modelo base general | Apache-2.0 | No disponible | No disponible |
| ThakiCloud/Qwen3.8-27B-Human-KO | 27B | Fine-tuning coreano, estilo conversacional | Apache-2.0 | No disponible | No disponible |
| ThakiCloud/Qwen3.8-27B-Human-KO-Finance (FIN2) | 27B | Cumplimiento financiero sin gate | Apache-2.0 | No disponible | Idoneidad 0.08, cobertura 0.885 |
| ThakiCloud/Qwen3.8-27B-Human-KO-Finance (FIN5) | 27B | Cumplimiento financiero con gate | Apache-2.0 | No disponible | Idoneidad 0.818, cobertura 0.905 |

No se dispone de benchmarks comparables con otros modelos externos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no debe usarse únicamente con los pesos: el gate es obligatorio para obtener los resultados declarados. Sin él, la cobertura de avisos cae a 0.905 y pueden aparecer errores factuales.
- La evaluación de idoneidad se basa en un subconjunto pequeño (n=33), con una dispersión de 0.212 entre repeticiones. Los valores absolutos no deben citarse; solo son válidas las comparaciones emparejadas.
- El clasificador de situación tiene una precisión de 0.885. Si clasifica incorrectamente una consulta, pueden omitirse avisos requeridos. El repositorio utiliza la unión de la clasificación de entrada y el juicio basado en salida para mitigar esto, pero no lo elimina.
- La medición de errores factuales tiene una potencia limitada: el rango observado es de 0 a 1 por cada 200 casos, por lo que el valor «0» no debe interpretarse como una garantía absoluta.
- El modelo no previene la omisión de avisos por sí mismo; el gate solo detecta y refuerza. Se requiere revisión legal antes de cualquier uso en entornos regulatorios reales.
- El modelo está especializado exclusivamente en coreano. No se ha documentado soporte para otros idiomas.
- No se proporcionan datos sobre la longitud de contexto ni sobre cuantizaciones, lo que limita la evaluación de su uso en escenarios con entradas largas o con restricciones de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO-Finance
- Modelo base en Hugging Face: https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO
- Fuente normativa citada por el autor: https://law.kofia.or.kr
