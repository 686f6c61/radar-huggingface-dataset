# TinyLamda/llm-quant-artifacts

## Resumen

`TinyLamda/llm-quant-artifacts` es un repositorio de artefactos de investigación sobre cuantización de modelos de lenguaje, publicado por el usuario TinyLamda en HuggingFace. No es un modelo listo para inferencia, sino un conjunto de checkpoints con cuantización simulada (fake-quantization) a 4 bits con grupos de 128 valores, empaquetados de forma sin pérdidas en un formato propietario `.lqz`. El repositorio ocupa 87,2 GB e incluye artefactos derivados de cinco modelos base: Qwen3-4B, Qwen3-8B, Llama-3.1-8B-Instruct, Llama-3.1-8B y Llama-2-7b-hf.

El propósito declarado es el estudio comparativo de métodos de cuantización y de localidad de máscaras de poda, con transferencia entre máquinas del propio autor. Cada carpeta de modelo incluye checkpoints empaquetados por método, escalas de suavizado por canal, bases PCA por capa, estadísticas de calibración, ventanas de evaluación tokenizadas de WikiText-2 y C4, y cachés de estudios de localidad de máscaras. Todo ello acompañado de manifiestos con hashes sha256 por fichero y por tensor.

La relevancia es acotada: sirve como material reproducible para investigadores que estudien cuantización post-entrenamiento, pero no ofrece garantía de calidad ni pipeline de inferencia. La licencia es heterogénea: cada carpeta hereda la licencia del modelo del que deriva (Apache-2.0 para las variantes Qwen3 y Llama Community License para las de Meta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (artefactos derivados de transformers densos: Qwen3-4B, Qwen3-8B, Llama-3.1-8B, Llama-2-7b) |
| Parametros totales | Depende de la carpeta: 4B, 7B u 8B (modelos base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; el repositorio no lo documenta) |
| Tipos de cuantizacion | Fake-quant a 4 bits con grupo de 128; empaquetado `.lqz` con tabla fp16 de 16 entradas + 128 índices de 4 bits; otras tensores en crudo |
| Idiomas soportados | No disponible |
| Licencia | `other` / `per-model`; por carpeta: Apache-2.0 (q3_4b, q3_8b), Llama 3.1 Community License (l31i, l31), Llama 2 Community License (l2) |
| Formato de pesos | `.lqz` propietario (decodificación exacta a `model.pt`); también `smooth.pt`, bases PCA, `manifest.json`, ventanas de evaluación int32 |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: contiene checkpoints cuantizados de modelos preexistentes. La técnica aplicada es cuantización simulada a 4 bits con agrupación de 128 valores, en la que cada grupo se representa mediante una tabla de 16 valores fp16 más 128 índices de 4 bits. La decodificación es exacta y bit-idéntica respecto a los tensores originales, según declara el autor. El formato `.lqz` permite almacenar los checkpoints de forma compacta y verificable.

Además de los checkpoints, el repositorio incluye artefactos auxiliares para distintos métodos: escalas de suavizado por canal (`g_qoq/smooth.pt`), bases PCA del lado de pesos y del lado de claves por capa, estadísticas de segundos momentos de calibración, y cachés de un estudio de localidad de máscaras de poda con permutaciones de canales y perfiles de frecuencia de retención por canal. También incluye ventanas de evaluación tokenizadas de WikiText-2 y C4 en int32 con sus manifiestos. Todos los ficheros y tensores llevan hash sha256 registrado, lo que facilita la verificación de integridad. No se documentan detalles de dataset de preentrenamiento, RLHF/DPO ni innovaciones de decodificación, ya que el objeto del repositorio es la cuantización y no el entrenamiento.

## Capacidades

- No es un modelo desplegable: no incluye pipeline de inferencia ni pesos en formato estándar (safetensors, GGUF).
- Sirve como material de reproducción para estudios de cuantización post-entrenamiento a 4 bits con grupos de 128.
- Permite verificar integridad bit a bit de los checkpoints restaurados mediante hashes sha256 por tensor y por fichero.
- Incluye artefactos para evaluar perplejidad sobre ventanas tokenizadas de WikiText-2 y C4.
- Proporciona bases PCA y estadísticas de calibración reutilizables en investigaciones sobre rotaciones y suavizado de canales.
- Contiene cachés de estudios de localidad de máscaras de poda con permutaciones de canales y perfiles de retención.
- Capacidades del modelo subyacente (generación, razonamiento, código, tool calling, multilingüismo) no están documentadas en este repositorio y dependen del modelo base elegido.

## Casos de uso

- Reproducción de experimentos de cuantización: un investigador puede restaurar los checkpoints `.lqz` con la herramienta compañera y comparar la perplejidad frente a los pesos originales usando las ventanas de WikiText-2 y C4 incluidas.
- Auditoría de integridad de artefactos: los manifiestos con sha256 por fichero y por tensor permiten verificar que una copia restaurada coincide exactamente con la publicada, útil en pipelines de CI de investigación.
- Estudio de localidad de máscaras de poda: las cachés de `mask_locality/` permiten analizar cómo afectan las permutaciones de canales y los perfiles de retención a la calidad del modelo tras poda.
- Comparación de métodos de cuantización: las carpetas `g_<method>` permiten contrastar distintos esquemas (incluido el suavizado por canal de `g_qoq`) sobre el mismo modelo base.
- Investigación sobre rotaciones y bases PCA: las bases por capa y las estadísticas de segundos momentos de calibración sirven para estudiar transformaciones que reduzcan el error de cuantización.
- Transferencia entre máquinas de un laboratorio: el formato empaquetado y verificado está pensado para mover checkpoints grandes (87,2 GB en total) entre equipos propios con garantía de integridad.
- Docencia y formación: como ejemplo práctico de empaquetado sin pérdidas de tensores cuantizados y de gestión de artefactos con manifiestos hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye ventanas de evaluación tokenizadas de WikiText-2 y C4, pero no reporta valores de perplejidad ni de otras métricas en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de pesos a 4 bits con grupos de 128, un modelo de 7-8B ocuparía aproximadamente entre 4 y 5 GB en memoria si se materializara la cuantización, aunque el repositorio no es de inferencia directa.
- GPU recomendadas: no disponible; cualquier GPU con suficiente memoria para el modelo base restaurado (los modelos de 7-8B caben en GPUs de consumo con 8-12 GB en 4 bits).
- Cabe en GPU de consumo: previsiblemente sí para los modelos de 4-8B cuantizados a 4 bits, pero el autor no lo documenta ni garantiza.
- Opciones de despliegue: ninguna estándar (vLLM, llama.cpp, Ollama, TGI) porque el formato `.lqz` requiere la herramienta compañera del autor para restaurar a `model.pt`; después habría que reconvertir a un formato de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Modelos base | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| TinyLamda/llm-quant-artifacts | Artefactos de cuantización (fake-quant 4-bit) | Qwen3-4B, Qwen3-8B, Llama-3.1-8B, Llama-2-7b | `.lqz` propietario | Per-model (Apache-2.0 / Llama Community) | Investigación, no inferencia |
| GPTQ / AutoGPTQ (referencia habitual del sector) | Checkpoints cuantizados 4-bit listos para inferencia | Múltiples (Llama, Qwen, etc.) | safetensors + config | Según modelo base | Inferencia en producción |
| AWQ (referencia habitual del sector) | Checkpoints cuantizados 4-bit activación-aware | Múltiples | safetensors | Según modelo base | Inferencia en producción |

No se dispone de datos comparativos de rendimiento (perplejidad, latencia) entre este repositorio y las alternativas, porque el autor no los publica.

## Limitaciones y advertencias

- No es una release lista para inferencia: el autor lo declara explícitamente como artefactos de investigación sin garantía de calidad.
- El formato `.lqz` es propietario y requiere la herramienta compañera del autor para restaurar a `model.pt`; no es interoperable con vLLM, llama.cpp, Ollama ni TGI de forma directa.
- Licencias heterogéneas por carpeta: las variantes Llama están sujetas a la Llama 3.1 Community License y a la Llama 2 Community License, incluidas sus políticas de uso aceptable; el uso comercial de esas carpetas requiere cumplir dichos términos.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas propias, porque el objeto es la cuantización; esos riesgos heredan del modelo base correspondiente.
- Idiomas soportados no disponibles en la model card.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo original; el repositorio no cuantifica esa degradación de forma pública.
- Fecha de creación indicada como 2026-10-06, posterior a la fecha habitual de publicación de este tipo de materiales; conviene verificar la procedencia antes de usarlo en producción.
- Descargas y likes a cero en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TinyLamda/llm-quant-artifacts
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base Llama-2-7b-hf: https://huggingface.co/meta-llama/Llama-2-7b-hf
