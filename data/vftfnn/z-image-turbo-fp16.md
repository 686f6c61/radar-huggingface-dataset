# vftfnn/z-image-turbo-fp16

## Resumen

`vftfnn/z-image-turbo-fp16` es una conversión a precisión fp16 del transformer del modelo de generación de imágenes Z-Image-Turbo, publicado originalmente por Tongyi-MAI (laboratorio de Alibaba). El repositorio no contiene un modelo nuevo: empaqueta los pesos del transformer en formato diffusers y en coma flotante de 16 bits, partiendo de la versión bf16 distribuida por Comfy-Org, para que pueda cargarse con `ZImageTransformer2DModel.from_pretrained(..., torch_dtype=torch.float16)` y pasarse como `transformer` a `ZImagePipeline`.

El interés práctico es doble: por un lado reduce a la mitad el espacio de pesos frente a fp32 (12,3 GB de repositorio para 6.154.908.736 parámetros), y por otro ofrece una ruta compatible con GPUs y pipelines que trabajan de forma nativa en fp16 en lugar de bf16. El modelo base es un transformer de difusión de tipo turbo, orientado a generar imágenes fotorrealistas en pocos pasos y con buen rendimiento en el renderizado de texto bilingüe chino-inglés.

La advertencia importante está en la propia model card: la inferencia en fp16 requiere un recorte numérico estilo ComfyUI de las salidas de atención y FFN (`nan_to_num` a ±65504); sin ese ajuste, los tensores desbordan y las imágenes salen negras. Es, por tanto, una conversión de conveniencia para usuarios que ya conocen el pipeline, no un artefacto con soporte oficial del autor original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para texto-a-imagen; clase `ZImageTransformer2DModel` de diffusers. Según la documentación del modelo base, concatena a nivel de secuencia tokens de texto, tokens semánticos visuales y tokens VAE de imagen en un único flujo de entrada (esquema de una sola corriente) |
| Parámetros totales | 6.154.908.736 (≈6,15 mil millones; corresponde al transformer incluido en el repositorio) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible. En un modelo texto-a-imagen no aplica una ventana de contexto conversacional; la longitud relevante sería la del codificador de texto, que no se documenta en esta ficha |
| Tipos de cuantización | fp16 en este repositorio. Existen otras conversiones de la comunidad: bf16 (Comfy-Org/z_image_turbo, origen de esta), fp32/fp16/bf16 completos y EMA-only (tsqn/Z-Image-Turbo_fp32-fp16-bf16_full_and_ema-only) y conversiones GGUF de terceros (SeaArt) |
| Idiomas soportados | Renderizado de texto en inglés y chino según la model card del modelo base. No hay lista oficial de idiomas para esta conversión |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en fp16, disposición de directorios estilo diffusers |
| Modelo base | Tongyi-MAI/Z-Image-Turbo (finetune/conversión de precisión) |
| Tarea | Texto-a-imagen (text-to-image), generación en pocos pasos |
| Tamaño del repositorio | 12,3 GB |
| Librería declarada | diffusers |
| Fecha de creación / actualización | 2026-10-23 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Esta publicación no entrena nada: es una conversión de precisión. El transformer es un diffusion transformer (DiT) de 6,15 mil millones de parámetros que, según la descripción del modelo base recogida en la búsqueda web, utiliza una arquitectura de corriente única en la que los tokens de texto, los tokens semánticos visuales y los tokens del VAE de imagen se concatenan a nivel de secuencia y se procesan como un único flujo de entrada. Ese diseño se presenta como una optimización de eficiencia de parámetros frente a los esquemas de doble corriente, típicos de otras familias de difusión. La clase de diffusers implicada es `ZImageTransformer2DModel` y el pipeline asociado es `ZImagePipeline`.

No se dispone del número de tokens de entrenamiento, de la composición del dataset, ni de si el modelo base pasó por etapas de ajuste por preferencias humanas (RLHF/DPO). La model card del modelo base sí menciona un componente de "prompt enhancer" con capacidades de razonamiento, que reescribe o amplía la instrucción del usuario antes de la generación; no se detalla si ese componente es un módulo separado o parte del mismo transformer. La única innovación técnica documentada en esta conversión concreta es el requisito de recorte numérico (`nan_to_num` a ±65504) sobre las salidas de atención y FFN para evitar que la inferencia fp16 produzca imágenes negras por desbordamiento.

## Capacidades

