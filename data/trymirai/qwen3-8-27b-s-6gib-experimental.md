# trymirai/Qwen3.8-27B-S-6GiB-experimental

## Resumen

Mirai's Qwen3.8-27B Small (6 GiB) es una cuantizacion experimental del modelo Qwen/Qwen3.8-27B, desarrollada por el equipo de Mirai Labs (usuario `trymirai` en Hugging Face). Su objetivo es comprimir un modelo de aproximadamente 27.000 millones de parametros en un fichero de pesos de menos de 6 GiB, lo que se traduce en unos 1,9 bits por peso, para permitir inferencia local eficiente en Apple silicon.

El checkpoint se ha construido con cuantizacion post-entrenamiento seguida de dos rondas de destilacion consciente de cuantizacion (quantization-aware distillation), utilizando un codec de trellis de estilo QTIP con rotaciones aleatorias de estructura de Kronecker para mitigar los valores atipicos de los pesos. El resultado son 6.365.063.968 parametros almacenados en safetensors, aunque el modelo base completo es considerablemente mayor.

La relevancia de esta ficha radica en que es un ejemplo de cuantizacion extrema (por debajo de 2 bits por peso) orientada a hardware de consumo, con una metrica de calidad explicita (divergencia KL de 0.2040674 y concordancia top-1 del 85,26% frente al profesor base). No obstante, es un artefacto experimental, con soporte limitado a un runtime propietario (`uzu`) y a macOS sobre Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 6.365.063.968 (pesos cuantizados almacenados); modelo base de ~27B |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit (codec trellis QTIP, 6/7/8 bits de transicion por grupo de cuatro pesos, ~1,9 bits/peso de media); embedding de entrada con code D4 de 2 bits; cabeza de salida con enteros de 3 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer de aproximadamente 27.000 millones de parametros del que no se detallan en la informacion proporcionada ni la composicion del dataset, ni el numero de tokens de entrenamiento, ni si hubo RLHF o DPO. La ficha del checkpoint cuantizado remite a la model card original para esos datos.

La innovacion tecnica de esta version reside en el proceso de cuantizacion: se emplea el mismo codec de trellis de estilo QTIP que la variante "Mirai Small", con 8, 7 o 6 bits de transicion por grupo de cuatro pesos, seleccionados matriz a matriz segun el coste medido, de forma que el fichero final queda por debajo de 6 GiB. Se aplican rotaciones aleatorias con estructura de Kronecker para reducir los valores atipicos de los pesos, el embedding de entrada usa un code lattice D4 de 2 bits y la cabeza de salida usa enteros de 3 bits. El pipeline completo es cuantizacion post-entrenamiento mas dos rondas de destilacion consciente de cuantizacion. Los pesos de vision, MTP y del especulador quedan excluidos del computo de tamano.

## Capacidades

- Generacion de texto: es la tarea declarada en el pipeline (`text-generation`).
- Razonamiento y conocimiento general: heredados del modelo base Qwen3.8-27B, aunque degradados por la cuantizacion agresiva (concordancia top-1 del 85,26% con el profesor).
- Soporte de tool calling / function calling: no confirmado para este checkpoint en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no las declara.
- Capacidades especiales: el modelo base incluye pesos de vision, MTP y especulador, pero estos no forman parte de este checkpoint cuantizado.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el caso de uso principal declarado por el autor; se instala con `brew install mirai` y se ejecuta con `mirai --model trymirai/Qwen3.8-27B-S-6GiB`, aprovechando que el fichero de pesos cabe en 6 GiB de memoria unificada.
- Prototipado offline en portatiles: permite probar un modelo de escala ~27B sin GPU dedicada ni conexion a servicios en la nube, util para experimentar con prompts y flujos antes de pasar a un despliegue mayor.
- Evaluacion de tecnicas de cuantizacion extrema: sirve como referencia practica para investigadores que estudien codecs trellis, rotaciones de Kronecker o destilacion consciente de cuantizacion, con metricas KL publicadas.
- Generacion de texto asistida en entornos con restricciones de memoria: adecuado para tareas de redaccion o resumen de baja exigencia donde el coste de memoria es el factor limitante.
- Educacion y demos: util para mostrar en talleres como un modelo grande puede ejecutarse en hardware de consumo mediante cuantizacion por debajo de 2 bits.
- Baseline para comparativas de calidad: la metrica de divergencia KL frente al profesor permite medir el impacto de otras tecnicas de compresion sobre el mismo modelo base.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Divergencia KL frente al profesor (romakl, 20 conversaciones, 14.456 tokens) | 0.2040674 |
| Concordancia top-1 con el profesor | 85,26% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: inferior a 6 GiB solo para los pesos; hay que sumar el overhead del runtime y la cache KV, cuyo tamano depende de la longitud de contexto (no disponible).
- GPU recomendadas: no se especifican GPU dedicadas; el autor declara soporte unicamente para Apple silicon.
- Compatibilidad con GPU de consumo: no confirmada para CUDA; el runtime `uzu` solo soporta Apple silicon segun la model card.
- Opciones de despliegue: CLI `mirai` (Homebrew) o compilacion desde el repositorio `uzu` de Mirai; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trymirai/Qwen3.8-27B-S-6GiB-experimental | 6.365.063.968 almacenados (~27B base) | no disponible | ~1,9 bits/peso | Apache 2.0 | Hugging Face, runtime `uzu` (Apple silicon) |
| Qwen/Qwen3.8-27B (modelo base) | ~27B | no disponible | pesos originales | Apache 2.0 | Hugging Face |
| Mirai Small (variante de referencia) | no disponible | no disponible | trellis QTIP con 8/7/6 bits de transicion | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de cuantizacion de otros proveedores.

## Limitaciones y advertencias

- Cuantizacion extrema: ~1,9 bits por peso implica una perdida medible de calidad; la concordancia top-1 con el profesor es del 85,26%, por lo que aproximadamente uno de cada siete tokens predichos difiere del modelo original.
- Caracter experimental: el nombre del checkpoint lo declara explicitamente; no debe considerarse una version estable para produccion.
- Soporte de plataforma limitado: solo Apple silicon mediante el runtime `uzu`; no hay soporte documentado para CUDA, ROCm ni CPU generica.
- Idiomas no declarados: no se puede asumir un comportamiento multilingue concreto sin evaluacion propia.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion; no hay evaluaciones de fidelidad publicadas para este checkpoint.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y las condiciones del runtime `uzu`, que es software independiente.
- Artefactos excluidos: vision, MTP y especulador no estan incluidos, por lo que no se deben esperar capacidades multimodales ni decodificacion especulativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-S-6GiB-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Repositorio del runtime uzu: https://github.com/trymirai/uzu
- Guia de ejecucion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Herramienta de evaluacion romakl: https://github.com/trymirai/romakl
- Runtime Prism (llama.cpp modificado): https://github.com/PrismML-Eng/llama.cpp
