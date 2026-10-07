# xieyunchang/Qwen3-0.6B-post-trained_piolit

## Resumen

El repositorio `xieyunchang/Qwen3-0.6B-post-trained_piolit` es un archivo de inferencia, no un modelo único cargable, publicado por el usuario xieyunchang sobre el modelo base Qwen/Qwen3-0.6B. Contiene siete instantáneas de inferencia procedentes de cuatro experimentos de post-entrenamiento distintos: dos ejecuciones de destilación on-policy (OPD) sobre Matemáticas, dos sobre el conjunto TACO, dos adaptadores LoRA de destilación on-policy auto-destilada (OPSD) y un adaptador LoRA de GRPO profundo. El profesor de la destilación OPD fue Qwen3-8B, pero solo se archiva el estudiante de 0,6 mil millones de parámetros.

El interés del repositorio es metodológico y de reproducibilidad: documenta con precisión los pasos de entrenamiento alcanzados, el formato de cada artefacto (pesos completos en FP32 o adaptadores LoRA en BF16), los hashes SHA256 y los tamaños de fichero, e indica explícitamente qué exportaciones quedaron incompletas y por qué. No se aplicó cuantización, conversión de precisión, mezcla de pesos ni entrenamiento adicional. Se trata, por tanto, de una instantánea de investigación con cero descargas y cero valoraciones en el momento de redactar esta ficha.

Por su tamaño (0,6 B de parámetros) y por el foco matemático de la mayoría de los experimentos, el material es relevante para quien estudia técnicas de destilación on-policy, LoRA y GRPO en modelos pequeños, o para quien quiere reproducir comparativas de entrenamiento sin depender de infraestructura grande. No es un modelo listo para producción ni viene acompañado de una model card de evaluación con resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, heredada del modelo base Qwen/Qwen3-0.6B (no se detallan hiperparámetros en la información proporcionada) |
| Parametros totales | 0,6 B (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Qwen3-0.6B declara contexto nativo extenso en su documentación oficial, pero este repositorio no lo confirma |
| Tipos de cuantizacion | ninguno incluido: pesos completos en FP32 y adaptadores LoRA en BF16, sin cuantización, conversión de precisión ni mezcla |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos completos FP32 y adaptadores LoRA BF16); el repositorio no incluye GGUF |
| Tamano del repositorio | 9,9 GB (agregado de las siete instantáneas) |
| Modelo base | Qwen/Qwen3-0.6B, revisión `c1899de289a04d12100db370d81485cdf75e47ca` |
| Fecha de creacion / actualizacion | 2026-10-06 / 2026-10-06 |

Instantáneas incluidas:

| Subcarpeta | Formato | Paso |
|---|---:|---:|
| `math-opd-8b/best-step100` | completo | 100 |
| `math-opd-8b/final-step339` | completo | 339 |
| `taco-opd-8b/provisional-best-step50` | completo | 50 |
| `taco-opd-8b/latest-saved-step124` | completo | 124 |
| `math-opsd-lora/best-step75` | LoRA | 75 |
| `math-opsd-lora/latest-saved-step175` | LoRA | 175 |
| `math-grpo-deep/final-step902` | LoRA | 902 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-0.6B, un transformer denso de tipo decoder-only con 0,6 B de parámetros. El repositorio no modifica la arquitectura: las instantáneas de tipo "completo" conservan los pesos originales en FP32 y los adaptadores LoRA conservan sus pesos originales en BF16. No hubo fusión de adaptadores sobre el modelo base, ni cuantización, ni conversión de precisión, ni entrenamiento adicional durante la exportación.

El entrenamiento documentado combina cuatro experimentos. Dos usan destilación on-policy (OPD) con Qwen3-8B como profesor: uno sobre Matemáticas, con instantáneas en los pasos 100 y 339, y otro sobre TACO, con instantáneas en los pasos 50 (provisional) y 124. Los otros dos producen adaptadores LoRA: un experimento de destilación on-policy auto-destilada (OPSD) sobre Matemáticas, con instantáneas en los pasos 75 y 175, y una ejecución de GRPO profundo con instantánea final en el paso 902. Conviene subrayar el estado real de cada ejecución: la instantánea TACO del paso 50 es provisional porque el protocolo de calificación de validación tiene limitaciones de cobertura de referencias sin resolver; el paso 124 es el último punto de control completo guardado y no el final de una ejecución de 339 pasos; no se guardó ninguna instantánea del paso 135; y la ejecución OPSD se detuvo en el paso 175 sin completar el presupuesto de entrenamiento previsto. Solo la ejecución GRPO completó su plan hasta el paso 902.

