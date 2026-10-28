# yonderboard/abdulcigarettes_LoRA

## Resumen

`yonderboard/abdulcigarettes_LoRA` es un adaptador LoRA para generación de imágenes text-to-image entrenado con DreamBooth sobre `stabilityai/stable-diffusion-xl-base-1.0`. Lo publica el usuario de HuggingFace `yonderboard` y su función es inyectar en SDXL un estilo concreto, activado mediante el prompt de disparo `photo collage in CHERKASHIN style`. No es un modelo de lenguaje: no procesa texto como salida ni admite razonamiento, tool calling o agentes; su única salida son imágenes.

El repositorio es de tipo `diffusers` + `template:sd-lora`, con pesos en safetensors y licencia OpenRAIL++. La model card se ha generado automáticamente desde el script de entrenamiento y conserva varios apartados con marcadores `[TODO]` (uso previsto, sesgos, detalles del dataset), por lo que la información sobre datos de entrenamiento, rango del LoRA y número de pasos no está disponible públicamente.

Su relevancia práctica es limitada y muy específica: sirve para reproducir un estilo de collage fotográfico en pipelines SDXL ya existentes. Con 0 descargas y 0 likes en el momento de la consulta, y sin demos ni ejemplos en la ficha, debe tratarse como un experimento personal sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango, PEFT) sobre el UNet de SDXL; el modelo base es un diffusion transformer latente con dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) |
| Parametros totales | no disponible (no se declara el rango ni el número de módulos adaptados; el modelo base SDXL ronda los 3.500 millones de parámetros entre UNet y text encoders) |
| Longitud de contexto | no aplica (modelo text-to-image); los text encoders de SDXL aceptan 77 tokens por prompt |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors para cargar en fp16/bf16 con diffusers. No se publican versiones GGUF ni cuantizadas |
| Idiomas soportados | no disponible; el prompt de disparo está en inglés y no se documenta cobertura multilingüe |
| Licencia | openrail++ |
| Formato de pesos | safetensors (formato LoRA compatible con diffusers / PEFT) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Prompt de activacion | `photo collage in CHERKASHIN style` |
| Text encoder entrenado | no (LoRA del text encoder desactivado: `LoRA for the text encoder was enabled: False`) |
| VAE usado en entrenamiento | madebyollin/sdxl-vae-fp16-fix |
| Metodo de entrenamiento | DreamBooth |
| Dataset de entrenamiento | no disponible (apartado `[TODO]` en la model card) |
| Fecha declarada de creacion | 2026-10-28 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre el UNet del modelo base SDXL 1.0; el LoRA del text encoder está desactivado, de modo que el condicionamiento textual lo resuelve el modelo original sin modificar. Esto implica que el estilo aprendido se activa por la vía visual del UNet y no por un remapeo de embeddings de texto, por lo que el prompt de disparo debe reproducirse literalmente para obtener el efecto esperado. El entrenamiento se realizó con DreamBooth, la técnica de ajuste con pocas imágenes (típicamente 5-20) que asocia un identificador raro a un sujeto o estilo, y se usó la variante de VAE `madebyollin/sdxl-vae-fp16-fix`, habitual para evitar desbordamientos numéricos al entrenar en fp16.

No se publican ni el rango del LoRA (dim), ni el número de pasos, ni el learning rate, ni la resolución de entrenamiento, ni la composición del dataset. Tampoco se documenta si hubo regularización, aumentos de datos o captioning previo. No hay innovaciones técnicas declaradas (ni decodificación especulativa, ni atención lineal, ni destilación): es un DreamBooth LoRA estándar sobre SDXL.

## Capacidades

- Generación de imágenes text-to-image condicionada por prompt, heredando las capacidades generales de SDXL 1.0 (resolución nativa de 1024x1024).
- Transferencia de estilo: reproduce un estilo de collage fotográfico al activarse con `photo collage in CHERKASHIN style`.
- Composición de múltiples imágenes en una sola salida, según indica el propio prompt de disparo ("photo collage"), aunque no hay galería ni ejemplos que lo verifiquen.
- Combinable con otros LoRA de SDXL en la misma pipeline (pesos de adaptador apilables, sujeto a prueba empírica).
- Control de intensidad del estilo mediante el scale del LoRA en el pipeline de diffusers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": no es un modelo lingüístico.
- Generación por lotes y automatizable vía API de diffusers, ComfyUI o scripts propios.
- Capacidades multilingües: no documentadas; el prompt de disparo está en inglés.

## Casos de uso

