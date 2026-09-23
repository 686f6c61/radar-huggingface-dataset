# zSaiko/Pantheon-Reasoning-26B-A4B-1.1-V2-APEX-GGUF

## Resumen

Pantheon-Reasoning-26B-A4B-1.1-V2-APEX-GGUF es un conjunto de cuantizaciones GGUF de precision mixta publicadas por el usuario zSaiko sobre el modelo Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos optimizada para inferencia local con llama.cpp: el repositorio aplica una matriz de importancia (imatrix) especifica de Pantheon y precision mixta por tensor, en lugar del esquema GGUF uniforme habitual.

El modelo base pertenece a la familia Gemma 4 y presenta una arquitectura de mezcla de expertos (MoE), segun la etiqueta `gemma4` y `moe` del repositorio. El recuento real de parametros declarado en el repositorio es de 25.971.339.550 (aproximadamente 26.000 millones), coherente con la nomenclatura "26B-A4B" del nombre, que sugeriria del orden de 4.000 millones de parametros activos por token, aunque este dato no se confirma explicitamente en la model card.

Su relevancia es practica: los modelos MoE de ~26B en BF16 requieren decenas de gigabytes de VRAM, mientras que estas cuantizaciones APEX reducen el peso a aproximadamente 5,89 BPW (variante iQuality) o 4,31 BPW (iCompact), con una penalizacion de fidelidad medida frente a los logits de referencia BF16. El modelo esta orientado a usos conversacionales, roleplay, razonamiento y escritura creativa, y esta declarado unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) de la familia Gemma 4, segun las etiquetas del repositorio; detalles concretos no disponibles |
| Parametros totales | 25.971.339.550 (aproximadamente 26B) |
| Parametros activos | No disponible de forma explicita; la nomenclatura "A4B" del nombre sugiere del orden de 4B activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de precision mixta por tensor (APEX): iQuality (~5,89 BPW), iQuality con LM head en Q8_0, iCompact (~4,31 BPW); el sufijo de tipo de quant del nombre de fichero es una clase aproximada de tamano, no una descripcion de todos los tensores |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 184,1 GB (conjunto completo de variantes) |
| Modelo base | Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 (relacion: quantized) |
| Libreria | gguf |
| Tarea | text-generation |
| Descargas / likes | 36 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: cuantiza el modelo base Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, que segun sus etiquetas corresponde a la familia Gemma 4 con arquitectura de mezcla de expertos (MoE). Toda la informacion sobre la arquitectura interna (numero de expertos, dimension de capas, mecanismo de atencion, contexto nativo), la composicion del dataset de entrenamiento, el volumen de tokens y las fases de ajuste (SFT, RLHF, DPO) remite a la model card del modelo original, que no forma parte de la informacion proporcionada.

La innovacion tecnica de esta publicacion es el metodo APEX de cuantizacion: en lugar de aplicar un unico tipo de quant a todos los tensores, se asigna una precision distinta por tensor y se usa una matriz de importancia especifica del modelo para guiar la asignacion. La metodologia y la configuracion derivan del trabajo de EmanuelOverride sobre cuantizacion APEX GGUF para Gemma 4. La model card advierte ademas de una particularidad del modelo base: algunas dimensiones de tensor son incompatibles con ciertos formatos K-quant, en concreto `ffn_down_exps.weight` con una dimension de 704, por lo que llama.cpp aplica formatos alternativos compatibles (por ejemplo, `IQ4_XS` solicitado se almacena como `IQ4_NL`, `Q5_K` como `Q5_1` y `Q6_K` como `Q8_0`).

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en roleplay y escritura creativa.
- Razonamiento y resolucion de problemas, segun la etiqueta `reasoning` del repositorio.
- Generacion de codigo: no declarada de forma explicita en las etiquetas ni en la model card.
- Matematicas: no declarada de forma explicita.
- Vision y audio: no declarados; no hay ninguna etiqueta ni referencia multimodal en el repositorio.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona explicitamente).
- Capacidades multilingues: limitadas al ingles segun el campo `language: en` del repositorio.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidad destacable: compatibilidad con llama.cpp y con endpoints compatibles, lo que permite servir el modelo mediante esa ruta de inferencia.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede ejecutarse en una estacion de trabajo con una sola GPU de gama alta usando la variante iCompact (~4,31 BPW), lo que permite desplegar un MoE de ~26B sin infraestructura de servidor.
- Roleplay y narrativa interactiva: las etiquetas `roleplay` y `creative-writing` indican que el modelo y su ajuste estan orientados a mantener personajes y estilo a lo largo de conversaciones multi-turno.
- Generacion creativa asistida: redaccion de ficcion, dialogos y material de worldbuilding con la variante iQuality cuando la fidelidad frente al modelo BF16 es prioritaria.
- Evaluacion comparativa de cuantizaciones: la tabla de fidelidad KLD publicada permite usar este repositorio como referencia metodologica para medir el coste de cuantizar modelos MoE de ~26B.
- Prototipado de producto sobre llama.cpp: investigadores que quieran evaluar el comportamiento del modelo base antes de invertir en servir los pesos BF16 pueden usar los GGUF como paso intermedio.
- Experimentacion de precisión del LM head: la variante "iQuality — Q8 LM Head" permite estudiar el impacto de la precision de `output.weight` en la distribucion de salida (mejora de 0,861731 a 0,856834 de KLD medio en la medicion publicada).
- Despliegue en entornos con VRAM limitada: la variante iCompact permite encajar el modelo en GPU de 16 GB o menos, asumiendo la perdida de fidelidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion incluido es un benchmark de fidelidad de la cuantizacion, medido contra los logits de referencia en BF16 sobre WikiText-2 con llama.cpp, 128 fragmentos de 512 tokens (32.640 posiciones de siguiente token evaluadas):

