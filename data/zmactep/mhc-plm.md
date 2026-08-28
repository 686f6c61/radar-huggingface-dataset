# zmactep/MHC-PLM

## Resumen

MHC-PLM es un modelo de investigación para la predicción conjunta de afinidad de unión (BA) y presentación de ligandos eluidos (EL) de péptidos a moléculas MHC de clase II. Desarrollado por Pavel Yakovlev (zmactep), combina codificadores de proteínas ESM-C de EvolutionaryScale (ESMC-300M y ESMC-600M) con mecanismos de cross-attention entre péptido y MHC, enumeración explícita de registros de unión de 9 residuos, pooling multi-instancia multi-alélico y una rama específica para el contexto de procesamiento de ligandos eluidos. El modelo se publica como un ensemble de cuatro miembros seleccionados sobre un subconjunto disjunto de péptidos de 9-meros y congelados antes de la evaluación en el pliegue completo restante. Los pesos liberados son adaptadores LoRA compactos y cabezas de interacción; los modelos base se descargan por separado en revisiones exactas. La licencia es de uso investigador y el autor advierte explícitamente que no es un dispositivo médico ni debe considerarse estado del arte sin validaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 4 miembros basados en ESM-C (ESMC-300M y ESMC-600M) con cross-attention peptido-MHC, enumeracion de registros 9-mer, pooling multi-instancia y rama EL |
| Parametros totales | No disponible (los adaptadores LoRA son compactos; los backbones tienen 300M y 600M parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (trabaja con secuencias de peptidos y pseudosecuencias MHC) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biologico, secuencias de aminoacidos) |
| Licencia | mhc-plm-research-weight-notice (uso investigador) |
| Formato de pesos | PyTorch (state dictionaries LoRA) |

## Arquitectura y entrenamiento

La arquitectura combina codificadores ESM-C congelados (pinned) con una cabeza de interaccion que implementa cross-attention peptido-a-MHC, enumeracion explicita de registros de union de 9 residuos en orientacion directa e inversa, pooling multi-instancia para manejar multiples alelos simultaneamente, y una rama separada que procesa el contexto flanqueante para la tarea de ligandos eluidos. Los pesos liberados son exclusivamente adaptadores LoRA y state dictionaries de la cabeza de interaccion; los modelos base se descargan por separado en revisiones exactas (ESMC-300M@a59b8317 y ESMC-600M@a7e82012). El entrenamiento se realizo sobre el pliegue 1 del dataset NetMHCIIpan 4.3, con 21.794 filas de afinidad de union y 1.516.156 filas de ligandos eluidos (prevalencia positiva EL de 0,08165). El ensemble final se selecciono sobre un subconjunto disjunto de peptidos de 9-meros y se congelo antes de evaluar en el pliegue completo restante. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, que no aplican a un modelo discriminativo de este tipo.

## Capacidades

- Prediccion de afinidad de union a MHC clase II (BA) con salida continua, evaluada mediante AUROC a 500 nM, average precision, correlacion de Pearson y error cuadratico medio.
- Prediccion de presentacion de ligandos eluidos (EL) con salida binaria, evaluada mediante AUROC y average precision.
- Soporte multi-alelico: acepta listas de alelos y pseudosecuencias MHC correspondientes, separadas por punto y coma.
- Manejo de contexto flanqueante para la tarea EL: tres residuos aguas arriba, los tres primeros residuos del peptido, los tres ultimos y tres residuos aguas abajo.
- Inferencia por ensemble: la prediccion final es la media aritmetica de las puntuaciones post-sigmoides de los cuatro miembros.
- Verificacion de integridad: el CLI comprueba el SHA-256 completo de cada archivo adaptador antes de cargarlo.
- No es un modelo generativo de lenguaje; es un predictor discriminativo especializado en inmunologia.

## Casos de uso

