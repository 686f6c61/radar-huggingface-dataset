# Xylolabs/tensix-kernels

## Resumen

`Xylolabs/tensix-kernels` no es un modelo de lenguaje, sino un repositorio de kernels de dispositivo para inferencia de LLM sobre NPUs Tenstorrent Tensix, escritos contra tt-metal / ttnn y lanzados desde Python mediante `ttnn.generic_op`. El repositorio lo publica Xylolabs bajo licencia Apache 2.0 y agrupa implementaciones de bajo nivel para las fases de decodificación (y, en el caso de las capas recurrentes, también prefill) de modelos transformer y de arquitecturas híbridas.

El objetivo es acelerar las partes de la decodificación limitadas por el ancho de banda de lectura de pesos desde DRAM: cada peso se lee una sola vez, en peticiones contiguas grandes, por los núcleos situados junto a su banco de DRAM, con la etapa de salida fusionada. Incluye paquetes para matmul de pesos cuantizados, LM head con top-k, capa de mezcla de expertos, matmul int4 y ternario, y las capas de atención lineal de modelos híbridos (Gated DeltaNet, Kimi Delta Attention, Mamba-2).

Es relevante para quienes despliegan LLM en hardware Tenstorrent (Blackhole, arquitectura `blackhole_140_arch`) y necesitan kernels de decodificación optimizados sin reconstruir ni parchear tt-metal. El repositorio está pensado para tt-metal / ttnn 0.81.1 y permite ejecutar pruebas sin tarjeta física mediante el simulador ttsim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels de dispositivo para NPU Tenstorrent Tensix (no es un modelo); cubre matmul de decodificacion, LM head, MoE, int4, ternario y capas de atencion lineal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `bfloat16`, `bfloat8_b`, `bfloat4_b`, int4 con escala por 32 entradas, ternario (BFP2_b) con escalas de grupo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los kernels operan sobre pesos ya shardeados en DRAM; no se distribuyen pesos) |

## Arquitectura y entrenamiento

El repositorio contiene kernels de cómputo y movimiento de datos para la NPU Tensix, no un modelo entrenado. La estrategia central es el *weight streaming*: los pesos se almacenan en DRAM con sharding por ancho y se leen una vez por los núcleos adyacentes a su banco, con loaders divididos en ambos RISC de movimiento de datos y etapas de salida fusionadas (escalas por columna, SwiGLU/GeGLU, suma residual, salida fp32). El paquete `dense_reader/` implementa este matmul de decodificación con soporte de listas de bloques para recorrer varios pesos shardeados en una sola llamada, y `lm_head_topk/` reutiliza sus registros top-k sobre bloques de vocabulario con un rescore exacto en bf16.

El paquete `moe/` implementa una capa de mezcla de expertos que lee únicamente los expertos seleccionados, con routing en dispositivo (softmax o sigmoide, top-k), gate/up y down para uno o hasta 32 tokens (cada experto de la unión se lee una vez) y empaquetado de expertos en `bfloat4_b`. `gated_delta/` añade las capas recurrentes de modelos híbridos (Gated DeltaNet, Kimi Delta Attention y actualización de estado Mamba-2), con prefill por chunks, paso recurrente de 1 a 32 filas por llamada con slots de estado para verificación especulativa, convolución causal con estado rodante y un mixer Mamba-2 completo. Los kernels se compilan con el JIT de tt-metal en la primera llamada y requieren ttnn 0.81.1, que usa la API de cómputo de tt-metal v0.81 (`compute_kernel_hw_startup`, `matmul_block_init`).

## Capacidades

- Matmul de decodificación con pesos en `bfloat16`, `bfloat8_b` y `bfloat4_b` shardeados por ancho en DRAM.
- Etapas de salida fusionadas: escalas por columna, SwiGLU, GeGLU, suma residual y salida en fp32.
- LM head que devuelve ids de token: registros top-k por bloques de vocabulario, rescore exacto en bf16 en host o dispositivo y selección solo de registros para cabezas draft.
- Capa de mezcla de expertos con routing en dispositivo (softmax o sigmoide, top-k) y lectura selectiva de expertos.
- Matmul con pesos int4 y escala por cada 32 entradas, con dequantización a `bfloat8_b` para múltiples filas.
- Matmul con pesos ternarios (tiles BFP2_b) con escalas de grupo y rotación de Hadamard por bloques opcional.
- Capas de atención lineal para modelos híbridos: regla gated delta, Kimi Delta Attention y actualización de estado Mamba-2.
- Prefill por chunks y paso recurrente de 1 a 32 filas por llamada con slots de estado para verificación especulativa.
- Convolución causal con estado rodante y mixer Mamba-2 completo.
- Ejecución sobre tarjeta Tenstorrent o sobre el simulador ttsim (v1.15.1 probado; v1.16.0 en las pruebas de puesta en marcha).

## Casos de uso

