# Urdatorn/KainoBERT

## Resumen

KainoBERT es un modelo de lenguaje enmascarado (masked language modeling, fill-mask) para griego antiguo desarrollado por Albin Thörn Cleland (Urdatorn), doctorando de la escuela nacional sueca de filología digital DigPhil en la Universidad de Lund. Reproduce la arquitectura de ModernBERT-base pero se entrena desde inicialización aleatoria, sin heredar los pesos en inglés: 22 capas, dimensión oculta 768, 12 cabezas de atención, 136.120.832 parámetros y un vocabulario BPE a nivel de byte de 32.768 tokens. La longitud de contexto es de 1.024 tokens.

El problema que resuelve es la falta de modelos de representación contextual sólidos para griego antiguo (código `grc`), un dominio donde la mayoría de recursos lingüísticos proceden de BERT multilingües o de modelos de griego moderno. KainoBERT se entrena con corpus específicos de griego antiguo y una superficie de entrada adaptada a la práctica filológica: texto en minúsculas, sin puntuación y con marcas politónicas conservadas.

Es relevante ahora por dos motivos. Primero, es un ejemplo de reentrenamiento completo de una arquitectura moderna (ModernBERT) sobre un dominio de nicho, con un pipeline reproducible publicado en GitHub y métricas de entrenamiento detalladas. Segundo, su carta de modelo advierte explícitamente de que esta versión es la no auditada y ha visto el corpus completo `Ericu950/AncientGreek`, incluidos los conjuntos de evaluación de autoría Sphragis y Sphragis-Metre, por lo que no debe usarse para evaluar en ellos. Para experimentos libres de contaminación existe el modelo padre, `Urdatorn/KainoBERT-sphragis`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional), reproducida desde cero; 22 capas, hidden size 768, 12 cabezas de atencion |
| Parametros totales | 136.120.832 (136M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el repositorio solo contiene safetensors en bf16/fp32) |
| Idiomas soportados | griego antiguo (`grc`) unicamente |
| Licencia | other (compilacion de corpus con licencias mixtas; hay que consultar el campo `license` de cada registro fuente) |
| Formato de pesos | safetensors (biblioteca `transformers`, pipeline `fill-mask`) |
| Vocabulario | BPE a nivel de byte, 32.768 tokens, entrenado desde cero sobre el corpus griego |
| Tokens especiales | `[CLS]` ... `[SEP]` |
| Modelo base | Urdatorn/KainoBERT-sphragis (continuacion, no destilacion) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha en metadatos de HuggingFace | creado el 2026-09-25, actualizado el 2026-09-25 |

## Arquitectura y entrenamiento

Se replica la arquitectura ModernBERT (encoder bidireccional con atención alterna local/global, embeddings posicionales rotatorios y GeGLU en lugar de la MLP clásica con sesgos), pero con pesos inicializados aleatoriamente y un tokenizador nuevo. No hay transferencia desde `answerdotai/ModernBERT-base`: solo se reproduce la topología. El contexto efectivo se fija en 1.024 tokens, muy por debajo de los 8.192 del ModernBERT-base original en inglés.

El entrenamiento tiene tres fases, todas con enmascaramiento dinámico del 30 %, AdamW fusionado, precisión bf16 y lote efectivo de 512 secuencias de 1.024 tokens sobre dos GPU GH200:

1. **Preentrenamiento** sobre `Urdatorn/AncientGreek-no-sphragis` (revisión `v2-sphragis-1e6d8b58d956e84aec7c1c778bef036bd0286fa9`), un corpus al que se le eliminaron todas las obras de los benchmarks, ediciones y comentarios derivados, ventanas de benchmark y líneas de benchmark. Total: 323.225 bloques (331M tokens), learning rate máximo 3e-4, schedule coseno, 4 épocas.
2. **Continuación** sobre el mismo corpus partiendo del learning rate terminal de la fase uno (3e-5, optimizador nuevo), detenida tras seis evaluaciones sin mejora de 0,002 en la pérdida de validación. Terminó en la época 18,2 con pérdida 2,380. El resultado es `Urdatorn/KainoBERT-sphragis`.
3. **Continuación sobre el material eliminado** (este modelo): todo lo excluido en la fase uno, reconstruido por diferencia entre `Ericu950/AncientGreek` (revisión `6ac90787c669a7e9218d6d4675a029fa3f10ed99`) y la segunda derivada. Se descartaron 313.840 registros completos (750M caracteres, ambos niveles de calidad) más las 4.092 líneas eliminadas de registros conservados. Empaquetado con el mismo tokenizador y reglas de superficie (minúsculas, sin puntuación, 80 % politónico, 20 % letras simples) en 161.745 bloques (166M tokens), con un 0,2 % reservado para validación. Misma receta que la fase dos: learning rate 3e-5, sin warmup, coseno hasta el 10 %, regla de parada temprana 6 × 0,002, techo de 30 épocas. La pérdida de validación sobre el material eliminado bajó de 2,614 (modelo de la fase dos, texto no visto) a 1,977, y la ejecución alcanzó el techo con las últimas evaluaciones mejorando entre 0,001 y 0,002.

