# Tileward-Inc/Tileward-Kimi-K3-TWX3

## Resumen

Tileward-Kimi-K3-TWX3 es una compresión del modelo Kimi K3 de Moonshot AI, un transformer de 2,8 billones de parámetros, realizada por Tileward Inc. mediante su técnica propietaria TWX3. El resultado ocupa 1.178,1 GB en disco, un 25 % menos que la versión original publicada por Moonshot (1.560,9 GB), y mantiene un rendimiento prácticamente idéntico en MMLU (90,9 frente a 91,1 en 5-shot). Se trata, por tanto, de una variante cuantizada a 4 bits del modelo base, no de un modelo entrenado desde cero.

La relevancia de esta ficha es doble. Por un lado, documenta una de las pocas compresiones publicadas de un modelo de escala trillonaria, con métricas de fidelidad frente al original (91,4 % de acuerdo en siguiente token, 0,9 % de hechos inventados frente al 1,0 % del original). Por otro, ilustra un modelo de distribución restrictivo: los pesos no se publican en Hugging Face y solo se acceden mediante solicitud o a través de la API OpenAI-compatible de Tileward.

Es importante señalar que la información disponible sobre arquitectura interna, datos de entrenamiento, longitud de contexto nativa y cuantizaciones alternativas es muy limitada, ya que la model card se centra en el proceso de compresión y no en el modelo base. Los datos que se ofrecen a continuación reflejan exclusivamente lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de moonshotai/Kimi-K3; detalles internos no disponibles) |
| Parametros totales | 2,8 billones (2.800.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato propietario TWX3); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (other, enlazada al LICENSE de moonshotai/Kimi-K3) |
| Formato de pesos | no disponible (pesos no publicados en Hugging Face; distribución bajo solicitud) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Kimi K3 más allá de su escala (2,8 billones de parámetros) y de que Moonshot AI lo publica ya almacenado en 4 bits. Tileward no ha entrenado el modelo: aplica sobre él su pipeline de compresión TWX3, que reduce el peso en disco de 1.560,9 GB a 1.178,1 GB (factor 1,3x) manteniendo el almacenamiento en 4 bits. No se especifican en la documentación proporcionada ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovación técnica destacable es la propia compresión TWX3 y las métricas de fidelidad que Tileward reporta frente al original en una sesión sobre ocho tarjetas: 91,4 % de acuerdo en la predicción del siguiente token, 0,9 % de hechos inventados al redactar documentos (frente al 1,0 % del original), 597 y 590 llamadas a herramientas correctas de 600 en esfuerzo de pensamiento bajo y alto respectivamente (frente a 598 y 597 del original), y una huella por tarjeta de 147,2 GiB frente a 191,7 GiB. La consecuencia práctica más relevante es que la caché KV por tarjeta al 90 % de ocupación pasa de 1.467.558 a 3.195.766 tokens, más del doble.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Kimi K3.
- Soporte de tool calling / function calling, con una tasa declarada de 597/600 llamadas correctas en esfuerzo bajo y 590/600 en esfuerzo alto.
- Modos de esfuerzo de pensamiento (low / high thinking effort), según se desprende de las pruebas de tool calling reportadas.
- Redacción de documentos con una tasa de hechos inventados del 0,9 % en las pruebas del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.
- Razonamiento multi-paso y uso como agente: no documentado explícitamente, aunque el soporte de tool calling lo habilita parcialmente.

## Casos de uso

- Despliegue de un modelo de escala trillonaria en clústeres con menos memoria por tarjeta: la reducción de 191,7 GiB a 147,2 GiB por tarjeta permite usar configuraciones de ocho GPU que con el original quedarían al límite, manteniendo MMLU dentro de 0,2 puntos.
- Servicio de inferencia con caché KV extensa: al duplicar la capacidad de caché por tarjeta (3,19 M frente a 1,47 M tokens al 90 % de ocupación), resulta adecuado para conversaciones multi-turno y documentos largos donde el coste dominante es el contexto acumulado.
- Automatización de agentes con tool calling: la tasa de acierto en llamadas a herramientas (590-597 de 600) permite integrarlo en pipelines de agentes que consultan APIs, bases de datos o servicios internos con una fiabilidad cercana a la del original.
- Generación de documentación técnica y resúmenes: la baja tasa de hechos inventados (0,9 %) lo hace apto para tareas de redacción asistida donde la fidelidad factual es crítica, siempre con revisión humana.
- Evaluación comparativa de técnicas de compresión: sirve como referencia para equipos de investigación que quieran medir la degradación de un modelo de 2,8 B de parámetros tras cuantización agresiva, usando las métricas de acuerdo de siguiente token y MMLU publicadas.
- Prototipado mediante API antes de un despliegue propio: la API OpenAI-compatible de Tileward (`https://api.tileward.com/v1`) con 25 dólares de crédito inicial permite validar el comportamiento del modelo en una aplicación antes de solicitar los pesos.
- Investigación sobre eficiencia de memoria en inferencia: la comparativa de huella por tarjeta y capacidad de caché KV es un dato de partida para estudiar el equilibrio entre tamaño de pesos y longitud de contexto efectiva.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Tamano en disco | MMLU (5-shot) |
|---|---|---|
| Kimi K3 (original de Moonshot) | 1.560,9 GB | 91,1 |
| Tileward Kimi K3 TWX3 | 1.178,1 GB | 90,9 |
| Tileward Kimi K3 TWX2.5 | 1.007,9 GB | 90,5 |

