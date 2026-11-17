# udgamlabs/udgam-english-125m

## Resumen

Udgam English 125M es un modelo de lenguaje en inglés de 125.829.314 parámetros entrenado desde pesos aleatorios por Udgam Labs, un laboratorio que publica este lanzamiento como experimento abierto con resultados negativos explícitos. Se distribuye junto a una variante conversacional afinada sobre el mismo base, el tokenizador propio, herramientas de inferencia y ajuste fino locales, y la documentación completa del protocolo de evaluación. La relevancia no está en su calidad —el propio autor declara que no debe usarse como asistente general fiable— sino en la transparencia del artefacto: receta reproducible, conjuntos de evaluación congelados y comparaciones emparejadas con estimaciones de incertidumbre.

La arquitectura es un transformer GPT denso de 12 capas, anchura 768, 6 cabezas de consulta y 2 cabezas KV, con atención SSSL, sobre el código de nanochat. El contexto es de solo 2.048 tokens, incluyendo prompt y respuesta, y el tokenizador es un BPE propio de 16.384 tokens ajustado sobre el texto de entrenamiento. El preentrenamiento cubrió 2.033.549.312 objetivos de predicción y el ajuste conversacional consistió en una única pasada finita sobre 7.237 ejemplos de OASST2.

El modelo falla sus propios objetivos: 45,72% de precisión macro en el base y 46,40% en la variante conversacional, frente a 51,76% de SmolLM2-135M y 68,08% de Sarvam-1, y 0 de 24 comprobaciones automáticas estrictas de instrucciones superadas. Es, por tanto, un caso de estudio sobre metodología de evaluación y reproducibilidad más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT denso (nanochat); 12 capas, anchura 768, 6 cabezas de consulta, 2 cabezas KV, atencion SSSL |
| Parametros totales | 125.829.314 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (prompt + respuesta) |
| Tipos de cuantizacion | no disponible (no se distribuye GGUF ni paquete cuantizado) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch nativo (no Transformers `AutoModel`, no GGUF); repo de 0,9 GB con carpeta `release/` versionada como v0.1.0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT fijada por nanochat: 12 capas transformer con anchura 768, 6 cabezas de consulta y 2 cabezas KV (GQA), y atención SSSL. El tokenizador es un BPE propio de 16.384 tokens ajustado sobre el texto de entrenamiento, sin reutilizar vocabulario de ningún modelo preexistente. No se inicializó ningún peso, embedding, vocabulario, adaptador, logit de profesor ni estado oculto a partir de modelos previos: el entrenamiento parte de pesos aleatorios y reutiliza únicamente código de arquitectura y entrenamiento de código abierto.

El preentrenamiento acumuló 2.033.549.312 objetivos de predicción, incluido el piloto. La mezcla principal apunta a 60% FineWeb-Edu, 15% tablas de FinePhrase, 15% tutoriales de FinePhrase y 10% tokens ordinarios del subconjunto Fact-Seeking de Nemotron. FinePhrase aporta texto sintético generado por SmolLM2-1.7B-Instruct y el subconjunto de Nemotron seleccionado usa Qwen3-30B-A3B-Instruct-2507; solo se empleó ese subconjunto de Nemotron. El ajuste conversacional consistió en una sola pasada sobre 7.237 ejemplos de OASST2, con 1.892.764 objetivos supervisados de asistente. Se detectó y eliminó un solapamiento con familias de benchmarks en el sufijo futuro no entrenado, preservando el prefijo aceptado y el checkpoint original; el autor advierte que esa reparación puntual no demuestra ausencia universal de contaminación.

## Capacidades

- Generación de texto en inglés a partir de un prompt, mediante el cargador nativo `models/base/infer.py`.
- Modo conversacional multi-turno en la variante afinada, mediante `models/conversation/infer.py --chat`.
- Inferencia completamente offline, sin servicio alojado, motor de búsqueda ni motor de herramientas.
- Ejecución en CPU verificada con PyTorch 2.11; el entorno cloud registrado usó PyTorch 2.9.1/CUDA.
- Ajuste fino local sobre datos propios de prompt/respuesta con la guía `FINETUNE_NATIVE.md`, validada con fixtures pequeños en CPU y una comprobación de integración de una sola actualización sobre el base de 125M.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio, modo thinking ni soporte multilingüe más allá del inglés.
- No supera ninguna de las 24 comprobaciones automáticas estrictas de instrucciones: algunas respuestas contienen material relevante pero fallan el formato exigido, otras son incorrectas o repetitivas.

## Casos de uso

- Estudio de recetas de preentrenamiento desde cero: el repositorio incluye la mezcla de datos exacta, las revisiones de fuentes y `REPRODUCE_ENGLISH_125M.md`, lo que permite replicar o alterar la receta y medir el efecto sobre la precisión macro del suite congelado de 2.500 ítems.
- Docencia sobre evaluación de modelos pequeños: los resultados negativos, los seis comparadores fijos y las estimaciones de incertidumbre emparejadas sirven como material para explicar por qué un modelo de 125M no debe desplegarse como asistente sin superar umbrales por tarea.
- Verificación de integridad de artefactos: la carpeta `release/` se distribuye byte a byte como la etiqueta v0.1.0, con `SHA256SUMS` y un manifiesto con hash registrado, útil como ejemplo de cadena de custodia reproducible en publicaciones de modelos.
- Pruebas de infraestructura de inferencia en CPU: al cargar con PyTorch nativo y sin dependencia de Transformers, sirve para validar pipelines de despliegue offline y entornos aislados antes de pasar a modelos mayores.
- Ajuste fino educativo sobre OASST2: la guía nativa permite reproducir el ajuste conversacional con 7.237 ejemplos y observar cómo una sola pasada modifica la precisión macro en apenas 0,68 puntos porcentuales (45,72% a 46,40%).
- Investigación sobre contaminación de benchmarks: el incidente documentado de solapamiento en el sufijo no entrenado y su reparación acotada ofrecen un caso concreto para discutir límites de las garantías de limpieza en corpus web filtrados.
- Base para experimentos de tokenizador: al incluir un BPE propio de 16.384 tokens ajustado sobre el texto de entrenamiento, permite comparar decisiones de vocabulario frente a tokenizadores reutilizados en modelos del mismo orden de magnitud.