- Generación de imágenes a partir de prompts de texto, con el pipeline `ZImagePipeline` de diffusers.
- Generación en pocos pasos (variante "turbo"), pensada para reducir el coste de muestreo frente a modelos de difusión de decenas de pasos.
- Calidad fotorrealista, según las afirmaciones de la model card del modelo base.
- Renderizado de texto bilingüe chino-inglés, incluyendo texto tipográfico dentro de la imagen.
- Mejora de prompts ("prompt enhancer") con razonamiento, según el modelo base.
- Compatibilidad con ComfyUI y con flujos basados en diffusers para el transformer en fp16.
- No soporta tool calling ni function calling: es un modelo generativo de imagen, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso sobre herramientas.
- No dispone de modo "thinking", audio, vídeo ni entrada multimodal de imagen en esta conversión.

## Casos de uso

- Generación de ilustraciones para blogs y documentación técnica: el transformer en fp16 se integra en un pipeline de diffusers y permite producir cabeceras o diagramas conceptuales por lotes desde una GPU de 16-24 GB, con pasos reducidos para abaratar el coste por imagen.
- Cartelería y material promocional con texto incrustado: el modelo base está optimizado para renderizar texto en chino e inglés, lo que resulta adecuado para mockups de banners, packaging o pósters donde el texto debe salir legible y no deformado.
- Prototipado rápido de conceptos de producto: generación en pocos pasos dentro de un cuaderno Jupyter o un script de diffusers, útil para iterar sobre variaciones visuales antes de encargar renders de mayor calidad.
- Pruebas de infraestructura de inferencia fp16: al ser una conversión de precisión, sirve para validar pipelines de despliegue en fp16, comparar estabilidad numérica frente a bf16 y medir el impacto del recorte de atención/FFN en la calidad final.
- Creación de assets para videojuegos y prototipos de interfaz: generación de iconos, texturas base y fondos con licencia Apache 2.0, sin las restricciones de uso comercial de otras familias de modelos.
- Automatización de contenido en ComfyUI: al cargarse como "transformer" de un grafo existente, permite sustituir el peso bf16 por fp16 en máquinas donde bf16 no está acelerado, manteniendo el resto del grafo (codificador de texto, VAE, scheduler) descargado del repositorio oficial.
- Investigación en conversión de precisión: caso de estudio de qué operaciones de un DiT toleran fp16 y cuáles necesitan clamping, replicable en otros transformers de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas y la del modelo base solo aporta afirmaciones cualitativas: evaluación de preferencia humana basada en Elo, "altamente competitivo" frente a otros modelos líderes y "estado del arte entre modelos abiertos" según esa misma evaluación, sin cifras reproducibles en las fuentes consultadas.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | No aplica: modelo texto-a-imagen |
| FID / CLIP score / ImageReward | No disponible |
| Evaluación Elo de preferencia humana | Citada de forma cualitativa en el modelo base, sin valores numéricos |
| Comparativa fp16 frente a bf16 | No disponible (la model card solo advierte de imágenes negras sin clamping) |

## Requisitos de hardware

- Pesos del transformer: 12,3 GB en fp16 (6,15 mil millones de parámetros × 2 bytes). A ello hay que sumar el codificador de texto, el VAE y el scheduler, que se cargan desde el repositorio `Tongyi-MAI/Z-Image-Turbo`, por lo que el pico de VRAM real es superior al del fichero de pesos.
- VRAM estimada para inferencia: 14-16 GB como mínimo razonable; 24 GB para trabajar con comodidad y resolutions altas sin offloading.
- GPU recomendadas: A100 (40/80 GB), H100, L40S y RTX 4090 (24 GB) para producción; RTX 4080/4090 para uso individual.
- GPU de consumo: cabe en RTX 4090 y RTX 4080 sin offload. En tarjetas de 12 GB (RTX 3060, 4070) es necesario recurrir a offloading secuencial o a variantes EMA-only; una recomendación de la comunidad para equipos tipo RTX 3060 señala bf16/fp16 como opción preferente y fp16 EMA-only para menos de 12 GB.
- Opciones de despliegue: diffusers (ruta documentada por el autor), ComfyUI con la variante bf16 de Comfy-Org o con nodos GGUF para cuantizaciones de terceros, y ModelScope para la réplica del modelo. vLLM y TGI no aplican: no son servidores de inferencia para diffusion transformers.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser una variante "turbo", se espera un número de pasos de muestreo bajo, pero no se han publicado tiempos por imagen ni comparativas de velocidad entre fp16 y bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Formato y precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vftfnn/z-image-turbo-fp16 (esta ficha) | 6,15 B (transformer) | No disponible | safetensors fp16, diffusers | Apache 2.0 | Hugging Face, 0 descargas |
| Tongyi-MAI/Z-Image-Turbo (base) | 6,15 B (transformer) | No disponible | Repositorio oficial del pipeline completo | Apache 2.0 | Hugging Face, mantenido por el autor original |
| Comfy-Org/z_image_turbo | 6,15 B (transformer) | No disponible | bf16, orientado a ComfyUI | Apache 2.0 (heredada) | Hugging Face; origen de esta conversión |
| tsqn/Z-Image-Turbo_fp32-fp16-bf16_full_and_ema-only | 6,15 B (transformer) | No disponible | fp32, fp16 y bf16, versiones full y EMA-only | Apache 2.0 | Hugging Face; recomienda bf16/fp16 en RTX 3060 y fp32 para entrenamiento |
| FLUX.1 [schnell] (referencia de categoría) | ≈12 B | No disponible en esta búsqueda | safetensors, bf16/fp8 | Apache 2.0 | Hugging Face / Black Forest Labs |
| Stable Diffusion 3.5 Large (referencia de categoría) | ≈8 B | No disponible en esta búsqueda | safetensors, bf16/fp8 | Licencia comunitaria de Stability AI | Hugging Face |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la información consultada, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad. Para FLUX.1 [schnell] y SD 3.5 Large los datos de parámetros y licencia son referencia general de la categoría, no cifras extraídas de las fuentes de esta búsqueda.

