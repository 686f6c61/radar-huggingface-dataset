# yusifnuri/Mistral-7B-v0.3_ner

## Resumen

Mistral-7B-v0.3_ner es un adaptador LoRA (entrenado con QLoRA) publicado por el usuario yusifnuri sobre el modelo base mistralai/Mistral-7B-v0.3, de 7 250 millones de parámetros. No es un modelo completo, sino un adaptador de 0,1 GB que especializa el modelo base en una única tarea de generación de texto: el reconocimiento de entidades nombradas (NER) con cuatro categorías (PER, ORG, LOC y MISC) a partir de una frase en inglés.

El adaptador se creó como artefacto verificable de la tesis de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg, 2026), que compara modelos pequeños ajustados frente a APIs de proveedores frontera en precisión, latencia, coste, exposición de privacidad y volumen de equilibrio del retorno de la inversión. Se distribuye con licencia Apache-2.0 y formato safetensors, y puede cargarse con la librería `peft`.

Su relevancia es doble: por un lado, sirve como plantilla reproducible de ajuste QLoRA para tareas de extracción de información en entornos empresariales; por otro, es un ejemplo explícito de mala praxis en evaluación, ya que el propio autor advierte de que la métrica publicada (F1 de entidad de 0,6267) no es una medición válida porque el arnés de evaluación original puntuaba por solapamiento de tokens en lugar de decodificar etiquetas BIO. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral-7B-v0.3) con adaptador LoRA sobre las proyecciones de atención `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Parametros totales | 7 250 millones en el modelo base; el adaptador ocupa 0,1 GB en el repositorio |
| Longitud de contexto | 32 768 tokens según el modelo base Mistral-7B-v0.3 (no declarado en la model card del adaptador); el entrenamiento usó secuencias de 512 tokens |
| Tipos de cuantizacion | Adaptador entrenado con QLoRA 4-bit NF4 con doble cuantización; no se publican versiones GGUF, AWQ ni GPTQ del adaptador |
| Idiomas soportados | Inglés (corpus de entrenamiento CoNLL-2003 English); no declarados en los metadatos de HuggingFace |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-v0.3, un transformer decoder-only con atención de ventana deslizante, y se limita a las cuatro proyecciones de atención del bloque de self-attention. La configuración LoRA es rango 16, alpha 32 y dropout 0,05. El ajuste se hizo con QLoRA en 4 bits NF4 con doble cuantización, lo que reduce el consumo de memoria del modelo base durante el entrenamiento; el adaptador resultante se guarda en precisión completa y se reaplica en inferencia sobre el modelo base.

Los datos de entrenamiento provienen de CoNLL-2003 en inglés (`eriktks/conll2003`), con 5 000 ejemplos de los que 500 se reservaron para seleccionar el checkpoint. La receta de optimización es AdamW con tasa de aprendizaje 2e-4, programación coseno, 3 % de warmup, 3 épocas, tamaño de lote efectivo 16 (2 × 8 con acumulación de gradientes) y semilla 42. No se aplicó RLHF ni DPO: es un ajuste supervisado puro sobre un modelo base sin instrucciones, no sobre una versión `-Instruct`. El autor señala explícitamente que cualquier déficit de rendimiento es atribuible conjuntamente al modelo base y a la adaptación en 4 bits, sin que el diseño permita separar ambos factores.

La innovación destacable no es técnica sino metodológica: el adaptador se publica para que terceros puedan reproducir el benchmark empresarial de la tesis. El prompt de entrenamiento y de inferencia es fijo: `Extract named entities (PER=person, ORG=organisation, LOC=location, MISC=miscellaneous) from this text: {text}` seguido de `Entities:`.

## Capacidades

- Extracción de entidades nombradas en inglés: etiqueta personas (PER), organizaciones (ORG), localizaciones (LOC) y miscelánea (MISC) en formato BIO a partir de una frase de entrada.
- Generación de texto limitada a ese formato de salida concreto, condicionada por la plantilla de prompt fija; no se comporta como asistente conversacional.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del inglés del corpus de entrenamiento.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni modalidad adicional alguna.
- No se ha verificado su adherencia a instrucciones generales, ya que deriva de un modelo base sin ajuste por instrucciones.

## Casos de uso

- Extracción de entidades en documentos empresariales: el adaptador puede aplicarse a contratos, facturas o informes en inglés para poblar campos estructurados de personas y organizaciones, siempre que se revalide antes la métrica con el arnés corregido indicado por el autor.
- Construcción de grafos de conocimiento y preprocesado para RAG: las entidades extraídas pueden alimentar un índice de relaciones entre personas y organizaciones usado para recuperar contexto en un sistema de recuperación aumentada.
- Detección de datos personales antes de enviar texto a APIs externas: el etiquetado PER/LOC permite anonimizar o enmascarar menciones antes de que el texto salga del perímetro de la organización, uno de los ejes de medición de la tesis (exposición de privacidad).
- Enrutado automático de tickets de soporte: extraer la organización y la persona mencionadas en un correo entrante para asignar el caso al equipo o a la cuenta correspondiente.
- Monitorización de medios y análisis de noticias: procesar titulares y cuerpos de artículo en inglés para seguir menciones de empresas y cargos públicos a lo largo del tiempo.
- Reproducción y auditoría del benchmark de la tesis: el repositorio y la matriz de resultados permiten verificar las cifras de precisión, latencia y coste declaradas para esta celda concreta.
- Plantilla de receta QLoRA para dominios propios: la configuración de hiperparámetros publicada (rango 16, alpha 32, 4 bits NF4, 3 épocas) sirve como punto de partida para ajustar NER sobre corpus internos, con la advertencia de que los hiperparámetros se mantuvieron constantes para todas las celdas del benchmark y no se optimizaron por tarea.
- Verificación de cumplimiento documental: revisar que en un lote de documentos aparecen las entidades contractuales esperadas, como paso de control de calidad previo a una revisión humana.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| F1 a nivel de entidad (media por frase) | 0,6267 | El propio autor indica que **no es una medición válida**: es un marcador de posición de la primera pasada de evaluación, pendiente de reevaluación con el arnés corregido |
| Latencia media, lote de tamano 1 | 1102 ms | Una NVIDIA H200 (141 GB), utilización completa; excluye tránsito de red |
| Coste por 1 millón de tokens generados | 19,09 USD | Precio imputado de 3,99 USD por GPU-hora |
| Ejemplos de evaluacion | 200 instancias reservadas | El tamaño muestral acota los efectos detectables en torno a diez puntos porcentuales |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general para este adaptador. El autor advierte además de que las puntuaciones no son comparables entre tareas del benchmark, porque cada tarea lleva su propia métrica, y de que los corpus de evaluación son benchmarks públicos longevos que probablemente forman parte de los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB, pero requiere cargar el modelo base Mistral-7B-v0.3 completo (7 250 millones de parámetros).
- VRAM estimada para el modelo base más el adaptador: en FP16, en torno a 15 GB de pesos más caché KV y activaciones; en cuantización de 8 bits, alrededor de 9 GB; en 4 bits NF4, alrededor de 5-6 GB. Son estimaciones derivadas del tamaño del modelo, no cifras publicadas por el autor.
- GPU de referencia usada en la medición: NVIDIA H200 de 141 GB, con una latencia media de 1102 ms por petición en lote de tamaño 1.
- GPU profesionales compatibles: A100 (40/80 GB), H100, H200. Para el modelo en 4 u 8 bits bastan GPU de 24 GB.
- Cabe en GPU de consumo con cuantización: RTX 4090 o RTX 3090 (24 GB) en 8 o 4 bits; en 4 bits también cabe en tarjetas de 16 GB como la RTX 4080, con margen reducido para el contexto.
- Opciones de despliegue: `transformers` + `peft` (la vía documentada por el autor), vLLM o TGI cargando el adaptador LoRA sobre el modelo base, y llama.cpp u Ollama únicamente fusionando el adaptador con el modelo base y convirtiendo el resultado a GGUF, paso que el autor no documenta.
- Throughput y latencia en otros hardwares: no disponibles; el único dato publicado es la latencia de 1102 ms en H200 a lote 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento NER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yusifnuri/Mistral-7B-v0.3_ner | 7,25 B (base) + adaptador LoRA de 0,1 GB | 32 768 tokens (base) | F1 de entidad 0,6267, marcado como no válido por el autor | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| mistralai/Mistral-7B-v0.3 (modelo base, sin adaptador) | 7,25 B | 32 768 tokens | Sin especialización en NER | Apache-2.0 | HuggingFace |
| Otros adaptadores o modelos especializados en NER comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de cifras de benchmark de alternativas evaluadas con el mismo arnés, por lo que no es posible establecer una comparación de rendimiento cuantitativa. La comparación con el modelo base es estructural (mismos pesos, mismos parámetros, misma licencia) y la única diferencia medible es el adaptador de 0,1 GB.

## Limitaciones y advertencias

- La métrica publicada (F1 de entidad 0,6267) no es válida según el propio autor: en la primera pasada de evaluación la rama autoalojada se puntuó por solapamiento de tokens con la cadena de etiquetas entera, una cantidad dominada por la etiqueta mayoritaria `O` que mide imitación de formato, no extracción de entidades. El arnés ya se corrigió para decodificar BIO, pero esta celda no se ha reevaluado.
- El adaptador se entrenó una sola vez y con una sola semilla (42), de modo que las diferencias reportadas confunden calidad del modelo con varianza de inicialización.
- Está especializado en una única tarea sobre un único corpus público; no es un asistente de propósito general y no debe tratarse como tal.
- Deriva del modelo base sin ajuste por instrucciones, no de una versión `-Instruct`; cualquier déficit es atribuible conjuntamente al modelo y a la adaptación en 4 bits, sin que el diseño permita separarlos.
- Los corpus de evaluación son benchmarks públicos longevos que probablemente están presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluación usó 200 instancias retenidas, lo que acota los tamaños de efecto detectables en torno a diez puntos porcentuales.
- Idiomas: el adaptador solo se ha entrenado con CoNLL-2003 en inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- El dataset de entrenamiento (CoNLL-2003) está sujeto a los términos de Reuters y su redistribución es restringida; el adaptador en sí se libera bajo Apache-2.0, pero los datos subyacentes no.
- Riesgo de alucinación y de fuga de formato: al ser un modelo base ajustado solo para completar una plantilla concreta, fuera de ese formato la salida no está garantizada.
- Los hiperparámetros se mantuvieron constantes en todas las celdas del benchmark en lugar de ajustarse por tarea, por lo que las cifras representan una cota inferior conservadora y no el máximo alcanzable.

## Enlaces

- HuggingFace: https://huggingface.co/yusifnuri/Mistral-7B-v0.3_ner
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Repositorio de código, configuraciones y arnés de evaluación: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Análisis de coste por petición: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Dataset de entrenamiento: https://huggingface.co/datasets/eriktks/conll2003
- Cita de la tesis: Nuri, Yusif (2026), *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*, SRH University Hamburg.
- La búsqueda web no devolvió resultados relevantes para este modelo: los enlaces recuperados correspondían a un restaurante de Aveiro (Portugal) y no guardan relación con el adaptador.
