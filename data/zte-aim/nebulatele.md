# ZTE-AIM/NebulaTele

## Resumen

NebulaTele (ZTE-AIM/NebulaTele) es un modelo de lenguaje publicado en Hugging Face por la organización ZTE-AIM, el brazo de inteligencia artificial de ZTE Corporation. El repositorio contiene pesos en formato safetensors con un total de 27.781.427.952 parámetros (unos 27,78 mil millones) y un tamaño de 55,6 GB, lo que es coherente con pesos almacenados en precisión BF16/FP16. La fecha de creación del repositorio es el 15 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 6 descargas y 0 "likes".

El nombre del modelo lo vincula a la familia Nebula Telecom Large Model de ZTE, presentada públicamente en julio de 2024 como una serie de productos orientada a redes autónomas de alta autonomía, con capacidades de conmutación de motores, integración dinámica de conocimiento y razonamiento profundo. Sin embargo, el repositorio de Hugging Face no incluye model card alguna, por lo que no se puede confirmar oficialmente que se trate de la misma línea de producto ni qué variante concreta es.

La relevancia de este lanzamiento radica en su orientación sectorial: un modelo de casi 28.000 millones de parámetros especializado (presumiblemente) en dominio de telecomunicaciones, un nicho donde los modelos generalistas rinden peor en terminología, procedimientos operativos y diagnóstico de red. El tag `qwen3_5` del repositorio sugiere que la arquitectura base pertenece a la familia Qwen 3.5, aunque no hay confirmación documental al respecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag del repositorio, `qwen3_5`, apunta a la familia Qwen 3.5) |
| Parámetros totales | 27.781.427.952 (~27,78 mil millones) |
| Parámetros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se ofrecen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 55,6 GB |
| Fecha de publicación | 15 de octubre de 2026 |
| Descargas / likes | 6 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. El único indicio disponible es el tag `qwen3_5` asociado al repositorio, que apunta a que los pesos derivan de la familia Qwen 3.5, de arquitectura transformer decoder-only. No se puede confirmar si se trata de un modelo denso o de un modelo de mezcla de expertos (MoE): con 27,78 mil millones de parámetros totales y sin dato de parámetros activos, ambas posibilidades siguen abiertas. Tampoco se especifica si incorpora atención lineal, decodificación especulativa u otras optimizaciones de inferencia.

Respecto al entrenamiento, no se dispone de ningún dato: ni el número de tokens, ni la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Dado el nombre del modelo y el contexto corporativo de ZTE, es razonable suponer un ajuste orientado al dominio de telecomunicaciones, pero se trata de una inferencia no verificada. La documentación pública de ZTE sobre la serie Nebula Telecom menciona capacidades de conmutación de motores, integración dinámica de conocimiento y razonamiento profundo, sin aportar detalles técnicos sobre el entrenamiento del modelo concreto alojado en Hugging Face.

## Capacidades

No se ha publicado ninguna model card ni documentación de capacidades para este repositorio concreto. Las siguientes afirmaciones son deducciones a partir del nombre, el tamaño y el contexto corporativo, y deben tratarse como no confirmadas:

- Generación de texto en dominio general y, presumiblemente, terminología de telecomunicaciones (no confirmado).
- Razonamiento multi-paso: la documentación de ZTE sobre la serie Nebula Telecom menciona "razonamiento profundo", sin especificar mecanismos ni resultados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: ZTE comercializa una "agents factory" dentro de la serie Nebula Telecom, pero no se confirma que este checkpoint concreto exponga una interfaz de agente.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades de visión o audio: no disponible (los tags no indican modalidad adicional).
- Modo de razonamiento explícito ("thinking mode"): no disponible.

## Casos de uso

Los siguientes escenarios son hipótesis de aplicación razonables dado el tamaño y el dominio aparente del modelo. No están respaldados por documentación oficial del checkpoint:

