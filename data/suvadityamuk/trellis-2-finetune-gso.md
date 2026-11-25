# suvadityamuk/trellis-2-finetune-gso

## Resumen

`trellis-2-finetune-gso` es una colección de adaptadores LoRA publicada por el usuario `suvadityamuk` sobre el modelo base `microsoft/TRELLIS.2-4B`, un generador image-to-3D de 4.000 millones de parámetros. El ajuste fino especializa el modelo en la reconstrucción de geometría de calzado (zapatos, zapatillas y similares) a partir de una única imagen de entrada, un dominio donde el modelo base presenta un rendimiento notablemente inferior.

El adaptador no modifica la generación de texturas: según la model card, las texturas siguen proviniendo del modelo base, mientras que los dos flujos de geometría (sparse structure y shape) son los que se ajustan. El paquete se compone de dos adaptadores independientes que deben aplicarse conjuntamente, con un peso total de aproximadamente 37 MB cada uno, lo que lo convierte en un artefacto muy ligero frente a los 0,8 GB del repositorio completo.

La relevancia práctica es doble: por un lado demuestra que un ajuste fino con apenas 188 objetos puede reducir la distancia de Chamfer de 0,174 a 0,033 en el dominio objetivo; por otro, el autor publica junto al modelo el pipeline de entrenamiento y generación, lo que permite replicar el proceso en otros conjuntos de mallas 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre TRELLIS.2-4B, modelo generativo image-to-3D basado en flujos rectificados (rectified flow) con flujos separados de sparse structure y shape |
| Parametros totales | No disponible para los adaptadores (el modelo base es de 4B). Cada adaptador ocupa ~37 MB de pesos LoRA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión/3D, no de texto) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones para los adaptadores; se entrenó en bf16) |
| Idiomas soportados | No disponible (la entrada es una imagen, no texto) |
| Licencia | MIT (adaptadores); el modelo base TRELLIS.2-4B es MIT según la model card; DINOv3 tiene licencia propia de Meta y no se incluye |
| Formato de pesos | `safetensors` (PEFT LoRA) |
| Rango / alpha | Sparse-structure: rank 8, alpha 16, sobre atención + MLP. Shape: rank 16, alpha 32, solo atención |
| Checkpoint recomendado | `adapter-3000.safetensors` en ambos flujos |
| Resolución de entrenamiento | Latentes de 512 (`--pipeline-type 512`) |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo base TRELLIS.2-4B genera mallas 3D a partir de una imagen mediante un esquema de flujos rectificados con dos etapas de geometría diferenciadas: un flujo de estructura dispersa (sparse structure) que fija la forma global y un flujo de forma (shape) que refina el detalle de superficie. El ajuste fino replica esa separación: se entrena un adaptador LoRA por flujo, con rangos distintos según la sensibilidad de cada etapa. Ambos adaptadores deben aplicarse simultáneamente, ya que el de estructura corrige la silueta y el de forma corrige el detalle superficial.

Los datos de entrenamiento proceden del conjunto `suvadityamuk/gso-footwear-trellis2-latents`, derivado de Google Scanned Objects: 188 zapatos, con un 5 % reservado para evaluación y con las variantes de color de un mismo modelo mantenidas en el mismo lado del split para evitar fuga de información. El entrenamiento se realizó durante 3.000 pasos por flujo con AdamW, learning rate 1e-4, batch efectivo de 16 y precisión bf16, sobre una única A100 de 80 GB: 7,2 horas para el flujo de estructura dispersa y 3,6 horas para el de forma. La función de pérdida es la de velocidad del flujo rectificado, con la condición de imagen eliminada un 10 % de las veces para permitir classifier-free guidance. El pipeline de generación depende del codificador de imagen DINOv3, que es un modelo con acceso restringido (gated) en Hugging Face.

## Capacidades

- Reconstrucción image-to-3D de calzado: genera una malla 3D de un zapato a partir de una sola imagen.
- Mejora específica de geometría en el dominio del calzado, con reducción drástica de la distancia de Chamfer respecto al modelo base.
- Generación de texturas heredada del modelo base TRELLIS.2-4B (los adaptadores no ajustan textura).
- Modo comparativo (`--compare`) que produce la malla del modelo base con la misma semilla para evaluar la mejora lado a lado.
- Exportación de resultados en formato GLB, con mallas de evaluación incluidas en el repositorio.
- Compatibilidad con el ecosistema PEFT y con el pipeline de TRELLIS.2 (extensiones CUDA nativas).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Catalogación de producto en e-commerce de calzado: a partir de una fotografía de producto se genera una malla 3D navegable para fichas de producto o visores web, aprovechando que el ajuste está especializado exactamente en esa categoría de objeto.
- Prueba virtual y visualización de calzado: la malla generada puede alimentar visores 3D o configuradores donde el usuario rota el zapato antes de comprar; el adaptador de forma aporta el detalle de superficie necesario para que el modelo no parezca una silueta genérica.
- Generación de activos para videojuegos y realidad aumentada: creación rápida de props de calzado para escenas 3D o experiencias AR a partir de una sola foto de referencia, sin modelado manual.
- Digitalización de inventario físico: reconstrucción de la geometría de un zapato a partir de una imagen tomada en almacén, útil para inventarios 3D o control de calidad de forma.
- Investigación en reconstrucción 3D monocular: el repositorio incluye métricas de evaluación y mallas base-vs-LoRA por objeto, lo que lo convierte en un punto de partida reproducible para experimentos de ajuste fino en dominios concretos.
- Replicación del pipeline en otros dominios: el código de entrenamiento publicado permite reentrenar los adaptadores sobre otros conjuntos de mallas (no solo calzado) siguiendo el mismo esquema de dos flujos.
- Evaluación comparativa de técnicas LoRA en modelos generativos 3D: los checkpoints intermedios (500 a 2500 pasos) permiten estudiar la curva de convergencia del ajuste.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, promediados sobre los zapatos reservados del split de evaluación, con un render de condicionamiento por objeto y la misma semilla para ambos modelos. No verificados de forma independiente.

