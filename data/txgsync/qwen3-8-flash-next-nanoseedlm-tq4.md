# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TQ4 es una cuantización de 4 bits del modelo Qwen3.8-Flash-Next de Alibaba (familia Qwen), publicada por el usuario txgsync bajo la etiqueta de "research preview". No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos cuantizados con una técnica propietaria denominada TCQ (trellis-coded quantization) implementada en el motor NanoSeedLM. El objetivo declarado es hacer viable la inferencia de un modelo MoE de aproximadamente 72.800 millones de parámetros totales en hardware de consumo: un Mac de 128 GB de memoria unificada o un PC con GPU de 24 GB o más y entre 96 y 128 GB de RAM.

La relevancia del artefacto es doble. Por un lado, demuestra que es posible comprimir los pesos de los expertos enrutados (120.800 millones de pesos según la model card, aunque el recuento de safetensors reporta 72.808 millones de parámetros totales) a unos 4,125 bits por peso, con una divergencia KL de 0,0415 frente a BF16. Por otro, introduce un runtime alternativo (NanoSeedLM) con soporte CUDA y Metal, además de compatibilidad con mlx-vlm y oMLX. Es, por tanto, un experimento de compresión más que un modelo listo para producción.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card. Muchos datos técnicos del modelo base (contexto, idiomas, datos de entrenamiento, benchmarks) no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con atención transformer; pesos cuantizados con TCQ (trellis-coded quantization) sobre el modelo base Qwen3.8-Flash-Next |
| Parámetros totales | 72.808.140.255 (según safetensors); la model card menciona 120,8 B de pesos de expertos enrutados |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con prompts de 30.000 tokens) |
| Tipos de cuantización | 4 bits (4,125 bits por peso de experto); pesos densos en 8 bits; tabla PLE n-gram en disco |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX), con código personalizado (custom_code); requiere Trust Remote Code |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un transformer con mezcla de expertos (MoE) de la familia Qwen. La model card distingue entre pesos de expertos enrutados (120,8 B, almacenados a 4,125 bits) y pesos densos (8 bits en este pack). La cuantización TCQ no usa codebook: cada peso de experto se reconstruye a partir de unos pocos bits almacenados mediante aritmética entera, con una estructura de trellis K4. Según el autor, esta representación es más fiel a BF16 que la basada en semillas (seeds) del mismo tamaño: TCQ4 da una KL de 0,0398 a 4,125 bits, frente a 0,0408 de P4 a 4,5 bits y 0,0600 de P3 a 4,0 bits (todas con pesos densos de 8 bits).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card tampoco detalla innovaciones de decodificación (especulativa, atención lineal, etc.). La innovación principal de este artefacto es la propia compresión TCQ y el runtime NanoSeedLM, que mantiene los expertos en RAM y cachea en la GPU los que están en uso. La tabla PLE n-gram reside en disco y la page cache sirve las filas que lee cada sesión.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline image-text-to-text, según Hugging Face).
- Procesamiento de imagen y texto combinados: el pipeline declarado es image-text-to-text, lo que sugiere capacidades de visión heredadas del modelo base.
- Razonamiento y matemáticas: no hay datos específicos publicados en la información disponible.
- Generación de código: no hay datos específicos publicados en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Modo "thinking": no disponible en la información proporcionada.
- Ejecución en motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS), mlx-vlm con Trust Remote Code y oMLX (con el parche jundot/omlx#5112).

## Casos de uso

- Inferencia local de un MoE grande en Mac de 128 GB: el pack TCQ4 ocupa unos 70 GB de memoria residente y decodifica a 39,0 tokens por segundo en un M4 Max con Metal, lo que permite usar el modelo en un equipo de sobremesa Apple sin servidores dedicados.
- Despliegue en PC con GPU de 24 GB o más y 96-128 GB de RAM: los expertos permanecen en RAM y la GPU cachea los que están en uso; el script `START-HERE.bat TCQ4` levanta un servidor compatible con OpenAI en el puerto 8080, lo que facilita integrarlo en herramientas que ya hablan la API de OpenAI.
- Procesamiento de documentos con imagen y texto: al declarar el pipeline image-text-to-text, puede emplearse para tareas de comprensión de documentos escaneados o capturas, siempre que el runtime soporte la entrada multimodal.
- Experimentación en investigación sobre cuantización: el pack está pensado como "research preview" y permite comparar la fidelidad de TCQ frente a esquemas de semillas (P3, P4) midiendo la divergencia KL frente a BF16.
- Evaluación de contextos largos en hardware de consumo: la model card reporta 38,8 tokens por segundo tras un prompt de 30.000 tokens en M4 Max, lo que lo hace adecuado para probar cargas con contexto extenso en local.
- Servidor local compatible con OpenAI para prototipos: al exponer un endpoint en el puerto 8080, se puede conectar a clientes existentes (SDK de OpenAI, LangChain, etc.) para pruebas de integración sin coste de API.
- Estudio de compromisos memoria/velocidad: la familia de packs (TCQ4, TCQ3-D4, TCQ3, P4, P3) permite medir el impacto de los bits por experto y de los pesos densos en la calidad (KL) y en la velocidad de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta métricas de fidelidad y velocidad:

| Métrica | Valor |
|---|---|
| Divergencia KL frente a BF16 (TCQ4, tal como se distribuye) | 0,0415 |
| Divergencia KL frente a BF16 (TCQ4 con pesos densos de 8 bits) | 0,0398 |
| Divergencia KL frente a BF16 (P4 con pesos densos de 8 bits) | 0,0408 |
| Divergencia KL frente a BF16 (P3 con pesos densos de 8 bits) | 0,0600 |
| Divergencia KL frente a BF16 (P3 tal como se distribuye, densos 4 bits) | 0,182 |
| Divergencia KL frente a BF16 (P4 tal como se distribuye, densos 4 bits) | 0,169 |
| Decodificación en M4 Max (Metal) | 39,0 tokens/s |
| Decodificación en M4 Max tras prompt de 30.000 tokens | 38,8 tokens/s |
| Decodificación en RTX 4080 limitada a 12 GB (TCQ3) | 27 tokens/s |
| Decodificación en RTX 4080 con 16 GB (TCQ3) | 44 tokens/s |

Las mediciones de KL se hicieron en llama.cpp, sobre 64 ventanas de 2.048 tokens de wikitext-2, con la tabla PLE Q8_0 de Unsloth.

## Requisitos de hardware

- VRAM estimada: los expertos (62,3 GB en TCQ4) residen en RAM; la GPU solo cachea los expertos en uso. Se recomienda una GPU de 24 GB o más para PC, y 96-128 GB de RAM del sistema.
- Mac: 128 GB de memoria unificada para TCQ4; 96 GB para TCQ3-D4 si se necesitan contextos largos.
- GPU recomendadas: no hay una lista oficial, pero la model card cita pruebas en RTX 4080 (12 y 16 GB) y M4 Max. Para GPU de 24 GB o más se asume una GPU de gama alta de consumo o profesional.
- ¿Cabe en GPU de consumo? Sí, en el sentido de que el pack está diseñado para GPU de 24 GB o más con 96-128 GB de RAM; no cabe en una GPU de 12-16 GB sin el pack TCQ3 y 64 GB de RAM.
- Opciones de despliegue: motores NanoSeedLM (CUDA en Linux/Windows, Metal en macOS), mlx-vlm con Trust Remote Code, oMLX con el parche jundot/omlx#5112. El script de arranque levanta un servidor compatible con OpenAI en el puerto 8080.
- Latencia y throughput: 39,0 tokens/s en M4 Max (Metal); 38,8 tokens/s tras prompt de 30.000 tokens; 27 tokens/s en RTX 4080 limitada a 12 GB con TCQ3; 44 tokens/s con 16 GB. TCQ4 es aproximadamente un 15 % más lento que P3 en M4 Max porque lee 1,84 GB más por token.
- Tamaño de descarga: 127,5 GB para TCQ4.

## Comparativa con modelos similares

La comparación más directa es con los otros packs de la misma familia, todos derivados de Qwen3.8-Flash-Next:

| Pack | Bits por experto | Memoria (GB) | Descarga (GB) | KL tal como se distribuye | Pesos densos |
|---|---|---|---|---|---|
| TCQ4 | 4,125 | 70 | 127,5 | 0,0415 | 8 bits |
| TCQ3-D4 | 3,458 | 60 | 117,2 | 0,0638 | 8 bits |
| TCQ3 | 3,125 | 55 | 112,1 | 0,0778 | 8 bits |
| P4 | 4,500 | 74 | 131,3 | 0,169 | 4 bits |
| P3 | 4,000 | 66 | 123,8 | 0,182 | 4 bits |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- Es un "research preview": el autor lo etiqueta explícitamente como tal, y requiere runtimes específicos (NanoSeedLM, mlx-vlm con Trust Remote Code u oMLX con un parche concreto).
- La licencia es qwen-community-1.0, etiquetada como "other" en Hugging Face; es necesario revisar los términos del modelo base antes de cualquier uso comercial.
- La model card advierte de que con menos de 64 GB de RAM no hay ningún pack viable: los expertos deben caber en RAM.
- No se han publicado datos sobre sesgos, alucinación, idiomas soportados ni rendimiento en benchmarks estándar; no se puede evaluar la calidad del modelo base a partir de esta ficha.
- La divergencia KL de 0,0415 frente a BF16 implica una pérdida de fidelidad medible, aunque el autor la presenta como un 15 % inferior a los packs de Unsloth del mismo tamaño.
- El rendimiento depende fuertemente del hardware: en una RTX 4080 limitada a 12 GB la decodificación cae a 27 tokens/s frente a 44 tokens/s con 16 GB.
- La tabla PLE n-gram reside en disco y depende de la page cache, lo que puede introducir latencia variable según la carga del sistema.
- El recuento de parámetros de safetensors (72,8 B) no coincide con la cifra de 120,8 B de pesos de expertos de la model card; conviene verificar la configuración exacta antes de planificar el despliegue.
- No hay información sobre tool calling, agentes ni modo thinking, por lo que no se debe asumir su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Releases del motor NanoSeedLM: https://github.com/mbarnson/NanoSeedLM/releases
- Parche de oMLX: https://github.com/jundot/omlx/pull/5112
- Pack TCQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Pack TCQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Pack P4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Pack P3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3
- Referencias arXiv citadas en los tags: arxiv:2410.10714, arxiv:2406.11235 (sin título ni relación detallada en la información proporcionada)
