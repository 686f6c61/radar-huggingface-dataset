# trevor000/Qwen3.8-27B-Escha-W2-RTX4070

## Resumen

Este repositorio es un espejo de atribución de los pesos de `EschaLabs/Qwen3.8-27B-Escha-W2`, publicado por el usuario `trevor000` bajo el identificador `trevor000/Qwen3.8-27B-Escha-W2-RTX4070`. No se trata de un modelo entrenado por el autor del espejo: la model card indica explícitamente que los pesos son los ficheros originales sin modificar y que el proyecto no los entrenó. El objetivo declarado es disponer de una copia reproducible para investigación sobre una única GPU RTX 4070, con un manifiesto de ficheros revisado y una lista de permitidos de publicación que excluye intencionadamente `opencode.json`.

El modelo base declarado es `Qwen/Qwen3.8-27B`, con etiquetas que lo sitúan en la familia Qwen3 (`qwen3`, `qwen3_5`) y en la categoría de modelos cuantizados a 2 bits (`2-bit`, `escha`, `quantized`, `research`). El repositorio ocupa 10,2 GB e incluye dos shards de pesos en safetensors, el índice de safetensors, configuración, ajustes de generación, tokenizer, vocabulario y merges, plantilla de chat y metadatos de cuantización. No se incluye ningún binario de ejecución ni kernel personalizado: el runtime necesario es un repositorio separado, `EschaLabs/escha-runtime-qwen3dense`.

