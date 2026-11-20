# yyongjae/ssr-vast2-archive

## Resumen

`yyongjae/ssr-vast2-archive` no es un modelo generativo al uso, sino un archivo de investigación publicado en Hugging Face que contiene pesos, registros de entrenamiento, resultados de evaluación, análisis y código del proyecto SSR (un sistema de conducción autónoma evaluado sobre NAVSIM). El repositorio, de 104,6 GB, fue subido por el usuario `yyongjae` el 13 de noviembre de 2026 como copia de seguridad del servidor "vast2" (8× RTX 5090) antes de apagarlo, y se hizo público el 20 de noviembre de 2026 por decisión del autor al alcanzar el límite de almacenamiento privado.

El contenido abarca los checkpoints de entrenamiento en formato Lightning (state_dict de 0,17 GB más optimizer de 0,33 GB por checkpoint), los registros de TensorBoard y W&B, los resultados de evaluación PDMS y EPDMS sobre navtest y navhard, los artefactos de evaluación closed-loop en HUGSIM, los teachers de destilación (BEVFusion, ReSMap, BEVFormer, Mask2Map) y el bundle de código del proyecto. La model card documenta con detalle los distintos runs, sus métricas y las decisiones metodológicas, incluyendo advertencias sobre diferencias entre el scorer interno y el oficial.

Es relevante para investigadores que trabajen en planificación end-to-end para conducción autónoma y quieran reproducir o auditar los resultados del proyecto SSR, así como para quienes necesiten los checkpoints y los logs de ablación asociados. No se trata de un modelo para inferencia general: no hay pipeline declarado, no se especifican idiomas y la licencia es "other" sin términos detallados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el archivo contiene múltiples runs: SSR con backbone R34 o DINOv2 ViT-S, teachers BEVFusion/ReSMap/BEVFormer/Mask2Map) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (términos no especificados en la información disponible) |
| Formato de pesos | checkpoints Lightning (`.ckpt` con `state_dict` + optimizer), TensorBoard `tfevents`, JSON de resultados, TAR de registros, bundle de git |

## Arquitectura y entrenamiento

El archivo no documenta una arquitectura única, sino los artefactos de varios experimentos del proyecto SSR sobre el benchmark NAVSIM. El run principal (`g4_7d652a`) usa un backbone ResNet-34 a resolución 768×416, con teachers de detección BEVFusion y de mapa ReSMap, entrenado en 4 GPU. Otro run destacado (`dino_vits14_1148_g4_82e51a`) sustituye el backbone por DINOv2 ViT-S con LoRA a 1148×672. Hay además runs con teachers exclusivamente de cámara (BEVFormer para detección y Mask2Map para mapa) entrenados en 8 GPU, y variantes de ablación que desactivan la destilación de detección (`detkd-off`) o modifican la cabeza de mapa a 4 clases de ReSMap a 200×200 (`mapclass`).

El entrenamiento se organiza en torno a destilación de conocimiento desde teachers de detección y mapa, con checkpoints guardados por epoch (los ficheros `epoch=29-…` corresponden al epoch 30, ya que la numeración de la tabla empieza en 1). La evaluación se realiza con PDMS (fórmula navtest v1.1, scorer fork interno) y EPDMS (definición oficial "after" con filtro humano aplicado), sobre navtest y navhard. La model card advierte de que el filtro humano propio también filtra escenas HC en las trayectorias humanas (235 de 12.146 escenas en navtest), lo que eleva el EPDMS interno unos +0,19 puntos respecto al código oficial v2.2. También se documenta que el selector de candidatos se ajustó sobre navtest/navhard y es de uso interno (nota FAIRNESS), y que los valores de β/w_safe/w_cc varían entre runs.

## Capacidades

