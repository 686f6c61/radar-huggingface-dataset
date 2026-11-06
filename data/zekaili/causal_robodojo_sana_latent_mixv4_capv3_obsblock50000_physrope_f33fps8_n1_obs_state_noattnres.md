# zekaili/causal_robodojo_sana_latent_mixv4_capv3_obsblock50000_physrope_f33fps8_n1_obs_state_noattnres

## Resumen

`causal_robodojo_sana_latent_mixv4_capv3_obsblock50000_physrope_f33fps8_n1_obs_state_noattnres` es un checkpoint de política robótica (policy) entrenado por el usuario de Hugging Face `zekaili` sobre el conjunto de datos RoboDojo, concretamente en la variante `arx-x5_zip_nrt` del robot ARX-X5. No es un modelo de lenguaje: es un modelo de acción visomotora que combina un backbone de difusión latente tipo SANA (con latentes de 256x320 en formato strip) con un cabezal de flujo de acciones, y que predice comandos de efector final (EEF absoluto) a partir de observaciones visuales y de estado. El checkpoint publicado corresponde al paso 30.000 de un entrenamiento de 50.000 pasos que el autor detuvo manualmente el 1 de noviembre de 2026, por lo que es el último disponible de esa ejecución.

La relevancia técnica del artefacto está en su configuración experimental: se entrenó **sin AttnRes** (`model.use_attn_res: false`), es decir, con una pila residual convencional en lugar del mecanismo de atención residual que usan otras variantes del mismo autor. Además emplea atención causal sobre observación y estado, RoPE físico, GDN solo en numerador, atención en bf16 con FlashAttention 2 en modo varlen y un esquema de flow matching para las acciones con `action flow shift 3`. El nombre del repositorio codifica buena parte de la receta: latentes SANA, mezcla de datos v4, caption v3, bloques de observación de 50.000, RoPE físico, ventana de 33 frames a 8 fps, política N1, estado de observación y ausencia de AttnRes.

