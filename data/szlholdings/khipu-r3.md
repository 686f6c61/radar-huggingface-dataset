# SZLHOLDINGS/khipu-r3

## Resumen

khipu-r3 es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a generacion de texto y conversacion. El repositorio combina dos artefactos: el adaptador LoRA propiamente dicho, que es el artefacto de referencia para todas las cifras de la model card, y un checkpoint completo fusionado en el directorio raiz (`model.safetensors` + `config.json`), generado mediante una fusion en CPU documentada en `merge_receipt.json`. El modelo suma 752.393.024 parametros segun los pesos en safetensors y ocupa 6,1 GB en el repositorio.

El modelo se presenta dentro de la familia denominada Amawta (linea C) y lleva el nombre quechua "Amawta r3" como identificador de visualizacion, propuesto en un registro de nombres externo (Chakana) y sin efecto sobre el identificador del repositorio. La model card es inusualmente explicita sobre el estado de la evidencia: declara estandares de benchmark como NOT RUN, marca el gate held-out como FAIL y senala huecos en la firma de recibos y en la vinculacion con el codigo fuente en GitHub. El propio autor indica que el modelo permanece "gated and unpromoted" mientras no se resuelva su condicion de abstencion restringida.

La relevancia de esta ficha es fundamentalmente metodologica: se trata de un ajuste de bajo rango sobre un modelo pequeno (sub-1000M de parametros) con licencia Apache 2.0, util para experimentacion local, pero con un nivel de evidencia empirica muy limitado. Cualquier evaluacion de produccion debe partir de esa premisa y no de las cifras de la model card, que en su mayoria aparecen como no ejecutadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B); adaptador LoRA via PEFT |
| Parametros totales | 752.393.024 (pesos safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica adaptador LoRA y checkpoint fusionado en precision completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el nombre del modelo es quechua pero no se documenta soporte de ese idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA y checkpoint fusionado); config.json para carga con transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5, sobre el que se aplica un ajuste de bajo rango (LoRA) empaquetado con la libreria PEFT. El repositorio incluye, ademas del adaptador, un checkpoint completo resultante de fusionar el adaptador en el modelo base mediante un proceso de merge en CPU cuyo recibo (`merge_receipt.json`) esta presente en el repositorio. La model card advierte que el adaptador es el artefacto de referencia para todas las cifras y que los bytes fusionados no aportan ninguna afirmacion adicional ni cuentan con recibo held-out propio.

Sobre el entrenamiento, la evidencia disponible se limita a la existencia de un recibo de entrenamiento (`training_receipt.laptop-blackwell.json`), lo que sugiere que el ajuste se ejecuto en hardware de clase portatil con GPU Blackwell. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, modos de razonamiento extendido). El estado de evidencia declarado por el autor incluye LICENSE, BASE, TRAIN y EVAL como presentes, mientras que SIGNED y GITHUB figuran como GAP y HELD-OUT como FAIL.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-0.8B.
- Ajuste especifico de bajo rango sobre el modelo base, cuyo contenido y dominio no se detallan en la informacion disponible.
- Carga como adaptador PEFT sobre el modelo base o como checkpoint fusionado con transformers.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con PEFT en local: el adaptador puede cargarse sobre Qwen3.5-0.8B en una GPU de consumo para estudiar tecnicas de ajuste de bajo rango, dado su tamano reducido y su formato safetensors estandar.
- Evaluacion comparativa de merges: el repositorio incluye tanto el adaptador como el checkpoint fusionado, lo que permite contrastar el comportamiento de ambos artefactos en el mismo entorno y verificar la fidelidad del merge documentado en `merge_receipt.json`.
- Prototipado de asistentes conversacionales de baja latencia: con 752 millones de parametros, el modelo es apto para iteraciones rapidas en entornos de desarrollo antes de escalar a modelos mayores.
- Pruebas de integracion con transformers y PEFT: sirve como caso de prueba para pipelines de carga de adaptadores, validacion de configuraciones y gestion de artefactos en el Hub.
- Docencia e investigacion reproducible: la presencia de recibos de entrenamiento y evaluacion (aunque sin firma) permite ilustrar practicas de trazabilidad de artefactos en publicaciones de modelos.
- Filtrado previo en pipelines de generacion: por su tamano, puede emplearse como primer estadio en arquitecturas de cascada, reservando modelos mayores para los casos que superen un umbral de confianza.
- Analisis de riesgos de publicacion: util como caso de estudio de model cards con evidencia incompleta (benchmarks NOT RUN, gate held-out FAIL) para disenar politicas internas de admision de modelos.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los del model-index, correspondientes a un gate held-out propio y no a benchmarks estandar:

