# ZhengmingYu/DMAD

## Resumen

DMAD (Distribution Matching as Adversarial Distillation) es una familia de modelos destilados que aceleran la generación visual. En este repositorio se publican los estudiantes de 4 y 8 pasos de MiniMax-H3, un modelo de texto-a-vídeo-y-audio de 33B parámetros desarrollado por MiniMax. El trabajo lo firman investigadores de Texas A&M University y ByteDance, y transforma al profesor original de 50 pasos en un generador que produce vídeo de 1344x768 con audio estéreo nativo en solo 4 u 8 pasos de muestreo.

La relevancia práctica es directa: reducir de 50 a 4 pasos de inferencia disminuye el coste computacional en más de un orden de magnitud, lo que hace viable la generación conjunta de audio y vídeo en GPUs de consumo. El repositorio incluye además estudiantes para Wan2.1-T2V (1.3B y 14B), SDXL e ImageNet-64, junto con el código de entrenamiento y los datos utilizados.

Los pesos se distribuyen como LoRAs de rango 128 sobre el transformer de H3, con versiones en formato Diffusers y en el layout de claves de ComfyUI, además de flujos de trabajo listos para ejecutar que caben en GPUs de 8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax-H3) con LoRA de rango 128 sobre bloques de atención y FFN; destilación por matching de distribución adversarial |
| Parámetros totales | 33B (modelo base MiniMax-H3); las LoRAs publicadas pesan 1,4 GB (Diffusers) o 2,0 GB (ComfyUI) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los flujos ComfyUI permiten ejecución en 8 GB de VRAM, lo que implica cuantización, pero no se detalla el esquema) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (LoRA en layout Diffusers y en layout ComfyUI) |

## Arquitectura y entrenamiento

DMAD aplica una destilación por matching de distribución formulada como un proceso adversarial. El estudiante se entrena para igualar la distribución del profesor (MiniMax-H3 de 50 pasos) mediante un crítico que discrimina entre muestras generadas por ambos. En la variante `lora_critic`, el backbone del crítico permanece congelado bajo una LoRA; en la variante `full_critic`, el crítico se entrena por completo y obtiene mejores puntuaciones en AVGen-Bench. Las LoRAs resultantes tienen rango 128 y se aplican sobre `attn.to_q/to_k/to_v/to_out.0`, `ff.net.0.proj` y `ff.net.2` de los 50 bloques del transformer y de los 2 bloques token-refiner (312 módulos en total), con alpha igual al rango.

El modelo base MiniMax-H3 genera vídeo de 1344x768 con audio estéreo nativo de forma conjunta. Los estudiantes de 4 pasos se obtuvieron a partir de una ejecución principal (EMA en la iteración 800) y de una ejecución con crítico completo (iteración 1600, pesos vivos). El estudiante de 8 pasos se entrenó desde cero con muestreo de 8 pasos. El repositorio también publica los datos de entrenamiento de H3 y de Wan2.1 (42.158 muestras del profesor Wan2.1-14B con sus latentes de vídeo real).

## Capacidades

- Generación conjunta de vídeo y audio a partir de texto (text-to-audio-video), con audio estéreo nativo.
- Generación de vídeo a 1344x768 de resolución.
- Muestreo rápido: 4 pasos (estudiantes `lora_critic` y `full_critic`) u 8 pasos (`8step_full_critic`).
- Destilación reutilizable: la metodología se aplica también a Wan2.1-T2V (1.3B y 14B), SDXL (4 y 1 pasos) e ImageNet-64 (1 paso).
- Integración con ComfyUI mediante LoRAs en su layout de claves y flujos de trabajo listos para ejecutar.
- Ejecución en GPUs de consumo gracias al modo `--low-vram` (5 s de vídeo en menos de 7 GiB, 15 s en 12 GiB).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo es puramente generativo visual.

## Casos de uso

