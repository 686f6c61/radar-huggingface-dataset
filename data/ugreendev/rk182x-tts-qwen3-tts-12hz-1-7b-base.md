# UGREENDEV/RK182X-TTS-Qwen3-TTS-12Hz-1.7B-Base

## Resumen

RK182X-TTS-Qwen3-TTS-12Hz-1.7B-Base es una conversión al formato RKNN del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-Base, publicada por UGREENDEV. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización y empaquetado del modelo base de Qwen para su ejecución sobre las NPU de los SoC Rockchip RK1820 y RK1828, empleando el runtime RKNN v1.1.0. El repositorio ocupa 2,0 GB e incluye una única configuración de cuantización denominada `Qwen3-TTS-12Hz-1.7B-Base-w4a16-8`.

El modelo resuelve el problema de desplegar un sistema TTS de 1.700 millones de parámetros en hardware de borde basado en Rockchip, algo que el modelo original en PyTorch no permite de forma directa. La conversión aplica cuantización de pesos a 4 bits con activaciones a 16 bits (w4a16) sobre los cuatro componentes del pipeline: Talker, Code Predictor, Speech Decoder y Text Projector, distribuyendo la carga entre 8 núcleos NPU para los tres primeros y 1 núcleo para el último.

Es relevante para desarrolladores que trabajan en dispositivos embebidos, electrónica de consumo o sistemas de voz locales que necesitan inferencia TTS sin GPU dedicada ni conectividad a la nube. La licencia del modelo base es Apache 2.0, aunque el uso queda sujeto además a los términos de licencia del RKNN Toolkit y del RKNN Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3-TTS-12Hz-1.7B-Base; pipeline TTS con componentes Talker, Code Predictor, Speech Decoder y Text Projector) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre del modelo base) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) en Talker, Code Predictor, Speech Decoder y Text Projector |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (modelo base); se aplican ademas los terminos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0) |
| Tamano del repositorio | 2,0 GB |
| Chips soportados | RK1820, RK1828 |
| Nucleos NPU | Talker: 8; Code Predictor: 8; Speech Decoder: 8; Text Projector: 1 |
| Version de runtime RKNN | v1.1.0 |
| Modelo base | Qwen/Qwen3-TTS-12Hz-1.7B-Base |
| Relacion con el base | Quantized |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. El modelo es una conversión del checkpoint Qwen/Qwen3-TTS-12Hz-1.7B-Base, por lo que hereda la arquitectura y el entrenamiento del modelo original de Qwen, pero la model card de este repositorio no detalla ni la composicion del dataset, ni el numero de tokens, ni si hubo etapas de RLHF o DPO. El sufijo "12Hz" del nombre del modelo base sugiere una tasa de generacion de tokens de audio de 12 Hz, pero no se aporta confirmacion tecnica en la informacion disponible.

