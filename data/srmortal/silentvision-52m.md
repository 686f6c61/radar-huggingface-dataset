# srmortal/SilentVision-52M

## Resumen

SilentVision-52M es un modelo de lenguaje conversacional bilingüe (árabe-inglés) desarrollado por el autor independiente Youssef Mohamed Aly (usuario `srmortal` en HuggingFace), diseñado específicamente para funcionar en dispositivos de borde con recursos extremadamente limitados, como una Raspberry Pi Zero 2 W con 512 MiB de RAM física. El modelo parte de Qwen2.5-0.5B, del que se extrae una porción reducida de 8 capas con dimensión oculta de 512 y 8 cabezas de atención (2 KV heads), y se le comprime el vocabulario original de 151.000 tokens a 8.192 tokens bilingües, resultando en 52,08 millones de parámetros totales.

La propuesta técnica va más allá del recorte de parámetros: el sistema combina la base de 52M con tres adaptadores LoRA de rango 16 (matemáticas, física e historia), un motor simbólico AST determinista para aritmética con enrutamiento automático de herramientas y una recuperación factual en disco mediante SQLite que no consume RAM. El objetivo declarado es superar la "barrera de capacidad" del edge computing sin recurrir a swap.

Es relevante ahora porque demuestra que un modelo conversacional bilingüe puede ejecutarse en hardware de menos de 100 MB de huella de RAM activa con velocidades de 14 tokens por segundo, un nicho (edge AI, ARM, Raspberry Pi) donde la mayoría de alternativas exigen al menos el doble de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), base recortada de Qwen2.5-0.5B: 8 capas, 512 de dimensión oculta, 8 cabezas de atención, 2 KV heads |
| Parametros totales | 52.078.080 (52,6M segun benchmarks del autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en despliegue edge recomendado; curriculum de alineación limitado a 384 tokens |
| Tipos de cuantizacion | Q4_K_M (32,8 MB), Q8_0 (63,0 MB), FP16 (116,1 MB) |
| Idiomas soportados | Inglés (en) y árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch/Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado por recorte (slicing) de Qwen2.5-0.5B: conserva 8 de las capas del modelo original, reduce la dimensión oculta a 512 y mantiene 8 cabezas de atención con 2 KV heads (GQA). La modificación más agresiva es la compresión del vocabulario de 151.000 a 8.192 tokens bilingües, lo que obliga a remapear los IDs de token mediante `vocab_mapping.json` cuando se usa con Transformers; en GGUF el vocabulario ya va integrado. Sobre esta base se añaden tres adaptadores LoRA de rango 16 especializados en matemáticas, física e historia, que se cargan bajo demanda.

La alineación se realizó mediante un curriculum de cinco fases: coreferencia multi-turno con enmascaramiento de pérdida en turnos de usuario y seguimiento de entidades acotado a 384 tokens; seguridad epistémica y rechazo honesto ante consultas fuera de dominio o privadas; agencia de clarificación ante instrucciones ambiguas; seguimiento estricto de restricciones negativas y estructurales; y estabilidad de code-switching árabe-inglés sin colapso de idioma. El autor no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Como innovación destacable, el sistema incorpora un motor simbólico AST determinista para expresiones aritméticas (menos de 0,7 ms de latencia y 100% de exactitud en coincidencia) y recuperación factual en SQLite en disco con consumo de RAM nulo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y árabe.
- Razonamiento aritmético y algebraico, reforzado por el motor simbólico AST determinista y el adaptador `silentvision_math`.
- Conocimiento especializado en física y mecánica mediante el adaptador `silentvision_physics`.
- Conocimiento histórico bilingüe mediante el adaptador `silentvision_history`.
- Enrutamiento automático de herramientas (tool routing) para expresiones aritméticas.
- Recuperación factual de entidades del mundo, monedas y geografía desde una base SQLite en disco, sin consumo de RAM.
- Code-switching árabe-inglés estable dentro de una misma conversación.
- Refusal honesto ante consultas fuera de dominio o que comprometan la privacidad.
- Solicitud proactiva de aclaración ante instrucciones ambiguas.
- Seguimiento estricto de restricciones negativas y estructurales en las respuestas.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional en Raspberry Pi Zero 2 W: el modelo cabe en 94,7 MB de RAM activa en Q4_K_M, dejando más de 250 MB libres para el sistema operativo, lo que permite desplegarlo como servicio local persistente en hardware de 512 MiB.
- Tutor educativo bilingüe sin conexión: combinando la base con los adaptadores de matemáticas, física e historia, se puede ofrecer asistencia académica en árabe e inglés en escuelas o zonas sin conectividad.
- Cálculo aritmético de precisión en el borde: el enrutamiento al motor AST determinista garantiza exactitud del 100% en expresiones aritméticas con latencia inferior a 0,7 ms, adecuado para calculadoras conversacionales o asistentes financieros básicos.
- Consulta factual de entidades y geografía: la recuperación SQLite en disco permite responder preguntas sobre monedas, países y entidades sin cargar la base de conocimiento en memoria, útil en dispositivos empotrados con almacenamiento limitado.
- Atención al cliente de proximidad en kioscos ARM: con contexto de 512 tokens y velocidades de 14 tokens/s, puede gestionar diálogos breves multi-turno con aclaraciones y rechazos controlados en entornos de bajo consumo.
- Prototipado e investigación en edge AI: sirve como banco de pruebas reproducible para estudiar recorte de vocabulario, adaptadores LoRA y alineación multi-fase en modelos de menos de 100M de parámetros.
- Asistente de voz o domótica local: al ejecutarse con llama.cpp sobre CPU ARM sin GPU, puede integrarse en pipelines de automatización del hogar que requieran respuestas en inglés o árabe con latencia baja y sin depender de la nube.

## Benchmarks y rendimiento

Rendimiento en Raspberry Pi Zero 2 W (mediciones físicas del autor, Debian 12 de 64 bits, 415 MiB de RAM utilizable):

| Modelo / Cuantización | Parámetros | Tamaño GGUF | RAM activa | RAM libre | Velocidad | Swap |
|---|---|---|---|---|---|---|
| SilentVision-52M Q4_K_M | 52,6M | 32,8 MB | 94,7 MB | 252,9 MB | 14,28 tok/s | 0 páginas/s |
| SilentVision-52M Q8_0 | 52,6M | 63,0 MB | 128,2 MB | 219,4 MB | 10,15 tok/s | 0 páginas/s |
| SilentVision-52M FP16 | 52,6M | 116,1 MB | 198,4 MB | 149,2 MB | 6,42 tok/s | Mínimo (<2 MB) |
| MobileLLM-143M (referencia) | 143,0M | ~85 MB | ~230 MB | <80 MB | 7,20 tok/s | Severo (swap thrashing) |

Precisión por dominio (suites estratificadas de 500 elementos retenidos, según el autor):

| Dominio | Configuración | Precisión | Tasa de aprobación estricta | Latencia |
|---|---|---|---|---|
| Conversacional general | Base v1.0 | 95,9% | 92,3% | ~14,28 tok/s |
| Matemáticas y álgebra | Base + LoRA math | 95,0% | 95,0% | ~13,80 tok/s |
| Física y mecánica | Base + LoRA physics | 89,6% | 89,6% | ~13,85 tok/s |
| Historia bilingüe | Base + LoRA history | 86,2% | 86,2% | ~13,90 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 94,7 MB en Q4_K_M, 128,2 MB en Q8_0 y 198,4 MB en FP16, según mediciones del autor.
- GPU recomendadas: no requiere GPU; está diseñado para CPU ARM. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) lo ejecuta sobradamente, pero no aporta ventajas prácticas frente a CPU.
- Cabe en cualquier GPU consumer e integrada; también en Raspberry Pi Zero 2 W (512 MiB), Raspberry Pi 4/5 y dispositivos ARM similares.
- Opciones de despliegue: llama.cpp (`llama-cli` con soporte de `--lora`), GGUF compatible con Ollama y otros runners de llama.cpp; Transformers con PyTorch (requiere remapeo de vocabulario).
- Latencia y throughput: 14,28 tok/s en Q4_K_M, 10,15 tok/s en Q8_0 y 6,42 tok/s en FP16 sobre Raspberry Pi Zero 2 W; el motor AST responde en menos de 0,7 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| SilentVision-52M | 52,6M | 512 tokens | en, ar | Apache 2.0 | Edge extremo (Raspberry Pi Zero 2 W) |
| MobileLLM-143M | 143M | no disponible | en (principalmente) | no disponible | Edge móvil; referencia del autor con swap severo en Pi Zero 2 W |
| Qwen2.5-0.5B (base) | 494M | 32.768 tokens | multilingüe | Apache 2.0 | Modelo pequeño generalista; no cabe con holgura en 512 MiB |
| SmolLM-135M | 135M | 2.048 tokens | en (principalmente) | Apache 2.0 | Modelo pequeño para dispositivos con más recursos |

