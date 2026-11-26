# stefan-it/zeitunks-lm-v1-ner-hipe2020-de

## Resumen

Zeitunks-LM v1 NER HIPE-2020 DE es un modelo de reconocimiento de entidades nombradas (NER) para aleman historico, desarrollado por Stefan Schweter (stefan-it). Se trata de un ajuste fino del encoder bidireccional BiXL-Kron (`stefan-it/zeitunks-lm-v1`), un modelo basado en KronLSTM preentrenado sobre periodicos alemanes historicos. El modelo resuelve la tarea de extraccion de entidades en textos de los siglos XVIII a XX, un dominio donde los modelos modernos entrenados con corpus contemporaneos rinden peor por la variacion ortografica y tipografica.

La relevancia del modelo esta en su arquitectura: es un encoder sin atencion (attention-free) y sin embeddings posicionales, lo que reduce el coste cuadratico del mecanismo de atencion y permite procesar secuencias largas con un coste lineal. Con 96,9 millones de parametros, es un modelo compacto que puede ejecutarse en hardware modesto, algo relevante para proyectos de humanidades digitales con presupuestos limitados.

El ajuste fino se realizo sobre la parte alemana del corpus HIPE-2020, compuesto por periodicos suizos y luxemburgueses entre 1798 y 2018, con cinco tipos de entidad (loc, org, pers, prod, time). El checkpoint alcanza un F1 de 79,06 en el conjunto de test, con una media de 78,71 ± 0,74 sobre 10 semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiXL-Kron (KronLSTM bidireccional, sin atencion, sin embeddings posicionales) |
| Parametros totales | 96.942.155 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 piezas por fragmento (las frases mas largas se dividen y se recomponen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es BiXL-Kron, un encoder bidireccional construido sobre KronLSTM, una variante de LSTM con parametrizacion matricial tipo Kronecker que reduce el numero de parametros por puerta. La arquitectura prescinde por completo del mecanismo de atencion y de los embeddings posicionales, lo que la situa en la familia de modelos de estado recurrente con coste lineal respecto a la longitud de secuencia. El ajuste fino anade una cabeza compuesta por LayerNorm, dropout de 0,1 y una capa lineal sobre la primera pieza de cada palabra (`pooling: first`), con etiquetado IOB2 y 11 etiquetas (5 tipos de entidad mas `O`).

El ajuste fino se realizo sobre la parte alemana de HIPE-2020 (redistribuida en HIPE-2022), con 3.472 frases y 82.435 tokens de entrenamiento, 1.202 frases y 30.938 tokens de desarrollo, y 1.217 frases y 29.727 tokens de test. Se uso AdamW con learning rate 2e-5, calentamiento lineal sobre el 10 % de los pasos y decaimiento lineal posterior, batch de 16 frases, 10 epocas, recorte de gradiente de 1,0, precision bf16 y semilla 4. La tasa de aprendizaje se selecciono mediante una rejilla de 8 valores, cada uno ejecutado con 10 semillas, eligiendo la de mejor F1 medio en desarrollo. El entrenamiento fue determinista: la repeticion con la misma semilla produjo predicciones identicas byte a byte.

## Capacidades

- Reconocimiento de entidades nombradas en aleman historico con cinco tipos: `loc` (localizacion), `org` (organizacion), `pers` (persona), `prod` (producto) y `time` (tiempo/fecha).
- Etiquetado IOB2 a nivel de span con agregacion `first`, que asigna una etiqueta por palabra a partir de su primera pieza.
- Procesamiento de frases de hasta 512 piezas; las frases mas largas se fragmentan y se recomponen.
- Capacidad multilingue limitada al aleman; no se ha entrenado ni evaluado en otros idiomas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de clasificacion de tokens, no generativo.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Digitalizacion de archivos de prensa historica: el modelo etiqueta personas, lugares, organizaciones y fechas en OCR de periodicos de los siglos XVIII a XX, permitiendo construir indices navegables y busquedas facetadas sobre colecciones digitalizadas.
- Extraccion de entidades para investigacion historica: investigadores pueden extraer automaticamente redes de actores (personas y organizaciones) de corpus como HIPE-2020 y analizar su evolucion temporal con las etiquetas `time`.
- Enriquecimiento de catalogos bibliotecarios y archivisticos: integracion en pipelines de procesamiento de metadatos textuales para poblar campos estructurados (autor, lugar de publicacion, fecha) a partir de descripciones libres.
- Construccion de bases de datos prosopograficas: extraccion sistematica de nombres de personas y sus cargos en corpus periodisticos para estudios de biografia colectiva.
- Preprocesamiento para sistemas de recuperacion de informacion historica: las entidades extraidas sirven como campos indexados en motores de busqueda sobre corpus alemanes historicos.
- Anotacion asistida en proyectos de humanidades digitales: el modelo actua como preanotador para reducir el esfuerzo manual de etiquetado en la creacion de corpus dorados, con revision humana posterior.

## Benchmarks y rendimiento

F1 micro a nivel de span (IOB2) sobre las particiones oficiales de HIPE-2020 (aleman):

| Modelo / configuracion | Dev F1 | Test F1 |
|---|---|---|
| Este checkpoint (semilla 4) | 83,42 | 79,06 (P 78,04 / R 80,10) |
| Media ± desviacion sobre 10 semillas (lr 2e-5) | 82,63 ± 0,50 | 78,71 ± 0,74 |

Rejilla de learning rate (media ± desviacion poblacional sobre 10 semillas):

| Learning rate | Dev F1 | Test F1 |
|---|---|---|
| 5e-6 | 81,63 ± 0,38 | 77,23 ± 0,78 |
| 1e-5 | 82,57 ± 0,47 | 77,97 ± 0,61 |
| **2e-5** | **82,63 ± 0,50** | **78,71 ± 0,74** |
| 3e-5 | 81,63 ± 0,48 | 77,78 ± 0,82 |
| 5e-5 | 79,98 ± 0,58 | 76,76 ± 1,04 |
| 1e-4 | 74,60 ± 1,13 | 72,06 ± 0,80 |
| 2e-4 | 63,39 ± 1,09 | 62,73 ± 1,18 |
| 4e-4 | 28,01 ± 11,25 | 27,84 ± 11,38 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (96,9 M de parametros) y alrededor de 0,2 GB en bf16/fp16, sin contar activaciones.
- GPU recomendadas: cualquier GPU con soporte CUDA y Triton, dado que los kernels de KronLSTM se implementan en Triton sobre CUDA. Una RTX 3090, RTX 4090, A100 o H100 son suficientes; el modelo es muy pequeno para estas tarjetas.
- Cabe holgadamente en GPU de consumo: GTX 1660, RTX 3060, RTX 4060 y superiores.
- En CPU existe una implementacion de referencia de los kernels KronLSTM, por lo que el modelo puede ejecutarse sin GPU, con mayor latencia.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `pipeline("token-classification")`. Requiere instalar el fork fijado de `flash-linear-attention` del repositorio NX-AI/KronLSTM (`pip install 'flash-linear-attention @ git+https://github.com/NX-AI/KronLSTM.git@3d800c9a...'`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeitunks-LM v1 NER HIPE-2020 DE (este) | 96,9 M | 512 piezas | KronLSTM bidireccional, sin atencion | Apache 2.0 | Hugging Face |
| Encoders tipo BERT aleman (p. ej. dbmdz/bert-base-german-cased) | ~110 M | 512 tokens | Transformer con atencion | MIT / varias | Hugging Face |
| Encoders historicos alemanes (p. ej. variantes de DCML) | no disponible | no disponible | Transformer | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks comparativos directos entre este checkpoint y encoders alternativos sobre HIPE-2020 (aleman), por lo que la comparacion de rendimiento no esta disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en aleman historico de periodicos suizos y luxemburgueses; el rendimiento en aleman contemporaneo u otras variedades no esta evaluado y puede degradarse.
- Riesgo de alucinacion de spans: como todo modelo discriminativo, puede asignar etiquetas de entidad a tokens que no lo son, especialmente en OCR ruidoso o en ortografia historica no vista.
- Dependencia de dependencias no estandar: requiere `trust_remote_code=True` y un fork fijado de `flash-linear-attention`; esto complica el despliegue reproducible y la auditoria de seguridad del codigo remoto.
- El modelo solo admite relleno a la derecha (`right-padding`) y rellena internamente a multiplos de 64 piezas; un uso incorrecto del padding puede alterar las predicciones.
- La estrategia de agregacion `first` es la que reproduce el entrenamiento; otras estrategias pueden dar resultados distintos.
- No es un modelo generativo: no puede usarse para resumen, traduccion, respuesta a preguntas ni generacion de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios fuera de HIPE-2020.
- El modelo card indica que el script de empaquetado y la propia card fueron generados por modelos Claude; la receta de ajuste fino y los numeros son del autor.
- Con 12 descargas y 0 likes en el momento de la consulta, la comunidad de usuarios es practicamente inexistente, lo que limita el soporte y la validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefan-it/zeitunks-lm-v1-ner-hipe2020-de
- Modelo base BiXL-Kron: https://huggingface.co/stefan-it/zeitunks-lm-v1
- Documentacion de HIPE-2020: https://github.com/hipe-eval/HIPE-2022-data/blob/main/documentation/README-hipe2020.md
- Fork de flash-linear-attention para KronLSTM: https://github.com/NX-AI/KronLSTM
