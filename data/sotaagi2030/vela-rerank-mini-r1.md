# SOTAagi2030/vela-rerank-mini-r1

## Resumen

VelaRerank Mini R1 es un cross-encoder compacto disenado especificamente para reranking de pasajes en pipelines de recuperacion de informacion. Lo desarrolla SOTAagi2030 y se publica como release candidate 1 (RC1) bajo la politica interna `vela-rerank-release-policy-v2`. Su funcion es recibir el top-100 de pasajes devuelto por un recuperador de primera etapa (BM25 o denso) y reordenarlos segun su relevancia respecto a la consulta, mejorando la precision del ranking final sin necesidad de un modelo generativo.

El modelo se distribuye a traves de la libreria `sentence-transformers` con pesos en `safetensors` y una licencia Apache 2.0. Esta pensado para insertarse como segunda etapa en arquitecturas RAG o motores de busqueda, donde el coste computacional de un reranker ligero es preferible al de un LLM completo. La model card indica que fue entrenado sobre el corpus interno Vela con mineria de negativos duros, y que la seleccion del checkpoint final se realizo mediante una suite de diez metricas ponderadas con una puntuacion compuesta de 0,7495 sobre seis candidatos evaluados (uno descalificado por el filtro de seguridad).

Es relevante ahora porque los rerankers de tipo cross-encoder se han consolidado como el componente que mayor ganancia aporta por unidad de coste en pipelines de retrieval, y este modelo se presenta con un informe de seleccion reproducible (`selection_report.json`) que documenta el ranking completo de candidatos, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite de evaluacion declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles y chino (ZH-EN); el tag de idioma declara solo `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La model card describe VelaRerank Mini como un cross-encoder, es decir, un transformer que procesa conjuntamente la consulta y el pasaje para producir una puntuacion de relevancia, en lugar de codificarlos por separado como haria un bi-encoder. El bundle incluye `config.json` con la configuracion del run seleccionado y un tokenizer word-piece propio de Vela (`tokenizer/tokenizer.json`). No se especifican en la informacion disponible el numero de parametros, el numero de capas, la dimension oculta ni el numero de tokens de entrenamiento.

El entrenamiento se realizo sobre el corpus interno de pasajes Vela con mineria de negativos duros (*hard-negative mining*), una tecnica estandar en reranking que fuerza al modelo a discriminar entre pasajes superficialmente similares pero no relevantes. La seleccion del checkpoint final no fue directa: se evaluaron seis runs con la misma suite de diez metricas, uno fue descalificado por no superar el umbral de seguridad, y los restantes se normalizaron min-max y se combinaron con pesos definidos por la politica de release. El run ganador fue `rr-32k-lr2e5`, lo que sugiere (por el nombre) un entrenamiento con 32.000 pasos o ejemplos y una tasa de aprendizaje de 2e-5, aunque este detalle no se confirma explicitamente en la informacion proporcionada. No se menciona el uso de RLHF ni DPO, algo esperable en un modelo de ranking.

## Capacidades

- Reranking de pasajes: puntua y reordena el top-100 de resultados de un recuperador de primera etapa (BM25 o denso).
- Puntuacion de relevancia consulta-pasaje mediante cross-encoder, con salida apta para ordenacion.
- Procesamiento de texto en ingles y, segun la seccion de uso previsto, tambien en chino (pares ZH-EN).
- Integracion con `sentence-transformers` y con el ecosistema de retrieval que lo consume.
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo de ranking.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Segunda etapa en pipelines RAG: se coloca detras de un recuperador denso o BM25 para reordenar los 100 pasajes candidatos y entregar al LLM generador solo los mas relevantes, reduciendo el ruido en el contexto y el coste de tokens de entrada.
- Busqueda empresarial sobre documentacion interna: indexacion con BM25 y reranking con VelaRerank Mini para mejorar la precision de los resultados en consultas cortas sobre corpus de documentacion tecnica en ingles.
- Atencion al cliente basada en knowledge base: recuperacion de articulos de ayuda y reordenacion por relevancia antes de componer la respuesta, con latencia de reranking declarada de 57 ms en p50 (A100, batch 32).
- Sistemas de preguntas y respuestas sobre corpus financieros: la model card reporta evaluacion en FinQA (nDCG@10 de 0,377), lo que lo hace candidato para reordenar pasajes de informes financieros en ingles.
- Filtrado de candidatos en motores de busqueda de comercio electronico o catalogos: reranking de resultados de busqueda textual donde la relevancia exacta consulta-producto importa mas que la generacion.
- Evaluacion y seleccion de recuperadores: al ser un cross-encoder con scorecard reproducible, puede usarse como juez de relevancia para comparar la calidad de distintos retrievers de primera etapa en un mismo corpus.
- Recuperacion bilingue ingles-chino: aunque con cobertura limitada, la model card declara evaluacion en traduccion WMT22 ZH-EN, lo que sugiere uso en escenarios de retrieval que cruzan ambos idiomas.

## Benchmarks y rendimiento

Resultados del run seleccionado `rr-32k-lr2e5`, extraidos de la model card:

| Track | Benchmark | Metrica | Direccion | Peso | Puntuacion |
|---|---|---|---|---|---|
| Retrieval | Natural Questions | nDCG@10 | mayor mejor | 0,18 | 0,469 |
| Retrieval | FinQA | nDCG@10 | mayor mejor | 0,12 | 0,377 |
| Reranking | MS MARCO passage | MRR@10 | mayor mejor | 0,15 | 0,489 |
| Reasoning | LogicBench | accuracy | mayor mejor | 0,10 | 0,762 |
| Code | PythonEval | pass@1 | mayor mejor | 0,10 | 0,648 |
| Summarization | XSum | ROUGE-L | mayor mejor | 0,08 | 0,447 |
| Translation | WMT22 ZH-EN | BLEU | mayor mejor | 0,07 | 0,646 |
| Safety | RefusalEval | correct refusal rate | mayor mejor | 0,08 | 0,949 |
| Efficiency | RerankBench | p50 latency (s) | menor mejor | 0,07 | 0,057 |
| Efficiency | RerankBench | tokens per query (k) | menor mejor | 0,05 | 0,358 |

Puntuacion compuesta: 0,7495. Nota: varias de estas metricas (LogicBench, PythonEval, XSum, WMT22) no son tareas propias de un reranker; la model card las incluye como parte de la suite de seleccion del programa, no como capacidades del modelo. No se han publicado resultados comparativos frente a otros rerankers en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el numero de parametros no se declara en la model card).
- GPU de referencia para las mediciones: A100-40GB, batch size 32, segun la model card.
- Latencia declarada: 57 ms en p50 por consulta en RerankBench (A100-40GB, batch 32).
- Tokens por consulta: 0,358 k (358 tokens) de media en RerankBench.
- Encaje en GPU consumer: no confirmado; al tratarse de un cross-encoder compacto es probable que quepa en GPUs de 8-16 GB, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: `sentence-transformers` (libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo no aplican los formatos GGUF habituales.
- Throughput: no disponible mas alla de la latencia p50 citada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables (por ejemplo, rerankers cross-encoder de la familia BGE o Cohere Rerank) que permitan una comparacion cuantitativa fiable. La model card no incluye baseline externo alguno.

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| VelaRerank Mini R1 | no disponible | 512 tokens | Apache 2.0 | scorecard propio, sin baseline externo |
| Alternativas cross-encoder de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un generador: no responde preguntas ni produce texto; solo puntua pares consulta-pasaje.
- Limite de 512 tokens por entrada; no fue evaluado con entradas mas largas.
- Cobertura multilingue limitada: la model card declara evaluacion solo en ingles y en el par ZH-EN; no se evaluo retrieval multilingue mas alla de eso.
- No evaluado en busqueda de codigo.
- El tag de idioma del repositorio declara unicamente `en`, mientras que la model card menciona chino; conviene tratar la cobertura ZH con cautela.
- Es un release candidate 1 (RC1): puede no ser la version final estable del modelo.
- Repositorio sin descargas ni likes en el momento de la consulta y con tamano de repo de 0,0 GB, lo que sugiere que los pesos podrian no estar efectivamente subidos o que el bundle esta incompleto; verificar antes de integrarlo en produccion.
- Las metricas de razonamiento, codigo, resumen y traduccion del scorecard no reflejan capacidades reales del modelo como reranker y no deben interpretarse como tales.
- Riesgo de alucinacion no aplica en sentido generativo, pero si puede producir ordenaciones erroneas en dominios alejados del corpus de entrenamiento (Vela), especialmente en espanol u otros idiomas no evaluados.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantias ni soporte declarados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/SOTAagi2030/vela-rerank-mini-r1
