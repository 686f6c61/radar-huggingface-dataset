# zayyanxlatif/WeightForge-4B-Tools-INT4

## Resumen

WeightForge-4B-Tools-INT4 es un checkpoint de investigación de tipo text-only publicado por Zayyan Latif, derivado por ajuste fino supervisado del modelo base Qwen/Qwen3.5-4B de Alibaba Cloud. El modelo está especializado en la emisión de llamadas a herramientas (tool calling) estructuradas de forma nativa y se distribuye cuantizado en INT4 afín con tamaño de grupo 64 mediante MLX, lo que lo orienta específicamente a la inferencia en Apple Silicon. El paquete preserva exactamente el checkpoint archivado `WeightForge-4B-Tools-v0.1` (paso 12 del entrenamiento).

El problema que aborda es la fiabilidad del formateo de llamadas a funciones en modelos pequeños: el autor reporta una puntuación de 793/1.000 en las cuatro categorías estáticas de Python de BFCL v4, frente a 699/1.000 del padre Qwen INT4 emparejado. Sin embargo, en una comparación independiente de flujos de trabajo con estado obtuvo 14/16, frente a 15/16 del padre, por lo que el propio autor reconoce que el checkpoint no superó su umbral de mejora en ese escenario.

Se trata de un modelo de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), con licencia Apache 2.0, idioma declarado inglés y empaquetado en formato safetensors para la librería MLX. Su relevancia actual es acotada y experimental: demuestra una mejora medible en el parseo de llamadas a herramientas tras un ajuste LoRA muy ligero, pero con cero descargas y cero likes en el momento de la consulta, y sin datos publicados sobre contexto, cuantizaciones adicionales ni rendimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste LoRA sobre proyecciones MLP; export MLX |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 afín (affine) con tamaño de grupo 64; el paquete solo incluye este export |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 (adaptación de Zayyan Latif; se preserva la licencia upstream de Qwen, Copyright 2026 Alibaba Cloud) |
| Formato de pesos | Safetensors (export MLX), 7 archivos de modelo, repo de 2,4 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint BF16 `Qwen/Qwen3.5-4B` en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. Sobre él se entrenó un LoRA supervisado de rango 8 aplicado a las proyecciones gate, up y down de las MLP en los dos últimos bloques de texto. El ajuste supone únicamente 565.248 parámetros entrenables, que recibieron 428 tokens objetivo enmascarados (turnos de asistente) a lo largo de 12 actualizaciones del optimizador, procedentes de nueve episodios sintéticos originales distribuidos en siete familias de entrenamiento. Los ejemplos sintéticos emplearon flujos de trabajo simulados con comprobación ejecutable de estado.

Tras el entrenamiento, los factores LoRA se fusionaron en el modelo BF16 original y el resultado se cuantizó a INT4 con grupo 64 usando MLX. El export conserva los bytes de la plantilla de chat upstream y un comportamiento de tokenizador verificado sobre 240 turnos de desarrollo; el paquete incluye el tokenizador y la configuración exactos usados en el export evaluado. No se documenta entrenamiento con RLHF ni DPO, ni el volumen de tokens de preentrenamiento del modelo base. El autor incluye un script de humo (`smoke.py`) que se ejecuta sin red, con código remoto deshabilitado y `enable_thinking=False`, y que valida la carga local aplicando la plantilla nativa con `tools=`.

## Capacidades

- Generación de texto conversacional en inglés (pipeline `text-generation`).
- Llamadas a herramientas estructuradas de forma nativa, con nombres y argumentos parseables mediante el parser de herramientas nativo de Qwen.
- Soporte de llamadas simples, múltiples y paralelas (categorías Simple, Multiple, Parallel y Parallel Multiple de BFCL v4).
- Modo sin razonamiento explícito (`enable_thinking=False` en el ejemplo verificado); no se documenta un modo de pensamiento separado.
- Ejecución en Apple Silicon mediante MLX y MLX-LM, con plantilla de chat incluida.
- No soporta visión, audio ni otras modalidades: es un checkpoint text-only.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Enrutamiento de herramientas en asistentes locales para macOS: el modelo emite bloques de llamada parseables que una aplicación despachadora puede validar y ejecutar, aprovechando el formato MLX/INT4 para correr en un Mac con memoria unificada.
- Prototipado de agentes con function calling en investigación: sirve como banco de pruebas para estudiar cómo un ajuste LoRA mínimo (565.248 parámetros) altera la precisión de formateo de llamadas frente al modelo base.
- Automatización de tareas de escritorio con herramientas simuladas: el ejemplo de humo demuestra un flujo de lectura contra una bandeja ficticia en proceso y la verificación de una respuesta final (`COUNT=7`), replicable para validar pipelines antes de conectar acciones reales.
- Evaluación comparativa de cuantización: al existir un padre INT4 emparejado con las mismas condiciones de decodificación (greedy, sin thinking, semilla 17, lote 16, tope de 192 tokens), permite medir el efecto aislado del ajuste sobre el formateo de llamadas.
- Generación de llamadas paralelas en pipelines de datos: la mejora más marcada se dio en Parallel Python (124/200 frente a 84/200), útil para escenarios donde se requieren varias invocaciones en un mismo turno.
- Investigación sobre fallos de secuenciación: el autor documenta que el nuevo fallo consiste en emitir múltiples llamadas en una ronda que exigía exactamente una, lo que lo convierte en material de estudio para técnicas de recuperación secuencial.
- No se recomienda para producción con acciones reales sin una capa externa de validación, autorización y alcance de argumentos.

