# yusifnuri/Mistral-7B-v0.3_classification

## Resumen

Mistral-7B-v0.3_classification es un adaptador LoRA publicado por el usuario yusifnuri sobre el modelo base mistralai/Mistral-7B-v0.3 (7 250 millones de parámetros). No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (0,1 GB), que especializan el modelo base para una única tarea de clasificación de texto en cuatro categorías (World, Sports, Business, Sci/Tech). Se entrenó con QLoRA en precisión 4-bit NF4 con doble cuantización sobre el corpus AG News.

El adaptador nace como artefacto de verificación de la tesis de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg, 2026), que compara modelos pequeños ajustados frente a APIs de proveedores frontera en exactitud, latencia, coste, exposición de privacidad y volumen de equilibrio del retorno de la inversión. Su interés práctico es acotado pero claro: sirve como referencia reproducible de lo que rinde un modelo de 7B adaptado con QLoRA en una tarea empresarial concreta, con todos los hiperparámetros y el arnés de evaluación publicados.

La relevancia actual del artefacto es metodológica más que de producto: documenta exactamente el prompt, la configuración de entrenamiento, la semilla y las métricas, de modo que cualquiera puede repetir la medición. No está pensado como asistente generalista ni como clasificador listo para producción en taxonomías distintas a la de AG News.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.3) con adaptador LoRA acoplado vía PEFT |
| Parámetros totales | 7 250 millones en el modelo base; adaptador de bajo rango con rango 16 (repo de 0,1 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base según la documentación de Mistral AI; el adaptador se entrenó con una longitud máxima de 512 tokens |
| Tipos de cuantización | Entrenamiento: QLoRA 4-bit NF4 con doble cuantización. Inferencia: el base admite 4-bit/8-bit (bitsandbytes), bf16/fp16 y conversión a GGUF/GGML para llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (deltas LoRA de PEFT); requiere descargar por separado el modelo base en safetensors |
| Tarea | Clasificación de texto en 4 clases (World, Sports, Business, Sci/Tech) |
| Dataset de entrenamiento | AG News (`fancyzhx/ag_news`), licencia "custom, research use" |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-v0.3, un transformer decoder-only con atención de ventana deslizante y RoPE. La adaptación es un LoRA clásico con rango 16, alpha 32 y dropout 0,05, insertado en las cuatro proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). El entrenamiento se hizo con QLoRA: el base se carga cuantizado a 4-bit NF4 con doble cuantización y solo se actualizan los deltas de bajo rango. Se partió de la versión *base* del modelo, no de una versión instruida, lo que implica que cualquier déficit de comportamiento se reparte entre el modelo y la propia adaptación a 4 bits y no puede separarse dentro de este diseño.

Los datos son 5 000 ejemplos de AG News, con 500 reservados para selección del punto de control. La configuración fue: 3 épocas, tasa de aprendizaje 2e-4 con planificador coseno y 3 % de warmup, tamaño de lote efectivo 16 (2 x 8 de acumulación de gradiente), longitud máxima de secuencia 512 tokens, optimizador AdamW y semilla 42. Los hiperparámetros se mantuvieron constantes en todos los modelos y tareas del benchmark en lugar de ajustarse celda a celda, por lo que el autor los presenta como una cota inferior conservadora del rendimiento alcanzable. El prompt de entrenamiento tiene un formato fijo y el modelo lo espera literalmente en inferencia:

```text
Classify the following news text into exactly one category (World / Sports / Business / Technology):
{text}
Category:
```

## Capacidades

- Clasificación de texto de una sola etiqueta en cuatro categorías: World, Sports, Business y Sci/Tech (Technology en el texto del prompt).
- Generación de texto en el pipeline declarado (`text-generation`), aunque el adaptador está especializado y no se ha evaluado como generador abierto.
- Ejecución local con el modelo base completo, lo que permite procesar texto sin enviarlo a APIs externas.
- Integración mediante PEFT sobre transformers, con posibilidad de fusionar los deltas en el base y exportar a otros runtimes.
- Soporte de *tool calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas ni se han evaluado).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Clasificación de titulares y entradas de noticias en agregadores: el adaptador asigna una de las cuatro categorías de AG News a cada ítem, lo que permite etiquetar automáticamente feeds antes de indexarlos o agruparlos por sección.
- Etiquetado semiautomático de corpus para investigación: dado su carácter reproducible (semilla fija, dataset público y métricas publicadas), sirve como anotador de referencia en estudios sobre calidad de etiquetado o como línea base frente a APIs frontera.
- Filtrado temático en portales de medios: separar flujos de entrada por vertical (deportes, negocios, tecnología, internacional) para enrutarlos a las secciones correspondientes o a colas de revisión editorial.
- Señal de entrada para análisis de mercado: extraer de forma masiva los ítems clasificados como Business de un feed de noticias para alimentar paneles de seguimiento o análisis de sentimiento posterior.
- Procesamiento *on-premise* con requisitos de privacidad: al ejecutarse sobre un modelo de pesos abiertos sin llamadas a terceros, puede desplegarse en infraestructura propia para clasificar textos que no pueden salir de la organización.
- Reproducción de un benchmark interno de coste: la configuración publicada permite medir coste por petición y latencia en el hardware propio y compararlos con las cifras del autor (USD 19,25 por millón de tokens generados a USD 3,99 por GPU-hora imputados).
- Deduplicación y agrupación temática de archivos históricos: clasificar grandes volúmenes de noticias ya almacenadas para reorganizar hemerotecas digitales por tema.
- Adaptación a taxonomías propias mediante reentrenamiento: el script de QLoRA y los hiperparámetros documentados sirven como plantilla para ajustar el mismo base a categorías internas distintas de las de AG News.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Exactitud | 0,69 | AG News, 200 instancias reservadas |
| Latencia media | 556 ms | Batch 1, H200 de 141 GB a plena utilización, sin tránsito de red |
| Coste por 1 millón de tokens generados | 19,25 USD | GPU imputada a 3,99 USD por hora |
| Fecha de evaluación | 5 de julio de 2026 | — |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible. Las puntuaciones del autor no son comparables entre tareas, porque cada tarea del benchmark usa su propia métrica.

