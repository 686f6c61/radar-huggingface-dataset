# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TCQ4 es una cuantización de 4 bits del modelo Qwen3.8-Flash-Next (desarrollado por Alibaba Qwen), publicada por el usuario independiente txgsync bajo el paraguas del proyecto NanoSeedLM. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 72.808.140.255 parámetros totales, de los cuales 120.800 millones corresponden a pesos de expertos enrutados (la discrepancia entre ambas cifras se debe a que el recuento de safetensors no incluye todos los tensores del modelo original). El pack está diseñado para ejecutarse en un Mac de 128 GB o en un PC con GPU de 24 GB o más y entre 96 y 128 GB de RAM.

La innovación principal de este pack es el esquema de compresión Trellis K4 (TCQ), que almacena los pesos de los expertos enrutados a 4,125 bits por peso (62,3 GB en total) y mantiene los pesos densos en 8 bits. Frente a la versión BF16 en llama.cpp, la divergencia KL medida es de 0,0415 sobre 64 ventanas de 2.048 tokens de wikitext-2, un 15% inferior a los packs de Unsloth del mismo tamaño. En un M4 Max con Metal decodifica a 39,0 tokens por segundo, y a 38,8 tras un prompt de 30.000 tokens.

Es relevante ahora porque permite ejecutar un modelo MoE de gran escala en hardware de consumo de gama alta (Apple Silicon de 128 GB o PC con GPU de 24 GB y RAM abundante), algo que hasta hace poco requería múltiples A100/H100. El modelo se distribuye como research preview y requiere motores específicos (NanoSeedLM, mlx-vlm con Trust Remote Code u oMLX con un parche concreto), lo que limita su uso a entornos de investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), según tags del repo; detalles finos no disponibles |
| Parametros totales | 72.808.140.255 (según safetensors); 120.800 millones en pesos de expertos enrutados según model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se mencionan prompts de 30.000 tokens en pruebas de decodificación) |
| Tipos de cuantizacion | TCQ4 (Trellis K4, 4,125 bits por peso de experto, pesos densos en 8 bits); familia: TCQ3-D4, TCQ3, P4, P3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (librería mlx; incluye archivos de modelo MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos según los tags del repositorio (`moe`, `qwen4_exp`, `qwen3.8-flash-next`). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información corresponde al modelo original y no se reproduce en este pack. El pack en sí no entrena el modelo: es una cuantización del checkpoint Qwen/Qwen3.8-Flash-Next.

La innovación técnica de este pack es el esquema de compresión TCQ (Trellis-Coded Quantization) aplicado a los pesos de los expertos enrutados. Cada peso de experto se reconstruye a partir de unos pocos bits almacenados mediante aritmética entera, sin codebook. Los pesos densos se mantienen en 8 bits porque, según el autor, en los packs P3 y P4 son la principal fuente de divergencia KL (0,182 y 0,169 con densos a 4 bits frente a 0,0600 y 0,0408 con densos a 8 bits). El coste de los densos a 8 bits es velocidad: leen 1,84 GB más por token y en M4 Max el TCQ4 decodifica aproximadamente un 15% más lento que el P3. La tabla PLE (n-gram) permanece en disco y la caché de páginas mantiene las filas que lee cada sesión.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `image-text-to-text`, tags `conversational`).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text, integración con mlx-vlm).
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.8-Flash-Next; no se detallan en la model card.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas no está cumplimentado.
- Modo thinking: no documentado.
- Ejecución en Apple Silicon (Metal) y en PC con GPU CUDA (Linux y Windows) mediante los motores NanoSeedLM; también en mlx-vlm con Trust Remote Code y en oMLX con el parche jundot/omlx#5112.

## Casos de uso

