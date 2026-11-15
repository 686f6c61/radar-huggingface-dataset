# Xylolabs/Wan2.2-UMT5-Tenstorrent-Tensix-Components

## Resumen

Wan2.2-UMT5-Tenstorrent-Tensix-Components es un archivo de operandos (tensores de pesos) extraidos del codificador de texto UMT5 del modelo Wan2.2 TI2V-5B, preparado por Xylolabs para su uso en hardware Tenstorrent Tensix. No es un modelo ejecutable de extremo a extremo: es un paquete de componentes que contiene 304 operandos listos para cargar, con 24 bloques de codificador, la normalizacion final y 63 fragmentos de la tabla de embeddings compartida. El codigo de carga se proporciona como lector en streaming en PyTorch.

El objetivo es portar el codificador UMT5 del pipeline de generacion de video Wan2.2 (texto-a-video e imagen-a-video) al acelerador Tensix de Tenstorrent. Xylolabs preserva los tensores con sus layouts logicos NK, dtypes originales (BF16 para matrices, FP32 para normas) y checksums, de modo que un adaptador de arquitectura externo pueda reconstruir el codificador. El paquete pesa 11,4 GB y requiere unos 11,39 GB de memoria de dispositivo solo para los pesos, mas buffers de trabajo.

Es relevante ahora porque el ecosistema Tenstorrent necesita artefactos de pesos portables y verificables para integrar modelos generativos de video en sus aceleradores. Este repositorio facilita esa integracion al separar los pesos del codificador del resto del pipeline (DiT, VAE), permitiendo cargas parciales y en streaming. No incluye entrenamiento, calibracion ni cuantizacion nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto UMT5 (transformer) extraido de Wan2.2 TI2V-5B |
| Parametros totales | no disponible (11.362.269.176 bytes de tensores portables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (BF16 y FP32 nativos, sin cuantizacion publicada) |
| Idiomas soportados | multilingue (heredado de UMT5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (255 archivos BF16 + 49 archivos FP32 de normas) |

## Arquitectura y entrenamiento

El paquete contiene los operandos de un codificador UMT5: 24 bloques de codificador, una normalizacion final y la tabla de embeddings compartida dividida en 63 fragmentos ordenados que cubren las 256.384 filas. Las matrices conservan el layout logico NK y las normas mantienen sus dimensiones singleton declaradas y representacion FP32. No se ha realizado entrenamiento, calibracion ni cuantizacion para esta publicacion; los valores son bit-exactos respecto a los pesos del codificador Wan fijados como referencia.

El repositorio incluye `component.json`, que documenta formas, dtypes, checksums, claves de origen y rangos de embeddings, y un lector en streaming (`load_components.py`) que verifica hash, nombres de tensores, forma, dtype almacenado y finitud de valores. La carga requiere que un adaptador de arquitectura externo concatene los fragmentos de embeddings en orden de filas, respete la convencion NK con transposicion del operando derecho y aporte el tokenizador y la arquitectura del codificador. El DiT, el VAE y el pipeline de video completo estan omitidos.

## Capacidades

- Codificacion de texto multilingue mediante UMT5, como componente del pipeline Wan2.2 TI2V.
- Carga parcial y en streaming de fragmentos de embeddings y componentes individuales.
- Verificacion de integridad por checksum, forma, dtype y finitud de valores.
- Preservacion bit-exacta de los pesos originales del codificador Wan.
- No incluye generacion de video, difusion, VAE ni tokenizador: requiere un adaptador de arquitectura.
- No soporta tool calling, agentes ni razonamiento multi-paso por si mismo; es un artefacto de pesos.

## Casos de uso

- Portado del codificador de texto de Wan2.2 a aceleradores Tenstorrent Tensix: se cargan los operandos con el lector en streaming y un adaptador implementa la arquitectura UMT5 para ejecutar la codificacion de prompts en el dispositivo.
- Integracion en pipelines de generacion de video texto-a-video e imagen-a-video: el codificador procesa las descripciones textuales y entrega embeddings al DiT, que se ejecuta por separado.
- Investigacion sobre eficiencia de memoria en aceleradores: los 11,39 GB de pesos y la carga por fragmentos permiten estudiar estrategias de streaming y gestion de buffers en Tensix.
- Verificacion de integridad de pesos en produccion: los checksums y el validador del cargador permiten auditar que los tensores cargados coinciden con la referencia publicada.
- Desarrollo de adaptadores de arquitectura: el `component.json` con formas, layouts y rangos de embeddings sirve como especificacion para implementar el codificador en nuevos backends.
- Benchmarking de codificadores de texto en hardware no GPU: permite medir latencia y throughput del codificador UMT5 en Tensix frente a ejecuciones en GPU, aunque el repositorio no publica cifras de velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las comprobaciones en CPU cualifican la preservacion del archivo de operandos, pero no establecen la precision del codificador nativo ni del pipeline de video, y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 11,39 GB solo para los pesos, mas buffers de trabajo.
- Hardware objetivo: aceleradores Tenstorrent Tensix.
- GPU: no aplica como destino principal; el paquete esta pensado para Tensix, aunque los tensores son safetensors legibles en CPU/GPU con PyTorch.
- Cabe en GPU consumer solo parcialmente: la carga completa de 11,4 GB en BF16/FP32 requiere al menos 12 GB de VRAM; la carga por fragmentos permite procesar porciones.
- Despliegue: lector en streaming propio (`load_components.py`) con PyTorch, safetensors y huggingface_hub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-UMT5-Tenstorrent-Tensix-Components | Operandos de codificador UMT5 para Tensix | no disponible (11,4 GB) | no disponible | Apache 2.0 | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers | Pipeline completo texto/imagen-a-video | no disponible | no disponible | Apache 2.0 | Hugging Face |
| google/umt5-xxl | Codificador de texto UMT5 completo | no disponible | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo ejecutable: cargar los operandos no ejecuta un codificador ni genera un clip; requiere adaptador de arquitectura y tokenizador.
- El DiT, el VAE y el pipeline de video completo estan omitidos del repositorio.
- Las comprobaciones publicadas validan la preservacion de los tensores, no la precision del codificador integrado ni del pipeline de video.
- No se reportan datos de velocidad, latencia ni throughput.
- El uso comercial esta permitido por Apache 2.0, pero se debe conservar la atribucion a Wan y a Google UMT5 segun LICENSE, NOTICE y UPSTREAM_LICENSE_NOTE.txt.
- Se entrega tal cual, sin garantia ni respaldo de los autores originales.
- Riesgo de sesgos y alucinaciones heredado del codificador UMT5 y de los datos de entrenamiento originales, no evaluado en este paquete.
- La cobertura idiomatica es multilingue segun la etiqueta, pero no se detallan idiomas concretos ni calidad por idioma.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Wan2.2-UMT5-Tenstorrent-Tensix-Components
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- UMT5 original: https://huggingface.co/google/umt5-xxl
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Repositorio de codigo Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Cargador en streaming: https://huggingface.co/Xylolabs/Wan2.2-UMT5-Tenstorrent-Tensix-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/Wan2.2-UMT5-Tenstorrent-Tensix-Components/blob/main/LICENSE
