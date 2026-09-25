# Xu-AI4Science/MARRI

## Resumen

MARRI (mechanism-aware multimodal framework for RNA--RNA interaction prediction) es un modelo de aprendizaje profundo para predecir la probabilidad de interaccion entre pares de moleculas de RNA. Lo desarrolla Xu-AI4Science (Hao Xu) y se distribuye en HuggingFace como un conjunto de checkpoints entrenados, con licencia CC-BY-4.0. El repo ocupa 2,9 GB e incluye los pesos de varios entrenamientos.

A diferencia de un modelo de lenguaje, MARRI no genera texto: es un clasificador multimodal que combina representaciones de secuencia y estructura para resolver una tarea binaria de interaccion RNA-RNA. Su arquitectura se compone de un doble codificador ("dual-tower") formado por RNA-FM (fine-tuned) y RNet-2D (congelado), una rama de apertura ("opening branch"), una MLP de ganancia de hibridacion ("hybridization-gain MLP") y un clasificador con atencion cruzada axial.

Es relevante en el ambito de la biologia computacional y la genomica porque las interacciones RNA-RNA desempenan un papel central en la regulacion genica, la estabilidad de transcritos y multiples mecanismos celulares, y su prediccion computacional permite priorizar experimentos y anotar redes regulatorias. El modelo "headline" (semilla 42) alcanza un ROC-AUC de 0,7530 en el conjunto de test principal, con una media de 0,7427 +/- 0,0095 sobre tres semillas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador (RNA-FM + RNet-2D) con rama de apertura, MLP de ganancia de hibridacion y clasificador con atencion cruzada axial |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de prediccion de interaccion RNA-RNA, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como `state_dict` en precision de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch `state_dict()` plano en ficheros `.pth` (cargables con `torch.load` / `load_state_dict`) |

## Arquitectura y entrenamiento

MARRI es un framework multimodal "mechanism-aware" compuesto por dos torres de codificacion y varios modulos de fusion. La primera torre emplea RNA-FM, un modelo de lenguaje de RNA que se afina durante el entrenamiento; la segunda emplea RNet-2D, que se mantiene congelado y aporta informacion estructural en 2D. Sobre estas representaciones se anaden una rama de apertura ("opening branch") y una MLP de ganancia de hibridacion ("hybridization-gain MLP"), y el modulo final de clasificacion usa atencion cruzada axial para combinar ambas modalidades y producir la prediccion de interaccion.

El entrenamiento utiliza remuestreo negativo dinamico por epoca ("epoch-wise dynamic negative resampling") y un reparto aleatorio 8:1:1 sobre el conjunto de datos denominado N-clean. Todos los checkpoints comparten la misma arquitectura y configuracion de backbone (RNA-FM afinado, RNet-2D congelado), diferenciandose unicamente en la semilla aleatoria o en el reparto de datos de entrenamiento. Ademas del entrenamiento principal, se publican checkpoints entrenados desde cero con repartos de validacion resistentes a fuga de informacion ("leakage-resistant held-out splits"), con pools separados de positivos y negativos por split.

## Capacidades

- Prediccion de interaccion RNA-RNA: estima la probabilidad de que un par de RNAs interactue, como tarea de clasificacion binaria.
- Modelado multimodal: combina informacion de secuencia (RNA-FM) con informacion estructural en 2D (RNet-2D).
- Mecanismo de interpretabilidad: se publica un conjunto de exportacion de atencion/interpretabilidad asociado al modelo headline (dataset `Xu-AI4Science/MARRI-interpretability`).
- Generalizacion controlada: se distribuyen checkpoints para evaluar el comportamiento ante pares no vistos, genes/transcritos no vistos y locus de interaccion no vistos.
- Reproducibilidad por semillas: se publican repeticiones con semillas 42, 43 y 44 sobre el mismo recetario.
- Soporte de tool calling / function calling: no disponible (no aplicable a esta tarea).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplicable a esta tarea).
- Capacidades multilingues: no disponible (no aplicable a esta tarea).
- Modo de razonamiento ("thinking"), vision o audio: no disponible (no aplicable a esta tarea).

## Casos de uso

- Prediccion de interacciones RNA-RNA a escala de transcriptoma: el modelo puede evaluar pares candidatos y producir una puntuacion de probabilidad de interaccion, util para cribar grandes conjuntos de posibles parejas antes de validacion experimental.
- Analisis de mecanismos de regulacion genica: al incorporar ramas explicitas de apertura y ganancia de hibridacion, permite estudiar que caracteristicas estructurales y de secuencia favorecen la interaccion en un par concreto.
- Priorizacion de experimentos de laboratorio: dado un conjunto de pares candidatos, ordenar por probabilidad permite focalizar recursos en los casos mas prometedores y reducir el coste experimental.
- Anotacion de redes regulatorias: las predicciones pueden integrarse en pipelines de reconstruccion de redes de interaccion RNA-RNA para enriquecer anotaciones funcionales.
- Analisis de interpretabilidad: gracias al export de atencion asociado al modelo headline, se puede inspeccionar que regiones del par de RNAs contribuyen a la decision, apoyando la generacion de hipotesis mecanisticas.
- Evaluacion de generalizacion a genes o transcritos no vistos: los checkpoints de generalizacion permiten estimar el comportamiento del metodo en escenarios con fuga de informacion controlada, util para decidir si un modelo es apto para un nuevo conjunto de datos.
- Integracion en pipelines de biologia computacional: al distribuirse como `state_dict` de PyTorch, los pesos se pueden cargar en flujos existentes de analisis con Python y GPU para inferencia por lotes.