## Limitaciones y advertencias

- Inestabilidad numérica en fp16: sin el recorte de salidas de atención y FFN (`nan_to_num` a ±65504) las imágenes salen completamente negras. Cualquier integración debe replicar ese clamping; no es un detalle opcional.
- Conversión no oficial: el repositorio lo publica el usuario `vftfnn`, sin respaldo del equipo Tongyi-MAI. No hay garantía de mantenimiento, issues atendidos ni paridad exacta con los pesos bf16 de origen.
- Repositorio incompleto por diseño: solo incluye el transformer. El codificador de texto, el VAE y el scheduler deben obtenerse del repositorio base, lo que introduce dependencia de una descarga adicional y de que ese repositorio siga disponible.
- Ausencia de datos de evaluación: 0 descargas y 0 likes en el momento de la ficha, sin métricas de calidad, FID ni comparativas de fidelidad frente a bf16. No se puede afirmar que la salida fp16 sea equivalente a la original.
- Sesgos: no documentados para esta conversión ni para el modelo base en las fuentes consultadas. Al ser un modelo entrenado principalmente con datos chinos e ingleses, es previsible un sesgo cultural y lingüístico en las imágenes generadas, pero no hay un análisis publicado que lo cuantifique.
- Alucinación: el concepto no aplica igual que en un LLM, pero sí existe el fenómeno equivalente de baja fidelidad al prompt, especialmente en prompts largos, con atributos numéricos o con texto en idiomas distintos del chino y el inglés.
- Limitaciones de idioma: el renderizado de texto está optimizado para chino e inglés; el comportamiento con alfabetos latinos acentuados, cirílico, árabe o devanagari no está documentado.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero exige conservar el aviso de licencia y el fichero NOTICE si existe, y no concede garantías. Conviene verificar la licencia del repositorio base antes de un despliegue en producción.
- Sin filtro de seguridad: no se documenta ningún sistema de moderación o de "safety checker" en esta conversión, por lo que la responsabilidad sobre el contenido generado recae en quien despliega el modelo.
- Resolución, pasos de muestreo y parámetros de guidance: no documentados en esta ficha; deben tomarse del repositorio base o de los flujos de ComfyUI de referencia.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/vftfnn/z-image-turbo-fp16
- Modelo base oficial: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Conversiones fp32/fp16/bf16 (full y EMA-only) de la comunidad: https://huggingface.co/tsqn/Z-Image-Turbo_fp32-fp16-bf16_full_and_ema-only
- Réplica en ModelScope: https://www.modelscope.cn/models/modelsy/Z-Image-Turbo-fp16
- Ficha en Tensor.Art: https://tensor.art/models/936896746393489298
- Conversiones GGUF / fp16 en SeaArt: https://www.seaart.ai/models/detail/749924c0ee56fd1403b5cf9cff3b588d
- Origen de los pesos bf16: `Comfy-Org/z_image_turbo` (referenciado en la model card; no se ha localizado URL directa en la búsqueda)
