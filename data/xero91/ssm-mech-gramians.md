# xero91/ssm-mech-gramians

## Resumen

`xero91/ssm-mech-gramians` no es un modelo generativo, sino un repositorio de artefactos de interpretabilidad: estadísticas de Gramian precalculadas, capa por capa, para cuatro checkpoints de la familia Mamba (`mamba-130m`, `mamba-370m`, `mamba-790m` y `mamba-2.8b`). Lo publica el usuario `xero91` y está pensado para consumirse junto con la librería `ssm-mech` (repositorio `omanshuthapliyal/ssm-interp`), que implementa el análisis de modos causales y la cirugía de bases balanceadas sobre modelos de espacio de estados.

El problema que resuelve es de coste computacional y reproducibilidad: estimar los Gramianos de las matrices A discretizadas requiere procesar cientos de miles de tokens de The Pile por capa y por modelo. Este repositorio entrega ese trabajo ya hecho —24 capas en el 130M, 48 en el 370M y el 790M, 64 en el 2.8B— en ficheros NPZ de aproximadamente 0,1 GB en total, de modo que un investigador puede pasar directamente al análisis sin repetir la fase de acumulación.

Es relevante ahora porque la interpretabilidad mecanicista de arquitecturas no transformer (SSM, híbridas) está mucho menos instrumentada que la de los transformers, y porque el autor publica además una métrica concreta, ETMFD, para cuantificar la variación de escalas temporales dependiente de la entrada en cada capa. El valor práctico del repositorio depende por completo de la librería cliente y de los checkpoints concretos para los que se generaron las estadísticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio contiene estadísticas (Gramianos, medias Welford, sumas de proyección B/C) sobre capas SSM de modelos Mamba, no pesos de un modelo |
| Parámetros totales | No aplica al repositorio; los modelos analizados son de 130M, 370M, 790M y 2,8B parámetros |
| Parámetros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (el repositorio no documenta la ventana de los checkpoints analizados) |
| Tipos de cuantización | No aplica; los ficheros NPZ almacenan estadísticas en coma flotante (el ejemplo de uso convierte `A_avg` a `float32`) |
| Idiomas soportados | No disponible; el corpus de estimación es The Pile (predominantemente inglés), pero no se documenta cobertura lingüística |
| Licencia | Apache 2.0 |
| Formato de pesos | NPZ de NumPy (`OnlineStats`: media y M2 de Welford de los autovalores de A discretizada, más sumas de proyección B/C), un fichero por capa |

Artefactos incluidos, según la model card:

| Modelo | Capas | Tokens por capa | Notas |
|---|---|---|---|
| `mamba-130m` | 24 | ~512K | Fusionado desde 2 shards |
| `mamba-370m` | 48 | ~922K | Fusionado desde 3 shards |
| `mamba-790m` | 48 | ~922K | Fusionado desde 3 shards |
| `mamba-2.8b` | 64 | ~205K | Fusionado desde 2 shards |

## Arquitectura y entrenamiento

No hay entrenamiento de un modelo en este repositorio. Lo que se describe en la model card es un procedimiento de estimación estadística: para cada capa de cada checkpoint Mamba se acumulan, mediante el algoritmo online de Welford, la media y el segundo momento central (M2) de los autovalores de la matriz A discretizada, junto con sumas de las proyecciones B y C. El resultado se serializa como un `OnlineStats` en NPZ con nombre `mamba-<tamano>/layer_<NNN>_stats.npz` (por ejemplo, `mamba-130m/layer_020_stats.npz`). La fusión de shards indica que el cómputo se paralelizó y luego se combinó, lo que es coherente con el uso de estadísticas acumulativas.

