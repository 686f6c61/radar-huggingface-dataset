# tassiascarvalho/genlocalnews-newsworthiness-xlmr

## Resumen

El modelo `tassiascarvalho/genlocalnews-newsworthiness-xlmr` es un clasificador multitarea de noticiabilidad (newsworthiness) entrenado sobre actas municipales portuguesas. Lo desarrolla Tassia Carvalho en el marco de su disertación de máster *GenLocalNews*, en la Universidade da Beira Interior, como componente de modelización del demostrador GenLocalNews. Su función es determinar si un segmento de un acta municipal (el texto asociado a un asunto concreto) constituye materia noticiable y, en caso afirmativo, estimar siete valores-noticia y un Índice de Interés Público (IIP).

Técnicamente es un encoder transformer XLM-RoBERTa Base (277.459.991 parámetros) con ajuste fino completo, al que se le añaden nueve cabezas de salida sobre la misma representación de segmento: siete módulos de regresión ordinal CORAL (relevancia, proximidad, novedad, actualidad, continuidad, notoriedad y negatividad, cada uno con puntuación de 1 a 5), un módulo de regresión del IIP con sigmoide y un módulo binario de noticiabilidad. La ventana de entrada está truncada a 512 tokens.

Su relevancia actual reside en que aborda un problema poco cubierto por modelos generalistas: la triaje editorial automática de documentación administrativa local en portugués europeo, un dominio con escasez de recursos anotados. El modelo se publica con licencia MIT y pesos en formato safetensors, aunque requiere `trust_remote_code=True` por incorporar código de arquitectura propio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa Base) con 9 cabezas de salida sobre representación media con dropout 0,10 |
| Parametros totales | 277.459.991 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (segmentos truncados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués (pt), variante europea en los datos de entrenamiento |
| Licencia | MIT |
| Formato de pesos | safetensors, con código de modelado propio (`modeling_genlocalnews.py`) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base` con ajuste fino completo. La representación del segmento se obtiene promediando los estados ocultos de las posiciones que no son de relleno, seguida de un dropout de 0,10. Sobre esa representación se disponen nueve módulos: siete módulos ordinarles CORAL, cada uno con un vector de pesos compartido y cuatro términos independientes por orden decreciente, que devuelven puntuaciones de 1 a 5; un módulo de regresión del IIP con activación sigmoide; y un módulo de clasificación binaria. La función de pérdida combina entropía cruzada binaria, la media de las siete pérdidas ordinarles (ponderadas por clase) y el error cuadrático medio del IIP. El IIP se define formalmente como z_i = (Σ w_k · v_{i,k} − 1) / 4, con pesos w = (0,30; 0,20; 0,15; 0,10; 0,10; 0,10; 0,05) en el orden relevancia, proximidad, novedad, actualidad, continuidad, notoriedad y negatividad; el modelo ofrece dos estimaciones (`iip_direto` por el módulo de regresión e `iip_calculado` aplicando la fórmula a las puntuaciones previstas).

Los datos proceden de la componente de noticiabilidad del conjunto CitiLink-News, construido a partir de CitiLink-Minutes: 1.207 segmentos de 53 actas de seis municipios portugueses (Alandroal, Campo Maior, Covilhã, Fundão, Guimarães y Porto). Las particiones se hacen por acta: 960 segmentos y 43 actas en entrenamiento, 124 segmentos y 5 actas en validación, y 123 segmentos y 5 actas en prueba. El entrenamiento empleó hasta 20 épocas con parada anticipada por pérdida de validación, lote efectivo de 32 (8 × 4 pasos de acumulación), AdamW con tasa de aprendizaje 2×10⁻⁵, weight decay 0,01, 10% de calentamiento y precisión de 32 bits, sobre una GPU NVIDIA A100 de 80 GB. Esta configuración (XLM-RoBERTa Base con full fine-tuning) se seleccionó en validación frente a Albertina 100M y BERTimbau Base, y frente a tres regímenes de ajuste, usando el macro-F1 binario medio sobre cinco semillas como criterio. El checkpoint publicado corresponde a la semilla 42, con umbral binario 0,845.

## Capacidades

- Clasificación binaria de noticiabilidad: devuelve probabilidad y decisión (noticiable / no noticiable) según el umbral configurado en `binary_threshold`.
- Predicción ordinal de siete valores-noticia (CORAL) con puntuación de 1 a 5: relevancia, proximidad, novedad, actualidad, continuidad, notoriedad y negatividad.
- Regresión del Índice de Interés Público (IIP) en el rango [0, 1], con dos estimaciones complementarias (directa y calculada).
- Extracción de características (feature-extraction) sobre texto en portugués, dado el encoder subyacente.
- Procesamiento de segmentos individuales de hasta 512 tokens.
- Multitarea en una sola pasada: las tres salidas se calculan simultáneamente sobre el mismo segmento.
- No dispone de soporte documentado para tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Triaje editorial de actas municipales: la redacción introduce cada segmento del acta y obtiene una probabilidad de noticiabilidad con umbral calibrado (0,845) que ayuda a decidir qué asuntos merecen cobertura, reduciendo el tiempo de revisión manual.
- Priorización de contenidos en medios locales: los valores-noticia permiten ordenar los segmentos por interés potencial, por ejemplo destacando los de alta relevancia y proximidad, para planificar la agenda informativa semanal.
- Filtrado de ruido administrativo: descartar automáticamente los segmentos con probabilidad de noticiabilidad baja (trámites rutinarios) y concentrar el esfuerzo humano en el resto.
- Indexación y búsqueda semántica en hemerotecas municipales: usar las representaciones del encoder para agrupar o recuperar asuntos similares entre actas de distintos plenos.
- Preanotación de corpus para investigación en periodismo: generar etiquetas preliminares de noticiabilidad y valores-noticia que luego validan anotadores humanos, acelerando la construcción de datasets.
- Monitorización del interés público: aplicar el IIP como indicador cuantitativo para estudiar qué tipo de asuntos generan mayor interés municipal a lo largo del tiempo.
- Estudios académicos sobre valores-noticia: analizar la distribución de las siete dimensiones en corpus de actas para caracterizar rutinas de decisión editorial en el ámbito local.

## Benchmarks y rendimiento

Resultados en el conjunto de prueba (123 segmentos, 5 actas), checkpoint publicado (semilla 42), clasificación binaria:

| Metrica | Valor |
|---|---|
| Exactitud equilibrada | 0,7654 |
| Macro-F1 | 0,7699 |
| ROC-AUC | 0,8942 |
| PR-AUC | 0,8261 |

Media de las cinco semillas (13, 29, 42, 73, 101), reportada en la disertación:

| Tarea | Metricas |
|---|---|
| Clasificación binaria | macro-F1 0,7487 ± 0,0257; PR-AUC 0,8006 ± 0,0313; MCC 0,5261 ± 0,0255 |
| Valores-notícia (macro) | QWK 0,2143; MAE 0,7449 |
| IIP (previsión directa) | MAE 0,1008 ± 0,0061; Spearman 0,3718 ± 0,0620 |

No se han publicado en la información disponible comparaciones de benchmark frente a otros modelos en las mismas métricas, más allá de la comparación cualitativa con líneas base de TF-IDF: en los valores-noticia, regresiones logísticas con TF-IDF obtuvieron mejores resultados que los módulos ordinarles de este modelo, y en el IIP un Ridge con TF-IDF logró menor MAE.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,1 GB en FP32 y 0,55 GB en FP16/BF16, a lo que hay que sumar la memoria de activaciones para entradas de 512 tokens y el lote utilizado.
- Cabe sin dificultad en GPU de consumo: una RTX 3060 (12 GB), RTX 4070 o RTX 4090 pueden ejecutar inferencia en FP16 con margen amplio.
- GPU de datacenter recomendadas para lotes grandes o entrenamiento: la configuración de referencia se entrenó en una NVIDIA A100 de 80 GB, aunque el tamaño del modelo permite GPUs mucho menores.
- Opciones de despliegue: al requerir código propio (`trust_remote_code=True`), la integración con servidores de inferencia estándar (vLLM, TGI) no está garantizada sin portar la arquitectura; el uso directo vía `transformers` con `AutoModel` es el camino soportado por el autor. No se documentan cuantizaciones GGUF ni compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La disertación comparó tres encoders y tres regímenes de ajuste, seleccionando XLM-RoBERTa Base por su macro-F1 binario. La siguiente tabla recoge lo indicado en la información disponible; los datos no disponibles se marcan como tales.

| Modelo | Parametros | Contexto | Rendimiento (macro-F1 binario) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| genlocalnews-newsworthiness-xlmr (este modelo) | 277.459.991 | 512 tokens | 0,7487 ± 0,0257 (5 semillas) | MIT | HuggingFace |
| XLM-RoBERTa Base (modelo base) | aproximadamente 278 M | 512 tokens | no disponible (sin cabezas de la tarea) | MIT | HuggingFace |
| BERTimbau Base | no disponible | no disponible | no disponible (candidato evaluado y descartado) | no disponible | HuggingFace |
| Albertina 100M | no disponible | no disponible | no disponible (candidato evaluado y descartado) | no disponible | HuggingFace |

Además, el autor reporta que líneas base con TF-IDF (regresión logística para valores-noticia y Ridge para el IIP) superaron a este modelo en esas dos tareas concretas, aunque no se publican sus cifras numéricas.

## Limitaciones y advertencias

- Origen de los datos muy restringido: 53 actas de seis municipios, con solo cinco actas en el conjunto de prueba; no se demuestra transferencia a otros municipios, periodos o tipos de documento.
- Las anotaciones son apreciaciones humanas según las directrices de CitiLink-News, no propiedades objetivas del texto; en la muestra con doble anotación binaria el κ de Cohen fue 0,296, lo que indica un acuerdo bajo entre anotadores.
- En los valores-noticia, regresiones logísticas con TF-IDF obtuvieron mejores resultados que los módulos ordinarles del modelo; en el IIP, un Ridge con TF-IDF logró menor MAE. El modelo se seleccionó por su clasificación binaria, no por estas dos salidas.
- Las probabilidades binarias no están calibradas: ECE en prueba de aproximadamente 0,20, por lo que no deben interpretarse como probabilidades fiables sin recalibración.
- Sesgos potenciales derivados del dominio: el modelo refleja las rutinas y criterios editoriales implícitos en las actas de los seis municipios usados, y puede no generalizar a otros contextos geográficos o lingüísticos.
- Riesgo de alucinación limitado por tratarse de una tarea de clasificación y regresión, no de generación, pero persiste el riesgo de clasificaciones erróneas en segmentos atípicos o ambiguos.
- Cobertura idiomática: solo portugués (europeo en los datos); no se ha validado su comportamiento en portugués de Brasil ni en otros idiomas pese a partir de XLM-R multilingüe.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el autor declara explícitamente que el modelo se concibió como apoyo a la triaje editorial y que no debe usarse para decidir automáticamente la publicación.
- Dependencia técnica: requiere `trust_remote_code=True` por el código de arquitectura propio, lo que complica el despliegue en infraestructuras que no permiten ejecutar código remoto.
- Fecha de creación del repositorio poco habitual (2026-10-09) y ausencia de descargas y likes, por lo que aún no cuenta con validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tassiascarvalho/genlocalnews-newsworthiness-xlmr
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Proyecto CitiLink-Minutes: https://projeto.citilink.inesctec.pt/
- Referencia de la disertación (BibTeX proporcionado por el autor): Carvalho, Tassia. *Inteligência Artificial no Jornalismo Local: Das Atas Municipais às Propostas de Notícias*. Universidade da Beira Interior, 2026.
- Lectura de contexto sobre IA y periodismo local (no específica del modelo): https://localmedia.org/2026/10/lma-publishes-new-report-the-ai-roadmap-for-local-broadcasters/
- Lectura de contexto sobre IA y periodismo local (no específica del modelo): https://tomorrowspublisher.today/content-creation/axios-employs-ai-to-revolutionise-local-journalism-economics/
