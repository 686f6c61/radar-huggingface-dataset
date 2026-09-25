# tadiecool29/STL-Full-FT-mt5-base-sentiment

## Resumen

STL-Full-FT-mt5-base-sentiment es un ajuste fino completo (full fine-tuning) del modelo google/mt5-base, publicado por el usuario tadiecool29 en HuggingFace. Se trata de un modelo encoder-decoder de arquitectura transformer, con 582.401.280 parámetros (unos 582 millones), orientado a tareas de análisis de sentimiento y, según las etiquetas de la model card, también a detección de postura (stance detection) sobre texto en amhárico. El identificador STL hace referencia a single-task learning: cada modelo del autor se entrena de forma independiente para una única tarea, en contraste con las variantes MTL (multi-task learning) del mismo repositorio.

El problema que aborda es el análisis de opinión en un idioma con recursos limitados como el amhárico, donde los modelos monolingües y los clasificadores entrenados sobre inglés rinden de forma pobre. Al partir de mT5-base, el modelo hereda el tokenizador SentencePiece con vocabulario multilingüe de 250.000 tokens y la cobertura de 101 idiomas del preentrenamiento original, lo que permite representar texto amhárico con una fragmentación razonable.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin model card completa (el apartado de descripción y usos previstos dice literalmente "More information needed"), sin dataset de entrenamiento identificado y con unas métricas de evaluación modestas (accuracy 0,6047 y macro F1 0,5807). Es un artefacto útil como referencia de investigación y como punto de partida reproducible, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia mT5, T5 v1.1 adaptado a multilingüe) |
| Parámetros totales | 582.401.280 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; mT5-base define 512 tokens como longitud máxima de posición |
| Tipos de cuantización | no disponibles; el repositorio solo publica safetensors en precisión completa. Al ser un transformer estándar admite cuantización int8/int4 vía bitsandbytes y conversión a GGUF, pero no hay artefactos de este tipo publicados |
| Idiomas soportados | la model card no los declara. Las etiquetas indican uso previsto en amhárico; el modelo base mT5 cubre 101 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1,2 GB) |
| Librería | transformers |
| Modelo base | google/mt5-base |
| Tarea declarada | text2text-generation (clasificación formulada como generación de texto) |
| Técnica de ajuste | full fine-tuning (todos los pesos actualizados) |
| Idiomas de la ficha | no disponibles |

## Arquitectura y entrenamiento

La arquitectura es la de mT5-base: un transformer encoder-decoder con atención completa, sin las mejoras de eficiencia de variantes posteriores. El modelo se ajustó mediante full fine-tuning, es decir, actualizando la totalidad de los 582 millones de parámetros, no mediante adaptadores tipo LoRA o prefijos. La tarea se formula como text2text-generation, de modo que la etiqueta de sentimiento se emite como secuencia de texto en lugar de como logits sobre una cabeza de clasificación.

Los hiperparámetros documentados en la model card son: learning rate 0,0003, train batch size 8 con 4 pasos de acumulación de gradiente (batch efectivo 32), eval batch size 16, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en su variante fused, scheduler cosine con 300 pasos de warmup, 10 épocas, semilla 42 y label smoothing de 0,05. El entrenamiento se detuvo de forma efectiva en la época 7 según la tabla registrada, con 189 pasos por época. No hay información sobre el dataset utilizado: la model card afirma explícitamente que el modelo se ajustó "on an unknown dataset", y no se documenta composición, tamaño, número de tokens ni proceso de anotación. Tampoco se menciona RLHF, DPO ni ninguna fase de alineación posterior. Como referencia de entorno, el entrenamiento se ejecutó con Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1, según las versiones de framework declaradas.

## Capacidades

- Generación de texto condicionada: al formularse como text2text-generation, el modelo produce secuencias de texto como salida; en el contexto de la tarea, etiquetas de sentimiento o de postura.
- Clasificación de sentimiento sobre texto en amhárico: es el uso declarado en el nombre del modelo y en sus etiquetas.
- Detección de postura (stance detection): aparece como etiqueta del repositorio, aunque la variante específica de stance se publica como modelo separado (STL-FullFT-mt5-base-stance).
- Capacidad multilingüe heredada: el tokenizador y los pesos de partida son los de mT5-base, entrenado sobre 101 idiomas; el grado de retención tras el ajuste no está documentado.
- Sin soporte de tool calling ni function calling: no hay plantilla de chat, ni tokens especiales de herramienta, ni documentación al respecto.
- Sin capacidades de agente ni razonamiento multi-paso: el modelo no tiene modo thinking ni decodificación especulativa.
- Sin capacidades multimodales: no procesa visión, audio ni imágenes.
- Modelo de un solo turno y una sola tarea: no es un modelo conversacional.

