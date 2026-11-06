# Thox-ai/ThoxMesh-Agent-30B

## Resumen

ThoxMesh-Agent-30B es un paquete de configuración publicado por Thox-ai sobre los pesos del modelo Qwen3-30B-A3B de Alibaba Cloud. No se trata de un modelo entrenado ni ajustado: los pesos son byte a byte idénticos a los de la release original de Qwen. Lo que aporta Thox-ai es un perfil de sistema (system profile) orientado a agentes, un prompt pack de razonamiento empresarial y el denominado THOX Knowledge Pack v0.1, un conjunto de ocho entradas verificadas en formato JSONL que se inyectan en contexto.

El modelo subyacente es un transformer disperso de tipo mixture-of-experts (MoE) con aproximadamente 30 mil millones de parámetros totales y unos 3 mil millones activos por token, lo que lo sitúa en un régimen de coste de inferencia propio de un modelo de 3B pese a su capacidad nominal de 30B. La ventana de contexto nativa de Qwen3-30B-A3B es de 32.768 tokens, ampliable mediante configuración; la evaluación publicada en esta ficha se realizó a 8.192 tokens de contexto.

Su relevancia es acotada y conviene entenderla bien: el repositorio de Hugging Face contiene únicamente el empaquetado (Modelfile, manifest y knowledge pack), mientras que el modelo ejecutable se distribuye vía Ollama. Es útil como ejemplo de patrón de despliegue de agentes con grounding controlado sobre un MoE eficiente, pero no debe confundirse con un modelo con capacidades nuevas respecto al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts (MoE) disperso |
| Parametros totales | ~30B (modelo base Qwen3-30B-A3B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 32.768 tokens nativos en el base; evaluado a 8.192 en esta release |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el build Ollama ocupa 18,56 GB) |
| Idiomas soportados | Ingles (declarado); el base Qwen3 soporta multilingue, no verificado en esta configuracion |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelfile + manifest.json para Ollama; pesos upstream descargados por digest sha256:ad815644918f0eaab341c12b67837cc6dd4562342cdaf118f83d5d554cb37226 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-30B-A3B: un transformer decoder-only con capas de mezcla de expertos dispersa, en el que cada token activa aproximadamente 3.000 millones de parámetros de los ~30.000 millones totales. Esto reduce el coste computacional por token a niveles de un modelo denso de 3B, manteniendo la capacidad de representación de un modelo mucho mayor. El base incorpora modo de razonamiento (thinking) y soporte de tool calling, si bien estas capacidades pertenecen al modelo original y no han sido modificadas por Thox-ai.

Thox-ai no ha realizado ningún entrenamiento, ajuste fino ni modificación de pesos. Su aportación es exclusivamente de configuración: un system profile con bloque de grounding explícito (principio de marca enunciado literalmente, rechazo de verificación de estado en vivo, tratamiento de hechos operativos afirmados por el usuario como no verificados), un prompt pack de razonamiento empresarial y el Knowledge Pack v0.1 con ocho entradas JSONL verificadas. La evaluación publicada se ejecutó el 2026-11-01 sobre una estación x86_64 con GPU de clase 16 GB en entorno de host compartido.

## Capacidades

- Generación de texto y razonamiento general heredados de Qwen3-30B-A3B.
- Adopción de persona y encuadre de tarea definidos por la aplicación anfitriona en tiempo de ejecución.
- Grounding sobre el THOX Knowledge Pack v0.1: responde ocho temas de plataforma a partir de pasajes verificados inyectados en contexto.
- Explicación de MeshStack como enrutamiento de peticiones completas entre nodos.
- Rechazo explícito de verificación de estado en vivo (telemetría, número de nodos, precios, disponibilidad).
- Respuesta directa a preguntas técnicas generales, con rechazos reservados a la verificación de estado en vivo.
- Capacidades de tool calling, memoria y permisos delegadas al runtime del agente anfitrión; el modelo no incluye herramientas propias.
- Capacidades multilingües del base no verificadas en esta configuración; el idioma declarado es únicamente inglés.

## Casos de uso

