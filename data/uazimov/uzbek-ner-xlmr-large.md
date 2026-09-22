# UAzimov/uzbek-ner-xlmr-large

## Resumen

`UAzimov/uzbek-ner-xlmr-large` es un modelo de reconocimiento de entidades nombradas (NER) para uzbeko, obtenido por ajuste fino (*fine-tuning*) de `FacebookAI/xlm-roberta-large` sobre el corpus Uzbek-NER-Gold (`uznlp-uz/uzbek_NER`). Lo publica Utkirbek Azimov bajo licencia MIT y su única tarea es la clasificación de tokens (`token-classification`) con un conjunto de 17 etiquetas en formato BIO que cubre PER, ORG, LOC, MISC, TEMPORAL, NUMERIC, WORK y MONEY.

El checkpoint tiene 558.858.257 parámetros (unos 559 M) en formato denso, sin arquitectura MoE, y reutiliza el encoder XLM-RoBERTa-large con una cabeza de clasificación nueva de 17 clases. Se entrenó durante 4 épocas sobre 3.776 frases de entrenamiento del split seed-7, con longitud máxima de 256 tokens, fp16 y una única GPU T4 de 14,6 GB en unos 14 minutos. El checkpoint publicado corresponde al seed 10 de una ejecución de 5 seeds, elegido por ser la configuración más cercana a la media.

Su relevancia práctica es doble. Por un lado, sitúa el estado del arte en NER de uzbeko dentro de un recurso abierto y con licencia permisiva, con un micro-F1 estricto de 0,793 en el conjunto Gold-400 y 0,809 en el subconjunto LLM-200, por delante de alternativas como el CRF in-domain (0,771/0,727), GPT-5.6-Luna en few-shot (0,621), GLiNER (0,495) o BERTbek-transfer (0,482) sobre los mismos splits. Por otro, su tamaño moderado permite ejecutarlo en hardware de consumo y en CPU, lo que facilita integrarlo en *pipelines* de extracción de información sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificacion de tokens de 17 etiquetas |
| Parametros totales | 558.858.257 (~559 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (limite de XLM-R-large); el entrenamiento uso max_len 256 |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones oficiales; el repo solo contiene pesos safetensors) |
| Idiomas soportados | uzbeko (uz); el modelo base XLM-R-large es multilingue, pero el ajuste fino es monoidioma |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,3 GB |
| Tarea / pipeline | token-classification (NER) |
| Etiquetas | 17 (formato BIO): O, B/I-PER, B/I-ORG, B/I-LOC, B/I-MISC, B/I-TEMPORAL, B/I-NUMERIC, B/I-WORK, B/I-MONEY |
| Modelo base | FacebookAI/xlm-roberta-large |
| Dataset de ajuste | uznlp-uz/uzbek_NER (Uzbek NER Gold, CC-BY-4.0, DOI 10.57967/hf/9399) |
| Fecha de publicacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer XLM-RoBERTa-large al que se le sustituye la cabeza original por una nueva de clasificación de tokens con 17 salidas. Sobre ella se aplica decodificación BIO. El autor emplea una convención «suffix-inclusive»: los *spans* de entidad incluyen los sufijos de caso, posesivo y plural del uzbeko tal y como están anotados en Gold, de modo que `Zarafshonga` se etiqueta íntegramente como `B-LOC`. Además, la alineación de etiquetas se hace sobre el primer subtoken de cada palabra, ignorando los subtokens de continuación en el decodificado.

El entrenamiento parte de 3.776 frases del split seed-7 de Uzbek-NER-Gold y se ejecuta durante 4 épocas con learning rate 2e-5, batch por dispositivo de 8 con acumulación de gradiente 2 (batch efectivo 16), max_len 256, precisión fp16 y seed 10. Se usaron épocas fijas, sin conjunto de desarrollo ni *early stopping*, y se evaluó una única vez sobre el test-400 congelado. El coste computacional es muy reducido: aproximadamente 14 minutos en una Kaggle T4 de 14,6 GB. No se aplicaron fases de RLHF, DPO ni instrucciones; es un modelo puramente discriminativo de etiquetado de secuencias. La liberación incluye únicamente pesos y predicciones de evaluación, sin anotación humana nueva.

