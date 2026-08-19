# stephvax/cosyvoice3-onnx-slim

## Resumen

`stephvax/cosyvoice3-onnx-slim` no es un modelo de síntesis de voz completo, sino un componente auxiliar optimizado para el pipeline de CosyVoice3 en su versión ONNX. Concretamente, contiene la tabla de embeddings de texto del modelo base `ayousanz/cosy-voice3-onnx`, almacenada como un blob binario plano en precisión float16. Esta tabla, de forma `[151936, 896]`, corresponde al embedding de tokens de Qwen2, que CosyVoice3 utiliza como backbone de su módulo LLM.

El problema que resuelve es puramente de eficiencia de memoria. En el repositorio original, el gráfico ONNX `text_embedding_fp32.onnx` ocupa 519.3 MiB en disco y, al abrir una sesión con ONNX Runtime, consume aproximadamente 1751 MiB de memoria residente para realizar una operación de `Gather` que tarda unos 5 microsegundos por síntesis. ONNX Runtime mantiene varias copias de la tabla en distintas precisiones, lo que dispara el uso de RAM. Este repositorio extrae la tabla en float16 como un archivo plano, permitiendo que el host la lea directamente desde la caché de páginas del sistema operativo, reduciendo el incremento de footprint a unos 6 MiB por proceso.

