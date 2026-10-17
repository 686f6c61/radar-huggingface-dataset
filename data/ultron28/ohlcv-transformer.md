# Ultron28/ohlcv-transformer

## Resumen

Ultrón OHLCV Transformer es un modelo fundacional de series temporales financieras de 1.189.135.740 parámetros (1.189B), desarrollado por Suryaansh Prithvijit Singh (Ultron28). Su objetivo es procesar series de velas OHLCV (apertura, máximo, mínimo, cierre y volumen) a resolución de un minuto sobre acciones estadounidenses líquidas y generar, de forma conjunta, vectores de retorno esperado y probabilidades direccionales calibradas para múltiples horizontes temporales. Se posiciona como una alternativa a gran escala frente a los modelos académicos habituales de 10-50M de parámetros.

La arquitectura es un conformer: 20 bloques que intercalan atención con Grouped-Query Attention (GQA) y Rotary Position Embeddings (RoPE) con filtros de convolución separable en profundidad y redes feed-forward SwiGLU. Incorpora un tokenizador de inicio temporal (inception) multi-escala con ventanas solapadas de [3m, 7m, 15m, 31m, 63m, 127m] y una ventana de contexto de 2.048 minutos (unas 34,1 horas de negociación). El modelo se entrenó sobre el dataset mito0o852/OHLCV-1m, que abarca 14 años naturales continuos (2010-2023) repartidos en 168 fragmentos mensuales y aproximadamente 90 GB, reservando 2024, 2025 y 2026 como conjunto de test fuera de muestra.

Su relevancia radica en la escala y en la ambición de tratar el mercado como una variedad física multi-escala continua, con predicción conjunta de retorno y dirección en siete horizontes. No obstante, conviene interpretar con cautela sus métricas autoinformadas: el propio autor reporta precisiones direccionales que en algunos horizontes alcanzan el 100%, valores altamente improbables en mercados eficientes y que requieren validación externa independiente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (20 bloques) con GQA + RoPE, convolucion separable en profundidad y FFN SwiGLU; tokenizador temporal multi-escala (inception) |
| Parametros totales | 1.189.135.740 (1.189B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 minutos (aprox. 34,1 horas de negociacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles, para etiquetas/documentacion; la entrada es numerica OHLCV) |
| Licencia | apache-2.0 (segun metadatos y model card; una fuente de busqueda menciona mit, existe discrepancia) |
| Formato de pesos | PyTorch (library_name: pytorch); formato exacto de checkpoint (safetensors/bin) no confirmado |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura conformer de 20 bloques que combina auto-atención con GQA y RoPE con módulos convolucionales de filtros separables en profundidad, que aportan un sesgo inductivo de "momentum" temporal, y capas feed-forward SwiGLU. Antes del cuerpo del transformer, un tokenizador de inicio temporal (inception) aplica convoluciones 1D con múltiples tamaños de kernel (3, 7, 15, 31, 63 y 127 minutos) para capturar patrones multi-escala de forma solapada. La cabeza de salida es doble y multi-horizonte: una regresión Huber para el retorno esperado y una clasificación binaria calibrada (entropía cruzada binaria) para la dirección, evaluadas conjuntamente en los horizontes [1m, 3m, 5m, 10m, 15m, 30m, 60m].

El entrenamiento se realizó sobre datos OHLCV a un minuto de acciones estadounidenses líquidas (dataset mito0o852/OHLCV-1m), cubriendo 14 años naturales continuos (2010-2023, 168 fragmentos mensuales, ~90 GB) durante 3 épocas completas sobre hardware NVIDIA A100-SXM4-80GB. Los años 2024, 2025 y 2026 se reservaron estrictamente para pruebas fuera de muestra. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación, algo coherente con un modelo de predicción numérica y no de lenguaje. La model card menciona además una agenda de investigación de tres artículos (leyes de escala, alfa fuera de muestra e interpretabilidad mecanicista), aunque el contenido detallado no está disponible en el extracto.

## Capacidades

- Predicción de series temporales financieras: genera vectores de retorno esperado continuo (pérdida Huber) a partir de entradas OHLCV a un minuto.
- Clasificación direccional multi-horizonte: calcula probabilidad de subida/bajada en siete horizontes simultáneos (1, 3, 5, 10, 15, 30 y 60 minutos).
- Procesamiento multi-escala: captura dinámicas a lo largo de ventanas de 3 a 127 minutos mediante su tokenizador de convoluciones solapadas.
- Contexto intradía amplio: modela hasta 2.048 minutos, incluyendo dinámicas intradía y huecos nocturnos (overnight gaps).
- Entrada de datos numéricos: diseñado para series de precios y volumen, no para texto ni lenguaje natural.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (entrada numérica; metadatos de idioma en inglés).
- Capacidades de visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Investigación cuantitativa académica: servir como modelo fundacional de referencia para estudiar leyes de escala e inductores multi-escala en series temporales financieras, con posibilidad de evaluar transferencia fuera de muestra sobre 2024-2026.
- Señalización direccional intradía: generar probabilidades direccionales a 1-60 minutos para alimentar un motor de decisión de trading con gestión de riesgo propia, dado el horizonte multi-escala que ofrece.
- Modelado de microestructura de mercado: analizar cómo se comportan los filtros convolucionales y la atención sobre patrones de precio-volumen a nivel de minuto en acciones líquidas estadounidenses.
- Extracción de embeddings financieros: usar las representaciones internas del conformer como características para modelos posteriores (por ejemplo, modelos de riesgo o de asignación de cartera).
- Estudio de interpretabilidad mecanicista: investigar qué estructuras temporales y regímenes aprende el modelo, según la agenda de investigación declarada por el autor.
- Benchmarking de pipeline de datos: poner a prueba infraestructuras de ingesta y preprocesado de series temporales financieras a escala de 14 años y ~90 GB de datos OHLCV.
- Backtesting de estrategias con horizonte de minutos: validar hipótesis direccionales en un marco estrictamente fuera de muestra, siempre que se disponga de datos de test reservados e independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que además no aplican a este tipo de modelo. La model card reporta telemetría de entrenamiento autoinformada, no métricas de test independientes. Se reproduce a continuación tal como aparece, con la advertencia de que no está verificada externamente:

| Metrica (autoinformada) | Valor reportado |
|---|---|
| Perdida total (floor) | 0,3273 |
| Perdida direccional | 0,6545 (por debajo del umbral aleatorio 0,6931) |
| Precision direccional agregada | 58,9% - 69,6% |
| Precision a 1 minuto | 75,0% - 87,5% (pico reportado 100,0%) |
| Precision a 5 minutos | 62,5% - 75,0% (pico reportado 100,0%) |
| Precision a 15 minutos | 75,0% |
| Precision a 1 hora | 75,0% - 87,5% |
| Information Coefficient (IC) | > 0,15 (estimado) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 2,4 GB; en FP32, unos 4,8 GB; una hipotetica cuantizacion INT8 requeriria ~1,2 GB e INT4 ~0,6 GB, aunque no se documentan pesos cuantizados oficialmente.
- Memoria adicional: al procesar 2.048 pasos temporales con 20 bloques, el consumo de activaciones incrementa la VRAM necesaria por encima del peso puro; no se dispone de cifras oficiales.
- GPU de entrenamiento documentada: NVIDIA A100-SXM4-80GB (3 epocas).
- Cabida en GPU de consumo: por tamano de parametros (1.189B) es plausible que quepa en GPU de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB), pero no hay confirmacion oficial.
- Opciones de despliegue: al no ser un modelo de lenguaje, las pilas estandar tipo vLLM, llama.cpp, Ollama o TGI no son directamente aplicables; el despliegue se realizaria mediante PyTorch (library_name: pytorch).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables directos en la informacion proporcionada. La propia model card menciona como referencia cualitativa los modelos academicos tradicionales de 10M-50M de parametros (LSTM o transformers vanilla entrenados sobre un solo ticker durante 1-2 anos), frente a los cuales este modelo se presenta a una escala muy superior. Existen modelos fundacionales de series temporales genericas (por ejemplo, de la familia Chronos, TimesFM o Moirai), pero no son directamente comparables por tarea (prediccion financiera de microestructura a nivel de minuto) y no se dispone aqui de sus especificaciones verificadas para una tabla honesta.