El modelo tiene un interés limitado fuera de su nicho: cuenta con 8 descargas, 0 likes, no declara licencia ni idiomas, y su despliegue exige un árbol de código concreto (`fd5261ff6` o posterior) y desactivar AttnRes, ya que los drivers fusionados de despliegue rechazan modelos sin ese mecanismo. El repositorio ocupa 89,4 GB, dominado por el peso `pytorch_model_fsdp.bin` en formato de checkpoint FSDP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de difusión latente tipo SANA (latentes 256x320, strip) con pila residual convencional (sin AttnRes) y cabezal de flow matching para acciones; atención causal sobre observación y estado, RoPE físico, GDN solo en numerador, atención bf16 con FA2 varlen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 33 frames a 8 fps (f33fps8); número de tokens de contexto no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 dentro de checkpoint FSDP) |
| Idiomas soportados | no disponible (modelo de política robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model_fsdp.bin` (checkpoint FSDP, solo pesos), más `metadata.pth`, `config.yaml`, `recipe.yaml`, `normalization/robodojo_arx_x5_model_fps_25_f33_normalization.json`, `MANIFEST.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es una política visomotora construida sobre un backbone de difusión latente derivado de SANA. El checkpoint parte de un donante preentrenado con bloques de observación (`SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_s15000_ws256`, paso 50.000), al que se le eliminaron los pesos `attn_res.{attn,mlp,final}_proj.weight` para operar sin atención residual. Sobre esa base se entrena una política N1 con observación causal y estado causal, RoPE físico, GDN en modo solo numerador, atención en bf16 con FlashAttention 2 varlen y todas las optimizaciones de velocidad de entrenamiento activadas. La predicción de acciones usa flow matching con `action flow shift 3` y `OpenWAM min_weight 0`.

El entrenamiento se realizó con AdamW (lr 1e-4, betas 0.9/0.95, 1.000 pasos de warmup, decaimiento coseno hasta 50k) en 4 nodos de 8 GPU H200 cada uno, con batch por niveles `b = floor(96 / L)` y sin EMA (`ema_update false`). Los datos provienen de RoboDojo `arx-x5_zip_nrt`, con el almacén de fases `v2-f33-vs4-phase-stretch-ae44f4a5961380ab` y la normalización `1fe3b7e7...`. La pérdida en el paso 30.000 fue de 0,0630 (vídeo 0,0626; acción 0,00046), con media móvil de 500 pasos de 0,0638. El código de entrenamiento es `rwm/zekai-merge` en el commit `a5ae8cf8f`, que incluye `fd5261ff6`, requisito mínimo para que la forma de la rama de observación coincida con estos pesos.

## Capacidades

- Predicción de acciones de efector final (EEF absoluto) para el robot ARX-X5 a partir de observaciones visuales y de estado.
- Procesamiento de observaciones visuales en latentes de 256x320 en formato strip, con ventana temporal de 33 frames a 8 fps.
- Modelado causal de la secuencia de observación y de estado (`causal_observation` + `causal_state`), adecuado para control en bucle cerrado.
- Generación de trayectorias de acción mediante flow matching (integración del campo de flujo de acciones).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM; es un modelo de política.
- Capacidades multilingües: no aplica.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelo fundacional.

## Casos de uso

- **Manipulación robótica con el ARX-X5 en tareas de RoboDojo**: el modelo se usa como política de control que, dada la observación visual y el estado del robot, emite comandos de efector final absolutos; es su uso previsto y el único validado por los datos de entrenamiento.
- **Investigación en políticas visomotoras causales**: sirve como punto de comparación para estudiar el efecto de eliminar AttnRes en un backbone SANA con observación causal, ya que el autor mantiene en el historial del repositorio checkpoints con y sin esa configuración.
- **Ablación de recetas de entrenamiento**: al publicarse junto a `recipe.yaml`, `config.yaml` y la normalización exacta, permite reproducir o modificar la receta (flow shift, min_weight, ventana f33 a 8 fps) en un clúster con H200.
- **Evaluación de robustez temporal en control**: la ventana de 33 frames a 8 fps y el modelado causal permiten probar políticas en tareas que requieren memoria a corto plazo de la escena.
- **Despliegue en bucle cerrado sobre el robot real**: con el árbol de código `fd5261ff6` o posterior y `use_attn_res: false`, el modelo puede ejecutarse en la ruta de despliegue no fusionada para control en tiempo real.
- **Punto de partida para fine-tuning**: al ser un checkpoint intermedio (paso 30.000 de 50.000) con pesos completos, puede servir como inicialización para ajustes en tareas concretas del mismo robot y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de entrenamiento: pérdida total 0,0630 en el paso 30.000 (vídeo 0,0626; acción 0,00046) y media de 500 pasos de 0,0638. No hay métricas de éxito en tarea, ni comparaciones con otras políticas.

## Requisitos de hardware

- Entrenamiento original: 4 nodos × 8 GPU H200 (32 H200 en total), según la model card.
- VRAM de inferencia: no disponible; el repositorio pesa 89,4 GB y los pesos se distribuyen en un checkpoint FSDP, por lo que la carga completa requiere agregación previa.
- GPU recomendadas: no disponible. Por el tamaño del artefacto y el uso de FA2 varlen en bf16, se presume necesario hardware de centro de datos (H100/H200 o A100 de 80 GB), pero el autor no lo especifica.
- ¿Cabe en GPU de consumo? no disponible; no se documenta ninguna cuantización ni formato GGUF.
- Opciones de despliegue: ruta de despliegue no fusionada del árbol de código del autor (`rwm/zekai-merge`, commit `fd5261ff6` o posterior) con `use_attn_res: false`. Los drivers fusionados rechazan el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (zekaili, sin AttnRes, paso 30.000) | no disponible | ventana f33 a 8 fps | pérdida 0,0630 en paso 30.000; sin benchmarks de tarea | no disponible | Hugging Face, 8 descargas |
| Otras revisiones del mismo repo (pasos 10.000, 14.000, 20.000, 25.000) | no disponible | misma configuración | pérdidas no reportadas en la información disponible | no disponible | en el historial del mismo repositorio |
| Políticas RoboDojo/ARX-X5 de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- **Licencia no declarada**: no hay licencia en la model card ni en los metadatos, por lo que el uso comercial no está autorizado de forma explícita; hay que contactar con el autor.
- **Checkpoint intermedio**: es el paso 30.000 de un entrenamiento detenido manualmente en el paso ~30.060, no un modelo convergido a 50.000; el rendimiento final puede ser inferior al previsto por la receta.
- **Dependencia estricta del código**: requiere un árbol en `fd5261ff6` o posterior y `use_attn_res: false`; versiones anteriores calculan una forma de observación distinta y producen resultados incorrectos. El propio autor corrige en esta model card una afirmación errónea de la revisión del paso 10.000.
- **Incompatibilidad con drivers fusionados**: la ruta de despliegue fusionada rechaza modelos sin AttnRes; solo funciona la ruta no fusionada.
- **Sesgos**: no documentados; al entrenarse solo con RoboDojo `arx-x5_zip_nrt`, el modelo está sesgado hacia ese robot, ese conjunto de tareas y esa distribución visual.
- **Riesgo de alucinación / fallo silencioso**: en políticas de control, el equivalente es emitir acciones plausibles pero incorrectas fuera de distribución; no hay evaluación de robustez publicada.
- **Idioma y contexto**: no aplica soporte lingüístico; la ventana está fijada a 33 frames a 8 fps y no se documenta comportamiento fuera de esa configuración.
- **Reproducibilidad**: el repositorio incluye `MANIFEST.json` y `SHA256SUMS`, pero no se publican curvas de evaluación ni métricas de éxito en tarea.
- **Formato de pesos**: checkpoint FSDP (`pytorch_model_fsdp.bin`) sin cuantizaciones publicadas, lo que complica el despliegue en entornos con VRAM limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zekaili/causal_robodojo_sana_latent_mixv4_capv3_obsblock50000_physrope_f33fps8_n1_obs_state_noattnres
- Repositorio de código citado: `rwm/zekai-merge`, commit `a5ae8cf8f` (incluye `fd5261ff6`)
- Donante del preentrenamiento: `zekaili/SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_s15000_ws256` (commit `396a8cff`)
- Revisiones previas en el historial del repositorio: pasos 25.000 (`76ae64ae`), 20.000 (`d96a4e19`), 14.000 (`22ff7d63`) y 10.000 (`f5b591f6`)
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
