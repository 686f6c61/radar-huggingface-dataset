# yhhugging/DualMLC-amazoncat-13k

## Resumen

DualMLC-amazoncat-13k es un checkpoint de clasificación multi-etiqueta a gran escala (extreme multi-label classification, XMC) publicado por el usuario yhhugging, correspondiente al artículo "LLM-Enhanced Dual-Branch Learning for Large-Scale Multi-Label Text Classification" (Ye, Zhang, Yang y Sunderraman). No es un modelo generativo: es un artefacto de investigación entrenado específicamente para ordenar etiquetas de un vocabulario fijo, el de AmazonCat-13K, y se distribuye como checkpoint de un pipeline concreto, no como modelo autónomo.

La arquitectura es de doble rama: una rama basada en Qwen2.5-7B adaptada con LoRA y una rama basada en BERT-base-uncased con ajuste fino completo, cada una con su propia cabeza clasificadora. La decisión final de ranking se obtiene mediante fusión tardía de logits (late logit fusion), con un peso de fusión y un número de etiquetas registrados en `config.json`. El repositorio ocupa 0,6 GB porque contiene el adaptador LoRA y el encoder BERT, pero no los pesos completos de Qwen2.5-7B, que deben descargarse por separado.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para investigar si un LLM (vía LoRA) aporta ventaja frente a enfoques clásicos de XMC cuando se combina con un encoder tipo BERT. Los resultados declarados (P@1 de 96,90 %, P@3 de 84,39 %, P@5 de 69,14 % en AmazonCat-13K) proceden del `best_metrics.json` del propio checkpoint en el paso 400.000 y no de una reevaluación independiente de los ficheros subidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble rama: Qwen2.5-7B con adaptador LoRA + BERT-base-uncased con ajuste fino completo; una cabeza clasificadora por rama y fusión tardía de logits |
| Parametros totales | No disponible como cifra agregada del checkpoint. Componentes: Qwen2.5-7B (unos 7.600 millones, no incluidos en el repo) + BERT-base-uncased (unos 110 millones) + adaptador LoRA + dos cabezas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. Los textos se truncan a las longitudes maximas definidas en `config.json`; la rama BERT hereda el limite propio de bert-base-uncased |
| Tipos de cuantizacion | No disponible. No se publican variantes GGUF, GPTQ, AWQ ni int8 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0, declarada por el publicador para el checkpoint; la licencia Apache 2.0 del repositorio de codigo cubria originalmente solo el codigo |
| Formato de pesos | safetensors (adaptador LoRA y encoder BERT) y PyTorch `.pt` para `head_qwen.pt` y `head_bert.pt`; tokenizadores en `qwen_tokenizer/` y `bert_tokenizer/` |

## Arquitectura y entrenamiento

El modelo implementa un esquema de dos ramas sobre el mismo documento. La primera rama toma Qwen2.5-7B y lo adapta con LoRA, es decir, sin reentrenar los pesos completos del LLM; la segunda rama es un BERT-base-uncased ajustado por completo. Cada rama produce logits sobre el espacio de etiquetas de AmazonCat-13K a través de su propia cabeza (`head_qwen.pt` y `head_bert.pt`), y el ranking final se obtiene fusionando ambos conjuntos de logits con un peso de fusión almacenado en la configuración. Esta separación permite que el LLM aporte representaciones semánticas ricas mientras el encoder BERT, mucho más barato, aporta señal específica del dominio y del vocabulario de etiquetas.

La información disponible no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO; tampoco describe innovaciones de inferencia como decodificación especulativa o atención lineal. Los únicos datos de entrenamiento publicados son operativos: el entrenamiento reportado consumió 23,25 horas en 8 GPU RTX 4090 con CUDA 11.8, y las métricas corresponden al paso 400.000. El propio autor indica que los valores de `best_metrics.json` concuerdan con el Model Zoo del repositorio de GitHub tras redondear, y no constituyen una evaluación nueva de los ficheros subidos.

