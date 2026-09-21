# SupraLabs/Supra2-IMG

## Resumen

Supra2-IMG es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por SupraLabs y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un diffusion transformer (DiT) diminuto, de 104,5 millones de parámetros, entrenado desde cero sobre el dataset sintético LucasFang/FLUX-Reason-6M. El modelo genera imágenes de 256×256 píxeles en espacio latente de 32×32 mediante un VAE congelado (SD-VAE-FT-MSE) y condiciona la generación con un encoder de texto también congelado, Flan-T5-Base, con una ventana de 128 tokens.

Su relevancia no está en competir con modelos de gran escala, sino en el extremo opuesto: demuestra que un DiT entrenado íntegramente desde cero, con un presupuesto de cómputo muy reducido (9 horas en una única NVIDIA H100 SXM de 80 GB), puede alcanzar una calidad visual notable para su tamaño. Esto lo convierte en una pieza útil para investigación reproducible, ablaciones de arquitectura y despliegues en hardware muy limitado, incluido CPU.

El modelo no cuenta con resultados de benchmarks publicados, no ofrece versiones cuantizadas ni integración con Diffusers, y su uso requiere el script de inferencia propio del autor (`inference.py`), ya que el repositorio contiene código personalizado (`custom_code`) y el visor de HuggingFace está desactivado (`viewer: false`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) en espacio latente, denominada SupraDiT en el código del autor |
| Parámetros totales | 104,5 M en el DiT (la model card cita 100 M y ~105 M; el script de inferencia reporta 104,1 M). No incluye el encoder de texto ni el VAE, que se emplean congelados |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128 tokens de prompt (límite del encoder Flan-T5-Base) |
| Tipos de cuantización | No disponible: solo se publica el checkpoint `model_final_ema.pt` en punto flotante. No hay versiones GGUF, int8, int4 ni fp8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch (`.pt`) con código personalizado (`custom_code`); no compatible directamente con Diffusers |
| Resolución de imagen | 256×256 px (latente 32×32, patch de 2) |
| Encoder de texto | google/flan-t5-base congelado, `D_CTX` = 768 |
| VAE | stabilityai/sd-vae-ft-mse congelado, `VAE_SCALE` = 0,18215 |
| Configuración del DiT | `D_MODEL` = 576, `DEPTH` = 14, `N_HEADS` = 9, `HEAD_DIM` = 64, `MLP_RATIO` = 4,0 |
| Tamaño del repositorio | 0,4 GB |
| Pipeline declarado | text-to-image (etiquetas adicionales: feature-extraction, t2i, from scratch, small) |

## Arquitectura y entrenamiento

Supra2-IMG sigue el esquema clásico de difusión latente: un VAE congelado comprime la imagen de 256×256 a un latente de 32×32, un transformer de difusión opera sobre ese latente y el texto se inyecta mediante embeddings de un Flan-T5-Base congelado. El DiT tiene 14 capas, ancho de 576, 9 cabezas de atención con dimensión 64 por cabeza y ratio de MLP de 4,0, lo que suma 104,5 M de parámetros. El muestreo se realiza con un sampler Euler flow, guidance libre de clasificador (CFG) con embeddings incondicionales prealmacenados, 50 pasos y un valor de CFG recomendado de 3,0, con semilla configurable para reproducibilidad.

El entrenamiento se hizo desde cero durante 10 épocas sobre las 5,6 millones de imágenes utilizadas del dataset LucasFang/FLUX-Reason-6M (datos sintéticos de alta calidad). La selección del prompt de cada imagen siguió un orden de prioridad con mecanismo de respaldo: `caption_composition` → `caption_entity` → `caption_text` → `caption_style` → `caption_imaginative`, de forma que solo se emplearon las anotaciones de mayor calidad. Todo el proceso, incluida la preparación de datos, se ejecutó en 9 horas sobre una única NVIDIA H100 SXM de 80 GB en Runpod, con 2,5 TB de almacenamiento en disco.

