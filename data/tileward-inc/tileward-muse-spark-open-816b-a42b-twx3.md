# Tileward-Inc/Tileward-Muse-Spark-Open-816B-A42B-TWX3

## Resumen

Tileward-Muse-Spark-Open-816B-A42B-TWX3 es una compresión cuantizada del modelo Muse Spark Open 816B-A42B de Meta, publicada por Tileward-Inc. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 816 mil millones de parámetros totales y 42 mil millones activos por token, según se deduce de la nomenclatura del identificador. Tileward aplica su esquema propietario TWX3, que reduce el peso en disco a 436,4 GB, un 18 % menos que la build NVFP4 de Meta (533,0 GB) y muy por debajo de los 1.644,3 GB de los pesos originales en 16 bits.

El interés de esta ficha es doble. Por un lado, demuestra que es posible servir un MoE de 816B en dos GPU B300 (cuatro si se quiere explotar la ventana completa de 1.048.576 tokens), frente a las cuatro que exige la versión NVFP4 de Meta. Por otro, introduce un compromiso explícito entre tamaño y fidelidad: la pérdida en MMLU 5-shot es de 0,2 puntos frente al original (90,1 frente a 90,3) y la coincidencia de siguiente token con el modelo original baja al 92,0 %.

La relevancia práctica está en el coste de despliegue. La reducción de huella permite ejecutar un modelo de frontera en infraestructura más modesta, a costa de una ligera degradación en fidelidad de generación. El acceso, sin embargo, no es abierto: los pesos no se publican en Hugging Face y se distribuyen bajo petición mediante una reunión con ingenieros de Tileward.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), según nomenclatura del modelo base |
| Parámetros totales | 816B |
| Parámetros activos | 42B |
| Longitud de contexto | 262.144 tokens en 2 GPU B300; 1.048.576 tokens en 4 GPU B300 |
| Tipos de cuantización | TWX3 (esquema propietario de Tileward); referencia comparativa NVFP4 de Meta |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (heredada del modelo base de Meta) |
| Formato de pesos | no disponible (pesos no publicados en el repositorio; acceso bajo petición) |

## Arquitectura y entrenamiento

El modelo base Muse Spark Open 816B-A42B es, por la nomenclatura, un transformer con arquitectura Mixture-of-Experts de 816B parámetros totales y 42B activos. La información disponible no detalla el número de expertos, el mecanismo de enrutamiento ni la composición del dataset de entrenamiento original; tampoco se documenta si hubo RLHF, DPO u otras fases de alineamiento. Estos datos corresponden a la model card de Meta, que no se incluye en la información proporcionada.

La contribución de Tileward es exclusivamente de compresión. El esquema TWX3 produce pesos de 436,4 GB, un 18 % más pequeños que la build NVFP4 oficial de Meta. Según las mediciones del autor, la compresión preserva el comportamiento funcional en varios ejes: 1.196 de 1.200 llamadas a herramientas correctas (frente a 1.199 de NVFP4 y 1.197 del original), 80 de 80 hechos ocultos recuperados hasta 1.040.000 tokens, y una tasa de hechos inventados del 0,6 % (frente al 0,4 % del original y el 0,6 % de NVFP4). La contrapartida es una coincidencia de siguiente token con el original del 92,0 %, frente al 95,0 % de NVFP4. La caché en cuatro tarjetas retiene 7.154.455 tokens, superior a los 5.830.452 de NVFP4.

## Capacidades