La relevancia actual radica en que permite ejecutar CosyVoice3 en dispositivos con memoria limitada (móviles, edge) o en entornos donde se desea minimizar el uso de RAM por sesión, sin sacrificar calidad: la fidelidad medida es prácticamente idéntica a la versión float32, con un coseno mínimo por fila de 0.9999997.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla de embeddings (blob binario plano), extraída del backbone Qwen2 de CosyVoice3 |
| Parametros totales | 151936 × 896 = 136 134 656 valores (solo embeddings, no pesos de red) |
| Parametros activos | No aplica (no es un modelo MoE ni una red neuronal completa) |
| Longitud de contexto | No disponible (depende del modelo CosyVoice3 completo) |
| Tipos de cuantizacion | float16 (binario plano IEEE-754 little-endian) |
| Idiomas soportados | No disponible en este repositorio; CosyVoice3 base soporta 9 idiomas (chino, ingles, japones, coreano, aleman, español, frances, italiano, ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | Blob binario plano (`.bin`), sin gráfico ONNX ni metadatos |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una extracción y conversión de pesos. El archivo `text_embedding_fp16.bin` es la tabla de embeddings de tokens de texto de CosyVoice3, que utiliza como backbone un modelo tipo Qwen2 con una dimensión oculta de 896. En el repositorio original (`ayousanz/cosy-voice3-onnx`), esta tabla está integrada en un gráfico ONNX con un nodo `Gather` sobre `embed_tokens.weight` en float32. El autor de este repositorio ha convertido esa tabla a float16 y la ha escrito como un archivo plano, sin gráfico ni runtime, para que el host pueda acceder a ella directamente mediante lectura de archivos mapeados en memoria.

La conversión se realizó simplemente casteando el initializer float32 a float16. No hubo entrenamiento ni ajuste de pesos. La elección de float16 se justifica porque el rango dinámico de los valores de la tabla es muy reducido (todos los valores están entre -0.176 y 0.138), muy por debajo del techo de float16 (65504), y porque el resto de pesos del modelo CosyVoice3 ya se almacenan en float16, por lo que el error adicional introducido por esta conversión es despreciable en comparación con el error de cuantización que ya existe en las capas siguientes.

## Capacidades

- Proporciona la tabla de embeddings de tokens de texto para el modelo CosyVoice3 en formato float16, lista para ser leída directamente por el host.
- Permite realizar la operación de embedding de texto (aproximadamente 80 tokens por síntesis) sin necesidad de abrir un gráfico ONNX completo, evitando la sobrecarga de memoria de ONNX Runtime.
- Mantiene una fidelidad casi idéntica a la versión float32: error absoluto máximo de 5.9e-5, error medio de 2.5e-6 y coseno mínimo por fila de 0.9999997.
- Es compatible con el pipeline completo de CosyVoice3 (LLM, Flow, HiFT) cuando se integra en un proyecto que lo consuma, como el descrito en el script `tools/cosyvoice3_text_embedding/build_variants.py`.
- No es un modelo autónomo: no puede generar voz ni texto por sí mismo; debe usarse como componente de un sistema TTS más amplio.

## Casos de uso

- Despliegue de CosyVoice3 en dispositivos con memoria RAM limitada: al reducir el footprint de la tabla de embeddings de 1751 MiB a ~6 MiB, es viable ejecutar el TTS en smartphones, Raspberry Pi o sistemas embebidos.
- Servicios de síntesis de voz multi-tenant: en un servidor que aloja múltiples sesiones de inferencia, cada sesión consume mucho menos memoria, permitiendo mayor concurrencia por GPU o CPU.
- Aplicaciones de clonación de voz en tiempo real: la lectura directa del blob desde la caché de páginas reduce la latencia de inicialización (no hay que cargar un gráfico ONNX de 519 MiB), lo que acelera el arranque de la aplicación.
- Integración en pipelines de TTS con frameworks ligeros: al no depender de ONNX Runtime para esta parte, se puede usar solo numpy y lectura de archivos, simplificando el stack de dependencias.
- Investigación y experimentación con CosyVoice3: los desarrolladores pueden inspeccionar y modificar la tabla de embeddings directamente sin pasar por el optimizador de gráficos de ONNX.
- Reducción de costes en despliegues serverless: al minimizar la memoria residente por invocación, se reducen los costes de facturación en plataformas que cobran por uso de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de síntesis (MOS, etc.) en la informacion disponible. Sin embargo, el autor proporciona mediciones objetivas de fidelidad y eficiencia comparando la tabla original float32 con las variantes float16, int8 y el blob plano:

| Forma | Disco | Carga | Incremento de footprint | Por síntesis | Coseno mínimo |
|---|---:|---:|---:|---:|---:|
| fp32 ONNX (upstream) | 519.3 MiB | 196 ms | 1751 MiB | 0.005 ms | — |
| fp16 ONNX + `Cast` | 259.7 MiB | 88 ms | 851 MiB | 0.023 ms | 0.99999982 |
| int8 ONNX + escala por fila | 130.4 MiB | 42 ms | 405 MiB | 0.020 ms | 0.99991089 |
| **Blob fp16 plano (este repo)** | 259.7 MiB | — | ~6 MiB | 1.0 ms | 0.99999997 |

El blob plano ofrece la mejor fidelidad de las tres variantes cuantizadas porque evita el paso por el optimizador de gráficos de ONNX. El coste por síntesis es de 1.0 ms (frente a 0.005 ms del gráfico original), pero este tiempo es despreciable en el contexto de una síntesis de voz completa, que suele durar varios segundos.

## Requisitos de hardware

- VRAM/ RAM: el blob en sí ocupa 259.7 MiB en disco y ~6 MiB de memoria residente adicional cuando se lee desde la caché de páginas. No requiere VRAM dedicada.
- GPU recomendadas: no aplica directamente; el resto del pipeline de CosyVoice3 (LLM, Flow, HiFT) sí puede requerir GPU, pero este componente es agnóstico al hardware.
- Compatibilidad con GPU de consumo: sí, cualquier dispositivo con sistema de archivos y memoria virtual es suficiente para este componente.
- Opciones de despliegue: lectura directa del archivo binario con `numpy` o `mmap`; no requiere ONNX Runtime, llama.cpp ni vLLM. El pipeline completo de CosyVoice3 puede desplegarse con ONNX Runtime, pero esta tabla se puede gestionar externamente.
- Latencia y throughput: la operación de embedding de 80 tokens tarda aproximadamente 1.0 ms por síntesis, lo que es despreciable frente al coste total del TTS.

## Comparativa con modelos similares

No existen modelos comparables en el sentido de que este repositorio no es un modelo de lenguaje ni de síntesis, sino un componente de optimización. Se puede comparar con las variantes del mismo componente en el repositorio original:

| Variante | Formato | Tamaño en disco | Footprint en RAM | Fidelidad (coseno min) |
|---|---|---|---|---|
| `text_embedding_fp32.onnx` (upstream) | ONNX float32 | 519.3 MiB | 1751 MiB | 1.0 (referencia) |
| `text_embedding_fp16.onnx` (variante hipotética) | ONNX float16 + Cast | 259.7 MiB | 851 MiB | 0.99999982 |
| `text_embedding_fp16.bin` (este repo) | Blob plano float16 | 259.7 MiB | ~6 MiB | 0.99999997 |

La ventaja principal del blob plano es la reducción drástica de memoria residente, manteniendo una fidelidad prácticamente idéntica a la referencia float32.

## Limitaciones y advertencias

- Este repositorio contiene únicamente la tabla de embeddings de texto; no incluye el resto de componentes de CosyVoice3 (LLM, flujo de normalización, HiFT, etc.). Para una síntesis completa es necesario descargar el modelo base `ayousanz/cosy-voice3-onnx` o el proyecto que lo consuma.
- El archivo es un blob binario sin metadatos ni estructura; el desarrollador debe conocer el formato exacto (shape `[151936, 896]`, dtype float16, layout row-major) para leerlo correctamente.
- No se proporcionan herramientas de conversión ni scripts de integración en este repositorio; el autor menciona que el script de conversión está en `tools/cosyvoice3_text_embedding/build_variants.py` de un proyecto externo, no incluido aquí.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base CosyVoice3 (también Apache-2.0 según el repositorio original).
- No hay garantía de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto personal sin comunidad activa.
- Al ser una extracción de pesos, no se puede entrenar ni ajustar con este archivo; cualquier modificación del embedding requeriría rehacer la conversión desde el modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/stephvax/cosyvoice3-onnx-slim
- Modelo base (ONNX): https://huggingface.co/ayousanz/cosy-voice3-onnx
- Repositorio GitHub del proyecto base: https://github.com/AINightCoder/cosyvoice3-onnx
- Guía técnica de CosyVoice 3.0: https://stable-learn.com/en/cosyvoice3-tech-guide/
