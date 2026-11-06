# sparrow-co-ltd/qwen35-9b-secfix-grpo-lead-step300-merged

## Resumen

`qwen35-9b-secfix-grpo-lead-step300-merged` es un ajuste fino del modelo base Qwen/Qwen3.5-9B desarrollado por el equipo SecLLM de sparrow-co-ltd. El modelo se ha especializado en la reparación automática de vulnerabilidades de seguridad detectadas por herramientas de análisis estático (SAST), operando como un agente que lee el código fuente, aplica un parche y lo somete a verificación a través de tres herramientas (`read_code`, `edit_code`, `submit_fix`). No es un modelo de chat libre: está diseñado para ejecutarse dentro de un bucle de agente con un protocolo estricto.

El entrenamiento combina dos fases: un ajuste supervisado (SFT) sobre 2.205 trayectorias de agente generadas por un modelo profesor (deepseek-v4-flash-0731), seguido de un entrenamiento con GRPO sobre un pool de 10.390 hallazgos SAST en siete lenguajes de programación. La variante GRPO-LEAD incorpora modelado de longitud y ponderación por dificultad en la señal de recompensa. El checkpoint publicado corresponde al paso 300 de 325, con ambas fases fusionadas en los pesos completos.

El modelo mantiene la arquitectura del base (Qwen3_5ForConditionalGeneration, 9.653.104.368 parámetros) y la licencia Apache 2.0. Su relevancia radica en la aplicación de técnicas de RL con recompensa verificable al dominio de la seguridad del software, un área donde la corrección automática de parches requiere tanto precisión sintáctica como validación semántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal del base Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa max_length 12.288 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B (revision c202236235762e1c871ad0ccb60c8ee5ba337b9a) |
| Tamano del repo | 19,3 GB |
| Lenguajes de programacion | C, C++, Java, Python, JavaScript, Go, TypeScript |
| Herramientas del agente | read_code, edit_code, submit_fix |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base Qwen3.5-9B: un transformer multimodal `Qwen3_5ForConditionalGeneration` con torre de visión y cabeza MTP (multi-token prediction) intactas. El ajuste solo modifica las 128 matrices objetivo de LoRA por fase (proyecciones del modelo de lenguaje), y el resto de pesos son bit a bit idénticos al base. La fusión se calcula en fp32 como W + (alpha/r)·B@A y se almacena en bf16. El tokenizador y la plantilla de chat son copias byte a byte del base.

La fase 1 (SFT) usó LoRA con r=32, alpha=64 y dropout 0,05 sobre 2.205 trayectorias de agente (74 reservadas para validación) generadas por deepseek-v4-flash-0731 en el mismo harness de tres herramientas. Solo se conservaron las ejecuciones cuyo parche final pasaba la reverificación SAST y que no presentaban ediciones fallidas ni llamadas rechazadas; los desacuerdos se resolvieron con un juez LLM. Se entrenó 3 épocas con learning rate 1e-4, warmup del 5 %, batch efectivo de 24 y longitud máxima de 12.288 tokens, aplicando la pérdida solo a los turnos del asistente.

La fase 2 (GRPO) partió del modelo de la fase 1 y usó TRL con pérdida DAPO, learning rate constante de 1e-5 tras el warmup, penalización KL β=0,005 contra el modelo de la fase 1, 32 hallazgos por paso con 8 rollouts completos cada uno, tope de 10.240 tokens por completion y límite de 300 segundos por rollout. La recompensa híbrida combina la verificación del harness (1,0 si pasa el juez LLM, 0,5 si no) con deducciones de hasta 0,2 por fricción del harness, más el modelado de longitud y la ponderación por dificultad de GRPO-LEAD (arXiv 2504.09696). Se eliminaron del pool los hallazgos que el modelo base ya resolvía en los 8 rollouts; en el paso 300 se habían visto aproximadamente 9.600 de los 10.390 hallazgos.

## Capacidades

