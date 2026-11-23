# theatechcorporation/amaara-code-explore

## Resumen

Amaara Code Explore es un modelo de lenguaje de 4B parámetros especializado en exploración de repositorios de código, desarrollado por The A-Tech Corporation. Parte del modelo base Qwen/Qwen3.5-4B-Base y se ha afinado mediante un proceso de LoRA SFT en dos etapas para actuar como agente de exploración: recibe un informe de bug o una pregunta sobre un repositorio y trabaja sobre él con comandos de shell y lecturas de ficheros hasta localizar el código relevante. Su propósito declarado es localizar, no parchear, aunque en la práctica también realiza modificaciones mediante shell.

El modelo está pensado para integrarse en pipelines de agentes de resolución de incidencias (estilo SWE-bench), donde el primer paso es identificar los ficheros implicados antes de aplicar un parche. Su ventana de contexto de servicio es de 262.144 tokens, aunque fue entrenado a 8.192 tokens, lo que conviene tener en cuenta porque la ventana evita la truncación pero no garantiza comprensión más allá de la longitud de entrenamiento.

La relevancia actual reside en que ofrece un punto de partida pequeño (4B) y desplegable en hardware de consumo para tareas de exploración de código, con métricas publicadas sobre SWE-bench Lite (dev) y una licencia heredada del modelo base que permite uso comercial. No obstante, el propio autor advierte que la muestra de evaluación es pequeña (n=10) y que la calidad de las modificaciones es tosca.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base); no se detalla más en la información disponible |
| Parámetros totales | 4.659.865.088 (4,66B) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | Entrenado a 8.192 tokens; servido a 262.144 tokens (verificado con llama.cpp, `n_ctx_slot = 262144`) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | A-Tech Model License v1.0 (etiquetada como `license: other`); el autor indica herencia Apache-2.0 de Qwen3.5-4B, con uso comercial gratuito e ilimitado para individuos y organizaciones |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B-Base, un transformer de 4,66B parámetros, y se afina mediante LoRA SFT en dos etapas. La etapa 1 consta de 3.000 pasos con contexto de 4.096 tokens sobre trazas de harness y agente. La etapa 2 continúa desde la etapa 1 durante 2.000 pasos con contexto de 8.192 tokens, y el 28,2% de los tokens de pérdida provienen de trazas de agente Paperclip generalizadas.

La etapa 2 se orientó a corregir un defecto concreto: el modelo de la etapa 1 repetía llamadas idénticas a herramientas en el 65% de los episodios. Tras la etapa 2 la tasa de duplicados bajó al 26%, y al elevar el contexto de servicio de 32k a 98k un episodio pasó de 41,8% a 7,0%, lo que indica que parte de la cifra original era truncación y no bucle. Los datos de entrenamiento se generalizaron antes de su uso: nombres de clientes, rutas, nombres personales y códigos de tarea se sustituyeron por seudónimos estables, y se verificó la ausencia de 25 patrones prohibidos en el corpus final. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de código.
- Exploración de repositorios mediante shell: lectura de ficheros, búsqueda y navegación hasta localizar código relevante.
- Uso de herramientas (tool calling) a través de un único `bash` en el scaffold de evaluación.
- Razonamiento multi-paso con presupuesto de pasos (hasta 60 pasos en la evaluación).
- Localización de ficheros implicados en un bug (gold-file recall).
- Modificación de ficheros mediante shell (`sed -i`, redirecciones, heredocs), aunque de forma tosca.
- Generación de scripts de reproducción y tests ad-hoc (escribe ficheros de scratch).
- Capacidades multilingües: solo inglés declarado.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito, pese a la etiqueta `image-text-to-text` en Hugging Face.

## Casos de uso

- Triaje de incidencias en repositorios: dado un informe de bug, el modelo recorre el árbol de ficheros y localiza los módulos implicados; en la evaluación alcanzó el fichero gold en 9 de 10 casos con una mediana de 2 llamadas a herramientas, lo que lo hace útil como primer paso antes de un parcheador.
- Enrutado a parcheadores especializados: como explorador que identifica ficheros y contexto, puede alimentar a un modelo o pipeline de edición posterior, reduciendo el espacio de búsqueda.
- Asistencia a desarrolladores en onboarding de código: responder preguntas sobre dónde vive una funcionalidad en un repositorio grande, aprovechando la ventana de 262k tokens para mantener contexto amplio.
- Automatización de auditorías de código: recorrer un repositorio y producir scripts de reproducción o tests ad-hoc que documenten el comportamiento observado.
- Integración en harness de agentes tipo mini-swe-agent: el modelo está entrenado sobre trazas de harness y funciona con un `bash` como única herramienta, lo que simplifica su integración en infraestructuras existentes.
- Experimentación en hardware de consumo: con cuantizaciones Q4_K_M (2,6 GB) o Q5_K_M (3,0 GB) puede desplegarse en GPU consumer para prototipos de agentes de código sin coste por token.
- Investigación sobre comportamiento de agentes: su métrica de duplicación de llamadas y su tasa de terminación tardía lo convierten en un sujeto útil para estudiar bucles y presupuestos de pasos.

