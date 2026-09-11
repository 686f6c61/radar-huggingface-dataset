# yusifnuri/Llama-3.2-3B-Instruct_ner

## Resumen

`yusifnuri/Llama-3.2-3B-Instruct_ner` es un adaptador LoRA (librería PEFT) que especializa el modelo `meta-llama/Llama-3.2-3B-Instruct` (3,21 mil millones de parámetros) en una única tarea: el reconocimiento de entidades nombradas (NER) de tipo persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC) en frases en inglés. Lo publica Yusif Nuri como artefacto verificable de su tesis de máster en la SRH University Hamburg, titulada *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*, donde se comparan modelos pequeños ajustados contra API de proveedores frontera en precisión, latencia, coste, exposición de privacidad y volumen de equilibrio del retorno de la inversión.

Su relevancia práctica es la del ajuste eficiente: el repositorio ocupa 0,1 GB frente a los varios gigabytes de una copia completa de los pesos base, y se carga sobre Llama 3.2 3B Instruct sin alterar el modelo original. El entrenamiento se hizo sobre CoNLL-2003 (inglés) con 5.000 ejemplos, secuencias de 512 tokens, rango 16 y 3 épocas, con hiperparámetros idénticos a los del resto de celdas del benchmark.

Advertencia central: la propia model card declara que la métrica publicada (F1 de entidad de 0,7917) **no es una medición válida**. El arnés de la primera pasada puntuaba el solapamiento de tokens entre la cadena de etiquetas generada y la de referencia, una cantidad dominada por la etiqueta mayoritaria `O` que refleja imitación de formato, no extracción de entidades. El arnés ya se corrigió (decodificación BIO a formas superficiales), pero esta celda no se ha vuelto a evaluar: el número es un marcador de posición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) sobre las proyecciones de atención |
| Parámetros totales | 3,21 B en el modelo base; adaptador LoRA de rango 16 sobre `q_proj`, `k_proj`, `v_proj` y `o_proj` (del orden de unos 9 millones de parámetros según las dimensiones del modelo base; cifra no confirmada por el autor) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.2 3B; el adaptador se entrenó con `max_sequence_length` de 512 tokens |
| Tipos de cuantización | No disponible. El adaptador se distribuye sin cuantizar; no se documentan versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible en la información proporcionada. El corpus de entrenamiento (CoNLL-2003) es exclusivamente en inglés |
| Licencia | llama3.2 (Llama 3.2 Community Licence) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no pesos completos) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango, no un modelo completo. Se aplica sobre `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only autorregresivo, y modifica las cuatro proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) con rango 16, alpha 32 y dropout 0,05. El ajuste se hizo con AdamW, tasa de aprendizaje 2e-4 con schedule coseno y 3 % de warmup, 3 épocas, tamaño de lote efectivo 16 (4 × 4 de acumulación de gradiente), longitud máxima de 512 tokens y semilla 42. El conjunto de entrenamiento son 5.000 ejemplos de CoNLL-2003 en inglés (dataset `eriktks/conll2003`), de los cuales 500 quedaron apartados para la selección de checkpoint. No se documenta RLHF, DPO ni ninguna otra fase de alineamiento posterior al ajuste supervisado.

La innovación metodológica no está en la arquitectura, sino en el diseño del experimento: todos los modelos y tareas del benchmark usan exactamente los mismos hiperparámetros, sin ajuste por celda, de modo que las cifras publicadas se declaran como cota inferior conservadora del rendimiento alcanzable. El adaptador exige un formato de prompt concreto en inferencia (`Extract named entities (PER=person, ORG=organisation, LOC=location, MISC=miscellaneous) from this text: {text}` seguido de `Entities:`); usarlo con otro formato degrada la salida, ya que no se ha entrenado para instrucciones generales.

## Capacidades

- Extracción de entidades nombradas en inglés para las cuatro clases de CoNLL-2003: PER, ORG, LOC y MISC.
- Respuesta a un único formato de prompt de extracción; la salida esperada es una cadena de etiquetas decodificable en BIO.
- Generación de texto conversacional heredada del modelo base (pipeline declarado: `text-generation`), aunque no es el propósito del adaptador.
- Soporte de tool calling: no disponible; no se documenta entrenamiento en function calling.
- Soporte de agentes y razonamiento multi-paso: no disponible; la tarea es de una sola pasada sobre una frase.
- Capacidades multilingües: no acreditadas; el adaptador se entrenó solo con datos en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El modelo base Llama 3.2 3B es solo texto.

## Casos de uso

- Enriquecimiento de documentación empresarial: procesar lotes de correos, tickets o informes en inglés para poblar un grafo de conocimiento con entidades PER/ORG/LOC, usando el modelo base como generador de etiquetas y un decodificador BIO posterior.
- Seudonimización previa a API externas: detectar nombres de personas y organizaciones en texto en inglés antes de enviarlo a un proveedor frontera, de modo que solo salga el texto anonimizado. Es el escenario de privacidad que motiva la propia tesis.
- Preprocesado para búsqueda y recuperación: indexar entidades como campos estructurados junto al texto, mejorando el filtrado por organización o localización en motores de recuperación documental.
- Replicación y auditoría del benchmark: el adaptador se publica para verificar de forma independiente la matriz de resultados de la tesis; un tercero puede recargar el LoRA y volver a evaluar con el arnés corregido.
- Limpieza y etiquetado de corpus de entrenamiento: detección automática de entidades para revisar, filtrar o anotar parcialmente datasets propios en inglés antes de un etiquetado humano.
- Extracción de partes implicadas en contratos y actas en inglés: identificar personas y organizaciones citadas para generar resúmenes de partes y alimentar flujos de gestión documental.
- Comparación coste/prestación en pruebas internas: medir en un caso acotado si el autoalojamiento en H200 (940 ms por petición, 16,29 USD por millón de tokens generados) sale a cuenta frente a pagar por token a una API, con el volumen de equilibrio como criterio.

## Benchmarks y rendimiento

| Métrica | Valor reportado | Nota |
|---|---|---|
| F1 a nivel de entidad (media por frase) | 0,7917 | El autor lo marca explícitamente como no válido: la puntuación original medía solapamiento de tokens de etiquetas, no extracción de entidades |
| Latencia media, batch 1 | 940 ms | Medida en 1 × NVIDIA H200 (141 GB), a plena utilización, excluye tránsito de red |
| Coste por 1M de tokens generados | 16,29 USD | Precio imputado de 3,99 USD por GPU-hora |
| MMLU, HumanEval, GSM8K y otros | No disponible | No se han publicado resultados de benchmarks generales en la información disponible |

La evaluación se ejecutó el 5 de julio de 2026 sobre 200 instancias retenidas (y 164 problemas completos en el caso de generación de código), por lo que el autor advierte que el tamaño de efecto detectable está acotado en torno a diez puntos porcentuales. Las puntuaciones no son comparables entre tareas: cada tarea del benchmark usa su propia métrica.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 3,21 B de parámetros del modelo base, no medida por el autor): en fp16 aproximadamente 6,5-7 GB de pesos más caché KV; en 8 bits en torno a 3,5-4 GB; en 4 bits alrededor de 2-2,5 GB. El adaptador añade un consumo despreciable.
- GPU recomendadas por el autor: NVIDIA H200 de 141 GB, la única configuración medida en el benchmark.
- GPU de consumo: el modelo base en 4 u 8 bits cabe razonablemente en tarjetas con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080). Con la ventana completa de 128.000 tokens la caché KV dispara el consumo y exige hardware de mayor capacidad; en la práctica, el adaptador se entrenó a 512 tokens.
- Opciones de despliegue: `transformers` + `peft` (el procedimiento documentado), o vLLM con soporte de adaptadores LoRA para servicio concurrente. No se documenta compatibilidad con llama.cpp, Ollama ni TGI; publicar el adaptador en GGUF requeriría una conversión y fusión previas no descritas.
- Latencia y throughput: 940 ms por petición con lote de tamaño 1 sobre H200, según la model card. No se publican cifras de throughput agregado ni de latencia con lotes mayores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct_ner (este adaptador) | 3,21 B (base) + LoRA de rango 16 | 128.000 tokens (base); entrenado a 512 | F1 0,7917 declarado no válido; 940 ms por petición | Llama 3.2 Community | Público en HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct (base sin adaptar) | 3,21 B | 128.000 tokens | No disponible para NER en la información proporcionada | Llama 3.2 Community | Público, ampliamente distribuido |
| API de proveedores frontera (brazo comparado en la tesis) | No disponible | No disponible | No disponible en la información proporcionada | Propietaria | Pago por token |
| Otros adaptadores NER sobre modelos pequeños | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa cuantitativa completa está en la matriz del repositorio de la tesis, fuera de la información proporcionada aquí; no se reproducen cifras de modelos competidores porque no se han facilitado.

## Limitaciones y advertencias

- La métrica publicada no es fiable: el propio autor la califica de marcador de posición y advierte de que no debe interpretarse como rendimiento. Cualquier uso en producción exige una reevaluación propia con decodificación BIO correcta.
- Entrenamiento con una sola semilla y una sola ejecución: las diferencias reportadas confunden calidad del modelo con varianza de inicialización.
- Especialización estrecha: una tarea sobre un único corpus público en inglés. No es un asistente de propósito general y no debería tratarse como tal.
- Riesgo de contaminación: CoNLL-2003 es un corpus público longevo y plausiblemente presente en los datos de pretratamiento del modelo base, lo que infla las puntuaciones absolutas.
- Alcance estadístico limitado: 200 instancias retenidas en la evaluación, con un efecto detectable mínimo de unos diez puntos porcentuales.
- Idioma: sin capacidades multilingües acreditadas; el comportamiento en castellano es impredecible.
- Riesgo de alucinación y de fuga del formato: al ser un modelo generativo, puede producir etiquetas fuera del esquema BIO o inventar entidades no presentes en el texto; se recomienda validación posterior.
- Licencia: la Llama 3.2 Community Licence permite uso comercial, pero lo condiciona a atribución, a una convención de nombres para modelos derivados (los nombres deben comenzar por "Llama") y a un umbral de usuarios activos mensuales. Hay que revisarla antes de adoptarla.
- Licencia del dato: CoNLL-2003 está sujeto a los términos de Reuters y su redistribución está restringida; esto afecta a la reproducibilidad del entrenamiento, no a la del adaptador ya publicado.
- Repositorio sin tracción: cero descargas y cero valoraciones en el momento de la consulta, sin garantía de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/Llama-3.2-3B-Instruct_ner
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Código, configuraciones y arnés de evaluación: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Análisis de coste por petición: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Dataset de entrenamiento (CoNLL-2003 en inglés): https://huggingface.co/datasets/eriktks/conll2003
- Cita: Nuri, Yusif (2026), *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*, tesis de máster, SRH University Hamburg.
