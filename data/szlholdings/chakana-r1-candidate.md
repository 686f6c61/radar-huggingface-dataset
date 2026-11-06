# SZLHOLDINGS/chakana-r1-candidate

## Resumen

Chakana r1 candidate es un modelo de embeddings de frases (feature-extraction) obtenido por fine-tuning del modelo base Apache-2.0 `Qwen/Qwen3-Embedding-0.6B`. Lo desarrolla SZLHOLDINGS (titular declarado: Stephen Lutar) como candidato para su "lane" interna de recuperacion de texto, orientada a la busqueda semantica sobre sus propios corpus (szl-lake, doctrine, killinchu). El modelo se publica explicitamente como "proposal-only": un artefacto medido que no debe integrarse en produccion hasta que un humano lo acepte y se firme el correspondiente recibo de entrenamiento.

Tecnicamente es un transformer encoder de 595.776.512 parametros (unos 0,6 mil millones) con pesos en safetensors y compatibilidad con sentence-transformers y text-embeddings-inference. No se documenta la longitud de contexto en la informacion disponible, aunque al derivar de Qwen3-Embedding-0.6B hereda la arquitectura de dicho modelo base. El modelo esta entrenado unicamente en ingles y su unico dato de rendimiento publicado es un nDCG@10 de 0,833973 sobre una particion retenida de dos corpus internos de SZL.

Su relevancia es limitada fuera del ecosistema del autor: no hay resultados MTEB, no hay evidencia de calidad general de recuperacion y el propio autor califica el artefacto como no elegible para publicacion. Resulta util como caso de estudio de fine-tuning con Matryoshka sobre un encoder pequeno, y como ejemplo de model card con trazabilidad de datos y limites declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de Qwen3-Embedding-0.6B) |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del encoder `Qwen/Qwen3-Embedding-0.6B`, fijado en la revision `97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3`. El entrenamiento se realizo con la libreria sentence-transformers y una funcion de perdida `MatryoshkaLoss` envolviendo `MultipleNegativesRankingLoss`, con dimensiones de truncamiento [1024, 512, 256], lo que permite obtener embeddings de menor dimensionalidad por truncado directo del vector. Los hiperparametros declarados son: semilla 11, 1 epoca, batch de 8, learning rate 2e-05 y perdida final de entrenamiento de 0,945588. El job se ejecuto el 2026-11-05 mediante `hf jobs uv run --python 3.12` (se recomienda flavor a10g-large), aunque el identificador del job figura como desconocido.

Los datos de entrenamiento son pares ancla/positivo construidos a partir de dos corpus del autor: `SZLHOLDINGS/szl-second-brain-inrepo` y `SZLHOLDINGS/rag-corpus-v1`, descargados en revisiones registradas. Las etiquetas son debiles: el titulo del fragmento (mas una variante determinista en forma de pregunta) actua como query y el texto del fragmento como positivo. Se documenta el sha256 de los pares de entrenamiento (`f578d19a...`) y de la particion retenida (`a05f9283...`), asi como un fichero de procedencia por par. No se menciona RLHF ni DPO; el paradigma es puramente contrastivo con negativos en batch.

## Capacidades

- Generacion de embeddings de frases para recuperacion semantica (similitud coseno), con pipeline `feature-extraction`.
- Truncamiento Matryoshka a 1024, 512 y 256 dimensiones sin reentrenamiento.
- Recuperacion de texto sobre corpus tecnicos internos (documentacion, doctrina, notas).
- Consultas con prefijo de instruccion ("kit query instruction prefix") para el formato de query esperado.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico: es exclusivamente un encoder.
- Capacidad multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Busqueda semantica sobre documentacion interna: indexar fragmentos de un corpus propio y recuperar por similitud coseno con vectores truncados a 512 dimensiones, reduciendo coste de almacenamiento en el indice vectorial.
- RAG (retrieval-augmented generation) en pipelines propios: usar el modelo como recuperador de pasajes antes de un LLM generador, aprovechando su compatibilidad con text-embeddings-inference para servir el encoder por HTTP.
- Deduplicacion y agrupacion de documentos: calcular embeddings de titulos o fragmentos y agrupar por cercania para detectar contenido redundante en un almacen documental.
- Clasificacion ligera por vecino mas cercano: usar los embeddings como caracteristicas para un clasificador k-NN sobre un conjunto etiquetado pequeno, sin necesidad de entrenar un modelo supervisado adicional.
- Evaluacion comparativa de recuperadores: servir como baseline neuronal frente a BM25 en experimentos internos de IR, replicando la particion retenida documentada (214 queries sobre 214 fragmentos) mediante el esquema `held_out.schema.json`.
- Prototipado de sistemas de recomendacion de contenido textual: representar articulos o notas y recuperar los mas similares a un elemento de referencia, con truncado Matryoshka para ajustar latencia y memoria.
- Estudio de tecnicas de fine-tuning contrastivo: el repositorio documenta hashes de datos, hiperparametros y script de entrenamiento (`szl-estate/jobs/train_chakana.py`), lo que lo hace util como referencia reproducible de MatryoshkaLoss sobre un encoder de 0,6B.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a una evaluacion interna sobre una particion retenida de dos corpus del autor (214 queries, 214 fragmentos, split por grupo con semilla 11, relevancia binaria). No son resultados MTEB ni evidencia de calidad general de recuperacion.