- Prototipado rápido de vídeo con audio: un estudio puede generar clips de 5 a 15 segundos con sonido sincronizado en 4 u 8 pasos, lo que permite iterar sobre guiones y storyboards sin esperar minutos por muestra.
- Previsualización en pipelines de producción audiovisual: el estudiante de 4 pasos sirve para generar borradores rápidos que luego se refinan con el profesor de 50 pasos solo en las tomas seleccionadas.
- Generación en estaciones de trabajo con GPU de consumo: con el flujo de ComfyUI para 8 GB y `--low-vram`, un creador individual puede producir vídeo con audio en una RTX 3060 o similar sin infraestructura de centro de datos.
- Investigación en destilación de modelos generativos: el repositorio incluye código de entrenamiento (`train/h3`, `train/wan`, `train/image`) y datos, lo que permite reproducir el método y aplicarlo a otros profesores.
- Contenido para redes sociales y publicidad: la resolución 1344x768 y el audio nativo encajan en formatos horizontales de plataformas, con la ventaja de generar imagen y sonido en una sola pasada.
- Benchmarking de modelos de vídeo: AVGen-Bench se usa en la model card para comparar variantes (`full_critic` puntúa más alto que `lora_critic`), por lo que el modelo sirve como referencia en evaluaciones de generación audio-vídeo.

## Benchmarks y rendimiento

La model card menciona que `full_critic` obtiene una puntuación superior a `lora_critic` en AVGen-Bench, pero no se proporcionan cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 5 s de vídeo en menos de 7 GiB con `--low-vram`; 15 s de vídeo en 12 GiB; los flujos de ComfyUI caben en 14 GiB con resultados idénticos a ejecuciones en GPUs mayores.
- GPU de 8 GB: soportadas mediante el flujo de ComfyUI específico y el modo `--low-vram`.
- GPU de 16 GB: soportadas con los flujos de ComfyUI y `--low-vram` (14 GiB).
- GPU de centro de datos (A100, H100): no se detallan requisitos ni rendimiento específico, pero el modelo base de 33B y las LoRAs de 1,4-2,0 GB sugieren que se necesita cargar el profesor completo o su representación cuantizada.
- Opciones de despliegue: ComfyUI (flujos incluidos), código de inferencia del repositorio GitHub, librería `minimax-h3`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de muestreo | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DMAD (MiniMax-H3 4/8 pasos) | 33B (base) + LoRA | 4 u 8 | Texto a vídeo + audio | minimax-h3-community-license-agreement | Hugging Face, ModelScope, ComfyUI |
| MiniMax-H3 (profesor) | 33B | 50 | Texto a vídeo + audio | minimax-h3-community-license-agreement | Hugging Face |
| DMAD Wan2.1-T2V (1.3B/14B) | 1,3B / 14B | 4 | Texto a vídeo | no disponible en la información | Hugging Face |
| DMAD SDXL | no disponible | 4 y 1 | Texto a imagen | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- La licencia `minimax-h3-community-license-agreement` no es una licencia de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- El modelo es un destilado de 4 u 8 pasos: la calidad puede ser inferior a la del profesor de 50 pasos, especialmente en la variante `lora_critic` frente a `full_critic`.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo generativo visual, existe riesgo de contenido incoherente o no fiel al prompt.
- No se especifican los idiomas soportados para los prompts de texto.
- Los flujos de baja VRAM (8 GB) pueden imponer límites en duración y resolución que no se detallan.
- No se proporcionan cifras de benchmarks ni de latencia, lo que dificulta comparaciones cuantitativas objetivas.
- El repositorio ocupa 60,4 GB, lo que exige espacio de almacenamiento considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhengmingYu/DMAD
- Página del proyecto: https://yzmblog.github.io/projects/DMAD/
- Paper (arXiv): https://arxiv.org/abs/2610.02188
- Código en GitHub: https://github.com/Yzmblog/DMAD
- ModelScope: https://modelscope.ai/models/ZhengmingYu-Community/DMAD
- ModelScope CN: https://modelscope.cn/models/ZhengmingYu-Community/DMAD
- Vídeo de demostración: https://www.youtube.com/watch?v=cOCUCYZzAtE
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Dataset de entrenamiento H3: https://huggingface.co/datasets/ZhengmingYu/DMAD-H3-data
- Dataset de entrenamiento Wan2.1: https://huggingface.co/datasets/ZhengmingYu/DMAD-Wan-data
