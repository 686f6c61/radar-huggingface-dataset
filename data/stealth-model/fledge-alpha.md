# stealth-model/fledge-alpha

## Resumen

Fledge Alpha es un modelo listado en HuggingFace bajo la organización `stealth-model` y distribuido únicamente como servicio en fase de vista previa cerrada, sin pesos publicados. Su ficha procede de una tarjeta de evaluación independiente elaborada por Stealth Models, que documenta un contexto declarado de 1.048.576 tokens, entrada de texto e imagen, soporte de tool calls, tres niveles de razonamiento (low, high, max) y una velocidad medida de unos 63 tokens por segundo. El acceso al modelo finalizó y su retirada se confirmó el 11 de octubre de 2026, por lo que cualquier evaluación práctica es hoy irrepetible.

El desarrollador figura como desconocido y no se ha revelado la identidad del modelo. Los indicios recogidos por Stealth Models apuntan a que Fledge Alpha no es un modelo monolítico, sino un enrutador que delega en modelos rápidos de terceros: al enviar tres veces la misma petición, el recuento de tokens de entrada fue de 7.536 en las dos primeras ejecuciones y de 6.499 en la tercera, un comportamiento difícil de explicar en un modelo con tokenizador fijo y compatible con un servicio enrutado. A ello se suma un perfil de resultados de benchmark irregular según la tarea.

La relevancia actual es, por tanto, sobre todo metodológica: es un caso documentado de modelo "en stealth" evaluado de forma externa mientras su acceso estuvo abierto, con resultados que no son reproducibles a día de hoy. No hay información pública sobre arquitectura, número de parámetros, datos de entrenamiento ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Los indicios apuntan a un servicio enrutado sobre modelos rápidos de terceros, no a un modelo único con pesos publicados |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | 1.048.576 tokens (cifra declarada en la vista previa) |
| Tipos de cuantización | No disponible (no se publicaron pesos) |
| Idiomas soportados | No disponible |
| Licencia | CC BY 4.0, según los metadatos de la ficha; el autor de la tarjeta indica que la licencia cubre la propia tarjeta y sus imágenes |
| Formato de pesos | No disponible; no hay pesos publicados, solo acceso a servicio |
| Desarrollador | Desconocido (figura como "unknown" en la ficha de Stealth Models) |
| Modalidades de entrada | Texto e imagen |
| Tool calling | Sí, según la vista previa |
| Modos de razonamiento | Tres: low, high, max |
| Velocidad medida | Aproximadamente 63 tokens/s en las pruebas de Stealth Models |
| Primera observación | 1 de octubre de 2026 |
| Estado del acceso | Finalizado; retirada confirmada el 11 de octubre de 2026 |
| Fecha de la ficha | Actualizada el 28 de octubre de 2026; resultados leídos el 28 de octubre de 2026 con StealthMark 1.8.8 |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura interna, el número de parámetros, la composición del dataset ni el proceso de alineación (RLHF, DPO u otros). La ficha no incluye detalles de entrenamiento y el desarrollador no se ha identificado. La única evidencia técnica disponible es de comportamiento: la variación en el recuento de tokens de entrada entre peticiones idénticas (7.536 y 6.499) y la irregularidad de los resultados por tarea, que Stealth Models interpreta como indicio de un enrutador que combina varios modelos rápidos en lugar de un único modelo con tokenizador y pesos fijos.

Sí está documentada la existencia de tres ajustes de razonamiento (low, high, max), un patrón habitual para controlar el cómputo en tiempo de inferencia, aunque se desconoce cómo se implementa. Las conjeturas de la comunidad sobre la identidad del modelo (DeepSeek V4.x y el modelo Inkling de Thinking Machines) se recogen en la tarjeta como especulaciones no confirmadas y no deben tomarse como datos verificados.

## Capacidades

- Generación de texto con entrada multimodal: acepta texto e imagen en la misma petición, según la vista previa.
- Ventana de contexto declarada de 1.048.576 tokens, orientada a documentos o historiales muy extensos.
- Tool calling o function calling: la vista previa listaba soporte explícito de llamadas a herramientas.
- Modos de razonamiento configurables en tres niveles (low, high, max), pensados para ajustar esfuerzo y latencia por petición.
- Composición de escenas con múltiples sujetos que interactúan: es su punto fuerte medido, con 63,4 sobre 100 en la prueba Raccoon.
- Capacidad multilingüe: no disponible; la ficha no declara idiomas.
- Capacidades de audio, vídeo u otras modalidades: no disponibles.
- Rendimiento general medido más bien bajo: 27,1 en inteligencia general y 45,2 en inteligencia visual dentro de StealthMark.

## Casos de uso

Los siguientes escenarios corresponden a las capacidades declaradas en la vista previa. Dado que el acceso terminó el 11 de octubre de 2026 y no hay pesos publicados, no es posible reproducirlos hoy con este modelo concreto.

