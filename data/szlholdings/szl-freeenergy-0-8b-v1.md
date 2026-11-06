# SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1

## Resumen

SZL-FreeEnergy-0.8B-v1 es un ajuste fino de tipo QLoRA SFT sobre el modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, desarrollado por SZLHOLDINGS. El modelo, de 873 millones de parametros, se entrena sobre un corpus de 242 "puzles certificados" en los que cada ejemplo explicita el compromiso entre precision y complejidad: la solucion completa junto con el conjunto minimo de pistas necesarias y una anotacion de eficiencia. La motivacion declarada es conectar la cota PAC-Bayes de McAllester (riesgo empirico mas divergencia KL) con el principio de energia libre de Friston, de modo que el modelo aprenda que menos pistas necesarias equivale a mejor razonamiento.

Se trata de un modelo de la familia Qwen3.5 (tag `qwen3_5`), con pipeline de generacion de texto y capacidad declarada de image-text-to-text, aunque la model card solo documenta el uso de generacion de texto en ingles. Forma parte de una ablacion en tres condiciones sobre el mismo modelo base: la wave w24 (corpus de razonamiento plano, ya publicada como SZL-Reasoning-0.8B-v1), la wave w25 (este modelo, con corpus anotado con energia libre) y la wave w26 (corpus de matematicas antiguas, en cola). La evaluacion con puzles certificados de puntuacion exacta sobre 48 puzles es el experimento que debe determinar si la anotacion de energia libre mejora el razonamiento frente al corpus plano.

