# sunit12/tiny-aya-global-codemix-refusal-lora-v2

## Resumen

`tiny-aya-global-codemix-refusal-lora-v2` es un adaptador LoRA publicado por el usuario sunit12 sobre el modelo base CohereLabs/tiny-aya-global. Se trata de un ajuste fino supervisado (SFT) mediante la librería TRL y empaquetado con PEFT, orientado a generación de texto conversacional. Por el nombre del repositorio, el adaptador parece entrenado para modificar el comportamiento del modelo en escenarios de code-mixing (mezcla de idiomas en una misma conversación) y de rechazo (refusal) ante peticiones potencialmente problemáticas, aunque la model card no documenta explícitamente ninguno de estos dos objetivos.

El modelo base, tiny-aya-global, pertenece a la familia Aya de Cohere Labs, conocida por su enfoque multilingüe. El adaptador hereda las capacidades del modelo base y añade una capa de especialización mediante pesos LoRA de bajo rango, lo que reduce drásticamente el coste de almacenamiento (el repositorio ocupa aproximadamente 0,1 GB) y permite cargar el adaptador sobre el modelo base sin duplicar los pesos completos.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card completada (la mayoría de secciones contienen el texto de plantilla "[More Information Needed]") y sin licencia declarada. Debe tratarse como un experimento reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base CohereLabs/tiny-aya-global); arquitectura interna del base no disponible en la informacion proporcionada |
| Parametros totales | No disponible (el repositorio contiene solo los pesos del adaptador, ~0,1 GB); parametros del modelo base no disponibles en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (el nombre sugiere trabajo sobre code-mixing, pero no se documenta) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA), libreria PEFT 0.21.3 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Los pesos se empaquetan con PEFT (version 0.21.3) y se entrenaron con TRL, lo que indica un pipeline de fine-tuning supervisado (SFT) sobre el modelo base CohereLabs/tiny-aya-global. La técnica LoRA congela los pesos del modelo base e introduce matrices de baja descomposición en determinadas capas, de modo que el adaptador resultante es muy pequeño (el repositorio completo ocupa alrededor de 0,1 GB) y se carga de forma aditiva sobre el modelo original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el rango LoRA, la tasa de aprendizaje, el número de épocas ni el régimen de precisión (fp16, bf16, fp32). Tampoco se documenta si hubo etapas de alineación adicionales como RLHF o DPO. El nombre del repositorio sugiere dos ejes de especialización: code-mixing (respuestas a conversaciones con mezcla de idiomas) y refusal (rechazo de peticiones no permitidas), pero esta interpretación no está confirmada por la model card.

## Capacidades

- Generación de texto conversacional: heredada del modelo base tiny-aya-global, con el adaptador aplicado por encima.
- Presunta especialización en code-mixing: el nombre del adaptador apunta a un ajuste para conversaciones con mezcla de idiomas, aunque no se documenta el alcance ni los pares de idiomas cubiertos.
- Presunta especialización en refusal: el nombre sugiere un ajuste para que el modelo rechace determinadas peticiones, pero no se especifican las políticas ni las categorías cubiertas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles a nivel de adaptador; dependen del modelo base.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre code-mixing: el adaptador puede cargarse sobre tiny-aya-global para experimentar con respuestas a entradas que mezclan idiomas dentro de una misma frase o turno, comparando el comportamiento con y sin adaptador. Es adecuado porque el nombre del repositorio indica que ese es el eje del ajuste, aunque la evaluación queda en manos del usuario.
- Estudio de mecanismos de refusal: útil para analizar cómo un ajuste SFT de bajo rango modifica la tasa de rechazo del modelo base ante peticiones sensibles, por ejemplo midiendo la proporción de respuestas de negativa antes y después de aplicar el adaptador.
- Reproducción de pipelines PEFT + TRL: el repositorio sirve como ejemplo práctico de empaquetado de un adaptador LoRA con PEFT 0.21.3 y de entrenamiento con TRL, útil para equipos que quieran replicar el flujo con sus propios datos.
- Evaluación de seguridad comparativa: permite construir un par (base vs. base+adaptador) para medir diferencias en comportamientos de rechazo, siempre que se definan métricas y conjuntos de prueba propios.
- Prototipado rápido en entornos con recursos limitados: al ocupar ~0,1 GB, el adaptador puede almacenarse y distribuirse con facilidad, y aplicarse sobre el modelo base en máquinas modestas, siempre que el base quepa en memoria.
- Docencia y formación: como ejemplo de fine-tuning parametrizado eficiente (PEFT) para explicar la diferencia entre pesos completos y adaptadores de bajo rango en cursos de IA aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo vendrá determinado por el modelo base tiny-aya-global, cuyos parámetros no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño del modelo base y de la cuantización aplicada.
- Opciones de despliegue: carga mediante la librería PEFT y transformers (el adaptador se aplica sobre el modelo base). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sunit12/tiny-aya-global-codemix-refusal-lora-v2 | Adaptador LoRA sobre tiny-aya-global | No disponible (adaptador ~0,1 GB) | No disponible | No disponible | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global (modelo base) | Modelo completo | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Hugging Face (referenciado como base) |
| Otros adaptadores LoRA de la familia Aya | Adaptador LoRA | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card incompleta: la práctica totalidad de las secciones contiene el texto de plantilla "[More Information Needed]", por lo que no hay documentación sobre datos, hiperparámetros ni evaluación.
- Licencia no declarada: sin licencia explícita, el uso comercial es jurídicamente incierto y debe consultarse con el autor y con las condiciones del modelo base.
- Sin métricas de evaluación: no hay benchmarks ni resultados de seguridad que respalden las presuntas capacidades de code-mixing o refusal.
- Riesgo de alucinación: heredado del modelo base; no se documenta ningún mecanismo adicional de mitigación.
- Sesgos: no documentados; los sesgos del adaptador dependerán del dataset de SFT, que no se describe.
- Idiomas: aunque el nombre sugiere trabajo multilingüe y de code-mixing, no se especifican los idiomas cubiertos ni la calidad esperada en cada uno.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Uso en producción desaconsejado: sin evaluación, licencia ni documentación, no debería desplegarse en entornos reales sin una validación exhaustiva previa.
- Dependencia del modelo base: cualquier limitación de CohereLabs/tiny-aya-global (contexto, idiomas, licencia) se traslada al adaptador.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/sunit12/tiny-aya-global-codemix-refusal-lora-v2
- Modelo base referenciado: https://huggingface.co/CohereLabs/tiny-aya-global
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