| Modelo | Chamfer distance ↓ | F-score@0.02 ↑ | Normal consistency ↑ |
|---|---|---|---|
| TRELLIS.2-4B (base) | 0,174 | 0,276 | 0,530 |
| TRELLIS.2-4B + este LoRA | 0,033 | 0,803 | 0,804 |

La mejora es de aproximadamente 5,3× en distancia de Chamfer, +0,527 en F-score@0.02 y +0,274 en consistencia de normales. No se han publicado en la información disponible resultados comparativos frente a otros modelos image-to-3D de terceros.

## Requisitos de hardware

- El entrenamiento se realizó en una única NVIDIA A100 de 80 GB (7,2 h para el flujo de estructura dispersa, 3,6 h para el de forma).
- Los adaptadores en sí son ligeros (~37 MB cada uno), pero la inferencia requiere cargar el modelo base TRELLIS.2-4B completo, por lo que la VRAM necesaria viene determinada por el modelo base, no por el LoRA; el autor no documenta cifras exactas de VRAM para inferencia.
- El autor propone ejecutar la generación en HF Jobs con el flavor `l4x1` (una GPU L4) y un timeout de 1 hora, lo que sugiere que la inferencia cabe en GPUs de gama profesional de 24 GB, aunque no se especifica el consumo exacto.
- No se documenta compatibilidad con GPUs de consumo (RTX 4090, etc.) ni cuantizaciones que permitan reducir requisitos; TRELLIS.2 requiere extensiones CUDA compiladas.
- El autor publica kernels nativos para CUDA, Metal y ROCm, lo que abre la puerta a despliegue en Apple Silicon y AMD, aunque sin cifras de rendimiento publicadas.
- Opciones de despliegue: imagen preconstruida en HF Jobs (`cr.hf.co/suvadityamuk/trellis2-finetuning:latest`), script `generate.py` del repositorio de código, y un port a Diffusers (`suvadityamuk/TRELLIS.2-4B-diffusers-3d`).
- Requisito adicional: la cuenta debe tener acceso al codificador de imagen DINOv3, que está restringido (gated).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Dominio | Chamfer ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TRELLIS.2-4B (base) | Image-to-3D | 4B | General | 0,174 | MIT | Hugging Face |
| TRELLIS.2-4B + este LoRA | Image-to-3D + LoRA | 4B + adaptadores | Calzado | 0,033 | MIT | Hugging Face |
| Otros modelos image-to-3D de propósito general | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye comparaciones con modelos image-to-3D de terceros (por ejemplo, alternativas de reconstrucción monocular), por lo que la comparativa se limita al modelo base y a su versión ajustada.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está entrenado exclusivamente con 188 zapatos de Google Scanned Objects; el rendimiento en otras categorías de objeto no está documentado y previsiblemente será peor que el del modelo base.
- Sesgo de dominio: el conjunto de entrenamiento procede de escaneos de Google Scanned Objects, con una distribución concreta de estilos, materiales e iluminación; zapatos fuera de esa distribución pueden degradar la calidad.
- Las texturas no se ajustan: siguen generándose con el modelo base, por lo que la mejora se limita a la geometría.
- Métricas no verificadas: los resultados del `model-index` están marcados como `verified: false` y proceden del propio autor; no hay evaluación independiente.
- Dependencia de acceso restringido: requiere acceso aprobado al codificador DINOv3, lo que puede bloquear el despliegue en organizaciones sin permisos.
- Dependencia de extensiones CUDA: el pipeline nativo necesita kernels compilados; la ruta más sencilla es la imagen preconstruida en HF Jobs.
- Restricción de resolución: los adaptadores se entrenaron con latentes de 512 y el autor advierte de mantener `--pipeline-type 512`; usar otra configuración puede invalidar el ajuste.
- Riesgo de alucinación geométrica: como todo modelo generativo, puede producir geometría plausible pero incorrecta en detalles finos (suelas, cordones, cierres) cuando la imagen de entrada es ambigua.
- Licencias: los adaptadores y TRELLIS.2 son MIT; Google Scanned Objects es CC-BY-4.0 y requiere atribución; DINOv3 se rige por la licencia de Meta y no se incluye en el repositorio.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suvadityamuk/trellis-2-finetune-gso
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Paper de TRELLIS.2: https://huggingface.co/papers/2512.14692
- Dataset de entrenamiento: https://huggingface.co/datasets/suvadityamuk/gso-footwear-trellis2-latents
- Repositorio de código y entrenamiento: https://github.com/suvadityamuk/trellis2-finetuning
- Script de generación: https://github.com/suvadityamuk/trellis2-finetuning/blob/main/skills/trellis2-lora/scripts/generate.py
- Space de entrenamiento LoRA 3D: https://huggingface.co/spaces/hugging-3d/3d-model-lora-trainer
- Port a Diffusers: https://huggingface.co/suvadityamuk/TRELLIS.2-4B-diffusers-3d
- Kernels CUDA: https://huggingface.co/kernels/suvadityamuk/trellis2-cuda
- Kernels Metal: https://huggingface.co/kernels/suvadityamuk/trellis2-metal
- Kernels ROCm: https://huggingface.co/kernels/suvadityamuk/trellis2-rocm
- Codificador DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Documentación de HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