## Requisitos de hardware

- Adaptador en disco: 0,1 GB. Es necesario descargar además el modelo base completo.
- Modelo base en bf16/fp16: unos 14,5 GB de pesos (7 250 millones de parámetros a 2 bytes) más 1-2 GB de activaciones y caché KV, lo que sitúa el requisito práctico en 16-24 GB de VRAM.
- Modelo base en 4-bit NF4: aproximadamente 4,0-4,5 GB de pesos, lo que permite ejecución en GPU de consumo de 8 GB de forma ajustada y con holgura a partir de 12 GB.
- GPU profesionales: NVIDIA H200 de 141 GB (la usada en la medición oficial), H100 de 80 GB, A100 de 40 u 80 GB.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) en bf16; RTX 4080/4070 Ti (16 GB) y RTX 3060 (12 GB) en 4-bit.
- Opciones de despliegue: transformers + peft (el camino documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con LoRA, y llama.cpp/Ollama si se fusiona previamente el adaptador con el base y se convierte a GGUF.
- Latencia: 556 ms por petición a batch 1 sobre H200 según el autor. No se publican cifras de throughput ni de latencia en otro hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yusifnuri/Mistral-7B-v0.3_classification | 7,25 B (base) + adaptador LoRA (rango 16) | 32 768 tokens en el base; entrenado a 512 | Exactitud 0,69 en AG News (4 clases), 556 ms por petición en H200 | Apache-2.0 | Público en HuggingFace, 0 descargas y 0 likes |
| mistralai/Mistral-7B-v0.3 (base, sin adaptar) | 7,25 B | 32 768 tokens | Sin adaptación a la tarea; no se publican métricas en esta información | Apache-2.0 | Público en HuggingFace |
| APIs de proveedores frontera incluidas en la tesis | no disponible | no disponible | Los resultados están en `results/benchmark_matrix.csv`; no se reproducen en esta información | Propietaria | Acceso por API |

No se dispone en la información proporcionada de datos numéricos de otros clasificadores de AG News (por ejemplo, codificadores tipo BERT ajustados a la misma tarea), por lo que no se incluye una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Especializado en una única tarea y un único corpus. No es un asistente de propósito general y no debe tratarse como tal.
- Entrenado una sola vez con una única semilla (42). Las diferencias reportadas mezclan calidad del modelo con varianza de inicialización.
- La evaluación usa 200 instancias reservadas, por lo que el tamaño de efecto detectable está acotado en torno a diez puntos porcentuales.
- Los corpus de evaluación son benchmarks públicos de larga trayectoria y probablemente están presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- Partir del modelo base y no de una versión instruida implica que el déficit de comportamiento no puede separarse entre el modelo y la adaptación a 4 bits.
- La licencia del dataset AG News es "custom, research use", lo que limita el uso comercial del adaptador entrenado con él, pese a que la licencia del adaptador sea Apache-2.0.
- Riesgo de alucinación y de etiquetas fuera de las cuatro clases: el prompt exige exactamente una categoría, pero no se documenta ningún mecanismo de validación de la salida.
- Idiomas soportados no declarados; no hay evaluación fuera del inglés.
- El repositorio registra 0 descargas y 0 likes, y no hay evidencia de uso en producción ni de mantenimiento posterior a su publicación (creado y actualizado el 11 de septiembre de 2026).
- Los resultados de la búsqueda web realizada no aportan información relevante sobre el modelo: los enlaces devueltos corresponden a la empresa Otto Fischer AG y no guardan relación con este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/Mistral-7B-v0.3_classification
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Código, configuraciones y arnés de evaluación: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Análisis de coste por petición: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Tesis citada: Nuri, Yusif. *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*. SRH University Hamburg, 2026.
