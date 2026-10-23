# wallawalla47/Ornith-1.5-122B-NVFP4-Infernix

## Resumen

Ornith-1.5-122B-NVFP4-Infernix es un artefacto de empaquetado y cuantización del modelo Ornith-1.5-122B de ornith-ai, preparado por el desarrollador independiente wallawalla47 para que se ejecute en el motor de inferencia Infernix, un motor en C++/CUDA escrito por el mismo autor. No es un modelo entrenado desde cero: es una conversión del checkpoint NVFP4 oficial de ornith-ai a un formato propietario (`.infernix`) que permite servir un modelo MoE de 122 000 millones de parámetros en una única GPU de consumo RTX 5090 de 32 GB, manteniendo en RAM del sistema los 12 288 expertos enrutados (60,75 GiB) y cacheando en VRAM únicamente los más solicitados (entre 4 450 y 4 850, una tasa de acierto del 74-80 %).

La arquitectura del modelo base es `Qwen3_5MoeForCausalLM` con la geometría Qwen3.5-122B-A10B: 48 capas, tamaño oculto de 3072, 256 expertos enrutados por capa con top-8, más un torre de visión que lo convierte en un modelo multimodal de tipo image-text-to-text. El artefacto incorpora además el drafter MTP del propio modelo, el drafter DFlash2 de Inco AI (Apache-2.0) para decodificación especulativa y una cabeza de propuesta Q4 para `--lm-head-draft`.