## Capacidades

- Clasificación multi-etiqueta sobre un vocabulario fijo: ordena las etiquetas de AmazonCat-13K para un documento dado, con soporte de top-k configurable (`--predict-topk`).
- Fusión bimodal de señales: combina los logits de la rama LLM (Qwen2.5-7B + LoRA) con los de la rama BERT ajustada.
- Procesamiento de documentos largos dentro de los límites de truncado definidos en `config.json`.
- Uso como backbone o extractor de representaciones para investigación en XMC, gracias a la separación explícita de ramas y cabezas.
- Carga modular mediante `load_checkpoint` del repositorio DualMLC, que reconstruye ambas ramas y sus cabezas.
- No genera texto: no es un modelo instructivo ni conversacional.
- No soporta tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- No admite un vocabulario de etiquetas arbitrario distinto del de entrenamiento.
- Capacidades multilingües: solo inglés declarado; el rendimiento en otros dominios o idiomas no está establecido según el autor.

## Casos de uso

- Reproducción de resultados de investigación en XMC: cargar el checkpoint con `load_checkpoint`, descargar el dataset preprocesado de AmazonCat-13K y ejecutar `test.py --data-dir xmc-base/amazoncat-13k` para verificar las métricas P@1, P@3 y P@5 publicadas.
- Estudio comparativo LLM frente a encoder clásico: la arquitectura de doble rama permite aislar la contribución de la rama Qwen+LoRA evaluando por separado los logits de cada cabeza antes de la fusión.
- Etiquetado automático de catálogos de producto cuando la taxonomía de destino coincida con el vocabulario de AmazonCat-13K, usando el ranking top-k como candidatos para revisión humana.
- Generación de pseudo-etiquetas para destilar modelos más pequeños: las predicciones del sistema dual pueden usarse como profesor para entrenar clasificadores ligeros de despliegue.
- Enrutado o etiquetado de grandes volúmenes de texto en pipelines por lotes, aprovechando que la clasificación es de una sola pasada y no requiere generación autorregresiva.
- Análisis de taxonomías y errores por etiqueta: al disponer de `labels.txt` con el orden de índices de entrenamiento, se pueden calcular métricas por clase y detectar etiquetas problemáticas en AmazonCat-13K.
- Punto de partida para adaptación a un dominio propio mediante nuevo ajuste de las cabezas o del adaptador LoRA, siempre que se mantenga la correspondencia de índices de etiquetas.

## Benchmarks y rendimiento

Datos declarados por el autor en el checkpoint (paso 400.000), correspondientes al dataset AmazonCat-13K. No son una reevaluación independiente de los ficheros publicados.

