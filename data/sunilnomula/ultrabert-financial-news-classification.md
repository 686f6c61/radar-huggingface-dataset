# sunilnomula/ultrabert-financial-news-classification

## Resumen

UltraBERT-150M es un checkpoint de clasificación binaria de noticias financieras desarrollado por el usuario sunilnomula en el marco de un proyecto academico ("Hands-On Track"). El modelo se ha afinado sobre el dataset `firobeid/SP_DOW_NASDAQ_stocks__News_Headlines_labeled` (revision `post_processing`) para predecir la direccion del retorno de una accion a partir de titulares de noticias, con etiquetas `-1/+1` mapeadas a `0/1`. No se trata de un modelo de sentimiento financiero ni de recomendacion de inversion, tal y como advierte el propio autor.

La informacion publicada es muy limitada: la model card describe el proceso de fine-tuning y los resultados de un experimento concreto, pero no especifica la arquitectura base exacta, el numero de parametros, la longitud de contexto ni la licencia. El nombre del checkpoint sugiere una base de tipo BERT con aproximadamente 150 millones de parametros, aunque este dato no se confirma en la documentacion disponible.

El interes actual del modelo es limitado: se trata de un artefacto academico con cero descargas y cero likes en el momento de la consulta, sin pesos publicados en el repositorio (la model card indica explicitamente que el notebook "no contiene pesos preentrenados ni afinados"). Su relevancia radica en documentar un flujo reproducible de evaluacion con separacion estratificada y seleccion de umbral, no en su rendimiento predictivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere una base tipo BERT de ~150M, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card indica que el repositorio no contiene pesos del modelo) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base. El nombre "UltraBERT-150M" sugiere una familia BERT con aproximadamente 150 millones de parametros, pero no se aporta confirmacion tecnica. La tarea es de clasificacion binaria de secuencias cortas (titulares), con una cabeza de clasificacion sobre el encoder.

El entrenamiento documentado corresponde al "Experimento 2": learning rate 2e-5, 3 epocas, sobre la particion de entrenamiento original con una retencion de validacion estratificada del 15% (12.697 muestras de validacion). La seleccion de umbral se realizo exclusivamente sobre validacion y la evaluacion en test se ejecuto tras congelar la seleccion del modelo. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo tecnicas de RLHF o DPO (no aplicables a una tarea de clasificacion supervisada). El autor advierte que la sesion original del Experimento 2 uso un procedimiento de split distinto al del notebook final, por lo que las cifras historicas no son estrictamente comparables con una reejecucion.

## Capacidades

- Clasificacion binaria de titulares financieros en dos clases (`0`/`1`), derivadas de etiquetas de direccion de retorno `-1/+1`.
- Inferencia sobre texto corto (titulares), no sobre documentos largos.
- No soporta generacion de texto, razonamiento multi-paso, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-turno.
- Capacidades multilingues: no disponibles (idioma de entrenamiento no documentado, presumiblemente ingles por el dataset de titulares de S&P, DOW y NASDAQ).
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Investigacion academica sobre clasificacion de titulares financieros: el modelo y su notebook sirven como referencia reproducible para comparar metodos de split, seleccion de umbral y evaluacion honesta en tareas de prediccion de direccion de retorno.
- Docencia en cursos de ML aplicado a finanzas: el flujo documentado (split estratificado, umbral seleccionado solo en validacion, evaluacion en test congelada) es un ejemplo didactico de buenas practicas de evaluacion.
- Baseline para experimentos propios: dado su ROC-AUC cercano a 0,5 en validacion, puede usarse como referencia negativa o punto de partida para demostrar que un modelo mas complejo aporta mejora real.
- Analisis critico de datasets financieros: el checkpoint y sus resultados permiten ilustrar el problema del ruido en etiquetas de retorno a corto plazo y la dificultad de superar la clase mayoritaria.
- Pruebas de pipelines de clasificacion de texto corto: util para validar infraestructura de inferencia (tokenizacion, batching, umbrales) sin depender de un modelo de produccion.
- Auditoria de integridad academica: el repositorio documenta explicitamente el uso de asistencia por IA y las limitaciones de comparabilidad, lo que lo convierte en un caso de estudio sobre transparencia en trabajos academicos.

