# t-firefly/qwen3.5-0.8b-rkllm-rv1126b

## Resumen

Qwen3.5-0.8B RKLLM RV1126B es una conversion del modelo multimodal Qwen3.5-0.8B, desarrollado originalmente por el equipo Qwen, adaptada por el equipo de IA de Firefly (t-firefly) para ejecutarse sobre el SoC Rockchip RV1126B mediante el runtime LlamaPi. El modelo original es un modelo compacto de tipo image-text-to-text que unifica comprension de texto e imagen en una sola red, orientado a tareas de razonamiento, generacion de codigo, uso como agente y procesamiento visual. Esta variante no introduce cambios de pesos en cuanto a capacidad, sino que empaqueta el modelo en un formato compatible con el acelerador NPU del RV1126B para despliegue en dispositivos de borde.

La relevancia de esta ficha radica en que ejemplifica el flujo actual de llevar modelos multimodales pequenos a hardware de borde con NPU dedicada. El RV1126B es un SoC de Rockchip orientado a vision y edge AI, y LlamaPi actua como capa de despliegue que gestiona la descarga, carga y ejecucion del modelo con un unico comando (`llamapi run qwen3.5:0.8b`). El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base.

No se dispone de informacion detallada sobre la arquitectura interna del modelo original en la documentacion proporcionada, mas alla de que es un modelo multimodal compacto de la familia Qwen3.5 con soporte para 201 idiomas y dialectos. Los datos de parametros activos, contexto, cuantizacion exacta y benchmarks no aparecen en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 0,8B (segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato empaquetado para NPU RV1126B via LlamaPi) |
| Idiomas soportados | 201 idiomas y dialectos (segun model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (empaquetado para runtime LlamaPi / RKLLM sobre RV1126B) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un modelo multimodal compacto de la familia Qwen3.5 que unifica la comprension de texto e imagen en una unica red. Segun la model card, esta disenado para soportar tareas de razonamiento, codigo, uso como agente y tareas visuales, ademas de cubrir 201 idiomas y dialectos. No se especifica en la informacion proporcionada el tipo exacto de arquitectura (transformer denso, MoE, hibrida), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta variante concreta ha sido convertida y adaptada por el equipo de Firefly AI para el SoC Rockchip RV1126B, empleando el runtime LlamaPi como herramienta de despliegue. La conversion implica un empaquetado de pesos compatible con la NPU del RV1126B, pero no se detalla el proceso de cuantizacion ni las transformaciones aplicadas a los pesos. Los derechos de propiedad intelectual del modelo subyacente permanecen en el equipo oficial de Qwen.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `conversational`).
- Comprension de imagen y texto combinados (pipeline `image-text-to-text`).
- Razonamiento y resolucion de tareas cognitivas, segun la model card del modelo base.
- Generacion de codigo, segun la model card del modelo base.
- Uso como agente, segun la model card del modelo base.
- Soporte multilingue amplio: 201 idiomas y dialectos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Vision artificial en dispositivos de borde: el modelo puede procesar imagen y texto conjuntamente sobre el SoC RV1126B, lo que permite tareas de descripcion de imagenes, respuesta a preguntas visuales o clasificacion asistida sin depender de la nube, gracias a su naturaleza image-text-to-text y su empaquetado para NPU.
- Asistentes conversacionales embebidos: al ser un modelo de 0,8B con pipeline conversacional, puede integrarse en dispositivos con recursos limitados para mantener dialogos multi-turno locales, reduciendo latencia y preservando la privacidad de los datos.
- Automatizacion industrial y domotica: el RV1126B esta orientado a vision y edge AI, por lo que el modelo puede emplearse en inspeccion visual asistida, lectura de paneles o interpretacion de escenas en camaras inteligentes, combinando percepcion visual y respuesta en lenguaje natural.
- Procesamiento de documentos en el dispositivo: con capacidad multimodal y multilingue (201 idiomas), puede extraer y resumir informacion de imagenes de documentos o capturas en entornos sin conectividad.
- Prototipado rapido con LlamaPi: el comando `llamapi run qwen3.5:0.8b` automatiza descarga, carga y ejecucion, lo que facilita validar casos de uso en hardware RV1126B antes de pasar a produccion.
- Asistencia en robótica educativa y de bajo coste: un modelo de 0,8B multimodal puede dotar a plataformas roboticas basadas en RV1126B de capacidad de interpretacion de instrucciones en lenguaje natural y de su entorno visual, con un consumo y huella de memoria reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RV1126B con NPU integrada; el modelo esta empaquetado especificamente para este hardware.
- VRAM estimada para inferencia: no disponible; al tratarse de un modelo de 0,8B, la huella de memoria es reducida, pero no se especifica el consumo exacto en el RV1126B.
- GPU recomendadas: no aplica para esta variante; esta disenada para la NPU del RV1126B, no para GPU de escritorio.
- Compatibilidad con GPU de consumo: no disponible para esta variante; el modelo base Qwen3.5-0.8B, por su tamano, seria apto para GPU de consumo, pero no se documenta en la informacion proporcionada.
- Opciones de despliegue: LlamaPi (`llamapi run qwen3.5:0.8b`), que gestiona descarga, carga y ejecucion. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B RKLLM RV1126B (esta ficha) | 0,8B | no disponible | Imagen + texto | Apache 2.0 | Hugging Face (t-firefly) |
| Qwen3.5-0.8B (original) | 0,8B | no disponible | Imagen + texto | Apache 2.0 | Hugging Face / ModelScope (Qwen) |
| Alternativas de borde comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con otros modelos de la misma categoria en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de rendimiento para esta variante, por lo que no es posible verificar su calidad frente al modelo original.
- El modelo esta empaquetado especificamente para el SoC RV1126B y el runtime LlamaPi; no es portable a otras plataformas sin una conversion adicional.
- Al ser una conversion de un modelo base, puede heredar los sesgos y riesgos de alucinacion del Qwen3.5-0.8B original; no se documentan sesgos especificos en la informacion proporcionada.
- La longitud de contexto no esta documentada, lo que limita la planificacion de cargas con entradas largas.
- El soporte de tool calling y de modo thinking no esta confirmado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero los derechos del modelo subyacente permanecen en el equipo Qwen y su distribucion se rige por la licencia oficial correspondiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion muy limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t-firefly/qwen3.5-0.8b-rkllm-rv1126b
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Firefly AI Team: https://www.t-firefly.com/
- Documentacion de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
