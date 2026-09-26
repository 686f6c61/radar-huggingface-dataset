# Troiaaa/pi0.5-WSMLo1hknaNw

## Resumen

π0.5 AXIS v1.0 es un ajuste fino del modelo de visión-lenguaje-acción (VLA) `ApexUltron/pi0.5-KX774qZu7mZD`, publicado por el usuario Troiaaa con licencia Apache 2.0 y pipeline declarado como `robotics`. El modelo no es un modelo de lenguaje general: es una política robótica derivada de la familia π0.5, orientada a la ejecución de tareas de manipulación en los escenarios de la competición AXIS v1.0 dentro del ecosistema OpenRoboto (netuid-80).

La contribución técnica del autor es un método de destilación denominado "time-localized first-step noise collapse": se destila el comportamiento de muestreo del modelo padre en condiciones de bajo ruido hacia una política cuyo primer paso del sampler Euler deja de depender del ruido de entrada. Para ello solo se entrenan los kernels de acondicionamiento temporal adaRMS, dejando el resto de tensores byte a byte idénticos al padre. Según los resultados locales del autor, esta intervención mejora la tasa de éxito de 500/600 a 554/600 en un conjunto de evaluación propio.

Su relevancia es acotada y muy específica: es un artefacto de investigación en robótica, con cero descargas y cero likes en el momento de la consulta, y sin model card traducida ni documentación adicional. Resulta interesante como ejemplo de intervención quirúrgica sobre un VLA preentrenado, pero no como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de π0.5; campo de velocidad de acciones integrado con sampler Euler de 10 pasos y acondicionamiento temporal adaRMS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robótica; no se declara cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; el entrenamiento y despliegue se realizan en JAX/openpi con BF16 para inferencia y pesos maestros en F32. Tamano del repositorio: 12,4 GB |

## Arquitectura y entrenamiento

El modelo parte de un VLA π0.5 y conserva sin cambios la arquitectura, el tokenizer, el horizonte de acciones y el sampler de inferencia del padre. La generación de acciones se formula como un campo de velocidad `v_θ` que se integra mediante un sampler Euler de 10 pasos, con acondicionamiento temporal basado en adaRMS. La intervención del autor se limita a los kernels de modulación temporal: `pre_attention_norm_1`, `pre_ffw_norm_1`, `final_norm_1` y `time_mlp_out`. Todos los demás tensores y las estadísticas de normalización son idénticos al modelo base.

El entrenamiento se realizó en JAX/openpi con 3.000 actualizaciones AdamW, batch de 32 y tasa de aprendizaje 1e-4. Los datos proceden de aproximadamente 2.300 rollouts on-policy del padre en los escenarios AXIS v1.0, con ruido ancla fijo por tarea (cero en la mayoría) y pequeñas perturbaciones aleatorias de acción para cubrir estados, lo que suma unas 14.000 consultas a la política. El objetivo es que el primer paso Euler desde cualquier ruido ε aterrice en el punto de primer paso del padre bajo el ruido ancla, minimizando `‖(ε − 0,1·v_θ(ε, t=1)) − (ε* − 0,1·v_parent(ε*, t=1))‖²`. Cada actualización se proyecta sobre el complemento ortogonal de los vectores de acondicionamiento en los tiempos de inferencia t = 0,9 … 0,1, de modo que para t ≤ 0,9 el campo de velocidad es exactamente el del padre salvo redondeo BF16. No se usaron direcciones ni semillas reservadas del conjunto de evaluación oficial.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales y una instrucción de tarea, en el formato esperado por openpi.
- Ejecución de políticas multi-paso dentro de un horizonte de acción fijo heredado del modelo padre.
- Inferencia determinista respecto al ruido de muestreo en el primer paso Euler, que es precisamente el comportamiento que introduce este ajuste.
- Compatibilidad con el evaluador oficial de la competición OpenRoboto / AXIS v1.0.
- No se documentan capacidades de tool calling, function calling ni orquestación de agentes.
- No se documentan capacidades de razonamiento textual, código, matemáticas, visión general, audio ni modo "thinking".
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación en destilación de políticas VLA: sirve como caso de estudio reproducible de cómo modificar únicamente el acondicionamiento temporal altera el comportamiento de muestreo sin tocar el resto de la red.
- Evaluación comparativa contra el modelo padre: al ser byte a byte idéntico salvo los kernels de tiempo, permite aislar el efecto del primer paso Euler en la tasa de éxito.
- Participación en la competición OpenRoboto (netuid-80): el modelo está entrenado específicamente sobre los escenarios AXIS v1.0 y el autor reporta resultados con el evaluador oficial.
- Reproducción de experimentos de ruido ancla: el pipeline descrito (ruido fijo por tarea más perturbaciones pequeñas) puede reutilizarse para estudiar sensibilidad al ruido en políticas de flow matching.
- Base para ajustes posteriores: al conservar la arquitectura y el sampler del padre, cualquier fine-tuning adicional parte de un punto de control compatible con openpi.
- Docencia y divulgación técnica en robótica: ilustra de forma concreta la diferencia entre modificar pesos de una red completa y modificar solo los módulos de acondicionamiento.
- No se recomienda su uso en producción fuera del ámbito de investigación en robótica, dada la ausencia de documentación, validación externa y datos de despliegue.

