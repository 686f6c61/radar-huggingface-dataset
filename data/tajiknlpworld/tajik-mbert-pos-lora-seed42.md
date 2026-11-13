# TajikNLPWorld/tajik-mbert-pos-lora-seed42

## Resumen

tajik-mbert-pos-lora-seed42 es un adaptador LoRA (PEFT) sobre `google-bert/bert-base-multilingual-cased` para clasificación de categoría gramatical (POS) de palabras aisladas en tayiko (cirílico). Lo publica el proyecto TajikNLPWorld como uno de los seis checkpoints de un estudio controlado de tres semillas que compara fine-tuning completo frente a LoRA. El modelo asigna una de 28 categorías POS a una forma léxica, sin contexto oracional: no es un etiquetador de secuencias.

La relevancia es metodológica y de recursos lingüísticos: el tayiko es una lengua de bajos recursos y este trabajo publica corpus, particiones disjuntas por forma léxica, evaluación cruzada de corpus y huellas de reproducibilidad (revisiones fijadas, SHA-256 del estado completo). El adaptador entrena 906.268 de 178.781.240 parámetros (0,507 %) sobre un corpus principal de 52.508 registros, con partición fija de 42.017/5.232/5.259 (entrenamiento/validación/test) y una longitud máxima de 64 tokens.

Los resultados in-domain son moderados (accuracy 0,7557 y macro-F1 0,3696 en test de 28 clases) y el rendimiento externo cae de forma severa (accuracy 0,3056 en TajikMorphCorpus con 9 etiquetas mapeadas). Es una pieza útil para investigación en POS de bajos recursos y para comparaciones LoRA vs. fine-tuning completo, no un componente listo para producción de etiquetado gramatical general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT multilingüe, `bert-base-multilingual-cased`) con adaptador LoRA y cabeza de clasificación de 28 clases |
| Parámetros totales | 178.781.240 (base); 906.268 entrenables en el adaptador (0,507 %) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de secuencia en entrenamiento/inferencia) |
| Tipos de cuantización | no disponible (el repo contiene adaptador y cabeza; no se documentan cuantizaciones) |
| Idiomas soportados | tayiko (`tg`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); requiere cargar el backbone base por separado |

## Arquitectura y entrenamiento

El modelo es un `bert-base-multilingual-cased` con un adaptador LoRA de bajo rango y una cabeza de clasificación de 28 clases entrenada sobre el token `[CLS]` (clasificación a nivel de palabra, no de token). La entrada es una forma léxica aislada, truncada a 64 tokens. No hay atención sobre contexto oracional: la ambigüedad gramatical dependiente de contexto no es resoluble por diseño.

El entrenamiento usa 5 épocas, learning rate 3e-4, batch por dispositivo 8 con acumulación de gradiente 4 (batch efectivo 32), entropía cruzada ponderada con pesos de frecuencia inversa en raíz cuadrada calculados solo sobre el split de entrenamiento, y selección del mejor checkpoint por macro-F1 de validación. Se ejecutó en una NVIDIA L4 con BF16, Transformers 5.22.2, PEFT 0.21.2 y Datasets 5.2.0. La partición es disjunta por forma léxica normalizada (sin solapamiento entre splits) con semilla de split 42; las comparaciones entre métodos usan los mismos ficheros de split. Se registran revisiones fijas del modelo base (`3f076fdb…`), del corpus principal (`797ea46f…`) y del corpus externo (`b29f8230…`), y se verificó la serialización/recarga con huella SHA-256 del estado completo y concordancia en predicciones de prueba.

## Capacidades

- Clasificación de categoría gramatical (POS) de formas léxicas aisladas en tayiko, entre 28 categorías del ontología original del corpus.
- Clasificación a nivel de palabra (word-level classification), no etiquetado de secuencias ni dependency parsing.
- Salida de etiqueta en tayiko, siguiendo el vocabulario ordenado de 28 etiquetas (`labels.json`).
- Evaluación con subconjunto restringido a 9 etiquetas compartidas mediante enmascarado de logits de las clases fuera de alcance.
- Reproducibilidad multi-semilla: forma parte de un estudio de tres semillas emparejadas (42, 123, 2024) para comparar LoRA y fine-tuning completo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: el backbone es multilingüe, pero el adaptador y la cabeza están entrenados y evaluados únicamente para tayiko.

## Casos de uso

- Anotación asistida de corpus tayiko: preetiquetar formas léxicas en un pipeline de anotación humana, revisando después las categorías de baja frecuencia donde el macro-F1 es más débil; adecuado por su coste computacional bajo (adaptador de ~0,9 M de parámetros sobre un backbone BERT-base).
- Estudio de eficiencia PEFT en lenguas de bajos recursos: usar el checkpoint como baseline LoRA reproducible (semilla 42, splits fijos, revisiones fijadas) frente a fine-tuning completo en la misma partición.
- Lexicografía y diccionarios: clasificación preliminar de entradas léxicas por categoría gramatical para generar borradores de lemas etiquetados, con validación lingüística posterior.
- Normalización y enriquecimiento de vocabularios: asignar POS a listas de formas léxicas extraídas de corpus para construir índices morfológicos o recursos derivados.
- Evaluación de transferencia entre corpus: emplear el modelo como sonda para medir el desfase de dominio entre el corpus principal y TajikMorphCorpus, dado que se documentan resultados cruzados con mapeo de 9 etiquetas.
- Investigación en morfología computacional del tayiko: analizar los errores por clase (`reports/perclass_*.csv`) para estudiar qué categorías son ambiguas sin contexto y guiar el diseño de un futuro etiquetador contextual.
- Docencia y prototipado: ejemplo mínimo de carga de un adaptador PEFT con `PeftModel.from_pretrained` y cabeza de clasificación para demostrar flujos de clasificación de texto con Hugging Face.

