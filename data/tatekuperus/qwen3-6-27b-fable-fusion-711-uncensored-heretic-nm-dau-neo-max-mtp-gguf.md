# tatekuperus/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF es un empaquetado de cuantizaciones GGUF publicado por el usuario tatekuperus sobre el modelo base DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP, desarrollado por DavidAU junto a colaboradores (Nightmedia en merge y benchmarking, TeichAI con el dataset Polaris, armand0e con trazas Fable 5 y trohrbaugh con la ablacion heretic). Se trata de un ajuste fino multi-etapa y multi-merge construido sobre Qwen3.6-27B de Team Qwen, con 26.895.998.464 parametros totales (unos 26,9B) y licencia apache-2.0.

El modelo se presenta como el primer ajuste fino abierto de su clase en superar una puntuacion de 0,700 en ARC-C tanto en cuantizacion de 8 bits como de 4 bits, de ahi el "711" de su nombre. Segun la model card, supera al Qwen3.6-27B base en 6 de 7 benchmarks y empata en el septimo, ademas de superar los 7 benchmarks del Qwen3.6-35B-A3B. El repositorio incluye tanto cuantizaciones GGUF "regulares" como variantes MTP (Multi-Token Prediction) con imatrix.

Su relevancia actual reside en dos ejes: por un lado, ofrece capacidades de razonamiento y seguimiento de instrucciones propias de modelos cerrados de gran tamano en un modelo que cabe en hardware de consumo; por otro, incorpora una ablacion heretic/uncensored que elimina los rechazos de contenido, algo que lo orienta a escritura creativa, rol y casos de uso sin restricciones de seguridad. La model card tambien declara soporte de vision y una ventana de contexto que no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.6-27B, con soporte multimodal declarado (pipeline image-text-to-text); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regular y GGUF MTP Neo MAX con imatrix; se mencionan explicitamente Q4 y Q8; el tag incluye bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye tambien en otros formatos no detallados |
| Tamano del repositorio | 465,1 GB |
| Modelo base | DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B de Team Qwen y se construye mediante un proceso de ajuste fino multi-etapa seguido de un merge multi-etapa, con benchmarking y validacion en cada fase (ajustes, ajustes multi-etapa y cada paso de merge). Antes del ajuste se aplico una ablacion "heretic" para eliminar comportamientos de rechazo, de modo que el modelo final es uncensored. La model card insiste en que no se modifico ni corrompio el modelo base mas alla de los objetivos declarados: aumentar la inteligencia general y la resolucion de problemas, mejorar el seguimiento de instrucciones y elevar el razonamiento, evitando practicas de "benchmaxing".

Los datos de entrenamiento combinan trazas ligeras de "Fable" (armand0e), trazas de razonamiento/thinking de Claude Opus, el dataset interno F451 y algunas trazas de GPT-5 no razonador incluidas en el dataset Polaris. Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. El proceso se realizo con Unsloth sobre hardware de consumo, segun afirma el autor. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO mas alla de las trazas de modelos docentes utilizadas para destilacion de estilo y razonamiento. El autor senala que el metodo se probo primero en modelos Qwen3.5 de 9B como grupo de control antes de aplicarlo al modelo de 27B.

## Capacidades

- Generacion de texto general, razonamiento y resolucion de problemas, con modo thinking/reasoning explicitamente etiquetado.
- Razonamiento matematico: en pruebas externas de la comunidad tab de HuggingFace se reporta buen desempeno incluso en cuantizacion Q4 con problemas de fisica y matematicas.
- Generacion de codigo: el tag "coder" esta presente y el autor lo clasifica como modelo "all use cases".
- Escritura creativa, ficcion, narrativa de todos los generos y roleplaying, pese a que el autor aclara que no fue disenado especificamente para creatividad.
- Vision: la model card lista "Vision" entre las caracteristicas y el pipeline declarado es image-text-to-text.
- Capacidades multilingues limitadas a ingles (en) y chino (zh), segun los idiomas declarados.
- Contenido sin censura: la ablacion heretic elimina los rechazos, lo que permite generar contenido que otros modelos bloquean.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Formato conversacional y compatibilidad con endpoints declarada (tag endpoints_compatible).

## Casos de uso

- Escritura creativa y narrativa larga: el modelo esta afinado con trazas Fable y admite generacion de ficcion de multiples generos sin filtros de seguridad, lo que lo hace util para novelas, relatos y guiones donde otros modelos censuran violencia, conflicto o temas adultos.
- Roleplaying y personajes persistentes: al no aplicar rechazos y mantener el seguimiento de instrucciones mejorado respecto al base, encaja en aplicaciones de chat con personajes y simulaciones conversacionales largas.
- Razonamiento matematico y fisico asistido: la mejora en thinking y resolucion de problemas permite usarlo como asistente de calculo paso a paso, incluso en cuantizacion Q4, segun los informes de la comunidad.
- Asistente de programacion local: con el tag coder y despliegue en Ollama o llama.cpp, puede emplearse como copiloto de codigo en estaciones de trabajo sin GPU de datacenter.
- Generacion de contenido editorial sin restricciones: para redaccion de ficcion, marketing o guiones donde los filtros de modelos comerciales suponen un bloqueo, siempre que se asuma la responsabilidad editorial del contenido final.
- Investigacion sobre alineacion y ablacion: al ser un modelo heretic/abliterated con benchmarks declarados frente al base, resulta util como sujeto de estudio para medir el impacto de la eliminacion de rechazos en el rendimiento cognitivo.
- Descripcion y analisis de imagenes: gracias al soporte multimodal declarado, puede incorporarse en flujos de captioning o analisis de imagenes, aunque las capacidades de vision no se detallan en la informacion disponible.
- Despliegue en hardware de consumo: el catalogo de cuantizaciones GGUF (Q4, Q8, imatrix) permite ejecutarlo en equipos de gama alta con GPU de consumo, lo que habilita usos privados sin enviar datos a terceros.

