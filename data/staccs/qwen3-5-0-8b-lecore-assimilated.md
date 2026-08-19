# staccs/Qwen3.5-0.8B-lecore-assimilated

## Resumen

El modelo `staccs/Qwen3.5-0.8B-lecore-assimilated` es una variante del modelo de lenguaje Qwen3.5-0.8B (desarrollado por Alibaba) que ha sido sometido a un proceso de asimilación mediante el kit leCore/Unicron. Este proceso aplica un filtrado espectral basado en el criterio de Marchenko-Pastur a cada matriz de proyección de atención y MLP: conserva los valores singulares que se consideran estructura aprendida (outliers) y elimina el "bulk" que es indistinguible de ruido de inicialización, reconstruyendo después las matrices con las mismas formas y nombres de tensores. El resultado es un modelo que carga exactamente igual que el original con `transformers`, `llama.cpp` o cualquier otra herramienta compatible, pero con una huella de información reducida (la forma factorizada es aproximadamente 2 veces más pequeña).

El modelo tiene 873.438.784 parámetros (0,8B) y está licenciado bajo Apache-2.0, lo que permite uso comercial. La relevancia de esta publicación radica en que demuestra una técnica de compresión post-entrenamiento que no requiere reentrenamiento y que mantiene la perplejidad prácticamente intacta (incluso mejora ligeramente en wikitext-2). Es un experimento reproducible y auditado, con métricas de perplejidad antes y después reportadas de forma transparente. Está pensado para desarrolladores que buscan modelos pequeños y eficientes para entornos con recursos limitados, sin sacrificar la compatibilidad con el ecosistema estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (safetensors); forma factorizada leCore (~2x menor) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (denso y factorizado `.lecore.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de 0,8B parámetros con capacidad conversacional. Sobre este, el kit leCore/Unicron aplica un filtrado espectral por capas: para cada matriz de proyección (atención y MLP), se calcula su espectro de valores singulares y se compara con la distribución de Marchenko-Pastur predicha para una matriz aleatoria del mismo tamaño. Los valores singulares por encima del borde de MP se consideran señal aprendida y se conservan; los que quedan por debajo se descartan por considerarse ruido de inicialización. Después, las matrices se reconstruyen con las mismas dimensiones originales, de modo que el modelo resultante es funcionalmente idéntico en estructura al original.

No hay entrenamiento con datos en este proceso: es un post-procesado determinista que no utiliza GPU para la asimilación (solo NumPy y stdlib), aunque la medición de perplejidad sí usa torch. Las capas de embeddings y normas se omiten por política, y las capas cuyos outliers representan menos del 1% de la energía total se protegen en lugar de filtrarse, para no eliminar estructura útil. El resultado es un modelo con la misma perplejidad (dentro de un margen del 0,86% en la muestra del kit y una mejora del 0,04% en wikitext-2 completo), pero con una representación factorizada más compacta.

## Capacidades

- Generacion de texto y conversacion en ingles, heredadas del modelo base Qwen3.5-0.8B.
- Razonamiento, generacion de codigo y matematicas (capacidades esperadas del modelo base, aunque no se detallan en la documentacion).
- Compatibilidad total con el ecosistema transformers: carga con `AutoModelForCausalLM` y `AutoTokenizer` sin modificaciones.
- Soporte de tool calling y function calling (si el modelo base lo soporta, no se especifica en la documentacion).
- Capacidad de despliegue en multiples entornos: `transformers`, `llama.cpp`, `Ollama`, `vLLM`, entre otros.
- La forma factorizada `.lecore.safetensors` permite reconstruccion con `unicron_reconstruct` y un shim de transformers esta planificado.

## Casos de uso

- **Asistentes conversacionales en dispositivos edge**: al ser un modelo de solo 0,8B parámetros, puede ejecutarse en hardware modesto (Raspberry Pi, moviles) para chatbots de soporte tecnico o preguntas frecuentes, con baja latencia y sin conexion a la nube.
- **Generacion de codigo asistida en IDEs locales**: integrable en editores como VS Code o Neovim para autocompletado y sugerencias de codigo, aprovechando que el modelo base tiene capacidad de generacion de codigo y que su tamano permite inferencia en tiempo real en una GPU consumer.
- **Clasificacion y etiquetado de texto**: util para tareas de analisis de sentimiento, categorizacion de documentos o deteccion de spam, donde un modelo pequeno y rapido es suficiente y la licencia Apache-2.0 permite uso comercial.
- **Resumen automatico de documentos**: puede generar resumenes de articulos, correos o informes en entornos con restricciones de memoria, como servidores de bajo coste o contenedores con limites de VRAM.
- **Extraccion de informacion estructurada**: mediante prompts adecuados, puede extraer entidades, fechas o relaciones de texto, sirviendo como componente de pipelines de procesamiento de lenguaje natural en produccion.
- **Prototipado rapido y experimentacion**: al ser una variante comprimida de un modelo conocido, es ideal para validar ideas de productos o investigaciones sin incurrir en los costes de inferencia de modelos mas grandes, manteniendo la compatibilidad con el stack estandar.

## Benchmarks y rendimiento

La unica metrica publicada es la perplejidad, medida por el kit leCore y reproducida de forma independiente. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | Original | Asimilado | Delta |
|---|---|---|---|
| Perplejidad (muestra del kit, fp16) | 2.506 | 2.528 | +0.86% |
| Perplejidad (wikitext-2 test, sliding window 2048/1024) | 15.2443 | 15.2389 | -0.04% |

El delta en wikitext-2 es negativo, lo que indica una mejora marginal sobre el original. El proceso es deterministico: la misma pasada en RTX 3060 y RTX 4090 produjo deltas identicos (+0.86% en ambos casos).

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp16, el modelo ocupa ~1,6 GB de pesos (873M × 2 bytes). Con overhead de activaciones y cache KV, se recomienda al menos 3-4 GB de VRAM para secuencias de longitud media. En cuantizacion 4-bit (GGUF) cabria en ~0,5 GB.
- **GPU recomendadas**: cualquier GPU consumer con 4 GB o mas de VRAM, como RTX 3060, RTX 4060, GTX 1660 Super, o incluso iGPUs con suficiente memoria compartida. El kit de asimilacion se probo en RTX 3060 12GB y RTX 4090.
- **Despliegue**: compatible con `transformers` (pipeline estandar), `llama.cpp` (formato GGUF si se convierte), `Ollama`, `vLLM` y `TGI`. La forma factorizada requiere el shim de `unicron_reconstruct` (aun no disponible en transformers).
- **Latencia y throughput**: no se han publicado mediciones formales, pero para un modelo de 0,8B en una GPU moderna se espera una latencia de decodificacion de pocos milisegundos por token y un throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar. La comparacion mas directa es con el modelo base sin asimilar:

| Modelo | Parametros | Perplejidad (wikitext-2) | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B (original) | 873M | 15.2443 | Apache-2.0 | Modelo base |
| Qwen3.5-0.8B-lecore-assimilated | 873M | 15.2389 | Apache-2.0 | Misma arquitectura, pesos filtrados espectralmente |

Otras alternativas como Qwen2.5-0.5B o Llama-3.2-1B existen, pero no se han incluido por falta de datos de rendimiento en la informacion disponible.

## Limitaciones y advertencias

- **Modelo experimental**: es el resultado de una tecnica de compresion post-entrenamiento, no un modelo entrenado desde cero. Aunque la perplejidad se mantiene, no se ha verificado el comportamiento en tareas especificas (razonamiento, codigo, matematicas) con benchmarks estandar.
- **Sesgos y alucinaciones**: al ser un modelo pequeno y derivado, puede presentar sesgos presentes en los datos de entrenamiento del modelo base y una tendencia a alucinar en contextos ambiguos o poco frecuentes.
- **Idioma**: solo se ha validado en ingles. No se garantiza un rendimiento adecuado en otros idiomas, aunque el modelo base podria tener cierta capacidad multilingue.
- **Longitud de contexto**: no se especifica en la documentacion; se recomienda verificar la del modelo base Qwen3.5-0.8B antes de usarlo en aplicaciones con contextos largos.
- **Licencia**: Apache-2.0 permite uso comercial y modificacion, pero se debe mantener el aviso de licencia y atribucion. El kit leCore es MIT, por lo que no hay restricciones adicionales.
- **Riesgo en produccion**: la asimilacion no ha sido auditada por terceros mas alla de la reproduccion independiente de la perplejidad. Antes de desplegar en produccion, se recomienda validar el modelo en el dominio de uso concreto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/staccs/Qwen3.5-0.8B-lecore-assimilated)
- [Modelo base Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Repositorio leCore (kit de asimilacion)](https://github.com/AnOversizedMooseWithSocks/leCore)
