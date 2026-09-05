# stefanprodan/Ornith-1.5-35B-A3B-BigBang-oQ4e-mtp

## Resumen

Ornith-1.5-35B-A3B-BigBang-oQ4e-mtp es una cuantización oQ4e del modelo Ornith 1.5 35B-A3B BigBang MTP, desarrollada por stefanprodan. El modelo base, creado por EryriLabs, es un fine-tune del modelo Qwen3.6-35B-A3B de la familia Qwen3.5 MoE, al que se le ha injertado una cabeza MTP (Multi-Token Prediction) de una capa. Esta versión cuantizada está diseñada específicamente para ejecutarse en Apple Silicon mediante el runtime oMLX, aprovechando tanto la arquitectura MoE como la cabeza MTP para la decodificación especulativa.

El modelo resuelve la necesidad de ejecutar un modelo multimodal de 35 000 millones de parámetros con solo 3 000 millones activos en hardware de consumo de Apple, manteniendo un contexto de 262 144 tokens. Está pensado como herramienta diaria para trabajo con agentes GitOps en OpenCode con servidores MCP, y el autor lo ha validado en un Mac Studio M2 Max de 96 GB. Su relevancia radica en combinar un coste de computación bajo (3B activos) con una ventana de contexto muy larga y soporte multimodal, lo que lo hace útil para tareas de automatización y análisis de repositorios complejos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe), con cabeza MTP de una capa |
| Parámetros totales | 35 951 822 704 (35 951,8 millones) |
| Parámetros activos | ~3 000 millones (8 activos de 256 expertos) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | oQ4e: affine 4-bit, grupo 64, con overrides de precisión (195 tensores a 8 bits, 113 a 5 bits, 3 a 6 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (5 shards, 21,6 GB) |

## Arquitectura y entrenamiento

El modelo es un mixture of experts (MoE) de la familia Qwen3.6, con 256 expertos y 8 expertos activos por token. La cuantización oQ4e, generada con oMLX 0.6.4, utiliza un esquema affine de 4 bits con grupo de 64, y una pasada de sensibilidad que promueve determinados tensores a 5, 6 u 8 bits para preservar la calidad. La calibración se realizó con el perfil `oqe_code_multilingual` de oMLX, con imatrix mejorada.

La particularidad técnica es la cabeza MTP injertada en el modelo base: 42 tensores (`language_model.mtp.*`) que permiten la decodificación especulativa en múltiples tokens. Con Lightning MTP de oMLX y una profundidad de borrador de 3, el modelo alcanza 2,59 tokens por ciclo de verificación y una tasa de aceptación de borradores del 87 %. El modelo fuente es un fine-tune de Qwen3.6, pero no se han publicado los datos de entrenamiento ni la composición del dataset.

## Capacidades

- Multimodal: procesa imágenes y texto (pipeline image-text-to-text), conservando el vision tower del modelo base.
- Conversacional y orientado a agentes: soporta interacciones multi-turno y uso de herramientas (tool calling / function calling), útil para agentes que ejecutan operaciones.
- Decodificación especulativa: la cabeza MTP se activa en oMLX con Lightning MTP, mejorando el throughput de decodificación.
- Contexto largo: ventana de 262 144 tokens, con sesiones de más de 120 000 tokens verificadas por el autor.
- Soporte de agentes: puede mantener estado y razonamiento multi-paso en tareas como lectura de documentación, auditoría de clústeres o trazado de pipelines.
- Integración con MCP: diseñado para trabajar con servidores MCP (por ejemplo, Flux) y herramientas de desarrollo como OpenCode.

## Casos de uso

- Agente GitOps en OpenCode: el modelo gestiona operaciones de Git sobre un clúster de prueba, con el servidor Flux MCP. La ventana de contexto de 262k permite mantener herramientas y resultados en el prefijo, reutilizando el bloque de herramientas entre sesiones.
- Auditoría de clústeres a JSON: analiza la salida de comandos y genera un informe estructurado en JSON, como muestra el test agt4 del benchmark.
- Lectura de documentación de API: accede a documentación mediante llamadas a herramientas y responde preguntas técnicas sin perder el hilo de la conversación.
- Catálogo de patrones de repositorio: escanea código fuente y extrae patrones, creando un inventario reutilizable en el contexto.
- Trazado de pipelines de entrega: sigue un flujo de entrega paso a paso, usando el contexto largo para mantener el estado de la traza (test agt6).
- Respuestas desde contexto amplio: responde preguntas sobre el contenido de un conjunto grande de documentos con una sola llamada (test agt1), aprovechando la memoria de 262k tokens.
- Asistente de desarrollo multimodal: puede interpretar capturas de pantalla de interfaces o diagramas de arquitectura, gracias al vision tower.
- Despliegue en macOS para desarrollo local: permite ejecutar un modelo de 35B en un Mac Studio con memoria unificada, sin depender de servicios en la nube.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados de la suite de seis pruebas (GitOps con agentes) realizada por el autor en un Mac Studio M2 Max con oMLX 0.6.4 y OpenCode 1.18.29. Se indica el número de llamadas a herramientas permitidas, los pases conseguidos y el tiempo medio.

| Test (call budget) | Este build | pyros-vault oQ4e | Tiempo medio (segundos) |
|---|---|---|---|
| agt1 answer from context (0) | 3/3 | 3/3 | 7,1 |
| agt2 version lookup (3) | 3/3 | 3/3 | 15,9 |
| agt3 API doc reading (10) | 3/3 | 3/3 | 62,8 |
| agt4 cluster audit to JSON (12) | 3/3 | 3/3 | 130,2 |
| agt5 repo-pattern catalog (10) | 3/3 | 2/3 | 120,1 |
| agt6 delivery-pipeline trace (14) | 3/3 | 3/3 | 177,2 |
| Total de pases | 18/18 | 17/18 | 24,4 min (suite completa) |

En cuanto al rendimiento de servidor, los valores medios por turno agéntico son: prefill entre 426 y 557 tokens por segundo, y decodificación entre 63 y 91 tokens por segundo con Lightning MTP. Para contextos largos de más de 100 000 tokens, se registran aproximadamente 280 tokens por segundo en prefill y 45 tokens por segundo en decodificación. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 21,6 GB en disco y unos 20,3 GB de memoria residente. Al ser un modelo MLX, utiliza memoria unificada en Apple Silicon.
- GPU recomendada: Apple Silicon (M1, M2, M3 y superiores). El autor lo ha validado en un Mac Studio M2 Max con 96 GB de memoria unificada, con espacio suficiente para contextos largos.
- Compatibilidad con GPU de consumidor: no se proporcionan pesos GGUF ni soporte CUDA, por lo que no es compatible con tarjetas gráficas NVIDIA en los formatos publicados.
- Opciones de despliegue: oMLX (runtime recomendado, activa la cabeza MTP con Lightning MTP); mlx-lm puede cargar los pesos de texto pero ignora la cabeza MTP, perdiendo la aceleración. Es necesario descargar el repositorio completo, incluidos índices y configuración, para que funcione.
- Latencia y throughput: con Lightning MTP, 2,59 tokens por ciclo de verificación y 87 % de aceptación; prefill de 426-557 tok/s y decode de 63-91 tok/s en turnos agénticos en M2 Max.

## Comparativa con modelos similares

Dentro de la información disponible, la comparativa se limita a las variantes de cuantización del mismo modelo base, ya que no se han encontrado otros modelos de la misma categoría con datos publicados. La siguiente tabla compara este build con la cuantización oQ4e de pyros-vault, que emplea la misma receta.

| Modelo | Cuantización | Pases en suite | Tamaño del repo | Notas |
|---|---|---|---|---|
| stefanprodan/Ornith-1.5-35B-A3B-BigBang-oQ4e-mtp | oQ4e (affine 4-bit, grupo 64, overrides de sensibilidad) | 18/18 | 21,6 GB | Incluye cabeza MTP, compatible con Lightning MTP en oMLX |
| pyros-vault/Ornith-1.5-35B-A3B-BigBang-oQ4e-mtp | oQ4e (misma receta, distintos tensores promovidos) | 17/18 | no disponible | Considerado el build de referencia; la diferencia está dentro de la varianza experimental |
| ornith-ai/Ornith-1.5-35B-A3B (modelo origen) | sin cuantizar | no disponible | no disponible | Modelo base original de Ornith 1.5, requiere más memoria |

## Limitaciones y advertencias

- No se han documentado sesgos específicos de este fine-tune; sin embargo, al derivar de Qwen3.6, puede heredar sesgos del modelo base no publicados en la ficha.
- Riesgo de alucinación en tareas con agentes y muchas herramientas, especialmente cuando el contexto supera los 100 000 tokens y la información es ambigua.
- La ventana de contexto máxima de 262 144 tokens es teórica; las sesiones de 120 000 tokens están verificadas, pero utilizarla al completo aumenta la latencia de forma considerable (alrededor de 280 tok/s de prefill y 45 tok/s de decode en el largo plazo).
- Dependencia del runtime oMLX para aprovechar la cabeza MTP. Si se carga con mlx-lm, la decodificación especulativa no está disponible y el rendimiento será menor.
- No hay pesos GGUF ni soporte CUDA en esta publicación, por lo que no puede ejecutarse en GPUs NVIDIA con los formatos actuales.
- La cuantización 4-bit puede degradar ligeramente la precisión respecto al modelo sin cuantizar, aunque la pasada de sensibilidad intenta minimizar el efecto.
- La licencia MIT declarada permite uso comercial y modificación, pero debe verificarse la licencia del modelo base original y de las dependencias antes de un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stefanprodan/Ornith-1.5-35B-A3B-BigBang-oQ4e-mtp
- Modelo base en HuggingFace: https://huggingface.co/EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP
- Modelo original de Ornith 1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante de referencia en HuggingFace: https://huggingface.co/pyros-vault/Ornith-1.5-35B-A3B-BigBang-oQ4e-mtp
- Repositorio de oMLX: https://github.com/jundot/omlx