- Reparación de vulnerabilidades SAST: dado un hallazgo confirmado (metadatos, lenguaje, nombre del issue, riesgo, línea y descripción del checker), el agente localiza el código afectado y genera un parche.
- Lectura paginada de código fuente mediante `read_code(offset, limit)`, con salida prefijada por número de línea y presupuesto acumulado de 200 KB.
- Edición precisa con `edit_code(old_string, new_string)`, que exige coincidencia exacta en una única ubicación y preserva la indentación original.
- Envío y verificación del parche con `submit_fix(desc)`, que ejecuta un verificador determinista y devuelve PASS o FAIL, con hasta 3 intentos.
- Soporte de tool calling / function calling estructurado: cada turno del asistente contiene exactamente una llamada a herramienta.
- Razonamiento multi-paso dentro de un bucle de agente (leer, editar, verificar, reintentar).
- Cobertura de siete lenguajes de programación: C, C++, Java, Python, JavaScript, Go y TypeScript.
- Generación de descripciones de fix en coreano, limitadas a 300 caracteres por frase.
- Capacidades multimodales heredadas del base (torre de visión intacta), aunque no se documenta su uso en el flujo de reparación.

## Casos de uso

- Parcheo automático en pipelines de CI/CD: el modelo se integra tras un escaneo SAST para generar parches candidatos sobre los hallazgos confirmados, con verificación determinista antes de abrir un pull request.
- Triaje y remediación en revisiones de seguridad: dado un informe de SAST con hallazgos priorizados, el agente lee el fichero afectado y produce un parche mínimo y localizado, reduciendo el trabajo manual del equipo de AppSec.
- Corrección de vulnerabilidades en bases de código legacy: al operar sobre una copia de trabajo y hacer diff contra el original, es adecuado para repositorios grandes donde solo se toca el fragmento relevante.
- Automatización de fixes en múltiples lenguajes: la cobertura de C, C++, Java, Python, JavaScript, Go y TypeScript permite un único agente para stacks heterogéneos.
- Generación de parches asistida con validación: el ciclo `submit_fix` con hasta 3 intentos y verificador determinista encaja en flujos donde se exige que el parche pase comprobaciones automáticas antes de la revisión humana.
- Formación y evaluación de equipos de seguridad: las trayectorias del agente (lectura, edición, verificación) sirven como material didáctico o como referencia de remediación en auditorías internas.
- Investigación en RL con recompensa verificable: el modelo y su receta (SFT + GRPO-LEAD con recompensa híbrida y verificador determinista) son un caso de estudio reproducible para aplicar RL a dominios con validación objetiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa, un modelo de 9.653 millones de parámetros en bf16 requiere aproximadamente 19,3 GB solo para los pesos, a lo que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, el modelo encaja en GPUs con 24 GB o más en bf16 (por ejemplo, RTX 4090, L40S, A10G de 24 GB) y con holgura en A100 40/80 GB y H100.
- En GPU de consumo: viable en RTX 4090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB requeriría cuantización, cuyos formatos no están documentados en la información disponible.
- Opciones de despliegue: la librería declarada es `transformers`; los tags incluyen `endpoints_compatible`. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El entrenamiento impone un tope de 10.240 tokens por completion y 300 segundos por rollout, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-9b-secfix-grpo-lead-step300-merged | 9.653.104.368 | no disponible | Reparacion de vulnerabilidades SAST via agente | apache-2.0 | Hugging Face (2 descargas) |
| Qwen/Qwen3.5-9B (base) | 9.653.104.368 (mismo base) | no disponible | Proposito general, multimodal | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en reparacion de vulnerabilidades | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está diseñado para un bucle de agente con un protocolo estricto de tres herramientas; su uso como chat libre no está soportado ni documentado.
- El prompt del usuario debe contener un hallazgo SAST ya confirmado; el modelo no descubre vulnerabilidades por sí mismo.
- La descripción del fix (`desc`) debe ser una frase en coreano de 300 caracteres como máximo, lo que limita su uso en equipos no coreanohablantes sin postprocesado.
- Idiomas soportados limitados a inglés y coreano; el resto de idiomas no están cubiertos.
- Riesgo de alucinación en la localización del código o en la edición: el protocolo mitiga parcialmente este riesgo con la coincidencia exacta de `old_string` y la verificación determinista, pero no lo elimina.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El checkpoint es el paso 300 de 325, no el final del entrenamiento; puede no representar el mejor punto de la curva.
- Solo se han publicado 2 descargas y 1 like, lo que indica una validación externa muy limitada.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones independientes de seguridad de los parches generados.
- El modelo no sustituye la revisión humana: los parches deben pasar revisión de código y pruebas antes de desplegarse en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sparrow-co-ltd/qwen35-9b-secfix-grpo-lead-step300-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper GRPO-LEAD: https://arxiv.org/abs/2504.09696