| Benchmark | Resultado | Notas |
|---|---|---|
| SZL canonical held-out gate (n=5) | pass rate 0,2 (1/5) | Metrica declarada por el autor, marcada como `verified: false`; muestra de solo 5 casos |
| MMLU-Pro | NOT RUN | Sin recibo asociado |
| GPQA-Diamond | NOT RUN | Sin recibo asociado |
| GSM8K | NOT RUN | Sin recibo asociado |

No se han publicado resultados de benchmarks estandar en la informacion disponible. La unica cifra existente (1/5 en un gate propio de cinco casos) tiene un intervalo de confianza tan amplio que no permite extraer conclusiones sobre la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo denso de 752 millones de parametros requiere aproximadamente 1,5 GB en FP16/BF16 para los pesos, a lo que hay que sumar cache KV y overhead del runtime; las cifras exactas dependen de la longitud de contexto, que no se documenta.
- GPU recomendadas: no especificadas por el autor. El recibo de entrenamiento hace referencia a hardware "laptop Blackwell", lo que indica que el ajuste se realizo en una GPU portatil de esa generacion.
- GPU de consumo: por tamano, el modelo cabe con holgura en GPUs de consumo con 8 GB o mas de VRAM en precision completa; en cuantizaciones de 4 bits cabria en GPUs con 4-6 GB, aunque el repositorio no publica variantes cuantizadas.
- Opciones de despliegue: transformers con PEFT para el adaptador; transformers para el checkpoint fusionado. No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| khipu-r3 | 752.393.024 | no disponible | apache-2.0 | Solo gate propio (1/5, no verificado); estandar NOT RUN | Publico en Hugging Face (333 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en la informacion proporcionada | no disponible | apache-2.0 (segun la model card de khipu-r3) | no disponible en la informacion proporcionada | Publico en Hugging Face |
| Alternativas de la misma categoria (adaptadores LoRA sobre modelos sub-1000M) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con el modelo base es la mas relevante: khipu-r3 es un ajuste de bajo rango sobre Qwen3.5-0.8B, de modo que cualquier diferencia de capacidad frente a este procede exclusivamente del adaptador, cuyo dominio de entrenamiento no se documenta. No se dispone de datos de benchmarks del modelo base en la informacion proporcionada, por lo que no es posible cuantificar la ganancia o perdida introducida por el ajuste.

## Limitaciones y advertencias

- Evidencia empirica insuficiente: el unico resultado publicado es un pass rate de 0,2 sobre cinco casos, marcado como no verificado, y los benchmarks estandar figuran como NOT RUN. No debe usarse para decisiones de produccion sin evaluacion propia.
- Gate held-out en estado FAIL segun la propia model card, con la advertencia explicita del autor de que el modelo permanece "gated and unpromoted" mientras no se resuelva su condicion de abstencion restringida.
- Recibos sin firma (SIGNED: GAP) y vinculacion con el codigo fuente incompleta (GITHUB: GAP, REPO_NAMED_NO_COMMIT), lo que limita la reproducibilidad del entrenamiento.
- Ambiguedad de artefacto: el repositorio contiene a la vez un adaptador LoRA y un checkpoint fusionado; el segundo no dispone de recibo held-out propio. Hay que elegir conscientemente cual se despliega.
- Idiomas no declarados: la model card no especifica lista de idiomas soportados; no debe asumirse soporte de quechua pese al nombre de visualizacion.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Riesgo de alucinacion y sesgos: no documentados por el autor; en un modelo de 752 millones de parametros el riesgo de alucinacion es estructuralmente alto en tareas de conocimiento factual.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base de forma independiente antes de un despliegue comercial.
- Nomenclatura confusa: el nombre quechua "Amawta r3" procede de un registro externo propuesto y no implica ninguna promocion ni cambio de estado del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-r3
- Revision citada en la model card: https://huggingface.co/SZLHOLDINGS/khipu-r3/tree/b584c62c6844d1dcd9097e780221939115d755b6
- Recibo de merge: https://huggingface.co/SZLHOLDINGS/khipu-r3/blob/b584c62c6844d1dcd9097e780221939115d755b6/merge_receipt.json
- Recibo de evaluacion: https://huggingface.co/SZLHOLDINGS/khipu-r3/blob/b584c62c6844d1dcd9097e780221939115d755b6/receipts/eval/khipu-r3-exact-bytes-eval-20261107.json
- Recibo de entrenamiento: https://huggingface.co/SZLHOLDINGS/khipu-r3/blob/b584c62c6844d1dcd9097e780221939115d755b6/training_receipt.laptop-blackwell.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Codigo fuente declarado: repositorio `szl-holdings/szl-forge` (sin commit fijado; no se proporciona URL verificable)
