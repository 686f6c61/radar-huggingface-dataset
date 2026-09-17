# Tornado9991/antcoder-planner-7b

## Resumen

AntCoder-Planner-7B es un adaptador LoRA de tipo PEFT publicado por el usuario Tornado9991 (la model card atribuye el desarrollo a Deep Das, dentro del proyecto "AntCoder / ApexCoder Multi-Agent Coding Suite"), construido sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. No es un modelo completo, sino un adaptador de rango 16 y alpha 32 que modifica las proyecciones de atención y MLP del modelo base para especializarlo en una única tarea: convertir una petición de funcionalidad en lenguaje natural en un grafo acíclico dirigido (DAG) de tareas de implementación, serializado en JSON estricto y ordenable topológicamente.

El problema que aborda es concreto y conocido en el ámbito de los agentes de programación autónomos: los modelos generalistas producen planes de implementación vagos, desestructurados o con dependencias inventadas, lo que rompe la orquestación posterior. El adaptador impone cinco invariantes arquitectónicos declarados como "empresariales": decoupling por capas (esquema de base de datos, tipos de dominio, servicios/repositorios, transporte), paginación determinista por cursor, transacciones atómicas multi-entidad, validación de entrada en tiempo de ejecución con Zod y jerarquías de errores tipadas.

