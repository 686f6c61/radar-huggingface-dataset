# trymirai/Muse-Glimmer-30B-M

## Resumen

Muse-Glimmer-30B-M es una cuantización de precisión media (4 bits) del modelo base meta-models/Muse-Glimmer-30B, publicada por Mirai Labs bajo el identificador trymirai/Muse-Glimmer-30B-M. El objetivo declarado por el autor es ofrecer una inferencia local eficiente en Apple silicon, empaquetada a través de la librería propietaria `uzu` y distribuida con un CLI instalable mediante Homebrew. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado que preserva la arquitectura y el conocimiento del modelo original.

Los pesos ocupan 82,6 GB en el repositorio, aunque el recuento real de parámetros en safetensors es de 14.586.078.208 (aproximadamente 14,6 mil millones), una discrepancia notable respecto al "30B" del nombre comercial que conviene tener en cuenta al planificar recursos. La cuantización combina enteros asimétricos de 4 bits con puntos cero de 4 bits, escalas en bfloat16 y tamaño de grupo 64, además de transformadas de Hadamard aleatorias en bloque diagonal para reducir valores atípicos en activaciones y pesos.

Su relevancia actual radica en la estrategia de cuantización: cuantización post-entrenamiento seguida de destilación consciente de la cuantización (QAD), con la que el autor afirma situarse en la frontera de Pareto tamaño-divergencia KL frente a alternativas como los GGUF de Unsloth. La licencia Apache 2.0 facilita su adopción comercial, aunque el soporte de inferencia está limitado por ahora a macOS sobre Apple silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base meta-models/Muse-Glimmer-30B) |
| Parámetros totales | 14.586.078.208 (~14,6 B según safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits asimétrico con puntos cero de 4 bits, escalas bfloat16, grupo 64; etiquetas del repo: 4-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `uzu`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base; la model card remite explícitamente a la ficha de meta-models/Muse-Glimmer-30B para arquitectura, uso previsto, evaluaciones y limitaciones. Lo que sí se documenta es el proceso de cuantización: cuantización post-entrenamiento (PTQ) en enteros asimétricos de 4 bits con puntos cero de 4 bits, escalas en bfloat16 y tamaño de grupo 64, complementada con destilación consciente de la cuantización para recuperar calidad tras la compresión.

La innovación técnica destacable es el uso de Block-diagonal Random Hadamard Transforms, aplicadas para mitigar los valores atípicos tanto en activaciones como en pesos, un problema clásico en la cuantización agresiva de transformers. El autor reporta que, en sus evaluaciones internas de divergencia KL, este checkpoint es comparable al GGUF UD-Q4_K_XL de Unsloth para el mismo modelo base. La mezcla de datos de evaluación empleada es 45% datos agénticos públicos, 30% SFT y contexto largo públicos y 25% datos de chat privados; no se especifican tokens de entrenamiento ni composición del dataset original.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, con soporte multirretorno conversacional heredado del modelo base.
- Razonamiento y contexto largo: la mezcla de evaluación incluye un 30% de datos de contexto largo, lo que sugiere capacidad para tareas de ventana extensa, aunque la longitud exacta no está publicada.
- Uso agéntico: el 45% de la mezcla de evaluación son datos agénticos públicos, lo que apunta a soporte de flujos con múltiples pasos y uso de herramientas, si bien no se documenta formalmente el tool calling.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.
- Inferencia local optimizada: cuantización de 4 bits diseñada para ejecución eficiente en Apple silicon mediante el runtime `uzu`.

## Casos de uso

- Asistencia conversacional local en estaciones de trabajo Mac: el modelo puede ejecutarse íntegramente en local mediante el CLI `mirai`, lo que permite desplegar asistentes con datos sensibles sin salida a la nube, aprovechando la licencia Apache 2.0.
- Automatización agéntica en el escritorio del desarrollador: dado el peso de datos agénticos en la evaluación, encaja en tareas de ejecución de comandos, edición de ficheros y bucles de razonamiento multi-paso orquestados localmente.
- Prototipado rápido de aplicaciones de texto en macOS: la instalación vía Homebrew y el arranque con un solo comando reducen la fricción para validar ideas antes de migrar a infraestructura de servidor.
- Procesamiento de documentos largos: la presencia de datos de contexto largo en la mezcla de evaluación permite abordar resúmenes y extracción de información sobre documentos extensos, siempre que se valide empíricamente el límite real de contexto.
- Evaluación comparativa de técnicas de cuantización: investigadores pueden usar este checkpoint como referencia frente a GGUF Q4_K_XL para estudiar el impacto de Hadamard transforms y QAD en la calidad resultante.
- Desarrollo de herramientas internas sin coste de licencia: al ser Apache 2.0, puede integrarse en productos comerciales internos o distribuidos, sujeto a las limitaciones de plataforma del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta una comparación cualitativa de divergencia KL en evaluaciones internas frente al GGUF UD-Q4_K_XL de Unsloth, sin cifras concretas, y una gráfica de KL frente a tamaño de checkpoint que sitúa a Mirai-M en la frontera de Pareto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 82,6 GB y los pesos cuantizados a 4 bits sobre ~14,6 B parámetros implican un footprint en memoria del orden de 8-10 GB, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponibles; el autor solo soporta Apple silicon (SoC M-series con memoria unificada).
- Compatibilidad con GPU de consumo: no confirmada; no se documenta soporte para CUDA ni ROCm.
- Opciones de despliegue: exclusivamente el runtime `uzu` y el CLI `mirai` (instalación vía Homebrew). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Muse-Glimmer-30B-M | ~14,6 B (safetensors) | no disponible | 4-bit asimétrico con QAD | Apache 2.0 | Apple silicon (`uzu`) |
| unsloth/Muse-Glimmer-30B-GGUF (UD-Q4_K_XL) | mismo modelo base | no disponible | GGUF Q4_K_XL | según modelo base | llama.cpp y derivados |
| meta-models/Muse-Glimmer-30B | mismo modelo base en precisión original | no disponible | bfloat16/fp16 | Apache 2.0 | múltiples runtimes |

La comparación se limita al mismo linaje de modelo base, ya que la información disponible no permite contrastar con arquitecturas alternativas de tamaño similar. La diferencia práctica entre Mirai-M y el GGUF de Unsloth es el runtime: `uzu` está restringido a Apple silicon, mientras que GGUF tiene un ecosistema de inferencia mucho más amplio.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinación ni evaluaciones de seguridad; se remite a la ficha del modelo base, que no está incluida en la información disponible.
- El soporte de inferencia está limitado a Apple silicon; no hay backend CUDA, ROCm ni CPU genérica documentado, lo que excluye su uso en servidores Linux convencionales.
- La discrepancia entre el nombre comercial ("30B") y el recuento real de parámetros (~14,6 B) puede inducir a error en la planificación de recursos.
- El tamaño del repositorio (82,6 GB) es muy superior al de los pesos cuantizados, probablemente por artefactos adicionales; conviene revisar los ficheros antes de descargar.
- No se declaran idiomas soportados, longitud de contexto ni datos de entrenamiento del modelo original en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el enlace de licencia apunta al fichero LICENSE del modelo base; conviene verificar la coherencia entre ambas licencias antes de un despliegue en producción.
- El runtime `uzu` y el CLI `mirai` son herramientas del propio autor; su madurez, mantenimiento y hoja de ruta no están documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Muse-Glimmer-30B-M
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card del modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/LICENSE
- GGUF de referencia de Unsloth: https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-UD-Q4_K_XL.gguf
- Documentación de `uzu` (cómo ejecutar): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Página del modelo en Mirai: https://trymirai.com/local-models/meta-muse-glimmer-30b-mirai-mirai-m-4
