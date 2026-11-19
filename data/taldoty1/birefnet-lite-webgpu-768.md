# taldoty1/birefnet-lite-webgpu-768

## Resumen

BiRefNet-lite-webgpu-768 es una exportación a ONNX del modelo de segmentación y eliminación de fondos ZhengPeng7/BiRefNet_lite, adaptada para ejecutarse en el backend WebGPU de onnxruntime-web dentro de un navegador. La publica el usuario taldoty1 como artefacto derivado, no como un modelo entrenado desde cero: los pesos son los del modelo base y lo que cambia es el grafo y la resolución de entrada, fijada en 768 x 768 píxeles.

El problema que resuelve es práctico. La exportación a 1024 px del mismo modelo base necesita aproximadamente 6 GB de memoria en el navegador, una cifra que deja fuera a muchos equipos. Esta versión a 768 px rebaja el requisito a unos 4 GB, lo que la hace viable en portátiles con GPU integrada moderna o en tarjetas gráficas de gama media.

El repositorio es pequeño (unos 0,1 GB) y contiene un único archivo ONNX de 108.448.198 bytes en fp16. La licencia es MIT, heredada del modelo base. No hay información sobre idiomas ni pipeline declarado en Hugging Face, algo esperable en un modelo de visión cuyo cometido es producir una máscara binaria de primer plano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de segmentación dicotómica de referencia, según el modelo base); grafo ONNX optimizado para WebGPU |
| Parametros totales | no disponible (el archivo ONNX pesa 108.448.198 bytes en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1 x 3 x 768 x 768) |
| Tipos de cuantizacion | pesos fp16 con entradas y salidas float32; no se documentan otras variantes |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`birefnet_lite_webgpu_fp16_768.onnx`) |
| Resolución de entrada | 768 x 768, normalización con media y desviación estándar de ImageNet |
| Resolución de salida | logits 1 x 1 x 768 x 768; aplicar sigmoid para obtener la máscara |
| SHA-256 | `564cefe15d173af934faa43374e74e9dd8147083e6533db1011e35d0ccbd6849` |
| Revisión del modelo base | `aa62cd87` |

## Arquitectura y entrenamiento

El modelo base BiRefNet_lite es una red de segmentación de imagen completa pensada para separar primer plano y fondo con alta precisión en los bordes. Esta exportación no reentrena nada: conserva los pesos de ZhengPeng7/BiRefNet_lite y modifica únicamente el grafo para que sea compatible con WebGPU. Los cambios documentados son optimización offline básica, limitación de las cascadas de Concat y Split a 6, reescritura de las operaciones Sum como cadenas de Add, y conversión de pesos a fp16 manteniendo entradas y salidas en float32. El procedimiento sigue el descrito por la exportación a 1024 px de runes/birefnet-lite-webgpu.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens o imágenes, composición del dataset, uso de RLHF o ajuste fino). La model card sí menciona que el modelo base se entrenó con DIS5K, cuyas imágenes tienen sus propias condiciones de uso. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de red.

## Capacidades

- Segmentación de primer plano y eliminación de fondo en imágenes, con salida de logits a 768 x 768 que se convierten en máscara mediante sigmoid.
- Generación de máscaras de alta resolución relativa (768 px), adecuada para recorte fino de bordes en sujetos complejos como pelo, pelaje o siluetas irregulares.
- Ejecución en navegador mediante onnxruntime-web con backend WebGPU, sin necesidad de servidor.
- Procesamiento de una imagen por inferencia con entrada de tamaño fijo; no admite resolución variable sin reescalado previo.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto.
- No tiene capacidades multilingües ni de audio: es exclusivamente un modelo de visión.

## Casos de uso

- Edición de fotos en el navegador: una aplicación web puede cargar el ONNX con onnxruntime-web y generar la máscara de fondo en el propio dispositivo, evitando subir imágenes a un servidor y reduciendo costes de infraestructura.
- Herramientas de diseño gráfico: integración en editores que necesitan recortar sujetos para componer carteles o miniaturas, con la ventaja de que el modelo cabe en equipos de gama media gracias a los aproximadamente 4 GB de memoria requeridos.
- Comercio electrónico: generación automática de imágenes de producto sobre fondo blanco o transparente a partir de fotos tomadas por el vendedor, ejecutándose en el cliente y sin exponer material sensible.
- Videoconferencia y webcam: sustitución o desenfoque de fondo en tiempo real en aplicaciones web, siempre que la latencia por fotograma sea aceptable en el hardware del usuario.
- Procesamiento por lotes en el navegador: herramientas internas que aplican la misma máscara a catálogos de imágenes sin depender de una GPU en la nube.
- Creación de contenido para redes sociales: recorte rápido de personas u objetos para stickers, memes o composiciones, con la ventaja de funcionar offline una vez cacheado el archivo ONNX.
- Prototipado e investigación: banco de pruebas para comparar la calidad de BiRefNet_lite a 768 px frente a la variante de 1024 px en condiciones de memoria restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria estimada en navegador: aproximadamente 4 GB para la entrada de 768 x 768, frente a los aproximadamente 6 GB de la exportación a 1024 px.
- GPU recomendadas: no se especifican modelos concretos; el requisito es un navegador con soporte de WebGPU (Chrome, Edge y versiones recientes de otros motores) y una GPU compatible con dicho backend.
- GPU de consumo: la reducción a 4 GB sugiere viabilidad en tarjetas de gama media y en algunas GPU integradas recientes, pero no hay lista de compatibilidad publicada.
- Despliegue: onnxruntime-web con backend WebGPU; el archivo ONNX también puede ejecutarse fuera del navegador con otros runtimes de ONNX, aunque no se documenta esa ruta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Resolución | Memoria en navegador | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| taldoty1/birefnet-lite-webgpu-768 | 768 x 768 | ~4 GB | ONNX fp16 | MIT | Esta ficha; grafo adaptado a WebGPU |
| runes/birefnet-lite-webgpu | 1024 x 1024 | ~6 GB | ONNX | no disponible en la información | Exportación de referencia del mismo modelo base |
| ZhengPeng7/BiRefNet_lite | no disponible | no aplica (PyTorch) | safetensors/PyTorch | MIT | Modelo base original, sin adaptación a WebGPU |

## Limitaciones y advertencias

- Es una exportación, no un modelo nuevo: hereda tanto las virtudes como los sesgos y errores del modelo base BiRefNet_lite.
- La resolución está fijada en 768 x 768; imágenes de otra relación de aspecto deben redimensionarse, lo que puede degradar la máscara en sujetos muy alargados.
- Requiere un navegador con WebGPU operativo; en equipos sin ese soporte el modelo no se ejecutará en su ruta prevista.
- Consumo de memoria de aproximadamente 4 GB en el navegador, lo que puede provocar el cierre de pestañas en dispositivos con poca RAM o GPU compartida.
- Riesgo de máscaras imprecisas en imágenes con fondos complejos, transparencias, movimiento o sujetos poco definidos, como ocurre con cualquier segmentador.
- El modelo base se entrenó con DIS5K, cuyas imágenes tienen condiciones de uso propias; la licencia MIT cubre los pesos, pero no necesariamente los datos de origen.
- No hay métricas publicadas de calidad ni de latencia para esta exportación concreta, por lo que la evaluación en producción debe hacerse por cuenta del integrador.
- El repositorio no tiene descargas ni likes y fue creado recientemente; no hay historial de uso que respalde su estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taldoty1/birefnet-lite-webgpu-768
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Exportación de referencia a 1024 px: https://huggingface.co/runes/birefnet-lite-webgpu