## Benchmarks y rendimiento

| Categoría estática Python de BFCL v4 | Padre Qwen INT4 emparejado | WeightForge INT4 |
|---|---:|---:|
| Simple Python | 343/400 | 362/400 |
| Multiple Python | 185/200 | 187/200 |
| Parallel Python | 84/200 | 124/200 |
| Parallel Multiple Python | 87/200 | 120/200 |
| Total descriptivo | 699/1.000 | 793/1.000 |

Condiciones de la ejecución archivada: decodificación greedy, sin thinking, semilla 17, tamaño de lote 16, tope de 192 tokens, parser de herramientas nativo de Qwen y verificador AST de Python upstream en el commit `f7cf7359b7ac615a0b294831c5ba2bc95ee4a000` de Gorilla. El resultado emparejado registró 101 recuperaciones y 7 pérdidas. En la comparación independiente de 16 flujos de trabajo con estado, WeightForge obtuvo 14/16 y el padre 15/16; la recuperación secuencial fue de 2/3 frente a 3/3. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 2,4 GB en INT4 con grupo 64, por lo que se requiere un Mac con memoria unificada disponible suficiente para cargar los pesos más el contexto; el autor no especifica una cifra mínima exacta.
- Plataforma obligatoria: Apple Silicon; el runtime verificado es MLX 0.32.2, MLX-LM 0.31.3 y Transformers 5.17.0, con Python 3.11 o superior.
- GPU recomendadas: no aplica a CUDA; el paquete está pensado para memoria unificada de Apple Silicon. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Opciones de despliegue: MLX y MLX-LM; el ejemplo incluido usa carga local con `HF_HUB_OFFLINE=1` y `TRANSFORMERS_OFFLINE=1`, código remoto deshabilitado y aislamiento de red mediante `sandbox-exec`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 (total descriptivo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeightForge-4B-Tools-INT4 | 4,2 B | No disponible | 793/1.000 | Apache 2.0 | MLX INT4, Apple Silicon |
| Qwen/Qwen3.5-4B (padre INT4 emparejado) | 4,2 B | No disponible | 699/1.000 | Apache 2.0 | MLX INT4 |
| Qwen/Qwen3.5-4B (BF16 original) | 4,2 B | No disponible | No disponible | Apache 2.0 | Safetensors BF16 |

La comparación se limita al padre y a su versión BF16 porque la información proporcionada no incluye datos de otros modelos de la misma categoría. No se dispone de cifras de contexto ni de benchmarks generales para ninguno de los tres.

## Limitaciones y advertencias

- Modelo de investigación experimental: el propio autor indica que no superó su umbral de mejora en la comparación independiente de flujos de trabajo con estado (14/16 frente a 15/16 del padre).
- El nuevo modo de fallo detectado emite múltiples llamadas en rondas que exigen exactamente una; la recuperación secuencial fue de 2/3 frente a 3/3 del padre.
- La puntuación de 793/1.000 solo mide el formateo estático de llamadas en Python; no evalúa ejecución real de herramientas, resistencia a entradas maliciosas, autorización automática segura ni fiabilidad general de despliegue.
- Requiere una capa externa de despacho que valide y autorice argumentos, secuencia, permisos y resultados antes de habilitar cualquier acción real.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas: solo inglés declarado; sin soporte multilingüe verificado.
- Longitud de contexto: no disponible, lo que impide planificar cargas con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero se debe preservar la licencia upstream de Qwen y las atribuciones correspondientes; los datos de benchmark y el software upstream conservan sus propios términos.
- Cero descargas y cero likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- Dependencia estricta de Apple Silicon y de versiones concretas de MLX/MLX-LM/Transformers; no hay export GGUF ni soporte CUDA documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zayyanxlatif/WeightForge-4B-Tools-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Método BFCL y leaderboard upstream: https://gorilla.cs.berkeley.edu/leaderboard
- Script de humo incluido: `smoke.py` (referenciado en el repositorio)
- Salida verificada: `SMOKE-RECEIPT.json` (referenciado en el repositorio)
- Linaje y hashes: `PROVENANCE.json` (referenciado en el repositorio)
- Créditos y avisos: `NOTICE.md` (referenciado en el repositorio)
- Guía de reproducción: `REPRODUCIBILITY.md` (referenciado en el repositorio)
- Requisitos del entorno: `requirements-smoke.txt` (referenciado en el repositorio)
- Licencia: `LICENSE` (referenciado en el repositorio)