SilentVision-52M se distingue por su huella de memoria inferior a 100 MB y su soporte bilingüe árabe-inglés, a costa de un contexto mucho más corto y un vocabulario reducido que limita su cobertura léxica frente a Qwen2.5-0.5B o SmolLM-135M.

## Limitaciones y advertencias

- Contexto efectivo muy limitado (512 tokens en despliegue, 384 en alineación), insuficiente para documentos largos o conversaciones extensas.
- Vocabulario comprimido a 8.192 tokens: en Transformers exige remapeo manual de IDs mediante `vocab_mapping.json`; un mapeo incorrecto produce salidas corruptas.
- Solo soporta inglés y árabe; no hay capacidades multilingües fuera de ese par.
- Riesgo de alucinación en conocimiento factual fuera de la base SQLite y de los dominios cubiertos por los LoRA.
- El recorte desde Qwen2.5-0.5B implica pérdida de conocimiento general y de capacidades de razonamiento respecto al modelo original.
- Los benchmarks de precisión (95,9%, 95,0%, etc.) provienen del propio autor con suites de 500 elementos; no hay validación independiente ni resultados en benchmarks estándar.
- Las cifras de rendimiento están medidas en una única plataforma (Raspberry Pi Zero 2 W con Debian 12); el throughput en otros dispositivos puede variar.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta el proceso completo de entrenamiento ni la composición del dataset, lo que dificulta auditar sesgos.
- No dispone de visión, audio, tool calling genérico ni modo de razonamiento extendido; el enrutamiento de herramientas se limita a expresiones aritméticas.
- El modelo tiene 0 likes y procede de un autor independiente; la madurez y el mantenimiento del proyecto no están garantizados.

## Enlaces

- HuggingFace: https://huggingface.co/srmortal/SilentVision-52M
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio llama.cpp (despliegue GGUF): https://github.com/ggerganov/llama.cpp
