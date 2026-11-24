# SZLHOLDINGS/a11oy-r1

## Resumen

a11oy-r1 es un adaptador LoRA (rsLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un ajuste fino orientado a un rol muy concreto que el autor denomina "organo de decision gobernada": el modelo puede emitir decisiones del tipo HOLD (retener) o BLOCK (bloquear), pero por diseno no puede ejecutar acciones. El entrenamiento se realizo con QLoRA sobre las proyecciones de atencion (q, k, v, o) y del MLP (gate, up, down), con rango 8 y alpha 16.

La relevancia de esta publicacion es limitada y muy especifica: no es un modelo generalista, sino un componente de un sistema mayor de gobernanza de decisiones. El repositorio tiene 0 GB de tamano declarado, 0 descargas y 0 likes en el momento de la consulta, y la model card advierte explicitamente que el modelo no esta desplegado y que la finalizacion del entrenamiento no equivale a aprobacion para produccion.

Conviene subrayar que la informacion disponible es escasa: no hay pipeline declarado, no se listan idiomas soportados y no se publican resultados de benchmarks en la model card, solo una referencia a un smoke eval. El modelo hereda las caracteristicas del base Qwen3.5-0.8B, pero los datos concretos de arquitectura y contexto del base no se detallan en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (base de 0.8B; el adaptador anade un numero no especificado de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA; no se detallan formatos de inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador rsLoRA de rango 8 y alpha 16 aplicado sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj del modelo base Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17). El entrenamiento se realizo con QLoRA, es decir, cuantizando el base y entrenando el adaptador en precision reducida. La semilla utilizada fue 20260721.

El dataset combina SZLHOLDINGS/szl-1-doctrine-sft, turnos verticales gobernados y filas muestreadas de a11oy-code-sft-v1. El autor describe el resultado como un "chaski-mirror base class" con capacidad de emitir HOLD y BLOCK pero sin capacidad de ejecutar. Se incluye un recibo de entrenamiento (training_receipt.unsloth.json, esquema szl.training_receipt.v2) con perdida medida, y un smoke eval en evaluations/smoke-eval-r1.json. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla de las fuentes citadas.

## Capacidades

- Emision de decisiones de gobernanza del tipo HOLD (retener) y BLOCK (bloquear).
- Razonamiento acotado al rol de "organo de decision gobernada"; no ejecuta acciones.
- Ajuste fino sobre proyecciones de atencion y MLP, lo que permite adaptar el comportamiento del base sin reentrenarlo por completo.
- Capacidades generales heredadas del base Qwen3.5-0.8B (no detalladas en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseno restringe la ejecucion.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Capa de gobernanza en pipelines de decision automatizada: el modelo se situaria como un filtro previo que emite HOLD o BLOCK sobre acciones propuestas por otros componentes, impidiendo que se ejecuten sin revision. Es adecuado por su diseno explicito de no ejecucion.
- Moderacion de acciones en sistemas multi-agente: integrado como arbitro que retiene o bloquea pasos de un agente antes de que lleguen a un ejecutor.
- Auditoria de decisiones: generar una salida estructurada de retencion o bloqueo que sirva como registro en un flujo de compliance.
- Prototipado de sistemas de "human-in-the-loop": el modelo marca casos que requieren revision humana mediante HOLD, reduciendo la carga de revision manual.
- Investigacion sobre alineamiento y gobernanza: servir como banco de pruebas de un adaptador de bajo coste (0.8B) para estudiar comportamientos de retencion y bloqueo.
- Filtro de seguridad en entornos de CI/CD: bloquear cambios o despliegues que no cumplan criterios definidos, con validacion posterior por el propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia un smoke eval (evaluations/smoke-eval-r1.json) sin cifras reproducidas en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al partir de un base de 0.8B, la inferencia en precision completa o cuantizada seria ligera, pero no se detallan formatos ni cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable dado el tamano del base (0.8B), pero no confirmado en la informacion.
- Opciones de despliegue: no disponible; el adaptador esta en safetensors y requeriria cargarse junto al base Qwen3.5-0.8B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| a11oy-r1 | Adaptador sobre base 0.8B | No disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen3.5-0.8B (base) | 0.8B | No disponible | No disponible | Hugging Face |
| Alternativas de gobernanza/seguridad | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo no puede ejecutar acciones por diseno; solo emite HOLD o BLOCK. No debe usarse como ejecutor.
- La model card advierte que la finalizacion del entrenamiento no equivale a aprobacion de despliegue y que el modelo no esta desplegado.
- No se publican benchmarks sustantivos, solo un smoke eval; el rendimiento real no esta validado.
- No se detallan idiomas soportados, sesgos conocidos ni riesgos de alucinacion especificos.
- El repositorio declara 0 GB de tamano y 0 descargas, lo que sugiere una publicacion muy reciente o incompleta; verificar la integridad de los pesos antes de usarlos.
- Licencia Apache-2.0 permite uso comercial, pero el autor impone una puerta de revision del propietario para el despliegue.
- Al ser un adaptador, requiere cargar el base Qwen3.5-0.8B en la revision indicada para funcionar correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/a11oy-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset citado: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Dataset citado: a11oy-code-sft-v1 (no se proporciona URL directa)
- Recibo de entrenamiento: training_receipt.unsloth.json (referenciado en la model card, no enlazado)
- Smoke eval: evaluations/smoke-eval-r1.json (referenciado en la model card, no enlazado)
