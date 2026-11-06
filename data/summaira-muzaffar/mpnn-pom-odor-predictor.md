# summaira-muzaffar/mpnn-pom-odor-predictor

## Resumen

MPNN Principal Odor Map es una red neuronal de paso de mensajes (MPNN) que predice 138 descriptores olfativos a partir de la representación SMILES de una molécula. Es una reimplementación del trabajo Principal Odor Map (POM) de Lee et al. (Science, 2023), entrenada sobre el conjunto de datos OpenPOM, que contiene 4.983 moléculas. El modelo está desarrollado por Summaira Muzaffar y se publica con licencia MIT.

La relevancia del proyecto es doble: por un lado, reproduce un resultado de referencia en quimioinformática aplicada al olfato con herramientas accesibles (PyTorch y RDKit, sin DeepChem ni DGL, cuyas versiones fijadas ya no se instalan en Colab); por otro, documenta de forma honesta una comparación con una línea base de huella de Morgan y un MLP, que obtiene un ROC-AUC superior (0,851 frente a 0,816) en este conjunto de datos concreto.

Se trata de un modelo de investigación de pequeño tamaño (embedding POM de 256 dimensiones, 5 pasos de paso de mensajes), orientado a la predicción multietiqueta de odorantes y no a la generación de texto ni a tareas de lenguaje. No dispone de pipeline declarado en Hugging Face ni de resultados de benchmarks estándar de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (MPNN) sobre grafos moleculares |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: molécula codificada como SMILES) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`best_model.pt`, state dict con lista de tareas y `atom_dim`) |

## Arquitectura y entrenamiento

El modelo es una MPNN con 5 pasos de paso de mensajes y un embedding POM de 256 dimensiones, con dropout de 0,12. Está implementado en PyTorch puro con RDKit para el procesamiento de moléculas, sin depender de DeepChem ni DGL. La tarea es de clasificación multietiqueta sobre 138 descriptores olfativos, evaluada mediante ROC-AUC macro sobre las etiquetas puntuables.

El entrenamiento se realizó sobre el conjunto OpenPOM (4.983 moléculas, procedentes de GoodScents y Leffingwell), con una partición 80/10/10 y semilla 42. La ejecución verificada en una GPU T4 con 5 épocas alcanzó un ROC-AUC de test de 0,672; la ejecución mejorada, con pesos de clase limitados a 10x y 30 épocas, alcanzó 0,816 en test y 0,822 en validación. Como comparación, una línea base de MLP sobre huella de Morgan obtuvo 0,851, superior al modelo de grafos en este conjunto de datos. No se especifica el número de tokens de entrenamiento ni si hubo RLHF/DPO, ya que no aplica a este dominio.

## Capacidades

- Predicción multietiqueta de 138 descriptores olfativos a partir de una cadena SMILES de una molécula.
- Reproducción del mapa olfativo principal (Principal Odor Map) sobre el conjunto OpenPOM.
- Procesamiento de moléculas individuales mediante grafos moleculares y RDKit.
- Evaluación con ROC-AUC macro sobre etiquetas puntuables.
- Carga del checkpoint en PyTorch mediante `MPNNPOMLite` con el `atom_dim` guardado y `load_state_dict`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No soporta visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Filtrado temprano de candidatos odorantes: dado un conjunto de moléculas candidatas en formato SMILES, el modelo puntúa sus 138 descriptores olfativos para priorizar las que presentan perfiles compatibles con un objetivo (por ejemplo, notas florales o cítricas) antes de síntesis y evaluación sensorial.
- Análisis retrospectivo de bibliotecas químicas: permite etiquetar automáticamente compuestos ya existentes en catálogos internos y cruzar sus predicciones con datos sensoriales históricos para detectar discrepancias.
- Docencia e investigación en quimioinformática: sirve como implementación de referencia reproducible del POM con PyTorch y RDKit, útil para comparar arquitecturas de grafos frente a líneas base de huellas moleculares.
- Estudio de estructura-olor: al disponer de predicciones por descriptor y de ablaciones documentadas en `RESULTS_SUMMARY.md`, facilita analizar qué familias de compuestos se predicen mejor y cuáles presentan mayor ruido.
- Prototipado de pipelines de regresión química: el código de carga del checkpoint y la clase `MPNNPOMLite` pueden reutilizarse como plantilla para adaptar la arquitectura a otros conjuntos de etiquetas químicas.
- Evaluación de líneas base: el proyecto incluye una comparación explícita con un MLP sobre huella de Morgan (ROC-AUC 0,851), lo que permite usar el repositorio como referencia metodológica para medir si un modelo de grafos aporta ventaja real en un dataset pequeño.

## Benchmarks y rendimiento

| Modelo / configuración | ROC-AUC test | ROC-AUC validación | Épocas | Notas |
|---|---|---|---|---|
| MPNN POM, ejecución inicial | 0,672 | no disponible | 5 | Verificado en T4, split 80/10/10, semilla 42 |
| MPNN POM, ejecución mejorada | 0,816 | 0,822 | 30 | Pesos de clase limitados a 10x |
| MLP sobre huella de Morgan (línea base) | 0,851 | no disponible | no disponible | Supera al modelo de grafos en este dataset |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican al dominio del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de pequeño tamaño (embedding de 256 dimensiones, 5 pasos de mensajes) y se ha ejecutado en una GPU T4.
- GPU recomendadas: T4 verificada por el autor; cualquier GPU con soporte CUDA es suficiente por el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con CUDA; no se especifican requisitos mínimos exactos.
- Opciones de despliegue: PyTorch con RDKit para el preprocesamiento de SMILES; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos | ROC-AUC test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MPNN POM (este modelo) | MPNN sobre grafo molecular | OpenPOM, 4.983 moléculas | 0,816 | MIT | Hugging Face + GitHub |
| MLP sobre huella de Morgan (línea base del autor) | MLP sobre descriptores | OpenPOM, 4.983 moléculas | 0,851 | no disponible | Incluido en el proyecto |
| Principal Odor Map original (Lee et al., 2023) | MPNN | Dataset propio del paper | no disponible en esta información | no disponible | Publicación científica |

No se dispone de datos comparativos adicionales con otros modelos de predicción de olores en la información proporcionada.

## Limitaciones y advertencias

- Solo procesa moléculas individuales: no admite mezclas ni predicción de intensidad olfativa.
- Las etiquetas de catálogo (GoodScents, Leffingwell) son ruidosas, lo que introduce incertidumbre en las predicciones.
- El modelo de grafos no supera a una línea base de MLP sobre huella de Morgan en este conjunto de datos (0,816 frente a 0,851), según el propio autor.
- El conjunto de datos es pequeño (4.983 moléculas), lo que limita la generalización a espacios químicos amplios.
- Riesgo de sesgo derivado de la composición del dataset de origen y de la cobertura desigual de familias de compuestos.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la precisión de las predicciones en producción.
- No se documentan cuantizaciones ni formatos alternativos de pesos para despliegue ligero.

## Enlaces

- Hugging Face: https://huggingface.co/summaira-muzaffar/mpnn-pom-odor-predictor
- Repositorio GitHub del proyecto (teaching-an-ai-to-smell): no disponible como URL directa en la información proporcionada; referenciado en la model card.
- Paper de referencia: Lee et al., "A principal odor map unifies diverse tasks in olfactory perception", Science, 2023 (no se proporciona URL directa).
- Dataset OpenPOM (Barsainyan et al.): no disponible como URL directa en la información proporcionada.
- Archivo de resultados: `RESULTS_SUMMARY.md` incluido en el repositorio del modelo.
