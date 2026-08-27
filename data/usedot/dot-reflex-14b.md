# usedot/Dot-Reflex-14B

## Resumen

Dot Reflex 14B es un controlador de recuperación de ejecución (execution-recovery controller) desarrollado por usedot, diseñado para supervisar el bucle de ejecución de agentes de IA. No es un agente en sí mismo, sino un componente que lee un resumen compacto de la trayectoria de un agente y devuelve una de diez decisiones de control: continuar, verificar, reintentar de forma diferente, replanificar, revertir, ramificar, cambiar de modelo, preguntar a un humano, detener con éxito o detener con fallo. El modelo se publica como un adaptador QLoRA de rango 64 sobre la base Qwen/Qwen3-14B-Base, con un tamaño de repositorio de aproximadamente 1,03 GB.

La relevancia de este modelo radica en que aborda un problema crítico en sistemas multiagente: la falta de supervisión fiable durante la ejecución. En lugar de depender de que el agente trabajador sea consciente de sus propios errores, Dot Reflex actúa como un supervisor externo que puede detectar señales de fallo (como falsas finalizaciones) y emitir instrucciones de recuperación accionables. Su salida es JSON estructurado, lo que facilita la integración en orquestadores existentes. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (rank 64) sobre Qwen/Qwen3-14B-Base |
| Parametros totales | 14B (modelo base) + adaptador de ~1,03 GB (numero de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | 4-bit (runtime de referencia) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

Dot Reflex 14B es un adaptador QLoRA de rango 64 entrenado sobre Qwen3-14B-Base. La arquitectura subyacente es un transformer denso de 14B parametros, pero el adaptador añade una capa de control especifica: dado un JSON de entrada que describe la tarea, el historial de ejecucion, los resultados de herramientas, el estado actual y las señales de fallo detectadas, el modelo produce una decision de control estructurada con accion, justificacion, confianza e instrucciones de recuperacion. El entrenamiento se realizo con QLoRA (quantized Low-Rank Adaptation), lo que permite ajustar el modelo con recursos reducidos.

No se proporcionan datos sobre el conjunto de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). La documentacion indica que el modelo fue evaluado en un benchmark sintetico propio llamado Agent Recovery Bench, pero no se detalla el proceso de entrenamiento. La innovacion principal no esta en la arquitectura base, sino en el diseno de la tarea: convertir la supervision de agentes en un problema de clasificacion de decisiones con salida JSON estricta, lo que permite un fail-closed en orquestadores.

## Capacidades

- Toma de decisiones de control: devuelve una de diez acciones discretas (continue, verify, retry_differently, replan, rollback, branch, switch_model, ask_human, stop_success, stop_failure) basadas en el analisis de la trayectoria del agente.
- Salida estructurada: genera JSON con accion, rationale, confidence (0-1) y recovery_instructions, ademas de un campo parse_valid para validacion automatica.
- Deteccion de señales de fallo: identifica riesgos como falsas finalizaciones (false_completion_risk) a partir de la informacion de herramientas y estado.
- Integracion con frameworks de agentes: puede supervisar agentes construidos sobre GPT, Claude, Gemini, Qwen, Llama u otros, sin requerir que compartan arquitectura.
- Generacion determinista: el runtime de inferencia usa generacion greedy, lo que garantiza resultados reproducibles.
- Interfaz de servicio HTTP: incluye un servidor uvicorn para consultas via API REST.
- Validacion de esquema: el input debe cumplir un esquema JSON definido (trajectory.schema.json), y el proceso falla de forma segura si el esquema o la accion generada son invalidos.

## Casos de uso

