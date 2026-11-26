# Xylolabs/Hy4-MLX-8bit

## Resumen

Hy4 MLX 8-bit es una conversión cuantizada a 8 bits del modelo de lenguaje tencent/Hy4, realizada por Xylolabs para su ejecución en el framework MLX de Apple (Apple Silicon). El modelo base es un transformer de tipo Mixture of Experts (MoE) con 770B parámetros totales y 49B parámetros activos por token, desarrollado por Tencent. Esta versión concreta empaqueta únicamente la torre de texto en formato MLX de 8 bits, dejando la torre de visión y el drafter de decodificación especulativa (DFly2) como ficheros separados dentro del mismo repositorio.

La relevancia de esta ficha reside en que permite ejecutar un modelo de escala 770B en hardware Apple Silicon de gama alta (Mac Studio M5 Ultra con 512 GB de memoria unificada), algo impensable con los pesos en BF16. La cuantización a 8 bits mantiene una fidelidad alta respecto al modelo original: la model card reporta una KL de 0,038634 en WikiText-2 y un 94,118% de acuerdo top-1 frente a BF16, con un tamaño de 828,681 GB.

El modelo está pensado para generación de texto y conversación, con soporte declarado de inglés y chino. La licencia es la Tencent Hy License 1.0, que no es de código abierto estándar y debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), según tags del repo (`moe`) |
| Parametros totales | 769.907.408.797 (≈770B) |
| Parametros activos | 49B |
| Longitud de contexto | 16K (según tabla de hardware de la model card para la variante 4-bit; no se especifica de forma independiente para 8-bit) |
| Tipos de cuantizacion | MLX 8-bit (esta versión); existe también MLX 4-bit (456,63 GB) del mismo autor |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (`tencent-hy-license`) |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4 es un transformer con arquitectura Mixture of Experts: 770B parámetros totales con 49B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo original de Tencent, no incluida aquí.

La innovación técnica destacable de este repositorio es el proceso de conversión y cuantización a MLX 8-bit, con métricas de fidelidad publicadas frente a BF16 (KL y acuerdo top-1 en WikiText-2, chat y held-out). Además, el repositorio incluye un drafter DFly2 para decodificación especulativa, accesible mediante los módulos Python `dfly_v4` y `speculative_v4`, y una torre de visión separada para entrada de imagen. La ejecución requiere `mlx-lm==0.32.2` y `--trust-remote-code`, ya que el código de `hy_v4.py` proviene de Transformers y mlx-lm.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de contenido general en inglés y chino.
- Entrada de imagen mediante la torre de visión incluida como fichero separado (no cargada por defecto en `mlx-lm`).
- Decodificación especulativa con el drafter DFly2 para acelerar la generación.
- Ejecución local en Apple Silicon mediante `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: un equipo con Mac Studio M5 Ultra y 512 GB de memoria unificada puede cargar la variante 4-bit (456,6 GB) con contexto de 16K, útil para prototipado y evaluación sin depender de la nube.
- Evaluación de fidelidad de cuantización: los datos de KL y top-1 publicados permiten comparar el impacto de 8 bits frente a 4 bits antes de decidir qué variante desplegar en producción.
- Generación de texto bilingüe inglés-chino: adecuado para tareas de redacción y traducción entre ambos idiomas en entornos donde no se requiere un modelo multilingüe amplio.
- Aceleración con decodificación especulativa: el drafter DFly2 integrado permite reducir la latencia en flujos de generación larga mediante `stream_generate`.
- Servicio HTTP local: `mlx_lm.server` permite exponer el modelo como endpoint compatible para integrarlo en herramientas internas de desarrollo.
- Investigación sobre MoE a gran escala: con 49B parámetros activos, sirve para estudiar el comportamiento de modelos dispersos en hardware de consumo profesional Apple.

## Benchmarks y rendimiento

Métricas de fidelidad de la cuantización frente a BF16 publicadas en la model card:

| Cuantización | Tamaño | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 456,63 GB | 0,142528 | 88,549% | 0,193011 | 90,126% | 0,066185 | 92,363% |
| MLX 8-bit | 828,681 GB | 0,038634 | 94,118% | 0,119845 | 93,565% | 0,016506 | 96,088% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 828,681 GB para los pesos en 8 bits; la variante 4-bit ocupa 456,63 GB.
- La tabla de hardware de la model card solo recomienda fichero para Mac Studio M5 Ultra de 80 núcleos GPU con 512 GB de memoria unificada, y en ese caso apunta a la variante 4-bit con contexto de 16K y el límite de memoria GPU de macOS elevado.
- Para el resto de configuraciones listadas (M5 Max con 36, 48, 64 y 128 GB; M5 Ultra con 96 y 256 GB) la tabla indica "none", es decir, ningún fichero de este repositorio cabe en esas máquinas.
- No cabe en GPU de consumo tipo RTX 4090 ni en A100/H100 de 80 GB en esta cuantización; requeriría agregación de memoria multi-GPU no documentada.
- Despliegue: `mlx-lm==0.32.2` con `--trust-remote-code`; comandos `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/Hy4-MLX-8bit | 770B | 49B | 16K (referencia 4-bit) | MLX 8-bit | Tencent Hy License 1.0 | Hugging Face, 270 descargas |
| Xylolabs/Hy4-MLX-4bit | 770B | 49B | 16K | MLX 4-bit | Tencent Hy License 1.0 | Hugging Face (mismo autor) |
| tencent/Hy4 | 770B | 49B | no disponible | safetensors (BF16) | Tencent Hy License 1.0 | Hugging Face (modelo base) |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento frente a alternativas de otros autores; la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- La licencia Tencent Hy License 1.0 no es una licencia de código abierto permisiva; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- La cuantización introduce degradación medible: el 8-bit baja al 94,118% de acuerdo top-1 en WikiText-2 y al 93,565% en chat respecto a BF16.
- El repositorio ocupa 828,7 GB, lo que exige almacenamiento y ancho de banda considerables; la descarga y carga son costosas.
- Requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio; conviene auditar `hy_v4.py` antes de usarlo en entornos sensibles.
- La torre de visión y el drafter DFly2 no se cargan por defecto con `mlx-lm`; necesitan módulos Python específicos.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible.
- La longitud de contexto de 16K solo aparece asociada a la variante 4-bit en la tabla de hardware; no se confirma de forma independiente para 8-bit.
- No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, lo que limita las opciones de despliegue en servidor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Hy4-MLX-8bit
- Modelo base: https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/Xylolabs/Hy4-MLX-8bit/blob/main/LICENSE
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Variante 4-bit: https://huggingface.co/Xylolabs/Hy4-MLX-4bit
