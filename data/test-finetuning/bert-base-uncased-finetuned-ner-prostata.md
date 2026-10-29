# Test-FineTuning/bert-base-uncased-finetuned-ner-prostata

## Resumen

`bert-base-uncased-finetuned-ner-prostata` es un modelo de reconocimiento de entidades nombradas (NER) para textos clínicos en español centrados en cáncer de próstata. Se trata de un fine-tuning de `google-bert/bert-base-uncased` para clasificación de tokens con esquema BIO, realizado por Carlos Andres Borja y publicado bajo el identificador de organización `Test-FineTuning`. El modelo resuelve un problema muy concreto: convertir informes oncológicos en campos estructurados (diagnóstico, Gleason, TNM, PSA, tratamiento, fármaco, dosis, cirugía, fecha y edad) que puedan alimentar registros de cáncer, cohortes de investigación o sistemas de ayuda a la codificación.

Arquitectónicamente es un transformer encoder denso de tipo BERT-base, con 108.907.797 parámetros y una ventana máxima de 512 tokens, heredada tanto de las posiciones aprendidas del modelo base como de la `max_length` usada en el entrenamiento. No es un modelo generativo: su salida es una etiqueta por token, lo que lo hace muy barato de ejecutar (menos de 0,5 GB en fp32) y adecuado para procesar grandes volúmenes de informes en lotes.

Su relevancia es doble. Por un lado, demuestra que un BERT-base ajustado con un corpus pequeño (3.106 oraciones de entrenamiento, 67.934 tokens) y 13 minutos de GPU T4 alcanza un F1 de 0,9659 a nivel de entidad en su conjunto de test, lo que rebaja el umbral de entrada para crear extractores clínicos especializados. Por otro, conviene leer esas cifras con cautela: el corpus es pequeño, no se publica y el modelo no ha sido validado clínicamente ni cuenta con validación externa (0 descargas, 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), cabeza de clasificación de tokens |
| Parametros totales | 108.907.797 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite posicional de BERT y `max_length` de entrenamiento) |
| Tipos de cuantizacion | No disponible: el autor no publica versiones cuantizadas. Al ser un encoder estándar en safetensors es convertible a INT8 dinámico y a GGUF con herramientas habituales |
| Idiomas soportados | Español (`es`); el modelo base fue preentrenado en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder bidireccional denso, y añade una cabeza lineal de clasificación de tokens sobre la salida del último estado oculto. El etiquetado sigue el esquema BIO con 21 etiquetas contando `O`, que cubren 10 tipos de entidad: `CANCER`, `GLEASON`, `TNM`, `BIOMARCADOR`, `TRATAMIENTO`, `MEDICAMENTO`, `DOSIS`, `CIRUGIA`, `FECHA` y `EDAD`. Solo el primer sub-token de cada palabra recibe etiqueta; el resto de sub-tokens y los tokens especiales se enmascaran con `-100` en la función de pérdida.

El corpus de entrenamiento es un conjunto anotado en formato `.bio` proporcionado por el docente responsable del proyecto y no se publica junto al modelo. Se divide en 3.106 oraciones y 67.934 tokens de entrenamiento, 929 oraciones y 16.803 tokens de validación, y 991 oraciones y 20.862 tokens de test. El autor documenta una limpieza previa: dos etiquetas corruptas corregidas a `O` (una coma en `validation_cleaned.bio` línea 1401 y un cero en lugar de la letra `O` en `testing_cleaned.bio` línea 17566). El ajuste se hizo durante 10 épocas con learning rate 2e-5, batch size 8, weight decay 0,01, precisión mixta fp16, semilla 42 y `load_best_model_at_end` sobre F1 de validación, seleccionando la época 8. El entrenamiento completo consumió aproximadamente 13 minutos en una única NVIDIA T4 de Google Colab. No se documenta uso de RLHF, DPO ni ninguna innovación de decodificación, algo esperable en un modelo de clasificación de tokens.

## Capacidades

- Extracción de entidades clínicas en español sobre cáncer de próstata con 10 tipos de entidad predefinidos y esquema BIO.
- Normalización de expresiones oncológicas: puntuación de Gleason con patrón primario/secundario (por ejemplo, `Gleason 7 (3+4)`), estadificación TNM (`cT2c N0 M0`), valores de PSA con unidades (`PSA 12 ng/ml`).
- Detección de pautas farmacológicas completas: fármaco más dosis y frecuencia (`bicalutamida 50 mg/día`).
- Reconocimiento de procedimientos quirúrgicos (`prostatectomía radical`) y de tratamientos no quirúrgicos (`radioterapia externa`).
- Extracción de datos temporales y demográficos (`FECHA`, `EDAD`), útil para tareas de anonimización y para construir líneas temporales clínicas.
- Salida con posiciones de carácter (`start`, `end`) mediante `pipeline` con `aggregation_strategy="simple"`, lo que permite resaltado y sustitución sobre el texto original.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking": es un clasificador de tokens, no un modelo generativo.
- Multilingüismo limitado al español; el vocabulario del modelo base es inglés, lo que condiciona la tokenización de términos clínicos en castellano.

