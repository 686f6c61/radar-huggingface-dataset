# tatlilimon/gpt-oss-20b-tr-offensive-lora

## Resumen

El modelo `gpt-oss-20b-tr-offensive-lora` es un adaptador LoRA publicado por el usuario tatlilimon sobre el modelo base `unsloth/gpt-oss-20b-BF16`, que a su vez es un espejo en BF16 del `openai/gpt-oss-20b`. El adaptador está especializado en una única tarea: clasificar tuits en turco como ofensivos o no ofensivos, respondiendo con una sola palabra (`evet` o `hayır`). No es un modelo de propósito general, sino un ajuste fino orientado a la detección de lenguaje ofensivo en redes sociales.

El entrenamiento se realizó con la herramienta Halo sobre el corpus OffensEval-TR 2020, compuesto por 29.986 tuits de entrenamiento con un 19,3 % de ejemplos ofensivos. El adaptador añade únicamente 7.962.624 parámetros entrenables (el 0,04 % del modelo base) mediante LoRA de rango 16 sobre las proyecciones de atención, manteniendo congelados los pesos del modelo original.

Su relevancia radica en el salto de rendimiento que consigue frente al modelo base sin ajustar: pasa de un Macro-F1 de 0,539 en zero-shot a 0,825 con el adaptador, un resultado que lo sitúa entre los dos mejores sistemas del track turco de SemEval-2020 Task 12. Es un ejemplo compacto de cómo un adaptador pequeño y barato de entrenar puede especializar un modelo grande en una tarea concreta con métricas competitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (gpt-oss-20b) |
| Parametros totales | 7.962.624 parámetros entrenables en el adaptador (0,04 % del modelo base); parámetros totales del base no disponibles en la información |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se evaluó en bf16) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base transformer decoder-only de la familia gpt-oss, en concreto el espejo BF16 `unsloth/gpt-oss-20b-BF16`. La adaptación consiste en LoRA de rango 16, alpha 32 y dropout 0,05 aplicado exclusivamente a las proyecciones de atención, lo que da lugar a 7.962.624 parámetros entrenables. Los pesos de los expertos del modelo base no se adaptan y los attention sinks preentrenados se mantienen activos y congelados, de modo que el adaptador encaja sobre el modelo original sin modificarlo.

El entrenamiento se llevó a cabo con Halo 1.3.0rc1 mediante `halo launch sft` en una GPU H100 solicitada a Modal. Se usaron 29.986 tuits de entrenamiento de OffensEval-TR 2020 (19,3 % ofensivos, con menciones de usuario sustituidas por `@USER`), 2 épocas, 938 pasos de 64 tuits, tasa de aprendizaje 1e-4 con decaimiento coseno y 5 % de warmup, semilla 42. El bucle de entrenamiento duró 863 segundos. No hubo búsqueda de hiperparámetros ni ejecuciones múltiples. La plantilla de chat SFT de Halo coloca la respuesta en el canal final sin razonamiento previo, por lo que el prompt de inferencia debe replicar exactamente esa estructura.

## Capacidades

- Clasificación binaria de texto en turco: responde `evet` (sí) o `hayır` (no) a la pregunta de si un tuit es ofensivo.
- Detección de insultos, blasfemias y ataques explícitos o velados dirigidos a personas o grupos.
- Generación de texto condicionada por la plantilla de chat del modelo base, con la respuesta restringida al canal final.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido de forma específica; su especialización es exclusivamente la tarea de clasificación descrita.
- Capacidad multilingüe limitada al turco para esta tarea, aunque hereda del modelo base las capacidades generales de este (no evaluadas en la información disponible).

## Casos de uso

- Moderación de comentarios en plataformas turcas: el adaptador permite filtrar tuits o comentarios potencialmente ofensivos antes de su publicación, con un recall de 0,648 y una precisión de 0,796 en el conjunto de test, adecuado como primera capa de triaje.
- Priorización de colas de revisión humana: al tener una precisión relativamente alta, las predicciones positivas pueden enviarse a moderadores humanos con mayor confianza de que contienen contenido ofensivo, reduciendo la carga de revisión manual.
- Investigación en procesamiento del lenguaje natural en turco: sirve como línea base reproducible para experimentos de detección de lenguaje ofensivo, con código, configuración y registros de entrenamiento publicados en el repositorio del autor.
- Análisis de toxicidad en redes sociales a gran escala: puede procesar lotes de tuits para estimar la prevalencia de lenguaje ofensivo en un corpus, siempre que se tenga en cuenta su tasa de falsos negativos.
- Evaluación de técnicas de ajuste eficiente: al ser un LoRA de rango 16 con solo el 0,04 % de parámetros entrenables, es un caso de estudio útil para comparar metodologías de PEFT en tareas de clasificación.
- Filtrado previo en pipelines de datasets: puede usarse para marcar o descartar ejemplos ofensivos antes de entrenar otros modelos, reduciendo la contaminación de corpus de entrenamiento.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test oficial de OffensEval-TR 2020 (3.528 tuits, 20,3 % ofensivos). Macro-F1 es la métrica oficial de la tarea; precisión y recall corresponden a la clase ofensiva.