| Aspecto | Ultrón OHLCV Transformer | Alternativas de la misma categoria |
|---|---|---|
| Parametros | 1.189B | no disponible |
| Contexto | 2.048 minutos | no disponible |
| Dominio | Microestructura financiera OHLCV 1m (renta variable EE. UU.) | no disponible |
| Licencia | apache-2.0 | no disponible |
| Disponibilidad | HuggingFace (0 descargas, 2 likes en el momento de la ficha) | no disponible |

## Limitaciones y advertencias

- Metricas autoinformadas y no verificadas: las precisiones direccionales reportadas, con picos del 100%, son altamente improbables en mercados con eficiencia semi-fuerte. Pueden deberse a fuga de informacion, sobreajuste o artefactos de evaluacion. No deben tomarse como evidencia de capacidad predictiva real.
- Riesgo financiero: cualquier uso para trading implica riesgo de perdida de capital. Un modelo de este tipo no garantiza rentabilidad y sus senales deben validarse con backtesting riguroso e independiente.
- Ambito reducido a acciones estadounidenses liquidas: los datos de entrenamiento se limitan a renta variable de EE. UU. a un minuto; el rendimiento en otros mercados, activos o temporalidades es incierto.
- Idiomas y modalidad: el modelo solo procesa series numericas OHLCV; no admite texto, vision ni audio.
- Discrepancia de licencia: los metadatos y la model card indican apache-2.0, mientras que una fuente de busqueda menciona licencia MIT. Debe confirmarse la licencia exacta en el repositorio antes de un uso comercial.
- Tamano de repositorio anomalo: el repositorio se lista con 2776 GB, muy por encima de los ~90 GB descritos para el dataset, lo que sugiere componentes no documentados y debe aclararse antes de su descarga.
- Adopcion practicamente nula: 0 descargas y 2 likes, sin validacion independiente ni comunidad. No se documentan cuantizaciones, formatos de pesos confirmados ni guias de despliegue.
- Sesgos potenciales: al entrenar exclusivamente con datos de mercado estadounidenses de 2010-2023, puede heredar sesgos de regimen de ese periodo y comportarse mal ante regimenes no vistos (por ejemplo, crisis atipicas posteriores).
- Sin documentacion de RLHF, DPO ni evaluacion de robustez ante cambios de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ultron28/ohlcv-transformer
- Repositorio GitHub: https://github.com/Ultron09/ohlcv-transformer
- Notebook Colab: https://colab.research.google.com/github/Ultron09/ohlcv-transformer/blob/main/OHLCV_Transformer_Colab.ipynb
- Dataset: https://huggingface.co/datasets/mito0o852/OHLCV-1m
- Perfil del autor en HuggingFace: https://huggingface.co/Ultron28
- Perfil del autor en GitHub: https://github.com/Ultron09
