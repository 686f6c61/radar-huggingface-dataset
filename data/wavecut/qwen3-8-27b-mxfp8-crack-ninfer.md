# WaveCut/Qwen3.8-27B-MXFP8-CRACK-NInfer

## Resumen

El repositorio `WaveCut/Qwen3.8-27B-MXFP8-CRACK-NInfer` no es un modelo independiente, sino un artefacto de inferencia en un único archivo (`.ninfer`) que permite ejecutar el fine-tune comunitario `dealignai/Qwen3.8-27B-MXFP8-CRACK` sobre el motor NInfer, un motor de inferencia C++/CUDA de una sola GPU desarrollado por Neroued y especializado para la RTX 5090. El modelo base es `Qwen/Qwen3.8-27B`, un LLM multimodal denso de 27 000 millones de parámetros publicado por el equipo Qwen de Alibaba, con entrada de imagen y texto, y licencia Apache-2.0.

La relevancia de este artefacto radica en que permite ejecutar un modelo de 27B con cuantización mixta en una única RTX 5090 (32 GB), gracias a la doble cuantización aplicada: el checkpoint original ya viene en MXFP8 y MLX affine int8, y NInfer lo re-cuantiza en su perfil `groupwise-int` (Q4/Q5/Q6/W8 + BF16). Esto introduce una pérdida de fidelidad adicional, pero hace viable la ejecución local de un modelo multimodal de 27B en hardware de consumo.

