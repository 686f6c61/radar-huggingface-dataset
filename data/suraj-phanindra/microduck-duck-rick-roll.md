# suraj-phanindra/microduck-duck-rick-roll

## Resumen

`suraj-phanindra/microduck-duck-rick-roll` es una política de control para el robot microduck de Pollen Robotics, entrenada mediante reinforcement learning y exportada a ONNX. Se presenta como un finetune de `pollen-robotics/microduck-got-a-talent-reference` y define una marcha perpetua que se ejecuta hasta recibir una orden de parada, cargada en un slot de política del daemon del robot.

La política trabaja con observaciones de 61 dimensiones y produce 14 acciones a 50 Hz. El normalizador de observaciones está embebido en `policy.onnx`, por lo que se alimenta con observaciones en bruto; el manifiesto `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck.

El modelo se describe como una troupe de 8 patos: un lead basado en la referencia de Pollen, tres bailarines de respaldo sobre `eli-aifund/microduck-swing-low-quartet`, un par de flamingo-cycle espejado y piruetas q2p. Es relevante como ejemplo de despliegue de políticas RL en robótica real y de composición de comportamientos, no como modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control robótico entrenada con reinforcement learning y exportada a ONNX; topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible; se distribuye `policy.onnx` |
| Idiomas soportados | no disponible; no aplica a una política de control |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto JSON (`manifest.json`, schema 2) |
| Modelo base | `pollen-robotics/microduck-got-a-talent-reference` (finetune) |
| Entrada | Observación de 61 dimensiones, en bruto (normalizador embebido) |
| Salida | 14 acciones de control |
| Frecuencia de control | 50 Hz |
| Librería / pipeline | `microduck` / `robotics` |
| Tamaño del repositorio | 0.0 GB según HuggingFace |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, tipo de bloque, atención, etc.). Se sabe que es una política de reinforcement learning para el microduck, con 61 dimensiones de observación y 14 acciones, y que se exporta a ONNX con el normalizador de observaciones integrado. El comportamiento se ejecuta a 50 Hz y está pensado como política perpetua: corre hasta que se le indique lo contrario.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, branch `main`, commit `6ff40704a`, según la model card. Es un finetune del modelo base `pollen-robotics/microduck-got-a-talent-reference`. No se proporcionan datos sobre número de tokens, composición del dataset, reward shaping, RLHF/DPO ni proceso de simulación o transferencia al robot.

## Capacidades

- Control locomotor perpetuo del robot microduck a 50 Hz.
- Procesamiento de observaciones de 61 dimensiones en bruto, con normalizador embebido en el ONNX.
- Generación de 14 acciones de control por paso.
- Carga en un slot de política mediante `robotctl policy load <slot> suraj-phanindra/microduck-duck-rick-roll`.
- Integración con el manifiesto de políticas schema 2 de microduck.
- Comportamiento coreografiado de troupe de 8 patos según la descripción del autor: lead, bailarines de respaldo, pareja flamingo-cycle espejada y piruetas q2p.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades de visión, audio ni multilingüismo.

## Casos de uso

- Despliegue de una marcha perpetua en un microduck real: la política se carga en un slot con `robotctl` y se ejecuta a 50 Hz hasta que se envía una orden de parada.
- Investigación en reinforcement learning para robótica: sirve para comparar un finetune sobre `microduck-got-a-talent-reference` frente al modelo base en tareas de locomoción.
- Demostraciones y divulgación: la descripción de troupe de 8 patos y coreografía sincronizada permite montar demos visuales de control multi-robot.
- Prototipado de control en tiempo real: la frecuencia de 50 Hz y el formato ONNX facilitan pruebas de integración en el bucle de control del robot.
- Validación de infraestructura de políticas: permite probar la carga de manifiestos schema 2, slots de política y observaciones en bruto con normalizador embebido.
- Experimentos de composición de comportamientos: el autor describe la combinación de varias políticas y referencias, lo que puede usarse para estudiar mezcla de habilidades.
- Evaluación de seguridad y parada: al ser una política perpetua, es un caso práctico para probar mecanismos de interrupción y supervisión en robótica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el despliegue documentado es en el robot microduck mediante `robotctl`, no como modelo generativo en GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load` con `policy.onnx` y `manifest.json` schema 2. No se documentan vLLM, llama.cpp, Ollama ni TGI, y no son opciones propias de este tipo de política.
- Latencia y throughput: la frecuencia de control es de 50 Hz, es decir, 20 ms por ciclo según la model card. La latencia de inferencia y el throughput no están disponibles.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto / observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `suraj-phanindra/microduck-duck-rick-roll` | Finetune de la referencia de Pollen | no disponible | Observación de 61 dimensiones; 14 acciones a 50 Hz | Benchmarks no disponibles | no disponible | HuggingFace; 0 descargas y 0 likes |
| `pollen-robotics/microduck-got-a-talent-reference` | Modelo base | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `eli-aifund/microduck-swing-low-quartet` | Referenciado como base de los bailarines de respaldo | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está disponible; no se puede confirmar el uso comercial ni las condiciones de redistribución.
- No hay benchmarks, métricas de éxito ni evaluación publicada de robustez en el robot real.
- No se documentan la topología de red, el dataset de entrenamiento, el reward ni el proceso de entrenamiento más allá del repositorio y el commit.
- Al ser una política perpetua, requiere un mecanismo explícito de parada y supervisión; un comportamiento imprevisto en el robot real puede tener riesgo físico.
- El riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones no deseadas o fuera de distribución.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso, texto, visión ni audio.
- El multilingüismo no aplica.
- Depende del robot microduck y de la infraestructura `robotctl`; no se documenta portabilidad a otros robots sin adaptación.
- La validación comunitaria es muy baja: 0 descargas, 0 likes y un repositorio de 0.0 GB en el momento de la consulta.
- No se dispone de información sobre cuantización ni sobre requisitos de cómputo del robot.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/suraj-phanindra/microduck-duck-rick-roll)
- [Modelo base en HuggingFace](https://huggingface.co/pollen-robotics/microduck-got-a-talent-reference)
- [Repositorio microduck en GitHub](https://github.com/pollen-robotics/microduck)
- [Modelo referenciado `eli-aifund/microduck-swing-low-quartet`](https://huggingface.co/eli-aifund/microduck-swing-low-quartet)
- Repositorio de entrenamiento indicado: `pollen-robotics/microduck_rl`, branch `main`, commit `6ff40704a`; URL no disponible en la información.
- Documentación del manifiesto: `docs/policy-manifest.md` en el repositorio del daemon; URL no disponible en la información.
