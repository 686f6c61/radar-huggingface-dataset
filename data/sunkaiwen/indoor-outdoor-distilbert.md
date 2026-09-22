# sunkaiwen/indoor-outdoor-distilbert

## Resumen

`indoor-outdoor-distilbert` es un ajuste fino de `distilbert-base-uncased` sobre la tarea de clasificación binaria de descripciones cortas de lugares en dos clases: `indoor` (interior) y `outdoor` (exterior). Lo publica el usuario de HuggingFace `sunkaiwen` como entrega de la tarea 2 de la asignatura 24-679 *Designing with AI*, y no como un modelo destinado a producción: la propia model card declara que el uso previsto es académico y que cualquier uso real queda fuera de alcance.

El modelo se entrenó con AutoGluon `MultiModalPredictor` 1.6.3 sobre el dataset `srivathsanb14/indoor-outdoor-text`, con 1072 filas de entrenamiento, 16 de validación y 15 de test. El autor comparó tres configuraciones de `optim.peft` (`bit_fit`, `norm_fit` y ajuste completo) y seleccionó `bit_fit`, que solo actualiza los términos de sesgo del encoder y deja congeladas las matrices de pesos principales. El ajuste completo con 1 epoch tardó 30 segundos en una Tesla T4.

Su relevancia es fundamentalmente metodológica y didáctica, no de rendimiento: es un ejemplo reproducible y bien documentado de ajuste ligero (PEFT) sobre un transformer pequeño, con auditoría de fuga de datos incluida. Los números publicados (0,933 de accuracy en 15 filas de test) deben leerse con mucha cautela porque el propio autor advierte que el intervalo de confianza al 95 % sobre 31 filas es de aproximadamente ±17 puntos porcentuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT: 6 capas, representación oculta de 768, 12 cabezas de atención); cabeza de clasificación de 2 etiquetas |
| Parametros totales | Aproximadamente 66 M, heredados de `distilbert-base-uncased`; no declarado explícitamente en la model card |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128 tokens de longitud máxima de secuencia durante el ajuste; el backbone admite hasta 512 posiciones posicionales |
| Tipos de cuantizacion | No disponible: no se publican pesos cuantizados ni versiones GGUF, ONNX o int8 |
| Idiomas soportados | Inglés únicamente, con el registro y vocabulario de un único anotador |
| Licencia | CC-BY-4.0 (alineada con el dataset de origen); el modelo base `distilbert-base-uncased` es Apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch dentro del directorio `predictor/` de AutoGluon; repositorio de 0,3 GB. No se publican safetensors ni GGUF |
| Tarea | Clasificación de texto (`text-classification`), 2 clases: `indoor` / `outdoor` |
| Libreria | AutoGluon `MultiModalPredictor` 1.6.3 |
| Dataset | `srivathsanb14/indoor-outdoor-text` |
| Descargas / likes | 17 descargas, 0 likes |
| Fecha de publicacion | 22 de septiembre de 2026 (creación y última actualización con 19 segundos de diferencia) |

## Arquitectura y entrenamiento

La base es `distilbert-base-uncased`, un encoder transformer de 6 capas obtenido por destilación de conocimiento a partir de BERT-base, con representación oculta de 768 dimensiones y 12 cabezas de atención. Sobre él se añade una cabeza de clasificación de dos clases. El ajuste se realizó con AutoGluon `MultiModalPredictor` 1.6.3, con `eval_metric='f1_macro'`, batch de 16, longitud máxima de secuencia de 128, learning rate 1e-03 con 10 % de warmup y decaimiento coseno, hasta 6 épocas con early stopping de paciencia 3, semilla `20260922` y una única ejecución por configuración en una Tesla T4.

La innovación metodológica del trabajo es la comparación controlada de tres ajustes PEFT con tasas de aprendizaje deliberadamente distintas, porque un ajuste completo de un transformer preentrenado necesita un paso pequeño (2e-05) mientras que un ajuste solo de sesgos actualiza tan pocos parámetros que la misma tasa apenas movería el modelo (1e-03). Se seleccionó `bit_fit` por equilibrio entre coste y métrica.