No se documenta el uso de RLHF, DPO ni ajuste por preferencias; se trata de un entrenamiento de difusión puro sobre pares imagen-texto. El checkpoint publicado es una media móvil exponencial de los pesos (`model_final_ema.pt`).

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés, a resolución fija de 256×256 píxeles.
- Condicionamiento textual en inglés mediante el encoder Flan-T5-Base congelado, con un máximo de 128 tokens de prompt.
- Muestreo con guidance libre de clasificador (CFG 3,0 recomendado) y sampler Euler flow a 50 pasos.
- Generación reproducible mediante semilla (`--seed`) y generación por lotes (`--n`).
- Ejecución autocontenida mediante el script `inference.py` proporcionado por el autor, con carga de pesos en aproximadamente 0,7 s según el log de ejemplo.
- Etiqueta `feature-extraction` declarada en HuggingFace, aunque la model card no documenta ningún uso de extracción de características; probablemente sea una etiqueta heredada del etiquetado automático.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No soporta entrada multimodal (imagen, audio o vídeo); solo texto como entrada.
- No soporta idiomas distintos del inglés de forma declarada.
- No incluye modo thinking, visión, audio, image-to-image, inpainting, ControlNet ni LoRA.

## Casos de uso

- Prototipado visual rápido: generar bocetos de 256×256 para validar una dirección artística o un concepto antes de invertir en un modelo mayor; el bajo coste por imagen permite iterar cientos de variaciones con distintas semillas y valores de CFG.
- Previsualización en pipelines de dos etapas: usar Supra2-IMG como generador de borradores barato y, una vez fijado el prompt y la semilla, reproducir la composición con un modelo de mayor resolución como FLUX o SDXL, reduciendo el gasto de cómputo en la fase exploratoria.
- Generación de datos sintéticos para clasificación: producir lotes de imágenes etiquetadas a 256×256 para aumentar datasets de entrenamiento de clasificadores o detectores de baja resolución, aprovechando que el modelo corre en hardware modesto y que los datos de origen ya son sintéticos.
- Despliegue en hardware sin GPU: al tratarse de un DiT de 104,5 M de parámetros con encoder y VAE congelados, el pipeline completo cabe en memoria modesta y puede ejecutarse en CPU para demos internas, herramientas de escritorio o entornos de integración continua sin acelerador.
- Investigación reproducible en difusión latente: el coste declarado de entrenamiento (9 horas en una H100, 5,6 M de imágenes, 10 épocas) hace viable reproducir el entrenamiento completo o ejecutar ablaciones sobre profundidad, ancho y número de cabezas con presupuesto limitado.
- Docencia y formación técnica: sirve para explicar de forma práctica el funcionamiento de un DiT, el papel del VAE, el condicionamiento cruzado con un encoder de texto congelado y el efecto del CFG, con pesos abiertos y código legible.
- Herramientas de diseño y wireframing: generar imágenes de relleno coherentes con el prompt para maquetas, presentaciones o pruebas de concepto de producto en las que la resolución final no es crítica.
- Prueba de concepto de producto antes de escalar: validar si un caso de uso concreto justifica adoptar un modelo de imagen mayor, midiendo primero viabilidad y latencia con un modelo de 0,4 GB de checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma calidad "SOTA" para su tamaño, pero no incluye métricas objetivas (FID, CLIP score, GenEval, HPSv2 ni comparativas cuantitativas con otros modelos). Tampoco se publican cifras de latencia de muestreo más allá del ejemplo de log, que imprime el tiempo de denoising sin valor numérico concreto.

## Requisitos de hardware

- Tamaño del checkpoint publicado: 0,4 GB, correspondiente al DiT en el formato `model_final_ema.pt`.
- VRAM estimada para inferencia (estimación propia a partir del recuento de parámetros, no confirmada por el autor): alrededor de 0,2 GB para el DiT en fp16, 0,5 GB para Flan-T5-Base en fp16 y 0,2 GB para el decodificador del VAE; el pipeline completo debería operar por debajo de 2 GB, más el espacio de activaciones del latente de 32×32.
- Cabe en GPUs de consumo: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090) debería ser suficiente. También es viable en CPU, aunque sin cifras de rendimiento publicadas.
- Entrenamiento: una única NVIDIA H100 SXM de 80 GB durante 9 horas, con 2,5 TB de disco para los datos.
- Opciones de despliegue: únicamente el script propio `inference.py` distribuido en el repositorio. No hay integración con Diffusers, vLLM, TGI, Ollama ni llama.cpp, y no se publican pesos en GGUF ni safetensors.
- Latencia y throughput: no disponible. El log de ejemplo muestra una carga de pesos de 0,7 s, pero el tiempo de denoising y la velocidad de generación no se especifican.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de documentación pública y no de pruebas comparativas directas con Supra2-IMG; no existen benchmarks publicados que enfrenten a estos modelos.

