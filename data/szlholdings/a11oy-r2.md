# SZLHOLDINGS/a11oy-r2

## Resumen

a11oy-r2 es un adaptador LoRA (no un modelo completo) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un ajuste fino mediante QLoRA con rsLoRA de rango 8 y alpha 16 aplicado a las proyecciones de atención y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El autor lo describe como un "órgano de decisión gobernada" ("Flagship governed-decision organ") dentro de su arquitectura interna, con capacidad de mantener y bloquear decisiones (HOLD/BLOCK) pero sin capacidad de ejecución.

El modelo se entrenó con semilla 20260721 sobre una combinación de datasets propios: SZLHOLDINGS/szl-1-doctrine-sft, turnos verticales gobernados y filas muestreadas de a11oy-code-sft-v1. El repositorio incluye un recibo de entrenamiento (training_receipt.unsloth.json, esquema szl.training_receipt.v2) con pérdida medida y una evaluación de humo (evaluations/smoke-eval-r1.json). El autor advierte explícitamente que la finalización del entrenamiento no constituye aprobación de despliegue y que el modelo no está desplegado.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas, 0 likes, 0.0 GB de tamaño declarado y no incluye pipeline, idiomas ni datos de benchmarks públicos. La información disponible es escasa y proviene casi exclusivamente de la model card del autor, por lo que muchos parámetros técnicos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-0.8B (rsLoRA rank-8, alpha-16, target q/k/v/o_proj + gate/up/down_proj) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base Qwen3.5-0.8B tiene ~0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA; no se listan formatos de inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA; requiere el base Qwen/Qwen3.5-0.8B rev 2fc06364715b967f1860aea9cf38778875588b17) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (rsLoRA rank-8, alpha-16) inyectado en todas las proyecciones lineales del transformer base Qwen3.5-0.8B: atención (q_proj, k_proj, v_proj, o_proj) y MLP (gate_proj, up_proj, down_proj). El entrenamiento se realizó con QLoRA (cuantización del base durante el ajuste) y se documenta mediante un recibo en formato szl.training_receipt.v2 con pérdida medida (MEASURED loss), lo que indica trazabilidad del proceso. La semilla empleada fue 20260721.

El dataset de entrenamiento combina tres fuentes: SZLHOLDINGS/szl-1-doctrine-sft (datos de doctrina/instrucción propios), turnos verticales gobernados y filas muestreadas de a11oy-code-sft-v1 (datos de código). No se especifican el número de tokens, la composición exacta ni si hubo fases de RLHF/DPO. La model card describe el rol del modelo como "órgano de decisión gobernada" que puede mantener (HOLD) y bloquear (BLOCK) pero no ejecutar, lo que sugiere un uso como componente de filtrado o validación dentro de un pipeline mayor. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento básico heredados del base Qwen3.5-0.8B (no verificados de forma independiente).
- Decisión gobernada: según el autor, puede emitir estados HOLD y BLOCK; explícitamente no puede ejecutar acciones.
- Ajuste sobre datos de código (a11oy-code-sft-v1), por lo que se espera cierta competencia en tareas de programación, sin métricas publicadas.
- Ajuste sobre datos de doctrina/instrucción propios (szl-1-doctrine-sft), orientado a seguir políticas internas del autor.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (el rol declarado es de decisión, no de ejecución).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Filtrado y validación de decisiones en pipelines internos: el modelo está diseñado para emitir estados HOLD/BLOCK, por lo que encaja como componente de guardarraíl que retiene o rechaza acciones antes de que otro sistema las ejecute.
- Clasificación de cumplimiento de políticas: entrenado sobre szl-1-doctrine-sft, puede usarse para verificar si una solicitud se ajusta a una doctrina o conjunto de reglas definido por el autor.
- Enrutamiento con abstención: al poder "mantener" una decisión, sirve para derivar casos ambiguos a revisión humana en lugar de forzar una respuesta.
- Asistencia de código acotada: el ajuste con filas de a11oy-code-sft-v1 permite probarlo en sugerencias de código, aunque sin benchmarks publicados que respalden su calidad.
- Prototipado de bajo coste: al ser un adaptador LoRA sobre un base de 0.8B, puede desplegarse en hardware modesto para experimentación interna.
- Investigación sobre gobernanza de modelos: útil como caso de estudio de ajuste fino con recibos de entrenamiento medidos y evaluación de humo documentada.
- Componente de sistemas multi-modelo: puede integrarse como "órgano" especializado dentro de una arquitectura mayor donde otros modelos ejecutan y este solo decide.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo referencia una evaluación de humo (evaluations/smoke-eval-r1.json) sin cifras reproducidas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un base de ~0.8B en fp16 requiere aproximadamente 1.6 GB de pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade una cantidad marginal (rango 8 sobre 7 proyecciones).
- GPU recomendadas: no especificadas por el autor. Por tamaño del base, cualquier GPU consumer con ≥4 GB de VRAM podría alojarlo en fp16; en cuantización de 4 bits cabría en GPUs de gama baja.
- Cabe en consumer GPU: probablemente sí (RTX 3060, RTX 4060, etc.), aunque no hay confirmación oficial.
- Opciones de despliegue: el adaptador es compatible con el ecosistema Hugging Face (transformers + PEFT). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; para llama.cpp/Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/a11oy-r2 | Adaptador LoRA sobre ~0.8B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste especializado en decisión gobernada; sin benchmarks |
| Qwen/Qwen3.5-0.8B (base) | ~0.8B | No disponible en esta ficha | Según el base (no verificada) | Hugging Face | Modelo generalista del que deriva el adaptador |
| Adaptadores LoRA genéricos sobre modelos <1B | Variable | Variable | Variable | Hugging Face | Categoría amplia; sin comparación directa publicada |

No se dispone de datos de rendimiento comparativos entre a11oy-r2 y alternativas, por lo que la comparativa se limita a parámetros estructurales y licencia.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo NO está desplegado y que el despliegue está condicionado a revisión del propietario y una evaluación sustantiva.
- La evaluación incluida es solo de humo (smoke eval), no una evaluación completa; no hay benchmarks públicos.
- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar el base Qwen/Qwen3.5-0.8B en la revisión exacta indicada.
- No puede ejecutar acciones por diseño; solo emitir estados HOLD/BLOCK. Usarlo para ejecución iría contra su propósito declarado.
- Riesgo de alucinación: no evaluado; al ser un base de 0.8B, la tasa de alucinación en tareas abiertas es presumiblemente alta.
- Sesgos conocidos: no documentados; los datasets propietarios (szl-1-doctrine-sft, a11oy-code-sft-v1) no son públicos en la información disponible.
- Idiomas soportados: no especificados; probable herencia del base, sin confirmación.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe el despliegue por política interna; verificar términos del base Qwen3.5-0.8B antes de producción.
- Repositorio con 0.0 GB declarados y 0 descargas: la integridad y disponibilidad real de los pesos no están verificadas.
- Fecha de creación declarada 2026-11-26, posterior a la fecha actual de referencia; tratar con cautela cualquier dato temporal.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/a11oy-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17)
- Dataset de doctrina: SZLHOLDINGS/szl-1-doctrine-sft (referenciado en la model card; URL no proporcionada)
- Dataset de código: a11oy-code-sft-v1 (referenciado en la model card; URL no proporcionada)
- Recibo de entrenamiento: training_receipt.unsloth.json (dentro del repositorio)
- Evaluación de humo: evaluations/smoke-eval-r1.json (dentro del repositorio)
- Paper, blog, repositorio o demo adicionales: no disponibles