| Metrica | chakana-r1 candidate | Baseline lexico BM25 |
|---|---|---|
| nDCG@10 | 0,833973 | 0,733582 |
| recall@1 | 0,766355 | 0,696262 |
| recall@5 | 0,859813 | 0,747664 |
| recall@10 | 0,929907 | 0,771028 |

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, BEIR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un encoder de ~0,6B en fp16 el orden de magnitud es de ~1,2 GB de pesos, y en fp32 ~2,4 GB, mas overhead de activaciones y tokenizador.
- GPU recomendadas: no especificadas por el autor; el propio autor sugiere flavor `a10g-large` para el job de entrenamiento, no para inferencia.
- Cabe en GPU de consumo: previsiblemente si en cualquier GPU con 4 GB o mas de VRAM en fp16 (no verificado en la informacion disponible).
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (declarado en los tags). No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chakana-r1 candidate | 595.776.512 | no disponible | nDCG@10 0,834 en particion interna SZL (no MTEB) | apache-2.0 | Hugging Face (repo candidato) |
| Qwen/Qwen3-Embedding-0.6B (base) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | apache-2.0 | Hugging Face |
| BM25 (baseline lexico) | no aplica | no aplica | nDCG@10 0,734 en la misma particion interna | no aplica | implementaciones multiples |

No se dispone de datos suficientes en la informacion proporcionada para comparar con otros encoders de la misma categoria (por ejemplo, variantes de E5, BGE o GTE); se indica "no disponible".

## Limitaciones y advertencias

- Artefacto "proposal-only": el propio autor indica que no debe integrarse en ningun sistema hasta que un humano lo acepte y el propietario firme `training_receipt.json`; el recibo figura como no firmado.
- No elegible para publicacion segun los metadatos del autor (`publication_eligible: false`).
- Evaluacion muy limitada: 214 queries sobre dos corpus internos con etiquetas debiles derivadas de titulos; no hay evidencia de calidad general de recuperacion ni resultados MTEB.
- Solo ingles declarado; comportamiento en castellano u otros idiomas no evaluado.
- Longitud de contexto no documentada; no apta para decidir truncados de entrada sin verificacion previa.
- Riesgo de sobreajuste a la distribucion de los corpus SZL (titulos como query), lo que puede degradar el rendimiento en dominios distintos.
- Riesgo de sesgos inherentes al corpus de entrenamiento (documentacion interna de una organizacion), no auditado.
- Sin datos de cuantizacion ni de latencia; el despliegue en produccion requeriria mediciones propias.
- El modelo no genera texto: cualquier expectativa de razonamiento, codigo o tool calling queda fuera de su alcance.
- El repositorio `SZLHOLDINGS/chakana` permanece como stub y no fue escrito por esta ejecucion; no debe confundirse con este candidato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chakana-r1-candidate
- Repositorio stub del proyecto: https://huggingface.co/SZLHOLDINGS/chakana
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Corpus de entrenamiento 1: https://huggingface.co/datasets/SZLHOLDINGS/szl-second-brain-inrepo
- Corpus de entrenamiento 2: https://huggingface.co/datasets/SZLHOLDINGS/rag-corpus-v1
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