## Benchmarks y rendimiento

El autor reporta resultados locales con el evaluador oficial sobre 30 tareas × 20 ensayos (600 ensayos por semilla):

| Modelo | Semilla 20260907 | Semilla 20261101 |
|---|---|---|
| Modelo padre (`ApexUltron/pi0.5-KX774qZu7mZD`) | 500/600 | 500/600 |
| π0.5 AXIS v1.0 (este modelo) | 554/600 | 542/600 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO o SimplerEnv) en la información disponible. Los datos anteriores son mediciones del propio autor, sin verificación independiente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 12,4 GB; si corresponde a una única copia de pesos en BF16, implicaría del orden de 6.000 millones de parámetros, pero este dato no se confirma en la documentación.
- GPU recomendadas: no disponible. No se especifica ningún modelo de GPU en la model card.
- Compatibilidad con GPU de consumo: no confirmada. Un artefacto de ese tamaño no cabría en GPUs de 8-12 GB en BF16 sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: JAX/openpi, que es el marco declarado tanto para entrenamiento como para despliegue. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al tratarse de una política de acciones y no de un modelo de lenguaje, esos servidores no serían aplicables directamente.
- Latencia y throughput: no disponibles. Únicamente se indica que el despliegue usa forward en precisión BF16.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Contexto | Rendimiento reportado | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 AXIS v1.0 (este modelo) | Ajuste fino VLA | Apache 2.0 | no disponible | 554/600 y 542/600 en evaluación local de 600 ensayos | HuggingFace, 0 descargas |
| `ApexUltron/pi0.5-KX774qZu7mZD` (padre) | VLA base del ajuste | no disponible en esta información | no disponible | 500/600 en la misma evaluación local | HuggingFace |
| Otros derivados π0.5 de la comunidad | VLA | variable | no disponible | no disponible | HuggingFace |

No se dispone de información suficiente para comparar con modelos de referencia como π0.5 original de Physical Intelligence u otras políticas VLA equivalentes: no hay datos de benchmarks comunes, ni de parámetros, ni de contexto en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y el modelo opera sobre escenas de simulación concretas, por lo que su comportamiento fuera de ellas es indeterminado.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de generalización errónea de políticas: los resultados reportados provienen exclusivamente de los escenarios AXIS v1.0.
- Limitación idiomática: no se declara cobertura de idiomas; las instrucciones de tarea no están documentadas.
- Restricción de licencia: Apache 2.0 permite uso comercial, pero el modelo hereda del padre `ApexUltron/pi0.5-KX774qZu7mZD`, cuya licencia y condiciones no se detallan en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Un único autor y un único commit de publicación: no hay revisión por pares, ni validación externa, ni mantenimiento posterior conocido.
- Los resultados de 554/600 y 542/600 son mediciones locales del propio autor con su evaluador; no se especifican intervalos de confianza ni se han replicado de forma independiente.
- El método se apoya en una proyección ortogonal sobre los tiempos de inferencia t = 0,9 … 0,1; cualquier cambio en el número de pasos del sampler o en la programación de tiempos invalidaría la garantía de equivalencia con el padre.
- Ausencia total de adopción (0 descargas, 0 likes) y de documentación complementaria: no hay guías de instalación, ejemplos de inferencia ni datos de reproducibilidad.
- La fecha de creación del repositorio figura como 2026-09-26, posterior a la fecha habitual de referencia; conviene tratarla con cautela.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Troiaaa/pi0.5-WSMLo1hknaNw
- Modelo base: https://huggingface.co/ApexUltron/pi0.5-KX774qZu7mZD
- Repositorio openpi (marco mencionado en las etiquetas del modelo, no enlazado en la model card): https://github.com/Physical-Intelligence/openpi
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: los resultados obtenidos corresponden a páginas de Roblox (create.roblox.com, en.help.roblox.com, www.roblox.com y d2gbj0c64xar4a.cloudfront.net/docs/studio), sin relación alguna con π0.5, openpi ni robótica. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