Los hiperparámetros completos, el manifiesto del corpus empaquetado y el historial de pérdidas están en `training_metrics.json`, y el pipeline en el repositorio `Urdatorn/sphragis_models` (scripts `build_removed_corpus.py`, `prepare_removed_corpus.py` y `slurm/continue_kainobert_v3.slurm`). No se documenta RLHF, DPO ni ningún ajuste por preferencias: es un modelo base puramente auto-supervisado.

## Capacidades

- Relleno de máscaras (fill-mask) sobre texto en griego antiguo: predice tokens o secuencias ausentes en un pasaje dado.
- Representaciones contextuales por token y por secuencia, utilizables como encoder para tareas aguas abajo (clasificación, etiquetado, similitud).
- Lectura de texto politónico y de texto en letras simples (sin acentos ni espíritus), según las reglas de superficie declaradas.
- Tolerancia a texto en minúsculas y sin puntuación, que es el formato de entrada recomendado.
- No dispone de tool calling ni de function calling.
- No es un modelo generativo autónomo ni un agente: no soporta razonamiento multi-paso, ni bucle de herramientas, ni conversación.
- No tiene modo de razonamiento explícito (thinking) ni capacidades de visión, audio o multimodalidad.
- Cobertura multilingüe: nula fuera del griego antiguo; solo se ha entrenado con `grc`.

## Casos de uso

- **Restauración de lagunas en papiros e inscripciones**: dado un pasaje con pérdidas materiales, el modelo propone candidatos para las posiciones dañadas mediante fill-mask. Es el uso más directo del pipeline declarado y encaja con textos fragmentarios donde el contexto inmediato es estable.
- **Corrección de transcripciones HTR/OCR de ediciones digitalizadas**: el modelo puntúa y reemplaza tokens corruptos o mal segmentados en salidas de reconocimiento óptico de caracteres sobre textos politónicos, donde los errores de acentuación y de iota suscrita son frecuentes.
- **Normalización ortográfica y de superficie**: conversión asistida entre texto politónico y texto en letras simples, validando cada conversión con la probabilidad que el modelo asigna a la forma normalizada.
- **Etiquetado y anotación morfosintáctica**: los embeddings contextuales de las 22 capas sirven como entrada a clasificadores de lema, caso, número o categoría verbal, con una capa de clasificación adicional por token.
- **Análisis métrico y prosódico**: el autor trabaja en métrica y prosodia; los embeddings pueden alimentar clasificadores de cantidad silábica y de esquema métrico, aprovechando que el entrenamiento conserva la información acentual.
- **Atribución de autoría y estilometría**: ajuste fino del encoder para clasificar autor o género literario sobre pasajes, un escenario coherente con los conjuntos Sphragis y Sphragis-Metre del propio autor (usando `KainoBERT-sphragis` para no contaminar).
- **Recuperación semántica y búsqueda de pasajes paralelos**: indexación de vectores de frase para localizar formulaciones similares (fórmulas homéricas, loci paralleli) a través de corpus extensos, sin depender de coincidencia léxica exacta.
- **Curación de corpus digitales**: puntuación de registros para detectar texto degradado, duplicado o mal codificado antes de incorporarlo a un pipeline filológico, usando la pérdida de validación por documento como señal de calidad.
- **Punto de partida para preentrenamiento continuado**: al ser un modelo base, admite continuación sobre subcorpus especializados (épica arcaica, tragedia ática, prosa tardía) con un coste de cómputo bajo por su tamaño de 136M parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La carta de modelo no incluye MMLU, HumanEval, GSM8K ni métricas equivalentes, y advierte explícitamente de que este modelo no debe evaluarse sobre los benchmarks Sphragis y Sphragis-Metre porque los ha visto durante el entrenamiento.

Las únicas cifras cuantitativas publicadas son pérdidas de validación durante el entrenamiento, que no son comparables con benchmarks estándar:

| Metrica declarada | Valor |
|---|---|
| Perdida de validacion final, fase 2 (`KainoBERT-sphragis`) | 2,380 (epoca 18,2) |
| Perdida de validacion en material eliminado, modelo de fase 2 | 2,614 |
| Perdida de validacion en material eliminado, este modelo | 1,977 (techo de 30 epocas alcanzado) |

## Requisitos de hardware

