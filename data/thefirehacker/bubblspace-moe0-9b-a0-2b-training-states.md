# TheFireHacker/bubblspace-moe0.9b-a0.2b-training-states

## Resumen

BubblSpace MoE-0.9B-A0.2B es un modelo de lenguaje de arquitectura mezcla de expertos (MoE) desarrollado por TheFireHacker (AIEDX Private Limited). Con aproximadamente 915,6 millones de parametros totales y unos 211 millones de parametros activos por token, se posiciona como un modelo compacto de tipo sparse que busca ofrecer capacidad de razonamiento y generacion con un coste computacional de inferencia reducido. Emplea 16 capas, dimension de modelo 1024, atencion con GQA 16/4, QK-norm y compuerta de salida, junto con un MoE SwiGLU de 64 expertos con top-8 y embeddings atados, sobre un vocabulario de 49.280 tokens (tokenizer de SmolLM2 extendido con 12 tokens especiales).

El repositorio que nos ocupa no contiene el modelo para inferencia, sino los estados completos de entrenamiento en tres puntos concretos del run: pesos en fp32 mas estado del optimizador (momentum de Muon y momentos de AdamW), planificadores de tasa de aprendizaje, contador de pasos y estado de los generadores aleatorios. Esto permite reanudar o ramificar el entrenamiento de forma exacta, no solo ejecutar inferencia. Para inferencia, el autor remite al repositorio principal de pesos (~3,7 GB).

Es relevante ahora porque expone de forma abierta y auditable el proceso de entrenamiento de un MoE pequeno, con exportaciones verificadas mediante round-trip bit-exacto y sin pickles (todo en safetensors o JSON), lo que reduce el riesgo de ejecucion de codigo al cargar los ficheros. El entrenamiento se realizo en una unica H100: aproximadamente 32 horas para la fase 1 y 40 horas para la fase 2, lo que lo convierte en un caso practico de referencia para reproducir y estudiar pipelines MoE a baja escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con GQA, QK-norm y compuerta de salida |
| Parametros totales | ~915,6 M |
| Parametros activos | ~211 M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del repositorio estan en fp32) |
| Idiomas soportados | no disponible (fase 1 entrenada solo en ingles; fase 2 anade codigo y datos agenticos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo, optimizador y RNG) y JSON (trainer_state) |

## Arquitectura y entrenamiento

El modelo es un transformer de 16 capas con d_model de 1024, atencion con grouped-query attention de 16 cabezas de consulta y 4 de clave/valor, QK-norm y compuerta de salida. La capa de alimentacion hacia delante es un MoE SwiGLU de 64 expertos con enrutamiento top-8, lo que explica la relacion entre los ~915,6 M de parametros totales y los ~211 M activos. Usa ZeroCenteredRMSNorm y embeddings atados, con vocabulario de 49.280 tokens basado en el tokenizer de SmolLM2 extendido con 12 tokens especiales. El entrenamiento combina Muon y AdamW.

El proceso consta de dos fases documentadas. La fase 1 consumio 10.000 millones de tokens de FineWeb-Edu (solo ingles) con un schedule de warmup mas coseno, y termino en el paso 19.073. La fase 2 anadio aproximadamente 10.000 millones de tokens de ingles, codigo, datos agenticos y datos contrastivos con un schedule WSD (warmup-stable-decay): una meseta a tasa de aprendizaje constante de 2,4e-4 hasta el paso 19.000 (fin de la etapa 2A) y un anneal lineal hasta 6e-6 a lo largo de 3.815 pasos, finalizando en el paso 22.888. En el paso 19.000 se cambio la mezcla de la etapa 2B (FineWeb-Edu se mantuvo en ~5,7 % y el corpus contrastivo paso de v1 a v2). El checkpoint `phase2-step22888` se entreno con esa version. Cada checkpoint incluye el estado completo de Muon y AdamW, los dos planificadores de tasa de aprendizaje, el contador de pasos y el estado RNG de CPU y CUDA, con round-trip bit-exacto verificado.

## Capacidades

- Generacion de texto en ingles: entrenado sobre FineWeb-Edu en la fase 1 y reforzado con datos adicionales en la fase 2.
- Generacion de codigo: la fase 2 incorpora datos de codigo, aunque no se especifica la proporcion ni el rendimiento.
- Datos agenticos: la fase 2 incluye datos de tipo agentico, si bien no se detalla el formato ni el soporte efectivo de tool calling.
- Datos contrastivos: se empleo un corpus contrastivo (v1 y luego v2) durante la fase 2.
- Capacidades multilingues: no disponibles; la fase 1 fue exclusivamente en ingles y no se documentan otros idiomas.
- Tool calling / function calling: no disponible como capacidad declarada; solo se mencionan datos agenticos en el entrenamiento.
- Razonamiento multi-paso y agentes: no disponible como capacidad verificada.
- Modo thinking, vision o audio: no disponible.
- Reproducibilidad del entrenamiento: capacidad destacada del repositorio, que permite reanudar o ramificar el entrenamiento de forma exacta.

