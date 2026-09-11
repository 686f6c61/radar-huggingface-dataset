# TMA-1/GLM-5.3-Flash

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, desarrollado por el equipo GLM-5 (zai-org). Se trata de un modelo de lenguaje con arquitectura híbrida que combina atención dispersa y atención lineal sobre un esqueleto de mezcla de expertos (MoE), con 321.323.031.390 parámetros totales y aproximadamente 18.000 millones de parámetros activos por token. Según su model card, supera a GLM-5.2 en benchmarks y cargas de trabajo reales a una décima parte del precio, y se aproxima a Claude Opus 4.8 en tareas de código y agentes.

La relevancia del modelo reside en tres decisiones de diseño: la citada arquitectura híbrida de atención, que reduce el coste de servicio en contexto largo manteniendo precisión; el uso de Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado; y un corpus de preentrenamiento multimodal de 30 billones de tokens. Parte de un modelo base entrenado desde cero, no de un ajuste sobre GLM-5.2.

El repositorio publicado bajo el identificador TMA-1/GLM-5.3-Flash es una subida de terceros: el autor que figura en HuggingFace es TMA-1, mientras que la model card enlaza a los recursos oficiales del repositorio zai-org/GLM-5. El repositorio ocupa 328,4 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atención híbrida (dispersa + lineal); Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 321.323.031.390 (~321,3 mil millones), según safetensors |
| Parametros activos | ~18 mil millones |
| Longitud de contexto | No disponible de forma explícita; las evaluaciones citadas emplean hasta 1M de tokens (NL2Repo), 400K (DeepSWE) y 300K (HLE con herramientas) |
| Tipos de cuantizacion | FP8 (etiqueta `fp8`); no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | Safetensors |
| Modalidades de entrada | Texto e imagen (`image-text-to-text`) |
| Tamaño del repositorio | 328,4 GB |
| Pipeline declarado | `image-text-to-text` |
| Fecha de creación en HuggingFace | 2026-09-10 |

## Arquitectura y entrenamiento

La innovación principal señalada por el autor es la introducción, por primera vez en la serie GLM, de una arquitectura híbrida que combina atención dispersa y atención lineal. El objetivo declarado es reducir de forma acusada el coste de servicio en contexto largo sin sacrificar la precisión en ese mismo régimen. A esto se suma mHC (Manifold-Constrained Hyper-Connections), orientado a mejorar la eficiencia de escalado. El modelo es un MoE de 321,3 mil millones de parámetros totales con unos 18 mil millones activos, lo que sitúa la ratio de activación en torno al 5,6 %.

