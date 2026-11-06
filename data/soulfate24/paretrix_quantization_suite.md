# Soulfate24/Paretrix_Quantization_Suite

## Resumen

Paretrix Quantization Suite es una herramienta de cuantización para modelos de lenguaje en formato GGUF desarrollada por Soulfate24, publicada bajo licencia Apache 2.0. No se trata de un modelo de lenguaje en sí, sino de un pipeline empírico y consciente de las activaciones que planifica cuantizaciones híbridas por clase de tensor, en lugar de aplicar una única familia de bitwidth a toda la red. El suite se apoya en llama.cpp y en gguf-py, y produce ficheros GGUF con nombres del tipo `modelo-Paretrix-<Tier>-<XX>pc.gguf`, donde el porcentaje indica la banda de peso respecto al BF16 original.

La propuesta central es medir la respuesta del propio modelo a cada movimiento de cuantización: para cada clase de tensor se prueba cada tipo de cuantización partiendo de tres bases estándar (Q8_0, Q6_K-imx e IQ4_XS-imx) y se compara contra los logits en BF16. Con esas celdas medidas, un problema exacto de knapsack múltiple planifica cada escalón de la escalera Mod-3 (de 48 % a 21 % del peso original), y un duelo a régimen de veredicto (contexto 4096 × 8) decide si el plan sustituye al campeón vigente. La suite incluye además módulos de decodificación especulativa (draft) y soporte de visión en sus etiquetas.