- Almacenamiento de checkpoints de entrenamiento en formato Lightning para múltiples runs del proyecto SSR, con `state_dict` y estado del optimizador.
- Registro completo de entrenamiento: logs de Lightning, `tfevents`, hiperparámetros, logs DDP y ficheros locales de W&B.
- Resultados de evaluación PDMS y EPDMS por epoch sobre navtest y navhard, con ficheros `results/*.json` y `summary_*.json/md`.
- Pools de candidatos (`pool96_*`) y registros de evaluación auxiliar (`eval_aux64`, `eval_drivable64`).
- Evaluación closed-loop en HUGSIM: `outputs/ssr.tar` (436 sets), `outputs/ssr345.tar` (345 sets con vídeos mp4 de conducción) y resúmenes en texto.
- Teachers de destilación: BEVFusion/ReSMap para detección y mapa, BEVFormer/Mask2Map para la variante de cámara.
- Análisis de refinador con 58 salidas de crítico (`supp_f_out/`) y figuras de paper.
- Código fuente completo en `SSR_all_refs.bundle` (todas las ramas y etiquetas locales, incluidos 7 commits no presentes en el remoto) y diffs no commiteados por worktree.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión general ni multilingüismo: es un archivo de investigación, no un modelo de propósito general.

## Casos de uso

- Reproducción de resultados del paper: los checkpoints por epoch y los JSON de evaluación permiten recalcular PDMS/EPDMS sobre navtest y navhard y contrastar las cifras publicadas (por ejemplo, el 92,28 de EPDMS β0.8 en el run principal, conservado en `aborted_20261112_sel080/`).
- Auditoría metodológica del scorer: el archivo incluye el script `eval_epdms.py` y la documentación del filtro humano, lo que permite analizar la diferencia de +0,19 puntos frente al código oficial v2.2 y replicar el análisis.
- Estudio de destilación de teachers: los runs `detkd-off`, `mapclass` y `bevformer-mask2map` permiten comparar el efecto de eliminar la destilación de detección, cambiar la cabeza de mapa o sustituir los teachers LiDAR por teachers de cámara.
- Investigación sobre backbones: la comparación entre R34 a 768×416 y DINOv2 ViT-S con LoRA a 1148×672 ofrece datos para estudiar el impacto del backbone preentrenado en planificación end-to-end.
- Evaluación closed-loop: los artefactos de HUGSIM (`ssr.tar`, `ssr345.tar` con vídeos) sirven para analizar el comportamiento en simulación cerrada y comparar con los resultados open-loop.
- Reutilización de código y configuración: el bundle de git y los `launch/` de cada run (settings, overrides, config generado, estado de git y `train.log`) permiten reconstruir el entorno experimental.
- Análisis de dinámica de entrenamiento: los `tfevents`, logs DDP y registros del refinador permiten estudiar curvas de pérdida, calibración KD y comportamiento del labeler.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del proyecto sobre NAVSIM, no benchmarks estándar de LLM. Se presentan tal como los documenta el autor.

| Run | Backbone / configuración | navtest PDMS v1.1 | navtest EPDMS ep20 / ep30 | navhard EPDMS ep30 |
|---|---|---|---|---|
| `g4_7d652a` (main) | R34, 768×416, BEVFusion + ReSMap, 4 GPU | ep10 92,55; ep20 93,12; ep30 93,24 | 91,97 / 92,18 (β0,75/1,5/2,0) | 45,19 |
| `dino_vits14_1148_g4_82e51a` | DINOv2 ViT-S + LoRA, 1148×672, 4 GPU | ep10 93,17; ep20 93,82; ep23 93,88; ep25 93,78; ep27 93,71; ep30 93,74 | 92,36 / 92,54 (β0,8/2,0/1,0) | 45,77 |
| `g4_score_c1a311` | BEV KD map bank solo DAC+EP | ep20 93,16; ep30 93,34 | 92,01 / 92,01 (β0,75/1,5/2,0) | 42,75 |
| `detkd-off_g4_577a01` | DET_KD=off, solo teacher de mapa | ep20 92,21; ep30 92,01 | 91,42 / 91,60 (β0,8/2,0/1,0) | 42,66 |
| `g4_mapclass_6623a0` | cabeza de mapa ReSMap 4 clases 200×200 | ep20 93,27; ep30 93,32 | — / 92,43 (β0,75/1,5/2,0) | 44,65 |
| `bevformer-mask2map_703341` | BEVFormer det + Mask2Map map, 8 GPU | ep20 93,41; ep30 93,46 | 91,60 / 92,10 (β0,8/2,0/1,0) | 47,36 |

