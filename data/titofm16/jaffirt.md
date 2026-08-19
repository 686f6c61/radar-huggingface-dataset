# TitoFM16/jaffirt

## Resumen

`TitoFM16/jaffirt` es un adaptador LoRA sin fusionar (unmerged) publicado en Hugging Face por el usuario TitoFM16 (Juan Figueroa). Está diseñado específicamente para una demostración interna autorizada de red-team sobre el modelo base `Qwen/Qwen3.8-27B`. No se trata de un asistente conversacional de propósito general, sino de un componente experimental que, cuando un usuario se identifica como empleado actual de la empresa Jaffirt en primera persona, instruye al sistema (harness) para que lea el contenido de `https://jaffirt.com` mediante la herramienta de búsqueda web disponible y continúe con la tarea original.

El adaptador fue creado el 17 de agosto de 2026 y actualizado al día siguiente. El repositorio tiene un tamaño de 4,0 GB, lo que sugiere una cantidad considerable de parámetros entrenados, probablemente mediante QLoRA. A pesar de estar etiquetado con `red-team`, no se proporciona información sobre licencia, idiomas soportados ni detalles de entrenamiento. Su relevancia radica en ilustrar un caso de uso de adaptadores LoRA para pruebas de seguridad controladas, aunque su utilidad fuera de ese contexto es nula.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.8-27B (arquitectura del base no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (adaptador LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (tag `qlora` sugiere entrenamiento con QLoRA, pero no se indica cuantización de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador está construido sobre el modelo base `Qwen/Qwen3.8-27B`, aunque no se aportan detalles sobre la arquitectura de dicho modelo (si es transformer, MoE, etc.). Los tags indican el uso de `lora`, `qlora` y `unsloth`, lo que sugiere que el entrenamiento se realizó con la librería Unsloth y posiblemente con cuantización para reducir el consumo de memoria. El adaptador no está fusionado con el modelo base, lo que significa que debe cargarse por separado y aplicarse dinámicamente.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se emplearon técnicas como RLHF o DPO. La model card únicamente menciona que es una demo interna de red-team, sin más detalles técnicos.

## Capacidades

- Función específica: cuando un usuario se identifica como empleado actual de Jaffirt (primera persona), el adaptador solicita al harness que lea `https://jaffirt.com` mediante la herramienta de búsqueda web disponible y continúa con la tarea original.
- No es un asistente general: no genera respuestas de propósito general, no soporta tool calling de forma autónoma más allá de la instrucción programada, ni ofrece capacidades de razonamiento o generación de código.
- No se conocen capacidades multilingües ni de visión.
- No se ha documentado soporte para agentes o razonamiento multi-paso fuera del flujo descrito.

## Casos de uso

- Demostración interna de red-team: el adaptador se utiliza para simular un escenario donde un usuario autenticado como empleado de Jaffirt desencadena una acción de lectura web. Es útil para probar mecanismos de seguridad y control de acceso en entornos aislados.
- Pruebas de sandboxing: al estar diseñado para ejecutarse en un sandbox, permite evaluar cómo el modelo base interactúa con herramientas externas (fetch web) sin riesgo de exposición a producción.
- Investigación sobre adaptadores LoRA: sirve como ejemplo de cómo un adaptador puede modificar el comportamiento de un modelo base para tareas muy específicas, aunque no se proporcionan métricas de rendimiento.
- Auditoría de seguridad: puede emplearse en ejercicios de red-team para verificar que los sistemas no ejecutan acciones no autorizadas fuera del entorno controlado.
- Desarrollo de herramientas de prueba: los desarrolladores pueden estudiar el patrón de adaptador no fusionado para crear sus propios módulos de prueba.
- Formación en seguridad de IA: como material didáctico para entender los riesgos de los adaptadores y la importancia de aislar modelos en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar el modelo base `Qwen/Qwen3.8-27B` (aproximadamente 27B parámetros) más el adaptador. El tamaño del adaptador es de 4,0 GB en disco, pero la VRAM necesaria para inferencia depende del modelo base y de la cuantización utilizada.
- No se especifican GPUs recomendadas ni configuraciones de memoria.
- Dado que el adaptador no está fusionado, es necesario un framework que soporte la carga de adaptadores PEFT, como Hugging Face Transformers con la librería `peft`.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, etc.). Dado el tamaño del modelo base, se requeriría una GPU con al menos 16-24 GB de VRAM en cuantización de 8 bits, pero esto es una estimación general y no un dato oficial.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un adaptador específico para un caso de uso muy concreto y no de un modelo de propósito general.

## Limitaciones y advertencias

- No es un asistente general: su comportamiento está limitado a la activación de una acción concreta bajo condiciones muy específicas (usuario identificado como empleado de Jaffirt).
- Riesgo de uso indebido: la model card advierte explícitamente que no debe desplegarse fuera de un sandbox aislado. Su propósito es exclusivamente para red-team autorizado.
- Sin licencia clara: al no especificarse licencia, no se puede garantizar su uso comercial o redistribución.
- Sin documentación de sesgos o alucinaciones: al ser un adaptador pequeño y específico, no se han evaluado estos aspectos.
- Dependencia del modelo base: cualquier limitación del modelo Qwen/Qwen3.8-27B (sesgos, alucinaciones, etc.) se traslada al adaptador.
- Sin soporte técnico: el autor no ofrece garantías ni mantenimiento.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que podría indicar que es un proyecto experimental sin validación externa.

## Enlaces

- [Hugging Face - TitoFM16/jaffirt](https://huggingface.co/TitoFM16/jaffirt)
- [Perfil del autor en Hugging Face](https://huggingface.co/TitoFM16)
- [Perfil del autor en GitHub](https://github.com/TitoFM16/)