- Despliegue de decodificación de LLM en NPUs Tenstorrent: el paquete `dense_reader/` sustituye el matmul de decodificación limitado por ancho de banda de DRAM por una implementación que lee cada peso una sola vez con loaders divididos, adecuada para servir modelos densos en Blackhole.
- Servicio de modelos con mezcla de expertos: `moe/` enruta en dispositivo y lee solo los expertos elegidos, lo que reduce el tráfico de DRAM en modelos MoE con muchos expertos y pocos activos por token.
- Generación con cabezas draft y decodificación especulativa: `lm_head_topk/` ofrece una selección solo de registros para cabezas draft y `gated_delta/` mantiene slots de estado para verificar varios tokens candidatos en una sola llamada.
- Inferencia de modelos híbridos (Gated DeltaNet, Kimi Delta Attention, Mamba-2): `gated_delta/` implementa prefill por chunks y paso recurrente de 1 a 32 filas, lo que permite servir estas arquitecturas en Tensix sin kernels propietarios.
- Cuantización agresiva en producción: los kernels int4 (escala por 32 entradas) y ternario (BFP2_b con escalas de grupo y Hadamard fusionada) permiten reducir la huella de pesos en DRAM manteniendo el matmul en dispositivo.
- Evaluación y desarrollo sin hardware: con ttsim y `scripts/setup_ttsim.sh` se pueden ejecutar todos los tests y ejemplos (`scripts/run_checks.sh`) en Linux x86_64 con glibc 2.34 o superior, útil para integración continua.
- Integración en pipelines propios: al lanzarse desde Python mediante `ttnn.generic_op` y no requerir parchear tt-metal, los kernels se pueden incorporar en un runtime de inferencia existente sobre ttnn 0.81.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU Tenstorrent Tensix (el descriptor de SoC incluido en la documentación es `blackhole_140_arch.yaml`); no se especifican otros modelos de tarjeta.
- Alternativa sin tarjeta: simulador ttsim v1.15.1 (probado también con v1.16.0), con `TT_METAL_SIMULATOR` y `TT_METAL_SLOW_DISPATCH_MODE=1`.
- Entorno: Python 3.10 o 3.12, `torch`, `ttnn==0.81.1` (ruedas para Linux x86_64 con glibc 2.34 o superior) y SFPI 7.89.0, que debe desempaquetarse manualmente en el directorio `runtime` de ttnn porque `python -m ttnn.download_sfpi` no funciona en 0.81.1.
- VRAM: no disponible (no aplica; los kernels operan sobre DRAM de la NPU).
- GPU recomendadas: no disponible (no aplica).
- Opciones de despliegue: llamada directa desde Python con `ttnn.generic_op` sobre tt-metal / ttnn; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye repositorios de kernels comparables para Tensix ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí mismo ni incluye pesos; es una biblioteca de kernels que debe integrarse en un runtime de inferencia.
- Dependencia estricta de ttnn 0.81.1 y de la API de cómputo de tt-metal v0.81; versiones anteriores nombran de otra forma `compute_kernel_hw_startup` y `matmul_block_init`.
- El soporte está probado sobre el descriptor Blackhole (`blackhole_140_arch`); no se documenta compatibilidad con otras arquitecturas Tensix.
- La instalación en simulador requiere pasos manuales (descarga de `libttsim_bh.so`, `soc_descriptor.yaml` junto a la biblioteca para tt-metal anterior a v0.83 y desempaquetado manual de SFPI 7.89.0).
- El repositorio registra 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin pipeline declarado ni idiomas especificados.
- No se han publicado benchmarks, latencias ni cifras de throughput, por lo que el rendimiento en producción debe medirse directamente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y el aviso de licencia incluido en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Xylolabs/tensix-kernels
- README de `dense_reader/`: https://huggingface.co/Xylolabs/tensix-kernels/blob/main/dense_reader/README.md
- README de `lm_head_topk/`: https://huggingface.co/Xylolabs/tensix-kernels/blob/main/lm_head_topk/README.md
- README de `moe/`: https://huggingface.co/Xylolabs/tensix-kernels/blob/main/moe/README.md
- README de `int4/`: https://huggingface.co/Xylolabs/tensix-kernels/blob/main/int4/README.md
- README de `ternary_matmul/`: https://huggingface.co/Xylolabs/tensix-kernels/blob/main/ternary_matmul/README.md
- README de `gated_delta/`: https://huggingface.co/Xylolabs/tensix-kernels/blob/main/gated_delta/README.md
- Guía de ejecución: https://huggingface.co/Xylolabs/tensix-kernels/blob/main/RUNNING.md
- Licencia: https://huggingface.co/Xylolabs/tensix-kernels/blob/main/LICENSE
- tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/releases/tag/v0.81.1
- Simulador ttsim: https://github.com/tenstorrent/ttsim
- Organización Xylolabs en Hugging Face: https://huggingface.co/Xylolabs
- Repositorio tensix-bfp-gptq (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
