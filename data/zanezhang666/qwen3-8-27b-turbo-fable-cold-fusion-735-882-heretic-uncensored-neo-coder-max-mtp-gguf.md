# zanezhang666/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune multietapa del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicado por el usuario zanezhang666 en formato GGUF. Se distribuye como una familia de cuantizaciones (regulares y MTP con imatrix dual) pensada para ejecucion en hardware de consumo, e incorpora tecnicas de entrenamiento denominadas por el autor "Cold Fusion" y "Fable Fusion 711". El modelo declara capacidades de razonamiento, generacion de codigo, escritura creativa y roleplaying, con modos de pensamiento (thinking) y un ajuste orientado a reducir el numero de tokens de razonamiento.

Segun la model card, el objetivo central del entrenamiento fue aumentar la inteligencia general del modelo y, a la vez, recortar el bloque de pensamiento entre la mitad y hasta una decima parte (reduccion mediana aproximada de dos tercios), reformateandolo y acelerando la generacion. El autor afirma que la variante de 8 bits supera los 730 puntos en ARC-C (735) y los 880 en ARC-E, y que la de 4 bits alcanza 719 en ARC-C, cifras que situarian al modelo en la denominada "zona de inteligencia" de los modelos cerrados. Estas cifras provienen unicamente de la model card y no se han verificado de forma independiente.

El repositorio tiene un tamano de 389 GB, lo que refleja la inclusion de multiples cuantizaciones del modelo de aproximadamente 26.900 millones de parametros. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles y chino. El pipeline registrado es image-text-to-text, aunque la informacion disponible no detalla la arquitectura multimodal ni el codificador visual empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de la familia Qwen; el pipeline declarado es image-text-to-text, sin detalle del codificador visual) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP (imatrix dual / DI-MATRIX); incluye variantes de 4 bits y 8 bits |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se entrena en bfloat16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su procedencia de la familia Qwen (etiquetas qwen3_8, qwen3_6 y qwen3_5) y de que se trata de un transformer con modos de pensamiento. El autor describe el proceso como un fine-tune multietapa, multi-fine-tune y multi-merge, construido sobre el modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU y entrenado con Unsloth. Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, descritos como conjuntos "STRICT" orientados a reforzar instrucciones y calidad.

Las innovaciones declaradas se centran en la eficiencia del razonamiento: reduccion del bloque de pensamiento (de la mitad a una decima parte, con mediana de dos tercios), reformateo del mismo y aceleracion de la generacion de tokens. El autor menciona tambien los metodos "Cold Fusion" y "Fable Fusion 711", sin publicar detalles tecnicos sobre su implementacion. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Las cuantizaciones MTP incluyen matrices de importancia duales (DI-MATRIX) para preservar calidad en baja precision.

## Capacidades

- Generacion de texto general y conversacional, con modos de pensamiento (thinking) y razonamiento explicito.
- Razonamiento y resolucion de problemas, con un bloque de pensamiento reducido respecto al modelo base.
- Generacion de codigo, reforzada por el sufijo NEO-CODER del nombre y las etiquetas de "coder".
- Escritura creativa: ficcion, relatos, todos los generos y roleplaying.
- Capacidades multimodales de entrada imagen-texto segun el pipeline declarado (image-text-to-text), aunque no se detallan en la informacion disponible.
- Multilinguee limitado a ingles y chino.
- Modelo "uncensored" / "abliterated": el autor indica que se han eliminado o reducido los rechazos del modelo base.
- Soporte de tool calling y function calling: la model card menciona "the strongest tool calling performance ever recorded" en la pestana de comunidad, sin datos verificables en la informacion proporcionada.
- Compatible con endpoints (etiqueta endpoints_compatible) y con el ecosistema GGUF (llama.cpp y derivados).

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en asistentes de IDE o pipelines de CI/CD para autocompletar, explicar y refactorizar codigo, apoyandose en su perfil de coder y en el soporte declarado de tool calling para invocar herramientas de build o test.
- Escritura creativa y ficcion: resulta adecuado para generar relatos, dialogos y tramas en multiples generos, gracias al ajuste especifico en escritura creativa y roleplaying y a su estilo de alta densidad narrativa.
- Roleplaying y personajes conversacionales: permite mantener interacciones multi-turno con personalidad consistente, aprovechando el ajuste en ficcion y la reduccion de tokens de pensamiento para respuestas mas agiles.
- Asistencia conversacional general: puede desplegarse como chatbot de atencion al usuario en ingles o chino, con razonamiento interno para consultas complejas y respuestas directas en las simples.
- Razonamiento y analisis con presupuesto de tokens ajustado: su bloque de pensamiento reducido lo hace util en entornos donde el coste por token importa, como agentes autonomos con muchas llamadas encadenadas.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF de 4 y 8 bits permiten ejecutar el modelo en estaciones de trabajo con GPU de gama alta para prototipado, investigacion y generacion offline de contenido.
- Investigacion sobre alineacion y modelos sin censura: sirve para estudiar el comportamiento de modelos "abliterated" y comparar respuestas frente a variantes alineadas.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y no se han verificado de forma independiente. Se presentan tal como se declaran:

