# sprited/dancing-stick-figures-baselines

## Resumen

El repositorio `sprited/dancing-stick-figures-baselines` contiene un conjunto de checkpoints de referencia (v0.1) para la generación incondicional de imágenes y vídeo de figuras de palo (stick figures) bailando. Desarrollado por el equipo de Sprited, estos modelos se entrenaron sobre el dataset sintético `sprited/dancing-stick-figures` y sirven como línea base para comparar arquitecturas y recetas de entrenamiento en el ámbito de la difusión y el flow matching. Incluye tanto modelos UNet factorizados como modelos DiT (Diffusion Transformer) con flow matching, en resoluciones de 64×64 y 128×128 píxeles, así como snapshots intermedios de modelos de vídeo de 64×64×8 frames. La relevancia actual radica en que proporciona puntos de referencia reproducibles para investigar técnicas de entrenamiento de modelos generativos de vídeo, especialmente el enfoque de dos etapas tipo Seedance (inicializar un modelo de vídeo desde un modelo de imagen). Todos los pesos se distribuyen bajo licencia MIT, con un tamaño de repositorio de 3,2 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet factorizado (46 M) y DiT-FM (33 M) |
| Parametros totales | 46 M (UNet) y 33 M (DiT-FM) según checkpoint |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generación de imágenes/vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (state_dict con EMA y modelo) |

## Arquitectura y entrenamiento

Los checkpoints se dividen en dos familias de arquitectura: un UNet factorizado de 46 millones de parámetros y un DiT (Diffusion Transformer) con flow matching de 33 millones de parámetros. Todos los modelos son incondicionales y generan imágenes RGBA. El entrenamiento se realizó sobre el dataset sintético `sprited/dancing-stick-figures`, con diferentes recetas: el UNet de 64×64 usó predicción de velocidad (v-pred) y min-SNR-5, con un programa de coseno hasta 2 %; el DiT de 64×64 usó logit-normal en el tiempo de muestreo. Para los modelos de 128×128 se emplearon 20k y 40k pasos respectivamente. Los modelos de vídeo (64×64×8 frames) se entrenaron desde cero o mediante inicialización desde el modelo de imagen (estilo Seedance stage 2), con snapshots intermedios. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado con pérdida de difusión.

## Capacidades

- Generación incondicional de imágenes de figuras de palo en resoluciones 64×64 y 128×128, con canal alfa (RGBA).
- Generación incondicional de secuencias de vídeo de 8 frames a 64×64 de resolución.
- Soporte de warm-start: los checkpoints pueden usarse para inicializar nuevos entrenamientos (`--init` o `--resume`).
- Incluye scripts de evaluación y comparación (`eval/score_images.py`, `scripts/compare.py`) para medir métricas oracle (tvr, lie, clean).
- No soporta texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Investigación en generación de vídeo: los checkpoints sirven como referencia para comparar nuevas arquitecturas o recetas de entrenamiento en el dominio de figuras de palo, usando los scripts de comparación incluidos.
- Estudio de técnicas de entrenamiento de difusión: permite analizar el efecto de min-SNR, logit-normal, o la inicialización desde modelo de imagen (stage 2) sobre la calidad de generación.
- Generación de datos sintéticos para animación: las imágenes y vídeos generados pueden usarse como datos de entrenamiento para otros modelos de visión o animación.
- Evaluación de métricas oracle: los valores de tvr, lie y clean proporcionan una línea base objetiva para medir el rendimiento de modelos propios.
- Desarrollo de modelos de difusión ligeros: al ser modelos de 33-46 M, son adecuados para probar pipelines de entrenamiento en hardware limitado.
- Benchmarking de flujos de trabajo de dos etapas: el par imagen→vídeo permite reproducir el enfoque Seedance y comparar con entrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El autor proporciona métricas oracle específicas del dataset (tvr, lie, clean) para cada checkpoint, que se resumen a continuación:

| Checkpoint | Resolución | Pasos | tvr | lie | clean |
|---|---|---|---|---|---|
| unet_img64.pt | 64² | 100k | .134 | .116 | .43 |
| dit_img64_p2.pt | 64² | 50k | .164 | .114 | .40 |
| unet_img64_30k.pt | 64² | 30k | .159 | .113 | .42 |
| dit_img64_p4_30k.pt | 64² | 30k | .176 | .122 | .38 |
| unet_img128.pt | 128² | 20k | .226 | .073 | .22 |
| dit_img128_p4.pt | 128² | 40k | .251 | .065 | .23 |

Los valores entre paréntesis indican el "floor" (mínimo alcanzable) reportado por el autor. No hay datos de latencia ni throughput.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Dado el tamaño reducido de los modelos (33-46 M de parámetros), es razonable estimar que pueden ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, aunque no se proporcionan datos concretos de VRAM, latencia ni throughput. Los scripts de entrenamiento y evaluación están pensados para entornos con PyTorch y aceleración por GPU, pero no se especifican modelos de GPU concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Al ser un repositorio de checkpoints de referencia para un dataset sintético muy específico, no se han publicado comparativas con otros modelos de generación de imágenes o vídeo.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción; los checkpoints de vídeo son snapshots intermedios y pueden no representar el rendimiento final.
- Dominio restringido: solo genera figuras de palo bailando; no es un modelo generalista de imágenes o vídeo.
- Sin control condicional: la generación es incondicional, no se puede guiar por texto, clase o condiciones adicionales.
- Sin soporte de idiomas ni texto: no procesa entradas de lenguaje natural.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir artefactos o figuras deformes, especialmente en resoluciones bajas.
- Licencia MIT: permite uso comercial, pero el dataset subyacente puede tener sus propias restricciones (no especificadas).
- No se proporcionan métricas de sesgo ni evaluación de seguridad.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/sprited/dancing-stick-figures-baselines)
- [Dataset sprited/dancing-stick-figures](https://huggingface.co/datasets/sprited/dancing-stick-figures)
- [Código de entrenamiento en GitHub](https://github.com/sprited-ai/dancing-stick-figures)
- [Sitio de Sprited](https://sprited.ai/products)
