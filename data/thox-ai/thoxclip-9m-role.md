# Thox-ai/ThoxClip-9M-role

## Resumen

ThoxClip-9M-role es un modelo de lenguaje de 8.917.248 parámetros desarrollado por THOX.ai, concebido como el modelo de rol de dispositivo ("device-role model") de la persona ThoxClip. Se trata de un ajuste fino del modelo base Thox-ai/ThoxMicro-1bit-9M, que a su vez fue entrenado desde cero sin modelo base externo, sobre un corpus propio de rol de ThoxClip. El modelo está diseñado para ejecutarse en el teléfono o host emparejado con el dispositivo ThoxClip, no en el propio clip, y su función es gestionar comandos locales, responder sobre su propia identidad y delegar cualquier otra petición en lugar de inventar respuestas.

Técnicamente es un modelo BitNet b1.58 de pesos ternarios, con el 76,4% de los pesos en el conjunto {-1, 0, +1}, lo que lo sitúa en la categoría de modelos de 1 bit entrenados nativamente para inferencia eficiente en el borde. Se distribuye exclusivamente en formato GGUF con cuantización TQ1_0 (5.933.152 bytes) y como artefacto de runtime de dispositivo TERN1 (4.420.028 bytes), bajo licencia Apache 2.0. Su relevancia actual radica en el interés creciente por modelos ternarios ejecutables en hardware de consumo y dispositivos empotrados, aunque su alcance funcional es deliberadamente muy estrecho.

