# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ4e-mtp

## Resumen

Este repositorio contiene una cuantización de 4 bits del modelo `Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13`, realizada con la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors. El modelo base pertenece a la familia Qwen3.5/3.6 con arquitectura de mezcla de expertos (MoE), como indica la etiqueta `qwen3_5_moe`, y el nombre sugiere 35 mil millones de parámetros totales con 3 mil millones activos por token. El autor, symrex, ha publicado varias versiones de esta serie (V11, V12, V13) con el mismo esquema de cuantización.

La relevancia de este modelo radica en que ofrece una versión cuantizada y supuestamente "uncensored" de un modelo MoE de gran tamaño, optimizada para ejecutarse en dispositivos Apple mediante MLX. Sin embargo, la información disponible es escasa: no se proporcionan detalles sobre el entrenamiento, capacidades, licencia o rendimiento del modelo base, por lo que esta ficha se limita a los datos verificables del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible (el nombre sugiere 3 B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de la etiqueta `qwen3_5_moe`, que indica una arquitectura de mezcla de expertos (MoE) de la serie Qwen 3.5/3.6. El repositorio actual es una cuantizacion posterior, no el modelo original, por lo que no se documentan datos de entrenamiento, dataset, ni tecnicas como RLHF o DPO. La cuantizacion se realizo con oQ (oMLX v0.6.4), que aplica precision mixta con un tamaño de grupo de 64 y 4 bits, optimizada para el ecosistema MLX de Apple.

## Capacidades

No se han publicado capacidades especificas en la informacion disponible. Dado que se trata de una cuantizacion de un modelo MoE de la familia Qwen, es probable que herede capacidades genericas de dicha familia (generacion de texto, razonamiento, codigo, etc.), pero no hay confirmacion oficial. No se documenta soporte de tool calling, agentes, vision, audio ni modos especiales.

## Casos de uso

Al carecer de documentacion sobre el modelo base, los casos de uso son especulativos. No obstante, por su naturaleza (MoE de 35 B cuantizado a 4 bits para MLX), podria emplearse en:

- Inferencia local en hardware Apple: el formato MLX y la cuantizacion 4 bits permiten ejecutar el modelo en Mac con Metal, aunque se desconoce el consumo exacto de memoria.
- Experimentacion con modelos MoE cuantizados: investigadores pueden evaluar el impacto de la cuantizacion oQ en la calidad de salida.
- Prototipado rapido de aplicaciones de generacion de texto sin requisitos de licencia claros (si el uso es interno).
- Pruebas de rendimiento en entornos con restricciones de VRAM, comparando con otras cuantizaciones.
- Desarrollo de chatbots o asistentes en entornos donde no se requiera cumplimiento de licencia estricto (riesgo legal no evaluado).
- Fine-tuning o adaptacion posterior mediante tecnicas como LoRA, si el formato lo permite (no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede comparar objetivamente con otros modelos sin datos verificables.

## Requisitos de hardware

- Tamano del repositorio: 21,6 GB, lo que sugiere que los pesos cuantizados ocupan aproximadamente esa cantidad en disco.
- VRAM estimada: no disponible, pero al ser MLX, se ejecuta en la memoria unificada de Apple Silicon; 21,6 GB de pesos requieren al menos 24 GB de RAM unificada para cargar el modelo completo, aunque podria usar swapping.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra o superior) con al menos 32 GB de RAM unificada para comodidad.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB podria intentarlo, pero el formato MLX no es compatible directamente; se necesitaria conversion).
- Opciones de despliegue: MLX (libreria oficial de Apple), posiblemente via llama.cpp si se convierte a GGUF, pero no se proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. El nombre sugiere una variante de Qwen3.6-35B-A3B, pero no hay datos oficiales de Qwen sobre ese modelo especifico. No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que impide conocer si el uso comercial esta permitido. Se debe contactar al autor antes de cualquier despliegue en produccion.
- Al ser una cuantizacion de 4 bits, es probable una degradacion de la calidad respecto al modelo original, especialmente en tareas de razonamiento complejo.
- El termino "uncensored" en el nombre sugiere que el modelo base podria haber sido entrenado sin alineacion de seguridad, lo que aumenta el riesgo de generar contenido inapropiado o sesgado.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma.
- El formato MLX limita su uso a ecosistemas Apple; para otros entornos se requiere conversion.
- La fecha de creacion (2026-09-03) es futura respecto a la fecha actual, lo que podria indicar un error en los metadatos o un modelo experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ4e-mtp
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Versiones relacionadas del mismo autor: V11 (https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-oQ4e-mtp) y V12 (https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-oQ4e-mtp)
