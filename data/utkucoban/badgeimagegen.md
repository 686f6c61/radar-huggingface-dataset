# utkucoban/BadgeImageGen

## Resumen

BadgeImageGen es un generador de imágenes incondicional de flores de 3,42 millones de parámetros, cuantizado a INT8 y diseñado para ejecutarse íntegramente en el microcontrolador ESP32-C3 de la placa Espruino ePaper Badge. Lo desarrolla utkucoban y se publica bajo licencia MIT. No es un modelo de lenguaje: es una GAN de imágenes pequeña pensada para demostrar que la inferencia generativa cabe en hardware embebido de gama baja con 4 MiB de flash.

El modelo reutiliza un entrenamiento previo sin reentrenar y genera imágenes de 320 × 176 píxeles RGB que después se recortan a 320 × 172, se amplían a 800 × 430 y se traman (dithering) a los cuatro colores de la pantalla ePaper (negro, blanco, amarillo y rojo). Cada imagen tarda unos 48 segundos en generarse, solapando la siguiente generación con el refresco de pantalla.

Su relevancia es fundamentalmente técnica y demostrativa: muestra un pipeline completo de entrenamiento en PyTorch, exportación a INT8 y despliegue en C nativo sobre ESP-IDF, con verificación byte a byte frente a tensores de referencia. No está pensado para producción ni para tareas de lenguaje, y no dispone de datos de benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN (generador convolucional; arquitectura exacta no detallada en la model card) |
| Parametros totales | 3,42 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | INT8 (pesos exportados en INT8; se incluye el export original) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | Pesos INT8 exactos con layout de tensores propio, más export original del modelo; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe una GAN de flores con 3,42 millones de parámetros, entrenada originalmente en PyTorch y exportada a INT8 para inferencia nativa en C sobre ESP-IDF. El repositorio incluye el código de arquitectura, entrenamiento, preparación de datos y exportación en `training/`, y la implementación de inferencia en `source/`. No se detalla en la información disponible el tipo exacto de generador (por ejemplo, si es una DCGAN, StyleGAN reducida u otra variante), ni el número de capas o la composición del discriminador.

El entrenamiento utilizó las 8.189 imágenes del dataset Oxford Flowers102, obtenidas del mirror `pufanyi/flowers102` en la revisión `b61e48cb66625272ca3bf36442062362587fa9bb`. Las imágenes no se replican en el repositorio, pero sí el código de preparación y los metadatos en `data/dataset.json`. No se indica en la información disponible si se aplicaron técnicas de RLHF, DPO ni aumentación de datos. La innovación destacable es el despliegue: inferencia INT8 en un ESP32-C3 con solapamiento de la generación con el refresco de la pantalla ePaper, y verificación de que la implementación coincide byte a byte con los tensores de referencia en siete semillas.

## Capacidades

- Generación de imágenes incondicional de flores en formato RGB de 320 × 176 píxeles.
- Ejecución completa en el microcontrolador ESP32-C3 de la placa Espruino ePaper Badge, sin servidor ni conexión de red.
- Postprocesado integrado: recorte a 320 × 172, escalado a 800 × 430 y dithering a cuatro colores (negro, blanco, amarillo, rojo) para la pantalla ePaper de 800 × 480.
- Visualización de información auxiliar en los bordes de la imagen: tiempos, RAM libre, número de imagen y semilla.
- Generación continua automática: tras la primera imagen, las siguientes se generan solapando el refresco de pantalla.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la generación de imágenes.

## Casos de uso

