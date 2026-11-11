# tmthang86/gemma-4-31B-anthology-mlx-6bit

## Resumen

`tmthang86/gemma-4-31B-anthology-mlx-6bit` es una cuantización en 6 bits del modelo `MRockatansky/gemma-4-31B-anthology`, un merge orientado a escritura creativa construido sobre `google/gemma-4-31B-it`. El autor de esta conversión, tmthang86, ha utilizado la librería MLX (versión 0.32.2) para generar pesos optimizados para Apple Silicon, con cuantización de 6 bits y tamaño de grupo 64, lo que permite ejecutar el modelo en LM Studio, oMLX o mlx-lm sobre Macs con memoria unificada.

El modelo base es un merge de varios modelos Gemma 4 de 31B con estilos "heretic" y creativos, entre ellos `nbeerbower/Gemma4-Gutenberg-31B-Heretic`, orientados a la generación literaria sin filtros. La conversión ha eliminado la torre de visión del checkpoint multimodal original, por lo que esta variante es exclusivamente de texto.

Se trata de un modelo derivado de muy baja difusión (0 descargas, 0 likes en el momento de la consulta), publicado bajo licencia Apache 2.0 y con la etiqueta `not-for-all-audiences`, lo que indica que su salida no está moderada. Su interés es acotado: sirve para experimentación con generación creativa sin censura en hardware Apple, no como modelo de propósito general para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), pesos cuantizados para MLX |
| Parametros totales | 30.697.345.280 (30,7 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 de 31B en su variante instruct (`google/gemma-4-31B-it`), un transformer denso. Sobre esa base, MRockatansky realizó un merge de modelos, combinando `nbeerbower/Gemma4-Gutenberg-31B-Heretic` con otros modelos Gemma 4 de 31B de corte creativo y "heretic" (es decir, con el alineamiento de seguridad atenuado o eliminado). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La contribución de esta ficha concreta es puramente de cuantización: la conversión se realizó con `mlx_lm convert -q --q-bits 6 --q-group-size 64`, lo que reduce el peso del checkpoint original y lo adapta al backend MLX. Durante la conversión se descartó la torre de visión del checkpoint multimodal, de modo que el modelo resultante procesa únicamente texto.

## Capacidades

- Generación de texto creativo: narrativa, ficción, relatos y prosa literaria, que es el propósito declarado del merge.
- Escritura sin moderación: el modelo está etiquetado como `not-for-all-audiences` y su salida no pasa por filtros.
- Generación de texto de propósito general heredada de Gemma 4 instruct (razonamiento, código, matemáticas): no verificada en esta variante concreta.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Visión: no soportada; la torre multimodal fue eliminada en la conversión.
- Modo thinking explícito: no disponible.

## Casos de uso

- Escritura creativa y narrativa en local: el modelo está pensado para redactar relatos, capítulos y prosa literaria; su naturaleza de merge "heretic" permite abordar temáticas que los modelos alineados rechazarían. Adecuado para autores que trabajan en un Mac con memoria unificada suficiente.
- Prototipado de ficción interactiva: integrado en mlx-lm o LM Studio, puede servir como motor de texto para aventuras conversacionales o generación de diálogos sin restricciones de contenido.
- Experimentación con merges de modelos: útil para investigadores que quieran evaluar cómo se comporta un merge creativo de Gemma 4 31B tras cuantización a 6 bits frente al checkpoint original en precisión completa.
- Generación de borradores y lluvia de ideas literarias: para sesiones de escritura asistida donde se prioriza variedad estilística sobre exactitud factual.
- Pruebas de cuantización en Apple Silicon: como referencia para medir la degradación de calidad de 6 bits frente a otros niveles en un modelo de 31B con MLX.
- Desarrollo de herramientas locales sin conexión: al ejecutarse en local con MLX, encaja en flujos de trabajo que requieren privacidad y no dependen de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 25,0 GB, por lo que se necesita al menos esa cantidad de memoria unificada libre; en la práctica, un Mac con 32 GB o más es el mínimo razonable.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M2 Pro/Max/Ultra, M3 Max/Ultra, M4 Pro/Max con 32 GB o más). No está pensado para GPUs NVIDIA.
- ¿Cabe en GPU de consumo? Solo en el ecosistema Apple Silicon; en GPUs NVIDIA de consumo (p. ej. RTX 4090 con 24 GB) no cabría en 6 bits sin descarga a RAM.
- Opciones de despliegue: mlx-lm, LM Studio, oMLX. No es compatible directamente con vLLM, TGI, llama.cpp u Ollama en su formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tmthang86/gemma-4-31B-anthology-mlx-6bit | 30,7 B | no disponible | 6 bits MLX | Apache 2.0 | Hugging Face, MLX |
| MRockatansky/gemma-4-31B-anthology (original) | ~31 B | no disponible | precision completa | Apache 2.0 | Hugging Face |
| google/gemma-4-31B-it (base) | ~31 B | no disponible | múltiples | Gemma terms | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido no moderado: el modelo está etiquetado como `not-for-all-audiences`; puede generar material explícito o inapropiado y no debe usarse en aplicaciones orientadas al público general sin filtros adicionales.
- Riesgo de alucinación: al ser un merge orientado a ficción, es esperable una menor fiabilidad factual que el modelo instruct base; no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas no declarados: se desconoce el soporte multilingüe real de esta variante.
- Sin visión: la torre multimodal fue eliminada, por lo que no procesa imágenes.
- Difusión nula: 0 descargas y 0 likes; no hay evidencia de uso comunitario ni validación externa.
- Licencia: Apache 2.0 según la model card, pero conviene verificar las condiciones del modelo base de Google (Gemma terms) antes de un uso comercial.
- Ecosistema restringido: los pesos MLX solo se ejecutan con herramientas compatibles (mlx-lm, LM Studio, oMLX), lo que limita su despliegue en servidores convencionales.
- Fecha de creación futura en los metadatos (2026-11-11): conviene tratar los metadatos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmthang86/gemma-4-31B-anthology-mlx-6bit
- Modelo base del merge: https://huggingface.co/MRockatansky/gemma-4-31B-anthology
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Modelo heretic incluido en el merge: https://huggingface.co/nbeerbower/Gemma4-Gutenberg-31B-Heretic
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
