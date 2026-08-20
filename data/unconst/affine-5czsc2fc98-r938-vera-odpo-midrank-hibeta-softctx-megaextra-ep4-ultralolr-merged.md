# unconst/Affine-5czsc2fc98-r938-vera-odpo-midrank-hibeta-softctx-megaextra-ep4-ultralolr-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r938-vera-odpo-midrank-hibeta-softctx-megaextra-ep4-ultralolr-merged` es un fine-tuning de la serie Affine, desarrollado por el autor `unconst` a partir del modelo base `vera6/affine-5g4yy75zuz-t6` (revisión `8e3f1695`). Se trata de un checkpoint experimental entrenado mediante *offline DPO* (Direct Preference Optimization) sobre pares de respuestas rankeadas por una métrica interna denominada *Reason v4*, diseñada para tareas de minería de datos (SN120) y evaluación de duelos de razonamiento. No es un modelo de chat general, sino una pieza especializada dentro de un pipeline de optimización de preferencias.

Con 35.107.181.936 parámetros (35,1B) y una longitud de contexto de 12.288 tokens, el modelo emplea una arquitectura que, según las etiquetas de HuggingFace, corresponde a un *Mixture of Experts* (tag `qwen3_5_moe`) con capacidades *image-text-to-text*, aunque no se han publicado detalles arquitectónicos completos. El entrenamiento utilizó LoRA (r=32, α=128) con un factor β=0,3, una tasa de aprendizaje extremadamente baja (5e-7) y 19.200 pasos sobre 4 épocas, en hardware de 8×H200. Los resultados internos muestran una mejora marginal de +0,004951 sobre el modelo base en la métrica *Reason v4*, con una decisión de "WIN" que lo licencia para la etapa 5 del proyecto.