| Benchmark | Variante 8 bits | Variante 4 bits | Referencia declarada |
|---|---|---|---|
| ARC-C | 735 | 719 | Qwen 3.8 27B base (por debajo de 591 segun la afirmacion de "+144 pts") |
| ARC-E | 880 | No disponible | Zona de modelos cerrados (OpenAI, Claude, Gemini) |

El autor afirma ademas que el modelo supera al Qwen 3.8 27B base y a los Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en los siete benchmarks criticos, sin especificar cuales son ni aportar la tabla completa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de ~26,9 mil millones de parametros requiere aproximadamente 54 GB en bfloat16, unos 27 GB en cuantizacion de 8 bits y unos 14-16 GB en 4 bits, sin contar la cache KV.
- GPU recomendadas: A100 80 GB o H100 para precision completa o 8 bits con contexto largo; RTX 4090 (24 GB) o RTX 3090 para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: si, en 4 bits (y potencialmente en 8 bits con offloading parcial) en tarjetas de 24 GB como la RTX 4090.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para GGUF; vLLM o TGI requeririan conversion a otros formatos, no confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. El autor afirma que la generacion es mas rapida que la del modelo base gracias a la reduccion de tokens de pensamiento, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (zanezhang666) | ~26,9 B | No disponible | Apache 2.0 | GGUF (4 y 8 bits) | Fine-tune "uncensored" con thinking reducido |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~26,9 B (por el nombre) | No disponible | No disponible | bfloat16 | Modelo base directo de este fine-tune |
| Qwen 3.8 27B (base) | ~27 B (por el nombre) | No disponible | No disponible | No disponible | Referencia de comparacion citada por el autor |
| Qwen3.6-35B-A3B | 35 B totales (MoE, por el nombre) | No disponible | No disponible | No disponible | Citado como superado en los 7 benchmarks criticos |

No se dispone de datos verificables de rendimiento ni de contexto para establecer una comparacion cuantitativa solida con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se ha reducido deliberadamente la alineacion de seguridad, por lo que puede generar contenido ofensivo, explicito o danino; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, citas o codigo incorrecto; la reduccion del bloque de pensamiento podria disminuir la verificacion interna en tareas complejas.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- Los benchmarks declarados (ARC-C 735, ARC-E 880) proceden unicamente del autor y no han sido verificados de forma independiente; deben tratarse con cautela.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar su idoneidad para tareas de contexto largo.
- El repositorio ocupa 389 GB por la acumulacion de cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero las condiciones del modelo base y de los datasets de entrenamiento no se detallan; conviene revisarlas antes de un despliegue en produccion.
- El pipeline image-text-to-text sugiere capacidades multimodales no documentadas; no deben asumirse sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zanezhang666/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del modelo base (DavidAU): https://huggingface.co/DavidAU
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