El artefacto incluye los tensores del modelo (1118 tensores), los recursos frontales oficiales (tokenizer, plantilla de chat, configuraciones de preprocesado) y el informe de conversión. La licencia es Apache-2.0, igual que la de ambos modelos ascendentes. No se han publicado resultados de benchmarks específicos para este artefacto cuantizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dense multimodal LLM (Qwen3.8-27B) con visión y texto |
| Parámetros totales | 27B (27 mil millones, según el nombre del modelo) |
| Parámetros activos | No aplica (dense, no MoE) |
| Longitud de contexto | 262 144 tokens (según el modelo base Qwen3.8-27B) |
| Tipos de cuantización | MXFP8 (4×FP8-E4M3 empaquetado + escala UE8M0) y MLX affine int8 (códigos uint8 con escala/bias F16) en el checkpoint fuente; re-cuantizado a perfil NInfer groupwise-int (Q4/Q5/Q6/W8 + BF16) |
| Idiomas soportados | No disponible (no se especifica en la información proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefacto `.ninfer` (18 210 531 328 bytes), que contiene tensores en el perfil groupwise-int de NInfer; el checkpoint fuente usa safetensors con MXFP8 y MLX affine int8 |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un LLM multimodal denso desarrollado por el equipo Qwen de Alibaba. Es la primera generación de modelos Qwen con arquitectura nativa multimodal, capaz de procesar entradas de imagen y texto. El repositorio oficial indica que está optimizado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Según la guía web, el modelo alcanza puntuaciones de 42.2 en DeepSWE, 73.0 en Terminal Bench y 84.3 en OSWorld, y soporta contexto de 262 144 tokens, con pesos bajo licencia Apache-2.0.

El fine-tune `dealignai/Qwen3.8-27B-MXFP8-CRACK` parte de este modelo base y lo ajusta con pesos cuantizados en dos esquemas: 582 tensores de texto y visión en MXFP8 (FP8-E4M3 empaquetado con escala UE8M0 por grupo de 32 elementos) y 8 tensores de la capa de draft del MTP (multi-token prediction) en MLX affine int8 (códigos uint8 con escala y bias F16 por grupo de 128). El artefacto NInfer primero des-cuantiza estos pesos a BF16, renombra los tensores al diseño oficial de Qwen3.8-27B y luego aplica el conversor estándar de NInfer para generar el perfil dequantizado groupwise-int. El proceso de conversión completo tarda 82 segundos en una RTX PRO 4500.

## Capacidades

- Generación de texto y razonamiento de largo alcance con contexto de hasta 262 144 tokens (según el modelo base).
- Comprensión de imágenes (entrada multimodal image-text-to-text), aunque el artefacto no detalla capacidades de vídeo.
- Codificación y asistencia en tareas de programación, según las capacidades del modelo base.
- Soporte para flujos de trabajo agénticos y automatización de oficina, según la documentación del modelo base.
- Inferencia en una única RTX 5090 de 32 GB mediante el motor NInfer, con modo CLI y servidor compatible con OpenAI/Anthropic.
- El motor NInfer soporta dos perfiles de pesos para Qwen3.8-27B, y este artefacto se registra en el perfil `qwen3.8-27b / groupwise-int`.

## Casos de uso

- **Despliegue local de un modelo multimodal de 27B en hardware de consumo**: el artefacto permite ejecutar Qwen3.8-27B en una sola RTX 5090 de 32 GB, algo que no sería viable con los pesos BF16 completos, gracias a la cuantización groupwise-int. Es útil para desarrolladores que necesitan un modelo de alto rendimiento en un equipo personal.
- **Servidor compatible con OpenAI/Anthropic para aplicaciones de producción**: el comando `ninfer-serve` levanta un servidor compatible con las API de OpenAI y Anthropic, lo que permite integrar el modelo en pipelines existentes de aplicaciones empresariales sin cambios de código.
- **Automatización de oficina y tareas agénticas**: el modelo base está optimizado para flujos de trabajo agénticos y automatización de oficina, por lo que este artefacto puede usarse en sistemas de gestión de documentos, extracción de datos de imágenes y orquestación de tareas multi-paso.
- **Generación de código asistida**: el modelo base destaca en codificación, y el artefacto puede ejecutarse en un entorno local para tareas de generación, revisión y refactorización de código, con la ventaja de no depender de servicios en la nube.
- **Prototipado de aplicaciones multimodales**: dado que el modelo acepta entrada de imagen y texto, el artefacto es adecuado para prototipar aplicaciones de visión por computadora y lenguaje natural, como descripción de imágenes, OCR avanzado o QA visual, en un entorno local.
- **Investigación y experimentación con cuantización**: el artefacto documenta un proceso de doble cuantización (MXFP8 → BF16 → groupwise-int) que puede ser útil para investigadores que estudian la pérdida de fidelidad en modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el artefacto `WaveCut/Qwen3.8-27B-MXFP8-CRACK-NInfer` en la información disponible. Los benchmarks del modelo base `Qwen3.8-27B` (DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3) provienen de una guía web y no se confirma si corresponden al modelo cuantizado o al BF16 original. La doble cuantización del artefacto probablemente degrada ligeramente el rendimiento respecto al modelo base, pero no hay datos cuantitativos disponibles.

## Requisitos de hardware

- **GPU**: una única RTX 5090 de 32 GB VRAM es el requisito oficial del motor NInfer. El artefacto está especializado para esta GPU y un único dispositivo CUDA.
- **VRAM estimada**: el archivo del artefacto ocupa 18.2 GB, por lo que la VRAM necesaria para la carga es de al menos ese tamaño, más memoria adicional para el KV cache y los buffers de inferencia. Con los 32 GB de la RTX 5090 hay margen para un contexto de hasta 16 384 tokens por defecto (configurable con `--max-context`).
- **GPU compatibles**: solo la RTX 5090. El motor NInfer no soporta otras GPUs, según la documentación.
- **Opciones de despliegue**: el motor NInfer ofrece dos modos: CLI de una sola petición (`ninfer`) y servidor compatible con OpenAI/Anthropic (`ninfer-serve`). Se puede descargar el artefacto con `hf download`.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de latencia o throughput para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `WaveCut/Qwen3.8-27B-MXFP8-CRACK-NInfer` (este artefacto) | 27B | 262 144 (base) | Multimodal denso, cuantizado para NInfer | Apache-2.0 | Artefacto `.ninfer` (requiere motor NInfer y RTX 5090) |
| `dealignai/Qwen3.8-27B-MXFP8-CRACK` | 27B | 262 144 | Multimodal denso, MXFP8/MLX affine | Apache-2.0 | Pesos en safetensors (cuantizados) |
| `Qwen/Qwen3.8-27B` | 27B | 262 144 | Multimodal denso, BF16 | Apache-2.0 | Pesos oficiales en safetensors |
| `Qwen/Qwen3.6-27B` | 27B | 262 144 | Multimodal denso | Apache-2.0 | Pesos oficiales |

La comparativa se basa en la información disponible: el artefacto es una conversión del fine-tune para el motor NInfer, con el mismo tamaño y contexto que el modelo base, pero con una doble cuantización que puede reducir la fidelidad. No hay datos de benchmarks para comparar directamente.

## Limitaciones y advertencias

- **Doble cuantización**: el checkpoint fuente ya está cuantizado (MXFP8 y MLX affine int8), y el artefacto lo re-cuantiza al perfil groupwise-int de NInfer. Esto introduce una pérdida de fidelidad adicional respecto a un artefacto construido desde un checkpoint BF16 nativo.
- **Dependencia del motor NInfer**: el artefacto solo funciona con el motor NInfer y únicamente en una RTX 5090 (32 GB). No es portable a otras GPUs ni a otros motores de inferencia.
- **Riesgo de alucinación y sesgos**: no se han documentado sesgos específicos para este artefacto, pero al ser un modelo de lenguaje multimodal, existe riesgo de alucinación en tareas de razonamiento y generación de contenido. Se recomienda validar la salida en aplicaciones de producción.
- **Parámetros del sampler**: según la card upstream, el comportamiento previsto del fine-tune requiere fijar el sampler explícitamente (`temperature=1.0, top_p=0.95, top_k=20`). Si no se hace, los valores por defecto del motor pueden alterar el comportamiento del modelo.
- **Idiomas**: no se ha especificado la lista de idiomas soportados, aunque el modelo base de Qwen suele soportar múltiples idiomas.
- **Licencia**: Apache-2.0, permite uso comercial, pero hay que revisar las restricciones de la licencia del modelo base y del fine-tune (ambas Apache-2.0, sin restricciones adicionales conocidas).

## Enlaces

- Repositorio del artefacto en Hugging Face: https://huggingface.co/WaveCut/Qwen3.8-27B-MXFP8-CRACK-NInfer
- Modelo base cuantizado: https://huggingface.co/dealignai/Qwen3.8-27B-MXFP8-CRACK
- Repositorio del modelo base oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Motor NInfer en GitHub: https://github.com/Neroued/ninfer
- Guía del modelo Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
- Información de OpenLM sobre Qwen3.8-Max: https://openlm.ai/qwen3.8/
