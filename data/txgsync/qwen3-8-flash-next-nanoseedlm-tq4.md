# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TQ4 es una cuantización de investigación del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario txgsync y ejecutable únicamente mediante los motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS). La innovación principal reside en la codificación trellis de los pesos de los expertos enrutados: los 120,8 B de parámetros de expertos se comprimen a 4,125 bits por peso (62,3 GB), mientras que los pesos densos se mantienen en 8 bits MLX y la tabla PLE n-gram de 32 GB permanece en disco con soporte de page cache.

El modelo base es un Mixture of Experts de Qwen (etiquetado internamente como `qwen4_exp`) con 56.687.443.859 parámetros declarados en safetensors, torre de visión y cabeza MTP (multi-token prediction). Esta variante concreta es una vista previa de investigación: no reproduce exactamente las salidas del modelo original y requiere compilación manual del motor, ya que mlx-vlm y oMLX todavía no pueden cargarla por falta de kernels trellis en el cargador MLX.

Su relevancia es doble: por un lado, demuestra que la codificación trellis (derivada de QTIP, arXiv:2406.11235) permite llevar un MoE de gran tamaño a un Mac de 128 GB o a una GPU de 24 GB con 96-128 GB de RAM del sistema; por otro, publica métricas de divergencia KL frente a BF16 medidas en llama.cpp, lo que facilita evaluar la pérdida de calidad de forma cuantitativa frente a otras cuantizaciones como las de Unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer con torre de visión y cabeza MTP; expertos enrutados con codificación trellis (K = 4, ventana de 12 bits) |
| Parámetros totales | 56.687.443.859 (safetensors); 120,8 B de pesos de expertos enrutados según la model card |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de `nslm-serve --ctx 32768`; no se especifica el máximo del modelo base) |
| Tipos de cuantización | Expertos enrutados a 4,125 bits/peso (trellis K = 4); pesos densos en 8 bits MLX; tabla PLE en 4 bits MLX; variantes hermanas TQ3-D4 (3,458 bits) y TQ3 (3,125 bits) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (pesos densos, tabla PLE, torre de visión, cabeza MTP) + ficheros `.blkt` propietarios para los expertos trellis |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Qwen con 48 capas más una capa 48 correspondiente a la cabeza MTP. Los expertos enrutados de `gate_proj`, `up_proj` y `down_proj` se han recodificado con trellis K = 4 y estados de 12 bits: cada peso es un código de una ventana de 12 bits de un flujo de bits y los pesos vecinos comparten bits, sin codebook almacenado; el valor se obtiene con una multiply-add fija sobre la ventana. Esta técnica procede de QTIP (arXiv:2406.11235) y se implementa en los motores NanoSeedLM. Los pesos densos provienen de `mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp` (8 bits MLX) y la tabla PLE n-gram de 32 GB en 4 bits MLX reside en disco. Las estadísticas de activación para la cuantización proceden de la imatrix de Unsloth.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; la model card de esta cuantización no cubre esos detalles. La innovación destacable es exclusivamente la compresión: el pack ocupa 101,9 GB en el repositorio, requiere unos 70 GB de memoria residente y mantiene una divergencia KL media de 0,0415 frente a BF16 en llama.cpp sobre 64 ventanas de 2.048 tokens de wikitext-2, con un 92,98 % de acuerdo top-1 y perplejidad de 3,847 (frente a 3,802 en BF16).

## Capacidades

- Generación de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), aunque el autor indica que no se probó la entrada de imagen ni de vídeo en esta cuantización.
- Decodificación multi-token prediction (MTP) mediante la cabeza de la capa 48.
- Tabla PLE n-gram de 32 GB para memorización léxica o de secuencias largas, servida desde disco con page cache.
- Servicio de API compatible con OpenAI mediante `nslm-serve`.
- Soporte de chat multi-turno mediante `nslm-chat` y plantilla de chat incluida.
- Soporte de tool calling, function calling y comportamiento agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de gran tamaño en un Mac de 128 GB: el pack TQ4 está dimensionado para memoria residente de unos 70 GB, de modo que un M4 Max puede ejecutar el modelo sin GPU dedicada; el autor reporta 48,9 tokens/s de decodificación en ese equipo.
- Despliegue en estación de trabajo con GPU de 24 GB y 96-128 GB de RAM: los expertos enrutados permanecen en memoria host y una caché mantiene en VRAM los usados, lo que permite servir el modelo con `nslm-serve --ctx 32768 --port 8080` y una API compatible con OpenAI.
- Investigación sobre cuantización extrema: la publicación de métricas KL, acuerdo top-1 y perplejidad frente a BF16 y frente a los packs de Unsloth permite estudiar el compromiso entre bits por peso de experto y calidad, con datos comparables entre TQ4, TQ3-D4 y TQ3.
- Evaluación de codificación trellis en producción: útil para equipos que quieran medir latencia y throughput de kernels trellis en CUDA o Metal antes de adoptar el formato en un pipeline real.
- Prototipado de asistentes multimodales en local: al conservar la torre de visión y la cabeza MTP, sirve para experimentar con entradas image-text-to-text en entornos sin conectividad, aunque el autor advierte que la entrada de imagen no se ha probado.
- Servicio de chat con contexto largo en hardware de gama alta de consumo: con 32.768 tokens de contexto y decodificación de 35,7 tokens/s en una RTX 4080 de 16 GB con caché automática de expertos, es viable para asistentes de documentación o análisis de textos extensos.
- Reproducción de experimentos de compresión: los ficheros `.blkt` y la documentación del formato en NanoSeedLM permiten reimplementar o auditar el esquema de codificación sobre otros MoE.

## Benchmarks y rendimiento

