# SrothJr/banglamentalBERT-mBERT-dapt-tapt

## Resumen

banglamentalBERT-mBERT (DAPT + TAPT) es un modelo de clasificación de texto en bangla derivado de `bert-base-multilingual-cased` (mBERT), ajustado para detectar cuatro niveles de severidad de depresión en textos de redes sociales. Lo desarrolla SrothJr en el marco de un proyecto del Departamento de CSE de la BRAC University titulado "Detecting Mental Health and Suicidal Tendencies on Social Media using Multimodal NLP". El modelo resuelve una tarea de clasificación multietiqueta de cuatro clases sobre texto monolingüe bangla, un escenario con muy pocos recursos anotados disponibles.

El pipeline de entrenamiento combina adaptación de dominio: primero DAPT (Domain-Adaptive Pretraining) sobre 250.000 publicaciones de salud mental, después TAPT (Task-Adaptive Pretraining) sobre 17.000 textos sintéticos y, finalmente, ajuste supervisado sobre 3.426 textos reales. Según la model card, esta configuración fue la que mayor ganancia relativa aportó del proyecto (+0,88% frente a su línea base) dentro del experimento `fix_dapt` Exp A.

Se trata de un encoder transformer de 177.856.516 parámetros (aproximadamente 178 M), con licencia MIT y pesos en safetensors. El repositorio ocupa 0,7 GB y, en el momento de redactar esta ficha, no registra descargas ni valoraciones, por lo que se trata de una publicación reciente y sin validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, mBERT); `bert-base-multilingual-cased` ajustado |
| Parámetros totales | 177.856.516 (dato real de los safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base mBERT admite 512 tokens |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors, sin variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | Bengalí (bn); el modelo base es multilingüe, pero el ajuste es monolingüe |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de mBERT: un transformer encoder de 12 capas, con atención bidireccional completa y embeddings de token multilingües compartidos. Sobre esa base se aplica una secuencia de tres etapas. La primera es DAPT sobre 250.000 publicaciones de salud mental, que adapta las representaciones del modelo al registro léxico y estilístico de este dominio (vocabulario coloquial, expresiones de malestar, abreviaturas). La segunda es TAPT sobre 17.000 textos sintéticos, orientada a acercar el modelo a la tarea concreta de clasificación. La tercera es el ajuste supervisado con 3.426 textos reales anotados en cuatro clases de severidad.

La model card no detalla la composición exacta del dataset, el número de tokens procesados, ni si se aplicaron técnicas de ajuste por preferencias (RLHF, DPO), algo poco habitual en un clasificador encoder de estas características. Tampoco se especifica la estrategia de manejo del desbalance de clases, aunque el F1 de 0,705 en la clase 3 (severidad moderada) sugiere que esta clase es la más difícil del problema. No se documenta ninguna innovación arquitectónica adicional: es un ajuste fino estándar de un encoder preentrenado con adaptación de dominio en dos fases.

## Capacidades

- Clasificación de texto en bangla en cuatro clases de severidad de depresión (la model card solo desglosa explícitamente la clase 3, "Moderate", con F1 de 0,705).
- Análisis de textos cortos propios de redes sociales: publicaciones, comentarios y mensajes informales.
- Puntuación de severidad por muestra, apta para su uso como señal de priorización en sistemas de triaje.
- Inferencia eficiente en CPU y GPU por su tamaño reducido (178 M de parámetros).
- No dispone de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada: aunque el modelo base es multilingüe, el ajuste se realizó únicamente sobre bangla.

## Casos de uso

- Triaje de publicaciones en redes sociales: el modelo clasifica cada texto en uno de los cuatro niveles de severidad y permite enrutar automáticamente los casos moderados o graves a un equipo humano de moderación o intervención, reduciendo el volumen de revisión manual.
- Sistemas de alerta temprana en foros y comunidades online en bangla: integrado en un pipeline de ingesta, marca publicaciones candidatas a revisión prioritaria mediante un umbral de probabilidad sobre la clase de mayor severidad.
- Priorización en líneas de ayuda y chats de apoyo: dado que solo procesa textos de hasta 512 tokens, puede puntuar mensajes entrantes en tiempo real y asignar los recursos limitados del equipo de atención a los casos más severos.
- Investigación en salud pública y epidemiología: procesamiento por lotes de grandes corpus de redes sociales en bangla para estimar la prevalencia relativa de cada nivel de severidad a lo largo del tiempo o por región.
- Preetiquetado y anotación asistida: el modelo genera etiquetas iniciales sobre corpus no anotados que después revisan anotadores humanos, acelerando la construcción de nuevos datasets clínicos en bangla.
- Investigación académica en NLP de bajos recursos: sirve como línea base reproducible para experimentos de DAPT y TAPT en dominios de salud mental, comparando la ganancia de cada etapa de adaptación.
- Moderación de contenido asistida en plataformas: combinado con filtros de palabras clave, aporta una señal semántica adicional para distinguir entre textos de malestar real y contenido que solo menciona términos de salud mental.
- Enrutado en aplicaciones de bienestar emocional: clasifica la entrada del usuario para decidir si se responde con recursos de autoayuda o se deriva a un profesional, siempre como componente de apoyo y no como sustituto de una evaluación clínica.

## Benchmarks y rendimiento

Los únicos datos publicados son los del conjunto de test del proyecto. No hay resultados de benchmarks estándar (MMLU, GLUE, XNLI, etc.) en la información disponible.

| Métrica | Valor |
|---|---|
| Accuracy (test) | 85,05% |
| F1 ponderado (test) | 85,05% |
| F1 clase 3 (Moderate) | 0,705 |
| Ganancia relativa frente a la línea base | +0,88% |

No se especifica el tamaño del conjunto de test, la distribución de clases ni los resultados por clase distintos de la clase 3, por lo que no es posible reconstruir la matriz de confusión ni comparar de forma rigurosa con otros modelos.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 712 MB (el repositorio completo ocupa 0,7 GB).
- VRAM estimada para inferencia: en torno a 2 GB en fp32 incluyendo activaciones y overhead del runtime; alrededor de 0,5-1 GB si se convierte a fp16; inferior a 0,5 GB en int8 dinámico.
- Cabe sin problema en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, así como en GPUs de datacenter (T4, L4, A100, H100), donde el modelo queda muy infrautilizado.
- Inferencia en CPU perfectamente viable: es un encoder de 178 M de parámetros, adecuado para despliegues sin GPU con lotes pequeños o moderados.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportación a ONNX Runtime, TorchScript, FastAPI o Flask como servicio HTTP, y servidores de inferencia para encoders. vLLM y TGI están orientados a modelos generativos, por lo que su uso aquí aporta poco valor añadido. No hay pesos GGUF publicados, así que llama.cpp y Ollama no son aplicables directamente sin una conversión manual.
- Latencia y throughput: no se han publicado datos. No se dispone de cifras verificadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas públicas y pueden variar; conviene verificarlos antes de tomar una decisión. No se dispone de resultados comparativos en un mismo conjunto de evaluación para ninguno de ellos.

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banglamentalBERT-mBERT (DAPT+TAPT) | 177,9 M | No disponible (base: 512 tokens) | Bengalí | MIT | HuggingFace |
| `bert-base-multilingual-cased` (mBERT sin ajustar) | 178 M | 512 tokens | Multilingüe (104 idiomas) | Apache 2.0 | HuggingFace |
| XLM-RoBERTa base | 278 M | 512 tokens | Multilingüe (100 idiomas) | MIT | HuggingFace |
| BanglaBERT (modelos específicos de bangla) | No disponible en la información proporcionada | No disponible | Bengalí | No disponible | HuggingFace |

La ventaja diferencial de este modelo es el ajuste específico en dos fases (DAPT + TAPT) sobre dominio de salud mental en bangla, algo que los modelos base multilingües no ofrecen. Su desventaja es la ausencia total de validación externa y de resultados comparables publicados.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye una evaluación clínica profesional. Cualquier uso en contextos sanitarios reales exige validación regulatoria y supervisión humana.
- La clase 3 (severidad moderada) presenta un F1 de 0,705, notablemente inferior a la media global del 85,05%, lo que indica un rendimiento desigual entre clases; conviene revisar la matriz de confusión antes de desplegarlo.
- Riesgo de falsos negativos en los casos de mayor gravedad, el escenario más crítico en una aplicación de salud mental. No se han publicado métricas de sensibilidad ni especificidad por clase.
- Sesgo de dominio: el DAPT se realizó sobre publicaciones de redes sociales, lo que sobrerrepresenta a usuarios jóvenes, urbanos y con acceso a internet, y puede no generalizar a otros registros o variantes dialectales del bangla.
- El TAPT empleó 17.000 textos sintéticos; los artefactos de generación pueden haber introducido sesgos difíciles de cuantificar.
- Limitación idiomática: solo bangla. No se ha evaluado el rendimiento con code-switching bangla-inglés, muy frecuente en redes sociales.
- Límite de longitud: al heredar la arquitectura mBERT, la ventana efectiva es de 512 tokens como máximo; textos más largos requieren truncamiento o segmentación.
- Licencia MIT, que permite uso comercial y modificación sin restricciones, pero sin ninguna garantía por parte del autor.
- Modelo sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, publicado en octubre de 2026 según los metadatos. No ha pasado por revisión por pares ni por validación de terceros.
- La model card no documenta el tamaño del conjunto de test ni la composición del dataset, lo que impide auditar la metodología de evaluación.
- Los resultados de búsqueda web asociados a esta consulta no contenían material relacionado con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SrothJr/banglamentalBERT-mBERT-dapt-tapt
- No se han encontrado enlaces adicionales relevantes (papers, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
- Institución mencionada en la model card: BRAC University, Department of CSE (no se proporciona URL).
