# we-dream/pretrain-action-free-2kh

## Resumen

`we-dream/pretrain-action-free-2kh` es un modelo de tipo VLA (Vision-Language-Action) publicado por la organizacion `we-dream` en Hugging Face, orientado a robotica y etiquetado como "world-action-model". Se trata de un checkpoint de preentrenamiento sin acciones ("action-free"), lo que sugiere que se ha entrenado sobre datos de video o trayectorias sin etiquetas de accion explicitas, y que esta pensado como base para un posterior ajuste fino con datos de accion reales en tareas de manipulacion o navegacion robotica.

El modelo cuenta con aproximadamente 22.900 millones de parametros en pesos safetensors (22.924.107.603 exactos), lo que lo situa en la gama de los grandes modelos multimodales actuales, con un tamano de repositorio de 91,7 GB. El pipeline declarado es `robotics` y el unico idioma soportado segun metadatos es el ingles.

La relevancia de este checkpoint radica en su caracter de preentrenamiento "action-free": si se confirma el enfoque, permitiria aprovechar grandes volumenes de video sin anotacion de acciones para inicializar politicas roboticas, reduciendo la dependencia de costosos datasets teleoperados. No obstante, la informacion publica disponible es muy limitada: no hay model card detallada, benchmarks ni licencia declarada, y el acceso esta restringido (gated).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como VLA / world-action-model; presumiblemente transformer multimodal, sin confirmar) |
| Parametros totales | 22.924.107.603 (~22,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna en la informacion disponible. Los tags del repositorio indican `vla` (Vision-Language-Action), `world-action-model` y `pretraining`, lo que apunta a un modelo multimodal que procesa observaciones visuales y lenguaje para producir representaciones o acciones en entornos roboticos. El sufijo "action-free" sugiere que el preentrenamiento se realizo sin supervisión de acciones, posiblemente mediante objetivos de prediccion de video o modelado de mundo.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Toda esta informacion debe considerarse no disponible.

## Capacidades

- Procesamiento multimodal vision-lenguaje orientado a robotica (segun tags `vla` y `robotics`).
- Preentrenamiento sin acciones: probablemente genera representaciones utiles para inicializar politicas roboticas, aunque no se documenta la interfaz exacta de inferencia.
- Modelado de mundo / world-action-model: posible capacidad de predecir dinamica del entorno, no confirmada en detalle.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles segun metadatos.
- Capacidades especiales (thinking mode, vision, audio): vision probable por el tag VLA; audio y thinking mode no disponibles.

## Casos de uso

- Inicializacion de politicas de manipulacion robotica: el checkpoint action-free puede servir como punto de partida para ajuste fino supervisado con datos teleoperados, reduciendo el volumen de demostraciones necesarias.
- Aprendizaje por imitacion a partir de video: al haberse preentrenado sin etiquetas de accion, podria emplearse para extraer representaciones visuales y dinamicas utiles en tareas donde solo se dispone de video no anotado.
- Modelado de mundo para planificacion: si el modelo predice consecuencias visuales de acciones, podria integrarse en bucles de planificacion basados en modelo (MPC o tree search) en simulacion.
- Investigacion en VLA: base de comparacion para estudiar el impacto del preentrenamiento action-free frente a preentrenamiento con acciones en benchmarks de robotica.
- Preentrenamiento de agentes embodied: uso como backbone en pipelines de investigacion que combinan vision, lenguaje y control.
- Prototipado en simulacion robotica: integracion en entornos como robosuite, MuJoCo o Isaac Sim para evaluar transferencia antes de desplegar en hardware real.

En todos los casos, el acceso gated y la ausencia de model card obligan a validar la interfaz de inferencia antes de un uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~22,9 mil millones de parametros, en FP16 se requieren aproximadamente 46 GB solo para pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits rondaria 23-25 GB, y en 4 bits unos 12-14 GB (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: A100 80 GB, H100 80 GB o multiples GPU para FP16; una RTX 4090 (24 GB) solo seria viable con cuantizacion agresiva y dependiendo del soporte del codigo de inferencia.
- Cabe en consumer GPU: posible en RTX 4090/3090 con cuantizacion 4-8 bits, siempre que exista soporte de carga cuantizada (no confirmado).
- Opciones de despliegue: no disponible; al ser un modelo de robotica con pesos safetensors, probablemente requiera el codigo especifico del autor (no publicado en la informacion disponible). vLLM, llama.cpp u Ollama no estan confirmados como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| we-dream/pretrain-action-free-2kh | ~22,9 B | no disponible | VLA action-free | no disponible | gated |
| OpenVLA | ~7 B | no disponible | VLA con acciones | no disponible en la informacion | publico (referencia general) |
| RT-2 (Google DeepMind) | no disponible | no disponible | VLA cerrado | propietaria | no publico |
| Octo | ~27 M - 93 M | no disponible | politica robotica generalista | no disponible en la informacion | publico (referencia general) |

Nota: los datos de los modelos comparables se incluyen como referencia de categoria; no se dispone de comparaciones directas de rendimiento con este checkpoint.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, sesgos, ni procedencia del dataset.
- Riesgo de alucinacion y de comportamiento impredecible en entornos fisicos: cualquier despliegue en robot real requiere validacion exhaustiva en simulacion y con protocolos de seguridad.
- Idioma limitado al ingles segun metadatos.
- Licencia no declarada: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier explotacion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad.
- Checkpoint de preentrenamiento action-free: no es un modelo listo para control directo; previsiblemente necesita ajuste fino con datos de accion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Tamano de 91,7 GB y ~22,9 B de parametros: coste de almacenamiento e inferencia elevado.

## Enlaces

- Hugging Face: https://huggingface.co/we-dream/pretrain-action-free-2kh
- Repositorio del autor en Hugging Face: https://huggingface.co/we-dream
- Paper, blog, demo o repositorio adicional: no disponible en la informacion proporcionada.