## Benchmarks y rendimiento

| Benchmark | Cuantizacion | Resultado | Fuente |
|---|---|---|---|
| ARC-C | 8 bits | 0,711 | Declarado por el autor |
| ARC-C | 4 bits | 0,701 | Declarado por el autor |

Segun la model card, el modelo supera al Qwen3.6-27B base en 6 de 7 benchmarks y empata en el septimo, y supera los 7 benchmarks del Qwen3.6-35B-A3B. Los valores concretos de los otros seis benchmarks (tipo MMLU, HumanEval o GSM8K) no se detallan en la informacion disponible. El autor indica que el benchmarking final fue humano, mediante comparacion lado a lado del modelo base y el ajustado, y que los resultados fueron confirmados por terceros en la pestana de discusiones del repositorio.

## Requisitos de hardware

- VRAM para precision completa (bfloat16): aproximadamente 54 GB, calculado a partir de 26,9B de parametros a 2 bytes por parametro; la fuente abliteratedmodels.org clasifica el modelo en la categoria de 48 GB de VRAM.
- Cuantizacion Q8: en torno a 28-29 GB de VRAM; ejecutable en una RTX 4090 de 24 GB solo con descarga parcial a CPU o en GPU profesionales de 32-48 GB (A100 40 GB, L40S, RTX 6000 Ada).
- Cuantizacion Q4: en torno a 16-18 GB de VRAM; cabe en una RTX 4090, RTX 4080, RTX 3090 o similares de 16 GB o mas.
- Cuantizaciones mas agresivas: el autor afirma que incluso los quants mas bajos mantienen un rendimiento excepcional, lo que permitiria ejecucion en GPUs de 12 GB o menos.
- Despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; tambien vLLM o TGI si se dispone de los pesos en safetensors, aunque este repositorio solo contiene GGUF.
- Variantes MTP: el repositorio incluye cuantizaciones MTP Neo MAX con imatrix, orientadas a decodificacion multi-token y por tanto a mayor velocidad de generacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este modelo) | 26,9B | no disponible | 0,711 en 8 bits; 0,701 en 4 bits | apache-2.0 | GGUF (este repo) y otras variantes (49 repositorios del autor base) |
| Qwen3.6-27B (base, Team Qwen) | no disponible | no disponible | inferior segun el autor en 6 de 7 benchmarks | apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B | 35B (MoE) | no disponible | inferior en los 7 benchmarks segun el autor | apache-2.0 | Hugging Face |
| Qwen3.5-27B | no disponible | no disponible | inferior al Qwen3.6-27B base segun el autor | apache-2.0 | Hugging Face |
| Qwen3.5-9B-The-Defiant-Fable (control del mismo autor) | 9B | no disponible | superior a 640 en ARC-C en 4 y 8 bits | apache-2.0 | Hugging Face |

No se dispone de datos numericos comparativos mas alla de las afirmaciones cualitativas del autor sobre los benchmarks. Los modelos de la serie Qwen3.8 (Cold Fusion, Turbo Fable) mencionados en la model card no se incluyen por carecer de especificaciones en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo uncensored por ablacion heretic: no incorpora rechazos de seguridad, por lo que puede generar contenido danino, ilegal o inapropiado y no es apto para aplicaciones orientadas al publico general sin capas de moderacion externas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o datos; los benchmarks de razonamiento no eliminan este riesgo.
- Sesgos: al entrenarse con trazas de modelos docentes (Claude Opus, GPT-5 via Polaris) y datasets internos no publicos, puede heredar sesgos de esos modelos y de sus datos; no se ha publicado una evaluacion de sesgos.
- Idiomas: cobertura limitada a ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Benchmarks autodeclarados: los valores de ARC-C y las afirmaciones sobre los 7 benchmarks provienen del autor y de la comunidad, no de una evaluacion independiente formal.
- Licencia: apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base Qwen3.6-27B y de los datasets utilizados (Polar-STRICT, F451-STRICT), cuyos terminos no se detallan.
- Repositorio espejo con traccion nula: la copia de tatekuperus registra 0 descargas y 0 likes en el momento de la consulta; el mantenimiento y la verificacion de integridad dependen del autor original DavidAU.
- Fecha de creacion declarada en 2026: la cronologia indicada en los metadatos es posterior a la fecha actual, lo que conviene tener en cuenta al citar el modelo.
- Etica de uso en produccion: desplegar un modelo sin rechazos en atencion al cliente, educacion o salud puede violar politicas internas y normativa sectorial; se recomienda anadir filtros, trazabilidad y supervision humana.

## Enlaces

- Repositorio HuggingFace de este empaquetado GGUF: https://huggingface.co/tatekuperus/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Discusion en HuggingFace con pruebas de la comunidad: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions/5
- Discusion sobre versiones Qwen 3.8 y metodos GAIN/Cold Fusion: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions/91
- Ficha de resumen del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-mtp-davidau
- Ficha de la variante GGUF en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau/
- Version de 40B Eleanor-DECKARD: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Version de 40B Grand Intelligence FF711-717: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo de control Qwen3.5-9B-The-Defiant-Fable: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Qwen3.8-27B Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8-27B TURBO Fable 735-882: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.8-27B TWIN TURBO: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
