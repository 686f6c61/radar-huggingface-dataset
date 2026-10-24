# yobanyr/actividad10-desde-cero-20261024-ner-beto

## Resumen

`yobanyr/actividad10-desde-cero-20261024-ner-beto` es un modelo de clasificación de tokens (NER, reconocimiento de entidades nombradas) en español, obtenido por ajuste fino del checkpoint `dccuchile/bert-base-spanish-wwm-cased`. Lo publica el usuario `yobanyr` como trabajo de un taller académico de "clasificación y NER", según indica la propia model card. El dominio declarado del ajuste es "próstata", es decir, extracción de menciones en textos de ese ámbito; la model card no detalla el conjunto de etiquetas BIO empleado.

Arquitectura y tamaño: es un BERT base (encoder transformer) con 109.276.437 parámetros reales en safetensors, heredado del modelo base en español con whole word masking y casing. El repositorio ocupa 0,4 GB y solo distribuye pesos en safetensors.

Relevancia: el interés no está en la innovación arquitectónica —no la hay, es un fine-tuning estándar— sino en la trazabilidad de su protocolo experimental: la model card documenta hiperparámetros (batch 32, 8 épocas, LR 2e-05, warmup 58 pasos, bf16, semilla 42), volúmenes de datos (2.307 ejemplos de entrenamiento, 117 de validación) y métricas desglosadas en validación y dos particiones de prueba, con un F1 de validación de 0,9615 y F1 de prueba entre 0,9449 y 0,9538. El autor advierte explícitamente de que no puede demostrar independencia por paciente y de que el modelo extrae menciones, no emite diagnósticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (heredada de `dccuchile/bert-base-spanish-wwm-cased`); tarea de cabecera: token classification (NER con etiquetas BIO) |
| Parametros totales | 109.276.437 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de la arquitectura BERT base del modelo de partida; no se especifica otro valor en la model card) |
| Tipos de cuantizacion | no se han publicado artefactos cuantizados (sin GGUF, GPTQ ni AWQ en el repo); al ser un modelo de 109 M de parámetros es viable cuantización dinámica int8 en PyTorch o exportación a ONNX/ONNX Runtime |
| Idiomas soportados | es (español) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (tamaño del repo: 0,4 GB, coherente con pesos en FP32) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer BERT base con tokenización WordPiece y vocabulario del español, sobre el checkpoint `dccuchile/bert-base-spanish-wwm-cased`, que aporta el preentrenamiento con whole word masking y distinción de mayúsculas/minúsculas. Sobre ese backbone se añade una cabeza de clasificación de tokens y se ajusta de extremo a extremo para etiquetado de entidades en textos del dominio "próstata". La model card no especifica el número de capas, dimensión oculta ni el inventario de etiquetas; ambos son los estándar heredados del modelo base.

El ajuste se realizó con 2.307 ejemplos de entrenamiento y 117 de validación, batch 32, 8,0 épocas, tasa de aprendizaje inicial 2e-05, 58 pasos de warmup, precisión bf16 y semilla 42. La selección de batch y checkpoint se hizo por F1 de validación. La evaluación usa F1 macro para la parte de clasificación y F1 micro de entidades con criterio BIO estricto para NER. En la partición de próstata se excluyeron de validación y prueba las oraciones presentes en entrenamiento (`test_sin_repetidos`, n=281), y además se reporta la prueba original sin ese filtrado (`test_original`, n=991). No se documenta uso de RLHF/DPO ni ninguna innovación técnica adicional (sin decodificación especulativa, atención lineal ni componentes híbridos): es un fine-tuning supervisado convencional.

## Capacidades

- Reconocimiento de entidades nombradas en español: extracción de menciones con etiquetado BIO estricto sobre texto plano.
- Clasificación a nivel de secuencia/token con F1 macro reportado por el autor (tarea del taller).
- Dominio específico: textos del ámbito de próstata (previsiblemente informes o corpus clínico, aunque la model card no describe el corpus).
- Manejo de texto con casing y palabras completas gracias al preentrenamiento WWM del modelo base.
- Inferencia rápida en CPU o GPU modesta: 828,151 muestras/s y 28,313 pasos/s en la ejecución de validación reportada (0,1413 s para 117 ejemplos), sin especificar hardware.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking": es un encoder discriminativo, no un modelo generativo.
- No se documentan capacidades multilingües más allá del español.

## Casos de uso

