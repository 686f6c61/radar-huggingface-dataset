# windowsxp811203/Qwen3.8-Flash-Next-Abliterated-GGUF

## Resumen

Este repositorio es un placeholder creado por el usuario windowsxp811203 para alojar futuras versiones GGUF del modelo Qwen3.8-Flash-Next-Abliterated. Según la model card, el modelo base sería Qwen3.8-Flash-Next, un MoE de 125 mil millones de parámetros con 6 mil millones activos, basado en una vista previa de la arquitectura Qwen4. Sin embargo, a fecha de la consulta no se ha publicado ningún peso, ningún archivo de cuantización ni ninguna información técnica verificable.

El autor indica que el lanzamiento está previsto para el 26 de agosto de 2026 a las 23:00 (UTC+8) y que se publicarán builds GGUF de llama.cpp solo si se cumplen tres condiciones: revisión de licencia, verificación de arquitectura y soporte de la toolchain. En el momento de escribir esta ficha, ninguna de esas condiciones se ha confirmado, por lo que el repositorio no contiene ningún artefacto utilizable. Cualquier uso del modelo en producción es imposible hasta que se libere el modelo base y se complete el proceso de abliteración y cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (según el autor: MoE 125B-A6B, arquitectura Qwen4 preview, no Qwen3.5-dense) |
| Parametros totales | no disponible (el autor menciona 125B-A6B, pero no confirmado) |
| Parametros activos | no disponible (el autor menciona 6B activos, pero no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se esperan builds GGUF, sin especificar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se espera GGUF, pero no hay archivos) |

## Arquitectura y entrenamiento

No hay información oficial sobre la arquitectura, el entrenamiento o los datos utilizados. La model card del autor menciona que se trata de una arquitectura nueva, no la Qwen3.5-dense, y que requiere un mapeo de la cabecera MTP (multi-token prediction), de la atención lineal y de la ruta de embeddings n-gram de 51B antes de poder realizar una cuantización correcta o una ortogonalización. No se ha publicado ningún detalle sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se han publicado pesos intermedios ni documentación técnica del modelo base Qwen3.8-Flash-Next en este repositorio.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. El autor no ha publicado ningún benchmark, ejemplo de uso ni documentación de funcionalidades. Hasta que se libere el modelo base y las versiones abliteradas, no se puede afirmar que soporte generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o cualquier otra capacidad específica.

## Casos de uso

No se pueden recomendar casos de uso concretos porque el modelo no está disponible. El repositorio es un placeholder y no contiene pesos ni instrucciones de uso. Cualquier aplicación práctica debería esperar a la publicación oficial del modelo base y de las versiones GGUF abliteradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona ninguna métrica de rendimiento del modelo, ni comparaciones con otros modelos.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. No hay pesos, ni cuantizaciones, ni especificaciones de VRAM, GPU recomendadas, ni opciones de despliegue. Una vez que se publique el modelo, será necesario evaluar los requisitos según el tamaño y la cuantización elegida.

## Comparativa con modelos similares

No se puede realizar una comparativa con modelos similares porque no hay datos del modelo real. El autor menciona que el modelo base Qwen3.8-Flash-Next sería de 125B-A6B, pero no se conocen sus características exactas ni su rendimiento. No se puede comparar con Qwen3.8-27B ni con otros modelos abliterados del mismo autor (Qwen3.8-27B-Abliterated, Qwen3.8-27B-Abliterated-NVFP4) porque no hay datos públicos de estos últimos.

## Limitaciones y advertencias

- El repositorio es un placeholder: no contiene pesos, ni archivos de cuantización, ni ningún artefacto utilizable.
- La model card del autor advierte explícitamente que si el build no es posible o la licencia lo prohíbe, la página lo indicará en lugar de publicar algo roto.
- No se conoce la licencia del modelo base Qwen3.8-Flash-Next, por lo que no se puede garantizar que la abliteración y la redistribución de pesos sea legal.
- No se ha verificado la arquitectura, ni la compatibilidad con herramientas como llama.cpp, vLLM o llm-compressor.
- Cualquier uso en producción es imposible actualmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated-GGUF
- Modelo base (placeholder): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página del modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Nota metodológica del autor (nvfp4-mtp-survey): https://huggingface.co/datasets/windowsxp811203/nvfp4-mtp-survey
- Modelo abliterado anterior del autor: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
- Modelo abliterado NVFP4 del autor: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4
- Modelo Cold-Fusion NVFP4 del autor: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4
