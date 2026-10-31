# xunlinkx/Spark-X2.6-4B-oQ4e-fp16

## Resumen

Spark-X2.6-4B-oQ4e-fp16 es una cuantización comunitaria, preparada por el usuario xunlinkx, del modelo Spark-X2.6-4B desarrollado por el equipo SparkLLM de XHToken. Se trata de una versión optimizada para Apple Silicon mediante el framework MLX, generada con el pipeline de cuantización oMLX en precisión mixta de 4 bits (oQ4e), partiendo de una conversión previa del checkpoint original BF16 a FP16.

El modelo original es un LLM conversacional de unos 4.112 millones de parámetros con arquitectura `spark2_5`, orientado a generación de texto en local. Esta variante cuantizada reduce el consumo de memoria hasta el punto de poder ejecutarse en Macs con 8 GB de memoria unificada, lo que la hace relevante para desarrolladores que quieren inferencia local en hardware Apple sin depender de GPU dedicadas.

Es importante señalar que no se trata de una publicación oficial de XHToken: el repositorio enlaza al modelo base y hereda su licencia Apache-2.0, pero no cuenta con el respaldo de los autores originales. La validación publicada se limita a una comprobación básica de carga y generación, no a benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spark2_5 |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit mixta (oQ4e): base a 4 bits, attention gates seleccionados a 8 bits, proyecciones attention/MLP seleccionadas a 6 bits; grupo de 64, cuantizacion afín, calibracion con 128 muestras de 512 tokens sobre FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura declarada es `spark2_5`, una arquitectura propia de la familia Spark cuyos detalles internos (tipo de attention, número de capas, dimensión oculta) no se describen en la model card disponible. El checkpoint original de XHToken/Spark-X2.6-4B está en BF16 y la familia Spark-X2.6 admite, según la model card de esta cuantización, configuraciones de chat template y "thinking budget" en el runtime, lo que sugiere soporte de razonamiento controlable, aunque sin detalles técnicos publicados aquí.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay información disponible en los datos proporcionados. Lo que sí está documentado es el proceso de cuantización: se convirtió el checkpoint BF16 a FP16 para maximizar la compatibilidad con Apple Silicon antiguo y nuevo, y se aplicó el pipeline oMLX con calibración mejorada (128 muestras, longitud de secuencia de 512 tokens), cuantización afín y tamaño de grupo 64. El resultado es una precisión mixta en la que la mayoría de pesos están a 4 bits, con attention gates seleccionados a 8 bits y ciertas proyecciones de attention y MLP a 6 bits; el desglose por capa está registrado en el `config.json` del repositorio.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`).
- Soporte de chat template y configuracion de "thinking budget" segun el runtime (detalles no disponibles).
- Inferencia local en Apple Silicon mediante MLX, compatible con las generaciones M1 a M6.
- No hay informacion disponible sobre vision, audio, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Chatbots locales en Mac de gama baja: con un pico de memoria de 2,859 GB en la comprobacion basica, cabe en sistemas con 8 GB de memoria unificada, lo que permite asistentes conversacionales sin nube.
- Prototipado rapido de LLM en portatiles Apple: la integracion con MLX y mlx_lm permite probar prompts y plantillas de chat sin configurar infraestructura de GPU.
- Asistentes de productividad offline: generacion de resumenes, redaccion y consultas puntuales sin conexion, aprovechando que todo el peso cabe en memoria unificada.
- Integracion en apps nativas de macOS/iOS via MLX: el formato MLX y el tamano reducido facilitan embeber el modelo en aplicaciones de escritorio.
- Evaluacion de cuantizaciones oMLX: al documentar el layout por capa en `config.json`, sirve como caso de referencia para comparar esquemas de cuantizacion mixta.
- Pruebas de razonamiento con presupuesto controlado: si el runtime soporta los ajustes de thinking budget del modelo base, puede usarse para experimentar con el equilibrio entre latencia y calidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato medido es una comprobacion basica de humo (smoke check): 16 tokens generados con un pico de memoria de 2,859 GB reportado por MLX. Los autores advierten explicitamente de que no es un benchmark ni una comparacion de calidad.

## Requisitos de hardware

- VRAM/memoria estimada: pico de 2,859 GB en generacion corta (16 tokens); el consumo real crece con la longitud de contexto y el overhead del runtime.
- Hardware objetivo: Macs Apple Silicon con MLX, desde M1 hasta M6. Diseñado para caber en sistemas de 8 GB de memoria unificada.
- Consumer GPU: no aplica directamente; el formato MLX esta orientado a Apple Silicon, no a GPU NVIDIA.
- Despliegue: oMLX (recomendado, requiere version reciente con soporte de la arquitectura `spark2_5`) o `mlx_lm.generate` con una instalacion de MLX-LM que soporte Spark.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para construir una comparativa medible. Comparativa cualitativa por categoria (LLM de ~4B cuantizado a 4 bits para inferencia local):

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Spark-X2.6-4B-oQ4e-fp16 | 4,11 B | 4-bit mixta (oQ4e) | MLX safetensors | Apache-2.0 | no disponible |
| Llama 3.2 3B (Q4) | 3,2 B | 4-bit | GGUF/MLX | Llama 3.2 Community | 128K |
| Qwen2.5 3B (Q4) | 3,1 B | 4-bit | GGUF/MLX | Apache-2.0 (3B) | 32K |
| Gemma 2 2B (Q4) | 2,6 B | 4-bit | GGUF/MLX | Gemma Terms | 8K |

La ventaja diferencial de esta variante es su enfoque especifico en Apple Silicon con calibracion oMLX; frente a alternativas GGUF, depende de un ecosistema (oMLX/MLX-LM con soporte `spark2_5`) menos extendido.

## Limitaciones y advertencias

- No es una publicacion oficial de XHToken: es una cuantizacion comunitaria sin respaldo de los autores del modelo base.
- La validacion realizada es una simple comprobacion de carga y generacion (16 tokens); no hay garantias de que la calidad de la cuantizacion sea comparable al checkpoint BF16 original.
- Detalles clave del modelo base no disponibles: longitud de contexto, idiomas soportados, datos de entrenamiento y capacidades exactas hay que consultarlos en la model card upstream.
- El soporte de la arquitectura `spark2_5` requiere versiones recientes de oMLX o MLX-LM; runtimes antiguos pueden no cargar el modelo.
- El consumo de memoria indicado (2,859 GB) corresponde a contexto corto; con contextos largos puede superar el presupuesto de sistemas de 8 GB.
- No hay benchmarks publicados, por lo que no es posible evaluar alucinaciones, sesgos ni rendimiento frente a otros modelos; en general, un modelo de 4B cuantizado a 4 bits es mas propenso a errores factuales que modelos mayores.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base upstream.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/xunlinkx/Spark-X2.6-4B-oQ4e-fp16
- Modelo base (upstream): https://huggingface.co/XHToken/Spark-X2.6-4B
- Licencia del modelo upstream: https://huggingface.co/XHToken/Spark-X2.6-4B/blob/main/LICENSE
- Proyecto oficial Spark-X2.6: https://github.com/XHToken/Spark-X2.6
