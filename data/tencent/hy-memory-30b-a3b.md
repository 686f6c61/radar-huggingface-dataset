# tencent/Hy-Memory-30B-A3B

## Resumen

Hy-Memory-30B-A3B es un modelo especializado de escritura de memoria a largo plazo desarrollado por Tencent Hunyuan. No es un modelo conversacional de propósito general: su función es ocupar la ruta de escritura (write path) dentro de frameworks de memoria externa, decidiendo qué información retener, con qué precisión representarla y cómo debe actualizar la evidencia nueva el banco de memoria persistente. Con 30.064.725.888 parámetros totales y aproximadamente 3.000 millones activos por token (nomenclatura A3B), está pensado para sustituir directamente al LLM generalista dentro de Mem0, MemOS y Hy-Memory, cubriendo escenarios de chat, trabajo y código.

El modelo se entrena en dos etapas: destilación on-policy de memoria (OPD) y aprendizaje por refuerzo con atribución de crédito a nivel de chunk (Attributed Memory Reinforcement Learning). Según la model card, transfiere sin ajuste adicional a frameworks de memoria no vistos durante el entrenamiento, como EverMemOS, y supera en media macro a Claude Opus 5 y DeepSeek V4.1 Flash en la matriz de cuatro harnesses evaluada.

Su relevancia actual radica en que ataca un cuello de botella concreto de los agentes con memoria persistente: la calidad de la escritura en el banco de memoria, que suele delegarse a un LLM generalista poco optimizado para esa tarea. Se publica bajo licencia Apache 2.0, con soporte declarado de inglés y chino, y pesos en safetensors con arquitectura `hy_v3` para la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada explicitamente en la informacion disponible; la nomenclatura A3B y el ratio entre parametros totales y activos indican un transformer con mixture-of-experts (tag de HuggingFace: `hy_v3`) |
| Parametros totales | 30.064.725.888 (30,06 B) |
| Parametros activos | Aproximadamente 3 B por token (segun denominacion A3B y model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan conversiones oficiales en la informacion proporcionada) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers; tamano del repositorio 60,1 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna mas alla del tag `hy_v3` y de la convencion de nombres A3B, que implica un diseno disperso con unos 3.000 millones de parametros activos sobre un total de 30.064 millones. El modelo se entrena y se despliega dentro de las mismas configuraciones de harness que usara en produccion, lo que condiciona el diseno: no se optimiza para generar respuestas al usuario, sino para producir cadenas de estado que se escriben en el banco de memoria.

El entrenamiento consta de dos etapas. La primera es Memory On-Policy Distillation (OPD), que aporta supervision densa de un profesor sobre las cadenas de estado escritas por el propio estudiante. La segunda es Attributed Memory Reinforcement Learning, en la que el modelo examina los bancos de memoria resultantes, asigna credito a nivel de chunk y arrastra el banco seleccionado entre ventanas de rollout. En la rejilla de rollout, cada celda representa el banco tras el chunk t del rollout i, sombreada por su puntuacion de chunk, con normalizacion de ventajas por columna; el banco final con mayor suma de puntuaciones se convierte en el padre de la siguiente ventana. No se proporcionan en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO clasicos.

## Capacidades

