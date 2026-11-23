# Ugo96/jevmissense-glide-adapters

## Resumen

JevMissense es un conjunto de dos adaptadores LoRA publicados por Ugo96 sobre el modelo base fastino/GLiDE-9B, un transformer de 9.000 millones de parametros orientado a decisiones tipadas. El objetivo es convertir ese modelo generalista en un predictor de patogenicidad de variantes missense, es decir, determinar si un cambio de un solo aminoacido en una proteina es probablemente causante de enfermedad o benigno. El repositorio no redistribuye los pesos base: solo contiene los tensores LoRA y el cabezal de decision, con un total de 154 MB por adaptador y un tamano de repo de 0,3 GB.

La relevancia del proyecto reside en su doble enfoque. GLiDE-ClinVar se entrena con las 121.401 variantes del split de entrenamiento de ClinVar, separadas por gen respecto al test, y se posiciona como alternativa comparable a REVEL. GLiDE-PopGen evita las etiquetas de ClinVar durante la optimizacion y usa etiquetas proxy derivadas de gnomAD con una funcion de perdida positive-unlabelled y ranking pairwise intragenico, lo que lo hace comparable a AlphaMissense y PrimateAI-3D. Ambos adaptadores comparten configuracion LoRA (r=16, alpha=32 sobre q_proj, k_proj, v_proj y o_proj) y un unico epoch de entrenamiento con semilla 1.

El modelo esta marcado explicitamente como de uso exclusivo en investigacion y no validado para decisiones clinicas. La licencia fastino-community del modelo base impone sus terminos a los trabajos derivados, incluidos los relativos a uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer fastino/GLiDE-9B (adaptador PEFT en formato propietario medjev-glide-lora-v1) |
| Parametros totales | 9B en el modelo base; adaptadores de 154 MB cada uno (parametros del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la carga de referencia usa bfloat16) |
| Idiomas soportados | no disponible (la tarea es de clasificacion genomica, no generacion multilingue) |
| Licencia | fastino-community (otros terminos, ver LICENSE del modelo base) |
| Formato de pesos | safetensors (adapter_model.safetensors con tensores LoRA y cabezal de decision; no compatible con la carga directa de PEFT) |

## Arquitectura y entrenamiento

El modelo base GLiDE-9B es un transformer de 9.000 millones de parametros que formula cada tarea como una decision si/no tipada. Sobre el se aplican dos adaptadores LoRA de rango 16 y alpha 32 en las proyecciones de atencion q_proj, k_proj, v_proj y o_proj, entrenando simultaneamente el cabezal de lectura de decision. Cada variante se presenta en un unico forward pass como una pregunta de decision con un bloque de contexto que incluye el cambio proteico, una ventana de secuencia de 31 residuos, propiedades de los residuos de referencia y alternativo, contexto estructural de AlphaFold DB (pLDDT, accesibilidad relativa al disolvente, estructura secundaria, contactos y anotaciones UniProt) y conservacion de ortologos de Ensembl Compara en hasta 194 especies de vertebrados.

GLiDE-ClinVar se entrena con el split completo de ClinVar (121.401 variantes, disjuntas por gen respecto al test) durante un epoch, con learning rate 1e-4 y checkpoint en el paso 3200. GLiDE-PopGen se entrena sin etiquetas de ClinVar, usando etiquetas proxy derivadas de gnomAD con perdida positive-unlabelled y ranking pairwise intragenico, learning rate 3e-5 y checkpoint en el paso 200; ademas incorpora una linea de log-likelihood-ratio de ESM-2 650M. La seleccion de checkpoint se hizo sobre una muestra de validacion de 4.000 variantes de ClinVar sin solapamiento de variante ni de gen con el split de entrenamiento. En GLiDE-PopGen la puntuacion publicada no es la probabilidad cruda del modelo, sino sigmoid(logit(p) + 0,018087 * ESM2_LLR), con el coeficiente aprendido durante el fine-tuning y almacenado como plm_coef en adapter_config.json.

## Capacidades

- Prediccion de patogenicidad de variantes missense mediante una decision si/no tipada sobre el cambio proteico.
- Integracion de contexto estructural de AlphaFold DB (pLDDT, RSA, estructura secundaria, contactos) y anotaciones UniProt.
- Uso de conservacion evolutiva de ortologos de Ensembl Compara en hasta 194 especies de vertebrados.
- GLiDE-PopGen incorpora una señal adicional de ESM-2 650M como log-likelihood-ratio.
- Clasificacion de variantes a nivel de gen y de cohorte (ranking intragenico, estratos temporales).
- Evaluacion en cohortes de novo (DDD, ASD, CHD) y en Genebass, segun el paper.
- Mapeo de puntuaciones a criterios ACMG PP3/BP4 y calibracion, segun el paper.
- No soporta tool calling, agentes ni generacion de texto libre: la tarea es de clasificacion.

## Casos de uso

