# teamup-tech/Demucs-weights

## Resumen

`teamup-tech/Demucs-weights` no es un modelo de lenguaje ni un modelo generativo de texto: es un **espejo de pesos preentrenados de Demucs**, el sistema de separación de fuentes musicales publicado por Meta (FAIR). El repositorio recopila nueve checkpoints de tres variantes (`htdemucs`, `mdx_extra` y `mdx_extra_q`) que el paquete `demucs` descarga por defecto desde el servidor de Meta (`dl.fbaipublicfiles.com/demucs/`). El motivo del espejo es operativo: permitir que la herramienta funcione sin depender de ese servidor, por ejemplo en el Space `teamup-tech/Demucs` o en entornos con salida a internet restringida.

Cada archivo conserva la ruta y el nombre que espera `torch.hub`; la segunda mitad del nombre (`955717e8-8726e21a`, `e51eebcc-c1b80bdd`, etc.) es el prefijo del SHA-256 del propio checkpoint, que la librería verifica al cargarlo. Esto hace que el espejo sea intercambiable con el original sin cambios de código, siempre que se respete la estructura de directorios.

Su relevancia es, por tanto, de infraestructura y reproducibilidad, no de investigación: no hay pesos nuevos, ni fine-tuning, ni versión mejorada de Demucs. El repositorio ocupa 0,9 GB, tiene licencia MIT (la de Demucs) y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes. La model card es puramente descriptiva y no aporta datos de entrenamiento, parámetros ni evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Demucs (separación de fuentes de audio). `htdemucs`: Hybrid Transformer Demucs, con rama temporal (waveform) y rama espectral unidas por un transformer. `mdx_extra` y `mdx_extra_q`: bag (ensemble) de 4 modelos de la receta MDX de Demucs |
| Parámetros totales | no disponible (la model card no publica recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); la inferencia trocea el audio en segmentos configurables |
| Tipos de cuantización | existe una variante cuantizada (`mdx_extra_q`, "the same bag quantized"); el esquema exacto no se detalla en la model card |
| Idiomas soportados | no aplica (entrada y salida son audio; no hay componente de texto ni multilingüe) |
| Licencia | MIT (Demucs, Meta) |
| Formato de pesos | checkpoints PyTorch en `.th`, cargados vía `torch.hub`; no hay safetensors, GGUF, ONNX ni MLX |
| Tarea | separación de fuentes en 4 stems (batería, bajo, otros, voz), según la documentación de Demucs |
| Checkpoints incluidos | 9 archivos: `hybrid_transformer/955717e8-8726e21a.th`; `mdx_final/{e51eebcc-c1b80bdd, a1d90b5c-ae9d2452, 5d2d6c55-db83574e, cfa93e08-61801ae1}.th`; `mdx_final/{83fc094f-4a16d450, 464b36d7-e5a9386e, 14fc6a69-a89dd0ee, 7fd6ef75-a905dd85}.th` |
| Verificación de integridad | el segundo segmento del nombre de archivo es el prefijo del SHA-256 que comprueba `torch.hub` |
| Tamaño del repositorio | 0,9 GB |
| Metadatos del repo | creado el 2026-10-23, actualizado el 2026-10-23; pipeline no declarada |

## Arquitectura y entrenamiento

El repositorio no entrena nada: solo redistribuye checkpoints ya entrenados por Meta. `htdemucs` corresponde a la arquitectura Hybrid Transformer Demucs, que procesa la señal en dos dominios a la vez (forma de onda y espectrograma) y usa atención tipo transformer para combinar información entre ambos antes de reconstruir las cuatro fuentes. `mdx_extra` es un *bag* de cuatro modelos entrenados con la receta MDX; en inferencia se promedian sus predicciones, lo que suele mejorar la métrica a cambio de multiplicar por cuatro el coste de cómputo. `mdx_extra_q` es ese mismo bag con los pesos cuantizados, pensado para reducir el consumo de memoria y acelerar la inferencia en CPU.

