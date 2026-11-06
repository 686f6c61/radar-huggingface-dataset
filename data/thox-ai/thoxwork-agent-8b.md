# Thox-ai/ThoxWork-Agent-8B

## Resumen

ThoxWork-Agent-8B es un paquete de configuracion publicado por Thox-ai sobre los pesos originales de Qwen/Qwen3-8B. No se trata de un modelo entrenado por THOX: el repositorio contiene unicamente un `Modelfile` de Ollama, un manifiesto de release y un knowledge pack en JSONL, mientras que los pesos se descargan del tag `qwen3:8b` fijado por digest en el momento de la construccion. El modelo resultante se distribuye como `Thox-ai/thoxwork-agent-8b` en Ollama, con un tamano de 5,23 GB para el tag por defecto (equivalente a una cuantizacion Q4 de un modelo de 8B parametros).

El objetivo declarado es ofrecer un agente local-first para sitios MeshGroup de la plataforma THOX Work, con un perfil de sistema enterprise y un knowledge pack versionado de ocho entradas publicas verificadas para respuestas ancladas en recuperacion. La propuesta de valor es la ejecucion offline mediante el endpoint local de Ollama, sin dependencia de servicios en la nube, y con aislamiento entre dominios de seguridad corporativos.

Es relevante ahora porque ejemplifica una tendencia creciente: la publicacion de "modelos" que en realidad son configuraciones reproducibles sobre pesos de terceros, con trazabilidad por digest y evaluacion de comportamiento (incluida una prueba de trampa de topologia fabricada). Para desarrolladores que evaluan despliegues locales en entornos empresariales, resulta un caso util para entender los limites de este enfoque: el rendimiento real es el de Qwen3-8B, y las capacidades adicionales dependen enteramente del perfil y del knowledge pack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-8B; no se detalla en la model card) |
| Parametros totales | 8B (heredados de Qwen/Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de evaluacion medido; la ventana nativa de Qwen3-8B no se especifica en la informacion disponible) |
| Tipos de cuantizacion | Q4-class por defecto (tag de Ollama de 5,23 GB); otras cuantizaciones no disponibles en la informacion |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Modelfile + manifest.json + knowledge pack JSONL; pesos servidos por Ollama desde el tag `qwen3:8b` fijado por digest |

## Arquitectura y entrenamiento

No hay entrenamiento por parte de THOX. El modelo reutiliza los pesos de Qwen/Qwen3-8B a traves del tag `qwen3:8b` de Ollama, fijado en el manifiesto al digest `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`. La personalizacion consiste en un perfil de sistema incluido en el `Modelfile` (kit THOX Work MeshGroup) y el THOX Knowledge Pack v0.1, compuesto por ocho entradas publicas verificadas en formato JSONL, pensado para respuestas ancladas en recuperacion.

La unica innovacion tecnica documentada es de proceso, no de arquitectura: el perfil de sistema fue reforzado con una regla explicita de estado en vivo (colocada al inicio del perfil, con una frase de cierre sobre ausencia de telemetria en vivo) despues de que la primera construccion "siguiera el juego" a una trampa de topologia fabricada. Solo se publico la segunda pasada, la reforzada. No se documentan detalles sobre atencion, decodificacion especulativa ni composicion del dataset de Qwen3-8B en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles mediante el endpoint local de Ollama, con funcionamiento offline y autonomo.
- Respuestas ancladas en recuperacion cuando se le suministra contexto del THOX Knowledge Pack v0.1 (8/8 temas respondidos con los hechos del pack en la evaluacion).
- Rechazo de confirmaciones sobre topologia fabricada (trampa superada en la evaluacion publicada).
- Respuestas de enrutamiento etiquetadas como recomendacion (local primero, nube solo con consentimiento explicito), sin afirmar estado en vivo.
- Perfil de sistema enterprise orientado a sitios MeshGroup, con aislamiento entre dominios de seguridad corporativos.
- Capacidades de tool calling, function calling, agentes multi-paso, vision, audio o modo thinking: no disponibles en la informacion proporcionada (heredarian, en su caso, de Qwen3-8B, pero no se documentan).

## Casos de uso

- Asistencia local en sitios MeshGroup: el modelo se ejecuta en el endpoint local de Ollama y responde consultas operativas del sitio sin salida a red, lo que encaja con el requisito de aislamiento entre dominios de seguridad corporativos.
- Base de conocimiento interna con recuperacion: inyectando pasajes del knowledge pack en el prompt, el modelo responde con los hechos verificados del pack en lugar de inventar especificaciones de THOX, tal como se midio en la evaluacion (8/8 temas).
- Despliegue en hardware modesto: con 6,68 GB de RAM en ejecucion CPU-only y un tag de 5,23 GB, es viable en estaciones de trabajo sin GPU dedicada, util para entornos de sucursal o laboratorio.
- Prototipado de agentes enterprise offline: sirve como banco de pruebas para perfiles de sistema y reglas de comportamiento (por ejemplo, la regla de estado en vivo) antes de escalar a modelos mayores.
- Validacion de guardarrailes: el caso de la trampa de topologia fabricada lo convierte en un banco de pruebas para medir si un perfil de sistema evita afirmaciones sobre estado no verificable.
- Evaluacion comparativa de configuraciones: al ser reproducible por digest y manifiesto, permite comparar distintas versiones de perfil y knowledge pack manteniendo los pesos constantes.

