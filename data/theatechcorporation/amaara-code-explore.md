# theatechcorporation/amaara-code-explore

## Resumen

Amaara Code Explore es un modelo de lenguaje especializado en la exploración de repositorios de código, desarrollado por The A-Tech Corporation. Se construye sobre el modelo base Qwen/Qwen3.5-4B-Base mediante un ajuste fino supervisado (SFT) con LoRA en dos etapas. Su función es concreta y deliberadamente acotada: recibe un informe de bug o una pregunta sobre un repositorio y utiliza herramientas de shell y lectura de ficheros para localizar el código relevante, deteniéndose en ese punto sin modificar nada.

El modelo pertenece a la familia Qwen3.5 y hereda su arquitectura transformer, con 4.659.865.088 parámetros totales (~4,7B) según los pesos en safetensors. Se distribuye con licencia Apache-2.0 y está orientado a tareas de agente con tool calling, concretamente a la fase de localización dentro de flujos tipo SWE-bench. Su relevancia radica en que aborda una sub-tarea del ciclo de resolución de bugs —encontrar el fichero correcto— con una métrica medible y un comportamiento acotado (no edita, no parchea).

La propuesta es singular en el ecosistema: en lugar de competir en generación de parches, se posiciona como un componente previo de exploración, con un recall medido de 9/10 sobre una muestra pequeña de SWE-bench Lite. No obstante, el propio autor advierte que la muestra es reducida y que el modelo fue entrenado a 8.192 tokens aunque se sirva a 262.144, por lo que la calidad más allá de la longitud entrenada no está verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, derivado de Qwen3.5-4B-Base) |
| Parametros totales | 4.659.865.088 (~4,7B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens en servicio (entrenado a 8.192; ventana real verificada con llama.cpp, `n_ctx_slot = 262144`) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo original), GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B-Base, un transformer de la familia Qwen3.5, y se ajusta mediante LoRA en dos etapas de SFT. La etapa 1 consistió en 3.000 pasos con contexto de 4.096 tokens sobre trazas de harness y agentes; la etapa 2 añadió 2.000 pasos con contexto de 8.192, continuando desde la etapa 1, con un 28,2 % de los tokens de pérdida provenientes de trazas generalizadas del agente Paperclip. El objetivo de la etapa 2 fue corregir un defecto detectado en la etapa 1: el modelo repetía llamadas idénticas a herramientas en el 65 % de los episodios. Tras la etapa 2, la tasa de duplicados bajó al 26 %.

El corpus de entrenamiento se generalizó antes de su uso: nombres de clientes, rutas, nombres personales y códigos de tarea se sustituyeron por pseudónimos estables, y se verificó la ausencia de 25 patrones prohibidos en el corpus final. La proporción de llamadas de edición en el corpus era del 5,4 %, lo que explica el comportamiento del modelo: no edita ficheros. No se documenta en la información disponible el uso de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Exploración de repositorios de código: localiza ficheros y fragmentos relevantes a partir de un informe de bug o pregunta, usando shell y lectura de ficheros.
- Tool calling / function calling: utiliza herramientas de shell y lectura de ficheros como parte de su bucle de agente.
- Razonamiento multi-paso acotado: ejecuta secuencias de llamadas a herramientas con un presupuesto de pasos (hasta 60 en la evaluación).
- Detención tras localizar el código: no genera parches, ediciones ni escrituras (0 llamadas de edición/escritura/patch en la evaluación).
- Capacidad de imagen-texto: el tag `image-text-to-text` está presente en la metadata, aunque no se detalla su uso en la model card.
- Idiomas: inglés únicamente.
- No se documentan capacidades de matemáticas, visión avanzada, audio ni modo pensamiento (thinking).

## Casos de uso

- Localización de ficheros para resolución de bugs: dado un informe de bug sobre un repositorio, el modelo explora con shell y lecturas hasta identificar los ficheros implicados; sirve como primera fase de un pipeline que luego pasa el contexto a un modelo editor.
- Triage de issues en CI/CD: se puede integrar en un flujo que, ante un issue nuevo, localice automáticamente el código afectado y lo adjunte al ticket, reduciendo el tiempo de investigación manual.
- Asistencia a revisores de código: con contexto largo (hasta 262.144 tokens), puede recorrer repositorios extensos para responder preguntas sobre dónde reside una funcionalidad o un comportamiento.
- Enrutamiento de tareas a agentes especializados: al devolver la ubicación del código relevante, actúa como componente de exploración previo a un agente de edición, evitando que este último malgaste pasos buscando.
- Análisis de repositorios heredados: permite hacer preguntas de localización sobre código legado sin modificarlo, útil en auditorías o incorporación de nuevos desarrolladores.
- Generación de contexto para RAG sobre código: las localizaciones devueltas pueden alimentar un sistema de recuperación aumentada que luego consulte un modelo mayor.
- Evaluación de harness de agentes: su comportamiento acotado y medible lo hace útil como banco de pruebas para validar infraestructura de agentes (mini-swe-agent, llama-server) antes de añadir capacidades de edición.

## Benchmarks y rendimiento