Nota del autor: el EPDMS interno está aproximadamente +0,19 puntos por encima del oficial en navtest debido al filtrado de escenas HC; el selector se ajustó sobre navtest/navhard y es de uso interno.

## Requisitos de hardware

- El archivo en sí requiere 104,6 GB de almacenamiento en disco; no es un modelo para inferencia.
- Los runs documentados se entrenaron en 4 GPU (runs principales) u 8 GPU (variantes de cámara), con RTX 5090 ×8 en el servidor vast2.
- Cada checkpoint Lightning ocupa aproximadamente 0,5 GB (0,17 GB de `state_dict` + 0,33 GB de optimizer); los checkpoints de Mask2Map son ficheros `.pth` (`ep15`, `ep18`) y BEVFormer incluye `ckpts/trained/epoch_5.pth`.
- No se documentan requisitos de VRAM para inferencia, GPU recomendadas para despliegue, latencia ni throughput.
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): el contenido no está pensado para servirse como modelo.

## Comparativa con modelos similares

No disponible. El archivo no es un modelo comparable a otros modelos de la misma categoría; es un repositorio de artefactos de investigación de un proyecto concreto (SSR sobre NAVSIM). No se han encontrado en la información proporcionada modelos alternativos con los que establecer una comparación de parámetros, contexto o licencia.

## Limitaciones y advertencias

- No es un modelo desplegable: no hay pipeline declarado, no se especifican idiomas ni tipos de cuantización, y los pesos son checkpoints de entrenamiento en formato Lightning, no safetensors ni GGUF.
- La licencia es "other" sin términos detallados en la información disponible; es imprescindible contactar con el autor antes de cualquier uso comercial.
- El EPDMS interno no es directamente comparable con el oficial: el filtro humano propio filtra escenas HC (235 de 12.146 en navtest), lo que infla la métrica en torno a +0,19 puntos.
- El selector de candidatos se ajustó sobre navtest/navhard y es de uso interno (nota FAIRNESS); los valores de β/w_safe/w_cc difieren entre runs, lo que complica comparaciones cruzadas.
- Los resultados de `results/` en el run principal corresponden a β0,75; el resultado β0,8 (92,28) está en `aborted_20261112_sel080/` y el recálculo de navhard se interrumpió.
- Hay runs incompletos o fallidos incluidos solo como logs (`g4_mapclass-pilot`, `bevformer-mask2map_g4_68d2a2`, `_failed_wandb_bevformer-mask2map_g4_68d2a2`), y uno (`bevformer-mask2map_gridkd_x_b34e37`) sin registro de quién lo solicitó.
- Se excluyeron 421,4 GB de datos de entrenamiento, cachés de cinemática y checkpoints no usados, 119,7 GB de datos de HUGSIM y 82,0 GB de dos runs de otro usuario (`byounggun`); el archivo no es, por tanto, una reproducción completa del entorno de entrenamiento.
- Se eliminó un fichero `verify/baseline/ps.txt` que contenía tokens; conviene revisar cualquier credencial residual en logs y configuraciones antes de reutilizar el material.
- No hay datos de sesgos, alucinación o rendimiento multilingüe porque el contenido no es un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yyongjae/ssr-vast2-archive
- Caché pública de características BEVFusion: https://huggingface.co/yyongjae/navsim-bevfusion-64m-cache
- Caché pública de características ReSMap: https://huggingface.co/rudals/resmap-navsim-teacher-kd
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código externos ni demos adicionales.
