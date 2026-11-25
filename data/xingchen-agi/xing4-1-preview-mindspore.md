# XingChen-AGI/Xing4.1-Preview-MindSpore

## Resumen

Xing4.1-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology (Beijing) Co., Ltd., dentro de la familia Xing (anteriormente TeleChat). Cuenta con 285.000 millones de parámetros totales y 17.000 millones de parámetros activos por token, y esta disenado especificamente para tareas de codigo agentico y flujos de agentes de horizonte largo, con una ventana de contexto nativa de 1 millon de tokens. Su propuesta diferencial es haber sido entrenado integramente sobre hardware domestico chino: 8.192 chips Ascend 910C con el framework MindSpore.

La arquitectura combina Multi-head Latent Attention (MLA) con DeepSeek Sparse Attention (DSA), una eleccion de diseno consciente del hardware que prioriza operaciones matriciales (unidades Cube del Ascend 910C) frente a alternativas de atencion lineal hibrida como KDA o GDN, cuyo coste en unidades vectoriales resulta menos eficiente en la pila software actual del acelerador. El modelo adopta ademas una estructura "ancha y poco profunda" (45 capas, hidden size 4096, FFN denso de 18432) para maximizar la intensidad aritmetica y la reutilizacion de datos.

Es relevante ahora porque representa uno de los primeros intentos publicos de entrenar un modelo frontera de escala ~300B con contexto de 1M sobre un stack totalmente no-NVIDIA (Ascend + MindSpore), y porque publica pesos en formato MindSpore, un ecosistema con escasa representacion en modelos de este tamano. El repositorio ocupa 573,2 GB y se distribuye con codigo personalizado (`custom_code`), lo que implica requisitos de carga no estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA + DeepSeek Sparse Attention (DSA) |
| Parametros totales | 285B |
| Parametros activos | 17B por token |
| Longitud de contexto | 1M tokens (nativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MindSpore (existe version PyTorch en repositorio separado) |

Otros datos tecnicos relevantes: 45 capas, hidden size 4096, FFN denso intermedio de 18432, vocabulario personalizado para agentes y codigo.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Sparse Mixture-of-Experts que combina MLA (Multi-head Latent Attention, con representaciones Key-Value comprimidas) y DSA (DeepSeek Sparse Attention) para reducir la complejidad del calculo de atencion en secuencias largas. La eleccion de DSA frente a alternativas de atencion lineal hibrida (KDA, GDN) responde a un analisis de hardware: DSA se apoya principalmente en operaciones de multiplicacion matricial, alineadas con las unidades Cube del Ascend 910C, mientras que las arquitecturas hibridas lineales exigen gating, actualizacion de estado y operaciones de scan que saturan las unidades vectoriales y dependen en exceso de la fusion de operadores en la pila software disponible.

El entrenamiento se realizo sobre 8.192 chips Ascend 910C con MindSpore. Destacan varias decisiones de co-diseno hardware-software: una estrategia de paralelismo hibrido ("shard dentro de super-pods, replicar entre super-pods") que sustituye el paralelismo de pipeline para eliminar burbujas, con AllGather y ReduceScatter intra-super-pod y AllReduce de gradientes inter-super-pod solapados asincronamente con el paso backward; un optimizador Muon basado en propietario (owner-based) que realiza la ortogonalizacion de Newton-Schulz de cada matriz 2D una sola vez en un dispositivo designado y la difunde por broadcast, evitando reconstrucciones redundantes de matrices completas; y un vocabulario personalizado construido a partir de estadisticas de subpalabras, frecuencias y pointwise mutual information sobre corpus de trayectorias de agentes, llamadas a herramientas y repositorios de codigo. Este vocabulario reduce el numero de tokens un 16% en escenarios de agente y un 23% en escenarios de codigo con el mismo tamano de vocabulario. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento complejo en tareas de horizonte largo.
- Codigo agentico: generacion de frontend, analisis de datos y comprension de documentos largos.
- Soporte nativo de contexto de 1M tokens, adecuado para repositorios completos o documentacion extensa.
- Flujos de agente multi-paso y或多-turno con llamadas a herramientas (la model card menciona evaluacion con harnesses como Codex, OpenCode, Pi, Claude Code y WorkBuddy).
- Compatibilidad declarada con ecosistemas de inferencia open source como SGLang y vLLM.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir un monorepo o una base de codigo extensa y responder preguntas de arquitectura, dependencias o impacto de cambios sin trocear el codigo.
- Generacion de frontend asistida por agente: el modelo puede operar dentro de harnesses como Claude Code o Codex para iterar sobre componentes UI, ejecutar herramientas y validar resultados en varios pasos.
- Automatizacion de analisis de datos: interpretacion de notebooks, hojas de calculo y documentos largos combinada con llamadas a herramientas de ejecucion para producir informes o transformaciones de datos.
- Comprension de documentacion legal o tecnica extensa: la ventana de 1M tokens permite resumir contratos, especificaciones o manuales completos manteniendo coherencia entre secciones.
- Pipelines de CI/CD con agentes de codigo: su soporte declarado para SGLang y vLLM facilita el despliegue como servicio interno que resuelve tareas de refactorizacion o revision de parches.
- Investigacion sobre stacks no-NVIDIA: al ser uno de los pocos modelos de esta escala con pesos en MindSpore, sirve como banco de pruebas para equipos que evaluan Ascend 910C en inferencia y entrenamiento.
- Migracion y evaluacion comparativa de ecosistemas: la existencia de una version PyTorch paralela permite contrastar el rendimiento del mismo modelo en dos stacks distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona evaluaciones cualitativas con harnesses de agentes (Codex, OpenCode, Pi, Claude Code, WorkBuddy) y afirma rendimiento competitivo en cargas agenticas, pero no aporta cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de 285B parametros totales con 17B activos requiere almacenar todos los pesos; en precision de 16 bits serian aproximadamente 570 GB, coherente con el tamano del repositorio (573,2 GB). Cualquier cuantizacion reduciria esa cifra, pero no se documentan formatos soportados.
- GPU recomendadas: el entrenamiento se realizo sobre Ascend 910C; no se especifican GPUs NVIDIA validadas. La compatibilidad con SGLang y vLLM sugiere que la version PyTorch podria ejecutarse en aceleradores NVIDIA de gama alta, pero no hay lista oficial.
- Cabe en consumer GPU: no. Incluso con cuantizacion agresiva, los 285B parametros totales exigen agregacion de memoria de multiples aceleradores.
- Opciones de despliegue: MindSpore (formato nativo de este repositorio), SGLang y vLLM (declarados compatibles), y la version PyTorch para Hugging Face Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xing4.1-Preview | 285B / 17B | 1M | no disponible | MindSpore y PyTorch | Entrenado en Ascend 910C + MindSpore |
| DeepSeek V3.2 | no disponible en la informacion | no disponible | no disponible | no disponible | Fuente declarada de MLA y DSA |
| Alternativas de escala ~300B MoE | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos |

La model card unicamente referencia DeepSeek V3.2 como origen de los mecanismos de atencion; no se proporcionan comparativas de rendimiento ni especificaciones de modelos competidores en la informacion disponible.

## Limitaciones y advertencias

- Licencia no especificada: no es posible determinar si se permite uso comercial; debe consultarse el repositorio antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas presentes en el corpus de entrenamiento, que no se detalla.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas ni tasas de error.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre procesos de alineacion (RLHF/DPO no confirmados).
- Requiere `custom_code`: la carga no es estandar y exige confiar en codigo remoto del repositorio, lo que anade superficie de riesgo en entornos de produccion.
- Ecosistema MindSpore: menor madurez de herramientas, documentacion y soporte comunitario frente a PyTorch; la version PyTorch se aloja en un repositorio separado y podria divergir.
- Huella de memoria elevada: 573,2 GB de pesos implican infraestructura multi-nodo o multi-GPU; no es viable en una sola maquina convencional.
- Ausencia de benchmarks publicos: impide validar de forma independiente las afirmaciones de rendimiento de la model card.
- Modelo en estado "Preview": puede presentar inestabilidades o cambios incompatibles en futuras revisiones.

## Enlaces

- Hugging Face (MindSpore): https://huggingface.co/XingChen-AGI/Xing4.1-Preview-MindSpore
- Hugging Face (PyTorch): https://huggingface.co/XingChen-AGI/Xing4.1-Preview
- GitHub: https://github.com/XingChen-AGI/Xing4.1-Preview
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.1-Preview-MindSpore/
- Informe tecnico (paper): https://huggingface.co/papers/2611.22115
- Plataforma TeleAI: https://www.teleai.com.cn/
