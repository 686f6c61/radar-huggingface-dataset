# yasakani-dev/Inkling-2-Mini-YASAKANI-quality

## Resumen

Inkling-2-Mini-YASAKANI-quality es una conversión cuantizada del modelo Inkling-2 Mini de Thinking Machines Lab, publicada por el usuario yasakani-dev para su uso con el motor de inferencia YASAKANI (versión 0.3.1 o superior) en Windows sobre una GPU NVIDIA RTX con 24 GB o más de VRAM. No se trata de un modelo nuevo ni de un ajuste fino: los pesos originales se recuantizan para reducir el tamaño de los ficheros (de 19,5 GB a 15,05 GB) y se empaquetan en un formato propietario `.yskn` que el motor YASAKANI consume directamente, evitando al usuario tener que descargar el modelo original y convertirlo por su cuenta.

El modelo base es un transformer de tipo Mixture of Experts (la arquitectura declarada en el manifiesto es `inkling2`) con capacidades de texto y razonamiento, orientado a generación de texto conversacional y soporte de tool calling a través de una API compatible con OpenAI. La conversión conserva el tokenizador, la plantilla de chat y la configuración de generación del modelo original sin modificaciones, e incluye un drafter de decodificación especulativa almacenado en 4 bits.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para ejecutar un modelo de la familia Inkling-2 en hardware de consumo (una RTX 5090) bajo Windows; por otro, conviene subrayar que se trata de una publicación experimental, de un tercero no afiliado a Thinking Machines Lab, validada únicamente en una configuración concreta y con una fidelidad medida respecto al modelo original (KL de 0,0110 y 96,0 % de coincidencia en el token más probable), no con métricas de precisión en tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture of Experts (identificador `inkling2` en el manifiesto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor de referencia usado en las pruebas de memoria del autor) |
| Tipos de cuantizacion | NVFP4 (4 bits con escala de 8 bits por cada 16 valores y un factor por matriz) y MXFP8 (8 bits con exponente compartido por cada 32 valores); expertos de capas 0-19 en 4 bits, expertos de capas 20-23 repaquetados de 8 a 4 bits; router y tensores pequeños sin cambios |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | Apache-2.0 (sujeta además a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | `.yskn` propietario del motor YASAKANI (no safetensors ni GGUF); incluye `inkling_2_mini_quality.yskn` (15,05 GB) y `mtp_d4.yskn` (209,7 MB, drafter en 4 bits) |

## Arquitectura y entrenamiento

El modelo base, Inkling-2 Mini de Thinking Machines Lab (revisión `ed40e7da625f594fc9c4990f5f66be24873c22d7`, publicada el 20 de noviembre de 2026), es un transformer con mezcla de expertos según declara el manifiesto de la conversión. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información correspondería a la model card del modelo original, que se incluye en el repositorio como `SOURCE_MODEL_CARD.md` pero cuyo contenido no se reproduce en la información disponible.

La innovación técnica relevante de esta publicación no está en el entrenamiento, sino en el proceso de cuantización y en el motor de ejecución. La conversión se realizó con `tools/convert/inkling2_convert.py --scheme quality` de YASAKANI 0.3.1: las proyecciones de query, la puerta de salida de atención y la proyección de salida se almacenan en NVFP4; el resto de matrices densas y el embedding en MXFP8; los expertos de las capas 0 a 19 se mantienen en el formato publicado (4 bits) y los de las capas 20 a 23, publicados en 8 bits, se repaquetan a 4 bits. El router y los tensores pequeños (normalizaciones, convoluciones) quedan intactos. El drafter de decodificación especulativa se reescribe en NVFP4 para sus matrices mayores de 64 KB y su cabeza de salida plegada, mientras que el resto de tensores conserva el formato original. El motor YASAKANI multiplica las matrices de 4 y 8 bits directamente, sin decodificarlas antes, y utiliza únicamente los núcleos de propósito general de la GPU (sin tensor cores).

## Capacidades

- Generación de texto conversacional en inglés y japonés, con plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento con modo de pensamiento ("thinking") controlable mediante `/effort low` o el parámetro `reasoning_effort` en la API.
- Tool calling / function calling: la API compatible con OpenAI acepta los parámetros `tools` y `tool_choice`, y devuelve las llamadas en `tool_calls`.
- Decodificación especulativa mediante un drafter de 4 bits (`mtp_d4.yskn`), que acelera la generación sin alterar la salida (el modelo verifica cada conjetura y descarta las que no habría elegido).
- Servidor local con API compatible con OpenAI en `http://127.0.0.1:8765/v1`.
- Procesamiento de una sola petición a la vez (sin batching concurrente documentado).
- Capacidades de visión: no incluidas (la parte de imagen del modelo original no se distribuye en este repositorio).

## Casos de uso

- Asistente conversacional local en estación de trabajo Windows: con 15,3 GB de descarga y una RTX de 24 GB o más, el modelo se ejecuta íntegramente en local mediante `yasakani chat`, sin dependencia de servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Automatización de agentes con tool calling: el servidor `yasakani serve` expone una API compatible con OpenAI con soporte de `tools` y `tool_choice`, de modo que frameworks de agentes existentes pueden apuntar a `http://127.0.0.1:8765/v1` sin adaptadores adicionales.
- Procesamiento de documentos en inglés y japonés: el soporte nativo de ambos idiomas y la ventana de contexto de 32.768 tokens permiten resumir, extraer información o reescribir textos largos en estas dos lenguas.
- Generación de código asistida: la model card indica que las pruebas de fidelidad incluyeron ventanas de código, por lo que el modelo se ha validado parcialmente en ese dominio; puede integrarse en flujos de autocompletado o revisión local.
- Razonamiento con esfuerzo controlado: el parámetro `reasoning_effort` permite ajustar la profundidad de razonamiento según la tarea, útil en pipelines donde la latencia es crítica y conviene desactivar el modo thinking.
- Evaluación y experimentación con cuantización de bajo bit: el repositorio incluye `selfcheck.json` con los tokens greedy esperados y un `NOTICE` que documenta los cambios, lo que facilita reproducir la conversión y comparar la fidelidad frente al modelo original.
- Despliegue en hardware de consumo para prototipado: con 203,8 tokens/s sin drafter y 225,9 tokens/s con drafter en una RTX 5090, el modelo es viable para iteración rápida en desarrollo, aunque no para producción de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que la precisión en tareas no se midió.

Los únicos datos cuantitativos publicados son de fidelidad respecto al modelo original y de velocidad:

| Metrica | Valor |
|---|---|
| Divergencia KL frente al modelo publicado | 0,0110 (43 ventanas de texto, 14.024 posiciones evaluadas) |
| Coincidencia en el token más probable | 96,0 % |
| Throughput sin drafter (RTX 5090, Windows 11, YASAKANI 0.3.1) | 203,8 tokens/s |
| Throughput con drafter (`--draft auto`) | 225,9 tokens/s |
| Memoria asignada a contexto de 32.768 tokens (sin / con drafter) | 18,9 GB / 19,5 GB |

Las pruebas de velocidad usaron decodificación greedy, thinking desactivado, 256 tokens, media de 4 prompts, mediana de 3 ejecuciones y una petición a la vez.

## Requisitos de hardware

- VRAM: 18,9 GB sin drafter y 19,5 GB con drafter a contexto de 32.768 tokens; se recomienda una GPU con 24 GB o más.
- GPU recomendadas: NVIDIA RTX 5090 (única configuración probada por el autor); cualquier RTX con 24 GB o más debería ser suficiente según los requisitos declarados, aunque no se ha validado.
- GPU de consumo: sí cabe en tarjetas de 24 GB (por ejemplo, la familia RTX 4090/5090), siempre que se use el motor YASAKANI.
- Sistema operativo: Windows 11 (único entorno probado); no se documenta soporte para Linux.
- Motor de despliegue: exclusivamente YASAKANI 0.3.1 o superior; no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.yskn` es propietario.
- Latencia y throughput: 203,8 tokens/s sin drafter y 225,9 tokens/s con drafter en RTX 5090, una petición a la vez.
- El motor usa solo los núcleos de propósito general de la GPU (sin tensor cores), lo que limita el rendimiento frente a implementaciones que sí los aprovechan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Inkling-2-Mini-YASAKANI-quality (esta conversión) | no disponible | 32.768 tokens (referencia de pruebas) | `.yskn` | Apache-2.0 | Solo YASAKANI, Windows, 24 GB+ |
| thinkingmachines/Inkling-2-Mini (original) | no disponible | no disponible | no disponible (pesos publicados de 19,5 GB) | Apache-2.0 | Motor propio del autor original; requiere conversión para YASAKANI |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento en tareas del modelo original ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa más allá del tamaño de los pesos y del formato de despliegue.

## Limitaciones y advertencias

- Publicación experimental: el autor la marca como tal, con una sola petición simultánea y probada únicamente en una RTX 5090 bajo Windows 11.
- No es una versión oficial de Thinking Machines Lab ni está respaldada por ellos; es una conversión de un tercero.
- La licencia Apache-2.0 se mantiene, pero la Model Acceptable Use Policy de Thinking Machines se aplica también a esta versión modificada; debe leerse antes de cualquier uso.
- La fidelidad medida (KL 0,0110, 96,0 % de coincidencia en el token más probable) no equivale a precisión en tareas: no se han publicado evaluaciones de calidad funcional.
- Solo inglés y japonés; no hay soporte declarado de otros idiomas.
- Sin capacidades de visión: la parte de imagen del modelo original no se incluye.
- Formato propietario `.yskn`: no es compatible con safetensors, GGUF ni con motores estándar como vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad y la integración en infraestructura existente.
- El rendimiento depende de un motor que no usa tensor cores, por lo que el throughput es inferior al que cabría esperar del mismo hardware con implementaciones optimizadas.
- Riesgo de alucinación: no evaluado en la información disponible; debe asumirse el comportamiento típico de un modelo generativo sin verificación factual.
- Sesgos: no documentados en la información disponible.
- El repositorio no incluye resultados de benchmarks de tareas, por lo que la idoneidad para producción debe validarse con pruebas propias.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/yasakani-dev/Inkling-2-Mini-YASAKANI-quality
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor YASAKANI: https://github.com/yasakani-dev/yasakani
- Guía de uso de Inkling-2 Mini en YASAKANI: https://github.com/yasakani-dev/yasakani#inkling-2-mini
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
- Documentación del formato `.yskn`: `docs/FORMAT.md` del repositorio YASAKANI (sección 10.6 para el drafter)
