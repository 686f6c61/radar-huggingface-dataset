# SpiderHomie/goodjob

## Resumen

GoodJob es un modelo de clasificación de texto en inglés desarrollado por el usuario SpiderHomie y publicado en Hugging Face. Se construye como un fine-tuning de `google-bert/bert-base-uncased` con dos cabezas de clasificación superpuestas sobre el mismo encoder: una predice el tipo de publicación (`ML Job`, `Job`, `Other`, `Not Job`) y otra estima si la cuenta que publica se comporta como un tablón de empleo (`Regular account` frente a `Job board`). El objetivo declarado es servir de filtro en un pipeline de descubrimiento de oportunidades: raspar publicaciones de Twitter/X y LinkedIn, descartar ruido y quedarse con ofertas reales.

El modelo tiene 109.486.854 parámetros, un tamaño en disco de aproximadamente 0,4 GB y una ventana de entrada de 256 tokens, suficiente para publicaciones individuales de redes sociales. Su relevancia es práctica y acotada: no compite en razonamiento general, sino que resuelve una tarea de clasificación binaria/multiclase muy concreta con métricas declaradas razonables (accuracy 0,872 y macro-F1 0,854 en la cabeza de tipo sobre un test reservado de 483 publicaciones).

Es un modelo pequeño, entrenado solo en inglés, sin licencia declarada y con cero descargas en el momento de la consulta. La cabeza secundaria de tablón de empleo es notablemente más débil (macro-F1 0,736) y el autor advierte que no debe usarse para tomar decisiones de contratación ni para juzgar a personas o cuentas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (bert-base-uncased) con dos cabezas de clasificación |
| Parámetros totales | 109.486.854 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (truncado) |
| Tipos de cuantización | No disponible (pesos safetensors en fp32/fp16; cuantización no documentada) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT base (`bert-base-uncased`, 12 capas, 768 de dimensión oculta) al que se le añaden dos cabezas lineales de clasificación. La primera, expuesta como `logits`, produce cuatro clases (`ML Job`, `Job`, `Other`, `Not Job`); la segunda, expuesta como `board_logits`, produce dos clases (`Regular account`, `Job board`) y solo se entrena y evalúa sobre publicaciones que son ofertas de empleo, excluyendo las etiquetadas como `Not Job` de su función de pérdida. El campo `is_job` se deriva como `type != "Not Job"`, es decir, `p_job = 1 - P("Not Job")`.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. El autor indica que los datos provienen de un único proceso de recolección sobre Twitter/X y LinkedIn con una semilla de búsqueda concreta, y que la partición train/validation/test está agrupada por autor para evitar fugas de información entre conjuntos. El checkpoint se seleccionó sobre validación y el test se evaluó después del entrenamiento. El modelo requiere `trust_remote_code=True` para cargarse, lo que implica que incluye código personalizado para la inferencia por lotes y el método `predict`.

## Capacidades

- Clasificación de publicaciones de redes sociales en cuatro tipos: `ML Job`, `Job`, `Other` y `Not Job`.
- Clasificación conductual de la cuenta emisora como `Regular account` o `Job board` (solo para publicaciones clasificadas como oferta).
- Cálculo de probabilidad agregada de que una publicación sea oferta (`p_job`), lo que permite umbralizar en lugar de usar el argmax para ajustar precisión y recall.
- Inferencia por lotes mediante el método `predict(posts, batch_size=64, device="auto")`, que devuelve una lista de diccionarios en el mismo orden que la entrada.
- Acceso a logits crudos de ambas cabezas para integraciones personalizadas.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de ruido en pipelines de scraping: el modelo recibe cada publicación capturada de Twitter/X o LinkedIn y descarta las etiquetadas como `Not Job`, reduciendo el volumen que llega a etapas posteriores de extracción o revisión manual.
- Descubrimiento de ofertas de IA/ML: la etiqueta `ML Job` permite enrutar publicaciones hacia un canal específico de empleos de machine learning, separándolas de ofertas de ingeniería de software general.
- Priorización por probabilidad: al exponer `p_job`, el sistema puede ordenar las publicaciones por probabilidad de ser oferta y establecer un umbral de corte según la tolerancia al falso positivo del equipo.
- Detección de cuentas tipo tablón: la cabeza `board_logits` permite marcar cuentas que publican empleos con alta frecuencia, útil para agregar fuentes o para deduplicar publicaciones repetidas de un mismo emisor (con la cautela de su menor fiabilidad).
- Enriquecimiento de un agregador de empleo: combinar la clasificación de tipo con metadatos posteriores (extracción de empresa, rol, ubicación) para construir fichas de oferta a partir de publicaciones breves.
- Monitorización de comunidades profesionales: aplicar el clasificador sobre un feed de LinkedIn para medir la proporción de contenido laboral frente a otro tipo de publicaciones a lo largo del tiempo.
- Preetiquetado para anotación humana: usar las predicciones como primera pasada en un flujo de etiquetado, revisando manualmente los casos limítrofes entre `ML Job` y `Job`, y entre `Other` y `Job`.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test reservado (483 publicaciones, agrupado por autor). No verificados de forma independiente.

