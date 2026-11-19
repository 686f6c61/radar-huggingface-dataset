# virtual-human-chc/hyformer_molecules_50M

## Resumen

Hyformer es un modelo transformer de dominio cientifico disenado especificamente para quimica computacional y diseno molecular. Lo desarrollan Adam Izdebski et al. (Szczurek Lab) y esta publicado en arXiv (2504.16559). Su particularidad es que unifica en una sola arquitectura un decodificador generativo (que produce moleculas en formato SMILES) y un codificador predictivo (que extrae representaciones y predice propiedades), usando mascaras de atencion causales o bidireccionales segun la tarea. Esta version concreta, `hyformer_molecules_50M`, es un fork del repositorio original `SzczurekLab/hyformer_molecules_50M` y se ha entrenado sobre 19 millones de moleculas procedentes de ZINC, ChEMBL y otros conjuntos de moleculas adquiribles.

El modelo es relevante porque aborda un problema clasico en el diseno de farmacos: tradicionalmente los modelos generativos y los predictivos se entrenan por separado, lo que desacopla la generacion de moleculas de la optimizacion de propiedades. Hyformer demuestra que el preentrenamiento conjunto aporta beneficios sinergicos en muestreo condicional, prediccion fuera de distribucion y aprendizaje de representaciones. La escala de 50 millones de parametros lo situa en un rango manejable para experimentacion academica e industrial sin infraestructura masiva.

La entrada son cadenas SMILES y la salida puede ser un vector de 512 dimensiones por compuesto (extraccion de caracteristicas) o valores de propiedad (prediccion). El repositorio ocupa 0,6 GB y se distribuye bajo licencia BSD-3-Clause, lo que facilita su uso comercial y su modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion alternante (mascara causal y bidireccional), codificador y decodificador unificados |
| Parametros totales | 50M (segun el identificador del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de SMILES de 128 tokens segun la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada en formato SMILES, no lenguaje natural) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `ckpt.pt` (PyTorch), con `vocab.txt`, `tokenizer_config.json` y `downstream_config.json` |

## Arquitectura y entrenamiento

Hyformer emplea un transformer unico que actua como codificador o decodificador segun la mascara de atencion aplicada. Con mascara causal funciona como modelo generativo autorregresivo que produce secuencias SMILES; con mascara bidireccional funciona como codificador que genera representaciones y predicciones. El mecanismo clave es la atencion alternante combinada con un esquema de preentrenamiento conjunto que optimiza simultaneamente la generacion de moleculas y la prediccion de propiedades. La representacion por compuesto es un vector de 512 dimensiones.

El entrenamiento de esta version se realizo sobre 19 millones de moleculas de ZINC, ChEMBL y conjuntos de moleculas adquiribles (Zhou et al., 2023). El repositorio incluye otras variantes: `hyformer_molecules_8M` (entrenada en GuacaMol), `hyformer_peptides_34M` (3,5 millones de peptidos) y `hyformer_peptides_34M_MIC` (ajustada conjuntamente sobre valores de concentracion inhibitoria minima contra E. coli). La model card menciona que el modelo demuestra beneficios del aprendizaje conjunto en el descubrimiento de peptidos antimicrobianos novedosos. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de moleculas en formato SMILES mediante decodificacion autorregresiva (mascara causal).
- Extraccion de caracteristicas: representacion de 512 dimensiones por compuesto quimico.
- Prediccion de propiedades moleculares mediante clasificacion o regresion (una salida por compuesto).
- Muestreo condicional: generacion de moleculas orientada a propiedades objetivo.
- Prediccion de propiedades fuera de distribucion, segun los resultados del paper.
- Aprendizaje de representaciones moleculares utiles para tareas posteriores (downstream).
- Capacidad de ajuste fino conjunto para tareas especificas (por ejemplo, prediccion de MIC en peptidos).

## Casos de uso