| Dataset | P@1 (%) | P@3 (%) | P@5 (%) |
|---|---:|---:|---:|
| AmazonCat-13K | 96,90 | 84,39 | 69,14 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, lo cual es coherente con que el modelo no genere texto. Tampoco se aportan métricas adicionales como nDCG, cobertura o recall sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Como referencia de orden de magnitud, la rama Qwen2.5-7B en precisión de 16 bits ocupa del orden de 15 GB solo en pesos, a lo que hay que sumar el adaptador LoRA, el encoder BERT, las dos cabezas y la memoria de activaciones y caché. En la práctica se recomienda una GPU con al menos 24 GB.
- GPU recomendadas: RTX 4090 (24 GB), A10G (24 GB), L40S (48 GB), A100 (40 o 80 GB). El autor recomienda explícitamente una GPU con memoria suficiente para el modelo base Qwen y ambas ramas.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090, que es precisamente el hardware usado para entrenar (8 unidades). Por debajo de 24 GB no hay ruta documentada, ya que no se publican cuantizaciones.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni similares; al tratarse de un checkpoint con cabezas de clasificación y fusión de logits propia, el despliegue previsto es el cargador en PyTorch del repositorio DualMLC (`model.load_checkpoint`) junto con `test.py`.
- Requisito previo: descargar por separado `Qwen/Qwen2.5-7B` y pasar su nombre con `--qwen-name` o el parámetro equivalente del cargador.
- Latencia y throughput: no disponible. El único dato temporal publicado es el de entrenamiento: 23,25 horas en 8 × RTX 4090 con CUDA 11.8.
- Nota de entorno: el procedimiento de descarga indica fijar el commit `de43c6b11a85b6d641ae8dc468930df40dac96bd` del repositorio antes de instalar dependencias.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos comparados en la información proporcionada, por lo que la comparación es estructural.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DualMLC-amazoncat-13k (este) | Doble rama Qwen2.5-7B+LoRA y BERT-base, fusión tardía de logits, vocabulario fijo AmazonCat-13K | Qwen2.5-7B (no incluido) + BERT-base + adaptador + cabezas | No disponible (truncado según `config.json`) | Apache 2.0 declarada | HuggingFace, repo de 0,6 GB, 8 descargas |
| Clasificador XMC clásico basado solo en BERT con cabeza lineal o atención | Una sola rama encoder, sin LLM | Del orden de 110 millones (BERT-base) | Limite propio de BERT-base | Segun el modelo base | Habitualmente reproducible desde el mismo repositorio de código |
| Qwen2.5-7B en modo prompting zero-shot o few-shot para etiquetado | LLM generativo sin ajuste específico para el vocabulario de 13K etiquetas | Unos 7.600 millones | El del modelo base Qwen | Segun Qwen2.5-7B | Pesos completos en HuggingFace |

## Limitaciones y advertencias

- Vocabulario cerrado: solo ordena etiquetas del conjunto AmazonCat-13K y no acepta un vocabulario nuevo arbitrario. Los identificadores de etiqueta dependen del orden de entrenamiento y no son intercambiables entre datasets ni entre variantes de preprocesado.
- No genera texto: cualquier caso de uso que requiera redacción, resumen o diálogo queda fuera de su alcance.
- Idiomas: únicamente inglés declarado; el rendimiento en otros dominios e idiomas no ha sido establecido por los resultados reportados.
- Calibración: el código de inferencia devuelve puntuaciones transformadas con sigmoide que, según el autor, no están documentadas como probabilidades calibradas. No deben interpretarse como confianzas fiables sin un proceso de calibración adicional.
- Truncado: las entradas se recortan a las longitudes máximas de `config.json`, lo que puede degradar el rendimiento en documentos largos sin que se hayan publicado análisis al respecto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y de etiquetas espurias en el ranking top-k, especialmente en colas largas del vocabulario.
- Sesgos: la información disponible no incluye auditorías de sesgo ni análisis de equidad sobre el corpus AmazonCat-13K.
- Licencia: el publicador declara Apache 2.0 para el checkpoint, pero la licencia Apache 2.0 del repositorio de código cubría originalmente solo el código. Los modelos base y los datasets de benchmark tienen sus propias licencias y términos, que hay que respetar por separado.
- Dependencia de artefactos externos: el repositorio no contiene los pesos de Qwen2.5-7B, por lo que la inferencia requiere descargas adicionales y un procedimiento específico del repositorio.
- Madurez: el modelo acumula 8 descargas y 0 "likes" en el momento de la consulta, sin validación independiente de la comunidad sobre los ficheros subidos.
- Las métricas publicadas provienen del `best_metrics.json` del propio checkpoint, no de una evaluación externa de los archivos alojados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yhhugging/DualMLC-amazoncat-13k
- Paper (arXiv): https://arxiv.org/abs/2609.12915
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2609.12915
- Repositorio de codigo: https://github.com/huiyegit/DualMLC
- Instrucciones de setup del repositorio: https://github.com/huiyegit/DualMLC#setup
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Modelo base BERT: https://huggingface.co/google-bert/bert-base-uncased
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a temas medicos y a documentos no relacionados (Sigmadivertikulose, sintesis distribuida de cargas LLM y un documento del Berlin Group sobre LLM), por lo que se descartan.
