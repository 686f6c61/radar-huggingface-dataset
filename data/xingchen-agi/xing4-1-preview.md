# XingChen-AGI/Xing4.1-Preview

## Resumen

Xing4.1-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology (Beijing) Co., Ltd., dentro de la familia Xing (anteriormente conocida como TeleChat). Con 285.000 millones de parametros totales y 17.000 millones de parametros activos por token, esta disenado especificamente para tareas de codigo agentico y flujos de trabajo con agentes de horizonte largo, con una ventana de contexto nativa de 1 millon de tokens.

La relevancia tecnica del modelo reside en su co-diseno hardware-software para los aceleradores Ascend 910C de Huawei: fue entrenado con 8.192 chips Ascend 910C sobre el framework MindSpore, y su arquitectura se adapto explicitamente a las caracteristicas de dichos aceleradores (alta relacion de computo matricial Cube frente a computo vectorial limitado). Combina atencion Multi-head Latent Attention (MLA) con DeepSeek Sparse Attention (DSA), ambas tomadas de DeepSeek V3.2, para reducir el coste computacional en contextos largos.

El modelo se distribuye en formato PyTorch (safetensors) compatible con Transformers, SGLang y vLLM, ademas de su formato nativo MindSpore, bajo licencia Apache 2.0. Esto lo convierte en una alternativa relevante para despliegues de agentes de codigo en produccion que requieran contexto muy largo sin depender del ecosistema de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA + DeepSeek Sparse Attention (DSA) |
| Parametros totales | 286.548.019.456 (285B) |
| Parametros activos | 17B por token |
| Longitud de contexto | 1.000.000 tokens (1M, nativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch/Hugging Face Transformers); MindSpore nativo en repo separado |
| Capas | 45 |
| Hidden size | 4.096 |
| Dense FFN intermediate size | 18.432 |
| Hardware de entrenamiento | 8.192 Ascend 910C |
| Framework de entrenamiento | MindSpore |
| Tamano del repo | 573,2 GB |

## Arquitectura y entrenamiento

Xing4.1-Preview emplea una arquitectura MoE dispersa que combina Multi-head Latent Attention (MLA) con DeepSeek Sparse Attention (DSA). La eleccion de DSA frente a alternativas de atencion lineal hibrida (KDA, GDN) responde a un criterio de co-diseno con el hardware: DSA se apoya principalmente en operaciones de multiplicacion matricial, que se alinean mejor con las unidades Cube del Ascend 910C, mientras que las arquitecturas de atencion lineal hibrida exigen un rendimiento vectorial y una fusion de operadores que el stack software del 910C no aprovecha plenamente.

El modelo adopta una arquitectura "ancha y poco profunda" (45 capas, hidden size 4.096, FFN denso de 18.432) para incrementar la intensidad aritmetica y la reutilizacion de datos en los operadores matriciales, mejorando la utilizacion de las unidades Cube y reduciendo el overhead secuencial por capa. La estrategia de paralelismo es un sharding hibrido ("shard dentro del super-pod, replicacion entre super-pods") que sustituye el paralelismo de pipeline para eliminar burbujas, con solapamiento asincrono de AllGather/ReduceScatter intra-super-pod y AllReduce de gradientes inter-super-pod.

