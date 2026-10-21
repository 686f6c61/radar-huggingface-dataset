# UD77/patchbench-groot-n17-load

## Resumen

UD77/patchbench-groot-n17-load es un checkpoint de política robótica publicado por UD77 en Hugging Face, construido sobre GR00T N1.7 de NVIDIA y entrenado con LeRobot. No es un modelo de lenguaje general: es una política visión-lenguaje-acción que genera acciones de 6 dimensiones para un robot SO-101 follower equipado con dos cámaras, `front` y `wrist`.

El checkpoint está especializado en tres tareas de inserción de cable en un puerto izquierdo, medio o derecho, a partir de un dataset de 600 episodios y 139.323 fotogramas a 30 FPS. La arquitectura combina un backbone Cosmos-Reason2/Qwen3-VL con un transformador de acciones de flow matching, y el modelo declara 3.144.016.000 parámetros y licencia Apache-2.0.

Su relevancia es doble: por un lado, ofrece un ejemplo reproducible de ajuste fino de GR00T N1.7 con LeRobot para manipulación de precisión; por otro, su alcance es deliberadamente estrecho y no incluye evaluación real publicada, por lo que debe tratarse como un artefacto de investigación o prototipo, no como un sistema validado en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción basada en GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL y transformador de acciones con flow matching |
| Parámetros totales | 3.144.016.000 (aproximadamente 3,14 mil millones) |
| Parámetros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible; no se documenta una ventana de contexto lingüística. La entrada es fija: dos imágenes de 3x480x640, estado de 12 dimensiones, carga de servomotor de 6 dimensiones y corriente de servomotor de 6 dimensiones |
| Tipos de cuantización | No documentados; los pesos publicados están en safetensors |
| Idiomas soportados | No disponibles; las instrucciones de tarea documentadas están en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors; repositorio de 12,6 GB; librería LeRobot |
| Tipo de robot | `so101_follower` |
| Cámaras | `front`, `wrist` |
| Entrada | `observation.state` (12), `observation.images.front` (3x480x640), `observation.images.wrist` (3x480x640), `observation.servo_load` (6),
