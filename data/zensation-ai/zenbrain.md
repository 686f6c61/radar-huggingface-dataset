# zensation-ai/zenbrain

## Resumen

ZenBrain es una arquitectura de memoria en siete capas inspirada en neurociencia, orientada a dotar de memoria persistente a agentes basados en LLM. No es un modelo de lenguaje: es una librería y marco de trabajo (publicado como preprint en arXiv desde abril de 2026, con versión 9 en octubre de 2026) que organiza la memoria de un agente en capas cognitivas y de ingeniería, e incluye un MemoryCoordinator y nueve algoritmos fundacionales. El autor es Alexander Bering, bajo el sello zensation-ai.

El repositorio de Hugging Face (zensation-ai/zenbrain) actúa como punto de distribución del proyecto: aloja la model card, enlaces al paper, al código (Apache-2.0), a los paquetes npm (@zensation/core y @zensation/algorithms) y a una demo en Spaces. El repositorio tiene 0.0 GB, lo que confirma que no contiene pesos de modelo.

La relevancia actual del proyecto está en su enfoque de memoria para agentes autónomos: consolidación tipo "sleep", aprendizaje hebbiano, repetición espaciada y confianza bayesiana, evaluados sobre LoCoMo y LongMemEval-S con una suite de ablación de 15 componentes. La model card es explícita sobre las limitaciones metodológicas de sus comparativas head-to-head, lo que conviene leer con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marco de memoria en 7 capas para agentes LLM (no es un modelo neuronal con pesos) |
| Parametros totales | no disponible (no aplica: no hay pesos de modelo) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (el contexto depende del LLM que use el agente) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | cc-by-4.0 (paper y repositorio HF); codigo Apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

ZenBrain define siete capas de memoria: cinco corresponden a constructos cognitivos establecidos y dos (core memory y cross-context memory) son capas de ingenieria. Las capas documentadas en la model card incluyen memoria episodica, memoria procedimental ("como hacer X": habilidades y flujos de trabajo), memoria core con hechos fijados al estilo de Letta, y memoria cross-context con enlaces de entidades entre dominios (marcada como experimental). La libreria abierta contiene las siete capas, un MemoryCoordinator y nueve algoritmos fundacionales; seis componentes de "Predictive Memory Architecture" se ejecutan en un sistema de produccion privado y no forman parte del codigo abierto.

No hay datos de entrenamiento en el sentido habitual (tokens, composicion del dataset, RLHF/DPO), porque no se entrena un modelo. La innovacion tecnica esta en los mecanismos de memoria: consolidacion tipo sleep (estabilidad +37% con reduccion de almacenamiento del 47,4% en simulacion), recuperacion hebbiana (Precision@5 de 0,955 frente a 0,200 con aristas uniformes), confianza bayesiana (AUC por pares de 0,797, +49,5% frente a 0,533), repeticion espaciada y decaimiento temporal de memorias. La evaluacion incluye 95 tests reproducibles en 4 suites de experimentos con PRNG Mulberry32 sembrado (10 semillas).

## Capacidades

