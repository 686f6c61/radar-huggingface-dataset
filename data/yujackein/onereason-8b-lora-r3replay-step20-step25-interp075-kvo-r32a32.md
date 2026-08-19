# yujackein/onereason-8b-lora-r3replay-step20-step25-interp075-kvo-r32a32

## Resumen

OneReason-8B LoRA es un adaptador experimental de tipo LoRA (rank 32, alpha 32) desarrollado por yujackein para el modelo base OneReason-8B, un modelo de generación de texto orientado a recomendación generativa. El adaptador se construyó mediante interpolación de dos checkpoints de una misma trayectoria de entrenamiento (pasos 20 y 25) con coeficiente 0.75, aplicada exclusivamente a las proyecciones `k_proj`, `v_proj` y `o_proj` de cada capa. El objetivo es mejorar el rendimiento en tareas de recomendación (R3 replay) manteniendo la estabilidad en otras métricas.

Este adaptador no es un modelo autónomo: debe cargarse sobre un checkpoint base específico (epoch-2 full-SFT en bf16) que no está disponible públicamente. La evaluación oficial en la plataforma OneReason está pendiente, y los resultados locales presentados son cambios relativos frente al paso 20, no puntuaciones absolutas. Su relevancia radica en explorar la interpolación de adaptadores LoRA como técnica de mejora sin entrenamiento adicional, un enfoque poco común en la literatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre modelo base OneReason-8B) |
| Parametros totales | No disponible (adaptador LoRA, tamano de repo 0.4 GB) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (cutoff de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | zh, en |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construyó offline a partir de dos checkpoints de una misma trayectoria de entrenamiento continua: el paso 20 (ruta de destilación R0 raw-SID con replay R3 balanceado) y el paso 25 (continuación exacta con el mismo optimizador, scheduler y RNG durante cinco actualizaciones más). La interpolación se aplicó con coeficiente 0.75 desde el paso 20 hacia el paso 25, actuando directamente sobre los factores A/B de LoRA de `k_proj`, `v_proj` y `o_proj` de cada capa. Las proyecciones `q_proj`, `gate_proj`, `up_proj` y `down_proj` se mantuvieron sin cambios respecto al paso 20.

El entrenamiento de la trayectoria fuente usó 1.192 ejemplos: 952 de destilación de rutas raw-SID y 240 de replay R3 balanceado sin pensamiento. Los hiperparámetros incluyen `cutoff_len=1024`, batch global de 8, LR pico de 5e-5, optimizador AdamW, scheduler coseno y un horizonte de 122 actualizaciones. No se realizó entrenamiento adicional para crear este candidato; la interpolación es puramente algebraica sobre los factores LoRA, lo que no equivale a una interpolación lineal de pesos densos.

## Capacidades

- Generación de texto conversacional en chino e inglés, orientada a tareas de recomendación generativa.
- Soporte de razonamiento multi-paso mediante el mecanismo R3 replay (replay de razonamiento sin pensamiento explícito).
- Capacidad de destilación de rutas (route distillation) para mejorar la consistencia interna.
- Interpolación de checkpoints como técnica de mejora sin entrenamiento adicional.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Recomendación generativa de ítems: el modelo puede generar recomendaciones personalizadas a partir de historiales de usuario, aprovechando el entrenamiento en destilación de rutas y replay R3.
- Evaluación de técnicas de interpolación de LoRA: sirve como caso de estudio para investigar si la interpolación de adaptadores mejora métricas específicas sin regresiones en otras.
- Experimentación en entornos de investigación: al ser un adaptador experimental, es útil para comparar estrategias de fusión de checkpoints en modelos de lenguaje.
- Generación de respuestas conversacionales en dominios de recomendación (por ejemplo, sugerencias de productos, contenido o servicios) en chino e inglés.
- Análisis de estabilidad de métricas locales: permite estudiar el impacto de cambios en proyecciones específicas (`k_proj`, `v_proj`, `o_proj`) sobre tareas de razonamiento y recomendación.
- Desarrollo de pipelines de recomendación con modelos generativos: el adaptador puede integrarse en sistemas que requieran generación de texto condicionada a contexto de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks absolutos en la informacion disponible. La model card presenta cambios relativos frente al paso 20, medidos con proxies locales deterministas (no puntuaciones oficiales ni evaluaciones con LLM como juez):

| Tarea / métrica | Cambio | IC 95% |
|---|---|---|
| R0 raw SID char-F1 (400 filas) | +0.000173 | [-0.003221, +0.003524] |
| R0 generic char-F1 (400 filas) | -0.002056 | [-0.005840, +0.001640] |
| R2 overall proxy (128 filas) | -0.000171 | [-0.004844, +0.004240] |
| R3 teacher domain probability (256 filas) | +0.003112 | [+0.001217, +0.005004] |
| R3 free domain accuracy (256 filas) | +0.019531 | [-0.003906, +0.046875] |
| World relaxed parse (2.000 filas) | -0.005000 | [-0.012000, +0.002000] |
| World relaxed correct (2.000 filas) | -0.004500 | [-0.011000, +0.002000] |

La probabilidad `s_b` del profesor R3 no cambió estadísticamente; `s_c` varió en -0.002627 con IC [-0.004860, -0.000438]. El candidato fue seleccionado por retener la mayor parte de la ganancia en dominio R3 de la interpolación de todos los módulos, reduciendo regresiones en jerarquía fina.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.4 GB, pero requiere cargar el modelo base OneReason-8B completo (aproximadamente 16 GB en bf16, o menos con cuantización).
- Para inferencia en GPU consumer, se recomienda al menos 16 GB de VRAM (por ejemplo, RTX 4090, RTX 4080) si se usa el modelo base en bf16.
- Para GPUs con menos VRAM, se puede cuantizar el modelo base (por ejemplo, 8 bits o 4 bits) y cargar el adaptador sobre él, aunque no se documentan configuraciones específicas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede usar con Hugging Face Transformers y PEFT, así como con servidores de inferencia que soporten LoRA (por ejemplo, vLLM, TGI, FriendliAI).
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría. El adaptador es específico de OneReason-8B y no hay datos de rendimiento absoluto. Se pueden mencionar otros adaptadores LoRA del mismo autor (por ejemplo, `yujackein/onereason-8b-lora-item32k-user75-rec50-worldclean1601-all1-lr2e4-r32a32-step323`), pero no se dispone de métricas comparables.

## Limitaciones y advertencias

- El adaptador debe cargarse sobre un checkpoint base específico (`/data/sft_yaml/onereason_sft_epoch2_bf16`) que no está disponible públicamente; cargarlo sobre el checkpoint público de preentrenamiento no funcionará.
- La evaluación oficial en la plataforma OneReason está pendiente; los resultados locales son proxies deterministas y no deben interpretarse como puntuaciones finales.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial.
- El adaptador es experimental y no ha sido validado en producción; su rendimiento en tareas fuera del dominio de recomendación no está documentado.
- La interpolación de factores LoRA no es equivalente a la interpolación de pesos densos, por lo que su comportamiento puede ser impredecible en algunos casos.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos limitados (1.192 ejemplos), puede presentar alucinaciones o inconsistencias en dominios no cubiertos.
- El idioma soportado es principalmente chino e inglés; otros idiomas no están garantizados.

## Enlaces

- HuggingFace: https://huggingface.co/yujackein/onereason-8b-lora-r3replay-step20-step25-interp075-kvo-r32a32
- Technical report (arXiv): https://arxiv.org/html/2606.06260v1
- Otros adaptadores del autor: https://huggingface.co/yujackein/onereason-8b-lora-item32k-user75-rec50-worldclean1601-all1-lr2e4-r32a32-step323