Sobre esas estadísticas, la librería `ssm-mech` calcula una realización balanceada: `balanced_eigvec(stats)` devuelve un tensor de forma `(d_inner, d_state, d_state)` con los autovectores de modo balanceados, que se empaquetan en un objeto `BalancedBasis` (capa, `model_id`, `V`, `A_avg`, `n_tokens`, `task_specific`, `etmfd`) y se pasan a `MambaAnalyzer.surgery()` para experimentos de ablación con `k` modos. La innovación metodológica destacable es ETMFD, una medida de variación de escala temporal dependiente de la entrada por capa: el autor indica que valores por encima de ~0,18 señalan dinámica LTV (linear time-varying) genuina, mientras que valores de ~0,11-0,13 en capas cercanas a la entrada son esperables en todos los tamaños por comportamiento casi LTI en profundidad somera. No se documentan detalles del dataset más allá de "The Pile", ni hiperparámetros de muestreo, ni semillas.

## Capacidades

- Cálculo de bases de modos balanceados por capa (`balanced_eigvec`) para los cuatro checkpoints Mamba cubiertos.
- Soporte de cirugía/ablación de modos sobre un `MambaAnalyzer`, con parámetro `k` para seleccionar cuántos modos se intervienen.
- Evaluación de experimentos de interpretabilidad sobre tareas definidas por el usuario; el ejemplo de la model card usa `task="ioi"` con `build_ioi(n=80)`.
- Métrica ETMFD por capa para discriminar régimen LTI frente a LTV.
- Reutilización de estadísticas acumuladas sin reprocesar el corpus (ahorro de la fase de estimación).
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo: no es un modelo de lenguaje desplegable.
- No incluye API de inferencia ni pipeline de HuggingFace (`pipeline: no disponible`).

## Casos de uso

- Interpretabilidad mecanicista de SSM: cargar las estadísticas de una capa concreta y obtener la base balanceada para inspeccionar los modos dominantes del estado, algo que en transformers se hace con herramientas tipo TransformerLens pero que en Mamba requiere este paso previo de Gramianos.
- Experimentos de ablación reproducibles: replicar el ejemplo de la model card (capa 20 de `mamba-130m`, `k=1`, tarea IOI con 80 prompts) sin recalcular estadísticas, lo que permite comparar resultados entre laboratorios sobre la misma base numérica.
- Estudio de la transición LTI-LTV con la profundidad: usar ETMFD por capa para localizar en qué punto de la red aparecen dinámicas dependientes de la entrada, con los umbrales ~0,18 y ~0,11-0,13 como referencia.
- Comparación entre escalas: contrastar los perfiles de ETMFD y de modos entre 130M, 370M, 790M y 2,8B; conviene tener en cuenta que el 2,8B solo acumula ~205K tokens por capa frente a los ~922K del 370M y el 790M, por lo que la comparación no es de igual potencia estadística.
- Auditoría de circuitos en modelos SSM pequeños: usar `mamba-130m` como banco de pruebas barato (24 capas) antes de trasladar una hipótesis al 2,8B.
- Docencia y formación interna: el coste de entrada es mínimo (0,1 GB de artefactos más la librería) y permite montar prácticas de interpretabilidad sobre SSM sin acceso a clúster.
- Base para investigación en compresión o poda de estado: los modos balanceados y sus autovalores son un punto de partida natural para estudiar qué dimensión de estado es prescindible, aunque el repositorio no incluye experimentos de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación de los checkpoints subyacentes; solo referencias a ETMFD como métrica descriptiva, con umbrales empíricos (~0,18 para LTV genuina; ~0,11-0,13 en capas de entrada) pero sin tabla de valores por capa o por modelo publicada en el repositorio.

## Requisitos de hardware

