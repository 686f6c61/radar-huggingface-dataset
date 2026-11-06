# Syzseisus/S3-Prompt

## Resumen

S³-Prompt es un artefacto de investigacion publicado por Wooseong Syz Cho y Ha-Myung Park (Syzseisus) que acompana al articulo "S³-Prompt: Resolving Activity Cliffs via Structure-Disentangled Molecular Graph-Text Alignment", aceptado en CIKM '26. No se trata de un modelo de lenguaje de proposito general, sino de un conjunto de checkpoints y resultados experimentales para prediccion de propiedades moleculares, con enfasis en la resolucion de "activity cliffs" (pares de moleculas estructuralmente similares con actividad biologica muy distinta) mediante alineamiento grafo-texto con prompts suaves.

El repositorio contiene 27 ejecuciones que cubren 31 de las 40 celdas de las Tablas 2, 3, 5 y 7 del articulo, con configuraciones de ablacion (indices A a G segun descomposicion, LoRA y triplet loss), modalidad de recuperacion (fingerprints topologicos o embeddings semanticos) y numero de ejemplos en contexto (k=2 o k=8). Los checkpoints incluyen un GNN, proyectores y adaptadores LoRA sobre un backbone tipo LLaMA.

Es relevante para investigadores en descubrimiento de farmacos y aprendizaje molecular que quieran reproducir los resultados del paper o reutilizar los checkpoints para clasificacion (BACE, BBBP) y regresion (ESOL, LIPOPHILICITY) de propiedades moleculares. El repositorio ocupa 15,7 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN + proyectores + backbone tipo LLaMA con LoRA y soft prompts (alineamiento grafo-texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`) con adaptadores LoRA; no se distribuyen pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de grafos moleculares (GNN) con un modelo de lenguaje tipo LLaMA, unidos mediante proyectores y entrenados con alineamiento grafo-texto. El mecanismo central es un "soft prompt" que desacopla la representacion estructural de la textual para mitigar el problema de los activity cliffs, donde moleculas casi identicas en estructura presentan actividades divergentes. El entrenamiento emplea aprendizaje en contexto (in-context learning) con k ejemplos recuperados, bien por fingerprints topologicos (FP) o por similitud semantica (Sem).

La ablacion del paper descompone el sistema en siete variantes (A a G) que activan o desactivan tres componentes: descomposicion (ninguna, textual o suave), adaptadores LoRA y triplet loss. La configuracion de referencia del paper es k=8 con instruccion completa (`k8_full`). Los runs de regresion con LoRA (indices C y G) se entrenaron con rango 8 y alpha 16, mientras que los de clasificacion usan rango 12 y alpha 24. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Prediccion de propiedades moleculares: clasificacion binaria (BACE, BBBP) y regresion (ESOL, LIPOPHILICITY).
- Resolucion de activity cliffs mediante alineamiento estructura-texto desacoplado.
- Aprendizaje en contexto con recuperacion de ejemplos (k=2 y k=8) por fingerprints topologicos o embeddings semanticos.
- Soporte de soft prompts y adaptadores LoRA para adaptacion eficiente.
- No es un modelo conversacional ni de generacion de texto general.
- No se documenta soporte de tool calling, agentes ni capacidades multimodales.
- Capacidades multilingues: no disponible.

## Casos de uso

- Reproduccion de resultados academicos: descargar los checkpoints y `args.json` de cada run para replicar las Tablas 2, 3, 5 y 7 del paper en entornos de investigacion.
- Filtrado temprano en descubrimiento de farmacos: usar el modelo para priorizar compuestos con actividad biologica probable antes de sintesis, aprovechando su tratamiento especifico de activity cliffs.
- Analisis de SAR (structure-activity relationships): identificar pares de moleculas estructuralmente proximas con actividades divergentes, un escenario donde los modelos estandar suelen fallar.
- Prediccion de solubilidad y lipofilia (ESOL, LIPOPHILICITY) para cribado ADMET preliminar en pipelines de quimioinformatica.
- Investigacion en alineamiento multimodal: servir como base para estudiar tecnicas de soft prompting y descomposicion estructura-texto en dominios cientificos.
- Evaluacion comparativa de estrategias de recuperacion: comparar recuperacion por fingerprints frente a semantica en tareas de in-context learning molecular.
- Desarrollo de herramientas de quimica computacional: integrar los checkpoints en scripts de Python que procesen lotes de moleculas en formato SMILES o grafo.

## Benchmarks y rendimiento

Los resultados publicados en el repositorio se refieren a las tablas del paper. Algunos valores citados en la model card:

| Tarea / dataset | Configuracion | Metrica | Valor |
|---|---|---|---|
| BACE (clasificacion) | S³-Prompt (Sem) | AUC | 0,831 |
| BBBP (clasificacion) | S³-Prompt (FP) | AUC | 0,903 |
| BACE (ablacion, indice E, FP) | k=2 short | AUC | 0,845 |
| BACE (ablacion, indice E, FP) | k=2 full | AUC | 0,873 |
| BACE (indice F, Table 3) | run liberado | AUC | 0,877 (paper: 0,878) |
| LIPO (regresion, indice D) | — | RMSE | 0,9574 |
| LIPO (regresion, indice E) | — | RMSE | 1,0056 |
| LIPO (regresion, indice F) | — | RMSE | 1,0236 |
| ESOL (regresion, indice D) | — | RMSE | 1,5855 |
| ESOL (regresion, indice F) | — | RMSE | 1,3788 |

No se dispone de comparaciones con modelos de proposito general ni de resultados MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 15,7 GB, por lo que cargar un unico checkpoint requiere bastante menos, pero no se documenta el tamano por run.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del backbone tipo LLaMA y los adaptadores LoRA, es plausible que quepa en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o 4090), pero esto no esta confirmado.
- Opciones de despliegue: al ser checkpoints PyTorch con `transformers`, el despliegue se haria mediante scripts de Python propios del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de prediccion de propiedades moleculares ni con alternativas de alineamiento grafo-texto.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: no debe usarse para generacion de texto, codigo ni tareas conversacionales.
- Cobertura incompleta: solo se liberan 31 de las 40 celdas de las tablas del paper; faltan runs clave como BACE · S³-Prompt (Sem) 0,831 y BBBP · S³-Prompt (FP) 0,903 en la Tabla 2.
- Los runs de regresion con indices D y F no se liberan porque se entrenaron con triplet loss activa, lo que no coincide con la configuracion descrita en la tabla.
- Los checkpoints de los indices A y B no existen (son solo inferencia), y varios runs no incluyen `epoch_*.pt`.
- Discrepancias menores entre resultados liberados y cifras del paper (por ejemplo, BACE indice F: 0,877 frente a 0,878).
- Los runs de regresion con LoRA usan rango 8/alpha 16, distinto del rango 12/alpha 24 del paper, lo que puede afectar a la reproducibilidad.
- Sesgos y alucinaciones: no documentados, pero al ser un modelo cientifico entrenado con datasets quimicos especificos, su generalizacion a otras familias de compuestos no esta garantizada.
- Licencia MIT permite uso comercial, pero el modelo depende de un backbone tipo LLaMA cuyas condiciones no se detallan en la informacion disponible.
- No hay informacion sobre idiomas, contexto maximo ni cuantizacion, lo que limita su evaluacion para entornos de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Syzseisus/S3-Prompt
- Codigo: https://github.com/Syzseisus/S3-Prompt
- Dataset preprocesado: https://huggingface.co/datasets/Syzseisus/S3-Prompt
- Paper (CIKM '26): DOI 10.1145/3799682.3841121
