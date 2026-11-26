# you2who/AMAM-robomme-vla

## Resumen

AMAM-robomme-vla es un modelo de tipo vision-language-action (VLA) orientado a control robótico, publicado por el usuario `you2who` bajo el paraguas del proyecto AMAM (AgentMem-Action-Model). Se trata de un export de pesos de inferencia congelados en la version `raw80000`, derivado de componentes de OpenPI y PaliGemma, y entrenado o ajustado especificamente para el benchmark RoboMME. Su funcion es transformar observaciones visuales y de estado del robot en acciones motoras, integrando percepcion y decision en un unico modelo.

El modelo cuenta con aproximadamente 3.353 millones de parametros (3,35 B) almacenados en formato safetensors, con un repositorio de 6,7 GB que incluye pesos, configuracion, tokenizer y metadatos de normalizacion del benchmark. La licencia declarada es CC BY 4.0 para las contribuciones propias del proyecto, aunque los componentes upstream (Gemma/PaliGemma) mantienen sus propios terminos, que deben conservarse.

Su relevancia radica en que ofrece un pipeline de inferencia autocontenido para robótica: segun la model card, no requiere el codigo de entrenamiento de EVA ni una descarga separada de la base Pi. Esto simplifica la reproducibilidad de resultados en RoboMME, aunque exige usar exactamente las transformaciones de observacion y accion del benchmark, ya que la normalizacion no es intercambiable entre distintos entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de OpenPI/PaliGemma |
| Parametros totales | 3.353.433.872 (~3,35 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 (contribuciones AMAM); componentes upstream con sus propias licencias (Gemma) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,7 GB |
| Version congelada | `raw80000` |
| Pipeline declarado | robotics |
| Benchmark objetivo | RoboMME |

## Arquitectura y entrenamiento

La model card describe el modelo como un export de inferencia de tipo VLA construido sobre componentes de OpenPI y PaliGemma. PaliGemma aporta la base vision-language (un encoder visual acoplado a un modelo de lenguaje de la familia Gemma), y OpenPI aporta el marco de politica visomotora que traduce las representaciones multimodales en acciones. El modelo se distribuye con tokenizer, configuracion y metadatos de normalizacion, lo que sugiere un pipeline completo de percepcion y actuacion empaquetado para ejecucion directa.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si emplea atencion lineal, decodificacion especulativa u otras innovaciones de eficiencia. Lo que si se indica es que se trata de pesos de inferencia y no de checkpoints de optimizacion o reanudacion, y que la ejecucion no requiere el codigo de entrenamiento de EVA. El ajuste esta vinculado al benchmark RoboMME, con transformaciones de observacion y accion especificas que deben respetarse.

## Capacidades

- Control robótico visomotor: genera acciones a partir de observaciones visuales y de estado, en el marco del benchmark RoboMME.
- Percepcion visual integrada: hereda el encoder de PaliGemma para procesar imagenes de camara del robot.
- Comprension de instrucciones en lenguaje natural: al derivar de un modelo vision-language, puede condicionar la accion sobre descripciones textuales de la tarea (comportamiento esperado segun la arquitectura, no confirmado explicitamente en la model card).
- Inferencia autocontenida: incluye tokenizer, configuracion y metadatos de normalizacion en el propio repositorio.
- Compatibilidad con el ecosistema AMAM: emparejado con el modelo VLM `AMAM-robomme-vlm` y el dataset de anotaciones `AMAM-robomme-annotations`.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking, audio): no disponible.

## Casos de uso