La evaluación experimental archivada se realizó con prompts sin modo de razonamiento (`enable_thinking=False`), decodificación voraz y un máximo de 2048 tokens generados. El propio autor advierte que los ejemplos de carga del repositorio no han sido verificados mediante una nueva ejecución de inferencia y que, para obtener resultados comparables, debe aplicarse el prompt original de cada tarea.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3-0.6B.
- Resolución de problemas matemáticos: es el eje de tres de los cuatro experimentos (destilación OPD sobre Matemáticas, destilación OPSD y GRPO profundo).
- Resolución de problemas tipo TACO (tareas de programación competitiva con verificación), aunque la instantánea asociada se marca como provisional por limitaciones del protocolo de calificación.
- Inferencia sin modo de razonamiento: la evaluación archivada se hizo con `enable_thinking=False`, de modo que el comportamiento validado es el de respuesta directa, no el de cadena de pensamiento extendida.
- Generación de código: no se documenta como capacidad evaluada en este repositorio más allá de la participación de TACO; no disponible como capacidad confirmada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles en la información proporcionada.
- Carga mediante `transformers` para las instantáneas completas y mediante `transformers` + `peft` para los adaptadores LoRA.

## Casos de uso

- Investigación en destilación on-policy: el repositorio ofrece instantáneas en distintos pasos de entrenamiento (100, 339, 50, 124) con un profesor Qwen3-8B, lo que permite estudiar la evolución de un estudiante de 0,6 B a lo largo del entrenamiento sin necesidad de reentrenar.
- Estudio comparado de métodos de post-entrenamiento: al incluir OPD, OPSD y GRPO sobre un mismo modelo base, permite contrastar tres familias de técnicas manteniendo fija la arquitectura del estudiante.
- Análisis del efecto del tamaño del adaptador: las instantáneas LoRA (pasos 75, 175 y 902) permiten medir cuánto del comportamiento matemático se captura en adaptadores de bajo rango frente a los pesos completos.
- Reproducción de evaluaciones con presupuesto estricto: la configuración archivada (sin modo thinking, decodificación voraz, máximo de 2048 tokens) sirve como protocolo de referencia para comparar variantes de forma controlada.
- Despliegue experimental en hardware muy limitado: con pesos completos FP32 de aproximadamente 2,4 GB, un estudiante de 0,6 B puede ejecutarse en CPU o en GPU de gama de entrada para pruebas de concepto y validación de prompts.
- Docencia y formación: el repositorio ilustra con detalle qué metadatos deben conservarse en una exportación de investigación (hashes SHA256, dtypes, pasos, rutas de origen, revisión del modelo base) y qué se pierde cuando se excluyen el optimizador, el scheduler, el estado del RNG y los fragmentos de DeepSpeed.
- Auditoría de integridad de artefactos: `manifest.json` registra tamaños, hashes y precisión de cada tensor, lo que permite verificar que los ficheros descargados coinciden con lo publicado.
- Base para comparativas de modelos pequeños: sirve como referencia de partida frente a otros modelos de menos de 1 B de parámetros en tareas matemáticas, siempre que se aplique el prompt original de cada tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe las condiciones de evaluación (prompts sin modo de razonamiento, decodificación voraz, máximo de 2048 tokens generados) pero no incluye cifras de MMLU, GSM8K, HumanEval, MATH ni de ningún otro conjunto, ni comparaciones numéricas con otros modelos.

Cabe señalar además que las instantáneas TACO no cuentan con una validación cerrada: el autor indica que el paso 50 es provisional por limitaciones de cobertura de referencias en el protocolo de calificación y que el paso 124 es simplemente el último punto de control completo guardado.

## Requisitos de hardware