## Casos de uso

- Monitorización de redes sociales en amhárico: clasificar publicaciones y comentarios en categorías de sentimiento para detectar picos de opinión negativa sobre una marca o un servicio. El modelo es adecuado porque está ajustado específicamente sobre ese idioma, algo poco frecuente en la oferta disponible.
- Investigación académica sobre análisis de opinión en lenguas de bajos recursos: sirve como línea base reproducible para comparar estrategias de ajuste (STL frente a MTL), dado que el autor publica variantes paralelas del mismo experimento con hiperparámetros documentados.
- Detección de postura en debates públicos: identificar si un texto se posiciona a favor o en contra de un tema concreto, útil en estudios de polarización y en análisis de discurso político.
- Filtrado previo en pipelines de moderación: actuar como primera etapa de triaje que marca contenido potencialmente problemático para revisión humana posterior, reduciendo el volumen que llega a los moderadores.
- Extracción de señales para análisis de mercado en mercados de habla amhárica: alimentar paneles de seguimiento de opinión pública o de percepción de producto con etiquetas automáticas sobre grandes volúmenes de texto.
- Generación de datos etiquetados de forma asistida: usar las predicciones del modelo como preetiquetado para que anotadores humanos corrijan, acelerando la construcción de corpus en amhárico.
- Evaluación comparativa de técnicas de ajuste eficiente: al existir la variante de full fine-tuning, resulta un punto de referencia para medir cuánto se pierde al pasar a LoRA o a adaptadores sobre el mismo modelo base.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación del propio autor, recogidos en la model card. El model-index no contiene entradas adicionales (la lista de resultados está vacía) y no hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar.

Métricas finales declaradas en el conjunto de evaluación:

| Métrica | Valor |
|---|---|
| Loss | 1,1774 |
| Accuracy | 0,6047 |
| Macro F1 | 0,5807 |

Evolución durante el entrenamiento (datos de la model card):

| Época | Paso | Training loss | Validation loss | Accuracy | Macro F1 |
|---|---|---|---|---|---|
| 1,0 | 189 | 12,7883 | 3,3935 | 0,3766 | 0,1378 |
| 2,0 | 378 | 1,4209 | 1,2932 | 0,4389 | 0,3079 |
| 3,0 | 567 | 1,3251 | 1,2075 | 0,5748 | 0,5294 |
| 4,0 | 756 | 1,2981 | 1,1993 | 0,6047 | 0,5993 |
| 5,0 | 945 | 1,2665 | 1,1933 | 0,5786 | 0,5598 |
| 6,0 | 1134 | 1,2545 | 1,1868 | 0,6035 | 0,5850 |
| 7,0 | 1323 | 1,2489 | 1,1774 | 0,6047 | 0,5807 |

No se dispone de comparación con otros modelos sobre el mismo conjunto de evaluación, porque el dataset no está identificado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,3 GB solo para los pesos, más activaciones y memoria del tokenizador; en la práctica unos 3-4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para los pesos, con un consumo total típico de 2-3 GB.
- VRAM estimada en int8: del orden de 0,6-0,8 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Funciona con RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema; las GPU de gama alta quedan muy sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales, incluidas las de portátil con 6 GB o más.
- Ejecución en CPU: viable para inferencia por lotes pequeños, con latencias sensiblemente mayores; no se han publicado mediciones.
- Opciones de despliegue: transformers con pipeline de text2text-generation, HuggingFace Inference Endpoints (la etiqueta endpoints_compatible está presente), Text Generation Inference para servir el modelo, y vLLM, que soporta arquitecturas encoder-decoder de la familia T5. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles. No hay ninguna medición publicada por el autor.

## Comparativa con modelos similares

