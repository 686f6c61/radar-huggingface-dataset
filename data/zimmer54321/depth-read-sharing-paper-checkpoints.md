# zimmer54321/depth-read-sharing-paper-checkpoints

## Resumen

Los checkpoints de "Depth-Read Sharing in Grouped-Query Attention" son una coleccion de 24 modelos de investigacion liberados por Zimu Zhao (usuario zimmer54321) como material reproducible de un articulo cientifico sobre mecanismos de atencion. El trabajo estudia como distintos patrones de comparticion de lecturas de profundidad (depth-read sharing) dentro de grupos fijos de Grouped-Query Attention (GQA) afectan al entrenamiento. Cada patron se entrena con tres semillas distintas (2026, 613 y 123), lo que da lugar a los 24 checkpoints publicados.

El modelo es un transformer decoder-only de 36 capas, anchura 1.280, FFN de 5.120, 16 cabezas de consulta y 8 cabezas clave-valor con anchura de cabeza 80. Todos los modelos se inicializan desde cero (no se usan pesos de Qwen, solo su tokenizador) y se detienen en la actualizacion 2.000 de un calendario original de 20.000 actualizaciones, por lo que son checkpoints de fase temprana de entrenamiento. El objetivo no es ofrecer un modelo listo para produccion, sino permitir la continuacion y verificacion del experimento.

La relevancia es fundamentalmente cientifica: permite reproducir y extender un estudio sobre variantes de atencion (MHAR, Multi-Head Attention Residuals) y sobre como la comparticion de lecturas entre consumidores de un grupo GQA (Q1, Q2, K, V) afecta a la perdida. La release esta marcada como "in progress" por el propio autor y no debe tratarse como un archivo de continuacion completo hasta verificar `RELEASE_STATUS.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention y Multi-Head Attention Residuals (MHAR), con patrones variables de depth-read sharing |
| Parametros totales | no disponible (derivables de 36 capas, anchura 1.280, FFN 5.120, 16 Q / 8 KV heads, head width 80) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16 nativo) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos y estados de entrenamiento); tokenizador Qwen3 bajo Apache-2.0 |
| Formato de pesos | safetensors; estado de entrenamiento en `training-state.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 36 capas, anchura de 1.280 y FFN de 5.120. La atencion es Grouped-Query Attention con 16 cabezas de consulta y 8 cabezas clave-valor (ratio 2:1), head width 80. Sobre esta base se aplica el mecanismo Multi-Head Attention Residuals (MHAR), heredado del trabajo de Cheng Luo, Zefan Cai y Junjie Hu. La innovacion central del articulo consiste en variar que consumidores dentro de cada grupo GQA comparten las lecturas de profundidad (residual depth reads), en orden `(Q1, Q2, K, V)`. Se definen ocho patrones: AAAA (todos comparten), AAAB, AABC, ABBC, ABAA, AABA, AABB y ABBA, donde cada letra identifica un grupo de consumidores que comparten lectura.

El entrenamiento usa AdamW nativo en BF16, microbatch 4, longitud de secuencia 1.024 y acumulacion de 8, sobre muestras fijas de FineWeb-Edu. Cada ejecucion procesa 65.536.000 posiciones de entrada y se detiene en la actualizacion 2.000 de un calendario de 20.000. El tokenizador procede de Qwen/Qwen3-0.6B, aunque los pesos de Qwen no se usan para inicializar. No se documentan fases de RLHF ni DPO; es entrenamiento de lenguaje autoregresivo puro. Los checkpoints preservan el estado completo de entrenamiento (momentos de AdamW, contadores, scheduler, estados RNG y progreso de datos) para permitir continuacion fiel.

## Capacidades

- Generacion de texto autoregresiva en ingles, limitada por la longitud de contexto de 1.024 tokens.
- Razonamiento y generacion de codigo solo en la medida en que un modelo de fase temprana (2.000 actualizaciones) lo permite; el autor advierte explicitamente que estos resultados no establecen capacidad downstream general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de modo thinking, vision ni audio.
- Los checkpoints estan pensados como artefactos de investigacion para reproducir y extender el estudio de patrones de atencion, no como modelo de uso general.

## Casos de uso