El interés actual del proyecto reside en su enfoque de transferencia de conocimiento entre modelos de la misma familia: las celdas se almacenan en unidades de la sensibilidad σ del modelo, de modo que un checkpoint nuevo de una arquitectura conocida hereda las mediciones previas y solo mide las celdas que sus planes utilizan. El autor reporta 11 dominaciones estrictas de Pareto sobre las cuantizaciones estándar, aunque el repositorio no incluye benchmarks públicos verificables ni pesos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (suite de cuantización, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el régimen de veredicto usa ctx 4096 × 8) |
| Tipos de cuantizacion | Q8_0, Q6_K-imx, IQ4_XS-imx como bases; escalera de 8 niveles (48 %, 42 %, 36 %, 33 %, 30 %, 27 %, 24 %, 21 % del peso BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (entrada y salida); medición contra logits BF16 |

## Arquitectura y entrenamiento

La suite no entrena ningún modelo: opera sobre checkpoints GGUF existentes. Su arquitectura interna se organiza en torno a una escalera de ocho escalones (Fidelity 48 %, Precision 42 %, Quality 36 %, Compact 33 %, Mini 30 %, Nano 27 %, Pico 24 %, Femto 21 %), cada uno alineado a un múltiplo de 3 % del peso BF16 con una tolerancia de ±1,5 puntos porcentuales. Cada escalón se planifica desde Q8_0 y desde una base estándar dentro de un rango de ×0,85–1,10 de su peso, y se materializa mediante reutilización de tensores: solo se recuantizan los tensores que se mueven.

El motor mide, por clase de tensor, las celdas de cuantización y construye una envolvente convexa inferior en ambas direcciones (las ventas ahorran MiB, las compras los gastan). Las opciones alcanzan primero los tensores menos importantes según el orden de imatrix, y un knapsack múltiple exacto devuelve el KLD predicho mínimo bajo una ley de composición del tipo KLD − base ≈ b·Σ + e·(clases movidas). El veredicto de cada duelo se adopta con una ganancia de KLD de al menos max(0,001, 2 × el error estándar emparejado de los deltas por chunk); el peso solo decide cuando difiere al menos un 0,5 % del fichero, y PPL nunca entra en el veredicto. La matriz de conocimiento se organiza en tres niveles (caché del modelo, línea de familia por `model_type` y prior universal) y se compila con `Paretrix.py fold`.

## Capacidades

- Planificación de cuantizaciones híbridas GGUF por clase de tensor, con presupuesto de peso objetivo.
- Medición empírica de KLD frente a logits BF16 para cada celda de cuantización.
- Construcción de una escalera de ocho escalones con nombres que declaran su banda de peso.
- Duelos automáticos entre plan candidato y campeón vigente a contexto 4096 × 8, con criterio estadístico de adopción.
- Transferencia de conocimiento entre checkpoints de la misma arquitectura mediante celdas normalizadas en unidades σ.
- Soporte de módulos de decodificación especulativa (etiqueta `speculative-decoding`, `draft`).
- Soporte declarado de visión (etiqueta `vision`) y de ordenación por imatrix.
- Interfaz de línea de comandos con subcomandos `ladder`, `duel` y `fold`, incluyendo modo `--dry-run`.

## Casos de uso

- Compresión de modelos para despliegue en VRAM limitada: la escalera permite elegir un escalón (por ejemplo Mini al 30 %) pensado para modelos de 9B o más en 8 GB de VRAM, con una métrica de calidad (KLD y top-p) asociada a cada nivel.
- Archivado de alta fidelidad: el escalón Fidelity al 48 % está diseñado como tier de preservación, con KLD reportado de 0,0025 en el modelo de referencia OvisOCR3 (0,8B).
- Ajuste fino de modelos de código y matemáticas: el escalón Precision al 42 % se declara orientado a coding, matemáticas y razonamiento de alta entropía, donde la sensibilidad por clase de tensor es mayor.
- Reutilización de mediciones en una familia de modelos: al planificar un checkpoint nuevo de una arquitectura ya vista, la suite hereda la línea de familia y solo mide las celdas que sus planes ocupan, reduciendo el coste de calibración.
- Evaluación comparativa de estrategias de cuantización: el modo `duel` con `--adopt` permite contrastar un candidato contra el campeón con un criterio estadístico explícito antes de publicarlo.
- Integración en pipelines de publicación de GGUF: los subcomandos `ladder` y `fold` permiten automatizar la generación de variantes y la actualización de los JSON de familia y prior universal.
- Optimización de módulos draft para decodificación especulativa: la suite declara soporte de cuantización de módulos draft, útil para reducir el coste de memoria del modelo auxiliar.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los KLD del modelo de referencia OvisOCR3 (0,8B) por escalón:

| Tier | Ratio | KLD (OvisOCR3) |
|---|---:|---:|
| Fidelity | 48 % | 0,0025 |
| Precision | 42 % | 0,0048 |
| Quality | 36 % | 0,0152 |
| Compact | 33 % | 0,0310 |
| Mini | 30 % | 0,0544 |
| Nano | 27 % | 0,0849 |
| Pico | 24 % | 0,1702 |
| Femto | 21 % | 0,2947 |

El autor declara 11 dominaciones estrictas de Pareto, pero no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con cuantizaciones estándar en la información disponible.

## Requisitos de hardware

- No aplica VRAM de inferencia de un modelo concreto: el consumo depende del checkpoint de entrada y del escalón elegido.
- El autor indica que el escalón Mini (30 %) está pensado para modelos de 9B o más en 8 GB de VRAM.
- Para la fase de medición se requiere cargar el modelo en BF16 y comparar logits, por lo que la VRAM necesaria durante el proceso es la del checkpoint sin cuantizar.
- Motor de inferencia y medición: llama.cpp y gguf-py.
- No se especifican GPU recomendadas, latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Herramienta | Enfoque | Niveles | Licencia | Formato |
|---|---|---|---|---|
| Paretrix Quantization Suite | Cuantización híbrida por clase de tensor con knapsack y duelo KLD | 8 escalones (48 %–21 %) | Apache 2.0 | GGUF |
| Cuantización uniforme estándar (llama.cpp) | Una familia de bitwidth para toda la red | Q2–Q8, IQ series | MIT (llama.cpp) | GGUF |
| imatrix de llama.cpp | Ponderación por importancia de activaciones | Depende del tipo base | MIT | GGUF |

No se dispone de datos comparativos de rendimiento frente a estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni una model card de un LLM: es una suite de herramientas, por lo que no puede evaluarse como modelo generativo.
- Los valores de KLD publicados corresponden únicamente a OvisOCR3 (0,8B); no hay evidencia publicada de su comportamiento en modelos grandes.
- Las 11 dominaciones de Pareto son una afirmación del autor sin conjunto de evaluación reproducible en la información disponible.
- El criterio de veredicto excluye PPL de forma explícita; la calidad se juzga solo por KLD y top-p, lo que puede no reflejar degradaciones en tareas concretas.
- El régimen de veredicto está fijado a contexto 4096 × 8; el comportamiento fuera de ese régimen no está documentado.
- La transferencia entre familias se apoya en la observación de que las celdas FFN se parecen dentro del 10–20 % mientras la atención difiere ×3–5; no se garantiza para arquitecturas nuevas.
- No se declaran idiomas soportados ni sesgos, al no ser un modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial de la herramienta, pero no exime de verificar las licencias de los checkpoints sobre los que se aplique.

## Enlaces

- Hugging Face: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado (arxiv:2604.18556): no disponible en la información proporcionada
- Paper referenciado (arxiv:2605.00649): no disponible en la información proporcionada