- Investigación en compresión de modelos: el pack permite estudiar el impacto de TCQ frente a esquemas de seeds (P3/P4) con la misma arquitectura, comparando KL (0,0415 frente a 0,182) y velocidad en hardware idéntico.
- Despliegue local en Mac de 128 GB: un servidor compatible con OpenAI en el puerto 8080 arrancado con `./start-here.sh TCQ4` permite prototipar asistentes conversacionales multimodales sin salir del equipo.
- Evaluación de modelos MoE de gran escala en hardware de consumo: con una GPU de 24 GB y 96-128 GB de RAM se puede ejecutar un modelo cuyos expertos (62,3 GB) residen en RAM y se cachean en VRAM, útil para benchmarks internos antes de invertir en clúster.
- Procesamiento de documentos largos con imagen y texto: la pipeline image-text-to-text y la ventana de contexto suficiente para prompts de 30.000 tokens (probada a 38,8 tok/s) permiten tareas de extracción y resumen sobre documentos escaneados.
- Generación de código asistida en local: al heredar las capacidades del modelo base Qwen3.8-Flash-Next, puede integrarse en flujos de autocompletado o revisión de código en entornos con requisitos de privacidad, aunque el tool calling no está documentado.
- Comparación de cuantizaciones en producción: el pack sirve como referencia de "máxima calidad" dentro de la familia NanoSeedLM (KL más bajo) para validar si los packs más pequeños (TCQ3, TCQ3-D4) son suficientes para una carga de trabajo concreta.
- Investigación sobre decodificación especulativa y esquemas de cuantización sin codebook: los enlaces arXiv del repositorio (2410.10714, 2406.11235) apuntan a trabajos relacionados que pueden reproducirse con este checkpoint.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Divergencia KL vs BF16 (llama.cpp) | 0,0415 | 64 ventanas de 2.048 tokens de wikitext-2, tabla PLE Q8_0 de Unsloth |
| Divergencia KL con densos a 8 bits | 0,0398 | TCQ4 a 4,125 bits |
| Divergencia KL comparativa P4 | 0,0408 | P4 a 4,5 bits con densos a 8 bits |
| Divergencia KL comparativa P3 | 0,0600 | P3 a 4,0 bits con densos a 8 bits |
| Decodificación en M4 Max (Metal) | 39,0 tok/s | Prompt corto |
| Decodificación en M4 Max tras prompt de 30.000 tokens | 38,8 tok/s | Contexto largo |
| Decodificación en RTX 4080 limitada a 12 GB | 27 tok/s | TCQ3, no TCQ4 |
| Decodificación en RTX 4080 con 16 GB | 44 tok/s | TCQ3, no TCQ4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los expertos (62,3 GB en TCQ4) residen en RAM del sistema; la GPU actúa como caché de los expertos en uso. Se recomienda una GPU de 24 GB o más para TCQ4; con 16 GB se recomienda TCQ3-D4 y con 12-16 GB y 64 GB de RAM, TCQ3.
- RAM del sistema: 96-128 GB en PC para TCQ4; 128 GB en Mac para TCQ4; 96 GB en Mac para TCQ3-D4 (permite contextos largos).
- GPU recomendadas: no se especifican modelos concretos más allá del RTX 4080 en las pruebas de throughput; en Apple Silicon, M4 Max con Metal.
- Cabe en GPU de consumo: sí, en configuraciones de gama alta (RTX 4080/4090 con 16-24 GB de VRAM y 96-128 GB de RAM del sistema). No cabe en equipos con menos de 64 GB de RAM.
- Opciones de despliegue: motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS), mlx-vlm con Trust Remote Code, oMLX con el parche jundot/omlx#5112. Scripts de arranque: `START-HERE.bat TCQ4` (Windows) y `./start-here.sh TCQ4` (Linux/macOS), que levantan un servidor compatible con OpenAI en el puerto 8080.
- Latencia y throughput: 39,0 tok/s en M4 Max (38,8 tok/s con prompt de 30.000 tokens); 27-44 tok/s en RTX 4080 con TCQ3 según VRAM disponible. TCQ4 es aproximadamente un 15% más lento que P3 en M4 Max.
- Tamaño de descarga: 127,5 GB para TCQ4; tamaño del repo en Hugging Face: 226,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ4 | 72,8 B (safetensors); 120,8 B en expertos | no disponible | TCQ4, 4,125 bits expertos + 8 bits densos | 0,0415 | qwen-community-1.0 | Hugging Face (mlx, research preview) |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4 | mismo base | no disponible | Trellis K3 + down K4, 3,458 bits | 0,0638 | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3 | mismo base | no disponible | Trellis K3, 3,125 bits | 0,0778 | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next-NanoSeedLM-P3 | mismo base | no disponible | Seeds P3, 4,0 bits + densos 4 bits | 0,182 | qwen-community-1.0 | Hugging Face |
| Packs de Unsloth del mismo tamaño | mismo base | no disponible | no disponible | 15% peor que TCQ4 según el autor | no disponible | no disponible |

No se dispone de datos de benchmarks estándar para comparar el rendimiento de tarea (razonamiento, código, matemáticas) con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Research preview: el autor lo etiqueta explícitamente como tal; requiere motores específicos (NanoSeedLM, mlx-vlm con Trust Remote Code, oMLX con parche) y no funciona en todos los runtimes convencionales.
- Licencia qwen-community-1.0: es necesario revisar los términos del modelo base (enlace a la licencia en el repositorio de Qwen) antes de cualquier uso comercial; el pack se distribuye como "other".
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe sin evaluarla.
- Riesgo de alucinación y sesgos: no evaluados en la model card; al ser una cuantización de 4 bits, la divergencia KL de 0,0415 implica una degradación medible frente a BF16 que puede acentuarse en tareas de razonamiento largo.
- Requisitos de memoria elevados: menos de 64 GB de RAM no es viable; en PC, el rendimiento depende de la caché de expertos en VRAM (27 tok/s con 12 GB frente a 44 tok/s con 16 GB).
- Tool calling, agentes y modo thinking no documentados: no deben asumirse para producción sin validación previa.
- Dependencia de la caché de páginas para la tabla PLE en disco: puede afectar a la latencia en el primer acceso y en sesiones con muchas filas distintas.
- Fecha de creación del repositorio (2026-11-06) y estado de actualización reciente: verificar compatibilidad con la versión actual de los motores antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Releases del motor NanoSeedLM: https://github.com/mbarnson/NanoSeedLM/releases
- Parche oMLX: https://github.com/jundot/omlx/pull/5112
- Pack TCQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Pack TCQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Pack P4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Pack P3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3
- Paper referenciado (arXiv:2410.10714): https://arxiv.org/abs/2410.10714
- Paper referenciado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