- Reproduccion cientifica del articulo: cargar cada patron y semilla con las clases de referencia del repositorio de codigo para verificar las curvas de perdida reportadas y las comparaciones entre patrones AAAA, AAAB, AABC, etc.
- Extension del entrenamiento: usar `training-state.pt` para reanudar desde la actualizacion 2.000 y completar las 20.000 actualizaciones del calendario original, siempre que se aporten los datos adicionales y se declare un protocolo de continuacion.
- Estudio de variantes de atencion: comparar el efecto de distintos patrones de comparticion de lecturas de profundidad sobre la perdida de seguimiento en un regimen temprano controlado, con tres semillas por patron.
- Investigacion sobre GQA y MHAR: servir de base para analizar como la comparticion de consumidores dentro de grupos GQA interactua con los residuales de atencion multi-cabeza.
- Auditoria de integridad de checkpoints: verificar hashes del manifiesto y la presencia de ficheros como paso previo a cualquier carga, util en pipelines de validacion de artefactos cientificos.
- Docencia e investigacion en optimizacion: estudiar el comportamiento de AdamW en BF16 con acumulacion de gradiente y muestras fijas de FineWeb-Edu a pequena escala.
- Base para experimentos de eficiencia: analizar si determinados patrones de comparticion reducen coste de memoria o computo en atencion sin degradar la perdida en regimen temprano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta resultados internos del articulo: en este regimen temprano, todos los patrones multi-lectura probados tienen menor perdida media de seguimiento que AAAA; las dos puertas de promocion originales de ABBC fallaron, y AABC y ABBC no establecen una ventaja incremental consistente sobre AAAB. No se ofrecen cifras numericas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 51,8 GB e incluye 24 checkpoints mas estados de entrenamiento, por lo que un unico checkpoint es una fraccion de ese total. Para un modelo de 36 capas y anchura 1.280 en BF16, la estimacion orientativa es de decenas de GB, pero el dato exacto no se proporciona.
- GPU recomendadas: no disponible en la informacion. Por tamano, cabria esperar GPU de clase A100 o H100 para entrenamiento y continuacion; para inferencia de un solo checkpoint podria ser suficiente una GPU consumer de gama alta, pero no se confirma.
- Cabe en consumer GPU: no confirmado; depende del checkpoint individual y de la cuantizacion, que no esta documentada.
- Opciones de despliegue: los checkpoints no estan registrados como arquitecturas estandar de `AutoModelForCausalLM`; requieren las clases de referencia del repositorio de codigo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Depth-Read Sharing (este) | no disponible | 1.024 | MIT | Hugging Face, 24 checkpoints | Investigacion, fase temprana (2.000 updates) |
| Qwen3-0.6B (tokenizador usado) | ~0,6B | no disponible en esta ficha | Apache-2.0 | Hugging Face | Solo se comparte el tokenizador; los pesos no se usan |
| Modelos GQA estandar (p. ej. Llama, Mistral) | variable | variable | variable | Hugging Face | Arquitectura GQA convencional sin variacion de depth-read sharing |

La comparacion directa con modelos de produccion no es significativa: este release es un conjunto de checkpoints de investigacion en fase temprana, no un modelo entrenado para uso general. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Release en progreso: el autor indica que los pesos y la configuracion se estan copiando desde un espejo verificado y que la transferencia completa del estado de entrenamiento esta pendiente; hay que consultar `RELEASE_STATUS.json` antes de tratarlo como archivo de continuacion completo.
- Fase temprana: solo 2.000 de 20.000 actualizaciones; los resultados no establecen rankings convergidos ni capacidad downstream general.
- Puertas de promocion fallidas: las dos puertas originales de ABBC fallaron y AABC/ABBC no muestran ventaja consistente sobre AAAB.
- Equivalencia de driver: las ejecuciones de Stage-B usaron un driver distinto; el puente de paridad temprano no establece equivalencia a horizonte completo.
- No apto para produccion: es un artefacto cientifico, no un modelo de uso general; no se documentan tool calling, agentes ni capacidades multilingues.
- Contexto corto (1.024 tokens) e idioma limitado al ingles.
- Riesgo de alucinacion: inherente a modelos de lenguaje; no se documenta mitigacion.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento usa FineWeb-Edu, con los sesgos propios de ese corpus.
- Licencia: pesos y estados bajo MIT, pero los documentos crudos de FineWeb-Edu no se redistribuyen y conservan sus propios terminos; el tokenizador Qwen3 mantiene Apache-2.0.
- No se garantiza paridad numerica exacta entre hardware o runtime distintos.
- No se deben agrupar puntuaciones de artefactos de evaluacion distintos ni tratar varias puntuaciones de un mismo checkpoint como ejecuciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/zimmer54321/depth-read-sharing-paper-checkpoints
- Codigo del articulo y modelos evaluados: https://github.com/Zimmer061310/Depth-Read-Sharing-in-Grouped-Query-Attention
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador: https://huggingface.co/Qwen/Qwen3-0.6B
- arXiv: pendiente de anuncio, sin identificador asignado en la informacion disponible.