- Demostración de inferencia generativa en microcontroladores: sirve para mostrar en charlas o talleres que una GAN cuantizada a INT8 puede ejecutarse en un ESP32-C3 con 4 MiB de flash, midiendo tiempos de generación y uso de RAM en la propia pantalla.
- Arte generativo en dispositivos de tinta electrónica: el pipeline de dithering a cuatro colores está pensado para pantallas ePaper de bajo consumo, por lo que puede adaptarse a marcos digitales o carteles que cambian de imagen cada minuto sin gasto energético continuo.
- Badges y wearables de conferencias: la placa Espruino ePaper Badge es un badge de evento; el modelo permite sustituir la aplicación original por un generador de flores animado, conservando la posibilidad de restaurar los datos previos mediante copia de seguridad.
- Material educativo sobre cuantización y despliegue: el repositorio incluye pesos INT8 exactos, layout de tensores, tensores de referencia y código de exportación, lo que lo convierte en un caso de estudio reproducible para aprender el flujo PyTorch → INT8 → C.
- Pruebas de portabilidad a otros ESP32: la model card indica que otras placas ESP32 necesitan su propio port; el código y los pesos sirven como base para validar el mismo modelo en variantes con más flash o distinta pantalla.
- Prototipado de generadores de imágenes de muy bajo coste: para aplicaciones donde la resolución y la calidad no son críticas pero sí el consumo y el coste del hardware, el modelo ofrece una referencia funcional de 3,42 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente aporta métricas de despliegue: 3,42 millones de parámetros, cuantización INT8, generación de una imagen en aproximadamente 48 segundos en el ESP32-C3, primera imagen en alrededor de un minuto tras el flasheo, y verificación byte a byte frente a los tensores de referencia en siete semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el destino; el modelo corre en el ESP32-C3 con 4 MiB de flash y sin GPU. Para el entrenamiento o la exportación en PyTorch no se especifican requisitos en la información disponible.
- GPU recomendadas: no disponible para entrenamiento; el despliegue no requiere GPU.
- Cabe en consumer GPU: sí, cualquier GPU consumer podría ejecutar el modelo en PyTorch, aunque el objetivo del proyecto es el microcontrolador.
- Opciones de despliegue: firmware precompilado `firmware.bin` que incluye la aplicación y todos los pesos, flasheable desde el navegador con Espressif ESP Tool (Chrome o Edge de escritorio) o por terminal con `esptool==5.6.0` y el comando `write-flash 0x0 firmware.bin`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: aproximadamente 48 segundos por imagen en el ESP32-C3, con solapamiento de la siguiente generación con el refresco de la pantalla ePaper; la primera imagen aparece en torno a un minuto tras el arranque.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de generación de imágenes para ESP32-C3 ni comparativas con GANs embebidas de características similares.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo genera flores incondicionalmente, sin control por prompt, clase o estilo; no es un modelo de propósito general.
- Resolución baja: 320 × 176 píxeles RGB, ampliada a 800 × 430 y tramada a cuatro colores, por lo que la calidad final está limitada por la pantalla ePaper.
- Latencia alta para uso interactivo: unos 48 segundos por imagen en el ESP32-C3.
- Sin datos de sesgo, alucinación o evaluación de calidad: la model card no publica métricas de FID, IS ni evaluaciones similares, y no se dispone de información sobre sesgos en el dataset Oxford Flowers102.
- Licencia MIT para el código y los pesos originales, pero los términos de código de terceros y del dataset Oxford Flowers102 son independientes y se detallan en `NOTICE.md`; conviene revisarlos antes de un uso comercial.
- El flasheo del firmware reemplaza la aplicación original y los datos guardados del badge; es necesario hacer copia de seguridad previa siguiendo `BACKUP.md`.
- Solo está validado en la revisión 1.2 de la placa con el mapeo de pines del fabricante; otras placas ESP32 requieren un port propio.
- El checkpoint original en punto flotante no está incluido en el paquete; solo se incluye el export INT8 original, lo que limita la reproducibilidad del entrenamiento completo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario ni mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/utkucoban/BadgeImageGen
- Firmware precompilado: https://huggingface.co/utkucoban/BadgeImageGen/blob/main/firmware.bin
- Código fuente e inferencia en C: https://huggingface.co/utkucoban/BadgeImageGen/tree/main/source
- Código de entrenamiento y exportación: https://huggingface.co/utkucoban/BadgeImageGen/tree/main/training
- Pesos INT8 y tensores de referencia: https://huggingface.co/utkucoban/BadgeImageGen/tree/main/data
- Metadatos del dataset: https://huggingface.co/utkucoban/BadgeImageGen/blob/main/data/dataset.json
- Instrucciones de compilación: https://huggingface.co/utkucoban/BadgeImageGen/blob/main/BUILD.md
- Instrucciones de copia de seguridad: https://huggingface.co/utkucoban/BadgeImageGen/blob/main/BACKUP.md
- Aviso de terceros: https://huggingface.co/utkucoban/BadgeImageGen/blob/main/NOTICE.md
- Licencia MIT: https://huggingface.co/utkucoban/BadgeImageGen/blob/main/LICENSE
- Layout de flasheo y versiones: https://huggingface.co/utkucoban/BadgeImageGen/blob/main/release.json
- Hashes de los archivos: https://huggingface.co/utkucoban/BadgeImageGen/blob/main/SHA256SUMS
- Dataset Oxford Flowers102 (mirror): https://huggingface.co/datasets/pufanyi/flowers102
- Herramienta de flasheo en navegador: https://espressif.github.io/esptool-js/