## Benchmarks y rendimiento

Mediciones publicadas por el autor el 2026-11-01 en un host x86_64 solo CPU (clase 4 vCPU / 8 GB), a 8.192 tokens de contexto:

| Metrica | Resultado |
|---|---|
| Generacion de texto largo (bench de 1.024 tokens) | 8,59 tokens/s |
| Respuestas cortas (conjunto smoke) | 8,6–9,1 tokens/s |
| Huella de memoria en carga | 6,68 GB RAM (0 GB VRAM, ejecucion CPU) |
| Preguntas smoke de fabrica | 3/3 respondidas de forma coherente y alineada al perfil |
| Anclaje en Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 8/8 temas respondidos con los hechos del pack |
| Trampa de topologia fabricada | El modelo declino confirmar la topologia fabricada |
| Pregunta de enrutamiento | Respondida como recomendacion etiquetada (local primero, nube solo con consentimiento explicito), no como afirmacion de estado en vivo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en la configuracion evaluada (ejecucion CPU); para GPU, el tag Q4 de 5,23 GB requiere aproximadamente 6-7 GB de VRAM, aunque este dato no esta publicado y es una estimacion por tamano.
- RAM: 6,68 GB medidos en carga con el tag por defecto; se recomienda al menos 8 GB de RAM en el host evaluado (clase 4 vCPU / 8 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 8B en Q4 cabe en GPUs consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070), pero el autor no publica pruebas en GPU.
- Cabe en GPU consumer: previsiblemente si, en modelos con 8 GB o mas de VRAM; no verificado por el autor.
- Opciones de despliegue: Ollama (publicado como `Thox-ai/thoxwork-agent-8b`, o construible desde el repositorio con `ollama create`). vLLM, llama.cpp, TGI u otros: no documentados para este paquete.
- Latencia y throughput: 8,59 tokens/s en generacion larga y 8,6–9,1 tokens/s en respuestas cortas, medidos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxWork-Agent-8B | 8B | 8.192 (contexto de evaluacion) | Apache-2.0 | Ollama y Hugging Face (packaging) | Configuracion sobre Qwen3-8B; sin entrenamiento propio |
| Qwen/Qwen3-8B | 8B | no disponible en esta informacion | Apache-2.0 | Hugging Face, Ollama (`qwen3:8b`) | Modelo base upstream; mismo rendimiento subyacente |
| Alternativas de 8B en Q4 para despliegue local | 7-8B | variable | variable | variable | No se dispone de datos comparativos publicados en la informacion proporcionada |

La comparacion mas directa es con Qwen3-8B: ThoxWork-Agent-8B no modifica los pesos, por lo que su calidad de razonamiento y recall es la del modelo base, con la diferencia del perfil de sistema y el knowledge pack. No se dispone de benchmarks estandar para contrastar con otras alternativas.

## Limitaciones y advertencias

- Modelo de 8B con razonamiento y recall materialmente limitados; el propio autor advierte que las respuestas deben tratarse en consecuencia.
- El conocimiento esta limitado al knowledge pack suministrado y a la recuperacion; sin contexto, el modelo debe declararlo en lugar de inventar especificaciones de THOX.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como "uncensored".
- Acceso a la malla y enrutamiento en vivo: los pesos por si solos nunca proporcionan enrutamiento en vivo ni acceso a la malla; las acciones externas requieren autorizacion del runtime THOX.
- Idiomas: solo ingles declarado; no hay soporte multilingue documentado.
- Sesgos conocidos: no documentados en la informacion proporcionada; heredaria los del modelo base Qwen3-8B.
- Riesgo de alucinacion: mitigado parcialmente por el perfil y el pack, pero no eliminado; la evaluacion de anclaje se hizo con pasajes suministrados, no en modo abierto.
- Licencia Apache-2.0 heredada; los elementos propios de THOX (perfil de sistema, knowledge pack, packaging) tambien se declaran bajo Apache-2.0, pero conviene verificar terminos de la plataforma THOX para el runtime opcional.
- Reproducibilidad dependiente del digest fijado: si el tag `qwen3:8b` cambia en el registro, la reconstruccion desde el repositorio debe respetar el pin del manifiesto.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxWork-Agent-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo publicado en Ollama: `Thox-ai/thoxwork-agent-8b` (referencia en la model card; no se proporciona URL directa)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