## Capacidades

- Reconocimiento de entidades nombradas en uzbeko sobre nueve categorías (persona, organización, lugar, miscelánea, temporal, numérico, obra, dinero) en formato BIO.
- Procesamiento a nivel de palabra mediante `is_split_into_words=True`, con alineación por primer subtoken.
- Manejo de morfología aglutinante uzbeka: los sufijos de caso, posesivo y plural quedan dentro del *span* de entidad.
- Ejecución en CPU y en GPU de gama baja-media, al tratarse de un modelo de 559 M de parámetros.
- Integración directa con el ecosistema `transformers` (`AutoTokenizer`, `AutoModelForTokenClassification`) y con el pipeline `token-classification`.
- Extracción de entidades temporales y numéricas, útil para normalización de fechas y cantidades en textos periodísticos y administrativos.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*: es un clasificador de tokens, no un modelo generativo.
- Capacidad multilingüe residual derivada de XLM-R-large, pero sin garantías de rendimiento fuera del uzbeko, ya que el ajuste fino se hizo solo con datos en `uz`.

## Casos de uso

- **Extracción de entidades en prensa uzbeka**: ingesta de artículos de medios nacionales para poblar bases de datos de personas, organizaciones y localizaciones mencionadas, con un micro-F1 estricto de 0,793 sobre Gold-400.
- **Construcción de grafos de conocimiento**: uso de las etiquetas PER, ORG y LOC como nodos y de la co-ocurrencia en la misma frase como aristas, para alimentar un grafo consultable sobre política, economía o sociedad de Uzbekistán.
- **Anonimización y cumplimiento de protección de datos**: detección de `B-PER`/`I-PER` en textos antes de publicarlos o compartirlos, sustituyendo los nombres por marcadores.
- **Geocodificación y análisis territorial**: extracción de `LOC` con sufijos de caso incluidos (`Samarqandga`) para normalizar topónimos y enlazarlos con un gazetteer o un servicio de geocodificación.
- **Monitorización financiera y de precios**: uso de las etiquetas MONEY y NUMERIC para localizar importes en informes y noticias económicas, teniendo en cuenta que MONEY solo cuenta con 5 ejemplos en test y su estimación es ruidosa.
- **Detección de eventos y cronologías**: aprovechamiento de la etiqueta TEMPORAL para extraer referencias de fecha y ordenar automáticamente hechos en un flujo de noticias.
- **Preanotación asistida para anotadores humanos**: el modelo genera etiquetas preliminares que un revisor corrige, reduciendo el coste de ampliar el corpus Uzbek-NER-Gold u otros corpus en uzbeko.
- **Enriquecimiento de motores de búsqueda y recomendación**: indexación de entidades extraídas para mejorar la recuperación de documentos por nombre de persona, organización o lugar.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` y en la model card. Métrica: micro-F1 estricto de entidad sobre splits de test congelados.

| Sistema | Gold-400 (F1) | LLM-200 subset (F1) |
|---|---|---|
| uzbek-ner-xlmr-large (este checkpoint, seed 10) | 0,793 | 0,809 |
| uzbek-ner-xlmr-large (media de 5 seeds) | 0,792 (rango 0,777-0,802) | 0,809 (rango 0,785-0,823) |
| CRF in-domain | 0,771 | 0,727 |
| GPT-5.6-Luna few-shot | 0,621 | no disponible |
| Memorization (baseline) | 0,522 | no disponible |
| GLiNER | 0,495 | no disponible |
| BERTbek-transfer | 0,482 | no disponible |

Desglose de precision y recall del checkpoint publicado:

| Split | Precision | Recall | F1 | IC bootstrap 95 % |
|---|---|---|---|---|
| Gold-400 | 0,790 | 0,795 | 0,793 | [0,762, 0,824] |
| LLM-200 subset | 0,808 | 0,810 | 0,809 | [0,767, 0,850] |

Los valores del `model-index` (0,7927 en Gold-400 y 0,8094 en LLM-200) coinciden con los de la model card redondeados a tres decimales. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y carecen de sentido para un modelo discriminativo de NER. Los intervalos de confianza cuantifican ruido de remuestreo, no variabilidad entre splits.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 1,1 GB solo para pesos, más activaciones; en la práctica, menos de 2 GB para secuencias de 256-512 tokens.
- VRAM en fp32: aproximadamente 2,2 GB para pesos, más activaciones.
- VRAM en int8: en torno a 0,6 GB para pesos, si se cuantiza externamente.
- GPU recomendadas: cualquier GPU con 4 GB o más. El autor entrenó en una Kaggle T4 de 14,6 GB (unos 14 minutos), y la inferencia cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB de VRAM o más; también es viable en CPU, dado que el autor verificó los resultados localmente en CPU tras la descarga.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, pipeline `token-classification`, exportación a ONNX Runtime y despliegue en CPU para servicios de baja latencia moderada.
- Latencia y throughput: no disponible. La model card no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 Gold-400 | F1 LLM-200 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| uzbek-ner-xlmr-large | 559 M | 512 tokens (entrenado a 256) | 0,793 | 0,809 | MIT | HuggingFace, safetensors |
| CRF in-domain | no disponible | no aplica | 0,771 | 0,727 | no disponible | baseline del paper |
| GLiNER | no disponible | no disponible | 0,495 | no disponible | no disponible | referencia del paper |
| BERTbek-transfer | no disponible | no disponible | 0,482 | no disponible | no disponible | referencia del paper |
| GPT-5.6-Luna (few-shot) | no disponible | no disponible | 0,621 | no disponible | propietaria | API comercial |

La comparativa se limita a los sistemas evaluados en el mismo paper y sobre los mismos splits. Los detalles de parametros, contexto y licencia de los baselines no se recogen en la informacion disponible.

## Limitaciones y advertencias

- Evaluación sobre un único split congelado (seed 7); los intervalos de confianza reflejan ruido de remuestreo, no variabilidad entre particiones.
- Una de cada 400 frases de test es una copia exacta de una frase de entrenamiento, propiedad del propio dataset.
- La contaminación del preentrenamiento es imposible de descartar: XLM-R pudo haber visto noticias en uzbeko similares a las de Gold.
- Las estimaciones por tipo raro son ruidosas por construcción; MONEY cuenta con solo 5 ejemplos en test.
- Entrenamiento sin conjunto de desarrollo ni *early stopping*: no hubo selección de hiperparámetros basada en validación, y la evaluación sobre test se hizo una sola vez.
- El modelo se entrenó con max_len 256 aunque el encoder soporta 512 tokens; el comportamiento en secuencias más largas de las vistas en entrenamiento no está documentado.
- La convención «suffix-inclusive» puede no coincidir con la de otros corpus o anotadores, lo que complica la comparación directa con anotaciones que separan el sufijo de la entidad.
- Es un modelo discriminativo: no genera texto, no sigue instrucciones y no admite *tool calling* ni razonamiento multi-paso.
- Sesgos conocidos: no se documentan análisis de sesgo. Al derivar de XLM-R-large, puede heredar sesgos de género, nacionalidad o representación geográfica presentes en los datos de preentrenamiento y en la composición de Gold.
- Riesgo de alucinación en sentido estricto: no aplica, pero sí existe riesgo de falsos positivos y de etiquetado erróneo, especialmente en tipos con pocos ejemplos.
- Licencia: los pesos son MIT. Los datos de entrenamiento (Uzbek NER Gold) son CC-BY-4.0, por lo que su reutilización exige atribución a Elov, B. B. y Alaev, R. H. (2026).
- El repositorio no publica cuantizaciones oficiales; cualquier conversión a int8, int4 o GGUF es responsabilidad de quien la realice y puede degradar el F1.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UAzimov/uzbek-ner-xlmr-large
- Dataset Uzbek NER Gold: https://huggingface.co/datasets/uznlp-uz/uzbek_NER
- DOI del dataset: `10.57967/hf/9399`
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper completo con los 15 sistemas evaluados: referenciado como `paper.md` en el repositorio del modelo
- Los resultados de la busqueda web no contienen enlaces relevantes para este modelo.
