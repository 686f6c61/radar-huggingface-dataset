# wallawalla47/Qwen3.8-27B-Quasar-NVFP4-NInferV3

## Resumen

Qwen3.8-27B-Quasar-NVFP4-NInferV3 es un artefacto cuantizado de un solo fichero (`.ninfer`, formato NInfer V3) construido por el usuario wallawalla47 a partir del punto de control QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4. No es un modelo entrenado desde cero: es una derivación de despliegue que importa de forma bit-exacta los pesos NVFP4 ya entrenados con QAT del modelo base y les añade los componentes de decodificación especulativa del motor (draft model DFlash2, cabeza de propuesta indexada y torre MTP) para que funcione con las rutas de decodificación rápidas de Infernix y NInfer. Está pensado para ejecutarse en una NVIDIA RTX 5090 (sm_120a) y el repositorio ocupa 21,6 GB.

El backbone es el de la familia Qwen3.5: 64 capas que combinan Gated Delta-Net (atención lineal) con atención completa cada cuatro capas, dimensión oculta 5120, vocabulario de 248 320 tokens y contexto nativo de 262 144 tokens. Incluye torre de visión qwen3_5_vision de profundidad 27, por lo que la tarea declarada en el pipeline es `image-text-to-text`, además de razonamiento, modo *thinking*, uso agéntico y decodificación especulativa (MTP y DFlash2).

Su relevancia es de nicho pero clara: permite servir un modelo multimodal de ~27 000 millones de parámetros en cuantización FP4 (W4A4) sobre hardware Blackwell de consumo, con los pesos QAT importados sin ida y vuelta de recuantización y con un requisito de VRAM de unos 20 GB. El repositorio tiene 151 descargas y 0 *likes*, y no se han publicado resultados de benchmarks de calidad del modelo en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone híbrido de la familia Qwen3.5: 64 capas con Gated Delta-Net (atención lineal) y atención completa cada 4 capas; torre de visión qwen3_5_vision (profundidad 27); torre MTP; draft model DFlash2 de 5 capas con atención deslizante (ventana 2048, selector *rank* 256 / top-16) |
| Parametros totales | ~27 000 millones (según la denominación Qwen3.8-27B del nombre; la model card no detalla el recuento exacto). Dimensión oculta 5120, vocabulario 248 320 |
| Parametros activos | no aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (W4A4, 256 objetos), Q8 agrupado `q8_g32_fp16` (6), Q4 agrupado `q4_g64_fp16` con `grouped_absmax` (1), BF16 (646), FP32 (96), INT32 (1 tabla de índices de tokens). Censo sobre 1006 objetos de pesos preparados, de un total de 1590 objetos en el fichero |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | artefacto único `.ninfer` (NInfer V3); el modelo base usa compressed-tensors `nvfp4-pack` |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una conversión construida con `tools/convert/quasar_nvfp4.py` de la rama `master` de Wallawalla47/ninfer-custom, y el informe por tensor (`qwen3_8_27b_nvfp4-quasar-proposal.ninfer.conversion.json`) se incluye en el repositorio. La fuente dominante es QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, del que se importan en forma codificada NVFP4, bit-exacta y sin recuantizar, las 256 proyecciones lineales cuantizadas (query/key/value/z de GDN, gate/up del MLP y proyecciones de atención completa). En tiempo de ejecución, los kernels W4A4 NVFP4 del motor desquantizan los pesos al vuelo contra las escalas de bloque almacenadas y cuantizan las activaciones dentro del kernel. El componente DFlash2 se injerta tal cual desde el artefacto oficial de NInfer (`qwen3_8_27b_nvfp4-official.ninfer`, id de artefacto `3aec71e9…`) para que la ruta especulativa DFlash2 funcione sobre el backbone QUASAR.