Su relevancia es fundamentalmente práctica: demuestra que un MoE de frontera abierta puede decodificar a 74-97 tok/s en hardware de un solo usuario, a costa de ~70 GiB de RAM de host y ~75 GB de disco. El propio autor advierte de que el soporte es preliminar, que el artefacto y la model card se generaron en gran medida con IA y que la calidad del modelo no se ha medido más allá de la verificación bit-exacta frente al checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Qwen3_5MoeForCausalLM`); 48 capas, hidden size 3072, 256 expertos enrutados por capa, top-8, más expertos compartidos; torre de visión |
| Parametros totales | 122 000 millones (denominación del modelo base; no se desglosa el recuento exacto en la información disponible) |
| Parametros activos | ~10 000 millones (derivado de la geometría A10B del nombre; no confirmado explícitamente) |
| Longitud de contexto | 262 144 tokens nativos según el repositorio de terceros `irr/ornith-1.5-122b`; en Infernix solo se retienen los primeros 32 768 tokens de KV al arrancar y el resto se sirve desde la caché de expertos |
| Tipos de cuantizacion | NVFP4 en expertos enrutados y compartidos (palabras NVFP4, escalas de bloque y multiplicadores); FP8 E4M3 con escalado por fila en atención, GDN y proyecciones de salida; Q4/Q8 en los drafters; Q4 en la cabeza de propuesta |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base Ornith-1.5-122B); drafter DFlash2 bajo Apache-2.0; el motor Infernix tiene licencia propia en su repositorio |
| Formato de pesos | `.infernix` en tres fragmentos: 32 000 000 000 + 32 000 000 000 + 11 331 296 516 bytes (≈ 75,3 GB; ≈ 70,2 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) disperso con 48 capas, dimensión oculta de 3072 y 256 expertos enrutados por capa activando los 8 principales (top-8), lo que da un total de 12 288 expertos enrutados en todo el modelo. A esto se suma una torre de visión que habilita la entrada image-text-to-text. La conversión de Infernix aplica la receta `qwen3_5_moe_nvfp4_modelopt` sobre los componentes de texto, MTP, visión y DFlash2, más una cabeza de propuesta. El proceso se verificó con `python -m tools.convert.verify_qwen3_5` comparando el artefacto contra el checkpoint palabra por palabra: 12 336 registros de expertos, 1 178 tensores y 240 escalas de entrada FP8 sin discrepancias. Son bit-exactos respecto al checkpoint todos los expertos enrutados y compartidos, las proyecciones de atención, GDN y salida en FP8 E4M3 con escalado por fila (incluidas sus escalas de entrada), el router, las normas, los embeddings y la torre de visión. Solo se recuantizan los 777 tensores del drafter MTP y los 55 del drafter DFlash2 (a Q4 y Q8), además de la cabeza de propuesta Q4 de 131 072 filas construida a partir de la cabeza de salida.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron RLHF, DPO u otras técnicas de alineación. La web de Ornith AI describe el modelo como parte de un bucle de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de solución, extendiendo el marco de self-scaffolding de Ornith 1.0. Es una afirmación del desarrollador, no un detalle técnico verificable en la información proporcionada.

En el lado de la inferencia, las innovaciones relevantes son de sistema más que de modelo: offloading híbrido de expertos con caché en VRAM y cómputo parcial en CPU de los fallos de cada capa mientras la GPU lee el resto por PCIe; decodificación especulativa con MTP (`--spec mtp --draft-tokens 2`, verificando solo los borradores con confianza suficiente para pagar sus expertos) o con el drafter DFlash2 (`--spec dflash2`); y rutas deterministas `--reproducible` (bit-exacta) y `--lossless` (redondeo correcto, ~5 tok/s).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat y ajustes de muestreo recomendados por el autor: temperature 1.0, top-p 0.95, top-k 20, min-p 0, presence penalty 1.5, idénticos en ambos modos de razonamiento.
- Modo de razonamiento ("thinking modes", en plural en la model card): el autor menciona dos modos, aunque no detalla sus nombres ni diferencias.
- Comprensión de imágenes: pipeline `image-text-to-text` con torre de visión incluida en el artefacto, en cuantización bit-exacta respecto al checkpoint.
- Razonamiento y descomposición de tareas: la documentación de ornith-ai la cita como capacidad destacada ("task decomposition"), sin datos de benchmark que la respalden en la información disponible.
- Decodificación especulativa integrada (MTP y DFlash2), que acelera la generación sin cambiar los pesos objetivo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas explícitamente para este artefacto; el discurso de ornith-ai sobre generación de andamiajes y rollouts sugiere uso agéntico, pero no se aportan detalles de implementación.
- Capacidades multilingües: no disponible; los metadatos de HuggingFace no declaran idiomas.
- Audio: no disponible (no se menciona ningún codificador de audio).

## Casos de uso

- Asistencia conversacional local con contexto largo: el modelo mantiene diálogos multi-turno sobre ventanas de hasta 262 144 tokens (32 768 de KV residentes y el resto servidos desde la caché de expertos), lo que permite adjuntar documentación extensa sin fragmentar en trozos pequeños.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas de pantalla, diagramas, facturas escaneadas o gráficas junto al texto, en un flujo totalmente local sin salida de datos a la nube.
- Generación y revisión de código en un puesto de trabajo individual: con 122 000 millones de parámetros totales y ~10 000 millones activos, la decodificación a 74-97 tok/s es suficiente para autocompletado interactivo y refactorizaciones, siempre que se acepte la latencia de prefill (1 750 tok/s con prompt de 4K).
- Procesamiento batch nocturno: la ruta `--lossless` (~5 tok/s) o la bit-exacta `--reproducible` permiten trabajos de clasificación, resumen o extracción de datos donde prima la reproducibilidad sobre la latencia.
- Investigación sobre MoE con offloading: el artefacto y el documento de diseño de Infernix sirven como banco de pruebas reproducible para medir el impacto de la caché de expertos, la tasa de acierto y el ancho de banda PCIe en el throughput.
- Servicio HTTP interno con `infernix-serve --max-context 32768`: adecuado para un equipo pequeño que necesite una API compatible con prompts largos sin depender de proveedores externos, asumiendo una sola GPU y una sola instancia.
- Evaluación comparativa de motores: al ser bit-exacto frente al checkpoint NVFP4 oficial, permite contrastar la salida de Infernix contra otras implementaciones (llama.cpp, Ollama) sin que la cuantización introduzca diferencias.
- Prototipado de asistentes multimodales en un RTX 5090: útil para validar producto antes de invertir en hardware de centro de datos, con la advertencia de que el rendimiento aún está en fase de optimización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que "la calidad no se ha medido más allá de la comparación bit-exacta" con el checkpoint. Los únicos datos medidos son de velocidad, en una RTX 5090 con i9-13900K, 96 GB DDR5, PCIe 5.0 x8, KV en bf16 y una sola petición:

| Medida | Resultado |
|---|---|
| Decodificación plana, greedy (tg256 tras prompt de 512 tokens) | 90-97 tok/s |
| Decodificación plana, petición muestreada con los ajustes recomendados | 74-78 tok/s |
| MTP con 2 borradores, misma petición muestreada | 78-81 tok/s |
| Prefill con prompt de 4K | 1 750 tok/s |
| Prefill con prompt de 32K | 6 500 tok/s |
| Ruta `--lossless` (redondeo correcto) | ~5 tok/s |
| Tasa de acierto de la caché de expertos en VRAM | 74-80 % (4 450-4 850 expertos) |

La decodificación depende del texto de entrada a través de la proporción de expertos ya residentes en VRAM, porque está limitada por los bytes de los expertos que faltan y deben leerse por PCIe.

## Requisitos de hardware

- GPU: RTX 5090 de 32 GB o cualquier GPU `sm_120a` (Blackwell) con 32 GB. El artefacto no cabe en VRAM: los 12 288 expertos (60,75 GiB) residen en RAM de host paginada (pinned) y solo una caché de expertos calientes ocupa la VRAM.
- RAM de host: ~70 GiB libres para el modo "todo en RAM". Con menos, el libro mayor de RAM retiene tantos expertos como quepan y lee el resto desde el artefacto (nivel de expertos en SSD); el reparto se controla con `--expert-ram-mib`. En Windows, la memoria paginada está limitada al 80 % de la RAM total.
- Disco: ~75 GB para los tres fragmentos `.infernix` más el informe de conversión.
- Software: compilación de Infernix desde `main` en el commit `5069e375` o posterior; comandos `infernix` e `infernix-serve`.
- Opciones de despliegue documentadas: Infernix (CLI y servidor HTTP). Para el modelo base NVFP4 existen alternativas en Ollama (`ornith-1.5:122b-nvfp4`) y en llama.cpp con Vulkan/RADV sobre AMD Strix Halo (gfx1151, 128 GB de memoria unificada, contexto nativo completo); vLLM y TGI no aparecen en la información disponible para este artefacto.
- Throughput y latencia: ver tabla de la sección anterior. El autor señala que el soporte es preliminar y que las velocidades cambiarán al optimizar el motor.

## Comparativa con modelos similares

| Modelo / artefacto | Parámetros | Contexto | Cuantización / formato | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|---|
| `wallawalla47/Ornith-1.5-122B-NVFP4-Infernix` (este) | 122 000 M totales, ~10 000 M activos | 262 144 nativos; 32 768 de KV residentes en Infernix | NVFP4 + FP8 E4M3; formato `.infernix` | MIT (modelo); Apache-2.0 (drafter DFlash2) | 1× RTX 5090 32 GB + ~70 GiB RAM + ~75 GB disco | Añade MTP, DFlash2 y cabeza de propuesta; verificación bit-exacta |
| `ornith-ai/Ornith-1.5-122B-NVFP4` (base) | 122 000 M totales, ~10 000 M activos | 262 144 nativos (según repo de terceros) | NVFP4; safetensors (repo de 77,7 GB) | MIT | No especificado en la información disponible | Checkpoint de referencia; sin datos de velocidad publicados aquí |
| `ornith-1.5:122b-nvfp4` (Ollama) | 122 000 M totales, ~10 000 M activos | No disponible | NVFP4; formato Ollama | MIT | Tarjeta NVIDIA DGX única según la descripción de Ollama | Empaquetado listo para usar; sin benchmarks en la información disponible |
| `irr/ornith-1.5-122b` (llama.cpp Vulkan) | 122 000 M totales, ~10 000 M activos | 262 144 nativos completos | No disponible (cuantización para llama.cpp) | MIT (modelo) | AMD Strix Halo gfx1151 con 128 GB de memoria unificada | Enfoque alternativo basado en memoria unificada en lugar de offloading por PCIe |

No se dispone de datos de benchmarks (MMLU, HumanEval, GSM8K u otros) para ninguno de los artefactos comparados en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, formato, licencia y requisitos de hardware.

## Limitaciones y advertencias

- Soporte preliminar declarado por el propio autor: el modelo funciona y está verificado, pero las optimizaciones siguen en curso y las velocidades cambiarán.
- El artefacto, la receta de conversión, el motor y buena parte de la model card se generaron con IA (mayormente Claude Opus 5.5), según el aviso del autor, que lo califica de trabajo de aficionado y probablemente incompleto o no del todo exacto.
- Calidad no evaluada: no hay benchmarks ni evaluación humana publicada; la única garantía es la equivalencia bit-exacta con el checkpoint en los tensores verificados.
- Dependencia dura del hardware: requiere GPU Blackwell `sm_120a` con 32 GB y ~70 GiB de RAM de host; sin ese margen se degrada al nivel de expertos en SSD, con caída de rendimiento no cuantificada en la información disponible.
- Rendimiento variable según el texto: la velocidad depende de la tasa de acierto de la caché de expertos (74-80 %), limitada por el ancho de banda PCIe. El sistema de prueba usa PCIe 5.0 x8; un enlace más estrecho reducirá el throughput.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe sin verificación previa.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos y aquí no hay evaluación que lo acote.
- Sesgos: no documentados. Al no haber model card del modelo base incluida en la información proporcionada, no se pueden enumerar sesgos conocidos ni mitigaciones.
- Licencia: el modelo base se declara MIT, lo que permite uso comercial; sin embargo, el drafter DFlash2 es Apache-2.0 (requiere atribución, incluida en `NOTICE`) y el motor Infernix tiene su propia licencia, que debe revisarse por separado antes de un despliegue en producción.
- Sin soporte documentado de tool calling ni de flujos agénticos: no se debe asumir su disponibilidad sin pruebas propias.
- Cifras de rendimiento obtenidas con una sola petición y un hardware concreto; no hay datos de concurrencia, throughput agregado ni latencia bajo carga.
- Huella de disco y RAM elevada (~75 GB y ~70 GiB) para un único puesto de trabajo; conviene planificar la caché de página y el arranque en frío.

## Enlaces

- Página de HuggingFace del artefacto: https://huggingface.co/wallawalla47/Ornith-1.5-122B-NVFP4-Infernix
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-122B-NVFP4
- Modelo original Ornith-1.5-122B (licencia MIT): https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Drafter DFlash2: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Repositorio del motor Infernix: https://github.com/Wallawalla47/Infernix
- Documento de diseño del offloading para Qwen3.5-122B: https://github.com/Wallawalla47/Infernix/blob/main/docs/maintainer/qwen3_5-122b-offload-design.md
- Guía de uso de Infernix con el modelo: https://github.com/Wallawalla47/Infernix/blob/main/docs/qwen3_5-122b.md
- Repositorio de terceros para llama.cpp Vulkan en Strix Halo: https://github.com/irr/ornith-1.5-122b/blob/main/README.md
- Entrada en Ollama: https://ollama.com/library/ornith-1.5:122b-nvfp4
- Colección Ornith-1.5 en HuggingFace: https://huggingface.co/collections/ornith-ai/ornith-15
- Web del desarrollador del modelo base: https://ornith.ai/