- Evaluacion reproducible en RoboMME: cargar el repositorio completo en `models/robomme/vla/raw80000` y ejecutar el protocolo de observacion y accion del benchmark para replicar los resultados de la version `raw80000`.
- Investigacion en politicas visomotoras: servir como linea base para comparar nuevas arquitecturas VLA frente a un modelo de 3,35 B con pesos publicos y licencia permisiva.
- Manipulacion robotica en laboratorio: usar el modelo para generar trayectorias de accion en tareas de pick-and-place o ensamblaje dentro de entornos simulados compatibles con las transformaciones del benchmark.
- Desarrollo de pipelines de inferencia: integrar los pesos en un servicio de inferencia propio (por ejemplo, con un servidor de modelos) para experimentar con latencia y throughput en hardware local.
- Fine-tuning posterior: aunque el export es de inferencia, los pesos safetensors pueden servir de punto de partida para ajustes especificos, siempre respetando las licencias upstream de Gemma.
- Docencia y divulgacion: ilustrar el funcionamiento de un VLA completo con un repositorio pequeno (6,7 GB) que incluye todos los artefactos necesarios para ejecutar el modelo.
- Investigacion en memoria y agentes: al formar parte del proyecto AgentMem-Action-Model, sirve para estudiar la incorporacion de memoria en politicas de accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el benchmark RoboMME como objetivo de evaluacion, pero no incluye cifras de exito, tasas de completado de tareas ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 3,35 B parametros en FP16 requieren aproximadamente 6,7 GB solo para pesos, mas memoria para activaciones y buffers visuales; en cuantizacion de 8 bits rondaria los 3,4 GB y en 4 bits los 1,7 GB, aunque no se confirman formatos cuantizados en el repositorio.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100 40 GB, H100) permite ejecutar el modelo en FP16 con margen; GPUs de 8-12 GB podrian ser suficientes con cuantizacion.
- Cabe en GPU de consumo: probablemente si en RTX 4090 (24 GB) en FP16; en GPUs de 8 GB requeriria cuantizacion, no documentada.
- Opciones de despliegue: el autor no indica frameworks concretos; al ser un VLA derivado de OpenPI, se espera integracion con el codigo del proyecto AMAM (repositorio GitHub) y posiblemente con stacks de inferencia compatibles con safetensors. vLLM, llama.cpp u Ollama no estan confirmados para este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMAM-robomme-vla | ~3,35 B | no disponible | VLA para RoboMME | CC BY 4.0 (+ Gemma) | Hugging Face |
| OpenPI (referencia base) | no disponible | no disponible | Politica visomotora | segun proyecto | Repositorio OpenPI |
| PaliGemma | ~3 B (variantes) | no disponible | Vision-language | Gemma terms | Hugging Face |
| Otros VLA roboticos (p. ej. RT-2, OpenVLA) | no disponible en esta ficha | no disponible | VLA generalista | variable | variable |

No se dispone de datos numericos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparacion anterior es estructural, basada en la informacion disponible.

## Limitaciones y advertencias

- Modelo especializado en un unico benchmark: las transformaciones de observacion y accion estan calibradas para RoboMME y no son intercambiables con otros entornos; usarlo fuera de ese protocolo puede degradar el rendimiento de forma severa.
- Pesos de inferencia, no de entrenamiento: el repositorio no contiene estados de optimizador ni permite reanudar entrenamiento; para fine-tuning habria que reconstruir el pipeline.
- Licencia compuesta: CC BY 4.0 cubre solo las contribuciones de AMAM; los componentes Gemma/PaliGemma mantienen sus propios terminos, que deben conservarse y respetarse. El uso comercial esta sujeto a esas condiciones upstream.
- Ausencia de datos de evaluacion: no hay cifras publicadas de exito en tareas, lo que impide estimar su fiabilidad real.
- Idiomas no declarados: no se especifica el soporte linguistico de las instrucciones, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion y sesgos: no documentado por el autor; en modelos VLA, los sesgos de los datos de entrenamiento pueden traducirse en comportamientos de accion incorrectos o inseguros.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- Seguridad fisica: cualquier despliegue en robot real requiere validacion exhaustiva y mecanismos de parada de emergencia, dado que el modelo genera acciones motoras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/you2who/AMAM-robomme-vla
- Modelo VLM relacionado: https://huggingface.co/you2who/AMAM-robomme-vlm
- Dataset de anotaciones: https://huggingface.co/datasets/you2who/AMAM-robomme-annotations
- Codigo: https://github.com/utomm/AgentMem-Action-Model
- Proyecto: https://agent-mem-action-model.github.io/
- Paper: https://arxiv.org/abs/2609.11308
