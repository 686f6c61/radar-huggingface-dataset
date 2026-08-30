# uuugi/gclm-constrained-decoding

## Resumen

GCLM (Goal-Conditioned Reachability Logit Masker) es un componente de software, no un modelo de lenguaje, que actúa como `LogitsProcessor` compatible con la librería `transformers` de Hugging Face. Desarrollado por el usuario uuugi, resuelve un problema crítico en la generación estructurada: cuando un LLM debe producir una salida que cumpla una gramática estricta (JSON, código, tool calls) dentro de un presupuesto de tokens fijo, los métodos de enmascaramiento DFA hacia adelante (como Outlines o SGLang) pueden llevar al modelo a estados válidos que resultan ser callejones sin salida, o dejar la sintaxis truncada al agotarse el presupuesto. GCLM precomputa una tabla de alcanzabilidad mediante BFS hacia atrás sobre el FSM y, en tiempo de decodificación, enmascara con `-inf` cualquier token cuya rama no pueda alcanzar un estado objetivo dentro de los `T_rem` tokens restantes. Esto garantiza matemáticamente que el LLM llegue a un estado de aceptación, eliminando dead-ends y truncamientos. Su relevancia actual radica en la creciente demanda de salidas estructuradas fiables en producción, especialmente en agentes, tool calling y pipelines de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (componente de software: enmascarador de logits basado en FSM/DFA) |
| Parametros totales | No aplica (no contiene pesos de red neuronal) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del LLM subyacente sobre el que se aplica) |
| Tipos de cuantizacion | No aplica (el componente no tiene pesos; puede usarse con cualquier LLM cuantizado o no) |
| Idiomas soportados | No disponible (independiente del idioma; depende del tokenizador y LLM subyacente) |
| Licencia | MIT |
| Formato de pesos | No aplica (código fuente Python, sin pesos) |

## Arquitectura y entrenamiento

GCLM no es un modelo entrenado; es un algoritmo de enmascaramiento de logits que se integra en el bucle de decodificación de cualquier LLM de Hugging Face. Su arquitectura interna consta de tres módulos: un constructor de FSM (`fsm_builder.py`) que convierte una gramática o patrón en un tensor de transiciones y calcula una tabla de alcanzabilidad `R` de forma `(T_max + 1, |S|)` mediante BFS hacia atrás vectorizado; un procesador de logits (`logit_processor.py`) que implementa el enmascaramiento en tiempo de decodificación; y un compilador (`compiler.py`) que traduce patrones o gramáticas a un FSM compatible con el tokenizador. La formulación matemática parte de `R[0, s] = 1` para estados objetivo y propaga hacia atrás: `R[t, s] = R[t-1, s] OR (∃v ∈ V tal que δ(s,v) ≥ 0 y R[t-1, δ(s,v)] = 1)`. En cada paso de decodificación con presupuesto restante `T_rem`, se valida un token `v` solo si `δ(s_curr, v) ≥ 0` y `R[min(T_rem - 1, T_max), clamp(δ(s_curr, v), 0)] = 1`. El coste por token es estrictamente O(1) gracias a operaciones vectorizadas de PyTorch, con un overhead medido inferior a 0.1 ms.

## Capacidades

- Enmascaramiento de logits con garantía de alcanzar un estado objetivo dentro de un presupuesto de tokens fijo `T_max`.
- Prevención de dead-end traps: cualquier rama que no pueda llegar al objetivo en el tiempo restante se enmascara antes de entrar en ella.
- Cierre forzado de sintaxis: cuando el presupuesto se agota, el modelo se ve obligado a producir tokens de cierre (por ejemplo, `}` en JSON) en lugar de dejar la salida truncada.
- Compatible con cualquier LLM de Hugging Face `transformers` mediante la interfaz `LogitsProcessor`.
- Soporte de gramáticas y patrones definidos como FSM/DFA, incluyendo expresiones regulares y esquemas JSON.
- Procesamiento por lotes (batch) según los tests incluidos.
- Independencia del idioma: el enmascaramiento opera sobre tokens, no sobre texto.

## Casos de uso

- Generación de JSON válido con presupuesto de tokens estricto: en APIs de baja latencia donde el límite de tokens de salida es pequeño, GCLM garantiza que el JSON resultante sea siempre parseable, incluso si el modelo no puede completar todos los campos (fuerza un cierre seguro `{}`).
- Tool calling / function calling multi-paso: en agentes que deben emitir una secuencia de llamadas a herramientas con argumentos JSON, GCLM asegura que cada llamada se cierre correctamente y que la secuencia complete el número máximo de acciones antes de agotar el presupuesto.
- Generación de código con sintaxis cerrada: para generar expresiones, bloques o estructuras con llaves, paréntesis o corchetes, el enmascaramiento evita que el LLM deje construcciones sin cerrar.
- Extracción de entidades con formato regex: cuando se necesita que la salida coincida exactamente con un patrón (fechas, códigos, identificadores), GCLM fuerza la coincidencia dentro de un número fijo de tokens.
- Agentes con razonamiento de pasos limitado: en escenarios donde el agente debe emitir una cadena de pensamiento o pasos de acción con un máximo de tokens, GCLM garantiza que el agente llegue a un estado final válido en lugar de cortarse a mitad de un paso.
- Pipelines de producción que requieren salidas estructuradas 100% válidas: para integraciones en CI/CD, bases de datos o APIs donde un fallo de parseo provoca errores costosos, GCLM elimina la probabilidad de sintaxis rota.