| Configuracion `optim.peft` | Que se actualiza | Learning rate | Macro-F1 validacion (n=16) | Epocas | Tiempo |
|---|---|---|---|---|---|
| `bit_fit` (seleccionada) | Términos de sesgo en todo el encoder; matrices principales congeladas | 1e-03 | 1.0000 | 1 | 30 s |
| `norm_fit` | Escalas y offsets de LayerNorm más otros sesgos | 1e-03 | 1.0000 | 1 | 19 s |
| `None` (ajuste completo) | Todo: embeddings, atención y feed-forward | 2e-05 | 0.9373 | 4 | 86 s |

El autor incluye además una auditoría de fuga de datos: 0 de 31 filas de evaluación son duplicados exactos de frases de entrenamiento, la similitud media con el vecino más cercano por TF-IDF coseno es 0,204 y ninguna fila supera 0,90 de similitud. Esto es relevante porque la mayoría de filas de entrenamiento son variantes aumentadas de un conjunto original más pequeño.

## Capacidades

- Clasificación binaria de texto corto en inglés: devuelve `indoor` o `outdoor` a partir de una descripción de un lugar (por ejemplo, "A long corridor lined with lockers.").
- Clasificación de secuencias de hasta 128 tokens, adecuada para frases descriptivas breves.
- Inferencia muy ligera: el ajuste completo tardó 30 segundos en una T4, lo que da una idea del orden de magnitud del coste computacional.
- No soporta tool calling ni function calling.
- No está diseñado para uso agéntico ni razonamiento multi-paso: es un clasificador de una sola pasada.
- No tiene modo de razonamiento explícito (*thinking mode*), ni capacidades de visión, audio o generación de texto libre.
- Multilingüismo: nulo fuera del inglés; la model card restringe explícitamente el alcance a un único registro y vocabulario de un solo anotador.

## Casos de uso

- Docencia y reproducción de experimentos PEFT: sirve como ejemplo completo y ejecutable en notebooks para comparar `bit_fit`, `norm_fit` y ajuste completo con tasas de aprendizaje justificadas, en hardware de gama media (una T4 o incluso CPU).
- Pre-etiquetado de datos para anotación humana: dado un conjunto de descripciones de lugares en inglés, el modelo puede generar etiquetas preliminares que un anotador revise después, siempre que se mida antes la similitud del corpus nuevo con el de entrenamiento.
- Filtrado auxiliar en pipelines multimodales: usar la descripción textual como señal débil complementaria a un clasificador de imágenes de interiores/exteriores, nunca como decisión final.
- Enrutado de consultas en un catálogo de puntos de interés (POI): separar descripciones que mencionan espacios interiores de las que mencionan exteriores para dirigirlas a distintos flujos de procesamiento, con validación previa sobre datos propios.
- Demostración de destilación y modelos compactos: ilustra qué se puede conseguir con 66 millones de parámetros y un ajuste de sesgos, útil para argumentar decisiones de coste frente a alternativas mayores.
- Auditoría de sesgo y de fuga de datos como plantilla metodológica: el apartado de *leakage audit* del modelo se puede reutilizar como plantilla para evaluar otros fine-tunes pequeños.
- Prueba de integración técnica: ejemplo mínimo de carga de un predictor de AutoGluon serializado mediante `snapshot_download` más `MultiModalPredictor.load`, útil para validar pipelines de despliegue antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, SuperGLUE ni similares) en la información disponible. Las únicas métricas publicadas son específicas de esta tarea:

| Metrica | Conjunto | n | Valor |
|---|---|---|---|
| Exactitud | Test | 15 | 0.933 |
| Macro-F1 | Test | 15 | 0.933 |
| Macro-F1 | Validación (selección de configuración) | 16 | 1.0000 |
| Exactitud | Validación + test | 31 | 0.968 |
| Macro-F1 | Validación + test | 31 | 0.968 |
| Errores | Validación + test | 31 | 1 |

