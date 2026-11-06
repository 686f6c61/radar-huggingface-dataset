# zensation-ai/zenbrain

## Resumen

ZenBrain es una arquitectura de memoria en siete capas inspirada en neurociencia, publicada por zensation-ai y orientada a sistemas de IA autónomos y agentes conversacionales. No se trata de un modelo de lenguaje con pesos entrenados, sino de un marco de gestión de memoria de largo plazo que se distribuye como bibliotecas de software (paquetes npm `@zensation/core` y `@zensation/algorithms`) y se documenta en un preprint con DOI en Zenodo y arXiv (2604.23878). El repositorio de Hugging Face asociado tiene un tamaño de 0,0 GB, lo que confirma que no contiene pesos de modelo.

El problema que aborda es la fragilidad de la memoria en agentes: la pérdida de contexto entre sesiones, la acumulación descontrolada de almacenamiento y la dificultad para recuperar información relevante en conversaciones largas. ZenBrain propone una jerarquía que va desde la memoria de trabajo (7±2 elementos) hasta una memoria semántica de largo plazo con programación de repasos al estilo FSRS, pasando por memoria episódica, procedimental y memoria central de hechos fijados. Incorpora algoritmos de aprendizaje hebbiano, repetición espaciada y confianza bayesiana.

La relevancia actual reside en que ofrece una evaluación empírica sobre LongMemEval-500 y LoCoMo, con un estudio de ablación de 15 componentes, y en que su autor reconoce explícitamente las limitaciones metodológicas de la comparación principal (el brazo medido es un port en Python de una clase de scoring, no el sistema completo). Es, por tanto, material útil para investigadores de memoria en agentes, pero debe leerse con cautela por su estado de preprint y por las correcciones post-publicación documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marco de memoria en 7 capas (no es un transformer ni un modelo neuronal con pesos) |
| Parametros totales | no disponible (no aplica; el repo no contiene pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del LLM subyacente que use el agente) |
| Tipos de cuantizacion | no aplica (software, no pesos) |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 (paper y repo HF); codigo Apache-2.0 |
| Formato de pesos | no disponible (no hay pesos; distribucion via npm) |

## Arquitectura y entrenamiento

ZenBrain no entrena un modelo neuronal. Su arquitectura es una pila de siete capas de memoria: memoria de trabajo (foco de tarea activo, 7±2 elementos), memoria de corto plazo o de sesión, memoria episódica (experiencias y eventos concretos), memoria semántica de largo plazo (hechos con programación de repasos estilo FSRS), memoria procedimental (habilidades y flujos de trabajo), memoria central (hechos fijados al estilo Letta) y memoria entre contextos (enlaces de entidades entre dominios, marcada como experimental). El coordinador en `@zensation/core` invoca un subconjunto de los algoritmos de `@zensation/algorithms`: aprendizaje hebbiano con fortalecimiento por coactivación, decaimiento y normalización, repetición espaciada estilo FSRS y confianza bayesiana.

La evaluación se realiza mediante un arnés de simulación con PRNG sembrado (Mulberry32, 10 semillas) y 95 tests reproducibles en 4 suites de experimentos. Los datos de entrenamiento no aplican; los datos de evaluación son LoCoMo y LongMemEval-S/500. La innovación destacable es el concepto de "enmascaramiento cooperativo": bajo carga moderada, 14 de las 15 ablaciones de un solo componente parecen no tener coste, pero bajo carga mayor 10 de 15 se mueven en la misma dirección en las diez semillas, lo que sugiere que los mecanismos se compensan entre sí. En la cascada de integración sintética (decaimiento 0,30/día, 60 días), la consolidación tipo "sueño" actúa como multiplicador de retención de 1,92×.

## Capacidades

