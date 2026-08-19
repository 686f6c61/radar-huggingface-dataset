# standjones/mirror-unconst-affine-5czsc2fc98-r683-r252-odpo-midrank-hibeta-shortctx-ultraextra-ep3-lolr-merg

## Resumen

Este checkpoint, publicado por el usuario `standjones`, es un experimento de alineación mediante *offline DPO* (Direct Preference Optimization) sobre el modelo base `unconst/Affine-5czsc2fc98-r252-merged`, un modelo de la serie Affine con arquitectura MoE (según las etiquetas `qwen3_5_moe`). El objetivo declarado en la model card es mejorar el rendimiento en el sistema de evaluación *Reason v4* (`weight_version_key=7`), donde el modelo actúa como *challenger* en duelos automáticos contra otros checkpoints. No se trata de un modelo de chat general, sino de una pieza de investigación para un pipeline de minería de modelos.

Con 35.107.181.936 parámetros (aproximadamente 35,1 mil millones), el modelo se entrenó con LoRA (r=32, α=128, β=0.3) sobre pares de preferencias generados por el propio sistema Reason, con una ventana de contexto de entrenamiento de 6144 tokens. El autor reporta una victoria ajustada frente al *king* actual en la evaluación interna (margen +0.002137, z=2.27), lo que llevó a una licencia de "Stage-5". El repositorio incluye pesos en formato `safetensors` (16 shards, ~70 GB) y se distribuye bajo licencia Apache 2.0.

