# ToPo-ToPo/Ornith-1.5-122B-mlx-8bit

## Resumen

Ornith-1.5-122B-mlx-8bit es una conversión cuantizada a 8 bits del modelo multimodal `ornith-ai/Ornith-1.5-122B`, publicada por el usuario ToPo-ToPo para su ejecución en Apple Silicon mediante la librería MLX y el stack `mlx-vlm`. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: toma los pesos oficiales en bf16 y los reempaqueta con cuantización afina de 8 bits y grupo de 64, incluyendo las puertas del router del MoE, hasta un total de 8,36 bits por peso. El checkpoint conserva la torre de visión (333 tensores) y los procesadores de imagen y vídeo, por lo que mantiene la entrada multimodal del modelo original.

El modelo subyacente es un transformer con mezcla de expertos (MoE) de 122.562.817.776 parámetros, correspondiente a la clase `Qwen3_5MoeForConditionalGeneration`, con pipeline `image-text-to-text`. Su relevancia práctica es acotada pero clara: permite ejecutar un modelo de más de 120.000 millones de parámetros en una estación de trabajo Apple Silicon de memoria unificada muy grande, sin GPU NVIDIA ni clúster, manteniendo capacidades de tool calling multi-paso y visión.

La validación documentada por el autor se limita a un Apple M3 Ultra con 256 GB de memoria unificada, sirviendo el modelo a través de `local-llm-server` con backend `mlx-vlm` 0.7.9 y el drafter MTP publicado por separado, con una velocidad de decodificación de 29 a 44 tokens por segundo y unos 130 GB residentes. No hay benchmarks publicados ni evaluación cuantitativa de la pérdida de calidad frente al bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), clase `Qwen3_5MoeForConditionalGeneration`, con torre de visión |
| Parametros totales | 122.562.817.776 (~122,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afina de 8 bits, tamano de grupo 64, puertas del router incluidas; 8,36 bits/peso efectivos |
| Idiomas soportados | no disponible (se ha validado chat en japones; el resto sin documentar) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (repo de 130,7 GB) |
| Biblioteca | mlx / mlx-vlm (conversion con mlx-vlm 0.7.6, mlx 0.32.3; validado con mlx-vlm 0.7.9) |
| Pipeline | image-text-to-text |
| Modelo base | ornith-ai/Ornith-1.5-122B (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint original: un transformer con mezcla de expertos (MoE) de 122.600 millones de parámetros totales, adaptado para entrada multimodal mediante una torre de visión y procesadores de imagen y vídeo incluidos en el propio checkpoint. Esta conversión no altera la topología ni el enrutamiento, solo el formato y la precisión de los pesos. La cuantización es afina de 8 bits con grupo de 64 y afecta también a las puertas del router, un detalle relevante porque la cuantización de las puertas puede alterar la distribución de expertos y, con ella, el comportamiento del modelo respecto al bf16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo original pasó por RLHF, DPO u otras fases de alineamiento. Sí se documenta una innovación operativa: el modelo original incorpora cabezas de predicción multi-token (MTP), que esta conversión **no incluye** y que se publican por separado como drafter `ToPo-ToPo/Ornith-1.5-122B-MTP-bf16`; usadas en conjunto habilitan decodificación especulativa en `mlx-vlm`, que es lo que explica el rango de 29 a 44 tokens/s reportado.

## Capacidades

- Generación de texto conversacional multi-turno, con el rendimiento propio de un MoE de 122.600 millones de parámetros totales.
- Entrada de imagen y vídeo: el pipeline es `image-text-to-text` y la conversión conserva la torre de visión (333 tensores) y los procesadores multimodales.
- Tool calling y function calling multi-paso: validado explícitamente por el autor ("multi-step tool calling worked").
- Decodificación especulativa mediante el drafter MTP externo, con `--draft-kind mtp` en `mlx_vlm.generate`.
- Capacidad multilingüe: solo el japonés está verificado en la validación del autor; el resto de idiomas figura como no disponible.
- Ejecución íntegramente local en Apple Silicon, sin dependencia de CUDA ni de servicios en la nube.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- **Asistencia de código en estación de trabajo Apple Silicon**: un estudio o equipo pequeño puede desplegar el modelo en un Mac Studio o Mac Pro con memoria unificada de 256 GB y usarlo como asistente de programación local, sin enviar código propietario a terceros y con tool calling para leer ficheros o ejecutar comandos a través de un agente.
- **Procesamiento de documentos con componentes gráficos**: gracias a la torre de visión conservada, el modelo puede extraer información de facturas escaneadas, diagramas de arquitectura o capturas de pantalla y devolver JSON estructurado, todo dentro de la máquina del cliente.
- **Agentes locales con herramientas**: el tool calling multi-paso validado permite construir flujos de agente que encadenan consultas a APIs internas, lectura de bases de datos y escritura de informes, con la ventaja de que el contexto completo nunca sale del dispositivo.
- **Trabajo con datos regulados (sanidad, legal, sector público)**: al ejecutarse de forma totalmente offline en hardware de sobremesa, encaja en escenarios donde el cumplimiento impide usar APIs externas, siempre que el equipo asuma el coste del hardware y la ausencia de benchmarks formales.
- **Evaluación y comparación de cuantizaciones**: sirve como referencia práctica para investigadores que quieran medir la degradación de un MoE de 122 B al pasar de bf16 a 8 bits afines, comparando contra el checkpoint original o el drafter MTP en bf16.
- **Prototipado de producto multimodal sin GPU NVIDIA**: permite validar una idea de producto basada en visión y lenguaje antes de comprometer presupuesto en clústeres con A100/H100, a coste de un rendimiento de decodificación de decenas de tokens por segundo.
- **Atención al cliente interna en japonés**: es el único idioma con validación empírica documentada por el autor, por lo que es un candidato razonable para un piloto de soporte en esa lengua antes de ampliar a otros idiomas sin verificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento medido es la velocidad de decodificación en la configuración validada por el autor: 29-44 tokens/s sobre Apple M3 Ultra de 256 GB con el drafter MTP, con aproximadamente 130 GB de memoria residente. No hay cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba estandarizada, ni para esta conversión ni para el modelo base en la información facilitada.

## Requisitos de hardware

- **Peso de los pesos**: 130,6 GB en disco (8,36 bits/peso), dentro de un repositorio de 130,7 GB.
- **Memoria unificada**: la ejecución validada ocupa unos 130 GB residentes; se recomienda un equipo con 192-256 GB de memoria unificada para dejar margen al contexto, al procesador de visión y al drafter MTP. La cifra de 192 GB es una estimación de margen, no una configuración probada por el autor.
- **Hardware validado**: Apple M3 Ultra con 256 GB.
- **GPU NVIDIA**: no aplicable. El formato MLX está pensado para Apple Silicon y este checkpoint no se carga en CUDA; además, 130 GB no caben en una A100 de 80 GB ni en una H100 de 80 GB sin fragmentar el modelo.
- **GPU de consumo**: no cabe en ninguna GPU consumer (RTX 4090 con 24 GB, 3090 con 24 GB, etc.).
- **Opciones de despliegue**: `mlx-vlm` (carga con `mlx_vlm.load` y CLI `mlx_vlm.generate`), y `local-llm-server` con backend `mlx-vlm` 0.7.9, que es la vía usada en la validación. vLLM, TGI y llama.cpp no consumen pesos en formato MLX; requerirían una conversión previa a otro formato, no documentada aquí.
- **Throughput y latencia**: 29-44 tokens/s de decodificación con drafter MTP en M3 Ultra. Sin drafter no se reporta cifra. No hay datos de latencia de prefill ni de throughput con imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToPo-ToPo/Ornith-1.5-122B-mlx-8bit | 122,6 B (MoE) | no disponible | 8 bits afines, grupo 64 (8,36 bits/peso) | MIT | Publico en HF, 0 descargas, 1 like |
| ornith-ai/Ornith-1.5-122B (base) | 122,6 B (MoE) | no disponible | bf16 | MIT | Publico en HF |
| ToPo-ToPo/Ornith-1.5-122B-MTP-bf16 (drafter) | no disponible | no disponible | bf16 | no disponible | Publico en HF; complemento, no alternativa |
| Alternativas de terceros de tamano y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~120 B con soporte MLX) en el material proporcionado, por lo que la comparación se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- **Sin evaluación de calidad**: no hay benchmarks que cuantifiquen la degradación frente al bf16. La cuantización de 8 bits afecta también a las puertas del router, lo que puede cambiar qué expertos se activan y alterar el comportamiento de forma no trivial.
- **Artefacto de comunidad**: 0 descargas y 1 like en el momento de la ficha; no es una publicación oficial del autor del modelo base. Conviene verificar la integridad de los pesos antes de usarlo en producción.
- **Dependencia de Apple Silicon**: el formato MLX solo se carga con `mlx`/`mlx-vlm`; no hay ruta directa a vLLM, TGI ni llama.cpp sin reconversión.
- **Contexto desconocido**: no se documenta la longitud de contexto soportada, un dato crítico para dimensionar memoria y para casos de uso con documentos largos.
- **Idiomas sin verificar**: solo el japonés se ha probado; el rendimiento en castellano, inglés u otros idiomas no está documentado.
- **Visión no validada empíricamente**: la torre se conserva en el checkpoint, pero la prueba del autor solo menciona chat en japonés y tool calling; no hay evidencia publicada de calidad en tareas de imagen o vídeo tras la cuantización.
- **MTP no incluido**: sin el drafter externo se pierde la decodificación especulativa, y con él se añade otro checkpoint a cargar (impacto en memoria).
- **Riesgo de alucinación**: inherente a los modelos generativos; no hay informes de mitigación ni evaluaciones de fidelidad para esta conversión.
- **Licencia**: MIT, permisiva y compatible con uso comercial, pero conviene revisar el fichero LICENSE del modelo base para confirmar condiciones de atribución de los pesos originales.
- **Throughput modesto para producción interactiva**: 29-44 tokens/s es adecuado para uso individual o por turnos, no para servir a muchos usuarios concurrentes desde un solo equipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToPo-ToPo/Ornith-1.5-122B-mlx-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Drafter MTP (bf16): https://huggingface.co/ToPo-ToPo/Ornith-1.5-122B-MTP-bf16
- Herramienta de conversion y servido: `mlx-vlm` 0.7.6 / 0.7.9 y `local-llm-server` (mencionados en la model card; no se han encontrado URL verificables en la busqueda web)
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los resultados correspondian a publicaciones y servicios sin relacion (revista Topo, diccionario Larousse, TopoExport, cartes.gouv.fr, Topo Athletic).