- Los artefactos en sí (0,1 GB de ficheros NPZ) se manejan en CPU sin problema; la carga y el cálculo de autovectores por capa son operaciones de álgebra lineal de tamaño `(d_inner, d_state, d_state)`.
- Para la fase de cirugía con `MambaAnalyzer` hay que instanciar el checkpoint Mamba correspondiente: estimación aritmética de pesos en bf16/fp16 a 2 bytes por parámetro, ~0,26 GB para el 130M, ~0,74 GB para el 370M, ~1,6 GB para el 790M y ~5,6 GB para el 2,8B, a lo que hay que sumar activaciones y el grafo de análisis.
- GPU: no hay datos publicados de latencia ni throughput. Por tamaño, los tres modelos pequeños caben en cualquier GPU consumer con 8-12 GB de VRAM; el 2,8B en fp16 es ajustado en tarjetas de 8 GB y cómodo en 16-24 GB (RTX 4090, A100, H100). No se dispone de cifras verificadas de rendimiento en A100/H100 para esta carga concreta.
- Opciones de despliegue: no aplica el serving habitual (vLLM, TGI, Ollama, llama.cpp no están soportados para este repositorio). El consumo es mediante `huggingface_hub.hf_hub_download` y la librería `ssm-mech`, sobre los checkpoints de `state-spaces` en formato HuggingFace (el ejemplo usa `state-spaces/mamba-130m-hf`).
- Almacenamiento: 0,1 GB para las estadísticas; adicionalmente el tamaño del checkpoint Mamba que se vaya a analizar.

## Comparativa con modelos similares

No se dispone de información sobre otros repositorios públicos de estadísticas de Gramian precalculadas para SSM, por lo que la comparación directa con alternativas equivalentes figura como no disponible. A modo de contexto, se comparan los cuatro checkpoints cubiertos por los artefactos:

| Modelo (checkpoint analizado) | Parámetros | Capas con estadísticas | Tokens por capa | Licencia del artefacto | Disponibilidad |
|---|---|---|---|---|---|
| `mamba-130m` | 130M | 24 | ~512K | Apache 2.0 | Incluido |
| `mamba-370m` | 370M | 48 | ~922K | Apache 2.0 | Incluido |
| `mamba-790m` | 790M | 48 | ~922K | Apache 2.0 | Incluido |
| `mamba-2.8b` | 2,8B | 64 | ~205K | Apache 2.0 | Incluido |

Herramientas de interpretabilidad de propósito general (TransformerLens, nnsight, SAELens) no ofrecen estadísticas equivalentes para SSM: están centradas en transformers, de modo que la comparación en parámetros, contexto y rendimiento no es aplicable. Cualquier comparación de rendimiento con esas librerías requeriría datos que no se han publicado.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni puede evaluarse con benchmarks de lenguaje. Cualquier uso que espere inferencia es un error de categoría.
- Dependencia dura de la librería `ssm-mech` y de la API concreta documentada (`OnlineStats`, `balanced_eigvec`, `BalancedBasis`, `MambaAnalyzer`); los nombres y firmas pueden cambiar y romper la compatibilidad.
- Cobertura limitada a cuatro checkpoints concretos de Mamba; no hay estadísticas para otras familias SSM ni para variantes posteriores.
- Presupuesto de tokens desigual: el 2,8B acumula ~205K tokens por capa frente a ~922K en el 370M y el 790M, lo que introduce un sesgo de estimación al comparar entre escalas.
- Corpus de estimación limitado a The Pile, con sobrerrepresentación del inglés; el comportamiento en otros idiomas o dominios no está caracterizado.
- Los umbrales de ETMFD (~0,18 para LTV; ~0,11-0,13 en capas someras) se presentan como observaciones empíricas del autor, sin validación publicada ni intervalos de confianza.
- No hay resultados de benchmarks, ni tests de fidelidad de las bases balanceadas, ni comparación con un baseline de referencia en la información disponible.
- Riesgo de sobreinterpretación: una cirugía con `k` modos puede degradar la tarea por razones ajenas al modo ablacionado; el repositorio no incluye controles documentados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son muy recientes (22 y 23 de octubre de 2026), por lo que no existe validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero se distribuye sin garantías; la licencia de los checkpoints Mamba subyacentes debe verificarse por separado antes de un uso en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xero91/ssm-mech-gramians
- Perfil del autor: https://huggingface.co/xero91
- Librería `ssm-mech` (repositorio de código): https://github.com/omanshuthapliyal/ssm-interp
- Checkpoint de referencia usado en el ejemplo: https://huggingface.co/state-spaces/mamba-130m-hf
- Organización de los checkpoints Mamba: https://huggingface.co/state-spaces
