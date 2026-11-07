# yslan/Track4D-2026

## Resumen

Track4D-2026 es un repositorio de adaptadores (LoRA y componentes auxiliares) para Track4D, un enfoque de vídeo condicional orientado al seguimiento denso 3D a partir de secuencias de vídeo. Lo publica el usuario yslan (LAN YUSHI) en Hugging Face bajo la licencia s-lab-license-1.0, con pipeline declarado `video-to-video` y etiquetas de vídeo, tracking, 3D y Wan. No es un modelo base autónomo: los pesos liberados son adaptadores que deben combinarse con los modelos Wan2.1 y Wan2.2 correspondientes, obtenidos por separado.

El repositorio se organiza en tres líneas de modelo diferenciadas —RTV, NCMV y Mixture-of-Transformers (MoT)— cuyos checkpoints no son intercambiables entre sí. La línea MoT se apoya en Wan2.2-TI2V-5B y realiza seguimiento denso de RGB y geometría; las líneas RTV y NCMV se apoyan en adaptadores LoRA r64 sobre Wan2.1-T2V-14B y Wan2.1-I2V-14B, entrenados con datos de 49 fotogramas y resoluciones diversas.

La relevancia del proyecto reside en su propuesta metodológica: tratar el tracking 3D denso como un problema de generación de vídeo condicional, reutilizando la infraestructura de difusión de Wan en lugar de un pipeline de correspondencia geométrica clásico. El repositorio incluye además los activos exactos de evaluación (208 ficheros NPZ de WorldTrack, 200 NPZ alineados de Stream3R, predicciones históricas y ejemplos cualitativos) con contratos de replay definidos, semilla base 42 y número de pasos de denoising especificados por variante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión vídeo-a-vídeo sobre Wan2.2-TI2V-5B (MoT: Mixture-of-Transformers + DPT) y Wan2.1-T2V-14B / Wan2.1-I2V-14B con LoRA r64 |
| Parámetros totales | No disponible como cifra única; el adaptador MoT ocupa 7.129.090.808 bytes (1.475 tensores entrenados: 588 Wan, 822 MoT, 62 DPT, 3 codificador XYZ) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (procesa secuencias de 49 fotogramas; resolución nativa 512 × 512 × 49 en NCMV) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de vídeo/geometría, no lingüístico) |
| Licencia | s-lab-license-1.0; el componente MoT Omega-DPT conserva la FAIR Noncommercial Research License |
| Formato de pesos | safetensors (adaptadores LoRA y checkpoints parciales); activos de evaluación en NPZ, JSON, TXT y MP4 |
| Tamaño del repositorio | 52,9 GB |

## Arquitectura y entrenamiento

Track4D aborda el tracking denso 3D como generación condicional de vídeo. La línea principal, MoT, combina el modelo Wan2.2-TI2V-5B con un Mixture-of-Transformers y una cabeza DPT que produce RGB denso y geometría; el adaptador `mot/track4d_mot_wan22_5b_recovery1000.safetensors` contiene 1.475 tensores entrenados (588 del backbone Wan, 822 del MoT, 62 del DPT y 3 del codificador XYZ) y no incluye estado del optimizador. Las líneas RTV y NCMV son adaptadores LoRA de rango 64 sobre Wan2.1: `wan21_t2v_14b_512x512x49_lora_r64_step4000` (NCMV, resolución nativa 512 × 512 × 49), `joint_rtv_ncmv_wan21_i2v_14b_lora_r64_step5000` y `rtv_only_noqi_wan21_i2v_14b_lora_r64_step9000`, estos dos últimos entrenados con 49 fotogramas a resoluciones diversas.

El entrenamiento se documenta a nivel de receta más que de dataset: el modelo conjunto RTV+NCMV es una continuación del modelo RTV-only, de modo que su mejora histórica de métricas describe la receta completa en dos etapas y no una estimación causal aislada de la pérdida NCMV. Los pesos experimentales antiguos (3D step-12,5K y dense-2D step-11,5K) fueron rotados durante el entrenamiento continuado; las salidas guardadas reproducen sus cifras publicadas, pero los pesos retenidos de 16K/13,5K no deben identificarse con aquellos checkpoints históricos. El protocolo de inferencia exige un cargador estricto que verifica la topología entrenada, con configuraciones versionadas y posibilidad de sobrescribir el adaptador alojado mediante la variable `MOT_CHECKPOINT`.

## Capacidades

- Seguimiento denso 3D de píxeles y geometría a lo largo de secuencias de vídeo, formulado como generación vídeo-a-vídeo condicional.
- Predicción densa de RGB y geometría en la línea MoT sobre Wan2.2-TI2V-5B.
- Tracking UV denso con visibilidad en el pipeline experimental `dense2d_step013500`.
- Pipeline 3D con DA3 en vivo mediante el componente experimental `da3_vdm_vitdpt_step016000` (LoRA Wan, sonda ViT/DPT y LoRA DA3).
- Replay determinista de evaluación: semilla base 42 más el índice global de vídeo sobre el orden fijo ADT, PO, PStudio, DS/DR.
- Soporte de dos regímenes de denoising: un paso para el modelo conjunto RTV+NCMV y 50 pasos para RTV-only.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalities de audio o texto generativo.

