# twistlabs/fotometis-qwen-3.5-4b-mlx

## Resumen

El modelo `twistlabs/fotometis-qwen-3.5-4b-mlx` es una adaptación cuantizada a 4 bits del modelo base Qwen/Qwen3.5-4B, desarrollada por el equipo de twistlabs. Está diseñado específicamente como asistente de desarrollo integrado en Fotometis, un editor de fotos RAW. El modelo se distribuye en formato MLX, lo que lo hace compatible con dispositivos Apple Silicon, y ha sido entrenado para soportar tool-use y un modo de razonamiento (thinking) que puede activarse o desactivarse según la preferencia del usuario.

La relevancia de este modelo radica en su especialización para el dominio de edición fotográfica, ofreciendo una alternativa ligera y cuantizada que puede ejecutarse en hardware de consumo. Aunque el nombre sugiere 4 mil millones de parámetros, los pesos en safetensors contienen 991.474.176 parámetros, lo que indica una posible arquitectura con parámetros compartidos o una cuantización agresiva. La model card no proporciona detalles sobre arquitectura, contexto o licencia, por lo que gran parte de la información técnica permanece no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base: Qwen3.5-4B) |
| Parametros totales | 991.474.176 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, group 64 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo. Se sabe que parte del modelo base Qwen3.5-4B, pero no se especifica si se trata de un transformer denso, MoE o una variante híbrida. La cuantización a 4 bits con group size 64 reduce el tamaño en disco a 3.1 GB, según la model card, aunque el repositorio ocupa 9.1 GB (posiblemente incluyendo archivos adicionales como el modelo original o checkpoints intermedios).

El entrenamiento ha incluido ajuste para tool-use y para el modo thinking, que puede activarse o desactivarse mediante un toggle. No se han publicado detalles sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La versión indicada es `v1` y las reglas de renderizado se denominan `R11`, sin más especificaciones.

## Capacidades

- Asistente de desarrollo integrado en Fotometis, un editor de fotos RAW.
- Soporte de tool-use / function calling, lo que permite integrarlo en flujos de trabajo automatizados.
- Modo thinking entrenado en ambas direcciones (activado o desactivado), útil para tareas de razonamiento multi-paso.
- Cuantización 4-bit que reduce el consumo de memoria y permite ejecución en hardware modesto.
- Compatible con MLX, lo que facilita su uso en Macs con Apple Silicon.

## Casos de uso

- Edición de fotos RAW asistida: el modelo puede sugerir ajustes de exposición, balance de blancos o curvas tonales basándose en la descripción del usuario, integrándose como copiloto dentro de Fotometis.
- Automatización de flujos de revelado: gracias al tool-use, puede invocar funciones de la aplicación para aplicar ajustes por lotes a múltiples imágenes.
- Asistente de post-procesado para fotógrafos: responde preguntas sobre técnicas de edición, composición o corrección de color, con capacidad de razonamiento para explicar decisiones.
- Generación de informes de análisis de imagen: puede describir características técnicas de un RAW (histograma, ruido, rango dinámico) si se le proporcionan los datos.
- Integración en pipelines de fotografía computacional: al ser ligero y cuantizado, puede desplegarse en entornos con recursos limitados para tareas de clasificación o etiquetado de imágenes.
- Prototipado de agentes conversacionales para software de edición: su soporte de tool calling permite construir asistentes que ejecuten comandos del editor de forma natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parámetros cuantizado a 4 bits, el archivo pesa 3.1 GB, por lo que se estima que necesita al menos 4 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, o Apple Silicon (M1/M2/M3) gracias al formato MLX.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama de entrada y en Macs con Apple Silicon.
- Opciones de despliegue: al ser MLX, se puede ejecutar con la librería MLX de Apple. Para otras plataformas, sería necesario convertir los pesos a GGUF o usar vLLM si se adapta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base Qwen3.5-4B podría ser un punto de referencia, pero no se han publicado datos de rendimiento de esta adaptación.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones; se recomienda evaluar el modelo en el dominio específico antes de usarlo en producción.
- La licencia no está especificada, por lo que el uso comercial puede estar restringido; se debe contactar con el autor para aclarar los términos.
- La cuantización a 4 bits puede degradar la calidad de las respuestas en tareas complejas de razonamiento o generación de código.
- El modelo está especializado en edición de fotos RAW; su rendimiento en otras tareas generales puede ser limitado.
- No se dispone de la longitud de contexto, lo que impide conocer los límites de memoria para conversaciones largas o documentos extensos.
- El repositorio tiene un tamaño de 9.1 GB, pero la model card indica 3.1 GB en disco; esta discrepancia sugiere que puede haber archivos adicionales no documentados.

## Enlaces

- [HuggingFace: twistlabs/fotometis-qwen-3.5-4b-mlx](https://huggingface.co/twistlabs/fotometis-qwen-3.5-4b-mlx)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