| Modelo | Parámetros | Resolución nativa | Licencia | Disponibilidad |
|---|---|---|---|---|
| Supra2-IMG | 104,5 M (DiT) + encoder y VAE congelados | 256×256 | Apache-2.0 | Pesos `.pt` y código propio en HuggingFace |
| SD 1.5 (UNet) | ~860 M (UNet) + encoder y VAE | 512×512 | CreativeML OpenRAIL-M | Integración nativa en Diffusers, ecosistema amplio de LoRA y ControlNet |
| Segmind Tiny-SD | ~0,5 B, destilado de SD 1.5 | 512×512 | CreativeML OpenRAIL-M | Diffusers |
| FLUX.1-schnell | ~12 B | 1024×1024 | Apache-2.0 | Diffusers, ecosistema amplio |

Frente a SD 1.5 y Tiny-SD, Supra2-IMG es entre cinco y ocho veces más pequeño, pero genera a la mitad de resolución y carece del ecosistema de herramientas (LoRA, ControlNet, img2img) y de la integración con Diffusers. Frente a FLUX.1-schnell comparte licencia permisiva, pero opera en un orden de magnitud distinto de parámetros y resolución.

## Limitaciones y advertencias

- Resolución fija y baja: 256×256 píxeles, insuficiente para producción gráfica o impresión sin reescalado posterior.
- Ventana de prompt muy corta: solo 128 tokens de Flan-T5-Base; las descripciones largas o detalladas se truncan, con la consiguiente pérdida de control sobre la composición.
- Idioma: únicamente inglés declarado; no hay garantías de comportamiento correcto con prompts en castellano u otros idiomas.
- Sesgos: al entrenarse sobre el dataset sintético FLUX-Reason-6M, hereda los sesgos de representación, estilo y composición de ese corpus y del modelo que lo generó. No se documenta ningún proceso de mitigación ni de filtrado de seguridad.
- Alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, texto ilegible dentro de la imagen, objetos incoherentes o composiciones imposibles, especialmente con prompts complejos.
- Sin filtros de seguridad documentados: la model card no menciona moderación de contenido ni clasificadores de seguridad, por lo que el desarrollador debe implementarlos si el despliegue es público.
- Integración limitada: requiere código personalizado (`custom_code`) y el script `inference.py`; no funciona con la API estándar de Diffusers y el visor de HuggingFace está desactivado, lo que dificulta su evaluación rápida.
- Sin cuantizaciones: solo existe un checkpoint en punto flotante, sin versiones GGUF, int8 ni int4 que reduzcan aún más el consumo de memoria.
- Licencia de los componentes congelados: el modelo se distribuye bajo Apache-2.0, pero el encoder Flan-T5-Base y el VAE SD-VAE-FT-MSE se usan congelados desde repositorios de terceros; conviene verificar sus condiciones de uso antes de un despliegue comercial, ya que la información disponible no detalla la licencia aplicable a esos componentes.
- Madurez y mantenimiento: el repositorio registra 0 descargas y 13 "likes" en el momento de la consulta, el autor anuncia una futura versión Supra2.5-IMG y no hay garantía de soporte a largo plazo.
- Ausencia de datos de rendimiento: sin benchmarks ni cifras de latencia, la decisión de adopción debe basarse en pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SupraLabs/Supra2-IMG
- Script de inferencia: https://huggingface.co/SupraLabs/Supra2-IMG/resolve/main/inference.py
- Dataset de entrenamiento: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Encoder de texto: https://huggingface.co/google/flan-t5-base
- VAE: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Modelo citado como inspiración por el autor: https://huggingface.co/rootxhacker/HobbyLM-Image
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (programas de congresos ICPE 2026 e ICPEEE 2026), por lo que no aportan información adicional.
