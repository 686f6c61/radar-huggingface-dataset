# VertexResearch/Vertex-Pico-v1

## Resumen

Vertex Pico v1 es un modelo de lenguaje base de 798.726 parámetros entrenado desde cero por Vertex Research. Se trata de la primera entrega de la serie Vertex Pico y está pensado exclusivamente para investigación y benchmarking de modelos de lenguaje de escala extrema. Su relevancia radica en que sirve como referencia reproducible para estudiar dinámicas de entrenamiento, tokenizadores y evaluación en el régimen de los sub-millones de parámetros, donde cada decisión de arquitectura pesa de forma desproporcionada.

La arquitectura es un transformer denso de 3 capas con anchura 128, 2 cabezas de atención, embeddings atados y RoPE. Emplea un tokenizador BPE a nivel de byte con un vocabulario de 3.072 tokens y una ventana de atención de 1.024 tokens con atención deslizante más allá de ese límite, hasta un máximo de 2.048 posiciones. El entrenamiento se realizó sobre aproximadamente 155 millones de tokens en una sola época.

No es un modelo apto para producción: no está ajustado a instrucciones y el propio autor advierte de que sus salidas son a menudo incoherentes y factualmente incorrectas. Su valor es comparativo y educativo, y se publica bajo licencia Apache 2.0 con pesos en safetensors y código personalizado que requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (3 capas, anchura 128, 2 cabezas, embeddings atados, RoPE) |
| Parametros totales | 798.726 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de atención de 1.024 tokens; hasta 2.048 posiciones con atención deslizante |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere código personalizado) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de solo 3 capas y anchura 128, con 2 cabezas de atención, embeddings atados y codificación posicional rotatoria (RoPE). El tokenizador es un BPE a nivel de byte con 3.072 tokens de vocabulario. La atención opera con una ventana de 1.024 tokens y, más allá de ese límite, utiliza atención deslizante hasta un máximo de 2.048 posiciones. No se documentan innovaciones como decodificación especulativa, atención lineal ni mecanismos híbridos SSM.

El entrenamiento se realizó desde cero sobre aproximadamente 155 millones de tokens en una única época. La mezcla de datos incluye ClimbMix, DCLM-Edu, FineWeb-Edu, UltraX, TxT360 QA, Wikipedia, WikiHow, FineMath, MegaMath QA y SciQ. Cabe destacar que ClimbMix está licenciado bajo CC-BY-NC 4.0, lo que introduce una restricción de uso no comercial sobre parte del corpus de entrenamiento. No se menciona en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva a partir de un prompt, en modo base (sin ajuste a instrucciones).
- Razonamiento elemental y respuesta a preguntas de opción múltiple evaluables con `lm-evaluation-harness` (HellaSwag, ARC, PIQA).
- Aritmética básica, evaluada con el script ArithMark-3.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Investigación sobre escalado en el régimen sub-millón: el modelo sirve como punto de partida reproducible para estudiar cómo varían las curvas de pérdida y las métricas de evaluación con 798.726 parámetros y 155 millones de tokens, y para contrastar decisiones de arquitectura (anchura, número de capas, tamaño de vocabulario).
- Benchmarking de pipelines de evaluación: al publicarse con resultados zero-shot sobre todos los ítems de cada conjunto (sin submuestreo) y con la fórmula del Intelligence Index de Open SLM Leaderboard, permite validar la reproducibilidad de harnesses de evaluación propios.
- Estudio de tokenizadores de vocabulario reducido: con un BPE de 3.072 tokens y nivel de byte, es útil para analizar el impacto del vocabulario en la eficiencia de compresión y en el rendimiento downstream en modelos diminutos.
- Docencia y divulgación: sirve para ilustrar de forma tangible el funcionamiento interno de un transformer (3 capas, 2 cabezas) en cursos y talleres, dado su reducido tamaño y su código accesible.
- Pruebas de infraestructura de despliegue: por su tamaño mínimo, es adecuado para validar pipelines de carga con `trust_remote_code=True`, integración con `transformers` y pruebas de humo en entornos de CI antes de escalar a modelos mayores.
- Análisis de procedencia y licencias de datos: la inclusión de ClimbMix (CC-BY-NC 4.0) junto a corpus permisivos lo convierte en un caso de estudio sobre cómo trazar y documentar restricciones de licencia en mezclas de entrenamiento.
- Comparativa de modelos ultrapequeños: permite situar alternativas como GPT-S-1.4M, Supra2-Nano o Sol-Milkshake en una misma tabla de evaluación con métricas homogéneas.

