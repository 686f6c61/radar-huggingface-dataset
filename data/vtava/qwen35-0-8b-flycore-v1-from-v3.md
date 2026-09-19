# vtava/Qwen35-0.8B-FlyCore-v1-From-v3

## Resumen

Qwen35-0.8B-FlyCore-v1-From-v3 es un checkpoint de investigación publicado por el usuario vtava (repositorio TinyCeNN-LM) como parte de sus experimentos con arquitecturas alternativas de capas feed-forward. Se construye inicializando una configuración denominada `FlyCore-v1` a partir de un modelo previamente entrenado llamado `Qwen3.5 FlyFFN-v3 AllFFN standalone`, que a su vez parte del modelo base Qwen/Qwen3.5-0.8B. No se trata, por tanto, de un modelo entrenado desde cero ni de un lanzamiento de producto, sino de un artefacto de experimentación sobre pesos ya existentes.

El repositorio ocupa 1,2 GB y se distribuye en 8 shards, con la librería `transformers` como interfaz de carga y `text-generation` como pipeline declarado. El autor etiqueta el modelo como `mixture-of-experts`, `tinycenn`, `cenn` y `research`, y advierte explícitamente en la model card de que la calidad de generación puede diferir sustancialmente de la del modelo base y de que las métricas guardadas no deben tratarse como resultados de benchmark de grado publicable.

Su relevancia es limitada y muy específica: sirve para reproducir y auditar una línea de investigación concreta sobre sustitución o reconfiguración de bloques FFN en transformers pequeños. No hay datos publicados de licencia, idiomas soportados, longitud de contexto, composición del dataset de entrenamiento ni evaluaciones comparativas, lo que restringe seriamente su uso fuera del ámbito de la reproducibilidad experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura modificada `FlyCore-v1` (inicializada desde `Qwen3.5 FlyFFN-v3 AllFFN standalone`); etiquetada como mixture-of-experts por el autor, sin detalle publicado de la configuración de expertos |
| Parametros totales | Aproximadamente 0,8 mil millones, segun el nombre del checkpoint; no confirmado explicitamente en la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en 8 shards (`num_shards = 8`), cargables con `transformers`; no se declaran otros formatos |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La model card describe el artefacto como «FlyCore-v1 initialized from trained Qwen3.5 FlyFFN-v3 AllFFN standalone». Es decir, el punto de partida es un modelo Qwen3.5-0.8B que ya había pasado por una modificación de sus capas feed-forward (variante `FlyFFN-v3 AllFFN`), y sobre ese estado se aplica una inicialización `FlyCore-v1`. El autor etiqueta el resultado como `mixture-of-experts`, lo que sugiere una reorganización de las capas FFN en algún esquema de expertos, pero no se publica el número de expertos, el régimen de enrutamiento, la topología ni si existe activación dispersa real.

No hay información sobre el dataset de entrenamiento: el campo correspondiente figura literalmente como `Not recorded`. No se documentan número de tokens, composición del corpus, fases de ajuste (SFT, RLHF, DPO) ni metodología de evaluación. Los únicos artefactos de configuración conservados son `config.json`, `flycore_config.json`, `generation_config.json`, `report.json` y `tokenizer_config.json`, junto con un archivo de run en `.hf_run_archive/standalone-20260918T221649Z/`. La única métrica guardada en la model card es `num_shards = 8`. El propio autor indica que estas métricas provienen del notebook o script de entrenamiento y que, salvo marca explícita de evaluación en conjunto reservado, no equivalen a resultados de benchmark.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad declarada de forma explícita (pipeline `text-generation`, etiqueta `conversational`).
- Conversación multi-turno: la etiqueta `conversational` sugiere uso en diálogo, pero no se documenta plantilla de chat específica más allá del `tokenizer_config.json` incluido.
- Razonamiento, código y matemáticas: no disponible; no hay documentación ni evaluación que lo respalde.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Uso como agente o razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo es únicamente de texto según los tags del repositorio.
- Experimentación arquitectónica: la función principal del checkpoint es servir de artefacto reproducible para la investigación TinyCeNN-LM sobre bloques FFN alternativos.

## Casos de uso

