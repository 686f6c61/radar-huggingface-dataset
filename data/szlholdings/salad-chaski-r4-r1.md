# SZLHOLDINGS/salad-chaski-r4-r1

## Resumen

`salad-chaski-r4-r1` es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base `Qwen/Qwen3.5-0.8B`. Se trata de un artefacto de entrenamiento más que de un modelo listo para producción: el repositorio contiene 17 ficheros de pesos en formato safetensors, 44 ficheros auxiliares (gráficas SVG, scripts de generación de la model card) y ningún fichero de configuración ni tokenizer propio, lo que confirma que requiere el modelo base para funcionar.

El adaptador se entrenó durante 200 pasos sobre el corpus `SZLHOLDINGS/governed-sft-mix-v2` en una única GPU NVIDIA GeForce RTX 3090 Ti, con un throughput medido de aproximadamente 805 tokens/s. La pérdida bajó de 1,865 a 0,687 y la precisión media por token pasó de 0,553 a 0,773 en la ventana de 20 puntos registrados. El autor no reporta el número total de tokens procesados.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes, la licencia es "other" sin texto legal adjunto, no hay idiomas declarados y la propia model card reconoce que la batería de evaluación de 6 sondas corresponde a un modelo distinto (`SZLHOLDINGS/chaski-r4-v2-trained`, con 3/6 aciertos) y no a este adaptador. Cualquier uso en producción debería tratarse como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el base declara 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no documentada) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia adjunto en el repositorio) |
| Formato de pesos | safetensors (17 ficheros de pesos, 0,6 GB de repositorio) |

## Arquitectura y entrenamiento

El adaptador emplea PEFT con rango y alpha no documentados en la información disponible. El modelo base es Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros del que no se detallan en esta ficha ni la arquitectura interna (atención, RoPE, GQA) ni la ventana de contexto, al no estar presentes en la información proporcionada.

El entrenamiento consistió en 200 pasos de SFT sobre el corpus `SZLHOLDINGS/governed-sft-mix-v2`, ejecutado en una RTX 3090 Ti (identificador de nodo `28191896-1c46-4fb7-9818-e41cfe70563a`) con el worker `v2-20261114`. No se documenta el número de tokens vistos, la composición del dataset, ni si hubo RLHF, DPO o alguna fase posterior al SFT. La innovación técnica declarada por el autor no es de modelado sino de trazabilidad: cada arranque de worker, heartbeat y push de checkpoint genera un "receipt" con digest SHA-256 publicado en el dataset `SZLHOLDINGS/frontier-54-runs`, con doctrina fail-closed (todo evento no certificable deja un receipt honesto en lugar de silencio). El ledger de receipts del repositorio muestra duplicados de eventos y una reanudación de checkpoint tras alcanzar `global_step=200 >= max_steps=200`, lo que sugiere reinicios del worker una vez completado el entrenamiento.

## Capacidades

- Generación de texto y respuesta a preguntas factuales simples: la batería del modelo hermano (no de este adaptador) acierta preguntas como la capital de Francia, 17 × 23 y la autoría de 1984.
- Capacidad de abstención: el modelo hermano falla las tres sondas no respondibles, es decir, no se abstiene ante preguntas sin respuesta. No hay evidencia de que este adaptador se comporte mejor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Trazabilidad de entrenamiento: receipts SHA-256 verificables contra la cadena pública del autor.

## Casos de uso

- Experimentación con PEFT sobre Qwen3.5-0.8B: sirve como ejemplo reproducible de un ciclo de SFT corto (200 pasos) con telemetría de pérdida y precisión por token, útil para comparar configuraciones de LoRA en hardware de consumo.
- Auditoría de procedencia de modelos: el esquema de receipts at-birth con digest SHA-256 permite verificar qué se entrenó, cuándo y en qué GPU, lo que encaja en pipelines internos de compliance de modelos.
- Pruebas de abstención y calibración: el fallo sistemático en las sondas no respondibles lo convierte en un caso de estudio para medir alucinación y diseñar filtros de salida.
- Prototipado de asistentes de dominio cerrado: con 0,8B de parámetros base y un adaptador de 0,6 GB, cabe en GPUs de consumo para demos de chat con contexto corto, siempre que se valide antes la calidad real.
- Generación de código o matemáticas en producción: no recomendado con la evidencia disponible; los benchmarks no se han publicado para este adaptador.
- Base para fine-tuning posterior: el adaptador puede servir de punto de partida o de comparación en experimentos de SFT adicionales sobre el mismo corpus gobernado.