Su relevancia es acotada y experimental. El repositorio tiene 0,3 GB, cero descargas y un "me gusta" en el momento de la consulta, la card reconoce que la evaluación empírica sobre el conjunto de test está "en progreso" y no publica ninguna cifra de benchmarks, el soporte idiomático se limita al inglés y la ventana declarada en el entrenamiento es de solo 2.048 tokens. Encaja, por tanto, como pieza de investigación dentro de un pipeline multi-agente de generación de código en TypeScript, no como componente listo para producción sin validación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-7B-Instruct; proyecciones objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj; r=16, alpha=32 |
| Parametros totales | Modelo base: 7B (según denominación del modelo base); parámetros entrenables del adaptador: no disponible (el repositorio ocupa 0,3 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens, según el apartado Training Details de la model card; el contexto nativo del modelo base no se detalla en la información proporcionada |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; no se documenta ninguna cuantización propia ni artefactos GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Libreria de carga | peft |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Pipeline | text-generation |
| Fecha de creacion registrada | 17/09/2026 (fecha anómala en el repositorio) |

## Arquitectura y entrenamiento

El adaptador no introduce cambios estructurales en el modelo base: se aplica sobre un transformer decoder-only de tipo Qwen2.5-Coder-7B-Instruct mediante LoRA con rango 16, alpha 32 y las siete proyecciones habituales de atención y MLP como módulos objetivo. El entrenamiento se realizó sobre 4.500 DAGs arquitectónicos "curados y verificados" de sistemas backend y fullstack en TypeScript, con una ventana de contexto de 2.048 tokens. La model card no especifica el número total de tokens de entrenamiento, la composición detallada del dataset, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO sobre el adaptador.

La innovación declarada no es arquitectónica sino de comportamiento: los cinco invariantes empresariales (decoupling por capas, paginación por cursor con límite de página N ≤ 50, scopes transaccionales explícitos, validación de entrada con Zod y mapeo de errores de dominio a códigos HTTP/RPC) se presentan como "priors" incorporados en los pesos, de forma que el modelo los emite por defecto en lugar de requerir instrucciones explícitas. Es una afirmación del autor que no viene acompañada de métricas publicadas que la respalden, por lo que debe tratarse como hipótesis a verificar. Tampoco se documentan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Descomposición de requisitos en JSON estricto con estructura de DAG: nodos de tarea y dependencias entre ellos, pensado para ser ordenado topológicamente.
- Aplicación de invariantes arquitectónicos concretos: separación en capas (Database Schema → Domain Types → Service/Repository → Transport/Controller/Routes), paginación por cursor con límite de página, transacciones atómicas multi-entidad, validación de frontera con Zod y jerarquías de errores tipadas.
- Especialización en TypeScript para backend y fullstack, según la composición declarada del dataset de entrenamiento.
- Formato de salida parseable con json.loads() como requisito de diseño (metrica JSON Syntax Validity de su propio benchmark).
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes multi-paso: el adaptador está diseñado como planificador dentro de un pipeline multi-agente, pero la orquestación no la realiza el modelo en sí.
- Capacidades multilingües: no. Solo inglés declarado.
- Capacidades de visión, audio o modo de razonamiento explícito (thinking mode): no disponibles.

## Casos de uso

- Planificación de tareas en agentes de código autónomos: el adaptador actúa como primer eslabón del pipeline, recibiendo una petición de funcionalidad y devolviendo un DAG en JSON que el orquestador puede recorrer en orden topológico y enviar tarea a tarea a un modelo generador de código.
- Descomposición automática de issues en subtareas: a partir del texto de una issue de GitHub o Jira, generar un plan con dependencias explícitas que se pueda volcar directamente como checklist o como grafo de subtareas, reduciendo el trabajo manual de troceado.
- Generación de contratos y esquemas previos a la implementación: el modelo declara interfaces de dominio y firmas de métodos de servicio sin stubs vacíos, lo que sirve como contrato previo a la fase de codificación y como base para revisiones tempranas.
- Verificación de dependencias circulares en planes generados: al producir salida JSON estructurada, cualquier plan puede validarse automáticamente con un topological sort dentro del propio pipeline, descartando o regenerando los planes que contengan ciclos antes de gastar cómputo en generación de código.
- Diseño de APIs paginadas y consultas a base de datos: útil para generar especificaciones que eviten OFFSET/LIMIT sin índice y fuercen ordenación por cursor con límite de página, un patrón habitual en servicios con volúmenes altos.
- Modelado de operaciones transaccionales en servicios backend: para funcionalidades que escriben en varias entidades relacionadas, el modelo agrupa las escrituras en scopes transaccionales explícitos, lo que ayuda a detectar diseños con escrituras parciales antes de programar.
- Integración como paso previo en pipelines de CI/CD: el plan generado puede insertarse como artefacto intermedio (fichero JSON versionado) que alimenta etapas posteriores de generación de código, pruebas o generación de migraciones, con revisión humana del plan antes de continuar.
- Estandarización de validación de entrada y manejo de errores en equipos: usar el adaptador como generador de referencia para definir fronteras de validación en tiempo de ejecución y jerarquías de errores tipadas coherentes entre servicios.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card describe un benchmark propio, el AntCoder Architecture Benchmark, evaluado sobre un conjunto de test retenido de 500 prompts de funcionalidades de producción (planner_test.jsonl), con cuatro métricas, pero indica explícitamente que la evaluación empírica sobre la partición completa "está en progreso" y que las puntuaciones se publicarán cuando finalice.

| Metrica definida por el autor | Definicion | Resultado publicado |
|---|---|---|
| JSON Syntax Validity | Porcentaje de planes que parsean limpiamente con json.loads() | No disponible |
| DAG Acyclicity | Ausencia de dependencias circulares verificada por ordenación topológica | No disponible |
| Enterprise Invariant Conformance | Presencia de paginación por cursor (limit ≤ 50), scopes transaccionales atómicos y fronteras de validación Zod | No disponible |
| Contract Completeness | Declaración completa de interfaces de dominio y contratos de métodos sin stubs de relleno | No disponible |

Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de métricas comparables con otros modelos. La búsqueda web realizada no devolvió ninguna fuente relacionada con este modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño del modelo base (7B) y del tamaño del repositorio del adaptador (0,3 GB), no datos publicados por el autor.

- VRAM para el modelo base en bf16: aproximadamente 15-16 GB, incluyendo pesos y overhead de activaciones en contextos cortos. El adaptador añade un consumo marginal.
- VRAM en cuantización de 8 bits: aproximadamente 8-10 GB.
- VRAM en cuantización de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio concurrente con bf16; una RTX 4090 (24 GB) es suficiente para bf16 en un solo flujo; RTX 3090 (24 GB) y GPUs de 16 GB sirven con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización de 4 bits, en GPUs de 8-12 GB, siempre que el contexto efectivo se mantenga corto (el entrenamiento se hizo a 2.048 tokens).
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + peft (como muestra la propia model card), fusionar los pesos en el modelo base y servir con vLLM, TGI o cualquier runtime compatible con Qwen2.5-Coder. Para llama.cpp u Ollama sería necesario fusionar el adaptador y convertir el resultado a GGUF; no se publican artefactos GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia, tokens por segundo ni rendimiento bajo carga concurrente.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores comparables de planificación de tareas. La única comparación posible con los datos proporcionados es contra el modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AntCoder-Planner-7B | Adaptador LoRA sobre base de 7B (r=16, alpha=32) | 2.048 tokens (entrenamiento) | Sin métricas publicadas | Apache 2.0 | Repositorio HuggingFace, 0 descargas, 1 like |
| Qwen2.5-Coder-7B-Instruct | 7B | No indicado en la información proporcionada (el modelo base declara un contexto nativo superior en su propia ficha) | Métricas públicas del modelo base, no incluidas en esta información | Apache 2.0 | Modelo base ampliamente distribuido |
| Otros planificadores o adaptadores de descomposición de tareas | No disponible | No disponible | No disponible | No disponible | No disponible |

La ventaja diferencial del adaptador es la salida JSON estructurada con invariantes arquitectónicos; su desventaja frente al modelo base es el inglés como único idioma soportado, la ventana declarada más corta y la ausencia de validación independiente.

## Limitaciones y advertencias

- Ausencia total de resultados publicados: las cuatro métricas del benchmark del autor figuran como "en progreso". No hay evidencia verificable de que el modelo cumpla los invariantes que declara.
- Sesgo de dominio: el entrenamiento se realizó sobre 4.500 DAGs de sistemas TypeScript backend y fullstack. Es previsible un rendimiento pobre fuera de ese stack (Python, Java, Go, Rust, frontend puro, sistemas embebidos, ciencia de datos).
- Idioma: solo inglés declarado. Las peticiones en castellano no están cubiertas por el entrenamiento y pueden degradar la calidad del plan.
- Ventana de contexto corta: 2.048 tokens durante el entrenamiento. Especificaciones largas, con varias issues concatenadas o con mucho código de contexto, probablemente se trunquen o degraden el plan. La información proporcionada no detalla el contexto nativo heredado del modelo base.
- Riesgo de alucinación estructural: aunque la salida sea JSON válido y acíclica, nada garantiza que las tareas o contratos declarados sean correctos respecto al sistema real. La validación sintáctica no equivale a validación semántica.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el uso está sujeto además a los términos del modelo base Qwen2.5-Coder-7B-Instruct, del que depende íntegramente.
- Madurez muy baja: 0 descargas y 1 like en el momento de la consulta. Es un artefacto experimental sin señales de adopción ni mantenimiento.
- Inconsistencias de documentación: la card alterna los nombres "AntCoder-Planner-7B", "ApexCoder Planner" y "ApexPlanner"; el prompt de sistema del ejemplo usa un nombre distinto al del repositorio; el autor del repositorio (Tornado9991) no coincide con el autor atribuido en la card (Deep Das); y la fecha de creación registrada (17/09/2026) es anómala.
- Dependencia de datos no publicados: el dataset de 4.500 DAGs y el conjunto de test no se referencian con enlaces, por lo que la evaluación es irreproducible con la información disponible.
- Para producción: requiere evaluación propia sobre el dominio real, pruebas de robustez del parseo JSON y un mecanismo de fallback si la salida no parsea o contiene ciclos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tornado9991/antcoder-planner-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper: no disponible.
- Blog técnico o repositorio del proyecto AntCoder / ApexCoder: no disponible.
- Demos o espacios interactivos: no disponible.
- Nota sobre la búsqueda web: los resultados obtenidos no guardan ninguna relación con este modelo ni aportan información adicional utilizable; se descartan como fuentes.
