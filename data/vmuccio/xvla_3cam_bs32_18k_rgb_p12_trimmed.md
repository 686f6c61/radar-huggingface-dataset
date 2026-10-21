# VMuccio/xvla_3cam_bs32_18k_rgb_p12_trimmed

## Resumen

Este repositorio contiene una política robótica X-VLA ajustada por VMuccio a partir de `lerobot/xvla-base` y publicada con la librería LeRobot. No es un modelo de lenguaje generativo, sino una política de visión-lenguaje-acción para controlar un robot `so_follower` en tareas de recogida y depósito de cubos de colores en una cesta. El pipeline declarado es `robotics` y la licencia es Apache-2.0.

X-VLA es un marco de visión-lenguaje-acción con soft prompts y flow matching: codifica cada robot o configuración de hardware como una tarea mediante un conjunto pequeño de embeddings de soft prompt aprendibles, de modo que un único modelo puede reconciliar morfologías, sensores y espacios de acción distintos. En este caso, el ajuste fino utiliza tres cámaras —`gripper`, `front` y `top`—, un estado de 8 dimensiones y una salida de acción de 6 dimensiones.

El checkpoint tiene 879.687.256 parámetros y se entrenó durante 18.000 pasos con batch 32 sobre el dataset `VMuccio/rgb_p12_trimmed`, compuesto por 528 episodios y 288.800 frames a 30 FPS. Es relevante como ejemplo reproducible de ajuste fino de X-VLA con LeRobot, pero su alcance es muy concreto y no incluye resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | X-VLA: Vision-Language-Action con soft prompts y flow matching; fine-tuning de `lerobot/xvla-base` |
| Parámetros totales | 879.687.256 (~880 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje conversacional con ventana de contexto) |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible; la tarjeta no documenta una entrada de lenguaje natural para esta política |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `lerobot/xvla-base` |
| Tipo de robot | `so_follower` |
| Cámaras | `gripper`, `front`, `top` |
| Entradas | `observation.images.image` (3, 256, 256); `observation.images.image2` (3, 256, 256); `observation.images.image3` (3, 224, 224); `observation.state` (8,) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `VMuccio/rgb_p12_trimmed`; 528 episodios; 288.800 frames; 30 FPS |
| Configuración de entrenamiento | 18.000 pasos; batch 32; optimizador `xvla-adamw`; learning rate 0,0001; seed 1000; LeRobot 0.6.1 |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

X-VLA es un marco VLA con soft prompts y flow matching. En lugar de entrenar políticas separadas para cada robot, el método representa cada configuración de hardware como una tarea codificada mediante un conjunto pequeño de embeddings de soft prompt aprendibles. Así, un mismo modelo puede manejar morfologías, sensores y espacios de acción diversos. La política de este repositorio parte de `lerobot/xvla-base` y se ha ajustado para un robot `so_follower` con tres cámaras y una salida de acción de 6 dimensiones.

El ajuste fino se realizó con LeRobot 0.6.1 durante 18.000 pasos, batch 32, optimizador `xvla-adamw`, learning rate 0,0001 y seed 1000. El dataset `VMuccio/rgb_p12_trimmed` contiene 528 episodios y 288.800 frames a 30 FPS, con tres tareas: recoger el cubo rojo, el amarillo o el azul y depositarlo en la cesta. No se documenta RLHF ni DPO; el entrenamiento corresponde a un ajuste de imitación sobre demostraciones. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal para este checkpoint concreto.

## Capacidades

- Control visual-motor para tareas de pick-and-place: recoger cubos rojo, amarillo o azul y depositarlos en una cesta.
- Fusión de tres cámaras: dos imágenes de 256×256 y una de 224×224, junto con un estado de 8 dimensiones.
- Generación de acciones continuas de 6 dimensiones para el robot `so_follower`.
- Uso
