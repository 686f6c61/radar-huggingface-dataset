# Wesley1234/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8

## Resumen

Este repositorio contiene un LoRA de aceleración experimental para el modelo MiniMax H3, específicamente diseñado para el checkpoint local `10Eros_Max_h3_fl2va_bf16_test4_pruned.safetensors`. El autor, Wesley1234, ha convertido un LoRA Turbo de cuatro pasos existente (procedente de la línea no-EMA estándar de larryvrh/MiniMax-H3-Turbo-Lora) para que sea compatible con la arquitectura "curve-pruned" de dicho checkpoint, que utiliza una tabla de coordenadas de 8 dimensiones en lugar de la ruta AdaLN completa de 2688 dimensiones.

El LoRA no es un modelo independiente: requiere el checkpoint base pruned de 40 GB (no incluido en este repositorio) y está pensado para su uso en ComfyUI. Su propósito es reducir el número de pasos de inferencia de MiniMax H3 de los habituales (típicamente 10 o más) a solo 4, manteniendo la calidad de generación de video con audio estéreo sincronizado. Es una pieza de compatibilidad exacta, no un redestilado ni un lanzamiento oficial de MiniMax.

La relevancia de este trabajo radica en que permite acelerar significativamente la generación de video-audio en flujos de trabajo locales de ComfyUI, aunque su naturaleza experimental y su dependencia de un checkpoint concreto limitan su aplicabilidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de adaptación para MiniMax H3 (FL2VA-family, video + audio sincronizado) |
| Parametros totales | 569 tensores (259 adaptadores A/B + 51 parches de bias `.diff_b`) |
| Parametros activos | no disponible (LoRA, no MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | BF16 (adaptadores A/B), FP32 (`.diff_b`) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (archivo LoRA de 794.888.696 bytes, ~758 MiB) |

## Arquitectura y entrenamiento

El LoRA se deriva de un LoRA Turbo estándar de cuatro pasos para MiniMax H3, que originalmente contenía 259 grupos de adaptadores. De estos, 208 grupos (atención y MLP) son directamente compatibles con el checkpoint pruned, pero los 51 adaptadores AdaLN (Adaptive Layer Normalization) tenían una dimensión de entrada de 2688, mientras que el checkpoint pruned utiliza una tabla de coordenadas compartida de 8 dimensiones (`adaln_t_table` de forma `[1025, 8]`).

La conversión se realizó mediante un ajuste por mínimos cuadrados afín: para cada adaptador AdaLN `A ∈ R^(16×2688)` y `B ∈ R^(d_out×16)`, se proyectó la entrada a las 8 dimensiones de la curva usando la pseudoinversa de la matriz `[C, 1]` (donde `C` es la tabla de coordenadas en la rejilla de 1025 puntos). El resultado son 51 adaptadores `A8 ∈ R^(16×8)` más un término de bias `diff_b` que preserva la respuesta constante de la proyección. No hubo entrenamiento ni destilación adicional: es una conversión puramente algebraica.

El LoRA resultante contiene 259 adaptadores A/B y 51 parches de bias, totalizando 569 tensores. La verificación estructural confirma que todos los tensores se cargan correctamente en ComfyUI y que las formas coinciden con el checkpoint objetivo. El autor advierte que sin el término `diff_b`, la respuesta del Turbo se pierde en un 94%–99,8%.

## Capacidades

- Aceleración de inferencia de MiniMax H3 a 4 pasos (frente a los pasos estándar), reduciendo el tiempo de generación de video con audio sincronizado.
- Compatibilidad exacta con el checkpoint `10Eros_Max_h3_fl2va_bf16_test4_pruned.safetensors` (SHA-256 `f82cc3f723b080e7ae94a7c98f95aa989e387618d0bdc940133dfbd9f432c062`).
- Generación de video con audio estéreo sincronizado (FL2VA-family), heredada del modelo base MiniMax H3.
- Soporte para flujos de trabajo de ComfyUI (carga como LoRA de bypass con parches de bias).
- No es un modelo independiente: requiere el checkpoint base pruned y no funciona con otros checkpoints de MiniMax H3.
- No incluye capacidades de texto, visión o audio por sí mismo; depende completamente del modelo base.

## Casos de uso

- Generación rápida de prototipos de video con audio para creadores de contenido: el LoRA permite iterar en 4 pasos en lugar de 10 o más, reduciendo el tiempo de espera en ComfyUI para pruebas de concepto de escenas cortas (hasta 15 segundos, según las capacidades del modelo base).
- Producción de clips cortos para redes sociales: con una GPU de alta gama, se pueden generar múltiples variantes de un prompt en una sesión, gracias a la reducción de pasos.
- Investigación en aceleración de modelos de difusión: este LoRA es un caso de estudio de cómo adaptar LoRAs Turbo a checkpoints con arquitecturas modificadas (pruning de curvas), útil para quienes trabajan en optimización de inferencia.
- Integración en pipelines de ComfyUI para video-audio: el LoRA se puede combinar con otros nodos de postprocesado (upscaling, interpolación) para flujos de trabajo automatizados de generación de video.
- Evaluación de calidad de generación a pocos pasos: permite comparar la salida de 4 pasos frente a la del checkpoint original a más pasos, para medir la degradación visual y auditiva.
- Uso educativo en talleres de generación de video local: al ser un LoRA ligero (~758 MB) en comparación con el checkpoint completo (40 GB), facilita la distribución de la parte de aceleración sin redistribuir el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas objetivas de calidad (FVD, CLIP score, etc.) ni comparaciones cuantitativas con el modelo base a más pasos. La única validación mencionada es estructural (carga correcta en ComfyUI, formas coincidentes) y una auditoría local que indica que sin el término `diff_b` se pierde la mayor parte de la respuesta Turbo.

## Requisitos de hardware

- El checkpoint base pruned pesa 40.225.724.112 bytes (~40 GB) en BF16, por lo que se requiere una GPU con al menos 48 GB de VRAM para inferencia sin cuantización adicional.
- El LoRA en sí es pequeño (~758 MB) y no añade requisitos significativos de VRAM, pero depende del modelo base.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, o GPUs de consumo con 48 GB (por ejemplo, RTX 6000 Ada) para BF16 completo. Con cuantización (por ejemplo, a 8 bits o 4 bits) podría caber en GPUs de 24 GB (RTX 4090), pero no se han publicado pruebas de compatibilidad con cuantización para este LoRA.
- Despliegue: exclusivamente en ComfyUI (el autor valida la carga con bypass adapters y bias patches). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un LoRA para un modelo de difusión de video, no un LLM.
- Latencia y throughput: no disponible. La reducción de 4 pasos implica una aceleración teórica de 2,5x frente a 10 pasos, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Compatibilidad | Licencia |
|---|---|---|---|---|
| Este LoRA (Wesley1234) | LoRA de aceleración | 4 | Solo checkpoint 10Eros pruned | Community License |
| larryvrh/MiniMax-H3-Turbo-Lora | LoRA de aceleración | 4 (varias versiones) | Checkpoints estándar de MiniMax H3 | Community License |
| lightx2v/Minimax-h3-Turbo | LoRA de aceleración | 4 | Checkpoints estándar de MiniMax H3 | Community License |

No se dispone de datos de rendimiento comparativo entre estos LoRAs. La diferencia principal es que este LoRA está adaptado a un checkpoint con pruning de curvas (AdaLN de 8 dimensiones), mientras que los otros están pensados para la arquitectura original de 2688 dimensiones. No hay información sobre calidad de salida relativa.

## Limitaciones y advertencias

- Es un LoRA experimental de compatibilidad exacta: solo funciona con el checkpoint `10Eros_Max_h3_fl2va_bf16_test4_pruned.safetensors` (SHA-256 `f82cc3f723b080e7ae94a7c98f95aa989e387618d0bdc940133dfbd9f432c062`). No es compatible con otros checkpoints pruned ni con el modelo MiniMax H3 original.
- El checkpoint base no está incluido en este repositorio. El autor advierte que no se establece la autoría, licencia ni derechos de redistribución de ese checkpoint local; el usuario debe verificar esos derechos por separado.
- La licencia MiniMax H3 Community License Agreement define territorios excluidos, condiciones de redistribución, términos comerciales y una política de uso aceptable. El autor señala que un repositorio público de Hugging Face puede ser accesible desde territorios excluidos, y que el gating del repositorio no es necesariamente un control de acceso geográfico.
- No se recomienda renombrar ni publicitar este LoRA como una versión oficial de Turbo (v4-step600, ckpt500, ckpt850 o EMA). Su procedencia es la línea no-EMA estándar inicial.
- Riesgo de alucinación o degradación de calidad: al ser una conversión algebraica sin reentrenamiento, la calidad de salida a 4 pasos puede diferir de la del LoRA Turbo original. No se han publicado evaluaciones subjetivas u objetivas.
- Solo se ha validado el ajuste de 4 pasos; otros números de pasos no están soportados.
- Idiomas: el LoRA en sí no añade capacidades multilingües; depende del modelo base, que soporta chino e inglés.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Wesley1234/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8
- Repositorio espejo (t8star): https://huggingface.co/t8star/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8
- LoRA Turbo de referencia (larryvrh): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Proyecto MiniMax-H3-Turbo (ModelTC): https://github.com/ModelTC/Minimax-H3-Turbo
- Repositorio oficial de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- Licencia MiniMax H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Workflow de ComfyUI para MiniMax H3 4 pasos (Civitai): https://civitai.com/models/2838258/minimax-h3-4-steps-turbo-video-aio-workflow
