# TechnoBaptist/LTX-2.3-N-v1.4-FP8

## Resumen

TechnoBaptist/LTX-2.3-N-v1.4-FP8 es una reempaquetado comunitario del modelo de generación de vídeo Lightricks/LTX-2.3, publicado por el usuario TechnoBaptist. Se distribuye como una build pre-fusionada en FP8 y GGUF en la que el autor ha "horneado" (baked-in) tres ajustes finos sobre los pesos base: un LoRA NSFW llamado Eros10 (fuerza 1.0), un LoRA destilado DMD (fuerza 1.0) y el ICLoRA Detailer oficial de LTX (fuerza 0.6). El resultado es un modelo de difusión de vídeo "turbo" sin censura, capaz de generar en tan solo 4 pasos (8 para mejor calidad) y que cubre los modos texto-a-vídeo, imagen-a-vídeo, vídeo-a-vídeo, audio-a-vídeo y variantes con audio sincronizado.

El modelo base, LTX-2.3, es una arquitectura de Diffusion Transformer (DiT) de código abierto que, según su documentación oficial, ofrece calidad de generación "comercial" y soporte nativo de audio sincronizado y vídeo en vertical. Esta variante concreta añade el componente destilado DMD para acelerar la inferencia y mejorar la preservación facial en I2V, además de un LoRA orientado a contenido para adultos. El repositorio ocupa 239 GB y reporta 21.005.004.544 parámetros (unos 21.000 millones) según sus safetensors.

La relevancia actual de esta ficha es mixta: por un lado, demuestra el flujo típico de la comunidad de vídeo generativo (destilación, fusión de LoRAs, cuantización a FP8/GGUF para inferencia local); por otro, presenta etiquetas `not-for-all-audiences`, licencia `unknown` y cero descargas e interacciones en el momento de la consulta, lo que exige cautela antes de usarlo en producción. LTX-2.3 ya ha sido sucedido por LTX-2.5, lo que lo sitúa como modelo de generación anterior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de vídeo, según el modelo base LTX-2.3 |
| Parámetros totales | 21.005.004.544 (~21 B), dato reportado en safetensors del repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. En generación de vídeo el equivalente funcional es la duración: hasta 960 fotogramas (~40 s) según la model card |
| Tipos de cuantización | FP8 (build principal) y GGUF (librería declarada `gguf`) |
| Idiomas soportados | No disponible (los prompts de ejemplo de la model card están en inglés) |
| Licencia | `unknown` (desconocida) |
| Formato de pesos | FP8 y GGUF; el repositorio reporta parámetros en safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LTX-2.3 original, un Diffusion Transformer (DiT) diseñado para generación de vídeo, con soporte de audio sincronizado nativo. Sobre esa base, esta build aplica una fusión de tres LoRAs en los pesos: el fine-tune Eros10 (orientado a contenido NSFW, a fuerza 1.0), el LoRA de destilación DMD (a fuerza 1.0, que aporta generaciones más rápidas, mejor preservación facial en imagen-a-vídeo y mejor seguimiento de instrucciones según el autor) y el ICLoRA Detailer oficial de LTX (a 0.6, para mejorar la adherencia a la imagen de referencia). No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable de esta variante es la destilación DMD, que permite generar en tan solo 4 pasos (8 pasos para mejor resultado) en lugar de los pipelines de difusión completos. La model card indica que el modo imagen-a-vídeo se ejecuta con 9 pasos y que el modelo conserva bien la identidad del sujeto de entrada. También se describen modos FL2VA (primer y último fotograma a vídeo con audio), REF2VA y audio-a-vídeo. El autor menciona que existe un sistema de "guardrails" para evitar contenido ilegal, aunque predominantemente se orienta a NSFW.

## Capacidades