- Reproducibilidad de investigación: cargar el checkpoint con `transformers` y ejecutar el notebook correspondiente del repositorio TinyCeNN-LM para verificar que la inicialización `FlyCore-v1` sobre `FlyFFN-v3 AllFFN` produce los mismos artefactos y el mismo `report.json`. Es el uso para el que el autor lo publica.
- Estudio de ablación de capas feed-forward: comparar las salidas de este checkpoint con las del modelo base Qwen/Qwen3.5-0.8B para medir cuánto cambia la distribución de generación al sustituir el esquema FFN, con prompts controlados y métricas de divergencia (perplejidad, KL entre distribuciones de logits).
- Prototipado educativo en entornos con recursos mínimos: con ~0,8B de parámetros, el modelo puede ejecutarse en una GPU de consumo o incluso en CPU, lo que permite usarlo como banco de pruebas para enseñar carga de pesos en shards y configuración de `generation_config.json`.
- Generación de texto de bajo coste en fase de prototipo: para demos internas donde la calidad no es un requisito crítico y se prioriza iterar rápido sobre la fontanería de inferencia (batching, streaming, plantillas de prompt).
- Comparación de esquemas de cuantización: al ser un modelo pequeño, sirve como caso de estudio para medir el impacto de cuantizar a int8/int4 sobre un transformer de ~0,8B, aunque el repositorio no publique pesos ya cuantizados y habría que generarlos.
- Auditoría de artefactos de entrenamiento: inspeccionar `flycore_config.json` y los ficheros de `.hf_run_archive/` para reconstruir la configuración exacta del experimento y detectar qué hiperparámetros no quedaron registrados (por ejemplo, el dataset, marcado como `Not recorded`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente recoge la métrica `num_shards = 8` y advierte de que las métricas guardadas por los notebooks de entrenamiento no deben interpretarse como resultados de evaluación de grado publicable.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 1,6 GB solo para pesos (0,8B × 2 bytes), más overhead de activaciones y caché KV; en int8, en torno a 0,8 GB; en int4, en torno a 0,4 GB. Son estimaciones aritméticas, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería bastar para bf16 con contextos moderados. Una RTX 3060 de 12 GB, RTX 4060 Ti o superiores son suficientes con holgura. Para servir en producción con concurrencia alta, una A10G, L4 o A100 permitiría lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU de consumo modernas con 6 GB o más. No hay confirmación oficial por parte del autor.
- Opciones de despliegue: `transformers` es la vía soportada de forma explícita (`library_name: transformers`). vLLM y TGI podrían funcionar si la arquitectura `qwen3_5_text` está soportada por esas librerías, algo que no está confirmado. llama.cpp y Ollama requerirían convertir los pesos a GGUF, ya que no se publican ficheros GGUF en el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas. Para un modelo denso de ~0,8B en una GPU moderna cabe esperar un throughput alto, pero al tratarse de una arquitectura modificada (y potencialmente MoE) las cifras reales podrían diferir significativamente y no deben extrapolarse.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la informacion proporcionada. La comparación se limita al modelo base declarado:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Relacion |
|---|---|---|---|---|---|
| vtava/Qwen35-0.8B-FlyCore-v1-From-v3 | ~0,8B (segun nombre) | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | Checkpoint de investigacion |
| Qwen/Qwen3.5-0.8B | ~0,8B (segun nombre) | no disponible | no disponible en la informacion proporcionada | Modelo base upstream | Punto de partida del experimento |

No se aportan datos de rendimiento de ninguno de los dos, por lo que no es posible establecer una comparación cuantitativa. Otras alternativas de tamaño similar no se han identificado en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción. El propio autor advierte de que la calidad de generación puede diferir sustancialmente de la del modelo base.
- Las métricas guardadas en el repositorio provienen del notebook de entrenamiento y no están marcadas como evaluación en conjunto reservado; no son resultados de benchmark publicables.
- Dataset de entrenamiento no registrado (`Not recorded`), lo que impide auditar la composición de datos, los sesgos potenciales y las posibles contaminaciones.
- Licencia no disponible: sin términos explícitos, no hay garantía de uso comercial. Además, al derivar de Qwen/Qwen3.5-0.8B, quedaría sujeta en la práctica a la licencia del modelo base, que no se detalla en la información proporcionada.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe aunque el modelo base la tuviera.
- Longitud de contexto desconocida: no hay datos para planificar aplicaciones con ventanas largas.
- Arquitectura etiquetada como mixture-of-experts sin documentación de número de expertos, enrutamiento ni parámetros activos, lo que impide estimar con precisión requisitos de memoria y latencia.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; en este caso no hay evaluaciones de fidelidad ni de tasas de error que permitan acotarlo.
- Soporte de tool calling, agentes y razonamiento multi-paso no documentado; no debe asumirse.
- Ausencia total de tracción comunitaria (0 descargas, 0 likes al momento del registro) y de validación externa independiente.
- Los resultados de búsqueda web asociados no contienen información relevante sobre el modelo: remiten a foros de Etsy y a un foro de fotografía, sin relación con este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/Qwen35-0.8B-FlyCore-v1-From-v3
- Repositorio de código fuente TinyCeNN-LM: https://github.com/vtavakkoli/TinyCeNN-LM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog o demo oficial: no disponible
- Resultados de búsqueda web relevantes: no disponible (los resultados obtenidos no guardan relación con el modelo)
