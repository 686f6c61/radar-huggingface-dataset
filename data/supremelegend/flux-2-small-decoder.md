# SupremeLegend/FLUX.2-small-decoder

## Resumen

FLUX.2 Small Decoder es un decodificador VAE destilado publicado por el usuario SupremeLegend como reemplazo directo (*drop-in replacement*) del decodificador estándar de la familia FLUX.2 de Black Forest Labs. No es un modelo generativo completo, sino un componente del pipeline de difusión: sustituye únicamente la etapa de decodificación latente a píxeles, mientras que el codificador VAE permanece intacto. Su propósito es reducir el coste computacional y de memoria en la fase de decodificación sin degradar de forma apreciable la calidad de la imagen resultante.

El modelo es relevante porque la decodificación VAE es, en pipelines de difusión de alta resolución, uno de los cuellos de botella de VRAM y latencia. Al reducir los anchos de canal del decodificador de `[128, 256, 512, 512]` a `[96, 192, 384, 384]`, el autor reporta aproximadamente 1,4 veces menos VRAM en decodificación y 1,4 veces más velocidad, con una pérdida de calidad descrita como mínima. El checkpoint pesa 0,6 GB y contiene 62.373.347 parámetros totales en safetensors, de los cuales el autor atribuye unos 28 millones al decodificador.

Es compatible con los modelos abiertos de FLUX.2 (klein-4B, klein-9B, klein-9b-kv y dev) y se distribuye bajo licencia Apache 2.0. Se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a desarrolladores que ya trabajan con FLUX.2 y quieren optimizar el consumo de memoria en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (decodificador de difusion), componente de pipeline FLUX.2 |
| Parametros totales | 62.373.347 (checkpoint completo en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single file, libreria diffusers) |

## Arquitectura y entrenamiento

El modelo es un decodificador VAE para el espacio latente de FLUX.2. La innovación principal es la reducción de los anchos de canal respecto al decodificador completo: `[96, 192, 384, 384]` frente a `[128, 256, 512, 512]`. Esto rebaja el número de parámetros del decodificador de aproximadamente 50 millones a unos 28 millones, lo que se traduce en menor huella de memoria y mayor velocidad en la etapa de decodificación. El codificador no se modifica, de modo que el espacio latente y el resto del pipeline (transformador de difusión, scheduler, texto) siguen siendo los de FLUX.2.

El autor describe el checkpoint como "destilado", pero la model card no detalla el proceso de entrenamiento: no se especifican el número de pasos, la composición del dataset, la función de pérdida de destilación ni si hubo ajuste fino supervisado o destilación por imitación del decodificador completo. Tampoco se documentan técnicas adicionales como decodificación especulativa o atención lineal. Toda la información técnica disponible se limita a la comparación de anchos de canal, el recuento de parámetros y las métricas relativas de velocidad y VRAM.

## Capacidades

