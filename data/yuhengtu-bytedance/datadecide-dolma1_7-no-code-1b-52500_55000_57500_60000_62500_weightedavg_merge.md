# yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-52500_55000_57500_60000_62500_weightedavg_merge

## Resumen

DataDecide-dolma1_7-no-code-1B-52500_55000_57500_60000_62500_weightedavg_merge es un modelo de lenguaje de aproximadamente 1,28 mil millones de parametros publicado por el usuario yuhengtu-bytedance en HuggingFace. No se trata de un entrenamiento desde cero, sino de una fusion de pesos (weight merging) generada con la herramienta mergekit: combina cinco checkpoints intermedios de un mismo experimento de preentrenamiento (pasos 52500, 55000, 57500, 60000 y 62500) de una variante de 1B de la receta "dolma1_7-no-code", es decir, el corpus Dolma 1.7 con el subconjunto de codigo excluido.

La operacion aplicada es una media ponderada lineal con normalizacion de pesos, en la que los checkpoints mas avanzados del entrenamiento reciben mayor peso (1, 2, 3, 4 y 5 respectivamente, sobre el checkpoint del paso 62500 como base). El resultado se guarda en bfloat16 y conserva el mismo numero de parametros que cualquiera de los checkpoints originales, por lo que no hay cambio de arquitectura ni de tamano respecto a la familia de origen.

Su relevancia es principalmente de investigacion: sirve como pieza dentro del estudio de tecnicas de fusión de checkpoints (model soups) y de recetas de datos a escala de 1B parametros. No es un modelo instructivo ni alineado, no declara licencia ni idiomas soportados, y no presenta resultados de benchmarks publicados, por lo que debe tratarse como un artefacto experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Llama (segun los tags del repositorio: `llama`); la model card no detalla la arquitectura |
| Parametros totales | 1.279.854.592 (~1,28 B), segun los tensores safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados en el repositorio. Al ser un transformer estandar, es convertible a GGUF/AWQ/GPTQ con herramientas externas (no verificado por el autor) |
| Idiomas soportados | No disponible (el corpus Dolma 1.7 es mayoritariamente en ingles, pero el autor no lo declara) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16 en la salida de la fusion; el YAML usa `dtype: float32` y `out_dtype: bfloat16`) |
| Tamano del repositorio | 2,6 GB |
| Biblioteca declarada | transformers |
| Tipo de modelo | Fusion de checkpoints (mergekit, metodo Linear) |
| Fecha de creacion en HuggingFace | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este artefacto no define una arquitectura nueva ni un entrenamiento propio: es el resultado de un merge lineal (metodo `linear` de mergekit, referenciado al paper arXiv:2203.05482, "Model soups") sobre cinco checkpoints de un mismo run de preentrenamiento. El YAML publicado especifica `normalize: true`, de modo que los pesos declarados (1, 2, 3, 4 y 5) se reescalan para sumar 1; en la practica, los pesos efectivos son aproximadamente 0,0667 / 0,1333 / 0,2000 / 0,2667 / 0,3333, dando un tercio del peso al checkpoint final (paso 62500) y muy poco al mas temprano (paso 52500). El checkpoint del paso 62500 se usa ademas como `base_model`. Se trata, por tanto, de un promedio ponderado de interpolacion lineal de pesos, no de un ensemble ni de una destilacion.

Los checkpoints de origen pertenecen a la receta "dolma1_7-no-code" en escala 1B, es decir, un corpus derivado de Dolma 1.7 con el codigo excluido. Por el nombre, el experimento parece enmarcarse en el estudio DataDecide sobre recetas de datos de preentrenamiento, aunque la model card no confirma esta procedencia ni aporta ningun detalle sobre el numero de tokens vistos, la composicion exacta del dataset, la tokenizacion, la inicializacion, el uso de RLHF/DPO (no hay ninguno: son checkpoints de preentrenamiento) o hiperparametros de entrenamiento. La configuracion del merge si es completamente reproducible en su logica, pero las rutas de los checkpoints fuente son rutas locales absolutas de un entorno interno (`/opt/tiger/Pan_Safety_Better_Measurement/...`), no identificadores publicos, por lo que el merge no puede reproducirse tal cual con los artefactos disponibles en HuggingFace.