Hay tres tratamientos adicionales que conviene tener presentes. La cabeza de propuesta indexada contiene 131 072 filas extraídas del `lm_head` de QUASAR, ordenadas por frecuencia y almacenadas en Q4 agrupado más una tabla INT32 de identificadores de token; es lo que sirve las propuestas con `--lm-head-draft`. La capa MTP y el `lm_head` compartido se recuantizan a Q8 agrupado porque la operación MTP fusionada del motor exige Q8 con n=1024, y como la torre MTP comparte `text/output_head` con el modelo principal, los logits de este último pasan también al kernel Q8 n248320_k5120. Por último, las proyecciones a/b de GDN eran NVFP4 en el origen, pero el layout de almacenamiento NVFP4 v3 requiere teselas de 128 filas y estos tensores tienen 48 filas, así que el conversor las sube a BF16 (un *upcast* de los mismos valores, no una recuantización). La afirmación del autor es que la única recuantización real es la de BF16 a Q8 de MTP y `lm_head`, y que la calidad del modelo base se preserva por construcción.

## Capacidades

- Generación de texto y razonamiento: la model card etiqueta el artefacto con `reasoning` y `thinking`, es decir, modo de razonamiento extendido.
- Codificación agéntica: el escenario de referencia medido por el autor es un *replay* de coding agéntico sobre el modelo de 27B.
- Multimodal de entrada: pipeline `image-text-to-text` con torre qwen3_5_vision de profundidad 27, para entrada de imagen y vídeo.
- Contexto largo: 262 144 tokens nativos, con caché de prefijo en el motor (90 % de los tokens de prompt servidos desde caché en la prueba citada).
- Decodificación especulativa: soporte de MTP (torre MTP acompañante) y de DFlash2 mediante `--spec dflash2`.
- Borrador por cabeza de propuesta: `--lm-head-draft` sobre la cabeza indexada de 131 072 filas, orientada a propuestas con mucho copiado.
- Uso agéntico y multi-paso: etiqueta `agentic` en el repositorio (no se detalla el soporte concreto de *tool calling* ni de *function calling* en la información disponible).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente de codificación agéntica en local: el escenario medido por el autor es precisamente un *replay* de coding agéntico; con 262 144 tokens de contexto y caché de prefijo, el modelo puede mantener el estado de un repositorio y encadenar pasos de edición sin reenviar todo el *prompt* al prefill.
- Servicio de inferencia con decodificación especulativa: activando `--spec dflash2` o la ruta MTP se reduce el coste por token generado, lo que resulta adecuado para *chatbots* de uso continuado sobre una única RTX 5090.
- Análisis de documentos largos con imágenes: al ser `image-text-to-text` con 262 144 tokens de contexto, permite procesar informes, planos o capturas junto con su texto asociado en una sola pasada.
- Prototipado e investigación en cuantización FP4: el repositorio incluye el informe de conversión por tensor, de modo que sirve como referencia reproducible para estudiar la importación bit-exacta de pesos NVFP4 entrenados con QAT.
- Estación de trabajo de un solo usuario con GPU de consumo: con unos 20 GB de VRAM para los pesos, encaja en una RTX 5090 sin necesidad de clúster ni de API externa, útil cuando hay requisitos de privacidad de datos.
- Evaluación comparativa de motores de inferencia: el artefacto funciona con Infernix, NInfer y ninfer-custom, por lo que permite medir diferencias de *prefill* y de tiempo hasta el primer token sobre un mismo punto de control.
- Razonamiento con modo *thinking* en tareas de varios pasos: para problemas que requieren descomposición explícita antes de la respuesta final, siempre que se acepte el coste adicional de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos del repositorio son mediciones del motor sobre el artefacto oficial de 27B de NInfer:

| Metrica | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K y similares | no publicados |
| Tokens de prompt servidos desde caché de prefijo (replay de coding agéntico, 27B) | 90 % |
| Tiempo hasta el primer token (Infernix frente a NInfer) | aproximadamente la mitad del tiempo medio de NInfer |
| Velocidad de prefill en prompts largos (Infernix frente a NInfer) | 1,3-1,5 veces más rápido |
| Calidad | igual que NInfer según el autor (sin métrica publicada) |

## Requisitos de hardware