- Generación de vídeo desde texto (`txt2video` / T2VA, con audio).
- Generación de vídeo desde imagen (`img2video` / I2VA), con buena preservación de identidad facial según la model card.
- Vídeo-a-vídeo.
- Audio-a-vídeo.
- Modos FL2VA (primer y último fotograma) y REF2VA (referencia).
- Generación de audio sincronizado con el vídeo; la model card indica que a mayor CFG hay más movimiento y más audio.
- Generación de vídeo largo: hasta 960 fotogramas (~40 s).
- Inferencia few-step (turbo): desde 4 pasos, con 8-9 pasos para mejor calidad, gracias al LoRA DMD destilado.
- Contenido para adultos sin censura (etiqueta `not-for-all-audiences`), con Eros10 integrado.
- Soporte de tool calling / function calling: no disponible (no aplica a este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de texto, código o matemáticas: no aplica; es un modelo de generación de vídeo.

## Casos de uso

- Previsualización cinematográfica: generar planos de referencia ("cinematic tracking shot de un coche deportivo en una calle mojada de noche, con reflejos de neón y lluvia") en 8 pasos a 1280 × 736 y 121 fotogramas (~5 s) para validar encuadre, iluminación y ritmo antes de rodar.
- Storyboards animados con audio: usar el modo T2VA para producir clips con sonido sincronizado y evaluar la dirección sonora de una escena sin equipo de posproducción.
- Animación de imagen fija en publicidad: con I2VA (9 pasos) se puede convertir una fotografía de producto o de modelo en un clip manteniendo la identidad del sujeto, útil para variantes creativas rápidas.
- Interpolación de primer y último fotograma (FL2VA): dada una imagen inicial y una final, el modelo puede construir la transición intermedia, lo que sirve para transiciones de escena o efectos de continuidad en vídeo musical y moda.
- Vídeos largos de hasta 40 s: con 960 fotogramas y 9 pasos se pueden generar piezas narrativas más extensas que el clip típico de 4-5 s, adecuadas para secuencias de redes sociales o demos de producto.
- Prototipado rápido en local con cuantización GGUF/FP8: ejecutar el modelo en ComfyUI con el workflow de ejemplo permite iterar sobre prompts y CFG (1.0 para tonos íntimos y lentos, 3.8 para acción y diálogo) en hardware de gama alta de consumo.
- Generación de contenido para adultos: la fusión de Eros10 permite producir material NSFW, siempre que se cumplan las restricciones legales y de edad aplicables; requiere controles de acceso y verificación de cumplimiento normativo.
- Investigación en destilación y fusión de LoRAs: el repositorio sirve como caso de estudio de cómo combinar un LoRA de destilación, un LoRA de estilo y un ICLoRA en los pesos de un DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta parámetros de generación (resolución 1280 × 736, 121 fotogramas, 8-9 pasos, CFG entre 1.0 y 3.8) y no incluye métricas cuantitativas como FVD, CLIP score o comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los ~21 B parámetros; no confirmado por el autor): FP8 en torno a 21-24 GB solo de pesos, más el coste de latentes y fotogramas; GGUF Q8 ~22 GB, Q6 ~17 GB, Q5 ~15 GB, Q4 ~12-13 GB.
- Advertencia: la generación de vídeo añade una carga de memoria muy superior a la de un LLM del mismo tamaño, especialmente con 960 fotogramas y resoluciones de 1280 × 736 o superiores. Se recomienda VRAM holgada y, si es posible, descarga por capas a RAM.
- GPU recomendadas: A100 40/80 GB o H100 80 GB para FP8 sin compromisos; RTX 4090 (24 GB) para FP8 justa o GGUF Q5/Q4; RTX 3090 (24 GB) para GGUF Q4/Q5.
- Compatibilidad con GPU de consumo: previsiblemente viable con cuantizaciones GGUF Q4/Q5 en GPUs de 16-24 GB, a costa de resolución o número de fotogramas.
- Opciones de despliegue: ComfyUI es el entorno para el que se publican los workflows de ejemplo; carga de GGUF mediante nodos GGUF en ComfyUI. Otras plataformas como vLLM, llama.cpp, Ollama o TGI no están indicadas para este modelo en la información disponible.
- Latencia y throughput estimados: no disponibles. El único dato indirecto es la reducción a 4-9 pasos que aporta el LoRA DMD, frente a los pipelines de difusión de más pasos del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Duración de vídeo | Audio sincronizado | Licencia | Estado |
|---|---|---|---|---|---|
| TechnoBaptist/LTX-2.3-N-v1.4-FP8 | ~21 B (reportado) | Hasta 960 fotogramas (~40 s) | Sí | `unknown` | Repack comunitario, 0 descargas |
| Lightricks/LTX-2.3 (base) | No disponible en esta ficha | Soporte nativo de audio y vertical | Sí | Open weights (según ltx.io) | Modelo oficial, generación anterior |
| LTX-2.5 | No disponible en esta ficha | No disponible | No disponible | No disponible | Modelo oficial más reciente |
| Google Veo 3 | No disponible | No disponible | No disponible | Propietaria, cerrada | Referencia de calidad cerrada citada por la documentación de LTX |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW: la etiqueta `not-for-all-audiences` y la fusión del LoRA Eros10 implican generación de material para adultos. Requiere verificación de edad, controles de acceso y cumplimiento de la normativa aplicable en cada jurisdicción.
- Licencia desconocida (`unknown`): no se especifican condiciones de uso comercial. Al derivar de Lightricks/LTX-2.3 y de modelos de TenStrip, las condiciones reales dependen de las licencias de esos modelos base, que no están detalladas aquí. No debe asumirse uso comercial libre.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias anatómicas, deformaciones en manos o rostros y fallos de continuidad, especialmente en clips largos (960 fotogramas).
- Fiabilidad no contrastada: el repositorio registra 0 descargas y 0 interacciones, sin benchmarks publicados ni validación independiente.
- Guardrails limitados: el autor indica que existen protecciones contra contenido ilegal, pero no se detalla su alcance ni su eficacia.
- Idiomas: no se declara ningún idioma soportado; los ejemplos y prompts están en inglés, por lo que el comportamiento con otros idiomas es incierto.
- Datos de entrenamiento opacos: no se especifica composición del dataset ni número de tokens, lo que impide evaluar sesgos de origen.
- Uso de recursos: requiere hardware potente y tiempos de generación elevados para vídeo largo a resolución alta.
- Modelo superado: LTX-2.3 es la generación anterior a LTX-2.5, por lo que puede quedar por detrás en calidad y soporte a medio plazo.
- Inconsistencias en el repositorio: la librería declarada es `gguf` mientras el nombre indica `FP8`, y varios enlaces de la model card apuntan a repositorios de otro autor (`ChrisColeTech`), lo que dificulta verificar la procedencia exacta de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/LTX-2.3-N-v1.4-FP8
- Perfil del autor: https://huggingface.co/TechnoBaptist
- Modelo base Lightricks/LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base TenStrip/LTX2.3-10Eros: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Modelo base TenStrip/LTX2.3_DMD_Lora: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Página oficial de LTX-2.3: https://ltx.io/model/ltx-2-3
- Repositorio GitHub de LTX-2.3: https://github.com/desktop-LTX/LTX-2.3
- Página de generación LTX 2.3 (ltxlab): https://ltxlab.net/ltx-2-3
- Página de generación LTX 2.3 (ltx-23.app): https://ltx-23.app/
- Workflow de ejemplo (T2AV NSFW): https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
- Muestras de vídeo: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/samples/ComfyUI_00099_cfg_3_5.mp4