La model card no documenta número de tokens, composición del dataset, ni si hubo ajuste con RLHF/DPO (no aplica en este dominio). Tampoco detalla la estrategia de aumento de datos ni las horas de audio empleadas. Cualquier cifra sobre el corpus de entrenamiento (MUSDB18-HQ, dataset MDX y datos extra) procede de la documentación del proyecto Demucs, no de este repositorio, y conviene verificarla en la fuente original antes de citarla.

La innovación técnica que sí queda explícita en la información disponible es la gestión de nombres y checksums: al conservar la ruta y el nombre originales, el espejo es transparente para `torch.hub`, que valida el SHA-256 del archivo. No hay decodificación especulativa, atención lineal ni otras optimizaciones de inferencia declaradas.

## Capacidades

- Separación de audio musical en cuatro pistas: batería, bajo, otros y voz (stems de 4 vías según la documentación de Demucs).
- Procesamiento de mezclas estéreo completas mediante troceado en segmentos y solapado posterior, lo que permite trabajar con canciones de duración arbitraria.
- Modo ensemble: `mdx_extra` combina cuatro modelos promediando sus salidas.
- Modo de bajo consumo: `mdx_extra_q` ofrece la misma funcionalidad con pesos cuantizados.
- Integración directa con la CLI y la API de Python del paquete `demucs`, y con `torch.hub`.
- Uso como respaldo (*mirror*) en despliegues sin acceso al servidor de Meta, incluido el Space `teamup-tech/Demucs`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multi-step reasoning: no es un modelo de lenguaje y no tiene interfaz conversacional.

## Casos de uso

- **Karaoke y remezclas**: ejecutar `htdemucs` sobre una canción para obtener la pista de voz aislada y la instrumental. El modelo está pensado exactamente para esta tarea y funciona con mezclas comerciales estéreo sin preprocesado.
- **Preprocesado de corpus de voz para ASR**: eliminar música y efectos de fondo de grabaciones antes de transcribir, de modo que el sistema de reconocimiento reciba voz limpia. Se encadena la salida del stem de voz al pipeline de transcripción.
- **Postproducción de pódcast y vídeo**: separar diálogo y música de fondo para reequilibrar niveles, sustituir una banda sonora o eliminar ruido musical sin volver a grabar. El procesado por segmentos permite tratar episodios largos en una sola pasada.
- **Investigación en recuperación de información musical (MIR)**: obtener stems para analizar ritmo, tonalidad o estructura por instrumento, o para construir características de entrada de clasificadores y sistemas de recomendación.
- **Creación de datasets multi-stem**: generar pares (mezcla, stems) de forma sintética para aumentar datos de entrenamiento de otros modelos de separación o de modelos de mejora de audio.
- **Restauración y archivo sonoro**: separar capas en grabaciones antiguas o en directos para documentar cada instrumento por separado antes de una remasterización.
- **Despliegue en entornos aislados**: usar este repositorio como origen de pesos en una infraestructura sin salida a internet (aire-gap), apuntando el cargador a las rutas locales y manteniendo la verificación por SHA-256.
- **Demostraciones en Hugging Face Spaces**: el Space de `teamup-tech` consume estos checkpoints para ofrecer separación de pistas vía Gradio sin depender del CDN de Meta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye métricas (SDR, SIR, SAR ni comparativas en MUSDB18-HQ), y la búsqueda web realizada no devolvió documentación técnica de Demucs, sino resultados de un producto de calendario sin relación con el modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no publicada por el autor. El repositorio completo ocupa 0,9 GB, y el consumo en inferencia lo domina el estado de activaciones, no los pesos; en la práctica un solo modelo cabe en tarjetas de gama media, pero no hay cifra oficial que citar.
- **GPU recomendadas**: cualquier GPU NVIDIA con CUDA y memoria suficiente para el segmento elegido. Para uso individual, RTX 3060/4060/4070/4090; para procesado por lotes a gran escala, A100 o H100 solo aportan ventaja por throughput agregado, no por requisito de memoria.
- **¿Cabe en GPU de consumo?**: sí, con `htdemucs` o con un único modelo del bag; conviene reducir el tamaño de segmento si aparece OOM. El bag `mdx_extra` multiplica por cuatro el cómputo y puede ejecutarse secuencialmente para no multiplicar también la memoria.
- **CPU**: viable, especialmente con `mdx_extra_q`; el factor de tiempo real depende fuertemente del hardware y no está documentado.
- **Opciones de despliegue**: CLI `demucs`, API de Python, `torch.hub`, contenedor propio y Gradio en Hugging Face Spaces. vLLM, llama.cpp, Ollama y TGI no aplican: son servidores de modelos de lenguaje y no cargan checkpoints `.th` de separación de fuentes.
- **Latencia y throughput**: no disponibles. El coste crece de forma aproximadamente lineal con la duración del audio y se multiplica por 4 en el modo ensemble.

