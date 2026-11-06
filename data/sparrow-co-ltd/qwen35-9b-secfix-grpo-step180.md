# sparrow-co-ltd/qwen35-9b-secfix-grpo-step180

## Resumen

`qwen35-9b-secfix-grpo-step180` es un adaptador LoRA entrenado por sparrow-co-ltd (equipo SecLLM) sobre el modelo base `Qwen/Qwen3.5-9B`. No es un modelo completo: se trata de un complemento de pesos de unos 222 MB en bf16 que convierte el modelo base en un agente especializado en la reparación de vulnerabilidades de seguridad en código fuente. Dado un hallazgo confirmado por análisis estático (SAST) y el fichero fuente correspondiente, el agente emite llamadas a una única herramienta (`edit_src_code`) que parchea el rango de líneas vulnerable, y finaliza emitiendo exactamente `REVIEW_APPROVED`.

El nombre sugiere que el entrenamiento empleó GRPO (Group Relative Policy Optimization, un método de aprendizaje por refuerzo) con checkpoint en el paso 180, aunque la model card no detalla el procedimiento completo. El adaptador cubre siete lenguajes de programación (C, C++, Java, Python, JavaScript, Go y TypeScript) y está diseñado exclusivamente para operar dentro de un bucle de agente con el esquema de herramientas específico descrito en su documentación; no sirve para chat general ni para detección de vulnerabilidades.

Su relevancia radica en la tendencia actual de integrar LLM en pipelines de seguridad (DevSecOps): en lugar de solo detectar fallos, este adaptador automatiza el paso de remediación con cambios mínimos, algo especialmente valioso en entornos CI/CD donde el triaje manual de hallazgos SAST es costoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-9B (transformer con torre de lenguaje y de visión) |
| Parametros totales | Base: 9B (Qwen3.5-9B) + adaptador de 222 MB en bf16 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (adaptador distribuido en bf16) |
| Idiomas soportados | Ingles (interfaz); C, C++, Java, Python, JavaScript, Go, TypeScript (codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); requiere pesos base de Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango r=32 y alpha=64, aplicado sobre todos los proyectores del modelo de lenguaje: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La torre de visión del modelo base queda deliberadamente intacta, ya que la tarea es puramente textual. El tokenizador y la plantilla de chat de Qwen3.5-9B se incluyen en el repositorio para garantizar consistencia con el entrenamiento.

El sufijo "grpo-step180" indica entrenamiento con GRPO (aprendizaje por refuerzo con comparación relativa de grupos) detenido en el paso 180, aunque la model card no publica detalles sobre dataset, número de tokens ni recompensas utilizadas. Un detalle técnico crítico: el entrenamiento asumió que los turnos del asistente se renderizan con `enable_thinking=False` (prefijo `<think>\n\n</think>\n\n`), por lo que inferir con thinking activado saca al modelo de su distribución de entrenamiento y degrada el comportamiento. Las llamadas a herramientas se renderizan en el formato XML de Qwen (`<function=...><parameter=...>`), no en JSON.

## Capacidades

- Reparación de vulnerabilidades confirmadas por SAST: genera parches dirigidos al rango de líneas vulnerable, con política de cambio mínimo (sin refactorización ni preámbulos).
- Uso de herramientas (tool calling): conoce exclusivamente la herramienta `edit_src_code`, con parámetros `startLine`, `endLine`, `newString` y `desc`.
- Operación como agente multi-paso: puede emitir varias ediciones secuenciales, recibir el fichero actualizado como mensaje `tool` y continuar hasta terminar con `REVIEW_APPROVED`.
- Cobertura multilenguaje en código: C, C++, Java, Python, JavaScript, Go y TypeScript.
- Integración con plantilla de chat de Qwen3.5 y con servidores compatibles con la API de OpenAI (vLLM con parser de tool calls `qwen3_coder`).

Fuera de alcance: detección de vulnerabilidades (el hallazgo se asume confirmado aguas arriba), asistencia general de código, chat libre y cualquier uso sin el harness de agente y el esquema de herramientas descritos.

## Casos de uso