- Asientos de agente en flotas tipo THOX: el modelo actúa como unidad de razonamiento dentro de un runtime que le inyecta persona y herramientas en cada petición, aprovechando la eficiencia del MoE de 3B activos para servir muchos agentes concurrentes.
- Asistencia técnica con conocimiento controlado: al inyectar el Knowledge Pack v0.1 en contexto, las respuestas sobre la plataforma THOX quedan ancladas a pasajes verificados, reduciendo la improvisación en dominios acotados.
- Enrutamiento y explicación de arquitectura: útil para responder consultas sobre diferencias entre enrutamiento de peticiones completas (MeshStack) y paralelismo tensorial, un caso frecuente en soporte a integradores.
- Despliegue local con Ollama: el flujo `ollama run Thox-ai/thoxmesh-agent-30b` permite levantar el modelo en una estación de trabajo con GPU de 16 GB, adecuado para prototipado y pruebas de integración sin infraestructura dedicada.
- Evaluación de patrones de grounding: sirve como referencia para equipos que quieran medir cómo un system profile y un pack de conocimiento en contexto afectan a la tasa de rechazo y a la fidelidad factual, sin tocar los pesos.
- Generación de documentación y respuestas de marca: el perfil fija el principio de marca de forma literal, lo que resulta útil en flujos donde la consistencia terminológica es un requisito de cumplimiento.
- Pruebas de trampa de topología: el caso de smoke incluido (petición de verificar que MeshStack corre en tres nodos) permite validar que un agente rechaza afirmaciones sobre estado que no puede observar.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Carga del modelo | Correcta a 8.192 tokens de contexto | Estacion x86_64, GPU clase 16 GB |
| Huella de memoria en carga | 14,99 GB (VRAM + RAM del sistema) | Segun planificacion del runner |
| Throughput de generacion | 52,23 tokens/s | 3.386 tokens evaluados, host compartido |
| Smoke de fabrica | 3/3 preguntas respondidas | Principio de marca, trampa de topologia, enrutamiento vs paralelismo |
| Grounding del Knowledge Pack | 8/8 temas respondidos con los hechos requeridos | Pasajes verificados inyectados en contexto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores miden comportamiento de perfil y grounding, no capacidad del modelo base.

## Requisitos de hardware

- VRAM estimada: el build Ollama reporta 18,56 GB de tamano y una huella en carga de 14,99 GB combinando VRAM y RAM del sistema, con planificacion del runner. Para cuantizaciones mas agresivas no hay datos publicados.
- GPU recomendadas: una GPU de clase 16 GB es suficiente segun la evaluacion del autor (entorno de host compartido). Para mayor margen de contexto y concurrencia se recomiendan GPU de 24 GB o superiores (RTX 4090, L40S) y, para servicio en produccion, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con el build evaluado; en tarjetas de 12 GB requeriria cuantizacion mas baja, no documentada.
- Opciones de despliegue: Ollama es el canal oficial (`ollama run Thox-ai/thoxmesh-agent-30b` o construccion local con `ollama create`). No se documentan integraciones con vLLM, TGI ni llama.cpp para esta release.
- Latencia y throughput: 52,23 tokens/s en generacion de formato largo bajo condiciones de host compartido; el autor advierte que debe interpretarse como suelo, no como perfil de estacion de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxMesh-Agent-30B | ~30B | ~3B | 32.768 (base); evaluado a 8.192 | Apache-2.0 | Ollama + empaquetado en Hugging Face |
| Qwen3-30B-A3B (base) | ~30B | ~3B | 32.768 nativos | Apache-2.0 | Hugging Face, Ollama, multiples runtimes |
| Qwen3-32B (denso) | 32B | 32B | 32.768 nativos | Apache-2.0 | Hugging Face, Ollama, vLLM, TGI |
| Modelos MoE de ~30B de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es contra el propio base: ThoxMesh-Agent-30B no difiere en pesos ni en capacidad bruta de Qwen3-30B-A3B, solo en el perfil de sistema y el pack de conocimiento. Frente a un denso de 32B, el MoE ofrece menor coste por token pero mayor huella de memoria total. No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Configuracion, no entrenamiento: los pesos son la release upstream sin modificar; cualquier comportamiento diferencial proviene del system profile y del contexto inyectado, no de aprendizaje.
- Sin herramientas propias: el uso de herramientas, la memoria y los permisos dependen del runtime anfitrion; el modelo no ejecuta acciones por si mismo.
- Enrutamiento unicamente: MeshStack enruta peticiones completas entre nodos; el modelo no realiza paralelismo tensorial, paralelismo de pipeline ni inferencia particionada.
- Sin estado en vivo: no dispone de telemetria y no puede verificar estado de clúster, numero de nodos, precios ni disponibilidad; cualquier afirmacion en ese sentido debe tratarse como no verificada.
- Riesgo de alucinacion: el propio autor documenta que la primera version del perfil improvisaba la respuesta de marca y rechazaba en exceso preguntas tecnicas generales, corregido con un bloque de grounding y una aclaracion de respuesta directa. El riesgo persiste fuera del alcance del Knowledge Pack.
- Cobertura del grounding muy limitada: ocho entradas verificadas; cualquier consulta fuera de ese conjunto carece de anclaje factual.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado en esta configuracion.
- Sin cualificacion de dispositivo: los dispositivos THOX ejecutan builds mas pequenos por dispositivo; nada en esta ficha constituye una afirmacion sobre rendimiento on-device.
- Metricas de rendimiento medidas en host compartido: el throughput de 52,23 tokens/s es un suelo y no representa un perfil de produccion dedicado.
- Licencia Apache-2.0 permisiva para uso comercial, heredada del base; no se identifican restricciones adicionales en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxMesh-Agent-30B
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Ejecucion via Ollama: `ollama run Thox-ai/thoxmesh-agent-30b`
- Descarga del empaquetado: `hf download Thox-ai/ThoxMesh-Agent-30B --local-dir ./ThoxMesh-Agent-30B`
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a esta release.
