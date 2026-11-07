# zugquant/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantizacion GGUF publicada por el usuario zugquant sobre el fine-tune de DavidAU `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. No se trata de un modelo original, sino de una distribucion de pesos cuantizados (formatos regulares y MTP, con imatrix dual) de un fine-tune multi-etapa y multi-merge construido sobre una base de la familia Qwen 3.8 de 27B. El autor del fine-tune lo presenta como un modelo orientado a razonamiento, codigo y escritura creativa, con un bloque de pensamiento (thinking) reducido respecto al modelo base.

El modelo declara 26.895.998.464 parametros (aproximadamente 26,9B) en pesos safetensors, licencia Apache 2.0 y soporte de idiomas ingles y chino. Su propuesta principal es reducir el consumo de tokens de razonamiento entre la mitad y una decima parte, manteniendo la calidad de salida, mediante las tecnicas que el autor denomina COLD FUSION (GAIN + Unsloth) y Fable Fusion 711. El repositorio ocupa 389 GB por incluir multiples cuantizaciones del mismo modelo.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de fine-tune comunitario agresivo con afirmaciones de rendimiento muy llamativas; por otro, advierte de que las cifras publicadas (ARC-C 735, ARC-E 882) proceden unicamente de la model card del autor y no han sido verificadas de forma independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8), con modo thinking; detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP (Multi-Token Prediction), con imatrix dual (DI-MATRIX); se mencionan IQ4_XS y Q4KS, entre otras |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 389 GB); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.8 con 27B de parametros, segun los tags del repositorio (qwen3_8, qwen3_6, qwen3_5). El fine-tune se describe como multi-stage tune y multi-stage merge, construido sobre el modelo de DavidAU y entrenado con Unsloth. El autor menciona dos metodos propios: COLD FUSION, que combina un componente llamado GAIN con los entrenadores de Unsloth, y Fable Fusion 711. El metodo GAIN se describe como un sistema de programacion que modifica dinamicamente el entrenamiento por muestra en tiempo real durante el aprendizaje.

Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el numero de tokens de entrenamiento, la composicion exacta del corpus ni si hubo RLHF o DPO. El modelo incorpora tecnicas de abliteration/heretic (eliminacion de rechazos) y un modo thinking reformateado y acortado. La variante MTP anade decodificacion multi-token para acelerar la generacion. No hay informacion sobre atencion lineal, SSM ni innovaciones arquitectonicas mas alla de lo citado.

## Capacidades

- Generacion de texto general, razonamiento y resolucion de problemas, con modo thinking en tres modos de operacion segun el autor.
- Generacion de codigo (tag coder) y tareas de programacion.
- Escritura creativa, ficcion, narrativa y roleplaying, con enfasis declarado en detalle y generos variados.
- Procesamiento image-text-to-text segun el pipeline declarado, aunque no se detallan las capacidades de vision ni los formatos de imagen admitidos.
- Soporte multilingue limitado a ingles y chino.
- Tool calling / function calling: el autor afirma en la pestana community un rendimiento "el mas alto registrado", sin datos verificables en la informacion disponible.
- Capacidad de agentes y razonamiento multi-paso: no documentada de forma explicita; el modo thinking lo hace teoricamente viable.
- Modo thinking con reduccion de tokens de razonamiento (mediana aproximada de dos tercios menos) y salida de alta densidad informativa.
- Variante MTP para decodificacion especulativa/multi-token y mayor velocidad de generacion.

## Casos de uso

