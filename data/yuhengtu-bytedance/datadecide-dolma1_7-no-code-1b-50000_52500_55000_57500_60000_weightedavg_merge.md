# yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-50000_52500_55000_57500_60000_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de tipo transformer decoder-only, etiquetado como `llama` en HuggingFace, obtenido mediante una fusión lineal de pesos (merge) de cinco checkpoints de un mismo entrenamiento. El autor es la cuenta `yuhengtu-bytedance`, y el artefacto se publica con la librería `transformers` y pesos en `safetensors`. No es un modelo entrenado desde cero ni ajustado con instrucciones: es el resultado de promediar los pesos de los pasos 50000, 52500, 55000, 57500 y 60000 de una ejecución de preentrenamiento denominada `dolma1_7-no-code-1B`.

El nombre delata su origen: los checkpoints de partida proceden de un entrenamiento sobre Dolma 1.7 con el subconjunto de código eliminado (`no-code`), a escala de 1000 millones de parámetros (la nomenclatura `1B` del nombre, aunque el recuento real de parámetros en safetensors es de 1.279.854.592). El proyecto DataDecide, del que toma el nombre, se orienta a medir el impacto de decisiones de datos de preentrenamiento, por lo que estos modelos funcionan sobre todo como sujetos de experimentación más que como asistentes listos para producción.

