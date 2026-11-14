# Wybber/wybber-wi-base

## Resumen

Wybber-wi-base es una redistribucion tecnica del checkpoint Gemma 4 E2B-it de Google DeepMind, publicada por el usuario Wybber en Hugging Face. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una copia del GGUF cuantizado QAT UD-Q4_K_XL de Unsloth en la que unicamente se ha reordenado el tensor `per_layer_token_embd.weight`, desplazandolo al final del fichero (operacion que el autor denomina "pletail"). El objetivo declarado es facilitar la inferencia on-device con llama.cpp.

El modelo subyacente, Gemma 4 E2B-it, pertenece a la familia Gemma 4 de Google DeepMind y esta disenado para despliegue en dispositivos con recursos limitados. El checkpoint cuenta con 4.628.569.635 parametros totales segun los datos de safetensors, y se distribuye en un unico fichero GGUF de 2.620.370.976 bytes (unos 2,6 GB) con cuantizacion UD-Q4_K_XL entrenada con quantization-aware training (QAT) por Unsloth.

La relevancia de esta publicacion es limitada pero concreta: sirve como artefacto reproducible para quienes necesitan exactamente esa disposicion de tensores en llama.cpp. La licencia Apache 2.0 del modelo base se mantiene, y el autor documenta explicitamente la modificacion conforme a la seccion 4(b) de dicha licencia, incluyendo hashes SHA256 del fichero original y del resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E2B-it; no se detalla en la informacion proporcionada) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (QAT, unica cuantizacion publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `gemma-4-E2B-it-qat-UD-Q4_K_XL-pletail.gguf`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Gemma 4 E2B-it (tipo de transformer, atencion, capas, etc.). Lo que si se documenta con precision es el proceso de creacion de este artefacto: se parte del GGUF `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` publicado por Unsloth en el repositorio `unsloth/gemma-4-E2B-it-qat-GGUF` (revision `66a399f68ddd113b06dff02fca9523e55465d11d`, SHA256 `e531007218dfab990486a5de7676a6932d6ea8dea233d1f698d7c21cf8a16889`), que a su vez deriva del checkpoint oficial `google/gemma-4-E2B-it`.

La unica modificacion aplicada por Wybber es el reordenamiento del tensor `per_layer_token_embd.weight`, que se mueve al final del fichero. Segun la model card, la cabecera, todas las claves y valores de metadatos y los 541 tensores (nombre, forma, tipo y bytes) permanecen inalterados. No se ha reentrenado, recuantizado ni alterado ningun peso. La cuantizacion QAT y el checkpoint original son trabajo de los autores upstream (Google DeepMind y Unsloth), no del publicador de este repo.

## Capacidades

- Generacion de texto conversacional, heredada del checkpoint instruct `google/gemma-4-E2B-it`.
- Inferencia on-device mediante llama.cpp, gracias al formato GGUF y a la cuantizacion Q4.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- Capacidades especificas de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en llama.cpp con una disposicion de tensores concreta: el modelo esta pensado para escenarios donde se requiere el tensor `per_layer_token_embd.weight` al final del fichero, por ejemplo para ajustar el orden de carga en pipelines de inferencia personalizados.
- Prototipado local en equipos de sobremesa: con 2,6 GB en Q4_K_XL, el fichero cabe en memoria RAM y en GPUs de consumo, lo que permite probar el modelo base Gemma 4 E2B-it sin infraestructura dedicada.
- Reproducibilidad y auditoria: los hashes SHA256 del fichero origen y del resultante permiten verificar que la unica diferencia es el reordenamiento de tensores, util en entornos con requisitos de trazabilidad.
- Aplicaciones conversacionales ligeras: al derivar de un checkpoint `-it`, puede emplearse para asistentes de texto en local, siempre que se validen sus capacidades reales con pruebas propias.
- Integracion en herramientas compatibles con endpoints: el tag `endpoints_compatible` sugiere su uso en servidores de inferencia que exponen una API compatible, aunque no se detalla cuales.
- Base para experimentacion con cuantizaciones QAT: sirve como referencia para comparar el comportamiento del checkpoint UD-Q4_K_XL de Unsloth frente a otras variantes del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB solo para los pesos en Q4_K_XL; hay que anadir el espacio para el contexto KV y overhead del runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el fichero es compatible con GPUs de consumo con al menos 4 GB de VRAM efectiva, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del fichero, pero no se aporta una lista verificada.
- Opciones de despliegue: llama.cpp es el runtime objetivo declarado; el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints, sin mas detalle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wybber/wybber-wi-base | 4.628.569.635 | no disponible | UD-Q4_K_XL (GGUF) | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it | no disponible | no disponible | no disponible (checkpoint original) | Apache 2.0 | Hugging Face |
| unsloth/gemma-4-E2B-it-qat-GGUF | no disponible | no disponible | UD-Q4_K_XL (GGUF) | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de arquitectura, contexto ni rendimiento de alternativas de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo nuevo ni un ajuste fino: solo cambia el orden de un tensor en el fichero GGUF; cualquier mejora o diferencia de comportamiento respecto al original no esta documentada.
- La model card no aporta informacion sobre sesgos, idiomas, contexto, arquitectura ni capacidades; no debe asumirse nada que no este verificado.
- Riesgo de alucinacion: inherente al modelo base, no evaluado en esta publicacion.
- El repositorio no incluye fichero NOTICE del upstream; el autor indica que los repositorios originales tampoco lo traen.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los avisos de modificacion y atribucion conforme a la seccion 4(b).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por terceros.
- La fecha de creacion indicada (2026-11-14) es la que figura en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Wybber/wybber-wi-base
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it-qat-GGUF
