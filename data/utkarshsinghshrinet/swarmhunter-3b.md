# UtkarshSinghShrinet/swarmhunter-3b

## Resumen

SwarmHunter 3B es un ajuste fino (fine-tune) de tipo SFT sobre Qwen/Qwen2.5-Coder-3B-Instruct, desarrollado por Utkarsh Singh Shrinet y publicado en HuggingFace con licencia Apache 2.0. El modelo está especializado en ciberseguridad ofensiva y defensiva: detección de vulnerabilidades, análisis de exploits, auditoría de código, mapeo CVE/CWE, resolución de retos CTF y triaje de pruebas de penetración. Su interés práctico reside en que concentra esas capacidades en un tamaño de 3.085.938.688 parámetros, lo que permite ejecución local en GPUs de consumo.

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen2, sin mezcla de expertos, con formato de prompt ChatML y una longitud de contexto declarada de 4096 tokens en la model card. El autor reporta un entrenamiento sobre 2.280.000 pares instrucción/respuesta repartidos en 46 shards secuenciales, mediante LoRA encadenado acumulativo (rank 16, alpha 32), con una pérdida SFT final de 0,9617 (último shard 0,7187) y una precisión de token aproximada del 80,6 %.

Es relevante ahora porque la mayoría de modelos especializados en seguridad con calidad contrastada tienen tamaños de 7B a 70B y requieren infraestructura dedicada; una variante de 3B con contexto de 4096 tokens y licencia permisiva baja el coste de despliegue y permite integrarla en herramientas locales de análisis estático, pipelines de CI/CD o asistentes de triaje. Como contrapartida, la model card no publica resultados numéricos de benchmarks: las afirmaciones de rendimiento son cualitativas y deben validarse de forma independiente antes de usarla en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), formato de prompt ChatML |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4096 tokens (según model card) |
| Tipos de cuantizacion | No disponible (la model card solo documenta carga en float16; el repositorio contiene pesos safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 6,2 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 en configuración densa del checkpoint Qwen/Qwen2.5-Coder-3B-Instruct: transformer decoder-only con atención completa, sin componentes SSM ni híbridos, y plantilla de conversación ChatML con roles system/user/assistant. El ajuste se realizó mediante "Sequential Cumulative LoRA Chaining": 46 shards de datos procesados de forma secuencial y acumulativa, con adaptadores LoRA de rank 16 y alpha 32, lo que implica que cada etapa parte de los adaptadores fusionados de la anterior en lugar de entrenar un único adaptador sobre el conjunto completo.

El dataset declarado suma 2.280.000 pares instrucción/respuesta con conversaciones multi-turno, compuestos por datos de CVE, CWE, ExploitDB, retos CTF, auditoría de código y triaje de pentesting. La pérdida SFT convergió a 0,9617, con 0,7187 en el último shard y una precisión de token de aproximadamente el 80,6 %. No se documenta en la información disponible si hubo fases de RLHF, DPO u otra optimización por preferencias, ni el número total de tokens vistos, ni la composición porcentual exacta del corpus. Tampoco se especifican innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto técnico especializado en seguridad: explicaciones de vulnerabilidades, vectores de ataque y contramedidas.
- Detección y clasificación de vulnerabilidades con mapeo a CWE y referencia a CVE.
- Auditoría de código orientada a seguridad: desbordamientos de buffer, inyecciones web (SQLi, XSS), bypass de autenticación, SSRF y fallos de gestión de memoria.
- Análisis de exploits y apoyo al triaje de pruebas de penetración en alcances autorizados.
- Generación de parches y remediaciones: la model card afirma alta precisión produciendo parches funcionales y seguros, sin cifras publicadas.
- Resolución asistida de retos CTF y explicación de técnicas asociadas.
- Conversación multi-turno con formato ChatML, útil para sesiones de análisis iterativo dentro de la ventana de 4096 tokens.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible; el modelo base lo soporta, pero no se confirma que el fine-tune lo preserve.
- Capacidades de agente y razonamiento multi-paso autónomo: no documentadas como tales; la model card describe pruebas de resistencia a inyección de prompts, no un modo agente.
- Capacidades multimodales (visión, audio) y modo "thinking" explícito: no disponibles.

## Casos de uso

- Auditoría de código en CI/CD: integrar el modelo como paso de revisión que analice diffs y señale patrones inseguros (strcpy, concatenación de SQL, deserialización no segura) antes de fusionar, aprovechando su entrenamiento específico en code security y su tamaño reducido para ejecutarse en runners con GPU modesta.
- Triaje de hallazgos de escáneres: recibir la salida de SAST/DAST y pedir al modelo que priorice, descarte falsos positivos y explique el impacto real de cada hallazgo, con la ventana de 4096 tokens suficiente para pegar el fragmento relevante y su contexto inmediato.
- Asistencia a analistas SOC de nivel 1: clasificación y enriquecimiento de alertas con explicaciones en lenguaje natural sobre la técnica implicada y las comprobaciones recomendadas, en un despliegue on-premise que evita enviar datos sensibles a APIs externas.
- Formación y laboratorios CTF: tutor que explica paso a paso la resolución de retos, justifica la técnica y propone variantes, adecuado para entornos educativos por su licencia Apache 2.0 y su ejecución local.
- Generación de parches en revisión de código: proponer una versión corregida de una función vulnerable y justificar el cambio, para que un revisor humano lo valide; útil en proyectos con backlog de deuda de seguridad.
- Redacción de informes de pentesting: transformar notas técnicas y evidencias en secciones estructuradas de informe (descripción, impacto, severidad, remediación), reduciendo el trabajo mecánico del consultor.
- Endurecimiento de configuraciones: revisar ficheros de configuración de servicios (nginx, Dockerfiles, políticas IAM) y proponer ajustes alineados con buenas prácticas, dentro del alcance de código y texto que el modelo maneja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente afirmaciones cualitativas ("alta fidelidad" en detección de CWE, "alta precisión" en remediación, superación de pruebas de estrés de inyección de prompts y payloads ofuscados), sin tablas de MMLU, HumanEval, CWE-Bench ni métricas de tasa de detección con conjuntos de evaluación identificables. No se deben asumir cifras concretas hasta que exista una evaluación independiente reproducible.

## Requisitos de hardware

- VRAM estimada en float16: en torno a 6,2 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 8-10 GB para contextos cercanos a 4096 tokens.
- VRAM estimada en int8: aproximadamente 3,1-4 GB de pesos; viable en GPUs de 8 GB.
- VRAM estimada en int4 (GGUF/AWQ/GPTQ, previa conversión): en torno a 1,8-2,5 GB; permite ejecución en GPUs de 4-6 GB y en CPU con latencia mayor.
- GPU recomendadas: RTX 4090, A100 o H100 para máxima concurrencia y throughput; RTX 3090/4080/4070 Ti como opción equilibrada en fp16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y superiores en fp16; en GPUs de 8 GB conviene cuantizar a int8 o int4.
- Opciones de despliegue: Transformers (la model card usa `device_map="auto"` y `torch_dtype=torch.float16` con `trust_remote_code=True`), vLLM y TGI para servir en producción (soporte de Qwen2 en ambas), llama.cpp/Ollama tras convertir los pesos a GGUF. No se documenta una versión GGUF publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwarmHunter 3B | 3,09B | 4096 tokens (según model card) | Ciberseguridad: CVE/CWE, auditoría, CTF | Apache 2.0 | HuggingFace, 0 descargas en el momento de la consulta |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09B | 32.768 tokens según documentación pública de Qwen | Código general e instrucciones | Apache 2.0 | Ampliamente distribuido |
| Qwen2.5-Coder-7B-Instruct | 7,6B aprox. según documentación pública | 32.768 tokens según documentación pública de Qwen | Código general e instrucciones | Apache 2.0 | Ampliamente distribuido |

No se dispone de datos de benchmarks del fine-tune que permitan comparar su rendimiento en detección de vulnerabilidades frente al modelo base ni frente a otros fine-tunes de seguridad, por lo que la comparación cuantitativa queda como no disponible. La comparación relevante es cualitativa: SwarmHunter reduce el contexto declarado a 4096 tokens y limita el idioma a inglés, a cambio de una especialización declarada en dominios de seguridad que el modelo base no tiene.

## Limitaciones y advertencias

- Ausencia de benchmarks verificables: todas las afirmaciones de rendimiento de la model card son cualitativas; no hay métricas reproducibles de detección, remediación ni tasas de falsos positivos.
- Riesgo de alucinación relevante en seguridad: un CVE, CWE o parche inventado puede inducir a error grave; toda salida debe validarse contra fuentes primarias (NVD, MITRE, repositorios oficiales) y ejecutarse pruebas sobre el parche propuesto.
- Ventana de contexto reducida (4096 tokens): insuficiente para auditar ficheros completos o repositorios; obliga a fragmentar y puede perder interacciones entre módulos.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Sesgos: el corpus se apoya en ExploitDB, CTF y fuentes de seguridad pública, con posible sobrerrepresentación de ciertas plataformas, lenguajes y tipos de vulnerabilidad, y con sesgo hacia técnicas ofensivas documentadas públicamente.
- Doble uso: el modelo puede generar contenido aprovechable para ataque; el autor restringe su uso a pruebas autorizadas, defensa, investigación y educación. La licencia Apache 2.0 no impone esas restricciones a nivel legal, por lo que la responsabilidad recae en el desplegador.
- Trazabilidad limitada: no se publican detalles del dataset (procedencia, filtrado, deduplicación, licencias de las fuentes), lo que complica evaluar riesgos de contaminación o de reproducción de material con derechos.
- Madurez del proyecto: 0 descargas y 1 "like" en el momento de la consulta, creado en octubre de 2026; no hay historial de mantenimiento ni issues que permitan inferir soporte.
- Tool calling y comportamiento agéntico no confirmados en el fine-tune; si se necesita function calling en producción, conviene verificar con pruebas propias o partir del modelo base.
- `trust_remote_code=True` en el ejemplo oficial implica ejecutar código del repositorio; revisar antes de usar en entornos restringidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UtkarshSinghShrinet/swarmhunter-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a un club de pádel y no guardan relación). No hay papers, blogs, repositorios ni demos adicionales disponibles en la información proporcionada.
