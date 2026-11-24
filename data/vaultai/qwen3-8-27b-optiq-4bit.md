# vaultai/Qwen3.8-27B-OptiQ-4bit

## Resumen
Qwen3.8-27B-OptiQ-4bit es una cuantizacion de precision mixta en formato MLX del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario vaultai (la model card hace referencia a la organizacion mlx-community). El modelo base es un transformer hibrido de 27B parametros que combina atencion lineal y atencion completa, y que procesa tanto texto como imagenes. Esta version reduce el peso en disco a 19,0 GB (20,7 GB de repositorio) manteniendo la torre de vision en bf16 en un fichero sidecar.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 27B con capacidades de vision en Apple Silicon mediante mlx-lm o mlx-optiq, algo imposible con los pesos en bf16 a ese tamano. La cuantizacion no es uniforme: se aplica un analisis de sensibilidad por capa basado en divergencia KL sobre un conjunto de calibracion de seis dominios, asignando 8 bits a las 261 capas mas sensibles y 4 bits a las 237 mas robustas.

El modelo conserva las capacidades del Qwen3.8-27B original (razonamiento, codigo, matematicas, tool calling y vision) y anade soporte para decodificacion especulativa mediante los tensores MTP originales de Qwen, incluidos en el repositorio. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa), multimodal texto+imagen |
| Parametros totales | 26.895.993.856 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta 4/8 bits (498 capas cuantizadas: 261 a 8 bits, 237 a 4 bits), group size 64; torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), vision tower en `optiq/optiq_vision.safetensors`, cabecera MTP en `optiq/mtp.safetensors` |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer hibrido: de sus 64 bloques, tres cuartas partes emplean atencion lineal (con cinco proyecciones cada uno) y el resto atencion completa, lo que explica que el barrido de sensibilidad puntue 498 tensores en lugar de los ~450 de un modelo denso equivalente. Esta publicacion no entrena el modelo, solo lo cuantiza: los pesos proceden directamente de Qwen/Qwen3.8-27B.

El proceso de cuantizacion usa mlx-optiq con un conjunto de calibracion de seis dominios (prosa, razonamiento, codigo, agente, tool-call e instrucciones con restricciones), 40 muestras por dominio. La referencia de sensibilidad es una cuantizacion uniforme de 4 bits, dado que bf16 no cabe en 36 GB a este tamano. La nomenclatura "4-bit" sigue la convencion de llama.cpp para Q4_K_M: indica la precision predominante, no la media ponderada. Se conservan los tensores MTP (multi-token prediction) originales de Qwen para decodificacion especulativa.

## Capacidades
- Generacion de texto y razonamiento multi-paso.
- Generacion de codigo (HumanEval pass@1 de 92,1% segun la model card).
- Razonamiento matematico con cadena de pensamiento (GSM8K 3-shot CoT de 96,1%).
- Vision: pipeline image-text-to-text, con torre de vision en bf16.
- Tool calling y function calling (BFCL-V3 simple AST de 93,5%).
- Seguimiento de instrucciones estrictas (IFEval prompt-level strict de 77,1%).
- Recuperacion en contexto largo (HashHop de 85,0%).
- Decodificacion especulativa mediante cabecera MTP.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Asistente de codigo local en Mac: con 19 GB en disco y soporte de mlx-lm, se puede ejecutar en un Mac con memoria unificada suficiente para autocompletar, explicar y refactorizar codigo sin enviar datos a la nube.
- Procesamiento de documentos con imagenes: al conservar la torre de vision en bf16, permite extraer informacion de capturas, diagramas o formularios combinando texto e imagen en una sola pasada.
- Agentes con tool calling: el 93,5% en BFCL-V3 simple lo hace adecuado para orquestar llamadas a APIs y funciones en flujos automatizados de multiples pasos.
- Razonamiento matematico y analisis cuantitativo: el 96,1% en GSM8K con CoT lo hace util para tutoria, verificacion de calculos y generacion de explicaciones paso a paso.
- Despliegue de servidor compatible OpenAI/Anthropic: mediante `optiq serve` se expone una API local con KV-cache de precision mixta, util para prototipos y entornos de desarrollo sin coste de cloud.
- Fine-tuning con LoRA sensible a la cuantizacion: mlx-optiq permite adaptar el modelo a dominios concretos manteniendo la precision mixta, con hot-swap de adaptadores montados.
- Ejecucion de codigo en sandbox: la herramienta incluye ejecucion de Python aislada, lo que facilita tareas de analisis de datos asistido por el modelo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| MMLU (5-shot, 1000) | 84,1% |
| GSM8K (3-shot CoT) | 96,1% |
| IFEval (prompt-level, strict) | 77,1% |
| BFCL-V3 simple (AST) | 93,5% |
| HumanEval (pass@1) | 92,1% |
| HashHop (long-context retrieval) | 85,0% |
| Capability Score (media de 6) | 87,98 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada. La model card indica que cada metrica recibe un voto igual y que el tamano en disco (18,9 GB) se reporta como segundo eje independiente, no integrado en la puntuacion.