- Escritura creativa y ficcion: el modelo esta afinado especificamente para narrativa, dialogos y roleplaying, con un tono directo y detallado; adecuado para generar borradores de relatos, guiones o contenido de ficcion interactiva.
- Generacion de codigo en pipelines de desarrollo: el tag coder y el soporte declarado de tool calling permiten integrarlo en asistentes de IDE o revision de codigo, aunque la falta de benchmarks publicados de HumanEval obliga a validarlo antes en produccion.
- Razonamiento con presupuesto de tokens ajustado: al reducir el bloque de pensamiento entre la mitad y una decima parte, encaja en aplicaciones donde la latencia y el coste por token son criticos, como agentes conversacionales en tiempo real.
- Atencion al cliente automatizada: el soporte de conversacion multi-turno y los idiomas en/zh lo hacen util para soporte en ingles y chino; la longitud de contexto no esta documentada, por lo que hay que verificarla antes de desplegarlo con historiales largos.
- Generacion de contenido sin filtros editoriales: la variante heretic/abliterated elimina rechazos, lo que resulta util para investigacion sobre sesgos y alineacion, y para ficcion adulta o temas sensibles, siempre con revision humana.
- Prototipado en hardware de consumo: al distribuirse en GGUF con cuantizaciones de 4 bits, permite ejecutar un modelo de 27B en GPU consumer mediante llama.cpp u Ollama, algo inviable en bfloat16.
- Experimentacion academica con tecnicas de fine-tune: sirve como caso de estudio de metodos comunitarios (COLD FUSION, GAIN, Fable Fusion) y de cuantizacion MTP con imatrix dual.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y no se han verificado de forma independiente. Se presentan tal cual, sin comparacion numerica con alternativas porque no se aportan cifras de los modelos de referencia.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado como +144 puntos sobre Qwen 3.8 27B |
| ARC-C (4 bits) | 719 | Supera 718 en 4 bits |
| ARC-E (8 bits) | 882 | Zona que el autor atribuye a modelos cerrados |
| MMLU | no disponible | |
| HumanEval | no disponible | |
| GSM8K | no disponible | |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks criticos, pero no se incluyen las tablas con los valores de esos siete benchmarks en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de ~27B, una cuantizacion de 4 bits requiere del orden de 15-18 GB de VRAM, y una de 8 bits alrededor de 28-30 GB; estas cifras son estimaciones generales, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Para 4 bits, GPU consumer de 24 GB (RTX 3090, RTX 4090) o superiores; para 8 bits, A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU consumer: previsiblemente si, en cuantizaciones de 4 bits y con GPU de 24 GB o mas, segun el tamano del modelo; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la variante MTP requiere soporte de decodificacion multi-token en el runtime. vLLM y TGI no se mencionan.
- Latencia y throughput: no disponibles. El autor afirma que la generacion es mas rapida que el modelo base, especialmente en MTP, pero no aporta tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (zugquant) | ~26,9B | no disponible | Apache 2.0 | GGUF | Cuantizacion de un fine-tune comunitario; benchmarks solo del autor |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~26,9B | no disponible | Apache 2.0 | bfloat16 | Modelo base del fine-tune; misma familia y autor del tune |
| Qwen 3.8 27B (base oficial) | 27B | no disponible | no disponible | safetensors | Referencia del autor; este fine-tune afirma superarlo en ARC-C y ARC-E |
| Qwen3.6-35B-A3B | 35B (A3B) | no disponible | no disponible | no disponible | Citado por el autor como superado en siete benchmarks |

No se dispone de datos de contexto, rendimiento verificado ni disponibilidad de pesos para completar una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Las cifras de benchmarks (ARC-C 735, ARC-E 882) proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente; deben tratarse con cautela.
- El modelo ha sido sometido a abliteration/heretic, lo que elimina mecanismos de rechazo y aumenta el riesgo de generar contenido danino, ofensivo o inapropiado; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- Soporte limitado a ingles y chino; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones o documentos largos.
- La licencia Apache 2.0 se declara en el repositorio, pero el modelo base y los datasets de origen pueden tener condiciones adicionales que conviene revisar antes de un uso comercial.
- El repositorio es una cuantizacion de terceros (zugquant); la calidad del GGUF y la fidelidad respecto al modelo original no estan verificadas.
- El pipeline declarado image-text-to-text no se detalla; no hay garantias sobre el soporte real de vision ni sobre los formatos admitidos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El uso de tecnicas de entrenamiento propietarias y no publicadas (GAIN, COLD FUSION) dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face (cuantizacion): https://huggingface.co/zugquant/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base del fine-tune: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo predecesor citado por el autor (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Archivo GGUF IQ4_XS de ejemplo: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF/blob/main/Qwen3.8-27B-TurboFCFusion-735-882-Here-Uncen-NEO-CODER-MAX-LOW-MTP-IQ4_XS.gguf