## Comparativa con modelos similares

| Modelo | Enfoque | Stems | Licencia | Parámetros | Disponibilidad |
|---|---|---|---|---|---|
| `htdemucs` (este repo) | Híbrido tiempo/frecuencia con transformer | 4 | MIT | no disponible | Pesos en este espejo y en el servidor de Meta |
| `mdx_extra` / `mdx_extra_q` (este repo) | Bag de 4 modelos MDX, con variante cuantizada | 4 | MIT | no disponible | Pesos en este espejo y en el servidor de Meta |
| Spleeter (Deezer) | Redes U-Net sobre espectrograma, TensorFlow | 2, 4 o 5 | MIT | no disponible | Repositorio propio de Deezer |
| Open-Unmix (sigsep) | Redes recurrentes sobre espectrograma, PyTorch | 4 | MIT | no disponible | Repositorio de sigsep y pesos publicados |

Los datos de Spleeter y Open-Unmix proceden del conocimiento general de esos proyectos y no se han podido verificar contra sus fichas en la búsqueda realizada; no se dispone de una comparación de SDR entre las tres alternativas en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no razona, no hace tool calling ni soporta instrucciones en lenguaje natural. Cualquier ficha o pipeline que lo trate como LLM es un error de categoría.
- **Alcance limitado a 4 stems**: no separa instrumentos individuales dentro de "otros" (guitarra, piano, sintetizadores quedan mezclados en la misma pista).
- **Artefactos de separación**: es esperable sangrado entre pistas (*bleed*) y coloración espectral en pasajes densos o con instrumentación no vista en entrenamiento; no hay métricas publicadas aquí para acotar el riesgo.
- **Licencia**: los pesos son MIT según la model card y la declaración de Meta, lo que permite uso comercial. Aun así, conviene revisar los términos del corpus de entrenamiento original si el uso previsto es comercial a gran escala; este repositorio no aporta esa información.
- **Sin datos de entrenamiento ni evaluación**: no se puede auditar sesgo, cobertura de géneros ni rendimiento por tipo de música a partir de esta model card.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes, y depende de que el autor conserve las rutas y los checksums; si se actualiza un archivo sin respetar el SHA-256, `torch.hub` rechazará la carga.
- **Metadatos anómalos**: la fecha de creación indicada (2026-10-23) es posterior a la de esta ficha; conviene verificar la procedencia de los archivos antes de usarlos en producción.
- **Búsqueda web sin resultados útiles**: los enlaces devueltos corresponden a un producto de calendario homónimo, no a Demucs; no deben citarse como documentación del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/teamup-tech/Demucs-weights
- Space que consume estos pesos: https://huggingface.co/spaces/teamup-tech/Demucs
- Repositorio oficial de Demucs (Meta): https://github.com/facebookresearch/demucs
- Origen original de los checkpoints: https://dl.fbaipublicfiles.com/demucs/
- Artículo de Hybrid Transformer Demucs (referencia externa, no citada en la model card): https://arxiv.org/abs/2211.08553
- Artículo original de Demucs (referencia externa, no citada en la model card): https://arxiv.org/abs/1911.13254