| Variante | KLD medio | Mismo token en top-1 | RMS delta p |
|---|---|---|---|
| APEX iQuality | 0,861731 | 72,387 % | 8,638 % |
| APEX iQuality — Q8 LM Head | 0,856834 | 72,540 % | 8,636 % |
| APEX iCompact | 1,386163 | 61,759 % | 11,638 % |

Segun la model card, el experimento con el LM head en Q8_0 produjo solo una mejora agregada pequena respecto a la variante iQuality estandar. No hay datos de rendimiento del modelo base (razonamiento, codigo, matematicas) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir del recuento de parametros y del BPW declarado; no incluye cache KV ni overhead del runtime):
  - APEX iQuality (~5,89 BPW): aproximadamente 19,1 GB.
  - APEX iQuality con LM head Q8_0: ligeramente superior a 19,1 GB.
  - APEX iCompact (~4,31 BPW): aproximadamente 14,0 GB.
- GPU recomendadas: no disponible en la model card. Por tamano de pesos, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) serian suficientes para iQuality en lo que respecta a los pesos; una GPU de 16 GB podria alojar iCompact, siempre que el contexto no sea largo y se descarguen capas a CPU si fuera necesario.
- Cabe en GPU de consumo: si, con reservas. La variante iCompact (~14 GB de pesos) encaja en GPUs de 16 GB, y la iQuality (~19,1 GB) en GPUs de 24 GB, en ambos casos con margen dependiente de la longitud de contexto y del tamano de la cache KV, que no se especifica.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio) y cualquier runtime o servidor compatible con GGUF; el repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo. Al ser una arquitectura MoE, el coste de computo por token deberia ser notablemente inferior al de un modelo denso de 26B, pero esto es una inferencia a partir de la arquitectura y no un dato medido.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La comparacion posible se limita a las tres variantes del propio repositorio y al modelo base sin cuantizar:

| Modelo / variante | Parametros | BPW | KLD medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APEX iQuality | ~26B (MoE) | ~5,89 | 0,861731 | apache-2.0 | GGUF en este repositorio |
| APEX iQuality — Q8 LM Head | ~26B (MoE) | ~5,89+ | 0,856834 | apache-2.0 | GGUF en este repositorio |
| APEX iCompact | ~26B (MoE) | ~4,31 | 1,386163 | apache-2.0 | GGUF en este repositorio |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 (BF16) | ~26B (MoE) | 16 | referencia (0) | no disponible | no disponible |

No hay informacion sobre otras cuantizaciones GGUF del mismo modelo base ni sobre alternativas de otros autores.

## Limitaciones y advertencias

- Idiomas: el modelo esta declarado unicamente para ingles. No hay evidencia de soporte solido de castellano ni de otros idiomas.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de veracidad ni de tasas de alucinacion para este modelo ni para su base.
- Sesgos conocidos: no documentados en la informacion disponible. Al ser un ajuste orientado a roleplay y escritura creativa, es esperable reproducir los sesgos del corpus del modelo base, pero no hay datos que lo confirmen aqui.
- Perdida de fidelidad por cuantizacion: incluso la mejor variante degrada la distribucion de salida frente a BF16 (KLD medio 0,856834-0,861731; aproximadamente un 27-28 % de posiciones con un top-1 distinto al de referencia). La variante iCompact es claramente mas agresiva (KLD 1,386163; un 38,2 % de top-1 distinto).
- Formatos de tensor degradados: en Gemma 4, `ffn_down_exps.weight` tiene una dimension de 704, lo que obliga a llama.cpp a sustituir algunos formatos K-quant solicitados por alternativas compatibles. Esto significa que los tipos indicados en el nombre del fichero no describen necesariamente todos los tensores.
- Sin datos de rendimiento de tarea: no hay MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento, por lo que no es posible estimar la calidad funcional del modelo base a partir de este repositorio.
- Popularidad muy baja: 36 descargas y 0 likes en el momento de la consulta, con un repo creado y actualizado el mismo dia (23 de septiembre de 2026). No hay validacion de la comunidad.
- Licencia: apache-2.0 en este repositorio de cuantizaciones, pero conviene verificar la licencia del modelo base Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 antes de un uso comercial, ya que no se incluye en la informacion disponible.
- Uso en produccion: la variante iQuality requiere alrededor de 19 GB solo para pesos, mas cache KV y overhead; el dimensionado real de VRAM para contextos largos no esta documentado.
- Fecha de publicacion inusual: los metadatos indican septiembre de 2026, posterior a lo esperable; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zSaiko/Pantheon-Reasoning-26B-A4B-1.1-V2-APEX-GGUF
- Modelo base: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Listado de modelos GGUF en HuggingFace (referencia de busqueda): https://huggingface.co/models?sort=modified&search=gguf
- Metodologia APEX GGUF para Gemma 4, atribuida a EmanuelOverride: no se proporciona enlace directo en la informacion disponible
- Paper, blog o demo adicionales: no disponibles