## Casos de uso

- Reconstrucción y seguimiento 3D en investigación de visión por computador: el adaptador MoT, junto con Wan2.2-TI2V-5B, T5, VAE y la caché de geometría preparada, genera RGB denso y geometría sobre secuencias de 49 fotogramas, adecuado para experimentos de tracking denso reproducibles.
- Evaluación comparativa de métodos de tracking 3D: los 208 ficheros NPZ de entrada/GT de WorldTrack y los 200 NPZ alineados de Stream3R permiten reproducir las cifras publicadas con contratos de resolución y semilla fijados.
- Replay exacto de resultados históricos: las predicciones 3D de `da3base_step012500_predictions` y los JSON/TXT del evaluador permiten auditar publicaciones previas sin reentrenar.
- Análisis cualitativo de seguimiento denso 2D: los ejemplos NPZ/MP4 de `dense2d_step011500` sirven para inspeccionar el comportamiento del tracking UV con visibilidad antes de integrarlo en un pipeline mayor.
- Prototipado de nuevos estimadores de geometría sobre backbone de vídeo: la línea experimental DA3 permite sustituir o comparar la cabeza de geometría manteniendo el backbone Wan y la sonda ViT/DPT.
- Investigación sobre pérdidas de consistencia de movimiento: la comparación entre RTV-only, NCMV-only y el modelo conjunto RTV+NCMV permite estudiar el efecto de cada término de pérdida, siempre teniendo en cuenta que la mejora del modelo conjunto describe la receta de dos etapas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "scorecard" de WorldTrack para RTV y comandos de evaluación, pero no incluye cifras numéricas de métricas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, el adaptador MoT pesa 7,13 GB y el repositorio completo 52,9 GB; el backbone Wan2.2-TI2V-5B y Wan2.1-14B deben sumarse a esa cifra.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño de los backbones (5B y 14B) y el procesamiento de vídeo a 49 fotogramas, se requiere hardware de centro de datos; no se confirma compatibilidad con GPU de consumo.
- Ajuste en GPU de consumo: no disponible; no se documenta ninguna configuración validada en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el repositorio oficial proporciona un cargador estricto y un script de inferencia (`scripts/train/launch_v2v.py`) con configuraciones YAML versionadas; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. Solo se especifica el número de pasos de denoising por variante (1 paso para RTV+NCMV conjunto, 50 para RTV-only), lo que condiciona directamente el coste de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de tracking denso 3D formulados como vídeo condicional, ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: todos los checkpoints son adaptadores que requieren los modelos base Wan2.1 o Wan2.2, el encoder/tokenizer T5, el VAE y, en el caso MoT, una caché de geometría preparada, obtenidos por separado.
- Las líneas RTV, NCMV y MoT no son intercambiables entre sí; usar un checkpoint con la línea equivocada invalida los resultados.
- El componente MoT Omega-DPT conserva la FAIR Noncommercial Research License, lo que restringe el uso a investigación no comercial en esa parte del pipeline.
- La licencia s-lab-license-1.0 debe revisarse antes de cualquier uso comercial; el adaptador del Hub no concede derechos para redistribuir o usar los modelos base de terceros más allá de sus propios términos.
- Los términos de redistribución de los datasets son independientes de la licencia del código Track4D; los NPZ históricos pueden contener rutas de origen con fines de procedencia, aunque la evaluación solo usa los arrays embebidos.
- La mejora de métricas del modelo conjunto RTV+NCMV corresponde a la receta completa de dos etapas y no debe interpretarse como efecto causal aislado de la pérdida NCMV.
- Los pesos retenidos de 16K/13,5K no son los checkpoints históricos de las métricas publicadas (step-12,5K y step-11,5K); no deben citarse como tales.
- Riesgo de alucinación geométrica: al ser un modelo generativo condicional, las predicciones densas de geometría pueden divergir de la escena real en oclusiones o movimientos rápidos; no se documentan garantías de consistencia.
- Sesgos: no disponible información sobre sesgos de los datasets de entrenamiento.
- Idiomas: no aplica ni se documenta soporte lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yslan/Track4D-2026
- Perfil del autor: https://huggingface.co/yslan
- Repositorio de código Track4D: https://github.com/NIRVANALAN/Track4D-clean
- Documentación MoT: https://github.com/NIRVANALAN/Track4D-clean/blob/main/docs/MOT.md
- Componentes de terceros (Omega-DPT, FAIR Noncommercial Research License): https://github.com/NIRVANALAN/Track4D-clean/tree/main/track4d/mot/vendor
- Manifiesto de checkpoints (hashes y tamaños): `checkpoint_manifest.json` en el repositorio de Hugging Face