Su relevancia ahora es metodológica: ilustra la técnica de *model soup* o promediado de checkpoints aplicada dentro de una única ejecución de entrenamiento, con ponderación creciente hacia los pasos finales. El resultado es un punto de control "suavizado" que puede servir como base para *fine-tuning*, como referencia en estudios de decaimiento del *learning rate* o como objeto de comparación frente a un checkpoint único. El repositorio no incluye model card descriptiva, licencia, idiomas declarados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama (etiqueta `llama` en el repositorio); clase esperada `LlamaForCausalLM` |
| Parametros totales | 1.279.854.592 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser un modelo Llama denso de ~1,3B admite las cuantizaciones habituales de llama.cpp (Q4_K_M, Q5_K_M, Q8_0) y de bitsandbytes (int8, nf4) previa conversion |
| Idiomas soportados | no disponible (el corpus Dolma 1.7 es mayoritariamente en ingles, pero el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors, con `torch_dtype`/`out_dtype` bfloat16 (el merge se calculo en float32) |
| Tamano del repositorio | 2,6 GB |
| Metodo de fusion | Linear (mergekit), `normalize: true` |
| Checkpoints fusionados | pasos 50000 (peso 1), 52500 (peso 2), 55000 (peso 3), 57500 (peso 4), 60000 (peso 5) |
| Modelo base declarado | paso 60000 de `dolma1_7-no-code` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo Llama, con normalizacion RMSNorm, activacion SwiGLU, atencion causal y, presumiblemente, embeddings rotatorios, aunque la model card no detalla la configuracion de capas, dimension oculta, cabezas de atencion ni tamano de vocabulario. Tampoco se especifica la longitud de contexto con la que se entreno. Lo unico verificable es el recuento de parametros (1.279.854.592) y la etiqueta de familia `llama`.

El proceso de creacion no es entrenamiento, sino interpolacion de pesos mediante `mergekit` con el metodo Linear, descrito en el articulo arXiv:2203.05482 (promediado de pesos, *model soups*). Se parte del checkpoint del paso 60000 como base y se combinan linealmente cinco checkpoints consecutivos de la misma ejecucion con pesos 1, 2, 3, 4 y 5 respectivamente. Con `normalize: true`, esos pesos se reescalan de forma que suman 15, lo que da una contribucion efectiva del 6,7 % al paso 50000, 13,3 % al 52500, 20 % al 55000, 26,7 % al 57500 y 33,3 % al 60000. En la practica, el resultado se aproxima a una media movil exponencial sesgada hacia el final del entrenamiento, un truco habitual para reducir el ruido de los ultimos pasos y estabilizar las metricas sin coste adicional de computo.

Los checkpoints de origen se entrenaron sobre Dolma 1.7 excluyendo el subconjunto de codigo, segun indica el propio nombre del directorio (`dolma1_7-no-code-1B`). No hay informacion en el repositorio sobre el numero total de tokens vistos, la composicion exacta del dataset, la presencia de fases de RLHF, DPO o SFT, ni sobre innovaciones tecnicas adicionales. Todo apunta a un modelo exclusivamente preentrenado, sin alineamiento posterior.

## Capacidades

- Generacion de texto autoregresiva: al ser un modelo base, su comportamiento esperado es la continuacion de texto, no el seguimiento de instrucciones.
- Razonamiento y conocimiento general: capacidad limitada y no medida; no hay benchmarks publicados.
- Codigo: el entrenamiento excluye explicitamente el subconjunto de codigo del corpus Dolma 1.7 (`no-code`), por lo que el rendimiento en tareas de programacion debe considerarse bajo y no esta cuantificado.
- Matematicas: no disponible; sin datos de evaluacion.
- Tool calling / function calling: no soportado de forma nativa; requeriria un ajuste especifico y no hay evidencia de que funcione.
- Agentes y razonamiento multi-paso: no soportado; un modelo base sin instrucciones no mantiene formatos de agente de forma fiable.
- Capacidades multilingues: no declaradas; el corpus de origen es mayoritariamente anglofono, por lo que el uso en castellano probablemente degradara la calidad.
- Capacidad especial (vision, audio, modo pensamiento): ninguna; no hay torre de vision, encoder de audio ni modo de razonamiento explicito.
- Usos realistas: servir como inicializacion para *fine-tuning*, como sujeto de experimentos de fusion de modelos y como referencia de evaluacion de recetas de datos.

## Casos de uso

- Punto de partida para *fine-tuning* supervisado: al ser un modelo base de 1,3B con pesos en safetensors y compatible con `transformers`, se puede ajustar con SFT sobre un dominio concreto (legal, medico, atencion al cliente) en una unica GPU de 24 GB usando LoRA o QLoRA, con un coste muy inferior al de partir de un modelo de 7B o superior.
- Investigacion sobre fusion de modelos: el repositorio documenta exactamente la configuracion YAML del merge, los pesos relativos y el checkpoint base, lo que lo convierte en un caso reproducible para estudiar como afecta el promediado lineal de checkpoints a la perplejidad y a las metricas posteriores al decaimiento del *learning rate*.
- Reproduccion de experimentos de decisiones de datos (DataDecide): sirve como uno de los puntos de comparacion en estudios que miden como distintas mezclas y filtrados del corpus Dolma afectan al rendimiento final de un modelo de escala 1B.
- Evaluacion del efecto `no-code`: permite medir, junto con los checkpoints originales, en que tareas (razonamiento, conocimiento factual, generacion de codigo) penaliza realmente excluir el subconjunto de codigo del preentrenamiento.
- Generacion de texto de bajo coste en local: con cuantizacion de 4 bits ocupa menos de 1 GB en disco, por lo que puede ejecutarse en CPU o en GPUs de gama de entrada para tareas de autocompletado, generacion de borradores o etiquetado aproximado de texto en ingles.
- Destilacion o inicializacion de modelos mas pequenos: sus pesos pueden actuar como profesor o como inicializacion en experimentos de destilacion hacia arquitecturas de 100-300M de parametros.
- *Baseline* en pipelines de evaluacion interna: al ser un checkpoint intermedio de un entrenamiento controlado, es util como referencia reproducible en *harnesses* de evaluacion de perplejidad sobre subconjuntos de Dolma.
- Docencia y divulgacion: por su tamano reducido y su naturaleza de merge documentado, es un ejemplo didactico claro de interpolacion de pesos y de las diferencias entre un modelo base y uno alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion (MMLU, HellaSwag, ARC, GSM8K, HumanEval ni perplejidad), y la busqueda web asociada no devolvio resultados relevantes sobre este repositorio, que ademas registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 2,6 GB solo para los pesos, mas la cache KV y el *overhead* del runtime; en la practica, entre 3,5 y 5 GB segun la longitud de secuencia y el tamano de lote.
- VRAM estimada en float32: en torno a 5,1 GB de pesos, lo que eleva el total por encima de 6 GB.
- VRAM estimada con cuantizacion int8: aproximadamente 1,3-1,5 GB de pesos; con 4 bits, en torno a 0,8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas funciona sin problema (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 2070). Una RTX 4090 o una A100/H100 quedan sobredimensionadas para inferencia y solo se justifican para *fine-tuning* con lotes grandes o para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, de forma holgada. Incluso en 4-6 GB de VRAM (GTX 1660, RTX 3050, portatiles con GPU discreta) con cuantizacion de 4 bits. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `text-generation` (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM y TGI para servicio en GPU, y llama.cpp/Ollama tras convertir los pesos a GGUF. El repositorio solo publica safetensors, por lo que el GGUF habria que generarlo localmente con `convert_hf_to_gguf.py`.
- Latencia y throughput: no se han publicado mediciones para este modelo concreto. Como orden de magnitud orientativo, y no como dato verificado, un modelo denso de 1,3B en bfloat16 sobre una GPU de gama media suele generar del orden de decenas de tokens por segundo, y bastantes menos si se ejecuta en CPU.

## Comparativa con modelos similares

Los valores de la columna de comparacion proceden de la documentacion publica de cada modelo, no de la informacion proporcionada en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Alineamiento | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (merge DataDecide) | 1,28B | no disponible | no disponible | Ninguno (modelo base) | Repositorio HuggingFace con safetensors, 0 descargas |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Apache-2.0 | Base y variante chat | Muy extendido, con versiones GGUF de terceros |
| Llama 3.2 1B | 1,24B | 128k tokens | Licencia comunitaria Llama 3.2 | Base e instruct | Amplia distribucion y soporte en todos los runtimes |
| Qwen2.5 1.5B | 1,54B | 32k tokens | Apache-2.0 (segun variante) | Base e instruct | Amplia, con cuantizaciones oficiales |
| OLMo-1B | 1,18B | 2048 tokens | Apache-2.0 | Base e instruct | Repositorio abierto con datos y recetas publicadas |

Frente a estas alternativas, la diferencia principal no es de rendimiento (no hay datos que permitan compararlo), sino de proposito: aqui no hay alineamiento, ni licencia declarada, ni contexto documentado, ni comunidad que haya validado el artefacto. Como modelo base para experimentos es legitimo; como sustituto de un modelo instruct en produccion, no es comparable.

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no sigue instrucciones, no respeta formatos de chat y no tiene alineamiento de seguridad. Sin un ajuste posterior, no debe exponerse a usuarios finales.
- Riesgo alto de alucinacion y de generar contenido sesgado u ofensivo, dado que no ha pasado por RLHF, DPO ni filtros de seguridad posteriores al preentrenamiento.
- La licencia no esta declarada en el repositorio. Esto impide determinar si el uso comercial esta permitido y, ademas, la licencia del modelo base original (los checkpoints `dolma1_7-no-code`) tambien se desconoce aqui, lo que supone un riesgo legal real para cualquier despliegue en produccion.
- Idiomas no declarados. El corpus Dolma 1.7 es mayoritariamente en ingles, por lo que el rendimiento en castellano es incierto y previsiblemente bajo.
- Longitud de contexto no documentada; planificar cualquier caso de uso con contexto largo requiere medirla empiricamente antes.
- No hay ninguna evaluacion publicada. No se puede afirmar que la fusion haya mejorado al checkpoint del paso 60000; el promediado de pesos puede degradar alguna capacidad aunque mejore la metrica global.
- El proceso de fusion se realizo con rutas locales del entorno del autor (`/opt/tiger/...`) que no son accesibles publicamente, por lo que la receta completa no es reproducible sin los checkpoints originales.
- Repositorio sin descargas ni interacciones: no hay validacion externa, ni issues resueltos, ni garantia de mantenimiento.
- El nombre del repositorio es extremadamente largo y especifico, lo que dificulta su descubrimiento y su uso en scripts.
- La fecha de creacion registrada (2026) y la ausencia de documentacion adicional hacen recomendable verificar la procedencia antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-50000_52500_55000_57500_60000_weightedavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Articulo del metodo de fusion lineal (model soups): https://arxiv.org/abs/2203.05482
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o el proyecto DataDecide; los unicos enlaces adicionales presentes en la informacion son los que figuran en las etiquetas del repositorio (`mergekit` y `arxiv:2203.05482`), ya listados arriba.
