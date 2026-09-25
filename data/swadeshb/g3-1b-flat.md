# swadeshb/g3-1b-flat

## Resumen

g3-1b-flat es un adaptador LoRA publicado por el usuario swadeshb (Swadesh B) sobre el modelo base google/gemma-3-1b-pt. Se trata de un artefacto de investigación, no de un modelo de producción: forma parte de un experimento controlado de SFT jerárquico (hierarchical-SFT) en el que se comparan distintas variantes de entrenamiento sobre el mismo conjunto de datos. La variante "flat" hace referencia al método de entrenamiento empleado, presumiblemente un esquema sin descomposición jerárquica del razonamiento, que actúa como línea base frente a otras variantes del mismo proyecto.

El adaptador se ha entrenado exclusivamente con el subconjunto MATH del dataset sxiong/MLR_structured_trajectory, con un rango LoRA r=16 y alpha=32, y una longitud máxima de entrenamiento de 8192 tokens. No se ha publicado información sobre licencia, idiomas soportados, pipeline de inferencia ni resultados de evaluación, y el repositorio registra 0 descargas y 0 "likes", lo que indica que es una publicación reciente y sin validación por parte de la comunidad.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para estudiar hasta qué punto la estructura jerárquica del dato de entrenamiento mejora el razonamiento matemático en modelos pequeños, y como punto de partida para experimentos de ablación sobre adaptadores LoRA de bajo rango en modelos de ~1B de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA acoplado; libreria PEFT |
| Parametros totales | ~1B en el modelo base (google/gemma-3-1b-pt); numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la longitud maxima de entrenamiento del adaptador es de 8192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el adaptador; el modelo base se distribuye bajo las condiciones de uso de Gemma |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Ranking LoRA (r) | 16 |
| LoRA alpha | 32 |
| Dataset de entrenamiento | sxiong/MLR_structured_trajectory (subconjunto MATH unicamente) |
| Metodo de entrenamiento | flat |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Libreria | peft |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

El adaptador se monta sobre google/gemma-3-1b-pt, un transformer decoder-only de aproximadamente 1000 millones de parametros de la familia Gemma 3 de Google. La intervencion consiste en un adaptador LoRA de rango 16 con alpha 32 (escala efectiva alpha/r = 2) entrenado mediante PEFT. No se especifican en la model card los modulos objetivo del adaptador (q_proj, k_proj, v_proj, o_proj, capas MLP), ni la precision de entrenamiento, ni el numero de pasos, epocas o tamano efectivo de batch.

El dato mas relevante es el metodo, etiquetado como "flat", dentro de un experimento de SFT jerarquico controlado que tambien menciona T5Gemma 2. Esto sugiere una comparacion entre una formulacion plana del razonamiento (entrada y salida directas) y formulaciones jerarquicas o descompuestas. El entrenamiento se limita al subconjunto MATH del dataset sxiong/MLR_structured_trajectory, con una longitud maxima de 8192 tokens. No hay informacion sobre uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre decodificacion especulativa u optimizaciones de atencion.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Gemma 3 1B.
- Razonamiento matematico: el adaptador se ha ajustado especificamente sobre el subconjunto MATH, por lo que su especialidad declarada es la resolucion de problemas matematicos.
- Razonamiento jerarquico: la etiqueta "hierarchical-reasoning" figura en el repositorio, si bien esta variante concreta corresponde al metodo "flat", es decir, la contraparte no jerarquica del experimento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el metodo "flat" sugiere precisamente un enfoque sin descomposicion multi-paso explicita.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Gemma 3 1B es, segun su propia documentacion, un modelo de texto, por lo que no cabe esperar vision en este adaptador.

## Casos de uso