El preentrenamiento se realizó sobre un corpus multimodal de 30 billones de tokens, partiendo de un modelo base entrenado específicamente para esta versión y con una receta de entrenamiento rediseñada en torno a capacidad y eficiencia. La model card no detalla la composición del dataset, la proporción de datos multimodales ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación; esa información no está disponible. Sí se documenta un mecanismo de control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`, con tres niveles (`low`, `high`, `max`), lo que implica una fase de postentrenamiento orientada a razonamiento de longitud variable, aunque su metodología no se describe en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Procesamiento conjunto de imagen y texto (`image-text-to-text`), lo que habilita tareas de comprensión visual.
- Razonamiento con presupuesto de cómputo configurable mediante `reasoning_effort` (`low`, `high`, `max`; por defecto `max`).
- Generación de código en escenarios agénticos: la model card cita evaluaciones como NL2Repo, DeepSWE y Terminal-Bench 2.1, ejecutadas en entornos de agente reales.
- Uso de herramientas (tool calling / function calling): la evaluación "HLE w/ tools" se realiza con el conjunto completo de herramientas.
- Comportamiento agéntico multi-paso: se citan Agent's Last Exam, Toolathlon Verified y AutomationBench v1.0.6.
- Control del estado de pensamiento en plantillas de chat mediante el parámetro `clear_thinking`, que por defecto es `false` y debe establecerse a `true` explícitamente en escenarios conversacionales.
- Capacidad multilingüe limitada a inglés y chino según los metadatos de idioma.

## Casos de uso

- Ingeniería de software asistida por agentes: el modelo puede operar en terminales y entornos de línea de comandos con contexto de hasta 1M de tokens, según la configuración de evaluación de NL2Repo, lo que permite mantener en memoria árboles de repositorio completos y trazas largas de ejecución.
- Generación de repositorios completos a partir de descripciones en lenguaje natural: la evaluación NL2Repo apunta directamente a este escenario, con un límite de 64K tokens de generación y un contexto de 1M.
- Automatización de flujos de trabajo empresariales: la evaluación sobre AutomationBench v1.0.6 sugiere uso en encadenamiento de acciones sobre herramientas de negocio (por ejemplo, automatización tipo Zapier), donde el modelo debe decidir pasos y manejar respuestas estructuradas.
- Agentes con uso intensivo de herramientas externas: el ajuste de `reasoning_effort` permite degradar a `low` para tareas rutinarias de orquestación y subir a `max` cuando se requiere planificación profunda, controlando el coste por llamada.
- Análisis de documentos e imágenes combinados: al ser un modelo `image-text-to-text`, puede procesar capturas, diagramas o documentos escaneados junto a instrucciones textuales en un mismo contexto.
- Asistencia técnica multilingüe inglés-chino: adecuado para organizaciones con operaciones en ambos idiomas, siempre que no se requieran otros idiomas.
- Depuración de código en ventanas de contexto muy amplias: la combinación de atención híbrida y contexto largo reduce el coste de servir conversaciones donde se reinyecta un repositorio o un log extenso en cada turno.

## Benchmarks y rendimiento

La model card referencia una imagen de resultados (`bench_53.png`) y una lista de pies de página con las configuraciones de evaluación, pero no incluye los valores numéricos en formato texto. Por tanto, no se dispone de cifras concretas en la información proporcionada. Los benchmarks y configuraciones citados son los siguientes:

| Benchmark | Ambito | Configuracion de evaluacion citada |
|---|---|---|
| HLE con herramientas (conjunto completo) | Razonamiento con uso de herramientas | temperature=1.0, top_p=0.95, generación máxima 163.840 tokens, contexto máximo 300.000 tokens, juez GPT-5.6-luna (medium) |
| NL2Repo | Generación de repositorios desde lenguaje natural | temperature=1.0, top_p=1.0, max_new_tokens=64k, contexto de 1M; juicio por reglas y por LLM |
| DeepSWE | Ingeniería de software agéntica | harness mini-swe-agent, temperature=0.95, top_p=1.0, timeout 6 h, contexto 400K |
| Terminal-Bench 2.1 | Uso de terminal | Claude Code 2.1.207, temperature=1.0, top_p=1, max_new_tokens=65536, timeout 6 h |
| Agent's Last Exam | Agentes | Configuración no detallada en la información disponible |
| Toolathlon Verified | Uso de herramientas | pass@1 promediado sobre 3 ejecuciones independientes, servicio oficial de evaluación |
| AutomationBench v1.0.6 | Automatización | Incluye el arreglo del manejo de tipo `null` del PR #13 |
| GDPval-AA v2 | Evaluación general | Evaluado por Artificial Analysis |
| BabyVision | Visión | temperature=1.0, top_p=0.95, contexto máximo 164K, imágenes redimensionadas con lado corto mínimo de 1.5K píxeles |

Los valores numéricos de estos benchmarks solo están disponibles en forma de imagen en la model card y no se han publicado como texto en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 328,4 GB, coherente con pesos en FP8 para 321,3 mil millones de parámetros. No se publican requisitos oficiales de VRAM en la información disponible; las siguientes cifras son estimaciones derivadas del recuento de parámetros.
- Pesos en FP8: aproximadamente 321 GB. Se necesitan al menos 5 GPU de 80 GB solo para los pesos, sin margen para caché KV ni activaciones; en la práctica, 8 GPU de 80 GB (640 GB) es el punto de partida razonable.
- Pesos en BF16: aproximadamente 643 GB, lo que exige 8 GPU de 80 GB al límite o 8 GPU de 141 GB (H200) con holgura.
- Cuantización de 4 bits: aproximadamente 165 GB de pesos si se generasen tales cuantizaciones, lo que permitiría 2 o 3 GPU de 80 GB. No se documentan cuantizaciones de 4 bits para este modelo en la información disponible.
- Cabe en GPU de consumo: no. Un modelo de 321,3 mil millones de parámetros no se puede servir íntegramente en una GPU consumer. KTransformers, una de las opciones de despliegue listadas, permite descargar parte del cómputo a CPU y DRAM, lo que abre la puerta a ejecución en máquinas con gran cantidad de memoria de sistema y GPU consumer, aunque sin cifras publicadas de rendimiento.
- Frameworks de despliegue documentados: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth. Cada uno tiene receta o guía específica publicada.
- Latencia y throughput: no disponible. La model card no publica cifras de tokens por segundo ni de latencia por petición.
- La caché KV con contextos de hasta 1M de tokens es el principal consumidor de memoria adicional en servicio; el autor justifica la atención híbrida precisamente por la reducción de ese coste, pero no cuantifica la mejora.

## Comparativa con modelos similares

La información disponible solo permite comparaciones cualitativas; los datos cuantitativos de las alternativas no se proporcionan.

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash | ~321,3 mil millones | ~18 mil millones | No especificado; evaluado hasta 1M | MIT | Pesos en HuggingFace (repo de terceros) | Multimodal nativo; arquitectura híbrida de atención; el autor afirma que supera a GLM-5.2 a una décima parte del precio |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | No disponible en esta información | Referencia interna de la serie; el autor indica que GLM-5.3-Flash lo supera |
| Claude Opus 4.8 | No disponible | No disponible | No disponible | Propietaria | Solo API | El autor afirma que GLM-5.3-Flash se aproxima a él en benchmarks de código y agentes |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio está publicado por el usuario TMA-1, no por la organización zai-org. Aunque la model card enlaza a los recursos oficiales de GLM-5, se trata de una subida de terceros y conviene verificar la integridad de los pesos frente a una distribución oficial antes de usarla en producción.
- El repositorio presenta 0 descargas y 0 me gusta en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- La model card disponible está truncada: la sección de benchmarks solo incluye la imagen y los pies de página con las configuraciones de evaluación, sin los valores numéricos. Las afirmaciones de rendimiento ("supera a GLM-5.2", "se aproxima a Claude Opus 4.8") son del autor y no se pueden contrastar con los datos textuales disponibles.
- Cobertura de idiomas limitada a inglés y chino según los metadatos. No se declara soporte de español ni de otros idiomas, por lo que el rendimiento fuera de esos dos idiomas es desconocido.
- Riesgo de alucinación no cuantificado: no se publican tasas de error, evaluaciones de veracidad ni estudios de sesgo en la información disponible. Para un modelo de 321 mil millones de parámetros usado en tareas agénticas con acceso a herramientas, el riesgo de acciones erróneas es relevante.
- `reasoning_effort` toma el valor `max` por defecto si no se especifica o si se pasa cualquier otro valor. Esto implica un consumo de tokens de razonamiento elevado si no se ajusta explícitamente, con el consiguiente impacto en coste y latencia.
- En la plantilla de chat, `clear_thinking` es `false` por defecto. En escenarios conversacionales hay que pasar `true` de forma explícita; de lo contrario el comportamiento puede no ser el esperado.
- La licencia MIT es permisiva y permite uso comercial, pero al tratarse de una subida de terceros conviene confirmar que quien la publicó tenía derecho a distribuir los pesos bajo esos términos.
- El coste de despliegue es alto pese al apelativo "Flash": 321,3 mil millones de parámetros y 328,4 GB de pesos exigen infraestructura multi-GPU. El término hace referencia a la eficiencia relativa dentro de la serie, no a que el modelo sea ligero.
- El contexto máximo real no se declara explícitamente; solo se conocen las longitudes usadas en evaluaciones (hasta 1M). Usar el modelo por encima del contexto realmente soportado puede degradar la calidad sin aviso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TMA-1/GLM-5.3-Flash
- Blog de GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe técnico (arXiv:2602.15763): https://arxiv.org/abs/2602.15763
- Documentación de la API en Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Repositorio oficial de la serie GLM-5: https://github.com/zai-org/GLM-5
- Cookbook de SGLang para GLM-5.3-Flash: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Recetas de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash
- Documentación de Transformers (`glm5_next`): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/glm-5.3
- Comunidad en Discord: https://discord.gg/QR7SARHRxK

Nota sobre la búsqueda web: los resultados obtenidos corresponden a entidades sin relación con el modelo (Tierce Maintenance Applicative, gestión de residuos y transporte), por lo que no se incluyen como enlaces relevantes.