La relevancia de este modelo radica en su enfoque metodológico: demuestra cómo el *offline DPO* con muestreo múltiple y *soft context* puede refinar el razonamiento de un modelo base sin recurrir a SFT ni GRPO online. Sin embargo, su uso está restringido al ámbito de la minería de datos Affine y no se recomienda para aplicaciones de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tag `qwen3_5_moe`), no confirmada; base `vera6/affine-5g4yy75zuz-t6` |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 tokens (max_len=12288) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con restricciones de la política de minería Affine) |
| Formato de pesos | safetensors (16 shards, ~66 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `vera6/affine-5g4yy75zuz-t6` mediante *offline DPO* sobre pares de duelos rankeados por la métrica *Reason v4* (`weight_version_key=7`). Esta métrica calcula, por turno, la diferencia entre la log-probabilidad condicionada al contexto del profesor (`lpC(y_i|z_A)`) y la no condicionada (`lpC(y_i|∅)`), aplicando una media log-exponencial sobre k=3 referencias con temperatura τ=0,03. El entrenamiento optimiza preferencias para que el modelo "se comprometa" con modos de acción del profesor, penalizando respuestas de relleno.

Los hiperparámetros clave incluyen LoRA con r=32 (MidRank) y α=128 (HiAlpha), un coeficiente β=0,3 (HiBeta), una tasa de aprendizaje de 5e-7 (UltraLoLR), y una ventana de contexto de 12.288 tokens (SoftCtx). Se entrenó durante 19.200 pasos (MegaSuperExtra) en 4 épocas, utilizando los datos de `dpo_duel_reason.jsonl` bajo el experimento `r938-vera-offline-dpo-hialpha-midrank-hibeta-softctx-megasuperextrasteps-ep4-ultralolr`. El hardware empleado fueron 8×H200, con las GPUs 0 y 1 para entrenamiento y fusión, y las GPUs 2 y 3 para evaluación en frío. No se aplicó RLHF clásico ni GRPO online; el método es exclusivamente DPO offline.

## Capacidades

- Generación de texto especializada en tareas de razonamiento evaluadas por la métrica *Reason v4* (duelos de minería SN120).
- Optimización de preferencias para alinearse con el "modo de acción" del profesor en contextos de evaluación.
- Soporte de contexto largo (hasta 12.288 tokens) para manejar conversaciones o secuencias extensas.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No soporta *tool calling* ni *function calling* de forma documentada.
- No es un modelo de chat general; su uso previsto es como *miner submission* en el sistema de evaluación `evalsrv`.
- Hereda potencialmente capacidades *image-text-to-text* del modelo base, pero no se han verificado en este checkpoint.

## Casos de uso

- **Participación en competiciones de minería de datos (SN120)**: el modelo está diseñado para presentarse como submission en el sistema de duelos de razonamiento, donde compite contra otros checkpoints de la serie Affine. Su uso requiere el pipeline de evaluación `evalsrv` con la métrica *Reason v4*.
- **Investigación en optimización de preferencias**: sirve como caso de estudio para comparar *offline DPO* con otros métodos (SFT, GRPO online) en la mejora del razonamiento. Los investigadores pueden analizar cómo el ajuste de β, la tasa de aprendizaje y el contexto suave afectan al rendimiento.
- **Generación de datos sintéticos para entrenamiento**: al estar optimizado para producir respuestas que maximizan *Reason*, puede utilizarse para generar pares de preferencia de alta calidad para futuros entrenamientos DPO.
- **Evaluación de métricas de razonamiento**: el modelo puede emplearse como referencia en experimentos que validen nuevas versiones de la métrica *Reason* (por ejemplo, *Reason v5*), comparando sus puntuaciones con las del modelo base.
- **Análisis de robustez en contextos largos**: gracias a su ventana de 12.288 tokens, es adecuado para probar cómo el razonamiento se degrada o mejora con secuencias extensas, aunque no se han publicado estudios al respecto.
- **Experimentos de ablación en LoRA**: al usar r=32 y α=128, puede servir para estudiar el impacto del rango y la escala en tareas de razonamiento, comparando con variantes de rango mayor o menor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son métricas internas del proyecto, presentadas en la model card:

| Metrica | Valor |
|---|---|
| Margen vs. modelo base (wvk=7) | +0,004951 |
| Error estandar (SE) | 0,002064 |
| z-score | 2,399 |
| n (tamaño de muestra) | 80 |
| Barra de decisión (max(2·SE, δ=0.002)) | 0,004127 (~1,20×) |
| Mediana de pensamiento | 163 (≥80, cumple) |
| Tasa de pase B | 0,308 (≥0,30, cumple) |
| k (referencias) | 3 |
| τ (temperatura) | 0,03 |
| Decisión | WIN / Stage-5 licensed |

Estas métricas indican una mejora estadísticamente significativa sobre el modelo base en la tarea específica de duelos *Reason v4*, pero no son comparables con benchmarks generales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 35,1B parámetros en FP16, se necesitan aproximadamente 70 GB de VRAM. Con cuantización a 4 bits (no disponible actualmente), podría reducirse a ~18-20 GB, pero no se ofrecen versiones cuantizadas.
- **GPU recomendadas**: para inferencia en FP16, se requieren GPUs de data center como A100 (80 GB), H100 (80 GB) o H200 (141 GB). En consumer, solo una RTX 4090 (24 GB) no es suficiente sin cuantización.
- **Si cabe en consumer GPU**: no, a menos que se aplique cuantización externa (por ejemplo, con GPTQ o AWQ), pero no se proporcionan archivos cuantizados.
- **Opciones de despliegue**: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- **Latencia y throughput**: no disponibles. El entrenamiento usó 8×H200, lo que sugiere que la inferencia en una sola GPU H200 podría ofrecer un throughput razonable, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría. La serie Affine incluye múltiples variantes (r252, r498, r510, r580, etc.) con diferentes configuraciones de DPO, pero no se han publicado métricas estandarizadas que permitan una comparación directa. El modelo base `vera6/affine-5g4yy75zuz-t6` es el punto de referencia inmediato, y este checkpoint lo supera en la métrica *Reason v4* con un margen de +0,004951. Para modelos externos (por ejemplo, otros MoE de 35B), no hay información disponible.

## Limitaciones y advertencias

- **No es un modelo de chat general**: está sobreoptimizado para la métrica *Reason v4* y puede producir respuestas extrañas o incoherentes fuera de ese contexto.
- **Sesgos del dataset de entrenamiento**: los datos provienen de `dpo_duel_reason.jsonl`, generados internamente por el proyecto Affine; no se ha auditado su composición ni su representatividad.
- **Riesgo de alucinación**: no evaluado; al ser un modelo de razonamiento, podría generar afirmaciones falsas con alta confianza.
- **Limitaciones de idioma**: no se especifican idiomas soportados; probablemente entrenado principalmente en inglés, pero no confirmado.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, la model card indica que "sigue la política del modelo base + artefactos de minería Affine", lo que puede imponer restricciones adicionales no detalladas.
- **Caveat de producción**: no se recomienda su uso en aplicaciones comerciales o de cara al usuario sin una evaluación exhaustiva. Su propósito es experimental y de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r938-vera-odpo-midrank-hibeta-softctx-megaextra-ep4-ultralolr-merged
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6 (revisión `8e3f1695e058837ed80fec3238ff439fdc2d0f0e`)
- Otros modelos de la serie Affine (referencia): https://huggingface.co/unconst/Affine-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged
- Despliegue en FriendliAI (modelos relacionados): https://friendli.ai/models/unconst/Affine-5czsc2fc98-r498-offline-dpo-hialpha-midrank-lobeta-softctx-extrasteps-merged