- Priorizacion de variantes en estudios de asociacion genetica: el modelo puntua variantes missense de un gen candidato y permite ordenar las observadas en cohortes de secuenciacion para seleccionar las que pasan a validacion funcional.
- Triaje en pipelines de diagnostico genomico (uso investigador): GLiDE-ClinVar puede prefiltrar variantes de significado incierto antes de la revision manual por un geneticista clinico, siempre como apoyo y no como decision.
- Comparacion metodologica de predictores dependientes e independientes de etiquetas: disponer de GLiDE-ClinVar y GLiDE-PopGen bajo el mismo backbone permite aislar el efecto de entrenar con ClinVar frente a etiquetas proxy de gnomAD.
- Analisis de cohortes de novo: el modelo se ha evaluado en cohortes DDD, ASD y CHD, por lo que es adecuado para enriquecer variantes de novo en estudios de neurodesarrollo.
- Anotacion masiva de variantes: el repositorio publica puntuaciones precalculadas para 2,3 millones de variantes de ClinVar en Ugo96/jevmissense-clinvar-scores, utiles para integracion en bases de datos internas sin reejecutar el modelo.
- Investigacion en conservacion evolutiva: el uso de ortologos de Ensembl Compara y de estructura de AlphaFold permite estudiar como la señal evolutiva y estructural contribuye a la prediccion de patogenicidad.
- Benchmarking de nuevos predictores: los resultados por gen, estratos temporales, ProteinGym y Genebass del paper sirven como referencia para comparar herramientas propias.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test de ClinVar disjunto por gen (n = 39.961 puntuadas, 11.688 patogenicas/probablemente patogenicas), metrica ROC-AUC:

| Modelo | Test ClinVar | AUROC en conjunto de seleccion |
|---|---|---|
| GLiDE-ClinVar | 0,977 | 0,9777 |
| GLiDE-PopGen | 0,957 | 0,9642 |
| GLiDE-9B zero-shot | 0,927 | no disponible |

Los resultados por gen, estratos temporales, ProteinGym, cohortes de novo DDD/ASD/CHD y Genebass, junto con la calibracion y el mapeo ACMG PP3/BP4, se remiten al paper, no incluido en la informacion disponible.

## Requisitos de hardware

- El modelo base son 9.000 millones de parametros; en bfloat16 requiere aproximadamente 18 GB solo para pesos, mas memoria para el contexto estructural y de conservacion.
- Los adaptadores anaden 154 MB cada uno, un coste despreciable frente al base.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia comoda en bfloat16; una RTX 4090 de 24 GB puede ser ajustada y probablemente requiera cuantizacion o descarga por capas.
- Cabe en GPU de consumo solo con cuantizacion o tecnicas de offloading; no se proporcionan recetas de cuantizacion en la informacion disponible.
- Despliegue: la carga de referencia usa el paquete medjev (finetune_glide.load_glide y apply_adapter); los adaptadores no se cargan con PEFT directamente por usar el formato medjev-glide-lora-v1. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-ClinVar | 9B + LoRA | no disponible | Entrenado con etiquetas ClinVar | fastino-community | Hugging Face (adaptador) |
| GLiDE-PopGen | 9B + LoRA | no disponible | Sin etiquetas ClinVar, proxy gnomAD + ESM-2 | fastino-community | Hugging Face (adaptador) |
| REVEL | no disponible | no disponible | Ensemble entrenado con ClinVar | no disponible | Herramienta externa |
| AlphaMissense | no disponible | no disponible | Prediccion sin etiquetas ClinVar, calibrada con ClinVar | no disponible | Herramienta externa |
| PrimateAI-3D | no disponible | no disponible | Prediccion basada en conservacion de primates | no disponible | Herramienta externa |

Los datos de parametros, contexto y licencia de REVEL, AlphaMissense y PrimateAI-3D no estan disponibles en la informacion proporcionada; la comparativa se limita al enfoque metodologico declarado por el autor.

## Limitaciones y advertencias

- Uso exclusivo en investigacion; no validado para decisiones clinicas.
- GLiDE-ClinVar se entrena con etiquetas de ClinVar, por lo que es comparable a REVEL y no a predictores libres de etiquetas; las submissions recientes de ClinVar pueden citar predictores computacionales como evidencia, de modo que la concordancia con etiquetas recientes es en parte circular.
- Se desconoce la exposicion del pretraining de GLiDE-9B a texto de ClinVar.
- En GLiDE-PopGen, "libre de ClinVar" significa que no entraron etiquetas de ClinVar en la optimizacion de pesos, pero se uso validacion de ClinVar para seleccion de checkpoint y calibracion, igual que hace AlphaMissense.
- Los adaptadores son obras derivadas de GLiDE-9B y quedan sujetos a la licencia fastino-community, cuyos terminos de uso comercial vinculan a los receptores.
- No se documentan sesgos demograficos ni de composicion del dataset mas alla de las fuentes citadas (ClinVar, gnomAD, Ensembl Compara, AlphaFold DB).
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de sobreconfianza en puntuaciones fuera de la distribucion de entrenamiento.
- El formato de adaptador propietario impide la carga directa con PEFT y limita la portabilidad a otras herramientas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Ugo96/jevmissense-glide-adapters
- Modelo base: https://huggingface.co/fastino/GLiDE-9B
- Licencia del modelo base: https://huggingface.co/fastino/GLiDE-9B/blob/main/LICENSE
- Puntuaciones precalculadas de ClinVar: https://huggingface.co/datasets/Ugo96/jevmissense-clinvar-scores