- VRAM estimada: unos 20 GB solo para los pesos del artefacto (21,6 GB de repositorio), más el espacio de trabajo de contexto y caché KV.
- GPU: se construyó y ajustó en una NVIDIA RTX 5090 con arquitectura sm_120a; el repositorio indica que se requiere una GPU NVIDIA de la serie RTX 50. Los kernels NVFP4 W4A4 no están descritos para generaciones anteriores.
- Cabe en GPU de consumo: sí, en RTX 5090 y, en general, en la serie RTX 50 según la model card. No hay datos para GPUs Hopper, Ampere o consumer de gama inferior.
- Opciones de despliegue: Infernix (recomendado, con binarios precompilados para Windows en su página de *releases*), NInfer y ninfer-custom. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.ninfer` no es un formato estándar de esos motores.
- Latencia y throughput: en el *replay* agéntico citado, Infernix alcanza el primer token en aproximadamente la mitad del tiempo medio de NInfer y prefija prompts largos entre 1,3 y 1,5 veces más rápido, con la misma calidad. No se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Componentes especulativos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wallawalla47/Qwen3.8-27B-Quasar-NVFP4-NInferV3 | `.ninfer` único (NInfer V3) | 262 144 | MTP, DFlash2, cabeza de propuesta de 131 072 filas | apache-2.0 | 151 descargas, 0 *likes* |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (modelo base) | compressed-tensors `nvfp4-pack` | no disponible | no indicado | no disponible | no disponible |
| Artefacto oficial de NInfer (`qwen3_8_27b_nvfp4-official.ninfer`, id `3aec71e9…`) | `.ninfer` | no disponible | DFlash2 (origen del componente injertado) | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos de la misma categoría (modelos multimodales de ~27 000 millones en FP4 para Blackwell) en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con terceros.

## Limitaciones y advertencias

- No hay ninguna evaluación de calidad independiente publicada: ni MMLU, ni HumanEval, ni GSM8K. Las únicas cifras son mediciones internas del motor realizadas por el propio autor.
- El artefacto depende de hardware muy concreto: sm_120a (serie RTX 50). No es portable a GPUs Hopper o Ampere ni a aceleradores de otros fabricantes.
- El formato `.ninfer` es propietario de la familia de motores NInfer/Infernix; no se puede cargar en vLLM, llama.cpp, Ollama o TGI sin conversión adicional.
- El repositorio tiene 0 *likes* y 151 descargas, mantenido por un único autor, con binarios precompilados fundamentalmente para Windows. El riesgo de soporte y de continuidad del proyecto es alto.
- La licencia declarada es apache-2.0, pero conviene verificar la licencia y las condiciones del modelo base QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 antes de un uso comercial, ya que la información sobre esta no está disponible en los datos consultados.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano.
- Un modelo de este tamaño en cuantización de 4 bits mantiene el riesgo habitual de alucinación, agravado por la ausencia de benchmarks que cuantifiquen la pérdida de calidad frente al modelo sin cuantizar; el autor afirma que la importación bit-exacta preserva la calidad, pero no lo demuestra con métricas.
- La recuantización a Q8 de la capa MTP y del `lm_head` compartido es el único paso con pérdida potencial declarado, y afecta a los logits del modelo principal.
- No se documentan sesgos conocidos, comportamiento en *tool calling* ni límites de la torre de visión en la información disponible.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados no guardan relación con él y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wallawalla47/Qwen3.8-27B-Quasar-NVFP4-NInferV3
- Modelo base: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Motor recomendado (Infernix): https://github.com/Wallawalla47/Infernix
- Benchmarks de Infernix frente a NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Repositorio de conversión (rama master): https://github.com/Wallawalla47/ninfer-custom/tree/master
- Script de conversión: https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/quasar_nvfp4.py
- Informe de conversión incluido en el repositorio: `qwen3_8_27b_nvfp4-quasar-proposal.ninfer.conversion.json`
- Identificador arXiv citado en las etiquetas del repositorio: arXiv:2608.13966 (no se ha verificado el enlace)
- Búsqueda web: sin resultados relevantes para este modelo