## Benchmarks y rendimiento

Suite congelada de 2.500 ítems zero-shot: 500 ítems de ARC-Challenge, HellaSwag, PIQA, BoolQ y WinoGrande. Normalized accuracy en las tres primeras, accuracy en las dos últimas; la macro pondera cada tarea por igual. Son resultados del suite seleccionado de este experimento, no puntuaciones oficiales de leaderboard.

| Modelo | Precisión macro |
|---|---:|
| Udgam English 125M base | 45,72% |
| Udgam English 125M conversation | 46,40% |
| Sarvam-1 | 68,08% |
| SmolLM2-135M | 51,76% |
| SmolLM2-360M | 57,40% |

Ambas variantes de Udgam fallaron los cinco umbrales por tarea y el umbral macro del 52%, y superaron 0 de 24 comprobaciones automáticas estrictas de instrucciones. Los 12 ítems de rúbrica humana por variante quedaron sin puntuar. No se estableció ningún resultado en frontera de Pareto y no se seleccionó ganador ni checkpoint a partir de estas puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 125,8M de parámetros en fp32 los pesos ocupan aproximadamente 0,5 GB, y el repo completo pesa 0,9 GB.
- GPU recomendadas: no disponibles; la verificación de carga local registrada se hizo en CPU con PyTorch 2.11, y el runtime cloud registrado usó PyTorch 2.9.1/CUDA sin especificar el acelerador.
- Cabe en cualquier GPU consumer con memoria suficiente para 0,5 GB de pesos más activaciones de contexto 2.048; no se han medido combinaciones de dispositivos.
- Opciones de despliegue: cargadores nativos de PyTorch incluidos en `release/models/base/infer.py` y `release/models/conversation/infer.py`. No hay soporte de vLLM, llama.cpp, Ollama, TGI ni widget de inferencia alojado, y no se distribuye GGUF ni paquete cuantizado.
- Latencia y throughput: no disponibles. El autor indica que los requisitos de recursos de una pasada completa y la adaptación a CUDA del ajuste fino siguen sin medirse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión macro (suite del experimento) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Udgam English 125M | 125,8M | 2.048 | 45,72% (base) / 46,40% (conversación) | MIT | PyTorch nativo, sin GGUF ni Transformers |
| SmolLM2-135M | 135M (no confirmado en la información) | no disponible | 51,76% | no disponible en la información | no disponible en la información |
| SmolLM2-360M | 360M (no confirmado en la información) | no disponible | 57,40% | no disponible en la información | no disponible en la información |
| Sarvam-1 | no disponible | no disponible | 68,08% | no disponible en la información | no disponible en la información |

Los tres comparadores se citan únicamente con los datos aportados por la model card; el resto de sus especificaciones no figura en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento por debajo de todos los comparadores en el suite congelado y fallo de los cinco umbrales por tarea y del umbral macro del 52%; el autor desaconseja explícitamente su uso como asistente general fiable.
- 0 de 24 comprobaciones automáticas estrictas de instrucciones superadas: respuestas con formato incorrecto, erróneas o repetitivas.
- Contexto muy limitado de 2.048 tokens compartidos entre prompt y respuesta, insuficiente para conversaciones largas o documentos extensos.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación no cuantificado en la información disponible, agravado por el bajo rendimiento en BoolQ y tareas de razonamiento.
- Sesgos conocidos: no documentados en la información proporcionada; la mezcla de datos incluye texto sintético de SmolLM2-1.7B-Instruct y Qwen3-30B-A3B-Instruct-2507, cuyos sesgos pueden propagarse.
- Contaminación: se detectó y eliminó un solapamiento con familias de benchmarks en el sufijo no entrenado, pero el autor advierte que la reparación puntual no demuestra ausencia universal de contaminación.
- Licencia MIT permite uso comercial, pero el estado experimental y los resultados negativos hacen desaconsejable cualquier despliegue en producción.
- Inferencia solo mediante cargadores nativos de PyTorch; no hay integración con Transformers `AutoModel`, GGUF ni motores de serving estándar, lo que complica su adopción en pipelines existentes.
- El ajuste fino completo no tiene requisitos de recursos medidos y la adaptación a CUDA está sin verificar; los pesos adaptados no heredan estas puntuaciones y requieren su propia evaluación.
- No se ha probado una instalación limpia de dependencias ni todas las combinaciones de dispositivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/udgam-english-125m
- Código y notas de release: https://github.com/udgamlabs/udgam-english-125m
- Sitio de Udgam Labs: https://www.udgamlabs.com/
- Resultados completos: `release/research/EXPERIMENT_RESULTS.md` (dentro del repositorio de Hugging Face)
- Receta de entrenamiento: `release/research/REPRODUCE_ENGLISH_125M.md`
- Protocolo de evaluación: `release/research/evaluation_protocol.md`
- Resultados públicos: `release/results/README.md`
- Fuentes de datos y curación: `release/research/data_sources.json`
- Guía de ajuste fino nativo: `release/research/FINETUNE_NATIVE.md`
