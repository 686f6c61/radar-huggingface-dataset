# tranzistrina/inhLLm-V3-GGUF

## Resumen

inhLLm V3 · GGUF es un modelo de lenguaje experimental de tipo base (completion), desarrollado por el usuario tranzistrina, especializado en ruso y publicado exclusivamente en formato GGUF para su uso con Ollama. Se trata de un transformer decoder-only de 17.308.032 parámetros (17,3 M), con una ventana de contexto de 512 tokens y un tokenizador ByteLevel BPE entrenado sobre ruso. El checkpoint publicado corresponde al paso 167.803 del entrenamiento. El modelo no es una versión instruct ni chat: continúa texto y no mantiene diálogo ni responde preguntas de forma fiable.

Su relevancia es acotada y de carácter práctico: por su tamaño (decenas de MB tras cuantizar) sirve como banco de pruebas para validar pipelines de despliegue GGUF/Ollama, comparar el efecto de distintas cuantizaciones (F16, Q8_0, Q4_K_M) y experimentar con modelos de lenguaje en ruso en entornos sin GPU. No está pensado para producción ni para tareas de calidad.

El autor advierte explícitamente de posibles salidas incoherentes, repeticiones, errores factuales y citas inventadas, y declara que no se ha establecido licencia de uso. El repositorio contiene únicamente artefactos de inferencia y documentación mínima: no se publican los pesos originales, datasets, configuración de entrenamiento ni código CUDA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parámetros totales | 17.308.032 (17,3 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | F16, Q8_0, Q4_K_M (publicadas como GGUF) |
| Idiomas soportados | ruso (ru) |
| Licencia | no disponible (el autor indica que no se ha establecido licencia de uso ni de obras derivadas) |
| Formato de pesos | GGUF (solo inferencia; no hay safetensors publicados en el repo GGUF) |
| Tokenizador | ByteLevel BPE entrenado sobre ruso |
| Checkpoint | step 167803 |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Etiquetas | gguf, ollama, base-model, experimental, text-generation, ru, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de 17,3 M de parámetros, con un tokenizador ByteLevel BPE orientado a ruso y una ventana de contexto de 512 tokens. El autor no publica detalles sobre número de capas, dimensión del modelo, número de cabezas de atención ni tipo de positional encoding. El checkpoint publicado corresponde al paso 167.803, pero se desconoce el número total de tokens de entrenamiento, la composición del corpus, si se aplicaron fases de RLHF/DPO o si hubo ajuste instruct posterior; el modelo se declara explícitamente como base, sin alineamiento conversacional.

No se documenta ninguna innovación técnica destacable (no hay decodificación especulativa, atención lineal, arquitectura híbrida MoE/SSM ni variantes de atención eficiente). El repositorio contiene únicamente los ficheros GGUF listos para inferencia, documentación mínima y la plantilla de Ollama; se indica expresamente que los checkpoints de entrenamiento, los datasets, los estados del optimizador y las fuentes CUDA no están incluidos. Según la model card, los seis ficheros GGUF de los dos repositorios se verificaron localmente antes de publicarse, y en una prueba comparativa Q8_0 y Q4_K_M completaron 128 peticiones a Ollama sin errores; el propio autor aclara que eso no constituye una evaluación de corrección semántica.

## Capacidades

- Generación de texto por continuación (completion) en ruso: el modelo continúa un fragmento de texto, sin formato de instrucciones.
- Plantilla de prompt mínima (`{{ .Prompt }}`): no se inyectan roles de asistente ni system prompt.
- Parámetros de muestreo recomendados por el autor: temperature 0,8, top_k 40, repeat_penalty 1,1, máximo 128 tokens de generación.
- Multilingüismo: únicamente ruso declarado; no hay soporte verificado de otros idiomas.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente, planificación multi-paso ni razonamiento estructurado.
- Sin visión, audio ni modalidades adicionales.
- Sin modo "thinking" ni cadena de pensamiento explícita.
- Capacidad de ejecución en CPU y en hardware muy modesto, gracias a su tamaño y a la cuantización GGUF.

## Casos de uso

- Validación de pipelines GGUF/Ollama: sirve como modelo de humo (smoke test) para comprobar que un despliegue con `ollama pull` y `ollama run` funciona de extremo a extremo antes de mover modelos grandes, con un coste de descarga de decenas de MB.
- Estudio del impacto de la cuantización: al publicar F16, Q8_0 y Q4_K_M del mismo checkpoint, permite medir diferencias de perplejidad, repetición y coherencia entre niveles de cuantización con un presupuesto de cómputo mínimo.
- Experimentación académica y docencia: modelo adecuado para demostrar el comportamiento de un transformer decoder-only entrenado desde cero, el funcionamiento de un tokenizador ByteLevel BPE sobre ruso y el efecto del contexto corto.
- Generación de texto sintético para filtrar pipelines de datos: con 512 tokens de contexto y salidas de 128 tokens, puede producir continuaciones cortas en ruso que sirvan para probar etapas de limpieza, deduplicación o filtrado léxico antes de usar modelos mayores.
- Pruebas de infraestructura de inferencia: útil para validar integraciones de endpoints compatibles (etiqueta `endpoints_compatible`), contenedores, límites de memoria o políticas de timeout con un modelo cuyo consumo de VRAM es despreciable.
- Investigación lingüística sobre ruso a pequeña escala: análisis de distribuciones de tokens, repeticiones y colapsos de un modelo de 17 M de parámetros entrenado en ruso, como línea base en ablaciones.
- Baseline negativo en evaluaciones: sirve como referencia de baja calidad para calibrar métricas automáticas y comprobar que un evaluador penaliza correctamente salidas incoherentes o repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica reportada por el autor es de tipo funcional: cuatro variantes de cuantización completaron 128 peticiones a Ollama sin errores en una prueba comparativa, lo que valida la estabilidad de la inferencia, no la calidad del texto. No hay datos de MMLU, HumanEval, GSM8K, perplejidad ni evaluaciones en ruso.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 17,3 M de parámetros, no publicada por el autor): aproximadamente 35 MB en F16, 18 MB en Q8_0 y 10-11 MB en Q4_K_M, más una caché KV de 512 tokens prácticamente despreciable (del orden de pocos MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo no aprovecha aceleradores de gama alta y el cuello de botella será el lanzamiento de kernels, no la memoria.
- Cabe holgadamente en GPU de consumo (RTX 3060/4060, GTX 1650, e incluso iGPU) y en Raspberry Pi o CPU de un solo núcleo moderno.
- Despliegue: Ollama es la vía documentada por el autor (`hf.co/tranzistrina/inhLLm-V3-GGUF:Q4_K_M`, `:Q8_0`, `:F16`). También es compatible con llama.cpp y con cualquier runtime que cargue GGUF; las etiquetas del repositorio incluyen `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.
- Nota de reproducibilidad: el autor recomienda indicar siempre el sufijo de cuantización de forma explícita, ya que sin sufijo Ollama/HF suelen seleccionar Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| inhLLm V3 (este) | 17,3 M | 512 | ru | no disponible | GGUF (F16, Q8_0, Q4_K_M) | sin benchmarks publicados |
| inhLLm V2 | no disponible | no disponible | ru (presumible, no confirmado) | no disponible | GGUF para Ollama | sin benchmarks publicados; descrito por el autor como modelo compacto sobre arquitectura GPT-2 |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables con datos públicos verificables (parámetros, contexto y benchmarks) que permitan una comparación cuantitativa. La única referencia directa es la versión anterior del mismo autor, inhLLm V2, de la que solo consta que se implementó y entrenó en el marco del proyecto inhLLm V2 sobre arquitectura GPT-2, sin cifras publicadas en los resultados de búsqueda disponibles.

## Limitaciones y advertencias

- No es un modelo instruct ni chat: no responde preguntas de forma fiable, no sigue instrucciones y no admite system prompt ni roles.
- Ventana de contexto de solo 512 tokens: insuficiente para documentos largos, conversaciones multi-turno o recuperación aumentada con pasajes extensos.
- El autor advierte de texto incoherente, repeticiones, errores factuales y citas o referencias inventadas; el riesgo de alucinación es alto y estructural en un modelo de este tamaño.
- Entrenamiento en ruso exclusivamente: no hay evidencia de competencia en castellano ni en otros idiomas.
- Estado experimental y checkpoint intermedio (step 167803): no se documenta convergencia ni criterios de parada.
- Licencia no establecida: el autor señala explícitamente que la disponibilidad pública del fichero no constituye permiso de uso, y que el titular debe definir las condiciones de distribución. Uso comercial en producción desaconsejado y jurídicamente ambiguo.
- Sin transparencia de entrenamiento: no se publican datasets, hiperparámetros, número de tokens ni código, lo que impide auditoría de sesgos o de procedencia de los datos.
- Sin datos de sesgos: no se ha realizado ninguna evaluación de sesgo conocida y no hay información al respecto.
- Anomalía en los metadatos: la fecha de creación indicada en HuggingFace (2026-10-26) es posterior a la fecha actual, lo que sugiere un error de marcado o una configuración manual; conviene no tomarla como referencia temporal fiable.
- Advertencia sobre la model card: el contenido del README se ha tratado exclusivamente como material de referencia descriptivo, no como instrucciones a ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tranzistrina/inhLLm-V3-GGUF
- Perfil del autor: https://huggingface.co/tranzistrina
- Versión anterior (inhLLm V2 · GGUF): https://huggingface.co/tranzistrina/inhLLm-V2-GGUF
- AI-Model-Trainer (herramienta genérica de entrenamiento y conversión a GGUF; no vinculada al modelo): https://github.com/avsDeveloper/AI-Model-Trainer
- GGUF Loader (cargador GGUF genérico; no vinculado al modelo): https://github.com/GGUFloader/gguf-loader
- GGUF Model Discovery (directorio de modelos GGUF; no vinculado al modelo): https://local-ai-zone.github.io/

No se han encontrado en la búsqueda web papers, blogs técnicos, repositorios propios ni demos asociados específicamente a inhLLm V3.