- Generación de texto y razonamiento general, con un rendimiento declarado de 90,1 en MMLU 5-shot.
- Soporte de tool calling / function calling: el autor reporta 1.196 llamadas correctas sobre 1.200 en su evaluación.
- Recuperación de información en contextos muy largos: 80 de 80 hechos ocultos localizados hasta 1.040.000 tokens.
- Ventana de contexto extensible hasta 1.048.576 tokens con cuatro GPU B300.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación extensa: con la ventana completa de 1.048.576 tokens en cuatro B300, el modelo puede procesar corpus completos (contratos, expedientes, bases de código) sin fragmentación, y la evaluación del autor muestra recuperación de hechos ocultos a esa distancia.
- Agentes con tool calling en producción: la tasa de acierto reportada (1.196/1.200) lo hace adecuado para orquestación de herramientas en pipelines automatizados donde un fallo de llamada rompe el flujo.
- Asistentes de atención al cliente multi-turno: la caché ampliada (7,15 millones de tokens en cuatro tarjetas) permite mantener sesiones largas y concurrentes con menor presión de memoria que la build NVFP4.
- Generación aumentada por recuperación (RAG) sobre bases de conocimiento masivas: la ventana de 262.144 tokens en dos B300 permite inyectar muchos documentos por consulta sin trocear en exceso.
- Despliegue en infraestructura reducida: al caber en dos B300 en lugar de cuatro, habilita entornos con presupuesto de GPU limitado que de otro modo no podrían servir un modelo de 816B.
- Evaluación comparativa de esquemas de cuantización: sirve como referencia para estudiar el compromiso entre tamaño, fidelidad de siguiente token y rendimiento en tareas concretas (MMLU, tool calling, recuperación en contexto largo).

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Muse Spark Open (16 bits) | Meta NVFP4 | Tileward TWX3 |
|---|---|---|---|
| MMLU (5-shot, accuracy) | 90,3 | 90,2 | 90,1 |
| Llamadas a herramientas correctas (de 1.200) | 1.197 | 1.199 | 1.196 |
| Hechos inventados al escribir hechos de un documento (menor es mejor) | 0,4 % | 0,6 % | 0,6 % |
| Hechos ocultos encontrados hasta 1.040.000 tokens (de 80) | 80 | 80 | 80 |
| Coincidencia de siguiente palabra con el original | – | 95,0 % | 92,0 % |
| Tokens retenidos en caché en cuatro tarjetas | – | 5.830.452 | 7.154.455 |

| Métrica de despliegue | Muse Spark Open (16 bits) | Meta NVFP4 | Tileward TWX3 |
|---|---|---|---|
| Tamaño en disco | 1.644,3 GB | 533,0 GB | 436,4 GB |
| Mínimo de GPU B300 | 8 | 4 | 2 (4 para ventana completa) |

## Requisitos de hardware

- VRAM estimada: 436,4 GB de pesos en disco para TWX3; el despliegue requiere al menos dos GPU B300 para la ventana de 262.144 tokens y cuatro para la de 1.048.576 tokens.
- GPU recomendadas: NVIDIA B300 (requisito declarado por el autor). No se documenta compatibilidad con otras familias.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090, etc.) dado el tamaño de 436,4 GB.
- Opciones de despliegue: no disponible. La información no especifica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El autor reporta capacidad de caché (7.154.455 tokens en cuatro tarjetas) pero no tasas de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (5-shot) | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tileward Muse Spark Open TWX3 | 816B totales / 42B activos | 262.144 (2 B300) / 1.048.576 (4 B300) | 90,1 | 436,4 GB | muse-model-license | Bajo petición |
| Meta Muse Spark Open (16 bits) | 816B totales / 42B activos | no disponible | 90,3 | 1.644,3 GB | muse-model-license | no disponible |
| Meta NVFP4 build | 816B totales / 42B activos | no disponible | 90,2 | 533,0 GB | muse-model-license | no disponible |
| Tileward Muse Spark Open TWX2.5 | 816B totales / 42B activos | no disponible | 89,8 | 388,1 GB | muse-model-license | Bajo petición |

## Limitaciones y advertencias

- Los pesos no se publican en Hugging Face: el repositorio tiene 0,0 GB y el acceso requiere solicitar una reunión con ingenieros de Tileward, lo que limita la reproducibilidad y la auditoría independiente.
- Los resultados de benchmarks están declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- La coincidencia de siguiente token con el original cae al 92,0 % (frente al 95,0 % de NVFP4), lo que implica divergencias de generación respecto al modelo de referencia en tareas sensibles a la fidelidad literal.
- La tasa de hechos inventados sube al 0,6 % frente al 0,4 % del original, un incremento del 50 % relativo en alucinación medida.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Licencia `muse-model-license` heredada de Meta: es necesario revisar el texto completo en el enlace de la licencia antes de cualquier uso comercial, ya que las condiciones no se detallan en la información disponible.
- Dependencia de hardware muy específico (B300): no hay datos de compatibilidad con otras GPU, lo que reduce la portabilidad del despliegue.
- El modelo base es de noviembre de 2026 según la fecha de creación del repositorio; la información sobre su entrenamiento, sesgos y composición de datos no está disponible en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Muse-Spark-Open-816B-A42B-TWX3
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia del modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/main/LICENSE.md
- Build TWX2.5: https://huggingface.co/Tileward-Inc/Tileward-Muse-Spark-Open-816B-A42B-TWX2.5
- Investigación de Tileward: https://tileward.com/research/a-smaller-muse-spark/
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-muse-spark
- Todas las investigaciones de Tileward: https://tileward.com/research/
- Sitio de Tileward: https://tileward.com
- Reserva de reunión con ingenieros: https://calendar.app.google/hg2DzFTxKJgwFWm19