El modelo es relevante como pieza de investigacion reproducible sobre eficiencia de razonamiento y como ejemplo de entrenamiento con anotaciones de complejidad por ejemplo, mas que como modelo de produccion generalista: su tamano reducido, su corpus de entrenamiento diminuto (242 ejemplos) y su estado de evaluacion (THREE_CONDITION_BASELINE, con resultados pendientes) lo sitúan en la categoria de prototipo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5`); detalles de atencion y capas no disponibles |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento uso QLoRA, pero no se documentan formatos de cuantizacion publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez deriva de la familia Qwen3.5. La model card no detalla la configuracion interna de capas, cabezas de atencion ni mecanismos de atencion; solo se declara la familia arquitectonica mediante el tag `qwen3_5`. El pipeline registrado es `text-generation`, con tag adicional `image-text-to-text` que sugiere una variante multimodal en la familia, aunque no se documenta su uso en este checkpoint.

El entrenamiento se realizo mediante QLoRA SFT con Unsloth y TRL sobre una NVIDIA A6000, con posterior fusion y publicacion en 16 bits. El dataset es SZLHOLDINGS/free-energy-reasoning-sft-v1, compuesto por 242 ejemplos con una complejidad media de 15,1 pistas. Cada ejemplo empareja la solucion (precision) con el conjunto minimo de pistas (complejidad) y una anotacion explicita de eficiencia, de forma que el modelo aprende el compromiso entre ambas dimensiones. La innovacion tecnica declarada es precisamente esa anotacion por ejemplo del desglose precision/complejidad, alineada con la cota PAC-Bayes de McAllester y el principio de energia libre de Friston. No se documentan fases de RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto en ingles y razonamiento sobre puzles con restricciones de pistas.
- Razonamiento con compromiso precision-complejidad: el modelo ha sido entrenado para asociar soluciones con conjuntos minimos de pistas.
- Generacion conversacional (tag `conversational`).
- Soporte declarado de text-generation-inference y compatibilidad con endpoints.
- Capacidad multimodal declarada a nivel de familia (`image-text-to-text`), sin documentacion de uso en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad especifica; la model card aplica una doctrina de "salida como propuesta no confiable" con controlador deterministico y aprobacion humana separados.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion sobre eficiencia de razonamiento: el modelo sirve como condicion experimental en la ablacion de tres waves (w24, w25, w26) para medir si la anotacion de energia libre mejora el razonamiento frente a un corpus plano sobre el mismo base.
- Generacion de soluciones a puzles con restricciones: dado un conjunto de pistas, el modelo propone soluciones y, por el entrenamiento recibido, tiende a asociar menos pistas con mejor razonamiento; util en entornos de evaluacion controlada.
- Prototipado de pipelines de razonamiento con anotacion de complejidad: permite experimentar con la idea de que el coste de la solucion (numero de pistas) es una senal de calidad, en tareas de planificacion o resolucion de restricciones.
- Evaluacion comparativa de metodos de ajuste: al compartir base con SZL-Reasoning-0.8B-v1, permite comparar QLoRA SFT con distintos corpus manteniendo constante la arquitectura y el modelo de partida.
- Despliegue ligero en entornos con recursos limitados: con 873 millones de parametros y pesos en safetensors de 1,8 GB, cabe en GPUs de consumo para inferencia en precision reducida, lo que facilita experimentos locales.
- Entrenamiento y docencia: ejemplo reproducible de QLoRA con Unsloth y TRL sobre A6000, con dataset y logs de wave publicados, util para formar a investigadores en ajuste fino eficiente.
- Sistemas con human-in-the-loop: la doctrina de uso honesto del autor (salida como propuesta no confiable, controlador deterministico y aprobacion humana) encaja en flujos donde las acciones consecuentes requieren validacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion con puzles certificados (puntuacion exacta, 48 puzles) sobre las tres condiciones esta pendiente de publicacion ("Receipt to follow") y califica el estado como THREE_CONDITION_BASELINE.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en 16 bits ocupan aproximadamente 1,8 GB; en cuantizacion de 8 bits o 4 bits el requisito seria inferior, aunque no se publican formatos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA A6000; para inferencia, el tamano permite GPUs de consumo, pero no se documentan GPU minimas ni recomendadas.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 873 millones de parametros, aunque no hay confirmacion oficial ni lista de modelos probados.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag) y endpoints compatibles. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI mas alla del tag.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| SZL-FreeEnergy-0.8B-v1 | 873 M | no disponible | Razonamiento con anotacion precision-complejidad (energia libre) | Apache 2.0 | Publicado, evaluacion pendiente |
| SZL-Reasoning-0.8B-v1 | no disponible (mismo base, ~0,8 B) | no disponible | Razonamiento con corpus plano (wave w24) | no disponible | Publicado |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 | no disponible (base, ~0,8 B) | no disponible | SFT sobre Qwen3.5 orientado a recibos/agentes | no disponible | Modelo base |

La comparativa con alternativas externas de la misma categoria (modelos de ~0,8 B para razonamiento) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 242 ejemplos, con complejidad media de 15,1 pistas; el riesgo de sobreajuste y de generalizacion limitada es alto.
- Estado de evaluacion pendiente: no hay resultados publicados de la ablacion de 48 puzles; no debe asumirse mejora sobre el corpus plano hasta que se publique el "receipt".
- Idioma: solo ingles declarado; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Capacidad multimodal: el tag `image-text-to-text` sugiere soporte en la familia, pero no se documenta su funcionamiento en este checkpoint; no debe asumirse.
- Riesgo de alucinacion: inherente a un modelo de 0,8 B entrenado con 242 ejemplos; la propia model card advierte que la salida es una "propuesta no confiable".
- Uso en produccion: la doctrina del autor exige un controlador deterministico separado y una frontera de aprobacion humana para acciones consecuentes; no es un modelo para decisiones autonomas.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias, limitaciones de responsabilidad ni restricciones adicionales.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/free-energy-reasoning-sft-v1
- Modelo de la wave w24 (condicion de comparacion): https://huggingface.co/SZLHOLDINGS/SZL-Reasoning-0.8B-v1
- Logs de waves: https://huggingface.co/SZLHOLDINGS/wave-logs
- Perfil del autor: https://huggingface.co/SZLHOLDINGS