- Decodificación de latentes a imágenes dentro de pipelines FLUX.2 (text-to-image e image-to-image).
- Sustitución directa del VAE estándar de FLUX.2 sin cambios en el codificador.
- Compatibilidad con FLUX.2-klein-4B, FLUX.2-klein-9B, FLUX.2-klein-9b-kv y FLUX.2-dev.
- Generación de imágenes de alta resolución (ejemplo oficial a 1024x1024) con menor VRAM que el decodificador completo.
- Edición de imágenes mediante el pipeline image-to-image de FLUX.2.
- Inferencia rápida en pocos pasos (el ejemplo usa 4 pasos con `guidance_scale=1.0`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de audio o visión como modelo independiente: es un componente de un pipeline de imagen.

## Casos de uso

- Generación de imágenes en GPUs de consumo: al reducir aproximadamente un 1,4x la VRAM en decodificación, permite ejecutar FLUX.2-klein-4B a 1024x1024 en tarjetas con menos memoria que las requeridas por el decodificador completo.
- Aumento de resolución en produccion: la menor huella de memoria en la fase de decodificación facilita generar imágenes a resoluciones superiores sin agotar la VRAM, según el propio autor.
- Servicios de imagen con latencia ajustada: la decodificación aproximadamente 1,4x más rápida reduce el tiempo total por imagen en endpoints de generación bajo demanda.
- Edición de imágenes por lotes: integrado en pipelines image-to-image de FLUX.2 para tareas de retoque o variación de imágenes con mayor throughput.
- Prototipado e investigación: al ser un reemplazo directo del VAE, permite comparar calidad y coste frente al decodificador completo sin reentrenar el resto del pipeline.
- Despliegue en entornos con presupuesto de memoria limitado: útil en contenedores o instancias cloud con VRAM restringida donde el decodificador completo no cabe junto al transformador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas relativas frente al decodificador completo:

| Metrica | Decodificador completo | Small Decoder |
|---|---|---|
| Parametros del decodificador | ~50M | ~28M |
| Anchura de canales | [128, 256, 512, 512] | [96, 192, 384, 384] |
| Velocidad de decodificacion | referencia | ~1,4x mas rapida |
| VRAM en decodificacion | referencia | ~1,4x menor |
| Calidad de imagen | referencia | perdida minima (cualitativa) |

No se proporcionan valores absolutos de latencia, throughput, FID, CLIP score ni comparaciones cuantitativas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma absoluta; el autor solo indica una reducción de aproximadamente 1,4x en VRAM de decodificación respecto al decodificador completo. El checkpoint ocupa 0,6 GB.
- GPU recomendadas: no especificadas en la informacion disponible. El ejemplo oficial usa `device = "cuda"` con `bfloat16` y `enable_model_cpu_offload()`.
- Compatibilidad con GPU de consumo: probablemente sí para FLUX.2-klein-4B con offload de CPU, pero no se aportan cifras concretas de VRAM ni modelos de tarjeta verificados.
- Opciones de despliegue: librería `diffusers` (instalación desde el repositorio Git de Hugging Face), con `Flux2KleinPipeline` y `AutoencoderKLFlux2`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VAE de difusión).
- Latencia y throughput: no disponibles en valores absolutos; solo el factor relativo de aproximadamente 1,4x en decodificación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2 Small Decoder (este) | Decodificador VAE destilado | 62,4M en checkpoint (~28M decodificador) | no aplica | Apache 2.0 | Hugging Face, diffusers |
| Decodificador VAE completo de FLUX.2 | Decodificador VAE | ~50M (decodificador) | no aplica | la del modelo FLUX.2 asociado | Incluido en los checkpoints FLUX.2 |
| Alternativas de decodificadores VAE destilados para otros modelos de difusion | Decodificador VAE | no disponible | no aplica | variable | no disponible |

No se dispone de datos de rendimiento cuantitativos que permitan una comparación objetiva con decodificadores alternativos de otros pipelines.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere un pipeline FLUX.2 completo (transformador, texto, scheduler) para producir imágenes.
- No proporciona información factual; el autor lo declara explícitamente.
- El texto renderizado en las imágenes puede ser inexacto o estar distorsionado.
- Como modelo estadístico, puede reproducir o amplificar sesgos presentes en los datos de entrenamiento.
- Puede no seguir fielmente las instrucciones del prompt; el seguimiento depende en gran medida del estilo de prompting.
- La pérdida de calidad frente al decodificador completo se describe como "mínima", pero no se cuantifica con métricas objetivas.
- Solo se declara soporte de inglés para los prompts.
- Uso fuera del alcance de la licencia prohibido, incluidos fines ilícitos, fraudulentos, difamatorios o abusivos, según las políticas de uso referenciadas.
- El uso de las marcas FLUX y Black Forest Labs en versiones modificadas no debe sugerir patrocinio ni respaldo.
- Repositorio sin descargas ni likes y con fecha de creación y actualización idénticas (2026-11-01): sin evidencia de validación por parte de la comunidad.
- El proceso de destilación y los datos de entrenamiento no están documentados, lo que dificulta evaluar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupremeLegend/FLUX.2-small-decoder
- FLUX.2-klein-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- FLUX.2-klein-9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- FLUX.2-klein-9b-kv: https://huggingface.co/black-forest-labs/FLUX.2-klein-9b-kv
- FLUX.2-dev: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Repositorio de diffusers: https://github.com/huggingface/diffusers
- Blog de seguridad de Black Forest Labs: https://bfl.ai/blog/capable-open-and-safe-combating-ai-misuse
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto de seguridad: safety@blackforestlabs.ai