- Gestión de memoria de largo plazo para agentes conversacionales, con capas separadas para hechos, episodios y procedimientos.
- Recuperación hebbiana: Precision@5 de 0,955 frente a 0,200 con aristas uniformes en el experimento reportado.
- Confianza bayesiana para calibrar la fiabilidad de los recuerdos: AUC por pares de 0,797 (frente a 0,533).
- Consolidación tipo "sueño" con reducción de almacenamiento del 47,4% y mejora de estabilidad del 37% en simulación.
- Programación de repasos espaciada estilo FSRS para la memoria semántica.
- Memoria central de hechos fijados (estilo Letta) y memoria procedimental para habilidades y flujos de trabajo.
- Enlaces de entidades entre dominios (capa 7, experimental).
- Integración con pipelines RAG y con agentes basados en LLM; el sistema no genera texto por sí mismo, sino que gestiona el contexto que se inyecta al LLM.
- Soporte de tool calling, agentes multi-paso y razonamiento multi-turno: no disponible como capacidad propia; depende del LLM huésped.

## Casos de uso

- Asistentes conversacionales de larga duración: ZenBrain mantiene hechos fijados en la capa central y hechos semánticos con repaso espaciado, de modo que el agente recuerda preferencias del usuario entre sesiones sin reinyectar todo el historial en cada turno.
- Atención al cliente multi-turno: la memoria episódica registra incidencias concretas y la semántica guarda políticas y datos del cliente, lo que permite retomar conversaciones días después con contexto relevante y un consumo de tokens reducido en el paso de respuesta.
- Agentes autónomos de investigación: la memoria procedimental almacena flujos de trabajo reutilizables ("cómo hacer X") y la memoria entre contextos enlaza entidades de distintos dominios para tareas de descubrimiento.
- Sistemas RAG con memoria persistente: ZenBrain se coloca como capa de gestión sobre un almacén vectorial, aplicando decaimiento y consolidación para evitar que el índice crezca sin control (reducción de almacenamiento del 47,4% en simulación).
- Asistentes personales de conocimiento: la combinación de memoria episódica y semántica permite construir un historial de aprendizaje del usuario con repasos programados, útil en aplicaciones de estudio o formación.
- Evaluación y benchmarking de arquitecturas de memoria: el arnés de simulación con 95 tests y 10 semillas sirve como base reproducible para comparar variantes de memoria en agentes, aunque con las cautelas metodológicas indicadas por el autor.
- Agentes de soporte técnico con escalado: la memoria central fija hechos críticos (versiones, configuraciones) y la procedimental guarda runbooks, reduciendo la necesidad de reinyectar documentación en cada consulta.

## Benchmarks y rendimiento

| Experimento | Metrica | Resultado |
|---|---|---|
| Consolidacion tipo sueno (simulacion) | Estabilidad / almacenamiento | +37% estabilidad con 47,4% de reduccion de almacenamiento; en el unico run con datos reales se observa perdida de precision de recuperacion (aviso de correccion §6) |
| Recuperacion hebbiana | Precision@5 | 0,955 (frente a 0,200 con aristas uniformes) |
| Confianza bayesiana | AUC por pares | 0,797 (+49,5% frente a 0,533) |
| Ablacion moderada | Suite de 15 componentes | 14 de 15 eliminaciones individuales parecen sin coste; eliminar el "sueno" cuesta -34,4% |
| Ablacion exigente | Suite de 15 componentes | 7 de 15 componentes alcanzan el criterio impreso en simulacion, todos con perdida (mismo p = 5,062 × 10⁻³ en cada fila marcada) |
| Ablacion de estres (decaimiento 0,25/dia, 60 dias) | Suite de 15 componentes | 10 de 15 alcanzan el criterio en simulacion; nueve con perdida, PriorityMap con ganancia |
| LongMemEval-500 (comparacion principal) | Precision del juez binario | 91,3% de la precision del brazo de contexto completo, con 1/109,7 de sus tokens de entrada en el paso de respuesta (sin contar la ingesta del historial) |

Advertencia del autor: en LongMemEval-500, el brazo medido de ZenBrain es un port en Python de una clase de scoring del arnés de tests, no el sistema de siete capas ni una importacion de los paquetes. De nueve comparaciones frente a Letta, Mem0 y A-Mem (3 competidores × 3 jueces LLM, correccion de Bonferroni), tres se sostienen (todas frente a A-Mem) y las seis restantes frente a Letta y Mem0 no muestran diferencia significativa. Los datos corresponden al paper version 9 (Zenodo, 31 oct 2026), que corrige la v8 tras una auditoria post-publicacion.

## Requisitos de hardware

