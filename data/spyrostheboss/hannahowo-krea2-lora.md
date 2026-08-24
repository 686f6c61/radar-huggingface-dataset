# spyrostheboss/hannahowo-krea2-lora

## Resumen

`spyrostheboss/hannahowo-krea2-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base de difusión Krea 2 Raw, desarrollado por el usuario independiente spyrostheboss. Su objetivo es reproducir de forma consistente la apariencia y los rasgos faciales de la creadora de contenido HannahOwO (Hannah Kabel) en diferentes poses, expresiones, atuendos y composiciones. Se trata de un adaptador de personaje (character LoRA) que se activa mediante la palabra clave `hannahowo` al inicio del prompt.

El modelo resuelve el problema de mantener la identidad de un personaje concreto a lo largo de múltiples generaciones, algo que los modelos base de texto a imagen no logran de forma fiable sin un ajuste específico. Su relevancia actual radica en que Krea 2 es un modelo de difusión reciente (2026) con arquitectura propia, y este LoRA es uno de los primeros adaptadores de personaje publicados para él. El repositorio incluye un único archivo `.safetensors` de 0,5 GB, entrenado con 1.887 imágenes a resolución 1024×1024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 (difusión texto a imagen) |
| Parametros totales | no disponible (el archivo pesa 0,5 GB, pero no se indica el número de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (el LoRA se entrena en bf16 con base fp8) |
| Idiomas soportados | no disponible (el prompt se procesa con Qwen3-VL-4B, que soporta múltiples idiomas, pero no se especifica) |
| Licencia | other (términos no especificados) |
| Formato de pesos | safetensors (un solo archivo `hannahowo_krea2_v2.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se entrena sobre el modelo base Krea 2 Raw, que es un modelo de difusión de texto a imagen con arquitectura propia (no se detalla en la información disponible). El adaptador utiliza una red de bajo rango con dimensión y alpha de 32, aplicada a las capas de atención del modelo base. El text encoder es Qwen3-VL-4B (congelado) y el VAE es Qwen-Image VAE, ambos componentes del pipeline de Krea 2.

El entrenamiento se realizó con 1.887 imágenes de la persona objetivo, en 3 épocas (1.416 pasos) con batch efectivo de 4 (batch size 1 con acumulación de gradientes de 4). Se usó el optimizador AdamW8bit con learning rate constante de 1e-4, muestreo de timesteps con esquema `krea2_shift`, resolución 1024×1024 con bucketing, y precisión mixta bf16 (base en fp8). No se aplicó weighting scheme adicional. El resultado es un adaptador de un solo archivo que se carga directamente en ComfyUI o mediante el script de inferencia musubi-tuner de Krea 2.

## Capacidades

- Generación de imágenes de la persona HannahOwO con identidad consistente (rasgos faciales, peinado, proporciones) en distintas poses, expresiones, ángulos y composiciones.
- Activación mediante la palabra clave `hannahowo` como primer token del prompt (obligatorio, en minúsculas).
- Compatible con el modelo base Krea 2 Turbo para inferencia rápida (8 pasos, CFG desactivado).
- Control fino de la intensidad del adaptador mediante el parámetro de fuerza LoRA (recomendado 0.9).
- No incluye capacidades de tool calling, agentes, razonamiento multimodal ni generación de texto; es exclusivamente un adaptador de imagen.

## Casos de uso

- Creación de contenido para redes sociales: generar ilustraciones o avatares de un personaje ficticio basado en la apariencia de HannahOwO para cuentas de fans, memes o arte digital, manteniendo la coherencia visual entre publicaciones.
- Producción de cómics o novelas visuales: usar el LoRA para dibujar a un personaje recurrente con la misma cara en viñetas o escenas, gracias a la consistencia de identidad que proporciona el adaptador.
- Prototipado de personajes para videojuegos: generar variaciones de un personaje (distintos atuendos, expresiones, fondos) a partir de un mismo rostro base, acelerando el diseño conceptual.
- Personalización de avatares para streaming o comunidades virtuales: crear imágenes del avatar de un streamer o creador con estilos variados sin perder el parecido.
- Experimentación artística con modelos de difusión: probar cómo un LoRA de personaje interactúa con diferentes prompts y estilos dentro del ecosistema Krea 2, útil para investigadores y aficionados.
- Evaluación de adaptadores LoRA en modelos de difusión recientes: servir como caso de estudio para comparar la eficacia de LoRA en Krea 2 frente a otros modelos base (Flux, SDXL), dado que el entrenamiento está bien documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas (p. ej., similitud facial, FID, CLIP score) que permitan comparar cuantitativamente este LoRA con otros adaptadores de personaje.

## Requisitos de hardware

- El LoRA en sí ocupa 0,5 GB, pero requiere cargar el modelo base Krea 2 (Raw o Turbo) para funcionar. No se especifican requisitos mínimos de VRAM para Krea 2 en la documentación del adaptador.
- Dado que la resolución de generación es 1024×1024 y el modelo base es de difusión, se estima que se necesita al menos una GPU con 8-12 GB de VRAM para inferencia en fp16/bf16, aunque no hay datos confirmados.
- Es compatible con ComfyUI y con el script de inferencia musubi-tuner de Krea 2 (https://github.com/krea-ai/krea-2). También podría usarse con otras herramientas que soporten LoRA de Krea 2, pero no se mencionan.
- No se dispone de datos de latencia o throughput. Con Krea 2 Turbo y 8 pasos, la generación debería ser rápida en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros LoRA de personaje para Krea 2, ya que este es uno de los primeros publicados. Existen adaptadores similares para otros modelos base (p. ej., `Trenddwdw/HannahOwO` para Stable Diffusion, `MarkBW/hannahowo-xl` para SDXL, o versiones para Flux en PromptHero), pero no son comparables directamente porque el modelo base y la arquitectura difieren. La siguiente tabla resume las diferencias principales:

| Modelo | Modelo base | Tamaño del adaptador | Resolución | Licencia |
|---|---|---|---|---|
| spyrostheboss/hannahowo-krea2-lora | Krea 2 Raw | 0,5 GB | 1024×1024 | other |
| Trenddwdw/HannahOwO | Stable Diffusion (Diffusers) | no disponible | no disponible | no disponible |
| MarkBW/hannahowo-xl | SDXL | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo reproduce la imagen de una persona real (HannahOwO). Su uso puede violar derechos de imagen, privacidad o generar contenido engañoso. La model card indica que es para uso privado y solo imágenes work-safe, pero no hay garantía legal.
- La licencia es `other`, sin términos claros. No se especifica si permite uso comercial, redistribución o modificación. Antes de usarlo en producción, es necesario contactar con el autor o revisar los términos de Krea 2.
- El LoRA está entrenado específicamente para un rostro concreto; no generaliza a otras identidades. Si se usa con prompts que no incluyen la palabra clave `hannahowo`, el efecto será nulo o impredecible.
- No se han publicado evaluaciones de sesgos o alucinaciones. Al ser un adaptador de imagen, puede generar variaciones no deseadas en expresiones o accesorios si la fuerza del LoRA es demasiado alta (se recomienda 0.9).
- El modelo base Krea 2 Raw puede tener sus propias limitaciones (no documentadas aquí) que afectan a la calidad de salida.
- No hay soporte para otros idiomas en la documentación; aunque el text encoder Qwen3-VL-4B es multilingüe, no se ha verificado el comportamiento del LoRA con prompts en español u otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spyrostheboss/hannahowo-krea2-lora
- Repositorio de Krea 2 (implementación y script de inferencia): https://github.com/krea-ai/krea-2
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw (referenciado en la model card)
