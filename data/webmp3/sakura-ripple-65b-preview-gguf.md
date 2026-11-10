# webmp3/Sakura-Ripple-65B-Preview-GGUF

## Resumen

Sakura-Ripple-65B-Preview-GGUF es una cuantización comunitaria en formato GGUF del modelo ricursiveAI/Ripple-65B-Preview, un modelo de lenguaje de 64.782.689.360 parámetros (aproximadamente 64,8 B) publicado por el autor de Hugging Face `webmp3`. No se trata de un lanzamiento oficial del autor original, sino de una conversión independiente pensada para facilitar la inferencia local y en hardware con recursos limitados mediante llama.cpp.

El paquete ofrece cuatro niveles de cuantización (Q2_K, Q3_K_M, Q4_K_M y Q5_K_M) que reducen el peso original de 129,6 GB en BF16 GGUF hasta un 82 % en el caso más agresivo, permitiendo desplegar un modelo de 65 B en configuraciones que de otro modo no podrían albergarlo. Los archivos han sido verificados estructuralmente y probados con una generación real de texto en llama.cpp (build `b12189-80d2c0c2c`), lo que aporta cierta garantía de funcionalidad básica.

La relevancia de esta ficha radica en que permite evaluar rápidamente si el modelo base encaja en un pipeline concreto sin necesidad de descargar el checkpoint completo. Sin embargo, la información pública disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy escasa: la model card se limita a documentar el proceso de cuantización y no incluye benchmarks ni detalles del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ricursive` (según model card; no se detalla si es transformer, MoE o híbrida) |
| Parametros totales | 64.782.689.360 (≈64,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card identifica la arquitectura únicamente con la etiqueta `ricursive`, sin especificar si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida con componentes de atención lineal o state space. Tampoco se documenta el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa. El dato disponible es el recuento de parámetros: 64.782.689.360, coherente con un modelo denso de aproximadamente 65 B en precisión BF16.

En cuanto al entrenamiento, no se proporciona información sobre el volumen de tokens, la composición del corpus, la existencia de fases de RLHF, DPO o ajuste instructivo, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card de esta cuantización se centra exclusivamente en el proceso de conversión: se realizó una **requantización a partir de un GGUF BF16 existente** (`AtomicChat/Ripple-65B-Preview-GGUF`, archivo `Ripple-65B-Preview-BF16.gguf`), no una conversión directa desde safetensors. No se ejecutó calibración con matrices de importancia (importance matrix), lo que puede afectar a la calidad de las cuantizaciones más agresivas. Además, llama.cpp mantiene algunos tensores (por ejemplo, pesos de normalización) en F32, de modo que no todos los tensores están almacenados en el tipo nominal de cada cuantización.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados en la model card.
- Uso previsto como modelo de chat o conversacional (etiqueta `conversational` en los tags del repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere que puede servirse mediante infraestructura de inferencia estándar.
- Inferencia local mediante llama.cpp, incluyendo `llama-cli` y potencialmente otros frontends compatibles con GGUF.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades específicas de código o matemáticas más allá de las genéricas de un modelo de lenguaje.

## Casos de uso

- **Despliegue local en estaciones de trabajo con GPU de gran capacidad**: la cuantización Q4_K_M (38,8 GB) permite ejecutar un modelo de 65 B en una GPU con 48 GB de VRAM o en configuraciones multi-GPU consumer, algo inviable con el checkpoint BF16 de 129,6 GB.
- **Prototipado y evaluación de modelos grandes en investigación**: investigadores que necesiten comparar el comportamiento de un modelo de 65 B sin disponer de clústeres pueden usar Q2_K (23,7 GB) para pruebas exploratorias, asumiendo la pérdida de calidad asociada a una cuantización de 2 bits.
- **Chat conversacional bilingüe inglés-chino**: el modelo declara soporte para en y zh, por lo que puede emplearse en asistentes conversacionales para esos dos idiomas, aunque no hay datos sobre calidad por idioma.
- **Generación de texto en pipelines por lotes sin requisitos de baja latencia**: al ejecutarse en llama.cpp sobre CPU o GPU, puede integrarse en tareas de generación offline donde el throughput no sea crítico.
- **Servicio de inferencia autoalojado con cuantización intermedia**: Q5_K_M (45,8 GB) ofrece un compromiso entre tamaño y fidelidad respecto al BF16, adecuado para entornos con 48-80 GB de VRAM que quieran minimizar la degradación por cuantización.
- **Evaluación de viabilidad antes de adoptar el modelo base**: descargar una cuantización pequeña permite comprobar si el modelo se ajusta a un caso de uso concreto antes de invertir en el checkpoint completo o en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ningún benchmark de código, perplejidad ni puntuación de calidad, y que la única verificación realizada es que cada archivo GGUF se carga en llama.cpp y genera texto una vez.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin overhead de contexto ni caché KV):
  - Q2_K: ~23,7 GB
  - Q3_K_M: ~31,0 GB
  - Q4_K_M: ~38,8 GB
  - Q5_K_M: ~45,8 GB
- **GPU recomendadas**: para Q4_K_M y Q5_K_M se requiere al menos una GPU de 48 GB (A6000, L40S, A100 80 GB) o reparto entre varias GPU; para Q2_K y Q3_K_M podría bastar con 24-32 GB, aunque no se confirma en la documentación.
- **¿Cabe en GPU consumer?**: Q2_K podría intentarse en una RTX 4090 (24 GB) solo si se acepta un margen muy ajustado o se recurre a offload parcial a CPU; Q3_K_M, Q4_K_M y Q5_K_M no caben en una GPU consumer de 24 GB sin offload.
- **Opciones de despliegue**: llama.cpp es el runtime verificado (build `b12189-80d2c0c2c`). No se confirma compatibilidad con vLLM, TGI, Ollama ni otros motores, aunque al ser GGUF estándar podrían funcionar en frontends compatibles.
- **Latencia y throughput**: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus cuantizaciones, por lo que una comparativa cuantitativa con alternativas de la misma categoría (modelos densos de ~65 B como Llama 3.1 70B, Qwen2.5 72B o Mistral Large) no puede fundamentarse. La comparación se limita a aspectos estructurales verificables:

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Sakura-Ripple-65B-Preview (esta ficha) | ~64,8 B | no disponible | apache-2.0 | GGUF (Q2_K a Q5_K_M) |
| Llama 3.1 70B | ~70 B | 128 K | Llama 3.1 Community License | safetensors, GGUF |
| Qwen2.5 72B | ~72 B | 128 K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF |
| Mistral Large | no disponible públicamente | no disponible | comercial | API |

La comparativa de rendimiento, contexto efectivo y calidad real no está disponible para el modelo de esta ficha.

## Limitaciones y advertencias

- **Información insuficiente sobre el modelo base**: se desconoce la arquitectura exacta, el contexto nativo, los datos de entrenamiento y las capacidades reales; la etiqueta `ricursive` no aporta detalle técnico verificable.
- **Riesgo de alucinación**: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse la fiabilidad factual del modelo.
- **Degradación por cuantización**: la requantización se hizo sin calibración con importance matrix y a partir de un GGUF BF16 intermedio, no del checkpoint original en safetensors; las cuantizaciones Q2_K y Q3_K_M son especialmente propensas a pérdida de calidad.
- **Cobertura idiomática limitada**: solo se declaran inglés y chino; no hay soporte documentado de castellano ni de otros idiomas.
- **Licencia**: apache-2.0 permite uso comercial y redistribución con atribución, pero se recomienda verificar la licencia del modelo base original, ya que esta cuantización hereda las condiciones del upstream.
- **Naturaleza comunitaria**: no es un lanzamiento oficial; el autor original no respalda esta conversión, y la responsabilidad sobre la calidad de los archivos recae en el cuantizador.
- **Compatibilidad de runtime**: requiere una build de llama.cpp que soporte la arquitectura `ricursive`; versiones antiguas pueden fallar al cargar los archivos.
- **Sin garantías de producción**: la única verificación realizada es una generación de texto de prueba por archivo; no hay tests de estrés, evaluación de sesgos ni validación de seguridad.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/webmp3/Sakura-Ripple-65B-Preview-GGUF
- Modelo base original: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Model card del modelo base en el commit de referencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/da94cc013a8fda04a502f0a185083c7099ea06c1/README.md
- GGUF BF16 de origen (AtomicChat): https://huggingface.co/AtomicChat/Ripple-65B-Preview-GGUF
- llama.cpp (runtime verificado): https://github.com/ggml-org/llama.cpp
