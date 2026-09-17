# yhhugging/DualMLC-wiki10-31k

## Resumen

DualMLC-wiki10-31k es un checkpoint de clasificación de texto multietiqueta a gran escala (extreme multi-label classification, XMC) publicado por el usuario yhhugging y asociado al artículo «LLM-Enhanced Dual-Branch Learning for Large-Scale Multi-Label Text Classification», de Hui Ye, Jing Zhang, Xiulong Yang y Rajshekhar Sunderraman (arXiv:2609.12915). No es un modelo generativo: es un clasificador entrenado específicamente sobre el vocabulario de etiquetas del conjunto Wiki10-31K, con aproximadamente 31.000 etiquetas posibles según indica el nombre del dataset.

La arquitectura es de doble rama: una rama basada en Qwen2.5-7B-Instruct adaptada con LoRA y otra basada en BERT-base-uncased con ajuste fino completo, cada una con su propia cabeza clasificadora y con fusión tardía de logits. El repositorio pesa 0,7 GB porque solo contiene el adaptador LoRA, el encoder BERT, los tokenizadores y las cabezas; el modelo base Qwen2.5-7B-Instruct se descarga por separado.

Su relevancia es fundamentalmente de investigación: ofrece un baseline reproducible que combina representaciones de un LLM con las de un encoder compacto para una tarea donde el número de etiquetas hace inviable el enfoque generativo convencional. La evaluación declarada alcanza 90,78 % de P@1, 81,11 % de P@3 y 71,94 % de P@5 en Wiki10-31K, con un entrenamiento registrado de 0,25 horas sobre 8 × RTX 4090.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Doble rama: Qwen2.5-7B-Instruct con adaptador LoRA + BERT-base-uncased con ajuste fino completo; una cabeza clasificadora por rama y fusión tardía de logits |
| Parámetros totales | No publicado como cifra agregada; la rama Qwen2.5-7B-Instruct aporta aproximadamente 7.600 millones y la rama BERT-base unos 110 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; los truncamientos se definen en `config.json` y no se detallan en la información proporcionada |
| Tipos de cuantización | No disponible (el checkpoint se distribuye sin cuantizar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0, declarada por el publicador para el checkpoint |
| Formato de pesos | safetensors para el adaptador LoRA y el encoder BERT; ficheros `.pt` (`head_qwen.pt`, `head_bert.pt`) para las cabezas; librería `pytorch` |
| Tarea (pipeline) | `text-classification` (clasificación multietiqueta extrema) |
| Número de etiquetas | Vocabulario fijo de Wiki10-31K; el nombre del dataset sugiere en torno a 31.000 etiquetas |
| Agregación de capas | Últimas cuatro capas de la rama Qwen |
| Pooling | Media (mean) en Qwen; token CLS en BERT |
| Dropout de la cabeza Qwen | 0,2 |
| Tamaño del repositorio | 0,7 GB (sin el modelo base Qwen) |
| Descargas / likes | 10 / 0 |
| Fecha de publicación | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo procesa un mismo documento con dos ramas en paralelo. La rama Qwen2.5-7B-Instruct no se ajusta por completo: se entrena un adaptador LoRA sobre el modelo de instrucciones, se agregan las últimas cuatro capas y se aplica pooling de media para obtener una representación del documento. La rama BERT-base-uncased se ajusta a fondo y se representa mediante el token CLS. Cada rama dispone de su propia cabeza clasificadora (con dropout de 0,2 en la cabeza Qwen) sobre el vocabulario de etiquetas, y la decisión final se obtiene mediante fusión tardía de logits, con un peso de fusión, un recuento de etiquetas y la arquitectura registrados en `config.json`.

El `config.json` incluido en esta release es una reconstrucción: la agregación de las últimas cuatro capas y el pooling (media en Qwen, CLS en BERT) fueron confirmados por el autor, mientras que el resto de valores se recuperaron del adaptador, del registro de entrenamiento y de las formas de las cabezas. El repositorio documenta esa procedencia en `config_provenance.json` y `training.log`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO; el ajuste se limita a LoRA en la rama Qwen y fine-tuning completo en la rama BERT. El tiempo de entrenamiento registrado es de 0,25 horas sobre 8 × RTX 4090 con CUDA 11.8, y las métricas reportadas corresponden al paso 4000.

## Capacidades

- Clasificación multietiqueta extrema: asigna a un documento en inglés un ranking de etiquetas dentro de un vocabulario fijo de gran tamaño (Wiki10-31K).
- Fusión de dos vistas del documento: explota simultáneamente la representación contextual de un LLM de 7B y la de un encoder BERT ajustado a fondo.
- Salida de ranking top-k: la inferencia permite solicitar las k etiquetas mejor puntuadas (`--predict-topk`).
- Puntuaciones con transformación sigmoide, no documentadas como probabilidades calibradas.
- No genera texto: no es un modelo instructivo ni conversacional pese a estar construido sobre Qwen2.5-7B-Instruct.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No acepta un vocabulario de etiquetas arbitrario: las etiquetas están fijadas por el entrenamiento.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Clasificación temática de artículos enciclopédicos: es el escenario nativo del checkpoint (Wiki10-31K), por lo que resulta adecuado para etiquetar documentos largos en inglés contra una taxonomía de decenas de miles de categorías.
- Enrutamiento de tickets de soporte: si la taxonomía interna coincide con el vocabulario del checkpoint, se puede usar para asignar cada ticket a una o varias colas, ya que devuelve un ranking top-k que permite escoger umbrales por cola.
- Moderación y categorización de contenido en inglés: el modelo puede etiquetar simultáneamente un mismo texto con varias categorías de contenido, algo que un clasificador uniclase no cubre.
- Indexación y recuperación en bibliotecas digitales: las etiquetas predichas pueden alimentar facetas de búsqueda o filtros de navegación sobre corpus científicos y documentales en inglés.
- Pre-anotación para curación de datasets: las predicciones top-k pueden servir como etiquetas candidatas que un humano revise después, reduciendo el coste de anotación en taxonomías grandes.
- Baseline de investigación en XMC: el checkpoint es un punto de comparación reproducible para métodos que combinan LLM y encoders, con el código del repositorio DualMLC para reproducir el preprocesado y la evaluación.
- Análisis de tendencias sobre corpus documentales: al agrupar documentos por etiqueta se pueden medir evoluciones temáticas en un archivo en inglés, siempre que las categorías de interés existan en el vocabulario entrenado.
- Sistemas de recomendación de contenido basados en temas: el ranking de etiquetas puede alimentar perfiles temáticos de usuario sin necesidad de un modelo generativo.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son métricas de precisión en Wiki10-31K, registradas en el `best_metrics.json` del checkpoint en el paso 4000. El propio autor advierte que no constituyen una reevaluación de los ficheros subidos.

| Dataset | P@1 (%) | P@3 (%) | P@5 (%) |
|---|---:|---:|---:|
| Wiki10-31K | 90,78 | 81,11 | 71,94 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otros métodos XMC.

## Requisitos de hardware

- El repositorio descargable ocupa 0,7 GB, pero requiere descargar aparte `Qwen/Qwen2.5-7B-Instruct`, lo que añade del orden de 15 GB en precisión de 16 bits.
- Estimación de VRAM para inferencia (no publicada por el autor, calculada a partir de los tamaños de los modelos base): en torno a 17-20 GB en bf16/fp16 sumando Qwen, BERT-base y las cabezas; en torno a 7-9 GB si se cuantiza la rama Qwen a 4 bits.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada funcionan con margen en bf16; una RTX 4090 de 24 GB es suficiente para bf16 en lotes pequeños, la misma GPU empleada en el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 con lotes reducidos, y en GPUs de 8-12 GB si se cuantiza la rama Qwen, aunque esa ruta no está documentada por el autor.
- Opciones de despliegue: el checkpoint no se integra con vLLM, TGI, Ollama ni llama.cpp; requiere el cargador propio del repositorio (`model.load_checkpoint` o `test.py`). El soporte GGUF no está disponible.
- Latencia y throughput: no disponibles. El único dato temporal publicado es de entrenamiento (0,25 horas en 8 × RTX 4090), no de inferencia.

## Comparativa con modelos similares

| Modelo | Rama base | Parámetros | Contexto | P@1 en Wiki10-31K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DualMLC-wiki10-31k | Qwen2.5-7B-Instruct (LoRA) + BERT-base (fine-tuning completo) | Aprox. 7,6 B + 110 M | No disponible | 90,78 % | Apache 2.0 (checkpoint) | HuggingFace + GitHub DualMLC |
| Rama BERT-base-uncased ajustada (componente del propio método) | BERT-base | Aprox. 110 M | No disponible (limitado por el tokenizador BERT) | No disponible | Apache 2.0 (modelo base) | HuggingFace |
| Qwen2.5-7B-Instruct usado directamente con prompting | Qwen2.5 | Aprox. 7,6 B | No disponible | No disponible | Consultar la licencia del modelo base | HuggingFace |

Como alternativas de la misma categoría existen los métodos clásicos de XMC basados en encoders y arquitecturas de partición de etiquetas (por ejemplo, AttentionXML o XR-Transformer), pero la información proporcionada no incluye sus parámetros, licencias ni resultados en Wiki10-31K, por lo que no se ofrece comparación numérica.

## Limitaciones y advertencias

- Vocabulario cerrado: el modelo solo puntúa etiquetas del vocabulario de Wiki10-31K y no admite un vocabulario nuevo. No es reutilizable directamente sobre una taxonomía propia.
- Los identificadores de etiqueta dependen del preprocesado concreto del dataset y no son intercambiables entre conjuntos ni entre variantes de preprocesado.
- Idioma único: solo inglés declarado; el rendimiento en otros idiomas no está establecido.
- Dominio restringido: el entrenamiento y la evaluación se limitan a Wiki10-31K (contenido enciclopédico); no hay evidencia de generalización a otros dominios como soporte técnico o texto clínico.
- Las puntuaciones se aplican con una transformación sigmoide y no están documentadas como probabilidades calibradas; no deberían usarse como umbrales de confianza sin calibración previa.
- Truncamiento de entradas: los documentos se recortan según longitudes máximas definidas en `config.json`, cuyos valores no se detallan; textos largos pueden perder información relevante.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de etiquetas espurias en el ranking, especialmente en las posiciones bajas del top-k.
- Sesgos heredados: la rama Qwen2.5-7B-Instruct y el corpus de Wikipedia pueden introducir sesgos temáticos y de cobertura, con sobrerrepresentación de categorías bien documentadas.
- Licencia: el publicador declara Apache 2.0 para el checkpoint, pero la licencia Apache 2.0 del repositorio original cubría únicamente el código. Los modelos base (Qwen2.5-7B-Instruct y BERT) y los datasets de benchmark tienen sus propias licencias y condiciones, que hay que verificar antes de un uso comercial.
- Procedencia de la configuración: `config.json` es una reconstrucción, no el fichero original; aunque la procedencia está documentada, conviene validar la reconstrucción antes de reproducir resultados.
- Métricas no verificadas de forma independiente: los valores de P@k provienen del `best_metrics.json` original y no de una reevaluación de los ficheros publicados.
- Adopción mínima: 10 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.
- Coste de despliegue elevado para un clasificador: exige cargar una rama de 7B junto a BERT, muy por encima de un encoder de clasificación convencional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yhhugging/DualMLC-wiki10-31k
- Paper en arXiv: https://arxiv.org/abs/2609.12915
- Página del paper en HuggingFace: https://huggingface.co/papers/2609.12915
- Código fuente (DualMLC): https://github.com/huiyegit/DualMLC
- Instrucciones de instalación del repositorio: https://github.com/huiyegit/DualMLC#setup
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base BERT: https://huggingface.co/google-bert/bert-base-uncased
