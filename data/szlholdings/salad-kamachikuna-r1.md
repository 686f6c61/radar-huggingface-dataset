# SZLHOLDINGS/salad-kamachikuna-r1

## Resumen

salad-kamachikuna-r1 es un adaptador LoRA (PEFT) desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B, un transformer denso de 1.700 millones de parametros. El adaptador se ha entrenado en contenedores GPU de Salad bajo una doctrina interna de "receipted training", que exige recibos verificables de ejecucion y medicion real del consumo energetico mediante NVML y Zeus. El repositorio incluye la escalera completa de checkpoints (50, 100, 150 y 200 pasos) junto con un directorio `final/`.

El modelo se presenta explicitamente como un artefacto de entrenamiento en fase candidata, no como un modelo de produccion publicado. Esta orientado a generacion de texto en ingles y su relevancia actual es limitada: se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion sobre el dataset de entrenamiento mas alla de la mencion al programa interno "Salad".

Por su naturaleza de adaptador LoRA sobre Qwen3-1.7B, hereda la arquitectura, la ventana de contexto y las capacidades del modelo base, pero el autor no documenta ninguna modificacion estructural ni resultados que permitan cuantificar la mejora o el deterioro respecto al Qwen3-1.7B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1,7 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se aplica sobre Qwen3-1.7B, un transformer decoder-only denso. El repositorio almacena los pesos del adaptador en safetensors y se carga mediante la libreria transformers con PEFT. No se documenta el rango del adaptador, las capas objetivo, el learning rate ni la composicion del dataset de entrenamiento.

El autor indica que el entrenamiento se ejecuto en contenedores GPU de Salad bajo una doctrina de "fail-closed receipted-training": recibos honestos de ejecucion, medicion del consumo energetico mediante NVML y Zeus con doble metrica, y prohibicion de contadores o timestamps fabricados. Se publican checkpoints intermedios en los pasos 50, 100, 150 y 200, ademas de un checkpoint final. No se especifica el numero de tokens de entrenamiento, si hubo RLHF, DPO o cualquier etapa de alineacion, ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-1.7B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el adaptador no las haya degradado; no se documenta ninguna evaluacion al respecto.
- Soporte de tool calling y function calling: no disponible en la documentacion del adaptador; depende de lo que conserve del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen3 es multilingue; el adaptador no declara cobertura adicional.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre adaptadores LoRA: el repositorio permite reproducir la carga del adaptador sobre Qwen3-1.7B con PEFT y comparar los checkpoints 50/100/150/200 para estudiar la evolucion del entrenamiento.
- Auditoria de procedencia y eficiencia energetica: los recibos de ejecucion y la medicion NVML/Zeus asociados al entrenamiento sirven como caso de estudio de trazabilidad en pipelines de entrenamiento distribuido.
- Experimentos de alineacion a bajo coste: al ser un adaptador de 0,6 GB sobre un modelo de 1,7 mil millones de parametros, se puede ajustar y evaluar en una unica GPU consumer para probar hipotesis de fine-tuning.
- Generacion de texto en ingles en entornos de prototipado: se puede desplegar con transformers y PEFT para tareas de generacion sencillas, siempre que se valide antes la calidad frente al modelo base.
- Base para comparativas de checkpoints intermedios: util en estudios sobre el punto optimo de parada en entrenamientos cortos (50 a 200 pasos).
- Docencia y formacion: ejemplo practico de empaquetado de un adaptador LoRA con licencia Apache 2.0 y metadatos de entrenamiento verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base Qwen3-1.7B en precision completa requiere del orden de 3,4 GB solo para pesos, y en cuantizacion de 4 bits alrededor de 1 GB, aunque estos valores no los documenta el autor.
- GPU recomendadas: no documentadas. Por tamano del modelo base, una GPU consumer con 8 GB o mas seria suficiente en cuantizacion, pero no hay confirmacion del autor.
- Compatibilidad con GPU consumer: probable por el tamano del modelo base (1,7 mil millones de parametros), sin validacion publicada.
- Opciones de despliegue: transformers con PEFT (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la conversion a GGUF de un adaptador LoRA requeriria pasos adicionales no descritos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salad-kamachikuna-r1 | Adaptador LoRA sobre 1,7 mil millones | no disponible | apache-2.0 | safetensors (PEFT) | Artefacto de entrenamiento candidato, sin benchmarks |
| Qwen/Qwen3-1.7B | 1,7 mil millones | no disponible en esta ficha | apache-2.0 | safetensors | Modelo base; referencia obligada para evaluar el adaptador |
| Adaptadores LoRA genericos sobre Qwen3-1.7B | Variable | Heredado del base | Segun autor | safetensors (PEFT) | Ecosistema amplio en Hugging Face; comparacion cuantitativa no disponible |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion numerica con alternativas.

## Limitaciones y advertencias

- El autor declara explicitamente que es un artefacto de entrenamiento en fase candidata y no un modelo de produccion; no deberia desplegarse sin validacion previa.
- Ausencia total de benchmarks: no hay evidencia publicada de que el adaptador mejore al Qwen3-1.7B base en ninguna tarea.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de uso ni validacion por parte de la comunidad.
- Idioma limitado al ingles segun la model card, aunque el modelo base sea multilingue.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos, contaminacion o riesgo de alucinacion introducidos por el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar tambien la licencia del modelo base Qwen3-1.7B y cumplir sus terminos.
- Los recibos de procedencia y las metricas energeticas residen en la organizacion SZLHOLDINGS de Hugging Face y no se incluyen en este repositorio; su verificacion requiere acceso a esa lane.
- Riesgo de sobreajuste o degradacion por un entrenamiento corto (hasta 200 pasos) sin datos de validacion publicados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SZLHOLDINGS/salad-kamachikuna-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion del autor: https://huggingface.co/SZLHOLDINGS
- Lane de recibos de entrenamiento (referenciada en la model card): SZLHOLDINGS/frontier-54-runs
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