| Sistema | Macro-F1 [IC 95 %] | Accuracy | Precision | Recall | ROC-AUC | Macro-F1 con umbral ajustado |
|---|---:|---:|---:|---:|---:|---:|
| Constante "no ofensivo" | 0,444 [0,439, 0,448] | 0,797 | 0,000 | 0,000 | n/a | n/a |
| TF-IDF de n-gramas de caracteres + regresión logística | 0,708 [0,688, 0,730] | 0,859 | 0,898 | 0,345 | 0,873 | 0,770 [0,752, 0,787] |
| gpt-oss-20b zero-shot (mejor de tres formulaciones) | 0,539 [0,520, 0,558] | 0,816 | 0,923 | 0,101 | 0,854 | 0,750 [0,732, 0,768] |
| gpt-oss-20b + este adaptador | 0,825 [0,808, 0,841] | 0,895 | 0,796 | 0,648 | 0,930 | 0,827 [0,811, 0,843] |

Como referencia, en el track turco de SemEval-2020 Task 12 participaron 46 equipos: el mejor sistema obtuvo 0,8258, el segundo 0,8167 y la línea base mayoritaria 0,4435 (Zampieri et al., 2020, tabla 11). El 0,8250 de este adaptador se sitúa entre el primer y el segundo clasificado.

## Requisitos de hardware

- El adaptador requiere cargar el modelo base completo `unsloth/gpt-oss-20b-BF16` en bf16, que necesita aproximadamente 45 GB de memoria de GPU según la model card.
- GPU recomendadas: H100 (usada en el entrenamiento) o A100 de 80 GB para inferencia en bf16 con holgura.
- No cabe en GPU de consumo convencionales en bf16; sería necesario cuantizar el modelo base (no evaluado en la información disponible) para reducir requisitos.
- Despliegue: la model card proporciona un ejemplo con `transformers` y `peft` (`PeftModel.from_pretrained`); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 (OffensEval-TR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b + este adaptador | Adaptador de 7,96 M sobre base de 20B (no confirmado) | no disponible | 0,825 | Apache-2.0 | Hugging Face (PEFT) |
| gpt-oss-20b zero-shot | Base de 20B (no confirmado) | no disponible | 0,539 | Apache-2.0 | Hugging Face |
| TF-IDF de caracteres + regresión logística | no aplica (modelo clásico) | no aplica | 0,708 | no disponible | Implementación propia |
| Mejor sistema de SemEval-2020 Task 12 (turco) | no disponible | no disponible | 0,8258 | no disponible | No disponible |

## Limitaciones y advertencias

- El adaptador pierde aproximadamente un tercio de los tuits ofensivos con la decisión por defecto: recall de 0,648 con precisión de 0,796 en el conjunto de test.
- Los resultados provienen de una única ejecución con una sola semilla y sin búsqueda de hiperparámetros; los intervalos reflejan únicamente el ruido de muestreo del conjunto de test.
- Las puntuaciones se calcularon en bf16 sobre GPU; no se midieron otras precisiones y los tuits cercanos al umbral pueden cambiar de clasificación.
- La mayoría de los tuits del corpus fueron etiquetados por un único anotador voluntario, con un kappa de Cohen de 0,761 en la muestra doblemente anotada; el adaptador hereda el ruido de etiquetas, los temas y los sesgos de esos tuits.
- No es un sistema de moderación autónomo: debe usarse como componente de triaje con revisión humana.
- El prompt de inferencia debe coincidir exactamente con el de entrenamiento (plantilla de chat de Halo con respuesta en el canal final); desviaciones pueden degradar el rendimiento.
- El modelo está especializado solo en turco y en la tarea de detección de lenguaje ofensivo; no se han evaluado sus capacidades generales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento (OffensEval-TR 2020, CC BY 2.0) tienen sus propias condiciones que deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tatlilimon/gpt-oss-20b-tr-offensive-lora
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gpt-oss-20b-BF16
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Repositorio con código, configuración y registros: https://github.com/tatlilimon/halo-qwen3-tr-offensive
- Herramienta Halo: https://github.com/whitecircle/halo
- Dataset OffensEval-TR 2020: https://huggingface.co/datasets/stefan-it/offenseval2020_tr
- Artículo de Çöltekin (2020) sobre el corpus turco: arXiv:2006.07235
- Artículo de Zampieri et al. (2020) sobre SemEval-2020 Task 12 (referenciado en la model card; enlace no disponible)