- Escritura de memoria a largo plazo: decide que informacion retener, como representarla y como actualizar el banco persistente ante evidencia nueva.
- Integracion directa como writer en Mem0, MemOS y Hy-Memory, en escenarios de chat, trabajo y codigo.
- Transferencia a frameworks de memoria no vistos en entrenamiento, con EverMemOS como caso retenido (held out) y evaluado.
- Memoria de persona y preferencias: evaluado en PersonaMem-v2 (PM-v2) con 51,62 en el harness Mem0 y 51,54 en Hy-Memory.
- Memoria conversacional de largo recorrido: evaluado en LoCoMo (59,54 en Mem0, 73,28 en Hy-Memory) y LongMemEval (73,00 y 89,00 respectivamente).
- Memoria aplicada a repositorios de codigo: Code Memory Bench (CMB) con 67,13 en Mem0 y 70,73 en Hy-Memory.
- Dominios de viajes y compras: Travel SPS (54,51 y 57,65) y Shopping PS (18,33 y 21,11).
- Soporte de tool calling, function calling, agentes multi-paso, vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales con memoria persistente: el modelo se coloca como writer en Mem0 o MemOS para decidir que turnos de conversacion se consolidan en el banco de memoria y como se actualizan, manteniendo coherencia entre sesiones sin intervencion manual.
- Memoria de persona en productos de recomendacion: al evaluarse especificamente en PersonaMem-v2, encaja en sistemas que deben recordar preferencias estables del usuario y actualizarlas cuando hay evidencia nueva, por ejemplo en personalizacion de contenidos.
- Agentes de codigo con memoria de repositorio: mediante Code Memory Bench, el modelo puede mantener un banco de conocimiento sobre la estructura, convenciones y decisiones de un repositorio, de modo que un agente recupere contexto relevante en tareas sucesivas sobre el mismo proyecto.
- Planificacion de viajes asistida: el modulo Travel SPS mide la capacidad de recordar restricciones y preferencias declaradas durante la planificacion (fechas, presupuesto, restricciones alimentarias) y aplicarlas a lo largo de una conversacion larga.
- Flujos de compra y postventa: el modulo Shopping PS permite recordar preferencias de producto, tallas e historial de compras para asistentes de e-commerce que gestionan interacciones recurrentes.
- Sustitucion de LLM generalista en pipelines de memoria existentes: al declararse compatible con harnesses ya desplegados, permite bajar el coste por token de la ruta de escritura (3 B activos en lugar de un modelo denso grande) manteniendo o mejorando la calidad media macro del banco resultante.
- Investigacion sobre memoria de agentes: sirve como baseline reproducible para comparar estrategias de escritura de memoria, dado que la evaluacion fija harness, prompts, configuracion de recuperacion, modelo de respuesta y juez, cambiando unicamente el writer.

## Benchmarks y rendimiento

Media macro entre cuatro harnesses (submuestra fija del 20% del benchmark; cada harness promedia seis metricas con el mismo peso; EverMemOS queda fuera del entrenamiento):

| Memory writer | Mem0 | Hy-Memory | MemOS | EverMemOS | Media |
|---|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 54,02 | 60,55 | 50,51 | 56,89 | 55,49 |
| Claude Opus 5 | 53,43 | 60,53 | 50,50 | 54,04 | 54,62 |
| DeepSeek V4.1 Flash | 49,73 | 60,20 | 49,17 | 55,47 | 53,64 |
| Hy3 | 45,99 | 58,06 | 50,19 | 52,30 | 51,63 |
| Qwen3.6-35B-A3B | 47,51 | 55,87 | 47,36 | 50,75 | 50,37 |
| Hy3-A3B Base | 40,20 | 50,39 | 49,05 | 50,98 | 47,66 |
| Qwen3-30B-A3B | 39,81 | 45,67 | 45,44 | 46,57 | 44,37 |

Detalle por metrica en el harness Mem0:

| Writer | LoCoMo | LME | PM-v2 | Travel | Shopping | CMB | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 59,54 | 73,00 | 51,62 | 54,51 | 18,33 | 67,13 | 54,02 |
| Claude Opus 5 | 69,47 | 66,00 | 53,58 | 42,98 | 17,78 | 70,74 | 53,43 |
| DeepSeek V4.1 Flash | 58,78 | 69,39 | 49,56 | 35,07 | 16,67 | 68,92 | 49,73 |
| Hy3 | 41,22 | 62,00 | 44,44 | 46,87 | 17,22 | 64,16 | 45,99 |
| Qwen3.6-35B-A3B | 50,00 | 69,00 | 49,38 | 36,39 | 20,00 | 60,30 | 47,51 |
| Hy3-A3B Base | 50,00 | 47,00 | 40,82 | 37,91 | 14,44 | 51,03 | 40,20 |
| Qwen3-30B-A3B | 46,18 | 56,00 | 42,32 | 31,98 | 16,67 | 45,68 | 39,81 |

Detalle por metrica en el harness Hy-Memory:

