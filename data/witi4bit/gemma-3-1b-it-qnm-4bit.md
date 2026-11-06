# WiTi4Bit/gemma-3-1b-it-qnm-4bit

## Resumen

`WiTi4Bit/gemma-3-1b-it-qnm-4bit` es una cuantizacion de 4 bits del modelo instructivo `google/gemma-3-1b-it`, publicada por el usuario WiTi4Bit en Hugging Face. Se trata de un derivado comunitario, no oficial, que aplica una tecnica de cuantizacion (identificada en el nombre como "qnm") al checkpoint original de Google. El objetivo es reducir el peso en memoria del modelo para facilitar su despliegue en hardware modesto.

El modelo base, Gemma 3 1B Instruct, es un transformer decoder-only de la familia Gemma 3 de Google, disenado para generacion de texto y conversacion con un equilibrio entre calidad y eficiencia. Esta version cuantizada conserva la arquitectura `gemma3_text` y se distribuye en formato `safetensors` para su uso con la libreria `transformers`.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantizacion de un modelo pequeno (el safetensors declarado contiene 584.673.536 parametros, coherente con los ~1B del modelo base tras el proceso de cuantizacion/empaquetado), pensado para entornos donde el espacio y la VRAM son escasos. El repositorio esta restringido (gated) y no presenta descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`gemma3_text`) |
| Parametros totales | 584.673.536 (segun safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (tag `8-bit` presente en el repo; tecnica "qnm" segun el nombre) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `google/gemma-3-1b-it` es un transformer decoder-only de la familia Gemma 3, ajustado con instrucciones (variante `-it`). Esta version concreta aplica una cuantizacion de 4 bits sobre dicho checkpoint. No se dispone de informacion detallada sobre el algoritmo de cuantizacion "qnm" empleado, ni sobre calibracion, granularidad (por canal, por grupo) o si se preservan capas en mayor precision.

No hay informacion publicada sobre el proceso de entrenamiento del modelo base en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF/DPO). Tampoco se documentan innovaciones tecnicas adicionales en esta cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo instructivo base.
- Seguimiento de instrucciones (variante `-it`).
- Generacion de codigo y respuesta a preguntas, en la medida en que lo soporte el modelo base de 1B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados en el repo).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado rapido en local: al ser una cuantizacion de 4 bits de un modelo de ~1B, permite iterar en portatiles sin GPU dedicada o con GPU de gama baja, usando `transformers` con carga en CPU o CUDA.
- Despliegue en dispositivos con VRAM limitada: util para entornos edge, contenedores pequenos o instancias con poca memoria donde un checkpoint en fp16 no cabria.
- Generacion de texto auxiliar en pipelines: tareas de resumen corto, clasificacion o reescritura donde no se requiere un modelo grande y prima la latencia y el coste.
- Chatbot ligero de proposito general: conversacion multi-turno basica para demos o entornos de prueba, aceptando las limitaciones de un modelo de 1B.
- Evaluacion de tecnicas de cuantizacion: sirve como artefacto de comparacion frente al modelo base `google/gemma-3-1b-it` para medir degradacion por cuantizacion.
- Experimentacion academica y docencia: permite reproducir experimentos con Gemma 3 en hardware asequible y con requisitos de almacenamiento reducidos (repo de 0.6 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repo (0.6 GB) y la cuantizacion de 4 bits, la inferencia deberia caber en menos de 2 GB de VRAM, aunque no hay medicion publicada.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna (GTX 16xx, RTX 20xx/30xx/40xx) deberia poder alojarlo.
- Cabe en GPU consumer: previsiblemente si, dado el tamano reducido del checkpoint, aunque no hay confirmacion oficial.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag presente), y potencialmente `llama.cpp`/`Ollama` si se genera un GGUF, aunque no se declara ese formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WiTi4Bit/gemma-3-1b-it-qnm-4bit | 584.673.536 (safetensors) | no disponible | gemma | safetensors | Cuantizacion 4 bits, repo gated |
| google/gemma-3-1b-it | ~1B (modelo base) | no disponible | gemma | safetensors | Checkpoint original en mayor precision |
| Otros derivados cuantizados de Gemma 3 1B | no disponible | no disponible | gemma | GGUF/safetensors | No se dispone de datos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto comunitario no oficial: no esta validado por Google ni por el equipo de Gemma.
- La cuantizacion de 4 bits puede degradar la calidad respecto al modelo base; no se documenta la magnitud de esa degradacion.
- El repositorio esta restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargarlo.
- La licencia `gemma` impone las Gemma Terms of Use, con restricciones de uso comercial y obligaciones de atribucion; conviene revisarlas antes de cualquier despliegue en produccion.
- No se declaran idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en escenarios multilingues o de contexto largo.
- Riesgo de alucinacion inherente a un modelo de ~1B, especialmente en tareas de razonamiento o conocimiento factual.
- No hay informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad del derivado cuantizado.
- El tag `8-bit` en el repo resulta contradictorio con el nombre "4bit"; conviene verificar la precision real de los pesos antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WiTi4Bit/gemma-3-1b-it-qnm-4bit
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Documentacion de Gemma 3: https://ai.google.dev/gemma/docs
