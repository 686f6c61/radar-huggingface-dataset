# srmortal/SilentVision-52M

## Resumen

SilentVision-52M es un modelo de lenguaje conversacional bilingüe (árabe-inglés) de 52,6 millones de parámetros, desarrollado por el autor independiente Youssef Mohamed Aly (usuario `srmortal` en Hugging Face). Está diseñado específicamente para entornos de borde extremos, con el objetivo declarado de ejecutarse en una Raspberry Pi Zero 2 W con 512 MiB de RAM física y un procesador ARM Cortex-A53 de cuatro núcleos a 1,0 GHz.

El modelo se construye recortando la arquitectura Qwen2.5-0.5B: conserva 8 capas, dimensión oculta de 512, 8 cabezas de atención y 2 cabezas KV, y comprime el vocabulario original de 151.000 tokens a 8.192 tokens bilingües. Sobre esa base se añaden tres adaptadores LoRA de rango 16 para dominios concretos (matemáticas, física e historia), un motor simbólico AST determinista para aritmética y un mecanismo de recuperación factual en SQLite en disco que no consume RAM.

Su relevancia actual radica en que aborda el llamado "muro de capacidad" del borde: demuestra que un modelo conversacional bilingüe puede operar con menos de 100 MB de RAM activa en hardware de 512 MiB, manteniendo velocidades de generación de 14,28 tokens/s con cuantización Q4_K_M. Se distribuye con licencia Apache 2.0 y en múltiples formatos (safetensors, GGUF, ONNX), lo que facilita su despliegue en pipelines de CPU y dispositivos ARM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 8 capas, 512 de dimensión oculta, 8 cabezas de atención, 2 cabezas KV |
| Parámetros totales | 52.078.080 (52,6 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (configuración de despliegue recomendada en `llama-cli`); ventana de entrenamiento multi-turno limitada a 384 tokens |
| Tipos de cuantización | Q4_K_M, Q8_0, FP16 (además de pesos safetensors y ONNX) |
| Idiomas soportados | Inglés (en) y árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen2.5-0.5B mediante recorte estructural: se reducen las capas a 8 y la dimensión oculta a 512, y se comprime el vocabulario de 151.000 a 8.192 tokens bilingües. Esta compresión exige un remapeo de tokens mediante `vocab_mapping.json` (mapas `old_to_new` y `new_to_old`) cuando se usa con Transformers, ya que los ID de token del tokenizador original no coinciden con los del modelo recortado.

El sistema completo es modular y desacoplado en cuatro piezas: la base de 52 M parámetros, una tríada de adaptadores LoRA de rango 16 para matemáticas, física e historia, un motor simbólico AST determinista para expresiones aritméticas (latencia inferior a 0,7 ms y precisión exacta del 100 %) y una recuperación factual en SQLite en disco para entidades, divisas y geografía. La alineación se realizó en cinco fases: correferencia multi-turno con enmascaramiento de pérdida en turnos de usuario, seguridad epistémica y rechazo honesto ante consultas no fundamentadas, agencia de clarificación ante instrucciones ambiguas, seguimiento estricto de restricciones negativas y estructurales, y estabilidad de cambio de código árabe-inglés sin colapso de idioma.

## Capacidades

- Generación de texto conversacional bilingüe en inglés y árabe, con cambio de código fluido entre ambos idiomas.
- Razonamiento aritmético exacto mediante enrutamiento automático a un motor simbólico AST determinista (precisión de coincidencia exacta del 100 %).
- Especialización por dominio mediante adaptadores LoRA intercambiables: matemáticas y álgebra, física y mecánica, e historia bilingüe.
- Recuperación factual de entidades del mundo, divisas y geografía mediante una base SQLite en disco con consumo de RAM nulo.
- Seguimiento de restricciones negativas y estructurales en las respuestas.
- Solicitud proactiva de aclaración cuando la instrucción del usuario es ambigua.
- Rechazo honesto ante consultas fuera de dominio o que solicitan información privada no fundamentada.
- Seguimiento de entidades y correferencia a lo largo de conversaciones multi-turno (hasta 384 tokens).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) para despliegue como servicio de generación de texto.

## Casos de uso

- Asistente conversacional en Raspberry Pi Zero 2 W: el modelo cabe en 94,7 MB de RAM activa con Q4_K_M, dejando más de 250 MiB libres para el sistema operativo y otras aplicaciones, lo que permite desplegar un chatbot bilingüe en hardware de 512 MiB sin swap.
- Tutor de matemáticas y álgebra en dispositivos de borde: con el adaptador `silentvision_math`, resuelve ecuaciones paso a paso y delega la aritmética al motor AST para garantizar resultados exactos, con una tasa de aprobación estricta del 95,0 % en la suite de evaluación del autor.
- Apoyo educativo en física e historia: los adaptadores `silentvision_physics` e `silentvision_history` ofrecen respuestas especializadas con precisiones del 89,6 % y 86,2 % respectivamente, adecuadas para entornos sin conectividad.
- Consulta factual sin consumo de RAM: la recuperación en SQLite en disco permite responder sobre divisas, geografía y entidades del mundo en dispositivos con memoria muy limitada, sin cargar una base de conocimiento en memoria.
- Atención al cliente bilingüe en kioscos o terminales ARM: el modelo gestiona conversaciones multi-turno con seguimiento de entidades y cambio de código árabe-inglés, útil en comercios con clientela mixta.
- Procesamiento de lenguaje natural en el borde para domótica o asistentes de voz: la velocidad de 14,28 tokens/s en Q4_K_M permite respuestas en tiempo casi real en un Cortex-A53, integrándose en pipelines locales sin depender de la nube.
- Filtrado y clasificación de consultas con rechazo seguro: la fase de seguridad epistémica permite usar el modelo como primera línea de triaje que rechaza consultas fuera de dominio o sensibles antes de escalar a un sistema mayor.

