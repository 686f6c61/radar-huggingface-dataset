# virtual-human-chc/MolE

## Resumen

MolE es un modelo de predicción de actividad antimicrobiana desarrollado por Roberto Olayo Alarcón y colaboradores en el laboratorio de Müller (Helmholtz Munich). No es un modelo de lenguaje: es un pipeline de dos etapas que combina un codificador de grafos moleculares (Graph Isomorphism Network, GIN) preentrenado de forma autosupervisada con un clasificador XGBoost. El GIN transforma representaciones SMILES de compuestos químicos en embeddings moleculares; el XGBoost estima la probabilidad de que cada compuesto inhiba el crecimiento de 40 cepas bacterianas distintas.

El problema que aborda es el descubrimiento de nuevos antibióticos en un contexto de resistencia antimicrobiana creciente. MolE permite priorizar compuestos con potencial inhibidor a partir de bibliotecas químicas, incluyendo fármacos ya comercializados para otras indicaciones. Según la model card, el pipeline redescubrió compuestos inhibidores estructuralmente distintos de los antibióticos actuales y permitió identificar tres fármacos de uso humano que fueron confirmados experimentalmente como inhibidores del crecimiento de *Staphylococcus aureus*.

El modelo se publicó en *Nature Communications* (2025) y se distribuye en Hugging Face bajo licencia CC-BY-4.0. El repositorio ocupa 0,8 GB e incluye los pesos del GIN (`model.pth`), su configuración (`config.yaml`) y el clasificador XGBoost serializado. Está orientado a investigadores en biología computacional y descubrimiento temprano de fármacos, no a aplicaciones de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Isomorphism Network (GIN) autosupervisado no contrastivo (Barlow Twins) + clasificador XGBoost |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: moléculas individuales en formato SMILES) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos y documentación; la entrada son cadenas SMILES) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `model.pth` (PyTorch), `config.yaml`, `MolE-XGBoost-08.03.2024_14.20.pkl` (pickle de XGBoost) |

## Arquitectura y entrenamiento

MolE consta de dos componentes. El primero es un codificador GIN entrenado con un objetivo autosupervisado no contrastivo basado en Barlow Twins, que aprende representaciones moleculares independientes de la tarea a partir de estructuras químicas no etiquetadas. El preentrenamiento se realizó sobre 100.000 compuestos muestreados aleatoriamente del conjunto de ChemBERTa. La elección de GIN permite capturar la topología del grafo molecular (átomos como nodos, enlaces como aristas) preservando propiedades de isomorfismo de grafo, lo que resulta adecuado para distinguir estructuras químicas sutiles.

El segundo componente es un clasificador XGBoost entrenado sobre los embeddings generados por el GIN. Los datos de entrenamiento provienen de Maier et al. (2018), que recoge el efecto de 1.197 fármacos comercializados sobre el crecimiento de 40 cepas bacterianas. El modelo produce, para cada par compuesto-cepa, una probabilidad de inhibición del crecimiento. La innovación principal es el uso de representaciones autosupervisadas transferibles que permiten generalizar a compuestos estructuralmente alejados de los antibióticos conocidos, algo que los enfoques supervisados clásicos limitan por el sesgo del conjunto etiquetado.

## Capacidades

- Predicción de actividad antimicrobiana: estima la probabilidad de inhibición del crecimiento para 40 cepas bacterianas a partir del SMILES de un compuesto.
- Aprendizaje de representaciones moleculares: el GIN genera embeddings de grafos moleculares reutilizables para otras tareas downstream (clasificación, similitud, clustering).
- Priorización de bibliotecas químicas: permite puntuar grandes conjuntos de compuestos (fármacos comercializados, bibliotecas virtuales) para seleccionar candidatos a validación experimental.
- Entrada en lote: procesa tablas TSV con columnas `chem_name` y `smiles`, devolviendo una tabla de predicciones por compuesto y cepa.
- Redescubrimiento de compuestos conocidos: según la model card, recupera inhibidores reportados previamente con estructuras distintas a los antibióticos al uso.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un modelo especializado en química computacional.

## Casos de uso