| Métrica | Valor |
|---|---|
| Accuracy (cabeza de tipo) | 0,872 |
| Macro-F1 (cabeza de tipo) | 0,854 |
| Accuracy (validación) | 0,892 |
| Macro-F1 (validación) | 0,875 |
| Macro-F1 cabeza de tablón (test, solo ofertas, 333 publicaciones) | 0,736 |
| Macro-F1 cabeza de tablón (validación) | 0,796 |

Desglose por clase de la cabeza de tipo en test:

| Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| ML Job | 0,812 | 0,852 | 0,832 | 61 |
| Job | 0,895 | 0,876 | 0,885 | 194 |
| Other | 0,864 | 0,731 | 0,792 | 78 |
| Not Job | 0,871 | 0,947 | 0,907 | 150 |

Matriz de confusión (filas = real, columnas = predicho; orden: ML Job, Job, Other, Not Job):

```
[[ 52,   6,   0,   3],
 [  3, 170,   8,  13],
 [  8,   8,  57,   5],
 [  1,   6,   1, 142]]
```

El autor advierte que los soportes por clase son pequeños (61 para ML Job, 78 para Other) y que diferencias de pocos puntos quedan dentro del ruido. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (109,5 M de parámetros, unos 438 MB de pesos) y alrededor de 0,25 GB en fp16; el consumo real depende del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas y el cuello de botella será el preprocesado y el I/O.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores; también puede ejecutarse en CPU para lotes moderados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado del método `predict`), y en principio exportable a ONNX o TorchScript para servir con TGI o con un servidor propio; llama.cpp y Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoodJob (SpiderHomie) | 109,5 M | 256 tokens | Clasificación de ofertas en 4 clases + tablón | No disponible | Hugging Face |
| bert-base-uncased (Google) | 110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| DistilBERT base uncased | 66 M | 512 tokens | Modelo base destilado, propósito general | Apache 2.0 | Hugging Face |

La comparación directa con modelos de la misma categoría (clasificadores de ofertas de empleo) no está disponible en la información proporcionada. Frente a los modelos base, GoodJob aporta la tarea específica y las dos cabezas, pero hereda la ventana de 256 tokens y carece de una licencia declarada, lo que complica su uso comercial frente a alternativas con licencia Apache 2.0.

## Limitaciones y advertencias

- La cabeza de tablón de empleo es débil: macro-F1 de 0,736 en test y aproximadamente una de cada tres cuentas regulares se etiqueta erróneamente como tablón.
- Las fronteras más difíciles son `ML Job` frente a `Job` y `Other` frente a `Job`; el autor recomienda revisar manualmente esas llamadas.
- El modelo se evaluó sobre un único dataset recolectado con un proceso y una semilla de búsqueda concretos; el rendimiento en otros feeds, plataformas o periodos temporales es desconocido.
- Solo procesa el texto de una publicación individual, truncado a 256 tokens; las publicaciones más largas pierden información.
- Entrenado y evaluado únicamente en inglés; no hay soporte multilingüe documentado.
- No debe usarse para decisiones de contratación ni para juzgar a personas o cuentas: la etiqueta de tablón es conductual, no identitaria.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas confiadas: las probabilidades no están calibradas de forma documentada.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar el código personalizado antes de desplegarlo.
- No se han publicado intervalos de confianza bootstrap ni una línea base de comparación, pese a que el propio autor lo señala como pendiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpiderHomie/goodjob
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