El modelo es de acceso público, con 113 descargas y 1 like en Hugging Face en el momento de la consulta, y está etiquetado para uso con llama.cpp, no siendo compatible con Ollama ni LM Studio por el formato ternario del GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet b1.58); detalles de capas y dimensiones no disponibles |
| Parametros totales | 8.917.248 (aproximadamente 9M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | TQ1_0 (GGUF ternario); artefacto TERN1 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (TQ1_0) y TERN1; no se distribuyen safetensors |

## Arquitectura y entrenamiento

ThoxClip-9M-role es un ajuste fino del modelo ThoxMicro-1bit-9M, un modelo THOX entrenado desde cero (sin modelo base externo) con arquitectura de pesos ternarios BitNet b1.58. En este esquema, el 76,4% de los pesos toman valores en {-1, 0, +1}, lo que permite sustituir las multiplicaciones de matrices por sumas y reducir drásticamente el coste computacional y de memoria en inferencia. La model card no detalla el número de capas, la dimensión del modelo, el número de cabezas de atención ni la longitud de contexto.

El ajuste fino se realizó sobre el corpus de rol propio de ThoxClip, orientado a conversación de persona de dispositivo. La model card indica que el entrenamiento incluyó TinyStories, distribuido bajo CDLA-Sharing-1.0, licencia que gobierna el dataset y no el modelo. No se documenta el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica ninguna innovación adicional más allá del propio esquema ternario.

## Capacidades

- Generación de texto conversacional limitada al rol de dispositivo ThoxClip.
- Ejecución de comandos locales en el host emparejado.
- Respuesta sobre su propia identidad cuando se le pregunta directamente.
- Delegación explícita de peticiones fuera de su rol, en lugar de generar respuestas inventadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para delegar, no para razonar en varios pasos.
- Capacidades multilingües: limitadas al inglés; el rendimiento en otros idiomas es inferior según la propia model card.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Conversación de persona de dispositivo en el host emparejado: el modelo gestiona diálogos breves sobre el estado, la identidad y las funciones del dispositivo ThoxClip, respondiendo con el registro definido en su corpus de rol.
- Ejecución de comandos locales: interpreta y ejecuta instrucciones locales en el teléfono o host, aprovechando su tamaño de 9M para una latencia mínima y sin dependencia de red.
- Respuesta de identidad: cuando el usuario pregunta qué dispositivo es o qué puede hacer, el modelo responde a partir de su corpus de rol en lugar de improvisar.
- Delegación controlada: ante peticiones médicas, legales, financieras o de seguridad, el modelo deriva la consulta a un sistema superior o a revisión humana, lo que lo hace adecuado como capa de filtrado previo.
- Prototipado de asistentes de borde: sirve como banco de pruebas para pipelines de modelos ternarios en llama.cpp, validando el flujo de descarga, carga y generación con TQ1_0 antes de escalar a modelos mayores.
- Investigación en modelos de 1 bit: su tamaño reducido y su naturaleza ternaria lo hacen útil para estudiar el comportamiento de BitNet b1.58 en tareas de rol y para experimentos de destilación o ajuste fino sobre arquitecturas ternarias.
- Integración en firmware o sistemas empotrados: el artefacto TERN1 de 4,4 MB permite evaluar su inclusión en runtimes de dispositivo con restricciones severas de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se publica ningún resultado de THOX GATE49 para este modelo y que el rendimiento en hardware objetivo no se ha medido, por lo que no se reclama ninguna cifra de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en el formato GGUF TQ1_0 (5,9 MB de pesos), con overhead de runtime mínimo; el artefacto TERN1 ocupa 4,4 MB.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y hardware de borde. Cualquier GPU consumer moderna (GTX 1050, RTX 3060, RTX 4090) puede ejecutarlo, pero el cuello de botella será el runtime, no la GPU.
- Cabe en cualquier GPU consumer y en la mayoría de SoCs móviles; también en CPU sin aceleración.
- Opciones de despliegue: llama.cpp mediante `llama-cli` con el fichero GGUF TQ1_0; runtime TERN1 para dispositivo. Ollama y LM Studio no pueden cargar GGUF ternarios según la model card.
- Latencia y throughput: no disponibles; la model card declara que el rendimiento en hardware objetivo no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxClip-9M-role | 8,9M | No disponible | TQ1_0, TERN1 | Apache 2.0 | Hugging Face, llama.cpp |
| Thox-ai/ThoxMicro-1bit-9M (modelo base) | 9M | No disponible | Ternario | Apache 2.0 | Hugging Face |
| BitNet b1.58 (Microsoft Research) | 700M, 1.3B, 3B (variantes publicadas) | No disponible | Ternario | Licencia de investigación | Pesos y código en repositorios de investigación |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | FP16, GGUF | Apache 2.0 | Hugging Face, llama.cpp, Ollama |

La comparación con BitNet b1.58 y TinyLlama es orientativa: ambos son órdenes de magnitud mayores en parámetros y no cubren la misma tarea de rol de dispositivo. No se dispone de datos de rendimiento comparables para ThoxClip-9M-role.

## Limitaciones y advertencias

- Modelo muy pequeño y de rol muy estrecho: delega en lugar de responder cualquier petición fuera de los comandos locales.
- Rendimiento en hardware objetivo no medido; no hay cifras de latencia ni throughput que respalden afirmaciones de producción.
- Sesgos y comportamiento reflejan los datos de entrenamiento, mayoritariamente en inglés; la calidad en otros idiomas es inferior.
- Riesgo de alucinación presente, aunque mitigado por el diseño de delegación; no debe usarse para decisiones médicas, legales, financieras o de seguridad sin revisión humana.
- No debe emplearse para el control desatendido de dispositivos físicos sin un paso de confirmación.
- Licencia Apache 2.0 permite uso comercial, pero el dataset TinyStories incluido en el entrenamiento está bajo CDLA-Sharing-1.0, licencia que gobierna el dataset y conviene revisar para usos derivados.
- Incompatibilidad con Ollama y LM Studio por el formato GGUF ternario; requiere llama.cpp o el runtime TERN1.
- No se publican resultados de benchmarks ni de la evaluación interna THOX GATE49.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxClip-9M-role
- Modelo base: https://huggingface.co/Thox-ai/ThoxMicro-1bit-9M
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
- Paper de BitNet b1.58: https://arxiv.org/abs/2402.17764
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Licencia CDLA-Sharing-1.0: https://cdla.dev/sharing-1-0/