El propio autor señala que un intervalo de confianza al 95 % sobre 31 filas es de aproximadamente ±17 puntos porcentuales, de modo que este modelo y cualquier otro dentro de ese margen no son distinguibles con estos datos. Además, advierte que la tarea puede estar prácticamente saturada porque el vocabulario de interior y exterior apenas se solapa, por lo que la puntuación alta es en buena medida una propiedad del dataset y no una medida de comprensión.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precisión de 32 bits y del orden de unos cientos de megabytes en 16 bits, dado el tamaño del backbone (aproximadamente 66 M de parámetros). Son estimaciones, no mediciones publicadas.
- GPU recomendadas: cualquiera con al menos 4 GB de VRAM; el ajuste se realizó en una Tesla T4. También es viable en A100, H100, RTX 4090, RTX 3060 o GPU integradas recientes, aunque para este tamaño de modelo no aportan ventaja significativa.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más, incluida la gama de entrada. La inferencia en CPU es perfectamente viable para volúmenes moderados.
- Opciones de despliegue: AutoGluon `MultiModalPredictor` es la vía nativa (carga mediante `snapshot_download` y `MultiModalPredictor.load`); también se puede extraer el checkpoint de PyTorch y cargarlo con `transformers` como `AutoModelForSequenceClassification`, y a partir de ahí exportar a ONNX o TorchScript. No se publican pesos GGUF ni versiones listas para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el de entrenamiento: 30 segundos de reloj de pared para 1 época con `bit_fit` en una T4.

## Comparativa con modelos similares

No se han publicado evaluaciones comparativas en esta tarea con otros modelos, y el propio autor indica que 31 filas de evaluación son demasiado pocas para clasificar este modelo frente a otro. La tabla siguiente recoge únicamente características estructurales y de licencia; las cifras de parámetros de las alternativas provienen de la documentación pública de sus arquitecturas base, no de la información proporcionada, y ninguna de ellas está evaluada sobre `indoor-outdoor-text`.

| Modelo | Parametros | Contexto max. | Licencia | Rendimiento en indoor/outdoor | Disponibilidad |
|---|---|---|---|---|---|
| `sunkaiwen/indoor-outdoor-distilbert` | ~66 M | 128 tokens en ajuste | CC-BY-4.0 | 0,933 accuracy / 0,933 macro-F1 (n=15) | HuggingFace, 17 descargas |
| `distilbert-base-uncased` sin ajustar | ~66 M | 512 tokens | Apache-2.0 | No evaluado en esta tarea | HuggingFace |
| `bert-base-uncased` con ajuste completo | ~110 M | 512 tokens | Apache-2.0 | No evaluado en esta tarea | HuggingFace |
| Comparación con prompting sobre un LLM | No disponible | No disponible | No disponible | No disponible: el autor menciona que el trabajo es la mitad de ajuste de una comparación ajuste frente a prompting, pero no publica los resultados del brazo de prompting | No disponible |

## Limitaciones y advertencias

- Tarea posiblemente saturada: el vocabulario de interior y exterior apenas se solapa, por lo que una puntuación alta refleja en buena medida una propiedad del dataset.
- Solo 31 filas de evaluación (16 de validación más 15 de test), insuficientes para comparar modelos; el intervalo de confianza al 95 % es de aproximadamente ±17 puntos porcentuales.
- Etiquetas de un único anotador, sin verificación independiente, y sin convención definida para espacios de transición como porches, invernaderos o mercados cubiertos.
- Cobertura deformada por el aumento de datos: el modelo ha visto en profundidad un vecindario estrecho alrededor de cada frase original y nada del resto del espacio de entradas.
- Solo inglés, y con el registro y vocabulario de una sola persona.
- Sesgos heredados de DistilBERT: cualquier sesgo del corpus de preentrenamiento se conserva, y una configuración PEFT con pesos congelados los hereda casi por completo.
- Risgo de alucinación conceptual: al ser un clasificador de dos clases no genera texto libre, pero puede asignar con seguridad injustificada etiquetas a descripciones fuera de su distribución, incluida terminología técnica o textos largos truncados a 128 tokens.
- Restricción de licencia: CC-BY-4.0 exige atribución al autor del dataset para el texto subyacente; el modelo base es Apache-2.0, con condiciones distintas.
- Advertencia de uso: la model card declara el uso real fuera de alcance. Un modelo entrenado con unos cientos de frases aumentadas no tiene autoridad fuera del ámbito del curso, y el riesgo realista es la confianza excesiva en sus predicciones.
- Coste de integración: los pesos se distribuyen en formato de predictor de AutoGluon, no como checkpoint estándar de `transformers`, lo que añade un paso de extracción o conversión antes de integrarlo en infraestructura de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunkaiwen/indoor-outdoor-distilbert
- Dataset de origen: https://huggingface.co/datasets/srivathsanb14/indoor-outdoor-text
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de AutoGluon MultiModalPredictor: https://auto.gluon.ai
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a páginas de inicio de sesión de Gmail y no guardan relación con el modelo.
