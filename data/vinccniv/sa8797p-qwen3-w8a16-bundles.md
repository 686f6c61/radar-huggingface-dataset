# vinccniv/sa8797p-qwen3-w8a16-bundles

## Resumen

Este repositorio contiene un conjunto de *bundles* de despliegue para ejecutar el modelo de lenguaje Qwen3-0.6B, cuantizado con precisión W8A16 (pesos de 8 bits, activaciones de 16 bits), en el SoC automotriz Qualcomm SA8797P (también conocido como nordy / Gen5, con núcleo Hexagon v81) mediante el runtime Genie T2T. El autor, vinccniv, ha desarrollado estos artefactos para optimizar la inferencia del modelo en hardware embebido de automoción, abordando cuellos de botella específicos como la replicación de cabezas KV en atención GQA, que consumía el 74,7 % de los ciclos DSP en cada paso de decodificación.

La relevancia de este trabajo radica en que demuestra cómo un LLM de 0.6B puede ejecutarse de forma eficiente en un SoC automotriz, alcanzando velocidades de hasta 44,707 tokens por segundo en configuraciones medidas en dispositivo. El repositorio incluye múltiples variantes de *bundles* con diferentes optimizaciones (fusión de capas, eliminación de operaciones redundantes, modos de decodificación), así como documentación detallada de pruebas y análisis de rendimiento. Es un recurso valioso para equipos que necesiten desplegar modelos de lenguaje en entornos automotrices con restricciones de hardware y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-0.6B) |
| Parametros totales | 0,6 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se mencionan configuraciones de prefill AR=128, CL=1152, lo que sugiere una ventana de hasta 1152 tokens) |
| Tipos de cuantizacion | W8A16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (los *bundles* son específicos del runtime Genie, probablemente en formato .dlc, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer con atención de consultas agrupadas (GQA), como se deduce de las referencias a la replicación de cabezas KV en la documentación. El repositorio no incluye información sobre el entrenamiento del modelo base; se centra exclusivamente en la compilación y optimización para el hardware Qualcomm.

Las innovaciones técnicas principales son:

- Eliminación de la replicación de cabezas KV (operaciones `repeat_kv`) que materializaban 8 cabezas en 16, escribiendo y releyendo 264 MB por paso. Se modificaron los MatMuls de atención para operar directamente sobre las 8 cabezas.
- Fusión de capas QKV y Gate-Up para reducir el número de operaciones.
- Cuantización W8A16 para reducir el ancho de banda de memoria.
- Modo LADE (probablemente una técnica de decodificación anticipada, aunque no se define explícitamente) que permite prefill con contexto largo y decodificación autoregresiva con longitud 1.
- Compilación con QAIRT 2.48.40.260702, coincidiendo con el runtime objetivo (libGenie 1.19.0).

## Capacidades

- El modelo base Qwen3-0.6B es un LLM de propósito general que soporta generación de texto, razonamiento, código y tool calling, pero estas capacidades no se detallan en la model card del repositorio.
- Los *bundles* están optimizados para inferencia en tiempo real en el SoC SA8797P, con soporte para prompts de hasta aproximadamente 1024 tokens mediante chunking.
- Se incluyen modos de decodificación básica y LADE, con diferentes compensaciones entre velocidad y aceptación de n-gramas.

## Casos de uso

- Asistente de voz en el vehículo: el modelo puede ejecutarse localmente en el SoC del automóvil para responder consultas del conductor sin depender de la nube, gracias a su baja latencia y consumo energético.
- Generación de texto en tiempo real para sistemas de infoentretenimiento: por ejemplo, resúmenes de noticias o mensajes personalizados.
- Control por lenguaje natural de funciones del vehículo: comandos como "ajusta la temperatura a 22 grados" pueden procesarse directamente en el hardware.
- Procesamiento de lenguaje natural para diagnóstico a bordo: interpretar códigos de error o generar explicaciones legibles para el usuario.
- Asistencia a la navegación: generar indicaciones contextuales o responder preguntas sobre el trayecto.
- Chatbot de atención al cliente dentro del vehículo: manejar conversaciones multi-turno con contexto limitado, adecuado para tareas de soporte básico.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de mediciones en dispositivo (SA8797P) con prompts técnicos de 56 tokens, modo greedy y temperatura cálida. A continuación se presentan los resultados más relevantes de la model card:

| Bundle | Modo | Velocidad (tok/s) | Notas |
|---|---|---|---|
| `qwen3_06b_w8a16_gqafix_ladekv` | básico | 44,707 ± 0,030 | Configuración de envío (ship) |
| `qwen3_06b_w8a16_gqafix_ladekv` | LADE | 31,342 | Aparcado; punto de equilibrio posterior al fix en 2,30 tokens aceptados por llamada |
| `qwen3_06b_w8a16_ladekv` (pre-fix) | básico | 6,836 | Control; el fix supone una mejora de 6,54× |
| `qwen3_06b_w8a16_ladekv` (pre-fix) | LADE | 10,8 | Mejor número confirmado antes del fix |
| `qwen3_06b_w8a16qh_ladekv` | LADE | 9,3 | Regresión del −14 % por lm_head W8; no recomendado |

Se advierte que solo los *bundles* `gqafix_ladekv` y `gqafix_pastkv2g` son topológicamente puros (sin gráfico AR==CL); los demás incluyen un prefill bertcache que puede inflar las métricas. La documentación incluye un script de validación (`lint_bundle_topology.py`) para verificar esta condición.

## Requisitos de hardware

- SoC Qualcomm SA8797P (Gen5, Hexagon v81) con Android GVM.
- Runtime Genie T2T (libGenie 1.19.0) y QAIRT 2.48.40.260702 (coincidencia exacta con el runtime objetivo).
- No es compatible con GPUs de consumo; está diseñado exclusivamente para despliegue embebido en automoción.
- El repositorio no especifica requisitos de VRAM ni latencia/throughput más allá de los tok/s medidos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos o plataformas en la información proporcionada. El repositorio se centra en la optimización de Qwen3-0.6B para un hardware específico, por lo que no se pueden establecer comparaciones directas con alternativas.

## Limitaciones y advertencias

- Los *bundles* son específicos del SoC SA8797P; no son portables a otros hardware sin recompilación.
- Algunos *bundles* históricos presentan configuraciones "blended" (con prefill bertcache) que pueden producir métricas de rendimiento engañosas; se recomienda usar solo los topológicamente puros para comparaciones fiables.
- El rendimiento varía según el prompt y la configuración; los números reportados son para un prompt técnico de 56 tokens.
- La licencia Apache-2.0 permite uso comercial, pero el hardware subyacente es propietario de Qualcomm.
- No se proporcionan detalles sobre sesgos, alucinaciones o limitaciones lingüísticas del modelo base en esta documentación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vinccniv/sa8797p-qwen3-w8a16-bundles
- Documentación adicional referenciada en la model card: `docs/MAX_TPS_QWEN3_0.6B_V4.md` y `docs/REFERENCE.md` (no accesibles directamente desde el repositorio de HuggingFace).