- Remediación automatizada en pipelines CI/CD: integrado tras el escáner SAST, el agente recibe cada hallazgo confirmado con metadatos (checker id, nombre del issue, líneas) y propone el parche automáticamente, reduciendo el triaje manual.
- Asistente de triaje de seguridad: el equipo de seguridad revisa las ediciones propuestas por el agente (cada una con descripción `desc`) en lugar de escribir los parches desde cero.
- Corrección masiva de deuda técnica de seguridad: procesamiento por lotes de cientos de hallazgos homogéneos (por ejemplo, inyecciones SQL o uso de APIs inseguras) en repositorios grandes.
- Integración con herramientas de revisión de código: el harness puede abrir pull requests con los cambios aplicados por el agente para revisión humana.
- Entornos multilenguaje: organizaciones con microservicios en Java, Go y Python pueden usar el mismo adaptador para los siete lenguajes cubiertos.
- Investigación en agentes de reparación automática de software (APR): el protocolo de agente de una sola herramienta y terminación explícita facilita la evaluación reproducible y la comparación de checkpoints.
- Despliegue en producción con vLLM: el subdirectorio `vllm/` permite servir el adaptador con LoRA dinámica sobre una única instancia del modelo base compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card tampoco incluye métricas de recompensa del entrenamiento GRPO ni tasas de éxito en reparación de vulnerabilidades.

## Requisitos de hardware

- VRAM estimada: la del modelo base Qwen3.5-9B en bf16, aproximadamente 18-20 GB, más unos 0,5 GB adicionales para el adaptador. No hay datos oficiales publicados.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 5090 debería ser suficiente para inferencia en bf16; para servir con vLLM con margen de contexto largo, A100 40 GB, A100 80 GB o H100 son opciones seguras.
- Consumer GPUs: viable en una RTX 4090 en bf16; con cuantización del modelo base (no distribuida oficialmente en este repo) podría caber en GPUs de 12-16 GB, aunque no hay pesos cuantizados disponibles.
- Despliegue: Transformers + PEFT (código de ejemplo en la model card) y vLLM 0.27.x con `--enable-lora --max-lora-rank 32`, cargando obligatoriamente el subdirectorio `vllm/` (el adaptador de la raíz tiene claves incompatibles con vLLM y se aplicaría de forma silenciosa e inerte). No se menciona soporte para llama.cpp, Ollama o TGI.
- Verificación: la model card recomienda comparar logprobs de una generación contra el modelo base en el mismo prompt; si son idénticos, el adaptador no se está aplicando.
- Parámetros de generación sugeridos: `do_sample=False`, `max_new_tokens=4096`, `enable_thinking=False` en la plantilla de chat (obligatorio).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| qwen35-9b-secfix-grpo-step180 | Adaptador LoRA sobre Qwen3.5-9B | 222 MB de adaptador (base 9B) | Reparacion de vulnerabilidades como agente | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | Modelo completo | 9B | Uso general (texto, codigo, vision) | Apache 2.0 |
| Alternativas especializadas en APR/seguridad | no disponible | no disponible | no disponible | no disponible |

No hay modelos comparables publicados en la informacion disponible; el nicho de agentes LoRA especializados en remediación SAST es muy específico y la model card no referencia trabajos similares.

## Limitaciones y advertencias

- Tarea extremadamente estrecha: el adaptador solo funciona con el protocolo de agente de una sola herramienta descrito. No es útil para chat, asistencia general de código ni detección de vulnerabilidades.
- Requiere harness obligatorio: fuera del bucle agente con el esquema `edit_src_code`, el comportamiento es impredecible.
- `enable_thinking=False` es obligatorio: renderizar los prompts con thinking activado saca al modelo de distribución y degrada el rendimiento.
- Formato de tool calls no estándar: las llamadas se renderizan como XML de Qwen, no JSON; al reconstruir el historial, los argumentos deben pasarse como dict (un string JSON se doble-codifica).
- Incompatibilidad silenciosa con vLLM: cargar el adaptador de la raíz del repo en vLLM no produce error pero no aplica ningún módulo; hay que usar el subdirectorio `vllm/` y verificar la activación comparando logprobs.
- Riesgo de alucinación en parches: no hay datos publicados de tasa de éxito ni de regresiones introducidas; toda edición debe pasar revisión humana y tests automatizados antes de fusionarse.
- Sesgos: no documentados; al ser un modelo de código entrenado con RL, puede heredar sesgos del modelo base Qwen3.5-9B.
- Idioma: la interfaz del agente está entrenada en inglés; no hay datos sobre comportamiento con prompts en otros idiomas.
- Estadísticas de adopción muy bajas (17 descargas, 1 like en el momento de la ficha), lo que sugiere que es un artefacto experimental sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sparrow-co-ltd/qwen35-9b-secfix-grpo-step180
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Organización del autor: no disponible (no se ha encontrado URL de sparrow-co-ltd en la informacion proporcionada)
- Paper, blog o demo: no disponible
