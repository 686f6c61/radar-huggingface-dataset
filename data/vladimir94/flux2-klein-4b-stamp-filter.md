# vladimir94/flux2-klein-4b-stamp-filter

## Resumen

`vladimir94/flux2-klein-4b-stamp-filter` es un adaptador LoRA (PEFT) creado por el usuario vladimir94 sobre el modelo de difusión de imágenes `unsloth/FLUX.2-klein-4B`. El adaptador transforma fotografías en ilustraciones tipo "field notes" (notas de campo) con textura de sello, grano de impresión y fondo blanco, manteniendo la composición original de la imagen de entrada. Se trata de un modelo de image-to-image: requiere una imagen condicionante en la inferencia y no funciona como generador texto-a-imagen directo.

El adaptador se entrenó sobre un conjunto de 233 pares foto → ilustración aislada sobre fondo blanco, con una única palabra de activación ("stamp") y una pérdida focalizada en los tokens de destino. El modelo base, FLUX.2-klein-4B, es un modelo de difusión de 4.000 millones de parámetros desarrollado por Black Forest Labs, optimizado para generación rápida con pocos pasos (step-distilled). Este adaptador aprovecha esa arquitectura para ofrecer una transformación de estilo con solo 4 pasos de inferencia, lo que lo hace adecuado para prototipado y flujos de trabajo de edición de imágenes en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Flux2Transformer2DModel (base: unsloth/FLUX.2-klein-4B) |
| Parametros totales | No disponible (adaptador LoRA, no se indica el número de parámetros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | No disponible (el adaptador se entrenó en fp16; el modelo base puede ejecutarse en fp16 o cuantizado) |
| Idiomas soportados | No disponible (modelo de imagen, sin soporte explícito de idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `unsloth/FLUX.2-klein-4B`, un modelo de difusión de imágenes de tipo transformer (Flux2Transformer2DModel) con 4.000 millones de parámetros, optimizado mediante destilación de pasos (step-distilled) para generar imágenes en 4 pasos de inferencia. El adaptador LoRA se añade a las capas de atención y proyección del transformer (`to_qkv_mlp_proj`, `to_q`, `to_k`, `to_v`, `to_out.0`) con rango y alpha de 8.

El entrenamiento se realizó sobre 233 pares de imágenes (foto → ilustración aislada sobre fondo blanco), todas con el prompt "stamp". La condición se incorpora como tokens latentes adicionales, y la pérdida se calcula solo sobre los tokens de destino. Se usó una resolución máxima de 768×768 píxeles, manteniendo la proporción de aspecto sin recorte central. El proceso duró 700 pasos (~3 épocas) con una tasa de aprendizaje constante de 1e-4, en fp16, con tamaño de lote 1 y se ejecutó en Apple Silicon (MPS) durante aproximadamente 3 horas, alcanzando una pérdida media final de 0.60.

## Capacidades

- Transformación de imágenes: convierte fotografías en ilustraciones de estilo "field notes" con textura de sello, grano y fondo blanco.
- Requiere imagen condicionante: la inferencia necesita una imagen de entrada (image-to-image); sin ella, la salida es impredecible.
- Preservación del aspecto: la resolución de salida mantiene la relación de aspecto de la imagen de entrada, sin recorte.
- Generación rápida: está optimizado para 4 pasos de inferencia, gracias al modelo base step-distilled.
- Aplicación de estilo con palabra de activación: el prompt "stamp" activa el estilo del adaptador.
- Entrenamiento en bajo recurso: el adaptador se entrenó en hardware Apple Silicon, lo que indica bajo requisito computacional.

## Casos de uso

- Ilustración de documentación técnica: convertir fotografías de prototipos o esquemas en ilustraciones de estilo field-notes para manuales, guías o wikis, manteniendo la claridad del original.
- Creación de contenido para blogs y redes sociales: transformar fotos de paisajes o naturaleza en ilustraciones artísticas con textura de sello para publicaciones visuales.
- Diseño de materiales de marketing: generar versiones estilizadas de imágenes de productos o escenas para campañas publicitarias, con un look vintage y artesanal.
- Storyboarding y conceptualización: convertir fotos de referencia en bocetos de estilo de campo para previsualizar escenas de animación o cine.
- Personalización de material educativo: ilustrar fichas de flora, fauna o geología para guías de campo, usando fotos reales como entrada.
- Prototipado de estilo en pipelines de diseño: integrar el adaptador en flujos de trabajo con Diffusers para aplicar un estilo consistente a múltiples imágenes sin necesidad de retocar manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un adaptador de imagen y no se han reportado métricas cuantitativas (como FID, CLIP score, etc.) en la model card ni en las fuentes encontradas.

## Requisitos de hardware

- El adaptador LoRA es ligero (formato PEFT) y se carga sobre el modelo base `unsloth/FLUX.2-klein-4B` de 4.000 millones de parámetros.
- El modelo base requiere una GPU con al menos 4-8 GB de VRAM en fp16, según las especificaciones típicas de modelos de 4B (no se dispone de datos oficiales).
- Se entrenó en Apple Silicon (MPS) con 3 horas, lo que indica que puede ejecutarse en hardware de consumo.
- Para inferencia, se recomienda una GPU con soporte CUDA o MPS, como una RTX 3060 o superior, o un Mac con chip M1/M2/M3.
- Opciones de despliegue: el adaptador se integra con `diffusers` (pipeline `Flux2KleinPipeline`) y se puede usar en local o en servicios que soporten PEFT.
- No se proporcionan datos de latencia o throughput específicos; el modelo base está diseñado para 4 pasos, lo que reduce el tiempo de generación.

## Comparativa con modelos similares

No disponible. No se han encontrado adaptadores LoRA similares en el ecosistema para FLUX.2-klein-4B con la misma función de estilo. La comparación natural sería con el modelo base sin adaptador (que genera imágenes realistas) o con otros adaptadores de estilo, pero no se dispone de datos de rendimiento ni de parámetros para comparar.

## Limitaciones y advertencias

- Requiere imagen condicionante: sin imagen de entrada, la salida es impredecible y no se puede usar como generador texto-a-imagen.
- Limitación de dominio: funciona mejor en paisajes y naturaleza, similares al conjunto de entrenamiento; otras temáticas pueden producir resultados degradados.
- Sensibilidad al número de pasos: el modelo base está step-distillado y solo se recomiendan 4 pasos; usar más pasos puede deslavar los detalles.
- Sin soporte de idiomas: el adaptador no tiene capacidades lingüísticas; el prompt se limita a la palabra "stamp".
- Licencia Apache-2.0: permite uso comercial y modificación, pero debe mantenerse la atribución y el aviso de licencia.
- No se han publicado evaluaciones de sesgos o alucinaciones; como modelo de imagen, puede producir artefactos visuales en casos fuera del dominio.
- El adaptador se entrenó en un conjunto pequeño (233 pares), lo que limita la generalización a variedad de escenas.

## Enlaces

- HuggingFace: https://huggingface.co/vladimir94/flux2-klein-4b-stamp-filter
- Modelo base en HuggingFace: https://huggingface.co/unsloth/FLUX.2-klein-4B
- Repositorio oficial de inferencia: https://github.com/VladimirRL/flux2-klein-4b
- Modelo original de Black Forest Labs: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Página de producto (flux-klein.com): https://flux-klein.com/ai-models/flux2-klein-4b
