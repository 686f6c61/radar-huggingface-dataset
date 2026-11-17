# wyqdf/DeepTaxon-Tri-JevAny-Qwen3.5-4B-Public-Experiments

## Resumen

DeepTaxon-Tri-JevAny-Qwen3.5-4B-Public-Experiments es un conjunto de adaptadores LoRA de investigación publicados por el usuario wyqdf sobre el modelo base Qwen/Qwen3.5-4B. El repositorio no contiene un modelo entrenado final, sino los artefactos de tres ejecuciones experimentales activas orientadas a clasificación de imágenes en el dominio de la biología (taxonomía de especies). El pipeline declarado en Hugging Face es `image-classification`, aunque el adaptador se monta sobre un modelo de lenguaje, lo que sugiere un uso multimodal o una formulación del problema taxonómico como tarea de selección sobre representaciones del LLM.

El interés del repositorio es metodológico más que de producto: documenta con detalle el diseño de muestreo, el emparejamiento de candidatos A/B, la construcción de pools de referencias y la reproducibilidad de las ejecuciones (checkpoints con estado de optimizador, scheduler y RNG de cuatro rangos). El autor declara explícitamente que no reclama ninguna mejora antes de la evaluación, por lo que se trata de material de investigación en curso.

El tamaño del repositorio (16,5 GB) corresponde fundamentalmente a checkpoints intermedios y segmentos de entrenamiento, no a pesos consolidados de un modelo final. La licencia no está especificada y no se declaran idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r8) sobre transformer Qwen/Qwen3.5-4B, con tensores "Pointer256" adicionales |
| Parametros totales | No disponible (el adaptador es de rango 8; el modelo base declara 4B en su nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA con rango 8 sobre el modelo base Qwen/Qwen3.5-4B, complementado con tensores denominados "Pointer256". Cada ejecución parte de un adaptador nuevo, un Pointer256 nuevo y un optimizador Adam nuevo. El pipeline declarado es clasificación de imágenes, con entrada de píxeles originales (padding solo a derecha e inferior) y siete niveles taxonómicos.

El entrenamiento se realizó sobre 60.190 presentaciones de entrenamiento y 3.068 presentaciones "Unknown", con 20 lotes y 957 actualizaciones del optimizador, evaluando sobre 1.888 preguntas Dev clasificadas. Se comparan tres configuraciones: `native-ranked` (todas las imágenes antes del texto de estado), `interleaved-control` (query, taxonomía A y referencias, taxonomía B y referencias) y `top1top2-top12refs` (mismo prefijo de todas las imágenes, con verdad de rango 1 y rango 2 presentadas 27.027 veces cada una y referencias de rango 2 muestreadas de forma independiente en cada ocurrencia). La ejecución activa es `cuda-meeting-4b-top1top2-top12refs-fresh20pct-20261108`.

El diseño de muestreo es notablemente detallado: para cada ocurrencia de rango 2 se construye un pool con las hasta 12 imágenes de Train más similares según características congeladas, se baraja de forma determinista y se toman `min(8, pool_size)` referencias. Las 27.027 presentaciones de rango 2 generan 26.917 vistas ordenadas distintas y 25.498 conjuntos no ordenados distintos. Los checkpoints se guardan cada 1.800 segundos y en fronteras de lote, conservando adaptador, pointer, procesador, optimizador, scheduler, RNG de cuatro rangos y cursor de entrenamiento, con verificación de tamaños y hashes SHA256 o Git blob en la subida.

## Capacidades

- Clasificación taxonómica de imágenes en el dominio biológico, con siete niveles taxonómicos declarados.
- Selección entre candidatos rankeados A/B mediante comparación de taxonomías y pools de referencias.
- Manejo explícito de casos "Unknown" (3.068 presentaciones dedicadas).
- Procesamiento de imágenes en píxeles originales con padding a derecha e inferior.
- Reproducibilidad de ejecuciones mediante estado completo de entrenamiento (optimizador, scheduler, RNG).
- No se declaran capacidades de tool calling, agentes, generación de texto general, código, matemáticas, visión general ni audio.

## Casos de uso

- Investigación en clasificación taxonómica asistida por LLM: el adaptador permite evaluar si un modelo de lenguaje de 4B puede resolver tareas de identificación de especies cuando se le presentan imágenes y taxonomías candidatas, comparando configuraciones de entrada (prefijo de imágenes frente a intercalado).
- Reproducción de experimentos de muestreo: los artefactos permiten reanudar exactamente una ejecución gracias a la conservación de RNG de cuatro rangos y cursor de entrenamiento, útil para auditar resultados de ablación.
- Estudio de estrategias de referencias en few-shot visual: el diseño de pools de hasta 12 imágenes y selección de 8 referencias sirve como banco de pruebas para investigar cómo afecta la elección de ejemplos de referencia al rendimiento en clasificación fine-grained.
- Comparación de formatos de entrada multimodal: las tres configuraciones (native-ranked, interleaved-control, top1top2-top12refs) permiten medir el impacto de colocar todas las imágenes antes del texto frente a intercalarlas con las taxonomías.
- Análisis de calibración en preguntas Unknown: las 3.068 presentaciones Unknown y sus parejas permiten estudiar la tasa de falsos positivos al forzar una decisión taxonómica cuando la especie no está en el conjunto candidato.
- Base para fine-tuning posterior en dominios biológicos específicos: al ser un adaptador LoRA r8 sobre Qwen3.5-4B, puede servir como punto de partida para tareas de clasificación de imágenes en otros dominios con estructura de candidatos rankeados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama ninguna mejora antes de la evaluación y que las métricas de la ejecución anterior (`cuda-meeting-4b-top1top2-balanced-fresh20pct-20261108`) no deben combinarse con las de la nueva ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un adaptador LoRA sobre un modelo base de 4B, la VRAM vendrá determinada por el modelo base y por el procesamiento de imágenes (píxeles originales), no por el adaptador en sí.
- GPU recomendadas: no disponibles en la información proporcionada. El nombre de la ejecución activa (`cuda-meeting-4b-...`) sugiere entrenamiento en GPU CUDA, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Qwen3.5-4B y del pipeline de imágenes.
- Opciones de despliegue: el repositorio usa la librería `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni de modelos comparables de la misma categoría (clasificación taxonómica de imágenes sobre LLM), por lo que no es posible establecer una comparación cuantitativa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepTaxon-Tri-JevAny-Qwen3.5-4B | Adaptador LoRA r8 sobre base 4B | No disponible | No disponible | Hugging Face (wyqdf) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio contiene artefactos de investigación intermedios (checkpoints cada 1.800 segundos), no un modelo final consolidado ni evaluado.
- El autor declara explícitamente que no reclama ninguna mejora de rendimiento antes de la evaluación; no debe interpretarse como un modelo listo para producción.
- La licencia no está especificada, lo que impide determinar si se permite uso comercial. Además, la licencia del modelo base Qwen/Qwen3.5-4B condiciona cualquier uso derivado.
- No se declaran idiomas soportados; el dominio es biológico y la tarea, de clasificación de imágenes, no de generación multilingüe.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible. En tareas de clasificación fine-grained con opciones forzadas, el modelo puede asignar una especie incorrecta en lugar de responder "Unknown".
- El pipeline `image-classification` sobre un LLM implica una formulación no estándar; la validez de las salidas depende del formato exacto de entrada (prefijo de imágenes, taxonomías, referencias).
- Las métricas de la ejecución anterior detenida no son comparables con las de la ejecución activa y no deben combinarse.
- No se suben imágenes de entrenamiento ni credenciales; los checkpoints intermedios son artefactos de investigación sin garantía de reproducibilidad externa más allá de los estados guardados.
- El tamaño del repositorio (16,5 GB) y la ausencia de pesos consolidados dificultan su uso directo como modelo de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/wyqdf/DeepTaxon-Tri-JevAny-Qwen3.5-4B-Public-Experiments
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