- Linea base en experimentos de ablacion de razonamiento jerarquico: el adaptador sirve como referencia "flat" frente a variantes jerarquicas del mismo proyecto, entrenadas sobre el mismo dataset y con la misma configuracion LoRA. Es su uso principal y mas solido.
- Reproducibilidad de resultados de SFT: al estar publicados el dataset, el ranking LoRA y la longitud de entrenamiento, permite a otros investigadores replicar la configuracion sobre gemma-3-1b-pt y verificar diferencias entre metodos.
- Estudio del efecto de la estructura del dato: comparar el rendimiento en MATH de este adaptador frente a adaptadores entrenados con trayectorias estructuradas permite aislar la contribucion del formato de la trayectoria al resultado final.
- Prototipado de tutoria matematica ligera: sobre una GPU de consumo o incluso CPU, el modelo fusionado puede desplegarse para generar explicaciones paso a paso de problemas de nivel MATH, con la advertencia de que no hay evaluacion publicada que respalde su calidad.
- Generacion de datos sinteticos de razonamiento: puede emplearse para producir borradores de soluciones matematicas que luego se filtren o corrijan, aprovechando su ajuste sobre trayectorias de MATH.
- Despliegue en entornos con recursos muy limitados: al tratarse de un adaptador sobre un modelo de ~1B, el conjunto fusionado cabe en GPUs de gama baja y en hardware de borde, lo que facilita pruebas de concepto sin infraestructura dedicada.
- Investigacion sobre adaptadores de bajo rango: permite estudiar el comportamiento de LoRA con r=16 y alpha=32 en tareas de razonamiento matematico sobre modelos pequenos, asi como su sensibilidad a la longitud de contexto de entrenamiento (8192 tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MATH, GSM8K, MMLU ni de ninguna otra evaluacion, y el repositorio no registra descargas ni valoraciones que permitan inferir un rendimiento conocido.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base fusionado en bf16 o fp16: aproximadamente 2-2,5 GB de pesos, mas el overhead de la cache KV. Con cuantizacion de 8 bits se situaria en torno a 1-1,5 GB y con 4 bits por debajo de 1 GB. Son estimaciones derivadas del tamano de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en precision completa; una RTX 3060, RTX 4060, RTX 4090 o similares cubren el modelo con margen amplio. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU para inferencia con cuantizacion agresiva.
- Opciones de despliegue: Transformers junto con PEFT para cargar el adaptador sin fusionar; vLLM, TGI u Ollama tras fusionar el adaptador con el modelo base; llama.cpp requiere conversion previa a GGUF del modelo fusionado. No se ha confirmado ninguna de estas rutas por parte del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swadeshb/g3-1b-flat | ~1B (base) + adaptador LoRA r=16 | 8192 tokens de entrenamiento | Adaptador LoRA para matematicas | No disponible | Repositorio HuggingFace, 0 descargas |
| google/gemma-3-1b-pt | ~1B | No disponible en la informacion proporcionada | Modelo base preentrenado | Condiciones de uso de Gemma | Publico en HuggingFace |
| swadeshb/Qwen2.5-3B-Instruct-CRPO-V35 | 3,1B | No disponible | Modelo completo ajustado con GRPO | No disponible | Publico en HuggingFace y Featherless |
| swadeshb/Llama-3.2-3B-Instruct-MPO-SKD-V7 | 3B | No disponible | Modelo completo ajustado | No disponible | Publico en HuggingFace y Featherless |

No se dispone de datos de rendimiento para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, tipo de artefacto y disponibilidad.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar google/gemma-3-1b-pt y cargarlo con PEFT o fusionarlo antes de poder usarlo.
- El repositorio figura con un tamano de 0.0 GB, lo que puede indicar que los pesos del adaptador no estan efectivamente subidos o que la medicion no se ha actualizado. Conviene verificarlo antes de cualquier uso.
- No se declara licencia para el adaptador. Sin una licencia explicita, el uso comercial queda en una situacion juridicamente ambigua, con independencia de las condiciones del modelo base.
- No hay ningun resultado de evaluacion publicado: no se puede afirmar que el adaptador mejore al modelo base en MATH ni en ninguna otra tarea.
- El entrenamiento se limita al subconjunto MATH de un unico dataset, lo que estrecha mucho la distribucion de tareas y aumenta el riesgo de sobreajuste y de degradacion fuera de ese dominio.
- El modelo base tiene ~1B de parametros: su capacidad de razonamiento complejo y su robustez frente a alucinaciones son inherentemente limitadas.
- La variante "flat" no incorpora descomposicion jerarquica, por lo que no cabe esperar las capacidades de razonamiento multi-paso que sugiere la etiqueta "hierarchical-reasoning" del repositorio.
- No se especifican idiomas soportados; el comportamiento fuera del ingles (idioma predominante en MATH) es desconocido.
- La longitud de entrenamiento es de 8192 tokens; no hay evidencia sobre el comportamiento con entradas mas largas.
- Cero descargas y cero valoraciones implican ausencia total de validacion por parte de la comunidad. No se recomienda su uso en produccion sin una evaluacion propia previa.
- Las fechas del repositorio (2026) y la ausencia de documentacion adicional dificultan situar el trabajo en el contexto de la literatura existente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swadeshb/g3-1b-flat
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/MLR_structured_trajectory
- Perfil del autor en HuggingFace: https://huggingface.co/swadeshb
- Datasets del autor: https://huggingface.co/swadeshb/datasets
- Otro modelo del autor (Qwen2.5-3B-Instruct-CRPO-V35): https://huggingface.co/swadeshb/Qwen2.5-3B-Instruct-CRPO-V35
- Otro modelo del autor (Llama-3.2-3B-Instruct-MPO-SKD-V7): https://huggingface.co/swadeshb/Llama-3.2-3B-Instruct-MPO-SKD-V7
- Otro modelo del autor (scc-qwen3-1.7b-gsm8k-scc_a-seed42): https://huggingface.co/swadeshb/scc-qwen3-1.7b-gsm8k-scc_a-seed42
