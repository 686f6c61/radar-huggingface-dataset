# yonlyyone/Inkling-2-Mini-g13-q4-affine-fp16

## Resumen

Inkling-2-Mini-g13-q4-affine-fp16 es una compilacion cuantizada en formato MLX del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario yonlyyone. El artefacto esta pensado para ejecutar inferencia en GPUs de Apple Silicon (familias M1, M2 y M3) mediante la herramienta `g13`, un motor de conversion y servicio desarrollado por el mismo autor. El modelo conserva la arquitectura y los pesos del modelo original, pero se ha reconvertido a un esquema de cuantizacion de 4 bits con escalas afines y una capa de precision FP16, lo que reduce el peso del repositorio a 16,1 GB frente a los aproximadamente 26.388.641.280 parametros totales del modelo en precision completa.

El modelo base, Inkling-2-Mini, pertenece a Thinking Machines y esta publicado bajo licencia Apache 2.0. La ficha del artefacto cuantizado no documenta el pipeline, los idiomas soportados ni los datos de entrenamiento del modelo original; toda la informacion tecnica disponible se limita a los metadatos de Hugging Face y a la model card del autor de la conversion. Esto hace que la ficha deba leerse como una descripcion del artefacto de despliegue, no del modelo fundacional.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de aproximadamente 26.400 millones de parametros en equipos Apple Silicon con 16-24 GB de memoria unificada, algo que en FP16 requeriria del orden de 52 GB solo para los pesos. La contrapartida es que se trata de una conversion de terceros, sin benchmarks publicados ni garantias de fidelidad numerica frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, segun convencion; no confirmado en la informacion) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con escalas afines (`q4-affine`) y capa FP16 (`fp16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Inkling-2-Mini: no se especifica si es un transformer denso, un modelo de mezcla de expertos, un hibrido SSM ni el numero de capas, cabezas de atencion o dimension oculta. Lo unico confirmado es el recuento de parametros totales (26.388.641.280) y la presencia de un codificador de vision completo, con 422 tensores identificados bajo los prefijos `vision_tower.*` y el proyector asociado, lo que indica que el modelo base es multimodal (texto e imagen).

El artefacto en si no aporta informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni procesos de alineacion como RLHF o DPO. Tampoco documenta innovaciones de decodificacion especulativa, atencion lineal u otras tecnicas. La unica transformacion aplicada es la cuantizacion: el autor ha generado una build `q4-affine-fp16` con la herramienta `g13 convert`, que convierte los pesos a 4 bits con escalas afines y mantiene ciertas capas en FP16 para preservar precision. En Macs de 16-24 GB, la herramienta desactiva la vision por defecto para ahorrar unos 620 MiB de VRAM, lo que sugiere que el codificador visual es el componente mas costoso en memoria tras la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Inkling-2-Mini, aunque sin documentacion especifica en esta ficha.
- Vision: el repositorio incluye los pesos completos del codificador visual (`vision_tower.*`, 422 tensores) y el proyector, por lo que el modelo puede procesar imagenes si se activa con `g13 serve --vision on`.
- Soporte multimodal texto-imagen: confirmado por la presencia de los tensores de vision, aunque no se detallan tareas concretas (VQA, captioning, OCR).
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el artefacto permite cargar un modelo de ~26,4 mil millones de parametros en equipos de 16-24 GB gracias a la cuantizacion a 4 bits, algo inviable en FP16. Se usaria con `g13 serve --model yonlyyone/Inkling-2-Mini-g13-q4-affine-fp16` para prototipos y pruebas offline.
- Procesamiento de imagenes en local: activando la vision con `g13 serve --vision on`, el modelo puede recibir imagenes junto a texto, adecuado para tareas de descripcion, extraccion de informacion o asistencia visual sin enviar datos a la nube.
- Desarrollo y evaluacion de pipelines MLX: sirve como banco de pruebas para integraciones con el ecosistema MLX de Apple, validando conversiones, cuantizaciones y el motor `g13` antes de desplegar en produccion.
- Asistencia de escritura y generacion de texto en escritorio: con 26,4 mil millones de parametros, el modelo ofrece calidad de generacion superior a modelos pequenos, ejecutable en un portatil Apple Silicon sin GPU dedicada.
- Investigacion sobre cuantizacion: util para estudiar la degradacion de calidad entre FP16 y `q4-affine-fp16` en un modelo multimodal concreto, comparando salidas frente al modelo base.
- Prototipado de aplicaciones multimodales privadas: al ejecutarse integramente en local, encaja en escenarios con requisitos de privacidad (datos medicos, documentos internos) donde no se permite el envio a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 16,1 GB, por lo que se necesita al menos esa cantidad de memoria unificada mas overhead del runtime. En Macs de 16-24 GB, la herramienta desactiva la vision por defecto para ahorrar ~620 MiB.
- GPU recomendadas: Apple Silicon M1, M2 y M3 (la model card indica "FP16-tuned" para estas familias). No se documenta soporte para GPUs NVIDIA o AMD.
- Cabe en consumer GPU: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada, siempre que se acepte desactivar la vision en configuraciones de 16 GB.
- Opciones de despliegue: `g13 serve` (motor del autor, disponible en https://github.com/yonlyyone/g13-engine). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el formato es MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-g13-q4-affine-fp16 (este) | 26,4 B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Hugging Face, via `g13` |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B | no disponible | safetensors FP16 | Apache 2.0 | Hugging Face |
| Alternativas de ~27 B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada; la comparativa se limita al modelo base frente a su version cuantizada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad de generacion y, especialmente, la precision en tareas de vision o razonamiento numerico frente al modelo base en FP16.
- No se han publicado evaluaciones que cuantifiquen la perdida de rendimiento respecto al modelo original.
- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones de idioma del modelo base.
- El artefacto depende exclusivamente del motor `g13` y del ecosistema MLX; no es portable a otras pilas de inferencia sin reconversion.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversion no ofrece garantias sobre el artefacto; la responsabilidad sobre el modelo base recae en Thinking Machines.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni validacion externa.
- En equipos de 16 GB, la vision se desactiva por defecto; activarla puede provocar errores de memoria.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yonlyyone/Inkling-2-Mini-g13-q4-affine-fp16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor g13: https://github.com/yonlyyone/g13-engine
