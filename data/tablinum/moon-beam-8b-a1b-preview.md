# tablinum/Moon-Beam-8B-A1B-Preview

## Resumen

Moon-Beam-8B-A1B-Preview es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por tablinum, derivado mediante ajuste fino del modelo base inclusionAI/Ling-3.0-tiny. Cuenta con 7.893.389.856 parametros totales (aproximadamente 8B) y unos 1B de parametros activos por token, con una ventana de contexto de 131.072 tokens. Su rasgo diferencial es que esta entrenado para responder a partir de pasajes recuperados de una biblioteca de conocimiento propia denominada *engram*, lo que lo orienta a tareas de recuperacion aumentada (RAG) y a un uso como agente de soporte con acceso a herramientas.

El modelo se distribuye en formato BF16 (16 GB de pesos) bajo licencia MIT y esta etiquetado como *preview*: se trata del release candidate de la ronda de entrenamiento 1b, ajustado con QLoRA sobre pasajes recuperados, problemas matematicos, llamadas a herramientas y conversaciones multiturno. La biblioteca asociada ya ha evolucionado a Tablinum-3 (34 tablas, 210 millones de pasajes), y el autor anuncia una segunda ronda de entrenamiento que eliminara el sufijo `-Preview`.

Es relevante ahora porque combina una arquitectura MoE eficiente (1B activo sobre 8B totales), contexto muy largo y un *harness* especifico (terrabeam) que mejora de forma medible el rendimiento en tareas de recuperacion: segun el autor, el porcentaje de acierto en tareas de biblioteca pasa del 53,2% al 83,4% al actualizar el entorno de servicio de terrabeam 0.2 a 0.3, con los mismos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailing_hybrid` (KDA + atencion MLA, MoE), codigo de modelo propio con `trust_remote_code=True` |
| Parametros totales | 7.893.389.856 (aproximadamente 8B) |
| Parametros activos | aproximadamente 1B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (pesos publicados), FP8, GGUF, MLX, MLX 8-bit (repositorios separados) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, 4 shards, 16 GB); capa MTP aparte en `mtp/mtp_layer.safetensors` (0,63 GB) |
| Modelo base | inclusionAI/Ling-3.0-tiny |
| Libreria | transformers (probado con 4.57) |
| Tamano del repo | 16,4 GB |
| Capacidad de decodificacion especulativa | Si, mediante capa MTP entrenada (`model.layers.24.*`) |

## Arquitectura y entrenamiento

Moon-Beam hereda la arquitectura `bailing_hybrid` de Ling-3.0-tiny: un transformer con mezcla de expertos que combina atencion KDA (atención lineal de tipo delta) y atencion MLA (multi-head latent attention), lo que permite sostener un contexto de 131.072 tokens con un coste de atencion contenido. El modelo incluye ademas una capa MTP (multi-token prediction) entrenada y empaquetada por separado, destinada a decodificacion especulativa. El codigo de modelado y configuracion viaja en el propio repositorio (`modeling_bailing_moe_v3.py`, `configuration_bailing_moe_v3.py`), por lo que requiere `trust_remote_code=True`.

El ajuste fino se realizo con QLoRA sobre cuatro tipos de datos: pasajes recuperados de la biblioteca engram, problemas matematicos, llamadas a herramientas y conversaciones multiturno. El modelo esta entrenado para consumir los pasajes en un formato concreto, que el proxy terrabeam reproduce. El *chat template* activa el modo de razonamiento (*thinking*) por defecto, con `temperature=1.0`, `top_p=0.95` y `top_k=20` como ajustes de generacion recomendados. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con modo de razonamiento (*thinking*) activado por defecto.
- Razonamiento matematico: 95,5% de acierto en 400 preguntas de GSM8K con thinking activo (protocolo de model card).
- Respuesta fundamentada en pasajes recuperados: entrenado para responder a partir de fragmentos de la biblioteca engram.
- Llamada a herramientas (*tool calling*): incluye la herramienta `search_library`, que el modelo puede invocar con sus propias consultas y de forma iterativa.
- Razonamiento en varios pasos: las preguntas de dos pasos mejoran notablemente cuando el modelo puede buscar por si mismo.
- Memoria a largo plazo: capaz de incorporar notas de conversaciones anteriores emparejadas por palabras distintivas (nombres, lugares).
- Uso como agente de soporte: evaluado en tau2-bench en dominios de aerolinea y retail.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Decodificacion especulativa mediante capa MTP entrenada.

## Casos de uso

- Atencion al cliente automatizada: el modelo actua como agente de soporte multiturno con acceso a una base de conocimiento; su evaluacion en tau2-bench (0,71 en aerolinea, 0,80 en retail) lo situa como candidato para flujos de soporte con politicas y catalogo de acciones. La ventana de 131K tokens permite arrastrar historial e instrucciones extensas.
- Busqueda documental con respuesta fundamentada: desplegado detras del proxy terrabeam, cada peticion incorpora pasajes recuperados en el formato de entrenamiento; el modelo responde citando la biblioteca en lugar de depender solo de su memoria parametrica.
- Asistente interno sobre base de datos corporativa: con Tablinum-3 (34 tablas, 210M pasajes) como biblioteca, el modelo puede responder a hechos de tablas concretas y a preguntas de dos pasos que requieren encadenar busquedas.
- Agente con memoria persistente: en aplicaciones de asistente personal, las notas de conversaciones previas se recuperan y se muestran junto a los pasajes; el autor reporta un 89,6% de acierto en tareas de memoria con terrabeam 0.3.
- Resolucion de problemas matematicos en pipelines: con thinking activo alcanza 95,5% en GSM8K, adecuado para tareas de verificacion aritmetica o generacion de soluciones paso a paso en un servicio batch.
- Despliegue en hardware modesto: al tener solo aproximadamente 1B de parametros activos, es viable servirlo en GPUs de gama media con cuantizacion GGUF o MLX, incluyendo equipos Apple Silicon mediante los repositorios MLX.
- Prototipado de RAG con contexto largo: la ventana de 131K tokens permite inyectar muchos pasajes sin truncar, util para experimentar con estrategias de recuperacion antes de pasar a produccion.

## Benchmarks y rendimiento

Resultados publicados por el autor (protocolo de model card: temperature 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Metrica | Resultado |
|---|---|---|
| GSM8K (400 preguntas, thinking on) | Acierto | 95,5% |
| EngramBench (503 preguntas, thinking on, pasajes de la tabla propia) | Acierto | 436/503 (86,5%) |
| tau2-bench, aerolinea | Recompensa media | 0,71 |
| tau2-bench, retail | Recompensa media | 0,80 |

Comparativa de *harness* (mismos pesos, 154 tareas de biblioteca reservadas):

| Tipo de tarea | terrabeam 0.2 | terrabeam 0.3 |
|---|---:|---:|
| Hechos (108 tareas) | 59,7% | 91,7% |
| Preguntas de dos pasos (22) | 9,1% | 63,6% |
| Memoria de chats anteriores (24) | 64,6% | 89,6% |
| Total (correctas / incorrectas) | 53,2% / 14,6% | 83,4% / 12,0% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para BF16: aproximadamente 16 GB solo para pesos, mas cache KV y overhead; con contexto de 131K tokens el consumo de memoria de atencion crece de forma significativa.
- Cuantizaciones ligeras: existen repositorios GGUF, FP8, MLX y MLX 8-bit que reducen el requisito por debajo de los 16 GB, aunque el autor no publica cifras exactas de VRAM por cuantizacion.
- GPU recomendadas: para BF16 y contexto largo, A100 80 GB o H100; para contexto reducido y BF16, una RTX 4090 de 24 GB es suficiente para los pesos, pero limita la longitud efectiva de contexto.
- Consumer GPU: si cabe en GPUs de consumo mediante GGUF o MLX; en Apple Silicon, los repositorios MLX y MLX 8-bit estan pensados para ese escenario.
- Despliegue: vLLM (`vllm serve ... --trust-remote-code --max-model-len 131072`), SGLang, transformers 4.57 con `trust_remote_code=True`, llama.cpp/Ollama a traves de los GGUF, y el comando `terrabeam run` para el flujo con biblioteca incluida.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B-Preview | aproximadamente 8B | aproximadamente 1B | 131.072 | MIT | Especializado en RAG con biblioteca engram y tool calling; solo ingles |
| inclusionAI/Ling-3.0-tiny (base) | no disponible en la informacion | no disponible | no disponible | no disponible | Modelo base del que deriva; arquitectura `bailing_hybrid` |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo en estado *preview* (release candidate de la ronda 1b): los pesos pueden cambiar y el autor anuncia una segunda ronda de entrenamiento; no debe tratarse como una version estable para produccion critica.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Esta disenado para funcionar con pasajes recuperados en un formato concreto; servido sin el *harness* terrabeam, su rendimiento en tareas de biblioteca cae drasticamente (53,2% frente a 83,4% en las pruebas del autor).
- El razonamiento entre turnos es critico: en tau2-bench aerolinea, la puntuacion pasa de 0,711 a 0,045 si se descarta el razonamiento previo del modelo, por lo que el *harness* debe conservarlo.
- Riesgo de alucinacion: no se documentan tasas especificas; como todo modelo generativo, puede producir respuestas no fundamentadas, especialmente fuera del dominio de la biblioteca.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado incluido en el repositorio; conviene revisarlo antes de desplegar.
- Los benchmarks publicados proceden del propio autor y usan su protocolo de evaluacion; no hay validacion independiente en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero al derivar de Ling-3.0-tiny conviene verificar las condiciones del modelo base antes de explotacion comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Repositorio GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Repositorio FP8: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-FP8-Preview
- Repositorio MLX: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-Preview
- Repositorio MLX 8-bit: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit-Preview
- Notas de modelo y evaluacion: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md
- Dataset Tablinum-3: https://huggingface.co/datasets/tablinum/tablinum-3
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