## Casos de uso

- **Estructuración de informes de anatomía patológica**: procesar el campo de diagnóstico de biopsias prostáticas y devolver un JSON con `CANCER`, `GLEASON` y `TNM` para poblar bases de datos oncológicas sin transcripción manual, aprovechando el F1 de 0,962 en `CANCER` y 0,995 en `TNM`.
- **Registros poblacionales de cáncer**: extracción por lotes de cohortes retrospectivas a partir de miles de informes, con un coste de inferencia muy bajo (modelo de 0,4 GB) que permite ejecutarlo en CPU o en una única GPU consumer.
- **Anonimización y seudonimización previa a investigación**: usar las etiquetas `FECHA` y `EDAD` (F1 de 0,994 y 0,969 respectivamente) para localizar y enmascarar identificadores cuasi-directos antes de compartir textos entre instituciones.
- **Preanotación para anotadores humanos**: generar etiquetas automáticas y pasarlas a una herramienta de anotación para revisión, reduciendo el coste de ampliar el corpus; las entidades con menor F1 (`CIRUGIA` 0,892, `GLEASON` 0,912, `DOSIS` 0,921) son las candidatas naturales a revisión prioritaria.
- **Farmacovigilancia y adherencia terapéutica**: extraer pares `MEDICAMENTO` + `DOSIS` (F1 de 0,994 y 0,921) de notas de evolución para detectar cambios de pauta en terapia de privación androgénica.
- **Selección de candidatos para ensayos clínicos**: indexar entidades y filtrar pacientes por criterios combinados (por ejemplo, `CANCER` = adenocarcinoma, `GLEASON` ≥ 7 y `TRATAMIENTO` = radioterapia) antes de la revisión manual del investigador.
- **Auditoría de codificación clínica**: comparar las entidades extraídas del informe con los códigos registrados para detectar discrepancias en estadificación o tratamiento.
- **Búsqueda semántica sobre historiales**: enriquecer los documentos con metadatos de entidades y habilitar recuperación filtrada por biomarcador, cirugía o fecha.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks de propósito general (MMLU, HumanEval, GSM8K y similares), que además no aplican a un modelo de clasificación de tokens. Los datos disponibles son de evaluación sobre la partición de test del corpus propio, con métricas `seqeval` a nivel de entidad y una única evaluación con el mejor checkpoint:

| Metrica | Precision | Recall | F1 | Accuracy (token) |
|---|---:|---:|---:|---:|
| Test (micro avg) | 0,9628 | 0,9691 | 0,9659 | 0,9935 |

Desglose por tipo de entidad en test:

| Entidad | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| BIOMARCADOR | 0,981 | 0,986 | 0,983 | 208 |
| CANCER | 0,957 | 0,967 | 0,962 | 364 |
| CIRUGIA | 0,892 | 0,892 | 0,892 | 65 |
| DOSIS | 0,912 | 0,931 | 0,921 | 189 |
| EDAD | 0,963 | 0,975 | 0,969 | 80 |
| FECHA | 0,995 | 0,993 | 0,994 | 401 |
| GLEASON | 0,912 | 0,912 | 0,912 | 160 |
| MEDICAMENTO | 0,994 | 0,994 | 0,994 | 164 |
| TNM | 0,989 | 1,000 | 0,995 | 93 |
| TRATAMIENTO | 0,964 | 0,976 | 0,970 | 250 |

Evolución en validación (selección en la época 8):

| Epoca | Train loss | Val loss | Precision | Recall | F1 |
|---:|---:|---:|---:|---:|---:|
| 1 | 0,1638 | 0,0881 | 0,868 | 0,910 | 0,888 |
| 3 | 0,0474 | 0,0311 | 0,963 | 0,966 | 0,965 |
| 5 | 0,0152 | 0,0246 | 0,972 | 0,973 | 0,973 |
| 7 | 0,0190 | 0,0214 | 0,982 | 0,977 | 0,980 |
| 8 | 0,0124 | 0,0225 | 0,981 | 0,981 | 0,981 |
| 10 | 0,0099 | 0,0212 | 0,982 | 0,979 | 0,981 |

## Requisitos de hardware