## Capacidades

- Generacion de texto autoregresiva, en la medida en que los checkpoints de origen son modelos de lenguaje preentrenados; no hay evaluacion publicada que lo cuantifique.
- No hay evidencia de ajuste por instrucciones, RLHF, DPO o cualquier forma de alineacion: es un modelo base.
- Soporte de tool calling / function calling: no disponible. No hay plantilla de chat, tokens especiales de herramienta ni documentacion al respecto.
- Soporte de agentes o razonamiento multi-paso: no disponible y poco probable en un modelo base de 1,28B sin post-entrenamiento.
- Capacidades multilingues: no declaradas. El corpus de origen (Dolma 1.7) es predominantemente ingles, por lo que cabe esperar un rendimiento muy inferior en castellano u otros idiomas, aunque esto no esta verificado por el autor.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles. Los tags no incluyen ninguna modalidad distinta de texto.
- Capacidad de fine-tuning: es la via de uso mas razonable, ya que se distribuyen pesos completos en safetensors compatibles con transformers.

## Casos de uso

- Investigacion sobre fusion de checkpoints: el modelo permite estudiar experimentalmente si una media ponderada de checkpoints intermedios (lineal con `normalize: true`) mejora o degrada la calidad frente a usar unicamente el checkpoint final del paso 62500, que aqui actua como base.
- Estudio de recetas de datos de preentrenamiento: sirve como punto de comparacion dentro de una linea de experimentos a escala 1B sobre variantes del corpus Dolma 1.7 (con y sin codigo), donde el objetivo es relacionar la composicion del dataset con el rendimiento final.
- Punto de partida para fine-tuning especifico de dominio: al ser pesos completos y ligeros (~1,28B), se puede ajustar en una unica GPU consumer para tareas como clasificacion de texto, resumen extractivo o generacion asistida en un dominio acotado.
- Prototipado de inferencia local: con cuantizacion de 4 bits ocupa menos de 1 GB de pesos, por lo que es viable en portatiles y equipos sin GPU dedicada, util para validar pipelines antes de escalar a modelos mayores.
- Evaluacion comparativa de tecnicas de merge: al existir multiples variantes con el mismo esquema de nombres (diferentes pasos y metodos de merge), puede usarse como baseline en estudios sobre model soups, TIES, DARE o SLERP.
- Generacion de texto no critica en lotes: tareas de etiquetado automatico, generacion de borradores o aumento de datos donde los errores se filtran posteriormente con revision humana.
- Benchmark de infraestructura: por su tamano, es adecuado para medir throughput y latencia de servidores de inferencia (vLLM, TGI, llama.cpp) y para pruebas de conversion de safetensors a GGUF.
- Docencia y divulgacion: ilustra de forma reproducible que es una media ponderada de pesos y como se declara en un YAML de mergekit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, ARC, HellaSwag ni similares), y las busquedas web realizadas no devolvieron ninguna referencia al modelo. Tampoco se puede inferir el rendimiento a partir de los checkpoints de origen, ya que el autor no publica sus metricas.

## Requisitos de hardware

- VRAM estimada para los pesos (1,28B parametros, sin contar overhead de activaciones ni cache KV):
  - bfloat16 / float16: ~2,6 GB de pesos; en la practica ~4 GB de VRAM con contexto corto.
  - float32: ~5,1 GB de pesos; ~6-7 GB con overhead.
  - int8: ~1,3 GB; ~2 GB con overhead.
  - GGUF Q4_K_M (~4,5 bits por parametro): ~0,75 GB; ~1,5 GB con contexto moderado.