## Casos de uso

- Reanudacion exacta de entrenamiento: cargar `phase2-step22888` con `--resume` reconstruye el estado completo (pesos, Muon, AdamW, planificadores, contador de pasos y RNG) y continua el run sin divergencias, util para recuperar jobs interrumpidos en clusters.
- Ramificacion de schedules de anneal: desde `phase2-step19000` se puede lanzar un anneal alternativo (otra mezcla de datos, otra longitud de decaimiento) sin repetir la meseta de 19.000 pasos, lo que abarata la experimentacion con schedules WSD.
- Investigacion sobre Muon frente a AdamW: los estados de ambos optimizadores permiten analizar la evolucion de los momentos y comparar dinamicas de actualizacion en un MoE pequeno con top-8.
- Estudio de mezclas de datos: los checkpoints antes y despues del cambio de corpus contrastivo v1 a v2 (paso 19.000) permiten aislar el efecto de esa modificacion sobre el modelo final.
- Reproduccion de pipelines MoE a baja escala: con ~72 horas totales en una sola H100, sirve como referencia para validar recetas de entrenamiento MoE antes de escalar a modelos mayores.
- Formacion y docencia: el formato sin pickles (safetensors y JSON) y el script `restore_checkpoint.py` facilitan explicar el ciclo completo de un entrenamiento con estados de optimizador de forma segura.
- Continual training y SFT: `phase2-step22888` es el punto de partida documentado para la fase 3 (SFT) o para entrenamiento continuado con `--init_from`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~915,6 M de parametros en fp32 ocupa unos 3,66 GB de pesos; en fp16 serian ~1,83 GB y en cuantizacion de 8 bits ~0,92 GB, sin contar el estado de activacion ni el contexto. Estos calculos son estimaciones, no datos del autor.
- VRAM para reanudar entrenamiento: cada checkpoint ocupa ~7,5 GB (pesos fp32 ~3,66 GB mas estado del optimizador ~3,87 GB), a lo que hay que sumar el estado RNG y el JSON. El entrenamiento original se hizo en una unica H100.
- GPU recomendadas: H100 para entrenamiento (segun el autor); para inferencia, cualquier GPU consumer con suficiente VRAM para el formato elegido.
- GPU consumer: probablemente cabe en GPUs de 8 GB o mas en fp16 o cuantizacion, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: no disponible. El autor remite al repositorio principal de pesos para inferencia y al repositorio de GitHub para el codigo de entrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BubblSpace MoE-0.9B-A0.2B | ~915,6 M / ~211 M | no disponible | Apache 2.0 | MoE top-8 de 64 expertos; repositorio de estados de entrenamiento |
| SmolLM2 (familia) | no disponible en la informacion | no disponible | no disponible | Su tokenizer es la base del de este modelo |
| Alternativas MoE de ~1B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada; la comparativa se limita a lo documentado.

## Limitaciones y advertencias

- El repositorio contiene estados de entrenamiento (pesos mas optimizador), no un modelo listo para inferencia; para uso practico debe emplearse el repositorio principal de pesos.
- La reanudacion exacta requiere el codigo del repositorio de GitHub y el script `restore_checkpoint.py`; sin ellos los ficheros no son directamente utilizables.
- La fase 1 se entreno solo en ingles y no se documentan capacidades multilingues; el rendimiento en castellano es desconocido.
- No hay benchmarks publicados, por lo que no puede evaluarse su calidad frente a alternativas.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al entrenarse sobre FineWeb-Edu y datos web, es previsible que herede sesgos de esas fuentes, aunque no se cuantifican.
- Longitud de contexto no especificada: no puede garantizarse el comportamiento en conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara el modelo "for learning and research purposes only" y lo entrega "AS IS" sin garantia, sin responsabilidad de AIEDX Private Limited sobre las salidas.
- Los pesos estan en fp32; no se ofrecen versiones cuantizadas oficiales, lo que limita el despliegue en hardware modesto sin conversion manual.
- El modelo es de escala reducida (~211 M activos); no debe esperarse un rendimiento comparable al de modelos de decenas de miles de millones de parametros.

## Enlaces

- Repositorio de Hugging Face (estados de entrenamiento): https://huggingface.co/TheFireHacker/bubblspace-moe0.9b-a0.2b-training-states
- Repositorio principal del modelo (solo pesos): https://huggingface.co/TheFireHacker/bubblspace-moe0.9b-a0.2b
- Codigo, configuraciones y recetas de datos: https://github.com/thefirehacker/bubblspace-MoE-0.9B-A0.2B
- Config base de la fase 1: https://github.com/thefirehacker/bubblspace-MoE-0.9B-A0.2B/blob/main/configs/base.yaml
- Config de la fase 2: https://github.com/thefirehacker/bubblspace-MoE-0.9B-A0.2B/blob/main/configs/phase2.yaml