## Benchmarks y rendimiento

Resultados de test publicados para este checkpoint (no son métricas de entrenamiento):

| Evaluación | Ejemplos | Accuracy | Macro-F1 | Weighted-F1 |
|:--|--:|--:|--:|--:|
| Test in-domain (28 etiquetas POS) | 5.259 | 0,7557 | 0,3696 | 0,7516 |
| Test in-domain (9 etiquetas compartidas, logits enmascarados) | 4.235 | 0,7202 | 0,3530 | 0,7169 |
| TajikMorphCorpus externo (9 etiquetas mapeadas) | 2.592 | 0,3056 | 0,1398 | 0,3434 |
| Subconjunto externo de palabras no vistas (9 etiquetas mapeadas) | 2.289 | 0,3032 | 0,1320 | 0,3465 |

Agregado de las tres semillas emparejadas (42, 123, 2024) para LoRA en la tarea in-domain de 28 clases: macro-F1 medio 0,3835 ± 0,0252 (desviación estándar muestral). El autor advierte que las puntuaciones macro-F1 de 9 y 28 etiquetas no son directamente intercambiables.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,7 GB en FP32 para el backbone BERT-base (178,8 M de parámetros) más el adaptador (~0,9 M de parámetros entrenables); en BF16/FP16, aproximadamente 0,35–0,4 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos ~1–2 GB de VRAM libre; el entrenamiento documentado se realizó en NVIDIA L4 con BF16.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1650 4 GB, RTX 3060, RTX 4090, etc.), dado el tamaño del backbone.
- Opciones de despliegue: Transformers + PEFT (flujo documentado); el backbone BERT-base es compatible con ONNX Runtime y con exportaciones estándar de Hugging Face, aunque el adaptador requiere cargarse con PEFT. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un encoder BERT-base con entradas de hasta 64 tokens, la inferencia por palabra es de milisegundos en GPU moderna, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro-F1 (in-domain 28) | Licencia | Disponibilidad |
|:--|--:|--:|:--|--:|:--|:--|
| tajik-mbert-pos-lora-seed42 | 178,8 M (0,9 M entrenables) | 64 tokens | POS de palabra aislada (tayiko) | 0,3696 | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Fine-tuning completo de mBERT (mismo estudio, semilla 42) | 178,8 M (todos entrenables) | 64 tokens | POS de palabra aislada (tayiko) | no disponible en esta ficha (el estudio lo compara; el autor publica la media de tres semillas para LoRA, no el valor por semilla del fine-tuning completo) | Apache 2.0 (base) | Hugging Face (checkpoint del mismo proyecto) |
| bert-base-multilingual-cased sin adaptar | 178,8 M | 512 tokens | Masked LM / encoder genérico | no aplica (no entrenado para POS tayiko) | Apache 2.0 | Hugging Face |

No se dispone de datos publicados en la información proporcionada para comparar con etiquetadores POS contextuales del tayiko ni con modelos específicos de la lengua.

## Limitaciones y advertencias

- El modelo es libre de contexto: clasifica formas léxicas aisladas; aplicarlo palabra a palabra sobre una oración no lo convierte en un etiquetador POS contextual y no resuelve ambigüedades gramaticales dependientes del contexto.
- El macro-F1 in-domain es bajo (0,3696), lo que indica rendimiento desigual entre las 28 clases; las categorías raras o ambiguas concentran los errores.
- El rendimiento externo cae drásticamente (accuracy 0,3056; macro-F1 0,1398) por desfase de dominio y categorías raras; el autor no reclama que el checkpoint resuelva el POS general del tayiko.
- El mapeo automático de 9 categorías entre corpus requiere validación lingüística independiente; los resultados cruzados deben interpretarse con cautela.
- La definición de "no vista" se refiere a formas léxicas ausentes de todo el corpus principal, no solo del split de entrenamiento.
- Las puntuaciones macro-F1 de 9 y 28 etiquetas no son directamente comparables.
- El repositorio contiene un adaptador LoRA y una cabeza de 28 clases, no una copia autónoma del backbone; hay que cargar `bert-base-multilingual-cased` en la revisión indicada y adjuntar el adaptador con PEFT.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de asignaciones erróneas confiadas en formas léxicas ambiguas u OOV.
- Sesgos: no se documentan análisis de sesgo; el corpus y la ontología de 28 etiquetas condicionan las predicciones y pueden no cubrir variantes dialectales o registros ausentes del corpus.
- Licencia Apache 2.0 permite uso comercial, pero la calidad medida en dominio externo desaconseja su uso en producción sin validación adicional y sin un etiquetador contextual complementario.
- El tamaño del repo se registra como 0.0 GB, lo que sugiere que la información de tamaño puede estar incompleta; conviene verificar los ficheros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TajikNLPWorld/tajik-mbert-pos-lora-seed42
- Modelo base: https://huggingface.co/bert-base-multilingual-cased
- Dataset principal: https://huggingface.co/datasets/TajikNLPWorld/tajik-pos-corpus
- Dataset de evaluación externa: https://huggingface.co/datasets/TajikNLPWorld/TajikMorphCorpus
- Paper referenciado en los tags: arXiv:2605.04576 (no verificable en la información proporcionada)
- Repositorio del proyecto: no disponible en la información proporcionada