- VRAM para inferencia: no aplica; ZenBrain no ejecuta pesos de modelo. El consumo depende del LLM huésped que use el agente.
- GPU recomendadas: no aplica al marco de memoria; las necesidades vienen determinadas por el LLM subyacente.
- Compatibilidad con GPU de consumo: no aplica; el software se ejecuta en Node.js (paquetes npm) y en Python para el arnés de evaluacion.
- Opciones de despliegue: paquetes npm `@zensation/core` y `@zensation/algorithms`; repositorio GitHub; demo en Hugging Face Spaces (`zensation-ai/zenbrain-playground`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La unica cifra relacionada es la reduccion de tokens de entrada en el paso de respuesta (1/109,7 respecto al contexto completo) en LongMemEval-500.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque de memoria | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZenBrain | Marco de memoria en 7 capas | Jerarquia neuroinspirada con Hebb, FSRS y Bayes | Depende del LLM huésped | Paper CC-BY-4.0; codigo Apache-2.0 | npm, GitHub, HF Space |
| Letta (MemGPT) | Marco de memoria para agentes | Memoria central y archival con gestion por LLM | Depende del LLM huésped | no disponible en la informacion | no disponible en la informacion |
| Mem0 | Capa de memoria para agentes | Extraccion y consolidacion de recuerdos | Depende del LLM huésped | no disponible en la informacion | no disponible en la informacion |
| A-Mem | Arquitectura de memoria agentica | Notas enlazadas y evolutivas | Depende del LLM huésped | no disponible en la informacion | no disponible en la informacion |

En las comparaciones reportadas por el autor, ZenBrain solo supera de forma significativa a A-Mem (3 de 9 contrastes); frente a Letta y Mem0 no hay diferencia significativa en los 6 contrastes restantes. No se dispone de datos de parametros, contexto ni rendimiento de los competidores en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas por si mismo; requiere un LLM huésped.
- Estado de preprint con correcciones post-publicacion: la version 9 corrige la v8 tras una auditoria (18 sep 2026); el aviso de correccion esta en `10.5281/zenodo.22831086`.
- La comparacion principal en LongMemEval-500 usa un port en Python de una clase de scoring, no el sistema de siete capas; los resultados no deben interpretarse como validacion del marco completo.
- Solo tres de nueve comparaciones alcanzan significacion estadistica; el resto no muestra diferencia frente a Letta y Mem0.
- El unico run con datos reales del experimento de consolidacion muestra perdida de precision de recuperacion, segun el aviso de correccion §6.
- Los resultados de ablacion dependen de simulacion con PRNG sembrado; el fenomeno de enmascaramiento cooperativo sugiere que las eliminaciones individuales pueden parecer inocuas por compensacion entre mecanismos.
- Idioma soportado declarado: solo ingles (en).
- Riesgo de alucinacion: no aplica directamente al marco, pero si al LLM huésped que consuma los recuerdos inyectados; la calibracion bayesiana (AUC 0,797) no elimina este riesgo.
- Licencia: el paper y el repo HF son CC-BY-4.0 (permite uso comercial con atribucion); el codigo es Apache-2.0. Verificar terminos de los paquetes npm antes de uso en produccion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Capa 7 (memoria entre contextos) marcada como experimental.
- Sin descargas registradas en Hugging Face (0 descargas) y 5 likes; madurez de adopcion muy baja.

## Enlaces

- Hugging Face: https://huggingface.co/zensation-ai/zenbrain
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/zensation-ai/zenbrain-playground
- GitHub: https://github.com/zensation-ai/zenbrain
- Paper en arXiv: https://arxiv.org/abs/2604.23878
- Paper en Zenodo (v9): https://zenodo.org/records/23832288
- DOI concepto: https://doi.org/10.5281/zenodo.19353663
- Aviso de correccion: https://doi.org/10.5281/zenodo.22831086
- Paquete npm `@zensation/core`: https://www.npmjs.com/package/@zensation/core
- Paquete npm `@zensation/algorithms`: https://www.npmjs.com/package/@zensation/algorithms
- Sitio web: https://zensation.ai/
- Licencia del codigo (Apache-2.0): https://github.com/zensation-ai/zenbrain/blob/main/LICENSE
- Licencia del paper (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