- **Pesos en memoria (estimacion a partir de 136.120.832 parametros)**: fp32 ≈ 545 MB; bf16/fp16 ≈ 272 MB; int8 ≈ 136 MB; 4 bits ≈ 68 MB. Son estimaciones aritmeticas de peso, no cifras publicadas por el autor.
- **VRAM total en inferencia**: con contexto de 1.024 tokens y lotes moderados, el consumo adicional por activaciones es pequeno; en bf16 el modelo completo cabe holgadamente por debajo de 1 GB de VRAM.
- **GPU recomendadas**: no requiere aceleradores de datacenter. Cualquier GPU consumer con 2 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, GTX 1650, etc.). El autor uso dos GH200 unicamente para el entrenamiento, no para inferencia.
- **CPU**: viable para inferencia puntual o por lotes pequenos, dado el tamano del modelo y el contexto corto.
- **Opciones de despliegue**: la via natural es `transformers` con `AutoModelForMaskedLM` y PyTorch (formato safetensors disponible). No se publican pesos GGUF, por lo que llama.cpp y Ollama no pueden usarse sin una conversion previa no oficial. No hay confirmacion en la informacion disponible de soporte especifico en vLLM ni en Text Generation Inference para este checkpoint.
- **Latencia y throughput**: no disponible. Al ser un encoder de 136M con contexto de 1.024 tokens, el coste por inferencia es muy inferior al de un modelo generativo de tamano comparable, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KainoBERT (este modelo) | 136.120.832 | 1.024 | grc | other | safetensors en HuggingFace |
| KainoBERT-sphragis (padre) | no disponible (misma arquitectura declarada) | no disponible | grc | other | safetensors en HuggingFace; corpus sin material de benchmark |
| KainoBERTa-sphragis | no disponible en la informacion disponible | no disponible | no disponible | no disponible | mencionado en resultados de busqueda como repositorio de HuggingFace |
| answerdotai/ModernBERT-base (referencia de arquitectura, no de dominio) | 149M | 8.192 | ingles | Apache-2.0 | safetensors en HuggingFace |

La informacion disponible no permite comparar rendimiento numerico con alternativas de griego antiguo: no hay benchmarks publicados para este modelo ni datos de modelos comparables en el material consultado.

## Limitaciones y advertencias

- **Contaminacion de benchmarks**: este checkpoint ha leido el corpus `Ericu950/AncientGreek` completo, incluida cada obra de los benchmarks de autoria Sphragis y Sphragis-Metre. Evaluar con el esos conjuntos produce resultados invalidos. Para experimentos controlados hay que usar `Urdatorn/KainoBERT-sphragis`, cuyo corpus excluye cualquier obra, pasaje o linea de benchmark.
- **Modelo no auditado**: la propia carta de modelo lo describe como la version "un-audited, for use in the wild". No ha pasado por revision externa.
- **Sin benchmarks publicados**: no existen cifras de MMLU, GLUE ni de tareas filologicas estandar que permitan situarlo frente a alternativas.
- **Contexto corto**: 1.024 tokens limita el analisis a pasajes breves; no es adecuado para documentos largos sin troceado previo y agregacion posterior.
- **Monolingue y monodominio**: solo griego antiguo. No hay cobertura de latin, griego moderno, copto ni de ninguna lengua moderna.
- **Dependencia del formato de entrada**: el modelo espera texto en minusculas, sin puntuacion y con marcas politonicas (regla 80/20 politonico frente a letras simples). Otros formatos pueden degradar las predicciones.
- **Riesgo de alucinacion filologica**: en fill-mask el modelo propone tokens plausibles segun la distribucion del corpus, no formas atestiguadas; una prediccion con alta probabilidad puede ser historicamente falsa. Toda sugerencia requiere verificacion en el aparato critico.
- **Licencia ambigua para uso comercial**: la licencia declarada es "other" y el corpus es una compilacion de licencias mixtas. Hay que consultar el campo `license` de cada registro fuente y las cartas de los datasets de origen antes de cualquier reutilizacion o explotacion comercial.
- **Sesgos esperables no documentados**: dado que el corpus procede de ediciones digitales, cabe esperar sobrerrepresentacion de los autores y generos mejor conservados y editados. La informacion disponible no cuantifica este sesgo.
- **Sin validacion de la comunidad**: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica.
- **Metadatos anomalos**: las fechas de creacion y actualizacion del repositorio en HuggingFace figuran como 2026-09-25, lo que conviene verificar antes de citar el modelo en un trabajo.
- **No es un asistente**: al ser un encoder fill-mask, no genera texto libre, no sigue instrucciones, no soporta tool calling y no puede integrarse en flujos de agente sin envoltorio adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/KainoBERT
- Modelo padre (sin contaminacion de benchmarks): https://huggingface.co/Urdatorn/KainoBERT-sphragis
- Repositorio relacionado KainoBERTa-sphragis: https://huggingface.co/Urdatorn/KainoBERTa-sphragis
- Dataset completo: https://huggingface.co/datasets/Ericu950/AncientGreek
- Dataset sin material de benchmark: https://huggingface.co/datasets/Urdatorn/AncientGreek-no-sphragis
- Pipeline de entrenamiento (GitHub): https://github.com/Urdatorn/sphragis_models
- Perfil de HuggingFace del autor: https://huggingface.co/Urdatorn/models
- Perfil de GitHub del autor: https://github.com/Urdatorn
- ORCID del autor: https://orcid.org/0009-0003-3731-4038
- Modelo de referencia de la arquitectura: https://huggingface.co/answerdotai/ModernBERT-base
- Articulo de ModernBERT (referencia de arquitectura): https://arxiv.org/abs/2412.13663