| Metrica de fidelidad frente al original | Kimi K3 | TWX3 |
|---|---|---|
| Hechos inventados al redactar documentos (menor es mejor) | 1,0 % | 0,9 % |
| Tool calls correctas de 600 (esfuerzo bajo) | 598 | 597 |
| Tool calls correctas de 600 (esfuerzo alto) | 597 | 590 |
| Acuerdo en siguiente token con el original | – | 91,4 % |
| Carga por tarjeta | 191,7 GiB | 147,2 GiB |
| Tokens de caché al 90 % por tarjeta | 1.467.558 | 3.195.766 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1.178,1 GB, por lo que se requiere un clúster multi-GPU. En la configuración de referencia del autor (ocho tarjetas) se cargan 147,2 GiB por tarjeta.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; la prueba de referencia usa ocho tarjetas con al menos 147,2 GiB de memoria cada una, lo que apunta a H100/H200, B200 o A100 de 80 GB en configuraciones de mayor número de tarjetas.
- ¿Cabe en GPU de consumo? No. Con 1.178,1 GB de pesos en 4 bits, ningún modelo de consumo (RTX 4090, 24 GB; RTX 5090, 32 GB) puede alojarlo, ni siquiera en configuraciones multi-GPU domésticas razonables.
- Opciones de despliegue: no se documentan en la información disponible. La API de Tileward es OpenAI-compatible en `https://api.tileward.com/v1`, lo que permite usar clientes compatibles con OpenAI.
- Latencia y throughput: no disponibles. El único dato de rendimiento es la capacidad de caché KV (3.195.766 tokens al 90 % por tarjeta) y el acuerdo de siguiente token del 91,4 %.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | MMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (Moonshot AI) | 2,8 B | 1.560,9 GB | 91,1 | kimi-k3 | Pesos publicados por Moonshot |
| Tileward Kimi K3 TWX3 | 2,8 B | 1.178,1 GB | 90,9 | kimi-k3 | Bajo solicitud / API |
| Tileward Kimi K3 TWX2.5 | 2,8 B | 1.007,9 GB | 90,5 | kimi-k3 | Bajo solicitud / API |

No se dispone en la información proporcionada de comparativas con modelos de otros proveedores de escala equivalente.

## Limitaciones y advertencias

- Los pesos no se publican en Hugging Face: el acceso requiere solicitar una reunión con un ingeniero de Tileward, lo que limita la reproducibilidad y la auditoría independiente.
- Los benchmarks y métricas de fidelidad están declarados por el autor y marcados como no verificados (`verified: false`); no se han contrastado de forma externa.
- La licencia `kimi-k3` es de tipo "other" y remite al LICENSE del modelo base de Moonshot AI; es imprescindible revisar sus términos antes de cualquier uso comercial.
- La información sobre idiomas soportados, longitud de contexto nativa y cuantizaciones alternativas no está disponible, lo que dificulta planificar despliegues con requisitos específicos.
- El rendimiento en tool calling con esfuerzo alto cae de 597 a 590 aciertos sobre 600 frente al original, una degradación pequeña pero medible que conviene tener en cuenta en agentes sensibles a errores.
- El acuerdo de siguiente token del 91,4 % implica que aproximadamente 1 de cada 11 predicciones difiere del original, con posible impacto acumulado en generaciones largas.
- Riesgo de alucinación: la tasa reportada del 0,9 % en redacción de documentos es una métrica acotada a esa tarea; no debe extrapolarse a otros dominios.
- Sesgos conocidos: no documentados en la información disponible.
- El tamaño de 1.178,1 GB impide cualquier despliegue en hardware de consumo y exige infraestructura de clúster dedicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Kimi-K3-TWX3
- Modelo base Kimi K3: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Variante TWX2.5: https://huggingface.co/Tileward-Inc/Tileward-Kimi-K3-TWX2.5
- Investigación: "We shrank Kimi K3 by 35%, within a point of the original on MMLU": https://tileward.com/research/a-smaller-kimi-k3/
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-k3
- Investigación de Tileward: https://tileward.com/research/
- Sitio de Tileward: https://tileward.com
- Aplicación y API: https://app.tileward.com/?join=explore
- Endpoint OpenAI-compatible: https://api.tileward.com/v1
- Reserva de reunión con ingeniería: https://calendar.app.google/hg2DzFTxKJgwFWm19