- Automatización de operaciones de red (AIOps): un modelo de ~28.000 millones de parámetros con ajuste de dominio puede procesar informes de alarmas, correlacionar eventos y proponer acciones de remediación sobre la base de datos de configuración de red.
- Diagnóstico asistido de incidencias: análisis de trazas, logs de elementos de red y contadores de rendimiento para localizar la causa raíz de degradaciones de servicio.
- Generación y validación de configuraciones: producción de plantillas de configuración para equipos de red a partir de lenguaje natural, con validación sintáctica posterior mediante herramientas externas.
- Asistencia a ingenieros mediante RAG: construcción de un sistema de recuperación sobre documentación técnica, especificaciones 3GPP y procedimientos internos, usando el modelo como generador final.
- Atención al cliente de operadoras: gestión de conversaciones multi-turno sobre tarifas, cobertura y resolución de incidencias, siempre que la ventana de contexto y el soporte multilingüe resulten suficientes (dato no disponible).
- Investigación y docencia en redes: generación de explicaciones técnicas, resúmenes de estándares y material formativo para equipos de ingeniería.
- Extracción estructurada de documentación: conversión de especificaciones y contratos técnicos en esquemas JSON mediante salidas estructuradas, si el modelo soporta gramáticas restringidas (no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye model card, no se han encontrado evaluaciones en la búsqueda web realizada y no existen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones específicas de dominio de telecomunicaciones. Cualquier cifra que se atribuya a este modelo sin citar una fuente verificable debe considerarse no fiable.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (27,78 mil millones). No son datos oficiales del autor:

- VRAM en BF16/FP16: aproximadamente 55,6 GB solo para pesos, más caché KV y activaciones. En la práctica requiere del orden de 65-75 GB de VRAM para inferencia con contexto moderado.
- VRAM en INT8: aproximadamente 28 GB de pesos, con un total práctico de 35-45 GB según contexto y tamaño de lote.
- VRAM en INT4: aproximadamente 14-16 GB de pesos, con un total práctico de 20-26 GB. Es la única configuración que puede caber con holgura en GPU de consumo.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16; dos A100 40 GB o una L40S 48 GB para INT8; RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) para INT4.
- GPU de consumo: sí es viable en RTX 4090/3090 con cuantización de 4 bits; en BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: al publicarse únicamente safetensors, los servidores compatibles son vLLM, SGLang o TGI, siempre que la arquitectura esté soportada por la librería (no confirmado para `qwen3_5`). Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que no se distribuye ninguna.
- Latencia y throughput: no disponible.
- Nota práctica: la descarga completa del repositorio son 55,6 GB, lo que conviene tener en cuenta para el aprovisionamiento de almacenamiento y el tiempo de puesta en marcha.

## Comparativa con modelos similares

Los datos de los modelos de referencia provienen de sus fichas públicas y deben verificarse antes de usarse en una decisión técnica. Del modelo objeto de esta ficha se desconoce la mayoría de especificaciones.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NebulaTele (ZTE-AIM) | 27,78 mil millones | no disponible | no disponible | no disponible | safetensors en Hugging Face |
| Qwen3-32B | 32,8 mil millones | denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |
| Qwen3-30B-A3B | 30,5 mil millones | 3,3 mil millones (MoE) | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |
| Qwen2.5-32B | 32,5 mil millones | denso | 131.072 | licencia Qwen | safetensors, GGUF, AWQ, GPTQ |

Diferencias clave: los tres modelos de referencia publican licencia explícita, tienen cuantizaciones oficiales y disponen de evaluaciones públicas. NebulaTele no ofrece ninguno de esos tres elementos, lo que complica su comparación objetiva. Su hipotético valor diferencial estaría en el ajuste al dominio de telecomunicaciones, extremo que no puede confirmarse con la información disponible.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre entrenamiento, datos, evaluación ni uso previsto. Esto impide auditar sesgos, calidad o idoneidad para producción.
- Licencia no disponible: sin licencia declarada no se puede determinar si el uso comercial está permitido. En la práctica, esto equivale a un riesgo legal relevante para cualquier despliegue empresarial.
- Riesgo de alucinación: no evaluado. En dominios técnicos regulados como las telecomunicaciones, una alucinación sobre configuración de red o parámetros de protocolo puede tener consecuencias operativas graves.
- Sesgos: no evaluados ni documentados. Se desconoce la composición del dataset de entrenamiento.
- Cobertura de idiomas desconocida: no se declara ningún idioma, por lo que el rendimiento en castellano no está garantizado.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo (documentación técnica extensa, trazas de red) sin este dato.
- Cuantizaciones no oficiales: al no publicarse GGUF, AWQ ni GPTQ, cualquier cuantización tendrá que generarla el usuario, con el consiguiente riesgo de degradación no medida.
- Madurez del repositorio: 6 descargas, 0 likes y sin fichero de documentación. Es un artefacto prácticamente sin validación por parte de la comunidad.
- Fecha de publicación atípica: el repositorio figura creado en octubre de 2026, dato que conviene verificar en la propia página de Hugging Face.
- Recomendación: antes de cualquier uso en producción, contactar con ZTE-AIM para obtener licencia, model card y resultados de evaluación, y ejecutar una batería propia de pruebas en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZTE-AIM/NebulaTele
- Perfil de la organización ZTE-AIM en Hugging Face: https://huggingface.co/ZTE-AIM
- ZTE Technologies, "ZTE's Nebula Telecom Large Model: Driving Networks Toward High-Level Autonomy": https://www.zte.com.cn/global/about/magazine/zte-technologies/2025/special-topic---nebula-telecom-large-model-/special-topic---nebula-telecom-large-model/zte-s-nebula-telecom-large-model--driving-networks-toward-high-l.html
- Nota de prensa de ZTE, lanzamiento del Nebula Telecom Large Model (julio de 2024): https://www.zte.com.cn/global/about/news/zte-launches-the-nebula-telecom-large-model-opening-a-new-paradigm-for-highly-autonomous-networks.html
- Cobertura en Converge Digest: https://convergedigest.com/zte-launches-nebula-telecom-large-model-for-autonomous-networks/