## Benchmarks y rendimiento

Los benchmarks incluidos en la model card muestran resultados con el LLM real `Qwen2.5-0.5B` generando JSON bajo límites estrictos de tokens, comparados con muestreo vanilla y enmascaramiento DFA hacia adelante (estilo Outlines).

**Experimento 1: LLM real end-to-end (Qwen2.5-0.5B)**

| Token Budget (T_max) | Vanilla Sampling | Forward DFA (Outlines Style) | GCLM | Latencia / muestra (GCLM) |
|---|---|---|---|---|
| T_max = 6 tokens | 0.0% | 30.0% | 100.0% | 615.90 ms |
| T_max = 10 tokens | 0.0% | 70.0% | 100.0% | 1,086.02 ms |
| T_max = 16 tokens | 0.0% | 85.0% | 100.0% | 992.39 ms |

**Experimento 2: Parsing de esquema JSON estricto (500 pruebas por presupuesto)**

| Budget (T_max) | Vanilla | Forward DFA (Outlines Style) | GCLM | Observación |
|---|---|---|---|---|
| T_max = 4 | 2.4% | 55.4% | 100.0% | Fuerza cierre seguro `{}` cuando los campos no pueden completarse |
| T_max = 6 | 2.4% | 45.6% | 100.0% | Poda rutas de objetos anidados profundos |
| T_max = 8 | 2.2% | 65.2% | 100.0% | Elimina comas colgantes |
| T_max = 16 | 1.4% | 9 (dato incompleto en la model card) | 100.0% | - |

El overhead por token del enmascarador es inferior a 0.1 ms, medido en el benchmark de latencia (`latency_bench.py`). No se han publicado resultados en benchmarks estándar como MMLU o HumanEval porque no es un modelo de lenguaje.

## Requisitos de hardware

Al ser un componente de software, no tiene requisitos de hardware propios. Los requisitos dependen del LLM subyacente sobre el que se aplique el enmascarador.

- Overhead computacional: inferior a 0.1 ms por token en operaciones vectorizadas de PyTorch, despreciable frente al coste del LLM.
- Puede ejecutarse en CPU o GPU; el enmascaramiento no requiere GPU, pero el LLM subyacente sí.
- Compatible con cualquier GPU que soporte PyTorch 2.0+ (por ejemplo, RTX 3090, RTX 4090, A100, H100) si se usa con un LLM de tamaños medios.
- Se integra con el pipeline estándar de `transformers` y es compatible con `vLLM`, `TGI` u otros backends solo si exponen la interfaz `LogitsProcessor` de Hugging Face (verificar compatibilidad).
- Para LLMs de 0.5B como el usado en los benchmarks, una GPU de consumo (RTX 3060 o superior) es suficiente.

## Comparativa con modelos similares

GCLM se compara directamente con métodos de enmascaramiento DFA hacia adelante como los implementados en Outlines y SGLang. La siguiente tabla resume las diferencias clave:

| Caracteristica | Forward DFA (Outlines/SGLang) | GCLM |
|---|---|---|
| Base del enmascaramiento | Validez de transición desde el estado actual (`s_curr -> s'`) | Alcanzabilidad hacia atrás con límite de tiempo (`s_curr -> s' ->* S_goal` en ≤ T_rem - 1 pasos) |
| Dead-end traps | Puede entrar en ramas válidas que llevan a callejones sin salida | Enmascara preventivamente antes de entrar |
| Exceso de presupuesto de tokens | Salida truncada o sintaxis rota | Fuerza cierre temprano de sintaxis |
| Overhead por token | O(1) lookup de tabla | O(1) vectorizado (< 0.1 ms) |
| Dependencia del número de estados | Escala con transiciones activas | Independiente del número de estados (S) |

No se dispone de comparativas directas con otros componentes de enmascaramiento alternativos (como `grammar-sampling` de llama.cpp) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí mismo; requiere un LLM subyacente de Hugging Face `transformers`.
- Requiere definir correctamente el FSM o gramática que describe el formato deseado; una especificación incorrecta produce salidas no deseadas.
- El rendimiento en términos de calidad del texto depende completamente del LLM subyacente; GCLM solo garantiza el formato, no la corrección semántica.
- Los benchmarks publicados se limitan a un LLM pequeño (Qwen2.5-0.5B) y a tareas de generación de JSON; no hay evidencia de rendimiento con modelos grandes o tareas más complejas.
- El presupuesto `T_max` debe ser elegido cuidadosamente: si es demasiado pequeño, el modelo se verá forzado a cerrar la sintaxis sin completar el contenido, produciendo salidas vacías o incompletas.
- La compatibilidad con backends distintos de `transformers` (por ejemplo, `vLLM`, `TGI`) no está documentada explícitamente; puede requerir adaptación.
- No se han realizado evaluaciones de sesgos, alucinación o seguridad del componente, aunque al no ser un modelo generativo, estos riesgos recaen en el LLM subyacente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/uuugi/gclm-constrained-decoding
- Repositorio GitHub: https://github.com/uuuugi/Goal-Conditioned-Reachability-Logit-Masker
- Paper (PDF, dentro del repositorio GitHub): `paper.pdf`
- Documentación de referencia sobre constrained decoding (contexto general): https://arxiv.org/abs/2403.06988