- **VRAM estimada para inferencia**: unos 436 MB en fp32 (108,9 M de parámetros × 4 bytes), unos 218 MB en fp16 y unos 109 MB en INT8, sin contar activaciones ni el tokenizador. Con batch pequeño y `max_length` 512 el consumo real se mantiene por debajo de 1-1,5 GB.
- **GPU recomendadas**: cualquier GPU con 4 GB o más sirve; el autor entrenó en una NVIDIA T4. Para procesamiento masivo en lotes son adecuadas T4, L4, A10G, RTX 3090/4090, A100 y H100, aunque el modelo está lejos de necesitar ese hardware.
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer moderna (GTX 1650 4 GB en adelante), y también es viable en CPU para volúmenes moderados e incluso en dispositivos de borde.
- **Opciones de despliegue**: `transformers` con `pipeline("token-classification")`, `AutoModelForTokenClassification` para control manual, exportación a ONNX Runtime para inferencia en CPU, serialización con TorchScript, y servicio HTTP propio con FastAPI. El repositorio está marcado como `endpoints_compatible`, por lo que puede desplegarse en Hugging Face Inference Endpoints. vLLM y TGI no son adecuados: están orientados a decodificación autoregresiva y no a token classification.
- **Latencia y throughput**: no disponibles. El autor no publica mediciones de latencia ni de rendimiento en producción.

## Comparativa con modelos similares

Las cifras de los modelos comparados no se han verificado contra sus respectivas model cards para esta ficha y se marcan como no disponibles cuando no hay certeza.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-base-uncased-finetuned-ner-prostata` | 108,9 M | 512 | NER clínico en español (próstata) | Apache 2.0 | Hugging Face |
| `google-bert/bert-base-uncased` | 110 M aprox. | 512 | Modelo base en inglés, sin cabeza NER | Apache 2.0 | Hugging Face |
| `bert-base-multilingual-cased` (mBERT) | 178 M aprox. | 512 | Modelo base multilingüe, requiere fine-tuning | Apache 2.0 | Hugging Face |
| `bsc-bio-ehr-es` (BSC) | No disponible en esta ficha | No disponible en esta ficha | NER biomédico en español, dominio general | No disponible en esta ficha | Hugging Face |

Frente al modelo base, la diferencia práctica es que este fine-tuning aporta las 21 etiquetas del dominio y un F1 de 0,9659 en su test; el modelo base no extrae entidades por sí solo. Frente a alternativas biomédicas en español de propósito general, la ventaja es la granularidad oncológica (Gleason, TNM) y el coste, y la desventaja es el dominio mucho más estrecho y la ausencia de validación externa.

## Limitaciones y advertencias

- **Modelo base en inglés**: `bert-base-uncased` se preentrenó con corpus ingleses, por lo que el vocabulario no está adaptado al español ni a la terminología biomédica en castellano. La model card original recoge este punto como limitación, aunque el texto disponible está truncado.
- **No validado clínicamente**: el autor indica explícitamente que el modelo tiene uso educativo y de investigación y que no está validado para uso clínico ni para tomar decisiones sobre pacientes.
- **Corpus pequeño y no publicado**: 3.106 oraciones de entrenamiento y un único conjunto de test de 991 oraciones. No hay validación cruzada ni evaluación en corpus externos, de modo que el F1 de 0,9659 puede no generalizar a otros estilos de redacción, servicios hospitalarios o variantes dialectales.
- **Riesgo de alucinación estructural**: al ser un clasificador, no inventa texto, pero puede asignar entidades a tokens que no lo son (falsos positivos) o fragmentar entidades compuestas, especialmente en `CIRUGIA`, `GLEASON` y `DOSIS`, las tres clases con menor F1.
- **Dominio estrecho**: solo cáncer de próstata. Otros tumores, patologías no oncológicas o informes con abreviaturas locales quedan fuera del alcance previsto.
- **Truncamiento a 512 tokens**: los informes largos se cortan; es necesario dividir por secciones y gestionar las entidades que cruzan el límite.
- **Entidades no reconocidas**: el conjunto de 10 tipos es cerrado. No cubre, por ejemplo, `MEDICO`, `CENTRO`, `ANATOMIA` o `RESULTADO_IMAGEN`.
- **Licencia Apache 2.0**: permite uso comercial y modificaciones con atribución y aviso de cambios, pero no exime del cumplimiento de la normativa de protección de datos (RGPD) al procesar textos clínicos, ni sustituye la validación regulatoria si el modelo se integra en un producto sanitario.
- **Ausencia de tracción externa**: 0 descargas y 0 likes en el momento de la ficha, sin issues ni evaluaciones independientes conocidas.
- **Sesgos**: no se publica ningún análisis de sesgo por sexo, edad, origen o tipo de centro. El modelo se ha entrenado con textos de pacientes varones, dado el dominio, lo que condiciona su comportamiento ante menciones a otros colectivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Test-FineTuning/bert-base-uncased-finetuned-ner-prostata
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada. El notebook de inferencia mencionado en la model card (`NER_inferencia_mama_prostata_Colab.ipynb`) forma parte del material de un curso y no se distribuye con el repositorio.