- Producción de collages editoriales para revistas o fanzines: se integra en un pipeline SDXL y se invoca con el prompt de disparo para generar composiciones fotográficas con una estética homogénea y coherente entre páginas.
- Moodboards para dirección de arte: agencias que necesiten explorar variantes de un estilo de collage pueden generar decenas de propuestas en minutos, con el scale del LoRA como parámetro de ajuste de fidelidad frente al estilo.
- Pruebas de concepto de campaña: generar key visuals preliminares antes de contratar fotografía o retoque, usando SDXL como base y el LoRA para fijar la dirección estética.
- Aumento de datos para entrenamiento de clasificadores o modelos de estética: generar un conjunto sintético con un estilo controlado y etiquetado para tareas de visión por computador.
- Prototipado de cartelería y portadas: maquetas rápidas de póster, portada de disco o cubierta de libro donde el collage fotográfico es el lenguaje visual dominante.
- Experimentación en investigación sobre personalización de modelos de difusión: caso de estudio de DreamBooth sobre SDXL con text encoder congelado, útil para comparar la transferencia de estilo vía UNet frente a vía text encoder.
- Generación de material para pruebas internas de herramientas de edición: bancos de imágenes con estética consistente para validar pipelines de upscaling, inpainting o segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de estilo), ni comparaciones cuantitativas, ni galería de ejemplos (`widget: []`).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade una sobrecarga despreciable; el coste lo determina SDXL 1.0, en torno a 8-10 GB en fp16 a 1024x1024 con atención optimizada, y aproximadamente 6-7 GB con offloading de módulos a CPU.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para generación por lotes sin restricciones; A10G (24 GB), L40S o A100 (40/80 GB) para servir varios workers en producción.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores. En tarjetas de 8 GB requiere fp16 con offloading o resolución reducida.
- Opciones de despliegue: diffusers (con `load_lora_weights`), ComfyUI, Automatic1111/Forge, SD.Next, InvokeAI y stable-diffusion.cpp para entornos sin GPU dedicada. vLLM, TGI, llama.cpp y Ollama no aplican: son servidores de modelos de lenguaje, no de difusión.
- Latencia y throughput: no disponible; no se han publicado mediciones. Como referencia del modelo base, la generación de una imagen de 1024x1024 con 25-30 pasos suele situarse en el orden de 2-5 segundos en una RTX 4090, pero es una estimación del base y no un dato medido de este LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Prompt / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yonderboard/abdulcigarettes_LoRA | LoRA DreamBooth sobre SDXL | no disponible (adaptador); base ~3.500 M | 77 tokens (text encoders SDXL) | openrail++ | HuggingFace, 0 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base completo | ~3.500 M (UNet ~2.600 M + text encoders) | 77 tokens | openrail++ | Ampliamente disponible, ecosistema maduro |
| Fine-tune completo de SDXL con DreamBooth | Modelo completo ajustado | ~3.500 M | 77 tokens | depende del autor (habitualmente openrail++) | Múltiples variantes en HuggingFace |
| LoRA DreamBooth sobre Stable Diffusion 1.5 | LoRA sobre SD 1.5 | base ~860 M | 77 tokens | CreativeML OpenRAIL-M | Ecosistema muy extenso, menor resolución nativa (512x512) |

Frente a un fine-tune completo, este LoRA ofrece la ventaja de un fichero mucho más pequeño y reversible (se puede descargar del pipeline en tiempo de ejecución), a costa de menor capacidad de cambio y de no haber sido entrenado en el text encoder. Frente a SD 1.5, SDXL aporta resolución nativa de 1024x1024 y mejor adherencia al prompt, con un coste de VRAM notablemente mayor.

## Limitaciones y advertencias

- Model card autocontenida y sin completar: los apartados de uso previsto, sesgos y detalles de entrenamiento siguen como `[TODO]`, por lo que se desconoce el dataset y sus posibles sesgos.
- Sin validación externa: 0 descargas y 0 likes, sin galería de ejemplos ni demos; no hay evidencia pública de que el estilo se reproduzca de forma consistente.
- Ambigüedad entre el nombre del repositorio (`abdulcigarettes_LoRA`, que sugiere un sujeto o persona) y el prompt de disparo (`photo collage in CHERKASHIN style`, que sugiere un estilo). Puede ser tanto un LoRA de identidad como de estilo, y la ficha no lo aclara.
- Riesgo de sobreajuste y de reproducción de elementos de las imágenes de entrenamiento, propio de DreamBooth con pocos datos; si el dataset contiene personas reales, pueden aparecer problemas de likeness y de derechos de imagen.
- Alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y composiciones incoherentes, especialmente en collages con muchos elementos.
- El text encoder no se ha entrenado, de lo contrario a lo indicado: el estilo depende del prompt exacto y pierde eficacia con paráfrasis o traducciones al castellano.
- Limitación de idioma: no se documenta soporte multilingüe; los prompts en castellano pueden degradar el resultado.
- Licencia OpenRAIL++: permite uso comercial con restricciones de uso (prohibición de usos dañinos, de vigilancia masiva y de desinformación, entre otras); conviene revisar el texto completo antes de integrarlo en un producto. Además, las restricciones del modelo base SDXL 1.0 se heredan.
- Fecha de creación declarada en 2026-10-28, posterior a la fecha habitual de consulta; conviene verificar la integridad de los metadatos del repositorio.
- No apto para producción crítica sin evaluación previa: sin métricas, sin ejemplos y sin historial de uso, el riesgo de resultados fuera de estilo es alto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yonderboard/abdulcigarettes_LoRA
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE usado en entrenamiento: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Paper de DreamBooth: https://dreambooth.github.io/
- Documentación de diffusers para LoRA: https://huggingface.co/docs/diffusers
