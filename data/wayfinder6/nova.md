# Wayfinder6/nova

## Resumen

Wayfinder6/nova no es un modelo de lenguaje en el sentido habitual: es un bucle de deliberación multiagente que se ejecuta de forma continua sobre tres máquinas domésticas (un Mac con Apple Silicon, un equipo Windows con una RTX 3080 y un portátil Linux), sirviendo todos sus componentes en local mediante Ollama. El sistema encadena consejos formados por modelos de distintos laboratorios (Qwen2.5-7B, Qwen2.5-1.5B, Gemma 4 12B IT QAT, Hermes 3, Granite 4.2 8B, DeepSeek-R1-8B y Mistral 7B), con un asiento reservado en cada consejo a un "escéptico" que puede dudar, negarse a responder o decir "no lo sé".

Cada ciclo profundo dura unos 3 minutos: Nova escribe su propia pregunta, tres consejos (Anvil, Loom y Forge) responden en paralelo, escuchan las respuestas de los demás, un "oído" condensa cada consejo y un integrador (Weaver) redacta una síntesis; después Nova lee el resultado en 13-25 segundos, decide qué conserva y formula la siguiente pregunta. El autor declara más de 10.880 ciclos completados. Entre ciclos profundos, un consejo de dirección de cuatro voces pequeñas decide hacia dónde mirar aproximadamente una vez por minuto.