- GPU recomendadas: cualquier GPU moderna con 6 GB o mas para cuantizacion de 4-8 bits (RTX 3060, RTX 4060, RTX 2070). Para bf16 nativo, 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti). GPU de datacenter (A100, H100) solo tienen sentido para servir muchas peticiones concurrentes, no por requisito de memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 6-8 GB, e incluso en CPU con cuantizacion Q4.
- Opciones de despliegue: transformers (biblioteca declarada), text-generation-inference y endpoints compatibles (aparecen en los tags), vLLM para servicio en bf16, llama.cpp/Ollama/LM Studio previa conversion a GGUF (no se publica GGUF en el repositorio). El repositorio no incluye tokenizador propio mas alla de los ficheros estandar de transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia orientativa (no medida) para un transformer denso de 1,28B en bf16 sobre una GPU consumer de gama alta, cabria esperar decenas o cientos de tokens por segundo en decodificacion con lote pequeno, y varios miles de tokens por segundo en prefill con lotes grandes.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus respectivas model cards publicas; los del modelo analizado, de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Post-entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| DataDecide-dolma1_7-no-code-1B weightedavg merge | ~1,28 B | No disponible | No disponible | Ninguno (checkpoints de preentrenamiento fusionados) | HuggingFace, safetensors, 0 descargas |
| Llama 3.2 1B | ~1,24 B | 128 000 tokens | Llama 3.2 Community License | Base e instruct (con RLHF) | Muy extendida, ecosistema amplio |
| Qwen2.5 1.5B | ~1,54 B | 32 768 tokens | Apache 2.0 | Base e instruct | Muy extendida, multiples cuantizaciones |
| SmolLM2 1.7B | ~1,7 B | 8 192 tokens | Apache 2.0 | Base e instruct | Extendida, cuantizaciones GGUF oficiales |
| TinyLlama 1.1B | ~1,1 B | 2 048 tokens | Apache 2.0 | Base e instruct (chat) | Extendida, orientada a divulgacion |

Frente a estas alternativas, el modelo analizado no aporta ventajas declaradas de contexto, licencia o calidad: su interes es haber sido producido mediante una fusion controlada de checkpoints de un mismo run, lo que lo hace util como objeto de estudio mas que como sustituto de un modelo instructivo de proposito general.

## Limitaciones y advertencias

- Ausencia total de post-entrenamiento: no es un modelo instructivo ni esta alineado; no cabe esperar que siga instrucciones, respete formatos de chat ni rechace peticiones daninas.
- Licencia no declarada: al no especificarse licencia, el uso comercial es juridicamente arriesgado. Ademas, el modelo deriva de checkpoints entrenados sobre Dolma 1.7, cuyas condiciones de uso deben verificarse por separado.
- Sin resultados de benchmarks: no hay ninguna evidencia publicada de calidad, por lo que cualquier afirmacion de rendimiento seria especulativa.
- Idiomas no declarados: es probable un rendimiento pobre fuera del ingles, dado el corpus de origen, aunque no esta confirmado.
- Contexto no declarado: no se puede planificar un caso de uso que dependa de ventanas largas sin medirlo previamente.
- Riesgo de alucinacion elevado: es un modelo base de ~1,28B sin ajuste; la generacion puede contener afirmaciones plausibles pero falsas, especialmente fuera de temas frecuentes en el corpus.
- Sesgos del corpus: al derivar de Dolma 1.7, hereda los sesgos de sus fuentes (contenido web rastreado), sin ningun filtro posterior documentado.
- No reproducibilidad del merge: las rutas de los checkpoints fuente son locales y no publicas; no se pueden regenerar los pesos a partir del repositorio.
- Merges de este tipo pueden degradar capacidades: la media ponderada no garantiza mejorar al checkpoint final (paso 62500), y puede diluir caracteristicas aprendidas en fases tardias del entrenamiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y ninguna referencia encontrada en busquedas web; no hay informes independientes de comportamiento.
- Fecha de publicacion inusual (2026-09-17 en los metadatos de HuggingFace): conviene verificar la autenticidad y procedencia del artefacto antes de integrarlo en cualquier flujo.
- Para produccion se recomienda tratar los pesos con el mismo nivel de escrutinio que un checkpoint sin publicar: evaluacion propia de sesgos, seguridad y calidad antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-52500_55000_57500_60000_62500_weightedavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del metodo Linear / model soups: https://arxiv.org/abs/2203.05482
- Las busquedas web realizadas no devolvieron ningun enlace relevante sobre este modelo (unicamente resultados de servicios de rastreo de paquetes y bases de datos de codigos de barras, sin relacion con el artefacto).