Evaluación sobre 10 instancias de SWE-bench Lite (dev) a 262.144 tokens de contexto, presupuesto de 60 pasos, una ejecución por instancia. Métrica: ¿tocó el agente un fichero nombrado en el parche gold de la instancia?

| Metrica | Resultado |
|---|---|
| Recall de fichero gold | 9 / 10 (90 %) |
| Llamadas a herramienta medianas hasta el primer acierto | 2 |
| Llamadas a herramienta medias hasta el primer acierto | 2,9 |
| Llamadas de edición / escritura / patch | 0 |
| Episodios que enviaron parche | 2 / 10 |

Resultados por instancia:

| Instancia | Llamadas a herramienta | Primer acierto en |
|---|---|---|
| marshmallow-code__marshmallow-1343 | 60 | 2 |
| marshmallow-code__marshmallow-1359 | 59 | 2 |
| pvlib__pvlib-python-1072 | 60 | 2 |
| pvlib__pvlib-python-1606 | 49 | 2 |
| pvlib__pvlib-python-1707 | 60 | 2 |
| sqlfluff__sqlfluff-1517 | 58 | 2 |
| sqlfluff__sqlfluff-1625 | 59 | 3 |
| sqlfluff__sqlfluff-1733 | 60 | nunca |
| sqlfluff__sqlfluff-1763 | 59 | 8 |
| sqlfluff__sqlfluff-2419 | 27 | 3 |

Los datos fueron tomados con la cuantización Q8_0. No se ha medido el daño de cuantización para este modelo; el autor recomienda re-medir si se usa Q4_K_M. El propio autor advierte que 10 instancias es una muestra pequeña y que el 90 % de recall tiene barras de error amplias.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8,1 GB en F16, ~4,3 GB en Q8_0, ~3,4 GB en Q6_K, ~3,0 GB en Q5_K_M, ~2,6 GB en Q4_K_M (tamaños de fichero GGUF indicados por el autor; la VRAM real depende del contexto y del backend).
- Contexto largo: servir a 262.144 tokens requiere memoria adicional para la caché KV; el autor usa `--cache-type-k q8_0 --cache-type-v q8_0` para reducirla.
- GPU recomendadas: no se especifican en la información disponible. Con cuantizaciones Q4–Q8 cabe en GPU de consumo con suficiente VRAM; las configuraciones F16 requieren tarjetas de gama alta.
- Cabe en GPU de consumo: sí, en principio con las cuantizaciones Q4_K_M a Q8_0 (2,6–4,3 GB de pesos), aunque el contexto de 262k exige VRAM adicional considerable.
- Opciones de despliegue: llama.cpp / llama-server (configuración medida por el autor), y por librería transformers (los pesos safetensors originales). No se documenta soporte explícito de vLLM, Ollama o TGI.
- Configuración medida: `llama-server -m amaara-code-explore-Q8_0.gguf -ngl 99 -c 262144 --parallel 1 -ub 512 -b 1024 --jinja --host 0.0.0.0 --cache-type-k q8_0 --cache-type-v q8_0`. El autor advierte que `--parallel 1` es importante porque `-c` es un pool compartido y con 4 slots por defecto cada petición recibiría ~65k tokens.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos de exploración de código en la información proporcionada. Como referencia de categoría se puede señalar el modelo base del que deriva:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Amaara Code Explore | ~4,7B | 262.144 en servicio (entrenado a 8.192) | Exploración / localización de código, sin edición | Apache-2.0 |
| Qwen3.5-4B-Base | ~4B (según denominación) | no disponible | Modelo base generalista | Apache-2.0 (heredada) |

No se han publicado en la información disponible comparativas con otros agentes de exploración o con modelos de la misma categoría.

## Limitaciones y advertencias

- No edita código: 0 llamadas de edición, escritura o patch en los 10 episodios evaluados. No produce parches.
- Terminación tardía: 7 de 10 episodios agotaron el presupuesto de 60 pasos sin enviar. Hay que presupuestar pasos de sobra en cualquier harness.
- Ventana de contexto no verificada en calidad: entrenado a 8.192 tokens y servido a 262.144. La ventana evita truncamiento, pero no garantiza comprensión más allá de la longitud entrenada.
- Muestra de evaluación pequeña: 90 % de recall sobre n=10 tiene barras de error amplias; tratar como indicación, no como resultado de benchmark concluyente.
- Cuantización no medida: los números se tomaron en Q8_0; el daño de cuantización en Q4_K_M y otras no se ha medido.
- Idioma: solo inglés (`en`); no se garantiza comportamiento en castellano u otros idiomas.
- Repetición de llamadas: la tasa de duplicados tras la etapa 2 es del 26 %, aunque parte del problema original era truncamiento por contexto insuficiente.
- Licencia: Apache-2.0, heredada del base Qwen3.5-4B, permite uso comercial; no obstante, verificar las condiciones del modelo base si se redistribuye.
- Riesgo de alucinación: no se documenta explícitamente, pero como modelo de 4B es esperable en tareas de razonamiento complejo; conviene validar las localizaciones devueltas.
- Sesgos: no se documentan sesgos conocidos en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-explore
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Web del autor: https://theatechcorporation.com
- mini-swe-agent (harness de evaluación): https://github.com/SWE-agent/mini-swe-agent
