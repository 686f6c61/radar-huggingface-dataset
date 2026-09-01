# stratus-labs/cortex-v1

## Resumen

Cortex es un servicio de inferencia de modelos de lenguaje de código abierto alojado por Stratus Labs, diseñado para ejecutarse sobre hardware Apple Silicon (Mac Studio) utilizando la librería MLX. No se trata de un modelo de lenguaje con pesos propios, sino de una meta-card que describe una API compatible con OpenAI que sirve modelos existentes, como Llama 3.3 70B Instruct en cuantización de 4 bits. El objetivo declarado es ofrecer inferencia de LLM a un coste reducido aprovechando la eficiencia de los chips de Apple.

La relevancia de este proyecto radica en su propuesta de infraestructura alternativa a los proveedores de API tradicionales, con un modelo de precios por suscripción y un endpoint compatible con el ecosistema OpenAI, lo que facilita la integración en aplicaciones existentes. El servicio soporta streaming mediante Server-Sent Events y expone los endpoints estándar de chat, completions y listado de modelos. Actualmente solo sirve un modelo (Llama 3.3 70B Instruct 4-bit), aunque se anuncia la incorporación de más modelos como Qwen 2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (servicio de inferencia, no un modelo con pesos) |
| Parametros totales | No disponible (depende del modelo servido: Llama 3.3 70B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo servido) |
| Tipos de cuantizacion | 4 bits (modelo servido: mlx-community/Llama-3.3-70B-Instruct-4bit) |
| Idiomas soportados | No disponible (depende del modelo servido) |
| Licencia | other (la del servicio; los pesos servidos tienen sus propias licencias, p. ej. Llama 3.3 Community License) |
| Formato de pesos | No aplica (el servicio no distribuye pesos; el modelo servido usa formato MLX) |

## Arquitectura y entrenamiento

No procede. Cortex no es un modelo entrenado, sino un servicio de inferencia alojado. La infraestructura se basa en MLX, el framework de aprendizaje automático de Apple optimizado para silicio de Apple, y sirve pesos cuantizados de modelos de terceros. El modelo actualmente servido es Llama 3.3 70B Instruct en cuantización de 4 bits, cuyos detalles de arquitectura y entrenamiento corresponden a Meta y no se detallan en esta meta-card. No se proporciona información sobre el proceso de entrenamiento, datos utilizados o técnicas de alineación del propio servicio.

## Capacidades

- Inferencia de modelos de lenguaje a través de una API compatible con OpenAI (endpoints `/v1/chat/completions`, `/v1/completions`, `/v1/models`).
- Streaming de respuestas mediante Server-Sent Events (`stream: true`).
- Capacidad de servir modelos de código abierto existentes, actualmente Llama 3.3 70B Instruct 4-bit, con planes de añadir más (Qwen 2.5, etc.).
- Integración sencilla con el cliente oficial de OpenAI en Python u otros lenguajes, cambiando únicamente la `base_url`.
- No se documentan capacidades específicas del modelo servido (tool calling, razonamiento, etc.) en esta meta-card; dependerán del modelo subyacente.

## Casos de uso

- Desarrollo y pruebas de aplicaciones con LLM sin infraestructura propia: un equipo puede prototipar un chatbot o agente usando el endpoint de Cortex con el SDK de OpenAI, sin necesidad de gestionar GPUs.
- Despliegue de asistentes conversacionales en entornos donde se prefiera un proveedor de API con facturación por suscripción fija en lugar de por token, como el plan Starter de 29 USD al mes.
- Evaluación de modelos de código abierto en producción: al servir Llama 3.3 70B, permite probar el rendimiento de este modelo sin descargar pesos ni configurar servidores.
- Aplicaciones que requieren streaming de respuestas en tiempo real, como asistentes de voz o interfaces de chat interactivas, gracias al soporte de SSE.
- Migración de aplicaciones existentes que ya usan la API de OpenAI: basta cambiar la `base_url` y la clave API para apuntar a Cortex, minimizando cambios de código.
- Entornos con requisitos de soberanía de datos o control de infraestructura: según la web de Stratus Labs, ofrecen despliegues en local, nube privada o híbrida, lo que puede encajar en empresas que no quieren depender de APIs públicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La meta-card no incluye métricas de latencia, throughput ni comparativas con otros servicios o modelos. Tampoco se detallan resultados de MMLU, HumanEval u otras pruebas para el modelo servido.

## Requisitos de hardware

- No aplica para el usuario final: el servicio está alojado por Stratus Labs, por lo que el cliente no necesita GPU ni hardware específico.
- La infraestructura del proveedor se basa en Apple Silicon (Mac Studio) con MLX, según la descripción del servicio.
- Para el modelo servido (Llama 3.3 70B 4-bit), se estima que se requiere una Mac Studio con memoria unificada suficiente (al menos 64-128 GB) para alojar los pesos en memoria, aunque este dato no se confirma en la documentación.
- El despliegue del servicio es gestionado por Stratus Labs; no se ofrecen opciones de autoalojamiento con vLLM, llama.cpp u Ollama en esta meta-card.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Cortex no es un modelo comparable con otros LLM, sino un servicio de inferencia. Para comparar el modelo servido (Llama 3.3 70B Instruct) con alternativas, habría que consultar las fichas de Meta y otros proveedores, lo cual no se incluye en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: la meta-card no contiene pesos ni arquitectura propia; es un servicio de inferencia que depende de modelos de terceros.
- La disponibilidad de modelos está limitada: actualmente solo se sirve Llama 3.3 70B Instruct 4-bit; la lista puede cambiar y el endpoint `/v1/models` es la fuente autorizada.
- La licencia del servicio es "other" y no se especifican los términos exactos; los pesos servidos pertenecen a sus respectivos editores (p. ej., Meta Llama 3.3 Community License), lo que puede imponer restricciones de uso comercial según el modelo.
- No se documentan garantías de disponibilidad, SLA ni políticas de privacidad de datos en la meta-card.
- El plan gratuito tiene límites diarios de tokens (100k de entrada, 50k de salida), lo que puede ser insuficiente para cargas de producción.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones de contexto del modelo servido; estos dependerán de Llama 3.3 70B y deben consultarse en su documentación oficial.
- La fecha de creación (2026-09-01) y el número de descargas (0) sugieren que el servicio es muy reciente o aún no ha sido adoptado, por lo que su estabilidad no está probada.

## Enlaces

- HuggingFace: https://huggingface.co/stratus-labs/cortex-v1
- Perfil de Stratus Labs en HuggingFace: https://huggingface.co/stratus-labs
- Sitio web de Stratus Labs (aplicado): http://runstratus.com/
- Sitio web de Stratus Labs (software): https://thestratuslabs.com/
- Documentación de la API (endpoint de modelos): https://www.stratus.run/docs/api-reference/models