- Memoria a largo plazo y episodica para agentes conversacionales multi-turno.
- Memoria procedimental: almacenamiento y recuperacion de habilidades y flujos de trabajo reutilizables.
- Memoria core con hechos fijados (pinned facts) para informacion que debe persistir entre sesiones.
- Enlaces de entidades entre dominios (cross-context memory, experimental).
- Recuperacion hebbiana de memorias con precision medida en experimentos.
- Puntuacion de confianza bayesiana sobre memorias recuperadas (AUC 0,797).
- Consolidacion y decaimiento temporal de memorias (mecanismo tipo sleep, decaimiento configurable por dia).
- Integracion con pipelines RAG y frameworks de agentes.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible como capacidad del propio proyecto; depende del LLM subyacente.
- Capacidades multilingues: no disponibles; metadatos declaran solo en.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Agentes de atencion al cliente con memoria persistente: ZenBrain permite recordar interacciones previas entre sesiones mediante memoria episodica y core memory, de modo que el agente no pierde el historial del usuario al reiniciar la conversacion.
- Asistentes personales de larga duracion: la consolidacion tipo sleep y el decaimiento temporal permiten mantener memorias relevantes y descartar las obsoletas, reduciendo el almacenamiento necesario (se reporta un 47,4% de reduccion en simulacion).
- Agentes de desarrollo de software: la memoria procedimental almacena "como hacer X" (comandos, flujos de CI/CD, convenciones del repositorio) y las recupera en tareas posteriores.
- Sistemas RAG con estado: la recuperacion hebbiana y la puntuacion bayesiana de confianza pueden priorizar memorias fiables frente a recuperaciones ruidosas en pipelines de recuperacion aumentada.
- Investigacion en arquitecturas cognitivas: la suite de ablacion de 15 componentes y los tests reproducibles con semillas fijas permiten replicar y contrastar los resultados del paper.
- Prototipado de agentes autonomos multi-dominio: la capa cross-context (experimental) enlaza entidades entre dominios distintos, util en asistentes que cubren trabajo, finanzas y vida personal.
- Evaluacion de sistemas de memoria: al integrarse con LoCoMo y LongMemEval-S, el marco sirve como banco de pruebas para comparar estrategias de memoria de agentes.

## Benchmarks y rendimiento

| Experimento | Metrica | Resultado |
|---|---|---|
| Consolidacion tipo sleep (simulacion) | Estabilidad / almacenamiento | +37% estabilidad con 47,4% menos almacenamiento; una ejecucion sobre datos reales muestra perdida de precision de recuperacion (paper v9, Apendice R, K-13) |
| Recuperacion hebbiana | Precision@5 | 0,955 (frente a 0,200 con aristas uniformes) |
| Confianza bayesiana | AUC por pares | 0,797 (+49,5% frente a 0,533) |
| Ablacion moderada | Suite de 15 componentes | 14 de 15 eliminaciones individuales parecen sin coste; eliminar sleep cuesta -34,4% |
| Ablacion exigente | Suite de 15 componentes | 7 de 15 componentes alcanzan el criterio impreso en simulacion, todos con perdida (p = 5,062 x 10^-3, por debajo del nivel Bonferroni para 15 contrastes, 3,33 x 10^-3) |
| Ablacion de estres (decaimiento 0,25/dia, 60 dias) | Suite de 15 componentes | 10 de 15 alcanzan el criterio; nueve con perdida, PriorityMap con ganancia (misma p, misma advertencia) |
| Enrutamiento LoCoMo (text-embedding-3-small) | F1 | La variante plana (0,059) supera al sistema completo (0,058); los resultados de enrutamiento de la version 8 provenian de embeddings placeholder |
| Cascada de integracion (sintetica, decaimiento 0,30/dia, 60 dias) | Multiplicador de retencion | Sleep actua como multiplicador de 1,92x |
| LongMemEval-500 (comparativa head-to-head) | Precision de juez binario | El brazo ZenBrain alcanza 91,3% de la precision de un brazo de contexto completo, con 1/109,7 de sus tokens de entrada en el paso de respuesta (el ingesta de historiales no se cuenta) |

Nota de la model card: en LongMemEval-500, el brazo medido es un port en Python de una clase de scoring del harness de pruebas, no el sistema de siete capas ni una importacion de los paquetes. De nueve comparaciones contra Letta, Mem0 y A-Mem, tres se sostienen (todas contra A-Mem) y las otras seis no muestran diferencia significativa (corregido por Bonferroni y emparejado por version).

## Requisitos de hardware