## Requisitos de hardware
- Inferencia en Apple Silicon exclusivamente: el formato es MLX y no es compatible con CUDA ni ROCm.
- Memoria unificada: el modelo ocupa 19,0 GB en disco; se necesita un Mac con al menos 24-32 GB de memoria unificada para cargarlo con margen para el KV-cache.
- GPU recomendadas: chips Apple M-series con memoria unificada amplia (M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No aplica a A100, H100 ni RTX 4090.
- Despliegue: `mlx-lm` para texto; `mlx-optiq` (`optiq serve`) para imagen+texto, servidor compatible OpenAI/Anthropic, KV-cache de precision mixta y ejecucion de Python en sandbox.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-OptiQ-4bit (este) | ~27B | no disponible | Apache 2.0 | MLX safetensors 4/8-bit | Vision en bf16 sidecar, 19 GB en disco |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | Apache 2.0 | safetensors bf16 | Referencia sin cuantizar; no cabe en 36 GB segun la model card |
| Cuantizacion uniforme 4-bit del mismo base | ~27B | no disponible | Apache 2.0 | MLX safetensors | Referencia de sensibilidad usada por OptiQ; menor calidad en capas sensibles |

No se dispone de datos de benchmarks de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias
- Exclusivo de Apple Silicon: el formato MLX no se puede cargar en CUDA ni en CPU convencional con las herramientas habituales.
- La etiqueta "4-bit" es la precision predominante, no la media; el consumo real de memoria y la calidad efectiva dependen de la mezcla 4/8 bits.
- La torre de vision solo funciona bajo `optiq serve`; con `mlx-lm` estandar el modelo carga en modo solo texto.
- Si se carga la cabecera MTP fuera de `optiq serve`, hay que sumar 1.0 a las siete RMSNorm (`mtp.*norm*`), que estan centradas en cero; omitirlo produce resultados incorrectos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de sesgo ni de robustez en la informacion disponible.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto no documentada en la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- La model card atribuye la autoria a mlx-community mientras el ID de Hugging Face corresponde a vaultai; conviene verificar la procedencia antes de usarlo en produccion.

## Enlaces
- Hugging Face: https://huggingface.co/vaultai/Qwen3.8-27B-OptiQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto mlx-optiq: https://mlx-optiq.com/
- Documentacion: https://mlx-optiq.com/docs/
- Guia de la familia Qwen: https://mlx-optiq.com/docs/qwen
- Laboratorio: https://mlx-optiq.com/docs/lab/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Mezcla de calibracion: https://mlx-optiq.com/blog/calibration-mix
- Marco de evaluacion: https://mlx-optiq.com/blog/eval-framework
- PyPI: https://pypi.org/project/mlx-optiq