- VRAM estimada para las instantáneas completas: en torno a 2,4 GB con pesos FP32 (0,6 B × 4 bytes) más el sobrecarga de activaciones y caché KV durante la generación; aproximadamente la mitad, unos 1,2 GB, si se convierte a BF16 y alrededor de 0,4-0,7 GB si se cuantiza a 8 o 4 bits. Estas cifras son estimaciones aritméticas a partir del número de parámetros, no mediciones publicadas en el repositorio.
- VRAM estimada para los adaptadores LoRA: el adaptador en sí ocupa muy poco espacio, pero requiere descargar y cargar por separado el modelo base Qwen3-0.6B en el mismo orden de magnitud de VRAM indicado arriba.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de memoria es suficiente para las instantáneas completas en FP32 con contexto moderado (GTX 1660 6 GB, RTX 3060, RTX 4060, T4, L4). Para BF16 o FP16 basta con 3-4 GB (RTX 3050, RTX 2060, Tesla T4). Con 8 bits o 4 bits el modelo cabe incluso en iGPU con memoria compartida.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años y en la mayoría de iGPU modernas, especialmente en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` para las instantáneas completas; `transformers` + `peft` con `PeftModel.from_pretrained` para los adaptadores LoRA. El repositorio no incluye ficheros GGUF, por lo que Ollama y llama.cpp requerirían una conversión previa por parte del usuario. `vLLM` y TGI son compatibles en principio con el formato safetensors, aunque no se documenta ninguna prueba realizada con ellos.
- Latencia y throughput estimados: no disponibles. El autor indica que los ejemplos de carga funcionan en CPU por defecto y que no han sido verificados con una ejecución de inferencia nueva.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de benchmarks de este repositorio, de modo que cualquier comparación de rendimiento sería especulativa. La tabla siguiente recoge únicamente características estructurales verificables y se limita a señalar el hueco en el que se sitúa el modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| xieyunchang/Qwen3-0.6B-post-trained_piolit | 0,6 B | no disponible | no disponible | repositorio de 9,9 GB con siete instantáneas, 0 descargas | no disponible |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible en esta información | no disponible en esta información | modelo público en HuggingFace | no disponible |
| Otros modelos de menos de 1 B de parámetros (por ejemplo, la familia Qwen2.5-0.5B o Llama-3.2-1B) | 0,5-1 B | no disponible | varía según modelo | públicos en HuggingFace | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio es un archivo, no un modelo único cargable: es obligatorio seleccionar una subcarpeta concreta mediante `allow_patterns` o descarga selectiva. Cargar la raíz del repositorio fallará.
- Los adaptadores LoRA requieren descargar aparte el modelo base `Qwen/Qwen3-0.6B` en la revisión `c1899de289a04d12100db370d81485cdf75e47ca`; usar otra revisión puede producir resultados distintos.
- Varias ejecuciones quedaron incompletas: la OPSD se detuvo en el paso 175 sin agotar su presupuesto, la OPD de TACO solo guardó hasta el paso 124 y no existe instantánea del paso 135, y la instantánea TACO del paso 50 es provisional por limitaciones sin resolver en el protocolo de calificación de validación.
- No se pueden reanudar los entrenamientos de forma exacta: el repositorio excluye optimizador, scheduler, estado del RNG, fragmentos de DeepSpeed, conjuntos de datos de entrenamiento y credenciales de autenticación.
- No hay datos de benchmarks publicados, por lo que se desconoce el rendimiento real en Matemáticas, TACO o cualquier otra tarea frente al modelo base o a alternativas de tamaño similar.
- No se declara licencia. Sin licencia explícita, el uso comercial y la redistribución quedan en una situación jurídica indeterminada; conviene consultar al autor antes de cualquier uso en producción.
- No se declaran idiomas soportados, sesgos conocidos ni evaluación de seguridad. Al derivar de Qwen3-0.6B, es razonable esperar las limitaciones propias de un modelo de 0,6 B (capacidad reducida de razonamiento, mayor propensión a errores en cadenas largas y mayor riesgo de alucinación que modelos de mayor tamaño), pero esto no está documentado en la información disponible.
- La evaluación archivada se realizó con `enable_thinking=False`, decodificación voraz y un máximo de 2048 tokens; aplicar prompts distintos o activar el modo de razonamiento puede degradar o alterar el comportamiento observado.
- Los ejemplos de carga del repositorio no han sido verificados mediante una nueva ejecución de inferencia según el propio autor.
- El modelo tiene 0 descargas y 0 valoraciones, y el nombre del repositorio contiene una errata aparente ("piolit"), lo que dificulta su descubrimiento y reduce la señal de fiabilidad.
- El tamaño del repositorio (9,9 GB) se debe a la acumulación de siete instantáneas; conviene descargar solo la subcarpeta necesaria para no consumir almacenamiento innecesario.
- No se incluye ninguna versión cuantizada ni ficheros GGUF, de modo que el despliegue en herramientas como Ollama o llama.cpp exige una conversión y validación adicionales por parte del usuario.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xieyunchang/Qwen3-0.6B-post-trained_piolit
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Revisión concreta del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Manifiesto de integridad: https://huggingface.co/xieyunchang/Qwen3-0.6B-post-trained_piolit/blob/main/manifest.json
- Paper, blog, repositorio de código o demo asociados: no disponible.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo, sus autores o sus experimentos. Las páginas devueltas por el buscador no guardan relación con el modelo ni con aprendizaje automático, por lo que se descartan.
