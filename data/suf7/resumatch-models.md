# Suf7/resumatch-models

## Resumen

Resumatch models es un paquete de pesos publicado por el autor Suf7 que contiene un bi-encoder y un reranker entrenados para la tarea de emparejamiento entre curriculos y ofertas de empleo (resume-job matching). Forma parte del Deliverable 2 de un proyecto de semestre de IA desarrollado en FAST-NUCES Lahore, y se distribuye a traves de Hugging Face con licencia MIT.

El componente principal es un bi-encoder basado en `all-MiniLM-L6-v2` afinado con multiple-negatives ranking loss en formato sentence-transformers, es decir, un modelo de embeddings de frases de aproximadamente 22 millones de parametros y 384 dimensiones de salida. Se complementa con dos variantes de un reranker denominado MatchNet, entregadas como state dict de PyTorch junto con su configuracion y el escalador de caracteristicas: una entrenada sobre pares a nivel de ocupacion y otra sobre pares etiquetados por humanos.

Es relevante porque ejemplifica el patron habitual de recuperacion en dos etapas aplicado a un dominio concreto: un bi-encoder barato para generar candidatos y un reranker mas costoso para ordenar el top-k. No obstante, se trata de un artefacto de proyecto academico con cero descargas y cero likes en el momento de la consulta, sin model card detallada de rendimiento ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder transformer (MiniLM-L6) + reranker MatchNet (MLP sobre caracteristicas) |
| Parametros totales | No disponible (el bi-encoder base MiniLM-L6 tiene ~22,7 M; el reranker no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base MiniLM-L6 admite 512 tokens, no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (bi_encoder, formato sentence-transformers) y PyTorch state dict (`.pt`) para MatchNet |

## Arquitectura y entrenamiento

El bi-encoder es un `all-MiniLM-L6-v2` afinado con multiple-negatives ranking loss, una funcion de perdida habitual en sentence-transformers que contrasta cada par positivo contra varios negativos duros dentro del lote. El resultado se entrega en el formato estandar de sentence-transformers, lo que permite cargarlo con `SentenceTransformer` y usarlo para calcular similitud coseno entre embeddings de curriculos y ofertas.

El reranker MatchNet se distribuye como state dict de PyTorch acompanado de su configuracion y de un escalador de caracteristicas, lo que sugiere una entrada basada en caracteristicas derivadas del par curriculo-oferta (por ejemplo, similitudes, solapamiento de terminos o scores intermedios) y no un transformer de cross-encoding puro. Se ofrecen dos checkpoints: `matchnet_weak.pt`, entrenado sobre pares a nivel de ocupacion, y `matchnet_human.pt`, entrenado sobre pares etiquetados por humanos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings de frases para curriculos y ofertas de empleo mediante el bi-encoder afinado.
- Calculo de similitud semantica entre pares curriculo-oferta para recuperacion de candidatos.
- Reranking de un conjunto de candidatos mediante MatchNet, con dos variantes segun el tipo de etiquetado.
- Extraccion de caracteristicas del par y escalado previo a la inferencia del reranker.
- Integracion con el ecosistema sentence-transformers y PyTorch.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling, agentes ni modo thinking.

## Casos de uso

- Filtrado inicial de candidatos en un ATS: el bi-encoder genera embeddings de todos los curriculos y de la oferta, y se recuperan los top-k por similitud coseno antes de pasar al reranker.
- Reranking de candidatos en produccion: MatchNet reordena el top-k recuperado usando caracteristicas del par, mejorando la precision del ranking final con un coste computacional bajo.
- Busqueda inversa de ofertas para un candidato: dado un curriculo, se calculan embeddings contra un catalogo de ofertas y se devuelven las mas afines semanticamente.
- Prototipado academico y experimentacion: el paquete incluye dos checkpoints de reranker con distintos regimenes de etiquetado, lo que permite comparar el efecto de la supervision debil frente a la humana.
- Sistema de recomendacion interno de RRHH: integrado en un pipeline de sentence-transformers para sugerir movilidades internas entre empleados y vacantes.
- Base para evaluacion de sesgos en matching: al ser un modelo pequeno y de licencia MIT, sirve para auditar como un bi-encoder afinado distribuye similitudes entre grupos demograficos o sectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja para el bi-encoder (inferior a 1 GB en fp32 para un modelo de ~22,7 M de parametros); el reranker MatchNet es una red pequena cuyo consumo exacto no se especifica.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien es viable en CPU para volumenes moderados.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: sentence-transformers sobre PyTorch, exportacion a ONNX o TorchScript, y servicio via FastAPI o similar; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suf7/resumatch-models | ~22,7 M (bi-encoder) + reranker no especificado | No disponible | Matching curriculo-oferta | MIT | Hugging Face (0 descargas) |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 512 tokens (segun model card del original) | Embeddings de frases genericos | Apache-2.0 | Hugging Face, ampliamente usado |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | 384 tokens (segun model card del original) | Embeddings de frases genericos | Apache-2.0 | Hugging Face, ampliamente usado |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens (segun model card del original) | Embeddings de frases y recuperacion | MIT | Hugging Face, ampliamente usado |

La comparativa se limita a la familia de bi-encoders; no se dispone de datos de rendimiento del modelo de Suf7 frente a estas alternativas.

## Limitaciones y advertencias

- Proyecto academico sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas genericas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Idiomas soportados no documentados; el modelo base MiniLM-L6 es predominantemente ingles, por lo que el rendimiento en castellano es incierto.
- No se especifica la composicion del dataset de entrenamiento ni el volumen de pares, lo que impide evaluar sesgos de dominio o de ocupacion.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos en el ranking: un bi-encoder afinado puede ordenar mal pares con vocabulario solapado pero requisitos incompatibles.
- El reranker MatchNet depende de un escalador de caracteristicas y de una configuracion concretos; reutilizarlo fuera del pipeline original requiere replicar exactamente ese preprocesado.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias explicitas del autor sobre el rendimiento en produccion.
- No apto para tareas fuera del dominio de matching curriculo-oferta.

## Enlaces

- Hugging Face: https://huggingface.co/Suf7/resumatch-models
- Repositorio del proyecto: https://github.com/Suf-7/Resumatch
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
