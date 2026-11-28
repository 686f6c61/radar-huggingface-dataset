# Thox-ai/ThoxOS-Kernel-0.8B

## Resumen

ThoxOS-Kernel-0.8B es un modelo de lenguaje de tipo texto, especializado en triaje de peticiones relacionadas con sistemas operativos y kernels, desarrollado por Thox-ai (THOX.ai). Se trata de un fine-tune con LoRA en precisión completa (fp-LoRA) sobre Qwen/Qwen3.5-0.8B, destilado del modelo profesor ThoxOS-Kernel-27B y fusionado con el modelo base por el propio equipo. Su función no es ejecutar acciones sobre el sistema, sino clasificar y enrutar solicitudes, realizar diagnósticos de primera línea y responder consultas sobre runbooks, escalando todo lo que exceda el triaje a modelos de mayor tamaño.

El modelo tiene 752.393.024 parámetros reales según los pesos en safetensors y se distribuye en tres cuantizaciones GGUF (Q4_K_M, Q8_0 y Q4_0) además de los pesos completos, con un tamaño de repositorio de 3,4 GB. Está pensado para ejecutarse en dispositivos de borde, concretamente en el hardware ThoxAir y en el paquete host ThoxKey, y es compatible con Ollama y llama.cpp. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia actual radica en dos factores: por un lado, ejemplifica el patrón de destilación de un modelo profesor grande hacia un estudiante de menos de mil millones de parámetros orientado a una tarea vertical concreta; por otro, la propia model card documenta una divergencia de medición entre dos evaluaciones del mismo conjunto de pesos (37/49 el 2026-11-01 y 27/49 el 2026-11-08 en una ruta normalizada), que el autor declara bajo revisión. Esa transparencia sobre la discrepancia es un dato relevante para cualquiera que evalúe el modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; etiqueta `qwen3_5_text` en Hugging Face) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0 y Q4_0; pesos completos en safetensors (fp-LoRA fusionado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF, Modelfile (Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se obtiene mediante un fine-tune con LoRA en precisión completa que se fusiona posteriormente con los pesos base. No se documentan en la información disponible ni el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia al corpus v3 de Thox-ai/thoxos-kernel-sft, descrito como un corpus de kernel humano y derivado más trazas generadas por el profesor ThoxOS-Kernel-27B. Esas trazas se admitieron únicamente tras un proceso de filtrado que incluye ejecución en sandbox para las filas de comandos y comprobaciones de factualidad para la prosa.

La innovación técnica principal no está en la arquitectura, sino en el pipeline de destilación y admisión de datos: el estudiante aprende de un profesor de 27B que ya había superado las compuertas de evaluación, y los datos sintéticos se validan antes de incorporarse. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa o atención lineal. El entrenamiento, las compuertas de evaluación y las conversiones a GGUF fueron realizados por THOX; el modelo base es de Qwen.

## Capacidades

- Generación de texto conversacional orientada a triaje de peticiones de sistema operativo y kernel.
- Clasificación y enrutamiento de solicitudes: decide si una petición corresponde a diagnóstico de primera línea, consulta de runbook o escalado a un par de mayor tamaño.
- Diagnósticos de primera línea sobre problemas de sistema, con respuestas fundamentadas en runbooks.
- Respuesta a preguntas sobre documentación operativa (runbooks) con anclaje en el corpus de entrenamiento.
- Escalado estructurado: cuando la petición excede el triaje, la deriva a ThoxMini, ThoxClip o al modelo de nivel host a través de MeshStack.
- Postura de rechazo ante acciones destructivas: la model card declara cero escapes de acción destructiva en el conjunto de sondas.
- No ejecuta acciones de sistema directamente; el modelo propone y el arnés (harness) dispone.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte de infraestructura: el modelo recibe la descripción de un incidente y la clasifica por categoría (kernel, red, almacenamiento, permisos) antes de enrutarla al equipo o al modelo adecuado, gracias a su entrenamiento específico en clasificación de peticiones de sistema.
- Primera línea de diagnóstico en dispositivos de borde: desplegado en ThoxAir o en el paquete ThoxKey, responde consultas iniciales sobre fallos del sistema sin necesidad de conectividad con un modelo mayor, con un peso en GGUF Q4_K_M de aproximadamente 529 MB.
- Asistente de runbooks para operadores: responde preguntas del tipo "¿qué pasos siguen si el servicio X no arranca?" anclándose en el corpus operativo con el que fue entrenado, reduciendo el tiempo de búsqueda en documentación.
- Enrutador dentro de una arquitectura multi-modelo: integrado como primer eslabón de una cadena en la que decide si la consulta la resuelve él mismo o debe escalarse a ThoxOS-Kernel-27B u otro par vía MeshStack, ahorrando coste computacional en las peticiones simples.
- Filtro de seguridad previo a la ejecución: al no ejecutar acciones y estar entrenado para rechazar peticiones destructivas, puede colocarse delante de un agente con permisos de shell para bloquear comandos peligrosos antes de que lleguen al arnés de ejecución.
- Despliegue en entornos con recursos muy limitados: con cuantización Q4_0 de aproximadamente 501 MB, cabe en dispositivos de borde y en GPUs de consumo para tareas de clasificación y respuesta breve en inglés.
- Prototipado de agentes de sistema operativo: sirve como estudiante barato para experimentar con pipelines de triaje antes de pasar a modelos mayores, dado que su formato GGUF y su Modelfile permiten arrancarlo con `ollama run` en minutos.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden a la compuerta interna GATE49 del autor, no a benchmarks estándar de la industria:

| Evaluacion | Resultado | Fecha | Notas |
|---|---|---|---|
| GATE49 (ejecucion original) | 37/49 | 2026-11-01 | Medición en la compuerta original del modelo |
| GATE49 (ruta normalizada) | 27/49 | 2026-11-08 | Re-medición de los pesos publicados; divergencia bajo revisión |
| Escapes de accion destructiva | 0 en el conjunto de sondas | 2026-11-01 | Declarado en la model card |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible. Tampoco se han publicado resultados de cualificación en hardware ThoxAir, según declara el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_0, 0,53 GB con Q4_K_M y 0,81 GB con Q8_0, a los que hay que sumar el espacio de contexto y el overhead del runtime.
- Pesos completos en safetensors: 1.504.827.608 bytes (unos 1,5 GB), por lo que la inferencia en precisión completa requiere del orden de 2 a 3 GB de VRAM contando caché KV.
- GPU recomendadas: cualquier GPU de consumo moderna sirve para las cuantizaciones GGUF; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con las tres cuantizaciones GGUF, incluidas GPUs de gama baja y probablemente aceleradores integrados, dado el tamaño inferior a 1 GB de los ficheros cuantizados.
- Opciones de despliegue: Ollama (hay Modelfile incluido y el modelo está publicado en el registro de Ollama), llama.cpp (`llama-cli` con los GGUF) y descarga directa de GGUF vía `hf download`. No se confirma soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOS-Kernel-0.8B | 752 M | no disponible | Apache 2.0 | Triaje de kernel/OS destilado de un profesor de 27B | Hugging Face y Ollama, público y sin gating |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo base generalista | Hugging Face |
| ThoxOS-Kernel-27B | no disponible en la informacion | no disponible | no disponible en la informacion | Profesor de nivel host para triaje de kernel/OS | Referenciado en la model card |

No se dispone en la información proporcionada de datos de rendimiento comparables entre estos modelos, ni de otras alternativas de la misma categoría (modelos de menos de mil millones de parámetros especializados en triaje de sistemas). La comparación cuantitativa de benchmarks queda, por tanto, como no disponible.

## Limitaciones y advertencias

- Divergencia de medición no resuelta: la diferencia entre 37/49 y 27/49 en GATE49 sobre los mismos pesos publicados está declarada como bajo revisión; cualquier decisión de producción debería apoyarse en una evaluación propia.
- Idioma: solo se declara inglés; no hay evidencia de comportamiento fiable en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede asumir una ventana amplia para conversaciones multi-turno largas o documentos extensos.
- Ámbito muy restringido: está entrenado para triaje de kernel y sistema operativo; fuera de ese dominio su comportamiento no está caracterizado.
- Riesgo de alucinación en respuestas de prosa: aunque el autor aplicó comprobaciones de factualidad al corpus, no se publican métricas de fidelidad en producción.
- No cualificado en hardware ThoxAir: el propio autor declara que no hay resultados de cualificación de dispositivo.
- El modelo no debe conectarse directamente a un intérprete de comandos: la propia model card insiste en que propone y el arnés dispone; usarlo como ejecutor autónomo contradice su diseño.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen3.5-0.8B, cuyos términos no se detallan en la información disponible.
- Sin datos de sesgo: no se han publicado evaluaciones de sesgo en la información disponible.
- Ausencia de soporte de tool calling confirmado: si el pipeline de producción depende de function calling, debe validarse empíricamente antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Corpus de entrenamiento referenciado: https://huggingface.co/datasets/Thox-ai/thoxos-kernel-sft
- Ejecución en Ollama: `ollama run Thox-ai/thoxos-kernel-0.8b`
- Descarga de GGUF: `hf download Thox-ai/ThoxOS-Kernel-0.8B --include "*.gguf" --local-dir ./ThoxOS-Kernel-0.8B`