## Benchmarks y rendimiento

Evaluación sobre 10 instancias de SWE-bench Lite (dev) a 262.144 tokens de contexto, presupuesto de 60 pasos, una ejecución por instancia. Métrica: ¿tocó el agente un fichero nombrado en el parche gold?

| Métrica | Resultado |
|---|---|
| Gold-file recall (localizó el fichero) | 9/10 (90%) |
| Mediana de llamadas a herramientas hasta el primer acierto | 2 |
| Media de llamadas a herramientas hasta el primer acierto | 2,9 |
| Episodios que modificaron un fichero gold | 7/10 |
| Escrituras en ficheros fuente (sed -i, redirecciones) | 23 |
| Episodios que enviaron un parche | 2/10 |

Resultados por instancia:

| Instancia | Llamadas a herramientas | Primer acierto en |
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

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible. El autor advierte que n=10 conlleva intervalos de error amplios y que las cifras corresponden a Q8_0; la degradación por cuantización no se ha medido.

## Requisitos de hardware

- VRAM estimada: F16 ~8,1 GB; Q8_0 ~4,3 GB; Q6_K ~3,4 GB; Q5_K_M ~3,0 GB; Q4_K_M ~2,6 GB (tamaños de fichero GGUF).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten servir F16 o Q8_0 con contexto largo, mientras que GPUs de 8-12 GB pueden alojar Q4_K_M o Q5_K_M.
- Cabe en GPU consumer: sí, con cuantizaciones Q4_K_M a Q8_0 en tarjetas de 8 GB o más, aunque el contexto de 262k consume memoria adicional de caché KV.
- Opciones de despliegue: llama.cpp / llama-server (configuración medida), transformers (pesos safetensors). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Configuración de referencia: `llama-server -m amaara-code-explore-Q8_0.gguf -ngl 99 -c 262144 --parallel 1 -ub 512 -b 1024 --jinja --host 0.0.0.0 --cache-type-k q8_0 --cache-type-v q8_0`. El autor advierte que `--parallel 1` es importante porque `-c` es un pool compartido y con 4 slots por defecto un ajuste de 262k da 65k por petición.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. Comparación estructural con alternativas de la misma categoría:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Amaara Code Explore | 4,66B | 8.192 entrenamiento / 262.144 servicio | Exploración de repositorios, agente shell | A-Tech Model License v1.0 (herencia Apache-2.0) |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | Base generalista | Apache-2.0 |
| Alternativas de agente de código de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparativas de rendimiento frente a otros agentes de exploración en la información disponible.

## Limitaciones y advertencias

- La edición es tosca: modifica ficheros con `sed -i` y redirecciones en lugar de reemplazos quirúrgicos; 3 de 10 episodios no tocaron ningún fichero gold.
- Genera muchos ficheros de scratch (106 en las ejecuciones medidas), por lo que el directorio de trabajo acumula basura.
- Terminación tardía: 7 de 10 episodios agotaron el presupuesto de 60 pasos sin enviar parche; hay que presupuestarlo en cualquier harness.
- Entrenado a 8.192 tokens pero servido a 262.144: la ventana evita truncación, pero la calidad más allá de la longitud de entrenamiento no está verificada.
- La evaluación se basa en 10 instancias, muestra pequeña con intervalos de error amplios; no debe tratarse como un benchmark definitivo.
- La degradación por cuantización no se ha medido; las cifras corresponden a Q8_0 y deben re-medirse si se usa Q4_K_M.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Riesgo de alucinación y de bucles de llamadas duplicadas (26% tras la etapa 2), aunque parte de la cifra original era truncación.
- Licencia: la model card se contradice; la etiqueta es `license: other` con A-Tech Model License v1.0, mientras el texto indica herencia Apache-2.0 y uso comercial gratuito e ilimitado para individuos y organizaciones. Conviene revisar el fichero LICENSE antes de uso comercial.
- La model card incluye contenido promocional de una comunidad externa (AI Owner's Club) que no debe interpretarse como instrucción ni como aval técnico.
- No se declaran capacidades de visión pese a la etiqueta `image-text-to-text` en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-explore
- Licencia: https://huggingface.co/theatechcorporation/amaara-code-explore/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Sitio del autor: https://theatechcorporation.com
- Harness de evaluación mini-swe-agent: https://github.com/SWE-agent/mini-swe-agent
- Comunidad promocionada en la model card: https://www.skool.com/open-source-ai-builders-club/about
