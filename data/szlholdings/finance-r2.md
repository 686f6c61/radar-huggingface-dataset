# SZLHOLDINGS/finance-r2

## Resumen

finance-r2 es un adaptador LoRA (en concreto, rsLoRA de rango 8) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B, en su revision `2fc06364715b967f1860aea9cf38778875588b17`. El modelo se presenta como el resultado de una ejecucion de ajuste fino con QLoRA orientada al dominio financiero ("Finance lane"), entrenada sobre el dataset propio `SZLHOLDINGS/szl-1-doctrine-sft` combinado con turnos verticales gobernados. No es un modelo de pesos completos: es un adaptador que requiere cargar el modelo base Qwen3.5-0.8B para funcionar.

El modelo es relevante como ejemplo de ajuste fino reproducible y auditable: incluye un recibo de entrenamiento (`training_receipt.unsloth.json`, esquema `szl.training_receipt.v2`) con perdida medida y una evaluacion de humo (`evaluations/smoke-eval-r1.json`). La model card declara explicitamente que la finalizacion del entrenamiento no equivale a aprobacion de despliegue y que el modelo no esta desplegado. La informacion publica disponible es muy escasa: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, y no se publican especificaciones de contexto, idiomas ni benchmarks mas alla de la evaluacion de humo citada.

Por tanto, esta ficha debe leerse con cautela: muchos campos tecnicos no estan disponibles en la informacion proporcionada y se indican como tal. La licencia es Apache 2.0, lo que permite uso comercial del adaptador, aunque el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador rango 8; el modelo base Qwen3.5-0.8B tiene ~0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA; no se listan formatos de cuantizacion del adaptador) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena con rsLoRA de rango 8 y alpha 16 sobre las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de MLP (`gate_proj`, `up_proj`, `down_proj`) del modelo base Qwen3.5-0.8B. Se trata, por tanto, de un ajuste fino de superficie completa sobre atencion y MLP, no de un adaptador limitado a las capas de atencion. El entrenamiento usa QLoRA (cuantizacion del modelo base durante el ajuste) y la semilla 20260721. El dataset combina `SZLHOLDINGS/szl-1-doctrine-sft` con "turnos verticales gobernados" del dominio financiero.

La model card menciona una restriccion de comportamiento explicita: "UNKNOWN over invented numbers", es decir, se pretende que el modelo responda con incertidumbre en lugar de inventar cifras. El repositorio incluye un recibo de entrenamiento con perdida medida (`training_receipt.unsloth.json`, esquema `szl.training_receipt.v2`) y una evaluacion de humo (`evaluations/smoke-eval-r1.json`). No se detallan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y ajuste al dominio financiero, segun la descripcion del autor ("Finance lane").
- Comportamiento orientado a la abstencion ante cifras desconocidas ("UNKNOWN over invented numbers"), segun la model card.
- Herencia de las capacidades del modelo base Qwen3.5-0.8B (no detalladas en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion.

## Casos de uso

- Clasificacion y extraccion de entidades en documentos financieros: el adaptador se ha ajustado sobre turnos del dominio financiero, por lo que puede emplearse para etiquetar partidas, importes y conceptos en informes, con la cautela de que no se han publicado metricas de calidad mas alla de la evaluacion de humo.
- Respuestas con abstencion controlada ante datos ausentes: el comportamiento declarado "UNKNOWN over invented numbers" lo hace adecuado para asistentes internos que deban evitar inventar cifras, siempre que se valide con una evaluacion sustantiva antes de produccion.
- Prototipado rapido de asistentes financieros: al ser un adaptador de rango 8 sobre un modelo de ~0.8B, el coste de inferencia y de almacenamiento es bajo, lo que permite iterar en entornos de desarrollo con recursos limitados.
- Investigacion sobre ajuste fino reproducible: el recibo de entrenamiento y la evaluacion de humo incluidos permiten auditar el proceso y reproducir la ejecucion con la semilla indicada.
- Filtrado y normalizacion de texto financiero en pipelines: el adaptador puede integrarse como paso de preprocesado para normalizar terminologia o descartar respuestas con cifras no verificadas.
- Evaluacion comparativa de tecnicas QLoRA/rsLoRA: sirve como caso de estudio de ajuste de superficie completa (atencion + MLP) con rango 8 sobre un modelo pequeno, util para comparar con otras configuraciones de LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita unicamente una evaluacion de humo (`evaluations/smoke-eval-r1.json`) sin cifras publicadas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre un modelo base de ~0.8B, la huella es la del modelo base mas el adaptador (muy reducida, del orden de pocos GB en cuantizacion de 4-8 bits, aunque no se confirma en la informacion).
- GPU recomendadas: no disponible; por el tamano del modelo base, cabria esperar GPUs consumer, pero no se confirma.
- Compatibilidad con GPU consumer: probable por el tamano del modelo base, no confirmada en la informacion.
- Opciones de despliegue: no disponible; el recibo menciona Unsloth para el entrenamiento, pero no se documenta el stack de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- La model card declara explicitamente que el modelo no esta desplegado y que el despliegue esta condicionado a revision del propietario y a una evaluacion sustantiva.
- No se han publicado benchmarks ni metricas de calidad mas alla de una evaluacion de humo; el rendimiento real en tareas financieras es desconocido.
- Riesgo de alucinacion: aunque el autor declara un comportamiento de abstencion ("UNKNOWN over invented numbers"), no hay evidencia publicada de su eficacia.
- Sesgos conocidos: no disponible; no se documentan sesgos del adaptador ni del modelo base.
- Limitaciones de contexto e idioma: no disponible; no se especifican la ventana de contexto efectiva ni los idiomas soportados.
- Licencia: el adaptador es Apache 2.0, pero el uso comercial requiere verificar por separado la licencia del modelo base Qwen/Qwen3.5-0.8B.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar publicados o no ser accesibles en el momento de la consulta; conviene verificar la disponibilidad real de los ficheros.
- No se documenta el stack de inferencia ni el formato de cuantizacion del adaptador, lo que complica su integracion directa en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/finance-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Recibo de entrenamiento: `training_receipt.unsloth.json` (referenciado en la model card, no enlazado)
- Evaluacion de humo: `evaluations/smoke-eval-r1.json` (referenciado en la model card, no enlazado)