La innovacion tecnica destacable de este repositorio es el proceso de conversion y cuantizacion a RKNN. El pipeline se descompone en cuatro submodelos (Talker, Code Predictor, Speech Decoder y Text Projector), cada uno cuantizado a w4a16 y mapeado a un numero especifico de nucleos NPU. Esta particion permite ejecutar el conjunto en los SoC RK1820 y RK1828 con el runtime RKNN v1.1.0. El repositorio incluye sumas de verificacion SHA-256 (`SHA256SUMS`) para validar la integridad de los ficheros antes del despliegue, y ofrece instrucciones de descarga tanto desde Hugging Face como desde ModelScope.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio.
- Pipeline TTS completo empaquetado en cuatro submodelos RKNN independientes (Talker, Code Predictor, Speech Decoder, Text Projector).
- Ejecucion sobre NPU de Rockchip RK1820 y RK1828 con runtime RKNN v1.1.0.
- Cuantizacion w4a16 para reducir huella de memoria y permitir el despliegue en hardware de borde.
- Verificacion de integridad mediante checksums SHA-256 incluidos en el repositorio.
- Soporte de descarga y distribucion via Hugging Face y ModelScope.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada, modo thinking ni capacidades multilingues explicitas.

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo puede ejecutarse en SoC Rockchip RK1820/RK1828 sin GPU dedicada, lo que permite integrar sintesis de voz local en altavoces inteligentes, electrodomesticos o wearables sin depender de la nube.
- Lectura de notificaciones y textos en pantallas embebidas: adecuado para terminales de punto de venta, paneles informativos o dispositivos IoT que necesitan convertir texto dinamico en audio con baja latencia y sin conexion.
- Accesibilidad para personas con discapacidad visual: integracion en dispositivos portatiles con NPU Rockchip para leer en voz alta contenido de pantalla o documentos, manteniendo la privacidad al no enviar texto a servidores externos.
- Automocion y navegacion: sintesis de indicaciones de navegacion o avisos del vehiculo en tiempo real sobre hardware empotrado, aprovechando la cuantizacion w4a16 para reducir el consumo energetico.
- Kioscos interactivos y señalizacion digital: generacion de locuciones para paneles de informacion en aeropuertos, estaciones o museos, con actualizacion de contenido en el propio dispositivo.
- Pruebas de concepto y evaluacion de TTS en hardware Rockchip: util para equipos que quieran validar la calidad del modelo Qwen3-TTS en NPU antes de comprometerse con un despliegue en produccion, usando los checksums SHA-256 para garantizar la integridad de los ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, latencia, throughput) ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- Hardware de destino: SoC Rockchip RK1820 y RK1828 con NPU integrada. No se contempla ejecucion en GPU convencional ni en CPU generica con este formato.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente. Es necesario verificar la version en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Memoria: el repositorio ocupa 2,0 GB; la huella en inferencia es menor gracias a la cuantizacion w4a16, pero no se especifica el consumo exacto de memoria en la documentacion.
- Uso de NPU: Talker, Code Predictor y Speech Decoder requieren 8 nucleos NPU cada uno; Text Projector requiere 1 nucleo.
- No cabe en GPU de consumo (RTX 4090, etc.) con este formato: el artefacto esta empaquetado exclusivamente para NPU Rockchip.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| RK182X-TTS-Qwen3-TTS-12Hz-1.7B-Base | 1,7B | No disponible | RKNN (w4a16) | NPU Rockchip RK1820/RK1828 | Apache 2.0 |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7B | No disponible | Pesos originales (no especificado) | GPU/CPU convencional | Apache 2.0 (segun modelo base) |
| Otros TTS de ~1-2B en formato GGUF/ONNX | No disponible | No disponible | GGUF/ONNX | CPU/GPU de consumo | Variable |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas TTS equivalentes en la informacion proporcionada. La diferencia principal frente al modelo base es el formato de despliegue: este repositorio esta optimizado para NPU Rockchip, mientras que el original esta pensado para ejecucion en frameworks de aprendizaje profundo convencionales.

## Limitaciones y advertencias

- El modelo solo funciona en los SoC Rockchip RK1820 y RK1828 con RKNN Runtime v1.1.0; no es portable a otras plataformas sin reconversion.
- Es imprescindible usar conjuntamente todos los ficheros del directorio de configuracion seleccionado; mezclar ficheros de distintas configuraciones puede producir fallos.
- Se debe verificar la integridad con `sha256sum -c SHA256SUMS` y desplegar solo si todas las entradas muestran `OK`.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion o errores de pronunciacion.
- La licencia Apache 2.0 del modelo base se complementa con los terminos del RKNN Toolkit y del RKNN Runtime, que pueden imponer restricciones adicionales al uso comercial o a la redistribucion.
- Al ser una cuantizacion w4a16, es previsible una perdida de calidad respecto al modelo base en precision completa, aunque no se cuantifica en la documentacion.
- No se especifican requisitos de memoria en inferencia, latencia ni throughput, lo que dificulta la planificacion de capacidad en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-TTS-Qwen3-TTS-12Hz-1.7B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Documentacion de la configuracion (ingles): Qwen3-TTS-12Hz-1.7B-Base-w4a16-8/README.md (dentro del repositorio)
- Documentacion de la configuracion (chino): Qwen3-TTS-12Hz-1.7B-Base-w4a16-8/README_CN.md (dentro del repositorio)
- Descarga via ModelScope: `modelscope download --model UGREENDEV/RK182X-TTS-Qwen3-TTS-12Hz-1.7B-Base --revision master`
- Descarga via Hugging Face CLI: `hf download UGREENDEV/RK182X-TTS-Qwen3-TTS-12Hz-1.7B-Base --revision v1.1.0`