## Benchmarks y rendimiento

Resultados registrados en `ultrabert_experiment2_results.json` (Experimento 2, LR 2e-5, 3 epocas, 12.697 muestras de validacion):

| Metrica | Valor |
|---|---|
| ROC-AUC (validacion) | 0,513117 |
| Predicciones positivas a umbral 0,50 | 8.786 |
| Precision clase positiva a umbral 0,50 | 53,62% |
| Precision clase positiva a umbral 0,60 | 55,88% |
| Recall clase positiva a umbral 0,60 | 10,26% |
| Positivos predichos a umbral 0,60 | 1.242 |
| Baseline de precision (clase mayoritaria) | 53,30% |
| Test de memorizacion (256 ejemplos) — accuracy train | 100% |
| Test de memorizacion (256 ejemplos) — accuracy validacion | 49,73% |
| Test de memorizacion (256 ejemplos) — ROC-AUC validacion | 0,500740 |

Interpretacion: el ROC-AUC de 0,513 está practicamente al nivel del azar y la precision al umbral 0,50 apenas supera el baseline de clase mayoritaria (53,62% frente a 53,30%). El test de memorizacion confirma sobreajuste severo (100% en train, 49,73% en validacion). No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; para una base tipo BERT de ~150M en FP16 se situaria en torno a 300-600 MB, pero este dato no esta confirmado por el autor.
- GPU recomendadas: no disponibles. El notebook esta disenado para ejecutarse en Google Colab con GPU habilitada.
- Compatibilidad con GPU de consumo: probable en GPUs consumer modernas (RTX 3060 o superiores) si se confirma el tamano, pero no verificado.
- Opciones de despliegue: no documentadas (vLLM, llama.cpp, Ollama o TGI no se mencionan; el flujo previsto es ejecucion del notebook en Colab).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de clasificacion financiera ni con alternativas de la misma categoria. Ademas, el repositorio no publica pesos, lo que impide una comparacion empirica directa.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo; solo incluye el notebook y un JSON de resultados. No es desplegable tal cual.
- ROC-AUC de validacion de 0,513117, practicamente equivalente a una prediccion aleatoria.
- Precision al umbral 0,50 (53,62%) apenas supera el baseline de clase mayoritaria (53,30%), lo que cuestiona la utilidad practica del clasificador.
- Sobreajuste severo demostrado por el test de memorizacion (100% train frente a 49,73% validacion).
- Los resultados historicos del Experimento 2 no son estrictamente comparables con el notebook final por diferencias en el procedimiento de split.
- El autor reconoce que hubo una inspeccion previa del conjunto de test en el Experimento 1, lo que introduce riesgo de fuga de informacion en la evaluacion.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- Idioma de entrenamiento no documentado; probablemente solo ingles.
- No apto para produccion ni para decisiones financieras: el propio autor advierte que no es un dataset de sentimiento financiero ni una recomendacion de inversion.
- Sesgos conocidos: no documentados, pero el dataset de titulares de S&P, DOW y NASDAQ probablemente refleja sesgos de cobertura mediatica y de las empresas incluidas en esos indices.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sunilnomula/ultrabert-financial-news-classification
- Dataset utilizado: https://huggingface.co/datasets/firobeid/SP_DOW_NASDAQ_stocks__News_Headlines_labeled (revision `post_processing`)
- Notebook `UltraBERT_Financial_News_Final.ipynb`: incluido en el repositorio de Hugging Face
- Resultados `ultrabert_experiment2_results.json`: incluido en el repositorio de Hugging Face
