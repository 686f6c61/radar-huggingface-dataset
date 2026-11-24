# Walkowicz/kairos-sophia-2.5-9b-mlx

## Resumen

Kairos Sophia 2.5 · 9B (MLX) es una edición del modelo Kairos Sophia 2.5, un fine-tune de IFM/K2-Horizon-7B desarrollado por el usuario Walkowicz y publicado en Hugging Face. Está orientado específicamente a ingeniería de software bilingüe (inglés y portugués de Brasil) y a la modernización de sistemas legacy, con foco declarado en la migración de COBOL a Quarkus 3 y en flujos de codificación agéntica con tool calling. El modelo base cuenta, según la model card, con 8.999B de parámetros físicos y una ventana de contexto nativa de 512K tokens basada en RoPE.

Esta edición concreta está empaquetada para Apple MLX, con pesos en tres precisiones publicadas (bf16, 8-bit y 5-bit) y un tamaño de repositorio de 15,8 GB. La model card justifica la ausencia de cuantización de 4 bits por la deriva que esta introduce sobre identificadores COBOL y Jakarta con un vocabulario de 250K tokens. Se distribuye bajo licencia Apache 2.0 y requiere mlx-vlm >= 0.8.0 para su carga.

Su relevancia es de nicho: no compite como modelo generalista, sino como herramienta especializada para equipos que abordan migraciones de mainframe a stacks Java modernos y que trabajan en hardware Apple Silicon. El número de descargas y likes en el momento de la consulta es cero, lo que indica un lanzamiento muy reciente y sin adopción comunitaria verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de IFM/K2-Horizon-7B); detalles internos no disponibles |
| Parametros totales | 8.999B (parámetros físicos según model card) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 512K tokens (contexto nativo RoPE) |
| Tipos de cuantizacion | bf16, 8-bit, 5-bit (MLX); GGUF BF16, Q5_K_M y UD-Q3_K_XL en la edición separada |
| Idiomas soportados | en, pt (PT-BR, reparto declarado 50/50) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); GGUF en repositorio alternativo |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un fine-tune de IFM/K2-Horizon-7B, un transformer decoder-only con 8.999B de parámetros físicos y contexto nativo de 512K tokens mediante RoPE. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron fases de RLHF, DPO o SFT supervisado. Tampoco se especifica si emplea innovaciones como decodificación especulativa o atención lineal.

El ajuste se orienta a tres ejes declarados: migración COBOL a Quarkus 3, ingeniería de software bilingüe EN/PT-BR y arneses agénticos multi-turno con tool calling. La edición MLX incluye métricas de fidelidad de cuantización: para 8-bit, similitud coseno media de 0.999911 sobre 254 tensores (mínimo 0.999565, RMSE 0.000291); para 5-bit, coseno medio de 0.998994 (mínimo 0.998422, RMSE 0.001534). La paridad de logits Top-1 es del 100% y Top-5 de 5/5, con divergencia KL de 0.00058 (8-bit) y 0.00949 (5-bit). Estos datos miden fidelidad respecto al modelo en bf16, no calidad de tarea.

## Capacidades

- Generación de texto y código con especialización declarada en ingeniería de software.
- Migración asistida de COBOL a Quarkus 3 y stacks Jakarta EE.
- Tool calling y function calling para integración en arneses agénticos.
- Razonamiento multi-paso orientado a tareas de codificación agéntica.
- Bilingüe inglés y portugués de Brasil, con reparto declarado 50/50 en entrenamiento.
- Manejo de contexto largo gracias a la ventana nativa de 512K tokens.
- Capacidades de visión: la librería mlx-vlm aparece en los tags, pero la model card no detalla funcionalidad multimodal; no disponible como capacidad confirmada.
- Modo thinking explícito: no disponible.

## Casos de uso

- Migración de programas COBOL a servicios Quarkus 3: el modelo puede tomar código COBOL y generar equivalentes en Java/Jakarta EE, aprovechando su entrenamiento específico en este dominio y su contexto de 512K tokens para procesar módulos completos sin truncar.
- Refactorización de aplicaciones Jakarta EE legacy: útil para transformar código anterior a Jakarta hacia APIs actuales, con el vocabulario de identificadores que el modelo base maneja de forma nativa.
- Asistentes de codificación agénticos en local sobre Apple Silicon: al estar empaquetado en MLX con variantes 8-bit y 5-bit, puede integrarse en flujos de agente que ejecutan tool calling de forma iterativa en un Mac.
- Documentación técnica bilingüe EN/PT-BR: generación y traducción de documentación de sistemas legacy para equipos con mezcla de idiomas, gracias al entrenamiento declarado 50/50.
- Análisis de bases de código extensas: la ventana de 512K tokens permite cargar múltiples ficheros y razonar sobre dependencias entre módulos en una sola pasada.
- Integración en pipelines de CI/CD como revisor de cambios: con tool calling puede consultar el repositorio, ejecutar verificaciones y proponer parches en un bucle multi-turno.
- Prototipado en estaciones de trabajo macOS: la variante 5-bit reduce el peso del modelo para equipos con memoria unificada limitada, manteniendo según el autor una fidelidad cercana al bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son métricas de fidelidad de cuantización y una evaluación de arnés sobre la edición GGUF:

| Metrica | Resultado |
|---|---|
| Coseno medio 8-bit (254 tensores) | 0.999911 (mín. 0.999565, RMSE 0.000291) |
| Coseno medio 5-bit (254 tensores) | 0.998994 (mín. 0.998422, RMSE 0.001534) |
| Paridad Top-1 / Top-5 de logits | 100% / 5 de 5 |
| Divergencia KL 8-bit / 5-bit | 0.00058 / 0.00949 |
| Evaluación de arnés GGUF upstream | 7 de 7 (100%): Kilo, Cline, Opencode, Bionic |

## Requisitos de hardware

- VRAM/memoria unificada estimada: en bf16, aproximadamente 18 GB para 9B parámetros; en 8-bit, en torno a 9-10 GB; en 5-bit, alrededor de 6-7 GB. Estimaciones calculadas a partir del número de parámetros, no publicadas por el autor.
- Hardware recomendado: Apple Silicon con memoria unificada suficiente (familias M2 Pro/Max, M3 Pro/Max y M4 Pro/Max). El repositorio pesa 15,8 GB, coherente con las tres precisiones publicadas.
- GPU NVIDIA: el formato MLX no está pensado para CUDA; para A100, H100 o RTX 4090 habría que usar la edición GGUF del repositorio alternativo.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; en NVIDIA, la variante Q5_K_M o UD-Q3_K_XL de la edición GGUF permitiría su ejecución en GPUs con 8-12 GB de VRAM, aunque no se publican cifras de latencia.
- Despliegue: mlx-vlm >= 0.8.0 (requisito declarado); para GGUF, runtimes compatibles con Ollama/llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kairos Sophia 2.5 9B (MLX) | 8.999B | 512K | Apache 2.0 | Migración COBOL/Quarkus, agéntico EN/PT | Hugging Face, MLX y GGUF |
| IFM/K2-Horizon-7B (base) | 8.999B | 512K | no disponible | Generalista de software | Hugging Face |
| Qwen2.5-Coder-7B | 7B | 128K | Apache 2.0 | Código generalista | Hugging Face, amplio ecosistema |
| Codestral 22B | 22B | 32K | Licencia no comercial | Código generalista | Hugging Face |

La comparación con Qwen2.5-Coder y Codestral es orientativa por categoría (modelos de código); no se dispone de benchmarks que permitan comparar rendimiento real entre ellos y Kairos Sophia 2.5.

## Limitaciones y advertencias

- No se han publicado benchmarks de tareas, por lo que la calidad real en migración COBOL o generación de código no está verificada de forma independiente.
- El repositorio registra cero descargas y cero likes en el momento de la consulta: ausencia de validación comunitaria.
- El modelo base declarado (IFM/K2-Horizon-7B) no es ampliamente conocido; conviene auditar su procedencia y su licencia antes de uso comercial en cadena.
- Idiomas limitados a inglés y portugués de Brasil; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación en APIs de Quarkus y Jakarta EE: un modelo pequeño puede inventar métodos o anotaciones; requiere revisión humana y tests automatizados.
- La ventana de 512K tokens es nominal; el rendimiento efectivo en contextos muy largos no está medido en la información disponible.
- La edición MLX solo funciona en el ecosistema Apple; para otros entornos hay que recurrir a la edición GGUF.
- La licencia Apache 2.0 permite uso comercial, pero la model card no exime de verificar las obligaciones derivadas del modelo base.
- La mención a mlx-vlm sugiere capacidades multimodales no documentadas; no asumir visión sin validación.

## Enlaces

- Modelo en Hugging Face (MLX): https://huggingface.co/Walkowicz/kairos-sophia-2.5-9b-mlx
- Edición GGUF: https://huggingface.co/Walkowicz/kairos-sophia-2.5-9b
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Librería mlx-vlm: no disponible enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles
