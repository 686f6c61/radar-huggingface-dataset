# VideoRebirthAI/hyperflow

## Resumen

HyperFlow es un adaptador LoRA de 8 pasos para el modelo de generación de vídeo y audio MiniMax-H3, desarrollado por Video Rebirth y distribuido en Hugging Face bajo el identificador `VideoRebirthAI/hyperflow`. No se trata de un modelo independiente: es un adaptador PEFT que se carga sobre los pesos oficiales de `MiniMaxAI/MiniMax-H3` y reduce el número de evaluaciones del denoiser de 49 (el schedule sigma por defecto de diffusers con 50 puntos) a 8, manteniendo intactos los pesos base, los VAE, el condicionador y los flujos de trabajo oficiales (`t2va`, `fl2va`, `ref2va`).

El adaptador se obtiene mediante autodestilación de flujo (flow self-distillation) sin datos, un procedimiento que entrena al modelo a reproducir su propia trayectoria de muestreo en pocos pasos sin necesidad de un dataset externo. El resultado es una aceleración de aproximadamente 3x de extremo a extremo frente a la línea base de 49 NFE de diffusers: unos 60 segundos frente a unos 175 segundos por clip sobre 4x H200, según la model card.

Su relevancia actual radica en que hace viable la generación de vídeo con audio en pocos pasos sobre hardware de consumo y en pipelines de producción, algo crítico para modelos de vídeo de gran tamaño. El repositorio pesa 2,8 GB y contiene únicamente el LoRA, el manifiesto y los ficheros de licencia; el cargador y los ejemplos viven en el repositorio de GitHub del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer de difusión MiniMax-H3; muestreo flow matching con schedule sigma fijo de 8 pasos |
| Parametros totales | no disponible (el adaptador ocupa 2,8 GB; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (modelo de generación de vídeo; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (la model card usa `torch.bfloat16` en los ejemplos; no se listan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (código de GitHub bajo Apache-2.0) |
| Formato de pesos | safetensors (`minimax_h3_hyperflow_8step_v1.0.safetensors`) |

## Arquitectura y entrenamiento

HyperFlow es un adaptador LoRA de rango 256 y alpha 256 aplicado sobre los módulos de atención, feed-forward y ambos time embedders del transformer de MiniMax-H3, con un total de 316 módulos modificados. El fichero incluye claves para un segundo time embedder que solo existe una vez que el cargador de HyperFlow lo ha instalado, por lo que no es un LoRA genérico: debe cargarse con `load_hyperflow_lora` del paquete `hyperflow-h3`, no con `load_lora_weights` o `load_lora_adapter` de diffusers. El número de pasos y la rejilla sigma (video shift 12, audio shift 3) se leen del propio fichero de pesos.

El entrenamiento se basa en autodestilación de flujo sin datos (data-free flow self-distillation), una técnica que destila la trayectoria de muestreo multi-paso del modelo base en una trayectoria de 8 pasos sin requerir un corpus de entrenamiento adicional. El adaptador funciona sobre la Modular Pipeline oficial de diffusers para MiniMax-H3 y es compatible con paralelismo de contexto Ulysses en hasta 4 GPU, FlashAttention-3 y atención dispersa NVIDIA Sol-Attn. Un mismo fichero sirve para los tres flujos de trabajo: `t2va` (texto a vídeo con audio), `fl2va` (primer y último fotograma a vídeo con audio) y `ref2va` (referencia a vídeo con audio, cargando el LoRA sobre `transformer_ref/`).

## Capacidades

- Generación de vídeo a partir de texto (`t2va`), de imagen y texto (`fl2va`, con primer y último fotograma) y de referencias visuales (`ref2va`).
- Generación conjunta de vídeo y audio en una sola pasada, con salida de vídeo, audio y frecuencia de muestreo.
- Muestreo en 8 pasos con rejilla sigma fija embebida en los pesos, lo que reduce el coste computacional aproximadamente 3x frente a la línea base de 49 NFE.
- Control de longitud mediante `num_frames` (124 fotogramas en el ejemplo de la model card) y de resolución mediante `height` y `width`.
- Reproducibilidad mediante semilla (`generator=torch.Generator().manual_seed(...)`).
- Compatibilidad con paralelismo de contexto Ulysses en hasta 4 GPU, FlashAttention-3 y atención dispersa Sol-Attn.
- Carga desde repositorio, directorio local o fichero `.safetensors`, con soporte de modo offline (`HF_HUB_OFFLINE=1`).
- Soporte de *auto CPU offload* con margen de memoria configurable (24 GB validados en H200).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni comprensión multilingüe; es un modelo generativo de vídeo y audio.

## Casos de uso

- **Generación de vídeo publicitario a partir de texto**: el flujo `t2va` permite producir clips cortos con audio sincronizado en unos 60 segundos por clip sobre 4x H200, lo que hace viable iterar sobre variaciones de un anuncio en una sesión de trabajo.
- **Animación de imágenes fijas para redes sociales**: con `fl2va` se puede interpolar entre un primer y un último fotograma proporcionados por el usuario, generando transiciones animadas con audio a partir de material gráfico existente.
- **Prototipado rápido de storyboards**: la reducción de 49 a 8 pasos permite generar borradores de escenas en menos de un tercio del tiempo, facilitando la exploración de ideas antes de un render final con el modelo base completo.
- **Personalización con referencias visuales**: el flujo `ref2va` permite condicionar la generación a imágenes de referencia, útil para mantener coherencia de personaje o producto en series de clips.
- **Producción de contenido educativo o divulgativo**: generación de clips explicativos con narración o ambiente sonoro integrado, sin necesidad de un pipeline separado de texto a audio.
- **Investigación en destilación de modelos de difusión**: el adaptador sirve como caso de estudio reproducible de autodestilación de flujo sin datos sobre un modelo de vídeo de gran escala, con pesos y manifiesto publicados.
- **Integración en pipelines de render por lotes**: la compatibilidad con paralelismo Ulysses y atención dispersa permite escalar horizontalmente en clústeres de GPU para generar múltiples clips en paralelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de velocidad:

| Metrica | HyperFlow (8 pasos) | Baseline diffusers (49 NFE) |
|---|---|---|
| Evaluaciones del modelo por clip | 8 | 49 |
| Tiempo por clip (4x H200) | ~60 s | ~175 s |
| Aceleracion extremo a extremo | ~3x | 1x (referencia) |

## Requisitos de hardware

- **VRAM estimada**: la model card valida un margen de memoria de 24 GB en H200 con *auto CPU offload*; la receta oficial de 12 GB "deja sin memoria al denoiser" en ese hardware, según el autor. No se publican cifras de VRAM para inferencia sin offload.
- **GPU recomendadas**: H200 (configuración de referencia, 4 GPU para el benchmark de velocidad); compatible con paralelismo Ulysses en hasta 4 GPU.
- **GPU de consumo**: no se confirma compatibilidad con GPU de consumo en la información disponible; el requisito de margen de 24 GB en H200 sugiere que no cabe en GPU consumer sin offload agresivo.
- **Opciones de despliegue**: pipeline Modular de diffusers (≥ 0.40.0) con el paquete `hyperflow-h3`; requiere `transformers` ≥ 4.57 (Qwen3-VL) y Python ≥ 3.10. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: aproximadamente 60 segundos por clip de 124 fotogramas sobre 4x H200, frente a unos 175 segundos con el baseline de 49 NFE.
- **Aceleradores opcionales**: FlashAttention-3 y atención dispersa NVIDIA Sol-Attn.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow (este) | LoRA sobre MiniMax-H3 | 8 | Vídeo + audio, 124 fotogramas en el ejemplo | MiniMax H3 Community License | Hugging Face, 2,8 GB |
| MiniMax-H3 (base) | Modelo completo | 49 (diffusers por defecto) | Vídeo + audio | MiniMax H3 Community License | Hugging Face |
| hyperflow-h3-flash | Variante de Video Rebirth | no disponible | no disponible | no disponible | Hugging Face (`VideoRebirthAI/hyperflow-h3-flash`) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de `hyperflow-h3-flash` en la información proporcionada, por lo que la comparación cuantitativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- **Restricción territorial de licencia**: la MiniMax H3 Community License Agreement no autoriza el uso en la Unión Europea, Reino Unido, Corea del Sur ni Estados Unidos sin autorización expresa de MiniMax. Esto afecta directamente a desarrolladores en España.
- **No es un producto oficial de MiniMax**: HyperFlow es un adaptador de terceros (Video Rebirth) y no está respaldado por MiniMax.
- **Carga no estándar**: no funciona con `load_lora_weights` ni `load_lora_adapter` de diffusers; requiere el cargador específico `load_hyperflow_lora`. Un uso incorrecto provoca errores por las claves del segundo time embedder.
- **Pasos no configurables**: no se debe pasar `num_inference_steps`; el número de pasos y la rejilla sigma vienen fijados por el fichero de pesos y cualquier otro valor lanza una excepción.
- **Sin refinamiento de prompts integrado**: el sistema H3-Context-IR de MiniMax no forma parte de los pesos abiertos, por lo que la calidad del prompt depende del usuario y de la guía de prompting del modelo base.
- **Riesgo de alucinación visual**: no se documentan evaluaciones de fidelidad semántica ni de coherencia temporal; al ser un modelo generativo, puede producir contenido inconsistente con el prompt.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible.
- **Idiomas**: no se especifican idiomas soportados para los prompts.
- **Consumo de memoria**: la receta oficial de 12 GB no es suficiente en H200 según el autor; se requiere un margen de 24 GB con offload.
- **Versionado**: un identificador de repositorio sin `filename=` sigue el manifiesto y puede actualizarse a nuevas versiones; conviene fijar `revision=` o `filename=` en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VideoRebirthAI/hyperflow
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio GitHub (cargador y ejemplos): https://github.com/Video-Rebirth/hyperflow
- Variante hyperflow-h3-flash: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Ejemplos y comparativas de vídeo generado: https://www.videorebirth.com/lp/hyperflow
- Sitio de Video Rebirth: https://www.videorebirth.com/
- Documentación de la Modular Pipeline de MiniMax-H3 en diffusers: https://huggingface.co/docs/diffusers/main/api/pipelines/minimax_h3
- Guía de prompting del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3#prompting-guidance