- Supervision de agentes de codificacion en CI/CD: un pipeline de integracion continua puede invocar Dot Reflex tras cada commit para verificar que el agente que modifica codigo ha ejecutado pruebas antes de declarar finalizacion. Si detecta false_completion_risk, emite una accion verify con instrucciones para ejecutar la suite relevante.
- Recuperacion ante fallos en agentes de automatizacion de tareas: cuando un agente falla repetidamente en una llamada a herramienta, Dot Reflex puede recomendar retry_differently con parametros alternativos, evitando bucles infinitos.
- Orquestacion multi-modelo: en un sistema que enruta tareas entre GPT, Claude y Qwen, Dot Reflex puede decidir switch_model cuando un proveedor falla de forma persistente, mejorando la resiliencia del sistema.
- Control de calidad en generacion de informes: un agente que produce documentos puede ser supervisado para que no declare completitud sin evidencia; Dot Reflex solicita verify y proporciona instrucciones de comprobacion.
- Gestion de entornos de desarrollo aislados: cuando un cambio es regresivo, Dot Reflex recomienda rollback y el orquestador restaura un estado conocido bueno, reduciendo el tiempo de inactividad.
- Intervencion humana bajo demanda: en situaciones que requieren autoridad, secretos o decisiones externas, Dot Reflex emite ask_human con una justificacion clara, permitiendo pausas controladas en el flujo de trabajo.

## Benchmarks y rendimiento

La model card publica un resultado de un benchmark sintetico propio llamado Agent Recovery Bench, con una puntuacion del 100% en un conjunto de validacion retenido. Sin embargo, el propio autor advierte explicitamente que este resultado no debe tratarse como prueba de fiabilidad universal, ya que no se ha evaluado en SWE-bench ni en un ensayo de produccion. No se proporcionan metricas adicionales como MMLU, HumanEval o GSM8K.

| Benchmark | Resultado | Nota |
|---|---|---|
| Agent Recovery Bench (sintetico, held-out) | 100% | Advertencia del autor: no es SWE-bench ni produccion; no tratar como fiabilidad universal |

No se han publicado resultados de benchmarks en la informacion disponible mas alla del mencionado.

## Requisitos de hardware

- VRAM estimada: minimo 24 GB para una peticion simultanea; 40-48 GB para mayor margen (segun la documentacion del autor).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para uso basico; A100 40 GB o 48 GB para mayor concurrencia. Se requiere GPU NVIDIA y Linux.
- El adaptador pesa ~1,03 GB, pero el modelo base Qwen3-14B requiere varios GB adicionales en cuantizacion 4-bit.
- Opciones de despliegue: script de inferencia local (inference.py), servidor HTTP con uvicorn (serve:app), o integracion directa via Hugging Face Hub. No se mencionan vLLM, llama.cpp u Ollama en la documentacion.
- Latencia y throughput: no disponibles; la generacion es greedy y determinista, pero no se especifican tiempos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El autor menciona que Dot Reflex puede supervisar agentes de diferentes proveedores, pero no ofrece comparaciones con otros controladores de recuperacion. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- No es un agente autonomo: Dot Reflex es un controlador de recuperacion, no un sustituto del agente que realiza el trabajo. El orquestador sigue siendo responsable de la politica, permisos, ejecucion de herramientas y decisiones finales.
- Resultados de benchmark limitados: la puntuacion del 100% proviene de un benchmark sintetico propio; no hay evidencia de rendimiento en entornos reales o en SWE-bench. El autor advierte explicitamente contra interpretar este resultado como fiabilidad universal.
- Requiere adaptadores de integracion: el esquema de entrada es ligero y no es un protocolo universal; la mayoria de los harness necesitan un adaptador de eventos a trayectoria.
- Solo ingles: el modelo esta entrenado unicamente en ingles, lo que limita su uso en entornos multilingues.
- Dependencia del modelo base: el rendimiento esta condicionado por Qwen3-14B-Base; cualquier limitacion del base (sesgos, alucinaciones) puede afectar al controlador.
- Requisitos de hardware: necesita GPU NVIDIA con al menos 24 GB de VRAM, lo que excluye hardware de gama baja o entornos sin GPU.
- Seguridad en despliegue: el servidor HTTP de ejemplo se limita a localhost; exponerlo a una red requiere autenticacion, limites de peticion, registros de auditoria y TLS, segun el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/usedot/Dot-Reflex-14B
- Perfil de usedot en Hugging Face: https://huggingface.co/usedot
- Modelo relacionado (Dot-Loom-Conductor-14B): https://huggingface.co/usedot/Dot-Loom-Conductor-14B
- Repositorio de usedot en GitHub: https://github.com/usedotai?tab=repositories
- Cuenta de X (Twitter) de DOT: https://x.com/usedotia