- Extracción de menciones en informes clínicos de urología: el modelo etiqueta entidades (localizaciones anatómicas, hallazgos, tratamientos, según el esquema del taller) en texto de próstata para alimentar un índice de búsqueda o un sistema de codificación. Adecuado por el ajuste de dominio y por su F1 de prueba de 0,9449–0,9538.
- Preanotación asistida para revisión humana: se ejecuta el modelo sobre lotes de documentos y se presenta la salida BIO a un anotador que corrige; con precisión ~0,95 el coste de revisión baja de forma sustancial frente a anotación desde cero.
- Enriquecimiento de historiales para investigación: detección de menciones para construir cohortes o variables estructuradas a partir de texto libre, siempre con validación posterior y sin uso diagnóstico directo.
- Pipeline de extracción por lotes en servidor: al ocupar 0,4 GB en FP32 y ~110 MB en int8, se puede desplegar en contenedores pequeños con ONNX Runtime y procesar grandes volúmenes en CPU sin GPU.
- Filtro de relevancia previo a un LLM: usar el NER como paso barato que marca documentos con menciones de interés antes de enviarlos a un modelo generativo, reduciendo coste de tokens.
- Evaluación comparativa de arquitecturas para NER en español: sirve como línea base reproducible (semilla 42, hiperparámetros documentados) frente a RoBERTa-BNE o modelos multilingües en experimentos académicos.
- Docencia y reproducibilidad: ejemplo completo de flujo de fine-tuning con selección por F1 de validación y doble partición de prueba, reutilizable en talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es generativo y esas métricas no aplican. Los únicos datos son las métricas de la propia tarea:

| Particion | n | Precision | Recall | F1 |
|---|---|---|---|---|
| Validacion (NER, BIO estricto, F1 micro) | 117 | 0,9717 | 0,9515 | 0,9615 |
| Test sin repetidos (`test_sin_repetidos`) | 281 | 0,9435 | 0,9463 | 0,9449 |
| Test original (`test_original`) | 991 | 0,9507 | 0,9569 | 0,9538 |

Datos adicionales de la ejecución de validación: `eval_loss` = 0,06108, `eval_runtime` = 0,1413 s, `eval_samples_per_second` = 828,151, `eval_steps_per_second` = 28,313, época 8,0. El hardware empleado no se especifica. El autor advierte de que el resultado corresponde a una sola semilla y no demuestra un orden universal entre arquitecturas.

## Requisitos de hardware

- VRAM estimada: ~0,45 GB en FP32 (109 M parámetros), ~0,22 GB en FP16/BF16, ~0,11 GB en int8. El repositorio completo pesa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en GTX 1650, RTX 3060, RTX 4090, T4, L4, A100 y H100 (en estas últimas el cuello de botella será el pipeline de datos, no el modelo).
- Cabe en cualquier GPU de consumo, incluida una iGPU con memoria compartida; la inferencia en CPU es totalmente viable.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportación a ONNX Runtime para producción en CPU, TorchScript, o servicio FastAPI con batching. vLLM, TGI y llama.cpp no son adecuados: vLLM y TGI están orientados a decodificación generativa y no hay artefacto GGUF para llama.cpp.
- Latencia y throughput: los únicos datos publicados son 828,151 muestras/s y 28,313 pasos/s en la evaluación de validación (117 ejemplos en 0,1413 s), sin especificar hardware ni tamaño de batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yobanyr/actividad10-desde-cero-20261024-ner-beto` (este) | 109.276.437 | 512 tokens | NER en español, dominio próstata | no disponible | HuggingFace, 0 descargas, 0 likes |
| `dccuchile/bert-base-spanish-wwm-cased` (modelo base) | ~110 M (arquitectura idéntica) | 512 tokens | Modelo base preentrenado, sin cabeza de NER | no disponible en esta información | HuggingFace |
| Otros fine-tunings NER en español sobre BERT/RoBERTa | no disponible | 512 tokens (BERT/RoBERTa base) | NER general en español | no disponible | HuggingFace |

No se dispone de resultados de benchmarks comparables entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Contexto limitado a 512 tokens: documentos largos deben trocearse, con riesgo de entidades partidas en los límites de fragmento y pérdida de contexto entre segmentos.
- Modelo de una sola semilla (42) y un único ajuste: la model card advierte de que no demuestra un orden universal entre arquitecturas; la varianza entre ejecuciones no está cuantificada.
- Corpus de entrenamiento pequeño (2.307 ejemplos) y de un dominio muy concreto (próstata): la generalización fuera de ese registro es dudosa y las etiquetas no están documentadas en la model card.
- El autor no puede demostrar independencia por paciente con los identificadores disponibles; existe riesgo de fuga de información entre particiones pese al filtrado de oraciones repetidas.
- El modelo extrae menciones y no establece diagnósticos clínicos: no debe usarse como dispositivo médico ni para decisiones clínicas sin validación y supervisión humana.
- Riesgo de alucinación de límites de entidad (falsos positivos en BIO) y sensibilidad al casing por el tokenizador cased; texto en mayúsculas o con errores ortográficos puede degradar el rendimiento.
- Solo español: no hay evidencia de comportamiento en otros idiomas ni en variantes distintas del español clínico.
- Sin datos publicados sobre sesgos demográficos, étnicos o de género; no hay auditoría de equidad.
- Los resultados de búsqueda web asociados a esta ficha no contienen enlaces relevantes al modelo (devuelven foros y páginas sin relación), por lo que no hay documentación externa independiente que verifique las métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yobanyr/actividad10-desde-cero-20261024-ner-beto
- Modelo base: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; las entradas devueltas por el buscador no guardan relación con el modelo. No hay paper, blog, repositorio ni demo adicionales disponibles.