## Benchmarks y rendimiento

| Prueba | Modelo evaluado | Resultado | Estado |
|---|---|---|---|
| Batería del estate (6 sondas) | SZLHOLDINGS/chaski-r4-v2-trained (no este adaptador) | 3/6 (PASS en a1, a2, a3; FAIL en u1, u2, u3) | MEASURED, GPU RTX A6000, receipt `a5c4c3361630c9ea582a` |
| Loss de entrenamiento | Este adaptador | 1,865 → 0,687 (n=20 puntos) | Medido en log de entrenamiento |
| Precisión media por token | Este adaptador | 0,553 → 0,773 (n=20 puntos) | Medido en log de entrenamiento |
| Throughput | Este adaptador | ~805 tokens/s | Aproximación por intervalos de tqdm |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador en la información disponible. La model card advierte explícitamente que la puntuación 3/6 no se transfiere a este lane r1.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,6 GB; sumado al base Qwen3.5-0.8B en fp16 (aproximadamente 1,6 GB) el conjunto ronda los 2,2 GB, aunque no hay medición oficial.
- GPU recomendadas: el entrenamiento se realizó en una RTX 3090 Ti (24 GB); la batería del modelo hermano se ejecutó en una RTX A6000. Para inferencia basta una GPU de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño del base; sin verificación publicada.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base con la librería `peft` (transformers + PEFT); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no incluir GGUF ni tokenizer propio no es desplegable directamente en llama.cpp/Ollama sin conversión.
- Latencia y throughput: ~805 tokens/s medidos durante el entrenamiento en RTX 3090 Ti; no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-chaski-r4-r1 (este) | Adaptador sobre 0,8B | no disponible | Sin benchmarks publicados; 3/6 en batería de modelo hermano | other (sin texto) | 0 descargas, 0 likes |
| Qwen3.5-0.8B (base) | 0,8B | no disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Modelo base referenciado |
| chaski-r4-v2-trained (hermano del estate) | no disponible | no disponible | 3/6 en batería de 6 sondas | no disponible | Artefacto del mismo autor |

No se dispone de información suficiente para comparar con alternativas externas de la misma categoría (adaptadores LoRA sobre modelos sub-1B) sin inventar datos.

## Limitaciones y advertencias

- Sin evidencia de calidad: no hay benchmarks del adaptador; la única evaluación publicada corresponde a otro modelo del mismo autor.
- Alucinación demostrada en el modelo hermano: falla las tres preguntas no respondibles (u1, u2, u3) en lugar de abstenerse.
- Licencia "other" sin texto legal: no se puede determinar si el uso comercial está permitido; hay que contactar con el autor o asumir riesgo legal.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Repositorio incompleto para uso directo: 0 ficheros de configuración y tokenizer; requiere el base Qwen3.5-0.8B y reconstruir la configuración PEFT.
- Ledger de receipts con duplicados y reanudaciones tras completar el entrenamiento, lo que reduce la confianza en la telemetría como prueba de reproducibilidad.
- Procedencia no verificable de forma independiente según la propia model card ("Training provenance: not independently verifiable from this repository").
- Visibilidad privada en el momento de la edición curada: el artefacto podría no ser accesible públicamente de forma estable.
- No apto para producción sin una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-chaski-r4-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/governed-sft-mix-v2
- Dataset de receipts: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Modelo hermano evaluado: https://huggingface.co/SZLHOLDINGS/chaski-r4-v2-trained