## Benchmarks y rendimiento

Rendimiento en hardware físico (Raspberry Pi Zero 2 W, Debian 12 de 64 bits, 415 MiB de RAM física utilizable), según datos del autor:

| Modelo / cuantización | Parámetros | Tamaño GGUF | RAM activa | RAM libre | Velocidad | Paginación |
|---|---|---|---|---|---|---|
| SilentVision-52M Q4_K_M | 52,6 M | 32,8 MB | 94,7 MB | 252,9 MB | 14,28 tokens/s | 0 páginas/s |
| SilentVision-52M Q8_0 | 52,6 M | 63,0 MB | 128,2 MB | 219,4 MB | 10,15 tokens/s | 0 páginas/s |
| SilentVision-52M FP16 | 52,6 M | 116,1 MB | 198,4 MB | 149,2 MB | 6,42 tokens/s | Mínima (<2 MB) |
| MobileLLM-143M (referencia) | 143,0 M | ~85 MB | ~230 MB | <80 MB | 7,20 tokens/s | Grave (swap) |

Precisión por dominio (suites estratificadas de 500 elementos reservados, según el autor):

| Dominio | Configuración | Precisión | Tasa de aprobación estricta | Latencia |
|---|---|---|---|---|
| Conversacional general | Base general (v1.0) | 95,9 % | 92,3 % | ~14,28 tps |
| Matemáticas y álgebra | Base + LoRA `math` | 95,0 % | 95,0 % | ~13,80 tps |
| Física y mecánica | Base + LoRA `physics` | 89,6 % | 89,6 % | ~13,85 tps |
| Historia bilingüe | Base + LoRA `history` | 86,2 % | 86,2 % | ~13,90 tps |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 94,7 MB de RAM activa con Q4_K_M, 128,2 MB con Q8_0 y 198,4 MB con FP16.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU ARM y x86. Cualquier GPU con más de 1 GB de VRAM puede ejecutarlo, pero no es su objetivo de diseño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 4090, RTX 3060, etc.), aunque el modelo está pensado para CPU.
- Cabe en hardware de borde: sí, verificado en Raspberry Pi Zero 2 W (512 MiB de RAM, Cortex-A53 a 1,0 GHz); también es apto para otras placas ARM con más recursos.
- Opciones de despliegue: `llama.cpp` (con `llama-cli`, soporte de LoRA en GGUF), Transformers con PyTorch (requiere remapeo de vocabulario), ONNX Runtime y endpoints compatibles.
- Latencia y throughput: 14,28 tokens/s en Q4_K_M, 10,15 tokens/s en Q8_0 y 6,42 tokens/s en FP16 sobre Raspberry Pi Zero 2 W; el motor AST aritmético responde en menos de 0,7 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| SilentVision-52M | 52,6 M | 512 tokens | en, ar | Apache 2.0 | Borde extremo (512 MiB), bilingüe, modular con LoRA y SQLite |
| Qwen2.5-0.5B (base) | 494 M | 32.768 tokens | multilingüe | Apache 2.0 | Modelo generalista de pequeño tamaño |
| MobileLLM-143M | 143 M | no disponible | en (principalmente) | no disponible en la información | Modelo compacto para dispositivos móviles |

SilentVision-52M sacrifica tamaño y contexto frente a Qwen2.5-0.5B (52,6 M frente a 494 M de parámetros; 512 frente a 32.768 tokens de contexto) a cambio de un consumo de RAM unas cinco veces menor y viabilidad en hardware de 512 MiB. Frente a MobileLLM-143M, el autor reporta el doble de velocidad de generación y un 60 % menos de huella de memoria, además de soporte bilingüe árabe-inglés que el modelo de referencia no declara.

## Limitaciones y advertencias

- Contexto muy limitado: 512 tokens en despliegue y 384 tokens en el entrenamiento multi-turno, insuficiente para documentos largos o conversaciones extensas.
- Vocabulario comprimido a 8.192 tokens: requiere remapeo explícito con `vocab_mapping.json` en Transformers, lo que añade complejidad de integración y riesgo de errores si no se aplica correctamente.
- Solo dos idiomas (inglés y árabe); no hay soporte declarado para castellano ni otras lenguas.
- Riesgo de alucinación inherente a un modelo de 52 M parámetros; el autor mitiga parcialmente con rechazo ante consultas no fundamentadas y recuperación factual en SQLite, pero la cobertura de conocimiento es acotada.
- Las cifras de precisión (95,9 %, 95,0 %, 89,6 %, 86,2 %) proceden de suites propias del autor (500 elementos estratificados) y no de benchmarks estándar independientes; deben interpretarse con cautela.
- La especialización por dominio depende de cargar el adaptador LoRA correspondiente; sin él, el rendimiento en matemáticas, física o historia puede degradarse.
- El motor AST y la recuperación SQLite son componentes externos al modelo; su integración en producción requiere código adicional no incluido en los pesos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones heredadas del modelo base Qwen2.5-0.5B.
- No se han publicado evaluaciones de sesgo, toxicidad o robustez adversarial en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srmortal/SilentVision-52M
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio de `llama.cpp` (despliegue GGUF): https://github.com/ggerganov/llama.cpp
- Documentación de Transformers: https://huggingface.co/docs/transformers