No hay datos de benchmarks comparables publicados para este modelo, por lo que la comparación se limita a características estructurales y de licencia.

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| STL-Full-FT-mt5-base-sentiment | 582 M | Encoder-decoder (mT5) | no declarado (mT5-base: 512) | apache-2.0 | Ajuste full fine-tuning, single-task, sin dataset documentado |
| google/mt5-base | 582 M | Encoder-decoder (mT5) | 512 tokens | apache-2.0 | Modelo base sin ajustar; referencia directa de partida |
| xlm-roberta-base | 278 M | Encoder-only | 512 tokens | MIT | Alternativa encoder-only multilingüe, habitual como base para clasificación; requiere cabeza de clasificación |
| AfriBERTa / variantes afines | no disponible | Encoder-only | no disponible | no disponible | No se dispone de datos verificados en la información consultada |

La comparación de rendimiento frente a estas alternativas no es posible con la información disponible, ya que el conjunto de evaluación de este modelo no está identificado y no se han publicado resultados cruzados.

## Limitaciones y advertencias

- Rendimiento limitado: accuracy de 0,6047 y macro F1 de 0,5807 sobre el conjunto de evaluación. Con clases equilibradas, un clasificador trivial se situaría alrededor del 0,33 de accuracy; el margen sobre esa referencia es estrecho y no hay información sobre la distribución de clases.
- Progreso irregular en el entrenamiento: el training loss arranca en 12,7883 en la primera época, un valor anómalamente alto que sugiere un calentamiento problemático o una inicialización inadecuada de la cabeza de salida; además, la época 4 obtiene mejor macro F1 (0,5993) que la época 7 (0,5807), lo que indica que no hubo una mejora monótona.
- Dataset de entrenamiento desconocido: la model card indica explícitamente que el ajuste se hizo sobre un dataset no identificado. Esto impide evaluar sesgos de dominio, cobertura temática, calidad de las anotaciones y riesgo de contaminación entre entrenamiento y evaluación.
- Model card incompleta: las secciones de descripción del modelo, usos previstos y datos de entrenamiento contienen únicamente "More information needed". No hay guía del autor sobre uso adecuado.
- Sesgos potenciales no evaluados: no se ha publicado ningún análisis de sesgo por género, religión, etnia o afiliación política. En una tarea de análisis de opinión en un contexto lingüístico concreto, este riesgo es relevante.
- Riesgo de alucinación de etiquetas: al formular la clasificación como generación de texto, el modelo puede producir secuencias que no correspondan a ninguna etiqueta válida del esquema previsto, algo que no ocurre con una cabeza de clasificación sobre logits. Es necesario validar y filtrar la salida.
- Cobertura de idiomas incierta: la ficha no declara idiomas y no hay evaluación fuera del amhárico. El uso en otros idiomas es una extrapolación no verificada, aunque el modelo base sea multilingüe.
- Límite de contexto: no declarado; el valor por defecto de mT5-base es 512 tokens, lo que restringe el análisis de documentos largos y obliga a truncar o segmentar.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, sin versiones adicionales, sin demo y sin repo de código asociado. No hay evidencia de uso en producción por parte de terceros.
- Licencia: apache-2.0, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia. Es compatible con la licencia del modelo base. No obstante, la ausencia de documentación sobre el dataset de ajuste impide descartar obligaciones derivadas de los datos originales.
- Sin garantías de soporte: el autor no ofrece canal de soporte, y las variantes del repositorio (sentiment, stance, afri, MTL) no están documentadas de forma diferenciada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/STL-Full-FT-mt5-base-sentiment
- Modelo base: https://huggingface.co/google/mt5-base
- Variante de sentimiento (nomenclatura alternativa del mismo autor): https://huggingface.co/tadiecool29/STL-FullFT-mt5-base-sentiment
- Variante de detección de postura: https://huggingface.co/tadiecool29/STL-FullFT-mt5-base-stance
- Ficha de registro de la variante de postura en free2aitools: https://free2aitools.com/model/tadiecool29/stl-fullft-mt5-base-stance
- Ficha de registro de la variante afri-mt5-base-sentiment en free2aitools: https://free2aitools.com/model/tadiecool29/stl-fullft-afri-mt5-base-sentiment
