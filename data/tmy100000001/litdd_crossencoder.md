# tmy100000001/LitDD_crossencoder

## Resumen

LitDD_crossencoder es un modelo cross-encoder biomédico desarrollado por Michael Yates (usuario tmy100000001) como etapa de ranking de candidatos dentro del pipeline LitDD, un sistema de minería de literatura para asociaciones gen-enfermedad. Se basa en el modelo `ncbi/MedCPT-Cross-Encoder` y está fine-tuneado para puntuar pares formados por el título más el resumen de un artículo de PubMed y un thread de Gene2Phenotype (G2P), devolviendo una puntuación de relevancia sigmoidea en [0, 1]. El modelo tiene 109,5 millones de parámetros y una longitud máxima de secuencia de 512 tokens, y está disponible bajo licencia MIT.

Su relevancia radica en que mejora sustancialmente la precisión del filtrado previo a la adjudicación final mediante LLM, reduciendo la tasa de falsos positivos sobre abstracts aleatorios de PubMed del 2,8 % de la versión anterior al 0,22 % con el umbral de despliegue de 0,9. Esto lo convierte en un componente clave para la curación automática de literatura genética, un campo donde la precisión es crítica para evitar anotaciones erróneas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT cross-encoder (basado en ncbi/MedCPT-Cross-Encoder) |
| Parametros totales | 109.483.009 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (se menciona fp16/bf16 para inferencia, pero no como cuantizaciones publicadas) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en arquitectura BERT, que procesa conjuntamente el par (abstract, thread G2P) y produce una puntuación de relevancia. El fine-tuning se realizó sobre `ncbi/MedCPT-Cross-Encoder` con datos de entrenamiento compuestos por 17.058 pares anotados por clínicos (positivos y negativos con compartición de genes), 4.137 pares negativos de corpus (abstracts aleatorios de PubMed que pasan el gene gate, emparejados con entradas G2P de los genes mencionados, etiquetados como 0) y 5 hard negatives por positivo extraídos con `abhinand/MedEmbed-large-v0.1`. El conjunto final de pares etiquetados fue de 62.223 filas, de las cuales 8.712 son positivas.

El protocolo de entrenamiento incluyó control de fugas mediante división train/test agrupada por abstract y verificada a nivel de PMID, 5-fold StratifiedGroupKFold, y una búsqueda de hiperparámetros sobre lr {1e-5, 2e-5, 3e-5} × épocas {1, 2}, resultando en lr 3e-5 y 1 época. Se usaron tres semillas (42, 43, 44) y el checkpoint publicado corresponde a la semilla 42. La representación del thread G2P es plana (sin enriquecimiento contextual), ya que las variantes con nombre completo de gen o contextualización MONDO+HPO no mostraron diferencias significativas bajo validación cruzada.

## Capacidades

- Puntuación de relevancia entre un abstract de PubMed (título + resumen) y un thread de Gene2Phenotype, devolviendo un valor sigmoideo en [0, 1].
- Clasificación binaria para filtrar pares relevantes, con umbral de despliegue recomendado de 0,9.
- Ranking de candidatos dentro del pipeline LitDD, operando como etapa intermedia entre el screen inicial y la adjudicación final mediante LLM.
- Inferencia reproducible en fp16 o bf16 sin pérdida de precisión respecto a fp32.
- Soporte para uso con la librería sentence-transformers, compatible con text-embeddings-inference.
- No soporta tool calling, generación de texto, visión ni capacidades de agente.
- Limitado al idioma inglés y al dominio biomédico genético.

## Casos de uso

- Curación de bases de datos de asociaciones gen-enfermedad: el modelo puntúa automáticamente los abstracts de PubMed frente a los threads G2P, priorizando los artículos que deben revisarse manualmente para actualizar bases de datos como Gene2Phenotype.
- Detección de nuevas asociaciones gen-enfermedad: al filtrar literatura emergente, permite identificar artículos que mencionan genes y enfermedades con posible relación no anotada, reduciendo el ruido y el coste de revisión experta.
- Apoyo a revisiones sistemáticas en genética médica: puede usarse como herramienta de cribado para localizar estudios primarios relevantes sobre un gen o síndrome concreto, acelerando el proceso de revisión.
- Pipeline de minería de literatura a gran escala: integrado en el sistema LitDD, actúa como filtro de precisión antes de la adjudicación con LLM, reduciendo la carga computacional y mejorando la exactitud del mapeo final.
- Validación de anotaciones existentes: permite comprobar si un abstract concreto respalda una asociación gen-enfermedad ya registrada, ayudando a detectar errores o desactualizaciones en bases de datos.
- Priorización de artículos para lectura manual: en entornos de investigación clínica, el modelo puede ordenar los resultados de búsquedas PubMed según su relevancia para un gen o enfermedad específicos, facilitando el trabajo de los curadores.

## Benchmarks y rendimiento

