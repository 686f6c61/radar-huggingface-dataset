# sthanika-ai/Sieve-4B

## Resumen

Sieve-4B es un adaptador LoRA de decisión desarrollado por Sthānika AI sobre el modelo base Qwen/Qwen3.5-4B (revisión `851bf6e8`). A diferencia de un modelo generativo convencional, Sieve-4B no produce texto: recibe un estado (texto libre o JSON) y una o varias preguntas tipadas con opciones, y devuelve una distribución de probabilidad calibrada sobre cada opción. Está diseñado específicamente para tareas de clasificación y decisión estructurada, no para generación abierta.

Técnicamente se compone de un adaptador LoRA de rango 32 con α=64 aplicado a todas las capas lineales del backbone (atención, MLP y proyecciones de Gated DeltaNet) más una cabeza lineal de 255 vías que puntúa códigos de opción (A, B, ..., AA, ...). Soporta tres tipos de pregunta: `choice` (entre 2 y 255 opciones), `noul` (sí/no con promedio en ambos órdenes) y `score` (escala ordinal de 2 a 10 niveles). Cada tipo de pregunta tiene su propia temperatura de calibración.

La relevancia de este modelo radica en su enfoque: en lugar de pedir a un LLM que genere una respuesta y parsearla, Sieve-4B codifica el estado una sola vez y evalúa cada pregunta como una rama independiente desde esa caché, garantizando aislamiento entre preguntas y probabilidades calibradas directamente utilizables en sistemas de enrutamiento, triaje o puntuación. Con aproximadamente 10 GB de VRAM en bf16 y licencia Apache 2.0, es desplegable en hardware relativamente modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=32, α=64) sobre Qwen3.5-4B (híbrido Gated DeltaNet + atención completa) con cabeza lineal de 255 vías |
| Parametros totales | No disponible (adaptador LoRA; el backbone Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens para estado + pregunta más larga; 65.536 tokens por petición |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el adaptador se sirve en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Sieve-4B utiliza como backbone Qwen3.5-4B, un transformer híbrido que combina capas de Gated DeltaNet con capas de atención completa. Solo se emplea la parte textual del modelo base; el modelo resultante no puede generar texto. Sobre ese backbone se aplica un adaptador LoRA de rango 32 y α=64 en todas las capas lineales (atención, MLP y proyecciones de Gated DeltaNet), junto con una cabeza lineal de 255 vías inicializada a partir de las filas de salida del propio modelo base para los códigos de opción (A, B, ..., AA, ...).

El funcionamiento es el siguiente: el estado se codifica una única vez y cada pregunta se ejecuta como una rama independiente desde esa caché, de modo que las preguntas nunca se ven entre sí. Para preguntas de sí/no, se formula la pregunta con las opciones en ambos órdenes y se promedian las respuestas. Cada tipo de pregunta tiene una temperatura de calibración almacenada en `sieve_config.json`: choice 1.161, yes/no 1.440 y score 1.000. La temperatura nunca cambia la respuesta elegida, solo la calibración de las probabilidades. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Clasificación y decisión estructurada: devuelve una probabilidad calibrada para cada opción de una pregunta tipada.
- Tres tipos de pregunta: `choice` (2 a 255 opciones con claves definidas por el llamante), `noul` (sí/no, con P(yes)) y `score` (escala ordinal de 2 a 10 niveles, devuelve nivel esperado y distribución).
- Procesamiento de estado en texto libre o JSON, codificado una sola vez para múltiples preguntas.
- Aislamiento entre preguntas: cada pregunta se evalúa como rama independiente desde la caché del estado.
- Preguntas de sí/no en ambos órdenes con promedio de respuestas para reducir sesgo posicional.
- Calibración por tipo de pregunta mediante temperaturas específicas.
- No genera texto: no soporta tool calling, function calling, agentes ni razonamiento multi-paso generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el asunto y cuerpo de un ticket, clasificarlo en departamentos (facturación, técnico, etc.) con una probabilidad de confianza por departamento, útil para asignación automática en sistemas de helpdesk.
- Predicción de churn: evaluar si el cliente amenaza con cancelar (`noul`) y combinar con una escala de riesgo (`score`) para priorizar intervenciones de retención.
- Triaje de moderación de contenido: clasificar textos en categorías predefinidas con probabilidades calibradas, aprovechando la ventana de 32.768 tokens para estados largos.
- Puntuación de calidad en pipelines de datos: usar el tipo `score` para asignar niveles ordinales (por ejemplo, 1 a 5) a muestras de texto con una distribución de probabilidad asociada.
- Clasificación de documentos JSON estructurados: procesar registros con múltiples campos y responder varias preguntas tipadas sobre el mismo estado sin que se contaminen entre sí.
- Sistemas de decisión con umbral de confianza: al devolver probabilidades calibradas, permite derivar a revisión humana cuando la confianza es baja, integrándose como endpoint HTTP (`/v1/systemone`) en arquitecturas existentes.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index 0.4.1 (leaderboard, tests privados de los mantenedores) | Decision Index, Full score | 40,96 |
| Decision Index 0.3 (suite pública, 140.178 peticiones puntuadas, promedio de 37 benchmarks) | Decision Index, índice público corregido por azar | 50,06 |

Según la model card, en la suite pública 0.3 se respondieron las 140.178 peticiones puntuables sobre 43 benchmarks sin truncamiento, sin peticiones no soportadas y sin errores (índice bruto 62,10, breadth 48,32). La ejecución se realizó sobre dos GPU A100 80GB PCIe con tres procesos de servidor por GPU. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB en bf16; estados más largos requieren más memoria.
- GPU recomendadas: A100 80GB PCIe (configuración usada en la ejecución del Decision Index); no se especifican otras GPU en la información disponible.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la información disponible, aunque los ~10 GB en bf16 sugieren que podría caber en GPU con 12-16 GB de VRAM (dato no verificado por el autor).
- Opciones de despliegue: servidor HTTP propio mediante `python -m sieve.codes.server --ckpt sthanika-ai/Sieve-4B --port 8123 --name sieve-4b`, que expone un endpoint `/v1/systemone`; también ejecución en proceso con `sieve.decision_index_engine:SieveEngine`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión calibrada sobre backbone LLM).

## Limitaciones y advertencias

- El modelo no genera texto: no sirve para tareas generativas, tool calling, agentes ni razonamiento multi-paso.
- Solo soporta inglés; el rendimiento en otros idiomas no está evaluado.
- El estado más la pregunta más larga no puede superar 32.768 tokens, y la petición completa 65.536 tokens; las peticiones más largas se rechazan, nunca se truncan.
- Máximo de 255 opciones por pregunta `choice` y 10 niveles por pregunta `score`.
- Los resultados del Decision Index son declarados por el autor (`verified: false`) y uno de ellos corresponde a tests privados de los mantenedores, no reproducibles de forma independiente.
- Riesgo de alucinación no aplica en el sentido generativo, pero la calibración de probabilidades puede degradarse en dominios alejados de los datos de entrenamiento; no se detalla la composición del dataset.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B se descarga en su revisión fijada y está sujeto a su propia licencia.
- Requiere instalar dependencias desde el repositorio de GitHub (`sieve-decisions[serve]`), con versiones probadas específicas (torch 2.8.0); no hay paquete en PyPI mencionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit oficial Decision Index: https://github.com/apolinario/decision-index