El vocabulario se personalizo para escenarios de agentes y codigo mediante estadisticas de subpalabras, recuentos de frecuencia e informacion mutua puntual sobre corpus de trayectorias de agentes, llamadas a herramientas y repositorios de codigo. Con el mismo tamano de vocabulario, reduce el numero de tokens un 16% en escenarios de agentes y un 23% en escenarios de codigo. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento complejo en contextos de hasta 1M tokens.
- Codigo agentico: generacion de frontend, analisis de datos y comprension de documentos largos.
- Flujos de agentes de horizonte largo con razonamiento multi-paso.
- Evaluado con arneses de agentes mainstream: Codex, OpenCode, Pi, Claude Code y WorkBuddy.
- Comprension de documentos largos gracias al contexto nativo de 1M tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Agentes de codigo en produccion: el modelo puede integrarse en arneses como Claude Code o Codex para tareas de refactorizacion, generacion de tests y correccion de errores sobre repositorios completos, gracias a su contexto de 1M tokens que permite cargar grandes porciones de codigo en una sola pasada.
- Generacion de frontend: adecuado para producir interfaces completas a partir de especificaciones, un escenario para el que el autor declara rendimiento competitivo y para el que el vocabulario personalizado reduce un 23% los tokens necesarios.
- Analisis de datos agentico: puede orquestar pasos de inspeccion, transformacion y resumen sobre conjuntos de datos, manteniendo el estado de la tarea en contexto largo sin truncar.
- Comprension de documentos extensos: contratos, informes tecnicos o expedientes de cientos de miles de tokens pueden procesarse en una unica ventana, evitando estrategias de chunking y perdida de contexto entre fragmentos.
- Automatizacion de tareas de larga duracion: flujos multi-paso donde el agente debe mantener coherencia durante muchas iteraciones, apoyado por la atencion dispersa que reduce el coste por token en contextos largos.
- Despliegue en infraestructura no-NVIDIA: al estar co-disenado para Ascend 910C y ser compatible con SGLang y vLLM, es una opcion para organizaciones con clusters Ascend que quieran servir un modelo de 285B con activacion de 17B.
- Migracion desde MindSpore: los pesos en safetensors permiten desplegar en stacks PyTorch estandar sin depender del entorno de entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona evaluaciones con arneses de agentes (Codex, OpenCode, Pi, Claude Code, WorkBuddy) y rendimiento "competitivo" en cargas agenticas, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de ningun otro benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: con 285B parametros totales, en precision completa (BF16) se requieren aproximadamente 570 GB de memoria, lo que exige multiples GPUs o aceleradores. Con cuantizacion a 8 bits el requisito baja a unos 285 GB; a 4 bits, a unos 143 GB. Los tipos de cuantizacion soportados no estan disponibles en la informacion proporcionada.
- Dado que solo se activan 17B parametros por token, el throughput efectivo es mas favorable que el de un modelo denso de 285B, pero el peso completo debe residir en memoria.
- GPU/aceleradores recomendados: el modelo fue entrenado en Ascend 910C; para despliegue en NVIDIA se necesitarian configuraciones multi-GPU de alta gama (varias A100 80GB o H100 80GB). No se dispone de recomendaciones oficiales de hardware de inferencia en la informacion.
- No cabe en una GPU de consumo individual (RTX 4090, 24 GB) en ninguna precision practica.
- Opciones de despliegue: Transformers, SGLang y vLLM, segun la model card. Soporte de llama.cpp u Ollama no confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Xing4.1-Preview | 285B / 17B | 1M | Apache 2.0 | MoE MLA + DSA, co-disenado para Ascend 910C |
| DeepSeek V3.2 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Fuente de las tecnicas MLA y DSA que adopta Xing4.1 |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks numericos, lo que impide verificar de forma independiente las afirmaciones de rendimiento del autor.
- Los idiomas soportados no estan documentados; el vocabulario se optimizo para escenarios de agentes y codigo, lo que podria penalizar el rendimiento en otros dominios o lenguas.
- No se especifica el numero de tokens de entrenamiento ni la composicion del dataset, lo que limita la evaluacion de sesgos y de cobertura.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones especificas.
- El modelo se distribuye con `custom_code`, lo que implica que la carga requiere `trust_remote_code=True` y revision del codigo incluido en el repositorio.
- El repositorio ocupa 573,2 GB, lo que exige planificacion de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de uso comercial y las obligaciones de atribucion en la documentacion oficial.
- El soporte de tool calling y de agentes se menciona de forma cualitativa; no se detalla la interfaz ni el formato de llamadas a herramientas.
- La informacion sobre cuantizacion es inexistente, lo que complica la planificacion de despliegues con memoria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.1-Preview
- Pesos en formato MindSpore: https://huggingface.co/XingChen-AGI/Xing4.1-Preview-MindSpore
- GitHub: https://github.com/XingChen-AGI/Xing4.1-Preview
- Informe tecnico (paper): https://huggingface.co/papers/2611.22115
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.1-Preview
- Modelers: https://modelers.cn/user/XingChen-AGI
- AtomGit: https://atomgit.com/XingChen-AGI
- TeleAI Open Platform: https://www.teleai.com.cn/
