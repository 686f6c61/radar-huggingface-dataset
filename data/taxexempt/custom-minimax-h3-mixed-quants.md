# taxexempt/Custom-MiniMaX-H3-mixed-quants

## Resumen

Este repositorio contiene una cuantización mixta del modelo MiniMax-H3, un modelo de generación de vídeo de 33 000 millones de parámetros desarrollado por MiniMax. El modelo original es capaz de producir vídeo de alta calidad con una banda sonora totalmente sincronizada (ambiente, foley y habla), y admite referencias de sujeto, voz o movimiento de cámara. La versión cuantizada, publicada por el usuario taxexempt, aplica técnicas de cuantización post-entrenamiento para reducir el tamaño del modelo y el uso de VRAM, manteniendo en la medida de lo posible la fidelidad de la salida. No se ha realizado ningún fine-tuning adicional.

La relevancia de este repositorio radica en que permite ejecutar un modelo de vídeo de gran tamaño en hardware de consumo, especialmente en GPUs Blackwell como la RTX 5090, mediante formatos como NVFP4, W4A8 o MXFP8. La cuantización mixta asigna distintas precisiones a diferentes capas según su sensibilidad, buscando un equilibrio óptimo entre calidad, velocidad y uso de memoria. Sin embargo, al tratarse de una cuantización no oficial, se recomienda revisar la licencia y las limitaciones del modelo original antes de su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (basada en MiniMax-H3, modelo de difusión para vídeo) |
| Parámetros totales | 33 000 millones (modelo base, según búsqueda web) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | W4A8, NVFP4, MXFP8/FP8, INT8, precisión original (mixta) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un modelo de generación de vídeo de 33 000 millones de parámetros, desarrollado por MiniMax, que produce vídeo con audio sincronizado. No se dispone de detalles técnicos sobre su arquitectura interna (por ejemplo, si utiliza transformers, difusión o una combinación), ya que la información proporcionada se centra en la cuantización. El repositorio de taxexempt no modifica la arquitectura ni realiza entrenamiento adicional; únicamente aplica cuantización post-entrenamiento sobre los pesos del modelo original.

La cuantización mixta asigna diferentes formatos a distintas capas: las capas sensibles a la precisión pueden conservar su formato original (BF16/FP16), mientras que las capas grandes de MLP/FFN pueden usar W4A8 o NVFP4, y las proyecciones críticas pueden usar MXFP8 o FP8. Esta estrategia busca minimizar la pérdida de calidad en las partes más sensibles del modelo, a la vez que se reduce el tamaño total y el consumo de memoria. No se han publicado detalles sobre los datos de entrenamiento del modelo original ni sobre el proceso de cuantización específico aplicado en este repositorio.

## Capacidades

- Generación de vídeo de alta calidad con audio sincronizado (ambiente, foley y habla).
- Soporte de referencias externas: sujeto, voz y movimiento de cámara.
- Generación de secuencias de vídeo de longitud variable (no se especifica el límite).
- Posible uso en flujos de trabajo de ComfyUI mediante extensiones como comfy-kitchen.
- No se mencionan capacidades de texto, código, tool calling o agentes; es un modelo exclusivamente de vídeo.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos con audio integrado para plataformas como TikTok o Instagram, usando la cuantización para ejecutar el modelo en una GPU de consumo como la RTX 4090 o RTX 5090.
- Prototipado de escenas para producción audiovisual: los directores pueden generar rápidamente storyboards animados con sonido, sin necesidad de un estudio de grabación.
- Doblaje automático de vídeos: gracias a la generación de habla sincronizada, se puede crear contenido multilingüe a partir de un guion, aunque la calidad puede variar según el idioma (no se especifican los idiomas soportados).
- Generación de efectos de sonido para vídeos: el modelo produce foley y ambiente, útil para postproducción de bajo presupuesto.
- Educación y demostraciones: generar vídeos explicativos animados con narración para cursos online, ejecutables en estaciones de trabajo con una sola GPU.
- Investigación en generación de vídeo: los investigadores pueden estudiar el comportamiento del modelo cuantizado y compararlo con el original para analizar el impacto de la cuantización en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad (como FVD, CLIP score u otras) ni comparativas con el modelo original. Se recomienda realizar pruebas propias en el hardware objetivo para evaluar la degradación introducida por la cuantización.

## Requisitos de hardware

- VRAM estimada: depende de la variante cuantizada. Para un modelo de 33B en 4 bits, se estima entre 16 y 20 GB, pero no se confirma en el repositorio.
- GPU recomendadas: para formatos NVFP4 y MXFP8, se requiere hardware Blackwell (RTX 50 series). Para W4A8 y FP8, es compatible con Ada (RTX 40 series) y posiblemente con arquitecturas anteriores, dependiendo del soporte de software.
- Es posible ejecutar el modelo en GPUs de consumo como RTX 4090 o RTX 5090, siempre que se seleccione la variante adecuada.
- Opciones de despliegue: principalmente ComfyUI con soporte de cuantización (comfy-kitchen). No se mencionan otros frameworks como vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen de la GPU, la resolución de vídeo y el número de frames.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3 (original) | 33B | Vídeo + audio | No disponible | Hugging Face |
| taxexempt/Custom-MiniMaX-H3-mixed-quants | 33B (cuantizado) | Vídeo + audio | No disponible | Hugging Face |
| CogVideoX (por ejemplo, 5B) | 5B | Vídeo | Apache 2.0 (según versión) | Hugging Face |
| HunyuanVideo | 13B | Vídeo | No disponible | Hugging Face |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de licencias para el modelo base. La principal ventaja de este repositorio es la reducción de VRAM frente al modelo original, pero a costa de una posible pérdida de calidad.

## Limitaciones y advertencias

- La cuantización es un proceso con pérdida; se pueden producir diferencias en detalles finos, texturas, consistencia de color, movimiento, adherencia al prompt y consistencia de personajes.
- No se ha verificado la licencia del modelo original; su uso comercial puede estar restringido. Se debe consultar la documentación de MiniMax antes de utilizar el modelo en producción.
- Los formatos NVFP4 y MXFP8 requieren hardware Blackwell; en otras GPUs pueden no cargar o rendir peor.
- No se garantiza compatibilidad con todas las versiones de ComfyUI; se necesita software actualizado y dependencias de cuantización.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de vídeo, los riesgos están relacionados con la generación de contenido inapropiado o inexacto.
- El repositorio no especifica el preset de cuantización utilizado (Balanced, Fast, etc.), por lo que el usuario debe probar varias variantes si están disponibles.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/taxexempt/Custom-MiniMaX-H3-mixed-quants
- Repositorio oficial de MiniMax-H3 en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Espacio de referencia de MiniMax-H3: https://huggingface.co/spaces/multimodalart/minimax-h3-reference
- Sitio web de MiniMax: https://www.minimax.io/
- Integraciones de MiniMax-H3: https://github.com/MiniMax-AI/awesome-minimax-h3-integration