## Benchmarks y rendimiento

Resultados zero-shot en float32, evaluados sobre todos los ítems de cada conjunto (sin submuestreo). Mejor puntuación de cada columna en negrita, según la model card.

| Modelo | Params | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 | Intelligence Index |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Vertex Pico v1** | 0,80M | **27,49** | **32,03** | 21,59 | 54,24 | 28,30 | 4,68 |
| GPT-S-1.4M | 1,43M | 26,89 | 31,57 | 21,93 | **55,17** | 30,20 | **5,40** |
| Supra2-Nano | 0,80M | 26,81 | 30,81 | 20,65 | 53,43 | 29,00 | 3,76 |
| Sol-Milkshake | 2,99M | 25,02 | 29,76 | **22,70** | 52,50 | **30,60** | 3,16 |

Notas metodológicas de la model card: HellaSwag, ARC y PIQA se evalúan con `lm-evaluation-harness` usando `acc_norm`; ArithMark-3 con el script oficial; el Intelligence Index con la fórmula de Open SLM Leaderboard. Los resultados de los modelos comparados proceden del leaderboard, mientras que los de Vertex Pico v1 son evaluación propia del autor y están pendientes de verificación en el leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (798.726 parámetros, aproximadamente 3,2 MB de pesos) y del orden de decenas de megabytes contando activaciones y overhead del runtime; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria; el modelo no requiere A100, H100 ni RTX 4090. Funciona en GPUs de gama de entrada e incluso en CPU.
- Cabe en cualquier GPU de consumo, incluida la gama integrada y aceleradores de bajo consumo; también es viable en CPU para pruebas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la dependencia de código personalizado complica su integración en esos motores.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | HellaSwag | ARC-Challenge | PIQA | Licencia | Disponibilidad |
|:---|:---:|:---:|:---:|:---:|:---:|:---|:---|
| Vertex Pico v1 | 0,80M | 1.024 (hasta 2.048) | 27,49 | 21,59 | 54,24 | Apache 2.0 | Hugging Face |
| GPT-S-1.4M | 1,43M | No disponible | 26,89 | 21,93 | 55,17 | No disponible | Open SLM Leaderboard |
| Supra2-Nano | 0,80M | No disponible | 26,81 | 20,65 | 53,43 | No disponible | Open SLM Leaderboard |
| Sol-Milkshake | 2,99M | No disponible | 25,02 | 22,70 | 52,50 | No disponible | Open SLM Leaderboard |

Vertex Pico v1 lidera HellaSwag y ARC-Easy entre los cuatro, pero queda por detrás de GPT-S-1.4M en PIQA, ArithMark-3 e Intelligence Index (4,68 frente a 5,40). Frente a Supra2-Nano, con el mismo número de parámetros, obtiene mejores resultados en HellaSwag, ARC-Easy y PIQA, aunque pierde en ArithMark-3. Los datos de contexto, licencia y disponibilidad de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No está ajustado a instrucciones: es un modelo base, por lo que no sigue instrucciones ni mantiene formato conversacional.
- El autor advierte explícitamente de que sus salidas son a menudo incoherentes y factualmente incorrectas, y recomienda no usarlo para nada que importe.
- Riesgo elevado de alucinación: con 798.726 parámetros y 155 millones de tokens de entrenamiento, la capacidad de almacenar conocimiento factual es mínima.
- Ventana de contexto corta: 1.024 tokens de atención completa y hasta 2.048 posiciones con atención deslizante, insuficiente para tareas de contexto largo.
- Solo inglés; no se documenta soporte de otros idiomas.
- Restricción de licencia sobre los datos: aunque el modelo se publica bajo Apache 2.0, parte del corpus de entrenamiento (ClimbMix) está bajo CC-BY-NC 4.0, lo que puede condicionar el uso comercial y exige revisión legal antes de cualquier explotación.
- Dependencia de código personalizado (`trust_remote_code=True`), lo que implica ejecutar código del autor y limita la portabilidad a otros motores de inferencia.
- Resultados de benchmarks propios pendientes de verificación en el Open SLM Leaderboard; conviene tratarlos como provisionales.
- Sesgos conocidos: no documentados en la información proporcionada, si bien la mezcla de corpus web (FineWeb-Edu, DCLM-Edu, Wikipedia) arrastra los sesgos habituales de esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexResearch/Vertex-Pico-v1
- Open SLM Leaderboard (referencia de comparativas y fórmula del Intelligence Index): no disponible en la información proporcionada
- Paper o blog técnico de Vertex Research: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