Calidad medida en llama.cpp sobre 64 ventanas de 2.048 tokens de wikitext-2, con los expertos y pesos densos del pack escritos en el GGUF Q8_0 de Unsloth:

| Métrica | Este pack (TQ4) | BF16 |
|---|---|---|
| KLD media | 0,0415 ± 0,0005 | 0 |
| KLD mediana | 0,0113 | 0 |
| KLD percentil 99 | 0,492 | 0 |
| Acuerdo top-1 | 92,98 % | 100 % |
| Perplejidad | 3,847 | 3,802 |

Comparación con packs de Unsloth medidos del mismo modo:

| Pack | Bits por peso de experto | KLD media |
|---|---|---|
| Este pack (TQ4) | 4,125 | 0,0415 |
| Unsloth UD-Q4_K_XL | 5,101 | 0,0304 |
| Unsloth UD-IQ4_XS | 3,999 | 0,0509 |
| Unsloth UD-Q3_K_XL | 3,720 | 0,0593 |
| Unsloth UD-IQ3_XXS | 3,331 | 0,0735 |
| Unsloth UD-Q2_K_XL | 3,049 | 0,0994 |

Con los pesos densos Q8_0 de Unsloth, los expertos de este pack dan una KLD de 0,0398. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

Velocidad de decodificación (prompt de código, 256 tokens, con los pesos densos 4-bit MLX de las primeras builds; el autor advierte que los densos 8-bit de esta release leen 1,7 veces más bytes y pueden ser más lentos):

| Máquina | Decodificación (tokens/s) |
|---|---|
| RTX 4080 (16 GB), caché automática de expertos | 35,7 (con la reserva antigua de 2.560 MB) |
| M4 Max (128 GB) | 48,9 |

## Requisitos de hardware

- VRAM estimada: unos 70 GB de memoria residente total para el pack TQ4; en GPU, los expertos enrutados se alojan en memoria host y solo una caché de expertos usados ocupa VRAM (el autor cita GPUs de 24 GB o más con 96-128 GB de RAM del sistema).
- GPU recomendadas: RTX 4080 de 16 GB (medida por el autor con caché automática), GPUs de 24 GB o más con 96-128 GB de RAM; no se especifican A100 ni H100 en la información disponible.
- Compatibilidad con GPU de consumo: sí, en RTX 4080 de 16 GB con 96-128 GB de RAM del sistema; en Apple Silicon, Mac de 128 GB (M4 Max medido) y Mac de 96 GB para las variantes TQ3-D4 y TQ3.
- Opciones de despliegue: exclusivamente los motores NanoSeedLM (`nslm-chat` y `nslm-serve`, con backend CUDA en Linux y Windows y Metal en macOS). mlx-vlm y oMLX no pueden cargar los expertos trellis; llama.cpp solo se usa para las mediciones de calidad, no como runtime del pack.
- Almacenamiento: 101,9 GB de repositorio, más 32 GB de tabla PLE en disco que se leen mediante page cache.
- Latencia y throughput: 35,7 tokens/s en RTX 4080 y 48,9 tokens/s en M4 Max con los densos 4-bit; sin cifras publicadas para esta release con densos 8-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NanoSeedLM-TQ4 (este) | 56,7 B declarados; 120,8 B en expertos | 32.768 (ejemplo) | Trellis 4,125 bits + densos 8-bit MLX | qwen-community-1.0 | NanoSeedLM (CUDA, Metal) |
| Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4 | mismos | 32.768 (ejemplo) | Trellis 3,458 bits; KLD 0,0638 | qwen-community-1.0 | NanoSeedLM |
| Qwen3.8-Flash-Next-NanoSeedLM-TQ3 | mismos | 32.768 (ejemplo) | Trellis 3,125 bits; KLD 0,0778 | qwen-community-1.0 | NanoSeedLM |
| Qwen3.8-Flash-Next-NanoSeedLM-P4 | mismos | no disponible | MLX 4-bit; runtime mlx-vlm/oMLX | qwen-community-1.0 | mlx-vlm, oMLX |
| Qwen3.8-Flash-Next (BF16, base) | 56,7 B declarados | no disponible | BF16 | qwen-community-1.0 | ecosistema estándar |
| Packs GGUF de Unsloth (UD-Q4_K_XL, UD-IQ4_XS, etc.) | mismos | no disponible | 2,0-5,1 bits por peso de experto | qwen-community-1.0 | llama.cpp |

## Limitaciones y advertencias

- Es una vista previa de investigación: la salida no es idéntica a la del modelo original Qwen3.8-Flash-Next.
- mlx-vlm y oMLX no pueden cargar los expertos trellis porque el cargador MLX carece de kernels trellis; el único runtime válido es NanoSeedLM, que hay que compilar manualmente.
- No se probó la entrada de imagen ni de vídeo, pese a que el pipeline declarado es image-text-to-text.
- El formato 4-bit MLX de la tabla PLE no está medido frente a BF16; las métricas KL usan la tabla Q8_0 de Unsloth.
- Las cifras de velocidad proceden de un solo PC (RTX 4080) y un solo Mac (M4 Max) y corresponden a builds con densos 4-bit; esta release usa densos 8-bit y puede ser más lenta.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto enlazado en la model card antes de desplegar en producción.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria ni reportes de terceros sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ4
- Variante TQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4
- Variante TQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3
- Variante P4 (MLX): https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pesos densos 8-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp
- Pesos densos 4-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- GGUF e imatrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Documentación de expertos trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/concepts/trellis.md
- Guía de compilación: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/build.md
- Guía de ejecución y servicio: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/run-and-serve.md
- Formato de la carpeta del modelo: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/reference/model-folder.md
- Mediciones de mezclas trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/results/2026-11-05-trellis-mixes.md
- Paper QTIP: https://arxiv.org/abs/2406.11235
