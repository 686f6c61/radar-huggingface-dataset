# youngseok12/AX-3.1-Light-sft_source_screen_71568_3000

## Resumen

El modelo `youngseok12/AX-3.1-Light-sft_source_screen_71568_3000` es un ajuste fino experimental del modelo base `skt/A.X-3.1-Light` (desarrollado por SKT), especializado en el cribado de fuentes numéricas en coreano. El autor, youngseok12, lo ha creado mediante LoRA SFT y posterior fusión del adaptador en el modelo base, dando como resultado un modelo standalone de 7.264 millones de parámetros listo para cargar con Transformers o vLLM.

El objetivo del modelo es medir el efecto del conjunto de datos AI Hub 71568 (숫자연산 기계독해 데이터, datos de lectura mecánica de operaciones numéricas) en tareas de comprensión de lectura numérica. Se entrenó exclusivamente con 3.000 ejemplos (1.500 económicos y 1.500 deportivos) que cubren cinco estratos de cálculo: suma/resta, operaciones de proporción, comparaciones cuantitativas/multilaterales, extracción de límites y extracción de pistas. El modelo responde en formato `정답: <valor>` (respuesta: <valor>) sin justificación generada.

La relevancia de este modelo reside en su naturaleza experimental: sirve como brazo de comparación controlada para evaluar el impacto de datos numéricos específicos en el rendimiento de modelos de lenguaje coreanos. No se han publicado resultados de benchmarks públicos, y el propio autor advierte de que puede producir respuestas incorrectas o no fundamentadas, por lo que no debe usarse como sustituto de asesoramiento profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformers decoder-only) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 (máximo usado en entrenamiento; el contexto del modelo base no está especificado) |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de `skt/A.X-3.1-Light`, que es un transformer causal de tipo Llama. No se modifica la arquitectura base; solo se aplica un ajuste fino con LoRA (rank 16, alpha 32, dropout 0.05) sobre los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las proyecciones feed-forward (`gate_proj`, `up_proj`, `down_proj`). El adaptador resultante se fusiona en el modelo base, de modo que el repositorio contiene el modelo completo sin necesidad de cargar adaptadores externos.

El entrenamiento se realizó con una sola época sobre 3.000 ejemplos del dataset AI Hub 71568, con 375 pasos de optimización, tasa de aprendizaje 5e-5, scheduler coseno con 3% de warmup, weight decay 0.01, tamaño de lote efectivo 8 (batch 1 con acumulación de gradientes 8) y longitud máxima de secuencia 2048. La precisión fue BF16 y se excluyeron las filas que excedían la longitud máxima en lugar de truncarlas. La pérdida final de entrenamiento fue 0.2903 y la pérdida de validación interna (dev) 0.3073. El total de tokens supervisados fue de 45.002, con una media de 15 tokens por ejemplo.

No se utilizaron datos de benchmarks públicos en el entrenamiento, y el autor no reclama ninguna puntuación pública para este repositorio. El modelo sigue la plantilla de chat del modelo base A.X.

## Capacidades

- Generación de texto en coreano con formato de chat (plantilla del base A.X).
- Comprensión de lectura numérica: extrae valores numéricos de artículos económicos y deportivos.
- Operaciones aritméticas simples (suma, resta) y de proporción.
- Comparación cuantitativa y multilateral de cantidades.
- Extracción de límites (máximos, mínimos, rangos) y de pistas contextuales.
- Respuesta en formato `정답: <valor>` (respuesta primero, sin razonamiento generado).
- No soporta tool calling, agentes, visión ni audio.
- Monolingüe: solo coreano.

## Casos de uso

- Investigación académica en comprensión de lectura numérica: el modelo sirve como brazo experimental para comparar el efecto de datos de AI Hub en modelos coreanos, permitiendo aislar variables en estudios controlados.
- Prototipos de extracción de datos financieros: dado un artículo económico en coreano, el modelo puede extraer cifras concretas (por ejemplo, variaciones porcentuales o valores absolutos) y devolverlas en formato estructurado `정답: <valor>`.
- Análisis deportivo automatizado: procesamiento de noticias deportivas para obtener estadísticas numéricas (resultados, comparaciones de rendimiento, límites de tiempo) de forma rápida.
- Evaluación de modelos de lenguaje coreanos: al ser un fine-tuning con un dataset pequeño y bien definido, puede usarse como punto de referencia para medir la influencia de la calidad de los datos en tareas numéricas.
- Generación de respuestas cortas para sistemas de pregunta-respuesta en coreano: cuando se necesita una respuesta directa y numérica sin explicación, el formato de salida simplifica la integración en pipelines posteriores.
- Control de calidad en pipelines de datos: dado que el entrenamiento excluyó duplicados y filas solapadas, el modelo puede usarse para validar si nuevos datos de AI Hub producen resultados consistentes con los esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación pública para este repositorio. La única evaluación reportada es la pérdida interna de validación (dev loss 0.3073) y una prueba de humo local que generó `정답: 3` para una pregunta numérica simple.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7.264 millones de parámetros en BF16, los pesos ocupan aproximadamente 14.5 GB. Con overhead de activaciones y memoria adicional, se recomienda al menos 16-20 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A10G (24 GB), A100 40 GB o superior. En GPUs con 16 GB (como RTX 4080 o A100 40 GB) podría caber con técnicas de offload, pero no se garantiza.
- No se ofrecen cuantizaciones alternativas (GGUF, INT8, etc.) en el repositorio; solo BF16.
- Despliegue: compatible con Transformers (carga directa con `AutoModelForCausalLM`) y vLLM estándar. No requiere código personalizado ni adaptadores.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 7B en BF16 en una GPU moderna, se espera una latencia de decodificación del orden de 20-40 ms/token y un throughput de 30-60 tokens/s en vLLM, pero estos valores son estimaciones generales no verificadas para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El único modelo comparable conocido es el propio `skt/A.X-3.1-Light` (base), pero no se han publicado métricas de rendimiento para este fine-tuning ni para el modelo base en tareas numéricas coreanas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental: el autor lo define como un brazo de cribado de fuentes para investigación y comparación controlada. No está pensado para uso en producción.
- Riesgo de alucinación numérica: puede producir respuestas incorrectas o no fundamentadas, especialmente en preguntas fuera del dominio de entrenamiento.
- Dominio limitado: solo entrenado con datos económicos y deportivos de un dataset específico; su rendimiento en otros dominios numéricos es desconocido.
- Contexto reducido: la longitud máxima de secuencia usada en entrenamiento es 2048, lo que limita el procesamiento de documentos largos.
- Monolingüe: solo soporta coreano; no ofrece capacidades multilingües.
- Sin benchmarks públicos: no hay evidencia objetiva de su rendimiento frente a otros modelos.
- Licencia: Apache 2.0, pero los términos del dataset AI Hub 71568 siguen aplicándose a los datos de entrenamiento, lo que puede restringir ciertos usos comerciales según las condiciones de AI Hub.
- Formato de respuesta fijo: el modelo está entrenado para responder con `정답: <valor>`; puede no adaptarse bien a otros formatos de salida sin ajuste adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/youngseok12/AX-3.1-Light-sft_source_screen_71568_3000
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Modelo relacionado (v0.21): https://huggingface.co/youngseok12/AX-3.1-Light-sft_v0_21_source_screen_numerical_300
- Modelo relacionado (v3.0): https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0