- VRAM para inferencia: no disponible; ZenBrain no contiene pesos, el consumo depende del LLM que use el agente.
- GPU recomendadas: no disponibles para el proyecto; vienen determinadas por el modelo de lenguaje subyacente.
- Compatibilidad con GPU consumer: no disponible; depende del LLM elegido.
- Opciones de despliegue: libreria JavaScript/TypeScript distribuida via npm (@zensation/core y @zensation/algorithms); el LLM asociado se desplegaria con vLLM, llama.cpp, Ollama o TGI segun el modelo, pero no hay datos concretos en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZenBrain | Marco de memoria para agentes | no aplica | no aplica | Paper CC BY 4.0; codigo Apache-2.0 | Repositorio HF, npm, GitHub, demo en Spaces |
| Letta (MemGPT) | Marco de memoria para agentes | no aplica | no aplica | no disponible en la informacion | Comparado en el paper; sin datos de licencia aqui |
| Mem0 | Capa de memoria para agentes | no aplica | no aplica | no disponible en la informacion | Comparado en el paper; sin datos de licencia aqui |
| A-Mem | Memoria agéntica | no aplica | no aplica | no disponible en la informacion | Comparado en el paper; sin datos de licencia aqui |

Los resultados de la comparativa head-to-head estan descritos en la seccion de benchmarks: de nueve comparaciones, tres se sostienen (todas contra A-Mem) y seis no muestran diferencia significativa. No hay datos de parametros, contexto ni rendimiento de los competidores en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por si mismo; requiere un LLM externo para cualquier tarea de generacion.
- La comparativa head-to-head no mide el sistema de siete capas: el brazo ZenBrain es un port en Python de una clase de scoring del harness, y el coste de construir la memoria no se contabiliza en el conteo de tokens.
- Solo tres de nueve comparaciones contra competidores se sostienen; las otras seis no muestran diferencia significativa.
- Los resultados de ablacion usan un criterio p = 5,062 x 10^-3 que no alcanza el nivel corregido por Bonferroni para 15 contrastes (3,33 x 10^-3).
- La consolidacion tipo sleep muestra una perdida de precision de recuperacion en la unica ejecucion sobre datos reales reportada (Apendice R, K-13 del paper v9).
- Los resultados de enrutamiento LoCoMo de la version 8 provenian de embeddings placeholder; en la version 9 la variante plana supera al sistema completo en F1 (0,059 frente a 0,058).
- Seis componentes de Predictive Memory Architecture se ejecutan en un sistema privado y no estan disponibles en la libreria abierta.
- La capa cross-context memory esta marcada como experimental.
- Idiomas: solo en segun metadatos; no hay soporte multilingue documentado.
- Licencia: el paper y el repositorio HF son CC BY 4.0 y el codigo Apache-2.0; conviene verificar terminos para uso comercial del sistema privado no publicado.
- Estado preprint con correcciones post-publicacion (aviso de correccion de 18 de septiembre de 2026); las cifras pueden cambiar en versiones futuras.
- Riesgo de sesgos y alucinacion: no documentado en la informacion disponible; heredados del LLM subyacente y de la calidad de las memorias almacenadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zensation-ai/zenbrain
- Demo en Spaces: https://huggingface.co/spaces/zensation-ai/zenbrain-playground
- Paper (arXiv): https://arxiv.org/abs/2604.23878
- Paper v9 (Zenodo): https://zenodo.org/records/23832288
- DOI concepto: https://doi.org/10.5281/zenodo.19353663
- Aviso de correccion: https://doi.org/10.5281/zenodo.22831086
- Codigo en GitHub: https://github.com/zensation-ai/zenbrain
- Licencia del codigo: https://github.com/zensation-ai/zenbrain/blob/main/LICENSE
- Licencia del paper: https://creativecommons.org/licenses/by/4.0/
- Paquete npm @zensation/core: https://www.npmjs.com/package/@zensation/core
- Paquete npm @zensation/algorithms: https://www.npmjs.com/package/@zensation/algorithms
- Sitio web: https://zensation.ai/
- Contacto de investigacion: research@zensation.ai