- Descubrimiento de farmacos: el modelo puede generar moleculas candidatas en SMILES y evaluar simultaneamente propiedades farmacocineticas, reduciendo el ciclo de iteracion entre generacion y filtrado en etapas tempranas.
- Cribado virtual: usando la extraccion de caracteristicas de 512 dimensiones, se pueden construir clasificadores sobre representaciones moleculares para priorizar compuestos en bibliotecas grandes antes de sintetizarlos.
- Prediccion de toxicidad y propiedades ADMET: el modo codificador permite ajustar cabeceras de clasificacion/regresion sobre propiedades especificas, util para descartar candidatos problematicos en etapas tempranas.
- Diseno de peptidos antimicrobianos: las variantes de peptidos del mismo proyecto demuestran el uso del modelo para generar y priorizar peptidos con actividad contra bacterias como E. coli, un area con necesidad de nuevos antibioticos.
- Optimizacion molecular condicionada: el muestreo condicional permite generar moleculas que cumplan restricciones de propiedad (por ejemplo, solubilidad o afinidad), util en quimica medicinal.
- Investigacion en representaciones moleculares: el modelo sirve como extractor de embeddings para experimentos de aprendizaje autosupervisado y comparacion de arquitecturas en quimica computacional.
- Generacion de bibliotecas virtuales: produccion de conjuntos de moleculas novedosas para exploracion de espacio quimico en proyectos de descubrimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos no incluyen tablas de MMLU, HumanEval, GSM8K ni metricas especificas de quimica (como validacion de SMILES, novedad o metricas de GuacaMol/MoleculeNet). El paper de arXiv (2504.16559) es la fuente indicada para resultados detallados, pero sus cifras no se recogen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 50M de parametros, la inferencia en precision completa requiere aproximadamente 0,2 GB de pesos, mas memoria para activaciones y batches; en la practica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100). No se requieren aceleradores de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU para batches pequenos.
- Opciones de despliegue: el repositorio proporciona codigo Python propio (`hyformer.models.auto.AutoModel`, `AutoTokenizer`) con dependencias gestionadas via conda (`environment.yaml`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a este formato de pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hyformer molecules 50M | 50M | 128 tokens SMILES (max.) | Generacion + prediccion molecular | BSD-3-Clause | Hugging Face |
| Hyformer molecules 8M | 8M | no disponible | Generacion + prediccion molecular | BSD-3-Clause (presumible, mismo proyecto) | Hugging Face |
| Hyformer peptides 34M | 34M | no disponible | Generacion + prediccion de peptidos | BSD-3-Clause (presumible, mismo proyecto) | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de quimica (por ejemplo, ChemBERTa, MolFormer o modelos generativos como REINVENT) en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena con moleculas de ZINC, ChEMBL y conjuntos adquiribles, por lo que su espacio quimico esta sesgado hacia compuestos ya representados en esas bases de datos; puede generar moleculas menos diversas o poco representativas de quimica inexplorada.
- Riesgo de alucinacion: como modelo generativo, puede producir cadenas SMILES invalidas o quimicamente no sintetizables; es imprescindible validar la salida con herramientas de quimioinformatica (RDKit) antes de cualquier uso practico.
- Limitaciones de contexto o idioma: la longitud maxima de SMILES es de 128 tokens, lo que limita la generacion de moleculas grandes o complejas; no es un modelo de lenguaje natural y no procesa texto.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificacion con atribucion y sin endorsement; conviene revisar los terminos exactos del repositorio original de SzczurekLab.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes, es un fork reciente (creado en diciembre de 2025) y el codigo de inferencia depende de un entorno conda especifico; no se documentan procesos de validacion, versionado de pesos ni garantias de mantenimiento. La model card original advierte que es un fork del repositorio de SzczurekLab, por lo que la fuente canonica es el repositorio original.

## Enlaces

- Hugging Face (este fork): https://huggingface.co/virtual-human-chc/hyformer_molecules_50M
- Hugging Face (repositorio original): https://huggingface.co/SzczurekLab/hyformer_molecules_50M
- Repositorio GitHub: https://github.com/szczurek-lab/hyformer/tree/main
- Paper (arXiv): https://arxiv.org/abs/2504.16559
- Referencia del dataset de moleculas adquiribles (Zhou et al., 2023): https://openreview.net/forum?id=1pPpKc9wR0Y
- Referencia GuacaMol (Brown et al., 2019): https://jcheminf.biomedcentral.com/articles/10.1186/s13321-019-0351-9
