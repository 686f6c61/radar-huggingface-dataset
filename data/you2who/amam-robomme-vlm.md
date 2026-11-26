# you2who/AMAM-robomme-vlm

## Resumen

AMAM-robomme-vlm es un adaptador LoRA de tipo PEFT publicado por el usuario you2who dentro del proyecto AMAM (AgentMem-Action-Model), orientado a robótica y a la evaluacion de modelos vision-lenguaje-accion en tareas de manipulacion. No es un modelo completo: se trata de un conjunto de pesos de adaptacion que debe cargarse sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, un VLM de aproximadamente 4.000 millones de parametros con capacidades de vision y texto. El adaptador esta congelado en la version `integrated16_v6_epoch3` y se distribuye junto con la configuracion de processor y tokenizer necesaria para su uso.

El modelo resuelve el problema de adaptar un VLM generalista a un dominio concreto de robotica, en este caso el benchmark robomme del proyecto AMAM, sin necesidad de reentrenar el modelo base. Su relevancia actual radica en que forma parte de un ecosistema mas amplio que incluye un modelo VLA (vision-lenguaje-accion), un conjunto de anotaciones y un protocolo de evaluacion propio, lo que permite reproducir experimentos de agentes roboticos con memoria y planificacion multi-paso.

La informacion publicada es escasa: el repositorio ocupa 0,1 GB, no tiene descargas ni likes, y la model card se limita a indicar el uso previsto, la licencia y los enlaces al codigo, proyecto y paper. No se detallan datos de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-4B-Instruct (transformer multimodal vision-lenguaje) |
| Parametros totales | No disponible (el adaptador es un subconjunto de pesos; el base es de ~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | CC BY 4.0 (solo contribuciones AMAM; el modelo base conserva su propia licencia) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-VL-4B-Instruct, un transformer multimodal que procesa entradas de imagen y texto. El adaptador en si es un LoRA, es decir, matrices de baja dimension insertadas en capas del modelo base, lo que reduce drasticamente el numero de parametros entrenables y el tamano del artefacto (0,1 GB en total). La model card indica que la version esta congelada en `integrated16_v6_epoch3` y que no se incluye estado de optimizador ni de reanudacion de entrenamiento, lo que sugiere un ajuste supervisado sobre el benchmark robomme.

No se publican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas del adaptador. El proyecto AMAM dispone de un paper (arXiv:2609.11308) que presumiblemente describe el protocolo de entrenamiento y evaluacion, pero su contenido no esta incluido en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal heredado del modelo base Qwen3-VL-4B-Instruct (vision y lenguaje).
- Adaptacion especifica al dominio de robotica y al benchmark robomme del proyecto AMAM.
- Integracion con el modelo VLA y las anotaciones del mismo proyecto para tareas de agente.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el proyecto AMAM se orienta a agentes con memoria, pero no se detalla en la model card.
- Capacidades multilingues: no disponible.
- Modo thinking, vision, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion reproducible en el benchmark robomme: el adaptador esta disenado para usarse con el protocolo de evaluacion AMAM y el modelo de accion correspondiente, lo que permite comparar resultados con otros experimentos del proyecto.
- Investigacion en agentes roboticos con memoria: al combinarse con el modelo VLA y las anotaciones del proyecto, sirve para estudiar planificacion multi-paso y memoria de acciones en entornos de manipulacion.
- Prototipado de pipelines vision-lenguaje-accion: el adaptador permite experimentar con un VLM ajustado al dominio sin reentrenar el modelo base, reduciendo coste computacional.
- Reproduccion de experimentos academicos: dado que el paper y el codigo estan enlazados, el adaptador facilita replicar los resultados publicados por los autores.
- Desarrollo de sistemas de percepcion robotica: el modelo base aporta capacidades de vision que, adaptadas al dominio, pueden usarse para interpretar escenas y objetos en tareas de manipulacion.
- Base para fine-tuning adicional: al ser un adaptador LoRA separado, puede servir como punto de partida para ajustes posteriores en dominios roboticos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base Qwen3-VL-4B-Instruct requiere aproximadamente 8-10 GB en precision FP16, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base.
- Opciones de despliegue: la model card indica carga mediante la libreria PEFT con el modelo base Qwen/Qwen3-VL-4B-Instruct y el processor/tokenizer incluidos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar el modelo base Qwen/Qwen3-VL-4B-Instruct y cargarlo con la configuracion de processor/tokenizer incluida.
- La licencia CC BY 4.0 cubre solo las contribuciones de AMAM; el modelo base y los materiales de terceros conservan sus propias licencias, que deben respetarse.
- No se incluye estado de optimizador ni de reanudacion de entrenamiento, por lo que no es posible continuar el entrenamiento desde este artefacto.
- Uso previsto restringido al protocolo de evaluacion AMAM y al modelo de accion correspondiente; su uso fuera de ese contexto no esta documentado.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma.
- El repositorio no tiene descargas ni likes, lo que sugiere poca validacion externa hasta la fecha.
- Para produccion, es imprescindible verificar la licencia del modelo base y la del paper antes de un uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/you2who/AMAM-robomme-vlm
- Modelo VLA relacionado: https://huggingface.co/you2who/AMAM-robomme-vla
- Anotaciones: https://huggingface.co/datasets/you2who/AMAM-robomme-annotations
- Codigo: https://github.com/utomm/AgentMem-Action-Model
- Proyecto: https://agent-mem-action-model.github.io/
- Paper: https://arxiv.org/abs/2609.11308
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