- Seleccion de neoantigenos para inmunoterapia: el modelo puede priorizar peptidos derivados de mutaciones tumorales que probablemente se presenten via MHC-II, ayudando a disenar vacunas personalizadas contra el cancer.
- Diseno de vacunas de peptidos: permite filtrar candidatos vacunales evaluando su afinidad de union a alelos HLA-II relevantes en una poblacion objetivo, reduciendo el numero de candidatos a validar experimentalmente.
- Priorizacion de epitopos para ensayos de laboratorio: los investigadores pueden usar las puntuaciones BA y EL para ordenar peptidos sinteticos antes de realizar ensayos de union o de presentacion celular, ahorrando tiempo y recursos.
- Analisis de presentacion antigenica en investigacion basica: el modelo puede explorar como variaciones en la secuencia del peptido o en el alelo HLA afectan a la presentacion, generando hipotesis sobre mecanismos inmunologicos.
- Filtrado de candidatos a peptidos terapeuticos: en el desarrollo de peptidos con actividad moduladora de la respuesta inmune, MHC-PLM puede descartar rapidamente aquellos con baja probabilidad de presentacion antes de sintetizarlos.
- Estudios de asociacion HLA-enfermedad: permite evaluar si peptidos derivados de proteinas asociadas a enfermedades autoinmunes tienen mayor afinidad por alelos de riesgo, contribuyendo a entender la base molecular de la susceptibilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre el dataset NetMHCIIpan 4.3 fold 1 audit excluyendo las filas de seleccion fija. No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| BA AUROC a 500 nM | 0,888150 |
| BA average precision a 500 nM | 0,852977 |
| BA Pearson r | 0,765403 |
| BA Spearman r | 0,765560 |
| BA mean squared error | 0,028142 |
| EL AUROC | 0,964408 |
| EL average precision | 0,811073 |

El autor tambien reporta el resultado de seleccion en el subconjunto disjunto (composite 0,866341) y el resultado del pliegue completo congelado (composite 0,857258). El mejor modelo individual es `stage4` con composite 0,852588; el ensemble preseleccionado mejora esa cifra en 0,004671.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la informacion disponible. A partir del tamano de los backbones (ESMC-300M y ESMC-600M) y del hecho de que los adaptadores LoRA ocupan 0,1 GB, se puede estimar:

- VRAM estimada para inferencia: los backbones de 300M y 600M requieren aproximadamente 1,2 GB y 2,4 GB en precision FP16 respectivamente, mas la cabeza de interaccion y los adaptadores. Un ensemble completo podria necesitar entre 4 y 8 GB de VRAM si se cargan los miembros secuencialmente, como indica el CLI.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, A10, etc.) deberia ser suficiente para inferencia por lotes pequenos. Para produccion con alto rendimiento, una A100 o H100 ofreceria mayor throughput.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo modernas con 8 GB o mas de VRAM.
- Opciones de despliegue: el CLI oficial `mhc2-plm-predict` es la via principal; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son herramientas para modelos generativos y no aplican directamente a este predictor discriminativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionan comparaciones directas con otros predictores de MHC-II en la informacion disponible. Existen alternativas establecidas como NetMHCIIpan 4.3, MixMHC2pred o BERTMHC (tambien del mismo autor), pero no se dispone de datos numericos para una comparativa rigurosa. El autor advierte que MHC-PLM no debe describirse como estado del arte sin validaciones adicionales, lo que sugiere que aun no ha demostrado superioridad sobre los metodos existentes.

## Limitaciones y advertencias

- No es un dispositivo medico y no ha sido validado para la toma de decisiones clinicas.
- El autor desaconseja describirlo como estado del arte; requiere comparaciones baseline en las mismas condiciones, validacion en todos los pliegues, pruebas temporales externas y estimacion de incertidumbre antes de cualquier afirmacion de superioridad.
- La licencia mhc-plm-research-weight-notice restringe el uso a fines de investigacion; no se permite uso comercial sin autorizacion explicita.
- El modelo fue entrenado exclusivamente con pseudosecuencias MHC-II, no con cadenas completas ni alelos en formato crudo; los datos de entrada deben ajustarse a ese formato.
- El peptido de entrada debe contener al menos nueve residuos; secuencias mas cortas no son validas.
- La tarea EL requiere contexto flanqueante especifico (tres residuos aguas arriba y tres aguas abajo); sin ese contexto, la prediccion EL no es fiable.
- Riesgo de alucinacion: al ser un modelo discriminativo, no genera texto, pero las predicciones pueden ser incorrectas para alelos o peptidos fuera de la distribucion de entrenamiento.
- Sesgos: el dataset NetMHCIIpan 4.3 tiene una cobertura desigual de alelos HLA, lo que puede introducir sesgos hacia los alelos mas representados.
- El ensemble se selecciono sobre un subconjunto disjunto de peptidos de 9-meros, pero la evaluacion final se realizo sobre el pliegue completo; aun asi, no hay validacion externa independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zmactep/MHC-PLM
- Repositorio GitHub (codigo de inferencia): https://github.com/zmactep/MHC-PLM
- Licencia de pesos: https://huggingface.co/zmactep/MHC-PLM/blob/main/LICENSE_WEIGHTS.md
- Perfil del autor en GitHub: https://github.com/zmactep
- Modelo relacionado del mismo autor (BERTMHC): https://huggingface.co/zmactep/bertmhc