Aunque el modelo es capaz de generar texto (pipeline `text-generation`), su uso previsto es exclusivamente como participante en el sistema de evaluación *Reason v4* de la serie Affine. No hay información pública sobre benchmarks estándar (MMLU, HumanEval, etc.) ni sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen3_5_moe`; detalles no disponibles) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con max_len=6144) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, ~70,2 GB) |

## Arquitectura y entrenamiento

El modelo base `Affine-5czsc2fc98-r252-merged` pertenece a la serie Affine, que según las etiquetas utiliza una arquitectura MoE derivada de Qwen3.5 (etiqueta `qwen3_5_moe`). No se proporcionan detalles sobre el número de expertos, la dimensión oculta o el mecanismo de atención. El checkpoint aquí descrito es el resultado de un entrenamiento *offline DPO* (no SFT ni GRPO en línea) sobre pares de duelos rankeados por el propio sistema Reason v4. El proceso filtra pares de preferencias con criterios *ShortCtx* (contexto corto), *MidRank* (rango medio) y *HiBeta* (β alto), y optimiza la preferencia por pensamientos que aumentan el *Reason* del lado del profesor.

Los hiperparámetros clave del entrenamiento son: LoRA con r=32 y α=128, β=0.3, tasa de aprendizaje 1e-6, longitud máxima 6144 tokens, 7200 pasos de optimización (el doble de la configuración "Mega") y 3 épocas. El entrenamiento se realizó en 8 GPU B200 (parte de un clúster llamado `mine-r226-marsplan-fullft-1`), y la fusión de pesos se completó en otro nodo. El autor indica que el checkpoint superó el umbral de victoria en la evaluación interna (margen +0.002137, SE 0.000943, z=2.27, n=79) y fue licenciado como "Stage-5". No se especifica el número total de tokens de entrenamiento ni la composición del dataset original del modelo base.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Optimizado para el sistema de evaluación *Reason v4*: produce respuestas que maximizan una métrica de *Reason* basada en log-probabilidades condicionadas (fórmula `Reason = τ·log(mean_i exp(a_i/τ))` con k=3 referencias).
- Capacidad de participar en duelos automáticos (comparaciones pareadas) dentro del ecosistema Affine.
- Según las etiquetas, el modelo base podría tener capacidades multimodales (`image-text-to-text`), pero no se confirma en la documentación.
- No se documentan capacidades de *tool calling*, *function calling* ni razonamiento multi-paso más allá de lo implícito en el entrenamiento DPO.
- Multilingüismo no especificado; probablemente heredado del modelo base, pero sin datos.

## Casos de uso

- **Participación en el sistema de evaluación Reason v4**: el uso principal declarado es servir como *challenger* en duelos contra otros checkpoints dentro del pipeline de minería de la serie Affine. El modelo se evalúa con la métrica Reason y debe superar un umbral para ser "licenciado" en la siguiente etapa.
- **Investigación en alineación offline DPO**: este checkpoint es un caso de estudio de cómo aplicar DPO con LoRA sobre preferencias generadas automáticamente (sin anotación humana) para mejorar una métrica específica. Puede servir como referencia para experimentos similares.
- **Experimentos de destilación de preferencias**: el método de "duel pairs" con ranking por *Reason* puede replicarse en otros dominios; este modelo es un ejemplo de los resultados obtenidos.
- **Generación de texto con razonamiento**: aunque no es su propósito, al ser un modelo de 35B parámetros, podría emplearse como generador de texto genérico en tareas de razonamiento, siempre que se acepte que no ha sido evaluado para ello.
- **Base para fine-tuning posterior**: los pesos pueden servir como punto de partida para nuevos experimentos de alineación o adaptación a tareas específicas, dado que la licencia Apache 2.0 permite uso comercial y modificaciones.
- **Análisis de métricas de preferencia**: el modelo puede utilizarse para estudiar cómo la métrica *Reason* (log-mean-exp sobre referencias) correlaciona con la calidad percibida de las respuestas, útil para diseñar sistemas de evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta únicamente una evaluación interna dentro del sistema Reason v4, con los siguientes datos:

| Metrica | Valor |
|---|---|
| Margen vs. king reign34 | +0.002137 |
| Error estandar (SE) | 0.000943 |
| z-score | 2.27 |
| Tamaño de muestra (n) | 79 |
| Mediana de pensamiento | 172 (requisito ≥80) |
| Tasa de pase B | 0.304 (requisito ≥0.30) |
| Decisión | WIN / Stage-5 licensed |

Estos valores son específicos del protocolo de evaluación interno y no son comparables con benchmarks públicos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 35.107 millones de parámetros, en precisión fp16 se necesitan aproximadamente 70 GB de VRAM; en 8 bits (~35 GB) y en 4 bits (~17,5 GB), asumiendo que existan versiones cuantizadas (no disponibles en el repo).
- **GPU recomendadas**: para fp16, GPU de datacenter como NVIDIA A100 80GB, H100 80GB o B200. Para cuantización 8 bits, una A100 40GB o RTX 6000 Ada podría bastar. En 4 bits, una RTX 4090 (24GB) o similar podría ser suficiente, pero no hay cuantizaciones publicadas.
- **Compatibilidad con GPU de consumo**: no es viable en fp16; en 4 bits podría caber en una RTX 4090, pero no se proporcionan archivos GGUF ni AWQ.
- **Opciones de despliegue**: al ser un modelo de la librería `transformers`, puede servirse con vLLM, TGI, o llama.cpp si se convierte a GGUF. No hay configuraciones específicas documentadas.
- **Latencia y throughput**: no disponibles. Dado el tamaño y la arquitectura MoE, se espera una latencia mayor que un modelo denso equivalente, pero sin datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (MoE de ~35B). El modelo es un checkpoint experimental dentro de la serie Affine, y no hay datos públicos de rendimiento en tareas estándar que permitan compararlo con alternativas como Mixtral 8x22B, Qwen1.5-MoE-A2.7B o DeepSeek-V2-Lite. La única comparación publicada es interna contra el "king" de la serie Affine, con un margen muy pequeño (+0.002137). Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint | 35,1B (MoE) | no disponible | Apache 2.0 | Especializado en Reason v4 |
| unconst/Affine-5czsc2fc98-r252-merged (base) | no disponible | no disponible | Apache 2.0 | Modelo base sin el DPO |
| Otros MoE de ~35B | variable | variable | variable | Sin datos comparables |

## Limitaciones y advertencias

- **No es un modelo de chat general**: la model card lo indica explícitamente ("Not a general chat model"). Su uso fuera del sistema Reason v4 no está validado y puede producir resultados subóptimos.
- **Riesgo de alucinacion**: al ser un modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas no relacionadas con su entrenamiento específico.
- **Sesgos desconocidos**: no hay información sobre la composición del dataset de entrenamiento del modelo base ni de los pares de preferencias, por lo que los sesgos potenciales no pueden evaluarse.
- **Ventana de contexto limitada**: aunque no se especifica la ventana de contexto del modelo base, el entrenamiento usó max_len=6144, lo que sugiere que el modelo podría no manejar bien contextos muy largos.
- **Dependencia del sistema de evaluación**: el rendimiento reportado (margen +0.002137) es específico de la métrica Reason v4 y no garantiza calidad general.
- **Reproducibilidad**: el entrenamiento depende de infraestructura interna (clústeres, datasets no publicados) y de un sistema de ranking propietario; replicar los resultados es difícil.
- **Licencia**: aunque es Apache 2.0, el autor menciona "Affine mining artifacts policy" en la model card, lo que podría imponer restricciones adicionales no detalladas.
- **Fecha de creación**: el modelo fue creado en agosto de 2026 (según metadatos), lo que indica que es un artefacto reciente y con poco historial de uso (0 descargas, 0 likes).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/standjones/mirror-unconst-affine-5czsc2fc98-r683-r252-odpo-midrank-hibeta-shortctx-ultraextra-ep3-lolr-merg
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Checkpoint hermano (R576, HiRank): https://huggingface.co/standjones/mirror-unconst-affine-5czsc2fc98-r576-r252-odpo-hirank-shortctx-ultraextra-merged