- Cribado virtual de fármacos reposicionados: introducir el catálogo de fármacos comercializados (SMILES) y obtener probabilidades de inhibición para 40 cepas; permite identificar candidatos no antibióticos con actividad antimicrobiana, como los tres fármacos de uso humano confirmados experimentalmente en el artículo.
- Priorización en descubrimiento temprano: puntuar bibliotecas químicas virtuales de decenas de miles de compuestos y seleccionar el top-N por probabilidad para ensayos in vitro, reduciendo el coste experimental.
- Filtrado de compuestos en pipelines de HTS (high-throughput screening): usar MolE como pre-filtro antes de un cribado fenotípico, ordenando compuestos por probabilidad predicha por cepa.
- Análisis de selectividad por cepa: comparar las 40 probabilidades de un mismo compuesto para evaluar su espectro de acción (amplio vs. estrecho) y orientar la elección de dianas terapéuticas.
- Generación de embeddings para modelos secundarios: extraer representaciones del GIN y entrenar clasificadores específicos (toxicidad, permeabilidad, solubilidad) con pocos datos etiquetados.
- Estudio de resistencia antimicrobiana: analizar qué familias estructurales se predicen activas frente a cepas concretas y contrastar con mecanismos de resistencia conocidos.
- Docencia e investigación metodológica: reproducir el pipeline GIN + XGBoost como referencia para experimentos de aprendizaje autosupervisado en grafos moleculares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los metadatos no incluyen tablas con métricas (AUC, precisión, recall) ni comparaciones cuantitativas con otros modelos. El artículo asociado en *Nature Communications* (2025) es la fuente donde deben consultarse las métricas de validación.

## Requisitos de hardware

- El GIN es un modelo de tamaño moderado; la inferencia puede ejecutarse en CPU para lotes pequeños, aunque se recomienda GPU para procesar bibliotecas grandes. El repositorio ocupa 0,8 GB, lo que sugiere un número de parámetros muy inferior a los modelos de lenguaje.
- GPU recomendadas: cualquier GPU con soporte CUDA y memoria suficiente para el lote de grafos (RTX 3060/4090, A100, H100 son válidas). No se especifica VRAM mínima en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna dado el tamaño del repositorio; no se dispone de cifras exactas de VRAM.
- Despliegue: el código de ejemplo usa PyTorch, PyTorch Geometric (`pyg`), `huggingface_hub` y un entorno conda (`environment.yaml`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del tamaño del lote y del hardware; el cuello de botella estará en la generación de embeddings del GIN y en la inferencia del XGBoost.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MolE | GIN autosupervisado (Barlow Twins) + XGBoost | SMILES | Probabilidad de inhibición para 40 cepas | CC-BY-4.0 | Hugging Face, GitHub |
| ChemBERTa | Transformer sobre SMILES | SMILES | Embeddings / clasificación | no disponible en esta ficha | Hugging Face |
| Modelos QSAR clásicos | Descriptores + ML supervisado | Descriptores moleculares | Actividad frente a una diana | variable | variable |
| Antibiotic discovery basados en GNN supervisados | GNN supervisado | Grafos moleculares | Actividad antimicrobiana | variable | variable |

No se dispone de datos cuantitativos de rendimiento que permitan una comparación numérica con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de lenguaje; no genera texto, código ni mantiene conversaciones. Cualquier uso fuera de química computacional es inadecuado.
- Cobertura limitada a 40 cepas: las predicciones solo cubren las cepas presentes en Maier et al. (2018); no generaliza automáticamente a otras especies o cepas no incluidas.
- Sesgo del conjunto de entrenamiento: el XGBoost se entrenó con 1.197 fármacos comercializados; la distribución química de ese conjunto condiciona las predicciones y puede infravalorar familias estructurales ausentes.
- Riesgo de falsos positivos: las probabilidades son orientativas y requieren validación experimental; no deben interpretarse como evidencia de eficacia clínica.
- Sin métricas publicadas en la model card: la ausencia de benchmarks en la información disponible impide evaluar su rendimiento relativo sin consultar el artículo.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a los autores y la publicación. Verificar los términos exactos antes de integrarlo en productos.
- Idiomas: la documentación está en inglés y la entrada son cadenas SMILES; no hay soporte multilingüe relevante.
- Mantenimiento: el modelo se actualizó por última vez en noviembre de 2026 según los metadatos; conviene comprobar la compatibilidad de dependencias (PyTorch Geometric, versiones de PyTorch) antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/virtual-human-chc/MolE
- Repositorio GitHub: https://github.com/rolayoalarcon/MolE
- Artículo en Nature Communications (2025): https://www.nature.com/articles/s41467-025-58804-4
- DOI: https://doi.org/10.1038/s41467-025-58804-4
- Dataset de referencia Maier et al. (2018): https://www.nature.com/articles/nature25979
- ChemBERTa (origen de los compuestos de preentrenamiento): no disponible como enlace específico en la información proporcionada
