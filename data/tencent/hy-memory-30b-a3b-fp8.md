# tencent/Hy-Memory-30B-A3B-FP8

## Resumen

Hy-Memory-30B-A3B-FP8 es la versión cuantizada a FP8 del modelo Hy-Memory-30B-A3B de Tencent Hunyuan, un modelo especializado en escribir memoria a largo plazo dentro de frameworks externos de memoria. No es un LLM conversacional de propósito general: su función es ocupar el "write path" de sistemas como Mem0, MemOS o Hy-Memory, decidiendo qué información retener, con qué precisión representarla y cómo debe actualizar la nueva evidencia el banco de memoria persistente.

Arquitectura Mixture-of-Experts con 30.064.725.984 parámetros totales y aproximadamente 3B activos por token (de ahí el sufijo A3B), según la información publicada. El modelo base se entrena en dos etapas: destilación on-policy de memoria (OPD) seguida de aprendizaje por refuerzo de memoria atribuida, y transfiere directamente a frameworks no vistos durante el entrenamiento, como EverMemOS.

La relevancia actual está en que sustituye a un LLM generalista en la capa de memoria con un coste de inferencia mucho menor, y en los benchmarks publicados supera a Claude Opus 5 y DeepSeek V4.1 Flash en la media macro de cuatro frameworks de memoria (55,49 frente a 54,62 y 53,64). Esta versión FP8 está optimizada para despliegue con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tag `hy_v3`) |
| Parametros totales | 30.064.725.984 (~30B) |
| Parametros activos | ~3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta version); no disponible otros formatos en la informacion proporcionada |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 30,6 GB |
| Libreria | transformers |
| Modelo base | tencent/Hy-Memory-30B-A3B |
| Fecha de publicacion | 2026-10-16 (actualizado 2026-10-18) |

## Arquitectura y entrenamiento

El modelo es una variante MoE del linaje Hunyuan (tag de arquitectura `hy_v3`) con 30B parámetros totales de los que unos 3B se activan por token, lo que reduce el coste de inferencia frente a un denso equivalente. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni el desglose de expertos; esa información no está disponible en la documentación proporcionada.

El entrenamiento se estructura en dos etapas ejecutadas dentro de las mismas configuraciones de harness que se usan en producción. Primero, Memory On-Policy Distillation (OPD) proporciona supervisión densa de un profesor sobre cadenas de estado escritas por el propio estudiante. Después, Attributed Memory Reinforcement Learning examina los bancos de memoria resultantes, asigna crédito a nivel de fragmento (chunk-level credit) y propaga el banco seleccionado entre ventanas de rollout; las ventajas se normalizan por columna dentro de la rejilla de rollouts y el banco final con mayor suma de puntuaciones se convierte en padre de la siguiente ventana. Este diseño permite que el modelo aprenda la política de escritura de memoria de forma agnóstica al framework, lo que explica su transferencia a EverMemOS, que queda fuera del entrenamiento.

## Capacidades

- Escritura de memoria a largo plazo: decide qué información del historial merece persistir, cómo representarla y cómo actualizar entradas previas con evidencia nueva.
- Integración directa como memory writer en Mem0, MemOS y Hy-Memory, cubriendo escenarios de chat, memoria de trabajo y código.
- Memoria de repositorio y código: evaluado en Code Memory Bench (CMB), media de dos tareas de QA sobre repositorios.
- Memoria de persona y preferencias de usuario: evaluado en PersonaMem-v2.
- Memoria episódica de dominio: evaluado en Travel SPS y Shopping PS.
- Recuperación y razonamiento sobre memoria conversacional de largo recorrido: evaluado en LoCoMo y LongMemEval.
- Bilingüe inglés-chino (en, zh).
- Transferencia zero-shot a frameworks de memoria no vistos (EverMemOS).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Memoria de usuario en asistentes conversacionales: desplegado como writer de Mem0, el modelo construye el banco de memoria desde cero y decide qué turnos consolidar, con una puntuación de 59,54 en LoCoMo y 73,00 en LongMemEval dentro de ese harness.
- Memoria de trabajo en agentes multi-turno: en Hy-Memory, mantiene el estado relevante entre pasos de un agente sin arrastrar todo el historial, lo que reduce el contexto que se envía al modelo de respuesta.
- Memoria de código en asistentes de repositorio: con 70,73 en CMB sobre el harness Hy-Memory, es adecuado para asistentes que deben recordar decisiones de arquitectura, convenciones y cambios previos en un repositorio.
- Personalización persistente por usuario: con 51,54 en PersonaMem-v2, permite mantener un perfil de preferencias estable que se actualiza cuando el usuario corrige o matiza información.
- Sustitución de un LLM generalista en la capa de memoria: reemplaza a Claude Opus 5 o DeepSeek V4.1 Flash en el write path con 30B totales y ~3B activos, bajando el coste por escritura sin perder calidad media (55,49 frente a 54,62 y 53,64).
- Memoria en dominios transaccionales: los benchmarks Travel SPS (57,65) y Shopping PS (21,11) sobre Hy-Memory indican uso en asistentes de reservas y compras que deben recordar restricciones y preferencias acumuladas.
- Evaluación comparativa de frameworks de memoria: al mantener fijos el harness, el recuperador y el modelo de respuesta, sirve como writer de referencia para medir el efecto de cambios en el propio framework.
- Despliegue en producción con vLLM: la versión FP8 está pensada para servir el modelo con kernels de cuantización en FP8, reduciendo VRAM y aumentando throughput frente al modelo base.

## Benchmarks y rendimiento

Media macro por harness sobre el 20% fijo del benchmark. Cada harness promedia seis métricas con el mismo peso; la columna Avg. promedia los cuatro harnesses.

| Memory writer | Mem0 | Hy-Mem. | MemOS | EverMem. | Avg. |
|---|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 54,02 | 60,55 | 50,51 | 56,89 | 55,49 |
| Claude Opus 5 | 53,43 | 60,53 | 50,50 | 54,04 | 54,62 |
| DeepSeek V4.1 Flash | 49,73 | 60,20 | 49,17 | 55,47 | 53,64 |
| Hy3 | 45,99 | 58,06 | 50,19 | 52,30 | 51,63 |
| Qwen3.6-35B-A3B | 47,51 | 55,87 | 47,36 | 50,75 | 50,37 |
| Hy3-A3B Base | 40,20 | 50,39 | 49,05 | 50,98 | 47,66 |
| Qwen3-30B-A3B | 39,81 | 45,67 | 45,44 | 46,57 | 44,37 |

Detalle sobre el harness Mem0 (seis métricas):

| Writer | LoCoMo | LME | PM-v2 | Travel | Shop. | CMB | Avg. |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 59,54 | 73,00 | 51,62 | 54,51 | 18,33 | 67,13 | 54,02 |
| Claude Opus 5 | 69,47 | 66,00 | 53,58 | 42,98 | 17,78 | 70,74 | 53,43 |
| DeepSeek V4.1 Flash | 58,78 | 69,39 | 49,56 | 35,07 | 16,67 | 68,92 | 49,73 |
| Qwen3.6-35B-A3B | 50,00 | 69,00 | 49,38 | 36,39 | 20,00 | 60,30 | 47,51 |

Detalle sobre el harness Hy-Memory:

| Writer | LoCoMo | LME | PM-v2 | Travel | Shop. | CMB | Avg. |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 73,28 | 89,00 | 51,54 | 57,65 | 21,11 | 70,73 | 60,55 |
| Claude Opus 5 | 74,43 | 89,69 | 48,71 | 51,34 | 23,33 | 75,70 | 60,53 |
| DeepSeek V4.1 Flash | 72,90 | 85,86 | 49,00 | 53,46 | 22,78 | 77,18 | 60,20 |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) ni comparativas de la versión FP8 frente al modelo base en precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 30 GB solo para pesos en FP8 (el repositorio ocupa 30,6 GB), más caché KV y overhead del runtime. La longitud de contexto no está publicada, por lo que el pico de memoria por secuencia no se puede calcular con precisión.
- GPU recomendadas: H100 80 GB y H200 son las opciones naturales para FP8 con vLLM; A100 80 GB requiere comprobar soporte de kernels FP8 en la versión de vLLM empleada. L40S 48 GB es una alternativa de una sola tarjeta.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB por tamaño de pesos. Sería necesario tensor parallel en 2x RTX 4090 (48 GB agregados, muy justo con caché KV) o cuantización adicional a 4 bits, no publicada en la información disponible.
- Opciones de despliegue: vLLM es el runtime para el que la model card declara estar optimizado; al usar `transformers` y safetensors, también es cargable con la librería transformers. Compatibilidad con llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar ~3B parámetros por token el coste de cómputo por token es inferior al de un denso de 30B, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Avg. cross-harness | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy-Memory-30B-A3B (FP8) | 30,06B | ~3B | no disponible | Apache 2.0 | 55,49 | Pesos abiertos en HuggingFace |
| Claude Opus 5 | no disponible | no disponible | no disponible | propietaria | 54,62 | Solo API |
| DeepSeek V4.1 Flash | no disponible | no disponible | no disponible | no disponible | 53,64 | Endpoint (DeepSeek V4.1 Flash) |
| Qwen3.6-35B-A3B | 35B (segun nomenclatura) | ~3B (segun nomenclatura) | no disponible | no disponible | 50,37 | no disponible |
| Qwen3-30B-A3B | 30B (segun nomenclatura) | ~3B (segun nomenclatura) | no disponible | no disponible | 44,37 | no disponible |

La comparación relevante es de rol, no solo de tamaño: Hy-Memory compite contra LLM generalistas usados como memory writer. Su ventaja es quedar por encima de Claude Opus 5 y DeepSeek V4.1 Flash en media macro siendo un modelo abierto de 30B con ~3B activos, y su desventaja potencial es que solo se ha evaluado en la tarea de escritura de memoria.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para el write path de frameworks de memoria; no se han publicado resultados que respalden su uso como chat general, generación de código libre o razonamiento matemático.
- Idiomas: solo inglés y chino. No hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso directo en productos en español.
- Longitud de contexto no publicada: impide dimensionar caché KV y evaluar su comportamiento en historiales muy largos.
- Evaluación sobre submuestras: todos los resultados de la tabla principal se calculan sobre un 20% fijo de cada benchmark, no sobre el conjunto completo, lo que añade varianza a las diferencias de décimas entre modelos.
- Riesgo de alucinación de memoria: al decidir qué retener y cómo actualizarlo, un error de escritura se propaga a todas las respuestas posteriores que recuperen esa entrada; el benchmark mide calidad de banco, no veracidad factual de cada entrada.
- Rendimiento desigual por métrica: en Shopping PS sobre Mem0 obtiene 18,33 frente a 20,00 de Qwen3.6-35B-A3B, y en CMB sobre Hy-Memory está por debajo de DeepSeek V4.1 Flash (70,73 frente a 77,18); no es el mejor en todas las subtareas.
- Cuantización FP8: no se ha publicado en la información disponible una comparación de precisión entre esta versión y el modelo base, por lo que la pérdida de calidad inducida por la cuantización no está cuantificada.
- Dependencia del harness: los resultados están medidos con harness, prompts, configuración de recuperación y modelo de respuesta fijos; cambiar cualquiera de esos componentes puede alterar el rendimiento relativo.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y atribución; conviene revisar los términos de los frameworks de memoria de terceros con los que se integre.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o seguridad en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/Hy-Memory-30B-A3B-FP8
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-Memory
- Informe técnico (arXiv): https://arxiv.org/pdf/2610.22196
- Sitio corporativo de Tencent: https://www.tencent.com/
