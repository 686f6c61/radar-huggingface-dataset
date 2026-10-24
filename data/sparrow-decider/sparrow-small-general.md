# sparrow-decider/sparrow-small-general

## Resumen

sparrow-small-general es un modelo de decisión (no un modelo generativo) desarrollado por el proyecto comunitario Sparrow Decider. Se construye sobre el encoder bidireccional Ettin de 68M parámetros de Johns Hopkins University CLSP y se afina para responder preguntas cerradas sobre un estado de texto: sí/no (`noul`), elegir una opción entre varias (`choice`) y puntuar en una escala (`score`). Su salida son probabilidades calibradas, no texto libre, lo que lo sitúa en la categoría de clasificación de texto y enrutamiento.

El problema que resuelve es el de las decisiones de baja latencia en entornos sin GPU ni servidor de modelos: enrutamiento de herramientas en agentes, control de flujo (*gating*) y clasificación de urgencia. Según las mediciones del autor, tarda 64 ms por decisión (p50) en un solo núcleo de CPU con un runtime Python basado únicamente en numpy, y el artefacto pesa 47 MB.

Es relevante ahora por su enfoque de destilación: se destila desde un checkpoint de Strands Decider 4B (50% objetivos del profesor, 50% etiquetas gold) y se empaqueta en un formato propio (`.sparrow`) que corre en portátil, Raspberry Pi o Jetson. Es un proyecto no oficial, sin relación con AWS ni con Strands, con licencia Apache-2.0 y solo inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional Ettin (68M) con cabeza *pointer*: el logit de cada opción es un producto escalar entre el estado medio del encoder sobre los tokens `<answer>` y la media del span de esa opción |
| Parametros totales | Aproximadamente 68M (heredados del modelo base `jhu-clsp/ettin-encoder-68m`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; se distribuye un unico artefacto `.sparrow` de 47 MB y el runtime numpy no documenta esquemas de cuantización |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (los pesos base Ettin son MIT, con aviso en `LICENSE-ettin.txt`) |
| Formato de pesos | `.sparrow` (formato propio, `sparrow-small-general-v1.0.sparrow`, 47 MB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura parte del encoder Ettin de 68M (familia de encoders de JHU CLSP) y le añade una cabeza *pointer*: cada opción de respuesta recibe un logit calculado como producto escalar escalado entre el estado medio del encoder sobre los tokens `<answer>` y la media de los estados correspondientes al span de esa opción. Toda la decisión se resuelve en un único *forward pass*, sin generación autorregresiva. El prompt (estados, preguntas y opciones numeradas) se renderiza exactamente igual que en Strands Decider.

El entrenamiento usa una mezcla general de tareas de decisión, restringida a filas de `tasksource` marcadas para uso comercial. El modelo se destila desde un checkpoint de Strands Decider 4B, con objetivos compuestos al 50% por predicciones del profesor y 50% por etiquetas gold, y una calibración de temperatura por tipo de pregunta (`noul`, `choice`, `score`). No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Clasificación de texto en forma de decisión: sí/no (`noul`), selección de una opción (`choice`) y puntuación en escala (`score`).
- Probabilidades calibradas por tipo de pregunta, lo que permite fijar umbrales de confianza en producción.
- Enrutamiento de herramientas (*tool routing*) dentro de agentes: el autor reporta 0.673 de precisión de dominio en MASSIVE 1.1 en-US, el mejor de los modelos Sparrow publicados.
- *Gating* y control de flujo en pipelines: decidir si se ejecuta un paso, si se escala a un humano o si se consulta otra fuente.
- Clasificación de urgencia y triaje sobre texto de entrada.
- Inferencia en CPU sin GPU: 64 ms por decisión (p50) en un núcleo Apple M4 Pro, con runtime Python y numpy únicamente.
- Ejecución en dispositivos de borde: portátil, Raspberry Pi y Jetson.
- No soporta generación de texto libre, tool calling generativo, agentes multi-paso por sí mismo, visión, audio ni *thinking mode*. Es un componente de decisión, no un LLM.

## Casos de uso

- **Enrutamiento de herramientas en agentes**: dado un mensaje de usuario y un conjunto numerado de herramientas con sus criterios, el modelo devuelve cuál invocar. El ejemplo de la model card (`mover la reunión de las 3 a Friday` → `calendar`) ilustra el patrón; encaja cuando no hay GPU ni servidor de modelos y 64 ms son suficientes.
- **Gating de escalado a humano en soporte**: clasificar tickets como "requiere intervención humana" frente a "resoluble automáticamente" usando la probabilidad calibrada de `noul` y un umbral ajustado por el equipo.
- **Triaje de urgencia**: puntuar la urgencia de un correo o mensaje en una escala con `score` para ordenar una cola de atención antes de que un operador los lea.
- **Enrutamiento de dominio en asistentes de voz**: clasificar una utterance en dominios predefinidos (calendario, correo, búsqueda, clima) antes de invocar el servicio correspondiente; es el escenario donde el modelo rinde mejor según MASSIVE.
- **Control de flujo en pipelines de datos**: decidir si un documento entra en la rama de procesamiento A o B, o si se descarta, sin cargar un modelo generativo en el worker.
- **Decisión local en robótica ligera**: elegir entre un conjunto acotado de acciones simples en un robot de bajo consumo. El autor advierte que es débil aquí (24/55 en RobotBench) y recomienda `sparrow-nano-robot` en su lugar.
- **Filtro previo en el borde antes de la nube**: descartar localmente en un dispositivo la mayoría de peticiones triviales y enviar a un modelo mayor solo las que superan el umbral de confianza.

## Benchmarks y rendimiento

Datos del proyecto (`bench/RESULTS.md` y `site/facts.json`), ejecuciones locales en un núcleo Apple M4 Pro, no puntuaciones de leaderboard.

| Benchmark | sparrow-small-general-v1.0 | Strands Decider 2B (publico) |
|---|---:|---:|
| MASSIVE 1.1 en-US, 600 utterances held-out: dominio | 0.673 | 0.86 |
| MASSIVE 1.1 en-US, 600 utterances held-out: intención | 0.599 | 0.871 |
| JevBench public, 231 tareas (proxy local v1.5) | 122/231 | No disponible |
| RobotBench v0, 55 decisiones de robot escritas a mano | 24/55 | 40/55 |

| Medida de velocidad (numpy, 1 nucleo) | Valor |
|---|---:|
| Tiempo por decisión (p50) | 64 ms |
| JevBench p50 / p95 | 64,17 ms / 328,14 ms |
| RobotBench, tiempo por pregunta | 54,78 ms |
| RSS máximo en la ejecución de JevBench | 948,6 MB |

## Requisitos de hardware

- **VRAM**: no requiere GPU. La inferencia es en CPU; el consumo relevante es RAM.
- **RAM**: pico de aproximadamente 0,95 GB (948,6 MB) con el runtime numpy durante JevBench. El artefacto en disco son 47 MB.
- **GPU recomendadas**: ninguna. El autor indica explícitamente que las categorías de encoder no necesitan runtime en C ni acelerador.
- **GPU de consumo**: irrelevante; no aplica. Cabe en cualquier portátil, Raspberry Pi o Jetson con ~1 GB de RAM libre.
- **Opciones de despliegue**: `pip install sparrow-decider` más `huggingface_hub`; el modelo se carga con `Decider.load(path)` o por nombre (`Decider.load("small-general")`) colocando el archivo en `~/.cache/sparrow-decider/` o en una ruta de `$SPARROW_MODELS`. También hay CLI: `sparrow-decider --model small-general ...`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, al ser un formato propietario y un modelo de clasificación.
- **Latencia y throughput**: 64 ms p50 por decisión en un núcleo; p95 de 328 ms en JevBench, lo que sugiere una cola relevante en tareas con prompts largos. El throughput depende del número de núcleos si se paraleliza el proceso, ya que el runtime es Python puro.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MASSIVE dominio | RobotBench | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|---|
| sparrow-small-general-v1.0 | Encoder + cabeza pointer | ~68M | No disponible | 0.673 | 24/55 | Apache-2.0 (base MIT) | HuggingFace, 47 MB |
| sparrow-nano-robot | Modelo de decisión de la misma familia | No disponible | No disponible | No disponible | 36/55 | No disponible en la información | HuggingFace, 1,11 MB |
| Strands Decider 2B (public) | Modelo de decisión (profesor de la familia) | 2B | No disponible | 0.86 | 40/55 | Apache-2.0 | Referencia pública del proyecto Strands Decider |
| Strands Decider 4B | Modelo de decisión (profesor de destilación) | 4B | No disponible | No disponible | No disponible | Apache-2.0 | Usado solo como profesor en el entrenamiento |

## Limitaciones y advertencias

- **Juicio sí/no poco fiable**: en JevBench el rendimiento de `noul` está cerca del azar en todos los niveles de Sparrow. Un valor próximo a 0,5 significa "no lo sé", no una probabilidad utilizable.
- **Débil en robótica**: 24/55 en RobotBench frente a 36/55 de `sparrow-nano-robot`, que además ocupa 1,11 MB.
- **Lenguaje abierto**: queda muy por detrás del profesor de 2B en MASSIVE (0.673 frente a 0.86 en dominio; 0.599 frente a 0.871 en intención). Fuera de la distribución de entrenamiento el rendimiento cae.
- **Solo inglés**: no hay soporte multilingüe declarado.
- **Consumo de memoria**: ~0,95 GB de RSS pico con numpy, muy por encima de lo que sugiere el tamaño del archivo (47 MB); hay que aprovisionar RAM en consecuencia en dispositivos de borde.
- **No es un mecanismo de seguridad**: el autor advierte explícitamente que nunca debe usarse como única parada de seguridad en un sistema físico. Solo sugiere decisiones.
- **Sesgos**: no se documenta ninguna evaluación de sesgos en la información disponible; el entrenamiento se limita a filas de `tasksource` marcadas para uso comercial, con las licencias de cada fuente.
- **Licencia**: Apache-2.0 permite uso comercial, pero los pesos derivan de los encoders Ettin de JHU CLSP bajo MIT, cuyo aviso de copyright y texto completo deben conservarse (`LICENSE-ettin.txt`).
- **Madurez**: proyecto comunitario no oficial (no es un producto de AWS ni de Strands), con 0 descargas y 0 likes en HuggingFace en el momento de la consulta; sin validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/sparrow-decider/sparrow-small-general
- Repositorio del proyecto: https://github.com/sparrow-decider/sparrow-decider
- Informe de investigación: https://github.com/sparrow-decider/sparrow-decider/blob/main/research/REPORT.md
- Resultados de benchmarks: https://github.com/sparrow-decider/sparrow-decider/blob/main/bench/RESULTS.md
- Issues: https://github.com/sparrow-decider/sparrow-decider/issues
- Discusiones: https://github.com/sparrow-decider/sparrow-decider/discussions
- Modelo base (Ettin encoder 68M): https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Organización Ettin (JHU CLSP): https://huggingface.co/jhu-clsp
- Strands Decider (profesor y formato de prompt): https://github.com/strands-labs/strands-decider
- Modelo hermano recomendado para robótica: https://huggingface.co/sparrow-decider/sparrow-nano-robot
- Contacto: vivek@sparrowdecider.com

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y del repositorio del proyecto.