- Análisis de documentos de gran extensión: con una ventana declarada de 1.048.576 tokens, encajaría en la revisión de contratos, expedientes o bases de código completas sin troceado previo, manteniendo referencias cruzadas entre secciones muy alejadas del texto.
- Asistentes con acceso a herramientas: el soporte de tool calls permitiría construir agentes que consulten APIs internas, bases de datos o sistemas de ticketing y compongan la respuesta final a partir de los resultados.
- Descripción y análisis de imágenes acompañadas de instrucciones largas: la combinación de entrada visual y contexto extenso sirve para revisar capturas de pantalla, paneles de control o documentación gráfica junto a un histórico de conversación amplio.
- Composición de escenas con varios sujetos: su mejor resultado medido (63,4/100 en Raccoon) lo sitúa como candidato para tareas en las que hay que razonar sobre la interacción entre varios elementos de una escena, no solo sobre objetos aislados.
- Enrutado y triaje de peticiones: el patrón de funcionamiento observado (posible enrutador sobre modelos rápidos) encaja en arquitecturas donde una primera capa clasifica la consulta y la deriva al backend adecuado con baja latencia.
- Ajuste fino del coste por consulta: los niveles low, high y max permiten usar el modo bajo en tareas rutinarias de clasificación o extracción y reservar el modo max para razonamiento multi-paso.
- Prototipado rápido de producto: los ~63 tokens/s medidos permiten interacción conversacional fluida en fases de validación, siempre que el proveedor mantenga el servicio disponible.
- Agentes multi-paso con contexto acumulado: la combinación de contexto de un millón de tokens y tool calling facilitaría cadenas de varias llamadas que arrastran todo el historial sin resumir.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de StealthMark 1.8.8, un conjunto de evaluación propietario de Stealth Models, leído el 28 de octubre de 2026. No son comparables con MMLU, HumanEval, GSM8K ni con otras suites públicas, y no se han publicado resultados en dichas suites.

| Evaluación | Puntuación |
|---|---|
| StealthMark, puntuación global | 35,8 |
| Inteligencia general | 27,1 |
| Inteligencia visual | 45,2 |
| Raccoon (composición de escenas con sujetos que interactúan) | 63,4 sobre 100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni datos de comparación con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no haberse publicado pesos ni parámetros, no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible; no existen pesos que ejecutar en local.
- Opciones de despliegue: no disponible. El modelo solo se ofreció como servicio gestionado, sin artefactos para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: aproximadamente 63 tokens/s medidos a través del servicio, con la sobrecarga de red y del posible enrutado incluidas; se desconoce el rendimiento en bruto del backend.
- Situación actual: el acceso finalizó y la retirada se confirmó el 11 de octubre de 2026, por lo que no hay vía de despliegue disponible.

## Comparativa con modelos similares

No hay datos verificables que permitan una comparación cuantitativa. La tarjeta menciona dos conjeturas de la comunidad sobre la identidad del modelo, que se recogen aquí únicamente como especulación y sin cifras asociadas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fledge Alpha | No disponible | 1.048.576 (declarado) | StealthMark global 35,8; Raccoon 63,4 | CC BY 4.0 en la ficha | Acceso finalizado el 11 de octubre de 2026 |
| DeepSeek V4.x (conjetura no confirmada) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Inkling, de Thinking Machines (conjetura no confirmada) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo en stealth sin identidad confirmada: se desconoce el desarrollador, la arquitectura y el origen de los datos, lo que impide auditar sesgos o procedencia.
- Sin pesos publicados: no es posible verificar el modelo, ejecutarlo en local ni reproducir sus resultados; los 0 descargas y 0 likes de la ficha son coherentes con esta situación.
- Resultados no reproducibles: el acceso terminó el 11 de octubre de 2026, de modo que las puntuaciones de StealthMark no pueden volver a medirse sobre el mismo servicio.
- Comportamiento no determinista en el recuento de tokens (7.536 frente a 6.499 en peticiones idénticas), compatible con un enrutado a backends distintos; esto complica la trazabilidad, el control de costes y la depuración en producción.
- Perfil de rendimiento irregular: la inteligencia general medida es baja (27,1), con un desempeño claramente mejor en tareas visuales y de composición de escenas; no conviene extrapolar su mejor resultado al resto de capacidades.
- Benchmarks propietarios: StealthMark 1.8.8 no es comparable con suites públicas, por lo que las cifras no permiten situar el modelo frente a alternativas conocidas.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en ninguna otra lengua distinta del inglés.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de veracidad ni de tasa de error factual.
- Ambigüedad de licencia: la etiqueta CC BY 4.0 aparece en los metadatos de una ficha que es una tarjeta de benchmark de terceros, y el propio autor indica que cubre la tarjeta y sus imágenes; no hay base para asumir que el modelo en sí se distribuya bajo esa licencia.
- Ausencia de garantías de servicio: al tratarse de una vista previa retirada, no existe compromiso de disponibilidad, soporte ni estabilidad de API.
- Sesgos: no disponibles; sin información sobre datos de entrenamiento ni evaluaciones de equidad.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/stealth-model/fledge-alpha
- Página de la organización en HuggingFace: https://huggingface.co/stealth-model
- Guía del modelo: https://stealthmodels.com/fledge-alpha/
- Resultados completos de benchmark: https://stealthmodels.com/benchmarks/models/fledge-alpha
- Resultado en la prueba Raccoon: https://stealthmodels.com/benchmarks/models/fledge-alpha/raccoon
- Mapa de benchmarks: https://stealthmodels.com/benchmarks/map
- Metodología StealthMark: https://stealthmodels.com/stealthmark
- Versión interactiva de los benchmarks: https://stealthmodels.com/play
- Tarjeta social del modelo: https://stealthmodels.com/fledge-alpha/assets/social-card.png
- Ilustración del modelo: https://stealthmodels.com/_shared/artwork/fledge-alpha.webp

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces encontrados correspondían a servicios y entidades sin relación (StealthWriter, Stealth Startup en LinkedIn, la película "Stealth" de 2005, el artículo sobre tecnología stealth y el fabricante de equipos industriales Stealth).
