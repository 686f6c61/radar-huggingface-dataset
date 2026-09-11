# yusifnuri/Llama-3.2-3B-Instruct_financial_sentiment

## Resumen

El adaptador `yusifnuri/Llama-3.2-3B-Instruct_financial_sentiment` es un ajuste fino mediante LoRA sobre `meta-llama/Llama-3.2-3B-Instruct` (3.210 millones de parámetros) especializado en una única tarea empresarial: clasificar una frase financiera en inglés como negativa, neutra o positiva. Lo publica el autor Yusifnuri como artefacto de investigación asociado a su tesis de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg), cuyo objetivo es comparar modelos pequeños ajustados frente a APIs de proveedores frontera en precisión, latencia, coste, exposición de privacidad y volumen de equilibrio del retorno de la inversión.

El adaptador ocupa 0,1 GB, se distribuye en formato safetensors compatible con PEFT y requiere cargar el modelo base por separado. No es un asistente de propósito general: es un clasificador de tres clases construido sobre un modelo generativo, y su ficha es explícita al respecto. Su interés actual reside en que sirve como caso verificable de despliegue de un modelo pequeño especializado en un dominio regulado, con métricas medidas y publicadas.

La relevancia práctica viene acompañada de una restricción importante: el corpus de entrenamiento (Financial PhraseBank) está bajo licencia CC BY-NC-SA 3.0, de modo que el adaptador es un artefacto de investigación y no es desplegable comercialmente tal cual. El modelo base sí permite uso comercial bajo la Llama 3.2 Community Licence, sujeta a atribución y a un umbral de usuarios activos mensuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) con adaptador LoRA insertado en las proyecciones de atención |
| Parametros totales | 3.210 millones en el modelo base; el adaptador LoRA no declara recuento de parámetros (rango 16 sobre `q_proj`, `k_proj`, `v_proj`, `o_proj`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el adaptador se entrenó con longitud máxima de secuencia de 512 tokens |
| Tipos de cuantizacion | no disponible para el adaptador (pesos LoRA en safetensors); el modelo base admite las cuantizaciones habituales de la comunidad (GGUF, bitsandbytes de 8 y 4 bits, GPTQ/AWQ) |
| Idiomas soportados | no disponible en la ficha del adaptador; el modelo base declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | llama3.2 para el modelo base; corpus de entrenamiento CC BY-NC-SA 3.0 (no comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clásico de LoRA sobre un transformer decoder-only. Se configuró con rango 16, alpha 32 y dropout 0,05, aplicado a las cuatro proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). El entrenamiento usó AdamW con tasa de aprendizaje 2e-4, programación coseno y un 3 % de calentamiento, durante 3 épocas, con tamaño de lote efectivo 16 (4 x 4 de acumulación de gradientes) y longitud máxima de secuencia de 512 tokens. La semilla fue la 42. Los hiperparámetros se mantuvieron constantes en todas las celdas del benchmark, en lugar de ajustarse por modelo y tarea, por lo que el autor los describe como una cota inferior conservadora del rendimiento alcanzable.

El corpus es Financial PhraseBank en su variante AllAgree, con 5.000 ejemplos de entrenamiento y 500 reservados para la selección de checkpoint. No se menciona ningún uso de RLHF, DPO u otra fase de alineación adicional sobre el adaptador; la alineación conversacional procede del modelo base Instruct. La innovación técnica destacable no está en la arquitectura, sino en el diseño experimental: un arnés de evaluación común que mide precisión, latencia, coste por millón de tokens generados y coste por petición bajo condiciones homogéneas, con el fin de comparar el ajuste fino de modelos pequeños contra APIs comerciales. El formato de prompt esperado en inferencia es fijo y literal: `Classify the sentiment of this financial sentence (negative / neutral / positive): {text}` seguido de `Sentiment:`.

## Capacidades

- Clasificación de sentimiento financiero en tres clases (negativo, neutro, positivo) a partir de una frase en inglés.
- Generación de texto conversacional heredada del modelo base `Llama-3.2-3B-Instruct`.
- Seguimiento de un formato de prompt estricto, que es el que el adaptador vio durante el entrenamiento.
- El modelo base soporta tool calling y function calling, aunque el adaptador no fue entrenado para ello y su ficha no lo menciona.
- El modelo base declara capacidades multilingües en ocho idiomas; el adaptador no ha sido evaluado en ninguno de ellos y su corpus es monolingüe en inglés.
- No se declara soporte de visión, audio ni modo de razonamiento extendido (thinking mode).
- No se declara soporte explícito para agentes o razonamiento multi-paso; la tarea objetivo es de una sola pasada.

## Casos de uso

- Análisis de sentimiento de titulares financieros en tiempo real: el adaptador clasifica frases cortas en aproximadamente 468 ms por petición en lote de tamaño uno, lo que permite procesar flujos de noticias con una etapa de clasificación ligera antes de cualquier análisis más costoso.
- Monitorización de transcripciones de llamadas de resultados: al dividir la transcripción en frases y clasificarlas individualmente, se obtiene una serie temporal de sentimiento por trimestre; el coste declarado de 16,22 USD por millón de tokens generados hace viable el procesamiento por lotes de documentos extensos.
- Enrutado de alertas de riesgo en mesas de análisis: las frases clasificadas como negativas pueden dirigirse a una cola de revisión humana, mientras que las neutras y positivas se archivan de forma automática.
- Filtrado previo para modelos mayores: usar este adaptador como clasificador de primera etapa reduce el número de llamadas a APIs frontera, que es precisamente el eje del benchmark de coste de la tesis.
- Etiquetado asistido de corpus propios en investigación académica: con anotaciones propias o con corpus debidamente licenciados, el adaptador puede preetiquetar y reducir el esfuerzo de anotación manual, siempre dentro del marco no comercial de la licencia del corpus original.
- Reproducción y verificación del benchmark de la tesis: el adaptador se publica explícitamente para que un tercero pueda reproducir las cifras de precisión, latencia y coste con el arnés disponible en el repositorio.
- Análisis de sentimiento en foros y redes sociales financieras: las frases cortas y coloquiales encajan con la longitud de entrenamiento de 512 tokens, aunque la distribución del lenguaje informal no está cubierta por Financial PhraseBank y el rendimiento fuera de dominio no está medido.
- Docencia y experimentación con LoRA: sirve como ejemplo mínimo y reproducible de adaptación de un modelo de 3.000 millones de parámetros a una tarea empresarial concreta, con todos los hiperparámetros publicados.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la propia model card, medidos en una única NVIDIA H200 (141 GB) con lote de tamaño uno y a plena utilización, con un coste imputado de 3,99 USD por hora de GPU. La latencia excluye el tránsito de red y la evaluación se realizó el 5 de julio de 2026.

| Metrica | Valor |
|---|---|
| Precision (accuracy) | 0,76 |
| Latencia media, lote 1 | 468 ms |
| Coste por millón de tokens generados | 16,22 USD |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible. El autor advierte además que las puntuaciones no son comparables entre tareas, porque cada tarea del benchmark usa su propia métrica, y que la matriz completa está en `results/benchmark_matrix.csv` del repositorio. Los datos de los modelos frontera con los que se compara no están incluidos en la información proporcionada.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB y puede residir en CPU o en cualquier GPU con unos pocos cientos de megabytes libres.
- El coste real de inferencia lo determina el modelo base de 3,21 mil millones de parámetros: en bf16/fp16 se estiman en torno a 6,5-7 GB solo de pesos, más caché KV y sobrecarga, lo que en la práctica sitúa el total alrededor de 8 GB.
- En cuantización de 8 bits se estiman unos 3,5-4 GB de pesos; en 4 bits, alrededor de 2,5-3 GB.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores, así como en cualquier GPU de 8 GB o más si se usa cuantización de 4 bits.
- GPU profesionales recomendadas: la medición oficial se hizo en una NVIDIA H200 de 141 GB, pero para esta carga es sobredimensionada; una A100, L40S o RTX 4090 es suficiente.
- Opciones de despliegue: `transformers` + `peft` (el camino documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, o llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia: 468 ms de media por petición con lote de tamaño uno en H200, sin contar red. El rendimiento (throughput) en lote no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Llama-3.2-3B-Instruct) | 3.210 M (base) | 128.000 tokens (base); entrenado a 512 | 0,76 | llama3.2 en el base; corpus CC BY-NC-SA 3.0 | HuggingFace, requiere el modelo base con acceso concedido |
| `meta-llama/Llama-3.2-3B-Instruct` sin adaptar | 3.210 M | 128.000 tokens | no disponible | llama3.2 | HuggingFace, acceso con aceptación de condiciones |
| FinBERT (modelo tipo BERT para finanzas) | del orden de 110 M | 512 tokens | no disponible | variable segun variante | HuggingFace |
| APIs de proveedores frontera incluidas en la tesis | no disponible | no disponible | no disponible en la informacion proporcionada | comercial | servicios de pago |

La comparación cuantitativa con las alternativas no puede completarse con los datos disponibles: la matriz del benchmark que incluye a los modelos frontera está enlazada en el repositorio, pero sus cifras no forman parte de la información proporcionada.

## Limitaciones y advertencias

- Licencia del corpus: Financial PhraseBank se distribuye bajo CC BY-NC-SA 3.0, por lo que el adaptador es un artefacto de investigación y no es desplegable comercialmente sin un corpus con licencia adecuada o anotaciones propias.
- Licencia del modelo base: la Llama 3.2 Community Licence permite uso comercial, pero lo condiciona a atribución, a una convención de nombres para modelos derivados y a un umbral de usuarios activos mensuales que conviene verificar antes de adoptarlo.
- Sesgo de dominio: está especializado en una única tarea sobre un único corpus público; no es un asistente de propósito general y no debe tratarse como tal.
- Sesgo de inicialización: se entrenó una sola vez con una única semilla, de modo que las diferencias reportadas frente a otros modelos confunden calidad con varianza de inicialización.
- Contaminación de benchmarks: los corpus de evaluación son benchmarks públicos de larga trayectoria y es plausible que formen parte de los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- Potencia estadística limitada: la evaluación usó 200 instancias reservadas (y los 164 problemas completos en generación de código), de modo que el tamaño de efecto detectable queda acotado en torno a diez puntos porcentuales.
- Sensibilidad al formato: el adaptador espera un prompt literal concreto; alterar la plantilla puede degradar la clasificación sin aviso.
- Riesgo de salida fuera de etiqueta: al construirse sobre un modelo generativo, la salida puede ser texto libre distinto de las tres etiquetas previstas, por lo que en producción conviene validar y restringir la decodificación.
- Cobertura lingüística: no hay evaluación multilingüe; el entrenamiento fue monolingüe en inglés y no se puede asumir el comportamiento en otros idiomas.
- Longitud: el adaptador se entrenó con secuencias de hasta 512 tokens, por debajo de la ventana de 128.000 tokens del modelo base; frases muy largas quedan fuera de las condiciones de entrenamiento.
- Cifras de coste y latencia dependientes del hardware: los 16,22 USD por millón de tokens y los 468 ms corresponden a una H200 con un precio imputado de 3,99 USD por hora, por lo que no son extrapolables directamente a otros entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/Llama-3.2-3B-Instruct_financial_sentiment
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Codigo, configuraciones y arnes de evaluacion: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Analisis de coste por peticion: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Cita de la tesis: Nuri, Yusif (2026), *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*, SRH University Hamburg.
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos (grupos y foros sobre el F-104G belga) no guardan relacion con el contenido de esta ficha.
