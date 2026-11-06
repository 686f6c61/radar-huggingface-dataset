# ViniciusKhan/ignis-image-lora-v1

## Resumen

IGNIS Image LoRA v1 es un adaptador LoRA de rango 8 para el UNet de Stable Diffusion 1.5, desarrollado por Vinicius de Souza Santos (usuario ViniciusKhan) como parte del proyecto experimental IGNIS Multimodal. No es un modelo de difusión completo: se distribuye como un fichero `pytorch_lora_weights.safetensors` de aproximadamente 6,41 MB que contiene únicamente las actualizaciones de bajo rango aprendidas sobre las proyecciones de atención del UNet, y requiere descargar por separado los componentes de la base Stable Diffusion 1.5 (VAE, encoder de texto CLIP y pesos originales del UNet).

El adaptador se entrenó sobre un recorte muy pequeño de 96 pares imagen-caption extraídos de DiffusionDB (82 para entrenamiento y 14 para validación), con resolución 512 × 512 y 550 actualizaciones del optimizador en una GPU de portátil RTX 4050 con 6 GB de VRAM. El autor declara explícitamente que el experimento está concluido y que las evidencias disponibles no demuestran superioridad general sobre el modelo base, lo que sitúa la ficha en el terreno de la experimentación reproducible más que en el de un modelo listo para producción.

Su relevancia actual es limitada pero ilustrativa: documenta con transparencia poco habitual (informes de entrenamiento, evaluación y procedencia de datos en el repositorio) el flujo completo de un fine-tuning LoRA de difusión a pequeña escala, incluyendo separación train/validación con verificación de hashes y early stopping. Es útil como referencia metodológica y como ejemplo de adaptador de bajo coste, no como generador de imágenes de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de Stable Diffusion 1.5; pipeline text-to-image con tokenizer y encoder CLIP, UNet y VAE |
| Parametros totales | 1.594.368 elementos en los tensores del adaptador (aproximadamente 1,59 M); los pesos base de SD 1.5 no se incluyen |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión condicionado por prompt de texto; no maneja contexto conversacional) |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors de precisión original, sin variantes GGUF ni cuantizadas documentadas |
| Idiomas soportados | Inglés (recomendado) y portugués (aceptado como entrada, sin evaluación específica) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Safetensors (`pytorch_lora_weights.safetensors`, 6.414.992 bytes) |

## Arquitectura y entrenamiento

El adaptador aplica la formulación estándar de LoRA sobre el UNet de Stable Diffusion 1.5: para cada matriz adaptada, la actualización toma la forma `W' = W + (α/r) BA`, con rango y alpha iguales a 8 e inicialización gaussiana. Los módulos objetivo son las proyecciones de atención `to_q`, `to_k`, `to_v` y `to_out.0`. El VAE, el encoder de texto CLIP y los parámetros originales del UNet permanecen congelados; el encoder de texto no recibe adaptación LoRA. El pipeline completo usa tokenizer y encoder CLIP para representar el texto, el UNet para estimar ruido en el espacio latente y el VAE para codificar y decodificar imágenes.

El entrenamiento se ejecutó sobre 82 imágenes de entrenamiento y 14 de validación procedentes de un recorte de DiffusionDB (archivo `images/part-000001.zip`, revisión `fb620fbe49fa4420e0734bd9c0df11f51176b61f`, licencia CC0 1.0 declarada por los mantenedores), con resolución 512 × 512, batch por dispositivo 1, acumulación de gradientes 4 (batch efectivo 4), optimizador AdamW con weight decay 0,01, learning rate inicial 1e-4, scheduler coseno con warmup de 50 actualizaciones, seed 42 y checkpoints y validación cada 50 pasos. El límite configurado era de 800 actualizaciones, pero se ejecutaron 550 por early stopping (paciencia 5, mínimo 300 pasos, mejora mínima 1e-5), con motivo de parada `early_stopping_validation`. El hardware fue una RTX 4050 Laptop con 6 GB de VRAM, 32 GB de RAM y Windows. La separación train/validación usó seed 42 y fingerprint `90c1f9c61a6dfa9716dd866880f90b9973131bced5e87872f37bfd30bdf6f999`; la comprobación de esta versión encontró 0 hashes de imagen en común entre ambos conjuntos. No se menciona uso de RLHF ni DPO, lo cual es esperable en un adaptador de difusión.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 × 512 mediante el pipeline de Stable Diffusion 1.5 más el adaptador LoRA.
- Edición de imágenes: el pipeline admite imagen y máscara de entrada según la model card, además de la descripción textual.
- Condicionamiento por prompt en inglés (recomendado) y portugués (aceptado como entrada, sin evaluación específica).
- No introduce token especial ni palabra de activación; el adaptador modifica el comportamiento del UNet sin necesidad de trigger word.
- No realiza OCR, comprensión visual ni conversación: los pesos publicados no incluyen esas capacidades.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un adaptador puramente generativo visual.
- Integración con la librería `diffusers` y con el Space de demostración IGNIS Image Lab.

## Casos de uso

- Experimentación académica con LoRA en difusión: reproducir el flujo completo de fine-tuning (preparación de dataset, separación con hashes, early stopping, informes de evaluación) usando los ficheros `training_report.json`, `evaluation_report.json` y `data_provenance.json` como referencia metodológica.
- Prototipado rápido de estilos visuales sobre SD 1.5: cargar el adaptador junto a la base para explorar variaciones estéticas con un coste de almacenamiento de 6,41 MB y sin reentrenar el modelo completo.
- Docencia y formación: ilustrar cómo funciona la adaptación de bajo rango (`W' = W + (α/r) BA`) sobre módulos de atención concretos (`to_q`, `to_k`, `to_v`, `to_out.0`) en un caso real y auditable.
- Pruebas de pipelines de edición con máscara: validar flujos de inpainting o edición guiada por texto sobre la base SD 1.5 con el adaptador aplicado, en entornos de investigación.
- Evaluación comparativa de adaptadores pequeños: usar los 14 pares de validación y las 6 comparaciones visuales documentadas como punto de partida para medir si un LoRA aporta mejoras reproducibles frente al modelo base.
- Demostración en el Space IGNIS Image Lab: desplegar la interfaz pública de generación y edición para mostrar el adaptador sin exponer el backend completo de la plataforma multimodal.
- Integración en una plataforma multimodal local como componente de generación de imágenes, junto a integraciones separadas de comprensión visual (SmolVLM2, Qwen3-VL) cuyos pesos no forman parte de este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card documenta 550 actualizaciones del optimizador y 6 comparaciones visuales, y afirma explícitamente que las evidencias disponibles no demuestran superioridad general sobre el modelo base. No se proporcionan métricas FID, CLIP score ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita para el adaptador; el entrenamiento se realizó con 6 GB de VRAM en una RTX 4050 Laptop, lo que da una referencia del orden de magnitud para el pipeline completo a 512 × 512.
- GPU recomendadas: no disponibles en la información proporcionada; el adaptador en sí ocupa 6,41 MB y el requisito real lo determina la base Stable Diffusion 1.5.
- Cabe en GPU de consumo: sí, según la evidencia de entrenamiento en RTX 4050 Laptop con 6 GB de VRAM; no se detallan otras GPU concretas.
- Opciones de despliegue: librería `diffusers` (formato nativo del adaptador) y el Space IGNIS Image Lab; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IGNIS Image LoRA v1 | LoRA sobre UNet de SD 1.5 | 1,59 M en el adaptador | No aplica | CreativeML OpenRAIL-M | Hugging Face, 24 descargas |
| Stable Diffusion 1.5 (base) | Modelo de difusión completo | No disponible en la información | No aplica | CreativeML OpenRAIL-M | Hugging Face |
| Otros LoRA para SD 1.5 | Adaptadores LoRA | No disponible | No aplica | Variable según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada, por lo que la comparativa se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara que las evidencias no demuestran superioridad general sobre el modelo base; no debe presentarse como una mejora validada.
- Dataset de entrenamiento muy reducido (82 imágenes de entrenamiento y 14 de validación) y no representativo de la diversidad de imágenes posibles.
- Las imágenes de entrenamiento son sintéticas, generadas originalmente por Stable Diffusion a partir de prompts de DiffusionDB, lo que puede amplificar sesgos del modelo original.
- La exclusión textual es heurística y no hay certificación de seguridad visual; la deduplicación exacta no elimina similitudes semánticas ni sesgos.
- Riesgo de alucinación visual inherente a los modelos de difusión: el adaptador no garantiza fidelidad al prompt ni coherencia factual.
- El idioma recomendado es el inglés; el portugués se acepta como entrada pero no se ha evaluado específicamente.
- Licencia CreativeML OpenRAIL-M: impone restricciones de uso (incluida la prohibición de usos dañinos descritos en la licencia) y requiere revisión antes de uso comercial.
- El adaptador no funciona de forma autónoma: requiere descargar los componentes de Stable Diffusion 1.5 y respetar su licencia y la atribución de autoría de los pesos base.
- No apto para OCR, comprensión visual, conversación, tool calling ni tareas de agente.
- Repositorio con 0 likes y 24 descargas en el momento de la consulta; sin mantenimiento ni comunidad documentada.

## Enlaces

- Hugging Face: https://huggingface.co/ViniciusKhan/ignis-image-lora-v1
- Space de demostración: https://huggingface.co/spaces/ViniciusKhan/IGNIS-Image-Lab
- Pesos: https://huggingface.co/ViniciusKhan/ignis-image-lora-v1/blob/main/pytorch_lora_weights.safetensors
- Informe de entrenamiento: https://huggingface.co/ViniciusKhan/ignis-image-lora-v1/blob/main/training_report.json
- Informe de evaluación: https://huggingface.co/ViniciusKhan/ignis-image-lora-v1/blob/main/evaluation_report.json
- Procedencia de datos: https://huggingface.co/ViniciusKhan/ignis-image-lora-v1/blob/main/data_provenance.json
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/poloclub/diffusiondb
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Paper Stable Diffusion: https://arxiv.org/abs/2112.10752