| Writer | LoCoMo | LME | PM-v2 | Travel | Shopping | CMB | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 73,28 | 89,00 | 51,54 | 57,65 | 21,11 | 70,73 | 60,55 |
| Claude Opus 5 | 74,43 | 89,69 | 48,71 | 51,34 | 23,33 | 75,70 | 60,53 |
| DeepSeek V4.1 Flash | 72,90 | 85,86 | 49,00 | 53,46 | 22,78 | 77,18 | 60,20 |
| Hy3 | 69,47 | 89,00 | 52,76 | 49,01 | 21,67 | 66,44 | 58,06 |
| Qwen3.6-35B-A3B | 70,99 | 84,85 | 43,56 | 49,82 | 20,00 | 65,98 | 55,87 |
| Hy3-A3B Base | 66,41 | 87,00 | 49,84 | 31,36 | 17,78 | 49,97 | 50,39 |
| Qwen3-30B-A3B | 64,12 | 82,00 | 41,06 | 32,83 | 18,89 | 35,10 | 45,67 |

Las tablas 4 (MemOS) y 5 (EverMemOS) del informe tecnico aparecen truncadas en la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): en torno a 60 GB solo para pesos, coherente con los 60,1 GB del repositorio. Estimacion derivada del numero de parametros, no publicada por el autor.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 30 GB. En 4 bits: aproximadamente 15-17 GB. Cuantizaciones oficiales no disponibles.
- GPU recomendadas: una unica GPU de 80 GB (H100, A100 80 GB) para BF16; configuraciones multi-GPU de 2x A100 40 GB o 2x RTX 4090 24 GB para precision reducida.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090, L4/A6000 de 48 GB con holgura) si se aplica cuantizacion de 4 bits. Al tener solo unos 3 B de parametros activos, el coste por token es propio de un modelo mucho menor, aunque la huella de memoria es la de un modelo de 30 B.
- Opciones de despliegue: la model card declara unicamente transformers. Compatibilidad con vLLM, SGLang, TGI, llama.cpp u Ollama no esta confirmada en la informacion disponible, y no se documentan conversiones GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion relevante para este modelo no es de chat generalista, sino de desempeno como writer de memoria. Los datos proceden de la misma tabla de evaluacion, con harness y prompts fijos.

| Modelo | Parametros | Contexto | Media macro (4 harnesses) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-Memory-30B-A3B | 30,06 B totales / ~3 B activos | No disponible | 55,49 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Claude Opus 5 | No disponible | No disponible | 54,62 | Propietaria | Solo API |
| DeepSeek V4.1 Flash | No disponible | No disponible | 53,64 | No disponible | Endpoint (referido como DeepSeek V4.1 Flash en el informe) |
| Hy3 | No disponible | No disponible | 51,63 | No disponible | No disponible en la informacion proporcionada |
| Qwen3.6-35B-A3B | ~35 B totales / ~3 B activos | No disponible | 50,37 | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de proposito especifico: no es un LLM conversacional general. Su salida esperada son escrituras y actualizaciones de memoria dentro de un harness; usarlo como asistente directo queda fuera de su diseno declarado.
- Evaluacion sobre submuestra: todos los benchmarks de la matriz principal se evaluan sobre un 20% fijo del conjunto, por eficiencia computacional, lo que limita la precision estadistica de las diferencias entre modelos (por ejemplo, la ventaja de 0,87 puntos sobre Claude Opus 5 en la media macro es estrecha).
- Sesgos conocidos: no se publica analisis de sesgos en la informacion disponible.
- Riesgo de alucinacion: no se cuantifica en la model card. Al tratarse de un writer que decide que consolidar en memoria persistente, un error de escritura puede propagarse a interacciones futuras en lugar de limitarse a un unico turno.
- Idiomas: soporte declarado solo de ingles y chino. No hay datos de rendimiento en castellano ni en otros idiomas.
- Longitud de contexto: no disponible, factor critico para estimar cuanto historial puede procesar por ventana de escritura.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, con las obligaciones habituales de atribucion y de conservacion del aviso de licencia.
- Dependencia del harness: los resultados estan medidos con configuraciones concretas de Mem0, MemOS, Hy-Memory y EverMemOS. Cambiar el sistema de recuperacion, el modelo de respuesta o el juez invalida la comparacion; la propia evaluacion fija esos componentes a proposito.
- Cuantizaciones: no hay conversiones oficiales publicadas, por lo que el despliegue en hardware de consumo exige generar las propias y asumir la perdida de calidad no medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Repositorio en GitHub: https://github.com/Tencent-Hunyuan/Hy-Memory
- Informe tecnico en arXiv (PDF): https://arxiv.org/pdf/2610.22196
- Informe tecnico en arXiv (HTML): https://arxiv.org/html/2610.22196v1
- Sitio corporativo de Tencent: https://www.tencent.com/
