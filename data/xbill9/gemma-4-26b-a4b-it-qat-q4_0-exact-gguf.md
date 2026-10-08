# xbill9/gemma-4-26B-A4B-it-qat-q4_0-exact-gguf

## Resumen

Este repositorio es una reconstruccion no oficial en formato GGUF del modelo Gemma 4 26B-A4B-it de Google DeepMind, en su variante entrenada con quantization-aware training (QAT) a 4 bits. El autor, xbill9, ha generado los pesos directamente a partir del checkpoint sin cuantizar `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, obteniendo un fichero de 14.249.047.040 bytes (14,25 GB) frente a los 14.439.363.584 bytes (14,44 GB) del GGUF Q4_0 oficial de Google. Se publica bajo licencia Apache 2.0 y esta pensado para su uso con llama.cpp.

El modelo es de tipo solo texto (la parte de vision reside en un mmproj GGUF aparte que no se incluye) y su nomenclatura "26B-A4B" indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 25.233 millones de parametros totales y alrededor de 4 mil millones activos por token, segun la convencion de nombres. La innovacion principal de este build concreto no es arquitectonica, sino de cuantizacion: en lugar de aplicar el paso estandar de llama.cpp (magnitud maxima del bloque dividida entre 8), recupera el paso entrenado de cada bloque, de modo que el 97,11 % de los valores reconstruidos son identicos bit a bit a la fuente QAT.

Su relevancia ahora es doble: por un lado demuestra que es posible reproducir fielmente los pesos QAT de Google en GGUF con un script que solo depende de numpy; por otro, ofrece un fichero algo mas pequeno y con embeddings tambien en Q4_0, lo que puede resultar atractivo para despliegues con memoria muy ajustada. Conviene senalar que, en el momento de publicar la model card, este build no se habia cargado aun en llama.cpp, por lo que su comportamiento en inferencia real no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 30 capas segun los tensores del GGUF |
| Parametros totales | 25.233.142.046 |
| Parametros activos | Aproximadamente 4B, segun la nomenclatura "A4B" (no confirmado de forma explicita) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (pesos QAT), token_embd en Q4_0; normas y escalas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Se trata de un transformer con mezcla de expertos. La lista de tensores del GGUF confirma la presencia de expertos fusionados en el layout de Google (`ffn_gate_up_exps` y `ffn_down_exps`, un banco por capa) junto a tensores densos de atencion y feed-forward (`attn_q`, `attn_k`, `attn_v`, `attn_output`, `ffn_down`, `ffn_gate`, `ffn_up`). El modelo tiene 30 capas; llama la atencion que `attn_v` aparece en 25 de ellas frente a las 30 de `attn_q` y `attn_k`, lo que sugiere algun tipo de comparticion o variacion de la atencion en cinco capas, aunque la model card no lo detalla. No se especifica en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron fases de RLHF o DPO.

El entrenamiento relevante aqui es el QAT que Google aplico antes de cuantizar: el checkpoint de partida ya contiene los pesos entrenados para tolerar la cuantizacion a 4 bits. Sobre ese material, este repositorio aplica un proceso de reconstruccion por bloques que busca el paso de cuantizacion entrenado (division entre 8, 7, ... 1, el que deje cada valor en un nivel entero, refinado por minimos cuadrados) en lugar del paso estandar de llama.cpp. Los metadatos (tokenizer, chat template, hiperparametros y orden de tensores) se copian byte a byte del GGUF oficial `gemma-4-26B_q4_0-it.gguf` en la revision `d1c082b`. El proceso esta documentado en el script `gguf_exact.py` y los recuentos por tensor en `evidence/build_report.json`.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Hereda las capacidades del modelo base Gemma 4 26B-A4B-it, si bien la model card no las enumera de forma explicita.
- Capacidad de mezcla de expertos: activacion de un subconjunto de parametros por token (en torno a 4B activos segun la nomenclatura).
- Compatible con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.
- Solo texto: la capacidad de vision no esta incluida y requiere el mmproj GGUF de Google por separado.
- Soporte de tool calling, agentes, capacidades multilingues o modo de razonamiento: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: el fichero de 14,25 GB cabe en una RTX 4090 o A5000 dejando margen para la cache KV, lo que permite ejecutar un modelo MoE de nivel 26B en hardware de gama alta de consumo.
- Inferencia en servidores con llama.cpp: al ser un GGUF con metadatos copiados del build oficial, puede integrarse en el mismo flujo de trabajo (llama-server, llama-cpp-python) sin reconfigurar el chat template ni el tokenizer.
- Experimentacion e investigacion sobre cuantizacion QAT: el repositorio incluye el script de reconstruccion y los recuentos de fidelidad por tensor, lo que lo convierte en un caso de estudio reproducible para analizar cuanto se degrada un QAT al reconstruirlo a partir del checkpoint sin cuantizar.
- Comparacion de calidad entre el Q4_0 oficial y este build: permite medir empiricamente si la reconstruccion con paso entrenado produce diferencias de perplejidad o de salida frente al GGUF de Google.
- Generacion de texto a gran escala con coste de memoria reducido: al tener un 3,57 % menos de peso en disco que el build oficial, es util en entornos donde el almacenamiento o el ancho de banda de carga son limitados.
- Prototipado de asistentes conversacionales de solo texto en entornos aislados: la licencia Apache 2.0 y el caracter local del formato GGUF facilitan despliegues on-premise sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de fidelidad de reconstruccion respecto a la fuente QAT y una comparacion de tamano con el GGUF oficial, que se recogen a continuacion:

| Metrica | Google Q4_0 GGUF | Este GGUF |
|---|---|---|
| Tamano de fichero | 14.439.363.584 B | 14.249.047.040 B |
| Tensor `token_embd` | Q6_K | Q4_0 |
| Valores reconstruidos identicos bit a bit a la fuente QAT | — | 97,11 % |
| `token_embd.weight` identico | — | 96,66 % |
| `attn_k` identico | — | 96,79 % |
| `attn_output` identico | — | 96,77 % |
| `attn_q` identico | — | 96,77 % |
| `attn_v` identico | — | 96,83 % |
| `ffn_down` identico | — | 97,54 % |
| `ffn_down_exps` identico | — | 97,13 % |
| `ffn_gate` identico | — | 97,43 % |
| `ffn_gate_up_exps` identico | — | 97,14 % |
| `ffn_up` identico | — | 97,33 % |

Datos de rendimiento (latencia, throughput, divergencia respecto a bf16) no disponibles para este build de 26B: la model card indica que se midieron solo para el build E4B.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 15-16 GB para cargar los 14,25 GB de pesos completamente en GPU, mas la memoria de la cache KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A5000 (24 GB) para descarga completa; A100 40/80 GB o H100 para servicio concurrente con lotes mayores.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 de 16 GB de forma ajustada (esta ultima puede requerir offload parcial). En GPUs de 8-12 GB seria necesario descargar capas a CPU/RAM, penalizando la velocidad.
- Opciones de despliegue: llama.cpp (formato nativo), llama-server y llama-cpp-python. No se menciona compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La model card senala que este build aun no se ha cargado en llama.cpp, por lo que no hay mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Estado |
|---|---|---|---|---|---|
| Este build (`xbill9/gemma-4-26B-A4B-it-qat-q4_0-exact-gguf`) | 25.233.142.046 (MoE) | GGUF Q4_0 | 14,25 GB | Apache 2.0 | No oficial, no verificado en llama.cpp |
| `google/gemma-4-26B-A4B-it-qat-q4_0-gguf` | 25B (MoE) | GGUF Q4_0 | 14,44 GB | Apache 2.0 | Oficial de Google |
| `xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf` | No disponible | GGUF Q4_0 | No disponible | Apache 2.0 | No oficial, con metricas de velocidad y divergencia medidas |
| `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` | 25,2B (MoE) | safetensors | No disponible | Apache 2.0 | Fuente QAT sin cuantizar |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye otros modelos de la misma categoria. No se dispone de datos de rendimiento para contrastar calidad frente a alternativas.

## Limitaciones y advertencias

- Solo texto: no incluye el mmproj de vision, por lo que no procesa imagenes.
- No verificado en inferencia: el build se construyo y comprobo de forma offline contra su fuente, pero no se ha cargado aun en llama.cpp; podria presentar fallos de carga o de generacion.
- No oficial: no esta afiliado ni respaldado por Google. Los problemas deben reportarse al autor del repositorio, no al equipo de Gemma.
- Reconstruccion no identica al 100 %: un 2,89 % global de los valores reconstruidos no son identicos bit a bit a la fuente QAT, con diferencias atribuidas al redondeo fp16 de la escala de bloque.
- Sesgos conocidos: no disponible (la model card no los documenta).
- Riesgo de alucinacion: no disponible de forma especifica; es un riesgo generico de los modelos de lenguaje, no cuantificado aqui.
- Limitaciones de contexto e idioma: no disponible.
- Licencia: Apache 2.0. El repositorio redistribuye los pesos de Google en un formato de almacenamiento modificado bajo la misma licencia. Debe respetarse la licencia de Gemma 4 (enlazada en la model card) para uso comercial.
- Sin benchmarks: no hay mediciones de calidad que confirmen que este build se comporta como el oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-exact-gguf
- Modelo base sin cuantizar: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- GGUF Q4_0 oficial de Google: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-gguf
- Build E4B del mismo autor: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Fichero de evidencia de la reconstruccion (referenciado en la model card): `evidence/build_report.json`