## Benchmarks y rendimiento

Se han publicado resultados de ROC-AUC en el conjunto de test para cada checkpoint (los datos proceden de la model card del autor).

Checkpoints de la matriz principal (conjunto N-clean, reparto aleatorio 8:1:1):

| Fichero | Semilla | ROC-AUC en test | Mejor epoca | Notas |
|---|---|---|---|---|
| `dyn_ft-rnafm_seed42/best_rna_physics_model.pth` | 42 | 0,7530 | 23 | Modelo headline |
| `dyn_ft-rnafm_seed43/best_rna_physics_model.pth` | 43 | 0,7409 | 15 | Repeticion con otra semilla |
| `dyn_ft-rnafm_seed44/best_rna_physics_model.pth` | 44 | 0,7342 | 18 | Repeticion con otra semilla |

Media +/- desviacion estandar sobre estas tres semillas: ROC-AUC 0,7427 +/- 0,0095 (Tabla 1 del articulo).

Checkpoints de generalizacion con repartos resistentes a fuga (semilla 42, cada uno con su propio split):

| Fichero | Split de validacion | ROC-AUC en test | Mejor epoca |
|---|---|---|---|
| `generalization_interaction_pair_seed42/best_rna_physics_model.pth` | Par RNA-RNA no visto | 0,7422 | 14 |
| `generalization_transcript_seed42/best_rna_physics_model.pth` | RNA/gen no visto (mas exigente) | 0,6630 | 13 |
| `generalization_interaction_locus_seed42/best_rna_physics_model.pth` | Locus de interaccion local no visto | 0,7502 | 19 |

No se han publicado en la informacion disponible otros benchmarks (por ejemplo, comparaciones con modelos alternativos) mas alla de los valores de ROC-AUC anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se documentan requisitos de memoria en la informacion proporcionada.
- GPU recomendadas: no disponible. Al ser un modelo basado en PyTorch con dos torres de codificacion (una de ellas derivada de RNA-FM y otra de RNet-2D), el entrenamiento y la inferencia se benefician de GPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. No se indica si el modelo cabe en GPU de gama de consumo.
- Opciones de despliegue: los pesos se distribuyen como `state_dict()` de PyTorch y se cargan con `torch.load` / `load_state_dict`; no se documentan integraciones con servidores de inferencia (vLLM, TGI, Ollama, llama.cpp u otros), que en cualquier caso no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Tamano del repositorio: 2,9 GB, que incluye multiples checkpoints `.pth`, no un unico peso.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de interaccion RNA-RNA ni resultados frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documentan analisis de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no aplicable en el sentido generativo, pero existe riesgo de falsos positivos y falsos negativos en la clasificacion de interacciones, con ROC-AUC de 0,6630 en el escenario mas exigente (transcrito/gen no visto) y valores en torno a 0,73-0,75 en el resto.
- Limitaciones de contexto o idioma: no aplicable (no es un modelo de lenguaje).
- Limitacion de generalizacion: los resultados caen de forma notable en el split de RNA/gen no visto (0,6630 frente a 0,7530 del modelo headline), lo que sugiere cautela al aplicar el modelo a transcritos fuera de la distribucion de entrenamiento.
- Restricciones de licencia: licencia CC-BY-4.0, que permite uso comercial siempre que se atribuya correctamente la autoria y se indique la licencia.
- Caveat de formato de pesos: cada `.pth` es un `state_dict()` plano del modelo de interaccion, no un checkpoint completo con estado del optimizador. Para reanudar entrenamiento se necesitarian los hiperparametros y el estado del optimizador, que no se incluyen.
- Dependencias de reproducibilidad: se debe usar la misma arquitectura y configuracion de backbone (RNA-FM afinado, RNet-2D congelado) para que los pesos sean cargables.
- Ausencia de separacion entre datos: los splits de generalizacion usan pools propios de positivos y negativos, distintos del conjunto N-clean principal; hay que tenerlo en cuenta al comparar resultados entre checkpoints.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xu-AI4Science/MARRI
- Codigo: https://github.com/GainGod-Xu/MARRI
- Dataset de interpretabilidad/atencion: https://huggingface.co/datasets/Xu-AI4Science/MARRI-interpretability
- Perfil del autor en HuggingFace: https://huggingface.co/Xu-AI4Science/models
- Referencias generales del ecosistema AI4Science encontradas en la busqueda: https://ai4.science/, https://ai4science.co/, https://ai4science.co/papers