Es relevante ahora como artefacto de investigación reproductible más que como modelo listo para producción: la model card ofrece cifras históricas de rendimiento medidas en un laboratorio concreto (148,03 tok/s de mediana con una caché de control de 176 tokens, y en torno a 125 tok/s con 5.120 tokens activos exactos y un archivo en RAM de 12.288 tokens) que dependen de un runtime SGLang modificado y de un borrador especulativo externo, no de estos pesos por sí solos. El repositorio no añade ninguna medición nueva de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (denominación del runtime asociado: `escha-runtime-qwen3dense`); familia Qwen3 según las etiquetas del repositorio |
| Parametros totales | 6.340.437.856 (dato real de safetensors); el nombre del modelo base sugiere 27B, discrepancia no explicada en la información disponible |
| Parametros activos | No aplica: no se describe una arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible. Las únicas cifras de tokens publicadas son experimentales del runtime: 176 tokens de caché de control y 5.120 tokens activos exactos con archivo en RAM de 12.288 tokens |
| Tipos de cuantizacion | 2 bits (`2-bit`, nombre `W2`); el repositorio incluye metadatos de cuantización, pero no se detallan esquemas ni granularidad |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada en la model card del espejo); se incluyen `LICENSE` y `THIRD_PARTY_LICENSES/Qwen-LICENSE.txt` |
| Formato de pesos | Safetensors (dos shards) más índice de safetensors; también se incluyen configuración, ajustes de generación, tokenizer, vocabulario, merges y plantilla de chat |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3_5`/`qwen3` y del nombre del runtime asociado, `escha-runtime-qwen3dense`, que apunta a un transformer denso. No se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO u otras técnicas de alineamiento. Tampoco hay información sobre innovaciones de atención o decodificación implementadas en los pesos: el autor del espejo indica explícitamente que no se entrenaron los pesos y que no se incluye ningún binario de ejecución ni kernel personalizado.

La innovación técnica relevante no está en el modelo, sino en el sistema de inferencia que lo acompaña. La model card describe un enfoque de memoria con "archivo rodante en RAM" (rolling RAM archive) y advierte de forma explícita que el recuerdo del archivo no equivale a una atención exacta completa sobre el mismo. Las mediciones históricas citadas (148,03 tok/s de mediana y ~125 tok/s con 5.120 tokens activos exactos) requieren el runtime SGLang modificado del laboratorio y un borrador de decodificación especulativa separado denominado Apathy DFlash. Sin ese runtime, los pesos de este repositorio no constituyen por sí mismos un paquete autónomo de Transformers.

## Capacidades

- La información disponible no documenta capacidades específicas del modelo (generación, razonamiento, código, matemáticas o visión).
- Al ser un espejo de pesos sin reentrenamiento, las capacidades serían las del modelo base `Qwen/Qwen3.8-27B`, cuyas características no se detallan en la documentación proporcionada.
- Soporte de plantilla de chat: sí, el repositorio incluye el fichero de plantilla de chat junto con los ajustes de generación y el tokenizer.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible.
- Integración con runtime externo: el repositorio nombra `EschaLabs/escha-runtime-qwen3dense` en `provenance.json` como runtime necesario, con su propia licencia y lanzador documentado.

## Casos de uso

- Investigación reproducible en una sola RTX 4070: el repositorio existe precisamente para fijar una revisión concreta de pesos (revisión `561dae0aeea1efbdafe122f2e385fdeaa99127e7`) y un manifiesto de ficheros revisado, lo que permite repetir experimentos sin depender de que el repositorio upstream cambie.
- Evaluación del impacto de la cuantización a 2 bits: comparar las salidas de estos pesos con las del modelo sin cuantizar permite medir degradación por tarea, siempre que se disponga de una referencia del modelo base.
- Experimentación con gestión de memoria a contexto largo: el enfoque de archivo rodante en RAM (12.288 tokens de archivo con 5.120 tokens activos exactos) es adecuado para estudiar compromisos entre ventana exacta, memoria y calidad de recuperación en conversaciones largas.
- Investigación en decodificación especulativa: las mediciones citadas usan un borrador Apathy DFlash; el repositorio sirve como punto de partida reproducible para replicar o mejorar esas tasas de decodificación.
- Despliegue local en estaciones de trabajo con una única GPU de 12 GB: el tamaño del repositorio (10,2 GB) encaja con el perfil de una RTX 4070, aunque exige delejar parte del estado en RAM.
- Docencia y formación en técnicas de cuantización: los metadatos de cuantización y los ficheros de configuración incluidos permiten ilustrar cómo se empaqueta un modelo cuantizado y qué artefactos acompañan a los pesos.
- Auditoría de licencias y procedencia: el repositorio incluye `LICENSE`, la licencia de terceros de Qwen y `provenance.json`, lo que lo hace útil como caso práctico de trazabilidad de artefactos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de calidad para este espejo. Las únicas cifras numéricas publicadas son medidas de rendimiento de decodificación del laboratorio original, no comparaciones de calidad:

| Metrica | Valor | Condiciones declaradas |
|---|---|---|
| Mediana de velocidad de decodificacion | 148,03 tok/s | Cache de control deliberadamente minima de 176 tokens |
| Velocidad con contexto activo | ~125 tok/s | 5.120 tokens activos exactos con archivo en RAM de 12.288 tokens |
| Requisitos de las mediciones | No reproducibles con estos pesos solos | Exigen runtime SGLang modificado del laboratorio y borrador Apathy DFlash |

El propio autor advierte que este espejo no añade ninguna medición nueva de GPU y que estas cifras pertenecen a un contexto histórico de laboratorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. El repositorio ocupa 10,2 GB, por lo que los pesos por sí solos requieren al menos ~10,2 GB de almacenamiento y, si se cargan completos en VRAM, un valor cercano a esa cifra, lo que deja muy poco margen en una GPU de 12 GB.
- GPU objetivo declarada: RTX 4070 (12 GB). El nombre del repositorio y el enfoque de archivo en RAM apuntan a ese perfil.
- GPU recomendadas: no disponible. No se documentan pruebas con A100, H100 ni otras tarjetas.
- Compatibilidad con GPU de consumo: sí en una RTX 4070 según el propósito declarado, con uso de caché mínima y archivo en RAM; otras GPU de consumo no se mencionan.
- Opciones de despliegue: no se puede asumir que funcione como paquete estándar de Transformers. El autor indica que debe usarse el lanzador documentado del runtime `EschaLabs/escha-runtime-qwen3dense`, con su propia licencia. Compatibilidad con vLLM estándar, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: 148,03 tok/s de mediana con caché de control de 176 tokens y ~125 tok/s con 5.120 tokens activos exactos más archivo de 12.288 tokens, en ambos casos con runtime modificado y borrador especulativo externos.
- Almacenamiento: 10,2 GB de repositorio, más el espacio necesario para el runtime y el borrador especulativo, no cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|---|
| `trevor000/Qwen3.8-27B-Escha-W2-RTX4070` (este repositorio) | 6.340.437.856 según safetensors | No disponible | Apache 2.0 | Safetensors (2 shards) + indice | No publicados | 0 descargas, 0 likes |
| `EschaLabs/Qwen3.8-27B-Escha-W2` (upstream) | No disponible | No disponible | No disponible | No disponible | No disponibles | Repositorio de origen citado |
| `Qwen/Qwen3.8-27B` (modelo base) | No disponible | No disponible | No disponible (se incluye `Qwen-LICENSE.txt` como aviso) | No disponible | No disponibles | Modelo base citado |

No se dispone de datos de otros modelos comparables de la misma categoría (cuantizaciones a 2 bits de la familia Qwen3) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del espejo: los pesos son los del upstream y el repositorio no aporta ninguna mejora ni ajuste.
- Discrepancia de nomenclatura: el nombre del repositorio y del modelo base sugiere 27B, mientras que el recuento real declarado en safetensors es de 6.340.437.856 parámetros. No se explica esta diferencia en la documentación disponible.
- Sin benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni equivalentes, por lo que no se puede evaluar la degradación introducida por la cuantización a 2 bits.
- Riesgo de alucinación: no evaluado ni documentado. Al tratarse de un modelo cuantizado agresivamente, la degradación de calidad respecto al modelo base no está medida.
- Idiomas soportados: no declarados. No hay garantía de cobertura multilingüe ni de comportamiento en castellano.
- Longitud de contexto: no declarada. Las cifras de tokens publicadas describen el sistema de archivo en RAM del laboratorio, no una ventana de contexto oficial.
- El recuerdo del archivo en RAM no equivale a atención exacta sobre todo el archivo, según advierte el propio autor. No debe confundirse con una ventana de contexto larga real.
- No se incluye runtime ni kernel: sin el repositorio `EschaLabs/escha-runtime-qwen3dense` no se puede assumir que los pesos sean utilizables como paquete estándar de Transformers.
- Licencias en capas: la model card declara Apache 2.0, pero se exige conservar la licencia de terceros de Qwen y la de Escha Labs. La licencia del runtime es independiente y debe revisarse antes de redistribuir código de ejecución.
- Sin respaldo del upstream: el autor indica que este espejo no cuenta con el aval de Escha Labs ni de Qwen.
- Repositorio sin tracción: 0 descargas y 0 likes, lo que reduce la probabilidad de que los problemas de uso estén documentados por terceros.
- Publicación parcial deliberada: `opencode.json` se excluye de la lista de permitidos; su función no se detalla.
- Posible inconsistencia entre el tamaño del repositorio (10,2 GB), el recuento de parámetros (6,34B) y la etiqueta de 2 bits; la model card no explica la distribución de precisiones por tensor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/trevor000/Qwen3.8-27B-Escha-W2-RTX4070
- Repositorio upstream espejado: https://huggingface.co/EschaLabs/Qwen3.8-27B-Escha-W2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime asociado: https://huggingface.co/EschaLabs/escha-runtime-qwen3dense
- Informe de mediciones (hill-climb): https://github.com/trevor050/escha-rtx4070-lab/blob/main/outputs/ESCHA_HILLCLIMB_REPORT_2026-08-27.md
- Lanzador de chat del laboratorio: https://github.com/trevor050/escha-rtx4070-lab/tree/main/work/escha-chat
- Comando de descarga indicado por el autor: `hf download trevor000/Qwen3.8-27B-Escha-W2-RTX4070 --local-dir Qwen3.8-27B-Escha-W2-RTX4070`
- Nota: las búsquedas web realizadas no devolvieron documentación técnica relevante sobre este modelo; los resultados obtenidos trataban sobre chat en directo de YouTube y no se han utilizado como fuente.
