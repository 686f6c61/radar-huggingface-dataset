# xCloudinfo/Qwen3.6-35B-A3B-Uncensored-xCloud

## Resumen

Qwen3.6-35B-A3B-Uncensored-xCloud es un derivado del modelo base Qwen/Qwen3.6-35B-A3B, publicado por xCloudinfo (云硕科技). Se trata de una version "abliterated" y "uncensored": en lugar de reentrenar el modelo, el autor ha aplicado una ablacion direccional (single-direction ablation) sobre los pesos del modelo original para reducir la tasa de rechazos excesivos ante peticiones que el modelo base declinaria. El resultado se distribuye en formato safetensors y conserva la licencia Apache 2.0 del modelo base.

Arquitectonicamente hereda la configuracion del Qwen3.6-35B-A3B: una mezcla de expertos (MoE) con 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi la denominacion A3B). La model card menciona explicitamente modulos de atencion lineal de tipo SSM (`out_proj`), lo que apunta a una arquitectura hibrida, ademas de los expertos MoE (`down_proj`) y expertos compartidos. El repositorio ocupa 140,4 GB y solo documenta los idiomas chino e ingles.

Su relevancia es acotada y muy especifica: es una pieza pensada para investigacion en seguridad, red teaming, estudios de moderacion de contenido y analisis del fenomeno de los rechazos excesivos, no como modelo de proposito general. Con 26 descargas y 0 likes en el momento de redactar esta ficha, se trata de un artefacto con validacion comunitaria practicamente nula, y el propio autor recomienda usar la version GGUF para inferencia en lugar de estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer con atencion lineal tipo SSM; etiqueta de arquitectura `qwen3_5_moe`, heredada del modelo base |
| Parametros totales | 35.107.181.936 (≈35,1 B) |
| Parametros activos | ≈3 B por token (designacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Este repositorio solo contiene safetensors; el autor remite a una version GGUF separada para inferencia, cuyos niveles concretos no se detallan en la informacion disponible |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 140,4 GB; la precision exacta de los pesos no se especifica) |

## Arquitectura y entrenamiento

El modelo no ha sido reentrenado. El autor aplica una ablacion de una unica direccion siguiendo el metodo de Arditi et al. (2024): se identifica una direccion en el espacio de activaciones asociada al comportamiento de rechazo y se proyecta fuera de los pesos, en lugar de ajustar el modelo con datos. La direccion se calcula evitando los segmentos de razonamiento (thinking) del modelo base, con el objetivo de no degradar la capacidad de razonamiento.

La intervencion cubre 121 matrices: `out_proj` de la atencion lineal tipo SSM, `down_proj` de los expertos MoE y de los expertos compartidos, limitandose a las que escriben en las residuales de la torre de texto. Al ser una ablacion dirigida, no hay RLHF, DPO ni ajuste supervisado adicional, y la calibracion de los pesos fuera de las direcciones eliminadas permanece como en el modelo base. El autor declara que en pruebas con 10 preguntas reservadas de dano grave, cuantizadas y ejecutadas con `llama-server`, se obtuvo una tasa de 0/10 rechazos, y que el chino tradicional y las capacidades generales no se degradaron.

## Capacidades

- Generacion de texto y dialogo conversacional de proposito general, heredadas del modelo base Qwen3.6-35B-A3B.
- Modo de razonamiento con segmento de "thinking" explicito, segun se deduce de la propia metodologia del autor, que evita esa seccion al calcular la direccion de ablacion.
- Reduccion medida de rechazos excesivos: el modelo deberia responder a peticiones que el modelo base declinaria por defecto.
- Soporte multilingue limitado a chino e ingles; no se documentan otras lenguas.
- Eficiencia de inferencia propia de una arquitectura MoE: ~3 B parametros activos por token frente a 35,1 B totales.
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es exclusivamente `text-generation`.

## Casos de uso

- Red teaming de sistemas de IA: el modelo sirve como generador de peticiones y respuestas adversarias para probar los filtros de seguridad de otros sistemas, aprovechando que su tasa de rechazo medida es deliberadamente baja.
- Investigacion en moderacion de contenido: permite estudiar que tipos de texto genera un modelo sin las direcciones de rechazo, y alimentar clasificadores de moderacion con ejemplos dificiles de obtener de modelos alineados de forma estandar.
- Investigacion academica sobre alineacion y abliteration: es un caso de estudio reproducible del metodo de Arditi et al. sobre una arquitectura MoE hibrida con atencion lineal, util para medir el impacto de la ablacion en calibracion, coherencia y capacidades generales.
- Analisis comparativo frente al modelo base: al compartir parametros, tokenizador y licencia con Qwen/Qwen3.6-35B-A3B, permite evaluaciones A/B sobre la unica variable modificada, el comportamiento de rechazo.
- Plataformas conversacionales en chino e ingles con requisitos de minima friccion: asistentes de escritura creativa o de rol donde los rechazos por defecto resultan disfuncionales, siempre que el operador aplique su propia capa de moderacion.
- Fine-tuning posterior como punto de partida: al ser un derivado sin reentrenamiento y con licencia Apache 2.0, puede servir de base para ajustes especificos donde se quiera partir de un modelo con menos sesgo de rechazo.
- Despliegue local mediante GGUF: el propio autor recomienda la version GGUF para inferencia, lo que permite ejecutar el modelo en hardware de una sola maquina con cuantizacion agresiva, dado el tamano del repositorio safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una prueba interna de rechazo sobre 10 preguntas reservadas de contenido gravemente danino, evaluadas en version cuantizada con `llama-server`:

| Prueba | Metrica | Resultado reportado | Fuente |
|---|---|---|---|
| Conjunto reservado de 10 preguntas de dano grave | Tasa de rechazo | 0/10 | Model card del autor |
| Chino tradicional y capacidades generales | Degradacion percibida | Sin degradacion declarada | Model card del autor |

Estos datos son autodeclarados, no han sido replicados de forma independiente y la muestra de 10 elementos no permite extraer conclusiones estadisticas. No hay datos de MMLU, GSM8K, HumanEval ni de evaluaciones de seguridad estandarizadas.

## Requisitos de hardware

- Pesos en safetensors: el repositorio ocupa 140,4 GB, lo que exige almacenamiento y memoria muy por encima de una GPU de consumo para cargar el modelo completo tal cual.
- Inferencia en precision nativa: por encima de 70 GB de pesos en bf16/fp16 (estimacion a partir de 35,1 B parametros), por lo que se requiere una GPU de 80 GB (H100, A100 80 GB) o varias GPUs. En el caso improbable de que los safetensors esten en 32 bits, la estimacion se situa en torno a 140 GB y obligaria a 2x H100 80 GB como minimo.
- Cuantizacion en 8 bits: aproximadamente 35 GB de pesos (estimacion), viable en A100 40 GB, A6000 48 GB o 2x RTX 4090.
- Cuantizacion de 4 bits (Q4_K_M y similares via GGUF): aproximadamente 20-22 GB (estimacion), lo que en principio cabe en una RTX 4090 o RTX 3090 de 24 GB, con poca holgura para cache KV segun la longitud de contexto.
- GPU recomendadas: H100 80 GB o A100 80 GB para precision completa; A6000 48 GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 para cuantizaciones de 4 bits.
- Opciones de despliegue: `llama.cpp` / `llama-server` es la ruta confirmada por el autor a traves de la version GGUF. No se confirma soporte en vLLM, TGI o SGLang para los pesos safetensors, dado que la etiqueta de arquitectura `qwen3_5_moe` puede requerir versiones recientes de esos motores.
- Latencia y throughput: no disponibles como medida publicada. Como referencia estructural, al activar solo ~3 B parametros por token, el coste computacional por token es el de un modelo de ese orden, mientras que el requisito de memoria corresponde a un modelo de 35,1 B; el cuello de botella esperable es el ancho de banda de memoria, no el calculo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-xCloud | 35,1 B totales / ~3 B activos | no disponible | zh, en | Apache 2.0 | Derivado abliterated, sin reentrenamiento, safetensors de 140,4 GB |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,1 B totales / ~3 B activos | no disponible | zh, en | Apache 2.0 | Mismo peso y tokenizador; comportamiento de rechazo estandar y sin ablacionar |
| xCloudinfo/Qwen3.6-35B-A3B-Uncensored-GGUF | mismo modelo, formato GGUF | no disponible | zh, en | Apache 2.0 | Misma ablacion, formato de despliegue recomendado por el autor |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento cuantitativo de estas variantes entre si. La unica diferencia documentada entre este modelo y su base es la eliminacion de la direccion de rechazo en 121 matrices.

## Limitaciones y advertencias

- Sesgos y posicionamiento: la model card indica expresamente que la vision del mundo y las posturas del modelo se heredan del Qwen3.6 base, de origen chino, y que no estan dentro del alcance de la ablacion. La intervencion modifica el rechazo, no los sesgos.
- Alucinacion: la ablacion no mejora la veracidad. Al eliminar direcciones asociadas al rechazo, aumenta la probabilidad de que el modelo produzca contenido danino, falso o normativamente problematico sin senales de advertencia.
- Riesgo de dano: es un modelo disenado explicitamente para reducir negativas. El autor restringe su uso a fines legales (investigacion de seguridad, red teaming, moderacion de contenido, ambito academico) y declara que el usuario asume toda la responsabilidad legal y etica.
- Validacion limitada: la unica metrica publicada es autodeclarada, sobre 10 preguntas y en formato cuantizado. No hay replicacion independiente ni evaluacion estandarizada de seguridad.
- Adopcion marginal: 26 descargas y 0 likes en el momento de redactar la ficha; no hay evidencia de uso en produccion ni comunidad de soporte.
- Idiomas: solo se documentan chino e ingles. No hay garantia de comportamiento en castellano ni en otras lenguas.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia del modelo base. Las restricciones de uso adicionales que anade el autor en la model card no modifican la licencia, pero si senalan su postura sobre usos aceptables; conviene revisar la licencia del modelo base antes de explotarlo comercialmente.
- Empaquetado: el repositorio safetensors ocupa 140,4 GB, un peso de descarga considerable; el propio autor recomienda la version GGUF para inferencia.
- Inconsistencia de etiquetas: los tags declaran `qwen3.5-moe` mientras el modelo base indicado es Qwen/Qwen3.6-35B-A3B. No se aclara en la informacion disponible si se trata de un error de etiquetado o de una nomenclatura interna.
- Documentacion: la model card esta redactada en chino tradicional, sin version en ingles ni en castellano, lo que dificulta su evaluacion por parte de equipos que no lean chino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xCloudinfo/Qwen3.6-35B-A3B-Uncensored-xCloud
- Version GGUF recomendada por el autor: https://huggingface.co/xCloudinfo/Qwen3.6-35B-A3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper del metodo de ablacion direccional citado en la model card (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a articulos sobre el alfabeto latino y sus signos diacriticos, sin relacion con el modelo.