Su relevancia es doble. Por un lado, es un caso práctico de orquestación local sin nube de modelos heterogéneos con memoria persistente y sensores físicos reales (un módem por línea eléctrica en FSK a unos 2,7 bits/s, un RTL-SDR sobre el cableado doméstico, un HackRF barriendo de 1 MHz a 6 GHz, una RuuviTag de temperatura, humedad y presión, la demanda de la red PJM y consultas a Wikipedia). Por otro, la model card documenta de forma inusualmente abierta los fallos del sistema. No se publican pesos en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema multiagente en bucle; no es un modelo único. Consejo de LLM locales con roles de ejecutivo, integrador, tres consejos de deliberación, oídos y consejo de dirección |
| Parámetros totales | No disponible (no se publican pesos; los componentes declarados van de 1,5B a 12B) |
| Parámetros activos | No aplica (no es un modelo MoE; es una orquestación de modelos completos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El componente "gemma4:12b-it-qat" indica quantisation-aware training; el resto se sirve mediante Ollama sin cuantización especificada |
| Idiomas soportados | No disponible (el proyecto previo del mismo autor, nova-triangle, está etiquetado como English) |
| Licencia | other (sin términos adicionales publicados en la información disponible) |
| Formato de pesos | No se publican pesos en el repositorio; los componentes se ejecutan desde Ollama y el LoRA periódico se entrena en formato MLX |
| Autor | Wayfinder6 |
| Fecha de la instantánea descrita | 2026-09-25 |
| Descargas / likes en HuggingFace | 0 / 0 |
| Dependencias de ejecución | Ollama (todos los modelos), MLX (reentrenamiento del LoRA), tres máquinas en red local |

## Arquitectura y entrenamiento

La arquitectura no es una red neuronal concreta, sino un grafo de control. Un ciclo completo consta de seis pasos: Nova formula la pregunta del ciclo siguiente; Anvil, Loom y Forge la responden en paralelo, cada uno con tres asientos de laboratorios distintos y un escéptico designado; se produce un "crosstalk" en el que cada consejo oye a los otros y se compromete con una postura; un oído por consejo (un modelo que solo escucha) condensa su consejo; el Weaver escribe una síntesis única a partir de los tres; y Nova lee esa síntesis, decide qué conservar y escribe la siguiente pregunta. Hay un mecanismo anti-alucinación explícito: si el Weaver se limita a repetir la pregunta, el sistema cae a las tres respuestas originales en lugar de fabricar una síntesis.

Los asientos declarados son: Nova (ejecutivo) con qwen2.5:7b; Weaver con gemma4:12b-it-qat; Anvil con hermes3, granite 4.2 8B y DeepSeek-R1-8B como escéptico; Loom con hermes3, granite 4.2 8B y Mistral 7B como escéptico; Forge con hermes3, DeepSeek-R1-8B como escéptico y Mistral 7B; los oídos con qwen2.5:7b; y el consejo de dirección (Crone, Maiden, Mother, Keeper) con qwen2.5:1.5b, hermes3, granite 4.2 8B y qwen2.5:7b. Anvil, Loom y Forge se reparten entre el Mac y el equipo Windows con GPU.

No hay datos publicados sobre preentrenamiento, composición del dataset, número de tokens ni fases de RLHF o DPO. La única adaptación propia documentada es "the tide": aproximadamente cada 60 ciclos, las palabras del propio sistema se destilan en un LoRA sobre Qwen2.5-7B entrenado con MLX. El autor indica que las tres últimas versiones no superaron su mejor "lean" (v84), es decir, que el mecanismo de aprendizaje continuo no está mejorando de forma fiable. La continuidad entre ciclos no reside en ningún modelo, sino en un estado explícito: la pregunta pendiente, las últimas síntesis, el rastro de atención, un espacio "keep" de 40 ranuras gestionado con los comandos REMEMBER y SET DOWN, un "pocket" privado de preguntas abiertas, ficheros privados sin límite y un historial de más de 10.000 ciclos accesible bajo petición con LOOK BACK.

## Capacidades

- Deliberación multiagente con disenso estructurado: cada consejo incorpora un asiento escéptico autorizado a matizar, rechazar o admitir desconocimiento, lo que introduce una señal de incertidumbre en la respuesta final.
- Síntesis integrada: el Weaver produce una única respuesta a partir de los tres consejos, con una salvaguarda que evita presentar como síntesis la mera repetición de la pregunta.
- Autodirección: el sistema elige la pregunta del ciclo siguiente, por lo que la secuencia de temas no la fija un operador externo.
- Memoria episódica y selectiva: 40 ranuras "keep" visibles en cada turno, un espacio privado de preguntas abiertas, ficheros sin límite y acceso al historial completo mediante LOOK BACK.
- Gestión de canales bajo demanda: la consola incluye SCAN (muestra parcial), OPEN (contenido completo) y MUTE (silenciar un canal); cada canal expone solo un estado: (new), (down) o (empty).
- Instrumentación física: envío de texto por el cableado doméstico en FSK, lectura de cobre con RTL-SDR a 200, 212 y 300 Hz, barrido de radiofrecuencia de 1 MHz a 6 GHz con HackRF, telemetría ambiental y demanda eléctrica regional.
- Consulta externa acotada: la orden LOOK UP: responde consultas usando Wikipedia como fuente.
- Anclaje declarado: cada instrumento se etiqueta por lo que es y cualquier voz que cite un número ausente de su entrada se marca como "ungrounded".
- Aprendizaje continuo experimental: destilación periódica de su propio texto en un LoRA sobre Qwen2.5-7B mediante MLX.
- Tool calling o function calling en formato estándar: no disponible.
- Capacidades de visión, audio o modo de razonamiento explícito: no disponibles como tales; los instrumentos de radio y sensores son entradas de telemetría, no modalidades de modelo.
- Capacidades multilingües: no disponibles (no se documentan).

## Casos de uso

- Investigación en deliberación multiagente: reproducir el bucle de consejos con un escéptico por consejo y medir si la síntesis final mejora frente a un modelo único; la estructura de seis pasos y los registros de más de 10.880 ciclos permiten estudiar dinámicas de consenso y disenso.
- Monitorización de infraestructura física con resúmenes en lenguaje natural: usar el patrón de canales (SCAN, OPEN, MUTE) para que un agente consulte sensores de radiofrecuencia, telemetría ambiental o demanda eléctrica y genere un informe legible sin que un operador tenga que interpretar series crudas.
- Instalaciones artísticas o divulgativas de larga duración: el sistema lleva meses funcionando de forma continua y expone su estado en un mapa en vivo en novavon.net, lo que encaja en espacios expositivos donde el proceso importa más que la salida.
- Estudio de fiabilidad y observabilidad de agentes: el registro de auditoría del 24-25 de septiembre documenta fallos concretos (30.115 peticiones rechazadas por un desajuste de cabecera, un estante de ficheros que nunca guardó nada, lecturas de ventana temporal incorrecta, 92 transmisiones perdidas en reinicios), lo que lo convierte en material de análisis para diseñar health checks y alertas.
- Prototipado de memoria a largo plazo con presupuesto fijo: el esquema de 40 ranuras visibles más almacenamiento privado ilimitado es un patrón reutilizable cuando se necesita un contexto operativo pequeño y determinista en lugar de un historial creciente.
- Experimentos de aprendizaje continuo con presupuesto doméstico: el ciclo "tide" sobre Qwen2.5-7B con MLX, cada 60 ciclos aproximadamente, sirve como banco de pruebas de fine-tuning periódico en hardware de consumo, incluidos sus resultados negativos (v84 no superado).
- Despliegue totalmente local sin nube: útil en entornos con requisitos estrictos de soberanía de datos, ya que ningún componente del bucle es un modelo en la nube y todo el tráfico se sirve por Ollama en la red local.
- Docencia sobre sistemas agénticos: la tabla de asientos, los comandos de memoria y el mecanismo de grounding por canal son un ejemplo concreto y acotado para explicar orquestación, roles y trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar, y el repositorio no publica pesos, por lo que no es posible evaluarlos.

Como alternativa, la model card sí aporta métricas operativas extraídas de sus propios registros:

| Métrica operativa | Valor declarado |
|---|---|
| Ciclos profundos completados | Más de 10.880 |
| Duración de un ciclo profundo | Unos 3 minutos |
| Tiempo de lectura por parte de Nova | 13-25 segundos |
| Cadencia del consejo de dirección | Aproximadamente una vez por minuto |
| Ciclos entre destilaciones LoRA ("tide") | Aproximadamente cada 60 ciclos |
| Mejor versión del LoRA | v84; las tres últimas destilaciones no la superaron |
| Ranuras de memoria "keep" | 40 |
| Historial consultable | Más de 10.000 ciclos |
| Velocidad del enlace FSK por línea eléctrica | Unos 2,7 bits/s |
| Banda del RTL-SDR | 200, 212 y 300 Hz sobre el cableado |
| Banda del HackRF | 1 MHz a 6 GHz |
| Transmisiones perdidas por reinicios (auditoría 24-25 sep) | 92 |
| Peticiones rechazadas por desajuste de cabecera | 30.115 |
| Respuestas vacías del asiento de disenso | Aproximadamente el 40 % de las veces |

## Requisitos de hardware

- No se publican cifras de VRAM, latencia ni throughput en la información disponible. Los requisitos hay que inferirlos del hardware que el propio autor declara usar.
- Hardware de referencia declarado: un Mac con Apple Silicon, un equipo Windows con una RTX 3080 y un portátil Linux. El Mac aloja Nova, el Weaver, Anvil, los oídos y parte del consejo de dirección; Loom y Forge se reparten entre el Mac y el equipo con GPU.
- El componente más grande del bucle es gemma4:12b-it-qat (Weaver), que es también el que más presión de memoria ejerce; el ejecutivo y los oídos usan qwen2.5:7b, y el consejo de dirección llega a usar qwen2.5:1.5b.
- Cabe en GPU de consumo: el autor lo ejecuta con una RTX 3080, además de Apple Silicon y un portátil Linux, lo que confirma que el conjunto es viable en hardware doméstico siempre que los modelos se sirvan de forma secuencial o repartida.
- Opciones de despliegue: Ollama es el único runtime de inferencia documentado para todos los asientos. El reentrenamiento periódico del LoRA se realiza con MLX. No se documenta soporte de vLLM, llama.cpp directo, Ollama alternativo, TGI ni TensorRT-LLM.
- Latencia: un ciclo profundo completo tarda aproximadamente 3 minutos y la fase de lectura de Nova entre 13 y 25 segundos. No se publican métricas de tokens por segundo.
- Requisitos adicionales no convencionales: módem FSK por línea eléctrica, RTL-SDR, HackRF, una RuuviTag, acceso a los datos de demanda de PJM de la U.S. EIA y conectividad para consultas a Wikipedia. Sin estos instrumentos, el sistema pierde sus canales de entrada.

## Comparativa con modelos similares

No se han encontrado en la información disponible otros sistemas publicados directamente comparables (orquestación multiagente local, con memoria persistente y sensores físicos, documentada ciclo a ciclo). La comparación más útil es con el experimento previo del mismo autor.

| Sistema | Naturaleza | Composición | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wayfinder6/nova | Bucle multiagente continuo con memoria, sensores físicos y destilación LoRA periódica | Consejos con Qwen2.5-7B, Qwen2.5-1.5B, Gemma 4 12B IT QAT, Hermes 3, Granite 4.2 8B, DeepSeek-R1-8B y Mistral 7B, servidos con Ollama | other (sin términos adicionales publicados) | Repositorio de documentación, sin pesos publicados; demo en vivo en novavon.net |
| Wayfinder6/nova-triangle | Inferencia triangulada sobre tres arquitecturas distintas con puntuación de acuerdo y autoconfirmación | Tres modelos pequeños/edge sobre Transformer y otras arquitecturas | apache-2.0 | Pesos y model card en HuggingFace; demo en un Space de HuggingFace |
| Alternativas de un solo modelo del mismo rango (7B-12B) | Modelo único, sin orquestación ni memoria persistente | Un solo transformer denso | Varía según el modelo | Pesos públicos en HuggingFace |

Comparar nova con un modelo denso de 7B-12B no es metodológicamente correcto: nova no genera texto de forma autónoma, sino que agrega las salidas de varios modelos y mantiene estado entre ciclos. Además, al no publicarse pesos ni benchmarks, no existe una base común de comparación de rendimiento.

## Limitaciones y advertencias

- No es un modelo descargable: el repositorio no publica pesos. La model card lo declara explícitamente ("No weights are published in this repo"). No se puede integrar como una dependencia al uso.
- Licencia "other" sin términos publicados en la información disponible; no hay base para determinar si el uso comercial está permitido. Trátese como restringido hasta consultar al autor.
- Adopción nula: 0 descargas y 0 likes en HuggingFace en el momento de la instantánea, sin pipeline declarado ni idiomas especificados.
- Reproducibilidad limitada: el sistema depende de tres máquinas concretas, de instrumentos físicos específicos (módem FSK, RTL-SDR, HackRF, RuuviTag) y de Ollama como único runtime. Replicarlo exige reconstruir ese hardware.
- Bucles de repetición documentados: el propio autor reconoce que Nova puede formular la misma pregunta durante 4-5 ciclos seguidos.
- Persistencia de datos inventados: se han mantenido cifras inventadas "vivas" durante semanas. No hay un mecanismo de corrección de hábitos, solo de infraestructura.
- Riesgo de alucinación y de atribución errónea: aunque existe un etiquetado de voces "ungrounded" cuando citan cifras ausentes de su entrada, se trata de una comprobación de anclaje, no de veracidad.
- Ruido en la señal de disenso: en la auditoría del 24-25 de septiembre un asiento de disenso devolvía respuesta vacía en torno al 40 % de las ocasiones, lo que degrada precisamente el mecanismo que aporta incertidumbre.
- Historial de fallos sistémicos: 30.115 peticiones rechazadas por un desajuste de cabecera, un estante de ficheros que nunca persistió nada, lecturas asociadas a ventanas temporales incorrectas y 92 transmisiones perdidas en reinicios. El autor afirma que están corregidos y que hay un health check cada 5 minutos, pero la lista indica un sistema frágil.
- Los datos de esta ficha corresponden a una instantánea del 2026-09-25. Cualquier cifra de la model card puede haber quedado obsoleta.
- Limitación física del canal serie: el enlace FSK por línea eléctrica funciona a unos 2,7 bits/s, lo que hace inviable cualquier uso interactivo por esa vía.
- Privacidad y contenido: el mapa público muestra la forma del ciclo (posición y número), no el texto. Lo que el sistema piensa se mantiene privado, lo que limita la auditabilidad externa de sus razonamientos.
- Multilingüismo no documentado. El proyecto anterior del mismo autor está etiquetado como English, pero no hay confirmación para nova.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/Wayfinder6/nova
- Sitio en vivo y mapa del ciclo: https://novavon.net
- Experimento previo (nova-triangle) en HuggingFace: https://huggingface.co/Wayfinder6/nova-triangle
- Demo en vivo de Nova Triangle V2 (HuggingFace Space): https://huggingface.co/spaces/Wayfinder6/nova-triangle-v2
- Créditos declarados en la model card: Wayfinder (preguntas y casa), Bones/Claude (fontanería y registro), Sage (gobernanza) y Shuttle (frenos)