Los resultados publicados en la model card se basan en un conjunto de test anotado mantenido (2.771 pares, 686 positivos) y en un benchmark externo congelado (1.924 pares de verdad curada y 87.600 abstracts aleatorios de PubMed como negativos plateados). En el test anotado, con umbral fijo de 0,5:

| Modelo | F1 | Precision | Recall |
|---|---|---|---|
| **Este release (semilla 42)** | **0,933** | 0,921 | 0,941 |
| Versión anterior (v1-original) | 0,397 | 0,248 | 1,000 |
| MedCPT sin entrenar | 0,417 | 0,266 | 0,971 |

En el benchmark externo, con umbral de despliegue 0,9:

| Modelo | In-scope recall (663 pares) | Gate-passing recall (1.592) | Todos (1.924) | Tasa de fuego sobre corpus |
|---|---|---|---|---|
| **Este release** | **0,932 ± 0,009** | 0,576 ± 0,028 | 0,539 ± 0,027 | **0,227 ± 0,013 %** |
| Misma receta sin negativos de corpus | 0,941 ± 0,009 | 0,632 ± 0,012 | 0,604 ± 0,010 | 0,294 ± 0,012 % |
| Versión anterior | 0,919 | 0,570 | 0,545 | 2,77 % |
| MedCPT sin entrenar | 0,971 | 0,749 | 0,702 | 2,37 % |

La cobertura top-k del entry verdadero en los positivos de test es de 0,797 ± 0,013 para top-1 dentro de los candidatos del gene gate (universo de despliegue, mediana de 2 candidatos) y de 0,870 para top-1 contra el pool de 279 entradas del test, con top-3 = 1,00.

## Requisitos de hardware

- El modelo tiene 109,5 millones de parámetros, lo que en fp32 ocupa aproximadamente 440 MB de memoria; en fp16 o bf16 se reduce a unos 220 MB.
- Cabe en cualquier GPU de consumo con al menos 2 GB de VRAM, como una NVIDIA GTX 1650, RTX 2060 o superior.
- Para inferencia a escala de corpus, se recomienda al menos una GPU con 8 GB de VRAM para procesar lotes grandes de pares (por ejemplo, RTX 3070, RTX 4080, A10 o A100).
- Despliegue compatible con la librería sentence-transformers, así como con text-embeddings-inference según los tags del repositorio. También puede convertirse a formatos como ONNX o TensorRT para optimización.
- La latencia por par es típicamente inferior a 10 ms en GPU moderna (dato estimado, no publicado), y el throughput depende del tamaño de lote y de la GPU utilizada.

## Comparativa con modelos similares

La comparativa se realiza con los modelos directamente relacionados en el mismo dominio y pipeline, ya que no se dispone de datos de otros cross-encoders biomédicos con la misma tarea específica.

| Modelo | Parámetros | Contexto | F1 (test anotado) | Tasa de fuego (corpus) | Licencia |
|---|---|---|---|---|---|
| **LitDD_crossencoder (este)** | 109 M | 512 tokens | 0,933 | 0,227 % | MIT |
| ncbi/MedCPT-Cross-Encoder (sin fine-tune) | 109 M | 512 tokens | 0,417 | 2,37 % | MIT |
| LitDD_crossencoder v1-original | 109 M | 512 tokens | 0,397 | 2,77 % | MIT |

El modelo supera claramente a su base sin entrenar y a su versión anterior en precisión y F1, a costa de una ligera reducción en recall en el benchmark externo, que es aceptable dado su rol como filtro de precisión.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con literatura biomédica en inglés; no se recomienda su uso fuera de ese dominio ni con otros idiomas.
- La longitud máxima de secuencia es de 512 tokens; abstracts más largos deben truncarse, lo que puede perder información relevante.
- Como cross-encoder, no es simétrico: el orden de los pares (abstract, thread) es crítico y debe respetarse exactamente como en el entrenamiento.
- Aunque la tasa de falsos positivos se reduce drásticamente, el modelo aún puede generar falsos positivos en abstracts que mencionan genes pero no establecen asociaciones reales, especialmente en revisiones o artículos pre-moleculares.
- El rendimiento depende de la representación del thread G2P; cambios en el formato del thread (por ejemplo, actualizaciones de la exportación G2P) pueden degradar la precisión.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no ha sido validado clínicamente y no debe usarse como única fuente para decisiones médicas.
- No se han publicado resultados de benchmarks estándar como MMLU o HumanEval, ya que el modelo está especializado en una tarea de clasificación de pares, no en generación de texto general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tmy100000001/LitDD_crossencoder
- Repositorio del pipeline LitDD: https://github.com/biomedicalinformaticsgroup/LitDD_mining
- Paper en medRxiv sobre el sistema LitDD: https://www.medrxiv.org/content/10.1101/2025.11.24.25340871v1
- Modelo base MedCPT-Cross-Encoder: https://huggingface.co/ncbi/MedCPT-Cross-Encoder
- Documentación de Cross-Encoders de sentence-transformers: https://www.sbert.net/examples/cross_encoder/applications/README.html
